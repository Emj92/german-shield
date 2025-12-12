import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    // TODO: Implementiere echtes Read-Tracking in DB
    // Für jetzt einfach OK zurückgeben
    console.log(`[Notifications] User ${user.userId} marked ${id} as read`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

