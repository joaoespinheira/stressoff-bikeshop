import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from 'sonner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/common/WhatsAppButton'
import { getUser } from '@/lib/dal'
import CartDrawer from '@/components/shop/CartDrawer'

const locales = ['pt', 'en']

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(locales, locale)) {
    notFound()
  }

  const messages = await getMessages()
  const user = await getUser()

  return (
    <NextIntlClientProvider messages={messages}>
      <Header locale={locale} userRole={user?.role} userName={user?.name} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <CartDrawer locale={locale} />
      <WhatsAppButton />
      <Toaster position="top-right" richColors />
    </NextIntlClientProvider>
  )
}
