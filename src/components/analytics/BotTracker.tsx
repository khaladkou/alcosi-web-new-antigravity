'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { logBotVisitAction } from '@/app/actions/bot-tracking'

export function BotTracker() {
    const pathname = usePathname()

    useEffect(() => {
        // Fire and forget
        logBotVisitAction(pathname)
    }, [pathname])

    return null
}
