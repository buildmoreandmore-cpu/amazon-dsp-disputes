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
          'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50',
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
              <LoaderIcon className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-700">Processing disputes...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
            </>
          ) : selectedFile ? (
            <>
              <FileTextIcon className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-gray-700">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <p className="text-sm text-blue-600 mt-2">Drop a new file to replace</p>
            </>
          ) : (
            <>
              <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700">
                Drop your CSV file here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Supports Amazon DSP concession exports (.csv)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error processing file</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
