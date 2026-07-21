import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "amber" | "violet" | "green" | "red" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-surface-DEFAULT text-text-secondary border border-surface-border",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    red: "bg-red-500/10 text-red-400 border border-red-500/20",
    outline: "border border-surface-border text-text-secondary",
  };

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
