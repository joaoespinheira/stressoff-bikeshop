import { Wrench, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { verifyMechanic } from '@/lib/dal'
import { db } from '@/lib/db'
import RepairStatusForm from '@/components/admin/RepairStatusForm'

type Props = { params: Promise<{ locale: string }> }

const STATUS_LABELS: Record<string, { pt: string; en: string; color: string }> = {
  SUBMITTED:        { pt: 'Submetida',         en: 'Submitted',         color: 'bg-blue-100 text-blue-700' },
  WAITING_PARTS:    { pt: 'Aguarda peças',      en: 'Waiting parts',     color: 'bg-yellow-100 text-yellow-700' },
  IN_PROGRESS:      { pt: 'Em progresso',       en: 'In progress',       color: 'bg-orange-100 text-orange-700' },
  READY_FOR_PICKUP: { pt: 'Pronta p/ recolha',  en: 'Ready for pickup',  color: 'bg-green-100 text-green-700' },
  COMPLETED:        { pt: 'Concluída',           en: 'Completed',         color: 'bg-gray-100 text-gray-600' },
  CANCELLED:        { pt: 'Cancelada',           en: 'Cancelled',         color: 'bg-red-100 text-red-600' },
}

async function getRepairs() {
  return db.repair.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      assignedTo: { select: { name: true } },
      photos: { take: 1 },
    },
  })
}

export default async function AdminRepairsPage({ params }: Props) {
  const { locale } = await params
  await verifyMechanic()
  const repairs = await getRepairs()

  const pending = repairs.filter((r) =>
    ['SUBMITTED', 'WAITING_PARTS', 'IN_PROGRESS'].includes(r.status)
  )
  const done = repairs.filter((r) =>
    ['READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].includes(r.status)
  )

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
          <div className="rounded-xl bg-orange-100 p-2">
            <Wrench className="h-5 w-5 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {locale === 'pt' ? 'Reparações' : 'Repairs'}
          </h1>
        </div>
        <span className="ml-auto rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
          {pending.length} {locale === 'pt' ? 'ativas' : 'active'}
        </span>
      </div>

      {repairs.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Wrench className="mb-4 h-14 w-14 text-gray-200" />
          <p className="text-gray-400">
            {locale === 'pt' ? 'Sem reparações.' : 'No repairs.'}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {[
            { list: pending, title: locale === 'pt' ? 'Em aberto' : 'Open' },
            { list: done,    title: locale === 'pt' ? 'Concluídas / Canceladas' : 'Completed / Cancelled' },
          ].map(({ list, title }) =>
            list.length > 0 ? (
              <div key={title}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h2>
                <div className="space-y-4">
                  {list.map((repair) => {
                    const statusInfo = STATUS_LABELS[repair.status] ?? STATUS_LABELS.SUBMITTED
                    return (
                      <div key={repair.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-[#1a1a2e]">
                                {repair.repairNumber}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                                {locale === 'pt' ? statusInfo.pt : statusInfo.en}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {repair.createdAt.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')}
                              {repair.assignedTo && ` · ${locale === 'pt' ? 'Atribuído a' : 'Assigned to'}: ${repair.assignedTo.name}`}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2 mb-4">
                          <div>
                            <span className="text-xs text-gray-400">
                              {locale === 'pt' ? 'Cliente' : 'Customer'}
                            </span>
                            <p className="text-gray-700">{repair.user.name ?? repair.user.email}</p>
                            {repair.user.phone && (
                              <p className="text-xs text-gray-400">{repair.user.phone}</p>
                            )}
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">
                              {locale === 'pt' ? 'Bicicleta' : 'Bike'}
                            </span>
                            <p className="text-gray-700">{repair.bikeDescription}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="text-xs text-gray-400">
                            {locale === 'pt' ? 'Problema' : 'Problem'}
                          </span>
                          <p className="text-sm text-gray-600 mt-0.5">{repair.problemDesc}</p>
                        </div>

                        {repair.photos.length > 0 && (
                          <div className="mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={repair.photos[0].url}
                              alt="repair photo"
                              className="h-24 w-24 rounded-xl object-cover"
                            />
                          </div>
                        )}

                        {repair.estimatedCost && (
                          <p className="text-sm text-gray-500 mb-3">
                            {locale === 'pt' ? 'Custo estimado:' : 'Estimated cost:'}{' '}
                            <span className="font-semibold text-[#1a1a2e]">
                              {Number(repair.estimatedCost).toLocaleString(locale === 'pt' ? 'pt-PT' : 'en-GB', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </p>
                        )}

                        <RepairStatusForm repairId={repair.id} currentStatus={repair.status} locale={locale} />
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
