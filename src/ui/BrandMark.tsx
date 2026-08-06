import { cn } from "./cn";

export interface BrandMarkProps {
  className?: string;
  /**
   * Drop the middle ring. Below roughly 24px the three rings crowd into a
   * blob, so the small sizes get two elements instead of three.
   */
  compact?: boolean;
  /** Give the mark an accessible name. Omit when adjacent text already names it. */
  title?: string;
}

/**
 * The house mark: a defended core inside a ring.
 *
 * Concentric rings rather than initials. Two letters turn to mush at favicon
 * size, and the rings say the thing the name says — a protected centre with a
 * moat around it — while echoing the expanding-ring motif the shader
 * collection is built on.
 *
 * Drawn in `currentColor`, so it takes the colour of whatever it sits in and
 * needs no variant per surface. Size it with a utility class; `size-6` is only
 * a default, and `cn` lets the caller override it.
 */
export function BrandMark({ className, compact = false, title }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-6 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <circle cx="12" cy="12" r="10.15" stroke="currentColor" strokeWidth="1.7" />
      {!compact && (
        <circle
          cx="12"
          cy="12"
          r="6.2"
          stroke="currentColor"
          strokeWidth="1.3"
          opacity="0.45"
        />
      )}
      <circle cx="12" cy="12" r="2.9" fill="currentColor" />
    </svg>
  );
}
