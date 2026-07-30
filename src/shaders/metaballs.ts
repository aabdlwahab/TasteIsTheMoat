import type { ShaderDef } from "../core/types";

/**
 * Metaballs — soft gooey blobs orbiting and merging via a summed inverse-square
 * field. A rim highlight around the threshold gives it a liquid, tactile edge.
 */
export const metaballs: ShaderDef = {
  id: "metaballs",
  name: "Metaballs",
  description: "Gooey blobs that merge and split. Playful, tactile.",
  category: "organic",
  colorRoles: { u_bg: "dark", u_colorA: "mid", u_colorB: "accent" },
  uniforms: {
    u_bg: { type: "color", value: [0.04, 0.05, 0.10], label: "Background" },
    u_colorA: { type: "color", value: [0.98, 0.30, 0.45], label: "Core" },
    u_colorB: { type: "color", value: [0.99, 0.75, 0.30], label: "Edge" },
    u_speed: { type: "float", value: 0.6, min: 0, max: 2, label: "Speed" },
    u_spread: { type: "float", value: 0.9, min: 0.2, max: 1.6, label: "Spread" },
    u_threshold: { type: "float", value: 1.0, min: 0.4, max: 2.0, label: "Threshold" },
    u_grain: { type: "float", value: 0.02, min: 0, max: 0.2, label: "Grain" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  float field = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    // Each blob drifts on its own lissajous orbit.
    vec2 c = vec2(
      sin(t * 0.6 + fi * 1.7) * u_spread,
      cos(t * 0.5 + fi * 2.3) * u_spread * 0.62
    );
    float r = 0.16 + 0.06 * sin(t + fi * 1.3);
    vec2 d = p - c;
    field += (r * r) / (dot(d, d) + 1e-3);
  }

  float edge = smoothstep(u_threshold - 0.06, u_threshold + 0.06, field);
  float rim = smoothstep(u_threshold + 0.35, u_threshold, field) * edge;

  vec3 blob = mix(u_colorB, u_colorA, clamp(field * 0.35, 0.0, 1.0));
  vec3 col = mix(u_bg, blob, edge);
  col += vec3(1.0) * rim * 0.12;                 // liquid rim light

  col += grain(uv + fract(u_time * 0.5)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
