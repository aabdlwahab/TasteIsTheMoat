import type { ShaderDef } from "../core/types";

/**
 * Cursor Flow — a smoke-like flow field that the pointer stirs. The cursor's
 * velocity injects momentum into the domain warp, so flicking it smears the
 * field in the direction of travel, and RGB channels are sampled at slightly
 * different offsets to give the drag a chromatic edge.
 */
export const cursorFlow: ShaderDef = {
  id: "cursor-flow",
  name: "Cursor Flow",
  description: "Smoke you stir with the cursor. Flick it to smear the field.",
  category: "interactive",
  interactive: true,
  colorRoles: { u_colorA: "dark", u_colorB: "mid", u_colorC: "accent" },
  uniforms: {
    u_colorA: { type: "color", value: [0.05, 0.04, 0.14], label: "Deep" },
    u_colorB: { type: "color", value: [0.35, 0.30, 0.95], label: "Mid" },
    u_colorC: { type: "color", value: [0.95, 0.45, 0.85], label: "Bright" },
    u_speed: { type: "float", value: 0.35, min: 0, max: 1.5, label: "Speed" },
    u_scale: { type: "float", value: 1.8, min: 0.4, max: 5, label: "Scale" },
    u_stir: { type: "float", value: 0.7, min: 0, max: 3, label: "Stir strength" },
    u_reach: { type: "float", value: 2.0, min: 0.4, max: 8, label: "Stir reach" },
    u_smear: { type: "float", value: 0.5, min: 0, max: 2, label: "Velocity smear" },
    u_chroma: { type: "float", value: 0.35, min: 0, max: 2, label: "Chromatic" },
  },
  fragment: /* glsl */ `
// Flow field sampled with a per-channel offset, so we can split RGB cheaply.
float field(vec2 q, float t, vec2 bias) {
  vec2 w = q + bias;
  vec2 a = vec2(fbm(w + vec2(0.0, t * 0.2)), fbm(w + vec2(4.3, -t * 0.17)));
  return fbm(w + a * 2.2 + t * 0.1);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Raw: the swirl is centred on the pointer, so a lagging centre would make
  // the flow orbit a point the cursor has already left.
  vec2 m = mousePos();
  vec2 toM = p - m;
  float dist = length(toM);

  // Influence falls off with distance from the cursor.
  float infl = exp(-dist * dist * u_reach) * u_mouseEnter;

  // Swirl around the pointer, plus a shove along its direction of travel.
  vec2 vel = u_mouseVel * vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 swirl = vec2(-toM.y, toM.x) * infl * u_stir;
  vec2 shove = vel * infl * u_smear * 0.35;

  // Clicks punch the field outward.
  float ring = rippleField(p, 1.2, 9.0, 1.3);
  vec2 burst = normalize(toM + vec2(1e-5)) * ring * 0.25;

  vec2 q = p * u_scale + swirl + shove + burst;

  // Chromatic split grows with how hard the field is being stirred.
  float split = (infl * u_stir + length(vel) * 0.1) * u_chroma * 0.05;
  float r = field(q, t, vec2( split, 0.0));
  float g = field(q, t, vec2( 0.0,   0.0));
  float b = field(q, t, vec2(-split, 0.0));

  vec3 v = clamp(vec3(r, g, b) * 0.5 + 0.5, 0.0, 1.0);

  vec3 col = mix(u_colorA, u_colorB, v);
  col = mix(col, u_colorC, smoothstep(0.55, 1.0, v.g));

  // Warm the area right under the cursor so it feels responsive.
  col += u_colorC * infl * 0.18;

  col += grain(uv + fract(u_time * 0.5)) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
