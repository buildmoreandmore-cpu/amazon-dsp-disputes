import { prisma } from '../db'
import type { DCMDeliveryData } from '../../types/dcm'
import { CACHE_TTL_DAYS } from './dcm-selectors'

/**
 * Get cached DCM data for a list of tracking IDs.
 * Only returns entries cached within the TTL period.
 */
export async function getCachedDCMData(
  trackingIds: string[]
): Promise<Map<string, DCMDeliveryData>> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - CACHE_TTL_DAYS)

  const cached = await prisma.dCMCache.findMany({
    where: {
      trackingId: { in: trackingIds },
      scrapedAt: { gte: cutoff },
    },
  })

  const result = new Map<string, DCMDeliveryData>()

  for (const row of cached) {
    result.set(row.trackingId, {
      trackingId: row.trackingId,
      gpsLatitude: row.gpsLatitude,
      gpsLongitude: row.gpsLongitude,
      geoFenceStatus: row.geoFenceStatus,
      distanceFromPin: row.distanceFromPin,
      photoUrl: row.photoUrl,
      deliveryTimestamp: row.deliveryTimestamp,
      deliveryLocation: row.deliveryLocation,
      podStatus: row.podStatus,
      scrapedAt: row.scrapedAt.toISOString(),
    })
  }

  return result
}

/**
 * Cache a single DCM data entry. Upserts by trackingId.
 */
export async function cacheDCMData(data: DCMDeliveryData): Promise<void> {
  await prisma.dCMCache.upsert({
    where: { trackingId: data.trackingId },
    create: {
      trackingId: data.trackingId,
      gpsLatitude: data.gpsLatitude,
      gpsLongitude: data.gpsLongitude,
      geoFenceStatus: data.geoFenceStatus,
      distanceFromPin: data.distanceFromPin,
      photoUrl: data.photoUrl,
      deliveryTimestamp: data.deliveryTimestamp,
      deliveryLocation: data.deliveryLocation,
      podStatus: data.podStatus,
    },
    update: {
      gpsLatitude: data.gpsLatitude,
      gpsLongitude: data.gpsLongitude,
      geoFenceStatus: data.geoFenceStatus,
      distanceFromPin: data.distanceFromPin,
      photoUrl: data.photoUrl,
      deliveryTimestamp: data.deliveryTimestamp,
      deliveryLocation: data.deliveryLocation,
      podStatus: data.podStatus,
      scrapedAt: new Date(),
    },
  })
}

/**
 * Clear cached DCM data older than the specified number of days.
 * Defaults to CACHE_TTL_DAYS.
 */
export async function clearDCMCache(olderThanDays?: number): Promise<number> {
  const days = olderThanDays ?? CACHE_TTL_DAYS
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const result = await prisma.dCMCache.deleteMany({
    where: { scrapedAt: { lt: cutoff } },
  })

  return result.count
}
