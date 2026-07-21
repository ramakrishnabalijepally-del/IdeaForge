"use client";

import { useEffect, useState } from "react";
import { Bookmark, Sparkles, Search, TrendingUp } from "lucide-react";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { IdeaGridSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import type { SavedIdea, AIGeneratedIdeaHistory, SearchHistoryItem, Idea } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "saved" | "generated" | "searches" | "recommended";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("saved");
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [generatedIdeas, setGeneratedIdeas] = useState<AIGeneratedIdeaHistory[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [recommended, setRecommended] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<SavedIdea[]>("/users/me/saved-ideas"),
      api.get<AIGeneratedIdeaHistory[]>("/ai/generate/history"),
      api.get<SearchHistoryItem[]>("/ai/search/history"),
      api.get<Idea[]>("/recommendations"),
    ]).then(([saved, gen, searches, recs]) => {
      setSavedIdeas(saved.data);
      setGeneratedIdeas(gen.data);
      setSearchHistory(searches.data);
      setRecommended(recs.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const TABS = [
    { id: "saved" as Tab, label: "Saved Ideas", count: savedIdeas.length, icon: Bookmark },
    { id: "generated" as Tab, label: "AI Generated", count: generatedIdeas.length, icon: Sparkles },
    { id: "searches" as Tab, label: "Search History", count: searchHistory.length, icon: Search },
    { id: "recommended" as Tab, label: "Recommended", count: recommended.length, icon: TrendingUp },
  ];

  if (authLoading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-text-primary mb-1">
          Welcome back, {user.full_name || user.email.split("@")[0]}
        </h1>
        <p className="text-text-secondary">Your personal idea dashboard.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {TABS.map((t) => (
          <div key={t.id} className="bg-surface-DEFAULT border border-surface-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold font-heading text-amber-400">{t.count}</p>
            <p className="text-xs text-text-muted mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-DEFAULT border border-surface-border rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
              tab === t.id ? "bg-amber-500 text-black" : "text-text-secondary hover:text-text-primary"
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <IdeaGridSkeleton count={6} />
      ) : (
        <>
          {tab === "saved" && (
            savedIdeas.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No saved ideas yet"
                description="Explore the database and bookmark ideas that interest you."
                action={{ label: "Explore ideas", href: "/explore" }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedIdeas.map((s) => (
                  <IdeaCard key={s.id} idea={{ ...s.idea, is_saved: true }}
                    onSaveToggle={(id, saved) => !saved && setSavedIdeas((prev) => prev.filter((x) => x.idea.id !== id))}
                  />
                ))}
              </div>
            )
          )}

          {tab === "generated" && (
            generatedIdeas.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No AI-generated ideas yet"
                description="Use the AI Idea Generator to create custom business idea reports."
                action={{ label: "Generate an idea", href: "/generate" }}
              />
            ) : (
              <div className="space-y-4">
                {generatedIdeas.map((g) => (
                  <div key={g.id} className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="violet" className="mb-2">AI Generated</Badge>
                        <h3 className="font-semibold font-heading text-text-primary">
                          {g.generated_report_json?.title || g.input_prompt}
                        </h3>
                        <p className="text-xs text-text-muted mt-1">Prompt: "{g.input_prompt}"</p>
                      </div>
                      <span className="text-xs text-text-muted shrink-0">{formatDate(g.created_at)}</span>
                    </div>
                    {g.generated_report_json?.feasibility_score && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                        <span>Feasibility: <span className="text-amber-400 font-medium">{g.generated_report_json.feasibility_score}/10</span></span>
                        <span>·</span>
                        <span>{g.generated_report_json.technical_difficulty} difficulty</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "searches" && (
            searchHistory.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No search history yet"
                description="Ask the AI Search questions about ideas to see your history here."
                action={{ label: "Try AI Search", href: "/search" }}
              />
            ) : (
              <div className="space-y-4">
                {searchHistory.map((h) => (
                  <div key={h.id} className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-medium text-text-primary">"{h.query}"</p>
                      <span className="text-xs text-text-muted shrink-0">{formatDate(h.created_at)}</span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">{h.answer}</p>
                    {h.sources?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(h.sources as { id: number; title: string }[]).map((s) => (
                          <Link key={s.id} href={`/explore/${s.id}`}>
                            <Badge variant="outline" className="text-xs hover:border-amber-500/40 cursor-pointer">{s.title}</Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "recommended" && (
            recommended.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No recommendations yet"
                description="Save some ideas to get personalized recommendations based on your interests."
                action={{ label: "Explore ideas", href: "/explore" }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
