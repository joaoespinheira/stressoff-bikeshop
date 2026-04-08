import Link from 'next/link'
import { Bike, Calendar, MapPin } from 'lucide-react'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

type Props = { params: Promise<{ locale: string }> }

async function getRentalItems() {
  return db.rentalItem.findMany({
    where: { isActive: true },
    include: {
      product: {
        include: {
          images: { where: { isMain: true }, take: 1 },
        },
      },
    },
  })
}

export default async function RentalsPage({ params }: Props) {
  const { locale } = await params
  const items = await getRentalItems()

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1a1a2e] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-[#e94560]/20 p-3">
              <Bike className="h-8 w-8 text-[#e94560]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">
            {locale === 'pt' ? 'Aluguer de Bicicletas' : 'Bike Rentals'}
          </h1>
          <p className="mt-3 text-gray-300 max-w-xl">
            {locale === 'pt'
              ? 'Descobre Lisboa em duas rodas. Entrega e recolha disponível.'
              : 'Discover Lisbon on two wheels. Delivery and pickup available.'}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{locale === 'pt' ? 'Entrega em toda Lisboa' : 'Delivery across Lisbon'}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bike className="mb-4 h-16 w-16 text-gray-300" />
            <p className="text-gray-500">
              {locale === 'pt' ? 'Nenhuma bicicleta disponível para aluguer.' : 'No bikes available for rent.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const name = locale === 'pt' ? item.product.namePt : item.product.nameEn
              const desc = locale === 'pt' ? item.descriptionPt : item.descriptionEn
              const image = item.product.images[0]

              return (
                <div key={item.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image.url} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <Bike className="h-20 w-20 text-gray-300" />
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#1a1a2e]">{name}</h3>
                    {item.product.brand && (
                      <p className="text-sm text-gray-400">{item.product.brand}</p>
                    )}
                    {desc && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{desc}</p>
                    )}

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-bold text-[#e94560]">
                          {formatCurrency(Number(item.pricePerDay))}
                          <span className="text-sm font-normal text-gray-400">
                            {locale === 'pt' ? '/dia' : '/day'}
                          </span>
                        </div>
                        {item.pricePerWeek && (
                          <div className="text-sm text-gray-500">
                            {formatCurrency(Number(item.pricePerWeek))}
                            {locale === 'pt' ? '/semana' : '/week'}
                          </div>
                        )}
                        {Number(item.deposit) > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {locale === 'pt' ? 'Depósito:' : 'Deposit:'} {formatCurrency(Number(item.deposit))}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/${locale}/rentals/${item.id}`}
                        className="flex items-center gap-2 rounded-full bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16213e]"
                      >
                        <Calendar className="h-4 w-4" />
                        {locale === 'pt' ? 'Reservar' : 'Book'}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
