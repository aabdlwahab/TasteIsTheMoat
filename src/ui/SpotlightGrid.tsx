import { useCallback, useRef, type ReactNode } from "react";
import { cn } from "./cn";

export interface SpotlightGridProps {
  children: ReactNode;
  /** Radius of the glow in pixels. */
  radius?: number;
  className?: string;
}

/**
 * A grid whose cards light up around the cursor.
 *
 * One pointer listener on the container writes `--mx`/`--my` onto each child,
 * and the glow itself is a CSS radial gradient keyed off those variables. No
 * WebGL and no per-card listeners, so this stays cheap with many cards — it is
 * the effect to reach for when a shader per card would be wasteful.
 *
 * Children need the `spotlight-card` class to pick up the glow; see
 * {@link SpotlightCard}.
 */
export function SpotlightGrid({
  children,
  radius = 340,
  className,
}: SpotlightGridProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const host = ref.current;
    if (!host) return;
    // Coordinates are written per card, relative to that card's own box, so
    // each gradient is positioned correctly regardless of grid layout.
    const cards = host.querySelectorAll<HTMLElement>("[data-spotlight]");
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
      // Turn the glow on here rather than relying on pointerenter alone: enter
      // does not fire if the pointer is already inside when this mounts (after
      // a route change or an accordion opening), which would leave the grid
      // permanently dark while the cursor moves over it.
      card.style.setProperty("--spot-opacity", "1");
    });
  }, []);

  const onLeave = useCallback(() => {
    const host = ref.current;
    if (!host) return;
    host
      .querySelectorAll<HTMLElement>("[data-spotlight]")
      .forEach((card) => card.style.setProperty("--spot-opacity", "0"));
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ ["--spot-radius" as string]: `${radius}px` }}
      className={cn("grid gap-5", className)}
    >
      {children}
    </div>
  );
}

export interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/** A card that responds to {@link SpotlightGrid}. */
export function SpotlightCard({ children, className }: SpotlightCardProps) {
  return (
    <div
      data-spotlight=""
      style={{ ["--spot-opacity" as string]: "0" }}
      className={cn(
        "group relative overflow-hidden rounded-card border border-ink-700 bg-ink-850/70 p-6",
        className,
      )}
    >
      {/* Glow that follows the cursor. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[var(--spot-opacity)] transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(var(--spot-radius) circle at var(--mx) var(--my), color-mix(in oklab, var(--color-brand-400) 22%, transparent), transparent 70%)",
        }}
      />
      {/* Border highlight, brightest nearest the cursor. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-card opacity-[var(--spot-opacity)] transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(var(--spot-radius) circle at var(--mx) var(--my), color-mix(in oklab, var(--color-brand-300) 55%, transparent), transparent 60%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          padding: "1px",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
