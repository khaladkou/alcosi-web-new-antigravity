import { prisma } from '@/lib/db'
import { Locale } from '@/i18n/config'

export async function getLatestProjects(locale: string = 'en') {
    const projects = await prisma.project.findMany({
        where: { status: 'published' },
        include: {
            translations: {
                where: { locale: locale as Locale }
            }
        },
        orderBy: { publishedAt: 'desc' },
        take: 50 // Limit for now
    })

    return projects.map(p => {
        const t = p.translations[0]
        if (!t) return null
        return {
            id: p.id,
            slug: t.slug,
            title: t.title,
            description: t.description,
            imageUrl: p.imageUrl,
            category: t.category,
            tags: t.tags
        }
    }).filter(Boolean) as any[]
}

export async function getProjectBySlug(locale: string, slug: string) {
    const project = await prisma.project.findFirst({
        where: {
            translations: {
                some: {
                    slug,
                    locale: locale as Locale
                }
            }
        },
        include: {
            translations: {
                where: { locale: locale as Locale }
            }
        }
    })

    if (!project || !project.translations[0]) return null

    // Spread translation and add shared images
    return {
        ...project.translations[0],
        imageUrl: project.imageUrl,
        coverImageUrl: project.coverImageUrl
    }
}
