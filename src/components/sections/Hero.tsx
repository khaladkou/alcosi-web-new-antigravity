import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { Dictionary } from '@/i18n/get-dictionary'

interface HeroProps {
    dictionary: Dictionary['home']['hero']
    common: Dictionary['common']
}

export function Hero({ dictionary, common }: HeroProps) {
    return (
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-70 animate-pulse" />
                <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] opacity-50" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading tracking-tight mb-6">
                    {dictionary.title}
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                    {dictionary.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="group" asChild>
                        <Link href="/contact">
                            {common.start_project}
                            <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/portfolio">{dictionary.cta_secondary}</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
