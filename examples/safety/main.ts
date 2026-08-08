const CYCLE = 16;
const INSTANCE_COUNT = 84;

type Scene = {
  number: string;
  tag: string;
  title: string;
  detail: string;
  time: number;
};

const scenes: Scene[] = [
  {
    number: "01",
    tag: "IMPORT / SOURCE LOG",
    title: "A spreadsheet is not a safety case.",
    detail: "84 rows detected · 12 links missing",
    time: 0.4,
  },
  {
    number: "02",
    tag: "FTA / TOP EVENT LOGIC",
    title: "Expose every path to the top event.",
    detail: "21 events linked · minimal cut sets resolved",
    time: 5,
  },
  {
    number: "03",
    tag: "FMEA / RISK PRIORITY",
    title: "Put engineering attention where it matters.",
    detail: "Severity × occurrence × detection",
    time: 8.7,
  },
  {
    number: "04",
    tag: "FMEDA / DIAGNOSTIC COVERAGE",
    title: "Turn coverage into a defensible claim.",
    detail: "Failure modes linked · evidence preserved",
    time: 12.1,
  },
];

const canvas = document.querySelector<HTMLCanvasElement>("#safety-canvas");
const stage = document.querySelector<HTMLElement>("#safety-stage");
const sceneNumber = document.querySelector<HTMLElement>("#scene-number");
const sceneTag = document.querySelector<HTMLElement>("#scene-tag");
const sceneTitle = document.querySelector<HTMLElement>("#scene-title");
const sceneDetail = document.querySelector<HTMLElement>("#scene-detail");
const sceneCaption = document.querySelector<HTMLElement>(".scene-caption");
const frameCount = document.querySelector<HTMLElement>("#frame-count");
const frameProgress = document.querySelector<HTMLElement>("#frame-progress");
const phaseButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".phase-nav button"));
const replayButton = document.querySelector<HTMLButtonElement>("#replay");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fillFallbackGrid() {
  const fallback = document.querySelector<HTMLElement>(".fallback-grid");
  if (!fallback) return;
  for (let i = 0; i < 70; i += 1) fallback.append(document.createElement("i"));
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Unable to link WebGL program");
  }
  return program;
}

const backgroundVertex = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const backgroundFragment = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;

float segment(vec2 p, vec2 a, vec2 b, float w) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return 1.0 - smoothstep(w, w + 0.008, length(pa - ba * h));
}

float ring(vec2 p, float r, float w) {
  return 1.0 - smoothstep(w, w + 0.01, abs(length(p) - r));
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  p.x *= aspect;
  vec3 color = vec3(0.055, 0.066, 0.052);

  vec2 gridUv = uv * vec2(30.0 * aspect, 30.0);
  vec2 gridLine = abs(fract(gridUv) - 0.5) / max(fwidth(gridUv), vec2(0.0001));
  float grid = 1.0 - min(min(gridLine.x, gridLine.y), 1.0);
  color += grid * vec3(0.032, 0.037, 0.029);

  vec2 pointer = uPointer;
  pointer.x *= aspect;
  float glow = exp(-3.2 * length(p - pointer));
  color += glow * vec3(0.10, 0.055, 0.015);

  float t = mod(uTime, 16.0);
  float treeA = smoothstep(3.6, 4.8, t) * (1.0 - smoothstep(6.8, 8.1, t));
  float matrixA = smoothstep(7.0, 8.4, t) * (1.0 - smoothstep(10.2, 11.6, t));
  float ringA = smoothstep(10.4, 11.8, t) * (1.0 - smoothstep(13.7, 15.5, t));

  vec2 q = p;
  q.x /= max(aspect, 1.0);
  float tree = 0.0;
  tree += segment(q, vec2(0.0,.61), vec2(-.63,.19), .005);
  tree += segment(q, vec2(0.0,.61), vec2(0.0,.19), .005);
  tree += segment(q, vec2(0.0,.61), vec2(.63,.19), .005);
  tree += segment(q, vec2(-.63,.19), vec2(-.78,-.28), .004);
  tree += segment(q, vec2(-.63,.19), vec2(-.43,-.28), .004);
  tree += segment(q, vec2(0.0,.19), vec2(-.17,-.28), .004);
  tree += segment(q, vec2(0.0,.19), vec2(.17,-.28), .004);
  tree += segment(q, vec2(.63,.19), vec2(.43,-.28), .004);
  tree += segment(q, vec2(.63,.19), vec2(.78,-.28), .004);
  color += min(tree, 1.0) * treeA * vec3(.16,.23,.16);

  float scan = 1.0 - smoothstep(.01, .025, abs(q.x + q.y * .9 - .05));
  color += scan * matrixA * vec3(.16,.055,.018);

  float circles = ring(q, .30, .006) + ring(q, .47, .004) + ring(q, .64, .003);
  float sweep = smoothstep(-.25, .2, sin(atan(q.y,q.x) - t * .7));
  color += min(circles,1.0) * ringA * mix(vec3(.04,.16,.08), vec3(.23,.38,.06), sweep);

  float vignette = smoothstep(1.35, .28, length((uv - .5) * vec2(1.0,.9)));
  color *= .74 + .26 * vignette;
  float noise = fract(sin(dot(floor(gl_FragCoord.xy + uTime * 7.0), vec2(12.9898,78.233))) * 43758.5453);
  color += (noise - .5) * .014;
  outColor = vec4(color, 1.0);
}`;

const tileVertex = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
out vec2 vLocal;
out vec3 vColor;
out float vGlow;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;

float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
mat2 rotate2d(float a) { float s = sin(a), c = cos(a); return mat2(c,-s,s,c); }
float quantize(float p, float steps) { return floor(clamp(p,0.0,1.0) * steps) / steps; }
float ease(float p) { p = clamp(p,0.0,1.0); return 1.0 - pow(1.0 - p, 3.0); }

void layout(float layoutIndex, float fi, out vec2 center, out vec2 size, out float rotation, out vec3 color) {
  float col = mod(fi, 12.0);
  float row = floor(fi / 12.0);
  float seed = hash(fi + 2.0);
  if (layoutIndex < .5) {
    center = vec2((col - 5.5) * .137, (.5 * 6.0 - row) * .115);
    center = rotate2d(-.07) * center;
    center.y += center.x * .055;
    size = vec2(.126, .099);
    rotation = -.07;
    color = row < .5 ? mix(vec3(1.0,.36,.17), vec3(.84,1.0,.27), step(.72,seed)) : mix(vec3(.50,.53,.47), vec3(.91,.90,.84), seed);
  } else if (layoutIndex < 1.5) {
    float node = floor(fi / 4.0);
    float cell = mod(fi, 4.0);
    vec2 local = vec2(mod(cell,2.0), floor(cell/2.0)) - .5;
    vec2 nodeCenter;
    if (node < 1.0) {
      nodeCenter = vec2(0.0,.61);
    } else if (node < 4.0) {
      nodeCenter = vec2((node - 2.0) * .63, .19);
    } else if (node < 10.0) {
      nodeCenter = vec2((node - 6.5) * .245, -.28);
    } else {
      nodeCenter = vec2((node - 15.0) * .15, -.69);
    }
    center = nodeCenter + local * vec2(.062,.048);
    size = vec2(.054,.041);
    rotation = 0.0;
    color = node < 1.0 ? vec3(1.0,.36,.17) : (node < 10.0 ? vec3(.88,.87,.80) : vec3(.20,.82,.48));
  } else if (layoutIndex < 2.5) {
    center = vec2((col - 5.5) * .127, (3.0 - row) * .13);
    size = vec2(.111,.112);
    rotation = 0.0;
    float risk = (col / 11.0) * .55 + ((6.0-row) / 6.0) * .45;
    vec3 green = vec3(.20,.82,.48);
    vec3 amber = vec3(1.0,.71,.20);
    vec3 red = vec3(1.0,.24,.12);
    color = risk < .5 ? mix(green, amber, risk * 2.0) : mix(amber, red, (risk-.5)*2.0);
  } else {
    float ringId = floor(fi / 28.0);
    float slot = mod(fi, 28.0);
    float angle = slot / 28.0 * 6.283185 + ringId * .09;
    float radius = .29 + ringId * .17;
    center = vec2(cos(angle), sin(angle)) * radius;
    size = vec2(.046,.046);
    rotation = angle + 1.5708;
    color = mix(vec3(.20,.82,.48), vec3(.84,1.0,.27), ringId / 2.0);
  }
}

void main() {
  float fi = float(gl_InstanceID);
  float t = mod(uTime, 16.0);
  float fromLayout = 0.0;
  float toLayout = 0.0;
  float p = 0.0;
  if (t < 3.25) {
    fromLayout = 0.0; toLayout = 0.0;
  } else if (t < 4.85) {
    fromLayout = 0.0; toLayout = 1.0; p = (t - 3.25) / 1.6;
  } else if (t < 6.75) {
    fromLayout = 1.0; toLayout = 1.0;
  } else if (t < 8.35) {
    fromLayout = 1.0; toLayout = 2.0; p = (t - 6.75) / 1.6;
  } else if (t < 10.25) {
    fromLayout = 2.0; toLayout = 2.0;
  } else if (t < 11.85) {
    fromLayout = 2.0; toLayout = 3.0; p = (t - 10.25) / 1.6;
  } else if (t < 13.75) {
    fromLayout = 3.0; toLayout = 3.0;
  } else {
    fromLayout = 3.0; toLayout = 0.0; p = (t - 13.75) / 2.25;
  }

  float stagger = hash(fi) * .35;
  p = quantize((p - stagger) / max(1.0 - stagger, .01), 9.0);
  p = ease(p);

  vec2 centerA, centerB, sizeA, sizeB;
  float rotationA, rotationB;
  vec3 colorA, colorB;
  layout(fromLayout, fi, centerA, sizeA, rotationA, colorA);
  layout(toLayout, fi, centerB, sizeB, rotationB, colorB);
  vec2 center = mix(centerA, centerB, p);
  vec2 size = mix(sizeA, sizeB, p);
  float rotation = mix(rotationA, rotationB, p);
  vColor = mix(colorA, colorB, p);

  float aspect = uResolution.x / max(uResolution.y,1.0);
  vec2 pointer = uPointer;
  vec2 pointerDelta = center - pointer;
  float pointerForce = exp(-5.0 * dot(pointerDelta,pointerDelta));
  center += normalize(pointerDelta + .0001) * pointerForce * .025;

  vec2 local = rotate2d(rotation) * (aCorner * size);
  vec2 position = center + local;
  position.x /= max(1.0, aspect * .77);
  float zLift = sin((fi + floor(uTime * 9.0)) * 1.73) * .003;
  gl_Position = vec4(position, zLift, 1.0);
  vLocal = aCorner;
  vGlow = pointerForce;
}`;

const tileFragment = `#version 300 es
precision highp float;
in vec2 vLocal;
in vec3 vColor;
in float vGlow;
out vec4 outColor;
void main() {
  vec2 q = abs(vLocal);
  float edge = max(q.x,q.y);
  float mask = 1.0 - smoothstep(.90,1.0,edge);
  float border = smoothstep(.80,.87,edge) * mask;
  vec3 color = mix(vColor * 1.14, vColor * .48, border);
  color += vGlow * vec3(.18,.07,.015);
  outColor = vec4(color, mask * .96);
}`;

function sceneIndexForTime(t: number) {
  if (t < 3.9 || t >= 14.9) return 0;
  if (t < 7.5) return 1;
  if (t < 11) return 2;
  return 3;
}

if (!canvas || !stage) {
  fillFallbackGrid();
} else {
  const gl = canvas.getContext("webgl2", {
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });

  if (!gl) {
    stage.classList.add("no-webgl");
    fillFallbackGrid();
  } else {
    try {
      const bgProgram = createProgram(gl, backgroundVertex, backgroundFragment);
      const tileProgram = createProgram(gl, tileVertex, tileFragment);
      const cornerBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
        gl.STATIC_DRAW,
      );

      const bgTime = gl.getUniformLocation(bgProgram, "uTime");
      const bgResolution = gl.getUniformLocation(bgProgram, "uResolution");
      const bgPointer = gl.getUniformLocation(bgProgram, "uPointer");
      const tileTime = gl.getUniformLocation(tileProgram, "uTime");
      const tileResolution = gl.getUniformLocation(tileProgram, "uResolution");
      const tilePointer = gl.getUniformLocation(tileProgram, "uPointer");

      let width = 1;
      let height = 1;
      let pointerX = 0;
      let pointerY = 0;
      let currentScene = -1;
      let timeAnchor = performance.now();
      let timeOffset = 0.4;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        width = Math.max(1, Math.round(rect.width * dpr));
        height = Math.max(1, Math.round(rect.height * dpr));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);

      const setSceneUI = (index: number) => {
        if (index === currentScene) return;
        currentScene = index;
        const scene = scenes[index];
        sceneCaption?.classList.add("swap");
        window.setTimeout(() => {
          if (sceneNumber) sceneNumber.textContent = scene.number;
          if (sceneTag) sceneTag.textContent = scene.tag;
          if (sceneTitle) sceneTitle.textContent = scene.title;
          if (sceneDetail) sceneDetail.textContent = scene.detail;
          sceneCaption?.classList.remove("swap");
        }, reducedMotion ? 0 : 90);
        phaseButtons.forEach((button, buttonIndex) => {
          button.classList.toggle("active", buttonIndex === index);
          button.setAttribute("aria-pressed", String(buttonIndex === index));
        });
      };

      const seek = (time: number) => {
        timeOffset = time;
        timeAnchor = performance.now();
        currentScene = -1;
        if (reducedMotion) render(performance.now());
      };

      phaseButtons.forEach((button) => {
        button.addEventListener("click", () => seek(Number(button.dataset.time || 0)));
      });
      replayButton?.addEventListener("click", () => seek(.4));

      canvas.addEventListener("pointermove", (event) => {
        const rect = canvas.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointerY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      });
      canvas.addEventListener("pointerleave", () => { pointerX = 0; pointerY = 0; });

      const render = (now: number) => {
        resize();
        const elapsed = reducedMotion ? 0 : (now - timeAnchor) / 1000;
        const time = (timeOffset + elapsed) % CYCLE;
        const sceneIndex = sceneIndexForTime(time);
        setSceneUI(sceneIndex);
        if (frameCount) frameCount.textContent = String(Math.floor(time * 9) + 1).padStart(3, "0");
        if (frameProgress) frameProgress.style.width = `${(time / CYCLE) * 100}%`;

        gl.viewport(0, 0, width, height);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.useProgram(bgProgram);
        gl.uniform1f(bgTime, time);
        gl.uniform2f(bgResolution, width, height);
        gl.uniform2f(bgPointer, pointerX, pointerY);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(tileProgram);
        gl.uniform1f(tileTime, time);
        gl.uniform2f(tileResolution, width, height);
        gl.uniform2f(tilePointer, pointerX, pointerY);
        gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, INSTANCE_COUNT);

        if (!reducedMotion) requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    } catch (error) {
      console.error("Safety animation unavailable", error);
      stage.classList.add("no-webgl");
      fillFallbackGrid();
    }
  }
}
