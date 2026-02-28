"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { initFirebase } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Upload, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function BulkImportModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [result, setResult] = useState<{success: number, failed: number} | null>(null);

  const handleImport = async () => {
    if (!csvData.trim()) return;

    setIsSubmitting(true);
    setResult(null);

    const lines = csvData.split("\n").filter(line => line.trim() !== "");
    let successCount = 0;
    let failedCount = 0;

    try {
      const { db, config } = await initFirebase();
      const pendingCollection = collection(db, "pending-specialists");
      
      for (const line of lines) {
        // Simple CSV parsing: split by comma, handling potential quotes if needed, but keeping it simple for now
        // Expected format: Name, LinkedIn URL, optional role/category
        const parts = line.split(",").map(p => p.trim());
        if (parts.length >= 1) {
          try {
            await addDoc(pendingCollection, {
              name: parts[0],
              social: parts[1] || "",
              role: parts[2] || "",
              category: parts[3] || "Other",
              contribution: "Imported via Bulk Upload. Needs AI Enrichment.",
              submittedAt: new Date(),
              status: "pending"
            });
            successCount++;
          } catch (e) {
            failedCount++;
          }
        } else {
          failedCount++;
        }
      }

      setResult({ success: successCount, failed: failedCount });
      if (failedCount === 0) {
        setCsvData("");
        setTimeout(() => setOpen(false), 2000); // Close after 2s on full success
      }
    } catch (error) {
      console.error("Error during bulk import:", error);
      alert("A critical error occurred during import.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if(!o) setResult(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Specialists</DialogTitle>
          <DialogDescription>
            Paste CSV data containing specialists. They will be added to the pending queue for review and AI enrichment.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="bg-muted/50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Format: <code className="bg-muted px-1 rounded">Name, LinkedIn URL, Role (optional), Category (optional)</code>
            <br/>Example: <br/>
            Jane Doe, https://linkedin.com/in/janedoe, SEO Lead, Technical SEO
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 py-2">
          <Textarea
            placeholder="Paste CSV here..."
            className="font-mono text-sm resize-none h-40"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {result && (
          <div className="text-sm">
            <span className="text-green-600 font-medium">{result.success} imported successfully.</span>
            {result.failed > 0 && <span className="text-destructive ml-2 font-medium">{result.failed} failed.</span>}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isSubmitting || !csvData.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              "Import to Pending"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
