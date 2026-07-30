import type { ShaderDef } from "../core/types";

/**
 * Magnetic Dots — a regular dot grid that reacts to the pointer. Each dot is
 * displaced along the vector from the cursor (repel) or toward it (attract,
 * with negative force), and grows brighter as it is disturbed. Clicking sends
 * a shockwave through the field.
 */
export const magneticDots: ShaderDef = {
  id: "magnetic-dots",
  name: "Magnetic Dots",
  description: "A dot grid that bends around your cursor. Click to pulse.",
  category: "interactive",
  interactive: true,
  colorRoles: { u_bg: "dark", u_dot: "mid", u_hot: "accent" },
  uniforms: {
    u_bg: { type: "color", value: [0.04, 0.05, 0.09], label: "Background" },
    u_dot: { type: "color", value: [0.45, 0.72, 1.0], label: "Dot" },
    u_hot: { type: "color", value: [1.0, 0.45, 0.75], label: "Disturbed" },
    u_density: { type: "float", value: 14, min: 4, max: 40, label: "Density" },
    u_size: { type: "float", value: 0.17, min: 0.03, max: 0.45, label: "Dot size" },
    u_force: { type: "float", value: 0.35, min: -1, max: 1.5, label: "Force" },
    u_reach: { type: "float", value: 2.2, min: 0.3, max: 8, label: "Falloff" },
    u_drift: { type: "float", value: 0.25, min: 0, max: 1.5, label: "Idle drift" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  vec2 m = mouseSmoothPos();

  vec2 gridUv = p * u_density;
  vec2 id = floor(gridUv);
  vec2 gv = fract(gridUv) - 0.5;

  // Where this cell's dot sits in p-space.
  vec2 centre = (id + 0.5) / u_density;

  // Push along the vector away from the cursor, falling off with distance.
  vec2 dir = centre - m;
  float dist = length(dir);
  float push = u_force * exp(-dist * dist * u_reach) * u_mouseEnter;

  // Click shockwave rides on top of the steady push.
  push += rippleField(centre, 1.4, 7.0, 1.4) * 0.35;

  vec2 disp = normalize(dir + vec2(1e-5)) * push;

  // A slow idle wander so the grid breathes when the pointer is away.
  disp += vec2(
    snoise(vec3(centre * 1.3, u_time * 0.2)),
    snoise(vec3(centre * 1.3 + 7.0, u_time * 0.2))
  ) * u_drift * 0.06;

  // Displacement is in p-space; convert to this cell's local space.
  vec2 local = gv - disp * u_density;

  float d = length(local);
  float dot_ = smoothstep(u_size, u_size * 0.55, d);

  // Disturbed dots glow and shift colour.
  float energy = clamp(abs(push) * 3.0, 0.0, 1.0);
  vec3 dotCol = mix(u_dot, u_hot, energy);

  vec3 col = mix(u_bg, dotCol, dot_);
  col += dotCol * dot_ * energy * 0.6;          // bloom on active dots

  // Gentle vignette.
  col *= 1.0 - 0.25 * dot(p, p) * 0.2;

  gl_FragColor = vec4(col, 1.0);
}
`,
};
