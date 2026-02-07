'use client'

import { useState, useCallback } from 'react'
import { UploadIcon, LoaderIcon, CheckCircleIcon, AlertCircleIcon } from './Icons'
import type { EvidenceUploadResult } from '@/types/evidence'

interface EvidenceUploadProps {
  onUploadComplete?: (result: EvidenceUploadResult) => void
}

export function EvidenceUpload({ onUploadComplete }: EvidenceUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<EvidenceUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setError('Please upload an XLSX file')
      return
    }

    setIsUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload file')
      }

      setResult(data.result)
      onUploadComplete?.(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-neutral-700 hover:border-neutral-600'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <>
              <LoaderIcon className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-neutral-300">Processing your evidence file...</p>
            </>
          ) : (
            <>
              <UploadIcon className="w-10 h-10 text-neutral-400" />
              <div>
                <p className="text-neutral-300 font-medium">
                  Drop your completed XLSX file here
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  or click to browse
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Upload Failed</p>
            <p className="text-red-400/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success display */}
      {result && (
        <div className={`
          rounded-lg p-4 flex items-start gap-3
          ${result.rowsWithEvidence > 0
            ? 'bg-emerald-500/10 border border-emerald-500/20'
            : 'bg-amber-500/10 border border-amber-500/20'
          }
        `}>
          <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            result.rowsWithEvidence > 0 ? 'text-emerald-500' : 'text-amber-500'
          }`} />
          <div className="flex-1">
            <p className={`font-medium ${
              result.rowsWithEvidence > 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {result.rowsWithEvidence > 0 ? 'Evidence Imported Successfully' : 'No Evidence Found'}
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-neutral-400">
                <span className="text-neutral-300">{result.totalRows}</span> total rows scanned
              </p>
              <p className="text-neutral-400">
                <span className="text-neutral-300">{result.rowsWithEvidence}</span> rows with evidence
              </p>
              {result.newPatterns > 0 && (
                <p className="text-emerald-400">
                  <span className="font-medium">+{result.newPatterns}</span> new patterns learned
                </p>
              )}
              {result.updatedPatterns > 0 && (
                <p className="text-neutral-400">
                  <span className="text-neutral-300">{result.updatedPatterns}</span> existing patterns reinforced
                </p>
              )}
              {result.errors.length > 0 && (
                <div className="mt-2 pt-2 border-t border-neutral-700">
                  <p className="text-amber-400 font-medium">Warnings:</p>
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-amber-400/80">{err}</p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={resetUpload}
              className="mt-3 text-sm text-neutral-400 hover:text-neutral-200 underline"
            >
              Upload another file
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
        <h4 className="text-sm font-medium text-neutral-300 mb-2">How it works</h4>
        <ol className="text-sm text-neutral-400 space-y-1 list-decimal list-inside">
          <li>Download dispute XLSX from the main tool</li>
          <li>Add your evidence in the &quot;Additional Evidence&quot; column</li>
          <li>Upload the completed file here to teach the system</li>
          <li>Future disputes will suggest similar evidence patterns</li>
        </ol>
      </div>
    </div>
  )
}
