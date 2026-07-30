/**
 * shaderbg — animated WebGL shader backgrounds for landing pages.
 *
 * @example
 * ```ts
 * import { ShaderBackground, shaders } from "shaderbg";
 *
 * const canvas = document.querySelector("canvas")!;
 * const bg = new ShaderBackground(canvas, shaders.aurora);
 * // bg.play() / bg.pause() / bg.setUniform("u_speed", 0.8)
 * ```
 */
export { ShaderBackground } from "./core/renderer";
export type { RendererOptions, CompileResult } from "./core/renderer";
export type {
  ShaderDef,
  UniformDef,
  UniformMap,
  UniformType,
  FloatUniform,
  Vec2Uniform,
  ColorUniform,
  Category,
  RGB,
} from "./core/types";
export * from "./shaders/index";
export { GLSL_COMMON, VERTEX_SRC, MAX_RIPPLES } from "./core/glsl";

// Colour + brand theming (framework-agnostic).
export {
  hexToRgb,
  rgbToHex,
  hsvToRgb,
  mixRgb,
  scaleRgb,
  luminance,
  contrastRatio,
  cssVarToRgb,
} from "./core/color";
export {
  brandUniforms,
  colorUniformNames,
  defaultBrand,
} from "./core/theme";
export type { BrandPalette, ColorRole } from "./core/theme";

// Static stand-ins for SSR and pre-first-frame.
export { fallbackGradient, capturePoster } from "./core/poster";
export type {
  FallbackGradientOptions,
  CapturePosterOptions,
} from "./core/poster";

import { ShaderBackground } from "./core/renderer";
import type { RendererOptions } from "./core/renderer";
import { getShader } from "./shaders/index";
import type { ShaderDef } from "./core/types";

/**
 * Convenience mount: attach a shader background to an element by selector or
 * node. If a non-canvas element is given, a canvas is created and stretched to
 * fill it. Returns the {@link ShaderBackground} instance.
 */
export function mount(
  target: string | HTMLElement,
  shader: string | ShaderDef,
  options?: RendererOptions,
): ShaderBackground {
  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;
  if (!el) throw new Error(`mount: target not found: ${String(target)}`);

  const def = typeof shader === "string" ? getShader(shader) : shader;
  if (!def) throw new Error(`mount: unknown shader: ${String(shader)}`);

  let canvas: HTMLCanvasElement;
  if (el instanceof HTMLCanvasElement) {
    canvas = el;
  } else {
    canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.appendChild(canvas);
  }
  return new ShaderBackground(canvas, def, options);
}
