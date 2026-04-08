'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Menu, X, User, Wrench } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'

type Props = {
  locale: string
  userRole?: string | null
  userName?: string | null
}

export default function Header({ locale, userRole, userName }: Props) {
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalItems, toggleCart } = useCartStore()
  const itemCount = totalItems()

  const navLinks = [
    { href: `/${locale}/products`, label: t('store') },
    { href: `/${locale}/rentals`, label: t('rentals') },
    { href: `/${locale}/repairs`, label: t('repairs') },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#1a1a2e] text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Stressoff<span className="text-[#e94560]">.</span>
            </span>
            <span className="hidden text-xs text-gray-400 sm:block">Bikeshop</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Locale switcher */}
            <Link
              href={locale === 'pt' ? '/en' : '/pt'}
              className="hidden text-xs text-gray-400 hover:text-white sm:block"
            >
              {locale === 'pt' ? 'EN' : 'PT'}
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-300 transition-colors hover:text-white"
              aria-label={t('cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e94560] text-[10px] font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account */}
            {userName ? (
              <Link
                href={`/${locale}/account`}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:block">{userName.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="rounded-full bg-[#e94560] px-4 py-1.5 text-sm font-medium hover:bg-[#c73652]"
              >
                {t('login')}
              </Link>
            )}

            {/* Admin badge */}
            {(userRole === 'ADMIN' || userRole === 'MECHANIC') && (
              <Link
                href={`/${locale}/admin`}
                className="hidden rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300 hover:bg-yellow-500/30 sm:block"
              >
                <Wrench className="inline h-3 w-3" /> Admin
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="p-2 text-gray-300 hover:text-white md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#16213e] md:hidden">
          <nav className="flex flex-col px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm text-gray-300 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!userName && (
              <>
                <Link
                  href={`/${locale}/login`}
                  className="py-2 text-sm text-gray-300 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="py-2 text-sm text-gray-300 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
