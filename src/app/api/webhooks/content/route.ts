import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { Language, ArticleStatus } from '@prisma/client'

const baseSchema = z.object({
    secret: z.string(),
})

const dataDataSchema = z.object({
    slug: z.string(),
    locale: z.nativeEnum(Language),
    title: z.string(),
    excerpt: z.string().optional(),
    contentHtml: z.string(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.nativeEnum(ArticleStatus).default(ArticleStatus.published),
    publishedAt: z.string().optional(),
})

const errorDataSchema = z.object({
    slug: z.string().optional(),
    locale: z.nativeEnum(Language).optional(),
    error: z.string(),
    details: z.any().optional()
})

const contentSchema = z.discriminatedUnion('action', [
    z.object({ action: z.enum(['create', 'update', 'delete']).default('create'), data: dataDataSchema }).merge(baseSchema),
    z.object({ action: z.literal('error'), data: errorDataSchema }).merge(baseSchema)
])

export async function POST(request: NextRequest) {
    let body: any = {}

    try {
        body = await request.json()
    } catch (e) {
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

    // Initial Log (Pending)
    const logEntry = await prisma.webhookLog.create({
        data: {
            provider: 'ai-agent',
            method: 'POST',
            url: request.url,
            payload: body,
            status: 0,
        }
    })

    try {
        const result = contentSchema.safeParse(body)

        if (!result.success) {
            const errorResponse = { error: 'Invalid payload', details: result.error.format() }
            await prisma.webhookLog.update({
                where: { id: logEntry.id },
                data: { status: 400, response: errorResponse as any, error: 'Validation Failed' }
            })
            return NextResponse.json(errorResponse, { status: 400 })
        }

        const { secret, action, data } = result.data

        const EXPECTED_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key'

        if (secret !== EXPECTED_SECRET) {
            await prisma.webhookLog.update({
                where: { id: logEntry.id },
                data: { status: 401, error: 'Unauthorized' }
            })
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Handle Error Report
        if (action === 'error') {
            await prisma.webhookLog.update({
                where: { id: logEntry.id },
                data: {
                    status: 500, // Mark as failed in UI
                    error: data.error,
                    response: { received: true, type: 'error_report' } as any
                }
            })
            return NextResponse.json({ success: true, message: 'Error report logged' })
        }

        // Handle Content Operations (Create/Update)
        // At this point, TS knows data is dataDataSchema because of discriminated union
        const contentData = data as z.infer<typeof dataDataSchema> // Explicit cast if inference fails, but should work

        let operationResult
        const existingTranslation = await prisma.articleTranslation.findUnique({
            where: {
                locale_slug: {
                    locale: contentData.locale,
                    slug: contentData.slug
                }
            },
            include: { article: true }
        })

        if (existingTranslation) {
            const updated = await prisma.articleTranslation.update({
                where: { id: existingTranslation.id },
                data: {
                    title: contentData.title,
                    excerpt: contentData.excerpt,
                    contentHtml: contentData.contentHtml,
                    metaTitle: contentData.metaTitle || contentData.title,
                    metaDescription: contentData.metaDescription || contentData.excerpt,
                }
            })
            await prisma.article.update({
                where: { id: existingTranslation.articleId },
                data: {
                    updatedAt: new Date(),
                    ...(contentData.publishedAt ? { publishedAt: new Date(contentData.publishedAt) } : {})
                }
            })
            operationResult = { success: true, operation: 'update', id: updated.id }
        } else {
            const newArticle = await prisma.article.create({
                data: {
                    status: contentData.status,
                    publishedAt: contentData.publishedAt ? new Date(contentData.publishedAt) : new Date(),
                    translations: {
                        create: {
                            locale: contentData.locale,
                            slug: contentData.slug,
                            title: contentData.title,
                            excerpt: contentData.excerpt,
                            contentHtml: contentData.contentHtml,
                            metaTitle: contentData.metaTitle || contentData.title,
                            metaDescription: contentData.metaDescription || contentData.excerpt,
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
        await prisma.webhookLog.update({
            where: { id: logEntry.id },
            data: { status: 500, error: String(error) }
        })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
