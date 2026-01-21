import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'

// Force dynamic for logs
export const dynamic = 'force-dynamic'

export default async function WebhookLogsPage() {
    const logs = await prisma.webhookLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    })

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
                    <Link href="/admin/webhooks"><RefreshCw className="mr-2 size-4" /> Refresh</Link>
                </Button>
            </div>

            <div className="grid gap-6 mb-8">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Configuration</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-2">Endpoint URL</label>
                            <code className="block w-full p-3 bg-secondary rounded-md font-mono text-sm break-all">
                                {process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'}/api/webhooks/content
                            </code>
                            <p className="text-xs text-muted-foreground mt-2">
                                Send <b>POST</b> requests to this URL to create or update articles automatically.
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-2">Payload Example</label>
                            <pre className="block w-full p-3 bg-secondary rounded-md font-mono text-xs overflow-x-auto">
                                {JSON.stringify({
                                    "secret": process.env.WEBHOOK_SECRET || "your-secret",
                                    "data": {
                                        "locale": "en",
                                        "slug": "ai-future",
                                        "title": "The Future of AI",
                                        "contentHtml": "<p>Content...</p>"
                                    }
                                }, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                            <th className="p-4 font-medium">Time</th>
                            <th className="p-4 font-medium">Provider</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Error / Summary</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                                <td className="p-4 text-sm text-muted-foreground font-mono">
                                    {log.createdAt.toLocaleString()}
                                </td>
                                <td className="p-4 font-medium">
                                    {log.provider}
                                </td>
                                <td className="p-4">
                                    <Badge variant={log.status >= 200 && log.status < 300 ? 'default' : 'destructive'}>
                                        {log.status}
                                    </Badge>
                                </td>
                                <td className="p-4 text-sm max-w-md truncate" title={log.error || ''}>
                                    {log.error || <span className="text-muted-foreground italic">Success</span>}
                                </td>
                                <td className="p-4">
                                    <Button size="sm" variant="ghost" asChild>
                                        <Link href={`/admin/webhooks/${log.id}`}>View Details</Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No logs found.
                    </div>
                )}
            </div>
        </div>
    )
}
