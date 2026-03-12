import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-primary text-primary-foreground">
      <div className="container mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr] md:px-8">
        <div className="space-y-4">
          <span className="eyebrow bg-white/10 text-white border-white/15">Built for trust</span>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold">A sharper way to discover credible SEO operators.</h2>
            <p className="max-w-2xl text-sm leading-7 text-white/78">
              Top SEO Specialists combines curated profiles, editorial insights, and practitioner signals so teams can evaluate talent with more confidence and less noise.
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-white/78 sm:grid-cols-2 md:grid-cols-1">
          <Link href="/privacy-policy" className="transition-colors hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms of Service
          </Link>
          <Link href="/cookie-policy" className="transition-colors hover:text-white">
            Cookie Policy
          </Link>
          <p className="pt-3 text-xs uppercase tracking-[0.18em] text-white/50">
            Copyright {new Date().getFullYear()} Top SEO Specialists
          </p>
        </div>
      </div>
    </footer>
  );
}
