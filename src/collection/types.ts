/**
 * The shape of one piece of work in the collection, and of the controls the
 * workbench renders for it.
 *
 * Every entry in the gallery — shader, element, section, text surface, GPU
 * bench — is a `Work`. The workbench does not know what any of them are; it
 * reads `controls` to build the panel and calls `render` with the current
 * values. Adding a component to the site therefore means adding one object,
 * not touching the previewer.
 */
import type { ReactNode } from "react";

export type ControlValue = number | string | boolean;
export type ControlValues = Record<string, ControlValue>;

export type ControlDef =
  | {
      kind: "range";
      key: string;
      label: string;
      value: number;
      min: number;
      max: number;
      step?: number;
      /** Suffix shown beside the read-out, e.g. "px" or "s". */
      unit?: string;
    }
  | {
      kind: "select";
      key: string;
      label: string;
      value: string;
      options: readonly string[];
    }
  | { kind: "toggle"; key: string; label: string; value: boolean }
  | { kind: "text"; key: string; label: string; value: string; maxLength?: number }
  | { kind: "color"; key: string; label: string; value: string };

/**
 * How the preview stage should hold the work.
 *
 * `fill` gives the component the whole stage (backgrounds, surfaces, sections
 * that bring their own height); `center` puts it in the middle of a padded
 * stage (buttons, badges, cards); `flow` lets it scroll (full sections and
 * anything taller than the stage).
 */
export type PreviewFit = "fill" | "center" | "flow";

export interface Work {
  /** Stable slug — also the `?w=` deep link. */
  id: string;
  name: string;
  /** Gallery filter group, e.g. "Shaders" or "Motion". */
  group: string;
  /** Short label printed on the card, e.g. "Iridescent" or "Foundation". */
  kind: string;
  description: string;
  controls: ControlDef[];
  render: (values: ControlValues) => ReactNode;
  /**
   * How the piece renders once it is put on the page, when that differs from
   * the stage. The GPU benches are the case this exists for: each is a whole
   * application with its own control panel, which belongs in a preview and
   * does not belong floating over someone's headline.
   */
  renderApplied?: (values: ControlValues) => ReactNode;
  /** Usage snippet reflecting the current settings. */
  code?: (values: ControlValues) => string;
  fit?: PreviewFit;
  /** Opens the work on its own page, outside the workbench. */
  href?: string;
  /** CSS background for the gallery card, when the work can supply one. */
  swatch?: string;
  /** Extra classes for the stage, e.g. a light background for dark elements. */
  stageClassName?: string;
  /** Shown in place of, or above, the controls — for works that tune elsewhere. */
  panelNote?: string;
}

/* ---- control constructors ----------------------------------------------- */

export function range(
  key: string,
  label: string,
  value: number,
  min: number,
  max: number,
  step = 1,
  unit?: string,
): ControlDef {
  return { kind: "range", key, label, value, min, max, step, unit };
}

export function select(
  key: string,
  label: string,
  value: string,
  options: readonly string[],
): ControlDef {
  return { kind: "select", key, label, value, options };
}

export function toggle(key: string, label: string, value: boolean): ControlDef {
  return { kind: "toggle", key, label, value };
}

export function text(
  key: string,
  label: string,
  value: string,
  maxLength = 28,
): ControlDef {
  return { kind: "text", key, label, value, maxLength };
}

export function color(key: string, label: string, value: string): ControlDef {
  return { kind: "color", key, label, value };
}

/* ---- value readers ------------------------------------------------------- */

export function defaultsOf(controls: ControlDef[]): ControlValues {
  return Object.fromEntries(controls.map((c) => [c.key, c.value]));
}

export function num(v: ControlValues, key: string, fallback = 0): number {
  const raw = v[key];
  return typeof raw === "number" ? raw : fallback;
}

export function str(v: ControlValues, key: string, fallback = ""): string {
  const raw = v[key];
  return typeof raw === "string" ? raw : fallback;
}

export function bool(v: ControlValues, key: string, fallback = false): boolean {
  const raw = v[key];
  return typeof raw === "boolean" ? raw : fallback;
}

/**
 * Render a prop list as a JSX snippet, dropping anything left `undefined`.
 * Mirrors the helper the surface demos already used, so the code shown under
 * the preview reads like something you would actually paste.
 */
export function usage(
  component: string,
  props: Record<string, ControlValue | undefined>,
  children?: string,
): string {
  const entries = Object.entries(props).filter(
    (entry): entry is [string, ControlValue] =>
      entry[1] !== undefined && entry[1] !== "",
  );
  const lines = entries
    .map(([key, value]) =>
      typeof value === "string"
        ? `  ${key}="${value}"`
        : typeof value === "boolean"
          ? value
            ? `  ${key}`
            : `  ${key}={false}`
          : `  ${key}={${trimNumber(value)}}`,
    );
  const open = lines.length ? `<${component}\n${lines.join("\n")}\n` : `<${component}`;
  return children
    ? `${open}>\n  ${children}\n</${component}>`
    : `${open}${lines.length ? "/>" : " />"}`;
}

/** Numbers in a snippet should read like something a person typed. */
function trimNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
}

/** A dropdown listing every bundled shader, for elements that take one. */
export function shaderSelect(
  ids: readonly string[],
  value: string,
  key = "shader",
  label = "Shader",
): ControlDef {
  return { kind: "select", key, label, value, options: ids };
}
