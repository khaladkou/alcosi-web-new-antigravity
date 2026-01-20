import NextLink from 'next/link'
import { BrainCircuit, Wallet, Blocks, ArrowRight } from 'lucide-react'
import type { Dictionary } from '@/i18n/get-dictionary'

const features = [
    {
        title: 'Artificial Intelligence',
        description: 'Custom AI models, Computer Vision, and Predictive Analytics tailored for your enterprise.',
        icon: BrainCircuit,
        href: '/services#ai',
        color: 'text-indigo-400'
    },
    {
        title: 'Fintech Solutions',
        description: 'Secure payment gateways, e-invoicing systems, and banking software compliance (ISO 20022).',
        icon: Wallet,
        href: '/services#fintech',
        color: 'text-violet-400'
    },
    {
        title: 'Blockchain & Web3',
        description: 'Decentralized applications, Smart Contracts, and Tokenization platforms.',
        icon: Blocks,
        href: '/services#blockchain',
        color: 'text-emerald-400'
    }
]

interface FeatureSectionProps {
    dictionary: Dictionary['home']['features']
}

export function FeatureSection({ dictionary }: FeatureSectionProps) {
    return (
        <section className="py-20 bg-secondary/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">{dictionary.title}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {dictionary.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <NextLink
                            key={feature.title}
                            href={feature.href}
                            className="group block p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                        >
                            <div className={`mb-6 p-4 rounded-xl bg-background w-fit ${feature.color}`}>
                                <feature.icon className="size-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                {feature.description}
                            </p>
                            <div className="flex items-center text-sm font-medium text-primary">
                                Learn more <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </NextLink>
                    ))}
                </div>
            </div>
        </section>
    )
}
