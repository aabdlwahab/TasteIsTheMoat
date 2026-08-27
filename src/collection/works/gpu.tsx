/**
 * The GPU lab.
 *
 * Unlike everything else here these are not React components — they are
 * standalone WebGL2 pages with their own control panel, FPS meter, and mode
 * cycling, authored to run from a file:// URL with no build step. So the
 * workbench frames them rather than re-implementing them, and their own panel
 * inside the frame is the set of tweaks.
 */
import { sitePath } from "../../core/sitePath";
import type { Work } from "../types";

function Bench({ file, name, bare }: { file: string; name: string; bare?: boolean }) {
  return (
    <iframe
      src={sitePath(`/gpu-lab/${file}${bare ? "?bare=1" : ""}`)}
      title={`${name} — GPU bench`}
      className="h-full w-full border-0"
      loading="lazy"
    />
  );
}

interface Bench {
  id: string;
  name: string;
  file: string;
  technique: string;
  description: string;
  modes: string[];
}

const BENCHES: Bench[] = [
  {
    id: "fragment",
    name: "Fragment",
    file: "01-fragment.html",
    technique: "One pass, no geometry",
    description: "A single full-screen pass and — bar the last one — no state at all. Everything on screen is computed from the pixel's own coordinate.",
    modes: ["raymarched SDF", "domain warping", "kaleidoscopic IFS", "truchet tiling", "caustics", "feedback zoom"],
  },
  {
    id: "gpgpu",
    name: "GPGPU",
    file: "02-gpgpu.html",
    technique: "State in textures",
    description: "State lives in textures and is advanced by ping-pong. Agents in one half, grids in the other; nothing is simulated on the CPU.",
    modes: ["physarum", "reaction–diffusion", "boids", "n-body gravity", "falling sand", "lenia"],
  },
  {
    id: "geometry",
    name: "Geometry",
    file: "03-geometry.html",
    technique: "One draw call",
    description: "Vertex-shader worlds built from nothing but an index and a single draw call.",
    modes: ["particle mesh", "instanced field", "curl flow", "displacement", "point cloud", "ribbons"],
  },
  {
    id: "post",
    name: "Post",
    file: "04-post.html",
    technique: "Stacked passes",
    description: "Bloom, depth of field, grain, dither, optical flow, and a live camera stack composed as post-processing.",
    modes: ["bloom", "depth of field", "grain", "dither", "optical flow", "camera"],
  },
  {
    id: "holographic",
    name: "Holography",
    file: "05-holographic.html",
    technique: "Spectral colour",
    description: "Interference, thin films, and diffraction — colour computed from wavelength rather than picked from a ramp.",
    modes: ["thin film", "diffraction grating", "interference", "spectral caustics", "iridescent foil", "hologram"],
  },
];

export const gpuWorks: Work[] = BENCHES.map((bench) => ({
  id: `gpu-${bench.id}`,
  name: bench.name,
  group: "GPU lab",
  kind: "GPU study",
  description: bench.description,
  fit: "fill",
  href: `/gpu-lab/${bench.file}`,
  panelNote: `${bench.technique}. This bench is a standalone WebGL2 page and carries its own control panel, FPS meter, and mode cycling inside the frame — ${bench.modes.length} modes: ${bench.modes.join(", ")}.`,
  controls: [],
  render: () => <Bench file={bench.file} name={bench.name} />,
  // On the page the bench is a background, so `bare` drops its panel, its menu
  // tab and its back link — the parts that make sense in a preview and read as
  // someone else's debug UI over a headline.
  renderApplied: () => <Bench file={bench.file} name={bench.name} bare />,
}));
