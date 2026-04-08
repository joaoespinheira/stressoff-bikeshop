'use client'

import Link from 'next/link'
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'

type Props = { locale: string }

export default function CartDrawer({ locale }: Props) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore()
  const total = totalPrice()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">
            {locale === 'pt' ? 'Carrinho' : 'Cart'}
          </h2>
          <button onClick={closeCart} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">
                {locale === 'pt' ? 'O teu carrinho está vazio.' : 'Your cart is empty.'}
              </p>
              <button
                onClick={closeCart}
                className="mt-4 text-sm text-[#e94560] hover:underline"
              >
                {locale === 'pt' ? 'Continuar a comprar' : 'Continue shopping'}
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  {/* Image placeholder */}
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a2e] truncate">
                      {locale === 'pt' ? item.namePt : item.nameEn}
                    </p>
                    <p className="text-sm text-[#e94560] font-semibold">
                      {formatCurrency(item.price)}
                    </p>

                    {/* Qty controls */}
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border text-gray-500 hover:bg-gray-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border text-gray-500 hover:bg-gray-50"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-4">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-gray-600">{locale === 'pt' ? 'Subtotal' : 'Subtotal'}</span>
              <span className="text-[#1a1a2e]">{formatCurrency(total)}</span>
            </div>
            <Link
              href={`/${locale}/checkout`}
              onClick={closeCart}
              className="block w-full rounded-full bg-[#e94560] py-3 text-center text-sm font-semibold text-white hover:bg-[#c73652]"
            >
              {locale === 'pt' ? 'Finalizar compra' : 'Checkout'}
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              {locale === 'pt' ? 'Continuar a comprar' : 'Continue shopping'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
