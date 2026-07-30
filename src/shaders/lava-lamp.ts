import type { ShaderDef } from "../core/types";

/**
 * Lava Lamp — slow wax blobs rising and falling. Blobs are summed into a
 * scalar field like metaballs, but with vertical drift and a smooth-min so
 * they stretch and neck as they merge, plus a warm backlight through the glass.
 */
export const lavaLamp: ShaderDef = {
  id: "lava-lamp",
  name: "Lava Lamp",
  description: "Slow wax blobs rising through warm backlit glass.",
  category: "organic",
  colorRoles: { u_glass: "dark", u_waxA: "mid", u_waxB: "accent" },
  uniforms: {
    u_glass: { type: "color", value: [0.10, 0.02, 0.16], label: "Glass" },
    u_waxA: { type: "color", value: [1.0, 0.35, 0.15], label: "Wax core" },
    u_waxB: { type: "color", value: [1.0, 0.75, 0.25], label: "Wax edge" },
    u_speed: { type: "float", value: 0.35, min: 0, max: 1.5, label: "Speed" },
    u_count: { type: "float", value: 1.0, min: 0.4, max: 1.6, label: "Blob size" },
    u_threshold: { type: "float", value: 0.85, min: 0.3, max: 2.0, label: "Threshold" },
    u_wobble: { type: "float", value: 0.35, min: 0, max: 1.5, label: "Wobble" },
    u_backlight: { type: "float", value: 0.7, min: 0, max: 2, label: "Backlight" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Warm backlight glowing up through the lamp.
  vec3 col = u_glass * (0.5 + u_backlight * (1.0 - uv.y) * 1.4);

  float field = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    // Each blob cycles slowly up the lamp on its own phase.
    float phase = fract(t * (0.09 + 0.02 * sin(fi)) + fi * 0.1428);
    float y = mix(-1.15, 1.15, phase);
    float x = sin(t * 0.5 + fi * 2.4) * 0.5 + sin(t * 0.23 + fi) * 0.18;

    // Squash near the ends of the travel, like wax hitting the glass.
    float squash = 1.0 + 0.35 * sin(phase * PI);
    vec2 c = vec2(x, y);
    vec2 d = (p - c) * vec2(1.0, 1.0 / squash);

    // Wobble the blob outline so it is not a perfect circle.
    float wob = 1.0 + u_wobble * 0.25 * snoise(vec3(d * 3.0, t + fi));
    float r = (0.20 + 0.07 * sin(fi * 1.7)) * u_count * wob;

    field += (r * r) / (dot(d, d) + 1e-3);
  }

  float edge = smoothstep(u_threshold - 0.08, u_threshold + 0.08, field);
  float core = smoothstep(u_threshold + 0.5, u_threshold + 1.6, field);

  vec3 wax = mix(u_waxB, u_waxA, core);
  col = mix(col, wax, edge);

  // Rim glow where the wax meets the fluid.
  float rim = smoothstep(u_threshold + 0.30, u_threshold, field) * edge;
  col += u_waxB * rim * 0.35;

  // Soft glow bleeding into the surrounding fluid.
  col += u_waxA * smoothstep(u_threshold, u_threshold - 0.55, field)
         * (1.0 - edge) * 0.18;

  col += grain(uv + fract(u_time * 0.5)) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
