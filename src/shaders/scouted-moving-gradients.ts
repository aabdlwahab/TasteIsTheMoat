import type { RGB, ShaderDef } from "../core/types";

type ScoutedGradientOptions = {
  id: string;
  name: string;
  description: string;
  colors: [RGB, RGB, RGB, RGB];
  fragment: string;
  seed?: number;
};

/** Controls shared by the independently implemented, web-scouted concepts. */
function scoutedGradient(options: ScoutedGradientOptions): ShaderDef {
  const { colors, seed = 7, ...definition } = options;
  return {
    ...definition,
    category: "gradient",
    uniforms: {
      u_colorA: { type: "color", value: colors[0], label: "Base" },
      u_colorB: { type: "color", value: colors[1], label: "Color 1" },
      u_colorC: { type: "color", value: colors[2], label: "Color 2" },
      u_colorD: { type: "color", value: colors[3], label: "Highlight" },
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
      u_seed: {
        type: "float",
        value: seed,
        min: 0,
        max: 100,
        step: 1,
        label: "Seed",
      },
    },
  };
}

export const seededColorIslands = scoutedGradient({
  id: "seeded-color-islands",
  name: "Seeded Color Islands",
  description: "Repeatable drifting colour regions with crisp organic borders.",
  seed: 18,
  colors: [
    [0.025, 0.035, 0.10],
    [0.20, 0.18, 0.92],
    [0.02, 0.82, 0.72],
    [0.98, 0.42, 0.20],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 seedOffset = hash22(vec2(u_seed, u_seed + 13.7)) * 12.0;
  vec2 q = p * u_scale * 0.72 + seedOffset;
  vec2 warp = vec2(
    fbm(q + vec2(t * 0.10, -t * 0.06)),
    fbm(q + vec2(5.2 - t * 0.07, t * 0.08))
  );
  float field = fbm(q + warp * (1.2 + u_softness * 0.5));
  float value = clamp(field * 0.5 + 0.5, 0.0, 0.999);
  float region = floor(value * 4.0);
  vec3 color = u_colorA;
  color = mix(color, u_colorB, step(1.0, region));
  color = mix(color, u_colorC, step(2.0, region));
  color = mix(color, u_colorD, step(3.0, region));
  float edge = 1.0 - smoothstep(0.30, 0.49, abs(fract(value * 4.0) - 0.5));
  color += mix(u_colorC, u_colorD, value) * edge * 0.12 * u_intensity;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const deterministicDuotoneFlow = scoutedGradient({
  id: "deterministic-duotone-flow",
  name: "Deterministic Duotone Flow",
  description: "Seeded high-contrast currents flowing between two tonal fields.",
  seed: 31,
  colors: [
    [0.015, 0.025, 0.08],
    [0.08, 0.32, 0.96],
    [0.02, 0.92, 0.76],
    [0.82, 0.98, 0.90],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 offset = hash22(vec2(u_seed + 2.0, u_seed * 1.7)) * 9.0;
  vec2 q = p * u_scale * 0.68 + offset;
  vec2 warp = vec2(
    fbm(q + vec2(t * 0.12, 0.0)),
    fbm(q + vec2(0.0, -t * 0.10) + 7.0)
  );
  float flow = fbm(q + warp * (1.8 + u_softness * 0.45));
  float split = smoothstep(-0.16 * u_softness, 0.16 * u_softness, flow);
  float vein = 1.0 - smoothstep(0.03, 0.24, abs(flow));
  vec3 darkTone = mix(u_colorA, u_colorB, 0.24 + 0.18 * warp.x);
  vec3 lightTone = mix(u_colorC, u_colorD, 0.25 + 0.45 * warp.y);
  vec3 color = mix(darkTone, lightTone, split);
  color += u_colorD * vein * 0.22 * u_intensity;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const paletteMorph = scoutedGradient({
  id: "palette-morph",
  name: "Palette Morph",
  description: "The complete gradient palette cycles smoothly through four colours.",
  seed: 4,
  colors: [
    [0.04, 0.025, 0.12],
    [0.92, 0.16, 0.46],
    [0.10, 0.76, 0.96],
    [0.98, 0.72, 0.22],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 q = p * u_scale * 0.62;
  float noise = fbm(q + vec2(t * 0.08, -t * 0.05) + u_seed * 0.17);
  float spatial = 0.5 + 0.5 * sin(q.x * 1.2 + q.y * 0.72 + noise * 3.0);
  spatial = smoothstep(0.08, 0.92, spatial);
  float phase = t * 0.42 + u_seed * 0.21;
  float morphA = 0.5 + 0.5 * sin(phase);
  float morphB = 0.5 + 0.5 * sin(phase + PI * 0.5);
  vec3 paletteA = mix(u_colorA, u_colorB, spatial);
  vec3 paletteB = mix(u_colorC, u_colorD, spatial);
  vec3 paletteC = mix(u_colorD, u_colorA, spatial);
  vec3 color = mix(paletteA, paletteB, morphA);
  color = mix(color, paletteC, morphB * 0.32 * u_softness);
  color *= 0.78 + 0.22 * u_intensity;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const litMeshWaves = scoutedGradient({
  id: "lit-mesh-waves",
  name: "Lit Mesh Waves",
  description: "A displaced mesh gradient shaded with moving highlights.",
  seed: 12,
  colors: [
    [0.025, 0.035, 0.10],
    [0.32, 0.12, 0.92],
    [0.02, 0.74, 0.82],
    [0.90, 0.96, 1.00],
  ],
  fragment: `
float meshWaveHeight(vec2 p, float t) {
  float seedPhase = u_seed * 0.37;
  float wave = sin(p.x * 1.7 + t * 0.72 + seedPhase) * 0.34;
  wave += sin(p.y * 2.1 - t * 0.54 + seedPhase * 0.7) * 0.28;
  wave += snoise(p * 0.82 + vec2(t * 0.10, -t * 0.07) + seedPhase) * 0.44;
  return wave;
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 q = p * u_scale;
  float epsilon = 0.012;
  float height = meshWaveHeight(q, t);
  vec2 slope = vec2(
    meshWaveHeight(q + vec2(epsilon, 0.0), t) - height,
    meshWaveHeight(q + vec2(0.0, epsilon), t) - height
  ) / epsilon;
  vec3 normal = normalize(vec3(-slope * 0.28 / u_softness, 1.0));
  vec3 lightDirection = normalize(vec3(-0.45, 0.62, 1.0));
  float diffuse = 0.35 + 0.65 * max(0.0, dot(normal, lightDirection));
  float specular = pow(max(0.0, dot(normal, normalize(vec3(0.2, 0.3, 1.0)))), 30.0);
  float blend = 0.5 + 0.5 * sin(height * 2.2 + q.x * 0.35);
  vec3 color = mix(u_colorA, u_colorB, blend);
  color = mix(color, u_colorC, 0.25 + 0.30 * normal.x);
  color *= diffuse;
  color += u_colorD * specular * u_intensity;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const waterPlaneGradient = scoutedGradient({
  id: "water-plane-gradient",
  name: "Water Plane Gradient",
  description: "A reflective gradient horizon rolling across a perspective water plane.",
  seed: 23,
  colors: [
    [0.015, 0.035, 0.09],
    [0.08, 0.22, 0.72],
    [0.02, 0.74, 0.84],
    [0.98, 0.58, 0.32],
  ],
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  float t = u_time * u_speed;
  float horizon = 0.57;
  float depth = 1.0 / max(0.035, horizon - uv.y);
  vec2 waterUv = vec2(p.x * depth, depth) * u_scale * 0.18;
  float seedPhase = u_seed * 0.31;
  float wave = sin(waterUv.x * 1.8 + t + seedPhase);
  wave += sin(waterUv.y * 1.25 - t * 0.72);
  wave += snoise(waterUv * 0.62 + vec2(t * 0.18, seedPhase)) * 1.2;
  float crest = pow(0.5 + 0.5 * sin(wave * 2.2), 9.0 / max(0.4, u_softness));
  float waterMask = 1.0 - smoothstep(horizon - 0.012, horizon + 0.012, uv.y);
  vec3 sky = mix(u_colorA, u_colorD, smoothstep(0.55, 1.0, uv.y));
  vec3 water = mix(u_colorA, u_colorB, 0.48 + wave * 0.10);
  water = mix(water, u_colorC, crest * 0.42 * u_intensity);
  float horizonGlow = exp(-abs(uv.y - horizon) * 28.0);
  vec3 color = mix(sky, water, waterMask);
  color += u_colorD * horizonGlow * 0.42;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const frostedWaveStack = scoutedGradient({
  id: "frosted-wave-stack",
  name: "Frosted Wave Stack",
  description: "Translucent gradient waves layered behind softly textured glass.",
  seed: 9,
  colors: [
    [0.025, 0.035, 0.09],
    [0.28, 0.34, 0.96],
    [0.04, 0.86, 0.78],
    [0.84, 0.92, 1.00],
  ],
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  float frost = fbm(p * u_scale * 1.15 + vec2(t * 0.05, u_seed * 0.23));
  vec3 color = mix(u_colorA, u_colorD, (frost * 0.5 + 0.5) * 0.12);
  for (int i = 0; i < 6; i++) {
    float f = float(i);
    float phase = f * 1.37 + u_seed * 0.11;
    float y = -0.62 + f * 0.23;
    y += sin(p.x * (0.82 + f * 0.13) * u_scale + t * (0.34 + f * 0.035) + phase) * 0.16;
    y += frost * 0.07;
    float layer = exp(-abs(p.y - y) * (4.2 + f * 0.20) / max(0.35, u_softness));
    vec3 layerColor = mix(u_colorB, u_colorC, f / 5.0);
    layerColor = mix(layerColor, u_colorD, layer * 0.18);
    color += layerColor * layer * 0.18 * u_intensity;
  }
  color += grain(uv + fract(t * 0.03)) * 0.018;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const liquidMetalGradient = scoutedGradient({
  id: "liquid-metal-gradient",
  name: "Liquid Metal Gradient",
  description: "Flowing colour bands polished with chrome-like reflections.",
  seed: 42,
  colors: [
    [0.015, 0.02, 0.055],
    [0.22, 0.10, 0.72],
    [0.02, 0.78, 0.82],
    [0.96, 0.90, 1.00],
  ],
  fragment: `
float liquidMetalHeight(vec2 p, float t) {
  vec2 q = p + vec2(t * 0.10, -t * 0.07) + u_seed * 0.13;
  vec2 warp = vec2(fbm(q), fbm(q + 5.3));
  return fbm(q + warp * (1.4 + u_softness * 0.45));
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec2 q = p * u_scale;
  float epsilon = 0.010;
  float height = liquidMetalHeight(q, t);
  vec2 slope = vec2(
    liquidMetalHeight(q + vec2(epsilon, 0.0), t) - height,
    liquidMetalHeight(q + vec2(0.0, epsilon), t) - height
  ) / epsilon;
  vec3 normal = normalize(vec3(-slope * 0.38, 1.0));
  float reflection = 0.5 + 0.5 * normal.x;
  float bands = 0.5 + 0.5 * sin(height * 9.0 + t * 0.72);
  float specular = pow(max(0.0, dot(normal, normalize(vec3(-0.35, 0.55, 1.0)))), 38.0);
  vec3 color = mix(u_colorA, u_colorB, reflection);
  color = mix(color, u_colorC, bands * 0.62);
  color = mix(color, u_colorD, pow(1.0 - abs(normal.y), 3.0) * 0.36);
  color += u_colorD * specular * u_intensity;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const layeredRadialSweep = scoutedGradient({
  id: "layered-radial-sweep",
  name: "Layered Radial Sweep",
  description: "Overlapping radial gradients expand, rotate and cross one another.",
  seed: 15,
  colors: [
    [0.025, 0.025, 0.09],
    [0.78, 0.12, 0.72],
    [0.08, 0.64, 0.96],
    [0.98, 0.62, 0.22],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec3 color = u_colorA;
  for (int i = 0; i < 7; i++) {
    float f = float(i);
    vec2 seed = hash22(vec2(u_seed + f * 3.17, f + 9.0));
    vec2 center = (seed - 0.5) * 0.75;
    center += vec2(
      sin(t * (0.18 + seed.x * 0.18) + f),
      cos(t * (0.16 + seed.y * 0.20) + f * 1.7)
    ) * 0.26;
    float radius = length((p - center) * u_scale);
    float sweep = 0.5 + 0.5 * sin(radius * (2.4 + seed.x * 2.2) - t * 0.65 + f);
    sweep = smoothstep(0.22 * u_softness, 0.92, sweep);
    float falloff = exp(-radius * 0.32);
    vec3 ringColor = mix(u_colorB, u_colorC, 0.5 + 0.5 * sin(f * 2.1));
    ringColor = mix(ringColor, u_colorD, 0.25 + 0.25 * cos(f * 1.7));
    color += ringColor * sweep * falloff * 0.105 * u_intensity;
  }
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const grainientField = scoutedGradient({
  id: "grainient-field",
  name: "Grainient Field",
  description: "Broad moving colour masses finished with tactile animated grain.",
  seed: 27,
  colors: [
    [0.035, 0.025, 0.09],
    [0.90, 0.20, 0.42],
    [0.24, 0.22, 0.94],
    [0.02, 0.86, 0.72],
  ],
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  vec3 color = u_colorA;
  float weightSum = 0.72;
  for (int i = 0; i < 6; i++) {
    float f = float(i);
    vec2 seed = hash22(vec2(u_seed + f * 5.31, f + 2.4));
    vec2 center = (seed - 0.5) * 1.5;
    center += vec2(
      sin(t * (0.18 + seed.x * 0.20) + f * 1.3),
      cos(t * (0.16 + seed.y * 0.18) + f * 1.8)
    ) * 0.34;
    float weight = exp(-dot(p - center, p - center) * u_scale * 1.25 / max(0.3, u_softness));
    vec3 blobColor = mix(u_colorB, u_colorC, fract(f * 0.43));
    blobColor = mix(blobColor, u_colorD, seed.y * 0.42);
    color += blobColor * weight * 0.31;
    weightSum += weight * 0.31;
  }
  color /= weightSum;
  float textureNoise = fbm(p * u_scale * 1.6 + vec2(t * 0.07, u_seed));
  color += mix(u_colorB, u_colorD, textureNoise * 0.5 + 0.5) * textureNoise * 0.06;
  color += grain(uv * u_resolution.xy + floor(t * 24.0)) * 0.075 * u_intensity;
  gl_FragColor = vec4(max(color, 0.0), 1.0);
}`,
});

export const seededGradientGenerator = scoutedGradient({
  id: "seeded-gradient-generator",
  name: "Seeded Gradient Generator",
  description: "One numeric seed generates repeatable bands, blooms and colour layouts.",
  seed: 6,
  colors: [
    [0.02, 0.03, 0.09],
    [0.46, 0.12, 0.94],
    [0.02, 0.82, 0.74],
    [0.98, 0.42, 0.22],
  ],
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;
  float seed = floor(u_seed + 0.5);
  float bandWeight = hash21(vec2(seed, 1.7));
  float radialWeight = hash21(vec2(seed, 4.3));
  float blobWeight = hash21(vec2(seed, 8.9));
  float angle = hash21(vec2(seed, 12.1)) * TAU;
  vec2 q = rot(angle) * p * u_scale;
  float noise = fbm(q * 0.62 + vec2(t * 0.08, seed * 0.29));
  float bands = 0.5 + 0.5 * sin(q.x * (1.4 + bandWeight * 2.6) + noise * 2.5 - t * 0.62);
  vec2 radialCenter = hash22(vec2(seed, seed + 5.0)) - 0.5;
  float radial = 0.5 + 0.5 * sin(length(q - radialCenter) * (2.0 + radialWeight * 3.0) - t * 0.48);
  float blobs = 0.0;
  for (int i = 0; i < 5; i++) {
    float f = float(i);
    vec2 pointSeed = hash22(vec2(seed + f * 7.1, f + 3.0));
    vec2 center = (pointSeed - 0.5) * 1.5;
    center += vec2(sin(t * 0.20 + f), cos(t * 0.17 + f * 1.4)) * 0.20;
    blobs += exp(-dot(p - center, p - center) * (2.0 + pointSeed.x * 3.0) / max(0.3, u_softness));
  }
  float field = bands * (0.25 + bandWeight * 0.75);
  field += radial * (0.20 + radialWeight * 0.55);
  field += blobs * (0.10 + blobWeight * 0.25);
  field /= 1.35 + bandWeight + radialWeight + blobWeight * 0.5;
  field = smoothstep(0.08, 0.88, field);
  vec3 color = mix(u_colorA, u_colorB, field);
  color = mix(color, u_colorC, smoothstep(0.44, 0.82, radial) * radialWeight * 0.62);
  color = mix(color, u_colorD, smoothstep(0.56, 1.0, blobs) * blobWeight * 0.48);
  color *= 0.76 + 0.24 * u_intensity;
  gl_FragColor = vec4(color, 1.0);
}`,
});

export const scoutedMovingGradientShaders = [
  seededColorIslands,
  deterministicDuotoneFlow,
  paletteMorph,
  litMeshWaves,
  waterPlaneGradient,
  frostedWaveStack,
  liquidMetalGradient,
  layeredRadialSweep,
  grainientField,
  seededGradientGenerator,
];
