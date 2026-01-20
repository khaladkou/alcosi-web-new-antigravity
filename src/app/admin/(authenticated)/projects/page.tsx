'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'

interface Project {
    id: number
    title: string
    slug: string
    status: string
    locale: string
    category: string
    createdAt: string
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/admin/projects')
            const data = await res.json()
            setProjects(data)
        } catch (error) {
            console.error('Failed to fetch projects', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return

        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchProjects()
            }
        } catch (error) {
            console.error('Failed to delete project', error)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Portfolio Projects</h1>
                <Button asChild>
                    <Link href="/admin/projects/new">
                        <Plus className="mr-2 size-4" /> Add Project
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell>{project.id}</TableCell>
                                    <TableCell className="font-medium">
                                        {project.title}
                                        <div className="text-xs text-muted-foreground">/{project.slug}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{project.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/projects/${project.id}`}>
                                                <Edit className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(project.id)}>
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {projects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No projects found. Create your first one!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
