/**
 * Shared GLSL helper library that is prepended to every shader body.
 *
 * It provides classic Ashima simplex noise (2D + 3D), fbm, a few colour
 * helpers, an Inigo Quilez cosine palette, rotation and a cheap hash for
 * film grain. Everything here is available to any shader in `src/shaders`.
 */
export const GLSL_COMMON = /* glsl */ `
#ifndef PI
#define PI 3.14159265359
#define TAU 6.28318530718
#endif

// ---- hashing --------------------------------------------------------------
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Cheap per-pixel film grain in -0.5..0.5, animated when you offset uv by time.
float grain(vec2 uv) {
  return hash21(uv) - 0.5;
}

// ---- simplex noise (Ashima Arts / Stefan Gustavson) -----------------------
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                        + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                          dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1),
                                 dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1),
                          dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1),
                                dot(p2, x2), dot(p3, x3)));
}

// ---- fractal brownian motion ---------------------------------------------
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 6; i++) {
    v += a * snoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * snoise(p);
    p *= 1.9;
    a *= 0.5;
  }
  return v;
}

// ---- voronoi / cellular ---------------------------------------------------
vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

// Returns (F1, F2): distance to nearest and second-nearest cell point.
// F2 - F1 gives clean cell borders; F1 alone gives a bubbly field.
vec2 voronoi(vec2 p, float t) {
  vec2 n = floor(p);
  vec2 f = fract(p);
  float f1 = 8.0, f2 = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash22(n + g);
      // Animate each cell point on its own little orbit.
      o = 0.5 + 0.5 * sin(t + TAU * o);
      float d = length(g + o - f);
      if (d < f1) { f2 = f1; f1 = d; }
      else if (d < f2) { f2 = d; }
    }
  }
  return vec2(f1, f2);
}

// ---- colour + geometry helpers -------------------------------------------
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Inigo Quilez cosine palette: a + b * cos(TAU * (c * t + d)).
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

// ---- iridescence ----------------------------------------------------------
// Thin-film interference approximated per RGB wavelength. Thickness is in
// nanometres, cosTheta is the view/normal alignment. Soap bubbles, oil
// slicks and holographic foil all fall out of this.
vec3 thinFilm(float thickness, float cosTheta) {
  vec3 lambda = vec3(680.0, 550.0, 440.0);       // R, G, B wavelengths (nm)
  float opd = 2.0 * thickness * max(cosTheta, 0.001);
  vec3 phase = TAU * opd / lambda;
  return 0.5 + 0.5 * cos(phase);
}

// Fast rainbow sweep — cheaper than thinFilm when you only want the look.
vec3 iridescence(float t) {
  return palette(t, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.33, 0.67));
}

// Schlick Fresnel — drives edge-on rainbow boost on foil and glass.
float fresnel(float cosTheta, float f0) {
  return f0 + (1.0 - f0) * pow(1.0 - clamp(cosTheta, 0.0, 1.0), 5.0);
}

// ---- shaping --------------------------------------------------------------
// Polynomial smooth minimum — melts shapes together (Inigo Quilez).
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

`;

/** Minimal pass-through vertex shader for a fullscreen triangle-pair quad. */
export const VERTEX_SRC = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** How many simultaneous click ripples the runtime tracks. */
export const MAX_RIPPLES = 8;

/** Built-in uniforms available to every shader body. */
export const BUILTIN_UNIFORMS = /* glsl */ `
// Must precede every non-preprocessor token. Enables fwidth/dFdx, which the
// grid and contour shaders use to keep line weight constant on screen.
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;

// --- pointer -------------------------------------------------------------
// All positions are 0..1 across the canvas with y pointing up.
uniform vec2  u_mouse;       // raw pointer position
uniform vec2  u_mouseSmooth; // eased pointer, nice for lag/follow effects
uniform vec2  u_mouseVel;    // pointer velocity (canvas widths / second)
uniform float u_mouseDown;   // 0..1, smoothed press state
uniform float u_mouseEnter;  // 0..1, fades out when the pointer leaves

// Click ripples: xy = origin, z = age in seconds (<0 means unused), w = strength.
uniform vec4  u_ripples[${MAX_RIPPLES}];

varying vec2  v_uv;

// Aspect-corrected pointer, matching the p convention used by the shaders
// (centred, y in -1..1). Use this to measure distance to the cursor.
vec2 mousePos() {
  vec2 m = u_mouse * 2.0 - 1.0;
  m.x *= u_resolution.x / u_resolution.y;
  return m;
}

vec2 mouseSmoothPos() {
  vec2 m = u_mouseSmooth * 2.0 - 1.0;
  m.x *= u_resolution.x / u_resolution.y;
  return m;
}

// Summed click-ripple wave at point p (aspect-corrected space).
// speed = expansion rate, freq = ring density, decay = how fast rings die.
float rippleField(vec2 p, float speed, float freq, float decay) {
  float sum = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = u_ripples[i];
    if (r.z < 0.0) continue;
    vec2 o = r.xy * 2.0 - 1.0;
    o.x *= u_resolution.x / u_resolution.y;
    float d = length(p - o);
    float radius = r.z * speed;
    // A ring travelling outward, fading with age and distance from the front.
    float ring = sin((d - radius) * freq) * exp(-abs(d - radius) * 4.0);
    sum += ring * r.w * exp(-r.z * decay);
  }
  return sum;
}
`;
