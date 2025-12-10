import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { suspended } = await request.json()

    // Prüfe ob User existiert
    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Admin kann nicht gesperrt werden
    if (targetUser.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot suspend admin users' }, { status: 403 })
    }

    // User sperren/entsperren
    await prisma.user.update({
      where: { id },
      data: { suspended: Boolean(suspended) },
    })

    return NextResponse.json({ success: true, suspended: Boolean(suspended) })
  } catch (error) {
    console.error('Error suspending user:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

