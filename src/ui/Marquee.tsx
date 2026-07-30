import type { ReactNode } from "react";
import { cn } from "./cn";

export interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full loop. Longer = slower. */
  duration?: number;
  /** Fade the edges so items enter and leave softly. */
  fade?: boolean;
  className?: string;
}

/**
 * Infinite horizontal scroller.
 *
 * The children are rendered twice and the track is translated by exactly -50%,
 * which is what makes the loop seamless. The duplicate is aria-hidden so screen
 * readers only encounter the content once. Pauses on hover, and the animation
 * is disabled entirely under `prefers-reduced-motion`.
 */
export function Marquee({
  children,
  duration = 30,
  fade = true,
  className,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "sbg-marquee group relative w-full overflow-hidden",
        fade &&
          "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      <div
        className="sbg-marquee-track flex w-max items-center"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
