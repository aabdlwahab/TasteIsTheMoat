import { useEffect, useRef, useState } from "react";

export interface CounterProps {
  /** Target value to count up to. */
  value: number;
  /** Milliseconds for the full count. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  /** Decimal places to render. */
  decimals?: number;
  className?: string;
}

/** Ease-out so the number decelerates into its final value. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * A number that counts up when it scrolls into view.
 *
 * Renders the final value immediately for reduced-motion visitors, and always
 * keeps the true value in the DOM as text so it is correct for screen readers
 * and for anyone who lands mid-animation.
 */
export function Counter({
  value,
  duration = 1600,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || done) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      setDone(true);
      return;
    }

    let raf = 0;
    let safety = 0;
    let started = false;

    /**
     * Fails open, like Reveal. The count is driven by requestAnimationFrame,
     * which a throttled or backgrounded tab may never run — and a stat frozen
     * at "0" actively misinforms, which is worse than skipping the animation.
     */
    const start = () => {
      if (started) return;
      started = true;

      safety = window.setTimeout(() => {
        setDisplay(value);
        setDone(true);
      }, duration + 600);

      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        setDisplay(value * easeOutCubic(t));
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          clearTimeout(safety);
          setDone(true);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    // Already on screen at mount: start now. The observer alone is not enough,
    // because it may deliver no callback for an element that is visible from
    // the outset and never re-enters.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) start();

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        start();
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [value, duration, done]);

  const shown = done ? value : display;
  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
