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

    // Status prüfen - SUSPENDED, EXPIRED, CANCELLED blockieren
    if (license.status !== 'ACTIVE') {
      let errorMessage = 'Lizenz ist nicht aktiv'
      
      switch (license.status) {
        case 'SUSPENDED':
          errorMessage = 'Diese Lizenz wurde gesperrt. Bitte kontaktiere den Support.'
          break
        case 'EXPIRED':
          errorMessage = 'Diese Lizenz ist abgelaufen. Bitte verlängere sie im Portal.'
          break
        case 'CANCELLED':
          errorMessage = 'Diese Lizenz wurde gekündigt.'
          break
      }
      
      return NextResponse.json({
        valid: false,
        error: errorMessage,
        status: license.status,
        supportUrl: 'https://portal.germanfence.de/dashboard/support',
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
        // SPEZIAL-CHECK: Bei SINGLE-Lizenz die bereits eine andere Domain hat, streng blockieren
        if (license.packageType === 'SINGLE' && license.activeDomains.length > 0) {
          return NextResponse.json({
            valid: false,
            error: 'Single license already activated on another domain',
            maxDomains: license.maxDomains,
            registeredDomains: license.activeDomains.map(d => d.domain),
            message: `Diese Single-Lizenz ist bereits auf ${license.activeDomains[0].domain} aktiviert. Bitte deaktiviere sie dort zuerst oder wechsle zu einem Freelancer- oder Agency-Paket.`,
            manageUrl: `https://portal.germanfence.de/dashboard/licenses`,
          })
        }
        
        return NextResponse.json({
          valid: false,
          error: 'Domain not registered and limit reached',
          maxDomains: license.maxDomains,
          registeredDomains: license.activeDomains.map(d => d.domain),
          manageUrl: `https://portal.germanfence.de/dashboard/licenses`,
        })
      }

      // Auto-Registrierung
      await prisma.licenseDomain.create({
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
        features: {
          // FREE Features
          honeypot: true,
          timestampCheck: true,
          javascriptCheck: true,
          commentBlocker: true,
          wpMailBlocker: true,
          dashboardCleanup: true,
          
          // PAID Features (SINGLE, FREELANCER, AGENCY)
          honeypotAdvanced: license.packageType !== 'FREE',
          userAgentScan: license.packageType !== 'FREE',
          geoBlocking: license.packageType !== 'FREE',
          phraseBlocking: license.packageType !== 'FREE',
          typingSpeedAnalysis: license.packageType !== 'FREE',
          statistics: license.packageType !== 'FREE',
          prioritySupport: license.packageType !== 'FREE',
          
          // AGENCY Only
          whiteLabel: license.packageType === 'AGENCY',
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
        // FREE Features
        honeypot: true, // Alle haben Honeypot
        timestampCheck: true, // Alle haben Zeitstempel-Check
        javascriptCheck: true, // Alle haben JS-Check
        commentBlocker: true, // Alle haben Kommentar-Blocker
        wpMailBlocker: true, // Alle haben WP-Mail-Blocker
        dashboardCleanup: true, // Alle haben Dashboard-Cleanup
        
        // PAID Features (SINGLE, FREELANCER, AGENCY)
        honeypotAdvanced: license.packageType !== 'FREE', // Erweiterte Honeypot-Kontrolle
        userAgentScan: license.packageType !== 'FREE', // User Agent Scan
        geoBlocking: license.packageType !== 'FREE', // GEO-Blocking
        phraseBlocking: license.packageType !== 'FREE', // Phrasen-Blocking (Regex)
        typingSpeedAnalysis: license.packageType !== 'FREE', // Tippgeschwindigkeit-Analyse
        statistics: license.packageType !== 'FREE', // Dashboard mit Statistiken
        prioritySupport: license.packageType !== 'FREE', // Priority Support
        
        // AGENCY Only
        whiteLabel: license.packageType === 'AGENCY', // White-Label Option
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

