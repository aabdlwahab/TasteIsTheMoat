import type { RGB } from "./types";

/**
 * Colour conversion shared by the studio, the React bindings and the theme
 * layer. Shader uniforms want 0..1 RGB triples; CSS and designers want hex.
 */

/** `#rrggbb` (or `#rgb`) to a 0..1 RGB triple. */
export function hexToRgb(hex: string): RGB {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** A 0..1 RGB triple to `#rrggbb`. */
export function rgbToHex(rgb: readonly number[]): string {
  return (
    "#" +
    [0, 1, 2]
      .map((i) =>
        Math.max(0, Math.min(255, Math.round((rgb[i] ?? 0) * 255)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/** HSV (all 0..1) to a 0..1 RGB triple. */
export function hsvToRgb(h: number, s: number, v: number): RGB {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const table: RGB[] = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ];
  return table[((i % 6) + 6) % 6];
}

/** Mix two 0..1 RGB triples. `t` of 0 returns `a`, 1 returns `b`. */
export function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/** Scale a colour's brightness, clamped to 0..1. */
export function scaleRgb(c: RGB, k: number): RGB {
  return [
    Math.min(1, Math.max(0, c[0] * k)),
    Math.min(1, Math.max(0, c[1] * k)),
    Math.min(1, Math.max(0, c[2] * k)),
  ];
}

/**
 * Relative luminance (WCAG), for deciding whether text over a colour should be
 * light or dark, and for checking scrim strength over a shader.
 */
export function luminance(c: RGB): number {
  const f = (v: number) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}

/** WCAG contrast ratio between two colours (1..21). */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Read a CSS custom property from an element and parse it as hex. */
export function cssVarToRgb(name: string, el: Element = document.documentElement): RGB | null {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  if (!raw) return null;
  if (raw.startsWith("#")) return hexToRgb(raw);
  // Also accept `rgb(r g b)` / `rgb(r, g, b)`.
  const m = raw.match(/-?\d+(\.\d+)?/g);
  if (m && m.length >= 3) {
    return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255];
  }
  return null;
}
