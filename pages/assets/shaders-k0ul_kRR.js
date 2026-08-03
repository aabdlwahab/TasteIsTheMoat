(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`
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

`,t=`
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,n=`
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
uniform vec4  u_ripples[8];

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
  for (int i = 0; i < 8; i++) {
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
`;function r(e){return Object.entries(e).map(([e,t])=>`uniform ${t.type===`color`?`vec3`:t.type} ${e};`).join(`
`)}function i(t,i){return[n,r(t),e,`
`,i].join(`
`)}function a(e){return i(e,``).split(`
`).length-1}function o(e,t,n){let r=e.createShader(t);if(!r)return`Failed to create shader object.`;if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r)??`Unknown shader error.`;return e.deleteShader(r),t.replace(/\0/g,``).trim()}return r}function s(e,t,n){let r=o(e,e.VERTEX_SHADER,t);if(typeof r==`string`)return r;let i=o(e,e.FRAGMENT_SHADER,n);if(typeof i==`string`)return e.deleteShader(r),i;let a=e.createProgram();if(!a)return e.deleteShader(r),e.deleteShader(i),`Failed to create shader program.`;if(e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),e.deleteShader(r),e.deleteShader(i),!e.getProgramParameter(a,e.LINK_STATUS)){let t=e.getProgramInfoLog(a)??`Program link failed.`;return e.deleteProgram(a),t.replace(/\0/g,``).trim()}return a}function c(e,t,n,r){switch(n.type){case`float`:e.uniform1f(t,r);break;case`vec2`:{let n=r;e.uniform2f(t,n[0],n[1]);break}case`color`:{let n=r;e.uniform3f(t,n[0],n[1],n[2]);break}}}function l(e,t){return e.replace(/ERROR:\s*(\d+):(\d+):/g,(e,n,r)=>`ERROR: ${n}:${Math.max(1,Number(r)-t)}:`)}function u(e){"@babel/helpers - typeof";return u=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},u(e)}function ee(e,t){if(u(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(u(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function d(e){var t=ee(e,`string`);return u(t)==`symbol`?t:t+``}function f(e,t,n){return(t=d(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var te={id:`aurora`,name:`Aurora`,description:`Glowing northern-lights ribbons over a night sky.`,category:`gradient`,colorRoles:{u_colorA:`bright`,u_colorB:`accent`,u_skyTop:`dark`,u_skyBottom:`dark`},uniforms:{u_colorA:{type:`color`,value:[.12,.95,.62],label:`Ribbon low`},u_colorB:{type:`color`,value:[.3,.35,.98],label:`Ribbon high`},u_skyTop:{type:`color`,value:[.02,.03,.09],label:`Sky top`},u_skyBottom:{type:`color`,value:[.04,.06,.12],label:`Sky bottom`},u_speed:{type:`float`,value:.5,min:0,max:2,label:`Speed`},u_intensity:{type:`float`,value:.9,min:0,max:2,label:`Intensity`},u_grain:{type:`float`,value:.03,min:0,max:.2,label:`Grain`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Night sky base gradient.
  vec3 col = mix(u_skyBottom, u_skyTop, clamp(uv.y, 0.0, 1.0));

  // A few drifting ribbons stacked up the sky.
  vec3 aur = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float wave = fbm(vec2(p.x * 1.5 + fi * 3.17, t * 0.4 + fi)) * 0.35;
    float base = -0.15 + fi * 0.11 + wave;           // ribbon centre height
    float thickness = 0.22 + 0.08 * sin(t * 0.3 + fi);
    float d = abs(p.y - base);
    float ribbon = smoothstep(thickness, 0.0, d);

    // Vertical streaks flowing along the ribbon.
    float streak = fbm(vec2(p.x * 5.0 + t * 0.3, p.y * 2.5 - t * 0.7));
    ribbon *= 0.55 + 0.45 * (streak * 0.5 + 0.5);

    float h = clamp((p.y - base) * 1.6 + 0.5, 0.0, 1.0);
    vec3 c = mix(u_colorA, u_colorB, h);
    aur += c * ribbon;
  }

  // Fade the aurora out toward the horizon.
  aur *= smoothstep(-0.6, 0.15, p.y) * u_intensity;
  col += aur;

  col += grain(uv + fract(u_time)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`},ne={id:`caustics`,name:`Caustics`,description:`Underwater light webs dancing on a pool floor.`,category:`organic`,colorRoles:{u_water:`dark`,u_light:`accent`},uniforms:{u_water:{type:`color`,value:[.02,.14,.22],label:`Water`},u_light:{type:`color`,value:[.55,.95,1],label:`Light`},u_speed:{type:`float`,value:.5,min:0,max:2,label:`Speed`},u_scale:{type:`float`,value:4,min:1,max:12,label:`Scale`},u_sharp:{type:`float`,value:8,min:1,max:20,label:`Sharpness`},u_intensity:{type:`float`,value:.7,min:0,max:3,label:`Intensity`},u_dispersion:{type:`float`,value:.35,min:0,max:2,label:`Dispersion`}},fragment:`
// One caustic layer. The bright net follows the *borders* between cells
// (F2-F1 -> 0), which is what gives caustics their thin interlocking
// filaments; using the cell centres instead just yields blobs.
float caustic(vec2 q, float t) {
  vec2 v = voronoi(q, t);
  float border = clamp(v.y - v.x, 0.0, 1.0);
  return pow(1.0 - border, u_sharp);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Warp the sampling grid so the web breathes rather than just sliding.
  vec2 warp = vec2(fbm(p * 1.2 + t * 0.15), fbm(p * 1.2 + 7.0 - t * 0.12));
  vec2 q = p * u_scale + warp * 0.6;

  // Two overlapping layers at different scales read as depth in the water.
  float d = u_dispersion * 0.04;
  float r = caustic(q + vec2(d, 0.0), t) + caustic(q * 1.7 + 5.0 + vec2(d, 0.0), t * 1.3) * 0.5;
  float g = caustic(q,                 t) + caustic(q * 1.7 + 5.0,                 t * 1.3) * 0.5;
  float b = caustic(q - vec2(d, 0.0), t) + caustic(q * 1.7 + 5.0 - vec2(d, 0.0), t * 1.3) * 0.5;

  vec3 c = vec3(r, g, b) * u_intensity;

  vec3 col = u_water + u_light * c;

  // Depth falloff so the top of the frame reads as deeper water.
  col *= mix(0.75, 1.15, uv.y);

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`},re={id:`cursor-flow`,name:`Cursor Flow`,description:`Smoke you stir with the cursor. Flick it to smear the field.`,category:`interactive`,interactive:!0,colorRoles:{u_colorA:`dark`,u_colorB:`mid`,u_colorC:`accent`},uniforms:{u_colorA:{type:`color`,value:[.05,.04,.14],label:`Deep`},u_colorB:{type:`color`,value:[.35,.3,.95],label:`Mid`},u_colorC:{type:`color`,value:[.95,.45,.85],label:`Bright`},u_speed:{type:`float`,value:.35,min:0,max:1.5,label:`Speed`},u_scale:{type:`float`,value:1.8,min:.4,max:5,label:`Scale`},u_stir:{type:`float`,value:.7,min:0,max:3,label:`Stir strength`},u_reach:{type:`float`,value:2,min:.4,max:8,label:`Stir reach`},u_smear:{type:`float`,value:.5,min:0,max:2,label:`Velocity smear`},u_chroma:{type:`float`,value:.35,min:0,max:2,label:`Chromatic`}},fragment:`
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

  vec2 m = mouseSmoothPos();
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
`},ie={id:`godrays`,name:`God Rays`,description:`Volumetric light shafts. Move the cursor to move the sun.`,category:`space`,interactive:!0,colorRoles:{u_bg:`dark`,u_light:`accent`,u_haze:`mid`},uniforms:{u_bg:{type:`color`,value:[.02,.03,.06],label:`Background`},u_light:{type:`color`,value:[1,.82,.55],label:`Light`},u_haze:{type:`color`,value:[.25,.35,.6],label:`Haze`},u_speed:{type:`float`,value:.3,min:0,max:1.5,label:`Speed`},u_scale:{type:`float`,value:2.6,min:.5,max:8,label:`Cloud scale`},u_density:{type:`float`,value:.75,min:0,max:2,label:`Density`},u_decay:{type:`float`,value:.94,min:.7,max:.995,label:`Decay`},u_follow:{type:`float`,value:1,min:0,max:1,label:`Cursor follow`}},fragment:`
// Occlusion mask the light has to shine through.
float occluder(vec2 x, float t) {
  float n = fbm(x * u_scale + vec2(t * 0.2, t * 0.1));
  return smoothstep(-0.1, 0.55, n);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // The sun drifts on its own, and follows the cursor when asked to.
  vec2 idle = vec2(sin(t * 0.4) * 0.35, 0.45 + cos(t * 0.3) * 0.15);
  vec2 sun = mix(idle, mouseSmoothPos(), u_follow * u_mouseEnter);

  // March from this pixel toward the sun, accumulating light that gets past
  // the occluder. This is the classic screen-space radial-blur approach.
  const int STEPS = 24;
  vec2 delta = (sun - p) / float(STEPS);
  vec2 pos = p;
  float illum = 1.0;
  float acc = 0.0;

  for (int i = 0; i < STEPS; i++) {
    pos += delta;
    float clear = 1.0 - occluder(pos, t);   // how transparent it is here
    acc += clear * illum;
    illum *= u_decay;                        // light falls off along the ray
  }
  acc /= float(STEPS);

  // Falloff with distance from the sun.
  float d = length(p - sun);
  float falloff = 1.0 / (1.0 + d * d * 2.2);

  vec3 col = u_bg;
  col += u_haze * fbm(p * 1.5 + t * 0.1) * 0.06;         // ambient haze
  col += u_light * acc * u_density * falloff * 2.2;      // the shafts
  col += u_light * smoothstep(0.28, 0.0, d) * 0.75;      // the sun itself

  // Darken the clouds that are doing the occluding, for contrast.
  col *= mix(1.0, 0.55, occluder(p, t) * 0.8);

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`},ae={id:`halftone`,name:`Halftone`,description:`Print-style dot screen that swells around the cursor.`,category:`geometric`,interactive:!0,colorRoles:{u_paper:`dark`,u_ink:`mid`,u_ink2:`accent`},uniforms:{u_paper:{type:`color`,value:[.06,.07,.1],label:`Paper`},u_ink:{type:`color`,value:[.95,.35,.55],label:`Ink`},u_ink2:{type:`color`,value:[.35,.85,.95],label:`Ink 2`},u_speed:{type:`float`,value:.3,min:0,max:1.5,label:`Speed`},u_scale:{type:`float`,value:1.6,min:.3,max:5,label:`Tone scale`},u_dots:{type:`float`,value:22,min:8,max:140,label:`Screen density`},u_angle:{type:`float`,value:.4,min:0,max:1.57,label:`Screen angle`},u_cursor:{type:`float`,value:.6,min:0,max:2,label:`Cursor swell`}},fragment:`
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Continuous tone we are going to screen.
  float tone = fbm(vec3(p * u_scale, t * 0.4)) * 0.5 + 0.5;

  // A soft lobe under the cursor pushes the local tone up.
  float d = length(p - mouseSmoothPos());
  tone += exp(-d * d * 3.5) * u_cursor * u_mouseEnter;
  tone = clamp(tone, 0.0, 1.0);

  // Rotated screen grid.
  vec2 g = rot(u_angle) * p * u_dots;
  vec2 cell = fract(g) - 0.5;

  // Dot radius tracks the tone; 0.707 covers the cell corner-to-corner.
  float radius = sqrt(tone) * 0.72;
  float dist = length(cell);
  // Anti-alias the dot edge against the screen grid.
  float aa = fwidth(dist) * 1.2;
  float dot_ = smoothstep(radius + aa, radius - aa, dist);

  // Two inks on slightly different screen angles, like real colour printing.
  vec2 g2 = rot(u_angle + 0.6) * p * u_dots;
  float dist2 = length(fract(g2) - 0.5);
  float radius2 = sqrt(clamp(tone - 0.25, 0.0, 1.0)) * 0.62;
  float dot2 = smoothstep(radius2 + aa, radius2 - aa, dist2);

  vec3 col = u_paper;
  col = mix(col, u_ink2, dot2 * 0.75);
  col = mix(col, u_ink, dot_);

  gl_FragColor = vec4(col, 1.0);
}
`},oe={id:`holo-foil`,name:`Holo Foil`,description:`Holographic fabric. Rainbow shifts as you move the cursor.`,category:`iridescent`,interactive:!0,uniforms:{u_tint:{type:`color`,value:[.55,.6,.85],label:`Base tint`},u_speed:{type:`float`,value:.25,min:0,max:1.5,label:`Speed`},u_scale:{type:`float`,value:1.1,min:.4,max:5,label:`Fold scale`},u_thickness:{type:`float`,value:380,min:180,max:900,label:`Film nm`},u_spread:{type:`float`,value:260,min:0,max:1400,label:`Rainbow spread`},u_relief:{type:`float`,value:.35,min:0,max:1.5,label:`Relief`},u_saturation:{type:`float`,value:1.1,min:0,max:2,label:`Saturation`},u_gloss:{type:`float`,value:.7,min:0,max:2,label:`Gloss`},u_ao:{type:`float`,value:.6,min:0,max:1.5,label:`Crease shade`},u_parallax:{type:`float`,value:1,min:0,max:3,label:`Cursor tilt`},u_grain:{type:`float`,value:.035,min:0,max:.2,label:`Grain`}},fragment:`
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
`},p={id:`lava-lamp`,name:`Lava Lamp`,description:`Slow wax blobs rising through warm backlit glass.`,category:`organic`,colorRoles:{u_glass:`dark`,u_waxA:`mid`,u_waxB:`accent`},uniforms:{u_glass:{type:`color`,value:[.1,.02,.16],label:`Glass`},u_waxA:{type:`color`,value:[1,.35,.15],label:`Wax core`},u_waxB:{type:`color`,value:[1,.75,.25],label:`Wax edge`},u_speed:{type:`float`,value:.35,min:0,max:1.5,label:`Speed`},u_count:{type:`float`,value:1,min:.4,max:1.6,label:`Blob size`},u_threshold:{type:`float`,value:.85,min:.3,max:2,label:`Threshold`},u_wobble:{type:`float`,value:.35,min:0,max:1.5,label:`Wobble`},u_backlight:{type:`float`,value:.7,min:0,max:2,label:`Backlight`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Warm backlight glowing up through the lamp.
  vec3 col = u_glass * (0.5 + u_backlight * (1.0 - uv.y) * 1.4);

  float field = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    // Each blob cycles slowly up the lamp on its own phase.
    float phase = fract(t * (0.09 + 0.02 * sin(fi)) + fi * 0.1428);
    float y = mix(-1.15, 1.15, phase);
    float x = sin(t * 0.5 + fi * 2.4) * 0.5 + sin(t * 0.23 + fi) * 0.18;

    // Squash near the ends of the travel, like wax hitting the glass.
    float squash = 1.0 + 0.35 * sin(phase * PI);
    vec2 c = vec2(x, y);
    vec2 d = (p - c) * vec2(1.0, 1.0 / squash);

    // Wobble the blob outline so it is not a perfect circle.
    float wob = 1.0 + u_wobble * 0.25 * snoise(vec3(d * 3.0, t + fi));
    float r = (0.20 + 0.07 * sin(fi * 1.7)) * u_count * wob;

    field += (r * r) / (dot(d, d) + 1e-3);
  }

  float edge = smoothstep(u_threshold - 0.08, u_threshold + 0.08, field);
  float core = smoothstep(u_threshold + 0.5, u_threshold + 1.6, field);

  vec3 wax = mix(u_waxB, u_waxA, core);
  col = mix(col, wax, edge);

  // Rim glow where the wax meets the fluid.
  float rim = smoothstep(u_threshold + 0.30, u_threshold, field) * edge;
  col += u_waxB * rim * 0.35;

  // Soft glow bleeding into the surrounding fluid.
  col += u_waxA * smoothstep(u_threshold, u_threshold - 0.55, field)
         * (1.0 - edge) * 0.18;

  col += grain(uv + fract(u_time * 0.5)) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}
`},m={id:`liquid-ripple`,name:`Liquid Ripple`,description:`Water that ripples from your cursor. Click to drop a stone.`,category:`interactive`,interactive:!0,colorRoles:{u_deep:`dark`,u_shallow:`accent`},uniforms:{u_deep:{type:`color`,value:[.03,.09,.2],label:`Deep`},u_shallow:{type:`color`,value:[.15,.55,.75],label:`Shallow`},u_speed:{type:`float`,value:.6,min:0,max:2,label:`Speed`},u_scale:{type:`float`,value:2.2,min:.5,max:6,label:`Scale`},u_cursorRadius:{type:`float`,value:.55,min:.1,max:1.5,label:`Cursor reach`},u_cursorForce:{type:`float`,value:.5,min:0,max:2,label:`Cursor force`},u_rippleSpeed:{type:`float`,value:.9,min:.2,max:3,label:`Ring speed`},u_refraction:{type:`float`,value:.35,min:0,max:1.5,label:`Refraction`},u_chroma:{type:`float`,value:.35,min:0,max:2,label:`Chromatic`}},fragment:`
// Combined wave height: ambient swell + cursor wake + click rings.
float height(vec2 p, float t) {
  float h = fbm(p * 1.4 + vec2(t * 0.25, t * 0.15)) * 0.5;
  h += snoise(p * 2.6 - vec2(t * 0.4, 0.0)) * 0.18;

  // Cursor wake — a bump that follows the pointer, stretched by its velocity.
  vec2 m = mouseSmoothPos();
  vec2 d = p - m;
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
  float glow = exp(-length(p - mouseSmoothPos()) * 3.0) * u_mouseEnter;
  col += u_shallow * glow * 0.12;

  gl_FragColor = vec4(col, 1.0);
}
`},h={id:`magnetic-dots`,name:`Magnetic Dots`,description:`A dot grid that bends around your cursor. Click to pulse.`,category:`interactive`,interactive:!0,colorRoles:{u_bg:`dark`,u_dot:`mid`,u_hot:`accent`},uniforms:{u_bg:{type:`color`,value:[.04,.05,.09],label:`Background`},u_dot:{type:`color`,value:[.45,.72,1],label:`Dot`},u_hot:{type:`color`,value:[1,.45,.75],label:`Disturbed`},u_density:{type:`float`,value:14,min:4,max:40,label:`Density`},u_size:{type:`float`,value:.17,min:.03,max:.45,label:`Dot size`},u_force:{type:`float`,value:.35,min:-1,max:1.5,label:`Force`},u_reach:{type:`float`,value:2.2,min:.3,max:8,label:`Falloff`},u_drift:{type:`float`,value:.25,min:0,max:1.5,label:`Idle drift`}},fragment:`
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  vec2 m = mouseSmoothPos();

  vec2 gridUv = p * u_density;
  vec2 id = floor(gridUv);
  vec2 gv = fract(gridUv) - 0.5;

  // Where this cell's dot sits in p-space.
  vec2 centre = (id + 0.5) / u_density;

  // Push along the vector away from the cursor, falling off with distance.
  vec2 dir = centre - m;
  float dist = length(dir);
  float push = u_force * exp(-dist * dist * u_reach) * u_mouseEnter;

  // Click shockwave rides on top of the steady push.
  push += rippleField(centre, 1.4, 7.0, 1.4) * 0.35;

  vec2 disp = normalize(dir + vec2(1e-5)) * push;

  // A slow idle wander so the grid breathes when the pointer is away.
  disp += vec2(
    snoise(vec3(centre * 1.3, u_time * 0.2)),
    snoise(vec3(centre * 1.3 + 7.0, u_time * 0.2))
  ) * u_drift * 0.06;

  // Displacement is in p-space; convert to this cell's local space.
  vec2 local = gv - disp * u_density;

  float d = length(local);
  float dot_ = smoothstep(u_size, u_size * 0.55, d);

  // Disturbed dots glow and shift colour.
  float energy = clamp(abs(push) * 3.0, 0.0, 1.0);
  vec3 dotCol = mix(u_dot, u_hot, energy);

  vec3 col = mix(u_bg, dotCol, dot_);
  col += dotCol * dot_ * energy * 0.6;          // bloom on active dots

  // Gentle vignette.
  col *= 1.0 - 0.25 * dot(p, p) * 0.2;

  gl_FragColor = vec4(col, 1.0);
}
`},g={id:`mesh-gradient`,name:`Mesh Gradient`,description:`Soft flowing four-colour gradient. Great behind hero text.`,category:`gradient`,uniforms:{u_colorA:{type:`color`,value:[.11,.13,.42],label:`Color A`},u_colorB:{type:`color`,value:[.45,.19,.72],label:`Color B`},u_colorC:{type:`color`,value:[.91,.38,.62],label:`Color C`},u_colorD:{type:`color`,value:[.22,.62,.71],label:`Color D`},u_speed:{type:`float`,value:.35,min:0,max:2,label:`Speed`},u_scale:{type:`float`,value:1.1,min:.3,max:3,label:`Scale`},u_warp:{type:`float`,value:.55,min:0,max:1.5,label:`Warp`},u_grain:{type:`float`,value:.04,min:0,max:.2,label:`Grain`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // Domain warp: displace the sample point with two low-freq noise fields.
  float n1 = snoise(vec3(q, t * 0.15));
  float n2 = snoise(vec3(q * 1.3 + 5.0, t * 0.13));
  vec2 warp = vec2(n1, n2) * u_warp;
  vec2 w = q + warp;

  float m1 = snoise(vec3(w, t * 0.20)) * 0.5 + 0.5;
  float m2 = snoise(vec3(w * 0.8 - 3.0, t * 0.17)) * 0.5 + 0.5;
  float m3 = snoise(vec3(w * 1.4 + 8.0, t * 0.11)) * 0.5 + 0.5;

  vec3 col = mix(u_colorA, u_colorB, smoothstep(0.2, 0.8, m1));
  col = mix(col, u_colorC, smoothstep(0.25, 0.85, m2));
  col = mix(col, u_colorD, smoothstep(0.35, 0.9, m3 * 0.6 + m1 * 0.4));

  // Gentle vignette to settle the edges.
  col *= 1.0 - 0.25 * dot(p, p) * 0.15;

  // Animated film grain to break up banding.
  col += grain(uv + fract(u_time * 0.5)) * u_grain;

  gl_FragColor = vec4(col, 1.0);
}
`},_={id:`metaballs`,name:`Metaballs`,description:`Gooey blobs that merge and split. Playful, tactile.`,category:`organic`,colorRoles:{u_bg:`dark`,u_colorA:`mid`,u_colorB:`accent`},uniforms:{u_bg:{type:`color`,value:[.04,.05,.1],label:`Background`},u_colorA:{type:`color`,value:[.98,.3,.45],label:`Core`},u_colorB:{type:`color`,value:[.99,.75,.3],label:`Edge`},u_speed:{type:`float`,value:.6,min:0,max:2,label:`Speed`},u_spread:{type:`float`,value:.9,min:.2,max:1.6,label:`Spread`},u_threshold:{type:`float`,value:1,min:.4,max:2,label:`Threshold`},u_grain:{type:`float`,value:.02,min:0,max:.2,label:`Grain`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  float field = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    // Each blob drifts on its own lissajous orbit.
    vec2 c = vec2(
      sin(t * 0.6 + fi * 1.7) * u_spread,
      cos(t * 0.5 + fi * 2.3) * u_spread * 0.62
    );
    float r = 0.16 + 0.06 * sin(t + fi * 1.3);
    vec2 d = p - c;
    field += (r * r) / (dot(d, d) + 1e-3);
  }

  float edge = smoothstep(u_threshold - 0.06, u_threshold + 0.06, field);
  float rim = smoothstep(u_threshold + 0.35, u_threshold, field) * edge;

  vec3 blob = mix(u_colorB, u_colorA, clamp(field * 0.35, 0.0, 1.0));
  vec3 col = mix(u_bg, blob, edge);
  col += vec3(1.0) * rim * 0.12;                 // liquid rim light

  col += grain(uv + fract(u_time * 0.5)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`},v=[[.025,.035,.1],[.42,.12,.95],[.04,.88,.78]];function y(e){let{colors:t=v,...n}=e;return{...n,category:`gradient`,uniforms:{u_colorA:{type:`color`,value:t[0],label:`Base`},u_colorB:{type:`color`,value:t[1],label:`Color`},u_colorC:{type:`color`,value:t[2],label:`Accent`},u_speed:{type:`float`,value:.4,min:0,max:2,step:.01,label:`Speed`},u_scale:{type:`float`,value:1.8,min:.3,max:6,step:.01,label:`Scale`},u_softness:{type:`float`,value:1,min:.2,max:2.5,step:.01,label:`Softness`},u_intensity:{type:`float`,value:1,min:0,max:2,step:.01,label:`Intensity`}}}}var b=[y({id:`gradient-drift`,name:`Gradient Drift`,description:`Slow mesh-like colour fields drifting past one another.`,colors:[[.03,.04,.12],[.48,.12,.95],[.02,.78,.95]],fragment:`
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
}`}),y({id:`aurora-bloom`,name:`Aurora Bloom`,description:`Wide luminous ribbons blooming through a midnight gradient.`,colors:[[.015,.025,.09],[.15,.22,.95],[.12,.95,.68]],fragment:`
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
}`}),y({id:`fluid-spectrum`,name:`Fluid Spectrum`,description:`Liquid spectral colour transported through smooth domain warping.`,colors:[[.1,.015,.18],[.92,.1,.48],[.04,.85,.94]],fragment:`
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
}`}),y({id:`diagonal-tide`,name:`Diagonal Tide`,description:`Broad diagonal bands sweeping across a softened colour field.`,colors:[[.04,.035,.13],[.96,.25,.5],[.98,.66,.18]],fragment:`
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
}`}),y({id:`radial-bloom`,name:`Radial Bloom`,description:`Overlapping radial colour blooms orbiting around the canvas.`,colors:[[.025,.02,.09],[.38,.18,.98],[.96,.18,.6]],fragment:`
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
}`}),y({id:`chromatic-current`,name:`Chromatic Current`,description:`A directional colour current with slowly curling eddies.`,colors:[[.015,.055,.11],[.02,.72,.75],[.68,.2,.96]],fragment:`
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
}`}),y({id:`soft-orbs`,name:`Soft Orbs`,description:`Large blurred colour orbs floating through a dark gradient.`,colors:[[.025,.03,.08],[.22,.35,.98],[.92,.2,.62]],fragment:`
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
}`}),y({id:`sunset-waves`,name:`Sunset Waves`,description:`Warm horizon colours rolling in layered horizontal waves.`,colors:[[.055,.025,.13],[.96,.2,.4],[1,.62,.2]],fragment:`
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
}`})],x={id:`nebula`,name:`Nebula`,description:`Glowing interstellar gas clouds with scattered stars.`,category:`space`,colorRoles:{u_void:`dark`,u_gasA:`mid`,u_gasB:`bright`,u_gasC:`accent`},uniforms:{u_void:{type:`color`,value:[.01,.01,.035],label:`Void`},u_gasA:{type:`color`,value:[.85,.18,.45],label:`Gas warm`},u_gasB:{type:`color`,value:[.2,.35,.95],label:`Gas cool`},u_gasC:{type:`color`,value:[.95,.72,.35],label:`Core`},u_speed:{type:`float`,value:.12,min:0,max:1,label:`Speed`},u_scale:{type:`float`,value:1.5,min:.3,max:5,label:`Scale`},u_density:{type:`float`,value:1,min:.2,max:2.5,label:`Density`},u_stars:{type:`float`,value:.7,min:0,max:2,label:`Stars`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // Domain-warp the gas so the clouds curl instead of drifting as a slab.
  vec2 warp = vec2(fbm(q * 0.8 + t * 0.3), fbm(q * 0.8 + 5.0 - t * 0.25));
  vec2 w = q + warp * 1.1;

  // Three density fields at different scales.
  float d1 = fbm(w + vec2(0.0, t * 0.2)) * 0.5 + 0.5;
  float d2 = fbm(w * 1.9 - 3.0 + t * 0.15) * 0.5 + 0.5;
  float d3 = fbm(w * 3.6 + 7.0 - t * 0.1) * 0.5 + 0.5;

  vec3 col = u_void;

  // Additive gas layers — dense regions glow brighter and warmer.
  col += u_gasB * pow(d1, 2.2) * 0.85 * u_density;
  col += u_gasA * pow(d2, 3.0) * 0.70 * u_density;
  col += u_gasC * pow(d1 * d2, 4.5) * 1.30 * u_density;   // hot cores
  col += u_gasB * pow(d3, 5.0) * 0.30 * u_density;        // wispy filaments

  // Dark dust lanes carved out of the gas.
  float dust = smoothstep(0.35, 0.0, fbm(w * 1.3 + 12.0) * 0.5 + 0.5);
  col *= 1.0 - dust * 0.55;

  // Sparse foreground stars.
  vec2 sid = floor(gl_FragCoord.xy / 3.0);
  float s = hash21(sid);
  float star = step(0.9985, s) * pow(hash21(sid + 2.1), 1.5);
  float tw = 0.7 + 0.3 * sin(u_time * 2.0 + s * 40.0);
  col += vec3(1.0, 0.96, 0.92) * star * tw * u_stars * 2.0;

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`},S={id:`oil-slick`,name:`Oil Slick`,description:`Petrol rainbow pooling on wet asphalt.`,category:`iridescent`,colorRoles:{u_base:`dark`},uniforms:{u_base:{type:`color`,value:[.03,.03,.045],label:`Asphalt`},u_speed:{type:`float`,value:.22,min:0,max:1.5,label:`Speed`},u_scale:{type:`float`,value:1.5,min:.3,max:5,label:`Scale`},u_thickness:{type:`float`,value:320,min:150,max:800,label:`Film nm`},u_spread:{type:`float`,value:300,min:50,max:1400,label:`Rainbow spread`},u_coverage:{type:`float`,value:.6,min:0,max:1,label:`Coverage`},u_saturation:{type:`float`,value:1,min:0,max:2,label:`Saturation`},u_wet:{type:`float`,value:.6,min:0,max:2,label:`Wet sheen`},u_grain:{type:`float`,value:.03,min:0,max:.25,label:`Grain`}},fragment:`
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
`},C={id:`plasma`,name:`Plasma`,description:`Marbled liquid from iterated domain-warped noise.`,category:`organic`,uniforms:{u_colorA:{type:`color`,value:[.03,.02,.15],label:`Deep`},u_colorB:{type:`color`,value:[.85,.2,.45],label:`Mid`},u_colorC:{type:`color`,value:[.99,.82,.45],label:`Bright`},u_speed:{type:`float`,value:.5,min:0,max:2,label:`Speed`},u_scale:{type:`float`,value:.8,min:.4,max:4,label:`Scale`},u_warp:{type:`float`,value:2.5,min:1,max:8,label:`Warp`},u_grain:{type:`float`,value:.03,min:0,max:.2,label:`Grain`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 base = p * u_scale;

  // First warp layer.
  vec2 q = vec2(
    fbm(base + vec2(0.0, t * 0.2)),
    fbm(base + vec2(5.2, 1.3) - t * 0.15)
  );

  // Second warp layer, driven by the first.
  vec2 r = vec2(
    fbm(base + u_warp * q + vec2(1.7, 9.2) + t * 0.15),
    fbm(base + u_warp * q + vec2(8.3, 2.8) - t * 0.12)
  );

  float f = fbm(base + u_warp * r);
  float v = clamp(f * 0.5 + 0.5, 0.0, 1.0);

  // Layer three colours by the warp fields for depth.
  vec3 col = mix(u_colorA, u_colorB, v);
  col = mix(col, u_colorC, clamp(length(r) * 0.55, 0.0, 1.0));
  col = mix(col, u_colorA, clamp(length(q) * 0.30, 0.0, 1.0));

  col += grain(uv + fract(u_time * 0.5)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`},w={id:`prism`,name:`Prism`,description:`Light splitting into spectra through drifting glass.`,category:`iridescent`,interactive:!0,colorRoles:{u_bg:`dark`,u_beam:`bright`},uniforms:{u_bg:{type:`color`,value:[.02,.02,.05],label:`Background`},u_beam:{type:`color`,value:[1,.98,.95],label:`Beam`},u_speed:{type:`float`,value:.3,min:0,max:1.5,label:`Speed`},u_scale:{type:`float`,value:1.7,min:.3,max:5,label:`Scale`},u_dispersion:{type:`float`,value:.55,min:0,max:2.5,label:`Dispersion`},u_bands:{type:`float`,value:1.8,min:.5,max:12,label:`Bands`},u_sharp:{type:`float`,value:3.2,min:.5,max:8,label:`Sharpness`},u_cursor:{type:`float`,value:.5,min:0,max:2,label:`Cursor tilt`}},fragment:`
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
`};function T(e){let{colors:t,seed:n=7,...r}=e;return{...r,category:`gradient`,uniforms:{u_colorA:{type:`color`,value:t[0],label:`Base`},u_colorB:{type:`color`,value:t[1],label:`Color 1`},u_colorC:{type:`color`,value:t[2],label:`Color 2`},u_colorD:{type:`color`,value:t[3],label:`Highlight`},u_speed:{type:`float`,value:.4,min:0,max:2,step:.01,label:`Speed`},u_scale:{type:`float`,value:1.8,min:.3,max:6,step:.01,label:`Scale`},u_softness:{type:`float`,value:1,min:.2,max:2.5,step:.01,label:`Softness`},u_intensity:{type:`float`,value:1,min:0,max:2,step:.01,label:`Intensity`},u_seed:{type:`float`,value:n,min:0,max:100,step:1,label:`Seed`}}}}var E=[T({id:`seeded-color-islands`,name:`Seeded Color Islands`,description:`Repeatable drifting colour regions with crisp organic borders.`,seed:18,colors:[[.025,.035,.1],[.2,.18,.92],[.02,.82,.72],[.98,.42,.2]],fragment:`
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
}`}),T({id:`deterministic-duotone-flow`,name:`Deterministic Duotone Flow`,description:`Seeded high-contrast currents flowing between two tonal fields.`,seed:31,colors:[[.015,.025,.08],[.08,.32,.96],[.02,.92,.76],[.82,.98,.9]],fragment:`
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
}`}),T({id:`palette-morph`,name:`Palette Morph`,description:`The complete gradient palette cycles smoothly through four colours.`,seed:4,colors:[[.04,.025,.12],[.92,.16,.46],[.1,.76,.96],[.98,.72,.22]],fragment:`
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
}`}),T({id:`lit-mesh-waves`,name:`Lit Mesh Waves`,description:`A displaced mesh gradient shaded with moving highlights.`,seed:12,colors:[[.025,.035,.1],[.32,.12,.92],[.02,.74,.82],[.9,.96,1]],fragment:`
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
}`}),T({id:`water-plane-gradient`,name:`Water Plane Gradient`,description:`A reflective gradient horizon rolling across a perspective water plane.`,seed:23,colors:[[.015,.035,.09],[.08,.22,.72],[.02,.74,.84],[.98,.58,.32]],fragment:`
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
}`}),T({id:`frosted-wave-stack`,name:`Frosted Wave Stack`,description:`Translucent gradient waves layered behind softly textured glass.`,seed:9,colors:[[.025,.035,.09],[.28,.34,.96],[.04,.86,.78],[.84,.92,1]],fragment:`
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
}`}),T({id:`liquid-metal-gradient`,name:`Liquid Metal Gradient`,description:`Flowing colour bands polished with chrome-like reflections.`,seed:42,colors:[[.015,.02,.055],[.22,.1,.72],[.02,.78,.82],[.96,.9,1]],fragment:`
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
}`}),T({id:`layered-radial-sweep`,name:`Layered Radial Sweep`,description:`Overlapping radial gradients expand, rotate and cross one another.`,seed:15,colors:[[.025,.025,.09],[.78,.12,.72],[.08,.64,.96],[.98,.62,.22]],fragment:`
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
}`}),T({id:`grainient-field`,name:`Grainient Field`,description:`Broad moving colour masses finished with tactile animated grain.`,seed:27,colors:[[.035,.025,.09],[.9,.2,.42],[.24,.22,.94],[.02,.86,.72]],fragment:`
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
}`}),T({id:`seeded-gradient-generator`,name:`Seeded Gradient Generator`,description:`One numeric seed generates repeatable bands, blooms and colour layouts.`,seed:6,colors:[[.02,.03,.09],[.46,.12,.94],[.02,.82,.74],[.98,.42,.22]],fragment:`
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
}`})],D={id:`silk`,name:`Silk`,description:`Satin folds with a soft moving sheen.`,category:`gradient`,uniforms:{u_colorA:{type:`color`,value:[.06,.05,.18],label:`Shadow`},u_colorB:{type:`color`,value:[.55,.35,.95],label:`Highlight`},u_speed:{type:`float`,value:.4,min:0,max:2,label:`Speed`},u_scale:{type:`float`,value:1.4,min:.3,max:4,label:`Scale`},u_warp:{type:`float`,value:.7,min:0,max:2,label:`Warp`},u_freq:{type:`float`,value:4,min:1,max:12,label:`Weave`},u_sheen:{type:`float`,value:2.2,min:.5,max:6,label:`Sheen`},u_grain:{type:`float`,value:.03,min:0,max:.2,label:`Grain`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_scale;

  // Two rounds of domain warping create the soft folds of the fabric.
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    q += u_warp * vec2(
      fbm(q + vec2(0.0, t * 0.2) + fi * 3.1),
      fbm(q + vec2(5.2, -t * 0.17) - fi * 2.3)
    );
  }

  // Diagonal weave running through the warped field.
  float lines = sin((q.x + q.y) * u_freq + fbm(q * 1.5) * 2.0);
  float s = lines * 0.5 + 0.5;

  vec3 col = mix(u_colorA, u_colorB, s);
  // Anisotropic sheen — sharp bright glints where the weave peaks.
  col += vec3(1.0) * pow(s, u_sheen * 4.0) * 0.18;
  col = mix(col, col * 1.08, pow(s, u_sheen));

  col += grain(uv + fract(u_time * 0.5)) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}
`},O={id:`spotlight`,name:`Spotlight`,description:`A dark surface your cursor reveals like a torch.`,category:`interactive`,interactive:!0,colorRoles:{u_bg:`dark`,u_glow:`accent`,u_detail:`mid`},uniforms:{u_bg:{type:`color`,value:[.03,.035,.06],label:`Hidden`},u_glow:{type:`color`,value:[1,.72,.35],label:`Light`},u_detail:{type:`color`,value:[.25,.45,.85],label:`Pattern`},u_radius:{type:`float`,value:.55,min:.1,max:1.6,label:`Radius`},u_soft:{type:`float`,value:.6,min:.05,max:1.5,label:`Softness`},u_scale:{type:`float`,value:3,min:.5,max:10,label:`Pattern scale`},u_speed:{type:`float`,value:.3,min:0,max:1.5,label:`Speed`},u_ambient:{type:`float`,value:.18,min:0,max:.6,label:`Ambient`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 m = mouseSmoothPos();

  // The concealed pattern: contour bands from a drifting noise field.
  float n = fbm(p * u_scale + vec2(t * 0.3, t * 0.15));
  float contour = abs(fract(n * 4.0) - 0.5) * 2.0;
  float lines = smoothstep(0.75, 0.05, contour);
  vec3 pattern = mix(u_detail * 0.35, u_detail, lines);
  // Warm the pattern where the noise peaks, for a bit of depth.
  pattern = mix(pattern, u_glow, smoothstep(0.35, 0.9, n) * 0.35);

  // The torch: a soft disc that grows slightly while the button is held.
  float radius = u_radius * (1.0 + u_mouseDown * 0.35);
  float d = length(p - m);
  float light = 1.0 - smoothstep(radius * (1.0 - u_soft * 0.5), radius, d);
  light *= u_mouseEnter;

  // Click rings ripple outward through the reveal mask.
  light += rippleField(p, 1.1, 10.0, 1.5) * 0.25;
  light = clamp(light, 0.0, 1.0);

  vec3 col = mix(u_bg, pattern, light * 0.95 + u_ambient);
  // Warm core falloff so the light itself is visible, not just the reveal.
  col += u_glow * pow(light, 2.5) * 0.5;

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`},k={id:`starfield`,name:`Starfield`,description:`Parallax stars streaming past. Steer with the cursor.`,category:`space`,interactive:!0,colorRoles:{u_sky:`dark`,u_star:`bright`,u_tint:`mid`},uniforms:{u_sky:{type:`color`,value:[.01,.012,.03],label:`Sky`},u_star:{type:`color`,value:[1,.97,.9],label:`Star`},u_tint:{type:`color`,value:[.35,.5,1],label:`Distant tint`},u_speed:{type:`float`,value:.35,min:0,max:2,label:`Speed`},u_density:{type:`float`,value:9,min:2,max:26,label:`Density`},u_layers:{type:`float`,value:5,min:1,max:6,label:`Layers`},u_twinkle:{type:`float`,value:.6,min:0,max:2,label:`Twinkle`},u_steer:{type:`float`,value:.4,min:0,max:2,label:`Cursor steer`}},fragment:`
// One parallax layer of stars. depth runs 0 (near) .. 1 (far).
vec3 starLayer(vec2 p, float depth, float t) {
  float scale = u_density * (1.0 + depth * 2.2);
  vec2 q = p * scale;

  // Drift, slower for distant layers, nudged by the cursor.
  vec2 drift = vec2(t * (1.0 - depth * 0.75), 0.0);
  drift += mouseSmoothPos() * u_steer * (1.0 - depth * 0.8) * u_mouseEnter;
  q += drift;

  vec2 id = floor(q);
  vec2 gv = fract(q) - 0.5;

  // One star per cell, jittered inside it.
  vec2 jitter = (hash22(id) - 0.5) * 0.75;
  float d = length(gv - jitter);

  // Brightness varies per star; many cells stay empty.
  float seed = hash21(id + depth * 37.0);
  float present = step(0.72, seed);
  float bright = pow(hash21(id + 3.7), 3.0);

  float twinkle = 0.65 + 0.35 * sin(u_time * (1.5 + seed * 4.0) + seed * 30.0);
  twinkle = mix(1.0, twinkle, u_twinkle);

  // Sharper points for near layers, softer glow for far ones.
  float core = smoothstep(0.055 + depth * 0.03, 0.0, d);
  float halo = smoothstep(0.22 + depth * 0.1, 0.0, d) * 0.22;

  vec3 c = mix(u_star, u_tint, depth * 0.8);
  return c * (core + halo) * present * bright * twinkle * (1.0 - depth * 0.45);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec3 col = u_sky;

  // A faint dust lane so the field is not pure black between stars.
  float dust = fbm(p * 1.4 + t * 0.05) * 0.5 + 0.5;
  col += u_tint * pow(dust, 3.0) * 0.10;

  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_layers) break;
    float depth = float(i) / max(u_layers - 1.0, 1.0);
    col += starLayer(p, depth, t);
  }

  col += grain(uv + fract(u_time * 0.5)) * 0.015;
  gl_FragColor = vec4(col, 1.0);
}
`},A={id:`synthwave-grid`,name:`Synthwave Grid`,description:`Retro neon grid racing to a banded sun.`,category:`geometric`,colorRoles:{u_skyTop:`dark`,u_skyBottom:`mid`,u_grid:`accent`,u_sun:`bright`},uniforms:{u_skyTop:{type:`color`,value:[.06,.02,.16],label:`Sky top`},u_skyBottom:{type:`color`,value:[.55,.1,.45],label:`Horizon`},u_grid:{type:`color`,value:[.2,.95,.95],label:`Grid`},u_sun:{type:`color`,value:[1,.45,.35],label:`Sun`},u_speed:{type:`float`,value:.5,min:0,max:2,label:`Speed`},u_horizon:{type:`float`,value:0,min:-.5,max:.5,label:`Horizon Y`},u_cells:{type:`float`,value:8,min:2,max:24,label:`Grid cells`},u_glow:{type:`float`,value:.8,min:0,max:2.5,label:`Neon glow`},u_sunSize:{type:`float`,value:.42,min:.05,max:1,label:`Sun size`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  float horizon = u_horizon;
  vec3 col;

  if (p.y > horizon) {
    // ---- sky ----
    float sky = (p.y - horizon) / (1.0 - horizon);
    col = mix(u_skyBottom, u_skyTop, pow(sky, 0.7));

    // Banded sun sitting on the horizon.
    vec2 sunPos = vec2(0.0, horizon + u_sunSize * 0.55);
    float d = length((p - sunPos) / vec2(1.0, 1.0));
    float disc = smoothstep(u_sunSize, u_sunSize * 0.97, d);
    // Horizontal slots cut across the lower half of the disc.
    float slots = step(0.35, fract((p.y - horizon) * 26.0));
    float lower = smoothstep(sunPos.y, sunPos.y - u_sunSize, p.y);
    disc *= mix(1.0, slots, lower);

    vec3 sunCol = mix(u_sun, vec3(1.0, 0.85, 0.45),
                      clamp((p.y - sunPos.y) / u_sunSize * 0.5 + 0.5, 0.0, 1.0));
    col = mix(col, sunCol, disc);
    // Sun bloom.
    col += u_sun * smoothstep(u_sunSize * 2.6, 0.0, d) * 0.35 * u_glow;

    // A few stars high in the sky.
    vec2 sid = floor(gl_FragCoord.xy / 3.0);
    col += vec3(1.0) * step(0.9988, hash21(sid)) * smoothstep(horizon + 0.2, 1.0, p.y);

  } else {
    // ---- ground ----
    // Perspective divide: depth grows as we approach the horizon.
    float depth = 1.0 / (horizon - p.y + 1e-3);
    vec2 g = vec2(p.x * depth, depth + t * 2.0);

    // Distance to the nearest grid line in each axis, width-corrected so
    // distant lines stay thin instead of aliasing into noise.
    vec2 gridUv = g * vec2(u_cells * 0.5, 1.0);
    vec2 f = abs(fract(gridUv) - 0.5);
    vec2 fw = fwidth(gridUv) * 1.5;
    vec2 lines = smoothstep(fw, vec2(0.0), f);
    float grid = max(lines.x, lines.y);

    // Fade the grid out with distance.
    float fade = smoothstep(0.0, 0.45, horizon - p.y);

    vec3 ground = mix(u_skyBottom * 0.25, vec3(0.02, 0.0, 0.06), fade);
    col = ground;
    col += u_grid * grid * fade * (0.6 + u_glow);
    // Neon bleed around the lines.
    col += u_grid * grid * 0.25 * u_glow;
  }

  // Horizon glow band.
  col += u_skyBottom * exp(-abs(p.y - horizon) * 14.0) * 0.55 * u_glow;

  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`},j={id:`topographic`,name:`Topographic`,description:`Contour map lines flowing over shifting terrain.`,category:`geometric`,colorRoles:{u_bg:`dark`,u_line:`mid`,u_high:`accent`},uniforms:{u_bg:{type:`color`,value:[.04,.06,.09],label:`Background`},u_line:{type:`color`,value:[.35,.85,.75],label:`Contour`},u_high:{type:`color`,value:[.95,.75,.35],label:`Peaks`},u_speed:{type:`float`,value:.25,min:0,max:1.5,label:`Speed`},u_scale:{type:`float`,value:2.2,min:.4,max:6,label:`Scale`},u_levels:{type:`float`,value:12,min:2,max:40,label:`Contours`},u_weight:{type:`float`,value:1.1,min:.2,max:4,label:`Line weight`},u_fill:{type:`float`,value:.25,min:0,max:1,label:`Elevation fill`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  // Terrain height, slowly evolving.
  float h = fbm(vec3(p * u_scale, t * 0.3));
  float elevation = h * 0.5 + 0.5;

  // Contour bands.
  float bands = elevation * u_levels;
  float f = abs(fract(bands) - 0.5);
  // fwidth keeps the stroke a constant width on screen regardless of slope.
  float w = fwidth(bands) * u_weight;
  float line = 1.0 - smoothstep(0.0, w, f);

  // Tint the terrain by elevation, kept subtle so the lines stay the subject.
  vec3 col = mix(u_bg, u_bg + u_line * 0.35, elevation * u_fill);

  // Every fifth contour is an index line — heavier, like a real map.
  float major = step(0.5, 1.0 - abs(fract(bands / 5.0) - 0.5) * 2.0);
  vec3 lineCol = mix(u_line, u_high, smoothstep(0.55, 0.95, elevation));
  col = mix(col, lineCol, line * (0.55 + 0.45 * major));

  // Peaks glow faintly.
  col += u_high * smoothstep(0.8, 1.0, elevation) * 0.2;

  col *= 1.0 - 0.3 * dot(p, p) * 0.18;
  col += grain(uv + fract(u_time * 0.5)) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}
`},M={id:`voronoi-cells`,name:`Voronoi Cells`,description:`Crystalline mosaic that slowly rearranges itself.`,category:`organic`,colorRoles:{u_colorA:`dark`,u_colorB:`mid`,u_edge:`accent`},uniforms:{u_colorA:{type:`color`,value:[.04,.06,.13],label:`Cell dark`},u_colorB:{type:`color`,value:[.18,.4,.62],label:`Cell light`},u_edge:{type:`color`,value:[.75,.92,1],label:`Edge`},u_speed:{type:`float`,value:.4,min:0,max:2,label:`Speed`},u_density:{type:`float`,value:4.5,min:1,max:14,label:`Density`},u_edgeWidth:{type:`float`,value:.06,min:.005,max:.3,label:`Edge width`},u_glow:{type:`float`,value:.5,min:0,max:2,label:`Edge glow`},u_detail:{type:`float`,value:.4,min:0,max:1,label:`Fracture`}},fragment:`
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time * u_speed;

  vec2 q = p * u_density;

  vec2 v = voronoi(q, t);
  float border = v.y - v.x;                    // 0 at cell edges

  // Second, finer layer of cells for fracture detail inside each cell.
  vec2 v2 = voronoi(q * 2.7 + 11.0, t * 0.7);
  float border2 = v2.y - v2.x;

  // Shade cell interiors by their distance field.
  float shade = smoothstep(0.0, 0.9, v.x);
  vec3 col = mix(u_colorA, u_colorB, shade);

  // Fracture lines, kept subtle.
  col = mix(col, u_colorA, smoothstep(u_edgeWidth * 2.0, 0.0, border2) * u_detail);

  // Bright borders with a soft glow either side.
  float edge = smoothstep(u_edgeWidth, 0.0, border);
  float halo = smoothstep(u_edgeWidth * 5.0, 0.0, border);
  col = mix(col, u_edge, edge);
  col += u_edge * halo * u_glow * 0.25;

  col *= 1.0 - 0.3 * dot(p, p) * 0.2;
  col += grain(uv + fract(u_time * 0.5)) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}
`};function N(e){return{...e,uniforms:{u_colorA:{type:`color`,value:[.03,.05,.12],label:`Base`},u_colorB:{type:`color`,value:[.35,.18,.95],label:`Color`},u_accent:{type:`color`,value:[.1,.9,.78],label:`Accent`},u_speed:{type:`float`,value:.45,min:0,max:2,label:`Speed`},u_scale:{type:`float`,value:2.2,min:.3,max:8,label:`Scale`},u_intensity:{type:`float`,value:1,min:0,max:2.5,label:`Intensity`}}}}var P=N({id:`grain-gradient`,name:`Grain Gradient`,category:`gradient`,description:`Soft drifting colour with tactile animated grain.`,fragment:`void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 w=vec2(fbm(p*u_scale+t*.12),fbm(p*u_scale+5.0-t*.1));float n=fbm(p*u_scale+w*1.4+t*.08)*.5+.5;vec3 c=mix(u_colorA,u_colorB,smoothstep(.05,.85,n));c=mix(c,u_accent,smoothstep(.58,1.0,n)*.55);c+=grain(uv+fract(t))*.13*u_intensity;gl_FragColor=vec4(c,1.0);}`}),F=N({id:`color-bends`,name:`Color Bends`,category:`gradient`,description:`Broad luminous colour bands folding through space.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float w=fbm(p*u_scale*.6+t*.12);float b=sin((p.x+sin(p.y*1.7+t)*.45+w*.7)*4.0);float k=.5+.5*b;vec3 c=mix(u_colorA,u_colorB,smoothstep(.05,.8,k));c=mix(c,u_accent,pow(smoothstep(.55,1.0,k),2.0));c+=u_accent*pow(max(0.0,b),8.0)*.35*u_intensity;gl_FragColor=vec4(c,1.0);}`}),I=N({id:`ribbon-flow`,name:`Ribbon Flow`,category:`gradient`,description:`Layered twisting ribbons with depth and highlights.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec3 c=u_colorA;for(int i=0;i<6;i++){float f=float(i);float y=sin(p.x*(1.2+f*.17)+t*(.5+f*.08)+f)*(.18+f*.025);y+=snoise(vec2(p.x*.7+f,t*.15))*0.16;float r=exp(-abs(p.y-y-f*.08+.2)*18.0);vec3 rc=mix(u_colorB,u_accent,fract(f*.37));c+=rc*r*(.22+.1*f);}c*=u_intensity;gl_FragColor=vec4(c,1.0);}`}),L=N({id:`neuro-noise`,name:`Neuro Noise`,category:`organic`,description:`Branching neural filaments grown from warped noise.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 q=p*u_scale;float a=fbm(q+vec2(t*.15,0.0));float b=fbm(q*1.7+vec2(-t*.12,4.0));float v=abs(sin((a+b)*12.0));float line=1.0-smoothstep(.04,.18,v);float glow=1.0-smoothstep(.05,.55,v);vec3 c=mix(u_colorA,u_colorB,glow*.35);c+=u_accent*(line+glow*.25)*u_intensity;gl_FragColor=vec4(c,1.0);}`}),R=N({id:`warp-tunnel`,name:`Warp Tunnel`,category:`space`,description:`A luminous radial tunnel rushing toward infinity.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p)+.001;float a=atan(p.y,p.x);float n=fbm(vec2(a*1.8,log(r)*u_scale-t));float bands=.5+.5*sin(log(r)*18.0-u_time*3.0+n*5.0);float spokes=.5+.5*sin(a*14.0+n*3.0);float g=pow(bands*spokes,4.0)/(1.0+r*2.0);vec3 c=mix(u_colorA,u_colorB,bands*.35)+u_accent*g*u_intensity;gl_FragColor=vec4(c,1.0);}`}),z=N({id:`spiral-field`,name:`Spiral Field`,category:`geometric`,description:`Hypnotic polar bands curling into a soft centre.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p);float a=atan(p.y,p.x);float s=.5+.5*sin(a*7.0-log(r+.08)*u_scale*5.0-t*3.0+fbm(p*2.0)*2.0);float edge=smoothstep(.35,.65,s);vec3 c=mix(u_colorA,u_colorB,edge);c+=u_accent*pow(s,7.0)*exp(-r*.7)*u_intensity;gl_FragColor=vec4(c,1.0);}`}),se=N({id:`dot-orbit`,name:`Dot Orbit`,category:`interactive`,interactive:!0,description:`Glowing particles orbit moving cursor-influenced attractors.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 m=mouseSmoothPos();vec3 c=u_colorA;for(int i=0;i<9;i++){float f=float(i);float a=t*(.45+f*.025)+f*TAU/9.0;float r=.22+.055*f;vec2 o=vec2(cos(a),sin(a))*r+sin(f*2.3+t)*.08;o=mix(o,m*.25,u_mouseEnter);float d=length(p-o);float g=.012/(d*d+.004);c+=mix(u_colorB,u_accent,fract(f*.31))*g*.035*u_intensity;}gl_FragColor=vec4(c,1.0);}`}),B=N({id:`smoke-ring`,name:`Smoke Ring`,category:`organic`,description:`Turbulent expanding rings with a coloured smoky glow.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p);float n=fbm(p*u_scale+vec2(t*.15,-t*.1));float sum=0.0;for(int i=0;i<4;i++){float age=fract(t*.18+float(i)*.25);float ring=exp(-abs(r-(.15+age*1.15)+n*.12)*22.0)*(1.0-age);sum+=ring;}vec3 c=mix(u_colorA,u_colorB,clamp(sum*.45,0.0,1.0));c+=u_accent*sum*.65*u_intensity;gl_FragColor=vec4(c,1.0);}`}),V=N({id:`color-panels`,name:`Color Panels`,category:`gradient`,description:`Sliding geometric panels with softened colour seams.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float x=p.x+sin(p.y*1.5+t)*.28+fbm(p*.8)*.2;float panel=floor((x*u_scale+t*.25)+3.0);float local=fract(x*u_scale+t*.25);vec3 pc=mix(u_colorB,u_accent,fract(panel*.618));float seam=smoothstep(.02,.18,local)*smoothstep(.02,.18,1.0-local);vec3 c=mix(u_colorA,pc,seam*u_intensity);gl_FragColor=vec4(c,1.0);}`}),H=N({id:`line-waves`,name:`Line Waves`,category:`geometric`,description:`Layered glowing sine lines flowing with parallax.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec3 c=u_colorA;for(int i=0;i<12;i++){float f=float(i);float y=-.8+f*.14+sin(p.x*u_scale+f*.5+t*(.5+f*.02))*.09;float d=abs(p.y-y);float l=1.0-smoothstep(.008,.025,d);float g=exp(-d*35.0);c+=mix(u_colorB,u_accent,f/11.0)*(l+g*.15)*u_intensity;}gl_FragColor=vec4(c,1.0);}`}),U=N({id:`light-beams`,name:`Light Beams`,category:`space`,description:`Soft volumetric beams cutting through animated haze.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 source=vec2(sin(t*.3)*.35,1.1);vec2 d=p-source;float a=atan(d.y,d.x);float haze=fbm(p*u_scale+vec2(t*.1,0.0))*.5+.5;float beams=pow(.5+.5*sin(a*18.0+haze*4.0),10.0);float fall=1.0/(1.0+dot(d,d));vec3 c=u_colorA+u_colorB*haze*.14;c+=u_accent*beams*fall*haze*u_intensity;gl_FragColor=vec4(c,1.0);}`}),W=N({id:`magic-rings`,name:`Magic Rings`,category:`interactive`,interactive:!0,description:`Nested luminous rings bending around the pointer.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;vec2 m=mouseSmoothPos();p-=m*.28*u_mouseEnter;float t=u_time*u_speed;float r=length(p)+fbm(p*u_scale+t*.08)*.08;float rings=.5+.5*sin(r*32.0-t*4.0);float line=pow(rings,12.0);vec3 c=mix(u_colorA,u_colorB,rings*.22);c+=u_accent*line*exp(-r*.7)*u_intensity;gl_FragColor=vec4(c,1.0);}`}),G=N({id:`network-field`,name:`Network Field`,category:`geometric`,description:`A drifting constellation connected by luminous threads.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y*u_scale;vec2 id=floor(p),gv=fract(p)-.5;float t=u_time*u_speed;float glow=0.0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 n=vec2(float(i),float(j));vec2 o=hash22(id+n)-.5;o+=sin(t+hash22(id+n)*TAU)*.18;vec2 q=n+o-gv;float d=length(q);glow+=.015/(d*d+.01);}float links=1.0-smoothstep(.03,.08,abs(gv.x-gv.y+sin(id.x+id.y+t)*.15));vec3 c=u_colorA+u_colorB*glow*.18+pow(max(glow,0.0),1.0/3.0)*u_accent*.02;c+=u_accent*links*.18*u_intensity;gl_FragColor=vec4(c,1.0);}`}),K=N({id:`branching-trunk`,name:`Branching Trunk`,category:`organic`,description:`Electrical tree-like tendrils branching through darkness.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float y=p.y;float x=p.x;float trunk=abs(x-sin(y*u_scale+t)*.08);float b1=abs(x-sin(y*3.0+t)*(.12+.25*smoothstep(-.2,.8,y)));float b2=abs(x+sin(y*3.7-t*.8)*(.1+.3*smoothstep(-.1,.9,y)));float d=min(trunk,min(b1,b2));float g=exp(-d*45.0)*(1.0-smoothstep(.85,1.25,abs(y)));vec3 c=u_colorA+mix(u_colorB,u_accent,smoothstep(-.7,.8,y))*g*u_intensity;gl_FragColor=vec4(c,1.0);}`}),ce=N({id:`cloudscape`,name:`Cloudscape`,category:`space`,description:`Layered illuminated clouds drifting across a deep sky.`,fragment:`void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float n=fbm(vec3(p*u_scale+vec2(t*.1,0.0),t*.08))*.5+.5;float clouds=smoothstep(.38,.72,n+uv.y*.12);float edge=smoothstep(.3,.65,n)-smoothstep(.62,.9,n);vec3 c=mix(u_colorA,u_colorB,clouds*.8);c+=u_accent*edge*.32*u_intensity;c*=.72+.4*uv.y;gl_FragColor=vec4(c,1.0);}`}),le=N({id:`ocean-surface`,name:`Ocean Surface`,category:`organic`,description:`Perspective rolling waves with a bright reflective horizon.`,fragment:`void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float horizon=.18;float z=1.0/max(.06,uv.y-horizon);vec2 q=vec2(p.x*z,z)*u_scale*.35;float w=sin(q.x*2.0+t)+sin(q.y*1.3-t*.8)+snoise(q*.7+t*.2);float crest=pow(.5+.5*sin(w*2.0),8.0);float sky=smoothstep(horizon-.02,horizon+.02,uv.y);vec3 sea=mix(u_colorA,u_colorB,.35+.35*w);vec3 c=mix(u_colorA*.5,sea,sky);c+=u_accent*crest*sky*u_intensity/(1.0+z*.06);gl_FragColor=vec4(c,1.0);}`}),ue=N({id:`liquid-shape-distortion`,name:`Liquid Shapes`,category:`organic`,description:`Psychedelic liquid forms with bloom and soft shadows.`,fragment:`void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 w=vec2(fbm(p*u_scale+t*.12),fbm(p*u_scale+4.0-t*.1));float f=fbm(p*u_scale+w*1.8);float shape=smoothstep(-.15,.2,f);float rim=smoothstep(.02,.22,abs(f-.03));vec3 c=mix(u_colorA,u_colorB,shape);c+=u_accent*(1.0-rim)*u_intensity;c+=grain(uv+fract(t))*.04;gl_FragColor=vec4(c,1.0);}`}),de=N({id:`stripe-flow`,name:`Stripe Flow`,category:`gradient`,description:`Warped Stripe-style colour bands in constant motion.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float w=fbm(p*u_scale*.7+vec2(t*.12,0.0));float s=.5+.5*sin((p.x+p.y*.25+w*.8)*u_scale*5.0+t);vec3 c=mix(u_colorA,u_colorB,smoothstep(.12,.72,s));c=mix(c,u_accent,smoothstep(.7,1.0,s)*u_intensity);gl_FragColor=vec4(c,1.0);}`}),fe=N({id:`conic-flow`,name:`Conic Flow`,category:`gradient`,description:`Rotating conic colour wedges softened by procedural noise.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float a=atan(p.y,p.x)/TAU+.5;float n=fbm(p*u_scale+t*.08)*.12;float wd=max(1.0,floor(u_scale));float s=fract(a*wd+n+t*.08);float sm=min(s,1.0-s)*2.0;vec3 c=mix(u_colorA,u_colorB,smoothstep(.05,.85,sm));c=mix(c,u_accent,smoothstep(.55,.95,sm)*u_intensity);c*=1.1-.25*length(p);gl_FragColor=vec4(c,1.0);}`}),pe=N({id:`smoke-gradient`,name:`Smoke Gradient`,category:`gradient`,description:`A coloured gradient transported through slow smoke.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 q=p*u_scale*.6;vec2 w=vec2(fbm(q+t*.1),fbm(q+6.0-t*.08));float n=fbm(q+w*2.0+t*.05)*.5+.5;float plume=smoothstep(.18,.82,n);vec3 c=mix(u_colorA,u_colorB,plume);c+=u_accent*pow(plume,3.0)*.35*u_intensity;gl_FragColor=vec4(c,1.0);}`}),me=N({id:`radar-sweep`,name:`Radar Sweep`,category:`interactive`,interactive:!0,description:`A scanning radial grid with cursor-positioned echoes.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p),a=atan(p.y,p.x);float circles=1.0-smoothstep(.02,.045,abs(fract(r*u_scale*2.0)-.5));float spokes=1.0-smoothstep(.015,.04,abs(sin(a*6.0)));float sweep=pow(max(0.0,cos(a-t*2.0)),22.0);float echo=exp(-length(p-mouseSmoothPos())*8.0)*u_mouseEnter;vec3 c=u_colorA+u_colorB*(circles+spokes)*.18;c+=u_accent*(sweep*(1.0-r)+echo)*u_intensity;gl_FragColor=vec4(c,1.0);}`}),he=N({id:`pixel-trail`,name:`Pixel Trail`,category:`interactive`,interactive:!0,description:`A pixelated glow trail that follows movement and clicks.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;vec2 cell=floor(p*u_scale*18.0)/(u_scale*18.0);float d=length(cell-mouseSmoothPos());float trail=exp(-d*7.0)*u_mouseEnter;trail+=abs(rippleField(cell,1.0,18.0,1.2));float flick=hash21(cell*31.0+floor(u_time*8.0));float v=smoothstep(.1,.9,trail*(.6+.7*flick));vec3 c=mix(u_colorA,u_colorB,v);c+=u_accent*v*u_intensity;gl_FragColor=vec4(c,1.0);}`}),ge=N({id:`antigravity-field`,name:`Antigravity Field`,category:`interactive`,interactive:!0,description:`Floating particles pushed away by the pointer.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y*u_scale;vec2 m=mouseSmoothPos()*u_scale;vec2 id=floor(p),gv=fract(p)-.5;float t=u_time*u_speed;float stars=0.0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 n=vec2(float(i),float(j));vec2 o=hash22(id+n)-.5;o+=sin(t+hash22(id+n)*TAU)*.22;vec2 wp=id+n+o;vec2 away=normalize(wp-m+vec2(.001))*exp(-length(wp-m)*.7)*u_mouseEnter;float d=length(n+o+away*.65-gv);stars+=.012/(d*d+.008);}vec3 c=u_colorA+mix(u_colorB,u_accent,clamp(stars*.08,0.0,1.0))*stars*.08*u_intensity;gl_FragColor=vec4(c,1.0);}`}),_e=N({id:`metallic-paint`,name:`Metallic Paint`,category:`iridescent`,description:`Flowing chrome bands with glossy coloured reflections.`,fragment:`float metalH(vec2 p,float t){return fbm(p*u_scale+vec2(t*.12,-t*.08));}void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float e=.012;float h=metalH(p,t);vec2 g=vec2(metalH(p+vec2(e,0),t)-h,metalH(p+vec2(0,e),t)-h)/e;vec3 n=normalize(vec3(-g*.35,1.0));float ref=.5+.5*n.x;float spec=pow(max(0.0,dot(n,normalize(vec3(.4,.6,1.0)))),28.0);vec3 c=mix(u_colorA,u_colorB,ref);c=mix(c,u_accent,.5+.5*sin(h*8.0+t));c+=spec*u_intensity;gl_FragColor=vec4(c,1.0);}`}),ve=N({id:`shifting-sands`,name:`Shifting Sands`,category:`organic`,description:`Wind-sculpted dune ridges with travelling highlights.`,fragment:`float dune(vec2 p,float t){float n=fbm(p*u_scale+vec2(t*.08,0.0));return 1.0-abs(n);}void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float e=.012;float h=dune(p,t);vec2 g=vec2(dune(p+vec2(e,0),t)-h,dune(p+vec2(0,e),t)-h)/e;vec3 n=normalize(vec3(-g*.22,1.0));float light=clamp(dot(n,normalize(vec3(-.5,.5,1.0))),0.0,1.0);vec3 c=mix(u_colorA,u_colorB,h*.7);c+=u_accent*pow(light,3.0)*u_intensity;gl_FragColor=vec4(c,1.0);}`}),ye=N({id:`cosmic-vortex`,name:`Cosmic Vortex`,category:`interactive`,interactive:!0,description:`Spiralling energy around a cursor-controlled centre.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;vec2 centre=mouseSmoothPos()*.45*u_mouseEnter;p-=centre;float t=u_time*u_speed;float r=length(p)+.01,a=atan(p.y,p.x);float n=fbm(vec2(a*2.0,r*u_scale*3.0-t));float arms=.5+.5*sin(a*7.0-r*12.0+t*2.0+n*4.0);float glow=pow(arms,6.0)*exp(-r*.9)+.025/r;vec3 c=mix(u_colorA,u_colorB,arms*.25);c+=u_accent*glow*u_intensity;gl_FragColor=vec4(c,1.0);}`}),be=N({id:`smoke-ink`,name:`Smoke Ink`,category:`organic`,description:`Dense ink tendrils curling through coloured haze.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 q=p*u_scale;vec2 w=vec2(fbm(q+t*.08),fbm(q+9.0-t*.06));float n=fbm(q+w*2.3);float ink=smoothstep(-.3,.45,n);float vein=pow(1.0-abs(sin(n*9.0)),5.0);vec3 c=mix(u_colorA,u_colorB,ink*.75);c+=u_accent*vein*ink*.55*u_intensity;gl_FragColor=vec4(c,1.0);}`}),xe=N({id:`moire-interference`,name:`Moiré Interference`,category:`geometric`,description:`Overlapping line fields producing shifting interference.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float a=sin(length(p-vec2(sin(t)*.2,0.0))*u_scale*30.0);float b=sin(length(p+vec2(cos(t*.8)*.25,0.0))*u_scale*30.5);float m=.5+.5*a*b;float lines=pow(m,5.0);vec3 c=mix(u_colorA,u_colorB,m*.45);c+=u_accent*lines*u_intensity;gl_FragColor=vec4(c,1.0);}`}),Se=N({id:`reaction-diffusion`,name:`Reaction Diffusion`,category:`organic`,description:`Evolving coral and zebra-like cellular bands.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 q=p*u_scale;float n=fbm(q+t*.05);float cells=sin(q.x*3.0+n*8.0)+sin(q.y*3.2-n*7.0)+snoise(vec3(q*1.8,t*.15))*1.5;float band=1.0-smoothstep(.12,.5,abs(sin(cells*1.6)));vec3 c=mix(u_colorA,u_colorB,smoothstep(-1.0,1.0,cells)*.65);c+=u_accent*band*u_intensity;gl_FragColor=vec4(c,1.0);}`}),Ce=N({id:`kaleidoscope`,name:`Kaleidoscope`,category:`geometric`,description:`Mirrored procedural colour with crystalline symmetry.`,fragment:`void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p),a=atan(p.y,p.x);float seg=TAU/8.0;a=abs(mod(a+t*.08,seg)-seg*.5);vec2 q=vec2(cos(a),sin(a))*r*u_scale;float n=fbm(q+vec2(t*.12,-t*.1))*.5+.5;float facets=.5+.5*sin(n*12.0+r*15.0);vec3 c=mix(u_colorA,u_colorB,n);c=mix(c,u_accent,pow(facets,4.0)*u_intensity);gl_FragColor=vec4(c,1.0);}`}),q=[P,F,I,V,de,fe,pe],J=[L,B,K,le,ue,ve,be,Se],Y=[se,W,me,he,ge,ye],X=[R,U,ce],Z=[z,H,G,xe,Ce],Q=[_e];[...q,...Q,...Y,...J,...X,...Z];var $=[g,te,D,...q,...b,...E,oe,S,w,...Q,m,h,O,re,...Y,_,C,M,ne,p,...J,k,x,ie,...X,A,j,ae,...Z],we=[{id:`gradient`,label:`Gradient`},{id:`iridescent`,label:`Iridescent`},{id:`interactive`,label:`Interactive`},{id:`organic`,label:`Organic`},{id:`space`,label:`Space`},{id:`geometric`,label:`Geometric`}];Object.fromEntries($.map(e=>[Ee(e.id),e]));function Te(e){return $.find(t=>t.id===e)}function Ee(e){return e.replace(/-([a-z])/g,(e,t)=>t.toUpperCase())}export{c as a,a as c,f as i,l,Te as n,i as o,$ as r,s,we as t,t as u};