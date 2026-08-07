/**
 * Shared base for the WebGL2 text surfaces.
 *
 * Each surface rasterises a word to an offscreen 2D canvas, uploads it as a
 * texture, and then does something violent to it on the GPU — refract it,
 * shatter it, dissolve it in a fluid sim, resolve it out of glyphs. What they
 * all have in common is the boring part: context creation, the text raster,
 * canvas-local pointer tracking, sizing, and the render loop. That lives here.
 *
 * `ParticleText` deliberately does not use this. It samples the raster into a
 * CPU array of particle positions rather than uploading a texture, so it needs
 * a different rasteriser, and it is already live on the landing page.
 */

export interface TextSurfaceOptions {
  text: string;
  fontFamily?: string;
  fontWeight?: number;
  /** Fraction of the width the word should span. */
  fill?: number;
  align?: "left" | "center" | "right";
  maxDpr?: number;
  pauseWhenHidden?: boolean;
  respectReducedMotion?: boolean;
  onError?: (message: string) => void;
}

export interface InkBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/* ---- GL helpers --------------------------------------------------------- */

export interface Program extends WebGLProgram {
  u: Record<string, WebGLUniformLocation | null>;
}

export interface FBO {
  tex: WebGLTexture;
  fb: WebGLFramebuffer;
  rb: WebGLRenderbuffer | null;
  w: number;
  h: number;
  tx: number;
  ty: number;
}

export interface DoubleFBO {
  readonly read: FBO;
  readonly write: FBO;
  swap(): void;
}

export const QUAD_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 vUv;
void main(){
  // y is flipped so uv matches the 2D canvas the text was rastered on.
  vUv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

export class GL {
  constructor(readonly gl: WebGL2RenderingContext) {}

  private unit = 0;

  shader(type: number, src: string): WebGLShader {
    const { gl } = this;
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

  /** Links a program and caches every active uniform location on it. */
  program(vs: string, fs: string): Program {
    const { gl } = this;
    const p = gl.createProgram() as Program | null;
    if (!p) throw new Error("Failed to create program.");
    const v = this.shader(gl.VERTEX_SHADER, vs);
    const f = this.shader(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(p) ?? "Program failed to link.";
      gl.deleteProgram(p);
      throw new Error(log);
    }
    p.u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      if (info) p.u[info.name.replace("[0]", "")] = gl.getUniformLocation(p, info.name);
    }
    return p;
  }

  /** Binds a program and resets the texture-unit counter for `tex`. */
  use(p: Program): Program {
    this.gl.useProgram(p);
    this.unit = 0;
    return p;
  }

  u1(p: Program, n: string, a: number) {
    const l = p.u[n];
    if (l) this.gl.uniform1f(l, a);
  }
  u2(p: Program, n: string, a: number, b: number) {
    const l = p.u[n];
    if (l) this.gl.uniform2f(l, a, b);
  }
  u3(p: Program, n: string, a: number, b: number, c: number) {
    const l = p.u[n];
    if (l) this.gl.uniform3f(l, a, b, c);
  }

  /** Binds a texture to the next free unit. Order matches call order. */
  tex(p: Program, n: string, t: WebGLTexture | null) {
    const l = p.u[n];
    if (!l || !t) return;
    const unit = this.unit++;
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, t);
    this.gl.uniform1i(l, unit);
  }

  makeTex(
    w: number,
    h: number,
    internal: number,
    format: number,
    type: number,
    filter: number,
    data: ArrayBufferView | null = null,
  ): WebGLTexture {
    const { gl } = this;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  makeFBO(
    w: number,
    h: number,
    internal: number,
    format: number,
    type: number,
    filter: number,
    depth = false,
  ): FBO {
    const { gl } = this;
    const tex = this.makeTex(w, h, internal, format, type, filter);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    let rb: WebGLRenderbuffer | null = null;
    if (depth) {
      rb = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fb, rb, w, h, tx: 1 / w, ty: 1 / h };
  }

  makeDouble(
    w: number,
    h: number,
    internal: number,
    format: number,
    type: number,
    filter: number,
  ): DoubleFBO {
    let a = this.makeFBO(w, h, internal, format, type, filter);
    let b = this.makeFBO(w, h, internal, format, type, filter);
    return {
      get read() {
        return a;
      },
      get write() {
        return b;
      },
      swap() {
        const t = a;
        a = b;
        b = t;
      },
    };
  }

  killFBO(f: FBO | null | undefined) {
    if (!f) return;
    this.gl.deleteTexture(f.tex);
    this.gl.deleteFramebuffer(f.fb);
    if (f.rb) this.gl.deleteRenderbuffer(f.rb);
  }
}

/* ---- base surface ------------------------------------------------------- */

export abstract class TextSurface {
  readonly canvas: HTMLCanvasElement;
  /** False when WebGL2 is unavailable — callers keep their text visible. */
  readonly supported: boolean = false;

  protected gl!: WebGL2RenderingContext;
  protected g!: GL;
  protected quadVAO: WebGLVertexArrayObject | null = null;

  protected texText: WebGLTexture | null = null;
  protected inkBox: InkBox = { x0: 0, y0: 0, x1: 1, y1: 1 };

  protected cssW = 2;
  protected cssH = 2;
  protected dpr = 1;
  protected clock = 0;
  protected reduced = false;

  /** Pointer in canvas-local CSS pixels. */
  protected M = { x: -9999, y: -9999, lx: -9999, ly: -9999, speed: 0, active: 0 };
  protected impulse = 0;

  protected opts: Required<Omit<TextSurfaceOptions, "onError">> & {
    onError?: (m: string) => void;
  };

  private raster = document.createElement("canvas");
  private rctx: CanvasRenderingContext2D | null;
  private rafId = 0;
  private playing = false;
  private visible = true;
  protected disposed = false;
  private last = 0;
  private ro?: ResizeObserver;
  private io?: IntersectionObserver;
  private detachPointer?: () => void;
  private rebuildTimer = 0;
  private builtW = 0;
  private builtH = 0;

  constructor(canvas: HTMLCanvasElement, options: TextSurfaceOptions) {
    this.canvas = canvas;
    this.rctx = this.raster.getContext("2d", { willReadFrequently: true });

    this.opts = {
      text: options.text,
      fontFamily:
        options.fontFamily ??
        'ui-sans-serif, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontWeight: options.fontWeight ?? 900,
      fill: options.fill ?? 0.86,
      align: options.align ?? "center",
      maxDpr: options.maxDpr ?? 2,
      pauseWhenHidden: options.pauseWhenHidden ?? true,
      respectReducedMotion: options.respectReducedMotion ?? true,
      onError: options.onError,
    };

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      depth: true,
      premultipliedAlpha: false,
    });

    if (!gl) {
      this.opts.onError?.("WebGL2 is not available in this browser.");
      return;
    }

    this.gl = gl;
    this.g = new GL(gl);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    this.supported = true;

    this.reduced =
      this.opts.respectReducedMotion &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

    // Fullscreen triangle — cheaper than a quad and avoids the diagonal seam.
    this.quadVAO = gl.createVertexArray();
    gl.bindVertexArray(this.quadVAO);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  /**
   * Second-stage init. Subclasses compile their programs in `setup()`, which
   * cannot run from this base constructor because the subclass's own fields
   * are not initialised until after `super()` returns.
   */
  protected init(): void {
    if (!this.supported) return;
    try {
      this.resize();
      this.rasterize();
      this.setup();
      this.rebuild();
    } catch (err) {
      (this as { supported: boolean }).supported = false;
      this.opts.onError?.(err instanceof Error ? err.message : String(err));
      return;
    }

    this.observeResize();
    if (this.opts.pauseWhenHidden) this.observeVisibility();
    this.attachPointer();

    // Webfonts change the glyph outlines. Only re-raster if they were still
    // loading, so the common case does the work once.
    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(() => {
        if (this.disposed) return;
        this.rasterize();
        this.rebuild();
      });
    }

    this.play();
  }

  /* ---- subclass contract ------------------------------------------------ */

  /** Compile programs and allocate anything that outlives a resize. */
  protected abstract setup(): void;
  /** Re-allocate everything that depends on canvas size or the text raster. */
  protected abstract rebuild(): void;
  /** Draw one frame. */
  protected abstract render(dt: number): void;
  /** Release subclass-owned GL objects. */
  protected abstract teardown(): void;

  /* ---- public API ------------------------------------------------------- */

  setText(text: string): void {
    if (text === this.opts.text) return;
    this.opts.text = text;
    this.rasterize();
    this.rebuild();
  }

  play(): void {
    if (this.playing || this.disposed || !this.supported) return;
    this.playing = true;
    this.last = performance.now();
    this.rafId = requestAnimationFrame(this.frame);
  }

  pause(): void {
    this.playing = false;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  dispose(): void {
    this.disposed = true;
    this.pause();
    clearTimeout(this.rebuildTimer);
    this.ro?.disconnect();
    this.io?.disconnect();
    this.detachPointer?.();
    if (!this.supported) return;
    this.teardown();
    if (this.texText) this.gl.deleteTexture(this.texText);
    if (this.quadVAO) this.gl.deleteVertexArray(this.quadVAO);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  /* ---- drawing helpers -------------------------------------------------- */

  protected target(f: FBO | null): void {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, f ? f.fb : null);
    gl.viewport(0, 0, f ? f.w : this.canvas.width, f ? f.h : this.canvas.height);
  }

  protected fill(): void {
    const { gl } = this;
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  /* ---- text raster ------------------------------------------------------ */

  /**
   * Draws the word to an offscreen canvas, uploads it, and records its ink
   * bounds so subclasses can concentrate work where the glyphs actually are.
   *
   * Sized to fit the box — height-driven, then shrunk to the `fill` width.
   * A fixed fraction of height leaves the word tiny in a short, wide
   * container, which is the shape a headline slot usually is.
   */
  protected rasterize(): void {
    const ctx = this.rctx;
    if (!ctx || !this.supported) return;

    const w = Math.max(2, Math.round(this.cssW));
    const h = Math.max(2, Math.round(this.cssH));
    this.raster.width = w;
    this.raster.height = h;
    ctx.clearRect(0, 0, w, h);

    const label = (this.opts.text || "").trim() || " ";
    const face = (px: number) =>
      `${this.opts.fontWeight} ${px}px ${this.opts.fontFamily}`;

    let size = Math.min(h * 0.78, 460);
    ctx.font = face(Math.round(size));
    const wide = ctx.measureText(label).width;
    if (wide > w * this.opts.fill) size *= (w * this.opts.fill) / wide;
    size = Math.max(12, Math.round(size));

    ctx.font = face(size);
    ctx.textAlign = this.opts.align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    const inset = (w * (1 - this.opts.fill)) / 2;
    const x =
      this.opts.align === "left" ? inset
      : this.opts.align === "right" ? w - inset
      : w / 2;
    ctx.fillText(label, x, h / 2);

    // Ink bounds, sampled on a stride — this only needs to be approximate.
    const px = ctx.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = 0, y1 = 0, count = 0;
    for (let yy = 0; yy < h; yy += 2) {
      for (let xx = 0; xx < w; xx += 2) {
        if (px[(yy * w + xx) * 4 + 3]! > 140) {
          count++;
          if (xx < x0) x0 = xx;
          if (xx > x1) x1 = xx;
          if (yy < y0) y0 = yy;
          if (yy > y1) y1 = yy;
        }
      }
    }
    this.inkBox = count
      ? { x0, y0, x1, y1 }
      : { x0: w * 0.2, y0: h * 0.4, x1: w * 0.8, y1: h * 0.6 };

    const { gl } = this;
    if (this.texText) gl.deleteTexture(this.texText);
    this.texText = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texText);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.raster);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  /* ---- environment ------------------------------------------------------ */

  private resize(): void {
    this.dpr = Math.min(this.opts.maxDpr, window.devicePixelRatio || 1);
    this.cssW = Math.max(2, this.canvas.clientWidth);
    this.cssH = Math.max(2, this.canvas.clientHeight);
    const w = Math.floor(this.cssW * this.dpr);
    const h = Math.floor(this.cssH * this.dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.builtW = this.cssW;
    this.builtH = this.cssH;
  }

  private observeResize(): void {
    this.ro = new ResizeObserver(() => {
      // ResizeObserver fires once on observe() at the size we just built at;
      // rebuilding there would throw away every buffer for nothing.
      const w = Math.max(2, this.canvas.clientWidth);
      const h = Math.max(2, this.canvas.clientHeight);
      if (w === this.builtW && h === this.builtH) return;
      clearTimeout(this.rebuildTimer);
      this.rebuildTimer = window.setTimeout(() => {
        if (this.disposed) return;
        this.resize();
        this.rasterize();
        this.rebuild();
      }, 200);
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
   * the canvas often sits behind content and never receives events itself.
   * Coordinates are canvas-local CSS pixels, which is the space the surfaces
   * reason in.
   */
  private attachPointer(): void {
    const local = (e: PointerEvent) => {
      const r = this.canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      return { x, y, inside: x >= 0 && x <= r.width && y >= 0 && y <= r.height };
    };

    const onMove = (e: PointerEvent) => {
      const { x, y, inside } = local(e);
      // Seed the previous sample on entry, so the first frame is not read as
      // one enormous jump.
      if (!this.M.active) {
        this.M.lx = x;
        this.M.ly = y;
      }
      this.M.x = x;
      this.M.y = y;
      this.M.active = inside ? 1 : 0;
      if (!inside) this.M.speed = 0;
    };

    const onDown = (e: PointerEvent) => {
      const { x, y, inside } = local(e);
      if (!inside) return;
      this.M.x = x;
      this.M.y = y;
      this.M.active = 1;
      this.impulse = 900;
    };

    const onLeave = () => {
      this.M.active = 0;
      this.M.speed = 0;
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

  private frame = (now: number): void => {
    if (!this.playing || this.disposed) return;
    // Clamped: a backgrounded tab hands back a huge delta and every
    // integrator downstream would explode on it.
    const dt = Math.min((now - this.last) / 1000, 1 / 30);
    this.last = now;

    if (this.visible) {
      this.clock += dt;
      const inst = dt > 0
        ? Math.hypot(this.M.x - this.M.lx, this.M.y - this.M.ly) / dt
        : 0;
      this.M.speed += (inst - this.M.speed) * Math.min(1, dt * 12);
      try {
        this.render(dt);
      } catch (err) {
        this.pause();
        this.opts.onError?.(err instanceof Error ? err.message : String(err));
        return;
      }
      this.M.lx = this.M.x;
      this.M.ly = this.M.y;
      this.impulse = 0;
    }

    this.rafId = requestAnimationFrame(this.frame);
  };
}
