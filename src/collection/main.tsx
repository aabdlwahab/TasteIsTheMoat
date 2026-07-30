import { createRoot } from "react-dom/client";
import "../ui/theme.css";
import {
  AnnouncementBar,
  CTA,
  Features,
  Footer,
  Gallery,
  Hero,
  Nav,
  Stats,
} from "../sections/index";
import {
  BrowserFrame,
  Button,
  Container,
  CopyField,
  GradientText,
  StatusBadge,
} from "../ui/index";
import type { BrandPalette } from "../core/theme";

const brand: BrandPalette = {
  primary: "#4f46e5",
  secondary: "#a855f7",
  accent: "#22d3ee",
  background: "#07080c",
};

const collection = [
  {
    title: "Animated backgrounds",
    category: "69 shaders",
    result: "Open studio",
    href: "/studio.html",
    description:
      "WebGL shaders and moving CSS gradients with live controls, cursor interactions, and export.",
    visual: (
      <div className="size-full bg-[radial-gradient(circle_at_24%_28%,#4f46e5,transparent_36%),radial-gradient(circle_at_76%_68%,#22d3ee,transparent_38%),linear-gradient(145deg,#0a0c14,#1b1028)]" />
    ),
  },
  {
    title: "Marketing elements",
    category: "25 elements",
    result: "Browse elements",
    href: "/examples/marketing/sections.html?s=elements",
    description:
      "Buttons, proof, status, copy controls, cards, shader text, border beams, marquees, and more.",
    visual: (
      <div className="grid size-full grid-cols-2 gap-3 bg-ink-900 p-8">
        <div className="rounded-xl border border-white/10 bg-white/5" />
        <div className="rounded-xl bg-gradient-to-br from-brand-500 to-accent-400" />
        <div className="col-span-2 rounded-full border border-white/10 bg-white/8" />
      </div>
    ),
  },
  {
    title: "Page sections",
    category: "26 sections",
    result: "Open catalog",
    href: "/examples/marketing/sections.html",
    description:
      "Heroes, features, pricing, use cases, trust, customer stories, contact, changelog, and conversion blocks.",
    visual: (
      <div className="size-full bg-ink-900 p-8">
        <div className="mx-auto h-4 w-2/3 rounded-full bg-white/80" />
        <div className="mx-auto mt-3 h-2 w-1/2 rounded-full bg-white/20" />
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="h-20 rounded-xl border border-white/10 bg-white/5" />
          <div className="h-20 rounded-xl border border-brand-300/30 bg-brand-400/10" />
          <div className="h-20 rounded-xl border border-white/10 bg-white/5" />
        </div>
      </div>
    ),
  },
  {
    title: "Complete webpages",
    category: "4 templates",
    result: "View templates",
    href: "/examples/templates/",
    description:
      "Production-shaped starters for SaaS, AI, developer-tool, and agency landing pages.",
    visual: (
      <div className="relative size-full bg-[linear-gradient(135deg,#11131d,#24133a)] p-8">
        <div className="h-full rounded-t-xl border border-b-0 border-white/15 bg-ink-950/80 p-5">
          <div className="h-2 w-16 rounded-full bg-white/30" />
          <div className="mt-9 h-5 w-3/4 rounded-full bg-white/85" />
          <div className="mt-3 h-2 w-1/2 rounded-full bg-white/20" />
          <div className="mt-8 h-16 rounded-xl bg-gradient-to-r from-brand-600/70 to-accent-500/50" />
        </div>
      </div>
    ),
  },
];

function CollectionHome() {
  return (
    <>
      <AnnouncementBar dismissible={false} href="/examples/templates/">
        <StatusBadge tone="info">New</StatusBadge>
        Four complete landing-page templates are now in the collection
        <span aria-hidden="true">→</span>
      </AnnouncementBar>
      <Nav
        logo={
          <>
            <span className="size-7 rounded-lg bg-[conic-gradient(from_210deg,var(--color-brand-500),var(--color-brand-300),var(--color-accent-400),var(--color-brand-500))]" />
            shaderbg
          </>
        }
        links={[
          { label: "Collection", href: "#collection" },
          { label: "Sections", href: "/examples/marketing/sections.html" },
          { label: "Templates", href: "/examples/templates/" },
        ]}
        secondaryCta={{ label: "Open studio", href: "/studio.html" }}
        cta={{ label: "View templates", href: "/examples/templates/" }}
      />
      <main>
        <Hero
          shader="holo-foil"
          brand={brand}
          badge={{ label: "69 backgrounds · 26 sections · 4 webpages" }}
          headline={
            <>
              The building blocks for landing pages{" "}
              <GradientText>people remember.</GradientText>
            </>
          }
          subhead="Browse animated backgrounds, reusable marketing elements, complete React sections, and opinionated page starters—all in one collection."
          primaryAction={{ label: "Browse the collection", href: "#collection" }}
          secondaryAction={{ label: "Open shader studio", href: "/studio.html" }}
          note="React + Tailwind · Copy-paste friendly · Reduced-motion ready"
          visual={
            <BrowserFrame url="shaderbg.dev/collection">
              <div className="aspect-[16/10] bg-[radial-gradient(circle_at_22%_28%,#4f46e5,transparent_35%),radial-gradient(circle_at_75%_68%,#a855f7,transparent_38%),#0b0c13] p-6">
                <div className="grid h-full grid-cols-2 gap-3">
                  {["Shaders", "Elements", "Sections", "Pages"].map(
                    (label, index) => (
                      <div
                        key={label}
                        className="flex items-end rounded-xl border border-white/12 bg-black/20 p-4 text-sm font-semibold text-white/85 backdrop-blur"
                      >
                        <span className="mr-2 text-white/35">0{index + 1}</span>
                        {label}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </BrowserFrame>
          }
        />
        <Stats
          stats={[
            { value: 69, label: "Animated backgrounds" },
            { value: 25, label: "Reusable elements" },
            { value: 26, label: "Marketing sections" },
            { value: 4, label: "Complete webpages" },
          ]}
        />
        <Gallery
          id="collection"
          eyebrow="The collection"
          title="Start at any scale"
          description="Take one small element, assemble a section, or begin with a complete conversion-focused page."
          items={collection}
        />
        <Features
          eyebrow="What was added"
          title="The missing pieces between a hero and a launch"
          description="Patterns selected from current landing-page libraries, rebuilt to fit the existing shaderbg system."
          features={[
            { title: "Audience use cases", description: "Tabbed stories for founders, product teams, developers, and buyers." },
            { title: "Product tour rows", description: "Alternating copy and visuals for products that need more explanation." },
            { title: "Customer stories", description: "Outcome-led proof with quotes, teams, ratings, and compact metrics." },
            { title: "Trust and security", description: "Compliance, uptime, controls, and enterprise readiness in one block." },
            { title: "Lead capture", description: "Dedicated newsletter, waitlist, contact, and book-a-demo patterns." },
            { title: "Portfolio and updates", description: "Case-study galleries and changelogs for launches that keep moving." },
          ]}
        />
        <section className="border-y border-ink-700 bg-ink-900/50 py-20">
          <Container>
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
                  Developer friendly
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-0">
                  Copy the piece. Keep the code.
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed text-ink-300">
                  Components are plain TypeScript and Tailwind, with accessible
                  states and shader fallbacks built into the public APIs.
                </p>
                <Button
                  href="/examples/marketing/"
                  variant="secondary"
                  className="mt-7"
                >
                  View the assembled demo
                </Button>
              </div>
              <CopyField value="npm install shaderbg" label="Install the collection" />
            </div>
          </Container>
        </section>
        <CTA
          shader="liquid-ripple"
          brand={brand}
          title="Pick a page. Change the story. Ship."
          description="The complete starters are deliberately opinionated—and every section is still yours to replace."
          primaryAction={{ label: "Browse page templates", href: "/examples/templates/" }}
          secondaryAction={{ label: "Browse sections", href: "/examples/marketing/sections.html" }}
        />
      </main>
      <Footer
        tagline="Animated backgrounds, marketing elements, React sections, and complete landing pages."
        columns={[
          {
            heading: "Collection",
            links: [
              { label: "Shaders", href: "/studio.html" },
              { label: "Elements", href: "/examples/marketing/sections.html?s=elements" },
              { label: "Sections", href: "/examples/marketing/sections.html" },
            ],
          },
          {
            heading: "Pages",
            links: [
              { label: "SaaS", href: "/examples/templates/?template=saas" },
              { label: "AI", href: "/examples/templates/?template=ai" },
              { label: "Developer tool", href: "/examples/templates/?template=developer" },
            ],
          },
          {
            heading: "Explore",
            links: [
              { label: "Marketing demo", href: "/examples/marketing/" },
              { label: "Contact sheet", href: "/examples/contact-sheet.html" },
              { label: "Agency page", href: "/examples/templates/?template=agency" },
            ],
          },
        ]}
      />
    </>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<CollectionHome />);
