import { useState, type FormEvent, type ReactNode } from "react";
import { sitePath } from "../core/sitePath";
import { Button, Container, Section, SectionHeading } from "../ui/primitives";
import { cn } from "../ui/cn";

export interface ContactMethod {
  label: string;
  value: ReactNode;
  href?: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  company: string;
  message: string;
}

export interface ContactProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  methods?: ContactMethod[];
  topics?: string[];
  buttonLabel?: string;
  onSubmit?: (submission: ContactSubmission) => void | Promise<void>;
  id?: string;
  className?: string;
}

/** Contact or book-a-demo section with a compact, production-shaped form. */
export function Contact({
  eyebrow = "Contact",
  title,
  description,
  methods = [],
  topics = ["Product demo", "Pricing", "Partnership", "Support"],
  buttonLabel = "Send message",
  onSubmit,
  id,
  className,
}: ContactProps) {
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await onSubmit?.({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? ""),
      message: String(data.get("message") ?? ""),
    });
    setSent(true);
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-[15px] text-ink-0 outline-none placeholder:text-ink-500 focus:border-brand-400";

  return (
    <Section id={id} className={className}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              description={description}
              align="left"
            />
            {methods.length > 0 && (
              <dl className="mt-10 grid gap-5">
                {methods.map((method) => (
                  <div key={method.label}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                      {method.label}
                    </dt>
                    <dd className="mt-1 text-[15px] text-ink-200">
                      {method.href ? (
                        <a
                          href={sitePath(method.href)}
                          className="transition-colors hover:text-brand-200"
                        >
                          {method.value}
                        </a>
                      ) : (
                        method.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="rounded-3xl border border-ink-700 bg-ink-850/70 p-6 sm:p-8">
            {sent ? (
              <div
                role="status"
                className="grid min-h-[380px] place-items-center text-center"
              >
                <div>
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-400/12 text-emerald-200">
                    ✓
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-ink-0">
                    Message received
                  </h3>
                  <p className="mt-2 text-sm text-ink-400">
                    We’ll get back to you within one business day.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-medium text-ink-200">
                    Name
                    <input
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Alex Morgan"
                      className={fieldClass}
                    />
                  </label>
                  <label className="text-sm font-medium text-ink-200">
                    Work email
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="alex@company.com"
                      className={fieldClass}
                    />
                  </label>
                  <label className="text-sm font-medium text-ink-200">
                    Company
                    <input
                      name="company"
                      autoComplete="organization"
                      placeholder="Company name"
                      className={fieldClass}
                    />
                  </label>
                  <label className="text-sm font-medium text-ink-200">
                    Topic
                    <select name="topic" className={cn(fieldClass, "appearance-none")}>
                      {topics.map((topic) => (
                        <option key={topic}>{topic}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-5 block text-sm font-medium text-ink-200">
                  How can we help?
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us what you are building..."
                    className={cn(fieldClass, "resize-y")}
                  />
                </label>
                <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
                  {buttonLabel}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
