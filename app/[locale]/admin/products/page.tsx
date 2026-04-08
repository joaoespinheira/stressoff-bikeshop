import { Package, ChevronLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { verifyAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

type Props = { params: Promise<{ locale: string }> }

async function getProducts() {
  return db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      images: { where: { isMain: true }, take: 1 },
    },
  })
}

export default async function AdminProductsPage({ params }: Props) {
  const { locale } = await params
  await verifyAdmin()
  const products = await getProducts()

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
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {locale === 'pt' ? 'Produtos' : 'Products'}
          </h1>
        </div>
        <span className="ml-auto text-sm text-gray-400">
          {products.length} {locale === 'pt' ? 'produtos' : 'products'}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Package className="mb-4 h-14 w-14 text-gray-200" />
          <p className="text-gray-400 mb-6">
            {locale === 'pt' ? 'Sem produtos.' : 'No products.'}
          </p>
          <div className="flex items-center gap-2 rounded-full bg-[#1a1a2e] px-5 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            {locale === 'pt' ? 'Adicionar produto' : 'Add product'}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                {['', 'SKU', locale === 'pt' ? 'Nome' : 'Name', locale === 'pt' ? 'Categoria' : 'Category', locale === 'pt' ? 'Preço' : 'Price', 'Stock', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const name = locale === 'pt' ? product.namePt : product.nameEn
                const image = product.images[0]

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image.url} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-500">{product.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#1a1a2e]">{name}</p>
                      {product.brand && (
                        <p className="text-xs text-gray-400">{product.brand}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {locale === 'pt' ? product.category.namePt : product.category.nameEn}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#e94560] whitespace-nowrap">
                      {formatCurrency(Number(product.price))}
                      {product.compareAtPrice && (
                        <p className="text-xs font-normal text-gray-400 line-through">
                          {formatCurrency(Number(product.compareAtPrice))}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${product.stock <= product.lowStockAlert ? 'text-red-500' : 'text-gray-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.isActive
                          ? (locale === 'pt' ? 'Ativo' : 'Active')
                          : (locale === 'pt' ? 'Inativo' : 'Inactive')}
                      </span>
                      {product.isFeatured && (
                        <span className="ml-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                          {locale === 'pt' ? 'Destaque' : 'Featured'}
                        </span>
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
