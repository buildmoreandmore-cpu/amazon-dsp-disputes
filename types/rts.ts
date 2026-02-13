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
  confidence: 'high' | 'low'
}

export interface RTSFilteredItem {
  trackingId: string
  driver: string
  driverId: string
  rtsCode: string
  plannedDate: string
  skipReason: string
}

export interface RTSSummary {
  totalRTS: number
  impactsDCRCount: number
  alreadyExemptedCount: number
  autoDisputedCount: number
  manualReviewCount: number
  highConfidenceCount: number
  lowConfidenceCount: number
  tierCounts: {
    tier1: number
    tier2: number
    tier3: number
  }
  rtsCodeBreakdown: Record<string, number>
  highConfidenceBreakdown: Record<string, number>
  lowConfidenceBreakdown: Record<string, number>
  repeatDrivers: RTSRepeatDriver[]
  station: string
  week: string
  // March 2026 update: Amazon now auto-exempts "Package Not on Van" cases
  autoExemptedByAmazonCount?: number
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
