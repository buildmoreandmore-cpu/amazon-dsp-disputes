'use client'

import { useEffect, useState } from 'react'
import { DatabaseIcon, LightbulbIcon, LoaderIcon } from './Icons'
import type { EvidenceStats } from '@/types/evidence'

interface EvidenceStatsProps {
  refreshTrigger?: number
}

export function EvidenceStats({ refreshTrigger }: EvidenceStatsProps) {
  const [stats, setStats] = useState<EvidenceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/evidence/stats')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stats')
      }

      setStats(data.stats)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderIcon className="w-8 h-8 text-neutral-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!stats) return null

  const isEmpty = stats.totalEntries === 0

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="flex items-center gap-2 mb-1">
            <DatabaseIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Evidence Entries</span>
          </div>
          <p className="text-2xl font-bold text-neutral-100">{stats.totalEntries}</p>
          <div className="mt-2 flex gap-3 text-xs text-neutral-500">
            <span>C: {stats.entriesByType.concession}</span>
            <span>F: {stats.entriesByType.feedback}</span>
            <span>R: {stats.entriesByType.rts}</span>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="flex items-center gap-2 mb-1">
            <LightbulbIcon className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Patterns Learned</span>
          </div>
          <p className="text-2xl font-bold text-neutral-100">{stats.totalPatterns}</p>
          <div className="mt-2 flex gap-3 text-xs text-neutral-500">
            <span>C: {stats.patternsByType.concession}</span>
            <span>F: {stats.patternsByType.feedback}</span>
            <span>R: {stats.patternsByType.rts}</span>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-neutral-900/50 rounded-lg p-6 text-center border border-neutral-800">
          <p className="text-neutral-400">No evidence has been uploaded yet.</p>
          <p className="text-sm text-neutral-500 mt-1">
            Upload your first completed XLSX to start building the knowledge base.
          </p>
        </div>
      ) : (
        <>
          {/* Top patterns */}
          {stats.topPatterns.length > 0 && (
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800">
                <h3 className="text-sm font-medium text-neutral-300">Top Patterns</h3>
              </div>
              <div className="divide-y divide-neutral-800">
                {stats.topPatterns.slice(0, 5).map((pattern) => (
                  <div key={pattern.patternKey} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-neutral-500">
                        {pattern.patternKey}
                      </span>
                      <span className="text-xs text-emerald-500">
                        {pattern.usageCount} uses
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 line-clamp-2">
                      {pattern.evidenceTemplate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent entries */}
          {stats.recentEntries.length > 0 && (
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800">
                <h3 className="text-sm font-medium text-neutral-300">Recent Entries</h3>
              </div>
              <div className="divide-y divide-neutral-800">
                {stats.recentEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-neutral-500">
                        {entry.trackingId}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        entry.disputeType === 'concession'
                          ? 'bg-red-500/20 text-red-400'
                          : entry.disputeType === 'feedback'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {entry.disputeType}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 line-clamp-2">
                      {entry.evidenceText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
