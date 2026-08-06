/**
 * Particle text — a word rendered as a field of GPU-simulated particles that
 * scatter from the pointer and spring back.
 *
 * Unlike everything else in `src/shaders`, this is not a fullscreen fragment
 * shader: it needs per-particle state, so it runs the physics in a vertex
 * shader and captures the result with WebGL2 transform feedback, ping-ponging
 * between two buffer sets. Nothing is read back to the CPU — position and
 * velocity never leave the GPU.
 *
 * That means WebGL2, which this project does not otherwise require. Callers
 * are expected to render the word as real text alongside and hide it only once
 * `supported` reports true; `ParticleText` in `src/ui` does exactly that.
 */

export type RGBTriplet = [number, number, number];

export interface ParticleTextColors {
  /** At rest. */
  rest: RGBTriplet;
  /** Mid-energy, as a particle is pushed. */
  mid: RGBTriplet;
  /** Peak energy. */
  hot: RGBTriplet;
}

export interface ParticleTextOptions {
  /** The word to render. Kept short — this is a display treatment. */
  text: string;
  /** CSS font shorthand minus the size, e.g. `900 %dpx "Inter", sans-serif`. */
  fontFamily?: string;
  fontWeight?: number;
  /** Particle count to aim for. The sampler picks a stride to land near it. */
  particles?: number;
  /** Fraction of the canvas width the word should span. */
  fill?: number;
  /** Horizontal placement of the word within the canvas. */
  align?: "left" | "center" | "right";
  maxDpr?: number;
  pauseWhenHidden?: boolean;
  respectReducedMotion?: boolean;
  /** Pointer influence radius, in CSS pixels. */
  radius?: number;
  /** Push strength. */
  force?: number;
  /** How hard particles are pulled back to their home position. */
  spring?: number;
  colors?: ParticleTextColors;
  onError?: (message: string) => void;
}

const DEFAULT_COLORS: ParticleTextColors = {
  rest: [0.36, 0.55, 0.95],
  mid: [0.62, 0.44, 0.98],
  hot: [1.0, 0.66, 0.36],
};

/* ---- shaders ------------------------------------------------------------ */

/**
 * The physics pass. Writes nothing to the framebuffer — `RASTERIZER_DISCARD` is
 * on and the only outputs are the two transform-feedback varyings.
 */
const UPDATE_VS = `#version 300 es
precision highp float;

layout(location=0) in vec2  a_position;
layout(location=1) in vec2  a_velocity;
layout(location=2) in vec2  a_home;
layout(location=3) in float a_rand;

uniform vec2  u_mouse;
uniform float u_mouseSpeed;   // px/s, smoothed
uniform float u_active;       // 0 once the pointer leaves the canvas
uniform float u_dt;
uniform float u_radius;
uniform float u_force;
uniform float u_spring;
uniform float u_impulse;      // one-frame click burst
uniform float u_time;
uniform float u_shimmer;      // 0 under prefers-reduced-motion

out vec2 v_position;
out vec2 v_velocity;

void main(){
  vec2 pos = a_position;
  vec2 vel = a_velocity;

  vec2  d    = pos - u_mouse;
  float dist = length(d);
  // A particle sitting exactly under the pointer has no direction to flee, so
  // give it a stable per-particle one rather than letting it stall there.
  vec2  dir  = dist > 0.001 ? d / dist
                            : vec2(cos(a_rand * 6.2831), sin(a_rand * 6.2831));

  if (dist < u_radius && u_active > 0.5) {
    float f    = 1.0 - dist / u_radius;
    f          = f * f;
    // A slow cursor nudges; a fast one shoves. Without this the field reacts
    // identically to a drift and a swipe.
    float gain = 0.22 + min(u_mouseSpeed / 900.0, 1.0) * 1.78;

    vel += dir * f * u_force * gain * u_dt;

    // Tangential swirl, signed per particle, so the wake curls instead of
    // expanding as a clean ring.
    vec2 tang = vec2(-dir.y, dir.x) * (a_rand * 2.0 - 1.0);
    vel += tang * f * u_force * 0.5 * gain * u_dt;
  }

  if (u_impulse > 0.0) {
    float br = u_radius * 2.6;
    if (dist < br) {
      float f = 1.0 - dist / br;
      vel += dir * f * f * u_impulse;
    }
  }

  // Ambient shimmer, so idle text still breathes.
  float t = u_time * 1.4 + a_rand * 96.0;
  vel += vec2(sin(t), cos(t * 1.31)) * 6.0 * u_shimmer * u_dt;

  // Spring home, then damp. The exponential keeps damping frame-rate
  // independent, which a plain multiply would not.
  vel += (a_home - pos) * u_spring * u_dt;
  vel *= exp(-5.6 * u_dt);
  pos += vel * u_dt;

  v_position = pos;
  v_velocity = vel;
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
}`;

const UPDATE_FS = `#version 300 es
precision mediump float;
out vec4 o;
void main(){ o = vec4(1.0); }`;

const DRAW_VS = `#version 300 es
precision highp float;

layout(location=0) in vec2 a_position;
layout(location=1) in vec2 a_velocity;
layout(location=2) in vec2 a_home;

uniform vec2  u_resolution;
uniform float u_pointSize;

out float v_energy;

void main(){
  vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
  clip.y = -clip.y;

  // Energy blends speed with displacement: a particle flung far but slowing
  // should still read as hot, and one vibrating in place should not.
  float disp = length(a_position - a_home);
  float spd  = length(a_velocity);
  v_energy   = clamp(spd / 500.0 + disp / 170.0, 0.0, 1.0);

  gl_Position  = vec4(clip, 0.0, 1.0);
  gl_PointSize = u_pointSize * (1.0 + v_energy * 0.85);
}`;

const DRAW_FS = `#version 300 es
precision mediump float;

in float v_energy;
out vec4 outColor;

uniform vec3 u_rest;
uniform vec3 u_mid;
uniform vec3 u_hot;

void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.06, d);
  if (a <= 0.0) discard;

  vec3 col = mix(u_rest, u_mid, smoothstep(0.0, 0.55, v_energy));
  col      = mix(col,    u_hot, smoothstep(0.55, 1.0, v_energy));

  outColor = vec4(col * (0.55 + v_energy * 0.85), a);
}`;

/* ---- engine ------------------------------------------------------------- */

export class ParticleTextField {
  readonly canvas: HTMLCanvasElement;
  /** False when WebGL2 is unavailable — callers should keep their text visible. */
  readonly supported: boolean;

  private gl: WebGL2RenderingContext | null = null;
  private updateProg: WebGLProgram | null = null;
  private drawProg: WebGLProgram | null = null;
  private uU: Record<string, WebGLUniformLocation | null> = {};
  private uD: Record<string, WebGLUniformLocation | null> = {};

  private buf = {
    pos: [null, null] as (WebGLBuffer | null)[],
    vel: [null, null] as (WebGLBuffer | null)[],
    home: null as WebGLBuffer | null,
    rand: null as WebGLBuffer | null,
  };
  private vaoUpdate: (WebGLVertexArrayObject | null)[] = [null, null];
  private vaoDraw: (WebGLVertexArrayObject | null)[] = [null, null];
  private tf: (WebGLTransformFeedback | null)[] = [null, null];

  private count = 0;
  private pointSize = 2;
  private current = 0;
  private dpr = 1;

  private sampler = document.createElement("canvas");
  private sctx: CanvasRenderingContext2D | null;

  private raf = 0;
  private playing = false;
  private visible = true;
  private disposed = false;
  private last = 0;
  private time = 0;
  private reduced = false;

  private mouse = { x: -9999, y: -9999, px: -9999, py: -9999, speed: 0, active: 0 };
  private impulse = 0;

  private ro?: ResizeObserver;
  private io?: IntersectionObserver;
  private detachPointer?: () => void;
  private rebuildTimer = 0;
  /** CSS size the current particle layout was sampled at. */
  private builtW = 0;
  private builtH = 0;
  private hasBuilt = false;

  private opts: Required<
    Omit<ParticleTextOptions, "onError" | "colors" | "text" | "fontFamily">
  > & {
    text: string;
    fontFamily: string;
    colors: ParticleTextColors;
    onError?: (message: string) => void;
  };

  constructor(canvas: HTMLCanvasElement, options: ParticleTextOptions) {
    this.canvas = canvas;
    this.sctx = this.sampler.getContext("2d", { willReadFrequently: true });

    this.opts = {
      text: options.text,
      fontFamily: options.fontFamily ?? 'ui-sans-serif, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontWeight: options.fontWeight ?? 900,
      particles: options.particles ?? 40000,
      fill: options.fill ?? 0.86,
      align: options.align ?? "center",
      maxDpr: options.maxDpr ?? 2,
      pauseWhenHidden: options.pauseWhenHidden ?? true,
      respectReducedMotion: options.respectReducedMotion ?? true,
      radius: options.radius ?? 150,
      force: options.force ?? 2800,
      spring: options.spring ?? 45,
      colors: options.colors ?? DEFAULT_COLORS,
      onError: options.onError,
    };

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
    });

    if (!gl) {
      this.supported = false;
      this.opts.onError?.("WebGL2 is not available in this browser.");
      return;
    }

    this.supported = true;
    this.gl = gl;

    try {
      this.updateProg = this.link(UPDATE_VS, UPDATE_FS, ["v_position", "v_velocity"]);
      this.drawProg = this.link(DRAW_VS, DRAW_FS);
    } catch (err) {
      this.supported = false;
      this.gl = null;
      this.opts.onError?.(err instanceof Error ? err.message : String(err));
      return;
    }

    this.uU = this.uniforms(this.updateProg, [
      "u_mouse", "u_mouseSpeed", "u_active", "u_dt", "u_radius",
      "u_force", "u_spring", "u_impulse", "u_time", "u_shimmer",
    ]);
    this.uD = this.uniforms(this.drawProg, [
      "u_resolution", "u_pointSize", "u_rest", "u_mid", "u_hot",
    ]);

    this.reduced =
      this.opts.respectReducedMotion &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    // Additive, so overlapping particles glow rather than flatten.
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    this.resize();
    this.build();
    this.observeResize();
    if (this.opts.pauseWhenHidden) this.observeVisibility();
    this.attachPointer();

    // Webfonts change the glyph outlines, and the sampler runs against
    // whatever is loaded at the time. Re-sample once they settle, or the
    // particles keep the fallback face's shapes for the life of the page.
    // Skipped when they are already loaded, so the common case builds once —
    // every rebuild restarts the layout, and doing it twice on load reads as
    // the word assembling, breaking apart and assembling again.
    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(() => {
        if (!this.disposed) this.build();
      });
    }

    if (this.reduced) this.renderFrame();
    else this.play();
  }

  /* ---- public API ------------------------------------------------------- */

  setText(text: string): void {
    if (text === this.opts.text) return;
    this.opts.text = text;
    this.build();
  }

  setParams(params: Partial<Pick<ParticleTextOptions, "radius" | "force" | "spring">>): void {
    Object.assign(this.opts, params);
  }

  setColors(colors: ParticleTextColors): void {
    this.opts.colors = colors;
    if (!this.playing) this.renderFrame();
  }

  /** Particles currently in the field. */
  get particleCount(): number {
    return this.count;
  }

  play(): void {
    if (this.playing || this.disposed || !this.gl) return;
    this.playing = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  pause(): void {
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  dispose(): void {
    this.disposed = true;
    this.pause();
    clearTimeout(this.rebuildTimer);
    this.ro?.disconnect();
    this.io?.disconnect();
    this.detachPointer?.();

    const gl = this.gl;
    if (!gl) return;
    this.destroyBuffers();
    if (this.updateProg) gl.deleteProgram(this.updateProg);
    if (this.drawProg) gl.deleteProgram(this.drawProg);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.gl = null;
  }

  /* ---- GL plumbing ------------------------------------------------------ */

  private compile(type: number, src: string): WebGLShader {
    const gl = this.gl!;
    const s = gl.createShader(type);
    if (!s) throw new Error("Failed to create shader.");
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s) ?? "Shader failed to compile.";
      gl.deleteShader(s);
      throw new Error(log);
    }
    return s;
  }

  private link(vsSrc: string, fsSrc: string, feedback?: string[]): WebGLProgram {
    const gl = this.gl!;
    const p = gl.createProgram();
    if (!p) throw new Error("Failed to create program.");
    const vs = this.compile(gl.VERTEX_SHADER, vsSrc);
    const fs = this.compile(gl.FRAGMENT_SHADER, fsSrc);
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    if (feedback) gl.transformFeedbackVaryings(p, feedback, gl.SEPARATE_ATTRIBS);
    gl.linkProgram(p);
    // Shaders are reference-counted by the program; drop our handles either way.
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(p) ?? "Program failed to link.";
      gl.deleteProgram(p);
      throw new Error(log);
    }
    return p;
  }

  private uniforms(p: WebGLProgram, names: string[]) {
    const gl = this.gl!;
    const out: Record<string, WebGLUniformLocation | null> = {};
    for (const n of names) out[n] = gl.getUniformLocation(p, n);
    return out;
  }

  /* ---- text sampling ---------------------------------------------------- */

  /**
   * Rasterises the word to an offscreen 2D canvas and keeps one point per
   * inked pixel on a stride. The stride is derived from the ink count so the
   * particle total stays near `particles` regardless of word length or canvas
   * size — a short word simply samples more finely.
   */
  private samplePositions(w: number, h: number): { pos: Float32Array; step: number } {
    const ctx = this.sctx;
    if (!ctx) return { pos: new Float32Array(0), step: 2 };

    this.sampler.width = w;
    this.sampler.height = h;
    ctx.clearRect(0, 0, w, h);

    const label = (this.opts.text || " ").trim() || " ";
    const face = (px: number) => `${this.opts.fontWeight} ${px}px ${this.opts.fontFamily}`;

    // Fit the box, not a fixed fraction of it. Start from the height a single
    // centred line can use — roughly 0.78 of the font size renders as glyph —
    // then shrink to respect the `fill` width margin. Sizing from height alone
    // leaves the word tiny in a short, wide container, which is exactly the
    // shape a headline slot tends to be.
    let size = Math.min(h * 0.78, 460);
    ctx.font = face(Math.round(size));
    const wide = ctx.measureText(label).width;
    if (wide > w * this.opts.fill) size *= (w * this.opts.fill) / wide;
    size = Math.max(12, Math.round(size));

    ctx.font = face(size);
    ctx.textAlign = this.opts.align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    // All three alignments respect the same `fill` margin, so switching
    // alignment moves the word without changing how much room it takes.
    const inset = (w * (1 - this.opts.fill)) / 2;
    const x =
      this.opts.align === "left" ? inset
      : this.opts.align === "right" ? w - inset
      : w / 2;
    ctx.fillText(label, x, h / 2);

    const px = ctx.getImageData(0, 0, w, h).data;

    let ink = 0;
    for (let i = 3; i < px.length; i += 4) if (px[i]! > 140) ink++;
    if (!ink) return { pos: new Float32Array(0), step: 2 };

    const step = Math.max(1, Math.round(Math.sqrt(ink / this.opts.particles)) || 1);

    const pos: number[] = [];
    for (let y = 0; y < h; y += step) {
      const row = y * w * 4;
      for (let x = 0; x < w; x += step) {
        if (px[row + x * 4 + 3]! > 140) {
          // Jitter within the cell so the field reads organic rather than as
          // a visible grid.
          pos.push(
            x + (Math.random() - 0.5) * step,
            y + (Math.random() - 0.5) * step,
          );
        }
      }
    }
    return { pos: new Float32Array(pos), step };
  }

  /* ---- buffers ---------------------------------------------------------- */

  private makeBuffer(data: Float32Array, usage: number): WebGLBuffer {
    const gl = this.gl!;
    const b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    return b;
  }

  private attrib(buffer: WebGLBuffer, loc: number, size: number): void {
    const gl = this.gl!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }

  private destroyBuffers(): void {
    const gl = this.gl;
    if (!gl) return;
    for (let i = 0; i < 2; i++) {
      if (this.buf.pos[i]) gl.deleteBuffer(this.buf.pos[i]!);
      if (this.buf.vel[i]) gl.deleteBuffer(this.buf.vel[i]!);
      if (this.vaoUpdate[i]) gl.deleteVertexArray(this.vaoUpdate[i]!);
      if (this.vaoDraw[i]) gl.deleteVertexArray(this.vaoDraw[i]!);
      if (this.tf[i]) gl.deleteTransformFeedback(this.tf[i]!);
      this.buf.pos[i] = this.buf.vel[i] = null;
      this.vaoUpdate[i] = this.vaoDraw[i] = null;
      this.tf[i] = null;
    }
    if (this.buf.home) gl.deleteBuffer(this.buf.home);
    if (this.buf.rand) gl.deleteBuffer(this.buf.rand);
    this.buf.home = this.buf.rand = null;
  }

  private build(): void {
    const gl = this.gl;
    if (!gl || this.disposed) return;

    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    const { pos: home, step } = this.samplePositions(w, h);

    this.destroyBuffers();

    // Only the very first layout flies in. A later rebuild — a resize, a font
    // landing, new text — starts at rest, because re-scattering the word every
    // time the container changes width is a spectacle nobody asked for.
    const scatter = !this.hasBuilt && !this.reduced;
    this.builtW = w;
    this.builtH = h;
    this.hasBuilt = true;

    this.count = home.length / 2;
    this.pointSize = Math.min(4.2, Math.max(1.15, step * 0.92)) * this.dpr;
    if (!this.count) return;

    const start = new Float32Array(this.count * 2);
    const vel = new Float32Array(this.count * 2);
    const rand = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      rand[i] = Math.random();
      if (scatter) {
        // Scattered on a ring outside the canvas, so the word flies together.
        const a = Math.random() * Math.PI * 2;
        const r = Math.max(w, h) * (0.55 + Math.random() * 0.6);
        start[i * 2] = w / 2 + Math.cos(a) * r;
        start[i * 2 + 1] = h / 2 + Math.sin(a) * r;
      } else {
        start[i * 2] = home[i * 2]!;
        start[i * 2 + 1] = home[i * 2 + 1]!;
      }
    }

    this.buf.pos[0] = this.makeBuffer(start, gl.DYNAMIC_COPY);
    this.buf.pos[1] = this.makeBuffer(start, gl.DYNAMIC_COPY);
    this.buf.vel[0] = this.makeBuffer(vel, gl.DYNAMIC_COPY);
    this.buf.vel[1] = this.makeBuffer(vel, gl.DYNAMIC_COPY);
    this.buf.home = this.makeBuffer(home, gl.STATIC_DRAW);
    this.buf.rand = this.makeBuffer(rand, gl.STATIC_DRAW);

    for (let i = 0; i < 2; i++) {
      this.vaoUpdate[i] = gl.createVertexArray();
      gl.bindVertexArray(this.vaoUpdate[i]!);
      this.attrib(this.buf.pos[i]!, 0, 2);
      this.attrib(this.buf.vel[i]!, 1, 2);
      this.attrib(this.buf.home!, 2, 2);
      this.attrib(this.buf.rand!, 3, 1);

      this.vaoDraw[i] = gl.createVertexArray();
      gl.bindVertexArray(this.vaoDraw[i]!);
      this.attrib(this.buf.pos[i]!, 0, 2);
      this.attrib(this.buf.vel[i]!, 1, 2);
      this.attrib(this.buf.home!, 2, 2);

      // tf[i] receives the result of stepping set i, so no buffer is ever read
      // and written in the same pass.
      this.tf[i] = gl.createTransformFeedback();
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.tf[i]!);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buf.pos[1 - i]!);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.buf.vel[1 - i]!);
    }

    gl.bindVertexArray(null);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.current = 0;

    if (!this.playing) this.renderFrame();
  }

  /* ---- environment ------------------------------------------------------ */

  private resize(): void {
    const gl = this.gl;
    if (!gl) return;
    this.dpr = Math.min(this.opts.maxDpr, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * this.dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * this.dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  private observeResize(): void {
    this.ro = new ResizeObserver(() => {
      this.resize();
      // ResizeObserver fires once on observe(), and the canvas is normally the
      // size it was just built at — rebuilding there would re-scatter the word
      // for no reason. Only a real size change re-lays it out, debounced so a
      // drag-resize does not do it every frame.
      const w = Math.max(1, this.canvas.clientWidth);
      const h = Math.max(1, this.canvas.clientHeight);
      if (w === this.builtW && h === this.builtH) return;
      clearTimeout(this.rebuildTimer);
      this.rebuildTimer = window.setTimeout(() => this.build(), 200);
    });
    this.ro.observe(this.canvas);
  }

  private observeVisibility(): void {
    this.io = new IntersectionObserver(
      (entries) => {
        this.visible = entries[0]?.isIntersecting ?? true;
        if (this.visible && this.playing) this.last = performance.now();
      },
      { threshold: 0 },
    );
    this.io.observe(this.canvas);
  }

  /**
   * Bound to the window, like the fragment-shader renderer: as a background
   * the canvas usually sits behind content and never receives pointer events
   * itself. Coordinates are converted to canvas-local CSS pixels, which is the
   * space the particles live in.
   */
  private attachPointer(): void {
    const onMove = (e: PointerEvent) => {
      const r = this.canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && x <= r.width && y >= 0 && y <= r.height;

      this.mouse.x = x;
      this.mouse.y = y;
      // Seed the previous sample on entry, so the first frame does not read as
      // an enormous jump and slam the whole field at full gain.
      if (!this.mouse.active) {
        this.mouse.px = x;
        this.mouse.py = y;
      }
      this.mouse.active = inside ? 1 : 0;
      if (!inside) this.mouse.speed = 0;
    };

    const onDown = (e: PointerEvent) => {
      const r = this.canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || x > r.width || y < 0 || y > r.height) return;
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.active = 1;
      this.impulse = 900;
    };

    const onLeave = () => {
      this.mouse.active = 0;
      this.mouse.speed = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("pointerleave", onLeave);

    this.detachPointer = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("pointerleave", onLeave);
    };
  }

  /* ---- frame ------------------------------------------------------------ */

  private frame = (now: number): void => {
    if (!this.playing || this.disposed) return;

    // Clamped: a backgrounded tab hands back a huge delta, and the spring
    // would integrate straight to infinity.
    const dt = Math.min((now - this.last) / 1000, 1 / 30);
    this.last = now;

    if (this.visible) {
      this.time += dt;
      const inst = dt > 0
        ? Math.hypot(this.mouse.x - this.mouse.px, this.mouse.y - this.mouse.py) / dt
        : 0;
      this.mouse.speed += (inst - this.mouse.speed) * Math.min(1, dt * 12);
      this.mouse.px = this.mouse.x;
      this.mouse.py = this.mouse.y;
      this.step(dt);
    }

    this.raf = requestAnimationFrame(this.frame);
  };

  /** One static frame — used for reduced motion and after a rebuild. */
  private renderFrame(): void {
    this.step(0);
  }

  private step(dt: number): void {
    const gl = this.gl;
    if (!gl || !this.updateProg || !this.drawProg) return;

    if (!this.count) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    if (dt > 0) {
      gl.useProgram(this.updateProg);
      gl.uniform2f(this.uU.u_mouse!, this.mouse.x, this.mouse.y);
      gl.uniform1f(this.uU.u_mouseSpeed!, this.reduced ? 0 : this.mouse.speed);
      gl.uniform1f(this.uU.u_active!, this.reduced ? 0 : this.mouse.active);
      gl.uniform1f(this.uU.u_dt!, dt);
      gl.uniform1f(this.uU.u_radius!, this.opts.radius);
      gl.uniform1f(this.uU.u_force!, this.opts.force);
      gl.uniform1f(this.uU.u_spring!, this.opts.spring);
      gl.uniform1f(this.uU.u_impulse!, this.impulse);
      gl.uniform1f(this.uU.u_time!, this.time);
      gl.uniform1f(this.uU.u_shimmer!, this.reduced ? 0 : 1);
      this.impulse = 0;

      gl.bindVertexArray(this.vaoUpdate[this.current]!);
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.tf[this.current]!);
      gl.enable(gl.RASTERIZER_DISCARD);
      gl.beginTransformFeedback(gl.POINTS);
      gl.drawArrays(gl.POINTS, 0, this.count);
      gl.endTransformFeedback();
      gl.disable(gl.RASTERIZER_DISCARD);
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

      // The fresh data now lives in the other set.
      this.current = 1 - this.current;
    }

    const { rest, mid, hot } = this.opts.colors;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.drawProg);
    gl.uniform2f(this.uD.u_resolution!, this.canvas.clientWidth, this.canvas.clientHeight);
    gl.uniform1f(this.uD.u_pointSize!, this.pointSize);
    gl.uniform3f(this.uD.u_rest!, rest[0], rest[1], rest[2]);
    gl.uniform3f(this.uD.u_mid!, mid[0], mid[1], mid[2]);
    gl.uniform3f(this.uD.u_hot!, hot[0], hot[1], hot[2]);
    gl.bindVertexArray(this.vaoDraw[this.current]!);
    gl.drawArrays(gl.POINTS, 0, this.count);
    gl.bindVertexArray(null);
  }
}
