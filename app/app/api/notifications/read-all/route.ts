import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'

export async function POST() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implementiere echtes Read-Tracking in DB
    console.log(`[Notifications] User ${user.userId} marked all as read`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

