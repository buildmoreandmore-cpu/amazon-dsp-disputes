import * as XLSX from 'xlsx'
import type { DisputeResult, FeedbackDispute, RTSDispute, DisputeCategory } from '@/types'

// Concession XLSX row format
interface ConcessionXLSXRow {
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
  'Additional Evidence': string
}

// Feedback XLSX row format
interface FeedbackXLSXRow {
  'Tracking ID': string
  'Driver': string
  'Feedback Type': string
  'Feedback Details': string
  'Address': string
  'Customer Notes': string
  'Dispute Reason': string
  'Priority': number
  'Additional Evidence': string
}

// RTS XLSX row format
interface RTSXLSXRow {
  'Tracking ID': string
  'Driver': string
  'RTS Code': string
  'Confidence': string
  'Dispute Reason': string
  'Planned Date': string
  'Additional Evidence': string
}

export function generateConcessionXLSX(disputes: DisputeResult[]): string {
  const rows: ConcessionXLSXRow[] = disputes.map(d => ({
    'Tracking ID': d.trackingId,
    'Reason': d.reason,
    'Priority': d.priority,
    'Impacts DSB': d.impactsDSB ? 'Yes' : 'No',
    'Driver': d.driver,
    'Driver ID': d.driverId,
    'Delivery Type': d.deliveryType,
    'Within Geo Fence': d.withinGeoFence ? 'Yes' : 'No',
    'Has POD': d.hasPOD ? 'Yes' : 'No',
    'Notes': d.notes,
    'Additional Evidence': ''
  }))

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)

  worksheet['!cols'] = [
    { wch: 20 },  // Tracking ID
    { wch: 80 },  // Reason
    { wch: 8 },   // Priority
    { wch: 12 },  // Impacts DSB
    { wch: 25 },  // Driver
    { wch: 15 },  // Driver ID
    { wch: 14 },  // Delivery Type
    { wch: 16 },  // Within Geo Fence
    { wch: 10 },  // Has POD
    { wch: 40 },  // Notes
    { wch: 50 }   // Additional Evidence
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Concession Disputes')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.from(buffer).toString('base64')
}

export function generateFeedbackXLSX(disputes: FeedbackDispute[]): string {
  const rows: FeedbackXLSXRow[] = disputes.map(d => ({
    'Tracking ID': d.trackingId,
    'Driver': d.driver,
    'Feedback Type': d.feedbackType,
    'Feedback Details': d.feedbackDetails,
    'Address': d.address,
    'Customer Notes': d.customerNotes,
    'Dispute Reason': d.reason,
    'Priority': d.priority,
    'Additional Evidence': d.additionalEvidence || ''
  }))

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)

  worksheet['!cols'] = [
    { wch: 20 },  // Tracking ID
    { wch: 25 },  // Driver
    { wch: 22 },  // Feedback Type
    { wch: 50 },  // Feedback Details
    { wch: 40 },  // Address
    { wch: 30 },  // Customer Notes
    { wch: 80 },  // Dispute Reason
    { wch: 8 },   // Priority
    { wch: 60 }   // Additional Evidence
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback Disputes')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.from(buffer).toString('base64')
}

export function generateRTSXLSX(disputes: RTSDispute[]): string {
  // Separate high-confidence (first) from low-confidence disputes
  const sortedDisputes = [...disputes].sort((a, b) => {
    if (a.confidence === 'high' && b.confidence === 'low') return -1
    if (a.confidence === 'low' && b.confidence === 'high') return 1
    return 0
  })

  const rows: RTSXLSXRow[] = sortedDisputes.map(d => ({
    'Tracking ID': d.trackingId,
    'Driver': d.driver,
    'RTS Code': d.rtsCode,
    'Confidence': d.confidence === 'high' ? 'HIGH - Submit' : 'LOW - Skip',
    'Dispute Reason': d.reason,
    'Planned Date': d.plannedDate,
    'Additional Evidence': ''
  }))

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)

  worksheet['!cols'] = [
    { wch: 20 },  // Tracking ID
    { wch: 25 },  // Driver
    { wch: 22 },  // RTS Code
    { wch: 14 },  // Confidence
    { wch: 80 },  // Dispute Reason
    { wch: 14 },  // Planned Date
    { wch: 50 }   // Additional Evidence
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'RTS Disputes')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.from(buffer).toString('base64')
}

// Legacy function for backwards compatibility
export function generateXLSX(disputes: DisputeResult[], filename: string): string {
  return generateConcessionXLSX(disputes)
}

export function generateOutputFilename(category: DisputeCategory, station: string, week: string): string {
  const prefixes: Record<DisputeCategory, string> = {
    concessions: 'concession_disputes',
    feedback: 'customer_feedback_disputes',
    rts: 'dcr_rts_disputes'
  }
  return `${prefixes[category]}_${station}_${week}.xlsx`
}
