import type { ShaderDef } from "../core/types";

/**
 * Voronoi Cells — a shifting crystalline mosaic. F2-F1 gives the cell borders,
 * F1 shades each cell's interior, and a second octave adds fracture detail.
 */
export const voronoiCells: ShaderDef = {
  id: "voronoi-cells",
  name: "Voronoi Cells",
  description: "Crystalline mosaic that slowly rearranges itself.",
  category: "organic",
  colorRoles: { u_colorA: "dark", u_colorB: "mid", u_edge: "accent" },
  uniforms: {
    u_colorA: { type: "color", value: [0.04, 0.06, 0.13], label: "Cell dark" },
    u_colorB: { type: "color", value: [0.18, 0.40, 0.62], label: "Cell light" },
    u_edge: { type: "color", value: [0.75, 0.92, 1.0], label: "Edge" },
    u_speed: { type: "float", value: 0.4, min: 0, max: 2, label: "Speed" },
    u_density: { type: "float", value: 4.5, min: 1, max: 14, label: "Density" },
    u_edgeWidth: { type: "float", value: 0.06, min: 0.005, max: 0.3, label: "Edge width" },
    u_glow: { type: "float", value: 0.5, min: 0, max: 2, label: "Edge glow" },
    u_detail: { type: "float", value: 0.4, min: 0, max: 1, label: "Fracture" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_density;

  vec2 v = voronoi(q, t);
  float border = v.y - v.x;                    // 0 at cell edges

  // Second, finer layer of cells for fracture detail inside each cell.
  vec2 v2 = voronoi(q * 2.7 + 11.0, t * 0.7);
  float border2 = v2.y - v2.x;

  // Shade cell interiors by their distance field.
  float shade = smoothstep(0.0, 0.9, v.x);
  vec3 col = mix(u_colorA, u_colorB, shade);

  // Fracture lines, kept subtle.
  col = mix(col, u_colorA, smoothstep(u_edgeWidth * 2.0, 0.0, border2) * u_detail);

  // Bright borders with a soft glow either side.
  float edge = smoothstep(u_edgeWidth, 0.0, border);
  float halo = smoothstep(u_edgeWidth * 5.0, 0.0, border);
  col = mix(col, u_edge, edge);
  col += u_edge * halo * u_glow * 0.25;

  col *= 1.0 - 0.3 * dot(p, p) * 0.2;
  col += grain(uv + fract(u_time * 0.5)) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
