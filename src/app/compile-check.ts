/**
 * Dev-only compile harness. Exposed on `window.__compileAll` so the whole
 * library can be verified from the console (or from an automated check)
 * without clicking through the gallery.
 *
 * Returns one entry per shader: `{ id, ok, error }`.
 */
import { ShaderBackground } from "../core/renderer";
import { shaderList } from "../shaders/index";

export interface CompileReport {
  id: string;
  ok: boolean;
  error: string | null;
}

export function compileAll(): CompileReport[] {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;

  const reports: CompileReport[] = [];
  let bg: ShaderBackground | null = null;
  try {
    bg = new ShaderBackground(canvas, shaderList[0], {
      autoplay: false,
      pauseWhenHidden: false,
    });
    for (const def of shaderList) {
      const res = bg.load(def);
      reports.push({ id: def.id, ok: res.ok, error: res.error });
    }
  } finally {
    bg?.dispose();
  }
  return reports;
}

declare global {
  interface Window {
    __compileAll?: () => CompileReport[];
  }
}

if (import.meta.env.DEV) {
  window.__compileAll = compileAll;
}
