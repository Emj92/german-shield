import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Aktives Banner für Website oder Portal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const target = searchParams.get('target') // 'website' oder 'portal'

    const now = new Date()

    const banner = await prisma.infoBanner.findFirst({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
        ...(target === 'website' ? { showOnWebsite: true } : {}),
        ...(target === 'portal' ? { showOnPortal: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!banner) {
      return NextResponse.json({ banner: null })
    }

    return NextResponse.json({ banner })
  } catch (error) {
    console.error('Error fetching active banner:', error)
    return NextResponse.json({ banner: null })
  }
}

