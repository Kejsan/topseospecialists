import { SpecialistDirectory } from "@/components/custom/SpecialistDirectory";
import { getApprovedSpecialists } from "@/lib/firebase";

const BASE_URL = "https://topseospecialists.netlify.app";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ItemList + FAQPage JSON-LD
function HomeJsonLd({ specialists }: { specialists: any[] }) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top SEO Specialists Directory",
    description:
      "A curated list of the world's top SEO specialists and consultants.",
    numberOfItems: specialists.length,
    itemListElement: specialists.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `${BASE_URL}/specialist/${s.slug || slugify(s.name)}`,
    })),
  };

  // FAQ remains the same...
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Top SEO Specialists?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Top SEO Specialists is a community-curated directory of the world's best Search Engine Optimization professionals, covering disciplines like Technical SEO, Content SEO, Link Building, AI SEO, Local SEO, and more.",
        },
      },
      {
        "@type": "Question",
        name: "How are SEO specialists selected for this list?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Specialists are curated based on their industry reputation, contributions to the SEO community, published work, speaking engagements, and verified expertise. Community submissions are reviewed before inclusion.",
        },
      },
      {
        "@type": "Question",
        name: "Can I submit an SEO specialist to be listed?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! You can submit a specialist through the 'Submit a Specialist' form on the website. All submissions are reviewed by our admin team before being published.",
        },
      },
      {
        "@type": "Question",
        name: "What categories of SEO expertise are covered?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The directory covers General SEO, Technical SEO, Content SEO, Local SEO, E-commerce SEO, Link Building, AI SEO, Affiliate SEO, and Community & Education.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}

export default async function Home() {
  const specialists = await getApprovedSpecialists();

  return (
    <>
      <HomeJsonLd specialists={specialists} />
      <div className="container mx-auto px-4 md:px-8 py-12 lg:py-16 space-y-12 max-w-7xl">
        <section className="text-center space-y-6 max-w-4xl mx-auto flex flex-col items-center pb-8 border-b border-border/40">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 rounded-full">
            The Definitive List
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-balance bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            Discover the world&apos;s top SEO minds.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl leading-relaxed">
            A definitive, community-curated directory of {specialists.length}+ elite Search Engine
            Optimization specialists. Find your next hire, mentor, or collaborator.
          </p>
        </section>

        <section>
          <SpecialistDirectory initialData={specialists} />
        </section>

        {/* FAQ Section for SEO */}
        <section className="max-w-3xl mx-auto pt-8 border-t border-border/40">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="group rounded-lg border p-4" open>
              <summary className="font-medium cursor-pointer select-none list-none flex items-center justify-between">
                What is Top SEO Specialists?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Top SEO Specialists is a community-curated directory of the world&apos;s best Search Engine Optimization
                professionals, covering disciplines like Technical SEO, Content SEO, Link Building, AI SEO, Local SEO,
                and more.
              </p>
            </details>
            <details className="group rounded-lg border p-4">
              <summary className="font-medium cursor-pointer select-none list-none flex items-center justify-between">
                How are SEO specialists selected for this list?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Specialists are curated based on their industry reputation, contributions to the SEO community, published
                work, speaking engagements, and verified expertise. Community submissions are reviewed before inclusion.
              </p>
            </details>
            <details className="group rounded-lg border p-4">
              <summary className="font-medium cursor-pointer select-none list-none flex items-center justify-between">
                Can I submit an SEO specialist to be listed?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Yes! You can submit a specialist through the &quot;Submit a Specialist&quot; form on the website. All
                submissions are reviewed by our admin team before being published.
              </p>
            </details>
            <details className="group rounded-lg border p-4">
              <summary className="font-medium cursor-pointer select-none list-none flex items-center justify-between">
                What categories of SEO expertise are covered?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The directory covers General SEO, Technical SEO, Content SEO, Local SEO, E-commerce SEO, Link Building,
                AI SEO, Affiliate SEO, and Community &amp; Education.
              </p>
            </details>
          </div>
        </section>
      </div>
    </>
  );
}
