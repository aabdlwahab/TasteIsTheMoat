import type { ReactNode } from "react";
import { sitePath } from "../core/sitePath";
import { Button, Container } from "../ui/primitives";
import { cn } from "../ui/cn";
import { BrandMark } from "../ui/BrandMark";

export interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface FooterProps {
  logo?: ReactNode;
  tagline?: ReactNode;
  columns?: FooterColumn[];
  /** Show the newsletter capture block. */
  newsletter?: {
    heading: ReactNode;
    description?: ReactNode;
    placeholder?: string;
    cta?: string;
    onSubmit?: (email: string) => void;
  };
  social?: { label: string; href: string; icon: ReactNode }[];
  legal?: ReactNode;
  className?: string;
}

export function Footer({
  logo,
  tagline,
  columns = [],
  newsletter,
  social = [],
  legal,
  className,
}: FooterProps) {
  return (
    <footer className={cn("border-t border-ink-700 bg-ink-950", className)}>
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5 text-[15px] font-semibold text-ink-0">
              {logo ?? (
                <>
                  <BrandMark className="size-7 text-brand-400" />
                  Taste is the Moat
                </>
              )}
            </div>
            {tagline && (
              <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-400">
                {tagline}
              </p>
            )}

            {newsletter && (
              <form
                className="mt-8 max-w-sm"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem(
                    "email",
                  ) as HTMLInputElement | null;
                  if (input) newsletter.onSubmit?.(input.value);
                }}
              >
                <label
                  htmlFor="sbg-newsletter"
                  className="block text-sm font-medium text-ink-100"
                >
                  {newsletter.heading}
                </label>
                {newsletter.description && (
                  <p className="mt-1 text-[13px] text-ink-400">
                    {newsletter.description}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <input
                    id="sbg-newsletter"
                    name="email"
                    type="email"
                    required
                    placeholder={newsletter.placeholder ?? "you@company.com"}
                    className={cn(
                      "h-11 min-w-0 flex-1 rounded-[10px] border border-ink-700 bg-ink-850 px-3.5 text-[15px] text-ink-0",
                      "placeholder:text-ink-400 outline-none focus:border-brand-400",
                    )}
                  />
                  <Button type="submit">{newsletter.cta ?? "Subscribe"}</Button>
                </div>
              </form>
            )}
          </div>

          {columns.length > 0 && (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {columns.map((col) => (
                <div key={col.heading}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
                    {col.heading}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-3">
                    {/* Keyed by index, not href: placeholder hrefs like "#"
                        repeat across a nav and would collide. */}
                    {col.links.map((l, i) => (
                      <li key={i}>
                        <a
                          href={sitePath(l.href)}
                          className="text-[15px] text-ink-300 transition-colors hover:text-ink-0"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-14 flex flex-col-reverse items-center justify-between gap-6 border-t border-ink-700 pt-8 sm:flex-row">
          <p className="text-[13px] text-ink-400">
            {legal ?? `© ${new Date().getFullYear()} Taste is the Moat. All rights reserved.`}
          </p>
          {social.length > 0 && (
            <ul className="flex items-center gap-2">
              {social.map((s, i) => (
                <li key={i}>
                  <a
                    href={sitePath(s.href)}
                    aria-label={s.label}
                    className="grid size-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white/8 hover:text-ink-0"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </footer>
  );
}
