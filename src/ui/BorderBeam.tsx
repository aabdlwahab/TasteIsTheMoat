import type { ReactNode } from "react";
import { cn } from "./cn";

export interface BorderBeamProps {
  children: ReactNode;
  /** Seconds for one full circuit. */
  duration?: number;
  /** Border thickness in pixels. */
  width?: number;
  className?: string;
  contentClassName?: string;
}

/**
 * A light that travels around the element's border.
 *
 * A rotating conic gradient clipped to a 1px frame with a `mask` exclude —
 * pure CSS, no shader and no JS, so it is safe to use on many elements at once.
 * Pairs well with a flat card that sits next to a shader section.
 */
export function BorderBeam({
  children,
  duration = 6,
  width = 1,
  className,
  contentClassName,
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-card bg-ink-850",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="sbg-beam pointer-events-none absolute inset-0 rounded-card"
        style={{
          padding: `${width}px`,
          ["--beam-duration" as string]: `${duration}s`,
        }}
      />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}
