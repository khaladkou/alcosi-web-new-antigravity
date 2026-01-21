import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { scanUrl } from '@/lib/seo-scanner'
import { locales } from '@/i18n/config'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com' // or http://localhost:3000

export async function GET(request: Request) {
    // 1. Gather all URLs to scan
    const urls: string[] = []

    // Static Pages (Main locales + Home)
    const staticPaths = ['', '/contact', '/portfolio', '/blog', '/services']

    locales.forEach(locale => {
        staticPaths.forEach(path => {
            urls.push(`${BASE_URL}/${locale}${path}`)
        })
    })

    // Portfolio Projects
    const projects = await prisma.project.findMany({
        where: { status: 'published' },
        include: { translations: true }
    })
    projects.forEach(p => {
        p.translations.forEach(t => {
            urls.push(`${BASE_URL}/${t.locale}/portfolio/${t.slug}`)
        })
    })

    // Articles
    const articles = await prisma.article.findMany({
        where: { status: 'published' },
        include: { translations: true }
    })
    articles.forEach(a => {
        a.translations.forEach(t => {
            urls.push(`${BASE_URL}/${t.locale}/blog/${t.slug}`)
        })
    })

    // Sort logic removed to be faster, frontend can sort
    return NextResponse.json({ urls })
}

export async function POST(request: Request) {
    try {
        const { url } = await request.json()
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        const result = await scanUrl(url)
        return NextResponse.json(result)
    } catch (e) {
        return NextResponse.json({ error: 'Failed to scan URL' }, { status: 500 })
    }
}
