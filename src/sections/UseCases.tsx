import { useId, useState, type ReactNode } from "react";
import { BrowserFrame } from "../ui/BrowserFrame";
import {
  Button,
  Container,
  Section,
  SectionHeading,
} from "../ui/primitives";
import { cn } from "../ui/cn";

export interface UseCase {
  label: string;
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  benefits?: ReactNode[];
  visual?: ReactNode;
  action?: { label: string; href: string };
}

export interface UseCasesProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  cases: UseCase[];
  id?: string;
  className?: string;
}

/** Audience or workflow tabs with a matching value proposition and visual. */
export function UseCases({
  eyebrow,
  title,
  description,
  cases,
  id,
  className,
}: UseCasesProps) {
  const [active, setActive] = useState(0);
  const tabsId = useId();
  const current = cases[active];

  if (!current) return null;

  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div
          role="tablist"
          aria-label="Use cases"
          className="mx-auto mt-10 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-ink-700 bg-ink-900/80 p-1"
        >
          {cases.map((item, index) => (
            <button
              key={item.label}
              id={`${tabsId}-tab-${index}`}
              role="tab"
              type="button"
              aria-selected={index === active}
              aria-controls={`${tabsId}-panel-${index}`}
              onClick={() => setActive(index)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                index === active
                  ? "bg-ink-0 text-ink-950"
                  : "text-ink-300 hover:text-ink-0",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          key={active}
          id={`${tabsId}-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-tab-${active}`}
          className="mt-10 grid items-center gap-10 rounded-3xl border border-ink-700 bg-ink-900/45 p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div>
            {current.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
                {current.eyebrow}
              </p>
            )}
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-ink-0">
              {current.title}
            </h3>
            <p className="mt-4 leading-relaxed text-ink-300">
              {current.description}
            </p>
            {current.benefits && (
              <ul className="mt-6 grid gap-3">
                {current.benefits.map((benefit, index) => (
                  <li key={index} className="flex gap-3 text-sm text-ink-200">
                    <span aria-hidden="true" className="text-brand-300">
                      ↗
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            )}
            {current.action && (
              <Button href={current.action.href} className="mt-7">
                {current.action.label}
              </Button>
            )}
          </div>
          <BrowserFrame url={`${current.label.toLowerCase().replace(/\s+/g, "-")}.workspace.dev`}>
            {current.visual ?? (
              <div className="aspect-[16/10] bg-[radial-gradient(circle_at_25%_30%,rgba(79,70,229,.8),transparent_40%),radial-gradient(circle_at_75%_70%,rgba(34,211,238,.45),transparent_42%),#11131b]" />
            )}
          </BrowserFrame>
        </div>
      </Container>
    </Section>
  );
}
