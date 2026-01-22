import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
    request: NextRequest,
    // Fix for Next.js 15: params is a Promise
    { params }: { params: Promise<{ id: string }> }
) {
    // 1. Auth Check (Double check even if middleware does it)
    const token = request.cookies.get('admin_token')
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { translations, status } = body

    try {
        // Transactional update
        await prisma.$transaction(async (tx) => {
            // Update Status
            if (status) {
                await tx.article.update({
                    where: { id: parseInt(id) },
                    data: { status }
                })
            }

            // Update Translations
            if (translations && Array.isArray(translations)) {
                for (const t of translations) {
                    if (t.id) {
                        await tx.articleTranslation.update({
                            where: { id: t.id },
                            data: {
                                slug: t.slug, // Added missing slug update
                                title: t.title,
                                excerpt: t.excerpt,
                                contentHtml: t.contentHtml || '',
                                metaTitle: t.metaTitle,
                                metaDescription: t.metaDescription,
                                ogImageUrl: t.ogImageUrl,
                                cardImageUrl: t.cardImageUrl
                            }
                        })
                    } else if (t.locale && t.title && t.slug) {
                        // Create new translation if it doesn't exist
                        await tx.articleTranslation.create({
                            data: {
                                articleId: parseInt(id),
                                locale: t.locale,
                                slug: t.slug,
                                title: t.title,
                                excerpt: t.excerpt,
                                contentHtml: t.contentHtml || '',
                                metaTitle: t.metaTitle || t.title,
                                metaDescription: t.metaDescription || t.excerpt,
                                ogImageUrl: t.ogImageUrl,
                                cardImageUrl: t.cardImageUrl
                            }
                        })
                    }
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Update Error:', error)
        const message = error.message || 'Failed to update'

        // Handle Prisma Unique Constraint Violation
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug must be unique for this language.' }, { status: 409 })
        }

        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = request.cookies.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    try {
        await prisma.article.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
