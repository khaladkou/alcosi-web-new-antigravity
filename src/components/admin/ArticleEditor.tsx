'use client'

import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { ImageUploader } from '@/components/admin/ImageUploader'


// ... existing imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Trash2, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

type ArticleWithTranslations = {
    id?: number
    status: string
    translations: any[]
}

export function ArticleEditor({ article }: { article?: ArticleWithTranslations }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [activeLocale, setActiveLocale] = useState('en')

    // Default empty state for new article
    const [formData, setFormData] = useState<ArticleWithTranslations>(article || {
        status: 'draft',
        translations: []
    })

    // Helper to get active translation or default object
    const getActiveTranslation = () => {
        return formData.translations.find((t: any) => t.locale === activeLocale) || {
            locale: activeLocale,
            title: '',
            slug: '',
            excerpt: '',
            contentHtml: '',
            metaTitle: '',
            metaDescription: '',
            ogImageUrl: '',
            cardImageUrl: ''
        }
    }

    const handleTranslationChange = (field: string, value: string) => {
        const existingIndex = formData.translations.findIndex((t: any) => t.locale === activeLocale)

        // Auto-generate slug from title if slug is empty and we are editing title
        let newValue = value
        let newSlug = undefined

        if (field === 'title' && existingIndex === -1) {
            // Basic slugify for new translations
            newSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }

        let updatedTranslations = [...formData.translations]

        if (existingIndex > -1) {
            updatedTranslations[existingIndex] = { ...updatedTranslations[existingIndex], [field]: newValue }
        } else {
            // Create new translation entry
            updatedTranslations.push({
                locale: activeLocale,
                [field]: newValue,
                slug: newSlug // Will be undefined if not title, which is fine
            })
        }

        setFormData({ ...formData, translations: updatedTranslations })
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const isNew = !article?.id
            const url = isNew ? '/api/admin/articles' : `/api/admin/articles/${article.id}`
            const method = isNew ? 'POST' : 'PUT'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: formData.status,
                    translations: formData.translations
                })
            })

            if (!res.ok) throw new Error('Failed to save')

            alert('Saved successfully!')
            if (isNew) {
                router.push('/admin/dashboard')
            } else {
                router.refresh()
            }
        } catch (e) {
            alert('Error saving')
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!article?.id) return
        if (!confirm('Are you sure you want to delete this article?')) return

        try {
            const res = await fetch(`/api/admin/articles/${article.id}`, { method: 'DELETE' })
            if (res.ok) {
                router.push('/admin/dashboard')
            }
        } catch (e) {
            alert('Error deleting')
        }
    }

    const activeTranslation = getActiveTranslation()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/admin/dashboard"><ArrowLeft className="mr-2 size-4" /> Back</Link>
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {article?.id ? `Edit Article #${article.id}` : 'Create New Article'}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {article?.id && (
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="size-4 mr-2" /> Delete
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={isLoading}>
                        <Save className="size-4 mr-2" /> {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="p-4 bg-card border border-border rounded-lg">
                        <Label>Language</Label>
                        <div className="flex flex-col gap-2 mt-2">
                            {['en', 'pl', 'es', 'de', 'pt', 'ru'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setActiveLocale(lang)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md text-left transition-colors flex justify-between items-center ${activeLocale === lang
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-accent text-muted-foreground'
                                        }`}
                                >
                                    <span>{lang.toUpperCase()}</span>
                                    {formData.translations.some((t: any) => t.locale === lang && t.title) && <span className="text-[10px] opacity-70">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-card border border-border rounded-lg">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            className="w-full mt-2 p-2 rounded-md border border-input bg-background"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-3 space-y-6 bg-card border border-border p-6 rounded-lg">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold flex items-center">
                                <span className="uppercase bg-secondary px-2 py-0.5 rounded text-sm mr-2">{activeLocale}</span>
                                Content
                            </h2>
                            {!formData.translations.some((t: any) => t.locale === activeLocale) && (
                                <span className="text-sm text-muted-foreground">Start typing to create translation</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={activeTranslation.title || ''}
                                onChange={(e) => handleTranslationChange('title', e.target.value)}
                                placeholder="Article Title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (URL Part)</Label>
                            <Input
                                id="slug"
                                value={activeTranslation.slug || ''}
                                onChange={(e) => handleTranslationChange('slug', e.target.value)}
                                placeholder="article-url-slug"
                                className="font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-4 border p-4 rounded-lg bg-secondary/10">
                            <div className="space-y-2">
                                <Label htmlFor="cardImageUrl">Card Image (List View)</Label>
                                <ImageUploader
                                    value={activeTranslation.cardImageUrl || ''}
                                    onChange={(url) => handleTranslationChange('cardImageUrl', url)}
                                />
                                <p className="text-xs text-muted-foreground">Shown on the blog list page.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ogImageUrl">Cover Image (Detail View)</Label>
                                <ImageUploader
                                    value={activeTranslation.ogImageUrl || ''}
                                    onChange={(url) => handleTranslationChange('ogImageUrl', url)}
                                />
                                <p className="text-xs text-muted-foreground">Shown at the top of the article and for social sharing.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea
                                id="excerpt"
                                value={activeTranslation.excerpt || ''}
                                onChange={(e) => handleTranslationChange('excerpt', e.target.value)}
                                rows={3}
                                placeholder="Short summary for lists..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <RichTextEditor
                                value={activeTranslation.contentHtml || ''}
                                onChange={(html) => handleTranslationChange('contentHtml', html)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                            <div className="space-y-2">
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input
                                    id="metaTitle"
                                    value={activeTranslation.metaTitle || ''}
                                    onChange={(e) => handleTranslationChange('metaTitle', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Input
                                    id="metaDescription"
                                    value={activeTranslation.metaDescription || ''}
                                    onChange={(e) => handleTranslationChange('metaDescription', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
