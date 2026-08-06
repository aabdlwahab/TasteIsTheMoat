import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared plumbing for the motion collection.
 *
 * These components are ports of the Motion Primitives API surface onto this
 * project's constraints: React, Tailwind, and CSS. Motion Primitives is built
 * on `motion`/framer-motion, so props typed as `Transition`, `Variants`, or
 * `SpringOptions` upstream become plain numbers and CSS objects here. The names
 * and the behaviour are kept; the runtime dependency is not.
 */

/** Live `prefers-reduced-motion` state. Re-renders when the user changes it. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    setReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * A value that is controlled when the caller passes one and internal otherwise.
 *
 * Both Accordion and Disclosure expose `open`/`expandedValue` alongside an
 * `onValueChange` callback, and either may be omitted — so every setter has to
 * update local state *and* notify, without assuming which mode it is in.
 */
export function useControllable<T>(
  controlled: T | undefined,
  fallback: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [internal, setInternal] = useState<T>(fallback);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : internal;

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [value, set];
}

/** Element box, tracked through resize and content changes. */
export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Measures an element's offset box and keeps it current.
 *
 * Used by the components that slide a highlight between siblings. A plain
 * one-shot measurement drifts as soon as fonts load or the container reflows,
 * so this observes the element and re-reads on resize.
 */
export function useRect<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  Rect | null,
] {
  const ref = useRef<T>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const read = () =>
      setRect({
        top: el.offsetTop,
        left: el.offsetLeft,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });

    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    window.addEventListener("resize", read);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", read);
    };
  }, []);

  return [ref, rect];
}

/**
 * True once the element has entered the viewport.
 *
 * Fails open, like `Reveal` and `Counter` elsewhere in this project: if the
 * observer never fires — a backgrounded tab, an element that was already on
 * screen at mount and never re-enters — the content still resolves to its
 * visible state rather than staying invisible forever.
 */
export function useInViewport<T extends Element>(
  options?: IntersectionObserverInit & { once?: boolean },
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const { once = true, ...observerOptions } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already on screen at mount. An observer alone is not enough here.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) {
      setInView(true);
      if (once) return;
    }

    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) {
        setInView(true);
        if (once) io.disconnect();
      } else if (!once) {
        setInView(false);
      }
    }, observerOptions);

    io.observe(el);

    // Safety net: reveal regardless if nothing has fired.
    const safety = window.setTimeout(() => setInView(true), 2500);

    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once, observerOptions.root, observerOptions.rootMargin, observerOptions.threshold]);

  return [ref, inView];
}

/**
 * A critically-damped spring follower driven by requestAnimationFrame.
 *
 * Stands in for framer's `SpringOptions` across Cursor, Tilt, Magnetic, and
 * Spotlight. The loop parks itself when the value has settled so idle
 * components cost nothing, and restarts on the next `set`.
 */
export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export function useSpring(
  count: number,
  onFrame: (values: number[]) => void,
  { stiffness = 150, damping = 15, mass = 0.1 }: SpringOptions = {},
): [set: (targets: number[]) => void, jump: (targets: number[]) => void] {
  const values = useRef<number[]>(new Array(count).fill(0));
  const velocities = useRef<number[]>(new Array(count).fill(0));
  const targets = useRef<number[]>(new Array(count).fill(0));
  const raf = useRef(0);
  const lastTime = useRef(0);
  const frame = useRef(onFrame);
  frame.current = onFrame;

  /**
   * Largest timestep this spring can integrate without blowing up.
   *
   * Semi-implicit Euler is stable while dt stays under both `2·√(m/k)` and
   * `2·m/c`. The default dock spring — mass 0.1, damping 12 — puts the damping
   * limit at 0.0167s, which is exactly a 60Hz frame, so integrating a whole
   * frame at once oscillates and diverges instead of settling. Half the
   * stricter limit leaves real headroom.
   */
  const maxStep = Math.min(Math.sqrt(mass / stiffness), mass / damping) * 0.5;

  const tick = useCallback(
    (now: number) => {
      const elapsed = lastTime.current ? (now - lastTime.current) / 1000 : 1 / 60;
      lastTime.current = now;
      // Cap the catch-up after a backgrounded tab, or one frame tries to
      // integrate several seconds at once.
      const frameDt = Math.min(elapsed, 0.064);
      const steps = Math.min(32, Math.max(1, Math.ceil(frameDt / maxStep)));
      const dt = frameDt / steps;

      let settled = true;

      for (let i = 0; i < values.current.length; i++) {
        let value = values.current[i]!;
        let velocity = velocities.current[i]!;
        const target = targets.current[i]!;

        for (let step = 0; step < steps; step++) {
          const acceleration =
            (-stiffness * (value - target) - damping * velocity) / mass;
          velocity += acceleration * dt;
          value += velocity * dt;
        }

        values.current[i] = value;
        velocities.current[i] = velocity;

        // Relative epsilon: an absolute 0.01 never settles for a spring
        // tracking a screen coordinate or a four-digit number.
        const epsilon = Math.max(0.01, Math.abs(target) * 1e-4);
        if (Math.abs(velocity) > epsilon || Math.abs(value - target) > epsilon) {
          settled = false;
        }
      }

      if (settled) {
        // Snap exactly onto the target so repeated settles don't drift.
        values.current = [...targets.current];
        velocities.current.fill(0);
        raf.current = 0;
        lastTime.current = 0;
        frame.current(values.current);
        return;
      }

      frame.current(values.current);
      raf.current = requestAnimationFrame(tick);
    },
    [stiffness, damping, mass, maxStep],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const set = useCallback(
    (next: number[]) => {
      targets.current = next;
      if (!raf.current) {
        lastTime.current = 0;
        raf.current = requestAnimationFrame(tick);
      }
    },
    [tick],
  );

  /**
   * Move with no animation.
   *
   * Springs start at zero, which for anything positioned in screen space means
   * the first `set` would fly in from the top-left corner. Components that
   * track a pointer call this once, on the first event they see.
   */
  const jump = useCallback((next: number[]) => {
    targets.current = next;
    values.current = [...next];
    velocities.current.fill(0);
    frame.current(values.current);
  }, []);

  return [set, jump];
}

/**
 * Splits text into grapheme clusters.
 *
 * `Array.from` splits by code point, which tears apart emoji with modifiers and
 * combining accents — visible as a lone skin-tone swatch mid-animation. Uses
 * `Intl.Segmenter` where it exists, which is not in this project's TS lib
 * target, hence the local shape.
 */
type SegmenterCtor = new (
  locales?: string | string[],
  options?: { granularity?: "grapheme" | "word" | "sentence" },
) => { segment: (input: string) => Iterable<{ segment: string }> };

export function splitChars(text: string): string[] {
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  if (Segmenter) {
    const segmenter = new Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** Locks body scroll while a modal surface is open, restoring the prior value. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}

/**
 * Escape-to-close plus a focus trap, shared by Dialog, MorphingDialog, and
 * MorphingPopover. Restores focus to whatever was focused before opening —
 * without that, dismissing a dialog drops the caret back to the top of the page.
 */
export function useDismissable(
  active: boolean,
  onDismiss: () => void,
  containerRef: React.RefObject<HTMLElement | null>,
) {
  // Callers pass an inline arrow, so depending on `onDismiss` directly would
  // re-run this effect on every render. Each re-run restores focus and then
  // re-captures it — and once focus has moved into the dialog, the "previously
  // focused" element becomes a node that is about to unmount, so closing drops
  // focus to the body instead of returning it to the trigger.
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        dismissRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => {
      containerRef.current
        ?.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(focusTimer);
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);
}
