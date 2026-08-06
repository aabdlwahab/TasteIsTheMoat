import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { cn } from "../cn";
import { usePrefersReducedMotion, useSpring } from "./internal";
import type { SpringOptions } from "./internal";

/* ---- Dock --------------------------------------------------------------- */

interface DockContextValue {
  register: (el: HTMLElement) => () => void;
  hovered: boolean;
  iconSize: number;
}

const DockContext = createContext<DockContextValue | null>(null);

export interface DockProps {
  children: ReactNode;
  className?: string;
  spring?: SpringOptions;
  /** Width a fully magnified item reaches, in pixels. */
  magnification?: number;
  /** How far from an item the magnification begins, in pixels. */
  distance?: number;
  /** Resting height of the panel, in pixels. */
  panelHeight?: number;
}

/**
 * macOS-style magnifying dock.
 *
 * Each item's size is a falloff of its horizontal distance from the pointer.
 * Sizes are written straight to the item nodes on `pointermove` rather than
 * held in state — a dock re-rendering every item sixty times a second is the
 * one thing that makes this effect feel heavy.
 */
export function Dock({
  children,
  className,
  spring,
  magnification = 80,
  distance = 150,
  panelHeight = 64,
}: DockProps) {
  const items = useRef(new Set<HTMLElement>());
  const [hovered, setHovered] = useState(false);
  const reduced = usePrefersReducedMotion();
  const iconSize = Math.round(panelHeight * 0.6);

  const register = useCallback((el: HTMLElement) => {
    items.current.add(el);
    return () => {
      items.current.delete(el);
    };
  }, []);

  const applySizes = useCallback(
    (pointerX: number | null) => {
      for (const el of items.current) {
        if (pointerX === null) {
          el.style.width = `${iconSize}px`;
          el.style.height = `${iconSize}px`;
          continue;
        }
        const box = el.getBoundingClientRect();
        const delta = Math.abs(pointerX - (box.left + box.width / 2));
        // Linear falloff to zero at `distance`; beyond it the item rests.
        const influence = Math.max(0, 1 - delta / distance);
        const size = iconSize + (magnification - iconSize) * influence;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      }
    },
    [iconSize, magnification, distance],
  );

  const [setSpring, jumpSpring] = useSpring(
    1,
    ([x]) => applySizes(x ?? null),
    spring ?? { mass: 0.1, stiffness: 150, damping: 12 },
  );
  const seenPointer = useRef(false);

  const context = useMemo(
    () => ({ register, hovered, iconSize }),
    [register, hovered, iconSize],
  );

  return (
    <DockContext.Provider value={context}>
      <div
        className={cn(
          "mx-auto flex w-fit items-end gap-3 rounded-2xl border border-white/10 bg-ink-850/70 px-3 pb-2 backdrop-blur-md",
          className,
        )}
        style={{ height: panelHeight }}
        onPointerMove={(event) => {
          if (reduced) return;
          setHovered(true);
          // The spring smooths pointer *travel*; entering the dock should
          // magnify from wherever the pointer actually is, not sweep in from
          // the left edge of the screen.
          if (seenPointer.current) {
            setSpring([event.clientX]);
          } else {
            seenPointer.current = true;
            jumpSpring([event.clientX]);
          }
        }}
        onPointerLeave={() => {
          setHovered(false);
          seenPointer.current = false;
          applySizes(null);
        }}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
}

export interface DockItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DockItem({ children, className, onClick }: DockItemProps) {
  const context = useContext(DockContext);
  if (!context) throw new Error("<DockItem> must be rendered inside <Dock>.");
  const { register, iconSize } = context;
  const ref = useRef<HTMLButtonElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    return el ? register(el) : undefined;
  }, [register]);

  return (
    <DockItemContext.Provider value={focused}>
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerEnter={() => setFocused(true)}
        onPointerLeave={() => setFocused(false)}
        style={{ width: iconSize, height: iconSize }}
        className={cn(
          "relative grid shrink-0 place-items-center rounded-full bg-white/5",
          "outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
          className,
        )}
      >
        {children}
      </button>
    </DockItemContext.Provider>
  );
}

const DockItemContext = createContext(false);

export function DockLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const active = useContext(DockItemContext);
  return (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-pre rounded-md",
        "border border-white/10 bg-ink-900 px-2 py-1 text-xs text-ink-100 transition-opacity",
        active ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DockIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("grid size-1/2 place-items-center", className)} aria-hidden="true">
      {children}
    </span>
  );
}

/* ---- GlowEffect --------------------------------------------------------- */

export type GlowMode =
  | "rotate"
  | "pulse"
  | "breathe"
  | "colorShift"
  | "flowHorizontal"
  | "static";

export type GlowBlur =
  | number
  | "none"
  | "softest"
  | "soft"
  | "medium"
  | "strong"
  | "stronger"
  | "strongest";

const GLOW_BLUR: Record<Exclude<GlowBlur, number>, string> = {
  none: "0px",
  softest: "2px",
  soft: "4px",
  medium: "12px",
  strong: "24px",
  stronger: "36px",
  strongest: "60px",
};

const GLOW_MODES: Record<GlowMode, string> = {
  rotate: "sbg-mp-glow-rotate",
  pulse: "sbg-mp-glow-pulse",
  breathe: "sbg-mp-glow-breathe",
  colorShift: "sbg-mp-glow-shift",
  flowHorizontal: "sbg-mp-glow-flow",
  static: "",
};

export interface GlowEffectProps {
  className?: string;
  style?: CSSProperties;
  colors?: string[];
  mode?: GlowMode;
  blur?: GlowBlur;
  /** Seconds for one cycle. */
  duration?: number;
  /** Size relative to the parent. Above 1 the glow spills past the edges. */
  scale?: number;
}

/**
 * A coloured glow behind its positioned parent.
 *
 * The gradient is composed once from `colors` and each mode is a CSS animation
 * over it, so switching modes never rebuilds the paint. Drop it inside any
 * `relative` element, before the content.
 */
export function GlowEffect({
  className,
  style,
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "rotate",
  blur = "medium",
  duration = 5,
  scale = 1,
}: GlowEffectProps) {
  const stops = colors.join(", ");
  const background =
    mode === "flowHorizontal"
      ? `linear-gradient(90deg, ${stops}, ${colors[0] ?? "transparent"})`
      : `conic-gradient(from 0deg, ${stops}, ${colors[0] ?? "transparent"})`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
        GLOW_MODES[mode],
        className,
      )}
      style={{
        background,
        filter: `blur(${typeof blur === "number" ? `${blur}px` : GLOW_BLUR[blur]})`,
        transform: `scale(${scale})`,
        animationDuration: `${duration}s`,
        backgroundSize: mode === "flowHorizontal" ? "200% 100%" : undefined,
        ...style,
      }}
    />
  );
}

/* ---- ImageComparison ---------------------------------------------------- */

interface ComparisonContextValue {
  position: number;
  setPosition: (value: number) => void;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export interface ImageComparisonProps {
  children: ReactNode;
  className?: string;
  /** Track hover instead of requiring a drag. */
  enableHover?: boolean;
  /** Starting split, 0–100. */
  defaultPosition?: number;
}

/**
 * A before/after wipe.
 *
 * The handle is a real `range` input rather than a styled div, so the split is
 * keyboard-operable and announced without any extra ARIA — dragging is the
 * enhancement, not the only way in.
 */
export function ImageComparison({
  children,
  className,
  enableHover = false,
  defaultPosition = 50,
}: ImageComparisonProps) {
  const [position, setPosition] = useState(defaultPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = (clientX: number) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    setPosition(Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100)));
  };

  const context = useMemo(() => ({ position, setPosition }), [position]);

  return (
    <ComparisonContext.Provider value={context}>
      <div
        ref={containerRef}
        className={cn("relative select-none overflow-hidden", className)}
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          moveTo(event.clientX);
        }}
        onPointerMove={(event) => {
          if (enableHover || dragging.current) moveTo(event.clientX);
        }}
        onPointerUp={(event) => {
          dragging.current = false;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        {children}
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(position)}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Comparison position"
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>
    </ComparisonContext.Provider>
  );
}

export interface ImageComparisonImageProps {
  src: string;
  alt: string;
  className?: string;
  position?: "left" | "right";
}

export function ImageComparisonImage({
  src,
  alt,
  className,
  position = "left",
}: ImageComparisonImageProps) {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("<ImageComparisonImage> must be rendered inside <ImageComparison>.");
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={cn("size-full object-cover", position === "right" && "absolute inset-0", className)}
      style={{
        clipPath:
          position === "left"
            ? `inset(0 ${100 - context.position}% 0 0)`
            : `inset(0 0 0 ${context.position}%)`,
      }}
    />
  );
}

export function ImageComparisonSlider({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("<ImageComparisonSlider> must be rendered inside <ImageComparison>.");
  }

  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-y-0 w-1 bg-white", className)}
      style={{ left: `${context.position}%`, transform: "translateX(-50%)" }}
    >
      {children}
    </div>
  );
}

/* ---- ScrollProgress ----------------------------------------------------- */

export interface ScrollProgressProps {
  className?: string;
  springOptions?: SpringOptions;
  /** Track a scrollable element instead of the document. */
  containerRef?: RefObject<HTMLElement | null>;
}

/**
 * A bar that fills with reading progress.
 *
 * Scales rather than resizing: `transform` is compositor-driven, so the bar
 * stays smooth on a scroll that is already doing layout work elsewhere.
 */
export function ScrollProgress({
  className,
  springOptions,
  containerRef,
}: ScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const paint = useCallback((progress: number) => {
    const node = ref.current;
    if (node) node.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }, []);

  const [setSpring] = useSpring(
    1,
    ([progress]) => paint(progress ?? 0),
    springOptions ?? { stiffness: 200, damping: 30, mass: 0.6 },
  );

  useEffect(() => {
    const target = containerRef?.current;

    const read = () => {
      let progress = 0;
      if (target) {
        const scrollable = target.scrollHeight - target.clientHeight;
        progress = scrollable > 0 ? target.scrollTop / scrollable : 0;
      } else {
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      }
      if (reduced) paint(progress);
      else setSpring([progress]);
    };

    read();
    const source: HTMLElement | Window = target ?? window;
    source.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);

    return () => {
      source.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [containerRef, reduced, paint, setSpring]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("h-1 w-full origin-left bg-brand-400", className)}
      style={{ transform: "scaleX(0)" }}
    />
  );
}

/* ---- SpinningText ------------------------------------------------------- */

export interface SpinningTextProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  /** Seconds for one full rotation. */
  duration?: number;
  reverse?: boolean;
  /** Font size in rem. */
  fontSize?: number;
  /** Radius of the circle, in rem. */
  radius?: number;
}

/**
 * Text laid around a circle, rotating.
 *
 * Each character is rotated into place and pushed out by the radius. The whole
 * ring spins as one element rather than animating each glyph, so the letters
 * keep their spacing exactly.
 */
export function SpinningText({
  children,
  className,
  style,
  duration = 10,
  reverse = false,
  fontSize = 1,
  radius = 5,
}: SpinningTextProps) {
  const characters = Array.from(children);
  const step = 360 / characters.length;
  const size = `${radius * 2}rem`;

  return (
    <span
      className={cn("sbg-mp-spin relative grid place-items-center", className)}
      style={{
        width: size,
        height: size,
        fontSize: `${fontSize}rem`,
        animationDuration: `${duration}s`,
        animationDirection: reverse ? "reverse" : "normal",
        ...style,
      }}
      aria-label={children}
    >
      {characters.map((char, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 origin-top"
          style={{
            transform: `translate(-50%, -50%) rotate(${index * step}deg) translateY(-${radius}rem)`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/* ---- ProgressiveBlur ---------------------------------------------------- */

export interface ProgressiveBlurProps {
  direction?: "top" | "right" | "bottom" | "left";
  /** Number of stacked layers. More layers is smoother and costs more. */
  blurLayers?: number;
  className?: string;
  /** Blur added per layer, in pixels. */
  blurIntensity?: number;
}

const GRADIENT_DIRECTION: Record<
  NonNullable<ProgressiveBlurProps["direction"]>,
  string
> = {
  top: "to top",
  right: "to right",
  bottom: "to bottom",
  left: "to left",
};

/**
 * A gradual blur that ramps toward one edge.
 *
 * CSS cannot interpolate `backdrop-filter` across a gradient, so the ramp is
 * faked with stacked layers: each one blurs a little harder and is masked to a
 * narrower band, and the overlap reads as a smooth falloff.
 */
export function ProgressiveBlur({
  direction = "bottom",
  blurLayers = 8,
  className,
  blurIntensity = 0.25,
}: ProgressiveBlurProps) {
  const layers = Math.max(1, blurLayers);
  const gradient = GRADIENT_DIRECTION[direction];

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {Array.from({ length: layers }, (_, index) => {
        const start = (index / layers) * 100;
        const end = ((index + 1) / layers) * 100;
        const mask = `linear-gradient(${gradient}, transparent ${start}%, black ${end}%)`;
        return (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${(index + 1) * blurIntensity}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
}

/** Stable ids for the toolbar surfaces, kept beside the interactive set. */
export function useToolbarId(prefix: string) {
  const id = useId();
  return `${prefix}-${id}`;
}
