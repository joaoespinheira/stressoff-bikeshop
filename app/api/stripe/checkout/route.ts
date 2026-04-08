import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const session = await getSession()
  const body = await request.json()
  const { items, locale = 'pt' } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Build line items
  const lineItems = items.map((item: { name: string; price: number; quantity: number; imageUrl?: string }) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
        ...(item.imageUrl && { images: [item.imageUrl] }),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }))

  // Create pending order record
  const subtotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0)
  const orderNumber = generateOrderNumber('SB')

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: session?.userId,
      subtotal,
      total: subtotal,
      items: {
        create: items.map((item: { id: string; name: string; sku: string; price: number; quantity: number; loyaltyPoints?: number }) => ({
          productId: item.id,
          productName: item.name,
          productSku: item.sku ?? '',
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          loyaltyEarned: (item.loyaltyPoints ?? 0) * item.quantity,
        })),
      },
    },
  })

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    metadata: { orderId: order.id, orderNumber },
    success_url: `${appUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${locale}/cart`,
    ...(session?.email && { customer_email: session.email }),
  })

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
