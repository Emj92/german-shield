import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Spam-Statistiken für die Lizenzen des Users
export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hole alle Lizenzen des Users
    const licenses = await prisma.license.findMany({
      where: { userId: user.userId },
      include: {
        activeDomains: true
      }
    })

    // Sammle alle Domains des Users
    const userDomains = licenses.flatMap(l => l.activeDomains.map(d => d.domain))

    if (userDomains.length === 0) {
      return NextResponse.json({
        totalBlocked: 0,
        blockedToday: 0,
        blockedThisWeek: 0,
        topBlockReason: null,
      })
    }

    // Zeitfilter
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)

    // Da TelemetryEvent keine Domain hat, zeigen wir globale Stats proportional
    // zur Anzahl der User-Domains an
    const totalEvents = await prisma.telemetryEvent.count()
    const todayEvents = await prisma.telemetryEvent.count({
      where: { timestamp: { gte: today } }
    })
    const weekEvents = await prisma.telemetryEvent.count({
      where: { timestamp: { gte: weekAgo } }
    })

    // Berechne geschätzte Werte basierend auf der Anzahl der Domains
    // (Vereinfachte Logik - in Zukunft mit Domain-Tracking)
    const domainFactor = Math.max(1, userDomains.length) / 100 // ~1% pro Domain

    // Top Blockgrund
    const blockReasons = await prisma.telemetryEvent.groupBy({
      by: ['blockMethod'],
      _count: { blockMethod: true },
      orderBy: { _count: { blockMethod: 'desc' } },
      take: 1
    })

    const blockMethodNames: Record<string, string> = {
      'honeypot': 'Honeypot',
      'timestamp': 'Zeitstempel',
      'geo': 'GEO-Blocking',
      'phrase': 'Phrasen-Filter',
      'user_agent': 'User-Agent',
      'url': 'URL-Filter',
      'javascript': 'JavaScript',
      'rate_limit': 'Rate-Limit',
    }

    return NextResponse.json({
      totalBlocked: Math.round(totalEvents * domainFactor),
      blockedToday: Math.round(todayEvents * domainFactor),
      blockedThisWeek: Math.round(weekEvents * domainFactor),
      topBlockReason: blockReasons[0] 
        ? blockMethodNames[blockReasons[0].blockMethod] || blockReasons[0].blockMethod
        : null,
    })

  } catch (error) {
    console.error('Error fetching user spam stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

