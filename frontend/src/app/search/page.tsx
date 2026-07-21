"use client";

import { useState } from "react";
import { Search, Sparkles, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import type { AISearchResponse } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

const EXAMPLE_QUERIES = [
  "What manufacturing ideas need under $10k capital?",
  "Which startup ideas have the highest feasibility score?",
  "What agri-tech ideas can I start with low technical difficulty?",
  "Show me sustainable business ideas in food production.",
];

export default function AISearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AISearchResponse[]>([]);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    try {
      const { data } = await api.post<AISearchResponse>("/ai/search", { query: q.trim() });
      setResults((prev) => [data, ...prev]);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon={Search}
          title="Sign in to use AI Search"
          description="Ask natural-language questions about the idea database. Powered by RAG and Gemini AI. Available to registered users."
          action={{ label: "Sign up free", href: "/signup" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h1 className="text-3xl font-bold font-heading text-text-primary">AI Search</h1>
        </div>
        <p className="text-text-secondary">
          Ask natural-language questions about the idea database. Answers are grounded in real ideas with citations.
        </p>
      </div>

      {/* Input */}
      <div className="bg-surface-DEFAULT border border-surface-border rounded-2xl p-5 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch(query)}
              placeholder="e.g. What ideas need under $10k capital?"
              className="w-full bg-background border border-surface-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
            />
          </div>
          <Button variant="ai" onClick={() => handleSearch(query)} loading={loading} disabled={!query.trim()}>
            Ask
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {EXAMPLE_QUERIES.map((q) => (
            <button key={q} onClick={() => handleSearch(q)}
              className="px-2.5 py-1 text-xs bg-background border border-surface-border rounded-lg text-text-muted hover:text-violet-400 hover:border-violet-500/40 transition-colors text-left">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-6 text-center animate-pulse">
          <Sparkles className="w-6 h-6 text-violet-400 mx-auto mb-2" />
          <p className="text-sm text-violet-400">Searching idea database…</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {results.map((result) => (
          <div key={result.id} className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5 animate-slide-up">
            <div className="flex items-start gap-2 mb-3">
              <Badge variant="violet">AI Answer</Badge>
              <span className="text-xs text-text-muted ml-auto">{formatDate(result.created_at)}</span>
            </div>
            <p className="text-xs text-text-muted mb-2 font-medium">Q: {result.query}</p>
            <p className="text-text-secondary leading-relaxed mb-4">{result.answer}</p>

            {result.sources.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Sources from idea database</p>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((s) => (
                    <Link key={s.id} href={`/explore/${s.id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border border-surface-border rounded-lg text-xs text-text-secondary hover:text-amber-400 hover:border-amber-500/30 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      {s.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {results.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="flex items-center gap-2 justify-center text-sm text-text-muted">
              <Clock className="w-4 h-4" />
              Your search history will appear here. Try asking a question above.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
