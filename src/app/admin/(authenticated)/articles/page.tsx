import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

// Force dynamic for dashboard
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const articles = await prisma.article.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            translations: true
        }
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Content Dashboard</h1>
                    <p className="text-muted-foreground">Manage your website content</p>
                </div>
                <Button asChild>
                    <Link href="/admin/articles/new">
                        <PlusCircle className="mr-2 size-4" /> New Article
                    </Link>
                </Button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                            <th className="p-4 font-medium">ID</th>
                            <th className="p-4 font-medium">Title (EN)</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Languages</th>
                            <th className="p-4 font-medium">Last Updated</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map(article => {
                            const enTranslation = article.translations.find(t => t.locale === 'en')
                            return (
                                <tr key={article.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                                    <td className="p-4 font-mono text-sm text-muted-foreground">#{article.id}</td>
                                    <td className="p-4 font-medium">
                                        {enTranslation?.title || <span className="text-muted-foreground italic">No English Title</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${article.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                                            }`}>
                                            {article.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-1">
                                        {article.translations.map(t => (
                                            <span key={t.id} className="uppercase text-xs bg-secondary text-foreground px-1.5 py-0.5 rounded border border-border">
                                                {t.locale}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {new Date(article.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/articles/${article.id}`}>Edit</Link>
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {articles.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No articles found.
                    </div>
                )}
            </div>
        </div>
    )
}
