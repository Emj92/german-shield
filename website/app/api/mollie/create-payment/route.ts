import { NextRequest, NextResponse } from 'next/server'
import { createMollieClient } from '@mollie/api-client'

export async function POST(request: NextRequest) {
  try {
    const { amount, description, package_type } = await request.json()

    const mollieClient = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY || '',
    })

    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: amount.toFixed(2),
      },
      description: description,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?package=${package_type}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mollie/webhook`,
      metadata: {
        package_type: package_type,
      },
    })

    return NextResponse.json({ 
      checkoutUrl: payment.getCheckoutUrl(),
      paymentId: payment.id 
    })
  } catch (error) {
    console.error('Mollie payment creation failed:', error)
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    )
  }
}

