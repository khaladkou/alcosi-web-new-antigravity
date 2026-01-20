import 'server-only'
import type { Locale } from './config'

// We need to import the JSON structure type to ensure type safety
// Since we don't have a generated type, we can infer it from 'en'
import type en from '@/dictionaries/en.json'

const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    pl: () => import('@/dictionaries/pl.json').then((module) => module.default),
    es: () => import('@/dictionaries/es.json').then((module) => module.default),
    de: () => import('@/dictionaries/de.json').then((module) => module.default),
    pt: () => import('@/dictionaries/pt.json').then((module) => module.default),
    ru: () => import('@/dictionaries/ru.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
    // If locale is somehow invalid or missing, fallback to en
    // In strict mode, 'locale' passed here should be valid from middleware
    try {
        const dict = await (dictionaries[locale]?.() ?? dictionaries.en())
        console.log(`[getDictionary] Loaded ${locale}, keys:`, Object.keys(dict))
        return dict
    } catch (error) {
        console.error(`[getDictionary] Failed to load ${locale}:`, error)
        return dictionaries.en()
    }
}

export type Dictionary = typeof en
