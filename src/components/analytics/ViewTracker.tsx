'use client'

import { useEffect } from 'react'

export function ViewTracker({ articleId }: { articleId: number }) {
    useEffect(() => {
        // Simple deduplication could be added here (e.g. session storage check)
        // For now, we count every pageload as a view per requirements.
        fetch('/api/analytics/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId })
        }).catch(err => console.error('Failed to track view', err))
    }, [articleId])

    return null
}
