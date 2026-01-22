import { headers } from 'next/headers'
import { prisma } from '@/lib/db'

const BOT_PATTERNS = [
    { name: 'Googlebot', pattern: /Googlebot/i },
    { name: 'ChatGPT', pattern: /ChatGPT|GPTBot/i },
    { name: 'Bingbot', pattern: /bingbot/i },
    { name: 'Twitterbot', pattern: /Twitterbot/i },
    { name: 'Facebook', pattern: /facebookexternalhit/i },
    { name: 'LinkedIn', pattern: /LinkedInBot/i },
]

export async function detectAndLogBot() {
    try {
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || ''

        let botName = null
        for (const bot of BOT_PATTERNS) {
            if (bot.pattern.test(userAgent)) {
                botName = bot.name
                break
            }
        }

        if (botName) {
            // It's a bot! Log it.
            // We use after() or just fire-and-forget promise if possible, 
            // but in Server Components we just await or let it run.
            // Since we want to be non-blocking, we ideally wouldn't await, 
            // but Server Actions/Components lifecycle is strict.
            // For now, we await it to ensure it logs, but it's fast.

            // Get IP
            const forwardedFor = headersList.get('x-forwarded-for')
            const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'

            // Get Path
            // Headers provide x-url or host/referer, but getting exact path in SC is tricky without props.
            // However, we call this from Layout which might not know the exact slug if deeper.
            // 'x-invoke-path' or 'x-current-path' might exist depending on hosting.
            // Let's rely on 'referer' or just log 'unknown' if we can't find it, 
            // OR pass it from the component props where available.

            const protocol = headersList.get('x-forwarded-proto') || 'http'
            const host = headersList.get('host') || ''
            // In Server Components, current URL is hard. 
            // We will accept path as an argument if possible, or try to infer.
        }

        return botName ? { isBot: true, name: botName, userAgent } : null
    } catch (e) {
        console.error('Bot detection error:', e)
        return null
    }
}

// Separate logging function to keep separation of concerns
export async function logBotVisit(botName: string, userAgent: string, path: string) {
    try {
        await prisma.botVisit.create({
            data: {
                botType: botName,
                userAgent: userAgent,
                path: path,
                // ip: ... (can't easily get consistent IP in headers sometimes, skipping for now or adding later)
            }
        })
    } catch (e) {
        console.error('Failed to log bot visit:', e)
    }
}
