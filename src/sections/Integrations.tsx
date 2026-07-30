import type { ReactNode } from "react";
import { Container, Section, SectionHeading } from "../ui/primitives";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";

export interface Integration {
  name: string;
  /** Icon or logo. Falls back to the first letter. */
  icon?: ReactNode;
  description?: ReactNode;
  href?: string;
  /** Mark integrations that are announced but not shipped. */
  comingSoon?: boolean;
}

export interface IntegrationsProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  integrations: Integration[];
  /** `tiles` shows names only; `cards` adds a line of copy each. */
  variant?: "tiles" | "cards";
  id?: string;
  className?: string;
}

/** A grid of tools the product connects to. */
export function Integrations({
  eyebrow = "Integrations",
  title = "Works with your stack",
  description,
  integrations,
  variant = "tiles",
  id,
  className,
}: IntegrationsProps) {
  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <ul
          className={cn(
            "mt-14 grid gap-4",
            variant === "tiles"
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {integrations.map((it, i) => {
            const inner = (
              <>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/8 text-sm font-semibold text-ink-100 ring-1 ring-inset ring-white/10">
                  {it.icon ?? it.name[0]}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-medium text-ink-0">
                      {it.name}
                    </span>
                    {it.comingSoon && (
                      <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                        Soon
                      </span>
                    )}
                  </span>
                  {variant === "cards" && it.description && (
                    <span className="mt-1 block text-[13px] leading-relaxed text-ink-400">
                      {it.description}
                    </span>
                  )}
                </span>
              </>
            );

            const shell = cn(
              "flex h-full items-center gap-3.5 rounded-card border border-ink-700 bg-ink-850/60 p-4",
              "transition-colors",
              it.href ? "hover:border-brand-400/50 hover:bg-ink-800" : "",
              it.comingSoon && "opacity-60",
            );

            return (
              <Reveal as="li" key={i} delay={i * 40}>
                {it.href ? (
                  <a href={it.href} className={shell}>
                    {inner}
                  </a>
                ) : (
                  <div className={shell}>{inner}</div>
                )}
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
