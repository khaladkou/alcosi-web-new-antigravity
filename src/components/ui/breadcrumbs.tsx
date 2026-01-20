import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
    label: string
    href: string
    active?: boolean
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground mb-8">
            <ol className="flex items-center gap-2">
                <li>
                    <Link href="/" className="hover:text-primary transition-colors flex items-center">
                        <Home className="size-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={item.href} className="flex items-center gap-2">
                        <ChevronRight className="size-4" />
                        {item.active ? (
                            <span className="font-medium text-foreground" aria-current="page">
                                {item.label}
                            </span>
                        ) : (
                            <Link href={item.href} className="hover:text-primary transition-colors">
                                {item.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
