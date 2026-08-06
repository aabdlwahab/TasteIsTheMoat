import type { ShaderDef } from "../core/types";

/**
 * Halftone — print-style dot screen. A continuous tone field is sampled on a
 * rotated grid and each cell's dot is sized by the local brightness, exactly
 * as a real halftone screen works. The pointer adds a bright lobe that swells
 * the dots around it.
 */
export const halftone: ShaderDef = {
  id: "halftone",
  name: "Halftone",
  description: "Print-style dot screen that swells around the cursor.",
  category: "geometric",
  interactive: true,
  colorRoles: { u_paper: "dark", u_ink: "mid", u_ink2: "accent" },
  uniforms: {
    u_paper: { type: "color", value: [0.06, 0.07, 0.10], label: "Paper" },
    u_ink: { type: "color", value: [0.95, 0.35, 0.55], label: "Ink" },
    u_ink2: { type: "color", value: [0.35, 0.85, 0.95], label: "Ink 2" },
    u_speed: { type: "float", value: 0.3, min: 0, max: 1.5, label: "Speed" },
    u_scale: { type: "float", value: 1.6, min: 0.3, max: 5, label: "Tone scale" },
    u_dots: { type: "float", value: 22.0, min: 8, max: 140, label: "Screen density" },
    u_angle: { type: "float", value: 0.4, min: 0, max: 1.57, label: "Screen angle" },
    u_cursor: { type: "float", value: 0.6, min: 0, max: 2, label: "Cursor swell" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Continuous tone we are going to screen.
  float tone = fbm(vec3(p * u_scale, t * 0.4)) * 0.5 + 0.5;

  // A soft lobe under the cursor pushes the local tone up. Raw, so "under the
  // cursor" stays literally true while the pointer moves.
  float d = length(p - mousePos());
  tone += exp(-d * d * 3.5) * u_cursor * u_mouseEnter;
  tone = clamp(tone, 0.0, 1.0);

  // Rotated screen grid.
  vec2 g = rot(u_angle) * p * u_dots;
  vec2 cell = fract(g) - 0.5;

  // Dot radius tracks the tone; 0.707 covers the cell corner-to-corner.
  float radius = sqrt(tone) * 0.72;
  float dist = length(cell);
  // Anti-alias the dot edge against the screen grid.
  float aa = fwidth(dist) * 1.2;
  float dot_ = smoothstep(radius + aa, radius - aa, dist);

  // Two inks on slightly different screen angles, like real colour printing.
  vec2 g2 = rot(u_angle + 0.6) * p * u_dots;
  float dist2 = length(fract(g2) - 0.5);
  float radius2 = sqrt(clamp(tone - 0.25, 0.0, 1.0)) * 0.62;
  float dot2 = smoothstep(radius2 + aa, radius2 - aa, dist2);

  vec3 col = u_paper;
  col = mix(col, u_ink2, dot2 * 0.75);
  col = mix(col, u_ink, dot_);

  gl_FragColor = vec4(col, 1.0);
}
`,
};
