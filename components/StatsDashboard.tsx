'use client'

import { AlertTriangle, CheckCircle, FileWarning, Users } from 'lucide-react'
import type { DisputeSummary } from '@/types'

interface StatsDashboardProps {
  summary: DisputeSummary
}

export function StatsDashboard({ summary }: StatsDashboardProps) {
  const autoRate = summary.totalConcessions > 0
    ? ((summary.autoDisputedCount / summary.totalConcessions) * 100).toFixed(1)
    : '0.0'

  const stats = [
    {
      label: 'Total Concessions',
      value: summary.totalConcessions,
      icon: FileWarning,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    {
      label: 'Impacts DSB',
      value: summary.impactsDSBCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Auto-Disputed',
      value: summary.autoDisputedCount,
      subtext: `${autoRate}% rate`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Manual Review',
      value: summary.manualReviewCount,
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
        <div className="text-sm text-gray-500">
          {summary.station} | {summary.week}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {stat.subtext && (
                  <p className="text-xs text-gray-400">{stat.subtext}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Priority Tiers</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tier 1 (Impacts DSB)</span>
              <span className="text-sm font-medium text-red-600">{summary.tierCounts.tier1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tier 2 (Within Geo + POD)</span>
              <span className="text-sm font-medium text-green-600">{summary.tierCounts.tier2}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tier 3 (Attended)</span>
              <span className="text-sm font-medium text-blue-600">{summary.tierCounts.tier3}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tier 4 (Manual Review)</span>
              <span className="text-sm font-medium text-amber-600">{summary.tierCounts.tier4}</span>
            </div>
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
