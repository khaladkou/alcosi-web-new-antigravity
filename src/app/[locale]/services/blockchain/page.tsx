import { ServiceHero } from '@/components/sections/ServiceHero'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Blocks, Code2 } from 'lucide-react'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import Image from 'next/image'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'

export const metadata = {
    title: 'Blockchain Engineering - Alcosi Group',
    description: 'Decentralized Application (dApp) development and Smart Contract auditing.',
}

export default async function BlockchainServicePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)
    const page = t.services.blockchain_page

    const breadcrumbItems = [
        { label: t.nav.services, href: `/${locale}/services` },
        { label: page.title, href: `/${locale}/services/blockchain`, active: true }
    ]

    const jsonLdItems = [
        { name: t.nav.home, item: `${BASE_URL}/${locale}` },
        { name: t.nav.services, item: `${BASE_URL}/${locale}/services` },
        { name: page.title, item: `${BASE_URL}/${locale}/services/blockchain` }
    ]

    return (
        <>
            <BreadcrumbJsonLd items={jsonLdItems} />
            <ServiceHero
                title={page.title}
                subtitle={page.subtitle}
                tags={['Web3', 'Smart Contracts', 'DeFi']}
                gradientFrom="from-emerald-500"
                gradientTo="to-teal-400"
            />

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="md:w-1/2 p-8 border border-border rounded-2xl bg-gradient-to-br from-secondary/10 to-transparent">
                            <Blocks className="size-12 text-emerald-500 mb-6" />
                            <h3 className="text-2xl font-bold font-heading mb-4">{page.features.tokenization.title}</h3>
                            <p className="text-muted-foreground">
                                {page.features.tokenization.desc}
                            </p>
                        </div>

                        <div className="md:w-1/2 p-8 border border-border rounded-2xl bg-gradient-to-br from-secondary/10 to-transparent">
                            <Code2 className="size-12 text-emerald-500 mb-6" />
                            <h3 className="text-2xl font-bold font-heading mb-4">{page.features.smart_contracts.title}</h3>
                            <p className="text-muted-foreground">
                                {page.features.smart_contracts.desc}
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">
                            <Image
                                src="https://picsum.photos/seed/blockchain-network/800/800"
                                alt="Blockchain Network"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-transparent" />
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl font-bold font-heading mb-6">{page.infrastructure.title}</h2>
                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                {page.infrastructure.desc}
                            </p>
                            <div className="flex flex-col gap-3">
                                <div className="p-4 bg-secondary/20 rounded-lg border border-border">
                                    <span className="font-bold text-emerald-500 block mb-1">{page.infrastructure.l1_l2}</span>
                                    <span className="text-sm text-muted-foreground">{page.infrastructure.l1_l2_desc}</span>
                                </div>
                                <div className="p-4 bg-secondary/20 rounded-lg border border-border">
                                    <span className="font-bold text-emerald-500 block mb-1">{page.infrastructure.storage}</span>
                                    <span className="text-sm text-muted-foreground">{page.infrastructure.storage_desc}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <Button size="lg" asChild>
                            <Link href={`/${locale}/contact`}>{page.button}</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    )
}
