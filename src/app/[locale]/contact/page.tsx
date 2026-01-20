import { ContactForm } from '@/components/sections/ContactForm'
import { ServiceHero } from '@/components/sections/ServiceHero'
import { Mail, Phone, MapPin } from 'lucide-react'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'

export const metadata = {
    title: 'Contact Us - Alcosi Group',
    description: 'Get in touch with Alcosi Group for AI, Fintech, and Blockchain development inquiries.',
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getDictionary(locale as Locale)

    return (
        <>
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
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <Mail className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{t.contact.info.email}</h3>
                                        <p className="text-muted-foreground">contact@alcosi.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <Phone className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{t.common.contact_us}</h3>
                                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <MapPin className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{t.contact.info.office}</h3>
                                        <p className="text-muted-foreground">
                                            {t.contact.info.office_address}
                                        </p>
                                    </div>
                                </div>
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
