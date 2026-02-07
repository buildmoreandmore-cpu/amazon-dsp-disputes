// Types for the evidence feedback loop system

export type DisputeType = 'concession' | 'feedback' | 'rts'

// Extracted evidence from an uploaded XLSX row
export interface ExtractedEvidence {
  trackingId: string
  disputeType: DisputeType
  evidenceText: string
  disputeReason: string
  priority: number

  // Concession-specific fields
  withinGeoFence?: boolean
  hasPOD?: boolean
  deliveryType?: string
  impactsDSB?: boolean

  // Feedback-specific fields
  feedbackType?: string

  // RTS-specific fields
  rtsCode?: string
  confidence?: string

  // Metadata
  station?: string
  week?: string
}

// Result of uploading an XLSX file with evidence
export interface EvidenceUploadResult {
  success: boolean
  totalRows: number
  rowsWithEvidence: number
  newPatterns: number
  updatedPatterns: number
  errors: string[]
}

// Knowledge base statistics
export interface EvidenceStats {
  totalEntries: number
  entriesByType: {
    concession: number
    feedback: number
    rts: number
  }
  totalPatterns: number
  patternsByType: {
    concession: number
    feedback: number
    rts: number
  }
  topPatterns: Array<{
    patternKey: string
    disputeType: string
    usageCount: number
    evidenceTemplate: string
  }>
  recentEntries: Array<{
    id: string
    trackingId: string
    disputeType: string
    evidenceText: string
    createdAt: Date
  }>
}

// Suggestion request for getting evidence suggestions
export interface SuggestionRequest {
  disputeType: DisputeType

  // For concession disputes
  withinGeoFence?: boolean
  hasPOD?: boolean
  deliveryType?: string
  impactsDSB?: boolean

  // For feedback disputes
  feedbackType?: string

  // For RTS disputes
  rtsCode?: string
  confidence?: string
}

// Evidence suggestion result
export interface EvidenceSuggestion {
  patternKey: string
  evidenceTemplate: string
  usageCount: number
  matchScore: number // How well this pattern matches the request
}

// API response types
export interface EvidenceUploadResponse {
  success: boolean
  result?: EvidenceUploadResult
  error?: string
}

export interface EvidenceStatsResponse {
  success: boolean
  stats?: EvidenceStats
  error?: string
}

export interface EvidenceSuggestionsResponse {
  success: boolean
  suggestions?: EvidenceSuggestion[]
  error?: string
}
