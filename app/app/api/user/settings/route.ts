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
    const { name, company, street, zip, city, country, phone, website, vatId } = data

    // User aktualisieren
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        name: name || null,
        company: company || null,
        street: street || null,
        zipCode: zip || null,
        city: city || null,
        country: country || 'DE',
        phone: phone || null,
        website: website || null,
        vatId: vatId || null,
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
      where: { id: user.userId },
      select: {
        name: true,
        email: true,
        company: true,
        street: true,
        zipCode: true,
        city: true,
        country: true,
        phone: true,
        website: true,
        vatId: true,
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

