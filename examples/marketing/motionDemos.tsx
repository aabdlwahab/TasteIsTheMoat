/**
 * Demos for the motion collection (src/ui/motion).
 *
 * Kept out of sections.tsx so the section catalog stays readable — that file
 * is already long, and these 33 demos are a self-contained set with their own
 * catalog metadata.
 */
import { useState } from "react";
import { Container } from "../../src/ui/index";
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
} from "../../src/ui/motion/index";

/* ---- catalog metadata --------------------------------------------------- */

export type MotionCategory =
  | "Motion core"
  | "Motion text"
  | "Motion numbers"
  | "Motion interactive"
  | "Motion toolbars"
  | "Motion advanced";

export const MOTION_CATEGORIES: MotionCategory[] = [
  "Motion core",
  "Motion text",
  "Motion numbers",
  "Motion interactive",
  "Motion toolbars",
  "Motion advanced",
];

export interface MotionCatalogItem {
  name: string;
  category: MotionCategory;
  description: string;
  demo: string;
}

export const MOTION_ELEMENTS: MotionCatalogItem[] = [
  { name: "Accordion", category: "Motion core", description: "One-at-a-time disclosure that animates without measuring pixel heights.", demo: "mp-accordion" },
  { name: "AnimatedBackground", category: "Motion core", description: "A single highlight that slides between tabs, nav items, or toggles.", demo: "mp-animated-background" },
  { name: "AnimatedGroup", category: "Motion core", description: "Staggered entrance for a list, with five presets.", demo: "mp-animated-group" },
  { name: "BorderTrail", category: "Motion core", description: "One light walking the perimeter of any positioned element.", demo: "mp-border-trail" },
  { name: "Carousel", category: "Motion core", description: "Draggable slides with arrows, indicators, and shared context.", demo: "mp-carousel" },
  { name: "Cursor", category: "Motion core", description: "A custom pointer that trails the real one, on fine pointers only.", demo: "mp-cursor" },
  { name: "Dialog", category: "Motion core", description: "A modal with focus trap, Escape, and scroll lock built in.", demo: "mp-dialog" },
  { name: "Disclosure", category: "Motion core", description: "A single show/hide region — accordion without the exclusivity.", demo: "mp-disclosure" },
  { name: "InView", category: "Motion core", description: "Animates between two plain CSS states on entering the viewport.", demo: "mp-in-view" },
  { name: "InfiniteSlider", category: "Motion core", description: "A rail specified in pixels per second, in either axis.", demo: "mp-infinite-slider" },
  { name: "TransitionPanel", category: "Motion core", description: "One panel at a time, with the container height animating to fit.", demo: "mp-transition-panel" },

  { name: "TextEffect", category: "Motion text", description: "Reveals text per word, character, or line with five presets.", demo: "mp-text-effect" },
  { name: "TextLoop", category: "Motion text", description: "Cycles words in place without reflowing the line.", demo: "mp-text-loop" },
  { name: "TextMorph", category: "Motion text", description: "Morphs between strings, holding shared characters in place.", demo: "mp-text-morph" },
  { name: "TextRoll", category: "Motion text", description: "Characters roll out as a copy rolls in on a shared 3D edge.", demo: "mp-text-roll" },
  { name: "TextScramble", category: "Motion text", description: "Copy resolves out of random characters, left to right.", demo: "mp-text-scramble" },
  { name: "TextShimmer", category: "Motion text", description: "A highlight sweeps across the glyphs.", demo: "mp-text-shimmer" },
  { name: "TextShimmerWave", category: "Motion text", description: "A per-character wave in three dimensions.", demo: "mp-text-shimmer-wave" },

  { name: "AnimatedNumber", category: "Motion numbers", description: "A figure that springs to each new value as it changes.", demo: "mp-animated-number" },
  { name: "SlidingNumber", category: "Motion numbers", description: "An odometer: each digit rolls through the values between.", demo: "mp-sliding-number" },

  { name: "Dock", category: "Motion interactive", description: "macOS-style magnification driven by pointer distance.", demo: "mp-dock" },
  { name: "GlowEffect", category: "Motion interactive", description: "A coloured glow behind any element, in six modes.", demo: "mp-glow-effect" },
  { name: "ImageComparison", category: "Motion interactive", description: "A before/after wipe that is also keyboard-operable.", demo: "mp-image-comparison" },
  { name: "ScrollProgress", category: "Motion interactive", description: "A reading-progress bar for the page or any scroll container.", demo: "mp-scroll-progress" },
  { name: "Spotlight", category: "Motion interactive", description: "A self-contained light that follows the pointer.", demo: "mp-spotlight" },
  { name: "SpinningText", category: "Motion interactive", description: "Text laid around a circle and rotated as one ring.", demo: "mp-spinning-text" },
  { name: "Tilt", category: "Motion interactive", description: "3D rotation from a shared vanishing point.", demo: "mp-tilt" },

  { name: "ToolbarDynamic", category: "Motion toolbars", description: "A toolbar that becomes the control you selected.", demo: "mp-toolbar-dynamic" },
  { name: "ToolbarExpandable", category: "Motion toolbars", description: "A compact toolbar that opens a measured panel above itself.", demo: "mp-toolbar-expandable" },

  { name: "Magnetic", category: "Motion advanced", description: "Pulls its child toward the pointer within a set range.", demo: "mp-magnetic" },
  { name: "MorphingDialog", category: "Motion advanced", description: "A dialog that grows out of the element that opened it.", demo: "mp-morphing-dialog" },
  { name: "MorphingPopover", category: "Motion advanced", description: "A trigger that expands in place into a panel.", demo: "mp-morphing-popover" },
  { name: "ProgressiveBlur", category: "Motion advanced", description: "A gradual blur ramped toward one edge with stacked layers.", demo: "mp-progressive-blur" },
];

/* ---- demo shell --------------------------------------------------------- */

function MotionDemo({
  name,
  description,
  children,
}: {
  name: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-ink-950 py-16 sm:py-20">
      <Container>
        <a
          href="?s=elements"
          className="text-sm text-ink-400 transition-colors hover:text-ink-0"
        >
          ← All tactile elements
        </a>
        <div className="mt-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
            Motion collection
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-0.045em] text-ink-0 sm:text-6xl">
            {name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-300">
            {description}
          </p>
        </div>
        <div className="mt-12 overflow-hidden rounded-3xl border border-ink-700 bg-ink-850/70 p-6 sm:p-10">
          {children}
        </div>
      </Container>
    </main>
  );
}

/** Neutral placeholder art, so the demos need no network images. */
function Swatch({ label, from, to }: { label: string; from: string; to: string }) {
  return (
    <div
      className="grid aspect-[4/3] place-items-center rounded-xl p-6 text-lg font-semibold text-white"
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {label}
    </div>
  );
}

const SVG_DOT = (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/* ---- demos -------------------------------------------------------------- */

const ACCORDION_ITEMS = [
  { value: "a", title: "How is the height animated?", body: "With a grid-template-rows transition from 0fr to 1fr, so content can change size while open without re-measuring." },
  { value: "b", title: "Is it controllable?", body: "Yes. Pass expandedValue and onValueChange for controlled use, or defaultExpandedValue to seed the uncontrolled version." },
  { value: "c", title: "What about reduced motion?", body: "The transition is dropped and the panel snaps open, which is the honest behaviour when motion is unwelcome." },
];

function AccordionDemo() {
  return (
    <Accordion className="mx-auto max-w-xl divide-y divide-ink-700" defaultExpandedValue="a">
      {ACCORDION_ITEMS.map((item) => (
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
}

function AnimatedBackgroundDemo() {
  const tabs = ["Overview", "Analytics", "Reports", "Settings"];
  return (
    <div className="grid gap-10">
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-500">Click to select</p>
        <AnimatedBackground className="rounded-lg bg-brand-500/25" defaultValue="Overview">
          {tabs.map((tab) => (
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
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-500">enableHover</p>
        <AnimatedBackground className="rounded-lg bg-white/10" enableHover>
          {tabs.map((tab) => (
            <span key={tab} data-id={tab} className="block cursor-default px-4 py-2 text-sm text-ink-200">
              {tab}
            </span>
          ))}
        </AnimatedBackground>
      </div>
    </div>
  );
}

function AnimatedGroupDemo() {
  const [preset, setPreset] = useState<"fade" | "slide" | "scale" | "blur" | "blur-slide">("blur-slide");
  const presets = ["fade", "slide", "scale", "blur", "blur-slide"] as const;

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {presets.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPreset(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              preset === option ? "bg-brand-500 text-black" : "bg-white/10 text-ink-300 hover:bg-white/20"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <AnimatedGroup
        key={preset}
        preset={preset}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="grid h-24 place-items-center rounded-xl border border-ink-700 bg-ink-800 text-ink-300">
            {index + 1}
          </div>
        ))}
      </AnimatedGroup>
    </div>
  );
}

function BorderTrailDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {[
        { size: 40, duration: 4 },
        { size: 80, duration: 6 },
        { size: 140, duration: 9 },
      ].map((config) => (
        <div
          key={config.size}
          className="relative grid h-40 w-56 place-items-center overflow-hidden rounded-2xl border border-ink-700 bg-ink-900"
        >
          <BorderTrail size={config.size} duration={config.duration} />
          <span className="relative font-mono text-sm text-ink-300">size {config.size}</span>
        </div>
      ))}
    </div>
  );
}

function CarouselDemo() {
  const slides = [
    { label: "Strategy", from: "#4f46e5", to: "#7c3aed" },
    { label: "Identity", from: "#0891b2", to: "#2563eb" },
    { label: "Launch", from: "#f97316", to: "#e11d48" },
    { label: "Growth", from: "#059669", to: "#0d9488" },
  ];
  return (
    <div className="mx-auto max-w-lg">
      <Carousel>
        <CarouselContent className="rounded-2xl">
          {slides.map((slide) => (
            <CarouselItem key={slide.label}>
              <Swatch {...slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNavigation alwaysShow />
        <CarouselIndicator />
      </Carousel>
      <p className="mt-4 text-center text-sm text-ink-400">Drag, use the arrows, or pick a dot.</p>
    </div>
  );
}

function CursorDemo() {
  return (
    <div className="relative grid min-h-56 place-items-center rounded-2xl border border-dashed border-ink-600 bg-ink-900">
      <Cursor attachToParent>
        <div className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-black">
          have a look
        </div>
      </Cursor>
      <p className="text-ink-400">Move the pointer inside this area.</p>
    </div>
  );
}

function DialogDemo() {
  return (
    <div className="grid min-h-40 place-items-center">
      <Dialog>
        <DialogTrigger className="rounded-lg bg-ink-0 px-5 py-2.5 font-semibold text-ink-950">
          Open dialog
        </DialogTrigger>
        <DialogContent>
          <DialogClose />
          <DialogHeader>
            <DialogTitle>Focus stays inside</DialogTitle>
            <DialogDescription>
              Tab cycles within the panel, Escape closes it, body scroll is locked, and focus
              returns to the trigger on close.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose className="static rounded-lg bg-white/10 px-4 py-2 text-sm">
              Cancel
            </DialogClose>
            <button type="button" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-black">
              Confirm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DisclosureDemo() {
  return (
    <div className="mx-auto max-w-xl space-y-3">
      {["Shipping and returns", "Materials", "Care instructions"].map((title) => (
        <Disclosure key={title} className="rounded-xl border border-ink-700 bg-ink-900 px-5">
          <DisclosureTrigger className="flex items-center justify-between py-4 text-ink-0">
            <span className="font-medium">{title}</span>
            <span aria-hidden="true" className="text-ink-400">↓</span>
          </DisclosureTrigger>
          <DisclosureContent className="pb-4 text-sm leading-relaxed text-ink-300">
            Each disclosure keeps its own state, so more than one can be open at a time.
          </DisclosureContent>
        </Disclosure>
      ))}
    </div>
  );
}

function InViewDemo() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-400">Scroll — each card animates as it enters.</p>
      {Array.from({ length: 6 }, (_, index) => (
        <InView
          key={index}
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
  );
}

function InfiniteSliderDemo() {
  const chips = ["Vercel", "Linear", "Raycast", "Supabase", "Resend", "Clerk"];
  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-500">speed 60, speedOnHover 20</p>
        <InfiniteSlider gap={24} speed={60} speedOnHover={20}>
          {chips.map((chip) => (
            <span key={chip} className="rounded-full border border-ink-700 bg-ink-800 px-5 py-2 text-sm text-ink-200">
              {chip}
            </span>
          ))}
        </InfiniteSlider>
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-500">reverse</p>
        <InfiniteSlider gap={24} speed={80} reverse>
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-brand-500/15 px-5 py-2 text-sm text-brand-200">
              {chip}
            </span>
          ))}
        </InfiniteSlider>
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-500">vertical</p>
        <div className="h-48 overflow-hidden">
          <InfiniteSlider gap={16} speed={40} direction="vertical">
            {chips.map((chip) => (
              <span key={chip} className="block rounded-lg border border-ink-700 bg-ink-800 px-5 py-2 text-sm text-ink-200">
                {chip}
              </span>
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </div>
  );
}

function TransitionPanelDemo() {
  const [active, setActive] = useState(0);
  const tabs = [
    { title: "Overview", body: "A short panel." },
    { title: "Details", body: "A noticeably longer panel, so the container height has something real to animate between. Panels stay mounted but are removed from the tab order while inactive." },
    { title: "Support", body: "Another length again, to show the height settling rather than jumping." },
  ];

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab.title}
            type="button"
            onClick={() => setActive(index)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              active === index ? "bg-brand-500 text-black" : "bg-white/10 text-ink-300 hover:bg-white/20"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <TransitionPanel activeIndex={active} className="rounded-xl border border-ink-700 bg-ink-900">
        {tabs.map((tab) => (
          <div key={tab.title} className="p-6">
            <h3 className="font-semibold text-ink-0">{tab.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">{tab.body}</p>
          </div>
        ))}
      </TransitionPanel>
    </div>
  );
}

function TextEffectDemo() {
  const [per, setPer] = useState<"word" | "char" | "line">("word");
  const [preset, setPreset] = useState<"fade" | "blur" | "fade-in-blur" | "scale" | "slide">("fade-in-blur");

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {(["word", "char", "line"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPer(option)}
            className={`rounded-full px-3 py-1.5 text-xs ${per === option ? "bg-brand-500 text-black" : "bg-white/10 text-ink-300"}`}
          >
            per={option}
          </button>
        ))}
        {(["fade", "blur", "fade-in-blur", "scale", "slide"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPreset(option)}
            className={`rounded-full px-3 py-1.5 text-xs ${preset === option ? "bg-accent-500 text-black" : "bg-white/10 text-ink-300"}`}
          >
            {option}
          </button>
        ))}
      </div>
      <TextEffect
        key={`${per}-${preset}`}
        per={per}
        preset={preset}
        as="h2"
        className="font-serif text-4xl leading-tight tracking-tight text-ink-0 sm:text-5xl"
      >
        {"Taste is what survives\nthe end of scarcity."}
      </TextEffect>
    </div>
  );
}

function TextLoopDemo() {
  return (
    <p className="text-center font-serif text-3xl text-ink-0 sm:text-4xl">
      Built for{" "}
      <TextLoop className="text-brand-400" interval={1.8}>
        <span>founders</span>
        <span>designers</span>
        <span>engineers</span>
        <span>studios</span>
      </TextLoop>
    </p>
  );
}

function TextMorphDemo() {
  const words = ["Curation", "Discernment", "Restraint", "Point of view"];
  const [index, setIndex] = useState(0);
  return (
    <div className="text-center">
      <TextMorph as="h2" className="font-serif text-5xl tracking-tight text-ink-0">
        {words[index]!}
      </TextMorph>
      <button
        type="button"
        onClick={() => setIndex((current) => (current + 1) % words.length)}
        className="mt-8 rounded-lg bg-white/10 px-4 py-2 text-sm text-ink-200 hover:bg-white/20"
      >
        Morph to the next word
      </button>
    </div>
  );
}

function TextRollDemo() {
  return (
    <div className="grid min-h-40 place-items-center">
      <TextRoll className="cursor-default font-serif text-5xl tracking-tight text-ink-0">
        Hover this headline
      </TextRoll>
    </div>
  );
}

function TextScrambleDemo() {
  const [trigger, setTrigger] = useState(true);
  return (
    <div className="text-center">
      <TextScramble
        key={String(trigger)}
        as="h2"
        duration={1.2}
        className="font-mono text-3xl text-accent-400 sm:text-4xl"
      >
        Taste is the moat
      </TextScramble>
      <button
        type="button"
        onClick={() => setTrigger((current) => !current)}
        className="mt-8 rounded-lg bg-white/10 px-4 py-2 text-sm text-ink-200 hover:bg-white/20"
      >
        Scramble again
      </button>
    </div>
  );
}

function TextShimmerDemo() {
  return (
    <div className="grid min-h-40 place-items-center gap-8">
      <TextShimmer className="text-2xl" duration={2}>
        Generating your collection…
      </TextShimmer>
      <TextShimmer className="font-serif text-4xl [--highlight-color:var(--color-brand-300)]" duration={3} spread={3}>
        A slower, wider sweep
      </TextShimmer>
    </div>
  );
}

function TextShimmerWaveDemo() {
  return (
    <div className="grid min-h-40 place-items-center">
      <TextShimmerWave className="font-mono text-2xl sm:text-3xl" duration={1.2} spread={1.4}>
        Rendering shaders…
      </TextShimmerWave>
    </div>
  );
}

function AnimatedNumberDemo() {
  const [value, setValue] = useState(1284);
  return (
    <div className="text-center">
      <AnimatedNumber
        value={value}
        className="font-serif text-7xl tracking-tight text-ink-0"
      />
      <div className="mt-8 flex justify-center gap-3">
        <button type="button" onClick={() => setValue((v) => v - 137)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-ink-200 hover:bg-white/20">
          −137
        </button>
        <button type="button" onClick={() => setValue((v) => v + 421)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-ink-200 hover:bg-white/20">
          +421
        </button>
        <button type="button" onClick={() => setValue(Math.round(Math.random() * 9999))} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-black">
          Randomise
        </button>
      </div>
    </div>
  );
}

function SlidingNumberDemo() {
  const [value, setValue] = useState(4821);
  return (
    <div className="text-center">
      <SlidingNumber value={value} className="font-serif text-7xl tracking-tight text-ink-0" />
      <div className="mt-8 flex justify-center gap-3">
        <button type="button" onClick={() => setValue((v) => Math.max(0, v - 111))} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-ink-200 hover:bg-white/20">
          −111
        </button>
        <button type="button" onClick={() => setValue((v) => v + 111)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-ink-200 hover:bg-white/20">
          +111
        </button>
        <button type="button" onClick={() => setValue(Math.round(Math.random() * 9999))} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-black">
          Randomise
        </button>
      </div>
      <p className="mt-6 text-sm text-ink-400">Watch a digit roll through the values in between.</p>
    </div>
  );
}

function DockDemo() {
  const items = ["Home", "Search", "Library", "Studio", "Settings"];
  return (
    <div className="grid min-h-48 place-items-end pb-4">
      <Dock magnification={72} distance={140}>
        {items.map((item) => (
          <DockItem key={item} className="bg-white/10 text-ink-100">
            <DockLabel>{item}</DockLabel>
            <DockIcon>{SVG_DOT}</DockIcon>
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}

function GlowEffectDemo() {
  const modes = ["rotate", "pulse", "breathe", "colorShift", "flowHorizontal", "static"] as const;
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
      {modes.map((mode) => (
        <div key={mode} className="relative isolate">
          <GlowEffect mode={mode} blur="strong" duration={4} scale={1.05} />
          <div className="relative grid h-28 place-items-center rounded-xl border border-ink-700 bg-ink-900 font-mono text-xs text-ink-200">
            {mode}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Inline SVG data URIs, so the comparison demo needs no network images. */
function swatchDataUri(from: string, to: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><text x="40" y="90" font-family="sans-serif" font-size="52" font-weight="700" fill="white">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function ImageComparisonDemo() {
  return (
    <div className="mx-auto max-w-xl">
      <ImageComparison className="aspect-[8/5] rounded-2xl">
        <ImageComparisonImage
          src={swatchDataUri("#1e1b4b", "#4c1d95", "Before")}
          alt="Before"
          position="left"
        />
        <ImageComparisonImage
          src={swatchDataUri("#f97316", "#e11d48", "After")}
          alt="After"
          position="right"
        />
        <ImageComparisonSlider className="bg-white/90">
          <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs text-ink-950">
            ↔
          </span>
        </ImageComparisonSlider>
      </ImageComparison>
      <p className="mt-4 text-center text-sm text-ink-400">
        Drag the handle, or focus it and use the arrow keys.
      </p>
    </div>
  );
}

function ScrollProgressDemo() {
  return (
    <div>
      <div className="sticky top-0 z-10 -mx-6 mb-8 sm:-mx-10">
        <ScrollProgress className="h-1.5" />
      </div>
      <p className="mb-6 text-sm text-ink-400">The bar above tracks the page. Scroll to fill it.</p>
      <div className="space-y-4">
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index} className="h-28 rounded-xl border border-ink-700 bg-ink-900" />
        ))}
      </div>
    </div>
  );
}

function SpotlightDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {["Atmosphere", "Restraint", "Intent"].map((title) => (
        <div
          key={title}
          className="relative isolate min-h-44 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 p-6"
        >
          <Spotlight size={220} />
          <h3 className="relative font-serif text-2xl text-ink-0">{title}</h3>
          <p className="relative mt-2 text-sm text-ink-400">Each card carries its own light.</p>
        </div>
      ))}
    </div>
  );
}

function SpinningTextDemo() {
  return (
    <div className="grid min-h-56 place-items-center">
      <div className="relative grid place-items-center">
        <SpinningText
          className="font-mono uppercase tracking-[0.2em] text-ink-300"
          duration={14}
          radius={5.5}
          fontSize={0.75}
        >
          {"taste is the moat • curated not generated • "}
        </SpinningText>
        <span className="absolute grid size-16 place-items-center rounded-full bg-brand-500 font-serif text-lg font-bold text-black">
          TM
        </span>
      </div>
    </div>
  );
}

function TiltDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      <Tilt rotationFactor={14} className="w-56">
        <div className="grid aspect-[3/4] place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-lg font-semibold text-white">
          Toward
        </div>
      </Tilt>
      <Tilt rotationFactor={14} isReverse className="w-56">
        <div className="grid aspect-[3/4] place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 p-6 text-lg font-semibold text-white">
          Reversed
        </div>
      </Tilt>
    </div>
  );
}

function ToolbarDynamicDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <div className="grid min-h-48 place-items-center gap-6">
      <ToolbarDynamic
        actions={[
          { id: "search", label: "Search", icon: SVG_DOT, placeholder: "Search the collection…" },
          { id: "comment", label: "Comment", icon: SVG_DOT, placeholder: "Leave a note…" },
          { id: "share", label: "Share", icon: SVG_DOT, placeholder: "Email address…" },
        ]}
        onSubmit={(id, value) => setSubmitted(`${id}: ${value}`)}
      />
      <p className="text-sm text-ink-400">
        {submitted ? `Submitted → ${submitted}` : "Pick an action; the toolbar becomes that control."}
      </p>
    </div>
  );
}

function ToolbarExpandableDemo() {
  return (
    <div className="grid min-h-56 place-items-center">
      <ToolbarExpandable
        panels={[
          { id: "notes", label: "Notes", icon: SVG_DOT, content: "A short panel." },
          { id: "tasks", label: "Tasks", icon: SVG_DOT, content: "A longer panel, so the container has a different height to animate to. Nothing here is clipped, because the height comes from a measurement rather than a guess." },
          { id: "team", label: "Team", icon: SVG_DOT, content: "A third length again." },
        ]}
      />
    </div>
  );
}

function MagneticDemo() {
  return (
    <div className="grid min-h-56 place-items-center gap-10">
      <Magnetic intensity={0.5} range={140} actionArea="parent">
        <button type="button" className="rounded-full bg-brand-500 px-8 py-3.5 font-semibold text-black">
          Pull me
        </button>
      </Magnetic>
      <p className="text-sm text-ink-400">actionArea=&quot;parent&quot; — it reacts before you reach it.</p>
    </div>
  );
}

function MorphingDialogDemo() {
  const cards = [
    { title: "Kinetic editorial", subtitle: "Template", from: "#4f46e5", to: "#7c3aed" },
    { title: "Generative studio", subtitle: "Template", from: "#0891b2", to: "#2563eb" },
    { title: "Spatial agency", subtitle: "Template", from: "#f97316", to: "#e11d48" },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {cards.map((card) => (
        <MorphingDialog key={card.title}>
          <MorphingDialogTrigger className="w-full overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
            <Swatch label={card.title} from={card.from} to={card.to} />
          </MorphingDialogTrigger>
          <MorphingDialogContent>
            <MorphingDialogClose />
            <div style={{ backgroundImage: `linear-gradient(135deg, ${card.from}, ${card.to})` }} className="h-52" />
            <div className="p-6">
              <MorphingDialogTitle>{card.title}</MorphingDialogTitle>
              <MorphingDialogSubtitle>{card.subtitle}</MorphingDialogSubtitle>
              <p className="mt-4 text-sm leading-relaxed text-ink-300">
                The panel is painted at its final size, transformed back onto the card, then
                released — one composited transform rather than an animated width and height.
              </p>
            </div>
          </MorphingDialogContent>
        </MorphingDialog>
      ))}
    </div>
  );
}

function MorphingPopoverDemo() {
  return (
    <div className="grid min-h-56 place-items-center">
      <MorphingPopover>
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
          <div className="mt-3 flex justify-end">
            <button type="button" className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-black">
              Save
            </button>
          </div>
        </MorphingPopoverContent>
      </MorphingPopover>
    </div>
  );
}

function ProgressiveBlurDemo() {
  const directions = ["bottom", "top", "left", "right"] as const;
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {directions.map((direction) => (
        <div key={direction} className="relative isolate overflow-hidden rounded-2xl">
          <div className="grid h-48 place-items-center bg-[repeating-linear-gradient(45deg,#312e81_0_18px,#4c1d95_18px_36px)] font-mono text-sm text-white/80">
            {direction}
          </div>
          <ProgressiveBlur direction={direction} blurLayers={8} blurIntensity={0.4} />
        </div>
      ))}
    </div>
  );
}

/* ---- registry ----------------------------------------------------------- */

export const MOTION_DEMOS: Record<string, () => React.ReactNode> = {
  "mp-accordion": () => (
    <MotionDemo name="Accordion" description="One-at-a-time disclosure. The panel animates with a grid-template-rows transition, so its content can change size while open without any re-measuring.">
      <AccordionDemo />
    </MotionDemo>
  ),
  "mp-animated-background": () => (
    <MotionDemo name="AnimatedBackground" description="A single highlight slides between children. Only the highlight moves — the children never re-render, and each is found by its data-id.">
      <AnimatedBackgroundDemo />
    </MotionDemo>
  ),
  "mp-animated-group": () => (
    <MotionDemo name="AnimatedGroup" description="Staggered entrance for a list. The stagger is an animation-delay per index rather than an orchestrated timeline, so adding children costs nothing.">
      <AnimatedGroupDemo />
    </MotionDemo>
  ),
  "mp-border-trail": () => (
    <MotionDemo name="BorderTrail" description="One light walks the perimeter of its positioned parent, driven by a four-keyframe path that works everywhere offset-path does not.">
      <BorderTrailDemo />
    </MotionDemo>
  ),
  "mp-carousel": () => (
    <MotionDemo name="Carousel" description="Draggable slides with arrows and indicators. A drag past 20% of the width — or any quick flick — advances; anything less springs back.">
      <CarouselDemo />
    </MotionDemo>
  ),
  "mp-cursor": () => (
    <MotionDemo name="Cursor" description="A custom pointer that trails the real one. Mounts only on fine pointers, and writes position straight to the node instead of through React state.">
      <CursorDemo />
    </MotionDemo>
  ),
  "mp-dialog": () => (
    <MotionDemo name="Dialog" description="A modal with a focus trap, Escape to close, a scroll lock, and focus restored to the trigger afterwards.">
      <DialogDemo />
    </MotionDemo>
  ),
  "mp-disclosure": () => (
    <MotionDemo name="Disclosure" description="A single show/hide region. Same animation as Accordion, without the one-at-a-time constraint.">
      <DisclosureDemo />
    </MotionDemo>
  ),
  "mp-in-view": () => (
    <MotionDemo name="InView" description="Animates between two plain CSS states when it enters the viewport. Any animatable property works, and the observer fails open.">
      <InViewDemo />
    </MotionDemo>
  ),
  "mp-infinite-slider": () => (
    <MotionDemo name="InfiniteSlider" description="A continuous rail specified in pixels per second, so six items and sixty move at the same rate. Horizontal or vertical, forward or reversed.">
      <InfiniteSliderDemo />
    </MotionDemo>
  ),
  "mp-transition-panel": () => (
    <MotionDemo name="TransitionPanel" description="One panel at a time, with the container height animating to the active panel so surrounding content settles instead of jumping.">
      <TransitionPanelDemo />
    </MotionDemo>
  ),

  "mp-text-effect": () => (
    <MotionDemo name="TextEffect" description="Reveals text per word, character, or line. The full string stays in the accessibility tree while the pieces animate.">
      <TextEffectDemo />
    </MotionDemo>
  ),
  "mp-text-loop": () => (
    <MotionDemo name="TextLoop" description="Cycles words in place. Every item shares one grid cell, so the line is sized to the widest and never reflows.">
      <TextLoopDemo />
    </MotionDemo>
  ),
  "mp-text-morph": () => (
    <MotionDemo name="TextMorph" description="Characters are keyed by value and occurrence, so letters the two strings share stay put and only the difference animates.">
      <TextMorphDemo />
    </MotionDemo>
  ),
  "mp-text-roll": () => (
    <MotionDemo name="TextRoll" description="Characters roll out as a copy rolls in on a shared 3D edge, so exit and entrance are one physical movement.">
      <TextRollDemo />
    </MotionDemo>
  ),
  "mp-text-scramble": () => (
    <MotionDemo name="TextScramble" description="Copy resolves out of random characters, left to right. The noise is aria-hidden; the real string is on the container.">
      <TextScrambleDemo />
    </MotionDemo>
  ),
  "mp-text-shimmer": () => (
    <MotionDemo name="TextShimmer" description="A highlight sweeps across the glyphs, with the sweep width derived from the string length.">
      <TextShimmerDemo />
    </MotionDemo>
  ),
  "mp-text-shimmer-wave": () => (
    <MotionDemo name="TextShimmerWave" description="A per-character wave in three dimensions. Distances arrive as CSS custom properties, so one keyframe set serves every configuration.">
      <TextShimmerWaveDemo />
    </MotionDemo>
  ),

  "mp-animated-number": () => (
    <MotionDemo name="AnimatedNumber" description="A figure that springs to each new value. For live numbers that change — unlike Counter, which counts up once on arrival.">
      <AnimatedNumberDemo />
    </MotionDemo>
  ),
  "mp-sliding-number": () => (
    <MotionDemo name="SlidingNumber" description="An odometer. Each column holds 0–9 and is translated, so a digit physically rolls through the values in between.">
      <SlidingNumberDemo />
    </MotionDemo>
  ),

  "mp-dock": () => (
    <MotionDemo name="Dock" description="macOS-style magnification from pointer distance. Sizes are written straight to the item nodes, never through state.">
      <DockDemo />
    </MotionDemo>
  ),
  "mp-glow-effect": () => (
    <MotionDemo name="GlowEffect" description="A coloured glow behind any positioned element. The gradient is composed once and each mode is a CSS animation over it.">
      <GlowEffectDemo />
    </MotionDemo>
  ),
  "mp-image-comparison": () => (
    <MotionDemo name="ImageComparison" description="A before/after wipe. The handle is a real range input, so the split is keyboard-operable and announced — dragging is the enhancement.">
      <ImageComparisonDemo />
    </MotionDemo>
  ),
  "mp-scroll-progress": () => (
    <MotionDemo name="ScrollProgress" description="A reading-progress bar for the page or any scroll container. Scales rather than resizes, so it stays on the compositor.">
      <ScrollProgressDemo />
    </MotionDemo>
  ),
  "mp-spotlight": () => (
    <MotionDemo name="Spotlight" description="A self-contained light that follows the pointer across its parent. Needs no coordination with siblings, unlike SpotlightGrid.">
      <SpotlightDemo />
    </MotionDemo>
  ),
  "mp-spinning-text": () => (
    <MotionDemo name="SpinningText" description="Text laid around a circle. The ring spins as one element, so the letters keep their spacing exactly.">
      <SpinningTextDemo />
    </MotionDemo>
  ),
  "mp-tilt": () => (
    <MotionDemo name="Tilt" description="3D rotation as the pointer crosses. The perspective lives on a wrapper so nested content shares one vanishing point.">
      <TiltDemo />
    </MotionDemo>
  ),

  "mp-toolbar-dynamic": () => (
    <MotionDemo name="ToolbarDynamic" description="A toolbar that becomes the control you selected, then returns. The container animates its own width so the layout never jumps.">
      <ToolbarDynamicDemo />
    </MotionDemo>
  ),
  "mp-toolbar-expandable": () => (
    <MotionDemo name="ToolbarExpandable" description="A compact toolbar that opens a panel above its buttons, animating to the panel's measured height rather than a fixed value.">
      <ToolbarExpandableDemo />
    </MotionDemo>
  ),

  "mp-magnetic": () => (
    <MotionDemo name="Magnetic" description="Pulls its child toward the pointer within a set range. actionArea decides whether the pull arms on the element, its parent, or globally.">
      <MagneticDemo />
    </MotionDemo>
  ),
  "mp-morphing-dialog": () => (
    <MotionDemo name="MorphingDialog" description="A dialog that grows out of the card that opened it, using FLIP so one composited transform runs instead of an animated width and height.">
      <MorphingDialogDemo />
    </MotionDemo>
  ),
  "mp-morphing-popover": () => (
    <MotionDemo name="MorphingPopover" description="A trigger that expands in place into a panel. Anchored rather than portalled, so the two read as one surface growing.">
      <MorphingPopoverDemo />
    </MotionDemo>
  ),
  "mp-progressive-blur": () => (
    <MotionDemo name="ProgressiveBlur" description="A gradual blur ramped toward one edge. CSS cannot interpolate backdrop-filter, so the falloff is stacked masked layers.">
      <ProgressiveBlurDemo />
    </MotionDemo>
  ),
};
