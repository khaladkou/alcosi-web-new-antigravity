import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { Locale } from '@/i18n/config'

const DEFAULT_LOCALE = 'en'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const locale = (searchParams.get('locale') || DEFAULT_LOCALE) as Locale

        const projects = await prisma.project.findMany({
            include: {
                translations: {
                    where: { locale }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const formattedProjects = projects.map(p => ({
            id: p.id,
            status: p.status,
            publishedAt: p.publishedAt,
            createdAt: p.createdAt,
            // Flatten translation
            title: p.translations[0]?.title || 'Untitled',
            slug: p.translations[0]?.slug || '',
            category: p.translations[0]?.category || '',
            imageUrl: p.imageUrl,
            locale: locale
        }))

        return NextResponse.json(formattedProjects)
    } catch (error) {
        console.error('Failed to fetch projects:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            status,
            imageUrl,
            coverImageUrl,
            translations // Record<Locale, TranslationData>
        } = body

        // Validation: Ensure at least one translation (e.g. default locale) exists
        if (!translations || !translations[DEFAULT_LOCALE] || !translations[DEFAULT_LOCALE].title) {
            return NextResponse.json({ error: `Title for default locale (${DEFAULT_LOCALE}) is required` }, { status: 400 })
        }

        const project = await prisma.project.create({
            data: {
                status: status || 'draft',
                publishedAt: status === 'published' ? new Date() : null,
                imageUrl,
                coverImageUrl,
                translations: {
                    create: Object.entries(translations).map(([locale, data]: [string, any]) => ({
                        locale: locale as Locale,
                        title: data.title,
                        slug: data.slug,
                        description: data.description || '',
                        contentHtml: data.contentHtml || '',
                        category: data.category || 'Other',
                        tags: data.tags || [],
                        client: data.client
                    }))
                }
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error('Failed to create project:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
