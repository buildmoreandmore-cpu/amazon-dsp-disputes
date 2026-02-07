'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileUpload } from '@/components/FileUpload'
import { StatsDashboard } from '@/components/StatsDashboard'
import { DisputePreview } from '@/components/DisputePreview'
import { DownloadButtons } from '@/components/DownloadButtons'
import { CategorySelector } from '@/components/CategorySelector'
import { TruckIcon, ChevronLeftIcon } from '@/components/Icons'
import type {
  DisputeCategory,
  DisputeResult,
  DisputeSummary,
  FeedbackDispute,
  FeedbackSummary,
  RTSDispute,
  RTSSummary
} from '@/types'

type Step = 'category' | 'upload' | 'preview' | 'download'

// Union type for all dispute types
type AnyDispute = DisputeResult | FeedbackDispute | RTSDispute
type AnySummary = DisputeSummary | FeedbackSummary | RTSSummary

export default function ToolPage() {
  const [step, setStep] = useState<Step>('category')
  const [category, setCategory] = useState<DisputeCategory>('concessions')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disputes, setDisputes] = useState<AnyDispute[]>([])
  const [summary, setSummary] = useState<AnySummary | null>(null)
  const [xlsxBase64, setXlsxBase64] = useState<string>('')
  const [markdownSummary, setMarkdownSummary] = useState<string>('')
  const [outputFilename, setOutputFilename] = useState<string>('')

  const getApiEndpoint = (cat: DisputeCategory): string => {
    const endpoints: Record<DisputeCategory, string> = {
      concessions: '/api/process-concessions',
      feedback: '/api/process-feedback',
      rts: '/api/process-rts'
    }
    return endpoints[cat]
  }

  const getCategoryLabel = (cat: DisputeCategory): string => {
    const labels: Record<DisputeCategory, string> = {
      concessions: 'Concessions (DSB)',
      feedback: 'Customer Feedback (CDF)',
      rts: 'Delivery Completion (DCR/RTS)'
    }
    return labels[cat]
  }

  const handleCategorySelect = (cat: DisputeCategory) => {
    setCategory(cat)
  }

  const handleContinueToUpload = () => {
    setStep('upload')
  }

  const handleFileSelect = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(getApiEndpoint(category), {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!result.success || !result.data) {
        setError(result.error || 'An error occurred while processing the file')
        setIsLoading(false)
        return
      }

      setDisputes(result.data.disputes)
      setSummary(result.data.summary)
      setXlsxBase64(result.data.xlsxBase64)
      setMarkdownSummary(result.data.markdownSummary)
      setOutputFilename(result.data.outputFilename)
      setStep('preview')
    } catch (err) {
      setError('Failed to process file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStep('category')
    setDisputes([])
    setSummary(null)
    setXlsxBase64('')
    setMarkdownSummary('')
    setOutputFilename('')
    setError(null)
  }

  const handleBackToUpload = () => {
    setStep('upload')
    setDisputes([])
    setSummary(null)
    setXlsxBase64('')
    setMarkdownSummary('')
    setOutputFilename('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Tool Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <TruckIcon className="w-6 h-6 text-amber-500" />
              <span className="font-semibold text-slate-900">DSP Dispute Tool</span>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
            <StepIndicator
              step={1}
              label="Category"
              active={step === 'category'}
              completed={step !== 'category'}
            />
            <StepConnector completed={step !== 'category'} />
            <StepIndicator
              step={2}
              label="Upload"
              active={step === 'upload'}
              completed={step === 'preview' || step === 'download'}
            />
            <StepConnector completed={step === 'preview' || step === 'download'} />
            <StepIndicator
              step={3}
              label="Review"
              active={step === 'preview'}
              completed={step === 'download'}
            />
            <StepConnector completed={step === 'download'} />
            <StepIndicator
              step={4}
              label="Download"
              active={step === 'download'}
              completed={false}
            />
          </div>

          {step === 'category' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Select Dispute Category
                </h1>
                <p className="text-slate-600">
                  Choose the type of disputes you want to process
                </p>
              </div>
              <CategorySelector
                selected={category}
                onChange={handleCategorySelect}
              />
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleContinueToUpload}
                  className="px-8 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
                >
                  Continue to Upload
                </button>
              </div>
            </div>
          )}

          {step === 'upload' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Upload Your CSV File
                </h1>
                <p className="text-slate-600">
                  Drop your Amazon report file to generate disputes
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-sm text-amber-800">
                  Processing: <span className="font-semibold">{getCategoryLabel(category)}</span>
                </p>
                <button
                  onClick={() => setStep('category')}
                  className="text-sm text-amber-600 hover:text-amber-800 underline mt-1"
                >
                  Change category
                </button>
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
                error={error}
              />
            </div>
          )}

          {step === 'preview' && summary && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Review Your Disputes
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                  <span className="text-sm text-amber-800 font-medium">{getCategoryLabel(category)}</span>
                </div>
              </div>
              <StatsDashboard summary={summary} category={category} />
              <DisputePreview disputes={disputes} category={category} />

              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <button
                  onClick={handleBackToUpload}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
                >
                  Upload a different file
                </button>
                <button
                  onClick={() => setStep('download')}
                  className="px-8 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
                >
                  Continue to Download
                </button>
              </div>
            </div>
          )}

          {step === 'download' && summary && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Download Your Files
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <span className="text-sm text-green-800 font-medium">Ready for download</span>
                </div>
              </div>
              <StatsDashboard summary={summary} category={category} />
              <DownloadButtons
                xlsxBase64={xlsxBase64}
                markdownSummary={markdownSummary}
                outputFilename={outputFilename}
              />

              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
                >
                  Process another file
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StepIndicator({
  step,
  label,
  active,
  completed
}: {
  step: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
          active
            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
            : completed
              ? 'bg-green-500 text-white'
              : 'bg-slate-200 text-slate-500'
        }`}
      >
        {completed ? '✓' : step}
      </div>
      <span
        className={`text-sm font-medium hidden sm:block ${
          active ? 'text-amber-600' : completed ? 'text-green-600' : 'text-slate-500'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function StepConnector({ completed }: { completed: boolean }) {
  return (
    <div className={`w-8 sm:w-12 h-0.5 transition-colors ${completed ? 'bg-green-500' : 'bg-slate-300'}`} />
  )
}
