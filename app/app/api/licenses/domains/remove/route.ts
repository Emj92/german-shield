import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// CORS-Header für Plugin-Anfragen
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Plugin-Version',
}

// Domain normalisieren
function normalizeDomain(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

/**
 * POST: Domain vom Plugin entfernen (ohne User-Auth, nur mit Lizenzschlüssel)
 * Wird aufgerufen wenn User im Plugin die Lizenz deaktiviert
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey, domain } = body

    console.log('[Domain-Remove] Anfrage:', { licenseKey: licenseKey?.substring(0, 8) + '...', domain })

    if (!licenseKey || !domain) {
      return NextResponse.json(
        { error: 'License key and domain required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const normalizedDomain = normalizeDomain(domain)

    // Lizenz finden
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: { activeDomains: true },
    })

    if (!license) {
      console.log('[Domain-Remove] Lizenz nicht gefunden:', licenseKey.substring(0, 8))
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Domain in der Lizenz finden
    const licenseDomain = await prisma.licenseDomain.findFirst({
      where: {
        licenseId: license.id,
        domain: normalizedDomain,
      },
    })

    if (!licenseDomain) {
      console.log('[Domain-Remove] Domain nicht gefunden:', normalizedDomain)
      // Kein Fehler - Domain existiert nicht, also erfolgreich "entfernt"
      return NextResponse.json(
        { success: true, message: 'Domain not registered' },
        { headers: corsHeaders }
      )
    }

    // Domain löschen
    await prisma.licenseDomain.delete({
      where: { id: licenseDomain.id },
    })

    // History-Eintrag
    await prisma.licenseHistory.create({
      data: {
        licenseId: license.id,
        action: 'DOMAIN_REMOVED',
        description: `Domain ${normalizedDomain} removed via plugin deactivation`,
        metadata: { domain: normalizedDomain, removedBy: 'plugin' },
      },
    })

    console.log('[Domain-Remove] ✅ Domain entfernt:', normalizedDomain)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Domain removed successfully',
        remainingSlots: license.maxDomains - license.activeDomains.length + 1,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('[Domain-Remove] Fehler:', error)
    return NextResponse.json(
      { error: 'Domain removal failed' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS für CORS Preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

