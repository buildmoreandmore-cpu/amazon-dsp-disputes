import type { FeedbackRow, FeedbackDispute, FeedbackSummary, FeedbackRepeatDriver } from '@/types'

// Determine the primary feedback type from flags
export function getFeedbackType(row: FeedbackRow): string {
  if (row.wrongAddress) return 'Wrong Address'
  if (row.neverReceived) return 'Never Received'
  if (row.didNotFollowInstructions) return 'Didn\'t Follow Instructions'
  if (row.mishandledPackage) return 'Mishandled Package'
  if (row.unprofessional) return 'Unprofessional'
  if (row.wrongItem) return 'Wrong Item'
  return 'Unknown'
}

// Assign priority tier based on feedback type
export function assignFeedbackPriority(feedbackType: string): 1 | 2 | 3 {
  // Tier 1: Highest dispute success rate
  if (feedbackType === 'Wrong Address' || feedbackType === 'Never Received') {
    return 1
  }

  // Tier 2: Medium success rate
  if (feedbackType === 'Didn\'t Follow Instructions') {
    return 2
  }

  // Tier 3: Manual review required
  return 3
}

// Generate dispute reason based on feedback type
export function generateFeedbackDisputeReason(feedbackType: string): { reason: string; requiresManualReview: boolean } {
  switch (feedbackType) {
    case 'Wrong Address':
      return {
        reason: 'GPS confirms delivery within customer\'s geo fence. Photo proof shows correct delivery location. Customer address data may have been outdated.',
        requiresManualReview: false
      }

    case 'Never Received':
      return {
        reason: 'Delivery confirmed via GPS within geo fence. Photo proof documents package placement at delivery location.',
        requiresManualReview: false
      }

    case 'Didn\'t Follow Instructions':
      return {
        reason: 'Driver delivered within geo fence per GPS. Delivery instructions may not have been visible in app or conflicted with safe delivery location.',
        requiresManualReview: false
      }

    case 'Mishandled Package':
      return {
        reason: 'MANUAL REVIEW - Check delivery video if available. Verify package condition at delivery.',
        requiresManualReview: true
      }

    case 'Unprofessional':
      return {
        reason: 'MANUAL REVIEW - Check delivery video and customer notes for context.',
        requiresManualReview: true
      }

    case 'Wrong Item':
      return {
        reason: 'MANUAL REVIEW - This is a fulfillment issue, not delivery. Driver delivered package as assigned.',
        requiresManualReview: true
      }

    default:
      return {
        reason: 'MANUAL REVIEW - Unable to categorize feedback type. Review delivery details.',
        requiresManualReview: true
      }
  }
}

export function processFeedbackDisputes(rows: FeedbackRow[]): FeedbackDispute[] {
  return rows.map(row => {
    const feedbackType = getFeedbackType(row)
    const priority = assignFeedbackPriority(feedbackType)
    const { reason, requiresManualReview } = generateFeedbackDisputeReason(feedbackType)

    return {
      trackingId: row.trackingId,
      driver: row.deliveryAssociateName,
      driverId: row.deliveryAssociate,
      feedbackType,
      feedbackDetails: row.feedbackDetails,
      reason,
      priority,
      deliveryDate: row.deliveryDate,
      requiresManualReview
    }
  })
}

export function sortFeedbackDisputes(disputes: FeedbackDispute[]): FeedbackDispute[] {
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

export function detectFeedbackRepeatDrivers(rows: FeedbackRow[]): FeedbackRepeatDriver[] {
  const driverCounts = new Map<string, { name: string; count: number }>()

  for (const row of rows) {
    const driverId = row.deliveryAssociate
    const existing = driverCounts.get(driverId)
    if (existing) {
      existing.count++
    } else {
      driverCounts.set(driverId, {
        name: row.deliveryAssociateName,
        count: 1
      })
    }
  }

  const repeatDrivers: FeedbackRepeatDriver[] = []
  for (const [driverId, data] of driverCounts) {
    if (data.count >= 3) {
      repeatDrivers.push({
        name: data.name,
        driverId,
        feedbackCount: data.count
      })
    }
  }

  return repeatDrivers.sort((a, b) => b.feedbackCount - a.feedbackCount)
}

export function buildFeedbackSummary(
  rows: FeedbackRow[],
  disputes: FeedbackDispute[],
  station: string,
  week: string
): FeedbackSummary {
  const tierCounts = {
    tier1: 0,
    tier2: 0,
    tier3: 0
  }

  const feedbackTypeBreakdown: Record<string, number> = {}
  let manualReviewCount = 0

  for (const dispute of disputes) {
    // Count tiers
    tierCounts[`tier${dispute.priority}` as keyof typeof tierCounts]++

    // Count feedback types
    feedbackTypeBreakdown[dispute.feedbackType] = (feedbackTypeBreakdown[dispute.feedbackType] || 0) + 1

    // Count manual reviews
    if (dispute.requiresManualReview) {
      manualReviewCount++
    }
  }

  return {
    totalFeedback: rows.length,
    autoDisputedCount: disputes.length - manualReviewCount,
    manualReviewCount,
    tierCounts,
    feedbackTypeBreakdown,
    repeatDrivers: detectFeedbackRepeatDrivers(rows),
    station,
    week
  }
}
