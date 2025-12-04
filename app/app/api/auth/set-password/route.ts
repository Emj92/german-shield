import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token, E-Mail und Passwort erforderlich' 
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        success: false, 
        error: 'Passwort muss mindestens 8 Zeichen lang sein' 
      }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // User mit Token finden
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date() // Token noch gültig
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ungültiger oder abgelaufener Token. Bitte fordere einen neuen Link an.' 
      }, { status: 400 })
    }

    // Passwort hashen und speichern
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: true,
        verificationToken: null, // Token invalidieren
        verificationTokenExpiry: null,
      }
    })

    console.log(`Password set for user ${normalizedEmail}`)

    return NextResponse.json({
      success: true,
      message: 'Passwort erfolgreich gesetzt'
    })

  } catch (error) {
    console.error('Set password failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Setzen des Passworts'
    }, { status: 500 })
  }
}

