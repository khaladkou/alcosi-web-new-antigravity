import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import { getArticleBySlug } from '@/lib/articles'
import { prisma } from '@/lib/db'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { ViewTracker } from '@/components/analytics/ViewTracker'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params
    const article = await getArticleBySlug(locale, slug)
    if (!article) return {}
    return {
        title: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params
    const translation = await getArticleBySlug(locale, slug)
    const article = await prisma.article.findFirst({
        where: { translations: { some: { slug, locale: locale as any } } },
        select: { id: true, publishedAt: true }
    })

    if (!translation || !article) {
        notFound()
    }

    const t = await getDictionary(locale as Locale)

    const breadcrumbItems = [
        { label: t.nav.blog, href: `/${locale}/blog` },
        { label: translation.title, href: `/${locale}/blog/${slug}`, active: true }
    ]

    const jsonLdItems = [
        { name: t.nav.home, item: `${BASE_URL}/${locale}` },
        { name: t.nav.blog, item: `${BASE_URL}/${locale}/blog` },
        { name: translation.title, item: `${BASE_URL}/${locale}/blog/${slug}` }
    ]

    return (
        <article className="pt-32 pb-20">
            <ViewTracker articleId={article.id} />
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: translation.title,
                    image: [translation.ogImageUrl],
                    datePublished: article.publishedAt?.toISOString(),
                    dateModified: article.publishedAt?.toISOString(), // approximating modified date to published date for now
                    author: {
                        '@type': 'Organization',
                        name: 'Alcosi Group'
                    }
                }}
            />
            <BreadcrumbJsonLd items={jsonLdItems} />

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="mb-8">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-0 hover:bg-transparent hover:text-primary">
                        <Link href={`/${locale}/blog`}>
                            <ArrowLeft className="mr-2 size-4" /> {t.blog.back_to_blog || 'Back to Blog'}
                        </Link>
                    </Button>
                </div>

                <header className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight">
                        {translation.title}
                    </h1>

                    <div className="flex items-center text-muted-foreground gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale) : ''}
                        </div>
                    </div>
                </header>

                {translation.ogImageUrl && (
                    <div className="mb-12 relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={translation.ogImageUrl}
                            alt={translation.title}
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}

                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary">
                    <div dangerouslySetInnerHTML={{ __html: translation.contentHtml }} />
                </div>
            </div>
        </article>
    )
}
