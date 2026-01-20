'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        contact_email: '',
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_pass: ''
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                setFormData({
                    contact_email: data.contact_email || '',
                    smtp_host: data.smtp_host || '',
                    smtp_port: data.smtp_port || '',
                    smtp_user: data.smtp_user || '',
                    smtp_pass: data.smtp_pass || ''
                })
                setIsLoading(false)
            })
            .catch(err => {
                console.error(err)
                setIsLoading(false)
            })
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to save')

            alert('Settings saved successfully!')
        } catch (error) {
            alert('Error saving settings')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">Manage global application settings</p>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-2">General</h2>
                        <div className="space-y-2">
                            <Label htmlFor="email">Contact Form Receiver Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                placeholder="admin@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-semibold border-b pb-2">SMTP Configuration (Email Sending)</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="host">SMTP Host</Label>
                                <Input
                                    id="host"
                                    value={formData.smtp_host}
                                    onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                                    placeholder="smtp.example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="port">SMTP Port</Label>
                                <Input
                                    id="port"
                                    value={formData.smtp_port}
                                    onChange={(e) => setFormData({ ...formData, smtp_port: e.target.value })}
                                    placeholder="587"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="user">SMTP User</Label>
                                <Input
                                    id="user"
                                    value={formData.smtp_user}
                                    onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pass">SMTP Password</Label>
                                <Input
                                    id="pass"
                                    type="password"
                                    value={formData.smtp_pass}
                                    onChange={(e) => setFormData({ ...formData, smtp_pass: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            These settings will be used to send emails (e.g., contact form submissions).
                        </p>
                    </div>

                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <><Loader2 className="mr-2 size-4 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="mr-2 size-4" /> Save Settings</>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
