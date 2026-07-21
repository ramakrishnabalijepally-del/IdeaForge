export type UserRole = "guest" | "user" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
  type: "startup" | "manufacturing";
  description: string | null;
}

export interface Idea {
  id: number;
  title: string;
  category_id: number;
  category: Category;
  problem_statement: string;
  solution: string;
  target_market: string;
  revenue_model: string;
  feasibility_score: number;
  technical_difficulty: "low" | "medium" | "high";
  capital_required_range: string;
  tags: string[];
  is_idea_of_the_day: boolean;
  created_by_admin: boolean;
  created_at: string;
  is_saved: boolean;
}

export interface IdeaListResponse {
  items: Idea[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SavedIdea {
  id: number;
  idea: Idea;
  saved_at: string;
}

export interface ExecutionStep {
  step: number;
  title: string;
  description: string;
}

export interface GeneratedIdeaReport {
  title: string;
  problem_statement: string;
  proposed_solution: string;
  target_market: string;
  revenue_model: string;
  feasibility_score: number;
  technical_difficulty: string;
  competitive_landscape: string;
  execution_roadmap: ExecutionStep[];
  estimated_capital: string;
  tags: string[];
}

export interface GenerateIdeaResponse {
  id: number;
  input_prompt: string;
  report: GeneratedIdeaReport;
  created_at: string;
  from_cache: boolean;
}

export interface SourceIdea {
  id: number;
  title: string;
  category: string;
}

export interface AISearchResponse {
  id: number;
  query: string;
  answer: string;
  sources: SourceIdea[];
  created_at: string;
}

export interface AIGeneratedIdeaHistory {
  id: number;
  input_prompt: string;
  generated_report_json: GeneratedIdeaReport;
  created_at: string;
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  answer: string;
  sources: SourceIdea[];
  created_at: string;
}

export interface Analytics {
  total_users: number;
  total_ideas: number;
  total_saved: number;
  total_ai_generations: number;
  total_searches: number;
  total_contacts: number;
  most_saved_categories: { name: string; save_count: number }[];
  ideas_by_category: { name: string; idea_count: number }[];
}

export interface DailyUsage {
  used: number;
  limit: number;
  remaining: number;
}

export interface IdeaFilters {
  search?: string;
  category_id?: number;
  difficulty?: string;
  min_feasibility?: number;
  max_feasibility?: number;
  page?: number;
}
