import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const directory = dirname(fileURLToPath(import.meta.url));
const [html, css, source] = await Promise.all([
  readFile(resolve(directory, "index.html"), "utf8"),
  readFile(resolve(directory, "styles.css"), "utf8"),
  readFile(resolve(directory, "main.ts"), "utf8"),
]);

const javascript = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.None,
    removeComments: true,
  },
}).outputText;

const standalone = html
  .replace(/\s*<link rel="icon"[^>]*>/, "")
  .replace(/\s*<link rel="stylesheet" href="\.\/styles\.css" \/>/, `\n    <style>\n${css}\n    </style>`)
  .replace(/\s*<script type="module" src="\.\/main\.ts"><\/script>/, `\n    <script>\n${javascript}\n    </script>`)
  .replaceAll('content="/safety-og-v2.png"', 'content=""');

await writeFile(resolve(directory, "kernl-safety-demo.html"), standalone, "utf8");
