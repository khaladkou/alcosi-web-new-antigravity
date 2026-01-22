'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type ConsentStatus = 'accepted' | 'rejected' | null

interface CookieConsentContextType {
    consent: ConsentStatus
    acceptAll: () => void
    rejectAll: () => void
    resetConsent: () => void
    showBanner: boolean
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
    const [consent, setConsent] = useState<ConsentStatus>(null)
    const [showBanner, setShowBanner] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        // Check local storage on mount
        const storedConsent = localStorage.getItem('cookie_consent') as ConsentStatus
        if (storedConsent) {
            setConsent(storedConsent)
            setShowBanner(false)
        } else {
            setShowBanner(true)
        }
        setIsLoaded(true)
    }, [])

    const acceptAll = () => {
        setConsent('accepted')
        localStorage.setItem('cookie_consent', 'accepted')
        setShowBanner(false)
    }

    const rejectAll = () => {
        setConsent('rejected')
        localStorage.setItem('cookie_consent', 'rejected')
        setShowBanner(false)
    }

    const resetConsent = () => {
        setConsent(null)
        localStorage.removeItem('cookie_consent')
        setShowBanner(true)
    }

    if (!isLoaded) {
        return null // or a loader, or just render children without context logic if blocking is bad
        // But for cookie consent, we usually want to know the state before rendering tracking scripts.
        // However, we don't want to block the whole UI. 
        // Let's just render children, but effective consent is null until loaded.
        // Actually, just rendering children is better for perceived performance. 
    }

    return (
        <CookieConsentContext.Provider value={{ consent, acceptAll, rejectAll, resetConsent, showBanner }}>
            {children}
        </CookieConsentContext.Provider>
    )
}

export function useCookieConsent() {
    const context = useContext(CookieConsentContext)
    if (context === undefined) {
        throw new Error('useCookieConsent must be used within a CookieConsentProvider')
    }
    return context
}
