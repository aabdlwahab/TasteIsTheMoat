import type { ShaderDef } from "../core/types";

/**
 * Liquid Ripple — a water surface that reacts to the pointer. Moving the
 * cursor drags a wake through the surface, clicking drops a ring that expands
 * and fades. Surface normals from the combined wave height drive refraction,
 * a specular highlight and chromatic fringing.
 */
export const liquidRipple: ShaderDef = {
  id: "liquid-ripple",
  name: "Liquid Ripple",
  description: "Water that ripples from your cursor. Click to drop a stone.",
  category: "interactive",
  interactive: true,
  colorRoles: { u_deep: "dark", u_shallow: "accent" },
  uniforms: {
    u_deep: { type: "color", value: [0.03, 0.09, 0.20], label: "Deep" },
    u_shallow: { type: "color", value: [0.15, 0.55, 0.75], label: "Shallow" },
    u_speed: { type: "float", value: 0.6, min: 0, max: 2, label: "Speed" },
    u_scale: { type: "float", value: 2.2, min: 0.5, max: 6, label: "Scale" },
    u_cursorRadius: { type: "float", value: 0.55, min: 0.1, max: 1.5, label: "Cursor reach" },
    u_cursorForce: { type: "float", value: 0.5, min: 0, max: 2, label: "Cursor force" },
    u_rippleSpeed: { type: "float", value: 0.9, min: 0.2, max: 3, label: "Ring speed" },
    u_refraction: { type: "float", value: 0.35, min: 0, max: 1.5, label: "Refraction" },
    u_chroma: { type: "float", value: 0.35, min: 0, max: 2, label: "Chromatic" },
  },
  fragment: /* glsl */ `
// Combined wave height: ambient swell + cursor wake + click rings.
//
// q arrives already multiplied by u_scale — the ambient swell is authored in
// that scaled space. The pointer terms are not: they have to be evaluated in
// screen space, or they land at mousePos()/u_scale, which at the default scale
// of 2.2 is 45% of the way to the cursor and drifts further the further the
// pointer sits from the centre.
float height(vec2 q, float t) {
  float h = fbm(q * 1.4 + vec2(t * 0.25, t * 0.15)) * 0.5;
  h += snoise(q * 2.6 - vec2(t * 0.4, 0.0)) * 0.18;

  // Back to screen space. u_scale has a floor of 0.5, so this cannot divide
  // by zero, and it keeps u_cursorRadius and the ring frequency below meaning
  // what they say on screen rather than scaling with the pattern.
  vec2 p = q / u_scale;

  // Cursor wake — a bump that follows the pointer, stretched by its velocity.
  // Raw, not smoothed: the wake sits under the cursor; the trailing look comes
  // from the ring phase and the velocity term, not from a lagging centre.
  vec2 d = p - mousePos();
  float dist = length(d);
  float falloff = exp(-dist * dist / (u_cursorRadius * u_cursorRadius));
  // Concentric rings trailing the cursor, driven by how fast it is moving.
  float speedMag = clamp(length(u_mouseVel) * 1.5, 0.0, 3.0);
  h += sin(dist * 22.0 - u_time * 7.0) * falloff
       * u_cursorForce * (0.25 + speedMag) * u_mouseEnter;

  // Expanding rings from clicks.
  h += rippleField(p, u_rippleSpeed, 26.0, 1.1) * 0.5;
  return h;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // A wide epsilon on purpose: sampling too finely picks up the noise floor,
  // and the sharp specular below turns that into a field of white speckles.
  float e = 0.02;
  float h  = height(q, t);
  float hx = height(q + vec2(e, 0.0), t);
  float hy = height(q + vec2(0.0, e), t);
  vec2 slope = vec2(hx - h, hy - h) / e;
  vec3 n = normalize(vec3(-slope * 0.35, 1.0));

  // Refract the underlying colour field through the surface slope.
  vec2 refr = slope * u_refraction * 0.08;
  float band  = fbm((q + refr) * 0.9 + t * 0.1) * 0.5 + 0.5;
  // Sample the depth field at slightly different offsets per channel.
  float bandR = fbm((q + refr * (1.0 + u_chroma * 0.12)) * 0.9 + t * 0.1) * 0.5 + 0.5;
  float bandB = fbm((q + refr * (1.0 - u_chroma * 0.12)) * 0.9 + t * 0.1) * 0.5 + 0.5;

  vec3 col = vec3(
    mix(u_deep.r, u_shallow.r, bandR),
    mix(u_deep.g, u_shallow.g, band),
    mix(u_deep.b, u_shallow.b, bandB)
  );

  // Sun glint off the wave slopes.
  vec3 lightDir = normalize(vec3(0.4, 0.6, 0.7));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 hv = normalize(lightDir + viewDir);
  float spec = pow(clamp(dot(n, hv), 0.0, 1.0), 45.0);
  col += vec3(0.85, 0.95, 1.0) * spec * 0.55;

  // Crest foam where the surface is steep. The threshold sits well above the
  // noise floor so isolated peaks don't speckle the whole surface white.
  float crest = smoothstep(1.1, 2.4, length(slope));
  col = mix(col, vec3(0.85, 0.93, 1.0), crest * 0.12);

  // Subtle glow following the pointer so it always feels alive.
  float glow = exp(-length(p - mousePos()) * 3.0) * u_mouseEnter;
  col += u_shallow * glow * 0.12;

  gl_FragColor = vec4(col, 1.0);
}
`,
};
