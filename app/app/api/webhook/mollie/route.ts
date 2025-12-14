import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const paymentId = body.id

    if (!paymentId) {
      console.error('❌ No payment ID in webhook')
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
    }

    console.log('🔔 Mollie webhook received for payment:', paymentId)

    // Fetch payment details from Mollie
    const mollieResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
      },
    })

    if (!mollieResponse.ok) {
      console.error('❌ Failed to fetch payment from Mollie')
      return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
    }

    const payment = await mollieResponse.json()
    console.log('💳 Payment status:', payment.status)
    console.log('📦 Payment metadata:', payment.metadata)

    // Only process paid payments
    if (payment.status !== 'paid') {
      console.log('⏳ Payment not paid yet, ignoring')
      return NextResponse.json({ success: true, message: 'Payment not paid yet' })
    }

    const metadata = payment.metadata

    // Handle upgrade payments
    if (metadata?.type === 'upgrade') {
      console.log('🚀 Processing upgrade payment')
      
      const { subscriptionId, targetPackage, netAmount, taxAmount, grossAmount } = metadata

      // Update subscription
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          packageType: targetPackage,
          netAmount: parseFloat(netAmount),
          taxAmount: parseFloat(taxAmount),
          grossAmount: parseFloat(grossAmount),
        },
      })

      // Update invoice status
      await prisma.invoice.updateMany({
        where: {
          molliePaymentId: paymentId,
          status: 'PENDING',
        },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      })

      // Update license package type
      const updatedSubscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      })

      if (updatedSubscription?.licenseId) {
        const maxDomains = targetPackage === 'SINGLE' ? 1 : 
                          targetPackage === 'FREELANCER' ? 5 : 
                          targetPackage === 'AGENCY' ? 25 : 1

        await prisma.license.update({
          where: { id: updatedSubscription.licenseId },
          data: {
            packageType: targetPackage,
            maxDomains,
          },
        })
      }

      console.log('✅ Upgrade processed successfully')
      return NextResponse.json({ success: true, message: 'Upgrade processed' })
    }

    // Handle regular payments (initial purchases)
    // These are already processed by /api/payment/process
    // This webhook just confirms the payment
    console.log('✅ Regular payment confirmed')
    return NextResponse.json({ success: true, message: 'Payment confirmed' })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

