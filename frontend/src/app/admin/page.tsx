"use client";

import { useEffect, useState } from "react";
import { Shield, Users, Lightbulb, Bookmark, Sparkles, Search, RotateCcw, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import type { Analytics, Idea, Category } from "@/types";
import toast from "react-hot-toast";

type Tab = "analytics" | "ideas" | "categories";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5">
      <div className={`w-8 h-8 rounded-lg bg-opacity-10 flex items-center justify-center mb-3 ${color.replace("text-", "bg-").replace("-400", "-500/10")}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`text-2xl font-bold font-heading ${color}`}>{value.toLocaleString()}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("analytics");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Partial<Idea> | null>(null);
  const [showIdeaForm, setShowIdeaForm] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ideasRes, categoriesRes] = await Promise.all([
        api.get<Analytics>("/admin/analytics"),
        api.get<{ items: Idea[] }>("/ideas?page_size=50"),
        api.get<Category[]>("/categories"),
      ]);
      setAnalytics(analyticsRes.data);
      setIdeas(ideasRes.data.items);
      setCategories(categoriesRes.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const { data } = await api.post<{ message: string }>("/admin/reindex");
      toast.success(data.message);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setReindexing(false);
    }
  };

  const handleDeleteIdea = async (id: number) => {
    if (!confirm("Delete this idea? This cannot be undone.")) return;
    try {
      await api.delete(`/ideas/${id}`);
      setIdeas((prev) => prev.filter((i) => i.id !== id));
      toast.success("Idea deleted.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleToggleIotd = async (idea: Idea) => {
    try {
      await api.put(`/ideas/${idea.id}`, { is_idea_of_the_day: !idea.is_idea_of_the_day });
      setIdeas((prev) => prev.map((i) => i.id === idea.id ? { ...i, is_idea_of_the_day: !i.is_idea_of_the_day } : i));
      toast.success(!idea.is_idea_of_the_day ? "Set as Idea of the Day!" : "Removed from Idea of the Day.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleSaveIdea = async (data: Partial<Idea>) => {
    try {
      if (data.id) {
        const { data: updated } = await api.put<Idea>(`/ideas/${data.id}`, data);
        setIdeas((prev) => prev.map((i) => i.id === updated.id ? updated : i));
        toast.success("Idea updated.");
      } else {
        const { data: created } = await api.post<Idea>("/ideas", { ...data, created_by_admin: true });
        setIdeas((prev) => [created, ...prev]);
        toast.success("Idea created.");
      }
      setShowIdeaForm(false);
      setEditingIdea(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (authLoading || !user || user.role !== "admin") return null;

  const TABS = [
    { id: "analytics" as Tab, label: "Analytics" },
    { id: "ideas" as Tab, label: `Ideas (${ideas.length})` },
    { id: "categories" as Tab, label: `Categories (${categories.length})` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-400" />
          <h1 className="text-3xl font-bold font-heading text-text-primary">Admin Panel</h1>
        </div>
        <Button variant="secondary" size="sm" loading={reindexing} onClick={handleReindex}>
          <RotateCcw className="w-3.5 h-3.5" /> Reindex Vector Store
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-DEFAULT border border-surface-border rounded-xl p-1 mb-6 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "bg-violet-500 text-white" : "text-text-secondary hover:text-text-primary"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Analytics */}
      {tab === "analytics" && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Users" value={analytics.total_users} icon={Users} color="text-amber-400" />
            <StatCard label="Total Ideas" value={analytics.total_ideas} icon={Lightbulb} color="text-amber-400" />
            <StatCard label="Total Saves" value={analytics.total_saved} icon={Bookmark} color="text-green-400" />
            <StatCard label="AI Generations" value={analytics.total_ai_generations} icon={Sparkles} color="text-violet-400" />
            <StatCard label="AI Searches" value={analytics.total_searches} icon={Search} color="text-violet-400" />
            <StatCard label="Contacts" value={analytics.total_contacts} icon={Users} color="text-text-secondary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5">
              <h3 className="font-semibold font-heading text-text-primary mb-4">Most Saved Categories</h3>
              <div className="space-y-3">
                {analytics.most_saved_categories.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-4">{i + 1}.</span>
                      <span className="text-sm text-text-secondary">{c.name}</span>
                    </div>
                    <Badge variant="amber">{c.save_count} saves</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface-DEFAULT border border-surface-border rounded-xl p-5">
              <h3 className="font-semibold font-heading text-text-primary mb-4">Ideas by Category</h3>
              <div className="space-y-3">
                {analytics.ideas_by_category.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-4">{i + 1}.</span>
                      <span className="text-sm text-text-secondary">{c.name}</span>
                    </div>
                    <Badge variant="outline">{c.idea_count} ideas</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ideas */}
      {tab === "ideas" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-text-muted">{ideas.length} ideas in database</p>
            <Button variant="primary" size="sm" onClick={() => { setEditingIdea({}); setShowIdeaForm(true); }}>
              <Plus className="w-3.5 h-3.5" /> Add Idea
            </Button>
          </div>

          {showIdeaForm && (
            <IdeaForm
              idea={editingIdea || {}}
              categories={categories}
              onSave={handleSaveIdea}
              onCancel={() => { setShowIdeaForm(false); setEditingIdea(null); }}
            />
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs text-text-muted">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Score</th>
                  <th className="pb-3 pr-4">Difficulty</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {ideas.map((idea) => (
                  <tr key={idea.id} className="group">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-medium">{idea.title}</span>
                        {idea.is_idea_of_the_day && <Star className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{idea.category?.name}</td>
                    <td className="py-3 pr-4 text-amber-400 font-medium">{idea.feasibility_score}/10</td>
                    <td className="py-3 pr-4">
                      <Badge variant={idea.technical_difficulty === "low" ? "green" : idea.technical_difficulty === "high" ? "red" : "amber"}>
                        {idea.technical_difficulty}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleToggleIotd(idea)}
                          className={`p-1.5 rounded hover:bg-surface-hover transition-colors ${idea.is_idea_of_the_day ? "text-amber-400" : "text-text-muted"}`}
                          title="Toggle Idea of the Day">
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditingIdea(idea); setShowIdeaForm(true); }}
                          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteIdea(idea.id)}
                          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories */}
      {tab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-surface-DEFAULT border border-surface-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={cat.type === "startup" ? "amber" : "violet"}>{cat.type}</Badge>
              </div>
              <p className="font-medium text-text-primary">{cat.name}</p>
              {cat.description && <p className="text-xs text-text-muted mt-1">{cat.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaForm({ idea, categories, onSave, onCancel }: {
  idea: Partial<Idea>;
  categories: Category[];
  onSave: (data: Partial<Idea>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Idea>>({
    title: "", problem_statement: "", solution: "", target_market: "",
    revenue_model: "", feasibility_score: 7.0, technical_difficulty: "medium",
    capital_required_range: "", tags: [], category_id: undefined,
    ...idea,
  });

  const set = (k: keyof Idea, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="bg-surface-DEFAULT border border-amber-500/30 rounded-xl p-5 mb-6 animate-slide-up">
      <h3 className="font-semibold font-heading text-text-primary mb-4">{idea.id ? "Edit Idea" : "Add New Idea"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Title" value={form.title || ""} onChange={(e) => set("title", e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Category</label>
          <select value={form.category_id || ""} onChange={(e) => set("category_id", +e.target.value)}
            className="w-full bg-background border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Textarea label="Problem Statement" value={form.problem_statement || ""} rows={3}
          onChange={(e) => set("problem_statement", e.target.value)} />
        <Textarea label="Solution" value={form.solution || ""} rows={3}
          onChange={(e) => set("solution", e.target.value)} />
        <Textarea label="Target Market" value={form.target_market || ""} rows={2}
          onChange={(e) => set("target_market", e.target.value)} />
        <Textarea label="Revenue Model" value={form.revenue_model || ""} rows={2}
          onChange={(e) => set("revenue_model", e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Feasibility Score (1-10)</label>
          <input type="number" min="1" max="10" step="0.1" value={form.feasibility_score || 7}
            onChange={(e) => set("feasibility_score", +e.target.value)}
            className="w-full bg-surface-DEFAULT border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Technical Difficulty</label>
          <select value={form.technical_difficulty || "medium"} onChange={(e) => set("technical_difficulty", e.target.value)}
            className="w-full bg-background border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/50">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <Input label="Capital Required Range" value={form.capital_required_range || ""}
          onChange={(e) => set("capital_required_range", e.target.value)} placeholder="e.g. $10,000 - $50,000" />
        <Input label="Tags (comma separated)" value={(form.tags || []).join(", ")}
          onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={() => onSave(form)}>
          {idea.id ? "Update" : "Create"} Idea
        </Button>
      </div>
    </div>
  );
}
