import { MAX_RIPPLES, VERTEX_SRC } from "../core/glsl";
import type { UniformType } from "../core/types";

export interface UniformDescriptor {
  name: string;
  type: UniformType;
  value: number | number[];
}

/**
 * Build a fully self-contained HTML page that renders `fragmentSource` as a
 * fixed, full-viewport background with the given uniform values baked in.
 * Everything is inlined — drop it anywhere, no build step, no dependencies.
 */
export function standaloneHTML(
  name: string,
  fragmentSource: string,
  uniforms: UniformDescriptor[],
): string {
  const uniformData = JSON.stringify(
    uniforms.map((u) => ({ name: u.name, type: u.type, value: u.value })),
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(name)} — shader background</title>
<style>
  html, body { margin: 0; height: 100%; }
  body { background: #000; }
  /* z-index 0 (not -1): a negative z-index would paint the canvas *behind*
     the body background, which hides it completely. */
  #bg { position: fixed; inset: 0; width: 100%; height: 100%; display: block; z-index: 0; }
  /* Your page content goes on top of the canvas. */
  .content { position: relative; z-index: 1;
             color: #fff; font-family: system-ui, sans-serif;
             display: grid; place-items: center; height: 100vh; text-align: center; }
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="content">
  <h1>Your landing page</h1>
</div>
<script type="x-shader/x-vertex" id="vert">${VERTEX_SRC}</script>
<script type="x-shader/x-fragment" id="frag">${fragmentSource}</script>
<script>
(function () {
  var uniforms = ${uniformData};
  var canvas = document.getElementById("bg");
  var gl = canvas.getContext("webgl", { antialias: false, alpha: true });
  if (!gl) return;
  gl.getExtension("OES_standard_derivatives");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, document.getElementById("vert").textContent);
  var fs = compile(gl.FRAGMENT_SHADER, document.getElementById("frag").textContent);
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "a_position");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uTime   = gl.getUniformLocation(prog, "u_time");
  var uRes    = gl.getUniformLocation(prog, "u_resolution");
  var uMouse  = gl.getUniformLocation(prog, "u_mouse");
  var uSmooth = gl.getUniformLocation(prog, "u_mouseSmooth");
  var uVel    = gl.getUniformLocation(prog, "u_mouseVel");
  var uDown   = gl.getUniformLocation(prog, "u_mouseDown");
  var uEnter  = gl.getUniformLocation(prog, "u_mouseEnter");
  var uRipples= gl.getUniformLocation(prog, "u_ripples[0]");
  uniforms.forEach(function (u) { u.loc = gl.getUniformLocation(prog, u.name); });

  // Pointer state, mirroring the library runtime so interactive shaders behave
  // the same here as they do in the studio.
  var MAX_RIPPLES = ${MAX_RIPPLES};
  var mouse = [0.5, 0.5], smooth = [0.5, 0.5], vel = [0, 0];
  var down = 0, downTarget = 0, enter = 0, enterTarget = 0;
  var ripples = new Float32Array(MAX_RIPPLES * 4), rippleAt = 0;
  for (var i = 0; i < MAX_RIPPLES; i++) ripples[i * 4 + 2] = -1;

  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width  = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
  }
  window.addEventListener("resize", resize); resize();

  function toLocal(e) {
    var r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
  }
  window.addEventListener("pointermove", function (e) {
    mouse = toLocal(e); enterTarget = 1;
  });
  window.addEventListener("pointerdown", function (e) {
    mouse = toLocal(e); downTarget = 1;
    var i = rippleAt * 4;
    ripples[i] = mouse[0]; ripples[i+1] = mouse[1];
    ripples[i+2] = 0; ripples[i+3] = 1;
    rippleAt = (rippleAt + 1) % MAX_RIPPLES;
  });
  window.addEventListener("pointerup", function () { downTarget = 0; });
  document.addEventListener("pointerleave", function () { enterTarget = 0; });

  var start = performance.now(), last = start;
  (function frame(now) {
    now = now || performance.now();
    var dt = Math.min(0.05, (now - last) / 1000); last = now;

    var ease = 1 - Math.exp(-dt * 8);
    var px = smooth[0], py = smooth[1];
    smooth = [px + (mouse[0]-px) * ease, py + (mouse[1]-py) * ease];
    if (dt > 0) {
      var k = 1 - Math.exp(-dt * 6);
      vel = [vel[0] + ((smooth[0]-px)/dt - vel[0]) * k,
             vel[1] + ((smooth[1]-py)/dt - vel[1]) * k];
    }
    down  += (downTarget  - down)  * (1 - Math.exp(-dt * 12));
    enter += (enterTarget - enter) * (1 - Math.exp(-dt * 4));
    for (var j = 0; j < MAX_RIPPLES; j++) {
      var age = ripples[j*4+2];
      if (age < 0) continue;
      var nx = age + dt;
      ripples[j*4+2] = nx > 6 ? -1 : nx;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse)   gl.uniform2f(uMouse, mouse[0], mouse[1]);
    if (uSmooth)  gl.uniform2f(uSmooth, smooth[0], smooth[1]);
    if (uVel)     gl.uniform2f(uVel, vel[0], vel[1]);
    if (uDown)    gl.uniform1f(uDown, down);
    if (uEnter)   gl.uniform1f(uEnter, enter);
    if (uRipples) gl.uniform4fv(uRipples, ripples);
    uniforms.forEach(function (u) {
      if (!u.loc) return;
      if (u.type === "float") gl.uniform1f(u.loc, u.value);
      else if (u.type === "vec2") gl.uniform2f(u.loc, u.value[0], u.value[1]);
      else gl.uniform3f(u.loc, u.value[0], u.value[1], u.value[2]);
    });
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  })();
})();
</script>
</body>
</html>
`;
}

/** The npm/JS usage snippet shown in the editor for a given shader id. */
export function usageSnippet(shaderId: string): string {
  const camel = shaderId.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return `import { ShaderBackground, shaders } from "taste-is-the-moat";

const canvas = document.querySelector("#bg");
const bg = new ShaderBackground(canvas, shaders.${camel}, {
  pauseWhenHidden: true,   // saves battery when scrolled away
  respectReducedMotion: true,
});

// bg.pause() / bg.play()
// bg.setUniform("u_speed", 0.8)`;
}

/** Trigger a browser download of `content` as `filename`. */
export function download(filename: string, content: string, mime = "text/plain"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string;
  });
}
