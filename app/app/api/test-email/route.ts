import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: '❌ RESEND_API_KEY ist NICHT gesetzt!',
        help: 'Bitte setze RESEND_API_KEY=re_xxxxxxxx in app/.env'
      }, { status: 500 })
    }

    if (!apiKey.startsWith('re_')) {
      return NextResponse.json({
        success: false,
        error: '❌ RESEND_API_KEY hat falsches Format!',
        help: 'Key muss mit "re_" beginnen',
        currentKey: apiKey.substring(0, 10) + '...'
      }, { status: 500 })
    }

    // Teste Resend
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const testEmail = request.nextUrl.searchParams.get('email') || 'test@example.com'

    const result = await resend.emails.send({
      from: 'GermanFence <hallo@germanfence.de>',
      to: testEmail,
      subject: '✅ Test E-Mail - GermanFence',
      html: `
        <h1>Test erfolgreich!</h1>
        <p>Resend API funktioniert korrekt.</p>
        <p>Zeit: ${new Date().toLocaleString('de-DE')}</p>
      `
    })

    return NextResponse.json({
      success: true,
      message: '✅ RESEND_API_KEY ist korrekt konfiguriert!',
      emailSent: true,
      result: result
    })

  } catch (error: any) {
    console.error('Resend test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: '❌ Resend API Fehler',
      details: error.message,
      help: 'Prüfe ob RESEND_API_KEY korrekt ist und hallo@germanfence.de in Resend verifiziert ist'
    }, { status: 500 })
  }
}

