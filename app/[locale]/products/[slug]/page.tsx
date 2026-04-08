import { notFound } from 'next/navigation'
import { Bike, Star } from 'lucide-react'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import AddToCartButton from '@/components/shop/AddToCartButton'

type Props = { params: Promise<{ locale: string; slug: string }> }

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const name = locale === 'pt' ? product.namePt : product.nameEn
  const description = locale === 'pt' ? product.descriptionPt : product.descriptionEn
  const mainImage = product.images.find((i) => i.isMain) ?? product.images[0]

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage.url}
                alt={locale === 'pt' ? (mainImage.altPt ?? name) : (mainImage.altEn ?? name)}
                className="h-full w-full object-cover"
              />
            ) : (
              <Bike className="h-32 w-32 text-gray-300" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img) => (
                <div key={img.id} className="aspect-square rounded-lg bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-400">
            {locale === 'pt' ? product.category.namePt : product.category.nameEn}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#1a1a2e]">{name}</h1>

          {product.brand && (
            <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
          )}

          {avgRating !== null && (
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="ml-1 text-sm text-gray-500">({product.reviews.length})</span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#e94560]">
              {formatCurrency(Number(product.price))}
            </span>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <span className="text-lg text-gray-400 line-through">
                {formatCurrency(Number(product.compareAtPrice))}
              </span>
            )}
          </div>

          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 font-medium">
                ✓ {locale === 'pt' ? 'Em stock' : 'In stock'} ({product.stock})
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium">
                {locale === 'pt' ? 'Esgotado' : 'Out of stock'}
              </span>
            )}
          </div>

          {product.loyaltyPoints > 0 && (
            <p className="mt-2 text-xs text-blue-600">
              {locale === 'pt'
                ? `+${product.loyaltyPoints} pontos de fidelização`
                : `+${product.loyaltyPoints} loyalty points`}
            </p>
          )}

          <div className="mt-6">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                namePt: product.namePt,
                nameEn: product.nameEn,
                price: Number(product.price),
                imageUrl: mainImage?.url,
                stock: product.stock,
              }}
              locale={locale}
            />
          </div>

          {/* SKU */}
          <p className="mt-6 text-xs text-gray-400">
            {locale === 'pt' ? 'Referência' : 'SKU'}: {product.sku}
          </p>

          {/* Description */}
          {description && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-[#1a1a2e]">
                {locale === 'pt' ? 'Descrição' : 'Description'}
              </h2>
              <div className="prose prose-sm text-gray-600 leading-relaxed">
                {description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-[#1a1a2e]">
            {locale === 'pt' ? 'Avaliações' : 'Reviews'}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {locale === 'pt' ? review.bodyPt : review.bodyEn}
                </p>
                <p className="mt-2 text-xs text-gray-400">{review.user.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
