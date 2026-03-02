import { getApprovedSpecialists, getSpecialistBySlug } from "@/lib/firebase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, Linkedin, Briefcase, Tag } from "lucide-react";
import type { Metadata } from "next";
import { Specialist } from "@/types/models";

export const dynamic = "force-dynamic";

const BASE_URL = "https://topseospecialists.netlify.app";

// Generate static params for all specialists fetching from DB
export async function generateStaticParams() {
  const specialists = await getApprovedSpecialists();
  return specialists.map((s) => ({ slug: s.slug }));
}

// Generate metadata for each specialist page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const specialist = await getSpecialistBySlug(slug);
  if (!specialist) return {};

  const title = `${specialist.name} — ${specialist.role}`;
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

// Person JSON-LD
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Find related specialists (same category, excluding self)
async function getRelated(category: string, name: string) {
  const all = await getApprovedSpecialists();
  return all
    .filter((s) => s.category === category && s.name !== name)
    .slice(0, 4);
}

export default async function SpecialistProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const specialist = await getSpecialistBySlug(slug);
  if (!specialist) return notFound();

  const related = await getRelated(specialist.category, specialist.name);

  return (
    <>
      <PersonJsonLd {...specialist} />
      <div className="container mx-auto px-4 md:px-8 py-10 lg:py-14 max-w-4xl space-y-10">
        {/* Breadcrumb */}
        <Button asChild variant="ghost" size="sm">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Directory</Link>
        </Button>

        {/* Profile Header */}
        <header className="space-y-4 pb-8 border-b">
          <Badge variant="secondary">{specialist.category}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {specialist.name}
          </h1>
          <p className="text-xl text-muted-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 shrink-0" />
            {specialist.role}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {specialist.website && (
              <Button asChild variant="outline" size="sm">
                <a href={specialist.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />Website
                </a>
              </Button>
            )}
            {specialist.social && (
              <Button asChild variant="outline" size="sm">
                <a href={specialist.social} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />LinkedIn
                </a>
              </Button>
            )}
          </div>
        </header>

        {/* About / Bio */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">About</h2>
          {specialist.summary ? (
            <p className="text-foreground/85 leading-relaxed text-lg">{specialist.summary}</p>
          ) : (
            <p className="text-foreground/85 leading-relaxed text-lg">{specialist.contribution}</p>
          )}
        </section>

        {/* Known For */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Known For</h2>
          <p className="text-foreground/80 leading-relaxed">{specialist.contribution}</p>
        </section>

        {/* Expertise */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5" />Expertise
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge>{specialist.category}</Badge>
            <Badge variant="outline">Search Engine Optimization</Badge>
            <Badge variant="outline">Digital Marketing</Badge>
          </div>
        </section>

        {/* Related Specialists */}
        {related.length > 0 && (
          <section className="space-y-4 pt-8 border-t">
            <h2 className="text-xl font-semibold">More {specialist.category} Specialists</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.name} href={`/specialist/${r.slug}`} className="group">
                  <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 group-hover:border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base group-hover:text-primary transition-colors">{r.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{r.role}</p>
                      <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{r.contribution}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
