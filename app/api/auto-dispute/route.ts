import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint to trigger the auto-dispute agent.
 * 
 * POST /api/auto-dispute
 * Body: { sessionId: string }  — Browserbase session ID (user already authenticated)
 * 
 * Returns: { status, report }
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    // In production, this would trigger the dispute-agent script
    // For now, return the instructions
    return NextResponse.json({
      status: 'ready',
      message: 'Session ID received. The dispute agent will connect to your authenticated browser session.',
      sessionId,
      nextStep: 'Agent will navigate to Quality Dashboard → previous week → dispute all linked items.',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * GET /api/auto-dispute/status
 * Check if Browserbase is configured
 */
export async function GET() {
  const configured = !!(process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID)
  return NextResponse.json({
    configured,
    provider: 'browserbase',
  })
}
