import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata?.orderId
    const rentalId = session.metadata?.rentalId

    if (rentalId) {
      await db.rental.update({
        where: { id: rentalId },
        data: { status: 'CONFIRMED' },
      })
    }

    if (orderId) {
      await db.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          paidAt: new Date(),
        },
      })

      // Award loyalty points
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

      if (order?.userId) {
        const totalPoints = order.items.reduce((sum, item) => sum + item.loyaltyEarned, 0)
        if (totalPoints > 0) {
          await db.loyaltyAccount.upsert({
            where: { userId: order.userId },
            create: {
              userId: order.userId,
              totalEarned: totalPoints,
              currentBalance: totalPoints,
            },
            update: {
              totalEarned: { increment: totalPoints },
              currentBalance: { increment: totalPoints },
            },
          })

          await db.loyaltyTransaction.create({
            data: {
              loyaltyAccountId: (await db.loyaltyAccount.findUnique({ where: { userId: order.userId } }))!.id,
              type: 'EARNED_ORDER',
              points: totalPoints,
              description: `Encomenda ${order.orderNumber}`,
              referenceId: orderId,
            },
          })
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
