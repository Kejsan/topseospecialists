import Link from "next/link";
import { ArrowRight, ExternalLink, Github, Globe, Linkedin, Twitter } from "lucide-react";
import { Specialist } from "@/types/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SpecialistCardProps {
  specialist: Specialist;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function SocialIcon({ url }: { url: string }) {
  if (url.includes("twitter.com") || url.includes("x.com")) return <Twitter className="h-4 w-4" />;
  if (url.includes("linkedin.com")) return <Linkedin className="h-4 w-4" />;
  if (url.includes("github.com")) return <Github className="h-4 w-4" />;
  return <ExternalLink className="h-4 w-4" />;
}

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  const initials = specialist.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const profileUrl = `/specialist/${specialist.slug || slugify(specialist.name)}`;

  return (
    <Card className="group grid-accent h-full overflow-hidden border-border/80 transition-all duration-200 hover:-translate-y-1 hover:border-primary/15">
      <Link href={profileUrl} className="flex h-full flex-col" aria-label={`View profile for ${specialist.name}`}>
        <CardHeader className="gap-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="h-16 w-16 border border-white/80 shadow-[0_14px_26px_-18px_rgba(0,0,128,0.5)]">
                <AvatarImage src={specialist.avatar || `https://avatar.vercel.sh/${specialist.name}.png`} alt={specialist.name} />
                <AvatarFallback className="bg-secondary text-sm font-semibold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1.5">
                <Badge variant="secondary">{specialist.category}</Badge>
                <CardTitle className="line-clamp-2 text-2xl font-semibold text-foreground transition-colors group-hover:text-primary">
                  {specialist.name}
                </CardTitle>
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{specialist.role}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-5">
          <p className="line-clamp-3 text-sm leading-7 text-foreground/80">
            {specialist.summary || specialist.contribution}
          </p>

          <div className="rounded-[24px] border border-border/70 bg-white/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Known for</p>
            <p className="mt-2 line-clamp-3 text-sm leading-7 text-foreground/85">{specialist.contribution}</p>
          </div>

          <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-primary">
            Explore full profile
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Link>

      <CardFooter className="border-t border-border/70 bg-white/60 pt-5">
        <div className="flex flex-wrap gap-2">
          {specialist.website && (
            <a
              href={specialist.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-primary/20 hover:text-primary"
              aria-label={`Visit ${specialist.name}'s website`}
            >
              <Globe className="h-4 w-4" />
            </a>
          )}
          {specialist.social && (
            <a
              href={specialist.social}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-primary/20 hover:text-primary"
              aria-label={`${specialist.name}'s social profile`}
            >
              <SocialIcon url={specialist.social} />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

