/**
 * Section catalog.
 *
 * Renders one section at a time, at the top of the document, chosen with
 * `?s=<name>`. Useful for reviewing a single section in isolation, and for
 * screenshotting sections without scrolling past a full-height hero.
 *
 * Visit without a parameter for the index.
 */
import { createRoot } from "react-dom/client";
import "../../src/ui/theme.css";
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
} from "../../src/sections/index";
import {
  AvatarStack,
  AudioReactiveShader,
  BorderBeam,
  BrowserFrame,
  CodeComparison,
  Container,
  CopyField,
  DirectionAwareCard,
  DraggableCardPile,
  EncryptedText,
  FlippingTextBoard,
  GradientText,
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
  NoiseOverlay,
  PathMorph,
  PixelDitherReveal,
  ProgressiveBlur,
  Rating,
  ScrollCardStack,
  ScrollScrubVideo,
  SectionHeading,
  SegmentedControl,
  ShaderCard,
  ShaderDivider,
  ShaderOrb,
  ShaderText,
  SquigglyText,
  SpotlightCard,
  SpotlightGrid,
  StatusBadge,
  TypeMaskReveal,
  VanishingInput,
  WebcamPixelGrid,
  WetPaintButton,
} from "../../src/ui/index";
import type { BrandPalette } from "../../src/core/theme";

const brand: BrandPalette = {
  primary: "#4f46e5",
  secondary: "#a855f7",
  accent: "#22d3ee",
  background: "#07080c",
};

const FEATURES = [
  {
    title: "One palette, everywhere",
    description:
      "Set your brand colours once. Sections and shader uniforms recolour together.",
  },
  {
    title: "Cursor-aware backgrounds",
    description: "15 shaders respond to the pointer — ripples, tilt, reveal.",
  },
  {
    title: "Pauses when unseen",
    description: "Shaders stop rendering once their section scrolls away.",
  },
  {
    title: "Legible by default",
    description: "A scrim sits between shader and copy, always.",
  },
  {
    title: "Reduced motion respected",
    description: "One static frame for visitors who ask for less motion.",
  },
  {
    title: "Copy-paste, not a black box",
    description: "Plain TSX and Tailwind in your repo. Fork anything.",
  },
];

const TIERS = [
  {
    name: "Open source",
    monthly: 0,
    description: "The full shader library and every section, MIT licensed.",
    features: ["69 shaders", "All 26 sections", "Studio & editor"],
    cta: { label: "Clone the repo", href: "#" },
  },
  {
    name: "Studio",
    monthly: 19,
    description: "For teams shipping several sites a year.",
    features: [
      "Everything in Open source",
      "Brand palette presets",
      "Poster-frame generation",
      "Email support",
    ],
    cta: { label: "Start free trial", href: "#" },
    featured: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    description: "Design-system integration and bespoke shaders.",
    features: ["Everything in Studio", "Custom shaders", "SLA support"],
    cta: { label: "Talk to us", href: "#" },
  },
];

const FAQ_ITEMS = [
  {
    question: "Will a WebGL background hurt my Core Web Vitals?",
    answer:
      "Not if you keep to one or two per page. The canvas renders after paint so it doesn't block LCP, and each shader pauses itself once scrolled out of view.",
  },
  { question: "What happens without WebGL?", answer: "The section still renders with a brand-tinted CSS gradient." },
  { question: "Can I use my own brand colours?", answer: "Yes — that's what the brand palette does." },
  { question: "Does it work with Next.js or Astro?", answer: "Yes. Mark the shader section as a client component or island." },
];

const SECTIONS: Record<string, () => React.ReactNode> = {
  nav: () => (
    <div className="min-h-[300px] bg-gradient-to-b from-brand-900 to-ink-950">
      <Nav
        transparentUntilScroll={false}
        links={[
          { label: "Features", href: "#" },
          { label: "Pricing", href: "#" },
          { label: "Docs", href: "#" },
        ]}
        secondaryCta={{ label: "Sign in", href: "#" }}
        cta={{ label: "Get started", href: "#" }}
      />
    </div>
  ),
  "hero-centered": () => (
    <Hero
      shader="mesh-gradient"
      brand={brand}
      badge={{ label: "v0.2 out now" }}
      headline={<>Landing pages that <GradientText>move</GradientText>.</>}
      subhead="A React section library with WebGL shader backgrounds built in."
      primaryAction={{ label: "Start building", href: "#" }}
      secondaryAction={{ label: "Browse shaders", href: "#" }}
      note="MIT licensed · Zero runtime dependencies"
    />
  ),
  "hero-split": () => (
    <Hero
      layout="split"
      shader="aurora"
      brand={brand}
      headline="Ship a hero in five minutes."
      subhead="Pick a shader, pass your brand colours, done. No canvas plumbing."
      primaryAction={{ label: "Get started", href: "#" }}
      secondaryAction={{ label: "Docs", href: "#" }}
      visual={
        <BrowserFrame url="shaderbg.dev/studio">
          <div className="aspect-[16/10] bg-[radial-gradient(ellipse_at_30%_25%,#4f46e5_0%,transparent_55%),radial-gradient(ellipse_at_70%_75%,#a855f7_0%,transparent_55%)]" />
        </BrowserFrame>
      }
    />
  ),
  logos: () => (
    <div className="pt-8">
      <LogoCloud
        variant="grid"
        logos={["Northwind", "Acme Corp", "Vertex", "Lumen", "Cobalt"]}
      />
    </div>
  ),
  "logos-marquee": () => (
    <div className="pt-8">
      <LogoCloud
        variant="marquee"
        logos={["Northwind", "Acme Corp", "Vertex", "Lumen", "Cobalt", "Meridian", "Fathom"]}
      />
    </div>
  ),
  features: () => (
    <Features
      eyebrow="Why shaderbg"
      title="Everything a marketing page needs"
      description="Sections that already know how to host a shader."
      features={FEATURES}
    />
  ),
  "features-bento": () => (
    <Features
      eyebrow="Why shaderbg"
      title="Built for marketing pages"
      variant="bento"
      features={FEATURES.map((f, i) => ({ ...f, wide: i === 0 }))}
    />
  ),
  stats: () => (
    <div className="pt-10">
      <Stats
        stats={[
          { value: 69, label: "Shaders included" },
          { value: 15, label: "Cursor-interactive" },
          { value: 26, label: "Sections" },
          { value: 60, suffix: "fps", label: "On a 2019 laptop" },
        ]}
      />
    </div>
  ),
  pricing: () => <Pricing tiers={TIERS} description="Start free. Upgrade when it ships." />,
  faq: () => <FAQ items={FAQ_ITEMS} />,
  cta: () => (
    <CTA
      shader="liquid-ripple"
      brand={brand}
      title="Ship something worth looking at."
      description="Clone the repo, pick a shader, have a hero on screen in five minutes."
      primaryAction={{ label: "Get started", href: "#" }}
      secondaryAction={{ label: "Open the studio", href: "#" }}
      note="Move your cursor — this one ripples."
    />
  ),
  "cta-card": () => (
    <CTA
      variant="card"
      shader="holo-foil"
      brand={brand}
      title="Ready when you are."
      description="Everything is MIT licensed and lives in your repo."
      primaryAction={{ label: "Get started", href: "#" }}
    />
  ),
  // ---- Tier 1 completions ----
  testimonials: () => (
    <Testimonials
      testimonials={[
        { quote: "We replaced a bespoke Three.js hero with one <Hero> and deleted 400 lines.", name: "Ada Okonkwo", role: "Staff Engineer, Northwind" },
        { quote: "The brand palette mapping is the part I didn't expect. Our shaders match our buttons.", name: "Tomas Reyes", role: "Design Lead, Vertex" },
        { quote: "Shipped a launch page in an afternoon. The CTA shader got more comments than the product.", name: "Priya Raman", role: "Founder, Lumen" },
        { quote: "It pauses when scrolled away. Our Lighthouse score didn't budge.", name: "Sven Aalto", role: "Web Lead, Cobalt" },
        { quote: "Copy-paste components in our own repo. No black box to fight.", name: "Mei Chen", role: "Frontend, Meridian" },
        { quote: "Reduced-motion handling was already correct. That never happens.", name: "Jonah Blake", role: "Accessibility, Fathom" },
      ]}
    />
  ),
  "testimonials-featured": () => (
    <Testimonials
      variant="featured"
      testimonials={[
        { quote: "We replaced a bespoke Three.js hero with a single component and deleted four hundred lines of canvas plumbing. It looks better than what we removed.", name: "Ada Okonkwo", role: "Staff Engineer, Northwind" },
      ]}
    />
  ),
  "testimonials-marquee": () => (
    <Testimonials
      variant="marquee"
      testimonials={[
        { quote: "Deleted 400 lines of canvas plumbing.", name: "Ada Okonkwo", role: "Northwind" },
        { quote: "Our shaders match our buttons now.", name: "Tomas Reyes", role: "Vertex" },
        { quote: "Shipped a launch page in an afternoon.", name: "Priya Raman", role: "Lumen" },
        { quote: "Lighthouse score didn't budge.", name: "Sven Aalto", role: "Cobalt" },
        { quote: "No black box to fight.", name: "Mei Chen", role: "Meridian" },
      ]}
    />
  ),
  showcase: () => (
    <ProductShowcase
      tabs={[
        { label: "Studio", url: "shaderbg.dev/studio", content: <div className="aspect-[16/9] bg-[radial-gradient(ellipse_at_30%_25%,#4f46e5_0%,transparent_55%),radial-gradient(ellipse_at_70%_75%,#a855f7_0%,transparent_55%)]" />, description: "Tune uniforms and edit GLSL with live recompile." },
        { label: "Sections", url: "shaderbg.dev/sections", content: <div className="aspect-[16/9] bg-[radial-gradient(ellipse_at_70%_30%,#06b6d4_0%,transparent_55%),radial-gradient(ellipse_at_25%_70%,#4f46e5_0%,transparent_55%)]" />, description: "Twenty-six reusable sections for marketing and landing pages." },
        { label: "Export", url: "shaderbg.dev/export", content: <div className="aspect-[16/9] bg-[radial-gradient(ellipse_at_50%_50%,#a855f7_0%,transparent_60%)]" />, description: "One self-contained HTML file." },
      ]}
    />
  ),

  // ---- Tier 2 ----
  steps: () => (
    <Steps
      steps={[
        { title: "Install", description: "Clone the repo or copy the components you want into your project." },
        { title: "Pick a shader", description: "Browse 69 in the studio, tune the uniforms, note the id." },
        { title: "Ship", description: "Drop in a Hero, pass your brand palette, deploy." },
      ]}
    />
  ),
  "steps-timeline": () => (
    <Steps
      variant="timeline"
      steps={[
        { title: "Install the package", description: "One dependency-free runtime plus the sections you copy in.", visual: <BorderBeam contentClassName="p-4"><code className="block font-mono text-[13px] text-ink-200">npm i shaderbg</code></BorderBeam> },
        { title: "Choose your background", description: "Sixty-nine shaders across six categories, fifteen cursor-interactive." },
        { title: "Brand it once", description: "Pass a palette; sections and shader uniforms recolour together." },
      ]}
    />
  ),
  integrations: () => (
    <Integrations
      integrations={[
        { name: "Next.js" }, { name: "Astro" }, { name: "Remix" }, { name: "Vite" },
        { name: "Tailwind" }, { name: "Figma", comingSoon: true }, { name: "Framer", comingSoon: true }, { name: "Webflow", comingSoon: true },
      ]}
    />
  ),
  comparison: () => (
    <Comparison
      columns={["shaderbg", "Video bg", "CSS gradient"]}
      rows={[
        { group: "Visuals", feature: "Animated", values: [true, true, false] },
        { feature: "Cursor-interactive", values: [true, false, false] },
        { feature: "Brand recolouring", values: [true, false, true] },
        { group: "Performance", feature: "Payload", values: ["~8 kB", "2–20 MB", "0 kB"] },
        { feature: "Pauses offscreen", values: [true, false, true] },
        { feature: "Crisp at any size", values: [true, false, true] },
        { group: "Accessibility", feature: "Respects reduced motion", values: [true, "Manual", true] },
      ]}
      footnote="Payload measured gzipped, excluding React."
    />
  ),
  announcement: () => (
    <div>
      <AnnouncementBar href="#" storageKey="sbg-demo-announce">
        <strong className="font-semibold">v0.2 is out</strong>
        <span className="opacity-80">— 69 shaders and 26 sections</span>
        <span aria-hidden="true">→</span>
      </AnnouncementBar>
      <AnnouncementBar variant="subtle" dismissible={false} className="mt-0">
        Subtle variant, not dismissible
      </AnnouncementBar>
      <Container className="py-16">
        <p className="text-ink-400">
          Dismissal persists per <code className="text-ink-200">storageKey</code>.
        </p>
      </Container>
    </div>
  ),
  team: () => (
    <Team
      members={[
        { name: "Ada Okonkwo", role: "Engineering" },
        { name: "Tomas Reyes", role: "Design" },
        { name: "Priya Raman", role: "Founder" },
        { name: "Sven Aalto", role: "Graphics" },
      ]}
    />
  ),
  blog: () => (
    <BlogGrid
      featureFirst
      viewAll={{ label: "All posts", href: "#" }}
      posts={[
        { title: "Why thin-film interference makes shaders look expensive", href: "#", excerpt: "The physics behind holographic foil, and why it shatters if you feed it noise.", date: "2026-07-12", category: "Graphics", readingTime: "8 min", author: { name: "Sven Aalto" } },
        { title: "One WebGL context for fifty shaders", href: "#", excerpt: "Browsers cap live contexts and silently drop the oldest.", date: "2026-06-28", category: "Performance", readingTime: "6 min", author: { name: "Ada Okonkwo" } },
        { title: "Making motion accessible", href: "#", excerpt: "Reduced motion, scrims and reveals that fail open.", date: "2026-06-04", category: "Accessibility", readingTime: "5 min", author: { name: "Jonah Blake" } },
      ]}
    />
  ),
  waitlist: () => (
    <Waitlist
      shader="aurora"
      brand={brand}
      title="Get early access."
      description="We're onboarding teams weekly. Join the list and we'll reach out."
      note="No spam. Unsubscribe anytime."
    />
  ),

  // ---- Marketing collection expansion ----
  "feature-rows": () => (
    <FeatureRows
      eyebrow="Product tour"
      title="Explain the product, one clear idea at a time"
      description="Alternating rows give complex products enough room to make the value obvious."
      rows={[
        {
          eyebrow: "01 · Collect",
          title: "Bring every signal into one workspace.",
          description:
            "Connect customer calls, tickets, and product usage without forcing the team into another manual process.",
          bullets: ["Automatic source syncing", "Searchable transcripts", "Duplicate detection"],
          visualUrl: "app.example.com/inbox",
          visual: <div className="aspect-[16/10] bg-[radial-gradient(circle_at_20%_30%,#4f46e5,transparent_38%),linear-gradient(135deg,#10131d,#171b29)]" />,
        },
        {
          eyebrow: "02 · Decide",
          title: "Turn a noisy backlog into a ranked plan.",
          description:
            "Group feedback into themes, score opportunities, and show stakeholders why the next release matters.",
          bullets: ["Custom scoring", "Live stakeholder views", "One-click summaries"],
          visualUrl: "app.example.com/roadmap",
          visual: <div className="aspect-[16/10] bg-[radial-gradient(circle_at_75%_35%,#22d3ee,transparent_35%),linear-gradient(135deg,#10131d,#19142b)]" />,
        },
      ]}
    />
  ),
  "use-cases": () => (
    <UseCases
      eyebrow="Built for every team"
      title="One platform, different ways to win"
      description="Swap the message and product view for each audience without building separate pages."
      cases={[
        {
          label: "Founders",
          title: "See what deserves the next sprint.",
          description: "A concise view of customer pain, revenue context, and product opportunity.",
          benefits: ["Weekly decision digest", "Revenue-weighted themes", "Shareable roadmap"],
        },
        {
          label: "Product",
          title: "Connect every request to evidence.",
          description: "Keep discovery attached to the decisions, specs, and releases it informed.",
          benefits: ["Research repository", "Opportunity scoring", "Release follow-up"],
        },
        {
          label: "Success",
          title: "Close the loop with every customer.",
          description: "Know when a requested feature ships and reach out while the moment is fresh.",
          benefits: ["Customer watchlists", "Automatic alerts", "Personalized updates"],
        },
      ]}
    />
  ),
  "customer-story": () => (
    <CustomerStory
      shader="mesh-gradient"
      brand={brand}
      company="NORTHWIND"
      quote="The new launch page made the product feel established before our first sales call."
      name="Ada Okonkwo"
      role="Co-founder, Northwind"
      rating="4.9 from 120 reviews"
      team={[
        { name: "Ada Okonkwo" },
        { name: "Tomas Reyes" },
        { name: "Priya Raman" },
      ]}
      metrics={[
        { value: "42%", label: "More qualified demo requests" },
        { value: "3.1×", label: "Faster page production" },
        { value: "18h", label: "From brief to launch" },
        { value: "96", label: "Lighthouse performance" },
      ]}
      action={{ label: "Read the case study", href: "#" }}
    />
  ),
  security: () => (
    <TrustCenter
      title="Enterprise-ready by design"
      description="Answer security questions before they slow a deal down. Put controls, standards, and uptime in one credible section."
      commitments={[
        "Encryption in transit and at rest",
        "Role-based access and audit logs",
        "Data residency options",
      ]}
      standards={[
        { name: "SOC 2", description: "Independent controls review for security and availability.", status: "Type II" },
        { name: "GDPR", description: "Privacy tooling, DPAs, and configurable data retention.", status: "Ready" },
        { name: "SSO", description: "SAML, SCIM provisioning, and enforced authentication.", status: "Included" },
        { name: "Uptime", description: "Public status history and financially backed response targets.", status: "99.99%" },
      ]}
      action={{ label: "Visit trust center", href: "#" }}
    />
  ),
  newsletter: () => (
    <Newsletter
      shader="silk"
      brand={brand}
      eyebrow="Field notes"
      title="One useful growth idea, every other Thursday."
      description="Short teardown, clear takeaway, no filler. Read by product and marketing teams at more than 2,000 companies."
      buttonLabel="Join 8,400 readers"
      note="Free forever. Unsubscribe in one click."
    />
  ),
  contact: () => (
    <Contact
      eyebrow="Talk to a human"
      title="Show us what you’re building"
      description="Bring the brief, the half-finished page, or just the problem. We usually reply within one business day."
      methods={[
        { label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
        { label: "Response time", value: "Within one business day" },
        { label: "Best for", value: "Product demos, enterprise, partnerships" },
      ]}
    />
  ),
  changelog: () => (
    <Changelog
      title="What shipped lately"
      description="A launch timeline that works for product updates, roadmaps, or a public changelog."
      releases={[
        {
          version: "v0.4",
          date: "July 28, 2026",
          title: "Marketing collection",
          description: "A broader library for teams building complete landing pages.",
          changes: ["New contact, trust, newsletter, and case-study sections", "Four full-page starter templates"],
          status: "Latest",
        },
        {
          version: "v0.3",
          date: "July 10, 2026",
          title: "Moving gradients",
          changes: ["Aurora, mesh, silk, and animated CSS backgrounds", "Reduced-motion fallbacks"],
        },
        {
          version: "v0.2",
          date: "June 18, 2026",
          title: "React section library",
          changes: ["Composable marketing sections", "Shared brand palette"],
        },
      ]}
    />
  ),
  gallery: () => (
    <Gallery
      eyebrow="Template gallery"
      title="Start from a page that already has a point of view"
      description="Use the same gallery for case studies, product templates, portfolios, or industry solutions."
      columns={3}
      items={[
        {
          title: "AI research workspace",
          category: "AI",
          result: "+38% demos",
          visual: <div className="size-full bg-[radial-gradient(circle_at_25%_25%,#7c3aed,transparent_40%),linear-gradient(145deg,#0d1018,#191326)]" />,
        },
        {
          title: "Developer observability",
          category: "Developer tools",
          result: "96 Lighthouse",
          visual: <div className="size-full bg-[radial-gradient(circle_at_75%_20%,#22d3ee,transparent_38%),linear-gradient(145deg,#0d1018,#111c24)]" />,
        },
        {
          title: "Independent design studio",
          category: "Agency",
          result: "18h to launch",
          visual: <div className="size-full bg-[radial-gradient(circle_at_50%_80%,#f97316,transparent_42%),linear-gradient(145deg,#17100d,#231419)]" />,
        },
      ]}
      action={{ label: "Browse all templates", href: "../templates/" }}
    />
  ),
  elements: () => (
    <Container className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-0">
        Marketing elements
      </h1>
      <p className="mt-3 max-w-xl text-ink-400">
        Small social-proof, status, command, and selection primitives for the spaces between sections.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-700 bg-ink-850 p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Avatar stack</p>
          <AvatarStack
            className="mt-5"
            size="lg"
            items={[
              { name: "Ada Okonkwo" },
              { name: "Tomas Reyes" },
              { name: "Priya Raman" },
              { name: "Sven Aalto" },
              { name: "Mei Chen" },
              { name: "Jonah Blake" },
            ]}
          />
          <Rating className="mt-4" label="Loved by 2,400 builders" />
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-850 p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Status badges</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge pulse>Operational</StatusBadge>
            <StatusBadge tone="info">New</StatusBadge>
            <StatusBadge tone="warning">Beta</StatusBadge>
            <StatusBadge tone="neutral">Draft</StatusBadge>
          </div>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-850 p-6 sm:col-span-2">
          <CopyField label="Install" value="npm install shaderbg" />
          <SegmentedControl
            className="mt-6"
            label="Billing period"
            options={[
              { label: "Monthly", value: "monthly" },
              { label: "Annual · save 20%", value: "annual" },
            ]}
          />
        </div>
      </div>
    </Container>
  ),
  "experimental-controls": () => (
    <Container className="py-24">
      <SectionHeading
        eyebrow="Experimental pack"
        title="Controls that feel alive"
        description="Magnetic, liquid, morphing, predictive, and comparison interactions."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="min-h-72 rounded-3xl border border-ink-700 bg-ink-850 p-7">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-500">
            Morphing notch
          </p>
          <div className="mt-8 flex justify-center">
            <MorphingNotch
              items={[
                { label: "Search", content: <VanishingInput placeholders={["Search components…", "Find a hero…", "Try “kinetic text”"]} /> },
                { label: "Theme", content: <SegmentedControl options={[{ label: "Midnight", value: "midnight" }, { label: "Electric", value: "electric" }]} /> },
                { label: "Ship", content: <p className="text-sm text-white/70">The current collection is ready to export.</p> },
              ]}
            />
          </div>
        </div>
        <div className="rounded-3xl border border-ink-700 bg-ink-850 p-7">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-500">
            Pointer-aware buttons
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <MagneticButton>Magnetic CTA</MagneticButton>
            <WetPaintButton>Wet paint</WetPaintButton>
            <GooeyDropdown
              label="Gooey menu"
              options={[
                { label: "Create", value: "create" },
                { label: "Duplicate", value: "duplicate" },
                { label: "Archive", value: "archive" },
              ]}
            />
          </div>
          <p className="mt-24 text-sm text-ink-400">
            Hover this{" "}
            <LinkPreview
              href="#"
              preview={<div className="aspect-[16/9] rounded-lg bg-[radial-gradient(circle_at_25%_25%,#4f46e5,transparent_38%),#11131b]" />}
            >
              project link
            </LinkPreview>{" "}
            for a live preview.
          </p>
        </div>
        <div className="lg:col-span-2">
          <CodeComparison
            before={`const hero = new Shader();\nhero.mount(canvas);\nhero.resize();\nhero.play();\nwindow.addEventListener("resize", resize);`}
            after={`<Hero\n  shader="aurora"\n  brand={brand}\n  headline="Ready to ship."\n/>`}
          />
        </div>
      </div>
    </Container>
  ),
  "experimental-cards": () => (
    <Container className="py-24">
      <SectionHeading
        eyebrow="Experimental pack"
        title="Cards with physical behaviour"
        description="Reveal direction, focus, drag, stack, magnify, and expand."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <MorphingDialog
          title="Project Meridian"
          description="The compact card becomes the reading surface."
          trigger={
            <div className="p-6">
              <div className="aspect-[16/10] rounded-xl bg-[radial-gradient(circle_at_70%_25%,#22d3ee,transparent_38%),#111827]" />
              <h3 className="mt-5 font-semibold text-ink-0">Morphing case study</h3>
              <p className="mt-2 text-sm text-ink-400">Open the project →</p>
            </div>
          }
        >
          <div className="aspect-[16/8] rounded-2xl bg-[radial-gradient(circle_at_25%_30%,#4f46e5,transparent_35%),radial-gradient(circle_at_75%_65%,#22d3ee,transparent_38%),#0d111b]" />
          <p className="mt-6 leading-relaxed text-ink-300">
            Morphing dialogs preserve context: the thing you clicked visibly becomes the place where you continue reading.
          </p>
        </MorphingDialog>
        <DirectionAwareCard
          className="min-h-80 border border-ink-700 bg-ink-850"
          reveal={<div><p className="text-xs uppercase tracking-[0.12em] text-white/65">Direction aware</p><p className="mt-3 text-xl font-semibold">The overlay follows your arrival.</p></div>}
        >
          <div className="grid min-h-80 place-items-center bg-[radial-gradient(circle_at_center,#7c3aed,transparent_34%),#11131b]">
            <span className="text-sm text-white/65">Enter from any edge</span>
          </div>
        </DirectionAwareCard>
        <LensReveal
          className="min-h-80"
          base={<div className="min-h-80 bg-[linear-gradient(135deg,#171a24,#312e81)]" />}
          detail={<div className="min-h-80 bg-[radial-gradient(circle_at_center,#fff 0_2px,#22d3ee 3px_5px,#4f46e5 6px_9px,#07080c 10px)] bg-[length:24px_24px]" />}
        />
        <DraggableCardPile
          items={[
            { id: "one", rotation: -6, content: <div className="aspect-[4/3] bg-gradient-to-br from-indigo-600 to-violet-500 p-5 font-semibold text-white">Strategy</div> },
            { id: "two", rotation: 4, content: <div className="aspect-[4/3] bg-gradient-to-br from-cyan-600 to-blue-600 p-5 font-semibold text-white">Identity</div> },
            { id: "three", rotation: -1, content: <div className="aspect-[4/3] bg-gradient-to-br from-orange-500 to-rose-600 p-5 font-semibold text-white">Launch</div> },
          ]}
        />
        <div className="md:col-span-2">
          <IsometricFeatureBoxes
            items={[
              { title: "Collect", description: "Pull every signal into one layer." },
              { title: "Connect", description: "Map evidence to the decision." },
              { title: "Ship", description: "Turn the plan into a release." },
              { title: "Learn", description: "Measure the response." },
              { title: "Repeat", description: "Keep the system alive." },
            ]}
          />
        </div>
      </div>
    </Container>
  ),
  "experimental-type": () => (
    <div className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Experimental pack"
          title="Typography as an interaction"
          description="Scramble, flip, squiggle, morph, mask, and respond to scroll."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-ink-700 bg-ink-850 p-8">
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Encrypted</p>
            <EncryptedText
              text="CONFIDENTIAL SIGNAL"
              className="mt-5 block text-2xl font-semibold text-emerald-300"
            />
          </div>
          <div className="rounded-3xl border border-ink-700 bg-ink-850 p-8">
            <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Split flap</p>
            <FlippingTextBoard
              className="mt-5 text-xl"
              words={["RIYADH", "LONDON", "TOKYO", "ONLINE"]}
            />
          </div>
          <div className="rounded-3xl border border-ink-700 bg-ink-850 p-8">
            <SquigglyText text="WOBBLE ON HOVER" className="text-2xl font-semibold text-ink-0" />
            <p className="mt-8 text-3xl font-semibold">
              <TypeMaskReveal>Light moving through type.</TypeMaskReveal>
            </p>
          </div>
          <ProgressiveBlur edge="bottom" className="h-56 rounded-3xl border border-ink-700 bg-ink-850 p-8">
            <p className="text-4xl font-semibold leading-tight text-ink-0">
              Progressive blur makes content feel like it continues beyond the frame.
            </p>
          </ProgressiveBlur>
          <div className="grid place-items-center rounded-3xl border border-ink-700 bg-ink-850 p-8">
            <PathMorph
              className="size-32 text-brand-400"
              paths={[
                "M10 10 L90 10 L90 90 L10 90 Z",
                "M50 5 L95 50 L50 95 L5 50 Z",
                "M20 5 L80 5 L95 80 L5 80 Z",
              ]}
            />
          </div>
          <div className="grid place-items-center rounded-3xl border border-ink-700 bg-ink-850 p-8 text-center">
            <p className="text-sm text-ink-400">Scroll the page, then watch the ribbon below react to velocity.</p>
          </div>
        </div>
      </Container>
      <KineticTypeRibbon className="mt-16" text="KINETIC SYSTEM" />
    </div>
  ),
  "experimental-spatial": () => (
    <div className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Experimental pack"
          title="Spatial galleries and movement"
          description="Drag the world, trail the pointer, rotate the rail, and stack the story."
        />
        <ImageTrailCursor
          className="mt-12 grid place-items-center border border-ink-700 bg-ink-850"
          items={[
            <div className="aspect-[4/3] bg-gradient-to-br from-indigo-600 to-violet-500" />,
            <div className="aspect-[4/3] bg-gradient-to-br from-cyan-500 to-blue-700" />,
            <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-rose-600" />,
          ]}
        >
          <p className="text-xl font-semibold text-ink-0">Move your cursor through the field</p>
        </ImageTrailCursor>
        <InfiniteCanvas
          className="mt-8"
          items={[
            { id: "a", x: 120, y: 120, content: <div className="aspect-[4/3] bg-gradient-to-br from-violet-600 to-indigo-900 p-5 text-white">Research lab</div> },
            { id: "b", x: 520, y: 260, content: <div className="aspect-[4/3] bg-gradient-to-br from-cyan-500 to-slate-900 p-5 text-white">Spatial portfolio</div> },
            { id: "c", x: 940, y: 90, content: <div className="aspect-[4/3] bg-gradient-to-br from-orange-500 to-rose-900 p-5 text-white">Product launch</div> },
            { id: "d", x: 350, y: 610, content: <div className="aspect-[4/3] bg-gradient-to-br from-emerald-500 to-teal-950 p-5 text-white">Data story</div> },
          ]}
        />
        <Marquee3D
          className="mt-10"
          items={["Kinetic", "Spatial", "Reactive", "Generative"].map((item) => (
            <div key={item} className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-ink-800 to-brand-900 text-sm font-semibold text-ink-0">
              {item}
            </div>
          ))}
        />
        <ScrollCardStack
          className="mx-auto mt-12 max-w-3xl"
          items={["Frame the idea", "Build the system", "Launch the story"].map((item, index) => (
            <div key={item} className="grid min-h-64 place-items-center bg-[radial-gradient(circle_at_center,rgba(99,102,241,.26),transparent_42%),#12141c] p-8 text-3xl font-semibold text-ink-0">
              <span className="text-brand-300">0{index + 1}</span> {item}
            </div>
          ))}
        />
      </Container>
    </div>
  ),
  "experimental-media": () => (
    <Container className="py-24">
      <SectionHeading
        eyebrow="Experimental pack"
        title="Media that responds"
        description="Pixel reveal, scroll-controlled frames, microphone energy, and an opt-in camera mosaic."
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <PixelDitherReveal>
          <div className="aspect-[3/2] bg-[radial-gradient(circle_at_30%_30%,#a855f7,transparent_34%),radial-gradient(circle_at_70%_65%,#22d3ee,transparent_36%),#0b0c13]" />
        </PixelDitherReveal>
        <AudioReactiveShader />
        <WebcamPixelGrid />
        <div>
          <ScrollScrubVideo
            height={620}
            frames={[
              <div key="1" className="size-full bg-[radial-gradient(circle_at_20%_30%,#4f46e5,transparent_35%),#0b0c13]" />,
              <div key="2" className="size-full bg-[radial-gradient(circle_at_45%_45%,#a855f7,transparent_38%),#0b0c13]" />,
              <div key="3" className="size-full bg-[radial-gradient(circle_at_70%_55%,#22d3ee,transparent_35%),#0b0c13]" />,
              <div key="4" className="size-full bg-[radial-gradient(circle_at_80%_70%,#f97316,transparent_38%),#0b0c13]" />,
            ]}
          />
        </div>
      </div>
    </Container>
  ),

  // ---- shader-native components ----
  "shader-text": () => (
    <Container className="py-28 text-center">
      <h2 className="text-5xl font-semibold tracking-tight sm:text-7xl">
        <ShaderText shader="mesh-gradient" brand={brand}>
          Shader in the type
        </ShaderText>
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-ink-400">
        A live shader clipped to the glyphs via background-clip, refreshed at
        12fps. Prefer calm shaders here.
      </p>
    </Container>
  ),
  "shader-cards": () => (
    <Container className="py-24">
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { s: "holo-foil", t: "Holo Foil", d: "Hover to wake the foil." },
          { s: "liquid-ripple", t: "Liquid Ripple", d: "Hover to stir the water." },
          { s: "plasma", t: "Plasma", d: "Hover to raise the heat." },
        ].map((c) => (
          <ShaderCard key={c.s} shader={c.s} brand={brand} className="min-h-[220px]">
            <h3 className="text-base font-semibold text-ink-0">{c.t}</h3>
            <p className="mt-2 text-[15px] text-ink-300">{c.d}</p>
          </ShaderCard>
        ))}
      </div>
    </Container>
  ),
  spotlight: () => (
    <Container className="py-24">
      <SpotlightGrid className="sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SpotlightCard key={i} className="min-h-[170px]">
            <h3 className="text-base font-semibold text-ink-0">Card {i + 1}</h3>
            <p className="mt-2 text-[15px] text-ink-300">
              One listener, CSS gradients. Cheap with many cards.
            </p>
          </SpotlightCard>
        ))}
      </SpotlightGrid>
    </Container>
  ),
  "border-beam": () => (
    <Container className="py-28">
      <div className="grid gap-5 sm:grid-cols-3">
        {[4, 6, 10].map((d) => (
          <BorderBeam key={d} duration={d} contentClassName="p-6">
            <h3 className="text-base font-semibold text-ink-0">{d}s circuit</h3>
            <p className="mt-2 text-[15px] text-ink-300">
              Pure CSS conic gradient behind a masked frame.
            </p>
          </BorderBeam>
        ))}
      </div>
    </Container>
  ),
  orb: () => (
    <Container className="py-24">
      <div className="flex flex-wrap items-center justify-center gap-12">
        <ShaderOrb shader="plasma" brand={brand} shape="blob" size="260px" />
        <ShaderOrb shader="holo-foil" brand={brand} shape="circle" size="220px" />
        <ShaderOrb shader="caustics" brand={brand} shape="squircle" size="200px" />
      </div>
    </Container>
  ),
  divider: () => (
    <div>
      <Container className="py-20">
        <p className="text-center text-ink-300">Section above</p>
      </Container>
      <ShaderDivider shader="aurora" brand={brand} />
      <Container className="py-20">
        <p className="text-center text-ink-300">Section below</p>
      </Container>
    </div>
  ),
  noise: () => (
    <div className="relative">
      <div className="bg-gradient-to-b from-brand-900 to-ink-950 py-32">
        <NoiseOverlay opacity={0.06} />
        <Container>
          <p className="text-center text-ink-100">
            Grain overlay on a flat gradient — unifies flat sections with shader
            ones and hides banding.
          </p>
        </Container>
      </div>
    </div>
  ),

  footer: () => (
    <Footer
      tagline="WebGL shader backgrounds and the marketing sections to put them in."
      columns={[
        { heading: "Product", links: [{ label: "Shaders", href: "#" }, { label: "Sections", href: "#" }, { label: "Pricing", href: "#" }] },
        { heading: "Developers", links: [{ label: "Docs", href: "#" }, { label: "GitHub", href: "#" }] },
        { heading: "Company", links: [{ label: "About", href: "#" }, { label: "Privacy", href: "#" }] },
      ]}
      newsletter={{ heading: "New shaders, monthly" }}
    />
  ),
};

function Index() {
  return (
    <Container className="py-20">
      <h1 className="text-2xl font-semibold text-ink-0">Section catalog</h1>
      <p className="mt-2 text-ink-400">
        Each section rendered on its own, at the top of the page.
      </p>
      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
        {Object.keys(SECTIONS).map((key) => (
          <li key={key}>
            <a
              href={`?s=${key}`}
              className="block rounded-lg border border-ink-700 bg-ink-850 px-4 py-3 text-[15px] text-ink-100 transition-colors hover:border-brand-400"
            >
              {key}
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}

const which = new URLSearchParams(location.search).get("s");
const render = which ? SECTIONS[which] : null;

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(render ? <>{render()}</> : <Index />);
}
