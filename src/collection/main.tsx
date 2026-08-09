import { createRoot } from "react-dom/client";
import "../ui/theme.css";
import {
  Features,
  Footer,
  Hero,
  Nav,
  Stats,
} from "../sections/index";
import {
  BrandMark,
  BrowserFrame,
  Button,
  Container,
  CopyField,
  GlyphText,
  GradientText,
  KineticTypeRibbon,
  ParticleText,
  ShaderSection,
} from "../ui/index";
// Magnetic and TextEffect live in the motion subpath, kept out of the main
// barrel so its Accordion/MorphingDialog/ProgressiveBlur do not collide.
import { Magnetic, TextEffect } from "../ui/motion/index";
import type { BrandPalette } from "../core/theme";
import { sitePath } from "../core/sitePath";

const brand: BrandPalette = {
  primary: "#f97316",
  secondary: "#f43f5e",
  accent: "#bef264",
  background: "#080706",
};

function BrandLockup() {
  return (
    <>
      <BrandMark className="size-7 text-brand-400" />
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
  },
  {
    title: "Tactile elements",
    category: "84 components",
    result: "Touch the details",
    href: "/examples/marketing/sections.html?s=elements",
    description:
      "Magnetic buttons, morphing cards, kinetic type, image trails, dither reveals, lenses, and stranger things.",
  },
  {
    title: "WebGL animated text",
    category: "5 surfaces",
    result: "Break a headline",
    href: "/examples/marketing/sections.html?s=webgl-text",
    description:
      "A word rasterised and handed to the GPU—as a particle field, a character grid, a lens, a pile of shards, or dye in a fluid.",
  },
  {
    title: "GPU Lab",
    category: "23 techniques",
    result: "Read the source",
    href: "/examples/marketing/sections.html?s=gpu-lab",
    description:
      "Five standalone benches—raymarching and domain warping, physarum and lenia, vertex-shader worlds, a full camera stack, spectral holography.",
  },
  {
    title: "Marketing sections",
    category: "26 systems",
    result: "Build the sequence",
    href: "/examples/marketing/sections.html",
    description:
      "Heroes, proof, pricing, stories, launches, and conversion moments designed to work as a deliberate whole.",
  },
  {
    title: "Complete webpages",
    category: "16 directions",
    result: "Choose a world",
    href: "/examples/templates/",
    description:
      "Opinionated starters for products, culture, portfolios, music, data, launches, luxury, and ideas without a category.",
  },
];

function CollectionMedley() {
  return (
    <ShaderSection
      id="collection"
      shader="oil-slick"
      brand={brand}
      scrim="strong"
      maxDpr={1}
      className="collection-medley border-y border-white/10 bg-ink-950"
      contentClassName="py-24 sm:py-32"
    >
      <Container className="max-w-[88rem]">
        <div className="collection-medley-heading">
          <p>The collection / mixed media</p>
          <h2>Not six departments.<br /><em>One visual language.</em></h2>
          <span>Shaders, interactions, type, GPU experiments, sections, and complete pages—mixed together the way they appear in real work.</span>
        </div>

        <div className="collection-medley-field">
          <div className="medley-haze" aria-hidden="true"></div>
          <div className="medley-kinetic-word" aria-hidden="true"><span>MAKE</span><i>it move</i></div>
          <div className="medley-tactile" aria-hidden="true"><i></i><i></i><i></i></div>
          <div className="medley-code" aria-hidden="true">
            <span>01 / raymarch.sdf</span><span>02 / physarum.field</span><span>03 / spectral.foil</span><span>04 / vertex.world</span>
          </div>
          <div className="medley-page-stack" aria-hidden="true">
            <i></i><i></i><i><b>Point<br />of view.</b></i>
          </div>
          <div className="medley-pixel-trail" aria-hidden="true">
            {Array.from({ length: 42 }, (_, index) => <i key={index}></i>)}
          </div>
          <div className="medley-ribbon" aria-hidden="true">DISTINCTIVE BY DEFAULT · DISTINCTIVE BY DEFAULT ·</div>
          <div className="medley-orbit" aria-hidden="true"><i></i><i></i></div>

          {collection.map((item, index) => (
            <a
              key={item.title}
              href={sitePath(item.href)}
              className="collection-medley-link"
              data-medley-item={index + 1}
            >
              <span>{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <strong>{item.result} <i>↗</i></strong>
            </a>
          ))}
        </div>

        <p className="collection-medley-footnote">223 pieces · 1 point of view · endless combinations</p>
      </Container>
    </ShaderSection>
  );
}

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
          note="69 backgrounds · 84 elements · 5 text surfaces · 23 GPU techniques · 26 sections · 16 complete pages"
          layout="split"
          visual={
            <BrowserFrame url="tasteisthemoat.dev/collection">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#0b0908] p-5 sm:p-7">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-rose-500 to-accent-400" />
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.24em] text-white/45">
                  <span>The taste test</span>
                  <span>Vol. 01</span>
                </div>
                {/* The word the page is arguing for, made touchable. A stiff
                    return spring keeps it legible as a headline — it should
                    snap back, not linger scattered, because this sits inside a
                    mock browser that has to keep reading as a page. */}
                <ParticleText
                  text="TASTE"
                  align="left"
                  // Sized against the frame, not the viewport. The hero column
                  // stops growing at max-w-6xl, so a vw height keeps climbing
                  // after the frame has stopped — past ~1150px that pushed
                  // "> trends" out through the frame's overflow-hidden. The
                  // aspect-[16/10] parent has a definite height, so a
                  // percentage tracks it at every width.
                  className="mt-2 h-[44%]"
                  textClassName="font-serif text-[clamp(2.6rem,5.5vw,4.6rem)] font-normal leading-[0.8] tracking-[-0.08em] text-white"
                  fontFamily='"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif'
                  fontWeight={400}
                  fill={0.94}
                  particles={34000}
                  radius={200}
                  force={5600}
                  spring={110}
                  // Matches the hero shader behind it; the default of 2 would
                  // put a third megapixel-scale canvas on the first viewport.
                  maxDpr={1.5}
                  colors={{ rest: "#ffffff", mid: "#f97316", hot: "#bef264" }}
                />
                <div className="ml-[26%] mt-4 flex items-center gap-4">
                  <span className="text-4xl text-brand-400">&gt;</span>
                  <span className="font-serif text-[clamp(2.5rem,7vw,5rem)] italic leading-none tracking-[-0.07em] text-accent-400">
                    trends
                  </span>
                </div>
                <div className="absolute bottom-6 left-7 right-7 flex items-end justify-between border-t border-white/15 pt-4 text-[10px] uppercase tracking-[0.18em] text-white/50">
                  <span>Curated<br />not generated</span>
                  <span className="grid size-12 place-items-center rounded-full bg-brand-500 text-black">
                    <BrandMark className="size-7" />
                  </span>
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
            { value: 84, label: "Tactile elements" },
            { value: 5, label: "WebGL text surfaces" },
            { value: 23, label: "GPU Lab techniques" },
            { value: 26, label: "Narrative sections" },
            { value: 16, label: "Complete worlds" },
          ]}
        />

        <CollectionMedley />

        <section id="principles" className="border-y border-ink-700 bg-[#f3efe6] py-24 text-[#17130f] sm:py-32">
          <Container>
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8c3b18]">
                  The thesis
                </p>
                {/* The thesis sentence earns a reveal — it is the one line the
                    whole page is arguing for. Per word, not per character:
                    this is prose to be read, not a logotype. */}
                <TextEffect
                  as="h2"
                  per="word"
                  preset="fade-in-blur"
                  speedReveal={1.4}
                  className="mt-5 max-w-md font-serif text-5xl leading-[0.92] tracking-[-0.055em] sm:text-6xl"
                >
                  Design is abundant. Discernment is scarce.
                </TextEffect>
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
                <Magnetic actionArea="parent" range={110} className="mt-7">
                  <Button href="/examples/marketing/" variant="secondary">
                    See an assembled page
                  </Button>
                </Magnetic>
              </div>
              <CopyField value="npm install taste-is-the-moat" label="Install the collection" />
            </div>
          </Container>
        </section>

        {/* The closing moment. This was a liquid-ripple shader; it is now the
            glyph surface, which says the same thing in the collection's own
            vocabulary — the last word before the footer, dissolving as you
            move through it. The scrim is doing real work here: a matrix rain
            behind body copy is illegible without one. */}
        <section className="relative isolate overflow-hidden border-t border-ink-700 bg-[#06070d]">
          <GlyphText
            text="REMEMBER"
            className="absolute inset-0 h-full"
            charset={0}
            palette={2}
            treatment={2}
            cell={13}
            radius={190}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,7,13,0.82)_0%,rgba(6,7,13,0.94)_100%)]"
          />
          <Container>
            <div className="relative z-10 mx-auto max-w-2xl py-28 text-center sm:py-36">
              <h2 className="text-balance font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-ink-0 sm:text-5xl">
                Make the first scroll impossible to forget.
              </h2>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-300">
                Choose a strong starting point. Break what needs breaking. Ship
                something with a point of view.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Magnetic actionArea="parent" range={120}>
                  <Button href="/examples/templates/">Browse complete pages</Button>
                </Magnetic>
                <Button href="/studio.html" variant="secondary">
                  Open the shader studio
                </Button>
              </div>
            </div>
          </Container>
        </section>
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
              { label: "WebGL text", href: "/examples/marketing/sections.html?s=webgl-text" },
              { label: "GPU Lab", href: "/examples/marketing/sections.html?s=gpu-lab" },
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
