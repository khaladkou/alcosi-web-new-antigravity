import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/static/'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    }
}
