import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// DELETE - Alle Benachrichtigungen eines Users löschen
export async function DELETE() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Lösche alle Benachrichtigungen des Users
    await prisma.notification.deleteMany({
      where: { userId: user.userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear notifications:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

