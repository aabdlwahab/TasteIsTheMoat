import { useState, type ReactNode } from "react";
import { ShaderSection, type ScrimStrength } from "../ui/ShaderSection";
import { Button, Container } from "../ui/primitives";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";
import type { BrandPalette } from "../core/theme";
import type { ShaderDef } from "../core/types";

export interface WaitlistProps {
  shader?: string | ShaderDef;
  brand?: BrandPalette;
  scrim?: ScrimStrength;
  title: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  cta?: string;
  note?: ReactNode;
  /** Message shown after a successful submit. */
  successMessage?: ReactNode;
  /**
   * Handle the submission. Throw or reject to surface an error. Left undefined,
   * the form simulates success so the section can be demoed as-is.
   */
  onSubmit?: (email: string) => void | Promise<void>;
  id?: string;
  className?: string;
}

type Status = "idle" | "submitting" | "done" | "error";

/**
 * Email capture over a shader.
 *
 * Real form semantics: a labelled input with `type="email"`, `autoComplete`,
 * inline validation from the browser, a disabled state while in flight, and a
 * `role="status"` region so the result is announced rather than only shown.
 */
export function Waitlist({
  shader = "aurora",
  brand,
  scrim = "strong",
  title,
  description,
  placeholder = "you@company.com",
  cta = "Join the waitlist",
  note,
  successMessage = "You're on the list — we'll be in touch.",
  onSubmit,
  id,
  className,
}: WaitlistProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem(
      "email",
    ) as HTMLInputElement | null;
    const email = input?.value.trim();
    if (!email) return;

    setStatus("submitting");
    setError(null);
    try {
      await onSubmit?.(email);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <ShaderSection
      id={id}
      shader={shader}
      brand={brand}
      scrim={scrim}
      className={className}
      contentClassName="py-24 sm:py-32"
    >
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink-0 sm:text-4xl">
              {title}
            </h2>
          </Reveal>
          {description && (
            <Reveal delay={70}>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-200/90">
                {description}
              </p>
            </Reveal>
          )}

          <Reveal delay={140}>
            {status === "done" ? (
              <p
                role="status"
                className="mt-8 rounded-[10px] border border-brand-400/40 bg-brand-500/12 px-4 py-3.5 text-[15px] text-ink-0"
              >
                {successMessage}
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 flex flex-col gap-2 sm:flex-row"
              >
                <label htmlFor="sbg-waitlist" className="sr-only">
                  Email address
                </label>
                <input
                  id="sbg-waitlist"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={placeholder}
                  disabled={status === "submitting"}
                  className={cn(
                    "h-12 min-w-0 flex-1 rounded-[10px] px-4 text-[15px]",
                    "bg-white/10 text-ink-0 ring-1 ring-inset ring-white/20 backdrop-blur-sm",
                    "placeholder:text-ink-300/70 outline-none",
                    "focus:ring-2 focus:ring-brand-300 disabled:opacity-60",
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Joining…" : cta}
                </Button>
              </form>
            )}
          </Reveal>

          {status === "error" && error && (
            <p role="alert" className="mt-3 text-sm text-[#ffb3bd]">
              {error}
            </p>
          )}

          {note && status !== "done" && (
            <Reveal delay={200}>
              <p className="mt-4 text-sm text-ink-300/80">{note}</p>
            </Reveal>
          )}
        </div>
      </Container>
    </ShaderSection>
  );
}
