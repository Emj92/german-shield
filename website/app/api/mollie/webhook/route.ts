import { NextRequest, NextResponse } from 'next/server'
import { createMollieClient } from '@mollie/api-client'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

    const mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY || '',
    })

    const payment = await mollieClient.payments.get(id)

    if (payment.status === 'paid') {
      console.log('Payment successful:', {
        id: payment.id,
        amount: payment.amount,
        metadata: payment.metadata,
      })

      // Lizenz automatisch erstellen
      // E-Mail aus Metadata holen (wurde bei Payment-Erstellung gesetzt)
      const customerEmail = payment.metadata?.email as string | undefined
      const packageType = payment.metadata?.package_type as string | undefined || 'SINGLE'

      if (customerEmail) {
        try {
          // API-Call zum Portal um Lizenz zu erstellen
          const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.germanfence.de'
          const response = await fetch(`${portalUrl}/api/admin/licenses/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ADMIN_API_KEY}`, // Interner API-Key
            },
            body: JSON.stringify({
              email: customerEmail,
              packageType: packageType.toUpperCase(),
              molliePaymentId: payment.id,
            }),
          })

          const licenseData = await response.json()

          if (licenseData.success) {
            console.log('License created:', licenseData.license.licenseKey)
            // TODO: E-Mail mit Lizenzschlüssel versenden
          }
        } catch (error) {
          console.error('Failed to create license:', error)
        }
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

