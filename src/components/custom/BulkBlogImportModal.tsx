"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { initFirebase } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Upload, Loader2, Info } from "lucide-react";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function BulkBlogImportModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonData, setJsonData] = useState("");
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const handleImport = async () => {
    if (!jsonData.trim()) return;
    setIsSubmitting(true);
    setResult(null);

    let posts: any[];

    // Try JSON array first, then CSV fallback
    try {
      posts = JSON.parse(jsonData);
      if (!Array.isArray(posts)) posts = [posts];
    } catch {
      // CSV fallback: title, author, category, excerpt, content (each line)
      const lines = jsonData.split("\n").filter(l => l.trim());
      posts = lines.map(line => {
        const parts = line.split("\t").length > 1 ? line.split("\t") : line.split(",");
        return {
          title: (parts[0] || "").trim(),
          author: (parts[1] || "").trim(),
          category: (parts[2] || "SEO Strategy").trim(),
          excerpt: (parts[3] || "").trim(),
          content: (parts[4] || parts[3] || "").trim(),
        };
      });
    }

    let successCount = 0;
    let failedCount = 0;

    try {
      const { db, config } = await initFirebase();
      const postsCollection = collection(db, `/artifacts/${config.appId}/public/data/blog-posts`);

      for (const post of posts) {
        if (!post.title) { failedCount++; continue; }
        try {
          await addDoc(postsCollection, {
            title: post.title,
            slug: slugify(post.title),
            excerpt: post.excerpt || (post.content || "").substring(0, 160) + "...",
            content: post.content || "",
            author: post.author || "Admin",
            category: post.category || "SEO Strategy",
            tags: post.tags || [],
            status: post.status || "draft",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          successCount++;
        } catch {
          failedCount++;
        }
      }

      setResult({ success: successCount, failed: failedCount });
      if (failedCount === 0) {
        setJsonData("");
        setTimeout(() => setOpen(false), 2000);
      }
    } catch (error) {
      console.error("Bulk blog import error:", error);
      alert("A critical error occurred during import.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setResult(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Blog Posts</DialogTitle>
          <DialogDescription>
            Import multiple blog posts at once. They will be saved as drafts by default.
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-muted/50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-1">
            <p><strong>JSON format:</strong></p>
            <code className="block bg-muted px-2 py-1 rounded text-[10px]">
              {`[{"title":"...", "author":"...", "category":"...", "excerpt":"...", "content":"...", "tags":["a","b"]}]`}
            </code>
            <p className="mt-1"><strong>CSV/TSV format (tab-separated):</strong></p>
            <code className="block bg-muted px-2 py-1 rounded text-[10px]">
              Title{"\t"}Author{"\t"}Category{"\t"}Excerpt{"\t"}Content
            </code>
          </AlertDescription>
        </Alert>

        <Textarea
          placeholder="Paste JSON array or tab-separated data here..."
          className="font-mono text-sm resize-none h-40"
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          disabled={isSubmitting}
        />

        {result && (
          <div className="text-sm">
            <span className="text-green-600 font-medium">{result.success} imported.</span>
            {result.failed > 0 && <span className="text-destructive ml-2 font-medium">{result.failed} failed.</span>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleImport} disabled={isSubmitting || !jsonData.trim()}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing</> : "Import as Drafts"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
