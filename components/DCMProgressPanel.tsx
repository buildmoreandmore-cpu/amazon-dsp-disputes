'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ScraperEvent, DCMDeliveryData } from '@/types/dcm'

const SCRAPER_URL = 'http://localhost:3847'

interface DCMProgressPanelProps {
  trackingIds: string[]
  onComplete: (results: Map<string, DCMDeliveryData>) => void
  onError: (message: string) => void
}

export function DCMProgressPanel({ trackingIds, onComplete, onError }: DCMProgressPanelProps) {
  const [total, setTotal] = useState(trackingIds.length)
  const [completed, setCompleted] = useState(0)
  const [succeeded, setSucceeded] = useState(0)
  const [failed, setFailed] = useState(0)
  const [currentTBA, setCurrentTBA] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [stopping, setStopping] = useState(false)
  const [authRequired, setAuthRequired] = useState(false)

  const resultsRef = useRef(new Map<string, DCMDeliveryData>())
  const abortRef = useRef<AbortController | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  const addLog = useCallback((msg: string) => {
    setLog(prev => [...prev.slice(-99), msg])
  }, [])

  // Start scraping via SSE
  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    async function startScrape() {
      try {
        const response = await fetch(`${SCRAPER_URL}/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackingIds }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          onError('Failed to start scrape')
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Parse SSE events from buffer
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue

            try {
              const event: ScraperEvent = JSON.parse(line.slice(6))

              switch (event.type) {
                case 'progress':
                  setCompleted(event.completed)
                  setTotal(event.total)
                  setCurrentTBA(event.currentTBA)
                  break

                case 'tba_success':
                  setSucceeded(prev => prev + 1)
                  resultsRef.current.set(event.trackingId, event.data)
                  addLog(`OK  ${event.trackingId}`)

                  // Cache the result
                  fetch('/api/enrich', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: [event.data] }),
                  }).catch(() => {})
                  break

                case 'tba_failed':
                  setFailed(prev => prev + 1)
                  addLog(`FAIL ${event.trackingId}: ${event.error}`)
                  break

                case 'auth_required':
                  setAuthRequired(true)
                  addLog(`AUTH REQUIRED: ${event.message}`)
                  break

                case 'warning':
                  addLog(`WARN: ${event.message}`)
                  break

                case 'error':
                  addLog(`ERROR: ${event.message}`)
                  onError(event.message)
                  break

                case 'complete':
                  setCompleted(event.total)
                  setSucceeded(event.succeeded)
                  setFailed(event.failed)
                  addLog(`Complete: ${event.succeeded} succeeded, ${event.failed} failed`)
                  onComplete(resultsRef.current)
                  break
              }
            } catch {
              // Incomplete JSON line, skip
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          onError(err instanceof Error ? err.message : 'Scrape connection lost')
        }
      }
    }

    startScrape()

    return () => {
      controller.abort()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  const handleStop = async () => {
    setStopping(true)
    try {
      await fetch(`${SCRAPER_URL}/stop`, { method: 'POST' })
    } catch { /* best effort */ }
  }

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  const eta = completed > 0 && completed < total
    ? `~${Math.ceil(((total - completed) * 3.5) / 60)} min remaining`
    : null

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">DCM Enrichment Progress</h3>
        <button
          onClick={handleStop}
          disabled={stopping}
          className="px-4 py-1.5 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {stopping ? 'Stopping...' : 'Stop'}
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-neutral-400">
            {completed}/{total} TBAs processed
          </span>
          <span className="text-neutral-400">{percent}%</span>
        </div>
        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        {eta && (
          <p className="text-xs text-neutral-500 mt-1">{eta}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-neutral-300">{succeeded} succeeded</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-neutral-300">{failed} failed</span>
        </div>
        {currentTBA && (
          <div className="flex items-center gap-1.5 text-neutral-500">
            <span className="animate-pulse">Current:</span>
            <span className="font-mono text-xs">{currentTBA}</span>
          </div>
        )}
      </div>

      {/* Auth required warning */}
      {authRequired && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-sm text-yellow-400">
            Session expired. Please log in again in the browser window. Scraping will resume automatically.
          </p>
        </div>
      )}

      {/* Log */}
      <div className="bg-neutral-950 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-xs text-neutral-500">
        {log.length === 0 ? (
          <p className="text-neutral-600">Starting...</p>
        ) : (
          log.map((entry, i) => (
            <div
              key={i}
              className={
                entry.startsWith('OK') ? 'text-emerald-600' :
                entry.startsWith('FAIL') ? 'text-red-600' :
                entry.startsWith('WARN') ? 'text-yellow-600' :
                entry.startsWith('ERROR') ? 'text-red-500' :
                'text-neutral-500'
              }
            >
              {entry}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}
