import type { Page } from 'playwright'
import type { DCMDeliveryData, DCMSelectors } from '../../types/dcm'
import { DCM_LOAD_TIMEOUT_MS } from './dcm-selectors'

/**
 * Try each selector in a fallback chain and return text content from the first match.
 */
async function trySelectors(page: Page, selectors: string[]): Promise<string | null> {
  for (const selector of selectors) {
    try {
      const el = page.locator(selector).first()
      const isVisible = await el.isVisible({ timeout: 1000 }).catch(() => false)
      if (isVisible) {
        const text = await el.textContent({ timeout: 2000 })
        return text?.trim() ?? null
      }
    } catch {
      // Selector didn't match, try next
    }
  }
  return null
}

/**
 * Try to get an image src from a selector chain.
 */
async function tryImageSelectors(page: Page, selectors: string[]): Promise<string | null> {
  for (const selector of selectors) {
    try {
      const el = page.locator(selector).first()
      const isVisible = await el.isVisible({ timeout: 1000 }).catch(() => false)
      if (isVisible) {
        const src = await el.getAttribute('src', { timeout: 2000 })
        return src ?? null
      }
    } catch {
      // Selector didn't match, try next
    }
  }
  return null
}

/**
 * Parse GPS coordinates from text like "33.749, -84.388" or "Lat: 33.749 Lng: -84.388"
 */
function parseGPSCoords(text: string | null): { lat: number | null; lng: number | null } {
  if (!text) return { lat: null, lng: null }

  // Try "lat, lng" format
  const commaMatch = text.match(/([-\d.]+)\s*,\s*([-\d.]+)/)
  if (commaMatch) {
    return { lat: parseFloat(commaMatch[1]), lng: parseFloat(commaMatch[2]) }
  }

  // Try "Lat: X Lng: Y" format
  const labelMatch = text.match(/lat[:\s]*([-\d.]+).*?l(?:ng|on)[:\s]*([-\d.]+)/i)
  if (labelMatch) {
    return { lat: parseFloat(labelMatch[1]), lng: parseFloat(labelMatch[2]) }
  }

  return { lat: null, lng: null }
}

/**
 * Parse distance from text like "21.38m" or "21.38 meters"
 */
function parseDistance(text: string | null): number | null {
  if (!text) return null
  const match = text.match(/([\d.]+)\s*m/)
  return match ? parseFloat(match[1]) : null
}

/**
 * Extract DCM data from the current page state for a given tracking ID.
 * Each field is individually try/caught — missing fields return null.
 */
export async function extractDCMData(
  page: Page,
  trackingId: string,
  selectors: DCMSelectors
): Promise<DCMDeliveryData> {
  const result: DCMDeliveryData = {
    trackingId,
    gpsLatitude: null,
    gpsLongitude: null,
    geoFenceStatus: null,
    distanceFromPin: null,
    photoUrl: null,
    deliveryTimestamp: null,
    deliveryLocation: null,
    podStatus: null,
    scrapedAt: new Date().toISOString(),
  }

  // GPS Coordinates
  try {
    const gpsText = await trySelectors(page, selectors.gpsCoords)
    const { lat, lng } = parseGPSCoords(gpsText)
    result.gpsLatitude = lat
    result.gpsLongitude = lng
  } catch { /* field unavailable */ }

  // Geo-fence status
  try {
    const status = await trySelectors(page, selectors.geoFenceStatus)
    if (status) {
      result.geoFenceStatus = status.toUpperCase().includes('WITHIN') ? 'WITHIN' :
                               status.toUpperCase().includes('OUTSIDE') ? 'OUTSIDE' : status
    }
  } catch { /* field unavailable */ }

  // Distance from pin
  try {
    const distText = await trySelectors(page, selectors.distanceFromPin)
    result.distanceFromPin = parseDistance(distText)
  } catch { /* field unavailable */ }

  // Photo URL
  try {
    result.photoUrl = await tryImageSelectors(page, selectors.photoElement)
  } catch { /* field unavailable */ }

  // Delivery timestamp
  try {
    result.deliveryTimestamp = await trySelectors(page, selectors.deliveryTimestamp)
  } catch { /* field unavailable */ }

  // Delivery location
  try {
    result.deliveryLocation = await trySelectors(page, selectors.deliveryLocation)
  } catch { /* field unavailable */ }

  // POD status
  try {
    const podText = await trySelectors(page, selectors.podStatus)
    if (podText) {
      result.podStatus = podText
    } else {
      // Infer from photo presence
      result.podStatus = result.photoUrl ? 'Photo on delivery' : null
    }
  } catch { /* field unavailable */ }

  return result
}

/**
 * Navigate to a TBA's DCM page and wait for data to load.
 * Returns true if delivery data appeared, false if no results found.
 */
export async function navigateToTBA(
  page: Page,
  trackingId: string,
  selectors: DCMSelectors
): Promise<boolean> {
  // Try to find and use the search input
  for (const selector of selectors.searchInput) {
    try {
      const input = page.locator(selector).first()
      const isVisible = await input.isVisible({ timeout: 2000 }).catch(() => false)
      if (isVisible) {
        await input.clear()
        await input.fill(trackingId)

        // Try clicking search button
        let submitted = false
        for (const btnSelector of selectors.searchButton) {
          try {
            const btn = page.locator(btnSelector).first()
            const btnVisible = await btn.isVisible({ timeout: 1000 }).catch(() => false)
            if (btnVisible) {
              await btn.click()
              submitted = true
              break
            }
          } catch { /* try next button selector */ }
        }

        // Fallback: press Enter if no button found
        if (!submitted) {
          await input.press('Enter')
        }

        // Wait for results to load
        await page.waitForTimeout(DCM_LOAD_TIMEOUT_MS / 3)

        // Check for no results
        for (const nrSelector of selectors.noResults) {
          try {
            const noResult = page.locator(nrSelector).first()
            const noResultVisible = await noResult.isVisible({ timeout: 1000 }).catch(() => false)
            if (noResultVisible) return false
          } catch { /* not this selector */ }
        }

        // Check if delivery data appeared
        for (const rowSelector of selectors.deliveryRow) {
          try {
            const row = page.locator(rowSelector).first()
            const rowVisible = await row.isVisible({ timeout: DCM_LOAD_TIMEOUT_MS }).catch(() => false)
            if (rowVisible) {
              await row.click().catch(() => {})
              await page.waitForTimeout(1000) // Wait for popup/detail to open
              return true
            }
          } catch { /* try next selector */ }
        }

        return true // Data might be inline, not in a row
      }
    } catch { /* try next input selector */ }
  }

  return false
}

/**
 * Check if the current page is a login page (session expired).
 */
export async function isLoginPage(page: Page, selectors: DCMSelectors): Promise<boolean> {
  for (const selector of selectors.loginForm) {
    try {
      const el = page.locator(selector).first()
      const isVisible = await el.isVisible({ timeout: 1000 }).catch(() => false)
      if (isVisible) return true
    } catch { /* not this selector */ }
  }
  return false
}
