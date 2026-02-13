// DCM (Delivery Contrast Map) type definitions

/** Per-TBA scraped data from the DCM popup */
export interface DCMDeliveryData {
  trackingId: string
  gpsLatitude: number | null
  gpsLongitude: number | null
  geoFenceStatus: string | null // e.g., "WITHIN", "OUTSIDE"
  distanceFromPin: number | null // meters
  photoUrl: string | null
  deliveryTimestamp: string | null
  deliveryLocation: string | null
  podStatus: string | null // e.g., "Photo on delivery", "No photo"
  scrapedAt: string
}

/** Typed selector config for DCM page DOM elements */
export interface DCMSelectors {
  searchInput: string[]
  searchButton: string[]
  deliveryRow: string[]
  gpsCoords: string[]
  geoFenceStatus: string[]
  distanceFromPin: string[]
  photoElement: string[]
  deliveryTimestamp: string[]
  deliveryLocation: string[]
  podStatus: string[]
  dcmPopup: string[]
  closePopup: string[]
  loginForm: string[]
  noResults: string[]
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
