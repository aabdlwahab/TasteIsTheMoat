/**
 * One element, on its own page.
 *
 * Two jobs. It is the "full page" target for every piece in the collection —
 * the workbench stage without the workbench around it — and it is what the
 * preview capture script screenshots, so the thumbnails in the gallery are
 * pictures of the real component rather than an illustration of it.
 *
 * `?w=<id>` picks the work. `?list=1` prints `id|fit` pairs for the capture
 * script — it sizes the window differently for centred elements than for
 * full-bleed ones. `&capture=1` drops the caption so the frame is only the
 * element.
 */
import { createRoot } from "react-dom/client";
import "../ui/theme.css";
import { defaultsOf } from "../collection/types";
import { works, worksById } from "../collection/works/index";

const params = new URLSearchParams(window.location.search);
const root = document.getElementById("root");

function IdList() {
  return (
    <pre id="work-ids" style={{ color: "#cbd5e1", font: "12px ui-monospace, monospace", padding: 16 }}>
      {works.map((work) => `${work.id}|${work.fit ?? "center"}`).join(",")}
    </pre>
  );
}

function Element() {
  const work = worksById.get(params.get("w") ?? "");
  if (!work) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0a0b10] p-8 text-center">
        <p className="max-w-md leading-relaxed text-ink-300">
          No element matches <code className="text-ink-0">?w={params.get("w")}</code>.
        </p>
      </main>
    );
  }

  const fit = work.fit ?? "center";
  const capture = params.get("capture") === "1";

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0a0b10]">
      <div
        className={
          fit === "fill"
            ? "h-full w-full"
            : fit === "flow"
              ? "h-full w-full overflow-y-auto"
              : "grid h-full w-full place-items-center overflow-auto p-6 sm:p-10"
        }
      >
        {work.render(defaultsOf(work.controls))}
      </div>
      {capture ? null : (
        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/70 backdrop-blur">
          {work.name} — {work.group}
        </p>
      )}
    </main>
  );
}

if (root) {
  createRoot(root).render(params.get("list") === "1" ? <IdList /> : <Element />);
}
