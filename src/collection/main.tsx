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
  KineticTypeRibbon,
  StatusBadge,
} from "../ui/index";
import type { BrandPalette } from "../core/theme";

const brand: BrandPalette = {
  primary: "#f97316",
  secondary: "#f43f5e",
  accent: "#bef264",
  background: "#080706",
};

function BrandLockup() {
  return (
    <>
      <span className="grid size-7 place-items-center rounded-full border border-brand-300/50 bg-brand-500/15 font-serif text-[10px] font-bold tracking-tight text-brand-200">
        TM
      </span>
      <span>Taste is the Moat</span>
    </>
  );
}

const collection = [
  {
    title: "Animated backgrounds",
    category: "69 shaders",
    result: "Enter the studio",
    href: "/studio.html",
    description:
      "Living WebGL surfaces and moving gradients—tuned to give a first viewport atmosphere, not decoration.",
    visual: (
      <div className="size-full bg-[radial-gradient(circle_at_20%_24%,#f97316,transparent_34%),radial-gradient(circle_at_78%_72%,#bef264,transparent_34%),linear-gradient(145deg,#0b0806,#321017)]" />
    ),
  },
  {
    title: "Tactile elements",
    category: "51 components",
    result: "Touch the details",
    href: "/examples/marketing/sections.html?s=elements",
    description:
      "Magnetic buttons, morphing cards, kinetic type, image trails, dither reveals, lenses, and stranger things.",
    visual: (
      <div className="relative size-full overflow-hidden bg-[#100e0c] p-8">
        <div className="absolute -right-8 -top-12 size-40 rounded-full border-[22px] border-brand-500/60" />
        <div className="grid size-full grid-cols-2 gap-3">
          <div className="rounded-full border border-white/15 bg-white/5" />
          <div className="rounded-[45%_55%_34%_66%] bg-gradient-to-br from-brand-500 to-rose-500" />
          <div className="col-span-2 rounded-xl border border-accent-400/30 bg-accent-400/10" />
        </div>
      </div>
    ),
  },
  {
    title: "Marketing sections",
    category: "26 systems",
    result: "Build the sequence",
    href: "/examples/marketing/sections.html",
    description:
      "Heroes, proof, pricing, stories, launches, and conversion moments designed to work as a deliberate whole.",
    visual: (
      <div className="size-full bg-[#0d0b09] p-8">
        <div className="font-serif text-4xl italic tracking-tight text-white">Point of view.</div>
        <div className="mt-5 h-px bg-gradient-to-r from-brand-400 via-accent-400 to-transparent" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="h-20 rounded-xl border border-white/10 bg-white/5" />
          <div className="h-20 rounded-xl bg-brand-500/80" />
          <div className="h-20 rounded-xl border border-white/10 bg-white/5" />
        </div>
      </div>
    ),
  },
  {
    title: "Complete webpages",
    category: "16 directions",
    result: "Choose a world",
    href: "/examples/templates/",
    description:
      "Opinionated starters for products, culture, portfolios, music, data, launches, luxury, and ideas without a category.",
    visual: (
      <div className="relative size-full overflow-hidden bg-[#f3efe6] p-7 text-[#17130f]">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
          <span>Issue 16</span>
          <span>Selected pages</span>
        </div>
        <div className="mt-8 max-w-[12rem] font-serif text-4xl leading-[0.9] tracking-[-0.06em]">
          Made to be remembered.
        </div>
        <div className="absolute bottom-0 right-0 size-32 rounded-tl-full bg-brand-500" />
      </div>
    ),
  },
];

const principles = [
  {
    number: "01",
    title: "Edit before you add",
    description:
      "A smaller set of excellent choices beats a warehouse of plausible ones. Every piece earns its place.",
  },
  {
    number: "02",
    title: "Motion needs a reason",
    description:
      "Movement should reveal hierarchy, reward curiosity, or create atmosphere. Otherwise it is only noise.",
  },
  {
    number: "03",
    title: "Make defaults opinionated",
    description:
      "The fastest route to memorable work is a strong starting position—not another blank, neutral canvas.",
  },
];

function CollectionHome() {
  return (
    <>
      <AnnouncementBar dismissible={false} href="#collection">
        <StatusBadge tone="info">Curated</StatusBadge>
        162 ways out of sameness
        <span aria-hidden="true">→</span>
      </AnnouncementBar>
      <Nav
        logo={<BrandLockup />}
        links={[
          { label: "The collection", href: "#collection" },
          { label: "Principles", href: "#principles" },
          { label: "Complete pages", href: "/examples/templates/" },
        ]}
        secondaryCta={{ label: "Shader studio", href: "/studio.html" }}
        cta={{ label: "Browse everything", href: "#collection" }}
      />
      <main>
        <Hero
          shader="holo-foil"
          brand={brand}
          scrim="strong"
          badge={{ label: "The anti-generic web collection" }}
          headline={
            <>
              Your competitors can copy your features.{" "}
              <GradientText>They can’t copy your eye.</GradientText>
            </>
          }
          subhead="Taste is the Moat is a curated collection of animated backgrounds, tactile components, complete sections, and authored landing pages for teams that refuse to look interchangeable."
          primaryAction={{ label: "Explore the collection", href: "#collection" }}
          secondaryAction={{ label: "Read the thesis", href: "#principles" }}
          note="69 backgrounds · 51 elements · 26 sections · 16 complete pages"
          layout="split"
          visual={
            <BrowserFrame url="tasteisthemoat.dev/collection">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#0b0908] p-5 sm:p-7">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-rose-500 to-accent-400" />
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.24em] text-white/45">
                  <span>The taste test</span>
                  <span>Vol. 01</span>
                </div>
                <div className="mt-8 font-serif text-[clamp(2.8rem,8vw,5.8rem)] leading-[0.72] tracking-[-0.08em] text-white">
                  TASTE
                </div>
                <div className="ml-[26%] mt-4 flex items-center gap-4">
                  <span className="text-4xl text-brand-400">&gt;</span>
                  <span className="font-serif text-[clamp(2.5rem,7vw,5rem)] italic leading-none tracking-[-0.07em] text-accent-400">
                    trends
                  </span>
                </div>
                <div className="absolute bottom-6 left-7 right-7 flex items-end justify-between border-t border-white/15 pt-4 text-[10px] uppercase tracking-[0.18em] text-white/50">
                  <span>Curated<br />not generated</span>
                  <span className="grid size-12 place-items-center rounded-full bg-brand-500 text-base font-black text-black">TM</span>
                </div>
              </div>
            </BrowserFrame>
          }
        />

        <KineticTypeRibbon
          text="Distinctive by default"
          repeat={6}
          className="border-brand-400/20 bg-brand-500 text-black [&_.text-brand-400]:text-accent-400"
        />

        <Stats
          stats={[
            { value: 69, label: "Atmospheric backgrounds" },
            { value: 51, label: "Tactile elements" },
            { value: 26, label: "Narrative sections" },
            { value: 16, label: "Complete worlds" },
          ]}
        />

        <Gallery
          id="collection"
          eyebrow="The collection"
          title="Four doors into better work"
          description="Start with a moment, assemble a story, or borrow an entire visual world. Every path stays editable."
          items={collection}
        />

        <section id="principles" className="border-y border-ink-700 bg-[#f3efe6] py-24 text-[#17130f] sm:py-32">
          <Container>
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8c3b18]">
                  The thesis
                </p>
                <h2 className="mt-5 max-w-md font-serif text-5xl leading-[0.92] tracking-[-0.055em] sm:text-6xl">
                  Design is abundant. Discernment is scarce.
                </h2>
              </div>
              <div>
                <p className="max-w-2xl text-xl leading-relaxed text-[#4c433a] sm:text-2xl">
                  Tools have made competent design cheap. That changes the advantage: the moat is no longer production—it is knowing what to make, what to remove, and when to stop.
                </p>
                <div className="mt-12 divide-y divide-black/15 border-y border-black/15">
                  {principles.map((principle) => (
                    <article key={principle.number} className="grid gap-4 py-7 sm:grid-cols-[4rem_0.8fr_1.2fr] sm:items-start">
                      <span className="font-mono text-xs text-[#8c3b18]">{principle.number}</span>
                      <h3 className="font-serif text-xl font-semibold">{principle.title}</h3>
                      <p className="leading-relaxed text-[#64584d]">{principle.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <Features
          eyebrow="The selection"
          title="The pieces that make a page feel authored"
          description="Experimental interactions, disciplined systems, and complete page directions—selected for memorability and rebuilt for real use."
          features={[
            { title: "Spatial canvases", description: "Infinite galleries, image trails, draggable piles, and perspective marquees." },
            { title: "Kinetic typography", description: "Velocity ribbons, encrypted copy, split-flap words, and elastic headlines." },
            { title: "Physical cards", description: "Morphing dialogs, directional reveals, lenses, and sticky scroll stacks." },
            { title: "Reactive media", description: "Dither reveals, scroll-scrubbed video, audio energy, and opt-in camera mosaics." },
            { title: "Living controls", description: "Morphing notches, gooey menus, magnetic CTAs, and vanishing prompt inputs." },
            { title: "Opinionated pages", description: "Complete directions for culture, product, data, art, music, launches, and luxury." },
          ]}
        />

        <section className="border-y border-ink-700 bg-ink-900/50 py-20">
          <Container>
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
                  Keep the source
                </p>
                <h2 className="mt-3 font-serif text-4xl tracking-tight text-ink-0">
                  Take the code, not the sameness.
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed text-ink-300">
                  Everything is plain TypeScript and Tailwind with accessible states, reduced-motion behavior, and graceful shader fallbacks already considered.
                </p>
                <Button href="/examples/marketing/" variant="secondary" className="mt-7">
                  See an assembled page
                </Button>
              </div>
              <CopyField value="npm install taste-is-the-moat" label="Install the collection" />
            </div>
          </Container>
        </section>

        <CTA
          shader="liquid-ripple"
          brand={brand}
          title="Make the first scroll impossible to forget."
          description="Choose a strong starting point. Break what needs breaking. Ship something with a point of view."
          primaryAction={{ label: "Browse complete pages", href: "/examples/templates/" }}
          secondaryAction={{ label: "Open the shader studio", href: "/studio.html" }}
        />
      </main>
      <Footer
        logo={<BrandLockup />}
        tagline="A curated collection for the part of the web that still wants to be remembered."
        columns={[
          {
            heading: "Collection",
            links: [
              { label: "Backgrounds", href: "/studio.html" },
              { label: "Elements", href: "/examples/marketing/sections.html?s=elements" },
              { label: "Sections", href: "/examples/marketing/sections.html" },
            ],
          },
          {
            heading: "Complete pages",
            links: [
              { label: "Infinite portfolio", href: "/examples/templates/?template=infinite-portfolio" },
              { label: "Kinetic editorial", href: "/examples/templates/?template=kinetic-editorial" },
              { label: "Generative studio", href: "/examples/templates/?template=generative-studio" },
            ],
          },
          {
            heading: "Explore",
            links: [
              { label: "Marketing demo", href: "/examples/marketing/" },
              { label: "Contact sheet", href: "/examples/contact-sheet.html" },
              { label: "Spatial agency", href: "/examples/templates/?template=spatial-agency" },
            ],
          },
        ]}
      />
    </>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<CollectionHome />);
