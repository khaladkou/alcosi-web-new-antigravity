import { prisma } from './src/lib/db'
import crypto from 'crypto'

async function debugDb() {
    console.log('Testing DB Access...')
    const requestId = crypto.randomUUID()

    try {
        console.log('Writing EventLog...')
        await prisma.eventLog.create({
            data: {
                category: 'test',
                level: 'info',
                message: 'Debug Test',
                requestId
            }
        })
        console.log('EventLog written.')

        console.log('Writing WebhookLog...')
        await prisma.webhookLog.create({
            data: {
                provider: 'debug',
                method: 'TEST',
                url: 'http://debug',
                payload: { test: true },
                status: 200,
                requestId
            }
        })
        console.log('WebhookLog written.')

    } catch (e: any) {
        console.error('DB Write Failed:', e)
        process.exit(1)
    }
}

debugDb()
