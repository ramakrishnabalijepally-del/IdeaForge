"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck, TrendingUp, Target, DollarSign, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FeasibilityGauge } from "@/components/ui/FeasibilityGauge";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getDifficultyColor } from "@/lib/utils";
import type { Idea } from "@/types";
import toast from "react-hot-toast";

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [related, setRelated] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Idea>(`/ideas/${id}`),
      api.get<Idea[]>(`/ideas/${id}/related`),
    ]).then(([ideaRes, relatedRes]) => {
      setIdea(ideaRes.data);
      setRelated(relatedRes.data);
    }).catch(() => router.push("/explore"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSaveToggle = async () => {
    if (!user) { toast.error("Please log in to save ideas."); return; }
    if (!idea) return;
    setSaving(true);
    try {
      if (idea.is_saved) {
        await api.delete(`/users/me/saved-ideas/${idea.id}`);
        setIdea((prev) => prev ? { ...prev, is_saved: false } : prev);
        toast.success("Removed from saved ideas.");
      } else {
        await api.post(`/users/me/saved-ideas/${idea.id}`);
        setIdea((prev) => prev ? { ...prev, is_saved: true } : prev);
        toast.success("Idea saved!");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!idea) return null;

  const difficultyVariant = idea.technical_difficulty === "low" ? "green" : idea.technical_difficulty === "high" ? "red" : "amber";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline">{idea.category.name}</Badge>
            <Badge variant={difficultyVariant}>{idea.technical_difficulty} difficulty</Badge>
            {idea.is_idea_of_the_day && <Badge variant="amber">⭐ Idea of the Day</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary mb-2">{idea.title}</h1>
          <p className="text-text-muted text-sm">{idea.capital_required_range} capital required</p>
        </div>
        <div className="flex flex-col items-center gap-3 shrink-0">
          <FeasibilityGauge score={idea.feasibility_score} size="lg" />
          <Button
            variant={idea.is_saved ? "secondary" : "primary"}
            size="sm"
            loading={saving}
            onClick={handleSaveToggle}
          >
            {idea.is_saved ? <><BookmarkCheck className="w-4 h-4" /> Saved</> : <><Bookmark className="w-4 h-4" /> Save Idea</>}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-6">
        {[
          { icon: BarChart3, title: "Problem Statement", content: idea.problem_statement },
          { icon: TrendingUp, title: "Proposed Solution", content: idea.solution },
          { icon: Target, title: "Target Market", content: idea.target_market },
          { icon: DollarSign, title: "Revenue Model", content: idea.revenue_model },
        ].map(({ icon: Icon, title, content }) => (
          <div key={title} className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-amber-400" />
              <h2 className="font-semibold font-heading text-text-primary text-sm uppercase tracking-wide">{title}</h2>
            </div>
            <p className="text-text-secondary leading-relaxed">{content}</p>
          </div>
        ))}

        {/* Tags */}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Related Ideas */}
      {related.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-bold font-heading text-text-primary">Related Ideas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((r) => <IdeaCard key={r.id} idea={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
