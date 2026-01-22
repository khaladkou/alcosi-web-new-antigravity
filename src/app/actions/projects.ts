'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deleteProjectsAction(ids: number[]) {
    if (!ids || ids.length === 0) {
        return { success: false, message: 'No projects selected' }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Delete translations first (explicitly, though Cascade might handle it)
            await tx.projectTranslation.deleteMany({
                where: { projectId: { in: ids } }
            })

            // Delete projects
            await tx.project.deleteMany({
                where: { id: { in: ids } }
            })
        })

        const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
        revalidatePath(`${adminPath}/projects`)
        return { success: true, message: `Successfully deleted ${ids.length} project(s)` }
    } catch (e: any) {
        console.error('Delete Projects Error:', e)
        return { success: false, message: 'Failed to delete projects: ' + e.message }
    }
}
