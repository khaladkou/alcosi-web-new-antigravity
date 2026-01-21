'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, LayoutDashboard, Globe, AlertCircle, Loader2 } from 'lucide-react'
import type { SeoAnalysisResult } from '@/lib/seo-scanner'

export default function SeoAuditPage() {
    const [urls, setUrls] = useState<string[]>([])
    const [results, setResults] = useState<Record<string, SeoAnalysisResult>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentUrl, setCurrentUrl] = useState<string | null>(null)

    const fetchUrls = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/seo-audit')
            if (res.ok) {
                const data = await res.json()
                setUrls(data.urls)
            }
        } catch (e) {
            console.error('Failed to fetch URLs', e)
        } finally {
            setIsLoading(false)
        }
    }

    const startAudit = async () => {
        if (urls.length === 0) await fetchUrls()

        // Use a local copy or refetch if empty, but assuming urls populated:
        // Re-fetch to be safe if start pressed immediately
        let targets = urls
        if (targets.length === 0) {
            const res = await fetch('/api/admin/seo-audit')
            const data = await res.json()
            targets = data.urls
            setUrls(targets)
        }

        setIsLoading(true)
        setResults({})
        setProgress(0)

        let completed = 0
        for (const url of targets) {
            setCurrentUrl(url)
            try {
                const res = await fetch('/api/admin/seo-audit', {
                    method: 'POST',
                    body: JSON.stringify({ url }),
                    headers: { 'Content-Type': 'application/json' }
                })
                const data = await res.json()
                setResults(prev => ({ ...prev, [url]: data }))
            } catch (e) {
                console.error(`Failed to scan ${url}`, e)
            } finally {
                completed++
                setProgress(Math.round((completed / targets.length) * 100))
            }
        }
        setIsLoading(false)
        setCurrentUrl(null)
    }

    useEffect(() => {
        fetchUrls()
    }, [])

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-heading mb-2">Super SEO Audit</h1>
                    <p className="text-muted-foreground">
                        Automatically scan all pages for Schema.org, canonical tags, hreflang, and more.
                    </p>
                </div>
                <Button onClick={startAudit} disabled={isLoading} size="lg">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" /> Scanning... {progress}%
                        </>
                    ) : (
                        <>
                            <LayoutDashboard className="mr-2 size-4" /> Start Full Audit
                        </>
                    )}
                </Button>
            </div>

            {isLoading && (
                <div className="mb-8">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Scanning: {currentUrl}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">URL</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Title/Desc</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Canonical</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Hreflang</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Schema</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">OG</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Load (ms)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {urls.map(url => {
                                const result = results[url]
                                if (!result) {
                                    return (
                                        <tr key={url} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[300px] truncate" title={url}>
                                                {url.replace(process.env.NEXT_PUBLIC_BASE_URL || '', '')}
                                            </td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">-</td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">-</td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">-</td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">-</td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">-</td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">-</td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">-</td>
                                        </tr>
                                    )
                                }

                                return (
                                    <tr key={url} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs max-w-[300px] truncate" title={url}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary flex items-center gap-1">
                                                {url.replace(process.env.NEXT_PUBLIC_BASE_URL || '', '')}
                                                <Globe className="size-3 opacity-50" />
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={result.statusCode === 200 ? 'default' : 'destructive'} className="text-[10px]">
                                                {result.statusCode}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <StatusIcon valid={result.title.valid} />
                                                <StatusIcon valid={result.description.valid} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusIcon valid={result.canonical.valid} tooltip={result.canonical.message} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusIcon valid={result.hreflang.valid} tooltip={result.hreflang.message} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusIcon valid={result.schemaOrg.valid} tooltip={result.schemaOrg.message} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusIcon valid={result.openGraph.valid} tooltip={result.openGraph.message} />
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-xs">
                                            <span className={result.loadTime > 500 ? 'text-destructive' : 'text-green-500'}>
                                                {result.loadTime}ms
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function StatusIcon({ valid, tooltip }: { valid: boolean, tooltip?: string }) {
    return (
        <div title={tooltip} className="cursor-help">
            {valid ? (
                <CheckCircle2 className="size-5 text-green-500" />
            ) : (
                <XCircle className="size-5 text-destructive" />
            )}
        </div>
    )
}
