import type { RTSRow, RTSDispute, RTSSummary, RTSRepeatDriver, RTSFilteredItem } from '@/types'

// ============================================================================
// MARCH 11, 2026 UPDATE: Amazon Auto-Exemptions
// ============================================================================
// Amazon now AUTO-EXEMPTS the following DCR cases (no dispute needed):
// 1. Packages rerouted while driver is on route (OODT, RTS-Other)
// 2. "Object Missing" packages later delivered by another DA
//
// This means most "Package Not on Van" disputes are now OBSOLETE.
// Focus remaining disputes on cases Amazon doesn't auto-exempt.
// ============================================================================

// RTS codes that Amazon NOW AUTO-EXEMPTS (as of March 11, 2026)
// DO NOT dispute these - Amazon handles them automatically
const AUTO_EXEMPTED_RTS_CODES = [
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
  'MISSORT',
  'OODT',           // Out of delivery time - now auto-exempted
  'OUT OF DELIVERY TIME',
  'RTS-OTHER'
]

// RTS codes that MAY still be disputable (delivered same day but marked RTS)
// These are the only cases worth disputing after March 11
const STILL_DISPUTABLE_CODES = [
  'DELIVERED WRONG DAY',  // Rare but disputable
  'SCAN ERROR',
  'SYSTEM ERROR'
]

// RTS codes that are valid returns (Amazon will reject disputes)
// These are legitimate RTS scenarios from Amazon's perspective
const LOW_CONFIDENCE_RTS_CODES = [
  'BUSINESS CLOSED',
  'NO LOCKER AVAILABLE',
  'LOCKER FULL',
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

// Check if RTS code is auto-exempted by Amazon (no dispute needed)
export function isAutoExempted(rtsCode: string): boolean {
  const upperCode = rtsCode.toUpperCase()
  return AUTO_EXEMPTED_RTS_CODES.some(code =>
    upperCode.includes(code) || upperCode === code
  )
}

// Check if RTS code may still be disputable (rare cases)
export function isStillDisputable(rtsCode: string): boolean {
  const upperCode = rtsCode.toUpperCase()
  return STILL_DISPUTABLE_CODES.some(code =>
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

// Legacy function - now most "high confidence" cases are auto-exempted
export function isHighConfidenceDispute(rtsCode: string): boolean {
  // After March 11, these are auto-exempted, not high-confidence disputes
  return isAutoExempted(rtsCode)
}

// Get skip reason for non-disputable cases
export function getSkipReason(rtsCode: string): string {
  const upperCode = rtsCode.toUpperCase()

  // Auto-exempted cases
  if (isAutoExempted(rtsCode)) {
    if (upperCode.includes('OBJECT MISSING') || upperCode.includes('MISSING') ||
        upperCode.includes('NOT IN VAN') || upperCode.includes('NOT FOUND') ||
        upperCode.includes('NOT LOADED') || upperCode.includes('NEVER LOADED')) {
      return '✓ AUTO-EXEMPTED by Amazon (March 2026) - "Package Not on Van" cases are now automatically exempted. No dispute needed.'
    }
    if (upperCode.includes('MISROUTE') || upperCode.includes('MISSORT')) {
      return '✓ AUTO-EXEMPTED by Amazon (March 2026) - Misrouted packages are now automatically exempted. No dispute needed.'
    }
    if (upperCode.includes('OODT') || upperCode.includes('OUT OF DELIVERY TIME') || upperCode.includes('RTS-OTHER')) {
      return '✓ AUTO-EXEMPTED by Amazon (March 2026) - Packages rerouted while driver on route are now automatically exempted. No dispute needed.'
    }
    return '✓ AUTO-EXEMPTED by Amazon (March 2026) - No dispute needed.'
  }

  // Low confidence cases
  if (upperCode.includes('BUSINESS CLOSED')) {
    return 'Valid RTS - Business was closed. Amazon considers this a legitimate return. (<1% approval rate)'
  }
  if (upperCode.includes('LOCKER') || upperCode.includes('NO LOCKER')) {
    return 'Valid RTS - Locker unavailable. Amazon considers this a legitimate return. (<1% approval rate)'
  }
  if (upperCode.includes('CUSTOMER') || upperCode.includes('REFUSED')) {
    return 'Valid RTS - Customer unavailable/refused. Amazon considers this a legitimate return. (<1% approval rate)'
  }
  if (upperCode.includes('ACCESS') || upperCode.includes('GATE') || upperCode.includes('LOCKED')) {
    return 'Valid RTS - Access issue. Amazon considers this a legitimate return. (<1% approval rate)'
  }
  if (upperCode.includes('WEATHER') || upperCode.includes('EMERGENCY')) {
    return 'Valid RTS - Weather/emergency. Amazon considers this a legitimate return. (<1% approval rate)'
  }

  return 'Low confidence - Historical rejection rate for this RTS code is very high (<1% approval).'
}

// Assign priority tier based on RTS code
export function assignRTSPriority(rtsCode: string): 1 | 2 | 3 {
  // Auto-exempted codes get lowest priority (they don't need disputes)
  if (isAutoExempted(rtsCode)) {
    return 3
  }

  // Still disputable cases get highest priority
  if (isStillDisputable(rtsCode)) {
    return 1
  }

  // Everything else is low priority (likely to be rejected)
  return 3
}

// Generate dispute reason based on RTS code
export function generateRTSDisputeReason(rtsCode: string): {
  reason: string
  requiresManualReview: boolean
  confidence: 'high' | 'low' | 'auto-exempted'
  isAutoExempted: boolean
} {
  const upperCode = rtsCode.toUpperCase()

  // AUTO-EXEMPTED: No dispute needed
  if (isAutoExempted(rtsCode)) {
    return {
      reason: '⚠️ NO DISPUTE NEEDED - This RTS code is now AUTO-EXEMPTED by Amazon (effective March 11, 2026). Amazon automatically exempts "Package Not on Van" and rerouted packages.',
      requiresManualReview: false,
      confidence: 'auto-exempted',
      isAutoExempted: true
    }
  }

  // STILL DISPUTABLE: Rare cases that may be approved
  if (isStillDisputable(rtsCode)) {
    return {
      reason: 'Package was delivered on the same day as Planned Delivery Date but incorrectly marked as RTS. Request verification that TBA was successfully delivered.',
      requiresManualReview: false,
      confidence: 'high',
      isAutoExempted: false
    }
  }

  // LOW CONFIDENCE: Valid RTS scenarios - Amazon rejects these disputes
  if (upperCode === 'BUSINESS CLOSED' || upperCode.includes('BUSINESS CLOSED')) {
    return {
      reason: 'Business was closed during attempted delivery. ⚠️ LOW APPROVAL RATE - Amazon typically rejects this as a valid RTS.',
      requiresManualReview: false,
      confidence: 'low',
      isAutoExempted: false
    }
  }

  if (upperCode === 'NO LOCKER AVAILABLE' || upperCode.includes('LOCKER')) {
    return {
      reason: 'Amazon Locker was full/unavailable. ⚠️ LOW APPROVAL RATE - Amazon typically rejects this as a valid RTS.',
      requiresManualReview: false,
      confidence: 'low',
      isAutoExempted: false
    }
  }

  if (upperCode.includes('CUSTOMER') || upperCode.includes('REFUSED')) {
    return {
      reason: 'Customer was unavailable or refused delivery. ⚠️ LOW APPROVAL RATE - Amazon typically rejects this as a valid RTS.',
      requiresManualReview: false,
      confidence: 'low',
      isAutoExempted: false
    }
  }

  if (upperCode.includes('ACCESS') || upperCode.includes('GATE') || upperCode.includes('LOCKED')) {
    return {
      reason: 'Unable to access delivery location. ⚠️ LOW APPROVAL RATE - Amazon typically rejects this as a valid RTS.',
      requiresManualReview: false,
      confidence: 'low',
      isAutoExempted: false
    }
  }

  if (upperCode.includes('WEATHER') || upperCode.includes('EMERGENCY')) {
    return {
      reason: 'Return due to weather or emergency conditions. ⚠️ LOW APPROVAL RATE - Amazon typically rejects without Tier 2+ weather event.',
      requiresManualReview: false,
      confidence: 'low',
      isAutoExempted: false
    }
  }

  // Unknown codes - mark for manual review
  return {
    reason: `MANUAL REVIEW - RTS Code: ${rtsCode}. Check if this was delivered same day but marked RTS incorrectly.`,
    requiresManualReview: true,
    confidence: 'low',
    isAutoExempted: false
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
      confidence: confidence === 'auto-exempted' ? 'low' : confidence
    }
  })
}

// Get only disputes worth submitting (excludes auto-exempted)
export function getDisputableItems(rows: RTSRow[]): RTSRow[] {
  return rows.filter(row => !isAutoExempted(row.rtsCode))
}

// Get auto-exempted items (no dispute needed)
export function getAutoExemptedItems(rows: RTSRow[]): RTSFilteredItem[] {
  return rows
    .filter(row => isAutoExempted(row.rtsCode))
    .map(row => ({
      trackingId: row.trackingId,
      driver: row.deliveryAssociate,
      driverId: row.transporterId,
      rtsCode: row.rtsCode,
      plannedDate: row.plannedDeliveryDate,
      skipReason: getSkipReason(row.rtsCode)
    }))
}

// Process only high-confidence disputes (rare after March 11)
export function processHighConfidenceDisputes(rows: RTSRow[]): RTSDispute[] {
  const disputableRows = rows.filter(row => isStillDisputable(row.rtsCode))
  return processRTSDisputes(disputableRows)
}

// Get filtered items (low-confidence disputes that should NOT be submitted)
export function getFilteredItems(rows: RTSRow[]): RTSFilteredItem[] {
  return rows
    .filter(row => !isStillDisputable(row.rtsCode))
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
    // Then by confidence (high first)
    if (a.confidence !== b.confidence) {
      return a.confidence === 'high' ? -1 : 1
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

  // Calculate auto-exempted count (new for March 2026)
  const autoExemptedCount = allRows.filter(r => isAutoExempted(r.rtsCode)).length

  // Calculate already exempted count (from Amazon's exemption reason field)
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
    week,
    // New field for March 2026
    autoExemptedByAmazonCount: autoExemptedCount
  } as RTSSummary
}
