import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18nConfig, locales } from './i18n/config'

export async function middleware(request: NextRequest) {
    const { pathname, search, hash } = request.nextUrl

    // 0. Dynamic Redirect Checker (Database/API)
    // Skip internal paths and admin checking (optimization)
    if (
        !pathname.startsWith('/_next') &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/static') &&
        // Only exclude specific static asset extensions, allowing legacy .pdf, .html etc
        !/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(pathname)
    ) {
        try {
            // Internal fetch to lookup endpoint
            // We need full URL for fetch in middleware
            const lookupUrl = new URL('/api/redirects/lookup', request.url)
            lookupUrl.searchParams.set('path', pathname)

            const res = await fetch(lookupUrl, {
                method: 'GET',
                // Important: Cache handling or failing fast
                headers: { 'Accept': 'application/json' },
                cache: 'force-cache',
                next: { revalidate: 60 } // Cache redirect lookup for 60s to reduce DB load
            })

            if (res.ok) {
                const data = await res.json()
                if (data.target) {
                    const targetUrl = new URL(data.target, request.url)
                    // Preserve search params if needed, or allow target to override
                    // Merging search params:
                    request.nextUrl.searchParams.forEach((val, key) => {
                        targetUrl.searchParams.append(key, val)
                    })
                    return NextResponse.redirect(targetUrl, data.code || 301)
                }
            }
        } catch (e) {
            // Fail silently and proceed to normal routing
            console.error('Middleware redirect lookup failed', e)
        }
    }

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

    // 1.5 Admin Authentication & Hidden Path Logic
    const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
    const isSecretPath = pathname.startsWith(ADMIN_PATH)
    const isDirectAdminPath = pathname.startsWith('/admin')

    // Block direct access to /admin if custom path is set (and we are not in the rewrite loop)
    // Note: When rewriting, the browser URL stays as ADMIN_PATH, but internal pathname becomes /admin
    // The middleware might run again? No, usually middleware runs on request. Rewrites don't re-trigger middleware by default unless configured?
    // Actually, to be safe: If URL starts with /admin AND ADMIN_PATH != /admin -> Block
    if (ADMIN_PATH !== '/admin' && isDirectAdminPath) {
        // Return 404 or redirect home
        return NextResponse.rewrite(new URL('/404', request.url))
    }

    // Handle Authentication for the Secret Path
    if (isSecretPath) {
        // Calculate where we are going internally (relative to admin root)
        // e.g. /secret/dashboard -> /dashboard
        const relativePath = pathname.slice(ADMIN_PATH.length)
        const isLogin = relativePath === '/login' || relativePath.startsWith('/login/')

        if (!isLogin) {
            const adminToken = request.cookies.get('admin_token')
            if (!adminToken) {
                const loginUrl = new URL(`${ADMIN_PATH}/login`, request.url)
                return NextResponse.redirect(loginUrl)
            }
        }

        // Rewrite to internal /admin folder if using custom path
        if (ADMIN_PATH !== '/admin') {
            return NextResponse.rewrite(new URL(`/admin${relativePath}`, request.url))
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
