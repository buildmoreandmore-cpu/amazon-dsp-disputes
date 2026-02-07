import type { RTSRow, RTSDispute, RTSSummary, RTSRepeatDriver, RTSFilteredItem } from '@/types'

// RTS codes that indicate package logistics issues (high approval rate)
// These are cases where the package was never on or was removed from the van
// Amazon approves disputes for these because they're logistics issues, not driver issues
const HIGH_CONFIDENCE_RTS_CODES = [
  'OBJECT MISSING',
  'MISSING',
  'PACKAGE NOT FOUND',
  'NOT IN VAN',
  'REMOVED FROM VAN',
  'PACKAGE MISSING',
  'NOT FOUND',
  'NEVER LOADED',
  'NOT LOADED',
  'MISROUTE',
  'MISSORT'
]

// RTS codes that are valid returns (will be rejected by Amazon)
// These are legitimate RTS scenarios from Amazon's perspective
const LOW_CONFIDENCE_RTS_CODES = [
  'BUSINESS CLOSED',
  'NO LOCKER AVAILABLE',
  'LOCKER FULL',
  'OODT',
  'OUT OF DELIVERY TIME',
  'CUSTOMER UNAVAILABLE',
  'CUSTOMER REFUSED',
  'REFUSED',
  'ACCESS ISSUE',
  'ACCESS PROBLEM',
  'NO ACCESS',
  'GATE CLOSED',
  'LOCKED GATE',
  'WEATHER',
  'EMERGENCY',
  'UNSAFE LOCATION'
]

// Check if RTS code indicates a high-confidence dispute (package not on van)
export function isHighConfidenceDispute(rtsCode: string): boolean {
  const upperCode = rtsCode.toUpperCase()
  return HIGH_CONFIDENCE_RTS_CODES.some(code =>
    upperCode.includes(code) || upperCode === code
  )
}

// Check if RTS code is a known low-confidence code (valid RTS, will be rejected)
export function isLowConfidenceDispute(rtsCode: string): boolean {
  const upperCode = rtsCode.toUpperCase()
  return LOW_CONFIDENCE_RTS_CODES.some(code =>
    upperCode.includes(code) || upperCode === code
  )
}

// Get skip reason for low-confidence disputes
export function getSkipReason(rtsCode: string): string {
  const upperCode = rtsCode.toUpperCase()

  if (upperCode.includes('BUSINESS CLOSED')) {
    return 'Valid RTS - Business was closed. Amazon considers this a legitimate return.'
  }
  if (upperCode.includes('LOCKER') || upperCode.includes('NO LOCKER')) {
    return 'Valid RTS - Locker unavailable. Amazon considers this a legitimate return.'
  }
  if (upperCode.includes('OODT') || upperCode.includes('OUT OF DELIVERY TIME')) {
    return 'Valid RTS - Out of delivery time window. Amazon considers this a legitimate return.'
  }
  if (upperCode.includes('CUSTOMER') || upperCode.includes('REFUSED')) {
    return 'Valid RTS - Customer unavailable/refused. Amazon considers this a legitimate return.'
  }
  if (upperCode.includes('ACCESS') || upperCode.includes('GATE') || upperCode.includes('LOCKED')) {
    return 'Valid RTS - Access issue. Amazon considers this a legitimate return.'
  }
  if (upperCode.includes('WEATHER') || upperCode.includes('EMERGENCY')) {
    return 'Valid RTS - Weather/emergency. Amazon considers this a legitimate return.'
  }

  return 'Low confidence - Historical rejection rate for this RTS code is high.'
}

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
// Updated to match Amazon's approved dispute language for high-confidence cases
export function generateRTSDisputeReason(rtsCode: string): { reason: string; requiresManualReview: boolean; confidence: 'high' | 'low' } {
  const upperCode = rtsCode.toUpperCase()

  // HIGH CONFIDENCE: Package not on van - Amazon approves these
  if (isHighConfidenceDispute(rtsCode)) {
    return {
      reason: 'Package was removed from, or never on, the Delivery Associate\'s van. This is a logistics/loading issue and should not negatively impact the DCR metric.',
      requiresManualReview: false,
      confidence: 'high'
    }
  }

  // LOW CONFIDENCE: Valid RTS scenarios - Amazon rejects these disputes
  // Still generate reason but mark as low confidence
  if (upperCode === 'BUSINESS CLOSED' || upperCode.includes('BUSINESS CLOSED')) {
    return {
      reason: 'Business was closed during attempted delivery. Delivery window did not align with business operating hours.',
      requiresManualReview: false,
      confidence: 'low'
    }
  }

  if (upperCode === 'NO LOCKER AVAILABLE' || upperCode.includes('LOCKER')) {
    return {
      reason: 'Amazon Locker was full/unavailable at time of delivery attempt. Driver followed correct RTS procedure.',
      requiresManualReview: false,
      confidence: 'low'
    }
  }

  if (upperCode === 'OODT' || upperCode.includes('OUT OF DELIVERY TIME')) {
    return {
      reason: 'Package returned due to delivery window constraints. Route optimization may have affected delivery timing.',
      requiresManualReview: false,
      confidence: 'low'
    }
  }

  if (upperCode.includes('CUSTOMER') || upperCode.includes('REFUSED')) {
    return {
      reason: 'Customer was unavailable or refused delivery. Driver followed correct RTS procedure.',
      requiresManualReview: false,
      confidence: 'low'
    }
  }

  if (upperCode.includes('ACCESS') || upperCode.includes('GATE') || upperCode.includes('LOCKED')) {
    return {
      reason: 'Unable to access delivery location due to access restrictions.',
      requiresManualReview: false,
      confidence: 'low'
    }
  }

  if (upperCode.includes('WEATHER') || upperCode.includes('EMERGENCY')) {
    return {
      reason: 'Return due to weather or emergency conditions.',
      requiresManualReview: false,
      confidence: 'low'
    }
  }

  // Unknown codes - mark for manual review, low confidence
  return {
    reason: `MANUAL REVIEW - RTS Code: ${rtsCode}. Review delivery details for exemption eligibility.`,
    requiresManualReview: true,
    confidence: 'low'
  }
}

export function processRTSDisputes(rows: RTSRow[]): RTSDispute[] {
  return rows.map(row => {
    const priority = assignRTSPriority(row.rtsCode)
    const { reason, requiresManualReview, confidence } = generateRTSDisputeReason(row.rtsCode)

    return {
      trackingId: row.trackingId,
      driver: row.deliveryAssociate,
      driverId: row.transporterId,
      rtsCode: row.rtsCode,
      reason,
      priority,
      plannedDate: row.plannedDeliveryDate,
      requiresManualReview,
      confidence
    }
  })
}

// Process only high-confidence disputes (recommended for submission)
export function processHighConfidenceDisputes(rows: RTSRow[]): RTSDispute[] {
  return processRTSDisputes(rows).filter(dispute => dispute.confidence === 'high')
}

// Get filtered items (low-confidence disputes that should NOT be submitted)
export function getFilteredItems(rows: RTSRow[]): RTSFilteredItem[] {
  return rows
    .filter(row => !isHighConfidenceDispute(row.rtsCode))
    .map(row => ({
      trackingId: row.trackingId,
      driver: row.deliveryAssociate,
      driverId: row.transporterId,
      rtsCode: row.rtsCode,
      plannedDate: row.plannedDeliveryDate,
      skipReason: getSkipReason(row.rtsCode)
    }))
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
  const highConfidenceBreakdown: Record<string, number> = {}
  const lowConfidenceBreakdown: Record<string, number> = {}
  let manualReviewCount = 0
  let highConfidenceCount = 0
  let lowConfidenceCount = 0

  for (const dispute of disputes) {
    // Count tiers
    tierCounts[`tier${dispute.priority}` as keyof typeof tierCounts]++

    // Count RTS codes
    rtsCodeBreakdown[dispute.rtsCode] = (rtsCodeBreakdown[dispute.rtsCode] || 0) + 1

    // Count manual reviews
    if (dispute.requiresManualReview) {
      manualReviewCount++
    }

    // Count by confidence level
    if (dispute.confidence === 'high') {
      highConfidenceCount++
      highConfidenceBreakdown[dispute.rtsCode] = (highConfidenceBreakdown[dispute.rtsCode] || 0) + 1
    } else {
      lowConfidenceCount++
      lowConfidenceBreakdown[dispute.rtsCode] = (lowConfidenceBreakdown[dispute.rtsCode] || 0) + 1
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
    highConfidenceCount,
    lowConfidenceCount,
    tierCounts,
    rtsCodeBreakdown,
    highConfidenceBreakdown,
    lowConfidenceBreakdown,
    repeatDrivers: detectRTSRepeatDrivers(disputeableRows),
    station,
    week
  }
}
