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
            ? 'border-white bg-neutral-800'
            : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900',
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
              <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                <LoaderIcon className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-lg font-semibold text-white">Processing disputes...</p>
              <p className="text-sm text-neutral-400 mt-1">This may take a few moments</p>
            </>
          ) : selectedFile ? (
            <>
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                <FileTextIcon className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-lg font-semibold text-white">{selectedFile.name}</p>
              <p className="text-sm text-neutral-400 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <p className="text-sm text-neutral-500 mt-3">Drop a new file to replace</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                <UploadIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-lg font-semibold text-white">
                Drop your CSV file here
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                or click to browse
              </p>
              <p className="text-xs text-neutral-500 mt-4 bg-neutral-800 px-3 py-1.5 rounded-full">
                Supports Amazon DSP exports (.csv)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Error processing file</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
