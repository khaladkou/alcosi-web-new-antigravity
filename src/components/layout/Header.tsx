'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import type { Dictionary } from '@/i18n/get-dictionary'

interface HeaderProps {
    dictionary: Dictionary['nav']
    common: Dictionary['common']
    settings?: Record<string, string> // Optional for now
}

export function Header({ dictionary, common, settings }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const params = useParams()
    const locale = params?.locale as string || 'en'

    const navItems = [
        { name: dictionary.services, href: '/services' },
        { name: dictionary.portfolio, href: '/portfolio' },
        { name: dictionary.blog, href: '/blog' },
        { name: dictionary.contact, href: '/contact' },
    ]

    // Helper to generate localized links
    const getLink = (href: string) => `/${locale}${href}`

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href={`/${locale}`} className="text-xl font-bold font-heading tracking-tight text-foreground">
                    Alcosi<span className="text-primary">Group</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={getLink(item.href)}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <LanguageSwitcher />
                    <Button size="sm" variant="default" asChild>
                        <Link href={getLink('/contact')}>{common.get_started}</Link>
                    </Button>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={getLink(item.href)}
                            className="text-base font-medium text-foreground py-2 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm text-muted-foreground">Language</span>
                        <LanguageSwitcher />
                    </div>
                    <Button className="w-full" asChild onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href={getLink('/contact')}>{common.get_started}</Link>
                    </Button>
                </div>
            )}
        </header>
    )
}
