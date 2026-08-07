import type { ShaderDef } from "../core/types";

/**
 * Holo Foil — crinkled iridescent foil, lit by true spectral thin-film
 * interference rather than a tuned RGB approximation.
 *
 * Iridescence is a spectral phenomenon: a coating's reflectance depends on
 * wavelength, so the honest way to colour it is to evaluate that reflectance
 * across the visible spectrum, weight each sample by the CIE colour-matching
 * functions, and convert the resulting XYZ back to sRGB. `cmf()` below is the
 * multi-lobe gaussian fit from Wyman, Sloan & Shirley. The foil's surface is a
 * crinkled height field (fbm warping fbm, kept low-frequency — fine detail
 * here shatters the interference into confetti); its normal drives both the
 * thin-film phase and the specular highlight. The cursor tilts the light
 * until it moves, the foil idles on a slow automatic sweep.
 */
export const holoFoil: ShaderDef = {
  id: "holo-foil",
  name: "Iridescent Foil",
  description: "Crinkled foil under real spectral thin-film interference.",
  category: "iridescent",
  interactive: true,
  uniforms: {
    u_thickness: { type: "float", value: 520, min: 150, max: 1200, label: "Film nm" },
    u_ior: { type: "float", value: 1.62, min: 1.1, max: 2.8, label: "Film IOR" },
    u_scale: { type: "float", value: 1.75, min: 0.6, max: 8, label: "Crinkle scale" },
    u_relief: { type: "float", value: 0.36, min: 0.02, max: 1, label: "Relief" },
    u_lightHeight: { type: "float", value: 0.9, min: 0, max: 3, label: "Light height" },
    u_gloss: { type: "float", value: 0.6, min: 0, max: 1, label: "Gloss" },
    u_gain: { type: "float", value: 2.2, min: 0, max: 4, label: "Gain" },
    u_grain: { type: "float", value: 0.035, min: 0, max: 0.2, label: "Grain" },
  },
  fragment: /* glsl */ `
// Wavelength -> CIE XYZ colour-matching functions (Wyman, Sloan & Shirley's
// multi-lobe gaussian fit). This is what makes the interference read as a
// true spectral hue rather than a hand-tuned rainbow gradient.
float gp(float x, float mu, float s1, float s2) {
  float t = (x - mu) * ((x < mu) ? s1 : s2);
  return exp(-0.5 * t * t);
}
vec3 cmf(float w) {
  float x = 1.056 * gp(w, 599.8, 0.0264, 0.0323) + 0.362 * gp(w, 442.0, 0.0624, 0.0374)
          - 0.065 * gp(w, 501.1, 0.0490, 0.0382);
  float y = 0.821 * gp(w, 568.8, 0.0213, 0.0247) + 0.286 * gp(w, 530.9, 0.0613, 0.0322);
  float z = 1.217 * gp(w, 437.0, 0.0845, 0.0278) + 0.681 * gp(w, 459.0, 0.0385, 0.0725);
  return vec3(x, y, z);
}
vec3 xyz2rgb(vec3 c) {
  return mat3( 3.2406, -0.9689,  0.0557,
              -1.5372,  1.8758, -0.2040,
              -0.4986,  0.0415,  1.0570) * c;
}

// Thin-film interference, summed per wavelength across the visible range and
// reprojected to sRGB. d: film thickness in nanometres. n: film IOR.
// cosTi: cosine of the incidence angle against the half-vector.
vec3 filmRGB(float d, float n, float cosTi) {
  float s2 = 1.0 - cosTi * cosTi;
  float cosTt = sqrt(max(1.0 - s2 / (n * n), 0.0));
  vec3 xyz = vec3(0.0);
  float yw = 0.0;
  for (int i = 0; i < 24; i++) {
    float w = 390.0 + 340.0 * (float(i) + 0.5) / 24.0;
    float ii = 0.5 + 0.5 * cos(4.0 * PI * n * d * cosTt / w);
    vec3 c = cmf(w);
    xyz += c * ii;
    yw += c.y;
  }
  return max(xyz2rgb(xyz / max(yw, 1e-4)), 0.0);
}

// Crinkled-foil height field: fbm of an fbm-warped domain, kept low-frequency
// so the derived normal stays smooth rather than noisy. Two fixed-octave
// variants rather than a parameterised loop count — WebGL1 loop bounds have
// to be compile-time constants.
float crinkleFbm4(vec2 p) {
  float s = 0.0, a = 0.5, n = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * snoise(p);
    n += a;
    a *= 0.5;
    p = rot(0.5) * p * 2.02;
  }
  return s / max(n, 1e-4);
}
float crinkleFbm5(vec2 p) {
  float s = 0.0, a = 0.5, n = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * snoise(p);
    n += a;
    a *= 0.5;
    p = rot(0.5) * p * 2.02;
  }
  return s / max(n, 1e-4);
}
float crinkle(vec2 p) {
  vec2 q = vec2(crinkleFbm4(p), crinkleFbm4(p + vec2(3.1, 7.7)));
  return crinkleFbm5(p + 1.7 * q);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;

  vec2 cp = p * u_scale + vec2(u_time * 0.015, u_time * 0.008);
  float e = 0.004 * u_scale;
  float h0 = crinkle(cp), hx = crinkle(cp + vec2(e, 0.0)), hy = crinkle(cp + vec2(0.0, e));
  vec3 n = normalize(vec3(-(hx - h0) / e, -(hy - h0) / e, 1.0 / max(u_relief, 0.02)));

  // The light tilts with the cursor, sweeping the spectrum across the
  // creases — until the pointer actually moves, it idles on a slow sweep.
  vec2 idle = vec2(sin(u_time * 0.37) * 1.1, cos(u_time * 0.29) * 0.7);
  vec2 mp = mix(idle, mouseSmoothPos(), u_mouseEnter);

  vec3 E = normalize(vec3(-p, 2.4));
  vec3 L = normalize(vec3(mp - p, 0.35 + u_lightHeight));
  vec3 H = normalize(E + L);

  float thickness = u_thickness * (0.55 + 0.95 * h0);
  vec3 irid = filmRGB(thickness, u_ior, clamp(dot(n, H), 0.0, 1.0));

  float spec = pow(max(dot(n, H), 0.0), mix(14.0, 900.0, u_gloss));
  float diff = max(dot(n, L), 0.0);
  float fres = pow(1.0 - max(dot(n, E), 0.0), 4.0);

  vec3 col = vec3(0.03, 0.032, 0.042);
  col += irid * (0.32 + 1.3 * spec + 0.6 * fres) * (0.45 + 0.9 * diff) * u_gain;
  col += vec3(1.0, 0.97, 0.93) * spec * 0.4;
  col *= 0.85 + 0.5 * h0;

  col += grain(uv + fract(u_time * 0.5)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
