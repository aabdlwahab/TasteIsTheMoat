/**
 * The GPU lab, one technique per card.
 *
 * These are not React components — they are standalone WebGL2 pages with their
 * own control panel, FPS meter, and mode switching, authored to run from a
 * file:// URL with no build step. So the workbench frames them rather than
 * re-implementing them.
 *
 * But a bench is five or six unrelated techniques behind one door. Physarum and
 * reaction–diffusion share a file because they share a ping-pong texture setup,
 * which is an implementation detail, not a reason for someone hunting for a
 * boids simulation to have to guess it lives inside "GPGPU". Each technique
 * gets its own card and deep-links straight to itself with `?mode=`.
 */
import { sitePath } from "../../core/sitePath";
import type { Work } from "../types";

interface Bench {
  /** Slug used in work ids. */
  key: string;
  name: string;
  file: string;
  technique: string;
  /** How the bench's own panel is reached, for the note on the panel. */
  modeCount: number;
  modes: Mode[];
}

interface Mode {
  /** Gallery slug, and the bench's own mode id unless `benchMode` overrides. */
  id: string;
  name: string;
  description: string;
  /**
   * The bench's `MODES` id to open on, when the card is not about the mode.
   * The Post bench is the case: its subject is the styliser, and the mode is
   * only the scene the styliser is applied to.
   */
  benchMode?: string;
  /** Extra query for benches whose subject is not the mode list. */
  query?: string;
}

const BENCHES: Bench[] = [
  {
    key: "fragment",
    name: "Fragment",
    file: "01-fragment.html",
    technique: "One pass, no geometry",
    modeCount: 6,
    modes: [
      { id: "sdf", name: "Raymarched SDF", description: "Solid form built by marching a ray against a distance function — no mesh, no vertices, just maths per pixel." },
      { id: "warp", name: "Domain warping", description: "Noise sampled through noise, until the field folds into something that looks weathered rather than generated." },
      { id: "kifs", name: "Kaleidoscopic IFS", description: "Space folded against itself over and over, so a handful of transforms produce endless ornamental structure." },
      { id: "truchet", name: "Truchet tiling", description: "One tile, rotated at random, resolving into continuous curves that never repeat visibly." },
      { id: "caustics", name: "Caustics", description: "The bright web light casts through moving water, computed from the pixel's own coordinate." },
      { id: "feedback", name: "Feedback zoom", description: "The only one here with a memory: last frame is sampled, scaled, and fed back in." },
    ],
  },
  {
    key: "gpgpu",
    name: "GPGPU",
    file: "02-gpgpu.html",
    technique: "State in textures",
    modeCount: 6,
    modes: [
      { id: "physarum", name: "Physarum", description: "Millions of agents laying and following a trail map, converging on the transport networks slime mould builds." },
      { id: "rd", name: "Reaction–diffusion", description: "Two chemicals, one feeding on the other — the Gray–Scott system that grows spots, stripes, and coral." },
      { id: "boids", name: "Boids", description: "Separation, alignment, cohesion. Three local rules, and a flock nobody choreographed." },
      { id: "nbody", name: "N-body gravity", description: "Every particle pulled by every other, integrated on the GPU into filaments and collapsing clusters." },
      { id: "sand", name: "Falling sand", description: "A cellular automaton where grains fall, pile, and slide — state advanced entirely in a texture." },
      { id: "lenia", name: "Lenia", description: "Continuous Conway: smooth kernels over a smooth grid, producing organisms that glide and divide." },
    ],
  },
  {
    key: "geometry",
    name: "Geometry",
    file: "03-geometry.html",
    technique: "One draw call",
    modeCount: 3,
    modes: [
      { id: "grass", name: "Instanced grass", description: "A field built from one blade and an instance id, bent by wind computed in the vertex shader." },
      { id: "terrain", name: "Displaced terrain", description: "A flat grid pushed into landscape by sampling height at each vertex — geometry from a function." },
      { id: "ribbons", name: "Ribbon trails", description: "Strips whose vertices follow a flow field, so the mesh itself carries the motion." },
    ],
  },
  {
    key: "post",
    name: "Post",
    file: "04-post.html",
    technique: "Stacked passes",
    modeCount: 4,
    // Each styliser is shown on the scene that gives it the most to work with:
    // broad colour fields for the ones that reorganise colour, a hard-edged
    // solid for the one that crushes it, moving tiles for the one that needs
    // motion to estimate.
    modes: [
      { id: "kuwahara", name: "Kuwahara filter", description: "An edge-preserving blur that reads as oil paint: flat regions, hard boundaries, visible brush direction.", benchMode: "warp", query: "style=kuwahara" },
      { id: "dither", name: "Ordered dither", description: "Colour crushed to a handful of levels through a Bayer matrix — the look of a screen that could not afford gradients.", benchMode: "sdf", query: "style=dither" },
      { id: "sort", name: "Pixel sort", description: "Rows sorted within a luminance band, on the GPU, every frame — the glitch that became a genre.", benchMode: "warp", query: "style=sort" },
      { id: "flow", name: "Optical flow", description: "Motion estimated between frames and used to smear the image along its own movement.", benchMode: "sdf", query: "style=flow" },
    ],
  },
  {
    key: "holographic",
    name: "Holography",
    file: "05-holographic.html",
    technique: "Spectral colour",
    modeCount: 5,
    modes: [
      { id: "card", name: "Holographic card", description: "A trading-card surface where the shimmer comes from wavelength interference rather than a rainbow gradient." },
      { id: "foil", name: "Iridescent foil", description: "Thin-film interference over crumpled foil — colour that changes with the angle you look from." },
      { id: "grating", name: "Diffraction grating", description: "Light split into its spectrum by a ruled surface, the physics behind every CD rainbow." },
      { id: "projection", name: "Projected volume", description: "A volume accumulated along the view ray, so the form reads as light rather than surface." },
      { id: "bubble", name: "Soap film", description: "Interference across a film of varying thickness, drifting as the film thins and drains." },
    ],
  },
];

function Bench({ href, title }: { href: string; title: string }) {
  return (
    <iframe
      src={sitePath(href)}
      title={title}
      className="h-full w-full border-0"
      loading="lazy"
    />
  );
}

function workFor(bench: Bench, mode: Mode): Work {
  const query = `?mode=${mode.benchMode ?? mode.id}${mode.query ? `&${mode.query}` : ""}`;
  const href = `/gpu-lab/${bench.file}${query}`;
  const title = `${mode.name} — GPU lab`;

  return {
    id: `gpu-${bench.key}-${mode.id}`,
    name: mode.name,
    group: "GPU lab",
    kind: bench.name,
    description: mode.description,
    fit: "fill",
    href,
    panelNote: `${bench.technique}. This is one of ${bench.modeCount} techniques in the standalone ${bench.name} bench, which brings its own control panel, parameters, and FPS meter inside the frame — that panel is the set of tweaks.`,
    controls: [],
    render: () => <Bench href={href} title={title} />,
    // On the page the bench is a background, so `bare` drops its panel, its menu
    // tab and its back link — the parts that make sense in a preview and read as
    // someone else's debug UI over a headline.
    renderApplied: () => <Bench href={`${href}&bare=1`} title={title} />,
  };
}

export const gpuWorks: Work[] = BENCHES.flatMap((bench) =>
  bench.modes.map((mode) => workFor(bench, mode)),
);
