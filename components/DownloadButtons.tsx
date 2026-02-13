'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DownloadIcon, FileTextIcon, CopyIcon, CheckIcon, BookOpenIcon } from './Icons'

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

      {/* Additional Evidence Tip */}
      <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
        <h3 className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" clipRule="evenodd" />
          </svg>
          DCM Evidence Enrichment
        </h3>
        <p className="text-neutral-300 text-sm mb-2">
          The &ldquo;Additional Evidence&rdquo; column contains data pulled automatically from Amazon&apos;s Delivery Contrast Map &mdash; GPS coordinates, geo-fence status, delivery distance, and photo proof.
        </p>
        <p className="text-neutral-400 text-xs">
          If the column is empty, go back to the Review step and click <span className="text-emerald-400 font-medium">&ldquo;Enrich with DCM Evidence&rdquo;</span> to auto-fill it. The scraper starts automatically with your dev server.
        </p>
      </div>

      {/* Manual fallback tip */}
      <div className="mt-3 p-4 bg-neutral-800/50 border border-neutral-800 rounded-xl">
        <h3 className="text-neutral-400 font-semibold text-sm mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Manual Alternative
        </h3>
        <p className="text-neutral-500 text-xs">
          You can also manually look up each TBA in Amazon&apos;s <span className="text-neutral-400">Delivery Contrast Map popup</span> at logistics.amazon.com and paste GPS coordinates, distance, and delivery details into the Additional Evidence column.
        </p>
      </div>

      {/* Teach the System */}
      <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-emerald-400 font-semibold text-sm mb-1 flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4" />
              Help the System Learn
            </h3>
            <p className="text-neutral-400 text-xs">
              After filling in evidence, upload your completed file to teach the system better patterns.
            </p>
          </div>
          <Link
            href="/learn"
            className="flex-shrink-0 ml-4 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-colors"
          >
            Teach System
          </Link>
        </div>
      </div>
    </div>
  )
}
