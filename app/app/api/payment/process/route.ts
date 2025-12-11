import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

function generateLicenseKey(packageType: string): string {
  const prefix = packageType === 'SINGLE' ? 'GS-SINGLE' : 
                 packageType === 'FREELANCER' ? 'GS-FREELANCER' : 
                 packageType === 'AGENCY' ? 'GS-AGENCY' : 'GS-FREE'
  
  const random = Math.random().toString(36).substring(2, 15).toUpperCase()
  return `${prefix}-${random}`
}

function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      packageType,
      molliePaymentId,
      mollieCustomerId,
      mollieSubscriptionId,
      netAmount,
      taxAmount,
      taxRate,
      grossAmount,
      isBusiness,
      companyName,
      vatId,
      street,
      zipCode,
      city,
      country
    } = await request.json()

    console.log('📦 Processing payment:', { email, packageType, molliePaymentId })

    // 1. Finde oder erstelle User (Shadow Account)
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('👤 Creating shadow account for:', email)
      
      // Generiere temporäres Passwort
      const tempPassword = Math.random().toString(36).substring(2, 15)
      const hashedPassword = await bcrypt.hash(tempPassword, 12)
      
      // Erstelle Verification Token für Passwort-Setup
      const verificationToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
      const verificationTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 Tage

      user = await prisma.user.create({
        data: {
          email,
          name: isBusiness && companyName ? companyName : null,
          password: hashedPassword,
          role: 'USER',
          emailVerified: false,
          verificationToken,
          verificationTokenExpiry
        }
      })

      console.log('✅ Shadow account created:', user.id)
    } else {
      console.log('✅ User already exists:', user.id)
    }

    // 2. Erstelle License
    const licenseKey = generateLicenseKey(packageType)
    const maxDomains = packageType === 'SINGLE' ? 1 : 
                       packageType === 'FREELANCER' ? 5 : 
                       packageType === 'AGENCY' ? 25 : 1

    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 Jahr gültig

    const license = await prisma.license.create({
      data: {
        userId: user.id,
        licenseKey,
        packageType: packageType as 'FREE' | 'SINGLE' | 'FREELANCER' | 'AGENCY',
        status: 'ACTIVE',
        isActive: true,
        expiresAt,
        maxDomains,
        molliePaymentId
      }
    })

    console.log('✅ License created:', licenseKey)

    // 3. Erstelle Subscription (falls Subscription ID vorhanden)
    let subscription = null
    if (mollieSubscriptionId) {
      const nextPaymentDate = new Date()
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1)

      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          licenseId: license.id,
          mollieSubscriptionId,
          mollieCustomerId,
          packageType: packageType as 'FREE' | 'SINGLE' | 'FREELANCER' | 'AGENCY',
          netAmount: netAmount || grossAmount,
          taxAmount: taxAmount || 0,
          taxRate: taxRate || 0,
          grossAmount: grossAmount,
          currency: 'EUR',
          interval: '12 months',
          status: 'ACTIVE',
          nextPaymentDate,
          description: `GermanFence ${packageType} - Jahresabo`
        }
      })

      console.log('✅ Subscription created:', subscription.id)
    }

    // 4. Erstelle Invoice/Rechnung
    const invoiceNumber = generateInvoiceNumber()
    const taxLabel = country === 'DE' ? 'MwSt.' :
                     country === 'AT' ? 'MwSt.' :
                     country === 'CH' ? 'MwSt.' :
                     country === 'US' ? 'Tax' :
                     country === 'CN' ? 'VAT' :
                     country === 'IN' ? 'GST' :
                     country === 'IT' ? 'IVA' :
                     country === 'FR' ? 'TVA' : 'VAT'

    const taxExempt = isBusiness && vatId && taxAmount === 0 && country !== 'DE'

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber,
        netAmount: netAmount || grossAmount,
        taxAmount: taxAmount || 0,
        taxRate: taxRate || 0,
        grossAmount: grossAmount,
        currency: 'EUR',
        taxLabel,
        taxExempt,
        isBusiness: isBusiness || false,
        companyName,
        vatId,
        street,
        zipCode,
        city,
        country: country || 'DE',
        status: 'PAID',
        description: `GermanFence ${packageType} License - Jahr 1`,
        molliePaymentId,
        subscriptionId: subscription?.id,
        paidAt: new Date()
      }
    })

    // PDF-URL setzen (zeigt auf die PDF-Route)
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfUrl: `/api/invoices/${invoice.id}/pdf` }
    })

    console.log('✅ Invoice created:', invoiceNumber)

    // 5. Sende E-Mail mit Lizenzschlüssel + Passwort-Setup Link
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const passwordSetupUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://portal.germanfence.de'}/set-password?token=${user.verificationToken}`

      await resend.emails.send({
        from: 'GermanFence <hallo@germanfence.de>',
        to: email,
        subject: `🎉 Dein GermanFence ${packageType} Lizenzschlüssel`,
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
                .license-box { background: rgba(34, 214, 221, 0.1); border: 2px solid #22D6DD; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .license-key { font-size: 24px; font-weight: bold; font-family: monospace; color: #22D6DD; letter-spacing: 2px; }
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
                  <h2>Vielen Dank für deinen Kauf!</h2>
                  <p>Deine Zahlung war erfolgreich. Hier ist dein Lizenzschlüssel für <strong>GermanFence ${packageType}</strong>:</p>
                  
                  <div class="license-box">
                    <div style="font-size: 15px; color: #6b7280; margin-bottom: 10px;">Dein Lizenzschlüssel:</div>
                    <div class="license-key">${licenseKey}</div>
                  </div>

                  ${subscription ? `
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <strong>🔄 Automatische Verlängerung:</strong><br>
                    Dein Abo verlängert sich automatisch jährlich. Nächste Zahlung: ${subscription.nextPaymentDate?.toLocaleDateString('de-DE') || 'in 12 Monaten'}<br>
                    Du kannst jederzeit in deinem Dashboard kündigen.
                  </div>
                  ` : ''}

                  <h3>📋 Rechnung:</h3>
                  <p>
                    Rechnungsnummer: <strong>${invoiceNumber}</strong><br>
                    Betrag: ${netAmount.toFixed(2)}€ ${taxAmount > 0 ? `+ ${taxAmount.toFixed(2)}€ ${taxLabel}` : ''} = <strong>${grossAmount.toFixed(2)}€</strong>
                  </p>

                  <h3>🚀 Nächste Schritte:</h3>
                  <ol>
                    <li><strong>Passwort setzen:</strong> Klicke auf den Button um dein Portal-Passwort zu setzen</li>
                    <li><strong>Plugin installieren:</strong> Lade das Plugin herunter und installiere es in WordPress</li>
                    <li><strong>Lizenz aktivieren:</strong> Gehe zu GermanFence → Lizenz und gib deinen Schlüssel ein</li>
                  </ol>

                  <div style="text-align: center;">
                    <a href="${passwordSetupUrl}" class="button">
                      🔐 Passwort setzen & loslegen
                    </a>
                  </div>

                  <div class="footer">
                    <p>Bei Fragen erreichst du uns unter <a href="mailto:support@germanfence.de" style="color: #22D6DD;">support@germanfence.de</a></p>
                    <p style="font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} GermanFence. Alle Rechte vorbehalten.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      })

      console.log('✅ Email sent to:', email)
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError)
      // Trotzdem erfolgreich zurückgeben
    }

    return NextResponse.json({
      success: true,
      licenseKey,
      packageType,
      invoiceNumber,
      subscriptionCreated: !!subscription
    })

  } catch (error) {
    console.error('❌ Payment processing failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
