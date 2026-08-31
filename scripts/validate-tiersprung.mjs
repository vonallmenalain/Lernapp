// Prüft die Spielbarkeit der zehn Tier-Sprung-Level.
//
//   node scripts/validate-tiersprung.mjs
//
// Konstanten, Hindernis- und Leveltabelle werden aus tiersprung.js gelesen und
// die Levelerzeugung identisch nachgerechnet. Gemeldet wird, wenn ein Hindernis
// zu hoch oder ein Block zu breit für einen Sprung wäre, wenn zwischen zwei
// Sprüngen zu wenig Bodenzeit bleibt oder wenn Leckerbissen in einem Hindernis
// stecken. Nach jeder Änderung an LEVELS, OBSTACLES, GRAVITY oder JUMP_SPEED
// laufen lassen.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = fs.readFileSync(path.join(root, "tiersprung.js"), "utf8");
const block = (a, b) => { const i = src.indexOf(a); return src.slice(i, src.indexOf(b, i) + b.length); };
const num = (n) => Number(new RegExp(`const ${n} = ([\\d.]+)`).exec(src)[1]);
const GRAVITY = num("GRAVITY"), JUMP_SPEED = num("JUMP_SPEED");
const RUN_IN = num("RUN_IN"), RUN_OUT = num("RUN_OUT");
const JUMP_APEX = (JUMP_SPEED ** 2) / (2 * GRAVITY);
const AIR_TIME = (2 * JUMP_SPEED) / GRAVITY;
const OBSTACLES = eval("(" + block("{\n    bush:", "  };").slice(0, -1) + ")");
const LEVELS = eval(block("const LEVELS = [", "].map").replace("const LEVELS = ", "").replace("].map", "]"))
  .map((l, i) => ({ ...l, id: i + 1 }));
const PLAYER_W = 64;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const mix = (a, b, t) => a + (b - a) * t;
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const speedAt = (l, x) => mix(l.speed, l.speedEnd, clamp(x / l.length, 0, 1));

function build(level) {
  const random = mulberry32(level.id * 7919 + 13);
  const between = (lo, hi) => lo + random() * (hi - lo);
  const list = eval("[" + new RegExp(`${level.scene}: \\{[\\s\\S]*?obstacles: \\[([^\\]]+)\\]`).exec(src)[1] + "]");
  const pick = () => list[Math.floor(random() * list.length) % list.length];
  const obstacles = [], treats = [], blocks = [];
  const make = (hs) => { const t = pick(), s = OBSTACLES[t]; const h = between(level.height[0], level.height[1]) * s.scale * (hs || 1); return { type: t, h, w: h * s.ratio }; };
  const place = (sh, left) => { const o = { x: left + sh.w / 2, w: sh.w, h: sh.h, type: sh.type }; obstacles.push(o); return o; };
  function addArc(cx, peak, bw, bh, sp) {
    const lift = Math.max(peak, bh + 42), reach = AIR_TIME * sp * 0.36;
    const spread = Math.min(reach, Math.max(58, bw * 0.5 + 26));
    treats.push({ x: cx, y: lift });
    if (spread > bw * 0.5 + 18) { treats.push({ x: cx - spread, y: lift - 26 }); treats.push({ x: cx + spread, y: lift - 26 }); }
  }
  let cursor = RUN_IN, sinceTreatLine = 0;
  const finish = level.length - RUN_OUT;
  while (cursor < finish) {
    const speed = speedAt(level, cursor), airSpan = AIR_TIME * speed;
    const wantsDouble = random() < level.doubles && cursor < finish - 400;
    const blockStart = cursor;
    const first = place(make(wantsDouble ? 0.66 : 1), cursor);
    let blockEnd = first.x + first.w / 2, blockHeight = first.h;
    if (wantsDouble) {
      const shape = make(0.66), inner = between(26, 50);
      if (((blockEnd + inner + shape.w) - blockStart) * 0.78 + 64 <= airSpan * 0.8) {
        const second = place(shape, blockEnd + inner);
        blockEnd = second.x + second.w / 2; blockHeight = Math.max(blockHeight, second.h);
      }
    }
    blocks.push({ start: blockStart, end: blockEnd, h: blockHeight, speed });
    if (random() < 0.62) addArc((blockStart + blockEnd) / 2, JUMP_APEX * between(0.62, 0.85), blockEnd - blockStart, blockHeight, speed);
    const gapSeconds = between(level.gap[0], level.gap[1]) * (blockEnd > first.x + first.w / 2 ? 1.15 : 1);
    const gapDistance = Math.max(airSpan * 1.25, gapSeconds * speed);
    sinceTreatLine += 1;
    const from = blockEnd + 46, to = blockEnd + gapDistance - 120, span = to - from;
    if (sinceTreatLine >= 2 && span > 60 && random() < 0.72) {
      sinceTreatLine = 0;
      const count = clamp(Math.floor(span / 54) + 1, 2, 5);
      const startX = from + (span - (count - 1) * 54) / 2;
      for (let i = 0; i < count; i++) treats.push({ x: startX + i * 54, y: 26 });
    }
    cursor = blockEnd + gapDistance;
  }
  for (let i = 0; i < 4; i++) treats.push({ x: 300 + i * 56, y: 26 });
  return { obstacles, treats, blocks };
}

console.log(`Sprunghöhe ${JUMP_APEX.toFixed(0)} | Flugzeit ${AIR_TIME.toFixed(2)}s | Spielerbreite ${PLAYER_W}\n`);
console.log("Lvl  Blöcke  Hind.  Leck.  höchstes  Höhen-  breitester  Sprung-   Boden-   drin  Dauer");
console.log("                                     reserve  Block       reserve   zeit");
let problems = 0;
for (const level of LEVELS) {
  const { obstacles, treats, blocks } = build(level);
  const maxH = Math.max(...obstacles.map((o) => o.h * 0.86));
  const heightReserve = JUMP_APEX - maxH;
  let widest = 0, jumpReserve = Infinity, groundTime = Infinity;
  for (const b of blocks) {
    const need = (b.end - b.start) * 0.78 + PLAYER_W;
    widest = Math.max(widest, b.end - b.start);
    jumpReserve = Math.min(jumpReserve, AIR_TIME * b.speed - need);
  }
  for (let i = 1; i < blocks.length; i++) {
    groundTime = Math.min(groundTime, (blocks[i].start - blocks[i - 1].end) / blocks[i].speed - AIR_TIME);
  }
  let inside = 0;
  for (const t of treats) for (const o of obstacles) {
    if (Math.abs(t.x - o.x) < o.w * 0.5 && t.y < o.h) { inside++; break; }
  }
  const duration = level.length / ((level.speed + level.speedEnd) / 2);
  const flags = [];
  if (heightReserve < 30) flags.push("ZU HOCH");
  if (jumpReserve < 30) flags.push("ZU BREIT");
  if (groundTime < 0.18) flags.push("LÜCKE ZU ENG");
  if (inside > 0) flags.push("LECKERBISSEN IM HINDERNIS");
  if (treats.length < 20) flags.push("ZU WENIG LECKERBISSEN");
  if (flags.length) problems++;
  console.log(
    `${String(level.id).padStart(3)}  ${String(blocks.length).padStart(6)}  ${String(obstacles.length).padStart(5)}` +
    `  ${String(treats.length).padStart(5)}  ${maxH.toFixed(0).padStart(8)}  ${heightReserve.toFixed(0).padStart(7)}` +
    `  ${widest.toFixed(0).padStart(10)}  ${jumpReserve.toFixed(0).padStart(7)}  ${groundTime.toFixed(2).padStart(7)}s` +
    `  ${String(inside).padStart(4)}  ${duration.toFixed(0).padStart(3)}s  ${flags.join(" ")}`);
}
console.log(problems ? `\n${problems} Level mit Auffälligkeiten` : "\nAlle 10 Level sind fair spielbar");
process.exit(problems ? 1 : 0);
