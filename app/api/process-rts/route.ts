import { NextRequest, NextResponse } from 'next/server'
import { parseRTSCSV, validateRTSCSV, filterDisputeableRTS } from '@/lib/parsers/rts-parser'
import { extractStationAndWeek } from '@/lib/csv-parser'
import { processRTSDisputes, sortRTSDisputes, buildRTSSummary } from '@/lib/engines/rts-engine'
import { generateRTSXLSX, generateOutputFilename } from '@/lib/xlsx-generator'
import { generateRTSMarkdownSummary } from '@/lib/summary-generator'
import type { RTSApiResponse } from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<RTSApiResponse>> {
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
      rows = parseRTSCSV(csvContent)
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse CSV file. Please check the format.' },
        { status: 400 }
      )
    }

    const validation = validateRTSCSV(rows)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join('; ') },
        { status: 400 }
      )
    }

    const { station, week } = extractStationAndWeek(file.name)

    // Filter to only disputable rows (Impact DCR = Y, No Exemption Applied)
    const disputeableRows = filterDisputeableRTS(rows)

    const disputes = processRTSDisputes(disputeableRows)
    const sortedDisputes = sortRTSDisputes(disputes)

    const summary = buildRTSSummary(rows, disputeableRows, sortedDisputes, station, week)

    const outputFilename = generateOutputFilename('rts', station, week)
    const xlsxBase64 = generateRTSXLSX(sortedDisputes)

    const markdownSummary = generateRTSMarkdownSummary(summary)

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
    console.error('Error processing RTS disputes:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing the file.' },
      { status: 500 }
    )
  }
}
