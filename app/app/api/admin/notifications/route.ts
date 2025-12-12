import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET - Alle Benachrichtigungen abrufen (Admin)
export async function GET() {
  try {
    const user = await getUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { email: true }
        }
      }
    })

    return NextResponse.json({ notifications })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Neue Benachrichtigung erstellen
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, type, backgroundColor, link, userId } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Wenn für alle Benutzer, erstelle eine Benachrichtigung für jeden
    if (!userId) {
      // Hole alle Benutzer
      const allUsers = await prisma.user.findMany({
        select: { id: true }
      })

      // Erstelle Benachrichtigungen für alle Benutzer
      await prisma.notification.createMany({
        data: allUsers.map(u => ({
          userId: u.id,
          message,
          type: type || 'MESSAGE',
          backgroundColor: backgroundColor || '#22D6DD',
          link: link || null,
        }))
      })

      // KEINE zusätzliche Referenz-Benachrichtigung mehr erstellen
      // Das verursachte Duplikate im Verlauf

      return NextResponse.json({ 
        success: true, 
        sentTo: allUsers.length 
      })

    } else {
      // Für einzelnen Benutzer
      const notification = await prisma.notification.create({
        data: {
          userId,
          message,
          type: type || 'MESSAGE',
          backgroundColor: backgroundColor || '#22D6DD',
          link: link || null,
        },
        include: {
          user: {
            select: { email: true }
          }
        }
      })

      return NextResponse.json({ success: true, notification })
    }

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

