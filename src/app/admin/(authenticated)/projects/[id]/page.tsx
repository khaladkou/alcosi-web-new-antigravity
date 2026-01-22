'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { locales } from '@/i18n/config'
import { getAdminPath } from '@/lib/admin-config'

type TranslationData = {
    title: string
    slug: string
    description: string
    contentHtml: string
    category: string
    tags: string
    client: string
}

export default function ProjectEditorPage() {
    const params = useParams()
    const router = useRouter()
    const isNew = params?.id === 'new'
    const projectId = params?.id
    const adminPath = getAdminPath()

    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)

    // Common State
    const [status, setStatus] = useState('draft')
    const [imageUrl, setImageUrl] = useState('')
    const [coverImageUrl, setCoverImageUrl] = useState('')

    // Translations State
    const [translations, setTranslations] = useState<Record<string, TranslationData>>({})

    useEffect(() => {
        // Initialize translations with empty data for all locales
        const initial: Record<string, TranslationData> = {}
        locales.forEach(l => {
            initial[l] = {
                title: '',
                slug: '',
                description: '',
                contentHtml: '',
                category: 'Fintech',
                tags: '',
                client: ''
            }
        })
        setTranslations(initial)

        if (!isNew && projectId) {
            fetchProject(projectId as string)
        }
    }, [isNew, projectId])

    const fetchProject = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/projects/${id}`)
            if (!res.ok) throw new Error('Failed')
            const data = await res.json()

            setStatus(data.status)
            setImageUrl(data.imageUrl || '')
            setCoverImageUrl(data.coverImageUrl || '')

            if (data.translations) {
                setTranslations(prev => {
                    const next = { ...prev }
                    Object.keys(data.translations).forEach(locale => {
                        const t = data.translations[locale]
                        if (t) {
                            next[locale] = {
                                title: t.title || '',
                                slug: t.slug || '',
                                description: t.description || '',
                                contentHtml: t.contentHtml || '',
                                category: t.category || '',
                                tags: Array.isArray(t.tags) ? t.tags.join(', ') : '',
                                client: t.client || ''
                            }
                        }
                    })
                    return next
                })
            }
        } catch (error) {
            console.error('Error fetching project', error)
        } finally {
            setLoading(false)
        }
    }

    const updateTranslation = (locale: string, field: keyof TranslationData, value: string) => {
        setTranslations(prev => ({
            ...prev,
            [locale]: {
                ...prev[locale],
                [field]: value
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            // Process translations (convert tags back to array)
            const processedTranslations: Record<string, any> = {}
            Object.keys(translations).forEach(key => {
                const t = translations[key]
                processedTranslations[key] = {
                    ...t,
                    slug: t.slug || t.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                    tags: t.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                }
            })

            const payload = {
                status,
                imageUrl,
                coverImageUrl,
                translations: processedTranslations
            }

            const url = isNew ? '/api/admin/projects' : `/api/admin/projects/${projectId}`
            const method = isNew ? 'POST' : 'PUT'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to save')
            }

            toast.success('Saved successfully')
            router.push(`${adminPath}/projects`)
            router.refresh()
        } catch (error) {
            console.error('Failed to save project', error)
            toast.error(error instanceof Error ? error.message : 'Error saving project')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`${adminPath}/projects`}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">{isNew ? 'Create Project' : 'Edit Project'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Save Button (Top Right) */}
                <div className="flex justify-end sticky top-4 z-10">
                    <Button type="submit" disabled={saving} size="lg">
                        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                        <Save className="mr-2 size-4" /> Save Project
                    </Button>
                </div>

                <Tabs defaultValue="common" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 h-auto">
                        <TabsTrigger value="common">Common</TabsTrigger>
                        {locales.map(locale => (
                            <TabsTrigger key={locale} value={locale}>{locale.toUpperCase()}</TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="common" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Publishing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity50"
                                            value={status}
                                            onChange={e => setStatus(e.target.value)}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Images (Shared)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Card Image</Label>
                                        <div className="border border-border rounded-md p-2">
                                            <div className="relative aspect-video w-full bg-secondary/20 mb-2 rounded overflow-hidden">
                                                {imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={imageUrl} alt="Card Preview" className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No image</div>
                                                )}
                                            </div>
                                            <ImageUploader value={imageUrl} onChange={setImageUrl} />
                                            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-2 text-xs" placeholder="Or paste URL..." />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Hero/Cover Image</Label>
                                        <div className="border border-border rounded-md p-2">
                                            <div className="relative aspect-video w-full bg-secondary/20 mb-2 rounded overflow-hidden">
                                                {coverImageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={coverImageUrl} alt="Cover Preview" className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No image</div>
                                                )}
                                            </div>
                                            <ImageUploader value={coverImageUrl} onChange={setCoverImageUrl} />
                                            <Input value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} className="mt-2 text-xs" placeholder="Or paste URL..." />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {locales.map(locale => (
                        <TabsContent key={locale} value={locale} className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Top Row: Basic Info & Categorization */}
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle>Basic Info ({locale.toUpperCase()})</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                value={translations[locale]?.title || ''}
                                                onChange={e => updateTranslation(locale, 'title', e.target.value)}
                                                placeholder="Project Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Slug</Label>
                                            <Input
                                                value={translations[locale]?.slug || ''}
                                                onChange={e => updateTranslation(locale, 'slug', e.target.value)}
                                                placeholder="project-slug"
                                            />
                                            <p className="text-xs text-muted-foreground">Leave empty to auto-generate from title.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Short Description</Label>
                                            <Textarea
                                                value={translations[locale]?.description || ''}
                                                onChange={e => updateTranslation(locale, 'description', e.target.value)}
                                                rows={3}
                                                placeholder="Brief summary..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle>Categorization ({locale.toUpperCase()})</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity50"
                                                value={translations[locale]?.category || 'Fintech'}
                                                onChange={e => updateTranslation(locale, 'category', e.target.value)}
                                            >
                                                <option value="Fintech">Fintech</option>
                                                <option value="AI">AI</option>
                                                <option value="Blockchain">Blockchain</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tags</Label>
                                            <Input
                                                value={translations[locale]?.tags || ''}
                                                onChange={e => updateTranslation(locale, 'tags', e.target.value)}
                                                placeholder="React, AWS, Python"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Client Name</Label>
                                            <Input
                                                value={translations[locale]?.client || ''}
                                                onChange={e => updateTranslation(locale, 'client', e.target.value)}
                                                placeholder="Company Inc."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Full Width Content */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Content ({locale.toUpperCase()})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RichTextEditor
                                        value={translations[locale]?.contentHtml || ''}
                                        onChange={val => updateTranslation(locale, 'contentHtml', val)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </form>
        </div>
    )
}
