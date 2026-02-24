'use client'

import Link from 'next/link'
import { AutoDisputeFlow } from '@/components/AutoDisputeFlow'
import { ChevronLeftIcon, BookOpenIcon } from '@/components/Icons'

export default function ToolPage() {
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
            <Link
              href="/learn"
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              <BookOpenIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Teach System</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <AutoDisputeFlow />
        </div>
      </main>
    </div>
  )
}
