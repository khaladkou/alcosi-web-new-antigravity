
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    // 1. Auth Check
    const token = request.cookies.get('admin_token')
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { translations, status } = body

        // 2. Create Article Container
        const article = await prisma.article.create({
            data: {
                status: status || 'draft',
                publishedAt: status === 'published' ? new Date() : null
            }
        })

        // 3. Create Valid Translations
        if (translations && Array.isArray(translations)) {
            for (const t of translations) {
                if (t.title && t.slug && t.contentHtml) {
                    await prisma.articleTranslation.create({
                        data: {
                            articleId: article.id,
                            locale: t.locale,
                            slug: t.slug,
                            title: t.title,
                            excerpt: t.excerpt,
                            contentHtml: t.contentHtml,
                            metaTitle: t.metaTitle || t.title,
                            metaDescription: t.metaDescription || t.excerpt,
                            ogImageUrl: t.ogImageUrl,
                            cardImageUrl: t.cardImageUrl
                        }
                    })
                }
            }
        }

        return NextResponse.json({ success: true, id: article.id })

    } catch (error) {
        console.error('Create Article Error:', error)
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
    }
}
