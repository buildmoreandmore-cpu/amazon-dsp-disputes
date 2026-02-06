'use client'

import { AlertTriangleIcon, CheckCircleIcon, FileWarningIcon, UsersIcon } from './Icons'
import type { DisputeSummary, FeedbackSummary, RTSSummary, DisputeCategory } from '@/types'

type AnySummary = DisputeSummary | FeedbackSummary | RTSSummary

interface StatsDashboardProps {
  summary: AnySummary
  category: DisputeCategory
}

// Type guards
function isConcessionSummary(summary: AnySummary): summary is DisputeSummary {
  return 'totalConcessions' in summary
}

function isFeedbackSummary(summary: AnySummary): summary is FeedbackSummary {
  return 'totalFeedback' in summary
}

function isRTSSummary(summary: AnySummary): summary is RTSSummary {
  return 'totalRTS' in summary
}

export function StatsDashboard({ summary, category }: StatsDashboardProps) {
  if (category === 'concessions' && isConcessionSummary(summary)) {
    return <ConcessionDashboard summary={summary} />
  }

  if (category === 'feedback' && isFeedbackSummary(summary)) {
    return <FeedbackDashboard summary={summary} />
  }

  if (category === 'rts' && isRTSSummary(summary)) {
    return <RTSDashboard summary={summary} />
  }

  return null
}

function ConcessionDashboard({ summary }: { summary: DisputeSummary }) {
  const autoRate = summary.totalConcessions > 0
    ? ((summary.autoDisputedCount / summary.totalConcessions) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Concession Summary</h2>
        <div className="text-sm text-gray-500">
          {summary.station} | {summary.week}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileWarningIcon className="w-5 h-5 text-gray-600" />}
          iconBg="bg-gray-100"
          value={summary.totalConcessions}
          label="Total Concessions"
        />
        <StatCard
          icon={<AlertTriangleIcon className="w-5 h-5 text-red-600" />}
          iconBg="bg-red-100"
          value={summary.impactsDSBCount}
          label="Impacts DSB"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
          value={summary.autoDisputedCount}
          label="Auto-Disputed"
          subtext={`${autoRate}% rate`}
        />
        <StatCard
          icon={<UsersIcon className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-100"
          value={summary.manualReviewCount}
          label="Manual Review"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Priority Tiers</h3>
          <div className="space-y-2">
            <TierRow label="Tier 1 (Impacts DSB)" value={summary.tierCounts.tier1} color="text-red-600" />
            <TierRow label="Tier 2 (Within Geo + POD)" value={summary.tierCounts.tier2} color="text-green-600" />
            <TierRow label="Tier 3 (Attended)" value={summary.tierCounts.tier3} color="text-blue-600" />
            <TierRow label="Tier 4 (Manual Review)" value={summary.tierCounts.tier4} color="text-amber-600" />
          </div>
        </div>

        {summary.repeatDrivers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Repeat Drivers (3+ Concessions)
            </h3>
            <div className="space-y-2">
              {summary.repeatDrivers.slice(0, 5).map((driver) => (
                <div key={driver.driverId} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate" title={driver.name}>
                    {driver.name}
                  </span>
                  <span className="text-sm font-medium text-amber-600">
                    {driver.concessionCount}
                  </span>
                </div>
              ))}
              {summary.repeatDrivers.length > 5 && (
                <p className="text-xs text-gray-400">
                  +{summary.repeatDrivers.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FeedbackDashboard({ summary }: { summary: FeedbackSummary }) {
  const autoRate = summary.totalFeedback > 0
    ? ((summary.autoDisputedCount / summary.totalFeedback) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Customer Feedback Summary</h2>
        <div className="text-sm text-gray-500">
          {summary.station} | {summary.week}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={<FileWarningIcon className="w-5 h-5 text-gray-600" />}
          iconBg="bg-gray-100"
          value={summary.totalFeedback}
          label="Total Feedback"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
          value={summary.autoDisputedCount}
          label="Auto-Disputed"
          subtext={`${autoRate}% rate`}
        />
        <StatCard
          icon={<UsersIcon className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-100"
          value={summary.manualReviewCount}
          label="Manual Review"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Priority Tiers</h3>
          <div className="space-y-2">
            <TierRow label="Tier 1 (Wrong Address / Never Received)" value={summary.tierCounts.tier1} color="text-red-600" />
            <TierRow label="Tier 2 (Didn't Follow Instructions)" value={summary.tierCounts.tier2} color="text-green-600" />
            <TierRow label="Tier 3 (Manual Review)" value={summary.tierCounts.tier3} color="text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback Types</h3>
          <div className="space-y-2">
            {Object.entries(summary.feedbackTypeBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{type}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {summary.repeatDrivers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Repeat Drivers (3+ Feedback)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {summary.repeatDrivers.slice(0, 6).map((driver) => (
                <div key={driver.driverId} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate" title={driver.name}>
                    {driver.name}
                  </span>
                  <span className="text-sm font-medium text-amber-600">
                    {driver.feedbackCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RTSDashboard({ summary }: { summary: RTSSummary }) {
  const disputeableCount = summary.autoDisputedCount + summary.manualReviewCount
  const autoRate = disputeableCount > 0
    ? ((summary.autoDisputedCount / disputeableCount) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">DCR/RTS Summary</h2>
        <div className="text-sm text-gray-500">
          {summary.station} | {summary.week}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<FileWarningIcon className="w-5 h-5 text-gray-600" />}
          iconBg="bg-gray-100"
          value={summary.totalRTS}
          label="Total RTS"
        />
        <StatCard
          icon={<AlertTriangleIcon className="w-5 h-5 text-red-600" />}
          iconBg="bg-red-100"
          value={summary.impactsDCRCount}
          label="Impacts DCR"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
          value={summary.alreadyExemptedCount}
          label="Already Exempted"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
          value={summary.autoDisputedCount}
          label="Auto-Disputed"
          subtext={`${autoRate}% rate`}
        />
        <StatCard
          icon={<UsersIcon className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-100"
          value={summary.manualReviewCount}
          label="Manual Review"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Priority Tiers</h3>
          <div className="space-y-2">
            <TierRow label="Tier 1 (Business Closed / No Locker)" value={summary.tierCounts.tier1} color="text-red-600" />
            <TierRow label="Tier 2 (Out of Delivery Time)" value={summary.tierCounts.tier2} color="text-green-600" />
            <TierRow label="Tier 3 (Manual Review)" value={summary.tierCounts.tier3} color="text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">RTS Codes</h3>
          <div className="space-y-2">
            {Object.entries(summary.rtsCodeBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([code, count]) => (
                <div key={code} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{code}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {summary.repeatDrivers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Repeat Drivers (3+ RTS)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {summary.repeatDrivers.slice(0, 6).map((driver) => (
                <div key={driver.driverId} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate" title={driver.name}>
                    {driver.name}
                  </span>
                  <span className="text-sm font-medium text-amber-600">
                    {driver.rtsCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable stat card
function StatCard({
  icon,
  iconBg,
  value,
  label,
  subtext
}: {
  icon: React.ReactNode
  iconBg: string
  value: number
  label: string
  subtext?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
        </div>
      </div>
    </div>
  )
}

// Reusable tier row
function TierRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-medium ${color}`}>{value}</span>
    </div>
  )
}
