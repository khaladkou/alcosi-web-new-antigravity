'use client'

import { useState } from 'react'
import { ContactSubmission } from '@prisma/client'
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Trash2, MailOpen, Mail } from 'lucide-react'
import { markAsRead, deleteSubmission } from '@/app/actions/inbox'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type InboxClientProps = {
    initialSubmissions: ContactSubmission[]
}

export default function InboxClient({ initialSubmissions }: InboxClientProps) {
    const [selected, setSelected] = useState<ContactSubmission | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

    const handleView = async (submission: ContactSubmission) => {
        setSelected(submission)
        if (!submission.isRead) {
            await markAsRead(submission.id)
            router.refresh()
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return
        const res = await deleteSubmission(deletingId)
        if (res.success) {
            toast.success('Submission deleted')
            setDeletingId(null)
            if (selected?.id === deletingId) setSelected(null)
            router.refresh()
        } else {
            toast.error('Failed to delete')
        }
    }

    const handleMarkRead = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        await markAsRead(id)
        toast.success('Marked as read')
        router.refresh()
    }

    return (
        <>
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[180px]">Date</TableHead>
                            <TableHead className="w-[200px]">Name</TableHead>
                            <TableHead className="w-[250px]">Email</TableHead>
                            <TableHead>Message Summary</TableHead>
                            <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialSubmissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No messages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialSubmissions.map(item => (
                                <TableRow
                                    key={item.id}
                                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${!item.isRead ? 'bg-secondary/30 font-medium' : ''}`}
                                    onClick={() => handleView(item)}
                                >
                                    <TableCell>
                                        {!item.isRead && (
                                            <div className="size-2 rounded-full bg-blue-500 mx-auto" title="Unread" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.email}</TableCell>
                                    <TableCell className="max-w-md truncate text-muted-foreground">
                                        {item.message}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {!item.isRead && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8 text-blue-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                                    onClick={(e) => handleMarkRead(e, item.id)}
                                                    title="Mark as Read"
                                                >
                                                    <MailOpen className="size-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-8 text-destructive hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDeletingId(item.id)
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* View Modal */}
            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Message from {selected?.name}
                            <Badge variant="outline" className="font-normal text-muted-foreground ml-auto">
                                {selected && new Date(selected.createdAt).toLocaleString()}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            {selected?.email}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 p-4 bg-secondary/50 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                        {selected?.message}
                    </div>

                    <div className="mt-4 flex justify-end gap-2 text-xs text-muted-foreground">
                        <span>ID: {selected?.id}</span>
                        <span>•</span>
                        <span>Source: {selected?.source || 'Unknown'}</span>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the message from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
