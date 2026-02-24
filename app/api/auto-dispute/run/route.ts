import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright-core'

const DSP_BASE = 'https://logistics.amazon.com'

export const maxDuration = 300 // 5 min timeout for Vercel

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    const apiKey = process.env.BROWSERBASE_API_KEY

    if (!sessionId || !apiKey) {
      return NextResponse.json({ error: 'Missing sessionId or API key' }, { status: 400 })
    }

    // Connect to the authenticated session
    const browser = await chromium.connectOverCDP(
      `wss://connect.browserbase.com?apiKey=${apiKey}&sessionId=${sessionId}`
    )

    const context = browser.contexts()[0]
    const page = context.pages()[0] || await context.newPage()

    const errors: string[] = []
    const items: any[] = []

    // Navigate to Performance Summary
    await page.goto(`${DSP_BASE}/performance/summary`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // Click Quality tab
    const qualityTab = page.locator('text=Quality').first()
    if (await qualityTab.isVisible()) {
      await qualityTab.click()
      await page.waitForTimeout(2000)
    }

    // Go back one week
    const prevButton = page.locator('[aria-label*="previous"], [aria-label*="Previous"], button:has-text("←"), .week-nav-prev, [data-testid*="prev"]').first()
    if (await prevButton.isVisible().catch(() => false)) {
      await prevButton.click()
      await page.waitForTimeout(3000)
    }

    // Get week label
    const weekLabel = await page.locator('.week-label, [data-testid*="week"], .date-range').first().textContent().catch(() => 'Previous Week')

    // Find all links in the quality sections
    const sections = [
      { id: 'dsb', keywords: ['Delivery Success', 'DSB', 'Delivery Behaviors'] },
      { id: 'feedback', keywords: ['Customer Delivery Feedback', 'Customer Feedback', 'CDF'] },
      { id: 'dcr', keywords: ['Delivery Completion', 'DCR', 'Completion Rate'] },
    ]

    for (const section of sections) {
      try {
        // Find links in this section area
        const allLinks = page.locator('a[href]')
        const count = await allLinks.count()

        for (let i = 0; i < count; i++) {
          const link = allLinks.nth(i)
          const href = await link.getAttribute('href').catch(() => '')
          const text = await link.textContent().catch(() => '')

          if (href && (href.includes('/performance/') || href.includes('/detail') || href.includes('trackingId'))) {
            // Check if this link is near a section keyword
            const parent = link.locator('xpath=ancestor::*[position()<=5]')
            const parentText = await parent.first().textContent().catch(() => '')

            const matchesSection = section.keywords.some(k => parentText?.toLowerCase().includes(k.toLowerCase()))
            if (matchesSection || items.length === 0) {
              items.push({
                section: section.id,
                text: text?.trim(),
                link: href?.startsWith('http') ? href : `${DSP_BASE}${href}`,
              })
            }
          }
        }
      } catch (e: any) {
        errors.push(`Error scanning ${section.id}: ${e.message}`)
      }
    }

    // Process each item — navigate, extract details, dispute
    let submitted = 0
    let failed = 0

    for (const item of items) {
      try {
        await page.goto(item.link, { waitUntil: 'networkidle', timeout: 20000 })
        await page.waitForTimeout(1500)

        // Look for dispute button
        const disputeBtn = page.locator('button:has-text("Dispute"), button:has-text("Submit Dispute"), a:has-text("Dispute"), [data-testid*="dispute"]').first()

        if (await disputeBtn.isVisible().catch(() => false)) {
          await disputeBtn.click()
          await page.waitForTimeout(2000)

          // Fill reason
          const reasonField = page.locator('textarea, input[type="text"]').first()
          if (await reasonField.isVisible().catch(() => false)) {
            const reason = generateReason(item.section, item.text || '')
            await reasonField.fill(reason)
            await page.waitForTimeout(500)
          }

          // Submit
          const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Confirm"), button[type="submit"]').first()
          if (await submitBtn.isVisible().catch(() => false)) {
            await submitBtn.click()
            await page.waitForTimeout(2000)
          }

          submitted++
        } else {
          failed++
          errors.push(`No dispute button for: ${item.text}`)
        }
      } catch (e: any) {
        failed++
        errors.push(`Failed: ${item.text} — ${e.message}`)
      }

      await page.waitForTimeout(1500)
    }

    await browser.close()

    const report = {
      week: weekLabel || 'Previous Week',
      total: items.length,
      dsb: items.filter(i => i.section === 'dsb').length,
      feedback: items.filter(i => i.section === 'feedback').length,
      dcr: items.filter(i => i.section === 'dcr').length,
      submitted,
      failed,
      errors,
    }

    return NextResponse.json({ status: 'complete', report })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Agent failed' },
      { status: 500 }
    )
  }
}

function generateReason(section: string, text: string): string {
  const details = text.toLowerCase()

  if (section === 'dsb') {
    if (details.includes('attended')) return 'Attended delivery — package handed directly to recipient. GPS confirms driver at location.'
    if (details.includes('photo') || details.includes('pod')) return 'Photo proof of delivery confirms successful delivery at correct location.'
    return 'Delivery completed successfully. GPS and delivery data confirm package was delivered to correct location.'
  }

  if (section === 'feedback') {
    if (details.includes('wrong address') || details.includes('neighboring')) return 'GPS data confirms delivery within geo fence of assigned address. Photo proof shows correct delivery location.'
    if (details.includes('never received')) return 'Delivery confirmed via GPS within geo fence. Photo proof of delivery available.'
    return 'Delivery completed within geo fence per standard procedures. GPS data supports successful delivery.'
  }

  if (section === 'dcr') {
    if (details.includes('rts') || details.includes('return')) return 'Package was delivered on scheduled delivery day. System status may not reflect actual delivery completion.'
    return 'Delivery completed per GPS and scan data. Request review of delivery completion status.'
  }

  return 'Delivery completed successfully per GPS and delivery data. Requesting review.'
}
