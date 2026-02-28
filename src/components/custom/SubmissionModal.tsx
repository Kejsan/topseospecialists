"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPECIALTY_CATEGORIES, SpecialtyCategory } from "@/types/models";
import { initFirebase } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Plus, Loader2 } from "lucide-react";

export function SubmissionModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    contribution: "",
    website: "",
    social: "",
    category: "" as SpecialtyCategory | "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.contribution || !formData.category) return;

    setIsSubmitting(true);
    try {
      const { db, config } = await initFirebase();
      const pendingCollection = collection(db, `/artifacts/${config.appId}/public/data/pending-specialists`);
      
      await addDoc(pendingCollection, {
        ...formData,
        submittedAt: new Date(),
        status: "pending"
      });

      setOpen(false);
      setFormData({ name: "", role: "", contribution: "", website: "", social: "", category: "" });
      alert("Thank you! Your submission has been sent for review.");
    } catch (error) {
      console.error("Error submitting specialist:", error);
      alert("There was an error submitting your contribution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2 shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline-block">Join the List</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Contribute a Specialist</DialogTitle>
            <DialogDescription>
              Thank you for helping grow this resource! Please fill out the form below. All submissions are reviewed before being added to the list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Specialist's Name *</label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">Role / Company *</label>
              <Input
                id="role"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Founder at SEO Agency"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="contribution" className="text-sm font-medium">Key Contribution / Focus *</label>
              <Textarea
                id="contribution"
                required
                value={formData.contribution}
                onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                placeholder="Briefly describe what they are known for..."
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="website" className="text-sm font-medium">Website</label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="social" className="text-sm font-medium">Social Media</label>
                <Input
                  id="social"
                  type="url"
                  value={formData.social}
                  onChange={(e) => setFormData({ ...formData, social: e.target.value })}
                  placeholder="LinkedIn or Twitter URL"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">Specialty Category *</label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value as SpecialtyCategory })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit for Review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
