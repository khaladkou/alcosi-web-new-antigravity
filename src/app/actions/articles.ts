'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deleteArticlesAction(ids: number[]) {
    if (!ids || ids.length === 0) {
        return { success: false, message: 'No articles selected' }
    }

    try {
        // Transactions ensure all or nothing
        // Prisma cascade delete should handle translations if configured, 
        // but explicit delete is safer if we are unsure of schema cascade rules.
        // Let's assume schema has Cascade on relation, or clean up manually.
        // Checking schema: Article -> ArticleTranslation (usually Cascade) or just delete Article.

        // Safe bet: Delete translations first if needed, but let's try direct delete first.
        // Schema usually handles cascade if setup correctly. To be safe, let's deleteMany translations first.

        await prisma.$transaction(async (tx) => {
            await tx.articleTranslation.deleteMany({
                where: { articleId: { in: ids } }
            })

            await tx.articleView.deleteMany({
                where: { articleId: { in: ids } }
            })

            await tx.article.deleteMany({
                where: { id: { in: ids } }
            })
        })

        // Since revalidatePath requires a string, and getAdminPath uses env vars which are available on server.
        const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
        revalidatePath(`${adminPath}/articles`)
        return { success: true, message: `Successfully deleted ${ids.length} article(s)` }
    } catch (e: any) {
        console.error('Delete Articles Error:', e)
        return { success: false, message: 'Failed to delete articles: ' + e.message }
    }
}
