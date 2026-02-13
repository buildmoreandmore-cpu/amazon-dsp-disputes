import http from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import type { DCMDeliveryData, ScraperEvent, ScraperStatus } from '../../types/dcm'
import {
  AMAZON_LOGISTICS_URL,
  DCM_SELECTORS,
  MAX_CONSECUTIVE_FAILURES,
  getDelayWithJitter,
} from './dcm-selectors'
import { extractDCMData, navigateToTBA, isLoginPage } from './dcm-extractor'

const PORT = 3847

let browser: Browser | null = null
let context: BrowserContext | null = null
let page: Page | null = null
let authenticated = false
let scraping = false
let stopRequested = false

let progress: ScraperStatus['progress'] = null

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function jsonResponse(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { ...corsHeaders(), 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

function sendSSE(res: ServerResponse, event: ScraperEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}

// --- Endpoint handlers ---

async function handleStatus(_req: IncomingMessage, res: ServerResponse) {
  const status: ScraperStatus = {
    running: browser !== null,
    authenticated,
    scraping,
    progress,
  }
  jsonResponse(res, 200, status)
}

async function handleStartAuth(_req: IncomingMessage, res: ServerResponse) {
  try {
    if (!browser) {
      browser = await chromium.launch({ headless: false })
      context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      })
      page = await context.newPage()
    }

    if (!page) {
      page = await context!.newPage()
    }

    await page.goto(AMAZON_LOGISTICS_URL, { waitUntil: 'domcontentloaded' })
    authenticated = false

    jsonResponse(res, 200, {
      success: true,
      message: 'Browser opened. Please log in to Amazon Logistics.',
    })
  } catch (err) {
    jsonResponse(res, 500, {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to launch browser',
    })
  }
}

async function handleCheckAuth(_req: IncomingMessage, res: ServerResponse) {
  if (!page) {
    jsonResponse(res, 400, { authenticated: false, error: 'Browser not started' })
    return
  }

  try {
    const url = page.url()
    const onLogin = await isLoginPage(page, DCM_SELECTORS)

    // If we're past the login page and on the logistics domain, we're authenticated
    if (!onLogin && url.includes('logistics.amazon')) {
      authenticated = true
    }

    jsonResponse(res, 200, { authenticated, currentUrl: url })
  } catch (err) {
    jsonResponse(res, 500, {
      authenticated: false,
      error: err instanceof Error ? err.message : 'Auth check failed',
    })
  }
}

async function handleScrape(req: IncomingMessage, res: ServerResponse) {
  if (!page || !authenticated) {
    jsonResponse(res, 400, { error: 'Not authenticated. Call /start-auth first.' })
    return
  }

  if (scraping) {
    jsonResponse(res, 409, { error: 'Scrape already in progress. Call /stop first.' })
    return
  }

  const body = await readBody(req)
  let trackingIds: string[]

  try {
    const parsed = JSON.parse(body)
    trackingIds = parsed.trackingIds
    if (!Array.isArray(trackingIds) || trackingIds.length === 0) {
      jsonResponse(res, 400, { error: 'trackingIds must be a non-empty array' })
      return
    }
  } catch {
    jsonResponse(res, 400, { error: 'Invalid JSON body' })
    return
  }

  // Switch to SSE
  res.writeHead(200, {
    ...corsHeaders(),
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  scraping = true
  stopRequested = false
  let succeeded = 0
  let failed = 0
  let consecutiveFailures = 0

  progress = {
    total: trackingIds.length,
    completed: 0,
    succeeded: 0,
    failed: 0,
    currentTBA: null,
  }

  for (const tba of trackingIds) {
    if (stopRequested) {
      sendSSE(res, { type: 'warning', message: 'Scrape stopped by user' })
      break
    }

    progress.currentTBA = tba
    sendSSE(res, {
      type: 'progress',
      completed: progress.completed,
      total: progress.total,
      currentTBA: tba,
    })

    try {
      // Check for session expiry
      if (await isLoginPage(page!, DCM_SELECTORS)) {
        authenticated = false
        sendSSE(res, { type: 'auth_required', message: 'Session expired. Please re-authenticate.' })

        // Wait for re-auth (poll every 3s for up to 5 minutes)
        let reauthed = false
        for (let i = 0; i < 100; i++) {
          await new Promise(r => setTimeout(r, 3000))
          if (stopRequested) break
          if (!(await isLoginPage(page!, DCM_SELECTORS))) {
            authenticated = true
            reauthed = true
            break
          }
        }

        if (!reauthed) {
          sendSSE(res, { type: 'error', message: 'Re-authentication timeout. Aborting.' })
          break
        }
      }

      // Navigate to TBA
      const found = await navigateToTBA(page!, tba, DCM_SELECTORS)

      if (found) {
        const data = await extractDCMData(page!, tba, DCM_SELECTORS)
        succeeded++
        consecutiveFailures = 0
        sendSSE(res, { type: 'tba_success', trackingId: tba, data })

        // Try to close any popup before next search
        for (const closeSelector of DCM_SELECTORS.closePopup) {
          try {
            const closeBtn = page!.locator(closeSelector).first()
            const visible = await closeBtn.isVisible({ timeout: 500 }).catch(() => false)
            if (visible) {
              await closeBtn.click()
              break
            }
          } catch { /* no popup to close */ }
        }
      } else {
        failed++
        consecutiveFailures++
        sendSSE(res, { type: 'tba_failed', trackingId: tba, error: 'TBA not found in DCM' })
      }
    } catch (err) {
      failed++
      consecutiveFailures++
      sendSSE(res, {
        type: 'tba_failed',
        trackingId: tba,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }

    progress.completed++
    progress.succeeded = succeeded
    progress.failed = failed

    // Abort after too many consecutive failures
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      sendSSE(res, {
        type: 'error',
        message: `Aborting: ${MAX_CONSECUTIVE_FAILURES} consecutive failures. Check selectors or authentication.`,
      })
      break
    }

    // Rate limit delay between requests
    if (progress.completed < progress.total) {
      await new Promise(r => setTimeout(r, getDelayWithJitter()))
    }
  }

  sendSSE(res, {
    type: 'complete',
    succeeded,
    failed,
    total: trackingIds.length,
  })

  scraping = false
  progress = null
  res.end()
}

async function handleStop(_req: IncomingMessage, res: ServerResponse) {
  stopRequested = true
  jsonResponse(res, 200, { success: true, message: 'Stop requested' })
}

async function handleClose(_req: IncomingMessage, res: ServerResponse) {
  stopRequested = true

  try {
    if (browser) {
      await browser.close()
    }
  } catch { /* best effort */ }

  browser = null
  context = null
  page = null
  authenticated = false
  scraping = false
  progress = null

  jsonResponse(res, 200, { success: true, message: 'Browser closed' })
}

// --- HTTP Server ---

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders())
    res.end()
    return
  }

  const url = req.url ?? ''
  const method = req.method ?? 'GET'

  try {
    if (method === 'GET' && url === '/status') {
      await handleStatus(req, res)
    } else if (method === 'POST' && url === '/start-auth') {
      await handleStartAuth(req, res)
    } else if (method === 'POST' && url === '/check-auth') {
      await handleCheckAuth(req, res)
    } else if (method === 'POST' && url === '/scrape') {
      await handleScrape(req, res)
    } else if (method === 'POST' && url === '/stop') {
      await handleStop(req, res)
    } else if (method === 'POST' && url === '/close') {
      await handleClose(req, res)
    } else {
      jsonResponse(res, 404, { error: 'Not found' })
    }
  } catch (err) {
    console.error('Server error:', err)
    jsonResponse(res, 500, { error: 'Internal server error' })
  }
})

export function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`DCM Scraper server running on http://localhost:${PORT}`)
      console.log('Endpoints:')
      console.log('  GET  /status      — Server & auth status')
      console.log('  POST /start-auth  — Open browser for Amazon login')
      console.log('  POST /check-auth  — Check if authenticated')
      console.log('  POST /scrape      — Start scraping (SSE stream)')
      console.log('  POST /stop        — Stop current scrape')
      console.log('  POST /close       — Close browser & server')
      resolve()
    })

    server.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Is another scraper instance running?`)
      }
      reject(err)
    })
  })
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down scraper server...')
  stopRequested = true
  try {
    if (browser) await browser.close()
  } catch { /* best effort */ }
  server.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  stopRequested = true
  try {
    if (browser) await browser.close()
  } catch { /* best effort */ }
  server.close()
  process.exit(0)
})
