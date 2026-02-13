'use client'

import React from 'react'
import { DisputeCategory } from '@/types'

interface CategorySelectorProps {
  selected: DisputeCategory
  onChange: (category: DisputeCategory) => void
  disabled?: boolean
}

const categories: {
  id: DisputeCategory
  name: string
  description: string
  filePattern: string
  icon: React.ReactNode
  color: string
  badge?: { text: string; type: 'warning' | 'info' | 'success' }
  threshold?: string
}[] = [
  {
    id: 'concessions',
    name: 'Concessions (DSB)',
    description: 'Process delivery concession disputes that impact DSB score',
    filePattern: 'DSP_Delivery_Concessions_*.csv',
    color: 'red',
    badge: { text: 'Higher Priority', type: 'success' },
    threshold: 'Fantastic: 233 DPMO',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'feedback',
    name: 'Customer Feedback (CDF)',
    description: 'Dispute negative customer delivery feedback',
    filePattern: '*_Feedback_negative_*.csv',
    color: 'blue',
    threshold: 'Fantastic: 73+',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    id: 'rts',
    name: 'DCR/RTS',
    description: 'Most cases now auto-exempted by Amazon (March 2026)',
    filePattern: 'Quality_RTS_*.csv',
    color: 'amber',
    badge: { text: 'Mostly Auto-Exempted', type: 'warning' },
    threshold: 'Fantastic: 73+',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }
]

const colorClasses: Record<string, { bg: string; text: string; border: string; selectedBg: string }> = {
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/50',
    selectedBg: 'bg-red-500'
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
    selectedBg: 'bg-blue-500'
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/50',
    selectedBg: 'bg-amber-500'
  }
}

const badgeClasses: Record<string, string> = {
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
}

export function CategorySelector({ selected, onChange, disabled }: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      {/* March 2026 Update Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-amber-400 font-medium text-sm">Q1 2026 Scorecard Update (March 11)</p>
            <p className="text-neutral-400 text-xs mt-1">
              New thresholds: Fantastic 73+ (was 70), Fantastic Plus 88+ (was 85). DSB reduced to 233 DPMO.
              DCR &quot;Package Not on Van&quot; cases now auto-exempted.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => {
          const colors = colorClasses[category.color]
          const isSelected = selected === category.id

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              disabled={disabled}
              className={`
                relative p-6 rounded-2xl border-2 text-left transition-all overflow-hidden
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-neutral-600'}
                ${isSelected
                  ? `border-neutral-500 bg-neutral-900`
                  : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900'
                }
              `}
            >
              {/* Badge */}
              {category.badge && (
                <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClasses[category.badge.type]}`}>
                  {category.badge.text}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.badge ? 'mt-4' : ''} ${
                  isSelected ? colors.selectedBg + ' text-white' : colors.bg + ' ' + colors.text
                }`}>
                  {category.icon}
                </div>
                <div className="min-w-0">
                  <h3 className={`font-semibold text-base ${isSelected ? 'text-white' : 'text-neutral-200'}`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    {category.description}
                  </p>
                  {category.threshold && (
                    <p className="text-xs text-neutral-500 mt-2">
                      {category.threshold}
                    </p>
                  )}
                  <code className="text-xs text-amber-400 bg-neutral-800 px-2 py-1 rounded mt-2 inline-block max-w-full truncate">
                    {category.filePattern}
                  </code>
                </div>
                <div className={`
                  absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${isSelected
                    ? 'border-white bg-white'
                    : 'border-neutral-700'
                  }
                `}>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
