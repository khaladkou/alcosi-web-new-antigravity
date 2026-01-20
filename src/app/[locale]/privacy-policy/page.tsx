import { prisma } from '@/lib/db'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | Alcosi Group',
    description: 'Privacy Policy for Alcosi Group services and website.',
    robots: {
        index: false,
        follow: true
    }
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)

    const setting = await prisma.globalSetting.findUnique({
        where: { key: 'privacy_policy' }
    })

    const content = setting?.value || '<p>No content defined.</p>'

    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    )
}
