/**
 * WebGL text surfaces — a word turned into particles, a character grid, an
 * optical lens, Voronoi shards, or dye in a fluid.
 *
 * These carry the most parameters of anything in the collection, and they are
 * the ones worth playing with, so every option each surface accepts is on the
 * panel — including the colour ramps.
 */
import { FluidText, GlyphText, LensText, ParticleText, ShatterText } from "../../ui/index";
import { hexToRgb } from "../../core/color";
import { GLYPH_CHARSETS, GLYPH_PALETTES, GLYPH_TREATMENTS } from "../../core/surfaces/glyphs";
import type { RGB } from "../../core/types";
import type { Work } from "../types";
import { color, num, range, select, str, text, usage } from "../types";

const BOX = "h-full w-full bg-[#06070d]";
const TYPE = "text-[clamp(2.5rem,10vw,6rem)]";

const CHARSETS: string[] = GLYPH_CHARSETS.map((set) => set.name);
const PALETTES: string[] = GLYPH_PALETTES.map((palette) => palette.name);
const TREATMENTS: string[] = [...GLYPH_TREATMENTS];

function rgb(values: Record<string, unknown>, key: string, fallback: string): RGB {
  const raw = values[key];
  return hexToRgb(typeof raw === "string" ? raw : fallback);
}

function base(
  id: string,
  name: string,
  description: string,
): Pick<Work, "id" | "name" | "group" | "kind" | "description" | "fit"> {
  return { id, name, group: "WebGL type", kind: "WebGL type", description, fit: "fill" };
}

export const surfaceWorks: Work[] = [
  {
    ...base("particle-text", "ParticleText", "A word rasterised into tens of thousands of GPU particles, pushed by the pointer and pulled home by a spring."),
    controls: [
      text("text", "Text", "INTERFACE", 16),
      range("particles", "Particles", 26000, 2000, 60000, 1000),
      range("radius", "Cursor reach", 150, 40, 420, 5, "px"),
      range("force", "Push force", 2800, 400, 9000, 100),
      range("spring", "Return spring", 45, 6, 140, 1),
      range("fill", "Width fill", 0.86, 0.4, 1, 0.02),
      select("align", "Align", "center", ["left", "center", "right"]),
      color("rest", "Rest colour", "#7c8aa5"),
      color("mid", "Mid colour", "#f97316"),
      color("hot", "Hot colour", "#bef264"),
    ],
    render: (v) => (
      <ParticleText
        text={str(v, "text", "INTERFACE")}
        className={BOX}
        textClassName={TYPE}
        particles={num(v, "particles", 26000)}
        radius={num(v, "radius", 150)}
        force={num(v, "force", 2800)}
        spring={num(v, "spring", 45)}
        fill={num(v, "fill", 0.86)}
        align={str(v, "align", "center") as "left" | "center" | "right"}
        colors={{
          rest: str(v, "rest", "#7c8aa5"),
          mid: str(v, "mid", "#f97316"),
          hot: str(v, "hot", "#bef264"),
        }}
        hint="Move the cursor across the letters · click to burst"
      />
    ),
    code: (v) =>
      usage("ParticleText", {
        text: str(v, "text"),
        particles: num(v, "particles", 26000),
        radius: num(v, "radius", 150),
        force: num(v, "force", 2800),
        spring: num(v, "spring", 45),
      }),
  },
  {
    ...base("surface-glyphs", "GlyphText", "A typographic image rebuilt as a shifting character grid that scrambles under the pointer."),
    controls: [
      text("text", "Text", "TERMINAL", 16),
      select("charset", "Charset", CHARSETS[0], CHARSETS),
      select("palette", "Palette", PALETTES[0], PALETTES),
      select("treatment", "Treatment", TREATMENTS[0], TREATMENTS),
      range("cell", "Cell", 11, 5, 26, 1, "px"),
      range("radius", "Scramble radius", 150, 30, 400, 5, "px"),
      range("fill", "Width fill", 0.86, 0.4, 1, 0.02),
    ],
    render: (v) => (
      <GlyphText
        text={str(v, "text", "TERMINAL")}
        className={BOX}
        textClassName={TYPE}
        charset={Math.max(0, CHARSETS.indexOf(str(v, "charset", CHARSETS[0])))}
        palette={Math.max(0, PALETTES.indexOf(str(v, "palette", PALETTES[0])))}
        treatment={Math.max(0, TREATMENTS.indexOf(str(v, "treatment", TREATMENTS[0])))}
        cell={num(v, "cell", 11)}
        radius={num(v, "radius", 150)}
        fill={num(v, "fill", 0.86)}
        hint="Drag through the grid"
      />
    ),
    code: (v) =>
      usage("GlyphText", {
        text: str(v, "text"),
        charset: Math.max(0, CHARSETS.indexOf(str(v, "charset", CHARSETS[0]))),
        palette: Math.max(0, PALETTES.indexOf(str(v, "palette", PALETTES[0]))),
        cell: num(v, "cell", 11),
        radius: num(v, "radius", 150),
      }),
  },
  {
    ...base("surface-lens", "LensText", "A headline refracted through a pointer-driven optical lens."),
    controls: [
      text("text", "Text", "REFRACT", 16),
      range("radius", "Lens radius", 170, 60, 420, 5, "px"),
      range("refract", "Refraction", 100, 0, 260, 5),
      range("ripple", "Speed ripple", 100, 0, 300, 5),
      range("fill", "Width fill", 0.86, 0.4, 1, 0.02),
      color("ink", "Ink", "#eef2ff"),
      color("glow", "Glow", "#f97316"),
    ],
    render: (v) => (
      <LensText
        text={str(v, "text", "REFRACT")}
        className={BOX}
        textClassName={TYPE}
        radius={num(v, "radius", 170)}
        refract={num(v, "refract", 100)}
        ripple={num(v, "ripple", 100)}
        fill={num(v, "fill", 0.86)}
        ink={rgb(v, "ink", "#eef2ff")}
        glow={rgb(v, "glow", "#f97316")}
        hint="Move the lens across the word"
      />
    ),
    code: (v) =>
      usage("LensText", {
        text: str(v, "text"),
        radius: num(v, "radius", 170),
        refract: num(v, "refract", 100),
        ripple: num(v, "ripple", 100),
      }),
  },
  {
    ...base("surface-shatter", "ShatterText", "Letterforms fractured into dimensional, reactive Voronoi shards."),
    controls: [
      text("text", "Text", "FRACTURE", 16),
      range("shards", "Shards", 220, 40, 700, 10),
      range("radius", "Pointer reach", 170, 40, 420, 5, "px"),
      range("force", "Force", 100, 0, 300, 5),
      range("spin", "Spin", 100, 0, 300, 5),
      range("spring", "Return spring", 60, 10, 200, 5),
      color("ink", "Ink", "#e8ecff"),
      color("hot", "Hot edge", "#f43f5e"),
    ],
    render: (v) => (
      <ShatterText
        text={str(v, "text", "FRACTURE")}
        className={BOX}
        textClassName={TYPE}
        shards={num(v, "shards", 220)}
        radius={num(v, "radius", 170)}
        force={num(v, "force", 100)}
        spin={num(v, "spin", 100)}
        spring={num(v, "spring", 60)}
        ink={rgb(v, "ink", "#e8ecff")}
        hot={rgb(v, "hot", "#f43f5e")}
        hint="Sweep through the letters"
      />
    ),
    code: (v) =>
      usage("ShatterText", {
        text: str(v, "text"),
        shards: num(v, "shards", 220),
        force: num(v, "force", 100),
        spin: num(v, "spin", 100),
      }),
  },
  {
    ...base("surface-fluid", "FluidText", "Type that dissolves into dye and continuously returns."),
    controls: [
      text("text", "Text", "DISSOLVE", 16),
      range("grid", "Sim grid", 192, 64, 384, 16),
      range("radius", "Splat radius", 120, 30, 320, 5, "px"),
      range("stir", "Stir", 100, 0, 300, 5),
      range("ink", "Re-ink", 100, 0, 300, 5),
      range("fade", "Dissipation", 100, 0, 300, 5),
      range("iterations", "Jacobi steps", 24, 4, 60, 2),
      color("cool", "Cool", "#0b2a4a"),
      color("mid", "Mid", "#2fa8d5"),
      color("hot", "Hot", "#f7f3d0"),
      color("inkColor", "Word", "#ffffff"),
    ],
    render: (v) => (
      <FluidText
        text={str(v, "text", "DISSOLVE")}
        className={BOX}
        textClassName={TYPE}
        grid={num(v, "grid", 192)}
        radius={num(v, "radius", 120)}
        stir={num(v, "stir", 100)}
        ink={num(v, "ink", 100)}
        fade={num(v, "fade", 100)}
        iterations={num(v, "iterations", 24)}
        cool={rgb(v, "cool", "#0b2a4a")}
        mid={rgb(v, "mid", "#2fa8d5")}
        hot={rgb(v, "hot", "#f7f3d0")}
        inkColor={rgb(v, "inkColor", "#ffffff")}
        hint="Stir the ink · the word keeps bleeding back in"
      />
    ),
    code: (v) =>
      usage("FluidText", {
        text: str(v, "text"),
        grid: num(v, "grid", 192),
        stir: num(v, "stir", 100),
        fade: num(v, "fade", 100),
      }),
  },
];
