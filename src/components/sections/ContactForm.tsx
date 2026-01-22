'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import type { Dictionary } from '@/i18n/get-dictionary'

interface ContactFormProps {
    dictionary: Dictionary['contact']['form']
}

export function ContactForm({ dictionary }: ContactFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)
            const data = Object.fromEntries(formData.entries())

            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error('Failed to send')

            setIsSuccess(true)
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/10 text-green-500 mb-4">
                    <Send className="size-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{dictionary.success_title}</h3>
                <p className="text-muted-foreground mb-6">{dictionary.success_desc}</p>
                <Button onClick={() => setIsSuccess(false)} variant="outline">{dictionary.submit}</Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">{dictionary.name}</Label>
                <Input id="name" name="name" required placeholder={dictionary.name} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">{dictionary.email}</Label>
                <Input id="email" name="email" type="email" required placeholder="john@example.com" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject">{dictionary.subject}</Label>
                <Input id="subject" name="subject" required placeholder={dictionary.subject} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">{dictionary.message}</Label>
                <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder={dictionary.message}
                    className="min-h-[120px]"
                />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? dictionary.sending : dictionary.submit}
            </Button>
        </form>
    )
}
