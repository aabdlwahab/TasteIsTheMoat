/**
 * Everything the gallery can show, in one list.
 *
 * The order here is the order of the "All" filter: shaders first because they
 * are the loudest, then the elements in increasing specialisation, then
 * sections, then the GPU benches. Complete websites are deliberately absent —
 * they live in their own section of the page.
 */
import { experimentalWorks } from "./experimental";
import { foundationWorks } from "./foundation";
import { gpuWorks } from "./gpu";
import { motionWorks } from "./motion";
import { sectionWorks } from "./sections";
import { shaderNativeWorks } from "./shaderNative";
import { shaderWorks } from "./shaders";
import { surfaceWorks } from "./surfaces";
import type { Work } from "../types";

export const works: Work[] = [
  ...shaderWorks,
  ...foundationWorks,
  ...shaderNativeWorks,
  ...experimentalWorks,
  ...motionWorks,
  ...surfaceWorks,
  ...sectionWorks,
  ...gpuWorks,
];

/** Filter groups, in the order the gallery offers them. */
export const groups: string[] = [
  "Shaders",
  "Foundation",
  "Shader-native",
  "Experimental",
  "Motion",
  "WebGL type",
  "Sections",
  "GPU lab",
];

export const worksById = new Map(works.map((work) => [work.id, work]));

export function countsByGroup(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const work of works) counts[work.group] = (counts[work.group] ?? 0) + 1;
  return counts;
}
