import Link from 'next/link'
import { CheckCircle, Bike } from 'lucide-react'

type Props = { params: Promise<{ locale: string }> }

export default async function RentalSuccessPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>

      <h1 className="text-3xl font-bold text-[#1a1a2e]">
        {locale === 'pt' ? 'Reserva confirmada!' : 'Booking confirmed!'}
      </h1>

      <p className="mt-3 max-w-md text-gray-500">
        {locale === 'pt'
          ? 'A tua reserva foi confirmada. Receberás um email com os detalhes. Entra em contacto via WhatsApp para combinar a entrega.'
          : 'Your booking is confirmed. You will receive an email with the details. Contact us via WhatsApp to arrange delivery.'}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          href={`/${locale}/account`}
          className="flex items-center gap-2 rounded-full bg-[#1a1a2e] px-6 py-3 font-semibold text-white hover:bg-[#16213e]"
        >
          {locale === 'pt' ? 'Ver conta' : 'My account'}
        </Link>
        <Link
          href={`/${locale}/rentals`}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-6 py-3 font-semibold text-[#1a1a2e] hover:border-[#1a1a2e]"
        >
          <Bike className="h-4 w-4" />
          {locale === 'pt' ? 'Ver mais bicicletas' : 'Browse more bikes'}
        </Link>
      </div>
    </div>
  )
}
