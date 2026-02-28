"use client";

import { useState, useEffect } from "react";
import { initFirebase } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { BlogPost } from "@/types/models";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, User, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const loadPosts = async () => {
      try {
        const { db, config } = await initFirebase();
        const postsRef = collection(db, "blog-posts");
        const q = query(postsRef, where("status", "==", "published"), orderBy("publishedAt", "desc"));

        unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
          setPosts(data);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error loading blog posts:", error);
        setLoading(false);
      }
    };

    loadPosts();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 lg:py-16 max-w-5xl space-y-10">
      {/* Hero */}
      <section className="text-center space-y-4 pb-8 border-b border-border/40">
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 rounded-full">
          Blog
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
          SEO Insights & Strategies
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Expert articles, case studies, and the latest trends in search engine optimization.
        </p>
      </section>

      {/* Post Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground">No blog posts published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 group-hover:border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.publishedAt?.toDate ? post.publishedAt.toDate().toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
