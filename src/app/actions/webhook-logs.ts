'use server'

import { prisma } from '@/lib/db'

export async function getWebhookEvents(requestId: string) {
    if (!requestId) return []

    try {
        const events = await prisma.eventLog.findMany({
            where: { requestId },
            orderBy: { createdAt: 'asc' }
        })
        return events
    } catch (error) {
        console.error('Failed to fetch webhook events:', error)
        return []
    }
}
