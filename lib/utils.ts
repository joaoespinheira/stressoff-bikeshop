import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, locale = 'pt-PT'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(amount))
}

export function generateOrderNumber(prefix: string): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 90000) + 10000
  return `${prefix}-${year}-${random}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function isBusinessOpen(): boolean {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const hour = now.getHours()
  const minute = now.getMinutes()
  const time = hour * 60 + minute

  if (day === 0) return false // Sunday closed

  if (day >= 1 && day <= 5) {
    // Mon-Fri: 09:00-13:00 and 14:30-19:30
    return (time >= 540 && time < 780) || (time >= 870 && time < 1170)
  }

  if (day === 6) {
    // Saturday: 09:00-13:00 and 15:00-19:00
    return (time >= 540 && time < 780) || (time >= 900 && time < 1140)
  }

  return false
}
