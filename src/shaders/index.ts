import type { Category, ShaderDef } from "../core/types";
import { aurora } from "./aurora";
import { caustics } from "./caustics";
import { cursorFlow } from "./cursor-flow";
import { godrays } from "./godrays";
import { halftone } from "./halftone";
import { holoFoil } from "./holo-foil";
import { lavaLamp } from "./lava-lamp";
import { liquidRipple } from "./liquid-ripple";
import { magneticDots } from "./magnetic-dots";
import { meshGradient } from "./mesh-gradient";
import { metaballs } from "./metaballs";
import { movingGradientShaders } from "./moving-gradients";
import { nebula } from "./nebula";
import { oilSlick } from "./oil-slick";
import { plasma } from "./plasma";
import { prism } from "./prism";
import { scoutedMovingGradientShaders } from "./scouted-moving-gradients";
import { silk } from "./silk";
import { spotlight } from "./spotlight";
import { starfield } from "./starfield";
import { synthwaveGrid } from "./synthwave-grid";
import { topographic } from "./topographic";
import { voronoiCells } from "./voronoi-cells";
import {
  scoutedGeometricShaders,
  scoutedGradientShaders,
  scoutedInteractiveShaders,
  scoutedIridescentShaders,
  scoutedOrganicShaders,
  scoutedSpaceShaders,
} from "./scouted";

/** All bundled shaders, grouped by category in gallery order. */
export const shaderList: ShaderDef[] = [
  // gradient
  meshGradient,
  aurora,
  silk,
  ...scoutedGradientShaders,
  ...movingGradientShaders,
  ...scoutedMovingGradientShaders,
  // iridescent
  holoFoil,
  oilSlick,
  prism,
  ...scoutedIridescentShaders,
  // interactive
  liquidRipple,
  magneticDots,
  spotlight,
  cursorFlow,
  ...scoutedInteractiveShaders,
  // organic
  metaballs,
  plasma,
  voronoiCells,
  caustics,
  lavaLamp,
  ...scoutedOrganicShaders,
  // space
  starfield,
  nebula,
  godrays,
  ...scoutedSpaceShaders,
  // geometric
  synthwaveGrid,
  topographic,
  halftone,
  ...scoutedGeometricShaders,
];

/** Category display names, in the order the gallery shows them. */
export const categories: { id: Category; label: string }[] = [
  { id: "gradient", label: "Gradient" },
  { id: "iridescent", label: "Iridescent" },
  { id: "interactive", label: "Interactive" },
  { id: "organic", label: "Organic" },
  { id: "space", label: "Space" },
  { id: "geometric", label: "Geometric" },
];

/** Shaders keyed by camelCase id, for `shaders.holoFoil` style lookup. */
export const shaders: Record<string, ShaderDef> = Object.fromEntries(
  shaderList.map((s) => [toCamel(s.id), s]),
);

/** Look a shader up by its id (e.g. "mesh-gradient"). */
export function getShader(id: string): ShaderDef | undefined {
  return shaderList.find((s) => s.id === id);
}

/** All shaders in one category. */
export function byCategory(category: Category): ShaderDef[] {
  return shaderList.filter((s) => s.category === category);
}

/** Shaders that respond to the pointer. */
export function interactiveShaders(): ShaderDef[] {
  return shaderList.filter((s) => s.interactive);
}

function toCamel(id: string): string {
  return id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export {
  aurora,
  caustics,
  cursorFlow,
  godrays,
  halftone,
  holoFoil,
  lavaLamp,
  liquidRipple,
  magneticDots,
  meshGradient,
  metaballs,
  nebula,
  oilSlick,
  plasma,
  prism,
  silk,
  spotlight,
  starfield,
  synthwaveGrid,
  topographic,
  voronoiCells,
};
export * from "./scouted";
export * from "./moving-gradients";
export * from "./scouted-moving-gradients";
