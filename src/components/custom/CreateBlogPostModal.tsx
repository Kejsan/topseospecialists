"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BLOG_CATEGORIES, BlogPost } from "@/types/models";
import { initFirebase } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { PenLine, Loader2 } from "lucide-react";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function CreateBlogPostModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    tags: "",
    status: "draft" as "draft" | "published",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.author || !formData.category) return;

    setIsSubmitting(true);
    try {
      const { db, config } = await initFirebase();
      const postsCollection = collection(db, `/artifacts/${config.appId}/public/data/blog-posts`);

      const post: Omit<BlogPost, "id"> = {
        title: formData.title,
        slug: slugify(formData.title),
        excerpt: formData.excerpt || formData.content.substring(0, 160) + "...",
        content: formData.content,
        author: formData.author,
        category: formData.category,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        status: formData.status,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(formData.status === "published" ? { publishedAt: new Date() } : {}),
      };

      await addDoc(postsCollection, post);
      setOpen(false);
      setFormData({ title: "", excerpt: "", content: "", author: "", category: "", tags: "", status: "draft" });
    } catch (error) {
      console.error("Error creating blog post:", error);
      alert("Failed to create blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <PenLine className="h-4 w-4" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Blog Post</DialogTitle>
            <DialogDescription>
              Write a new article. Save as draft or publish immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="bp-title" className="text-sm font-medium">Title *</label>
              <Input id="bp-title" required value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="10 Advanced Technical SEO Tips for 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="bp-author" className="text-sm font-medium">Author *</label>
                <Input id="bp-author" required value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="bp-category" className="text-sm font-medium">Category *</label>
                <Select value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="bp-excerpt" className="text-sm font-medium">Excerpt</label>
              <Input id="bp-excerpt" value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A brief summary (auto-generated from content if left empty)"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="bp-content" className="text-sm font-medium">Content (Markdown) *</label>
              <Textarea id="bp-content" required value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your article content in Markdown..."
                className="resize-none font-mono text-sm"
                rows={10}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="bp-tags" className="text-sm font-medium">Tags (comma-separated)</label>
                <Input id="bp-tags" value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="seo, technical, tips"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="bp-status" className="text-sm font-medium">Status</label>
                <Select value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as "draft" | "published" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving</> : "Save Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
