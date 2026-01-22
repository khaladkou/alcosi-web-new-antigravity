'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'

export async function markAsRead(id: string) {
    try {
        await prisma.contactSubmission.update({
            where: { id },
            data: { isRead: true }
        })
        revalidatePath(`${adminPath}/inbox`)
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Failed to mark as read' }
    }
}

export async function deleteSubmission(id: string) {
    try {
        await prisma.contactSubmission.delete({
            where: { id }
        })
        revalidatePath(`${adminPath}/inbox`)
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Failed to delete submission' }
    }
}
