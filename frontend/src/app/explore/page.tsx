"use client";

import { useEffect, useState, useCallback } from "react";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { IdeaFiltersPanel } from "@/components/ideas/IdeaFilters";
import { IdeaGridSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import type { IdeaListResponse, IdeaFilters, Idea } from "@/types";
import { useSearchParams } from "next/navigation";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<IdeaListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IdeaFilters>({
    page: 1,
    category_id: searchParams.get("category_id") ? +searchParams.get("category_id")! : undefined,
  });

  const fetchIdeas = useCallback(async (f: IdeaFilters) => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined && v !== ""));
      const { data: result } = await api.get<IdeaListResponse>("/ideas", { params });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas(filters);
  }, [filters, fetchIdeas]);

  const handleSaveToggle = (id: number, saved: boolean) => {
    setData((prev) =>
      prev ? {
        ...prev,
        items: prev.items.map((idea) =>
          idea.id === id ? { ...idea, is_saved: saved } : idea
        ),
      } : prev
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-text-primary mb-2">Explore Ideas</h1>
        <p className="text-text-secondary">
          Browse {data?.total ?? "…"} curated startup and manufacturing business ideas.
        </p>
      </div>

      <div className="mb-8">
        <IdeaFiltersPanel filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <IdeaGridSkeleton count={12} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No ideas found"
          description="Try adjusting your filters or search term to find more ideas."
          action={{ label: "Clear filters", onClick: () => setFilters({ page: 1 }) }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.items.map((idea: Idea) => (
              <IdeaCard key={idea.id} idea={idea} onSaveToggle={handleSaveToggle} />
            ))}
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary" size="sm"
                disabled={filters.page === 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-text-secondary px-4">
                Page {data.page} of {data.total_pages}
              </span>
              <Button
                variant="secondary" size="sm"
                disabled={data.page >= data.total_pages}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
