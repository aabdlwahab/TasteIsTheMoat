import { useEffect, useRef, useState } from "react";
import { cn } from "./cn";

export interface CodeBlockProps {
  /** The source to show and copy. Rendered verbatim. */
  value: string;
  /** Small caption above the block, e.g. a filename or "Usage". */
  label?: string;
  /** Language tag shown in the corner. Purely a label — nothing is parsed. */
  language?: string;
  /** Cap the height and scroll past it. */
  maxHeight?: number | string;
  className?: string;
}

type CopyState = "idle" | "copied" | "failed";

/**
 * A multi-line code block with a copy button.
 *
 * `CopyField` covers one-line commands; this is for snippets you actually
 * paste into a file. Copy failure is surfaced rather than swallowed —
 * `navigator.clipboard` is unavailable outside secure contexts, and a button
 * that silently does nothing is worse than one that admits it, so the text is
 * also selected as a fallback the visitor can finish with the keyboard.
 */
export function CodeBlock({
  value,
  label,
  language,
  maxHeight = "22rem",
  className,
}: CodeBlockProps) {
  const [state, setState] = useState<CopyState>("idle");
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (state === "idle") return;
    const timeout = window.setTimeout(() => setState("idle"), 2200);
    return () => window.clearTimeout(timeout);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      // Select the block so ⌘C / Ctrl+C still works.
      const node = codeRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setState("failed");
    }
  }

  const buttonLabel =
    state === "copied" ? "Copied" : state === "failed" ? "Press ⌘C" : "Copy";

  return (
    <div className={cn("w-full min-w-0", className)}>
      {label && (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-ink-400">
          {label}
        </p>
      )}
      <div className="relative min-w-0 rounded-xl border border-ink-700 bg-ink-900/90">
        <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
          {language && (
            <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-500">
              {language}
            </span>
          )}
          <button
            type="button"
            onClick={copy}
            aria-live="polite"
            className={cn(
              "h-8 rounded-lg px-3 text-xs font-semibold transition-colors",
              "outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
              state === "copied"
                ? "bg-accent-500/20 text-accent-400"
                : state === "failed"
                  ? "bg-white/8 text-ink-300"
                  : "bg-white/8 text-ink-100 hover:bg-white/14",
            )}
          >
            {buttonLabel}
          </button>
        </div>
        {/* Wide snippets scroll inside the block rather than widening the page. */}
        <pre
          className="overflow-auto p-4 pr-24 text-[12.5px] leading-relaxed"
          style={{ maxHeight }}
        >
          <code ref={codeRef} className="font-mono text-ink-200">
            {value}
          </code>
        </pre>
      </div>
    </div>
  );
}
