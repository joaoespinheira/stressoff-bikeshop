import { ShoppingBag, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { verifyAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import OrderStatusForm from '@/components/admin/OrderStatusForm'

type Props = { params: Promise<{ locale: string }> }

const STATUS_LABELS: Record<string, { pt: string; en: string; color: string }> = {
  PENDING_PAYMENT: { pt: 'Pend. pagamento', en: 'Pending payment', color: 'bg-gray-100 text-gray-600' },
  PAID:            { pt: 'Pago',            en: 'Paid',            color: 'bg-blue-100 text-blue-700' },
  PROCESSING:      { pt: 'A processar',     en: 'Processing',      color: 'bg-yellow-100 text-yellow-700' },
  SHIPPED:         { pt: 'Enviado',          en: 'Shipped',         color: 'bg-orange-100 text-orange-700' },
  DELIVERED:       { pt: 'Entregue',         en: 'Delivered',       color: 'bg-green-100 text-green-700' },
  CANCELLED:       { pt: 'Cancelado',        en: 'Cancelled',       color: 'bg-red-100 text-red-600' },
  REFUNDED:        { pt: 'Reembolsado',      en: 'Refunded',        color: 'bg-purple-100 text-purple-600' },
}

async function getOrders() {
  return db.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { namePt: true, nameEn: true } } } },
    },
  })
}

export default async function AdminOrdersPage({ params }: Props) {
  const { locale } = await params
  await verifyAdmin()
  const orders = await getOrders()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/${locale}/admin`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a1a2e]"
        >
          <ChevronLeft className="h-4 w-4" />
          Admin
        </Link>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-blue-100 p-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {locale === 'pt' ? 'Encomendas' : 'Orders'}
          </h1>
        </div>
        <span className="ml-auto text-sm text-gray-400">
          {orders.length} {locale === 'pt' ? 'total' : 'total'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <ShoppingBag className="mb-4 h-14 w-14 text-gray-200" />
          <p className="text-gray-400">
            {locale === 'pt' ? 'Sem encomendas.' : 'No orders.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                {[
                  locale === 'pt' ? 'Nº' : 'No.',
                  locale === 'pt' ? 'Cliente' : 'Customer',
                  locale === 'pt' ? 'Data' : 'Date',
                  locale === 'pt' ? 'Artigos' : 'Items',
                  'Total',
                  'Status',
                  '',
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING_PAYMENT
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-[#1a1a2e]">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{order.user?.name ?? order.guestEmail ?? '—'}</p>
                      {order.user?.email && (
                        <p className="text-xs text-gray-400">{order.user.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {order.createdAt.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {order.items.map((item) => (
                          <p key={item.id} className="text-xs text-gray-600">
                            {item.quantity}× {locale === 'pt' ? item.product.namePt : item.product.nameEn}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#e94560] whitespace-nowrap">
                      {formatCurrency(Number(order.total))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${statusInfo.color}`}>
                        {locale === 'pt' ? statusInfo.pt : statusInfo.en}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusForm orderId={order.id} currentStatus={order.status} locale={locale} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
