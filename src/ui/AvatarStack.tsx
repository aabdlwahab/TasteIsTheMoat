import { cn } from "./cn";

export interface AvatarItem {
  name: string;
  image?: string;
}

export interface AvatarStackProps {
  items: AvatarItem[];
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "size-7 text-[9px]",
  md: "size-9 text-[11px]",
  lg: "size-11 text-xs",
};

/** Compact social-proof avatar group with an accessible text alternative. */
export function AvatarStack({
  items,
  max = 5,
  size = "md",
  className,
}: AvatarStackProps) {
  const visible = items.slice(0, max);
  const remaining = Math.max(items.length - visible.length, 0);

  return (
    <div
      className={cn("flex -space-x-2", className)}
      aria-label={items.map((item) => item.name).join(", ")}
    >
      {visible.map((item, index) => (
        <span
          key={`${item.name}-${index}`}
          className={cn(
            "relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink-950 bg-gradient-to-br from-brand-400 to-accent-400 font-semibold text-white",
            SIZE_CLASSES[size],
          )}
          title={item.name}
        >
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            item.name
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          )}
        </span>
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            "relative grid shrink-0 place-items-center rounded-full border-2 border-ink-950 bg-ink-700 font-semibold text-ink-100",
            SIZE_CLASSES[size],
          )}
          aria-label={`${remaining} more`}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
