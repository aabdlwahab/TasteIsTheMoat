/** A tuple of RGB values, each in the 0..1 range. */
export type RGB = [number, number, number];

/** Supported uniform kinds that the editor knows how to render controls for. */
export type UniformType = "float" | "vec2" | "color";

export interface FloatUniform {
  type: "float";
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Human-friendly label shown in the editor UI. */
  label?: string;
}

export interface Vec2Uniform {
  type: "vec2";
  value: [number, number];
  min: number;
  max: number;
  step?: number;
  label?: string;
}

export interface ColorUniform {
  type: "color";
  /** Stored as linear-ish 0..1 RGB and passed straight to the shader. */
  value: RGB;
  label?: string;
}

export type UniformDef = FloatUniform | Vec2Uniform | ColorUniform;

/** The GLSL identifier (e.g. `u_speed`) mapped to its definition. */
export type UniformMap = Record<string, UniformDef>;

/**
 * Which slot of a brand ramp a colour uniform should take when a shader is
 * rebranded. Declared per-shader because the meaning of a colour cannot be
 * inferred from its position: Aurora lists its bright ribbon colours before the
 * dark sky, while Metaballs lists background first.
 */
export type ColorRole = "dark" | "mid" | "bright" | "accent";

/** Gallery groupings. `interactive` shaders respond to the pointer. */
export type Category =
  | "gradient"
  | "organic"
  | "iridescent"
  | "interactive"
  | "space"
  | "geometric";

export interface ShaderDef {
  id: string;
  name: string;
  /** One-line description shown in the gallery. */
  description: string;
  category: Category;
  /** Marks shaders that read the pointer, so the UI can hint at it. */
  interactive?: boolean;
  /**
   * The fragment-shader source. It must define `void main()` and write to
   * `gl_FragColor`. The prelude (precision, built-in uniforms, custom uniform
   * declarations and the helper library) is prepended automatically, so the
   * body can freely use `u_time`, `u_resolution`, `u_mouse`, any declared
   * custom uniform, and every helper in `src/core/glsl.ts`.
   */
  fragment: string;
  /** Custom uniforms, keyed by their GLSL identifier. */
  uniforms: UniformMap;
  /**
   * Brand-ramp role for each colour uniform. Without this, `brandUniforms`
   * falls back to declaration order, which guesses wrong whenever a shader
   * does not happen to declare its colours darkest-first.
   */
  colorRoles?: Record<string, ColorRole>;
}
