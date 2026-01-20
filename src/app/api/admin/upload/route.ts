import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Limit file size to 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
    // Auth Check
    const token = request.cookies.get('admin_token')
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' }, { status: 400 })
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size too large. Max 5MB.' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // Organize by Year/Month
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', String(year), month)
        await mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const ext = path.extname(file.name)
        const filename = `${uuidv4()}${ext}`
        const filePath = path.join(uploadDir, filename)

        // Write file
        await writeFile(filePath, buffer)

        // Return public URL
        const publicUrl = `/uploads/${year}/${month}/${filename}`

        return NextResponse.json({ url: publicUrl })

    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
