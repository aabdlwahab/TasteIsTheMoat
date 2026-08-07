import { QUAD_VS, TextSurface } from "../textSurface";
import type { DoubleFBO, FBO, Program, TextSurfaceOptions } from "../textSurface";

/* A textbook semi-Lagrangian solver: advect, add forces, then project the
   velocity field to be divergence-free with a Jacobi pressure solve. */

const ADVECT_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_src;
uniform sampler2D u_vel;
uniform vec2  u_texel;
uniform float u_dt;
uniform float u_diss;
out vec4 o;
void main(){
  // Trace backwards along the velocity field and sample where this parcel
  // came from — unconditionally stable, unlike stepping forwards.
  vec2 c = vUv - u_dt * texture(u_vel, vUv).xy * u_texel;
  o = texture(u_src, c) * u_diss;
}`;

const SPLAT_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_target;
uniform vec2  u_point;
uniform vec3  u_color;
uniform float u_radius;
uniform vec2  u_aspect;
out vec4 o;
void main(){
  vec2 p = (vUv - u_point) * u_aspect;
  vec3 s = exp(-dot(p, p) / u_radius) * u_color;
  o = vec4(texture(u_target, vUv).xyz + s, 1.0);
}`;

const INK_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_target;
uniform sampler2D u_text;
uniform float u_rate;
uniform vec3  u_ink;
out vec4 o;
void main(){
  // The word is a continuous dye source, so it keeps bleeding back in after
  // being stirred away rather than being destroyed once.
  float a = texture(u_text, vUv).a;
  o = vec4(texture(u_target, vUv).xyz + u_ink * a * u_rate, 1.0);
}`;

const DIV_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_vel;
uniform vec2 u_texel;
out vec4 o;
void main(){
  float L = texture(u_vel, vUv - vec2(u_texel.x, 0.0)).x;
  float R = texture(u_vel, vUv + vec2(u_texel.x, 0.0)).x;
  float T = texture(u_vel, vUv + vec2(0.0, u_texel.y)).y;
  float B = texture(u_vel, vUv - vec2(0.0, u_texel.y)).y;
  o = vec4(0.5 * ((R - L) + (T - B)), 0.0, 0.0, 1.0);
}`;

const PRESSURE_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_pressure;
uniform sampler2D u_div;
uniform vec2 u_texel;
out vec4 o;
void main(){
  float L = texture(u_pressure, vUv - vec2(u_texel.x, 0.0)).x;
  float R = texture(u_pressure, vUv + vec2(u_texel.x, 0.0)).x;
  float T = texture(u_pressure, vUv + vec2(0.0, u_texel.y)).x;
  float B = texture(u_pressure, vUv - vec2(0.0, u_texel.y)).x;
  float dv = texture(u_div, vUv).x;
  o = vec4((L + R + T + B - dv) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRAD_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_pressure;
uniform sampler2D u_vel;
uniform vec2 u_texel;
out vec4 o;
void main(){
  float L = texture(u_pressure, vUv - vec2(u_texel.x, 0.0)).x;
  float R = texture(u_pressure, vUv + vec2(u_texel.x, 0.0)).x;
  float T = texture(u_pressure, vUv + vec2(0.0, u_texel.y)).x;
  float B = texture(u_pressure, vUv - vec2(0.0, u_texel.y)).x;
  vec2 v = texture(u_vel, vUv).xy - vec2(R - L, T - B) * 0.5;
  o = vec4(v, 0.0, 1.0);
}`;

const SHOW_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_dye;
uniform vec3 u_cool;
uniform vec3 u_mid;
uniform vec3 u_hot;
out vec4 o;
void main(){
  // The dye is written by fragment position, whose rows run bottom-up in a
  // framebuffer, but vUv is y-down to match the text raster. Every interior
  // pass reads and writes in that same skewed space so they agree with each
  // other; only this final present has to undo it, or the word comes out
  // mirrored top-to-bottom.
  vec3  c = texture(u_dye, vec2(vUv.x, 1.0 - vUv.y)).rgb;
  float l = clamp(length(c), 0.0, 2.0);
  vec3 col = mix(u_cool, u_mid, smoothstep(0.2, 1.1, l));
  col = mix(col, u_hot, smoothstep(1.0, 1.9, l));
  o = vec4(col * smoothstep(0.02, 0.55, l), 1.0);
}`;

export interface FluidSurfaceOptions extends TextSurfaceOptions {
  /** Simulation grid width. Height follows the aspect ratio. */
  grid?: number;
  /** Splat radius in CSS pixels. */
  radius?: number;
  /** Stir strength, 0–300 (100 is neutral). */
  stir?: number;
  /** How fast the word re-inks, 0–300 (100 is neutral). */
  ink?: number;
  /** Dye dissipation. Higher clears faster. */
  fade?: number;
  /** Jacobi iterations. More is stiffer and costlier. */
  iterations?: number;
  cool?: [number, number, number];
  mid?: [number, number, number];
  hot?: [number, number, number];
  inkColor?: [number, number, number];
}

/**
 * The word as dye in a fluid simulation.
 *
 * Needs float render targets; without them the surface reports unsupported
 * rather than rendering black, so the caller's real text stays visible.
 */
export class FluidSurface extends TextSurface {
  private pAdvect!: Program;
  private pSplat!: Program;
  private pInk!: Program;
  private pDiv!: Program;
  private pPress!: Program;
  private pGrad!: Program;
  private pShow!: Program;

  private vel: DoubleFBO | null = null;
  private dye: DoubleFBO | null = null;
  private pres: DoubleFBO | null = null;
  private div: FBO | null = null;
  private fw = 0;
  private fh = 0;

  private params: Required<
    Pick<FluidSurfaceOptions,
      "grid" | "radius" | "stir" | "ink" | "fade" | "iterations" | "cool" | "mid" | "hot" | "inkColor">
  >;

  constructor(canvas: HTMLCanvasElement, options: FluidSurfaceOptions) {
    super(canvas, options);
    this.params = {
      grid: options.grid ?? 512,
      radius: options.radius ?? 150,
      stir: options.stir ?? 100,
      ink: options.ink ?? 100,
      fade: options.fade ?? 18,
      iterations: options.iterations ?? 20,
      cool: options.cool ?? [0.16, 0.30, 0.78],
      mid: options.mid ?? [0.72, 0.84, 1.0],
      hot: options.hot ?? [1.0, 0.72, 0.45],
      inkColor: options.inkColor ?? [0.30, 0.52, 1.0],
    };
    this.init();
  }

  get gridSize(): { w: number; h: number } {
    return { w: this.fw, h: this.fh };
  }

  setParams(next: Partial<FluidSurfaceOptions>): void {
    const needsRebuild = next.grid !== undefined && next.grid !== this.params.grid;
    Object.assign(this.params, next);
    if (needsRebuild) this.rebuild();
  }

  protected setup(): void {
    const { gl } = this;
    const hasFloat =
      gl.getExtension("EXT_color_buffer_float") ??
      gl.getExtension("EXT_color_buffer_half_float");
    if (!hasFloat) throw new Error("Float render targets are unavailable.");

    this.pAdvect = this.g.program(QUAD_VS, ADVECT_FS);
    this.pSplat = this.g.program(QUAD_VS, SPLAT_FS);
    this.pInk = this.g.program(QUAD_VS, INK_FS);
    this.pDiv = this.g.program(QUAD_VS, DIV_FS);
    this.pPress = this.g.program(QUAD_VS, PRESSURE_FS);
    this.pGrad = this.g.program(QUAD_VS, GRAD_FS);
    this.pShow = this.g.program(QUAD_VS, SHOW_FS);
  }

  private killAll(): void {
    const { g } = this;
    for (const d of [this.vel, this.dye, this.pres]) {
      if (d) {
        g.killFBO(d.read);
        g.killFBO(d.write);
      }
    }
    g.killFBO(this.div);
    this.vel = this.dye = this.pres = null;
    this.div = null;
  }

  protected rebuild(): void {
    const { gl, g } = this;
    this.killAll();

    this.fw = Math.round(this.params.grid);
    this.fh = Math.max(64, Math.round((this.fw * this.cssH) / this.cssW));

    this.vel = g.makeDouble(this.fw, this.fh, gl.RG16F, gl.RG, gl.HALF_FLOAT, gl.LINEAR);
    this.dye = g.makeDouble(this.fw, this.fh, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR);
    this.pres = g.makeDouble(this.fw, this.fh, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST);
    this.div = g.makeFBO(this.fw, this.fh, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST);

    for (const f of [
      this.vel.read, this.vel.write, this.dye.read, this.dye.write,
      this.pres.read, this.pres.write,
    ]) {
      this.target(f);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.target(null);
  }

  protected render(dt: number): void {
    const { gl, g, M, params } = this;
    if (!this.vel || !this.dye || !this.pres || !this.div) return;

    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    const tx = 1 / this.fw, ty = 1 / this.fh, ax = this.fw / this.fh;

    // Pointer drag becomes a velocity splat.
    const dx = M.x - M.lx, dy = M.y - M.ly;
    if (!this.reduced && M.active && (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1)) {
      const gain = (params.stir / 100) * 24;
      const s = g.use(this.pSplat);
      this.target(this.vel.write);
      g.tex(s, "u_target", this.vel.read.tex);
      g.u2(s, "u_point", M.x / this.cssW, M.y / this.cssH);
      g.u3(s, "u_color", (dx / this.cssW) * this.fw * gain, (dy / this.cssH) * this.fh * gain, 0);
      g.u1(s, "u_radius", 0.00022 * (params.radius / 150));
      g.u2(s, "u_aspect", ax, 1);
      this.fill();
      this.vel.swap();
    }

    // A click drops warm dye.
    if (this.impulse > 0) {
      const s = g.use(this.pSplat);
      this.target(this.dye.write);
      g.tex(s, "u_target", this.dye.read.tex);
      g.u2(s, "u_point", M.x / this.cssW, M.y / this.cssH);
      g.u3(s, "u_color", 0.9, 0.55, 0.25);
      g.u1(s, "u_radius", 0.0009);
      g.u2(s, "u_aspect", ax, 1);
      this.fill();
      this.dye.swap();
    }

    let a = g.use(this.pAdvect);
    this.target(this.vel.write);
    g.tex(a, "u_src", this.vel.read.tex);
    g.tex(a, "u_vel", this.vel.read.tex);
    g.u2(a, "u_texel", tx, ty);
    g.u1(a, "u_dt", dt);
    g.u1(a, "u_diss", Math.pow(0.996, dt * 60));
    this.fill();
    this.vel.swap();

    a = g.use(this.pAdvect);
    this.target(this.dye.write);
    g.tex(a, "u_src", this.dye.read.tex);
    g.tex(a, "u_vel", this.vel.read.tex);
    g.u2(a, "u_texel", tx, ty);
    g.u1(a, "u_dt", dt);
    g.u1(a, "u_diss", Math.pow(1 - params.fade / 1000, dt * 60));
    this.fill();
    this.dye.swap();

    const ip = g.use(this.pInk);
    this.target(this.dye.write);
    g.tex(ip, "u_target", this.dye.read.tex);
    g.tex(ip, "u_text", this.texText);
    g.u1(ip, "u_rate", (params.ink / 100) * 1.9 * dt);
    g.u3(ip, "u_ink", params.inkColor[0], params.inkColor[1], params.inkColor[2]);
    this.fill();
    this.dye.swap();

    const dv = g.use(this.pDiv);
    this.target(this.div);
    g.tex(dv, "u_vel", this.vel.read.tex);
    g.u2(dv, "u_texel", tx, ty);
    this.fill();

    const iters = Math.round(params.iterations);
    for (let i = 0; i < iters; i++) {
      const pp = g.use(this.pPress);
      this.target(this.pres.write);
      g.tex(pp, "u_pressure", this.pres.read.tex);
      g.tex(pp, "u_div", this.div.tex);
      g.u2(pp, "u_texel", tx, ty);
      this.fill();
      this.pres.swap();
    }

    const gr = g.use(this.pGrad);
    this.target(this.vel.write);
    g.tex(gr, "u_pressure", this.pres.read.tex);
    g.tex(gr, "u_vel", this.vel.read.tex);
    g.u2(gr, "u_texel", tx, ty);
    this.fill();
    this.vel.swap();

    this.target(null);
    const sh = g.use(this.pShow);
    g.tex(sh, "u_dye", this.dye.read.tex);
    g.u3(sh, "u_cool", params.cool[0], params.cool[1], params.cool[2]);
    g.u3(sh, "u_mid", params.mid[0], params.mid[1], params.mid[2]);
    g.u3(sh, "u_hot", params.hot[0], params.hot[1], params.hot[2]);
    this.fill();
  }

  protected teardown(): void {
    const { gl } = this;
    this.killAll();
    for (const p of [
      this.pAdvect, this.pSplat, this.pInk, this.pDiv, this.pPress, this.pGrad, this.pShow,
    ]) {
      if (p) gl.deleteProgram(p);
    }
  }
}
