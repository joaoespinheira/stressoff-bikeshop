'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/app/actions/orders'

type Props = {
  orderId: string
  currentStatus: string
  locale: string
}

const STATUSES = [
  { value: 'PENDING_PAYMENT', pt: 'Pend. pagamento', en: 'Pending payment' },
  { value: 'PAID',            pt: 'Pago',            en: 'Paid' },
  { value: 'PROCESSING',      pt: 'A processar',     en: 'Processing' },
  { value: 'SHIPPED',         pt: 'Enviado',          en: 'Shipped' },
  { value: 'DELIVERED',       pt: 'Entregue',         en: 'Delivered' },
  { value: 'CANCELLED',       pt: 'Cancelado',        en: 'Cancelled' },
  { value: 'REFUNDED',        pt: 'Reembolsado',      en: 'Refunded' },
]

export default function OrderStatusForm({ orderId, currentStatus, locale }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleChange(newStatus: string) {
    setStatus(newStatus)
    setLoading(true)
    setSaved(false)
    await updateOrderStatus(orderId, newStatus)
    setSaved(true)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-[#1a1a2e] focus:outline-none disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {locale === 'pt' ? s.pt : s.en}
          </option>
        ))}
      </select>
      {saved && <span className="text-xs text-green-500">✓</span>}
    </div>
  )
}
