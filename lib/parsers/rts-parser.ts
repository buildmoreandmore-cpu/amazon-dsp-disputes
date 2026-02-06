import { parse } from 'csv-parse/sync'
import type { RTSRow } from '@/types'

function parseBooleanFromYN(value: string | undefined): boolean {
  if (!value || value === '' || value === '-') return false
  return value.toUpperCase() === 'Y' || value.toLowerCase() === 'yes' || value === '1' || value.toLowerCase() === 'true'
}

function mapRowToTyped(rawRow: Record<string, string>): RTSRow {
  return {
    deliveryAssociate: rawRow['Delivery Associate'] || '',
    trackingId: rawRow['Tracking ID'] || '',
    transporterId: rawRow['Transporter ID'] || '',
    impactDCR: parseBooleanFromYN(rawRow['Impact DCR']),
    rtsCode: rawRow['RTS Code'] || '',
    customerContactDetails: rawRow['Customer Contact Details'] || '',
    plannedDeliveryDate: rawRow['Planned Delivery Date'] || '',
    exemptionReason: rawRow['Exemption Reason'] || '',
    serviceArea: rawRow['Service Area'] || ''
  }
}

export function parseRTSCSV(csvContent: string): RTSRow[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  }) as Record<string, string>[]

  return records.map(mapRowToTyped)
}

// Filter to only rows that need disputing:
// - Impact DCR = Y (affects the metric)
// - Exemption Reason = "No Exemption Applied" (not already exempted)
export function filterDisputeableRTS(rows: RTSRow[]): RTSRow[] {
  return rows.filter(row => {
    return row.impactDCR &&
           (row.exemptionReason === 'No Exemption Applied' ||
            row.exemptionReason === '' ||
            row.exemptionReason.toLowerCase().includes('no exemption'))
  })
}

export function validateRTSCSV(rows: RTSRow[]): { valid: boolean; errors: string[] } {
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
  if (!firstRow.deliveryAssociate && !firstRow.transporterId) {
    errors.push('Missing required column: Delivery Associate or Transporter ID')
  }

  return { valid: errors.length === 0, errors }
}
