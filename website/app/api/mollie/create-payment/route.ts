import { NextRequest, NextResponse } from 'next/server'
import { createMollieClient } from '@mollie/api-client'

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      netAmount,
      taxAmount,
      taxRate,
      description, 
      package_type, 
      email,
      isBusiness,
      companyName,
      vatId,
      street,
      zipCode,
      city,
      country
    } = await request.json()

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

    // WARNUNG: Test-Key Erkennung
    if (apiKey.startsWith('test_')) {
      console.warn('⚠️ WARNUNG: Test-API-Key wird verwendet! Echte Zahlungen werden NICHT verarbeitet.')
      console.warn('Bitte setze MOLLIE_API_KEY auf einen Live-Key (live_...)')
    } else if (apiKey.startsWith('live_')) {
      console.log('✅ Live-API-Key wird verwendet')
    }

    const mollieClient = createMollieClient({
      apiKey: apiKey,
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://germanfence.de'

    // Redirect zur Success Page
    const redirectUrl = `${baseUrl}/payment/success?package=${package_type}&email=${encodeURIComponent(email)}`

    // WICHTIG: Erstelle Customer für Subscription (wiederholende Zahlungen)
    console.log('📋 Creating Mollie Customer for subscription...')
    const customer = await mollieClient.customers.create({
      name: isBusiness && companyName ? companyName : email,
      email: email,
      metadata: {
        package_type: package_type,
        isBusiness: isBusiness ? 'true' : 'false',
        ...(isBusiness && {
          companyName,
          vatId,
          street,
          zipCode,
          city,
          country
        })
      }
    })

    console.log('✅ Customer created:', customer.id)

    // Erstelle erste Zahlung (wird automatisch zu Subscription nach Zahlung)
    const payment = await mollieClient.payments.create({
      customerId: customer.id,
      amount: {
        currency: 'EUR',
        value: Number(amount).toFixed(2),
      },
      description: description || `GermanFence ${package_type} License - Jahr 1`,
      redirectUrl: redirectUrl,
      webhookUrl: `${baseUrl}/api/mollie/webhook`,
      sequenceType: 'first', // Erste Zahlung einer Subscription
      metadata: {
        package_type: package_type,
        email: email,
        customerId: customer.id,
        netAmount: netAmount?.toString() || amount.toString(),
        taxAmount: taxAmount?.toString() || '0',
        taxRate: taxRate?.toString() || '0',
        isBusiness: isBusiness ? 'true' : 'false',
        ...(isBusiness && {
          companyName,
          vatId,
          street,
          zipCode,
          city,
          country
        })
      },
    })

    console.log('💳 First payment created:', {
      id: payment.id,
      customerId: customer.id,
      email: email,
      package: package_type,
      amount: amount
    })

    return NextResponse.json({ 
      checkoutUrl: payment.getCheckoutUrl(),
      paymentId: payment.id,
      customerId: customer.id
    })
  } catch (error: unknown) {
    console.error('Mollie payment creation failed:', error)
    
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

