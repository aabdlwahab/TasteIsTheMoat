import type { ShaderDef } from "../core/types";

/**
 * Nebula — deep-space gas clouds. Layered fbm at several scales is coloured by
 * density and stacked with additive blending, which is what gives real nebula
 * photographs their glowing, translucent depth. Scattered stars sit on top.
 */
export const nebula: ShaderDef = {
  id: "nebula",
  name: "Nebula",
  description: "Glowing interstellar gas clouds with scattered stars.",
  category: "space",
  colorRoles: { u_void: "dark", u_gasA: "mid", u_gasB: "bright", u_gasC: "accent" },
  uniforms: {
    u_void: { type: "color", value: [0.01, 0.01, 0.035], label: "Void" },
    u_gasA: { type: "color", value: [0.85, 0.18, 0.45], label: "Gas warm" },
    u_gasB: { type: "color", value: [0.20, 0.35, 0.95], label: "Gas cool" },
    u_gasC: { type: "color", value: [0.95, 0.72, 0.35], label: "Core" },
    u_speed: { type: "float", value: 0.12, min: 0, max: 1, label: "Speed" },
    u_scale: { type: "float", value: 1.5, min: 0.3, max: 5, label: "Scale" },
    u_density: { type: "float", value: 1.0, min: 0.2, max: 2.5, label: "Density" },
    u_stars: { type: "float", value: 0.7, min: 0, max: 2, label: "Stars" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // Domain-warp the gas so the clouds curl instead of drifting as a slab.
  vec2 warp = vec2(fbm(q * 0.8 + t * 0.3), fbm(q * 0.8 + 5.0 - t * 0.25));
  vec2 w = q + warp * 1.1;

  // Three density fields at different scales.
  float d1 = fbm(w + vec2(0.0, t * 0.2)) * 0.5 + 0.5;
  float d2 = fbm(w * 1.9 - 3.0 + t * 0.15) * 0.5 + 0.5;
  float d3 = fbm(w * 3.6 + 7.0 - t * 0.1) * 0.5 + 0.5;

  vec3 col = u_void;

  // Additive gas layers — dense regions glow brighter and warmer.
  col += u_gasB * pow(d1, 2.2) * 0.85 * u_density;
  col += u_gasA * pow(d2, 3.0) * 0.70 * u_density;
  col += u_gasC * pow(d1 * d2, 4.5) * 1.30 * u_density;   // hot cores
  col += u_gasB * pow(d3, 5.0) * 0.30 * u_density;        // wispy filaments

  // Dark dust lanes carved out of the gas.
  float dust = smoothstep(0.35, 0.0, fbm(w * 1.3 + 12.0) * 0.5 + 0.5);
  col *= 1.0 - dust * 0.55;

  // Sparse foreground stars.
  vec2 sid = floor(gl_FragCoord.xy / 3.0);
  float s = hash21(sid);
  float star = step(0.9985, s) * pow(hash21(sid + 2.1), 1.5);
  float tw = 0.7 + 0.3 * sin(u_time * 2.0 + s * 40.0);
  col += vec3(1.0, 0.96, 0.92) * star * tw * u_stars * 2.0;

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
