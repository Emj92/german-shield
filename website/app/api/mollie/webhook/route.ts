import { NextRequest, NextResponse } from 'next/server'
import { createMollieClient } from '@mollie/api-client'

interface PaymentMetadata {
  email?: string
  package_type?: string
}

export async function POST(request: NextRequest) {
  try {
    // WICHTIG: Mollie sendet Form-Daten, nicht JSON!
    const formData = await request.formData()
    const id = formData.get('id') as string
    
    if (!id) {
      console.error('No payment ID in webhook')
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
    }

    console.log('📥 Webhook received for payment ID:', id)

    const mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY || '',
    })

    const payment = await mollieClient.payments.get(id)

    console.log('Webhook received for payment:', {
      id: payment.id,
      status: payment.status,
      metadata: payment.metadata,
    })

    if (payment.status === 'paid') {
      console.log('Payment successful:', {
        id: payment.id,
        amount: payment.amount,
        metadata: payment.metadata,
      })

      // E-Mail aus Metadata holen (wurde bei Payment-Erstellung gesetzt)
      const metadata = payment.metadata as PaymentMetadata
      const customerEmail = metadata?.email
      const packageType = metadata?.package_type || 'SINGLE'

      if (customerEmail) {
        try {
          // API-Call zum Portal um Shadow Account + Lizenz zu erstellen + E-Mail zu senden
          // WICHTIG: Portal URL muss explizit gesetzt werden, da webhook auf website-server läuft
          const portalUrl = 'https://portal.germanfence.de'
          
          console.log(`📧 Creating license for ${customerEmail}, package: ${packageType}`)
          console.log(`🌐 Portal URL: ${portalUrl}`)
          
          const response = await fetch(`${portalUrl}/api/payment/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: customerEmail,
              packageType: packageType.toUpperCase(),
              molliePaymentId: payment.id,
            }),
          })

          if (!response.ok) {
            console.error(`❌ Portal API returned ${response.status}`)
            const errorText = await response.text()
            console.error(`❌ Error: ${errorText}`)
            return NextResponse.json({ status: 'error', message: 'Portal API error' })
          }

          const result = await response.json()

          if (result.success) {
            console.log('✅ License created and email sent:', {
              licenseKey: result.licenseKey,
              email: customerEmail,
              packageType: result.packageType,
            })
          } else {
            console.error('❌ Failed to create license:', result.error)
          }
        } catch (error) {
          console.error('❌ Failed to process payment:', error)
        }
      } else {
        console.error('❌ No email in payment metadata')
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook processing failed:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

