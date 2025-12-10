import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

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

    // Prüfe ob User existiert UND bereits verifiziert ist
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: 'E-Mail bereits registriert. Bitte melde dich an.' },
        { status: 400 }
      )
    }

    // Falls User existiert aber NICHT verifiziert ist, lösche ihn und erlaube Neuregistrierung
    if (existingUser && !existingUser.emailVerified) {
      console.log('🗑️ Lösche unverifizierten User:', existingUser.email)
      await prisma.user.delete({
        where: { id: existingUser.id }
      })
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

    // Sende Verifizierungs-E-Mail mit Resend
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://portal.germanfence.de'}/verify-email?token=${verificationToken}`
    
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: 'GermanFence <hallo@germanfence.de>',
        to: email,
        subject: '✅ Bestätige deine E-Mail-Adresse - GermanFence',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1d2327; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #22D6DD 0%, #1EBEC5 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .content { background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #22D6DD; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
                .button:hover { background: #1EBEC5; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 15px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🛡️ GermanFence</h1>
                </div>
                <div class="content">
                  <h2>Willkommen bei GermanFence!</h2>
                  <p>Vielen Dank für deine Registrierung. Bitte bestätige deine E-Mail-Adresse, um deinen Account zu aktivieren:</p>
                  
                  <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">
                      ✅ E-Mail bestätigen
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 15px; margin-top: 30px;">
                    Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
                    <a href="${verificationUrl}" style="color: #22D6DD; word-break: break-all;">${verificationUrl}</a>
                  </p>
                  
                  <p style="color: #6b7280; font-size: 15px; margin-top: 20px;">
                    Dieser Link ist 24 Stunden gültig.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  
                  <p style="color: #6b7280; font-size: 13px;">
                    Du hast dich nicht registriert? Dann ignoriere diese E-Mail einfach.
                  </p>
                </div>
                <div class="footer">
                  <p>© 2024 GermanFence - Made in Germany 🇩🇪</p>
                  <p>
                    <a href="https://germanfence.de" style="color: #22D6DD; text-decoration: none;">Website</a> •
                    <a href="https://portal.germanfence.de" style="color: #22D6DD; text-decoration: none;">Portal</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      console.log('✅ Verifizierungs-E-Mail versendet an:', email)
    } catch (emailError) {
      console.error('❌ E-Mail-Versand fehlgeschlagen:', emailError)
      // Trotzdem User erstellen, aber Warnung loggen
    }

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

