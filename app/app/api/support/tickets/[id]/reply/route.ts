import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Ticket prüfen
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // User kann nur auf eigene Tickets antworten
    if (ticket.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Antwort erstellen
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId: id,
        authorId: user.userId,
        message: message.trim(),
        isAdmin: user.role === 'ADMIN',
      },
    })

    // Status auf WAITING setzen (User hat geantwortet, wartet auf Support)
    if (user.role !== 'ADMIN') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'WAITING' },
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

