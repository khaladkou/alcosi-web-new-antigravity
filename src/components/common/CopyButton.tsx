'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
    text: string
    className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className={cn("size-8 text-muted-foreground hover:text-foreground", className)}
        >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
    )
}
