import type { ReactNode } from "react";
import {
  AnnouncementBar,
  CTA,
  Changelog,
  Contact,
  CustomerStory,
  FAQ,
  FeatureRows,
  Features,
  Footer,
  Gallery,
  Hero,
  LogoCloud,
  Nav,
  Newsletter,
  Pricing,
  ProductShowcase,
  Stats,
  TrustCenter,
  UseCases,
} from "../../src/sections/index";
import {
  BrowserFrame,
  Button,
  Container,
  CopyField,
  GradientText,
  StatusBadge,
} from "../../src/ui/index";
import type { BrandPalette } from "../../src/core/theme";

const palettes = {
  saas: {
    primary: "#4f46e5",
    secondary: "#a855f7",
    accent: "#22d3ee",
    background: "#07080c",
  },
  ai: {
    primary: "#0f766e",
    secondary: "#34d399",
    accent: "#f0abfc",
    background: "#06100e",
  },
  developer: {
    primary: "#2563eb",
    secondary: "#38bdf8",
    accent: "#a3e635",
    background: "#05080f",
  },
  agency: {
    primary: "#c2410c",
    secondary: "#f97316",
    accent: "#facc15",
    background: "#100805",
  },
} satisfies Record<string, BrandPalette>;

function Visual({
  className,
  children,
}: {
  className: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative aspect-[16/10] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function Mark({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="size-7 rounded-lg bg-[conic-gradient(from_210deg,var(--color-brand-500),var(--color-brand-300),var(--color-accent-400),var(--color-brand-500))]" />
      {children}
    </>
  );
}

const footerColumns = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

const sharedFaq = [
  {
    question: "Can I use this page in a production project?",
    answer:
      "Yes. Replace the sample copy, connect the forms, and point the placeholder links to real routes.",
  },
  {
    question: "Do the sections work without WebGL?",
    answer:
      "Yes. Shader sections fall back to a palette-aware CSS gradient and every flat section continues to work normally.",
  },
  {
    question: "Can I change the visual direction?",
    answer:
      "The content is composed from reusable props and Tailwind classes, so brand tokens, spacing, layout, and copy are all editable.",
  },
];

function SaasPage() {
  const brand = palettes.saas;
  return (
    <>
      <Nav
        logo={<Mark>Signalroom</Mark>}
        links={[
          { label: "Product", href: "#features" },
          { label: "Use cases", href: "#use-cases" },
          { label: "Pricing", href: "#pricing" },
        ]}
        secondaryCta={{ label: "Log in", href: "#" }}
        cta={{ label: "Start free", href: "#pricing" }}
      />
      <main>
        <Hero
          layout="split"
          shader="mesh-gradient"
          brand={brand}
          badge={{ label: "New · AI summaries for every call" }}
          headline={
            <>
              Know what customers need{" "}
              <GradientText>before they ask twice.</GradientText>
            </>
          }
          subhead="Signalroom turns calls, tickets, and product activity into one ranked view of what deserves your next sprint."
          primaryAction={{ label: "Start free", href: "#pricing" }}
          secondaryAction={{ label: "Book a demo", href: "#contact" }}
          note="14-day trial · No credit card"
          visual={
            <BrowserFrame url="app.signalroom.dev/insights">
              <Visual className="bg-[radial-gradient(circle_at_20%_20%,#4f46e5,transparent_38%),radial-gradient(circle_at_75%_70%,#22d3ee,transparent_38%),#11131c]">
                <div className="absolute inset-x-8 bottom-8 grid gap-2">
                  {["Onboarding friction", "Team permissions", "Mobile export"].map(
                    (item, index) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-xs text-white/85 backdrop-blur"
                      >
                        {item}
                        <span>{92 - index * 11}%</span>
                      </div>
                    ),
                  )}
                </div>
              </Visual>
            </BrowserFrame>
          }
        />
        <LogoCloud
          variant="marquee"
          logos={["Northwind", "Vertex", "Lumen", "Cobalt", "Meridian", "Fathom"]}
        />
        <Features
          id="features"
          eyebrow="Customer intelligence"
          title="Evidence for every product decision"
          description="A complete SaaS feature grid with enough detail to make the product feel real."
          features={[
            { title: "Unified inbox", description: "Calls, tickets, surveys, and product events in one searchable feed." },
            { title: "Automatic themes", description: "AI groups related feedback while preserving the original evidence." },
            { title: "Revenue context", description: "See the accounts, plans, and expansion risk behind every request." },
            { title: "Opportunity scoring", description: "Rank work with a transparent score your whole team can inspect." },
            { title: "Customer follow-up", description: "Notify the right people when a requested improvement ships." },
            { title: "Executive digest", description: "A concise weekly summary for the people who do not live in the tool." },
          ]}
        />
        <UseCases
          id="use-cases"
          eyebrow="One workspace"
          title="Useful at every altitude"
          cases={[
            {
              label: "Founders",
              title: "A weekly view of product risk.",
              description: "Know where deals stall and where existing customers are losing patience.",
              benefits: ["Revenue-weighted pain", "Board-ready summaries", "Live opportunity map"],
            },
            {
              label: "Product",
              title: "Research that stays attached to the roadmap.",
              description: "Connect evidence to decisions, specifications, and releases.",
              benefits: ["Interview repository", "Theme clustering", "Decision history"],
            },
            {
              label: "Success",
              title: "Close every customer loop.",
              description: "Track requests and reach out the moment progress is ready to share.",
              benefits: ["Account watchlists", "Release alerts", "Personal updates"],
            },
          ]}
        />
        <CustomerStory
          company="NORTHWIND"
          quote="We stopped debating the loudest anecdote and started planning from the full customer picture."
          name="Ada Okonkwo"
          role="VP Product, Northwind"
          metrics={[
            { value: "31%", label: "Faster discovery cycles" },
            { value: "2.4×", label: "More feedback linked to releases" },
            { value: "11h", label: "Saved per product lead each month" },
            { value: "18%", label: "Lift in customer follow-up" },
          ]}
          action={{ label: "Read the story", href: "#" }}
        />
        <Pricing
          id="pricing"
          description="Start with one product team. Expand when the habit sticks."
          tiers={[
            {
              name: "Starter",
              monthly: 0,
              description: "For early product discovery.",
              features: ["2 seats", "500 feedback items", "Weekly digest"],
              cta: { label: "Start free", href: "#" },
            },
            {
              name: "Growth",
              monthly: 39,
              description: "For teams shipping every week.",
              features: ["Unlimited feedback", "Revenue context", "Custom scoring", "Integrations"],
              cta: { label: "Try Growth", href: "#" },
              featured: true,
            },
            {
              name: "Enterprise",
              monthly: null,
              description: "For multi-product organizations.",
              features: ["SSO and SCIM", "Data residency", "Priority support"],
              cta: { label: "Talk to sales", href: "#contact" },
            },
          ]}
        />
        <FAQ items={sharedFaq} />
        <Contact
          id="contact"
          title="See your customer signals in one place"
          description="Bring a sample workflow and we will show you how it maps to Signalroom."
          methods={[
            { label: "Response time", value: "Within one business day" },
            { label: "Demo length", value: "25 minutes" },
          ]}
        />
        <CTA
          shader="liquid-ripple"
          brand={brand}
          title="Make the next roadmap easier to defend."
          description="Collect the evidence this week. Turn it into a ranked plan next week."
          primaryAction={{ label: "Start free", href: "#" }}
          secondaryAction={{ label: "Book a demo", href: "#contact" }}
        />
      </main>
      <Footer
        logo={<Mark>Signalroom</Mark>}
        tagline="Customer intelligence for product teams that listen closely."
        columns={footerColumns}
      />
    </>
  );
}

function AiPage() {
  const brand = palettes.ai;
  const productVisual = (
    <Visual className="bg-[radial-gradient(circle_at_70%_20%,#34d399,transparent_33%),radial-gradient(circle_at_25%_75%,#f0abfc,transparent_38%),#081411]">
      <div className="absolute left-6 right-6 top-6 rounded-xl border border-white/10 bg-black/30 p-5 font-mono text-xs leading-6 text-emerald-100 backdrop-blur">
        <p className="text-white/45">Research brief</p>
        <p className="mt-2">Compare the five strongest market signals.</p>
        <p className="mt-4 text-fuchsia-200">→ 128 sources synthesized</p>
        <p className="text-fuchsia-200">→ confidence intervals included</p>
      </div>
    </Visual>
  );

  return (
    <>
      <Nav
        logo={<Mark>Reasonwell</Mark>}
        links={[
          { label: "Platform", href: "#platform" },
          { label: "Use cases", href: "#use-cases" },
          { label: "Security", href: "#security" },
        ]}
        secondaryCta={{ label: "Sign in", href: "#" }}
        cta={{ label: "Try Reasonwell", href: "#" }}
      />
      <main>
        <Hero
          layout="split"
          shader="aurora"
          brand={brand}
          badge={{ label: "Reasoning models, grounded in your sources" }}
          headline="Research that shows its work."
          subhead="Reasonwell gives strategy teams a fast, auditable path from a difficult question to a defensible answer."
          primaryAction={{ label: "Start a workspace", href: "#" }}
          secondaryAction={{ label: "Watch a 3-minute tour", href: "#platform" }}
          visual={<BrowserFrame url="app.reasonwell.ai">{productVisual}</BrowserFrame>}
        />
        <LogoCloud logos={["Arcadia", "Northwind", "Fathom", "Meridian", "Lumen"]} />
        <FeatureRows
          id="platform"
          eyebrow="From question to decision"
          title="An AI product page that earns trust"
          rows={[
            {
              eyebrow: "Ground",
              title: "Start with sources your team already trusts.",
              description: "Connect internal knowledge and current external research. Every statement keeps its citation.",
              bullets: ["Source-level permissions", "Freshness controls", "Inline evidence"],
              visual: productVisual,
              visualUrl: "app.reasonwell.ai/sources",
            },
            {
              eyebrow: "Reason",
              title: "Make the analysis inspectable.",
              description: "Compare hypotheses, reveal uncertainty, and let reviewers challenge an assumption without rerunning the entire brief.",
              bullets: ["Visible assumptions", "Confidence ranges", "Reviewer comments"],
              visual: <Visual className="bg-[radial-gradient(circle_at_20%_30%,#14b8a6,transparent_34%),linear-gradient(145deg,#07110f,#151125)]" />,
              visualUrl: "app.reasonwell.ai/analysis",
            },
          ]}
        />
        <UseCases
          id="use-cases"
          title="Built for high-context questions"
          cases={[
            { label: "Strategy", title: "Market maps with an audit trail.", description: "Synthesize fragmented evidence without losing the source material.", benefits: ["Landscape scans", "Scenario analysis", "Executive briefs"] },
            { label: "Research", title: "A faster first pass, not a black box.", description: "Automate collection and comparison while experts stay in control.", benefits: ["Literature reviews", "Evidence tables", "Gap analysis"] },
            { label: "Operations", title: "Turn policies into clear answers.", description: "Give teams consistent guidance grounded in approved internal material.", benefits: ["Policy assistants", "Process checks", "Change alerts"] },
          ]}
        />
        <TrustCenter
          id="security"
          title="Your evidence stays yours"
          description="Enterprise controls for confidential research and regulated decisions."
          commitments={["No training on customer data", "Private model gateways", "Complete audit history"]}
          standards={[
            { name: "SOC 2", description: "Security and availability controls independently audited.", status: "Type II" },
            { name: "GDPR", description: "Regional processing and configurable retention.", status: "Ready" },
            { name: "SSO", description: "SAML, SCIM, and domain enforcement.", status: "Included" },
            { name: "Zero-retain", description: "Provider retention disabled for enterprise workspaces.", status: "Active" },
          ]}
          action={{ label: "Read the security brief", href: "#" }}
        />
        <Newsletter
          shader="silk"
          brand={brand}
          eyebrow="Reasoning notes"
          title="Practical patterns for trustworthy AI products."
          description="One teardown every other week. Written for the teams doing the hard implementation work."
          note="No hype cycle. Just product patterns and research."
        />
        <CTA
          shader="caustics"
          brand={brand}
          title="Bring one hard question."
          description="We will show you the sources, assumptions, and answer in the same workspace."
          primaryAction={{ label: "Start a workspace", href: "#" }}
          secondaryAction={{ label: "Book a technical demo", href: "#" }}
        />
      </main>
      <Footer
        logo={<Mark>Reasonwell</Mark>}
        tagline="Auditable AI research for high-context decisions."
        columns={footerColumns}
      />
    </>
  );
}

function DeveloperPage() {
  const brand = palettes.developer;
  const consoleVisual = (
    <Visual className="bg-[linear-gradient(145deg,#070b13,#0b1422)]">
      <div className="absolute inset-5 rounded-xl border border-white/10 bg-black/35 p-5 font-mono text-xs leading-6 text-sky-100">
        <p className="text-white/45">$ trace deploy --service checkout</p>
        <p className="mt-3 text-lime-300">✓ release 84f2 reached 100%</p>
        <p>p95 latency ........ 184ms</p>
        <p>error rate ......... 0.08%</p>
        <p className="text-sky-300">root cause ........ cache stampede</p>
      </div>
    </Visual>
  );

  return (
    <>
      <AnnouncementBar dismissible={false}>
        <StatusBadge tone="info">New</StatusBadge>
        Distributed traces now retain deploy context automatically
      </AnnouncementBar>
      <Nav
        logo={<Mark>Tracefield</Mark>}
        links={[
          { label: "Product", href: "#features" },
          { label: "Changelog", href: "#changelog" },
          { label: "Pricing", href: "#pricing" },
        ]}
        secondaryCta={{ label: "Docs", href: "#" }}
        cta={{ label: "Start tracing", href: "#" }}
      />
      <main>
        <Hero
          layout="split"
          shader="neon-grid"
          brand={brand}
          headline="Find the failure before the thread finds you."
          subhead="Tracefield connects deploys, traces, logs, and ownership so the right engineer gets the full story in one link."
          primaryAction={{ label: "Start tracing", href: "#" }}
          secondaryAction={{ label: "Read the docs", href: "#" }}
          note="Free for 5M spans · OpenTelemetry native"
          visual={
            <div>
              <BrowserFrame url="app.tracefield.dev/traces">{consoleVisual}</BrowserFrame>
              <CopyField className="mt-4" value="npx tracefield init --otel" />
            </div>
          }
        />
        <LogoCloud variant="marquee" logos={["Fly", "Cobalt", "Meridian", "Vertex", "Northwind", "Fathom"]} />
        <Features
          id="features"
          eyebrow="Debug in context"
          title="Everything around the error, already connected"
          features={[
            { title: "Deploy-aware traces", description: "Every span knows the release, commit, and owner that produced it." },
            { title: "Service map", description: "See the path through queues, vendors, and services before opening a trace." },
            { title: "Log correlation", description: "Jump from a slow span to the exact surrounding logs without a query." },
            { title: "Ownership routing", description: "Send a complete incident bundle to the team that can resolve it." },
            { title: "Regression alerts", description: "Compare releases and alert only when a meaningful change appears." },
            { title: "OpenTelemetry", description: "Use the instrumentation you already have. Keep your data portable." },
          ]}
        />
        <ProductShowcase
          title="One debugging surface"
          description="Tabbed product views work especially well for technical products with several interconnected workflows."
          tabs={[
            { label: "Trace", url: "app.tracefield.dev/trace/84f2", content: consoleVisual, description: "The entire request path, deploy context, and related logs." },
            { label: "Compare", url: "app.tracefield.dev/compare", content: <Visual className="bg-[radial-gradient(circle_at_30%_50%,#2563eb,transparent_38%),#09101b]" />, description: "Compare latency and errors between any two releases." },
            { label: "Route", url: "app.tracefield.dev/owners", content: <Visual className="bg-[radial-gradient(circle_at_72%_30%,#a3e635,transparent_30%),#09101b]" />, description: "Route incidents to owners with the evidence attached." },
          ]}
        />
        <Changelog
          id="changelog"
          title="Shipping in public"
          description="A developer page feels healthier when the product visibly moves."
          releases={[
            { version: "v1.18", date: "July 28, 2026", title: "Deploy context everywhere", status: "Latest", changes: ["Release comparison", "Commit-level ownership", "Faster service map"] },
            { version: "v1.17", date: "July 9, 2026", title: "Queue instrumentation", changes: ["Kafka and SQS presets", "Async request linking"] },
            { version: "v1.16", date: "June 20, 2026", title: "Incident bundles", changes: ["Shareable trace snapshots", "Slack and PagerDuty routing"] },
          ]}
        />
        <Pricing
          id="pricing"
          tiers={[
            { name: "Hobby", monthly: 0, description: "For side projects and prototypes.", features: ["5M spans/month", "7-day retention", "2 seats"], cta: { label: "Start free", href: "#" } },
            { name: "Team", monthly: 29, description: "Per engineer, for production teams.", features: ["100M spans/month", "30-day retention", "Deploy comparison", "Team routing"], cta: { label: "Start Team", href: "#" }, featured: true },
            { name: "Scale", monthly: null, description: "For high-volume platforms.", features: ["Custom retention", "Private regions", "SAML and SCIM"], cta: { label: "Talk to us", href: "#" } },
          ]}
        />
        <CTA
          shader="electric"
          brand={brand}
          title="The next production mystery is already forming."
          description="Instrument now. Your future on-call self will be grateful."
          primaryAction={{ label: "Start tracing", href: "#" }}
          secondaryAction={{ label: "Read the quickstart", href: "#" }}
        />
      </main>
      <Footer
        logo={<Mark>Tracefield</Mark>}
        tagline="OpenTelemetry-native observability for teams that ship often."
        columns={footerColumns}
      />
    </>
  );
}

function AgencyPage() {
  const brand = palettes.agency;
  const galleryItems = [
    {
      title: "Northwind intelligence",
      category: "Brand + product",
      result: "+42% demos",
      visual: <Visual className="size-full bg-[radial-gradient(circle_at_28%_24%,#f97316,transparent_38%),linear-gradient(145deg,#140a06,#27100c)]" />,
    },
    {
      title: "Cobalt infrastructure",
      category: "Launch system",
      result: "18h to launch",
      visual: <Visual className="size-full bg-[radial-gradient(circle_at_75%_30%,#38bdf8,transparent_38%),linear-gradient(145deg,#07111a,#0b1f28)]" />,
    },
    {
      title: "Meridian culture",
      category: "Editorial",
      result: "3.1× reading",
      visual: <Visual className="size-full bg-[radial-gradient(circle_at_50%_78%,#facc15,transparent_38%),linear-gradient(145deg,#140f05,#27180a)]" />,
    },
    {
      title: "Fathom portfolio",
      category: "Web experience",
      result: "Awwwards SOTD",
      visual: <Visual className="size-full bg-[radial-gradient(circle_at_65%_18%,#c084fc,transparent_38%),linear-gradient(145deg,#11091a,#21102d)]" />,
    },
  ];

  return (
    <>
      <Nav
        logo={<Mark>Kindred/Works</Mark>}
        links={[
          { label: "Work", href: "#work" },
          { label: "Process", href: "#process" },
          { label: "Studio", href: "#studio" },
        ]}
        cta={{ label: "Start a project", href: "#contact" }}
      />
      <main>
        <Hero
          shader="oil-slick"
          brand={brand}
          badge={{ label: "Independent studio · Riyadh + remote" }}
          headline="Brand systems for products moving faster than their story."
          subhead="We help ambitious product teams sharpen the idea, build the identity, and ship a launch experience that feels inevitable."
          primaryAction={{ label: "See selected work", href: "#work" }}
          secondaryAction={{ label: "Start a project", href: "#contact" }}
          note="Strategy · Identity · Digital"
        />
        <Gallery
          id="work"
          eyebrow="Selected work"
          title="A few launches we are still proud of"
          description="A portfolio page template with outcomes next to the craft."
          items={galleryItems}
          action={{ label: "View every project", href: "#" }}
        />
        <Stats
          stats={[
            { value: 41, label: "Products launched" },
            { value: 12, label: "Countries represented" },
            { value: 68, suffix: "%", label: "Client referrals" },
            { value: 9, label: "People, deliberately" },
          ]}
        />
        <FeatureRows
          id="process"
          eyebrow="How we work"
          title="Senior thinking from first question to final commit"
          rows={[
            {
              eyebrow: "Frame",
              title: "Get to the sharpest version of the story.",
              description: "We interview the team, map the category, and write the strategic spine before drawing a mark.",
              bullets: ["Founder workshop", "Category map", "Messaging system"],
              visual: <Visual className="bg-[radial-gradient(circle_at_25%_30%,#f97316,transparent_38%),#17100c]" />,
              visualUrl: "kindred.works/strategy",
            },
            {
              eyebrow: "Make",
              title: "Build the system where customers will meet it.",
              description: "Identity and interface evolve together, so the final brand works in a product—not only in a presentation.",
              bullets: ["Visual identity", "Product direction", "Launch implementation"],
              visual: <Visual className="bg-[radial-gradient(circle_at_72%_28%,#facc15,transparent_35%),#17100c]" />,
              visualUrl: "kindred.works/system",
            },
          ]}
        />
        <CustomerStory
          id="studio"
          quote="They found the simple story we had been circling for two years, then made every touchpoint prove it."
          name="Priya Raman"
          role="Founder, Lumen"
          company="LUMEN"
          metrics={[
            { value: "6 wk", label: "Strategy through launch" },
            { value: "2.7×", label: "Qualified inbound" },
            { value: "14", label: "Reusable page patterns" },
            { value: "1", label: "Integrated senior team" },
          ]}
        />
        <Contact
          id="contact"
          eyebrow="Next opening · September"
          title="Tell us what needs to change"
          description="A useful first note includes the product, the pressure, and what a good outcome looks like."
          topics={["Brand strategy", "Identity system", "Launch website", "Product direction"]}
          methods={[
            { label: "Email", value: "hello@kindred.works", href: "mailto:hello@kindred.works" },
            { label: "Typical engagement", value: "6–12 weeks" },
            { label: "Based in", value: "Riyadh + remote" },
          ]}
          buttonLabel="Share the brief"
        />
        <Newsletter
          variant="centered"
          title="Studio notes, occasionally."
          description="New work, practical process notes, and the rare opinion worth sending."
          note="About one email a month."
        />
      </main>
      <Footer
        logo={<Mark>Kindred/Works</Mark>}
        tagline="An independent brand and digital studio for ambitious product teams."
        columns={footerColumns}
      />
    </>
  );
}

export const TEMPLATES: Record<string, () => React.ReactNode> = {
  saas: SaasPage,
  ai: AiPage,
  developer: DeveloperPage,
  agency: AgencyPage,
};

const templateCards = [
  {
    key: "saas",
    title: "SaaS product",
    description: "Conversion-oriented product page with audience tabs, proof, pricing, FAQ, and demo form.",
    palette: "from-indigo-600 via-violet-600 to-cyan-400",
    sections: "10 sections",
  },
  {
    key: "ai",
    title: "AI platform",
    description: "Trust-forward AI story with product tour, use cases, security, newsletter, and technical CTA.",
    palette: "from-teal-700 via-emerald-500 to-fuchsia-300",
    sections: "8 sections",
  },
  {
    key: "developer",
    title: "Developer tool",
    description: "Technical landing page with install command, product tabs, changelog, pricing, and docs CTA.",
    palette: "from-blue-700 via-sky-500 to-lime-300",
    sections: "9 sections",
  },
  {
    key: "agency",
    title: "Creative agency",
    description: "Editorial portfolio with selected work, outcomes, process, customer story, and project inquiry.",
    palette: "from-orange-800 via-orange-500 to-yellow-300",
    sections: "8 sections",
  },
];

export function TemplateCatalog() {
  return (
    <main>
      <section className="border-b border-ink-700 bg-ink-950 py-20 sm:py-28">
        <Container>
          <StatusBadge tone="info">4 complete pages</StatusBadge>
          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-ink-0 sm:text-6xl">
            Start with a page, then make it yours.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-300">
            Full landing-page starters composed from the same reusable sections,
            elements, shaders, and moving gradients in the collection.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="../marketing/sections.html">Browse sections</Button>
            <Button href="../../" variant="secondary">Open shader studio</Button>
          </div>
        </Container>
      </section>
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {templateCards.map((template) => (
              <a
                key={template.key}
                href={`?template=${template.key}`}
                className="group overflow-hidden rounded-3xl border border-ink-700 bg-ink-850 transition-transform hover:-translate-y-1 hover:border-ink-500"
              >
                <div className={`relative aspect-[16/9] bg-gradient-to-br ${template.palette}`}>
                  <div className="absolute inset-x-8 bottom-0 top-8 rounded-t-xl border border-b-0 border-white/20 bg-ink-950/75 p-5 shadow-2xl backdrop-blur">
                    <div className="h-2 w-20 rounded-full bg-white/25" />
                    <div className="mt-12 h-5 w-2/3 rounded-full bg-white/80" />
                    <div className="mt-3 h-2 w-1/2 rounded-full bg-white/25" />
                    <div className="mt-8 grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-lg bg-white/10" />
                      <div className="h-16 rounded-lg bg-white/10" />
                      <div className="h-16 rounded-lg bg-white/10" />
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-ink-0">
                      {template.title}
                    </h2>
                    <span className="text-xs text-ink-500">{template.sections}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-400">
                    {template.description}
                  </p>
                  <span className="mt-5 inline-flex text-sm font-semibold text-brand-200">
                    Open template →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
