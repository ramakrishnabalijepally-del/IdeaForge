import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "low": return "text-emerald-400";
    case "medium": return "text-amber-400";
    case "high": return "text-red-400";
    default: return "text-text-secondary";
  }
}

export function getFeasibilityColor(score: number): string {
  if (score >= 8) return "#10B981";
  if (score >= 6) return "#F59E0B";
  return "#EF4444";
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}
