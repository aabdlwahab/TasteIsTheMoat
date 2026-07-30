import type { ReactNode } from "react";
import { ShaderCanvas } from "../react/ShaderCanvas";
import { fallbackGradient } from "../core/poster";
import { getShader } from "../shaders/index";
import type { BrandPalette, ColorRole } from "../core/theme";
import type { ShaderDef } from "../core/types";
import { cn } from "./cn";

/** How strongly to darken the shader so text stays legible on top of it. */
export type ScrimStrength = "none" | "subtle" | "medium" | "strong";

const SCRIMS: Record<ScrimStrength, string> = {
  none: "",
  // Radial scrims keep the shader visible at the edges while protecting the
  // centre, where headline copy almost always sits.
  subtle:
    "bg-[radial-gradient(ellipse_at_center,rgba(7,8,12,0.15)_0%,rgba(7,8,12,0.5)_100%)]",
  medium:
    "bg-[radial-gradient(ellipse_at_center,rgba(7,8,12,0.35)_0%,rgba(7,8,12,0.75)_100%)]",
  strong:
    "bg-[radial-gradient(ellipse_at_center,rgba(7,8,12,0.6)_0%,rgba(7,8,12,0.9)_100%)]",
};

export interface ShaderSectionProps {
  /** Shader id (e.g. "holo-foil") or a ShaderDef. Omit for a plain section. */
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  roles?: Record<string, ColorRole>;
  uniforms?: Record<string, number | number[]>;
  /** Darkening layer between shader and content. Defaults to "medium". */
  scrim?: ScrimStrength;
  /** Cap device-pixel-ratio. 1 is a good choice for full-bleed backgrounds. */
  maxDpr?: number;
  /** Render a static frame when the visitor prefers reduced motion. */
  respectReducedMotion?: boolean;
  /** Fade the shader out at the bottom so it blends into the next section. */
  fadeBottom?: boolean;
  /**
   * URL or data URL of a pre-rendered still, shown until the first frame paints
   * and left in place if WebGL is unavailable. Generate one with
   * `capturePoster()`. Without it, a CSS gradient derived from the shader's own
   * colours is used instead.
   */
  poster?: string;
  as?: "section" | "header" | "footer" | "div";
  className?: string;
  /** Classes for the inner content wrapper. */
  contentClassName?: string;
  children?: ReactNode;
  id?: string;
}

/**
 * A page section with a shader background.
 *
 * This exists to absorb the things that are easy to get wrong when putting a
 * WebGL canvas behind marketing copy:
 *
 * - **Stacking.** The canvas is `z-0` and content is `z-10`, never a negative
 *   z-index — that would paint the canvas behind the page background and make
 *   it vanish entirely.
 * - **Legibility.** A scrim sits between shader and content by default. Text
 *   over a moving background is the biggest accessibility risk here.
 * - **Cost.** `pauseWhenHidden` stops the render loop once the section scrolls
 *   away, so a page with several shaders only pays for what is on screen.
 * - **Motion sensitivity.** Honours `prefers-reduced-motion` by rendering one
 *   static frame.
 * - **Graceful failure.** If WebGL is unavailable the section still renders;
 *   a brand-tinted CSS gradient stands in for the shader.
 */
export function ShaderSection({
  shader,
  brand,
  roles,
  uniforms,
  scrim = "medium",
  maxDpr = 1.5,
  respectReducedMotion = true,
  fadeBottom = false,
  as: Tag = "section",
  className,
  contentClassName,
  children,
  id,
  poster,
}: ShaderSectionProps) {
  const def = typeof shader === "string" ? getShader(shader) : shader;

  // Derived from the shader's own colours, so the pre-paint state is in the
  // right colour family rather than a generic purple wash. Renders on the
  // server too, which is what makes this safe for SSR.
  const fallback = def
    ? poster
      ? undefined
      : fallbackGradient(def, { brand })
    : undefined;

  return (
    <Tag id={id} className={cn("relative isolate overflow-hidden", className)}>
      {shader && (
        <div className="absolute inset-0 z-0">
          {/* Visible before the first frame, and permanently if WebGL fails. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-ink-950 bg-cover bg-center"
            style={
              poster
                ? { backgroundImage: `url(${poster})` }
                : { background: fallback }
            }
          />
          <ShaderCanvas
            shader={shader}
            brand={brand}
            roles={roles}
            uniforms={uniforms}
            maxDpr={maxDpr}
            pauseWhenHidden
            respectReducedMotion={respectReducedMotion}
            className="absolute inset-0 h-full w-full"
          />
          {scrim !== "none" && (
            <div
              aria-hidden="true"
              className={cn("pointer-events-none absolute inset-0", SCRIMS[scrim])}
            />
          )}
          {fadeBottom && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-950"
            />
          )}
        </div>
      )}
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </Tag>
  );
}
