import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    console.log('🔍 Verifizierung gestartet für Token:', token)

    if (!token) {
      console.log('❌ Kein Token gefunden')
      return NextResponse.json(
        { error: 'Kein Verifizierungs-Token angegeben' },
        { status: 400 }
      )
    }

    // Finde User mit diesem Token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    })

    console.log('👤 User gefunden:', user ? `${user.email} (emailVerified: ${user.emailVerified})` : 'NICHT GEFUNDEN')

    if (!user) {
      console.log('❌ User mit diesem Token nicht gefunden')
      return NextResponse.json(
        { error: 'Ungültiger Verifizierungs-Link' },
        { status: 400 }
      )
    }

    // Prüfe ob Token abgelaufen ist
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      console.log('❌ Token abgelaufen:', user.verificationTokenExpiry)
      return NextResponse.json(
        { error: 'Dieser Verifizierungs-Link ist abgelaufen. Bitte registriere dich erneut.' },
        { status: 400 }
      )
    }

    // Prüfe ob bereits verifiziert
    if (user.emailVerified) {
      console.log('✅ E-Mail bereits verifiziert, erstelle Session...')
      
      // Erstelle Session für bereits verifizierten User
      const sessionToken = await new SignJWT({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET)

      await prisma.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://portal.germanfence.de'
      const response = NextResponse.redirect(`${baseUrl}/dashboard?verified=true`)

      response.cookies.set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return response
    }

    // Verifiziere User
    console.log('✅ Verifiziere User...')
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    })

    // Erstelle Session
    console.log('🔐 Erstelle Session...')
    const sessionToken = await new SignJWT({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    // Redirect zum Dashboard mit Session-Cookie
    console.log('🎉 Verifizierung erfolgreich, redirect zum Dashboard')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://portal.germanfence.de'
    const response = NextResponse.redirect(`${baseUrl}/dashboard?verified=true`)

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('❌ Verification error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

