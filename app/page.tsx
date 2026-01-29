'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { StatsDashboard } from '@/components/StatsDashboard'
import { DisputePreview } from '@/components/DisputePreview'
import { DownloadButtons } from '@/components/DownloadButtons'
import { TruckIcon } from '@/components/Icons'
import type { ApiResponse, DisputeResult, DisputeSummary } from '@/types'

type Step = 'upload' | 'preview' | 'download'

export default function Home() {
  const [step, setStep] = useState<Step>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disputes, setDisputes] = useState<DisputeResult[]>([])
  const [summary, setSummary] = useState<DisputeSummary | null>(null)
  const [xlsxBase64, setXlsxBase64] = useState<string>('')
  const [markdownSummary, setMarkdownSummary] = useState<string>('')
  const [outputFilename, setOutputFilename] = useState<string>('')

  const handleFileSelect = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/process-disputes', {
        method: 'POST',
        body: formData
      })

      const result: ApiResponse = await response.json()

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
    setStep('upload')
    setDisputes([])
    setSummary(null)
    setXlsxBase64('')
    setMarkdownSummary('')
    setOutputFilename('')
    setError(null)
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TruckIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              DSP Dispute Automation
            </h1>
          </div>
          <p className="text-gray-600">
            Upload your Amazon concession CSV to generate ready-to-submit dispute spreadsheets
          </p>
        </header>

        <div className="flex items-center justify-center gap-4 mb-8">
          <StepIndicator step={1} label="Upload" active={step === 'upload'} completed={step !== 'upload'} />
          <div className="w-8 h-0.5 bg-gray-300" />
          <StepIndicator step={2} label="Review" active={step === 'preview'} completed={step === 'download'} />
          <div className="w-8 h-0.5 bg-gray-300" />
          <StepIndicator step={3} label="Download" active={step === 'download'} completed={false} />
        </div>

        {step === 'upload' && (
          <div className="max-w-xl mx-auto">
            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
              error={error}
            />
          </div>
        )}

        {step === 'preview' && summary && (
          <div className="space-y-8">
            <StatsDashboard summary={summary} />
            <DisputePreview disputes={disputes} />

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Upload a different file
              </button>
              <button
                onClick={() => setStep('download')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Continue to Download
              </button>
            </div>
          </div>
        )}

        {step === 'download' && summary && (
          <div className="space-y-8">
            <StatsDashboard summary={summary} />
            <DownloadButtons
              xlsxBase64={xlsxBase64}
              markdownSummary={markdownSummary}
              outputFilename={outputFilename}
            />

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Process another file
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
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
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          active
            ? 'bg-blue-600 text-white'
            : completed
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-500'
        }`}
      >
        {completed ? '✓' : step}
      </div>
      <span
        className={`text-sm font-medium ${
          active ? 'text-blue-600' : completed ? 'text-green-600' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
