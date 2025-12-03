import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Lizenzschlüssel generieren (Format: GFXX-XXXX-XXXX-XXXX)
function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Ohne 0,O,1,I für bessere Lesbarkeit
  const segments = ['GF']
  
  for (let i = 0; i < 3; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)]
    }
    segments.push(segment)
  }
  
  return segments.join('-')
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
    const user = await getUser(request)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, packageType, email } = await request.json()

    // Validierung
    const validPackages: PackageType[] = ['FREE', 'SINGLE', 'FREELANCER', 'AGENCY']
    if (!packageType || !validPackages.includes(packageType as PackageType)) {
      return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
    }

    // User finden oder erstellen
    let targetUser
    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } })
    } else if (email) {
      targetUser = await prisma.user.findUnique({ where: { email } })
      
      // User erstellen wenn nicht vorhanden
      if (!targetUser) {
        targetUser = await prisma.user.create({
          data: {
            email,
            password: '', // Wird beim ersten Login gesetzt
            role: 'USER',
          },
        })
      }
    } else {
      return NextResponse.json({ error: 'userId or email required' }, { status: 400 })
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Lizenzschlüssel generieren (unique check)
    let licenseKey = generateLicenseKey()
    let attempts = 0
    while (await prisma.license.findUnique({ where: { licenseKey } })) {
      licenseKey = generateLicenseKey()
      attempts++
      if (attempts > 10) {
        return NextResponse.json({ error: 'Failed to generate unique license key' }, { status: 500 })
      }
    }

    const packageConfig = PACKAGE_LIMITS[packageType as PackageType]
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 Jahr gültig

    // Lizenz erstellen
    const license = await prisma.license.create({
      data: {
        userId: targetUser.id,
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
        description: `License created by admin for ${targetUser.email}`,
        metadata: { packageType, admin: user.email },
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
        user: {
          id: targetUser.id,
          email: targetUser.email,
        },
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

