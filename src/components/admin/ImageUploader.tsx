'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
    value: string
    onChange: (url: string) => void
    className?: string
}

export function ImageUploader({ value, onChange, className = '' }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [preview, setPreview] = useState(value)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            setPreview(data.url)
            onChange(data.url)
        } catch (error) {
            console.error(error)
            toast.error('Failed to upload image')
        } finally {
            setIsUploading(false)
        }
    }

    const handleClear = () => {
        setPreview('')
        onChange('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>Uploading...</>
                    ) : (
                        <><Upload className="size-4 mr-2" /> Upload Image</>
                    )}
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleFileChange}
                />
                <span className="text-sm text-muted-foreground">OR enter URL:</span>
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        setPreview(e.target.value)
                        onChange(e.target.value)
                    }}
                    placeholder="https://..."
                    className="flex-1"
                />
            </div>

            {preview && (
                <div className="relative w-full aspect-video md:w-80 rounded-lg overflow-hidden border border-border bg-secondary/20">
                    {/* Use Next.js Image if it's a relative path (our upload) or simple img for external URLs to avoid config issues */}
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        type="button"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}

            {!preview && (
                <div className="w-full aspect-video md:w-80 rounded-lg border border-dashed border-border flex items-center justify-center bg-secondary/10 text-muted-foreground">
                    <div className="flex flex-col items-center">
                        <ImageIcon className="size-8 mb-2 opacity-50" />
                        <span className="text-xs">No image selected</span>
                    </div>
                </div>
            )}
        </div>
    )
}
