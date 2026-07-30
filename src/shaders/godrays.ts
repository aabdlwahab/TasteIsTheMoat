import type { ShaderDef } from "../core/types";

/**
 * God Rays — volumetric light shafts from a moveable source. Rays are built by
 * marching outward from the light in screen space, accumulating a noisy
 * occlusion mask; the pointer moves the sun, so the whole scene relights.
 */
export const godrays: ShaderDef = {
  id: "godrays",
  name: "God Rays",
  description: "Volumetric light shafts. Move the cursor to move the sun.",
  category: "space",
  interactive: true,
  colorRoles: { u_bg: "dark", u_light: "accent", u_haze: "mid" },
  uniforms: {
    u_bg: { type: "color", value: [0.02, 0.03, 0.06], label: "Background" },
    u_light: { type: "color", value: [1.0, 0.82, 0.55], label: "Light" },
    u_haze: { type: "color", value: [0.25, 0.35, 0.6], label: "Haze" },
    u_speed: { type: "float", value: 0.3, min: 0, max: 1.5, label: "Speed" },
    u_scale: { type: "float", value: 2.6, min: 0.5, max: 8, label: "Cloud scale" },
    u_density: { type: "float", value: 0.75, min: 0, max: 2, label: "Density" },
    u_decay: { type: "float", value: 0.94, min: 0.7, max: 0.995, label: "Decay" },
    u_follow: { type: "float", value: 1.0, min: 0, max: 1, label: "Cursor follow" },
  },
  fragment: /* glsl */ `
// Occlusion mask the light has to shine through.
float occluder(vec2 x, float t) {
  float n = fbm(x * u_scale + vec2(t * 0.2, t * 0.1));
  return smoothstep(-0.1, 0.55, n);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // The sun drifts on its own, and follows the cursor when asked to.
  vec2 idle = vec2(sin(t * 0.4) * 0.35, 0.45 + cos(t * 0.3) * 0.15);
  vec2 sun = mix(idle, mouseSmoothPos(), u_follow * u_mouseEnter);

  // March from this pixel toward the sun, accumulating light that gets past
  // the occluder. This is the classic screen-space radial-blur approach.
  const int STEPS = 24;
  vec2 delta = (sun - p) / float(STEPS);
  vec2 pos = p;
  float illum = 1.0;
  float acc = 0.0;

  for (int i = 0; i < STEPS; i++) {
    pos += delta;
    float clear = 1.0 - occluder(pos, t);   // how transparent it is here
    acc += clear * illum;
    illum *= u_decay;                        // light falls off along the ray
  }
  acc /= float(STEPS);

  // Falloff with distance from the sun.
  float d = length(p - sun);
  float falloff = 1.0 / (1.0 + d * d * 2.2);

  vec3 col = u_bg;
  col += u_haze * fbm(p * 1.5 + t * 0.1) * 0.06;         // ambient haze
  col += u_light * acc * u_density * falloff * 2.2;      // the shafts
  col += u_light * smoothstep(0.28, 0.0, d) * 0.75;      // the sun itself

  // Darken the clouds that are doing the occluding, for contrast.
  col *= mix(1.0, 0.55, occluder(p, t) * 0.8);

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
