import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const githubPages = process.env.GITHUB_PAGES === "true";
const outputDirectory = githubPages ? "pages" : "dist";

export default defineConfig({
  root: ".",
  base: githubPages ? "/TasteIsTheMoat/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "sites-static-worker",
      closeBundle() {
        if (githubPages) {
          writeFileSync(resolve(__dirname, outputDirectory, ".nojekyll"), "");
          return;
        }
        const serverDir = resolve(__dirname, "dist/server");
        mkdirSync(serverDir, { recursive: true });
        copyFileSync(
          resolve(__dirname, "src/sites-worker.js"),
          resolve(serverDir, "index.js"),
        );
      },
    },
  ],
  build: {
    target: "es2021",
    outDir: outputDirectory,
    rollupOptions: {
      input: {
        // Collection home.
        collection: resolve(__dirname, "index.html"),
        // The shader studio (vanilla TS).
        studio: resolve(__dirname, "studio.html"),
        // The React section library demo — a full marketing page.
        marketing: resolve(__dirname, "examples/marketing/index.html"),
        // Each section on its own, for review and screenshots.
        sectionCatalog: resolve(__dirname, "examples/marketing/sections.html"),
        // Sixteen complete landing-page starters and their catalog.
        templates: resolve(__dirname, "examples/templates/index.html"),
        contactSheet: resolve(__dirname, "examples/contact-sheet.html"),
        landing: resolve(__dirname, "examples/landing.html"),
        safety: resolve(__dirname, "examples/safety/index.html"),
      },
    },
  },
});
