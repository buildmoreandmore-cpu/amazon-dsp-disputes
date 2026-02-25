import { NextResponse } from 'next/server'
import Browserbase from '@browserbasehq/sdk'
import { chromium } from 'playwright-core'

export const maxDuration = 60

export async function POST() {
  try {
    const apiKey = process.env.BROWSERBASE_API_KEY
    const projectId = process.env.BROWSERBASE_PROJECT_ID

    if (!apiKey || !projectId) {
      return NextResponse.json(
        { error: 'Browserbase is not configured. Contact your administrator.' },
        { status: 500 }
      )
    }

    const bb = new Browserbase({ apiKey })

    // Retry logic for rate limits
    let session: any
    let attempts = 0
    while (attempts < 3) {
      try {
        session = await bb.sessions.create({
          projectId,
          keepAlive: true,
        })
        break
      } catch (e: any) {
        if (e.status === 429 && attempts < 2) {
          attempts++
          // Wait before retrying (60s for rate limit window)
          await new Promise(r => setTimeout(r, 15000 * attempts))
          continue
        }
        throw e
      }
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      )
    }

    // Connect via Playwright and navigate to Amazon Logistics login
    const browser = await chromium.connectOverCDP(
      `wss://connect.browserbase.com?apiKey=${apiKey}&sessionId=${session.id}`
    )
    const context = browser.contexts()[0]
    const page = context.pages()[0] || await context.newPage()
    await page.goto('https://logistics.amazon.com', { waitUntil: 'domcontentloaded', timeout: 20000 })

    // Disconnect (keep session alive for user to log in)
    await browser.close()

    // Get the live debug URLs
    const debugInfo = await bb.sessions.debug(session.id)

    return NextResponse.json({
      sessionId: session.id,
      liveViewUrl: debugInfo.debuggerFullscreenUrl || debugInfo.debuggerUrl,
      connectUrl: session.connectUrl,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create browser session' },
      { status: 500 }
    )
  }
}
