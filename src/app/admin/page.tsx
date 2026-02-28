"use client";

import { useState, useEffect } from "react";
import { initFirebase } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, setDoc, updateDoc, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { Specialist, BlogPost } from "@/types/models";
// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, LogOut, Check, X, Sparkles, Trash2, CheckCheck, Eye, EyeOff, FileText, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BulkImportModal } from "@/components/custom/BulkImportModal";
import { CreateBlogPostModal } from "@/components/custom/CreateBlogPostModal";
import { BulkBlogImportModal } from "@/components/custom/BulkBlogImportModal";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pending, setPending] = useState<Specialist[]>([]);
  const [approved, setApproved] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());
  const [selectedApproved, setSelectedApproved] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let unsubscribePending: () => void;
    let unsubscribeApproved: () => void;
    let unsubscribeBlog: () => void;

    const loadData = async () => {
      try {
        const { db, config } = await initFirebase();
        const baseCollectionPath = `/artifacts/${config.appId}/public/data/`;

        const qPending = query(collection(db, `${baseCollectionPath}pending-specialists`), orderBy("submittedAt", "desc"));
        unsubscribePending = onSnapshot(qPending, (snapshot) => {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Specialist));
          setPending(data);
        });

        const qApproved = query(collection(db, `${baseCollectionPath}specialists`), orderBy("createdAt", "desc"));
        unsubscribeApproved = onSnapshot(qApproved, (snapshot) => {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Specialist));
          setApproved(data);
          setLoading(false);
        });

        // Listen to blog posts
        const qBlog = query(collection(db, `${baseCollectionPath}blog-posts`), orderBy("createdAt", "desc"));
        unsubscribeBlog = onSnapshot(qBlog, (snapshot) => {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
          setBlogPosts(data);
        });

      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    if (user) loadData();

    return () => {
      if (unsubscribePending) unsubscribePending();
      if (unsubscribeApproved) unsubscribeApproved();
      if (unsubscribeBlog) unsubscribeBlog();
    };
  }, [user]);

  const handleLogout = async () => {
    const { auth } = await initFirebase();
    await signOut(auth);
  };

  // ── Single Actions ──

  const approveSpecialist = async (specialist: Specialist) => {
    if (!specialist.id) return;
    setIsProcessing(specialist.id);
    try {
      const { db, config } = await initFirebase();
      const base = `/artifacts/${config.appId}/public/data/`;
      const { id, submittedAt, status, ...data } = specialist as any;
      await setDoc(doc(db, `${base}specialists`, id), { ...data, createdAt: new Date(), updatedAt: new Date() });
      await deleteDoc(doc(db, `${base}pending-specialists`, id));
    } catch (error) {
      console.error("Failed to approve:", error);
      alert("Failed to approve specialist.");
    } finally {
      setIsProcessing(null);
    }
  };

  const rejectSpecialist = async (id: string, isPending: boolean) => {
    if (!confirm("Are you sure you want to delete this profile?")) return;
    setIsProcessing(id);
    try {
      const { db, config } = await initFirebase();
      const col = isPending ? "pending-specialists" : "specialists";
      await deleteDoc(doc(db, `/artifacts/${config.appId}/public/data/${col}`, id));
    } catch (error) {
      console.error("Failed to reject/delete:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const enrichProfile = async (id: string) => {
    setIsProcessing(`enrich-${id}`);
    try {
      const { functions, config } = await initFirebase();
      const enrichSpecialist = httpsCallable(functions, "enrichSpecialist");
      await enrichSpecialist({ appId: config.appId, specialistId: id });
      alert("Profile enriched successfully!");
    } catch (error) {
      console.error("Failed to enrich:", error);
      alert("Failed to enrich profile.");
    } finally {
      setIsProcessing(null);
    }
  };

  // ── Bulk Actions ──

  const togglePendingSelection = (id: string) => {
    setSelectedPending(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleApprovedSelection = (id: string) => {
    setSelectedApproved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllPending = () => {
    if (selectedPending.size === pending.length) {
      setSelectedPending(new Set());
    } else {
      setSelectedPending(new Set(pending.map(s => s.id!)));
    }
  };

  const selectAllApproved = () => {
    if (selectedApproved.size === approved.length) {
      setSelectedApproved(new Set());
    } else {
      setSelectedApproved(new Set(approved.map(s => s.id!)));
    }
  };

  const bulkApprove = async () => {
    if (selectedPending.size === 0) return;
    if (!confirm(`Approve ${selectedPending.size} specialist(s)?`)) return;
    setIsBulkProcessing(true);
    try {
      const { db, config } = await initFirebase();
      const base = `/artifacts/${config.appId}/public/data/`;
      const toApprove = pending.filter(s => selectedPending.has(s.id!));

      for (const specialist of toApprove) {
        const { id, submittedAt, status, ...data } = specialist as any;
        await setDoc(doc(db, `${base}specialists`, id), { ...data, createdAt: new Date(), updatedAt: new Date() });
        await deleteDoc(doc(db, `${base}pending-specialists`, id));
      }
      setSelectedPending(new Set());
    } catch (error) {
      console.error("Bulk approve failed:", error);
      alert("Some approvals may have failed.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const bulkReject = async (isPending: boolean) => {
    const selected = isPending ? selectedPending : selectedApproved;
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} specialist(s)?`)) return;
    setIsBulkProcessing(true);
    try {
      const { db, config } = await initFirebase();
      const col = isPending ? "pending-specialists" : "specialists";
      for (const id of selected) {
        await deleteDoc(doc(db, `/artifacts/${config.appId}/public/data/${col}`, id));
      }
      if (isPending) setSelectedPending(new Set());
      else setSelectedApproved(new Set());
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Some deletions may have failed.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // ── Rendering ──

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderCard = (spec: Specialist, isPending: boolean) => {
    const selected = isPending ? selectedPending : selectedApproved;
    const toggle = isPending ? togglePendingSelection : toggleApprovedSelection;
    const isSelected = selected.has(spec.id!);

    return (
      <Card key={spec.id} className={`relative overflow-hidden group transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggle(spec.id!)}
                className="mt-1"
              />
              <div>
                <CardTitle className="text-base">{spec.name}</CardTitle>
                <CardDescription className="mt-1">{spec.role}</CardDescription>
              </div>
            </div>
            <Badge variant={isPending ? "secondary" : "default"}>
              {spec.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-foreground/80 line-clamp-3 mb-4 min-h-[48px]">
            {spec.summary || spec.contribution}
          </p>
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {isPending ? (
              <>
                <Button size="sm" onClick={() => approveSpecialist(spec)} disabled={!!isProcessing || isBulkProcessing}>
                  {isProcessing === spec.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => rejectSpecialist(spec.id!, true)} disabled={!!isProcessing || isBulkProcessing}>
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => enrichProfile(spec.id!)} disabled={!!isProcessing || isBulkProcessing} variant="secondary">
                  {isProcessing === `enrich-${spec.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />}
                  AI Enrich
                </Button>
                <Button size="sm" variant="destructive" onClick={() => rejectSpecialist(spec.id!, false)} disabled={!!isProcessing || isBulkProcessing}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ── Blog Actions ──

  const toggleBlogStatus = async (post: BlogPost) => {
    if (!post.id) return;
    setIsProcessing(`blog-${post.id}`);
    try {
      const { db, config } = await initFirebase();
      const newStatus = post.status === "published" ? "draft" : "published";
      await updateDoc(doc(db, `/artifacts/${config.appId}/public/data/blog-posts`, post.id), {
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === "published" ? { publishedAt: new Date() } : {}),
      });
    } catch (error) {
      console.error("Failed to toggle blog status:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    setIsProcessing(`blog-del-${id}`);
    try {
      const { db, config } = await initFirebase();
      await deleteDoc(doc(db, `/artifacts/${config.appId}/public/data/blog-posts`, id));
    } catch (error) {
      console.error("Failed to delete blog post:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const renderBlogCard = (post: BlogPost) => (
    <Card key={post.id} className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{post.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <span>{post.author}</span>
              <span>·</span>
              <span>{post.category}</span>
            </CardDescription>
          </div>
          <Badge variant={post.status === "published" ? "default" : "secondary"}>
            {post.status === "published" ? "Live" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-foreground/80 line-clamp-2 mb-4 min-h-[40px]">{post.excerpt}</p>
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          <Button size="sm" variant={post.status === "published" ? "secondary" : "default"}
            onClick={() => toggleBlogStatus(post)} disabled={!!isProcessing}>
            {isProcessing === `blog-${post.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> :
             post.status === "published" ? <><EyeOff className="h-4 w-4 mr-1" />Unpublish</> : <><Eye className="h-4 w-4 mr-1" />Publish</>}
          </Button>
          <Button size="sm" variant="destructive" onClick={() => deleteBlogPost(post.id!)} disabled={!!isProcessing}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage specialists, blog posts, and submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkImportModal />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="blog" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Blog ({blogPosts.length})</TabsTrigger>
        </TabsList>

        {/* ── Pending Tab ── */}
        <TabsContent value="pending" className="mt-6 space-y-4">
          {pending.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
              <Checkbox
                checked={selectedPending.size === pending.length && pending.length > 0}
                onCheckedChange={selectAllPending}
              />
              <span className="text-sm text-muted-foreground">
                {selectedPending.size > 0 ? `${selectedPending.size} selected` : "Select all"}
              </span>
              {selectedPending.size > 0 && (
                <div className="flex gap-2 ml-auto">
                  <Button size="sm" onClick={bulkApprove} disabled={isBulkProcessing}>
                    {isBulkProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCheck className="h-4 w-4 mr-1" />}
                    Bulk Approve ({selectedPending.size})
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => bulkReject(true)} disabled={isBulkProcessing}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedPending.size})
                  </Button>
                </div>
              )}
            </div>
          )}
          {pending.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No pending submissions.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pending.map(s => renderCard(s, true))}
            </div>
          )}
        </TabsContent>

        {/* ── Approved Tab ── */}
        <TabsContent value="approved" className="mt-6 space-y-4">
          {approved.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
              <Checkbox
                checked={selectedApproved.size === approved.length && approved.length > 0}
                onCheckedChange={selectAllApproved}
              />
              <span className="text-sm text-muted-foreground">
                {selectedApproved.size > 0 ? `${selectedApproved.size} selected` : "Select all"}
              </span>
              {selectedApproved.size > 0 && (
                <div className="flex gap-2 ml-auto">
                  <Button size="sm" variant="destructive" onClick={() => bulkReject(false)} disabled={isBulkProcessing}>
                    {isBulkProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                    Bulk Delete ({selectedApproved.size})
                  </Button>
                </div>
              )}
            </div>
          )}
          {approved.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No approved specialists yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {approved.map(s => renderCard(s, false))}
            </div>
          )}
        </TabsContent>

        {/* ── Blog Tab ── */}
        <TabsContent value="blog" className="mt-6 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border">
            <CreateBlogPostModal />
            <BulkBlogImportModal />
            <span className="text-xs text-muted-foreground ml-auto">
              {blogPosts.filter(p => p.status === "published").length} published · {blogPosts.filter(p => p.status === "draft").length} drafts
            </span>
          </div>
          {blogPosts.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No blog posts yet. Create one or bulk import!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map(p => renderBlogCard(p))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
