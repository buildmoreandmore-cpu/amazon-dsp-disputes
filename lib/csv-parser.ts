// Re-export from new location for backwards compatibility
export { parseConcessionCSV as parseCSV, validateConcessionCSV as validateCSV } from './parsers/concession-parser'

// Shared utility for extracting station and week from any filename
export function extractStationAndWeek(filename: string): { station: string; week: string } {
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
