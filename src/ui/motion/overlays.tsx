import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { cn } from "../cn";
import {
  useControllable,
  useDismissable,
  usePrefersReducedMotion,
  useScrollLock,
} from "./internal";

/* ---- Dialog ------------------------------------------------------------- */

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  duration: number;
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog(component: string) {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Dialog>.`);
  }
  return context;
}

export interface DialogProps {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Seconds for the open/close transition. */
  duration?: number;
}

/**
 * A modal dialog.
 *
 * Escape, the focus trap, focus restoration, and the scroll lock all live in
 * shared hooks (see `internal.ts`) because `MorphingDialog` and
 * `MorphingPopover` need exactly the same behaviour — only the animation
 * differs between them.
 */
export function Dialog({
  children,
  className,
  defaultOpen = false,
  open,
  onOpenChange,
  duration = 0.3,
}: DialogProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const id = useMemo(() => Math.random().toString(36).slice(2, 9), []);

  const context = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      duration,
      titleId: `dialog-title-${id}`,
      descriptionId: `dialog-description-${id}`,
    }),
    [isOpen, setOpen, duration, id],
  );

  return (
    <DialogContext.Provider value={context}>
      <div className={className}>{children}</div>
    </DialogContext.Provider>
  );
}

export function DialogTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { setOpen, open } = useDialog("DialogTrigger");
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen(true)}
      className={cn("outline-none focus-visible:ring-2 focus-visible:ring-brand-400", className)}
    >
      {children}
    </button>
  );
}

export function DialogContent({
  children,
  className,
  container,
}: {
  children: ReactNode;
  className?: string;
  container?: HTMLElement;
}) {
  const { open, setOpen, duration, titleId, descriptionId } = useDialog("DialogContent");
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useScrollLock(open);
  useDismissable(open, () => setOpen(false), panelRef);

  useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="sbg-mp-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animationDuration: `${duration}s` }}
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "sbg-mp-dialog-in relative w-full max-w-lg rounded-card border border-ink-700 bg-ink-850 p-6 shadow-2xl",
          className,
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
      </div>
    </div>,
    container ?? document.body,
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { titleId } = useDialog("DialogTitle");
  return (
    <h2 id={titleId} className={cn("text-lg font-semibold text-ink-0", className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { descriptionId } = useDialog("DialogDescription");
  return (
    <p id={descriptionId} className={cn("mt-2 text-sm leading-relaxed text-ink-300", className)}>
      {children}
    </p>
  );
}

export function DialogClose({
  children,
  className,
  disabled,
}: {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { setOpen } = useDialog("DialogClose");
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={children ? undefined : "Close dialog"}
      onClick={() => setOpen(false)}
      className={cn(
        "absolute right-4 top-4 grid size-8 place-items-center rounded-md text-ink-300",
        "transition-colors hover:bg-white/10 hover:text-ink-0",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-40",
        className,
      )}
    >
      {children ?? <span aria-hidden="true">✕</span>}
    </button>
  );
}

/* ---- MorphingDialog ----------------------------------------------------- */

interface MorphingContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRect: DOMRect | null;
  setTriggerRect: (rect: DOMRect | null) => void;
  duration: number;
  titleId: string;
}

const MorphingContext = createContext<MorphingContextValue | null>(null);

function useMorphing(component: string) {
  const context = useContext(MorphingContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <MorphingDialog>.`);
  }
  return context;
}

export interface MorphingDialogProps {
  children: ReactNode;
  /** Seconds for the morph. */
  duration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A dialog that grows out of the element that opened it.
 *
 * Implemented as FLIP: the trigger's box is captured on click, the panel is
 * painted at its final size, then transformed back onto the trigger and
 * released on the next frame. That keeps one composited transform running
 * instead of animating width and height, which would relayout every frame.
 */
export function MorphingDialog({
  children,
  duration = 0.4,
  open,
  onOpenChange,
}: MorphingDialogProps) {
  const [isOpen, setOpen] = useControllable(open, false, onOpenChange);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const id = useMemo(() => Math.random().toString(36).slice(2, 9), []);

  const context = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      triggerRect,
      setTriggerRect,
      duration,
      titleId: `morphing-title-${id}`,
    }),
    [isOpen, setOpen, triggerRect, duration, id],
  );

  return <MorphingContext.Provider value={context}>{children}</MorphingContext.Provider>;
}

export function MorphingDialogTrigger({
  children,
  className,
  style,
  triggerRef,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}) {
  const { setOpen, setTriggerRect, open } = useMorphing("MorphingDialogTrigger");
  const localRef = useRef<HTMLButtonElement>(null);
  const ref = triggerRef ?? localRef;

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      style={style}
      onClick={() => {
        setTriggerRect(ref.current?.getBoundingClientRect() ?? null);
        setOpen(true);
      }}
      className={cn(
        "block text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Optional wrapper. Kept for API parity; the content portals regardless. */
export function MorphingDialogContainer({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function MorphingDialogContent({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { open, setOpen, triggerRect, duration, titleId } =
    useMorphing("MorphingDialogContent");
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const reduced = usePrefersReducedMotion();

  useScrollLock(open);
  useDismissable(open, () => setOpen(false), panelRef);

  useEffect(() => setMounted(true), []);

  /**
   * The FLIP itself.
   *
   * Has to run in a layout effect and write to the node directly: the panel is
   * laid out at its final size first, so the inverse transform can only be
   * computed once the element exists, and it has to land before the browser
   * paints. Deriving it during render reads a ref that is still null on the
   * first pass, which is how this silently degrades to a plain fade.
   */
  useLayoutEffect(() => {
    if (!open) return;
    const node = panelRef.current;
    if (!node || !triggerRect || reduced) return;

    const panel = node.getBoundingClientRect();
    if (panel.width === 0 || panel.height === 0) return;

    const scaleX = triggerRect.width / panel.width;
    const scaleY = triggerRect.height / panel.height;
    const dx = triggerRect.left + triggerRect.width / 2 - (panel.left + panel.width / 2);
    const dy = triggerRect.top + triggerRect.height / 2 - (panel.top + panel.height / 2);

    // Invert: snap onto the trigger with no transition. This runs before the
    // browser paints, so the panel is never seen at its final size first.
    node.style.transition = "none";
    node.style.opacity = "0.6";
    node.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;

    // Play, one frame later. A forced reflow is not enough: the panel was
    // inserted in this same commit, and a transition never fires on an
    // element's first style resolution — it would snap instead of morph.
    const raf = requestAnimationFrame(() => {
      node.style.transition = `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1), opacity ${duration}s ease-out`;
      node.style.transform = "";
      node.style.opacity = "1";
    });
    return () => cancelAnimationFrame(raf);
  }, [open, triggerRect, reduced, duration]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="sbg-mp-fade-in absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ animationDuration: `${duration}s` }}
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative max-h-[85vh] w-full max-w-xl overflow-auto rounded-card border border-ink-700 bg-ink-850 shadow-2xl",
          className,
        )}
        // Transform, opacity, and transition are owned by the layout effect
        // above; setting them here too would fight it.
        style={style}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function MorphingDialogTitle({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { titleId } = useMorphing("MorphingDialogTitle");
  return (
    <h2 id={titleId} className={cn("text-xl font-semibold text-ink-0", className)} style={style}>
      {children}
    </h2>
  );
}

export function MorphingDialogSubtitle({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p className={cn("text-sm text-ink-400", className)} style={style}>
      {children}
    </p>
  );
}

export function MorphingDialogDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-sm leading-relaxed text-ink-300", className)}>{children}</div>
  );
}

export function MorphingDialogImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  return <img src={src} alt={alt} className={className} style={style} />;
}

export function MorphingDialogClose({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { setOpen } = useMorphing("MorphingDialogClose");
  return (
    <button
      type="button"
      aria-label={children ? undefined : "Close dialog"}
      onClick={() => setOpen(false)}
      className={cn(
        "absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full bg-ink-900/80 text-ink-200",
        "transition-colors hover:text-ink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
        className,
      )}
    >
      {children ?? <span aria-hidden="true">✕</span>}
    </button>
  );
}

/* ---- MorphingPopover ---------------------------------------------------- */

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  duration: number;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover(component: string) {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <MorphingPopover>.`);
  }
  return context;
}

export interface MorphingPopoverProps {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Seconds for the expand. */
  duration?: number;
}

/**
 * A trigger that expands in place into a panel.
 *
 * The panel is anchored to the trigger rather than portalled, so it inherits
 * position from the surrounding layout and the two read as one surface
 * growing. Closes on outside click as well as Escape.
 */
export function MorphingPopover({
  children,
  className,
  defaultOpen = false,
  open,
  onOpenChange,
  duration = 0.4,
}: MorphingPopoverProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, setOpen]);

  const context = useMemo(
    () => ({ open: isOpen, setOpen, duration }),
    [isOpen, setOpen, duration],
  );

  return (
    <PopoverContext.Provider value={context}>
      <div ref={rootRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function MorphingPopoverTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open, setOpen } = usePopover("MorphingPopoverTrigger");
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        "transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
        open && "pointer-events-none opacity-0",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function MorphingPopoverContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open, setOpen, duration } = usePopover("MorphingPopoverContent");
  const panelRef = useRef<HTMLDivElement>(null);

  useDismissable(open, () => setOpen(false), panelRef);
  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      className={cn(
        "sbg-mp-pop-in absolute left-0 top-0 z-40 min-w-full origin-top-left",
        "rounded-card border border-ink-700 bg-ink-850 p-4 shadow-2xl",
        className,
      )}
      style={{ animationDuration: `${duration}s` }}
    >
      {children}
    </div>
  );
}
