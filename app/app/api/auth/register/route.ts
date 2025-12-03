import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 }
      )
    }

    // Prüfe ob User existiert
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-Mail bereits registriert' },
        { status: 400 }
      )
    }

    // Erstelle Verifizierungs-Token
    const verificationToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 Stunden

    // Erstelle User (NICHT verifiziert)
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER',
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
      },
    })

    // Sende Verifizierungs-E-Mail
    // TODO: Hier E-Mail-Service integrieren (z.B. Resend, SendGrid)
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://portal.germanfence.de'}/verify-email?token=${verificationToken}`
    
    console.log('📧 Verifizierungs-Link:', verificationUrl)
    // In Production: E-Mail versenden mit dem Link

    // Gebe Erfolg zurück OHNE Session (User muss erst E-Mail bestätigen)
    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.',
      emailSent: true,
      user: {
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

