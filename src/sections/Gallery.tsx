import type { ReactNode } from "react";
import { sitePath } from "../core/sitePath";
import { Reveal } from "../ui/Reveal";
import {
  Badge,
  Button,
  Container,
  Section,
  SectionHeading,
} from "../ui/primitives";
import { cn } from "../ui/cn";

export interface GalleryItem {
  title: ReactNode;
  description?: ReactNode;
  category?: string;
  visual: ReactNode;
  href?: string;
  result?: string;
}

export interface GalleryProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  items: GalleryItem[];
  action?: { label: string; href: string };
  columns?: 2 | 3;
  id?: string;
  className?: string;
}

/** Portfolio, use-case, or template gallery with visual-first cards. */
export function Gallery({
  eyebrow = "Selected work",
  title,
  description,
  items,
  action,
  columns = 2,
  id,
  className,
}: GalleryProps) {
  return (
    <Section id={id} className={className}>
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="left"
          />
          {action && (
            <Button href={action.href} variant="secondary">
              {action.label}
            </Button>
          )}
        </div>
        <div
          className={cn(
            "mt-12 grid gap-6",
            columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {items.map((item, index) => {
            const content = (
              <>
                <div className="aspect-[4/3] overflow-hidden bg-ink-900">
                  {item.visual}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    {item.category && <Badge>{item.category}</Badge>}
                    {item.result && (
                      <span className="text-xs font-semibold text-emerald-300">
                        {item.result}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink-0">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-400">
                      {item.description}
                    </p>
                  )}
                </div>
              </>
            );

            return (
              <Reveal key={index} delay={(index % columns) * 70}>
                {item.href ? (
                  <a
                    href={sitePath(item.href)}
                    className="group block overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 transition-transform hover:-translate-y-1"
                  >
                    {content}
                  </a>
                ) : (
                  <article className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-850">
                    {content}
                  </article>
                )}
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
