"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Loader2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { asDate } from "@/lib/date";
import { initFirebase } from "@/lib/firebase";
import { BlogPost } from "@/types/models";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const loadPosts = async () => {
      try {
        const { db } = await initFirebase();
        const postsRef = collection(db, "blog-posts");
        const blogQuery = query(postsRef, where("status", "==", "published"), orderBy("publishedAt", "desc"));

        unsubscribe = onSnapshot(blogQuery, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BlogPost));
          setPosts(data);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error loading blog posts:", error);
        setLoading(false);
      }
    };

    loadPosts();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:px-8 lg:py-14">
      <div className="space-y-8">
        <section className="section-frame grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_300px] lg:items-end">
          <div className="space-y-4">
            <span className="eyebrow">Journal</span>
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">SEO analysis, strategy, and practical thinking.</h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              The editorial side of the platform: perspective, frameworks, and case-driven insight from the same world the directory is curating.
            </p>
          </div>
          <div className="rounded-[28px] border border-primary/10 bg-primary p-6 text-primary-foreground shadow-[0_36px_70px_-42px_rgba(0,0,128,0.6)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Reading view</p>
            <p className="mt-3 text-3xl font-semibold">{posts.length}</p>
            <p className="mt-2 text-sm leading-7 text-white/80">Published entries across strategy, technical SEO, content, local, AI, and industry commentary.</p>
          </div>
        </section>

        {posts.length === 0 ? (
          <div className="section-frame text-center">
            <p className="font-display text-3xl font-semibold text-foreground">No journal entries are live yet.</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Published posts will appear here as soon as they are available.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <Card className="grid-accent h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/15">
                  <CardHeader className="space-y-4">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="space-y-3">
                      <CardTitle className="text-2xl leading-tight group-hover:text-primary">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-3 text-sm leading-7">{post.excerpt}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {asDate(post.publishedAt)?.toLocaleDateString() ?? "Pending"}
                      </span>
                    </div>
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full border border-border/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      Read article
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

