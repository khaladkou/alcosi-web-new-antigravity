import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EventsClient from './EventsClient'
import { EventLog } from './types'

// Force dynamic
export const dynamic = 'force-dynamic'

type PageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EventsPage(props: PageProps) {
    const searchParams = await props.searchParams
    const page = Number(searchParams?.page) || 1
    const type = (searchParams?.type as string) || 'ALL'
    const status = (searchParams?.status as string) || 'ALL'
    const pageSize = 50

    // Build filters
    const webhookWhere: any = {}
    const contactWhere: any = {}
    const botWhere: any = {}

    if (type !== 'ALL') {
        if (type === 'CONTACT') {
            webhookWhere.id = 'IMPOSSIBLE'
            botWhere.id = 'IMPOSSIBLE'
        } else if (type === 'WEBHOOK' || type === 'SEO_AUDIT') {
            contactWhere.id = 'IMPOSSIBLE'
            botWhere.id = 'IMPOSSIBLE'
            if (type === 'SEO_AUDIT') {
                webhookWhere.provider = 'SEO_AUDIT'
            } else {
                webhookWhere.NOT = { provider: 'SEO_AUDIT' }
            }
        } else if (type === 'BOT') {
            webhookWhere.id = 'IMPOSSIBLE'
            contactWhere.id = 'IMPOSSIBLE'
        }
    }

    if (status !== 'ALL') {
        const isSuccess = status === 'SUCCESS'
        // Bots don't have "status" really, they are just visits. Assume success?
        // Or ignore status filter for bots.
        if (isSuccess) {
            webhookWhere.status = { gte: 200, lt: 300 }
            contactWhere.status = 'success'
        } else {
            webhookWhere.NOT = { status: { gte: 200, lt: 300 } }
            contactWhere.status = { not: 'success' }
            // Bots are always success for now, so hide them on FAILED
            botWhere.id = 'IMPOSSIBLE'
        }
    }

    // Skip/Take
    const skip = (page - 1) * pageSize

    let events: EventLog[] = []
    let totalCount = 0

    const fetchWebhooks = type === 'ALL' || type === 'WEBHOOK' || type === 'SEO_AUDIT'
    const fetchContacts = type === 'ALL' || type === 'CONTACT'
    const fetchBots = type === 'ALL' || type === 'BOT'

    if (fetchWebhooks) {
        // ... (existing webhook logic)
        const [logs, count] = await prisma.$transaction([
            prisma.webhookLog.findMany({
                where: webhookWhere,
                orderBy: { createdAt: 'desc' },
                skip: type === 'ALL' ? 0 : skip,
                take: pageSize
            }),
            prisma.webhookLog.count({ where: webhookWhere })
        ])

        logs.forEach(log => {
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
        totalCount += count
    }

    if (fetchContacts) {
        // ... (existing contact logic)
        const [logs, count] = await prisma.$transaction([
            prisma.contactSubmission.findMany({
                where: contactWhere,
                orderBy: { createdAt: 'desc' },
                skip: type === 'ALL' ? 0 : skip,
                take: pageSize
            }),
            prisma.contactSubmission.count({ where: contactWhere })
        ])

        logs.forEach(log => {
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
        totalCount += count
    }

    if (fetchBots) {
        const [logs, count] = await prisma.$transaction([
            prisma.botVisit.findMany({
                where: botWhere,
                orderBy: { createdAt: 'desc' },
                skip: type === 'ALL' ? 0 : skip,
                take: pageSize
            }),
            prisma.botVisit.count({ where: botWhere })
        ])

        logs.forEach(log => {
            events.push({
                id: log.id,
                type: 'BOT',
                status: 'SUCCESS', // Bot visits are just info
                date: log.createdAt,
                summary: `${log.botType} visited ${log.path}`,
                details: {
                    userAgent: log.userAgent,
                    ip: log.ip,
                    path: log.path
                }
            })
        })
        totalCount += count
    }

    events.sort((a, b) => b.date.getTime() - a.date.getTime())

    if (type === 'ALL') {
        events = events.slice(0, pageSize)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">System Events</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Event Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <EventsClient
                        events={events}
                        totalCount={totalCount}
                        pageSize={pageSize}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
