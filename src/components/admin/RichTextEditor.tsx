'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    Bold, Italic, List, ListOrdered, Quote,
    Undo, Redo, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react'
import { useCallback } from 'react'

interface RichTextEditorProps {
    value: string
    onChange: (html: string) => void
    className?: string
}

export function RichTextEditor({ value, onChange, className = '' }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            ImageExtension.configure({
                HTMLAttributes: {
                    class: 'rounded-xl w-full my-8 shadow-sm',
                },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm dark:prose-invert max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    const addImage = useCallback(() => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0]
                const formData = new FormData()
                formData.append('file', file)

                // Optimistic upload (could show loading state here)
                try {
                    const res = await fetch('/api/admin/upload', {
                        method: 'POST',
                        body: formData
                    })
                    const data = await res.json()

                    if (data.url) {
                        editor?.chain().focus().setImage({ src: data.url }).run()
                    }
                } catch (e) {
                    toast.error('Failed to upload image')
                }
            }
        }
        input.click()
    }, [editor])

    if (!editor) {
        return null
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex flex-wrap gap-1 p-1 bg-secondary/30 border border-border rounded-lg">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-secondary' : ''}
                    type="button"
                >
                    <Bold className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-secondary' : ''}
                    type="button"
                >
                    <Italic className="size-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1 my-auto" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''}
                    type="button"
                >
                    H2
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editor.isActive('heading', { level: 3 }) ? 'bg-secondary' : ''}
                    type="button"
                >
                    H3
                </Button>

                <div className="w-px h-6 bg-border mx-1 my-auto" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-secondary' : ''}
                    type="button"
                >
                    <List className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-secondary' : ''}
                    type="button"
                >
                    <ListOrdered className="size-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1 my-auto" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={addImage}
                    type="button"
                    className="gap-2"
                >
                    <ImageIcon className="size-4" /> <span className="text-xs">Image</span>
                </Button>

                <div className="flex-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    type="button"
                >
                    <Undo className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    type="button"
                >
                    <Redo className="size-4" />
                </Button>
            </div>

            <EditorContent editor={editor} />
        </div>
    )
}
