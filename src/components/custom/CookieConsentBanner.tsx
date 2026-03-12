"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    const frame = window.requestAnimationFrame(() => {
      setShowBanner(!consent);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleConsent = (choice: "accepted" | "rejected") => {
    localStorage.setItem("cookieConsent", choice);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="surface-card rounded-[30px] border px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Cookie preferences</p>
              <p className="text-base font-semibold text-foreground">We use cookies to improve reading experience and understand what content helps visitors most.</p>
              <p className="text-sm leading-6 text-muted-foreground">
                You can accept analytics cookies or reject them and continue browsing. Details are available in our {" "}
                <Link href="/cookie-policy" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Cookie Policy
                </Link>.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => handleConsent("rejected")}>
                Reject
              </Button>
              <Button onClick={() => handleConsent("accepted")}>Accept cookies</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
