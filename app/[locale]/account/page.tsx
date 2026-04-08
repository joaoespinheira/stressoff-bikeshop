import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Bike, Wrench, Star } from 'lucide-react'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { logout } from '@/app/actions/auth'
import { LogoutButton } from '@/components/account/LogoutButton'

type Props = { params: Promise<{ locale: string }> }

async function getUserData(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      loyaltyAccount: {
        include: {
          transactions: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: true },
      },
      rentals: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { rentalItem: { include: { product: true } } },
      },
      repairs: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })
}

const TIER_COLORS = {
  BRONZE: 'text-amber-700 bg-amber-50',
  SILVER: 'text-gray-500 bg-gray-50',
  GOLD: 'text-yellow-600 bg-yellow-50',
  PLATINUM: 'text-indigo-600 bg-indigo-50',
}

const REPAIR_STATUS_PT: Record<string, string> = {
  SUBMITTED: 'Pedido recebido',
  WAITING_PARTS: 'A aguardar peças',
  IN_PROGRESS: 'Em reparação',
  READY_FOR_PICKUP: 'Pronta para levantamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params
  const session = await verifySession()
  const user = await getUserData(session.userId)

  if (!user) redirect(`/${locale}/login`)

  const tierColor = TIER_COLORS[(user.loyaltyAccount?.tier as keyof typeof TIER_COLORS) ?? 'BRONZE']

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">
            {locale === 'pt' ? 'Olá' : 'Hello'}, {user.name?.split(' ')[0] ?? 'Ciclista'}!
          </h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <form action={logout}>
          <LogoutButton locale={locale} />
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Loyalty + Quick links */}
        <div className="space-y-6">
          {/* Loyalty card */}
          {user.loyaltyAccount && (
            <div className="rounded-2xl bg-[#1a1a2e] p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-medium">{locale === 'pt' ? 'Fidelização' : 'Loyalty'}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tierColor}`}>
                  {user.loyaltyAccount.tier}
                </span>
              </div>
              <div className="text-4xl font-bold">{user.loyaltyAccount.currentBalance}</div>
              <div className="text-sm text-gray-400 mt-1">{locale === 'pt' ? 'pontos' : 'points'}</div>
            </div>
          )}

          {/* Quick links */}
          <div className="space-y-2">
            {[
              { href: `/${locale}/products`, icon: ShoppingBag, label: locale === 'pt' ? 'Loja' : 'Store' },
              { href: `/${locale}/rentals`, icon: Bike, label: locale === 'pt' ? 'Alugar bicicleta' : 'Rent a bike' },
              { href: `/${locale}/repairs`, icon: Wrench, label: locale === 'pt' ? 'Pedir reparação' : 'Request repair' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 hover:border-[#1a1a2e] hover:bg-gray-50"
              >
                <link.icon className="h-5 w-5 text-[#e94560]" />
                <span className="text-sm font-medium text-[#1a1a2e]">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Orders, Rentals, Repairs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#1a1a2e]">
              {locale === 'pt' ? 'Encomendas recentes' : 'Recent orders'}
            </h2>
            {user.orders.length === 0 ? (
              <p className="text-sm text-gray-400">
                {locale === 'pt' ? 'Sem encomendas.' : 'No orders yet.'}
              </p>
            ) : (
              <div className="space-y-3">
                {user.orders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a2e]">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">
                        {order.createdAt.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')}
                        {' · '}
                        {order.items.length} {locale === 'pt' ? 'artigo(s)' : 'item(s)'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#e94560]">{formatCurrency(Number(order.total))}</p>
                      <p className="text-xs text-gray-400">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Repairs */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#1a1a2e]">
              {locale === 'pt' ? 'Reparações' : 'Repairs'}
            </h2>
            {user.repairs.length === 0 ? (
              <p className="text-sm text-gray-400">
                {locale === 'pt' ? 'Sem reparações.' : 'No repairs yet.'}
              </p>
            ) : (
              <div className="space-y-3">
                {user.repairs.map((repair) => (
                  <div key={repair.id} className="rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a2e]">{repair.repairNumber}</p>
                      <p className="text-xs text-gray-400 truncate max-w-xs">{repair.bikeDescription}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {locale === 'pt'
                        ? REPAIR_STATUS_PT[repair.status] ?? repair.status
                        : repair.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Rentals */}
          {user.rentals.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-[#1a1a2e]">
                {locale === 'pt' ? 'Alugueres' : 'Rentals'}
              </h2>
              <div className="space-y-3">
                {user.rentals.map((rental) => (
                  <div key={rental.id} className="rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a2e]">{rental.rentalNumber}</p>
                      <p className="text-xs text-gray-400">
                        {rental.startDate.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')}
                        {' → '}
                        {rental.endDate.toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'en-GB')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#e94560]">
                      {formatCurrency(Number(rental.total))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
