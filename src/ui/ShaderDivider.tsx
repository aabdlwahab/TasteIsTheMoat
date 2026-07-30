import { ShaderCanvas } from "../react/ShaderCanvas";
import type { BrandPalette } from "../core/theme";
import type { ShaderDef } from "../core/types";
import { cn } from "./cn";

export interface ShaderDividerProps {
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  /** Strip height, e.g. "120px". */
  height?: string;
  /** Fade both edges into the surrounding page colour. */
  feather?: boolean;
  /** Flip vertically, for symmetry between two dividers. */
  flip?: boolean;
  className?: string;
}

/**
 * A thin band of shader between two flat sections.
 *
 * A way to keep some motion on a long page without giving a whole section over
 * to it. Feathered top and bottom so it reads as a transition rather than a
 * stripe. Cheap: a short strip is a small number of pixels to shade.
 */
export function ShaderDivider({
  shader = "aurora",
  brand,
  height = "140px",
  feather = true,
  flip = false,
  className,
}: ShaderDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        height,
        transform: flip ? "scaleY(-1)" : undefined,
        ...(feather
          ? {
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, #000 45%, #000 55%, transparent)",
              maskImage:
                "linear-gradient(to bottom, transparent, #000 45%, #000 55%, transparent)",
            }
          : {}),
      }}
    >
      <ShaderCanvas
        shader={shader}
        brand={brand}
        maxDpr={1}
        pauseWhenHidden
        respectReducedMotion
        className="h-full w-full"
      />
    </div>
  );
}
