import { NextResponse } from 'next/server'
import Browserbase from '@browserbasehq/sdk'

export async function POST() {
  try {
    const apiKey = process.env.BROWSERBASE_API_KEY
    const projectId = process.env.BROWSERBASE_PROJECT_ID

    if (!apiKey || !projectId) {
      return NextResponse.json(
        { error: 'Browserbase is not configured. Contact your administrator.' },
        { status: 500 }
      )
    }

    const bb = new Browserbase({ apiKey })
    const session = await bb.sessions.create({
      projectId,
      keepAlive: true,
    })

    return NextResponse.json({
      sessionId: session.id,
      liveViewUrl: `https://www.browserbase.com/sessions/${session.id}/live-view`,
      connectUrl: session.connectUrl,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create browser session' },
      { status: 500 }
    )
  }
}
