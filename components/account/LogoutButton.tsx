'use client'

import { useFormStatus } from 'react-dom'
import { LogOut, Loader2 } from 'lucide-react'

export function LogoutButton({ locale }: { locale: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {pending
        ? (locale === 'pt' ? 'A sair...' : 'Signing out...')
        : (locale === 'pt' ? 'Sair' : 'Sign out')}
    </button>
  )
}
