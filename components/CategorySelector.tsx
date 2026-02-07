'use client'

import React from 'react'
import { DisputeCategory } from '@/types'

interface CategorySelectorProps {
  selected: DisputeCategory
  onChange: (category: DisputeCategory) => void
  disabled?: boolean
}

const categories: { id: DisputeCategory; name: string; description: string; filePattern: string; icon: React.ReactNode }[] = [
  {
    id: 'concessions',
    name: 'Concessions (DSB)',
    description: 'Process delivery concession disputes that impact DSB score',
    filePattern: 'DSP_Delivery_Concessions_*.csv',
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
    filePattern: 'DSP_Customer_Delivery_Feedback_negative_*.csv',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    id: 'rts',
    name: 'Delivery Completion (DCR/RTS)',
    description: 'Dispute returns that impact delivery completion rate',
    filePattern: 'Quality_RTS_*.csv',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }
]

export function CategorySelector({ selected, onChange, disabled }: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            disabled={disabled}
            className={`
              relative p-6 rounded-2xl border-2 text-left transition-all
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-amber-400 hover:shadow-lg'}
              ${selected === category.id
                ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10'
                : 'border-slate-200 bg-white'
              }
            `}
          >
            <div className="flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selected === category.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-base ${selected === category.id ? 'text-amber-700' : 'text-slate-900'}`}>
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {category.description}
                </p>
                <p className="text-xs text-slate-400 mt-3 font-mono bg-slate-50 px-2 py-1 rounded inline-block">
                  {category.filePattern}
                </p>
              </div>
              <div className={`
                absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${selected === category.id
                  ? 'border-amber-500 bg-amber-500'
                  : 'border-slate-300'
                }
              `}>
                {selected === category.id && (
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
