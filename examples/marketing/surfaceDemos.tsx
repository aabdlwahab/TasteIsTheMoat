/**
 * The "WebGL animated text" section.
 *
 * Five surfaces that take a word and do something to it on the GPU. Each demo
 * exposes the same knobs the component takes and shows the exact JSX for the
 * current settings, so what you copy is what you are looking at.
 */
import { useState } from "react";
import { sitePath } from "../../src/core/sitePath";
import {
  CodeBlock,
  Container,
  FluidText,
  GlyphText,
  LensText,
  ParticleText,
  ShatterText,
} from "../../src/ui/index";
import {
  GLYPH_CHARSETS,
  GLYPH_PALETTES,
  GLYPH_TREATMENTS,
} from "../../src/core/surfaces/index";

/* ---- catalog metadata --------------------------------------------------- */

export const SURFACE_CATEGORY = "WebGL animated text" as const;

export interface SurfaceCatalogItem {
  name: string;
  description: string;
  demo: string;
}

export const SURFACE_ELEMENTS: SurfaceCatalogItem[] = [
  { name: "ParticleText", description: "A word as a GPU particle field that scatters from the pointer.", demo: "particle-text" },
  { name: "GlyphText", description: "The word resolved into a character grid that scrambles in your wake.", demo: "surface-glyphs" },
  { name: "LensText", description: "The word refracted through a lens that follows the pointer.", demo: "surface-lens" },
  { name: "ShatterText", description: "The word broken into Voronoi shards that scatter and spring back.", demo: "surface-shatter" },
  { name: "FluidText", description: "The word as dye in a fluid simulation you can stir.", demo: "surface-fluid" },
];

/* ---- catalog index ------------------------------------------------------ */

/**
 * The section's own front page.
 *
 * These are a family rather than a category: every one takes a word, rasters
 * it, and hands it to the GPU. They were listed inside the tactile-element
 * catalog for a while and read as an odd sub-heading there, so they get their
 * own door — a peer of the shader studio and the element catalog.
 */
export function SurfacesCatalog() {
  const blurbs: Record<string, string> = {
    ParticleText: "Transform feedback",
    GlyphText: "Character grid",
    LensText: "SDF refraction",
    ShatterText: "Voronoi shards",
    FluidText: "Navier–Stokes",
  };

  return (
    <main className="min-h-screen bg-ink-950 py-20">
      <Container>
        <a href={sitePath("/")} className="text-sm text-ink-400 transition-colors hover:text-ink-0">
          ← Back to the collection
        </a>
        <div className="mt-10 grid gap-8 border-b border-ink-700 pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
              WebGL animated text
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] tracking-[-0.055em] text-ink-0 sm:text-7xl">
              A word is a texture. Do something to it.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
              Each surface rasterises your text to an offscreen canvas and hands
              it to the GPU — as a particle field, a character grid, a lens, a
              pile of shards, or dye in a fluid. The real word stays in the DOM
              underneath, so the headline survives without WebGL2.
            </p>
          </div>
          <div className="rounded-full border border-brand-400/30 bg-brand-500/10 px-5 py-3 font-mono text-sm text-brand-200">
            {SURFACE_ELEMENTS.length} surfaces
          </div>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SURFACE_ELEMENTS.map((item, index) => (
            <li key={item.name}>
              <a
                href={`?s=${item.demo}`}
                className="group flex h-full min-h-52 flex-col rounded-2xl border border-ink-700 bg-ink-850 p-6 transition-[border-color,transform,background-color] hover:-translate-y-1 hover:border-brand-400/70 hover:bg-ink-800"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] text-ink-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-300/70">
                    {blurbs[item.name]}
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-semibold tracking-tight text-ink-0">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">
                  {item.description}
                </p>
                <span className="mt-auto pt-6 text-xs font-semibold text-brand-300 transition-transform group-hover:translate-x-1">
                  Open demo →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}

/* ---- shell -------------------------------------------------------------- */

function SurfaceDemo({
  name,
  description,
  code,
  controls,
  children,
}: {
  name: string;
  description: string;
  code: string;
  controls: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-ink-950 py-16 sm:py-20">
      <Container>
        <a href="?s=webgl-text" className="text-sm text-ink-400 transition-colors hover:text-ink-0">
          ← All WebGL text surfaces
        </a>
        <div className="mt-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
            WebGL animated text
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-0.045em] text-ink-0 sm:text-6xl">
            {name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-300">{description}</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-ink-700 bg-ink-850/70 p-6 sm:p-10">
          {children}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{controls}</div>
        </div>

        <div className="mt-8">
          <CodeBlock value={code} label="Usage — reflects the settings above" language="tsx" />
        </div>
      </Container>
    </main>
  );
}

function Slider({
  label, value, set, min, max, step = 1,
}: {
  label: string; value: number; set: (n: number) => void;
  min: number; max: number; step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.16em] text-ink-500">
        {label}
        <span className="tabular-nums text-ink-200">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="w-full accent-brand-400"
      />
    </label>
  );
}

function TextInput({ value, set }: { value: string; set: (s: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-ink-500">Text</span>
      <input
        value={value}
        maxLength={24}
        spellCheck={false}
        onChange={(e) => set(e.target.value)}
        className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-[15px] text-ink-0 outline-none focus:border-brand-400"
      />
    </label>
  );
}

function Chips({
  label, options, value, set,
}: {
  label: string; options: readonly string[]; value: number; set: (i: number) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-ink-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o, i) => (
          <button
            key={o}
            type="button"
            onClick={() => set(i)}
            className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${
              i === value
                ? "bg-brand-500 text-black"
                : "bg-white/10 text-ink-300 hover:bg-white/20"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Renders a prop list as JSX, dropping anything left at its default. */
function usage(
  component: string,
  props: Record<string, string | number | boolean | undefined>,
) {
  const lines = Object.entries(props)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) =>
      typeof v === "string" ? `  ${k}="${v}"`
      : typeof v === "boolean" ? `  ${k}`
      : `  ${k}={${v}}`,
    );
  return `<${component}\n${lines.join("\n")}\n/>`;
}

const SURFACE_BOX = "h-[26rem] rounded-2xl bg-[#06070d]";
const SURFACE_TEXT = "text-[clamp(2.5rem,10vw,6rem)]";

/* ---- demos -------------------------------------------------------------- */

function ParticleDemo() {
  const [text, setText] = useState("INTERFACE");
  const [radius, setRadius] = useState(150);
  const [force, setForce] = useState(2800);
  const [spring, setSpring] = useState(45);

  return (
    <SurfaceDemo
      name="ParticleText"
      description="A word rasterised into tens of thousands of particles, simulated on the GPU with WebGL2 transform feedback. The pointer pushes them out; a spring pulls them home."
      code={usage("ParticleText", {
        text, radius, force, spring,
        className: "h-[26rem]",
        hint: "Move the cursor across the letters",
      })}
      controls={
        <>
          <TextInput value={text} set={setText} />
          <Slider label="Cursor reach" value={radius} set={setRadius} min={40} max={420} step={5} />
          <Slider label="Push force" value={force} set={setForce} min={400} max={9000} step={100} />
          <Slider label="Return spring" value={spring} set={setSpring} min={6} max={140} />
        </>
      }
    >
      <ParticleText
        text={text}
        className={SURFACE_BOX}
        textClassName={SURFACE_TEXT}
        radius={radius}
        force={force}
        spring={spring}
        hint="Move the cursor across the letters · click to burst"
      />
    </SurfaceDemo>
  );
}

function GlyphDemo() {
  const [text, setText] = useState("TERMINAL");
  const [charset, setCharset] = useState(0);
  const [palette, setPalette] = useState(0);
  const [treatment, setTreatment] = useState(0);
  const [cell, setCell] = useState(11);
  const [radius, setRadius] = useState(150);

  return (
    <SurfaceDemo
      name="GlyphText"
      description="Each cell samples the glyph coverage beneath it and picks a character by brightness. The pointer writes into a decaying scramble field, so the word dissolves into noise and resolves again behind you. Six treatments, ten charsets, six palettes."
      code={usage("GlyphText", {
        text, charset, palette, treatment, cell, radius,
        className: "h-[26rem]",
      })}
      controls={
        <>
          <TextInput value={text} set={setText} />
          <Slider label="Cell" value={cell} set={setCell} min={6} max={26} />
          <Slider label="Scramble reach" value={radius} set={setRadius} min={40} max={420} step={5} />
          <div />
          <Chips label="Charset" options={GLYPH_CHARSETS.map((c) => c.name)} value={charset} set={setCharset} />
          <Chips label="Palette" options={GLYPH_PALETTES.map((c) => c.name)} value={palette} set={setPalette} />
          <Chips label="Treatment" options={GLYPH_TREATMENTS} value={treatment} set={setTreatment} />
        </>
      }
    >
      <GlyphText
        text={text}
        className={SURFACE_BOX}
        textClassName={SURFACE_TEXT}
        charset={charset}
        palette={palette}
        treatment={treatment}
        cell={cell}
        radius={radius}
        hint="Sweep the cells · they resolve back"
      />
    </SurfaceDemo>
  );
}

function LensDemo() {
  const [text, setText] = useState("REFRACT");
  const [radius, setRadius] = useState(190);
  const [refract, setRefract] = useState(100);
  const [ripple, setRipple] = useState(100);

  return (
    <SurfaceDemo
      name="LensText"
      description="One full-screen pass. The glyph texture is sampled through a displaced UV — three times at slightly different offsets, so the channels separate into chromatic fringing where the glass bends hardest. Move slowly to refract, fast to ripple."
      code={usage("LensText", {
        text, radius, refract, ripple,
        className: "h-[26rem]",
      })}
      controls={
        <>
          <TextInput value={text} set={setText} />
          <Slider label="Reach" value={radius} set={setRadius} min={40} max={520} step={5} />
          <Slider label="Refraction" value={refract} set={setRefract} min={0} max={260} step={5} />
          <Slider label="Ripple" value={ripple} set={setRipple} min={0} max={300} step={5} />
        </>
      }
    >
      <LensText
        text={text}
        className={SURFACE_BOX}
        textClassName={SURFACE_TEXT}
        radius={radius}
        refract={refract}
        ripple={ripple}
        hint="Move slowly to refract · fast to ripple"
      />
    </SurfaceDemo>
  );
}

function ShatterDemo() {
  const [text, setText] = useState("FRACTURE");
  const [shards, setShards] = useState(120);
  const [radius, setRadius] = useState(180);
  const [force, setForce] = useState(2800);
  const [spin, setSpin] = useState(100);
  const [spring, setSpring] = useState(32);

  return (
    <SurfaceDemo
      name="ShatterText"
      description="The Voronoi diagram is rasterised, not solved per-pixel: every seed draws a cone and the depth test keeps the nearest, so one pass produces the whole diagram at any shard count. Each shard then moves as a rigid body and the glyph travels with it."
      code={usage("ShatterText", {
        text, shards, radius, force, spin, spring,
        className: "h-[26rem]",
      })}
      controls={
        <>
          <TextInput value={text} set={setText} />
          <Slider label="Shards" value={shards} set={setShards} min={12} max={255} />
          <Slider label="Reach" value={radius} set={setRadius} min={40} max={520} step={5} />
          <Slider label="Force" value={force} set={setForce} min={400} max={9000} step={100} />
          <Slider label="Spin" value={spin} set={setSpin} min={0} max={300} step={5} />
          <Slider label="Return" value={spring} set={setSpring} min={4} max={120} />
        </>
      }
    >
      <ShatterText
        text={text}
        className={SURFACE_BOX}
        textClassName={SURFACE_TEXT}
        shards={shards}
        radius={radius}
        force={force}
        spin={spin}
        spring={spring}
        hint="Sweep through to break the shards loose"
      />
    </SurfaceDemo>
  );
}

function FluidDemo() {
  const [text, setText] = useState("DISSOLVE");
  const [grid, setGrid] = useState(512);
  const [radius, setRadius] = useState(150);
  const [stir, setStir] = useState(100);
  const [ink, setInk] = useState(100);
  const [fade, setFade] = useState(18);
  const [iterations, setIterations] = useState(20);

  return (
    <SurfaceDemo
      name="FluidText"
      description="A semi-Lagrangian Navier–Stokes solver: advect, add forces, then project the velocity field divergence-free with a Jacobi pressure solve. The word is a continuous dye source, so it keeps bleeding back in after you stir it away."
      code={usage("FluidText", {
        text, grid, radius, stir, ink, fade, iterations,
        className: "h-[26rem]",
      })}
      controls={
        <>
          <TextInput value={text} set={setText} />
          <Slider label="Sim grid" value={grid} set={setGrid} min={128} max={768} step={32} />
          <Slider label="Splat size" value={radius} set={setRadius} min={40} max={420} step={5} />
          <Slider label="Stir" value={stir} set={setStir} min={10} max={300} step={5} />
          <Slider label="Ink rate" value={ink} set={setInk} min={0} max={300} step={5} />
          <Slider label="Dissipation" value={fade} set={setFade} min={2} max={120} />
          <Slider label="Pressure iters" value={iterations} set={setIterations} min={4} max={40} />
        </>
      }
    >
      <FluidText
        text={text}
        className={SURFACE_BOX}
        textClassName={SURFACE_TEXT}
        grid={grid}
        radius={radius}
        stir={stir}
        ink={ink}
        fade={fade}
        iterations={iterations}
        hint="Stir the ink · the word keeps bleeding back in"
      />
    </SurfaceDemo>
  );
}

/* ---- registry ----------------------------------------------------------- */

export const SURFACE_DEMOS: Record<string, () => React.ReactNode> = {
  "webgl-text": () => <SurfacesCatalog />,
  "particle-text": () => <ParticleDemo />,
  "surface-glyphs": () => <GlyphDemo />,
  "surface-lens": () => <LensDemo />,
  "surface-shatter": () => <ShatterDemo />,
  "surface-fluid": () => <FluidDemo />,
};
