/**
 * The "GPU Lab" section.
 *
 * Unlike everything else in the catalog, the four benches are not React
 * components — they are standalone WebGL2 pages with their own control panel,
 * FPS meter, keyboard shortcuts and mode cycling, served verbatim from
 * `public/gpu-lab/`. They were authored to run from a file:// URL with no
 * build step, and rewriting eighteen techniques into components would lose
 * the lab itself, which is the point of them.
 *
 * So this is a front page in the site's own voice that hands off to them.
 */
import { sitePath } from "../../src/core/sitePath";
import { Container } from "../../src/ui/index";

export const GPU_LAB_CATEGORY = "GPU Lab" as const;

export interface Bench {
  n: string;
  name: string;
  href: string;
  technique: string;
  count: string;
  description: string;
  modes: string[];
}

export const GPU_LAB_BENCHES: Bench[] = [
  {
    n: "01",
    name: "Fragment",
    href: "/gpu-lab/01-fragment.html",
    technique: "One pass, no geometry",
    count: "6 modes",
    description:
      "A single full-screen pass and — bar the last one — no state at all. Everything on screen is computed from the pixel's own coordinate.",
    modes: [
      "raymarched SDF",
      "domain warping",
      "kaleidoscopic IFS",
      "truchet tiling",
      "caustics",
      "feedback zoom",
    ],
  },
  {
    n: "02",
    name: "GPGPU",
    href: "/gpu-lab/02-gpgpu.html",
    technique: "State in textures",
    count: "6 modes",
    description:
      "State lives in textures and is advanced by ping-pong. Agents in one half, grids in the other; nothing is simulated on the CPU.",
    modes: [
      "physarum",
      "reaction–diffusion",
      "boids",
      "n-body gravity",
      "falling sand",
      "lenia",
    ],
  },
  {
    n: "03",
    name: "Geometry",
    href: "/gpu-lab/03-geometry.html",
    technique: "Built from an index",
    count: "3 modes",
    description:
      "Vertex-shader worlds built from nothing but a vertex index — no meshes, no attributes. One draw call each.",
    modes: ["instanced grass", "displaced terrain", "ribbon trails"],
  },
  {
    n: "04",
    name: "Post",
    href: "/gpu-lab/04-post.html",
    technique: "Camera stack",
    count: "6 stages",
    description:
      "A camera stack you can point at four procedural sources or your webcam. Bloom, depth of field, tonemap and grain, then a styliser on top.",
    modes: [
      "bloom + DOF",
      "kuwahara",
      "ordered dither",
      "pixel sort",
      "optical flow",
      "webcam source",
    ],
  },
];

/**
 * The section's front page. A peer of the shader studio and the text
 * surfaces, rather than a category inside either.
 */
export function GpuLabCatalog() {
  const total = GPU_LAB_BENCHES.reduce(
    (sum, b) => sum + Number.parseInt(b.count, 10),
    0,
  );

  return (
    <main className="min-h-screen bg-ink-950 py-20">
      <Container>
        <a
          href={sitePath("/")}
          className="text-sm text-ink-400 transition-colors hover:text-ink-0"
        >
          ← Back to the collection
        </a>

        <div className="mt-10 grid gap-8 border-b border-ink-700 pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
              GPU Lab
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] tracking-[-0.055em] text-ink-0 sm:text-7xl">
              Four benches, one core.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
              Each bench is a standalone WebGL2 page — the same full-screen-pass
              and ping-pong plumbing, the same camera stack, a different set of
              techniques on top. They open straight from disk with no build
              step, and they are the one part of this collection meant to be
              read rather than imported.
            </p>
          </div>
          <div className="rounded-full border border-brand-400/30 bg-brand-500/10 px-5 py-3 font-mono text-sm text-brand-200">
            {total} techniques
          </div>
        </div>

        <ul className="mt-12 grid gap-4 lg:grid-cols-2">
          {GPU_LAB_BENCHES.map((bench) => (
            <li key={bench.n}>
              <a
                href={sitePath(bench.href)}
                className="group flex h-full flex-col rounded-2xl border border-ink-700 bg-ink-850 p-7 transition-[border-color,transform,background-color] hover:-translate-y-1 hover:border-brand-400/70 hover:bg-ink-800"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-ink-500">{bench.n}</span>
                  <span className="text-xl font-semibold tracking-tight text-ink-0">
                    {bench.name}
                  </span>
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-brand-300/70">
                    {bench.count}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                  {bench.technique}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-400">
                  {bench.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {bench.modes.map((mode) => (
                    <li
                      key={mode}
                      className="rounded-md bg-white/5 px-2 py-1 font-mono text-[10px] text-ink-300"
                    >
                      {mode}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto pt-6 text-xs font-semibold text-brand-300 transition-transform group-hover:translate-x-1">
                  Open the bench →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-10 border-t border-ink-800 pt-6 font-mono text-xs leading-relaxed text-ink-500">
          Inside any bench:{" "}
          <kbd className="rounded border border-ink-700 px-1 text-ink-300">H</kbd> panel ·{" "}
          <kbd className="rounded border border-ink-700 px-1 text-ink-300">R</kbd> reset ·{" "}
          <kbd className="rounded border border-ink-700 px-1 text-ink-300">Space</kbd> pause ·{" "}
          <kbd className="rounded border border-ink-700 px-1 text-ink-300">[</kbd>
          <kbd className="rounded border border-ink-700 px-1 text-ink-300">]</kbd> cycle modes ·
          drag to interact.
        </p>
      </Container>
    </main>
  );
}
