import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/custom/Header";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://topseospecialists.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Top SEO Specialists — The Definitive Curated Directory",
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
    title: "Top SEO Specialists — The Definitive Curated Directory",
    description:
      "Discover 100+ of the world's top SEO specialists. A community-curated directory featuring experts in Technical SEO, Content SEO, Link Building, AI SEO, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top SEO Specialists — The Definitive Curated Directory",
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

// JSON-LD structured data — WebSite schema
function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Top SEO Specialists",
    url: BASE_URL,
    description:
      "A community-curated directory of the world's top Search Engine Optimization (SEO) specialists.",
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
        <WebSiteJsonLd />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background relative`}
      >
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
