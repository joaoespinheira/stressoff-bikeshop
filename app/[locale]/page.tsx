import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingBag, Bike, Wrench, Clock, ChevronRight, Star } from 'lucide-react'
import { isBusinessOpen } from '@/lib/utils'
import { db } from '@/lib/db'

type Props = { params: Promise<{ locale: string }> }

async function getFeaturedProducts(locale: string) {
  return db.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 4,
    include: { images: { where: { isMain: true }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })
}

function BusinessStatus({ locale }: { locale: string }) {
  const open = isBusinessOpen()
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        open
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-600'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-green-500' : 'bg-red-400'}`} />
      {open ? (locale === 'pt' ? 'Aberto agora' : 'Open now') : (locale === 'pt' ? 'Fechado agora' : 'Closed now')}
    </span>
  )
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const featured = await getFeaturedProducts(locale)

  const services = [
    {
      icon: ShoppingBag,
      title: locale === 'pt' ? 'Loja' : 'Store',
      desc:
        locale === 'pt'
          ? 'Bicicletas e acessórios das melhores marcas, com aconselhamento técnico personalizado.'
          : 'Bikes and accessories from top brands, with personalised technical advice.',
      href: `/${locale}/products`,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Bike,
      title: locale === 'pt' ? 'Aluguer' : 'Rentals',
      desc:
        locale === 'pt'
          ? 'Aluga a tua bicicleta por dia ou semana. Entrega e recolha disponível.'
          : 'Rent by the day or week. Delivery and pickup available.',
      href: `/${locale}/rentals`,
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Wrench,
      title: locale === 'pt' ? 'Reparações' : 'Repairs',
      desc:
        locale === 'pt'
          ? 'Mecânicos certificados, diagnóstico honesto e orçamento transparente.'
          : 'Certified mechanics, honest diagnosis and transparent quotes.',
      href: `/${locale}/repairs`,
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1a1a2e] py-24 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] opacity-80" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <BusinessStatus locale={locale} />
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {locale === 'pt' ? (
                <>A tua bike,<br /><span className="text-[#e94560]">à nossa responsabilidade</span></>
              ) : (
                <>Your bike,<br /><span className="text-[#e94560]">our responsibility</span></>
              )}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-300">
              {locale === 'pt'
                ? 'Venda, aluguer e reparação de bicicletas com o atendimento mais técnico e honesto de Lisboa.'
                : 'Bike sales, rentals and repairs with Lisbon\'s most technical and honest service.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-2 rounded-full bg-[#e94560] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#c73652]"
              >
                <ShoppingBag className="h-5 w-5" />
                {locale === 'pt' ? 'Ver Loja' : 'Visit Store'}
              </Link>
              <Link
                href={`/${locale}/repairs`}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Wrench className="h-5 w-5" />
                {locale === 'pt' ? 'Pedir Reparação' : 'Request Repair'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#1a1a2e]">
            {locale === 'pt' ? 'Os nossos serviços' : 'Our services'}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="group rounded-2xl border border-gray-100 p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${service.color}`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-[#1a1a2e]">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-[#e94560] text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                  {locale === 'pt' ? 'Saber mais' : 'Learn more'} <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-[#1a1a2e]">
                {locale === 'pt' ? 'Destaques' : 'Featured'}
              </h2>
              <Link
                href={`/${locale}/products`}
                className="flex items-center gap-1 text-[#e94560] text-sm font-medium hover:underline"
              >
                {locale === 'pt' ? 'Ver tudo' : 'See all'} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {featured.map((product) => (
                <Link
                  key={product.id}
                  href={`/${locale}/products/${product.slug}`}
                  className="group rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].url}
                        alt={locale === 'pt' ? (product.images[0].altPt ?? product.namePt) : (product.images[0].altEn ?? product.nameEn)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Bike className="h-16 w-16 text-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-[#1a1a2e] truncate">
                      {locale === 'pt' ? product.namePt : product.nameEn}
                    </p>
                    <p className="mt-1 text-[#e94560] font-bold">
                      {Number(product.price).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chico section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#1a1a2e] p-10 text-white md:flex md:items-center md:gap-12">
            <div className="flex-1">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-300">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {locale === 'pt' ? 'Mecânico Chefe' : 'Head Mechanic'}
              </div>
              <h2 className="mt-3 text-3xl font-bold">
                {locale === 'pt' ? 'O Chico está aqui para ti' : 'Chico is here for you'}
              </h2>
              <p className="mt-4 text-gray-300 leading-relaxed">
                {locale === 'pt'
                  ? 'Com mais de 15 anos de experiência, o Chico é o mecânico de referência da Stressoff. Diagnóstico certeiro, preço justo e sem complicações.'
                  : 'With over 15 years of experience, Chico is Stressoff\'s go-to mechanic. Accurate diagnosis, fair price, no hassle.'}
              </p>
              <Link
                href={`/${locale}/repairs`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e94560] px-6 py-2.5 text-sm font-semibold hover:bg-[#c73652]"
              >
                <Wrench className="h-4 w-4" />
                {locale === 'pt' ? 'Marcar reparação' : 'Book a repair'}
              </Link>
            </div>
            <div className="mt-8 flex-shrink-0 md:mt-0">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/10">
                <Wrench className="h-20 w-20 text-white/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Clock className="mx-auto mb-4 h-8 w-8 text-[#e94560]" />
          <h2 className="mb-8 text-3xl font-bold text-[#1a1a2e]">
            {locale === 'pt' ? 'Horários' : 'Opening Hours'}
          </h2>
          <BusinessStatus locale={locale} />
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                day: locale === 'pt' ? 'Segunda – Sexta' : 'Monday – Friday',
                hours: ['09:00 – 13:00', '14:30 – 19:30'],
              },
              {
                day: locale === 'pt' ? 'Sábado' : 'Saturday',
                hours: ['09:00 – 13:00', '15:00 – 19:00'],
              },
              {
                day: locale === 'pt' ? 'Domingo' : 'Sunday',
                hours: [locale === 'pt' ? 'Fechado' : 'Closed'],
              },
            ].map((item) => (
              <div key={item.day} className="rounded-xl bg-white p-5 shadow-sm">
                <p className="font-semibold text-[#1a1a2e]">{item.day}</p>
                {item.hours.map((h) => (
                  <p key={h} className="mt-1 text-sm text-gray-500">{h}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
