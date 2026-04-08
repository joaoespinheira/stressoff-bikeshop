'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { register } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, undefined)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Criar conta</h1>
          <p className="mt-1 text-sm text-gray-500">Junta-te à comunidade Stressoff</p>
        </div>

        <form action={action} className="space-y-4">
          {state?.message && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.message}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#1a1a2e] focus:ring-1 focus:ring-[#1a1a2e]"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-xs text-red-500">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#1a1a2e] focus:ring-1 focus:ring-[#1a1a2e]"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telemóvel <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#1a1a2e] focus:ring-1 focus:ring-[#1a1a2e]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#1a1a2e] focus:ring-1 focus:ring-[#1a1a2e]"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-500">{state.errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-[#e94560] py-2.5 text-sm font-semibold text-white hover:bg-[#c73652] disabled:opacity-60"
          >
            {pending ? 'A criar conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tens conta?{' '}
          <Link href="/pt/login" className="font-medium text-[#e94560] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
