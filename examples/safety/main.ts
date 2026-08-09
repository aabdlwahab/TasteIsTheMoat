const COLS = 64;
const ROWS = 30;
const SCENE_SECONDS = 3.35;
const SCENE_COUNT = 6;
const CYCLE_SECONDS = SCENE_SECONDS * SCENE_COUNT;
const MAX_PIXELS = 720;

type RGB = [number, number, number];
type Pixel = { x: number; y: number; color: RGB };
type MorphPair = { from: Pixel; to: Pixel; fromVisible: boolean; toVisible: boolean };
type Scene = { method: string; copy: string; formula: string; status: string; selection: string };
type CellLabel = { text: string; x: number; y: number; width: number; kind?: "text" | "header" | "critical" | "warning" | "good" | "node" | "metric" | "formula" };
type Connector = { x1: number; y1: number; x2: number; y2: number };

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

function addRibbon(out: Pixel[], x0: number, y0: number, x1: number, y1: number, color: RGB, thickness = 2) {
  const horizontal = Math.abs(x1 - x0) > Math.abs(y1 - y0);
  for (let offset = 0; offset < thickness; offset += 1) {
    const centered = offset - (thickness - 1) / 2;
    addLine(
      out,
      x0 + (horizontal ? 0 : centered),
      y0 + (horizontal ? centered : 0),
      x1 + (horizontal ? 0 : centered),
      y1 + (horizontal ? centered : 0),
      color,
    );
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
  addRect(out,31,2,21,1,COLORS.excel);
  addRect(out,31,10,33,1,COLORS.excel);
  [12,14,16,18,20].forEach((row,index)=>{
    addRect(out,31,row,33,1,index%2?COLORS.soft:[.91,.94,.92] as RGB);
    addRect(out,54,row,2,1,index<2?COLORS.red:COLORS.yellow);
    addRect(out,56,row,2,1,index===2?COLORS.red:COLORS.yellow);
    addRect(out,58,row,2,1,index===1?COLORS.red:COLORS.green);
    addRect(out,60,row,4,1,index<3?COLORS.orange:COLORS.green);
  });
  return out;
}

function riskTreePattern(spread: number): Pixel[] {
  const out: Pixel[] = [];
  const center = 33;
  const squeeze = (x: number) => Math.round(center + (x - center) * spread);
  const branchColors = [COLORS.yellow, COLORS.red, COLORS.green] as RGB[];

  addText(out, "FTA", 2, 2, 1, COLORS.excel);
  addRect(out, squeeze(28), 3, Math.max(5, Math.round(11 * spread)), 3, COLORS.red);
  addRibbon(out, center, 6, center, 9, COLORS.ink, 2);
  addRect(out, center - 2, 8, 5, 2, COLORS.orange);

  [16, 33, 50].forEach((rawX, branchIndex) => {
    const x = squeeze(rawX);
    const color = branchColors[branchIndex];
    addRibbon(out, center, 10, x, 13, color, 2);
    addRect(out, x - 4, 13, 9, 3, color);
  });

  const leaves = [7, 15, 24, 33, 42, 51, 59];
  leaves.forEach((rawX, index) => {
    const rawParent = index < 2 ? 16 : index < 5 ? 33 : 50;
    const x = squeeze(rawX);
    const parent = squeeze(rawParent);
    const color = index === 3 || index === 6 ? COLORS.red : index === 2 || index === 4 ? COLORS.yellow : COLORS.green;
    addRibbon(out, parent, 16, x, 21, color, 2);
    addRect(out, x - 3, 21, 7, 3, color);
    addRibbon(out, x, 24, x, 27, COLORS.ink, 1);
  });
  return out;
}

function ftaTitlePattern(): Pixel[] {
  return riskTreePattern(.28);
}

function faultTreePattern(): Pixel[] {
  return riskTreePattern(1);
}

function fmeaPattern(): Pixel[] {
  const out: Pixel[] = [];
  addRect(out, 4, 4, 60, 1, COLORS.excel);
  [7,10,13,16].forEach((row,index)=>{
    addRect(out,4,row,60,1,index%2?COLORS.soft:[.91,.94,.92] as RGB);
    addRect(out,44,row,3,1,index<2?COLORS.red:COLORS.yellow);
    addRect(out,47,row,3,1,index===1||index===3?COLORS.yellow:COLORS.green);
    addRect(out,50,row,3,1,index===1?COLORS.red:index===0?COLORS.yellow:COLORS.green);
    addRect(out,53,row,5,1,index<2?COLORS.red:COLORS.yellow);
    addRect(out,58,row,6,1,index<2?COLORS.orange:COLORS.green);
  });
  addRect(out,4,21,19,1,COLORS.purple);
  addRect(out,24,21,17,1,COLORS.excel);
  addRect(out,42,21,22,1,COLORS.yellow);
  return out;
}

function fmedaPattern(): Pixel[] {
  const out: Pixel[] = [];
  addRect(out,4,4,60,1,COLORS.excel);
  [7,10,13,16].forEach((row,index)=>{
    addRect(out,4,row,60,1,index%2?COLORS.soft:[.91,.94,.92] as RGB);
    addRect(out,34,row,5,1,COLORS.green);
    addRect(out,39,row,5,1,COLORS.green);
    addRect(out,44,row,5,1,index===0?COLORS.red:COLORS.yellow);
    addRect(out,49,row,6,1,index===0?COLORS.yellow:COLORS.green);
    addRect(out,55,row,9,1,COLORS.green);
  });
  addRect(out,4,22,12,3,COLORS.excel);
  addRect(out,18,22,12,3,COLORS.green);
  addRect(out,32,22,12,3,COLORS.green);
  addRect(out,46,22,18,3,COLORS.orange);
  return out;
}

function connectedPattern(): Pixel[] {
  const out: Pixel[] = [];
  addRect(out,5,5,56,1,COLORS.excel);
  [8,11,14,17,20].forEach((row,index)=>{
    addRect(out,5,row,56,1,index%2?COLORS.soft:[.91,.94,.92] as RGB);
    addRect(out,49,row,12,1,index===4?COLORS.yellow:COLORS.green);
  });
  addRibbon(out,15,23,28,26,COLORS.green,2);
  addRibbon(out,28,26,49,23,COLORS.acid,2);
  return out;
}

const patterns = [sourcePattern(), ftaTitlePattern(), faultTreePattern(), fmeaPattern(), fmedaPattern(), connectedPattern()];

function pairPatterns(from: Pixel[], to: Pixel[]): MorphPair[] {
  const pairs: MorphPair[] = [];
  const available = new Set(to.map((_, index) => index));
  const nearest = (point: Pixel, candidates: number[]) => {
    let best = candidates[0] ?? 0;
    let distance = Number.POSITIVE_INFINITY;
    for (const index of candidates) {
      const dx = point.x - to[index].x;
      const dy = point.y - to[index].y;
      const value = dx * dx + dy * dy;
      if (value < distance) { distance = value; best = index; }
    }
    return best;
  };

  for (const pixel of from) {
    const candidates = available.size ? [...available] : to.map((_, index) => index);
    const targetIndex = nearest(pixel, candidates);
    pairs.push({ from: pixel, to: to[targetIndex] ?? pixel, fromVisible: true, toVisible: available.size > 0 });
    available.delete(targetIndex);
  }

  for (const targetIndex of available) {
    const target = to[targetIndex];
    let source = from[0] ?? target;
    let distance = Number.POSITIVE_INFINITY;
    for (const candidate of from) {
      const dx = candidate.x - target.x;
      const dy = candidate.y - target.y;
      const value = dx * dx + dy * dy;
      if (value < distance) { distance = value; source = candidate; }
    }
    pairs.push({ from: source, to: target, fromVisible: false, toVisible: true });
  }
  return pairs.slice(0, MAX_PIXELS);
}

const transitions = patterns.map((pattern, index) => pairPatterns(pattern, patterns[(index + 1) % patterns.length]));

const labelScenes: CellLabel[][] = [
  [
    {text:"FMEA SOURCE DATA · REVISION 04",x:31,y:2,width:21,kind:"header"},{text:"ID",x:31,y:10,width:3,kind:"header"},{text:"Function",x:34,y:10,width:6,kind:"header"},{text:"Failure mode",x:40,y:10,width:7,kind:"header"},{text:"Local effect",x:47,y:10,width:7,kind:"header"},{text:"S",x:54,y:10,width:2,kind:"header"},{text:"O",x:56,y:10,width:2,kind:"header"},{text:"D",x:58,y:10,width:2,kind:"header"},{text:"RPN",x:60,y:10,width:4,kind:"header"},
    {text:"EPS-014",x:31,y:12,width:3},{text:"Provide assist",x:34,y:12,width:6},{text:"Loss of torque",x:40,y:12,width:7},{text:"Assist unavailable",x:47,y:12,width:7},{text:"9",x:54,y:12,width:2,kind:"critical"},{text:"3",x:56,y:12,width:2,kind:"warning"},{text:"2",x:58,y:12,width:2,kind:"good"},{text:"54",x:60,y:12,width:4,kind:"warning"},
    {text:"SEN-022",x:31,y:14,width:3},{text:"Sense angle",x:34,y:14,width:6},{text:"Signal stuck",x:40,y:14,width:7},{text:"Wrong command",x:47,y:14,width:7},{text:"10",x:54,y:14,width:2,kind:"critical"},{text:"2",x:56,y:14,width:2,kind:"good"},{text:"4",x:58,y:14,width:2,kind:"warning"},{text:"80",x:60,y:14,width:4,kind:"critical"},
    {text:"COM-008",x:31,y:16,width:3},{text:"Transmit state",x:34,y:16,width:6},{text:"Bus timeout",x:40,y:16,width:7},{text:"State unavailable",x:47,y:16,width:7},{text:"8",x:54,y:16,width:2,kind:"critical"},{text:"4",x:56,y:16,width:2,kind:"warning"},{text:"3",x:58,y:16,width:2,kind:"warning"},{text:"96",x:60,y:16,width:4,kind:"critical"},
    {text:"MCU-031",x:31,y:18,width:3},{text:"Control torque",x:34,y:18,width:6},{text:"Frozen execution",x:40,y:18,width:7},{text:"Command held",x:47,y:18,width:7},{text:"10",x:54,y:18,width:2,kind:"critical"},{text:"2",x:56,y:18,width:2,kind:"warning"},{text:"5",x:58,y:18,width:2,kind:"warning"},{text:"100",x:60,y:18,width:4,kind:"critical"},
    {text:"PWR-044",x:31,y:20,width:3},{text:"Supply ECU",x:34,y:20,width:6},{text:"Undervoltage",x:40,y:20,width:7},{text:"ECU reset",x:47,y:20,width:7},{text:"8",x:54,y:20,width:2,kind:"warning"},{text:"3",x:56,y:20,width:2,kind:"warning"},{text:"3",x:58,y:20,width:2,kind:"good"},{text:"72",x:60,y:20,width:4,kind:"warning"},
    {text:"=RPN = S × O × D",x:52,y:23,width:12,kind:"formula"},{text:"84 failure modes · 6 require action",x:31,y:25,width:21,kind:"good"}
  ],
  [
    {text:"TE-001 · LOSS OF BRAKING",x:27,y:3,width:13,kind:"critical"},{text:"P = 1.23E-7 / h",x:42,y:3,width:12,kind:"formula"},{text:"OR",x:31,y:8,width:5,kind:"warning"},
    {text:"IE-010 · INPUT PATH",x:23,y:13,width:9,kind:"node"},{text:"IE-020 · CONTROL",x:30,y:13,width:9,kind:"node"},{text:"IE-030 · OUTPUT",x:37,y:13,width:9,kind:"node"},
    {text:"BE-101 Sensor stuck",x:20,y:21,width:10,kind:"good"},{text:"BE-203 MCU latent",x:28,y:21,width:10,kind:"warning"},{text:"BE-307 Driver short",x:36,y:21,width:10,kind:"critical"}
  ],
  [
    {text:"TE-001 · LOSS OF BRAKING · 1.23E-7/h",x:27,y:3,width:16,kind:"critical"},{text:"OR",x:31,y:8,width:5,kind:"warning"},
    {text:"IE-010 INPUT · 3.2E-8",x:12,y:13,width:9,kind:"node"},{text:"IE-020 CONTROL · 7.1E-8",x:29,y:13,width:9,kind:"node"},{text:"IE-030 OUTPUT · 1.9E-8",x:46,y:13,width:9,kind:"node"},
    {text:"BE-101 Angle sensor",x:4,y:21,width:7,kind:"good"},{text:"BE-104 Supply loss",x:13,y:21,width:7,kind:"good"},{text:"BE-203 MCU latent",x:21,y:21,width:7,kind:"warning"},{text:"BE-211 CAN timeout",x:30,y:21,width:7,kind:"good"},{text:"BE-304 Driver open",x:39,y:21,width:7,kind:"warning"},{text:"BE-307 Driver short",x:48,y:21,width:7,kind:"critical"},{text:"BE-312 Motor jam",x:56,y:21,width:7,kind:"critical"},
    {text:"MCS-02 · {BE-203, BE-307} · ASIL D",x:23,y:26,width:19,kind:"formula"}
  ],
  [
    {text:"ID",x:4,y:4,width:5,kind:"header"},{text:"Function",x:9,y:4,width:7,kind:"header"},{text:"Failure mode",x:16,y:4,width:10,kind:"header"},{text:"Effect",x:26,y:4,width:9,kind:"header"},{text:"Cause",x:35,y:4,width:9,kind:"header"},{text:"S",x:44,y:4,width:3,kind:"header"},{text:"O",x:47,y:4,width:3,kind:"header"},{text:"D",x:50,y:4,width:3,kind:"header"},{text:"RPN",x:53,y:4,width:5,kind:"header"},{text:"Action",x:58,y:4,width:6,kind:"header"},
    {text:"FM-014",x:4,y:7,width:5},{text:"Steering assist",x:9,y:7,width:7},{text:"Loss of torque",x:16,y:7,width:10},{text:"Assist lost",x:26,y:7,width:9},{text:"Phase open",x:35,y:7,width:9},{text:"10",x:44,y:7,width:3,kind:"critical"},{text:"3",x:47,y:7,width:3,kind:"warning"},{text:"4",x:50,y:7,width:3,kind:"warning"},{text:"120",x:53,y:7,width:5,kind:"critical"},{text:"REDESIGN",x:58,y:7,width:6,kind:"critical"},
    {text:"FM-022",x:4,y:10,width:5},{text:"Angle sensing",x:9,y:10,width:7},{text:"Signal stuck",x:16,y:10,width:10},{text:"Wrong command",x:26,y:10,width:9},{text:"Short to VBAT",x:35,y:10,width:9},{text:"9",x:44,y:10,width:3,kind:"critical"},{text:"4",x:47,y:10,width:3,kind:"warning"},{text:"6",x:50,y:10,width:3,kind:"critical"},{text:"216",x:53,y:10,width:5,kind:"critical"},{text:"IMMEDIATE",x:58,y:10,width:6,kind:"critical"},
    {text:"FM-031",x:4,y:13,width:5},{text:"Power supply",x:9,y:13,width:7},{text:"Undervoltage",x:16,y:13,width:10},{text:"ECU reset",x:26,y:13,width:9},{text:"Load dump",x:35,y:13,width:9},{text:"8",x:44,y:13,width:3,kind:"warning"},{text:"3",x:47,y:13,width:3,kind:"good"},{text:"3",x:50,y:13,width:3,kind:"good"},{text:"72",x:53,y:13,width:5,kind:"warning"},{text:"MONITOR",x:58,y:13,width:6,kind:"warning"},
    {text:"FM-044",x:4,y:16,width:5},{text:"CAN comms",x:9,y:16,width:7},{text:"Bus timeout",x:16,y:16,width:10},{text:"Degraded mode",x:26,y:16,width:9},{text:"Harness open",x:35,y:16,width:9},{text:"7",x:44,y:16,width:3,kind:"warning"},{text:"4",x:47,y:16,width:3,kind:"warning"},{text:"2",x:50,y:16,width:3,kind:"good"},{text:"56",x:53,y:16,width:5,kind:"warning"},{text:"DETECT",x:58,y:16,width:6,kind:"good"},
    {text:"=RPN = Severity × Occurrence × Detection",x:4,y:21,width:19,kind:"formula"},{text:"84 MODES PRIORITIZED",x:24,y:21,width:17,kind:"good"},{text:"6 HIGH-RISK ACTIONS",x:42,y:21,width:22,kind:"warning"}
  ],
  [
    {text:"ID",x:4,y:4,width:5,kind:"header"},{text:"Component",x:9,y:4,width:9,kind:"header"},{text:"Failure mode",x:18,y:4,width:11,kind:"header"},{text:"λ FIT",x:29,y:4,width:5,kind:"header"},{text:"Safe",x:34,y:4,width:5,kind:"header"},{text:"DD",x:39,y:4,width:5,kind:"header"},{text:"DU",x:44,y:4,width:5,kind:"header"},{text:"DC",x:49,y:4,width:6,kind:"header"},{text:"SPFM",x:55,y:4,width:9,kind:"header"},
    {text:"DRV-01",x:4,y:7,width:5},{text:"Motor driver",x:9,y:7,width:9},{text:"Output stuck",x:18,y:7,width:11},{text:"32.6",x:29,y:7,width:5},{text:"4.2",x:34,y:7,width:5,kind:"good"},{text:"25.9",x:39,y:7,width:5,kind:"good"},{text:"2.5",x:44,y:7,width:5,kind:"critical"},{text:"91.2%",x:49,y:7,width:6,kind:"warning"},{text:"98.9%",x:55,y:7,width:9,kind:"good"},
    {text:"SEN-02",x:4,y:10,width:5},{text:"Angle sensor",x:9,y:10,width:9},{text:"Signal drift",x:18,y:10,width:11},{text:"18.2",x:29,y:10,width:5},{text:"2.1",x:34,y:10,width:5,kind:"good"},{text:"15.5",x:39,y:10,width:5,kind:"good"},{text:"0.6",x:44,y:10,width:5,kind:"warning"},{text:"96.3%",x:49,y:10,width:6,kind:"good"},{text:"99.1%",x:55,y:10,width:9,kind:"good"},
    {text:"MCU-03",x:4,y:13,width:5},{text:"Controller",x:9,y:13,width:9},{text:"Frozen execution",x:18,y:13,width:11},{text:"12.4",x:29,y:13,width:5},{text:"1.0",x:34,y:13,width:5,kind:"good"},{text:"10.9",x:39,y:13,width:5,kind:"good"},{text:"0.5",x:44,y:13,width:5,kind:"warning"},{text:"95.6%",x:49,y:13,width:6,kind:"good"},{text:"99.4%",x:55,y:13,width:9,kind:"good"},
    {text:"PWR-04",x:4,y:16,width:5},{text:"Supply monitor",x:9,y:16,width:9},{text:"Undervoltage",x:18,y:16,width:11},{text:"8.7",x:29,y:16,width:5},{text:"1.7",x:34,y:16,width:5,kind:"good"},{text:"6.7",x:39,y:16,width:5,kind:"good"},{text:"0.3",x:44,y:16,width:5,kind:"warning"},{text:"95.7%",x:49,y:16,width:6,kind:"good"},{text:"99.6%",x:55,y:16,width:9,kind:"good"},
    {text:"TOTAL λ · 71.9 FIT",x:4,y:22,width:12,kind:"header"},{text:"DC · 97.2%",x:18,y:22,width:12,kind:"metric"},{text:"SPFM · 99.1%",x:32,y:22,width:12,kind:"metric"},{text:"RESIDUAL · 3.9 FIT",x:46,y:22,width:18,kind:"warning"}
  ],
  [
    {text:"FTA EVENT",x:5,y:5,width:8,kind:"header"},{text:"FMEA MODE",x:13,y:5,width:12,kind:"header"},{text:"FMEDA ELEMENT",x:25,y:5,width:12,kind:"header"},{text:"EVIDENCE",x:37,y:5,width:12,kind:"header"},{text:"STATUS",x:49,y:5,width:12,kind:"header"},
    {text:"BE-101",x:5,y:8,width:8},{text:"FM-022 Signal stuck",x:13,y:8,width:12},{text:"SEN-02 Angle sensor",x:25,y:8,width:12},{text:"TST-SEN-118",x:37,y:8,width:12},{text:"VERIFIED",x:49,y:8,width:12,kind:"good"},
    {text:"BE-203",x:5,y:11,width:8},{text:"FM-051 MCU latent",x:13,y:11,width:12},{text:"MCU-03 Controller",x:25,y:11,width:12},{text:"FMEA-REV-04",x:37,y:11,width:12},{text:"VERIFIED",x:49,y:11,width:12,kind:"good"},
    {text:"BE-307",x:5,y:14,width:8},{text:"FM-014 Loss torque",x:13,y:14,width:12},{text:"DRV-01 Motor driver",x:25,y:14,width:12},{text:"FMEDA-2026-08",x:37,y:14,width:12},{text:"VERIFIED",x:49,y:14,width:12,kind:"good"},
    {text:"IE-030",x:5,y:17,width:8},{text:"FM-044 Bus timeout",x:13,y:17,width:12},{text:"COM-08 CAN PHY",x:25,y:17,width:12},{text:"TST-CAN-044",x:37,y:17,width:12},{text:"VERIFIED",x:49,y:17,width:12,kind:"good"},
    {text:"TE-001",x:5,y:20,width:8},{text:"84 modes",x:13,y:20,width:12},{text:"126 rates",x:25,y:20,width:12},{text:"342 artifacts",x:37,y:20,width:12},{text:"0 ORPHANS",x:49,y:20,width:12,kind:"warning"},
    {text:"=KERNL.TRACE(FTA → FMEA → FMEDA → Evidence)",x:20,y:25,width:29,kind:"formula"}
  ]
];

const connectorScenes: Connector[][] = [
  [],
  [
    {x1:33.5,y1:6,x2:33.5,y2:8},{x1:33.5,y1:10,x2:27.5,y2:13},{x1:33.5,y1:10,x2:34.5,y2:13},{x1:33.5,y1:10,x2:41.5,y2:13},
    {x1:27.5,y1:16,x2:25,y2:21},{x1:34.5,y1:16,x2:33,y2:21},{x1:41.5,y1:16,x2:41,y2:21}
  ],
  [
    {x1:33.5,y1:6,x2:33.5,y2:8},{x1:33.5,y1:10,x2:16.5,y2:13},{x1:33.5,y1:10,x2:33.5,y2:13},{x1:33.5,y1:10,x2:50.5,y2:13},
    {x1:16.5,y1:16,x2:7.5,y2:21},{x1:16.5,y1:16,x2:16.5,y2:21},{x1:33.5,y1:16,x2:24.5,y2:21},{x1:33.5,y1:16,x2:33.5,y2:21},{x1:33.5,y1:16,x2:42.5,y2:21},{x1:50.5,y1:16,x2:51.5,y2:21},{x1:50.5,y1:16,x2:59.5,y2:21}
  ],
  [],[],[]
];

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
const diagramLineLayer = document.querySelector<HTMLElement>("#diagram-line-layer");
const cellTextLayer = document.querySelector<HTMLElement>("#cell-text-layer");
const activeCell = document.querySelector<HTMLElement>("#active-cell");
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

const labelPool = Array.from({length: 64}, () => {
  const label = document.createElement("span"); label.className = "cell-text"; cellTextLayer?.append(label); return label;
});
const linePool = Array.from({length: 16}, () => {
  const line = document.createElement("i"); line.className = "logic-line"; diagramLineLayer?.append(line); return line;
});

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
void main(){
  vec2 cells=vec2(64.0,30.0); vec2 g=abs(fract(vUv*cells)-.5)/max(fwidth(vUv*cells),vec2(.001));
  float line=1.0-min(min(g.x,g.y),1.0); vec3 color=mix(vec3(.985,.987,.979),vec3(.82,.84,.82),line*.72);
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
void main(){
  float edge=max(abs(vLocal.x),abs(vLocal.y)); float mask=1.0-smoothstep(.89,1.0,edge);
  vec3 c=mix(vColor.rgb*1.05,vColor.rgb*.76,smoothstep(.72,.96,edge)); outColor=vec4(c,vColor.a*mask);
}`;

if (canvas && stage) {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, powerPreference: "high-performance" });
  if (!gl) stage.classList.add("no-webgl");
  else {
    try {
      const backgroundProgram = program(gl, bgVertex, bgFragment);
      const requestedScene=Number(new URLSearchParams(location.search).get("scene"));
      const initialScene=Number.isInteger(requestedScene)&&requestedScene>=0&&requestedScene<SCENE_COUNT?requestedScene:0;
      let width = 1, height = 1, anchor = performance.now(), offset = initialScene*SCENE_SECONDS+.25, currentScene = -1;

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

      const seek = (sceneIndex: number) => { offset=sceneIndex*SCENE_SECONDS+.2; anchor=performance.now(); currentScene=-1; if(reducedMotion) render(performance.now()); };
      chapterButtons.forEach((button)=>button.addEventListener("click",()=>seek(Number(button.dataset.scene||0))));
      replay?.addEventListener("click",()=>seek(0));

      const updateLabels = (sceneIndex: number, progress: number, local: number) => {
        const fromLabels=labelScenes[sceneIndex];
        const fadeProgress=Math.max(0,Math.min(1,(progress-.06)/.24));
        const labelOpacity=1-fadeProgress*fadeProgress*(3-2*fadeProgress);
        labelPool.forEach((element,index)=>{
          const cell=fromLabels[index];
          if(!cell){element.style.opacity="0";return;}
          const entryRaw=reducedMotion?1:Math.max(0,Math.min(1,(local-.012-cell.y*.0018)/.11)); const entry=entryRaw*entryRaw*(3-2*entryRaw);
          element.textContent=cell.text; element.className=`cell-text ${cell.kind??"text"}`;
          element.style.left=`${cell.x/COLS*100}%`; element.style.top=`${cell.y/ROWS*100}%`; element.style.width=`${cell.width/COLS*100}%`;
          element.style.opacity=String(labelOpacity*entry); element.style.transform=`scaleX(${.86+.14*entry})`;
        });
        const connectors=connectorScenes[sceneIndex]??[]; const layerWidth=diagramLineLayer?.clientWidth??0; const layerHeight=diagramLineLayer?.clientHeight??0;
        linePool.forEach((line,index)=>{
          const connector=connectors[index];
          if(!connector){line.style.opacity="0";return;}
          const x1=connector.x1/COLS*layerWidth,y1=connector.y1/ROWS*layerHeight,x2=connector.x2/COLS*layerWidth,y2=connector.y2/ROWS*layerHeight;
          const dx=x2-x1,dy=y2-y1; const lineEntryRaw=reducedMotion?1:Math.max(0,Math.min(1,(local-.04-index*.008)/.16)); const lineEntry=lineEntryRaw*lineEntryRaw*(3-2*lineEntryRaw);
          line.style.left=`${x1}px`;line.style.top=`${y1}px`;line.style.width=`${Math.hypot(dx,dy)}px`;line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;line.style.opacity=String(labelOpacity*lineEntry);
        });
        const selectionAnchors=[[34,12],[28,6],[29,12],[44,7],[49,7],[49,8]]; const anchorPoint=selectionAnchors[sceneIndex]; const scan=Math.floor(local*6); const cellX=Math.min(COLS-7,anchorPoint[0]+scan%3); const cellY=Math.min(ROWS-3,anchorPoint[1]+Math.floor(scan/3));
        const selectionWidth=sceneIndex===2?8:sceneIndex===4?10:5; const selectionHeight=sceneIndex===2||sceneIndex===4?2:1;
        if(activeCell){activeCell.style.transform=`translate(${cellX/COLS*(canvas?.clientWidth??0)}px,${cellY/ROWS*(canvas?.clientHeight??0)}px)`;activeCell.style.width=`calc((100% - 42px) / 64 * ${selectionWidth})`;activeCell.style.height=`calc((100% - 24px) / 30 * ${selectionHeight})`;}
        if(selectionLabel){selectionLabel.style.left=`${42+cellX/COLS*((canvas?.clientWidth??0))}px`;selectionLabel.style.top=`${24+cellY/ROWS*((canvas?.clientHeight??0))}px`;selectionLabel.style.width=`${selectionWidth/COLS*(canvas?.clientWidth??0)}px`;selectionLabel.style.height=`${selectionHeight/ROWS*(canvas?.clientHeight??0)}px`;}
      };

      const render = (now: number) => {
        resize(); const elapsed=reducedMotion?0:(now-anchor)/1000; const time=(offset+elapsed)%CYCLE_SECONDS;
        const sceneIndex=Math.floor(time/SCENE_SECONDS)%SCENE_COUNT; const local=(time%SCENE_SECONDS)/SCENE_SECONDS;
        const progress=Math.max(0,Math.min(1,(local-.16)/.72));
        setUI(sceneIndex);
        updateLabels(sceneIndex,progress,local);
        gl.viewport(0,0,width,height); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.useProgram(backgroundProgram);
        gl.drawArrays(gl.TRIANGLES,0,3);
        if(!reducedMotion) requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    } catch(error) { console.error("Spreadsheet animation unavailable",error); stage.classList.add("no-webgl"); }
  }
}
