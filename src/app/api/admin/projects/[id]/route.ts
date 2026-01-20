import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Locale } from '@/i18n/config'

const DEFAULT_LOCALE = 'en'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const project = await prisma.project.findUnique({
            where: { id: parseInt(id) },
            include: {
                translations: true
            }
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // Map translations by locale
        const translationsMap: Record<string, any> = {}
        project.translations.forEach(t => {
            translationsMap[t.locale] = {
                title: t.title,
                slug: t.slug,
                description: t.description,
                contentHtml: t.contentHtml,
                category: t.category,
                tags: t.tags,
                client: t.client
            }
        })

        return NextResponse.json({
            id: project.id,
            status: project.status,
            publishedAt: project.publishedAt,
            imageUrl: project.imageUrl,
            coverImageUrl: project.coverImageUrl,
            translations: translationsMap
        })
    } catch (error) {
        console.error('Failed to fetch project:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const {
            status,
            imageUrl,
            coverImageUrl,
            translations // Record<Locale, TranslationData>
        } = body
        const projectId = parseInt(id)

        // Update Project Common Fields
        await prisma.project.update({
            where: { id: projectId },
            data: {
                status,
                imageUrl,
                coverImageUrl,
                publishedAt: status === 'published' ? new Date() : undefined
            }
        })

        // Upsert Translations
        if (translations) {
            for (const [locale, data] of Object.entries(translations)) {
                const t = data as any
                await prisma.projectTranslation.upsert({
                    where: {
                        projectId_locale: {
                            projectId: projectId,
                            locale: locale as Locale
                        }
                    },
                    create: {
                        projectId: projectId,
                        locale: locale as Locale,
                        title: t.title || '',
                        slug: t.slug || '', // Should be validated/generated on client
                        description: t.description || '',
                        contentHtml: t.contentHtml || '',
                        category: t.category || 'Other',
                        tags: t.tags || [],
                        client: t.client || ''
                    },
                    update: {
                        title: t.title,
                        slug: t.slug,
                        description: t.description,
                        contentHtml: t.contentHtml,
                        category: t.category,
                        tags: t.tags,
                        client: t.client
                    }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update project:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.project.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete project:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
