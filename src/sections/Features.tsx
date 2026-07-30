import type { ReactNode } from "react";
import { Container, Section, SectionHeading } from "../ui/primitives";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";

export interface Feature {
  icon?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  /** Optional visual for `alternating` and `bento` layouts. */
  visual?: ReactNode;
  /** In `bento`, mark the one or two cells that should span wide. */
  wide?: boolean;
}

export interface FeaturesProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  features: Feature[];
  /**
   * `grid` — icon cards, the default and safest.
   * `alternating` — zig-zag rows, when each feature deserves a visual.
   * `bento` — mixed-size cards, for a denser, more designed feel.
   */
  variant?: "grid" | "alternating" | "bento";
  id?: string;
  className?: string;
}

function IconBox({ icon }: { icon: ReactNode }) {
  return (
    <div className="mb-5 grid size-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-inset ring-brand-400/25">
      {icon}
    </div>
  );
}

export function Features({
  eyebrow,
  title,
  description,
  features,
  variant = "grid",
  id,
  className,
}: FeaturesProps) {
  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {variant === "grid" && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="h-full rounded-card border border-ink-700 bg-ink-850/60 p-6 transition-colors hover:border-ink-600">
                  {f.icon && <IconBox icon={f.icon} />}
                  <h3 className="text-base font-semibold text-ink-0">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-300">
                    {f.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {variant === "alternating" && (
          <div className="mt-16 flex flex-col gap-20 sm:gap-24">
            {features.map((f, i) => (
              <Reveal key={i}>
                <div className="grid items-center gap-10 lg:grid-cols-2">
                  {/* Order flips on alternate rows; on mobile copy always leads. */}
                  <div className={cn(i % 2 === 1 && "lg:order-2")}>
                    {f.icon && <IconBox icon={f.icon} />}
                    <h3 className="text-2xl font-semibold tracking-tight text-ink-0">
                      {f.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-ink-300">
                      {f.description}
                    </p>
                  </div>
                  {f.visual && (
                    <div className={cn(i % 2 === 1 && "lg:order-1")}>
                      {f.visual}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {variant === "bento" && (
          <div className="mt-14 grid auto-rows-[minmax(180px,auto)] gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal
                key={i}
                delay={i * 60}
                className={cn(f.wide && "sm:col-span-2")}
              >
                <div className="flex h-full flex-col overflow-hidden rounded-card border border-ink-700 bg-ink-850/60 p-6">
                  {f.icon && <IconBox icon={f.icon} />}
                  <h3 className="text-base font-semibold text-ink-0">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-300">
                    {f.description}
                  </p>
                  {f.visual && <div className="mt-5 flex-1">{f.visual}</div>}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
