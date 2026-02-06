import { parse } from 'csv-parse/sync'
import type { ConcessionRow } from '@/types'

function parseNumericField(value: string | undefined): number {
  if (!value || value === '' || value === '-') return 0
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? 0 : parsed
}

function parseDateField(value: string | undefined): string | null {
  if (!value || value === '' || value === '-') return null
  return value
}

function mapRowToTyped(rawRow: Record<string, string>): ConcessionRow {
  return {
    deliveryAssociateName: rawRow['Delivery Associate Name'] || '',
    deliveryAssociate: rawRow['Delivery Associate'] || '',
    impactsDSB: parseNumericField(rawRow['Impacts DSB']),
    deliveryType: (rawRow['Delivery Type'] as 'Attended' | 'Unattended') || 'Unattended',
    simultaneousDeliveries: parseNumericField(rawRow['Simultaneous deliveries']),
    deliveredOver50m: parseNumericField(rawRow['Delivered over 50m from pin']),
    incorrectScanAttended: parseNumericField(rawRow['Incorrect scan - Attended']),
    incorrectScanUnattended: parseNumericField(rawRow['Incorrect scan - Unattended']),
    noPOD: parseNumericField(rawRow['No POD']),
    scannedNotDelivered: parseNumericField(rawRow['Scanned Not Delivered']),
    trackingId: rawRow['Tracking ID'] || '',
    pickupDate: parseDateField(rawRow['Pickup Date']),
    deliveryAttemptDate: parseDateField(rawRow['Delivery Attempt Date']),
    deliveryDate: rawRow['Delivery Date'] || '',
    concessionDate: rawRow['Concession date'] || '',
    serviceArea: rawRow['Service Area'] || '',
    dsp: rawRow['DSP'] || ''
  }
}

export function parseConcessionCSV(csvContent: string): ConcessionRow[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  }) as Record<string, string>[]

  return records.map(mapRowToTyped)
}

export function validateConcessionCSV(rows: ConcessionRow[]): { valid: boolean; errors: string[] } {
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

  // Validate delivery types
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row.deliveryType !== 'Attended' && row.deliveryType !== 'Unattended') {
      rows[i].deliveryType = 'Unattended'
    }
  }

  return { valid: errors.length === 0, errors }
}
