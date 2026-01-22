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
import { deleteProjectsAction } from '@/app/actions/projects'
import { getAdminPath } from '@/lib/admin-config'
import { Badge } from '@/components/ui/badge'

type Project = {
    id: number
    status: string
    imageUrl: string | null
    createdAt: Date
    translations: {
        id: number
        locale: string
        title: string
        slug: string
        category: string
    }[]
}

export default function ProjectsTable({ projects }: { projects: Project[] }) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const adminPath = getAdminPath()

    // Selection Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(projects.map(p => p.id))
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
        const res = await deleteProjectsAction(selectedIds)
        setIsDeleting(false)

        if (res.success) {
            toast.success(res.message)
            setSelectedIds([]) // Clear selection
            router.refresh()
        } else {
            toast.error(res.message)
        }
    }

    const allSelected = projects.length > 0 && selectedIds.length === projects.length

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
                                    This action cannot be undone. This will permanently delete {selectedIds.length} project(s) and their translations.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => {
                                    e.preventDefault()
                                    handleDelete()
                                }} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm">
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
                            <th className="p-4 font-medium">Image</th>
                            <th className="p-4 font-medium">Title (EN)</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Languages</th>
                            <th className="p-4 font-medium">Created</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(project => {
                            const enTranslation = project.translations.find(t => t.locale === 'en')
                            // Fallback to first translation if EN missing
                            const mainTranslation = enTranslation || project.translations[0]
                            const isSelected = selectedIds.includes(project.id)

                            return (
                                <tr
                                    key={project.id}
                                    className={`border-b border-border last:border-0 hover:bg-secondary/20 transition-colors ${isSelected ? 'bg-secondary/30' : ''}`}
                                >
                                    <td className="p-4">
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectOne(project.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="size-10 rounded bg-secondary/30 overflow-hidden relative">
                                            {project.imageUrl && (
                                                <img
                                                    src={project.imageUrl}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium">
                                        {mainTranslation?.title || <span className="text-muted-foreground italic">No Title</span>}
                                        {mainTranslation?.slug && (
                                            <div className="text-xs text-muted-foreground font-mono mt-0.5">/{mainTranslation.slug}</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {mainTranslation?.category && (
                                            <Badge variant="outline">{mainTranslation.category}</Badge>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                                            {project.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 flex gap-1 flex-wrap max-w-[150px]">
                                        {project.translations.map(t => (
                                            <span key={t.id} className="uppercase text-[10px] bg-secondary text-foreground px-1 py-0.5 rounded border border-border">
                                                {t.locale}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`${adminPath}/projects/${project.id}`}>
                                                <Edit className="size-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {projects.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No projects found.
                    </div>
                )}
            </div>
        </div>
    )
}
