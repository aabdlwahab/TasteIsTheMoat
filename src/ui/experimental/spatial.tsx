import {
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../cn";

export interface NotchItem {
  label: string;
  content: ReactNode;
}

export interface MorphingNotchProps {
  items: NotchItem[];
  position?: "top" | "bottom";
  className?: string;
}

/** Floating command island that morphs to fit the selected panel. */
export function MorphingNotch({
  items,
  position = "top",
  className,
}: MorphingNotchProps) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center",
        position === "bottom" && "flex-col-reverse",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-full border border-white/12 bg-black/85 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl",
          active !== null && position === "top" ? "rounded-b-2xl" : "",
          active !== null && position === "bottom" ? "rounded-t-2xl" : "",
        )}
      >
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-expanded={active === index}
            onClick={() => setActive(active === index ? null : index)}
            className={cn(
              "rounded-full px-3.5 py-2 text-xs font-medium transition-colors",
              active === index
                ? "bg-white text-black"
                : "text-white/65 hover:text-white",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        className={cn(
          "grid overflow-hidden border-x border-white/12 bg-black/85 text-white shadow-2xl backdrop-blur-xl transition-all duration-300",
          position === "top"
            ? "rounded-b-2xl border-b"
            : "rounded-t-2xl border-t",
          active === null
            ? "max-h-0 w-32 border-transparent opacity-0"
            : "max-h-72 w-[min(90vw,390px)] opacity-100",
        )}
      >
        {active !== null && (
          <div className="sbg-notch-in p-5">{items[active]?.content}</div>
        )}
      </div>
    </div>
  );
}

interface Trail {
  id: number;
  x: number;
  y: number;
  content: ReactNode;
}

export interface ImageTrailCursorProps {
  items: ReactNode[];
  distance?: number;
  className?: string;
  children?: ReactNode;
}

/** Pointer/touch trail that cycles through supplied image or card content. */
export function ImageTrailCursor({
  items,
  distance = 54,
  className,
  children,
}: ImageTrailCursorProps) {
  const [trails, setTrails] = useState<Trail[]>([]);
  const counter = useRef(0);
  const previous = useRef({ x: -1000, y: -1000 });

  function move(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (Math.hypot(x - previous.current.x, y - previous.current.y) < distance)
      return;
    previous.current = { x, y };
    const id = ++counter.current;
    const content = items[(id - 1) % items.length];
    if (!content) return;
    setTrails((current) => [...current.slice(-7), { id, x, y, content }]);
    window.setTimeout(
      () => setTrails((current) => current.filter((item) => item.id !== id)),
      950,
    );
  }

  return (
    <div
      onPointerMove={move}
      className={cn(
        "relative isolate min-h-80 overflow-hidden rounded-3xl",
        className,
      )}
    >
      {children}
      {trails.map((trail) => (
        <div
          key={trail.id}
          aria-hidden="true"
          className="sbg-trail pointer-events-none absolute z-20 w-28 overflow-hidden rounded-xl border border-white/15 shadow-xl"
          style={{
            left: trail.x,
            top: trail.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {trail.content}
        </div>
      ))}
    </div>
  );
}

export interface CanvasItem {
  id: string;
  x: number;
  y: number;
  content: ReactNode;
}

export interface InfiniteCanvasProps {
  items: CanvasItem[];
  width?: number;
  height?: number;
  className?: string;
}

/** Momentum-ready spatial canvas that pans with pointer or touch drag. */
export function InfiniteCanvas({
  items,
  width = 1600,
  height = 1000,
  className,
}: InfiniteCanvasProps) {
  const [offset, setOffset] = useState({ x: -200, y: -120 });
  const drag = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  function start(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setOffset({
      x: drag.current.offsetX + event.clientX - drag.current.x,
      y: drag.current.offsetY + event.clientY - drag.current.y,
    });
  }

  return (
    <div
      role="application"
      aria-label="Draggable infinite canvas"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={() => {
        drag.current = null;
      }}
      className={cn(
        "relative h-[520px] touch-none cursor-grab overflow-hidden rounded-3xl border border-ink-700 bg-[radial-gradient(circle_at_center,rgba(99,102,241,.12),transparent_45%),#090a0e] active:cursor-grabbing",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <div
        className="absolute left-1/2 top-1/2 origin-center transition-transform duration-75"
        style={{
          width,
          height,
          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute w-64 overflow-hidden rounded-2xl border border-white/12 bg-ink-850 shadow-2xl shadow-black/45"
            style={{ left: item.x, top: item.y }}
          >
            {item.content}
          </div>
        ))}
      </div>
      <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1.5 text-[11px] text-white/60 backdrop-blur">
        Drag to explore
      </span>
    </div>
  );
}

export interface Marquee3DProps {
  items: ReactNode[];
  duration?: number;
  reverse?: boolean;
  className?: string;
}

/** Perspective marquee that turns a flat logo/image rail into a spatial wall. */
export function Marquee3D({
  items,
  duration = 24,
  reverse = false,
  className,
}: Marquee3DProps) {
  const repeated = [...items, ...items];

  return (
    <div
      className={cn(
        "sbg-marquee-3d relative overflow-hidden [perspective:900px]",
        className,
      )}
    >
      <div
        className={cn(
          "sbg-marquee-3d-track flex w-max gap-4 py-8",
          reverse && "[animation-direction:reverse]",
        )}
        style={{ "--sbg-marquee-3d-duration": `${duration}s` } as React.CSSProperties}
      >
        {repeated.map((item, index) => (
          <div
            key={index}
            aria-hidden={index >= items.length}
            className="w-52 shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-ink-850 shadow-xl"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ProgressiveBlurProps {
  children: ReactNode;
  edge?: "top" | "bottom" | "left" | "right";
  size?: number;
  className?: string;
}

/** Directional glass blur that intensifies toward one edge. */
export function ProgressiveBlur({
  children,
  edge = "bottom",
  size = 110,
  className,
}: ProgressiveBlurProps) {
  const position =
    edge === "bottom"
      ? { insetInline: 0, bottom: 0, height: size }
      : edge === "top"
        ? { insetInline: 0, top: 0, height: size }
        : edge === "left"
          ? { insetBlock: 0, left: 0, width: size }
          : { insetBlock: 0, right: 0, width: size };

  const mask =
    edge === "bottom"
      ? "linear-gradient(to bottom, transparent, black)"
      : edge === "top"
        ? "linear-gradient(to top, transparent, black)"
        : edge === "left"
          ? "linear-gradient(to left, transparent, black)"
          : "linear-gradient(to right, transparent, black)";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-10 backdrop-blur-lg"
        style={{ ...position, maskImage: mask, WebkitMaskImage: mask }}
      />
    </div>
  );
}
