import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

/* ---- Container ---------------------------------------------------------- */

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>
      {children}
    </div>
  );
}

/* ---- Section ------------------------------------------------------------ */

/** Plain (shader-free) section with consistent vertical rhythm. */
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-28", className)}>
      {children}
    </section>
  );
}

/* ---- SectionHeading ----------------------------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink-0 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-ink-300 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

/* ---- Button ------------------------------------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-0 text-ink-950 hover:bg-ink-100 shadow-lg shadow-black/20",
  secondary:
    "bg-white/10 text-ink-0 ring-1 ring-inset ring-white/20 hover:bg-white/15 backdrop-blur-sm",
  ghost: "text-ink-100 hover:bg-white/10",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render as an anchor instead of a button. */
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] font-semibold",
    "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
    "disabled:pointer-events-none disabled:opacity-50",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className,
  );
  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

/* ---- Badge -------------------------------------------------------------- */

export function Badge({
  className,
  children,
  href,
}: {
  className?: string;
  children: ReactNode;
  href?: string;
}) {
  const classes = cn(
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
    "bg-white/8 text-ink-100 ring-1 ring-inset ring-white/15 backdrop-blur-sm",
    href && "transition-colors hover:bg-white/15",
    className,
  );
  return href ? (
    <a href={href} className={classes}>
      {children}
    </a>
  ) : (
    <span className={classes}>{children}</span>
  );
}

/* ---- Card --------------------------------------------------------------- */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-ink-700 bg-ink-850/80 p-6 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---- GradientText ------------------------------------------------------- */

/**
 * Headline text filled with a brand gradient. Uses background-clip so the fill
 * follows the glyphs; the surrounding text colour is the fallback.
 */
export function GradientText({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400 bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}
