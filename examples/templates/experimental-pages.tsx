import type { ReactNode } from "react";
import {
  CTA,
  CustomerStory,
  Features,
  Footer,
  Gallery,
  Hero,
  Nav,
  Stats,
} from "../../src/sections/index";
import {
  AudioReactiveShader,
  CodeComparison,
  CopyField,
  DirectionAwareCard,
  DraggableCardPile,
  EncryptedText,
  FlippingTextBoard,
  ImageTrailCursor,
  InfiniteCanvas,
  IsometricFeatureBoxes,
  KineticTypeRibbon,
  LensReveal,
  MagneticButton,
  Marquee3D,
  MorphingDialog,
  MorphingNotch,
  PixelDitherReveal,
  ProgressiveBlur,
  ScrollCardStack,
  ScrollScrubVideo,
  SquigglyText,
  StatusBadge,
  TypeMaskReveal,
  VanishingInput,
  WebcamPixelGrid,
  WetPaintButton,
} from "../../src/ui/index";
import type { BrandPalette } from "../../src/core/theme";

type Experience =
  | "infinite"
  | "kinetic"
  | "lab"
  | "product"
  | "generative"
  | "luxury"
  | "festival"
  | "opensource"
  | "case-study"
  | "spatial"
  | "data"
  | "music";

interface ExperimentalPageConfig {
  key: string;
  brandName: string;
  badge: string;
  title: string;
  highlighted: string;
  description: string;
  note: string;
  shader: string;
  brand: BrandPalette;
  experience: Experience;
  ribbon: string;
  featureTitle: string;
  features: { title: string; description: string }[];
  projects: { title: string; category: string; result: string }[];
  metrics: { value: number; suffix?: string; label: string }[];
  quote: string;
  person: string;
  role: string;
  cta: string;
  cardDescription: string;
  palette: string;
}

const visualBackgrounds = [
  "bg-[radial-gradient(circle_at_25%_25%,#4f46e5,transparent_38%),linear-gradient(145deg,#0a0b10,#24113a)]",
  "bg-[radial-gradient(circle_at_75%_30%,#22d3ee,transparent_36%),linear-gradient(145deg,#081018,#122638)]",
  "bg-[radial-gradient(circle_at_50%_75%,#f97316,transparent_38%),linear-gradient(145deg,#140b08,#31111f)]",
];

function Mark({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="size-7 rounded-lg bg-[conic-gradient(from_210deg,var(--color-brand-500),var(--color-brand-300),var(--color-accent-400),var(--color-brand-500))]" />
      {children}
    </>
  );
}

function Frame({ className, label }: { className: string; label: string }) {
  return (
    <div className={`relative aspect-[4/3] overflow-hidden ${className}`}>
      <span className="absolute left-5 top-5 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-medium text-white/75 backdrop-blur">
        {label}
      </span>
    </div>
  );
}

function ExperienceVisual({ type }: { type: Experience }) {
  switch (type) {
    case "infinite":
      return (
        <InfiniteCanvas
          className="h-[430px]"
          items={[
            { id: "a", x: 180, y: 120, content: <Frame className={visualBackgrounds[0]} label="Identity" /> },
            { id: "b", x: 560, y: 310, content: <Frame className={visualBackgrounds[1]} label="Digital" /> },
            { id: "c", x: 920, y: 90, content: <Frame className={visualBackgrounds[2]} label="Campaign" /> },
          ]}
        />
      );
    case "kinetic":
      return (
        <div className="grid min-h-[430px] place-items-center overflow-hidden rounded-3xl border border-white/12 bg-[#f0eee8] p-8 text-[#111]">
          <div className="text-center">
            <FlippingTextBoard
              words={["NEW IDEAS", "BOLD TYPE", "LIVE STORY"]}
              className="text-lg"
            />
            <SquigglyText
              text="MAKE NOISE"
              className="mt-8 block text-5xl font-black tracking-[-0.07em]"
            />
          </div>
        </div>
      );
    case "lab":
      return (
        <div className="min-h-[430px] rounded-3xl border border-emerald-300/20 bg-[#06100e] p-7 font-mono">
          <StatusBadge tone="positive" pulse>128 sources live</StatusBadge>
          <p className="mt-12 text-xs uppercase tracking-[0.15em] text-emerald-400/60">
            Resolving research brief
          </p>
          <EncryptedText
            trigger="mount"
            text="MARKET SIGNALS SYNTHESIZED"
            className="mt-4 block text-2xl font-semibold text-emerald-200"
          />
          <div className="mt-10 grid gap-3">
            {[86, 71, 64].map((value) => (
              <div key={value} className="h-2 rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-fuchsia-300"
                  style={{ width: `${value}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      );
    case "product":
      return (
        <ScrollScrubVideo
          height={520}
          frames={visualBackgrounds.map((background, index) => (
            <Frame key={background} className={`size-full ${background}`} label={`Chapter 0${index + 1}`} />
          ))}
        />
      );
    case "generative":
      return (
        <PixelDitherReveal className="min-h-[430px]">
          <div className="grid min-h-[430px] place-items-center bg-[repeating-radial-gradient(circle_at_50%_50%,#22d3ee_0_2px,#4f46e5_3px_8px,#07080c_9px_18px)]">
            <MorphingNotch
              items={[
                { label: "Seed", content: <CopyField value="sbg_2847" /> },
                { label: "Motion", content: <p className="text-sm text-white/65">Fluid · 0.42 speed</p> },
                { label: "Export", content: <WetPaintButton className="w-full">Save artwork</WetPaintButton> },
              ]}
            />
          </div>
        </PixelDitherReveal>
      );
    case "luxury":
      return (
        <LensReveal
          className="min-h-[430px] border border-white/12 bg-black"
          base={<div className="min-h-[430px] bg-[radial-gradient(circle_at_50%_45%,#d6d3d1,transparent_5%,#292524_6%,#0c0a09_34%)]" />}
          detail={<div className="min-h-[430px] bg-[repeating-radial-gradient(circle_at_50%_45%,#f5f5f4_0_1px,#78716c_2px_4px,#0c0a09_5px_8px)]" />}
        />
      );
    case "festival":
      return (
        <DraggableCardPile
          className="min-h-[430px] bg-[#f4f0e7]"
          items={[
            { id: "a", rotation: -7, content: <div className="aspect-[3/4] bg-[#ff4d00] p-5 text-3xl font-black text-black">FRI<br />NIGHT</div> },
            { id: "b", rotation: 5, content: <div className="aspect-[3/4] bg-[#c8ff00] p-5 text-3xl font-black text-black">SAT<br />LIVE</div> },
            { id: "c", rotation: -1, content: <div className="aspect-[3/4] bg-[#6d4aff] p-5 text-3xl font-black text-white">SUN<br />LATE</div> },
          ]}
        />
      );
    case "opensource":
      return (
        <div className="space-y-4">
          <CodeComparison
            className="min-h-[360px]"
            before={`fetch("/api")\n  .then(parse)\n  .then(render)\n  .catch(log)`}
            after={`const result = await client.query({\n  cache: "edge",\n  typed: true,\n})`}
          />
          <CopyField value="npx create-fieldkit@latest" />
        </div>
      );
    case "case-study":
      return (
        <MorphingDialog
          title="The full transformation"
          description="A project cover becomes the detailed case study."
          trigger={
            <div className="p-5">
              <Frame className={visualBackgrounds[1]} label="Open case study" />
              <p className="mt-4 font-semibold text-ink-0">Northwind / Product system</p>
            </div>
          }
        >
          <Frame className={visualBackgrounds[0]} label="After" />
          <p className="mt-5 text-ink-300">
            Strategy, identity, product direction, and launch were designed as one continuous system.
          </p>
        </MorphingDialog>
      );
    case "spatial":
      return (
        <ImageTrailCursor
          className="grid min-h-[430px] place-items-center border border-white/12 bg-[#0a0b10]"
          items={visualBackgrounds.map((background, index) => (
            <Frame key={background} className={background} label={`Work 0${index + 1}`} />
          ))}
        >
          <p className="max-w-xs text-center text-3xl font-semibold tracking-tight text-white">
            Move through the studio
          </p>
        </ImageTrailCursor>
      );
    case "data":
      return (
        <IsometricFeatureBoxes
          className="min-h-[430px]"
          items={[
            { title: "Revenue", description: "+18.4% year over year" },
            { title: "Retention", description: "94% net revenue retention" },
            { title: "Reach", description: "41 markets represented" },
            { title: "Impact", description: "2.7M people served" },
            { title: "Outlook", description: "Three durable priorities" },
          ]}
        />
      );
    case "music":
      return (
        <AudioReactiveShader className="min-h-[430px]">
          <div className="size-full bg-[conic-gradient(from_180deg_at_50%_50%,#020617,#7c3aed,#ec4899,#22d3ee,#020617)]" />
        </AudioReactiveShader>
      );
  }
}

function SecondaryExperience({ type }: { type: Experience }) {
  if (type === "festival") {
    return (
      <Marquee3D
        items={["MAIN STAGE", "WAREHOUSE", "ROOFTOP", "GARDEN"].map((item) => (
          <div key={item} className="grid aspect-[4/3] place-items-center bg-[#c8ff00] p-4 text-center text-xl font-black text-black">
            {item}
          </div>
        ))}
      />
    );
  }

  if (type === "opensource") {
    return (
      <VanishingInput
        placeholders={[
          "Search the documentation…",
          "Try “edge cache”",
          "Find an integration…",
        ]}
      />
    );
  }

  if (type === "data") {
    return (
      <ScrollCardStack
        items={[
          <div key="a" className="p-8"><p className="text-5xl font-semibold text-ink-0">18.4%</p><p className="mt-2 text-ink-400">Revenue growth</p></div>,
          <div key="b" className="p-8"><p className="text-5xl font-semibold text-ink-0">94%</p><p className="mt-2 text-ink-400">Retention</p></div>,
          <div key="c" className="p-8"><p className="text-5xl font-semibold text-ink-0">2.7M</p><p className="mt-2 text-ink-400">People reached</p></div>,
        ]}
      />
    );
  }

  if (type === "music") return <WebcamPixelGrid />;

  return (
    <DirectionAwareCard
      className="min-h-72 border border-ink-700 bg-ink-850"
      reveal={<p className="text-2xl font-semibold">A second layer of the story.</p>}
    >
      <ProgressiveBlur edge="bottom" className="min-h-72">
        <div className="grid min-h-72 place-items-center bg-[radial-gradient(circle_at_center,#4f46e5,transparent_36%),#11131b] p-8 text-center">
          <TypeMaskReveal className="text-3xl font-semibold">
            Hover to reveal
          </TypeMaskReveal>
        </div>
      </ProgressiveBlur>
    </DirectionAwareCard>
  );
}

function ExperimentalTemplatePage({ config }: { config: ExperimentalPageConfig }) {
  return (
    <>
      <Nav
        logo={<Mark>{config.brandName}</Mark>}
        links={[
          { label: "Experience", href: "#experience" },
          { label: "Work", href: "#work" },
          { label: "About", href: "#about" },
        ]}
        cta={{ label: config.cta, href: "#start" }}
      />
      <main>
        <Hero
          layout="split"
          shader={config.shader}
          brand={config.brand}
          badge={{ label: config.badge }}
          headline={
            <>
              {config.title}{" "}
              <TypeMaskReveal>{config.highlighted}</TypeMaskReveal>
            </>
          }
          subhead={config.description}
          primaryAction={{ label: config.cta, href: "#start" }}
          secondaryAction={{ label: "Explore the experience", href: "#experience" }}
          note={config.note}
          visual={<ExperienceVisual type={config.experience} />}
        />
        <KineticTypeRibbon text={config.ribbon} />
        <section id="experience" className="py-20 sm:py-28">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div>
              <StatusBadge tone="info">Interactive layer</StatusBadge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-ink-0 sm:text-4xl">
                Built to be explored, not merely viewed.
              </h2>
              <p className="mt-4 leading-relaxed text-ink-300">
                Each page direction pairs a clear marketing story with one
                memorable interaction. Motion supports the hierarchy instead of
                competing with it.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <MagneticButton>{config.cta}</MagneticButton>
                <WetPaintButton>View the process</WetPaintButton>
              </div>
            </div>
            <SecondaryExperience type={config.experience} />
          </div>
        </section>
        <Features
          id="about"
          eyebrow={config.brandName}
          title={config.featureTitle}
          features={config.features}
        />
        <Gallery
          id="work"
          title="Selected chapters"
          description="A visual gallery keeps the page useful after the spectacle of the opening."
          columns={3}
          items={config.projects.map((project, index) => ({
            ...project,
            visual: (
              <Frame
                className={`size-full ${visualBackgrounds[index % visualBackgrounds.length]}`}
                label={project.category}
              />
            ),
          }))}
        />
        <Stats stats={config.metrics} />
        <CustomerStory
          quote={config.quote}
          name={config.person}
          role={config.role}
          company={config.brandName.toUpperCase()}
          metrics={config.metrics.slice(0, 4).map((metric) => ({
            value: `${metric.value}${metric.suffix ?? ""}`,
            label: metric.label,
          }))}
        />
        <CTA
          id="start"
          shader="liquid-ripple"
          brand={config.brand}
          title={config.cta}
          description="Use this complete page as a starting point, then replace every piece with your own story."
          primaryAction={{ label: config.cta, href: "#" }}
          secondaryAction={{ label: "Back to templates", href: "?" }}
        />
      </main>
      <Footer
        logo={<Mark>{config.brandName}</Mark>}
        tagline={config.description}
        columns={[
          { heading: "Explore", links: [{ label: "Experience", href: "#experience" }, { label: "Work", href: "#work" }, { label: "About", href: "#about" }] },
          { heading: "Connect", links: [{ label: "Instagram", href: "#" }, { label: "LinkedIn", href: "#" }, { label: "Email", href: "#" }] },
          { heading: "Collection", links: [{ label: "All templates", href: "?" }, { label: "Components", href: "../marketing/sections.html" }] },
        ]}
      />
    </>
  );
}

const configs: ExperimentalPageConfig[] = [
  {
    key: "infinite-portfolio",
    brandName: "Field/Objects",
    badge: "Spatial portfolio · drag to explore",
    title: "A portfolio without",
    highlighted: "edges.",
    description: "Projects live on a draggable canvas instead of inside a predictable vertical feed.",
    note: "Brand · Digital · Moving image",
    shader: "oil-slick",
    brand: { primary: "#4f46e5", secondary: "#a855f7", accent: "#22d3ee", background: "#07080c" },
    experience: "infinite",
    ribbon: "MOVE THROUGH THE WORK",
    featureTitle: "A spatial system for multidisciplinary work",
    features: [
      { title: "Infinite project canvas", description: "Momentum-based browsing gives every project its own coordinates." },
      { title: "Context-preserving detail", description: "Project cards expand without losing the surrounding world." },
      { title: "Image trail discovery", description: "The cursor previews the range before a visitor commits." },
    ],
    projects: [
      { title: "Northwind system", category: "Identity", result: "+42% demos" },
      { title: "Meridian world", category: "Digital", result: "SOTD" },
      { title: "Lumen launch", category: "Campaign", result: "18h live" },
    ],
    metrics: [{ value: 41, label: "Projects" }, { value: 12, label: "Countries" }, { value: 68, suffix: "%", label: "Referrals" }, { value: 9, label: "People" }],
    quote: "The site makes the studio feel like a place you enter rather than a list you scroll.",
    person: "Priya Raman",
    role: "Founder, Lumen",
    cta: "Start a project",
    cardDescription: "Draggable project universe with image trails and morphing case studies.",
    palette: "from-indigo-700 via-violet-600 to-cyan-400",
  },
  {
    key: "kinetic-editorial",
    brandName: "Uncommon",
    badge: "Independent editorial launch",
    title: "An argument made with",
    highlighted: "motion.",
    description: "Oversized typography, live headlines, and scroll velocity turn a manifesto into a performance.",
    note: "Editorial · Culture · Opinion",
    shader: "silk",
    brand: { primary: "#e11d48", secondary: "#f97316", accent: "#facc15", background: "#0c0808" },
    experience: "kinetic",
    ribbon: "WORDS WITH MOMENTUM",
    featureTitle: "Typography carries the whole experience",
    features: [
      { title: "Velocity ribbons", description: "Headlines react to how the reader moves." },
      { title: "Mechanical type", description: "Split-flap words punctuate editorial chapters." },
      { title: "Elastic emphasis", description: "Selected words bend and rebound under the pointer." },
    ],
    projects: [
      { title: "The new city", category: "Essay", result: "14 min read" },
      { title: "Future rituals", category: "Series", result: "8 chapters" },
      { title: "Useful friction", category: "Opinion", result: "Most shared" },
    ],
    metrics: [{ value: 84, suffix: "%", label: "Completion" }, { value: 14, label: "Contributors" }, { value: 31, label: "Issues" }, { value: 6, label: "Cities" }],
    quote: "It feels authored in a way most publishing templates never do.",
    person: "Mei Chen",
    role: "Editor, Uncommon",
    cta: "Read the issue",
    cardDescription: "Manifesto-style publishing with kinetic type and mechanical transitions.",
    palette: "from-rose-700 via-orange-500 to-yellow-300",
  },
  {
    key: "ai-laboratory",
    brandName: "Parallax Research",
    badge: "Auditable intelligence",
    title: "Research that reveals its",
    highlighted: "reasoning.",
    description: "A technical AI page built around evidence, confidence, and live analytical states.",
    note: "Private data · Visible assumptions",
    shader: "aurora",
    brand: { primary: "#047857", secondary: "#34d399", accent: "#f0abfc", background: "#06100e" },
    experience: "lab",
    ribbon: "EVIDENCE BEFORE ANSWERS",
    featureTitle: "Trust is a product feature",
    features: [
      { title: "Encrypted states", description: "Analysis visibly resolves from raw signals." },
      { title: "Confidence layers", description: "Uncertainty is presented instead of hidden." },
      { title: "Inspectable sources", description: "Every conclusion remains attached to evidence." },
    ],
    projects: [
      { title: "Market atlas", category: "Strategy", result: "128 sources" },
      { title: "Policy engine", category: "Operations", result: "94% coverage" },
      { title: "Risk brief", category: "Research", result: "6× faster" },
    ],
    metrics: [{ value: 128, label: "Sources" }, { value: 94, suffix: "%", label: "Coverage" }, { value: 6, suffix: "×", label: "Faster" }, { value: 0, label: "Training use" }],
    quote: "For the first time, the AI interface makes uncertainty feel useful instead of embarrassing.",
    person: "Sven Aalto",
    role: "Research Director",
    cta: "Open a workspace",
    cardDescription: "Dithered AI laboratory with evidence states and encrypted typography.",
    palette: "from-emerald-800 via-teal-500 to-fuchsia-300",
  },
  {
    key: "product-story",
    brandName: "Relay",
    badge: "Interactive product narrative",
    title: "A product tour with",
    highlighted: "chapters.",
    description: "Scroll controls the interface sequence while the marketing story stays pinned beside it.",
    note: "Four chapters · One continuous demo",
    shader: "mesh-gradient",
    brand: { primary: "#2563eb", secondary: "#7c3aed", accent: "#22d3ee", background: "#070a12" },
    experience: "product",
    ribbon: "SCROLL THE PRODUCT",
    featureTitle: "Show the workflow instead of describing it",
    features: [
      { title: "Scrubbed interface", description: "The demo progresses with the reader." },
      { title: "Pinned narrative", description: "Copy changes at exactly the right moment." },
      { title: "Contextual proof", description: "Metrics appear beside the feature that earned them." },
    ],
    projects: [
      { title: "Collect", category: "Chapter 01", result: "12 sources" },
      { title: "Decide", category: "Chapter 02", result: "1 roadmap" },
      { title: "Follow up", category: "Chapter 03", result: "+31% close" },
    ],
    metrics: [{ value: 31, suffix: "%", label: "Faster decisions" }, { value: 12, label: "Sources" }, { value: 4, label: "Chapters" }, { value: 1, label: "Shared plan" }],
    quote: "The page explains the product in the same order people actually use it.",
    person: "Ada Okonkwo",
    role: "VP Product",
    cta: "Watch the product",
    cardDescription: "Pinned product chapters with scroll-scrubbed interface states.",
    palette: "from-blue-700 via-violet-600 to-cyan-400",
  },
  {
    key: "generative-studio",
    brandName: "Seed/Signal",
    badge: "Generative art collection",
    title: "Art systems with",
    highlighted: "parameters.",
    description: "A full-screen shader gallery with living previews, editable seeds, and collectible states.",
    note: "Generative · Realtime · Editioned",
    shader: "holo-foil",
    brand: { primary: "#7c3aed", secondary: "#ec4899", accent: "#22d3ee", background: "#050508" },
    experience: "generative",
    ribbon: "EVERY FRAME IS DIFFERENT",
    featureTitle: "The artwork and interface are the same system",
    features: [
      { title: "Live seeds", description: "Every work exposes a controlled set of generative parameters." },
      { title: "Dithered discovery", description: "Pieces resolve as the viewer commits attention." },
      { title: "Edition states", description: "Save, compare, and export exact moments." },
    ],
    projects: [
      { title: "Signal 2847", category: "Edition", result: "1/64" },
      { title: "Liquid archive", category: "Series", result: "Live" },
      { title: "Soft collision", category: "Study", result: "Realtime" },
    ],
    metrics: [{ value: 64, label: "Editions" }, { value: 24, label: "Parameters" }, { value: 60, suffix: "fps", label: "Realtime" }, { value: 8, label: "Series" }],
    quote: "It makes collecting feel closer to discovering an instrument than buying a static file.",
    person: "Jonah Blake",
    role: "Digital curator",
    cta: "Explore the editions",
    cardDescription: "Live generative-art gallery with parameters, dither, and floating controls.",
    palette: "from-violet-800 via-pink-600 to-cyan-400",
  },
  {
    key: "luxury-drop",
    brandName: "MONO/02",
    badge: "Edition 02 · 180 pieces",
    title: "One object, examined",
    highlighted: "closely.",
    description: "A restrained product drop where lens inspection and material detail replace a crowded feature list.",
    note: "Numbered · Assembled by hand",
    shader: "silk",
    brand: { primary: "#57534e", secondary: "#d6d3d1", accent: "#f5f5f4", background: "#0c0a09" },
    experience: "luxury",
    ribbon: "MATERIAL / LIGHT / TIME",
    featureTitle: "Restraint makes the interaction feel expensive",
    features: [
      { title: "Material lens", description: "Inspect surface and construction without leaving the page." },
      { title: "Numbered release", description: "Availability and provenance remain visible." },
      { title: "Quiet transitions", description: "Motion is slow, precise, and deliberately sparse." },
    ],
    projects: [
      { title: "Graphite", category: "Finish", result: "60 pieces" },
      { title: "Silver", category: "Finish", result: "60 pieces" },
      { title: "Obsidian", category: "Finish", result: "60 pieces" },
    ],
    metrics: [{ value: 180, label: "Pieces" }, { value: 3, label: "Finishes" }, { value: 42, label: "Parts" }, { value: 2, label: "Years developed" }],
    quote: "The product feels considered before you ever read the specifications.",
    person: "Tomas Reyes",
    role: "Industrial designer",
    cta: "Reserve edition 02",
    cardDescription: "Luxury product release built around lens inspection and restrained motion.",
    palette: "from-stone-900 via-stone-500 to-white",
  },
  {
    key: "festival",
    brandName: "OFFSET",
    badge: "Three nights · Riyadh",
    title: "A festival page that behaves like",
    highlighted: "a poster wall.",
    description: "Draggable lineup cards, kinetic venue ribbons, countdowns, and a ticket command island.",
    note: "September 18–20 · Warehouse District",
    shader: "synthwave-grid",
    brand: { primary: "#ff4d00", secondary: "#6d4aff", accent: "#c8ff00", background: "#090909" },
    experience: "festival",
    ribbon: "THREE NIGHTS / NO REPEATS",
    featureTitle: "The lineup is the visual system",
    features: [
      { title: "Poster card pile", description: "Artists and stages can be thrown, sorted, and explored." },
      { title: "Venue ribbons", description: "Perspective marquees keep the schedule in motion." },
      { title: "Ticket notch", description: "Pass selection stays one interaction away." },
    ],
    projects: [
      { title: "Warehouse", category: "Friday", result: "8 artists" },
      { title: "Rooftop", category: "Saturday", result: "12 artists" },
      { title: "Garden", category: "Sunday", result: "10 artists" },
    ],
    metrics: [{ value: 3, label: "Nights" }, { value: 30, label: "Artists" }, { value: 4, label: "Stages" }, { value: 1, label: "City" }],
    quote: "The site already feels like arriving at the festival.",
    person: "Leila Haddad",
    role: "Creative producer",
    cta: "Choose a pass",
    cardDescription: "Animated event poster with draggable lineup and spatial venue ribbons.",
    palette: "from-orange-600 via-violet-600 to-lime-300",
  },
  {
    key: "open-source-launch",
    brandName: "FieldKit",
    badge: "v1.0 · Open source",
    title: "A technical launch page that lets the code",
    highlighted: "speak.",
    description: "Install commands, live comparisons, searchable docs, and release proof for a developer-first project.",
    note: "MIT · TypeScript · Edge native",
    shader: "synthwave-grid",
    brand: { primary: "#2563eb", secondary: "#38bdf8", accent: "#a3e635", background: "#05080f" },
    experience: "opensource",
    ribbon: "CLONE / BUILD / SHIP",
    featureTitle: "The fastest path from curiosity to first result",
    features: [
      { title: "Executable hero", description: "Installation is visible before the first scroll." },
      { title: "Code comparison", description: "The value is proven line by line." },
      { title: "Searchable docs", description: "Example prompts turn documentation into an interface." },
    ],
    projects: [
      { title: "Core", category: "Package", result: "3.2 kB" },
      { title: "Adapters", category: "Ecosystem", result: "12 runtimes" },
      { title: "Playground", category: "Tool", result: "Live" },
    ],
    metrics: [{ value: 21, label: "Contributors" }, { value: 12, label: "Adapters" }, { value: 3, suffix: "k", label: "Stars" }, { value: 99, suffix: "%", label: "Typed" }],
    quote: "I understood the API before I reached the documentation.",
    person: "Sven Aalto",
    role: "Staff engineer",
    cta: "Install FieldKit",
    cardDescription: "Open-source launch with executable hero, comparison, and doc search.",
    palette: "from-blue-700 via-sky-500 to-lime-300",
  },
  {
    key: "interactive-case-study",
    brandName: "Northwind / 24",
    badge: "Transformation story",
    title: "The case study becomes",
    highlighted: "the interface.",
    description: "Covers morph into chapters, outcomes stay pinned, and process artifacts invite exploration.",
    note: "Strategy · Product · Launch",
    shader: "caustics",
    brand: { primary: "#0f766e", secondary: "#14b8a6", accent: "#f59e0b", background: "#06100e" },
    experience: "case-study",
    ribbon: "FROM QUESTION TO OUTCOME",
    featureTitle: "Evidence earns every visual flourish",
    features: [
      { title: "Morphing cover", description: "The project card becomes the article." },
      { title: "Pinned outcomes", description: "Results remain attached to the decisions behind them." },
      { title: "Process artifacts", description: "Research, prototypes, and launch material stay explorable." },
    ],
    projects: [
      { title: "Frame", category: "Strategy", result: "2 weeks" },
      { title: "Make", category: "Product", result: "6 sprints" },
      { title: "Launch", category: "Market", result: "+42% demos" },
    ],
    metrics: [{ value: 42, suffix: "%", label: "More demos" }, { value: 6, label: "Sprints" }, { value: 14, label: "Patterns" }, { value: 96, label: "Lighthouse" }],
    quote: "It connects the polished outcome to the difficult decisions that produced it.",
    person: "Ada Okonkwo",
    role: "Co-founder, Northwind",
    cta: "Read the transformation",
    cardDescription: "Morphing project narrative with pinned outcomes and process artifacts.",
    palette: "from-teal-800 via-emerald-500 to-amber-400",
  },
  {
    key: "spatial-agency",
    brandName: "Elsewhere",
    badge: "Independent creative company",
    title: "A studio website you",
    highlighted: "move through.",
    description: "Image trails, spatial navigation, and direction-aware work make the portfolio feel inhabited.",
    note: "Riyadh · London · Everywhere",
    shader: "oil-slick",
    brand: { primary: "#be123c", secondary: "#7c3aed", accent: "#facc15", background: "#0e0710" },
    experience: "spatial",
    ribbon: "WORK FROM ELSEWHERE",
    featureTitle: "A portfolio with a point of view",
    features: [
      { title: "Image trail index", description: "Range appears before the project list does." },
      { title: "Spatial navigation", description: "The studio, work, and ideas share one landscape." },
      { title: "Directional reveals", description: "Cards acknowledge how visitors approach them." },
    ],
    projects: [
      { title: "Fathom", category: "Experience", result: "SOTD" },
      { title: "Lumen", category: "Identity", result: "+2.7× inbound" },
      { title: "Cobalt", category: "Launch", result: "8 weeks" },
    ],
    metrics: [{ value: 38, label: "Projects" }, { value: 7, label: "Disciplines" }, { value: 11, label: "Awards" }, { value: 72, suffix: "%", label: "Referral" }],
    quote: "The portfolio feels like meeting the studio, not reviewing a supplier.",
    person: "Priya Raman",
    role: "Founder, Lumen",
    cta: "Make something together",
    cardDescription: "Spatial agency portfolio with image trails and directional project reveals.",
    palette: "from-rose-800 via-violet-600 to-yellow-300",
  },
  {
    key: "data-story",
    brandName: "Common Measure",
    badge: "2026 impact report",
    title: "Numbers arranged as",
    highlighted: "a narrative.",
    description: "Scroll-driven metrics, layered diagrams, and evidence chapters turn a report into a guided story.",
    note: "Open data · Audited methodology",
    shader: "topographic",
    brand: { primary: "#0369a1", secondary: "#0ea5e9", accent: "#84cc16", background: "#061018" },
    experience: "data",
    ribbon: "MEASURE WHAT CHANGED",
    featureTitle: "Context before celebration",
    features: [
      { title: "Layered methodology", description: "Isometric diagrams make the model inspectable." },
      { title: "Scroll metrics", description: "Outcomes arrive in narrative order." },
      { title: "Source transparency", description: "Every claim links back to the underlying evidence." },
    ],
    projects: [
      { title: "Economic access", category: "Outcome", result: "+18.4%" },
      { title: "Community health", category: "Outcome", result: "94% reach" },
      { title: "Climate resilience", category: "Outcome", result: "41 markets" },
    ],
    metrics: [{ value: 18, suffix: "%", label: "Growth" }, { value: 94, suffix: "%", label: "Reach" }, { value: 41, label: "Markets" }, { value: 27, suffix: "M", label: "People" }],
    quote: "The report makes the methodology as understandable as the headline result.",
    person: "Mei Chen",
    role: "Impact lead",
    cta: "Explore the report",
    cardDescription: "Narrative annual report with layered methodology and scroll metrics.",
    palette: "from-sky-800 via-cyan-500 to-lime-400",
  },
  {
    key: "music-release",
    brandName: "NIGHT/FORM",
    badge: "Album 03 · Listen now",
    title: "A release page that",
    highlighted: "listens back.",
    description: "Audio-reactive colour, track controls, pixel portraiture, and credits create a living liner note.",
    note: "Nine tracks · 38 minutes",
    shader: "plasma",
    brand: { primary: "#7c3aed", secondary: "#ec4899", accent: "#22d3ee", background: "#03030a" },
    experience: "music",
    ribbon: "PRESS PLAY / CHANGE THE LIGHT",
    featureTitle: "The record supplies the motion system",
    features: [
      { title: "Audio energy", description: "Colour and scale respond to the room or track." },
      { title: "Pixel portrait", description: "Camera input becomes optional participatory artwork." },
      { title: "Living credits", description: "Players, studios, and collaborators form an explorable network." },
    ],
    projects: [
      { title: "Glass Hours", category: "Track 01", result: "04:12" },
      { title: "Static Bloom", category: "Track 05", result: "03:46" },
      { title: "Blue Exit", category: "Track 09", result: "05:03" },
    ],
    metrics: [{ value: 9, label: "Tracks" }, { value: 38, label: "Minutes" }, { value: 14, label: "Collaborators" }, { value: 3, label: "Formats" }],
    quote: "It extends the atmosphere of the record instead of merely embedding a player.",
    person: "Leila Haddad",
    role: "Artist",
    cta: "Listen to the record",
    cardDescription: "Audio-reactive album release with pixel portrait and living credits.",
    palette: "from-violet-900 via-pink-600 to-cyan-400",
  },
];

export const EXPERIMENTAL_TEMPLATES: Record<string, () => ReactNode> =
  Object.fromEntries(
    configs.map((config) => [
      config.key,
      () => <ExperimentalTemplatePage config={config} />,
    ]),
  );

export const EXPERIMENTAL_TEMPLATE_CARDS = configs.map((config) => ({
  key: config.key,
  title: config.brandName,
  description: config.cardDescription,
  palette: config.palette,
  sections: "Experimental",
}));
