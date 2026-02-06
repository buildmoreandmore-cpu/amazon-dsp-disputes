import type { ConcessionRow, DisputeResult, DisputeSummary, RepeatDriver } from '@/types'

export function assignPriority(row: ConcessionRow): 1 | 2 | 3 | 4 {
  // Tier 1: Impacts DSB (highest priority)
  if (row.impactsDSB === 1) {
    return 1
  }

  // Tier 2: Within geo fence and has POD
  if (row.deliveredOver50m === 0 && row.noPOD === 0) {
    return 2
  }

  // Tier 3: Attended delivery
  if (row.deliveryType === 'Attended') {
    return 3
  }

  // Tier 4: Manual review required (outside geo fence)
  return 4
}

export function generateDisputeReason(row: ConcessionRow): { reason: string; notes: string } {
  const withinGeo = row.deliveredOver50m === 0
  const hasPOD = row.noPOD === 0
  const isAttended = row.deliveryType === 'Attended'
  const isUnattended = row.deliveryType === 'Unattended'
  const hasScanMismatch = row.incorrectScanAttended === 1 || row.incorrectScanUnattended === 1
  const isMultiPackage = row.simultaneousDeliveries > 1
  const scannedNotDelivered = row.scannedNotDelivered === 1

  // Outside geo fence - manual review
  if (!withinGeo) {
    return {
      reason: 'MANUAL REVIEW REQUIRED - Delivered outside 50m geo fence. Check Cortex for additional delivery context.',
      notes: 'Requires manual Cortex verification'
    }
  }

  // Package anomaly
  if (scannedNotDelivered) {
    return {
      reason: 'MANUAL REVIEW REQUIRED - Package status anomaly. Verify delivery status in Cortex.',
      notes: 'Scanned but marked not delivered - verify in Cortex'
    }
  }

  // Within geo + POD + Unattended
  if (withinGeo && hasPOD && isUnattended) {
    return {
      reason: 'Delivered within geo fence with photo proof confirming delivery location. GPS data supports successful delivery.',
      notes: ''
    }
  }

  // Within geo + Attended
  if (withinGeo && isAttended) {
    return {
      reason: 'Attended delivery - package handed directly to recipient. GPS confirms driver within delivery geo fence.',
      notes: hasPOD ? '' : 'No POD required for attended delivery'
    }
  }

  // Scan mismatch + POD
  if (hasScanMismatch && hasPOD) {
    return {
      reason: 'Scan type mismatch - delivery confirmed via photo proof. Driver within geo fence, delivery successful.',
      notes: 'Scan type mismatch noted'
    }
  }

  // Multi-package + within geo
  if (isMultiPackage && withinGeo) {
    return {
      reason: 'Multi-package delivery within geo fence. GPS confirms driver at delivery location.',
      notes: `${row.simultaneousDeliveries} simultaneous deliveries`
    }
  }

  // Attended + no POD required
  if (isAttended && !hasPOD) {
    return {
      reason: 'Attended delivery to recipient, no POD required. GPS confirms delivery location within geo fence.',
      notes: ''
    }
  }

  // Default case - within geo but no POD (unattended)
  if (withinGeo && !hasPOD && isUnattended) {
    return {
      reason: 'MANUAL REVIEW REQUIRED - Unattended delivery within geo fence but no photo proof. Verify in Cortex.',
      notes: 'Missing POD for unattended delivery'
    }
  }

  // Fallback
  return {
    reason: 'Delivered within geo fence. GPS data supports successful delivery.',
    notes: ''
  }
}

export function processConcessionDisputes(rows: ConcessionRow[]): DisputeResult[] {
  return rows.map(row => {
    const priority = assignPriority(row)
    const { reason, notes } = generateDisputeReason(row)

    return {
      trackingId: row.trackingId,
      reason,
      priority,
      impactsDSB: row.impactsDSB === 1,
      driver: row.deliveryAssociateName,
      driverId: row.deliveryAssociate,
      deliveryType: row.deliveryType,
      withinGeoFence: row.deliveredOver50m === 0,
      hasPOD: row.noPOD === 0,
      notes
    }
  })
}

export function sortConcessionDisputes(disputes: DisputeResult[]): DisputeResult[] {
  return [...disputes].sort((a, b) => {
    // Sort by priority ascending (1 is highest priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    // Then by impacts DSB descending
    if (a.impactsDSB !== b.impactsDSB) {
      return a.impactsDSB ? -1 : 1
    }
    return 0
  })
}

export function detectRepeatDrivers(rows: ConcessionRow[]): RepeatDriver[] {
  const driverCounts = new Map<string, { name: string; count: number }>()

  for (const row of rows) {
    const existing = driverCounts.get(row.deliveryAssociate)
    if (existing) {
      existing.count++
    } else {
      driverCounts.set(row.deliveryAssociate, {
        name: row.deliveryAssociateName,
        count: 1
      })
    }
  }

  const repeatDrivers: RepeatDriver[] = []
  for (const [driverId, data] of driverCounts) {
    if (data.count >= 3) {
      repeatDrivers.push({
        name: data.name,
        driverId,
        concessionCount: data.count
      })
    }
  }

  return repeatDrivers.sort((a, b) => b.concessionCount - a.concessionCount)
}

export function buildConcessionSummary(
  rows: ConcessionRow[],
  disputes: DisputeResult[],
  station: string,
  week: string
): DisputeSummary {
  const tierCounts = {
    tier1: 0,
    tier2: 0,
    tier3: 0,
    tier4: 0
  }

  const reasonBreakdown: Record<string, number> = {}
  let manualReviewCount = 0

  for (const dispute of disputes) {
    // Count tiers
    tierCounts[`tier${dispute.priority}` as keyof typeof tierCounts]++

    // Count reasons
    const reasonKey = dispute.reason.includes('MANUAL REVIEW')
      ? 'Manual Review Required'
      : dispute.reason.substring(0, 50) + '...'
    reasonBreakdown[reasonKey] = (reasonBreakdown[reasonKey] || 0) + 1

    // Count manual reviews
    if (dispute.reason.includes('MANUAL REVIEW')) {
      manualReviewCount++
    }
  }

  return {
    totalConcessions: rows.length,
    impactsDSBCount: rows.filter(r => r.impactsDSB === 1).length,
    autoDisputedCount: disputes.length - manualReviewCount,
    manualReviewCount,
    tierCounts,
    repeatDrivers: detectRepeatDrivers(rows),
    reasonBreakdown,
    station,
    week
  }
}
