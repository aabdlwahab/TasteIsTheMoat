import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import "../ui/theme.css";
import { Footer, Hero, Nav } from "../sections/index";
import {
  BrandMark,
  BrowserFrame,
  Button,
  Container,
  CopyField,
  GradientText,
  KineticTypeRibbon,
  ParticleText,
} from "../ui/index";
import { Magnetic, TextEffect } from "../ui/motion/index";
import type { BrandPalette } from "../core/theme";
import { AppliedHero } from "./appliedHero";
import type { AppliedPiece } from "./appliedHero";
import { Workbench } from "./workbench";
import { Websites } from "./websites";
import { countsByGroup, works } from "./works/index";
import type { ControlValues, Work } from "./types";

const brand: BrandPalette = {
  primary: "#f97316",
  secondary: "#f43f5e",
  accent: "#bef264",
  background: "#080706",
};

const counts = countsByGroup();
const elementCount =
  (counts.Foundation ?? 0)
  + (counts["Shader-native"] ?? 0)
  + (counts.Experimental ?? 0)
  + (counts.Motion ?? 0);

function BrandLockup() {
  return (
    <>
      <BrandMark className="size-7 text-brand-400" />
      <span>Taste is the Moat</span>
    </>
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
  const [applied, setApplied] = useState<AppliedPiece | null>(null);

  const apply = useCallback((work: Work, values: ControlValues) => {
    setApplied((current) => ({ work, values, nonce: (current?.nonce ?? 0) + 1 }));
    // The whole point is seeing it up there, so go and look.
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);

  return (
    <>
      <Nav
        logo={<BrandLockup />}
        // The hero shader is deliberately loud, and a transparent bar over it
        // leaves the links unreadable until you scroll. The solid bar costs
        // the page nothing and keeps navigation legible from the first frame.
        transparentUntilScroll={false}
        links={[
          { label: "The workbench", href: "#collection" },
          { label: "Complete websites", href: "#websites" },
          { label: "Principles", href: "#principles" },
        ]}
        secondaryCta={{ label: "Shader studio", href: "/studio.html" }}
        cta={{ label: "Open the workbench", href: "#collection" }}
      />
      <main id="top">
        {applied ? (
          <AppliedHero applied={applied} onClear={() => setApplied(null)} />
        ) : (
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
          subhead="Every shader, element, section, and text surface in one live workbench — mounted for real, with every control it accepts sitting right beside it."
          primaryAction={{ label: "Open the workbench", href: "#collection" }}
          secondaryAction={{ label: "See complete websites", href: "#websites" }}
          note={`${works.length} live pieces · ${counts.Shaders ?? 0} shaders · ${elementCount} elements · ${counts.Sections ?? 0} sections · 16 complete pages`}
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
                  className="mt-2 h-[44%]"
                  textClassName="font-serif text-[clamp(2.6rem,5.5vw,4.6rem)] font-normal leading-[0.8] tracking-[-0.08em] text-white"
                  fontFamily='"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif'
                  fontWeight={400}
                  fill={0.94}
                  particles={34000}
                  radius={200}
                  force={5600}
                  spring={110}
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
        )}

        <KineticTypeRibbon
          text="Distinctive by default"
          repeat={6}
          className="border-brand-400/20 bg-brand-500 text-black [&_.text-brand-400]:text-accent-400"
        />

        <Workbench onApply={apply} appliedId={applied?.work.id} />

        <Websites />

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

        <section id="source" className="border-b border-ink-700 bg-ink-900/50 py-20">
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
                  Everything is plain TypeScript and Tailwind with accessible states, reduced-motion behavior, and graceful shader fallbacks already considered. The snippet under the workbench is generated from the controls you just moved.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Magnetic actionArea="parent" range={110}>
                    <Button href="#collection">Back to the workbench</Button>
                  </Magnetic>
                  <Button href="/studio.html" variant="secondary">
                    Open the shader studio
                  </Button>
                </div>
              </div>
              <CopyField value="npm install taste-is-the-moat" label="Install the collection" />
            </div>
          </Container>
        </section>
      </main>
      <Footer
        logo={<BrandLockup />}
        tagline="A curated collection for the part of the web that still wants to be remembered."
        columns={[
          {
            heading: "The collection",
            links: [
              { label: "The workbench", href: "#collection" },
              { label: "Complete websites", href: "#websites" },
              { label: "Shader studio", href: "/studio.html" },
            ],
          },
          {
            heading: "Elsewhere",
            links: [
              { label: "Section catalog", href: "/examples/marketing/sections.html" },
              { label: "Page templates", href: "/examples/templates/" },
              { label: "Contact sheet", href: "/examples/contact-sheet.html" },
            ],
          },
          {
            heading: "Navigate",
            links: [
              { label: "Back to top", href: "#top" },
              { label: "The thesis", href: "#principles" },
              { label: "Keep the source", href: "#source" },
            ],
          },
        ]}
      />
    </>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<CollectionHome />);
