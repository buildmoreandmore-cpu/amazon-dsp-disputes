export interface ConcessionRow {
  deliveryAssociateName: string
  deliveryAssociate: string
  impactsDSB: number
  deliveryType: 'Attended' | 'Unattended'
  simultaneousDeliveries: number
  deliveredOver50m: number
  incorrectScanAttended: number
  incorrectScanUnattended: number
  noPOD: number
  scannedNotDelivered: number
  trackingId: string
  pickupDate: string | null
  deliveryAttemptDate: string | null
  deliveryDate: string
  concessionDate: string
  serviceArea: string
  dsp: string
}

export interface DisputeResult {
  trackingId: string
  reason: string
  priority: 1 | 2 | 3 | 4
  impactsDSB: boolean
  driver: string
  driverId: string
  deliveryType: string
  withinGeoFence: boolean
  hasPOD: boolean
  notes: string
}

export interface ProcessingResult {
  disputes: DisputeResult[]
  summary: DisputeSummary
  filename: string
}

export interface DisputeSummary {
  totalConcessions: number
  impactsDSBCount: number
  autoDisputedCount: number
  manualReviewCount: number
  tierCounts: {
    tier1: number
    tier2: number
    tier3: number
    tier4: number
  }
  repeatDrivers: RepeatDriver[]
  reasonBreakdown: Record<string, number>
  station: string
  week: string
}

export interface RepeatDriver {
  name: string
  driverId: string
  concessionCount: number
}

export interface ApiResponse {
  success: boolean
  data?: {
    disputes: DisputeResult[]
    summary: DisputeSummary
    xlsxBase64: string
    markdownSummary: string
    outputFilename: string
  }
  error?: string
}
