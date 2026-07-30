import type { ReactNode } from "react";
import { cn } from "./cn";

export interface StatusBadgeProps {
  children: ReactNode;
  tone?: "positive" | "warning" | "neutral" | "info";
  pulse?: boolean;
  className?: string;
}

const TONES = {
  positive: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20",
  warning: "bg-amber-400/10 text-amber-200 ring-amber-300/20",
  neutral: "bg-white/8 text-ink-200 ring-white/12",
  info: "bg-cyan-400/10 text-cyan-200 ring-cyan-300/20",
};

const DOTS = {
  positive: "bg-emerald-300",
  warning: "bg-amber-300",
  neutral: "bg-ink-300",
  info: "bg-cyan-300",
};

/** Small labelled status indicator for availability, releases, and system health. */
export function StatusBadge({
  children,
  tone = "positive",
  pulse = false,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
              DOTS[tone],
            )}
          />
        )}
        <span
          className={cn("relative inline-flex size-1.5 rounded-full", DOTS[tone])}
        />
      </span>
      {children}
    </span>
  );
}
