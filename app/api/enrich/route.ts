import { NextRequest, NextResponse } from 'next/server'
import { getCachedDCMData, cacheDCMData } from '@/lib/scraper/dcm-cache'
import type { DCMDeliveryData } from '@/types/dcm'

/**
 * Enrichment coordinator API.
 * - Checks cache for already-scraped TBAs
 * - Returns cached data + list of TBAs still needing scraping
 *
 * POST body: { trackingIds: string[] }
 * Response: { cached: Record<string, DCMDeliveryData>, uncached: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingIds } = body as { trackingIds: string[] }

    if (!Array.isArray(trackingIds) || trackingIds.length === 0) {
      return NextResponse.json(
        { error: 'trackingIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // Check cache for existing data
    const cachedMap = await getCachedDCMData(trackingIds)

    // Build response
    const cached: Record<string, DCMDeliveryData> = {}
    const uncached: string[] = []

    for (const tba of trackingIds) {
      const data = cachedMap.get(tba)
      if (data) {
        cached[tba] = data
      } else {
        uncached.push(tba)
      }
    }

    return NextResponse.json({
      cached,
      uncached,
      cachedCount: Object.keys(cached).length,
      uncachedCount: uncached.length,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to check cache' },
      { status: 500 }
    )
  }
}

/**
 * Cache new DCM data after scraping.
 * PUT body: { data: DCMDeliveryData[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = body as { data: DCMDeliveryData[] }

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'data must be an array of DCMDeliveryData' },
        { status: 400 }
      )
    }

    for (const entry of data) {
      await cacheDCMData(entry)
    }

    return NextResponse.json({ success: true, cached: data.length })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to cache data' },
      { status: 500 }
    )
  }
}
