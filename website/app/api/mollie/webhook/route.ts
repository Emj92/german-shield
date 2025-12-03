import { NextRequest, NextResponse } from 'next/server'
import { createMollieClient } from '@mollie/api-client'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

    const mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY || '',
    })

    const payment = await mollieClient.payments.get(id)

    if (payment.isPaid()) {
      // TODO: Lizenz erstellen und per E-Mail versenden
      console.log('Payment successful:', {
        id: payment.id,
        amount: payment.amount,
        metadata: payment.metadata,
      })
      
      // Hier später: Lizenzschlüssel generieren und E-Mail versenden
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

