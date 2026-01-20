import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18nConfig, locales } from './i18n/config'

export function middleware(request: NextRequest) {
    const { pathname, search, hash } = request.nextUrl

    // 1. Handle legacy /alcosi prefix (Strict 301)
    // Logic: Replace /alcosi/ with / or /alcosi with /
    // 1. Handle legacy /alcosi prefix (Strict 301)
    if (pathname.startsWith('/alcosi')) {
        const newPath = pathname.replace(/^\/alcosi/, '') || '/'
        const newUrl = new URL(newPath, request.url)
        newUrl.search = search
        newUrl.hash = hash
        return NextResponse.redirect(newUrl, 301)
    }

    // 1.5 Admin Authentication
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const adminToken = request.cookies.get('admin_token')
        if (!adminToken) {
            const loginUrl = new URL('/admin/login', request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    // 2. Check for missing locale or default locale in URL
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // 3. Handle Default Locale Canonicalization (en)
    // If user visits /en/about -> Redirect to /about (301)
    if (pathname.startsWith(`/${i18nConfig.defaultLocale}/`) || pathname === `/${i18nConfig.defaultLocale}`) {
        // Remove the default locale from the path
        const newPath = pathname.replace(`/${i18nConfig.defaultLocale}`, '') || '/'
        const newUrl = new URL(newPath, request.url)
        newUrl.search = search
        return NextResponse.redirect(newUrl, 301)
    }

    // 4. Rewrite for Default Locale
    // If locale is missing (e.g. /about), we assume default locale and Rewrite to /en/about
    // so that Next.js App Router (which will be under [locale]) can handle it.
    if (pathnameIsMissingLocale) {
        // Ignore internal paths, static files, api
        if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/static') ||
            pathname.startsWith('/admin') ||
            pathname.includes('.') // file extension
        ) {
            return NextResponse.next()
        }

        // Rewrite to include default locale internally
        return NextResponse.rewrite(
            new URL(`/${i18nConfig.defaultLocale}${pathname}`, request.url)
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next|api|favicon.ico).*)',
    ],
}
