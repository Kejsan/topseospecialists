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

  const categories: (SpecialtyCategory | "All")[] = ["All", ...SPECIALTY_CATEGORIES];

  const filteredSpecialists = useMemo(() => {
    return initialData.filter((specialist) => {
      const matchesSearch =
        specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specialist.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specialist.contribution.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || specialist.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [initialData, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col gap-6 p-6 rounded-2xl bg-card border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or keywords..."
            className="pl-10 h-12 text-lg rounded-xl border-muted-foreground/20 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
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
          {(searchQuery || selectedCategory !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="ml-auto h-8 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
            >
              Clear filters
              <FilterX className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <StatsCharts specialists={filteredSpecialists} />

      {/* Results summary */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-medium text-muted-foreground">
          Showing <span className="text-foreground">{filteredSpecialists.length}</span> specialists
        </p>
      </div>

      {/* Grid */}
      {filteredSpecialists.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSpecialists.map((specialist) => (
              <motion.div
                key={specialist.id || specialist.name}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SpecialistCard specialist={specialist} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-2xl border border-dashed bg-muted/30">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No specialists found</h3>
          <p className="text-muted-foreground max-w-sm">
            We couldn't find any specialists matching your criteria. Try adjusting your search or category filters.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          >
            Reset all filters
          </Button>
        </div>
      )}
    </div>
  );
}
