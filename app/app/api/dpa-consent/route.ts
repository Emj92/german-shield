import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth'

// AV-Vertrag Version und URL
const DPA_VERSION = '1.0'
const DPA_URL = 'https://germanfence.de/av-vertrag.pdf'

// GET: Prüfen ob User bereits zugestimmt hat
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    // Prüfe ob aktive Zustimmung existiert
    const consent = await prisma.dpaConsent.findFirst({
      where: {
        userId: user.userId,
        revokedAt: null,
      },
      orderBy: {
        consentedAt: 'desc'
      }
    })
    
    return NextResponse.json({
      hasConsent: !!consent,
      consent: consent ? {
        version: consent.dpaVersion,
        consentedAt: consent.consentedAt,
        dpaUrl: consent.dpaUrl
      } : null,
      currentVersion: DPA_VERSION,
      dpaUrl: DPA_URL,
      needsUpdate: consent ? consent.dpaVersion !== DPA_VERSION : false
    })
  } catch (error) {
    console.error('DPA consent check error:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

// POST: AV-Vertrag Zustimmung speichern
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    const body = await request.json()
    const { accepted, email } = body
    
    if (!accepted) {
      return NextResponse.json({ error: 'Zustimmung erforderlich' }, { status: 400 })
    }
    
    // IP und User-Agent für Audit
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Prüfe ob bereits eine aktive Zustimmung existiert
    const existingConsent = await prisma.dpaConsent.findFirst({
      where: {
        userId: user.userId,
        dpaVersion: DPA_VERSION,
        revokedAt: null,
      }
    })
    
    if (existingConsent) {
      return NextResponse.json({
        success: true,
        message: 'Zustimmung bereits vorhanden',
        consent: {
          version: existingConsent.dpaVersion,
          consentedAt: existingConsent.consentedAt
        }
      })
    }
    
    // Neue Zustimmung speichern
    const consent = await prisma.dpaConsent.create({
      data: {
        userId: user.userId,
        email: email || user.email,
        dpaVersion: DPA_VERSION,
        dpaUrl: DPA_URL,
        ipAddress: ip.split(',')[0].trim(), // Nur erste IP bei mehreren
        userAgent: userAgent.substring(0, 500), // Begrenzen
        consentMethod: 'checkbox',
      }
    })
    
    // Optional: Bestätigungs-E-Mail senden
    // TODO: E-Mail mit PDF-Anhang senden
    
    return NextResponse.json({
      success: true,
      message: 'AV-Vertrag erfolgreich akzeptiert',
      consent: {
        id: consent.id,
        version: consent.dpaVersion,
        consentedAt: consent.consentedAt,
        dpaUrl: consent.dpaUrl
      }
    })
  } catch (error) {
    console.error('DPA consent save error:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}

// DELETE: AV-Vertrag Zustimmung widerrufen
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    const body = await request.json()
    const { reason } = body
    
    // Finde aktive Zustimmung
    const consent = await prisma.dpaConsent.findFirst({
      where: {
        userId: user.userId,
        revokedAt: null,
      },
      orderBy: {
        consentedAt: 'desc'
      }
    })
    
    if (!consent) {
      return NextResponse.json({ error: 'Keine aktive Zustimmung gefunden' }, { status: 404 })
    }
    
    // Zustimmung widerrufen (nicht löschen für Audit)
    await prisma.dpaConsent.update({
      where: { id: consent.id },
      data: {
        revokedAt: new Date(),
        revokeReason: reason || 'Vom Benutzer widerrufen'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'AV-Vertrag Zustimmung widerrufen'
    })
  } catch (error) {
    console.error('DPA consent revoke error:', error)
    return NextResponse.json({ error: 'Fehler beim Widerrufen' }, { status: 500 })
  }
}

