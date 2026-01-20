import Script from 'next/script'

interface BreadcrumbJsonLdProps {
    items: {
        name: string
        item: string
    }[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
    const breadcrumbList = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item,
        })),
    }

    return (
        <Script
            id="breadcrumb-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
        />
    )
}
