/**
 * Capture a still of every piece in the collection.
 *
 * The gallery shows 190 cards. Mounting 190 live components at once is not a
 * gallery, it is a fan — and a generated gradient is a decoration rather than a
 * preview. So each card gets a screenshot of the real component, taken once,
 * offline, from `element.html`. The sixteen complete pages are captured the
 * same way from the template routes.
 *
 * Needs a static server for a production build, plus Chrome:
 *
 *   npm run build
 *   (cd dist && python3 -m http.server 5310 --bind 127.0.0.1) &
 *   npm run capture:previews
 *
 * One Chrome instance is driven over the DevTools protocol for the whole run.
 * Launching it per shot (the obvious version of this script) spends more time
 * starting browsers than rendering, and `--virtual-time-budget` never settles
 * on pages that animate forever — which is most of this collection.
 *
 * Env: PREVIEW_BASE, PREVIEW_CHROME, PREVIEW_PORT, PREVIEW_SETTLE,
 * PREVIEW_SCOPE=works|sites|all, PREVIEW_ONLY=id,id, PREVIEW_SKIP_EXISTING=1.
 */
import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const worksDir = join(projectRoot, "public/previews/works");
const sitesDir = join(projectRoot, "public/previews/sites");

const chromePath =
  process.env.PREVIEW_CHROME
  ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = process.env.PREVIEW_BASE ?? "http://127.0.0.1:5310";
const port = Number(process.env.PREVIEW_PORT ?? 9333);
const settle = Number(process.env.PREVIEW_SETTLE ?? 1400);
const scope = process.env.PREVIEW_SCOPE ?? "all";
const only = process.env.PREVIEW_ONLY?.split(",").filter(Boolean);
const skipExisting = process.env.PREVIEW_SKIP_EXISTING === "1";

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

/* ---- a very small DevTools protocol client -------------------------------- */

class Chrome {
  #socket;
  #next = 1;
  #pending = new Map();
  #listeners = new Set();

  static async launch() {
    const child = spawn(chromePath, [
      "--headless=new",
      "--disable-gpu",
      // SwiftShader is what makes WebGL work without a display. Every shader,
      // text surface, and GPU bench in the collection needs it.
      "--enable-unsafe-swiftshader",
      "--hide-scrollbars",
      "--mute-audio",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${mkdtempSync(join(tmpdir(), "taste-chrome-"))}`,
      "about:blank",
    ], { stdio: "ignore" });

    for (let attempt = 0; attempt < 60; attempt += 1) {
      await sleep(250);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`);
        const { webSocketDebuggerUrl } = await response.json();
        return new Chrome(child, await connect(webSocketDebuggerUrl));
      } catch {
        // Chrome is still starting; the next attempt will find the port.
      }
    }
    child.kill("SIGKILL");
    throw new Error(`Chrome did not open a debugging port on ${port}.`);
  }

  constructor(child, socket) {
    this.child = child;
    this.#socket = socket;
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.#pending.has(message.id)) {
        const { resolve: settleOk, reject } = this.#pending.get(message.id);
        this.#pending.delete(message.id);
        message.error ? reject(new Error(message.error.message)) : settleOk(message.result);
      } else if (message.method) {
        for (const listener of this.#listeners) listener(message);
      }
    });
  }

  send(method, params = {}, sessionId) {
    const id = this.#next++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.#socket.send(JSON.stringify(payload));
    return new Promise((ok, reject) => {
      this.#pending.set(id, { resolve: ok, reject });
      setTimeout(() => {
        if (this.#pending.delete(id)) reject(new Error(`${method} timed out`));
      }, 60_000);
    });
  }

  /** Resolve on the first matching event, or after `timeout` — never hang. */
  once(method, sessionId, timeout) {
    return new Promise((ok) => {
      const listener = (message) => {
        if (message.method === method && (!sessionId || message.sessionId === sessionId)) {
          this.#listeners.delete(listener);
          ok(true);
        }
      };
      this.#listeners.add(listener);
      setTimeout(() => {
        this.#listeners.delete(listener);
        ok(false);
      }, timeout);
    });
  }

  close() {
    try {
      this.#socket.close();
    } finally {
      this.child.kill("SIGKILL");
    }
  }
}

function connect(url) {
  return new Promise((ok, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener("open", () => ok(socket), { once: true });
    socket.addEventListener("error", () => reject(new Error(`Could not connect to ${url}`)), { once: true });
  });
}


/** Move a synthetic pointer across the page so reactive pieces wake up. */
async function sweepPointer(chrome, sessionId, [width, height]) {
  const path = [
    [0.22, 0.72],
    [0.36, 0.52],
    [0.5, 0.46],
    [0.62, 0.52],
    [0.54, 0.5],
  ];
  const move = (fx, fy) =>
    chrome.send(
      "Input.dispatchMouseEvent",
      { type: "mouseMoved", x: Math.round(width * fx), y: Math.round(height * fy), buttons: 0 },
      sessionId,
    );

  for (const [fx, fy] of path) {
    await move(fx, fy);
    // Velocity matters to several of them, so the steps are paced rather than
    // fired all at once.
    await sleep(90);
  }

  // Then linger. Hover-driven reveals (the dither cover, the lens) clear
  // progressively, and one pass across is not enough to open them.
  for (let step = 0; step < 8; step += 1) {
    await move(0.5 + Math.cos(step) * 0.06, 0.5 + Math.sin(step) * 0.06);
    await sleep(110);
  }
  await sleep(420);
}

/* ---- what to capture ------------------------------------------------------ */

/** The element page prints `id|fit` pairs; one navigation is enough to read it. */
async function readWorkList(chrome) {
  const { targetId } = await chrome.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await chrome.send("Target.attachToTarget", { targetId, flatten: true });
  await chrome.send("Page.enable", {}, sessionId);
  await chrome.send("Page.navigate", { url: `${base}/element.html?list=1` }, sessionId);
  await chrome.once("Page.loadEventFired", sessionId, 20_000);
  await sleep(1200);
  const { result } = await chrome.send(
    "Runtime.evaluate",
    { expression: "document.getElementById('work-ids')?.textContent ?? ''", returnByValue: true },
    sessionId,
  );
  await chrome.send("Target.closeTarget", { targetId });

  const list = String(result.value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, fit] = entry.split("|");
      return { id, fit: fit || "center" };
    });
  if (list.length === 0) throw new Error(`Could not read the work list from ${base}/element.html?list=1`);
  return list;
}

/** The sixteen complete pages, read from the section that lists them. */
function readSiteList() {
  return readFileSync(join(projectRoot, "src/collection/websites.tsx"), "utf8")
    .split("\n")
    .map((line) => line.match(/key: "([^"]+)"/)?.[1])
    .filter((key) => key !== undefined)
    .map((key) => ({
      id: key,
      href: `/examples/templates/?template=${key}`,
      // A whole page wants the frame it was designed against; the crop to the
      // card's aspect happens afterwards.
      size: [1280, 800],
      // The website cards are 16:10, not the elements' 4:3.
      crop: [480, 300],
      directory: sitesDir,
    }));
}

/* ---- the run -------------------------------------------------------------- */

const chrome = await Chrome.launch();
const frameDir = mkdtempSync(join(tmpdir(), "taste-previews-"));
let written = 0;
let skipped = 0;
let failed = 0;

try {
  const jobs = [];

  if (scope === "all" || scope === "works") {
    for (const work of await readWorkList(chrome)) {
      // Centred elements are laid out at their own size, so a smaller window
      // makes them fill more of the card. Full-bleed and scrolling pieces want
      // the wider frame they were designed against.
      jobs.push({
        id: work.id,
        href: `/element.html?w=${encodeURIComponent(work.id)}&capture=1`,
        size: work.fit === "center" ? [560, 420] : [720, 540],
        directory: worksDir,
      });
    }
  }

  if (scope === "all" || scope === "sites") jobs.push(...readSiteList());

  const selected = jobs.filter((job) => {
    if (only && !only.includes(job.id)) return false;
    if (skipExisting && existsSync(join(job.directory, `${job.id}.webp`))) return false;
    return true;
  });
  if (selected.length === 0) throw new Error("No previews to capture.");

  mkdirSync(worksDir, { recursive: true });
  mkdirSync(sitesDir, { recursive: true });

  for (const [index, job] of selected.entries()) {
    process.stdout.write(`[${index + 1}/${selected.length}] ${job.id}\n`);
    try {
      const png = join(frameDir, `${job.id}.png`);
      // Size comes from setDeviceMetricsOverride below, not from the target:
      // headless refuses width/height here unless a new window is requested.
      const { targetId } = await chrome.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await chrome.send("Target.attachToTarget", { targetId, flatten: true });
      try {
        await chrome.send("Page.enable", {}, sessionId);
        await chrome.send("Emulation.setDeviceMetricsOverride", {
          width: job.size[0],
          height: job.size[1],
          deviceScaleFactor: 1,
          mobile: false,
        }, sessionId);
        await chrome.send("Page.navigate", { url: `${base}${job.href}` }, sessionId);
        await chrome.once("Page.loadEventFired", sessionId, 25_000);
        // Long enough for a shader to settle and an entrance animation to
        // finish. Real time, not virtual: half of this collection animates
        // forever, so there is no idle moment to wait for.
        await sleep(settle);
        // A pointer that never moves photographs the cursor-driven pieces as
        // an empty frame — a trail with nothing to trail, a spotlight with
        // nothing to light. Drag one across before the shutter.
        await sweepPointer(chrome, sessionId, job.size);
        const shot = await chrome.send("Page.captureScreenshot", { format: "png" }, sessionId);
        writeFileSync(png, Buffer.from(shot.data, "base64"));
      } finally {
        await chrome.send("Target.closeTarget", { targetId }).catch(() => undefined);
      }

      execFileSync(
        "python3",
        [
          join(scriptDir, "png-to-webp.py"),
          png,
          join(job.directory, `${job.id}.webp`),
          ...(job.crop ?? []).map(String),
        ],
        { stdio: "inherit" },
      );
      // The converter refuses a frame that carries no information, so a shot
      // is only "written" if a file came out of it.
      if (existsSync(join(job.directory, `${job.id}.webp`))) written += 1;
      else skipped += 1;
    } catch (error) {
      failed += 1;
      process.stdout.write(`    failed: ${error.message}\n`);
    }
  }
} finally {
  chrome.close();
  rmSync(frameDir, { recursive: true, force: true });
}

const captured = readdirSync(worksDir)
  .filter((name) => name.endsWith(".webp"))
  .map((name) => name.replace(/\.webp$/, ""))
  .sort();

writeFileSync(
  join(projectRoot, "src/collection/previews.ts"),
  `/**
 * Ids that have a captured still in \`public/previews/works\`.
 *
 * Generated by \`scripts/capture-works.mjs\` — do not edit by hand. The gallery
 * consults it so a card only requests an image that exists, instead of firing
 * a 404 for every piece added since the last capture.
 */
export const capturedPreviews = new Set<string>([
${captured.map((id) => `  "${id}",`).join("\n")}
]);
`,
);

process.stdout.write(
  `\n${written} captured, ${skipped} blank, ${failed} failed. ${captured.length} element previews on disk.\n`,
);
