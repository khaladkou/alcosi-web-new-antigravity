import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// === DATA ===

const redirects = [
    // Core Pages
    { source: '/srv-ai', target: '/services/ai' },
    { source: '/srv-fintech', target: '/services/fintech' },
    { source: '/portfolio', target: '/portfolio' },
    { source: '/contact', target: '/contact' },

    // Blog / content
    { source: '/blog', target: '/blog' },
    { source: '/blog/ai', target: '/blog' },
    { source: '/blog/fintech', target: '/blog' },
    { source: '/blog/other', target: '/blog' },

    // Specific Blog Posts
    { source: '/blog/post/alcosi-group-developed-cloud-based-open-source-management-platform', target: '/blog' },
    { source: '/blog/post/unlock-power-facial-recognition-your-business', target: '/blog' },
    { source: '/blog/post/hidden-benefits-digital-wallets', target: '/blog' },
    { source: '/blog/post/iso-20022-harmonizing-financial-data-exchange-worldwide', target: '/blog' },
    { source: '/blog/post/loyalty-program-development-financial-and-banking-organization', target: '/blog' },
    { source: '/blog/post/qr-payment-e-invoicing-service', target: '/blog' },

    // Specific Portfolio Items
    { source: '/portfolio/ai/Face_&_form_recognizer', target: '/portfolio' },
    { source: '/portfolio/ai/loyalty_service_based_of_face_recognition', target: '/portfolio' },
    { source: '/portfolio/fintech/qr-payment_e-invoicing_service', target: '/portfolio' },
    { source: '/portfolio/fintech/trust_management_software', target: '/portfolio' },
    { source: '/portfolio/blockchain/web2_&_web3_e-store', target: '/portfolio' },

    // Docs
    { source: '/Privacy_Policy.pdf', target: '/privacy-policy' },
]

const projects = [
    {
        title: "NeoBank Mobile App",
        category: "Fintech",
        description: "A next-generation banking application with AI-powered spending insights and biometric security.",
        imageUrl: "https://picsum.photos/seed/neobank/800/600",
        slug: "neobank-mobile-app",
        tags: ["Mobile App", "React Native", "Node.js"]
    },
    {
        title: "Supply Chain Tracker",
        category: "Blockchain",
        description: "Decentralized logistical tracking system ensuring transparency from manufacturer to end consumer.",
        imageUrl: "https://picsum.photos/seed/supplychain/800/600",
        slug: "supply-chain-tracker",
        tags: ["Solidity", "Ethereum", "Web3.js"]
    },
    {
        title: "AlgoTrading Bot",
        category: "AI",
        description: "High-frequency trading bot utilizing predictive machine learning models to analyze market trends.",
        imageUrl: "https://picsum.photos/seed/algotrading/800/600",
        slug: "algotrading-bot",
        tags: ["Python", "TensorFlow", "PostgreSQL"]
    },
    {
        title: "Crypto Exchange Platform",
        category: "Fintech",
        description: "White-label cryptocurrency exchange with high liquidity and institutional-grade security.",
        imageUrl: "https://picsum.photos/seed/cryptoexchange/800/600",
        slug: "crypto-exchange-platform",
        tags: ["Next.js", "Go", "Microservices"]
    },
    {
        title: "Identity Verification API",
        category: "AI",
        description: "KYC/AML solution using computer vision for document scanning and face matching.",
        imageUrl: "https://picsum.photos/seed/identity/800/600",
        slug: "identity-verification-api",
        tags: ["Computer Vision", "FastAPI", "Docker"]
    },
    {
        title: "NFT Marketplace",
        category: "Blockchain",
        description: "A curated marketplace for digital art and collectibles with low gas fees.",
        imageUrl: "https://picsum.photos/seed/nft/800/600",
        slug: "nft-marketplace",
        tags: ["Next.js", "Smart Contracts", "IPFS"]
    }
]

const richContent = `
    <p class="lead">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    
    <h2>Key Takeaways</h2>
    <ul>
        <li>Understanding the core principles of the technology.</li>
        <li>Analyzing the market impact and future trends.</li>
        <li>Exploring real-world use cases and success stories.</li>
    </ul>

    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

    <h2>Detailed Analysis</h2>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
    
    <div class="my-8">
        <img src="https://picsum.photos/seed/content-1/800/400" alt="Detailed Analysis Chart" class="rounded-xl w-full shadow-lg" />
        <p class="text-sm text-center text-muted-foreground mt-2">Figure 1: Market Analysis 2026</p>
    </div>

    <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
`

const sampleArticles = [
    {
        status: 'published',
        translations: [
            {
                locale: 'en',
                slug: 'ai-transforming-fintech',
                title: 'How AI is Transforming Fintech in 2026',
                excerpt: 'Artificial Intelligence is reshaping the financial landscape, from fraud detection to personalized banking.',
                content: `
                    <p class="lead">The integration of Artificial Intelligence (AI) in financial technology is no longer a trend—it is a necessity. As we move into 2026, financial institutions that fail to adapt risk obsolescence.</p>
                    <img src="https://picsum.photos/seed/fintech-ai/800/400" alt="AI in Fintech" class="rounded-xl w-full my-8 shadow-lg" />
                    <h2>Predictive Analytics and Personalization</h2>
                    <p>One of the most significant impacts of AI is in predictive analytics. By analyzing vast amounts of data, AI algorithms can predict customer behavior with unprecedented accuracy.</p>
                    <ul>
                        <li>Real-time fraud detection using machine learning models.</li>
                        <li>Hyper-personalized investment advice based on spending habits.</li>
                        <li>Automated customer service via advanced NLP chatbots.</li>
                    </ul>
                    <p>This shift allows banks to offer services that feel tailor-made for each individual, increasing customer loyalty and retention.</p>
                `,
                ogImageUrl: 'https://picsum.photos/seed/fintech-ai/1200/630'
            },
            // Other languages omitted for brevity in seed, but easy to add back if needed. 
            // For a clean handover, English is sufficient to demonstrate structure.
        ]
    },
    {
        status: 'published',
        translations: [
            {
                locale: 'en',
                slug: 'blockchain-for-enterprise',
                title: 'Why Enterprise Blockchain Matters',
                excerpt: 'Decentralized ledgers are solving complex supply chain and verification problems for major corporations.',
                content: richContent,
                ogImageUrl: 'https://picsum.photos/seed/blockchain-ent/1200/630'
            }
        ]
    },
    {
        status: 'published',
        translations: [
            {
                locale: 'en',
                slug: 'iso-20022-guide',
                title: 'A Comprehensive Guide to ISO 20022',
                excerpt: 'Understanding the new global standard for payments and messaging.',
                content: richContent,
                ogImageUrl: 'https://picsum.photos/seed/iso20022/1200/630'
            }
        ]
    }
]

// === MAIN ===

async function main() {
    console.log('🌱 Starting Database Seed...')

    // 1. Clean Database
    console.log('Removing old data...')
    await prisma.redirect.deleteMany({})
    await prisma.projectTranslation.deleteMany({})
    await prisma.project.deleteMany({})
    await prisma.articleTranslation.deleteMany({})
    await prisma.article.deleteMany({})
    // Optionally clean UrlAlias if we used it, but we prefer Redirect now. 
    // await prisma.urlAlias.deleteMany({}) 
    console.log('Database cleared.')

    // 2. Seed Redirects
    console.log(`Seeding ${redirects.length} redirects...`)
    for (const r of redirects) {
        // Normalize source
        const normalizedSource = r.source.startsWith('https://alcosi.com')
            ? r.source.replace('https://alcosi.com', '')
            : r.source

        // Prevent self-loops
        if (normalizedSource === r.target) continue

        await prisma.redirect.create({
            data: {
                source: normalizedSource,
                target: r.target,
                code: 301,
                isActive: true
            }
        })
    }

    // 3. Seed Projects
    console.log(`Seeding ${projects.length} portfolio projects...`)
    for (const p of projects) {
        await prisma.project.create({
            data: {
                status: 'published',
                publishedAt: new Date(),
                imageUrl: p.imageUrl,
                coverImageUrl: p.imageUrl,
                translations: {
                    create: {
                        locale: 'en',
                        title: p.title,
                        slug: p.slug,
                        description: p.description,
                        contentHtml: `<h2>Details</h2><p>${p.description}</p><h3>Tech Stack</h3><ul>${p.tags.map((t: string) => `<li>${t}</li>`).join('')}</ul>`,
                        category: p.category,
                        tags: p.tags,
                        client: "Example Client"
                    }
                }
            }
        })
    }

    // 4. Seed Articles
    console.log(`Seeding ${sampleArticles.length} articles...`)
    for (const articleData of sampleArticles) {
        const article = await prisma.article.create({
            data: {
                status: articleData.status as any,
                publishedAt: new Date()
            }
        })

        for (const t of articleData.translations) {
            await prisma.articleTranslation.create({
                data: {
                    articleId: article.id,
                    locale: t.locale as any,
                    slug: t.slug,
                    title: t.title,
                    excerpt: t.excerpt,
                    contentHtml: t.content,
                    metaTitle: t.title,
                    metaDescription: t.excerpt,
                    ogImageUrl: t.ogImageUrl
                }
            })
        }
    }

    console.log('✅ Seeding finished successfully.')
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
