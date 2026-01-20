import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ArticleEditor } from '@/components/admin/ArticleEditor'

// Fix for Next.js 15
export default async function AdminArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const article = await prisma.article.findUnique({
        where: { id: parseInt(id) },
        include: { translations: true }
    })

    if (!article) {
        notFound()
    }

    // Convert dates to string/ISO if needed by client, but mostly okay as is if passed directly in server component architecture, 
    // though typically Next.js warns about Date objects in client props.
    // Let's rely on built-in serialization or map it cleanly.

    const serializedArticle = {
        ...article,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
        translations: article.translations.map(t => ({
            ...t,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString()
        }))
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ArticleEditor article={serializedArticle as any} />
        </div>
    )
}
