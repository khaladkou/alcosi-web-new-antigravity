import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { Language, ArticleStatus } from '@prisma/client'

// Schema for validation
const contentSchema = z.object({
    secret: z.string(), // Simple secret check in body or we can use Header
    action: z.enum(['create', 'update', 'delete']).default('create'),
    data: z.object({
        slug: z.string(),
        locale: z.nativeEnum(Language),
        title: z.string(),
        excerpt: z.string().optional(),
        contentHtml: z.string(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        tags: z.array(z.string()).optional(), // We don't have tags in DB yet, but good to accept
        status: z.nativeEnum(ArticleStatus).default(ArticleStatus.published),
        publishedAt: z.string().optional(), // ISO string
    })
})

export async function POST(request: NextRequest) {
    let body: any = {}

    try {
        body = await request.json()
    } catch (e) {
        // Log invalid JSON attempt
        await prisma.webhookLog.create({
            data: {
                provider: 'ai-agent',
                method: 'POST',
                url: request.url,
                payload: { raw: 'Invalid JSON' },
                status: 400,
                error: 'Invalid JSON payload'
            }
        })
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    try {
        const result = contentSchema.safeParse(body)

        // Log the attempt
        const logEntry = await prisma.webhookLog.create({
            data: {
                provider: 'ai-agent',
                method: 'POST',
                url: request.url,
                payload: body,
                status: 0, // Placeholder
            }
        })

        if (!result.success) {
            const errorResponse = { error: 'Invalid payload', details: result.error.format() }
            await prisma.webhookLog.update({
                where: { id: logEntry.id },
                data: { status: 400, response: errorResponse as any, error: 'Validation Failed' }
            })
            return NextResponse.json(errorResponse, { status: 400 })
        }

        const { secret, data } = result.data

        if (secret !== process.env.WEBHOOK_SECRET) {
            await prisma.webhookLog.update({
                where: { id: logEntry.id },
                data: { status: 401, error: 'Unauthorized' }
            })
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Logic
        let operationResult
        const existingTranslation = await prisma.articleTranslation.findUnique({
            where: {
                locale_slug: {
                    locale: data.locale,
                    slug: data.slug
                }
            },
            include: { article: true }
        })

        if (existingTranslation) {
            const updated = await prisma.articleTranslation.update({
                where: { id: existingTranslation.id },
                data: {
                    title: data.title,
                    excerpt: data.excerpt,
                    contentHtml: data.contentHtml,
                    metaTitle: data.metaTitle || data.title,
                    metaDescription: data.metaDescription || data.excerpt,
                }
            })
            await prisma.article.update({
                where: { id: existingTranslation.articleId },
                data: {
                    updatedAt: new Date(),
                    ...(data.publishedAt ? { publishedAt: new Date(data.publishedAt) } : {})
                }
            })
            operationResult = { success: true, operation: 'update', id: updated.id }
        } else {
            const newArticle = await prisma.article.create({
                data: {
                    status: data.status,
                    publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
                    translations: {
                        create: {
                            locale: data.locale,
                            slug: data.slug,
                            title: data.title,
                            excerpt: data.excerpt,
                            contentHtml: data.contentHtml,
                            metaTitle: data.metaTitle || data.title,
                            metaDescription: data.metaDescription || data.excerpt,
                        }
                    }
                }
            })
            operationResult = { success: true, operation: 'create', articleId: newArticle.id }
        }

        await prisma.webhookLog.update({
            where: { id: logEntry.id },
            data: { status: 200, response: operationResult as any }
        })

        return NextResponse.json(operationResult)

    } catch (error: any) {
        console.error('Webhook Error:', error)
        // Try to log the system error if we can
        await prisma.webhookLog.create({
            data: {
                provider: 'ai-agent',
                method: 'POST',
                url: request.url,
                payload: body,
                status: 500,
                error: String(error)
            }
        })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
