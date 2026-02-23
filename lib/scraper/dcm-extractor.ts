import type { Page } from 'playwright'
import type { DCMDeliveryData } from '../../types/dcm'
import {
  DCM_ROW_LABELS,
  PAGE_SELECTORS,
  DCM_LOAD_TIMEOUT_MS,
  AMAZON_GEOFENCE_RADIUS_METERS,
} from './dcm-selectors'

/**
 * Find a row in the DCM popup table by its label text,
 * then return the value from the last <td> in that row.
 *
 * The popup uses a two-column table layout:
 *   <tr><td>Label Text</td><td>Value</td></tr>
 *
 * Some labels use <th> instead of <td>, so we try both.
 */
async function getRowValue(page: Page, label: string): Promise<string | null> {
  // Strategy 1: tr containing a td with the label text
  try {
    const row = page.locator(`tr:has(td:has-text("${label}"))`).first()
    if (await row.isVisible({ timeout: 1000 }).catch(() => false)) {
      const cells = row.locator('td')
      const count = await cells.count()
      if (count >= 2) {
        const text = await cells.nth(count - 1).textContent({ timeout: 1000 })
        return text?.trim() || null
      }
    }
  } catch { /* try next strategy */ }

  // Strategy 2: tr containing a th with the label text
  try {
    const row = page.locator(`tr:has(th:has-text("${label}"))`).first()
    if (await row.isVisible({ timeout: 1000 }).catch(() => false)) {
      const text = await row.locator('td').first().textContent({ timeout: 1000 })
      return text?.trim() || null
    }
  } catch { /* try next strategy */ }

  // Strategy 3: any element pair where label is followed by value
  try {
    const label_el = page.locator(`text="${label}"`).first()
    if (await label_el.isVisible({ timeout: 500 }).catch(() => false)) {
      const parent = label_el.locator('..')
      const sibling = parent.locator('td, span, div').last()
      const text = await sibling.textContent({ timeout: 1000 })
      if (text && text.trim() !== label) {
        return text.trim()
      }
    }
  } catch { /* field not found */ }

  return null
}

/**
 * Parse GPS coordinates in degree format: "33.8110359°, -84.5652175°"
 * Also handles plain format: "33.749, -84.388"
 */
function parseGPSCoords(text: string | null): { lat: number | null; lng: number | null } {
  if (!text) return { lat: null, lng: null }

  // Match with or without degree symbol: "33.8110359°, -84.5652175°"
  const match = text.match(/([-\d.]+)°?\s*,\s*([-\d.]+)°?/)
  if (match) {
    const lat = parseFloat(match[1])
    const lng = parseFloat(match[2])
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng }
    }
  }

  // Try "Lat: X Lng: Y" format
  const labelMatch = text.match(/lat[:\s]*([-\d.]+).*?l(?:ng|on)[:\s]*([-\d.]+)/i)
  if (labelMatch) {
    return { lat: parseFloat(labelMatch[1]), lng: parseFloat(labelMatch[2]) }
  }

  return { lat: null, lng: null }
}

/**
 * Parse distance from text like "21.38 meters" or "21.38m"
 */
function parseDistance(text: string | null): number | null {
  if (!text) return null
  const match = text.match(/([\d.]+)\s*m(?:eter)?/)
  return match ? parseFloat(match[1]) : null
}

/**
 * Infer geo-fence status from distance.
 * Amazon's standard geo-fence radius is ~150 meters.
 */
function inferGeoFenceStatus(distanceMeters: number | null): string | null {
  if (distanceMeters == null) return null
  return distanceMeters <= AMAZON_GEOFENCE_RADIUS_METERS ? 'WITHIN' : 'OUTSIDE'
}

/**
 * Extract DCM data from the popup table for a given tracking ID.
 * Each field is individually try/caught — missing fields return null.
 */
export async function extractDCMData(
  page: Page,
  trackingId: string
): Promise<DCMDeliveryData> {
  const result: DCMDeliveryData = {
    trackingId,
    gpsLatitude: null,
    gpsLongitude: null,
    plannedLatitude: null,
    plannedLongitude: null,
    geoFenceStatus: null,
    distanceFromPin: null,
    photoUrl: null,
    deliveryTimestamp: null,
    deliveryLocation: null,
    podStatus: null,
    deliveryType: null,
    dropoffLocation: null,
    concessionReason: null,
    address: null,
    scrapedAt: new Date().toISOString(),
  }

  // Actual Location GPS
  try {
    const actualText = await getRowValue(page, DCM_ROW_LABELS.actualLocation)
    const { lat, lng } = parseGPSCoords(actualText)
    result.gpsLatitude = lat
    result.gpsLongitude = lng
  } catch { /* field unavailable */ }

  // Planned Location GPS
  try {
    const plannedText = await getRowValue(page, DCM_ROW_LABELS.plannedLocation)
    const { lat, lng } = parseGPSCoords(plannedText)
    result.plannedLatitude = lat
    result.plannedLongitude = lng
  } catch { /* field unavailable */ }

  // Distance Between Actual and Planned
  try {
    const distText = await getRowValue(page, DCM_ROW_LABELS.distanceBetween)
    result.distanceFromPin = parseDistance(distText)
    result.geoFenceStatus = inferGeoFenceStatus(result.distanceFromPin)
  } catch { /* field unavailable */ }

  // Delivery Date (timestamp)
  try {
    result.deliveryTimestamp = await getRowValue(page, DCM_ROW_LABELS.deliveryDate)
  } catch { /* field unavailable */ }

  // Delivery Type (Attended / Unattended)
  try {
    result.deliveryType = await getRowValue(page, DCM_ROW_LABELS.deliveryType)
  } catch { /* field unavailable */ }

  // Dropoff Location
  try {
    result.dropoffLocation = await getRowValue(page, DCM_ROW_LABELS.dropoffLocation)
  } catch { /* field unavailable */ }

  // Concession Reason
  try {
    result.concessionReason = await getRowValue(page, DCM_ROW_LABELS.concessionReason)
  } catch { /* field unavailable */ }

  // Address
  try {
    result.address = await getRowValue(page, DCM_ROW_LABELS.address)
  } catch { /* field unavailable */ }

  // POD status — text at bottom of popup
  try {
    for (const selector of PAGE_SELECTORS.podText) {
      const el = page.locator(selector).first()
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await el.textContent({ timeout: 1000 })
        result.podStatus = text?.trim() ?? null
        break
      }
    }
  } catch { /* field unavailable */ }

  // Photo URL — if a delivery photo is shown
  try {
    for (const selector of PAGE_SELECTORS.photoElement) {
      const el = page.locator(selector).first()
      if (await el.isVisible({ timeout: 500 }).catch(() => false)) {
        result.photoUrl = await el.getAttribute('src', { timeout: 1000 })
        break
      }
    }
  } catch { /* field unavailable */ }

  // Delivery location — combine dropoff + address for context
  if (result.dropoffLocation) {
    result.deliveryLocation = result.dropoffLocation
  }

  return result
}

/**
 * Navigate to a TBA's DCM popup.
 * Searches for the TBA in the search input, then waits for the popup to appear.
 * Returns true if the popup opened with data, false otherwise.
 */
export async function navigateToTBA(
  page: Page,
  trackingId: string
): Promise<boolean> {
  // Find and use the search input
  for (const selector of PAGE_SELECTORS.searchInput) {
    try {
      const input = page.locator(selector).first()
      if (!(await input.isVisible({ timeout: 2000 }).catch(() => false))) continue

      // Clear and type the tracking ID
      await input.click()
      await input.fill('')
      await page.waitForTimeout(200)
      await input.fill(trackingId)
      await page.waitForTimeout(500)

      // Press Enter to search
      await input.press('Enter')

      // Wait for results to load
      await page.waitForTimeout(2000)

      // Look for a clickable TBA element in the results
      const tbaLink = page.locator(`text=${trackingId}`).first()
      if (await tbaLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tbaLink.click()
        await page.waitForTimeout(1500)
      }

      // Check if the DCM popup appeared
      for (const popupSelector of PAGE_SELECTORS.popupTitle) {
        try {
          const popup = page.locator(popupSelector).first()
          if (await popup.isVisible({ timeout: DCM_LOAD_TIMEOUT_MS }).catch(() => false)) {
            // Wait a bit more for all data to render
            await page.waitForTimeout(1000)
            return true
          }
        } catch { /* try next popup selector */ }
      }

      // Also check if we can see key data rows (popup might not have a title match)
      try {
        const distRow = page.locator(`tr:has-text("${DCM_ROW_LABELS.distanceBetween}")`).first()
        if (await distRow.isVisible({ timeout: 3000 }).catch(() => false)) {
          return true
        }
      } catch { /* no data rows visible */ }

      // Search worked but popup didn't appear — TBA might not exist
      return false
    } catch { /* try next input selector */ }
  }

  return false
}

/**
 * Close the DCM popup.
 */
export async function closePopup(page: Page): Promise<void> {
  for (const selector of PAGE_SELECTORS.closePopup) {
    try {
      const btn = page.locator(selector).first()
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click()
        await page.waitForTimeout(500)
        return
      }
    } catch { /* try next close selector */ }
  }

  // Fallback: press Escape
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
}

/**
 * Check if the current page is a login page (session expired).
 */
export async function isLoginPage(page: Page): Promise<boolean> {
  for (const selector of PAGE_SELECTORS.loginForm) {
    try {
      const el = page.locator(selector).first()
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) return true
    } catch { /* not this selector */ }
  }
  return false
}
