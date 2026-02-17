'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'
import clsx from 'clsx'
import type { DisputeResult, FeedbackDispute, RTSDispute, DisputeCategory } from '@/types'

type AnyDispute = DisputeResult | FeedbackDispute | RTSDispute

interface DisputePreviewProps {
  disputes: AnyDispute[]
  category: DisputeCategory
}

const ITEMS_PER_PAGE = 10

// Type guards
function isConcessionDispute(dispute: AnyDispute): dispute is DisputeResult {
  return 'impactsDSB' in dispute
}

function isFeedbackDispute(dispute: AnyDispute): dispute is FeedbackDispute {
  return 'feedbackType' in dispute
}

function isRTSDispute(dispute: AnyDispute): dispute is RTSDispute {
  return 'rtsCode' in dispute
}

export function DisputePreview({ disputes, category }: DisputePreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(disputes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentDisputes = disputes.slice(startIndex, endIndex)

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-500/20 text-red-400 border border-red-500/30'
      case 2:
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 3:
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 4:
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      default:
        return 'bg-neutral-700 text-neutral-300 border border-neutral-600'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Dispute Preview <span className="text-neutral-400 font-normal">({disputes.length} total)</span>
        </h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 text-neutral-300" />
            </button>
            <span className="text-sm text-neutral-400 min-w-[80px] text-center">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4 text-neutral-300" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          {category === 'concessions' && (
            <ConcessionTable
              disputes={currentDisputes.filter(isConcessionDispute)}
              getPriorityColor={getPriorityColor}
            />
          )}
          {category === 'feedback' && (
            <FeedbackTable
              disputes={currentDisputes.filter(isFeedbackDispute)}
              getPriorityColor={getPriorityColor}
            />
          )}
          {category === 'rts' && (
            <RTSTable
              disputes={currentDisputes.filter(isRTSDispute)}
              getPriorityColor={getPriorityColor}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ConcessionTable({
  disputes,
}: {
  disputes: DisputeResult[]
  getPriorityColor: (p: number) => string
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-neutral-800">
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Tracking ID
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Driver
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Impacts DSB
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider max-w-md">
            Reason
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-800">
        {disputes.map((dispute, idx) => (
          <tr key={`${dispute.trackingId}-${idx}`} className="hover:bg-neutral-800/50 transition-colors">
            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-200 font-mono">
              {dispute.trackingId}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-400">
              <div className="truncate max-w-[140px]" title={dispute.driver}>
                {dispute.driver}
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-400">
              {dispute.deliveryType}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">
              <span className="text-red-400 font-medium">Yes</span>
            </td>
            <td className="px-4 py-3 text-sm text-neutral-400">
              <div className="max-w-md truncate" title={dispute.reason}>
                {dispute.reason}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function FeedbackTable({
  disputes,
  getPriorityColor
}: {
  disputes: FeedbackDispute[]
  getPriorityColor: (p: number) => string
}) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  return (
    <div className="divide-y divide-neutral-800">
      {disputes.map((dispute, idx) => (
        <div
          key={`${dispute.trackingId}-${idx}`}
          className="hover:bg-neutral-800/30 transition-colors cursor-pointer"
          onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
        >
          {/* Summary row — always visible */}
          <div className="px-4 py-3 flex items-start gap-3">
            <span
              className={clsx(
                'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 mt-0.5',
                getPriorityColor(dispute.priority)
              )}
            >
              Tier {dispute.priority}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-neutral-200 font-mono">{dispute.trackingId}</span>
                <span className="text-neutral-400">{dispute.driver}</span>
                <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded text-xs">{dispute.feedbackType}</span>
              </div>
              <p className="text-sm text-neutral-400 mt-1">{dispute.feedbackDetails || '-'}</p>
              <p className="text-sm text-neutral-500 mt-1">
                {dispute.reason}
              </p>
              {dispute.additionalEvidence && (
                <p className="text-xs text-emerald-500 mt-1">
                  {dispute.additionalEvidence}
                </p>
              )}
            </div>
            <svg
              className={clsx(
                'w-4 h-4 text-neutral-600 flex-shrink-0 mt-1 transition-transform',
                expandedRow === idx && 'rotate-180'
              )}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Expanded details */}
          {expandedRow === idx && (
            <div className="px-4 pb-4 pl-[4.5rem] space-y-2">
              {dispute.address && (
                <div className="text-sm">
                  <span className="text-neutral-600 text-xs uppercase tracking-wider">Address</span>
                  <p className="text-neutral-400">{dispute.address}</p>
                </div>
              )}
              {dispute.customerNotes && (
                <div className="text-sm">
                  <span className="text-neutral-600 text-xs uppercase tracking-wider">Customer Notes</span>
                  <p className="text-neutral-400">{dispute.customerNotes}</p>
                </div>
              )}
              <div className="text-sm">
                <span className="text-neutral-600 text-xs uppercase tracking-wider">Full Dispute Reason</span>
                <p className="text-neutral-300">{dispute.reason}</p>
              </div>
              {dispute.additionalEvidence && (
                <div className="text-sm">
                  <span className="text-emerald-600 text-xs uppercase tracking-wider">DCM Evidence</span>
                  <p className="text-emerald-400">{dispute.additionalEvidence}</p>
                </div>
              )}
              {dispute.requiresManualReview && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-400">
                  Requires manual review
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function RTSTable({
  disputes,
  getPriorityColor
}: {
  disputes: RTSDispute[]
  getPriorityColor: (p: number) => string
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-neutral-800">
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Priority
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Tracking ID
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Driver
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
            RTS Code
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Date
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider max-w-md">
            Dispute Reason
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-800">
        {disputes.map((dispute, idx) => (
          <tr key={`${dispute.trackingId}-${idx}`} className="hover:bg-neutral-800/50 transition-colors">
            <td className="px-4 py-3 whitespace-nowrap">
              <span
                className={clsx(
                  'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium',
                  getPriorityColor(dispute.priority)
                )}
              >
                Tier {dispute.priority}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-200 font-mono">
              {dispute.trackingId}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-400">
              <div className="truncate max-w-[140px]" title={dispute.driver}>
                {dispute.driver}
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-400">
              {dispute.rtsCode}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-400">
              {dispute.plannedDate}
            </td>
            <td className="px-4 py-3 text-sm text-neutral-400">
              <div className="max-w-md truncate" title={dispute.reason}>
                {dispute.reason}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
