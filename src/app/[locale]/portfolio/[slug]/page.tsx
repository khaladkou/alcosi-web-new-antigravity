import { getProjectBySlug } from '@/lib/projects'
import { getRelatedArticles } from '@/lib/articles'
import { prisma } from '@/lib/db'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Code, Building2 } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'

export async function generateMetadata({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params
    const project = await getProjectBySlug(locale, slug)
    if (!project) return {}

    // Fetch all translations for hreflang
    // We need to fetch the project again with *all* translations to build the alternate map 
    // or we can just optimize getProjectBySlug to return all translations, but for now let's keep it simple
    // and assume getProjectBySlug returns what we need or we fetch independently.
    // Actually, `getProjectBySlug` returns a single translation. We need the ID to find siblings.

    // NOTE: In a real app, I'd optimize this to avoid double fetching, but for clarity:
    const allTranslations = await prisma.projectTranslation.findMany({
        where: { projectId: project.projectId }
    })

    const alternates: Record<string, string> = {}
    allTranslations.forEach(t => {
        alternates[t.locale] = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'}/${t.locale}/portfolio/${t.slug}`
    })

    return {
        title: `${project.title} - Alcosi Portfolio`,
        description: project.description,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'}/${locale}/portfolio/${slug}`,
            languages: alternates
        }
    }
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params
    const project = await getProjectBySlug(locale, slug)
    const t = await getDictionary(locale as Locale)

    if (!project) {
        notFound()
    }

    const breadcrumbItems = [
        { label: 'Portfolio', href: `/${locale}/portfolio` },
        { label: project.title, href: `/${locale}/portfolio/${slug}`, active: true }
    ]


    // Fetch related articles
    const relatedArticles = await getRelatedArticles(locale, project.tags)

    return (
        <article className="pt-32 pb-20">
            <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'CreativeWork', // Or 'SoftwareApplication' if more appropriate
                name: project.title,
                description: project.description,
                image: project.coverImageUrl ? [project.coverImageUrl] : undefined,
                author: {
                    '@type': 'Organization',
                    name: 'Alcosi Group',
                    url: 'https://alcosi.com'
                },
                datePublished: new Date().toISOString(), // In real app, rely on DB created_at
                keywords: project.tags.join(', ')
            }} />
            <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: breadcrumbItems.map((item, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.label,
                    item: `https://alcosi.com${item.href}`
                }))
            }} />
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="mb-8">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-0 hover:bg-transparent hover:text-primary">
                        <Link href={`/${locale}/portfolio`}>
                            <ArrowLeft className="mr-2 size-4" /> {t.common?.back || 'Back to Portfolio'}
                        </Link>
                    </Button>
                </div>

                {/* Hero Section */}
                <header className="mb-12">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <Badge>{project.category}</Badge>
                        {project.client && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Building2 className="size-3" /> Client: {project.client}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">{project.title}</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                        {project.description}
                    </p>
                </header>

                {/* Cover Image */}
                {project.coverImageUrl && (
                    <div className="mb-16 relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                        <Image
                            src={project.coverImageUrl}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary">
                            <div dangerouslySetInnerHTML={{ __html: project.contentHtml }} />
                        </div>

                        {/* Related Articles Section */}
                        {relatedArticles.length > 0 && (
                            <div className="mt-16 pt-16 border-t border-border">
                                <h2 className="text-2xl font-bold font-heading mb-8">Related Insights</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {relatedArticles.map(article => (
                                        <Link key={article.slug} href={`/${locale}/blog/${article.slug}`} className="group block h-full">
                                            <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors h-full flex flex-col">
                                                {article.cardImageUrl && (
                                                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                                                        <Image
                                                            src={article.cardImageUrl || article.ogImageUrl || ''}
                                                            alt={article.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {article.tags.slice(0, 2).map(tag => (
                                                            <Badge key={tag} variant="secondary" className="text-[10px] px-2 h-5">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                        {article.title}
                                                    </h3>
                                                    {article.excerpt && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                                            {article.excerpt}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center text-xs text-muted-foreground mt-auto">
                                                        <Calendar className="mr-1.5 size-3.5" />
                                                        {new Date(article.publishedAt!).toLocaleDateString(locale, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-bold mb-4">Project Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tech Stack</div>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {project.client && (
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Client</div>
                                        <div className="font-medium">{project.client}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                            <h3 className="font-bold mb-2">Need a similar solution?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Our team can help you build cutting-edge software tailored to your specific needs.
                            </p>
                            <Button asChild className="w-full">
                                <Link href={`/${locale}/contact`}>Contact Us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}
