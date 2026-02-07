import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DSP Dispute Pro - Automate Amazon DSP Disputes',
  description: 'Automate dispute processing for Amazon Delivery Service Partners. Handle Concessions, Customer Feedback, and DCR/RTS disputes in seconds.',
  keywords: ['Amazon DSP', 'dispute automation', 'delivery service partner', 'concessions', 'customer feedback', 'DCR', 'RTS'],
  openGraph: {
    title: 'DSP Dispute Pro - Automate Amazon DSP Disputes',
    description: 'Stop losing money on unfair disputes. Automate your DSP dispute process for Concessions, Customer Feedback, and DCR/RTS.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
