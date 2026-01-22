'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Loader2, Save } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LegalSettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        privacy_policy: '',
        terms_of_service: ''
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings')
                if (res.ok) {
                    const data = await res.json()
                    setFormData(prev => ({
                        ...prev,
                        ...data
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch legal settings')
            } finally {
                setIsLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to save')
            toast.success('Legal pages updated successfully')
        } catch (error) {
            toast.error('Error saving legal pages')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin size-8 text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Legal Pages</h1>
                    <p className="text-muted-foreground">Manage Privacy Policy and Terms of Service content</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="privacy" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                    <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                </TabsList>

                <TabsContent value="privacy" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy Policy</CardTitle>
                            <CardDescription>
                                Content for /privacy-policy page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RichTextEditor
                                value={formData.privacy_policy}
                                onChange={(val) => setFormData(prev => ({ ...prev, privacy_policy: val }))}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="terms" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Terms of Service</CardTitle>
                            <CardDescription>
                                Content for /terms-of-service page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RichTextEditor
                                value={formData.terms_of_service}
                                onChange={(val) => setFormData(prev => ({ ...prev, terms_of_service: val }))}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
