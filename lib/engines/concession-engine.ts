import type { ConcessionRow, ConcessionSubCategory, DisputeResult, DisputeSummary, RepeatDriver } from '@/types'

/**
 * Classify the concession into a sub-category based on the row flags.
 * Checked in order of specificity — first match wins.
 */
export function classifySubCategory(row: ConcessionRow): ConcessionSubCategory {
  if (row.scannedNotDelivered === 1) return 'Scanned - Not Delivered - Not Returned'
  if (row.incorrectScanAttended === 1) return 'Incorrect Scan Usage - Attended Delivery'
  if (row.incorrectScanUnattended === 1) return 'Incorrect Scan Usage - Unattended Delivery'
  if (row.deliveredOver50m === 1) return 'Delivered > 50m'
  if (row.noPOD === 1) return 'No POD on Delivery'
  if (row.simultaneousDeliveries > 1) return 'Simultaneous Deliveries'
  return 'Other'
}

export function generateDisputeReason(row: ConcessionRow): { reason: string; notes: string } {
  const withinGeo = row.deliveredOver50m === 0
  const hasPOD = row.noPOD === 0
  const isAttended = row.deliveryType === 'Attended'
  const isUnattended = row.deliveryType === 'Unattended'
  const scannedNotDelivered = row.scannedNotDelivered === 1
  const isMultiPackage = row.simultaneousDeliveries > 1

  // Scanned not delivered
  if (scannedNotDelivered) {
    return {
      reason: 'MANUAL REVIEW REQUIRED - Package status anomaly. Verify delivery status in Cortex.',
      notes: 'Scanned but marked not delivered - verify in Cortex'
    }
  }

  // Outside geo fence
  if (!withinGeo) {
    return {
      reason: 'MANUAL REVIEW REQUIRED - Delivered outside 50m geo fence. Check Cortex for additional delivery context.',
      notes: 'Requires manual Cortex verification'
    }
  }

  // Incorrect scan - Attended
  if (row.incorrectScanAttended === 1 && hasPOD) {
    return {
      reason: 'Scan type mismatch on attended delivery - delivery confirmed via photo proof. Driver within geo fence.',
      notes: 'Incorrect scan type - attended'
    }
  }

  // Incorrect scan - Unattended
  if (row.incorrectScanUnattended === 1 && hasPOD) {
    return {
      reason: 'Scan type mismatch on unattended delivery - delivery confirmed via photo proof. Driver within geo fence.',
      notes: 'Incorrect scan type - unattended'
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

  // Multi-package + within geo
  if (isMultiPackage && withinGeo) {
    return {
      reason: 'Multi-package delivery within geo fence. GPS confirms driver at delivery location.',
      notes: `${row.simultaneousDeliveries} simultaneous deliveries`
    }
  }

  // No POD on unattended
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
  // Only process rows that impact DSB
  const dsbRows = rows.filter(row => row.impactsDSB === 1)

  return dsbRows.map(row => {
    const subCategory = classifySubCategory(row)
    const { reason, notes } = generateDisputeReason(row)

    return {
      trackingId: row.trackingId,
      reason,
      subCategory,
      impactsDSB: true,
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
    // Sort by sub-category alphabetically, then by driver name
    const catCmp = a.subCategory.localeCompare(b.subCategory)
    if (catCmp !== 0) return catCmp
    return a.driver.localeCompare(b.driver)
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
    if (data.count >= 2) {
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
  const subCategoryCounts: Record<ConcessionSubCategory, number> = {
    'Simultaneous Deliveries': 0,
    'Delivered > 50m': 0,
    'Incorrect Scan Usage - Attended Delivery': 0,
    'Incorrect Scan Usage - Unattended Delivery': 0,
    'No POD on Delivery': 0,
    'Scanned - Not Delivered - Not Returned': 0,
    'Other': 0,
  }

  const reasonBreakdown: Record<string, number> = {}
  let manualReviewCount = 0

  for (const dispute of disputes) {
    // Count sub-categories
    subCategoryCounts[dispute.subCategory]++

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
    impactsDSBCount: disputes.length,
    autoDisputedCount: disputes.length - manualReviewCount,
    manualReviewCount,
    subCategoryCounts,
    repeatDrivers: detectRepeatDrivers(rows.filter(r => r.impactsDSB === 1)),
    reasonBreakdown,
    station,
    week
  }
}
