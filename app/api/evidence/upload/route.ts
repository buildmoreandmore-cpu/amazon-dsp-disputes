import { NextRequest, NextResponse } from 'next/server'
import { parseXLSXForEvidence } from '@/lib/evidence/xlsx-evidence-parser'
import { saveEvidence } from '@/lib/evidence/evidence-service'
import type { EvidenceUploadResponse } from '@/types/evidence'

export async function POST(request: NextRequest): Promise<NextResponse<EvidenceUploadResponse>> {
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
    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json(
        { success: false, error: 'File must be an XLSX file' },
        { status: 400 }
      )
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse XLSX for evidence
    const parseResult = parseXLSXForEvidence(buffer, file.name)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.errors.join('; ') || 'Failed to parse XLSX file',
        },
        { status: 400 }
      )
    }

    if (parseResult.evidenceEntries.length === 0) {
      return NextResponse.json({
        success: true,
        result: {
          success: true,
          totalRows: parseResult.totalRows,
          rowsWithEvidence: 0,
          newPatterns: 0,
          updatedPatterns: 0,
          errors: ['No rows with "Additional Evidence" filled in were found'],
        },
      })
    }

    // Save evidence to database
    const saveResult = await saveEvidence(parseResult.evidenceEntries)

    return NextResponse.json({
      success: true,
      result: {
        ...saveResult,
        totalRows: parseResult.totalRows,
      },
    })
  } catch (error) {
    console.error('Error processing evidence upload:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
}
