"use client";

import { useState, useMemo } from "react";
import { Specialist, SpecialtyCategory, SPECIALTY_CATEGORIES } from "@/types/models";
import { SpecialistCard } from "./SpecialistCard";
import { StatsCharts } from "./StatsCharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FilterX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpecialistDirectoryProps {
  initialData: Specialist[];
}

export function SpecialistDirectory({ initialData }: SpecialistDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SpecialtyCategory | "All">("All");
  const [sortBy, setSortBy] = useState<"newest" | "name-asc" | "name-desc">("newest");

  const categories: (SpecialtyCategory | "All")[] = ["All", ...SPECIALTY_CATEGORIES];

  const filteredAndSortedSpecialists = useMemo(() => {
    let result = initialData.filter((specialist) => {
      const matchesSearch =
        specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specialist.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specialist.contribution.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || specialist.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "newest") {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt as any) || 0;
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt as any) || 0;
        return (dateB as any) - (dateA as any);
      }
      return 0;
    });
  }, [initialData, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-8">
      {/* 1. Specialty Categories Top */}
      <div className="flex flex-wrap gap-2 justify-center py-4">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer px-4 py-1.5 text-sm transition-all hover:scale-105 active:scale-95 ${
              selectedCategory !== category ? "hover:bg-primary/10 hover:text-primary" : "shadow-md"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* 2. Search and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 p-6 rounded-2xl bg-card border shadow-sm items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or keywords..."
            className="pl-10 h-12 text-lg rounded-xl border-muted-foreground/20 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-12 px-4 rounded-xl border border-muted-foreground/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[140px]"
          >
            <option value="newest">Newest First</option>
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
          </select>

          {(searchQuery || selectedCategory !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSortBy("newest");
              }}
              className="h-12 px-4 text-muted-foreground hover:text-foreground border rounded-xl"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <StatsCharts specialists={filteredAndSortedSpecialists} />

      {filteredAndSortedSpecialists.length === 0 ? (
        <div className="text-center py-20 grayscale opacity-60">
          <p className="text-xl text-muted-foreground">No specialists found matching your criteria.</p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSortBy("newest");
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedSpecialists.map((specialist: Specialist) => (
              <motion.div
                key={specialist.id || specialist.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <SpecialistCard specialist={specialist} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
