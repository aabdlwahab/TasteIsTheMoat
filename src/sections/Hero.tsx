import type { ReactNode } from "react";
import { ShaderSection, type ScrimStrength } from "../ui/ShaderSection";
import { Badge, Button, Container } from "../ui/primitives";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";
import type { BrandPalette } from "../core/theme";
import type { ShaderDef } from "../core/types";

export interface HeroAction {
  label: string;
  href: string;
}

export interface HeroProps {
  /** Shader id or def for the background. Omit for a plain gradient hero. */
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  uniforms?: Record<string, number | number[]>;
  scrim?: ScrimStrength;
  /** Small pill above the headline — announcements, launches, funding. */
  badge?: { label: ReactNode; href?: string };
  headline: ReactNode;
  subhead?: ReactNode;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  /** Small print under the buttons: "No card required", etc. */
  note?: ReactNode;
  /**
   * `centered` puts everything on the axis. `split` places copy left and
   * `visual` right — use it when you have a product shot worth showing.
   */
  layout?: "centered" | "split";
  /** Product screenshot, mockup or demo. */
  visual?: ReactNode;
  /** Fade the shader into the next section. */
  fadeBottom?: boolean;
  id?: string;
  className?: string;
  copyClassName?: string;
}

/**
 * The hero. Two layouts share one implementation because the copy block,
 * actions and shader handling are identical between them — only the grid
 * changes.
 */
export function Hero({
  shader = "mesh-gradient",
  brand,
  uniforms,
  scrim = "medium",
  badge,
  headline,
  subhead,
  primaryAction,
  secondaryAction,
  note,
  layout = "centered",
  visual,
  fadeBottom = true,
  id = "top",
  className,
  copyClassName,
}: HeroProps) {
  const centered = layout === "centered";

  const copy = (
    <div className={cn(centered && "mx-auto max-w-3xl text-center", copyClassName)}>
      {badge && (
        <Reveal>
          <Badge href={badge.href} className="mb-6">
            {badge.label}
          </Badge>
        </Reveal>
      )}
      <Reveal delay={60}>
        <h1
          className={cn(
            "text-balance font-semibold tracking-tight text-ink-0",
            "text-4xl leading-[1.05] sm:text-5xl lg:text-6xl",
          )}
        >
          {headline}
        </h1>
      </Reveal>
      {subhead && (
        <Reveal delay={120}>
          <p
            className={cn(
              "mt-5 text-pretty text-lg leading-relaxed text-ink-200/90 sm:text-xl",
              centered ? "mx-auto max-w-2xl" : "max-w-xl",
            )}
          >
            {subhead}
          </p>
        </Reveal>
      )}
      {(primaryAction || secondaryAction) && (
        <Reveal delay={180}>
          <div
            className={cn(
              "mt-9 flex flex-wrap items-center gap-3",
              centered && "justify-center",
            )}
          >
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
        <Reveal delay={240}>
          <p className="mt-4 text-sm text-ink-400">{note}</p>
        </Reveal>
      )}
    </div>
  );

  return (
    <ShaderSection
      id={id}
      shader={shader}
      brand={brand}
      uniforms={uniforms}
      scrim={scrim}
      fadeBottom={fadeBottom}
      className={cn("min-h-[92svh] flex items-center", className)}
      contentClassName="w-full py-32 sm:py-36"
    >
      <Container>
        {centered ? (
          copy
        ) : (
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {copy}
            {visual && <Reveal delay={200}>{visual}</Reveal>}
          </div>
        )}
        {centered && visual && (
          <Reveal delay={280}>
            <div className="mt-16">{visual}</div>
          </Reveal>
        )}
      </Container>
    </ShaderSection>
  );
}
