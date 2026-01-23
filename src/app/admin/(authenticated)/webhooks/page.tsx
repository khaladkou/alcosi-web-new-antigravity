import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WebhookLogsClient from './WebhookLogsClient'
import { CopyButton } from '@/components/common/CopyButton'
import WebhookSecretManager from './WebhookSecretManager'
import { getWebhookSecret } from '@/app/actions/settings'

// Force dynamic for logs
export const dynamic = 'force-dynamic'

export default async function WebhookLogsPage({
    searchParams
}: {
    searchParams: { page?: string }
}) {
    const page = Number(searchParams.page) || 1
    const pageSize = 20
    const skip = (page - 1) * pageSize

    const [logs, totalCount] = await prisma.$transaction([
        prisma.webhookLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: pageSize,
            skip: skip
        }),
        prisma.webhookLog.count()
    ])

    const initialSecret = await getWebhookSecret()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/admin/dashboard"><ArrowLeft className="mr-2 size-4" /> Back</Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Webhooks</h1>
                        <p className="text-muted-foreground">Manage and monitor external webhook integrations.</p>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`?page=${page}`}><RefreshCw className="mr-2 size-4" /> Refresh</Link>
                </Button>
            </div>

            <div className="grid gap-6 mb-8">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Configuration</h3>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-2">Endpoint URL</label>
                            <div className="relative group mb-6">
                                <code className="block w-full p-3 pr-10 bg-secondary rounded-md font-mono text-sm break-all">
                                    {(process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com') + '/api/webhooks/content'}
                                </code>
                                <CopyButton
                                    text={(process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com') + '/api/webhooks/content'}
                                    className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm"
                                />
                            </div>

                            <WebhookSecretManager initialSecret={initialSecret} />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-2">Payload Examples</label>
                            <Tabs defaultValue="create" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="create">Create / Update</TabsTrigger>
                                    <TabsTrigger value="error">Report Error</TabsTrigger>
                                </TabsList>
                                <TabsContent value="create">
                                    <pre className="block w-full p-3 bg-secondary rounded-md font-mono text-[10px] overflow-x-auto h-[250px]">
                                        {JSON.stringify({
                                            "status": "success",
                                            "tenant_id": 3,
                                            "entry_id": 123,
                                            "article_id": 456,
                                            "article_slug": "sample-article",
                                            "article_title": "Sample Article",
                                            "generated_at": "2025-01-10T12:00:00Z",
                                            "article": {
                                                "id": 456,
                                                "tenant_id": 3,
                                                "title": "Sample Article",
                                                "slug": "sample-article",
                                                "content": "This is a single-sentence article.",
                                                "excerpt": "This is a single-sentence article.",
                                                "meta_description": "This is a single-sentence article.",
                                                "hero_image_url": "/static/generated_images/sample_hero.jpg",
                                                "hero_image_alt": "Sample hero image",
                                                "content_images": [
                                                    {
                                                        "url": "/static/generated_images/sample_content.jpg",
                                                        "placement": "body",
                                                        "artifact": {
                                                            "url": "/static/generated_images/sample_content.jpg",
                                                            "mime_type": "image/jpeg",
                                                            "size_bytes": 1024,
                                                            "base64": "..."
                                                        }
                                                    }
                                                ],
                                                "translations": {
                                                    "en": {
                                                        "language": "en",
                                                        "content": "This is a single-sentence article.",
                                                        "translated_at": "2025-01-10T12:00:00Z"
                                                    },
                                                    "de": {
                                                        "language": "de",
                                                        "content": "Dies ist ein Beispielsatz.",
                                                        "translated_at": "2025-01-10T12:00:00Z"
                                                    }
                                                }
                                            },
                                            "artifacts": {
                                                "hero_image": {
                                                    "url": "/static/generated_images/sample_hero.jpg",
                                                    "mime_type": "image/jpeg",
                                                    "size_bytes": 2048,
                                                    "base64": "..."
                                                }
                                            }
                                        }, null, 2)}
                                    </pre>
                                </TabsContent>
                                <TabsContent value="error">
                                    <pre className="block w-full p-3 bg-secondary rounded-md font-mono text-[10px] overflow-x-auto h-[250px]">
                                        {JSON.stringify({
                                            "status": "error",
                                            "entry_id": 65,
                                            "tenant_id": 3,
                                            "article_id": null,
                                            "error_type": "ArticleGenerationError",
                                            "generated_at": "2026-01-22T19:13:39.534793",
                                            "error_message": "Quality score 20 below threshold 40"
                                        }, null, 2)}
                                    </pre>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>

            <WebhookLogsClient logs={logs} totalCount={totalCount} pageSize={pageSize} />
        </div>
    )
}
