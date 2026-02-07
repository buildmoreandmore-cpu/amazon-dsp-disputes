import { NextResponse } from 'next/server'
import { getEvidenceStats } from '@/lib/evidence/evidence-service'
import type { EvidenceStatsResponse } from '@/types/evidence'

export async function GET(): Promise<NextResponse<EvidenceStatsResponse>> {
  try {
    const stats = await getEvidenceStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Error fetching evidence stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
}
