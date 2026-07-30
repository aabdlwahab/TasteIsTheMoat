import type { ReactNode } from "react";
import { Container, Section, SectionHeading } from "../ui/primitives";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";

export interface Step {
  title: ReactNode;
  description: ReactNode;
  /** Optional code sample, screenshot or diagram. */
  visual?: ReactNode;
}

export interface StepsProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  steps: Step[];
  /**
   * `row` — numbered columns, compact.
   * `timeline` — vertical list with a connecting rule, room for visuals.
   */
  variant?: "row" | "timeline";
  id?: string;
  className?: string;
}

function StepNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center rounded-full border border-brand-400/40 bg-brand-500/15 text-sm font-semibold text-brand-200"
    >
      {n}
    </span>
  );
}

/**
 * A numbered "how it works" sequence.
 *
 * Rendered as an ordered list so the sequence is conveyed structurally, not
 * only by the styled numbers.
 */
export function Steps({
  eyebrow = "How it works",
  title = "Three steps to shipped",
  description,
  steps,
  variant = "row",
  id,
  className,
}: StepsProps) {
  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {variant === "row" ? (
          <ol
            className={cn(
              "mt-14 grid gap-8",
              steps.length === 2 && "sm:grid-cols-2",
              steps.length === 3 && "sm:grid-cols-3",
              steps.length >= 4 && "sm:grid-cols-2 lg:grid-cols-4",
            )}
          >
            {steps.map((s, i) => (
              <Reveal as="li" key={i} delay={i * 80}>
                <StepNumber n={i + 1} />
                <h3 className="mt-4 text-base font-semibold text-ink-0">
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-300">
                  {s.description}
                </p>
                {s.visual && <div className="mt-5">{s.visual}</div>}
              </Reveal>
            ))}
          </ol>
        ) : (
          <ol className="mt-14 flex flex-col gap-12">
            {steps.map((s, i) => (
              <Reveal as="li" key={i}>
                <div className="grid gap-8 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_1fr]">
                  {/* Connecting rule, omitted on the last step. */}
                  <div className="flex flex-col items-center">
                    <StepNumber n={i + 1} />
                    {i < steps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="mt-3 hidden w-px flex-1 bg-gradient-to-b from-ink-600 to-transparent sm:block"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-ink-0">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-ink-300">
                      {s.description}
                    </p>
                  </div>
                  {s.visual && <div className="lg:pl-4">{s.visual}</div>}
                </div>
              </Reveal>
            ))}
          </ol>
        )}
      </Container>
    </Section>
  );
}
