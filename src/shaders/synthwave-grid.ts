import type { ShaderDef } from "../core/types";

/**
 * Synthwave Grid — the retro perspective grid running to a neon horizon, with
 * a banded sun. The grid comes from a perspective divide: dividing x by the
 * distance below the horizon makes parallel lines converge correctly.
 */
export const synthwaveGrid: ShaderDef = {
  id: "synthwave-grid",
  name: "Synthwave Grid",
  description: "Retro neon grid racing to a banded sun.",
  category: "geometric",
  colorRoles: { u_skyTop: "dark", u_skyBottom: "mid", u_grid: "accent", u_sun: "bright" },
  uniforms: {
    u_skyTop: { type: "color", value: [0.06, 0.02, 0.16], label: "Sky top" },
    u_skyBottom: { type: "color", value: [0.55, 0.10, 0.45], label: "Horizon" },
    u_grid: { type: "color", value: [0.20, 0.95, 0.95], label: "Grid" },
    u_sun: { type: "color", value: [1.0, 0.45, 0.35], label: "Sun" },
    u_speed: { type: "float", value: 0.5, min: 0, max: 2, label: "Speed" },
    u_horizon: { type: "float", value: 0.0, min: -0.5, max: 0.5, label: "Horizon Y" },
    u_cells: { type: "float", value: 8.0, min: 2, max: 24, label: "Grid cells" },
    u_glow: { type: "float", value: 0.8, min: 0, max: 2.5, label: "Neon glow" },
    u_sunSize: { type: "float", value: 0.42, min: 0.05, max: 1.0, label: "Sun size" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  float horizon = u_horizon;
  vec3 col;

  if (p.y > horizon) {
    // ---- sky ----
    float sky = (p.y - horizon) / (1.0 - horizon);
    col = mix(u_skyBottom, u_skyTop, pow(sky, 0.7));

    // Banded sun sitting on the horizon.
    vec2 sunPos = vec2(0.0, horizon + u_sunSize * 0.55);
    float d = length((p - sunPos) / vec2(1.0, 1.0));
    float disc = smoothstep(u_sunSize, u_sunSize * 0.97, d);
    // Horizontal slots cut across the lower half of the disc.
    float slots = step(0.35, fract((p.y - horizon) * 26.0));
    float lower = smoothstep(sunPos.y, sunPos.y - u_sunSize, p.y);
    disc *= mix(1.0, slots, lower);

    vec3 sunCol = mix(u_sun, vec3(1.0, 0.85, 0.45),
                      clamp((p.y - sunPos.y) / u_sunSize * 0.5 + 0.5, 0.0, 1.0));
    col = mix(col, sunCol, disc);
    // Sun bloom.
    col += u_sun * smoothstep(u_sunSize * 2.6, 0.0, d) * 0.35 * u_glow;

    // A few stars high in the sky.
    vec2 sid = floor(gl_FragCoord.xy / 3.0);
    col += vec3(1.0) * step(0.9988, hash21(sid)) * smoothstep(horizon + 0.2, 1.0, p.y);

  } else {
    // ---- ground ----
    // Perspective divide: depth grows as we approach the horizon.
    float depth = 1.0 / (horizon - p.y + 1e-3);
    vec2 g = vec2(p.x * depth, depth + t * 2.0);

    // Distance to the nearest grid line in each axis, width-corrected so
    // distant lines stay thin instead of aliasing into noise.
    vec2 gridUv = g * vec2(u_cells * 0.5, 1.0);
    vec2 f = abs(fract(gridUv) - 0.5);
    vec2 fw = fwidth(gridUv) * 1.5;
    vec2 lines = smoothstep(fw, vec2(0.0), f);
    float grid = max(lines.x, lines.y);

    // Fade the grid out with distance.
    float fade = smoothstep(0.0, 0.45, horizon - p.y);

    vec3 ground = mix(u_skyBottom * 0.25, vec3(0.02, 0.0, 0.06), fade);
    col = ground;
    col += u_grid * grid * fade * (0.6 + u_glow);
    // Neon bleed around the lines.
    col += u_grid * grid * 0.25 * u_glow;
  }

  // Horizon glow band.
  col += u_skyBottom * exp(-abs(p.y - horizon) * 14.0) * 0.55 * u_glow;

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
