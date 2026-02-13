import * as XLSX from 'xlsx'
import type { ExtractedEvidence, DisputeType } from '@/types/evidence'

// Column names for each dispute type
const CONCESSION_COLUMNS = {
  trackingId: 'Tracking ID',
  reason: 'Reason',
  priority: 'Priority',
  impactsDSB: 'Impacts DSB',
  driver: 'Driver',
  driverId: 'Driver ID',
  deliveryType: 'Delivery Type',
  withinGeoFence: 'Within Geo Fence',
  hasPOD: 'Has POD',
  notes: 'Notes',
  additionalEvidence: 'Additional Evidence',
}

const FEEDBACK_COLUMNS = {
  trackingId: 'Tracking ID',
  driver: 'Driver',
  feedbackType: 'Feedback Type',
  feedbackDetails: 'Feedback Details',
  address: 'Address',
  customerNotes: 'Customer Notes',
  disputeReason: 'Dispute Reason',
  priority: 'Priority',
  additionalEvidence: 'Additional Evidence',
}

const RTS_COLUMNS = {
  trackingId: 'Tracking ID',
  driver: 'Driver',
  rtsCode: 'RTS Code',
  confidence: 'Confidence',
  disputeReason: 'Dispute Reason',
  plannedDate: 'Planned Date',
  additionalEvidence: 'Additional Evidence',
}

// Detect the dispute type based on column headers
export function detectDisputeType(headers: string[]): DisputeType | null {
  const headerSet = new Set(headers.map(h => h?.toLowerCase().trim()))

  // Check for RTS-specific columns
  if (headerSet.has('rts code') && headerSet.has('confidence')) {
    return 'rts'
  }

  // Check for Feedback-specific columns
  if (headerSet.has('feedback type') && headerSet.has('feedback details')) {
    return 'feedback'
  }

  // Check for Concession-specific columns
  if (headerSet.has('within geo fence') && headerSet.has('has pod')) {
    return 'concession'
  }

  return null
}

// Parse Yes/No string to boolean
function parseYesNo(value: string | undefined): boolean | undefined {
  if (!value) return undefined
  const lower = value.toString().toLowerCase().trim()
  if (lower === 'yes') return true
  if (lower === 'no') return false
  return undefined
}

// Parse confidence value
function parseConfidence(value: string | undefined): string | undefined {
  if (!value) return undefined
  const lower = value.toString().toLowerCase().trim()
  if (lower.includes('high')) return 'high'
  if (lower.includes('low')) return 'low'
  return value
}

// Extract evidence from a concession row
function extractConcessionEvidence(row: Record<string, unknown>): ExtractedEvidence | null {
  const trackingId = row[CONCESSION_COLUMNS.trackingId]?.toString().trim()
  const evidenceText = row[CONCESSION_COLUMNS.additionalEvidence]?.toString().trim()

  if (!trackingId || !evidenceText) return null

  return {
    trackingId,
    disputeType: 'concession',
    evidenceText,
    disputeReason: row[CONCESSION_COLUMNS.reason]?.toString() || '',
    priority: parseInt(row[CONCESSION_COLUMNS.priority]?.toString() || '4'),
    withinGeoFence: parseYesNo(row[CONCESSION_COLUMNS.withinGeoFence]?.toString()),
    hasPOD: parseYesNo(row[CONCESSION_COLUMNS.hasPOD]?.toString()),
    deliveryType: row[CONCESSION_COLUMNS.deliveryType]?.toString(),
    impactsDSB: parseYesNo(row[CONCESSION_COLUMNS.impactsDSB]?.toString()),
  }
}

// Extract evidence from a feedback row
function extractFeedbackEvidence(row: Record<string, unknown>): ExtractedEvidence | null {
  const trackingId = row[FEEDBACK_COLUMNS.trackingId]?.toString().trim()
  const evidenceText = row[FEEDBACK_COLUMNS.additionalEvidence]?.toString().trim()

  if (!trackingId || !evidenceText) return null

  return {
    trackingId,
    disputeType: 'feedback',
    evidenceText,
    disputeReason: row[FEEDBACK_COLUMNS.disputeReason]?.toString() || '',
    priority: parseInt(row[FEEDBACK_COLUMNS.priority]?.toString() || '3'),
    feedbackType: row[FEEDBACK_COLUMNS.feedbackType]?.toString(),
  }
}

// Extract evidence from an RTS row
function extractRTSEvidence(row: Record<string, unknown>): ExtractedEvidence | null {
  const trackingId = row[RTS_COLUMNS.trackingId]?.toString().trim()
  const evidenceText = row[RTS_COLUMNS.additionalEvidence]?.toString().trim()

  if (!trackingId || !evidenceText) return null

  return {
    trackingId,
    disputeType: 'rts',
    evidenceText,
    disputeReason: row[RTS_COLUMNS.disputeReason]?.toString() || '',
    priority: parseConfidence(row[RTS_COLUMNS.confidence]?.toString()) === 'high' ? 1 : 2,
    rtsCode: row[RTS_COLUMNS.rtsCode]?.toString(),
    confidence: parseConfidence(row[RTS_COLUMNS.confidence]?.toString()),
  }
}

// Parse XLSX buffer and extract evidence
export interface ParseResult {
  success: boolean
  disputeType: DisputeType | null
  evidenceEntries: ExtractedEvidence[]
  totalRows: number
  errors: string[]
}

export function parseXLSXForEvidence(buffer: Buffer, filename?: string): ParseResult {
  const errors: string[] = []

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })

    // Get the first sheet
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return {
        success: false,
        disputeType: null,
        evidenceEntries: [],
        totalRows: 0,
        errors: ['No sheets found in workbook'],
      }
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

    if (rows.length === 0) {
      return {
        success: false,
        disputeType: null,
        evidenceEntries: [],
        totalRows: 0,
        errors: ['No data rows found in sheet'],
      }
    }

    // Get headers from first row
    const headers = Object.keys(rows[0])

    // Detect dispute type
    const disputeType = detectDisputeType(headers)
    if (!disputeType) {
      return {
        success: false,
        disputeType: null,
        evidenceEntries: [],
        totalRows: rows.length,
        errors: ['Could not detect dispute type from column headers'],
      }
    }

    // Extract station and week from filename if provided
    let station: string | undefined
    let week: string | undefined
    if (filename) {
      const stationMatch = filename.match(/([A-Z]{3}\d?)/i)
      const weekMatch = filename.match(/(?:wk|week)[-_]?(\d+)/i)
      station = stationMatch?.[1]?.toUpperCase()
      week = weekMatch?.[1]
    }

    // Extract evidence based on dispute type
    const evidenceEntries: ExtractedEvidence[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      let evidence: ExtractedEvidence | null = null

      switch (disputeType) {
        case 'concession':
          evidence = extractConcessionEvidence(row)
          break
        case 'feedback':
          evidence = extractFeedbackEvidence(row)
          break
        case 'rts':
          evidence = extractRTSEvidence(row)
          break
      }

      if (evidence) {
        evidence.station = station
        evidence.week = week
        evidenceEntries.push(evidence)
      }
    }

    return {
      success: true,
      disputeType,
      evidenceEntries,
      totalRows: rows.length,
      errors,
    }

  } catch (error) {
    return {
      success: false,
      disputeType: null,
      evidenceEntries: [],
      totalRows: 0,
      errors: [`Failed to parse XLSX: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}
