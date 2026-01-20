import type { Dictionary } from '@/i18n/get-dictionary'

export type Project = Dictionary['portfolio']['items'][number]

export function getProjects(portfolio: Dictionary['portfolio'], category?: string) {
    if (!category || category === 'All' || category === portfolio.filters.all) return portfolio.items
    return portfolio.items.filter(p => p.category === category)
}

export function getProjectBySlug(portfolio: Dictionary['portfolio'], slug: string) {
    return portfolio.items.find(p => p.slug === slug)
}
