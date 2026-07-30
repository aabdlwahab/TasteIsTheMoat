import type { ShaderDef } from "../core/types";

/**
 * Starfield — parallax star layers streaming past. Each layer is a hashed grid
 * of points scrolling at its own rate, so near stars sweep quickly and distant
 * ones barely move. The pointer steers the direction of travel.
 */
export const starfield: ShaderDef = {
  id: "starfield",
  name: "Starfield",
  description: "Parallax stars streaming past. Steer with the cursor.",
  category: "space",
  interactive: true,
  colorRoles: { u_sky: "dark", u_star: "bright", u_tint: "mid" },
  uniforms: {
    u_sky: { type: "color", value: [0.01, 0.012, 0.03], label: "Sky" },
    u_star: { type: "color", value: [1.0, 0.97, 0.9], label: "Star" },
    u_tint: { type: "color", value: [0.35, 0.5, 1.0], label: "Distant tint" },
    u_speed: { type: "float", value: 0.35, min: 0, max: 2, label: "Speed" },
    u_density: { type: "float", value: 9.0, min: 2, max: 26, label: "Density" },
    u_layers: { type: "float", value: 5.0, min: 1, max: 6, label: "Layers" },
    u_twinkle: { type: "float", value: 0.6, min: 0, max: 2, label: "Twinkle" },
    u_steer: { type: "float", value: 0.4, min: 0, max: 2, label: "Cursor steer" },
  },
  fragment: /* glsl */ `
// One parallax layer of stars. depth runs 0 (near) .. 1 (far).
vec3 starLayer(vec2 p, float depth, float t) {
  float scale = u_density * (1.0 + depth * 2.2);
  vec2 q = p * scale;

  // Drift, slower for distant layers, nudged by the cursor.
  vec2 drift = vec2(t * (1.0 - depth * 0.75), 0.0);
  drift += mouseSmoothPos() * u_steer * (1.0 - depth * 0.8) * u_mouseEnter;
  q += drift;

  vec2 id = floor(q);
  vec2 gv = fract(q) - 0.5;

  // One star per cell, jittered inside it.
  vec2 jitter = (hash22(id) - 0.5) * 0.75;
  float d = length(gv - jitter);

  // Brightness varies per star; many cells stay empty.
  float seed = hash21(id + depth * 37.0);
  float present = step(0.72, seed);
  float bright = pow(hash21(id + 3.7), 3.0);

  float twinkle = 0.65 + 0.35 * sin(u_time * (1.5 + seed * 4.0) + seed * 30.0);
  twinkle = mix(1.0, twinkle, u_twinkle);

  // Sharper points for near layers, softer glow for far ones.
  float core = smoothstep(0.055 + depth * 0.03, 0.0, d);
  float halo = smoothstep(0.22 + depth * 0.1, 0.0, d) * 0.22;

  vec3 c = mix(u_star, u_tint, depth * 0.8);
  return c * (core + halo) * present * bright * twinkle * (1.0 - depth * 0.45);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec3 col = u_sky;

  // A faint dust lane so the field is not pure black between stars.
  float dust = fbm(p * 1.4 + t * 0.05) * 0.5 + 0.5;
  col += u_tint * pow(dust, 3.0) * 0.10;

  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_layers) break;
    float depth = float(i) / max(u_layers - 1.0, 1.0);
    col += starLayer(p, depth, t);
  }

  col += grain(uv + fract(u_time * 0.5)) * 0.015;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
