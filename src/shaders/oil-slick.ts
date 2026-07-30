import type { ShaderDef } from "../core/types";

/**
 * Oil Slick — a petrol film on wet asphalt. Same thin-film physics as Holo
 * Foil, but the thickness map is a slow, smeared fbm rather than cloth folds,
 * so the rainbow pools in broad organic islands instead of tracking creases.
 */
export const oilSlick: ShaderDef = {
  id: "oil-slick",
  name: "Oil Slick",
  description: "Petrol rainbow pooling on wet asphalt.",
  category: "iridescent",
  colorRoles: { u_base: "dark" },
  uniforms: {
    u_base: { type: "color", value: [0.03, 0.03, 0.045], label: "Asphalt" },
    u_speed: { type: "float", value: 0.22, min: 0, max: 1.5, label: "Speed" },
    u_scale: { type: "float", value: 1.5, min: 0.3, max: 5, label: "Scale" },
    u_thickness: { type: "float", value: 320, min: 150, max: 800, label: "Film nm" },
    u_spread: { type: "float", value: 300, min: 50, max: 1400, label: "Rainbow spread" },
    u_coverage: { type: "float", value: 0.6, min: 0, max: 1, label: "Coverage" },
    u_saturation: { type: "float", value: 1.0, min: 0, max: 2, label: "Saturation" },
    u_wet: { type: "float", value: 0.6, min: 0, max: 2, label: "Wet sheen" },
    u_grain: { type: "float", value: 0.03, min: 0, max: 0.25, label: "Grain" },
  },
  fragment: /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // Smeared, slowly creeping film. Everything here is deliberately
  // low-frequency: thinFilm is very sensitive to its inputs, so fine detail in
  // the thickness or view angle shatters the rainbow into confetti.
  vec2 warp = vec2(
    snoise(vec3(q * 0.45, t * 0.10)),
    snoise(vec3(q * 0.45 + 9.0, t * 0.09))
  );
  float h = snoise(vec3(q * 0.70 + warp * 0.8, t * 0.08)) * 0.65
          + snoise(vec3(q * 1.45 + warp, t * 0.07)) * 0.30;

  // Where the film actually sits — elsewhere is bare wet asphalt.
  float mask = smoothstep(0.5 - u_coverage * 0.5, 0.5 + (1.0 - u_coverage) * 0.5,
                          h * 0.5 + 0.5);

  // Thickness drives the hue; the surface is treated as near flat-on.
  float thickness = u_thickness + (h * 0.5 + 0.5) * u_spread;
  float cosTheta = 0.82 + 0.14 * snoise(vec3(q * 0.5, t * 0.06));
  vec3 film = thinFilm(thickness, cosTheta);
  film = pow(clamp(film, 0.0, 1.0), vec3(1.5));
  film = mix(vec3(luma(film)), film, u_saturation);

  // Wet asphalt underneath: dark, with a broad specular sheen.
  float sheen = pow(clamp(snoise(vec3(q * 0.9, -t * 0.12)) * 0.5 + 0.5, 0.0, 1.0), 3.0);
  vec3 col = u_base + vec3(0.10, 0.11, 0.14) * sheen * u_wet;

  col = mix(col, film * 1.15, mask * 0.92);

  col += grain(uv + fract(u_time * 0.5)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
