/*
 * englisch-art-3.js – Die Zeichnungen der Englischecke aus Etappe 3: die
 * Welten The City, School und Party Time mit Wimmelbild, Stickern,
 * Aufnähern und je einer Bildgeschichte («The yellow school bus.», «Rocco
 * goes to school.», «Happy birthday, Rocco!»), Roccos Kleider für «Dress up»
 * (ROCCO_KLEIDER), seine Cousine Ruby, ihre Postkarten aus Amerika
 * (POSTKARTEN) und der Briefkasten im Wagen (BRIEFKASTEN).
 *
 * Wie englisch-art.js und englisch-art-2.js: flache Farben, runde Formen,
 * kein Text im Bild. Kommt nach englisch-art.js.
 */

// Englischecke, Welt city (für englisch-art-2.js)
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { tb, wolke, FARBE } = A.hilfen;
  const { DUNKEL, GRAU_D, HAUT } = FARBE;
  const GLAS = "#cfeefa", CHROM = "#c3c7cf", ASPHALT = "#8d939e", TROTTOIR = "#dcdfe5";

  // Kleine Helfer: ein Rad (Boden bei +40), gespiegelt (Gegenfahrbahn), Licht
  const rad = (x, r = 13) => `<circle cx="${x}" cy="${40 - r}" r="${r}" fill="${DUNKEL}"/><circle cx="${x}" cy="${40 - r}" r="${(r * 0.45).toFixed(1)}" fill="${CHROM}"/>`;
  const spiegel = (s) => `<g transform="scale(-1 1)">${s}</g>`;
  const blink = (x, y, w, links, rechts) => `<rect x="${x}" y="${y}" width="${w / 2}" height="8" rx="3" fill="${links}"/><rect x="${x + w / 2}" y="${y}" width="${w / 2}" height="8" rx="3" fill="${rechts}"/>`;
  // Eine Limousine (Taxi, Polizei): Kabine, Fenster, Körper; nach rechts
  const limo = (dach, koerper, extra = "") => `<path d="M-36 -2 L-24 -26 Q-21 -30 -15 -30 H20 Q26 -30 30 -25 L46 -2 Z" fill="${dach}"/>
      <path d="M-28 -4 L-19 -23 H-3 V-4 Z M3 -4 V-23 H18 Q21 -23 23 -20 L34 -4 Z" fill="${GLAS}"/>
      <rect x="-66" y="-6" width="132" height="32" rx="12" fill="${koerper}"/>${extra}
      <rect x="58" y="2" width="9" height="8" rx="3" fill="#fff3b0"/><rect x="-67" y="2" width="8" height="8" rx="3" fill="#e8543f"/>
      <rect x="-70" y="20" width="140" height="7" rx="3.5" fill="${CHROM}"/>${rad(-40)}${rad(40)}`;

  // =========================================================================
  // Die Fahrzeuge (jedes um (0,0), Räder auf +40; nach rechts gezeichnet)
  // =========================================================================
  const D = {
    car: () => `<path d="M-58 22 Q-62 -2 -46 -6 L-34 -9 Q-22 -36 4 -36 Q30 -36 40 -11 L54 -7 Q66 -2 62 22 Z" fill="#3a7bd5"/>
      <path d="M-26 -10 Q-17 -28 -2 -29 V-10 Z M4 -29 Q23 -28 31 -10 H4 Z" fill="${GLAS}"/>
      <path d="M1 -8 V18" stroke="#2f63bd" stroke-width="2.5"/><rect x="8" y="-2" width="10" height="4" rx="2" fill="#2f63bd"/>
      <circle cx="56" cy="2" r="5" fill="#ffd166"/><rect x="-60" y="-2" width="6" height="9" rx="3" fill="#e8543f"/>
      <rect x="-62" y="16" width="124" height="8" rx="4" fill="${CHROM}"/>${rad(-36)}${rad(36)}`,
    taxi: () => `<rect x="-14" y="-42" width="28" height="13" rx="4" fill="#fff3b0" stroke="#e0a000" stroke-width="2.5"/>
      ${limo("#f4b400", "#ffd23f", Array.from({ length: 22 }, (_, i) => `<rect x="${-55 + i * 5}" y="${i % 2 ? 6 : 1}" width="5" height="5" fill="${DUNKEL}"/>`).join(""))}`,
    policecar: () => `${blink(-20, -39, 40, "#2f7bff", "#e63946")}<path d="M-30 -44 l-8 -6 M30 -44 l8 -6 M0 -46 V-54" stroke="#2f7bff" stroke-width="3" stroke-linecap="round"/>
      ${limo("#ffffff", DUNKEL, `<rect x="-30" y="-6" width="64" height="24" fill="#ffffff"/><path d="M1 -4 V18" stroke="#c3c7cf" stroke-width="2"/>
        <path d="M10 0 H22 V7 Q22 13 16 15 Q10 13 10 7 Z" fill="#ffd166"/>`)}`,
    ambulance: () => `${blink(-46, -56, 24, "#e63946", "#2f7bff")}
      <rect x="-68" y="-50" width="104" height="74" rx="9" fill="#ffffff" stroke="#c3cad6" stroke-width="2.5"/>
      <path d="M32 -36 H46 Q54 -36 58 -28 L68 -6 Q70 -2 70 4 V24 H32 Z" fill="#ffffff" stroke="#c3cad6" stroke-width="2.5"/>
      <path d="M38 -30 H47 Q51 -30 53 -26 L61 -8 H38 Z" fill="${GLAS}"/>
      <rect x="-68" y="0" width="138" height="9" fill="#e63946"/>
      <rect x="-30" y="-40" width="12" height="32" rx="2" fill="#e63946"/><rect x="-40" y="-30" width="32" height="12" rx="2" fill="#e63946"/>
      <rect x="66" y="10" width="6" height="8" rx="3" fill="#fff3b0"/><rect x="-72" y="20" width="146" height="7" rx="3.5" fill="${CHROM}"/>${rad(-40)}${rad(46)}`,
    bus: () => `<rect x="-62" y="-72" width="64" height="12" rx="5" fill="#2f9d5c"/>
      <rect x="-104" y="-64" width="208" height="94" rx="14" fill="#3fbf74"/><rect x="-104" y="6" width="208" height="24" rx="10" fill="#2f9d5c"/>
      ${[-92, -64, -36, -8].map((x) => `<rect x="${x}" y="-52" width="24" height="30" rx="4" fill="${GLAS}"/>`).join("")}
      <rect x="24" y="-52" width="30" height="74" rx="4" fill="${GLAS}"/><path d="M39 -52 V22" stroke="#2f9d5c" stroke-width="3"/>
      <rect x="64" y="-52" width="34" height="34" rx="6" fill="${GLAS}"/><rect x="-104" y="-14" width="128" height="6" fill="#ffffff"/>
      <rect x="96" y="6" width="9" height="9" rx="3" fill="#fff3b0"/>
      <circle cx="-66" cy="25" r="19" fill="#26834c"/><circle cx="68" cy="25" r="19" fill="#26834c"/>${rad(-66, 15)}${rad(68, 15)}`,
    schoolbus: (innen = "") => {
      const scheiben = (stil) => [[-94, 22, 26], [-68, 22, 26], [-42, 22, 26], [-16, 22, 26], [12, 22, 74], [42, 16, 30]].map(([x, w, h]) => `<rect x="${x}" y="-52" width="${w}" height="${h}" rx="3" ${stil}/>`).join("");
      return `<rect x="-106" y="-62" width="172" height="92" rx="12" fill="#f7b500"/><path d="M58 -18 H90 Q104 -18 104 -4 V30 H58 Z" fill="#f7b500"/>
      <rect x="-106" y="-10" width="210" height="4" fill="${DUNKEL}"/><rect x="-106" y="6" width="210" height="4" fill="${DUNKEL}"/>
      ${scheiben(`fill="${GLAS}"`)}${innen}${scheiben(`fill="none" stroke="${DUNKEL}" stroke-width="2.5"`)}<path d="M23 -52 V22" stroke="${DUNKEL}" stroke-width="2"/>
      <polygon points="-14,-14 -9,-19 -2,-19 3,-14 3,-7 -2,-2 -9,-2 -14,-7" fill="#e63946" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="-96" cy="-56" r="4" fill="#e63946"/><circle cx="56" cy="-56" r="4" fill="#e63946"/>
      <rect x="100" y="-12" width="6" height="30" rx="2" fill="${DUNKEL}"/><circle cx="96" cy="-6" r="4" fill="#fff3b0"/>
      <rect x="-110" y="22" width="12" height="8" rx="3" fill="${DUNKEL}"/><rect x="98" y="22" width="12" height="8" rx="3" fill="${DUNKEL}"/>
      <circle cx="-70" cy="25" r="18" fill="#d99a00"/><circle cx="72" cy="25" r="18" fill="#d99a00"/>${rad(-70, 15)}${rad(72, 15)}`;
    },
    truck: () => `<rect x="30" y="-56" width="5" height="40" rx="2" fill="#5d6470"/>
      <rect x="-104" y="-64" width="134" height="84" rx="6" fill="#dfe6ef"/>
      ${[-86, -68, -50, -32, -14, 4].map((x) => `<rect x="${x}" y="-58" width="4" height="72" rx="2" fill="#c3cad6"/>`).join("")}
      <rect x="-104" y="-64" width="134" height="10" rx="5" fill="#f08a24"/>
      <path d="M36 -38 H72 Q82 -38 88 -26 L98 -6 Q100 -2 100 4 V26 H36 Z" fill="#f08a24"/>
      <path d="M46 -32 H70 Q76 -32 80 -24 L88 -8 H46 Z" fill="${GLAS}"/><rect x="50" y="2" width="12" height="4" rx="2" fill="#c96f10"/>
      <rect x="-104" y="18" width="208" height="9" rx="3" fill="${DUNKEL}"/><rect x="96" y="6" width="8" height="8" rx="3" fill="#fff3b0"/>
      ${rad(-80, 14)}${rad(-50, 14)}${rad(68, 14)}`,
    firetruck: () => `<rect x="56" y="-58" width="26" height="8" rx="3" fill="#ff6b6b"/>
      <rect x="-106" y="-30" width="152" height="56" rx="6" fill="#e63946"/>
      <path d="M40 -50 H80 Q90 -50 94 -40 L102 -14 Q104 -10 104 -4 V26 H40 Z" fill="#e63946"/>
      <path d="M50 -44 H78 Q84 -44 86 -38 L92 -18 H50 Z" fill="${GLAS}"/>
      ${[-98, -64, -30].map((x) => `<rect x="${x}" y="-22" width="28" height="32" rx="3" fill="#c8303c"/><rect x="${x + 8}" y="-6" width="12" height="3" rx="1.5" fill="${CHROM}"/>`).join("")}
      <rect x="-106" y="14" width="210" height="5" fill="#ffffff"/><rect x="-10" y="-40" width="8" height="12" fill="#9aa0ab"/>
      <path d="M-112 -46 H54 M-112 -36 H54" stroke="#eef0f3" stroke-width="4" stroke-linecap="round"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${-108 + i * 12}" y="-46" width="3" height="10" fill="#c3cad6"/>`).join("")}
      <rect x="98" y="16" width="10" height="12" rx="3" fill="${CHROM}"/><rect x="98" y="0" width="6" height="8" rx="3" fill="#fff3b0"/>
      <rect x="-106" y="20" width="212" height="8" fill="#b5272f"/>${rad(-76, 14)}${rad(-46, 14)}${rad(70, 14)}`,
    motorbike: () => `<path d="M44 22 L28 -26" stroke="#5d6470" stroke-width="7" stroke-linecap="round"/><path d="M18 -32 L34 -30" stroke="${DUNKEL}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="-42" cy="22" r="18" fill="${DUNKEL}"/><circle cx="-42" cy="22" r="8" fill="${CHROM}"/>
      <circle cx="44" cy="22" r="18" fill="${DUNKEL}"/><circle cx="44" cy="22" r="8" fill="${CHROM}"/>
      <path d="M-64 6 Q-50 -10 -30 -2 Z" fill="#6c5ce7"/><path d="M26 2 Q44 -12 62 6 L56 8 Q44 -2 32 6 Z" fill="#6c5ce7"/>
      <rect x="-18" y="-2" width="32" height="24" rx="7" fill="#5d6470"/><rect x="-10" y="4" width="16" height="4" rx="2" fill="${CHROM}"/>
      <rect x="-62" y="10" width="48" height="8" rx="4" fill="${CHROM}"/>
      <path d="M-40 -4 Q-40 -14 -28 -14 H-6 Q4 -34 26 -26 L30 -16 Q20 -4 8 0 H-30 Q-40 2 -40 -4 Z" fill="#6c5ce7"/>
      <path d="M-54 -14 Q-50 -24 -30 -22 H-8 L-10 -14 H-50 Z" fill="${DUNKEL}"/><path d="M0 -24 Q10 -30 20 -26" stroke="#a99cf2" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="-16" r="7" fill="#ffd166" stroke="#6c5ce7" stroke-width="3"/>`,
    train: () => `<circle cx="96" cy="-74" r="8" fill="#ffffff" opacity="0.9"/><circle cx="80" cy="-88" r="11" fill="#ffffff" opacity="0.9"/>
      <rect x="-112" y="-38" width="124" height="58" rx="8" fill="#3a7bd5"/><rect x="-116" y="-46" width="132" height="12" rx="6" fill="#2f63bd"/>
      ${[-102, -74, -46, -18].map((x) => `<rect x="${x}" y="-28" width="22" height="22" rx="4" fill="${GLAS}"/>`).join("")}
      <rect x="-112" y="2" width="124" height="6" fill="#ffd166"/><rect x="10" y="6" width="16" height="6" fill="${DUNKEL}"/>
      <rect x="22" y="-52" width="40" height="72" rx="6" fill="#e8543f"/><rect x="18" y="-60" width="48" height="10" rx="4" fill="#b23a34"/><rect x="30" y="-44" width="24" height="20" rx="4" fill="${GLAS}"/>
      <rect x="56" y="-28" width="50" height="48" rx="12" fill="#e8543f"/><rect x="56" y="-8" width="50" height="5" fill="#ffd166"/>
      <path d="M82 -28 V-50 M76 -54 H96" stroke="${DUNKEL}" stroke-width="12" stroke-linecap="round"/><path d="M80 -52 H94" stroke="${DUNKEL}" stroke-width="12"/>
      <circle cx="68" cy="-30" r="7" fill="#ffd166"/><circle cx="106" cy="-12" r="5" fill="#fff3b0"/>
      <path d="M104 14 L118 36 H98 Z" fill="${DUNKEL}"/><rect x="-112" y="16" width="220" height="7" rx="3" fill="${DUNKEL}"/>
      ${rad(-92, 11)}${rad(-68, 11)}${rad(-14, 11)}${rad(42, 15)}${rad(80, 15)}`,
    plane: () => `<path d="M-74 -12 L-90 -52 L-68 -52 L-44 -14 Z" fill="#3a7bd5"/>
      <path d="M-4 -10 L-30 -40 L-14 -40 L24 -10 Z" fill="#9fb4cc"/>
      <path d="M-82 -6 Q-84 -14 -72 -14 L54 -14 Q82 -14 88 2 Q84 14 62 14 L-62 14 Q-76 14 -82 -6 Z" fill="#ffffff"/>
      <path d="M-74 6 L62 6 Q80 6 86 6 Q80 14 62 14 L-62 14 Q-72 14 -74 6 Z" fill="#e3e8ef"/>
      ${Array.from({ length: 9 }, (_, i) => `<circle cx="${-50 + i * 12}" cy="-4" r="3.6" fill="#3a7bd5"/>`).join("")}
      <path d="M64 -10 Q76 -10 82 -2 L64 -2 Z" fill="${DUNKEL}"/>
      <path d="M-74 -2 L-98 -12 L-94 4 Z" fill="#2f63bd"/>
      <path d="M-6 6 L-34 40 L-16 40 L28 6 Z" fill="#2f63bd"/><ellipse cx="2" cy="20" rx="14" ry="6" fill="#9fb4cc"/>`,
    helicopter: () => `<ellipse cx="0" cy="-46" rx="74" ry="5" fill="#ffffff" opacity="0.55"/>
      <rect x="-72" y="-49" width="144" height="6" rx="3" fill="#5d6882"/><rect x="-4" y="-46" width="8" height="14" fill="#5d6882"/>
      <path d="M-28 -12 L-88 -20 L-88 -8 L-28 2 Z" fill="#11928a"/>
      <path d="M-90 -34 V-2 M-104 -18 H-76" stroke="#5d6882" stroke-width="4" stroke-linecap="round"/><circle cx="-90" cy="-18" r="4" fill="#5d6882"/>
      <path d="M-32 -6 Q-32 -34 2 -34 Q36 -34 42 -4 Q44 18 12 18 H-20 Q-32 18 -32 -6 Z" fill="#17b3ac"/>
      <path d="M8 -30 Q32 -30 38 -6 H8 Z" fill="${GLAS}"/><rect x="-20" y="-24" width="20" height="18" rx="4" fill="${GLAS}"/>
      <rect x="-32" y="4" width="74" height="5" fill="#ffffff"/>
      <path d="M-30 34 H38 Q44 34 46 28 M-14 18 L-18 34 M20 18 L24 34" stroke="#5d6882" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    trafficlight: (farbe = "gruen") => {
      const licht = (y, hell, dunkel, ein) => `${ein ? `<circle cy="${y}" r="17" fill="${hell}" opacity="0.4"/>` : ""}<circle cy="${y}" r="11" fill="${ein ? hell : dunkel}"/>${ein ? `<circle cx="-4" cy="${y - 4}" r="3.5" fill="#ffffff" opacity="0.75"/>` : ""}`;
      return `<rect x="-5" y="-66" width="10" height="104" rx="4" fill="#5d6470"/><rect x="-16" y="34" width="32" height="7" rx="3" fill="#5d6470"/>
        <rect x="-22" y="-154" width="44" height="92" rx="11" fill="${DUNKEL}"/>
        ${licht(-131, "#ff4b3e", "#6b3434", farbe === "rot")}${licht(-108, "#ffc93c", "#6b5a2a", false)}${licht(-85, "#3fdc6a", "#2c5a3a", farbe !== "rot")}`;
    },
  };
  // Auf der Gegenfahrbahn fahren sie nach links.
  const LINKS = ["bus", "taxi", "car", "motorbike"];
  Object.assign(A.DING, Object.fromEntries(Object.entries(D).map(([id, f]) => [id, LINKS.includes(id) ? (...a) => spiegel(f(...a)) : f])));
  const rechtsNach = D;

  // =========================================================================
  // Die Strasse (1000 × 560): Himmel, Hügel, Viadukt mit Gleis (y 200),
  // Häuserzeile, Trottoir, Strasse mit Zebrastreifen, Trottoir vorne
  // =========================================================================
  const fenster = (x, y, w = 20, h = 24) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#ffffff"/><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="2" fill="#bfe6f5"/>`;
  const tuer = (x, y, farbe = "#a8743f") => `<rect x="${x}" y="${y}" width="22" height="${352 - y}" rx="3" fill="${farbe}"/><circle cx="${x + 17}" cy="${y + (352 - y) / 2}" r="2.5" fill="#ffd166"/>`;
  const giebel = (x, w, top, farbe, dach) => `<path d="M${x - 6} ${top + 34} L${x + w / 2} ${top} L${x + w + 6} ${top + 34} Z" fill="${dach}"/><rect x="${x}" y="${top + 32}" width="${w}" height="${352 - top - 32}" fill="${farbe}"/>`;
  const flach = (x, w, top, farbe, sims) => `<rect x="${x}" y="${top}" width="${w}" height="${352 - top}" fill="${farbe}"/><rect x="${x - 4}" y="${top - 6}" width="${w + 8}" height="9" rx="2" fill="${sims}"/>`;
  const markise = (x, w, y, a, b) => `${Array.from({ length: Math.round(w / 14) }, (_, i) => `<rect x="${x + i * 14}" y="${y}" width="14" height="16" fill="${i % 2 ? b : a}"/>`).join("")}<path d="M${x} ${y + 16} ${Array.from({ length: Math.round(w / 14) }, () => "q7 8 14 0").join(" ")}" fill="${a}"/>`;
  const baum = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="-10" width="12" height="40" rx="4" fill="#8a6a4a"/><circle cx="0" cy="-30" r="26" fill="#6fba5a"/><circle cx="-18" cy="-12" r="16" fill="#6fba5a"/><circle cx="18" cy="-12" r="16" fill="#6fba5a"/></g>`;
  const laterne = (x) => `<rect x="${x - 2.5}" y="282" width="5" height="80" fill="#5d6470"/><path d="M${x} 284 q0 -10 12 -10" stroke="#5d6470" stroke-width="5" fill="none"/><rect x="${x + 6}" y="270" width="16" height="8" rx="3" fill="#ffd166"/>`;
  A.HINTERGRUND.city = () => {
    let viadukt = "";
    for (let x = -30; x < 1000; x += 80) viadukt += `<path d="M${x} 210 H${x + 80} V320 H${x + 70} V266 A30 30 0 0 0 ${x + 10} 266 V320 H${x} Z" fill="#cdb99c"/>`;
    let schwellen = "";
    for (let x = 4; x < 1000; x += 16) schwellen += `<rect x="${x}" y="198" width="9" height="5" rx="1" fill="#8a6a4a"/>`;
    let zebra = "";
    for (let k = 0; k < 7; k += 1) {
      const y = 375 + k * 22, w = 66 + k * 4;
      zebra += `<path d="M${690 - w / 2 + 2} ${y} H${690 + w / 2 + 2} L${690 + w / 2} ${y + 12} H${690 - w / 2} Z" fill="#ffffff"/>`;
    }
    return `<rect width="1000" height="560" fill="url(#himmel)"/>
      ${wolke(120, 168, 0.6)}${wolke(530, 46, 0.55)}${wolke(900, 160, 0.7)}
      <path d="M0 246 Q180 212 380 234 T760 226 T1000 236 V560 H0 Z" fill="#b5dc8a"/>
      ${viadukt}<rect x="0" y="202" width="1000" height="12" fill="#b39e80"/>${schwellen}<rect x="0" y="196" width="1000" height="3" fill="#6f7682"/>
      ${giebel(0, 92, 236, "#a9d4e8", "#5d6882")}${fenster(14, 288)}${fenster(56, 288)}${tuer(36, 318, "#3a7bd5")}
      ${flach(96, 156, 262, "#c8604a", "#a84a38")}<rect x="156" y="236" width="36" height="28" fill="#c8604a"/><path d="M150 238 L174 220 L198 238 Z" fill="#8f2d29"/><circle cx="174" cy="250" r="7" fill="#ffd166"/>
      <rect x="112" y="290" width="124" height="62" rx="6" fill="#ffffff"/><rect x="118" y="296" width="112" height="56" rx="4" fill="#8f2d29"/>
      ${[0, 1, 2, 3].map((k) => `<rect x="118" y="${306 + k * 12}" width="112" height="3" fill="#7a2420"/>`).join("")}
      ${flach(252, 138, 272, "#f6e3c4", "#d6b98d")}${fenster(266, 280, 22, 18)}${fenster(300, 280, 22, 18)}${fenster(334, 280, 22, 18)}${markise(264, 112, 304, "#e8543f", "#ffffff")}
      <rect x="268" y="326" width="70" height="26" rx="2" fill="#bfe6f5"/>${tuer(350, 326, "#8a5a35")}
      ${giebel(390, 80, 246, "#f6d77a", "#c8423b")}${fenster(402, 290)}${fenster(440, 290)}${tuer(418, 322, "#3fa34d")}
      ${flach(470, 140, 268, "#bfe3c8", "#8fc7a0")}${fenster(484, 276, 22, 20)}${fenster(518, 276, 22, 20)}${fenster(552, 276, 22, 20)}${markise(480, 112, 304, "#3a7bd5", "#ffffff")}
      <rect x="484" y="326" width="70" height="26" rx="2" fill="#bfe6f5"/>${tuer(566, 326, "#2f63bd")}
      ${flach(610, 92, 252, "#b8763d", "#8a5a35")}${fenster(622, 262)}${fenster(660, 262)}${fenster(622, 298)}${fenster(660, 298)}${tuer(645, 330, "#6d4628")}
      ${giebel(702, 100, 250, "#f4b6c2", "#8a5a35")}${fenster(716, 294)}${fenster(766, 294)}${tuer(740, 320, "#ef6fa8")}
      ${flach(802, 198, 262, "#e6dcf5", "#c3b6e0")}${fenster(816, 272)}${fenster(852, 272)}${fenster(888, 272)}${fenster(816, 310)}${fenster(852, 310)}${fenster(888, 310)}${tuer(926, 318, "#6c5ce7")}
      ${baum(970, 330, 0.9)}${laterne(444)}${laterne(600)}
      <rect x="0" y="352" width="1000" height="16" fill="${TROTTOIR}"/><rect x="0" y="366" width="1000" height="5" fill="${CHROM}"/>
      <rect x="0" y="371" width="1000" height="157" fill="${ASPHALT}"/>
      <path d="M0 446 H644 M738 446 H1000 M0 452 H644 M738 452 H1000" stroke="#ffd23f" stroke-width="3"/>
      ${zebra}
      <rect x="0" y="528" width="1000" height="6" fill="${CHROM}"/><rect x="0" y="534" width="1000" height="26" fill="${TROTTOIR}"/>
      ${[80, 240, 400, 560, 720, 880].map((x) => `<path d="M${x} 534 V560" stroke="${CHROM}" stroke-width="2"/>`).join("")}`;
  };

  // Lage: Himmel, Viadukt, vor der Feuerwehr, Gegenfahrbahn (Räder y 440),
  // vordere Fahrbahn (Räder y 524)
  const fahr = (x, rad, m, ecke) => [x, rad - 40 * m, m, ecke];
  A.ORTE.city = {
    plane: [310, 84, 0.9, [70, -46]],
    helicopter: [714, 112, 0.8, [60, -44]],
    train: [520, 166, 0.85, [112, -44]],
    firetruck: fahr(160, 362, 0.8, [96, -52]),
    trafficlight: fahr(770, 362, 0.8, [20, -150]),
    motorbike: fahr(110, 440, 0.85, [56, -30]),
    bus: fahr(338, 440, 0.8, [96, -64]),
    taxi: fahr(530, 440, 0.85, [60, -40]),
    car: fahr(872, 440, 0.85, [58, -32]),
    schoolbus: fahr(140, 524, 0.8, [100, -60]),
    policecar: fahr(362, 524, 0.85, [62, -40]),
    ambulance: fahr(548, 524, 0.85, [66, -52]),
    truck: fahr(866, 524, 0.8, [100, -62]),
  };

  Object.assign(A.STICKER, {
    car: [0.42, -6], taxi: [0.4, -2], policecar: [0.4, 0], ambulance: [0.4, 8], bus: [0.27, 14], schoolbus: [0.27, 14],
    truck: [0.28, 12], firetruck: [0.27, 10], motorbike: [0.45, -4], train: [0.25, 20], plane: [0.31, 8], helicopter: [0.33, 8],
    trafficlight: [0.34, 57],
  });
  A.AUFNAEHER_BILD.city = "schoolbus";
  A.AUFNAEHER_FARBE.city = "#c62f3a";

  // =========================================================================
  // Die Geschichte «The yellow school bus.» (vier Bilder, je 472 × 204)
  // =========================================================================
  const at = (x, y, s, inhalt) => `<g transform="translate(${x} ${y}) scale(${s})">${inhalt}</g>`;
  const herz = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/>`;
  const strasse = (zebra = 0) => `<rect width="472" height="204" fill="#cdeefb"/>${wolke(70, 24, 0.4)}${wolke(396, 18, 0.35)}
    <path d="M-4 128 V80 L30 56 L64 80 V128 Z" fill="#a9d4e8"/><rect x="64" y="70" width="96" height="58" fill="#f6e3c4"/><rect x="60" y="64" width="104" height="8" rx="2" fill="#d6b98d"/>
    <path d="M160 128 V84 L200 58 L240 84 V128 Z" fill="#f6d77a"/><rect x="240" y="66" width="84" height="62" fill="#bfe3c8"/><rect x="236" y="60" width="92" height="8" rx="2" fill="#8fc7a0"/>
    <path d="M324 128 V82 L364 56 L404 82 V128 Z" fill="#f4b6c2"/><rect x="404" y="72" width="72" height="56" fill="#e6dcf5"/><rect x="400" y="66" width="80" height="8" rx="2" fill="#c3b6e0"/>
    ${[[12, 92], [80, 84], [124, 84], [184, 92], [256, 80], [292, 80], [348, 92], [420, 86], [450, 86]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="18" rx="2" fill="#ffffff"/><rect x="${x + 2.5}" y="${y + 2.5}" width="11" height="13" rx="1.5" fill="#bfe6f5"/>`).join("")}
    <rect y="126" width="472" height="10" fill="${TROTTOIR}"/><rect y="136" width="472" height="46" fill="${ASPHALT}"/>
    <path d="M0 158 H472" stroke="#ffd23f" stroke-width="2.5" stroke-dasharray="18 12"/>
    ${zebra ? Array.from({ length: 4 }, (_, k) => `<rect x="${zebra - 24 - k * 2}" y="${139 + k * 11}" width="${48 + k * 4}" height="7" fill="#ffffff"/>`).join("") : ""}
    <rect y="182" width="472" height="5" fill="${CHROM}"/><rect y="187" width="472" height="17" fill="#e8eaee"/>`;
  // Die Haltestelle: Stange mit Schild, darauf ein Bus
  const haltestelle = (x) => `<rect x="${x - 2.5}" y="58" width="5" height="138" rx="2" fill="#5d6470"/>
    <rect x="${x - 20}" y="40" width="40" height="40" rx="6" fill="#ffd23f" stroke="${DUNKEL}" stroke-width="3"/>
    <rect x="${x - 13}" y="50" width="26" height="15" rx="3" fill="${DUNKEL}"/><rect x="${x - 10}" y="53" width="7" height="5" rx="1" fill="#ffd23f"/><rect x="${x - 1}" y="53" width="7" height="5" rx="1" fill="#ffd23f"/>
    <circle cx="${x - 7}" cy="68" r="3.5" fill="${DUNKEL}"/><circle cx="${x + 7}" cy="68" r="3.5" fill="${DUNKEL}"/>`;
  // Rocco mit Rucksack (hinten der Sack, vorne die Träger)
  const roccoRucksack = (pose, laune) => `<rect x="-41" y="-86" width="82" height="64" rx="18" fill="#e8543f"/>
    <rect x="-49" y="-60" width="14" height="28" rx="6" fill="#ffd166"/><rect x="35" y="-60" width="14" height="28" rx="6" fill="#ffd166"/>
    ${A.rocco(pose, laune)}
    <path d="M-15 -68 Q-19 -48 -15 -26 M15 -68 Q19 -48 15 -26" stroke="#c8423b" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  // Kinder im Bus (in Bus-Einheiten, in einem Fenster)
  const kind = (x, haar) => `<circle cx="${x}" cy="-33" r="8.5" fill="${HAUT}"/><path d="M${x - 9} -34 Q${x - 9} -44 ${x} -44 Q${x + 9} -44 ${x + 9} -34 Q${x + 4} -39 ${x} -39 Q${x - 4} -39 ${x - 9} -34 Z" fill="${haar}"/>
    <circle cx="${x - 3}" cy="-33" r="1.4" fill="${DUNKEL}"/><circle cx="${x + 3}" cy="-33" r="1.4" fill="${DUNKEL}"/><rect x="${x - 9}" y="-26" width="18" height="4" rx="2" fill="#3fbf74"/>`;
  // Rocco lehnt aus einem Fenster (über dem Bus gezeichnet); winkt, wenn gewünscht
  const roccoImFenster = (x, winkt = false, laune = "freude") => `${winkt ? `<ellipse cx="${x - 17}" cy="-58" rx="6.5" ry="15" transform="rotate(-32 ${x - 17} -58)" fill="${GRAU_D}"/>
    <path d="M${x - 31} -80 q-5 6 0 12 M${x - 38} -85 q-7 9 0 20" stroke="#5d6882" stroke-width="2.5" fill="none" stroke-linecap="round"/>` : ""}
    ${at(x, -42, 0.47, A.roccoKopf(laune))}`;
  const fahrt = (x, y) => `<path d="M${x} ${y} h-30 M${x - 6} ${y + 16} h-40 M${x} ${y + 32} h-26" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`;
  const bus = (x, s, innen = "", oben = "") => at(x, 180 - 40 * s, s, rechtsNach.schoolbus(innen) + oben);
  A.GESCHICHTEN_BILDER.schoolbus = [
    () => `${strasse()}${haltestelle(330)}
      ${tb('data-wort="raccoon"', at(220, 198, 0.9, roccoRucksack("steh", "hoch")))}`,
    () => `${strasse()}${haltestelle(330)}${fahrt(40, 104)}
      ${tb('data-wort="schoolbus"', bus(150, 0.88, `${kind(-83, "#6d4628")}${kind(-31, "#2b2f38")}`))}
      ${at(398, 198, 0.86, roccoRucksack("jubel", "freude"))}
      ${herz(300, 30, 0.8)}`,
    () => `${strasse(318)}
      ${tb('data-wort="schoolbus"', bus(160, 0.88, `${kind(-83, "#6d4628")}${kind(-57, "#2b2f38")}`, roccoImFenster(-5, false, "froh")))}
      ${tb('data-wort="trafficlight"', at(400, 198, 0.72, A.DING.trafficlight("rot")))}`,
    () => `${strasse(124)}
      ${tb('data-wort="trafficlight"', at(62, 198, 0.72, A.DING.trafficlight("gruen")))}
      ${fahrt(206, 114)}
      ${tb('data-wort="schoolbus"', bus(334, 0.88, `${kind(-31, "#6d4628")}${kind(-5, "#2b2f38")}`, roccoImFenster(-83, true)))}
      ${herz(196, 40, 0.8)}`,
  ];
  A.TITELBILD.schoolbus = 1;
})();

// Englischecke, Welt school (für englisch-art-2.js)
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { tb, bildHintergrund, menschOder, wolke, FARBE } = A.hilfen;
  const { DUNKEL, GRAU_D, HAUT } = FARBE;
  const KREIDE = "#f4f7ef", TAFEL = "#2f6b52", RAHMEN = "#b07a45";
  const WAND = "#fdf1d8", BODEN = "#e7bf87", LEISTE = "#b98352";
  const f1 = (n) => Number(n.toFixed(1));
  const at = (x, y, s, inhalt, w = 0) => `<g transform="translate(${x} ${y})${w ? ` rotate(${w})` : ""} scale(${s})">${inhalt}</g>`;
  const stern5 = (x, y, r, farbe = "#ffd166") => `<polygon points="${Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${f1(x + rr * Math.cos(a))},${f1(y + rr * Math.sin(a))}`; }).join(" ")}" fill="${farbe}"/>`;
  const funkel = (x, y, r = 8, farbe = "#ffd166") => `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="${farbe}"/>`;
  const herz = (x, y, s = 1, farbe = "#ef6fa8") => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="${farbe}"/>`;

  // Die Lehrerin (Füsse bei 0,0, etwa 170 hoch): mit roter Brille, auf Wunsch
  // mit dem Zeigestock in der vorderen Hand (zeigt nach links oben)
  const brille = `<g transform="scale(1.3)" fill="#ffffff" fill-opacity="0.25" stroke="#c8423b" stroke-width="1.5" stroke-linecap="round">
    <circle cx="-3.9" cy="-101.3" r="5.6"/><circle cx="9.8" cy="-101.3" r="5.1"/><path d="M1.7 -101.9 Q3.2 -103.5 4.7 -101.9 M-9.5 -102 L-15.3 -102.9" fill="none"/></g>`;
  const lehrerin = (zeiger = true, ziel = [-80, -146]) => `${menschOder("m_frau", 1.3, `<circle cx="0" cy="-134" r="23" fill="${HAUT}"/><path d="M-23 -138 Q-22 -162 0 -161 Q22 -162 23 -138 Q12 -150 0 -148 Q-12 -150 -23 -138 Z" fill="#3b2a22"/>
      <rect x="-24" y="-110" width="48" height="56" rx="16" fill="#f2b632"/><path d="M-22 -60 H22 L30 -26 H-30 Z" fill="#2aa198"/><rect x="-16" y="-28" width="10" height="28" fill="${HAUT}"/><rect x="6" y="-28" width="10" height="28" fill="${HAUT}"/>
      <circle cx="-8" cy="-134" r="2.8" fill="${DUNKEL}"/><circle cx="9" cy="-134" r="2.8" fill="${DUNKEL}"/><path d="M-7 -124 Q1 -118 8 -124" stroke="${DUNKEL}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`)}${brille}
    ${zeiger ? `<path d="M-21 -60 L${ziel[0]} ${ziel[1]}" stroke="#8a5a35" stroke-width="4.5" stroke-linecap="round"/><circle cx="${ziel[0]}" cy="${ziel[1]}" r="4" fill="#e8543f"/>` : ""}`;

  // Die Wandtafel ohne Schrift: ein paar Kreidekritzel (Haus, Sonne, Welle)
  const tafel = (kritzel = true) => `<rect x="-146" y="-86" width="292" height="164" rx="9" fill="${RAHMEN}"/><rect x="-136" y="-76" width="272" height="144" rx="4" fill="${TAFEL}"/>
    <path d="M-128 -60 L-104 -70 M-128 -48 L-118 -52" stroke="#4d8a6f" stroke-width="5" stroke-linecap="round"/>
    ${kritzel ? `<g stroke="${KREIDE}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.92">
      <path d="M-104 40 V2 H-56 V40 Z M-112 6 L-80 -26 L-48 6 M-86 40 V20 H-74 V40"/>
      <circle cx="-6" cy="-30" r="16"/><path d="M-6 -56 V-50 M-6 -10 V-4 M-32 -30 H-26 M14 -30 H20 M-24 -48 L-20 -44 M12 -16 L8 -12 M12 -48 L8 -44 M-24 -12 L-20 -16"/>
      <path d="M-24 34 q10 -12 20 0 t20 0 t20 0 t20 0"/><circle cx="74" cy="-28" r="20" stroke="#ffe27a"/><path d="M56 22 L74 -2 L92 22 Z" stroke="#ffb3c7"/></g>` : ""}
    <rect x="-152" y="76" width="304" height="11" rx="4" fill="#8a5a35"/>
    <rect x="-112" y="70" width="22" height="7" rx="3" fill="#ffffff"/><rect x="-80" y="70" width="16" height="7" rx="3" fill="#ffe27a"/><rect x="88" y="70" width="18" height="7" rx="3" fill="#ffb3c7"/>`;

  // Das Blatt Papier: liniert, mit rotem Rand, drei Löchern und Eselsohr
  const blatt = (linien = true) => `<path d="M-48 -62 H48 V40 L26 62 H-48 Z" fill="#ffffff" stroke="#cfd6e0" stroke-width="2.5" stroke-linejoin="round"/>
    ${linien ? `${[-40, -26, -12, 2, 16, 30, 44].map((y) => `<path d="M-48 ${y} H${y > 38 ? 24 : 48}" stroke="#9cc7ee" stroke-width="2"/>`).join("")}<path d="M-30 -62 V62" stroke="#ef8a8a" stroke-width="2.2"/>
    ${[-40, 0, 40].map((y) => `<circle cx="-40" cy="${y}" r="4" fill="#dfe4ec"/>`).join("")}` : ""}
    <path d="M48 40 H26 V62 Z" fill="#e3e8ef" stroke="#cfd6e0" stroke-width="2.5" stroke-linejoin="round"/>`;

  // Rotes Wachsmalstift (liegt schräg, Spitze oben rechts)
  const wachs = (farbe = "#e8543f", dunkel = "#c03a2c") => `<g transform="rotate(-30)">
    <path d="M-66 -16 H30 L56 -7 Q62 0 56 7 L30 16 H-66 Q-72 16 -72 10 V-10 Q-72 -16 -66 -16 Z" fill="${farbe}"/>
    <rect x="-58" y="-17" width="82" height="34" rx="3" fill="${dunkel}"/><path d="M-50 -17 V17 M16 -17 V17" stroke="${DUNKEL}" stroke-width="4"/>
    <path d="M-38 0 q5 -7 10 0 t10 0 t10 0 t10 0" stroke="#ffd166" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M-56 -11 H22 M34 -10 L52 -4" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.35"/></g>`;

  Object.assign(A.DING, {
    pencil: () => `<g transform="rotate(-30)">
      <rect x="-82" y="-12" width="24" height="24" rx="7" fill="#f48fb1"/><rect x="-65" y="-13" width="19" height="26" rx="2" fill="#c3c7cf"/><path d="M-59 -13 V13 M-53 -13 V13" stroke="#9aa0ab" stroke-width="2"/>
      <path d="M47 -12 L82 0 L47 12 Z" fill="#f4cf9c"/><path d="M70 -4.1 L82 0 L70 4.1 Z" fill="${DUNKEL}"/>
      <rect x="-47" y="-12" width="94" height="24" fill="#ffc83d"/><rect x="-47" y="-12" width="94" height="7" fill="#ffe07a"/><rect x="-47" y="5" width="94" height="7" fill="#f2a900"/>
      <path d="M46 -12 Q53 -8 47 -4 Q53 0 47 4 Q53 8 47 12 Z" fill="#ffc83d"/></g>`,
    crayon: () => wachs(),
    book: () => `<path d="M-68 -30 Q-34 -46 0 -32 Q34 -46 68 -30 V44 Q34 32 0 46 Q-34 32 -68 44 Z" fill="#3fa34d"/>
      <path d="M-62 -34 Q-30 -48 -1 -34 V38 Q-30 26 -62 38 Z" fill="#ffffff"/><path d="M62 -34 Q30 -48 1 -34 V38 Q30 26 62 38 Z" fill="#fff8ea"/>
      <path d="M-62 38 Q-30 26 -1 38 M62 38 Q30 26 1 38" stroke="#e1d9c6" stroke-width="3" fill="none"/><path d="M0 -34 V40" stroke="#d9cdb4" stroke-width="2.5"/>
      <path d="M-52 -26 Q-30 -34 -10 -26 V4 Q-30 -4 -52 4 Z" fill="#bfe6f5"/><path d="M-52 4 Q-44 -10 -32 -6 Q-22 -14 -10 -4 V4 Q-30 -4 -52 4 Z" fill="#94cd60"/><circle cx="-22" cy="-20" r="5" fill="#ffd23f"/>
      ${[12, 22].map((y) => `<path d="M-52 ${y} Q-30 ${y - 8} -10 ${y}" stroke="#c3c7cf" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")}
      ${[-24, -12, 0, 12, 24].map((y) => `<path d="M10 ${y} Q30 ${y - 8} 52 ${y}" stroke="#c3c7cf" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")}`,
    backpack: () => `<path d="M-18 -62 Q-18 -80 0 -80 Q18 -80 18 -62" stroke="#2f63bd" stroke-width="7" fill="none"/>
      <path d="M-38 -38 Q-58 4 -46 50 M38 -38 Q58 4 46 50" stroke="#2f63bd" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M-42 48 V-22 Q-42 -66 0 -66 Q42 -66 42 -22 V48 Q42 58 32 58 H-32 Q-42 58 -42 48 Z" fill="#3a7bd5"/>
      <path d="M-34 -22 Q0 -52 34 -22" stroke="#2f63bd" stroke-width="3" fill="none"/><circle cx="27" cy="-30" r="4.5" fill="#ffd166"/>
      <rect x="-31" y="0" width="62" height="48" rx="14" fill="#5a9be6"/><path d="M-31 14 H31" stroke="#2f63bd" stroke-width="3"/><rect x="17" y="10" width="7" height="13" rx="3.5" fill="#ffd166"/>
      ${stern5(0, -36, 11)}`,
    scissors: () => `<g transform="rotate(32)">
      ${[-1, 1].map((k) => `<g transform="rotate(${-14 * k})"><path d="M${-7 * k} 6 L${-5 * k} -58 Q0 -72 ${6 * k} -58 L${7 * k} 6 Z" fill="#c9ced6" stroke="#9aa0ab" stroke-width="1.5"/>
        <rect x="-4" y="4" width="8" height="18" fill="#8e5bd6"/><ellipse cx="0" cy="38" rx="14" ry="18" fill="none" stroke="#8e5bd6" stroke-width="9"/></g>`).join("")}
      <circle r="5.5" fill="#6f7682"/><circle r="2" fill="#c9ced6"/></g>`,
    glue: () => `<path d="M-5 -62 L0 -80 L5 -62 Z" fill="#f08a24"/><path d="M-15 -42 L-9 -62 H9 L15 -42 Z" fill="#f5a623"/>
      <path d="M-28 -22 Q-28 -42 -14 -42 H14 Q28 -42 28 -22 V44 Q28 54 18 54 H-18 Q-28 54 -28 44 Z" fill="#ffffff" stroke="#c3cad6" stroke-width="3"/>
      <rect x="-27" y="-8" width="54" height="40" fill="#3a7bd5"/><path d="M0 -2 Q10 10 10 16 A10 10 0 0 1 -10 16 Q-10 10 0 -2 Z" fill="#ffffff"/>
      <path d="M-20 -30 V-18" stroke="#e9edf3" stroke-width="5" stroke-linecap="round"/>`,
    paper: () => `<g transform="rotate(-8)">${blatt()}</g>`,
    teacher: () => lehrerin(),
    board: () => tafel(),
    desk: () => `<path d="M-60 -2 L-66 46 M60 -2 L66 46" stroke="#8d939e" stroke-width="7" stroke-linecap="round"/><path d="M-63 28 H63" stroke="#8d939e" stroke-width="5"/>
      <path d="M-76 46 H-58 M58 46 H76" stroke="#5d6470" stroke-width="7" stroke-linecap="round"/>
      <rect x="-70" y="-42" width="140" height="40" rx="5" fill="#4f9fb0"/><rect x="-70" y="-12" width="140" height="10" rx="3" fill="#3f8796"/>
      <path d="M-82 -52 L-72 -62 H72 L82 -52 Z" fill="#f3d3a0"/><rect x="-86" y="-54" width="172" height="13" rx="5" fill="#d39a5a"/>`,
    ruler: () => {
      let striche = "";
      for (let i = 0; i <= 20; i += 1) striche += `M${f1(-76 + i * 7.6)} -17 v${i % 10 === 0 ? 16 : i % 2 ? 7 : 11}`;
      return `<g transform="rotate(-20)"><rect x="-86" y="-17" width="172" height="34" rx="5" fill="#f2c879"/><rect x="-86" y="7" width="172" height="10" rx="4" fill="#dfa954"/>
        <path d="${striche}" stroke="#8a5a35" stroke-width="2.4" stroke-linecap="round"/><circle cx="-78" cy="7" r="3.5" fill="#c08a3e"/></g>`;
    },
    eraser: () => `<path d="M-34 -6 L-22 -22 H62 L50 -6 Z" fill="#f9b6cf"/><path d="M-50 24 L-34 -6 H50 L34 24 Z" fill="#f27ba5"/>
      <path d="M50 -6 L62 -22 L48 6 L34 24 Z" fill="#e0628f"/><path d="M-36 12 H24" stroke="#f9b6cf" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
      ${[[-62, 26], [-52, 30], [-68, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#f27ba5"/>`).join("")}`,
    paintbrush: () => `<g transform="translate(6 24)">
      <ellipse cx="22" cy="6" rx="34" ry="9" fill="#d9dce2"/><path d="M-12 6 L-8 44 Q22 52 52 44 L56 6 Z" fill="#eef0f3"/><path d="M-10 22 Q22 30 54 22 L53 32 Q22 40 -9 32 Z" fill="#3a7bd5"/>
      <ellipse cx="22" cy="6" rx="30" ry="7" fill="#3a7bd5"/><path d="M-12 6 Q-14 16 -8 18" stroke="#3a7bd5" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g transform="translate(16 4) rotate(-38)"><path d="M-6 -44 L-4 -124 Q0 -130 4 -124 L6 -44 Z" fill="#e8543f"/>
        <rect x="-8" y="-46" width="16" height="20" rx="2" fill="#c3c7cf"/><path d="M-8 -38 H8" stroke="#9aa0ab" stroke-width="2"/>
        <path d="M-8 -26 Q-10 -10 0 2 Q10 -10 8 -26 Z" fill="#c98b4f"/><path d="M-7 -14 Q-5 -4 0 2 Q5 -4 7 -14 Q0 -10 -7 -14 Z" fill="#3a7bd5"/></g></g>`,
  });

  // =========================================================================
  // Das Klassenzimmer (1000 × 560)
  // =========================================================================
  const wimpel = (x1, x2, y, s = 1) => {
    const n = Math.floor((x2 - x1) / (34 * s));
    const farben = ["#e8543f", "#ffffff", "#3a7bd5", "#ffd166"];
    let t = `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + 14 * s} ${x2} ${y}" stroke="#8a5a35" stroke-width="${f1(2 * s)}" fill="none"/>`;
    for (let i = 0; i < n; i += 1) {
      const x = x1 + (i + 0.5) * (x2 - x1) / n, u = (x - x1) / (x2 - x1), yy = f1(y + 4 * 14 * s * u * (1 - u) * 0.5);
      t += `<path d="M${f1(x - 12 * s)} ${yy} L${f1(x + 12 * s)} ${yy} L${f1(x)} ${f1(yy + 24 * s)} Z" fill="${farben[i % 4]}"/>`;
    }
    return t;
  };
  const fenster = (x, y, b, h) => `<rect x="${x}" y="${y}" width="${b}" height="${h}" rx="8" fill="#ffffff"/>
    <rect x="${x + 8}" y="${y + 8}" width="${b - 16}" height="${h - 16}" rx="3" fill="url(#himmel)"/>
    <path d="M${x + 8} ${y + h - 34} Q${x + b * 0.4} ${y + h - 60} ${x + b - 8} ${y + h - 40} V${y + h - 8} H${x + 8} Z" fill="#94cd60"/>
    <rect x="${x + b / 2 - 3}" y="${y + 8}" width="6" height="${h - 16}" fill="#ffffff"/><rect x="${x + 8}" y="${y + h / 2 - 3}" width="${b - 16}" height="6" fill="#ffffff"/>`;
  A.HINTERGRUND.school = () => {
    let bretter = "";
    for (let y = 372; y < 560; y += 40) bretter += `<path d="M0 ${y} H1000" stroke="#d8ab70" stroke-width="2.5"/>`;
    for (let i = 0; i < 14; i += 1) { const y = 344 + (i % 5) * 40; bretter += `<path d="M${(i * 173 + 60) % 1000} ${y + 2} v26" stroke="#d8ab70" stroke-width="2.5"/>`; }
    const fach = (x, farbe) => `<rect x="${x}" y="290" width="76" height="40" rx="5" fill="${farbe}"/><rect x="${x + 26}" y="300" width="24" height="7" rx="3.5" fill="#ffffff" opacity="0.7"/>`;
    return `<rect width="1000" height="560" fill="${WAND}"/>
      <rect y="248" width="1000" height="90" fill="#cfe9dc"/><rect y="244" width="1000" height="6" fill="#b9ddc9"/>
      ${wimpel(-10, 1010, 8, 1)}
      ${fenster(648, 70, 160, 168)}${fenster(826, 70, 160, 168)}
      <rect x="18" y="156" width="164" height="12" rx="5" fill="#a0612f"/>${[48, 100, 152].map((x) => `<path d="M${x} 166 v14 q0 8 8 8" stroke="#6f7682" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("")}
      <rect x="26" y="86" width="148" height="56" rx="6" fill="#ffffff" stroke="#e1d9c6" stroke-width="2"/>
      <circle cx="58" cy="114" r="16" fill="#ef6fa8"/><path d="M84 128 L100 98 L116 128 Z" fill="#3fbf74"/><rect x="128" y="100" width="28" height="28" rx="3" fill="#3a7bd5"/>
      <rect y="336" width="1000" height="224" fill="${BODEN}"/>${bretter}<rect y="330" width="1000" height="10" fill="${LEISTE}"/>
      <rect x="632" y="262" width="358" height="76" fill="#c98f57"/><rect x="624" y="254" width="374" height="12" rx="4" fill="#a8743f"/>
      ${fach(642, "#e8543f")}${fach(728, "#ffd166")}${fach(814, "#3fbf74")}${fach(900, "#8e5bd6")}
      <ellipse cx="200" cy="486" rx="188" ry="58" fill="#e8543f"/><ellipse cx="200" cy="486" rx="158" ry="46" fill="#ffd166"/><ellipse cx="200" cy="486" rx="122" ry="33" fill="#3a7bd5"/><ellipse cx="200" cy="486" rx="84" ry="21" fill="#3fbf74"/>
      <g transform="translate(948 548)"><path d="M-26 -50 H26 L20 0 H-20 Z" fill="#e8543f"/><path d="M-26 -50 H26" stroke="#b23a34" stroke-width="5" stroke-linecap="round"/>
        <path d="M0 -50 Q-30 -80 -24 -110 M0 -50 Q4 -90 22 -112 M0 -50 Q26 -70 40 -86" stroke="#3fa34d" stroke-width="5" fill="none" stroke-linecap="round"/>
        <ellipse cx="-24" cy="-108" rx="12" ry="7" transform="rotate(-60 -24 -108)" fill="#4caf50"/><ellipse cx="22" cy="-110" rx="12" ry="7" transform="rotate(-30 22 -110)" fill="#5cbf5c"/><ellipse cx="40" cy="-86" rx="12" ry="7" transform="rotate(-20 40 -86)" fill="#4caf50"/></g>`;
  };

  A.ORTE.school = {
    board: [334, 166, 1.0, [138, -78]],
    teacher: [540, 352, 1.0, [30, -170]],
    backpack: [100, 254, 0.95, [42, -64]],
    book: [710, 214, 0.85, [60, -40]],
    paintbrush: [818, 206, 0.9, [58, 6]],
    glue: [930, 204, 0.9, [26, -78]],
    paper: [92, 428, 0.9, [44, -62]],
    scissors: [262, 440, 0.85, [44, -54]],
    crayon: [150, 506, 0.85, [58, -46]],
    desk: [480, 484, 1.2, [80, -60]],
    pencil: [720, 420, 0.85, [66, -42]],
    eraser: [700, 516, 0.95, [60, -24]],
    ruler: [864, 462, 0.9, [80, -44]],
  };

  Object.assign(A.STICKER, {
    pencil: [0.36, 0], crayon: [0.4, 0], book: [0.42, -6], backpack: [0.4, 10], scissors: [0.4, 6], glue: [0.4, 12],
    paper: [0.44, 0], teacher: [0.3, 86], board: [0.2, -4], desk: [0.34, 4], ruler: [0.34, 0], eraser: [0.48, 0], paintbrush: [0.38, 4],
  });
  A.AUFNAEHER_BILD.school = "pencil";
  A.AUFNAEHER_FARBE.school = "#2e7d5b";

  // =========================================================================
  // Die Geschichte «Rocco goes to school.» (vier Bilder, je 472 × 204)
  // =========================================================================
  const klasse = () => `<rect width="472" height="204" fill="${WAND}"/><rect y="110" width="472" height="50" fill="#cfe9dc"/>
    ${wimpel(-6, 478, 4, 0.6)}<rect y="160" width="472" height="44" fill="${BODEN}"/><rect y="156" width="472" height="6" fill="${LEISTE}"/>
    <path d="M0 182 H472" stroke="#d8ab70" stroke-width="2"/>`;
  const schulhaus = (x, y, s) => at(x, y, s, `<rect x="-70" y="-74" width="140" height="74" fill="#c8423b"/><path d="M-82 -72 L0 -112 L82 -72 Z" fill="#8f2d29"/>
    <rect x="-15" y="-142" width="30" height="34" fill="#ffffff"/><path d="M-21 -140 L0 -162 L21 -140 Z" fill="#8f2d29"/><path d="M-7 -116 Q-7 -132 0 -132 Q7 -132 7 -116 Z" fill="#ffd166"/>
    ${[-50, -26, 26, 50].map((wx) => `<rect x="${wx - 9}" y="-60" width="18" height="22" rx="2" fill="#cfeefa" stroke="#ffffff" stroke-width="3"/>`).join("")}
    <rect x="-15" y="-44" width="30" height="44" rx="3" fill="#8a5a35"/><circle cx="8" cy="-22" r="2.5" fill="#ffd166"/><rect x="-24" y="-4" width="48" height="6" fill="#d9dce2"/>
    <circle cx="0" cy="-90" r="9" fill="#ffffff"/><path d="M0 -96 V-90 L4 -88" stroke="${DUNKEL}" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  const pfote = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="7" fill="${GRAU_D}"/>`;
  const schleife = (x, y, s = 1) => at(x, y, s, `<path d="M-3 2 L-14 22 L-7 20 L-5 27 L1 4 Z M3 2 L14 22 L7 20 L5 27 L-1 4 Z" fill="#c03a2c"/>
    <path d="M0 0 C-8 -16 -30 -18 -28 -2 C-27 10 -10 8 0 0 Z M0 0 C8 -16 30 -18 28 -2 C27 10 10 8 0 0 Z" fill="#e8543f"/><circle r="6" fill="#c03a2c"/>`);
  // Rocco trägt den Rucksack (er schaut hinter ihm hervor, die Riemen vorne)
  const rucksackHinten = `${at(-6, -52, 0.8, A.DING.backpack())}`;
  const riemen = `<path d="M-15 -74 Q-20 -46 -15 -20 M15 -74 Q20 -46 15 -20" stroke="#2f63bd" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  // Roccos Bild: sein Kopf mit Mütze und ein rotes Herz
  const zeichnung = (s) => at(0, 0, s, `<g transform="translate(0 -8) scale(0.92)">${A.roccoKopf("froh")}</g>${herz(34, 34, 0.8, "#e8543f")}`);
  A.GESCHICHTEN_BILDER.school = [
    () => `${bildHintergrund()}${wolke(70, 34, 0.45)}${wolke(260, 22, 0.35)}
      ${schulhaus(388, 154, 0.82)}<path d="M330 204 Q352 176 372 156 L404 156 Q392 178 404 204 Z" fill="#ead6a6"/>
      ${tb('data-wort="backpack"', `${at(84, 160, 0.68, A.DING.backpack())}${schleife(84, 104, 0.8)}`)}
      ${funkel(36, 98, 9)}${funkel(134, 120, 7)}${funkel(126, 80, 6)}${funkel(30, 146, 6)}
      ${tb('data-wort="raccoon"', at(200, 196, 0.95, A.rocco("wink", "freude")))}`,
    () => `${klasse()}${at(240, 74, 0.42, tafel())}
      <rect x="14" y="40" width="70" height="120" rx="5" fill="#a8743f"/><rect x="20" y="46" width="58" height="114" rx="3" fill="#c08a55"/><rect x="28" y="56" width="42" height="34" rx="3" fill="#cfeefa"/><circle cx="70" cy="110" r="4" fill="#ffd166"/>
      ${tb('data-wort="raccoon"', at(150, 192, 0.95, `${rucksackHinten}${A.rocco("wink", "froh")}${riemen}`))}
      <path d="M94 88 q-8 10 -2 22 M83 81 q-13 14 -4 34" stroke="#5d6882" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${tb('data-wort="teacher"', at(370, 194, 0.95, lehrerin(false)))}
      ${herz(268, 134, 0.8)}`,
    () => `${klasse()}<g transform="translate(70 92)">${fenster(-50, -60, 100, 110)}</g>
      <g transform="translate(232 150) scale(-0.95 0.95)">${A.rocco("steh", "froh")}</g>
      <path d="M152 92 L390 92 L416 136 L126 136 Z" fill="#f3d3a0"/><rect x="122" y="136" width="298" height="12" rx="5" fill="#d39a5a"/>
      <path d="M154 148 L148 200 M388 148 L394 200" stroke="#8d939e" stroke-width="7" stroke-linecap="round"/><rect x="164" y="148" width="214" height="30" rx="4" fill="#4f9fb0"/>
      ${tb('data-wort="paper"', `<path d="M228 98 L324 98 L338 130 L214 130 Z" fill="#ffffff" stroke="#cfd6e0" stroke-width="2" stroke-linejoin="round"/>
        <g transform="translate(272 116) scale(1 0.62)">${zeichnung(0.5)}</g>`)}
      <path d="M250 86 Q276 100 300 100" stroke="${GRAU_D}" stroke-width="13" fill="none" stroke-linecap="round"/>
      ${tb('data-wort="crayon"', at(308, 92, 0.55, wachs(), 140))}${pfote(304, 100)}
      ${funkel(372, 66, 7)}${funkel(398, 86, 5)}`,
    () => `${klasse()}${at(250, 84, 0.62, tafel(false))}
      ${tb('data-wort="paper"', at(282, 82, 0.6, `${blatt(false)}${zeichnung(0.92)}<circle cx="-36" cy="-54" r="6" fill="#e8543f"/><circle cx="36" cy="-54" r="6" fill="#3a7bd5"/>`))}
      ${tb('data-wort="teacher"', at(410, 194, 0.92, lehrerin(true, [-110, -128])))}
      ${at(62, 196, 0.9, A.rocco("jubel", "freude"))}
      ${herz(140, 58, 0.8)}${herz(358, 46, 0.6)}${funkel(138, 104, 7)}${funkel(24, 72, 6)}`,
  ];
  A.TITELBILD.school = 3;
})();

// Englischecke, Welt party (für englisch-art-2.js)
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { tb, menschOder, FARBE } = A.hilfen;
  const { DUNKEL, HELL, HAUT } = FARBE;
  const f = (n) => Number(n.toFixed(1));
  const BUNT = ["#ef6fa8", "#ffd23f", "#4fc3f7", "#8bd36b", "#b06ad8", "#f5a623"];
  const SCHNUR = "#5d6882";
  const WAND = "#efe6fb", WAND_STREIFEN = "#f6f1fd", BODEN = "#dcae7a", BODEN_D = "#c99561";
  const herz = (x, y, s = 1, farbe = "#ef6fa8") => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="${farbe}"/>`;
  const at = (x, y, s, inhalt) => `<g transform="translate(${x} ${y}) scale(${s})">${inhalt}</g>`;
  // Eine Girlande: Schnur von (x1,y) nach (x2,y), in der Mitte um «durch» durchhängend, n Wimpel
  const girlande = (x1, x2, y, durch, n, s = 1) => {
    let w = "";
    for (let i = 0; i < n; i += 1) {
      const t = (i + 0.5) / n;
      const x = x1 + (x2 - x1) * t, yy = y + 4 * durch * t * (1 - t);
      const winkel = (Math.atan((4 * durch * (1 - 2 * t)) / (x2 - x1)) * 180) / Math.PI;
      w += `<path transform="translate(${f(x)} ${f(yy)}) rotate(${f(winkel)}) scale(${s})" d="M-12 0 L12 0 L0 28 Z" fill="${BUNT[i % BUNT.length]}"/>`;
    }
    return `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + 2 * durch} ${x2} ${y}" stroke="#8a5a35" stroke-width="2.5" fill="none"/>${w}`;
  };
  // Eine Kerze für den Kuchen (x: Lage auf dem Kuchen von A.DING.cake, Oberkante bei -30)
  const kuchenKerze = (x, farbe, flamme) => `<rect x="${x - 3.5}" y="-57" width="7" height="28" rx="2.5" fill="${farbe}"/><rect x="${x - 3.5}" y="-50" width="7" height="3" fill="#ffffff" opacity="0.7"/><rect x="${x - 3.5}" y="-40" width="7" height="3" fill="#ffffff" opacity="0.7"/>
    <path d="M${x} -57 V-61" stroke="${DUNKEL}" stroke-width="1.6" stroke-linecap="round"/>
    ${flamme ? `<path d="M${x} -73 q8 9 0 15 q-8 -6 0 -15z" fill="#ffb703"/><path d="M${x} -67 q3.5 4 0 8 q-3.5 -4 0 -8z" fill="#fff3b0"/>` : ""}`;
  const KERZEN_X = [-30, -15, 0, 15, 30];
  const KERZEN_FARBE = ["#3a7bd5", "#ef6fa8", "#3fbf74", "#ffd23f", "#b06ad8"];

  Object.assign(A.DING, {
    candle: () => `<ellipse cx="0" cy="-64" rx="20" ry="24" fill="#ffd166" opacity="0.3"/>
      <path d="M0 -86 Q13 -66 7 -56 Q0 -49 -7 -56 Q-13 -66 0 -86 Z" fill="#ffb703"/><path d="M0 -72 Q6 -63 3.5 -58 Q0 -55 -3.5 -58 Q-6 -63 0 -72 Z" fill="#fff3b0"/>
      <path d="M0 -51 V-43" stroke="${DUNKEL}" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="-14" y="-45" width="28" height="80" rx="5" fill="#ffffff"/>
      ${[-41, -21, -1, 19].map((y) => `<path d="M-14 ${y + 10} L14 ${y} V${y + 9} L-14 ${y + 19} Z" fill="#ef6fa8"/>`).join("")}
      <path d="M-14 -40 Q-14 -46 -8 -45 L8 -45 Q14 -46 14 -40 Q10 -36 8 -28 Q6 -36 2 -38 Q-2 -34 -6 -38 Q-10 -36 -14 -40 Z" fill="#fff6fa"/>
      <path d="M40 38 q18 -2 18 10 q0 10 -18 6" stroke="#e0a000" stroke-width="5" fill="none"/>
      <ellipse cx="0" cy="46" rx="44" ry="10" fill="#e0a000"/><ellipse cx="0" cy="42" rx="40" ry="8" fill="#ffd23f"/>
      <path d="M-20 30 H20 L18 42 H-18 Z" fill="#f5b800"/><ellipse cx="0" cy="30" rx="20" ry="4" fill="#ffd23f"/>`,
    present: () => `<rect x="-44" y="-20" width="88" height="66" rx="5" fill="#3a7bd5"/>
      ${[[-30, -4], [-22, 28], [24, -2], [32, 30], [-36, 14], [36, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#7fb2f0"/>`).join("")}
      <rect x="-50" y="-36" width="100" height="20" rx="5" fill="#2f63bd"/>
      <rect x="-8" y="-36" width="16" height="82" fill="#ffd23f"/>
      <path d="M-3 -38 C-24 -70 -52 -50 -8 -34 Z M3 -38 C24 -70 52 -50 8 -34 Z" fill="#ffd23f" stroke="#f5b800" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-4 -34 L-16 -14 L-8 -16 L-4 -8 Z M4 -34 L16 -14 L8 -16 L4 -8 Z" fill="#f5b800"/>
      <circle cx="0" cy="-36" r="7" fill="#f5b800"/>`,
    balloon: (farbe = "#e63946", schnur = true) => `${schnur ? `<path d="M0 46 q-7 8 0 16 t0 16" stroke="${SCHNUR}" stroke-width="2" fill="none"/>` : ""}
      <path d="M-5 47 L5 47 L0 38 Z" fill="${farbe}"/>
      <path d="M0 40 C-26 40 -38 14 -38 -8 C-38 -32 -20 -48 0 -48 C20 -48 38 -32 38 -8 C38 14 26 40 0 40 Z" fill="${farbe}"/>
      <ellipse cx="-16" cy="-22" rx="7" ry="13" transform="rotate(28 -16 -22)" fill="#ffffff" opacity="0.45"/>`,
    partyhat: () => `<path d="M2 -62 L38 36 Q0 48 -38 36 Z" fill="#8a5cd8"/>
      <path d="M-26 4 Q0 12 26 4 L30 15 Q0 25 -30 15 Z" fill="#ffd23f"/><path d="M-14 -28 Q2 -22 16 -28 L19 -19 Q2 -13 -17 -19 Z" fill="#4fc3f7"/>
      ${[[-4, -44, "#ffd23f"], [-10, -6, "#ef6fa8"], [12, -6, "#ffffff"], [-22, 28, "#4fc3f7"], [2, 32, "#ffffff"], [24, 28, "#ef6fa8"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`).join("")}
      <path d="M-40 36 Q0 50 40 36 L42 44 Q0 60 -42 44 Z" fill="#ef6fa8"/>
      ${[-32, -16, 0, 16, 32].map((x) => `<circle cx="${x}" cy="${f(46 + 6 * (1 - (x / 40) ** 2))}" r="5" fill="#ffffff"/>`).join("")}
      ${[[0, -64, 11, "#ef6fa8"], [-6, -70, 7, "#ffd23f"], [7, -70, 6, "#4fc3f7"]].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join("")}`,
    cupcake: () => `<path d="M-32 8 H32 L24 50 Q24 52 22 52 H-22 Q-24 52 -24 50 Z" fill="#4fc3f7"/>
      ${[-21, -10.5, 0, 10.5, 21].map((x) => `<path d="M${x} 10 L${f(x * 0.72)} 50" stroke="#2fa0d8" stroke-width="3" stroke-linecap="round"/>`).join("")}
      <ellipse cx="0" cy="6" rx="38" ry="11" fill="#f79cc0"/><ellipse cx="0" cy="-8" rx="31" ry="11" fill="#f9b3d1"/>
      <ellipse cx="0" cy="-21" rx="22" ry="10" fill="#f79cc0"/><path d="M-12 -28 Q-4 -48 6 -40 Q12 -34 8 -28 Z" fill="#f9b3d1"/>
      ${[[-20, 2, 20, "#ffd23f"], [14, 4, -30, "#4fc3f7"], [-6, -10, 60, "#8bd36b"], [18, -12, 10, "#ffffff"], [-18, -14, -40, "#b06ad8"], [4, -24, -10, "#ffd23f"], [0, 6, 80, "#ffffff"]].map(([x, y, w, c]) => `<rect x="${x - 4}" y="${y - 1.6}" width="8" height="3.2" rx="1.6" transform="rotate(${w} ${x} ${y})" fill="${c}"/>`).join("")}
      <path d="M2 -46 Q6 -60 16 -62" stroke="#3fa34d" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="-44" r="9" fill="#e63946"/><circle cx="-3" cy="-47" r="3" fill="#ff8a8f"/>`,
    pizza: () => {
      const rx = 52, ry = 22, cy = 10;
      const P = (a, k = 1) => `${f(rx * k * Math.cos((a * Math.PI) / 180))} ${f(cy + ry * k * Math.sin((a * Math.PI) / 180))}`;
      const keil = (k) => `M0 ${cy} L${P(18, k)} A${f(rx * k)} ${f(ry * k)} 0 0 1 ${P(78, k)} Z`;
      const salami = (liste) => liste.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7.5" ry="4" fill="#c0392b"/>`).join("");
      return `<ellipse cx="0" cy="${cy + 9}" rx="${rx + 10}" ry="${ry + 8}" fill="#b07a45"/><path d="M${rx + 8} ${cy + 8} h12" stroke="#b07a45" stroke-width="9" stroke-linecap="round"/>
        <ellipse cx="0" cy="${cy + 5}" rx="${rx}" ry="${ry}" fill="#c9843f"/><ellipse cx="0" cy="${cy}" rx="${rx}" ry="${ry}" fill="#eaae62"/>
        <ellipse cx="0" cy="${cy}" rx="${rx - 7}" ry="${ry - 5}" fill="#e8543f"/><ellipse cx="0" cy="${cy}" rx="${rx - 10}" ry="${ry - 7}" fill="#ffd166"/>
        <path d="${[108, 153, 198, 243, 288, 333].map((a) => `M0 ${cy} L${P(a, 0.84)}`).join(" ")}" stroke="#e8b04a" stroke-width="2.2" stroke-linecap="round"/>
        ${salami([[-30, 4], [-8, -2], [16, -1], [-20, 18], [-40, 13], [4, 21]])}
        ${[[-16, 9], [-34, -1], [6, -7], [30, 2]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.5" ry="2" fill="#3fa34d"/>`).join("")}
        <path d="${keil(1.02)}" fill="#a0693a"/><path d="${keil(1.02)}" transform="translate(0 5)" fill="#a0693a"/>
        <g transform="translate(9 5)"><path d="${keil(1)}" transform="translate(0 5)" fill="#c9843f"/><path d="${keil(1)}" fill="#eaae62"/>
          <path d="${keil(0.86)}" fill="#e8543f"/><path d="${keil(0.8)}" fill="#ffd166"/>${salami([[28, 17], [14, 24]])}</g>`;
    },
    lemonade: () => `<g transform="rotate(14 -6 -40)"><rect x="-10" y="-80" width="7" height="64" rx="3" fill="#ffffff"/>${[-74, -62, -50].map((y) => `<rect x="-10" y="${y}" width="7" height="5" fill="#ef6fa8"/>`).join("")}</g>
      <path d="M-25 -42 H25 L20 46 Q19 50 15 50 H-15 Q-19 50 -20 46 Z" fill="#eef8fd" stroke="#b9d9ea" stroke-width="2.5"/>
      <path d="M-23 -22 H23 L19 44 Q18 47 14 47 H-14 Q-18 47 -19 44 Z" fill="#fff176"/>
      <rect x="-15" y="-18" width="14" height="13" rx="3" transform="rotate(-14 -8 -12)" fill="#ffffff" opacity="0.75"/><rect x="2" y="-12" width="13" height="12" rx="3" transform="rotate(18 8 -6)" fill="#ffffff" opacity="0.75"/>
      ${[[-10, 14, 3], [6, 24, 2.5], [-4, 34, 2], [10, 8, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="0.8"/>`).join("")}
      <g transform="translate(22 -42) rotate(-20)"><circle r="17" fill="#f5c400"/><circle r="14" fill="#fff6b0"/>
        ${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M0 0 L${f(12 * Math.cos((a * Math.PI) / 180))} ${f(12 * Math.sin((a * Math.PI) / 180))}" stroke="#f5c400" stroke-width="2"/>`).join("")}<circle r="2.5" fill="#f5c400"/>
        <rect x="-2" y="2" width="4" height="16" fill="#eef8fd"/></g>
      <ellipse cx="-20" cy="-46" rx="9" ry="4.5" transform="rotate(-30 -20 -46)" fill="#3fbf74"/>`,
    popcorn: () => {
      const streifen = [-34, -20.4, -6.8, 6.8, 20.4].map((x, k) => (k % 2 ? "" : `<path d="M${f(x)} -22 L${f(x + 13.6)} -22 L${f((x + 13.6) * 0.76)} 48 L${f(x * 0.76)} 48 Z" fill="#e63946"/>`)).join("");
      const koerner = [[-26, -30], [-12, -38], [4, -40], [20, -34], [30, -24], [-30, -22], [-4, -54], [12, -52], [-20, -48], [26, -44], [0, -28], [-14, -26], [14, -26]];
      return `${koerner.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i > 5 && i < 10 ? 10 : 11}" fill="${i % 3 ? "#fff8e1" : "#fff1c4"}" stroke="#f0cf6e" stroke-width="2"/>`).join("")}
        ${[[-12, -40], [8, -44], [20, -30], [-24, -28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#ffd54f"/>`).join("")}
        <path d="M-34 -22 H34 L26 48 Q26 50 24 50 H-24 Q-26 50 -26 48 Z" fill="#ffffff"/>${streifen}
        <path d="M-37 -26 H37 L35 -18 H-35 Z" fill="#c62f3b"/>`;
    },
    pinata: () => {
      const B = ["#ef6fa8", "#ffd23f", "#4fc3f7", "#8bd36b"];
      const zacken = (x1, x2, y, c) => { let d = `M${x1} ${y}`; for (let x = x1; x < x2 - 0.1; x += 7) d += ` l3.5 5 l3.5 -5`; return `<path d="${d} Z" fill="${c}"/>`; };
      const baender = (x, y, w, h, n) => Array.from({ length: n }, (_, k) => `<rect x="${x}" y="${f(y + (k * h) / n)}" width="${w}" height="${f(h / n + 0.5)}" fill="${B[k % 4]}"/>`).join("")
        + Array.from({ length: n - 1 }, (_, k) => zacken(x, x + w, f(y + ((k + 1) * h) / n), B[k % 4])).join("");
      return `<ellipse cx="2" cy="-16" rx="56" ry="48" fill="transparent"/><path d="M-14 -16 V-44" stroke="${SCHNUR}" stroke-width="2.5"/>
        ${[["#ef6fa8", -8], ["#ffd23f", 0], ["#4fc3f7", 8]].map(([c, d]) => `<path d="M-48 -6 q-12 ${4 + d} -16 ${16 + d} q-2 8 -8 10" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("")}
        ${[-42, -28, 4, 18].map((x) => baender(x, 16, 10, 28, 3)).join("")}
        <g>${baender(-50, -16, 74, 36, 4)}</g>
        <g transform="rotate(-22 22 -20)">${baender(12, -60, 20, 46, 4)}</g>
        <ellipse cx="24" cy="-78" rx="5.5" ry="15" transform="rotate(-18 24 -78)" fill="#ffd23f"/><ellipse cx="35" cy="-79" rx="5.5" ry="15" transform="rotate(12 35 -79)" fill="#ef6fa8"/>
        <ellipse cx="38" cy="-56" rx="20" ry="13" transform="rotate(14 38 -56)" fill="#4fc3f7"/><ellipse cx="52" cy="-50" rx="9" ry="8" fill="#8bd36b"/>
        <path d="M26 -66 q4 -6 10 -2 q6 -8 10 0" stroke="#b06ad8" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="40" cy="-59" r="3.2" fill="${DUNKEL}"/><circle cx="55" cy="-52" r="1.8" fill="${DUNKEL}"/>`;
    },
    confetti: () => {
      const teile = Array.from({ length: 30 }, (_, i) => {
        const a = i * 2.39996, r = 50 * Math.sqrt((i + 0.6) / 30);
        const x = f(10 + r * Math.cos(a)), y = f(-12 + r * Math.sin(a) * 0.92);
        const c = BUNT[i % 6], w = (i * 47) % 180;
        if (i % 3 === 0) return `<circle cx="${x}" cy="${y}" r="4.2" fill="${c}"/>`;
        if (i % 3 === 1) return `<rect x="${f(x - 5.5)}" y="${f(y - 2.8)}" width="11" height="5.6" rx="1.5" transform="rotate(${w} ${x} ${y})" fill="${c}"/>`;
        return `<path d="M${f(x - 7)} ${y} q3.5 -6 7 0 t7 0" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" transform="rotate(${w} ${x} ${y})"/>`;
      }).join("");
      const knall = Array.from({ length: 24 }, (_, i) => { const a = (Math.PI / 12) * i, r = i % 2 ? 46 : 60; return `${f(10 + r * Math.cos(a))},${f(-12 + r * Math.sin(a) * 0.92)}`; }).join(" ");
      return `<polygon points="${knall}" fill="#fff6c9" stroke="#ffe27a" stroke-width="3" stroke-linejoin="round"/>
        ${teile}
        <g transform="translate(-40 40) rotate(45)"><path d="M0 22 L-14 -16 H14 Z" fill="#b06ad8"/><path d="M-9 -2 L9 -2 L11 4 L-11 4 Z M-5 10 H5 L6 14 H-6 Z" fill="#ffd23f"/><ellipse cx="0" cy="-16" rx="14" ry="5" fill="#8a4fc0"/></g>`;
    },
    card: () => `<path d="M-24 -48 L-50 -40 L-50 44 L-24 50 Z" fill="#e8a5c2"/>
      <rect x="-24" y="-48" width="74" height="98" rx="4" fill="#ef6fa8"/><rect x="-17" y="-41" width="60" height="84" rx="3" fill="#fff4f8"/>
      ${herz(13, 2, 2.1, "#e63946")}
      ${[[-8, -32, "#ffd23f"], [34, -30, "#4fc3f7"], [-8, 32, "#8bd36b"], [34, 34, "#ffd23f"], [13, -32, "#b06ad8"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`).join("")}`,
    clown: () => `${[-24, 24].map((x) => `<ellipse cx="${x}" cy="-9" rx="23" ry="10" fill="#e63946"/><ellipse cx="${x - 8}" cy="-13" rx="7" ry="3" fill="#ff8a8f"/>`).join("")}
      ${[[-1, "#ffd23f", "#ef6fa8"], [1, "#4fc3f7", "#ffd23f"]].map(([s, hose, punkt]) => `<path d="M${30 * s} -84 L${36 * s} -24 Q${36 * s} -16 ${28 * s} -16 H${6 * s} Q${2 * s} -16 ${2 * s} -22 L0 -50 L0 -84 Z" fill="${hose}"/>
        ${[[20, -66], [26, -38], [12, -30], [14, -52]].map(([x, y]) => `<circle cx="${x * s}" cy="${y}" r="4" fill="${punkt}"/>`).join("")}<path d="M${34 * s} -18 ${Array(3).fill(`l${-5 * s} -6 l${-5 * s} 6`).join(" ")} Z" fill="#ffffff"/>`).join("")}
      <path d="M-28 -80 Q-46 -94 -52 -116" stroke="#4fc3f7" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M28 -80 Q44 -66 46 -48" stroke="#ffd23f" stroke-width="14" fill="none" stroke-linecap="round"/>
      <circle cx="-53" cy="-122" r="9" fill="#ffffff" stroke="#d9dce2" stroke-width="1.5"/><circle cx="46" cy="-42" r="9" fill="#ffffff" stroke="#d9dce2" stroke-width="1.5"/>
      ${[0, 1, 2].map((k) => `<circle cx="0" cy="${-74 + k * 16}" r="5" fill="#e63946"/>`).join("")}${[-28, -19, -9.5, 0, 9.5, 19, 28].map((x, k) => `<ellipse cx="${x}" cy="${f(-88 + Math.abs(x) * 0.1)}" rx="8" ry="7" fill="${k % 2 ? "#ef6fa8" : "#ffffff"}"/>`).join("")}
      ${[[21, -126, 9], [25, -114, 8], [19, -136, 7]].map(([x, y, r]) => `<circle cx="${-x}" cy="${y}" r="${r}" fill="#f5821f"/><circle cx="${x}" cy="${y}" r="${r}" fill="#f5821f"/>`).join("")}
      <circle cx="0" cy="-114" r="21" fill="${HAUT}"/><ellipse cx="0" cy="-103" rx="14" ry="9" fill="#ffffff"/><path d="M-11 -106 Q0 -92 11 -106 Q0 -100 -11 -106 Z" fill="#e63946"/>
      <path d="M-13 -124 q5 -5 10 0 M3 -124 q5 -5 10 0" stroke="#3a7bd5" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="-8" cy="-118" r="2.8" fill="${DUNKEL}"/><circle cx="8" cy="-118" r="2.8" fill="${DUNKEL}"/>
      <circle cx="-14" cy="-108" r="3.5" fill="#ff8fab" opacity="0.7"/><circle cx="14" cy="-108" r="3.5" fill="#ff8fab" opacity="0.7"/><circle cx="0" cy="-110" r="6.5" fill="#e63946"/><circle cx="-2" cy="-112" r="2" fill="#ff9ea6"/>
      <g transform="rotate(-12 0 -134)"><ellipse cx="0" cy="-134" rx="21" ry="4.5" fill="#3fa34d"/><rect x="-12" y="-156" width="24" height="22" rx="3" fill="#3fa34d"/><rect x="-12" y="-142" width="24" height="5" fill="#ffd23f"/><circle cx="10" cy="-156" r="5" fill="#ef6fa8"/><circle cx="10" cy="-156" r="2" fill="#ffd23f"/></g>`,
    lollipop: () => {
      const arm = (phase, w) => {
        let d = "";
        for (let t = 0; t <= 4 * Math.PI + 0.01; t += 0.2) {
          const r = (36 - w / 2) * (t / (4 * Math.PI));
          d += `${d ? " L" : "M"}${f(r * Math.cos(t + phase))} ${f(r * Math.sin(t + phase))}`;
        }
        return `<path d="${d}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
      };
      return `<g transform="rotate(-16)"><rect x="-4.5" y="30" width="9" height="66" rx="4.5" fill="#ffffff" stroke="#d9dce2" stroke-width="1.5"/>
        <path d="M0 44 L-16 34 L-16 54 Z M0 44 L16 34 L16 54 Z" fill="#4fc3f7"/><circle cx="0" cy="44" r="4.5" fill="#2fa0d8"/>
        <circle r="40" fill="#ff5c8a"/>${arm(0, 8)} stroke="#ffffff"/>${arm(Math.PI, 5)} stroke="#ffd23f"/>
        <circle r="40" fill="none" stroke="#e0457a" stroke-width="3"/>
        <ellipse cx="-16" cy="-20" rx="6" ry="10" transform="rotate(40 -16 -20)" fill="#ffffff" opacity="0.5"/></g>`;
    },
    // Kleider (auch für «Dress up»), einzeln
    scarf: () => `<path d="M-32 -34 Q0 -14 32 -34" stroke="#c8423b" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M-32 -38 Q-34 -58 0 -58 Q34 -58 32 -38" stroke="#b23a34" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M-22 -26 L-30 36 L-12 38 L-6 -24 Z" fill="#e8543f"/><path d="M4 -22 L14 40 L32 36 L18 -26 Z" fill="#e8543f"/>
      ${[[-24, -2, -9, 0], [-26, 16, -10, 18]].map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1} L${x2} ${y2 + 1} L${x2 - 1} ${y2 + 7} L${x1 - 1} ${y1 + 6} Z" fill="#ffd166"/>`).join("")}
      ${[[8, 0, 23, -2], [10, 16, 26, 14]].map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1} L${x2} ${y2} L${x2 + 1} ${y2 + 6} L${x1 + 1} ${y1 + 6} Z" fill="#ffd166"/>`).join("")}
      <path d="M-29 37 v8 M-24 37.5 v8 M-19 38 v8 M-14 38 v8 M15 40 v8 M20 39 v8 M25 38 v8 M30 37 v8" stroke="#e8543f" stroke-width="3" stroke-linecap="round"/>
      <path d="M-14 -34 Q0 -22 14 -34 L12 -20 Q0 -14 -10 -20 Z" fill="#c8423b"/>`,
    boots: () => `${[[-24, "#f5b800", "#ffd23f"], [20, "#e0a000", "#f5c400"]].map(([x, d, c]) => `<g transform="translate(${x} 0)">
        <path d="M-16 -44 H12 V18 H32 Q40 18 40 30 V40 H-16 Z" fill="${c}"/>
        <rect x="-19" y="-50" width="34" height="12" rx="5" fill="${d}"/><rect x="-16" y="36" width="56" height="8" rx="3" fill="#8a5a35"/>
        <path d="M-8 -30 V20" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.6"/></g>`).join("")}`,
    bowtie: () => `<path d="M-6 -8 L-48 -32 Q-58 0 -48 32 L-6 8 Z" fill="#e63946"/><path d="M6 -8 L48 -32 Q58 0 48 32 L6 8 Z" fill="#e63946"/>
      ${[[-36, -12], [-26, 10], [-44, 14], [36, -12], [26, 10], [44, 14], [-40, -2], [40, -2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#ffffff"/>`).join("")}
      <path d="M-6 -8 L-30 -10 M-6 8 L-30 12 M6 -8 L30 -10 M6 8 L30 12" stroke="#b5202e" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="-11" y="-13" width="22" height="26" rx="7" fill="#c62f3b"/>`,
  });

  // =========================================================================
  // Die Stube am Geburtstag (1000 × 560)
  // =========================================================================
  A.HINTERGRUND.party = () => {
    const tuch = `M318 370 H782 V412 ${Array(16).fill("q-14.5 13 -29 0").join(" ")} Z`;
    return `<rect width="1000" height="560" fill="${WAND}"/>
      ${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 52 + 14}" y="0" width="22" height="434" fill="${WAND_STREIFEN}"/>`).join("")}
      ${[[90, 330], [460, 300], [880, 300], [640, 120], [300, 120], [110, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#e3d6f5"/>`).join("")}
      <rect y="434" width="1000" height="126" fill="${BODEN}"/>
      ${[470, 510, 550].map((y) => `<path d="M0 ${y} H1000" stroke="${BODEN_D}" stroke-width="2"/>`).join("")}
      ${[[120, 434], [420, 470], [760, 434], [260, 510], [620, 510], [900, 470], [80, 550], [480, 550]].map(([x, y]) => `<path d="M${x} ${y} v${y === 434 ? 36 : 40}" stroke="${BODEN_D}" stroke-width="2"/>`).join("")}
      <rect y="426" width="1000" height="12" fill="#ffffff"/>
      <ellipse cx="560" cy="520" rx="330" ry="34" fill="#c9b6ee"/><ellipse cx="560" cy="520" rx="300" ry="26" fill="#d9cbf4"/>
      <rect x="205" y="250" width="226" height="10" rx="4" fill="#a0612f"/><path d="M226 260 v18 h14 M410 260 v18 h-14" stroke="#8a5a35" stroke-width="5" fill="none" stroke-linejoin="round"/>
      <rect x="342" y="404" width="12" height="80" rx="4" fill="#a0612f"/><rect x="746" y="404" width="12" height="80" rx="4" fill="#a0612f"/>
      <path d="${tuch}" fill="#ffd6e7"/><rect x="314" y="364" width="472" height="10" rx="5" fill="#ffffff"/>
      ${Array.from({ length: 16 }, (_, i) => `<circle cx="${332.5 + i * 29}" cy="400" r="4" fill="#ffffff"/>`).join("")}
      <path d="M531 0 V128" stroke="${SCHNUR}" stroke-width="2.5"/>
      <path d="M140 290 Q150 360 168 404 T176 446" stroke="${SCHNUR}" stroke-width="2" fill="none"/>
      ${[[196, 58, 1], [700, 60, -1]].map(([x, y, s]) => `<path d="M${x} ${y} q${8 * s} 16 0 30 t0 30 t${4 * s} 26" stroke="${s > 0 ? "#4fc3f7" : "#ef6fa8"}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("")}
      ${girlande(-20, 520, 20, 46, 10)}${girlande(480, 1020, 20, 46, 10)}`;
  };

  A.ORTE.party = {
    balloon: [140, 222, 1.0, [30, -46]],
    card: [262, 206, 0.9, [46, -50]],
    candle: [372, 208, 0.9, [30, -84]],
    pinata: [545, 172, 1.0, [52, -84]],
    confetti: [800, 206, 0.95, [56, -60]],
    popcorn: [395, 328, 0.9, [32, -56]],
    pizza: [494, 338, 0.9, [60, -24]],
    cupcake: [598, 326, 0.9, [30, -50]],
    lemonade: [684, 326, 0.9, [36, -60]],
    present: [176, 482, 1.0, [48, -58]],
    partyhat: [420, 494, 0.95, [36, -64]],
    lollipop: [652, 456, 0.9, [36, -42]],
    clown: [888, 540, 1.12, [40, -150]],
  };

  Object.assign(A.STICKER, {
    candle: [0.42, 16], present: [0.5, 9], balloon: [0.52, -8], partyhat: [0.46, 12], cupcake: [0.52, 5], pizza: [0.46, -12],
    lemonade: [0.5, 16], popcorn: [0.5, 8], pinata: [0.44, 22], confetti: [0.48, 5], card: [0.5, 0], clown: [0.36, 82], lollipop: [0.42, -27],
    scarf: [0.5, 8], boots: [0.48, -2], bowtie: [0.52, 0],
  });
  A.AUFNAEHER_BILD.party = "present";
  A.AUFNAEHER_FARBE.party = "#e84a8f";

  // =========================================================================
  // Kleider für Rocco («Dress up»): jedes passt genau über A.rocco("steh", "froh")
  // (Füsse bei 0,0; Kopf bei y = -94; die blaue Mütze reicht bis y = -133)
  // =========================================================================
  A.ROCCO_KLEIDER = {
    hat: () => `<ellipse cx="0" cy="-114" rx="54" ry="12" fill="#e2b456"/><ellipse cx="0" cy="-116" rx="47" ry="8.5" fill="#f1cd78"/>
      <path d="M-30 -114 Q-32 -154 0 -154 Q32 -154 30 -114 Z" fill="#f6da8c"/>
      <path d="M-27 -140 Q0 -146 27 -140" stroke="#e4bd62" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M-31 -128 Q0 -122 31 -128 L31 -116 Q0 -110 -31 -116 Z" fill="#e8543f"/>
      <circle cx="18" cy="-120" r="7" fill="#ffffff"/><circle cx="18" cy="-120" r="3" fill="#ffd23f"/>`,
    sunglasses: () => `<path d="M-25 -100 L-31 -104 M25 -100 L31 -104" stroke="#ef476f" stroke-width="4" stroke-linecap="round"/>
      <path d="M-4 -100 Q0 -104 4 -100" stroke="#ef476f" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="-27" y="-107" width="24" height="18" rx="7" fill="#ef476f"/><rect x="3" y="-107" width="24" height="18" rx="7" fill="#ef476f"/>
      <rect x="-24" y="-104" width="18" height="12" rx="5" fill="${DUNKEL}"/><rect x="6" y="-104" width="18" height="12" rx="5" fill="${DUNKEL}"/>
      <path d="M-20 -99 L-14 -101 M10 -99 L16 -101" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>`,
    partyhat: () => `<g transform="rotate(6 0 -112)">
      <path d="M0 -196 L31 -114 Q0 -104 -31 -114 Z" fill="#8a5cd8"/>
      <path d="M-21 -142 Q0 -136 21 -142 L24 -133 Q0 -127 -24 -133 Z" fill="#ffd23f"/><path d="M-11 -168 Q0 -164 11 -168 L13 -161 Q0 -157 -13 -161 Z" fill="#4fc3f7"/>
      ${[[-2, -180, "#ffd23f"], [-8, -150, "#ef6fa8"], [9, -152, "#ffffff"], [-14, -122, "#4fc3f7"], [2, -120, "#ffffff"], [16, -122, "#ef6fa8"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${c}"/>`).join("")}
      <path d="M-33 -114 Q0 -102 33 -114 L34 -107 Q0 -94 -34 -107 Z" fill="#ef6fa8"/>
      ${[[0, -198, 9, "#ef6fa8"], [-5, -203, 5.5, "#ffd23f"], [6, -203, 5, "#4fc3f7"]].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join("")}</g>`,
    scarf: () => `<path d="M-27 -72 Q0 -58 27 -72 L28 -60 Q0 -45 -28 -60 Z" fill="#e8543f"/>
      ${[-18, -6, 6, 18].map((x) => { const t = (x + 27) / 54, u = (x + 28) / 56; return `<rect x="${x - 2.5}" y="${f(-72 + 28 * t * (1 - t))}" width="5" height="${f(11.5 + 30 * u * (1 - u) - 28 * t * (1 - t))}" fill="#ffd166"/>`; }).join("")}
      <path d="M5 -58 L19 -60 L24 -30 L10 -27 Z" fill="#e8543f"/><path d="M7 -48 L20.5 -50 L21.3 -45 L7.8 -43 Z M8.6 -38 L22.2 -40 L23 -35 L9.4 -33 Z" fill="#ffd166"/>
      <path d="M11 -27 v6 M15 -27.8 v6 M19 -28.6 v6 M23 -29.4 v6" stroke="#e8543f" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="10" cy="-59" rx="7.5" ry="6.5" fill="#c8423b"/>`,
    boots: () => `${[-1, 1].map((s) => `<g transform="scale(${s} 1)"><path d="M4 -24 H19 V-11 H23 Q28 -11 28 -5 V0 H4 Z" fill="#ffd23f"/>
      <rect x="2" y="-28" width="20" height="8" rx="3.5" fill="#f5b800"/><rect x="4" y="-2" width="25" height="4" rx="2" fill="#8a5a35"/>
      <path d="M9 -18 V-6" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity="0.6"/></g>`).join("")}`,
    bowtie: () => `<path d="M-3 -66 L-20 -75 Q-25 -63 -20 -51 L-3 -60 Z" fill="#e63946"/><path d="M3 -66 L20 -75 Q25 -63 20 -51 L3 -60 Z" fill="#e63946"/>
      ${[[-14, -67], [-16, -57], [14, -67], [16, -57]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#ffffff"/>`).join("")}
      <rect x="-5" y="-68" width="10" height="10" rx="3.5" fill="#c62f3b"/>`,
  };

  // =========================================================================
  // Die Geschichte «Happy birthday, Rocco!» (vier Bilder, je 472 × 204)
  // =========================================================================
  const K = A.ROCCO_KLEIDER;
  const stube = () => `<rect width="472" height="204" fill="${WAND}"/>
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 50 + 10}" y="0" width="22" height="160" fill="${WAND_STREIFEN}"/>`).join("")}
    <rect y="160" width="472" height="44" fill="${BODEN}"/><path d="M0 182 H472" stroke="${BODEN_D}" stroke-width="2"/><rect y="156" width="472" height="6" fill="#ffffff"/>
    ${girlande(-10, 240, 4, 22, 7, 0.62)}${girlande(232, 482, 4, 22, 7, 0.62)}`;
  // Ein Bündel Ballone, an (x, y) zusammengebunden
  const buendel = (x, y, s, farben, lagen) => lagen.map(([dx, dy]) => `<path d="M${f(x + dx * s)} ${f(y + (dy + 46) * s)} Q${f(x + dx * s * 0.4)} ${f(y + (dy + 90) * s)} ${x} ${y + 100 * s}" stroke="${SCHNUR}" stroke-width="1.6" fill="none"/>`).join("")
    + lagen.map(([dx, dy], i) => at(f(x + dx * s), f(y + dy * s), s, A.DING.balloon(farben[i], false))).join("")
    + `<path d="M${x - 5} ${f(y + 100 * s + 5)} L${x} ${f(y + 100 * s)} L${x + 5} ${f(y + 100 * s + 5)}" stroke="#ef6fa8" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const tischchen = (x1, x2, y) => `<rect x="${x1 + 14}" y="${y + 20}" width="9" height="${190 - y}" rx="3" fill="#a0612f"/><rect x="${x2 - 23}" y="${y + 20}" width="9" height="${190 - y}" rx="3" fill="#a0612f"/>
    <path d="M${x1} ${y} H${x2} V${y + 20} ${Array.from({ length: Math.round((x2 - x1) / 20) }, () => `q-${(x2 - x1) / Math.round((x2 - x1) / 20) / 2} 9 -${(x2 - x1) / Math.round((x2 - x1) / 20)} 0`).join(" ")} Z" fill="#ffd6e7"/>
    <rect x="${x1 - 3}" y="${y - 4}" width="${x2 - x1 + 6}" height="7" rx="3.5" fill="#ffffff"/>`;
  // Der Kuchen aus der Küche, mit fünf Kerzen (A.DING.cake hat schon drei bei
  // -30, 0, 30 – die fünf eigenen decken sie genau zu)
  const kuchen = (flammen) => (flammen ? A.DING.cake() : A.DING.cake().replace(/<path d="M-?\d+ -66 q6 6 0 12 q-6 -6 0 -12z" fill="#ffd166"\/>/g, ""));
  const kerzen = (flammen) => `<rect x="-38" y="-${flammen ? 76 : 62}" width="76" height="${flammen ? 48 : 34}" fill="transparent"/>${KERZEN_X.map((x, i) => kuchenKerze(x, KERZEN_FARBE[i], flammen)).join("")}`;
  const rauch = KERZEN_X.map((x, i) => `<path d="M${x} -63 q${i % 2 ? 5 : -5} -6 0 -12 t0 -12" stroke="#aab2c0" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.85"/>`).join("");
  // Rocco bläst: das Lächeln zu, ein runder Mund, dicke Backen
  const blasen = `<ellipse cx="0" cy="-76" rx="9" ry="4.5" fill="${HELL}"/><circle cx="0" cy="-76.5" r="3.6" fill="${DUNKEL}"/>
    <circle cx="-16" cy="-80" r="4.5" fill="#ff9fb5" opacity="0.6"/><circle cx="16" cy="-80" r="4.5" fill="#ff9fb5" opacity="0.6"/>`;
  const maedchen = (x, y, s) => at(x, y, s, menschOder("m_maedchen", 1, `<rect x="-12" y="-36" width="9" height="36" rx="4" fill="${HAUT}"/><rect x="3" y="-36" width="9" height="36" rx="4" fill="${HAUT}"/>
    <path d="M-14 -88 H14 L28 -34 H-28 Z" fill="#ef6fa8"/><circle cx="0" cy="-106" r="21" fill="${HAUT}"/>
    <path d="M-21 -108 Q-20 -130 0 -129 Q20 -130 21 -108 Q10 -118 0 -116 Q-10 -118 -21 -108 Z" fill="#a0612f"/>
    <circle cx="-7" cy="-104" r="2.6" fill="${DUNKEL}"/><circle cx="7" cy="-104" r="2.6" fill="${DUNKEL}"/><path d="M-6 -96 Q0 -91 6 -96" stroke="${DUNKEL}" stroke-width="2" fill="none" stroke-linecap="round"/>`));
  A.GESCHICHTEN_BILDER.birthday = [
    () => `${stube()}
      ${buendel(76, 40, 0.55, ["#e63946", "#4fc3f7", "#ffd23f"], [[-26, 10], [24, 4], [0, -18]])}
      ${buendel(402, 46, 0.55, ["#8bd36b", "#ef6fa8", "#b06ad8"], [[-24, 6], [26, 10], [0, -16]])}
      ${tb('data-wort="raccoon"', at(236, 194, 0.84, A.rocco("jubel", "froh")))}
      ${tb('data-wort="partyhat"', at(236, 194, 0.84, K.partyhat()))}`,
    () => `${stube()}
      ${buendel(420, 40, 0.5, ["#e63946", "#ffd23f"], [[-20, 8], [18, -8]])}
      ${maedchen(118, 192, 1.32)}
      ${tb('data-wort="present"', at(174, 138, 0.55, A.DING.present()))}
      ${at(318, 194, 0.84, A.rocco("jubel", "freude") + K.partyhat())}
      ${herz(232, 66, 0.9)}${herz(252, 44, 0.6)}`,
    () => `${stube()}
      ${buendel(48, 42, 0.5, ["#4fc3f7", "#ef6fa8"], [[-16, 6], [20, -8]])}
      ${tischchen(196, 404, 152)}
      ${tb('data-wort="cake"', at(300, 114, 1.25, kuchen(true)))}
      ${tb('data-wort="candle"', at(300, 114, 1.25, kerzen(true)))}
      ${at(112, 194, 0.8, A.rocco("steh", "hoch") + K.partyhat())}
      ${maedchen(436, 192, 1.18)}`,
    () => `${stube()}
      ${tischchen(236, 444, 152)}
      ${at(340, 114, 1.25, kuchen(false) + kerzen(false) + rauch)}
      ${tb('data-wort="raccoon"', `<g transform="translate(122 194) scale(-0.84 0.84)">${A.rocco("steh", "freude")}${blasen}${K.partyhat()}</g>`)}
      <path d="M150 128 q20 -6 40 0 t40 0 M154 140 q18 -4 34 2 M150 116 q16 -8 30 -4" stroke="#9fd8f0" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${tb('data-wort="confetti"', at(218, 48, 0.5, A.DING.confetti()))}
      ${tb('data-wort="balloon"', buendel(438, 34, 0.48, ["#e63946", "#4fc3f7", "#ffd23f"], [[-22, 10], [22, 6], [0, -16]]))}
      ${herz(40, 50, 0.8)}`,
  ];
  A.TITELBILD.birthday = 2;
})();

// Englischecke, Post aus Amerika (für englisch-art-2.js): Roccos Cousine Ruby,
// ihre fünf Postkarten (je 600 × 380, die Bildseite) und der Briefkasten.
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { apfel, wolke, FARBE } = A.hilfen;
  const { GRAU, GRAU_D, DUNKEL, HELL } = FARBE;
  const PINK = "#ef6fa8", PINK_D = "#c9417f", PINK_H = "#f9b8d4";
  const at = (x, y, s, inhalt) => `<g transform="translate(${x} ${y}) scale(${s})">${inhalt}</g>`;

  // ===========================================================================
  // Ruby, Roccos Cousine: auch ein Waschbär, mit einer pinken Masche am Ohr
  // ===========================================================================
  const masche = () => `<path d="M-2 1 L-6 12 M2 1 L7 11" stroke="${PINK_D}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M0 0 L-14 -9 Q-19 0 -14 9 Z" fill="${PINK}"/><path d="M0 0 L14 -9 Q19 0 14 9 Z" fill="${PINK}"/>
    <path d="M-4 -1 L-12 -4 M4 -1 L12 -4" stroke="${PINK_H}" stroke-width="2" stroke-linecap="round"/>
    <circle r="4.4" fill="${PINK_D}"/>`;
  //   laune  froh | traurig | hoch | freude | staun (Mund offen) | kalt (Zähne klappern)
  //   hut    ein Cowboyhut (die Masche sitzt dann aussen am Hut)
  function rubyKopf(laune = "froh", { hut = false } = {}) {
    const hoch = laune === "hoch";
    const augen = laune === "freude"
      ? `<path d="M-17 -3 q5 -6 10 0 M7 -3 q5 -6 10 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
`
      : `<circle cx="-12" cy="-3" r="5.4" fill="#fff"/><circle cx="12" cy="-3" r="5.4" fill="#fff"/>
         ${[hoch ? -11 : -11.5, hoch ? 13 : 12.5].map((x) => `<circle cx="${x}" cy="${hoch ? -5.5 : -2.5}" r="3" fill="${DUNKEL}"/><circle cx="${x + 1}" cy="${hoch ? -6.6 : -3.6}" r="1.1" fill="#ffffff"/>`).join("")}`;
    const mund = {
      traurig: `<path d="M-6 19 Q0 14 6 19" stroke="${DUNKEL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      staun: `<ellipse cx="0" cy="18" rx="4.6" ry="5.4" fill="#7a2f3f"/>`,
      kalt: `<path d="M-8 18 l2.7 -2.6 l2.7 2.6 l2.7 -2.6 l2.7 2.6 l2.7 -2.6 l2.7 2.6" stroke="${DUNKEL}" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`,
      freude: `<path d="M-8 14 Q0 26 8 14 Z" fill="#7a2f3f"/>`,
    }[laune] || `<path d="M-7 15 Q0 21 7 15" stroke="${DUNKEL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    // Die hellen Brauen: traurig und kalt innen hochgezogen.
    const sorge = laune === "traurig" || laune === "kalt";
    const brauen = sorge ? "M-19 -13 Q-13 -15 -7 -19 M19 -13 Q13 -15 7 -19" : "M-18 -14 Q-12 -20 -6 -15 M18 -14 Q12 -20 6 -15";
    const hutSvg = hut ? `<path d="M-40 -24 Q-36 -15 -18 -21 Q0 -25 18 -21 Q36 -15 40 -24 Q32 -32 0 -32 Q-32 -32 -40 -24 Z" fill="#a0612f"/>
      <path d="M-18 -29 Q-20 -51 -10 -53 Q0 -47 10 -53 Q20 -51 18 -29 Z" fill="#b8763d"/>
      <path d="M-18.4 -33 Q0 -37 18.4 -33 L18.8 -28.5 Q0 -32.5 -18.8 -28.5 Z" fill="${PINK}"/>` : "";
    return `<g>
    <path d="M-29 -10 L-27 -36 L-11 -24 Z" fill="${GRAU_D}"/><path d="M29 -10 L27 -36 L11 -24 Z" fill="${GRAU_D}"/>
    <path d="M-25 -15 L-24 -30 L-15 -22 Z" fill="${DUNKEL}"/><path d="M25 -15 L24 -30 L15 -22 Z" fill="${DUNKEL}"/>
    <ellipse cx="0" cy="0" rx="31" ry="26" fill="${GRAU}"/>
    <path d="${brauen}" stroke="${HELL}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-30 3 Q0 -4 30 3 Q27 25 0 26 Q-27 25 -30 3 Z" fill="${HELL}"/>
    <path d="M-28 -5 Q-15 -14 0 -6 Q15 -14 28 -5 Q24 9 12 7 Q4 5 0 3 Q-4 5 -12 7 Q-24 9 -28 -5 Z" fill="${DUNKEL}"/>
    ${augen}
    <circle cx="-20" cy="14" r="4.6" fill="${PINK}" opacity="0.55"/><circle cx="20" cy="14" r="4.6" fill="${PINK}" opacity="0.55"/>
    <ellipse cx="0" cy="9" rx="5.4" ry="3.8" fill="${DUNKEL}"/>
    ${mund}${hutSvg}
    <g transform="translate(22 -28) rotate(24)">${masche()}</g>
  </g>`;
  }
  const SCHWANZ = "M8 -20 C46 -16 72 -34 70 -66 C69 -84 60 -96 50 -102";
  // Wenn Ruby friert, legt sie den Schwanz um die Füsse.
  const SCHWANZ_KALT = "M18 -14 C48 -14 54 1 30 3 C10 5 -18 4 -36 -1";
  const schwanz = (bogen, breite, spitze) => `<path d="${bogen}" stroke="#c3c7cf" stroke-width="${breite}" fill="none" stroke-linecap="round"/>
    <path d="${bogen}" stroke="#4f5560" stroke-width="${breite}" fill="none" stroke-dasharray="11 13" stroke-dashoffset="-14"/>
    <circle cx="${spitze[0]}" cy="${spitze[1]}" r="${breite / 2}" fill="${DUNKEL}"/>`;
  const arm = (cx, cy, rx, ry, w) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${w} ${cx} ${cy})" fill="${GRAU_D}"/>`;
  const ARME = {
    steh: arm(-24, -46, 7, 15, 16) + arm(24, -46, 7, 15, -16),
    wink: arm(-36, -74, 7, 18, -35) + arm(24, -46, 7, 15, -16),
    jubel: arm(-36, -76, 7, 18, -35) + arm(36, -76, 7, 18, 35),
    zeig: arm(-40, -64, 18, 7, 16) + arm(24, -46, 7, 15, -16),
    zitter: arm(-5, -52, 19, 7, 22) + arm(5, -50, 19, 7, -22),
  };
  // Ganze Ruby, Füsse bei (0,0), etwa 150 hoch.
  //   pose  steh | wink | jubel | zeig (nach links) | zitter (friert, mit Brrr-Strichen)
  //   hut, schal  was sie anhat
  function ruby(pose = "steh", laune = "froh", { hut = false, schal = false } = {}) {
    const kalt = pose === "zitter";
    const schalFarbe = "#e8543f";
    const streifen = `stroke="#ffffff" stroke-width="3"`;
    return `<g>
    ${kalt ? "" : schwanz(SCHWANZ, 22, [50, -102])}
    <ellipse cx="-12" cy="-6" rx="11" ry="7" fill="${DUNKEL}"/><ellipse cx="12" cy="-6" rx="11" ry="7" fill="${DUNKEL}"/>
    <ellipse cx="0" cy="-42" rx="27" ry="35" fill="${GRAU}"/><ellipse cx="0" cy="-36" rx="17" ry="25" fill="#d9dce2"/>
    ${kalt ? schwanz(SCHWANZ_KALT, 18, [-36, -1]) : ""}
    ${schal ? `<path d="M9 -66 L13 -28 L27 -30 L22 -68 Z" fill="${schalFarbe}"/><path d="M11 -46 L24 -48 M12 -37 L25 -39" ${streifen}/>
      <path d="M14 -28 v6 M18.5 -28.6 v6 M23 -29.2 v6" stroke="${schalFarbe}" stroke-width="2.4" stroke-linecap="round"/>` : ""}
    ${ARME[pose] || ARME.steh}
    <g transform="translate(0 -94)">${rubyKopf(laune, { hut })}</g>
    ${schal ? `<path d="M-27 -72 Q0 -62 27 -72 L28 -61 Q0 -51 -28 -61 Z" fill="${schalFarbe}"/><path d="M-14 -66 L-13 -56 M0 -63.5 L0 -54 M14 -66 L13 -56" ${streifen}/>` : ""}
    ${kalt ? `<path d="M-38 -64 q-5 7 0 14 M-47 -68 q-6 11 0 22 M38 -64 q5 7 0 14 M47 -68 q6 11 0 22 M-40 -112 q-4 5 0 10 M40 -112 q4 5 0 10" stroke="#5d8fd1" stroke-width="3" fill="none" stroke-linecap="round"/>` : ""}
  </g>`;
  }
  A.rubyKopf = rubyKopf;
  A.ruby = ruby;

  // ===========================================================================
  // Die Postkarten: Bildseite 600 × 380 mit weissem Rand und einer Briefmarke
  // ===========================================================================
  const RAND = `<path d="M0 0 H600 V380 H0 Z M18 10 H582 Q590 10 590 18 V362 Q590 370 582 370 H18 Q10 370 10 362 V18 Q10 10 18 10 Z" fill="#ffffff" fill-rule="evenodd"/>
    <rect x="0.5" y="0.5" width="599" height="379" fill="none" stroke="#d9d2c3" stroke-width="1"/>`;
  // Eine kleine Briefmarke oben rechts mit gezacktem Rand und Poststempel.
  function marke(grund, motiv) {
    const x = 516, y = 26, b = 56, h = 66;
    let zacken = "";
    for (let i = 0; i <= 8; i += 1) zacken += `<circle cx="${x + i * 7}" cy="${y}" r="3"/><circle cx="${x + i * 7}" cy="${y + h}" r="3"/>`;
    for (let i = 1; i < 11; i += 1) zacken += `<circle cx="${x}" cy="${(y + i * 6.6).toFixed(1)}" r="3"/><circle cx="${x + b}" cy="${(y + i * 6.6).toFixed(1)}" r="3"/>`;
    return `<rect x="${x + 2}" y="${y + 3}" width="${b}" height="${h}" fill="#000000" opacity="0.12"/>
      <g fill="#ffffff">${zacken}<rect x="${x}" y="${y}" width="${b}" height="${h}"/></g>
      <rect x="${x + 6}" y="${y + 6}" width="${b - 12}" height="${h - 12}" fill="${grund}"/>
      <g transform="translate(${x + b / 2} ${y + h / 2})">${motiv}</g>
      <g fill="none" stroke="#5d6882" stroke-width="2" opacity="0.45">
        <circle cx="${x - 2}" cy="${y + h - 8}" r="17"/><circle cx="${x - 2}" cy="${y + h - 8}" r="11"/>
        <path d="M${x - 64} ${y + 30} q7 -5 14 0 t14 0 t14 0 t14 0 M${x - 64} ${y + 40} q7 -5 14 0 t14 0 t14 0 M${x - 64} ${y + 50} q7 -5 14 0 t14 0"/>
      </g>`;
  }
  const MOTIV = {
    apfel: apfel(0, 4, 14),
    welle: `<circle cx="0" cy="-8" r="11" fill="#ffb703"/><path d="M-20 10 q5 -6 10 0 t10 0 t10 0 t10 0 M-20 20 q5 -6 10 0 t10 0 t10 0 t10 0" stroke="#3a7bd5" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    kaktus: `<path d="M-5 3 H-11 Q-15 3 -15 -1 V-11 M5 -3 H11 Q15 -3 15 -7 V-15" stroke="#3fa34d" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="-5.5" y="-20" width="11" height="42" rx="5.5" fill="#3fa34d"/><circle cx="0" cy="-21" r="4" fill="${PINK}"/>`,
    orange: `<circle cy="4" r="15" fill="#f5a623"/><circle cx="-5" cy="-1" r="4" fill="#ffc861"/><path d="M0 -10 q6 -9 14 -6 q-4 8 -14 6 Z" fill="#3fa34d"/>`,
    flocke: `<g stroke="#3a7bd5" stroke-width="3" fill="none" stroke-linecap="round">${[0, 60, 120].map((w) => `<path d="M0 -18 V18 M-5 -14 L0 -9 L5 -14 M-5 14 L0 9 L5 14" transform="rotate(${w})"/>`).join("")}</g>`,
  };
  // Ein eigenes <svg> schneidet ab, was über die Karte ragt (ohne clipPath-id).
  const karte = (inhalt, grund, motiv) => `<svg width="600" height="380" viewBox="0 0 600 380" overflow="hidden">${inhalt}${RAND}${marke(grund, MOTIV[motiv])}</svg>`;
  const wellen = (liste, farbe, breite = 3) => liste.map(([x, y, n]) => `<path d="M${x} ${y}${" q8 -6 16 0".repeat(n)}" stroke="${farbe}" stroke-width="${breite}" fill="none" stroke-linecap="round"/>`).join("");

  // --- New York: hohe Häuser, die Freiheitsstatue, Ruby winkt ---------------
  function hausMitFenstern(x, b, oben, farbe, fenster = "#e3edf8", unten = 272) {
    let s = `<rect x="${x}" y="${oben}" width="${b}" height="${unten - oben}" fill="${farbe}"/>`;
    const n = Math.max(1, Math.floor((b - 6) / 11));
    const links = x + (b - (n - 1) * 11) / 2;
    for (let k = 0; k < n; k += 1) s += `<path d="M${links + k * 11} ${oben + 9} V${unten - 4}" stroke="${fenster}" stroke-width="5" stroke-dasharray="7 6"/>`;
    return s;
  }
  const wasserturm = (x, y) => `<path d="M${x - 6} ${y} L${x - 5} ${y - 7} M${x + 6} ${y} L${x + 5} ${y - 7}" stroke="#6d4628" stroke-width="2"/>
    <rect x="${x - 8}" y="${y - 19}" width="16" height="13" rx="2" fill="#8a5a35"/><path d="M${x - 9} ${y - 18} L${x} ${y - 26} L${x + 9} ${y - 18} Z" fill="#6d4628"/>`;
  function freiheitsstatue() {
    const G = "#6fc2a6", GD = "#4a9d84";
    const zacken = [-72, -48, -24, 0, 24, 48, 72].map((w) => {
      const r = (w * Math.PI) / 180, s = Math.sin(r), c = Math.cos(r);
      const p = (d, q) => `${(s * d + c * q).toFixed(1)},${(-95 - c * d + s * q).toFixed(1)}`;
      return `${p(8, -3.2)} ${p(19, 0)} ${p(8, 3.2)}`;
    });
    return `<path d="M-34 0 L-27 -14 H27 L34 0 Z" fill="#c4b088"/><rect x="-21" y="-56" width="42" height="44" fill="#d9c7a0"/>
      <rect x="-14" y="-46" width="8" height="18" rx="3" fill="#c4b088"/><rect x="6" y="-46" width="8" height="18" rx="3" fill="#c4b088"/>
      <rect x="-25" y="-62" width="50" height="8" rx="2" fill="#c4b088"/>
      <g transform="translate(0 -62)">
        <path d="M-20 0 L-15 -62 Q-13 -84 0 -86 Q13 -84 15 -62 L20 0 Z" fill="${G}"/>
        <path d="M-7 -3 L-5 -50 M6 -3 L8 -44 M-15 -60 Q0 -48 15 -70" stroke="${GD}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M-10 -78 L-17 -127" stroke="${G}" stroke-width="9" stroke-linecap="round"/>
        <path d="M10 -74 L17 -58" stroke="${G}" stroke-width="8" stroke-linecap="round"/>
        <rect x="11" y="-80" width="13" height="23" rx="2" fill="${GD}" transform="rotate(-12 17 -68)"/>
        <rect x="-21" y="-140" width="7" height="14" rx="2" fill="${GD}"/><path d="M-26 -141 H-9 L-12 -135 H-23 Z" fill="${G}"/>
        <path d="M-17.5 -160 Q-7 -150 -10 -142 H-25 Q-28 -150 -17.5 -160 Z" fill="#ffb703"/><path d="M-17.5 -153 Q-13 -148 -14 -143 H-21 Q-22 -148 -17.5 -153 Z" fill="#ffe27a"/>
        <circle cx="0" cy="-95" r="10.5" fill="${G}"/>
        <path d="${zacken.map((z) => `M${z} Z`).join(" ")}" fill="${G}"/>
        <path d="M-10 -99 Q0 -104 10 -99" stroke="${GD}" stroke-width="3" fill="none"/>
        <circle cx="-3.5" cy="-94" r="1.6" fill="${GD}"/><circle cx="3.5" cy="-94" r="1.6" fill="${GD}"/>
      </g>`;
  }
  function newyork() {
    let s = `<rect width="600" height="380" fill="#bfe6f5"/>${wolke(250, 62, 0.7)}${wolke(445, 44, 0.55)}`;
    // hinten: blasse Häuser im Dunst
    s += [[160, 40, 128], [198, 30, 100], [252, 44, 136], [300, 30, 112], [372, 40, 104], [420, 34, 118], [470, 46, 136], [532, 40, 142], [574, 26, 120]]
      .map(([x, b, o]) => `<rect x="${x}" y="${o}" width="${b}" height="${272 - o}" fill="#b8c6de"/>`).join("");
    // vorne: Häuser mit Fenstern
    s += hausMitFenstern(166, 44, 172, "#7d8fb3") + wasserturm(178, 172);
    s += hausMitFenstern(206, 36, 142, "#5d6f99");
    s += hausMitFenstern(238, 46, 190, "#c9a27a", "#fff3c4") + wasserturm(268, 190);
    s += hausMitFenstern(280, 36, 150, "#8893b5");
    // das Empire State Building
    s += `<rect x="339" y="26" width="3" height="36" fill="#6c7fa8"/>
      <rect x="333" y="58" width="15" height="20" fill="#9aa7c7"/><rect x="326" y="76" width="29" height="24" fill="#9aa7c7"/><rect x="319" y="98" width="43" height="174" fill="#9aa7c7"/>
      ${[326, 336, 346, 356].map((x) => `<path d="M${x} 106 V266" stroke="#e3edf8" stroke-width="4" stroke-dasharray="7 5"/>`).join("")}
      <path d="M334 82 V96 M340.5 82 V96 M347 82 V96" stroke="#e3edf8" stroke-width="3"/>`;
    s += hausMitFenstern(362, 46, 162, "#6c7fa8");
    // ein Turm mit Spitze (wie das Chrysler Building)
    s += `<path d="M408 120 L428 70 L448 120 Z" fill="#c3c9d6"/>${[0, 1, 2].map((k) => `<path d="M${413 + k * 4} ${108 - k * 12} Q428 ${98 - k * 12} ${443 - k * 4} ${108 - k * 12}" stroke="#8d95a3" stroke-width="3" fill="none"/>`).join("")}
      <rect x="427" y="54" width="2.5" height="18" fill="#8d95a3"/>${hausMitFenstern(408, 40, 120, "#4f6290")}`;
    s += hausMitFenstern(448, 46, 178, "#c9a27a", "#fff3c4");
    s += hausMitFenstern(494, 38, 150, "#7d8fb3") + wasserturm(520, 150);
    s += hausMitFenstern(532, 42, 196, "#5d6f99");
    s += hausMitFenstern(574, 30, 168, "#a7b2cc");
    // Wasser, die Insel mit der Statue, das Geländer und der Gehweg
    s += `<rect y="268" width="600" height="54" fill="#4f9bd6"/>${wellen([[30, 282, 3], [210, 290, 4], [420, 280, 3], [300, 308, 3], [500, 300, 4]], "#8cc6ee")}
      <ellipse cx="104" cy="296" rx="72" ry="11" fill="#7fbf6a"/>${at(104, 292, 0.86, freiheitsstatue())}
      <rect y="320" width="600" height="60" fill="#c9cfd8"/><rect y="320" width="600" height="7" fill="#9aa2b0"/>
      ${[0, 1, 2, 3].map((k) => `<path d="M${k * 160 - 20} 352 H${k * 160 + 60}" stroke="#b5bcc8" stroke-width="3"/>`).join("")}
      <path d="M0 300 H600" stroke="#3d6b5a" stroke-width="5"/><path d="M0 311 H600" stroke="#3d6b5a" stroke-width="2.5"/>
      ${Array.from({ length: 21 }, (_, k) => `<rect x="${k * 30 - 1.5}" y="300" width="3.5" height="21" fill="#3d6b5a"/>`).join("")}`;
    s += at(440, 362, 1.12, ruby("wink", "hoch"));
    s += `<path d="M378 252 q-7 -6 -5 -15 M366 262 q-10 -7 -9 -20" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    return karte(s, "#fff4dc", "apfel");
  }

  // --- San Francisco: die grosse rote Brücke im Nebel ------------------------
  function bridge() {
    const R = "#d8432e", RD = "#a8321f";
    const DECK = 200;
    // ein Tragseil (quadratische Kurve mit gleichmässigem x) und seine Hänger
    const seil = (x0, y0, cy, x1, y1) => {
      const cx = (x0 + x1) / 2;
      let haenger = "";
      for (let t = 0.04; t < 1; t += 0.05) {
        const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
        const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
        if (y < DECK - 4) haenger += `M${x.toFixed(1)} ${y.toFixed(1)} V${DECK}`;
      }
      return `<path d="${haenger}" stroke="${R}" stroke-width="1.6"/><path d="M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}" stroke="${R}" stroke-width="4.5" fill="none"/>`;
    };
    const turm = (x) => `<rect x="${x - 19}" y="232" width="38" height="16" rx="3" fill="#8d95a3"/>
      <rect x="${x - 15}" y="62" width="10" height="172" fill="${R}"/><rect x="${x + 5}" y="62" width="10" height="172" fill="${R}"/>
      <rect x="${x - 7}" y="62" width="2" height="172" fill="${RD}"/><rect x="${x + 13}" y="62" width="2" height="172" fill="${RD}"/>
      ${[68, 100, 132, 164].map((y) => `<rect x="${x - 15}" y="${y}" width="30" height="7" fill="${R}"/>`).join("")}
      <rect x="${x - 17}" y="56" width="34" height="8" rx="2" fill="${RD}"/>`;
    let s = `<rect width="600" height="380" fill="#cfe7f2"/>
      <path d="M0 196 V146 Q56 116 116 138 Q176 160 236 196 Z" fill="#94b77b"/>
      <path d="M318 196 Q392 158 470 168 Q540 176 600 156 V196 Z" fill="#a7c48c"/>
      ${[[438, 182], [462, 176], [486, 180], [520, 172], [548, 170]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="${14 + (i % 2) * 6}" height="${196 - y}" fill="${["#f2efe6", "#e6e0d2"][i % 2]}"/>`).join("")}
      <rect y="196" width="600" height="184" fill="#3f8fd2"/>
      ${wellen([[40, 266, 3], [250, 258, 4], [470, 270, 3], [120, 312, 4], [330, 300, 3]], "#7dbbe8")}
      <g fill="#ffffff" opacity="0.85"><ellipse cx="70" cy="172" rx="90" ry="15"/><ellipse cx="190" cy="186" rx="70" ry="11"/><ellipse cx="500" cy="186" rx="120" ry="13"/><ellipse cx="40" cy="120" rx="60" ry="12"/></g>`;
    s += turm(150) + turm(410);
    s += seil(150, 60, 140, -10, 186) + seil(150, 60, 332, 410, 60) + seil(410, 60, 140, 610, 186);
    s += `<rect x="-5" y="${DECK}" width="610" height="9" fill="${R}"/><rect x="-5" y="${DECK + 9}" width="610" height="7" fill="${RD}"/>
      ${Array.from({ length: 31 }, (_, k) => `<path d="M${k * 20} ${DECK + 9} l10 7 l10 -7" stroke="${R}" stroke-width="1.5" fill="none"/>`).join("")}
      <g fill="#ffffff" opacity="0.8"><ellipse cx="290" cy="238" rx="150" ry="10"/><ellipse cx="80" cy="240" rx="90" ry="9"/></g>`;
    // ein Segelboot und zwei Möwen
    s += `<path d="M96 318 H150 L142 330 H104 Z" fill="#e8543f"/><rect x="121" y="268" width="3" height="50" fill="#6d4628"/>
      <path d="M126 270 L126 314 L156 314 Z" fill="#ffffff"/><path d="M119 280 L119 314 L98 314 Z" fill="#f2efe6"/>
      <path d="M262 104 q8 -8 16 0 q8 -8 16 0 M300 128 q6 -6 12 0 q6 -6 12 0" stroke="${DUNKEL}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    // vorne der Strand mit Ruby
    s += `<path d="M250 380 Q330 318 600 304 V380 Z" fill="#ecd39a"/><path d="M250 380 Q330 318 600 304" stroke="#d9b974" stroke-width="5" fill="none"/>
      <ellipse cx="560" cy="350" rx="26" ry="14" fill="#9aa0ab"/><ellipse cx="574" cy="344" rx="14" ry="10" fill="#b5bac3"/><ellipse cx="350" cy="366" rx="16" ry="8" fill="#9aa0ab"/>`;
    s += at(470, 352, 1.08, ruby("zeig", "freude"));
    return karte(s, "#e3f5fb", "welle");
  }

  // --- Grand Canyon: rote Felsen, Ruby mit Hut am Rand ----------------------
  // ein Tafelberg aus Schichten, von unten nach oben: [breiteUnten, breiteOben, hoehe, farbe]
  const tafel = (cx, y, schichten) => {
    let s = "", yy = y;
    for (const [bu, bo, h, f] of schichten) {
      s += `<path d="M${cx - bu / 2} ${yy} L${cx - bo / 2} ${yy - h} H${cx + bo / 2} L${cx + bu / 2} ${yy} Z" fill="${f}"/>
        <path d="M${cx + bu * 0.18} ${yy} L${cx + bo * 0.18} ${yy - h} H${cx + bo / 2} L${cx + bu / 2} ${yy} Z" fill="#7a2a1a" opacity="0.13"/>`;
      yy -= h;
    }
    return s;
  };
  function canyon() {
    const F1 = ["#e9ad8e", "#f1c2a6"], F2 = ["#d8774f", "#e59266"], F3 = ["#bd5233", "#cf6a43"];
    let s = `<rect width="600" height="380" fill="#bfe3f2"/><circle cx="92" cy="66" r="28" fill="#ffd23f"/>${wolke(300, 58, 0.6)}
      <path d="M0 156 L90 152 L180 157 L300 150 L420 155 L520 151 L600 154 V380 H0 Z" fill="#f1c4a8"/>
      <rect y="166" width="600" height="6" fill="#f7d8c3"/><rect y="182" width="600" height="5" fill="#e7b092"/>`;
    // weit hinten: blasse Tafelberge
    s += tafel(96, 262, [[170, 130, 24, F1[0]], [130, 116, 18, F1[1]], [116, 76, 18, F1[0]], [76, 66, 18, F1[1]]]);
    s += tafel(300, 254, [[160, 120, 22, F1[0]], [120, 110, 20, F1[1]], [110, 60, 16, F1[0]], [60, 50, 14, F1[1]]]);
    s += tafel(500, 262, [[190, 150, 26, F1[0]], [150, 140, 18, F1[1]], [140, 90, 20, F1[0]], [90, 80, 14, F1[1]]]);
    // Mitte: orange Felsen
    s += `<path d="M0 330 L0 268 L60 262 L120 280 L190 276 L240 292 L330 286 L420 296 L520 284 L600 290 V330 Z" fill="${F2[0]}"/>
      <path d="M0 282 L60 276 L120 292 L190 288 L240 302 L330 296 L420 306 L520 296 L600 302" stroke="${F2[1]}" stroke-width="6" fill="none"/>`;
    s += tafel(380, 290, [[150, 104, 30, F2[0]], [104, 96, 20, F2[1]], [96, 62, 22, F2[0]], [62, 54, 16, F2[1]], [54, 26, 14, F2[0]]]);
    s += tafel(212, 284, [[90, 70, 20, F2[1]], [70, 64, 16, F2[0]], [64, 40, 14, F2[1]]]);
    // die Schlucht mit dem Fluss
    s += `<path d="M230 380 L250 330 Q330 316 420 322 Q480 326 520 336 L540 380 Z" fill="#8f3b27"/>
      <path d="M262 352 Q330 330 400 336 Q450 340 500 348" stroke="#4f9bd6" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M300 344 q10 -3 20 0 M410 339 q10 -2 20 1" stroke="#9fd0f0" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    // vorne rechts: die nahe Felswand
    s += `<path d="M472 380 L470 330 L488 300 L486 262 L520 240 L600 236 V380 Z" fill="${F3[0]}"/>
      <path d="M486 270 L522 248 L600 244 M480 310 L600 300 M474 344 L600 340" stroke="${F3[1]}" stroke-width="7" fill="none"/>`;
    // vorne links: der Rand, auf dem Ruby steht
    s += `<path d="M0 380 V334 L230 332 Q256 334 262 348 L250 380 Z" fill="${F3[0]}"/>
      <path d="M0 334 L230 332 Q256 334 262 348 L240 350 Q226 340 200 342 L0 344 Z" fill="#dd8a5c"/>
      <path d="M0 360 L246 358 M0 372 L242 371" stroke="${F3[1]}" stroke-width="5" fill="none"/>`;
    // ein Kaktus, ein Busch, zwei Vögel
    s += `<g transform="translate(240 340)"><path d="M-6 -22 H-14 Q-19 -22 -19 -28 V-40 M6 -30 H14 Q19 -30 19 -36 V-50" stroke="#3fa34d" stroke-width="9" fill="none" stroke-linecap="round"/>
        <rect x="-7" y="-58" width="14" height="60" rx="7" fill="#3fa34d"/><path d="M-2 -50 V-4 M2 -50 V-4" stroke="#2f8a3f" stroke-width="1.5"/></g>
      <path d="M330 110 q9 -9 18 0 q9 -9 18 0 M394 92 q6 -6 12 0 q6 -6 12 0" stroke="${DUNKEL}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    s += at(116, 342, 1.08, ruby("jubel", "staun", { hut: true }));
    return karte(s, "#fde2cf", "kaktus");
  }

  // --- Florida: Palmen, Sumpf und ein freundlicher Alligator ------------------
  const BLATT = "M0 0 Q32 -30 72 6 Q36 -6 0 0 Z";
  function palme(x, y, s = 1, neig = 1) {
    const tx = 26 * neig, ty = -150;
    const blatt = (w, spiegel, farbe) => `<path d="${BLATT}" fill="${farbe}" transform="${spiegel ? "scale(-1 1) " : ""}rotate(${w})"/>`;
    return at(x, y, s, `<path d="M0 0 Q${4 * neig} -80 ${tx} ${ty}" stroke="#a0723e" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M0 0 Q${4 * neig} -80 ${tx} ${ty}" stroke="#86592c" stroke-width="15" fill="none" stroke-dasharray="3 11"/>
      <g transform="translate(${tx} ${ty})">
        ${blatt(-28, false, "#3f9a45")}${blatt(-28, true, "#3f9a45")}${blatt(6, false, "#4caf50")}${blatt(6, true, "#4caf50")}
        ${blatt(38, false, "#3f9a45")}${blatt(38, true, "#3f9a45")}${blatt(-62, false, "#5cbf5c")}${blatt(-62, true, "#5cbf5c")}
        <circle cx="-6" cy="6" r="7" fill="#7a4b26"/><circle cx="6" cy="7" r="7" fill="#8a5a35"/><circle cx="0" cy="13" r="6.5" fill="#6d4628"/>
      </g>`);
  }
  function alligator() {
    const G = "#5c9e3a", GD = "#3f7a2a", GH = "#9fd06e";
    const hoecker = [[-128, -15], [-110, -21], [-92, -26], [-74, -32], [-54, -39], [-34, -43], [-12, -44.5], [10, -44], [30, -40]];
    return `<ellipse cx="-44" cy="-6" rx="11" ry="7" fill="${GD}"/><ellipse cx="36" cy="-6" rx="11" ry="7" fill="${GD}"/>
      <path d="M-56 -36 Q-110 -30 -150 -12 Q-162 -6 -150 -3 Q-110 -8 -56 -10 Z" fill="${G}"/>
      <ellipse cx="-4" cy="-24" rx="66" ry="20" fill="${G}"/><ellipse cx="-6" cy="-12" rx="58" ry="7" fill="${GH}"/>
      ${hoecker.map(([x, y]) => `<path d="M${x - 6} ${y + 3} Q${x} ${y - 8} ${x + 6} ${y + 3} Z" fill="${GD}"/>`).join("")}
      <path d="M-34 -16 Q-40 -4 -38 0 H-22 Q-20 -8 -20 -16 Z M40 -16 Q34 -4 36 0 H52 Q54 -8 54 -16 Z" fill="#4e8c30"/>
      <path d="M-38 0 l-4 3 M-32 0 l-2 4 M36 0 l-4 3 M42 0 l-2 4" stroke="#4e8c30" stroke-width="3" stroke-linecap="round"/>
      <path d="M42 -40 Q60 -48 80 -40 L138 -29 Q148 -27 148 -21 Q148 -16 140 -16 L54 -14 Z" fill="${G}"/>
      <path d="M54 -14 L136 -15 Q144 -13 140 -7 Q120 -3 62 -4 Z" fill="${GH}"/>
      ${[74, 88, 102, 116, 128].map((x) => `<path d="M${x} -15.5 l3.2 5.5 l3.2 -5.5 Z" fill="#ffffff"/>`).join("")}
      <path d="M54 -23 Q57 -14 66 -15 Q100 -14 138 -16.5" stroke="#2f5a1f" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="140" cy="-29" r="5" fill="${G}"/><circle cx="141" cy="-30" r="1.7" fill="${DUNKEL}"/>
      <circle cx="64" cy="-44" r="12" fill="${G}"/><circle cx="65.5" cy="-46" r="8" fill="#ffffff"/><circle cx="68" cy="-46" r="4" fill="${DUNKEL}"/><circle cx="69.4" cy="-47.6" r="1.3" fill="#ffffff"/>
      <ellipse cx="78" cy="-27" rx="6" ry="4" fill="#ffb3c7" opacity="0.8"/>`;
  }
  function florida() {
    let s = `<rect width="600" height="380" fill="#bfe6f5"/><circle cx="300" cy="70" r="30" fill="#ffd23f"/>${wolke(420, 60, 0.6)}${wolke(170, 92, 0.5)}
      ${Array.from({ length: 16 }, (_, k) => `<circle cx="${k * 40 + (k % 2) * 10}" cy="${214 - (k % 3) * 8}" r="${30 + (k % 2) * 8}" fill="${["#4c9a4a", "#3f8a3f", "#5aa852"][k % 3]}"/>`).join("")}
      ${palme(412, 236, 0.6, 1)}<rect y="226" width="600" height="154" fill="#5aa89a"/>
      ${wellen([[180, 250, 3], [360, 244, 4], [60, 262, 2], [230, 358, 3], [380, 368, 2]], "#8fd0c2")}`;
    // links das Ufer mit zwei Palmen
    s += `<path d="M0 286 Q90 276 152 296 Q178 330 132 380 H0 Z" fill="#8cc063"/><path d="M0 300 Q70 292 120 306" stroke="#79ad52" stroke-width="5" fill="none"/>`;
    s += palme(60, 304, 1.12, 1) + palme(128, 318, 0.8, -1);
    // die Sandbank mit dem Alligator
    s += `<ellipse cx="292" cy="322" rx="156" ry="16" fill="#d8c08a"/><ellipse cx="292" cy="318" rx="138" ry="9" fill="#e6d2a0"/>`;
    s += at(292, 322, 0.94, alligator());
    // Seerosen
    s += [[194, 352, 1], [244, 366, 0.8], [396, 354, 0.9]].map(([x, y, m]) => at(x, y, m, `<ellipse rx="19" ry="7.5" fill="#4caf50"/><path d="M0 0 L20 -5 L20 5 Z" fill="#5aa89a"/>`)).join("");
    s += `<g transform="translate(236 362)"><path d="M0 0 L-6 -10 L0 -6 L6 -10 Z M-9 -4 L0 0 L9 -4 L4 -12 Z" fill="${PINK}"/><circle cy="-3" r="3" fill="#ffd166"/></g>`;
    // rechts der Steg mit Ruby und eine Palme
    s += `${[436, 478, 520, 562].map((x) => `<rect x="${x}" y="336" width="10" height="44" fill="#6d4628"/>`).join("")}
      <rect x="420" y="324" width="190" height="16" rx="3" fill="#b8763d"/>${[452, 486, 520, 554].map((x) => `<rect x="${x}" y="324" width="2" height="16" fill="#8a5a35"/>`).join("")}
      <rect x="420" y="338" width="190" height="4" fill="#8a5a35"/>`;
    s += at(506, 330, 1.06, ruby("zeig", "staun"));
    return karte(s, "#e4f5d4", "orange");
  }

  // --- Alaska: Schnee, Berge, ein Elch, Ruby friert ---------------------------
  const tanne = (x, y, s) => at(x, y, s, `<rect x="-6" y="-14" width="12" height="16" fill="#6d4628"/>
    <path d="M-36 -12 L0 -58 L36 -12 Z M-29 -42 L0 -84 L29 -42 Z M-21 -68 L0 -106 L21 -68 Z" fill="#2f6b4f"/>
    <path d="M-36 -12 Q-18 -20 0 -14 Q18 -20 36 -12 M-29 -42 Q-14 -50 0 -44 Q14 -50 29 -42 M-21 -68 Q-10 -75 0 -70 Q10 -75 21 -68" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-7 -94 L0 -106 L7 -94 Q3 -91 0 -93 Q-3 -91 -7 -94 Z" fill="#ffffff"/>`);
  function elch() {
    const B = "#7a4e2d", BD = "#5b3a22", BH = "#93633c", GEW = "#d9b98a";
    return `${[[-48, BD], [-32, "#6d4628"], [28, BD], [44, "#6d4628"]].map(([x, f]) => `<rect x="${x}" y="-64" width="13" height="64" rx="5" fill="${f}"/><rect x="${x}" y="-7" width="13" height="7" rx="2" fill="${DUNKEL}"/>`).join("")}
      <path d="M-58 -92 q-9 2 -9 11" stroke="${BD}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-80" rx="60" ry="28" fill="${B}"/><ellipse cx="32" cy="-92" rx="32" ry="24" fill="${B}"/>
      <path d="M-30 -104 q10 -9 22 -3 q10 -9 24 -2 q10 -6 22 2 q-34 6 -68 3 Z" fill="#ffffff"/>
      <path d="M52 -104 L80 -108 L90 -86 L58 -74 Z" fill="${B}"/>
      <ellipse cx="88" cy="-96" rx="25" ry="14" transform="rotate(30 88 -96)" fill="${B}"/>
      <ellipse cx="102" cy="-82" rx="15" ry="12" fill="${BH}"/><ellipse cx="111" cy="-82" rx="2.6" ry="3.6" fill="${DUNKEL}"/>
      <path d="M97 -73 q6 3 12 -2" stroke="${DUNKEL}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M84 -80 q3 15 -3 20 q-7 -6 -3 -20 Z" fill="${BD}"/>
      <ellipse cx="70" cy="-112" rx="10" ry="5" transform="rotate(-30 70 -112)" fill="${BD}"/>
      <circle cx="84" cy="-102" r="3.6" fill="${DUNKEL}"/><circle cx="85.2" cy="-103.2" r="1.2" fill="#ffffff"/>
      <path d="M86 -112 Q100 -122 108 -140 L110 -128 L118 -142 L119 -128 L127 -136 L123 -122 Q112 -110 92 -106 Z" fill="#c9a674"/>
      <path d="M76 -112 Q60 -120 52 -138 L59 -135 L57 -150 L65 -141 L67 -156 L73 -144 L79 -154 L81 -138 Q83 -124 82 -112 Z" fill="${GEW}"/>`;
  }
  function alaska() {
    const flocken = [[40, 60], [130, 40], [210, 84], [300, 34], [380, 70], [470, 110], [160, 150], [260, 160], [420, 180], [560, 150], [80, 200], [330, 120], [410, 236], [30, 140]];
    let s = `<rect width="600" height="380" fill="#b7d8ee"/>
      <path d="M0 250 L70 160 L120 200 L210 96 L300 210 L370 140 L450 220 L530 124 L600 190 V300 H0 Z" fill="#a9bdd6"/>
      <path d="M50 186 L70 160 L90 186 L80 182 L70 190 L60 182 Z M184 126 L210 96 L238 128 L226 124 L214 134 L202 124 Z M352 162 L370 140 L390 164 L380 160 L370 168 L362 160 Z M506 152 L530 124 L556 152 L544 148 L532 158 L520 148 Z" fill="#ffffff"/>
      <path d="M0 270 L110 196 L190 262 L290 178 L400 270 L500 196 L600 258 V310 H0 Z" fill="#8ea5c4"/>
      <path d="M86 212 L110 196 L134 216 L122 212 L110 222 L98 212 Z M262 200 L290 178 L318 202 L304 198 L292 208 L278 198 Z M476 212 L500 196 L524 214 L512 210 L500 220 L488 210 Z" fill="#ffffff"/>
      <path d="M0 290 Q150 268 300 284 T600 278 V380 H0 Z" fill="#f4f8fc"/>
      <path d="M0 336 Q120 320 250 334 M330 318 Q450 306 600 316" stroke="#dbe8f3" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    s += tanne(36, 304, 1.05) + tanne(92, 292, 0.72) + tanne(574, 300, 0.95) + tanne(350, 288, 0.6);
    s += `<ellipse cx="214" cy="328" rx="96" ry="9" fill="#dbe8f3"/>${at(200, 326, 1.06, elch())}`;
    s += `<ellipse cx="470" cy="350" rx="56" ry="8" fill="#dbe8f3"/>${at(468, 344, 1.12, ruby("zitter", "kalt", { schal: true }))}`;
    s += flocken.map(([x, y], i) => (i % 3 === 0
      ? `<g transform="translate(${x} ${y})" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"><path d="M0 -7 V7 M-6 -3.5 L6 3.5 M-6 3.5 L6 -3.5"/></g>`
      : `<circle cx="${x}" cy="${y}" r="${3 + (i % 2)}" fill="#ffffff"/>`)).join("");
    return karte(s, "#e3f5fb", "flocke");
  }
  A.POSTKARTEN = { newyork, bridge, canyon, florida, alaska };

  // ===========================================================================
  // Der Briefkasten: blau, rund gewölbt, auf einem Pfosten, mit roter Fahne.
  // Ursprung am Fuss des Pfostens, etwa 120 hoch.
  // ===========================================================================
  A.BRIEFKASTEN = (fahneOben = false) => {
    const BLAU = "#3a7bd5", BLAU_D = "#2a5fb0", BLAU_H = "#7fb0f0";
    return `<ellipse cx="0" cy="0" rx="26" ry="5" fill="#000000" opacity="0.12"/>
      <rect x="-7" y="-68" width="14" height="68" rx="2" fill="#8a5a35"/><rect x="-7" y="-68" width="4" height="68" fill="#a0703f"/>
      <rect x="-22" y="-70" width="44" height="8" rx="2" fill="#6d4628"/>
      <path d="M-38 -64 H48 V-100 Q48 -116 32 -116 H-38 Z" fill="${BLAU}"/>
      <path d="M-32 -108 H30 Q40 -108 41 -100" stroke="${BLAU_H}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M-20 -70 H44" stroke="${BLAU_D}" stroke-width="3" stroke-linecap="round"/>
      <path d="M-58 -64 V-96 A20 20 0 0 1 -18 -96 V-64 Z" fill="${BLAU_D}"/>
      <path d="M-53 -69 V-96 A15 15 0 0 1 -23 -96 V-69 Z" fill="${BLAU}"/>
      <rect x="-42" y="-92" width="8" height="10" rx="3" fill="#ffd166"/>
      <g transform="rotate(${fahneOben ? 0 : -90} 32 -84)">
        <rect x="29" y="-132" width="6" height="50" rx="3" fill="#b23a34"/>
        <path d="M34 -132 H56 Q60 -132 60 -128 V-116 Q60 -112 56 -112 H34 Z" fill="#e63946"/>
      </g>
      <circle cx="32" cy="-84" r="4.5" fill="#ffd166"/>`;
  };
})();
