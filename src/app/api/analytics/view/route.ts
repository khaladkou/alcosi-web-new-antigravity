import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { articleId } = await request.json()

        if (!articleId) {
            return NextResponse.json({ error: 'Missing articleId' }, { status: 400 })
        }

        await prisma.articleView.create({
            data: {
                articleId: Number(articleId)
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to view article', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
