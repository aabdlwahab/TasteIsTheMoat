import { useEffect, useState, type ReactNode } from "react";
import { Button } from "../ui/primitives";
import { cn } from "../ui/cn";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavProps {
  logo?: ReactNode;
  links?: NavLink[];
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Start transparent over the hero and solidify on scroll. */
  transparentUntilScroll?: boolean;
  className?: string;
}

/**
 * Sticky site header.
 *
 * Starts transparent so the hero shader shows through, then fades in a blurred
 * background once the page scrolls — the standard marketing-site behaviour. The
 * mobile menu is a real disclosure with `aria-expanded`, and it locks body
 * scroll while open so the page behind cannot be scrolled away.
 */
export function Nav({
  logo,
  links = [],
  cta,
  secondaryCta,
  transparentUntilScroll = true,
  className,
}: NavProps) {
  const [scrolled, setScrolled] = useState(!transparentUntilScroll);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!transparentUntilScroll) return;
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentUntilScroll]);

  // Prevent the page scrolling underneath the open mobile menu.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Escape closes the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
        className,
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6"
      >
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2.5 text-[15px] font-semibold text-ink-0"
        >
          {logo ?? (
            <>
              <span className="size-7 rounded-lg bg-[conic-gradient(from_210deg,var(--color-brand-500),var(--color-brand-300),var(--color-accent-400),var(--color-brand-500))]" />
              shaderbg
            </>
          )}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l, i) => (
            <li key={i}>
              <a
                href={l.href}
                className="text-sm text-ink-300 transition-colors hover:text-ink-0"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {secondaryCta && (
            <Button href={secondaryCta.href} variant="ghost" size="sm">
              {secondaryCta.label}
            </Button>
          )}
          {cta && (
            <Button href={cta.href} variant="primary" size="sm">
              {cta.label}
            </Button>
          )}
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="sbg-mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-lg text-ink-100 hover:bg-white/10 md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {menuOpen ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div
          id="sbg-mobile-menu"
          className="border-t border-white/10 bg-ink-950/95 px-6 py-5 backdrop-blur-xl md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-2 py-3 text-[15px] text-ink-100 hover:bg-white/8"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            {secondaryCta && (
              <Button href={secondaryCta.href} variant="secondary">
                {secondaryCta.label}
              </Button>
            )}
            {cta && <Button href={cta.href}>{cta.label}</Button>}
          </div>
        </div>
      )}
    </header>
  );
}
