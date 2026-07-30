/**
 * Brand theming for shaders.
 *
 * Shaders declare their own colour uniforms with hand-tuned defaults, which
 * look great in isolation but will clash with a user's brand palette. This maps
 * a small brand token set onto whatever colour uniforms a shader happens to
 * expose, so one `<ShaderSection brand={...}>` recolours any of the 51.
 *
 * The mapping is deliberately ordinal rather than semantic: shaders name their
 * colours inconsistently (`u_colorA`, `u_deep`, `u_skyTop`, `u_waxA`), so we
 * order them by declaration and walk a ramp. Shaders can opt out or override
 * per-uniform via `roles`.
 */
import { hexToRgb, mixRgb, scaleRgb } from "./color";
import type { ColorRole, RGB, ShaderDef, UniformMap } from "./types";

export type { ColorRole };

export interface BrandPalette {
  /** Primary brand colour. */
  primary: string | RGB;
  /** Secondary / supporting colour. Defaults to a shifted primary. */
  secondary?: string | RGB;
  /** Accent used for highlights and hot spots. */
  accent?: string | RGB;
  /** Page background the section sits on — anchors the dark end of the ramp. */
  background?: string | RGB;
  /** 0 = keep the shader's own colours, 1 = fully rebrand. */
  strength?: number;
}

function toRgb(c: string | RGB): RGB {
  return typeof c === "string" ? hexToRgb(c) : c;
}

/**
 * Build the ordered colour ramp a shader's uniforms are mapped onto:
 * background -> primary -> secondary -> accent, darkest first.
 */
function buildRamp(brand: BrandPalette): RGB[] {
  const primary = toRgb(brand.primary);
  const secondary = brand.secondary
    ? toRgb(brand.secondary)
    : mixRgb(primary, [1, 1, 1], 0.35);
  const accent = brand.accent
    ? toRgb(brand.accent)
    : mixRgb(secondary, [1, 1, 1], 0.4);
  const background = brand.background
    ? toRgb(brand.background)
    : scaleRgb(primary, 0.12);

  return [background, primary, secondary, accent];
}

/** Sample the ramp at `t` in 0..1 with linear interpolation between stops. */
function sampleRamp(ramp: RGB[], t: number): RGB {
  if (ramp.length === 1) return ramp[0];
  const x = Math.max(0, Math.min(1, t)) * (ramp.length - 1);
  const i = Math.min(ramp.length - 2, Math.floor(x));
  return mixRgb(ramp[i], ramp[i + 1], x - i);
}

/**
 * Colour-uniform names, in declaration order. Declaration order is meaningful:
 * shaders in this library consistently declare darkest-to-brightest.
 */
export function colorUniformNames(uniforms: UniformMap): string[] {
  return Object.entries(uniforms)
    .filter(([, def]) => def.type === "color")
    .map(([name]) => name);
}

/**
 * Compute brand-mapped values for a shader's colour uniforms.
 * Returns only the uniforms that should change, ready for `setUniform`.
 */
export function brandUniforms(
  shader: ShaderDef,
  brand: BrandPalette,
  roles?: Record<string, ColorRole>,
): Record<string, RGB> {
  const names = colorUniformNames(shader.uniforms);
  if (names.length === 0) return {};

  const ramp = buildRamp(brand);
  const strength = brand.strength ?? 1;
  const roleStops: Record<ColorRole, number> = {
    dark: 0,
    mid: 0.45,
    bright: 0.8,
    accent: 1,
  };

  const out: Record<string, RGB> = {};
  names.forEach((name, i) => {
    const def = shader.uniforms[name];
    if (def.type !== "color") return;

    // Explicit caller override wins, then the shader's own declared role,
    // then declaration order as a last resort.
    const role = roles?.[name] ?? shader.colorRoles?.[name];
    const t = role !== undefined
      ? roleStops[role]
      : names.length === 1
        ? 0.6
        : i / (names.length - 1);

    const branded = sampleRamp(ramp, t);
    // Blend toward the shader's tuned default so partial strengths keep some
    // of the original character rather than washing out.
    out[name] = mixRgb(def.value as RGB, branded, strength);
  });
  return out;
}

/** Default brand tokens, matching the studio's own palette. */
export const defaultBrand: BrandPalette = {
  primary: "#4f46e5",
  secondary: "#a855f7",
  accent: "#22d3ee",
  background: "#07080c",
};
