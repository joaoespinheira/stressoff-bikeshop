import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const itemId = searchParams.get('itemId')

  if (!itemId) {
    return NextResponse.json({ error: 'itemId required' }, { status: 400 })
  }

  const rentals = await db.rental.findMany({
    where: {
      rentalItemId: itemId,
      status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING_PAYMENT'] },
      endDate: { gte: new Date() },
    },
    select: { startDate: true, endDate: true },
  })

  return NextResponse.json({ bookedRanges: rentals })
}
