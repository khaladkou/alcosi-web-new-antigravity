'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { EventLog } from './types' // We'll define types in a separate file or inline

type EventsClientProps = {
    events: EventLog[]
    totalCount: number
    pageSize: number
}

export default function EventsClient({ events, totalCount, pageSize }: EventsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // URL State
    const page = Number(searchParams.get('page')) || 1
    const type = searchParams.get('type') || 'ALL'
    const status = searchParams.get('status') || 'ALL'

    // Local State
    const [selectedEvent, setSelectedEvent] = useState<EventLog | null>(null)
    const [copied, setCopied] = useState(false)

    // Handlers
    const updateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'ALL') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        // Reset page on filter change
        if (key !== 'page') {
            params.set('page', '1')
        }
        router.push(`?${params.toString()}`)
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success("Payload copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    const totalPages = Math.ceil(totalCount / pageSize)

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="min-w-[120px] justify-between">
                            Type: {type}
                            <ChevronDown className="ml-2 size-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => updateParams('type', 'ALL')}>ALL</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateParams('type', 'SEO_AUDIT')}>SEO Audit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateParams('type', 'WEBHOOK')}>Webhook</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateParams('type', 'CONTACT')}>Contact</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="min-w-[120px] justify-between">
                            Status: {status}
                            <ChevronDown className="ml-2 size-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => updateParams('status', 'ALL')}>ALL</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateParams('status', 'SUCCESS')}>Success</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateParams('status', 'FAILED')}>Failed</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Date</TableHead>
                            <TableHead className="w-[100px]">Type</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead className="w-[80px] text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No events found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.map((event) => (
                                <TableRow key={`${event.type}-${event.id}`}>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">
                                        {event.date.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            event.type === 'WEBHOOK' ? 'border-blue-500 text-blue-500' :
                                                event.type === 'SEO_AUDIT' ? 'border-indigo-500 text-indigo-500' :
                                                    'border-purple-500 text-purple-500'
                                        }>
                                            {event.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={event.status === 'SUCCESS' ? 'default' : 'destructive'}
                                            className={event.status === 'SUCCESS' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                            {event.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium max-w-md truncate">
                                        {event.summary}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" onClick={() => setSelectedEvent(event)}>
                                            View
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
                        onClick={() => updateParams('page', String(page - 1))}
                        disabled={page <= 1}
                    >
                        <ChevronLeft className="size-4 mr-1" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateParams('page', String(page + 1))}
                        disabled={page >= totalPages}
                    >
                        Next <ChevronRight className="size-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedEvent?.type} Details
                            {selectedEvent && (
                                <Badge variant={selectedEvent.status === 'SUCCESS' ? 'default' : 'destructive'}>
                                    {selectedEvent.status}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedEvent?.date.toLocaleString()} — {selectedEvent?.summary}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto bg-slate-950 p-4 rounded-md relative text-slate-50 font-mono text-xs">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 text-slate-400 hover:text-white"
                            onClick={() => selectedEvent && handleCopy(JSON.stringify(selectedEvent.details, null, 2))}
                        >
                            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </Button>
                        <pre className="whitespace-pre-wrap">
                            {selectedEvent ? JSON.stringify(selectedEvent.details, null, 2) : ''}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
