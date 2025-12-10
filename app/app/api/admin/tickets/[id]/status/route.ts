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
    const { status } = await request.json()

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error updating ticket status:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

