import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const source = readFileSync(join(projectRoot, "src/collection/main.tsx"), "utf8");

const selectedBlock = source.match(/const selectedShaderIds = new Set\(\[([\s\S]*?)\]\);/)?.[1] ?? "";
const shaderIds = [...selectedBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
const manualWorks = [...source.matchAll(/\{ title: "([^"]+)", kind: "([^"]+)", href: "([^"]+)"/g)]
  .map((match) => ({ title: match[1], kind: match[2], href: match[3], captureHref: match[3] }));
const works = [
  ...shaderIds.map((id) => ({
    title: id,
    kind: "Shader",
    href: `/studio.html?shader=${id}`,
    captureHref: `/examples/preview.html?shader=${id}`,
  })),
  ...manualWorks,
];

function slugFor(work) {
  return `${work.kind}-${work.href}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const runtimeModules = process.env.CODEX_NODE_MODULES;
const python = process.env.PREVIEW_PYTHON;
const chrome = process.env.PREVIEW_CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = process.env.PREVIEW_BASE ?? "http://127.0.0.1:5173";
if (!runtimeModules || !python) {
  throw new Error("CODEX_NODE_MODULES and PREVIEW_PYTHON are required.");
}

const { chromium } = await import(pathToFileURL(join(runtimeModules, "playwright/index.mjs")).href);
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const context = await browser.newContext({
  viewport: { width: 480, height: 270 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
  reducedMotion: "no-preference",
});
const page = await context.newPage();
const outputDir = join(projectRoot, "public/previews");

try {
  for (const [index, work] of works.entries()) {
    const url = `${base}${work.captureHref}`;
    process.stdout.write(`[${index + 1}/${works.length}] ${work.title}\n`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 });
    await page.waitForTimeout(900);

    if (work.captureHref.includes("preview-morphing-dialog")) {
      await page.locator("button").first().click().catch(() => undefined);
      await page.waitForTimeout(300);
    }

    const frameDir = mkdtempSync(join(tmpdir(), "taste-preview-"));
    try {
      for (let frame = 0; frame < 12; frame += 1) {
        const angle = (frame / 12) * Math.PI * 2;
        await page.mouse.move(240 + Math.cos(angle) * 105, 135 + Math.sin(angle) * 62, { steps: 2 });
        if (work.captureHref.includes("kinetic") || work.kind === "Page") {
          await page.evaluate(() => window.scrollBy(0, 8));
        }
        await page.screenshot({
          path: join(frameDir, `${String(frame).padStart(2, "0")}.png`),
          animations: "allow",
        });
        await page.waitForTimeout(140);
      }

      execFileSync(
        python,
        [join(scriptDir, "frames-to-webp.py"), frameDir, join(outputDir, `${slugFor(work)}.webp`)],
        { stdio: "inherit" },
      );
    } finally {
      rmSync(frameDir, { recursive: true, force: true });
    }
  }
} finally {
  await context.close();
  await browser.close();
}
