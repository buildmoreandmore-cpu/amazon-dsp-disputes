import * as XLSX from 'xlsx'
import type { DisputeResult } from '@/types'

interface XLSXRow {
  'Tracking ID': string
  'Reason': string
  'Priority': number
  'Impacts DSB': string
  'Driver': string
  'Driver ID': string
  'Delivery Type': string
  'Within Geo Fence': string
  'Has POD': string
  'Notes': string
}

export function generateXLSX(disputes: DisputeResult[], filename: string): string {
  // Convert disputes to XLSX rows
  const rows: XLSXRow[] = disputes.map(d => ({
    'Tracking ID': d.trackingId,
    'Reason': d.reason,
    'Priority': d.priority,
    'Impacts DSB': d.impactsDSB ? 'Yes' : 'No',
    'Driver': d.driver,
    'Driver ID': d.driverId,
    'Delivery Type': d.deliveryType,
    'Within Geo Fence': d.withinGeoFence ? 'Yes' : 'No',
    'Has POD': d.hasPOD ? 'Yes' : 'No',
    'Notes': d.notes
  }))

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)

  // Set column widths
  const columnWidths = [
    { wch: 20 },  // Tracking ID
    { wch: 80 },  // Reason
    { wch: 8 },   // Priority
    { wch: 12 },  // Impacts DSB
    { wch: 25 },  // Driver
    { wch: 15 },  // Driver ID
    { wch: 14 },  // Delivery Type
    { wch: 16 },  // Within Geo Fence
    { wch: 10 },  // Has POD
    { wch: 40 }   // Notes
  ]
  worksheet['!cols'] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Disputes')

  // Generate buffer and convert to base64
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  const base64 = Buffer.from(buffer).toString('base64')

  return base64
}

export function generateOutputFilename(station: string, week: string): string {
  return `disputes_${station}_${week}.xlsx`
}
