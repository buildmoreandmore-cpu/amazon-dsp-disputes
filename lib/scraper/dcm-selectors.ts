import type { DCMSelectors } from '../../types/dcm'

// Amazon Logistics URLs
export const AMAZON_LOGISTICS_URL = 'https://logistics.amazon.com'
export const AMAZON_LOGIN_URL = 'https://logistics.amazon.com/login'

// Timing constants
export const SCRAPE_DELAY_MS = 2000
export const JITTER_MIN_MS = 500
export const JITTER_MAX_MS = 1500
export const DCM_LOAD_TIMEOUT_MS = 15000
export const AUTH_CHECK_TIMEOUT_MS = 5000
export const MAX_CONSECUTIVE_FAILURES = 5
export const CACHE_TTL_DAYS = 7

/**
 * DOM selectors for the Delivery Contrast Map page.
 * Each field is an array of selectors tried in order (fallback chain):
 *   data-testid → aria-label → text content → CSS class
 *
 * These are best-guess patterns. Refine after first live inspection.
 */
export const DCM_SELECTORS: DCMSelectors = {
  // Search input for TBA tracking ID
  searchInput: [
    '[data-testid="tracking-id-search"]',
    'input[aria-label="Search tracking ID"]',
    'input[placeholder*="tracking"]',
    'input[placeholder*="TBA"]',
    '.search-input input',
    'input[type="text"]',
  ],

  // Search/submit button
  searchButton: [
    '[data-testid="search-button"]',
    'button[aria-label="Search"]',
    'button:has-text("Search")',
    '.search-button',
    'button[type="submit"]',
  ],

  // Delivery result row in search results
  deliveryRow: [
    '[data-testid="delivery-row"]',
    '[data-testid="delivery-detail"]',
    'tr[data-tracking-id]',
    '.delivery-row',
    '.delivery-detail',
  ],

  // GPS coordinates display
  gpsCoords: [
    '[data-testid="gps-coordinates"]',
    '[data-testid="delivery-coordinates"]',
    '[aria-label="GPS coordinates"]',
    '.gps-coords',
    '.coordinates',
  ],

  // Geo-fence status (WITHIN / OUTSIDE)
  geoFenceStatus: [
    '[data-testid="geo-fence-status"]',
    '[data-testid="geofence-status"]',
    '[aria-label="Geo fence status"]',
    '.geo-fence-status',
    '.geofence-badge',
  ],

  // Distance from delivery pin
  distanceFromPin: [
    '[data-testid="distance-from-pin"]',
    '[data-testid="delivery-distance"]',
    '[aria-label="Distance"]',
    '.distance-value',
    '.delivery-distance',
  ],

  // Delivery photo element
  photoElement: [
    '[data-testid="delivery-photo"]',
    '[data-testid="pod-photo"]',
    'img[alt*="delivery"]',
    'img[alt*="photo"]',
    '.delivery-photo img',
    '.pod-image img',
  ],

  // Delivery timestamp
  deliveryTimestamp: [
    '[data-testid="delivery-timestamp"]',
    '[data-testid="delivery-time"]',
    '[aria-label="Delivery time"]',
    '.delivery-timestamp',
    '.delivery-time',
  ],

  // Delivery location description
  deliveryLocation: [
    '[data-testid="delivery-location"]',
    '[aria-label="Delivery location"]',
    '.delivery-location',
    '.location-description',
  ],

  // Proof of delivery status
  podStatus: [
    '[data-testid="pod-status"]',
    '[data-testid="proof-of-delivery"]',
    '[aria-label="Proof of delivery"]',
    '.pod-status',
    '.proof-of-delivery',
  ],

  // DCM popup/modal container
  dcmPopup: [
    '[data-testid="dcm-popup"]',
    '[data-testid="delivery-detail-modal"]',
    '[role="dialog"]',
    '.modal-content',
    '.dcm-popup',
  ],

  // Close popup button
  closePopup: [
    '[data-testid="close-popup"]',
    'button[aria-label="Close"]',
    'button:has-text("Close")',
    '.close-button',
    '[data-dismiss="modal"]',
  ],

  // Login form detection (for auth checks)
  loginForm: [
    '#ap_email',
    'input[name="email"]',
    '#signInSubmit',
    'form[name="signIn"]',
    '.auth-form',
  ],

  // No results indicator
  noResults: [
    '[data-testid="no-results"]',
    ':has-text("No results found")',
    ':has-text("not found")',
    '.no-results',
    '.empty-state',
  ],
}

/**
 * Try each selector in the fallback chain until one matches.
 * Returns the first matching selector string, or null if none match.
 */
export function getFirstMatchingSelector(selectors: string[]): string | null {
  // This is used by the extractor with page.locator()
  // We return the full array for the extractor to iterate
  return selectors[0] ?? null
}

/** Calculate delay with jitter */
export function getDelayWithJitter(): number {
  const jitter = JITTER_MIN_MS + Math.random() * (JITTER_MAX_MS - JITTER_MIN_MS)
  return SCRAPE_DELAY_MS + jitter
}
