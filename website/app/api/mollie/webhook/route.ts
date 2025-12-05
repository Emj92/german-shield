import { NextRequest, NextResponse } from 'next/server'
import { createMollieClient } from '@mollie/api-client'

interface PaymentMetadata {
  email?: string
  package_type?: string
  customerId?: string
  netAmount?: string
  taxAmount?: string
  taxRate?: string
  isBusiness?: string
  companyName?: string
  vatId?: string
  street?: string
  zipCode?: string
  city?: string
  country?: string
  subscriptionId?: string
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

    console.log('📋 Payment details:', {
      id: payment.id,
      status: payment.status,
      sequenceType: payment.sequenceType,
      customerId: payment.customerId,
      metadata: payment.metadata,
    })

    if (payment.status === 'paid') {
      console.log('✅ Payment successful:', {
        id: payment.id,
        amount: payment.amount,
        metadata: payment.metadata,
      })

      const metadata = payment.metadata as PaymentMetadata
      const customerEmail = metadata?.email
      const packageType = metadata?.package_type || 'SINGLE'
      const customerId = metadata?.customerId || payment.customerId

      if (!customerEmail) {
        console.error('❌ No email in payment metadata')
        return NextResponse.json({ status: 'error', message: 'No email' }, { status: 400 })
      }

      // WICHTIG: Nach erster Zahlung -> Subscription erstellen
      if (payment.sequenceType === 'first' && customerId) {
        console.log('🔄 First payment detected - creating subscription...')
        
        try {
          // Berechne nächstes Zahlungsdatum (in 12 Monaten)
          const nextPaymentDate = new Date()
          nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1)
          
          const subscription = await mollieClient.customerSubscriptions.create({
            customerId: customerId,
            amount: {
              currency: 'EUR',
              value: payment.amount.value,
            },
            interval: '12 months',
            description: `GermanFence ${packageType} License - Jahresabo`,
            webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://germanfence.de'}/api/mollie/webhook`,
            startDate: nextPaymentDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
            metadata: {
              package_type: packageType,
              email: customerEmail,
              ...metadata
            }
          })

          console.log('✅ Subscription created:', {
            id: subscription.id,
            customerId: customerId,
            nextPaymentDate: subscription.nextPaymentDate,
            status: subscription.status
          })

          // Füge Subscription ID zu Metadata hinzu für Portal
          const extendedMetadata = {
            ...metadata,
            subscriptionId: subscription.id
          }
        } catch (subError) {
          console.error('❌ Failed to create subscription:', subError)
          // Trotzdem weitermachen - Lizenz wird erstellt
        }
      }

      // API-Call zum Portal um Account + Lizenz + Invoice zu erstellen
      try {
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
            mollieCustomerId: customerId,
            mollieSubscriptionId: subscription?.id || metadata.subscriptionId,
            // Tax details
            netAmount: parseFloat(metadata.netAmount || payment.amount.value),
            taxAmount: parseFloat(metadata.taxAmount || '0'),
            taxRate: parseFloat(metadata.taxRate || '0'),
            grossAmount: parseFloat(payment.amount.value),
            // Business details
            isBusiness: metadata.isBusiness === 'true',
            companyName: metadata.companyName,
            vatId: metadata.vatId,
            street: metadata.street,
            zipCode: metadata.zipCode,
            city: metadata.city,
            country: metadata.country || 'DE'
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
            subscriptionCreated: !!metadata.subscriptionId
          })
        } else {
          console.error('❌ Failed to create license:', result.error)
        }
      } catch (error) {
        console.error('❌ Failed to process payment:', error)
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
