import { useEffect, useRef } from "react";
import { ShaderBackground, type RendererOptions } from "../core/renderer";
import { brandUniforms, type BrandPalette, type ColorRole } from "../core/theme";
import { getShader } from "../shaders/index";
import type { RGB, ShaderDef } from "../core/types";

export interface ShaderCanvasProps
  extends Omit<RendererOptions, "onFps" | "onError"> {
  /** A shader id (e.g. "holo-foil") or a ShaderDef. */
  shader: string | ShaderDef;
  /** Brand palette to recolour the shader with. */
  brand?: BrandPalette;
  /** Per-uniform brand role overrides. */
  roles?: Record<string, ColorRole>;
  /** Uniform overrides applied after branding. */
  uniforms?: Record<string, number | number[]>;
  className?: string;
  /** Called if the shader fails to compile or WebGL is unavailable. */
  onError?: (message: string) => void;
}

/**
 * Mounts a shader onto a canvas that fills its parent.
 *
 * Deliberately unopinionated about layout — `<ShaderSection>` handles the
 * positioning, scrim and stacking. Use this directly only when you need a
 * shader somewhere unusual.
 */
export function ShaderCanvas({
  shader,
  brand,
  roles,
  uniforms,
  className,
  onError,
  ...options
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<ShaderBackground | null>(null);

  const def = typeof shader === "string" ? getShader(shader) : shader;

  // Create / swap the renderer. Options are read once on mount by design:
  // changing pauseWhenHidden mid-life would mean rebuilding observers.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !def) {
      if (!def) onError?.(`Unknown shader: ${String(shader)}`);
      return;
    }

    let bg: ShaderBackground;
    try {
      bg = new ShaderBackground(canvas, def, options);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : String(err));
      return;
    }
    bgRef.current = bg;
    return () => {
      bg.dispose();
      bgRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def]);

  // Apply branding, then explicit uniform overrides on top.
  useEffect(() => {
    const bg = bgRef.current;
    if (!bg || !def) return;
    if (brand) {
      const mapped = brandUniforms(def, brand, roles);
      for (const [name, value] of Object.entries(mapped)) {
        bg.setUniform(name, value as RGB);
      }
    } else {
      bg.resetUniforms();
    }
    if (uniforms) {
      for (const [name, value] of Object.entries(uniforms)) {
        bg.setUniform(name, value);
      }
    }
  }, [def, brand, roles, uniforms]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
