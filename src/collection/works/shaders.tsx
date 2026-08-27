/**
 * Every bundled shader, as a gallery entry.
 *
 * Nothing here is hand-written per shader: each `ShaderDef` already declares
 * its uniforms with a type, a range, and a label, because the studio needs
 * that. The workbench reads the same declarations, so all 69 shaders arrive
 * with a complete control panel and stay correct when a shader gains a knob.
 */
import { ShaderSection } from "../../ui/ShaderSection";
import { hexToRgb, rgbToHex } from "../../core/color";
import { categories, shaderList } from "../../shaders/index";
import type { ScrimStrength } from "../../ui/ShaderSection";
import type { RGB, ShaderDef, UniformDef } from "../../core/types";
import type { ControlDef, ControlValues, Work } from "../types";
import { num, range, select, str } from "../types";

const SCRIMS = ["none", "subtle", "medium", "strong"] as const;

const categoryLabel = new Map(categories.map((c) => [c.id, c.label]));

/** Uniform declarations become controls; vec2 becomes a pair of sliders. */
function controlsFor(shader: ShaderDef): ControlDef[] {
  const controls: ControlDef[] = [];

  for (const [name, uniform] of Object.entries(shader.uniforms)) {
    const label = uniform.label ?? prettify(name);
    if (uniform.type === "float") {
      controls.push(
        range(name, label, uniform.value, uniform.min, uniform.max, uniform.step ?? stepFor(uniform)),
      );
    } else if (uniform.type === "vec2") {
      const step = uniform.step ?? stepFor(uniform);
      controls.push(
        range(`${name}.x`, `${label} X`, uniform.value[0], uniform.min, uniform.max, step),
        range(`${name}.y`, `${label} Y`, uniform.value[1], uniform.min, uniform.max, step),
      );
    } else {
      controls.push({
        kind: "color",
        key: name,
        label,
        value: rgbToHex(uniform.value),
      });
    }
  }

  controls.push(
    select("scrim", "Scrim", "none", SCRIMS),
    range("dpr", "Resolution", 1.5, 0.5, 2, 0.25, "×"),
  );
  return controls;
}

/** Turn the panel's flat values back into the uniform map the renderer wants. */
function uniformsFrom(shader: ShaderDef, values: ControlValues) {
  const uniforms: Record<string, number | number[]> = {};

  for (const [name, uniform] of Object.entries(shader.uniforms)) {
    if (uniform.type === "float") {
      uniforms[name] = num(values, name, uniform.value);
    } else if (uniform.type === "vec2") {
      uniforms[name] = [
        num(values, `${name}.x`, uniform.value[0]),
        num(values, `${name}.y`, uniform.value[1]),
      ];
    } else {
      uniforms[name] = hexToRgb(str(values, name, rgbToHex(uniform.value)));
    }
  }

  return uniforms;
}

/** Only the uniforms the visitor actually moved, for the usage snippet. */
function changedUniforms(shader: ShaderDef, values: ControlValues) {
  const all = uniformsFrom(shader, values);
  const changed: string[] = [];

  for (const [name, uniform] of Object.entries(shader.uniforms)) {
    const next = all[name];
    if (uniform.type === "color") {
      const hex = str(values, name, rgbToHex(uniform.value));
      if (hex.toLowerCase() !== rgbToHex(uniform.value).toLowerCase()) {
        changed.push(`    ${name}: hexToRgb("${hex}")`);
      }
    } else if (uniform.type === "vec2") {
      const [x, y] = next as number[];
      if (x !== uniform.value[0] || y !== uniform.value[1]) {
        changed.push(`    ${name}: [${trim(x)}, ${trim(y)}]`);
      }
    } else if (next !== uniform.value) {
      changed.push(`    ${name}: ${trim(next as number)}`);
    }
  }

  return changed;
}

function shaderWork(shader: ShaderDef): Work {
  return {
    id: `shader-${shader.id}`,
    name: shader.name,
    group: "Shaders",
    kind: categoryLabel.get(shader.category) ?? shader.category,
    description: shader.description,
    fit: "fill",
    href: `/studio.html?shader=${shader.id}`,
    swatch: swatchFor(shader),
    controls: controlsFor(shader),
    render: (values) => (
      <ShaderSection
        as="div"
        shader={shader}
        uniforms={uniformsFrom(shader, values)}
        scrim={str(values, "scrim", "none") as ScrimStrength}
        maxDpr={num(values, "dpr", 1.5)}
        className="h-full w-full"
        contentClassName="h-full"
      />
    ),
    code: (values) => {
      const changed = changedUniforms(shader, values);
      const scrim = str(values, "scrim", "none");
      const lines = [`  shader="${shader.id}"`];
      if (changed.length) lines.push(`  uniforms={{\n${changed.join(",\n")},\n  }}`);
      if (scrim !== "medium") lines.push(`  scrim="${scrim}"`);
      return `<ShaderSection\n${lines.join("\n")}\n>\n  {/* your content */}\n</ShaderSection>`;
    },
  };
}

/** A sensible slider step when a uniform did not declare one. */
function stepFor(uniform: Extract<UniformDef, { type: "float" | "vec2" }>): number {
  const span = uniform.max - uniform.min;
  return span > 40 ? 1 : span > 4 ? 0.1 : 0.01;
}

function prettify(name: string): string {
  const bare = name.replace(/^u_/, "").replace(/([a-z])([A-Z])/g, "$1 $2");
  return bare.charAt(0).toUpperCase() + bare.slice(1);
}

function trim(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
}


/**
 * The gallery card's tile.
 *
 * `fallbackGradient` would do the colour part, but it places its blobs at
 * fixed positions — and whole shader families share one palette, so thirty
 * cards came out byte-identical. Keeping the shader's real colours and moving
 * the blobs by a hash of its id makes each card its own object without
 * inventing a colour the shader does not have. Shaders that declare no colours
 * at all return undefined and fall through to the workbench's hashed tile.
 */
function swatchFor(shader: ShaderDef): string | undefined {
  const colors = Object.values(shader.uniforms)
    .filter((uniform) => uniform.type === "color")
    .map((uniform) => uniform.value as RGB);
  if (colors.length === 0) return undefined;

  const sorted = [...colors].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  const base = sorted[0];
  const blobs = sorted.slice(1);
  const hash = hashOf(shader.id);

  const layers = (blobs.length > 0 ? blobs : sorted).map((rgb, index) => {
    const seed = hash >> (index * 5);
    const x = 12 + (seed % 76);
    const y = 12 + ((seed >> 4) % 76);
    const w = 55 + ((seed >> 8) % 40);
    const h = 45 + ((seed >> 11) % 40);
    const [r, g, b] = rgb.map((value) => Math.round(value * 255));
    return `radial-gradient(ellipse ${w}% ${h}% at ${x}% ${y}%, rgba(${r},${g},${b},0.62) 0%, rgba(${r},${g},${b},0) 62%)`;
  });

  const [r, g, b] = base.map((value) => Math.round(value * 255));
  return `${layers.join(", ")}, rgb(${r},${g},${b})`;
}

function hashOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 33 + id.charCodeAt(i)) >>> 0;
  return hash;
}

export const shaderWorks: Work[] = shaderList.map(shaderWork);
