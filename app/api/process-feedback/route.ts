import { NextRequest, NextResponse } from 'next/server'
import { parseFeedbackCSV, validateFeedbackCSV } from '@/lib/parsers/feedback-parser'
import { extractStationAndWeek } from '@/lib/csv-parser'
import { processFeedbackDisputes, sortFeedbackDisputes, buildFeedbackSummary } from '@/lib/engines/feedback-engine'
import { generateFeedbackXLSX, generateOutputFilename } from '@/lib/xlsx-generator'
import { generateFeedbackMarkdownSummary } from '@/lib/summary-generator'
import type { FeedbackApiResponse } from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<FeedbackApiResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      )
    }

    const csvContent = await file.text()

    let rows
    try {
      rows = parseFeedbackCSV(csvContent)
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse CSV file. Please check the format.' },
        { status: 400 }
      )
    }

    const validation = validateFeedbackCSV(rows)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join('; ') },
        { status: 400 }
      )
    }

    const { station, week } = extractStationAndWeek(file.name)

    const disputes = processFeedbackDisputes(rows)
    const sortedDisputes = sortFeedbackDisputes(disputes)

    const summary = buildFeedbackSummary(rows, sortedDisputes, station, week)

    const outputFilename = generateOutputFilename('feedback', station, week)
    const xlsxBase64 = generateFeedbackXLSX(sortedDisputes)

    const markdownSummary = generateFeedbackMarkdownSummary(summary)

    return NextResponse.json({
      success: true,
      data: {
        disputes: sortedDisputes,
        summary,
        xlsxBase64,
        markdownSummary,
        outputFilename
      }
    })
  } catch (error) {
    console.error('Error processing feedback disputes:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing the file.' },
      { status: 500 }
    )
  }
}
