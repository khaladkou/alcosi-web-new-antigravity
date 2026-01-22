'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Edit, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteArticlesAction } from '@/app/actions/articles'
import { getAdminPath } from '@/lib/admin-config'

type Article = {
    id: number
    status: string
    updatedAt: Date
    translations: {
        id: number
        locale: string
        title: string
    }[]
}

export default function ArticlesTable({ articles }: { articles: Article[] }) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const adminPath = getAdminPath()

    // Selection Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(articles.map(a => a.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id])
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id))
        }
    }

    // Delete Handler
    const handleDelete = async () => {
        if (selectedIds.length === 0) return

        setIsDeleting(true)
        const res = await deleteArticlesAction(selectedIds)
        setIsDeleting(false)

        if (res.success) {
            toast.success(res.message)
            setSelectedIds([]) // Clear selection
            router.refresh()
        } else {
            toast.error(res.message)
        }
    }

    const allSelected = articles.length > 0 && selectedIds.length === articles.length
    const indeterminate = selectedIds.length > 0 && selectedIds.length < articles.length

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between h-10">
                <div className="text-sm text-muted-foreground">
                    {selectedIds.length} selected
                </div>
                {selectedIds.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
                                Delete Selected ({selectedIds.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete {selectedIds.length} article(s) and their translations.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => {
                                    e.preventDefault() // Prevent auto-close to show loading state if needed, though we just call handler
                                    handleDelete()
                                }} className="bg-destructive hover:bg-destructive/90">
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                            <th className="p-4 w-[50px]">
                                <Checkbox
                                    checked={allSelected}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="p-4 font-medium">ID</th>
                            <th className="p-4 font-medium">Title (EN)</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Languages</th>
                            <th className="p-4 font-medium">Last Updated</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map(article => {
                            const enTranslation = article.translations.find(t => t.locale === 'en')
                            const isSelected = selectedIds.includes(article.id)

                            return (
                                <tr
                                    key={article.id}
                                    className={`border-b border-border last:border-0 hover:bg-secondary/20 transition-colors ${isSelected ? 'bg-secondary/30' : ''}`}
                                >
                                    <td className="p-4">
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectOne(article.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="p-4 font-mono text-sm text-muted-foreground">#{article.id}</td>
                                    <td className="p-4 font-medium">
                                        {enTranslation?.title || <span className="text-muted-foreground italic">No English Title</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${article.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                                            }`}>
                                            {article.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-1">
                                        {article.translations.map(t => (
                                            <span key={t.id} className="uppercase text-xs bg-secondary text-foreground px-1.5 py-0.5 rounded border border-border">
                                                {t.locale}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {new Date(article.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`${adminPath}/articles/${article.id}`}>
                                                <Edit className="size-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {articles.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No articles found.
                    </div>
                )}
            </div>
        </div>
    )
}
