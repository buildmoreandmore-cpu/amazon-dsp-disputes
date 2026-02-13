import { NextResponse } from 'next/server'

const SCRAPER_URL = 'http://localhost:3847'

/**
 * Proxy to the local scraper server's status endpoint.
 * Returns scraper status if running, or an error if not reachable.
 */
export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`${SCRAPER_URL}/status`, {
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const status = await response.json()
    return NextResponse.json({ available: true, ...status })
  } catch {
    return NextResponse.json({
      available: false,
      running: false,
      authenticated: false,
      scraping: false,
      progress: null,
    })
  }
}
