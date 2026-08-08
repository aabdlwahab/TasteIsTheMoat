const COLS = 64;
const ROWS = 30;
const SCENE_SECONDS = 2.6;
const SCENE_COUNT = 6;
const CYCLE_SECONDS = SCENE_SECONDS * SCENE_COUNT;
const MAX_PIXELS = 720;

type RGB = [number, number, number];
type Pixel = { x: number; y: number; color: RGB };
type Scene = { method: string; copy: string; formula: string; status: string; selection: string };

const COLORS = {
  ink: [0.06, 0.075, 0.065] as RGB,
  grey: [0.64, 0.68, 0.65] as RGB,
  soft: [0.84, 0.86, 0.84] as RGB,
  excel: [0.13, 0.45, 0.27] as RGB,
  green: [0.13, 0.65, 0.39] as RGB,
  acid: [0.84, 1.0, 0.26] as RGB,
  orange: [1.0, 0.35, 0.14] as RGB,
  yellow: [1.0, 0.79, 0.20] as RGB,
  red: [0.93, 0.22, 0.18] as RGB,
  purple: [0.43, 0.28, 0.63] as RGB,
};

const scenes: Scene[] = [
  { method: "IMPORTING SOURCE DATA", copy: "Every row becomes traceable.", formula: "=KERNL.IMPORT(Safety_Case_Master)", status: "READY · 126 LINKS VERIFIED", selection: "KERNL is importing" },
  { method: "FAULT TREE ANALYSIS", copy: "Cells assemble into fault logic.", formula: "=FTA.TOP_EVENT(Brake_Loss)", status: "FTA · 21 EVENTS LINKED", selection: "Building FTA" },
  { method: "FAULT TREE ANALYSIS", copy: "Every path reaches the top event.", formula: "=FTA.MINIMAL_CUT_SETS(A1:A21)", status: "FTA · 6 CUT SETS RESOLVED", selection: "Tracing causes" },
  { method: "FAILURE MODE & EFFECTS", copy: "Risk becomes impossible to miss.", formula: "=FMEA.PRIORITY(Severity,Occurrence,Detection)", status: "FMEA · 84 MODES PRIORITIZED", selection: "Ranking risk" },
  { method: "FMEDA / DIAGNOSTICS", copy: "Coverage becomes a visible claim.", formula: "=FMEDA.DC(Safe,Detected,Residual)", status: "FMEDA · 97% DIAGNOSTIC COVERAGE", selection: "Calculating DC" },
  { method: "ONE CONNECTED MODEL", copy: "The safety case moves as one.", formula: "=KERNL.CONNECT(FTA,FMEA,FMEDA)", status: "CONNECTED · EVIDENCE PRESERVED", selection: "Safety case synced" },
];

const FONT: Record<string, string[]> = {
  A:["01110","10001","10001","11111","10001","10001","10001"],
  C:["01111","10000","10000","10000","10000","10000","01111"],
  D:["11110","10001","10001","10001","10001","10001","11110"],
  E:["11111","10000","10000","11110","10000","10000","11111"],
  F:["11111","10000","10000","11110","10000","10000","10000"],
  M:["10001","11011","10101","10101","10001","10001","10001"],
  N:["10001","11001","10101","10011","10001","10001","10001"],
  O:["01110","10001","10001","10001","10001","10001","01110"],
  T:["11111","00100","00100","00100","00100","00100","00100"],
  7:["11111","00001","00010","00100","01000","01000","01000"],
  9:["01110","10001","10001","01111","00001","00001","11110"],
  "%":["11001","11010","00100","01000","10110","00110","00000"],
};

function hash(value: number) {
  const x = Math.sin(value * 91.733) * 43758.5453;
  return x - Math.floor(x);
}

function addRect(out: Pixel[], x: number, y: number, width: number, height: number, color: RGB, hollow = false) {
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      if (!hollow || row === 0 || col === 0 || row === height - 1 || col === width - 1) out.push({ x: x + col, y: y + row, color });
    }
  }
}

function addLine(out: Pixel[], x0: number, y0: number, x1: number, y1: number, color: RGB) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i += 1) {
    const p = steps === 0 ? 0 : i / steps;
    out.push({ x: Math.round(x0 + (x1 - x0) * p), y: Math.round(y0 + (y1 - y0) * p), color });
  }
}

function addText(out: Pixel[], text: string, x: number, y: number, scale: number, color: RGB, colorForPixel?: (x: number, y: number) => RGB) {
  let cursor = x;
  for (const character of text) {
    const glyph = FONT[character];
    if (!glyph) { cursor += 3 * scale; continue; }
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((value, colIndex) => {
        if (value !== "1") return;
        const pixelColor = colorForPixel?.(cursor + colIndex * scale, y + rowIndex * scale) ?? color;
        addRect(out, cursor + colIndex * scale, y + rowIndex * scale, scale, scale, pixelColor);
      });
    });
    cursor += 6 * scale;
  }
}

function sourcePattern(): Pixel[] {
  const out: Pixel[] = [];
  addText(out, "DATA", 35, 2, 1, COLORS.excel);
  addRect(out, 31, 10, 30, 2, COLORS.excel);
  for (let row = 12; row < 27; row += 2) {
    for (let col = 31; col < 61; col += 3) {
      const seed = hash(row * 71 + col);
      const color = col > 54 ? (seed > .72 ? COLORS.red : seed > .42 ? COLORS.yellow : COLORS.green) : seed > .8 ? COLORS.orange : seed > .45 ? COLORS.soft : COLORS.grey;
      addRect(out, col, row, col > 54 ? 2 : 1 + Math.floor(seed * 2), 1, color);
    }
  }
  return out;
}

function ftaTitlePattern(): Pixel[] {
  const out: Pixel[] = [];
  addText(out, "FTA", 5, 4, 3, COLORS.ink, (x) => x > 42 ? COLORS.orange : x > 24 ? COLORS.excel : COLORS.ink);
  return out;
}

function faultTreePattern(): Pixel[] {
  const out: Pixel[] = [];
  addText(out, "FTA", 2, 2, 1, COLORS.excel);
  addRect(out, 29, 3, 8, 3, COLORS.red, true);
  addLine(out, 33, 6, 33, 9, COLORS.ink);
  addLine(out, 17, 9, 49, 9, COLORS.ink);
  for (const x of [17, 33, 49]) {
    addLine(out, x, 9, x, 12, COLORS.ink);
    addRect(out, x - 3, 12, 7, 3, COLORS.yellow, true);
  }
  const leaves = [9,17,25,33,41,49,57];
  leaves.forEach((x, index) => {
    const parent = index < 2 ? 17 : index < 5 ? 33 : 49;
    addLine(out, parent, 15, parent, 18, COLORS.ink);
    addLine(out, Math.min(parent,x), 18, Math.max(parent,x), 18, COLORS.ink);
    addLine(out, x, 18, x, 21, COLORS.ink);
    addRect(out, x - 2, 21, 5, 3, index === 3 ? COLORS.orange : COLORS.green, true);
  });
  return out;
}

function fmeaPattern(): Pixel[] {
  const out: Pixel[] = [];
  addText(out, "FMEA", 8, 4, 2, COLORS.ink, (x, y) => {
    const risk = x / COLS * .58 + (1 - y / ROWS) * .42;
    return risk > .67 ? COLORS.red : risk > .43 ? COLORS.yellow : COLORS.green;
  });
  addRect(out, 19, 23, 26, 1, COLORS.ink);
  for (let i = 0; i < 13; i += 1) out.push({ x: 20 + i * 2, y: 25, color: i < 4 ? COLORS.green : i < 8 ? COLORS.yellow : COLORS.red });
  return out;
}

function fmedaPattern(): Pixel[] {
  const out: Pixel[] = [];
  const cx = 33, cy = 15;
  for (let ring = 0; ring < 3; ring += 1) {
    const radius = 8 + ring * 3;
    const samples = 42 + ring * 16;
    for (let i = 0; i < samples; i += 1) {
      const angle = i / samples * Math.PI * 2;
      if (ring === 2 && angle > 5.2) continue;
      out.push({ x: Math.round(cx + Math.cos(angle) * radius), y: Math.round(cy + Math.sin(angle) * radius), color: ring === 0 ? COLORS.orange : ring === 1 ? COLORS.green : COLORS.acid });
    }
  }
  addText(out, "97%", 24, 11, 1, COLORS.ink);
  addText(out, "FMEDA", 18, 25, 1, COLORS.excel);
  return out;
}

function connectedPattern(): Pixel[] {
  const out: Pixel[] = [];
  addText(out, "CONNECTED", 5, 19, 1, COLORS.ink, (x) => x > 42 ? COLORS.excel : COLORS.ink);
  addLine(out, 20, 10, 29, 18, COLORS.green);
  addLine(out, 29, 18, 47, 4, COLORS.green);
  addLine(out, 20, 11, 29, 19, COLORS.acid);
  addLine(out, 29, 19, 47, 5, COLORS.acid);
  for (let i = 0; i < 15; i += 1) out.push({ x: 6 + i * 4, y: 27, color: i % 3 === 0 ? COLORS.orange : COLORS.soft });
  return out;
}

const patterns = [sourcePattern(), ftaTitlePattern(), faultTreePattern(), fmeaPattern(), fmedaPattern(), connectedPattern()];

const canvas = document.querySelector<HTMLCanvasElement>("#sheet-canvas");
const stage = document.querySelector<HTMLElement>("#sheet-stage");
const columnHeads = document.querySelector<HTMLElement>("#column-heads");
const rowHeads = document.querySelector<HTMLElement>("#row-heads");
const sceneStep = document.querySelector<HTMLElement>("#scene-step");
const sceneMethod = document.querySelector<HTMLElement>("#scene-method");
const sceneCopy = document.querySelector<HTMLElement>("#scene-copy");
const cellAddress = document.querySelector<HTMLElement>("#cell-address");
const formulaValue = document.querySelector<HTMLElement>("#formula-value");
const statusCopy = document.querySelector<HTMLElement>("#status-copy");
const selectionLabel = document.querySelector<HTMLElement>("#selection-label");
const replay = document.querySelector<HTMLButtonElement>("#replay");
const chapterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".chapter-scrubber button"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function columnName(index: number) {
  let result = "";
  let value = index + 1;
  while (value > 0) { value -= 1; result = String.fromCharCode(65 + value % 26) + result; value = Math.floor(value / 26); }
  return result;
}

for (let i = 0; i < COLS; i += 1) { const span = document.createElement("span"); span.textContent = columnName(i); columnHeads?.append(span); }
for (let i = 0; i < ROWS; i += 1) { const span = document.createElement("span"); span.textContent = String(i + 1); rowHeads?.append(span); }

function shader(gl: WebGL2RenderingContext, type: number, source: string) {
  const value = gl.createShader(type);
  if (!value) throw new Error("Unable to create shader");
  gl.shaderSource(value, source); gl.compileShader(value);
  if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value) || "Shader error");
  return value;
}

function program(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const value = gl.createProgram();
  if (!value) throw new Error("Unable to create program");
  gl.attachShader(value, shader(gl, gl.VERTEX_SHADER, vertex)); gl.attachShader(value, shader(gl, gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(value);
  if (!gl.getProgramParameter(value, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(value) || "Link error");
  return value;
}

const bgVertex = `#version 300 es
precision highp float; out vec2 vUv;
void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2)); vUv=p; gl_Position=vec4(p*2.0-1.0,0,1); }`;
const bgFragment = `#version 300 es
precision highp float; in vec2 vUv; out vec4 outColor;
uniform vec4 uSelection;
void main(){
  vec2 cells=vec2(64.0,30.0); vec2 g=abs(fract(vUv*cells)-.5)/max(fwidth(vUv*cells),vec2(.001));
  float line=1.0-min(min(g.x,g.y),1.0); vec3 color=mix(vec3(.985,.987,.979),vec3(.82,.84,.82),line*.72);
  vec2 cell=floor(vUv*cells); float selected=step(uSelection.x,cell.x)*step(cell.x,uSelection.z)*step(uSelection.y,cell.y)*step(cell.y,uSelection.w);
  color=mix(color,vec3(.90,.97,.92),selected*.22);
  outColor=vec4(color,1);
}`;
const pixelVertex = `#version 300 es
precision highp float; layout(location=0) in vec2 aCorner; layout(location=1) in vec2 aCell; layout(location=2) in vec4 aColor;
out vec2 vLocal; out vec4 vColor;
void main(){
  vec2 uv=(aCell+vec2(.5))/vec2(64.0,30.0); vec2 size=vec2(.94/64.0,.91/30.0);
  vec2 pos=uv+aCorner*size*.5; gl_Position=vec4(pos.x*2.0-1.0,1.0-pos.y*2.0,0,1); vLocal=aCorner; vColor=aColor;
}`;
const pixelFragment = `#version 300 es
precision highp float; in vec2 vLocal; in vec4 vColor; out vec4 outColor;
void main(){ float edge=max(abs(vLocal.x),abs(vLocal.y)); float mask=1.0-smoothstep(.88,1.0,edge); vec3 c=mix(vColor.rgb*1.08,vColor.rgb*.72,smoothstep(.72,.92,edge)); outColor=vec4(c,vColor.a*mask); }`;

if (canvas && stage) {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, powerPreference: "high-performance" });
  if (!gl) stage.classList.add("no-webgl");
  else {
    try {
      const backgroundProgram = program(gl, bgVertex, bgFragment);
      const pixelsProgram = program(gl, pixelVertex, pixelFragment);
      const corners = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, corners);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const instanceBuffer = gl.createBuffer();
      const instanceData = new Float32Array(MAX_PIXELS * 6);
      const selectionUniform = gl.getUniformLocation(backgroundProgram,"uSelection");
      let width = 1, height = 1, anchor = performance.now(), offset = .25, currentScene = -1, lastFrame = -1;

      const resize = () => {
        const rect = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1,1.5);
        width=Math.max(1,Math.round(rect.width*dpr)); height=Math.max(1,Math.round(rect.height*dpr));
        if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      };
      resize(); new ResizeObserver(resize).observe(canvas);

      const setUI = (index: number) => {
        if(index===currentScene) return; currentScene=index; const scene=scenes[index]; stage.dataset.scene=String(index);
        if(sceneStep) sceneStep.textContent=`${String(index+1).padStart(2,"0")} / 06`;
        if(sceneMethod) sceneMethod.textContent=scene.method; if(sceneCopy) sceneCopy.textContent=scene.copy;
        if(formulaValue) formulaValue.textContent=scene.formula; if(statusCopy) statusCopy.textContent=scene.status;
        if(selectionLabel) selectionLabel.textContent=scene.selection; if(cellAddress) cellAddress.textContent=["N24","F7","AG10","S18","AH15","K20"][index];
        chapterButtons.forEach((button)=>{const active=Number(button.dataset.scene)===index||(index===2&&Number(button.dataset.scene)===1);button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));});
      };

      const seek = (sceneIndex: number) => { offset=sceneIndex*SCENE_SECONDS+.2; anchor=performance.now(); currentScene=-1; lastFrame=-1; if(reducedMotion) render(performance.now()); };
      chapterButtons.forEach((button)=>button.addEventListener("click",()=>seek(Number(button.dataset.scene||0))));
      replay?.addEventListener("click",()=>seek(0));

      const fillInstances = (sceneIndex: number, nextIndex: number, progress: number) => {
        const a=patterns[sceneIndex], b=patterns[nextIndex];
        for(let i=0;i<MAX_PIXELS;i+=1){
          const pa=i<a.length?a[i]:undefined, pb=i<b.length?b[i]:undefined; const from=pa??pb, to=pb??pa; const base=i*6;
          if(!from||!to){instanceData[base+5]=0;continue;}
          const stagger=hash(i+sceneIndex*991)*.22; let p=Math.max(0,Math.min(1,(progress-stagger)/(1-stagger))); p=Math.floor(p*9)/9;
          instanceData[base]=Math.round(from.x+(to.x-from.x)*p); instanceData[base+1]=Math.round(from.y+(to.y-from.y)*p);
          instanceData[base+2]=from.color[0]+(to.color[0]-from.color[0])*p; instanceData[base+3]=from.color[1]+(to.color[1]-from.color[1])*p; instanceData[base+4]=from.color[2]+(to.color[2]-from.color[2])*p;
          instanceData[base+5]=pa&&pb?1:pa?1-p:p;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER,instanceBuffer); gl.bufferData(gl.ARRAY_BUFFER,instanceData,gl.DYNAMIC_DRAW);
      };

      const render = (now: number) => {
        resize(); const elapsed=reducedMotion?0:(now-anchor)/1000; const time=(offset+elapsed)%CYCLE_SECONDS;
        const sceneIndex=Math.floor(time/SCENE_SECONDS)%SCENE_COUNT; const nextIndex=(sceneIndex+1)%SCENE_COUNT; const local=(time%SCENE_SECONDS)/SCENE_SECONDS;
        const progress=Math.max(0,Math.min(1,(local-.43)/.52)); const snappedFrame=Math.floor(time*8);
        setUI(sceneIndex);
        if(snappedFrame!==lastFrame){lastFrame=snappedFrame;fillInstances(sceneIndex,nextIndex,progress);}
        gl.viewport(0,0,width,height); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.useProgram(backgroundProgram);
        const selections=[[30,9,61,27],[4,3,57,26],[7,2,58,25],[7,3,58,26],[18,3,52,28],[4,3,60,28]]; const s=selections[sceneIndex]; gl.uniform4f(selectionUniform,s[0],s[1],s[2],s[3]); gl.drawArrays(gl.TRIANGLES,0,3);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.useProgram(pixelsProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER,corners); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.vertexAttribDivisor(0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER,instanceBuffer); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,2,gl.FLOAT,false,24,0); gl.vertexAttribDivisor(1,1); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,4,gl.FLOAT,false,24,8); gl.vertexAttribDivisor(2,1);
        gl.drawArraysInstanced(gl.TRIANGLES,0,6,MAX_PIXELS);
        if(!reducedMotion) requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    } catch(error) { console.error("Spreadsheet animation unavailable",error); stage.classList.add("no-webgl"); }
  }
}
