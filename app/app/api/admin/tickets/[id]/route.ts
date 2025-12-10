import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        responses: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

