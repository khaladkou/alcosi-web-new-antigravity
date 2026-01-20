import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

const SETTING_KEYS = ['contact_email', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass']

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, subject, message } = body

        // 1. Get Configured Settings
        const settingsRaw = await prisma.globalSetting.findMany({
            where: { key: { in: SETTING_KEYS } }
        })
        const settings = settingsRaw.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>)

        const receiverEmail = settings.contact_email || 'no-reply@example.com'

        // 2. Check for SMTP Config
        if (settings.smtp_host && settings.smtp_port && settings.smtp_user && settings.smtp_pass) {
            const transporter = nodemailer.createTransport({
                host: settings.smtp_host,
                port: parseInt(settings.smtp_port),
                secure: parseInt(settings.smtp_port) === 465, // true for 465, false for other ports
                auth: {
                    user: settings.smtp_user,
                    pass: settings.smtp_pass,
                },
            })

            await transporter.sendMail({
                from: `"${name}" <${settings.smtp_user}>`, // Use SMTP user as sender to avoid spoofing rejections
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

            // Log Success
            await prisma.contactSubmission.create({
                data: {
                    name,
                    email,
                    message: `Subject: ${subject}\n\n${message}`,
                    status: 'success',
                    source: 'contact-form'
                }
            })

        } else {
            // Fallback Simulation
            console.log('--- SMAILY SIMULATION (Missing SMTP Config) ---')
            console.log(`To: ${receiverEmail}`)
            console.log(`Subject: ${subject}`)

            // Log Success (Simulation)
            await prisma.contactSubmission.create({
                data: {
                    name,
                    email,
                    message: `Subject: ${subject}\n\n${message}`,
                    status: 'success',
                    error: 'Simulated (SMTP not configured)',
                    source: 'contact-form'
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Contact Form Error:', error)

        // Attempt to log failure if we parsed the body

        // We can't easily access variables if error happened before line 10, but usually it happens during sendMail (line 32)
        // If error happens, we try to log what we can.

        // Re-parsing or using closed over variables depends on where error occurred.
        // Simplified approach: If we reached line 10, we have data.

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
