import { useEffect, useState, type ReactNode } from "react";
import { sitePath } from "../core/sitePath";
import { cn } from "../ui/cn";

export interface AnnouncementBarProps {
  children: ReactNode;
  /** Turns the whole bar into a link. */
  href?: string;
  /** Show a dismiss button. */
  dismissible?: boolean;
  /**
   * localStorage key used to remember dismissal. Change it when the message
   * changes, or returning visitors will never see the new one.
   */
  storageKey?: string;
  /** `gradient` uses brand colours; `subtle` is a quiet hairline bar. */
  variant?: "gradient" | "subtle";
  className?: string;
}

/**
 * Thin bar above the nav for launches, events and offers.
 *
 * Dismissal persists in localStorage under a key that should encode the
 * message, so shipping a new announcement is not silently hidden from everyone
 * who dismissed the previous one. Renders nothing until the stored value has
 * been read, which avoids the bar flashing in and then vanishing.
 */
export function AnnouncementBar({
  children,
  href,
  dismissible = true,
  storageKey = "sbg-announcement",
  variant = "gradient",
  className,
}: AnnouncementBarProps) {
  const [state, setState] = useState<"loading" | "shown" | "hidden">("loading");

  useEffect(() => {
    if (!dismissible) {
      setState("shown");
      return;
    }
    try {
      setState(
        localStorage.getItem(storageKey) === "dismissed" ? "hidden" : "shown",
      );
    } catch {
      // Private mode or blocked storage: show it and don't persist.
      setState("shown");
    }
  }, [dismissible, storageKey]);

  if (state !== "shown") return null;

  function dismiss() {
    setState("hidden");
    try {
      localStorage.setItem(storageKey, "dismissed");
    } catch {
      /* not persistable — fine */
    }
  }

  const inner = (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
      {children}
    </span>
  );

  return (
    <div
      className={cn(
        "relative z-[60] w-full text-center text-[13px]",
        variant === "gradient"
          ? "bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white"
          : "border-b border-ink-700 bg-ink-900 text-ink-200",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-10 py-2.5">
        {href ? (
          <a href={sitePath(href)} className="underline-offset-4 hover:underline">
            {inner}
          </a>
        ) : (
          inner
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className={cn(
            "absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md",
            "transition-colors hover:bg-black/15",
          )}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 2.5l7 7M9.5 2.5l-7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
