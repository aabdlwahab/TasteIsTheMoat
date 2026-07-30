import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../cn";

export interface MorphingDialogProps {
  trigger: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Compact card that expands into a focused detail view. */
export function MorphingDialog({
  trigger,
  title,
  description,
  children,
  className,
}: MorphingDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "block w-full rounded-2xl border border-ink-700 bg-ink-850 text-left transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
          className,
        )}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === "string" ? title : "Expanded details"}
          className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-5 backdrop-blur-md"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="sbg-dialog-in max-h-[88vh] w-full max-w-3xl overflow-auto rounded-3xl border border-white/12 bg-ink-900 shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between gap-6 border-b border-ink-700 p-6 sm:p-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-ink-0">
                  {title}
                </h2>
                {description && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-400">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-white/8 text-ink-200 hover:bg-white/14"
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="p-6 sm:p-8">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}

export interface DirectionAwareCardProps {
  children: ReactNode;
  reveal: ReactNode;
  className?: string;
}

type Direction = "left" | "right" | "top" | "bottom";

/** Hover overlay that enters from the edge nearest the pointer. */
export function DirectionAwareCard({
  children,
  reveal,
  className,
}: DirectionAwareCardProps) {
  const [direction, setDirection] = useState<Direction>("bottom");
  const [active, setActive] = useState(false);

  function enter(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    setDirection(
      Math.abs(x) > Math.abs(y)
        ? x > 0
          ? "right"
          : "left"
        : y > 0
          ? "bottom"
          : "top",
    );
    setActive(true);
  }

  const hidden = {
    left: "translateX(-102%)",
    right: "translateX(102%)",
    top: "translateY(-102%)",
    bottom: "translateY(102%)",
  }[direction];

  return (
    <div
      tabIndex={0}
      onPointerEnter={enter}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
        className,
      )}
    >
      {children}
      <div
        className="absolute inset-0 z-10 grid place-items-center bg-brand-600/90 p-6 text-center text-white backdrop-blur-sm transition-transform duration-300 ease-out"
        style={{ transform: active ? "translate(0,0)" : hidden }}
      >
        {reveal}
      </div>
    </div>
  );
}

export interface LensRevealProps {
  base: ReactNode;
  detail: ReactNode;
  size?: number;
  className?: string;
}

/** Pointer lens revealing alternate media or a magnified detail layer. */
export function LensReveal({
  base,
  detail,
  size = 170,
  className,
}: LensRevealProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  function move(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div
      tabIndex={0}
      onPointerMove={move}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
        className,
      )}
    >
      {base}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: active ? 1 : 0,
          clipPath: `circle(${size / 2}px at ${position.x}% ${position.y}%)`,
        }}
      >
        {detail}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full border border-white/60 shadow-[0_0_0_1px_rgba(0,0,0,.3),0_12px_35px_rgba(0,0,0,.35)] transition-opacity"
        style={{
          width: size,
          height: size,
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: "translate(-50%, -50%)",
          opacity: active ? 1 : 0,
        }}
      />
    </div>
  );
}

export interface DraggableCardItem {
  id: string;
  content: ReactNode;
  rotation?: number;
}

export interface DraggableCardPileProps {
  items: DraggableCardItem[];
  className?: string;
}

/** Physical card pile with pointer/touch dragging and front-of-stack focus. */
export function DraggableCardPile({
  items,
  className,
}: DraggableCardPileProps) {
  const [cards, setCards] = useState(() =>
    items.map((item, index) => ({
      ...item,
      x: index * 8,
      y: index * 5,
      z: index + 1,
    })),
  );
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);

  function start(event: PointerEvent<HTMLDivElement>, id: string) {
    const card = cards.find((item) => item.id === id);
    if (!card) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      x: card.x,
      y: card.y,
    };
    const maxZ = Math.max(...cards.map((item) => item.z));
    setCards((current) =>
      current.map((item) =>
        item.id === id ? { ...item, z: maxZ + 1 } : item,
      ),
    );
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const currentDrag = drag.current;
    if (!currentDrag) return;
    setCards((current) =>
      current.map((item) =>
        item.id === currentDrag.id
          ? {
              ...item,
              x: currentDrag.x + event.clientX - currentDrag.startX,
              y: currentDrag.y + event.clientY - currentDrag.startY,
            }
          : item,
      ),
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-80 overflow-hidden rounded-3xl border border-ink-700 bg-ink-900/70",
        className,
      )}
    >
      {cards.map((item) => (
        <div
          key={item.id}
          role="group"
          tabIndex={0}
          onPointerDown={(event) => start(event, item.id)}
          onPointerMove={move}
          onPointerUp={() => {
            drag.current = null;
          }}
          className="absolute left-1/2 top-1/2 w-[min(72%,280px)] touch-none cursor-grab select-none overflow-hidden rounded-2xl border border-white/12 bg-ink-850 shadow-2xl shadow-black/45 active:cursor-grabbing"
          style={{
            zIndex: item.z,
            transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px)) rotate(${item.rotation ?? 0}deg)`,
          }}
        >
          {item.content}
        </div>
      ))}
      <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] uppercase tracking-[0.12em] text-ink-500">
        Drag the cards
      </p>
    </div>
  );
}

export interface ScrollCardStackProps {
  items: ReactNode[];
  className?: string;
}

/** Sticky cards that compress into a layered stack as the page scrolls. */
export function ScrollCardStack({
  items,
  className,
}: ScrollCardStackProps) {
  return (
    <div className={cn("relative", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="sticky mb-8 origin-top overflow-hidden rounded-3xl border border-ink-700 bg-ink-850 shadow-2xl shadow-black/30"
          style={{
            top: 80 + index * 14,
            transform: `scale(${1 - index * 0.018}) rotate(${index % 2 ? 0.35 : -0.35}deg)`,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export interface IsometricFeature {
  title: ReactNode;
  description?: ReactNode;
}

export interface IsometricFeatureBoxesProps {
  items: IsometricFeature[];
  interval?: number;
  className?: string;
}

/** Autoplaying feature selector paired with a stacked isometric box diagram. */
export function IsometricFeatureBoxes({
  items,
  interval = 3800,
  className,
}: IsometricFeatureBoxesProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(
      () => setActive((value) => (value + 1) % items.length),
      interval,
    );
    return () => window.clearInterval(timer);
  }, [interval, items.length]);

  return (
    <div
      className={cn(
        "grid items-center gap-8 rounded-3xl border border-ink-700 bg-ink-900/55 p-6 sm:p-8 lg:grid-cols-2",
        className,
      )}
    >
      <div className="grid gap-2">
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              active === index
                ? "border-brand-300/35 bg-brand-400/10"
                : "border-transparent hover:bg-white/5",
            )}
          >
            <span className="font-semibold text-ink-0">{item.title}</span>
            {item.description && (
              <span className="mt-1 block text-sm text-ink-400">
                {item.description}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="relative mx-auto h-64 w-64 [perspective:800px]">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="absolute left-1/2 top-1/2 grid h-28 w-40 place-items-center rounded-xl border border-white/20 bg-gradient-to-br from-brand-500/80 to-accent-500/55 text-xs font-semibold text-white shadow-xl transition-all duration-500"
            style={{
              transform: `translate(-50%, -50%) translateY(${(index - 2) * -26}px) translateX(${(index - 2) * 15}px) rotateX(58deg) rotateZ(-35deg) scale(${1 - Math.abs(index - active % 5) * 0.035})`,
              opacity: 1 - Math.abs(index - active % 5) * 0.12,
              zIndex: 10 - index,
            }}
          >
            Layer {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
