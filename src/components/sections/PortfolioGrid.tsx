'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Dictionary } from '@/i18n/get-dictionary'
import { useParams } from 'next/navigation'

interface ProjectSummary {
    id: number
    slug: string
    title: string
    description: string
    imageUrl: string | null
    category: string
    tags: string[]
}

interface PortfolioGridProps {
    projects: ProjectSummary[]
    dictionary: Dictionary['portfolio'] // Keep for UI labels like "view_case_study" etc
}

type FilterKey = 'all' | 'fintech' | 'ai' | 'blockchain'

export function PortfolioGrid({ projects, dictionary }: PortfolioGridProps) {
    const [activeTab, setActiveTab] = useState<FilterKey>('all')
    const params = useParams()
    const locale = params?.locale as string || 'en'

    const filterKeys: FilterKey[] = ['all', 'fintech', 'ai', 'blockchain']

    const filteredProjects = activeTab === 'all'
        ? projects
        : projects.filter(p => p.category.toLowerCase() === activeTab)

    return (
        <div>
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {filterKeys.map(key => (
                    <Button
                        key={key}
                        variant={activeTab === key ? 'default' : 'outline'}
                        onClick={() => setActiveTab(key)}
                        className="rounded-full px-6"
                    >
                        {dictionary.filters[key]}
                    </Button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/${locale}/portfolio/${project.slug}`}
                        className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                        {/* Image Placeholder */}
                        <div className="h-56 bg-secondary/30 relative overflow-hidden">
                            <Image
                                src={project.imageUrl || '/images/placeholder.jpg'}
                                alt={project.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <span className="text-primary font-bold flex items-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {dictionary.view_case_study} <ArrowRight className="ml-2 size-4" />
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <Badge variant="secondary" className="text-xs">{project.category}</Badge>
                            </div>

                            <h3 className="text-xl font-bold font-heading mb-3 group-hover:text-primary transition-colors">
                                {project.title}
                            </h3>

                            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {project.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
