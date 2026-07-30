import type { ReactNode } from "react";
import type { BrandPalette } from "../core/theme";
import type { ShaderDef } from "../core/types";
import { ShaderSection, type ScrimStrength } from "../ui/ShaderSection";
import { AvatarStack, type AvatarItem } from "../ui/AvatarStack";
import { Rating } from "../ui/Rating";
import { Button, Container } from "../ui/primitives";
import { cn } from "../ui/cn";

export interface StoryMetric {
  value: ReactNode;
  label: ReactNode;
}

export interface CustomerStoryProps {
  eyebrow?: string;
  quote: ReactNode;
  name: string;
  role?: string;
  company?: ReactNode;
  metrics?: StoryMetric[];
  team?: AvatarItem[];
  rating?: string;
  action?: { label: string; href: string };
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  scrim?: ScrimStrength;
  id?: string;
  className?: string;
}

/** Full-width case-study quote with outcome metrics and optional shader backdrop. */
export function CustomerStory({
  eyebrow = "Customer story",
  quote,
  name,
  role,
  company,
  metrics = [],
  team,
  rating,
  action,
  shader,
  brand,
  scrim = "strong",
  id,
  className,
}: CustomerStoryProps) {
  return (
    <ShaderSection
      id={id}
      shader={shader}
      brand={brand}
      scrim={scrim}
      className={cn(
        "border-y border-white/10 bg-ink-900",
        className,
      )}
      contentClassName="py-20 sm:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
                {eyebrow}
              </p>
              {company && (
                <div className="text-sm font-semibold text-ink-100">{company}</div>
              )}
            </div>
            <blockquote className="mt-6 text-balance text-3xl font-medium leading-tight tracking-tight text-ink-0 sm:text-4xl">
              “{quote}”
            </blockquote>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              {team && <AvatarStack items={team} />}
              <div>
                <p className="text-sm font-semibold text-ink-0">{name}</p>
                {role && <p className="text-sm text-ink-400">{role}</p>}
              </div>
              {rating && <Rating label={rating} size="sm" />}
            </div>
            {action && (
              <Button href={action.href} variant="secondary" className="mt-8">
                {action.label}
              </Button>
            )}
          </div>
          {metrics.length > 0 && (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-ink-950/75 p-6">
                  <dd className="text-3xl font-semibold tracking-tight text-ink-0">
                    {metric.value}
                  </dd>
                  <dt className="mt-2 text-sm leading-relaxed text-ink-400">
                    {metric.label}
                  </dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
    </ShaderSection>
  );
}
