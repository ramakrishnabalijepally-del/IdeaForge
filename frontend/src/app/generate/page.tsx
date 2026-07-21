"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap, Clock, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { FeasibilityGauge } from "@/components/ui/FeasibilityGauge";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import type { GenerateIdeaResponse, DailyUsage } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

function GeneratingState() {
  const steps = ["Analyzing your niche…", "Researching market opportunities…", "Crafting your idea report…"];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-7 h-7 text-violet-400 animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold font-heading text-text-primary mb-2">AI is generating your idea…</h3>
      <p className="text-sm text-violet-400 animate-pulse">{steps[step]}</p>
      <div className="flex justify-center gap-1.5 mt-4">
        {steps.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === step ? "bg-violet-400 w-4" : "bg-surface-border"}`} />
        ))}
      </div>
    </div>
  );
}

function GeneratedReport({ result }: { result: GenerateIdeaResponse }) {
  const r = result.report;
  return (
    <div className="space-y-5 animate-slide-up">
      {result.from_cache && (
        <div className="flex items-center gap-2 text-sm text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4" />
          Retrieved from cache — identical prompt generated previously.
        </div>
      )}

      {/* Header Card */}
      <div className="bg-gradient-to-r from-violet-500/10 to-amber-500/10 border border-violet-500/30 rounded-2xl p-6">
        <Badge variant="violet" className="mb-3">AI Generated</Badge>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-heading text-text-primary mb-2">{r.title}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{r.technical_difficulty} difficulty</Badge>
              <Badge variant="outline">{r.estimated_capital}</Badge>
            </div>
          </div>
          <FeasibilityGauge score={r.feasibility_score} size="lg" />
        </div>
      </div>

      {/* Report sections */}
      {[
        { title: "Problem Statement", content: r.problem_statement },
        { title: "Proposed Solution", content: r.proposed_solution },
        { title: "Target Market", content: r.target_market },
        { title: "Revenue Model", content: r.revenue_model },
        { title: "Competitive Landscape", content: r.competitive_landscape },
      ].map(({ title, content }) => (
        <div key={title} className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5">
          <h3 className="font-semibold font-heading text-text-primary text-sm uppercase tracking-wide mb-3">{title}</h3>
          <p className="text-text-secondary leading-relaxed">{content}</p>
        </div>
      ))}

      {/* Execution Roadmap */}
      <div className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5">
        <h3 className="font-semibold font-heading text-text-primary text-sm uppercase tracking-wide mb-4">5-Step Execution Roadmap</h3>
        <div className="space-y-3">
          {r.execution_roadmap.map((step) => (
            <div key={step.step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0 mt-0.5">
                {step.step}
              </div>
              <div>
                <p className="font-medium text-text-primary text-sm">{step.title}</p>
                <p className="text-text-secondary text-sm mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {r.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {r.tags.map((tag) => <Badge key={tag} variant="violet">{tag}</Badge>)}
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateIdeaResponse | null>(null);
  const [usage, setUsage] = useState<DailyUsage | null>(null);

  useEffect(() => {
    if (user) {
      api.get<DailyUsage>("/ai/generate/usage")
        .then(({ data }) => setUsage(data))
        .catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post<GenerateIdeaResponse>("/ai/generate", { prompt: prompt.trim() });
      setResult(data);
      if (usage && !data.from_cache) {
        setUsage((u) => u ? { ...u, used: u.used + 1, remaining: Math.max(0, u.remaining - 1) } : u);
      }
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
          icon={Sparkles}
          title="Sign in to generate ideas"
          description="The AI Idea Generator is available to registered users. Sign up for free to generate unlimited ideas within your daily quota."
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
          <h1 className="text-3xl font-bold font-heading text-text-primary">AI Idea Generator</h1>
        </div>
        <p className="text-text-secondary">
          Enter an industry, niche, or keyword and Gemini will generate a complete structured business idea report.
        </p>
      </div>

      {/* Usage */}
      {usage && (
        <div className="flex items-center gap-3 bg-surface-DEFAULT border border-surface-border rounded-xl px-4 py-3 mb-6">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Daily generations used</span>
              <span>{usage.used}/{usage.limit}</span>
            </div>
            <div className="w-full bg-surface-border rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-amber-400 transition-all"
                style={{ width: `${(usage.used / usage.limit) * 100}%` }}
              />
            </div>
          </div>
          <span className={`text-xs font-medium ${usage.remaining === 0 ? "text-red-400" : "text-amber-400"}`}>
            {usage.remaining} left
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="bg-surface-DEFAULT border border-surface-border rounded-2xl p-5 space-y-4">
          <Input
            id="prompt"
            label="Industry, Niche, or Keyword"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. sustainable packaging, edtech, drone delivery, functional beverages…"
            disabled={loading}
          />
          <div className="flex flex-wrap gap-2">
            {["sustainable packaging", "AI for healthcare", "D2C food brand", "IoT for agriculture"].map((s) => (
              <button key={s} type="button" onClick={() => setPrompt(s)}
                className="px-2.5 py-1 text-xs bg-background border border-surface-border rounded-lg text-text-muted hover:text-amber-400 hover:border-amber-500/40 transition-colors">
                {s}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            variant="ai"
            size="lg"
            loading={loading}
            disabled={!prompt.trim() || usage?.remaining === 0}
            className="w-full"
          >
            <Sparkles className="w-4 h-4" /> Generate Idea Report
          </Button>
          {usage?.remaining === 0 && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Daily limit reached. Resets tomorrow.
            </p>
          )}
        </div>
      </form>

      {loading && <GeneratingState />}
      {result && !loading && <GeneratedReport result={result} />}

      {/* History link */}
      <div className="mt-8 text-center">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
          <Clock className="w-3.5 h-3.5" /> View your generation history <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
