import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { message } = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Prüfen ob Ticket existiert
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Antwort erstellen
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId: id,
        authorId: user.id,
        message: message.trim(),
        isAdmin: true,
      },
    })

    // Ticket-Status auf IN_PROGRESS setzen wenn noch OPEN
    if (ticket.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

