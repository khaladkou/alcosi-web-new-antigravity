import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { Language, ArticleStatus } from '@prisma/client'
import crypto from 'crypto'

// --- Schemas ---

const baseSchema = z.object({
    secret: z.string().optional(), // Legacy, can be ignored if signature is present
})

const translationSchema = z.object({
    language: z.string(),
    content: z.string(),
    title: z.string().optional(),
    translated_at: z.string().optional(),
})

const articleDataSchema = z.object({
    id: z.number().optional(),
    title: z.string(),
    slug: z.string(),
    content: z.string().optional(), // Main content (fallback)
    excerpt: z.string().optional(),
    meta_description: z.string().optional(),
    hero_image_url: z.string().optional(),
    hero_image_alt: z.string().optional(),
    translations: z.record(z.string(), translationSchema).optional(),
})

const successPayloadSchema = baseSchema.extend({
    status: z.literal('success'),
    tenant_id: z.number().optional(),
    entry_id: z.number().optional(),
    article_id: z.number().optional(),
    article_slug: z.string().optional(),
    article_title: z.string().optional(),
    generated_at: z.string().optional(),
    article: articleDataSchema
})

const errorPayloadSchema = baseSchema.extend({
    status: z.literal('error'),
    entry_id: z.number().optional(),
    tenant_id: z.number().optional(),
    article_id: z.number().nullable().optional(),
    error_type: z.string().optional(),
    error_message: z.string(),
    generated_at: z.string().optional(),
})

const webhookSchema = z.discriminatedUnion('status', [
    successPayloadSchema,
    errorPayloadSchema
])

export async function POST(request: NextRequest) {
    let body: any = {}
    let logEntryId: string | null = null
    let rawBody = ''
    const requestId = crypto.randomUUID()

    try {
        // 1. Read Raw Body
        try {
            rawBody = await request.text()
        } catch (e) {
            await prisma.eventLog.create({
                data: {
                    category: 'webhook',
                    level: 'error',
                    message: 'Failed to read request body',
                    requestId,
                    metadata: { error: String(e) }
                }
            })
            // Legacy WebhookLog for backward compat
            await prisma.webhookLog.create({
                data: {
                    provider: 'ai-agent',
                    method: 'POST',
                    url: request.url,
                    payload: { raw: 'Could not read request body' },
                    status: 400,
                    error: 'Read Error',
                    requestId
                }
            })
            return NextResponse.json({ error: 'Read Error' }, { status: 400 })
        }

        // Log Reception
        await prisma.eventLog.create({
            data: {
                category: 'webhook',
                level: 'info',
                message: 'Webhook Received',
                requestId,
                metadata: {
                    headers: Object.fromEntries(request.headers),
                    ip: request.headers.get('x-forwarded-for') || 'unknown'
                }
            }
        })

        // 2. Initial Log (Raw Body)
        let payloadForLog: any = { raw: rawBody }
        try {
            payloadForLog = JSON.parse(rawBody)
        } catch { /* keep as raw string obj */ }

        const logEntry = await prisma.webhookLog.create({
            data: {
                provider: 'ai-agent',
                method: 'POST',
                url: request.url,
                payload: payloadForLog,
                status: 0,
                requestId
            }
        })
        logEntryId = logEntry.id

        // 3. Signature Verification
        const signature = request.headers.get('x-contentgen-signature')
        const timestamp = request.headers.get('x-contentgen-timestamp')

        const secretSetting = await prisma.globalSetting.findUnique({
            where: { key: 'WEBHOOK_SECRET' }
        })
        const SECRET = secretSetting?.value || process.env.WEBHOOK_SECRET

        if (!SECRET) {
            console.error('WEBHOOK_SECRET not configured')
            await prisma.eventLog.create({
                data: {
                    category: 'webhook',
                    level: 'error',
                    message: 'System Configuration Error: Missing Secret',
                    requestId
                }
            })
            await prisma.webhookLog.update({
                where: { id: logEntryId },
                data: { status: 500, error: 'System Configuration Error: Missing Secret' }
            })
            return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 })
        }

        if (!signature || !timestamp) {
            await prisma.eventLog.create({
                data: {
                    category: 'webhook',
                    level: 'error',
                    message: 'Missing Signature Headers',
                    requestId
                }
            })
            await prisma.webhookLog.update({
                where: { id: logEntryId },
                data: { status: 401, error: 'Missing Signature Headers' }
            })
            return NextResponse.json({ error: 'Missing Signature' }, { status: 401 })
        }

        // HMAC-SHA256
        const signatureInput = `${timestamp}.${rawBody}`
        const hmac = crypto.createHmac('sha256', SECRET)
        const computedSignature = hmac.update(signatureInput).digest('hex')

        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(computedSignature)
        )

        if (!isValid) {
            console.error('❌ Webhook Signature Verification Failed')

            await prisma.eventLog.create({
                data: {
                    category: 'webhook',
                    level: 'error',
                    message: 'Invalid Signature',
                    requestId,
                    metadata: {
                        received: signature,
                        computed: computedSignature,
                        timestamp,
                        secretUsedPrefix: SECRET.substring(0, 5) + '...'
                    }
                }
            })

            await prisma.webhookLog.update({
                where: { id: logEntryId },
                data: { status: 401, error: 'Invalid Signature' }
            })
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 })
        }

        await prisma.eventLog.create({
            data: {
                category: 'webhook',
                level: 'info',
                message: 'Signature Valid',
                requestId
            }
        })

        // 4. Parse & Validate JSON
        try {
            body = JSON.parse(rawBody)
            await prisma.eventLog.create({
                data: {
                    category: 'webhook',
                    level: 'info',
                    message: 'JSON Body Parsed',
                    requestId
                }
            })
        } catch (e) {
            await prisma.eventLog.create({
                data: {
                    category: 'webhook',
                    level: 'error',
                    message: 'Invalid JSON format',
                    requestId,
                    metadata: { error: String(e) }
                }
            })
            await prisma.webhookLog.update({
                where: { id: logEntryId },
                data: { status: 400, error: 'Invalid JSON format' }
            })
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
        }

        const result = webhookSchema.safeParse(body)

        if (!result.success) {
            const errorResponse = {
                error: 'Invalid payload',
                details: result.error.format(),
                debug_type: typeof body
            }

            await prisma.eventLog.create({
                data: {
                    category: 'webhook',
                    level: 'error',
                    message: 'Schema Validation Failed',
                    requestId,
                    metadata: { details: result.error.format() }
                }
            })

            await prisma.webhookLog.update({
                where: { id: logEntryId },
                data: { status: 400, response: errorResponse as any, error: 'Validation Failed' }
            })
            return NextResponse.json(errorResponse, { status: 400 })
        }

        await prisma.eventLog.create({
            data: {
                category: 'webhook',
                level: 'info',
                message: 'Schema Validated',
                requestId,
                metadata: { status: result.data.status }
            }
        })

        const payload = result.data

        // --- Handle Error Payload ---
        if (payload.status === 'error') {
            await prisma.eventLog.create({
                data: {
                    category: 'webhook',
                    level: 'error',
                    message: 'Provider Reported Error',
                    requestId,
                    metadata: { error: payload.error_message }
                }
            })
            await prisma.webhookLog.update({
                where: { id: logEntryId },
                data: {
                    status: 500, // Client side error reported
                    error: payload.error_message,
                    response: { received: true, type: 'error_report', error_type: payload.error_type } as any
                }
            })
            return NextResponse.json({ success: true, message: 'Error report logged' })
        }

        // --- Handle Success Payload ---
        const { article } = payload

        // Find existing article by slug
        let articleId: number | undefined = undefined

        const existingTrans = await prisma.articleTranslation.findFirst({
            where: { slug: article.slug }
        })

        if (existingTrans) {
            articleId = existingTrans.articleId
        }

        // Prepare data for translations
        const supportedLangs = Object.values(Language) as string[]
        const translationsToUpsert: { locale: Language, data: any }[] = []

        const txMap = article.translations || {}

        // Iterate over the translations map
        Object.entries(txMap).forEach(([langCode, txData]) => {
            const data = txData as z.infer<typeof translationSchema>
            if (supportedLangs.includes(langCode)) {
                translationsToUpsert.push({
                    locale: langCode as Language,
                    data: {
                        title: data.title || article.title,
                        contentHtml: data.content || article.content || '',
                        slug: article.slug,
                    }
                })
            }
        })

        // If no translations in map, but we have root content, assume 'en'
        if (translationsToUpsert.length === 0 && (article.content || article.content === '')) {
            translationsToUpsert.push({
                locale: 'en',
                data: {
                    title: article.title,
                    contentHtml: article.content || '',
                    slug: article.slug
                }
            })
        }

        if (articleId) {
            // Update Existing Article
            await prisma.article.update({
                where: { id: articleId },
                data: {
                    updatedAt: new Date(),
                }
            })

            // Upsert Translations
            for (const item of translationsToUpsert) {
                const existing = await prisma.articleTranslation.findUnique({
                    where: {
                        locale_slug: {
                            locale: item.locale,
                            slug: item.data.slug
                        }
                    }
                })

                if (existing && existing.articleId === articleId) {
                    await prisma.articleTranslation.update({
                        where: { id: existing.id },
                        data: {
                            title: item.data.title,
                            contentHtml: item.data.contentHtml,
                            excerpt: article.excerpt,
                            metaDescription: article.meta_description,
                            updatedAt: new Date(),
                            ...(article.hero_image_url ? {
                                cardImageUrl: article.hero_image_url,
                                ogImageUrl: article.hero_image_url
                            } : {})
                        }
                    })
                } else {
                    await prisma.articleTranslation.create({
                        data: {
                            articleId: articleId,
                            locale: item.locale,
                            slug: item.data.slug,
                            title: item.data.title,
                            contentHtml: item.data.contentHtml,
                            excerpt: article.excerpt,
                            metaDescription: article.meta_description,
                            cardImageUrl: article.hero_image_url,
                            ogImageUrl: article.hero_image_url
                        }
                    })
                }
            }
        } else {
            // Create New Article
            const newArticle = await prisma.article.create({
                data: {
                    status: ArticleStatus.published,
                    publishedAt: new Date(),
                    translations: {
                        create: translationsToUpsert.map(t => ({
                            locale: t.locale,
                            slug: t.data.slug,
                            title: t.data.title,
                            contentHtml: t.data.contentHtml,
                            excerpt: article.excerpt,
                            metaDescription: article.meta_description,
                            cardImageUrl: article.hero_image_url,
                            ogImageUrl: article.hero_image_url
                        }))
                    }
                }
            })
            articleId = newArticle.id
        }

        const responseData = { success: true, articleId, operation: articleId ? 'update' : 'create' }

        await prisma.eventLog.create({
            data: {
                category: 'webhook',
                level: 'info',
                message: 'Processing Complete',
                requestId,
                metadata: { operation: responseData.operation, articleId }
            }
        })

        await prisma.webhookLog.update({
            where: { id: logEntryId },
            data: { status: 200, response: responseData as any }
        })

        return NextResponse.json(responseData)

    } catch (error: any) {
        console.error('Webhook Error:', error)
        try {
            await prisma.eventLog.create({
                data: {
                    category: 'webhook',
                    level: 'error',
                    message: 'Internal Server Error',
                    requestId,
                    metadata: { error: String(error) }
                }
            })
            if (logEntryId) {
                await prisma.webhookLog.update({
                    where: { id: logEntryId },
                    data: { status: 500, error: String(error) }
                })
            }
        } catch (innerError) {
            console.error('Failed to update log entry with error', innerError)
        }
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
    }
}
