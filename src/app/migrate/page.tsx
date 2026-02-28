"use client";

import { useState, useEffect } from "react";
import { initFirebase } from "@/lib/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { initialSpecialistData } from "@/lib/data";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function MigratePage() {
  const [status, setStatus] = useState<"idle" | "migrating" | "done" | "error">("idle");
  const [results, setResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const runMigration = async () => {
    setStatus("migrating");
    addLog("Starting migration...");

    try {
      const { db, config } = await initFirebase();
      const specialistsRef = collection(db, "specialists");
      
      addLog(`Found ${initialSpecialistData.length} specialists. Targeting collection: ${specialistsRef.path}`);

      let success = 0;
      let failed = 0;

      for (const specialist of initialSpecialistData) {
        const slug = slugify(specialist.name);
        try {
          // Add status and createdAt which are not in the hardcoded data
          const docRef = doc(db, specialistsRef.path, slug);
          await setDoc(docRef, {
            ...specialist,
            status: "approved",
            createdAt: new Date(),
            slug: slug // Keep slug in doc for easier querying
          });
          success++;
          addLog(`✅ Migrated: ${specialist.name}`);
        } catch (err: any) {
          failed++;
          addLog(`❌ Failed ${specialist.name}: ${err.message}`);
          console.error(err);
        }
        setResults({ success, failed });
      }

      setStatus("done");
      addLog("Migration finished!");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      addLog(`FATAL ERROR: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Database Migration</h1>
      <p className="mb-4 text-muted-foreground">
        This tool will copy all {initialSpecialistData.length} hardcoded specialists into your live Firestore database.
      </p>

      {status === "idle" && (
        <button
          onClick={runMigration}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Start Migration
        </button>
      )}

      {(status === "migrating" || status === "done" || status === "error") && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-card shadow-sm">
            {status === "migrating" ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : status === "done" ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            <div>
              <p className="font-semibold">
                {status === "migrating" ? "Migration in progress..." : status === "done" ? "Migration Complete" : "Migration Error"}
              </p>
              <p className="text-sm text-muted-foreground">
                Success: {results.success} | Failed: {results.failed}
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
