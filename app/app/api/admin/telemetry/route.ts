import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'

    // Zeitraum berechnen
    const now = new Date()
    let startDate: Date | undefined

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case '3days':
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDate = undefined
    }

    const whereClause = startDate ? { timestamp: { gte: startDate } } : {}

    // Heute und Gestern für Trend
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    // Parallele Abfragen
    const [
      totalBlocks,
      todayBlocks,
      yesterdayBlocks,
      blockMethodsRaw,
      countriesRaw,
      hourlyRaw,
      weekdayRaw,
      registrationsRaw,
      totalRegistrations,
      totalPurchases,
    ] = await Promise.all([
      // Total Blocks im Zeitraum
      prisma.telemetryEvent.count({ where: whereClause }),
      
      // Heute
      prisma.telemetryEvent.count({ where: { timestamp: { gte: today } } }),
      
      // Gestern
      prisma.telemetryEvent.count({ 
        where: { 
          timestamp: { gte: yesterday, lt: today } 
        } 
      }),
      
      // Top Blockgründe
      prisma.telemetryEvent.groupBy({
        by: ['blockMethod'],
        _count: { blockMethod: true },
        where: whereClause,
        orderBy: { _count: { blockMethod: 'desc' } },
        take: 10,
      }),
      
      // Top Länder
      prisma.telemetryEvent.groupBy({
        by: ['countryCode'],
        _count: { countryCode: true },
        where: { ...whereClause, countryCode: { not: null } },
        orderBy: { _count: { countryCode: 'desc' } },
        take: 10,
      }),

      // Stündliche Verteilung - verwende Prisma groupBy statt raw SQL
      prisma.telemetryEvent.findMany({
        where: whereClause,
        select: { timestamp: true },
      }).then(events => {
        const hourCounts: Record<number, number> = {}
        events.forEach(e => {
          const hour = new Date(e.timestamp).getHours()
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        })
        return Object.entries(hourCounts).map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        }))
      }),

      // Wochentag-Verteilung
      prisma.telemetryEvent.findMany({
        where: whereClause,
        select: { timestamp: true },
      }).then(events => {
        const weekdayCounts: Record<number, number> = {}
        events.forEach(e => {
          const weekday = new Date(e.timestamp).getDay()
          weekdayCounts[weekday] = (weekdayCounts[weekday] || 0) + 1
        })
        return Object.entries(weekdayCounts).map(([weekday, count]) => ({
          weekday: parseInt(weekday),
          count,
        }))
      }),

      // Registrierungen nach Datum (letzte 30 Tage)
      prisma.user.findMany({
        where: {
          createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        },
        select: { createdAt: true },
      }).then(users => {
        const dateCounts: Record<string, number> = {}
        users.forEach(u => {
          const date = new Date(u.createdAt).toISOString().split('T')[0]
          dateCounts[date] = (dateCounts[date] || 0) + 1
        })
        return Object.entries(dateCounts)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .slice(0, 7)
          .map(([date, count]) => ({ date: new Date(date), count }))
      }),

      // Gesamte Registrierungen
      prisma.user.count(),

      // Käufe (Lizenzen die NICHT FREE sind)
      prisma.license.count({
        where: { packageType: { not: 'FREE' } }
      }),
    ])

    // Daten aufbereiten
    const blockMethods = blockMethodsRaw.map(b => ({
      method: b.blockMethod,
      count: b._count.blockMethod,
    }))

    const topCountries = countriesRaw.map(c => ({
      country: c.countryCode || 'Unbekannt',
      count: c._count.countryCode,
    }))

    const hourlyStats = Array.isArray(hourlyRaw) ? hourlyRaw : []
    const weekdayStats = Array.isArray(weekdayRaw) ? weekdayRaw : []
    const registrationStats = Array.isArray(registrationsRaw)
      ? registrationsRaw.map(r => ({
          date: new Date(r.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
          count: r.count,
        }))
      : []

    return NextResponse.json({
      totalBlocks,
      todayBlocks,
      yesterdayBlocks,
      blockMethods,
      topCountries,
      hourlyStats,
      weekdayStats,
      registrationStats,
      purchaseStats: {
        registrations: totalRegistrations,
        purchases: totalPurchases,
      },
    })

  } catch (error) {
    console.error('Error fetching telemetry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

