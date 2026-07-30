import type { ReactNode } from "react";
import { ShaderSection, type ScrimStrength } from "../ui/ShaderSection";
import { Button, Container } from "../ui/primitives";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";
import type { BrandPalette } from "../core/theme";
import type { ShaderDef } from "../core/types";

export interface CTAProps {
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  scrim?: ScrimStrength;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  note?: ReactNode;
  /**
   * `band` is full-bleed — the closing shader moment before the footer.
   * `card` insets it into a rounded panel, better mid-page.
   */
  variant?: "band" | "card";
  id?: string;
  className?: string;
}

/**
 * The closing conversion push.
 *
 * This is the second-best place for a shader after the hero — it is the last
 * thing a visitor sees before the footer, and by then the page has earned some
 * spectacle. Keep the rest of the page flat so these two moments land.
 */
export function CTA({
  shader = "holo-foil",
  brand,
  scrim = "strong",
  title,
  description,
  primaryAction,
  secondaryAction,
  note,
  variant = "band",
  id,
  className,
}: CTAProps) {
  const inner = (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink-0 sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={70}>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-200/90">
            {description}
          </p>
        </Reveal>
      )}
      {(primaryAction || secondaryAction) && (
        <Reveal delay={140}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primaryAction && (
              <Button href={primaryAction.href} size="lg">
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button href={secondaryAction.href} variant="secondary" size="lg">
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </Reveal>
      )}
      {note && (
        <Reveal delay={200}>
          <p className="mt-4 text-sm text-ink-400">{note}</p>
        </Reveal>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <section id={id} className={cn("py-20 sm:py-28", className)}>
        <Container>
          <ShaderSection
            as="div"
            shader={shader}
            brand={brand}
            scrim={scrim}
            className="rounded-3xl border border-white/10"
            contentClassName="px-6 py-20 sm:px-12"
          >
            {inner}
          </ShaderSection>
        </Container>
      </section>
    );
  }

  return (
    <ShaderSection
      id={id}
      shader={shader}
      brand={brand}
      scrim={scrim}
      className={className}
      contentClassName="py-24 sm:py-32"
    >
      <Container>{inner}</Container>
    </ShaderSection>
  );
}
