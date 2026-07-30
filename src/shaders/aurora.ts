import type { ShaderDef } from "../core/types";

/**
 * Northern-lights aurora — layered ribbons of light drift across a dark sky,
 * with vertical streaking and a soft glow. Additive colour keeps it luminous.
 */
export const aurora: ShaderDef = {
  id: "aurora",
  name: "Aurora",
  description: "Glowing northern-lights ribbons over a night sky.",
  category: "gradient",
  // Ribbons are the bright subject, sky is the dark ground — the opposite of
  // this shader's declaration order.
  colorRoles: {
    u_colorA: "bright",
    u_colorB: "accent",
    u_skyTop: "dark",
    u_skyBottom: "dark",
  },
  uniforms: {
    u_colorA: { type: "color", value: [0.12, 0.95, 0.62], label: "Ribbon low" },
    u_colorB: { type: "color", value: [0.30, 0.35, 0.98], label: "Ribbon high" },
    u_skyTop: { type: "color", value: [0.02, 0.03, 0.09], label: "Sky top" },
    u_skyBottom: { type: "color", value: [0.04, 0.06, 0.12], label: "Sky bottom" },
    u_speed: { type: "float", value: 0.5, min: 0, max: 2, label: "Speed" },
    u_intensity: { type: "float", value: 0.9, min: 0, max: 2, label: "Intensity" },
    u_grain: { type: "float", value: 0.03, min: 0, max: 0.2, label: "Grain" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Night sky base gradient.
  vec3 col = mix(u_skyBottom, u_skyTop, clamp(uv.y, 0.0, 1.0));

  // A few drifting ribbons stacked up the sky.
  vec3 aur = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float wave = fbm(vec2(p.x * 1.5 + fi * 3.17, t * 0.4 + fi)) * 0.35;
    float base = -0.15 + fi * 0.11 + wave;           // ribbon centre height
    float thickness = 0.22 + 0.08 * sin(t * 0.3 + fi);
    float d = abs(p.y - base);
    float ribbon = smoothstep(thickness, 0.0, d);

    // Vertical streaks flowing along the ribbon.
    float streak = fbm(vec2(p.x * 5.0 + t * 0.3, p.y * 2.5 - t * 0.7));
    ribbon *= 0.55 + 0.45 * (streak * 0.5 + 0.5);

    float h = clamp((p.y - base) * 1.6 + 0.5, 0.0, 1.0);
    vec3 c = mix(u_colorA, u_colorB, h);
    aur += c * ribbon;
  }

  // Fade the aurora out toward the horizon.
  aur *= smoothstep(-0.6, 0.15, p.y) * u_intensity;
  col += aur;

  col += grain(uv + fract(u_time)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
