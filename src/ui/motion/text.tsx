import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "../cn";
import { splitChars, useInViewport, usePrefersReducedMotion } from "./internal";

/**
 * Text effects.
 *
 * Every component here splits its text into spans to animate it. That breaks
 * the text for assistive technology, so each one carries the original string
 * as an `aria-label` and hides the pieces — the same trick `ShaderText` uses
 * elsewhere in this project.
 */

/* ---- TextEffect --------------------------------------------------------- */

export type TextEffectPreset = "blur" | "fade-in-blur" | "scale" | "fade" | "slide";

const TEXT_EFFECT_PRESETS: Record<TextEffectPreset, string> = {
  blur: "sbg-mp-te-blur",
  "fade-in-blur": "sbg-mp-te-fade-blur",
  scale: "sbg-mp-te-scale",
  fade: "sbg-mp-te-fade",
  slide: "sbg-mp-te-slide",
};

export interface TextEffectProps {
  children: string;
  /** Granularity of the reveal. */
  per?: "word" | "char" | "line";
  as?: ElementType;
  className?: string;
  preset?: TextEffectPreset;
  /** Seconds before the first segment animates. */
  delay?: number;
  /** Set false to hold the text in its pre-animation state. */
  trigger?: boolean;
  /** Multiplier on the gap between segments. Higher is faster. */
  speedReveal?: number;
  /** Multiplier on each segment's own duration. Higher is faster. */
  speedSegment?: number;
  segmentWrapperClassName?: string;
  style?: CSSProperties;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}

/** Reveals text segment by segment when it scrolls into view. */
export function TextEffect({
  children,
  per = "word",
  as: Component = "p",
  className,
  preset = "fade",
  delay = 0,
  trigger = true,
  speedReveal = 1,
  speedSegment = 1,
  segmentWrapperClassName,
  style,
  onAnimationComplete,
  onAnimationStart,
}: TextEffectProps) {
  const [ref, inView] = useInViewport<HTMLElement>({ threshold: 0.2 });
  const reduced = usePrefersReducedMotion();
  const active = trigger && inView && !reduced;

  const segments =
    per === "char"
      ? splitChars(children)
      : per === "line"
        ? children.split("\n")
        : children.split(/(\s+)/).filter(Boolean);

  const stagger = 0.05 / speedReveal;
  const duration = 0.5 / speedSegment;
  const total = delay + segments.length * stagger + duration;

  useEffect(() => {
    if (!active) return;
    onAnimationStart?.();
    const done = window.setTimeout(() => onAnimationComplete?.(), total * 1000);
    return () => clearTimeout(done);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, total]);

  return (
    <Component ref={ref} className={className} style={style} aria-label={children}>
      {segments.map((segment, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={cn(
            "inline-block whitespace-pre",
            per === "line" && "block",
            active ? TEXT_EFFECT_PRESETS[preset] : !reduced && trigger && "opacity-0",
            segmentWrapperClassName,
          )}
          style={
            active
              ? {
                  animationDelay: `${delay + index * stagger}s`,
                  animationDuration: `${duration}s`,
                }
              : undefined
          }
        >
          {segment}
        </span>
      ))}
    </Component>
  );
}

/* ---- TextLoop ----------------------------------------------------------- */

export interface TextLoopProps {
  children: ReactNode[];
  className?: string;
  /** Seconds each item is held. */
  interval?: number;
  /** Set false to freeze on the current item. */
  trigger?: boolean;
  onIndexChange?: (index: number) => void;
}

/**
 * Cycles through its children in place.
 *
 * Sized to the widest child by stacking every item in one grid cell, so the
 * surrounding line never reflows as the words change length.
 */
export function TextLoop({
  children,
  className,
  interval = 2,
  trigger = true,
  onIndexChange,
}: TextLoopProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!trigger || children.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % children.length;
        onIndexChange?.(next);
        return next;
      });
    }, interval * 1000);
    return () => clearInterval(id);
  }, [trigger, interval, children.length, onIndexChange]);

  return (
    <span className={cn("relative inline-grid overflow-hidden align-bottom", className)}>
      {children.map((child, itemIndex) => (
        <span
          key={itemIndex}
          aria-hidden={itemIndex !== index}
          className={cn(
            "col-start-1 row-start-1 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
            itemIndex === index
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-full opacity-0",
          )}
        >
          {child}
        </span>
      ))}
    </span>
  );
}

/* ---- TextMorph ---------------------------------------------------------- */

export interface TextMorphProps {
  children: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * Morphs between strings, keeping shared characters in place.
 *
 * Characters are keyed by value and occurrence index, so re-rendering with new
 * text leaves the letters both strings have where they are and only fades the
 * difference. Keying by position instead would animate every letter on every
 * change, which reads as a flicker rather than a morph.
 */
export function TextMorph({
  children,
  as: Component = "p",
  className,
  style,
}: TextMorphProps) {
  const counts = new Map<string, number>();
  const characters = splitChars(children).map((char) => {
    const seen = counts.get(char) ?? 0;
    counts.set(char, seen + 1);
    return { char, key: `${char}-${seen}` };
  });

  return (
    <Component className={className} style={style} aria-label={children}>
      {characters.map(({ char, key }) => (
        <span
          key={key}
          aria-hidden="true"
          className="sbg-mp-morph-char inline-block whitespace-pre"
        >
          {char}
        </span>
      ))}
    </Component>
  );
}

/* ---- TextRoll ----------------------------------------------------------- */

export interface TextRollProps {
  children: string;
  className?: string;
  /** Seconds for each character's flip. */
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  onAnimationComplete?: () => void;
}

/**
 * Characters roll out and a copy rolls in behind them.
 *
 * Both faces are rendered on a shared 3D cube edge, so the exit and entrance
 * are one physical movement rather than two animations that happen to overlap.
 */
export function TextRoll({
  children,
  className,
  duration = 0.5,
  getEnterDelay = (index) => index * 0.1,
  getExitDelay = (index) => index * 0.1 + 0.2,
  onAnimationComplete,
}: TextRollProps) {
  const characters = splitChars(children);
  const [rolled, setRolled] = useState(false);
  const reduced = usePrefersReducedMotion();

  const longest = characters.reduce(
    (max, _, index) => Math.max(max, getEnterDelay(index), getExitDelay(index)),
    0,
  );

  useEffect(() => {
    if (!rolled) return;
    const id = window.setTimeout(
      () => onAnimationComplete?.(),
      (longest + duration) * 1000,
    );
    return () => clearTimeout(id);
  }, [rolled, longest, duration, onAnimationComplete]);

  return (
    <span
      className={cn("inline-flex [perspective:900px]", className)}
      aria-label={children}
      onMouseEnter={() => !reduced && setRolled(true)}
      onMouseLeave={() => setRolled(false)}
    >
      {characters.map((char, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="relative inline-block whitespace-pre [transform-style:preserve-3d]"
        >
          <span
            className="inline-block transition-transform ease-in motion-reduce:transition-none"
            style={{
              transform: rolled ? "rotateX(90deg)" : "rotateX(0deg)",
              transformOrigin: "50% 25%",
              transitionDuration: `${duration}s`,
              transitionDelay: `${getExitDelay(index)}s`,
            }}
          >
            {char}
          </span>
          <span
            className="absolute inset-0 inline-block transition-transform ease-out motion-reduce:hidden"
            style={{
              transform: rolled ? "rotateX(0deg)" : "rotateX(-90deg)",
              transformOrigin: "50% 100%",
              transitionDuration: `${duration}s`,
              transitionDelay: `${getEnterDelay(index)}s`,
            }}
          >
            {char}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ---- TextScramble ------------------------------------------------------- */

const DEFAULT_CHARACTER_SET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export interface TextScrambleProps {
  children: string;
  as?: ElementType;
  /** Seconds for the full resolve. */
  duration?: number;
  /** Seconds between scramble frames. */
  speed?: number;
  characterSet?: string;
  className?: string;
  /** Set false to hold the resolved text. */
  trigger?: boolean;
  onScrambleComplete?: () => void;
}

/**
 * Text resolves out of random characters, left to right.
 *
 * The real string is exposed via `aria-label` and the scrambling span is
 * hidden, so a screen reader is never handed the noise.
 */
export function TextScramble({
  children,
  as: Component = "p",
  duration = 0.8,
  speed = 0.04,
  characterSet = DEFAULT_CHARACTER_SET,
  className,
  trigger = true,
  onScrambleComplete,
}: TextScrambleProps) {
  const [display, setDisplay] = useState(children);
  const reduced = usePrefersReducedMotion();
  const completeRef = useRef(onScrambleComplete);
  completeRef.current = onScrambleComplete;

  useEffect(() => {
    if (!trigger || reduced) {
      setDisplay(children);
      return;
    }

    const characters = splitChars(children);
    const steps = Math.max(1, Math.round(duration / speed));
    let step = 0;

    const id = window.setInterval(() => {
      step += 1;
      // Resolve left to right: everything before the cursor is already final.
      const resolved = Math.floor((step / steps) * characters.length);
      setDisplay(
        characters
          .map((char, index) => {
            if (index < resolved || char === " ") return char;
            return characterSet[Math.floor(Math.random() * characterSet.length)] ?? char;
          })
          .join(""),
      );

      if (step >= steps) {
        clearInterval(id);
        setDisplay(children);
        completeRef.current?.();
      }
    }, speed * 1000);

    return () => clearInterval(id);
  }, [children, trigger, duration, speed, characterSet, reduced]);

  return (
    <Component className={className} aria-label={children}>
      <span aria-hidden="true">{display}</span>
    </Component>
  );
}

/* ---- TextShimmer -------------------------------------------------------- */

export interface TextShimmerProps {
  children: string;
  as?: ElementType;
  className?: string;
  /** Seconds for one pass. */
  duration?: number;
  /** Width of the highlight, in characters. */
  spread?: number;
}

/**
 * A highlight sweeps across the text.
 *
 * The sweep width is derived from the string length so short labels and long
 * sentences shimmer at a comparable visual rate.
 */
export function TextShimmer({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const dynamicSpread = children.length * spread;

  return (
    <Component
      className={cn(
        "sbg-mp-shimmer relative inline-block bg-clip-text text-transparent",
        "[--base-color:var(--color-ink-400)] [--highlight-color:var(--color-ink-0)]",
        className,
      )}
      style={{
        ["--spread" as string]: `${dynamicSpread}px`,
        animationDuration: `${duration}s`,
        backgroundImage:
          "linear-gradient(90deg, transparent calc(50% - var(--spread)), var(--highlight-color), transparent calc(50% + var(--spread))), linear-gradient(var(--base-color), var(--base-color))",
      }}
    >
      {children}
    </Component>
  );
}

/* ---- TextShimmerWave ---------------------------------------------------- */

export interface TextShimmerWaveProps {
  children: string;
  as?: ElementType;
  className?: string;
  /** Seconds for one pass of the wave. */
  duration?: number;
  /** Seconds of offset between adjacent characters. */
  spread?: number;
  zDistance?: number;
  xDistance?: number;
  yDistance?: number;
  scaleDistance?: number;
  rotateYDistance?: number;
}

/**
 * A per-character wave: each glyph brightens and displaces in turn.
 *
 * The distances are passed to CSS as custom properties so one keyframe set
 * drives every configuration rather than generating keyframes per instance.
 */
export function TextShimmerWave({
  children,
  as: Component = "p",
  className,
  duration = 1,
  spread = 1,
  zDistance = 10,
  xDistance = 2,
  yDistance = -2,
  scaleDistance = 1.1,
  rotateYDistance = 10,
}: TextShimmerWaveProps) {
  const characters = splitChars(children);

  return (
    <Component
      className={cn(
        "inline-block text-ink-400 [perspective:500px]",
        "[--base-color:var(--color-ink-400)] [--highlight-color:var(--color-ink-0)]",
        className,
      )}
      aria-label={children}
    >
      {characters.map((char, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="sbg-mp-shimmer-wave inline-block whitespace-pre [transform-style:preserve-3d]"
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${(index * spread * duration) / characters.length}s`,
            ["--sbg-mp-x" as string]: `${xDistance}px`,
            ["--sbg-mp-y" as string]: `${yDistance}px`,
            ["--sbg-mp-z" as string]: `${zDistance}px`,
            ["--sbg-mp-scale" as string]: `${scaleDistance}`,
            ["--sbg-mp-rotate" as string]: `${rotateYDistance}deg`,
          }}
        >
          {char}
        </span>
      ))}
    </Component>
  );
}
