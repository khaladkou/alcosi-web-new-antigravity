'use client'

import React from 'react'
import { useCookieConsent } from '@/contexts/CookieConsentContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

export function CookieConsent() {
    const { showBanner, acceptAll, rejectAll } = useCookieConsent()

    if (!showBanner) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-background/80 backdrop-blur-sm border-t animate-in slide-in-from-bottom-full duration-500">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl">
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-semibold">We value your privacy</h3>
                    <p className="text-sm text-muted-foreground">
                        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                        By clicking "Accept All", you consent to our use of cookies.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={rejectAll} className="w-full sm:w-auto">
                        Reject All
                    </Button>
                    <Button onClick={acceptAll} className="w-full sm:w-auto">
                        Accept All
                    </Button>
                </div>
            </div>
        </div>
    )
}
