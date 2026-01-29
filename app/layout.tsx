import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DSP Dispute Automation Tool',
  description: 'Automate the dispute process for Amazon Delivery Service Partners',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
