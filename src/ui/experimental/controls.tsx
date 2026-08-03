import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { sitePath } from "../../core/sitePath";
import { cn } from "../cn";

export interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
}

/** Pointer-attracted button that springs back without an animation dependency. */
export function MagneticButton({
  children,
  strength = 0.24,
  className,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  function move(event: PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * strength;
    const y = (event.clientY - rect.top - rect.height / 2) * strength;
    event.currentTarget.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
  }

  return (
    <button
      ref={ref}
      type="button"
      onPointerMove={move}
      onPointerLeave={reset}
      onBlur={reset}
      onClick={onClick}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-xl bg-ink-0 px-6 text-[15px] font-semibold text-ink-950 shadow-xl shadow-black/25 transition-[transform,background-color] duration-300 ease-out hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
        className,
      )}
    >
      {children}
    </button>
  );
}

export interface WetPaintButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/** Button whose colour rises through the label like a viscous paint layer. */
export function WetPaintButton({
  children,
  className,
  onClick,
}: WetPaintButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative isolate h-12 overflow-hidden rounded-xl border border-brand-300/40 bg-ink-900 px-6 text-[15px] font-semibold text-ink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="sbg-wet-paint absolute inset-x-[-10%] top-full -z-10 h-[180%] rounded-[45%] bg-gradient-to-r from-brand-600 via-violet-500 to-accent-500 transition-transform duration-500 ease-out group-hover:-translate-y-[76%] group-focus-visible:-translate-y-[76%]"
      />
      {children}
    </button>
  );
}

export interface GooeyOption {
  label: ReactNode;
  value: string;
}

export interface GooeyDropdownProps {
  label: ReactNode;
  options: GooeyOption[];
  onSelect?: (value: string) => void;
  className?: string;
}

/** Soft, merging dropdown built from blur/contrast rather than an SVG filter. */
export function GooeyDropdown({
  label,
  options,
  onSelect,
  className,
}: GooeyDropdownProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="relative z-20 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
      >
        {label} <span aria-hidden="true">{open ? "×" : "+"}</span>
      </button>
      <div
        id={id}
        className={cn(
          "sbg-gooey absolute top-12 z-10 flex flex-col items-center gap-2 pt-4 transition-all duration-300",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-5 opacity-0",
        )}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            style={{ transitionDelay: `${index * 35}ms` }}
            onClick={() => {
              onSelect?.(option.value);
              setOpen(false);
            }}
            className="min-w-36 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface VanishingInputProps {
  placeholders: string[];
  onSubmit?: (value: string) => void;
  className?: string;
}

/** Search or prompt field whose example prompts cycle and dissolve while idle. */
export function VanishingInput({
  placeholders,
  onSubmit,
  className,
}: VanishingInputProps) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused || value || placeholders.length < 2) return;
    const interval = window.setInterval(
      () => setIndex((current) => (current + 1) % placeholders.length),
      2600,
    );
    return () => window.clearInterval(interval);
  }, [focused, placeholders.length, value]);

  return (
    <form
      className={cn(
        "relative flex items-center rounded-2xl border border-ink-700 bg-ink-900/90 p-2 pl-5 shadow-xl shadow-black/20",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onSubmit?.(value.trim());
      }}
    >
      <label className="sr-only" htmlFor="sbg-vanishing-input">
        Enter a prompt
      </label>
      <input
        id="sbg-vanishing-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="relative z-10 h-10 min-w-0 flex-1 bg-transparent text-[15px] text-ink-0 outline-none"
      />
      {!value && !focused && placeholders[index] && (
        <span
          key={index}
          aria-hidden="true"
          className="sbg-vanish-placeholder pointer-events-none absolute left-5 right-24 truncate text-[15px] text-ink-500"
        >
          {placeholders[index]}
        </span>
      )}
      <button
        type="submit"
        className="grid size-10 place-items-center rounded-xl bg-ink-0 text-sm font-semibold text-ink-950"
        aria-label="Submit"
      >
        ↗
      </button>
    </form>
  );
}

export interface CodeComparisonProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

/** Draggable before/after comparison for code, copy, or terminal output. */
export function CodeComparison({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: CodeComparisonProps) {
  const [position, setPosition] = useState(52);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 font-mono",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-ink-500">
        <span>{beforeLabel}</span>
        <span>{afterLabel}</span>
      </div>
      <div className="relative min-h-64">
        <pre className="absolute inset-0 overflow-auto p-5 text-xs leading-6 text-rose-200">
          <code>{before}</code>
        </pre>
        <div
          className="absolute inset-0 overflow-hidden border-l border-accent-400 bg-[#081216]"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <pre className="absolute inset-0 overflow-auto p-5 text-xs leading-6 text-emerald-200">
            <code>{after}</code>
          </pre>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-accent-300"
          style={{ left: `${position}%` }}
        />
        <input
          type="range"
          min="8"
          max="92"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Reveal improved code"
          className="absolute inset-0 size-full cursor-col-resize opacity-0"
        />
      </div>
    </div>
  );
}

export interface LinkPreviewProps {
  href: string;
  children: ReactNode;
  preview: ReactNode;
  className?: string;
}

/** Accessible hover/focus preview for project, article, and product links. */
export function LinkPreview({
  href,
  children,
  preview,
  className,
}: LinkPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-block", className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      <a
        href={sitePath(href)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="font-medium text-brand-200 underline decoration-brand-400/50 underline-offset-4"
      >
        {children}
      </a>
      <span
        role="presentation"
        className={cn(
          "absolute bottom-[calc(100%+12px)] left-1/2 z-40 w-72 -translate-x-1/2 overflow-hidden rounded-xl border border-white/12 bg-ink-850 p-2 shadow-2xl shadow-black/50 transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {preview}
      </span>
    </span>
  );
}
