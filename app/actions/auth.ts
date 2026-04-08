'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
})

export type AuthState = {
  errors?: Record<string, string[]>
  message?: string
} | undefined

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data

  const user = await db.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) {
    return { message: 'Email ou password incorretos.' }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { message: 'Email ou password incorretos.' }
  }

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  })

  redirect('/pt/account')
}

export async function register(state: AuthState, formData: FormData): Promise<AuthState> {
  const validated = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    phone: formData.get('phone') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, password, phone } = validated.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { errors: { email: ['Este email já está registado.'] } }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      loyaltyAccount: { create: {} },
    },
  })

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  })

  redirect('/pt/account')
}

export async function logout() {
  await deleteSession()
  redirect('/pt')
}
