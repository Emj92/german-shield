import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// CORS Headers für Website-Zugriff
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

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
      return NextResponse.json({ banner: null }, { headers: corsHeaders })
    }

    return NextResponse.json({ banner }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching active banner:', error)
    return NextResponse.json({ banner: null }, { headers: corsHeaders })
  }
}

