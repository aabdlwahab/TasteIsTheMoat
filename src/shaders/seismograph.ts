import type { ShaderDef } from "../core/types";

/**
 * Seismograph — a stack of wiggle traces with the cursor as the epicentre.
 *
 * Two things make it read as seismic rather than as rows of sine waves. The
 * amplitude envelope is a point source, so each trace spikes directly under
 * the cursor and tapers along its length; and the high octaves of the wiggle
 * are weighted by that same energy, because distance eats high frequencies
 * first — a far-off event is a slow swell, one under the cursor is jagged.
 *
 * Clicks go through `rippleField`, which carries the ring's age, so a click
 * is the one event here with real propagation: the wavefront reaches distant
 * traces late.
 */
export const seismograph: ShaderDef = {
  id: "seismograph",
  name: "Seismograph",
  description: "Stacked seismic traces. The cursor is the epicentre — flick it to spike them.",
  category: "interactive",
  interactive: true,
  colorRoles: { u_bg: "dark", u_trace: "mid", u_hot: "accent" },
  uniforms: {
    u_bg: { type: "color", value: [0.03, 0.05, 0.07], label: "Background" },
    u_trace: { type: "color", value: [0.45, 0.92, 0.78], label: "Trace" },
    u_hot: { type: "color", value: [1.0, 0.42, 0.33], label: "High energy" },
    u_speed: { type: "float", value: 0.5, min: 0, max: 2, label: "Speed" },
    u_traces: { type: "float", value: 16, min: 3, max: 40, step: 1, label: "Traces" },
    u_freq: { type: "float", value: 5.0, min: 0.5, max: 14, label: "Detail" },
    u_amp: { type: "float", value: 0.32, min: 0, max: 1.5, label: "Tremor" },
    u_weight: { type: "float", value: 1.4, min: 0.3, max: 4, label: "Line weight" },
    u_fill: { type: "float", value: 0.45, min: 0, max: 1, label: "Peak fill" },
    u_reach: { type: "float", value: 0.55, min: 0.1, max: 2, label: "Cursor reach" },
    u_force: { type: "float", value: 1.0, min: 0, max: 3, label: "Cursor force" },
  },
  fragment: /* glsl */ `
// One trace's offset from its baseline, in -1..1.
//
// detail fades the upper octaves in rather than scaling the whole trace, so
// a quiet trace stays a smooth swell instead of a shrunken scribble. The
// weights sum to 1, which is what lets the caller bound the excursion by amp.
float wiggle(float x, float seed, float t, float detail) {
  float w  = snoise(vec2(x,       seed + t * 1.3)) * 0.60;
  w += snoise(vec2(x * 2.7, seed - t * 2.4)) * 0.28 * detail;
  w += snoise(vec2(x * 6.1, seed + t * 4.1)) * 0.12 * detail * detail;
  return w;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // One p-space unit per pixel of height: line weights stay the weight asked
  // for whatever the resolution slider is set to.
  float px = 2.0 / u_resolution.y;

  float n = max(3.0, floor(u_traces));
  float spacing = 2.0 / n;

  // Raw pointer: the chaos has to sit under the cursor, not trail it.
  vec2 m = mousePos();
  // Speed is magnitude — a flick registers as a bigger quake than a crawl.
  float swing = length(u_mouseVel) * 0.4 + u_mouseDown * 0.7;

  float ink = 0.0;   // line coverage
  float area = 0.0;  // filled positive lobes
  float zero = 0.0;  // the quiet baselines
  float heat = 0.0;  // local energy, for the hot tint and bleed

  int row = int(floor((p.y + 1.0) / spacing));

  // Only the pixel's own band and its neighbours can reach it, so this costs
  // the same at 40 traces as at 3 — and the reach test below drops the bands
  // that cannot touch this pixel before paying for any noise.
  for (int k = -2; k <= 2; k++) {
    float idx = float(row + k);
    if (idx < 0.0 || idx > n - 1.0) continue;

    float base = -1.0 + (idx + 0.5) * spacing;
    float seed = idx * 7.31;

    zero = max(zero, 1.0 - smoothstep(px * 0.5, px * 1.6, abs(p.y - base)));

    // Energy from a point source at the cursor, falling off over u_reach.
    float d = length(vec2(p.x, base) - m) / u_reach;
    float near = exp(-d * d) * u_mouseEnter * (0.85 + swing);
    // A click's wavefront crosses the chart and kicks each trace as it passes.
    // It decays slowly on purpose: a front that dies in half a second never
    // gets far enough from the click for the delayed arrival to be the point.
    float front = abs(rippleField(vec2(p.x, base), 1.6, 7.0, 0.55)) * 1.4;
    float energy = (near + front) * u_force;

    // Capped at two bands: the loop only visits the pixel's own band and two
    // either side, so a trace allowed to swing further than that would be
    // skipped by the pixels it reaches and draw itself truncated in mid-air.
    float amp = min(spacing * 0.44 * (u_amp + energy * 2.4), spacing * 2.0);
    heat = max(heat, energy * exp(-abs(p.y - base) / (spacing * 0.9)));

    // |wiggle| <= 1, so nothing outside amp of the baseline can be this trace.
    if (abs(p.y - base) > amp + px * 2.0) continue;

    float detail = clamp(0.55 + energy * 1.2, 0.0, 1.0);
    float x = (p.x + t * 0.6) * u_freq;
    float y = base + wiggle(x, seed, t, detail) * amp;

    // Perpendicular distance, not vertical: |p.y - y| alone draws a line that
    // bloats on the steep flanks of a spike and thins out across the peaks,
    // which is exactly where a seismic trace is supposed to look sharpest.
    float h = px * 2.0;
    float yh = base + wiggle(x + h * u_freq, seed, t, detail) * amp;
    float slope = (yh - y) / h;
    float dist = abs(p.y - y) * inversesqrt(1.0 + slope * slope);

    float w = u_weight * px;
    ink = max(ink, 1.0 - smoothstep(w, w + px * 1.3, dist));

    // Variable-area display: positive lobes filled solid, the convention that
    // makes a real seismic section readable at a glance. Non-zero only where
    // the excursion is positive, since otherwise y falls below the baseline.
    area = max(area, smoothstep(0.0, px, p.y - base) * smoothstep(0.0, px, y - p.y));
  }

  vec3 col = u_bg;
  // The baselines keep the chart legible where nothing is happening.
  col = mix(col, mix(u_bg, u_trace, 0.2), zero);

  vec3 inkCol = mix(u_trace, u_hot, clamp(heat * 1.3, 0.0, 1.0));
  col = mix(col, inkCol * 0.6, area * u_fill);
  col = mix(col, inkCol, ink);

  // Energy bleeds off a shaking trace, so the quake reads from across the room.
  col += u_hot * heat * 0.25;

  col *= 1.0 - 0.3 * dot(p, p) * 0.18;
  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`,
};
