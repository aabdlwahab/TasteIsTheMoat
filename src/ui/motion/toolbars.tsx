import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../cn";

/**
 * The two toolbars are compositions rather than primitives — upstream they are
 * shown as example code with no prop table. Both are given a data-driven API
 * here so they can be dropped in without copying their internals.
 */

/* ---- ToolbarDynamic ----------------------------------------------------- */

export interface ToolbarAction {
  id: string;
  label: string;
  icon: ReactNode;
  /** Placeholder for the inline input this action opens. */
  placeholder?: string;
}

export interface ToolbarDynamicProps {
  actions: ToolbarAction[];
  className?: string;
  /** Called with the action id and the text that was submitted. */
  onSubmit?: (id: string, value: string) => void;
  /** Seconds for the morph between states. */
  duration?: number;
}

/**
 * A toolbar that becomes the control you picked.
 *
 * Selecting an action replaces the row of buttons with a single input for that
 * action, then returns. The container animates its own width between the two
 * states so the surrounding layout never jumps.
 */
export function ToolbarDynamic({
  actions,
  className,
  onSubmit,
  duration = 0.35,
}: ToolbarDynamicProps) {
  const [active, setActive] = useState<ToolbarAction | null>(null);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  const dismiss = () => {
    setActive(null);
    setValue("");
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-2xl border border-white/10 bg-ink-850/80 p-1.5 backdrop-blur-md",
        "transition-[width] ease-out motion-reduce:transition-none",
        className,
      )}
      style={{ transitionDuration: `${duration}s` }}
      onKeyDown={(event) => {
        if (event.key === "Escape") dismiss();
      }}
    >
      {active ? (
        <form
          className="sbg-mp-fade-in flex items-center gap-2 px-1"
          style={{ animationDuration: `${duration}s` }}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.(active.id, value);
            dismiss();
          }}
        >
          <span aria-hidden="true" className="grid size-8 place-items-center text-ink-300">
            {active.icon}
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={active.placeholder ?? active.label}
            aria-label={active.label}
            className="w-52 bg-transparent text-sm text-ink-0 outline-none placeholder:text-ink-400"
          />
          <button
            type="button"
            onClick={dismiss}
            aria-label="Cancel"
            className="grid size-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white/10 hover:text-ink-0"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </form>
      ) : (
        <div className="sbg-mp-fade-in flex items-center gap-1" style={{ animationDuration: `${duration}s` }}>
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              aria-label={action.label}
              onClick={() => setActive(action)}
              className={cn(
                "grid size-9 place-items-center rounded-lg text-ink-300",
                "transition-colors hover:bg-white/10 hover:text-ink-0",
                "outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
              )}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- ToolbarExpandable -------------------------------------------------- */

export interface ToolbarPanel {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

export interface ToolbarExpandableProps {
  panels: ToolbarPanel[];
  className?: string;
  /** Seconds for the expand and the highlight slide. */
  duration?: number;
}

/**
 * A compact toolbar that opens a panel above its buttons.
 *
 * The container animates to the measured height of the open panel rather than
 * to a fixed value, so panels of different sizes each get an honest transition
 * and content is never clipped. Selecting the open item closes it.
 */
export function ToolbarExpandable({
  panels,
  className,
  duration = 0.35,
}: ToolbarExpandableProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const active = panels.find((panel) => panel.id === activeId) ?? null;

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const read = () => setHeight(active ? el.scrollHeight : 0);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  return (
    <div
      className={cn(
        "inline-flex w-72 flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-850/80 backdrop-blur-md",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "Escape") setActiveId(null);
      }}
    >
      <div
        className="overflow-hidden transition-[height] ease-out motion-reduce:transition-none"
        style={{ height, transitionDuration: `${duration}s` }}
        aria-hidden={!active}
      >
        <div ref={contentRef} className="p-4 text-sm text-ink-200">
          {active?.content}
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-white/5 p-1.5">
        {panels.map((panel) => {
          const isActive = panel.id === activeId;
          return (
            <button
              key={panel.id}
              type="button"
              aria-expanded={isActive}
              aria-label={panel.label}
              onClick={() => setActiveId(isActive ? null : panel.id)}
              className={cn(
                "grid size-9 place-items-center rounded-lg transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                isActive
                  ? "bg-brand-500/20 text-brand-200"
                  : "text-ink-400 hover:bg-white/10 hover:text-ink-0",
              )}
            >
              {panel.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
