import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ElementType, Key, ReactElement, ReactNode } from "react";
import { cn } from "../cn";
import {
  useControllable,
  useInViewport,
  usePrefersReducedMotion,
  useRect,
} from "./internal";

/* ---- Accordion ---------------------------------------------------------- */

interface AccordionContextValue {
  expanded: Key | null;
  toggle: (value: Key) => void;
  duration: number;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion(component: string) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Accordion>.`);
  }
  return context;
}

export interface AccordionProps {
  children: ReactNode;
  className?: string;
  /** Seconds for the expand/collapse transition. */
  duration?: number;
  /** Controlled expanded value. */
  expandedValue?: Key | null;
  /** Value expanded on first render when uncontrolled. */
  defaultExpandedValue?: Key | null;
  onValueChange?: (value: Key | null) => void;
}

/**
 * One-at-a-time disclosure group.
 *
 * The open panel is animated with a `grid-template-rows: 0fr → 1fr` transition
 * rather than a measured pixel height, so content can change size while open
 * without the panel needing to re-measure or clip.
 */
export function Accordion({
  children,
  className,
  duration = 0.3,
  expandedValue,
  defaultExpandedValue = null,
  onValueChange,
}: AccordionProps) {
  const [expanded, setExpanded] = useControllable<Key | null>(
    expandedValue,
    defaultExpandedValue,
    onValueChange,
  );

  const context = useMemo<AccordionContextValue>(
    () => ({
      expanded,
      duration,
      toggle: (value) => setExpanded(expanded === value ? null : value),
    }),
    [expanded, duration, setExpanded],
  );

  return (
    <AccordionContext.Provider value={context}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

const AccordionItemContext = createContext<Key | null>(null);

export interface AccordionItemProps {
  value: Key;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { expanded } = useAccordion("AccordionItem");
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={className} data-expanded={expanded === value || undefined}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { expanded, toggle } = useAccordion("AccordionTrigger");
  const value = useContext(AccordionItemContext);
  if (value === null) {
    throw new Error("<AccordionTrigger> must be rendered inside <AccordionItem>.");
  }
  const isOpen = expanded === value;

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={() => toggle(value)}
      className={cn(
        "flex w-full items-center justify-between gap-4 text-left outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand-400",
        className,
      )}
    >
      {children}
    </button>
  );
}

export interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const { expanded, duration } = useAccordion("AccordionContent");
  const value = useContext(AccordionItemContext);
  const isOpen = expanded === value;

  return (
    <div
      className="grid transition-[grid-template-rows,opacity] ease-out motion-reduce:transition-none"
      style={{
        gridTemplateRows: isOpen ? "1fr" : "0fr",
        opacity: isOpen ? 1 : 0,
        transitionDuration: `${duration}s`,
      }}
      aria-hidden={!isOpen}
    >
      <div className="overflow-hidden">
        <div className={className} inert={!isOpen ? true : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---- AnimatedBackground ------------------------------------------------- */

export interface AnimatedBackgroundProps {
  /** Each child must carry a unique `data-id`. */
  children: ReactElement<{ "data-id": string }>[] | ReactElement<{ "data-id": string }>;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  /** Class applied to the moving highlight, not the container. */
  className?: string;
  /** Seconds for the highlight to travel. */
  duration?: number;
  /** Track hover instead of click. */
  enableHover?: boolean;
}

/**
 * A single highlight that slides between children — tabs, nav items, toggles.
 *
 * Upstream this is framer's shared-layout animation. Here the highlight is one
 * absolutely-positioned element whose transform and size are measured from the
 * active child, which gets the same read with no layout thrash: only the
 * highlight moves, the children never re-render.
 */
export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  duration = 0.3,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{
    "data-id": string;
  }>[];

  const [active, setActive] = useState<string | null>(defaultValue ?? null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(
    null,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      if (active === null) {
        setBox(null);
        return;
      }
      const target = container.querySelector<HTMLElement>(
        `[data-id="${CSS.escape(active)}"]`,
      );
      if (!target) return;
      setBox({
        x: target.offsetLeft,
        y: target.offsetTop,
        w: target.offsetWidth,
        h: target.offsetHeight,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [active]);

  const select = (id: string | null) => {
    setActive(id);
    onValueChange?.(id);
  };

  return (
    <div
      ref={containerRef}
      className="relative isolate"
      onMouseLeave={enableHover ? () => select(null) : undefined}
    >
      {box && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0 top-0 -z-10 transition-[transform,width,height] ease-out motion-reduce:transition-none",
            className,
          )}
          style={{
            transform: `translate3d(${box.x}px, ${box.y}px, 0)`,
            width: box.w,
            height: box.h,
            transitionDuration: `${duration}s`,
          }}
        />
      )}
      {items.map((child) => {
        const id = child.props["data-id"];
        const handlers = enableHover
          ? { onMouseEnter: () => select(id), onFocus: () => select(id) }
          : { onClick: () => select(id) };
        return (
          <Slot key={id} {...handlers} data-checked={active === id ? "true" : "false"}>
            {child}
          </Slot>
        );
      })}
    </div>
  );
}

/**
 * Merges props onto a single child element instead of rendering a wrapper.
 *
 * AnimatedBackground positions its highlight from each child's own offset box,
 * so an extra wrapper div would break the measurement.
 */
function Slot({
  children,
  ...props
}: { children: ReactElement } & Record<string, unknown>) {
  const child = children as ReactElement<Record<string, unknown>>;
  return <>{cloneWith(child, props)}</>;
}

function cloneWith(element: ReactElement<Record<string, unknown>>, props: Record<string, unknown>) {
  const merged: Record<string, unknown> = { ...props };
  // Chain rather than clobber, so a caller's own onClick still fires.
  for (const key of Object.keys(props)) {
    const own = element.props[key];
    if (typeof own === "function" && typeof props[key] === "function") {
      merged[key] = (...args: unknown[]) => {
        (own as (...a: unknown[]) => void)(...args);
        (props[key] as (...a: unknown[]) => void)(...args);
      };
    }
  }
  return <element.type {...element.props} {...merged} key={element.key} />;
}

/* ---- AnimatedGroup ------------------------------------------------------ */

export type AnimatedGroupPreset = "fade" | "slide" | "scale" | "blur" | "blur-slide";

const GROUP_PRESETS: Record<AnimatedGroupPreset, string> = {
  fade: "sbg-mp-group-fade",
  slide: "sbg-mp-group-slide",
  scale: "sbg-mp-group-scale",
  blur: "sbg-mp-group-blur",
  "blur-slide": "sbg-mp-group-blur-slide",
};

export interface AnimatedGroupProps {
  children: ReactNode;
  className?: string;
  preset?: AnimatedGroupPreset;
  /** Seconds between consecutive children. */
  stagger?: number;
  /** Seconds before the first child animates. */
  delay?: number;
  /** Seconds for each child's own animation. */
  duration?: number;
  as?: ElementType;
  asChild?: ElementType;
}

/**
 * Staggers a list of children into view.
 *
 * The stagger is an `animation-delay` per index rather than an orchestrated
 * timeline, so adding or removing children costs nothing and the group works
 * for server-rendered markup. Waits for the viewport before starting.
 */
export function AnimatedGroup({
  children,
  className,
  preset = "fade",
  stagger = 0.08,
  delay = 0,
  duration = 0.5,
  as: Component = "div",
  asChild: ChildComponent = "div",
}: AnimatedGroupProps) {
  const [ref, inView] = useInViewport<HTMLElement>({ threshold: 0.15 });
  const reduced = usePrefersReducedMotion();
  const items = Children.toArray(children);

  return (
    <Component ref={ref} className={className}>
      {items.map((child, index) => (
        <ChildComponent
          key={index}
          className={!reduced && inView ? GROUP_PRESETS[preset] : undefined}
          style={
            !reduced && inView
              ? {
                  animationDelay: `${delay + index * stagger}s`,
                  animationDuration: `${duration}s`,
                }
              : undefined
          }
        >
          {child}
        </ChildComponent>
      ))}
    </Component>
  );
}

/* ---- BorderTrail -------------------------------------------------------- */

export interface BorderTrailProps {
  className?: string;
  /** Diameter of the travelling light, in pixels. */
  size?: number;
  /** Seconds for one full circuit. */
  duration?: number;
  style?: CSSProperties;
}

/**
 * A single light that travels the perimeter of its positioned parent.
 *
 * Distinct from this project's `BorderBeam`, which sweeps a conic gradient
 * around the whole frame. Here one blob walks edge to edge, driven by a
 * four-keyframe `top`/`left` path — supported everywhere, unlike `offset-path`.
 * Drop it inside any `relative` element.
 */
export function BorderTrail({
  className,
  size = 60,
  duration = 5,
  style,
}: BorderTrailProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div
        aria-hidden="true"
        className={cn(
          "sbg-mp-border-trail absolute bg-brand-400 blur-[2px]",
          className,
        )}
        style={{
          width: size,
          height: size,
          animationDuration: `${duration}s`,
          ...style,
        }}
      />
    </div>
  );
}

/* ---- Disclosure --------------------------------------------------------- */

interface DisclosureContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  duration: number;
}

const DisclosureContext = createContext<DisclosureContextValue | null>(null);

function useDisclosure(component: string) {
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Disclosure>.`);
  }
  return context;
}

export interface DisclosureProps {
  children: ReactNode;
  className?: string;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Seconds for the expand/collapse transition. */
  duration?: number;
}

/** A single show/hide region. Accordion without the exclusivity. */
export function Disclosure({
  children,
  className,
  open,
  defaultOpen = false,
  onOpenChange,
  duration = 0.3,
}: DisclosureProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const context = useMemo(
    () => ({ open: isOpen, setOpen, duration }),
    [isOpen, setOpen, duration],
  );

  return (
    <DisclosureContext.Provider value={context}>
      <div className={className} data-open={isOpen || undefined}>
        {children}
      </div>
    </DisclosureContext.Provider>
  );
}

export function DisclosureTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open, setOpen } = useDisclosure("DisclosureTrigger");
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn("w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-400", className)}
    >
      {children}
    </button>
  );
}

export function DisclosureContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open, duration } = useDisclosure("DisclosureContent");
  return (
    <div
      className="grid transition-[grid-template-rows,opacity] ease-out motion-reduce:transition-none"
      style={{
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transitionDuration: `${duration}s`,
      }}
      aria-hidden={!open}
    >
      <div className="overflow-hidden">
        <div className={className} inert={!open ? true : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---- InView ------------------------------------------------------------- */

export interface InViewProps {
  children: ReactNode;
  /** Plain CSS states, applied before and after the element enters view. */
  variants?: { hidden: CSSProperties; visible: CSSProperties };
  /** Seconds for the transition between states. */
  duration?: number;
  delay?: number;
  viewOptions?: IntersectionObserverInit;
  as?: ElementType;
  /** Animate only the first time it enters. */
  once?: boolean;
  className?: string;
}

const DEFAULT_IN_VIEW_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} satisfies { hidden: CSSProperties; visible: CSSProperties };

/**
 * Animates its children the first time they scroll into view.
 *
 * `variants` are plain style objects rather than framer variants, so any
 * animatable CSS property works. Reduced-motion visitors get the visible state
 * immediately, and the observer fails open (see `useInViewport`).
 */
export function InView({
  children,
  variants = DEFAULT_IN_VIEW_VARIANTS,
  duration = 0.5,
  delay = 0,
  viewOptions,
  as: Component = "div",
  once = true,
  className,
}: InViewProps) {
  const [ref, inView] = useInViewport<HTMLElement>({ ...viewOptions, once });
  const reduced = usePrefersReducedMotion();
  const visible = reduced || inView;

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        ...(visible ? variants.visible : variants.hidden),
        transition: reduced
          ? undefined
          : `all ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </Component>
  );
}

/* ---- InfiniteSlider ----------------------------------------------------- */

export interface InfiniteSliderProps {
  children: ReactNode;
  /** Gap between children, in pixels. */
  gap?: number;
  /** Travel speed in pixels per second. */
  speed?: number;
  /** Speed while hovered, in pixels per second. */
  speedOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
}

/**
 * A continuous rail that never visibly restarts.
 *
 * Speed is specified in pixels per second, so a rail of five logos and a rail
 * of fifty move at the same rate — the duration is derived from the measured
 * content size instead of being a fixed number of seconds. The duplicate track
 * is `aria-hidden` so the content is announced once.
 */
export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [trackRef, rect] = useRect<HTMLDivElement>();
  const [hovered, setHovered] = useState(false);
  const horizontal = direction === "horizontal";

  const extent = (horizontal ? rect?.width : rect?.height) ?? 0;
  const activeSpeed = hovered && speedOnHover ? speedOnHover : speed;
  // Falls back to a sane duration until the first measurement lands.
  const duration = extent > 0 ? (extent + gap) / activeSpeed : 20;

  return (
    <div
      className={cn("overflow-hidden", className)}
      onMouseEnter={speedOnHover ? () => setHovered(true) : undefined}
      onMouseLeave={speedOnHover ? () => setHovered(false) : undefined}
    >
      <div
        className={cn(
          "flex w-max",
          horizontal
            ? "sbg-mp-slide-x flex-row"
            : "sbg-mp-slide-y h-max flex-col",
        )}
        style={{
          gap,
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
          ["--sbg-mp-slide-gap" as string]: `${gap}px`,
        }}
      >
        <div ref={trackRef} className={cn("flex shrink-0", horizontal ? "flex-row" : "flex-col")} style={{ gap }}>
          {children}
        </div>
        <div
          className={cn("flex shrink-0", horizontal ? "flex-row" : "flex-col")}
          style={{ gap }}
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---- TransitionPanel ---------------------------------------------------- */

export interface TransitionPanelProps {
  children: ReactNode[];
  activeIndex: number;
  className?: string;
  /** Seconds for the crossfade. */
  duration?: number;
  /** Plain CSS states for the three phases of the transition. */
  variants?: {
    enter: CSSProperties;
    center: CSSProperties;
    exit: CSSProperties;
  };
}

const DEFAULT_PANEL_VARIANTS = {
  enter: { opacity: 0, transform: "translateY(8px)" },
  center: { opacity: 1, transform: "translateY(0)" },
  exit: { opacity: 0, transform: "translateY(-8px)" },
} satisfies TransitionPanelProps["variants"];

/**
 * Shows one child at a time, animating between them.
 *
 * The container height animates to the active panel's measured height so
 * surrounding content settles smoothly rather than jumping. Inactive panels
 * stay mounted but are removed from the accessibility tree and tab order.
 */
export function TransitionPanel({
  children,
  activeIndex,
  className,
  duration = 0.3,
  variants = DEFAULT_PANEL_VARIANTS,
}: TransitionPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    const active = container?.children[activeIndex] as HTMLElement | undefined;
    if (!active) return;

    const measure = () => setHeight(active.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(active);
    return () => ro.disconnect();
  }, [activeIndex, children.length]);

  return (
    <div
      className={cn("relative overflow-hidden transition-[height] ease-out motion-reduce:transition-none", className)}
      style={{ height, transitionDuration: `${duration}s` }}
    >
      {/* `items-start` matters: the panels share one grid cell, and a stretched
          item would report the tallest panel's height rather than its own. */}
      <div ref={containerRef} className="grid items-start">
        {children.map((child, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              // Every panel occupies the same grid cell, so they overlap without
              // absolute positioning and the active one can still be measured.
              className="col-start-1 row-start-1 transition-all ease-out motion-reduce:transition-none"
              style={{
                ...(isActive ? variants.center : index < activeIndex ? variants.exit : variants.enter),
                transitionDuration: `${duration}s`,
                pointerEvents: isActive ? undefined : "none",
              }}
              aria-hidden={!isActive}
              inert={!isActive ? true : undefined}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}
