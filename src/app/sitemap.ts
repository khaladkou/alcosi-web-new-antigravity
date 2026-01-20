import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { locales, Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/get-dictionary'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = []

    // 1. Static Routes
    const staticRoutes = [
        '', // Home
        '/services',
        '/services/ai',
        '/services/fintech',
        '/services/blockchain',
        '/portfolio',
        '/blog',
        '/contact',
    ]

    // Add static routes for each locale
    for (const locale of locales) {
        for (const route of staticRoutes) {
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: route === '' ? 1.0 : 0.8,
            })
        }
    }

    // 2. Portfolio Projects (Localized Data)
    for (const locale of locales) {
        const t = await getDictionary(locale as Locale)
        const projects = t.portfolio.items

        for (const project of projects) {
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}/portfolio/${project.slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7
            })
        }
    }

    // 3. Dynamic Blog Articles (Database)
    // Fetch all published articles with translations
    const articles = await prisma.article.findMany({
        where: { status: 'published' },
        include: { translations: true }
    })

    for (const article of articles) {
        for (const translation of article.translations) {
            // Only add if translation exists
            sitemapEntries.push({
                url: `${BASE_URL}/${translation.locale}/blog/${translation.slug}`,
                lastModified: article.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.6
            })
        }
    }

    return sitemapEntries
}
