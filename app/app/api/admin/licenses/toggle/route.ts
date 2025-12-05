import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { licenseId, isActive } = await request.json()

    if (!licenseId) {
      return NextResponse.json({ error: 'License ID required' }, { status: 400 })
    }

    // Lizenz aktualisieren
    const license = await prisma.license.update({
      where: { id: licenseId },
      data: { 
        isActive,
        status: isActive ? 'ACTIVE' : 'BLOCKED',
      },
    })

    // History-Eintrag
    await prisma.licenseHistory.create({
      data: {
        licenseId: license.id,
        action: isActive ? 'ACTIVATED' : 'BLOCKED',
        description: `License ${isActive ? 'activated' : 'blocked'} by admin`,
        metadata: { admin: user.email },
      },
    })

    return NextResponse.json({
      success: true,
      license: {
        id: license.id,
        isActive: license.isActive,
        status: license.status,
      },
    })
  } catch (error) {
    console.error('Failed to toggle license:', error)
    return NextResponse.json(
      { error: 'Failed to update license' },
      { status: 500 }
    )
  }
}

