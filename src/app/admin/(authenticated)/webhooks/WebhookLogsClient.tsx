'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { WebhookLog } from '@prisma/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Copy, Check, Eye } from 'lucide-react'
import { toast } from 'sonner'

type WebhookLogsClientProps = {
    logs: WebhookLog[]
    totalCount: number
    pageSize: number
}

export default function WebhookLogsClient({ logs, totalCount, pageSize }: WebhookLogsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const page = Number(searchParams.get('page')) || 1
    const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null)
    const [copied, setCopied] = useState(false)

    const totalPages = Math.ceil(totalCount / pageSize)

    const updatePage = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(newPage))
        router.push(`?${params.toString()}`)
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success("Payload copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Time</TableHead>
                            <TableHead className="w-[120px]">Provider</TableHead>
                            <TableHead className="w-[120px]">Method</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead>Error / Summary</TableHead>
                            <TableHead className="w-[80px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-muted-foreground whitespace-nowrap font-mono text-xs">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{log.provider}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">{log.method}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={log.status >= 200 && log.status < 300 ? 'default' : 'destructive'}>
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate text-sm" title={log.error || ''}>
                                        {log.error ? (
                                            <span className="text-red-500 font-medium">{log.error}</span>
                                        ) : (
                                            <span className="text-muted-foreground italic">Success</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="icon" variant="ghost" onClick={() => setSelectedLog(log)}>
                                            <Eye className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages || 1} ({totalCount} items)
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePage(page - 1)}
                        disabled={page <= 1}
                    >
                        <ChevronLeft className="size-4 mr-1" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePage(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next <ChevronRight className="size-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Webhook Details
                            {selectedLog && (
                                <Badge variant={selectedLog.status >= 200 && selectedLog.status < 300 ? 'default' : 'destructive'}>
                                    Status: {selectedLog.status}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedLog && new Date(selectedLog.createdAt).toLocaleString()} — {selectedLog?.url}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto bg-slate-950 p-4 rounded-md relative text-slate-50 font-mono text-xs space-y-4">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 text-slate-400 hover:text-white"
                            onClick={() => selectedLog && handleCopy(JSON.stringify(selectedLog.payload, null, 2))}
                        >
                            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </Button>

                        <div>
                            <h4 className="text-slate-400 font-bold mb-1 uppercase text-[10px] tracking-wider">Payload</h4>
                            <pre className="whitespace-pre-wrap text-green-400">
                                {selectedLog ? JSON.stringify(selectedLog.payload, null, 2) : ''}
                            </pre>
                        </div>

                        {selectedLog?.response && (
                            <div className="border-t border-slate-800 pt-4">
                                <h4 className="text-slate-400 font-bold mb-1 uppercase text-[10px] tracking-wider">Response</h4>
                                <pre className="whitespace-pre-wrap text-blue-300">
                                    {JSON.stringify(selectedLog.response, null, 2)}
                                </pre>
                            </div>
                        )}

                        {selectedLog?.error && (
                            <div className="border-t border-slate-800 pt-4">
                                <h4 className="text-slate-400 font-bold mb-1 uppercase text-[10px] tracking-wider">Error</h4>
                                <pre className="whitespace-pre-wrap text-red-400">
                                    {selectedLog.error}
                                </pre>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
