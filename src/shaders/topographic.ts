import type { ShaderDef } from "../core/types";

/**
 * Topographic — contour lines over drifting terrain, like a living map. Bands
 * are extracted by taking fract() of the height field; dividing by fwidth()
 * keeps every line the same visual weight no matter how steep the slope is.
 */
export const topographic: ShaderDef = {
  id: "topographic",
  name: "Topographic",
  description: "Contour map lines flowing over shifting terrain.",
  category: "geometric",
  colorRoles: { u_bg: "dark", u_line: "mid", u_high: "accent" },
  uniforms: {
    u_bg: { type: "color", value: [0.04, 0.06, 0.09], label: "Background" },
    u_line: { type: "color", value: [0.35, 0.85, 0.75], label: "Contour" },
    u_high: { type: "color", value: [0.95, 0.75, 0.35], label: "Peaks" },
    u_speed: { type: "float", value: 0.25, min: 0, max: 1.5, label: "Speed" },
    u_scale: { type: "float", value: 2.2, min: 0.4, max: 6, label: "Scale" },
    u_levels: { type: "float", value: 12.0, min: 2, max: 40, label: "Contours" },
    u_weight: { type: "float", value: 1.1, min: 0.2, max: 4, label: "Line weight" },
    u_fill: { type: "float", value: 0.25, min: 0, max: 1, label: "Elevation fill" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Terrain height, slowly evolving.
  float h = fbm(vec3(p * u_scale, t * 0.3));
  float elevation = h * 0.5 + 0.5;

  // Contour bands.
  float bands = elevation * u_levels;
  float f = abs(fract(bands) - 0.5);
  // fwidth keeps the stroke a constant width on screen regardless of slope.
  float w = fwidth(bands) * u_weight;
  float line = 1.0 - smoothstep(0.0, w, f);

  // Tint the terrain by elevation, kept subtle so the lines stay the subject.
  vec3 col = mix(u_bg, u_bg + u_line * 0.35, elevation * u_fill);

  // Every fifth contour is an index line — heavier, like a real map.
  float major = step(0.5, 1.0 - abs(fract(bands / 5.0) - 0.5) * 2.0);
  vec3 lineCol = mix(u_line, u_high, smoothstep(0.55, 0.95, elevation));
  col = mix(col, lineCol, line * (0.55 + 0.45 * major));

  // Peaks glow faintly.
  col += u_high * smoothstep(0.8, 1.0, elevation) * 0.2;

  col *= 1.0 - 0.3 * dot(p, p) * 0.18;
  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
