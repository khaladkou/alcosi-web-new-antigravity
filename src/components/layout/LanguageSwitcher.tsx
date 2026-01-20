'use client'

import { useState, useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { locales, i18nConfig } from '@/i18n/config'

const languageNames: Record<string, string> = {
    en: 'English',
    pl: 'Polski',
    es: 'Español',
    de: 'Deutsch',
    pt: 'Português',
    ru: 'Русский',
}

export function LanguageSwitcher() {
    const pathname = usePathname()
    const router = useRouter()

    // Helper to detect current locale from path
    const getCurrentLocale = () => {
        const segments = pathname.split('/')
        const maybeLocale = segments[1]
        if (locales.includes(maybeLocale as any)) {
            return maybeLocale
        }
        return i18nConfig.defaultLocale
    }

    const currentLocale = getCurrentLocale()

    const handleSwitch = (newLocale: string) => {
        let newPath = pathname
        const segments = pathname.split('/')
        const likelyLocale = segments[1]

        // Check if path currently has a locale prefix
        const hasLocalePrefix = locales.includes(likelyLocale as any)

        if (newLocale === i18nConfig.defaultLocale) {
            // Switching to Default (remove prefix)
            if (hasLocalePrefix) {
                newPath = `/${segments.slice(2).join('/')}` || '/'
            }
        } else {
            // Switching to Non-Default
            if (hasLocalePrefix) {
                // Replace existing
                segments[1] = newLocale
                newPath = segments.join('/')
            } else {
                // Prepend
                newPath = `/${newLocale}${pathname}`
            }
        }

        // Ensure leading slash
        if (!newPath.startsWith('/')) newPath = '/' + newPath

        router.push(newPath)
    }

    // Fix hydration mismatch for DropdownMenu
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="w-9 px-0">
                <Globe className="size-4" />
                <span className="sr-only">Toggle language</span>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 px-0">
                    <Globe className="size-4" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        onClick={() => handleSwitch(locale)}
                        className={currentLocale === locale ? "bg-accent" : ""}
                    >
                        {languageNames[locale]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
