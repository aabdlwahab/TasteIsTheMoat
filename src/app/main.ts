import "./styles.css";
import "./compile-check";
import { ShaderBackground } from "../core/renderer";
import type { ShaderDef, UniformDef } from "../core/types";
import { categories, shaderList } from "../shaders/index";
import { createEditor, type Editor } from "./editor";
import {
  download,
  standaloneHTML,
  usageSnippet,
  type UniformDescriptor,
} from "./export";
import { ThumbnailPool } from "./thumbnails";

type Value = number | number[];

/** A "start from scratch" template appended to the gallery. */
const blankTemplate: ShaderDef = {
  id: "blank",
  name: "Blank",
  description: "A minimal starting point — build your own from here.",
  category: "gradient",
  uniforms: {
    u_colorA: { type: "color", value: [0.1, 0.1, 0.2], label: "Color A" },
    u_colorB: { type: "color", value: [0.9, 0.4, 0.7], label: "Color B" },
    u_scale: { type: "float", value: 2.0, min: 0.3, max: 6, label: "Scale" },
  },
  fragment: `void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float t = u_time;

  // Start here. Every library helper is available:
  //   snoise(vec2|vec3), fbm(...), palette(t, a,b,c,d),
  //   hsv2rgb(...), rot(angle), grain(uv), and u_mouse.
  float n = fbm(p * u_scale + t * 0.2) * 0.5 + 0.5;
  vec3 col = mix(u_colorA, u_colorB, n);

  gl_FragColor = vec4(col, 1.0);
}`,
};

const gallery = [...shaderList, blankTemplate];

/** Per-shader session so edits survive switching back and forth. */
interface Session {
  body?: string;
  uniforms: Record<string, Value>;
}
const sessions = new Map<string, Session>();

const requestedShader = new URLSearchParams(window.location.search).get("shader");
let current: ShaderDef = gallery.find((shader) => shader.id === requestedShader) ?? gallery[0];
let main: ShaderBackground;
let editor: Editor;
let thumbs: ThumbnailPool;
let debounce = 0;

// ---- DOM refs (populated in boot) -----------------------------------------
const $ = <T extends HTMLElement>(sel: string) =>
  document.querySelector<T>(sel)!;

function boot(): void {
  thumbs = new ThumbnailPool(288, 162);
  buildGallery();

  const canvas = $<HTMLCanvasElement>("#preview");
  main = new ShaderBackground(canvas, current, {
    maxDpr: 2,
    pauseWhenHidden: false,
    onFps: (fps) => ($("#fps").textContent = `${Math.round(fps)} fps`),
    onError: (msg) => showError(msg),
  });

  editor = createEditor($("#editor"), current.fragment, onEdit);

  // Handy for debugging from the console in dev.
  if (import.meta.env.DEV) {
    (window as unknown as { __bg: ShaderBackground }).__bg = main;
  }

  wireToolbar();
  wireActions();

  const search = $<HTMLInputElement>("#search");
  search.addEventListener("input", () => {
    searchTerm = search.value.trim().toLowerCase();
    applyFilter();
  });

  select(current);
}

// ---- gallery --------------------------------------------------------------
/** Active category filter, or null for "all". */
let activeCategory: string | null = null;
let searchTerm = "";

function buildGallery(): void {
  const root = $("#gallery-list");
  for (const def of gallery) {
    const card = document.createElement("button");
    card.className = "card";
    card.dataset.id = def.id;
    card.dataset.category = def.category;
    card.dataset.search = `${def.name} ${def.description} ${def.category}`
      .toLowerCase();
    card.innerHTML = `
      <div class="card-canvas">
        <canvas></canvas>
        ${def.interactive ? '<span class="badge" title="Responds to the cursor">✦ cursor</span>' : ""}
      </div>
      <div class="card-meta">
        <span class="card-name">${def.name}</span>
        <span class="card-desc">${def.description}</span>
      </div>`;
    card.addEventListener("click", () => {
      select(def);
      revealPreview();
    });
    root.appendChild(card);

    // All thumbnails share one WebGL context — see thumbnails.ts for why.
    const mini = card.querySelector("canvas") as HTMLCanvasElement;
    thumbs.add(mini, def);
  }

  buildFilters();
  applyFilter();
}

function buildFilters(): void {
  const root = $("#filters");
  const all: { id: string | null; label: string }[] = [
    { id: null, label: "All" },
    ...categories.map((c) => ({ id: c.id as string, label: c.label })),
  ];
  for (const c of all) {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = c.label;
    b.dataset.cat = c.id ?? "";
    b.addEventListener("click", () => {
      activeCategory = c.id;
      applyFilter();
    });
    root.appendChild(b);
  }
}

/**
 * Bring the preview back into view after picking a shader.
 *
 * The gallery sits below the preview, so choosing a card near the bottom of the
 * grid would otherwise update something the user cannot see. Only scrolls when
 * the preview is actually off-screen, so picking from the top of the grid does
 * not jump the page around.
 */
function revealPreview(): void {
  const preview = document.querySelector(".preview");
  if (!preview) return;
  const r = preview.getBoundingClientRect();
  const visible = r.top >= 56 && r.bottom <= window.innerHeight;
  if (visible) return;
  preview.scrollIntoView({
    behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "nearest",
  });
}

function applyFilter(): void {
  let visible = 0;
  document.querySelectorAll<HTMLElement>(".card").forEach((card) => {
    const matchesCat =
      !activeCategory || card.dataset.category === activeCategory;
    const matchesSearch =
      !searchTerm || (card.dataset.search ?? "").includes(searchTerm);
    const show = matchesCat && matchesSearch;
    card.style.display = show ? "" : "none";
    if (show) visible++;
  });

  document.querySelectorAll<HTMLElement>(".chip").forEach((chip) => {
    chip.classList.toggle("active", (chip.dataset.cat || null) === activeCategory);
  });

  $("#shader-count").textContent = `${visible}`;
  $("#no-results").style.display = visible === 0 ? "block" : "none";
}

// ---- selection ------------------------------------------------------------
function select(def: ShaderDef): void {
  current = def;
  const session = sessions.get(def.id) ?? { uniforms: {} };
  sessions.set(def.id, session);

  main.load(def);
  if (session.body) main.setFragment(session.body);
  for (const [name, value] of Object.entries(session.uniforms)) {
    main.setUniform(name, value);
  }

  editor.setDoc(session.body ?? def.fragment);
  showError(null);
  buildControls(def);
  $("#usage").textContent = usageSnippet(def.id);
  $("#shader-name").textContent = def.name;
  $("#shader-desc").textContent = def.description;

  // Nudge the user to actually move the cursor over interactive shaders.
  const hint = $("#interactive-hint");
  hint.style.display = def.interactive ? "flex" : "none";

  document.querySelectorAll<HTMLElement>(".card").forEach((c) => {
    c.classList.toggle("active", c.dataset.id === def.id);
  });
}

// ---- editing --------------------------------------------------------------
function onEdit(body: string): void {
  window.clearTimeout(debounce);
  debounce = window.setTimeout(() => {
    getSession().body = body;
    main.setFragment(body);
  }, 250);
}

// ---- uniform controls -----------------------------------------------------
function buildControls(def: ShaderDef): void {
  const root = $("#uniforms");
  root.innerHTML = "";
  const entries = Object.entries(def.uniforms);
  if (entries.length === 0) {
    root.innerHTML = `<p class="muted">This shader has no adjustable uniforms.</p>`;
    return;
  }
  for (const [name, udef] of entries) {
    root.appendChild(controlFor(name, udef));
  }
}

function controlFor(name: string, def: UniformDef): HTMLElement {
  const row = document.createElement("div");
  row.className = "control";
  const label = def.label ?? name;

  if (def.type === "color") {
    const value = current01(name) as number[];
    row.innerHTML = `<label>${label}</label>`;
    const input = document.createElement("input");
    input.type = "color";
    input.value = rgbToHex(value);
    input.addEventListener("input", () => {
      const rgb = hexToRgb(input.value);
      setUniform(name, rgb);
    });
    row.appendChild(input);
  } else if (def.type === "float") {
    const value = current01(name) as number;
    const step = def.step ?? (def.max - def.min) / 200;
    row.innerHTML = `<label>${label}<span class="val">${fmt(value)}</span></label>`;
    const input = slider(def.min, def.max, step, value, (v) => {
      (row.querySelector(".val") as HTMLElement).textContent = fmt(v);
      setUniform(name, v);
    });
    row.appendChild(input);
  } else {
    // vec2 — two sliders.
    const value = current01(name) as number[];
    row.innerHTML = `<label>${label}</label>`;
    const wrap = document.createElement("div");
    wrap.className = "vec2";
    ["x", "y"].forEach((_, i) => {
      const step = def.step ?? (def.max - def.min) / 200;
      wrap.appendChild(
        slider(def.min, def.max, step, value[i], (v) => {
          const cur = (current01(name) as number[]).slice();
          cur[i] = v;
          setUniform(name, cur);
        }),
      );
    });
    row.appendChild(wrap);
  }
  return row;
}

function slider(
  min: number,
  max: number,
  step: number,
  value: number,
  onInput: (v: number) => void,
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.addEventListener("input", () => onInput(parseFloat(input.value)));
  return input;
}

function setUniform(name: string, value: Value): void {
  main.setUniform(name, value);
  getSession().uniforms[name] = value;
}

/** Current uniform value, preferring live renderer state over the default. */
function current01(name: string): Value {
  const live = main.getUniform(name);
  if (live !== undefined) return live;
  return current.uniforms[name].value;
}

// ---- toolbar --------------------------------------------------------------
function wireToolbar(): void {
  const playBtn = $("#play");
  playBtn.addEventListener("click", () => {
    const playing = main.toggle();
    playBtn.textContent = playing ? "❚❚" : "▶";
    playBtn.title = playing ? "Pause" : "Play";
  });
  $("#restart").addEventListener("click", () => main.restart());
  $("#fullscreen").addEventListener("click", () => {
    const el = $(".preview");
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  });
}

// ---- actions --------------------------------------------------------------
function wireActions(): void {
  $("#reset").addEventListener("click", () => {
    sessions.delete(current.id);
    select(current);
    showError(null);
  });

  $("#randomize").addEventListener("click", () => {
    for (const [name, def] of Object.entries(current.uniforms)) {
      if (def.type === "color") setUniform(name, randomColor());
    }
    buildControls(current);
  });

  $("#copy-glsl").addEventListener("click", (e) =>
    copy(e.target as HTMLElement, main.getFragmentSource()),
  );
  $("#copy-usage").addEventListener("click", (e) =>
    copy(e.target as HTMLElement, usageSnippet(current.id)),
  );
  $("#export-html").addEventListener("click", () => {
    const descriptors: UniformDescriptor[] = Object.entries(
      current.uniforms,
    ).map(([name, def]) => ({
      name,
      type: def.type,
      value: current01(name),
    }));
    const html = standaloneHTML(
      current.name,
      main.getFragmentSource(),
      descriptors,
    );
    download(`${current.id}-background.html`, html, "text/html");
  });
}

// ---- helpers --------------------------------------------------------------
function getSession(): Session {
  let s = sessions.get(current.id);
  if (!s) {
    s = { uniforms: {} };
    sessions.set(current.id, s);
  }
  return s;
}

function showError(msg: string | null): void {
  const box = $("#error");
  if (msg) {
    box.textContent = msg;
    box.classList.add("visible");
  } else {
    box.textContent = "";
    box.classList.remove("visible");
  }
}

async function copy(btn: HTMLElement, text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    const prev = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = prev), 1200);
  } catch {
    /* clipboard blocked — no-op */
  }
}

function fmt(v: number): string {
  return Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2);
}

function rgbToHex(rgb: number[]): string {
  return (
    "#" +
    rgb
      .map((c) =>
        Math.max(0, Math.min(255, Math.round(c * 255)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function hexToRgb(hex: string): number[] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
}

function randomColor(): number[] {
  const h = Math.random();
  const s = 0.5 + Math.random() * 0.4;
  const v = 0.5 + Math.random() * 0.45;
  // simple HSV -> RGB
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const [r, g, b] = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ][i % 6];
  return [r, g, b];
}

// Kick everything off. Must run last: module-level `let` bindings above are
// in their temporal dead zone until their declarations have executed.
boot();
