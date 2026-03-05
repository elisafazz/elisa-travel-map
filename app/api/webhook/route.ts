import { NextResponse } from 'next/server'

// Notion sends a webhook; we trigger a sync
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Notion verification challenge
    if (body.verification_token) {
      return NextResponse.json({ verification_token: body.verification_token })
    }

    // Only re-sync on page events in the Trip Items DB
    const relevantDatabases = [
      '446d2cf3f53a4e368c4b7fbbaecc24cb', // Trip Items
      '152724e097cb48f1a74fb5105dd14235', // Travel Planning
    ]

    const pageId: string = body?.entity?.id ?? ''
    const eventType: string = body?.type ?? ''

    if (!eventType.startsWith('page.')) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // Trigger sync in the background
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    fetch(`${baseUrl}/api/sync`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.SYNC_SECRET}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ trigger: eventType, pageId }),
    }).catch(console.error)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
