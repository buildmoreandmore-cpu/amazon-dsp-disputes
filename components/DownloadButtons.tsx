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
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Download Results</h2>

      <div className="grid sm:grid-cols-3 gap-4">
        <button
          onClick={handleDownloadXLSX}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-white text-black rounded-xl hover:bg-neutral-200 transition-all font-medium"
        >
          <DownloadIcon className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">Dispute Spreadsheet</div>
            <div className="text-neutral-500 text-sm mt-1">XLSX format</div>
          </div>
        </button>

        <button
          onClick={handleDownloadMarkdown}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-all font-medium border border-neutral-700"
        >
          <FileTextIcon className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">Summary Report</div>
            <div className="text-neutral-400 text-sm mt-1">Markdown format</div>
          </div>
        </button>

        <button
          onClick={handleCopyMarkdown}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-all font-medium border border-neutral-700"
        >
          {copied ? (
            <>
              <CheckIcon className="w-8 h-8 text-green-400" />
              <div className="text-center">
                <div className="font-semibold text-green-400">Copied!</div>
                <div className="text-neutral-400 text-sm mt-1">To clipboard</div>
              </div>
            </>
          ) : (
            <>
              <CopyIcon className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">Copy Summary</div>
                <div className="text-neutral-400 text-sm mt-1">To clipboard</div>
              </div>
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-neutral-500 mt-4 text-center">
        The XLSX file is ready for submission to Amazon. The summary can be shared with your team.
      </p>
    </div>
  )
}
