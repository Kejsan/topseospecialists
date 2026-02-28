import { Specialist } from "@/types/models";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Twitter, Linkedin, Github, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SpecialistCardProps {
  specialist: Specialist;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  const initials = specialist.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const profileUrl = `/specialist/${slugify(specialist.name)}`;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card group border-muted hover:border-border">
      <Link href={profileUrl} className="flex flex-col flex-grow">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
          <Avatar className="h-16 w-16 border-2 border-background shadow-sm ring-1 ring-border">
            <AvatarImage src={`https://avatar.vercel.sh/${specialist.name}.png`} alt={specialist.name} />
            <AvatarFallback className="font-medium text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1.5 flex-1 min-w-0">
            <CardTitle className="text-xl font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
              {specialist.name}
            </CardTitle>
            <CardDescription className="font-medium text-foreground/80 line-clamp-1">
              {specialist.role}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-grow space-y-4">
          {specialist.summary && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {specialist.summary}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="font-medium bg-secondary/50 hover:bg-secondary">
                {specialist.category}
              </Badge>
            </div>
            <div className="text-sm border-l-2 border-primary/20 pl-3 py-1">
              <span className="font-medium block text-xs text-muted-foreground uppercase tracking-wider mb-1">Key Contribution</span>
              <p className="text-foreground/90 line-clamp-2">{specialist.contribution}</p>
            </div>
          </div>

          {/* View Profile CTA */}
          <div className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity pt-1">
            View full profile
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </CardContent>
      </Link>

      <CardFooter className="pt-4 border-t bg-muted/20 flex flex-wrap gap-2">
        {specialist.website && (
          <a
            href={specialist.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 shrink-0 shadow-sm"
            aria-label={`Visit ${specialist.name}'s website`}
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-4 w-4" />
          </a>
        )}

        {specialist.social && (
          <a
            href={specialist.social}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 shrink-0 shadow-sm"
            aria-label={`${specialist.name}'s social profile`}
            onClick={(e) => e.stopPropagation()}
          >
            {specialist.social.includes("twitter.com") || specialist.social.includes("x.com") ? (
              <Twitter className="h-4 w-4" />
            ) : specialist.social.includes("linkedin.com") ? (
              <Linkedin className="h-4 w-4" />
            ) : specialist.social.includes("github.com") ? (
              <Github className="h-4 w-4" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
