"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (choice: "accepted" | "rejected") => {
    localStorage.setItem("cookieConsent", choice);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t bg-background/95 backdrop-blur shadow-lg animate-in slide-in-from-bottom-full duration-300">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground flex-1">
          <p className="font-medium text-foreground mb-1">We use cookies</p>
          <p>
            This website uses cookies to enhance your browsing experience, analyze site traffic, and serve better content. 
            By clicking &quot;Accept&quot;, you consent to our use of cookies. Read our{" "}
            <a href="/cookie-policy" className="underline hover:text-foreground">Cookie Policy</a> for more details.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none"
            onClick={() => handleConsent("rejected")}
          >
            Reject
          </Button>
          <Button 
            className="flex-1 sm:flex-none"
            onClick={() => handleConsent("accepted")}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
