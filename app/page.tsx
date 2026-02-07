import Link from 'next/link'
import { TruckIcon } from '@/components/Icons'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <TruckIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">DSP Dispute Pro</span>
            </div>
            <Link
              href="/tool"
              className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-all font-semibold text-sm shadow-lg shadow-amber-500/25"
            >
              Launch Tool
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-amber-400 text-sm font-medium">Built for Amazon DSP Owners</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Stop Losing Money on
            <span className="block text-amber-400">Unfair Disputes</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Automate your DSP dispute process for Concessions, Customer Feedback, and DCR/RTS.
            Generate professional dispute files in seconds, not hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tool"
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-all font-semibold text-lg shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
            >
              Start Processing Disputes
            </Link>
            <a
              href="https://logistics.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold text-lg border border-slate-700"
            >
              Amazon Logistics Portal
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-slate-700/50">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">3</div>
              <div className="text-slate-400 text-sm">Dispute Types</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">10x</div>
              <div className="text-slate-400 text-sm">Faster Processing</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-slate-400 text-sm">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Fight Back
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Built specifically for Amazon DSP owners who are tired of manual dispute processing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Concessions */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-amber-500/50 transition-colors">
              <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Concession Disputes (DSB)</h3>
              <p className="text-slate-400 leading-relaxed">
                Process delivery concession files with automatic priority tiering.
                Identifies DSB impacts, geo-fence issues, and POD evidence for stronger disputes.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="text-sm text-slate-500">
                  File pattern: <code className="text-amber-400">DSP_Delivery_Concessions_*.csv</code>
                </div>
              </div>
            </div>

            {/* Feature 2: Feedback */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-amber-500/50 transition-colors">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Customer Feedback (CDF)</h3>
              <p className="text-slate-400 leading-relaxed">
                Handle negative customer feedback with pre-built dispute reasons.
                Covers wrong address, delivery instructions, and package handling issues.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="text-sm text-slate-500">
                  File pattern: <code className="text-amber-400">DSP_Customer_Delivery_Feedback_*.csv</code>
                </div>
              </div>
            </div>

            {/* Feature 3: RTS/DCR */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-amber-500/50 transition-colors">
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">DCR/RTS Disputes</h3>
              <p className="text-slate-400 leading-relaxed">
                Smart confidence scoring for Return-to-Station disputes.
                Focuses on high-approval cases like &ldquo;Package Not On Van&rdquo; scenarios.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="text-sm text-slate-500">
                  File pattern: <code className="text-amber-400">Quality_RTS_*.csv</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg">
              Get from raw CSV to dispute-ready files in 4 simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Select Category',
                description: 'Choose between Concessions, Customer Feedback, or DCR/RTS disputes'
              },
              {
                step: '2',
                title: 'Upload CSV',
                description: 'Drop your Amazon report file - we handle the parsing automatically'
              },
              {
                step: '3',
                title: 'Review Results',
                description: 'See priority tiers, repeat drivers, and dispute recommendations'
              },
              {
                step: '4',
                title: 'Download Files',
                description: 'Get your XLSX dispute file and Markdown summary report'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Features */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Smart Features That Save You Time
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Automatic Priority Tiering',
                    description: 'Disputes are automatically categorized by impact level so you know which ones to focus on first.'
                  },
                  {
                    title: 'Repeat Driver Detection',
                    description: 'Identifies drivers with 3+ issues for coaching opportunities and performance tracking.'
                  },
                  {
                    title: 'Confidence Scoring (DCR)',
                    description: 'New! DCR disputes are scored by approval likelihood based on Amazon\'s actual approval patterns.'
                  },
                  {
                    title: 'One-Click Export',
                    description: 'Download professional XLSX files ready for submission plus Markdown summaries for your records.'
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-400 text-xs font-medium">DCR Confidence Preview</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-semibold">High Confidence</span>
                    <span className="text-green-400 font-bold">12 disputes</span>
                  </div>
                  <p className="text-slate-400 text-sm">Package Not On Van - These have high approval rates</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 font-semibold">Low Confidence</span>
                    <span className="text-amber-400 font-bold">85 disputes</span>
                  </div>
                  <p className="text-slate-400 text-sm">Business Closed, OODT - Skip these, &lt;1% approval rate</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                <p className="text-slate-500 text-sm">Based on actual Amazon approval data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Save Hours Every Week?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join DSP owners who have automated their dispute process.
            Free to use, no signup required.
          </p>
          <Link
            href="/tool"
            className="inline-flex px-10 py-4 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-all font-semibold text-lg shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
          >
            Launch Dispute Tool
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <TruckIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">DSP Dispute Pro</span>
            </div>
            <div className="text-slate-500 text-sm">
              Built for Amazon Delivery Service Partners
            </div>
            <a
              href="https://logistics.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-400 text-sm transition-colors"
            >
              Amazon Logistics Portal &rarr;
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
