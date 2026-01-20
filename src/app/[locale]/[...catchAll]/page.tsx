import { prisma } from '@/lib/db'
import { notFound, permanentRedirect } from 'next/navigation'

export default async function CatchAllPage({ params }: { params: Promise<{ catchAll: string[] }> }) {
    const { catchAll } = await params

    // Reconstruct path from segments
    const path = '/' + catchAll.join('/')

    // Possible legacy paths to check
    // 1. Exact match
    // 2. With /alcosi prefix (since middleware strips it, but DB might have it)

    const possiblePaths = [path, `/alcosi${path}`]

    const alias = await prisma.urlAlias.findFirst({
        where: {
            fromPath: {
                in: possiblePaths,
                mode: 'insensitive' // Legacy URLs might be case-insensitive
            }
        }
    })

    if (alias) {
        // Found a redirect
        permanentRedirect(alias.toPath)
    }

    // Not found -> 404
    notFound()
}
