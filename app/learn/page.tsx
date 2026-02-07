'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EvidenceUpload } from '@/components/EvidenceUpload'
import { EvidenceStats } from '@/components/EvidenceStats'
import { BookOpenIcon, ChevronLeftIcon } from '@/components/Icons'
import type { EvidenceUploadResult } from '@/types/evidence'

export default function LearnPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = (result: EvidenceUploadResult) => {
    if (result.rowsWithEvidence > 0) {
      setRefreshTrigger((prev) => prev + 1)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Dot grid background */}
      <div
        className="fixed inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(64 64 64) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/tool"
                className="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Back to Tool
              </Link>
            </div>
            <div className="flex items-center gap-2 text-emerald-500">
              <BookOpenIcon className="w-5 h-5" />
              <span className="font-medium">Teach System</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3">Evidence Feedback Loop</h1>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Help the system learn by uploading your completed dispute files.
              The evidence you provide will be used to generate better suggestions for future disputes.
            </p>
          </div>

          {/* Two column layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload section */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 text-sm flex items-center justify-center">
                  1
                </span>
                Upload Completed Files
              </h2>
              <EvidenceUpload onUploadComplete={handleUploadComplete} />
            </div>

            {/* Stats section */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 text-sm flex items-center justify-center">
                  2
                </span>
                Knowledge Base
              </h2>
              <EvidenceStats refreshTrigger={refreshTrigger} />
            </div>
          </div>

          {/* Info section */}
          <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-6 border border-neutral-800">
            <h3 className="font-semibold text-lg mb-3">How Evidence Learning Works</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-2 font-bold">
                  1
                </div>
                <h4 className="font-medium text-neutral-200 mb-1">Pattern Recognition</h4>
                <p className="text-neutral-400">
                  Evidence is grouped by dispute characteristics (geo-fence status, POD, delivery type, etc.)
                </p>
              </div>
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center mb-2 font-bold">
                  2
                </div>
                <h4 className="font-medium text-neutral-200 mb-1">Template Building</h4>
                <p className="text-neutral-400">
                  Similar evidence is consolidated into reusable templates that can be suggested for matching disputes
                </p>
              </div>
              <div>
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center mb-2 font-bold">
                  3
                </div>
                <h4 className="font-medium text-neutral-200 mb-1">Continuous Learning</h4>
                <p className="text-neutral-400">
                  More uploads mean better suggestions. The system improves with every completed file you share
                </p>
              </div>
            </div>
          </div>

          {/* Pattern key examples */}
          <div className="mt-8 bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
            <h3 className="font-semibold mb-4">Pattern Key Examples</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500 border-b border-neutral-800">
                    <th className="pb-2 font-medium">Dispute Type</th>
                    <th className="pb-2 font-medium">Pattern Key</th>
                    <th className="pb-2 font-medium">Meaning</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800/50">
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">Concession</span>
                    </td>
                    <td className="py-2 font-mono text-xs text-neutral-400">concession:in_geo:has_pod:attended</td>
                    <td className="py-2 text-neutral-400">In geo-fence, has POD, attended delivery</td>
                  </tr>
                  <tr className="border-b border-neutral-800/50">
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">Feedback</span>
                    </td>
                    <td className="py-2 font-mono text-xs text-neutral-400">feedback:wrong_address</td>
                    <td className="py-2 text-neutral-400">Wrong address feedback type</td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">RTS</span>
                    </td>
                    <td className="py-2 font-mono text-xs text-neutral-400">rts:object_missing:high</td>
                    <td className="py-2 text-neutral-400">Object missing code, high confidence</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
