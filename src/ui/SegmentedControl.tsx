import { useId, useState } from "react";
import { cn } from "./cn";

export interface SegmentOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  className?: string;
}

/** Controlled or uncontrolled segmented selector with radio semantics. */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  label = "Choose an option",
  className,
}: SegmentedControlProps) {
  const groupId = useId();
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const selected = value ?? internalValue;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex rounded-xl border border-ink-700 bg-ink-900/80 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const checked = selected === option.value;
        return (
          <button
            key={option.value}
            id={`${groupId}-${option.value}`}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => {
              setInternalValue(option.value);
              onChange?.(option.value);
            }}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
              checked
                ? "bg-ink-0 text-ink-950 shadow-sm"
                : "text-ink-300 hover:text-ink-0",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
