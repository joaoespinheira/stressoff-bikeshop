import Link from 'next/link'
import { Bike, SlidersHorizontal } from 'lucide-react'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import AddToCartButton from '@/components/shop/AddToCartButton'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}

async function getProducts(categorySlug?: string, search?: string, page = 1) {
  const take = 12
  const skip = (page - 1) * take

  return db.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(search && {
        OR: [
          { namePt: { contains: search, mode: 'insensitive' } },
          { nameEn: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      images: { where: { isMain: true }, take: 1 },
      category: { select: { slug: true, namePt: true, nameEn: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take,
    skip,
  })
}

async function getCategories() {
  return db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { category, search, page } = await searchParams
  const currentPage = Number(page ?? 1)

  const [products, categories] = await Promise.all([
    getProducts(category, search, currentPage),
    getCategories(),
  ])

  const t = {
    title: locale === 'pt' ? 'Loja' : 'Store',
    noResults: locale === 'pt' ? 'Nenhum produto encontrado.' : 'No products found.',
    allCategories: locale === 'pt' ? 'Todas as categorias' : 'All categories',
    inStock: locale === 'pt' ? 'Em stock' : 'In stock',
    outOfStock: locale === 'pt' ? 'Esgotado' : 'Out of stock',
    featured: locale === 'pt' ? 'Destaque' : 'Featured',
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a1a2e]">{t.title}</h1>
        <SlidersHorizontal className="h-5 w-5 text-gray-400" />
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/products`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !category
              ? 'bg-[#1a1a2e] text-white'
              : 'border border-gray-200 text-gray-600 hover:border-[#1a1a2e]'
          }`}
        >
          {t.allCategories}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/products?category=${cat.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat.slug
                ? 'bg-[#1a1a2e] text-white'
                : 'border border-gray-200 text-gray-600 hover:border-[#1a1a2e]'
            }`}
          >
            {locale === 'pt' ? cat.namePt : cat.nameEn}
          </Link>
        ))}
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Bike className="mb-4 h-16 w-16 text-gray-300" />
          <p className="text-gray-500">{t.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const name = locale === 'pt' ? product.namePt : product.nameEn
            const image = product.images[0]

            return (
              <div key={product.id} className="group rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                <Link href={`/${locale}/products/${product.slug}`}>
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.url}
                        alt={locale === 'pt' ? (image.altPt ?? name) : (image.altEn ?? name)}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <Bike className="h-16 w-16 text-gray-300" />
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-2 left-2 rounded-full bg-[#e94560] px-2 py-0.5 text-[10px] font-bold text-white">
                        {t.featured}
                      </span>
                    )}
                    {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                      <span className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        Sale
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/${locale}/products/${product.slug}`}>
                    <p className="text-sm font-semibold text-[#1a1a2e] truncate hover:text-[#e94560]">{name}</p>
                    {product.brand && (
                      <p className="text-xs text-gray-400">{product.brand}</p>
                    )}
                  </Link>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#e94560]">
                        {formatCurrency(Number(product.price))}
                      </span>
                      {product.compareAtPrice && (
                        <span className="ml-1.5 text-xs text-gray-400 line-through">
                          {formatCurrency(Number(product.compareAtPrice))}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stock > 0 ? t.inStock : t.outOfStock}
                    </span>
                  </div>

                  <AddToCartButton
                    product={{
                      id: product.id,
                      slug: product.slug,
                      namePt: product.namePt,
                      nameEn: product.nameEn,
                      price: Number(product.price),
                      imageUrl: image?.url,
                      stock: product.stock,
                    }}
                    locale={locale}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
