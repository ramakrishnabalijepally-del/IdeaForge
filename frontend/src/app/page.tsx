"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Search, ArrowRight, Zap, Database, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { IdeaCardSkeleton } from "@/components/ui/Skeleton";
import { FeasibilityGauge } from "@/components/ui/FeasibilityGauge";
import { api } from "@/lib/api";
import type { Idea, Category } from "@/types";

export default function HomePage() {
  const [ideaOfDay, setIdeaOfDay] = useState<Idea | null>(null);
  const [featuredIdeas, setFeaturedIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Idea>("/ideas/idea-of-the-day").catch(() => ({ data: null })),
      api.get<{ items: Idea[] }>("/ideas?page_size=6").catch(() => ({ data: { items: [] } })),
      api.get<Category[]>("/categories").catch(() => ({ data: [] })),
    ]).then(([iotd, ideas, cats]) => {
      setIdeaOfDay(iotd.data);
      setFeaturedIdeas((ideas.data as { items: Idea[] }).items || []);
      setCategories((cats.data as Category[]) || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge variant="amber" className="mb-6 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Powered by Gemini AI
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-text-primary mb-6 leading-tight">
            Turn Your Curiosity Into a{" "}
            <span className="text-amber-400">Business Idea</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse 25+ validated startup and manufacturing ideas, generate custom AI-powered idea reports,
            or ask natural-language questions about the entire idea database.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/explore">
              <Button variant="primary" size="lg">
                Explore Ideas <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/generate">
              <Button variant="ai" size="lg">
                <Sparkles className="w-4 h-4" /> Generate with AI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Idea of the Day */}
      {(loading || ideaOfDay) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-heading text-text-primary">Idea of the Day</h2>
          </div>
          {loading ? (
            <div className="bg-surface-DEFAULT border border-surface-border rounded-2xl p-6 animate-pulse h-40" />
          ) : ideaOfDay && (
            <Link href={`/explore/${ideaOfDay.id}`}>
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-200 group">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <Badge variant="amber" className="mb-3">⭐ Today's Featured Idea</Badge>
                    <h3 className="text-xl font-bold font-heading text-text-primary group-hover:text-amber-400 transition-colors mb-2">
                      {ideaOfDay.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {ideaOfDay.problem_statement.slice(0, 200)}…
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline">{ideaOfDay.category.name}</Badge>
                      <Badge variant="outline">{ideaOfDay.capital_required_range}</Badge>
                      <Badge
                        variant={ideaOfDay.technical_difficulty === "low" ? "green" : ideaOfDay.technical_difficulty === "high" ? "red" : "amber"}
                      >
                        {ideaOfDay.technical_difficulty} difficulty
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <FeasibilityGauge score={ideaOfDay.feasibility_score} size="lg" />
                    <Button variant="primary" size="md" className="hidden lg:flex">
                      View Idea <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Database, color: "text-amber-400", bg: "bg-amber-500/10",
              title: "Curated Idea Database",
              desc: "25+ validated startup and manufacturing ideas across 8 categories, each with feasibility scores, capital ranges, and detailed reports.",
              href: "/explore", cta: "Browse Ideas",
            },
            {
              icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/10",
              title: "AI Idea Generator",
              desc: "Enter any niche or keyword and Gemini generates a full structured business idea report — problem, solution, market, revenue model, and 5-step roadmap.",
              href: "/generate", cta: "Generate Idea",
            },
            {
              icon: Search, color: "text-violet-400", bg: "bg-violet-500/10",
              title: "RAG-Powered AI Search",
              desc: "Ask natural-language questions like 'What manufacturing ideas need under $10k?' and get cited answers from the idea database.",
              href: "/search", cta: "Try AI Search",
            },
          ].map((f) => (
            <div key={f.title} className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold font-heading text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{f.desc}</p>
              <Link href={f.href}>
                <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 px-0">
                  {f.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Ideas Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-heading text-text-primary">Latest Ideas</h2>
          </div>
          <Link href="/explore">
            <Button variant="ghost" size="sm">View all <ArrowRight className="w-3.5 h-3.5" /></Button>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <IdeaCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-heading text-text-primary">Browse by Category</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/explore?category_id=${cat.id}`}>
                <div className="px-4 py-2 bg-surface-DEFAULT border border-surface-border rounded-lg text-sm text-text-secondary hover:text-amber-400 hover:border-amber-500/40 transition-all duration-200 cursor-pointer">
                  <span className="mr-2">{cat.type === "startup" ? "🚀" : "🏭"}</span>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-r from-violet-500/10 to-amber-500/10 border border-surface-border rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold font-heading text-text-primary mb-3">
            Have a niche in mind?
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Let Gemini AI generate a complete business idea report tailored to your industry in seconds.
          </p>
          <Link href="/generate">
            <Button variant="ai" size="lg">
              <Sparkles className="w-4 h-4" /> Generate Your Idea Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
