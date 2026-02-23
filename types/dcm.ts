// DCM (Delivery Contrast Map) type definitions

/** Per-TBA scraped data from the DCM popup */
export interface DCMDeliveryData {
  trackingId: string
  // Actual delivery GPS (from "Actual Location" row)
  gpsLatitude: number | null
  gpsLongitude: number | null
  // Planned delivery GPS (from "Planned Location" row)
  plannedLatitude: number | null
  plannedLongitude: number | null
  // Inferred from distance vs Amazon's 150m geo-fence radius
  geoFenceStatus: string | null // "WITHIN" | "OUTSIDE"
  // From "Distance Between Actual and Planned" row
  distanceFromPin: number | null // meters
  photoUrl: string | null
  // From "Delivery Date" row
  deliveryTimestamp: string | null
  deliveryLocation: string | null
  // From POD text at bottom of popup
  podStatus: string | null
  // From "Delivery Type" row (Attended / Unattended)
  deliveryType: string | null
  // From "Dropoff Location" row (DELIVERED_TO_RECEPTIONIST, etc.)
  dropoffLocation: string | null
  // From "Concession Reason" row
  concessionReason: string | null
  // From "Address" row
  address: string | null
  scrapedAt: string
}

/** Row labels in the DCM popup table for text-based extraction */
export interface DCMRowLabels {
  deliveryAttemptDate: string
  deliveryDate: string
  concessionReason: string
  dropoffLocation: string
  deliveryType: string
  address: string
  distanceBetween: string
  plannedLocation: string
  actualLocation: string
}

/** Server status for the scraper */
export interface ScraperStatus {
  running: boolean
  authenticated: boolean
  scraping: boolean
  progress: {
    total: number
    completed: number
    succeeded: number
    failed: number
    currentTBA: string | null
  } | null
}

/** SSE event union type */
export type ScraperEvent =
  | { type: 'auth_required'; message: string }
  | { type: 'progress'; completed: number; total: number; currentTBA: string }
  | { type: 'tba_success'; trackingId: string; data: DCMDeliveryData }
  | { type: 'tba_failed'; trackingId: string; error: string }
  | { type: 'complete'; succeeded: number; failed: number; total: number }
  | { type: 'error'; message: string }
  | { type: 'warning'; message: string }

/** Frontend state for enrichment flow */
export type EnrichmentStatus =
  | 'idle'
  | 'checking_server'
  | 'server_not_running'
  | 'awaiting_auth'
  | 'scraping'
  | 'complete'
  | 'error'
