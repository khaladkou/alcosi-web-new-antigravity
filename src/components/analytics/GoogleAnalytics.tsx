'use client'

import React from 'react'
import Script from 'next/script'
import { useCookieConsent } from '@/contexts/CookieConsentContext'

export function GoogleAnalytics({ gaId }: { gaId: string }) {
    const { consent } = useCookieConsent()

    if (consent !== 'accepted') {
        return null
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gaId}');
        `}
            </Script>
        </>
    )
}
