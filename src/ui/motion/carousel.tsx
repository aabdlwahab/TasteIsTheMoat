import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { cn } from "../cn";
import { useControllable } from "./internal";

/* ---- context ------------------------------------------------------------ */

interface CarouselContextValue {
  index: number;
  setIndex: (newIndex: number) => void;
  itemsCount: number;
  setItemsCount: (newItemsCount: number) => void;
  disableDrag: boolean;
  duration: number;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

/** Read and drive carousel state from anywhere inside a `<Carousel>`. */
export function useCarousel(): CarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be called inside <Carousel>.");
  }
  return context;
}

/* ---- Carousel ----------------------------------------------------------- */

export interface CarouselProps {
  children: ReactNode;
  className?: string;
  /** Starting slide when uncontrolled. */
  initialIndex?: number;
  /** Controlled active slide. */
  index?: number;
  onIndexChange?: (newIndex: number) => void;
  disableDrag?: boolean;
  /** Seconds for the slide transition. */
  duration?: number;
}

/**
 * A draggable slide deck.
 *
 * State lives on the root so navigation, indicators, and the track can be
 * arranged in any order — the parts find each other through context rather
 * than through their position in the tree.
 */
export function Carousel({
  children,
  className,
  initialIndex = 0,
  index,
  onIndexChange,
  disableDrag = false,
  duration = 0.4,
}: CarouselProps) {
  const [current, setCurrent] = useControllable(index, initialIndex, onIndexChange);
  const [itemsCount, setItemsCount] = useState(0);

  const setIndex = useCallback(
    (next: number) => {
      // Clamped rather than wrapped: the navigation arrows disable at the ends,
      // so wrapping here would contradict what the controls show.
      const max = Math.max(0, itemsCount - 1);
      setCurrent(Math.min(Math.max(next, 0), max));
    },
    [itemsCount, setCurrent],
  );

  const context = useMemo<CarouselContextValue>(
    () => ({
      index: current,
      setIndex,
      itemsCount,
      setItemsCount,
      disableDrag,
      duration,
    }),
    [current, setIndex, itemsCount, disableDrag, duration],
  );

  return (
    <CarouselContext.Provider value={context}>
      <div
        className={cn("group/carousel relative", className)}
        role="region"
        aria-roledescription="carousel"
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

/* ---- CarouselContent ---------------------------------------------------- */

export interface CarouselContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * The sliding track.
 *
 * Drag is handled with pointer events and pointer capture, which keeps a drag
 * that leaves the element still tracking. A drag past 20% of the width — or any
 * flick faster than 0.4 px/ms — advances a slide; anything less springs back,
 * so a small accidental movement never changes the slide.
 */
export function CarouselContent({ children, className }: CarouselContentProps) {
  const { index, setIndex, setItemsCount, disableDrag, duration } = useCarousel();
  const items = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ start: number; time: number; offset: number } | null>(
    null,
  );

  useEffect(() => {
    setItemsCount(items.length);
  }, [items.length, setItemsCount]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disableDrag) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ start: event.clientX, time: performance.now(), offset: 0 });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setDrag({ ...drag, offset: event.clientX - drag.start });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    event.currentTarget.releasePointerCapture(event.pointerId);

    const width = trackRef.current?.offsetWidth ?? 1;
    const elapsed = Math.max(1, performance.now() - drag.time);
    const velocity = Math.abs(drag.offset) / elapsed;
    const passedThreshold = Math.abs(drag.offset) > width * 0.2 || velocity > 0.4;

    if (passedThreshold) setIndex(index + (drag.offset < 0 ? 1 : -1));
    setDrag(null);
  };

  const dragPercent = drag ? (drag.offset / (trackRef.current?.offsetWidth || 1)) * 100 : 0;

  return (
    <div
      ref={trackRef}
      className={cn("overflow-hidden", !disableDrag && "touch-pan-y", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className={cn("flex", !drag && "transition-transform ease-out motion-reduce:transition-none")}
        style={{
          transform: `translate3d(${-index * 100 + dragPercent}%, 0, 0)`,
          transitionDuration: `${duration}s`,
        }}
      >
        {items.map((child, itemIndex) => (
          <div
            key={itemIndex}
            className="w-full shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${itemIndex + 1} of ${items.length}`}
            aria-hidden={itemIndex !== index}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- CarouselItem ------------------------------------------------------- */

export interface CarouselItemProps {
  children: ReactNode;
  className?: string;
}

export function CarouselItem({ children, className }: CarouselItemProps) {
  return <div className={cn("select-none", className)}>{children}</div>;
}

/* ---- CarouselNavigation ------------------------------------------------- */

export interface CarouselNavigationProps {
  className?: string;
  classNameButton?: string;
  /** Keep the arrows visible instead of revealing them on hover. */
  alwaysShow?: boolean;
}

export function CarouselNavigation({
  className,
  classNameButton,
  alwaysShow = false,
}: CarouselNavigationProps) {
  const { index, setIndex, itemsCount } = useCarousel();

  const button = cn(
    "pointer-events-auto grid size-10 place-items-center rounded-full",
    "border border-white/15 bg-ink-900/70 text-ink-0 backdrop-blur-sm",
    "transition-[opacity,background-color] hover:bg-ink-800",
    "disabled:cursor-not-allowed disabled:opacity-30",
    "outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
    classNameButton,
  );

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-between px-3",
        // Hidden arrows stay focusable, so keyboard users still reach them.
        !alwaysShow &&
          "opacity-0 transition-opacity group-hover/carousel:opacity-100 focus-within:opacity-100",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Previous slide"
        className={button}
        disabled={index === 0}
        onClick={() => setIndex(index - 1)}
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className={button}
        disabled={index >= itemsCount - 1}
        onClick={() => setIndex(index + 1)}
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

/* ---- CarouselIndicator -------------------------------------------------- */

export interface CarouselIndicatorProps {
  className?: string;
  classNameButton?: string;
}

export function CarouselIndicator({
  className,
  classNameButton,
}: CarouselIndicatorProps) {
  const { index, setIndex, itemsCount } = useCarousel();

  return (
    <div className={cn("mt-4 flex items-center justify-center gap-2", className)}>
      {Array.from({ length: itemsCount }, (_, dot) => (
        <button
          key={dot}
          type="button"
          aria-label={`Go to slide ${dot + 1}`}
          aria-current={dot === index}
          onClick={() => setIndex(dot)}
          className={cn(
            "h-1.5 rounded-full transition-[width,background-color]",
            "outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
            dot === index ? "w-6 bg-brand-400" : "w-1.5 bg-white/25 hover:bg-white/45",
            classNameButton,
          )}
        />
      ))}
    </div>
  );
}
