/*
 * franzoesisch-art-3.js – Boulangerie, Post und zwei neue Geschichten
 * (Französischwagen, Etappe 2).
 *
 *   DING          croissant, baguette, painchoc (pain au chocolat), chocolat
 *                 (chocolat chaud) – für die Boulangerie und die Geschichten
 *   lou()         Cousine Lou, eine Marmotte mit blauem Béret: Sie reist durch
 *                 Frankreich und die Romandie und schickt Postkarten (steht im
 *                 Französischwagen an Rubys Stelle, LernappFranzoesischArt.ruby)
 *   POSTKARTEN    Genève, Paris, Mont-Blanc, Provence, Bretagne (600 × 380)
 *   BRIEFKASTEN   der gelbe Briefkasten im Bistro
 *   DINER_KULISSE die Boulangerie statt des Diners: blau-weisse Markise,
 *                 Brotregal, Holztheke (DINER_KACHEL: ihre Kachel im Spielkorb)
 *   Geschichten   «Au marché» und «Le petit train» (je 472 × 204)
 */
(() => {
"use strict";
const A = window.LernappEnglischArt;
const F = window.LernappFranzoesischArt;
if (!A || !F) return;
const { tb, wolke, FARBE } = A.hilfen;
const { DUNKEL } = FARBE;
const f = (n) => Number(n.toFixed(1));
const at = (x, y, s, inhalt) => `<g transform="translate(${x} ${y}) scale(${s})">${inhalt}</g>`;
const ROT = "#d62839", GELB = "#ffd23f", GELB_D = "#e0a800";
const herz = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/>`;
const tasse = () => `<path d="M-26 -18 L26 -18 L21 26 Q20 34 12 34 H-12 Q-20 34 -21 26 Z" fill="#ffffff" stroke="#d6dde8" stroke-width="2.5"/>
  <path d="M26 -8 q18 2 16 18 q-2 14 -18 12" stroke="#ffffff" stroke-width="7" fill="none"/><path d="M26 -8 q18 2 16 18 q-2 14 -18 12" stroke="#d6dde8" stroke-width="2" fill="none"/>
  <ellipse cx="0" cy="-17" rx="25" ry="6" fill="#7a4b2f"/><ellipse cx="-6" cy="-19" rx="9" ry="2.6" fill="#a0703f"/>
  <path d="M-12 -28 q6 -9 0 -18 M2 -30 q6 -9 0 -18 M14 -28 q5 -8 0 -16" stroke="#c9d1de" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M-18 4 H18" stroke="${ROT}" stroke-width="4"/><circle cx="0" cy="16" r="5" fill="${ROT}" opacity="0.8"/>`;

Object.assign(A.DING, {
  croissant: () => `<path d="M-58 14 Q-44 -10 -26 -14 Q-12 -36 0 -36 Q12 -36 26 -14 Q44 -10 58 14 Q40 20 30 10 Q18 22 0 20 Q-18 22 -30 10 Q-40 20 -58 14 Z" fill="#e0a24a" stroke="#b8792e" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M-30 10 Q-28 -6 -22 -12 M-12 18 Q-12 -10 -6 -30 M12 18 Q12 -10 6 -30 M30 10 Q28 -6 22 -12" stroke="#b8792e" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-8 -26 Q0 -32 8 -26" stroke="#f6cf86" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-46 8 Q-40 0 -32 -4" stroke="#f6cf86" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  baguette: () => `<g transform="rotate(-18)"><rect x="-64" y="-15" width="128" height="30" rx="15" fill="#d99236"/><rect x="-60" y="-13" width="120" height="16" rx="8" fill="#e8b061"/>
    ${[-40, -16, 8, 32].map((x) => `<path d="M${x} -10 q10 6 18 0" stroke="#b8792e" stroke-width="3.5" fill="none" stroke-linecap="round"/>`).join("")}
    <rect x="-22" y="-18" width="30" height="36" fill="#ffffff" opacity="0.9"/><path d="M-22 -18 V18 M8 -18 V18" stroke="#d6dde8" stroke-width="2"/></g>`,
  painchoc: () => `<rect x="-48" y="-24" width="96" height="48" rx="14" fill="#d99236"/><rect x="-44" y="-22" width="88" height="22" rx="10" fill="#e8b061"/>
    <path d="M-40 -6 Q0 2 40 -6 M-40 8 Q0 16 40 8" stroke="#b8792e" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="-54" y="-6" width="12" height="10" rx="3" fill="#5f3a22"/><rect x="42" y="-6" width="12" height="10" rx="3" fill="#5f3a22"/>
    <rect x="-54" y="8" width="12" height="9" rx="3" fill="#5f3a22"/><rect x="42" y="8" width="12" height="9" rx="3" fill="#5f3a22"/>`,
  chocolat: tasse,
});
Object.assign(A.STICKER, { croissant: [0.5, 4], baguette: [0.48, 0], painchoc: [0.56, 0], chocolat: [0.6, -4] });

// ---------------------------------------------------------------------------
// Cousine Lou und Mamie Marmotte: Margot in anderen Farben
// ---------------------------------------------------------------------------
const umfaerben = (svg, paare) => paare.reduce((s, [von, nach]) => s.replaceAll(von, nach), svg);
const LOU = [["#d62839", "#2f5fb3"], ["#a51d2c", "#1d3f80"], ["#ef6a74", "#7fb0f0"]];
const lou = (pose = "steh", laune = "froh") => umfaerben(F.margot(pose === "zeig" || pose === "zitter" ? "steh" : pose, laune), LOU);
// Mamie: graueres Fell, eine runde Brille und ein lila Schultertuch (ohne Béret)
const MAMIE = [["#b98552", "#a99a8a"], ["#8e5f35", "#7d6f63"], ["#dcae7a", "#cbbfb1"]];
const mamie = (pose = "steh", laune = "froh") => {
  const kopf = F.margotKopf(laune, { muetze: false });
  const koerper = F.margot(pose, laune).replace(F.margotKopf(laune), kopf);
  return `${umfaerben(koerper, MAMIE)}
    <path d="M-26 -74 Q0 -60 26 -74 L30 -58 Q0 -44 -30 -58 Z" fill="#8e5cd9"/><path d="M-6 -62 L0 -40 L6 -62 Z" fill="#7444c2"/>
    <g transform="translate(0 -94)"><circle cx="-12" cy="-4" r="8.5" fill="none" stroke="#5d6882" stroke-width="2.4"/><circle cx="12" cy="-4" r="8.5" fill="none" stroke="#5d6882" stroke-width="2.4"/><path d="M-3.5 -4 H3.5" stroke="#5d6882" stroke-width="2.4"/>
    <path d="M-18 -24 Q0 -34 18 -24" stroke="#f3efe8" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
};

// ---------------------------------------------------------------------------
// Die Postkarten (600 × 380), mit Rand und einer Briefmarke mit Schweizerkreuz
// ---------------------------------------------------------------------------
const RAND = `<rect x="4" y="4" width="592" height="372" rx="6" fill="none" stroke="#ffffff" stroke-width="8"/>`;
const marke = (grund) => `<g transform="translate(536 18)"><rect width="46" height="54" rx="3" fill="#ffffff"/><rect x="4" y="4" width="38" height="46" fill="${grund}"/>
  <rect x="19" y="13" width="8" height="26" fill="#ffffff"/><rect x="10" y="22" width="26" height="8" fill="#ffffff"/></g>`;
const karte = (inhalt, grund) => `<svg width="600" height="380" viewBox="0 0 600 380" overflow="hidden">${inhalt}${RAND}${marke(grund)}</svg>`;
const wellen = (liste, farbe) => liste.map(([x, y, n]) => `<path d="M${x} ${y}${" q8 -6 16 0".repeat(n)}" stroke="${farbe}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("");
const berge = (y, farbe, schnee = true) => `<path d="M0 ${y} L70 ${y - 90} L130 ${y - 40} L210 ${y - 130} L300 ${y - 50} L380 ${y - 110} L470 ${y - 40} L540 ${y - 100} L600 ${y - 50} V380 H0 Z" fill="${farbe}"/>${schnee ? `<path d="M70 ${y - 90} L54 ${y - 70} L86 ${y - 70} Z M210 ${y - 130} L190 ${y - 102} L230 ${y - 102} Z M380 ${y - 110} L362 ${y - 86} L398 ${y - 86} Z M540 ${y - 100} L524 ${y - 80} L556 ${y - 80} Z" fill="#ffffff"/>` : ""}`;

function geneve() {
  let s = `<rect width="600" height="380" fill="#bfe6f5"/>${wolke(120, 60, 0.7)}${wolke(430, 50, 0.6)}${berge(250, "#9bb3cf")}`;
  s += `<rect y="230" width="600" height="150" fill="#4f9bd6"/>${wellen([[40, 260, 3], [200, 300, 4], [380, 270, 3], [470, 320, 4], [120, 330, 3]], "#8cc6ee")}`;
  // Der Jet d'eau
  s += `<path d="M292 236 Q290 140 296 50 Q300 40 304 50 Q310 140 308 236 Z" fill="#ffffff" opacity="0.95"/>
    <path d="M300 46 Q336 58 352 120 Q356 150 346 176 Q340 130 326 96 Q314 70 300 60 Z" fill="#ffffff" opacity="0.6"/>
    ${[[318, 62, 7], [334, 84, 6], [346, 112, 5], [350, 142, 4], [288, 60, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="0.8"/>`).join("")}
    <ellipse cx="300" cy="236" rx="26" ry="7" fill="#ffffff" opacity="0.85"/>`;
  s += `<rect y="320" width="600" height="60" fill="#c9cfd8"/>${at(150, 370, 1.0, lou("wink", "freude"))}`;
  return karte(s, ROT);
}
function paris() {
  let s = `<rect width="600" height="380" fill="#cfe7f7"/>${wolke(110, 70, 0.6)}${wolke(470, 60, 0.7)}`;
  s += `<rect y="300" width="600" height="80" fill="#94cd60"/>${[60, 160, 440, 540].map((x) => `<circle cx="${x}" cy="296" r="24" fill="#4caf50"/>`).join("")}`;
  // Die Tour Eiffel
  s += `<path d="M300 30 L326 170 L380 310 L350 310 L318 236 L282 236 L250 310 L220 310 L274 170 Z" fill="#8a5a35"/>
    <path d="M278 170 H322 M266 236 H334 M300 30 V20" stroke="#6d4628" stroke-width="7"/>
    <path d="M288 250 Q300 226 312 250" stroke="#cfe7f7" stroke-width="10" fill="none"/>`;
  s += at(460, 372, 1.0, lou("jubel", "freude"));
  return karte(s, "#2f5fb3");
}
function montblanc() {
  let s = `<rect width="600" height="380" fill="#b8def4"/>${wolke(500, 50, 0.6)}`;
  s += `<path d="M0 300 L120 170 L200 220 L320 60 L440 210 L520 160 L600 240 V380 H0 Z" fill="#9bb3cf"/>
    <path d="M320 60 L270 130 Q300 120 320 136 Q340 120 372 132 Z M120 170 L96 196 L146 198 Z M520 160 L500 182 L544 184 Z" fill="#ffffff"/>
    <path d="M0 300 Q300 270 600 300 V380 H0 Z" fill="#f3f7fc"/>`;
  s += [[80, 120], [250, 90], [420, 110], [560, 130], [160, 240], [500, 250], [340, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#ffffff"/>`).join("");
  s += at(150, 372, 1.0, lou("steh", "freude") + `<path d="M-30 -70 Q0 -58 30 -70 L32 -62 Q0 -48 -32 -62 Z" fill="${ROT}"/>`);
  s += `<path d="M194 250 l14 -4 M196 264 l16 0 M194 278 l14 4" stroke="#7fb0f0" stroke-width="3" stroke-linecap="round"/>`;
  return karte(s, ROT);
}
function provence() {
  let s = `<rect width="600" height="380" fill="#ffe7b8"/><circle cx="480" cy="80" r="40" fill="#ffd23f"/>`;
  s += `<path d="M0 200 Q300 170 600 200 V380 H0 Z" fill="#b48ad8"/>`;
  for (let r = 0; r < 6; r += 1) {
    const y = 214 + r * 28;
    s += `<path d="M${-20 + r * 4} ${y} Q300 ${y - 14} ${620 - r * 4} ${y}" stroke="#7d4fc0" stroke-width="${8 + r * 2}" stroke-dasharray="2 ${10 + r}" stroke-linecap="round" fill="none"/>`;
  }
  s += `<rect x="60" y="130" width="90" height="70" fill="#f3d6a4"/><path d="M52 134 L105 100 L158 134 Z" fill="#e0782a"/><rect x="92" y="160" width="24" height="40" fill="#6d9ad6"/>`;
  s += at(420, 372, 1.0, lou("wink", "froh"));
  return karte(s, "#8e5cd9");
}
function bretagne() {
  let s = `<rect width="600" height="380" fill="#cde9f7"/>${wolke(140, 60, 0.7)}`;
  s += `<rect y="220" width="600" height="160" fill="#3f86c8"/>${wellen([[260, 250, 4], [420, 280, 3], [320, 320, 4], [500, 340, 3]], "#8cc6ee")}`;
  s += `<path d="M0 230 Q120 210 220 240 L220 380 H0 Z" fill="#8d8478"/><path d="M0 250 Q100 236 200 256" stroke="#a49a8d" stroke-width="6" fill="none"/>`;
  // Der Leuchtturm, rot-weiss gestreift
  s += `<path d="M92 230 L104 90 H136 L148 230 Z" fill="#ffffff"/>${[110, 150, 190].map((y) => `<path d="M${f(92 + (230 - y - 20) * 0.086)} ${y} H${f(148 - (230 - y - 20) * 0.086)} L${f(148 - (230 - y) * 0.086)} ${y + 20} H${f(92 + (230 - y) * 0.086)} Z" fill="${ROT}"/>`).join("")}
    <rect x="100" y="70" width="40" height="22" fill="#ffd166"/><path d="M96 70 L120 50 L144 70 Z" fill="${ROT}"/><path d="M140 80 L230 60 L230 100 Z" fill="#fff3a0" opacity="0.6"/>`;
  s += `<path d="M200 344 Q400 326 600 340 V380 H200 Z" fill="#f3dca5"/>${at(400, 372, 1.0, lou("jubel", "freude"))}`;
  return karte(s, "#2f5fb3");
}
const POSTKARTEN = { geneve, paris, montblanc, provence, bretagne };

// Der gelbe Briefkasten (Ursprung unten in der Mitte, etwa 70 × 80)
const briefkasten = (neu = false) => `<rect x="-30" y="-78" width="60" height="70" rx="8" fill="${GELB}" stroke="${GELB_D}" stroke-width="3"/>
  <rect x="-20" y="-64" width="40" height="7" rx="3.5" fill="#3a3f4a"/>
  <path d="M-12 -40 L0 -32 L12 -40 M-12 -40 H12 V-24 H-12 Z" stroke="#3a3f4a" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
  ${neu ? `<g transform="translate(26 -82)"><circle r="12" fill="${ROT}"/><text y="5" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="16" fill="#ffffff">1</text></g>` : ""}`;

// ===========================================================================
// «Au marché»: Margot kauft Äpfel, Käse und in der Boulangerie Brot
// ===========================================================================
const himmel = () => `<rect width="472" height="204" fill="#cfe9f7"/>${wolke(380, 30, 0.45)}${wolke(90, 24, 0.35)}`;
const pflaster = () => `<rect y="168" width="472" height="36" fill="#e7d3b0"/>${Array.from({ length: 12 }, (_, i) => `<ellipse cx="${20 + i * 40}" cy="${182 + (i % 2) * 10}" rx="14" ry="5" fill="#d9c09a"/>`).join("")}`;
// Ein Marktstand mit gestreiftem Dach (x links, Breite b)
const stand = (x, b, farbe) => `<rect x="${x + 6}" y="72" width="6" height="100" fill="#8a5a35"/><rect x="${x + b - 12}" y="72" width="6" height="100" fill="#8a5a35"/>
  ${Array.from({ length: Math.round(b / 24) }, (_, k) => `<path d="M${x + k * 24} 56 h24 v22 q-12 10 -24 0 Z" fill="${k % 2 ? "#ffffff" : farbe}"/>`).join("")}
  <rect x="${x - 4}" y="50" width="${b + 8}" height="8" rx="3" fill="${farbe}"/>
  <rect x="${x}" y="128" width="${b}" height="44" rx="4" fill="#c08a55"/><rect x="${x}" y="124" width="${b}" height="8" rx="3" fill="#a0703f"/>`;
const korbInPfoten = `<path d="M-20 -44 Q0 -74 20 -44" stroke="#8a5a35" stroke-width="4" fill="none"/><path d="M-24 -44 H24 L18 -22 H-18 Z" fill="#c98b4f"/><path d="M-22 -36 H22 M-20 -28 H20" stroke="#a8743f" stroke-width="2.5"/>`;
const gast = (id, x, y, s) => (A.DING[id] ? at(x, y, s, A.DING[id]()) : "");
const markt = (inhalt) => `${himmel()}${pflaster()}${inhalt}`;
A.GESCHICHTEN_BILDER.marche = [
  () => markt(`${stand(250, 96, "#3fbf74")}${stand(360, 96, ROT)}
    ${at(300, 118, 0.3, A.DING.apple(true))}${at(410, 120, 0.4, A.DING.cheese())}
    ${tb('data-wort="raccoon"', at(120, 196, 0.95, A.rocco("steh", "freude") + korbInPfoten))}`),
  () => markt(`${stand(200, 220, "#3fbf74")}
    ${gast("bear", 310, 110, 0.55)}
    ${tb('data-wort="apple"', `${[[236, 120], [258, 116], [280, 121], [340, 118], [362, 121], [384, 116]].map(([x, y]) => at(x, y, 0.26, A.DING.apple(true))).join("")}`)}
    ${at(110, 196, 0.95, A.rocco("wink", "froh") + korbInPfoten)}
    <g transform="translate(176 60)"><circle r="18" fill="#ffffff" stroke="#c3c7cf" stroke-width="2"/><text y="8" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="22" fill="#3a7bd5">3</text></g>`),
  () => markt(`${stand(220, 210, ROT)}
    ${gast("cow", 330, 118, 0.5)}
    ${tb('data-wort="cheese"', `${at(262, 116, 0.5, A.DING.cheese())}${at(400, 118, 0.46, A.DING.cheese())}`)}
    ${at(110, 196, 0.95, A.rocco("steh", "froh") + korbInPfoten)}${at(110, 148, 0.24, A.DING.apple(true))}`),
  () => markt(`${stand(190, 250, "#f5a623")}
    ${gast("dog", 316, 110, 0.6)}
    ${tb('data-wort="baguette"', at(232, 114, 0.42, A.DING.baguette()))}
    ${tb('data-wort="croissant"', at(330, 120, 0.4, A.DING.croissant()))}
    ${tb('data-wort="painchoc"', at(402, 118, 0.4, A.DING.painchoc()))}
    ${at(96, 196, 0.95, A.rocco("jubel", "freude"))}${herz(150, 48, 1)}`),
];
A.TITELBILD.marche = 3;

// ===========================================================================
// «Le petit train»: mit dem Zug durch den Tunnel und über die Brücke zu Mamie
// ===========================================================================
const zug = (x, y, s) => at(x, y, s, A.DING.train());
A.GESCHICHTEN_BILDER.train = [
  () => `<rect width="472" height="204" fill="#cfe9f7"/>${wolke(90, 30, 0.4)}
    <rect y="150" width="472" height="54" fill="#c9cfd8"/><rect y="146" width="472" height="8" fill="#9aa2b0"/>
    <rect x="20" y="60" width="120" height="90" fill="#f3d6a4"/><path d="M10 64 L80 30 L150 64 Z" fill="#8f2d29"/><rect x="58" y="96" width="44" height="54" fill="#8a5a35"/>
    <rect x="40" y="72" width="80" height="16" rx="3" fill="#ffffff"/><circle cx="80" cy="80" r="5" fill="${ROT}"/>
    ${tb('data-wort="train"', zug(330, 120, 0.9))}
    ${tb('data-wort="raccoon"', at(190, 196, 0.85, A.rocco("wink", "freude")))}`,
  () => `<rect width="472" height="204" fill="#cfe9f7"/>
    <path d="M140 204 L140 110 Q250 0 360 110 L360 204 Z" fill="#8fa36e"/><path d="M150 110 Q250 10 350 110" fill="#a3b77f"/>
    <path d="M200 204 V130 Q250 80 300 130 V204 Z" fill="#2b2f38"/><path d="M196 204 V128 Q250 74 304 128 V204" stroke="#7a7f88" stroke-width="8" fill="none"/>
    <rect y="186" width="472" height="18" fill="#8a5a35"/>
    ${tb('data-wort="train"', `<clipPath id="fr-tunnel"><rect x="252" y="0" width="220" height="204"/></clipPath><g clip-path="url(#fr-tunnel)">${zug(336, 156, 0.9)}</g>`)}
    <path d="M60 40 l8 -10 M80 50 l12 -4" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`,
  () => `<rect width="472" height="204" fill="#cfe9f7"/>${wolke(380, 26, 0.4)}
    <path d="M0 120 L80 50 L150 100 L230 40 L320 110 L400 60 L472 100 V204 H0 Z" fill="#9bb3cf"/><path d="M80 50 L66 64 L94 64 Z M230 40 L214 58 L246 58 Z M400 60 L386 74 L414 74 Z" fill="#ffffff"/>
    <rect y="150" width="472" height="54" fill="#4f9bd6"/>${wellen([[40, 176, 3], [260, 186, 4], [380, 172, 3]], "#8cc6ee")}
    <rect x="0" y="104" width="472" height="12" fill="#a49a8d"/>${[40, 160, 280, 400].map((x) => `<path d="M${x} 204 V128 Q${x + 60} 92 ${x + 120} 128 V204" fill="#a49a8d"/><path d="M${x + 14} 204 V134 Q${x + 60} 104 ${x + 106} 134 V204 Z" fill="#4f9bd6"/>`).join("")}
    ${tb('data-wort="train"', zug(236, 76, 0.85))}`,
  () => `<rect width="472" height="204" fill="#f6e3c4"/><rect y="170" width="472" height="34" fill="#c08a55"/>
    ${[60, 160, 260, 360].map((x) => `<rect x="${x}" y="0" width="2" height="170" fill="#ecd3ad"/>`).join("")}
    <rect x="40" y="30" width="80" height="60" rx="4" fill="#8a5a35"/><rect x="46" y="36" width="68" height="48" fill="#cfeefa"/><path d="M46 84 L70 56 L86 70 L100 54 L114 70 V84 Z" fill="#9bb3cf"/>
    ${tb('data-wort="raccoon"', at(150, 196, 0.95, A.rocco("jubel", "freude")))}
    ${at(330, 196, 0.98, mamie("steh", "freude"))}
    ${tb('data-wort="chocolat"', at(296, 140, 0.42, tasse()))}
    ${herz(236, 50, 1)}${herz(258, 32, 0.6)}`,
];
A.TITELBILD.train = 2;

// ---------------------------------------------------------------------------
// La boulangerie: statt des roten Diners eine Bäckerei. Margot steht links,
// der Gast rechts, die Theke liegt wie im Diner bei y 300 (englisch-spiele-3.js).
// ---------------------------------------------------------------------------
const markise = (breite, hoehe, w = 50) => Array.from({ length: Math.ceil(breite / w) }, (_, i) =>
  `<path d="M${i * w} 0 h${w} v${hoehe} q${-w / 2} ${f(hoehe * 0.5)} ${-w} 0 Z" fill="${i % 2 ? "#ffffff" : "#3a6fc4"}"/>`).join("");
function dinerKulisse() {
  const brett = (y) => `<rect x="330" y="${y}" width="320" height="12" rx="4" fill="#9a6a3c"/>`;
  return `<rect width="1000" height="560" fill="#fbf1de"/>
    <rect x="320" y="84" width="340" height="196" rx="12" fill="#f1dfc0"/>${brett(184)}${brett(266)}
    ${at(386, 162, 0.42, A.DING.baguette())}${at(486, 162, 0.42, A.DING.baguette())}${at(590, 170, 0.36, A.DING.croissant())}
    ${at(390, 250, 0.36, A.DING.croissant())}${at(490, 250, 0.4, A.DING.painchoc())}${at(590, 252, 0.36, A.DING.croissant())}
    ${markise(1000, 44)}
    <rect x="0" y="300" width="1000" height="260" fill="#b9814f"/><rect x="0" y="292" width="1000" height="18" rx="6" fill="#e4c9a0"/>
    ${[200, 400, 600, 800].map((x) => `<path d="M${x} 322 V560" stroke="#a06d3f" stroke-width="4"/>`).join("")}`;
}
const dinerKachel = () => `<rect width="200" height="112" fill="#fbf1de"/>${markise(200, 18, 25)}<rect y="72" width="200" height="40" fill="#b9814f"/>
  ${at(72, 62, 0.42, A.DING.croissant())}${at(136, 58, 0.6, tasse())}`;

// Die Milchtüte heisst im Französischwagen «LAIT» (englisch-art.js, DING.milk).
Object.assign(F, { lou, mamie, ruby: lou, POSTKARTEN, BRIEFKASTEN: briefkasten, DINER_KULISSE: dinerKulisse, DINER_KACHEL: dinerKachel, MILCH_SCHILD: "LAIT" });
})();
