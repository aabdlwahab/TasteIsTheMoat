import { Fragment, type ReactNode } from "react";
import { Container, Section, SectionHeading } from "../ui/primitives";
import { cn } from "../ui/cn";

/** `true`/`false` render as icons; a string renders as text. */
export type CellValue = boolean | string;

export interface ComparisonRow {
  feature: ReactNode;
  /** One value per column, in the same order as `columns`. */
  values: CellValue[];
  /** Optional group heading rendered above this row. */
  group?: string;
}

export interface ComparisonProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Column headers. The first is usually you. */
  columns: string[];
  /** Index of the column to highlight. Defaults to 0. */
  highlight?: number;
  rows: ComparisonRow[];
  footnote?: ReactNode;
  id?: string;
  className?: string;
}

function Yes() {
  return (
    <svg
      role="img"
      aria-label="Included"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="mx-auto text-brand-300"
    >
      <path
        d="M4 9.5l3.2 3.2L14 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function No() {
  return (
    <svg
      role="img"
      aria-label="Not included"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="mx-auto text-ink-600"
    >
      <path
        d="M5.5 5.5l7 7M12.5 5.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Feature comparison table.
 *
 * A real `<table>` with `scope` on the headers, so the relationship between a
 * feature and a column survives in a screen reader. Boolean cells get an
 * `aria-label` via the icon rather than relying on a bare glyph. Scrolls
 * horizontally inside its own container on narrow screens instead of forcing
 * the page to scroll.
 */
export function Comparison({
  eyebrow = "Comparison",
  title = "How we compare",
  description,
  columns,
  highlight = 0,
  rows,
  footnote,
  id,
  className,
}: ComparisonProps) {
  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-[38%] pb-4 pr-4" />
                {columns.map((c, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={cn(
                      "pb-4 text-center text-sm font-semibold",
                      i === highlight ? "text-ink-0" : "text-ink-400",
                    )}
                  >
                    {i === highlight ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 ring-1 ring-inset ring-brand-400/30">
                        {c}
                      </span>
                    ) : (
                      c
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                // A group heading and its row are two <tr> siblings, so they
                // need a keyed Fragment rather than a bare one.
                <Fragment key={ri}>
                  {row.group && (
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={columns.length + 1}
                        className="pt-7 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-400"
                      >
                        {row.group}
                      </th>
                    </tr>
                  )}
                  <tr className="border-t border-ink-700">
                    <th
                      scope="row"
                      className="py-3.5 pr-4 text-[15px] font-normal text-ink-200"
                    >
                      {row.feature}
                    </th>
                    {row.values.map((v, ci) => (
                      <td
                        key={ci}
                        className={cn(
                          "py-3.5 text-center text-[15px]",
                          ci === highlight
                            ? "bg-brand-500/[0.06] text-ink-100"
                            : "text-ink-300",
                        )}
                      >
                        {typeof v === "boolean" ? v ? <Yes /> : <No /> : v}
                      </td>
                    ))}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {footnote && (
          <p className="mt-6 text-[13px] text-ink-400">{footnote}</p>
        )}
      </Container>
    </Section>
  );
}
