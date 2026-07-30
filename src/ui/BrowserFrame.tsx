import type { ReactNode } from "react";
import { cn } from "./cn";

export interface BrowserFrameProps {
  /** Shown in the fake address bar. */
  url?: string;
  children: ReactNode;
  className?: string;
  /** Glow behind the frame, to lift it off a dark section. */
  glow?: boolean;
}

/**
 * Browser chrome around a screenshot or live demo.
 *
 * Purely decorative, so the whole chrome is `aria-hidden` — the content inside
 * stays in the accessibility tree. Product screenshots read as more real inside
 * a frame, which is why every marketing site does this.
 */
export function BrowserFrame({
  url = "app.example.com",
  children,
  className,
  glow = true,
}: BrowserFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {glow && (
        <div
          aria-hidden="true"
          className="absolute -inset-x-8 -top-6 bottom-0 -z-10 rounded-[28px] bg-brand-500/25 blur-3xl"
        />
      )}
      <div className="overflow-hidden rounded-xl border border-white/12 bg-ink-850 shadow-2xl shadow-black/50">
        <div
          aria-hidden="true"
          className="flex items-center gap-2 border-b border-white/8 bg-ink-800/80 px-3.5 py-2.5"
        >
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="ml-2 flex-1 truncate rounded-md bg-ink-900/70 px-2.5 py-1 text-[11px] text-ink-400">
            {url}
          </span>
        </div>
        <div className="bg-ink-900">{children}</div>
      </div>
    </div>
  );
}
