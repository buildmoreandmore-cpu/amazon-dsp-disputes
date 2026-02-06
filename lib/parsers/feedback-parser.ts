import { parse } from 'csv-parse/sync'
import type { FeedbackRow } from '@/types'

function parseBooleanField(value: string | undefined): boolean {
  if (!value || value === '' || value === '-') return false
  return value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
}

function mapRowToTyped(rawRow: Record<string, string>): FeedbackRow {
  return {
    deliveryGroupId: rawRow['Delivery Group ID'] || '',
    deliveryAssociate: rawRow['Delivery Associate'] || '',
    deliveryAssociateName: rawRow['Delivery Associate Name'] || '',
    mishandledPackage: parseBooleanField(rawRow['DA Mishandled Package']),
    unprofessional: parseBooleanField(rawRow['DA was Unprofessional']),
    didNotFollowInstructions: parseBooleanField(rawRow['DA did not follow my delivery instructions']),
    wrongAddress: parseBooleanField(rawRow['Delivered to Wrong Address']),
    neverReceived: parseBooleanField(rawRow['Never Received Delivery']),
    wrongItem: parseBooleanField(rawRow['Received Wrong Item']),
    feedbackDetails: rawRow['Feedback Details'] || '',
    trackingId: rawRow['Tracking ID'] || '',
    deliveryDate: rawRow['Delivery Date'] || ''
  }
}

export function parseFeedbackCSV(csvContent: string): FeedbackRow[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  }) as Record<string, string>[]

  return records.map(mapRowToTyped)
}

export function validateFeedbackCSV(rows: FeedbackRow[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (rows.length === 0) {
    errors.push('CSV file is empty or contains no data rows')
    return { valid: false, errors }
  }

  // Check for required fields
  const firstRow = rows[0]
  if (!firstRow.trackingId) {
    errors.push('Missing required column: Tracking ID')
  }
  if (!firstRow.deliveryAssociateName && !firstRow.deliveryAssociate) {
    errors.push('Missing required column: Delivery Associate Name or Delivery Associate')
  }

  return { valid: errors.length === 0, errors }
}
