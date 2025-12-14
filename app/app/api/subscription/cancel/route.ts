import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
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

    // Calculate end date (current period end)
    const endDate = subscription.nextPaymentDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

    // Update subscription status
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        endDate: endDate,
        nextPaymentDate: null, // No more renewals
      },
    })

    // Optionally: Cancel Mollie subscription if it exists
    if (subscription.mollieSubscriptionId) {
      const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY!
      try {
        await fetch(`https://api.mollie.com/v2/customers/${subscription.mollieCustomerId}/subscriptions/${subscription.mollieSubscriptionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${MOLLIE_API_KEY}`,
          },
        })
      } catch (error) {
        console.error('Failed to cancel Mollie subscription:', error)
        // Continue anyway - we've cancelled in our DB
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Abo erfolgreich gekündigt',
      endDate: endDate.toISOString(),
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

