import Link from 'next/link'
import { ShoppingBag, Wrench, Bike, Users, Package, TrendingUp } from 'lucide-react'
import { verifyAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

type Props = { params: Promise<{ locale: string }> }

async function getStats() {
  const [
    totalOrders,
    pendingRepairs,
    activeRentals,
    totalUsers,
    recentOrders,
  ] = await Promise.all([
    db.order.count(),
    db.repair.count({ where: { status: { in: ['SUBMITTED', 'IN_PROGRESS', 'WAITING_PARTS'] } } }),
    db.rental.count({ where: { status: 'ACTIVE' } }),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: true },
    }),
  ])

  const revenue = await db.order.aggregate({
    where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
    _sum: { total: true },
  })

  return { totalOrders, pendingRepairs, activeRentals, totalUsers, recentOrders, revenue }
}

export default async function AdminPage({ params }: Props) {
  const { locale } = await params
  await verifyAdmin()

  const stats = await getStats()

  const kpis = [
    {
      label: locale === 'pt' ? 'Encomendas' : 'Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      href: `/${locale}/admin/orders`,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: locale === 'pt' ? 'Reparações pendentes' : 'Pending repairs',
      value: stats.pendingRepairs,
      icon: Wrench,
      href: `/${locale}/admin/repairs`,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: locale === 'pt' ? 'Alugueres ativos' : 'Active rentals',
      value: stats.activeRentals,
      icon: Bike,
      href: `/${locale}/admin/rentals`,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: locale === 'pt' ? 'Clientes' : 'Customers',
      value: stats.totalUsers,
      icon: Users,
      href: `/${locale}/admin/users`,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  const navLinks = [
    { href: `/${locale}/admin/products`, label: locale === 'pt' ? 'Produtos' : 'Products', icon: Package },
    { href: `/${locale}/admin/orders`, label: locale === 'pt' ? 'Encomendas' : 'Orders', icon: ShoppingBag },
    { href: `/${locale}/admin/repairs`, label: locale === 'pt' ? 'Reparações' : 'Repairs', icon: Wrench },
    { href: `/${locale}/admin/rentals`, label: locale === 'pt' ? 'Alugueres' : 'Rentals', icon: Bike },
    { href: `/${locale}/admin/users`, label: locale === 'pt' ? 'Utilizadores' : 'Users', icon: Users },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a1a2e]">
          {locale === 'pt' ? 'Painel Admin' : 'Admin Panel'}
        </h1>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span className="text-sm font-semibold text-gray-600">
            {locale === 'pt' ? 'Receita total:' : 'Total revenue:'}{' '}
            {formatCurrency(Number(stats.revenue._sum.total ?? 0))}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.href}
            href={kpi.href}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`mb-3 inline-flex rounded-xl p-2 ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-[#1a1a2e]">{kpi.value}</div>
            <div className="text-sm text-gray-500 mt-1">{kpi.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Navigation */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[#1a1a2e]">
            {locale === 'pt' ? 'Gestão' : 'Management'}
          </h2>
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 hover:border-[#1a1a2e] hover:bg-gray-50 transition-colors"
              >
                <link.icon className="h-5 w-5 text-[#e94560]" />
                <span className="text-sm font-medium text-[#1a1a2e]">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-[#1a1a2e]">
            {locale === 'pt' ? 'Encomendas recentes' : 'Recent orders'}
          </h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">{locale === 'pt' ? 'Sem encomendas.' : 'No orders.'}</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
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
                    <span className="text-xs text-gray-400">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
