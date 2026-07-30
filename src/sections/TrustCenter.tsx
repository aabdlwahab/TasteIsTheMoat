import type { ReactNode } from "react";
import { StatusBadge } from "../ui/StatusBadge";
import {
  Button,
  Container,
  Section,
  SectionHeading,
} from "../ui/primitives";
import { cn } from "../ui/cn";

export interface TrustStandard {
  name: string;
  description: ReactNode;
  status?: string;
}

export interface TrustCenterProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  standards: TrustStandard[];
  commitments?: ReactNode[];
  action?: { label: string; href: string };
  status?: string;
  id?: string;
  className?: string;
}

/** Security and compliance section for the trust questions that block conversion. */
export function TrustCenter({
  eyebrow = "Security",
  title,
  description,
  standards,
  commitments = [],
  action,
  status = "All systems operational",
  id,
  className,
}: TrustCenterProps) {
  return (
    <Section id={id} className={cn("bg-ink-900/45", className)}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <StatusBadge pulse>{status}</StatusBadge>
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              description={description}
              align="left"
              className="mt-6"
            />
            {commitments.length > 0 && (
              <ul className="mt-7 grid gap-3">
                {commitments.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-[15px] text-ink-200"
                  >
                    <span aria-hidden="true" className="text-emerald-300">
                      ●
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {action && (
              <Button href={action.href} variant="secondary" className="mt-8">
                {action.label}
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {standards.map((standard) => (
              <article
                key={standard.name}
                className="rounded-2xl border border-ink-700 bg-ink-850/80 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    aria-hidden="true"
                    className="grid size-11 place-items-center rounded-xl bg-emerald-400/10 font-mono text-sm font-semibold text-emerald-200"
                  >
                    {standard.name.slice(0, 2).toUpperCase()}
                  </span>
                  {standard.status && (
                    <StatusBadge tone="neutral">
                      {standard.status}
                    </StatusBadge>
                  )}
                </div>
                <h3 className="mt-5 font-semibold text-ink-0">{standard.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">
                  {standard.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
