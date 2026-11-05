/*
 * englisch-art.js – Was die Englischecke zeichnet.
 *
 *   roccoKopf(laune), rocco(pose, laune)   Rocco, der Waschbär, mit seiner
 *                                          blauen Kondukteursmütze
 *   zimmer(stand)        der Caboose von innen (1000 × 560): jedes Ding mit
 *                        einem Weg ist ein <g data-ort>, jedes Stück der
 *                        Einrichtung ein <g data-ausbau> (sprachwagen.js
 *                        hängt den Tipp an)
 *   szene(welt)          ein Wimmelbild (Bauernhof, Zuhause, Küche): jedes
 *                        Ding ein <g data-ding> – gemalt, wo es das Gemälde
 *                        gibt (GEMALT, englisch-gemalt.js)
 *   geschichtsBild(g, i) ein Bild einer Bildgeschichte (472 × 204); was im
 *                        Satz vorkommt, ist ein <g data-wort> – ebenso gemalt
 *   sticker(id …)        ein Wort im Wörterbuch; aufnaeher(welt …) ein Aufnäher
 *
 * Gezeichnet als SVG-Text im Stil der App: flache Farben, runde Ecken, kein
 * Text, den ein Kind lesen müsste (ausser «LOOKOUT» und «MILK», die zum Bild
 * gehören). Mama und Papa sind die Menschen der Bauecke (bau-menschen.js).
 */
(() => {
"use strict";

const GRAU = "#9aa0ab", GRAU_D = "#6f7682", DUNKEL = "#2b2f38", HELL = "#eef0f3";
// Ist ein anderer Sprachwagen offen (sprachwagen.js, aktiv.maskottchen), zeichnen
// rocco() und roccoKopf() dessen Maskottchen – so stehen in Geschichten, Spielen
// und Lok alle Zeichnungen mit Margot da, ohne dass sie zweimal gebaut werden.
const fremdesMaskottchen = () => (typeof window !== "undefined" && window.LernappSprachwagen?.aktiv?.maskottchen) || null;
function roccoKopf(laune = "froh", optionen = {}) {
  const m = fremdesMaskottchen();
  return m ? m.roccoKopf(laune, optionen) : roccoKopfEcht(laune, optionen);
}
function roccoKopfEcht(laune = "froh", { muetze = true } = {}) {
  const augen = laune === "freude"
    ? `<path d="M-17 -3 q5 -6 10 0 M7 -3 q5 -6 10 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<circle cx="-12" cy="-3" r="5" fill="#fff"/><circle cx="12" cy="-3" r="5" fill="#fff"/>
       <circle cx="${laune === "hoch" ? -11 : -11.5}" cy="${laune === "hoch" ? -5.5 : -2.5}" r="2.6" fill="${DUNKEL}"/>
       <circle cx="${laune === "hoch" ? 13 : 12.5}" cy="${laune === "hoch" ? -5.5 : -2.5}" r="2.6" fill="${DUNKEL}"/>`;
  const mund = laune === "traurig"
    ? `<path d="M-6 19 Q0 14 6 19" stroke="${DUNKEL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : `<path d="M-7 15 Q0 21 7 15" stroke="${DUNKEL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  const brauen = laune === "traurig" ? `<path d="M-18 -13 L-8 -10 M18 -13 L8 -10" stroke="${DUNKEL}" stroke-width="2.4" stroke-linecap="round"/>` : "";
  const muetzeSvg = muetze ? `<path d="M-21 -20 Q-20 -38 0 -39 Q20 -38 21 -20 Z" fill="#2f5fb3"/>
      <rect x="-25" y="-22" width="50" height="6" rx="3" fill="#1d3f80"/><circle cx="0" cy="-29" r="3.4" fill="#ffd166"/>` : "";
  return `<g>
    <path d="M-29 -10 L-27 -36 L-11 -24 Z" fill="${GRAU_D}"/><path d="M29 -10 L27 -36 L11 -24 Z" fill="${GRAU_D}"/>
    <path d="M-25 -15 L-24 -30 L-15 -22 Z" fill="${DUNKEL}"/><path d="M25 -15 L24 -30 L15 -22 Z" fill="${DUNKEL}"/>
    <ellipse cx="0" cy="0" rx="31" ry="26" fill="${GRAU}"/>
    <path d="M-17 -15 Q-12 -19 -5 -13 M17 -15 Q12 -19 5 -13" stroke="${HELL}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-30 3 Q0 -4 30 3 Q27 25 0 26 Q-27 25 -30 3 Z" fill="${HELL}"/>
    <path d="M-28 -5 Q-15 -14 0 -6 Q15 -14 28 -5 Q24 9 12 7 Q4 5 0 3 Q-4 5 -12 7 Q-24 9 -28 -5 Z" fill="${DUNKEL}"/>
    ${augen}${brauen}
    <ellipse cx="0" cy="9" rx="5.4" ry="3.8" fill="${DUNKEL}"/>
    ${mund}${muetzeSvg}
  </g>`;
}
function roccoSchwanz() {
  const bogen = "M8 -20 C46 -16 72 -34 70 -66 C69 -84 60 -96 50 -102";
  return `<path d="${bogen}" stroke="#c3c7cf" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="${bogen}" stroke="#4f5560" stroke-width="22" fill="none" stroke-dasharray="11 13" stroke-dashoffset="-14"/>
    <circle cx="50" cy="-102" r="11" fill="#2b2f38"/>`;
}
// Ganzer Rocco, Füsse bei (0,0), etwa 150 hoch
function rocco(pose = "steh", laune = "froh") {
  const m = fremdesMaskottchen();
  return m ? m.rocco(pose, laune) : roccoEcht(pose, laune);
}
function roccoEcht(pose = "steh", laune = "froh") {
  let arme;
  if (pose === "wirf") arme = `<ellipse cx="-22" cy="-46" rx="7" ry="15" transform="rotate(18 -22 -46)" fill="${GRAU_D}"/><ellipse cx="26" cy="-80" rx="7" ry="17" transform="rotate(-28 26 -80)" fill="${GRAU_D}"/>`;
  else if (pose === "wink") arme = `<ellipse cx="-36" cy="-74" rx="7" ry="18" transform="rotate(-35 -36 -74)" fill="${GRAU_D}"/><ellipse cx="24" cy="-46" rx="7" ry="15" transform="rotate(-16 24 -46)" fill="${GRAU_D}"/>`;
  else if (pose === "jubel") arme = `<ellipse cx="-27" cy="-80" rx="7" ry="17" transform="rotate(28 -27 -80)" fill="${GRAU_D}"/><ellipse cx="27" cy="-80" rx="7" ry="17" transform="rotate(-28 27 -80)" fill="${GRAU_D}"/>`;
  else arme = `<ellipse cx="-24" cy="-46" rx="7" ry="15" transform="rotate(16 -24 -46)" fill="${GRAU_D}"/><ellipse cx="24" cy="-46" rx="7" ry="15" transform="rotate(-16 24 -46)" fill="${GRAU_D}"/>`;
  return `<g>
    ${roccoSchwanz()}
    <ellipse cx="-12" cy="-6" rx="11" ry="7" fill="${DUNKEL}"/><ellipse cx="12" cy="-6" rx="11" ry="7" fill="${DUNKEL}"/>
    <ellipse cx="0" cy="-42" rx="27" ry="35" fill="${GRAU}"/><ellipse cx="0" cy="-36" rx="17" ry="25" fill="#d9dce2"/>
    ${arme}
    <g transform="translate(0 -94)">${roccoKopfEcht(laune)}</g>
  </g>`;
}

// ===========================================================================
// Zeichnungen: der Bauernhof (jedes Ding um (0,0), Boden ungefähr bei +50)
// ===========================================================================
function apfel(x, y, r) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#e63946"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="#ff8a8f"/>
    <rect x="${x - 1.5}" y="${y - r - 6}" width="3" height="8" rx="1.5" fill="#6d4c2f"/><ellipse cx="${x + 5}" cy="${y - r - 3}" rx="5" ry="3" fill="#4caf50"/>`;
}
const DING = {
  sun: () => `${Array.from({ length: 12 }, (_, k) => `<rect x="-3.5" y="-60" width="7" height="17" rx="3.5" fill="#ffb703" transform="rotate(${k * 30})"/>`).join("")}
    <circle r="37" fill="#ffd23f"/><circle cx="-12" cy="-6" r="3.6" fill="#7a4b12"/><circle cx="12" cy="-6" r="3.6" fill="#7a4b12"/>
    <path d="M-12 9 Q0 20 12 9" stroke="#7a4b12" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <circle cx="-21" cy="6" r="5" fill="#ff9f68" opacity="0.55"/><circle cx="21" cy="6" r="5" fill="#ff9f68" opacity="0.55"/>`,
  barn: () => `<path d="M-63 -14 L-49 -52 L0 -79 L49 -52 L63 -14 Z" fill="#8f2d29"/>
    <rect x="-56" y="-18" width="112" height="76" fill="#c8423b"/>
    ${[-42, -28, 28, 42].map((x) => `<rect x="${x}" y="-16" width="2" height="72" fill="#b23a34"/>`).join("")}
    <rect x="-58" y="-20" width="116" height="5" fill="#ffffff"/>
    <rect x="-15" y="-51" width="30" height="23" rx="2" fill="#ffffff"/><rect x="-11" y="-47" width="22" height="15" fill="#5b2a1f"/>
    <rect x="-27" y="7" width="54" height="51" fill="#a83631" stroke="#ffffff" stroke-width="4"/>
    <path d="M-27 7 L27 58 M27 7 L-27 58" stroke="#ffffff" stroke-width="4"/>`,
  tractor: () => `<rect x="17" y="-60" width="8" height="32" rx="3" fill="#3a3f4a"/>
    <rect x="-6" y="-31" width="64" height="40" rx="8" fill="#3fa34d"/>
    <path d="M-59 10 L-59 -54 L-9 -54 L-3 10 Z" fill="#2f8a3f"/><path d="M-51 -12 L-51 -46 L-16 -46 L-12 -12 Z" fill="#cfeefa"/>
    <rect x="51" y="-25" width="8" height="27" rx="2" fill="${DUNKEL}"/>
    <path d="M-72 12 A36 36 0 0 1 4 12 Z" fill="#2f8a3f"/>
    <circle cx="-34" cy="22" r="31" fill="${DUNKEL}"/><circle cx="-34" cy="22" r="13" fill="#ffd23f"/>
    <circle cx="40" cy="36" r="17" fill="${DUNKEL}"/><circle cx="40" cy="36" r="7" fill="#ffd23f"/>`,
  tree: () => `<rect x="-11" y="-12" width="22" height="67" rx="5" fill="#8a5a35"/>
    <circle cx="0" cy="-60" r="47" fill="#4caf50"/><circle cx="-35" cy="-33" r="31" fill="#43a047"/>
    <circle cx="35" cy="-33" r="31" fill="#43a047"/><circle cx="0" cy="-93" r="31" fill="#5cbf5c"/>`,
  apple: (gross) => (gross ? apfel(0, 4, 30) : `<circle r="44" fill="transparent"/>${apfel(-25, -6, 13)}${apfel(21, -21, 13)}${apfel(10, 20, 13)}`),
  cow: () => `<path d="M-48 -8 Q-63 8 -57 30" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="-57" cy="32" r="5.5" fill="${DUNKEL}"/>
    ${[-38, -22, 16, 31].map((x) => `<rect x="${x}" y="8" width="11" height="42" rx="4" fill="#ffffff"/><rect x="${x}" y="43" width="11" height="8" rx="3" fill="${DUNKEL}"/>`).join("")}
    <ellipse cx="-4" cy="0" rx="49" ry="29" fill="#ffffff"/>
    <path d="M-32 -21 q13 -7 19 4 q4 13 -11 13 q-14 -2 -8 -17z" fill="${DUNKEL}"/><ellipse cx="15" cy="6" rx="12" ry="9" fill="${DUNKEL}"/><ellipse cx="-20" cy="15" rx="7" ry="5" fill="${DUNKEL}"/>
    <ellipse cx="6" cy="27" rx="10" ry="6" fill="#f7b8c4"/>
    <g transform="translate(46 -18)">
      <path d="M-9 -19 q-5 -11 -12 -9 M9 -19 q5 -11 12 -9" stroke="#e9d8b4" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="-18" cy="-9" rx="10" ry="5" transform="rotate(-20 -18 -9)" fill="#ffffff"/><ellipse cx="18" cy="-9" rx="10" ry="5" transform="rotate(20 18 -9)" fill="#ffffff"/>
      <ellipse cx="0" cy="0" rx="18" ry="22" fill="#ffffff"/><ellipse cx="7" cy="-11" rx="7" ry="5" fill="${DUNKEL}"/>
      <ellipse cx="2" cy="14" rx="15" ry="10" fill="#f7b8c4"/><ellipse cx="-3" cy="14" rx="2.2" ry="3" fill="#c9707f"/><ellipse cx="7" cy="14" rx="2.2" ry="3" fill="#c9707f"/>
      <circle cx="-7" cy="-3" r="3.2" fill="${DUNKEL}"/><circle cx="8" cy="-3" r="3.2" fill="${DUNKEL}"/>
    </g>`,
  pig: () => `<path d="M-40 -4 q-13 -6 -11 -15 q4 -6 8 0 q2 6 -6 6" stroke="#ee8ca5" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${[-27, -11, 11, 25].map((x) => `<rect x="${x}" y="12" width="11" height="25" rx="4" fill="#ee8ca5"/>`).join("")}
    <ellipse cx="-2" cy="0" rx="41" ry="27" fill="#f6a9bc"/>
    <circle cx="33" cy="-8" r="22" fill="#f6a9bc"/>
    <path d="M20 -26 L26 -42 L35 -27 Z" fill="#ee8ca5"/><path d="M35 -28 L46 -40 L47 -22 Z" fill="#ee8ca5"/>
    <ellipse cx="51" cy="-3" rx="11" ry="10" fill="#ee8ca5"/><ellipse cx="48" cy="-3" rx="2.2" ry="3.2" fill="#b85c74"/><ellipse cx="54" cy="-3" rx="2.2" ry="3.2" fill="#b85c74"/>
    <circle cx="35" cy="-14" r="3.2" fill="${DUNKEL}"/><circle cx="26" cy="0" r="5" fill="#ff8fab" opacity="0.6"/>`,
  sheep: () => `${[-25, -11, 9, 22].map((x) => `<rect x="${x}" y="10" width="9" height="29" rx="4" fill="#3a3f4a"/>`).join("")}
    <ellipse cx="0" cy="-2" rx="32" ry="22" fill="#ffffff"/>
    ${[[-31, -6], [-19, -19], [0, -23], [19, -19], [29, -4], [19, 11], [0, 15], [-19, 11], [-31, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="#ffffff"/>`).join("")}
    ${[[-14, -6], [10, 2], [-4, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#eef1f5"/>`).join("")}
    <ellipse cx="30" cy="-14" rx="9" ry="4.5" transform="rotate(-25 30 -14)" fill="#3a3f4a"/>
    <ellipse cx="41" cy="-8" rx="13" ry="16" fill="#3a3f4a"/>
    <circle cx="37" cy="-24" r="7" fill="#ffffff"/><circle cx="45" cy="-25" r="6" fill="#ffffff"/>
    <circle cx="45" cy="-11" r="3" fill="#ffffff"/><circle cx="45.6" cy="-10.6" r="1.5" fill="${DUNKEL}"/>`,
  chicken: () => `<path d="M-50 42 q10 -6 20 0 M-52 38 q12 -5 24 1" stroke="#e0b04a" stroke-width="3" fill="none"/>
    <ellipse cx="-40" cy="30" rx="9.5" ry="12.5" fill="#fff3d6" stroke="#e9d8b4" stroke-width="1.5"/>
    <path d="M-4 22 L-6 40 M8 22 L10 40 M-11 41 L0 41 M5 41 L16 41" stroke="#f5a623" stroke-width="4" stroke-linecap="round"/>
    <path d="M-27 -5 Q-47 -31 -35 -40 Q-26 -23 -19 -14 Z" fill="#f3e2c0"/>
    <ellipse cx="0" cy="2" rx="29" ry="23" fill="#fff7ea"/>
    <path d="M-12 -2 Q4 -11 15 2 Q2 15 -12 8 Z" fill="#efdfc4"/>
    <circle cx="20" cy="-22" r="14" fill="#fff7ea"/>
    <path d="M11 -34 q3 -10 7 -2 q3 -10 7 -1 q4 -8 7 2 Z" fill="#e63946"/>
    <path d="M33 -25 L44 -20 L33 -16 Z" fill="#f5a623"/><ellipse cx="32" cy="-11" rx="3" ry="5" fill="#e63946"/>
    <circle cx="23" cy="-25" r="2.8" fill="${DUNKEL}"/>`,
  duck: () => `<path d="M-38 16 q9 -5 18 0 t18 0 t18 0 t18 0" stroke="#e3f4fc" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-31 -2 L-44 -17 L-35 4 Z" fill="#ffd23f"/>
    <path d="M-31 0 Q-35 -21 -14 -19 L14 -19 Q35 -17 31 4 Q21 20 -10 18 Q-29 16 -31 0 Z" fill="#ffd23f"/>
    <path d="M-12 -7 Q4 -15 15 -3 Q2 8 -12 4 Z" fill="#f5b800"/>
    <circle cx="21" cy="-29" r="14" fill="#ffd23f"/>
    <path d="M31 -30 Q44 -30 44 -24 Q37 -20 31 -23 Z" fill="#f57c00"/>
    <circle cx="24" cy="-32" r="2.8" fill="${DUNKEL}"/>`,
  dog: (pose = "spring") => {
    const beine = pose === "spring"
      ? `<rect x="10" y="-28" width="9" height="26" rx="4" transform="rotate(-55 14 -28)" fill="#b27640"/><rect x="18" y="-28" width="9" height="26" rx="4" transform="rotate(-70 22 -28)" fill="#b27640"/>
         <rect x="-26" y="-26" width="9" height="26" rx="4" transform="rotate(50 -22 -26)" fill="#b27640"/><rect x="-18" y="-26" width="9" height="26" rx="4" transform="rotate(35 -14 -26)" fill="#b27640"/>`
      : `${[-24, -12, 10, 22].map((x) => `<rect x="${x}" y="-24" width="9" height="24" rx="4" fill="#b27640"/>`).join("")}`;
    return `<g transform="${pose === "spring" ? "rotate(-16)" : ""}">
      <path d="M-30 -36 Q-46 -50 -40 -66" stroke="#c98b4f" stroke-width="8" fill="none" stroke-linecap="round"/>
      ${beine}
      <ellipse cx="0" cy="-32" rx="33" ry="17" fill="#c98b4f"/><ellipse cx="-8" cy="-37" rx="10" ry="7" fill="#8a5a35" opacity="0.55"/>
      <circle cx="31" cy="-52" r="18" fill="#c98b4f"/>
      <ellipse cx="45" cy="-46" rx="11" ry="8.5" fill="#e3b07a"/><circle cx="54" cy="-49" r="4" fill="${DUNKEL}"/>
      <ellipse cx="44" cy="-37" rx="4.4" ry="5.6" fill="#ef6fa8"/>
      <path d="M22 -66 Q12 -60 16 -40 Q24 -46 26 -58 Z" fill="#8a5a35"/>
      <circle cx="34" cy="-57" r="2.8" fill="${DUNKEL}"/>
    </g>`;
  },
  cat: () => `<path d="M34 6 Q32 27 -6 25 Q-30 23 -37 14" stroke="#7b7d8a" stroke-width="9" fill="none" stroke-linecap="round"/>
    <ellipse cx="6" cy="0" rx="37" ry="21" fill="#8d8f9c"/>
    <path d="M0 -19 q3 8 0 17 M12 -19 q3 8 0 17 M24 -15 q3 6 0 13" stroke="#6f7180" stroke-width="3" fill="none"/>
    <path d="M-39 -10 L-40 -29 L-29 -18 Z" fill="#8d8f9c"/><path d="M-22 -18 L-14 -31 L-11 -14 Z" fill="#8d8f9c"/>
    <path d="M-37 -13 L-37 -24 L-31 -18 Z" fill="#f7b8c4"/>
    <circle cx="-26" cy="-4" r="17" fill="#8d8f9c"/>
    <path d="M-35 -4 q4 3 8 0 M-24 -4 q4 3 8 0" stroke="${DUNKEL}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M-27 2 l3 3 l3 -3 z" fill="#f7b8c4"/>
    <path d="M-42 2 L-33 4 M-42 7 L-33 6 M-14 4 L-21 4" stroke="#e6e2ee" stroke-width="1.3"/>`,
  flower: () => `<path d="M-17 42 L-15 -2 M2 42 L2 -14 M19 42 L17 2" stroke="#3fa34d" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="-9" cy="22" rx="8" ry="4" transform="rotate(-30 -9 22)" fill="#4caf50"/><ellipse cx="10" cy="26" rx="8" ry="4" transform="rotate(30 10 26)" fill="#4caf50"/>
    ${[[-15, -4], [2, -16], [17, 0]].map(([x, y]) => `${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + 8 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(y + 8 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="6.5" fill="#4a7bd8"/>`).join("")}<circle cx="${x}" cy="${y}" r="5" fill="#ffd23f"/>`).join("")}`,
  ball: () => `<circle r="30" fill="#e63946"/><path d="M-26 -14 Q0 4 26 -14 M-22 18 Q0 4 22 18" stroke="#ffffff" stroke-width="4" fill="none"/><circle cx="-11" cy="-15" r="6" fill="#ff8a8f" opacity="0.7"/>`,
  raccoon: () => `<g transform="scale(1.25)">${roccoKopf("froh", { muetze: false })}</g>`,
};
// Wo die Dinge im Bauernhof stehen: x, y, Massstab, Ecke für den Stern (lokal)
const HOF = {
  sun: [905, 86, 0.9, [40, -46]],
  barn: [165, 300, 1.55, [56, -70]],
  tractor: [420, 332, 1.0, [52, -50]],
  cow: [650, 342, 1.0, [60, -40]],
  tree: [872, 322, 1.15, [44, -118]],
  apple: [870, 250, 1.0, [30, -26]],
  cat: [92, 412, 1.0, [30, -30]],
  chicken: [228, 470, 1.0, [36, -44]],
  dog: [342, 505, 1.0, [52, -84]],
  pig: [482, 480, 1.0, [50, -42]],
  duck: [652, 478, 1.0, [36, -44]],
  sheep: [838, 470, 1.0, [48, -36]],
  flower: [952, 500, 0.9, [24, -34]],
};
const STICKER_MASS = { sun: 0.36, barn: 0.31, tractor: 0.31, tree: 0.24, apple: 0.72, cow: 0.3, pig: 0.33, sheep: 0.38, chicken: 0.38, duck: 0.45, dog: 0.36, cat: 0.42, flower: 0.48, ball: 0.62, raccoon: 0.62 };
const STICKER_DY = { tree: 12, dog: 16, chicken: 4, tractor: 0, barn: 6 };
function stern(x, y, r = 11, klasse = "") {
  const p = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return `<polygon points="${p}" fill="#ffd166" stroke="#c98a00" stroke-width="2" stroke-linejoin="round" class="${klasse}"/>`;
}
const wolkeAn = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#ffffff" opacity="0.9"><ellipse cx="0" cy="0" rx="46" ry="18"/><ellipse cx="-22" cy="-10" rx="22" ry="16"/><ellipse cx="14" cy="-14" rx="26" ry="20"/></g>`;
function hofHintergrund() {
  const wolke = wolkeAn;
  let zaun = "";
  for (let x = 530; x <= 1000; x += 42) zaun += `<rect x="${x}" y="350" width="9" height="52" rx="3" fill="#c08a55"/>`;
  zaun += `<rect x="520" y="360" width="480" height="7" rx="3" fill="#d6a46f"/><rect x="520" y="382" width="480" height="7" rx="3" fill="#d6a46f"/>`;
  return `<defs><linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8f0"/><stop offset="1" stop-color="#e3f5fb"/></linearGradient></defs>
    <rect width="1000" height="560" fill="url(#himmel)"/>
    ${wolke(420, 80, 1)}${wolke(640, 120, 0.75)}${wolke(160, 70, 0.7)}
    <path d="M0 250 Q160 200 330 240 T680 230 T1000 236 L1000 560 L0 560 Z" fill="#b5dc8a"/>
    <path d="M0 300 Q250 270 520 300 T1000 292 L1000 560 L0 560 Z" fill="#94cd60"/>
    <path d="M150 393 Q140 450 220 500 Q290 545 270 560 L340 560 Q350 520 290 480 Q210 430 200 393 Z" fill="#d9b382" opacity="0.8"/>
    ${zaun}
    <ellipse cx="482" cy="514" rx="64" ry="13" fill="#8a5a35" opacity="0.45"/>
    <ellipse cx="660" cy="484" rx="108" ry="40" fill="#5bb8e6"/><ellipse cx="660" cy="480" rx="92" ry="30" fill="#7fcdf2"/>
    <rect x="28" y="420" width="128" height="62" rx="16" fill="#e9c46a"/>
    ${[48, 72, 96, 120].map((x) => `<path d="M${x} 424 L${x} 478" stroke="#d4a84b" stroke-width="3"/>`).join("")}
`;
}

// ===========================================================================
// Zuhause: ein Puppenhaus im Schnitt – oben das Schlafzimmer, unten die Stube
// ===========================================================================
const HAUT = "#f2c7a5";
function babyKopf() {
  return `<circle cx="0" cy="0" r="17" fill="${HAUT}"/>
    <path d="M-15 -6 Q-12 -20 0 -19 Q12 -20 15 -6 Q8 -12 0 -12 Q-8 -12 -15 -6 Z" fill="#2b2f38"/>
    <path d="M-2 -18 q4 -8 8 -2" stroke="#2b2f38" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-9 1 q3 3 6 0 M3 1 q3 3 6 0" stroke="${DUNKEL}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="-10" cy="7" r="3" fill="#ef9a9a" opacity="0.6"/><circle cx="10" cy="7" r="3" fill="#ef9a9a" opacity="0.6"/>
    <path d="M-3 10 q3 2 6 0" stroke="${DUNKEL}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
}
function menschOder(art, gross, ersatz) {
  const m = window.LernappBauMenschen;
  if (m?.tier) return m.tier(art, { gross, variante: 7 });
  return ersatz;
}
const HAUS_DING = {
  door: () => `<rect x="-36" y="-82" width="72" height="164" rx="6" fill="#a8743f"/>
    <rect x="-28" y="-74" width="56" height="148" rx="4" fill="#c08a55"/>
    <rect x="-20" y="-64" width="40" height="34" rx="3" fill="#cfeefa"/>
    <rect x="-20" y="-18" width="40" height="40" rx="3" fill="#b07a45"/><rect x="-20" y="30" width="40" height="36" rx="3" fill="#b07a45"/>
    <circle cx="20" cy="6" r="5" fill="#ffd166"/>`,
  window: () => `<rect x="-72" y="-52" width="144" height="104" rx="8" fill="#ffffff"/>
    <rect x="-64" y="-44" width="128" height="88" rx="4" fill="#bfe6f5"/>
    <circle cx="36" cy="-20" r="12" fill="#ffe27a"/>
    <path d="M-64 30 Q-20 10 20 26 T64 22 V44 H-64 Z" fill="#94cd60"/>
    <rect x="-3" y="-44" width="6" height="88" fill="#ffffff"/><rect x="-64" y="-3" width="128" height="6" fill="#ffffff"/>
    <path d="M-76 -56 L-50 -56 Q-60 0 -72 56 L-76 56 Z" fill="#ef6fa8"/><path d="M76 -56 L50 -56 Q60 0 72 56 L76 56 Z" fill="#ef6fa8"/>
    <rect x="-80" y="52" width="160" height="8" rx="3" fill="#ffffff"/>`,
  bed: () => `<rect x="-118" y="-58" width="20" height="92" rx="6" fill="#8a5a35"/><rect x="100" y="-28" width="16" height="62" rx="6" fill="#8a5a35"/>
    <rect x="-104" y="-14" width="212" height="30" rx="8" fill="#ffffff"/>
    <rect x="-56" y="-24" width="160" height="40" rx="10" fill="#3a7bd5"/>
    ${[-40, -10, 20, 50, 80].map((x) => `<circle cx="${x}" cy="-4" r="5" fill="#ffd166" opacity="0.9"/>`).join("")}
    <ellipse cx="-80" cy="-18" rx="24" ry="11" fill="#f4f6f9"/>
    <rect x="-108" y="16" width="216" height="10" rx="3" fill="#8a5a35"/>
    <rect x="-108" y="24" width="10" height="16" fill="#8a5a35"/><rect x="98" y="24" width="10" height="16" fill="#8a5a35"/>`,
  table: () => `<rect x="-78" y="-38" width="156" height="12" rx="4" fill="#8a5a35"/>
    <rect x="-70" y="-26" width="10" height="64" rx="3" fill="#a0612f"/><rect x="60" y="-26" width="10" height="64" rx="3" fill="#a0612f"/>
    <rect x="-70" y="-28" width="140" height="6" fill="#6d4628"/>`,
  chair: () => `<rect x="-24" y="-64" width="9" height="104" rx="3" fill="#a0612f"/>
    <rect x="-24" y="-64" width="40" height="9" rx="3" fill="#a0612f"/><rect x="-24" y="-44" width="40" height="7" rx="3" fill="#b8763d"/>
    <rect x="-24" y="-4" width="52" height="10" rx="3" fill="#8a5a35"/>
    <rect x="20" y="4" width="8" height="36" rx="3" fill="#a0612f"/>`,
  sofa: () => `<rect x="-104" y="-62" width="208" height="54" rx="20" fill="#c8423b"/>
    <rect x="-116" y="-34" width="30" height="62" rx="14" fill="#b23a34"/><rect x="86" y="-34" width="30" height="62" rx="14" fill="#b23a34"/>
    <rect x="-90" y="-18" width="180" height="40" rx="12" fill="#d9534f"/>
    <path d="M0 -16 V20" stroke="#b23a34" stroke-width="3"/>
    <rect x="-100" y="26" width="8" height="12" fill="#6d4628"/><rect x="92" y="26" width="8" height="12" fill="#6d4628"/>`,
  lamp: () => `<ellipse cx="0" cy="-24" rx="40" ry="12" fill="#ffd166" opacity="0.35"/>
    <path d="M-26 -10 L-16 -48 L16 -48 L26 -10 Z" fill="#ffd166"/>
    <rect x="-3" y="-10" width="6" height="40" fill="#8a5a35"/>
    <ellipse cx="0" cy="32" rx="18" ry="6" fill="#8a5a35"/>`,
  clock: () => `<circle r="36" fill="#ffffff" stroke="#8a5a35" stroke-width="7"/>
    ${Array.from({ length: 12 }, (_, k) => `<rect x="-1.6" y="-29" width="3.2" height="${k % 3 ? 4 : 8}" fill="${DUNKEL}" transform="rotate(${k * 30})"/>`).join("")}
    <path d="M0 0 L0 -20 M0 0 L14 6" stroke="${DUNKEL}" stroke-width="4" stroke-linecap="round"/>
    <circle r="3.5" fill="#e8543f"/>`,
  tv: () => `<rect x="-64" y="-50" width="128" height="86" rx="8" fill="#2b2f38"/>
    <rect x="-56" y="-42" width="112" height="70" rx="4" fill="#3d4452"/>
    <path d="M-44 -34 L-24 -34 L-40 0 Z" fill="#ffffff" opacity="0.12"/>
    <circle cx="48" cy="30" r="2.5" fill="#e8543f"/>
    <path d="M-20 -50 L-34 -74 M20 -50 L34 -74" stroke="#2b2f38" stroke-width="3" stroke-linecap="round"/>
    <rect x="-30" y="36" width="8" height="10" fill="#2b2f38"/><rect x="22" y="36" width="8" height="10" fill="#2b2f38"/>`,
  mom: () => menschOder("m_frau", 1.3, `<circle cx="0" cy="-130" r="22" fill="${HAUT}"/><rect x="-22" y="-108" width="44" height="80" rx="16" fill="#ef6fa8"/><rect x="-18" y="-30" width="12" height="30" fill="#3a3f4a"/><rect x="6" y="-30" width="12" height="30" fill="#3a3f4a"/>`),
  dad: () => menschOder("m_mann", 1.36, `<circle cx="0" cy="-140" r="23" fill="${HAUT}"/><rect x="-24" y="-116" width="48" height="86" rx="16" fill="#3a7bd5"/><rect x="-18" y="-32" width="14" height="32" fill="#3a3f4a"/><rect x="4" y="-32" width="14" height="32" fill="#3a3f4a"/>`),
  baby: () => `<g>${babyKopf()}</g><text x="22" y="-14" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="14" fill="#5d6882">z</text>`,
  teddy: () => `<circle cx="-16" cy="-44" r="8" fill="#a0612f"/><circle cx="16" cy="-44" r="8" fill="#a0612f"/>
    <ellipse cx="0" cy="0" rx="22" ry="20" fill="#a0612f"/>
    <circle cx="0" cy="-30" r="18" fill="#b8763d"/>
    <circle cx="-16" cy="-44" r="4" fill="#d9a46c"/><circle cx="16" cy="-44" r="4" fill="#d9a46c"/>
    <ellipse cx="0" cy="-25" rx="8" ry="6" fill="#e3b07a"/><circle cx="0" cy="-27" r="2.6" fill="${DUNKEL}"/>
    <circle cx="-6" cy="-34" r="2.2" fill="${DUNKEL}"/><circle cx="6" cy="-34" r="2.2" fill="${DUNKEL}"/>
    <ellipse cx="0" cy="2" rx="12" ry="11" fill="#d9a46c"/>
    <ellipse cx="-20" cy="-6" rx="7" ry="11" fill="#a0612f" transform="rotate(25 -20 -6)"/><ellipse cx="20" cy="-6" rx="7" ry="11" fill="#a0612f" transform="rotate(-25 20 -6)"/>
    <ellipse cx="-12" cy="18" rx="9" ry="6" fill="#a0612f"/><ellipse cx="12" cy="18" rx="9" ry="6" fill="#a0612f"/>
    <path d="M-8 -14 L0 -10 L8 -14 L8 -6 L0 -10 L-8 -6 Z" fill="#e8543f"/>`,
};

// ===========================================================================
// Die Küche
// ===========================================================================
const KUECHE_DING = {
  fridge: () => `<rect x="-70" y="-182" width="140" height="364" rx="16" fill="#eef3f8" stroke="#c3cad6" stroke-width="3"/>
    <path d="M-70 -62 H70" stroke="#c3cad6" stroke-width="3"/>
    <rect x="48" y="-160" width="8" height="70" rx="4" fill="#9aa3b2"/><rect x="48" y="-40" width="8" height="90" rx="4" fill="#9aa3b2"/>
    <circle cx="-30" cy="-140" r="8" fill="#e8543f"/><circle cx="-6" cy="-120" r="7" fill="#3fbf74"/><rect x="-44" y="-112" width="28" height="22" rx="3" fill="#ffd166" transform="rotate(-8 -30 -101)"/>`,
  banana: () => `<path d="M-36 -10 Q-20 26 30 14 Q40 10 38 4 Q-6 14 -24 -18 Z" fill="#ffd23f" stroke="#e0b000" stroke-width="2"/>
    <path d="M-30 -18 Q-10 20 36 0 Q44 -4 40 -10 Q0 4 -18 -26 Z" fill="#ffe066" stroke="#e0b000" stroke-width="2"/>
    <path d="M-30 -18 l-6 -6 M-24 -18 l-4 -8" stroke="#8a5a35" stroke-width="3" stroke-linecap="round"/>`,
  bread: () => `<path d="M-48 18 V-8 Q-48 -34 0 -34 Q48 -34 48 -8 V18 Q48 24 42 24 H-42 Q-48 24 -48 18 Z" fill="#d49a55"/>
    <path d="M-48 -4 Q-48 -30 0 -30 Q48 -30 48 -4" fill="#e3b07a"/>
    <path d="M-26 -22 l10 12 M-4 -24 l10 12 M18 -22 l10 12" stroke="#b07a45" stroke-width="3" stroke-linecap="round"/>`,
  milk: () => `<path d="M-24 -48 L0 -68 L24 -48 Z" fill="#dfe6ef"/><rect x="-24" y="-48" width="48" height="96" rx="3" fill="#ffffff" stroke="#c3cad6" stroke-width="2"/>
    <rect x="-24" y="-14" width="48" height="40" fill="#3a7bd5"/>
    <text x="0" y="12" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="15" fill="#ffffff">${window.LernappSprachwagen?.aktiv?.art?.().MILCH_SCHILD || "MILK"}</text>
    <ellipse cx="-10" cy="-30" rx="6" ry="4" fill="${DUNKEL}"/><ellipse cx="9" cy="-34" rx="4" ry="3" fill="${DUNKEL}"/>`,
  cheese: () => `<path d="M-48 22 L-48 -12 L40 -30 L48 22 Z" fill="#f6c945"/><path d="M-48 -12 L40 -30 L48 -22 L-40 -2 Z" fill="#ffe07a"/>
    <circle cx="-26" cy="8" r="6" fill="#e0a92e"/><circle cx="6" cy="12" r="4" fill="#e0a92e"/><circle cx="24" cy="-2" r="5" fill="#e0a92e"/>`,
  egg: () => `<ellipse cx="0" cy="-22" rx="18" ry="24" fill="#fff8ea" stroke="#e9d8b4" stroke-width="2"/>
    <path d="M-22 -4 H22 L16 22 H-16 Z" fill="#e8543f"/><rect x="-14" y="22" width="28" height="6" rx="3" fill="#b23a34"/>`,
  cake: () => `<rect x="-54" y="-30" width="108" height="56" rx="8" fill="#ef6fa8"/>
    <path d="M-54 -20 Q-40 -8 -27 -20 T0 -20 T27 -20 T54 -20 V-30 H-54 Z" fill="#ffffff"/>
    <rect x="-60" y="24" width="120" height="8" rx="4" fill="#dfe6ef"/>
    ${[-30, 0, 30].map((x) => `<rect x="${x - 3}" y="-56" width="6" height="26" rx="2" fill="#3a7bd5"/><path d="M${x} -66 q6 6 0 12 q-6 -6 0 -12z" fill="#ffd166"/>`).join("")}
    <circle cx="-30" cy="6" r="4" fill="#ffd166"/><circle cx="0" cy="10" r="4" fill="#3fbf74"/><circle cx="30" cy="6" r="4" fill="#3a7bd5"/>`,
  pancakes: () => `<ellipse cx="0" cy="22" rx="66" ry="12" fill="#ffffff" stroke="#c3cad6" stroke-width="2"/>
    ${[12, 0, -12].map((y) => `<ellipse cx="0" cy="${y}" rx="50" ry="12" fill="#d49a55"/><ellipse cx="0" cy="${y - 3}" rx="48" ry="9" fill="#e3b07a"/>`).join("")}
    <rect x="-10" y="-26" width="20" height="12" rx="3" fill="#fff2a8"/>
    <path d="M-30 -14 Q-20 0 -34 10 M20 -14 Q32 -2 24 12" stroke="#b5651d" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>`,
  cookie: () => `<circle r="30" fill="#c98b4f"/><circle r="26" fill="#d9a46c"/>
    ${[[-10, -10], [8, -14], [12, 6], [-6, 12], [-16, 4], [2, -2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#5b3a29"/>`).join("")}`,
  juice: () => `<path d="M-22 -40 L22 -40 L17 34 H-17 Z" fill="#e9f6fd" stroke="#b9d9ea" stroke-width="2"/>
    <path d="M-20 -22 L20 -22 L16 30 H-16 Z" fill="#f5a623"/>
    <rect x="6" y="-62" width="5" height="44" rx="2" fill="#e8543f" transform="rotate(12 8 -40)"/>
    <circle cx="-14" cy="-28" r="7" fill="#ffd166" stroke="#f5a623" stroke-width="2"/>`,
  cup: () => `<path d="M-26 -26 H26 V16 Q26 30 12 30 H-12 Q-26 30 -26 16 Z" fill="#3a7bd5"/>
    <path d="M26 -14 Q46 -14 44 2 Q42 16 26 14" stroke="#3a7bd5" stroke-width="7" fill="none"/>
    <ellipse cx="0" cy="-26" rx="26" ry="6" fill="#2f63bd"/><ellipse cx="0" cy="-26" rx="21" ry="4" fill="#ffffff"/>
    <path d="M-8 -40 q-6 -10 0 -18 M8 -40 q-6 -10 0 -18" stroke="#c3cad6" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  plate: () => `<ellipse cx="0" cy="0" rx="58" ry="16" fill="#ffffff" stroke="#c3cad6" stroke-width="3"/>
    <ellipse cx="0" cy="-1" rx="36" ry="9" fill="#f4f6f9" stroke="#dfe4ec" stroke-width="2"/>`,
  spoon: () => `<g transform="rotate(-30)"><ellipse cx="0" cy="-26" rx="12" ry="17" fill="#c3cad6"/><ellipse cx="-2" cy="-28" rx="6" ry="9" fill="#e9edf3"/>
    <rect x="-3.5" y="-10" width="7" height="50" rx="3.5" fill="#c3cad6"/></g>`,
};

// Weitere Dinge: aus den Geschichten
const EXTRA_DING = {
  box: () => `<path d="M-48 -26 L48 -26 L42 30 H-42 Z" fill="#d6a46f"/><path d="M-48 -26 L-60 -44 L-8 -44 L0 -26 Z" fill="#c08a55"/><path d="M48 -26 L60 -44 L8 -44 L0 -26 Z" fill="#c08a55"/>
    <path d="M-30 0 H30" stroke="#b07a45" stroke-width="3"/>`,
};
Object.assign(DING, HAUS_DING, KUECHE_DING, EXTRA_DING);

// Wo die Dinge in den Bildern stehen: x, y, Massstab, Ecke für den Stern (lokal)
const ORTE_HAUS = {
  window: [230, 190, 0.9, [70, -50]],
  bed: [470, 262, 1.0, [-108, -68]],
  baby: [395, 238, 1.0, [20, -20]],
  teddy: [552, 238, 0.9, [24, -50]],
  lamp: [655, 230, 1.0, [30, -50]],
  dad: [790, 300, 1.0, [36, -170]],
  clock: [560, 360, 0.75, [30, -34]],
  door: [165, 432, 1.0, [36, -80]],
  tv: [300, 440, 0.85, [60, -48]],
  mom: [405, 512, 1.0, [34, -160]],
  table: [560, 478, 0.9, [76, -40]],
  chair: [680, 476, 0.9, [30, -64]],
  sofa: [772, 470, 0.85, [110, -60]],
};
const ORTE_KUECHE = {
  fridge: [120, 300, 1.0, [66, -180]],
  bread: [270, 286, 0.95, [46, -34]],
  milk: [360, 262, 0.95, [24, -66]],
  juice: [440, 276, 0.9, [22, -40]],
  cup: [520, 284, 0.95, [30, -30]],
  banana: [620, 290, 1.0, [40, -24]],
  egg: [720, 284, 0.95, [20, -46]],
  cheese: [830, 290, 1.0, [46, -30]],
  pancakes: [470, 412, 1.0, [60, -26]],
  spoon: [590, 432, 0.8, [16, -40]],
  plate: [690, 422, 1.0, [56, -14]],
  cake: [790, 400, 0.9, [56, -64]],
  cookie: [900, 412, 0.8, [28, -28]],
};
const ORTE = { farm: HOF, house: ORTE_HAUS, kitchen: ORTE_KUECHE };

function hausHintergrund() {
  return `<rect width="1000" height="560" fill="#bfe6f5"/>
    <rect x="0" y="512" width="1000" height="48" fill="#94cd60"/>
    <path d="M90 118 L500 20 L910 118 Z" fill="#c8423b"/><path d="M90 118 L500 20 L910 118 L910 130 L90 130 Z" fill="#8f2d29" opacity="0.35"/>
    <rect x="110" y="118" width="780" height="396" fill="#f6e3c4"/>
    <rect x="110" y="300" width="780" height="14" fill="#a0612f"/>
    <rect x="110" y="286" width="780" height="14" fill="#c08a55"/>
    <rect x="110" y="500" width="780" height="14" fill="#a0612f"/>
    <rect x="110" y="314" width="780" height="186" fill="#fbecd3"/>
    ${[160, 240, 320, 400, 480, 560, 640, 720, 800].map((x) => `<rect x="${x}" y="130" width="2" height="156" fill="#ecd3ad"/>`).join("")}
    <rect x="96" y="118" width="14" height="396" fill="#8a5a35"/><rect x="890" y="118" width="14" height="396" fill="#8a5a35"/>
    <ellipse cx="470" cy="286" rx="150" ry="10" fill="#e8543f" opacity="0.35"/>
    <rect x="610" y="236" width="90" height="50" rx="6" fill="#a0612f"/><rect x="616" y="250" width="78" height="4" fill="#8a5a35"/>
    <rect x="240" y="470" width="120" height="30" rx="4" fill="#a0612f"/>
    <ellipse cx="620" cy="500" rx="200" ry="10" fill="#3a7bd5" opacity="0.3"/>`;
}
function kuecheHintergrund() {
  return `<rect width="1000" height="560" fill="#fff4dc"/>
    ${Array.from({ length: 10 }, (_, i) => Array.from({ length: 3 }, (_, k) => `<rect x="${210 + i * 76}" y="${206 + k * 26}" width="72" height="22" rx="2" fill="${(i + k) % 2 ? "#e9f6fd" : "#ffffff"}"/>`).join("")).join("")}
    <rect x="430" y="70" width="230" height="130" rx="10" fill="#ffffff"/><rect x="440" y="80" width="210" height="110" rx="6" fill="#bfe6f5"/>
    <circle cx="610" cy="110" r="14" fill="#ffe27a"/><path d="M440 160 Q520 130 600 152 T650 150 V190 H440 Z" fill="#94cd60"/>
    <rect x="543" y="80" width="5" height="110" fill="#ffffff"/>
    <rect x="200" y="300" width="780" height="14" rx="4" fill="#b07a45"/>
    <rect x="210" y="314" width="760" height="170" fill="#e9c48f"/>
    ${[210, 400, 590, 780].map((x) => `<rect x="${x + 8}" y="324" width="174" height="150" rx="6" fill="#d9ad6e"/><circle cx="${x + 160}" cy="400" r="5" fill="#8a5a35"/>`).join("")}
    <rect x="0" y="484" width="1000" height="76" fill="#c98f57"/>
    ${[0, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => `<path d="M${x} 484 L${x - 30} 560" stroke="#b07a45" stroke-width="2"/>`).join("")}
    <rect x="380" y="420" width="560" height="14" rx="6" fill="#e8543f"/>
    <rect x="400" y="434" width="12" height="80" fill="#b23a34"/><rect x="908" y="434" width="12" height="80" fill="#b23a34"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${380 + i * 80}" y="420" width="40" height="14" fill="#ffffff" opacity="0.5"/>`).join("")}`;
}
const HINTERGRUND = { farm: hofHintergrund, house: hausHintergrund, kitchen: kuecheHintergrund };

// ---------------------------------------------------------------------------
// Die gemalten Bilder
// ---------------------------------------------------------------------------
// Wimmelbilder und Bildgeschichten gibt es auch gemalt (bilder/englisch/,
// welt-farm.webp, welt-farm-klein.webp, geschichte-ball-1.webp …). Wo im
// Gemälde was steht, trägt englisch-gemalt.js ein:
//   GEMALT.welten[welt].orte[id]      [x, y, m, bx, by, bw, bh] – die
//                                     Zeichnung des Dings, so verschoben und
//                                     vergrössert, dass sie sich mit dem Ding im
//                                     Gemälde deckt, und sein Rahmen
//   GEMALT.geschichten[g][i].woerter  { wort: [[bx, by, bw, bh], …] }
// Über dem Gemälde liegt, was sich antippen lässt: die Zeichnung des Dings
// (unsichtbar) und eine Ellipse über seinem Rahmen. Beim Antippen springt ein
// weich ausgeschnittenes Stück des Gemäldes hervor. Lädt das Gemälde nicht,
// zeigt die Szene ihre Zeichnung – die Dinge stehen dann dort, wo sie im
// Gemälde wären –, die Geschichte die gezeichneten Bilder.
const GEMALT = { welten: {}, geschichten: {}, ordner: "bilder/englisch" };
const gemaltBild = (name) => `${GEMALT.ordner}/${name}.webp`;
const r1 = (v) => Math.round(v * 10) / 10;
if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (!t?.classList?.contains("en-gemaelde")) return;
    // Ein Bild, das nicht lädt, malt Chromium als verwaschene Fläche: weg damit,
    // und die Zeichnung direkt davor (.en-ersatz) zeigt sich.
    t.setAttribute("display", "none");
    const davor = t.previousElementSibling;
    if (davor?.classList?.contains("en-ersatz")) davor.style.display = "inline";
    t.closest("svg")?.classList.add("ohne-gemaelde");
  }, true);
}
// Solange ein Gemälde lädt, steht eine ruhige Fläche da – die Zeichnung
// (.en-ersatz) zeigt sich erst, wenn es nicht lädt, sonst blitzt sie auf.
const PLATZ = "#eef3f1";
const ersatz = (zeichnung, b, h, platz = PLATZ) => `<rect width="${b}" height="${h}" fill="${platz}"/><g class="en-ersatz">${zeichnung}</g>`;
// Vorladen: Wer eine Szene oder Geschichte öffnet, lädt ihre Gemälde zuerst
// (höchstens ms Millisekunden), damit sie von Anfang an gemalt dasteht.
const geladen = new Set();
//   gemaeldeVon("welt", id), ("geschichte", id), ("woerterbuch", [Sticker-Ids])
function gemaeldeVon(art, id) {
  if (art === "welt") return GEMALT.welten[id] ? [gemaltBild(`welt-${id}`)] : [];
  if (art === "woerterbuch") {
    return [
      ...(GEMALT.woerterbuch ? [gemaltBild("woerterbuch")] : []),
      ...[...(GEMALT.aufnaeher || [])].map((w) => gemaltBild(`aufnaeher/${w}`)),
      ...(id || []).filter((x) => GEMALT.sticker?.has(x)).map(stickerBild),
    ];
  }
  const G = geschichtenGemalt();
  return (G.geschichten[id] || []).map((_, i) => `${G.ordner}/geschichte-${id}-${i + 1}.webp`);
}
// Der Sticker eines Worts – das Maskottchen eines anderen Sprachwagens hat
// seinen eigenen (aktiv.maskottchen.sticker: { raccoon: "bilder/…webp" }).
const stickerBild = (id) => fremdesMaskottchen()?.sticker?.[id] || gemaltBild(`sticker/${id}`);
// Auf den gemalten Geschichten steht das Maskottchen: Ein anderer Sprachwagen
// hat seine eigenen (aktiv.gemalt() → { geschichten, ordner },
// franzoesisch-gemalt.js) – und solange eine dort fehlt, die Zeichnung.
const geschichtenGemalt = () => (typeof window !== "undefined" && window.LernappSprachwagen?.aktiv?.gemalt?.()) || GEMALT;
const istGeladen = (bilder) => bilder.every((u) => geladen.has(u));
function vorladen(bilder, ms = 1500) {
  const fehlen = bilder.filter((u) => !geladen.has(u));
  if (!fehlen.length || typeof Image === "undefined") return Promise.resolve(true);
  const eines = (u) => new Promise((fertig) => {
    const bild = new Image();
    const da = () => { geladen.add(u); fertig(true); };
    bild.onload = () => (bild.decode ? bild.decode().then(da, da) : da());
    bild.onerror = () => fertig(false);
    bild.src = u;
  });
  return Promise.race([
    Promise.all(fehlen.map(eines)).then((r) => r.every(Boolean)),
    new Promise((fertig) => setTimeout(() => fertig(false), ms)),
  ]);
}
const WEICH = `<radialGradient id="en-weich"><stop offset="0.6" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>`;
// Das Gemälde selbst und als Muster für die Stücke, die hervorspringen.
function gemaelde(href, muster, b, h) {
  return {
    defs: `${WEICH}<pattern id="${muster}" patternUnits="userSpaceOnUse" width="${b}" height="${h}"><image href="${href}" width="${b}" height="${h}" preserveAspectRatio="xMidYMid slice"/></pattern>`,
    bild: `<image class="en-gemaelde" href="${href}" width="${b}" height="${h}" preserveAspectRatio="xMidYMid slice" pointer-events="none"/>`,
  };
}
// Was über einem Rahmen im Gemälde liegt: das Stück, das beim Antippen
// hervorspringt (sonst ausgeblendet), und die Fläche, die den Tipp annimmt.
function tippflaeche(muster, maske, [bx, by, bw, bh]) {
  const cx = r1(bx + bw / 2), cy = r1(by + bh / 2);
  const rx = r1(bw * 0.66), ry = r1(bh * 0.66);
  return `<mask id="${maske}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#en-weich)"/></mask>
      <ellipse class="en-ausschnitt" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${muster})" mask="url(#${maske})"/>
      <ellipse class="en-treffer" cx="${cx}" cy="${cy}" rx="${r1(bw * 0.56)}" ry="${r1(bh * 0.56)}" fill="#000" fill-opacity="0"/>`;
}

// Eine Szene: Hintergrund und die Dinge, jedes in einer Gruppe mit data-ding.
//   markiert(id)  ob am Ding ein Stern steht
//   gezeichnet    die Zeichnung statt des Gemäldes (What's missing? nimmt ein
//                 Ding aus dem Bild – das geht nur in der Zeichnung)
function szene(welt, { markiert = () => false, gezeichnet = false } = {}) {
  const orte = ORTE[welt] || HOF;
  const g = gezeichnet ? null : GEMALT.welten[welt] || null;
  let s = HINTERGRUND[welt] ? HINTERGRUND[welt]() : "";
  let defs = `<linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8f0"/><stop offset="1" stop-color="#e3f5fb"/></linearGradient>${window.LernappBauTiere?.defs?.() || ""}`;
  const muster = `en-p-${welt}`;
  if (g) {
    const bild = gemaelde(gemaltBild(`welt-${welt}`), muster, 1000, 560);
    defs += bild.defs;
    s = `${ersatz(s, 1000, 560)}${bild.bild}`;
  }
  // Im Gemälde liegen die kleinen Dinge oben: Wer auf den Apfel tippt, trifft
  // nicht den Baum.
  const flaeche = (id) => { const o = g?.orte?.[id]; return o ? o[5] * o[6] : Infinity; };
  const reihe = Object.keys(orte);
  if (g) reihe.sort((a, b) => flaeche(b) - flaeche(a));
  for (const id of reihe) {
    const gemalt = g?.orte?.[id];
    const [x, y, m] = gemalt || orte[id];
    const ecke = orte[id][3];
    const mx = x + ecke[0] * m;
    const my = y + ecke[1] * m;
    s += `<g class="en-ding${gemalt ? " en-gemalt-ding" : ""}" data-ding="${id}" tabindex="0" role="button">
      <g${gemalt ? ' class="en-zeichnung"' : ""} transform="translate(${x} ${y}) scale(${m})">${DING[id] ? DING[id]() : ""}</g>${gemalt ? tippflaeche(muster, `en-m-${welt}-${id}`, gemalt.slice(3)) : ""}
      <g class="en-marke">${markiert(id) ? stern(mx, my, 12) : ""}</g>
      <g class="en-hinweis" opacity="0">${stern(mx, my, 9, "en-funkel")}</g>
    </g>`;
  }
  if (welt === "farm" && !g) s += `<text x="40" y="384" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="22" fill="#5d6882" pointer-events="none">z z</text>`;
  return `<svg viewBox="0 0 1000 560" class="en-szene-svg${g ? " ist-gemalt" : ""}" aria-hidden="false" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${s}</svg>`;
}
// Wo der Stern an einem Ding steht – im Gemälde, wenn es eines gibt.
const markeAn = (welt, id, { gezeichnet = false } = {}) => {
  const o = ORTE[welt]?.[id];
  if (!o) return null;
  const [x, y, m] = (!gezeichnet && GEMALT.welten[welt]?.orte?.[id]) || o;
  return { x: x + o[3][0] * m, y: y + o[3][1] * m };
};

// ===========================================================================
// Sticker und Aufnäher
// ===========================================================================
const STICKER = {
  ...Object.fromEntries(Object.entries(STICKER_MASS).map(([k, v]) => [k, [v, STICKER_DY[k] || 0]])),
  door: [0.26, 0], window: [0.3, 0], bed: [0.24, 6], table: [0.32, 4], chair: [0.38, 8], sofa: [0.26, 8], lamp: [0.5, 8], clock: [0.6, 0],
  tv: [0.36, 6], mom: [0.26, 62], dad: [0.24, 62], baby: [0.9, 2], teddy: [0.6, 12],
  fridge: [0.13, 0], banana: [0.6, 0], bread: [0.48, 2], milk: [0.42, 4], cheese: [0.5, 2], egg: [0.6, 8], cake: [0.38, 10], pancakes: [0.4, 0],
  cookie: [0.7, 0], juice: [0.5, 6], cup: [0.55, 4], plate: [0.44, 0], spoon: [0.6, 4], box: [0.42, 4],
};
//   zustand  zu | gehoert | erkannt | sicher
function sticker(id, x, y, r, zustand) {
  const [m, dy] = STICKER[id] || [0.4, 0];
  const bild = id === "apple" ? DING.apple(true) : id === "raccoon" ? `<g transform="scale(1.25)">${roccoKopf("froh", { muetze: false })}</g>` : DING[id] ? DING[id]() : "";
  const farbe = zustand !== "zu";
  let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="${farbe ? "#eaf6ff" : "#ece7dc"}" stroke="${zustand === "sicher" ? "#f4b400" : "#ffffff"}" stroke-width="${zustand === "sicher" ? 5 : 4}"/>`;
  const zeichnung = `<g transform="translate(${x} ${y + dy * m}) scale(${m * r / 36})" ${farbe ? "" : 'opacity="0.18" filter="url(#en-grau)"'}>${bild}</g>`;
  if (GEMALT.sticker?.has(id)) {
    // Gemalt (bilder/englisch/sticker/), darunter die Zeichnung, falls es nicht lädt.
    const g = r * 1.56;
    s += `<g class="en-ersatz">${zeichnung}</g><image class="en-gemaelde" href="${stickerBild(id)}" x="${r1(x - g / 2)}" y="${r1(y - g / 2)}" width="${r1(g)}" height="${r1(g)}"${farbe ? "" : ' opacity="0.22" filter="url(#en-grau)"'}/>`;
  } else s += zeichnung;
  if (zustand === "erkannt" || zustand === "sicher") s += stern(x + r * 0.72, y - r * 0.72, Math.max(7, r * 0.28));
  return s;
}
// Ein Aufnäher je Welt, gestickt. anteil: wie viel schon erkannt ist (0–1);
// voll: alle erkannt; gold: alle sitzen.
const AUFNAEHER_FARBE = { farm: "#3a7bd5", house: "#e8543f", kitchen: "#3fbf74" };
const AUFNAEHER_BILD = { farm: "barn", house: "door", kitchen: "cake" };
function aufnaeher(welt, x, y, r, { anteil = 0, voll = false, gold = false } = {}) {
  const farbe = voll ? AUFNAEHER_FARBE[welt] || "#6c5ce7" : "#d9d2c3";
  const umfang = 2 * Math.PI * r;
  const bildId = AUFNAEHER_BILD[welt];
  const [m] = STICKER[bildId] || [0.3];
  const fortschritt = voll ? "" : `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#f4b400" stroke-width="${Math.max(3, r * 0.16)}" stroke-dasharray="${(anteil * umfang).toFixed(1)} ${umfang.toFixed(1)}" transform="rotate(-90 ${x} ${y})"/>`;
  const goldRand = gold ? `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="none" stroke="#f4b400" stroke-width="4"/>` : "";
  const zeichnung = `<circle cx="${x}" cy="${y}" r="${r}" fill="${farbe}"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.8}" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 4"/>
    <g transform="translate(${x} ${y + 2}) scale(${(m * r) / 44})" ${voll ? "" : 'opacity="0.45"'}>${DING[bildId] ? DING[bildId]() : ""}</g>`;
  if (GEMALT.aufnaeher?.has(welt)) {
    // Gestickt gemalt (bilder/englisch/aufnaeher/); was noch fehlt, bleibt grau.
    const g = r * 2.2;
    return `<g opacity="${voll || anteil > 0 ? 1 : 0.6}">
    <g class="en-ersatz">${zeichnung}</g><image class="en-gemaelde" href="${gemaltBild(`aufnaeher/${welt}`)}" x="${r1(x - g / 2)}" y="${r1(y - g / 2)}" width="${r1(g)}" height="${r1(g)}"${voll ? "" : ' opacity="0.5" filter="url(#en-grau)"'}/>
    ${fortschritt}${goldRand}
  </g>`;
  }
  return `<g opacity="${voll || anteil > 0 ? 1 : 0.6}">
    ${zeichnung}
    ${fortschritt}${goldRand}
  </g>`;
}

// ===========================================================================
// Die Bildgeschichten: vier Bilder je Geschichte, je 472 × 204
// ===========================================================================
const tb = (attr, inhalt) => `<g class="en-wort" ${attr} tabindex="0" role="button">${inhalt}</g>`;
function bildHintergrund(art) {
  if (art === "haus") return `<rect width="472" height="204" fill="#f6e3c4"/><rect y="170" width="472" height="34" fill="#c08a55"/>${[60, 160, 260, 360].map((x) => `<rect x="${x}" y="0" width="2" height="170" fill="#ecd3ad"/>`).join("")}`;
  if (art === "kueche") return `<rect width="472" height="204" fill="#fff4dc"/><rect y="150" width="472" height="12" fill="#b07a45"/><rect y="162" width="472" height="42" fill="#e9c48f"/>`;
  return `<rect width="472" height="204" fill="#cdeefb"/><path d="M0 150 Q120 130 240 146 T472 140 L472 204 L0 204 Z" fill="#94cd60"/>`;
}
const GESCHICHTEN_BILDER = {
  ball: [
    () => `${bildHintergrund()}<g transform="translate(380 194) scale(0.75)">${tb('data-wort="tree"', DING.tree())}</g>
      ${tb('data-wort="raccoon"', `<g transform="translate(180 196) scale(0.95)">${rocco("steh", "froh")}</g>`)}
      ${tb('data-wort="ball"', `<g transform="translate(212 150) scale(0.42)">${DING.ball()}</g>`)}`,
    () => `${bildHintergrund()}${tb('data-wort="raccoon"', `<g transform="translate(170 196) scale(0.95)">${rocco("wirf", "froh")}</g>`)}
      <path d="M200 100 Q250 40 300 52" stroke="#e63946" stroke-width="3" stroke-dasharray="6 7" fill="none"/>
      ${tb('data-wort="ball"', `<g transform="translate(316 46) scale(0.42)">${DING.ball()}</g>`)}
      <path d="M346 26 l14 -10 M350 46 l18 0 M346 66 l14 10" stroke="#e63946" stroke-width="3" stroke-linecap="round"/>`,
    () => `${bildHintergrund()}${tb('data-wort="tree"', `<g transform="translate(320 196) scale(1.05)">${DING.tree()}</g>`)}
      ${tb('data-wort="ball"', `<g transform="translate(338 110) scale(0.38)">${DING.ball()}</g>`)}
      ${tb('data-wort="raccoon"', `<g transform="translate(120 196) scale(0.95)">${rocco("steh", "traurig")}</g>`)}
      <g transform="translate(176 70)"><circle r="20" fill="#ffffff" stroke="#c3c7cf" stroke-width="2"/><text y="9" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="26" fill="#3a7bd5">?</text></g>`,
    () => `${bildHintergrund()}<g transform="translate(412 194) scale(0.7)">${DING.tree()}</g>
      ${tb('data-wort="raccoon"', `<g transform="translate(104 196) scale(0.95)">${rocco("jubel", "freude")}</g>`)}
      ${tb('data-wort="dog"', `<g transform="translate(262 150) scale(1.05)">${DING.dog("spring")}</g>`)}
      <g transform="translate(318 92) scale(0.3)">${DING.ball()}</g>
      <path d="M60 52 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/><path d="M160 34 c-5 -8 -16 -2 -8 6 l8 7 l8 -7 c8 -8 -3 -14 -8 -6z" fill="#ef6fa8"/>`,
  ],
  cat: [
    () => `${bildHintergrund("haus")}${tb('data-wort="raccoon"', `<g transform="translate(200 192) scale(0.95)">${rocco("steh", "hoch")}</g>`)}
      <g transform="translate(290 60)"><circle r="22" fill="#ffffff" stroke="#c3c7cf" stroke-width="2"/><text y="10" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="28" fill="#3a7bd5">?</text></g>
      <g transform="translate(380 120) scale(0.5)" opacity="0.35">${DING.cat()}</g>`,
    () => `${bildHintergrund("haus")}${tb('data-wort="bed"', `<g transform="translate(300 150) scale(1.15)">${DING.bed()}</g>`)}
      <g transform="translate(110 192) scale(0.85)">${rocco("steh", "hoch")}</g>
      <text x="300" y="196" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="22" fill="#8a5a35">?</text>`,
    () => `${bildHintergrund("haus")}${tb('data-wort="sofa"', `<g transform="translate(300 150) scale(1.0)">${DING.sofa()}</g>`)}
      <g transform="translate(96 192) scale(0.85)">${rocco("steh", "hoch")}</g>
      <text x="300" y="98" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="26" fill="#3a7bd5">?</text>`,
    () => `${bildHintergrund("haus")}${tb('data-wort="box"', `<g transform="translate(300 160) scale(1.2)">${DING.box()}</g>`)}
      ${tb('data-wort="cat"', `<g transform="translate(300 112) scale(0.7)">${DING.cat()}</g>`)}
      <g transform="translate(110 192) scale(0.9)">${rocco("jubel", "freude")}</g>
      <path d="M200 40 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/>`,
  ],
  hungry: [
    () => `${bildHintergrund("kueche")}${tb('data-wort="raccoon"', `<g transform="translate(236 196) scale(1.0)">${rocco("steh", "traurig")}</g>`)}
      <path d="M268 140 q8 -4 4 -12 M280 150 q10 -2 8 -12 M284 166 q12 0 12 -10" stroke="#e8543f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text x="320" y="132" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="24" fill="#e8543f">grrr</text>`,
    () => `${bildHintergrund("kueche")}<g transform="translate(180 196) scale(1.0)">${rocco("jubel", "froh")}</g>
      ${tb('data-wort="banana"', `<g transform="translate(330 110) scale(1.1)">${DING.banana()}</g>`)}`,
    () => `${bildHintergrund("kueche")}<g transform="translate(150 196) scale(1.0)">${rocco("steh", "freude")}</g>
      ${tb('data-wort="bread"', `<g transform="translate(290 130) scale(0.9)">${DING.bread()}</g>`)}
      ${tb('data-wort="cheese"', `<g transform="translate(390 136) scale(0.85)">${DING.cheese()}</g>`)}`,
    () => `${bildHintergrund("kueche")}<g transform="translate(140 196) scale(1.05)">${rocco("jubel", "freude")}</g>
      ${tb('data-wort="cake"', `<g transform="translate(330 120) scale(1.15)">${DING.cake()}</g>`)}
      <path d="M240 46 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/>`,
  ],
};
// Ein Bild der Geschichte (472 × 204 + Leiste darunter in der Ansicht) –
// gemalt, wenn es das Gemälde gibt (gezeichnet: die Zeichnung).
const OHNE_TIPP = / class="en-wort" data-wort="[^"]*" tabindex="0" role="button"/g;
function geschichtsBild(geschichte, i, { gezeichnet = false } = {}) {
  const zeichne = GESCHICHTEN_BILDER[geschichte]?.[i];
  const zeichnung = zeichne ? zeichne() : bildHintergrund();
  const G = geschichtenGemalt();
  const g = gezeichnet ? null : G.geschichten[geschichte]?.[i];
  if (!g) return zeichnung;
  const name = `${geschichte}-${i + 1}`;
  const muster = `en-p-${name}`;
  const bild = gemaelde(`${G.ordner}/geschichte-${name}.webp`, muster, 472, 204);
  // Unter dem Gemälde die Zeichnung, ohne Tippstellen: Sie zeigt sich, wenn
  // das Gemälde nicht lädt.
  let s = `<defs>${bild.defs}</defs>${ersatz(zeichnung.replace(OHNE_TIPP, ""), 472, 204)}${bild.bild}`;
  const stellen = Object.entries(g.woerter || {}).flatMap(([wort, rahmen]) => rahmen.map((r, k) => [wort, r, k]));
  stellen.sort((a, b) => b[1][2] * b[1][3] - a[1][2] * a[1][3]);
  for (const [wort, r, k] of stellen) {
    s += `<g class="en-wort en-gemalt-ding" data-wort="${wort}" tabindex="0" role="button">${tippflaeche(muster, `en-m-${name}-${wort}-${k}`, r)}</g>`;
  }
  return s;
}
// Das Titelbild einer Geschichte, für die Auswahl im Regal: welches ihrer
// Bilder (sonst das erste) – gemalt klein, darunter die Zeichnung.
const TITELBILD = { cat: 3, hungry: 3 };
function geschichtsTitelbild(geschichte) {
  const i = TITELBILD[geschichte] ?? 0;
  const zeichnung = geschichtsBild(geschichte, i, { gezeichnet: true });
  const G = geschichtenGemalt();
  const bild = G.geschichten[geschichte]?.[i]
    ? `${ersatz(zeichnung, 472, 204)}<image class="en-gemaelde" href="${G.ordner}/geschichte-${geschichte}-${i + 1}-klein.webp" width="472" height="204" preserveAspectRatio="xMidYMid slice"/>` : zeichnung;
  return `<svg viewBox="0 0 472 204" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${bild}</svg>`;
}

// ===========================================================================
// Der Caboose von innen (1000 × 560)
// ===========================================================================
//   ausbau     wie viele Dinge der Einrichtung da sind (0–15)
//   neuAb      ab welchem die Dinge neu sind (sie leuchten)
//   karte      { titel, bild } – was Rocco vorschlägt
//   aufnaeher  [{ welt, anteil, voll, gold }]
const ESC = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function zimmer({ ausbau = 0, neuAb = Infinity, karte = null, aufnaeher: flicken = [], jukebox = false, telefon = false, post = null } = {}) {
  const ding = (i, id, inhalt) => (ausbau > i ? `<g class="en-ausbau${i >= neuAb ? " is-neu" : ""}" data-ausbau="${id}" tabindex="0" role="button">${inhalt}</g>` : "");
  const ort = (id, inhalt) => `<g class="en-ort en-ort-${id}" data-ort="${id}" tabindex="0" role="button">${inhalt}</g>`;
  let s = "";
  // Wände, Decke, Boden
  s += `<rect width="1000" height="560" fill="#f3d6a4"/>`;
  for (let x = 0; x < 1000; x += 46) s += `<rect x="${x}" y="40" width="2" height="430" fill="#e2bf86"/>`;
  s += `<path d="M0 0 L1000 0 L1000 42 Q500 70 0 42 Z" fill="#b07a45"/>`;
  s += `<rect x="0" y="470" width="1000" height="90" fill="#b98352"/>`;
  for (let x = -20; x < 1000; x += 90) s += `<path d="M${x} 470 L${x - 40} 560" stroke="#a8743f" stroke-width="3"/>`;
  s += `<ellipse cx="420" cy="508" rx="170" ry="26" fill="#e8543f"/><ellipse cx="420" cy="508" rx="140" ry="18" fill="#ffd166"/><ellipse cx="420" cy="508" rx="104" ry="11" fill="#3a7bd5"/>`;
  // Einrichtung, die nicht an einem Ort hängt
  s += ding(8, "pennants", [...Array(12)].map((_, i) => { const x = 130 + i * 32; return `<path d="M${x} 60 L${x + 26} 60 L${x + 13} 84 Z" fill="${["#e8543f", "#ffffff", "#3a7bd5"][i % 3]}"/>`; }).join("") + `<path d="M126 60 L520 60" stroke="#8a5a35" stroke-width="2"/>`);
  s += ding(13, "lights", [...Array(16)].map((_, i) => `<circle class="en-birne en-birne-${i % 3}" cx="${740 + i * 16}" cy="${(70 + 10 * Math.sin(i / 2.5)).toFixed(1)}" r="4" fill="${["#ffd166", "#ef6fa8", "#4fc3f7", "#8bd36b"][i % 4]}"/>`).join(""));
  s += ding(0, "lantern", `<path d="M480 42 L480 92" stroke="#3a3f4a" stroke-width="2"/><rect x="468" y="92" width="24" height="30" rx="5" fill="#3a3f4a"/><rect x="472" y="98" width="16" height="18" rx="3" fill="#ffd166"/>`);
  s += ding(11, "bridge", `<rect x="330" y="78" width="120" height="58" rx="4" fill="#8a5a35"/><rect x="336" y="84" width="108" height="46" fill="#ffb27a"/><path d="M336 118 L444 118" stroke="#3a7bd5" stroke-width="6"/><path d="M356 84 L356 118 M424 84 L424 118 M356 92 Q390 110 424 92" stroke="#d9483b" stroke-width="4" fill="none"/>`);
  s += ding(7, "cowboyhat", `<rect x="272" y="104" width="6" height="8" fill="#8a5a35"/><path d="M246 128 q30 -24 60 0 l8 6 q-38 10 -76 0 Z" fill="#a0612f"/><rect x="264" y="112" width="24" height="16" rx="6" fill="#8a5a35"/>`);
  s += ding(9, "globe", `<rect x="166" y="132" width="12" height="8" fill="#8a5a35"/><circle cx="172" cy="112" r="20" fill="#4fc3f7"/><path d="M160 102 q8 -6 14 2 q4 8 -4 12 q-8 2 -10 -6z M178 118 q6 -4 10 2" fill="#8bd36b"/><path d="M152 112 a20 20 0 0 0 40 0" stroke="#8a5a35" stroke-width="2" fill="none"/>`);
  s += ding(2, "baseball", `<circle cx="160" cy="492" r="12" fill="#ffffff" stroke="#c3cad6" stroke-width="1.5"/><path d="M152 484 q6 8 0 16 M168 484 q-6 8 0 16" stroke="#e8543f" stroke-width="1.6" fill="none"/><path d="M178 500 q4 -24 22 -22 q14 2 12 20 q-2 10 -16 8 Z" fill="#a0612f"/>`);
  s += ding(6, "schoolbus", `<rect x="590" y="478" width="70" height="26" rx="6" fill="#ffd23f"/>${[598, 614, 630, 646].map((x) => `<rect x="${x}" y="483" width="11" height="9" rx="2" fill="#cfeefa"/>`).join("")}<circle cx="606" cy="506" r="6" fill="${DUNKEL}"/><circle cx="646" cy="506" r="6" fill="${DUNKEL}"/>`);
  s += ding(5, "pumpkin", `<ellipse cx="880" cy="484" rx="24" ry="18" fill="#f5a623"/><path d="M868 470 q12 -6 24 0 M880 466 l2 -10" stroke="#e08a00" stroke-width="3" fill="none"/><path d="M882 456 l2 -8" stroke="#3fa34d" stroke-width="4"/>`);
  s += ding(12, "popcorn", `<rect x="935" y="400" width="50" height="60" rx="4" fill="#e8543f"/><rect x="940" y="406" width="40" height="34" rx="3" fill="#fff6e0"/>${[[948, 422], [958, 416], [968, 424], [954, 430], [972, 432]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffffff" stroke="#f4b400" stroke-width="1"/>`).join("")}<rect x="938" y="460" width="6" height="14" fill="#3a3f4a"/><rect x="976" y="460" width="6" height="14" fill="#3a3f4a"/>`);
  s += ding(10, "cactus", `<rect x="828" y="452" width="34" height="22" rx="4" fill="#e8543f"/><rect x="838" y="412" width="14" height="42" rx="7" fill="#3fa34d"/><rect x="826" y="424" width="10" height="20" rx="5" fill="#3fa34d"/><rect x="854" y="418" width="10" height="20" rx="5" fill="#3fa34d"/>`);
  // Tür in den Rechenwagen
  s += ort("tuer", `<rect x="18" y="130" width="100" height="345" rx="10" fill="#a8743f"/><rect x="26" y="138" width="84" height="329" rx="6" fill="#c08a55"/><rect x="38" y="152" width="60" height="70" rx="6" fill="#cfeefa"/><circle cx="96" cy="320" r="6" fill="#ffd166"/><rect x="44" y="244" width="48" height="22" rx="5" fill="#fff6e0"/><text x="68" y="261" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="16" fill="#e8543f">1+2</text>`);
  // Regal mit Bilderbüchern: die Geschichten
  let buecher = "";
  const bf = ["#e8543f", "#3a7bd5", "#ffd166", "#3fa34d", "#6c5ce7", "#ef6fa8", "#00a5b5"];
  [196, 262].forEach((y, r) => { for (let i = 0; i < 7; i += 1) buecher += `<rect x="${150 + i * 21}" y="${y - (i % 3) * 4 - 40}" width="17" height="${40 + (i % 3) * 4}" rx="3" fill="${bf[(i + r * 3) % 7]}"/>`; });
  s += ort("regal", `<rect x="138" y="140" width="172" height="200" rx="6" fill="#8a5a35"/><rect x="146" y="148" width="156" height="184" fill="#6d4628"/>${buecher}<rect x="146" y="196" width="156" height="6" fill="#8a5a35"/><rect x="146" y="262" width="156" height="6" fill="#8a5a35"/>
    <g transform="translate(224 300)"><path d="M-62 -26 L0 -20 L62 -26 L62 26 L0 30 L-62 26 Z" fill="#ffffff"/><path d="M0 -20 L0 30" stroke="#d9dce2" stroke-width="2"/>${[[-55, -18], [-28, -18], [7, -17], [34, -18]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="21" height="18" rx="2" fill="#cdeefb"/><circle cx="${x + 10}" cy="${y + 11}" r="4" fill="${["#9aa0ab", "#e63946", "#4caf50", "#c98b4f"][i]}"/>`).join("")}${[-55, -28, 7, 34].map((x) => `<rect x="${x}" y="4" width="21" height="3" rx="1" fill="#c3c7cf"/><rect x="${x}" y="10" width="15" height="3" rx="1" fill="#c3c7cf"/>`).join("")}</g>`);
  // Tisch mit dem Wörterbuch (und, später, den Sonnenblumen)
  s += ort("buch", `<rect x="150" y="410" width="150" height="12" rx="4" fill="#8a5a35"/><rect x="162" y="422" width="10" height="50" fill="#8a5a35"/><rect x="278" y="422" width="10" height="50" fill="#8a5a35"/>
    <rect x="166" y="362" width="96" height="48" rx="6" fill="#e8543f"/><rect x="166" y="362" width="10" height="48" rx="3" fill="#b23a34"/><circle cx="220" cy="386" r="16" fill="#ffffff"/><g transform="translate(220 388) scale(0.42)">${roccoKopf("froh", { muetze: false })}</g>${stern(250, 370, 7)}`);
  s += ding(4, "sunflowers", `<rect x="272" y="384" width="22" height="26" rx="4" fill="#3a7bd5"/><path d="M283 384 L280 356 M283 384 L292 352" stroke="#3fa34d" stroke-width="3"/>${[[280, 350], [293, 346]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#ffd23f"/><circle cx="${x}" cy="${y}" r="4" fill="#8a5a35"/>`).join("")}`);
  // Rocco im Schaukelstuhl
  s += ort("rocco", `<path d="M330 492 Q420 512 510 492" stroke="#8a5a35" stroke-width="9" fill="none" stroke-linecap="round"/>
    <rect x="346" y="300" width="14" height="190" rx="5" fill="#a0612f"/><rect x="480" y="300" width="14" height="190" rx="5" fill="#a0612f"/>
    <rect x="352" y="292" width="136" height="20" rx="8" fill="#a0612f"/>${[380, 410, 440].map((xx) => `<rect x="${xx}" y="312" width="10" height="110" fill="#b8763d"/>`).join("")}
    ${ausbau > 1 ? `<g class="en-ausbau${1 >= neuAb ? " is-neu" : ""}" data-ausbau="quilt"><rect x="360" y="400" width="124" height="48" rx="8" fill="#3a7bd5"/>${[0, 1, 2, 3].map((k) => `<rect x="${364 + k * 30}" y="404" width="26" height="40" rx="4" fill="${["#e8543f", "#ffd166", "#ffffff", "#3fa34d"][k]}"/>`).join("")}</g>` : ""}
    <rect x="352" y="440" width="136" height="16" rx="6" fill="#a0612f"/>
    <g transform="translate(420 446) scale(0.95)">${rocco("steh", "froh")}</g>`);
  // Die Karte: was Rocco vorschlägt
  if (karte) {
    s += ort("karte", `<rect x="518" y="150" width="218" height="124" rx="16" fill="#ffffff" stroke="#e1d9c6" stroke-width="2"/>
      <text x="627" y="178" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="15" fill="#5d6882">I have an idea!</text>
      <g transform="translate(562 228)">${karte.bild || ""}</g>
      <text x="600" y="${karte.titel.length > 12 ? 214 : 222}" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="${karte.titel.length > 12 ? 16 : 20}" fill="#243047">${ESC(karte.titel)}</text>
      <circle cx="690" cy="248" r="16" fill="#3fbf74"/><path d="M684 239 L698 248 L684 257 Z" fill="#ffffff"/>`);
  }
  // Die Spielzeugkiste: Hear & find
  s += ort("kiste", `<circle cx="586" cy="404" r="13" fill="#e63946"/><path d="M574 400 Q586 410 598 400" stroke="#ffffff" stroke-width="2.5" fill="none"/>${stern(636, 398, 13)}
    <rect x="566" y="410" width="92" height="62" rx="8" fill="#3a7bd5"/><rect x="560" y="402" width="104" height="16" rx="6" fill="#2f63bd"/>
    <rect x="598" y="430" width="28" height="22" rx="4" fill="#ffd166"/><text x="612" y="447" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="14" fill="#2f63bd">ABC</text>`);
  // Aussichtsturm mit Leiter: Entdecken
  let sprossen = "";
  for (let y = 120; y < 470; y += 38) sprossen += `<rect x="760" y="${y}" width="58" height="7" rx="3" fill="#8a5a35"/>`;
  s += ort("ausguck", `<rect x="720" y="0" width="140" height="92" fill="#8a5a35"/><rect x="730" y="8" width="56" height="62" rx="4" fill="#bfe6f5"/><rect x="794" y="8" width="56" height="62" rx="4" fill="#bfe6f5"/>
    ${ausbau > 14 ? `<g class="en-ausbau${14 >= neuAb ? " is-neu" : ""}" data-ausbau="stars">${stern(748, 30, 7)}${stern(820, 22, 6)}${stern(832, 50, 5)}</g>` : `<circle cx="826" cy="30" r="12" fill="#ffe27a"/>`}
    <path d="M730 62 Q760 46 786 60 L786 70 L730 70 Z" fill="#94cd60"/><path d="M794 64 Q820 50 850 62 L850 70 L794 70 Z" fill="#94cd60"/>
    ${ausbau > 3 ? `<g class="en-ausbau${3 >= neuAb ? " is-neu" : ""}" data-ausbau="curtains"><path d="M730 8 L744 8 Q738 40 732 70 L730 70 Z" fill="#ef6fa8"/><path d="M850 8 L836 8 Q842 40 848 70 L850 70 Z" fill="#ef6fa8"/></g>` : ""}
    <rect x="752" y="92" width="8" height="380" rx="3" fill="#8a5a35"/><rect x="818" y="92" width="8" height="380" rx="3" fill="#8a5a35"/>${sprossen}
    <rect x="732" y="96" width="114" height="24" rx="6" fill="#ffffff"/><text x="789" y="114" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="16" fill="#3a7bd5">LOOKOUT</text>`);
  // Das Brett mit den Aufnähern
  let brett = `<rect x="872" y="128" width="116" height="200" rx="10" fill="#6d4628"/><rect x="880" y="136" width="100" height="184" rx="6" fill="#3a7bd5"/>
    <text x="930" y="160" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="13" fill="#ffffff">PATCHES</text>`;
  // Bis drei Welten untereinander, bis sechs in zwei Spalten, mehr in drei.
  const spalten = flicken.length > 6 ? 3 : flicken.length > 3 ? 2 : 1;
  flicken.slice(0, 12).forEach((f, i) => {
    const x = spalten === 3 ? 897 + (i % 3) * 33 : spalten === 2 ? 905 + (i % 2) * 50 : 930;
    const y = spalten === 3 ? 188 + Math.floor(i / 3) * 36 : spalten === 2 ? 196 + Math.floor(i / 2) * 50 : 196 + i * 50;
    brett += aufnaeher(f.id || f.welt, x, y, spalten === 3 ? 14 : spalten === 2 ? 19 : 20, f);
  });
  s += ort("aufnaeher", brett);
  // Das Telefon an der Wand und der Briefkasten (Etappe 3).
  if (telefon) {
    s += ort("telefon", `<rect x="454" y="168" width="44" height="74" rx="10" fill="#e8543f"/><rect x="460" y="176" width="32" height="20" rx="4" fill="#fff6e0"/>
      ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${466 + c * 10}" cy="${206 + r * 10}" r="3.2" fill="#ffffff"/>`).join("")).join("")}
      <path d="M450 170 q-14 20 0 60" stroke="#b23a34" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="438" y="164" width="16" height="72" rx="8" fill="#c8423b"/>
      <path d="M446 236 q-6 30 20 38 q20 6 26 -8" stroke="#3a3f4a" stroke-width="2.5" fill="none"/>`);
  }
  if (post && window.LernappEnglischArt?.BRIEFKASTEN) {
    // Rechts zwischen Kaktus und Popcorn – nicht vor der blauen Kiste.
    s += ort("briefkasten", `<g transform="translate(900 466) scale(0.6)">${window.LernappEnglischArt.BRIEFKASTEN(Boolean(post.neu))}</g>`);
  }
  // Die Jukebox (Etappe 2): Verse zum Mitsprechen.
  if (jukebox) {
    s += ort("jukebox", `<rect x="672" y="330" width="68" height="140" rx="30" fill="#c8423b"/><rect x="678" y="338" width="56" height="54" rx="26" fill="#ffd166"/>
      ${[0, 1, 2].map((k) => `<path d="M${686 + k * 2} ${372 - k * 8} q20 ${-14 + k * 4} ${40 - k * 4} 0" stroke="${["#e8543f", "#3a7bd5", "#3fbf74"][k]}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join("")}
      <rect x="682" y="400" width="48" height="32" rx="6" fill="#3a3f4a"/>${[0, 1, 2, 3].map((k) => `<rect x="${686 + k * 11}" y="406" width="8" height="20" rx="2" fill="${["#ffd166", "#ef6fa8", "#4fc3f7", "#8bd36b"][k]}"/>`).join("")}
      <rect x="680" y="440" width="52" height="22" rx="6" fill="#a83631"/><circle cx="694" cy="451" r="5" fill="#ffd166"/><circle cx="718" cy="451" r="5" fill="#ffd166"/>
      <path d="M676 322 q6 -10 12 0 M724 318 q6 -10 12 0" stroke="#6c5ce7" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="676" cy="324" r="4" fill="#6c5ce7"/><circle cx="724" cy="320" r="4" fill="#6c5ce7"/>`);
  }
  return `<svg viewBox="0 0 1000 560" class="en-zimmer-svg" role="img" aria-label="Der Englischwagen von innen" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="en-grau"><feColorMatrix type="saturate" values="0"/></filter></defs>${s}</svg>`;
}

// Kleine Bilder für Karten und Auswahl: eine Welt, Hear & find, eine Geschichte
// (gemalt klein, darunter die Zeichnung).
function weltBild(welt, breite = 200, hoehe = 112) {
  const zeichnung = szene(welt, { gezeichnet: true }).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  const bild = GEMALT.welten[welt]
    ? `${ersatz(zeichnung, 1000, 560)}<image class="en-gemaelde" href="${gemaltBild(`welt-${welt}-klein`)}" width="1000" height="560" preserveAspectRatio="xMidYMid slice"/>` : zeichnung;
  return `<svg viewBox="0 0 1000 560" width="${breite}" height="${hoehe}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8f0"/><stop offset="1" stop-color="#e3f5fb"/></linearGradient>${window.LernappBauTiere?.defs?.() || ""}</defs>${bild}</svg>`;
}

// Das aufgeschlagene Wörterbuch (1000 × 560): Einband und zwei leere Seiten –
// gemalt (bilder/englisch/woerterbuch.webp), darunter die Zeichnung.
const BUCH = `<rect width="1000" height="560" fill="#7a4b2f"/><rect x="22" y="18" width="956" height="524" rx="22" fill="#5b3a29"/>
      <path d="M40 34 L496 44 L496 530 L40 524 Z" fill="#fffaf0"/><path d="M504 44 L960 34 L960 524 L504 530 Z" fill="#fffaf0"/>
      <rect x="494" y="40" width="12" height="492" fill="#e9dcc4"/>`;
function woerterbuchBild() {
  if (!GEMALT.woerterbuch) return BUCH;
  return `${ersatz(BUCH, 1000, 560, "#7a4b2f")}<image class="en-gemaelde" href="${gemaltBild("woerterbuch")}" width="1000" height="560" preserveAspectRatio="none"/>`;
}

// Was weitere Zeichnungen (englisch-art-2.js …) brauchen, um Welten und
// Geschichten dazuzulegen: Sie ergänzen DING, ORTE, HINTERGRUND, STICKER,
// AUFNAEHER_BILD, AUFNAEHER_FARBE, GESCHICHTEN_BILDER und TITELBILD.
window.LernappEnglischArt = {
  roccoKopf, rocco, DING, ORTE, STICKER, szene, markeAn, sticker, aufnaeher, stern,
  geschichtsBild, geschichtsTitelbild, zimmer, weltBild, woerterbuchBild, AUFNAEHER_BILD,
  HINTERGRUND, AUFNAEHER_FARBE, GESCHICHTEN_BILDER, TITELBILD, GEMALT, gemaeldeVon, vorladen, istGeladen,
  hilfen: { tb, bildHintergrund, apfel, menschOder, wolke: wolkeAn, FARBE: { GRAU, GRAU_D, DUNKEL, HELL, HAUT } },
};
})();
