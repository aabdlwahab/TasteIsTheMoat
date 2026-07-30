import { useEffect, useState } from "react";
import { cn } from "./cn";

export interface CopyFieldProps {
  value: string;
  label?: string;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}

/** One-line code or command field with clipboard feedback. */
export function CopyField({
  value,
  label,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className,
}: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-ink-400">
          {label}
        </p>
      )}
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-ink-700 bg-ink-900/90 p-1.5 pl-4">
        <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink-100">
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          className="h-9 shrink-0 rounded-lg bg-white/8 px-3 text-xs font-semibold text-ink-100 transition-colors hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-live="polite"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}
