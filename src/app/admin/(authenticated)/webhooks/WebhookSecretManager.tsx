'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CopyButton } from '@/components/common/CopyButton'
import { Loader2, RefreshCw, Pencil, Check, X } from 'lucide-react'
import { regenerateWebhookSecret, updateWebhookSecret } from '@/app/actions/settings'
import { toast } from 'sonner'
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

export default function WebhookSecretManager({ initialSecret }: { initialSecret: string }) {
    const [secret, setSecret] = useState(initialSecret)
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(initialSecret)

    const handleRegenerate = () => {
        setIsOpen(false)
        setIsEditing(false)
        startTransition(async () => {
            const res = await regenerateWebhookSecret()
            if (res.success && res.secret) {
                setSecret(res.secret)
                setEditValue(res.secret)
                toast.success('Secret key regenerated')
            } else {
                toast.error('Failed to regenerate key')
            }
        })
    }

    const handleStartEdit = () => {
        setEditValue(secret)
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditValue(secret)
    }

    const handleSaveEdit = () => {
        if (!editValue.trim()) {
            toast.error('Secret cannot be empty')
            return
        }
        startTransition(async () => {
            const res = await updateWebhookSecret(editValue)
            if (res.success) {
                setSecret(editValue)
                setIsEditing(false)
                toast.success('Secret updated')
            } else {
                toast.error(res.message || 'Failed to update secret')
            }
        })
    }

    return (
        <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">Secret Key</label>
            <div className="relative group flex gap-2">
                <div className="relative grow">
                    {isEditing ? (
                        <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="font-mono text-sm text-blue-400"
                            disabled={isPending}
                        />
                    ) : (
                        <>
                            <code className="block w-full p-3 pr-10 bg-secondary rounded-md font-mono text-sm break-all text-blue-400">
                                {secret}
                            </code>
                            <CopyButton
                                text={secret}
                                className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm"
                            />
                        </>
                    )}
                </div>

                {isEditing ? (
                    <>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSaveEdit}
                            disabled={isPending}
                            title="Save"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCancelEdit}
                            disabled={isPending}
                            title="Cancel"
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <X className="size-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleStartEdit}
                            disabled={isPending}
                            title="Edit Secret"
                        >
                            <Pencil className="size-4" />
                        </Button>

                        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={isPending}
                                    title="Regenerate Secret"
                                >
                                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Regenerate Webhook Secret?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. The old secret key will stop working immediately, breaking any existing integrations that use it.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRegenerate} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                        Regenerate Key
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}

            </div>
            <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <p>This key is stored in the <b>Database</b>.</p>
                <p>Use it in the <code>x-webhook-secret</code> header or externally configured signature verification.</p>
            </div>
        </div>
    )
}
