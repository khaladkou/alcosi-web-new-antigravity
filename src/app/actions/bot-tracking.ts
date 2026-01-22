'use server'

import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

const BOT_PATTERNS = [
    { name: 'Googlebot', pattern: /Googlebot/i },
    { name: 'ChatGPT', pattern: /ChatGPT|GPTBot/i },
    { name: 'Bingbot', pattern: /bingbot/i },
    { name: 'Twitterbot', pattern: /Twitterbot/i },
    { name: 'Facebook', pattern: /facebookexternalhit/i },
    { name: 'LinkedIn', pattern: /LinkedInBot/i },
]

export async function logBotVisitAction(path: string) {
    try {
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || ''

        // Security check: Only log if it ACTUALLY looks like a bot server-side
        // This prevents users from fake-calling the API to spam logs
        let botName = null
        for (const bot of BOT_PATTERNS) {
            if (bot.pattern.test(userAgent)) {
                botName = bot.name
                break
            }
        }

        if (!botName) return; // Not a bot, ignore

        // Get IP
        const forwardedFor = headersList.get('x-forwarded-for')
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'

        await prisma.botVisit.create({
            data: {
                botType: botName,
                userAgent: userAgent,
                path: path,
                ip: ip
            }
        })

        return { success: true }
    } catch (e) {
        // Silent fail
        return { success: false }
    }
}
