import { NextRequest, NextResponse } from 'next/server'
import { createMollieClient } from '@mollie/api-client'

export async function POST(request: NextRequest) {
  try {
    const { amount, description, package_type, email } = await request.json()

    if (!amount || !package_type || !email) {
      return NextResponse.json(
        { error: 'Bitte alle Felder ausfüllen (E-Mail, Paket)' },
        { status: 400 }
      )
    }

    // API-Key prüfen
    const apiKey = process.env.MOLLIE_API_KEY
    if (!apiKey) {
      console.error('MOLLIE_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Zahlungssystem nicht konfiguriert. Bitte kontaktiere den Support.' },
        { status: 500 }
      )
    }

    const mollieClient = createMollieClient({
      apiKey: apiKey,
    })

    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.germanfence.de'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://germanfence.de'

    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: Number(amount).toFixed(2),
      },
      description: description || `GermanFence ${package_type} License`,
      redirectUrl: `${portalUrl}/login?payment=success&package=${package_type}`,
      webhookUrl: `${baseUrl}/api/mollie/webhook`,
      metadata: {
        package_type: package_type,
        email: email,
      },
    })

    return NextResponse.json({ 
      checkoutUrl: payment.getCheckoutUrl(),
      paymentId: payment.id 
    })
  } catch (error: unknown) {
    console.error('Mollie payment creation failed:', error)
    
    // Bessere Fehlermeldung basierend auf Fehlertyp
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    
    if (errorMessage.includes('Invalid API key')) {
      return NextResponse.json(
        { error: 'Ungültiger API-Schlüssel. Bitte kontaktiere den Support.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: `Zahlung konnte nicht erstellt werden: ${errorMessage}` },
      { status: 500 }
    )
  }
}

