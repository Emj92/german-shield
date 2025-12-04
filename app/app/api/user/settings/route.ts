import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name } = data

    // User aktualisieren
    await prisma.user.update({
      where: { id: user.id || user.userId },
      data: {
        name: name || null,
        // TODO: Weitere Felder im User-Schema hinzufügen:
        // company, street, zip, city, country, phone, website, vatId
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Einstellungen gespeichert'
    })

  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Speichern'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id || user.userId },
      select: {
        name: true,
        email: true,
        // Weitere Felder wenn im Schema vorhanden
      }
    })

    return NextResponse.json({
      success: true,
      settings: userData
    })

  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Laden'
    }, { status: 500 })
  }
}

