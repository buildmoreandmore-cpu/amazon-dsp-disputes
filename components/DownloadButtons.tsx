'use client'

import { useState } from 'react'
import { DownloadIcon, FileTextIcon, CopyIcon, CheckIcon } from './Icons'

interface DownloadButtonsProps {
  xlsxBase64: string
  markdownSummary: string
  outputFilename: string
}

export function DownloadButtons({
  xlsxBase64,
  markdownSummary,
  outputFilename
}: DownloadButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleDownloadXLSX = () => {
    const byteCharacters = atob(xlsxBase64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = outputFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownSummary], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = outputFilename.replace('.xlsx', '_summary.md')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(markdownSummary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Download Results</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadXLSX}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <DownloadIcon className="w-5 h-5" />
          Download Dispute Spreadsheet
        </button>

        <button
          onClick={handleDownloadMarkdown}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <FileTextIcon className="w-5 h-5" />
          Download Summary (MD)
        </button>

        <button
          onClick={handleCopyMarkdown}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          {copied ? (
            <>
              <CheckIcon className="w-5 h-5 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="w-5 h-5" />
              Copy Summary
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        The XLSX file is ready for submission to Amazon. The summary can be shared with your team.
      </p>
    </div>
  )
}
