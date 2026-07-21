"use client";

import { getFeasibilityColor } from "@/lib/utils";

interface FeasibilityGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function FeasibilityGauge({ score, size = "md", showLabel = true }: FeasibilityGaugeProps) {
  const color = getFeasibilityColor(score);
  const pct = (score / 10) * 100;

  const dims = {
    sm: { r: 20, stroke: 4, text: "text-xs", container: "w-12 h-12" },
    md: { r: 28, stroke: 5, text: "text-sm", container: "w-16 h-16" },
    lg: { r: 40, stroke: 6, text: "text-base", container: "w-24 h-24" },
  }[size];

  const circumference = 2 * Math.PI * dims.r;
  const offset = circumference - (pct / 100) * circumference;

  const svgSize = (dims.r + dims.stroke) * 2 + 4;
  const center = svgSize / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${dims.container} flex items-center justify-center`}>
        <svg width={svgSize} height={svgSize} className="absolute inset-0 -rotate-90">
          <circle
            cx={center} cy={center} r={dims.r}
            stroke="#333" strokeWidth={dims.stroke} fill="none"
          />
          <circle
            cx={center} cy={center} r={dims.r}
            stroke={color} strokeWidth={dims.stroke} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <span className={`font-bold font-heading ${dims.text}`} style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
      {showLabel && (
        <span className="text-xs text-text-muted">Feasibility</span>
      )}
    </div>
  );
}
