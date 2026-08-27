/**
 * The motion collection — 33 components from the `taste-is-the-moat/motion`
 * subpath, each with the props that upstream exposes as transitions and
 * springs reduced to plain numbers.
 *
 * Anything that animates on mount (TextEffect, TextScramble, AnimatedGroup)
 * relies on the workbench's Replay control to run again; that is cheaper and
 * more honest than every demo growing its own "play" button.
 */
import { useRef } from "react";
import { BrandMark } from "../../ui/index";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedBackground,
  AnimatedGroup,
  AnimatedNumber,
  BorderTrail,
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
  CarouselNavigation,
  Cursor,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
  Dock,
  DockIcon,
  DockItem,
  DockLabel,
  GlowEffect,
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
  InView,
  InfiniteSlider,
  Magnetic,
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContent,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
  ProgressiveBlur,
  ScrollProgress,
  SlidingNumber,
  SpinningText,
  Spotlight,
  TextEffect,
  TextLoop,
  TextMorph,
  TextRoll,
  TextScramble,
  TextShimmer,
  TextShimmerWave,
  Tilt,
  ToolbarDynamic,
  ToolbarExpandable,
  TransitionPanel,
} from "../../ui/motion/index";
import type { GlowBlur, GlowMode } from "../../ui/motion/index";
import type { Work } from "../types";
import { bool, num, range, select, str, text, toggle, usage } from "../types";

const DOT = (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

function Swatch({ label, from, to }: { label: string; from: string; to: string }) {
  return (
    <div
      className="grid aspect-[8/5] place-items-center p-6 text-lg font-semibold text-white"
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {label}
    </div>
  );
}

function swatchDataUri(from: string, to: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><text x="40" y="90" font-family="sans-serif" font-size="52" font-weight="700" fill="white">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function base(
  id: string,
  name: string,
  kind: string,
  description: string,
): Pick<Work, "id" | "name" | "group" | "kind" | "description"> {
  return { id: `mp-${id}`, name, group: "Motion", kind, description };
}

/** ScrollProgress needs something to scroll; give it its own container. */
function ScrollProgressDemo({ height, cards }: { height: number; cards: number }) {
  const container = useRef<HTMLDivElement>(null);
  return (
    <div className="w-full max-w-xl">
      <ScrollProgress containerRef={container} className="h-1.5 rounded-full" />
      <div
        ref={container}
        className="mt-4 space-y-4 overflow-y-auto rounded-2xl border border-ink-700 bg-ink-900/60 p-4"
        style={{ height }}
      >
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="grid h-28 place-items-center rounded-xl border border-ink-700 bg-ink-850 text-sm text-ink-400">
            Card {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export const motionWorks: Work[] = [
  {
    ...base("accordion", "Accordion", "Motion core", "One-at-a-time disclosure that animates without measuring pixel heights."),
    fit: "center",
    controls: [range("duration", "Duration", 0.3, 0.05, 1.2, 0.05, "s"), select("open", "Open first", "a", ["a", "b", "c", "none"])],
    render: (v) => {
      const open = str(v, "open", "a");
      return (
        <Accordion
          className="w-full max-w-xl divide-y divide-ink-700"
          duration={num(v, "duration", 0.3)}
          defaultExpandedValue={open === "none" ? null : open}
        >
          {[
            { value: "a", title: "How is the height animated?", body: "With a grid-template-rows transition from 0fr to 1fr, so content can change size while open." },
            { value: "b", title: "Is it controllable?", body: "Pass expandedValue and onValueChange for controlled use." },
            { value: "c", title: "What about reduced motion?", body: "The transition is dropped and the panel snaps open." },
          ].map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger className="py-4 text-ink-0">
                <span className="font-medium">{item.title}</span>
                <span aria-hidden="true" className="text-ink-400">+</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-ink-300">
                {item.body}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    },
    code: (v) => usage("Accordion", { duration: num(v, "duration", 0.3), defaultExpandedValue: str(v, "open") }),
  },
  {
    ...base("animated-background", "AnimatedBackground", "Motion core", "A single highlight that slides between tabs, nav items, or toggles."),
    fit: "center",
    controls: [range("duration", "Travel", 0.3, 0.05, 1, 0.05, "s"), toggle("hover", "Track hover", false)],
    render: (v) => (
      <AnimatedBackground
        className="rounded-lg bg-brand-500/25"
        duration={num(v, "duration", 0.3)}
        enableHover={bool(v, "hover")}
        defaultValue="Overview"
      >
        {["Overview", "Analytics", "Reports", "Settings"].map((tab) => (
          <button
            key={tab}
            data-id={tab}
            type="button"
            className="px-4 py-2 text-sm text-ink-200 transition-colors data-[checked=true]:text-ink-0"
          >
            {tab}
          </button>
        ))}
      </AnimatedBackground>
    ),
    code: (v) =>
      usage("AnimatedBackground", { duration: num(v, "duration", 0.3), enableHover: bool(v, "hover") || undefined }),
  },
  {
    ...base("animated-group", "AnimatedGroup", "Motion core", "Staggered entrance for a list, with five presets."),
    fit: "center",
    controls: [
      select("preset", "Preset", "blur-slide", ["fade", "slide", "scale", "blur", "blur-slide"]),
      range("stagger", "Stagger", 0.08, 0, 0.4, 0.01, "s"),
      range("delay", "Delay", 0, 0, 1, 0.05, "s"),
      range("duration", "Duration", 0.4, 0.1, 1.5, 0.05, "s"),
      range("items", "Items", 8, 2, 12),
    ],
    render: (v) => (
      <AnimatedGroup
        preset={str(v, "preset", "blur-slide") as never}
        stagger={num(v, "stagger", 0.08)}
        delay={num(v, "delay", 0)}
        duration={num(v, "duration", 0.4)}
        className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {Array.from({ length: num(v, "items", 8) }, (_, index) => (
          <div key={index} className="grid h-24 place-items-center rounded-xl border border-ink-700 bg-ink-800 text-ink-300">
            {index + 1}
          </div>
        ))}
      </AnimatedGroup>
    ),
    code: (v) =>
      usage("AnimatedGroup", {
        preset: str(v, "preset"),
        stagger: num(v, "stagger", 0.08),
        duration: num(v, "duration", 0.4),
      }, "{/* children */}"),
  },
  {
    ...base("border-trail", "BorderTrail", "Motion core", "One light walking the perimeter of any positioned element."),
    fit: "center",
    controls: [range("size", "Light size", 80, 10, 220, 5, "px"), range("duration", "Circuit", 6, 1, 20, 0.5, "s")],
    render: (v) => (
      <div className="relative grid h-48 w-72 place-items-center overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
        <BorderTrail size={num(v, "size", 80)} duration={num(v, "duration", 6)} />
        <span className="relative font-mono text-sm text-ink-300">size {num(v, "size", 80)}</span>
      </div>
    ),
    code: (v) => usage("BorderTrail", { size: num(v, "size", 80), duration: num(v, "duration", 6) }),
  },
  {
    ...base("carousel", "Carousel", "Motion core", "Draggable slides with arrows, indicators, and shared context."),
    fit: "center",
    controls: [
      range("duration", "Slide", 0.4, 0.05, 1.2, 0.05, "s"),
      toggle("drag", "Draggable", true),
      toggle("arrows", "Always show arrows", true),
    ],
    render: (v) => (
      <div className="w-full max-w-lg">
        <Carousel duration={num(v, "duration", 0.4)} disableDrag={!bool(v, "drag", true)}>
          <CarouselContent className="rounded-2xl">
            {[
              { label: "Strategy", from: "#4f46e5", to: "#7c3aed" },
              { label: "Identity", from: "#0891b2", to: "#2563eb" },
              { label: "Launch", from: "#f97316", to: "#e11d48" },
              { label: "Growth", from: "#059669", to: "#0d9488" },
            ].map((slide) => (
              <CarouselItem key={slide.label}>
                <Swatch {...slide} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNavigation alwaysShow={bool(v, "arrows", true)} />
          <CarouselIndicator />
        </Carousel>
      </div>
    ),
    code: (v) => usage("Carousel", { duration: num(v, "duration", 0.4), disableDrag: !bool(v, "drag", true) || undefined }),
  },
  {
    ...base("cursor", "Cursor", "Motion core", "A custom pointer that trails the real one, on fine pointers only."),
    fit: "fill",
    controls: [text("label", "Label", "have a look", 20)],
    render: (v) => (
      <div className="relative grid h-full w-full place-items-center bg-ink-900">
        <Cursor attachToParent>
          <div className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-black">
            {str(v, "label")}
          </div>
        </Cursor>
        <p className="text-ink-400">Move the pointer inside this area.</p>
      </div>
    ),
    code: () => `<Cursor attachToParent>\n  <Badge>have a look</Badge>\n</Cursor>`,
  },
  {
    ...base("dialog", "Dialog", "Motion core", "A modal with focus trap, Escape, and scroll lock built in."),
    fit: "center",
    controls: [range("duration", "Duration", 0.25, 0.05, 1, 0.05, "s")],
    render: (v) => (
      <Dialog duration={num(v, "duration", 0.25)}>
        <DialogTrigger className="rounded-lg bg-ink-0 px-5 py-2.5 font-semibold text-ink-950">
          Open dialog
        </DialogTrigger>
        <DialogContent>
          <DialogClose />
          <DialogHeader>
            <DialogTitle>Focus stays inside</DialogTitle>
            <DialogDescription>
              Tab cycles within the panel, Escape closes it, body scroll is
              locked, and focus returns to the trigger on close.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    ),
    code: (v) => usage("Dialog", { duration: num(v, "duration", 0.25) }, "{/* trigger + content */}"),
  },
  {
    ...base("disclosure", "Disclosure", "Motion core", "A single show/hide region — accordion without the exclusivity."),
    fit: "center",
    controls: [range("duration", "Duration", 0.3, 0.05, 1.2, 0.05, "s"), toggle("open", "Open by default", false)],
    render: (v) => (
      <div className="w-full max-w-xl space-y-3">
        {["Shipping and returns", "Materials", "Care instructions"].map((title, index) => (
          <Disclosure
            key={title}
            duration={num(v, "duration", 0.3)}
            defaultOpen={bool(v, "open") && index === 0}
            className="rounded-xl border border-ink-700 bg-ink-900 px-5"
          >
            <DisclosureTrigger className="flex items-center justify-between py-4 text-ink-0">
              <span className="font-medium">{title}</span>
              <span aria-hidden="true" className="text-ink-400">↓</span>
            </DisclosureTrigger>
            <DisclosureContent className="pb-4 text-sm leading-relaxed text-ink-300">
              Each disclosure keeps its own state, so more than one can be open.
            </DisclosureContent>
          </Disclosure>
        ))}
      </div>
    ),
    code: (v) => usage("Disclosure", { duration: num(v, "duration", 0.3) }, "{/* trigger + content */}"),
  },
  {
    ...base("in-view", "InView", "Motion core", "Animates between two plain CSS states on entering the viewport."),
    fit: "flow",
    controls: [
      range("duration", "Duration", 0.5, 0.1, 1.6, 0.05, "s"),
      range("delay", "Delay", 0, 0, 1, 0.05, "s"),
      toggle("once", "Only once", true),
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-lg space-y-6 px-6 py-10">
        <p className="text-sm text-ink-500">Scroll inside the stage ↓</p>
        {Array.from({ length: 6 }, (_, index) => (
          <InView
            key={index}
            duration={num(v, "duration", 0.5)}
            delay={num(v, "delay", 0)}
            once={bool(v, "once", true)}
            variants={{
              hidden: { opacity: 0, transform: "translateY(40px) scale(0.96)" },
              visible: { opacity: 1, transform: "translateY(0) scale(1)" },
            }}
            viewOptions={{ threshold: 0.4 }}
          >
            <div className="grid h-40 place-items-center rounded-2xl border border-ink-700 bg-ink-900 text-ink-300">
              Card {index + 1}
            </div>
          </InView>
        ))}
      </div>
    ),
    code: (v) => usage("InView", { duration: num(v, "duration", 0.5), once: bool(v, "once", true) }, "{/* child */}"),
  },
  {
    ...base("infinite-slider", "InfiniteSlider", "Motion core", "A rail specified in pixels per second, in either axis."),
    fit: "center",
    controls: [
      range("speed", "Speed", 60, 5, 240, 5, "px/s"),
      range("hover", "Speed on hover", 20, 0, 240, 5, "px/s"),
      range("gap", "Gap", 24, 0, 80, 2, "px"),
      select("direction", "Direction", "horizontal", ["horizontal", "vertical"]),
      toggle("reverse", "Reverse", false),
    ],
    render: (v) => {
      const chips = ["Vercel", "Linear", "Raycast", "Supabase", "Resend", "Clerk"];
      const vertical = str(v, "direction", "horizontal") === "vertical";
      return (
        <div className={vertical ? "h-64 w-full max-w-xs overflow-hidden" : "w-full"}>
          <InfiniteSlider
            gap={num(v, "gap", 24)}
            speed={num(v, "speed", 60)}
            speedOnHover={num(v, "hover", 20)}
            direction={vertical ? "vertical" : "horizontal"}
            reverse={bool(v, "reverse")}
          >
            {chips.map((chip) => (
              <span
                key={chip}
                className="block rounded-full border border-ink-700 bg-ink-800 px-5 py-2 text-sm text-ink-200"
              >
                {chip}
              </span>
            ))}
          </InfiniteSlider>
        </div>
      );
    },
    code: (v) =>
      usage("InfiniteSlider", {
        gap: num(v, "gap", 24),
        speed: num(v, "speed", 60),
        speedOnHover: num(v, "hover", 20),
        direction: str(v, "direction"),
        reverse: bool(v, "reverse") || undefined,
      }),
  },
  {
    ...base("transition-panel", "TransitionPanel", "Motion core", "One panel at a time, with the container height animating to fit."),
    fit: "center",
    controls: [range("duration", "Duration", 0.35, 0.05, 1.2, 0.05, "s"), range("active", "Active panel", 0, 0, 2)],
    render: (v) => (
      <div className="w-full max-w-xl">
        <TransitionPanel
          activeIndex={num(v, "active", 0)}
          duration={num(v, "duration", 0.35)}
          className="rounded-xl border border-ink-700 bg-ink-900"
        >
          {[
            { title: "Overview", body: "A short panel." },
            { title: "Details", body: "A noticeably longer panel, so the container height has something real to animate between. Panels stay mounted but leave the tab order while inactive." },
            { title: "Support", body: "Another length again, to show the height settling rather than jumping." },
          ].map((tab) => (
            <div key={tab.title} className="p-6">
              <h3 className="font-semibold text-ink-0">{tab.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{tab.body}</p>
            </div>
          ))}
        </TransitionPanel>
      </div>
    ),
    code: (v) => usage("TransitionPanel", { activeIndex: num(v, "active", 0), duration: num(v, "duration", 0.35) }),
  },

  {
    ...base("text-effect", "TextEffect", "Motion text", "Reveals text per word, character, or line with five presets."),
    fit: "center",
    controls: [
      text("text", "Text", "Taste is what survives the end of scarcity.", 60),
      select("per", "Per", "word", ["word", "char", "line"]),
      select("preset", "Preset", "fade-in-blur", ["fade", "blur", "fade-in-blur", "scale", "slide"]),
      range("speedReveal", "Reveal speed", 1, 0.2, 4, 0.1, "×"),
      range("speedSegment", "Segment speed", 1, 0.2, 4, 0.1, "×"),
      range("delay", "Delay", 0, 0, 1.5, 0.05, "s"),
    ],
    render: (v) => (
      <TextEffect
        per={str(v, "per", "word") as "word" | "char" | "line"}
        preset={str(v, "preset", "fade-in-blur") as never}
        speedReveal={num(v, "speedReveal", 1)}
        speedSegment={num(v, "speedSegment", 1)}
        delay={num(v, "delay", 0)}
        as="h2"
        className="max-w-2xl text-center font-serif text-4xl leading-tight tracking-tight text-ink-0 sm:text-5xl"
      >
        {str(v, "text", "Taste is the moat")}
      </TextEffect>
    ),
    code: (v) =>
      usage("TextEffect", { per: str(v, "per"), preset: str(v, "preset"), speedReveal: num(v, "speedReveal", 1) }, str(v, "text")),
  },
  {
    ...base("text-loop", "TextLoop", "Motion text", "Cycles words in place without reflowing the line."),
    fit: "center",
    controls: [range("interval", "Hold", 1.8, 0.4, 6, 0.1, "s"), text("prefix", "Prefix", "Built for", 20)],
    render: (v) => (
      <p className="text-center font-serif text-4xl text-ink-0">
        {str(v, "prefix", "Built for")}{" "}
        <TextLoop className="text-brand-400" interval={num(v, "interval", 1.8)}>
          <span>founders</span>
          <span>designers</span>
          <span>engineers</span>
          <span>studios</span>
        </TextLoop>
      </p>
    ),
    code: (v) => usage("TextLoop", { interval: num(v, "interval", 1.8) }, "<span>founders</span>"),
  },
  {
    ...base("text-morph", "TextMorph", "Motion text", "Morphs between strings, holding shared characters in place."),
    fit: "center",
    controls: [select("word", "Word", "Curation", ["Curation", "Discernment", "Restraint", "Point of view"])],
    render: (v) => (
      <TextMorph as="h2" className="font-serif text-6xl tracking-tight text-ink-0">
        {str(v, "word", "Curation")}
      </TextMorph>
    ),
    code: (v) => usage("TextMorph", {}, str(v, "word")),
  },
  {
    ...base("text-roll", "TextRoll", "Motion text", "Characters roll out as a copy rolls in on a shared 3D edge."),
    fit: "center",
    controls: [text("text", "Text", "Hover this headline", 30), range("duration", "Flip", 0.5, 0.1, 1.6, 0.05, "s")],
    render: (v) => (
      <TextRoll
        duration={num(v, "duration", 0.5)}
        className="cursor-default text-center font-serif text-5xl tracking-tight text-ink-0"
      >
        {str(v, "text", "Hover this headline")}
      </TextRoll>
    ),
    code: (v) => usage("TextRoll", { duration: num(v, "duration", 0.5) }, str(v, "text")),
  },
  {
    ...base("text-scramble", "TextScramble", "Motion text", "Copy resolves out of random characters, left to right."),
    fit: "center",
    controls: [
      text("text", "Text", "Taste is the moat", 30),
      range("duration", "Resolve", 1.2, 0.2, 4, 0.1, "s"),
      range("speed", "Frame gap", 0.04, 0.01, 0.2, 0.01, "s"),
    ],
    render: (v) => (
      <TextScramble
        as="h2"
        duration={num(v, "duration", 1.2)}
        speed={num(v, "speed", 0.04)}
        className="text-center font-mono text-4xl text-accent-400"
      >
        {str(v, "text", "Taste is the moat")}
      </TextScramble>
    ),
    code: (v) => usage("TextScramble", { duration: num(v, "duration", 1.2), speed: num(v, "speed", 0.04) }, str(v, "text")),
  },
  {
    ...base("text-shimmer", "TextShimmer", "Motion text", "A highlight sweeps across the glyphs."),
    fit: "center",
    controls: [
      text("text", "Text", "Generating your collection…", 36),
      range("duration", "Pass", 2, 0.4, 6, 0.1, "s"),
      range("spread", "Spread", 2, 0.5, 8, 0.5, " ch"),
    ],
    render: (v) => (
      <TextShimmer className="text-3xl" duration={num(v, "duration", 2)} spread={num(v, "spread", 2)}>
        {str(v, "text", "Generating…")}
      </TextShimmer>
    ),
    code: (v) => usage("TextShimmer", { duration: num(v, "duration", 2), spread: num(v, "spread", 2) }, str(v, "text")),
  },
  {
    ...base("text-shimmer-wave", "TextShimmerWave", "Motion text", "A per-character wave in three dimensions."),
    fit: "center",
    controls: [
      text("text", "Text", "Rendering shaders…", 30),
      range("duration", "Pass", 1.2, 0.3, 4, 0.1, "s"),
      range("spread", "Character offset", 1.4, 0.2, 4, 0.1),
      range("z", "Z distance", 10, 0, 60, 1, "px"),
    ],
    render: (v) => (
      <TextShimmerWave
        className="font-mono text-3xl"
        duration={num(v, "duration", 1.2)}
        spread={num(v, "spread", 1.4)}
        zDistance={num(v, "z", 10)}
      >
        {str(v, "text", "Rendering…")}
      </TextShimmerWave>
    ),
    code: (v) =>
      usage("TextShimmerWave", { duration: num(v, "duration", 1.2), spread: num(v, "spread", 1.4), zDistance: num(v, "z", 10) }, str(v, "text")),
  },

  {
    ...base("animated-number", "AnimatedNumber", "Motion numbers", "A figure that springs to each new value as it changes."),
    fit: "center",
    controls: [range("value", "Value", 1284, 0, 9999, 1), range("decimals", "Decimals", 0, 0, 2)],
    render: (v) => (
      <AnimatedNumber
        value={num(v, "value", 1284)}
        decimals={num(v, "decimals", 0)}
        className="font-serif text-8xl tracking-tight text-ink-0"
      />
    ),
    code: (v) => usage("AnimatedNumber", { value: num(v, "value", 1284), decimals: num(v, "decimals") || undefined }),
  },
  {
    ...base("sliding-number", "SlidingNumber", "Motion numbers", "An odometer: each digit rolls through the values between."),
    fit: "center",
    controls: [range("value", "Value", 4821, 0, 9999, 1), toggle("pad", "Pad to two digits", false)],
    render: (v) => (
      <SlidingNumber
        value={num(v, "value", 4821)}
        padStart={bool(v, "pad")}
        className="font-serif text-8xl tracking-tight text-ink-0"
      />
    ),
    code: (v) => usage("SlidingNumber", { value: num(v, "value", 4821), padStart: bool(v, "pad") || undefined }),
  },

  {
    ...base("dock", "Dock", "Motion interactive", "macOS-style magnification driven by pointer distance."),
    fit: "center",
    controls: [
      range("magnification", "Magnification", 72, 40, 130, 2, "px"),
      range("distance", "Reach", 140, 40, 320, 10, "px"),
      range("panelHeight", "Panel height", 64, 40, 110, 2, "px"),
    ],
    render: (v) => (
      <Dock
        magnification={num(v, "magnification", 72)}
        distance={num(v, "distance", 140)}
        panelHeight={num(v, "panelHeight", 64)}
      >
        {["Home", "Search", "Library", "Studio", "Settings"].map((item) => (
          <DockItem key={item} className="bg-white/10 text-ink-100">
            <DockLabel>{item}</DockLabel>
            <DockIcon>{DOT}</DockIcon>
          </DockItem>
        ))}
      </Dock>
    ),
    code: (v) =>
      usage("Dock", { magnification: num(v, "magnification", 72), distance: num(v, "distance", 140) }, "<DockItem>…</DockItem>"),
  },
  {
    ...base("glow-effect", "GlowEffect", "Motion interactive", "A coloured glow behind any element, in six modes."),
    fit: "center",
    controls: [
      select("mode", "Mode", "rotate", ["rotate", "pulse", "breathe", "colorShift", "flowHorizontal", "static"]),
      select("blur", "Blur", "strong", ["softest", "medium", "strong", "stronger", "biggest"]),
      range("duration", "Cycle", 4, 1, 12, 0.5, "s"),
      range("scale", "Scale", 1.05, 0.9, 1.4, 0.01, "×"),
    ],
    render: (v) => (
      <div className="relative isolate">
        <GlowEffect
          mode={str(v, "mode", "rotate") as GlowMode}
          blur={str(v, "blur", "strong") as GlowBlur}
          duration={num(v, "duration", 4)}
          scale={num(v, "scale", 1.05)}
        />
        <div className="relative grid h-40 w-72 place-items-center rounded-2xl border border-ink-700 bg-ink-900 font-mono text-sm text-ink-200">
          {str(v, "mode", "rotate")}
        </div>
      </div>
    ),
    code: (v) =>
      usage("GlowEffect", { mode: str(v, "mode"), blur: str(v, "blur"), duration: num(v, "duration", 4), scale: num(v, "scale", 1.05) }),
  },
  {
    ...base("image-comparison", "ImageComparison", "Motion interactive", "A before/after wipe that is also keyboard-operable."),
    fit: "center",
    controls: [toggle("hover", "Track hover", false), range("position", "Start split", 50, 0, 100, 1, "%")],
    render: (v) => (
      <div className="w-full max-w-xl">
        <ImageComparison
          className="aspect-[8/5] rounded-2xl"
          enableHover={bool(v, "hover")}
          defaultPosition={num(v, "position", 50)}
        >
          <ImageComparisonImage src={swatchDataUri("#1e1b4b", "#4c1d95", "Before")} alt="Before" position="left" />
          <ImageComparisonImage src={swatchDataUri("#f97316", "#e11d48", "After")} alt="After" position="right" />
          <ImageComparisonSlider className="bg-white/90">
            <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs text-ink-950">
              ↔
            </span>
          </ImageComparisonSlider>
        </ImageComparison>
      </div>
    ),
    code: (v) =>
      usage("ImageComparison", { enableHover: bool(v, "hover") || undefined, defaultPosition: num(v, "position", 50) }),
  },
  {
    ...base("scroll-progress", "ScrollProgress", "Motion interactive", "A reading-progress bar for the page or any scroll container."),
    fit: "center",
    controls: [range("height", "Container", 260, 140, 420, 10, "px"), range("cards", "Cards", 8, 3, 16)],
    render: (v) => <ScrollProgressDemo height={num(v, "height", 260)} cards={num(v, "cards", 8)} />,
    code: () => `<ScrollProgress containerRef={container} className="h-1.5" />`,
  },
  {
    ...base("spotlight", "Spotlight", "Motion interactive", "A self-contained light that follows the pointer."),
    fit: "center",
    controls: [range("size", "Light size", 220, 60, 520, 10, "px"), range("cards", "Cards", 3, 1, 4)],
    render: (v) => (
      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
        {["Atmosphere", "Restraint", "Intent", "Edit"].slice(0, num(v, "cards", 3)).map((title) => (
          <div
            key={title}
            className="relative isolate min-h-44 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 p-6"
          >
            <Spotlight size={num(v, "size", 220)} />
            <h3 className="relative font-serif text-2xl text-ink-0">{title}</h3>
            <p className="relative mt-2 text-sm text-ink-400">Each card carries its own light.</p>
          </div>
        ))}
      </div>
    ),
    code: (v) => usage("Spotlight", { size: num(v, "size", 220) }),
  },
  {
    ...base("spinning-text", "SpinningText", "Motion interactive", "Text laid around a circle and rotated as one ring."),
    fit: "center",
    controls: [
      range("duration", "Rotation", 14, 3, 40, 1, "s"),
      range("radius", "Radius", 5.5, 3, 10, 0.25, "rem"),
      range("fontSize", "Font size", 0.75, 0.4, 1.6, 0.05, "rem"),
      toggle("reverse", "Reverse", false),
    ],
    render: (v) => (
      <div className="relative grid place-items-center">
        <SpinningText
          className="font-mono uppercase tracking-[0.2em] text-ink-300"
          duration={num(v, "duration", 14)}
          radius={num(v, "radius", 5.5)}
          fontSize={num(v, "fontSize", 0.75)}
          reverse={bool(v, "reverse")}
        >
          {"taste is the moat • curated not generated • "}
        </SpinningText>
        <span className="absolute grid size-16 place-items-center rounded-full bg-brand-500 text-black">
          <BrandMark className="size-9" />
        </span>
      </div>
    ),
    code: (v) =>
      usage("SpinningText", { duration: num(v, "duration", 14), radius: num(v, "radius", 5.5), fontSize: num(v, "fontSize", 0.75) }),
  },
  {
    ...base("tilt", "Tilt", "Motion interactive", "3D rotation from a shared vanishing point."),
    fit: "center",
    controls: [range("rotation", "Max rotation", 14, 2, 32, 1, "°"), toggle("reverse", "Tilt away", false)],
    render: (v) => (
      <Tilt rotationFactor={num(v, "rotation", 14)} isReverse={bool(v, "reverse")} className="w-56">
        <div className="grid aspect-[3/4] place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-lg font-semibold text-white">
          {bool(v, "reverse") ? "Reversed" : "Toward"}
        </div>
      </Tilt>
    ),
    code: (v) => usage("Tilt", { rotationFactor: num(v, "rotation", 14), isReverse: bool(v, "reverse") || undefined }, "{/* card */}"),
  },

  {
    ...base("toolbar-dynamic", "ToolbarDynamic", "Motion toolbars", "A toolbar that becomes the control you selected."),
    fit: "center",
    controls: [range("duration", "Morph", 0.3, 0.05, 1, 0.05, "s")],
    render: (v) => (
      <ToolbarDynamic
        duration={num(v, "duration", 0.3)}
        actions={[
          { id: "search", label: "Search", icon: DOT, placeholder: "Search the collection…" },
          { id: "comment", label: "Comment", icon: DOT, placeholder: "Leave a note…" },
          { id: "share", label: "Share", icon: DOT, placeholder: "Email address…" },
        ]}
      />
    ),
    code: (v) => usage("ToolbarDynamic", { duration: num(v, "duration", 0.3) }),
  },
  {
    ...base("toolbar-expandable", "ToolbarExpandable", "Motion toolbars", "A compact toolbar that opens a measured panel above itself."),
    fit: "center",
    controls: [range("duration", "Expand", 0.3, 0.05, 1, 0.05, "s")],
    render: (v) => (
      <ToolbarExpandable
        duration={num(v, "duration", 0.3)}
        panels={[
          { id: "notes", label: "Notes", icon: DOT, content: "A short panel." },
          { id: "tasks", label: "Tasks", icon: DOT, content: "A longer panel, so the container has a different height to animate to. Nothing is clipped, because the height comes from a measurement rather than a guess." },
          { id: "team", label: "Team", icon: DOT, content: "A third length again." },
        ]}
      />
    ),
    code: (v) => usage("ToolbarExpandable", { duration: num(v, "duration", 0.3) }),
  },

  {
    ...base("magnetic", "Magnetic", "Motion advanced", "Pulls its child toward the pointer within a set range."),
    fit: "center",
    controls: [
      range("intensity", "Intensity", 0.5, 0, 1.5, 0.05),
      range("range", "Range", 140, 40, 400, 10, "px"),
      select("area", "Action area", "parent", ["self", "parent", "global"]),
    ],
    render: (v) => (
      <Magnetic
        intensity={num(v, "intensity", 0.5)}
        range={num(v, "range", 140)}
        actionArea={str(v, "area", "parent") as "self" | "parent" | "global"}
      >
        <button type="button" className="rounded-full bg-brand-500 px-8 py-3.5 font-semibold text-black">
          Pull me
        </button>
      </Magnetic>
    ),
    code: (v) =>
      usage("Magnetic", { intensity: num(v, "intensity", 0.5), range: num(v, "range", 140), actionArea: str(v, "area") }, "<Button>Pull me</Button>"),
  },
  {
    ...base("morphing-dialog", "MorphingDialog", "Motion advanced", "A dialog that grows out of the element that opened it."),
    fit: "center",
    controls: [range("duration", "Morph", 0.35, 0.1, 1.2, 0.05, "s"), range("cards", "Cards", 3, 1, 3)],
    render: (v) => (
      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
        {[
          { title: "Kinetic editorial", from: "#4f46e5", to: "#7c3aed" },
          { title: "Generative studio", from: "#0891b2", to: "#2563eb" },
          { title: "Spatial agency", from: "#f97316", to: "#e11d48" },
        ]
          .slice(0, num(v, "cards", 3))
          .map((card) => (
            <MorphingDialog key={card.title} duration={num(v, "duration", 0.35)}>
              <MorphingDialogTrigger className="w-full overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
                <Swatch label={card.title} from={card.from} to={card.to} />
              </MorphingDialogTrigger>
              <MorphingDialogContent>
                <MorphingDialogClose />
                <div style={{ backgroundImage: `linear-gradient(135deg, ${card.from}, ${card.to})` }} className="h-52" />
                <div className="p-6">
                  <MorphingDialogTitle>{card.title}</MorphingDialogTitle>
                  <MorphingDialogSubtitle>Template</MorphingDialogSubtitle>
                  <p className="mt-4 text-sm leading-relaxed text-ink-300">
                    The panel is painted at its final size, transformed back onto
                    the card, then released — one composited transform rather
                    than an animated width and height.
                  </p>
                </div>
              </MorphingDialogContent>
            </MorphingDialog>
          ))}
      </div>
    ),
    code: (v) => usage("MorphingDialog", { duration: num(v, "duration", 0.35) }, "{/* trigger + content */}"),
  },
  {
    ...base("morphing-popover", "MorphingPopover", "Motion advanced", "A trigger that expands in place into a panel."),
    fit: "center",
    controls: [range("duration", "Expand", 0.3, 0.05, 1, 0.05, "s")],
    render: (v) => (
      <MorphingPopover duration={num(v, "duration", 0.3)}>
        <MorphingPopoverTrigger className="rounded-xl border border-ink-700 bg-ink-900 px-4 py-2.5 text-sm text-ink-200">
          Add a note
        </MorphingPopoverTrigger>
        <MorphingPopoverContent className="w-72">
          <label className="text-xs uppercase tracking-widest text-ink-500" htmlFor="mp-note">
            Note
          </label>
          <textarea
            id="mp-note"
            rows={3}
            placeholder="Type something…"
            className="mt-2 w-full resize-none rounded-lg border border-ink-700 bg-ink-900 p-3 text-sm text-ink-0 outline-none placeholder:text-ink-500 focus:border-brand-400"
          />
        </MorphingPopoverContent>
      </MorphingPopover>
    ),
    code: (v) => usage("MorphingPopover", { duration: num(v, "duration", 0.3) }),
  },
  {
    ...base("progressive-blur", "ProgressiveBlur", "Motion advanced", "A gradual blur ramped toward one edge with stacked layers."),
    fit: "center",
    controls: [
      select("direction", "Direction", "bottom", ["top", "right", "bottom", "left"]),
      range("layers", "Layers", 8, 2, 14),
      range("intensity", "Blur per layer", 0.4, 0.05, 1.5, 0.05, "px"),
    ],
    render: (v) => (
      <div className="relative isolate w-full max-w-md overflow-hidden rounded-2xl">
        <div className="grid h-56 place-items-center bg-[repeating-linear-gradient(45deg,#312e81_0_18px,#4c1d95_18px_36px)] font-mono text-sm text-white/80">
          {str(v, "direction", "bottom")}
        </div>
        <ProgressiveBlur
          direction={str(v, "direction", "bottom") as "top" | "right" | "bottom" | "left"}
          blurLayers={num(v, "layers", 8)}
          blurIntensity={num(v, "intensity", 0.4)}
        />
      </div>
    ),
    code: (v) =>
      usage("ProgressiveBlur", { direction: str(v, "direction"), blurLayers: num(v, "layers", 8), blurIntensity: num(v, "intensity", 0.4) }),
  },
];
