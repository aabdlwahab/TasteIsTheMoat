import { useEffect, useRef, type ReactNode } from "react";
import { ShaderBackground } from "../core/renderer";
import { brandUniforms, type BrandPalette } from "../core/theme";
import { getShader } from "../shaders/index";
import type { ShaderDef } from "../core/types";
import { cn } from "./cn";

export interface ShaderTextProps {
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  /** Frames per second for the texture refresh. See the note below. */
  fps?: number;
  /** Offscreen render size. Small is fine — it is stretched across the text. */
  resolution?: { width: number; height: number };
  className?: string;
  children: ReactNode;
}

/**
 * Headline text filled with a live shader.
 *
 * Implemented with `background-clip: text` over a data-URL texture that is
 * refreshed on an interval, rather than by masking a canvas to the glyphs.
 * That choice is deliberate: `background-clip: text` clips the *real* text
 * element, so alignment, wrapping, selection and accessibility all behave
 * normally. An SVG-mask approach has to duplicate the text and inevitably
 * drifts out of register across fonts and browsers.
 *
 * The tradeoff is refresh rate — each frame costs a `toDataURL`, so this runs
 * at ~12fps by default rather than 60. Slow shaders (mesh-gradient, silk,
 * oil-slick) look right at that rate; fast interactive ones do not, so prefer
 * the calm ones here.
 */
export function ShaderText({
  shader = "mesh-gradient",
  brand,
  fps = 12,
  resolution = { width: 480, height: 200 },
  className,
  children,
}: ShaderTextProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const span = spanRef.current;
    const def = typeof shader === "string" ? getShader(shader) : shader;
    if (!span || !def) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const canvas = document.createElement("canvas");
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    canvas.style.cssText = `position:fixed;left:-99999px;top:0;width:${resolution.width}px;height:${resolution.height}px`;
    document.body.appendChild(canvas);

    let bg: ShaderBackground;
    try {
      bg = new ShaderBackground(canvas, def, {
        autoplay: false,
        pauseWhenHidden: false,
        preserveDrawingBuffer: true,
        maxDpr: 1,
      });
    } catch {
      // No WebGL: the CSS gradient set by the class list remains visible.
      canvas.remove();
      return;
    }

    if (brand) {
      for (const [name, value] of Object.entries(brandUniforms(def, brand))) {
        bg.setUniform(name, value);
      }
    }

    let raf = 0;
    let timer = 0;
    let t = 2; // start where the shader has developed, not on a flat field
    let alive = true;

    const paint = () => {
      if (!alive) return;
      bg.seek(t);
      span.style.backgroundImage = `url(${canvas.toDataURL("image/jpeg", 0.7)})`;
    };

    paint();

    if (!reduce) {
      const step = 1 / fps;
      timer = window.setInterval(() => {
        t += step;
        // Paint inside a frame callback so the interval tick never blocks, and
        // drop any still-pending frame first — when rAF is throttled (hidden
        // tab) the interval keeps firing and would otherwise queue a backlog
        // that all runs at once on return.
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(paint);
      }, 1000 / fps);
    }

    return () => {
      alive = false;
      clearInterval(timer);
      cancelAnimationFrame(raf);
      bg.dispose();
      canvas.remove();
    };
  }, [shader, brand, fps, resolution.width, resolution.height]);

  return (
    <span
      ref={spanRef}
      className={cn(
        // The gradient is the fallback: it shows before the first paint and
        // stays if WebGL is unavailable.
        "bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400",
        "bg-clip-text text-transparent",
        "[background-size:100%_100%] [background-position:center]",
        className,
      )}
    >
      {children}
    </span>
  );
}
