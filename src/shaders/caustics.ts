import type { ShaderDef } from "../core/types";

/**
 * Caustics — the net of light on a pool floor. Layered voronoi F1 fields are
 * inverted and sharpened into bright filaments, then split slightly per colour
 * channel to mimic the dispersion of light through moving water.
 */
export const caustics: ShaderDef = {
  id: "caustics",
  name: "Caustics",
  description: "Underwater light webs dancing on a pool floor.",
  category: "organic",
  colorRoles: { u_water: "dark", u_light: "accent" },
  uniforms: {
    u_water: { type: "color", value: [0.02, 0.14, 0.22], label: "Water" },
    u_light: { type: "color", value: [0.55, 0.95, 1.0], label: "Light" },
    u_speed: { type: "float", value: 0.5, min: 0, max: 2, label: "Speed" },
    u_scale: { type: "float", value: 4.0, min: 1, max: 12, label: "Scale" },
    u_sharp: { type: "float", value: 8.0, min: 1, max: 20, label: "Sharpness" },
    u_intensity: { type: "float", value: 0.7, min: 0, max: 3, label: "Intensity" },
    u_dispersion: { type: "float", value: 0.35, min: 0, max: 2, label: "Dispersion" },
  },
  fragment: /* glsl */ `
// One caustic layer. The bright net follows the *borders* between cells
// (F2-F1 -> 0), which is what gives caustics their thin interlocking
// filaments; using the cell centres instead just yields blobs.
float caustic(vec2 q, float t) {
  vec2 v = voronoi(q, t);
  float border = clamp(v.y - v.x, 0.0, 1.0);
  return pow(1.0 - border, u_sharp);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Warp the sampling grid so the web breathes rather than just sliding.
  vec2 warp = vec2(fbm(p * 1.2 + t * 0.15), fbm(p * 1.2 + 7.0 - t * 0.12));
  vec2 q = p * u_scale + warp * 0.6;

  // Two overlapping layers at different scales read as depth in the water.
  float d = u_dispersion * 0.04;
  float r = caustic(q + vec2(d, 0.0), t) + caustic(q * 1.7 + 5.0 + vec2(d, 0.0), t * 1.3) * 0.5;
  float g = caustic(q,                 t) + caustic(q * 1.7 + 5.0,                 t * 1.3) * 0.5;
  float b = caustic(q - vec2(d, 0.0), t) + caustic(q * 1.7 + 5.0 - vec2(d, 0.0), t * 1.3) * 0.5;

  vec3 c = vec3(r, g, b) * u_intensity;

  vec3 col = u_water + u_light * c;

  // Depth falloff so the top of the frame reads as deeper water.
  col *= mix(0.75, 1.15, uv.y);

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
