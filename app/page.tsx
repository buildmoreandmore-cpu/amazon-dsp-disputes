'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Dot Grid Background */}
      <div
        className="fixed inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight">Dispute Desk</span>
        </div>

        <div className="hidden md:flex items-center border border-neutral-700 rounded-full px-2 py-1.5">
          <a href="#features" className="px-4 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors">
            FEATURES
          </a>
          <a href="#how-it-works" className="px-4 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors">
            HOW IT WORKS
          </a>
          <a href="#disputes" className="px-4 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors">
            DISPUTES
          </a>
          <a href="https://logistics.amazon.com" target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors">
            AMAZON
          </a>
        </div>

        <Link
          href="/tool"
          className="px-6 py-2.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-neutral-200 transition-colors"
        >
          LAUNCH TOOL
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[calc(100vh-88px)] flex items-center px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full max-w-7xl mx-auto">
          {/* Left: Headline */}
          <div className="animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight">
              Stop losing money on unfair disputes.
            </h1>
            <p className="text-neutral-400 text-lg sm:text-xl mt-8 max-w-lg leading-relaxed animate-fade-in-up animation-delay-200">
              Automate your DSP dispute process for Concessions, Customer Feedback, and DCR/RTS. Generate professional dispute files in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-fade-in-up animation-delay-400">
              <Link
                href="/tool"
                className="inline-flex justify-center px-8 py-4 bg-white text-black rounded-full font-semibold text-base hover:bg-neutral-200 transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/10 active:scale-95"
              >
                Start Processing Disputes
              </Link>
              <a
                href="#features"
                className="inline-flex justify-center px-8 py-4 border border-neutral-700 text-white rounded-full font-semibold text-base hover:bg-neutral-900 hover:border-neutral-500 transition-all hover:scale-105 active:scale-95"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right: Product Preview Card */}
          <div className="relative animate-fade-in-up animation-delay-300">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl hover:border-neutral-700 transition-all duration-500 hover:shadow-amber-500/5">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DSP</span>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm">Dispute Desk</p>
                  <p className="font-semibold">Weekly Dispute Summary</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-neutral-500 text-sm">Week 5</p>
                  <p className="text-sm font-medium">Feb 2026</p>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-300">12 High-Confidence Disputes</span>
                  <span className="ml-auto text-green-400 font-medium">Ready</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-300">85 Low-Confidence (Skip)</span>
                  <span className="ml-auto text-amber-400 font-medium">&lt;1% approval</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-neutral-300">3 Repeat Drivers Flagged</span>
                  <span className="ml-auto text-blue-400 font-medium">Coaching</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <button className="w-full py-3 bg-white text-black rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Download Dispute Report
                </button>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-transparent to-blue-500/10 blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* March 2026 Update Banner */}
      <section className="relative z-10 border-t border-amber-500/30 bg-amber-500/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">
              Q1 2026 Update
            </span>
            <p className="text-neutral-300 text-sm">
              <strong>New thresholds effective March 11:</strong> Fantastic 73+ (was 70), DSB 233 DPMO (was 259). DCR &quot;Package Not on Van&quot; now auto-exempted.
            </p>
            <Link href="/tool" className="text-amber-400 hover:text-amber-300 text-sm font-medium whitespace-nowrap">
              See details &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-t border-b border-neutral-800 bg-neutral-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="scroll-animate opacity-0 translate-y-4 transition-all duration-700">
              <div className="text-4xl lg:text-5xl font-bold">3</div>
              <div className="text-neutral-400 text-sm mt-1">Dispute Types</div>
            </div>
            <div className="scroll-animate opacity-0 translate-y-4 transition-all duration-700 delay-100">
              <div className="text-4xl lg:text-5xl font-bold">10x</div>
              <div className="text-neutral-400 text-sm mt-1">Faster Processing</div>
            </div>
            <div className="scroll-animate opacity-0 translate-y-4 transition-all duration-700 delay-200">
              <div className="text-4xl lg:text-5xl font-bold">100%</div>
              <div className="text-neutral-400 text-sm mt-1">Free to Use</div>
            </div>
            <div className="scroll-animate opacity-0 translate-y-4 transition-all duration-700 delay-300">
              <div className="text-4xl lg:text-5xl font-bold">5</div>
              <div className="text-neutral-400 text-sm mt-1">Simple Steps</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16 scroll-animate">
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
              Everything you need to fight back.
            </h2>
            <p className="text-neutral-400 text-lg mt-4">
              Built specifically for Amazon DSP owners who are tired of manual dispute processing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Concessions */}
            <div className="scroll-animate group bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Concession Disputes (DSB)</h3>
              <p className="text-neutral-400 leading-relaxed">
                Process delivery concession files with automatic priority tiering. Identifies DSB impacts, geo-fence issues, and POD evidence.
              </p>
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <code className="text-sm text-amber-400 bg-neutral-800 px-3 py-1.5 rounded-full">
                  DSP_Delivery_Concessions_*.csv
                </code>
              </div>
            </div>

            {/* Feedback */}
            <div className="scroll-animate delay-100 group bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer Feedback (CDF)</h3>
              <p className="text-neutral-400 leading-relaxed">
                Handle negative customer feedback with pre-built dispute reasons. Covers wrong address, delivery instructions, and handling issues.
              </p>
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <code className="text-sm text-amber-400 bg-neutral-800 px-3 py-1.5 rounded-full">
                  DSP_Customer_Feedback_*.csv
                </code>
              </div>
            </div>

            {/* DCR/RTS */}
            <div className="scroll-animate delay-200 group bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-semibold">DCR/RTS Disputes</h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">Updated</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                <strong className="text-amber-400">March 2026:</strong> Amazon now auto-exempts most &ldquo;Package Not On Van&rdquo; cases. We show which disputes still need filing vs which are handled automatically.
              </p>
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <code className="text-sm text-amber-400 bg-neutral-800 px-3 py-1.5 rounded-full">
                  Quality_RTS_*.csv
                </code>
              </div>
            </div>
          </div>

          {/* DCM Auto-Enrich Feature */}
          <div className="mt-8 scroll-animate bg-gradient-to-r from-emerald-500/5 via-neutral-900 to-blue-500/5 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
                New Feature
              </span>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Auto-Enrich with DCM Evidence</h3>
                <p className="text-neutral-400 leading-relaxed mb-4">
                  Stop clicking through 127 TBAs one by one. This feature automatically pulls GPS coordinates, geo-fence status, delivery distance, and photo proof from Amazon&apos;s Delivery Contrast Map for every dispute in your file.
                </p>
                <p className="text-neutral-500 text-sm">
                  Your &ldquo;Additional Evidence&rdquo; column goes from empty to filled with real delivery data &mdash; the same data you&apos;d manually copy from the DCM popup, but in seconds instead of hours.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 bg-neutral-800/50 rounded-xl p-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-200">Click &ldquo;Enrich&rdquo;</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">After reviewing your disputes, click the enrich button</p>
                  </div>
                </div>
                <div className="flex gap-3 bg-neutral-800/50 rounded-xl p-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-200">Log in to Amazon</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">A browser opens &mdash; sign in as usual, including MFA</p>
                  </div>
                </div>
                <div className="flex gap-3 bg-neutral-800/50 rounded-xl p-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-200">Scraping runs automatically</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Every TBA is looked up with real-time progress after you log in</p>
                  </div>
                </div>
                <div className="flex gap-3 bg-neutral-800/50 rounded-xl p-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-200">Download with evidence</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Your XLSX now has GPS, geo-fence, and photo proof per TBA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 lg:px-12 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate">
            <h2 className="text-4xl sm:text-5xl font-bold">How it works.</h2>
            <p className="text-neutral-400 text-lg mt-4">
              From raw CSV to evidence-backed dispute files in 5 steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              {
                step: '01',
                title: 'Select Category',
                description: 'Choose between Concessions, Customer Feedback, or DCR/RTS disputes.'
              },
              {
                step: '02',
                title: 'Upload CSV',
                description: 'Drop your Amazon report file - we handle the parsing automatically.'
              },
              {
                step: '03',
                title: 'Review Results',
                description: 'See priority tiers, repeat drivers, and dispute recommendations.'
              },
              {
                step: '04',
                title: 'Enrich Evidence',
                description: 'Auto-pull GPS, geo-fence, and photo data from Amazon\'s Delivery Contrast Map.',
                highlight: true
              },
              {
                step: '05',
                title: 'Download Files',
                description: 'Get your evidence-enriched XLSX file and Markdown summary.'
              }
            ].map((item, index) => (
              <div key={item.step} className={`scroll-animate text-center hover:scale-105 transition-transform duration-300 ${index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : index === 3 ? 'delay-300' : index === 4 ? 'delay-[400ms]' : ''}`}>
                <div className={`text-6xl font-bold mb-4 transition-colors ${(item as { highlight?: boolean }).highlight ? 'text-emerald-800' : 'text-neutral-800'}`}>{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                  {(item as { highlight?: boolean }).highlight && (
                    <span className="ml-2 inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full align-middle">New</span>
                  )}
                </h3>
                <p className="text-neutral-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Features */}
      <section id="disputes" className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                Smart features that save you time.
              </h2>
              <div className="space-y-8 mt-10">
                {[
                  {
                    title: 'Automatic Priority Tiering',
                    description: 'Disputes are automatically categorized by impact level so you know which ones to focus on first.'
                  },
                  {
                    title: 'DCM Auto-Enrichment',
                    description: 'Automatically pulls GPS, geo-fence, distance, and photo proof from Amazon\'s Delivery Contrast Map for every TBA. No more manual lookups.'
                  },
                  {
                    title: 'Repeat Driver Detection',
                    description: 'Identifies drivers with 3+ issues for coaching opportunities and performance tracking.'
                  },
                  {
                    title: 'Confidence Scoring (DCR)',
                    description: "DCR disputes are scored by approval likelihood based on Amazon's actual approval patterns."
                  },
                  {
                    title: 'One-Click Export',
                    description: 'Download professional XLSX files ready for submission plus Markdown summaries for your records.'
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-neutral-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DCR Breakdown Preview */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-neutral-400 font-medium">DCR Smart Analysis (March 2026)</span>
              </div>
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-semibold">Auto-Exempted by Amazon</span>
                    <span className="text-emerald-400 font-bold text-2xl">85</span>
                  </div>
                  <p className="text-neutral-400 text-sm">Object Missing, OODT - No dispute needed anymore</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 font-semibold">Still Disputable</span>
                    <span className="text-blue-400 font-bold text-2xl">3</span>
                  </div>
                  <p className="text-neutral-400 text-sm">Delivered same day but marked RTS - Worth disputing</p>
                </div>
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-400 font-semibold">Not Worth Disputing</span>
                    <span className="text-neutral-400 font-bold text-2xl">12</span>
                  </div>
                  <p className="text-neutral-500 text-sm">Business Closed, Customer Refused - &lt;1% approval rate</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
                <p className="text-neutral-500 text-sm">We tell you exactly which disputes are worth your time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
            Ready to save hours every week?
          </h2>
          <p className="text-neutral-400 text-lg mt-6">
            Join DSP owners who have automated their dispute process. Free to use, no signup required.
          </p>
          <Link
            href="/tool"
            className="inline-flex mt-10 px-10 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-neutral-200 transition-colors"
          >
            Launch Dispute Tool
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800 py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Dispute Desk</span>
          </div>
          <div className="text-neutral-500 text-sm">
            Built for Amazon Delivery Service Partners
          </div>
          <a
            href="https://logistics.amazon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white text-sm transition-colors"
          >
            Amazon Logistics Portal &rarr;
          </a>
        </div>
      </footer>
    </div>
  )
}
