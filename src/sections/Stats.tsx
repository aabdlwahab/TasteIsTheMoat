import type { ReactNode } from "react";
import { Container, Section } from "../ui/primitives";
import { Counter } from "../ui/Counter";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";

export interface Stat {
  value: number;
  label: ReactNode;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export interface StatsProps {
  stats: Stat[];
  /** Separate the row from neighbouring sections with hairlines. */
  bordered?: boolean;
  id?: string;
  className?: string;
}

/** A row of headline metrics that count up as they scroll into view. */
export function Stats({ stats, bordered = true, id, className }: StatsProps) {
  return (
    <Section
      id={id}
      className={cn(
        "py-16 sm:py-20",
        bordered && "border-y border-ink-700",
        className,
      )}
    >
      <Container>
        <dl
          className={cn(
            "grid gap-10 text-center",
            stats.length === 2 && "sm:grid-cols-2",
            stats.length === 3 && "sm:grid-cols-3",
            stats.length >= 4 && "grid-cols-2 lg:grid-cols-4",
          )}
        >
          {/* dl > div > dt+dd is the valid grouping. dt comes first in the DOM
              and column-reverse lifts the number above it visually. The label
              is rendered once: it previously appeared as both an sr-only dt and
              a visible p, so screen readers announced it either side of the
              value. */}
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 80} className="flex flex-col-reverse">
              <dt className="mt-2 text-sm text-ink-400">{s.label}</dt>
              <dd className="text-4xl font-semibold tracking-tight text-ink-0 sm:text-5xl">
                <Counter
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals}
                />
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
