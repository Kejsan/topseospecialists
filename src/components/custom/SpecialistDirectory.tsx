"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FilterX, ArrowUpRight } from "lucide-react";
import { Specialist, SpecialtyCategory, SPECIALTY_CATEGORIES } from "@/types/models";
import { asDate } from "@/lib/date";
import { SpecialistCard } from "./SpecialistCard";
import { StatsCharts } from "./StatsCharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SpecialistDirectoryProps {
  initialData: Specialist[];
}

export function SpecialistDirectory({ initialData }: SpecialistDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SpecialtyCategory | "All">("All");
  const [sortBy, setSortBy] = useState<"newest" | "name-asc" | "name-desc">("newest");

  const categories: (SpecialtyCategory | "All")[] = ["All", ...SPECIALTY_CATEGORIES];

  const filteredAndSortedSpecialists = useMemo(() => {
    const result = initialData.filter((specialist) => {
      const haystack = [
        specialist.name,
        specialist.role,
        specialist.contribution,
        specialist.summary || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || specialist.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "newest") {
        const dateA = asDate(a.createdAt) || new Date(0);
        const dateB = asDate(b.createdAt) || new Date(0);
        return Number(dateB) - Number(dateA);
      }
      return 0;
    });
  }, [initialData, searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("newest");
  };

  return (
    <div className="space-y-8" id="directory">
      <StatsCharts specialists={filteredAndSortedSpecialists} />

      <section className="section-frame grid-accent space-y-6" aria-labelledby="directory-heading">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Directory controls</span>
            <div className="space-y-2">
              <h2 id="directory-heading" className="text-3xl font-semibold text-foreground md:text-4xl">Filter by specialty, role, or signal.</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Search practitioners by expertise and quickly narrow the field without losing the editorial feel of the directory.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary">{initialData.length} total profiles</Badge>
            <Badge variant="outline">{filteredAndSortedSpecialists.length} in view</Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_220px_52px]">
          <div className="relative">
            <label htmlFor="directory-search" className="sr-only">
              Search specialists
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="directory-search"
              placeholder="Search names, roles, specialties, and contributions"
              className="h-14 pl-12 text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="directory-sort" className="sr-only">
              Sort specialists
            </label>
            <select
              id="directory-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "name-asc" | "name-desc")}
              className="h-14 rounded-2xl border border-border bg-white/85 px-4 text-sm font-medium text-foreground shadow-[0_10px_28px_-20px_rgba(16,32,63,0.45)] outline-none focus:ring-4 focus:ring-ring"
            >
              <option value="newest">Newest first</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
          <Button
            variant="outline"
            size="icon-lg"
            className="sm:justify-self-start lg:justify-self-auto"
            onClick={clearFilters}
            disabled={!searchQuery && selectedCategory === "All" && sortBy === "newest"}
            aria-label="Clear filters"
          >
            <FilterX className="h-4 w-4" />
          </Button>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-foreground">Filter by specialty</legend>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_16px_30px_-24px_rgba(0,0,128,0.95)]"
                    : "border-border bg-white/80 text-foreground hover:border-accent/40 hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      {filteredAndSortedSpecialists.length === 0 ? (
        <div className="section-frame text-center">
          <p className="font-display text-3xl font-semibold text-foreground">No specialists match this filter combination.</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            Reset the filters to return to the full directory, or broaden your search terms to explore adjacent expertise.
          </p>
          <Button className="mt-6" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div aria-live="polite" className="sr-only">
            Showing {filteredAndSortedSpecialists.length} specialists
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedSpecialists.map((specialist) => (
                <motion.div
                  key={specialist.id || specialist.name}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.22 }}
                >
                  <SpecialistCard specialist={specialist} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      <div className="flex justify-center">
        <Button asChild variant="ghost" className="text-primary">
          <a href="#faq">
            Browse FAQs
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
