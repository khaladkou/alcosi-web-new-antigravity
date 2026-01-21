import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
  async rewrites() {
    return [
      // Spanish
      { source: '/es/servicios', destination: '/es/services' },
      { source: '/es/servicios/ia', destination: '/es/services/ai' },
      { source: '/es/servicios/fintech', destination: '/es/services/fintech' },
      { source: '/es/servicios/blockchain', destination: '/es/services/blockchain' },
      { source: '/es/contacto', destination: '/es/contact' },
      { source: '/es/portafolio', destination: '/es/portfolio' },

      // Russian
      { source: '/ru/uslugi', destination: '/ru/services' },
      { source: '/ru/uslugi/ii', destination: '/ru/services/ai' },
      { source: '/ru/uslugi/fintech', destination: '/ru/services/fintech' },
      { source: '/ru/uslugi/blockchain', destination: '/ru/services/blockchain' },
      { source: '/ru/kontakty', destination: '/ru/contact' },
      { source: '/ru/projekty', destination: '/ru/portfolio' },

      // German
      { source: '/de/leistungen', destination: '/de/services' },
      { source: '/de/leistungen/ki', destination: '/de/services/ai' },
      { source: '/de/leistungen/fintech', destination: '/de/services/fintech' },
      { source: '/de/leistungen/blockchain', destination: '/de/services/blockchain' },
      { source: '/de/kontakt', destination: '/de/contact' },
      { source: '/de/projekte', destination: '/de/portfolio' },

      // Polish
      { source: '/pl/uslugi', destination: '/pl/services' },
      { source: '/pl/uslugi/si', destination: '/pl/services/ai' },
      { source: '/pl/uslugi/fintech', destination: '/pl/services/fintech' },
      { source: '/pl/uslugi/blockchain', destination: '/pl/services/blockchain' },
      { source: '/pl/kontakt', destination: '/pl/contact' },
      { source: '/pl/realizacje', destination: '/pl/portfolio' },

      // Portuguese
      { source: '/pt/servicos', destination: '/pt/services' },
      { source: '/pt/servicos/ia', destination: '/pt/services/ai' },
      { source: '/pt/servicos/fintech', destination: '/pt/services/fintech' },
      { source: '/pt/servicos/blockchain', destination: '/pt/services/blockchain' },
      { source: '/pt/contato', destination: '/pt/contact' },
      { source: '/pt/portfolio', destination: '/pt/portfolio' },
    ]
  },

};

export default nextConfig;
