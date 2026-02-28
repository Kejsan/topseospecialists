"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { initFirebase } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BlogPost } from "@/types/models";
import { Loader2, Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const { db, config } = await initFirebase();
        const postsRef = collection(db, `/artifacts/${config.appId}/public/data/blog-posts`);
        const q = query(postsRef, where("slug", "==", slug), where("status", "==", "published"));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setPost({ id: doc.id, ...doc.data() } as BlogPost);
        }
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <p className="text-muted-foreground mb-6">The blog post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button asChild variant="outline">
          <Link href="/blog"><ArrowLeft className="h-4 w-4 mr-2" />Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 md:px-8 py-12 lg:py-16 max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-8">
        <Link href="/blog"><ArrowLeft className="h-4 w-4 mr-2" />Back to Blog</Link>
      </Button>

      <header className="space-y-4 mb-8 pb-8 border-b">
        <Badge variant="secondary">{post.category}</Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {post.publishedAt?.toDate ? post.publishedAt.toDate().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
          </span>
        </div>
      </header>

      {/* Simple markdown-like rendering (splits by paragraphs, headers, code blocks) */}
      <div className="prose prose-invert max-w-none space-y-4">
        {post.content.split("\n").map((line, i) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold mt-6 mb-2">{trimmed.slice(4)}</h3>;
          if (trimmed.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold mt-8 mb-3">{trimmed.slice(3)}</h2>;
          if (trimmed.startsWith("# ")) return <h1 key={i} className="text-3xl font-extrabold mt-8 mb-3">{trimmed.slice(2)}</h1>;
          if (trimmed.startsWith("- ")) return <li key={i} className="ml-4 text-foreground/85">{trimmed.slice(2)}</li>;
          if (trimmed === "") return <br key={i} />;
          return <p key={i} className="text-foreground/85 leading-relaxed">{trimmed}</p>;
        })}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center gap-2 mt-10 pt-6 border-t flex-wrap">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {post.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </article>
  );
}
