import type { ReactNode } from "react";
import { sitePath } from "../core/sitePath";
import { Button, Container, Section, SectionHeading } from "../ui/primitives";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";

export interface Post {
  title: ReactNode;
  href: string;
  excerpt?: ReactNode;
  /** ISO date string — used for both display and the datetime attribute. */
  date?: string;
  category?: string;
  readingTime?: string;
  /** Cover image URL. A brand gradient stands in when absent. */
  image?: string;
  author?: { name: string; avatar?: string };
}

export interface BlogGridProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  posts: Post[];
  /** Render the first post larger. */
  featureFirst?: boolean;
  viewAll?: { label: string; href: string };
  id?: string;
  className?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Article cards for content marketing.
 *
 * The whole card is a single link wrapping the heading, so there is one tab
 * stop per post rather than several competing ones, and dates use `<time>` with
 * a machine-readable `dateTime`.
 */
export function BlogGrid({
  eyebrow = "Blog",
  title = "Latest writing",
  description,
  posts,
  featureFirst = false,
  viewAll,
  id,
  className,
}: BlogGridProps) {
  const card = (p: Post, featured: boolean) => (
    <a
      href={sitePath(p.href)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border border-ink-700 bg-ink-850/60",
        "transition-colors hover:border-ink-600",
        featured && "sm:col-span-2 sm:flex-row",
      )}
    >
      <div
        className={cn(
          "shrink-0 overflow-hidden bg-ink-800",
          featured ? "sm:w-1/2" : "",
        )}
      >
        {p.image ? (
          <img
            src={p.image}
            alt=""
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
              featured ? "aspect-[16/10] sm:h-full" : "aspect-[16/9]",
            )}
          />
        ) : (
          <div
            aria-hidden="true"
            className={cn(
              "w-full bg-[radial-gradient(ellipse_at_30%_25%,var(--color-brand-600)_0%,transparent_60%),radial-gradient(ellipse_at_75%_75%,var(--color-accent-500)_0%,transparent_60%)] opacity-60",
              featured ? "aspect-[16/10] sm:h-full" : "aspect-[16/9]",
            )}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-400">
          {p.category && (
            <span className="rounded-full bg-brand-500/15 px-2 py-0.5 font-medium text-brand-200">
              {p.category}
            </span>
          )}
          {p.date && <time dateTime={p.date}>{formatDate(p.date)}</time>}
          {p.readingTime && <span>· {p.readingTime}</span>}
        </div>

        <h3
          className={cn(
            "mt-3 font-semibold tracking-tight text-ink-0",
            featured ? "text-xl sm:text-2xl" : "text-base",
          )}
        >
          {p.title}
        </h3>

        {p.excerpt && (
          <p className="mt-2 text-[14px] leading-relaxed text-ink-300">
            {p.excerpt}
          </p>
        )}

        {p.author && (
          <div className="mt-auto flex items-center gap-2 pt-5">
            {p.author.avatar ? (
              <img
                src={p.author.avatar}
                alt=""
                className="size-6 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid size-6 place-items-center rounded-full bg-white/10 text-[10px] font-semibold text-ink-200"
              >
                {p.author.name[0]}
              </span>
            )}
            <span className="text-[13px] text-ink-400">{p.author.name}</span>
          </div>
        )}
      </div>
    </a>
  );

  return (
    <Section id={id} className={className}>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="left"
            className="max-w-xl"
          />
          {viewAll && (
            <Button href={viewAll.href} variant="secondary" size="sm">
              {viewAll.label}
            </Button>
          )}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal
              key={i}
              delay={i * 60}
              className={cn("h-full", featureFirst && i === 0 && "sm:col-span-2")}
            >
              {card(p, featureFirst && i === 0)}
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
