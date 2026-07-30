import { useState, type FormEvent, type ReactNode } from "react";
import type { BrandPalette } from "../core/theme";
import type { ShaderDef } from "../core/types";
import { ShaderSection, type ScrimStrength } from "../ui/ShaderSection";
import { Container } from "../ui/primitives";
import { cn } from "../ui/cn";

export interface NewsletterProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  buttonLabel?: string;
  note?: ReactNode;
  onSubmit?: (email: string) => void | Promise<void>;
  variant?: "centered" | "split";
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  scrim?: ScrimStrength;
  id?: string;
  className?: string;
}

/** Dedicated newsletter/lead-capture section with a small success state. */
export function Newsletter({
  eyebrow = "Newsletter",
  title,
  description,
  placeholder = "you@company.com",
  buttonLabel = "Subscribe",
  note,
  onSubmit,
  variant = "split",
  shader,
  brand,
  scrim = "strong",
  id,
  className,
}: NewsletterProps) {
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    await onSubmit?.(email);
    setSubmitted(true);
  }

  return (
    <ShaderSection
      id={id}
      shader={shader}
      brand={brand}
      scrim={scrim}
      className={cn("bg-ink-900", className)}
      contentClassName="py-20 sm:py-24"
    >
      <Container>
        <div
          className={cn(
            "gap-8",
            variant === "split"
              ? "grid items-end lg:grid-cols-[1fr_0.8fr]"
              : "mx-auto max-w-2xl text-center",
          )}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-0 sm:text-4xl">
              {title}
            </h2>
            {description && (
              <p
                className={cn(
                  "mt-4 text-base leading-relaxed text-ink-300",
                  variant === "centered" && "mx-auto max-w-xl",
                )}
              >
                {description}
              </p>
            )}
          </div>
          <div className={cn(variant === "centered" && "mt-8")}>
            {submitted ? (
              <div
                role="status"
                className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100"
              >
                You’re on the list. Check your inbox for confirmation.
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor={`${id ?? "newsletter"}-email`} className="sr-only">
                  Email address
                </label>
                <input
                  id={`${id ?? "newsletter"}-email`}
                  name="email"
                  type="email"
                  required
                  placeholder={placeholder}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-ink-950/75 px-4 text-[15px] text-ink-0 outline-none placeholder:text-ink-400 focus:border-brand-300"
                />
                <button
                  type="submit"
                  className="h-12 rounded-xl bg-ink-0 px-5 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                >
                  {buttonLabel}
                </button>
              </form>
            )}
            {note && <p className="mt-3 text-xs text-ink-400">{note}</p>}
          </div>
        </div>
      </Container>
    </ShaderSection>
  );
}
