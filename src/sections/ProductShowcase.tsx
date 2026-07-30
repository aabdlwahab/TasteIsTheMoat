import { useId, useState, type ReactNode } from "react";
import { Container, Section, SectionHeading } from "../ui/primitives";
import { BrowserFrame } from "../ui/BrowserFrame";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";

export interface ShowcaseTab {
  label: string;
  /** Screenshot, video or live demo. */
  content: ReactNode;
  /** Address shown in the frame chrome for this tab. */
  url?: string;
  /** Optional copy beside/below the visual. */
  description?: ReactNode;
}

export interface ProductShowcaseProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  tabs: ShowcaseTab[];
  /** Wrap the visual in browser chrome. */
  framed?: boolean;
  id?: string;
  className?: string;
}

/**
 * Product screenshots with tabs.
 *
 * A real tablist: arrow keys move between tabs, `aria-selected` and
 * `aria-controls` wire the panels up, and only the active panel is mounted so
 * offscreen screenshots and demos cost nothing.
 */
export function ProductShowcase({
  eyebrow = "Product",
  title = "See it in action",
  description,
  tabs,
  framed = true,
  id,
  className,
}: ProductShowcaseProps) {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const current = tabs[active];

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (active + dir + tabs.length) % tabs.length;
    setActive(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  }

  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {tabs.length > 1 && (
          <div
            role="tablist"
            aria-label="Product views"
            onKeyDown={onKeyDown}
            className="mx-auto mt-10 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-ink-700 bg-ink-850/70 p-1"
          >
            {tabs.map((t, i) => (
              <button
                key={i}
                id={`${baseId}-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls={`${baseId}-panel-${i}`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  "outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                  i === active
                    ? "bg-ink-0 text-ink-950"
                    : "text-ink-300 hover:bg-white/8 hover:text-ink-0",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {current && (
          <div
            id={`${baseId}-panel-${active}`}
            role={tabs.length > 1 ? "tabpanel" : undefined}
            aria-labelledby={tabs.length > 1 ? `${baseId}-tab-${active}` : undefined}
            className="mt-10"
          >
            <Reveal>
              {framed ? (
                <BrowserFrame url={current.url}>{current.content}</BrowserFrame>
              ) : (
                current.content
              )}
            </Reveal>
            {current.description && (
              <p className="mx-auto mt-7 max-w-2xl text-center text-[15px] leading-relaxed text-ink-300">
                {current.description}
              </p>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
