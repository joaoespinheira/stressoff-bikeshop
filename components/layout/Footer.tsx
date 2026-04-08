import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react'

type Props = { locale: string }

export default function Footer({ locale }: Props) {
  const t = useTranslations('home.hours')

  return (
    <footer className="bg-[#1a1a2e] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 text-2xl font-bold text-white">
              Stressoff<span className="text-[#e94560]">.</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              A tua bikeshop de confiança em Lisboa. Venda, aluguer e reparação com o Chico e a equipa.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '351912345678'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>

          {/* Horários */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Clock className="h-4 w-4 text-[#e94560]" />
              {t('title')}
            </h3>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>{t('weekdays')}</span>
                <span className="text-right text-gray-400">
                  {t('morning')}<br />{t('afternoon_weekday')}
                </span>
              </li>
              <li className="flex justify-between">
                <span>{t('saturday')}</span>
                <span className="text-right text-gray-400">
                  {t('morning')}<br />{t('afternoon_saturday')}
                </span>
              </li>
              <li className="flex justify-between">
                <span>{t('sunday')}</span>
                <span className="text-gray-400">{t('closed')}</span>
              </li>
            </ul>
          </div>

          {/* Links & Contacto */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <MapPin className="h-4 w-4 text-[#e94560]" />
              Contacto
            </h3>
            <address className="not-italic text-sm space-y-2 text-gray-400">
              <p>Rua da Stressoff, 123<br />1000-001 Lisboa</p>
              <a
                href="tel:+351912345678"
                className="flex items-center gap-1 hover:text-white"
              >
                <Phone className="h-3 w-3" /> +351 912 345 678
              </a>
            </address>
            <nav className="mt-4 flex flex-col gap-1 text-sm">
              <Link href={`/${locale}/products`} className="hover:text-white">Loja</Link>
              <Link href={`/${locale}/rentals`} className="hover:text-white">Aluguer</Link>
              <Link href={`/${locale}/repairs`} className="hover:text-white">Reparações</Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Stressoff Bikeshop. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
