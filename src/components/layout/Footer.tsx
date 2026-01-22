import Link from 'next/link'
import type { Dictionary } from '@/i18n/get-dictionary'

interface FooterProps {
    dictionary: Dictionary['footer']
    common: Dictionary['common']
    locale: string
    settings: Record<string, string>
}

import { Linkedin, Twitter, Instagram } from 'lucide-react'

export function Footer({ dictionary, common, locale, settings }: FooterProps) {
    const year = new Date().getFullYear()

    return (
        <footer className="bg-secondary/50 border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold font-heading">Alcosi<span className="text-primary">Group</span></h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Empowering businesses with advanced AI, Fintech, and Blockchain solutions.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">{dictionary.company}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href={`/${locale}/services`} className="hover:text-primary">AI Solutions</Link></li>
                            <li><Link href={`/${locale}/services`} className="hover:text-primary">Fintech Development</Link></li>
                            <li><Link href={`/${locale}/services`} className="hover:text-primary">Blockchain</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">{dictionary.company}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href={`/${locale}/about`} className="hover:text-primary">About Us</Link></li>
                            <li>
                                <a href={`mailto:${settings.contact_email || 'hello@alcosi.com'}`} className="hover:text-primary">
                                    {settings.contact_email || 'contact@alcosi.com'}
                                </a>
                            </li>
                            <li>
                                <a href={`tel:${settings.contact_phone}`} className="hover:text-primary">
                                    {settings.contact_phone || '+1 (555) 123-4567'}
                                </a>
                            </li>
                            <li><Link href={`/${locale}/contact`} className="hover:text-primary">{common.contact_us}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">{dictionary.legal}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href={`/${locale}/privacy-policy`} className="hover:text-primary">{dictionary.privacy}</Link></li>
                            <li><Link href={`/${locale}/terms-of-service`} className="hover:text-primary">{dictionary.terms}</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Social Media & Copyright */}
                <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        {settings.social_linkedin && (
                            <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                <Linkedin className="size-5" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                        )}
                        {settings.social_twitter && (
                            <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                <Twitter className="size-5" />
                                <span className="sr-only">X (Twitter)</span>
                            </a>
                        )}
                        {settings.social_instagram && (
                            <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                <Instagram className="size-5" />
                                <span className="sr-only">Instagram</span>
                            </a>
                        )}
                    </div>
                    <div>
                        © {year} Alcosi Group. {dictionary.rights}
                    </div>
                </div>
            </div>
        </footer>
    )
}
