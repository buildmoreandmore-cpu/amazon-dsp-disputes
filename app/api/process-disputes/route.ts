import { NextRequest, NextResponse } from 'next/server'
import { parseCSV, extractStationAndWeek, validateCSV } from '@/lib/csv-parser'
import { processDisputes, sortDisputes, buildSummary } from '@/lib/dispute-engine'
import { generateXLSX, generateOutputFilename } from '@/lib/xlsx-generator'
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

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      )
    }

    // Read file content
    const csvContent = await file.text()

    // Parse CSV
    let rows
    try {
      rows = parseCSV(csvContent)
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse CSV file. Please check the format.' },
        { status: 400 }
      )
    }

    // Validate CSV structure
    const validation = validateCSV(rows)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join('; ') },
        { status: 400 }
      )
    }

    // Extract station and week from filename
    const { station, week } = extractStationAndWeek(file.name)

    // Process disputes
    const disputes = processDisputes(rows)
    const sortedDisputes = sortDisputes(disputes)

    // Build summary
    const summary = buildSummary(rows, sortedDisputes, station, week)

    // Generate XLSX
    const outputFilename = generateOutputFilename(station, week)
    const xlsxBase64 = generateXLSX(sortedDisputes, outputFilename)

    // Generate Markdown summary
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
    console.error('Error processing disputes:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing the file.' },
      { status: 500 }
    )
  }
}
