import { getProjectBySlug } from '@/lib/projects'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Code, Building2 } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'

export async function generateMetadata({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params
    const project = await getProjectBySlug(locale, slug)
    if (!project) return {}
    return {
        title: `${project.title} - Alcosi Portfolio`,
        description: project.description,
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

    return (
        <article className="pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="mb-8">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-0 hover:bg-transparent hover:text-primary">
                        <Link href={`/${locale}/portfolio`}>
                            <ArrowLeft className="mr-2 size-4" /> Back to Portfolio
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
