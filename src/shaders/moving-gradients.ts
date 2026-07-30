import type { RGB, ShaderDef } from "../core/types";

type MovingGradientOptions = {
  id: string;
  name: string;
  description: string;
  fragment: string;
  colors?: [RGB, RGB, RGB];
};

const defaultColors: [RGB, RGB, RGB] = [
  [0.025, 0.035, 0.10],
  [0.42, 0.12, 0.95],
  [0.04, 0.88, 0.78],
];

/** Give every moving gradient a consistent set of studio controls. */
function movingGradient(options: MovingGradientOptions): ShaderDef {
  const { colors = defaultColors, ...definition } = options;
  return {
    ...definition,
    category: "gradient",
    uniforms: {
      u_colorA: { type: "color", value: colors[0], label: "Base" },
      u_colorB: { type: "color", value: colors[1], label: "Color" },
      u_colorC: { type: "color", value: colors[2], label: "Accent" },
      u_speed: {
        type: "float",
        value: 0.4,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Speed",
      },
      u_scale: {
        type: "float",
        value: 1.8,
        min: 0.3,
        max: 6,
        step: 0.01,
        label: "Scale",
      },
      u_softness: {
        type: "float",
        value: 1,
        min: 0.2,
        max: 2.5,
        step: 0.01,
        label: "Softness",
      },
      u_intensity: {
        type: "float",
        value: 1,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Intensity",
      },
    },
  };
}

export const gradientDrift = movingGradient({
  id: "gradient-drift",
  name: "Gradient Drift",
  description: "Slow mesh-like colour fields drifting past one another.",
  colors: [
    [0.03, 0.04, 0.12],
    [0.48, 0.12, 0.95],
    [0.02, 0.78, 0.95],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 q = p * u_scale * 0.55;
  vec2 warp = vec2(
    fbm(q + vec2(t * 0.11, -t * 0.07)),
    fbm(q + vec2(4.7 - t * 0.08, t * 0.09))
  );
  float a = 0.5 + 0.5 * sin(q.x * 1.6 + warp.y * 3.2 + t * 0.7);
  float b = 0.5 + 0.5 * sin(q.y * 1.8 - warp.x * 3.0 - t * 0.55);
  a = smoothstep(0.08, 0.92, a);
  b = smoothstep(0.08, 0.92, b);
  vec3 color = mix(u_colorA, u_colorB, a);
  color = mix(color, u_colorC, b * (0.35 + 0.45 * a));
  color *= 0.72 + 0.28 * u_intensity;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const auroraBloom = movingGradient({
  id: "aurora-bloom",
  name: "Aurora Bloom",
  description: "Wide luminous ribbons blooming through a midnight gradient.",
  colors: [
    [0.015, 0.025, 0.09],
    [0.15, 0.22, 0.95],
    [0.12, 0.95, 0.68],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  float noise = fbm(vec2(p.x * u_scale * 0.55 + t * 0.08, t * 0.05));
  float y1 = sin(p.x * u_scale + t * 0.65 + noise * 2.2) * 0.24;
  float y2 = sin(p.x * u_scale * 0.72 - t * 0.48 + 2.1) * 0.32;
  float width = 3.2 / max(0.2, u_softness);
  float ribbonA = exp(-abs(p.y - y1) * width);
  float ribbonB = exp(-abs(p.y - y2 + 0.16) * width * 0.8);
  float vertical = smoothstep(-1.0, 0.8, p.y);
  vec3 color = mix(u_colorA, u_colorB, ribbonB * 0.58);
  color += u_colorC * ribbonA * (0.42 + noise * 0.42) * u_intensity;
  color += u_colorB * vertical * 0.08;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const fluidSpectrum = movingGradient({
  id: "fluid-spectrum",
  name: "Fluid Spectrum",
  description: "Liquid spectral colour transported through smooth domain warping.",
  colors: [
    [0.10, 0.015, 0.18],
    [0.92, 0.10, 0.48],
    [0.04, 0.85, 0.94],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 q = p * u_scale * 0.7;
  vec2 warp = vec2(
    fbm(q + vec2(t * 0.13, 2.0)),
    fbm(q + vec2(-t * 0.10, 7.0))
  );
  float flow = fbm(q + warp * (1.1 + u_softness) + t * 0.06);
  float spectrum = 0.5 + 0.5 * sin(flow * 7.0 + q.x - q.y + t * 0.8);
  vec3 color = mix(u_colorA, u_colorB, smoothstep(0.08, 0.82, spectrum));
  color = mix(color, u_colorC, smoothstep(0.56, 1.0, flow) * 0.72);
  color += u_colorC * pow(spectrum, 7.0) * 0.12 * u_intensity;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const diagonalTide = movingGradient({
  id: "diagonal-tide",
  name: "Diagonal Tide",
  description: "Broad diagonal bands sweeping across a softened colour field.",
  colors: [
    [0.04, 0.035, 0.13],
    [0.96, 0.25, 0.50],
    [0.98, 0.66, 0.18],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 direction = normalize(vec2(0.82, 0.58));
  float noise = fbm(p * u_scale * 0.45 + vec2(t * 0.07, -t * 0.05));
  float phase = dot(p, direction) * u_scale * 2.2 + noise * 1.8 - t;
  float waveA = 0.5 + 0.5 * sin(phase);
  float waveB = 0.5 + 0.5 * sin(phase * 0.63 + 2.2);
  float edge = mix(0.18, 0.48, clamp(u_softness / 2.5, 0.0, 1.0));
  waveA = smoothstep(edge, 1.0 - edge * 0.45, waveA);
  vec3 color = mix(u_colorA, u_colorB, waveA);
  color = mix(color, u_colorC, waveB * 0.48 * u_intensity);
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const radialBloom = movingGradient({
  id: "radial-bloom",
  name: "Radial Bloom",
  description: "Overlapping radial colour blooms orbiting around the canvas.",
  colors: [
    [0.025, 0.02, 0.09],
    [0.38, 0.18, 0.98],
    [0.96, 0.18, 0.60],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 a = vec2(cos(t * 0.52), sin(t * 0.43)) * 0.45;
  vec2 b = vec2(cos(t * 0.37 + 2.2), sin(t * 0.61 + 1.4)) * 0.58;
  vec2 c = vec2(cos(-t * 0.46 + 4.1), sin(t * 0.34 + 3.0)) * 0.5;
  float focus = 3.0 * u_scale / max(0.25, u_softness);
  float bloomA = exp(-dot(p - a, p - a) * focus);
  float bloomB = exp(-dot(p - b, p - b) * focus * 0.72);
  float bloomC = exp(-dot(p - c, p - c) * focus * 0.58);
  vec3 color = u_colorA;
  color = mix(color, u_colorB, bloomA * 0.88);
  color += u_colorC * bloomB * 0.72 * u_intensity;
  color += mix(u_colorB, u_colorC, 0.5) * bloomC * 0.42;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const chromaticCurrent = movingGradient({
  id: "chromatic-current",
  name: "Chromatic Current",
  description: "A directional colour current with slowly curling eddies.",
  colors: [
    [0.015, 0.055, 0.11],
    [0.02, 0.72, 0.75],
    [0.68, 0.20, 0.96],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 q = p * u_scale * 0.72;
  float angle = snoise(q * 0.65 + t * 0.08) * 1.25;
  q = rot(angle) * q;
  float current = q.x + fbm(q + vec2(-t * 0.16, t * 0.05)) * 2.0;
  float a = 0.5 + 0.5 * sin(current * 1.8 + t * 0.65);
  float b = 0.5 + 0.5 * cos(current * 1.12 - q.y + t * 0.38);
  a = smoothstep(0.12, 0.88, a);
  b = smoothstep(0.16, 0.92, b);
  vec3 color = mix(u_colorA, u_colorB, a);
  color = mix(color, u_colorC, b * 0.62 * u_intensity);
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const softOrbs = movingGradient({
  id: "soft-orbs",
  name: "Soft Orbs",
  description: "Large blurred colour orbs floating through a dark gradient.",
  colors: [
    [0.025, 0.03, 0.08],
    [0.22, 0.35, 0.98],
    [0.92, 0.20, 0.62],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec3 color = u_colorA;
  float focus = 2.8 * u_scale / max(0.25, u_softness);
  for (int i = 0; i < 7; i++) {
    float f = float(i);
    vec2 seed = hash22(vec2(f * 2.17, f + 4.0));
    vec2 orbit = vec2(
      sin(t * (0.25 + seed.x * 0.22) + f * 1.7),
      cos(t * (0.22 + seed.y * 0.25) + f * 2.1)
    );
    vec2 position = (seed - 0.5) * 0.8 + orbit * (0.28 + seed * 0.18);
    float glow = exp(-dot(p - position, p - position) * focus);
    vec3 orbColor = mix(u_colorB, u_colorC, fract(f * 0.37));
    color += orbColor * glow * 0.34 * u_intensity;
  }
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const sunsetWaves = movingGradient({
  id: "sunset-waves",
  name: "Sunset Waves",
  description: "Warm horizon colours rolling in layered horizontal waves.",
  colors: [
    [0.055, 0.025, 0.13],
    [0.96, 0.20, 0.40],
    [1.00, 0.62, 0.20],
  ],
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  float noise = fbm(vec2(p.x * u_scale * 0.55 + t * 0.08, t * 0.04));
  float wave = sin(p.x * u_scale * 1.4 + t * 0.62 + noise * 2.0) * 0.10;
  wave += sin(p.x * u_scale * 0.62 - t * 0.38) * 0.07;
  float horizon = smoothstep(
    0.34 - u_softness * 0.08,
    0.68 + u_softness * 0.08,
    uv.y + wave
  );
  float glow = exp(-abs(uv.y + wave - 0.5) * 8.0 / max(0.3, u_softness));
  vec3 color = mix(u_colorA, u_colorB, horizon);
  color = mix(color, u_colorC, glow * 0.62 * u_intensity);
  color += u_colorB * (1.0 - uv.y) * 0.12;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const movingGradientShaders = [
  gradientDrift,
  auroraBloom,
  fluidSpectrum,
  diagonalTide,
  radialBloom,
  chromaticCurrent,
  softOrbs,
  sunsetWaves,
];
