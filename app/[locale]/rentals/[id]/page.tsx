import { notFound } from 'next/navigation'
import { Bike, MapPin, Shield, Clock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { formatCurrency } from '@/lib/utils'
import RentalBookingForm from '@/components/rentals/RentalBookingForm'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

async function getRentalItem(id: string) {
  return db.rentalItem.findUnique({
    where: { id, isActive: true },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: true,
        },
      },
    },
  })
}

export default async function RentalDetailPage({ params }: Props) {
  const { locale, id } = await params
  const [item, session] = await Promise.all([
    getRentalItem(id),
    getSession(),
  ])

  if (!item) notFound()

  const name = locale === 'pt' ? item.product.namePt : item.product.nameEn
  const description = locale === 'pt' ? item.descriptionPt : item.descriptionEn
  const productDesc = locale === 'pt' ? item.product.descriptionPt : item.product.descriptionEn
  const mainImage = item.product.images.find((img) => img.isMain) ?? item.product.images[0]

  const features = [
    {
      icon: Shield,
      label: locale === 'pt' ? 'Seguro incluído' : 'Insurance included',
      desc: locale === 'pt' ? 'Cobertura básica incluída no aluguer' : 'Basic coverage included in rental',
    },
    {
      icon: MapPin,
      label: locale === 'pt' ? 'Entrega disponível' : 'Delivery available',
      desc: locale === 'pt' ? 'Entregamos e recolhemos em Lisboa' : 'We deliver and collect in Lisbon',
    },
    {
      icon: Clock,
      label: locale === 'pt' ? 'Flexibilidade' : 'Flexibility',
      desc: locale === 'pt' ? `Até ${item.maxDays} dias de aluguer` : `Up to ${item.maxDays} days`,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href={`/${locale}/rentals`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a1a2e] mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        {locale === 'pt' ? 'Voltar' : 'Back'}
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left: Image + Info */}
        <div className="space-y-6">
          <div className="aspect-video overflow-hidden rounded-2xl bg-gray-100 flex items-center justify-center">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage.url} alt={name} className="h-full w-full object-cover" />
            ) : (
              <Bike className="h-24 w-24 text-gray-300" />
            )}
          </div>

          {/* Thumbnail strip */}
          {item.product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {item.product.images.map((img) => (
                <div key={img.id} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">{name}</h1>
            {item.product.brand && (
              <p className="text-sm text-gray-400 mt-1">{item.product.brand}</p>
            )}

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#e94560]">
                {formatCurrency(Number(item.pricePerDay))}
                <span className="text-base font-normal text-gray-400">
                  {locale === 'pt' ? '/dia' : '/day'}
                </span>
              </span>
              {item.pricePerWeek && (
                <span className="text-sm text-gray-500">
                  {formatCurrency(Number(item.pricePerWeek))}
                  {locale === 'pt' ? '/semana' : '/week'}
                </span>
              )}
            </div>

            {Number(item.deposit) > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                {locale === 'pt' ? 'Depósito:' : 'Deposit:'} {formatCurrency(Number(item.deposit))}
                {' '}{locale === 'pt' ? '(reembolsável)' : '(refundable)'}
              </p>
            )}
          </div>

          {(description ?? productDesc) && (
            <div>
              <h2 className="text-sm font-semibold text-[#1a1a2e] mb-2">
                {locale === 'pt' ? 'Descrição' : 'Description'}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{description ?? productDesc}</p>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 gap-3">
            {features.map((f) => (
              <div key={f.label} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <div className="rounded-lg bg-[#1a1a2e]/10 p-2">
                  <f.icon className="h-4 w-4 text-[#1a1a2e]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">{f.label}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Booking form */}
        <div>
          <RentalBookingForm
            rentalItemId={item.id}
            pricePerDay={Number(item.pricePerDay)}
            pricePerWeek={item.pricePerWeek ? Number(item.pricePerWeek) : null}
            deposit={Number(item.deposit)}
            maxDays={item.maxDays}
            locale={locale}
            isLoggedIn={!!session?.userId}
            loginUrl={`/${locale}/login`}
          />

          <p className="mt-4 text-center text-xs text-gray-400">
            {locale === 'pt'
              ? 'Pagamento seguro via Stripe. O depósito é reembolsado após devolução.'
              : 'Secure payment via Stripe. Deposit refunded after return.'}
          </p>
        </div>
      </div>
    </div>
  )
}
