import type { DCMDeliveryData } from '../../types/dcm'

/**
 * Formats DCMDeliveryData into a human-readable evidence string
 * for the "Additional Evidence" column in the XLSX export.
 *
 * Example output:
 * "Geo-fence: WITHIN | Distance: 21.38m | GPS: 33.8111345, -84.5654161 | Planned: 33.8110359, -84.5652175 | Delivered: 2026-01-22 22:44:12 | POD: POD not required for this delivery"
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

  if (data.plannedLatitude != null && data.plannedLongitude != null) {
    parts.push(`Planned: ${data.plannedLatitude}, ${data.plannedLongitude}`)
  }

  if (data.deliveryTimestamp) {
    parts.push(`Delivered: ${data.deliveryTimestamp}`)
  }

  if (data.deliveryType) {
    parts.push(`Type: ${data.deliveryType}`)
  }

  if (data.dropoffLocation) {
    parts.push(`Dropoff: ${data.dropoffLocation}`)
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

  if (data.geoFenceStatus === 'WITHIN' && data.distanceFromPin != null) {
    enhancements.push(`DCM confirms delivery within geo-fence (${data.distanceFromPin}m from pin)`)
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

  if (data.deliveryType) {
    enhancements.push(`Delivery type: ${data.deliveryType}`)
  }

  if (enhancements.length === 0) {
    return originalReason
  }

  return `${originalReason} [DCM Evidence: ${enhancements.join('; ')}]`
}
