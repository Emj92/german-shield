import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Lizenzschlüssel generieren (Format: GS-AGENCY-XXXX-XXXX-XXXX)
function generateLicenseKey(packageType: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Ohne 0,O,1,I für bessere Lesbarkeit
  
  // Prefix basierend auf Pakettyp (wie bei Payment)
  const prefix = packageType === 'FREE' ? 'GS-FREE' : 
                 packageType === 'SINGLE' ? 'GS-SINGLE' :
                 packageType === 'FREELANCER' ? 'GS-FREELANCER' :
                 packageType === 'AGENCY' ? 'GS-AGENCY' : 'GS-PRO'
  
  const segments = []
  for (let i = 0; i < 3; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)]
    }
    segments.push(segment)
  }
  
  // Format: GS-AGENCY-XXXX-XXXX-XXXX
  return `${prefix}-${segments.join('-')}`
}

// Paket-Limits definieren
const PACKAGE_LIMITS: Record<string, { maxDomains: number; price: number }> = {
  FREE: { maxDomains: 1, price: 0 },
  SINGLE: { maxDomains: 1, price: 29 },
  FREELANCER: { maxDomains: 5, price: 79 },
  AGENCY: { maxDomains: 25, price: 199 },
}

type PackageType = 'FREE' | 'SINGLE' | 'FREELANCER' | 'AGENCY'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, packageType, email } = await request.json()

    // Validierung
    const validPackages: PackageType[] = ['FREE', 'SINGLE', 'FREELANCER', 'AGENCY']
    if (!packageType || !validPackages.includes(packageType as PackageType)) {
      return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
    }

    // User finden oder erstellen (optional - Lizenz kann auch ohne User erstellt werden)
    let targetUser = null
    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } })
      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    } else if (email && email.trim()) {
      targetUser = await prisma.user.findUnique({ where: { email: email.trim() } })
      
      // User erstellen wenn nicht vorhanden
      if (!targetUser) {
        targetUser = await prisma.user.create({
          data: {
            email: email.trim(),
            password: '', // Wird beim ersten Login gesetzt
            role: 'USER',
          },
        })
      }
    }
    // Wenn weder userId noch email angegeben: Ungebundene Lizenz erstellen (ohne User)

    // Lizenzschlüssel generieren (unique check) - mit Pakettyp im Key!
    let licenseKey = generateLicenseKey(packageType)
    let attempts = 0
    while (await prisma.license.findUnique({ where: { licenseKey } })) {
      licenseKey = generateLicenseKey(packageType)
      attempts++
      if (attempts > 10) {
        return NextResponse.json({ error: 'Failed to generate unique license key' }, { status: 500 })
      }
    }

    const packageConfig = PACKAGE_LIMITS[packageType as PackageType]
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 Jahr gültig

    // Lizenz erstellen (mit oder ohne User)
    const license = await prisma.license.create({
      data: {
        userId: targetUser?.id || user.userId, // Wenn kein User, dem Admin zuweisen (wird später übertragen)
        licenseKey,
        packageType: packageType as PackageType,
        maxDomains: packageConfig.maxDomains,
        expiresAt,
        status: 'ACTIVE',
        isActive: true,
      },
    })

    // History-Eintrag
    await prisma.licenseHistory.create({
      data: {
        licenseId: license.id,
        action: 'CREATED',
        description: targetUser 
          ? `License created by admin for ${targetUser.email}` 
          : `Unbound license created by admin`,
        metadata: { packageType, admin: user.email, unbound: !targetUser },
      },
    })

    return NextResponse.json({
      success: true,
      license: {
        id: license.id,
        licenseKey: license.licenseKey,
        packageType: license.packageType,
        expiresAt: license.expiresAt,
        maxDomains: license.maxDomains,
        user: targetUser ? {
          id: targetUser.id,
          email: targetUser.email,
        } : null,
      },
    })
  } catch (error) {
    console.error('License generation failed:', error)
    return NextResponse.json(
      { error: 'License generation failed' },
      { status: 500 }
    )
  }
}

