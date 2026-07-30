import {
  applyUniform,
  buildFragmentSource,
  linkProgram,
  preludeLineCount,
  rebaseErrorLines,
} from "./compile";
import { MAX_RIPPLES, VERTEX_SRC } from "./glsl";
import type { ShaderDef } from "./types";

export interface RendererOptions {
  /** Cap the device-pixel-ratio to keep large/hi-dpi canvases cheap. */
  maxDpr?: number;
  /** Pause the animation while the canvas is scrolled out of view. */
  pauseWhenHidden?: boolean;
  /** Render a single static frame when the user prefers reduced motion. */
  respectReducedMotion?: boolean;
  /** Start playing immediately. Defaults to true. */
  autoplay?: boolean;
  /** Called roughly once per second with a smoothed FPS estimate. */
  onFps?: (fps: number) => void;
  /** Called with a human-readable message when compilation fails. */
  onError?: (message: string | null) => void;
  /**
   * Keep the drawing buffer after compositing. Required to read the canvas
   * back with `toDataURL`/`readPixels` — without it both return blank. Costs
   * memory and a little speed, so only enable it when capturing frames.
   */
  preserveDrawingBuffer?: boolean;
}

export interface CompileResult {
  ok: boolean;
  /** Error text with line numbers rebased to the editable body, or null. */
  error: string | null;
}

type Value = number | number[];

/**
 * Renders a single fragment-shader background onto a canvas.
 *
 * The shader body is concatenated with a prelude (built-in uniforms, custom
 * uniform declarations and the shared helper library). Custom uniform values
 * live in a mutable map so the editor can tweak them live without recompiling.
 */
export class ShaderBackground {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer;

  private shader!: ShaderDef;
  private body = "";
  private uniformValues: Record<string, Value> = {};
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  private builtins: Record<string, WebGLUniformLocation | null> = {};
  private preludeLineCount = 0;

  private opts: Required<Omit<RendererOptions, "onFps" | "onError">> &
    Pick<RendererOptions, "onFps" | "onError">;

  private playing = false;
  private time = 0;
  private lastTs = 0;
  private raf = 0;

  // Pointer state. Positions are 0..1 across the canvas with y pointing up.
  private mouse: [number, number] = [0.5, 0.5];
  private mouseSmooth: [number, number] = [0.5, 0.5];
  private mouseVel: [number, number] = [0, 0];
  private mouseDown = 0;
  private mouseDownTarget = 0;
  private mouseEnter = 0;
  private mouseEnterTarget = 0;
  /** Flat [x, y, age, strength] * MAX_RIPPLES, uploaded as a vec4 array. */
  private ripples = new Float32Array(MAX_RIPPLES * 4);
  private rippleCursor = 0;
  private detachPointer?: () => void;

  private fpsAccum = 0;
  private fpsFrames = 0;

  private ro?: ResizeObserver;
  private io?: IntersectionObserver;
  private visible = true;
  private disposed = false;

  constructor(
    canvas: HTMLCanvasElement,
    shader: ShaderDef,
    options: RendererOptions = {},
  ) {
    this.canvas = canvas;
    this.opts = {
      maxDpr: options.maxDpr ?? 2,
      pauseWhenHidden: options.pauseWhenHidden ?? true,
      respectReducedMotion: options.respectReducedMotion ?? false,
      autoplay: options.autoplay ?? true,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
      onFps: options.onFps,
      onError: options.onError,
    };

    const gl = canvas.getContext("webgl", {
      antialias: false,
      premultipliedAlpha: false,
      alpha: true,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
    });
    if (!gl) throw new Error("WebGL is not available in this browser.");
    this.gl = gl;

    // Needed for fwidth/dFdx in the grid and contour shaders. Universally
    // available in practice; shaders that skip derivatives are unaffected.
    gl.getExtension("OES_standard_derivatives");

    // Fullscreen quad as a triangle strip.
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Failed to allocate vertex buffer.");
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    // Ripple slots start retired (negative age).
    for (let i = 0; i < MAX_RIPPLES; i++) this.ripples[i * 4 + 2] = -1;

    this.observeResize();
    if (this.opts.pauseWhenHidden) this.observeVisibility();
    this.attachPointer();

    this.load(shader);

    const reduce =
      this.opts.respectReducedMotion &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (this.opts.autoplay && !reduce) this.play();
    else this.renderFrame();
  }

  // ---- public API ---------------------------------------------------------

  /** Replace the shader entirely, resetting uniforms to the shader defaults. */
  load(shader: ShaderDef): CompileResult {
    this.shader = shader;
    this.body = shader.fragment;
    this.uniformValues = {};
    for (const [name, def] of Object.entries(shader.uniforms)) {
      this.uniformValues[name] = cloneValue(def.value);
    }
    return this.compile();
  }

  /** Recompile with a new body (editor live edit), keeping uniform values. */
  setFragment(body: string): CompileResult {
    this.body = body;
    return this.compile();
  }

  /** Update one custom uniform value; re-renders immediately when paused. */
  setUniform(name: string, value: Value): void {
    if (!(name in this.uniformValues)) return;
    this.uniformValues[name] = cloneValue(value);
    if (!this.playing) this.renderFrame();
  }

  getUniform(name: string): Value | undefined {
    const v = this.uniformValues[name];
    return v === undefined ? undefined : cloneValue(v);
  }

  /** Reset every uniform to the shader's declared defaults. */
  resetUniforms(): void {
    for (const [name, def] of Object.entries(this.shader.uniforms)) {
      this.uniformValues[name] = cloneValue(def.value);
    }
    if (!this.playing) this.renderFrame();
  }

  play(): void {
    if (this.playing || this.disposed) return;
    this.playing = true;
    this.lastTs = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  pause(): void {
    this.playing = false;
    cancelAnimationFrame(this.raf);
  }

  toggle(): boolean {
    if (this.playing) this.pause();
    else this.play();
    return this.playing;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  /** Restart the animation clock from zero. */
  restart(): void {
    this.time = 0;
    if (!this.playing) this.renderFrame();
  }

  /**
   * Jump the animation clock to `seconds` and draw that frame immediately.
   * Used for capturing posters at a point where the shader has developed.
   */
  seek(seconds: number): void {
    this.time = seconds;
    this.renderFrame();
  }

  /** The full fragment source that is handed to the GPU (for export/copy). */
  getFragmentSource(body = this.body): string {
    return this.buildSource(body);
  }

  get currentShader(): ShaderDef {
    return this.shader;
  }

  dispose(): void {
    this.disposed = true;
    this.pause();
    this.ro?.disconnect();
    this.io?.disconnect();
    this.detachPointer?.();
    const gl = this.gl;
    if (this.program) gl.deleteProgram(this.program);
    gl.deleteBuffer(this.buffer);
    const ext = gl.getExtension("WEBGL_lose_context");
    ext?.loseContext();
  }

  // ---- compilation --------------------------------------------------------

  private buildSource(body: string): string {
    return buildFragmentSource(this.shader.uniforms, body);
  }

  private compile(): CompileResult {
    const gl = this.gl;
    const source = this.buildSource(this.body);

    // Count prelude lines so error line numbers map back onto the body.
    this.preludeLineCount = preludeLineCount(this.shader.uniforms);

    const result = linkProgram(gl, VERTEX_SRC, source);
    if (typeof result === "string") {
      return this.fail(rebaseErrorLines(result, this.preludeLineCount));
    }
    const program = result;

    // Swap in the new program and refresh uniform locations.
    if (this.program) gl.deleteProgram(this.program);
    this.program = program;
    gl.useProgram(program);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this.builtins = {
      u_time: gl.getUniformLocation(program, "u_time"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_mouse: gl.getUniformLocation(program, "u_mouse"),
      u_mouseSmooth: gl.getUniformLocation(program, "u_mouseSmooth"),
      u_mouseVel: gl.getUniformLocation(program, "u_mouseVel"),
      u_mouseDown: gl.getUniformLocation(program, "u_mouseDown"),
      u_mouseEnter: gl.getUniformLocation(program, "u_mouseEnter"),
      u_ripples: gl.getUniformLocation(program, "u_ripples[0]"),
    };
    this.uniformLocations = {};
    for (const name of Object.keys(this.shader.uniforms)) {
      this.uniformLocations[name] = gl.getUniformLocation(program, name);
    }

    this.opts.onError?.(null);
    if (!this.playing) this.renderFrame();
    return { ok: true, error: null };
  }

  private fail(error: string): CompileResult {
    this.opts.onError?.(error);
    return { ok: false, error };
  }

  // ---- rendering ----------------------------------------------------------

  private tick = (ts: number): void => {
    if (!this.playing) return;
    const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
    this.lastTs = ts;
    if (this.visible) {
      this.time += dt;
      this.updatePointer(dt);
      this.renderFrame();
      this.trackFps(dt);
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private renderFrame(): void {
    const gl = this.gl;
    if (!this.program || this.disposed) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w === 0 || h === 0) return;

    gl.viewport(0, 0, w, h);
    gl.useProgram(this.program);

    const b = this.builtins;
    if (b.u_time) gl.uniform1f(b.u_time, this.time);
    if (b.u_resolution) gl.uniform2f(b.u_resolution, w, h);
    if (b.u_mouse) gl.uniform2f(b.u_mouse, this.mouse[0], this.mouse[1]);
    if (b.u_mouseSmooth)
      gl.uniform2f(b.u_mouseSmooth, this.mouseSmooth[0], this.mouseSmooth[1]);
    if (b.u_mouseVel)
      gl.uniform2f(b.u_mouseVel, this.mouseVel[0], this.mouseVel[1]);
    if (b.u_mouseDown) gl.uniform1f(b.u_mouseDown, this.mouseDown);
    if (b.u_mouseEnter) gl.uniform1f(b.u_mouseEnter, this.mouseEnter);
    if (b.u_ripples) gl.uniform4fv(b.u_ripples, this.ripples);

    for (const [name, def] of Object.entries(this.shader.uniforms)) {
      const loc = this.uniformLocations[name];
      if (!loc) continue;
      applyUniform(gl, loc, def, this.uniformValues[name]);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private trackFps(dt: number): void {
    if (!this.opts.onFps) return;
    this.fpsAccum += dt;
    this.fpsFrames++;
    if (this.fpsAccum >= 0.5) {
      this.opts.onFps(this.fpsFrames / this.fpsAccum);
      this.fpsAccum = 0;
      this.fpsFrames = 0;
    }
  }

  // ---- environment wiring -------------------------------------------------

  private resize(): void {
    const dpr = Math.min(this.opts.maxDpr, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      if (!this.playing) this.renderFrame();
    }
  }

  private observeResize(): void {
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.canvas);
    this.resize();
  }

  private observeVisibility(): void {
    this.io = new IntersectionObserver(
      (entries) => {
        this.visible = entries[0]?.isIntersecting ?? true;
        if (this.visible && this.playing) this.lastTs = performance.now();
      },
      { threshold: 0 },
    );
    this.io.observe(this.canvas);
  }

  /**
   * Pointer events are bound to the window rather than the canvas: as a page
   * background the canvas usually sits behind other content and would never
   * receive them itself.
   */
  private attachPointer(): void {
    const toLocal = (e: PointerEvent): [number, number] => {
      const r = this.canvas.getBoundingClientRect();
      return [
        (e.clientX - r.left) / Math.max(1, r.width),
        1 - (e.clientY - r.top) / Math.max(1, r.height),
      ];
    };
    const inside = (p: [number, number]) =>
      p[0] >= 0 && p[0] <= 1 && p[1] >= 0 && p[1] <= 1;

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      this.mouse = p;
      this.mouseEnterTarget = inside(p) ? 1 : 0;
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      if (!inside(p)) return;
      this.mouse = p;
      this.mouseDownTarget = 1;
      this.spawnRipple(p[0], p[1], 1);
    };
    const onUp = () => {
      this.mouseDownTarget = 0;
    };
    const onLeave = () => {
      this.mouseEnterTarget = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    this.detachPointer = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }

  /** Emit a click ripple at (x, y) in 0..1 canvas space, y-up. */
  spawnRipple(x: number, y: number, strength = 1): void {
    const i = this.rippleCursor * 4;
    this.ripples[i] = x;
    this.ripples[i + 1] = y;
    this.ripples[i + 2] = 0; // age
    this.ripples[i + 3] = strength;
    this.rippleCursor = (this.rippleCursor + 1) % MAX_RIPPLES;
  }

  /** Advance pointer smoothing, velocity and ripple ages by `dt` seconds. */
  private updatePointer(dt: number): void {
    // Exponential smoothing that stays frame-rate independent.
    const ease = 1 - Math.exp(-dt * 8);
    const prev: [number, number] = [this.mouseSmooth[0], this.mouseSmooth[1]];
    this.mouseSmooth = [
      this.mouseSmooth[0] + (this.mouse[0] - this.mouseSmooth[0]) * ease,
      this.mouseSmooth[1] + (this.mouse[1] - this.mouseSmooth[1]) * ease,
    ];
    if (dt > 0) {
      // Blend velocity so it decays smoothly when the pointer stops.
      const vx = (this.mouseSmooth[0] - prev[0]) / dt;
      const vy = (this.mouseSmooth[1] - prev[1]) / dt;
      const k = 1 - Math.exp(-dt * 6);
      this.mouseVel = [
        this.mouseVel[0] + (vx - this.mouseVel[0]) * k,
        this.mouseVel[1] + (vy - this.mouseVel[1]) * k,
      ];
    }

    const press = 1 - Math.exp(-dt * 12);
    this.mouseDown += (this.mouseDownTarget - this.mouseDown) * press;
    const enter = 1 - Math.exp(-dt * 4);
    this.mouseEnter += (this.mouseEnterTarget - this.mouseEnter) * enter;

    // Age ripples; retire them once they've faded out.
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const age = this.ripples[i * 4 + 2];
      if (age < 0) continue;
      const next = age + dt;
      this.ripples[i * 4 + 2] = next > 6 ? -1 : next;
    }
  }
}

// ---- module helpers -------------------------------------------------------

function cloneValue(v: Value): Value {
  return Array.isArray(v) ? (v.slice() as number[]) : v;
}
