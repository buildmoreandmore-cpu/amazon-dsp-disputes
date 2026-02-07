import { NextRequest, NextResponse } from 'next/server'
import { getEvidenceSuggestions } from '@/lib/evidence/evidence-service'
import type { EvidenceSuggestionsResponse, SuggestionRequest, DisputeType } from '@/types/evidence'

const VALID_DISPUTE_TYPES: DisputeType[] = ['concession', 'feedback', 'rts']

export async function POST(request: NextRequest): Promise<NextResponse<EvidenceSuggestionsResponse>> {
  try {
    const body = await request.json()

    // Validate request
    if (!body.disputeType || !VALID_DISPUTE_TYPES.includes(body.disputeType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or missing disputeType. Must be one of: concession, feedback, rts',
        },
        { status: 400 }
      )
    }

    const suggestionRequest: SuggestionRequest = {
      disputeType: body.disputeType,
      withinGeoFence: body.withinGeoFence,
      hasPOD: body.hasPOD,
      deliveryType: body.deliveryType,
      impactsDSB: body.impactsDSB,
      feedbackType: body.feedbackType,
      rtsCode: body.rtsCode,
      confidence: body.confidence,
    }

    const suggestions = await getEvidenceSuggestions(suggestionRequest)

    return NextResponse.json({
      success: true,
      suggestions,
    })
  } catch (error) {
    console.error('Error getting evidence suggestions:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
}
