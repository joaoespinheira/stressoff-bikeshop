'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(
  orderId: string,
  status: string,
  trackingNumber?: string
): Promise<{ success: boolean }> {
  const session = await getSession()
  if (!session?.userId || session.role !== 'ADMIN') {
    return { success: false }
  }

  await db.order.update({
    where: { id: orderId },
    data: {
      status: status as never,
      ...(trackingNumber && { trackingNumber }),
      ...(status === 'SHIPPED' && { shippedAt: new Date() }),
      ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
    },
  })

  revalidatePath('/pt/admin/orders')
  revalidatePath('/en/admin/orders')

  return { success: true }
}
