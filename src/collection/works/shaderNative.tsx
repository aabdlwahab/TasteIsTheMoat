/**
 * Shader-native elements — components whose whole job is to put a running
 * shader somewhere other than a full-bleed background: inside glyphs, behind a
 * card, in an orb, along a divider.
 *
 * They all take a shader id, so every one of them gets the full picker.
 */
import {
  BorderBeam,
  Button,
  NoiseOverlay,
  ShaderCard,
  ShaderDivider,
  ShaderOrb,
  ShaderSection,
  ShaderText,
  SpotlightCard,
  SpotlightGrid,
} from "../../ui/index";
import { shaderList } from "../../shaders/index";
import type { ScrimStrength } from "../../ui/ShaderSection";
import type { Work } from "../types";
import { bool, num, range, select, shaderSelect, str, text, toggle, usage } from "../types";

const SHADER_IDS = shaderList.map((shader) => shader.id);
const GROUP = "Shader-native";

function base(
  id: string,
  name: string,
  description: string,
): Pick<Work, "id" | "name" | "group" | "kind" | "description"> {
  return { id, name, group: GROUP, kind: "Shader-native", description };
}

export const shaderNativeWorks: Work[] = [
  {
    ...base("shader-section", "ShaderSection", "A page section with a shader background, a scrim, and graceful failure."),
    fit: "fill",
    controls: [
      shaderSelect(SHADER_IDS, "mesh-gradient"),
      select("scrim", "Scrim", "medium", ["none", "subtle", "medium", "strong"]),
      range("dpr", "Resolution", 1.5, 0.5, 2, 0.25, "×"),
      toggle("fadeBottom", "Fade into next section", false),
      text("headline", "Headline", "Motion with a reason", 40),
    ],
    render: (v) => (
      <ShaderSection
        as="div"
        shader={str(v, "shader", "mesh-gradient")}
        scrim={str(v, "scrim", "medium") as ScrimStrength}
        maxDpr={num(v, "dpr", 1.5)}
        fadeBottom={bool(v, "fadeBottom")}
        className="h-full w-full"
        contentClassName="grid h-full place-items-center px-8 text-center"
      >
        <div>
          <h3 className="font-serif text-4xl tracking-[-0.04em] text-white sm:text-5xl">
            {str(v, "headline")}
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70">
            The scrim between shader and copy is the difference between a
            background and an accessibility problem.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="secondary">Secondary</Button>
          </div>
        </div>
      </ShaderSection>
    ),
    code: (v) =>
      usage("ShaderSection", {
        shader: str(v, "shader"),
        scrim: str(v, "scrim"),
        maxDpr: num(v, "dpr", 1.5),
        fadeBottom: bool(v, "fadeBottom") || undefined,
      }, "{/* content */}"),
  },
  {
    ...base("shader-text", "ShaderText", "A living shader clipped directly into headline glyphs."),
    fit: "center",
    controls: [
      shaderSelect(SHADER_IDS, "holo-foil"),
      text("text", "Text", "UNFORGETTABLE", 18),
      range("size", "Size", 6, 2, 11, 0.25, "rem"),
      range("fps", "Texture FPS", 30, 6, 60, 1),
    ],
    render: (v) => (
      <ShaderText
        shader={str(v, "shader", "holo-foil")}
        fps={num(v, "fps", 30)}
        className="text-center font-serif font-semibold leading-none tracking-[-0.05em]"
      >
        <span style={{ fontSize: `${num(v, "size", 6)}rem` }}>{str(v, "text")}</span>
      </ShaderText>
    ),
    code: (v) =>
      usage("ShaderText", { shader: str(v, "shader"), fps: num(v, "fps", 30) }, str(v, "text")),
  },
  {
    ...base("shader-card", "ShaderCard", "A shader-backed card that wakes only when it is touched."),
    fit: "center",
    controls: [
      shaderSelect(SHADER_IDS, "oil-slick"),
      range("rest", "Rest opacity", 0.35, 0, 1, 0.05),
      range("hover", "Hover opacity", 0.9, 0, 1, 0.05),
      range("count", "Cards", 2, 1, 3),
    ],
    render: (v) => (
      <div
        className="grid w-full max-w-4xl gap-4"
        style={{ gridTemplateColumns: `repeat(${num(v, "count", 2)}, minmax(0,1fr))` }}
      >
        {["Atmosphere", "Attention", "Authorship"].slice(0, num(v, "count", 2)).map((title) => (
          <ShaderCard
            key={title}
            shader={str(v, "shader", "oil-slick")}
            restOpacity={num(v, "rest", 0.35)}
            hoverOpacity={num(v, "hover", 0.9)}
            className="min-h-56"
          >
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Hover or focus the card — the shader only runs when someone is
              actually looking at it.
            </p>
          </ShaderCard>
        ))}
      </div>
    ),
    code: (v) =>
      usage("ShaderCard", {
        shader: str(v, "shader"),
        restOpacity: num(v, "rest", 0.35),
        hoverOpacity: num(v, "hover", 0.9),
      }, "{/* card content */}"),
  },
  {
    ...base("shader-orb", "ShaderOrb", "Circle, blob, and squircle shader accents."),
    fit: "center",
    controls: [
      shaderSelect(SHADER_IDS, "metaballs"),
      select("shape", "Shape", "blob", ["circle", "blob", "squircle"]),
      range("size", "Size", 320, 120, 460, 10, "px"),
      toggle("feather", "Feather edge", true),
      toggle("glow", "Glow", true),
    ],
    render: (v) => (
      <ShaderOrb
        shader={str(v, "shader", "metaballs")}
        shape={str(v, "shape", "blob") as "circle" | "blob" | "squircle"}
        size={`${num(v, "size", 320)}px`}
        feather={bool(v, "feather", true)}
        glow={bool(v, "glow", true)}
      />
    ),
    code: (v) =>
      usage("ShaderOrb", {
        shader: str(v, "shader"),
        shape: str(v, "shape"),
        size: `${num(v, "size", 320)}px`,
        feather: bool(v, "feather", true),
        glow: bool(v, "glow", true),
      }),
  },
  {
    ...base("shader-divider", "ShaderDivider", "A feathered ribbon of motion between sections."),
    fit: "center",
    controls: [
      shaderSelect(SHADER_IDS, "aurora"),
      range("height", "Height", 140, 40, 320, 10, "px"),
      toggle("feather", "Feather edges", true),
      toggle("flip", "Flip", false),
    ],
    render: (v) => (
      <div className="w-full">
        <p className="px-8 pb-6 text-center text-sm text-ink-400">Section above</p>
        <ShaderDivider
          shader={str(v, "shader", "aurora")}
          height={`${num(v, "height", 140)}px`}
          feather={bool(v, "feather", true)}
          flip={bool(v, "flip")}
        />
        <p className="px-8 pt-6 text-center text-sm text-ink-400">Section below</p>
      </div>
    ),
    code: (v) =>
      usage("ShaderDivider", {
        shader: str(v, "shader"),
        height: `${num(v, "height", 140)}px`,
        feather: bool(v, "feather", true),
        flip: bool(v, "flip") || undefined,
      }),
  },
  {
    ...base("spotlight-grid", "SpotlightGrid + SpotlightCard", "One pointer-follow spotlight shared across a card grid."),
    fit: "center",
    controls: [range("radius", "Glow radius", 320, 80, 700, 10, "px"), range("cards", "Cards", 4, 2, 6)],
    render: (v) => (
      <SpotlightGrid radius={num(v, "radius", 320)} className="w-full max-w-4xl sm:grid-cols-2">
        {["Edit before you add", "Motion needs a reason", "Opinionated defaults", "Ship a point of view", "Remove the safe option", "Stop at enough"]
          .slice(0, num(v, "cards", 4))
          .map((title) => (
            <SpotlightCard key={title}>
              <h3 className="text-base font-semibold text-ink-0">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">
                Move the pointer across the grid — one light, shared by all of them.
              </p>
            </SpotlightCard>
          ))}
      </SpotlightGrid>
    ),
    code: (v) => usage("SpotlightGrid", { radius: num(v, "radius", 320) }, "<SpotlightCard>…</SpotlightCard>"),
  },
  {
    ...base("border-beam", "BorderBeam", "A precise light circuit travelling around a quiet frame."),
    fit: "center",
    controls: [
      range("duration", "Circuit", 8, 1, 24, 0.5, "s"),
      range("width", "Border", 1.5, 1, 6, 0.5, "px"),
    ],
    render: (v) => (
      <BorderBeam
        duration={num(v, "duration", 8)}
        width={num(v, "width", 1.5)}
        className="w-full max-w-md"
        contentClassName="p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">Pro</p>
        <p className="mt-3 font-serif text-3xl text-ink-0">One light, one loop.</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">
          Pure CSS — no canvas, no JavaScript, and it stops under reduced motion.
        </p>
      </BorderBeam>
    ),
    code: (v) =>
      usage("BorderBeam", { duration: num(v, "duration", 8), width: num(v, "width", 1.5) }, "{/* content */}"),
  },
  {
    ...base("noise-overlay", "NoiseOverlay", "Subtle grain that unifies flat and animated surfaces."),
    fit: "fill",
    controls: [range("opacity", "Opacity", 0.05, 0, 0.3, 0.005)],
    render: (v) => (
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(120deg,#1b1410,#3a1d10_45%,#0d1418)]">
        <NoiseOverlay opacity={num(v, "opacity", 0.05)} />
        <div className="relative grid h-full place-items-center px-8 text-center">
          <p className="max-w-md font-serif text-3xl leading-tight text-white/90">
            Grain is what stops a flat gradient from looking like a screenshot.
          </p>
        </div>
      </div>
    ),
    code: (v) => usage("NoiseOverlay", { opacity: num(v, "opacity", 0.05) }),
  },
];
