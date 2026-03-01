import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubmissionModal } from "./SubmissionModal";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Top SEO Specialists
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">Blog</Link>
          </Button>
          {user && (
            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
              <Link href="/admin">Admin</Link>
            </Button>
          )}
          <SubmissionModal />
        </nav>
      </div>
    </header>
  );
}
