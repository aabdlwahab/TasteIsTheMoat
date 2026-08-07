import { QUAD_VS, TextSurface } from "../textSurface";
import type { Program, TextSurfaceOptions } from "../textSurface";

const LENS_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_text;
uniform vec2  u_mouse;      // uv
uniform vec2  u_aspect;
uniform float u_radius;     // uv units
uniform float u_force;
uniform float u_speed;
uniform float u_active;
uniform float u_time;
uniform vec3  u_ink;
uniform vec3  u_glow;
out vec4 o;

float glyph(vec2 uv){ return texture(u_text, uv).a; }

void main(){
  vec2  d = (vUv - u_mouse) * u_aspect;
  float r = length(d);
  vec2  n = r > 0.0001 ? d / r : vec2(0.0);

  float k     = u_active * smoothstep(u_radius, 0.0, r);
  float bulge = k * k * u_force;
  // The ripple only appears with pointer speed, so a slow drag refracts
  // cleanly and a fast sweep leaves a wake.
  float ripple = sin(r * 130.0 - u_time * 7.0) * k * 0.012 * min(u_speed / 700.0, 1.0);

  vec2 base = vUv - (n / u_aspect) * (bulge * 0.16 + ripple);

  // Dispersion grows with displacement, so the fringing is strongest exactly
  // where the glass is bending hardest.
  float disp = bulge * 0.016 + abs(ripple) * 0.9;
  vec2  sh   = (n / u_aspect) * disp;

  float a_r = glyph(base + sh);
  float a_g = glyph(base);
  float a_b = glyph(base - sh);

  float a = max(a_g, max(a_r, a_b));
  if (a < 0.004){ o = vec4(0.0, 0.0, 0.0, 1.0); return; }

  vec3 col = vec3(a_r, a_g, a_b) * u_ink;
  col += u_glow * k * a * 0.9;

  // Specular edge from the gradient of the displaced field.
  float e  = 0.0016;
  float gx = glyph(base + vec2(e, 0.0)) - glyph(base - vec2(e, 0.0));
  float gy = glyph(base + vec2(0.0, e)) - glyph(base - vec2(0.0, e));
  col += vec3(0.9, 0.95, 1.0) * pow(clamp(gx * 0.5 - gy * 0.5, 0.0, 1.0), 1.6) * (0.4 + k);

  o = vec4(col, 1.0);
}`;

export interface LensSurfaceOptions extends TextSurfaceOptions {
  /** Lens radius in CSS pixels. */
  radius?: number;
  /** Refraction strength, 0–260 (100 is neutral). */
  refract?: number;
  /** How much pointer speed adds ripple, 0–300 (100 is neutral). */
  ripple?: number;
  ink?: [number, number, number];
  glow?: [number, number, number];
}

/**
 * The word seen through a lens that follows the pointer.
 *
 * A single full-screen pass: the glyph texture is sampled through a displaced
 * UV, three times at slightly different offsets so the channels separate into
 * chromatic fringing at the edges of the bulge.
 */
export class LensSurface extends TextSurface {
  private p!: Program;
  private params: Required<
    Pick<LensSurfaceOptions, "radius" | "refract" | "ripple" | "ink" | "glow">
  >;

  constructor(canvas: HTMLCanvasElement, options: LensSurfaceOptions) {
    super(canvas, options);
    this.params = {
      radius: options.radius ?? 190,
      refract: options.refract ?? 100,
      ripple: options.ripple ?? 100,
      ink: options.ink ?? [0.55, 0.68, 1.0],
      glow: options.glow ?? [1.0, 0.7, 0.42],
    };
    this.init();
  }

  setParams(next: Partial<LensSurfaceOptions>): void {
    Object.assign(this.params, next);
  }

  protected setup(): void {
    this.p = this.g.program(QUAD_VS, LENS_FS);
  }

  protected rebuild(): void {
    /* Nothing size-dependent to allocate — the pass is stateless. */
  }

  protected render(): void {
    const { gl, g, M, params } = this;
    this.target(null);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    const p = g.use(this.p);
    g.tex(p, "u_text", this.texText);
    g.u2(p, "u_mouse", M.x / this.cssW, M.y / this.cssH);
    g.u2(p, "u_aspect", this.cssW / this.cssH, 1);
    g.u1(p, "u_radius", (params.radius / this.cssH) * 1.6);
    g.u1(p, "u_force", params.refract / 100);
    g.u1(p, "u_speed", this.reduced ? 0 : M.speed * (params.ripple / 100));
    g.u1(p, "u_active", this.reduced ? 0 : M.active);
    g.u1(p, "u_time", this.clock);
    g.u3(p, "u_ink", params.ink[0], params.ink[1], params.ink[2]);
    g.u3(p, "u_glow", params.glow[0], params.glow[1], params.glow[2]);
    this.fill();
  }

  protected teardown(): void {
    if (this.p) this.gl.deleteProgram(this.p);
  }
}
