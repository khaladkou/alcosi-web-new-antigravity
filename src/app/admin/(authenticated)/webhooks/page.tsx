import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WebhookLogsClient from './WebhookLogsClient'

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
                            <code className="block w-full p-3 bg-secondary rounded-md font-mono text-sm break-all">
                                {process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'}/api/webhooks/content
                            </code>
                            <div className="mt-4 text-sm text-muted-foreground space-y-2">
                                <p>Send <b>POST</b> requests to this URL.</p>
                                <p>Authenticate using your <code>WEBHOOK_SECRET</code> inside the JSON body.</p>
                            </div>
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
                                            "secret": "your-secret-key",
                                            "action": "create",
                                            "data": {
                                                "slug": "ai-future-trends",
                                                "locale": "en",
                                                "title": "Future Trends in AI",
                                                "excerpt": "A deep dive into 2026 AI trends.",
                                                "contentHtml": "<p>Content goes here...</p>",
                                                "metaTitle": "AI Trends 2026",
                                                "metaDescription": "Learn about AI trends.",
                                                "status": "published",
                                                "publishedAt": "2026-01-21T10:00:00Z"
                                            }
                                        }, null, 2)}
                                    </pre>
                                </TabsContent>
                                <TabsContent value="error">
                                    <pre className="block w-full p-3 bg-secondary rounded-md font-mono text-[10px] overflow-x-auto h-[250px]">
                                        {JSON.stringify({
                                            "secret": "your-secret-key",
                                            "action": "error",
                                            "data": {
                                                "slug": "failed-article-slug",
                                                "error": "Image generation timeout",
                                                "details": {
                                                    "step": "hero_image",
                                                    "retries": 3
                                                }
                                            }
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
