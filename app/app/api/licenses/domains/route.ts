import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Domain normalisieren (ohne http/https, www, trailing slash)
function normalizeDomain(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

// GET: Alle Domains einer Lizenz abrufen
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const licenseKey = searchParams.get('licenseKey')

    if (!licenseKey) {
      return NextResponse.json({ error: 'License key required' }, { status: 400 })
    }

    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        activeDomains: {
          orderBy: { activatedAt: 'desc' },
        },
      },
    })

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 })
    }

    // Nur eigene Lizenzen oder Admin
    if (license.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      license: {
        licenseKey: license.licenseKey,
        packageType: license.packageType,
        maxDomains: license.maxDomains,
        expiresAt: license.expiresAt,
        status: license.status,
      },
      domains: license.activeDomains,
      available: license.maxDomains - license.activeDomains.length,
    })
  } catch (error) {
    console.error('Get domains failed:', error)
    return NextResponse.json({ error: 'Failed to get domains' }, { status: 500 })
  }
}

// POST: Domain registrieren
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { licenseKey, domain, siteTitle, wpVersion, phpVersion } = await request.json()

    if (!licenseKey || !domain) {
      return NextResponse.json({ error: 'License key and domain required' }, { status: 400 })
    }

    const normalizedDomain = normalizeDomain(domain)

    // Lizenz prüfen
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: { activeDomains: true },
    })

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 })
    }

    // Nur eigene Lizenzen oder Admin
    if (license.userId && license.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Status prüfen
    if (license.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'License is not active' }, { status: 400 })
    }

    // Ablaufdatum prüfen
    if (new Date(license.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'License has expired' }, { status: 400 })
    }

    // Domain-Limit prüfen
    if (license.activeDomains.length >= license.maxDomains) {
      return NextResponse.json({ 
        error: 'Domain limit reached',
        maxDomains: license.maxDomains,
        currentDomains: license.activeDomains.length,
      }, { status: 400 })
    }

    // Prüfen ob Domain bereits registriert
    const existing = await prisma.licenseDomain.findUnique({
      where: {
        licenseId_domain: {
          licenseId: license.id,
          domain: normalizedDomain,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Domain already registered' }, { status: 400 })
    }

    // Domain registrieren
    const licenseDomain = await prisma.licenseDomain.create({
      data: {
        licenseId: license.id,
        domain: normalizedDomain,
        siteTitle,
        wpVersion,
        phpVersion,
      },
    })

    // History-Eintrag
    await prisma.licenseHistory.create({
      data: {
        licenseId: license.id,
        action: 'DOMAIN_ADDED',
        description: `Domain ${normalizedDomain} registered`,
        metadata: { domain: normalizedDomain, siteTitle },
      },
    })

    return NextResponse.json({
      success: true,
      domain: licenseDomain,
      remaining: license.maxDomains - license.activeDomains.length - 1,
    })
  } catch (error) {
    console.error('Domain registration failed:', error)
    return NextResponse.json({ error: 'Domain registration failed' }, { status: 500 })
  }
}

// DELETE: Domain entfernen
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const domainId = searchParams.get('domainId')

    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID required' }, { status: 400 })
    }

    const licenseDomain = await prisma.licenseDomain.findUnique({
      where: { id: domainId },
      include: { license: true },
    })

    if (!licenseDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    // Nur eigene Lizenzen oder Admin
    if (licenseDomain.license.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Domain löschen
    await prisma.licenseDomain.delete({
      where: { id: domainId },
    })

    // History-Eintrag
    await prisma.licenseHistory.create({
      data: {
        licenseId: licenseDomain.licenseId,
        action: 'DOMAIN_REMOVED',
        description: `Domain ${licenseDomain.domain} removed`,
        metadata: { domain: licenseDomain.domain },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Domain removed successfully',
    })
  } catch (error) {
    console.error('Domain removal failed:', error)
    return NextResponse.json({ error: 'Domain removal failed' }, { status: 500 })
  }
}

