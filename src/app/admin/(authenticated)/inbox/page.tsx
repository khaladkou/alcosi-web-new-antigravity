import { prisma } from '@/lib/db'
import InboxClient from './InboxClient'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
    const submissions = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' }
    })

    const unreadCount = submissions.filter(s => !s.isRead).length

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Inbox
                        {unreadCount > 0 && (
                            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-lg px-3 py-1 rounded-full">
                                {unreadCount} New
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground">Manage incoming messages from contact forms.</p>
                </div>
            </div>

            <InboxClient initialSubmissions={submissions} />
        </div>
    )
}
