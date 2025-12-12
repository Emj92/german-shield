import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth'

// GET - Alle Benachrichtigungen abrufen (Admin) - Dedupliziert
export async function GET() {
  try {
    const user = await getUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: {
          select: { email: true }
        }
      }
    })

    // Dedupliziere nach message + type + createdAt (gruppiere Massenversand)
    const seen = new Map<string, typeof allNotifications[0]>()
    const uniqueNotifications = []
    
    for (const notif of allNotifications) {
      // Key basierend auf message und ungefährem Zeitstempel (auf Sekunde gerundet)
      const timeKey = new Date(notif.createdAt).toISOString().slice(0, 19)
      const key = `${notif.message}-${notif.type}-${timeKey}`
      
      if (!seen.has(key)) {
        seen.set(key, notif)
        // Zähle wie viele User diese Nachricht erhalten haben
        const count = allNotifications.filter(n => 
          n.message === notif.message && 
          n.type === notif.type && 
          new Date(n.createdAt).toISOString().slice(0, 19) === timeKey
        ).length
        
        uniqueNotifications.push({
          ...notif,
          recipientCount: count,
          // Wenn mehr als 1 Empfänger, zeige "Alle Benutzer"
          user: count > 1 ? null : notif.user
        })
      }
    }

    return NextResponse.json({ notifications: uniqueNotifications.slice(0, 50) })

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

