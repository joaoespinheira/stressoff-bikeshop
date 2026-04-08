import { Bike, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { verifyAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

type Props = { params: Promise<{ locale: string }> }

const STATUS_LABELS: Record<string, { pt: string; en: string; color: string }> = {
  PENDING_PAYMENT: { pt: 'Pend. pagamento', en: 'Pending payment', color: 'bg-gray-100 text-gray-600' },
  CONFIRMED:       { pt: 'Confirmado',       en: 'Confirmed',       color: 'bg-blue-100 text-blue-700' },
  ACTIVE:          { pt: 'Ativo',            en: 'Active',          color: 'bg-green-100 text-green-700' },
  RETURNED:        { pt: 'Devolvido',        en: 'Returned',        color: 'bg-gray-100 text-gray-500' },
  CANCELLED:       { pt: 'Cancelado',        en: 'Cancelled',       color: 'bg-red-100 text-red-600' },
  LATE:            { pt: 'Atrasado',         en: 'Late',            color: 'bg-red-200 text-red-700' },
}

async function getRentals() {
  return db.rental.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      rentalItem: {
        include: { product: { select: { namePt: true, nameEn: true } } },
      },
    },
  })
}

export default async function AdminRentalsPage({ params }: Props) {
  const { locale } = await params
  await verifyAdmin()
  const rentals = await getRentals()

  const active = rentals.filter((r) => ['CONFIRMED', 'ACTIVE'].includes(r.status))

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
          <div className="rounded-xl bg-green-100 p-2">
            <Bike className="h-5 w-5 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {locale === 'pt' ? 'Alugueres' : 'Rentals'}
          </h1>
        </div>
        <span className="ml-auto rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">
          {active.length} {locale === 'pt' ? 'ativos' : 'active'}
        </span>
      </div>

      {rentals.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Bike className="mb-4 h-14 w-14 text-gray-200" />
          <p className="text-gray-400">
            {locale === 'pt' ? 'Sem alugueres.' : 'No rentals.'}
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
                  locale === 'pt' ? 'Bicicleta' : 'Bike',
                  locale === 'pt' ? 'Período' : 'Period',
                  locale === 'pt' ? 'Dias' : 'Days',
                  'Total',
                  'Status',
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rentals.map((rental) => {
                const statusInfo = STATUS_LABELS[rental.status] ?? STATUS_LABELS.PENDING_PAYMENT
                const bikeName = locale === 'pt'
                  ? rental.rentalItem.product.namePt
                  : rental.rentalItem.product.nameEn

                return (
                  <tr key={rental.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-[#1a1a2e]">
                        {rental.rentalNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{rental.user.name ?? rental.user.email}</p>
                      {rental.user.phone && (
                        <p className="text-xs text-gray-400">{rental.user.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{bikeName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {rental.startDate.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')}
                      {' → '}
                      {rental.endDate.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {rental.totalDays}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#e94560] whitespace-nowrap">
                      {formatCurrency(Number(rental.total))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${statusInfo.color}`}>
                        {locale === 'pt' ? statusInfo.pt : statusInfo.en}
                      </span>
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
