import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const SETTING_KEYS = [
    'contact_email',
    'smtp_host',
    'smtp_port',
    'smtp_user',
    'smtp_pass',
    'privacy_policy',
    'terms_of_service'
]

export async function GET(request: NextRequest) {
    const token = request.cookies.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const settings = await prisma.globalSetting.findMany({
            where: { key: { in: SETTING_KEYS } }
        })

        // Reduce to object
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)

        // Ensure all keys exist with default empty string
        const result: Record<string, string> = {}
        SETTING_KEYS.forEach(key => {
            result[key] = settingsMap[key] || ''
        })

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('admin_token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()

        // Transaction to update all valid keys
        await prisma.$transaction(
            Object.entries(body)
                .filter(([key]) => SETTING_KEYS.includes(key))
                .map(([key, value]) =>
                    prisma.globalSetting.upsert({
                        where: { key },
                        update: { value: String(value) },
                        create: { key, value: String(value) }
                    })
                )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Settings Update Error:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}
