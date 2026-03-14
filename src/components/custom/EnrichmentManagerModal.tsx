"use client";

import { useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { Check, Loader2, Play, Sparkles, Trash2, X } from "lucide-react";
import { formatFirebaseFunctionsError, initFirebase } from "@/lib/firebase";
import { Specialist } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EnrichmentManagerModalProps {
  profiles: Specialist[];
}

const STATUS_ORDER: Record<string, number> = {
  needs_review: 0,
  pending: 1,
  processing: 2,
  failed: 3,
  rejected: 4,
  excluded: 5,
  enriched: 6,
};

function statusLabel(status?: string) {
  if (!status) return "Not queued";
  return status.replace(/_/g, " ");
}

function statusVariant(status?: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "needs_review") return "default";
  if (status === "pending" || status === "processing") return "secondary";
  if (status === "failed" || status === "rejected") return "destructive";
  return "outline";
}

export function EnrichmentManagerModal({ profiles }: EnrichmentManagerModalProps) {
  const [open, setOpen] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      const statusA = STATUS_ORDER[a.enrichmentStatus || "z"] ?? 99;
      const statusB = STATUS_ORDER[b.enrichmentStatus || "z"] ?? 99;
      if (statusA !== statusB) return statusA - statusB;
      return a.name.localeCompare(b.name);
    });
  }, [profiles]);

  const counts = useMemo(() => ({
    pending: profiles.filter((profile) => profile.enrichmentStatus === "pending").length,
    review: profiles.filter((profile) => profile.enrichmentStatus === "needs_review").length,
    enriched: profiles.filter((profile) => profile.enrichmentStatus === "enriched").length,
  }), [profiles]);

  const callAction = async (fnName: string, specialistId?: string) => {
    if (!specialistId) return;
    setWorkingId(`${fnName}:${specialistId}`);
    try {
      const { functions } = await initFirebase();
      const fn = httpsCallable(functions, fnName);
      await fn({ specialistId });
    } catch (error) {
      console.error(`Failed to run ${fnName}:`, error);
      alert(formatFirebaseFunctionsError(error, `Running ${fnName}`));
    } finally {
      setWorkingId(null);
    }
  };

  const runMonthlyBatchNow = async () => {
    setIsBatchRunning(true);
    try {
      const { functions } = await initFirebase();
      const fn = httpsCallable(functions, "runMonthlyEnrichmentBatch");
      const response = await fn({});
      const data = response.data as { attempted?: number; processed?: number };
      alert(`Monthly batch complete. Attempted ${data.attempted || 0}, processed ${data.processed || 0}.`);
    } catch (error) {
      console.error("Failed to run monthly enrichment batch:", error);
      alert(formatFirebaseFunctionsError(error, "Running the monthly enrichment batch"));
    } finally {
      setIsBatchRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4" />
          Enrichment Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Profile Enrichment Manager</DialogTitle>
          <DialogDescription>
            Queue new profiles, run manual enrichment, review Firecrawl drafts, and exclude profiles from future automated runs.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Profiles</p>
            <p className="mt-3 text-3xl font-semibold text-primary">{profiles.length}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pending</p>
            <p className="mt-3 text-3xl font-semibold text-primary">{counts.pending}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Needs review</p>
            <p className="mt-3 text-3xl font-semibold text-primary">{counts.review}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Enriched</p>
            <p className="mt-3 text-3xl font-semibold text-primary">{counts.enriched}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={runMonthlyBatchNow} disabled={isBatchRunning}>
            {isBatchRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run monthly batch now
          </Button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-border/70 bg-white/65">
          <div className="grid gap-3 p-4">
            {sortedProfiles.map((profile) => {
              const busy = (name: string) => workingId === `${name}:${profile.id}`;
              return (
                <div key={profile.id} className="rounded-2xl border border-border/70 bg-white/85 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-foreground">{profile.name}</p>
                        <Badge variant="outline">{profile.category}</Badge>
                        <Badge variant={statusVariant(profile.enrichmentStatus)}>{statusLabel(profile.enrichmentStatus)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.role}</p>
                      {profile.enrichmentDraft?.summary ? (
                        <p className="text-sm leading-6 text-foreground/80">Draft: {profile.enrichmentDraft.summary}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button size="sm" variant="outline" onClick={() => callAction("queueProfileEnrichment", profile.id)} disabled={busy("queueProfileEnrichment")}>
                        {busy("queueProfileEnrichment") ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        Queue
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => callAction("enrichProfile", profile.id)} disabled={busy("enrichProfile")}>
                        {busy("enrichProfile") ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Run now
                      </Button>
                      {profile.enrichmentStatus === "needs_review" ? (
                        <>
                          <Button size="sm" onClick={() => callAction("approveProfileEnrichment", profile.id)} disabled={busy("approveProfileEnrichment")}>
                            {busy("approveProfileEnrichment") ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => callAction("rejectProfileEnrichment", profile.id)} disabled={busy("rejectProfileEnrichment")}>
                            {busy("rejectProfileEnrichment") ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                            Reject draft
                          </Button>
                        </>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={() => callAction("excludeProfileFromEnrichment", profile.id)} disabled={busy("excludeProfileFromEnrichment")}>
                        {busy("excludeProfileFromEnrichment") ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Exclude
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
