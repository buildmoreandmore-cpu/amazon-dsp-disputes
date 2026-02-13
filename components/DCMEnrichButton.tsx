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
  const [status, setStatus] = useState<EnrichmentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uncachedIds, setUncachedIds] = useState<string[]>([])
  const [cachedCount, setCachedCount] = useState(0)
  const [isLocalhost, setIsLocalhost] = useState(false)

  // Check scraper server availability
  const checkServer = useCallback(async () => {
    setStatus('checking_server')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/enrich/status')
      const data = await res.json()

      if (!data.available) {
        setStatus('server_not_running')
        return
      }

      // Check cache for already-scraped TBAs
      const cacheRes = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingIds }),
      })
      const cacheData = await cacheRes.json()

      setCachedCount(cacheData.cachedCount || 0)
      setUncachedIds(cacheData.uncached || trackingIds)

      // If we have cached data, immediately apply it
      if (cacheData.cachedCount > 0) {
        const cachedMap = new Map<string, DCMDeliveryData>()
        for (const [tba, dcmData] of Object.entries(cacheData.cached)) {
          cachedMap.set(tba, dcmData as DCMDeliveryData)
        }
        // Partial enrichment with cached data
        if (cacheData.uncachedCount === 0) {
          onEnrichComplete(cachedMap)
          setStatus('complete')
          return
        }
      }

      if (data.authenticated) {
        setStatus('idle')
      } else {
        setStatus('awaiting_auth')
      }
    } catch {
      setStatus('server_not_running')
    }
  }, [trackingIds, onEnrichComplete])

  // Keep a ref to checkServer for the mount effect
  const checkServerRef = useRef(checkServer)
  checkServerRef.current = checkServer

  // Environment detection + auto-check on mount
  useEffect(() => {
    const local =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    setIsLocalhost(local)
    if (local) {
      checkServerRef.current()
    }
  }, [])

  const handleStartAuth = async () => {
    try {
      await fetch(`${SCRAPER_URL}/start-auth`, { method: 'POST' })
      setStatus('awaiting_auth')

      // Poll for auth completion
      const pollAuth = setInterval(async () => {
        try {
          const res = await fetch(`${SCRAPER_URL}/check-auth`, { method: 'POST' })
          const data = await res.json()
          if (data.authenticated) {
            clearInterval(pollAuth)
            setStatus('idle')
          }
        } catch {
          clearInterval(pollAuth)
          setStatus('error')
          setErrorMessage('Lost connection to scraper server')
        }
      }, 3000)

      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(pollAuth), 5 * 60 * 1000)
    } catch {
      setStatus('error')
      setErrorMessage('Failed to start authentication')
    }
  }

  const handleStartScrape = () => {
    setStatus('scraping')
  }

  const handleScrapeComplete = useCallback((results: Map<string, DCMDeliveryData>) => {
    // Merge with any cached data
    if (cachedCount > 0) {
      // Re-fetch cached data and merge
      fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingIds }),
      })
        .then(res => res.json())
        .then(cacheData => {
          const merged = new Map(results)
          for (const [tba, dcmData] of Object.entries(cacheData.cached || {})) {
            if (!merged.has(tba)) {
              merged.set(tba, dcmData as DCMDeliveryData)
            }
          }
          onEnrichComplete(merged)
        })
        .catch(() => {
          // Fallback: just use scrape results
          onEnrichComplete(results)
        })
    } else {
      onEnrichComplete(results)
    }
    setStatus('complete')
  }, [cachedCount, trackingIds, onEnrichComplete])

  const handleScrapeError = useCallback((message: string) => {
    setStatus('error')
    setErrorMessage(message)
  }, [])

  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Don't render on Vercel / non-localhost
  if (!isLocalhost) return null

  return (
    <div className="space-y-4">
      {/* Server not running */}
      {status === 'server_not_running' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Enrich with DCM Evidence</h3>
            <p className="text-sm text-neutral-400">
              Automatically pull GPS, geo-fence, and photo proof from Amazon&apos;s Delivery Contrast Map for every TBA in your file.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Setup required (one time)</h4>
            <p className="text-sm text-neutral-400 mb-3">
              The scraper runs locally on your machine so it can open a real browser and log in to Amazon. Start it in a separate terminal:
            </p>
            <div className="bg-neutral-950 rounded-lg p-3 font-mono text-sm text-emerald-400 select-all">
              npm run scraper
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Keep this terminal open while enriching. You only need to log in once per session.
            </p>
          </div>

          <button
            onClick={checkServer}
            className="px-4 py-2 text-sm bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Retry Connection
          </button>

          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="block text-sm text-neutral-500 hover:text-neutral-300 transition-colors underline underline-offset-2"
          >
            {showHowItWorks ? 'Hide details' : 'How does this work?'}
          </button>

          {showHowItWorks && <HowItWorksPanel />}
        </div>
      )}

      {/* Idle — ready to check / start */}
      {status === 'idle' && (
        <div className="bg-neutral-900 border border-emerald-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Enrich with DCM Evidence</h3>
              <p className="text-sm text-neutral-400 mt-1">
                Auto-pull GPS, geo-fence, and photo data for {trackingIds.length} TBAs
                {cachedCount > 0 && (
                  <span className="text-emerald-400"> ({cachedCount} cached, {uncachedIds.length} to scrape)</span>
                )}
              </p>
            </div>
            {status === 'idle' ? (
              <button
                onClick={uncachedIds.length > 0 ? handleStartScrape : checkServer}
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors font-medium"
              >
                {uncachedIds.length > 0
                  ? `Scrape ${uncachedIds.length} TBAs`
                  : 'Check for Evidence'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-neutral-400">
                <div className="w-4 h-4 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
                <span className="text-sm">Checking server...</span>
              </div>
            )}
          </div>

          {/* What you'll get */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'GPS Coords', icon: '&#9678;' },
              { label: 'Geo-fence Status', icon: '&#9635;' },
              { label: 'Distance', icon: '&#8596;' },
              { label: 'Photo Proof', icon: '&#9724;' },
            ].map((item) => (
              <div key={item.label} className="bg-neutral-800/50 rounded-lg p-2.5 text-center">
                <div className="text-emerald-400 text-lg mb-1" dangerouslySetInnerHTML={{ __html: item.icon }} />
                <div className="text-xs text-neutral-400">{item.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors underline underline-offset-2"
          >
            {showHowItWorks ? 'Hide details' : 'How does this work?'}
          </button>

          {showHowItWorks && <HowItWorksPanel />}
        </div>
      )}

      {/* Awaiting auth */}
      {status === 'awaiting_auth' && (
        <div className="bg-neutral-900 border border-yellow-500/20 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-2">Step 2: Log in to Amazon Logistics</h3>
          <p className="text-sm text-neutral-400 mb-3">
            A browser window will open to the Amazon Logistics login page. Sign in with your DSP credentials as usual &mdash; the system will detect when you&apos;re logged in, including after MFA.
          </p>
          <button
            onClick={handleStartAuth}
            className="px-6 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
          >
            Open Amazon Login
          </button>
          <p className="text-xs text-neutral-500 mt-3">
            Your credentials are never stored. The browser session stays open so the tool can look up each TBA without re-authenticating.
          </p>
        </div>
      )}

      {/* Scraping — show progress panel */}
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
              <h3 className="text-lg font-semibold text-white">Evidence Enrichment Complete</h3>
              <p className="text-sm text-neutral-400">
                DCM data has been added to your disputes. Download the updated XLSX below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="bg-neutral-900 border border-red-500/20 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-red-400 mb-1">Enrichment Error</h3>
          <p className="text-sm text-neutral-400">{errorMessage || 'An unknown error occurred'}</p>
          <button
            onClick={checkServer}
            className="mt-3 px-4 py-2 text-sm bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Checking server on mount */}
      {status === 'checking_server' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-neutral-600 border-t-emerald-400 rounded-full animate-spin" />
            <div>
              <h3 className="text-sm font-semibold text-white">Checking for DCM Evidence Enrichment...</h3>
              <p className="text-xs text-neutral-500">Looking for scraper server on localhost:3847</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HowItWorksPanel() {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-5">
      <h4 className="text-sm font-semibold text-white">How DCM Auto-Enrichment Works</h4>

      <p className="text-sm text-neutral-400">
        Instead of clicking into the Delivery Contrast Map popup for each TBA one-by-one, this feature opens a browser on your machine and does it automatically.
      </p>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</div>
          <div>
            <h5 className="text-sm font-medium text-neutral-200">Start the scraper</h5>
            <p className="text-xs text-neutral-500 mt-0.5">Run <code className="text-emerald-400">npm run scraper</code> in a separate terminal. This starts a local server that controls a Chromium browser.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs font-bold">2</div>
          <div>
            <h5 className="text-sm font-medium text-neutral-200">Log in to Amazon</h5>
            <p className="text-xs text-neutral-500 mt-0.5">A visible browser window opens to logistics.amazon.com. Sign in with your normal DSP credentials, including MFA. The tool never sees or stores your password.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">3</div>
          <div>
            <h5 className="text-sm font-medium text-neutral-200">Auto-scrape begins</h5>
            <p className="text-xs text-neutral-500 mt-0.5">The tool searches each TBA in the Delivery Contrast Map, extracts GPS coordinates, geo-fence status, delivery distance, photo proof, and timestamps.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">4</div>
          <div>
            <h5 className="text-sm font-medium text-neutral-200">Evidence fills in</h5>
            <p className="text-xs text-neutral-500 mt-0.5">The &ldquo;Additional Evidence&rdquo; column in your XLSX gets populated with real data. Dispute reasons are enhanced with actual GPS and geo-fence proof.</p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-lg p-3 space-y-2">
        <h5 className="text-xs font-semibold text-neutral-300">Good to know</h5>
        <ul className="text-xs text-neutral-500 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#8226;</span>
            <span><strong className="text-neutral-400">Cached for 7 days</strong> &mdash; re-running enrichment skips TBAs already scraped recently</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#8226;</span>
            <span><strong className="text-neutral-400">Rate limited</strong> &mdash; 2-3 seconds between lookups to avoid detection</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#8226;</span>
            <span><strong className="text-neutral-400">Session aware</strong> &mdash; if your session expires mid-scrape, you&apos;ll be prompted to re-login and it resumes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">&#8226;</span>
            <span><strong className="text-neutral-400">Runs locally only</strong> &mdash; this feature uses your own browser and never sends data to external servers</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
