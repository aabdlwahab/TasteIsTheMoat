import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../ui/theme.css";
import {
  Features,
  Footer,
  Hero,
  Nav,
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
import { shaderList } from "../shaders/index";

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

interface CollectionWork {
  title: string;
  kind: "Shader" | "Element" | "WebGL type" | "GPU study" | "Section" | "Page";
  href: string;
  description: string;
  shader?: string;
}

const selectedShaderIds = new Set([
  "mesh-gradient",
  "holo-foil",
  "liquid-ripple",
  "cursor-flow",
  "metaballs",
  "starfield",
  "topographic",
  "prism",
]);

const shaderWorks: CollectionWork[] = shaderList
  .filter((shader) => selectedShaderIds.has(shader.id))
  .map((shader) => ({
    title: shader.name,
    kind: "Shader",
    href: `/studio.html?shader=${shader.id}`,
    description: shader.description,
    shader: shader.id,
  }));

const elementWorks: CollectionWork[] = [
  { title: "Magnetic button", kind: "Element", href: "/examples/marketing/sections.html?s=experimental-controls", description: "A CTA that leans toward the pointer, then snaps cleanly home." },
  { title: "Morphing dialog", kind: "Element", href: "/examples/marketing/sections.html?s=experimental-cards", description: "A compact card that expands into a focused reading surface." },
  { title: "Kinetic type ribbon", kind: "Element", href: "/examples/marketing/sections.html?s=experimental-type", description: "Oversized type that responds to scroll direction and velocity." },
  { title: "Infinite canvas", kind: "Element", href: "/examples/marketing/sections.html?s=experimental-spatial", description: "A draggable world for portfolios and visual archives." },
  { title: "Pixel dither reveal", kind: "Element", href: "/examples/marketing/sections.html?s=experimental-media", description: "A dithered cover that clears to reveal the media beneath." },
  { title: "Shader card", kind: "Element", href: "/examples/marketing/sections.html?s=shader-cards", description: "A shader-backed card that wakes only when it is touched." },
  { title: "Border beam", kind: "Element", href: "/examples/marketing/sections.html?s=border-beam", description: "A precise light circuit travelling around a quiet frame." },
  { title: "Image trail cursor", kind: "Element", href: "/examples/marketing/sections.html?s=experimental-spatial", description: "Pointer movement leaves a fading trail of visual cards." },
];

const textWorks: CollectionWork[] = [
  { title: "Particle text", kind: "WebGL type", href: "/examples/marketing/sections.html?s=particle-text", description: "A word becomes a responsive field of thousands of particles." },
  { title: "Glyph field", kind: "WebGL type", href: "/examples/marketing/sections.html?s=surface-glyphs", description: "A typographic image rebuilt as a shifting character grid." },
  { title: "Lens text", kind: "WebGL type", href: "/examples/marketing/sections.html?s=surface-lens", description: "A headline refracted through a pointer-driven optical lens." },
  { title: "Shatter text", kind: "WebGL type", href: "/examples/marketing/sections.html?s=surface-shatter", description: "Letterforms fractured into dimensional, reactive shards." },
  { title: "Fluid text", kind: "WebGL type", href: "/examples/marketing/sections.html?s=surface-fluid", description: "Type that dissolves into dye and continuously returns." },
];

const gpuWorks: CollectionWork[] = [
  { title: "Fragment", kind: "GPU study", href: "/gpu-lab/01-fragment.html", description: "Raymarching, domain warping, caustics, and feedback in one pass." },
  { title: "GPGPU", kind: "GPU study", href: "/gpu-lab/02-gpgpu.html", description: "Physarum, reaction–diffusion, boids, sand, and lenia in textures." },
  { title: "Geometry", kind: "GPU study", href: "/gpu-lab/03-geometry.html", description: "Vertex-shader worlds built from an index and a single draw call." },
  { title: "Post", kind: "GPU study", href: "/gpu-lab/04-post.html", description: "Bloom, depth, grain, dither, optical flow, and a live camera stack." },
  { title: "Holography", kind: "GPU study", href: "/gpu-lab/05-holographic.html", description: "Spectral colour, interference, thin films, and diffraction." },
];

const sectionWorks: CollectionWork[] = [
  { title: "Split hero", kind: "Section", href: "/examples/marketing/sections.html?s=hero-split", description: "A product opening balanced between argument and live interface." },
  { title: "Bento features", kind: "Section", href: "/examples/marketing/sections.html?s=features-bento", description: "A varied feature system with hierarchy built into the grid." },
  { title: "Proof marquee", kind: "Section", href: "/examples/marketing/sections.html?s=testimonials-marquee", description: "Customer proof that moves as a continuous editorial rail." },
  { title: "Timeline", kind: "Section", href: "/examples/marketing/sections.html?s=steps-timeline", description: "A process told as a deliberate sequence instead of three boxes." },
  { title: "Customer story", kind: "Section", href: "/examples/marketing/sections.html?s=customer-story", description: "A single outcome given the room and pacing of a case study." },
  { title: "Use cases", kind: "Section", href: "/examples/marketing/sections.html?s=use-cases", description: "Distinct audience stories composed inside one shared system." },
  { title: "Waitlist", kind: "Section", href: "/examples/marketing/sections.html?s=waitlist", description: "A focused conversion moment with atmosphere and restraint." },
  { title: "Gallery", kind: "Section", href: "/examples/marketing/sections.html?s=gallery", description: "A visual sequence that lets the work lead the narrative." },
];

const pageWorks: CollectionWork[] = [
  { title: "SaaS product", kind: "Page", href: "/examples/templates/?template=saas", description: "A complete conversion story with proof, pricing, FAQ, and demo." },
  { title: "Creative agency", kind: "Page", href: "/examples/templates/?template=agency", description: "An editorial portfolio shaped around selected work and outcomes." },
  { title: "Infinite portfolio", kind: "Page", href: "/examples/templates/?template=infinite-portfolio", description: "Projects placed on a draggable canvas instead of a vertical feed." },
  { title: "Kinetic editorial", kind: "Page", href: "/examples/templates/?template=kinetic-editorial", description: "A manifesto performed with live headlines and scroll velocity." },
  { title: "Generative studio", kind: "Page", href: "/examples/templates/?template=generative-studio", description: "A full-screen art system with living previews and editable seeds." },
  { title: "Luxury drop", kind: "Page", href: "/examples/templates/?template=luxury-drop", description: "One object examined slowly, precisely, and without visual clutter." },
  { title: "Festival", kind: "Page", href: "/examples/templates/?template=festival", description: "A cultural page built from posters, ribbons, stages, and motion." },
  { title: "Music release", kind: "Page", href: "/examples/templates/?template=music-release", description: "Audio-reactive colour and credits composed as a living liner note." },
];

function interleaveWorks(groups: CollectionWork[][]): CollectionWork[] {
  const longest = Math.max(...groups.map((group) => group.length));
  return Array.from({ length: longest }, (_, index) => groups.map((group) => group[index]))
    .flat()
    .filter((work): work is CollectionWork => Boolean(work));
}

const collection = interleaveWorks([
  shaderWorks,
  elementWorks,
  pageWorks,
  textWorks,
  sectionWorks,
  gpuWorks,
]);

function CollectionMedley() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const selected = collection[selectedIndex];
  const searchTerm = search.trim().toLowerCase();
  const visibleWorks = collection
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      !searchTerm
      || `${item.title} ${item.kind} ${item.description}`.toLowerCase().includes(searchTerm),
    );

  function selectWork(index: number) {
    setSelectedIndex(index);
    window.requestAnimationFrame(() => {
      const preview = previewRef.current;
      if (!preview) return;
      const bounds = preview.getBoundingClientRect();
      const isVisible = bounds.top >= 72 && bounds.bottom <= window.innerHeight;
      if (!isVisible) {
        preview.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  }

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
          <p>The collection / one continuous gallery</p>
          <h2>One preview.<br /><em>One mixed gallery.</em></h2>
          <span>Everything lives in the same browser: shaders, interactions, type, GPU experiments, sections, and complete pages. Choose any work below to bring it into the live preview.</span>
        </div>

        <div ref={previewRef} className="collection-preview-stage" data-kind={selected.kind}>
          <div className="collection-preview-meta">
            <div>
              <span>{String(selectedIndex + 1).padStart(2, "0")} / {selected.kind}</span>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
            </div>
            <a href={sitePath(selected.href)} target="_blank" rel="noreferrer">
              Full canvas <i>↗</i>
            </a>
          </div>
          <div className="collection-preview-window">
            {selected.shader ? (
              <ShaderSection
                key={selected.shader}
                as="div"
                shader={selected.shader}
                brand={brand}
                scrim="none"
                maxDpr={1.5}
                className="h-full"
                contentClassName="h-full"
              />
            ) : (
              <iframe
                key={selected.href}
                src={sitePath(selected.href)}
                title={`${selected.title} — interactive preview`}
                allow="autoplay; camera; microphone"
                allowFullScreen
              />
            )}
            <span className="collection-preview-hint">Interactive preview</span>
          </div>
        </div>

        <div className="collection-gallery-head">
          <p>All work <span>{visibleWorks.length}</span></p>
          <label>
            <span className="sr-only">Search the collection</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search all work…"
            />
          </label>
          <span>Six disciplines, deliberately interleaved</span>
        </div>

        <ul className="collection-gallery">
          {visibleWorks.map(({ item, index }) => (
            <li key={`${item.kind}-${item.title}`} className="collection-gallery-cell">
              <button
                type="button"
                className={`collection-gallery-item${selectedIndex === index ? " is-active" : ""}`}
                data-kind={item.kind}
                aria-pressed={selectedIndex === index}
                onClick={() => selectWork(index)}
              >
                <div className="collection-gallery-thumb" aria-hidden="true">
                  <i></i><i></i><i></i>
                  <b>{item.title.slice(0, 1)}</b>
                  <span>{item.kind}</span>
                </div>
                <div className="collection-gallery-card-copy">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {visibleWorks.length === 0 && (
          <p className="collection-gallery-empty">No work matches “{search}”.</p>
        )}

        <p className="collection-medley-footnote">{collection.length} works · one preview · one gallery</p>
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
          { label: "Keep the source", href: "#source" },
        ]}
        secondaryCta={{ label: "Why taste matters", href: "#principles" }}
        cta={{ label: "Browse everything", href: "#collection" }}
      />
      <main id="top">
        <Hero
          shader="holo-foil"
          brand={brand}
          uniforms={{ u_gain: 2, u_gloss: 0.52, u_saturation: 0.58, u_speed: 0.38, u_pointer: 1.75 }}
          scrim="none"
          copyClassName="w-fit max-w-[39rem] rounded-3xl border border-white/15 bg-[#07080c]/75 p-6 shadow-[0_24px_80px_rgba(0,0,0,.34)] backdrop-blur-xl sm:p-8"
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

        <section id="source" className="border-y border-ink-700 bg-ink-900/50 py-20">
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
                  <Button href="#collection" variant="secondary">
                    Return to the live collection
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
                  <Button href="#collection">Browse the live work</Button>
                </Magnetic>
                <Button href="#source" variant="secondary">
                  Keep the source
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
            heading: "On this page",
            links: [
              { label: "Live collection", href: "#collection" },
              { label: "The thesis", href: "#principles" },
              { label: "Source", href: "#source" },
            ],
          },
          {
            heading: "The collection",
            links: [
              { label: "Shaders + elements", href: "#collection" },
              { label: "Sections + pages", href: "#collection" },
              { label: "GPU + WebGL type", href: "#collection" },
            ],
          },
          {
            heading: "Navigate",
            links: [
              { label: "Back to top", href: "#top" },
              { label: "Browse everything", href: "#collection" },
              { label: "Why taste matters", href: "#principles" },
            ],
          },
        ]}
      />
    </>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<CollectionHome />);
