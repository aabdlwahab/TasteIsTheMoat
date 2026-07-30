import type { ShaderDef } from "../core/types";

/**
 * Holo Foil — holographic fabric, inspired by Dmitry Kurash's "holocloth".
 *
 * A height field of soft cloth folds is built from fbm, normals are taken from
 * its gradient, and thin-film interference colours the surface by view angle.
 * Moving the cursor tilts the virtual view direction, so the rainbow sweeps
 * across the folds the way real holographic foil does when you tilt it.
 * Creases pick up ambient occlusion and the peaks catch a specular glint.
 */
export const holoFoil: ShaderDef = {
  id: "holo-foil",
  name: "Holo Foil",
  description: "Holographic fabric. Rainbow shifts as you move the cursor.",
  category: "iridescent",
  interactive: true,
  uniforms: {
    u_tint: { type: "color", value: [0.55, 0.60, 0.85], label: "Base tint" },
    u_speed: { type: "float", value: 0.25, min: 0, max: 1.5, label: "Speed" },
    u_scale: { type: "float", value: 1.1, min: 0.4, max: 5, label: "Fold scale" },
    u_thickness: { type: "float", value: 380, min: 180, max: 900, label: "Film nm" },
    u_spread: { type: "float", value: 260, min: 0, max: 1400, label: "Rainbow spread" },
    u_relief: { type: "float", value: 0.35, min: 0, max: 1.5, label: "Relief" },
    u_saturation: { type: "float", value: 1.1, min: 0, max: 2, label: "Saturation" },
    u_gloss: { type: "float", value: 0.7, min: 0, max: 2, label: "Gloss" },
    u_ao: { type: "float", value: 0.6, min: 0, max: 1.5, label: "Crease shade" },
    u_parallax: { type: "float", value: 1.0, min: 0, max: 3, label: "Cursor tilt" },
    u_grain: { type: "float", value: 0.035, min: 0, max: 0.2, label: "Grain" },
  },
  fragment: /* glsl */ `
// Cloth height field. Deliberately smooth and low-frequency: sharp detail here
// produces noisy normals, which shatters the interference colours into grey.
float cloth(vec2 q, float t) {
  float h  = snoise(vec3(q * 0.75, t * 0.15)) * 0.60;
  h += snoise(vec3(q * 1.60 + 3.0, t * 0.12)) * 0.28;
  h += snoise(vec3(q * 3.10 - 2.0, t * 0.10)) * 0.11;
  return h;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // Height field and its gradient -> surface normal. A generous epsilon keeps
  // the normal smooth rather than chasing tiny wiggles.
  float e = 0.012;
  float h  = cloth(q, t);
  float hx = cloth(q + vec2(e, 0.0), t);
  float hy = cloth(q + vec2(0.0, e), t);
  vec2 grad = vec2(hx - h, hy - h) / e;
  vec3 n = normalize(vec3(-grad * u_relief, 1.0));

  // The cursor tilts the view direction, sweeping the rainbow across the cloth.
  vec2 m = mouseSmoothPos() * u_parallax;
  vec3 viewDir = normalize(vec3(-m * 0.55, 1.0));
  vec3 lightDir = normalize(vec3(0.35, 0.55, 0.9));

  float cosTheta = clamp(dot(n, viewDir), 0.0, 1.0);

  // Thin-film interference. Thickness varies with the folds, which is what
  // turns a flat rainbow into oily, foil-like banding.
  // Slope adds a little extra banding along the fold edges, but only a little:
  // large values here shatter the sweep into a busy oil-slick.
  float thickness = u_thickness + h * u_spread + dot(grad, grad) * 6.0;
  vec3 film = thinFilm(thickness, cosTheta);
  film = mix(vec3(luma(film)), film, u_saturation);
  // Contrast curve: drops the muddy mid-tones, keeps the vivid band peaks.
  film = pow(clamp(film, 0.0, 1.0), vec3(1.6));

  // Keep most of the surface dark and let the interference read as a sheen
  // that catches the light, rather than painting every hue at full strength.
  float fr = fresnel(cosTheta, 0.10);
  float sheen = clamp(0.18 + fr * 1.35, 0.0, 1.0);
  vec3 col = mix(u_tint * 0.09, film * u_tint * 2.6, sheen);

  // Diffuse shaping so the folds read as three-dimensional.
  float diff = clamp(dot(n, lightDir), 0.0, 1.0);
  col *= 0.55 + 0.65 * diff;

  // Ambient occlusion in the creases (low areas of the height field).
  float ao = 1.0 - u_ao * clamp(-h, 0.0, 1.0);
  col *= ao;

  // Specular glint on the fold peaks.
  vec3 hv = normalize(lightDir + viewDir);
  float spec = pow(clamp(dot(n, hv), 0.0, 1.0), 42.0) * u_gloss;
  col += vec3(1.0) * spec;

  // Sparse glitter — coarse cells and a hard threshold, so it reads as flecks
  // in the foil rather than sensor noise.
  vec2 cell = floor(gl_FragCoord.xy / 5.0);
  float sparkle = step(0.9975, hash21(cell + floor(u_time * 3.0)));
  col += sparkle * fr * 0.55;

  col += grain(uv + fract(u_time * 0.5)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
