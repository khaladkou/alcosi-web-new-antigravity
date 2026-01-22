import { prisma } from '@/lib/db'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const settings = await prisma.globalSetting.findMany()

    // Convert array to object for easier consumption
    const settingsMap: Record<string, string> = {}
    settings.forEach(s => {
        settingsMap[s.key] = s.value
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">System Settings</h1>
            <SettingsClient initialSettings={settingsMap} />
        </div>
    )
}
