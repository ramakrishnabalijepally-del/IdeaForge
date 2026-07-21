"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Category, IdeaFilters } from "@/types";

interface IdeaFiltersProps {
  filters: IdeaFilters;
  onChange: (filters: IdeaFilters) => void;
}

export function IdeaFiltersPanel({ filters, onChange }: IdeaFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get<Category[]>("/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...filters, search: localSearch, page: 1 });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onChange({ page: 1 });
  };

  const hasActiveFilters = filters.category_id || filters.difficulty || filters.min_feasibility || filters.max_feasibility;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search ideas..."
            icon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" variant="secondary" size="md" className="shrink-0">Search</Button>
        </form>
        <Button
          type="button"
          variant={showFilters ? "primary" : "secondary"}
          size="md"
          className="shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-surface-DEFAULT border border-surface-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Category</label>
            <select
              value={filters.category_id || ""}
              onChange={(e) => onChange({ ...filters, category_id: e.target.value ? +e.target.value : undefined, page: 1 })}
              className="w-full bg-background border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Difficulty</label>
            <select
              value={filters.difficulty || ""}
              onChange={(e) => onChange({ ...filters, difficulty: e.target.value || undefined, page: 1 })}
              className="w-full bg-background border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">Any difficulty</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Min Feasibility</label>
            <input
              type="range" min="1" max="10" step="0.5"
              value={filters.min_feasibility || 1}
              onChange={(e) => onChange({ ...filters, min_feasibility: +e.target.value, page: 1 })}
              className="w-full accent-amber-500"
            />
            <span className="text-xs text-text-muted">{filters.min_feasibility || 1}/10</span>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                <X className="w-3.5 h-3.5" /> Clear filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
