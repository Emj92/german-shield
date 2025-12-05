import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { licenseId } = await request.json()

    if (!licenseId) {
      return NextResponse.json({ error: 'License ID required' }, { status: 400 })
    }

    // Zuerst History-Eintrag
    await prisma.licenseHistory.create({
      data: {
        licenseId,
        action: 'DELETED',
        description: `License permanently deleted by admin`,
        metadata: { admin: user.email },
      },
    })

    // Dann Lizenz löschen
    await prisma.license.delete({
      where: { id: licenseId },
    })

    return NextResponse.json({
      success: true,
      message: 'License deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete license:', error)
    return NextResponse.json(
      { error: 'Failed to delete license' },
      { status: 500 }
    )
  }
}

