'use client'

import { useState, useEffect } from 'react'
import { Calendar, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Props = {
  rentalItemId: string
  pricePerDay: number
  pricePerWeek: number | null
  deposit: number
  maxDays: number
  locale: string
  isLoggedIn: boolean
  loginUrl: string
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toInputValue(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function RentalBookingForm({
  rentalItemId,
  pricePerDay,
  pricePerWeek,
  deposit,
  maxDays,
  locale,
  isLoggedIn,
  loginUrl,
}: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = addDays(today, 1)
  const dayAfterTomorrow = addDays(today, 2)

  const [startDate, setStartDate] = useState(toInputValue(tomorrow))
  const [endDate, setEndDate] = useState(toInputValue(dayAfterTomorrow))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookedRanges, setBookedRanges] = useState<{ startDate: string; endDate: string }[]>([])

  const t = {
    startDate: locale === 'pt' ? 'Data de início' : 'Start date',
    endDate: locale === 'pt' ? 'Data de fim' : 'End date',
    book: locale === 'pt' ? 'Reservar agora' : 'Book now',
    loginRequired: locale === 'pt' ? 'Inicia sessão para reservar' : 'Sign in to book',
    days: locale === 'pt' ? 'dias' : 'days',
    subtotal: locale === 'pt' ? 'Subtotal' : 'Subtotal',
    deposit: locale === 'pt' ? 'Depósito (reembolsável)' : 'Deposit (refundable)',
    total: 'Total',
    perDay: locale === 'pt' ? '/dia' : '/day',
    perWeek: locale === 'pt' ? '/semana' : '/week',
    weeklyNote: locale === 'pt' ? 'Taxa semanal aplicada' : 'Weekly rate applied',
    maxDaysNote: locale === 'pt' ? `Máximo ${maxDays} dias` : `Maximum ${maxDays} days`,
    datesUnavailable: locale === 'pt' ? 'Datas não disponíveis' : 'Dates not available',
    selectValidDates: locale === 'pt' ? 'Seleciona datas válidas' : 'Select valid dates',
  }

  useEffect(() => {
    fetch(`/api/rentals/availability?itemId=${rentalItemId}`)
      .then((r) => r.json())
      .then((data) => setBookedRanges(data.bookedRanges ?? []))
      .catch(() => {})
  }, [rentalItemId])

  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalDays = startDate && endDate && end > start
    ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const isDateRangeBooked = (): boolean => {
    if (!totalDays) return false
    return bookedRanges.some(({ startDate: bs, endDate: be }) => {
      const bookedStart = new Date(bs)
      const bookedEnd = new Date(be)
      return start < bookedEnd && end > bookedStart
    })
  }

  let subtotal = 0
  let usingWeeklyRate = false
  if (totalDays > 0) {
    if (totalDays >= 7 && pricePerWeek) {
      const weeks = Math.floor(totalDays / 7)
      const remaining = totalDays % 7
      subtotal = weeks * pricePerWeek + remaining * pricePerDay
      usingWeeklyRate = true
    } else {
      subtotal = totalDays * pricePerDay
    }
  }
  const total = subtotal + deposit

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!totalDays || totalDays < 1) {
      setError(t.selectValidDates)
      return
    }

    if (totalDays > maxDays) {
      setError(t.maxDaysNote)
      return
    }

    if (isDateRangeBooked()) {
      setError(t.datesUnavailable)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/rental-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalItemId, startDate, endDate, locale }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? t.datesUnavailable)
        return
      }

      window.location.href = data.url
    } catch {
      setError(locale === 'pt' ? 'Erro inesperado. Tenta novamente.' : 'Unexpected error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const minEnd = startDate ? toInputValue(addDays(new Date(startDate), 1)) : toInputValue(dayAfterTomorrow)
  const maxStart = toInputValue(addDays(today, maxDays - 1))

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-5 w-5 text-[#e94560]" />
        <h3 className="text-lg font-bold text-[#1a1a2e]">
          {locale === 'pt' ? 'Escolhe as datas' : 'Choose dates'}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t.startDate}</label>
          <input
            type="date"
            value={startDate}
            min={toInputValue(tomorrow)}
            max={maxStart}
            onChange={(e) => {
              setStartDate(e.target.value)
              if (endDate && new Date(endDate) <= new Date(e.target.value)) {
                setEndDate(toInputValue(addDays(new Date(e.target.value), 1)))
              }
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a1a2e] focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t.endDate}</label>
          <input
            type="date"
            value={endDate}
            min={minEnd}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#1a1a2e] focus:outline-none"
            required
          />
        </div>
      </div>

      {totalDays > 0 && (
        <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>
              {totalDays} {t.days} × {usingWeeklyRate ? `${formatCurrency(pricePerWeek!)}${t.perWeek}` : `${formatCurrency(pricePerDay)}${t.perDay}`}
            </span>
            {usingWeeklyRate && (
              <span className="text-green-600 text-xs flex items-center gap-1">
                <Info className="h-3 w-3" />
                {t.weeklyNote}
              </span>
            )}
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{t.subtotal}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {deposit > 0 && (
            <div className="flex justify-between text-gray-500 text-xs">
              <span>{t.deposit}</span>
              <span>{formatCurrency(deposit)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-[#1a1a2e] border-t border-gray-200 pt-2 mt-1">
            <span>{t.total}</span>
            <span className="text-[#e94560]">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {isLoggedIn ? (
        <button
          type="submit"
          disabled={loading || !totalDays || totalDays > maxDays}
          className="w-full rounded-full bg-[#e94560] px-6 py-3 font-semibold text-white hover:bg-[#d03050] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? (locale === 'pt' ? 'A processar...' : 'Processing...')
            : t.book}
        </button>
      ) : (
        <a
          href={loginUrl}
          className="block w-full text-center rounded-full bg-[#1a1a2e] px-6 py-3 font-semibold text-white hover:bg-[#16213e] transition-colors"
        >
          {t.loginRequired}
        </a>
      )}
    </form>
  )
}
