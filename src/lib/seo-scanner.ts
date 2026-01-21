import { JSDOM } from 'jsdom'

export type SeoAnalysisResult = {
    url: string
    statusCode: number
    title: { value: string | null; valid: boolean; message: string }
    description: { value: string | null; valid: boolean; message: string }
    canonical: { value: string | null; valid: boolean; message: string }
    hreflang: { count: number; valid: boolean; message: string }
    schemaOrg: { count: number; valid: boolean; message: string }
    openGraph: { count: number; valid: boolean; message: string }
    images: { count: number; withAlt: number; valid: boolean; message: string }
    loadTime: number
}

export async function scanUrl(url: string): Promise<SeoAnalysisResult> {
    const start = performance.now()
    let response: Response
    try {
        response = await fetch(url, {
            headers: {
                'User-Agent': 'Alcosi-SEO-Bot/1.0'
            },
            cache: 'no-store'
        })
    } catch (e) {
        return {
            url,
            statusCode: 0,
            title: { value: null, valid: false, message: 'Failed to fetch URL' },
            description: { value: null, valid: false, message: 'Failed to fetch URL' },
            canonical: { value: null, valid: false, message: 'Failed to fetch URL' },
            hreflang: { count: 0, valid: false, message: 'Failed to fetch URL' },
            schemaOrg: { count: 0, valid: false, message: 'Failed to fetch URL' },
            openGraph: { count: 0, valid: false, message: 'Failed to fetch URL' },
            images: { count: 0, withAlt: 0, valid: false, message: 'Failed to fetch URL' },
            loadTime: 0
        }
    }

    const loadTime = Math.round(performance.now() - start)
    const html = await response.text()
    const dom = new JSDOM(html)
    const doc = dom.window.document

    // Title
    const title = doc.querySelector('title')?.textContent || null
    const titleValid = !!title && title.length > 10 && title.length < 70

    // Description
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || null
    const descValid = !!description && description.length > 50 && description.length < 160

    // Canonical
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || null
    const canonicalValid = !!canonical

    // Hreflang
    const hreflangs = doc.querySelectorAll('link[rel="alternate"][hreflang]')
    const hreflangValid = hreflangs.length > 0

    // Schema.org
    const schemas = doc.querySelectorAll('script[type="application/ld+json"]')
    const schemaValid = schemas.length > 0
    let validSchemas = 0
    schemas.forEach(s => {
        try {
            JSON.parse(s.textContent || '{}')
            validSchemas++
        } catch (e) { }
    })

    // OpenGraph
    const ogTags = doc.querySelectorAll('meta[property^="og:"]')
    const ogValid = ogTags.length >= 4 // title, type, image, url

    // Images
    const images = doc.querySelectorAll('img')
    const imagesWithAlt = Array.from(images).filter(img => img.hasAttribute('alt') && img.getAttribute('alt')!.trim().length > 0).length
    const imagesValid = images.length === 0 || images.length === imagesWithAlt

    return {
        url,
        statusCode: response.status,
        title: {
            value: title,
            valid: titleValid,
            message: titleValid ? 'OK' : (title ? `Length ${title.length} (rec 10-70)` : 'Missing')
        },
        description: {
            value: description,
            valid: descValid,
            message: descValid ? 'OK' : (description ? `Length ${description.length} (rec 50-160)` : 'Missing')
        },
        canonical: {
            value: canonical,
            valid: canonicalValid,
            message: canonicalValid ? 'Present' : 'Missing'
        },
        hreflang: {
            count: hreflangs.length,
            valid: hreflangValid,
            message: hreflangValid ? `${hreflangs.length} tags found` : 'Missing (Required for multi-lang)'
        },
        schemaOrg: {
            count: validSchemas,
            valid: schemaValid,
            message: schemaValid ? `${validSchemas} valid schemas found` : 'Missing JSON-LD'
        },
        openGraph: {
            count: ogTags.length,
            valid: ogValid,
            message: ogValid ? `${ogTags.length} tags found` : 'Missing/Incomplete'
        },
        images: {
            count: images.length,
            withAlt: imagesWithAlt,
            valid: imagesValid,
            message: imagesValid ? 'All have Alt' : `${images.length - imagesWithAlt} missing Alt`
        },
        loadTime
    }
}
