# Taste is the Moat

Taste is the Moat is a curated collection for making the web feel authored:
animated backgrounds, tactile components, React sections, and complete landing
pages—plus a studio to browse, tune, and edit every shader live.

The home page is a **workbench**: all **190 pieces** — 69 shaders, 85 elements,
5 WebGL text surfaces, 26 sections, and 5 GPU benches — mount live in one
preview stage, with every control that piece accepts beside it and a usage
snippet generated from whatever you just set. The **16 complete landing-page
templates** live in their own section below it, previewed whole at the viewport
width you pick, because a finished page is a different kind of thing from a
part you compose.

The premise is simple: capable design is abundant, so discernment is the real
advantage. Every piece is opinionated, editable, reduced-motion ready, and
selected to help a page escape the generic middle. The shader runtime remains
dependency-free and exports a self-contained HTML file.

```bash
npm install
npm run dev
```

- **The workbench** (every element, live and tunable): the printed URL
- Deep-link any piece with `?w=<id>`, e.g. `/?w=shader-holo-foil`
- Any piece on its own page: `/element.html?w=<id>`
- **Shader studio:** `/studio.html`
- **Marketing page demo:** `/examples/marketing/`
- **Section catalog:** `/examples/marketing/sections.html`
- **Page templates:** `/examples/templates/`
- Contact sheet (every shader at once): `/examples/contact-sheet.html`
- Landing page demo (vanilla): `/examples/landing.html`

### Gallery previews

Each of the 190 gallery cards shows a still of the real component, captured
once from `element.html` rather than mounted live — 190 running components on
one page is not a gallery, it is a fan. Regenerate them after adding or
changing a piece:

```bash
npm run build:pages
npx serve pages          # any static server; see PREVIEW_BASE below
npm run capture:previews
```

The script drives headless Chrome (`PREVIEW_CHROME`), reads the work list from
`element.html?list=1`, writes `public/previews/works/<id>.webp` for the
elements and `public/previews/sites/<key>.webp` for the sixteen complete pages,
and rewrites `src/collection/previews.ts` so a card only requests an image that
exists. `PREVIEW_BASE` defaults to `http://127.0.0.1:5310/TasteIsTheMoat`;
`PREVIEW_SCOPE=works|sites` limits the run and `PREVIEW_ONLY=id,id` re-captures
just those.

### GitHub Pages

The repository includes a tracked `pages/` production build and a GitHub
Actions deployment workflow. The Pages build uses the project URL base
`/TasteIsTheMoat/`, so assets and internal links work at:

`https://aabdlwahab.github.io/TasteIsTheMoat/`

Before the first deployment, open **Settings → Pages** in GitHub and set
**Source** to **GitHub Actions**. This is a one-time repository setting;
GitHub's default workflow token cannot enable a Pages site on its own.

Regenerate the directory locally with:

```bash
npm run build:pages
```

---

## Sections (React + Tailwind)

Twenty-six copy-paste sections for landing and marketing pages, with shader
integration built in where motion adds value.

```tsx
import { Hero, Features, Pricing, FAQ, CTA, Footer, Nav } from "taste-is-the-moat/react";

const brand = { primary: "#4f46e5", secondary: "#a855f7", accent: "#22d3ee" };

<Hero
  shader="holo-foil"
  brand={brand}
  headline={<>Landing pages that <GradientText>move</GradientText>.</>}
  subhead="A React section library with WebGL shader backgrounds built in."
  primaryAction={{ label: "Start building", href: "/signup" }}
/>
```

| Section | Variants |
|---|---|
| **AnnouncementBar** | `gradient`, `subtle`; dismissal persists per key |
| **Nav** | transparent-over-hero → solid on scroll, mobile drawer |
| **Hero** | `centered`, `split` (copy + visual) |
| **LogoCloud** | `grid`, `marquee` |
| **Features** | `grid`, `alternating`, `bento` |
| **ProductShowcase** | tabbed screenshots, keyboard-navigable tablist |
| **Steps** | `row`, `timeline` |
| **Stats** | count-up on scroll |
| **Testimonials** | `grid`, `featured`, `marquee` |
| **Integrations** | `tiles`, `cards`, coming-soon flags |
| **Comparison** | feature table with groups and highlighted column |
| **Pricing** | tiers, monthly/annual toggle, featured tier |
| **FAQ** | accordion |
| **Team** | `grid`, `list` |
| **BlogGrid** | cards, optional featured first post |
| **CTA** | `band` (full-bleed), `card` (inset) |
| **Waitlist** | email capture over a shader, with states |
| **Footer** | columns, newsletter, social |
| **FeatureRows** | alternating product-tour rows with visuals and proof points |
| **UseCases** | accessible audience/workflow tabs |
| **CustomerStory** | quote, team, rating, outcomes, optional shader |
| **TrustCenter** | security commitments, standards, and live status |
| **Newsletter** | `split`, `centered`; shader and success states |
| **Contact** | demo/contact form, methods, topics, and success state |
| **Changelog** | release timeline with status and change lists |
| **Gallery** | two- or three-column template, case-study, and portfolio grid |

Primitives: `Button`, `Badge`, `Card`, `Container`, `Section`, `SectionHeading`,
`GradientText`, `Reveal`, `Marquee`, `Accordion`, `Counter`, `BrowserFrame`,
`ShaderSection`, `AvatarStack`, `Rating`, `CopyField`, `SegmentedControl`, and
`StatusBadge`.

Experimental elements: `MorphingNotch`, `GooeyDropdown`, `MorphingDialog`,
`MagneticButton`, `WetPaintButton`, `DirectionAwareCard`, `LensReveal`,
`ImageTrailCursor`, `DraggableCardPile`, `InfiniteCanvas`, `ScrollCardStack`,
`PixelDitherReveal`, `KineticTypeRibbon`, `EncryptedText`,
`FlippingTextBoard`, `SquigglyText`, `PathMorph`, `ProgressiveBlur`,
`LinkPreview`, `Marquee3D`, `IsometricFeatureBoxes`, `CodeComparison`,
`VanishingInput`, `ScrollScrubVideo`, `AudioReactiveShader`, and
`WebcamPixelGrid`.

### Complete page templates

Open `/examples/templates/` to preview each page:

| Template | Included patterns |
|---|---|
| **SaaS product** | audience tabs, product proof, pricing, FAQ, demo form |
| **AI platform** | product tour, auditable use cases, security, newsletter |
| **Developer tool** | install command, product tabs, changelog, usage pricing |
| **Creative agency** | project gallery, outcomes, process, story, inquiry form |
| **Infinite canvas portfolio** | draggable project world, image trails, spatial work |
| **Kinetic editorial** | velocity typography, split-flap headlines, manifesto layout |
| **AI laboratory** | evidence states, encrypted type, confidence visualisation |
| **Interactive product story** | scroll-controlled product chapters and proof |
| **Generative art studio** | dithered artwork, live seeds, floating controls |
| **Luxury product drop** | material lens, numbered release, restrained motion |
| **Festival** | draggable lineup, venue ribbons, poster-driven system |
| **Open-source launch** | executable hero, code comparison, documentation search |
| **Interactive case study** | morphing cover, pinned outcomes, process artifacts |
| **Spatial agency** | image trails, direction-aware work, spatial navigation |
| **Data story** | layered methodology, scroll metrics, evidence chapters |
| **Music release** | audio-reactive art, pixel portrait, living credits |

The collection expansion was informed by recurring patterns in
[Tailwind UI marketing blocks](https://tailwindcss.com/plus/ui-blocks),
[Tailwind landing-page examples](https://tailwindcss.com/plus/ui-blocks/marketing/page-examples/landing-pages),
[Page UI](https://pageui.shipixen.com/), [Oxbow UI](https://oxbowui.com/),
[React SaaS](https://react-saas.com/), [UIStash](https://uistash.vercel.app/),
and [Destack](https://www.getdestack.com/). The experimental expansion also
draws from patterns catalogued by [Aceternity UI](https://ui.aceternity.com/explore),
[Magic UI](https://magicui.design/docs/components),
[Motion Primitives](https://motion-primitives.com/docs),
[React Bits](https://www.reactbits.dev/), and
[Codrops](https://tympanus.net/codrops/hub/). The implementations here are
original and use the existing Taste is the Moat component APIs and visual system.

### Shader-native components

The pieces you cannot build without the shader runtime:

| Component | What it does |
|---|---|
| **ShaderText** | A live shader clipped to your headline glyphs |
| **ShaderCard** | Card whose shader wakes up on hover |
| **ShaderOrb** | Blob/circle/squircle-masked shader as an accent |
| **ShaderDivider** | Feathered band of motion between flat sections |
| **SpotlightGrid** | Cursor-follow glow across a card grid — **no WebGL** |
| **BorderBeam** | Light travelling the border — **pure CSS** |
| **NoiseOverlay** | Grain that unifies flat sections with shader ones |

`SpotlightGrid` and `BorderBeam` deliberately use no WebGL. Reach for them when
a shader per card would be wasteful — one pointer listener and a CSS gradient
scale to any number of cards.

`ShaderText` uses `background-clip: text` over a texture refreshed at ~12fps,
rather than masking a canvas to the glyphs. That keeps the *real* text element
doing the clipping, so wrapping, selection and screen readers all behave
normally; an SVG-mask approach has to duplicate the text and drifts out of
register across fonts. The tradeoff is refresh rate, so prefer calm shaders
(`mesh-gradient`, `silk`, `oil-slick`) here.

### One palette drives everything

Shader colours are hand-tuned per shader, which looks great in isolation and
clashes with your brand. Pass a `brand` palette and every colour uniform is
remapped onto your ramp: background → primary → secondary → accent.
`strength` below 1 keeps some of the shader's original character.

```tsx
<CTA shader="liquid-ripple" brand={{ primary: "#0f766e", strength: 0.85 }} />
```

Which uniform gets which slot **cannot** be inferred from declaration order.
Aurora lists its bright ribbon colours before the dark sky; Metaballs lists the
background first. Guessing by order gave Aurora a black ribbon over a neon sky.

So each shader declares its own `colorRoles` (`dark` | `mid` | `bright` |
`accent`):

```ts
export const aurora: ShaderDef = {
  colorRoles: {
    u_colorA: "bright",   // ribbon
    u_colorB: "accent",
    u_skyTop: "dark",
    u_skyBottom: "dark",
  },
  // ...
};
```

Override per-call with `roles` when you want something different:

```tsx
<Hero shader="aurora" brand={brand} roles={{ u_colorA: "accent" }} />
```

Shaders without `colorRoles` fall back to declaration order. If a rebranded
shader looks inverted, that is the reason — add roles to it.

### ShaderSection absorbs the footguns

Every shader-backed section goes through `<ShaderSection>`, which handles the
things that are easy to get wrong:

- **Stacking** — canvas at `z-0`, content at `z-10`. Never a negative z-index;
  that paints the canvas behind the body background and it vanishes.
- **Legibility** — a scrim sits between shader and copy (`subtle`/`medium`/
  `strong`). Text over motion is the real accessibility risk.
- **Cost** — `pauseWhenHidden` stops the loop when the section scrolls away.
- **Motion** — `prefers-reduced-motion` gets one static frame.
- **Failure** — no WebGL still renders; a brand-tinted CSS gradient stands in.

### Budget your shaders

Use one or two per page — the hero and the closing CTA. Everything between them
stays flat. Spectacle everywhere reads as noise, and each shader is another
render loop.

### Animations fail open

Any animation that *hides* content first can strand it. Two components here do
that, and both have belt-and-braces fallbacks:

- **`<Reveal>`** starts hidden. Three independent paths reveal it — an
  IntersectionObserver, an on-mount viewport check, and a 1.5s safety timeout.
  The fallback paths snap rather than animate.
- **`<Counter>`** starts at zero and counts up under `requestAnimationFrame`,
  which a throttled tab may never run. A stat frozen at "0" actively
  misinforms, so it has the same on-mount check plus a timeout that jumps
  straight to the real number.

Add this to your HTML so the hidden state never applies when JS is unavailable:

```html
<html class="no-js">
  <head><script>document.documentElement.classList.remove("no-js")</script></head>
```

### SSR and the first frame

A shader only runs on the client, which leaves a gap before the first frame and
in environments without WebGL. `<ShaderSection>` fills it two ways:

```tsx
// Default: a CSS gradient derived from the shader's own colours.
// Zero bytes, renders on the server, no WebGL.
<Hero shader="holo-foil" brand={brand} />

// Or a real captured frame, generated ahead of time.
<Hero shader="holo-foil" brand={brand} poster="/posters/holo-foil.jpg" />
```

```ts
import { capturePoster, fallbackGradient } from "taste-is-the-moat";

await capturePoster(holoFoil, { brand, time: 4 });  // data URL, browser-only
fallbackGradient(holoFoil, { brand });              // CSS string, works in SSR
```

`capturePoster` seeks a few seconds in on purpose — most of these shaders open
on a nearly uniform field and a frame grabbed at t=0 looks like a flat colour.

### Known: shader tree-shaking

Referencing a shader by string id (`shader="holo-foil"`) goes through the
registry barrel, which pulls in every shader in the registry — tens of kB gzipped. To ship
only what you use, import the shader directly and pass the object:

```tsx
import { holoFoil } from "taste-is-the-moat/shaders/holo-foil";
<Hero shader={holoFoil} brand={brand} />
```

---

## The shaders

✦ = responds to the cursor.

### Gradient
| Shader | Look |
|---|---|
| **Mesh Gradient** | Soft four-colour gradient, domain-warped. The classic SaaS hero. |
| **Aurora** | Northern-lights ribbons with vertical streaking over a night sky. |
| **Silk** | Satin folds with an anisotropic sheen. |

### Iridescent
| Shader | Look |
|---|---|
| **Holo Foil** ✦ | Holographic fabric. Thin-film interference over cloth folds; the cursor tilts the view so the rainbow sweeps. |
| **Oil Slick** | Petrol rainbow pooling on wet asphalt. |
| **Prism** ✦ | Light splitting into spectral fans through drifting glass. |

### Interactive
| Shader | Look |
|---|---|
| **Liquid Ripple** ✦ | Water that ripples from your cursor. Click to drop a stone. |
| **Magnetic Dots** ✦ | A dot grid that bends around the cursor. Click to pulse. |
| **Spotlight** ✦ | A dark surface your cursor reveals like a torch. |
| **Cursor Flow** ✦ | Smoke you stir; flick the cursor to smear the field. |

### Organic
| Shader | Look |
|---|---|
| **Metaballs** | Gooey blobs that merge and split. |
| **Plasma** | Marbled liquid from iterated domain warping. |
| **Voronoi Cells** | Crystalline mosaic that slowly rearranges. |
| **Caustics** | Underwater light webs on a pool floor. |
| **Lava Lamp** | Slow wax blobs through warm backlit glass. |

### Space
| Shader | Look |
|---|---|
| **Starfield** ✦ | Parallax stars streaming past; steer with the cursor. |
| **Nebula** | Glowing interstellar gas with scattered stars. |
| **God Rays** ✦ | Volumetric light shafts; the cursor moves the sun. |

### Geometric
| Shader | Look |
|---|---|
| **Synthwave Grid** | Retro neon grid racing to a banded sun. |
| **Topographic** | Contour map lines over shifting terrain. |
| **Halftone** ✦ | Print-style dot screen that swells around the cursor. |

### Scouted additions

- **Gradient:** Grain Gradient, Color Bends, Ribbon Flow, Color Panels,
  Stripe Flow, Conic Flow, Smoke Gradient
- **Iridescent:** Metallic Paint
- **Interactive:** Dot Orbit, Magic Rings, Radar Sweep, Pixel Trail,
  Antigravity Field, Cosmic Vortex
- **Organic:** Neuro Noise, Smoke Ring, Branching Trunk, Ocean Surface,
  Liquid Shapes, Shifting Sands, Smoke Ink, Reaction Diffusion
- **Space:** Warp Tunnel, Light Beams, Cloudscape
- **Geometric:** Spiral Field, Line Waves, Network Field, Moiré Interference,
  Kaleidoscope

### Moving gradients

Gradient Drift, Aurora Bloom, Fluid Spectrum, Diagonal Tide, Radial Bloom,
Chromatic Current, Soft Orbs, and Sunset Waves.

The web-scouted moving-gradient pack adds Seeded Color Islands, Deterministic
Duotone Flow, Palette Morph, Lit Mesh Waves, Water Plane Gradient, Frosted Wave
Stack, Liquid Metal Gradient, Layered Radial Sweep, Grainient Field, and a
Seeded Gradient Generator.

Every shader ships with tuned defaults and adjustable uniforms.

## Using a shader in your project

```ts
import { ShaderBackground, shaders } from "taste-is-the-moat";

const canvas = document.querySelector("#bg");
const bg = new ShaderBackground(canvas, shaders.holoFoil, {
  pauseWhenHidden: true,       // stop rendering when scrolled out of view
  respectReducedMotion: true,  // render one static frame if the user prefers
  maxDpr: 2,                   // cap pixel ratio on retina displays
});

bg.setUniform("u_speed", 0.8);
bg.spawnRipple(0.5, 0.5);      // emit a ripple programmatically
bg.pause();
bg.play();
```

Or let it create the canvas for you:

```ts
import { mount } from "taste-is-the-moat";

const bg = mount("#hero", "liquid-ripple", { pauseWhenHidden: true });
```

Browse by category:

```ts
import { byCategory, interactiveShaders, shaderList } from "taste-is-the-moat";

byCategory("iridescent");   // includes holoFoil, oilSlick, prism, metallicPaint
interactiveShaders();       // every shader that reads the pointer
shaderList.length;          // 69
```

### Layering content on top

```css
.hero { position: relative; overflow: hidden; }
#bg    { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero::after {                      /* scrim keeps text legible */
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center,
    rgba(7,8,12,0.25) 0%, rgba(7,8,12,0.75) 100%);
}
.hero-content { position: relative; z-index: 1; }
```

Do **not** give the canvas a negative `z-index` — it would paint behind the
body background and vanish. Use `z-index: 0` and put content above it.

See [examples/landing.html](examples/landing.html) for a complete page.

### No build step

Hit **Export HTML** in the studio. You get one self-contained file — inlined
shader, inlined runtime, full pointer support — ready to open or paste into any
site.

## The studio

- **Browse** 69 shaders with live previews, category filters and search
- **Tune** uniforms with auto-generated sliders and colour pickers
- **Edit** the GLSL with syntax highlighting and live recompile (~250 ms debounce)
- **See errors** inline, with line numbers mapped to your code, not the prelude
- **Export** a standalone HTML file, or copy raw GLSL / a usage snippet

## Writing your own shader

Pick **Blank** in the studio, or add a file to `src/shaders/`:

```ts
import type { ShaderDef } from "../core/types";

export const myShader: ShaderDef = {
  id: "my-shader",
  name: "My Shader",
  description: "What it looks like.",
  category: "organic",
  interactive: true,            // set if you read the pointer
  uniforms: {
    u_colorA: { type: "color", value: [0.1, 0.2, 0.9], label: "Base" },
    u_speed:  { type: "float", value: 0.5, min: 0, max: 2, label: "Speed" },
  },
  fragment: `
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  float n = fbm(p * 2.0 + u_time * u_speed) * 0.5 + 0.5;
  float d = length(p - mousePos());
  gl_FragColor = vec4(u_colorA * n + exp(-d * 3.0) * 0.2, 1.0);
}`,
};
```

Register it in `src/shaders/index.ts` and it appears in the gallery with
controls generated automatically.

> **Gotcha:** shader sources are JS template literals, so a backtick anywhere
> in your GLSL — including inside a comment — silently ends the string and
> breaks the build. Don't use backticks in GLSL comments.

### Built-in uniforms

| Uniform | Type | Meaning |
|---|---|---|
| `u_time` | `float` | Seconds since start |
| `u_resolution` | `vec2` | Canvas size in pixels |
| `u_mouse` | `vec2` | Raw pointer, 0..1, y-up |
| `u_mouseSmooth` | `vec2` | Eased pointer — use for lag/follow |
| `u_mouseVel` | `vec2` | Pointer velocity (canvas widths/sec) |
| `u_mouseDown` | `float` | 0..1 smoothed press state |
| `u_mouseEnter` | `float` | 0..1, fades out when the pointer leaves |
| `u_ripples[8]` | `vec4` | Click ripples: `xy` origin, `z` age (<0 = unused), `w` strength |

Multiply cursor effects by `u_mouseEnter` so they rest gracefully when the
pointer is away.

### Helpers

| Helper | Description |
|---|---|
| `snoise(vec2\|vec3)` | Simplex noise, −1..1 |
| `fbm(vec2\|vec3)` | Fractal brownian motion |
| `voronoi(vec2, t)` | Returns `(F1, F2)`; `F2-F1` gives cell borders |
| `thinFilm(nm, cosTheta)` | Thin-film interference — iridescence, oil, foil |
| `iridescence(t)` | Fast rainbow sweep |
| `fresnel(cosTheta, f0)` | Schlick Fresnel |
| `palette(t, a, b, c, d)` | Cosine palette (Inigo Quilez) |
| `smin(a, b, k)` | Polynomial smooth minimum |
| `hsv2rgb`, `rot`, `luma`, `grain`, `hash21`, `hash22` | Misc |
| `mousePos()`, `mouseSmoothPos()` | Aspect-corrected pointer, matching `p` |
| `rippleField(p, speed, freq, decay)` | Summed click-ripple wave |

`PI` and `TAU` are defined. `fwidth`/`dFdx` are available — the derivatives
extension is enabled for you.

## Writing shaders that look good

Hard-won notes from tuning this set:

- **Thin-film is exquisitely sensitive.** `thinFilm()` cycles hue rapidly with
  thickness and angle, so feed it *smooth, low-frequency* fields. High-frequency
  input turns a rainbow into RGB confetti.
- **Sharp speculars need smooth normals.** Take your height-field gradient with
  a generous epsilon (~0.02). Sampling too finely picks up the noise floor and
  a `pow(..., 90.0)` highlight turns it into white speckle.
- **Gradients are non-zero nearly everywhere.** Gating a glow on slope steepness
  lights the whole frame unless you scale it well down first.
- **Domain warping compounds.** Each fbm feeding the next multiplies detail;
  past ~3 the result is mush at thumbnail size.
- **Give interactive shaders a decent resting state.** A shader that's black
  until the cursor arrives previews as an empty box.

## Performance

Cost scales with **pixels**, not geometry.

- `pauseWhenHidden` stops the loop via `IntersectionObserver` when scrolled away.
- `maxDpr: 2` caps retina cost; drop to `1` for full-screen backgrounds.
- `respectReducedMotion` renders a single static frame when the user asks for it.
- `fbm` is the expensive part (5–6 octaves/pixel). God Rays additionally marches
  24 steps — the heaviest in the set.
- The studio shows live FPS; tune while watching it.

### Why the gallery shares one WebGL context

Browsers cap live WebGL contexts (commonly ~16) and **silently drop the oldest**
past the limit. One context per gallery card breaks as soon as the library grows
past a dozen shaders — this bit us at 22.

[`src/app/thumbnails.ts`](src/app/thumbnails.ts) keeps a single offscreen
context, caches one compiled program per shader, renders each *visible* card
into it and blits to a plain 2D canvas. Cost scales with what's on screen, not
with library size. If you add many more shaders, this is why it keeps working.

## Project layout

```
src/
  core/
    renderer.ts   ShaderBackground — runtime, pointer system, render loop
    compile.ts    Shared source assembly + program linking
    glsl.ts       Helper library + built-in uniforms injected into every shader
    types.ts      ShaderDef / uniform / category types
  shaders/        Shader definitions, one file (or family) each
  ui/             Elements: foundation, shader-native, experimental, motion
  sections/       The React section library
  collection/     The home page: workbench, control kit, works registry
    works/        One entry per piece — controls + a live render + a snippet
  app/            Studio: gallery, editor, controls, thumbnails, export
examples/
  landing.html        A complete landing page using a shader background
  contact-sheet.html  Every shader rendered at once
```

The library (`src/core` + `src/shaders`) has **zero runtime dependencies**.
CodeMirror is used only by the studio and never ships to consumers.

## Browser support

Any browser with WebGL 1. If the context can't be created, `ShaderBackground`
throws — wrap in `try/catch` and fall back to a CSS gradient if you need to
support very old environments.

## License

MIT
