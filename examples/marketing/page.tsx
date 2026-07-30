/**
 * A complete marketing page assembled from the section library.
 *
 * Note the shader budget. Full-bleed shaders appear exactly twice — the hero
 * and the closing CTA — plus one small offscreen canvas driving the headline
 * type. Everything between them is flat, and the feature grid uses the CSS
 * spotlight rather than a shader per card. Spectacle everywhere reads as noise,
 * and every extra shader is another render loop.
 */
import {
  AnnouncementBar,
  CTA,
  Comparison,
  FAQ,
  Features,
  Footer,
  Hero,
  LogoCloud,
  Nav,
  Pricing,
  ProductShowcase,
  Stats,
  Steps,
  Testimonials,
} from "../../src/sections/index";
import {
  BrowserFrame,
  Container,
  Section,
  SectionHeading,
  ShaderText,
  SpotlightCard,
  SpotlightGrid,
} from "../../src/ui/index";
import type { BrandPalette } from "../../src/core/theme";

/** One palette drives both the sections and the shader colours. */
const brand: BrandPalette = {
  primary: "#4f46e5",
  secondary: "#a855f7",
  accent: "#22d3ee",
  background: "#07080c",
};

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS = {
  bolt: "M11 2L4 11h4l-1 7 7-9h-4l1-7z",
  palette: "M10 17a7 7 0 110-14c3.9 0 7 2.7 7 6 0 2-1.6 3-3 3h-1.5a1.5 1.5 0 000 3H10z",
  cursor: "M4 3l12 6-5 1.5L9 16 4 3z",
  gauge: "M10 13a3 3 0 100-6 3 3 0 000 6zM10 3v1M3 10h1M16 10h1M5 5l1 1M15 5l-1 1",
  code: "M7 6l-4 4 4 4M13 6l4 4-4 4",
  shield: "M10 2l6 2.5v5c0 3.5-2.5 6.5-6 8.5-3.5-2-6-5-6-8.5v-5L10 2z",
};

const MOCK = (a: string, b: string) => (
  <div
    className="aspect-[16/9]"
    style={{
      background: `radial-gradient(ellipse at 30% 25%, ${a} 0%, transparent 55%), radial-gradient(ellipse at 72% 75%, ${b} 0%, transparent 55%)`,
    }}
  />
);

export function Page() {
  return (
    <>
      <AnnouncementBar href="#features" storageKey="sbg-v02">
        <strong className="font-semibold">v0.2 is out</strong>
        <span className="opacity-85">— 69 shaders, 51 elements, 16 page templates</span>
        <span aria-hidden="true">→</span>
      </AnnouncementBar>

      <Nav
        links={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "Docs", href: "#faq" },
        ]}
        secondaryCta={{ label: "Sign in", href: "#" }}
        cta={{ label: "Get started", href: "#pricing" }}
      />

      <main>
        <Hero
          shader="holo-foil"
          brand={brand}
          scrim="medium"
          badge={{ label: "69 shaders · v0.2 out now", href: "#features" }}
          headline={
            <>
              Landing pages that{" "}
              <ShaderText shader="mesh-gradient" brand={brand}>
                move
              </ShaderText>
              .
            </>
          }
          subhead="A React section library with WebGL shader backgrounds built in. Drop in a hero, pick a shader, ship. No canvas plumbing, no z-index archaeology."
          primaryAction={{ label: "Start building", href: "#pricing" }}
          secondaryAction={{ label: "Browse shaders", href: "/studio.html" }}
          note="MIT licensed · Copy-paste components"
          visual={
            <BrowserFrame url="shaderbg.dev/studio">
              {MOCK("#4f46e5", "#a855f7")}
            </BrowserFrame>
          }
        />

        <LogoCloud
          variant="marquee"
          logos={[
            "Northwind",
            "Acme Corp",
            "Vertex",
            "Lumen",
            "Cobalt",
            "Meridian",
            "Fathom",
          ]}
        />

        <Features
          id="features"
          eyebrow="Why shaderbg"
          title="Everything a marketing page needs"
          description="Sections that already know how to host a shader — legibility, performance and motion preferences handled before you write a line."
          features={[
            {
              icon: <Icon d={ICONS.palette} />,
              title: "One palette, everywhere",
              description:
                "Set your brand colours once. Sections and shader uniforms recolour together, so nothing clashes.",
            },
            {
              icon: <Icon d={ICONS.cursor} />,
              title: "Cursor-aware backgrounds",
              description:
                "15 shaders respond to the pointer — ripples, tilt, reveal, momentum. Wired up for you.",
            },
            {
              icon: <Icon d={ICONS.gauge} />,
              title: "Pauses when unseen",
              description:
                "Every shader stops rendering once its section scrolls away. A long page costs what's on screen.",
            },
            {
              icon: <Icon d={ICONS.shield} />,
              title: "Legible by default",
              description:
                "A scrim sits between shader and copy. Text over motion is the real accessibility risk here.",
            },
            {
              icon: <Icon d={ICONS.bolt} />,
              title: "Reduced motion respected",
              description:
                "Visitors who ask for less motion get a single static frame instead of an animation.",
            },
            {
              icon: <Icon d={ICONS.code} />,
              title: "Copy-paste, not a black box",
              description:
                "Components live in your repo as plain TSX and Tailwind. Fork any of them the moment you need to.",
            },
          ]}
        />

        <ProductShowcase
          eyebrow="The studio"
          title="Tune it, then take the code"
          tabs={[
            {
              label: "Browse",
              url: "shaderbg.dev/studio",
              content: MOCK("#4f46e5", "#a855f7"),
              description: "69 shaders with live previews, filters and search.",
            },
            {
              label: "Edit",
              url: "shaderbg.dev/studio#editor",
              content: MOCK("#06b6d4", "#4f46e5"),
              description:
                "Edit GLSL with live recompile and errors mapped to your code.",
            },
            {
              label: "Export",
              url: "shaderbg.dev/studio#export",
              content: MOCK("#a855f7", "#22d3ee"),
              description:
                "One self-contained HTML file, or copy the React snippet.",
            },
          ]}
        />

        <Steps
          steps={[
            {
              title: "Install",
              description:
                "Copy the components you want into your project, or install the package.",
            },
            {
              title: "Pick a shader",
              description:
                "Browse the studio, tune the uniforms, note the id. 69 to choose from.",
            },
            {
              title: "Ship",
              description:
                "Drop in a Hero, pass your brand palette, deploy. That's the whole integration.",
            },
          ]}
        />

        <Stats
          stats={[
            { value: 69, label: "Shaders included" },
            { value: 26, label: "Sections" },
            { value: 15, label: "Cursor-interactive" },
            { value: 60, suffix: "fps", label: "On a 2019 laptop" },
          ]}
        />

        {/* CSS spotlight rather than a shader per card — the cheap way to make
            a grid feel alive without six more render loops. */}
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Built in"
              title="Effects that aren't shaders"
              description="Not everything needs WebGL. This grid lights up with one pointer listener and a CSS gradient."
            />
            <SpotlightGrid className="mt-14 sm:grid-cols-3">
              {[
                ["Spotlight grid", "Cursor-follow glow across many cards, no WebGL."],
                ["Border beam", "A light travelling the border, pure CSS."],
                ["Noise overlay", "Grain that unifies flat sections with shader ones."],
                ["Shader text", "A live shader clipped to your headline glyphs."],
                ["Shader orb", "A blob-masked shader as a decorative accent."],
                ["Shader divider", "A feathered band of motion between sections."],
              ].map(([title, body]) => (
                <SpotlightCard key={title} className="min-h-[150px]">
                  <h3 className="text-base font-semibold text-ink-0">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-300">
                    {body}
                  </p>
                </SpotlightCard>
              ))}
            </SpotlightGrid>
          </Container>
        </Section>

        <Testimonials
          testimonials={[
            {
              quote:
                "We replaced a bespoke Three.js hero with one <Hero> and deleted four hundred lines of canvas plumbing.",
              name: "Ada Okonkwo",
              role: "Staff Engineer, Northwind",
            },
            {
              quote:
                "The brand palette mapping is the part I didn't expect. Our shaders match our buttons now.",
              name: "Tomas Reyes",
              role: "Design Lead, Vertex",
            },
            {
              quote:
                "Shipped a launch page in an afternoon. The CTA shader got more comments than the product.",
              name: "Priya Raman",
              role: "Founder, Lumen",
            },
            {
              quote:
                "It pauses when scrolled away, so our Lighthouse score didn't budge.",
              name: "Sven Aalto",
              role: "Web Lead, Cobalt",
            },
            {
              quote: "Copy-paste components in our own repo. No black box to fight.",
              name: "Mei Chen",
              role: "Frontend, Meridian",
            },
            {
              quote:
                "Reduced-motion handling was already correct out of the box. That never happens.",
              name: "Jonah Blake",
              role: "Accessibility, Fathom",
            },
          ]}
        />

        <Comparison
          columns={["shaderbg", "Video background", "CSS gradient"]}
          rows={[
            { group: "Visuals", feature: "Animated", values: [true, true, false] },
            { feature: "Cursor-interactive", values: [true, false, false] },
            { feature: "Recolours to your brand", values: [true, false, true] },
            { feature: "Crisp at any viewport", values: [true, false, true] },
            {
              group: "Performance",
              feature: "Payload",
              values: ["~8 kB", "2–20 MB", "0 kB"],
            },
            { feature: "Pauses when offscreen", values: [true, false, true] },
            {
              group: "Accessibility",
              feature: "Respects reduced motion",
              values: [true, "Manual", true],
            },
          ]}
          footnote="Payload measured gzipped, excluding React."
        />

        <Pricing
          id="pricing"
          description="Start free. Upgrade when a shader ends up in front of real customers."
          tiers={[
            {
              name: "Open source",
              monthly: 0,
              description:
                "The full shader library and every section, MIT licensed.",
              features: [
                "69 shaders",
                "All 26 sections",
                "Shader studio & editor",
                "Community support",
              ],
              cta: { label: "Clone the repo", href: "#" },
            },
            {
              name: "Studio",
              monthly: 19,
              description: "For teams shipping several sites a year.",
              features: [
                "Everything in Open source",
                "Brand palette presets",
                "Figma-to-shader import",
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
              features: [
                "Everything in Studio",
                "Custom shader commissions",
                "Design-system audit",
                "SLA & priority support",
              ],
              cta: { label: "Talk to us", href: "#" },
            },
          ]}
        />

        <FAQ
          id="faq"
          items={[
            {
              question: "Will a WebGL background hurt my Core Web Vitals?",
              answer:
                "Not if you keep to one or two per page. The canvas renders after paint, so it doesn't block LCP, and each shader pauses itself once scrolled out of view. Sections also ship a CSS-gradient fallback derived from the shader's own colours, shown before the first frame and if WebGL is unavailable.",
            },
            {
              question: "What happens without WebGL?",
              answer:
                "The section still renders. A brand-tinted gradient built from the shader's palette stands in, so the page looks intentional rather than broken.",
            },
            {
              question: "Can I use my own brand colours?",
              answer:
                "Yes — pass a brand palette and every shader's colour uniforms are remapped onto your ramp. Each shader declares which role its colours play, so a rebrand doesn't invert light and dark.",
            },
            {
              question: "Does it work with Next.js or Astro?",
              answer:
                "Yes. The sections are ordinary React components. The shader canvas is client-only, so mark the hero as a client component in Next or a client island in Astro; everything else server-renders, including the gradient fallback.",
            },
            {
              question: "Do I need Tailwind?",
              answer:
                "The sections are written in Tailwind, so yes for those. The shader runtime itself has no styling and no dependencies — you can use it standalone with any CSS approach.",
            },
          ]}
          footer={
            <>
              Still stuck?{" "}
              <a href="#" className="text-brand-300 underline underline-offset-4">
                Read the docs
              </a>{" "}
              or open an issue.
            </>
          }
        />

        <CTA
          shader="liquid-ripple"
          brand={brand}
          scrim="strong"
          title="Ship something worth looking at."
          description="Clone the repo, pick a shader, and have a hero on screen in five minutes."
          primaryAction={{ label: "Get started", href: "#" }}
          secondaryAction={{ label: "Open the studio", href: "/studio.html" }}
          note="Move your cursor — this one ripples."
        />
      </main>

      <Footer
        tagline="WebGL shader backgrounds and the marketing sections to put them in."
        columns={[
          {
            heading: "Product",
            links: [
              { label: "Shaders", href: "/studio.html" },
              { label: "Sections", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Changelog", href: "#" },
            ],
          },
          {
            heading: "Developers",
            links: [
              { label: "Documentation", href: "#faq" },
              { label: "Section catalog", href: "/examples/marketing/sections.html" },
              { label: "Contact sheet", href: "/examples/contact-sheet.html" },
              { label: "GitHub", href: "#" },
            ],
          },
          {
            heading: "Company",
            links: [
              { label: "About", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Privacy", href: "#" },
            ],
          },
        ]}
        newsletter={{
          heading: "New shaders, monthly",
          description: "No product updates, just the shaders. Unsubscribe anytime.",
          onSubmit: (email) => console.log("subscribe:", email),
        }}
        social={[
          {
            label: "GitHub",
            href: "#",
            icon: (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 00-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 014 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3.1-1.8 3.8-3.6 4 .3.3.5.8.5 1.6v2.2c0 .2.1.5.6.4A8 8 0 008 0z" />
              </svg>
            ),
          },
          {
            label: "X",
            href: "#",
            icon: (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.6 1h2.4l-5.3 6 6.2 8h-4.8l-3.8-4.9L2.9 15H.5l5.6-6.4L.1 1H5l3.5 4.6L12.6 1z" />
              </svg>
            ),
          },
        ]}
      />
    </>
  );
}
