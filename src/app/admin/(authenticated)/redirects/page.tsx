'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Pencil, Trash2, Search, Shuffle } from 'lucide-react'
// Removed invalid Dialog imports, using custom overlay instead

// Imports removed

// FALLBACK: using standard HTML elements styled with Tailwind for inputs/selects to avoid "module not found" errors for components I didn't verify.

interface Redirect {
    id: number
    source: string
    target: string
    code: number
    isActive: boolean
    createdAt: string
}

export default function RedirectsPage() {
    const [redirects, setRedirects] = useState<Redirect[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Edit/Create State
    const [isEditing, setIsEditing] = useState(false)
    const [currentItem, setCurrentItem] = useState<Partial<Redirect>>({ code: 301, isActive: true })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchRedirects()
    }, [])

    const fetchRedirects = async () => {
        try {
            const res = await fetch('/api/admin/redirects')
            const data = await res.json()
            setRedirects(data)
        } catch (error) {
            console.error('Failed to fetch', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const url = currentItem.id ? `/api/admin/redirects/${currentItem.id}` : '/api/admin/redirects'
            const method = currentItem.id ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentItem)
            })

            if (!res.ok) {
                const err = await res.json()
                alert(err.error || 'Failed to save')
                return
            }

            await fetchRedirects()
            setIsEditing(false)
            setCurrentItem({ code: 301, isActive: true })
        } catch (error) {
            console.error(error)
            alert('Error saving redirect')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this redirect?')) return
        try {
            await fetch('/api/admin/redirects/' + id, { method: 'DELETE' })
            setRedirects(prev => prev.filter(r => r.id !== id))
        } catch (error) {
            console.error(error)
            alert('Failed to delete')
        }
    }

    const filtered = redirects.filter(r =>
        r.source.toLowerCase().includes(search.toLowerCase()) ||
        r.target.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-heading">URL Redirects</h1>
                    <p className="text-muted-foreground">Manage 301/302 redirects for SEO and legacy links.</p>
                </div>
                <Button onClick={() => { setCurrentItem({ code: 301, isActive: true }); setIsEditing(true) }}>
                    <Plus className="mr-2 size-4" /> Add New
                </Button>
            </div>

            {/* Editor Modal (Simple Overlay) */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                        <CardHeader>
                            <CardTitle>{currentItem.id ? 'Edit Redirect' : 'New Redirect'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Source Path (Old URL)</Label>
                                    <Input
                                        placeholder="/old-path"
                                        value={currentItem.source || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, source: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">Must start with /</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Path (New URL)</Label>
                                    <Input
                                        placeholder="/new-path"
                                        value={currentItem.target || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, target: e.target.value })}
                                        required
                                    />
                                </div>
// Removed missing component imports

                                // ... state ...

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>HTTP Code</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={currentItem.code}
                                            onChange={e => setCurrentItem({ ...currentItem, code: Number(e.target.value) })}
                                        >
                                            <option value={301}>301 (Permanent)</option>
                                            <option value={302}>302 (Temporary)</option>
                                            <option value={307}>307 (Temporary)</option>
                                            <option value={308}>308 (Permanent)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={currentItem.isActive ? 'active' : 'inactive'}
                                            onChange={e => setCurrentItem({ ...currentItem, isActive: e.target.value === 'active' })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Disabled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                                        Save
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                {/* ... header ... */}
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Source</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No redirects found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map(r => (
                                    <TableRow key={r.id} className={!r.isActive ? 'opacity-60' : ''}>
                                        <TableCell className="font-mono text-sm">{r.source}</TableCell>
                                        <TableCell><ArrowRight /></TableCell>
                                        <TableCell className="font-mono text-sm">{r.target}</TableCell>
                                        <TableCell><Badge variant="outline">{r.code}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant={r.isActive ? 'default' : 'secondary'}>
                                                {r.isActive ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => { setCurrentItem(r); setIsEditing(true) }}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    )
}

function ArrowRight() {
    return <Shuffle className="size-4 text-muted-foreground mx-auto" />
}
