import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // JSON-Body statt FormData
    const body = await request.json()
    
    const { firstName, lastName, company, subject, email, message } = body

    // Validierung
    if (!firstName || !lastName || !subject || !email || !message) {
      return NextResponse.json(
        { error: 'Bitte alle Pflichtfelder ausfüllen' },
        { status: 400 }
      )
    }

    // E-Mail über Resend senden
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY nicht konfiguriert')
      return NextResponse.json(
        { error: 'E-Mail-Service nicht konfiguriert' },
        { status: 500 }
      )
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
        to: ['support@germanfence.de'],
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
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${company || '-'}</td>
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
      return NextResponse.json(
        { error: 'E-Mail konnte nicht gesendet werden' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Kontaktformular Fehler:', error)
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
