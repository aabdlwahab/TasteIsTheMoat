/**
 * Static stand-ins for a shader.
 *
 * A shader can only run on the client, which leaves two gaps: the moment before
 * the first frame paints, and environments where WebGL is unavailable or
 * server-rendered. Two options here, with different tradeoffs:
 *
 * - {@link fallbackGradient} derives a CSS gradient from the shader's own
 *   colours. Zero bytes, works in SSR, no WebGL — but only approximates.
 * - {@link capturePoster} renders one real frame and returns a data URL. Exact,
 *   but needs a browser and produces a sizeable string, so generate it ahead of
 *   time and serve it as a file.
 */
import { rgbToHex } from "./color";
import { ShaderBackground } from "./renderer";
import { brandUniforms, type BrandPalette } from "./theme";
import type { RGB, ShaderDef } from "./types";

/** Ordered colours for a shader, after optional brand remapping. */
function paletteFor(shader: ShaderDef, brand?: BrandPalette): RGB[] {
  const mapped = brand ? brandUniforms(shader, brand) : {};
  return Object.entries(shader.uniforms)
    .filter(([, def]) => def.type === "color")
    .map(([name, def]) => (mapped[name] ?? (def.value as RGB)));
}

export interface FallbackGradientOptions {
  brand?: BrandPalette;
  /** Overall opacity multiplier baked into the darkest base layer. */
  intensity?: number;
}

/**
 * A CSS `background` string approximating the shader, built from its own
 * colour uniforms so it lands in the right colour family rather than being a
 * generic purple blob.
 *
 * Layered radial gradients over a flat base read much closer to these shaders
 * than a linear gradient does, because almost all of them are blob fields.
 */
export function fallbackGradient(
  shader: ShaderDef,
  options: FallbackGradientOptions = {},
): string {
  const { brand, intensity = 1 } = options;
  const colors = paletteFor(shader, brand);
  if (colors.length === 0) return "#07080c";

  // Darkest colour becomes the base; the rest become blobs on top.
  const sorted = [...colors].sort(
    (a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]),
  );
  const base = sorted[0];
  const blobs = sorted.slice(1);
  if (blobs.length === 0) return rgbToHex(base);

  // Fixed positions: deterministic output, so SSR and client agree.
  const spots = [
    ["28%", "22%"],
    ["76%", "68%"],
    ["52%", "88%"],
    ["88%", "16%"],
    ["12%", "72%"],
  ];

  const layers = blobs.map((c, i) => {
    const [x, y] = spots[i % spots.length];
    const alpha = Math.max(0, Math.min(1, 0.55 * intensity));
    const [r, g, b] = c.map((v) => Math.round(v * 255));
    return `radial-gradient(ellipse 70% 60% at ${x} ${y}, rgba(${r},${g},${b},${alpha}) 0%, rgba(${r},${g},${b},0) 60%)`;
  });

  return `${layers.join(", ")}, ${rgbToHex(base)}`;
}

export interface CapturePosterOptions {
  width?: number;
  height?: number;
  brand?: BrandPalette;
  /** Seconds into the animation to capture. Avoid 0 — many shaders start flat. */
  time?: number;
  /** `image/png` or `image/jpeg`. JPEG is far smaller for photographic looks. */
  type?: string;
  quality?: number;
}

/**
 * Render one frame of a shader offscreen and return it as a data URL.
 *
 * Browser-only. Advances the clock to `time` before reading, because most of
 * these shaders open on a nearly uniform field and a poster taken at t=0 looks
 * like a flat colour.
 */
export async function capturePoster(
  shader: ShaderDef,
  options: CapturePosterOptions = {},
): Promise<string> {
  const {
    width = 1280,
    height = 720,
    brand,
    time = 4,
    type = "image/jpeg",
    quality = 0.82,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  // The renderer sizes its buffer from clientWidth/Height, which are 0 while
  // the canvas is detached — it would end up 1x1. Park it offscreen in the
  // document instead so layout gives it real dimensions.
  canvas.style.position = "fixed";
  canvas.style.left = "-99999px";
  canvas.style.top = "0";
  document.body.appendChild(canvas);

  const bg = new ShaderBackground(canvas, shader, {
    autoplay: false,
    pauseWhenHidden: false,
    preserveDrawingBuffer: true,
    maxDpr: 1,
  });

  try {
    if (brand) {
      for (const [name, value] of Object.entries(brandUniforms(shader, brand))) {
        bg.setUniform(name, value);
      }
    }
    bg.seek(time);
    return canvas.toDataURL(type, quality);
  } finally {
    bg.dispose();
    canvas.remove();
  }
}
