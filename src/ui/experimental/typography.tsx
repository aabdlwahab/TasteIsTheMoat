import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../cn";

export interface KineticTypeRibbonProps {
  text: string;
  repeat?: number;
  direction?: "left" | "right";
  className?: string;
}

/** Oversized text ribbon whose offset and skew react to scroll velocity. */
export function KineticTypeRibbon({
  text,
  repeat = 8,
  direction = "left",
  className,
}: KineticTypeRibbonProps) {
  const [motion, setMotion] = useState({ offset: 0, velocity: 0 });
  const previous = useRef({ y: 0, time: 0 });

  useEffect(() => {
    previous.current = { y: window.scrollY, time: performance.now() };
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const now = performance.now();
        const deltaY = window.scrollY - previous.current.y;
        const deltaTime = Math.max(now - previous.current.time, 16);
        const velocity = Math.max(-18, Math.min(18, (deltaY / deltaTime) * 30));
        previous.current = { y: window.scrollY, time: now };
        setMotion((current) => ({
          offset:
            current.offset +
            deltaY * 0.08 * (direction === "left" ? -1 : 1),
          velocity,
        }));
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [direction]);

  return (
    <div
      className={cn(
        "overflow-hidden border-y border-white/10 bg-ink-900 py-4",
        className,
      )}
      aria-label={text}
    >
      <div
        aria-hidden="true"
        className="flex w-max whitespace-nowrap text-5xl font-black uppercase tracking-[-0.05em] text-ink-0 transition-transform duration-150 sm:text-7xl"
        style={{
          transform: `translate3d(${motion.offset % 500}px,0,0) skewX(${motion.velocity * -0.55}deg)`,
        }}
      >
        {Array.from({ length: repeat }, (_, index) => (
          <span key={index} className="px-5">
            {text} <span className="text-brand-400">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export interface EncryptedTextProps {
  text: string;
  duration?: number;
  trigger?: "mount" | "hover";
  className?: string;
}

const SCRAMBLE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789!?#$%";

/** Text that resolves from randomized encrypted characters into its real value. */
export function EncryptedText({
  text,
  duration = 900,
  trigger = "hover",
  className,
}: EncryptedTextProps) {
  const [display, setDisplay] = useState(trigger === "mount" ? "" : text);
  const runId = useRef(0);

  function animate() {
    runId.current += 1;
    const id = runId.current;
    const started = performance.now();

    function frame(now: number) {
      if (id !== runId.current) return;
      const progress = Math.min((now - started) / duration, 1);
      const resolved = Math.floor(progress * text.length);
      setDisplay(
        text
          .split("")
          .map((character, index) => {
            if (character === " " || index < resolved) return character;
            return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
          })
          .join(""),
      );
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  useEffect(() => {
    if (trigger === "mount") animate();
    return () => {
      runId.current += 1;
    };
  }, [text, trigger]);

  return (
    <span
      tabIndex={trigger === "hover" ? 0 : undefined}
      onPointerEnter={trigger === "hover" ? animate : undefined}
      onFocus={trigger === "hover" ? animate : undefined}
      className={cn("font-mono", className)}
      aria-label={text}
    >
      <span aria-hidden="true">{display || text}</span>
    </span>
  );
}

export interface FlippingTextBoardProps {
  words: string[];
  interval?: number;
  className?: string;
}

/** Mechanical split-flap style word rotator. */
export function FlippingTextBoard({
  words,
  interval = 2200,
  className,
}: FlippingTextBoardProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % words.length),
      interval,
    );
    return () => window.clearInterval(timer);
  }, [interval, words.length]);

  const word = words[index] ?? "";

  return (
    <span
      className={cn(
        "inline-flex gap-1 rounded-xl bg-black p-2 font-mono font-semibold uppercase text-white",
        className,
      )}
      aria-live="polite"
    >
      {word.split("").map((character, characterIndex) => (
        <span
          key={`${index}-${characterIndex}`}
          className="sbg-flip-char relative grid min-w-[0.8em] place-items-center overflow-hidden rounded bg-gradient-to-b from-ink-700 to-ink-900 px-1 py-1.5 shadow-inner"
        >
          <span>{character}</span>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-px bg-black/60"
          />
        </span>
      ))}
    </span>
  );
}

export interface SquigglyTextProps {
  text: string;
  amplitude?: number;
  className?: string;
}

/** Per-character elastic hover typography with no canvas or SVG. */
export function SquigglyText({
  text,
  amplitude = 8,
  className,
}: SquigglyTextProps) {
  return (
    <span
      className={cn("group inline-flex whitespace-pre", className)}
      aria-label={text}
      style={{ "--sbg-squiggle": `${amplitude}px` } as React.CSSProperties}
    >
      {text.split("").map((character, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="sbg-squiggle-char inline-block"
          style={{ animationDelay: `${index * 35}ms` }}
        >
          {character}
        </span>
      ))}
    </span>
  );
}

export interface PathMorphProps {
  paths: string[];
  viewBox?: string;
  duration?: number;
  label?: string;
  className?: string;
}

/** Generic SVG path morph shell; callers provide compatible path data. */
export function PathMorph({
  paths,
  viewBox = "0 0 100 100",
  duration = 4,
  label = "Morphing shape",
  className,
}: PathMorphProps) {
  const values = useMemo(() => {
    if (paths.length < 2) return "";
    return [...paths, paths[0]].join(";");
  }, [paths]);

  if (!paths[0]) return null;

  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={label}
      className={cn("overflow-visible", className)}
    >
      <path d={paths[0]} fill="currentColor">
        {values && (
          <animate
            attributeName="d"
            values={values}
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        )}
      </path>
    </svg>
  );
}

export interface TypeMaskRevealProps {
  children: ReactNode;
  className?: string;
}

/** Reusable clipped light sweep for headlines and display copy. */
export function TypeMaskReveal({
  children,
  className,
}: TypeMaskRevealProps) {
  return (
    <span
      className={cn(
        "sbg-type-mask bg-[linear-gradient(100deg,#71717a_20%,#fff_45%,#22d3ee_52%,#fff_58%,#71717a_80%)] bg-[length:240%_100%] bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}
