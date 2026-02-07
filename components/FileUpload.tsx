'use client'

import { useCallback, useState } from 'react'
import { UploadIcon, FileTextIcon, AlertCircleIcon, LoaderIcon } from './Icons'
import clsx from 'clsx'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isLoading: boolean
  error: string | null
}

export function FileUpload({ onFileSelect, isLoading, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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

    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl p-10 transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-amber-500 bg-amber-50'
            : 'border-slate-300 hover:border-amber-400 bg-white',
          isLoading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center text-center">
          {isLoading ? (
            <>
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                <LoaderIcon className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Processing disputes...</p>
              <p className="text-sm text-slate-500 mt-1">This may take a few moments</p>
            </>
          ) : selectedFile ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <FileTextIcon className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <p className="text-sm text-amber-600 mt-3 font-medium">Drop a new file to replace</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <UploadIcon className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-900">
                Drop your CSV file here
              </p>
              <p className="text-sm text-slate-500 mt-1">
                or click to browse
              </p>
              <p className="text-xs text-slate-400 mt-4 bg-slate-50 px-3 py-1.5 rounded-full">
                Supports Amazon DSP exports (.csv)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Error processing file</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
