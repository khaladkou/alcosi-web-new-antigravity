import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { decrypt } from '@/lib/crypto'

const contactSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email'),
    subject: z.string().min(3, 'Subject is too short'),
    message: z.string().min(10, 'Message is too short'),
})

const SETTING_KEYS = ['contact_email', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass']

export async function POST(request: NextRequest) {
    try {
        // 0. Rate Limiting (Raw SQL to bypass Prisma Client cache issues)
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
        const RATE_LIMIT_MAX = 50

        const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW)

        console.log('[API/Contact] Starting request processing', { ip })

        // Raw query for count. Table: contact_submissions, Column: ip, created_at
        const countResult: any = await prisma.$queryRaw`
            SELECT COUNT(*)::int as count 
            FROM "contact_submissions" 
            WHERE ip = ${ip} 
            AND created_at > ${windowStart}
        `

        const recentSubmissions = countResult[0]?.count || 0

        if (recentSubmissions >= RATE_LIMIT_MAX) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
        }

        const json = await request.json()
        const result = contactSchema.safeParse(json)

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 })
        }

        const { name, email, subject, message } = result.data

        // 1. Get Configured Settings
        const settingsRaw = await prisma.globalSetting.findMany({
            where: { key: { in: SETTING_KEYS } }
        })
        const settings = settingsRaw.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>)

        const receiverEmail = settings.contact_email || 'no-reply@example.com'

        let submissionId = ''

        // 2. Check for SMTP Config
        if (settings.smtp_host && settings.smtp_port && settings.smtp_user && settings.smtp_pass) {
            // Decrypt password
            const decryptedPass = decrypt(settings.smtp_pass)

            const transporter = nodemailer.createTransport({
                host: settings.smtp_host,
                port: parseInt(settings.smtp_port),
                secure: parseInt(settings.smtp_port) === 465,
                auth: {
                    user: settings.smtp_user,
                    pass: decryptedPass,
                },
            })

            await transporter.sendMail({
                from: `"${name}" <${settings.smtp_user}>`,
                to: receiverEmail,
                replyTo: email,
                subject: `Contact Form: ${subject}`,
                text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                html: `
                    <h3>New Contact Form Submission</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <br/>
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br/>')}</p>
                `,
            })

            console.log('--- EMAIL SENT VIA SMTP ---')

            // Log Success - Create first without IP to avoid Type Error
            const submission = await prisma.contactSubmission.create({
                data: {
                    name,
                    email,
                    message: `Subject: ${subject}\n\n${message}`,
                    status: 'success',
                    source: 'contact-form'
                    // ip: ip // Omitted to avoid Prisma Client validation error
                }
            })
            submissionId = submission.id

        } else {
            // Fallback Simulation
            console.log('--- SMAILY SIMULATION (Missing SMTP Config) ---')
            console.log(`To: ${receiverEmail}`)
            console.log(`Subject: ${subject}`)

            // Log Success (Simulation)
            const submission = await prisma.contactSubmission.create({
                data: {
                    name,
                    email,
                    message: `Subject: ${subject}\n\n${message}`,
                    status: 'success',
                    error: 'Simulated (SMTP not configured)',
                    source: 'contact-form'
                }
            })
            submissionId = submission.id
        }

        // 3. Save IP using Raw SQL (Update)
        if (submissionId && ip) {
            await prisma.$executeRaw`
                UPDATE "contact_submissions" 
                SET ip = ${ip} 
                WHERE id = ${submissionId}
             `
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Contact Form Error (Detailed):', {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            name: error.name
        })
        // Temporary: expose error for debugging, revert to generic later
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
