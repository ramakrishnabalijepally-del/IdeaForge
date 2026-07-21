"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FeasibilityGauge } from "@/components/ui/FeasibilityGauge";
import { getDifficultyColor, truncate } from "@/lib/utils";
import type { Idea } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { api, getErrorMessage } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";

interface IdeaCardProps {
  idea: Idea;
  onSaveToggle?: (id: number, saved: boolean) => void;
}

export function IdeaCard({ idea, onSaveToggle }: IdeaCardProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(idea.is_saved);
  const [saving, setSaving] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to save ideas.");
      return;
    }
    setSaving(true);
    try {
      if (saved) {
        await api.delete(`/users/me/saved-ideas/${idea.id}`);
        setSaved(false);
        onSaveToggle?.(idea.id, false);
        toast.success("Removed from saved ideas.");
      } else {
        await api.post(`/users/me/saved-ideas/${idea.id}`);
        setSaved(true);
        onSaveToggle?.(idea.id, true);
        toast.success("Idea saved!");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link href={`/explore/${idea.id}`} className="block group">
      <div className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5 h-full flex flex-col gap-3 hover:border-amber-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="outline">{idea.category.name}</Badge>
              {idea.is_idea_of_the_day && <Badge variant="amber">⭐ Idea of the Day</Badge>}
            </div>
            <h3 className="font-semibold text-text-primary font-heading text-base leading-snug group-hover:text-amber-400 transition-colors">
              {idea.title}
            </h3>
          </div>
          <FeasibilityGauge score={idea.feasibility_score} size="sm" showLabel={false} />
        </div>

        {/* Problem */}
        <p className="text-sm text-text-secondary leading-relaxed flex-1">
          {truncate(idea.problem_statement, 120)}
        </p>

        {/* Tags */}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {idea.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-border">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className={getDifficultyColor(idea.technical_difficulty)}>
              {idea.technical_difficulty} difficulty
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {idea.capital_required_range}
            </span>
          </div>
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-amber-400 transition-colors"
            aria-label={saved ? "Unsave idea" : "Save idea"}
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4 text-amber-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
