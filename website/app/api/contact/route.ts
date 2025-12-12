import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const company = formData.get('company') as string || '-'
    const subject = formData.get('subject') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string

    // Validierung
    if (!firstName || !lastName || !subject || !email || !message) {
      return NextResponse.redirect(new URL('https://germanfence.de/?error=missing-fields'))
    }

    // E-Mail über Resend senden
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY nicht konfiguriert')
      return NextResponse.redirect(new URL('https://germanfence.de/?error=config'))
    }

    const subjectText = {
      support: 'Technischer Support',
      sales: 'Kaufanfrage',
      partnership: 'Partnerschaft',
      feedback: 'Feedback',
      other: 'Sonstiges'
    }[subject] || subject

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GermanFence Website <noreply@germanfence.de>',
        to: ['kontakt@germanfence.de'],
        reply_to: email,
        subject: `[Kontakt] ${subjectText} - ${firstName} ${lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22D6DD 0%, #1BA8B0 100%); padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📧 Neue Kontaktanfrage</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 150px;">Name:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Firma:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${company}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">E-Mail:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}" style="color: #22D6DD;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Anliegen:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${subjectText}</td>
                </tr>
              </table>
              
              <h3 style="margin-top: 25px; color: #1d2327;">Nachricht:</h3>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; white-space: pre-wrap;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              
              <p style="margin-top: 25px; color: #64748b; font-size: 14px;">
                Diese Nachricht wurde über das Kontaktformular auf germanfence.de gesendet.
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      console.error('Resend Fehler:', await response.text())
      return NextResponse.redirect(new URL('https://germanfence.de/?error=send-failed'))
    }

    // Erfolg - Weiterleitung zur Startseite mit Erfolgsmeldung
    return NextResponse.redirect(new URL('https://germanfence.de/?success=message-sent'))

  } catch (error) {
    console.error('Kontaktformular Fehler:', error)
    return NextResponse.redirect(new URL('https://germanfence.de/?error=server'))
  }
}

