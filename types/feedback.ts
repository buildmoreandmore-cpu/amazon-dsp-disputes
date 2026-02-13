import type { DCMDeliveryData } from './dcm'

export interface FeedbackRow {
  deliveryAssociate: string
  deliveryAssociateName: string
  feedbackDetails: string
  trackingId: string
  address: string
  customerNotes: string
  reasonForDispute: string
}

export interface FeedbackDispute {
  trackingId: string
  driver: string
  driverId: string
  feedbackType: string
  feedbackDetails: string
  reason: string
  priority: 1 | 2 | 3
  address: string
  customerNotes: string
  requiresManualReview: boolean
  additionalEvidence?: string
  dcmData?: DCMDeliveryData
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
