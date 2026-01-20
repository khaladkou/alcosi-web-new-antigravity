
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

async function main() {
    console.log('Seeding portfolio projects...')

    // Cleanup existing projects to avoid duplicates
    await prisma.project.deleteMany({})
    console.log('Cleared existing projects')

    for (const p of projects) {
        // Create Project
        const project = await prisma.project.create({
            data: {
                status: 'published',
                publishedAt: new Date(),
                imageUrl: p.imageUrl,
                coverImageUrl: p.imageUrl, // Use same image for hero as fallback
                translations: {
                    create: {
                        locale: 'en',
                        title: p.title,
                        slug: p.slug,
                        description: p.description,
                        contentHtml: `
                            <h2>Challenge</h2>
                            <p>The client needed a solution that would allow them to scale their operations globally while maintaining strict security standards. The existing infrastructure was struggling to keep up with the increasing load, leading to performance bottlenecks and user dissatisfaction.</p>
                            
                            <h2>Solution</h2>
                            <p>We designed and implemented a microservices architecture using <strong>${p.tags[0]}</strong> and <strong>${p.tags[1]}</strong>. This allowed for independent scaling of components and improved system resilience. We also integrated advanced AI models to optimize resource allocation.</p>
                            
                            <h3>Key Features Delivered</h3>
                            <ul>
                                <li>Real-time data processing pipeline</li>
                                <li>AI-driven analytics dashboard</li>
                                <li>Biometric authentication integration</li>
                                <li>Automated compliance reporting</li>
                            </ul>
                            
                            <h2>Results</h2>
                            <p>The new system processed over <strong>1 million transactions</strong> in the first month with 99.99% uptime. User engagement increased by 40%, and operational costs were reduced by 25%.</p>
                            
                            <blockquote>"Alcosi Group delivered a transformative solution that exceeded our expectations. Their technical expertise and dedication were instrumental in our success."</blockquote>
                        `,
                        category: p.category,
                        tags: p.tags,
                        client: "Global Tech Enterprise"
                    }
                }
            }
        })
        console.log(`Created project: ${p.title}`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
