import type { ShaderDef } from "../core/types";

/**
 * Plasma — Inigo Quilez style iterated domain warping. fbm is fed through
 * itself twice to produce deep, marbled, liquid-metal motion. Three colours
 * are mixed by the intermediate warp fields for a rich sense of depth.
 */
export const plasma: ShaderDef = {
  id: "plasma",
  name: "Plasma",
  description: "Marbled liquid from iterated domain-warped noise.",
  category: "organic",
  uniforms: {
    u_colorA: { type: "color", value: [0.03, 0.02, 0.15], label: "Deep" },
    u_colorB: { type: "color", value: [0.85, 0.20, 0.45], label: "Mid" },
    u_colorC: { type: "color", value: [0.99, 0.82, 0.45], label: "Bright" },
    u_speed: { type: "float", value: 0.5, min: 0, max: 2, label: "Speed" },
    u_scale: { type: "float", value: 0.8, min: 0.4, max: 4, label: "Scale" },
    // Warp compounds: each fbm feeds the next, so high values pile on detail
    // until the marbling turns to mush. ~2.5 keeps the veins readable.
    u_warp: { type: "float", value: 2.5, min: 1, max: 8, label: "Warp" },
    u_grain: { type: "float", value: 0.03, min: 0, max: 0.2, label: "Grain" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 base = p * u_scale;

  // First warp layer.
  vec2 q = vec2(
    fbm(base + vec2(0.0, t * 0.2)),
    fbm(base + vec2(5.2, 1.3) - t * 0.15)
  );

  // Second warp layer, driven by the first.
  vec2 r = vec2(
    fbm(base + u_warp * q + vec2(1.7, 9.2) + t * 0.15),
    fbm(base + u_warp * q + vec2(8.3, 2.8) - t * 0.12)
  );

  float f = fbm(base + u_warp * r);
  float v = clamp(f * 0.5 + 0.5, 0.0, 1.0);

  // Layer three colours by the warp fields for depth.
  vec3 col = mix(u_colorA, u_colorB, v);
  col = mix(col, u_colorC, clamp(length(r) * 0.55, 0.0, 1.0));
  col = mix(col, u_colorA, clamp(length(q) * 0.30, 0.0, 1.0));

  col += grain(uv + fract(u_time * 0.5)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
