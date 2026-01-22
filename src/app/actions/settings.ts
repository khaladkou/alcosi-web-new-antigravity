'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateSettingsAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())

    // keys we allow to update
    const allowedKeys = [
        'google_analytics_id',
        'google_tag_manager_id',
        'facebook_pixel_id',
        'contact_email',
        'contact_phone',
        'contact_google_maps',
        'social_linkedin',
        'social_twitter',
        'social_instagram',
        'social_youtube',
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_pass'
    ]

    try {
        const updates = []
        for (const key of allowedKeys) {
            const value = rawData[key] as string
            if (value !== undefined) {
                updates.push(
                    prisma.globalSetting.upsert({
                        where: { key },
                        update: { value },
                        create: { key, value }
                    })
                )
            }
        }

        await prisma.$transaction(updates)
        const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
        revalidatePath(`${adminPath}/settings`)
        revalidatePath('/', 'layout') // Revalidate whole site as settings might be in footer/header

        return { success: true, message: 'Settings updated successfully' }
    } catch (e) {
        console.error(e)
        return { success: false, message: 'Failed to update settings' }
    }
}
