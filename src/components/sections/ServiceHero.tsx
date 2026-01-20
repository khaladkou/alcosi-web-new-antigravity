import { Badge } from '@/components/ui/badge'

interface ServiceHeroProps {
    title: string
    subtitle: string
    tags: string[]
    gradientFrom?: string
    gradientTo?: string
}

export function ServiceHero({
    title,
    subtitle,
    tags,
    gradientFrom = "from-indigo-500",
    gradientTo = "to-purple-500"
}: ServiceHeroProps) {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-secondary/50 to-background z-0" />
            <div className={`absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-full blur-[120px] opacity-20`} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-wrap gap-3 mb-6">
                    {tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-sm py-1 px-3 border-primary/30 text-foreground">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 tracking-tight">
                    {title}
                </h1>

                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    {subtitle}
                </p>
            </div>
        </section>
    )
}
