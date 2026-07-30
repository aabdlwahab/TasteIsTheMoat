import type { ReactNode } from "react";
import { Container, Section } from "../ui/primitives";
import { Marquee } from "../ui/Marquee";
import { cn } from "../ui/cn";

export interface LogoCloudProps {
  /** Heading above the logos. */
  label?: ReactNode;
  /**
   * Logos. Pass SVG nodes for real brands; strings render as wordmarks, which
   * is a reasonable placeholder while design catches up.
   */
  logos: ReactNode[];
  /** `marquee` scrolls continuously — better past ~6 logos. */
  variant?: "grid" | "marquee";
  className?: string;
}

/**
 * Social-proof logo strip.
 *
 * Logos are desaturated and dimmed by default and come up to full strength on
 * hover, which keeps them from competing with the hero for attention while
 * still reading as credibility.
 */
export function LogoCloud({
  label = "Trusted by teams shipping fast",
  logos,
  variant = "grid",
  className,
}: LogoCloudProps) {
  const item = (logo: ReactNode, i: number) => (
    <div
      key={i}
      className={cn(
        "flex items-center justify-center opacity-55 grayscale transition duration-300",
        "hover:opacity-100 hover:grayscale-0",
        variant === "marquee" ? "px-9" : "px-2",
      )}
    >
      {typeof logo === "string" ? (
        <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-ink-100">
          {logo}
        </span>
      ) : (
        logo
      )}
    </div>
  );

  return (
    <Section className={cn("py-14 sm:py-16", className)}>
      <Container>
        {label && (
          <p className="mb-9 text-center text-xs font-medium uppercase tracking-[0.14em] text-ink-400">
            {label}
          </p>
        )}
        {variant === "marquee" ? (
          <Marquee duration={34}>{logos.map(item)}</Marquee>
        ) : (
          <div className="grid grid-cols-2 items-center gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {logos.map(item)}
          </div>
        )}
      </Container>
    </Section>
  );
}
