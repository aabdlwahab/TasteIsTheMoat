import type { ShaderDef } from "../core/types";

/**
 * Soft, premium "mesh gradient" — four colours float and blend through a
 * domain-warped noise field. The default palette is a cool indigo→violet→
 * pink→teal blend that reads well behind white hero text.
 */
export const meshGradient: ShaderDef = {
  id: "mesh-gradient",
  name: "Mesh Gradient",
  description: "Soft flowing four-colour gradient. Great behind hero text.",
  category: "gradient",
  uniforms: {
    u_colorA: { type: "color", value: [0.11, 0.13, 0.42], label: "Color A" },
    u_colorB: { type: "color", value: [0.45, 0.19, 0.72], label: "Color B" },
    u_colorC: { type: "color", value: [0.91, 0.38, 0.62], label: "Color C" },
    u_colorD: { type: "color", value: [0.22, 0.62, 0.71], label: "Color D" },
    u_speed: { type: "float", value: 0.35, min: 0, max: 2, label: "Speed" },
    u_scale: { type: "float", value: 1.1, min: 0.3, max: 3, label: "Scale" },
    u_warp: { type: "float", value: 0.55, min: 0, max: 1.5, label: "Warp" },
    u_grain: { type: "float", value: 0.04, min: 0, max: 0.2, label: "Grain" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // Domain warp: displace the sample point with two low-freq noise fields.
  float n1 = snoise(vec3(q, t * 0.15));
  float n2 = snoise(vec3(q * 1.3 + 5.0, t * 0.13));
  vec2 warp = vec2(n1, n2) * u_warp;
  vec2 w = q + warp;

  float m1 = snoise(vec3(w, t * 0.20)) * 0.5 + 0.5;
  float m2 = snoise(vec3(w * 0.8 - 3.0, t * 0.17)) * 0.5 + 0.5;
  float m3 = snoise(vec3(w * 1.4 + 8.0, t * 0.11)) * 0.5 + 0.5;

  vec3 col = mix(u_colorA, u_colorB, smoothstep(0.2, 0.8, m1));
  col = mix(col, u_colorC, smoothstep(0.25, 0.85, m2));
  col = mix(col, u_colorD, smoothstep(0.35, 0.9, m3 * 0.6 + m1 * 0.4));

  // Gentle vignette to settle the edges.
  col *= 1.0 - 0.25 * dot(p, p) * 0.15;

  // Animated film grain to break up banding.
  col += grain(uv + fract(u_time * 0.5)) * u_grain;

  gl_FragColor = vec4(col, 1.0);
}
`,
};
