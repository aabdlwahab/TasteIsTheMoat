import { QUAD_VS, TextSurface } from "../textSurface";
import type { Program, TextSurfaceOptions } from "../textSurface";

const GLYPH_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_text;
uniform sampler2D u_atlas;
uniform sampler2D u_edge;
uniform sampler2D u_scramble;
uniform vec2  u_grid;
uniform vec2  u_res;
uniform float u_glyphs;
uniform float u_edgeGlyphs;
uniform float u_time;
uniform float u_treat;
uniform vec3  u_c0;
uniform vec3  u_c1;
uniform vec3  u_c2;
out vec4 o;

const float PI = 3.14159265;

vec2 hash2(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float gnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                 dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
             mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                 dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
float rnd(float x){ return fract(sin(x * 127.1) * 43758.5453); }

vec3 ramp(float t){
  t = clamp(t, 0.0, 1.0);
  return t < 0.5 ? mix(u_c0, u_c1, t * 2.0) : mix(u_c1, u_c2, (t - 0.5) * 2.0);
}

/* Average the glyph coverage over the cell rather than point-sampling it,
   so thin strokes still register instead of dropping between cells. */
float lum(vec2 c){
  float l = 0.0;
  l += texture(u_text, c + vec2( 0.25,  0.25) / u_grid).a;
  l += texture(u_text, c + vec2(-0.25,  0.25) / u_grid).a;
  l += texture(u_text, c + vec2( 0.25, -0.25) / u_grid).a;
  l += texture(u_text, c + vec2(-0.25, -0.25) / u_grid).a;
  return l * 0.25;
}

void main(){
  int   T     = int(u_treat + 0.5);
  vec2  cell  = floor(vUv * u_grid);
  vec2  cUv   = (cell + 0.5) / u_grid;
  vec2  local = fract(vUv * u_grid);
  float l     = lum(cUv);
  float scr   = texture(u_scramble, cUv).r;

  float glyphs = u_glyphs;
  float idx    = 0.0;
  float bright = l;
  float tone   = l;
  vec3  accent = vec3(0.0);
  bool  edge   = (T == 3);

  if (edge){
    // Pick a slash whose angle follows the local edge direction.
    glyphs = u_edgeGlyphs;
    vec2 e = vec2(0.9, 0.0) / u_grid, f = vec2(0.0, 0.9) / u_grid;
    float gx = lum(cUv + e) - lum(cUv - e);
    float gy = lum(cUv + f) - lum(cUv - f);
    float mag = length(vec2(gx, gy));
    if (l < 0.04 && mag < 0.05){ idx = 0.0; }
    else if (mag < 0.10){ idx = 5.0; }
    else {
      vec2  dirv = vec2(-gy, gx);
      float ang  = atan(dirv.y, dirv.x);
      idx = 1.0 + mod(floor(ang / PI * 4.0 + 4.5), 4.0);
    }
    bright = max(l * 0.55, mag * 3.2);
    tone   = bright;
  }
  else if (T == 2){                                      // matrix rain
    float sp   = 0.22 + rnd(cell.x) * 0.55;
    float head = fract(rnd(cell.x + 7.31) + u_time * sp) * u_grid.y;
    float dy   = mod(head - cell.y, u_grid.y);
    float tail = exp(-dy * 0.17);
    idx    = 1.0 + floor(rnd(cell.x * 31.7 + cell.y * 7.13 + floor(u_time * 9.0)) * (glyphs - 1.0));
    bright = l * (0.20 + tail * 1.25) + tail * 0.07;
    tone   = clamp(l * 0.55 + tail * 0.5, 0.0, 1.0);
    accent = u_c2 * smoothstep(1.6, 0.0, dy) * (0.25 + l * 0.9);
  }
  else if (T == 5){                                      // travelling wave
    float w = sin(vUv.x * 13.0 - u_time * 2.1 + vUv.y * 5.0) * 0.5 + 0.5;
    idx    = floor(clamp(l * (0.5 + w * 0.85), 0.0, 1.0) * (glyphs - 1.0) + 0.5);
    bright = l * (0.45 + w * 0.95);
    tone   = clamp(l * 0.55 + w * 0.55, 0.0, 1.0);
  }
  else {
    idx = floor(clamp(l, 0.0, 1.0) * (glyphs - 1.0) + 0.5);
  }

  if (!edge && scr > 0.01){
    float j = gnoise(cell * 0.7 + u_time * 6.0) * 0.5 + 0.5;
    idx    = floor(mix(idx, 1.0 + j * (glyphs - 1.0), clamp(scr * 1.3, 0.0, 1.0)) + 0.5);
    bright = max(bright, scr * 0.85);
    tone   = clamp(tone + scr * 0.75, 0.0, 1.0);
  }
  idx = clamp(idx, 0.0, glyphs - 1.0);

  vec2  auv = vec2((idx + local.x) / glyphs, local.y);
  float g   = edge ? texture(u_edge, auv).a : texture(u_atlas, auv).a;

  vec3 col;
  if (T == 4){                                           // solid cell, glyph knocked out
    float pad = step(0.05, local.x) * step(local.x, 0.95)
              * step(0.05, local.y) * step(local.y, 0.95);
    float fillv = clamp(bright * 1.15 + scr * 0.6, 0.0, 1.0);
    col = ramp(tone) * pad * fillv * (1.0 - g * 0.92);
  } else {
    col = ramp(tone) * g * clamp(0.35 + bright * 1.15, 0.0, 1.8) + accent * g;
  }

  if (T == 1){                                           // CRT
    float scan  = 0.68 + 0.32 * sin(vUv.y * u_res.y * 1.9);
    float bloom = smoothstep(0.05, 0.9, bright) * 0.22;
    vec2  vg    = (vUv - 0.5) * 2.0;
    float vig   = 1.0 - dot(vg, vg) * 0.28;
    col = col * scan * vig + ramp(tone) * bloom * vig;
    col += vec3(0.006, 0.010, 0.008);
  }

  o = vec4(col, 1.0);
}`;

export const GLYPH_CHARSETS = [
  { name: "ASCII", chars: " .:-=+*oO#%@" },
  { name: "Blocks", chars: " ░▒▓█" },
  { name: "Bars", chars: " ▁▂▃▄▅▆▇█" },
  { name: "Braille", chars: " ⠁⠃⠇⡇⣇⣧⣷⣿" },
  { name: "Kana", chars: " ｱｲｳｴｵｶｷｸｹｺｻｼｽ" },
  { name: "Dots", chars: " ·∘•○◉●" },
  { name: "Binary", chars: " ·01█" },
  { name: "Hex", chars: " 0123456789ABCDEF" },
  { name: "Lines", chars: " ─│┼╫╬█" },
  { name: "Terminal", chars: " .`',:;!i|IHNM@" },
] as const;

export const GLYPH_PALETTES = [
  { name: "Ice", c: [[0.10, 0.18, 0.42], [0.42, 0.62, 1.0], [0.92, 0.97, 1.0]] },
  { name: "Phosphor", c: [[0.03, 0.22, 0.10], [0.24, 0.86, 0.45], [0.85, 1.0, 0.90]] },
  { name: "Amber", c: [[0.26, 0.13, 0.02], [0.95, 0.64, 0.18], [1.0, 0.94, 0.80]] },
  { name: "Magenta", c: [[0.24, 0.05, 0.28], [0.88, 0.32, 0.82], [1.0, 0.86, 0.98]] },
  { name: "Mono", c: [[0.10, 0.11, 0.14], [0.52, 0.57, 0.68], [1.0, 1.0, 1.0]] },
  { name: "Solar", c: [[0.08, 0.14, 0.52], [1.0, 0.44, 0.22], [1.0, 0.92, 0.62]] },
] as const;

export const GLYPH_TREATMENTS = ["Flat", "CRT", "Matrix", "Edge", "Solid", "Wave"] as const;

const EDGE_SET = " -\\|/#";

export interface GlyphSurfaceOptions extends TextSurfaceOptions {
  /** Index into `GLYPH_CHARSETS`. */
  charset?: number;
  /** Index into `GLYPH_PALETTES`. */
  palette?: number;
  /** Index into `GLYPH_TREATMENTS`. */
  treatment?: number;
  /** Cell width in CSS pixels. Smaller is denser and costlier. */
  cell?: number;
  /** Scramble radius in CSS pixels. */
  radius?: number;
}

/**
 * The word resolved into a grid of characters.
 *
 * Each cell reads the average glyph coverage under it and picks a character
 * from an atlas by brightness. The pointer writes into a small single-channel
 * "scramble" texture that decays over time; cells with scramble energy pick a
 * random character instead, so the word dissolves and re-resolves in your wake.
 */
export class GlyphSurface extends TextSurface {
  private p!: Program;
  private atlases: (WebGLTexture | null)[] = [];
  private edgeTex: WebGLTexture | null = null;
  private scrTex: WebGLTexture | null = null;
  private scrArr: Uint8Array = new Uint8Array(0);
  private cols = 0;
  private rows = 0;
  private params: Required<
    Pick<GlyphSurfaceOptions, "charset" | "palette" | "treatment" | "cell" | "radius">
  >;

  constructor(canvas: HTMLCanvasElement, options: GlyphSurfaceOptions) {
    super(canvas, options);
    this.params = {
      charset: options.charset ?? 0,
      palette: options.palette ?? 0,
      treatment: options.treatment ?? 0,
      cell: options.cell ?? 11,
      radius: options.radius ?? 150,
    };
    this.init();
  }

  /** Cell grid currently in use, for a status readout. */
  get grid(): { cols: number; rows: number } {
    return { cols: this.cols, rows: this.rows };
  }

  setParams(next: Partial<GlyphSurfaceOptions>): void {
    const needsRebuild = next.cell !== undefined && next.cell !== this.params.cell;
    Object.assign(this.params, next);
    if (needsRebuild) this.rebuild();
  }

  protected setup(): void {
    this.p = this.g.program(QUAD_VS, GLYPH_FS);
    this.edgeTex = this.makeAtlas(EDGE_SET);
  }

  /** One row of characters, each drawn to fit a fixed cell. */
  private makeAtlas(chars: string): WebGLTexture {
    const cw = 32, ch = 60;
    const c = document.createElement("canvas");
    c.width = cw * chars.length;
    c.height = ch;
    const x = c.getContext("2d")!;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = "#fff";
    const mono = (n: number) =>
      `700 ${n}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    for (let i = 0; i < chars.length; i++) {
      let fs = 44;
      x.font = mono(fs);
      // Shrink until the glyph fits — the wide box characters overflow at 44.
      while (fs > 8 && x.measureText(chars[i]!).width > cw - 3) {
        fs -= 2;
        x.font = mono(fs);
      }
      x.fillText(chars[i]!, i * cw + cw / 2, ch / 2 + 2);
    }
    const { gl } = this;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  private atlasFor(i: number): WebGLTexture {
    if (!this.atlases[i]) this.atlases[i] = this.makeAtlas(GLYPH_CHARSETS[i]!.chars);
    return this.atlases[i]!;
  }

  protected rebuild(): void {
    const { gl } = this;
    const size = this.params.cell;
    this.cols = Math.max(8, Math.floor(this.cssW / size));
    // Cells are taller than wide, matching the monospace atlas proportions.
    this.rows = Math.max(6, Math.floor(this.cssH / (size * 1.9)));
    this.scrArr = new Uint8Array(this.cols * this.rows);
    if (this.scrTex) gl.deleteTexture(this.scrTex);
    this.scrTex = this.g.makeTex(
      this.cols, this.rows, gl.R8, gl.RED, gl.UNSIGNED_BYTE, gl.LINEAR, this.scrArr,
    );
  }

  protected render(dt: number): void {
    const { gl, g, M, params } = this;
    if (!this.scrTex) return;

    // Decay the scramble field, then stamp the pointer into it. Done on the
    // CPU because the grid is tiny — a few thousand cells at most.
    const decay = Math.exp(-2.4 * dt);
    const cw = this.cssW / this.cols;
    const chh = this.cssH / this.rows;
    const R = params.radius;
    const gain = 0.3 + Math.min(M.speed / 700, 1) * 0.7;
    const active = this.reduced ? 0 : M.active;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const i = y * this.cols + x;
        let v = this.scrArr[i]! * decay;
        if (active) {
          const d = Math.hypot((x + 0.5) * cw - M.x, (y + 0.5) * chh - M.y);
          if (d < R) v = Math.max(v, (1 - d / R) * 255 * gain);
        }
        this.scrArr[i] = v;
      }
    }
    gl.bindTexture(gl.TEXTURE_2D, this.scrTex);
    gl.texSubImage2D(
      gl.TEXTURE_2D, 0, 0, 0, this.cols, this.rows, gl.RED, gl.UNSIGNED_BYTE, this.scrArr,
    );

    this.target(null);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0.023, 0.027, 0.051, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const p = g.use(this.p);
    g.tex(p, "u_text", this.texText);
    g.tex(p, "u_atlas", this.atlasFor(params.charset));
    g.tex(p, "u_edge", this.edgeTex);
    g.tex(p, "u_scramble", this.scrTex);
    g.u2(p, "u_grid", this.cols, this.rows);
    g.u2(p, "u_res", this.cssW, this.cssH);
    g.u1(p, "u_glyphs", GLYPH_CHARSETS[params.charset]!.chars.length);
    g.u1(p, "u_edgeGlyphs", EDGE_SET.length);
    // Frozen clock under reduced motion: the rain and wave stop travelling.
    g.u1(p, "u_time", this.reduced ? 0 : this.clock);
    g.u1(p, "u_treat", params.treatment);
    const c = GLYPH_PALETTES[params.palette]!.c;
    g.u3(p, "u_c0", c[0]![0], c[0]![1], c[0]![2]);
    g.u3(p, "u_c1", c[1]![0], c[1]![1], c[1]![2]);
    g.u3(p, "u_c2", c[2]![0], c[2]![1], c[2]![2]);
    this.fill();
  }

  protected teardown(): void {
    const { gl } = this;
    if (this.p) gl.deleteProgram(this.p);
    if (this.edgeTex) gl.deleteTexture(this.edgeTex);
    if (this.scrTex) gl.deleteTexture(this.scrTex);
    for (const a of this.atlases) if (a) gl.deleteTexture(a);
    this.atlases = [];
  }
}
