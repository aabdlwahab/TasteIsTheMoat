import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "./cn";

export interface RevealProps {
  children: ReactNode;
  /** Stagger in milliseconds, for revealing a list one item at a time. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "span";
}

/**
 * How long to wait before revealing unconditionally. If the observer never
 * fires — a throttled background tab, an interrupted transition, an unexpected
 * layout — the content must still appear. Marketing copy being permanently
 * invisible is a far worse failure than a missed animation.
 */
const SAFETY_MS = 1500;

/**
 * Reveals children when they scroll into view.
 *
 * Deliberately fails open. Three independent paths can reveal the content:
 * an IntersectionObserver, an immediate check for elements already on screen
 * at mount, and a safety timeout. The last two skip the transition and snap
 * straight to visible, because a late fallback should not animate.
 *
 * `prefers-reduced-motion` skips the animation entirely, and a `<noscript>`
 * rule in theme.css unhides everything when JS never runs at all.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let revealed = false;
    /** `snap` skips the transition — used for fallback paths. */
    const reveal = (snap: boolean) => {
      if (revealed) return;
      revealed = true;
      if (snap) el.dataset.revealSnap = "";
      el.dataset.reveal = "shown";
    };

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      reveal(true);
      return;
    }

    const timers: number[] = [];

    // Already on screen at mount: reveal without waiting for the observer,
    // which may not deliver a callback for elements that never intersect anew.
    const rect = el.getBoundingClientRect();
    const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
    if (onScreen) {
      timers.push(window.setTimeout(() => reveal(false), delay));
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          timers.push(window.setTimeout(() => reveal(false), delay));
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);

    // Last resort.
    timers.push(window.setTimeout(() => reveal(true), SAFETY_MS + delay));

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [delay]);

  return (
    <Tag ref={ref as never} data-reveal="pending" className={cn(className)}>
      {children}
    </Tag>
  );
}
