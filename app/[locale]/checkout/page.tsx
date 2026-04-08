'use client'

import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import { ShoppingBag, CreditCard, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function CheckoutPage() {
  const params = useParams()
  const locale = (params.locale as string) ?? 'pt'
  const { items, totalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const total = totalPrice()

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          items: items.map((i) => ({
            id: i.id,
            name: locale === 'pt' ? i.namePt : i.nameEn,
            sku: i.id,
            price: i.price,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
          })),
        }),
      })

      const data = await res.json()
      if (data.url) {
        clearCart()
        window.location.href = data.url
      }
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
        <p className="text-gray-500">
          {locale === 'pt' ? 'O teu carrinho está vazio.' : 'Your cart is empty.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-[#1a1a2e]">
        {locale === 'pt' ? 'Finalizar compra' : 'Checkout'}
      </h1>

      {/* Order summary */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1a1a2e]">
          {locale === 'pt' ? 'Resumo da encomenda' : 'Order summary'}
        </h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {locale === 'pt' ? item.namePt : item.nameEn}{' '}
                <span className="text-gray-400">×{item.quantity}</span>
              </span>
              <span className="font-medium text-[#1a1a2e]">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t pt-4 flex justify-between text-base font-bold">
          <span>{locale === 'pt' ? 'Total' : 'Total'}</span>
          <span className="text-[#e94560]">{formatCurrency(total)}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#e94560] py-4 text-base font-semibold text-white hover:bg-[#c73652] disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> {locale === 'pt' ? 'A redirecionar...' : 'Redirecting...'}</>
        ) : (
          <><CreditCard className="h-5 w-5" /> {locale === 'pt' ? 'Pagar com cartão' : 'Pay by card'}</>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        {locale === 'pt' ? 'Pagamento seguro via Stripe' : 'Secure payment via Stripe'} 🔒
      </p>
    </div>
  )
}
