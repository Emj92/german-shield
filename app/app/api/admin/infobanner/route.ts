import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: Alle Banner abrufen (für Admin)
export async function GET() {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const banners = await prisma.infoBanner.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ banners })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Neuen Banner erstellen
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      text,
      backgroundColor,
      textColor,
      closeButtonColor,
      showOnWebsite,
      showOnPortal,
      expiresAt,
    } = body

    if (!text) {
      return NextResponse.json({ error: 'Text ist erforderlich' }, { status: 400 })
    }

    const banner = await prisma.infoBanner.create({
      data: {
        text,
        backgroundColor: backgroundColor || '#22D6DD',
        textColor: textColor || '#ffffff',
        closeButtonColor: closeButtonColor || '#ffffff',
        showOnWebsite: showOnWebsite ?? true,
        showOnPortal: showOnPortal ?? true,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json({ success: true, banner })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

