'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { updateSettingsAction } from '@/app/actions/settings'
import { Loader2 } from 'lucide-react'

type SettingsMap = Record<string, string>

export default function SettingsClient({ initialSettings }: { initialSettings: SettingsMap }) {
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        const res = await updateSettingsAction(formData)
        setIsPending(false)
        if (res.success) {
            toast.success(res.message)
        } else {
            toast.error(res.message)
        }
    }

    // Helper to get value with fallback
    const getVal = (key: string) => initialSettings[key] || ''

    return (
        <form action={handleSubmit}>
            <Tabs defaultValue="integrations" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    <TabsTrigger value="contacts">Contacts</TabsTrigger>
                    <TabsTrigger value="socials">Social Media</TabsTrigger>
                    <TabsTrigger value="mail">Mail</TabsTrigger>
                </TabsList>

                <TabsContent value="integrations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Third-party Integrations</CardTitle>
                            <CardDescription>Configure external services for analytics and tracking.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="google_analytics_id">Google Analytics ID (G-XXXXX)</Label>
                                <Input name="google_analytics_id" id="google_analytics_id" defaultValue={getVal('google_analytics_id')} placeholder="G-..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="google_tag_manager_id">Google Tag Manager ID (GTM-XXXXX)</Label>
                                <Input name="google_tag_manager_id" id="google_tag_manager_id" defaultValue={getVal('google_tag_manager_id')} placeholder="GTM-..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                                <Input name="facebook_pixel_id" id="facebook_pixel_id" defaultValue={getVal('facebook_pixel_id')} placeholder="1234567890" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contacts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>These details will be displayed in the header and footer.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact_email">Support Email</Label>
                                <Input name="contact_email" id="contact_email" defaultValue={getVal('contact_email')} placeholder="hello@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_phone">Phone Number</Label>
                                <Input name="contact_phone" id="contact_phone" defaultValue={getVal('contact_phone')} placeholder="+1 ..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_google_maps">Head Office Google Maps Link</Label>
                                <Input name="contact_google_maps" id="contact_google_maps" defaultValue={getVal('contact_google_maps')} placeholder="https://maps.google.com/..." />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="socials">
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media Links</CardTitle>
                            <CardDescription>Social profiles linked in the footer.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="social_linkedin">LinkedIn URL</Label>
                                <Input name="social_linkedin" id="social_linkedin" defaultValue={getVal('social_linkedin')} placeholder="https://linkedin.com/..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="social_twitter">Twitter / X URL</Label>
                                <Input name="social_twitter" id="social_twitter" defaultValue={getVal('social_twitter')} placeholder="https://twitter.com/..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="social_instagram">Instagram URL</Label>
                                <Input name="social_instagram" id="social_instagram" defaultValue={getVal('social_instagram')} placeholder="https://instagram.com/..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="social_youtube">YouTube URL</Label>
                                <Input name="social_youtube" id="social_youtube" defaultValue={getVal('social_youtube')} placeholder="https://youtube.com/..." />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="mail">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mail Configuration (SMTP)</CardTitle>
                            <CardDescription>Configure how the system sends emails (e.g., contact forms).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtp_host">SMTP Host</Label>
                                    <Input name="smtp_host" id="smtp_host" defaultValue={getVal('smtp_host')} placeholder="smtp.gmail.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtp_port">SMTP Port</Label>
                                    <Input name="smtp_port" id="smtp_port" defaultValue={getVal('smtp_port')} placeholder="587" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="smtp_user">SMTP User</Label>
                                <Input name="smtp_user" id="smtp_user" defaultValue={getVal('smtp_user')} placeholder="user@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="smtp_pass">SMTP Password</Label>
                                <Input type="password" name="smtp_pass" id="smtp_pass" defaultValue={getVal('smtp_pass')} placeholder="••••••••" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
