import { QUAD_VS, TextSurface } from "../textSurface";
import type { FBO, Program, TextSurfaceOptions } from "../textSurface";

/**
 * Voronoi cells are rasterised, not computed per-pixel: each seed draws a cone
 * pointing at the camera and the depth test keeps the nearest one. The winning
 * fragment writes the seed's id, so one depth-tested pass produces the whole
 * diagram at any cell count.
 */
const CONE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 a_cone;   // xy = unit dir, z = 0 apex / 1 rim
uniform vec2  u_seed;
uniform vec2  u_res;
uniform float u_coneR;
void main(){
  vec2 p = u_seed + a_cone.xy * u_coneR;
  vec2 clip = (p / u_res) * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, a_cone.z * 0.998, 1.0);
}`;

const CONE_FS = `#version 300 es
precision highp float;
uniform float u_id;
out vec4 o;
void main(){
  // id packed across two channels, so more than 256 shards still resolve.
  o = vec4(mod(u_id, 256.0) / 255.0, floor(u_id / 256.0) / 255.0, 0.0, 1.0);
}`;

const SHATTER_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_cells;
uniform sampler2D u_seeds;    // RGBA32F  N x 1  (sx, sy, -, -)
uniform sampler2D u_xform;    // RGBA32F  N x 1  (dx, dy, angle, energy)
uniform sampler2D u_text;
uniform vec2  u_res;
uniform vec2  u_texel;
uniform float u_count;
uniform vec3  u_ink;
uniform vec3  u_hot;
out vec4 o;

float cellId(vec2 uv){
  vec2 e = texture(u_cells, uv).rg;
  return floor(e.r * 255.0 + 0.5) + floor(e.g * 255.0 + 0.5) * 256.0;
}

void main(){
  float id = cellId(vUv);
  vec2  st = vec2((id + 0.5) / u_count, 0.5);
  vec2  seed = texture(u_seeds, st).rg;
  vec4  xf   = texture(u_xform, st);

  // Undo the shard's rigid motion to find where this pixel came from in the
  // original word. Sampling the source that way means the glyph travels with
  // the shard instead of being smeared.
  vec2  px  = vUv * u_res;
  vec2  p   = px - seed - xf.xy;
  float c   = cos(-xf.z), s = sin(-xf.z);
  vec2  src = seed + mat2(c, -s, s, c) * p;

  float a = texture(u_text, src / u_res).a;

  // Crack lines wherever the neighbouring pixel belongs to another shard.
  float edge = 0.0;
  edge = max(edge, abs(cellId(vUv + vec2(u_texel.x, 0.0)) - id));
  edge = max(edge, abs(cellId(vUv + vec2(0.0, u_texel.y)) - id));
  edge = min(edge, 1.0);

  vec3 col = mix(u_ink, u_hot, clamp(xf.w, 0.0, 1.0)) * a;
  col *= 1.0 - edge * 0.85;
  col += vec3(0.35, 0.45, 0.75) * edge * a * 0.5;

  o = vec4(col, 1.0);
}`;

interface Shard {
  sx: number; sy: number;
  dx: number; dy: number;
  vx: number; vy: number;
  ang: number; va: number;
  e: number;
}

export interface ShatterSurfaceOptions extends TextSurfaceOptions {
  /** Number of Voronoi shards. */
  shards?: number;
  /** Pointer reach in CSS pixels. */
  radius?: number;
  force?: number;
  /** Rotational kick, 0–300 (100 is neutral). */
  spin?: number;
  /** Return spring. Higher snaps back faster. */
  spring?: number;
  ink?: [number, number, number];
  hot?: [number, number, number];
}

const SEG = 40;

/**
 * The word broken into Voronoi shards that scatter and spring back.
 *
 * Shard motion is integrated on the CPU — a few hundred rigid bodies is
 * nothing — and uploaded as a 1-pixel-tall RGBA32F texture the fragment shader
 * reads per cell.
 */
export class ShatterSurface extends TextSurface {
  private pCone!: Program;
  private pShatter!: Program;
  private coneVAO: WebGLVertexArrayObject | null = null;
  private cellFBO: FBO | null = null;
  private seedTex: WebGLTexture | null = null;
  private xformTex: WebGLTexture | null = null;
  private xformArr = new Float32Array(0);
  private shards: Shard[] = [];
  private count = 0;
  private params: Required<
    Pick<ShatterSurfaceOptions, "shards" | "radius" | "force" | "spin" | "spring" | "ink" | "hot">
  >;

  constructor(canvas: HTMLCanvasElement, options: ShatterSurfaceOptions) {
    super(canvas, options);
    this.params = {
      shards: options.shards ?? 120,
      radius: options.radius ?? 180,
      force: options.force ?? 2800,
      spin: options.spin ?? 100,
      spring: options.spring ?? 32,
      ink: options.ink ?? [0.58, 0.7, 1.0],
      hot: options.hot ?? [1.0, 0.64, 0.38],
    };
    this.init();
  }

  get shardCount(): number {
    return this.count;
  }

  setParams(next: Partial<ShatterSurfaceOptions>): void {
    const needsRebuild = next.shards !== undefined && next.shards !== this.params.shards;
    Object.assign(this.params, next);
    if (needsRebuild) this.rebuild();
  }

  protected setup(): void {
    const { gl } = this;
    this.pCone = this.g.program(CONE_VS, CONE_FS);
    this.pShatter = this.g.program(QUAD_VS, SHATTER_FS);

    // A unit cone as a triangle fan: apex at depth 0, rim at depth ~1.
    const v: number[] = [0, 0, 0];
    for (let i = 0; i <= SEG; i++) {
      const a = (i / SEG) * Math.PI * 2;
      v.push(Math.cos(a), Math.sin(a), 1);
    }
    this.coneVAO = gl.createVertexArray();
    gl.bindVertexArray(this.coneVAO);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  protected rebuild(): void {
    const { gl, g } = this;
    this.count = Math.max(4, Math.round(this.params.shards));

    g.killFBO(this.cellFBO);
    // Half resolution: the id buffer only needs to be precise enough to place
    // the cracks, and it is the most expensive surface here.
    this.cellFBO = g.makeFBO(
      Math.max(2, this.canvas.width >> 1),
      Math.max(2, this.canvas.height >> 1),
      gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST, true,
    );

    // Most seeds land on the word so the shards there are small and detailed;
    // the rest spread over the canvas so the field does not end at the glyphs.
    const pad = 40;
    const bx0 = Math.max(0, this.inkBox.x0 - pad);
    const bx1 = Math.min(this.cssW, this.inkBox.x1 + pad);
    const by0 = Math.max(0, this.inkBox.y0 - pad);
    const by1 = Math.min(this.cssH, this.inkBox.y1 + pad);

    this.shards = [];
    const seedArr = new Float32Array(this.count * 4);
    for (let i = 0; i < this.count; i++) {
      const inBox = i < this.count * 0.82;
      const sx = inBox ? bx0 + Math.random() * (bx1 - bx0) : Math.random() * this.cssW;
      const sy = inBox ? by0 + Math.random() * (by1 - by0) : Math.random() * this.cssH;
      this.shards.push({ sx, sy, dx: 0, dy: 0, vx: 0, vy: 0, ang: 0, va: 0, e: 0 });
      seedArr[i * 4] = sx;
      seedArr[i * 4 + 1] = sy;
    }

    if (this.seedTex) gl.deleteTexture(this.seedTex);
    if (this.xformTex) gl.deleteTexture(this.xformTex);
    this.seedTex = g.makeTex(this.count, 1, gl.RGBA32F, gl.RGBA, gl.FLOAT, gl.NEAREST, seedArr);
    this.xformArr = new Float32Array(this.count * 4);
    this.xformTex = g.makeTex(
      this.count, 1, gl.RGBA32F, gl.RGBA, gl.FLOAT, gl.NEAREST, this.xformArr,
    );

    // Bake the Voronoi diagram once — the seeds never move, only the shards do.
    this.target(this.cellFBO);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const p = g.use(this.pCone);
    g.u2(p, "u_res", this.cssW, this.cssH);
    g.u1(p, "u_coneR", Math.hypot(this.cssW, this.cssH) * 1.1);
    gl.bindVertexArray(this.coneVAO);
    for (let i = 0; i < this.count; i++) {
      g.u2(p, "u_seed", this.shards[i]!.sx, this.shards[i]!.sy);
      g.u1(p, "u_id", i);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, SEG + 2);
    }
    gl.bindVertexArray(null);
    gl.disable(gl.DEPTH_TEST);
    this.target(null);
  }

  protected render(dt: number): void {
    const { gl, g, M, params } = this;
    if (!this.cellFBO) return;

    const R = params.radius * 1.8;
    const active = this.reduced ? 0 : M.active;
    for (let i = 0; i < this.count; i++) {
      const c = this.shards[i]!;
      const ddx = c.sx + c.dx - M.x;
      const ddy = c.sy + c.dy - M.y;
      const d = Math.hypot(ddx, ddy);
      const nx = d > 0.01 ? ddx / d : 0;
      const ny = d > 0.01 ? ddy / d : 1;

      if (active && d < R) {
        const f = (1 - d / R) ** 2;
        const gain = 0.35 + Math.min(M.speed / 800, 1) * 1.5;
        c.vx += nx * f * params.force * 0.75 * gain * dt;
        c.vy += ny * f * params.force * 0.75 * gain * dt;
        // Signed per shard, so the field tumbles rather than rotating as one.
        c.va += Math.sin(i * 12.9898) * f * gain * params.spin * 0.11 * dt;
      }
      if (this.impulse > 0 && d < R * 1.6) {
        const f = 1 - d / (R * 1.6);
        c.vx += nx * f * this.impulse * 0.8;
        c.vy += ny * f * this.impulse * 0.8;
        c.va += Math.sin(i * 78.233) * f * params.spin * 0.05;
      }

      const k = params.spring;
      c.vx -= c.dx * k * dt;
      c.vy -= c.dy * k * dt;
      c.va -= c.ang * k * 0.5 * dt;
      const damp = Math.exp(-4.2 * dt);
      c.vx *= damp;
      c.vy *= damp;
      c.va *= damp;
      c.dx += c.vx * dt;
      c.dy += c.vy * dt;
      c.ang += c.va * dt;
      c.e = Math.min(1, Math.hypot(c.vx, c.vy) / 420 + Math.hypot(c.dx, c.dy) / 130);

      this.xformArr[i * 4] = c.dx;
      this.xformArr[i * 4 + 1] = c.dy;
      this.xformArr[i * 4 + 2] = c.ang;
      this.xformArr[i * 4 + 3] = c.e;
    }

    gl.bindTexture(gl.TEXTURE_2D, this.xformTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.count, 1, gl.RGBA, gl.FLOAT, this.xformArr);

    this.target(null);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    const p = g.use(this.pShatter);
    g.tex(p, "u_cells", this.cellFBO.tex);
    g.tex(p, "u_seeds", this.seedTex);
    g.tex(p, "u_xform", this.xformTex);
    g.tex(p, "u_text", this.texText);
    g.u2(p, "u_res", this.cssW, this.cssH);
    g.u2(p, "u_texel", this.cellFBO.tx, this.cellFBO.ty);
    g.u1(p, "u_count", this.count);
    g.u3(p, "u_ink", params.ink[0], params.ink[1], params.ink[2]);
    g.u3(p, "u_hot", params.hot[0], params.hot[1], params.hot[2]);
    this.fill();
  }

  protected teardown(): void {
    const { gl, g } = this;
    if (this.pCone) gl.deleteProgram(this.pCone);
    if (this.pShatter) gl.deleteProgram(this.pShatter);
    if (this.coneVAO) gl.deleteVertexArray(this.coneVAO);
    if (this.seedTex) gl.deleteTexture(this.seedTex);
    if (this.xformTex) gl.deleteTexture(this.xformTex);
    g.killFBO(this.cellFBO);
    this.cellFBO = null;
  }
}
