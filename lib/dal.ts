import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/pt/login')
  return session
})

export const verifyAdmin = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/pt/login')
  if (session.role !== 'ADMIN') redirect('/pt/account')
  return session
})

export const verifyMechanic = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/pt/login')
  if (session.role !== 'MECHANIC' && session.role !== 'ADMIN') {
    redirect('/pt/account')
  }
  return session
})

export const getUser = cache(async () => {
  const session = await getSession()
  if (!session?.userId) return null

  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      preferredLocale: true,
      loyaltyAccount: {
        select: { currentBalance: true, tier: true },
      },
    },
  })
})
