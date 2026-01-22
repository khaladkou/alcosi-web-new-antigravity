import { ContactForm } from '@/components/sections/ContactForm'
import { ServiceHero } from '@/components/sections/ServiceHero'
import { Mail, Phone, MapPin } from 'lucide-react'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import { JsonLd } from '@/components/seo/JsonLd'
import { getLocalizedPath, getAllLocalizedPaths } from '@/i18n/paths'
import { prisma } from '@/lib/db'


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alcosi.com'

async function getContactSettings() {
    const settings = await prisma.globalSetting.findMany({
        where: {
            key: { in: ['contact_email', 'contact_phone', 'contact_google_maps'] }
        }
    })

    return {
        email: settings.find(s => s.key === 'contact_email')?.value || 'contact@alcosi.com',
        phone: settings.find(s => s.key === 'contact_phone')?.value || '+1 (555) 123-4567',
        maps: settings.find(s => s.key === 'contact_google_maps')?.value || 'https://maps.google.com'
    }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    const alternates = getAllLocalizedPaths('/contact')
    const canonical = `${BASE_URL}${getLocalizedPath(locale as Locale, '/contact')}`

    return {
        title: 'Contact Us - Alcosi Group',
        description: 'Get in touch with Alcosi Group for AI, Fintech, and Blockchain development inquiries.',
        alternates: {
            canonical: canonical,
            languages: alternates
        }
    }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)
    const settings = await getContactSettings()

    return (
        <>
            <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'ContactPage',
                name: t.contact.title,
                description: t.contact.subtitle,
                url: `${BASE_URL}/${locale}/contact`,
                mainEntity: {
                    '@type': 'Organization',
                    name: 'Alcosi Group',
                    url: BASE_URL,
                    email: settings.email,
                    telephone: settings.phone
                }
            }} />

            <ServiceHero
                title={t.contact.title}
                subtitle={t.contact.subtitle}
                tags={['Consultation', 'Support', 'Partnership']}
                gradientFrom="from-pink-500"
                gradientTo="to-rose-500"
            />

            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-3xl font-bold font-heading mb-8">{t.contact.title}</h2>
                            <p className="text-muted-foreground mb-12 text-lg">
                                {t.contact.subtitle}
                            </p>

                            <div className="space-y-8">
                                <a
                                    href={`mailto:${settings.email}`}
                                    className="flex items-start gap-4 group hover:opacity-80 transition-opacity"
                                >
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                        <Mail className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{t.contact.info.email}</h3>
                                        <p className="text-muted-foreground underline decoration-dotted underline-offset-4">
                                            {settings.email}
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                                    className="flex items-start gap-4 group hover:opacity-80 transition-opacity"
                                >
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                        <Phone className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{t.common.contact_us}</h3>
                                        <p className="text-muted-foreground underline decoration-dotted underline-offset-4">
                                            {settings.phone}
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href={settings.maps}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-4 group hover:opacity-80 transition-opacity"
                                >
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                        <MapPin className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{t.contact.info.office}</h3>
                                        <p className="text-muted-foreground underline decoration-dotted underline-offset-4 text-left">
                                            {t.contact.info.office_address}
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                            <h3 className="text-2xl font-bold font-heading mb-6">{t.contact.form.submit}</h3>
                            <ContactForm dictionary={t.contact.form} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
