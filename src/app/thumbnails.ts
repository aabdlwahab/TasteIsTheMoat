/**
 * Shared-context gallery thumbnails.
 *
 * Browsers cap how many live WebGL contexts a page may hold (commonly ~16) and
 * silently drop the oldest once you go over. One context per gallery card
 * therefore stops working as soon as the library grows past a dozen shaders.
 *
 * Instead we keep a single offscreen WebGL canvas, cache one compiled program
 * per shader, render each visible card into it in turn, and blit the result to
 * that card's plain 2D canvas. Cost scales with what is on screen, not with how
 * many shaders exist.
 */
import { applyUniform, buildFragmentSource, linkProgram } from "../core/compile";
import { VERTEX_SRC } from "../core/glsl";
import type { ShaderDef } from "../core/types";

interface Entry {
  def: ShaderDef;
  target: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  visible: boolean;
}

interface Cached {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  time: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  mouse: WebGLUniformLocation | null;
  mouseSmooth: WebGLUniformLocation | null;
  mouseVel: WebGLUniformLocation | null;
  mouseEnter: WebGLUniformLocation | null;
}

export class ThumbnailPool {
  private gl: WebGLRenderingContext;
  private surface: HTMLCanvasElement;
  private programs = new Map<string, Cached | null>();
  private entries: Entry[] = [];
  private io: IntersectionObserver;
  private raf = 0;
  private start = performance.now();

  constructor(width = 320, height = 180) {
    this.surface = document.createElement("canvas");
    this.surface.width = width;
    this.surface.height = height;

    const gl = this.surface.getContext("webgl", {
      antialias: false,
      alpha: false,
      // Required: we read the surface via drawImage after each draw call, and
      // without this the buffer may already be cleared by then.
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error("WebGL unavailable for gallery thumbnails.");
    this.gl = gl;
    gl.getExtension("OES_standard_derivatives");

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    this.io = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          const entry = this.entries.find((e) => e.target === r.target);
          if (entry) entry.visible = r.isIntersecting;
        }
      },
      { rootMargin: "120px" },
    );

    this.raf = requestAnimationFrame(this.tick);
  }

  /** Register a card canvas to be driven by this pool. */
  add(target: HTMLCanvasElement, def: ShaderDef): void {
    const ctx = target.getContext("2d");
    if (!ctx) return;
    this.entries.push({ def, target, ctx, visible: false });
    this.io.observe(target);
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    for (const cached of this.programs.values()) {
      if (cached) this.gl.deleteProgram(cached.program);
    }
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  /** Compile once per shader and remember the result (null = failed). */
  private getProgram(def: ShaderDef): Cached | null {
    const hit = this.programs.get(def.id);
    if (hit !== undefined) return hit;

    const gl = this.gl;
    const src = buildFragmentSource(def.uniforms, def.fragment);
    const result = linkProgram(gl, VERTEX_SRC, src);
    if (typeof result === "string") {
      console.warn(`[Taste is the Moat] thumbnail compile failed: ${def.id}`, result);
      this.programs.set(def.id, null);
      return null;
    }

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    for (const name of Object.keys(def.uniforms)) {
      uniforms[name] = gl.getUniformLocation(result, name);
    }
    const cached: Cached = {
      program: result,
      uniforms,
      time: gl.getUniformLocation(result, "u_time"),
      resolution: gl.getUniformLocation(result, "u_resolution"),
      mouse: gl.getUniformLocation(result, "u_mouse"),
      mouseSmooth: gl.getUniformLocation(result, "u_mouseSmooth"),
      mouseVel: gl.getUniformLocation(result, "u_mouseVel"),
      mouseEnter: gl.getUniformLocation(result, "u_mouseEnter"),
    };
    this.programs.set(def.id, cached);
    return cached;
  }

  private tick = (): void => {
    const gl = this.gl;
    const w = this.surface.width;
    const h = this.surface.height;
    const t = (performance.now() - this.start) / 1000;

    gl.viewport(0, 0, w, h);

    for (const entry of this.entries) {
      if (!entry.visible) continue;
      const cached = this.getProgram(entry.def);
      if (!cached) continue;

      gl.useProgram(cached.program);
      const posLoc = gl.getAttribLocation(cached.program, "a_position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      if (cached.time) gl.uniform1f(cached.time, t);
      if (cached.resolution) gl.uniform2f(cached.resolution, w, h);

      // Thumbnails have no real pointer, so we drive a synthetic one on a slow
      // ellipse. Without this, cursor-driven shaders (Spotlight especially)
      // would sit in a dead resting state and preview as an empty rectangle.
      const a = t * 0.55;
      const mx = 0.5 + Math.cos(a) * 0.30;
      const my = 0.5 + Math.sin(a * 1.3) * 0.26;
      if (cached.mouse) gl.uniform2f(cached.mouse, mx, my);
      if (cached.mouseSmooth) gl.uniform2f(cached.mouseSmooth, mx, my);
      if (cached.mouseVel)
        gl.uniform2f(
          cached.mouseVel,
          -Math.sin(a) * 0.30 * 0.55,
          Math.cos(a * 1.3) * 0.26 * 0.55 * 1.3,
        );
      if (cached.mouseEnter) gl.uniform1f(cached.mouseEnter, 1);

      for (const [name, def] of Object.entries(entry.def.uniforms)) {
        const loc = cached.uniforms[name];
        if (loc) applyUniform(gl, loc, def, def.value);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Blit into the card's 2D canvas.
      const { ctx, target } = entry;
      if (target.width !== w || target.height !== h) {
        target.width = w;
        target.height = h;
      }
      ctx.drawImage(this.surface, 0, 0);
    }

    this.raf = requestAnimationFrame(this.tick);
  };
}
