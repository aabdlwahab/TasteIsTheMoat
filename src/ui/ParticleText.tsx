import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ParticleTextField } from "../core/particleText";
import type { ParticleTextColors, RGBTriplet } from "../core/particleText";
import { hexToRgb } from "../core/color";
import type { BrandPalette } from "../core/theme";
import { cn } from "./cn";

type Colorish = string | RGBTriplet;

export interface ParticleTextProps {
  /** The word to render. Short display copy — not a paragraph. */
  text: string;
  /** Wrapper classes. The wrapper needs a height; the canvas fills it. */
  className?: string;
  /**
   * Classes for the real text node. It carries the accessible name and is what
   * shows if WebGL2 is missing, so style it as the headline you actually want.
   */
  textClassName?: string;
  /** Particle count to aim for. Lower it on dense pages. */
  particles?: number;
  /** Pointer influence radius, in CSS pixels. */
  radius?: number;
  /** Push strength. */
  force?: number;
  /** Pull back to the resting shape. */
  spring?: number;
  /** Fraction of the width the word should span. */
  fill?: number;
  /** Horizontal placement. The fallback text follows it too. */
  align?: "left" | "center" | "right";
  /** Rest / mid / hot colours. Hex strings or 0–1 RGB triplets. */
  colors?: { rest: Colorish; mid: Colorish; hot: Colorish };
  /** Derive the colour ramp from a brand palette instead of naming three. */
  brand?: BrandPalette;
  fontFamily?: string;
  fontWeight?: number;
  maxDpr?: number;
  pauseWhenHidden?: boolean;
  respectReducedMotion?: boolean;
  /** Small caption under the field, e.g. an interaction hint. */
  hint?: ReactNode;
}

function toTriplet(c: Colorish): RGBTriplet {
  return typeof c === "string" ? (hexToRgb(c) as RGBTriplet) : c;
}

const DEFAULTS: ParticleTextColors = {
  rest: [0.36, 0.55, 0.95],
  mid: [0.62, 0.44, 0.98],
  hot: [1.0, 0.66, 0.36],
};

/**
 * Maps the brand palette onto the energy ramp: the page-level colour at rest,
 * warming through the primary to the accent at peak. Reads as "the brand,
 * energised" rather than an unrelated third palette.
 */
function brandColors(brand: BrandPalette): ParticleTextColors {
  const primary = toTriplet(brand.primary as Colorish);
  return {
    rest: brand.secondary ? toTriplet(brand.secondary as Colorish) : primary,
    mid: primary,
    hot: brand.accent ? toTriplet(brand.accent as Colorish) : primary,
  };
}

/**
 * A word rendered as a field of particles that scatter from the pointer.
 *
 * The physics runs on the GPU via WebGL2 transform feedback (see
 * `src/core/particleText.ts`), so tens of thousands of particles cost roughly
 * one draw call each frame and nothing is simulated on the CPU.
 *
 * The word is always present as real text. When the field is running that text
 * is transparent — it still carries the accessible name and is still
 * selectable — and when WebGL2 is unavailable it simply stays visible, so the
 * headline never disappears.
 */
export function ParticleText({
  text,
  className,
  textClassName,
  particles = 40000,
  radius = 150,
  force = 2800,
  spring = 45,
  fill = 0.86,
  align = "center",
  colors,
  brand,
  fontFamily,
  fontWeight = 900,
  maxDpr = 2,
  pauseWhenHidden = true,
  respectReducedMotion = true,
  hint,
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ParticleTextField | null>(null);
  const [running, setRunning] = useState(false);

  const resolved: ParticleTextColors = colors
    ? { rest: toTriplet(colors.rest), mid: toTriplet(colors.mid), hot: toTriplet(colors.hot) }
    : brand
      ? brandColors(brand)
      : DEFAULTS;

  // Built once. Rebuilding on every prop change would reallocate every buffer
  // and restart the assembly animation; the setters below handle live updates.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field = new ParticleTextField(canvas, {
      text,
      particles,
      radius,
      force,
      spring,
      fill,
      align,
      colors: resolved,
      fontFamily,
      fontWeight,
      maxDpr,
      pauseWhenHidden,
      respectReducedMotion,
    });

    fieldRef.current = field;
    setRunning(field.supported);

    return () => {
      field.dispose();
      fieldRef.current = null;
      setRunning(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fieldRef.current?.setText(text);
  }, [text]);

  useEffect(() => {
    fieldRef.current?.setParams({ radius, force, spring });
  }, [radius, force, spring]);

  useEffect(() => {
    fieldRef.current?.setColors(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved.rest, resolved.mid, resolved.hot]);

  return (
    <div className={cn("relative isolate w-full", className)}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 size-full"
        style={{ display: "block" }}
      />
      {/* The real word. Transparent once the field is up, so it keeps the
          accessible name and stays selectable without being drawn twice. */}
      <p
        className={cn(
          "relative z-10 grid size-full",
          // Mirrors the sampler's placement, so the fallback lands where the
          // particles would have — and the layout does not shift if WebGL2 is
          // missing. The inset matches the sampler's `fill` margin.
          align === "left" ? "justify-items-start text-left"
          : align === "right" ? "justify-items-end text-right"
          : "justify-items-center text-center",
          "items-center font-sans font-black tracking-tight",
          textClassName,
        )}
        style={{
          ...(running ? { color: "transparent" } : null),
          paddingInline: `${((1 - fill) / 2) * 100}%`,
        }}
      >
        {text}
      </p>
      {hint && (
        <p className="pointer-events-none absolute inset-x-0 bottom-4 z-10 text-center text-[10px] uppercase tracking-[0.22em] text-ink-400">
          {hint}
        </p>
      )}
    </div>
  );
}
