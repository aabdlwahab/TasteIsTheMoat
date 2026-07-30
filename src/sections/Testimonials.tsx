import type { ReactNode } from "react";
import { Container, Section, SectionHeading } from "../ui/primitives";
import { Marquee } from "../ui/Marquee";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";

export interface Testimonial {
  quote: ReactNode;
  name: string;
  role?: string;
  /** Avatar image URL. Falls back to initials when omitted. */
  avatar?: string;
  /** Company logo or wordmark, shown in the featured variant. */
  logo?: ReactNode;
}

export interface TestimonialsProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  testimonials: Testimonial[];
  /**
   * `grid` — a wall of quotes, the workhorse.
   * `featured` — one large quote, for when you have a great one.
   * `marquee` — continuous scroll, good for many short quotes.
   */
  variant?: "grid" | "featured" | "marquee";
  id?: string;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ t, size = 40 }: { t: Testimonial; size?: number }) {
  return t.avatar ? (
    <img
      src={t.avatar}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-200 ring-1 ring-inset ring-brand-400/25"
      style={{ width: size, height: size }}
    >
      {initials(t.name)}
    </span>
  );
}

function Attribution({ t, size }: { t: Testimonial; size?: number }) {
  return (
    <figcaption className="mt-5 flex items-center gap-3">
      <Avatar t={t} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink-0">
          {t.name}
        </span>
        {t.role && (
          <span className="block truncate text-[13px] text-ink-400">
            {t.role}
          </span>
        )}
      </span>
    </figcaption>
  );
}

/**
 * Social proof in quote form.
 *
 * Uses `figure`/`blockquote`/`figcaption` so each quote is a properly
 * attributed unit rather than a floating string of text.
 */
export function Testimonials({
  eyebrow = "Testimonials",
  title = "What teams say",
  description,
  testimonials,
  variant = "grid",
  id,
  className,
}: TestimonialsProps) {
  const card = (t: Testimonial, i: number) => (
    <figure
      key={i}
      className={cn(
        "flex h-full flex-col rounded-card border border-ink-700 bg-ink-850/60 p-6",
        variant === "marquee" && "mr-5 w-[340px] shrink-0",
      )}
    >
      <blockquote className="text-[15px] leading-relaxed text-ink-200">
        {t.quote}
      </blockquote>
      <div className="mt-auto">
        <Attribution t={t} />
      </div>
    </figure>
  );

  if (variant === "featured") {
    const t = testimonials[0];
    if (!t) return null;
    return (
      <Section id={id} className={className}>
        <Container className="max-w-3xl">
          <figure className="text-center">
            {t.logo && (
              <div className="mb-8 flex justify-center opacity-70">{t.logo}</div>
            )}
            <Reveal>
              <blockquote className="text-balance text-2xl font-medium leading-snug tracking-tight text-ink-0 sm:text-3xl">
                {t.quote}
              </blockquote>
            </Reveal>
            <Reveal delay={80}>
              <div className="mt-8 flex justify-center">
                <Attribution t={t} size={48} />
              </div>
            </Reveal>
          </figure>
        </Container>
      </Section>
    );
  }

  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        {variant === "marquee" ? (
          <div className="mt-14">
            <Marquee duration={48}>{testimonials.map(card)}</Marquee>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 70} className="h-full">
                {card(t, i)}
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
