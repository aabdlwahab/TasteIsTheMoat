/**
 * The workbench: one live preview at the top of the collection, every control
 * that piece accepts beside it, and the whole gallery underneath.
 *
 * The rule the page is built on is that nothing is a picture. Selecting a card
 * mounts the real component into the stage; the panel writes straight into its
 * props; the snippet under it is generated from the same values, so what you
 * copy is what you are looking at.
 *
 * The stage still shows a component in a box, though, and a box is not a page.
 * "Put it on the page" hands the current piece and the current settings to the
 * top of the screen, where it has to hold up next to a headline and a nav —
 * see `appliedHero.tsx`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeBlock } from "../ui/index";
import { sitePath } from "../core/sitePath";
import { ControlPanel } from "./controls";
import { capturedPreviews } from "./previews";
import { countsByGroup, groups, works, worksById } from "./works/index";
import { defaultsOf } from "./types";
import type { ControlValue, ControlValues, Work } from "./types";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "820px" },
  { id: "phone", label: "Phone", width: "400px" },
] as const;

type ViewportId = (typeof VIEWPORTS)[number]["id"];

const DEFAULT_WORK = "shader-mesh-gradient";

function initialWork(): Work {
  if (typeof window !== "undefined") {
    const requested = new URLSearchParams(window.location.search).get("w");
    const match = requested ? worksById.get(requested) : undefined;
    if (match) return match;
  }
  return worksById.get(DEFAULT_WORK) ?? works[0];
}

/** A deterministic tile for cards that cannot supply their own swatch. */
function tileFor(work: Work): string {
  if (work.swatch) return work.swatch;
  let hash = 0;
  for (let i = 0; i < work.id.length; i += 1) {
    hash = (hash * 31 + work.id.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  const second = (hue + 48 + (hash % 60)) % 360;
  return `radial-gradient(ellipse 80% 70% at 22% 24%, hsl(${hue} 72% 46% / 0.55) 0%, transparent 62%), radial-gradient(ellipse 70% 60% at 78% 76%, hsl(${second} 74% 52% / 0.4) 0%, transparent 60%), #0c0d13`;
}

export function Workbench({
  onApply,
  appliedId,
}: {
  /** Hands the current piece and its settings to the hero. */
  onApply: (work: Work, values: ControlValues) => void;
  /** The piece already on the page, so the button can say "update". */
  appliedId?: string;
}) {
  const [work, setWork] = useState<Work>(initialWork);
  const [values, setValues] = useState<ControlValues>(() => defaultsOf(initialWork().controls));
  const [group, setGroup] = useState("All");
  const [search, setSearch] = useState("");
  const [viewport, setViewport] = useState<ViewportId>("desktop");
  const [replay, setReplay] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(countsByGroup, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return works.filter((item) => {
      if (group !== "All" && item.group !== group) return false;
      if (!term) return true;
      return `${item.name} ${item.kind} ${item.group} ${item.description}`
        .toLowerCase()
        .includes(term);
    });
  }, [group, search]);

  const select = useCallback((next: Work) => {
    setWork(next);
    setValues(defaultsOf(next.controls));
    setReplay((count) => count + 1);

    const url = new URL(window.location.href);
    url.searchParams.set("w", next.id);
    window.history.replaceState(null, "", url);

    window.requestAnimationFrame(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      if (bounds.top < 64 || bounds.bottom > window.innerHeight) {
        stage.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      }
    });
  }, []);

  // Arrow keys step through the gallery once something has been chosen, which
  // is the fastest way to actually compare sixty-nine shaders side by side.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const index = visible.findIndex((item) => item.id === work.id);
      if (index === -1) return;
      const next = visible[index + (event.key === "ArrowRight" ? 1 : -1)];
      if (next) {
        event.preventDefault();
        select(next);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, work.id, select]);

  const fit = work.fit ?? "center";
  const width = VIEWPORTS.find((item) => item.id === viewport)?.width ?? "100%";
  const snippet = work.code?.(values);

  return (
    <section id="collection" className="border-y border-ink-700 bg-ink-950">
      <div className="mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 sm:py-24">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
            The workbench · {works.length} pieces
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-ink-0 sm:text-6xl">
            Every element, live, with every knob it has.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-300">
            Pick anything from the gallery below and it mounts here for real —
            not a screenshot, not a video. The panel writes straight into its
            props, and the snippet underneath is generated from whatever you
            just set.
          </p>
        </header>

        {/* ---- the stage ------------------------------------------------- */}
        <div ref={stageRef} className="mt-10 scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-700 pb-4">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-300">
                {work.group} · {work.kind}
              </p>
              <h3 className="mt-2 truncate font-serif text-3xl tracking-[-0.03em] text-ink-0">
                {work.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-400">
                {work.description}
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
                      viewport === item.id
                        ? "bg-white/12 text-ink-0"
                        : "text-ink-400 hover:text-ink-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setReplay((count) => count + 1)}
                className="rounded-lg border border-ink-700 px-3 py-1.5 text-[11px] font-medium text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-0"
              >
                Replay
              </button>
              <button
                type="button"
                onClick={() => {
                  setValues(defaultsOf(work.controls));
                  setReplay((count) => count + 1);
                }}
                className="rounded-lg border border-ink-700 px-3 py-1.5 text-[11px] font-medium text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-0"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => onApply(work, values)}
                className="rounded-lg bg-accent-400 px-3 py-1.5 text-[11px] font-semibold text-black transition-colors hover:bg-accent-300"
              >
                {appliedId === work.id ? "Update the page ↑" : "Put it on the page ↑"}
              </button>
              <a
                href={sitePath(work.href ?? `/element.html?w=${work.id}`)}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-[11px] font-semibold text-black transition-colors hover:bg-brand-400"
              >
                Full page ↗
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="overflow-hidden rounded-2xl border border-ink-700 bg-[#0a0b10]">
              <div className="mx-auto h-[clamp(26rem,60vh,44rem)] transition-[width] duration-300" style={{ width }}>
                <div
                  key={`${work.id}-${replay}`}
                  className={
                    fit === "fill"
                      ? "h-full w-full"
                      : fit === "flow"
                        ? "h-full w-full overflow-y-auto overscroll-contain"
                        : `grid h-full w-full place-items-center overflow-auto p-6 sm:p-10 ${work.stageClassName ?? ""}`
                  }
                >
                  {work.render(values)}
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-ink-700 bg-ink-900/50 p-5">
              <p className="mb-4 flex items-baseline justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                Controls
                <span className="text-ink-600">{work.controls.length}</span>
              </p>
              <div className="max-h-[34rem] overflow-y-auto pr-1">
                <ControlPanel
                  controls={work.controls}
                  values={values}
                  note={work.panelNote}
                  onChange={(key, value: ControlValue) =>
                    setValues((current) => ({ ...current, [key]: value }))
                  }
                />
              </div>
            </aside>
          </div>

          {snippet ? (
            <div className="mt-6">
              <CodeBlock value={snippet} label="Usage — reflects the settings above" language="tsx" />
            </div>
          ) : null}
        </div>

        {/* ---- the gallery ----------------------------------------------- */}
        <div className="mt-20 border-t border-ink-700 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap gap-1.5">
              {["All", ...groups].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setGroup(name)}
                  aria-pressed={group === name}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    group === name
                      ? "bg-brand-500 text-black"
                      : "bg-white/8 text-ink-300 hover:bg-white/16"
                  }`}
                >
                  {name}
                  <span className="ml-1.5 tabular-nums opacity-60">
                    {name === "All" ? works.length : counts[name] ?? 0}
                  </span>
                </button>
              ))}
            </div>
            <label className="min-w-56 flex-1 sm:max-w-xs">
              <span className="sr-only">Search the collection</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search everything…"
                className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3.5 py-2 text-sm text-ink-0 outline-none transition-colors placeholder:text-ink-500 focus:border-brand-400"
              />
            </label>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(item)}
                  aria-pressed={item.id === work.id}
                  className={`group flex w-full flex-col overflow-hidden rounded-xl border text-left transition-[transform,border-color] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${
                    item.id === work.id
                      ? "border-brand-400 bg-brand-500/10"
                      : "border-ink-700 bg-ink-900/40 hover:border-ink-500"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="relative block aspect-[4/3] w-full overflow-hidden"
                    style={{ background: tileFor(item) }}
                  >
                    {capturedPreviews.has(item.id) ? (
                      <img
                        src={sitePath(`/previews/works/${item.id}.webp`)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : null}
                    <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,9,13,.75),transparent_55%)]" />
                    <span className="absolute bottom-2 left-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/70">
                      {item.kind}
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-3">
                    <span className="truncate text-sm font-semibold text-ink-0 transition-colors group-hover:text-brand-200">
                      {item.name}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-500">
                      {item.description}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {visible.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-400">
              Nothing matches “{search}”.
            </p>
          ) : (
            <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink-600">
              {visible.length} shown · arrow keys step through them
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
