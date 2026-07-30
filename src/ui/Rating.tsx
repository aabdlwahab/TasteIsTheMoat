import { cn } from "./cn";

export interface RatingProps {
  value?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

/** Read-only star rating for review summaries and customer proof. */
export function Rating({
  value = 5,
  max = 5,
  label,
  size = "md",
  className,
}: RatingProps) {
  const safeValue = Math.max(0, Math.min(value, max));

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      aria-label={`${safeValue} out of ${max} stars${label ? `, ${label}` : ""}`}
    >
      <span aria-hidden="true" className="flex gap-0.5">
        {Array.from({ length: max }, (_, index) => (
          <span
            key={index}
            className={cn(
              index < Math.round(safeValue) ? "text-amber-300" : "text-ink-700",
              size === "sm" ? "text-sm" : "text-base",
            )}
          >
            ★
          </span>
        ))}
      </span>
      {label && (
        <span
          className={cn(
            "text-ink-300",
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
