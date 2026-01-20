
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path')

    if (!path) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    try {
        // Try exact match first
        // We might want to handle decoding URI components if paths have special chars
        const decodedPath = decodeURIComponent(path)

        const redirect = await prisma.redirect.findFirst({
            where: {
                source: decodedPath,
                isActive: true
            }
        })

        if (redirect) {
            return NextResponse.json({
                target: redirect.target,
                code: redirect.code
            })
        }

        return NextResponse.json({ found: false }, { status: 404 })

    } catch (error) {
        console.error('Redirect lookup error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
