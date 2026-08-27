/**
 * The experimental pack: living controls, physical cards, kinetic type,
 * spatial canvases, and reactive media.
 *
 * These are the pieces people actually come here for, so each one gets its own
 * entry and its own stage rather than being grouped five-to-a-page the way the
 * old catalog did it.
 */
import {
  AudioReactiveShader,
  CodeComparison,
  DirectionAwareCard,
  DraggableCardPile,
  EncryptedText,
  FlippingTextBoard,
  GooeyDropdown,
  ImageTrailCursor,
  InfiniteCanvas,
  IsometricFeatureBoxes,
  KineticTypeRibbon,
  LensReveal,
  LinkPreview,
  MagneticButton,
  Marquee3D,
  MorphingDialog,
  MorphingNotch,
  PathMorph,
  PixelDitherReveal,
  ProgressiveBlur,
  ScrollCardStack,
  ScrollScrubVideo,
  SegmentedControl,
  SquigglyText,
  TypeMaskReveal,
  VanishingInput,
  WebcamPixelGrid,
  WetPaintButton,
} from "../../ui/index";
import type { Work } from "../types";
import { bool, num, range, select, str, text, toggle, usage } from "../types";

/** Neutral placeholder art, so no demo needs a network image. */
function Tile({ className = "", label }: { className?: string; label?: string }) {
  return (
    <div className={`grid aspect-[4/3] place-items-center p-5 text-sm font-semibold text-white ${className}`}>
      {label}
    </div>
  );
}

const TILES = [
  "bg-gradient-to-br from-indigo-600 to-violet-500",
  "bg-gradient-to-br from-cyan-500 to-blue-700",
  "bg-gradient-to-br from-orange-400 to-rose-600",
  "bg-gradient-to-br from-emerald-500 to-teal-800",
  "bg-gradient-to-br from-fuchsia-500 to-purple-800",
  "bg-gradient-to-br from-amber-400 to-orange-700",
];

const PATH_SETS: Record<string, string[]> = {
  Geometric: [
    "M10 10 L90 10 L90 90 L10 90 Z",
    "M50 5 L95 50 L50 95 L5 50 Z",
    "M20 5 L80 5 L95 80 L5 80 Z",
  ],
  Organic: [
    "M50 8 C82 8 92 32 92 52 C92 78 70 94 50 94 C28 94 8 76 8 52 C8 30 20 8 50 8 Z",
    "M50 12 C78 4 96 30 88 56 C80 84 54 96 34 88 C10 78 4 44 18 26 C28 14 38 16 50 12 Z",
    "M50 6 C74 14 94 28 88 54 C82 82 58 96 36 90 C12 82 6 52 14 32 C20 16 34 2 50 6 Z",
  ],
  Marks: [
    "M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z",
    "M50 12 C70 12 88 30 88 50 C88 70 70 88 50 88 C30 88 12 70 12 50 C12 30 30 12 50 12 Z",
    "M14 20 L86 20 L86 46 L58 46 L58 84 L42 84 L42 46 L14 46 Z",
  ],
};

function base(
  id: string,
  name: string,
  kind: string,
  description: string,
): Pick<Work, "id" | "name" | "group" | "kind" | "description"> {
  return { id, name, group: "Experimental", kind, description };
}

/* ---- living controls ----------------------------------------------------- */

const controlWorks: Work[] = [
  {
    ...base("magnetic-button", "MagneticButton", "Controls", "A CTA that leans toward the pointer, then snaps cleanly home."),
    fit: "center",
    controls: [text("label", "Label", "Start building"), range("strength", "Pull", 0.35, 0, 1, 0.05)],
    render: (v) => (
      <MagneticButton strength={num(v, "strength", 0.35)}>{str(v, "label")}</MagneticButton>
    ),
    code: (v) => usage("MagneticButton", { strength: num(v, "strength", 0.35) }, str(v, "label")),
  },
  {
    ...base("wet-paint-button", "WetPaintButton", "Controls", "Liquid colour rises through the button on interaction."),
    fit: "center",
    controls: [text("label", "Label", "Wet paint")],
    render: (v) => <WetPaintButton>{str(v, "label")}</WetPaintButton>,
    code: (v) => usage("WetPaintButton", {}, str(v, "label")),
  },
  {
    ...base("gooey-dropdown", "GooeyDropdown", "Controls", "A compact menu with connected, elastic options."),
    fit: "center",
    controls: [text("label", "Trigger", "Gooey menu", 20), range("count", "Options", 3, 2, 5)],
    render: (v) => (
      <GooeyDropdown
        label={str(v, "label")}
        options={["Create", "Duplicate", "Archive", "Export", "Delete"]
          .slice(0, num(v, "count", 3))
          .map((label) => ({ label, value: label.toLowerCase() }))}
      />
    ),
    code: (v) => usage("GooeyDropdown", { label: str(v, "label") }),
  },
  {
    ...base("vanishing-input", "VanishingInput", "Controls", "Rotating prompts dissolve as the visitor begins typing."),
    fit: "center",
    controls: [text("first", "First prompt", "Search components…", 36), range("count", "Prompts", 3, 1, 4)],
    render: (v) => (
      <div className="w-full max-w-lg">
        <VanishingInput
          placeholders={[
            str(v, "first", "Search components…"),
            "Find a hero…",
            "Try “kinetic text”",
            "Ask for a shader…",
          ].slice(0, num(v, "count", 3))}
        />
      </div>
    ),
    code: () => `<VanishingInput\n  placeholders={["Search components…", "Find a hero…"]}\n/>`,
  },
  {
    ...base("code-comparison", "CodeComparison", "Controls", "A draggable before-and-after code reveal."),
    fit: "center",
    controls: [text("before", "Before label", "Before", 16), text("after", "After label", "After", 16)],
    render: (v) => (
      <div className="w-full max-w-3xl">
        <CodeComparison
          beforeLabel={str(v, "before", "Before")}
          afterLabel={str(v, "after", "After")}
          before={`const hero = new Shader();\nhero.mount(canvas);\nhero.resize();\nhero.play();\nwindow.addEventListener("resize", resize);`}
          after={`<Hero\n  shader="aurora"\n  brand={brand}\n  headline="Ready to ship."\n/>`}
        />
      </div>
    ),
    code: (v) => usage("CodeComparison", { beforeLabel: str(v, "before"), afterLabel: str(v, "after") }),
  },
  {
    ...base("link-preview", "LinkPreview", "Controls", "Hover and focus previews for contextual links."),
    fit: "center",
    controls: [text("label", "Link text", "project link", 24)],
    render: (v) => (
      <p className="max-w-md text-center text-lg leading-relaxed text-ink-300">
        Hover this{" "}
        <LinkPreview
          href="#"
          // A span, not a div: this sits inside a paragraph, and a block-level
          // preview would be invalid nesting the browser silently reparents.
          preview={<span className="block aspect-[16/9] rounded-lg bg-[radial-gradient(circle_at_25%_25%,#4f46e5,transparent_38%),#11131b]" />}
        >
          {str(v, "label")}
        </LinkPreview>{" "}
        to see where it goes before you commit.
      </p>
    ),
    code: (v) => usage("LinkPreview", { href: "/work" }, str(v, "label")),
  },
];

/* ---- physical cards ------------------------------------------------------ */

const cardWorks: Work[] = [
  {
    ...base("morphing-dialog", "MorphingDialog", "Physical cards", "A compact card that expands into a focused reading surface."),
    fit: "center",
    controls: [text("title", "Title", "Project Meridian", 32), text("cta", "Card CTA", "Open the project →", 28)],
    render: (v) => (
      <div className="w-full max-w-sm">
        <MorphingDialog
          title={str(v, "title")}
          description="The compact card becomes the reading surface."
          trigger={
            <div className="p-6">
              <div className="aspect-[16/10] rounded-xl bg-[radial-gradient(circle_at_70%_25%,#22d3ee,transparent_38%),#111827]" />
              <h3 className="mt-5 font-semibold text-ink-0">{str(v, "title")}</h3>
              <p className="mt-2 text-sm text-ink-400">{str(v, "cta")}</p>
            </div>
          }
        >
          <div className="aspect-[16/8] rounded-2xl bg-[radial-gradient(circle_at_25%_30%,#4f46e5,transparent_35%),radial-gradient(circle_at_75%_65%,#22d3ee,transparent_38%),#0d111b]" />
          <p className="mt-6 leading-relaxed text-ink-300">
            Morphing dialogs preserve context: the thing you clicked visibly
            becomes the place where you continue reading.
          </p>
        </MorphingDialog>
      </div>
    ),
    code: (v) => usage("MorphingDialog", { title: str(v, "title") }, "{/* expanded content */}"),
  },
  {
    ...base("direction-aware-card", "DirectionAwareCard", "Physical cards", "Its overlay enters from the same edge as the pointer."),
    fit: "center",
    controls: [text("reveal", "Overlay copy", "The overlay follows your arrival.", 44)],
    render: (v) => (
      <DirectionAwareCard
        className="min-h-72 w-full max-w-md border border-ink-700 bg-ink-850"
        reveal={
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-white/65">Direction aware</p>
            <p className="mt-3 text-xl font-semibold">{str(v, "reveal")}</p>
          </div>
        }
      >
        <div className="grid min-h-72 place-items-center bg-[radial-gradient(circle_at_center,#7c3aed,transparent_34%),#11131b]">
          <span className="text-sm text-white/65">Enter from any edge</span>
        </div>
      </DirectionAwareCard>
    ),
    code: () => `<DirectionAwareCard reveal={<Overlay />}>\n  {/* resting content */}\n</DirectionAwareCard>`,
  },
  {
    ...base("lens-reveal", "LensReveal", "Physical cards", "A movable lens exposes the detail layer beneath."),
    fit: "center",
    controls: [range("size", "Lens size", 180, 80, 380, 10, "px")],
    render: (v) => (
      <LensReveal
        className="min-h-72 w-full max-w-md"
        size={num(v, "size", 180)}
        base={<div className="min-h-72 bg-[linear-gradient(135deg,#171a24,#312e81)]" />}
        detail={
          <div className="min-h-72 bg-[radial-gradient(circle_at_center,#fff_0_2px,#22d3ee_3px_5px,#4f46e5_6px_9px,#07080c_10px)] bg-[length:24px_24px]" />
        }
      />
    ),
    code: (v) => usage("LensReveal", { size: num(v, "size", 180) }),
  },
  {
    ...base("draggable-card-pile", "DraggableCardPile", "Physical cards", "Overlapping cards that can be picked up and rearranged."),
    fit: "center",
    controls: [range("count", "Cards", 3, 2, 5)],
    render: (v) => (
      <div className="w-full max-w-sm">
        <DraggableCardPile
          items={["Strategy", "Identity", "Launch", "Research", "Retention"]
            .slice(0, num(v, "count", 3))
            .map((label, index) => ({
              id: label,
              rotation: [-6, 4, -1, 7, -4][index],
              content: <Tile className={TILES[index]} label={label} />,
            }))}
        />
      </div>
    ),
    code: () => `<DraggableCardPile\n  items={[{ id: "one", rotation: -6, content: <Card /> }]}\n/>`,
  },
  {
    ...base("scroll-card-stack", "ScrollCardStack", "Physical cards", "Narrative cards pin and accumulate through the scroll."),
    fit: "flow",
    controls: [range("count", "Cards", 3, 2, 5)],
    render: (v) => (
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <p className="pb-8 text-center text-sm text-ink-500">Scroll inside the stage ↓</p>
        <ScrollCardStack
          items={["Frame the idea", "Build the system", "Launch the story", "Measure the response", "Keep it alive"]
            .slice(0, num(v, "count", 3))
            .map((item, index) => (
              <div
                key={item}
                className="grid min-h-64 place-items-center bg-[radial-gradient(circle_at_center,rgba(99,102,241,.26),transparent_42%),#12141c] p-8 text-center text-2xl font-semibold text-ink-0"
              >
                <span>
                  <span className="text-brand-300">0{index + 1}</span> {item}
                </span>
              </div>
            ))}
        />
      </div>
    ),
    code: () => `<ScrollCardStack items={[<Card />, <Card />, <Card />]} />`,
  },
  {
    ...base("isometric-feature-boxes", "IsometricFeatureBoxes", "Physical cards", "Feature blocks arranged as a dimensional system."),
    fit: "center",
    controls: [range("count", "Boxes", 5, 3, 6), range("interval", "Cycle", 3200, 1200, 6000, 100, "ms")],
    render: (v) => (
      <div className="w-full max-w-3xl">
        <IsometricFeatureBoxes
          interval={num(v, "interval", 3200)}
          items={[
            { title: "Collect", description: "Pull every signal into one layer." },
            { title: "Connect", description: "Map evidence to the decision." },
            { title: "Ship", description: "Turn the plan into a release." },
            { title: "Learn", description: "Measure the response." },
            { title: "Repeat", description: "Keep the system alive." },
            { title: "Edit", description: "Remove what stopped earning its place." },
          ].slice(0, num(v, "count", 5))}
        />
      </div>
    ),
    code: (v) => usage("IsometricFeatureBoxes", { interval: num(v, "interval", 3200) }),
  },
];

/* ---- kinetic type -------------------------------------------------------- */

const typeWorks: Work[] = [
  {
    ...base("kinetic-type-ribbon", "KineticTypeRibbon", "Kinetic type", "Oversized type that responds to scroll direction and velocity."),
    fit: "center",
    controls: [
      text("text", "Text", "KINETIC SYSTEM", 24),
      range("repeat", "Repeats", 4, 2, 10),
      select("direction", "Direction", "left", ["left", "right"]),
    ],
    render: (v) => (
      <KineticTypeRibbon
        className="w-full"
        text={str(v, "text", "KINETIC SYSTEM")}
        repeat={num(v, "repeat", 4)}
        direction={str(v, "direction", "left") as "left" | "right"}
      />
    ),
    code: (v) =>
      usage("KineticTypeRibbon", {
        text: str(v, "text"),
        repeat: num(v, "repeat", 4),
        direction: str(v, "direction"),
      }),
  },
  {
    ...base("encrypted-text", "EncryptedText", "Kinetic type", "Copy resolves from randomized encrypted characters."),
    fit: "center",
    controls: [
      text("text", "Text", "CONFIDENTIAL SIGNAL", 28),
      range("duration", "Resolve", 1.2, 0.3, 4, 0.1, "s"),
      select("trigger", "Trigger", "mount", ["mount", "hover"]),
    ],
    render: (v) => (
      <EncryptedText
        className="block text-center text-3xl font-semibold text-emerald-300"
        text={str(v, "text")}
        duration={num(v, "duration", 1.2)}
        trigger={str(v, "trigger", "mount") as "mount" | "hover"}
      />
    ),
    code: (v) =>
      usage("EncryptedText", {
        text: str(v, "text"),
        duration: num(v, "duration", 1.2),
        trigger: str(v, "trigger"),
      }),
  },
  {
    ...base("flipping-text-board", "FlippingTextBoard", "Kinetic type", "A mechanical split-flap word rotator."),
    fit: "center",
    controls: [
      text("words", "Words (comma separated)", "RIYADH, LONDON, TOKYO, ONLINE", 60),
      range("interval", "Hold", 2200, 700, 5000, 100, "ms"),
    ],
    render: (v) => (
      <FlippingTextBoard
        className="text-3xl"
        interval={num(v, "interval", 2200)}
        words={str(v, "words", "RIYADH")
          .split(",")
          .map((word) => word.trim())
          .filter(Boolean)}
      />
    ),
    code: (v) => usage("FlippingTextBoard", { interval: num(v, "interval", 2200) }),
  },
  {
    ...base("squiggly-text", "SquigglyText", "Kinetic type", "Per-character elastic type for hover and focus."),
    fit: "center",
    controls: [text("text", "Text", "WOBBLE ON HOVER", 24), range("amplitude", "Amplitude", 8, 1, 24, 1, "px")],
    render: (v) => (
      <SquigglyText
        text={str(v, "text")}
        amplitude={num(v, "amplitude", 8)}
        className="text-4xl font-semibold text-ink-0"
      />
    ),
    code: (v) => usage("SquigglyText", { text: str(v, "text"), amplitude: num(v, "amplitude", 8) }),
  },
  {
    ...base("path-morph", "PathMorph", "Kinetic type", "Caller-provided shapes transition through an SVG path loop."),
    fit: "center",
    controls: [
      select("set", "Shape set", "Geometric", Object.keys(PATH_SETS)),
      range("duration", "Hold", 2.4, 0.6, 6, 0.2, "s"),
      range("size", "Size", 200, 90, 340, 10, "px"),
    ],
    render: (v) => (
      <div style={{ width: num(v, "size", 200), height: num(v, "size", 200) }}>
        <PathMorph
          className="size-full text-brand-400"
          paths={PATH_SETS[str(v, "set", "Geometric")] ?? PATH_SETS.Geometric}
          duration={num(v, "duration", 2.4)}
        />
      </div>
    ),
    code: (v) => usage("PathMorph", { duration: num(v, "duration", 2.4) }),
  },
  {
    ...base("type-mask-reveal", "TypeMaskReveal", "Kinetic type", "Light travelling through type as a moving mask."),
    fit: "center",
    controls: [text("text", "Text", "Light moving through type.", 40)],
    render: (v) => (
      <p className="max-w-2xl text-center text-5xl font-semibold leading-tight">
        <TypeMaskReveal>{str(v, "text")}</TypeMaskReveal>
      </p>
    ),
    code: (v) => usage("TypeMaskReveal", {}, str(v, "text")),
  },
];

/* ---- spatial ------------------------------------------------------------- */

const spatialWorks: Work[] = [
  {
    ...base("morphing-notch", "MorphingNotch", "Spatial", "A compact command surface that reshapes around its content."),
    fit: "center",
    controls: [select("position", "Position", "top", ["top", "bottom"]), range("count", "Panels", 3, 2, 3)],
    render: (v) => (
      <MorphingNotch
        position={str(v, "position", "top") as "top" | "bottom"}
        items={[
          { label: "Search", content: <VanishingInput placeholders={["Search components…", "Find a hero…"]} /> },
          {
            label: "Theme",
            content: (
              <SegmentedControl
                options={[
                  { label: "Midnight", value: "midnight" },
                  { label: "Electric", value: "electric" },
                ]}
              />
            ),
          },
          { label: "Ship", content: <p className="text-sm text-white/70">The current collection is ready to export.</p> },
        ].slice(0, num(v, "count", 3))}
      />
    ),
    code: (v) => usage("MorphingNotch", { position: str(v, "position") }),
  },
  {
    ...base("image-trail-cursor", "ImageTrailCursor", "Spatial", "Pointer movement leaves a fading trail of visual cards."),
    fit: "fill",
    controls: [range("distance", "Spacing", 90, 30, 260, 5, "px"), range("count", "Tiles", 3, 2, 6)],
    render: (v) => (
      <ImageTrailCursor
        className="grid h-full w-full place-items-center bg-ink-900"
        distance={num(v, "distance", 90)}
        items={TILES.slice(0, num(v, "count", 3)).map((tile, index) => (
          <Tile key={index} className={tile} />
        ))}
      >
        <p className="text-xl font-semibold text-ink-0">Move your cursor through the field</p>
      </ImageTrailCursor>
    ),
    code: (v) => usage("ImageTrailCursor", { distance: num(v, "distance", 90) }, "{/* label */}"),
  },
  {
    ...base("infinite-canvas", "InfiniteCanvas", "Spatial", "A draggable world for portfolios and visual archives."),
    fit: "fill",
    controls: [range("count", "Items", 4, 2, 6), range("height", "World height", 760, 400, 1400, 20, "px")],
    render: (v) => (
      <div className="h-full w-full [&>*]:!h-full">
        <InfiniteCanvas
          className="h-full"
          height={num(v, "height", 760)}
          items={[
            { id: "a", x: 120, y: 120, label: "Research lab" },
            { id: "b", x: 520, y: 260, label: "Spatial portfolio" },
            { id: "c", x: 940, y: 90, label: "Product launch" },
            { id: "d", x: 350, y: 610, label: "Data story" },
            { id: "e", x: 820, y: 520, label: "Identity system" },
            { id: "f", x: 60, y: 430, label: "Campaign" },
          ]
            .slice(0, num(v, "count", 4))
            .map((item, index) => ({
              id: item.id,
              x: item.x,
              y: item.y,
              content: <Tile className={TILES[index]} label={item.label} />,
            }))}
        />
      </div>
    ),
    code: () => `<InfiniteCanvas\n  items={[{ id: "a", x: 120, y: 120, content: <Card /> }]}\n/>`,
  },
  {
    ...base("marquee-3d", "Marquee3D", "Spatial", "A perspective rail that turns flat tiles into a spatial wall."),
    fit: "center",
    controls: [range("duration", "Loop", 24, 6, 60, 1, "s"), toggle("reverse", "Reverse", false)],
    render: (v) => (
      <Marquee3D
        className="w-full"
        duration={num(v, "duration", 24)}
        reverse={bool(v, "reverse")}
        items={["Kinetic", "Spatial", "Reactive", "Generative"].map((item, index) => (
          <Tile key={item} className={TILES[index]} label={item} />
        ))}
      />
    ),
    code: (v) =>
      usage("Marquee3D", { duration: num(v, "duration", 24), reverse: bool(v, "reverse") || undefined }),
  },
  {
    ...base("progressive-blur", "ProgressiveBlur", "Spatial", "Layered blur suggests content continuing beyond a frame."),
    fit: "center",
    controls: [
      select("edge", "Edge", "bottom", ["top", "bottom", "left", "right"]),
      range("size", "Depth", 40, 10, 80, 2, "%"),
    ],
    render: (v) => (
      <ProgressiveBlur
        edge={str(v, "edge", "bottom") as "top" | "bottom" | "left" | "right"}
        size={num(v, "size", 40)}
        className="h-64 w-full max-w-xl rounded-3xl border border-ink-700 bg-ink-850 p-8"
      >
        <p className="text-3xl font-semibold leading-tight text-ink-0">
          Progressive blur makes content feel like it continues past the frame
          instead of being cut off by it.
        </p>
      </ProgressiveBlur>
    ),
    code: (v) => usage("ProgressiveBlur", { edge: str(v, "edge"), size: num(v, "size", 40) }, "{/* content */}"),
  },
];

/* ---- reactive media ------------------------------------------------------ */

const mediaWorks: Work[] = [
  {
    ...base("pixel-dither-reveal", "PixelDitherReveal", "Reactive media", "A dithered cover that clears to reveal the media beneath."),
    fit: "center",
    controls: [text("label", "Label", "Reveal", 20)],
    render: (v) => (
      <div className="w-full max-w-lg">
        <PixelDitherReveal label={str(v, "label", "Reveal")}>
          <div className="aspect-[3/2] bg-[radial-gradient(circle_at_30%_30%,#a855f7,transparent_34%),radial-gradient(circle_at_70%_65%,#22d3ee,transparent_36%),#0b0c13]" />
        </PixelDitherReveal>
      </div>
    ),
    code: (v) => usage("PixelDitherReveal", { label: str(v, "label") }, "{/* media */}"),
  },
  {
    ...base("scroll-scrub-video", "ScrollScrubVideo", "Reactive media", "Scroll position drives a video or a supplied frame sequence."),
    fit: "flow",
    controls: [range("height", "Scroll length", 620, 300, 1400, 20, "px"), range("frames", "Frames", 4, 2, 4)],
    render: (v) => (
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <p className="pb-6 text-center text-sm text-ink-500">Scroll inside the stage ↓</p>
        <ScrollScrubVideo
          height={num(v, "height", 620)}
          frames={[
            <div key="1" className="size-full bg-[radial-gradient(circle_at_20%_30%,#4f46e5,transparent_35%),#0b0c13]" />,
            <div key="2" className="size-full bg-[radial-gradient(circle_at_45%_45%,#a855f7,transparent_38%),#0b0c13]" />,
            <div key="3" className="size-full bg-[radial-gradient(circle_at_70%_55%,#22d3ee,transparent_35%),#0b0c13]" />,
            <div key="4" className="size-full bg-[radial-gradient(circle_at_80%_70%,#f97316,transparent_38%),#0b0c13]" />,
          ].slice(0, num(v, "frames", 4))}
        />
      </div>
    ),
    code: (v) => usage("ScrollScrubVideo", { height: num(v, "height", 620) }),
  },
  {
    ...base("audio-reactive-shader", "AudioReactiveShader", "Reactive media", "An opt-in microphone visual driven by live audio energy."),
    fit: "center",
    controls: [range("bars", "Bars", 48, 8, 96, 2)],
    render: (v) => (
      <div className="w-full max-w-xl">
        <AudioReactiveShader bars={num(v, "bars", 48)} />
      </div>
    ),
    code: (v) => usage("AudioReactiveShader", { bars: num(v, "bars", 48) }),
  },
  {
    ...base("webcam-pixel-grid", "WebcamPixelGrid", "Reactive media", "An opt-in camera feed transformed into a graphic mosaic."),
    fit: "center",
    controls: [range("columns", "Columns", 48, 12, 96, 2)],
    render: (v) => (
      <div className="w-full max-w-xl">
        <WebcamPixelGrid columns={num(v, "columns", 48)} />
      </div>
    ),
    code: (v) => usage("WebcamPixelGrid", { columns: num(v, "columns", 48) }),
  },
];

export const experimentalWorks: Work[] = [
  ...controlWorks,
  ...cardWorks,
  ...typeWorks,
  ...spatialWorks,
  ...mediaWorks,
];
