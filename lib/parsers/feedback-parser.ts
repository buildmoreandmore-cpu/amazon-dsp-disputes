import { parse } from 'csv-parse/sync'
import type { FeedbackRow } from '@/types'

// Legacy boolean columns from old Amazon format
const LEGACY_BOOLEAN_COLUMNS = [
  'DA Mishandled Package',
  'DA was Unprofessional',
  'DA did not follow my delivery instructions',
  'Delivered to Wrong Address',
  'Never Received Delivery',
  'Received Wrong Item'
]

function parseBooleanField(value: string | undefined): boolean {
  if (!value || value === '' || value === '-') return false
  return value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
}

function isLegacyFormat(headers: string[]): boolean {
  return LEGACY_BOOLEAN_COLUMNS.some(col => headers.includes(col))
}

function synthesizeFeedbackDetails(rawRow: Record<string, string>): string {
  if (parseBooleanField(rawRow['Delivered to Wrong Address'])) return 'Delivered to Wrong Address'
  if (parseBooleanField(rawRow['Never Received Delivery'])) return 'Never Received Delivery'
  if (parseBooleanField(rawRow['DA did not follow my delivery instructions'])) return 'Did not follow instructions'
  if (parseBooleanField(rawRow['DA Mishandled Package'])) return 'DA Mishandled Package'
  if (parseBooleanField(rawRow['DA was Unprofessional'])) return 'Driver was unprofessional'
  if (parseBooleanField(rawRow['Received Wrong Item'])) return 'Received Wrong Item'
  return rawRow['Feedback Details'] || ''
}

function mapRowToTyped(rawRow: Record<string, string>, legacy: boolean): FeedbackRow {
  const feedbackDetails = legacy
    ? (rawRow['Feedback Details'] || synthesizeFeedbackDetails(rawRow))
    : (rawRow['Feedback Details'] || '')

  return {
    deliveryAssociate: rawRow['Delivery Associate'] || '',
    deliveryAssociateName: rawRow['Delivery Associate Name'] || '',
    feedbackDetails,
    trackingId: rawRow['Tracking ID'] || '',
    address: rawRow['Address'] || '',
    customerNotes: rawRow['Customer Notes'] || '',
    reasonForDispute: rawRow['Reason for Dispute'] || ''
  }
}

export function parseFeedbackCSV(csvContent: string): FeedbackRow[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  }) as Record<string, string>[]

  if (records.length === 0) return []

  const headers = Object.keys(records[0])
  const legacy = isLegacyFormat(headers)

  return records.map(row => mapRowToTyped(row, legacy))
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
