import type { ReactNode } from "react";
import { sitePath } from "../core/sitePath";
import { StatusBadge } from "../ui/StatusBadge";
import { Container, Section, SectionHeading } from "../ui/primitives";
import { cn } from "../ui/cn";

export interface Release {
  version: string;
  date: string;
  title: ReactNode;
  description?: ReactNode;
  changes?: ReactNode[];
  status?: string;
  href?: string;
}

export interface ChangelogProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  releases: Release[];
  id?: string;
  className?: string;
}

/** Release timeline for product launches, roadmap updates, and changelogs. */
export function Changelog({
  eyebrow = "Changelog",
  title,
  description,
  releases,
  id,
  className,
}: ChangelogProps) {
  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
        />
        <div className="mt-12 max-w-4xl border-l border-ink-700 pl-6 sm:pl-10">
          {releases.map((release, index) => (
            <article
              key={`${release.version}-${release.date}`}
              className={cn(
                "relative py-8 first:pt-0",
                index < releases.length - 1 && "border-b border-ink-800",
              )}
            >
              <span
                aria-hidden="true"
                className="absolute -left-[31px] top-9 size-3 rounded-full border-2 border-ink-950 bg-brand-300 sm:-left-[47px]"
              />
              <div className="flex flex-wrap items-center gap-3">
                <code className="rounded-md bg-brand-400/12 px-2 py-1 font-mono text-xs text-brand-200">
                  {release.version}
                </code>
                <time className="text-xs text-ink-500">{release.date}</time>
                {release.status && (
                  <StatusBadge tone="info">{release.status}</StatusBadge>
                )}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-ink-0">
                {release.href ? (
                  <a href={sitePath(release.href)} className="hover:text-brand-200">
                    {release.title}
                  </a>
                ) : (
                  release.title
                )}
              </h3>
              {release.description && (
                <p className="mt-2 leading-relaxed text-ink-400">
                  {release.description}
                </p>
              )}
              {release.changes && (
                <ul className="mt-5 grid gap-2">
                  {release.changes.map((change, changeIndex) => (
                    <li
                      key={changeIndex}
                      className="flex gap-3 text-sm text-ink-300"
                    >
                      <span aria-hidden="true" className="text-brand-300">
                        +
                      </span>
                      {change}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
