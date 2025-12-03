import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Domain normalisieren
function normalizeDomain(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

export async function POST(request: NextRequest) {
  try {
    const { licenseKey, domain, siteTitle, wpVersion, phpVersion } = await request.json()

    if (!licenseKey || !domain) {
      return NextResponse.json({ 
        valid: false,
        error: 'License key and domain required' 
      }, { status: 400 })
    }

    const normalizedDomain = normalizeDomain(domain)

    // Lizenz abrufen
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        activeDomains: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!license) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid license key',
      })
    }

    // Status prüfen
    if (license.status !== 'ACTIVE') {
      return NextResponse.json({
        valid: false,
        error: `License is ${license.status.toLowerCase()}`,
        status: license.status,
      })
    }

    // Ablaufdatum prüfen
    const now = new Date()
    const expiresAt = new Date(license.expiresAt)
    const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (expiresAt < now) {
      // Lizenz abgelaufen
      await prisma.license.update({
        where: { id: license.id },
        data: { status: 'EXPIRED', isActive: false },
      })

      await prisma.licenseHistory.create({
        data: {
          licenseId: license.id,
          action: 'EXPIRED',
          description: 'License expired automatically',
        },
      })

      return NextResponse.json({
        valid: false,
        error: 'License has expired',
        expiresAt: license.expiresAt,
        renewUrl: `https://germanfence.de/dashboard/licenses`,
      })
    }

    // Domain-Check
    const domainEntry = license.activeDomains.find(d => d.domain === normalizedDomain)

    if (!domainEntry) {
      // Domain nicht registriert - Auto-Registrierung wenn Platz frei
      if (license.activeDomains.length >= license.maxDomains) {
        return NextResponse.json({
          valid: false,
          error: 'Domain not registered and limit reached',
          maxDomains: license.maxDomains,
          registeredDomains: license.activeDomains.map(d => d.domain),
          manageUrl: `https://germanfence.de/dashboard/licenses`,
        })
      }

      // Auto-Registrierung
      const newDomain = await prisma.licenseDomain.create({
        data: {
          licenseId: license.id,
          domain: normalizedDomain,
          siteTitle,
          wpVersion,
          phpVersion,
        },
      })

      await prisma.licenseHistory.create({
        data: {
          licenseId: license.id,
          action: 'DOMAIN_ADDED',
          description: `Domain ${normalizedDomain} auto-registered`,
          metadata: { domain: normalizedDomain, siteTitle },
        },
      })

      return NextResponse.json({
        valid: true,
        registered: true,
        message: 'Domain auto-registered successfully',
        license: {
          packageType: license.packageType,
          expiresAt: license.expiresAt,
          daysUntilExpiry,
          maxDomains: license.maxDomains,
          usedDomains: license.activeDomains.length + 1,
        },
      })
    }

    // Domain bereits registriert - lastSeenAt aktualisieren
    await prisma.licenseDomain.update({
      where: { id: domainEntry.id },
      data: {
        lastSeenAt: new Date(),
        siteTitle,
        wpVersion,
        phpVersion,
      },
    })

    // Warnung wenn Lizenz bald abläuft (< 30 Tage)
    const warning = daysUntilExpiry < 30 ? {
      type: 'expiry_warning',
      message: `License expires in ${daysUntilExpiry} days`,
      renewUrl: `https://germanfence.de/dashboard/licenses`,
    } : null

    return NextResponse.json({
      valid: true,
      license: {
        packageType: license.packageType,
        expiresAt: license.expiresAt,
        daysUntilExpiry,
        maxDomains: license.maxDomains,
        usedDomains: license.activeDomains.length,
      },
      features: {
        geoBlocking: license.packageType !== 'FREE',
        phraseBlocking: license.packageType !== 'FREE',
        statistics: license.packageType !== 'FREE',
        prioritySupport: ['SINGLE', 'FREELANCER', 'AGENCY'].includes(license.packageType),
        whiteLabel: license.packageType === 'AGENCY',
      },
      warning,
    })
  } catch (error) {
    console.error('License validation failed:', error)
    return NextResponse.json({
      valid: false,
      error: 'Validation failed',
    }, { status: 500 })
  }
}

