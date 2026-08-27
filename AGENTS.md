# Adding to the gallery

Instructions for agents working in this repository. The home page is a
**workbench**: one live preview stage with a control panel beside it, and a
gallery of every piece underneath. Selecting a card mounts the real component
into the stage — nothing on this page is a screenshot standing in for code.

Adding a piece means adding **one object** to one array. The workbench has no
knowledge of any specific component: it reads `controls` to build the panel and
calls `render(values)` to draw the stage. If you find yourself editing
`workbench.tsx` to make your piece appear, you are doing it wrong.

---

## 1. Pick the file

Each group is one module under `src/collection/works/`, exporting one array:

| Group | File | Export | For |
|---|---|---|---|
| `Shaders` | `shaders.tsx` | `shaderWorks` | **Generated.** Do not edit — see §7 |
| `Foundation` | `foundation.tsx` | `foundationWorks` | Buttons, cards, badges, layout primitives |
| `Shader-native` | `shaderNative.tsx` | `shaderNativeWorks` | Components that host a running shader |
| `Experimental` | `experimental.tsx` | `experimentalWorks` | Controls, physical cards, kinetic type, spatial, reactive media |
| `Motion` | `motion.tsx` | `motionWorks` | The `taste-is-the-moat/motion` collection |
| `WebGL type` | `surfaces.tsx` | `surfaceWorks` | Text surfaces (particles, glyphs, lens, shatter, fluid) |
| `Sections` | `sections.tsx` | `sectionWorks` | The React section library |
| `GPU lab` | `gpu.tsx` | `gpuWorks` | **Generated** from a bench list — see §8 |

Complete websites are **not** in the gallery. They live in
`src/collection/websites.tsx` and have a different shape — see §9.

Adding a *new group* also means adding its name to `groups` in
`src/collection/works/index.ts`, or the filter chip will not appear.

---

## 2. Write the `Work`

```ts
export interface Work {
  id: string;            // stable slug, unique across ALL groups; also the ?w= deep link
  name: string;          // the component's real name, e.g. "MorphingDialog"
  group: string;         // must match a name in `groups`
  kind: string;          // short card label, e.g. "Physical cards"
  description: string;   // one sentence: what it does and why you would reach for it
  controls: ControlDef[];
  render: (values: ControlValues) => ReactNode;
  code?: (values: ControlValues) => string;  // usage snippet, regenerated per change
  fit?: "fill" | "center" | "flow";          // default "center"
  href?: string;         // overrides the "Full page ↗" target
  swatch?: string;       // CSS background for the card when no still exists
  stageClassName?: string;
  panelNote?: string;    // shown above (or instead of) the controls
}
```

**`id` must be unique across every group.** `worksById` is a `Map`, so a
collision silently replaces the earlier piece and the deep link breaks. Prefix
where a name could clash: motion entries use `mp-`, sections use `section-`,
shaders use `shader-`, GPU benches use `gpu-`.

A complete entry, in `experimental.tsx`:

```tsx
{
  ...base("elastic-tabs", "ElasticTabs", "Controls", "Tabs whose indicator stretches toward the one you are moving to."),
  fit: "center",
  controls: [
    range("count", "Tabs", 4, 2, 6),
    range("stretch", "Stretch", 1.4, 1, 3, 0.1, "×"),
    toggle("labels", "Show labels", true),
  ],
  render: (v) => (
    <ElasticTabs
      stretch={num(v, "stretch", 1.4)}
      showLabels={bool(v, "labels", true)}
      tabs={["Overview", "Analytics", "Reports", "Settings", "Billing", "Team"].slice(0, num(v, "count", 4))}
    />
  ),
  code: (v) => usage("ElasticTabs", { stretch: num(v, "stretch", 1.4), showLabels: bool(v, "labels", true) }),
},
```

Most files define a local `base(id, name, kind, description)` helper that fills
in `group`. Use it if the file has one.

---

## 3. Controls

Import the constructors from `../types`. Every control needs a `key`, and
`render` reads that key back through a typed reader.

| Constructor | Signature | Read with |
|---|---|---|
| `range` | `range(key, label, value, min, max, step?, unit?)` | `num(v, key, fallback)` |
| `select` | `select(key, label, value, options)` | `str(v, key, fallback)` |
| `toggle` | `toggle(key, label, value)` | `bool(v, key, fallback)` |
| `text` | `text(key, label, value, maxLength?)` | `str(v, key, fallback)` |
| `color` | `color(key, label, value)` — hex in, hex out | `str(v, key, fallback)` |
| `shaderSelect` | `shaderSelect(ids, value, key?, label?)` | `str(v, "shader", fallback)` |

Always pass the same default to the reader as the control declares. The reader
fallback is what renders on the very first frame and after a Reset.

A `select` with more than 7 options renders as a dropdown instead of chips —
that is how the 69-shader picker stays usable. You get this for free.

`color` gives you a hex string. Shader uniforms and text surfaces want
`[r, g, b]` in 0–1, so convert with `hexToRgb` from `../../core/color`.

### What to expose

Expose the props that change **how the piece reads**: variant, count, duration,
speed, text, colour, direction, size. That is the point of the page — a visitor
should be able to answer "can this do what I need?" without opening the source.

Do **not** expose `className`. A free-text class field in a preview panel is a
way to break the demo and nothing else.

Aim for 2–8 controls. If a component genuinely has more (the text surfaces have
ten), that is fine — the panel scrolls.

---

## 4. Choosing `fit`

| `fit` | Stage behaviour | Use for |
|---|---|---|
| `center` | Centred in a padded stage | Buttons, badges, cards, dialogs — anything sized by its own content |
| `fill` | Given the whole stage, no padding | Backgrounds, shaders, text surfaces, canvases, iframes |
| `flow` | Scrolls vertically inside the stage | Full sections, scroll-driven pieces, anything taller than the stage |

For `flow` pieces driven by scrolling, add a line telling the visitor the stage
scrolls — otherwise they will scroll the page instead and never see it.

`fit` and `group` also decide where **Put it on the page** drops the piece into
the hero (`src/collection/appliedHero.tsx`):

| Condition | Lands as |
|---|---|
| `group === "Sections"` | in place of the hero — a section already is the top of a page |
| `fit === "fill"` | the hero background, behind the copy, under a scrim |
| anything else | inside the hero, where the product shot would go |

If a piece looks wrong there, the fix is almost always the wrong `fit`, not a
special case in `appliedHero.tsx`.

---

## 5. The `code` snippet

The block under the stage is generated from the current control values, so what
someone copies is what they are looking at. Use `usage()`:

```ts
usage(component, props, children?)
```

It drops anything `undefined` or `""`, renders booleans as bare attributes, and
trims trailing zeros from numbers. Pass `undefined` for props left at their
default so the snippet stays short:

```ts
code: (v) => usage("Marquee", {
  duration: num(v, "duration", 26),
  fade: bool(v, "fade", true),
  reverse: bool(v, "reverse") || undefined,   // omitted when false
}, "{/* items */}"),
```

For anything with children or composed parts, write the template literal by
hand — a snippet that does not compile is worse than no snippet.

---

## 6. Demo content rules

- **No network images.** Use CSS gradients, inline SVG, or `data:` URIs. Several
  existing demos have a local `Tile`/`Swatch` helper — reuse it.
- **Valid HTML nesting.** A `<div>` inside a `<p>` is invalid and React will
  warn. This has already bitten once: `LinkPreview` renders inline, so its
  `preview` had to become a `<span className="block …">`.
- **No real endpoints.** Forms and CTAs use `href="#"` and no-op handlers.
- **Copy in the collection's voice.** Specific, declarative, no filler. Read the
  neighbouring entries before writing yours.
- **Deterministic.** No `Math.random()` at render — the still is captured once
  and should look like what the visitor gets.

Anything that animates on mount (a text reveal, a staggered group) relies on the
workbench's **Replay** button. Do not build a play button into the demo.

---

## 7. Shaders are automatic

Do not add a shader to `shaders.tsx`. Add the `ShaderDef` to
`src/shaders/index.ts` in the right category and it appears in the gallery with
a full control panel already built — `controlsFor()` turns each uniform into a
slider, slider pair, or colour picker from the `min`/`max`/`step`/`label` the
definition already declares.

That is the deal: **declare good uniform metadata and the UI is free.** A
uniform with a sloppy range gets a sloppy slider.

Colour uniforms also drive the card tile, via `swatchFor()`. Shaders that
declare no colours fall back to a hashed tile keyed on their id.

---

## 8. GPU benches

The five benches in `public/gpu-lab/` are standalone WebGL2 pages with their own
control panel, and they are framed rather than re-implemented. To add one, drop
the HTML file in `public/gpu-lab/` and add an entry to the `BENCHES` array in
`gpu.tsx`. Leave `controls: []` and put the modes in `panelNote` — the bench's
own panel inside the frame is the set of tweaks.

---

## 9. Complete websites

A whole page is not a gallery piece. Add it to `src/collection/websites.tsx`:

```ts
{
  key: "my-template",      // must match the ?template= key in examples/templates/
  title: "My template",
  brand: "Brandname",
  description: "One sentence on the direction it takes.",
  sections: "9 sections",  // or "Experimental"
  palette: "linear-gradient(135deg,#1d4ed8,#0ea5e9 45%,#bef264)",
}
```

The page itself must be registered in `examples/templates/pages.tsx` (or
`experimental-pages.tsx`) under the same key. `palette` shows behind the still
while it loads, so pick something close to the page's real colours.

Only one template iframe runs at a time, behind an `IntersectionObserver`.
Do not change that to render all sixteen.

---

## 10. Capture the preview still

Gallery cards show a screenshot of the real component. A new piece has no still
until you capture one, and will fall back to a generated tile.

```bash
npm run build
(cd dist && python3 -m http.server 5310 --bind 127.0.0.1) &
PREVIEW_ONLY=my-element npm run capture:previews
```

This writes `public/previews/works/<id>.webp` and rewrites
`src/collection/previews.ts`, the manifest the gallery consults so a card only
requests an image that exists. **Commit both.**

`scripts/capture-works.mjs` drives one Chrome over the DevTools protocol and
sweeps a synthetic pointer across the page before each shot, so cursor-driven
pieces are not photographed as an empty frame. It refuses a frame carrying no
information (standard deviation under 2.5) — if your piece is skipped as blank,
it needs interaction the script cannot fake, and the generated tile is the
correct outcome. Do not lower the threshold to force it through.

Useful env: `PREVIEW_SCOPE=works|sites|all`, `PREVIEW_ONLY=id,id`,
`PREVIEW_SKIP_EXISTING=1`, `PREVIEW_SETTLE=<ms>`, `PREVIEW_BASE`,
`PREVIEW_CHROME`, `PREVIEW_PORT`.

Regenerating **every** still takes about half an hour. Use `PREVIEW_ONLY`.

---

## 11. Before you call it done

```bash
npx tsc --noEmit     # must pass; the Work type catches most mistakes
npm run build:pages  # the tracked pages/ build — commit it
```

Then open the page (see §12 on how to run the dev server) and check:

- [ ] The card appears in the right group, and the group count went up by one
- [ ] Selecting it mounts the real component — **no console errors or warnings**
- [ ] Every control changes something visible
- [ ] Reset restores the declared defaults; Replay re-runs mount animations
- [ ] The snippet under the stage matches what the stage shows
- [ ] `element.html?w=<id>` renders it alone, and `/?w=<id>` deep-links it
- [ ] Desktop / Tablet / Phone in the viewport switcher all hold together
- [ ] The card shows its captured still, or falls back cleanly to a tile

The tracked `pages/` directory is the deployed build. A source change without a
matching `npm run build:pages` ships the old page.

---

## 12. House rules

- Match the surrounding code: same comment density, same naming, same idiom.
  Comments here explain *why*, never *what* — read a few before writing one.
- Never add a `Co-Authored-By: Claude` trailer to a commit in this repository.
- Do not run dev servers with a bare `npm run dev` in a background shell if the
  harness offers a preview tool; use the tool.
- `src/core` and `src/shaders` have **zero runtime dependencies**. Keep it that
  way — anything you add there must not import from `src/ui` or React.
