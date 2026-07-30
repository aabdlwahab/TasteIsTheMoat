import { cn } from "./cn";

export interface NoiseOverlayProps {
  /** 0..1. Subtle is the point — above ~0.1 it reads as dirt. */
  opacity?: number;
  className?: string;
}

/**
 * A static grain layer.
 *
 * Every shader in this library adds its own film grain, which leaves flat
 * sections looking conspicuously clean next to them. Dropping this into the
 * flat sections unifies the page. Also hides gradient banding on wide, dark
 * areas, which is where 8-bit dithering artefacts show up most.
 *
 * The texture is an inline SVG feTurbulence, so there is no image request.
 */
export function NoiseOverlay({ opacity = 0.035, className }: NoiseOverlayProps) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="140" height="140" filter="url(%23n)"/></svg>`;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-[1] mix-blend-overlay",
        className,
      )}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
