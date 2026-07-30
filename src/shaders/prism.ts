import type { ShaderDef } from "../core/types";

/**
 * Prism — light dispersed through moving glass. A refraction offset is applied
 * with a different magnitude per wavelength, which is literally what a prism
 * does: shorter wavelengths bend further, so the channels separate into a
 * spectrum along the steepest part of the surface.
 */
export const prism: ShaderDef = {
  id: "prism",
  name: "Prism",
  description: "Light splitting into spectra through drifting glass.",
  category: "iridescent",
  interactive: true,
  colorRoles: { u_bg: "dark", u_beam: "bright" },
  uniforms: {
    u_bg: { type: "color", value: [0.02, 0.02, 0.05], label: "Background" },
    u_beam: { type: "color", value: [1.0, 0.98, 0.95], label: "Beam" },
    u_speed: { type: "float", value: 0.3, min: 0, max: 1.5, label: "Speed" },
    u_scale: { type: "float", value: 1.7, min: 0.3, max: 5, label: "Scale" },
    u_dispersion: { type: "float", value: 0.55, min: 0, max: 2.5, label: "Dispersion" },
    u_bands: { type: "float", value: 1.8, min: 0.5, max: 12, label: "Bands" },
    u_sharp: { type: "float", value: 3.2, min: 0.5, max: 8, label: "Sharpness" },
    u_cursor: { type: "float", value: 0.5, min: 0, max: 2, label: "Cursor tilt" },
  },
  fragment: /* glsl */ `
// Smooth height field standing in for the slab of glass. Kept to two low
// octaves on purpose — sharp detail here turns the spectrum into static.
float glass(vec2 q, float t) {
  return snoise(vec3(q * 0.80, t * 0.12)) * 0.70
       + snoise(vec3(q * 1.70 + 4.0, t * 0.10)) * 0.30;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // Surface gradient of the glass, tilted by the cursor.
  vec2 m = mouseSmoothPos() * u_cursor * u_mouseEnter;
  float e = 0.02;
  float h  = glass(q, t);
  float hx = glass(q + vec2(e, 0.0), t);
  float hy = glass(q + vec2(0.0, e), t);
  vec2 grad = vec2(hx - h, hy - h) / e;

  // Refraction axis: steeper glass bends light further, and the pointer
  // swings the whole fan around.
  vec2 dir = normalize(grad + m * 1.2 + vec2(1e-5));
  float steep = length(grad);

  // Position along the refraction axis sets the wavelength, so the spectrum
  // fans out smoothly rather than being sampled per channel.
  float axis = dot(p, dir) * u_bands
             + h * u_dispersion * 4.0
             + t * 0.4;
  vec3 tint = iridescence(axis * 0.12);

  // Light is concentrated where the glass is steepest — those are the facets.
  // The low multiplier matters: gradients are non-zero nearly everywhere, so
  // without it the whole frame lights up and the fans disappear into marbling.
  float facet = pow(clamp(steep * 0.30, 0.0, 1.0), u_sharp);

  vec3 col = u_bg;
  col += tint * facet * 2.4;
  col += u_beam * pow(facet, 2.2) * 0.45;    // hot core of the beam

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
