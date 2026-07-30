import type { ReactNode } from "react";
import { BrowserFrame } from "../ui/BrowserFrame";
import { Reveal } from "../ui/Reveal";
import {
  Button,
  Container,
  Section,
  SectionHeading,
} from "../ui/primitives";
import { cn } from "../ui/cn";

export interface FeatureRow {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  bullets?: ReactNode[];
  visual: ReactNode;
  visualUrl?: string;
  action?: { label: string; href: string };
}

export interface FeatureRowsProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  rows: FeatureRow[];
  framed?: boolean;
  id?: string;
  className?: string;
}

/** Alternating copy-and-product rows for explaining a workflow in depth. */
export function FeatureRows({
  eyebrow,
  title,
  description,
  rows,
  framed = true,
  id,
  className,
}: FeatureRowsProps) {
  return (
    <Section id={id} className={className}>
      <Container>
        {title && (
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        )}
        <div className={cn("grid gap-20", title && "mt-16 sm:mt-20")}>
          {rows.map((row, index) => (
            <article
              key={index}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <Reveal
                className={cn(index % 2 === 1 && "lg:order-2")}
                delay={40}
              >
                {row.eyebrow && (
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
                    {row.eyebrow}
                  </p>
                )}
                <h3 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-0">
                  {row.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-ink-300">
                  {row.description}
                </p>
                {row.bullets && row.bullets.length > 0 && (
                  <ul className="mt-6 grid gap-3">
                    {row.bullets.map((bullet, bulletIndex) => (
                      <li
                        key={bulletIndex}
                        className="flex gap-3 text-[15px] text-ink-200"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-400/15 text-[10px] text-brand-200"
                        >
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {row.action && (
                  <Button
                    href={row.action.href}
                    variant="secondary"
                    className="mt-7"
                  >
                    {row.action.label}
                  </Button>
                )}
              </Reveal>
              <Reveal
                delay={120}
                className={cn(index % 2 === 1 && "lg:order-1")}
              >
                {framed ? (
                  <BrowserFrame url={row.visualUrl}>{row.visual}</BrowserFrame>
                ) : (
                  row.visual
                )}
              </Reveal>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
