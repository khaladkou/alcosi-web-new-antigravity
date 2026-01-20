import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "../globals.css";
import { locales } from "@/i18n/config";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://alcosi.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Construct hreflang alternates
  const languages: Record<string, string> = {};
  locales.forEach((l) => {
    languages[l] = `${BASE_URL}/${l}`;
  });

  return {
    title: {
      template: "%s | Alcosi Group",
      default: "Alcosi Group | AI & Fintech Solutions",
    },
    description: "Empowering enterprises with scalable AI and Fintech infrastructure.",
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: languages,
    },
    openGraph: {
      siteName: "Alcosi Group",
      locale: locale,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getDictionary(locale as Locale);

  return (
    <html lang={locale}>
      <body
        className={`${outfit.variable} ${inter.variable} antialiased font-sans bg-background text-foreground flex flex-col min-h-screen`}
      >
        <Header dictionary={t.nav} common={t.common} />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer dictionary={t.footer} common={t.common} locale={locale} />
      </body>
    </html>
  );
}
