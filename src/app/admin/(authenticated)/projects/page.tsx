import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import ProjectsTable from './ProjectsTable'
import { getAdminPath } from '@/lib/admin-config'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
    const adminPath = getAdminPath()

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            translations: {
                select: {
                    id: true,
                    locale: true,
                    title: true,
                    slug: true,
                    category: true
                }
            }
        }
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Portfolio Projects</h1>
                <Button asChild>
                    <Link href={`${adminPath}/projects/new`}>
                        <Plus className="mr-2 size-4" /> Add Project
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectsTable projects={projects} />
                </CardContent>
            </Card>
        </div>
    )
}

