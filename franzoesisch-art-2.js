/*
 * franzoesisch-art-2.js – Die Welt «Les fêtes» und die Geschichte «La galette
 * des rois» (Französischwagen, Etappe 2).
 *
 * Statt der amerikanischen Feiertage des Englischwagens feiert der
 * Französischwagen durchs Jahr: Noël im Schnee, die Galette des rois und der
 * Carnaval auf dem Dorfplatz, Pâques auf der Wiese und der 1er Août am Abend.
 * Gezeichnet wie die Welten des Englischwagens (englisch-art*.js): jedes Ding
 * um (0,0), der Boden ungefähr bei +50; die Welt mit HINTERGRUND und ORTE,
 * die Sticker mit STICKER, der Aufnäher mit AUFNAEHER_BILD.
 *
 * Wiederverwendet: der Christbaum, der Schneemann, das Osterei und das
 * Feuerwerk (englisch-art-4.js). Neu: santa, buche, etoile, galette, crown,
 * bunny, bell, mask, lampion.
 */
(() => {
"use strict";
const A = window.LernappEnglischArt;
if (!A) return;
const { tb, FARBE } = A.hilfen;
const { DUNKEL } = FARBE;
const f = (n) => Number(n.toFixed(1));
const at = (x, y, s, inhalt) => `<g transform="translate(${x} ${y}) scale(${s})">${inhalt}</g>`;
const ROT = "#d62839", ROT_D = "#a51d2c", HAUT = "#f6c9a8", GOLD = "#ffd23f", GOLD_D = "#e0a800";
const SCHNEE = "#f3f7fc", SCHNEE_D = "#dbe6f3";
const zacken = (x, y, r, farbe, rand, innen = 0.45) => `<polygon points="${Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * innen : r; return `${f(x + rr * Math.cos(a))},${f(y + rr * Math.sin(a))}`; }).join(" ")}" fill="${farbe}" stroke="${rand}" stroke-width="2.5" stroke-linejoin="round"/>`;
const augen = (dx, y, r = 2.6) => `<circle cx="${-dx}" cy="${y}" r="${r}" fill="${DUNKEL}"/><circle cx="${dx}" cy="${y}" r="${r}" fill="${DUNKEL}"/><circle cx="${f(-dx + r * 0.35)}" cy="${f(y - r * 0.4)}" r="${f(r * 0.35)}" fill="#ffffff"/><circle cx="${f(dx + r * 0.35)}" cy="${f(y - r * 0.4)}" r="${f(r * 0.35)}" fill="#ffffff"/>`;

// Die Galette des rois von oben: Blätterteig mit gebogenen Linien (um 0,2).
const galetteOben = (rx = 56, ry = 20, schnitte = false) => {
  let linien = "";
  for (let k = 0; k < 10; k += 1) {
    const a = (k / 10) * Math.PI * 2, b = a + 0.5;
    linien += `<path d="M0 2 Q${f(rx * 0.55 * Math.cos(b))} ${f(2 + ry * 0.55 * Math.sin(b))} ${f(rx * 0.86 * Math.cos(a))} ${f(2 + ry * 0.86 * Math.sin(a))}" stroke="#c98a2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  }
  const teile = schnitte ? [0, 1, 2, 3, 4, 5].map((k) => { const a = (k / 6) * Math.PI * 2 + 0.3; return `<path d="M0 2 L${f(rx * Math.cos(a))} ${f(2 + ry * Math.sin(a))}" stroke="#8a5a1c" stroke-width="2.6"/>`; }).join("") : "";
  return `<ellipse cx="0" cy="2" rx="${rx}" ry="${ry}" fill="#f2c063"/>${linien}<ellipse cx="-14" cy="-4" rx="${f(rx * 0.32)}" ry="${f(ry * 0.22)}" fill="#f8d78c" opacity="0.7"/>${teile}`;
};
// Die Fève: eine kleine Porzellanfigur (um 0,0, etwa 12 × 18)
const feve = (x, y, s = 1) => at(x, y, s, `<circle cx="0" cy="-6" r="4.2" fill="#ffffff" stroke="#c9d3e2" stroke-width="1.2"/><path d="M-5 8 Q-6 -2 0 -2 Q6 -2 5 8 Z" fill="#ffffff" stroke="#c9d3e2" stroke-width="1.2"/><path d="M-3.6 -9 L-2 -12.5 L0 -9.6 L2 -12.5 L3.6 -9 Z" fill="${GOLD}"/>`);
const krone = () => `<path d="M-42 20 L-46 -24 L-24 -2 L0 -34 L24 -2 L46 -24 L42 20 Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="-43" y="8" width="86" height="15" rx="3" fill="#f5b800"/>
  ${[[-24, "#e63946"], [0, "#3a7bd5"], [24, "#3fbf74"]].map(([x, c]) => `<circle cx="${x}" cy="15.5" r="5" fill="${c}"/><circle cx="${x - 1.5}" cy="14" r="1.6" fill="#ffffff" opacity="0.7"/>`).join("")}
  <circle cx="-46" cy="-26" r="5" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2"/><circle cx="0" cy="-36" r="5" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2"/><circle cx="46" cy="-26" r="5" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2"/>
  <path d="M-30 -4 L-34 12 M0 -16 V4" stroke="#fff3c0" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`;

Object.assign(A.DING, {
  santa: () => `<path d="M-22 26 V44 M20 26 V44" stroke="${ROT}" stroke-width="15"/>
    <path d="M-34 52 Q-34 42 -24 42 H-12 V52 Z M10 52 V42 H22 Q32 42 32 52 Z" fill="${DUNKEL}"/>
    <ellipse cx="-38" cy="-4" rx="10" ry="20" transform="rotate(22 -38 -4)" fill="${ROT}"/><ellipse cx="38" cy="-4" rx="10" ry="20" transform="rotate(-22 38 -4)" fill="${ROT}"/>
    <circle cx="-45" cy="12" r="8" fill="#3a3f4a"/><circle cx="45" cy="12" r="8" fill="#3a3f4a"/>
    <path d="M-36 32 Q-40 -10 -22 -26 H22 Q40 -10 36 32 Z" fill="${ROT}"/>
    <path d="M-4 -24 V30" stroke="#ffffff" stroke-width="7"/>
    <rect x="-37" y="26" width="74" height="10" rx="5" fill="#ffffff"/>
    <rect x="-35" y="2" width="70" height="9" fill="${DUNKEL}"/><rect x="-8" y="0" width="16" height="13" rx="2" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <circle cx="0" cy="-44" r="19" fill="${HAUT}"/>
    <path d="M-21 -46 Q-24 -6 0 -2 Q24 -6 21 -46 Q12 -32 0 -34 Q-12 -32 -21 -46 Z" fill="#ffffff" stroke="#e1e6ee" stroke-width="1.5"/>
    <path d="M-13 -36 Q-6 -31 0 -36 Q6 -31 13 -36 Q7 -41 0 -38 Q-7 -41 -13 -36 Z" fill="#ffffff" stroke="#dfe4ec" stroke-width="1.5"/>
    ${augen(7, -49, 2.6)}<circle cx="0" cy="-41" r="4" fill="#ef8f7a"/>
    <circle cx="-13" cy="-41" r="3.6" fill="#ef8f7a" opacity="0.5"/><circle cx="13" cy="-41" r="3.6" fill="#ef8f7a" opacity="0.5"/>
    <path d="M-20 -56 Q-8 -90 22 -76 L32 -62 L22 -58 Q16 -68 18 -56 Z" fill="${ROT}"/><circle cx="33" cy="-60" r="7" fill="#ffffff"/>
    <rect x="-23" y="-60" width="46" height="10" rx="5" fill="#ffffff"/>`,
  buche: () => `<ellipse cx="0" cy="36" rx="66" ry="10" fill="#ffffff" stroke="#d6dde8" stroke-width="2"/>
    <rect x="-52" y="-4" width="96" height="38" rx="18" fill="#7a4b2f"/>
    <path d="M-42 6 Q-12 1 18 7 M-38 20 Q0 15 32 21 M-20 -2 Q-8 2 6 -1" stroke="#5f3a22" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="44" cy="15" rx="12" ry="19" fill="#a0703f"/>
    <path d="M44 15 m-5 0 a5 5 0 1 1 5 5 a9 9 0 1 1 -9 -9" stroke="#f2dfbd" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-46 -3 Q-34 -9 -22 -3 Q-10 -9 2 -3 Q14 -9 26 -3 Q36 -8 42 -3" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="-18" cy="-10" rx="10" ry="4.6" transform="rotate(-22 -18 -10)" fill="#2f8a3f"/><ellipse cx="-3" cy="-11" rx="10" ry="4.6" transform="rotate(22 -3 -11)" fill="#2f8a3f"/>
    <circle cx="-11" cy="-13" r="4" fill="#e63946"/><circle cx="-6" cy="-17" r="3.4" fill="#e63946"/>
    <path d="M22 -4 V-12" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><ellipse cx="22" cy="-14" rx="9" ry="5.5" fill="#e63946"/><circle cx="19" cy="-15" r="1.6" fill="#ffffff"/><circle cx="25" cy="-13" r="1.6" fill="#ffffff"/>`,
  etoile: () => `${[0, 1, 2, 3].map((k) => { const a = (k * Math.PI) / 2 + 0.4; return `<path d="M${f(58 * Math.cos(a))} ${f(58 * Math.sin(a))} l0 -8 M${f(58 * Math.cos(a)) - 4} ${f(58 * Math.sin(a)) - 4} h8" stroke="#fff3c0" stroke-width="3" stroke-linecap="round"/>`; }).join("")}
    ${zacken(0, 0, 48, GOLD, "#f5b800", 0.5)}
    ${augen(10, -4, 3.6)}<path d="M-9 8 Q0 16 9 8" stroke="#a86e00" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="-18" cy="6" r="4.4" fill="#ff9f68" opacity="0.55"/><circle cx="18" cy="6" r="4.4" fill="#ff9f68" opacity="0.55"/>`,
  galette: () => `<ellipse cx="0" cy="32" rx="64" ry="11" fill="#ffffff" stroke="#d6dde8" stroke-width="2"/>
    <path d="M-56 4 Q-56 24 0 28 Q56 24 56 4 V2 H-56 Z" fill="#d99236"/>
    ${galetteOben()}`,
  crown: krone,
  bunny: () => `<ellipse cx="-13" cy="-62" rx="9" ry="26" transform="rotate(-12 -13 -62)" fill="#d9b48a"/><ellipse cx="13" cy="-62" rx="9" ry="26" transform="rotate(12 13 -62)" fill="#d9b48a"/>
    <ellipse cx="-13" cy="-60" rx="4.5" ry="18" transform="rotate(-12 -13 -60)" fill="#f3b8c4"/><ellipse cx="13" cy="-60" rx="4.5" ry="18" transform="rotate(12 13 -60)" fill="#f3b8c4"/>
    <circle cx="30" cy="34" r="10" fill="#ffffff"/>
    <ellipse cx="0" cy="18" rx="30" ry="32" fill="#d9b48a"/><ellipse cx="0" cy="24" rx="19" ry="23" fill="#f6e7d2"/>
    <ellipse cx="-16" cy="46" rx="14" ry="7" fill="#c99d70"/><ellipse cx="16" cy="46" rx="14" ry="7" fill="#c99d70"/>
    <ellipse cx="-22" cy="8" rx="7" ry="12" transform="rotate(20 -22 8)" fill="#c99d70"/><ellipse cx="22" cy="8" rx="7" ry="12" transform="rotate(-20 22 8)" fill="#c99d70"/>
    <circle cx="0" cy="-26" r="23" fill="#d9b48a"/><ellipse cx="0" cy="-18" rx="13" ry="9" fill="#f6e7d2"/>
    ${augen(9, -30, 3.2)}<ellipse cx="0" cy="-21" rx="3.6" ry="2.8" fill="#ef7a92"/>
    <path d="M-5 -15 Q0 -12 5 -15" stroke="#8a5a35" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="-3" y="-15" width="6" height="5" rx="1" fill="#ffffff"/>
    <path d="M-8 -20 L-24 -24 M-8 -18 L-24 -16 M8 -20 L24 -24 M8 -18 L24 -16" stroke="#8a5a35" stroke-width="1.2" opacity="0.6"/>
    <circle cx="-15" cy="-20" r="4" fill="#ef8f7a" opacity="0.45"/><circle cx="15" cy="-20" r="4" fill="#ef8f7a" opacity="0.45"/>`,
  bell: () => `${[1, -1].map((s) => `<g transform="scale(${s} 1)"><path d="M24 -14 Q58 -40 66 -8 Q52 -12 48 0 Q40 -8 34 2 Q30 -6 24 -2 Z" fill="#ffffff" stroke="#d6dde8" stroke-width="2" stroke-linejoin="round"/><path d="M34 -12 Q46 -22 56 -16" stroke="#e3e9f2" stroke-width="2" fill="none"/></g>`).join("")}
    <path d="M-26 22 Q-28 -30 0 -34 Q28 -30 26 22 Q34 26 34 30 H-34 Q-34 26 -26 22 Z" fill="#f5c242" stroke="#d99a1a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M-15 -18 Q-18 0 -15 16" stroke="#fff3c0" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M-26 14 H26" stroke="#e63946" stroke-width="5"/><circle cx="0" cy="34" r="6" fill="#d99a1a"/>
    <path d="M0 -34 L-15 -45 V-29 Z M0 -34 L15 -45 V-29 Z" fill="#e63946"/><circle cx="0" cy="-34" r="4.5" fill="#c8232f"/>`,
  mask: () => `<ellipse cx="30" cy="-34" rx="6" ry="20" transform="rotate(28 30 -34)" fill="#8e5cd9"/><ellipse cx="40" cy="-26" rx="5.5" ry="18" transform="rotate(48 40 -26)" fill="#3fbf74"/><ellipse cx="20" cy="-38" rx="5" ry="17" transform="rotate(10 20 -38)" fill="#ef6fa8"/>
    <path d="M38 10 L52 52" stroke="#8a5a35" stroke-width="5" stroke-linecap="round"/>
    <path d="M-48 -6 Q-50 -28 -24 -26 Q-8 -24 0 -15 Q8 -24 24 -26 Q50 -28 48 -6 Q46 18 22 18 Q8 18 0 5 Q-8 18 -22 18 Q-46 18 -48 -6 Z" fill="#3a7bd5" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="-21" cy="-4" rx="11" ry="7.5" fill="${DUNKEL}"/><ellipse cx="21" cy="-4" rx="11" ry="7.5" fill="${DUNKEL}"/>
    ${[[-36, -14], [36, -14], [-34, 8], [34, 8], [0, -6]].map(([x, y]) => `<path d="M${x} ${y - 4} L${x + 3} ${y} L${x} ${y + 4} L${x - 3} ${y} Z" fill="${GOLD}"/>`).join("")}
    <path d="M-40 -18 Q-30 -24 -18 -20" stroke="#8fb8f0" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  lampion: () => `<path d="M0 -60 V-40" stroke="#3a3f4a" stroke-width="2.5"/>
    <rect x="-14" y="-43" width="28" height="7" rx="2" fill="#3a3f4a"/>
    <ellipse cx="0" cy="0" rx="34" ry="38" fill="#e63946"/><ellipse cx="0" cy="2" rx="22" ry="27" fill="#ff8a8f" opacity="0.45"/>
    <path d="M-34 0 Q0 -10 34 0 M-31 -18 Q0 -27 31 -18 M-31 18 Q0 10 31 18" stroke="#c8232f" stroke-width="2.2" fill="none"/>
    <rect x="-5.5" y="-16" width="11" height="32" fill="#ffffff"/><rect x="-16" y="-5.5" width="32" height="11" fill="#ffffff"/>
    <rect x="-12" y="35" width="24" height="7" rx="2" fill="#3a3f4a"/><path d="M0 42 V56 M-4 54 L0 58 L4 54" stroke="${GOLD}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
});

// ===========================================================================
// Die Welt «Les fêtes» (1000 × 560): links Noël im Schnee, in der Mitte der
// Dorfplatz (Galette, Carnaval), rechts Pâques auf der Wiese und der 1er Août
// am Abend.
// ===========================================================================
const tannchen = (x, y, s) => at(x, y, s, `<rect x="-5" y="-6" width="10" height="12" fill="#6d4628"/><path d="M0 -70 L-26 -30 H-14 L-32 0 H32 L14 -30 H26 Z" fill="#2e6f52"/><path d="M0 -70 L-12 -52 Q0 -48 12 -52 Z M-20 -32 Q0 -26 20 -32 L15 -38 Q0 -34 -15 -38 Z M-28 -4 Q0 4 28 -4 L22 -10 Q0 -4 -22 -10 Z" fill="#ffffff"/>`);
const blume = (x, y, c) => `<path d="M${x} ${y} V${y - 14}" stroke="#3fa34d" stroke-width="2.5"/>${[0, 72, 144, 216, 288].map((w) => { const a = (w * Math.PI) / 180; return `<circle cx="${f(x + 5 * Math.cos(a))}" cy="${f(y - 16 + 5 * Math.sin(a))}" r="3.4" fill="${c}"/>`; }).join("")}<circle cx="${x}" cy="${y - 16}" r="2.6" fill="#ffd166"/>`;
A.HINTERGRUND.fetes = () => {
  let s = `<defs><linearGradient id="fr-fetes-himmel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d7ecf7"/><stop offset="0.42" stop-color="#b8e2f5"/><stop offset="0.66" stop-color="#9fd8f0"/><stop offset="0.8" stop-color="#7d82c2"/><stop offset="1" stop-color="#4c56a0"/></linearGradient></defs>
    <rect width="1000" height="400" fill="url(#fr-fetes-himmel)"/>`;
  // Die Alpen hinten, mit Schnee
  s += `<path d="M0 318 L70 236 L120 270 L190 196 L260 262 L330 214 L400 280 L470 228 L540 286 L620 240 L700 292 L780 248 L860 300 L940 262 L1000 290 V380 H0 Z" fill="#9bb3cf"/>
    <path d="M70 236 L56 252 L84 254 Z M190 196 L172 218 L206 220 Z M330 214 L316 232 L346 232 Z M470 228 L456 246 L486 246 Z M620 240 L606 256 L636 256 Z M780 248 L768 262 L794 262 Z M940 262 L930 274 L952 274 Z" fill="#ffffff"/>`;
  // Abendsterne über dem 1er Août
  s += [[930, 40], [968, 76], [820, 30], [990, 160], [906, 196], [776, 70]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 1.8 : 2.6}" fill="#fff6d0"/>`).join("");
  // Der Boden: Schnee – Dorfplatz – Wiese – Abendwiese
  s += `<path d="M0 352 Q160 340 340 350 V560 H0 Z" fill="${SCHNEE}"/>
    <path d="M40 420 Q120 408 210 420 Q120 430 40 420 Z M20 520 Q140 504 280 518 Q140 530 20 520 Z" fill="${SCHNEE_D}"/>
    <path d="M330 350 Q490 342 650 352 V560 H330 Z" fill="#e7d3b0"/>
    ${Array.from({ length: 28 }, (_, i) => `<ellipse cx="${350 + (i % 7) * 44 + (Math.floor(i / 7) % 2) * 20}" cy="${382 + Math.floor(i / 7) * 46}" rx="17" ry="8" fill="#d9c09a"/>`).join("")}
    <path d="M640 352 Q820 340 1000 350 V560 H640 Z" fill="#8fc75c"/>
    <path d="M840 350 Q920 346 1000 350 V560 H840 Z" fill="#6fa64a"/>`;
  s += tannchen(26, 360, 0.7) + tannchen(300, 352, 0.6);
  // Links: ein Chalet mit Schnee auf dem Dach
  s += `<rect x="150" y="262" width="118" height="92" fill="#b07a45"/>${[280, 300, 320, 340].map((y) => `<path d="M150 ${y} H268" stroke="#96653a" stroke-width="3"/>`).join("")}
    <path d="M136 268 L209 214 L282 268 Z" fill="#8f2d29" stroke="#8f2d29" stroke-width="6" stroke-linejoin="round"/>
    <path d="M132 270 L209 210 L286 270 Q276 278 266 272 Q254 280 242 274 Q230 282 218 275 Q206 282 194 274 Q182 280 170 273 Q158 280 146 273 Q138 277 132 270 Z" fill="#ffffff"/>
    <rect x="168" y="292" width="30" height="26" rx="3" fill="#ffd166"/><rect x="222" y="292" width="30" height="26" rx="3" fill="#ffd166"/><path d="M183 292 V318 M168 305 H198 M237 292 V318 M222 305 H252" stroke="#96653a" stroke-width="2.5"/>`;
  // Mitte: der Dorfplatz mit der Girlande des Carnaval und dem Tisch
  s += `<path d="M352 210 V350 M628 210 V350" stroke="#8a5a35" stroke-width="7" stroke-linecap="round"/>
    <path d="M352 214 Q490 300 628 214" stroke="#5d6882" stroke-width="2.5" fill="none"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => { const t = (k + 0.5) / 9, x = 352 + 276 * t, y = 214 + 4 * 86 * t * (1 - t) * 0.99; return k === 4 ? "" : `<path d="M${f(x - 9)} ${f(y)} L${f(x + 9)} ${f(y)} L${f(x)} ${f(y + 18)} Z" fill="${["#e63946", "#ffd23f", "#3a7bd5", "#3fbf74", "", "#8e5cd9", "#ef6fa8", "#f5a623", "#00a5b5"][k]}"/>`; }).join("")}
    ${[[380, 300, "#e63946"], [420, 330, "#3a7bd5"], [560, 320, "#ffd23f"], [600, 296, "#3fbf74"], [450, 280, "#ef6fa8"], [520, 296, "#8e5cd9"]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="7" height="7" rx="1.5" transform="rotate(25 ${x} ${y})" fill="${c}"/>`).join("")}
    <rect x="348" y="500" width="304" height="26" fill="#ffffff"/>${Array.from({ length: 19 }, (_, k) => `<rect x="${348 + k * 16}" y="${k % 2 ? 500 : 513}" width="16" height="13" fill="${ROT}" opacity="0.85"/>`).join("")}
    <rect x="344" y="496" width="312" height="8" rx="4" fill="#a0612f"/><rect x="362" y="526" width="9" height="34" fill="#8a5a35"/><rect x="630" y="526" width="9" height="34" fill="#8a5a35"/>`;
  // Rechts: die Wiese mit Blumen, die Leine mit dem Lampion, Schweizer Fähnchen
  s += [[660, 400, "#ef6fa8"], [690, 520, "#ffd23f"], [760, 410, "#ffffff"], [740, 540, "#ef6fa8"], [830, 460, "#ffd23f"], [650, 470, "#8e5cd9"], [780, 520, "#ffffff"], [700, 476, "#3a7bd5"]].map(([x, y, c]) => blume(x, y, c)).join("");
  s += `<path d="M812 214 V350 M992 206 V350" stroke="#6d4628" stroke-width="6" stroke-linecap="round"/><path d="M812 220 Q902 262 992 212" stroke="#3a3f4a" stroke-width="2" fill="none"/>
    ${[[836, 230], [860, 238], [936, 236], [962, 226]].map(([x, y]) => `<rect x="${x - 8}" y="${y}" width="16" height="13" fill="${ROT}"/><rect x="${x - 1.6}" y="${y + 2.5}" width="3.2" height="8" fill="#ffffff"/><rect x="${x - 4}" y="${y + 4.9}" width="8" height="3.2" fill="#ffffff"/>`).join("")}`;
  return s;
};

A.ORTE.fetes = {
  etoile: [170, 98, 0.78, [40, -40]],
  fireworks: [882, 112, 0.95, [40, -48]],
  bell: [668, 120, 0.85, [42, -34]],
  mask: [490, 252, 0.82, [44, -26]],
  lampion: [900, 296, 0.72, [30, -40]],
  christmastree: [86, 402, 1.0, [46, -34]],
  santa: [214, 418, 0.78, [36, -62]],
  snowman: [306, 448, 0.82, [30, -70]],
  buche: [410, 466, 0.82, [52, -18]],
  galette: [512, 470, 0.82, [50, -14]],
  crown: [604, 478, 0.72, [40, -28]],
  bunny: [712, 434, 0.92, [30, -70]],
  easteregg: [806, 496, 0.78, [28, -40]],
};

Object.assign(A.STICKER, {
  santa: [0.4, 14], buche: [0.46, -12], etoile: [0.56, 0], galette: [0.46, -12], crown: [0.6, 4],
  bunny: [0.42, 12], bell: [0.5, 4], mask: [0.52, 6], lampion: [0.46, 0],
});
A.AUFNAEHER_BILD.fetes = "lampion";
A.AUFNAEHER_FARBE.fetes = "#d62839";

// ===========================================================================
// Die Geschichte «La galette des rois» (vier Bilder, je 472 × 204): Margot
// teilt die Galette mit Mia und dem Hund, findet die Fève und wird Königin.
// ===========================================================================
const stube = () => `<rect width="472" height="204" fill="#f6e3c4"/><rect y="170" width="472" height="34" fill="#c08a55"/>
  ${[60, 160, 260, 360].map((x) => `<rect x="${x}" y="0" width="2" height="170" fill="#ecd3ad"/>`).join("")}
  <rect x="380" y="26" width="60" height="50" rx="4" fill="#8a5a35"/><rect x="386" y="32" width="48" height="38" fill="#cfeefa"/>${zacken(410, 50, 10, GOLD, GOLD_D)}`;
const tisch = (x1, x2, y) => `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="16" fill="#ffffff"/>${Array.from({ length: Math.floor((x2 - x1) / 12) }, (_, k) => `<rect x="${x1 + k * 12}" y="${k % 2 ? y : y + 8}" width="12" height="8" fill="${ROT}" opacity="0.85"/>`).join("")}
  <rect x="${x1 - 4}" y="${y - 4}" width="${x2 - x1 + 8}" height="6" rx="3" fill="#a0612f"/><rect x="${x1 + 8}" y="${y + 16}" width="7" height="${186 - y}" fill="#8a5a35"/><rect x="${x2 - 15}" y="${y + 16}" width="7" height="${186 - y}" fill="#8a5a35"/>`;
const menschOder = (id, x, y, s) => (A.DING[id] ? at(x, y, s, A.DING[id]()) : "");
const glanz = (x, y, r) => `<path d="M${x - r} ${y} L${x + r} ${y} M${x} ${y - r} L${x} ${y + r}" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/><path d="M${f(x - r * 0.6)} ${f(y - r * 0.6)} L${f(x + r * 0.6)} ${f(y + r * 0.6)} M${f(x + r * 0.6)} ${f(y - r * 0.6)} L${f(x - r * 0.6)} ${f(y + r * 0.6)}" stroke="#ffd23f" stroke-width="2" stroke-linecap="round"/>`;
// Margot mit der Krone statt des Bérets (der Kopf wie in roccoKopf); die Krone
// lässt sich antippen.
const kroneTb = (pose, laune) => `${A.rocco(pose, laune).replace(A.roccoKopf(laune), A.roccoKopf(laune, { muetze: false }))}${tb('data-wort="crown"', `<g transform="translate(0 -122) scale(0.52)">${krone()}</g>`)}`;
// Ein Stück Galette, in Margots Pfoten (Füsse bei 0,0)
const stueck = (x, y, s = 1) => at(x, y, s, `<path d="M-18 6 L0 -16 L18 6 Q0 12 -18 6 Z" fill="#f2c063" stroke="#d99236" stroke-width="2.5" stroke-linejoin="round"/><path d="M-6 -2 Q0 -6 6 -2" stroke="#c98a2a" stroke-width="2" fill="none"/>`);

A.GESCHICHTEN_BILDER.galette = [
  () => `${stube()}${tisch(230, 430, 138)}
    ${tb('data-wort="galette"', at(330, 126, 0.86, `<ellipse cx="0" cy="22" rx="64" ry="11" fill="#ffffff" stroke="#d6dde8" stroke-width="2"/><path d="M-56 4 Q-56 22 0 24 Q56 22 56 4 V2 H-56 Z" fill="#d99236"/>${galetteOben()}`))}
    ${at(404, 116, 0.32, krone())}
    ${tb('data-wort="raccoon"', at(130, 196, 0.95, A.rocco("wink", "freude")))}`,
  () => `${stube()}${tisch(150, 300, 138)}
    ${tb('data-wort="galette"', at(225, 126, 0.8, `<ellipse cx="0" cy="22" rx="64" ry="11" fill="#ffffff" stroke="#d6dde8" stroke-width="2"/><path d="M-56 4 Q-56 22 0 24 Q56 22 56 4 V2 H-56 Z" fill="#d99236"/>${galetteOben(56, 20, true)}`))}
    ${at(78, 196, 0.9, A.rocco("steh", "froh") + stueck(0, -48, 1.05))}
    ${menschOder("girl", 424, 156, 0.95)}${stueck(400, 112, 0.9)}
    ${menschOder("dog", 344, 166, 0.66)}${stueck(318, 150, 0.6)}`,
  () => `${stube()}${tisch(250, 440, 138)}
    ${at(345, 126, 0.8, `<ellipse cx="0" cy="22" rx="64" ry="11" fill="#ffffff" stroke="#d6dde8" stroke-width="2"/><path d="M-36 2 L0 2 L-18 -18 Z" fill="#d6dde8"/>${galetteOben(56, 20, true)}`)}
    ${tb('data-wort="raccoon"', at(150, 196, 0.95, A.rocco("wirf", "hoch")))}
    ${stueck(182, 100, 1.0)}${feve(182, 90, 1.3)}${glanz(182, 86, 14)}
    <g transform="translate(240 50)"><circle r="20" fill="#ffffff" stroke="#c3c7cf" stroke-width="2"/><text y="9" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="26" fill="#3a7bd5">?</text></g>`,
  () => `${stube()}
    ${tb('data-wort="raccoon"', at(236, 196, 0.95, kroneTb("jubel", "freude")))}
    ${menschOder("girl", 380, 160, 0.92)}${menschOder("dog", 100, 170, 0.72)}
    ${glanz(178, 52, 12)}${glanz(296, 44, 10)}
    <path d="M150 34 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/><path d="M330 70 c-5 -8 -16 -2 -8 6 l8 7 l8 -7 c8 -8 -3 -14 -8 -6z" fill="#ef6fa8"/>`,
];
A.TITELBILD.galette = 3;
})();
