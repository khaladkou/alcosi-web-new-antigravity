import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import ArticlesTable from './ArticlesTable'

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

            <ArticlesTable articles={articles} />
        </div>
    )
}
