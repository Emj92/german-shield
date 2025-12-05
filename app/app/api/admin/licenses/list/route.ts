import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Alle Lizenzen laden mit User-Daten
    const licenses = await prisma.license.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      licenses: licenses.map(license => ({
        id: license.id,
        licenseKey: license.licenseKey,
        packageType: license.packageType,
        expiresAt: license.expiresAt,
        maxDomains: license.maxDomains,
        status: license.status,
        isActive: license.isActive,
        user: license.user,
      })),
    })
  } catch (error) {
    console.error('Failed to list licenses:', error)
    return NextResponse.json(
      { error: 'Failed to load licenses' },
      { status: 500 }
    )
  }
}

