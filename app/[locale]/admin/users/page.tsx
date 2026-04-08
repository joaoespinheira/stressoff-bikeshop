import { Users, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { verifyAdmin } from '@/lib/dal'
import { db } from '@/lib/db'

type Props = { params: Promise<{ locale: string }> }

async function getUsers() {
  return db.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      loyaltyAccount: { select: { currentBalance: true, tier: true } },
      _count: { select: { orders: true, repairs: true, rentals: true } },
    },
  })
}

const TIER_COLORS: Record<string, string> = {
  BRONZE:   'bg-amber-50 text-amber-700',
  SILVER:   'bg-gray-50 text-gray-500',
  GOLD:     'bg-yellow-50 text-yellow-600',
  PLATINUM: 'bg-indigo-50 text-indigo-600',
}

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params
  await verifyAdmin()
  const users = await getUsers()

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
          <div className="rounded-xl bg-purple-100 p-2">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {locale === 'pt' ? 'Utilizadores' : 'Users'}
          </h1>
        </div>
        <span className="ml-auto text-sm text-gray-400">
          {users.length} {locale === 'pt' ? 'clientes' : 'customers'}
        </span>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Users className="mb-4 h-14 w-14 text-gray-200" />
          <p className="text-gray-400">
            {locale === 'pt' ? 'Sem utilizadores.' : 'No users.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                {[
                  locale === 'pt' ? 'Nome' : 'Name',
                  'Email',
                  locale === 'pt' ? 'Registado' : 'Registered',
                  locale === 'pt' ? 'Encomendas' : 'Orders',
                  locale === 'pt' ? 'Reparações' : 'Repairs',
                  locale === 'pt' ? 'Alugueres' : 'Rentals',
                  locale === 'pt' ? 'Pontos' : 'Points',
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const tierColor = TIER_COLORS[user.loyaltyAccount?.tier ?? 'BRONZE']

                return (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#1a1a2e]">{user.name ?? '—'}</p>
                      {user.phone && (
                        <p className="text-xs text-gray-400">{user.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {user.createdAt.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {user._count.orders}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {user._count.repairs}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {user._count.rentals}
                    </td>
                    <td className="px-4 py-3">
                      {user.loyaltyAccount ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-[#1a1a2e]">
                            {user.loyaltyAccount.currentBalance}
                          </span>
                          <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${tierColor}`}>
                            {user.loyaltyAccount.tier}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
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
