import type { ShaderDef } from "../core/types";

/**
 * Silk — flowing satin folds. A stripe "weave" is advected through a
 * domain-warped flow field, then given an anisotropic sheen so it reads as
 * light catching fabric.
 */
export const silk: ShaderDef = {
  id: "silk",
  name: "Silk",
  description: "Satin folds with a soft moving sheen.",
  category: "gradient",
  uniforms: {
    u_colorA: { type: "color", value: [0.06, 0.05, 0.18], label: "Shadow" },
    u_colorB: { type: "color", value: [0.55, 0.35, 0.95], label: "Highlight" },
    u_speed: { type: "float", value: 0.4, min: 0, max: 2, label: "Speed" },
    u_scale: { type: "float", value: 1.4, min: 0.3, max: 4, label: "Scale" },
    u_warp: { type: "float", value: 0.7, min: 0, max: 2, label: "Warp" },
    u_freq: { type: "float", value: 4.0, min: 1, max: 12, label: "Weave" },
    u_sheen: { type: "float", value: 2.2, min: 0.5, max: 6, label: "Sheen" },
    u_grain: { type: "float", value: 0.03, min: 0, max: 0.2, label: "Grain" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // Two rounds of domain warping create the soft folds of the fabric.
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    q += u_warp * vec2(
      fbm(q + vec2(0.0, t * 0.2) + fi * 3.1),
      fbm(q + vec2(5.2, -t * 0.17) - fi * 2.3)
    );
  }

  // Diagonal weave running through the warped field.
  float lines = sin((q.x + q.y) * u_freq + fbm(q * 1.5) * 2.0);
  float s = lines * 0.5 + 0.5;

  vec3 col = mix(u_colorA, u_colorB, s);
  // Anisotropic sheen — sharp bright glints where the weave peaks.
  col += vec3(1.0) * pow(s, u_sheen * 4.0) * 0.18;
  col = mix(col, col * 1.08, pow(s, u_sheen));

  col += grain(uv + fract(u_time * 0.5)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
