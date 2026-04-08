import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

const locales = ['pt', 'en']
const defaultLocale = 'pt'

const protectedPaths = ['/account', '/admin']
const adminPaths = ['/admin']
const mechanicPaths = ['/admin/repairs']

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split('/')
  return locales.includes(segments[1]) ? segments[1] : null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // i18n redirect: if no locale prefix, redirect to default
  const locale = getLocaleFromPath(pathname)
  if (!locale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.nextUrl)
    )
  }

  // Auth: check protected routes
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
  const isProtected = protectedPaths.some(p => pathWithoutLocale.startsWith(p))

  if (isProtected) {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    const session = await decrypt(token)

    if (!session?.userId) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl))
    }

    // Admin-only paths (mechanics can access repairs queue)
    const isAdminPath = adminPaths.some(p => pathWithoutLocale.startsWith(p))
    if (isAdminPath) {
      const isMechanicPath = mechanicPaths.some(p => pathWithoutLocale.startsWith(p))
      const canAccess =
        session.role === 'ADMIN' ||
        (isMechanicPath && session.role === 'MECHANIC')
      if (!canAccess) {
        return NextResponse.redirect(new URL(`/${locale}/account`, request.nextUrl))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)'],
}
