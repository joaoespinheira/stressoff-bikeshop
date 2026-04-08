'use client'

import { useState } from 'react'
import { updateRepairStatus } from '@/app/actions/repairs'

type Props = {
  repairId: string
  currentStatus: string
  locale: string
}

const STATUSES = [
  { value: 'SUBMITTED',        pt: 'Submetida',         en: 'Submitted' },
  { value: 'WAITING_PARTS',    pt: 'Aguarda peças',      en: 'Waiting parts' },
  { value: 'IN_PROGRESS',      pt: 'Em progresso',       en: 'In progress' },
  { value: 'READY_FOR_PICKUP', pt: 'Pronta p/ recolha',  en: 'Ready for pickup' },
  { value: 'COMPLETED',        pt: 'Concluída',           en: 'Completed' },
  { value: 'CANCELLED',        pt: 'Cancelada',           en: 'Cancelled' },
]

export default function RepairStatusForm({ repairId, currentStatus, locale }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    await updateRepairStatus(repairId, status, notes || undefined)
    setSaved(true)
    setLoading(false)
    setNotes('')
  }

  return (
    <div className="border-t border-gray-100 pt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-[#1a1a2e] focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {locale === 'pt' ? s.pt : s.en}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={locale === 'pt' ? 'Nota para o cliente (opcional)' : 'Note for customer (optional)'}
          className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-[#1a1a2e] focus:outline-none"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-[#1a1a2e] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#16213e] disabled:opacity-50"
        >
          {loading
            ? '...'
            : saved
            ? (locale === 'pt' ? 'Guardado ✓' : 'Saved ✓')
            : (locale === 'pt' ? 'Atualizar' : 'Update')}
        </button>
      </div>
    </div>
  )
}
