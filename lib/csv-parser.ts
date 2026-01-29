import { parse } from 'csv-parse/sync'
import type { ConcessionRow } from '@/types'

const COLUMN_MAPPINGS: Record<string, keyof ConcessionRow> = {
  'Delivery Associate Name': 'deliveryAssociateName',
  'Delivery Associate': 'deliveryAssociate',
  'Impacts DSB': 'impactsDSB',
  'Delivery Type': 'deliveryType',
  'Simultaneous deliveries': 'simultaneousDeliveries',
  'Delivered over 50m from pin': 'deliveredOver50m',
  'Incorrect scan - Attended': 'incorrectScanAttended',
  'Incorrect scan - Unattended': 'incorrectScanUnattended',
  'No POD': 'noPOD',
  'Scanned Not Delivered': 'scannedNotDelivered',
  'Tracking ID': 'trackingId',
  'Pickup Date': 'pickupDate',
  'Delivery Attempt Date': 'deliveryAttemptDate',
  'Delivery Date': 'deliveryDate',
  'Concession date': 'concessionDate',
  'Service Area': 'serviceArea',
  'DSP': 'dsp'
}

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

export function parseCSV(csvContent: string): ConcessionRow[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  }) as Record<string, string>[]

  return records.map(mapRowToTyped)
}

export function extractStationAndWeek(filename: string): { station: string; week: string } {
  // Try to extract station code (e.g., DAT9) and week (e.g., 2026-W04) from filename
  // Expected formats: "concessions_DAT9_2026-W04.csv", "DAT9_concessions_W04.csv", etc.

  let station = 'UNKNOWN'
  let week = 'UNKNOWN'

  // Extract station code (3-4 letter code followed by 1-2 digits)
  const stationMatch = filename.match(/([A-Z]{3,4}\d{1,2})/i)
  if (stationMatch) {
    station = stationMatch[1].toUpperCase()
  }

  // Extract week (W followed by 2 digits, optionally with year)
  const weekMatch = filename.match(/(\d{4})?[-_]?W(\d{2})/i)
  if (weekMatch) {
    const year = weekMatch[1] || new Date().getFullYear().toString()
    week = `${year}-W${weekMatch[2]}`
  } else {
    // Try to infer week from current date if not in filename
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7)
    week = `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
  }

  return { station, week }
}

export function validateCSV(rows: ConcessionRow[]): { valid: boolean; errors: string[] } {
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
      // Default to Unattended if invalid
      rows[i].deliveryType = 'Unattended'
    }
  }

  return { valid: errors.length === 0, errors }
}
