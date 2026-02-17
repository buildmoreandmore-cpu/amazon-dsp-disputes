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
        <h2 className="text-lg font-semibold text-white">Concession Summary</h2>
        <div className="text-sm text-neutral-400">
          {summary.station} | {summary.week}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<FileWarningIcon className="w-5 h-5 text-neutral-400" />}
          iconBg="bg-neutral-800"
          value={summary.totalConcessions}
          label="Total Concessions"
        />
        <StatCard
          icon={<AlertTriangleIcon className="w-5 h-5 text-red-400" />}
          iconBg="bg-red-500/10"
          value={summary.impactsDSBCount}
          label="Impacts DSB"
          valueColor="text-red-400"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-5 h-5 text-green-400" />}
          iconBg="bg-green-500/10"
          value={summary.autoDisputedCount}
          label="Auto-Disputed"
          subtext={`${autoRate}% rate`}
          valueColor="text-green-400"
        />
        <StatCard
          icon={<UsersIcon className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-500/10"
          value={summary.manualReviewCount}
          label="Manual Review"
          valueColor="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.subCategoryCounts && Object.keys(summary.subCategoryCounts).length > 0 && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
            <h3 className="text-sm font-medium text-neutral-300 mb-4">DSB Sub-Categories</h3>
            <div className="space-y-3">
              {Object.entries(summary.subCategoryCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">{category}</span>
                    <span className="text-sm font-semibold text-red-400">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {summary.repeatDrivers.length > 0 && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
            <h3 className="text-sm font-medium text-neutral-300 mb-4">
              Repeat Drivers (3+ Concessions)
            </h3>
            <div className="space-y-3">
              {summary.repeatDrivers.slice(0, 5).map((driver) => (
                <div key={driver.driverId} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400 truncate" title={driver.name}>
                    {driver.name}
                  </span>
                  <span className="text-sm font-medium text-amber-400">
                    {driver.concessionCount}
                  </span>
                </div>
              ))}
              {summary.repeatDrivers.length > 5 && (
                <p className="text-xs text-neutral-500">
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
        <h2 className="text-lg font-semibold text-white">Customer Feedback Summary</h2>
        <div className="text-sm text-neutral-400">
          {summary.station} | {summary.week}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          icon={<FileWarningIcon className="w-5 h-5 text-neutral-400" />}
          iconBg="bg-neutral-800"
          value={summary.totalFeedback}
          label="Total Feedback"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-5 h-5 text-green-400" />}
          iconBg="bg-green-500/10"
          value={summary.autoDisputedCount}
          label="Auto-Disputed"
          subtext={`${autoRate}% rate`}
          valueColor="text-green-400"
        />
        <StatCard
          icon={<UsersIcon className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-500/10"
          value={summary.manualReviewCount}
          label="Manual Review"
          valueColor="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <h3 className="text-sm font-medium text-neutral-300 mb-4">Priority Tiers</h3>
          <div className="space-y-3">
            <TierRow label="Tier 1 (Wrong Address / Never Received)" value={summary.tierCounts.tier1} color="text-red-400" />
            <TierRow label="Tier 2 (Didn't Follow Instructions)" value={summary.tierCounts.tier2} color="text-green-400" />
            <TierRow label="Tier 3 (Manual Review)" value={summary.tierCounts.tier3} color="text-amber-400" />
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
          <h3 className="text-sm font-medium text-neutral-300 mb-4">Feedback Types</h3>
          <div className="space-y-3">
            {Object.entries(summary.feedbackTypeBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">{type}</span>
                  <span className="text-sm font-medium text-white">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {summary.repeatDrivers.length > 0 && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 md:col-span-2">
            <h3 className="text-sm font-medium text-neutral-300 mb-4">
              Repeat Drivers (3+ Feedback)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {summary.repeatDrivers.slice(0, 6).map((driver) => (
                <div key={driver.driverId} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400 truncate" title={driver.name}>
                    {driver.name}
                  </span>
                  <span className="text-sm font-medium text-amber-400">
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">DCR/RTS Summary</h2>
        <div className="text-sm text-neutral-400">
          {summary.station} | {summary.week}
        </div>
      </div>

      {/* High Confidence Alert Banner */}
      {summary.highConfidenceCount > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-green-400">
                {summary.highConfidenceCount} High-Confidence Disputes Ready
              </h3>
              <p className="text-sm text-green-300/70 mt-1">
                These are &quot;Package Not On Van&quot; cases that Amazon typically approves.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Low Confidence Warning */}
      {summary.lowConfidenceCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-400">
                {summary.lowConfidenceCount} Low-Confidence (Not Recommended)
              </h3>
              <p className="text-sm text-amber-300/70 mt-1">
                These are valid RTS scenarios that Amazon typically rejects (&lt;1% approval rate).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          icon={<FileWarningIcon className="w-5 h-5 text-neutral-400" />}
          iconBg="bg-neutral-800"
          value={summary.totalRTS}
          label="Total RTS"
        />
        <StatCard
          icon={<AlertTriangleIcon className="w-5 h-5 text-red-400" />}
          iconBg="bg-red-500/10"
          value={summary.impactsDCRCount}
          label="Impacts DCR"
          valueColor="text-red-400"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/10"
          value={summary.alreadyExemptedCount}
          label="Already Exempted"
          valueColor="text-blue-400"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-5 h-5 text-green-400" />}
          iconBg="bg-green-500/10"
          value={summary.highConfidenceCount}
          label="High Confidence"
          subtext="Recommended"
          valueColor="text-green-400"
        />
        <StatCard
          icon={<UsersIcon className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-500/10"
          value={summary.lowConfidenceCount}
          label="Low Confidence"
          subtext="Skip"
          valueColor="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* High Confidence Breakdown */}
        <div className="bg-neutral-900 rounded-xl border border-green-500/20 p-5">
          <h3 className="text-sm font-medium text-green-400 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            High-Confidence RTS Codes
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.highConfidenceBreakdown || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([code, count]) => (
                <div key={code} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">{code}</span>
                  <span className="text-sm font-medium text-green-400">{count}</span>
                </div>
              ))}
            {Object.keys(summary.highConfidenceBreakdown || {}).length === 0 && (
              <p className="text-sm text-neutral-500 italic">No high-confidence cases</p>
            )}
          </div>
        </div>

        {/* Low Confidence Breakdown */}
        <div className="bg-neutral-900 rounded-xl border border-amber-500/20 p-5">
          <h3 className="text-sm font-medium text-amber-400 mb-4 flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4" />
            Low-Confidence RTS Codes
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.lowConfidenceBreakdown || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([code, count]) => (
                <div key={code} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">{code}</span>
                  <span className="text-sm font-medium text-amber-400">{count}</span>
                </div>
              ))}
            {Object.keys(summary.lowConfidenceBreakdown || {}).length === 0 && (
              <p className="text-sm text-neutral-500 italic">No low-confidence cases</p>
            )}
          </div>
        </div>

        {summary.repeatDrivers.length > 0 && (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 md:col-span-2">
            <h3 className="text-sm font-medium text-neutral-300 mb-4">
              Repeat Drivers (3+ RTS)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {summary.repeatDrivers.slice(0, 6).map((driver) => (
                <div key={driver.driverId} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400 truncate" title={driver.name}>
                    {driver.name}
                  </span>
                  <span className="text-sm font-medium text-amber-400">
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
  subtext,
  valueColor = 'text-white'
}: {
  icon: React.ReactNode
  iconBg: string
  value: number
  label: string
  subtext?: string
  valueColor?: string
}) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          <p className="text-sm text-neutral-400 truncate">{label}</p>
          {subtext && <p className="text-xs text-neutral-500">{subtext}</p>}
        </div>
      </div>
    </div>
  )
}

// Reusable tier row
function TierRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-400">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}
