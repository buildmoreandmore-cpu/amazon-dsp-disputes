export interface RTSRow {
  deliveryAssociate: string
  trackingId: string
  transporterId: string
  impactDCR: boolean
  rtsCode: string
  customerContactDetails: string
  plannedDeliveryDate: string
  exemptionReason: string
  serviceArea: string
}

export interface RTSDispute {
  trackingId: string
  driver: string
  driverId: string
  rtsCode: string
  reason: string
  priority: 1 | 2 | 3
  plannedDate: string
  requiresManualReview: boolean
}

export interface RTSSummary {
  totalRTS: number
  impactsDCRCount: number
  alreadyExemptedCount: number
  autoDisputedCount: number
  manualReviewCount: number
  tierCounts: {
    tier1: number
    tier2: number
    tier3: number
  }
  rtsCodeBreakdown: Record<string, number>
  repeatDrivers: RTSRepeatDriver[]
  station: string
  week: string
}

export interface RTSRepeatDriver {
  name: string
  driverId: string
  rtsCount: number
}

export interface RTSApiResponse {
  success: boolean
  data?: {
    disputes: RTSDispute[]
    summary: RTSSummary
    xlsxBase64: string
    markdownSummary: string
    outputFilename: string
  }
  error?: string
}
