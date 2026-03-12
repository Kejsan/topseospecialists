"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Loader2, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initFirebase } from "@/lib/firebase";
import { BlogPost } from "@/types/models";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const { db } = await initFirebase();
        const postsRef = collection(db, "blog-posts");
        if (!slug) return;

        const blogQuery = query(postsRef, where("slug", "==", slug), where("status", "==", "published"));
        const snapshot = await getDocs(blogQuery);

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

  const contentBlocks = useMemo(() => post?.content.split("\n") ?? [], [post?.content]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <h1 className="text-4xl font-semibold">Post not found</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">The article you are looking for does not exist or is no longer published.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            Back to journal
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="container mx-auto max-w-5xl px-4 py-10 md:px-8 lg:py-14">
      <div className="space-y-8">
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            Back to journal
          </Link>
        </Button>

        <section className="section-frame grid-accent space-y-6">
          <Badge variant="secondary">{post.category}</Badge>
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold leading-tight text-foreground md:text-6xl">{post.title}</h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{post.excerpt}</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {post.publishedAt?.toDate
                ? post.publishedAt.toDate().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Pending publication"}
            </span>
          </div>
        </section>

        <section className="section-frame space-y-4">
          {contentBlocks.map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={index} className="h-2" />;
            if (trimmed.startsWith("### ")) return <h3 key={index} className="pt-3 text-2xl font-semibold">{trimmed.slice(4)}</h3>;
            if (trimmed.startsWith("## ")) return <h2 key={index} className="pt-6 text-3xl font-semibold">{trimmed.slice(3)}</h2>;
            if (trimmed.startsWith("# ")) return <h2 key={index} className="pt-6 text-4xl font-semibold">{trimmed.slice(2)}</h2>;
            if (trimmed.startsWith("- ")) {
              return (
                <div key={index} className="flex items-start gap-3 text-base leading-8 text-foreground/85">
                  <span className="mt-3 h-2 w-2 rounded-full bg-accent" />
                  <span>{trimmed.slice(2)}</span>
                </div>
              );
            }
            return <p key={index} className="text-base leading-8 text-foreground/85">{trimmed}</p>;
          })}
        </section>

        {post.tags?.length > 0 && (
          <div className="section-frame flex flex-wrap items-center gap-3">
            <Tag className="h-4 w-4 text-accent" />
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
