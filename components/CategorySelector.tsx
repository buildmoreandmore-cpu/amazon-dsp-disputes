'use client'

import { DisputeCategory } from '@/types'

interface CategorySelectorProps {
  selected: DisputeCategory
  onChange: (category: DisputeCategory) => void
  disabled?: boolean
}

const categories: { id: DisputeCategory; name: string; description: string; filePattern: string }[] = [
  {
    id: 'concessions',
    name: 'Concessions (DSB)',
    description: 'Process delivery concession disputes that impact DSB score',
    filePattern: 'DSP_Delivery_Concessions_*.csv'
  },
  {
    id: 'feedback',
    name: 'Customer Feedback (CDF)',
    description: 'Dispute negative customer delivery feedback',
    filePattern: 'DSP_Customer_Delivery_Feedback_negative_*.csv'
  },
  {
    id: 'rts',
    name: 'Delivery Completion (DCR/RTS)',
    description: 'Dispute returns that impact delivery completion rate',
    filePattern: 'Quality_RTS_*.csv'
  }
]

export function CategorySelector({ selected, onChange, disabled }: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Dispute Category
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            disabled={disabled}
            className={`
              relative p-4 rounded-lg border-2 text-left transition-all
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
              ${selected === category.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 bg-white'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm ${selected === category.id ? 'text-blue-700' : 'text-gray-900'}`}>
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {category.description}
                </p>
                <p className="text-xs text-gray-400 mt-2 font-mono truncate">
                  {category.filePattern}
                </p>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-auto
                ${selected === category.id
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                }
              `}>
                {selected === category.id && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
