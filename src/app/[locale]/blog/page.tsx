import Link from 'next/link'
import { getLatestArticles } from '@/lib/articles'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar } from 'lucide-react'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import Image from 'next/image'
import { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { getLocalizedPath, getAllLocalizedPaths } from '@/i18n/paths'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)

    const alternates = getAllLocalizedPaths('/blog')
    const canonical = `${BASE_URL}${getLocalizedPath(locale as Locale, '/blog')}`

    return {
        title: `${t.blog.title} | Alcosi Group`,
        description: t.blog.subtitle,
        alternates: {
            canonical: canonical,
            languages: alternates
        }
    }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)
    const articles = await getLatestArticles(locale)

    return (
        <div className="pt-32 pb-20">
            <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'Blog',
                name: t.blog.title,
                description: t.blog.subtitle,
                url: `${BASE_URL}/${locale}/blog`
            }} />
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">{t.blog.title}</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t.blog.subtitle}
                    </p>
                </div>

                {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((post: any) => (
                            <Link
                                key={post.id}
                                href={`/${locale}/blog/${post.slug}`}
                                className="group flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                            >
                                <div className="h-48 bg-secondary/50 relative overflow-hidden">
                                    {post.cardImageUrl || post.ogImageUrl ? (
                                        <Image
                                            src={post.cardImageUrl || post.ogImageUrl}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority={post.id === articles[0]?.id}
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <Image
                                            src={`https://picsum.photos/seed/${post.slug}/800/400?grayscale`}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                                        />
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center text-sm text-muted-foreground mb-4 gap-2">
                                        <Calendar className="size-4" />
                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale) : t.blog.draft}
                                    </div>

                                    <h2 className="text-xl font-bold font-heading mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>

                                    <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center text-primary font-medium text-sm mt-auto">
                                        {t.blog.read_article} <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-secondary/20 rounded-2xl">
                        <p className="text-muted-foreground text-lg">{t.blog.no_articles}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
