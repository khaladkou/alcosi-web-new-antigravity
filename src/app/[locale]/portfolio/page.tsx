import { PortfolioGrid } from '@/components/sections/PortfolioGrid'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import { getLatestProjects } from '@/lib/projects'

export const metadata = {
    title: 'Portfolio - Alcosi Group',
    description: 'Case studies of successful AI, Fintech, and Blockchain projects delivered by Alcosi Group.',
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)
    const projects = await getLatestProjects(locale)

    return (
        <div className="pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">{t.portfolio.title}</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t.portfolio.subtitle}
                    </p>
                </div>

                <PortfolioGrid projects={projects} dictionary={t.portfolio} />
            </div>
        </div>
    )
}
