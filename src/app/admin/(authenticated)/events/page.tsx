import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Force dynamic
export const dynamic = 'force-dynamic'

type EventLog = {
    id: string
    type: 'WEBHOOK' | 'CONTACT' | 'SEO_AUDIT'
    status: 'SUCCESS' | 'FAILED'
    date: Date
    summary: string
    details: any
}

export default async function EventsPage() {
    const [webhooks, contacts] = await Promise.all([
        prisma.webhookLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
        prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    ])

    const events: EventLog[] = []

    webhooks.forEach(log => {
        const isSeo = log.provider === 'SEO_AUDIT'
        events.push({
            id: log.id,
            type: isSeo ? 'SEO_AUDIT' : 'WEBHOOK',
            status: log.status >= 200 && log.status < 300 ? 'SUCCESS' : 'FAILED',
            summary: isSeo ? `Page Scan: ${log.url}` : `${log.provider} (${log.method})`,
            date: log.createdAt,
            details: {
                url: log.url,
                payload: log.payload,
                response: log.response,
                error: log.error
            }
        })
    })

    contacts.forEach(log => {
        events.push({
            id: log.id,
            type: 'CONTACT',
            status: log.status === 'success' ? 'SUCCESS' : 'FAILED',
            date: log.createdAt,
            summary: `${log.name} <${log.email}>`,
            details: {
                message: log.message,
                error: log.error,
                source: log.source
            }
        })
    })

    // Sort combined events by date desc
    events.sort((a, b) => b.date.getTime() - a.date.getTime())

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">System Events</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Date</TableHead>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead>Summary</TableHead>
                                <TableHead className="w-[100px]">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={`${event.type}-${event.id}`}>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">
                                        {event.date.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={event.type === 'WEBHOOK' ? 'border-blue-500 text-blue-500' : 'border-purple-500 text-purple-500'}>
                                            {event.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={event.status === 'SUCCESS' ? 'default' : 'destructive'} className={event.status === 'SUCCESS' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                            {event.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {event.summary}
                                        {event.type === 'CONTACT' && event.details.error && (
                                            <div className="text-xs text-red-400 mt-1">{event.details.error}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <details className="group">
                                            <summary className="cursor-pointer text-xs text-primary hover:underline">View</summary>
                                            <div className="absolute right-10 mt-2 w-96 p-4 bg-popover text-popover-foreground border rounded-md shadow-lg z-50 hidden group-open:block">
                                                <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                                                    {JSON.stringify(event.details, null, 2)}
                                                </pre>
                                            </div>
                                        </details>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
