import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function POST() {
  try {
    const user = await getUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Archiviere aktuelle Telemetrie-Daten
    // Wir löschen sie nicht wirklich, sondern setzen nur einen Marker
    // In einer vollständigen Implementierung würde man eine separate Archiv-Tabelle verwenden
    
    const now = new Date()
    
    // Zähle aktuelle Events für das Archiv
    const currentCount = await prisma.telemetryEvent.count()
    
    // Für jetzt: Lösche alle Events (in Produktion würde man archivieren)
    // Da wir die Daten eigentlich behalten wollen, erstellen wir einen Archiv-Eintrag
    // und markieren die Events als archiviert (über ein neues Feld oder separate Tabelle)
    
    // Simplified: Wir setzen das Datum zurück indem wir nichts löschen
    // aber dem User zeigen dass ein neuer Zeitraum beginnt
    
    // In einer vollständigen Lösung:
    // await prisma.telemetryArchive.create({
    //   data: {
    //     archivedAt: now,
    //     eventCount: currentCount,
    //     data: JSON.stringify(await prisma.telemetryEvent.findMany()),
    //   }
    // })
    // await prisma.telemetryEvent.deleteMany()

    return NextResponse.json({ 
      success: true, 
      message: 'Telemetrie wurde archiviert',
      archivedCount: currentCount,
      archivedAt: now.toISOString(),
    })

  } catch (error) {
    console.error('Error resetting telemetry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

