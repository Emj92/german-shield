import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY!

type PackageType = 'SINGLE' | 'FREELANCER' | 'AGENCY'

const PACKAGE_PRICES = {
  SINGLE: 39,
  FREELANCER: 1.00, // TEST - min 1€ für Mollie
  AGENCY: 2.50, // TEST
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { subscriptionId, targetPackage, upgradeFee } = await request.json()

    if (!subscriptionId || !targetPackage || upgradeFee === undefined) {
      return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
    }

    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: user.userId,
        status: 'ACTIVE',
      },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Abo nicht gefunden' }, { status: 404 })
    }

    // Validate upgrade
    const currentPackage = subscription.packageType as PackageType
    const PACKAGE_ORDER: PackageType[] = ['SINGLE', 'FREELANCER', 'AGENCY']
    const currentIndex = PACKAGE_ORDER.indexOf(currentPackage)
    const targetIndex = PACKAGE_ORDER.indexOf(targetPackage)

    if (targetIndex <= currentIndex) {
      return NextResponse.json({ error: 'Kein Upgrade möglich' }, { status: 400 })
    }

    // Calculate prices with tax
    const netUpgradeFee = upgradeFee
    const taxRate = 0.19 // 19% MwSt
    const taxAmount = netUpgradeFee * taxRate
    const grossUpgradeFee = netUpgradeFee + taxAmount

    // Create Mollie payment for upgrade fee
    if (grossUpgradeFee > 0) {
      const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MOLLIE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: {
            currency: 'EUR',
            value: grossUpgradeFee.toFixed(2),
          },
          description: `GermanFence Upgrade: ${currentPackage} → ${targetPackage}`,
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices?upgrade=success`,
          webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mollie`,
          metadata: {
            type: 'upgrade',
            userId: user.userId,
            subscriptionId: subscription.id,
            targetPackage,
            netAmount: netUpgradeFee.toFixed(2),
            taxAmount: taxAmount.toFixed(2),
            grossAmount: grossUpgradeFee.toFixed(2),
          },
        }),
      })

      if (!mollieResponse.ok) {
        const error = await mollieResponse.json()
        console.error('Mollie API Error:', error)
        console.error('Mollie Request Details:', {
          grossUpgradeFee: grossUpgradeFee.toFixed(2),
          netUpgradeFee,
          taxAmount,
          targetPackage,
          currentPackage
        })
        return NextResponse.json({ 
          error: 'Zahlung konnte nicht erstellt werden',
          details: error.detail || error.title || 'Unbekannter Fehler'
        }, { status: 500 })
      }

      const payment = await mollieResponse.json()

      // Create invoice for upgrade
      await prisma.invoice.create({
        data: {
          userId: user.userId,
          invoiceNumber: `UPG-${Date.now()}`,
          netAmount: netUpgradeFee,
          taxAmount: taxAmount,
          grossAmount: grossUpgradeFee,
          currency: 'EUR',
          status: 'PENDING',
          issuedAt: new Date(),
          molliePaymentId: payment.id,
        },
      })

      return NextResponse.json({
        success: true,
        paymentUrl: payment._links.checkout.href,
      })
    }

    // If no payment needed (shouldn't happen, but handle it)
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        packageType: targetPackage as 'SINGLE' | 'FREELANCER' | 'AGENCY',
        netAmount: PACKAGE_PRICES[targetPackage as PackageType],
        taxAmount: PACKAGE_PRICES[targetPackage as PackageType] * taxRate,
        grossAmount: PACKAGE_PRICES[targetPackage as PackageType] * (1 + taxRate),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

