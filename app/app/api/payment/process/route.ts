import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { Resend } from 'resend'

// Resend für E-Mail-Versand
const resend = new Resend(process.env.RESEND_API_KEY)

// Lizenzschlüssel generieren
function generateLicenseKey(packageType: string): string {
  const prefix = packageType === 'FREE' ? 'GS-FREE' : 
                 packageType === 'SINGLE' ? 'GS-SINGLE' :
                 packageType === 'FREELANCER' ? 'GS-FREELANCER' :
                 packageType === 'AGENCY' ? 'GS-AGENCY' : 'GS-PRO'
  
  const random = crypto.randomBytes(12).toString('hex').toUpperCase()
  // Format: GS-AGENCY-XXXX-XXXX-XXXX
  return `${prefix}-${random.slice(0,4)}-${random.slice(4,8)}-${random.slice(8,12)}`
}

// Passwort-Reset-Token generieren
function generatePasswordToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Max Domains basierend auf Pakettyp
function getMaxDomains(packageType: string): number {
  switch (packageType) {
    case 'SINGLE': return 1
    case 'FREELANCER': return 5
    case 'AGENCY': return 25
    default: return 1
  }
}

// Preis basierend auf Pakettyp
function getPrice(packageType: string): number {
  switch (packageType) {
    case 'SINGLE': return 19
    case 'FREELANCER': return 39
    case 'AGENCY': return 99
    default: return 0
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, packageType, molliePaymentId } = await request.json()

    if (!email || !packageType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email und Pakettyp erforderlich' 
      }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedPackageType = packageType.toUpperCase()

    console.log(`Processing payment for ${normalizedEmail}, package: ${normalizedPackageType}`)

    // 1. Shadow Account erstellen oder existierenden User holen
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    const passwordResetToken = generatePasswordToken()
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 Tage gültig

    if (!user) {
      // Neuen Shadow Account erstellen (ohne echtes Passwort)
      const tempPassword = crypto.randomBytes(32).toString('hex') // Nicht nutzbar
      
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: tempPassword, // Wird durch Passwort-Setzen ersetzt
          emailVerified: true, // Durch Zahlung verifiziert
          verificationToken: passwordResetToken,
          verificationTokenExpiry: tokenExpiry,
        }
      })
      console.log(`Shadow account created for ${normalizedEmail}`)
    } else {
      // Existierenden User aktualisieren - Token für Passwort setzen
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: passwordResetToken,
          verificationTokenExpiry: tokenExpiry,
        }
      })
      console.log(`Existing user updated: ${normalizedEmail}`)
    }

    // 2. Lizenz generieren
    const licenseKey = generateLicenseKey(normalizedPackageType)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 Jahr gültig

    const license = await prisma.license.create({
      data: {
        userId: user.id,
        licenseKey: licenseKey,
        packageType: normalizedPackageType as 'FREE' | 'SINGLE' | 'FREELANCER' | 'AGENCY',
        status: 'ACTIVE',
        isActive: true,
        expiresAt: expiresAt,
        maxDomains: getMaxDomains(normalizedPackageType),
        molliePaymentId: molliePaymentId || null,
      }
    })

    // 3. Lizenz-History eintragen
    await prisma.licenseHistory.create({
      data: {
        licenseId: license.id,
        action: 'CREATED',
        description: `${normalizedPackageType} Lizenz erstellt nach Zahlung`,
        metadata: { molliePaymentId, email: normalizedEmail }
      }
    })

    // 4. Rechnung erstellen
    const invoiceNumber = `GF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber: invoiceNumber,
        amount: getPrice(normalizedPackageType),
        currency: 'EUR',
        status: 'PAID',
        description: `GermanFence ${normalizedPackageType} Lizenz - 1 Jahr`,
        paidAt: new Date(),
      }
    })

    console.log(`License ${licenseKey} created for ${normalizedEmail}`)

    // 5. E-Mail senden
    const packageNames: { [key: string]: string } = {
      'SINGLE': 'Single (1 Domain)',
      'FREELANCER': 'Freelancer (5 Domains)',
      'AGENCY': 'Agency (25 Domains)',
    }

    const passwordSetUrl = `https://portal.germanfence.de/set-password?token=${passwordResetToken}&email=${encodeURIComponent(normalizedEmail)}`
    const dashboardUrl = 'https://portal.germanfence.de/login'
    const downloadUrl = 'https://germanfence.de/downloads/germanfence-plugin.zip'

    try {
      await resend.emails.send({
        from: 'GermanFence <noreply@germanfence.de>',
        to: normalizedEmail,
        subject: `🎉 Dein GermanFence ${packageNames[normalizedPackageType] || normalizedPackageType} Lizenzschlüssel`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 28px; font-weight: bold; color: #22D6DD; }
    .success-icon { font-size: 64px; margin-bottom: 20px; }
    .license-box { background: linear-gradient(135deg, #22D6DD10 0%, #22D6DD05 100%); border: 2px solid #22D6DD; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0; }
    .license-key { font-family: 'Monaco', 'Consolas', monospace; font-size: 20px; font-weight: bold; color: #22D6DD; letter-spacing: 2px; margin: 10px 0; word-break: break-all; }
    .btn { display: inline-block; padding: 14px 28px; background: #22D6DD; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
    .btn-outline { background: transparent; border: 2px solid #22D6DD; color: #22D6DD !important; }
    .steps { background: #f8fafc; border-radius: 12px; padding: 24px; margin: 30px 0; }
    .steps h3 { margin-top: 0; color: #22D6DD; }
    .steps ol { margin: 0; padding-left: 20px; }
    .steps li { margin: 10px 0; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
    .highlight { background: #22D6DD20; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">🎉</div>
      <div class="logo">GermanFence</div>
      <h1 style="margin: 20px 0 10px;">Vielen Dank für deinen Kauf!</h1>
      <p style="color: #64748b; font-size: 18px;">Deine <strong>${packageNames[normalizedPackageType] || normalizedPackageType}</strong> Lizenz ist bereit.</p>
    </div>
    
    <div class="license-box">
      <p style="margin: 0 0 10px 0; color: #64748b;">Dein Lizenzschlüssel:</p>
      <div class="license-key">${licenseKey}</div>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">Gültig bis: ${expiresAt.toLocaleDateString('de-DE')}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${passwordSetUrl}" class="btn">🔐 Passwort setzen & Dashboard</a>
      <a href="${downloadUrl}" class="btn btn-outline">📥 Plugin herunterladen</a>
    </div>
    
    <div class="steps">
      <h3>🚀 So startest du:</h3>
      <ol>
        <li><strong>Passwort setzen:</strong> Klicke auf den Button oben, um dein Dashboard-Passwort festzulegen.</li>
        <li><strong>Plugin herunterladen:</strong> Lade das Plugin herunter und installiere es in WordPress.</li>
        <li><strong>Lizenz aktivieren:</strong> Gehe zu <span class="highlight">GermanFence → Lizenz</span> und gib deinen Schlüssel ein.</li>
        <li><strong>Schutz aktivieren:</strong> Aktiviere die gewünschten Schutzfunktionen im Dashboard.</li>
      </ol>
    </div>
    
    <div class="footer">
      <p>Bei Fragen erreichst du uns unter:<br>
      <a href="mailto:support@germanfence.de" style="color: #22D6DD;">support@germanfence.de</a></p>
      <p style="margin-top: 20px;">
        <a href="https://germanfence.de" style="color: #64748b;">Website</a> · 
        <a href="${dashboardUrl}" style="color: #64748b;">Dashboard</a> · 
        <a href="https://germanfence.de/datenschutz" style="color: #64748b;">Datenschutz</a>
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} GermanFence · Made in Germany 🇩🇪
      </p>
    </div>
  </div>
</body>
</html>
        `,
      })
      console.log(`Email sent to ${normalizedEmail}`)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Nicht abbrechen - Lizenz wurde bereits erstellt
    }

    return NextResponse.json({
      success: true,
      licenseKey: licenseKey,
      expiresAt: expiresAt.toISOString(),
      packageType: normalizedPackageType,
      email: normalizedEmail,
      passwordSetUrl: passwordSetUrl,
    })

  } catch (error) {
    console.error('Payment processing failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed'
    }, { status: 500 })
  }
}

