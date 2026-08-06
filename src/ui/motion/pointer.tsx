import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../cn";
import { usePrefersReducedMotion, useSpring } from "./internal";
import type { SpringOptions } from "./internal";

/* ---- Cursor ------------------------------------------------------------- */

export interface CursorProps {
  children: ReactNode;
  className?: string;
  springConfig?: SpringOptions;
  /** Only show while the pointer is over the parent element. */
  attachToParent?: boolean;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

/**
 * A custom cursor that trails the pointer.
 *
 * Only mounts for devices with a real pointer — on touch there is nothing to
 * follow, and a fixed element chasing tap coordinates is worse than nothing.
 * Position is written straight to the node each frame instead of through state,
 * so following the pointer never triggers a React render.
 */
export function Cursor({
  children,
  className,
  springConfig,
  attachToParent = false,
  onPositionChange,
}: CursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(!attachToParent);
  const [enabled, setEnabled] = useState(false);
  const reduced = usePrefersReducedMotion();

  const [setSpring, jumpSpring] = useSpring(
    2,
    ([x, y]) => {
      const node = cursorRef.current;
      if (!node) return;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    },
    springConfig ?? { stiffness: 220, damping: 22, mass: 0.2 },
  );
  const seenPointer = useRef(false);

  useEffect(() => {
    setEnabled(window.matchMedia?.("(pointer: fine)").matches ?? false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const parent = attachToParent ? anchorRef.current?.parentElement : null;
    const target: HTMLElement | Document = parent ?? document;

    const onMove = (event: Event) => {
      const { clientX: x, clientY: y } = event as PointerEvent;
      // Snap to wherever the pointer already is, then trail it from there.
      if (reduced || !seenPointer.current) {
        seenPointer.current = true;
        jumpSpring([x, y]);
      } else {
        setSpring([x, y]);
      }
      onPositionChange?.({ x, y });
    };

    target.addEventListener("pointermove", onMove);

    if (!parent) return () => target.removeEventListener("pointermove", onMove);

    const show = () => setVisible(true);
    const hide = () => setVisible(false);
    parent.addEventListener("pointerenter", show);
    parent.addEventListener("pointerleave", hide);
    // Hiding the native cursor is only safe once we own a replacement.
    const previousCursor = parent.style.cursor;
    parent.style.cursor = "none";

    return () => {
      target.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerenter", show);
      parent.removeEventListener("pointerleave", hide);
      parent.style.cursor = previousCursor;
    };
  }, [enabled, attachToParent, reduced, setSpring, jumpSpring, onPositionChange]);

  return (
    <>
      {/* Zero-size anchor: lets `attachToParent` find the parent element. */}
      <span ref={anchorRef} className="hidden" aria-hidden="true" />
      {enabled &&
        createPortal(
          <div
            ref={cursorRef}
            aria-hidden="true"
            className={cn(
              "pointer-events-none fixed left-0 top-0 z-[9999] transition-opacity duration-200",
              visible ? "opacity-100" : "opacity-0",
              className,
            )}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}

/* ---- Magnetic ----------------------------------------------------------- */

export interface MagneticProps {
  children: ReactNode;
  /** How far the element travels, as a fraction of pointer distance. */
  intensity?: number;
  /** Radius in pixels within which the pull applies. */
  range?: number;
  /** Which element's pointer events arm the effect. */
  actionArea?: "self" | "parent" | "global";
  springOptions?: SpringOptions;
  className?: string;
}

/**
 * Pulls its child toward the pointer.
 *
 * `actionArea` decides where the pull arms: `self` needs a direct hover, while
 * `parent` and `global` let a small target start moving before the pointer
 * reaches it — which is the point for something like a compact CTA.
 */
export function Magnetic({
  children,
  intensity = 0.6,
  range = 100,
  actionArea = "self",
  springOptions,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(actionArea === "global");
  const reduced = usePrefersReducedMotion();

  const [setSpring] = useSpring(
    2,
    ([x, y]) => {
      const node = ref.current;
      if (node) node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    },
    springOptions ?? { stiffness: 200, damping: 18, mass: 0.3 },
  );

  useEffect(() => {
    if (reduced) return;

    const node = ref.current;
    if (!node) return;

    const area =
      actionArea === "parent" ? node.parentElement : actionArea === "self" ? node : null;

    const onMove = (event: PointerEvent) => {
      if (!armed) return;
      const box = node.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);

      if (Math.hypot(dx, dy) > range) {
        setSpring([0, 0]);
        return;
      }
      setSpring([dx * intensity, dy * intensity]);
    };

    document.addEventListener("pointermove", onMove);

    if (!area) return () => document.removeEventListener("pointermove", onMove);

    const arm = () => setArmed(true);
    const disarm = () => {
      setArmed(false);
      setSpring([0, 0]);
    };
    area.addEventListener("pointerenter", arm);
    area.addEventListener("pointerleave", disarm);

    return () => {
      document.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerenter", arm);
      area.removeEventListener("pointerleave", disarm);
    };
  }, [armed, actionArea, intensity, range, reduced, setSpring]);

  return (
    <div ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}

/* ---- Spotlight ---------------------------------------------------------- */

export interface SpotlightProps {
  className?: string;
  /** Diameter of the light, in pixels. */
  size?: number;
  springOptions?: SpringOptions;
}

/**
 * A soft light that follows the pointer across its positioned parent.
 *
 * Drop it inside any `relative` element. Distinct from this project's
 * `SpotlightGrid`, which shares one light across a whole grid of cards; this is
 * self-contained and needs no coordination with siblings.
 */
export function Spotlight({ className, size = 200, springOptions }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  const [setSpring, jumpSpring] = useSpring(
    2,
    ([x, y]) => {
      const node = ref.current;
      if (node) {
        node.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      }
    },
    springOptions ?? { stiffness: 260, damping: 26, mass: 0.2 },
  );
  const seenPointer = useRef(false);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;

    const onMove = (event: PointerEvent) => {
      const box = parent.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      // Start under the pointer rather than sweeping in from the corner.
      if (reduced || !seenPointer.current) {
        seenPointer.current = true;
        jumpSpring([x, y]);
      } else {
        setSpring([x, y]);
      }
    };

    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerenter", show);
    parent.addEventListener("pointerleave", hide);

    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerenter", show);
      parent.removeEventListener("pointerleave", hide);
    };
  }, [reduced, size, setSpring, jumpSpring]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-0 top-0 rounded-full",
        "bg-[radial-gradient(circle_at_center,var(--color-brand-400),transparent_70%)]",
        "blur-xl transition-opacity duration-300",
        visible ? "opacity-40" : "opacity-0",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}

/* ---- Tilt --------------------------------------------------------------- */

export interface TiltProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Maximum rotation in degrees at the edges. */
  rotationFactor?: number;
  /** Tilt away from the pointer rather than toward it. */
  isReverse?: boolean;
  springOptions?: SpringOptions;
}

/**
 * Rotates its child in 3D as the pointer crosses it.
 *
 * The perspective lives on a wrapper rather than the rotating element, so
 * nested content shares one vanishing point instead of each child getting its
 * own — which is what makes a tilted card read as a single solid object.
 */
export function Tilt({
  children,
  className,
  style,
  rotationFactor = 15,
  isReverse = false,
  springOptions,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const [setSpring] = useSpring(
    2,
    ([rx, ry]) => {
      const node = ref.current;
      if (node) node.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    },
    springOptions ?? { stiffness: 180, damping: 20, mass: 0.2 },
  );

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const box = event.currentTarget.getBoundingClientRect();
    // Normalised to -0.5…0.5 so the rotation is symmetric about the centre.
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    const direction = isReverse ? -1 : 1;
    setSpring([-py * rotationFactor * direction, px * rotationFactor * direction]);
  };

  return (
    <div
      className={cn("[perspective:1000px]", className)}
      style={style}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setSpring([0, 0])}
    >
      <div ref={ref} className="size-full [transform-style:preserve-3d] will-change-transform">
        {children}
      </div>
    </div>
  );
}
