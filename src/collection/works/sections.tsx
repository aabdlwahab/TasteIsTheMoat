/**
 * The React section library — the twenty-six pieces a landing page is actually
 * assembled from.
 *
 * Sections are tall by nature, so they all preview in `flow`: the stage
 * scrolls, and the viewport control on the workbench is what makes the
 * responsive behaviour visible.
 */
import {
  AnnouncementBar,
  BlogGrid,
  CTA,
  Changelog,
  Comparison,
  Contact,
  CustomerStory,
  FAQ,
  FeatureRows,
  Features,
  Footer,
  Gallery,
  Hero,
  Integrations,
  LogoCloud,
  Nav,
  Newsletter,
  Pricing,
  ProductShowcase,
  Stats,
  Steps,
  Team,
  Testimonials,
  TrustCenter,
  UseCases,
  Waitlist,
} from "../../sections/index";
import { BorderBeam, BrandMark, BrowserFrame, Container, GradientText } from "../../ui/index";
import { shaderList } from "../../shaders/index";
import type { BrandPalette } from "../../core/theme";
import type { ScrimStrength } from "../../ui/ShaderSection";
import type { Work } from "../types";
import { bool, num, range, select, shaderSelect, str, text, toggle, usage } from "../types";

const SHADER_IDS = shaderList.map((shader) => shader.id);
const SCRIM_OPTIONS = ["none", "subtle", "medium", "strong"];

const brand: BrandPalette = {
  primary: "#f97316",
  secondary: "#f43f5e",
  accent: "#bef264",
  background: "#080706",
};

function scrimOf(v: Record<string, unknown>, fallback: ScrimStrength = "medium"): ScrimStrength {
  const raw = v.scrim;
  return (typeof raw === "string" ? raw : fallback) as ScrimStrength;
}

function base(
  id: string,
  name: string,
  description: string,
): Pick<Work, "id" | "name" | "group" | "kind" | "description" | "fit"> {
  return { id: `section-${id}`, name, group: "Sections", kind: "Section", description, fit: "flow" };
}

const FEATURES = [
  { title: "One palette, everywhere", description: "Set your brand colours once. Sections and shader uniforms recolour together." },
  { title: "Cursor-aware backgrounds", description: "Fifteen shaders respond to the pointer — ripples, tilt, reveal." },
  { title: "Reduced motion, handled", description: "Every animated surface checks the media query and falls back honestly." },
  { title: "Pauses off screen", description: "A page with six shaders only pays for the one you are looking at." },
  { title: "Fails open", description: "No WebGL? A gradient derived from the shader's own colours takes its place." },
  { title: "Yours to edit", description: "Plain TypeScript and Tailwind, copied into your repo, not hidden in a package." },
];

const TIERS = [
  { name: "Open source", monthly: 0, description: "Everything in the repository.", features: ["69 shaders", "26 sections", "MIT licensed"], cta: { label: "Clone the repo", href: "#" } },
  { name: "Studio", monthly: 24, description: "For teams shipping regularly.", features: ["Private templates", "Brand presets", "Priority fixes"], featured: true, cta: { label: "Start free trial", href: "#" } },
  { name: "Enterprise", monthly: 96, description: "For larger design systems.", features: ["Design review", "Custom shaders", "SLA"], cta: { label: "Talk to us", href: "#" } },
];

const FAQ_ITEMS = [
  { question: "Does this need React?", answer: "The shader runtime is dependency-free. The sections are React and Tailwind." },
  { question: "How large is the runtime?", answer: "Around 8 kB gzipped, excluding React." },
  { question: "Can I edit the GLSL?", answer: "Yes — the studio recompiles live and exports a self-contained HTML file." },
  { question: "What happens without WebGL?", answer: "Sections render a brand-tinted gradient instead of the shader." },
];

const TESTIMONIALS = [
  { quote: "We replaced a bespoke Three.js hero with one component and deleted 400 lines.", name: "Ada Okonkwo", role: "Staff Engineer, Northwind" },
  { quote: "The brand palette mapping is the part I didn't expect. Our shaders match our buttons.", name: "Tomas Reyes", role: "Design Lead, Vertex" },
  { quote: "Shipped a launch page in an afternoon. The CTA shader got more comments than the product.", name: "Priya Raman", role: "Founder, Lumen" },
  { quote: "It pauses when scrolled away. Our Lighthouse score didn't budge.", name: "Sven Aalto", role: "Web Lead, Cobalt" },
  { quote: "Copy-paste components in our own repo. No black box to fight.", name: "Mei Chen", role: "Frontend, Meridian" },
  { quote: "Reduced-motion handling was already correct. That never happens.", name: "Jonah Blake", role: "Accessibility, Fathom" },
];

const LOGOS = ["Northwind", "Acme Corp", "Vertex", "Lumen", "Cobalt", "Meridian", "Fathom"];

function Panel({ from, to }: { from: string; to: string }) {
  return (
    <div
      className="aspect-[16/10]"
      style={{ backgroundImage: `radial-gradient(circle at 28% 26%, ${from}, transparent 42%), linear-gradient(140deg, #10131d, ${to})` }}
    />
  );
}

export const sectionWorks: Work[] = [
  {
    ...base("announcement-bar", "AnnouncementBar", "A dismissible top-of-page announcement whose dismissal persists per key."),
    controls: [
      select("variant", "Variant", "gradient", ["gradient", "subtle"]),
      toggle("dismissible", "Dismissible", true),
      text("label", "Message", "v0.2 is out — 69 shaders and 26 sections", 60),
    ],
    render: (v) => (
      <div>
        <AnnouncementBar
          href="#"
          variant={str(v, "variant", "gradient") as "gradient" | "subtle"}
          dismissible={bool(v, "dismissible", true)}
          storageKey={`workbench-${str(v, "variant", "gradient")}`}
        >
          <span>{str(v, "label")}</span>
          <span aria-hidden="true">→</span>
        </AnnouncementBar>
        <Container className="py-16">
          <p className="text-ink-400">
            Dismissal persists per <code className="text-ink-200">storageKey</code>.
          </p>
        </Container>
      </div>
    ),
    code: (v) =>
      usage("AnnouncementBar", { variant: str(v, "variant"), dismissible: bool(v, "dismissible", true) }, str(v, "label")),
  },
  {
    ...base("nav", "Nav", "Transparent over a hero, solid on scroll, with a mobile drawer."),
    controls: [
      toggle("transparent", "Transparent until scroll", false),
      range("links", "Links", 3, 1, 5),
      toggle("secondary", "Secondary CTA", true),
    ],
    render: (v) => (
      <div className="min-h-[420px] bg-gradient-to-b from-brand-900 to-ink-950">
        <Nav
          logo={
            <>
              <BrandMark className="size-7 text-brand-400" />
              <span>Taste is the Moat</span>
            </>
          }
          transparentUntilScroll={bool(v, "transparent")}
          links={["Features", "Pricing", "Docs", "Changelog", "Blog"]
            .slice(0, num(v, "links", 3))
            .map((label) => ({ label, href: "#" }))}
          secondaryCta={bool(v, "secondary", true) ? { label: "Sign in", href: "#" } : undefined}
          cta={{ label: "Get started", href: "#" }}
        />
      </div>
    ),
    code: (v) => usage("Nav", { transparentUntilScroll: bool(v, "transparent") }),
  },
  {
    ...base("hero", "Hero", "A product opening, centred or split between argument and interface."),
    controls: [
      select("layout", "Layout", "centered", ["centered", "split"]),
      shaderSelect(SHADER_IDS, "mesh-gradient"),
      select("scrim", "Scrim", "medium", SCRIM_OPTIONS),
      text("headline", "Headline", "Landing pages that move.", 48),
      text("subhead", "Subhead", "A React section library with WebGL shader backgrounds built in.", 90),
      toggle("badge", "Badge", true),
      toggle("fadeBottom", "Fade into next section", false),
    ],
    render: (v) => (
      <Hero
        layout={str(v, "layout", "centered") as "centered" | "split"}
        shader={str(v, "shader", "mesh-gradient")}
        brand={brand}
        scrim={scrimOf(v)}
        fadeBottom={bool(v, "fadeBottom")}
        badge={bool(v, "badge", true) ? { label: "v0.2 out now" } : undefined}
        headline={
          <>
            {str(v, "headline", "Landing pages that move.")}{" "}
            <GradientText>Not templates.</GradientText>
          </>
        }
        subhead={str(v, "subhead")}
        primaryAction={{ label: "Start building", href: "#" }}
        secondaryAction={{ label: "Browse shaders", href: "#" }}
        note="MIT licensed · Zero runtime dependencies"
        visual={
          <BrowserFrame url="tasteisthemoat.dev/studio">
            <Panel from="#4f46e5" to="#191326" />
          </BrowserFrame>
        }
      />
    ),
    code: (v) =>
      usage("Hero", {
        layout: str(v, "layout"),
        shader: str(v, "shader"),
        scrim: str(v, "scrim"),
        headline: str(v, "headline"),
      }),
  },
  {
    ...base("logo-cloud", "LogoCloud", "Customer proof as a quiet grid or a continuous rail."),
    controls: [select("variant", "Variant", "grid", ["grid", "marquee"]), range("count", "Logos", 5, 3, 7)],
    render: (v) => (
      <div className="py-16">
        <LogoCloud
          variant={str(v, "variant", "grid") as "grid" | "marquee"}
          logos={LOGOS.slice(0, num(v, "count", 5))}
        />
      </div>
    ),
    code: (v) => usage("LogoCloud", { variant: str(v, "variant") }),
  },
  {
    ...base("features", "Features", "A feature system with hierarchy built into the grid."),
    controls: [
      select("variant", "Variant", "grid", ["grid", "alternating", "bento"]),
      range("count", "Features", 6, 2, 6),
      text("title", "Title", "Everything a marketing page needs", 48),
    ],
    render: (v) => {
      const variant = str(v, "variant", "grid") as "grid" | "alternating" | "bento";
      const items = FEATURES.slice(0, num(v, "count", 6));
      return (
        <Features
          eyebrow="Why Taste is the Moat"
          title={str(v, "title")}
          description="Sections that already know how to host a shader."
          variant={variant}
          features={variant === "bento" ? items.map((f, i) => ({ ...f, wide: i === 0 })) : items}
        />
      );
    },
    code: (v) => usage("Features", { variant: str(v, "variant"), title: str(v, "title") }),
  },
  {
    ...base("product-showcase", "ProductShowcase", "Tabbed screenshots with a keyboard-navigable tablist."),
    controls: [toggle("framed", "Browser frame", true), range("tabs", "Tabs", 3, 2, 3)],
    render: (v) => (
      <ProductShowcase
        eyebrow="The product"
        title="Three surfaces, one system"
        framed={bool(v, "framed", true)}
        tabs={[
          { label: "Studio", url: "tasteisthemoat.dev/studio", description: "Tune uniforms and edit GLSL with live recompile.", content: <Panel from="#4f46e5" to="#191326" /> },
          { label: "Sections", url: "tasteisthemoat.dev/sections", description: "Twenty-six reusable sections for marketing pages.", content: <Panel from="#06b6d4" to="#111c24" /> },
          { label: "Export", url: "tasteisthemoat.dev/export", description: "One self-contained HTML file.", content: <Panel from="#a855f7" to="#231419" /> },
        ].slice(0, num(v, "tabs", 3))}
      />
    ),
    code: (v) => usage("ProductShowcase", { framed: bool(v, "framed", true) }),
  },
  {
    ...base("steps", "Steps", "A process told as a deliberate sequence instead of three boxes."),
    controls: [select("variant", "Variant", "row", ["row", "timeline"]), range("count", "Steps", 3, 2, 3)],
    render: (v) => (
      <Steps
        eyebrow="How it works"
        title="From clone to launch"
        variant={str(v, "variant", "row") as "row" | "timeline"}
        steps={[
          { title: "Install", description: "Copy the components you want into your project.", visual: <BorderBeam contentClassName="p-4"><code className="block font-mono text-[13px] text-ink-200">npm i taste-is-the-moat</code></BorderBeam> },
          { title: "Pick a shader", description: "Browse 69 in the studio, tune the uniforms, note the id." },
          { title: "Ship", description: "Drop in a Hero, pass your brand palette, deploy." },
        ].slice(0, num(v, "count", 3))}
      />
    ),
    code: (v) => usage("Steps", { variant: str(v, "variant") }),
  },
  {
    ...base("stats", "Stats", "Figures that count up when they enter the viewport."),
    controls: [toggle("bordered", "Bordered", true), range("count", "Stats", 4, 2, 4)],
    render: (v) => (
      <div className="py-16">
        <Stats
          bordered={bool(v, "bordered", true)}
          stats={[
            { value: 69, label: "Shaders included" },
            { value: 15, label: "Cursor-interactive" },
            { value: 26, label: "Sections" },
            { value: 60, suffix: "fps", label: "On a 2019 laptop" },
          ].slice(0, num(v, "count", 4))}
        />
      </div>
    ),
    code: (v) => usage("Stats", { bordered: bool(v, "bordered", true) }),
  },
  {
    ...base("testimonials", "Testimonials", "Customer proof as a grid, a single feature, or a moving rail."),
    controls: [
      select("variant", "Variant", "grid", ["grid", "featured", "marquee"]),
      range("count", "Quotes", 6, 1, 6),
    ],
    render: (v) => {
      const variant = str(v, "variant", "grid") as "grid" | "featured" | "marquee";
      return (
        <Testimonials
          eyebrow="Proof"
          title="What teams say after shipping"
          variant={variant}
          testimonials={TESTIMONIALS.slice(0, variant === "featured" ? 1 : num(v, "count", 6))}
        />
      );
    },
    code: (v) => usage("Testimonials", { variant: str(v, "variant") }),
  },
  {
    ...base("integrations", "Integrations", "Ecosystem tiles or cards, with coming-soon flags."),
    controls: [select("variant", "Variant", "tiles", ["tiles", "cards"]), range("count", "Integrations", 8, 4, 8)],
    render: (v) => (
      <Integrations
        eyebrow="Works with"
        title="It fits the stack you already have"
        variant={str(v, "variant", "tiles") as "tiles" | "cards"}
        integrations={[
          { name: "Next.js" }, { name: "Astro" }, { name: "Remix" }, { name: "Vite" },
          { name: "Tailwind" }, { name: "Figma", comingSoon: true },
          { name: "Framer", comingSoon: true }, { name: "Webflow", comingSoon: true },
        ].slice(0, num(v, "count", 8))}
      />
    ),
    code: (v) => usage("Integrations", { variant: str(v, "variant") }),
  },
  {
    ...base("comparison", "Comparison", "A feature table with groups and a highlighted column."),
    controls: [range("highlight", "Highlight column", 0, 0, 2), toggle("footnote", "Footnote", true)],
    render: (v) => (
      <Comparison
        eyebrow="Honestly"
        title="Against the two alternatives"
        highlight={num(v, "highlight", 0)}
        columns={["Taste is the Moat", "Video background", "CSS gradient"]}
        rows={[
          { group: "Visuals", feature: "Animated", values: [true, true, false] },
          { feature: "Cursor-interactive", values: [true, false, false] },
          { feature: "Brand recolouring", values: [true, false, true] },
          { group: "Performance", feature: "Payload", values: ["~8 kB", "2–20 MB", "0 kB"] },
          { feature: "Pauses offscreen", values: [true, false, true] },
          { group: "Accessibility", feature: "Respects reduced motion", values: [true, "Manual", true] },
        ]}
        footnote={bool(v, "footnote", true) ? "Payload measured gzipped, excluding React." : undefined}
      />
    ),
    code: (v) => usage("Comparison", { highlight: num(v, "highlight", 0) }),
  },
  {
    ...base("pricing", "Pricing", "Tiers with a monthly/annual toggle and one featured column."),
    controls: [
      toggle("showToggle", "Billing toggle", true),
      range("discount", "Annual discount", 20, 0, 50, 5, "%"),
      text("currency", "Currency", "$", 3),
    ],
    render: (v) => (
      <Pricing
        eyebrow="Pricing"
        title="Start free. Upgrade when it ships."
        tiers={TIERS}
        showToggle={bool(v, "showToggle", true)}
        annualDiscount={num(v, "discount", 20) / 100}
        currency={str(v, "currency", "$")}
      />
    ),
    code: (v) =>
      usage("Pricing", { showToggle: bool(v, "showToggle", true), annualDiscount: num(v, "discount", 20) / 100 }),
  },
  {
    ...base("faq", "FAQ", "An accordion for the questions that block a decision."),
    controls: [range("count", "Questions", 4, 2, 4), text("title", "Title", "Questions, answered", 40)],
    render: (v) => (
      <FAQ
        eyebrow="FAQ"
        title={str(v, "title")}
        items={FAQ_ITEMS.slice(0, num(v, "count", 4))}
      />
    ),
    code: (v) => usage("FAQ", { title: str(v, "title") }),
  },
  {
    ...base("team", "Team", "The people behind the work, as a grid or a list."),
    controls: [select("variant", "Variant", "grid", ["grid", "list"]), range("count", "Members", 4, 2, 4)],
    render: (v) => (
      <Team
        eyebrow="The team"
        title="Small, opinionated, and shipping"
        variant={str(v, "variant", "grid") as "grid" | "list"}
        members={[
          { name: "Ada Okonkwo", role: "Engineering" },
          { name: "Tomas Reyes", role: "Design" },
          { name: "Priya Raman", role: "Founder" },
          { name: "Sven Aalto", role: "Graphics" },
        ].slice(0, num(v, "count", 4))}
      />
    ),
    code: (v) => usage("Team", { variant: str(v, "variant") }),
  },
  {
    ...base("blog-grid", "BlogGrid", "Editorial index with an optional featured lead post."),
    controls: [toggle("featureFirst", "Feature the first post", true), range("count", "Posts", 3, 2, 3)],
    render: (v) => (
      <BlogGrid
        eyebrow="Writing"
        title="Field notes"
        featureFirst={bool(v, "featureFirst", true)}
        viewAll={{ label: "All posts", href: "#" }}
        posts={[
          { title: "Why thin-film interference makes shaders look expensive", href: "#", excerpt: "The physics behind holographic foil, and why it shatters if you feed it noise.", date: "2026-07-12", category: "Graphics", readingTime: "8 min", author: { name: "Sven Aalto" } },
          { title: "One WebGL context for fifty shaders", href: "#", excerpt: "Browsers cap live contexts and silently drop the oldest.", date: "2026-06-28", category: "Performance", readingTime: "6 min", author: { name: "Ada Okonkwo" } },
          { title: "Making motion accessible", href: "#", excerpt: "Reduced motion, scrims, and reveals that fail open.", date: "2026-06-04", category: "Accessibility", readingTime: "5 min", author: { name: "Jonah Blake" } },
        ].slice(0, num(v, "count", 3))}
      />
    ),
    code: (v) => usage("BlogGrid", { featureFirst: bool(v, "featureFirst", true) }),
  },
  {
    ...base("cta", "CTA", "The closing ask, as a full band or a contained card."),
    controls: [
      select("variant", "Variant", "band", ["band", "card"]),
      shaderSelect(SHADER_IDS, "liquid-ripple"),
      select("scrim", "Scrim", "medium", SCRIM_OPTIONS),
      text("title", "Title", "Ship something worth looking at.", 48),
    ],
    render: (v) => (
      <CTA
        variant={str(v, "variant", "band") as "band" | "card"}
        shader={str(v, "shader", "liquid-ripple")}
        brand={brand}
        scrim={scrimOf(v)}
        title={str(v, "title")}
        description="Clone the repo, pick a shader, have a hero on screen in five minutes."
        primaryAction={{ label: "Get started", href: "#" }}
        secondaryAction={{ label: "Open the studio", href: "#" }}
        note="Move your cursor — this one ripples."
      />
    ),
    code: (v) => usage("CTA", { variant: str(v, "variant"), shader: str(v, "shader"), title: str(v, "title") }),
  },
  {
    ...base("waitlist", "Waitlist", "A focused conversion moment with atmosphere and restraint."),
    controls: [
      shaderSelect(SHADER_IDS, "aurora"),
      select("scrim", "Scrim", "medium", SCRIM_OPTIONS),
      text("title", "Title", "Get early access.", 40),
      text("cta", "Button", "Join the list", 20),
    ],
    render: (v) => (
      <Waitlist
        shader={str(v, "shader", "aurora")}
        brand={brand}
        scrim={scrimOf(v)}
        title={str(v, "title")}
        description="We're onboarding teams weekly. Join the list and we'll reach out."
        cta={str(v, "cta", "Join the list")}
        note="No spam. Unsubscribe anytime."
      />
    ),
    code: (v) => usage("Waitlist", { shader: str(v, "shader"), title: str(v, "title"), cta: str(v, "cta") }),
  },
  {
    ...base("footer", "Footer", "Sitewide navigation, a newsletter, and the legal line."),
    controls: [toggle("newsletter", "Newsletter", true), range("columns", "Columns", 3, 1, 3)],
    render: (v) => (
      <Footer
        logo={
          <>
            <BrandMark className="size-7 text-brand-400" />
            <span>Taste is the Moat</span>
          </>
        }
        tagline="A curated collection for the part of the web that still wants to be remembered."
        newsletter={
          bool(v, "newsletter", true)
            ? { heading: "Field notes", description: "One useful idea every other Thursday.", cta: "Subscribe" }
            : undefined
        }
        columns={[
          { heading: "Collection", links: [{ label: "Shaders", href: "#" }, { label: "Elements", href: "#" }, { label: "Sections", href: "#" }] },
          { heading: "Resources", links: [{ label: "Studio", href: "#" }, { label: "Templates", href: "#" }, { label: "GitHub", href: "#" }] },
          { heading: "Company", links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }] },
        ].slice(0, num(v, "columns", 3))}
        legal="© 2026 Taste is the Moat. MIT licensed."
      />
    ),
    code: () => usage("Footer", { legal: "© 2026 Taste is the Moat" }),
  },
  {
    ...base("feature-rows", "FeatureRows", "Alternating rows that give a complex product room to explain itself."),
    controls: [toggle("framed", "Browser frame", true), range("count", "Rows", 2, 1, 2)],
    render: (v) => (
      <FeatureRows
        eyebrow="Product tour"
        title="Explain the product, one clear idea at a time"
        description="Alternating rows give complex products enough room to make the value obvious."
        framed={bool(v, "framed", true)}
        rows={[
          {
            eyebrow: "01 · Collect",
            title: "Bring every signal into one workspace.",
            description: "Connect customer calls, tickets, and product usage without forcing the team into another manual process.",
            bullets: ["Automatic source syncing", "Searchable transcripts", "Duplicate detection"],
            visualUrl: "app.example.com/inbox",
            visual: <Panel from="#4f46e5" to="#171b29" />,
          },
          {
            eyebrow: "02 · Decide",
            title: "Turn a noisy backlog into a ranked plan.",
            description: "Group feedback into themes, score opportunities, and show stakeholders why the next release matters.",
            bullets: ["Custom scoring", "Live stakeholder views", "One-click summaries"],
            visualUrl: "app.example.com/roadmap",
            visual: <Panel from="#22d3ee" to="#19142b" />,
          },
        ].slice(0, num(v, "count", 2))}
      />
    ),
    code: (v) => usage("FeatureRows", { framed: bool(v, "framed", true) }),
  },
  {
    ...base("use-cases", "UseCases", "Distinct audience stories composed inside one shared system."),
    controls: [range("count", "Audiences", 3, 2, 3), text("title", "Title", "One platform, different ways to win", 48)],
    render: (v) => (
      <UseCases
        eyebrow="Built for every team"
        title={str(v, "title")}
        description="Swap the message and product view for each audience without building separate pages."
        cases={[
          { label: "Founders", title: "See what deserves the next sprint.", description: "A concise view of customer pain, revenue context, and product opportunity.", benefits: ["Weekly decision digest", "Revenue-weighted themes", "Shareable roadmap"] },
          { label: "Product", title: "Connect every request to evidence.", description: "Keep discovery attached to the decisions, specs, and releases it informed.", benefits: ["Research repository", "Opportunity scoring", "Release follow-up"] },
          { label: "Success", title: "Close the loop with every customer.", description: "Know when a requested feature ships and reach out while the moment is fresh.", benefits: ["Customer watchlists", "Automatic alerts", "Personalized updates"] },
        ].slice(0, num(v, "count", 3))}
      />
    ),
    code: (v) => usage("UseCases", { title: str(v, "title") }),
  },
  {
    ...base("customer-story", "CustomerStory", "A single outcome given the room and pacing of a case study."),
    controls: [
      shaderSelect(SHADER_IDS, "mesh-gradient"),
      select("scrim", "Scrim", "medium", SCRIM_OPTIONS),
      range("metrics", "Metrics", 4, 2, 4),
      text("quote", "Quote", "The new launch page made the product feel established before our first sales call.", 120),
    ],
    render: (v) => (
      <CustomerStory
        shader={str(v, "shader", "mesh-gradient")}
        brand={brand}
        scrim={scrimOf(v)}
        company="NORTHWIND"
        quote={str(v, "quote")}
        name="Ada Okonkwo"
        role="Co-founder, Northwind"
        rating="4.9 from 120 reviews"
        team={[{ name: "Ada Okonkwo" }, { name: "Tomas Reyes" }, { name: "Priya Raman" }]}
        metrics={[
          { value: "42%", label: "More qualified demo requests" },
          { value: "3.1×", label: "Faster page production" },
          { value: "18h", label: "From brief to launch" },
          { value: "96", label: "Lighthouse performance" },
        ].slice(0, num(v, "metrics", 4))}
        action={{ label: "Read the case study", href: "#" }}
      />
    ),
    code: (v) => usage("CustomerStory", { shader: str(v, "shader"), scrim: str(v, "scrim") }),
  },
  {
    ...base("trust-center", "TrustCenter", "Security, standards, and uptime in one credible block."),
    controls: [range("count", "Standards", 4, 2, 4), text("status", "Status", "All systems operational", 32)],
    render: (v) => (
      <TrustCenter
        title="Enterprise-ready by design"
        description="Answer security questions before they slow a deal down."
        status={str(v, "status")}
        commitments={["Encryption in transit and at rest", "Role-based access and audit logs", "Data residency options"]}
        standards={[
          { name: "SOC 2", description: "Independent controls review for security and availability.", status: "Type II" },
          { name: "GDPR", description: "Privacy tooling, DPAs, and configurable data retention.", status: "Ready" },
          { name: "SSO", description: "SAML, SCIM provisioning, and enforced authentication.", status: "Included" },
          { name: "Uptime", description: "Public status history and financially backed response targets.", status: "99.99%" },
        ].slice(0, num(v, "count", 4))}
        action={{ label: "Visit trust center", href: "#" }}
      />
    ),
    code: (v) => usage("TrustCenter", { status: str(v, "status") }),
  },
  {
    ...base("newsletter", "Newsletter", "A subscribe moment, centred or split, with atmosphere behind it."),
    controls: [
      select("variant", "Variant", "centered", ["centered", "split"]),
      shaderSelect(SHADER_IDS, "silk"),
      select("scrim", "Scrim", "medium", SCRIM_OPTIONS),
      text("button", "Button", "Join 8,400 readers", 28),
    ],
    render: (v) => (
      <Newsletter
        variant={str(v, "variant", "centered") as "centered" | "split"}
        shader={str(v, "shader", "silk")}
        brand={brand}
        scrim={scrimOf(v)}
        eyebrow="Field notes"
        title="One useful growth idea, every other Thursday."
        description="Short teardown, clear takeaway, no filler. Read by teams at more than 2,000 companies."
        buttonLabel={str(v, "button")}
        note="Free forever. Unsubscribe in one click."
      />
    ),
    code: (v) => usage("Newsletter", { variant: str(v, "variant"), shader: str(v, "shader") }),
  },
  {
    ...base("contact", "Contact", "A form that asks for the brief, not the life story."),
    controls: [range("methods", "Methods", 3, 1, 3), text("button", "Button", "Send message", 24)],
    render: (v) => (
      <Contact
        eyebrow="Talk to a human"
        title="Show us what you're building"
        description="Bring the brief, the half-finished page, or just the problem. We usually reply within one business day."
        buttonLabel={str(v, "button")}
        methods={[
          { label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
          { label: "Response time", value: "Within one business day" },
          { label: "Best for", value: "Product demos, enterprise, partnerships" },
        ].slice(0, num(v, "methods", 3))}
      />
    ),
    code: (v) => usage("Contact", { buttonLabel: str(v, "button") }),
  },
  {
    ...base("changelog", "Changelog", "A release timeline for product updates or a public changelog."),
    controls: [range("count", "Releases", 3, 1, 3), text("title", "Title", "What shipped lately", 40)],
    render: (v) => (
      <Changelog
        title={str(v, "title")}
        description="A launch timeline that works for product updates, roadmaps, or a public changelog."
        releases={[
          { version: "v0.4", date: "July 28, 2026", title: "Marketing collection", description: "A broader library for teams building complete landing pages.", changes: ["New contact, trust, and case-study sections", "Four full-page starter templates"], status: "Latest" },
          { version: "v0.3", date: "July 10, 2026", title: "Moving gradients", changes: ["Aurora, mesh, silk, and animated CSS backgrounds", "Reduced-motion fallbacks"] },
          { version: "v0.2", date: "June 18, 2026", title: "React section library", changes: ["Composable marketing sections", "Shared brand palette"] },
        ].slice(0, num(v, "count", 3))}
      />
    ),
    code: (v) => usage("Changelog", { title: str(v, "title") }),
  },
  {
    ...base("gallery", "Gallery", "A visual sequence that lets the work lead the narrative."),
    controls: [range("columns", "Columns", 3, 2, 3), range("count", "Items", 3, 2, 3)],
    render: (v) => (
      <Gallery
        eyebrow="Template gallery"
        title="Start from a page that already has a point of view"
        description="Use the same gallery for case studies, product templates, portfolios, or industry solutions."
        columns={num(v, "columns", 3) === 2 ? 2 : 3}
        items={[
          { title: "AI research workspace", category: "AI", result: "+38% demos", visual: <div className="size-full bg-[radial-gradient(circle_at_25%_25%,#7c3aed,transparent_40%),linear-gradient(145deg,#0d1018,#191326)]" /> },
          { title: "Developer observability", category: "Developer tools", result: "96 Lighthouse", visual: <div className="size-full bg-[radial-gradient(circle_at_75%_20%,#22d3ee,transparent_38%),linear-gradient(145deg,#0d1018,#111c24)]" /> },
          { title: "Independent design studio", category: "Agency", result: "18h to launch", visual: <div className="size-full bg-[radial-gradient(circle_at_50%_80%,#f97316,transparent_42%),linear-gradient(145deg,#17100d,#231419)]" /> },
        ].slice(0, num(v, "count", 3))}
        action={{ label: "Browse all templates", href: "#websites" }}
      />
    ),
    code: (v) => usage("Gallery", { columns: num(v, "columns", 3) }),
  },
];
