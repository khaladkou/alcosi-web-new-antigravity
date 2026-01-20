import Link from 'next/link'
import { ServiceHero } from '@/components/sections/ServiceHero'
import { Button } from '@/components/ui/button'
import { ArrowRight, BrainCircuit, Wallet, Blocks, ShieldCheck } from 'lucide-react'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'

export const metadata = {
    title: 'Our Services - Alcosi Group',
    description: 'AI, Fintech, and Blockchain development services tailored for enterprise growth.',
}

const serviceIcons = {
    ai: BrainCircuit,
    fintech: Wallet,
    blockchain: Blocks,
    audit: ShieldCheck,
}

const serviceHrefs = {
    ai: '/services/ai',
    fintech: '/services/fintech',
    blockchain: '/services/blockchain',
    audit: '/contact',
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)

    const serviceKeys = ['ai', 'fintech', 'blockchain', 'audit'] as const

    return (
        <>
            <ServiceHero
                title={t.services.title}
                subtitle={t.services.subtitle}
                tags={['Custom Development', 'Enterprise Grade', 'Innovation']}
            />

            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {serviceKeys.map(key => {
                            const service = t.services.items[key]
                            const Icon = serviceIcons[key]

                            return (
                                <Link
                                    key={key}
                                    href={`/${locale}${serviceHrefs[key]}`}
                                    className="group flex flex-col p-8 md:p-10 rounded-3xl bg-secondary/30 border border-border hover:border-primary/50 transition-all hover:bg-secondary/50"
                                >
                                    <div className="mb-6 p-4 rounded-2xl bg-background w-fit group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="size-10 text-primary" />
                                    </div>

                                    <h2 className="text-3xl font-bold font-heading mb-4">{service.title}</h2>
                                    <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                        {service.description}
                                    </p>

                                    <div className="mt-auto flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
                                        {t.services.explore} <ArrowRight className="ml-2 size-5" />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-primary text-primary-foreground py-24 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-8">{t.services.cta.title}</h2>
                    <Button size="lg" variant="secondary" asChild>
                        <Link href={`/${locale}/contact`}>{t.services.cta.button}</Link>
                    </Button>
                </div>
            </section>
        </>
    )
}
