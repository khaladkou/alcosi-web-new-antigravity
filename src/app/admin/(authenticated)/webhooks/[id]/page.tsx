import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getAdminPath } from '@/lib/admin-config'

export default async function WebhookLogDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const log = await prisma.webhookLog.findUnique({
        where: { id }
    })

    if (!log) notFound()

    const adminPath = getAdminPath()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" asChild>
                    <Link href={`${adminPath}/webhooks`}><ArrowLeft className="mr-2 size-4" /> Back to Logs</Link>
                </Button>
                <h1 className="text-2xl font-bold">Log Details</h1>
            </div>

            <div className="grid gap-6">
                <div className="p-6 bg-card border border-border rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {log.status >= 200 && log.status < 300 ? (
                                <CheckCircle className="text-green-500 size-6" />
                            ) : (
                                <XCircle className="text-red-500 size-6" />
                            )}
                            <div>
                                <h2 className="text-lg font-bold">Request {log.id}</h2>
                                <p className="text-muted-foreground text-sm">{log.createdAt.toLocaleString()}</p>
                            </div>
                        </div>
                        <Badge variant={log.status >= 200 && log.status < 300 ? 'default' : 'destructive'} className="text-lg px-3 py-1">
                            HTTP {log.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Payload</h3>
                        <div className="bg-secondary/20 p-4 rounded-lg border border-border overflow-auto max-h-[600px]">
                            <pre className="text-xs font-mono">{JSON.stringify(log.payload, null, 2)}</pre>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Response</h3>
                        <div className="bg-secondary/20 p-4 rounded-lg border border-border overflow-auto max-h-[600px]">
                            <pre className="text-xs font-mono">{JSON.stringify(log.response, null, 2)}</pre>
                        </div>
                        {log.error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
                                <strong>Error:</strong> {log.error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
