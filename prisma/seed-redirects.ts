
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const redirects = [
    // Core Pages
    { source: '/srv-ai', target: '/services/ai' },
    { source: '/srv-fintech', target: '/services/fintech' },
    { source: '/portfolio', target: '/portfolio' },
    { source: '/contact', target: '/contact' },

    // Blog / content
    { source: '/blog', target: '/blog' },
    { source: '/blog/ai', target: '/blog' }, // Simplified mapping
    { source: '/blog/fintech', target: '/blog' }, // Simplified mapping
    { source: '/blog/other', target: '/blog' }, // Simplified mapping

    // Specific Blog Posts (Mapped to /blog for now if new slugs unknown, or specific if we had them)
    // Logic: Map to search or just root blog if specific matches unlikely
    { source: '/blog/post/alcosi-group-developed-cloud-based-open-source-management-platform', target: '/blog' },
    { source: '/blog/post/unlock-power-facial-recognition-your-business', target: '/blog' },
    { source: '/blog/post/hidden-benefits-digital-wallets', target: '/blog' },
    { source: '/blog/post/iso-20022-harmonizing-financial-data-exchange-worldwide', target: '/blog' },
    { source: '/blog/post/loyalty-program-development-financial-and-banking-organization', target: '/blog' },
    { source: '/blog/post/qr-payment-e-invoicing-service', target: '/blog' },

    // Specific Portfolio Items (Best effort mapping to Portfolio root or filtered)
    { source: '/portfolio/ai/Face_&_form_recognizer', target: '/portfolio' },
    { source: '/portfolio/ai/loyalty_service_based_of_face_recognition', target: '/portfolio' },
    { source: '/portfolio/fintech/qr-payment_e-invoicing_service', target: '/portfolio' },
    { source: '/portfolio/fintech/trust_management_software', target: '/portfolio' },
    { source: '/portfolio/blockchain/web2_&_web3_e-store', target: '/portfolio' },

    // Docs
    { source: '/Privacy_Policy.pdf', target: '/privacy-policy' },
]

async function main() {
    console.log('Start seeding redirects...')

    for (const r of redirects) {
        // Normalize source (remove generic domain prefix if present)
        const normalizedSource = r.source.startsWith('https://alcosi.com')
            ? r.source.replace('https://alcosi.com', '')
            : r.source

        await prisma.redirect.upsert({
            where: { source: normalizedSource },
            update: {
                target: r.target,
                code: 301,
                isActive: true
            },
            create: {
                source: normalizedSource,
                target: r.target,
                code: 301,
                isActive: true
            },
        })
    }

    console.log('Seeding redirects finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
