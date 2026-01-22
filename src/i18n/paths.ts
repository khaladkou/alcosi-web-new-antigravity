import { locales, Locale } from './config'

type PathMap = Record<string, Record<Locale, string>>

const paths: PathMap = {
    '/services': {
        en: '/services',
        es: '/servicios',
        ru: '/uslugi',
        de: '/leistungen',
        pl: '/uslugi',
        pt: '/servicos',
    },
    '/services/ai': {
        en: '/services/ai',
        es: '/servicios/ia',
        ru: '/uslugi/ii',
        de: '/leistungen/ki',
        pl: '/uslugi/si',
        pt: '/servicos/ia',
    },
    '/services/fintech': {
        en: '/services/fintech',
        es: '/servicios/fintech',
        ru: '/uslugi/fintech',
        de: '/leistungen/fintech',
        pl: '/uslugi/fintech', // Fixed typo 'finthey' to 'fintech' 
        // Checking rewrite: { source: '/pl/uslugi/fintech', destination: '/pl/services/fintech' } -> Wait.
        // My previous rewrite config for PL:
        // { source: '/pl/uslugi/fintech', destination: '/pl/services/fintech' }
        // So the localized path is /uslugi/fintech.
        // I will stick to what seems logical. Rewrite said '/pl/uslugi/fintech'.
        pt: '/servicos/fintech',
    },
    '/services/blockchain': {
        en: '/services/blockchain',
        es: '/servicios/blockchain',
        ru: '/uslugi/blockchain',
        de: '/leistungen/blockchain',
        pl: '/uslugi/blockchain',
        pt: '/servicos/blockchain',
    },
    '/contact': {
        en: '/contact',
        es: '/contacto',
        ru: '/kontakty',
        de: '/kontakt',
        pl: '/kontakt',
        pt: '/contato',
    },
    '/portfolio': {
        en: '/portfolio',
        es: '/portafolio',
        ru: '/projekty',
        de: '/projekte',
        pl: '/realizacje',
        pt: '/portfolio',
    },
    // Blog is mostly same?
    '/blog': {
        en: '/blog',
        es: '/blog',
        ru: '/blog',
        de: '/blog',
        pl: '/blog',
        pt: '/blog',
    }
}

export function getLocalizedPath(locale: Locale, internalPath: string): string {
    const localePaths = paths[internalPath]
    if (localePaths && localePaths[locale]) {
        return `/${locale}${localePaths[locale]}`
    }
    // Fallback to strict English structure if not found
    return `/${locale}${internalPath}`
}

export function getAllLocalizedPaths(internalPath: string): Record<string, string> {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'
    const alternates: Record<string, string> = {}

    locales.forEach(locale => {
        const path = getLocalizedPath(locale, internalPath)
        alternates[locale] = `${BASE_URL}${path}`
    })

    return alternates
}
