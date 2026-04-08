import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session?.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json()
  const { rentalItemId, startDate, endDate, locale = 'pt' } = body

  if (!rentalItemId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start >= end || start < new Date()) {
    return NextResponse.json({ error: 'Invalid dates' }, { status: 400 })
  }

  // Check availability
  const conflicting = await db.rental.findFirst({
    where: {
      rentalItemId,
      status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING_PAYMENT'] },
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  })

  if (conflicting) {
    return NextResponse.json({ error: 'Dates not available' }, { status: 409 })
  }

  const rentalItem = await db.rentalItem.findUnique({
    where: { id: rentalItemId },
    include: {
      product: {
        include: { images: { where: { isMain: true }, take: 1 } },
      },
    },
  })

  if (!rentalItem || !rentalItem.isActive) {
    return NextResponse.json({ error: 'Rental item not found' }, { status: 404 })
  }

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const pricePerDay = Number(rentalItem.pricePerDay)

  // Use weekly rate if >= 7 days and weekly rate exists
  let subtotal: number
  if (totalDays >= 7 && rentalItem.pricePerWeek) {
    const weeks = Math.floor(totalDays / 7)
    const remainingDays = totalDays % 7
    subtotal = weeks * Number(rentalItem.pricePerWeek) + remainingDays * pricePerDay
  } else {
    subtotal = totalDays * pricePerDay
  }

  const depositAmount = Number(rentalItem.deposit)
  const total = subtotal + depositAmount

  const rentalNumber = generateOrderNumber('SR')
  const productName = locale === 'pt' ? rentalItem.product.namePt : rentalItem.product.nameEn
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const rental = await db.rental.create({
    data: {
      rentalNumber,
      userId: session.userId,
      rentalItemId,
      startDate: start,
      endDate: end,
      dailyRate: pricePerDay,
      totalDays,
      subtotal,
      depositAmount,
      total,
    },
  })

  const lineItems = [
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${locale === 'pt' ? 'Aluguer' : 'Rental'}: ${productName}`,
          description: `${totalDays} ${locale === 'pt' ? 'dias' : 'days'} · ${start.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')} → ${end.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')}`,
          ...(rentalItem.product.images[0] && { images: [rentalItem.product.images[0].url] }),
        },
        unit_amount: Math.round(subtotal * 100),
      },
      quantity: 1,
    },
  ]

  if (depositAmount > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: locale === 'pt' ? 'Depósito (reembolsável)' : 'Deposit (refundable)',
          description: locale === 'pt' ? 'Devolvido após devolução da bicicleta' : 'Refunded after bike return',
        },
        unit_amount: Math.round(depositAmount * 100),
      },
      quantity: 1,
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    metadata: { rentalId: rental.id, rentalNumber },
    success_url: `${appUrl}/${locale}/rentals/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${locale}/rentals/${rentalItemId}`,
    customer_email: session.email,
  })

  await db.rental.update({
    where: { id: rental.id },
    data: { stripePaymentIntentId: checkoutSession.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
