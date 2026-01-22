import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { username, password } = body

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const response = NextResponse.json({ success: true })

        // Set cookie
        response.cookies.set('admin_token', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        })

        return response
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
