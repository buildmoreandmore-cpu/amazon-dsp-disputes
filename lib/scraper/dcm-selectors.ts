import type { DCMRowLabels } from '../../types/dcm'

// Amazon Logistics URLs
export const AMAZON_LOGISTICS_URL = 'https://logistics.amazon.com'

// Timing constants
export const SCRAPE_DELAY_MS = 2000
export const JITTER_MIN_MS = 500
export const JITTER_MAX_MS = 1500
export const DCM_LOAD_TIMEOUT_MS = 15000
export const AUTH_CHECK_TIMEOUT_MS = 5000
export const MAX_CONSECUTIVE_FAILURES = 5
export const CACHE_TTL_DAYS = 7

// Amazon's standard delivery geo-fence radius in meters
export const AMAZON_GEOFENCE_RADIUS_METERS = 150

/**
 * Row labels in the DCM popup table.
 * The popup is a two-column table: label cell | value cell.
 * We find rows by matching the label text, then read the adjacent value cell.
 *
 * These match exactly what appears in the Amazon Logistics DCM popup.
 */
export const DCM_ROW_LABELS: DCMRowLabels = {
  deliveryAttemptDate: 'Delivery Attempt Date',
  deliveryDate: 'Delivery Date',
  concessionReason: 'Concession Reason',
  dropoffLocation: 'Dropoff Location',
  deliveryType: 'Delivery Type',
  address: 'Address',
  distanceBetween: 'Distance Between Actual and Planned',
  plannedLocation: 'Planned Location',
  actualLocation: 'Actual Location',
}

/**
 * Selectors for page-level elements (not inside the popup table).
 * Each is a fallback chain tried in order.
 */
export const PAGE_SELECTORS = {
  // Search input at top of the associate/TBA list
  searchInput: [
    'input[placeholder*="TBA"]',
    'input[placeholder*="order or TBA"]',
    'input[placeholder*="tracking"]',
    'input[placeholder*="Search"]',
    'input[type="search"]',
    'input[type="text"]',
  ],

  // DCM popup detection — title text at top of modal
  popupTitle: [
    'text=Delivery contrast map for Tracking ID',
    ':has-text("Delivery contrast map for Tracking ID")',
  ],

  // Close popup button (X in top-right corner)
  closePopup: [
    'button[aria-label="Close"]',
    'button:has-text("×")',
    'button:has-text("✕")',
    'button:has-text("X")',
    '.modal-close',
    'button.close',
    '[data-dismiss="modal"]',
  ],

  // Login form detection (session expired)
  loginForm: [
    '#ap_email',
    'input[name="email"]',
    '#signInSubmit',
    'form[name="signIn"]',
  ],

  // POD text at bottom of popup (outside the main table)
  podText: [
    'text=POD not required',
    'text=POD required',
    'text=Photo on delivery',
    ':has-text("POD")',
  ],

  // Delivery photo in popup
  photoElement: [
    'img[alt*="delivery"]',
    'img[alt*="photo"]',
    'img[alt*="POD"]',
    '.delivery-photo img',
  ],

  // "View more details on Cortex" link — indicates data loaded
  cortexLink: [
    'text=View more details on Cortex',
    'a:has-text("Cortex")',
  ],

  // Clickable TBA row in the concessions/feedback list
  tbaRow: [
    'tr:has-text("TBA")',
    'td:has-text("TBA")',
    '[data-tracking-id]',
  ],
}

/** Calculate delay with jitter */
export function getDelayWithJitter(): number {
  const jitter = JITTER_MIN_MS + Math.random() * (JITTER_MAX_MS - JITTER_MIN_MS)
  return SCRAPE_DELAY_MS + jitter
}
