import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Stressoff Bikeshop',
    template: '%s | Stressoff Bikeshop',
  },
  description: 'Venda, aluguer e reparação de bicicletas em Lisboa.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  )
}
