export interface FeedbackRow {
  deliveryGroupId: string
  deliveryAssociate: string
  deliveryAssociateName: string
  mishandledPackage: boolean
  unprofessional: boolean
  didNotFollowInstructions: boolean
  wrongAddress: boolean
  neverReceived: boolean
  wrongItem: boolean
  feedbackDetails: string
  trackingId: string
  deliveryDate: string
}

export interface FeedbackDispute {
  trackingId: string
  driver: string
  driverId: string
  feedbackType: string
  feedbackDetails: string
  reason: string
  priority: 1 | 2 | 3
  deliveryDate: string
  requiresManualReview: boolean
}

export interface FeedbackSummary {
  totalFeedback: number
  autoDisputedCount: number
  manualReviewCount: number
  tierCounts: {
    tier1: number
    tier2: number
    tier3: number
  }
  feedbackTypeBreakdown: Record<string, number>
  repeatDrivers: FeedbackRepeatDriver[]
  station: string
  week: string
}

export interface FeedbackRepeatDriver {
  name: string
  driverId: string
  feedbackCount: number
}

export interface FeedbackApiResponse {
  success: boolean
  data?: {
    disputes: FeedbackDispute[]
    summary: FeedbackSummary
    xlsxBase64: string
    markdownSummary: string
    outputFilename: string
  }
  error?: string
}
