import { ServiceHero } from '@/components/sections/ServiceHero'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Shield, Globe, CreditCard, Banknote } from 'lucide-react'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import Image from 'next/image'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

import { JsonLd } from '@/components/seo/JsonLd'
import { getLocalizedPath, getAllLocalizedPaths } from '@/i18n/paths'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    // In a real app we might fetch titles from dictionary, but for now hardcoded fallback is fine or use getDictionary inside
    // const t = await getDictionary(locale as Locale) 

    const alternates = getAllLocalizedPaths('/services/fintech')
    const canonical = `${BASE_URL}${getLocalizedPath(locale as Locale, '/services/fintech')}`

    return {
        title: 'Fintech Solutions - Alcosi Group',
        description: 'Secure, compliant financial software development: ISO 20022, Payment Gateways, and Banking Apps.',
        alternates: {
            canonical: canonical,
            languages: alternates
        }
    }
}

const icons = [Globe, CreditCard, Banknote, Shield]

export default async function FintechServicePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)
    const page = t.services.fintech_page

    const breadcrumbItems = [
        { label: t.nav.services, href: `/${locale}/services` },
        { label: page.title, href: `/${locale}/services/fintech`, active: true }
    ]

    const jsonLdItems = [
        { name: t.nav.home, item: `${BASE_URL}/${locale}` },
        { name: t.nav.services, item: `${BASE_URL}/${locale}/services` },
        { name: page.title, item: `${BASE_URL}/${locale}/services/fintech` }
    ]

    return (
        <>
            <BreadcrumbJsonLd items={jsonLdItems} />
            <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'FinancialProduct', // More specific than Service
                name: 'Fintech Solutions',
                description: 'Secure, compliant financial software development: ISO 20022, Payment Gateways, and Banking Apps.',
                provider: {
                    '@type': 'Organization',
                    name: 'Alcosi Group',
                    url: BASE_URL
                },
                areaServed: 'Worldwide',
                url: `${BASE_URL}/${locale}/services/fintech`
            }} />
            <ServiceHero
                title={page.title}
                subtitle={page.subtitle}
                tags={['Banking', 'Payments', 'Security']}
                gradientFrom="from-violet-600"
                gradientTo="to-fuchsia-400"
            />

            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-12">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {page.features.map((f, i) => {
                            const Icon = icons[i] || Shield
                            return (
                                <div key={f.title} className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
                                    <Icon className="size-10 text-primary mb-4" />
                                    <h3 className="text-xl font-bold font-heading mb-2">{f.title}</h3>
                                    <p className="text-muted-foreground">{f.desc}</p>
                                </div>
                            )
                        })}
                    </div>

                    <div className="bg-secondary/20 rounded-3xl p-8 md:p-12 overflow-hidden border border-border">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="text-left">
                                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">{page.security.title}</h2>
                                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                                    {page.security.desc}
                                </p>
                                <Button size="lg" asChild>
                                    <Link href={`/${locale}/contact`}>{page.security.button}</Link>
                                </Button>
                            </div>
                            <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src="https://picsum.photos/seed/fintech-security/800/800"
                                    alt="Fintech Security"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
