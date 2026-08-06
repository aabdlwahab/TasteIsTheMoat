import { useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import { cn } from "../cn";
import { usePrefersReducedMotion, useSpring } from "./internal";
import type { SpringOptions } from "./internal";

/* ---- AnimatedNumber ----------------------------------------------------- */

export interface AnimatedNumberProps {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: ElementType;
  /** Decimal places to render. */
  decimals?: number;
}

/**
 * A number that springs to each new value.
 *
 * Unlike this project's `Counter`, which counts up once when it enters the
 * viewport, this tracks `value` for the lifetime of the component — it is for
 * live figures that change, not for a stat that animates on arrival.
 *
 * The rendered text is written directly to the node rather than held in state,
 * so a fast-changing value does not re-render the tree sixty times a second.
 */
export function AnimatedNumber({
  value,
  className,
  springOptions,
  as: Component = "span",
  decimals = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  const format = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  // Captured once, so the markup is correct before JS runs and React never
  // touches this text again.
  const initialText = useRef(format(value));

  const [setSpring, jumpSpring] = useSpring(
    1,
    ([current]) => {
      const node = ref.current;
      if (node) node.textContent = format(current ?? 0);
    },
    springOptions ?? { stiffness: 120, damping: 20, mass: 0.6 },
  );
  const mounted = useRef(false);

  useEffect(() => {
    // The first value is the starting point, not something to animate to —
    // springing from zero on mount would invent a count-up this component
    // does not claim to do. `Counter` is the one that counts up.
    if (reduced || !mounted.current) {
      mounted.current = true;
      jumpSpring([value]);
      return;
    }
    setSpring([value]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced, setSpring, jumpSpring, decimals]);

  // The true value stays in the accessibility tree; the animated text is
  // decorative, so a screen reader never reads intermediate numbers.
  //
  // The visible span's text is owned entirely by the spring. Rendering
  // `{format(value)}` here instead would paint the *new* number one frame
  // before the spring's first write, so every change flashed its destination
  // and then animated up to it from behind.
  return (
    <Component className={className} aria-label={format(value)} role="text">
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {initialText.current}
      </span>
    </Component>
  );
}

/* ---- SlidingNumber ------------------------------------------------------ */

export interface SlidingNumberProps {
  value: number | string;
  /** Pad the integer part to two digits. */
  padStart?: boolean;
  decimalSeparator?: string;
  className?: string;
}

/**
 * An odometer: each digit slides to its new value.
 *
 * Every column renders 0–9 stacked and is translated to expose the right one,
 * which means the digit physically travels the distance between old and new —
 * a 3 → 7 change rolls through the digits in between, as a mechanical counter
 * would. Only digits animate; separators are static.
 */
export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = ".",
  className,
}: SlidingNumberProps) {
  const text = String(value);
  const [integer = "", fraction] = text.split(".");
  const paddedInteger = padStart && integer.length < 2 ? integer.padStart(2, "0") : integer;

  return (
    <span className={cn("inline-flex items-center tabular-nums", className)} aria-label={text}>
      {Array.from(paddedInteger).map((char, index) => (
        <Digit key={`i-${index}`} char={char} />
      ))}
      {fraction !== undefined && (
        <>
          <span aria-hidden="true">{decimalSeparator}</span>
          {Array.from(fraction).map((char, index) => (
            <Digit key={`f-${index}`} char={char} />
          ))}
        </>
      )}
    </span>
  );
}

function Digit({ char }: { char: string }) {
  const digit = Number.parseInt(char, 10);
  const reduced = usePrefersReducedMotion();

  // Anything that isn't a digit — a comma, a currency symbol, a minus sign —
  // has no column to roll through, so it renders as plain static text.
  if (Number.isNaN(digit)) {
    return <span aria-hidden="true">{char}</span>;
  }

  return <DigitColumn digit={digit} reduced={reduced} />;
}

function DigitColumn({ digit, reduced }: { digit: number; reduced: boolean }) {
  const [height, setHeight] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const read = () => setHeight(el.offsetHeight);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <span
      aria-hidden="true"
      className="relative inline-block overflow-hidden"
      style={{ height: height || undefined }}
    >
      {/* Invisible sizer: gives the column a height before the roll starts. */}
      <span ref={measureRef} className="invisible block">
        0
      </span>
      <span
        className={cn(
          "absolute inset-x-0 top-0 flex flex-col",
          !reduced && "transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        )}
        style={{ transform: `translateY(-${digit * height}px)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block" style={{ height: height || undefined }}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}
