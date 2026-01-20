
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const redirects = await prisma.redirect.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(redirects)
    } catch (error) {
        console.error('Failed to fetch redirects:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { source, target, code, isActive } = body

        if (!source || !target) {
            return NextResponse.json({ error: 'Source and Target are required' }, { status: 400 })
        }

        // Basic normalization
        // Ensure source starts with /
        const normalizedSource = source.startsWith('/') ? source : `/${source}`

        const redirect = await prisma.redirect.create({
            data: {
                source: normalizedSource,
                target,
                code: Number(code) || 301,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(redirect, { status: 201 })
    } catch (error) {
        console.error('Failed to create redirect:', error)
        // Handle unique constraint violation
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: 'Redirect for this source path already exists' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
