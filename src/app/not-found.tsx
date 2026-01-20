'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center p-4">
            <div className="space-y-6 max-w-md">
                <h1 className="text-9xl font-bold text-primary font-heading">404</h1>
                <h2 className="text-2xl font-semibold">Page Not Found</h2>
                <p className="text-muted-foreground">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Button asChild variant="default" size="lg">
                        <Link href="/">
                            <Home className="mr-2 size-4" /> Go Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="#" onClick={() => history.back()}>
                            <ArrowLeft className="mr-2 size-4" /> Go Back
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
