export const locales = ['en', 'pl', 'es', 'de', 'pt', 'ru'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const i18nConfig = {
    locales,
    defaultLocale,
    cookieName: 'NEXT_LOCALE',
}
