import { ShaderCanvas } from "../react/ShaderCanvas";
import type { BrandPalette } from "../core/theme";
import type { ShaderDef } from "../core/types";
import { cn } from "./cn";

export interface ShaderOrbProps {
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  /** CSS size, e.g. "320px" or "24rem". */
  size?: string;
  /** `circle` is a plain disc; `blob` uses an organic border-radius. */
  shape?: "circle" | "blob" | "squircle";
  /** Soften the edge so it melts into the page instead of ending abruptly. */
  feather?: boolean;
  /** Glow cast behind the orb. */
  glow?: boolean;
  className?: string;
}

const SHAPES: Record<NonNullable<ShaderOrbProps["shape"]>, string> = {
  circle: "50%",
  blob: "62% 38% 46% 54% / 55% 48% 52% 45%",
  squircle: "28%",
};

/**
 * A shader clipped into a decorative shape.
 *
 * Useful as an accent beside copy — a shader moment without committing a whole
 * section to one. Cheap because the canvas is small; feathering is a radial
 * mask so the edge does not read as a hard cutout.
 */
export function ShaderOrb({
  shader = "plasma",
  brand,
  size = "320px",
  shape = "blob",
  feather = true,
  glow = true,
  className,
}: ShaderOrbProps) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          aria-hidden="true"
          className="absolute inset-4 -z-10 rounded-full bg-brand-500/35 blur-3xl"
        />
      )}
      <div
        className="h-full w-full overflow-hidden"
        style={{
          borderRadius: SHAPES[shape],
          ...(feather
            ? {
                WebkitMaskImage:
                  "radial-gradient(closest-side, #000 62%, transparent 100%)",
                maskImage:
                  "radial-gradient(closest-side, #000 62%, transparent 100%)",
              }
            : {}),
        }}
      >
        <ShaderCanvas
          shader={shader}
          brand={brand}
          maxDpr={1.5}
          pauseWhenHidden
          respectReducedMotion
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
