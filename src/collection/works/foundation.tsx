/**
 * Foundation elements — the plain, unglamorous pieces every page needs.
 *
 * Each entry exposes the props that actually change how the component reads,
 * not every prop it accepts: `className` is deliberately absent everywhere,
 * because a class field in a preview panel is a text box that can only break
 * the demo.
 */
import {
  Accordion,
  AvatarStack,
  Badge,
  BrowserFrame,
  Button,
  Card,
  Container,
  CopyField,
  Counter,
  GradientText,
  Marquee,
  Rating,
  Reveal,
  Section,
  SectionHeading,
  SegmentedControl,
  StatusBadge,
} from "../../ui/index";
import type { Work } from "../types";
import { bool, num, range, select, str, text, toggle, usage } from "../types";

const GROUP = "Foundation";

function base(
  id: string,
  name: string,
  description: string,
): Pick<Work, "id" | "name" | "group" | "kind" | "description"> {
  return { id, name, group: GROUP, kind: "Foundation", description };
}

const PANEL = "w-full max-w-2xl";

export const foundationWorks: Work[] = [
  {
    ...base("button", "Button", "Primary, secondary, and ghost actions with accessible focus states."),
    fit: "center",
    controls: [
      text("label", "Label", "Explore the collection"),
      select("variant", "Variant", "primary", ["primary", "secondary", "ghost"]),
      select("size", "Size", "md", ["sm", "md", "lg"]),
      toggle("row", "Show all three", true),
    ],
    render: (v) => {
      const label = str(v, "label", "Button");
      const size = str(v, "size", "md") as "sm" | "md" | "lg";
      const variant = str(v, "variant", "primary") as "primary" | "secondary" | "ghost";
      if (!bool(v, "row", true)) {
        return <Button variant={variant} size={size}>{label}</Button>;
      }
      return (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size={size}>{label}</Button>
          <Button variant="secondary" size={size}>Secondary</Button>
          <Button variant="ghost" size={size}>Ghost</Button>
        </div>
      );
    },
    code: (v) =>
      usage("Button", { variant: str(v, "variant"), size: str(v, "size") }, str(v, "label")),
  },
  {
    ...base("badge", "Badge", "Compact labels for announcements, releases, and metadata."),
    fit: "center",
    controls: [text("label", "Label", "New — v2.4 is live"), toggle("dot", "Leading dot", true)],
    render: (v) => (
      <Badge>
        {bool(v, "dot", true) ? <span className="size-1.5 rounded-full bg-brand-400" /> : null}
        {str(v, "label", "Badge")}
      </Badge>
    ),
    code: (v) => usage("Badge", {}, str(v, "label")),
  },
  {
    ...base("card", "Card", "A consistent bordered surface for content and controls."),
    fit: "center",
    controls: [
      text("title", "Title", "Signal over noise", 40),
      text("body", "Body", "A quiet container that lets its contents lead.", 90),
      range("columns", "Cards", 2, 1, 3),
    ],
    render: (v) => (
      <div
        className="grid w-full max-w-3xl gap-4"
        style={{ gridTemplateColumns: `repeat(${num(v, "columns", 2)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: num(v, "columns", 2) }, (_, i) => (
          <Card key={i}>
            <h3 className="text-lg font-semibold text-ink-0">{str(v, "title")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">{str(v, "body")}</p>
          </Card>
        ))}
      </div>
    ),
    code: () => `<Card>\n  <h3>Signal over noise</h3>\n  <p>A quiet container that lets its contents lead.</p>\n</Card>`,
  },
  {
    ...base("container", "Container", "Responsive page width and horizontal rhythm."),
    fit: "center",
    controls: [select("width", "Max width", "max-w-6xl", ["max-w-3xl", "max-w-4xl", "max-w-6xl", "max-w-full"])],
    render: (v) => (
      <div className="w-full rounded-2xl border border-dashed border-brand-400/40 bg-brand-500/5 py-8">
        <Container className={str(v, "width", "max-w-6xl")}>
          <div className="rounded-xl border border-ink-700 bg-ink-900/70 p-6 text-center text-sm text-ink-300">
            Content sits inside the container. The dashed edge is the page; the
            solid edge is the measure.
          </div>
        </Container>
      </div>
    ),
    code: (v) => `<Container className="${str(v, "width", "max-w-6xl")}">\n  {/* page content */}\n</Container>`,
  },
  {
    ...base("section", "Section", "Shader-free vertical spacing for page composition."),
    fit: "flow",
    controls: [select("rhythm", "Rhythm", "default", ["tight", "default", "roomy"])],
    render: (v) => {
      const rhythm = str(v, "rhythm", "default");
      const cls = rhythm === "tight" ? "!py-10" : rhythm === "roomy" ? "!py-32" : "";
      return (
        <div className="w-full">
          <div className="border-y border-dashed border-brand-400/30 bg-brand-500/5">
            <Section className={cls}>
              <Container>
                <p className="text-center text-sm text-ink-300">
                  One section of vertical rhythm — {rhythm}.
                </p>
              </Container>
            </Section>
          </div>
        </div>
      );
    },
    code: () => `<Section>\n  <Container>{/* … */}</Container>\n</Section>`,
  },
  {
    ...base("section-heading", "SectionHeading", "Eyebrow, title, and supporting copy with stable hierarchy."),
    fit: "center",
    controls: [
      text("eyebrow", "Eyebrow", "The selection", 32),
      text("title", "Title", "Made to be remembered", 48),
      text("description", "Description", "A heading system that keeps its hierarchy at any width.", 110),
      select("align", "Align", "center", ["center", "left"]),
    ],
    render: (v) => (
      <SectionHeading
        className={PANEL}
        eyebrow={str(v, "eyebrow")}
        title={str(v, "title")}
        description={str(v, "description")}
        align={str(v, "align", "center") as "left" | "center"}
      />
    ),
    code: (v) =>
      usage("SectionHeading", {
        eyebrow: str(v, "eyebrow"),
        title: str(v, "title"),
        description: str(v, "description"),
        align: str(v, "align"),
      }),
  },
  {
    ...base("gradient-text", "GradientText", "Brand-gradient display type with a readable fallback."),
    fit: "center",
    controls: [
      text("text", "Text", "can't copy your eye", 32),
      range("size", "Size", 4, 1.5, 8, 0.25, "rem"),
    ],
    render: (v) => (
      <p
        className="text-center font-serif leading-[1.05] tracking-[-0.04em] text-ink-0"
        style={{ fontSize: `${num(v, "size", 4)}rem` }}
      >
        They <GradientText>{str(v, "text")}</GradientText>
      </p>
    ),
    code: (v) => usage("GradientText", {}, str(v, "text")),
  },
  {
    ...base("reveal", "Reveal", "Scroll entrance that respects reduced motion and fails open."),
    fit: "center",
    controls: [range("delay", "Stagger", 90, 0, 400, 10, "ms"), range("items", "Items", 3, 1, 5)],
    render: (v) => (
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {Array.from({ length: num(v, "items", 3) }, (_, i) => (
          <Reveal key={i} delay={i * num(v, "delay", 90)}>
            <Card className="text-center">
              <span className="font-mono text-xs text-brand-300">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 text-sm text-ink-200">Enters on view</p>
            </Card>
          </Reveal>
        ))}
      </div>
    ),
    code: (v) => usage("Reveal", { delay: num(v, "delay", 90) }, "{/* child */}"),
  },
  {
    ...base("marquee", "Marquee", "Reusable continuous rail for logos, proof, and messages."),
    fit: "center",
    controls: [range("duration", "Loop", 26, 6, 70, 1, "s"), toggle("fade", "Fade edges", true)],
    render: (v) => (
      <Marquee className="w-full" duration={num(v, "duration", 26)} fade={bool(v, "fade", true)}>
        {["Northwind", "Cobalt", "Meridian", "Fathom", "Lumen", "Halcyon"].map((name) => (
          <span key={name} className="mx-8 font-serif text-2xl text-ink-300">
            {name}
          </span>
        ))}
      </Marquee>
    ),
    code: (v) =>
      usage("Marquee", { duration: num(v, "duration", 26), fade: bool(v, "fade", true) }, "{/* items */}"),
  },
  {
    ...base("accordion", "Accordion", "Keyboard-accessible disclosure for FAQs and details."),
    fit: "center",
    controls: [
      toggle("multiple", "Allow multiple open", false),
      range("open", "Open by default", 0, -1, 2),
    ],
    render: (v) => (
      <Accordion
        className={PANEL}
        multiple={bool(v, "multiple")}
        defaultOpen={num(v, "open", 0)}
        items={[
          { question: "Is every piece editable?", answer: "Yes — plain TypeScript and Tailwind, no runtime beyond React." },
          { question: "Does it respect reduced motion?", answer: "Every animated element checks the media query and falls back to a static state." },
          { question: "What about WebGL failure?", answer: "Shader surfaces paint a gradient derived from their own colours instead." },
        ]}
      />
    ),
    code: (v) =>
      usage("Accordion", { multiple: bool(v, "multiple"), defaultOpen: num(v, "open", 0) }),
  },
  {
    ...base("counter", "Counter", "Viewport-triggered numeric count-up with truthful fallbacks."),
    fit: "center",
    controls: [
      range("value", "Value", 94, 1, 5000, 1),
      range("duration", "Duration", 1600, 200, 4000, 100, "ms"),
      range("decimals", "Decimals", 0, 0, 2),
      text("prefix", "Prefix", "", 4),
      text("suffix", "Suffix", "%", 4),
    ],
    render: (v) => (
      <Counter
        className="font-serif text-7xl tracking-tight text-ink-0"
        value={num(v, "value", 94)}
        duration={num(v, "duration", 1600)}
        decimals={num(v, "decimals", 0)}
        prefix={str(v, "prefix")}
        suffix={str(v, "suffix")}
      />
    ),
    code: (v) =>
      usage("Counter", {
        value: num(v, "value", 94),
        duration: num(v, "duration", 1600),
        decimals: num(v, "decimals") || undefined,
        prefix: str(v, "prefix") || undefined,
        suffix: str(v, "suffix") || undefined,
      }),
  },
  {
    ...base("browser-frame", "BrowserFrame", "Product screenshot and live-demo framing with browser chrome."),
    fit: "center",
    controls: [text("url", "URL", "tasteisthemoat.dev", 40), toggle("glow", "Glow", true)],
    render: (v) => (
      <BrowserFrame className="w-full max-w-2xl" url={str(v, "url")} glow={bool(v, "glow", true)}>
        <div className="aspect-[16/10] bg-[radial-gradient(circle_at_25%_20%,rgba(249,115,22,.28),transparent_45%),radial-gradient(circle_at_78%_74%,rgba(190,242,100,.2),transparent_46%),#0b0908] p-8">
          <div className="h-2 w-24 rounded-full bg-white/25" />
          <div className="mt-8 h-6 w-2/3 rounded-full bg-white/80" />
          <div className="mt-3 h-2 w-1/2 rounded-full bg-white/25" />
        </div>
      </BrowserFrame>
    ),
    code: (v) => usage("BrowserFrame", { url: str(v, "url"), glow: bool(v, "glow", true) }, "{/* screenshot */}"),
  },
  {
    ...base("avatar-stack", "AvatarStack", "Compact people proof with initials and overflow count."),
    fit: "center",
    controls: [
      range("count", "People", 5, 1, 8),
      range("max", "Shown", 4, 1, 8),
      select("size", "Size", "md", ["sm", "md", "lg"]),
    ],
    render: (v) => (
      <div className="flex items-center gap-4">
        <AvatarStack
          size={str(v, "size", "md") as "sm" | "md" | "lg"}
          max={num(v, "max", 4)}
          items={["Ada Ford", "Ben Ito", "Cleo Ray", "Dara Nix", "Elia Vos", "Fen Ash", "Gil Roe", "Hana Ito"]
            .slice(0, num(v, "count", 5))
            .map((name) => ({ name }))}
        />
        <span className="text-sm text-ink-400">trusted by {num(v, "count", 5)} teams</span>
      </div>
    ),
    code: (v) => usage("AvatarStack", { max: num(v, "max", 4), size: str(v, "size") }),
  },
  {
    ...base("rating", "Rating", "Accessible rating and review proof."),
    fit: "center",
    controls: [
      range("value", "Value", 4.5, 0, 5, 0.1),
      range("max", "Out of", 5, 3, 10),
      select("size", "Size", "md", ["sm", "md"]),
      text("label", "Label", "from 1,204 reviews", 32),
    ],
    render: (v) => (
      <Rating
        value={num(v, "value", 4.5)}
        max={num(v, "max", 5)}
        size={str(v, "size", "md") as "sm" | "md"}
        label={str(v, "label")}
      />
    ),
    code: (v) =>
      usage("Rating", {
        value: num(v, "value", 4.5),
        max: num(v, "max", 5),
        size: str(v, "size"),
        label: str(v, "label"),
      }),
  },
  {
    ...base("copy-field", "CopyField", "One-click copy for commands, keys, and snippets."),
    fit: "center",
    controls: [
      text("value", "Value", "npm install taste-is-the-moat", 48),
      text("label", "Label", "Install the collection", 32),
      text("copyLabel", "Button", "Copy", 12),
    ],
    render: (v) => (
      <CopyField
        className="w-full max-w-xl"
        value={str(v, "value")}
        label={str(v, "label")}
        copyLabel={str(v, "copyLabel", "Copy")}
      />
    ),
    code: (v) =>
      usage("CopyField", { value: str(v, "value"), label: str(v, "label"), copyLabel: str(v, "copyLabel") }),
  },
  {
    ...base("segmented-control", "SegmentedControl", "Small mutually exclusive option switcher."),
    fit: "center",
    controls: [range("count", "Options", 3, 2, 4), text("label", "Group label", "Billing period", 28)],
    render: (v) => (
      <SegmentedControl
        label={str(v, "label")}
        options={["Monthly", "Annual", "Two years", "Lifetime"]
          .slice(0, num(v, "count", 3))
          .map((label) => ({ label, value: label.toLowerCase() }))}
      />
    ),
    code: (v) => usage("SegmentedControl", { label: str(v, "label") }),
  },
  {
    ...base("status-badge", "StatusBadge", "Operational, informational, warning, and neutral states."),
    fit: "center",
    controls: [
      select("tone", "Tone", "positive", ["positive", "info", "warning", "neutral"]),
      toggle("pulse", "Pulse", true),
      text("label", "Label", "All systems operational", 32),
      toggle("all", "Show every tone", true),
    ],
    render: (v) => {
      const pulse = bool(v, "pulse", true);
      if (!bool(v, "all", true)) {
        return (
          <StatusBadge tone={str(v, "tone", "positive") as never} pulse={pulse}>
            {str(v, "label")}
          </StatusBadge>
        );
      }
      return (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <StatusBadge tone="positive" pulse={pulse}>{str(v, "label")}</StatusBadge>
          <StatusBadge tone="info" pulse={pulse}>Deploying</StatusBadge>
          <StatusBadge tone="warning" pulse={pulse}>Degraded</StatusBadge>
          <StatusBadge tone="neutral" pulse={pulse}>Archived</StatusBadge>
        </div>
      );
    },
    code: (v) => usage("StatusBadge", { tone: str(v, "tone"), pulse: bool(v, "pulse", true) }, str(v, "label")),
  },
];
