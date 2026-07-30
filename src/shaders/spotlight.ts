import type { ShaderDef } from "../core/types";

/**
 * Spotlight — a hidden pattern that only exists where the cursor shines. The
 * base surface is near-black; a soft torch around the pointer reveals a warm
 * topographic texture underneath and lights it with a falloff, so the page
 * feels like it is being explored rather than displayed.
 */
export const spotlight: ShaderDef = {
  id: "spotlight",
  name: "Spotlight",
  description: "A dark surface your cursor reveals like a torch.",
  category: "interactive",
  interactive: true,
  colorRoles: { u_bg: "dark", u_glow: "accent", u_detail: "mid" },
  uniforms: {
    u_bg: { type: "color", value: [0.03, 0.035, 0.06], label: "Hidden" },
    u_glow: { type: "color", value: [1.0, 0.72, 0.35], label: "Light" },
    u_detail: { type: "color", value: [0.25, 0.45, 0.85], label: "Pattern" },
    u_radius: { type: "float", value: 0.55, min: 0.1, max: 1.6, label: "Radius" },
    u_soft: { type: "float", value: 0.6, min: 0.05, max: 1.5, label: "Softness" },
    u_scale: { type: "float", value: 3.0, min: 0.5, max: 10, label: "Pattern scale" },
    u_speed: { type: "float", value: 0.3, min: 0, max: 1.5, label: "Speed" },
    // Enough ambient that the pattern is faintly legible before the cursor
    // arrives — a fully black resting state just looks broken.
    u_ambient: { type: "float", value: 0.18, min: 0, max: 0.6, label: "Ambient" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 m = mouseSmoothPos();

  // The concealed pattern: contour bands from a drifting noise field.
  float n = fbm(p * u_scale + vec2(t * 0.3, t * 0.15));
  float contour = abs(fract(n * 4.0) - 0.5) * 2.0;
  float lines = smoothstep(0.75, 0.05, contour);
  vec3 pattern = mix(u_detail * 0.35, u_detail, lines);
  // Warm the pattern where the noise peaks, for a bit of depth.
  pattern = mix(pattern, u_glow, smoothstep(0.35, 0.9, n) * 0.35);

  // The torch: a soft disc that grows slightly while the button is held.
  float radius = u_radius * (1.0 + u_mouseDown * 0.35);
  float d = length(p - m);
  float light = 1.0 - smoothstep(radius * (1.0 - u_soft * 0.5), radius, d);
  light *= u_mouseEnter;

  // Click rings ripple outward through the reveal mask.
  light += rippleField(p, 1.1, 10.0, 1.5) * 0.25;
  light = clamp(light, 0.0, 1.0);

  vec3 col = mix(u_bg, pattern, light * 0.95 + u_ambient);
  // Warm core falloff so the light itself is visible, not just the reveal.
  col += u_glow * pow(light, 2.5) * 0.5;

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
