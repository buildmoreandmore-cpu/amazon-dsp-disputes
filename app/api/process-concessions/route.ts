import { NextRequest, NextResponse } from 'next/server'
import { parseConcessionCSV, validateConcessionCSV } from '@/lib/parsers/concession-parser'
import { extractStationAndWeek } from '@/lib/csv-parser'
import { processConcessionDisputes, sortConcessionDisputes, buildConcessionSummary } from '@/lib/engines/concession-engine'
import { generateConcessionXLSX, generateOutputFilename } from '@/lib/xlsx-generator'
import { generateMarkdownSummary } from '@/lib/summary-generator'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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
      rows = parseConcessionCSV(csvContent)
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse CSV file. Please check the format.' },
        { status: 400 }
      )
    }

    const validation = validateConcessionCSV(rows)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join('; ') },
        { status: 400 }
      )
    }

    const { station, week } = extractStationAndWeek(file.name)

    const disputes = processConcessionDisputes(rows)
    const sortedDisputes = sortConcessionDisputes(disputes)

    const summary = buildConcessionSummary(rows, sortedDisputes, station, week)

    const outputFilename = generateOutputFilename('concessions', station, week)
    const xlsxBase64 = generateConcessionXLSX(sortedDisputes)

    const markdownSummary = generateMarkdownSummary(summary)

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
    console.error('Error processing concession disputes:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing the file.' },
      { status: 500 }
    )
  }
}
