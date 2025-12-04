import { NextRequest, NextResponse } from 'next/server'
import { createMollieClient } from '@mollie/api-client'

interface PaymentMetadata {
  email?: string
  package_type?: string
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

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
          const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.germanfence.de'
          
          console.log(`Creating license for ${customerEmail}, package: ${packageType}`)
          
          const response = await fetch(`${portalUrl}/api/payment/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-secret': process.env.WEBHOOK_SECRET || '',
            },
            body: JSON.stringify({
              email: customerEmail,
              packageType: packageType.toUpperCase(),
              molliePaymentId: payment.id,
            }),
          })

          const result = await response.json()

          if (result.success) {
            console.log('✅ License created and email sent:', {
              licenseKey: result.licenseKey,
              email: customerEmail,
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

