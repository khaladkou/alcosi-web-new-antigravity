import { FeatureSection } from '@/components/sections/FeatureSection'
import { Hero } from '@/components/sections/Hero'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import { JsonLd } from '@/components/seo/JsonLd'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getDictionary(locale as Locale)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Alcosi Group',
      url: 'https://alcosi.com',
      logo: 'https://alcosi.com/logo.png', // Placeholder
      sameAs: [
        'https://linkedin.com/company/alcosigroups',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+48-123-456-789',
        contactType: 'customer service',
        areaServed: ['PL', 'EU', 'US'],
        availableLanguage: ['English', 'Polish', 'Spanish', 'German', 'Russian', 'Portuguese']
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Alcosi Group',
      url: 'https://alcosi.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://alcosi.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  ]

  return (
    <div className="flex flex-col gap-12">
      <JsonLd data={jsonLd} />
      <Hero dictionary={t.home.hero} common={t.common} />
      <FeatureSection dictionary={t.home.features} />

      {/* CTA Section */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">{t.home.cta.title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t.home.cta.subtitle}
          </p>
          <Button size="lg" variant="secondary" asChild className="font-bold">
            <Link href="/contact">{t.home.cta.button}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
