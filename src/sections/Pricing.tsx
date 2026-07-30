import { useState, type ReactNode } from "react";
import { Button, Container, Section, SectionHeading } from "../ui/primitives";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";

export interface PricingTier {
  name: string;
  /** Monthly price in whole currency units. Use `null` for "Custom". */
  monthly: number | null;
  /**
   * Annual price *per month* when billed yearly. Omit to derive a discount
   * from `annualDiscount`.
   */
  annual?: number | null;
  description: ReactNode;
  features: ReactNode[];
  cta: { label: string; href: string };
  /** Visually promote this tier. */
  featured?: boolean;
  /** Replaces the price with free text, e.g. "Let's talk". */
  customLabel?: string;
}

export interface PricingProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  tiers: PricingTier[];
  currency?: string;
  /** Fractional discount applied to monthly when billed annually. */
  annualDiscount?: number;
  /** Show the monthly/annual switch. */
  showToggle?: boolean;
  id?: string;
  className?: string;
}

function Check() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="mt-0.5 shrink-0 text-brand-300"
    >
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Pricing tiers with a monthly/annual switch.
 *
 * The annual price is per-month-billed-annually (the convention buyers expect),
 * derived from `annualDiscount` unless a tier states it explicitly. The toggle
 * is a real checkbox-style switch with `role="switch"` so it is operable by
 * keyboard and announced correctly.
 */
export function Pricing({
  eyebrow = "Pricing",
  title = "Simple, predictable pricing",
  description,
  tiers,
  currency = "$",
  annualDiscount = 0.2,
  showToggle = true,
  id,
  className,
}: PricingProps) {
  const [annual, setAnnual] = useState(false);

  function priceFor(tier: PricingTier): string | null {
    if (tier.monthly === null) return null;
    if (!annual) return String(tier.monthly);
    const yearly =
      tier.annual !== undefined && tier.annual !== null
        ? tier.annual
        : Math.round(tier.monthly * (1 - annualDiscount));
    return String(yearly);
  }

  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {showToggle && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm transition-colors",
                annual ? "text-ink-400" : "text-ink-0",
              )}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Bill annually"
              onClick={() => setAnnual((v) => !v)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                annual ? "bg-brand-500" : "bg-ink-600",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                  annual ? "translate-x-[22px]" : "translate-x-0.5",
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm transition-colors",
                annual ? "text-ink-0" : "text-ink-400",
              )}
            >
              Annual
            </span>
            <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-inset ring-brand-400/25">
              Save {Math.round(annualDiscount * 100)}%
            </span>
          </div>
        )}

        <div
          className={cn(
            "mt-12 grid gap-6",
            tiers.length === 2 && "sm:grid-cols-2 lg:max-w-4xl lg:mx-auto",
            tiers.length === 3 && "lg:grid-cols-3",
            tiers.length >= 4 && "sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {tiers.map((tier, i) => {
            const price = priceFor(tier);
            return (
              <Reveal key={tier.name} delay={i * 70}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-card border p-6",
                    tier.featured
                      ? "border-brand-400/50 bg-brand-500/8 ring-1 ring-brand-400/30"
                      : "border-ink-700 bg-ink-850/60",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-ink-0">
                      {tier.name}
                    </h3>
                    {tier.featured && (
                      <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        Most popular
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    {price === null ? (
                      <span className="text-3xl font-semibold tracking-tight text-ink-0">
                        {tier.customLabel ?? "Custom"}
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-semibold tracking-tight text-ink-0">
                          {currency}
                          {price}
                        </span>
                        <span className="text-sm text-ink-400">/mo</span>
                      </>
                    )}
                  </div>
                  {price !== null && annual && (
                    <p className="mt-1 text-xs text-ink-400">billed annually</p>
                  )}

                  <p className="mt-4 text-[15px] leading-relaxed text-ink-300">
                    {tier.description}
                  </p>

                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex gap-2.5 text-[15px] text-ink-200">
                        <Check />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    href={tier.cta.href}
                    variant={tier.featured ? "primary" : "secondary"}
                    className="mt-7 w-full"
                  >
                    {tier.cta.label}
                  </Button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
