import type { RTSRow, RTSDispute, RTSSummary, RTSRepeatDriver } from '@/types'

// Assign priority tier based on RTS code
export function assignRTSPriority(rtsCode: string): 1 | 2 | 3 {
  const upperCode = rtsCode.toUpperCase()

  // Tier 1: Clear exemption cases
  if (upperCode === 'BUSINESS CLOSED' ||
      upperCode.includes('BUSINESS CLOSED') ||
      upperCode === 'NO LOCKER AVAILABLE' ||
      upperCode.includes('LOCKER')) {
    return 1
  }

  // Tier 2: Time-based issues
  if (upperCode === 'OODT' ||
      upperCode.includes('OUT OF DELIVERY TIME') ||
      upperCode.includes('TIME')) {
    return 2
  }

  // Tier 3: Manual review required
  return 3
}

// Generate dispute reason based on RTS code
export function generateRTSDisputeReason(rtsCode: string): { reason: string; requiresManualReview: boolean } {
  const upperCode = rtsCode.toUpperCase()

  if (upperCode === 'BUSINESS CLOSED' || upperCode.includes('BUSINESS CLOSED')) {
    return {
      reason: 'Business was closed during attempted delivery. Delivery window did not align with business operating hours. Request exemption.',
      requiresManualReview: false
    }
  }

  if (upperCode === 'NO LOCKER AVAILABLE' || upperCode.includes('LOCKER')) {
    return {
      reason: 'Amazon Locker was full/unavailable at time of delivery attempt. Driver followed correct RTS procedure.',
      requiresManualReview: false
    }
  }

  if (upperCode === 'OODT' || upperCode.includes('OUT OF DELIVERY TIME')) {
    return {
      reason: 'Package returned due to delivery window constraints. Route optimization may have affected delivery timing.',
      requiresManualReview: false
    }
  }

  if (upperCode === 'OBJECT MISSING' || upperCode.includes('MISSING')) {
    return {
      reason: 'MANUAL REVIEW - Package was not located in vehicle. Verify package tracking chain.',
      requiresManualReview: true
    }
  }

  if (upperCode.includes('CUSTOMER') || upperCode.includes('REFUSED')) {
    return {
      reason: 'Customer was unavailable or refused delivery. Driver followed correct RTS procedure.',
      requiresManualReview: false
    }
  }

  if (upperCode.includes('ACCESS') || upperCode.includes('GATE') || upperCode.includes('LOCKED')) {
    return {
      reason: 'Unable to access delivery location. Request exemption due to access restrictions.',
      requiresManualReview: false
    }
  }

  if (upperCode.includes('WEATHER') || upperCode.includes('EMERGENCY')) {
    return {
      reason: 'Return due to weather or emergency conditions. Request exemption.',
      requiresManualReview: false
    }
  }

  // Default for unknown codes
  return {
    reason: `MANUAL REVIEW - RTS Code: ${rtsCode}. Review delivery details for exemption eligibility.`,
    requiresManualReview: true
  }
}

export function processRTSDisputes(rows: RTSRow[]): RTSDispute[] {
  return rows.map(row => {
    const priority = assignRTSPriority(row.rtsCode)
    const { reason, requiresManualReview } = generateRTSDisputeReason(row.rtsCode)

    return {
      trackingId: row.trackingId,
      driver: row.deliveryAssociate,
      driverId: row.transporterId,
      rtsCode: row.rtsCode,
      reason,
      priority,
      plannedDate: row.plannedDeliveryDate,
      requiresManualReview
    }
  })
}

export function sortRTSDisputes(disputes: RTSDispute[]): RTSDispute[] {
  return [...disputes].sort((a, b) => {
    // Sort by priority ascending (1 is highest priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    // Then by manual review (non-manual first)
    if (a.requiresManualReview !== b.requiresManualReview) {
      return a.requiresManualReview ? 1 : -1
    }
    return 0
  })
}

export function detectRTSRepeatDrivers(rows: RTSRow[]): RTSRepeatDriver[] {
  const driverCounts = new Map<string, { name: string; count: number }>()

  for (const row of rows) {
    const driverId = row.transporterId || row.deliveryAssociate
    const existing = driverCounts.get(driverId)
    if (existing) {
      existing.count++
    } else {
      driverCounts.set(driverId, {
        name: row.deliveryAssociate,
        count: 1
      })
    }
  }

  const repeatDrivers: RTSRepeatDriver[] = []
  for (const [driverId, data] of driverCounts) {
    if (data.count >= 3) {
      repeatDrivers.push({
        name: data.name,
        driverId,
        rtsCount: data.count
      })
    }
  }

  return repeatDrivers.sort((a, b) => b.rtsCount - a.rtsCount)
}

export function buildRTSSummary(
  allRows: RTSRow[],
  disputeableRows: RTSRow[],
  disputes: RTSDispute[],
  station: string,
  week: string
): RTSSummary {
  const tierCounts = {
    tier1: 0,
    tier2: 0,
    tier3: 0
  }

  const rtsCodeBreakdown: Record<string, number> = {}
  let manualReviewCount = 0

  for (const dispute of disputes) {
    // Count tiers
    tierCounts[`tier${dispute.priority}` as keyof typeof tierCounts]++

    // Count RTS codes
    rtsCodeBreakdown[dispute.rtsCode] = (rtsCodeBreakdown[dispute.rtsCode] || 0) + 1

    // Count manual reviews
    if (dispute.requiresManualReview) {
      manualReviewCount++
    }
  }

  // Calculate already exempted count
  const alreadyExemptedCount = allRows.length - disputeableRows.length

  return {
    totalRTS: allRows.length,
    impactsDCRCount: allRows.filter(r => r.impactDCR).length,
    alreadyExemptedCount,
    autoDisputedCount: disputes.length - manualReviewCount,
    manualReviewCount,
    tierCounts,
    rtsCodeBreakdown,
    repeatDrivers: detectRTSRepeatDrivers(disputeableRows),
    station,
    week
  }
}
