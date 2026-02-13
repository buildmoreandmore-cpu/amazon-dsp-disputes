import type { DCMDeliveryData } from '../../types/dcm'

/**
 * Formats DCMDeliveryData into a human-readable evidence string
 * for the "Additional Evidence" column in the XLSX export.
 *
 * Example output:
 * "Geo-fence: WITHIN | Distance: 21.38m | GPS: 33.749, -84.388 | Delivered: 2026-02-10 14:32 | POD: Photo on delivery"
 */
export function formatDCMEvidence(data: DCMDeliveryData): string {
  const parts: string[] = []

  if (data.geoFenceStatus) {
    parts.push(`Geo-fence: ${data.geoFenceStatus}`)
  }

  if (data.distanceFromPin != null) {
    parts.push(`Distance: ${data.distanceFromPin}m`)
  }

  if (data.gpsLatitude != null && data.gpsLongitude != null) {
    parts.push(`GPS: ${data.gpsLatitude}, ${data.gpsLongitude}`)
  }

  if (data.deliveryTimestamp) {
    parts.push(`Delivered: ${data.deliveryTimestamp}`)
  }

  if (data.deliveryLocation) {
    parts.push(`Location: ${data.deliveryLocation}`)
  }

  if (data.podStatus) {
    parts.push(`POD: ${data.podStatus}`)
  } else if (data.photoUrl) {
    parts.push('POD: Available')
  }

  return parts.length > 0 ? parts.join(' | ') : ''
}

/**
 * Enhance a generic dispute reason with actual DCM data.
 * Replaces template language with real GPS/geo-fence evidence.
 */
export function enhanceReasonWithDCM(originalReason: string, data: DCMDeliveryData): string {
  // Don't modify manual review reasons
  if (originalReason.startsWith('MANUAL REVIEW')) {
    return originalReason
  }

  const enhancements: string[] = []

  if (data.geoFenceStatus === 'WITHIN') {
    enhancements.push('DCM confirms delivery within geo-fence')
  } else if (data.geoFenceStatus === 'OUTSIDE' && data.distanceFromPin != null) {
    enhancements.push(`DCM shows delivery ${data.distanceFromPin}m from pin`)
  }

  if (data.gpsLatitude != null && data.gpsLongitude != null) {
    enhancements.push(`GPS verified (${data.gpsLatitude}, ${data.gpsLongitude})`)
  }

  if (data.photoUrl || data.podStatus?.toLowerCase().includes('photo')) {
    enhancements.push('Photo proof of delivery confirmed')
  }

  if (data.deliveryTimestamp) {
    enhancements.push(`Delivery time: ${data.deliveryTimestamp}`)
  }

  if (enhancements.length === 0) {
    return originalReason
  }

  return `${originalReason} [DCM Evidence: ${enhancements.join('; ')}]`
}
