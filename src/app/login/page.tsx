"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initFirebase } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { auth } = await initFirebase();
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err) {
      console.error("Login logic error:", err);
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-18rem)] max-w-6xl items-center px-4 py-10 md:px-8 lg:py-16">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="section-frame bg-primary text-primary-foreground shadow-[0_36px_70px_-42px_rgba(0,0,128,0.6)]">
          <span className="eyebrow border-white/15 bg-white/10 text-white">Secure admin access</span>
          <div className="mt-5 space-y-4">
            <h1 className="text-5xl font-semibold leading-tight">Manage reviews, publishing, and editorial flow.</h1>
            <p className="max-w-2xl text-base leading-8 text-white/82">
              This area is for curators and operators reviewing submissions, publishing profiles, and maintaining the platform&apos;s editorial standard.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
              <ShieldCheck className="h-5 w-5 text-white" />
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/65">Protected</p>
              <p className="mt-2 text-sm leading-7 text-white/82">Authenticated access for moderation and publishing only.</p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-4">
              <Lock className="h-5 w-5 text-white" />
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/65">Editorial control</p>
              <p className="mt-2 text-sm leading-7 text-white/82">Approve, revise, enrich, and archive content without leaving the dashboard.</p>
            </div>
          </div>
        </section>

        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-3">
              <span className="eyebrow">Sign in</span>
              <div>
                <CardTitle className="text-3xl">Admin login</CardTitle>
                <CardDescription className="mt-2">Enter your credentials to access the publishing workspace.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">Email</label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to dashboard"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
