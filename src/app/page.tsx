import { SpecialistDirectory } from "@/components/custom/SpecialistDirectory";
import { getApprovedSpecialists } from "@/lib/firebase";

export const dynamic = "force-dynamic";

const BASE_URL = "https://topseospecialists.netlify.app";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function HomeJsonLd({ specialists }: { specialists: Array<{ name: string; slug?: string }> }) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top SEO Specialists Directory",
    description: "A curated list of the world's top SEO specialists and consultants.",
    numberOfItems: specialists.length,
    itemListElement: specialists.map((specialist, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: specialist.name,
      url: `${BASE_URL}/specialist/${specialist.slug || slugify(specialist.name)}`,
    })),
  };

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
          text: "Yes. You can submit a specialist through the website. All submissions are reviewed by the admin team before being published.",
        },
      },
      {
        "@type": "Question",
        name: "What categories of SEO expertise are covered?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The directory covers General SEO, Technical SEO, Content SEO, Local SEO, E-commerce SEO, Link Building, AI SEO, Affiliate SEO, and Community and Education.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

export default async function Home() {
  const specialists = await getApprovedSpecialists();

  return (
    <>
      <HomeJsonLd specialists={specialists} />
      <div className="container mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 md:px-8 lg:py-14">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
          <div className="section-frame grid-accent space-y-6">
            <span className="eyebrow">Editorial trust for SEO discovery</span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-[1] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Find the SEO operators shaping what good looks like.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                A refined, community-curated directory of specialists across technical SEO, content, links, local, AI, and growth strategy. Explore credible talent, discover adjacent expertise, and move faster with more confidence.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-border/70 bg-white/76 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Profiles</p>
                <p className="mt-2 text-3xl font-semibold text-primary">{specialists.length}+</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Curated practitioners, not scraped lists.</p>
              </div>
              <div className="rounded-[24px] border border-border/70 bg-white/76 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Coverage</p>
                <p className="mt-2 text-3xl font-semibold text-primary">9</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Specialty tracks across modern search.</p>
              </div>
              <div className="rounded-[24px] border border-border/70 bg-white/76 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Use case</p>
                <p className="mt-2 text-3xl font-semibold text-primary">Hire</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Source consultants, collaborators, and mentors.</p>
              </div>
            </div>
          </div>

          <aside className="section-frame grid-accent space-y-6">
            <span className="eyebrow">What makes the list useful</span>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground">Less noise. More signal.</h2>
              <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                <li>Curated around reputation, contribution, and visible expertise.</li>
                <li>Browse by specialty to compare peers inside the same lane.</li>
                <li>Profiles and journal content reinforce context, not vanity metrics.</li>
              </ul>
            </div>
            <div className="rounded-[24px] border border-border/70 bg-white/74 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best for</p>
              <p className="mt-3 text-base leading-7 text-foreground/85">
                Agencies assembling partner benches, founders vetting advisors, and marketers mapping the modern SEO landscape.
              </p>
            </div>
          </aside>
        </section>

        <section>
          <SpecialistDirectory initialData={specialists} />
        </section>

        <section id="faq" className="section-frame space-y-6">
          <div className="space-y-3 text-center">
            <span className="eyebrow">FAQ</span>
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Questions we hear most often.</h2>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              A quick orientation for teams exploring the platform, contributing names, or trying to understand the curation lens.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                question: "What is Top SEO Specialists?",
                answer:
                  "A community-curated directory of highly regarded SEO professionals spanning technical, content, local, AI, ecommerce, and strategic disciplines.",
              },
              {
                question: "How are specialists chosen?",
                answer:
                  "Selections are shaped by industry reputation, published insight, public contribution, speaking, and demonstrated expertise. Community submissions are reviewed before they go live.",
              },
              {
                question: "Can I submit someone?",
                answer:
                  "Yes. The platform accepts submissions and routes them through review before publication so the list stays useful and credible.",
              },
              {
                question: "Who is this for?",
                answer:
                  "Teams hiring SEO talent, marketers benchmarking experts, and practitioners looking for peers, mentors, and collaborators across specialties.",
              },
            ].map((item) => (
              <details key={item.question} className="rounded-[24px] border border-border/70 bg-white/74 p-5 open:border-primary/20">
                <summary className="cursor-pointer list-none text-lg font-semibold text-foreground marker:hidden">{item.question}</summary>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

