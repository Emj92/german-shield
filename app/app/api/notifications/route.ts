import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hole Benachrichtigungen aus verschiedenen Quellen
    const notifications: Array<{
      id: string
      type: 'ticket_response' | 'license_expiry' | 'system' | 'MESSAGE' | 'UPDATE' | 'NEWS' | 'WARNING'
      title: string
      message: string
      link?: string
      read: boolean
      createdAt: string
      backgroundColor?: string
    }> = []

    // 1. Support-Ticket Antworten (ungelesene Admin-Antworten)
    const ticketResponses = await prisma.ticketResponse.findMany({
      where: {
        ticket: {
          userId: user.userId
        },
        isAdmin: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Letzte 30 Tage
        }
      },
      include: {
        ticket: {
          select: {
            id: true,
            subject: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    for (const response of ticketResponses) {
      notifications.push({
        id: `ticket-${response.id}`,
        type: 'ticket_response',
        title: 'Neue Antwort auf dein Ticket',
        message: `${response.ticket.subject}: ${response.message.substring(0, 50)}...`,
        link: `/dashboard/support/${response.ticket.id}`,
        read: false, // TODO: Track read status per notification
        createdAt: response.createdAt.toISOString()
      })
    }

    // 2. API-Key-Ablauf Warnungen
    const licenses = await prisma.license.findMany({
      where: {
        userId: user.userId,
        status: 'ACTIVE',
        expiresAt: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // In 30 Tagen
          gte: new Date() // Noch nicht abgelaufen
        }
      }
    })

    for (const license of licenses) {
      const daysLeft = Math.ceil((license.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      notifications.push({
        id: `license-${license.id}`,
        type: 'license_expiry',
        title: 'API-Key läuft bald ab',
        message: `Dein ${license.packageType} API-Key läuft in ${daysLeft} Tagen ab`,
        link: '/dashboard/licenses',
        read: daysLeft > 14, // Als gelesen wenn noch > 14 Tage
        createdAt: new Date(license.expiresAt.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // 3. Admin-Benachrichtigungen (aus Notification-Tabelle) - ALLE laden, auch gelesene
    const adminNotifications = await prisma.notification.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    for (const notif of adminNotifications) {
      notifications.push({
        id: notif.id,
        type: notif.type as 'MESSAGE' | 'UPDATE' | 'NEWS' | 'WARNING',
        title: notif.type === 'WARNING' ? '⚠️ Warnung' : 
               notif.type === 'UPDATE' ? '🔄 Update' :
               notif.type === 'NEWS' ? '📰 Neuigkeit' : '💬 Nachricht',
        message: notif.message,
        link: notif.link || undefined,
        read: notif.read,
        createdAt: notif.createdAt.toISOString(),
        backgroundColor: notif.backgroundColor
      })
    }

    // Sortiere nach Datum (neueste zuerst)
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ notifications: notifications.slice(0, 20) })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json({ notifications: [] })
  }
}

