"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SubmissionModal } from "./SubmissionModal";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="border-b border-border/60 bg-primary text-primary-foreground">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] md:px-8">
          <span>Curated SEO intelligence</span>
          <span className="hidden sm:inline">Research-forward directory and editorial hub</span>
        </div>
      </div>
      <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-[0_18px_34px_-22px_rgba(0,0,128,0.9)] transition-transform duration-200 group-hover:-translate-y-0.5">
            TS
          </div>
          <div className="min-w-0">
            <p className="font-display truncate text-xl font-semibold text-foreground">Top SEO Specialists</p>
            <p className="truncate text-xs uppercase tracking-[0.24em] text-muted-foreground">Definitive curated directory</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/">Directory</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">Journal</Link>
          </Button>
          {user && (
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/admin">Admin</Link>
            </Button>
          )}
          <SubmissionModal />
        </nav>
      </div>
    </header>
  );
}
