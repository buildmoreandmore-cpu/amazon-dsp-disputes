'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileUpload } from '@/components/FileUpload'
import { StatsDashboard } from '@/components/StatsDashboard'
import { DisputePreview } from '@/components/DisputePreview'
import { DownloadButtons } from '@/components/DownloadButtons'
import { CategorySelector } from '@/components/CategorySelector'
import { ChevronLeftIcon } from '@/components/Icons'
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
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Dot Grid Background */}
      <div
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Tool Header */}
      <header className="relative z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Dispute Desk</span>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="relative z-10 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
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
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                  Select Dispute Category
                </h1>
                <p className="text-neutral-400">
                  Choose the type of disputes you want to process
                </p>
              </div>
              <CategorySelector
                selected={category}
                onChange={handleCategorySelect}
              />
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleContinueToUpload}
                  className="px-8 py-3 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors font-semibold"
                >
                  Continue to Upload
                </button>
              </div>
            </div>
          )}

          {step === 'upload' && (
            <div className="max-w-xl mx-auto space-y-8">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                  Upload Your CSV File
                </h1>
                <p className="text-neutral-400">
                  Drop your Amazon report file to generate disputes
                </p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
                <p className="text-sm text-neutral-300">
                  Processing: <span className="font-semibold text-white">{getCategoryLabel(category)}</span>
                </p>
                <button
                  onClick={() => setStep('category')}
                  className="text-sm text-neutral-400 hover:text-white underline mt-1"
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
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                  Review Your Disputes
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full">
                  <span className="text-sm text-neutral-300">{getCategoryLabel(category)}</span>
                </div>
              </div>
              <StatsDashboard summary={summary} category={category} />
              <DisputePreview disputes={disputes} category={category} />

              <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
                <button
                  onClick={handleBackToUpload}
                  className="px-4 py-2 text-neutral-400 hover:text-white transition-colors font-medium"
                >
                  Upload a different file
                </button>
                <button
                  onClick={() => setStep('download')}
                  className="px-8 py-3 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors font-semibold"
                >
                  Continue to Download
                </button>
              </div>
            </div>
          )}

          {step === 'download' && summary && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                  Download Your Files
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-400 font-medium">Ready for download</span>
                </div>
              </div>
              <StatsDashboard summary={summary} category={category} />
              <DownloadButtons
                xlsxBase64={xlsxBase64}
                markdownSummary={markdownSummary}
                outputFilename={outputFilename}
              />

              <div className="pt-6 border-t border-neutral-800">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-neutral-400 hover:text-white transition-colors font-medium"
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
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all border-2 ${
          active
            ? 'bg-white text-black border-white'
            : completed
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-transparent text-neutral-500 border-neutral-700'
        }`}
      >
        {completed ? '✓' : step}
      </div>
      <span
        className={`text-sm font-medium hidden sm:block ${
          active ? 'text-white' : completed ? 'text-green-400' : 'text-neutral-500'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function StepConnector({ completed }: { completed: boolean }) {
  return (
    <div className={`w-8 sm:w-12 h-0.5 transition-colors ${completed ? 'bg-green-500' : 'bg-neutral-800'}`} />
  )
}
