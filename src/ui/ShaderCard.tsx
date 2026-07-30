import { useState, type ReactNode } from "react";
import { ShaderCanvas } from "../react/ShaderCanvas";
import type { BrandPalette } from "../core/theme";
import type { ShaderDef } from "../core/types";
import { cn } from "./cn";

export interface ShaderCardProps {
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  /** Shader opacity at rest and while hovered. */
  restOpacity?: number;
  hoverOpacity?: number;
  /**
   * Uniform overrides applied only while hovered — typically a speed or
   * intensity bump so the card visibly wakes up rather than just brightening.
   */
  hoverUniforms?: Record<string, number | number[]>;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * A card with a shader background that comes alive on hover.
 *
 * The shader renders continuously but sits at low opacity at rest, so hovering
 * is a cheap CSS transition rather than a mount. Keep these to a handful per
 * page — each one is its own WebGL context and render loop.
 */
export function ShaderCard({
  shader = "holo-foil",
  brand,
  restOpacity = 0.25,
  hoverOpacity = 0.7,
  hoverUniforms,
  className,
  contentClassName,
  children,
}: ShaderCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        "group relative isolate overflow-hidden rounded-card border border-ink-700 bg-ink-850",
        "transition-colors duration-300 hover:border-ink-600",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 transition-opacity duration-500"
        style={{ opacity: hovered ? hoverOpacity : restOpacity }}
      >
        <ShaderCanvas
          shader={shader}
          brand={brand}
          uniforms={hovered ? hoverUniforms : undefined}
          maxDpr={1}
          pauseWhenHidden
          respectReducedMotion
          className="h-full w-full"
        />
      </div>
      {/* Keeps card copy legible over the shader at hover opacity. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink-950/90 via-ink-950/60 to-ink-950/30"
      />
      <div className={cn("relative z-10 p-6", contentClassName)}>{children}</div>
    </div>
  );
}
