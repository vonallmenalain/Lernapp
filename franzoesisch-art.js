/*
 * franzoesisch-art.js – Was der Französischwagen eigens zeichnet.
 *
 *   margotKopf(laune), margot(pose, laune)   Margot, la marmotte, mit ihrem
 *                                            roten Béret
 *   zimmer(stand)        der Panorama-Bistrowagen von innen (1000 × 560), mit
 *                        denselben Wegen wie der Caboose (<g data-ort>) und
 *                        15 Stücken Einrichtung (<g data-ausbau>)
 *
 * Alles andere – die Wimmelbilder, Sticker, Aufnäher, Geschichten und Spiele –
 * zeichnet englisch-art*.js; LernappFranzoesischArt erbt es von dort. Margot
 * hat dieselben Masse wie Rocco (Füsse bei 0,0, der Kopf bei 0,-94, rx 31,
 * ry 26): Kleider, Hüte und Posen der Zeichnungen passen ihr genauso. Ist der
 * Französischwagen offen, zeichnen rocco() und roccoKopf() sie (englisch-art.js,
 * aktiv.maskottchen).
 */
(() => {
"use strict";
const E = window.LernappEnglischArt;
if (!E) return;

const FELL = "#b98552", FELL_D = "#8e5f35", FELL_H = "#dcae7a", BAUCH = "#f2dfbd", OHR = "#e8b48c";
const NASE = "#4a2f22", DUNKEL = "#2b2f38", ROT = "#d62839", ROT_D = "#a51d2c";
const stern = (x, y, r, k) => E.stern(x, y, r, k);

// ---------------------------------------------------------------------------
// Margot, la marmotte
// ---------------------------------------------------------------------------
//   laune  froh | freude | hoch (schaut nach oben) | traurig
function margotKopf(laune = "froh", { muetze = true } = {}) {
  const hoch = laune === "hoch";
  const augen = laune === "freude"
    ? `<path d="M-17 -4 q5 -6 10 0 M7 -4 q5 -6 10 0" stroke="${DUNKEL}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<circle cx="-12" cy="-4" r="4.6" fill="${DUNKEL}"/><circle cx="12" cy="-4" r="4.6" fill="${DUNKEL}"/>
       <circle cx="${hoch ? -11 : -13.5}" cy="${hoch ? -7.5 : -5.8}" r="1.6" fill="#ffffff"/><circle cx="${hoch ? 13 : 10.5}" cy="${hoch ? -7.5 : -5.8}" r="1.6" fill="#ffffff"/>`;
  const brauen = laune === "traurig" ? `<path d="M-18 -13 L-8 -10 M18 -13 L8 -10" stroke="${NASE}" stroke-width="2.4" stroke-linecap="round"/>` : "";
  const mund = laune === "traurig"
    ? `<path d="M-7 22 Q0 18 7 22" stroke="${NASE}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
    : `<path d="M-8 13 Q-4 17 0 13 Q4 17 8 13" stroke="${NASE}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const beret = muetze ? `<path d="M-24 -18 Q-26 -36 0 -38 Q27 -38 27 -21 Q2 -12 -24 -18 Z" fill="${ROT}"/>
      <path d="M-25 -18 Q2 -11 28 -21" stroke="${ROT_D}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M3 -38 q1 -6 5 -7" stroke="${ROT_D}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M-14 -31 Q-6 -35 4 -34" stroke="#ef6a74" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : "";
  return `<g>
    <circle cx="-23" cy="-17" r="8.5" fill="${FELL_D}"/><circle cx="23" cy="-17" r="8.5" fill="${FELL_D}"/>
    <circle cx="-23" cy="-17" r="4.6" fill="${OHR}"/><circle cx="23" cy="-17" r="4.6" fill="${OHR}"/>
    <ellipse cx="0" cy="0" rx="31" ry="26" fill="${FELL}"/>
    <ellipse cx="0" cy="7" rx="22" ry="17" fill="${FELL_H}"/>
    ${augen}${brauen}
    <ellipse cx="-6.5" cy="9" rx="7.5" ry="5.8" fill="${BAUCH}"/><ellipse cx="6.5" cy="9" rx="7.5" ry="5.8" fill="${BAUCH}"/>
    <path d="M-5 4 Q0 1 5 4 Q4 8 0 9 Q-4 8 -5 4 Z" fill="${NASE}"/>
    <rect x="-4" y="14" width="8" height="7" rx="1.6" fill="#ffffff" stroke="#e3d6c4" stroke-width="0.8"/><path d="M0 14.4 V20.6" stroke="#e3d6c4" stroke-width="1"/>
    ${mund}
    <circle cx="-20" cy="7" r="4.4" fill="#ef8f7a" opacity="0.45"/><circle cx="20" cy="7" r="4.4" fill="#ef8f7a" opacity="0.45"/>
    ${beret}
  </g>`;
}
// Ganze Margot, Füsse bei (0,0), etwa 150 hoch – die Arme wie bei Rocco.
//   pose  steh | wirf | wink | jubel
function margot(pose = "steh", laune = "froh") {
  const arm = (cx, cy, ry, w) => `<ellipse cx="${cx}" cy="${cy}" rx="7.5" ry="${ry}" transform="rotate(${w} ${cx} ${cy})" fill="${FELL_D}"/>`;
  const arme = {
    wirf: arm(-22, -46, 15, 18) + arm(26, -80, 17, -28),
    wink: arm(-36, -74, 18, -35) + arm(24, -46, 15, -16),
    jubel: arm(-27, -80, 17, 28) + arm(27, -80, 17, -28),
  }[pose] || arm(-24, -46, 15, 16) + arm(24, -46, 15, -16);
  return `<g>
    <ellipse cx="27" cy="-16" rx="10" ry="17" transform="rotate(38 27 -16)" fill="${FELL_D}"/><ellipse cx="35" cy="-25" rx="6" ry="8" transform="rotate(38 35 -25)" fill="#5f3d22"/>
    <ellipse cx="-12" cy="-6" rx="11" ry="7" fill="${FELL_D}"/><ellipse cx="12" cy="-6" rx="11" ry="7" fill="${FELL_D}"/>
    <ellipse cx="0" cy="-42" rx="27" ry="35" fill="${FELL}"/><ellipse cx="0" cy="-36" rx="17" ry="25" fill="${BAUCH}"/>
    ${arme}
    <g transform="translate(0 -94)">${margotKopf(laune)}</g>
  </g>`;
}

// ---------------------------------------------------------------------------
// Der Panorama-Bistrowagen von innen (1000 × 560)
// ---------------------------------------------------------------------------
// Dieselben Orte wie im Caboose (sprachwagen.js hängt die Tipps an):
//   tuer        in den Englischwagen          regal      die Geschichten
//   buch        das Wörterbuch                rocco      Margot
//   telefon     Allô, Margot ?                karte      was Margot vorschlägt
//   kiste       der Weidenkorb mit den Spielen
//   jukebox     das Grammophon (die Verse)    ausguck    das Panoramafenster
//   aufnaeher   die Tafel mit den Écussons
// Die Einrichtung (franzoesisch-inhalt.js, EINRICHTUNG) in derselben Reihe.
const ESC = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const SCHRIFT = "Baloo 2, Nunito, sans-serif";
function zimmer({ ausbau = 0, neuAb = Infinity, karte = null, aufnaeher: flicken = [], jukebox = false, telefon = false } = {}) {
  const ding = (i, id, inhalt) => (ausbau > i ? `<g class="en-ausbau${i >= neuAb ? " is-neu" : ""}" data-ausbau="${id}" tabindex="0" role="button">${inhalt}</g>` : "");
  const ort = (id, inhalt) => `<g class="en-ort en-ort-${id}" data-ort="${id}" tabindex="0" role="button">${inhalt}</g>`;
  let s = "";
  // Wände: oben hell, unten grünes Täfer; die Decke aus Holz; der Boden in
  // schwarz-weissen Fliesen wie in einem Bistro.
  s += `<rect width="1000" height="560" fill="#f6ead2"/>`;
  for (let x = 23; x < 1000; x += 46) s += `<rect x="${x}" y="40" width="2" height="250" fill="#efdcbc"/>`;
  s += `<rect x="0" y="290" width="1000" height="180" fill="#2f6b55"/><rect x="0" y="286" width="1000" height="8" fill="#8a5a35"/>`;
  for (let x = 30; x < 1000; x += 92) s += `<rect x="${x}" y="306" width="70" height="146" rx="6" fill="none" stroke="#27594a" stroke-width="3"/>`;
  s += `<path d="M0 0 L1000 0 L1000 42 Q500 70 0 42 Z" fill="#6d4628"/><path d="M0 40 Q500 68 1000 40" stroke="#8a5a35" stroke-width="4" fill="none"/>`;
  s += `<rect x="0" y="470" width="1000" height="90" fill="#f2efe8"/>`;
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 34; c += 1) if ((r + c) % 2) s += `<rect x="${c * 30 - (r % 2 ? 0 : 0)}" y="${470 + r * 30}" width="30" height="30" fill="#3a3f4a"/>`;
  s += `<rect x="0" y="468" width="1000" height="5" fill="#8a5a35"/>`;
  // Einrichtung, die nicht an einem Ort hängt
  s += ding(8, "fanions", [...Array(12)].map((_, i) => { const x = 130 + i * 32; return `<path d="M${x} 60 L${x + 26} 60 L${x + 13} 84 Z" fill="${["#2f5fb3", "#ffffff", ROT][i % 3]}"/>`; }).join("") + `<path d="M126 60 L520 60" stroke="#8a5a35" stroke-width="2"/>`);
  s += ding(13, "guirlande", [...Array(18)].map((_, i) => `<circle class="en-birne en-birne-${i % 3}" cx="${560 + i * 24}" cy="${(58 + 8 * Math.sin(i / 2.2)).toFixed(1)}" r="4" fill="${["#ffd166", "#ef6fa8", "#4fc3f7", "#8bd36b"][i % 4]}"/>`).join(""));
  s += ding(0, "lampe", `<path d="M480 42 L480 84" stroke="#3a3f4a" stroke-width="2"/><path d="M458 104 Q458 84 480 84 Q502 84 502 104 Z" fill="#2f8a5f"/><ellipse cx="480" cy="104" rx="22" ry="4" fill="#27594a"/><ellipse cx="480" cy="110" rx="9" ry="6" fill="#ffd166"/>`);
  s += ding(11, "tour", `<rect x="330" y="78" width="120" height="78" rx="4" fill="#8a5a35"/><rect x="336" y="84" width="108" height="66" fill="#cfeefa"/><rect x="336" y="134" width="108" height="16" fill="#94cd60"/>
    <path d="M390 90 L398 120 L408 148 L400 148 L394 132 L386 132 L380 148 L372 148 L382 120 Z" fill="#6d4628"/><path d="M381 118 H399 M376 132 H404" stroke="#6d4628" stroke-width="3"/><path d="M390 84 V92" stroke="#6d4628" stroke-width="2"/>`);
  s += ding(7, "beret", `<circle cx="272" cy="104" r="3" fill="#8a5a35"/><path d="M250 124 Q248 108 272 106 Q298 106 298 122 Q274 130 250 124 Z" fill="${ROT}"/><path d="M250 124 Q274 131 298 122" stroke="${ROT_D}" stroke-width="3" fill="none"/><path d="M274 106 q1 -5 4 -6" stroke="${ROT_D}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
  s += ding(9, "horaire", `<rect x="146" y="92" width="58" height="44" rx="4" fill="#ffd23f" stroke="#3a3f4a" stroke-width="2"/><rect x="150" y="96" width="50" height="9" fill="#3a3f4a"/>${[110, 118, 126].map((y) => `<rect x="152" y="${y}" width="18" height="3" rx="1" fill="#3a3f4a"/><rect x="176" y="${y}" width="22" height="3" rx="1" fill="#3a3f4a"/>`).join("")}`);
  // vor dem Tischchen auf dem Boden
  s += ding(6, "baguette", `<g transform="translate(-306 0)"><rect x="592" y="482" width="64" height="24" rx="6" fill="#c08a55"/>${[0, 1, 2, 3].map((k) => `<rect x="${598 + k * 8}" y="${482 - k * 4}" width="10" height="2" fill="#a8743f"/>`).join("")}
    <g transform="rotate(-14 610 470)"><rect x="600" y="440" width="14" height="52" rx="7" fill="#e0a95a"/><path d="M603 450 l8 4 M603 462 l8 4 M603 474 l8 4" stroke="#b87a3a" stroke-width="2" stroke-linecap="round"/></g>
    <g transform="rotate(10 640 470)"><rect x="632" y="438" width="14" height="54" rx="7" fill="#e6b066"/><path d="M635 448 l8 4 M635 460 l8 4 M635 472 l8 4" stroke="#b87a3a" stroke-width="2" stroke-linecap="round"/></g></g>`);
  s += ding(10, "lavande", `<path d="M830 452 L862 452 L856 474 L836 474 Z" fill="#c8603f"/><rect x="828" y="448" width="36" height="6" rx="2" fill="#a84f32"/>
    ${[836, 842, 848, 854, 860].map((x, k) => `<path d="M${x - 2} 448 Q${x - 4} 428 ${x - 6 + k * 2} 414" stroke="#5c8a3a" stroke-width="2" fill="none"/><ellipse cx="${x - 6 + k * 2}" cy="${414 + (k % 2) * 3}" rx="3.2" ry="9" fill="#8e5cd9"/>`).join("")}`);
  s += ding(12, "chocolat", `<rect x="934" y="430" width="50" height="8" rx="3" fill="#8a5a35"/><rect x="954" y="438" width="10" height="34" fill="#8a5a35"/><rect x="942" y="470" width="34" height="5" rx="2" fill="#8a5a35"/>
    <path d="M946 404 L972 404 L969 430 L949 430 Z" fill="#ffffff" stroke="#e1d9c6" stroke-width="1.5"/><path d="M972 410 q10 2 0 12" stroke="#ffffff" stroke-width="3.5" fill="none"/><ellipse cx="959" cy="405" rx="12" ry="3" fill="#6d4628"/>
    <path d="M952 396 q4 -6 0 -12 M962 396 q4 -6 0 -12" stroke="#c3c7cf" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  // Das Wandbrett zwischen Regal und Telefon: Croissants und Kaffeekanne.
  if (ausbau > 4) s += `<rect x="322" y="196" width="108" height="7" rx="2" fill="#8a5a35"/><path d="M332 203 l8 12 M420 203 l-8 12" stroke="#8a5a35" stroke-width="3"/>`;
  s += ding(4, "croissants", [[340, 192], [366, 190], [392, 192]].map(([x, y]) => `<path d="M${x - 12} ${y} Q${x} ${y - 16} ${x + 12} ${y} Q${x + 6} ${y - 3} ${x} ${y - 4} Q${x - 6} ${y - 3} ${x - 12} ${y} Z" fill="#e0a24a"/><path d="M${x - 4} ${y - 10} l2 7 M${x + 4} ${y - 10} l-2 7" stroke="#b8792e" stroke-width="1.6"/>`).join(""));
  s += ding(5, "cafetiere", `<path d="M408 196 L408 170 Q408 160 418 160 Q428 160 428 170 L428 196 Z" fill="#c3c7cf"/><rect x="406" y="156" width="24" height="6" rx="3" fill="#3a3f4a"/><path d="M428 172 q8 4 0 14" stroke="#3a3f4a" stroke-width="3" fill="none"/><path d="M408 170 l-8 -4" stroke="#c3c7cf" stroke-width="4" stroke-linecap="round"/>`);
  // Die Tür in den Englischwagen
  s += ort("tuer", `<rect x="18" y="130" width="100" height="345" rx="10" fill="#6d4628"/><rect x="26" y="138" width="84" height="329" rx="6" fill="#8a5a35"/><rect x="38" y="152" width="60" height="70" rx="6" fill="#cfeefa"/><circle cx="96" cy="320" r="6" fill="#ffd166"/>
    <rect x="36" y="244" width="64" height="24" rx="5" fill="#3a7bd5"/><text x="68" y="262" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="15" fill="#ffffff">Hello</text>`);
  // Das Regal mit den Bilderbüchern: die Geschichten
  let buecher = "";
  const bf = [ROT, "#2f5fb3", "#ffd166", "#3fa34d", "#8e5cd9", "#ef6fa8", "#00a5b5"];
  [196, 262].forEach((y, r) => { for (let i = 0; i < 7; i += 1) buecher += `<rect x="${150 + i * 21}" y="${y - (i % 3) * 4 - 40}" width="17" height="${40 + (i % 3) * 4}" rx="3" fill="${bf[(i + r * 3) % 7]}"/>`; });
  s += ort("regal", `<rect x="138" y="140" width="172" height="200" rx="6" fill="#6d4628"/><rect x="146" y="148" width="156" height="184" fill="#4f321d"/>${buecher}<rect x="146" y="196" width="156" height="6" fill="#6d4628"/><rect x="146" y="262" width="156" height="6" fill="#6d4628"/>
    <g transform="translate(224 300)"><path d="M-62 -26 L0 -20 L62 -26 L62 26 L0 30 L-62 26 Z" fill="#ffffff"/><path d="M0 -20 L0 30" stroke="#d9dce2" stroke-width="2"/>${[[-55, -18], [-28, -18], [7, -17], [34, -18]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="21" height="18" rx="2" fill="#cdeefb"/><circle cx="${x + 10}" cy="${y + 11}" r="4" fill="${["#c98b4f", "#e63946", "#4caf50", "#ffd23f"][i]}"/>`).join("")}${[-55, -28, 7, 34].map((x) => `<rect x="${x}" y="4" width="21" height="3" rx="1" fill="#c3c7cf"/><rect x="${x}" y="10" width="15" height="3" rx="1" fill="#c3c7cf"/>`).join("")}</g>`);
  // Das runde Bistrotischchen mit dem Wörterbuch (später mit Tischtuch und Blumen)
  const tuch = ausbau > 1 ? `<g class="en-ausbau${1 >= neuAb ? " is-neu" : ""}" data-ausbau="nappe"><path d="M144 404 L306 404 L296 436 L154 436 Z" fill="#ffffff"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<rect x="${152 + k * 19}" y="${k % 2 ? 404 : 420}" width="19" height="16" fill="${ROT}" opacity="0.85"/>`).join("")}</g>` : "";
  s += ort("buch", `<ellipse cx="225" cy="408" rx="82" ry="10" fill="#3a3f4a"/><rect x="220" y="410" width="10" height="56" fill="#3a3f4a"/><path d="M196 472 L254 472 L242 464 L208 464 Z" fill="#3a3f4a"/>${tuch}
    <rect x="166" y="358" width="96" height="48" rx="6" fill="#2f5fb3"/><rect x="166" y="358" width="10" height="48" rx="3" fill="#1d3f80"/><circle cx="220" cy="382" r="16" fill="#ffffff"/><g transform="translate(220 384) scale(0.42)">${margotKopf("froh", { muetze: false })}</g>${stern(250, 366, 7)}`);
  s += ding(2, "fleurs", `<rect x="272" y="378" width="20" height="26" rx="6" fill="#cfeefa" opacity="0.9"/><path d="M282 380 L278 354 M282 380 L290 350 M282 380 L284 348" stroke="#3fa34d" stroke-width="2.5"/>${[[278, 350, ROT], [291, 346, "#ffd23f"], [284, 342, "#ef6fa8"]].map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${f}"/><circle cx="${x}" cy="${y}" r="2.4" fill="#ffffff"/>`).join("")}`);
  // Margot auf ihrem Bistrostuhl
  s += ort("rocco", `<rect x="356" y="456" width="10" height="16" fill="#3a3f4a"/><rect x="474" y="456" width="10" height="16" fill="#3a3f4a"/>
    <path d="M370 444 L360 492 M470 444 L480 492" stroke="#6d4628" stroke-width="8" stroke-linecap="round"/>
    <path d="M372 444 Q366 300 420 296 Q474 300 468 444" stroke="#6d4628" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M384 440 Q382 330 420 326 Q458 330 456 440" stroke="#8a5a35" stroke-width="5" fill="none"/>
    <rect x="352" y="438" width="136" height="16" rx="7" fill="#8a5a35"/><path d="M370 492 Q420 478 470 492" stroke="#6d4628" stroke-width="4" fill="none"/>
    <g transform="translate(420 444) scale(0.95)">${margot("steh", "froh")}</g>`);
  // Die Karte: was Margot vorschlägt
  if (karte) {
    s += ort("karte", `<rect x="506" y="150" width="214" height="124" rx="16" fill="#ffffff" stroke="#e1d9c6" stroke-width="2"/>
      <text x="613" y="178" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="15" fill="#5d6882">J'ai une idée !</text>
      <g transform="translate(548 228)">${karte.bild || ""}</g>
      <text x="586" y="${karte.titel.length > 12 ? 214 : 222}" font-family="${SCHRIFT}" font-weight="800" font-size="${karte.titel.length > 12 ? 16 : 20}" fill="#243047">${ESC(karte.titel)}</text>
      <circle cx="676" cy="248" r="16" fill="#3fbf74"/><path d="M670 239 L684 248 L670 257 Z" fill="#ffffff"/>`);
  }
  // Der Weidenkorb mit den Spielen (Écoute et trouve und der Spielkorb)
  let weide = "";
  for (let y = 420; y < 470; y += 9) weide += `<path d="M566 ${y} Q612 ${y + 5} 658 ${y}" stroke="#a8743f" stroke-width="2.4" fill="none"/>`;
  s += ort("kiste", `<circle cx="590" cy="402" r="14" fill="#e63946"/><path d="M578 398 Q590 408 602 398" stroke="#ffffff" stroke-width="2.5" fill="none"/>${stern(636, 396, 13)}
    <path d="M560 412 L664 412 L654 472 L570 472 Z" fill="#d9a35f"/>${weide}<rect x="556" y="406" width="112" height="12" rx="6" fill="#b98352"/>
    <path d="M580 410 Q612 372 644 410" stroke="#b98352" stroke-width="5" fill="none"/>
    <rect x="596" y="434" width="32" height="22" rx="4" fill="#ffffff"/><text x="612" y="451" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="14" fill="${ROT}">ABC</text>`);
  // Das Panoramafenster: die Welten. Hinter dem Glas die Berge.
  const glas = `<rect x="738" y="30" width="124" height="268" rx="58" fill="#9fd8f0"/>
    <path d="M738 206 L762 160 L780 184 L806 124 L834 172 L862 146 L862 298 L738 298 Z" fill="#7fa1c4"/>
    <path d="M762 160 L752 176 L772 176 Z M806 124 L794 146 L820 146 Z M862 146 L852 160 L862 162 Z" fill="#ffffff"/>
    <path d="M738 250 Q800 228 862 246 L862 298 L738 298 Z" fill="#94cd60"/>`;
  const himmel = ausbau > 14
    ? `<g class="en-ausbau${14 >= neuAb ? " is-neu" : ""}" data-ausbau="etoiles"><rect x="738" y="30" width="124" height="268" rx="58" fill="#27406e" opacity="0.55"/>${stern(764, 76, 7)}${stern(828, 64, 6)}${stern(840, 106, 5)}${stern(784, 114, 4)}</g>`
    : `<circle cx="832" cy="84" r="15" fill="#ffe27a"/>`;
  const vorhaenge = ausbau > 3 ? `<g class="en-ausbau${3 >= neuAb ? " is-neu" : ""}" data-ausbau="rideaux"><path d="M728 30 L750 30 Q742 160 748 300 L728 300 Z" fill="${ROT}"/><path d="M872 30 L850 30 Q858 160 852 300 L872 300 Z" fill="${ROT}"/></g>` : "";
  s += ort("ausguck", `<rect x="728" y="22" width="144" height="286" rx="66" fill="#6d4628"/>${glas}${himmel}
    <path d="M800 30 V298 M738 164 H862" stroke="#6d4628" stroke-width="6"/>${vorhaenge}
    <rect x="736" y="314" width="128" height="26" rx="8" fill="#ffffff"/><text x="800" y="333" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="16" fill="#2f6b55">PANORAMA</text>`);
  // Die Tafel mit den Écussons
  let brett = `<rect x="872" y="128" width="116" height="200" rx="10" fill="#6d4628"/><rect x="880" y="136" width="100" height="184" rx="6" fill="#2f6b55"/>
    <text x="930" y="160" text-anchor="middle" font-family="${SCHRIFT}" font-weight="800" font-size="12" fill="#ffffff">ÉCUSSONS</text>`;
  const spalten = flicken.length > 6 ? 3 : flicken.length > 3 ? 2 : 1;
  flicken.slice(0, 12).forEach((f, i) => {
    const x = spalten === 3 ? 897 + (i % 3) * 33 : spalten === 2 ? 905 + (i % 2) * 50 : 930;
    const y = spalten === 3 ? 188 + Math.floor(i / 3) * 36 : spalten === 2 ? 196 + Math.floor(i / 2) * 50 : 196 + i * 50;
    brett += E.aufnaeher(f.id || f.welt, x, y, spalten === 3 ? 14 : spalten === 2 ? 19 : 20, f);
  });
  s += ort("aufnaeher", brett);
  // Das rote Telefon an der Wand
  if (telefon) {
    s += ort("telefon", `<rect x="454" y="168" width="44" height="74" rx="10" fill="${ROT}"/><circle cx="476" cy="210" r="15" fill="#fff6e0"/>
      ${[...Array(8)].map((_, k) => { const a = (k / 8) * Math.PI * 2; return `<circle cx="${(476 + 10 * Math.cos(a)).toFixed(1)}" cy="${(210 + 10 * Math.sin(a)).toFixed(1)}" r="2.4" fill="${DUNKEL}"/>`; }).join("")}
      <path d="M450 170 q-14 20 0 60" stroke="${ROT_D}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="438" y="164" width="16" height="72" rx="8" fill="#c21f32"/>
      <path d="M446 236 q-6 30 20 38 q20 6 26 -8" stroke="#3a3f4a" stroke-width="2.5" fill="none"/>`);
  }
  // Das Grammophon: die Verse
  if (jukebox) {
    s += ort("jukebox", `<rect x="672" y="420" width="68" height="50" rx="6" fill="#8a5a35"/><rect x="678" y="426" width="56" height="10" rx="3" fill="#6d4628"/><circle cx="726" cy="452" r="5" fill="#ffd166"/>
      <ellipse cx="702" cy="420" rx="28" ry="5" fill="${DUNKEL}"/><path d="M704 418 L706 396" stroke="#c98a00" stroke-width="5" stroke-linecap="round"/>
      <path d="M704 400 Q698 376 680 360 Q702 352 734 360 Q714 380 710 400 Z" fill="#f4b400"/><ellipse cx="707" cy="360" rx="28" ry="7" fill="#ffd166" stroke="#c98a00" stroke-width="2"/>
      <path d="M744 380 q8 -8 4 -18 M754 396 q12 -8 8 -24" stroke="#8e5cd9" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="748" cy="362" r="4" fill="#8e5cd9"/><circle cx="762" cy="372" r="4" fill="#8e5cd9"/>`);
  }
  return `<svg viewBox="0 0 1000 560" class="en-zimmer-svg fr-zimmer-svg" role="img" aria-label="Der Französischwagen von innen" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="en-grau"><feColorMatrix type="saturate" values="0"/></filter></defs>${s}</svg>`;
}

// Was im Französischwagen anders ist als im Englischwagen; alles andere erbt
// LernappFranzoesischArt von LernappEnglischArt.
//   MASKOTTCHEN  für sprachwagen.js (aktiv.maskottchen): wer in den
//                Zeichnungen an Roccos Stelle steht, und Margots gemalter
//                Sticker im Wörterbuch (statt des Waschbären)
const MASKOTTCHEN = { rocco: margot, roccoKopf: margotKopf, sticker: { raccoon: "bilder/franzoesisch/sticker-margot.webp" } };
window.LernappFranzoesischArt = Object.assign(Object.create(E), { margot, margotKopf, rocco: margot, roccoKopf: margotKopf, zimmer, MASKOTTCHEN });
})();
