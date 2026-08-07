import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { GlyphSurface } from "../core/surfaces/glyphs";
import { LensSurface } from "../core/surfaces/lens";
import { ShatterSurface } from "../core/surfaces/shatter";
import { FluidSurface } from "../core/surfaces/fluid";
import type { GlyphSurfaceOptions } from "../core/surfaces/glyphs";
import type { LensSurfaceOptions } from "../core/surfaces/lens";
import type { ShatterSurfaceOptions } from "../core/surfaces/shatter";
import type { FluidSurfaceOptions } from "../core/surfaces/fluid";
import type { TextSurface, TextSurfaceOptions } from "../core/textSurface";
import { cn } from "./cn";

/**
 * React wrappers for the WebGL2 text surfaces.
 *
 * All four share one shell, which owns the part that matters beyond the
 * effect: the word is always in the DOM as real text. It is transparent while
 * the surface is running — so it keeps the accessible name and stays
 * selectable — and stays visible when WebGL2 or float targets are missing, so
 * the headline never disappears.
 */

export interface SurfaceShellProps {
  /** Wrapper classes. The wrapper needs a height; the canvas fills it. */
  className?: string;
  /**
   * Classes for the real text node. It carries the accessible name and is what
   * shows if the surface cannot run, so style it as the headline you want.
   */
  textClassName?: string;
  /** Small caption over the surface, e.g. an interaction hint. */
  hint?: ReactNode;
  /** Called with a reason when the surface cannot run. */
  onUnsupported?: (message: string) => void;
}

function Shell({
  text,
  align = "center",
  fill = 0.86,
  className,
  textClassName,
  hint,
  running,
  canvasRef,
}: {
  text: string;
  align?: "left" | "center" | "right";
  fill?: number;
  running: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
} & Pick<SurfaceShellProps, "className" | "textClassName" | "hint">) {
  return (
    <div className={cn("relative isolate w-full overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 size-full"
        style={{ display: "block" }}
      />
      <p
        className={cn(
          "relative z-10 grid size-full items-center",
          align === "left" ? "justify-items-start text-left"
          : align === "right" ? "justify-items-end text-right"
          : "justify-items-center text-center",
          "font-sans font-black tracking-tight",
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

/**
 * Shared mount logic.
 *
 * The surface is constructed once. Rebuilding it on every prop change would
 * reallocate every buffer and restart the effect, so live updates go through
 * the instance's own `setText`/`setParams`.
 */
function useSurface<S extends TextSurface, O extends TextSurfaceOptions>(
  create: (canvas: HTMLCanvasElement, options: O) => S,
  options: O,
  params: Record<string, unknown>,
  onUnsupported?: (message: string) => void,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<S | null>(null);
  const [running, setRunning] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const notifyRef = useRef(onUnsupported);
  notifyRef.current = onUnsupported;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let message: string | null = null;
    const surface = create(canvas, {
      ...optionsRef.current,
      onError: (m: string) => {
        message = m;
      },
    });

    surfaceRef.current = surface;
    setRunning(surface.supported);
    if (!surface.supported) notifyRef.current?.(message ?? "Surface unavailable.");

    return () => {
      surface.dispose();
      surfaceRef.current = null;
      setRunning(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    surfaceRef.current?.setText(options.text);
  }, [options.text]);

  // Params are compared by their serialised form: the objects are rebuilt on
  // every render, so an identity check would fire the effect constantly.
  const key = JSON.stringify(params);
  useEffect(() => {
    const s = surfaceRef.current as { setParams?: (p: unknown) => void } | null;
    s?.setParams?.(JSON.parse(key));
  }, [key]);

  return { canvasRef, running };
}

/* ---- Glyphs ------------------------------------------------------------- */

export interface GlyphTextProps
  extends Omit<GlyphSurfaceOptions, "onError">, SurfaceShellProps {}

/** The word resolved into a grid of characters that scramble under the pointer. */
export function GlyphText({
  className, textClassName, hint, onUnsupported, ...options
}: GlyphTextProps) {
  const { charset = 0, palette = 0, treatment = 0, cell = 11, radius = 150 } = options;
  const { canvasRef, running } = useSurface(
    (c, o) => new GlyphSurface(c, o),
    options,
    { charset, palette, treatment, cell, radius },
    onUnsupported,
  );
  return (
    <Shell
      text={options.text}
      align={options.align}
      fill={options.fill}
      className={className}
      textClassName={textClassName}
      hint={hint}
      running={running}
      canvasRef={canvasRef}
    />
  );
}

/* ---- Lens --------------------------------------------------------------- */

export interface LensTextProps
  extends Omit<LensSurfaceOptions, "onError">, SurfaceShellProps {}

/** The word seen through a lens that follows the pointer. */
export function LensText({
  className, textClassName, hint, onUnsupported, ...options
}: LensTextProps) {
  const { radius = 190, refract = 100, ripple = 100 } = options;
  const { canvasRef, running } = useSurface(
    (c, o) => new LensSurface(c, o),
    options,
    { radius, refract, ripple },
    onUnsupported,
  );
  return (
    <Shell
      text={options.text}
      align={options.align}
      fill={options.fill}
      className={className}
      textClassName={textClassName}
      hint={hint}
      running={running}
      canvasRef={canvasRef}
    />
  );
}

/* ---- Shatter ------------------------------------------------------------ */

export interface ShatterTextProps
  extends Omit<ShatterSurfaceOptions, "onError">, SurfaceShellProps {}

/** The word broken into Voronoi shards that scatter and spring back. */
export function ShatterText({
  className, textClassName, hint, onUnsupported, ...options
}: ShatterTextProps) {
  const { shards = 120, radius = 180, force = 2800, spin = 100, spring = 32 } = options;
  const { canvasRef, running } = useSurface(
    (c, o) => new ShatterSurface(c, o),
    options,
    { shards, radius, force, spin, spring },
    onUnsupported,
  );
  return (
    <Shell
      text={options.text}
      align={options.align}
      fill={options.fill}
      className={className}
      textClassName={textClassName}
      hint={hint}
      running={running}
      canvasRef={canvasRef}
    />
  );
}

/* ---- Fluid -------------------------------------------------------------- */

export interface FluidTextProps
  extends Omit<FluidSurfaceOptions, "onError">, SurfaceShellProps {}

/** The word as dye in a fluid simulation, stirred by the pointer. */
export function FluidText({
  className, textClassName, hint, onUnsupported, ...options
}: FluidTextProps) {
  const {
    grid = 512, radius = 150, stir = 100, ink = 100, fade = 18, iterations = 20,
  } = options;
  const { canvasRef, running } = useSurface(
    (c, o) => new FluidSurface(c, o),
    options,
    { grid, radius, stir, ink, fade, iterations },
    onUnsupported,
  );
  return (
    <Shell
      text={options.text}
      align={options.align}
      fill={options.fill}
      className={className}
      textClassName={textClassName}
      hint={hint}
      running={running}
      canvasRef={canvasRef}
    />
  );
}
