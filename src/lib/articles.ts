import { prisma } from './db'
import { Language } from '@prisma/client'

export async function getLatestArticles(locale: string) {
    // Ensure locale is a valid enum or default to en
    const lang = Object.values(Language).includes(locale as Language)
        ? (locale as Language)
        : Language.en

    const articles = await prisma.article.findMany({
        where: {
            status: 'published',
            translations: {
                some: {
                    locale: lang
                }
            }
        },
        include: {
            translations: {
                where: {
                    locale: lang
                }
            }
        },
        orderBy: {
            publishedAt: 'desc'
        }
    })

    return articles.map(article => {
        const t = article.translations[0]
        return {
            id: article.id,
            slug: t.slug,
            title: t.title,
            excerpt: t.excerpt,
            publishedAt: article.publishedAt,
            locale: t.locale,
            ogImageUrl: t.ogImageUrl,
            cardImageUrl: t.cardImageUrl
        }
    })
}

export async function getArticleBySlug(locale: string, slug: string) {
    const lang = Object.values(Language).includes(locale as Language)
        ? (locale as Language)
        : Language.en

    const translation = await prisma.articleTranslation.findUnique({
        where: {
            locale_slug: {
                locale: lang,
                slug: slug
            }
        },
        include: {
            article: true
        }
    })

    if (!translation || translation.article.status !== 'published') {
        return null
    }

    return {
        ...translation,
        publishedAt: translation.article.publishedAt,
        updatedAt: translation.article.updatedAt
    }
}
