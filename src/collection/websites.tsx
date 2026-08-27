/**
 * Complete websites.
 *
 * These are whole pages, not pieces, so they get their own section and their
 * own kind of preview: one framed browser at a time, at a viewport width you
 * choose, rather than sixteen iframes fighting for a GPU. Everything else on
 * the page is a component you would compose; these are compositions you would
 * start from.
 */
import { useEffect, useRef, useState } from "react";
import { sitePath } from "../core/sitePath";

interface Site {
  key: string;
  title: string;
  brand: string;
  description: string;
  sections: string;
  /** Behind the still, and while it loads. */
  palette: string;
}

const SITES: Site[] = [
  { key: "saas", title: "SaaS product", brand: "Northwind", description: "Conversion-oriented product page with audience tabs, proof, pricing, FAQ, and a demo form.", sections: "10 sections", palette: "linear-gradient(135deg,#4338ca,#7c3aed 45%,#22d3ee)" },
  { key: "ai", title: "AI platform", brand: "Parallax", description: "Trust-forward AI story with a product tour, use cases, security, newsletter, and technical CTA.", sections: "8 sections", palette: "linear-gradient(135deg,#0f766e,#10b981 45%,#f0abfc)" },
  { key: "developer", title: "Developer tool", brand: "FieldKit", description: "Technical landing page with an install command, product tabs, changelog, pricing, and docs CTA.", sections: "9 sections", palette: "linear-gradient(135deg,#1d4ed8,#0ea5e9 45%,#bef264)" },
  { key: "agency", title: "Creative agency", brand: "Elsewhere", description: "Editorial portfolio with selected work, outcomes, process, a customer story, and project inquiry.", sections: "8 sections", palette: "linear-gradient(135deg,#9a3412,#f97316 45%,#fde047)" },
  { key: "infinite-portfolio", title: "Infinite portfolio", brand: "Field/Objects", description: "Draggable project universe with image trails and morphing case studies instead of a vertical feed.", sections: "Experimental", palette: "linear-gradient(135deg,#4338ca,#7c3aed 45%,#22d3ee)" },
  { key: "kinetic-editorial", title: "Kinetic editorial", brand: "Uncommon", description: "Manifesto-style publishing with kinetic type, mechanical transitions, and scroll velocity.", sections: "Experimental", palette: "linear-gradient(135deg,#be123c,#f97316 45%,#fde047)" },
  { key: "ai-laboratory", title: "AI laboratory", brand: "Parallax Research", description: "Dithered research page with evidence states, confidence layers, and encrypted typography.", sections: "Experimental", palette: "linear-gradient(135deg,#065f46,#14b8a6 45%,#f0abfc)" },
  { key: "product-story", title: "Product story", brand: "Relay", description: "Pinned product chapters with a scroll-scrubbed interface running beside the narrative.", sections: "Experimental", palette: "linear-gradient(135deg,#1d4ed8,#7c3aed 45%,#22d3ee)" },
  { key: "generative-studio", title: "Generative studio", brand: "Seed/Signal", description: "Full-screen art system with living previews, editable seeds, and collectible states.", sections: "Experimental", palette: "linear-gradient(135deg,#5b21b6,#db2777 45%,#22d3ee)" },
  { key: "luxury-drop", title: "Luxury drop", brand: "MONO/02", description: "One object examined slowly — lens inspection and material detail instead of a feature list.", sections: "Experimental", palette: "linear-gradient(135deg,#1c1917,#78716c 45%,#f5f5f4)" },
  { key: "festival", title: "Festival", brand: "OFFSET", description: "Animated event poster with a draggable lineup and spatial venue ribbons.", sections: "Experimental", palette: "linear-gradient(135deg,#ea580c,#7c3aed 45%,#bef264)" },
  { key: "open-source-launch", title: "Open-source launch", brand: "FieldKit", description: "Launch page with an executable hero, honest comparison table, and searchable docs.", sections: "Experimental", palette: "linear-gradient(135deg,#1d4ed8,#0ea5e9 45%,#bef264)" },
  { key: "interactive-case-study", title: "Interactive case study", brand: "Northwind / 24", description: "Morphing project narrative with pinned outcomes and process artifacts.", sections: "Experimental", palette: "linear-gradient(135deg,#115e59,#10b981 45%,#fbbf24)" },
  { key: "spatial-agency", title: "Spatial agency", brand: "Elsewhere", description: "Portfolio built on image trails and direction-aware project reveals.", sections: "Experimental", palette: "linear-gradient(135deg,#9f1239,#7c3aed 45%,#fde047)" },
  { key: "data-story", title: "Data story", brand: "Common Measure", description: "Narrative annual report with layered methodology and metrics that build on scroll.", sections: "Experimental", palette: "linear-gradient(135deg,#075985,#06b6d4 45%,#a3e635)" },
  { key: "music-release", title: "Music release", brand: "NIGHT/FORM", description: "Audio-reactive album page with a pixel portrait and credits composed as a living liner note.", sections: "Experimental", palette: "linear-gradient(135deg,#4c1d95,#db2777 45%,#22d3ee)" },
];

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "834px" },
  { id: "phone", label: "Phone", width: "412px" },
] as const;

type ViewportId = (typeof VIEWPORTS)[number]["id"];

function hrefFor(site: Site): string {
  return sitePath(`/examples/templates/?template=${site.key}`);
}

export function Websites() {
  const [active, setActive] = useState<Site>(SITES[0]);
  const [viewport, setViewport] = useState<ViewportId>("desktop");
  const [armed, setArmed] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const width = VIEWPORTS.find((item) => item.id === viewport)?.width ?? "100%";

  // A template is a whole React page. `loading="lazy"` is not enough — Chrome
  // starts it from a long way off, which means opening the home page also
  // boots a second app before anyone has scrolled this far. So the frame stays
  // empty until the section is genuinely close.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || armed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setArmed(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [armed]);

  return (
    <section id="websites" className="border-b border-ink-700 bg-[#0a0b10]">
      <div className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 sm:py-24">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
            Complete websites · {SITES.length} pages
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-ink-0 sm:text-6xl">
            And sixteen finished pages, kept separate on purpose.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-300">
            Everything above is a part you compose. These are whole compositions
            — conventional marketing directions and experimental ones — running
            live in the frame below.
          </p>
        </header>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-b border-ink-700 pb-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-400">
              {active.brand} · {active.sections}
            </p>
            <h3 className="mt-2 font-serif text-3xl tracking-[-0.03em] text-ink-0">
              {active.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-400">
              {active.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-ink-700 p-0.5">
              {VIEWPORTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewport(item.id)}
                  aria-pressed={viewport === item.id}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    viewport === item.id ? "bg-white/12 text-ink-0" : "text-ink-400 hover:text-ink-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <a
              href={hrefFor(active)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-accent-400 px-3 py-1.5 text-[11px] font-semibold text-black transition-colors hover:bg-accent-300"
            >
              Open the page ↗
            </a>
          </div>
        </div>

        <div ref={frameRef} className="mt-6 overflow-hidden rounded-2xl border border-ink-700 bg-[#07080c]">
          <div className="mx-auto h-[clamp(28rem,68vh,50rem)] transition-[width] duration-300" style={{ width }}>
            {armed ? (
              <iframe
                key={active.key}
                src={hrefFor(active)}
                title={`${active.title} — complete page`}
                className="h-full w-full border-0"
              />
            ) : (
              <div
                aria-hidden="true"
                className="h-full w-full"
                style={{ background: active.palette, opacity: 0.35 }}
              />
            )}
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SITES.map((site) => (
            <li key={site.key}>
              <button
                type="button"
                onClick={() => setActive(site)}
                aria-pressed={site.key === active.key}
                className={`group flex h-full w-full flex-col overflow-hidden rounded-xl border text-left transition-[transform,border-color] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ${
                  site.key === active.key
                    ? "border-accent-400 bg-accent-400/10"
                    : "border-ink-700 bg-ink-900/40 hover:border-ink-500"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="relative block aspect-[16/10] w-full overflow-hidden"
                  style={{ background: site.palette }}
                >
                  <img
                    src={sitePath(`/previews/sites/${site.key}.webp`)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="flex flex-1 flex-col p-4">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-ink-0 transition-colors group-hover:text-accent-300">
                      {site.title}
                    </span>
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-600">
                      {site.sections}
                    </span>
                  </span>
                  <span className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-ink-500">
                    {site.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
