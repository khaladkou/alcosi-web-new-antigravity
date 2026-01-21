import { ServiceHero } from '@/components/sections/ServiceHero'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import Image from 'next/image'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

import { JsonLd } from '@/components/seo/JsonLd'
import { locales } from '@/i18n/config'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    // In a real app we might fetch titles from dictionary, but for now hardcoded fallback is fine or use getDictionary inside
    // const t = await getDictionary(locale as Locale) 

    const alternates: Record<string, string> = {}
    locales.forEach(l => {
        alternates[l] = `${BASE_URL}/${l}/services/ai`
    })

    return {
        title: 'AI Solutions - Alcosi Group',
        description: 'Enterprise AI development: Computer Vision, NLP, and Predictive Analytics.',
        alternates: {
            canonical: `${BASE_URL}/${locale}/services/ai`,
            languages: alternates
        }
    }
}

export default async function AIServicePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)
    const page = t.services.ai_page

    const breadcrumbItems = [
        { label: t.nav.services, href: `/${locale}/services` },
        { label: page.title, href: `/${locale}/services/ai`, active: true }
    ]

    const jsonLdItems = [
        { name: t.nav.home, item: `${BASE_URL}/${locale}` },
        { name: t.nav.services, item: `${BASE_URL}/${locale}/services` },
        { name: page.title, item: `${BASE_URL}/${locale}/services/ai` }
    ]

    return (
        <>
            <BreadcrumbJsonLd items={jsonLdItems} />
            <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'Service', // or ProfessionalService
                name: 'AI Solutions',
                description: 'Enterprise AI development: Computer Vision, NLP, and Predictive Analytics.',
                provider: {
                    '@type': 'Organization',
                    name: 'Alcosi Group',
                    url: BASE_URL
                },
                areaServed: 'Worldwide',
                url: `${BASE_URL}/${locale}/services/ai`
            }} />
            <ServiceHero
                title={page.title}
                subtitle={page.subtitle}
                tags={['Machine Learning', 'Deep Learning', 'Generative AI']}
                gradientFrom="from-blue-600"
                gradientTo="to-cyan-400"
            />

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">{page.capabilities.title}</h2>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                {page.capabilities.desc}
                            </p>

                            <ul className="space-y-4">
                                {page.capabilities.list.map(cap => (
                                    <li key={cap} className="flex items-start gap-3">
                                        <CheckCircle2 className="size-6 text-primary shrink-0" />
                                        <span className="text-lg font-medium">{cap}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10">
                                <Button size="lg" asChild>
                                    <Link href={`/${locale}/contact`}>{page.capabilities.demo}</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-secondary/30 rounded-3xl p-2 aspect-square flex items-center justify-center border border-border overflow-hidden relative group">
                            <Image
                                src="https://picsum.photos/seed/ai-visualization/800/800"
                                alt="AI Visualization"
                                fill
                                className="object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent rounded-2xl" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
