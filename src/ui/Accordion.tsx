import { useId, useState, type ReactNode } from "react";
import { cn } from "./cn";

export interface AccordionItem {
  question: ReactNode;
  answer: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Index open on first render. Use -1 for all closed. */
  defaultOpen?: number;
  /** Allow more than one panel open at a time. */
  multiple?: boolean;
  className?: string;
}

/**
 * Disclosure list for FAQs.
 *
 * Built on real buttons with `aria-expanded` / `aria-controls` so it is
 * keyboard- and screen-reader-navigable. Panels are unmounted when closed
 * rather than hidden with CSS, which keeps closed answers out of the
 * accessibility tree and out of the tab order.
 */
export function Accordion({
  items,
  defaultOpen = 0,
  multiple = false,
  className,
}: AccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<number[]>(
    defaultOpen >= 0 ? [defaultOpen] : [],
  );

  function toggle(i: number) {
    setOpen((prev) => {
      const isOpen = prev.includes(i);
      if (multiple) {
        return isOpen ? prev.filter((x) => x !== i) : [...prev, i];
      }
      return isOpen ? [] : [i];
    });
  }

  return (
    <div className={cn("divide-y divide-ink-700 border-y border-ink-700", className)}>
      {items.map((item, i) => {
        const isOpen = open.includes(i);
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={i}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 py-5 text-left",
                  "text-base font-medium text-ink-0 transition-colors hover:text-brand-300",
                  "outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                )}
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border border-ink-600 text-ink-300 transition-transform duration-200",
                    isOpen && "rotate-45",
                  )}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path
                      d="M5.5 1v9M1 5.5h9"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="pb-5 pr-10 text-[15px] leading-relaxed text-ink-300"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
