'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DCMProgressPanel } from './DCMProgressPanel'
import type { EnrichmentStatus, DCMDeliveryData } from '@/types/dcm'

const SCRAPER_URL = 'http://localhost:3847'

interface DCMEnrichButtonProps {
  trackingIds: string[]
  onEnrichComplete: (results: Map<string, DCMDeliveryData>) => void
}

export function DCMEnrichButton({ trackingIds, onEnrichComplete }: DCMEnrichButtonProps) {
  const [status, setStatus] = useState<EnrichmentStatus>('checking_server')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uncachedIds, setUncachedIds] = useState<string[]>(trackingIds)
  const [cachedCount, setCachedCount] = useState(0)
  const [isLocalhost, setIsLocalhost] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check scraper server + cache in one shot
  const checkServer = useCallback(async (): Promise<{
    serverUp: boolean
    authed: boolean
    idsToScrape: string[]
  }> => {
    try {
      const res = await fetch('/api/enrich/status')
      const data = await res.json()

      if (!data.available) return { serverUp: false, authed: false, idsToScrape: trackingIds }

      // Check cache
      const cacheRes = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingIds }),
      })
      const cacheData = await cacheRes.json()

      setCachedCount(cacheData.cachedCount || 0)
      const uncached: string[] = cacheData.uncached || trackingIds
      setUncachedIds(uncached)

      // If everything is cached, apply immediately
      if (cacheData.cachedCount > 0 && cacheData.uncachedCount === 0) {
        const cachedMap = new Map<string, DCMDeliveryData>()
        for (const [tba, dcmData] of Object.entries(cacheData.cached)) {
          cachedMap.set(tba, dcmData as DCMDeliveryData)
        }
        onEnrichComplete(cachedMap)
        setStatus('complete')
        return { serverUp: true, authed: data.authenticated, idsToScrape: [] }
      }

      return { serverUp: true, authed: data.authenticated, idsToScrape: uncached }
    } catch {
      return { serverUp: false, authed: false, idsToScrape: trackingIds }
    }
  }, [trackingIds, onEnrichComplete])

  const checkServerRef = useRef(checkServer)
  checkServerRef.current = checkServer

  // Auto-check on mount
  useEffect(() => {
    const local =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    setIsLocalhost(local)

    if (local) {
      checkServerRef.current().then(({ serverUp }) => {
        if (!serverUp) setStatus('server_not_running')
        // idle is set inside handleEnrich flow, not here
        else setStatus('idle')
      })
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  // The one-click handler: open browser → wait for login → start scraping
  const handleEnrich = async () => {
    setErrorMessage(null)

    // 1. Check server + cache
    setStatus('checking_server')
    const { serverUp, authed, idsToScrape } = await checkServer()

    if (!serverUp) {
      setStatus('server_not_running')
      return
    }

    // All cached — already handled in checkServer
    if (idsToScrape.length === 0) return

    // 2. If not authenticated, open browser and wait
    if (!authed) {
      setStatus('awaiting_auth')
      try {
        await fetch(`${SCRAPER_URL}/start-auth`, { method: 'POST' })
      } catch {
        setStatus('error')
        setErrorMessage('Failed to open browser')
        return
      }

      // Poll until authenticated
      const authenticated = await new Promise<boolean>((resolve) => {
        let attempts = 0
        pollRef.current = setInterval(async () => {
          attempts++
          try {
            const res = await fetch(`${SCRAPER_URL}/check-auth`, { method: 'POST' })
            const data = await res.json()
            if (data.authenticated) {
              if (pollRef.current) clearInterval(pollRef.current)
              resolve(true)
            }
          } catch {
            if (pollRef.current) clearInterval(pollRef.current)
            resolve(false)
          }
          if (attempts > 100) { // ~5 minutes
            if (pollRef.current) clearInterval(pollRef.current)
            resolve(false)
          }
        }, 3000)
      })

      if (!authenticated) {
        setStatus('error')
        setErrorMessage('Authentication timed out. Try again.')
        return
      }
    }

    // 3. Authenticated — start scraping immediately
    setStatus('scraping')
  }

  const handleScrapeComplete = useCallback((results: Map<string, DCMDeliveryData>) => {
    if (cachedCount > 0) {
      fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingIds }),
      })
        .then(res => res.json())
        .then(cacheData => {
          const merged = new Map(results)
          for (const [tba, dcmData] of Object.entries(cacheData.cached || {})) {
            if (!merged.has(tba)) merged.set(tba, dcmData as DCMDeliveryData)
          }
          onEnrichComplete(merged)
        })
        .catch(() => onEnrichComplete(results))
    } else {
      onEnrichComplete(results)
    }
    setStatus('complete')
  }, [cachedCount, trackingIds, onEnrichComplete])

  const handleScrapeError = useCallback((message: string) => {
    setStatus('error')
    setErrorMessage(message)
  }, [])

  if (!isLocalhost) return null

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {status === 'checking_server' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-neutral-600 border-t-emerald-400 rounded-full animate-spin" />
            <span className="text-sm text-neutral-400">Checking DCM scraper...</span>
          </div>
        </div>
      )}

      {/* Server not running */}
      {status === 'server_not_running' && (
        <div className="bg-neutral-900 border border-amber-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-base font-semibold text-white">Enrich with DCM Evidence</h3>
          <p className="text-sm text-neutral-400">
            The scraper server starts automatically with <code className="text-emerald-400 bg-neutral-800 px-1.5 py-0.5 rounded text-xs">npm run dev</code>. If it&apos;s not running, restart your dev server or run it separately:
          </p>
          <div className="bg-neutral-950 rounded-lg p-3 font-mono text-sm text-emerald-400 select-all">
            npm run scraper
          </div>
          <button
            onClick={() => { setStatus('checking_server'); checkServer().then(({ serverUp }) => setStatus(serverUp ? 'idle' : 'server_not_running')) }}
            className="px-4 py-2 text-sm bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Ready — single button to start the whole flow */}
      {status === 'idle' && (
        <div className="bg-neutral-900 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">Enrich with DCM Evidence</h3>
              <p className="text-sm text-neutral-400 mt-1">
                Auto-pull GPS, geo-fence, distance, and photo proof for {trackingIds.length} TBAs
                {cachedCount > 0 && (
                  <span className="text-emerald-400"> ({cachedCount} already cached)</span>
                )}
              </p>
            </div>
            <button
              onClick={handleEnrich}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors font-medium whitespace-nowrap flex-shrink-0"
            >
              Enrich {uncachedIds.length} TBAs
            </button>
          </div>
          <p className="text-xs text-neutral-600 mt-3">
            A browser window will open for you to log in to Amazon Logistics. After login, scraping starts automatically.
          </p>
        </div>
      )}

      {/* Awaiting auth — browser is open, waiting for user to log in */}
      {status === 'awaiting_auth' && (
        <div className="bg-neutral-900 border border-yellow-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-yellow-600 border-t-yellow-400 rounded-full animate-spin" />
            <h3 className="text-base font-semibold text-white">Log in to Amazon Logistics</h3>
          </div>
          <p className="text-sm text-neutral-400">
            A browser window has opened. Sign in with your DSP credentials (including MFA). Scraping will start automatically once you&apos;re logged in.
          </p>
          <p className="text-xs text-neutral-600 mt-2">
            Your credentials are never stored by this tool.
          </p>
        </div>
      )}

      {/* Scraping */}
      {status === 'scraping' && (
        <DCMProgressPanel
          trackingIds={uncachedIds.length > 0 ? uncachedIds : trackingIds}
          onComplete={handleScrapeComplete}
          onError={handleScrapeError}
        />
      )}

      {/* Complete */}
      {status === 'complete' && (
        <div className="bg-neutral-900 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-400 text-lg">&#10003;</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Evidence Enrichment Complete</h3>
              <p className="text-sm text-neutral-400">
                DCM data added to your disputes. Continue to download the enriched XLSX.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="bg-neutral-900 border border-red-500/20 rounded-xl p-5">
          <h3 className="text-base font-semibold text-red-400 mb-1">Enrichment Error</h3>
          <p className="text-sm text-neutral-400 mb-3">{errorMessage || 'An unknown error occurred'}</p>
          <button
            onClick={handleEnrich}
            className="px-4 py-2 text-sm bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
