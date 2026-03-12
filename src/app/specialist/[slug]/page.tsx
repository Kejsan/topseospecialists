import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Briefcase, Globe, Linkedin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApprovedSpecialists, getSpecialistBySlug } from "@/lib/firebase";
import { notFound } from "next/navigation";
import { Specialist } from "@/types/models";

export const dynamic = "force-dynamic";

const BASE_URL = "https://topseospecialists.netlify.app";

export async function generateStaticParams() {
  const specialists = await getApprovedSpecialists();
  return specialists.map((specialist) => ({ slug: specialist.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const specialist = await getSpecialistBySlug(slug);
  if (!specialist) return {};

  const title = `${specialist.name} - ${specialist.role}`;
  const description = specialist.summary || specialist.contribution;
  const url = `${BASE_URL}/specialist/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: { canonical: url },
  };
}

function PersonJsonLd({ name, role, contribution, summary, website, social, category, slug }: Specialist) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role,
    description: summary || contribution,
    knowsAbout: [category, "Search Engine Optimization", "SEO"],
    url: `${BASE_URL}/specialist/${slug}`,
  };

  if (website) jsonLd.url = website;
  if (social) jsonLd.sameAs = [social];

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

async function getRelated(category: string, name: string) {
  const all = await getApprovedSpecialists();
  return all.filter((specialist) => specialist.category === category && specialist.name !== name).slice(0, 4);
}

export default async function SpecialistProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const specialist = await getSpecialistBySlug(slug);
  if (!specialist) return notFound();

  const related = await getRelated(specialist.category, specialist.name);

  return (
    <>
      <PersonJsonLd {...specialist} />
      <div className="container mx-auto max-w-6xl px-4 py-10 md:px-8 lg:py-14">
        <div className="space-y-8">
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to directory
            </Link>
          </Button>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_340px]">
            <div className="section-frame grid-accent space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary">{specialist.category}</Badge>
                <div className="space-y-3">
                  <h1 className="text-5xl font-semibold leading-tight text-foreground md:text-6xl">{specialist.name}</h1>
                  <p className="flex items-center gap-2 text-base font-medium text-muted-foreground md:text-lg">
                    <Briefcase className="h-5 w-5 text-accent" />
                    {specialist.role}
                  </p>
                </div>
              </div>

              <p className="max-w-3xl text-base leading-8 text-foreground/80 md:text-lg">
                {specialist.summary || specialist.contribution}
              </p>

              <div className="flex flex-wrap gap-3">
                {specialist.website && (
                  <Button asChild>
                    <a href={specialist.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  </Button>
                )}
                {specialist.social && (
                  <Button asChild variant="outline">
                    <a href={specialist.social} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                      Social profile
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <aside className="section-frame space-y-5">
              <span className="eyebrow">Profile signals</span>
              <div className="space-y-4">
                <div className="rounded-[24px] border border-border/70 bg-white/78 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Primary expertise</p>
                  <p className="mt-2 text-xl font-semibold text-primary">{specialist.category}</p>
                </div>
                <div className="rounded-[24px] border border-border/70 bg-white/78 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Useful for</p>
                  <p className="mt-2 text-sm leading-7 text-foreground/80">Shortlisting, partner discovery, benchmarking peers, and understanding who is strongest in this lane.</p>
                </div>
              </div>
            </aside>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="section-frame space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Editorial summary</p>
                <h2 className="mt-2 text-3xl font-semibold">Why this profile stands out.</h2>
              </div>
              <p className="text-base leading-8 text-foreground/80">{specialist.summary || specialist.contribution}</p>
              <div className="rounded-[24px] border border-border/70 bg-white/74 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Known for</p>
                <p className="mt-3 text-sm leading-7 text-foreground/85">{specialist.contribution}</p>
              </div>
            </div>

            <div className="section-frame space-y-4">
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <Tag className="h-5 w-5 text-accent" />
                Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge>{specialist.category}</Badge>
                <Badge variant="outline">Search Engine Optimization</Badge>
                <Badge variant="outline">Digital Marketing</Badge>
              </div>
            </div>
          </section>

          {related.length > 0 && (
            <section className="section-frame space-y-6">
              <div className="space-y-2">
                <span className="eyebrow">Related specialists</span>
                <h2 className="text-3xl font-semibold">More voices in {specialist.category}.</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {related.map((item) => (
                  <Link key={item.name} href={`/specialist/${item.slug}`} className="group">
                    <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/15">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl group-hover:text-primary">{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm leading-6 text-muted-foreground">{item.role}</p>
                        <p className="line-clamp-3 text-sm leading-7 text-foreground/80">{item.contribution}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
