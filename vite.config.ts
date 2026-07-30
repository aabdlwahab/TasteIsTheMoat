import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: ".",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "sites-static-worker",
      closeBundle() {
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
    outDir: "dist",
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
        // Four complete landing-page starters and their catalog.
        templates: resolve(__dirname, "examples/templates/index.html"),
        contactSheet: resolve(__dirname, "examples/contact-sheet.html"),
        landing: resolve(__dirname, "examples/landing.html"),
      },
    },
  },
});
