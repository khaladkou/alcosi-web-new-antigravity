
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const { source, target, code, isActive } = body

        // Basic normalization
        const normalizedSource = source && !source.startsWith('/') ? `/${source}` : source

        const redirect = await prisma.redirect.update({
            where: { id: Number(id) },
            data: {
                source: normalizedSource,
                target,
                code: Number(code),
                isActive
            }
        })

        return NextResponse.json(redirect)
    } catch (error) {
        console.error('Failed to update redirect:', error)
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: 'Redirect for this source path already exists' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.redirect.delete({
            where: { id: Number(id) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete redirect:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
