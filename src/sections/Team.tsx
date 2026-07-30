import type { ReactNode } from "react";
import { Container, Section, SectionHeading } from "../ui/primitives";
import { Reveal } from "../ui/Reveal";
import { cn } from "../ui/cn";

export interface TeamMember {
  name: string;
  role: string;
  /** Photo URL. Falls back to initials on a brand-tinted tile. */
  photo?: string;
  bio?: ReactNode;
  links?: { label: string; href: string; icon?: ReactNode }[];
}

export interface TeamProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  members: TeamMember[];
  /** `grid` is photo-forward; `list` gives room for bios. */
  variant?: "grid" | "list";
  id?: string;
  className?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Photo({ m, rounded }: { m: TeamMember; rounded: string }) {
  return m.photo ? (
    <img
      src={m.photo}
      alt={m.name}
      className={cn("h-full w-full object-cover", rounded)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-full w-full place-items-center bg-brand-500/15 text-xl font-semibold text-brand-200",
        rounded,
      )}
    >
      {initials(m.name)}
    </span>
  );
}

export function Team({
  eyebrow = "Team",
  title = "The people behind it",
  description,
  members,
  variant = "grid",
  id,
  className,
}: TeamProps) {
  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <ul
          className={cn(
            "mt-14 grid gap-8",
            variant === "grid"
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "sm:grid-cols-2",
          )}
        >
          {members.map((m, i) => (
            <Reveal as="li" key={i} delay={i * 60}>
              {variant === "grid" ? (
                <div>
                  <div className="aspect-square w-full overflow-hidden rounded-card border border-ink-700">
                    <Photo m={m} rounded="" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink-0">
                    {m.name}
                  </h3>
                  <p className="text-[13px] text-ink-400">{m.role}</p>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-full border border-ink-700">
                    <Photo m={m} rounded="rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-ink-0">
                      {m.name}
                    </h3>
                    <p className="text-[13px] text-ink-400">{m.role}</p>
                    {m.bio && (
                      <p className="mt-2 text-[14px] leading-relaxed text-ink-300">
                        {m.bio}
                      </p>
                    )}
                    {m.links && m.links.length > 0 && (
                      <ul className="mt-3 flex gap-2">
                        {m.links.map((l, j) => (
                          <li key={j}>
                            <a
                              href={l.href}
                              aria-label={`${m.name} on ${l.label}`}
                              className="grid size-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white/8 hover:text-ink-0"
                            >
                              {l.icon ?? l.label[0]}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
