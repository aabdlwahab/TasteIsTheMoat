/**
 * The control panel widgets.
 *
 * One component per `ControlDef` kind, plus the panel that lays them out. They
 * are deliberately plain: the interesting thing on the page is whatever sits
 * in the preview stage, so the controls stay quiet, dense, and legible over a
 * dark surface.
 */
import type { ControlDef, ControlValue, ControlValues } from "./types";

interface FieldProps {
  control: ControlDef;
  value: ControlValue;
  onChange: (value: ControlValue) => void;
}

function Label({ children, readout }: { children: string; readout?: string }) {
  return (
    <span className="mb-2 flex items-baseline justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
      <span className="truncate">{children}</span>
      {readout ? <span className="tabular-nums text-ink-200">{readout}</span> : null}
    </span>
  );
}

function Field({ control, value, onChange }: FieldProps) {
  switch (control.kind) {
    case "range": {
      const current = typeof value === "number" ? value : control.value;
      return (
        <label className="block">
          <Label readout={`${roundish(current)}${control.unit ?? ""}`}>
            {control.label}
          </Label>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            value={current}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-full accent-brand-400"
          />
        </label>
      );
    }
    case "select": {
      const current = typeof value === "string" ? value : control.value;
      // Past a handful of options, chips become a wall. The shader picker has
      // sixty-nine of them, so it collapses into a normal dropdown.
      if (control.options.length > 7) {
        return (
          <label className="block">
            <Label>{control.label}</Label>
            <select
              value={current}
              onChange={(event) => onChange(event.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-0 outline-none transition-colors focus:border-brand-400"
            >
              {control.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        );
      }
      return (
        <div>
          <Label>{control.label}</Label>
          <div className="flex flex-wrap gap-1.5">
            {control.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                aria-pressed={option === current}
                className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${
                  option === current
                    ? "bg-brand-500 font-semibold text-black"
                    : "bg-white/8 text-ink-300 hover:bg-white/16"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case "toggle": {
      const current = typeof value === "boolean" ? value : control.value;
      return (
        <button
          type="button"
          role="switch"
          aria-checked={current}
          onClick={() => onChange(!current)}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2 text-left text-xs text-ink-200 transition-colors hover:border-ink-500"
        >
          <span className="truncate">{control.label}</span>
          <span
            className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${
              current ? "bg-brand-500" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-0.5 size-3 rounded-full bg-white transition-[left] ${
                current ? "left-[1.125rem]" : "left-0.5"
              }`}
            />
          </span>
        </button>
      );
    }
    case "text": {
      const current = typeof value === "string" ? value : control.value;
      return (
        <label className="block">
          <Label>{control.label}</Label>
          <input
            value={current}
            maxLength={control.maxLength}
            spellCheck={false}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-0 outline-none transition-colors focus:border-brand-400"
          />
        </label>
      );
    }
    case "color": {
      const current = typeof value === "string" ? value : control.value;
      return (
        <label className="block">
          <Label readout={current}>{control.label}</Label>
          <input
            type="color"
            value={current}
            onChange={(event) => onChange(event.target.value)}
            className="h-8 w-full cursor-pointer rounded-lg border border-ink-700 bg-ink-900 p-1"
          />
        </label>
      );
    }
  }
}

export function ControlPanel({
  controls,
  values,
  onChange,
  note,
}: {
  controls: ControlDef[];
  values: ControlValues;
  onChange: (key: string, value: ControlValue) => void;
  note?: string;
}) {
  if (controls.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-700 px-4 py-6 text-sm leading-relaxed text-ink-500">
        {note
          ?? "This one has nothing to tune — it is the whole experience, and it runs on its own page."}
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
      {note ? (
        <p className="text-sm leading-relaxed text-ink-500 sm:col-span-2 lg:col-span-1">{note}</p>
      ) : null}
      {controls.map((control) => (
        <Field
          key={control.key}
          control={control}
          value={values[control.key]}
          onChange={(value) => onChange(control.key, value)}
        />
      ))}
    </div>
  );
}

function roundish(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(Math.abs(value) < 1 ? 2 : 1);
}
