import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Eye, CheckCircle, XCircle, Mail } from 'lucide-react'

// Force dynamic for dashboard
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    // 1. Fetch Stats
    const totalArticles = await prisma.article.count()

    // Total Views
    const totalViews = await prisma.articleView.count()

    // Views Yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const viewsYesterday = await prisma.articleView.count({
        where: {
            createdAt: {
                gte: yesterday,
                lt: today
            }
        }
    })

    // Webhook Stats (All Time)
    const webhooksSuccess = await prisma.webhookLog.count({
        where: { status: 200 }
    })

    const webhooksFailed = await prisma.webhookLog.count({
        where: { status: { not: 200 } }
    })

    // Contact Stats
    const contactsSuccess = await prisma.contactSubmission.count({
        where: { status: 'success' }
    })
    const contactsFailed = await prisma.contactSubmission.count({
        where: { status: 'failed' }
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Articles Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Articles
                        </CardTitle>
                        <FileText className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalArticles}</div>
                        <p className="text-xs text-muted-foreground">
                            Published & Drafts
                        </p>
                    </CardContent>
                </Card>

                {/* Total Views Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Views
                        </CardTitle>
                        <Eye className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews}</div>
                        <p className="text-xs text-muted-foreground">
                            All time page visits
                        </p>
                    </CardContent>
                </Card>

                {/* Views Yesterday Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Views Yesterday
                        </CardTitle>
                        <Eye className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{viewsYesterday}</div>
                        <p className="text-xs text-muted-foreground">
                            {yesterday.toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>

                {/* Webhooks Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Webhooks Status
                        </CardTitle>
                        <CheckCircle className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex gap-2 items-end">
                            <span className="text-green-600">{webhooksSuccess}</span>
                            <span className="text-sm font-normal text-muted-foreground">/</span>
                            <span className="text-red-500">{webhooksFailed}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Success / Failed
                        </p>
                    </CardContent>
                </Card>

                {/* Contact Messages Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Contact Messages
                        </CardTitle>
                        <Mail className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex gap-2 items-end">
                            <span className="text-green-600">{contactsSuccess}</span>
                            <span className="text-sm font-normal text-muted-foreground">/</span>
                            <span className="text-red-500">{contactsFailed}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Success / Failed
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
