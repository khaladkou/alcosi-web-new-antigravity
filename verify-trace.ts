import { prisma } from './src/lib/db'

async function checkTrace() {
    // Get the latest WebhookLog
    const log = await prisma.webhookLog.findFirst({
        orderBy: { createdAt: 'desc' }
    })

    if (!log) {
        console.log('No Webhook Logs found.')
        return
    }

    console.log('Latest Webhook Log:', {
        id: log.id,
        status: log.status,
        error: log.error,
        requestId: log.requestId
    })

    if (log.requestId) {
        const events = await prisma.eventLog.findMany({
            where: { requestId: log.requestId },
            orderBy: { createdAt: 'asc' }
        })

        console.log('\n--- Trace Events ---')
        events.forEach(e => {
            console.log(`[${e.level.toUpperCase()}] ${e.message} ${e.metadata ? JSON.stringify(e.metadata) : ''}`)
        })
    } else {
        console.log('No requestId found on log.')
    }
}

checkTrace()
