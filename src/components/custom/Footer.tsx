import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 md:py-12 mt-12 bg-muted/20">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Top SEO Specialists. All rights reserved.
        </p>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/cookie-policy" className="hover:text-foreground transition-colors">
            Cookie Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
