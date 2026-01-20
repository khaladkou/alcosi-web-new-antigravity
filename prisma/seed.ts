import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient({})

async function main() {
    const legacyUrlsPath = path.join(process.cwd(), 'docs', 'legacy_urls.json')
    const legacyUrls: string[] = JSON.parse(fs.readFileSync(legacyUrlsPath, 'utf8'))

    console.log(`Found ${legacyUrls.length} legacy URLs.`)

    for (const url of legacyUrls) {
        try {
            const urlObj = new URL(url)
            let fromPath = urlObj.pathname
            // Use raw pathname, but ensure it's decoded if needed. 
            // legacy URLs might be like /portfolio/ai/Face_%26_form_recognizer
            // decodeURIComponent might be needed for the DB to match incoming requests.

            // Normalize: ensure trailing slash consistency based on strategy. 
            // Strategy says: "MUST: единая политика... например, без trailing slash".
            // We will store fromPath exactly as it might come, or normalize?
            // Better to store normalized "from" and let middleware normalize request before check.

            if (fromPath.length > 1 && fromPath.endsWith('/')) {
                fromPath = fromPath.slice(0, -1)
            }

            // Initial Assumption: New URL is same as Old URL (normalized)
            // If old URL had /alcosi prefix, remove it for destination.
            let toPath = fromPath
            if (toPath.startsWith('/alcosi/')) {
                toPath = toPath.replace('/alcosi/', '/')
            } else if (toPath === '/alcosi') {
                toPath = '/'
            }

            try {
                await prisma.urlAlias.upsert({
                    where: { fromPath },
                    update: {},
                    create: {
                        fromPath,
                        toPath,
                        httpCode: 301
                    }
                })
                console.log(`Seeded alias: ${fromPath} -> ${toPath}`)
            } catch (e) {
                console.error(`Failed to seed ${fromPath}:`, e)
            }

        } catch (e) {
            console.error(`Invalid URL in list: ${url}`)
        }
    }
    // Seed Articles
    console.log('Seeding Articles...')
    // clean up existing articles to force update content
    await prisma.articleTranslation.deleteMany({})
    await prisma.article.deleteMany({})

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
                {
                    locale: 'pl',
                    slug: 'ai-transformuje-fintech',
                    title: 'Jak AI Zmienia Fintech w 2026',
                    excerpt: 'Sztuczna inteligencja zmienia krajobraz finansowy, od wykrywania oszustw po spersonalizowaną bankowość.',
                    content: `
                        <p class="lead">Integracja sztucznej inteligencji (AI) w technologii finansowej nie jest już trendem — jest koniecznością. Wchodząc w rok 2026, instytucje finansowe, które nie dostosują się do zmian, ryzykują przestarzałość.</p>
                        <img src="https://picsum.photos/seed/fintech-ai/800/400" alt="AI w Fintech" class="rounded-xl w-full my-8 shadow-lg" />
                        <h2>Analityka predykcyjna i personalizacja</h2>
                        <p>Jednym z najważniejszych wpływów AI jest analityka predykcyjna. Analizując ogromne ilości danych, algorytmy AI mogą przewidywać zachowania klientów z niespotykaną dotąd dokładnością.</p>
                        <ul>
                            <li>Wykrywanie oszustw w czasie rzeczywistym przy użyciu modeli uczenia maszynowego.</li>
                            <li>Hiper-spersonalizowane porady inwestycyjne oparte na nawykach wydatkowych.</li>
                            <li>Zautomatyzowana obsługa klienta za pomocą zaawansowanych chatbotów NLP.</li>
                        </ul>
                        <p>Ta zmiana pozwala bankom oferować usługi, które wydają się być szyte na miarę dla każdego klienta, zwiększając lojalność i retencję.</p>
                    `,
                    ogImageUrl: 'https://picsum.photos/seed/fintech-ai/1200/630'
                },
                {
                    locale: 'es',
                    slug: 'ia-transformando-fintech',
                    title: 'Cómo la IA está transformando Fintech en 2026',
                    excerpt: 'La Inteligencia Artificial está remodelando el panorama financiero.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/fintech-ai/1200/630'
                },
                {
                    locale: 'de',
                    slug: 'ki-transformiert-fintech',
                    title: 'Wie KI Fintech im Jahr 2026 verändert',
                    excerpt: 'Künstliche Intelligenz gestaltet die Finanzlandschaft neu.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/fintech-ai/1200/630'
                },
                {
                    locale: 'pt',
                    slug: 'ia-transformando-fintech-pt',
                    title: 'Como a IA está transformando Fintech em 2026',
                    excerpt: 'A Inteligência Artificial está remodelando o cenário financeiro.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/fintech-ai/1200/630'
                },
                {
                    locale: 'ru',
                    slug: 'ii-transformiruet-fintech',
                    title: 'Как ИИ трансформирует Финтех в 2026',
                    excerpt: 'Искусственный интеллект меняет финансовый ландшафт.',
                    content: `
                         <p class="lead">Интеграция искусственного интеллекта (ИИ) в финансовые технологии больше не является трендом — это необходимость.</p>
                         <img src="https://picsum.photos/seed/fintech-ai/800/400" alt="ИИ в Финтехе" class="rounded-xl w-full my-8 shadow-lg" />
                         <h2>Предиктивная аналитика и персонализация</h2>
                         <p>Одной из наиболее значимых областей влияния ИИ является предиктивная аналитика. Анализируя огромные объемы данных, алгоритмы могут предсказывать поведение клиентов.</p>
                         <ul>
                            <li>Обнаружение мошенничества в реальном времени.</li>
                            <li>Персонализированные инвестиционные советы.</li>
                            <li>Автоматизация поддержки клиентов.</li>
                         </ul>
                    `,
                    ogImageUrl: 'https://picsum.photos/seed/fintech-ai/1200/630'
                }
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
                },
                {
                    locale: 'pl',
                    slug: 'blockchain-dla-przedsiebiorstw',
                    title: 'Dlaczego Blockchain dla Firm ma Znaczenie',
                    excerpt: 'Zdecentralizowane rejestry rozwiązują złożone problemy łańcucha dostaw.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/blockchain-ent/1200/630'
                },
                {
                    locale: 'es',
                    slug: 'blockchain-para-empresas',
                    title: 'Por qué importa Blockchain para empresas',
                    excerpt: 'Los libros mayores descentralizados resuelven problemas complejos.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/blockchain-ent/1200/630'
                },
                {
                    locale: 'de',
                    slug: 'blockchain-fuer-unternehmen',
                    title: 'Warum Enterprise Blockchain wichtig ist',
                    excerpt: 'Dezentrale Ledger lösen komplexe Probleme.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/blockchain-ent/1200/630'
                },
                {
                    locale: 'pt',
                    slug: 'blockchain-para-empresas-pt',
                    title: 'Por que Blockchain Empresarial Importa',
                    excerpt: 'Registros descentralizados resolvem problemas complexos.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/blockchain-ent/1200/630'
                },
                {
                    locale: 'ru',
                    slug: 'blokchejn-dlja-biznesa',
                    title: 'Почему корпоративный блокчейн важен',
                    excerpt: 'Децентрализованные реестры решают сложные задачи.',
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
                },
                {
                    locale: 'pl',
                    slug: 'przewodnik-iso-20022',
                    title: 'Kompleksowy Przewodnik po ISO 20022',
                    excerpt: 'Zrozumienie nowego globalnego standardu płatności i komunikacji.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/iso20022/1200/630'
                },
                {
                    locale: 'es',
                    slug: 'guia-completa-iso-20022',
                    title: 'Una guía completa de ISO 20022',
                    excerpt: 'Entendiendo el nuevo estándar global.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/iso20022/1200/630'
                },
                {
                    locale: 'de',
                    slug: 'umfassender-leitfaden-iso-20022',
                    title: 'Ein umfassender Leitfaden zu ISO 20022',
                    excerpt: 'Den neuen globalen Standard verstehen.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/iso20022/1200/630'
                },
                {
                    locale: 'pt',
                    slug: 'guia-completo-iso-20022',
                    title: 'Um Guia Abrangente para ISO 20022',
                    excerpt: 'Entendendo o novo padrão global.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/iso20022/1200/630'
                },
                {
                    locale: 'ru',
                    slug: 'polnoe-rukovodstvo-iso-20022',
                    title: 'Полное руководство по ISO 20022',
                    excerpt: 'Понимание нового глобального стандарта.',
                    content: richContent,
                    ogImageUrl: 'https://picsum.photos/seed/iso20022/1200/630'
                }
            ]
        }
    ]

    console.log('Seeding Articles...')
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
            console.log(`Seeded Translation: ${t.locale.toUpperCase()} /${t.slug}`)
        }
    }
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
