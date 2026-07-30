/**
 * Shared shader-compilation helpers.
 *
 * Both the full {@link ShaderBackground} runtime and the gallery's shared
 * thumbnail pool build sources and upload uniforms the same way, so that logic
 * lives here rather than being duplicated.
 */
import { BUILTIN_UNIFORMS, GLSL_COMMON } from "./glsl";
import type { UniformDef, UniformMap } from "./types";

export type UniformValue = number | number[];

/** GLSL `uniform` declarations for a shader's custom uniform map. */
export function declareUniforms(uniforms: UniformMap): string {
  return Object.entries(uniforms)
    .map(([name, def]) => {
      const glslType = def.type === "color" ? "vec3" : def.type;
      return `uniform ${glslType} ${name};`;
    })
    .join("\n");
}

/**
 * Assemble the full fragment source: built-in uniforms, the shader's own
 * uniform declarations, the shared helper library, then the body.
 */
export function buildFragmentSource(uniforms: UniformMap, body: string): string {
  return [
    BUILTIN_UNIFORMS,
    declareUniforms(uniforms),
    GLSL_COMMON,
    "\n",
    body,
  ].join("\n");
}

/** Number of prelude lines, so GLSL error lines can be rebased onto the body. */
export function preludeLineCount(uniforms: UniformMap): number {
  return buildFragmentSource(uniforms, "").split("\n").length - 1;
}

/** Compile one shader stage. Returns the shader, or the error log as a string. */
export function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | string {
  const shader = gl.createShader(type);
  if (!shader) return "Failed to create shader object.";
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Drivers commonly NUL-terminate the info log; strip it so the message
    // renders cleanly in the editor.
    const log = gl.getShaderInfoLog(shader) ?? "Unknown shader error.";
    gl.deleteShader(shader);
    return log.replace(/\0/g, "").trim();
  }
  return shader;
}

/** Link a vertex + fragment pair. Returns the program, or an error string. */
export function linkProgram(
  gl: WebGLRenderingContext,
  vertexSrc: string,
  fragmentSrc: string,
): WebGLProgram | string {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
  if (typeof vs === "string") return vs;

  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
  if (typeof fs === "string") {
    gl.deleteShader(vs);
    return fs;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return "Failed to create shader program.";
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "Program link failed.";
    gl.deleteProgram(program);
    return log.replace(/\0/g, "").trim();
  }
  return program;
}

/** Upload one custom uniform value according to its declared type. */
export function applyUniform(
  gl: WebGLRenderingContext,
  loc: WebGLUniformLocation,
  def: UniformDef,
  value: UniformValue,
): void {
  switch (def.type) {
    case "float":
      gl.uniform1f(loc, value as number);
      break;
    case "vec2": {
      const v = value as number[];
      gl.uniform2f(loc, v[0], v[1]);
      break;
    }
    case "color": {
      const v = value as number[];
      gl.uniform3f(loc, v[0], v[1], v[2]);
      break;
    }
  }
}

/** Shift `ERROR: 0:N:` line numbers to be relative to the editable body. */
export function rebaseErrorLines(log: string, preludeLines: number): string {
  return log.replace(/ERROR:\s*(\d+):(\d+):/g, (_m, col, line) => {
    const rebased = Math.max(1, Number(line) - preludeLines);
    return `ERROR: ${col}:${rebased}:`;
  });
}
