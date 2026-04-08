import Link from 'next/link'
import { CheckCircle, ShoppingBag } from 'lucide-react'

type Props = { params: Promise<{ locale: string }> }

export default async function CheckoutSuccessPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-[#1a1a2e]">
        {locale === 'pt' ? 'Encomenda confirmada!' : 'Order confirmed!'}
      </h1>
      <p className="mt-3 text-gray-500">
        {locale === 'pt'
          ? 'Receberás um email de confirmação em breve. Obrigado!'
          : "You'll receive a confirmation email shortly. Thank you!"}
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href={`/${locale}/account`}
          className="rounded-full bg-[#1a1a2e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#16213e]"
        >
          {locale === 'pt' ? 'Ver encomendas' : 'View orders'}
        </Link>
        <Link
          href={`/${locale}/products`}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-[#1a1a2e] hover:bg-gray-50"
        >
          <ShoppingBag className="h-4 w-4" />
          {locale === 'pt' ? 'Continuar a comprar' : 'Continue shopping'}
        </Link>
      </div>
    </div>
  )
}
