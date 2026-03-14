"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SubmissionModal } from "./SubmissionModal";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/#directory", label: "Directory" },
    { href: "/blog", label: "Journal" },
    { href: "/#faq", label: "FAQ" },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="border-b border-border/60 bg-primary text-primary-foreground">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] md:px-8">
          <span>Curated SEO intelligence</span>
          <span className="hidden sm:inline">Research-forward directory and editorial hub</span>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="Top SEO Specialists home">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-[0_18px_34px_-22px_rgba(0,0,128,0.9)] transition-transform duration-200 group-hover:-translate-y-0.5">
              TS
            </div>
            <div className="min-w-0">
              <p className="font-display truncate text-lg font-semibold text-foreground sm:text-xl">Top SEO Specialists</p>
              <p className="truncate text-[10px] uppercase tracking-[0.24em] text-muted-foreground sm:text-xs">Definitive curated directory</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <nav aria-label="Primary" className="flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className={cn("min-w-[6.25rem] justify-center", isActive(item.href) && "text-primary")}
                >
                  <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </Button>
              ))}
            </nav>
            <SubmissionModal />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <SubmissionModal compact />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-site-navigation"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav
          id="mobile-site-navigation"
          aria-label="Primary"
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity,margin-top] duration-200 md:hidden",
            isMenuOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0">
            <div className="surface-card rounded-[28px] p-3">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    asChild
                    className="justify-start rounded-2xl px-4"
                  >
                    <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
