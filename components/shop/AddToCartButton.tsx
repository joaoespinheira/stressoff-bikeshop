'use client'

import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { useCartStore, CartItem } from '@/store/cartStore'

type Props = {
  product: Omit<CartItem, 'quantity'>
  locale: string
}

export default function AddToCartButton({ product, locale }: Props) {
  const { addItem } = useCartStore()
  const [added, setAdded] = useState(false)

  if (product.stock <= 0) {
    return (
      <button disabled className="mt-3 w-full rounded-full border border-gray-200 py-2 text-xs text-gray-400 cursor-not-allowed">
        {locale === 'pt' ? 'Esgotado' : 'Out of stock'}
      </button>
    )
  }

  function handleAdd() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-[#1a1a2e] text-white hover:bg-[#16213e]'
      }`}
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {locale === 'pt' ? 'Adicionado!' : 'Added!'}
        </>
      ) : (
        <>
          <ShoppingCart className="h-3.5 w-3.5" />
          {locale === 'pt' ? 'Adicionar' : 'Add to cart'}
        </>
      )}
    </button>
  )
}
