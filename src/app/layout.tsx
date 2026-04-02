import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/custom/Header";
import { Footer } from "@/components/custom/Footer";
import { CookieConsentBanner } from "@/components/custom/CookieConsentBanner";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://topseospecialists.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Top SEO Specialists - The Definitive Curated Directory",
    template: "%s | Top SEO Specialists",
  },
  description:
    "Discover 100+ of the world's top SEO specialists. A community-curated directory featuring experts in Technical SEO, Content SEO, Link Building, AI SEO, Local SEO, and more.",
  keywords: [
    "SEO specialists",
    "top SEO experts",
    "SEO consultants directory",
    "best SEO professionals",
    "SEO expert list",
    "technical SEO experts",
    "content SEO specialists",
    "link building experts",
    "AI SEO",
    "local SEO experts",
  ],
  authors: [{ name: "Top SEO Specialists" }],
  creator: "Top SEO Specialists",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Top SEO Specialists",
    title: "Top SEO Specialists - The Definitive Curated Directory",
    description:
      "Discover 100+ of the world's top SEO specialists. A community-curated directory featuring experts in Technical SEO, Content SEO, Link Building, AI SEO, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top SEO Specialists - The Definitive Curated Directory",
    description:
      "Discover 100+ of the world's top SEO specialists. A community-curated directory featuring experts across all SEO disciplines.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Top SEO Specialists",
    url: BASE_URL,
    description:
      "A community-curated directory of the world's top Search Engine Optimization specialists.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="KC6PoqVYWiXEM8dXU1tvOKZGJJ6_54HgawfPrcagADE"
        />
        <WebSiteJsonLd />
      </head>
      <body
        className={`${manrope.variable} ${fraunces.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <Providers>
          <div className="brand-shell flex min-h-screen flex-col">
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Header />
            <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
              {children}
            </main>
            <Footer />
            <CookieConsentBanner />
          </div>
        </Providers>
      </body>
    </html>
  );
}
