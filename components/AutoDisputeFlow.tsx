'use client'

import { useState, useEffect, useRef } from 'react'

type AutoStep = 'ready' | 'creating' | 'login' | 'running' | 'done' | 'error'

interface AgentReport {
  week: string
  total: number
  dsb: number
  feedback: number
  dcr: number
  submitted: number
  failed: number
}

export function AutoDisputeFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<AutoStep>('ready')
  const [sessionId, setSessionId] = useState<string>('')
  const [liveViewUrl, setLiveViewUrl] = useState<string>('')
  const [report, setReport] = useState<AgentReport | null>(null)
  const [error, setError] = useState<string>('')
  const [statusText, setStatusText] = useState<string>('')
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const handleStartSession = async () => {
    setStep('creating')
    setError('')
    setStatusText('Creating secure browser session...')

    try {
      const res = await fetch('/api/auto-dispute/session', { method: 'POST' })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setStep('error')
        return
      }

      setSessionId(data.sessionId)
      setLiveViewUrl(data.liveViewUrl)
      setStep('login')
    } catch (e: any) {
      setError(e.message || 'Failed to create session')
      setStep('error')
    }
  }

  const handleLoginComplete = async () => {
    setStep('running')
    setStatusText('Agent is navigating to the Quality Dashboard...')

    try {
      const res = await fetch('/api/auto-dispute/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setStep('error')
        return
      }

      // Poll for completion
      if (data.jobId) {
        pollForCompletion(data.jobId)
      } else if (data.report) {
        setReport(data.report)
        setStep('done')
      }
    } catch (e: any) {
      setError(e.message || 'Agent failed to start')
      setStep('error')
    }
  }

  const pollForCompletion = (jobId: string) => {
    let dots = 0
    const messages = [
      'Navigating to Performance Summary...',
      'Opening Quality Dashboard...',
      'Going back one week...',
      'Scanning Delivery Success Behaviors...',
      'Scanning Customer Delivery Feedback...',
      'Scanning Delivery Completion Rate...',
      'Extracting item details...',
      'Generating dispute reasons...',
      'Submitting disputes...',
      'Finalizing report...',
    ]
    let msgIdx = 0

    pollRef.current = setInterval(async () => {
      dots = (dots + 1) % 4
      if (msgIdx < messages.length - 1 && Math.random() > 0.7) msgIdx++
      setStatusText(messages[msgIdx] + '.'.repeat(dots))

      try {
        const res = await fetch(`/api/auto-dispute/status?jobId=${jobId}`)
        const data = await res.json()

        if (data.status === 'complete') {
          if (pollRef.current) clearInterval(pollRef.current)
          setReport(data.report)
          setStep('done')
        } else if (data.status === 'error') {
          if (pollRef.current) clearInterval(pollRef.current)
          setError(data.error || 'Agent encountered an error')
          setStep('error')
        }
      } catch {}
    }, 3000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          {step === 'ready' && 'Auto Dispute Agent'}
          {step === 'creating' && 'Setting Up...'}
          {step === 'login' && 'Log In to Amazon'}
          {step === 'running' && 'Agent Working...'}
          {step === 'done' && 'Disputes Complete!'}
          {step === 'error' && 'Something Went Wrong'}
        </h1>
        <p className="text-neutral-400">
          {step === 'ready' && 'Log in once, and the agent handles everything else.'}
          {step === 'creating' && 'Creating a secure cloud browser...'}
          {step === 'login' && 'Log in and enter your OTP. The agent takes over after.'}
          {step === 'running' && 'Sit back — the agent is disputing everything automatically.'}
          {step === 'done' && 'All disputable items have been processed.'}
          {step === 'error' && 'The agent ran into an issue.'}
        </p>
      </div>

      {/* Ready state */}
      {step === 'ready' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-lg font-semibold text-white">How it works</h2>
            <div className="space-y-4">
              {[
                { num: '1', title: 'You log in', desc: 'We open a secure browser. You log into Amazon Logistics and enter your OTP.' },
                { num: '2', title: 'Agent takes over', desc: 'Once authenticated, the agent navigates to the Quality Dashboard automatically.' },
                { num: '3', title: 'Everything gets disputed', desc: 'The agent goes back one week, finds all linked items in DSB, Feedback, and DCR — and disputes every one.' },
                { num: '4', title: 'You get a report', desc: 'A summary of everything disputed, with counts by section.' },
              ].map((item) => (
                <div key={item.num} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-emerald-400">{item.num}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-sm text-neutral-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleStartSession}
              className="px-10 py-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-400 transition-colors font-semibold text-lg flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Auto Dispute
            </button>
            <button onClick={onBack} className="text-sm text-neutral-400 hover:text-white transition-colors">
              ← ← Back
            </button>
          </div>
        </div>
      )}

      {/* Creating session */}
      {step === 'creating' && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-neutral-400">{statusText}</p>
        </div>
      )}

      {/* Login step — embedded browser */}
      {step === 'login' && (
        <div className="space-y-4">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-neutral-900 border border-emerald-500/20 rounded-xl px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">Secure browser active</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={liveViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
              >
                Open in new tab
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Embedded browser iframe */}
          <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-black" style={{ height: '70vh', minHeight: '500px' }}>
            <iframe
              src={liveViewUrl}
              className="w-full h-full border-0"
              allow="clipboard-read; clipboard-write"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('ready')} className="text-sm text-neutral-500 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
            <p className="text-xs text-neutral-600 hidden sm:block">
              Log in to Amazon Logistics, then click the button →
            </p>
            <button
              onClick={handleLoginComplete}
              className="px-8 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-400 transition-colors font-semibold flex items-center gap-2"
            >
              I&apos;m Logged In — Start Agent
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Running */}
      {step === 'running' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-medium">{statusText}</p>
                <p className="text-xs text-neutral-500 mt-2">This usually takes 3-5 minutes</p>
              </div>
            </div>

            {/* Embedded live view */}
            {liveViewUrl && (
              <div className="mt-6 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Live View</span>
                  <a
                    href={liveViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
                  >
                    Open in new tab
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="rounded-xl overflow-hidden border border-neutral-700 bg-black" style={{ height: '50vh', minHeight: '350px' }}>
                  <iframe
                    src={liveViewUrl}
                    className="w-full h-full border-0"
                    allow="clipboard-read; clipboard-write"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Done */}
      {step === 'done' && report && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-emerald-500/20 rounded-2xl p-8 space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-400">Week: {report.week}</p>
              <p className="text-4xl font-bold text-white mt-2">{report.submitted}</p>
              <p className="text-neutral-400">disputes submitted</p>
            </div>

            {/* Section breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{report.dsb}</p>
                <p className="text-xs text-neutral-400 mt-1">DSB</p>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{report.feedback}</p>
                <p className="text-xs text-neutral-400 mt-1">Feedback</p>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{report.dcr}</p>
                <p className="text-xs text-neutral-400 mt-1">DCR</p>
              </div>
            </div>

            {report.failed > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                <p className="text-sm text-red-400">{report.failed} items could not be disputed — may need manual review</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => { setStep('ready'); setReport(null); setSessionId(''); }}
              className="px-8 py-3 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors font-semibold"
            >
              Run Again
            </button>
            <button onClick={onBack} className="text-sm text-neutral-400 hover:text-white transition-colors">
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {step === 'error' && (
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400">{error}</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => { setStep('ready'); setError(''); }}
              className="px-8 py-3 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors font-semibold"
            >
              Try Again
            </button>
            <button onClick={onBack} className="text-sm text-neutral-400 hover:text-white transition-colors">
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
