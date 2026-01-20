import Link from 'next/link'
import type { Dictionary } from '@/i18n/get-dictionary'

interface FooterProps {
    dictionary: Dictionary['footer']
    common: Dictionary['common']
    locale: string
}

export function Footer({ dictionary, common, locale }: FooterProps) {
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

                <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    © {year} Alcosi Group. {dictionary.rights}
                </div>
            </div>
        </footer>
    )
}
