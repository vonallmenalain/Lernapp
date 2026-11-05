/*
 * englisch-art-4.js – Die Zeichnungen der Englischecke aus Etappe 4: die
 * Welten My Body, Clothes and Weather und Holidays mit Wimmelbild,
 * Stickern, Aufnähern und je einer Bildgeschichte («Good night, Rocco!»,
 * «Rain, rain!», «Trick or treat!»), dazu die Bilder der Spiele: das Monster
 * (MONSTER), die Katze an fünf Orten (WO_KATZE) und die Gegenteile
 * (GEGENTEILE).
 *
 * Wie die anderen englisch-art-*.js: flache Farben, runde Formen, kein Text
 * im Bild. Kommt nach englisch-art-3.js (Ruby, Roccos Kleider).
 */

// Englischecke, Welt body (für englisch-art-2.js)
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { tb, FARBE } = A.hilfen;
  const { DUNKEL, GRAU, GRAU_D, HELL, HAUT } = FARBE;
  const HAUT_D = "#e9b08a", HAUT_DD = "#c7835f", OHR = "#efae8e", OHR_D = "#d98f72", WANGE = "#f4978e";
  const LIPPE = "#e4617b", RACHEN = "#8f2c3c", ZUNGE = "#f58aa0", FUGE_Z = "#d7dde6";
  const HAAR = "#9a6239", HAAR_D = "#6d4628", HAAR_B = "#3b2a22", SPANGE = "#ffd23f";
  const KLEID = "#ef6fa8", KLEID_D = "#d9558f", HEMD = "#3a7bd5", HEMD_D = "#2f63bd", HOSE = "#ffd166", HOSE_D = "#f2b632";
  const WAND = "#d6eef8", FLIESE = "#ffffff", FUGE = "#cfe6f1", BODEN = "#a9cfe0", BODEN_D = "#95c1d5", PORZELLAN = "#c3cad6";
  const KEIN = 'pointer-events="none"';
  const f1 = (n) => Number(n.toFixed(1));
  const at = (x, y, s, inhalt, w = 0) => `<g transform="translate(${x} ${y})${w ? ` rotate(${w})` : ""}${s === 1 ? "" : ` scale(${s})`}">${inhalt}</g>`;
  const funkel = (x, y, r = 8, farbe = "#ffd166") => `<path d="M${x} ${y - r} Q${f1(x + r * 0.18)} ${f1(y - r * 0.18)} ${x + r} ${y} Q${f1(x + r * 0.18)} ${f1(y + r * 0.18)} ${x} ${y + r} Q${f1(x - r * 0.18)} ${f1(y + r * 0.18)} ${x - r} ${y} Q${f1(x - r * 0.18)} ${f1(y - r * 0.18)} ${x} ${y - r} Z" fill="${farbe}"/>`;
  const stern5 = (x, y, r, farbe = "#ffe27a") => `<polygon points="${Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${f1(x + rr * Math.cos(a))},${f1(y + rr * Math.sin(a))}`; }).join(" ")}" fill="${farbe}"/>`;
  const blase = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" fill-opacity="0.55" stroke="#9fd8f0" stroke-width="${f1(Math.max(1.2, r / 5))}"/><circle cx="${f1(x - r * 0.35)}" cy="${f1(y - r * 0.35)}" r="${f1(r * 0.25)}" fill="#ffffff"/>`;
  const spiegeln = (s) => `<g transform="scale(-1 1)">${s}</g>`;

  // =========================================================================
  // Das Mädchen vorne links, gross als Porträt. Alles in Gesichts-Koordinaten:
  // (0, 0) ist die Mitte des Gesichts, das im Bild bei MF liegt.
  // =========================================================================
  const MF = [240, 298];
  // Wie durchsichtig das Gesicht im Ohren-Sticker ist; die Wangen darüber so,
  // dass im Bild genau die Wangen des Hintergrunds herauskommen (0.45 deckend)
  const GEIST = 0.3, GEIST_WANGE = f1((0.45 * GEIST) / (0.55 + 0.45 * GEIST) * 1000) / 1000;
  const gesicht = () => `<ellipse rx="136" ry="144" fill="${HAUT}"/>
    <circle cx="-88" cy="54" r="22" fill="${WANGE}" opacity="0.45"/><circle cx="88" cy="54" r="22" fill="${WANGE}" opacity="0.45"/>`;
  const maedchen = () => `<path d="M-214 270 Q-212 190 -124 176 L-46 164 Q0 194 46 164 L124 176 Q212 190 214 270 Z" fill="${KLEID}"/>
    <path d="M-46 164 Q0 198 46 164" stroke="${KLEID_D}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <rect x="-38" y="96" width="76" height="84" rx="22" fill="${HAUT}"/><path d="M-38 120 Q0 170 38 120 V104 H-38 Z" fill="${HAUT_D}"/>
    ${gesicht()}`;
  // Ihr Unterarm (für die Hand mit den Fingern), von unten ins Bild
  const HAND_M = [116, 470];
  const unterarm = () => `<path d="M${HAND_M[0] + 2} ${HAND_M[1] + 26} L${HAND_M[0] - 6} 572" stroke="${HAUT}" stroke-width="44" stroke-linecap="round"/>
    <path d="M${HAND_M[0] - 44} 532 Q${HAND_M[0] - 6} 520 ${HAND_M[0] + 34} 532 L${HAND_M[0] + 40} 566 H${HAND_M[0] - 50} Z" fill="${KLEID}"/>
    <path d="M${HAND_M[0] - 44} 532 Q${HAND_M[0] - 6} 520 ${HAND_M[0] + 34} 532" stroke="${KLEID_D}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  // Die langen Zöpfe und das Haar (Gesichts-Koordinaten)
  const zopf = `<path d="M128 -88 Q170 -84 194 -50 Q220 -4 210 62 Q204 108 182 128 Q194 82 188 40 Q182 0 168 -32 Q158 -56 130 -62 Z" fill="${HAAR}"/>
    <path d="M176 -46 Q198 -6 194 50 M190 70 Q190 96 184 112" stroke="${HAAR_D}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g transform="rotate(30 152 -72)"><rect x="138" y="-82" width="28" height="18" rx="8" fill="${SPANGE}"/></g><circle cx="160" cy="-62" r="6" fill="#ef476f"/>`;
  const haar = () => `${at(8, 0, 1, zopf)}${spiegeln(at(8, 0, 1, zopf))}
    <path d="M-150 -30 Q-170 -164 0 -168 Q170 -164 150 -30 Q142 -60 118 -76 Q100 -66 84 -84 Q62 -70 40 -86 Q18 -72 -4 -86 Q-26 -72 -48 -86 Q-70 -70 -90 -84 Q-108 -64 -124 -74 Q-144 -58 -150 -30 Z" fill="${HAAR}"/>
    <path d="M-96 -136 Q-60 -150 -30 -148 M30 -150 Q70 -146 100 -130 M-124 -100 Q-118 -120 -100 -128" stroke="${HAAR_D}" stroke-width="5" fill="none" stroke-linecap="round"/>`;

  // =========================================================================
  // Der Bub in der Mitte, ganz (Bild-Koordinaten): Hände hoch über dem Kopf
  // =========================================================================
  const BX = 660;
  const hemd = () => `<path d="M606 266 Q606 250 622 248 L642 245 Q660 262 678 245 L698 248 Q714 250 714 266 L712 318 Q660 326 608 318 Z" fill="${HEMD}"/>
    <path d="M642 245 Q660 264 678 245" stroke="${HEMD_D}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const hemdSaum = () => `<path d="M608 300 H712 V318 Q660 326 608 318 Z" fill="${HEMD}"/>`;
  const hose = () => `<path d="M604 362 H716 L722 404 Q694 412 666 406 L660 386 L654 406 Q626 412 598 404 Z" fill="${HOSE}"/>
    <rect x="604" y="356" width="112" height="14" rx="5" fill="${HOSE_D}"/>`;
  const bubGrund = () => `<ellipse cx="${BX}" cy="500" rx="134" ry="22" fill="#4fbfb4"/><ellipse cx="${BX}" cy="500" rx="112" ry="15" fill="#7fd6cc"/>
    <rect x="647" y="216" width="26" height="42" rx="9" fill="${HAUT}"/><path d="M647 222 Q660 248 673 222 V216 H647 Z" fill="${HAUT_D}"/>
    ${hemd()}${hose()}`;
  // Eine Hand, die Handfläche zu uns, der Daumen nach links (zur Mitte)
  const hand = () => `<rect x="-19" y="-12" width="38" height="40" rx="15" fill="${HAUT}"/>
    ${[[-13.2, 26, -6], [-4.4, 30, -2], [4.4, 28, 3], [13.2, 22, 9]].map(([x, l, w]) => `<rect x="${x - 3.8}" y="${-6 - l}" width="7.6" height="${l + 8}" rx="3.8" fill="${HAUT}" transform="rotate(${w} ${x} -4)"/>`).join("")}
    <rect x="-5.5" y="-24" width="11" height="28" rx="5.5" fill="${HAUT}" transform="translate(-15 14) rotate(-32)"/>
    <path d="M-7 12 Q2 18 11 11" stroke="${HAUT_D}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;

  // =========================================================================
  // Die Dinge
  // =========================================================================
  Object.assign(A.DING, {
    // Kopf des Buben mit Gesicht und Haar
    head: () => `${[-1, 1].map((k) => `<g transform="scale(${k} 1)"><circle cx="47" cy="6" r="12" fill="${OHR}"/><path d="M49 0 q6 6 0 12" stroke="${OHR_D}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`).join("")}
      <circle r="48" fill="${HAUT}"/>
      <path d="M-50 4 Q-58 -50 -6 -58 Q46 -62 54 -10 Q52 2 48 6 Q44 -20 26 -26 Q16 -16 2 -28 Q-12 -18 -26 -28 Q-40 -18 -50 4 Z" fill="${HAAR_B}"/>
      <path d="M-8 -56 q8 -12 22 -8" stroke="${HAAR_B}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <ellipse cx="-17" cy="4" rx="5.5" ry="7" fill="${DUNKEL}"/><ellipse cx="17" cy="4" rx="5.5" ry="7" fill="${DUNKEL}"/><circle cx="-15" cy="1.5" r="2" fill="#ffffff"/><circle cx="19" cy="1.5" r="2" fill="#ffffff"/>
      <path d="M-26 -10 q8 -5 16 -1 M10 -11 q8 -4 16 1" stroke="${HAAR_B}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <circle cx="-30" cy="20" r="8" fill="${WANGE}" opacity="0.5"/><circle cx="30" cy="20" r="8" fill="${WANGE}" opacity="0.5"/>
      <path d="M-3 13 q3 3 6 0" stroke="${HAUT_DD}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M-14 22 Q0 38 14 22 Z" fill="${RACHEN}"/><path d="M-7 30 Q0 25 7 30 Q4 33.5 0 33.5 Q-4 33.5 -7 30 Z" fill="${ZUNGE}"/>`,
    // Die Augen des Mädchens, mit Brauen
    eyes: () => [-1, 1].map((k) => `<g transform="translate(${50 * k} 0) scale(${k} 1)">
      <ellipse rx="25" ry="29" fill="#ffffff"/><circle cx="1" cy="4" r="16" fill="#7a4b2a"/><circle cx="1" cy="4" r="8.5" fill="${DUNKEL}"/><circle cx="6" cy="-2" r="4.6" fill="#ffffff"/>
      <path d="M-25 -2 Q-24 -30 0 -30 Q24 -30 25 -2" stroke="${DUNKEL}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M22 -14 l9 -6 M24 -6 l9 -3" stroke="${DUNKEL}" stroke-width="3" stroke-linecap="round"/>
      <path d="M-22 -44 Q2 -60 26 -46" stroke="${HAAR_D}" stroke-width="7" fill="none" stroke-linecap="round"/></g>`).join(""),
    // Die Ohren; dazu (zum Erkennen im Sticker) das Gesicht, halb durchsichtig:
    // im Bild liegt es genau auf dem gleichen Gesicht des Hintergrunds und
    // ändert dort nichts (gleiche Farbe über gleicher Farbe), ist nicht antippbar
    ears: () => `<g ${KEIN}><ellipse rx="135" ry="143" fill="${HAUT}" opacity="${GEIST}"/>
      ${[-88, 88].map((x) => `<circle cx="${x}" cy="54" r="22" fill="${WANGE}" opacity="${GEIST_WANGE}"/>`).join("")}</g>
      ${[-1, 1].map((k) => `<g transform="scale(${k} 1)"><path d="M132.2 -34 C186 -44 192 48 128.2 48 A136 144 0 0 0 132.2 -34 Z" fill="${OHR}"/>
      <path d="M144 -20 Q170 -16 166 10 Q162 34 142 34" stroke="${OHR_D}" stroke-width="7" fill="none" stroke-linecap="round"/></g>`).join("")}`,
    nose: () => `<path d="M-7 -32 Q-10 -8 -26 4 Q-38 18 -26 28 Q-14 36 0 33 Q14 36 26 28 Q38 18 26 4 Q10 -8 7 -32 Q0 -40 -7 -32 Z" fill="${HAUT_D}"/>
      <ellipse cx="-12" cy="22" rx="6" ry="4.5" fill="${HAUT_DD}"/><ellipse cx="12" cy="22" rx="6" ry="4.5" fill="${HAUT_DD}"/>
      <ellipse cx="-5" cy="4" rx="6" ry="9" fill="#fbe2cf" opacity="0.8"/>`,
    mouth: () => `<path d="M-58 -18 Q0 -8 58 -18 Q54 24 0 28 Q-54 24 -58 -18 Z" fill="${RACHEN}" stroke="${LIPPE}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M-30 16 Q0 0 30 16 Q22 25 0 25 Q-22 25 -30 16 Z" fill="${ZUNGE}"/>`,
    hair: () => at(0, 20, 1, haar()),
    // Ein lachender Mund mit blitzblanken Zähnen
    teeth: () => `${funkel(-48, -42, 9)}${funkel(50, -44, 11)}${funkel(58, 30, 7)}
      <path d="M-56 -20 Q0 -10 56 -20 Q52 28 0 32 Q-52 28 -56 -20 Z" fill="${RACHEN}" stroke="${LIPPE}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M-49 -16 Q0 -7 49 -16 L46 -1 Q0 7 -46 -1 Z" fill="#ffffff"/>
      ${[-33, -17, 0, 17, 33].map((x) => `<path d="M${x} ${f1(-12 + Math.abs(x) * -0.06)} V${f1(3 - Math.abs(x) * 0.08)}" stroke="${FUGE_Z}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}
      <path d="M-30 20 Q0 30 30 20 L27 13 Q0 21 -27 13 Z" fill="#ffffff"/>${[-12, 0, 12].map((x) => `<path d="M${x} 15 V24" stroke="${FUGE_Z}" stroke-width="2" stroke-linecap="round"/>`).join("")}
      <path d="M-16 11 Q0 4 16 11 Q8 15 0 15 Q-8 15 -16 11 Z" fill="${ZUNGE}"/>`,
    // Die Hand des Mädchens: fünf Finger mit Fingerfarbe an den Spitzen
    fingers: () => {
      const finger = (x, w, l, c) => `<g transform="translate(${x} -18) rotate(${w})"><rect x="-8.5" y="${-l}" width="17" height="${l + 12}" rx="8.5" fill="${HAUT}"/><circle cy="${8.5 - l}" r="8.5" fill="${c}"/><circle cx="-2.5" cy="${6 - l}" r="2.4" fill="#ffffff" opacity="0.6"/></g>`;
      return `<rect x="-36" y="-30" width="72" height="66" rx="28" fill="${HAUT}"/>
        ${finger(-26, -16, 38, "#b06ad8")}${finger(-9, -6, 50, "#3a7bd5")}${finger(9, 4, 54, "#3fbf74")}${finger(26, 14, 47, "#ffd23f")}
        <g transform="translate(30 6) rotate(44)"><rect x="-9.5" y="-44" width="19" height="50" rx="9.5" fill="${HAUT}"/><circle cy="-34.5" r="9.5" fill="#e8543f"/><circle cx="-2.5" cy="-37" r="2.4" fill="#ffffff" opacity="0.6"/></g>
        <path d="M-16 10 Q0 20 16 10" stroke="${HAUT_D}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    },
    // Die Arme des Buben (mit den Ärmeln), hoch über dem Kopf; dazu, halb
    // durchsichtig und nicht antippbar, sein Hemd (im Bild unsichtbar)
    arms: () => `<path d="M-53 84 Q-53 79 -48 79 H48 Q53 79 53 84 L51 135 Q0 143 -51 135 Z" fill="${HEMD}" opacity="${GEIST}" ${KEIN}/>` + [-1, 1].map((k) => `<g transform="scale(${k} 1)">
      <path d="M50 80 L106 -12 L42 -80" stroke="${HAUT}" stroke-width="26" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(50 80) rotate(31.3)"><rect x="-17" y="-46" width="34" height="54" rx="14" fill="${HEMD}"/><rect x="-17" y="-48" width="34" height="9" rx="4.5" fill="${HEMD_D}"/></g></g>`).join(""),
    hands: () => `${at(-42, 0, 1, spiegeln(hand()))}${at(42, 0, 1, hand())}`,
    // Der Bauch mit dem Nabel (dazu Hemdsaum und Hosenbund, nicht antippbar)
    tummy: () => at(-BX, -338, 1, `<path d="M610 312 Q598 338 612 364 H708 Q722 338 710 312 Z" fill="${HAUT}"/>
      <path d="M640 352 Q660 360 680 352" stroke="${HAUT_D}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="660" cy="340" rx="5" ry="6" fill="${HAUT_DD}"/><path d="M655 336 q5 4 10 0" stroke="${HAUT_D}" stroke-width="2" fill="none"/>
      <g ${KEIN}>${hemdSaum()}<rect x="604" y="356" width="112" height="14" rx="5" fill="${HOSE_D}"/></g>`),
    // Die Beine (dazu die kurze Hose, nicht antippbar)
    legs: () => at(-BX, -420, 1, `${[635, 685].map((x) => `<rect x="${x - 15}" y="396" width="30" height="82" rx="13" fill="${HAUT}"/><path d="M${x - 8} 440 q8 5 16 0" stroke="${HAUT_D}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")}
      <g ${KEIN}>${hose()}</g>`),
    // Die nackten Füsse mit den Zehen
    feet: () => {
      const fuss = `<path d="M8 -12 Q30 -18 50 -8 Q62 2 56 12 Q50 18 30 18 Q10 18 6 8 Q2 -4 8 -12 Z" fill="${HAUT}"/>
        ${[[14, 11, 7.2], [26, 13.5, 5.8], [36.5, 13.5, 5.2], [46, 11.5, 4.7], [53.5, 7.5, 4.2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${HAUT}" stroke="${HAUT_D}" stroke-width="1.8"/>`).join("")}
        <path d="M22 -6 Q30 -2 40 -6" stroke="${HAUT_D}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      return `${fuss}${spiegeln(fuss)}`;
    },
  });

  // =========================================================================
  // Das Badezimmer (1000 × 560). Die beiden Kinder stehen im Hintergrund nur
  // mit dem, was kein Wort ist (Gesicht, Hals, Hemd, Hose); die Körperteile
  // sind die Dinge darüber – so sieht man bei «What's missing?» die Lücke.
  // =========================================================================
  const spiegel = () => `<ellipse cx="900" cy="200" rx="80" ry="92" fill="#f5b841"/><ellipse cx="900" cy="200" rx="68" ry="80" fill="#cdeefb"/>
    <path d="M858 146 L878 126 M854 170 L886 138" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`;
  const lavabo = () => `<rect x="812" y="316" width="176" height="12" rx="6" fill="#ffffff" stroke="${PORZELLAN}" stroke-width="3"/>
    <path d="M884 376 L878 432 H922 L916 376 Z" fill="#ffffff" stroke="${PORZELLAN}" stroke-width="3"/>
    <path d="M818 328 H982 Q980 372 920 378 H880 Q820 372 818 328 Z" fill="#ffffff" stroke="${PORZELLAN}" stroke-width="3"/>
    <path d="M904 316 V296 Q904 284 892 284 Q880 284 880 296 V300" stroke="#b4bbc6" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="920" cy="308" r="7" fill="#e8543f"/>
    <rect x="828" y="304" width="32" height="13" rx="6.5" fill="#ffd166"/>${blase(840, 296, 5)}${blase(852, 288, 4)}
    <g transform="rotate(-12 958 300)"><rect x="955" y="264" width="6" height="36" rx="3" fill="#3a7bd5"/><rect x="953" y="262" width="10" height="9" rx="2" fill="#ffffff"/></g>
    <g transform="rotate(10 966 300)"><rect x="963" y="268" width="6" height="32" rx="3" fill="#3fbf74"/><rect x="961" y="266" width="10" height="9" rx="2" fill="#ffffff"/></g>
    <rect x="948" y="290" width="26" height="28" rx="6" fill="#ef6fa8"/>`;
  const hocker = () => `<rect x="852" y="452" width="96" height="16" rx="6" fill="#e8543f"/><path d="M864 468 L858 506 M936 468 L942 506" stroke="#c8423b" stroke-width="10" stroke-linecap="round"/>`;
  const tuch = () => `<circle cx="512" cy="200" r="6" fill="#9aa3b2"/>
    <path d="M482 208 Q512 196 542 208 L538 312 Q512 318 486 312 Z" fill="#8bd36b"/>
    <path d="M485 284 Q512 290 539 284 M486 296 Q512 302 538 296" stroke="#ffffff" stroke-width="5" fill="none"/>`;
  A.HINTERGRUND.body = () => {
    let fliesen = "";
    for (let x = 25; x < 1000; x += 50) fliesen += `<path d="M${x} 238 V430" stroke="${FUGE}" stroke-width="3"/>`;
    for (let y = 286; y < 432; y += 48) fliesen += `<path d="M0 ${y} H1000" stroke="${FUGE}" stroke-width="3"/>`;
    let boden = "";
    for (let y = 466; y < 560; y += 36) boden += `<path d="M0 ${y} H1000" stroke="${BODEN_D}" stroke-width="2.5"/>`;
    for (let x = -40; x < 1100; x += 110) boden += `<path d="M${x} 436 L${f1(500 + (x - 500) * 1.35)} 560" stroke="${BODEN_D}" stroke-width="2.5"/>`;
    return `<rect width="1000" height="560" fill="${WAND}"/>
      <rect y="236" width="1000" height="196" fill="${FLIESE}"/>${fliesen}<rect y="228" width="1000" height="10" rx="4" fill="#9fd3e8"/>
      <rect y="432" width="1000" height="128" fill="${BODEN}"/>${boden}<rect y="428" width="1000" height="8" fill="#8fc0d6"/>
      ${blase(540, 70, 14)}${blase(574, 120, 9)}${blase(520, 132, 7)}${blase(800, 120, 10)}${blase(770, 96, 6)}
      ${spiegel()}${lavabo()}${hocker()}${tuch()}
      ${bubGrund()}
      ${at(MF[0], MF[1], 1, maedchen())}${unterarm()}`;
  };

  // Alles mit Massstab 1, damit jedes Ding genau auf dem Körper sitzt. Die
  // Reihenfolge zählt: was später kommt, liegt oben.
  A.ORTE.body = {
    ears: [MF[0], MF[1], 1, [160, 40]],
    hair: [MF[0], MF[1] - 20, 1, [196, -50]],
    eyes: [MF[0], MF[1], 1, [82, -30]],
    nose: [MF[0], MF[1] + 50, 1, [40, 2]],
    mouth: [MF[0], MF[1] + 106, 1, [66, -18]],
    fingers: [HAND_M[0], HAND_M[1], 1, [50, -64]],
    head: [BX, 182, 1, [0, -66]],
    arms: [BX, 182, 1, [118, -26]],
    hands: [BX, 74, 1, [64, -30]],
    tummy: [BX, 338, 1, [56, -22]],
    legs: [BX, 420, 1, [44, -8]],
    feet: [BX, 487, 1.1, [60, -14]],
    teeth: [900, 204, 1, [62, -28]],
  };

  Object.assign(A.STICKER, {
    head: [0.48, 6], eyes: [0.38, 8], ears: [0.175, 0], nose: [0.74, 0], mouth: [0.48, -4], hair: [0.14, -2], teeth: [0.4, 2],
    arms: [0.24, 0], hands: [0.46, -2], fingers: [0.48, 18], tummy: [0.52, 0], legs: [0.46, -2], feet: [0.46, -2],
  });
  A.AUFNAEHER_BILD.body = "hands";
  A.AUFNAEHER_FARBE.body = "#ee8a5b";

  // =========================================================================
  // Die Geschichte «Good night, Rocco!» (vier Bilder, je 472 × 204)
  // =========================================================================
  const bad = () => {
    let f = "";
    for (let x = 24; x < 472; x += 40) f += `<path d="M${x} 74 V162" stroke="${FUGE}" stroke-width="2"/>`;
    for (let y = 104; y < 162; y += 30) f += `<path d="M0 ${y} H472" stroke="${FUGE}" stroke-width="2"/>`;
    return `<rect width="472" height="204" fill="${WAND}"/><rect y="74" width="472" height="90" fill="${FLIESE}"/>${f}
      <rect y="70" width="472" height="6" rx="3" fill="#9fd3e8"/><rect y="162" width="472" height="42" fill="${BODEN}"/><rect y="160" width="472" height="5" fill="#8fc0d6"/>`;
  };
  const ohneMuetze = (pose, laune) => A.rocco(pose, laune).replace(A.roccoKopf(laune), A.roccoKopf(laune, { muetze: false }));
  const muetze = `<path d="M-21 -20 Q-20 -38 0 -39 Q20 -38 21 -20 Z" fill="#2f5fb3"/><rect x="-25" y="-22" width="50" height="6" rx="3" fill="#1d3f80"/><circle cx="0" cy="-29" r="3.4" fill="#ffd166"/>`;
  const handtuch = (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="#9aa3b2"/><path d="M${x - 24} ${y + 5} Q${x} ${y - 4} ${x + 24} ${y + 5} L${x + 21} ${y + 76} Q${x} ${y + 80} ${x - 21} ${y + 76} Z" fill="#8bd36b"/>
    <path d="M${x - 22} ${y + 60} Q${x} ${y + 64} ${x + 22} ${y + 60}" stroke="#ffffff" stroke-width="4" fill="none"/>`;
  // Rocco putzt: ein Mund mit Zähnen (für sein Gesicht, Füsse bei 0,0)
  const grinsen = `<path d="M-9 -81 Q0 -79 9 -81 Q8 -69 0 -68 Q-8 -69 -9 -81 Z" fill="${RACHEN}"/><path d="M-8 -80.6 Q0 -79 8 -80.6 L7.5 -76.8 Q0 -75.6 -7.5 -76.8 Z" fill="#ffffff"/>`;
  const zahnbuerste = (x, y, w, s = 1) => at(x, y, s, `<rect x="-4" y="-2" width="44" height="8" rx="4" fill="#3a7bd5"/><rect x="-12" y="-3" width="12" height="9" rx="2" fill="#2f63bd"/>
    <rect x="-12" y="-10" width="12" height="8" rx="1.5" fill="#ffffff"/><path d="M-10 -10 V-3 M-6 -10 V-3 M-2 -10 V-3" stroke="#9fd8f0" stroke-width="1.5"/>`, w);
  // Die Zoom-Blase: Roccos grosses Lächeln mit Zähnen und der Zahnbürste
  const zoom = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="70" fill="#ffffff" stroke="#9fd8f0" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="62" fill="${GRAU}"/><ellipse cx="${cx}" cy="${cy + 10}" rx="56" ry="44" fill="${HELL}"/>
    <ellipse cx="${cx}" cy="${cy - 30}" rx="17" ry="11" fill="${DUNKEL}"/><ellipse cx="${cx - 5}" cy="${cy - 33}" rx="5" ry="3" fill="#ffffff" opacity="0.5"/>
    ${at(cx, cy + 14, 0.78, `<path d="M-56 -20 Q0 -10 56 -20 Q52 28 0 32 Q-52 28 -56 -20 Z" fill="${RACHEN}" stroke="${DUNKEL}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M-49 -16 Q0 -7 49 -16 L46 -1 Q0 7 -46 -1 Z" fill="#ffffff"/>${[-33, -17, 0, 17, 33].map((x) => `<path d="M${x} -12 V2" stroke="${FUGE_Z}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}
      <path d="M-30 20 Q0 30 30 20 L27 13 Q0 21 -27 13 Z" fill="#ffffff"/><path d="M-16 11 Q0 4 16 11 Q8 15 0 15 Q-8 15 -16 11 Z" fill="${ZUNGE}"/>`)}
    ${zahnbuerste(cx + 34, cy + 12, -58, 0.74)}
    ${[[28, 4, 6], [38, 12, 5], [22, 14, 4], [40, 0, 4]].map(([x, y, r]) => `<circle cx="${cx + x}" cy="${cy + y}" r="${r}" fill="#ffffff" stroke="#d6eef8" stroke-width="1.2"/>`).join("")}
    ${funkel(cx - 40, cy - 8, 7)}${funkel(cx + 2, cy - 16, 5)}`;
  // Ein fluffiger Haarschopf für Rocco (Kopf-Koordinaten wie roccoKopf)
  const schopf = `<path d="M-25 -17 Q-32 -32 -40 -46 Q-24 -42 -16 -34 Q-18 -54 -6 -68 Q-2 -50 4 -42 Q12 -60 32 -62 Q22 -48 19 -36 Q32 -40 42 -32 Q32 -22 25 -17 Q0 -26 -25 -17 Z" fill="${GRAU_D}"/>
    <path d="M-20 -24 Q-26 -32 -30 -40 M-8 -26 Q-10 -44 -5 -56 M8 -27 Q14 -44 24 -54 M18 -24 Q26 -28 32 -31" stroke="#b9bec8" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const kamm = `<g transform="translate(-46 -90) rotate(36)"><rect x="-5" y="-54" width="7" height="58" rx="3" fill="#f08a24"/>
    <path d="${Array.from({ length: 8 }, (_, i) => `M2 ${-50 + i * 5} h7`).join(" ")}" stroke="#f08a24" stroke-width="2.6" stroke-linecap="round"/></g>
    <ellipse cx="-46" cy="-90" rx="7" ry="6" fill="${GRAU_D}"/>`;
  const nacht = () => `<rect width="472" height="204" fill="#34427a"/>
    ${[[200, 26, 4], [262, 54, 3], [330, 22, 4.5], [392, 48, 3], [446, 18, 3.5], [176, 60, 2.6]].map(([x, y, r]) => stern5(x, y, r, "#ffe27a")).join("")}
    <rect x="22" y="16" width="128" height="104" rx="8" fill="#c9d2e6"/><rect x="30" y="24" width="112" height="88" rx="4" fill="#1d2752"/>
    <circle cx="110" cy="54" r="20" fill="#ffe27a"/><circle cx="121" cy="46" r="18" fill="#1d2752"/>
    ${stern5(52, 44, 6)}${stern5(74, 86, 4.5)}${stern5(126, 96, 4)}${stern5(60, 98, 3)}
    <rect x="84" y="24" width="4" height="88" fill="#c9d2e6"/><rect y="170" width="472" height="34" fill="#4b3f6b"/><rect y="168" width="472" height="4" fill="#5d5182"/>`;
  // Erst beim Zeichnen: Im Französischwagen schläft hier Margot.
  const schlafKopf = () => A.roccoKopf("freude", { muetze: false }).replace(/q5 -6 10 0/g, "q5 5 10 0");

  A.GESCHICHTEN_BILDER.washup = [
    () => `${bad()}${handtuch(412, 52)}${blase(160, 50, 9)}${blase(300, 30, 7)}${blase(330, 66, 11)}${blase(128, 88, 5)}
      <g transform="translate(236 180) scale(1.12) translate(-236 -180)">
      ${tb('data-wort="raccoon"', at(236, 178, 0.95, A.rocco("steh", "froh")))}
      <path d="M226 152 L222 180 H250 L246 152 Z" fill="#ffffff" stroke="${PORZELLAN}" stroke-width="2"/>
      <path d="M164 134 H308 Q306 154 272 156 H200 Q166 154 164 134 Z" fill="#ffffff" stroke="${PORZELLAN}" stroke-width="2"/>
      <rect x="156" y="126" width="160" height="10" rx="5" fill="#ffffff" stroke="${PORZELLAN}" stroke-width="2"/>
      <path d="M186 126 V110 Q186 102 196 102 H212 Q222 102 222 110 V114" stroke="#b4bbc6" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="174" cy="120" r="5" fill="#e8543f"/>
      <rect x="219" y="116" width="6" height="12" rx="3" fill="#9fd8f0"/>
      <rect x="278" y="118" width="26" height="9" rx="4.5" fill="#ffd166"/>
      ${tb('data-wort="hands"', `${[[204, 124, 9], [216, 116, 7], [256, 118, 7], [268, 126, 9], [212, 134, 6], [262, 134, 6], [236, 136, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="#d6eef8" stroke-width="1.5"/>`).join("")}
        <ellipse cx="224" cy="128" rx="13" ry="10" fill="${GRAU_D}"/><ellipse cx="248" cy="128" rx="13" ry="10" fill="${GRAU_D}"/>
        <path d="M216 122 v6 M222 120 v7 M228 121 v6 M244 121 v6 M250 120 v7 M256 122 v6" stroke="${DUNKEL}" stroke-width="1.6" stroke-linecap="round" opacity="0.5"/>
        ${[[230, 118, 5], [242, 118, 5], [236, 130, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="#d6eef8" stroke-width="1.2"/>`).join("")}`)}</g>`,
    () => `${bad()}${handtuch(36, 48)}
      ${at(146, 192, 1.02, A.rocco("wink", "freude"))}
      <path d="M160 104 L276 54 M160 116 L276 130" stroke="#9fd8f0" stroke-width="2.5" stroke-dasharray="5 6" stroke-linecap="round"/>
      ${tb('data-wort="teeth"', `${at(146, 192, 1.02, grinsen)}${zoom(340, 94)}`)}
      ${zahnbuerste(98, 98, 16, 0.9)}<ellipse cx="99" cy="100" rx="7" ry="6" fill="${GRAU_D}"/>
      ${[[136, 110, 3.5], [132, 104, 2.5], [140, 116, 2.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff"/>`).join("")}`,
    () => `${bad()}<rect x="296" y="30" width="122" height="10" rx="4" fill="#c08a55"/><path d="M308 40 v10 M406 40 v10" stroke="#a8743f" stroke-width="5" stroke-linecap="round"/>
      ${at(382, 45, 0.9, muetze, -6)}${at(326, 30, 0.6, `<rect x="-14" y="-30" width="28" height="30" rx="6" fill="#ef6fa8"/>`)}
      ${at(196, 194, 1.15, ohneMuetze("wink", "froh"))}
      ${tb('data-wort="hair"', at(196, 194, 1.15, `<g transform="translate(0 -94)">${schopf}</g>`))}
      ${at(196, 194, 1.15, kamm)}
      <path d="M232 22 q14 4 18 18 M240 12 q18 6 22 24" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>${funkel(254, 64, 7)}${funkel(142, 28, 6)}`,
    () => `${nacht()}
      ${at(300, 138, 1.2, A.DING.bed())}
      ${at(170, 86, 0.8, muetze, -14)}
      ${tb('data-wort="raccoon"', `<path d="M418 128 C440 124 452 104 446 86" stroke="#c3c7cf" stroke-width="13" fill="none" stroke-linecap="round"/>
        <path d="M418 128 C440 124 452 104 446 86" stroke="#4f5560" stroke-width="13" fill="none" stroke-dasharray="7 8"/><circle cx="446" cy="84" r="7" fill="${DUNKEL}"/>
        ${at(208, 102, 0.82, schlafKopf())}`)}
      <path d="M226 124 Q236 102 272 100 Q332 92 384 104 Q420 110 428 124 L428 158 H226 Z" fill="#3a7bd5"/>
      <path d="M226 124 Q236 104 262 102 L270 116 Q246 116 232 128 Z" fill="#ffffff"/>
      ${[[290, 120], [330, 112], [370, 124], [404, 134], [310, 140], [350, 144]].map(([x, y]) => stern5(x, y, 5, "#ffd166")).join("")}
      ${tb('data-wort="raccoon"', `<ellipse cx="242" cy="118" rx="8" ry="6" fill="${GRAU_D}"/><ellipse cx="256" cy="114" rx="8" ry="6" fill="${GRAU_D}"/>`)}`,
  ];
  A.TITELBILD.washup = 1;
})();

// Englischecke, Welt clothes (für englisch-art-2.js)
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { tb, bildHintergrund, wolke, FARBE } = A.hilfen;
  const { DUNKEL } = FARBE;
  const f = (n) => Number(n.toFixed(1));
  const at = (x, y, s, inhalt, w = 0) => `<g transform="translate(${x} ${y})${w ? ` rotate(${w})` : ""} scale(${s})">${inhalt}</g>`;
  const spiegel = (inhalt) => `<g transform="scale(-1 1)">${inhalt}</g>`;
  const herz = (x, y, s = 1, farbe = "#ef6fa8") => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="${farbe}"/>`;
  const tropfen = (x, y, r = 6, farbe = "#3a8fd8") => `<path d="M${x} ${f(y - r * 1.9)} Q${f(x + r)} ${f(y - r * 0.4)} ${f(x + r)} ${y} A${r} ${r} 0 0 1 ${f(x - r)} ${y} Q${f(x - r)} ${f(y - r * 0.4)} ${x} ${f(y - r * 1.9)} Z" fill="${farbe}"/>`;
  const GELB = "#ffd23f", GELB_D = "#f5c400", GELB_DD = "#e0a800";
  const SHIRT = "#4fc3f7", SHIRT_D = "#2fa0d8";
  const BOGEN = ["#e63946", "#f5a623", "#ffd23f", "#3fbf74", "#3a8fd8", "#8e5bd6"];
  // Eine kleine Sonne als Aufdruck (T-Shirt)
  const sonnchen = (x, y, r) => `${Array.from({ length: 8 }, (_, k) => { const a = (k * Math.PI) / 4; return `<path d="M${f(x + r * 1.35 * Math.cos(a))} ${f(y + r * 1.35 * Math.sin(a))} L${f(x + r * 1.8 * Math.cos(a))} ${f(y + r * 1.8 * Math.sin(a))}" stroke="#ffb703" stroke-width="${f(r * 0.32)}" stroke-linecap="round"/>`; }).join("")}<circle cx="${x}" cy="${y}" r="${r}" fill="${GELB}"/>`;
  // Ein Wölkchen (am Fuss des Regenbogens)
  const woelkchen = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#ffffff"><ellipse cx="0" cy="4" rx="25" ry="11"/><circle cx="-10" cy="-2" r="11"/><circle cx="7" cy="-6" r="13"/></g>`;
  const regenbogen = (r0 = 60, w = 8.6, y0 = 24) => BOGEN.map((c, i) => { const r = r0 - i * w; return `<path d="M${f(-r)} ${y0} A${f(r)} ${f(r)} 0 0 1 ${f(r)} ${y0}" stroke="${c}" stroke-width="${w + 0.4}" fill="none"/>`; }).join("");
  // Schuh von der Seite (Spitze rechts)
  const schuh = (dunkel) => `<path d="M-34 -18 Q-34 -27 -25 -27 H-9 Q-3 -27 1 -21 L7 -13 Q30 -13 38 -3 Q41 1 40 6 H-34 Z" fill="${dunkel ? "#c8423b" : "#e8543f"}"/>
    <path d="M-31 -24 Q-21 -30 -10 -24" stroke="${dunkel ? "#7a2420" : "#8a2a26"}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M21 -11 Q35 -9 40 1 V6 H17 Q16 -4 21 -11 Z" fill="#ffffff"/>
    <path d="M-30 -6 Q-8 -10 14 -2" stroke="#ffffff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M-3 -22 l8 5 M1 -16 l8 5 M5 -10 l7 4" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
    <rect x="-36" y="4" width="78" height="10" rx="5" fill="#ffffff" stroke="#d9dce2" stroke-width="2"/>`;
  const socke = (farbe, streifen) => `<path d="M-12 -40 H12 V8 Q12 15 19 16 L30 18 Q42 21 42 32 Q42 44 30 44 H2 Q-12 44 -12 28 Z" fill="${farbe}"/>
    ${[-24, -10, 4].map((y) => `<rect x="-12" y="${y}" width="24" height="6" fill="${streifen}"/>`).join("")}
    <path d="M31 19 Q42 22 42 32 Q42 44 30 44 Q37 32 31 19 Z" fill="${streifen}"/><path d="M-12 26 Q-12 44 3 44 Q-3 34 -12 26 Z" fill="${streifen}"/>
    <rect x="-14" y="-46" width="28" height="12" rx="4" fill="#ffffff"/>${[-7, 0, 7].map((x) => `<path d="M${x} -44 V-36" stroke="#d9dce2" stroke-width="2"/>`).join("")}`;
  const faeustling = (farbe, hell) => `<ellipse cx="-17" cy="-4" rx="8" ry="13" transform="rotate(-30 -17 -4)" fill="${farbe}"/>
    <path d="M-16 18 V-24 Q-16 -42 0 -42 Q16 -42 16 -24 V18 Z" fill="${farbe}"/>
    <circle cx="0" cy="-20" r="4" fill="${hell}"/><circle cx="-7" cy="-8" r="3" fill="${hell}"/><circle cx="7" cy="-8" r="3" fill="${hell}"/>
    <rect x="-18" y="14" width="36" height="18" rx="5" fill="#ffffff"/>${[-10, -3, 4, 11].map((x) => `<path d="M${x} 17 V29" stroke="#d9dce2" stroke-width="2.4"/>`).join("")}`;

  Object.assign(A.DING, {
    coat: () => `<path d="M-6 -80 Q0 -90 6 -80" stroke="#8a5a35" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M-25 -50 Q-28 -82 0 -82 Q28 -82 25 -50 Z" fill="${GELB_DD}"/><path d="M-16 -55 Q-17 -72 0 -72 Q17 -72 16 -55 Z" fill="#b98a00"/>
      ${[-1, 1].map((s) => `<path d="M${-24 * s} -54 Q${-46 * s} -50 ${-49 * s} -28 L${-56 * s} 30 Q${-56 * s} 36 ${-50 * s} 36 H${-41 * s} Q${-36 * s} 36 ${-36 * s} 30 L${-33 * s} -8 Z" fill="${GELB_D}"/>
        <path d="M${-55.4 * s} 24 L${-36.4 * s} 24" stroke="${GELB_DD}" stroke-width="5"/>`).join("")}
      <path d="M-26 -56 Q0 -46 26 -56 L40 48 Q40 58 30 58 H-30 Q-40 58 -40 48 Z" fill="${GELB}"/>
      <path d="M0 -48 V58" stroke="${GELB_DD}" stroke-width="3"/>
      <path d="M-26 -56 L-6 -26 L0 -48 Z M26 -56 L6 -26 L0 -48 Z" fill="${GELB_D}"/>
      ${[-24, -4, 16, 36].map((y) => `<rect x="-8" y="${y}" width="16" height="5" rx="2.5" fill="#8a5a35"/>`).join("")}
      <path d="M-34 14 H-14 V21 H-34 Z M14 14 H34 V21 H14 Z" fill="${GELB_DD}"/>`,
    tshirt: () => `<path d="M-17 -42 L-50 -28 L-40 -4 L-28 -10 V42 Q-28 46 -24 46 H24 Q28 46 28 42 V-10 L40 -4 L50 -28 L17 -42 Q0 -28 -17 -42 Z" fill="${SHIRT}"/>
      <path d="M-17 -42 Q0 -28 17 -42" stroke="${SHIRT_D}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M-48 -24 L-39 -6 M48 -24 L39 -6" stroke="${SHIRT_D}" stroke-width="4" stroke-linecap="round"/>
      ${sonnchen(0, 8, 10)}`,
    sweater: () => `${[-1, 1].map((s) => `<path d="M${-27 * s} -43 Q${-45 * s} -41 ${-48 * s} -24 L${-56 * s} 32 H${-40 * s} L${-34 * s} -6 Z" fill="#43a047"/>
        <path d="M${-56.4 * s} 30 H${-39.6 * s} L${-39 * s} 44 H${-57.4 * s} Z" fill="#2f8a3f"/>
        <path d="M${-44 * s} -20 l${-3 * s} 5 l${-3 * s} -5 M${-46 * s} 0 l${-3 * s} 5 l${-3 * s} -5" stroke="#8bd36b" stroke-width="2.4" fill="none" stroke-linejoin="round"/>`).join("")}
      <path d="M-28 -44 Q0 -37 28 -44 L31 36 H-31 Z" fill="#4caf50"/>
      ${[-24, -8, 8, 24].map((y) => `<path d="M-26 ${y} ${Array(6).fill("l4.33 5 l4.33 -5").join(" ")}" stroke="#8bd36b" stroke-width="2.6" fill="none" stroke-linejoin="round"/>`).join("")}
      <rect x="-32" y="34" width="64" height="12" rx="3" fill="#2f8a3f"/>${[-24, -16, -8, 0, 8, 16, 24].map((x) => `<path d="M${x} 36 V44" stroke="#43a047" stroke-width="2"/>`).join("")}
      <path d="M-16 -44 Q0 -30 16 -44" stroke="#2f8a3f" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    pants: () => `<path d="M-30 -52 H30 L35 52 Q35 58 29 58 H9 Q4 58 4 53 L1 -6 Q0 -10 -1 -6 L-4 53 Q-4 58 -9 58 H-29 Q-35 58 -35 52 Z" fill="#3b6fc4"/>
      <path d="M-34 47 H-5 M5 47 H34" stroke="#2f5aa8" stroke-width="4"/>
      <path d="M-29 -48 Q-17 -46 -13 -34 M29 -48 Q17 -46 13 -34" stroke="#f5a623" stroke-width="2" fill="none"/>
      <path d="M1 -49 V-20 Q-1 -13 -8 -15" stroke="#2a4f94" stroke-width="2.4" fill="none"/>
      <rect x="-32" y="-60" width="64" height="11" rx="3" fill="#2f5aa8"/>
      ${[-21, 15].map((x) => `<rect x="${x}" y="-62" width="5" height="14" rx="2" fill="#2a4f94"/>`).join("")}<circle cx="0" cy="-54.5" r="3.2" fill="#ffd166"/>`,
    dress: () => `<ellipse cx="-22" cy="-48" rx="10" ry="8" fill="#f58cbc"/><ellipse cx="22" cy="-48" rx="10" ry="8" fill="#f58cbc"/>
      <path d="M-20 -56 Q0 -50 20 -56 L23 -10 H-23 Z" fill="#ef6fa8"/>
      <path d="M-23 -12 H23 L52 50 Q0 62 -52 50 Z" fill="#ef6fa8"/><path d="M-52 50 Q0 62 52 50 L54 56 Q0 70 -54 56 Z" fill="#ffffff"/>
      ${[[-30, 34], [-12, 22], [10, 36], [30, 20], [-38, 48], [0, 6], [-20, 4], [20, 6], [36, 44], [-6, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#ffffff"/>`).join("")}
      <path d="M-15 -55 Q-8 -42 0 -45 Q8 -42 15 -55 Q0 -49 -15 -55 Z" fill="#ffffff"/>
      <rect x="-25" y="-16" width="50" height="8" rx="4" fill="${GELB}"/><path d="M10 -12 l-8 -6 v12 Z M10 -12 l8 -6 v12 Z" fill="#f5a623"/>`,
    sneakers: () => `${at(-14, -12, 0.92, schuh(true))}${at(10, 10, 1, schuh(false))}`,
    socks: () => `${at(-16, -2, 1, socke("#8e5bd6", "#ffffff"), -8)}${at(14, 4, 1, socke("#a678e6", "#ffd23f"), 8)}`,
    gloves: () => `<rect x="-34" y="-40" width="68" height="74" fill="transparent"/><path d="M-30 30 Q0 58 30 30" stroke="#ffffff" stroke-width="3" fill="none"/>
      ${at(-24, -4, 1, faeustling("#26a69a", "#b2ece5"), -10)}${at(24, -4, 1, spiegel(faeustling("#26a69a", "#b2ece5")), 10)}`,
    cloud: () => `<g fill="#9aa5b5"><ellipse cx="0" cy="12" rx="62" ry="22"/><circle cx="-30" cy="-2" r="24"/><circle cx="6" cy="-16" r="31"/><circle cx="36" cy="0" r="22"/></g>
      <ellipse cx="0" cy="22" rx="54" ry="11" fill="#848fa0"/>
      <path d="M-46 -8 Q-42 -22 -28 -24 M-14 -30 Q-4 -44 16 -42" stroke="#c3cad6" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    rain: () => `<rect x="-52" y="-58" width="104" height="116" rx="22" fill="#8fbde8" opacity="0.35"/>
      ${[[-30, -36], [0, -36], [30, -36], [-15, -8], [15, -8], [-30, 20], [0, 20], [30, 20], [-15, 48], [15, 48]].map(([x, y]) => `<path d="M${x} ${y - 24} v8" stroke="#7fb6e8" stroke-width="3" stroke-linecap="round"/>${tropfen(x, y, 6.5)}`).join("")}`,
    rainbow: () => `${regenbogen()}${woelkchen(-40, 26)}${woelkchen(40, 26)}`,
  });

  // =========================================================================
  // Das Kinderzimmer (1000 × 560): links Kleiderschrank und Garderobe,
  // rechts das grosse Fenster, draussen Regen und ein Regenbogen
  // =========================================================================
  const WAND = "#fdeedd", WAND_P = "#f7dcc0", BODEN = "#d9a46c", BODEN_D = "#c48d55";
  const HOLZ = "#c08a55", HOLZ_D = "#a8743f", HOLZ_DD = "#8a5a35", INNEN = "#f2dcb8";
  const buegel = (x, y) => `<path d="M${x} ${y} q0 -8 6 -8 q6 0 6 6" stroke="#9aa3b2" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M${x - 30} ${y + 20} L${x} ${y + 2} L${x + 30} ${y + 20} Z" fill="none" stroke="${HOLZ_DD}" stroke-width="4" stroke-linejoin="round"/>`;
  A.HINTERGRUND.clothes = () => {
    let s = `<rect width="1000" height="560" fill="${WAND}"/>`;
    for (let y = 30; y < 460; y += 46) for (let x = (y / 46) % 2 ? 23 : 0; x < 1000; x += 46) s += `<circle cx="${x}" cy="${y}" r="4" fill="${WAND_P}"/>`;
    // Boden
    s += `<rect y="470" width="1000" height="90" fill="${BODEN}"/>`;
    for (let y = 500; y < 560; y += 30) s += `<path d="M0 ${y} H1000" stroke="${BODEN_D}" stroke-width="2"/>`;
    [[90, 470], [400, 500], [700, 470], [240, 530], [610, 530], [880, 500], [520, 470]].forEach(([x, y]) => { s += `<path d="M${x} ${y} v30" stroke="${BODEN_D}" stroke-width="2"/>`; });
    s += `<rect y="462" width="1000" height="12" fill="#ffffff"/>`;
    s += `<ellipse cx="330" cy="526" rx="170" ry="26" fill="#8ec5e8"/><ellipse cx="330" cy="526" rx="140" ry="18" fill="#bfe3f7"/>`;
    // Der Kleiderschrank, offen
    s += `<path d="M40 76 L8 60 V490 L40 470 Z" fill="${HOLZ}"/><path d="M34 100 L14 90 V460 L34 448 Z" fill="${HOLZ_D}" opacity="0.5"/><circle cx="31" cy="276" r="5" fill="#ffd166"/>
      <path d="M420 76 L452 60 V490 L420 470 Z" fill="${HOLZ}"/><path d="M426 100 L446 90 V460 L426 448 Z" fill="#e9f4fa"/><path d="M430 120 L440 115 M430 140 L442 134" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <rect x="40" y="72" width="380" height="398" rx="6" fill="${HOLZ}"/><rect x="28" y="58" width="404" height="20" rx="6" fill="${HOLZ_D}"/>
      <rect x="56" y="88" width="348" height="368" rx="4" fill="${INNEN}"/>
      <rect x="56" y="88" width="348" height="14" fill="#e6caa0"/>
      <rect x="60" y="102" width="340" height="7" rx="3.5" fill="#9aa3b2"/>
      <rect x="56" y="334" width="348" height="12" fill="${HOLZ_D}"/>
      <rect x="62" y="350" width="166" height="98" rx="5" fill="${HOLZ}"/><rect x="232" y="350" width="166" height="98" rx="5" fill="${HOLZ}"/>
      <rect x="125" y="392" width="40" height="10" rx="5" fill="${HOLZ_DD}"/><rect x="295" y="392" width="40" height="10" rx="5" fill="${HOLZ_DD}"/>
      <rect x="50" y="468" width="22" height="12" rx="3" fill="${HOLZ_DD}"/><rect x="388" y="468" width="22" height="12" rx="3" fill="${HOLZ_DD}"/>`;
    s += [100, 190, 278, 362].map((x) => buegel(x, 112)).join("");
    // Die Garderobe: ein Brett mit Haken
    s += `<rect x="466" y="118" width="148" height="18" rx="6" fill="${HOLZ_D}"/>${[500, 580].map((x) => `<circle cx="${x}" cy="127" r="5" fill="${HOLZ_DD}"/><path d="M${x} 130 v10 q0 6 6 6" stroke="#6f7682" stroke-width="4" fill="none" stroke-linecap="round"/>`).join("")}`;
    // Das Fenster
    s += `<rect x="628" y="58" width="364" height="12" rx="6" fill="${HOLZ_DD}"/>
      <rect x="640" y="72" width="340" height="326" rx="8" fill="#ffffff"/>
      <rect x="652" y="84" width="316" height="302" rx="3" fill="url(#himmel)"/>
      <path d="M652 340 Q720 318 800 332 T968 326 V386 H652 Z" fill="#94cd60"/><path d="M652 364 Q760 350 860 362 T968 358 V386 H652 Z" fill="#7cbf4a"/>
      ${[[690, 330, 0.5], [940, 326, 0.42]].map(([x, y, k]) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-7" y="-14" width="14" height="44" rx="4" fill="#8a6a4a"/><circle cx="0" cy="-40" r="32" fill="#6fba5a"/><circle cx="-24" cy="-18" r="22" fill="#6fba5a"/><circle cx="24" cy="-18" r="22" fill="#6fba5a"/></g>`).join("")}
      <ellipse cx="760" cy="372" rx="34" ry="6" fill="#8fc6ea"/>
      <rect x="806" y="84" width="8" height="302" fill="#ffffff"/>
      <rect x="626" y="394" width="368" height="16" rx="5" fill="#ffffff"/><rect x="632" y="408" width="356" height="6" rx="3" fill="#e1d9c6"/>
      <path d="M614 62 H660 Q648 220 662 392 H614 Z" fill="#8e5bd6"/><path d="M1000 62 H960 Q972 220 958 392 H1000 Z" fill="#8e5bd6"/>
      ${[650, 976].map((x) => `<rect x="${x - 10}" y="228" width="20" height="12" rx="5" fill="#ffd166"/>`).join("")}`;
    // Ein Wäscheständer unter dem Fenster: Socken und Handschuhe trocknen
    s += `<path d="M690 420 L668 530 M690 420 L712 530 M940 420 L918 530 M940 420 L962 530" stroke="#c3c7cf" stroke-width="6" stroke-linecap="round"/>
      <path d="M676 470 H704 M926 470 H954" stroke="#c3c7cf" stroke-width="4" stroke-linecap="round"/>
      <path d="M690 420 H940" stroke="#9aa3b2" stroke-width="6" stroke-linecap="round"/><path d="M698 436 H932" stroke="#c3c7cf" stroke-width="3.5" stroke-linecap="round"/>
      ${[[740, "#ef6fa8"], [774, "#3a7bd5"], [858, "#ffd23f"], [898, "#3fbf74"]].map(([x, c]) => `<rect x="${x - 4}" y="410" width="8" height="18" rx="3" fill="${c}"/>`).join("")}`;
    return s;
  };

  A.ORTE.clothes = {
    dress: [100, 172, 0.8, [44, -50]],
    sweater: [190, 162, 0.76, [48, -36]],
    pants: [278, 186, 1.0, [32, -56]],
    tshirt: [362, 162, 0.8, [46, -36]],
    coat: [500, 206, 0.8, [42, -78]],
    scarf: [580, 196, 1.0, [30, -52]],
    cloud: [728, 150, 1.0, [56, -40]],
    rain: [728, 262, 0.95, [46, -52]],
    rainbow: [888, 286, 1.1, [56, -38]],
    sneakers: [318, 309, 1.05, [46, -40]],
    boots: [530, 494, 0.85, [56, -46]],
    socks: [758, 470, 0.85, [48, -46]],
    gloves: [878, 464, 0.88, [44, -42]],
  };

  Object.assign(A.STICKER, {
    coat: [0.42, 14], tshirt: [0.52, 0], sweater: [0.48, 0], pants: [0.44, 0], dress: [0.44, -4], sneakers: [0.52, 0],
    socks: [0.5, 0], gloves: [0.52, -4], cloud: [0.46, 0], rain: [0.46, 0], rainbow: [0.48, 2],
  });
  A.AUFNAEHER_BILD.clothes = "rainbow";
  A.AUFNAEHER_FARBE.clothes = "#5aaee8";

  // =========================================================================
  // Kleider für Rocco: passen über A.rocco("steh" | "jubel", …)
  // =========================================================================
  const roccoShirt = () => `${[-1, 1].map((s) => `<path d="M${-13 * s} -69 L${-25 * s} -65 L${-35 * s} -50 L${-26 * s} -44 L${-20 * s} -52 Z" fill="${SHIRT}" stroke="${SHIRT}" stroke-width="3" stroke-linejoin="round"/>`).join("")}
    <path d="M-14 -69 Q0 -62 14 -69 L22 -64 Q30 -46 27 -22 Q0 -16 -27 -22 Q-30 -46 -22 -64 Z" fill="${SHIRT}"/>
    <path d="M-14 -69 Q0 -61 14 -69" stroke="${SHIRT_D}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${sonnchen(0, -40, 5)}`;
  // Ärmel als dicker Strich von der Schulter bis zum Handgelenk, mit Pfote.
  // «steh»: die Arme hängen; «jubel»: die Arme gehen nach aussen hoch (sie
  // decken Roccos eigene Arme neben dem Kopf zu).
  const ARME = {
    steh: [[-22, -62, -29, -39], [22, -62, 29, -39]],
    jubel: [[-27, -63, -43, -95], [27, -63, 43, -95]],
  };
  const roccoMantel = (pose = "steh") => {
    const aermel = (ARME[pose] || ARME.steh).map(([x1, y1, x2, y2]) => {
      const l = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / l, uy = (y2 - y1) / l;
      const px = f(x2 + ux * 6), py = f(y2 + uy * 6);
      return `<ellipse cx="${px}" cy="${py}" rx="6.5" ry="7" fill="${FARBE.GRAU_D}"/>
        <path d="M${x1} ${y1} L${x2} ${y2}" stroke="${GELB_D}" stroke-width="15" stroke-linecap="round"/>
        <path d="M${f(x2 - uy * 7 - ux * 3)} ${f(y2 + ux * 7 - uy * 3)} L${f(x2 + uy * 7 - ux * 3)} ${f(y2 - ux * 7 - uy * 3)}" stroke="${GELB_DD}" stroke-width="3.4" stroke-linecap="round"/>`;
    }).join("");
    return `<path d="M-15 -70 Q0 -62 15 -70 L26 -64 Q33 -40 32 -14 Q0 -8 -32 -14 Q-33 -40 -26 -64 Z" fill="${GELB}"/>
      <path d="M-22 -70 Q0 -57 22 -70 L19 -62 Q0 -51 -19 -62 Z" fill="${GELB_DD}"/>
      <path d="M0 -60 V-11" stroke="${GELB_DD}" stroke-width="2"/>
      ${[-52, -40, -28].map((y) => `<rect x="-4.5" y="${y}" width="9" height="3.4" rx="1.7" fill="#8a5a35"/>`).join("")}
      <path d="M-21 -33 H-11 M11 -33 H21" stroke="${GELB_DD}" stroke-width="3.4" stroke-linecap="round"/>
      ${aermel}`;
  };
  const K = A.ROCCO_KLEIDER || {};
  const stiefel = () => (K.boots ? K.boots() : "");

  // =========================================================================
  // Die Geschichte «Rain, rain!» (vier Bilder, je 472 × 204)
  // =========================================================================
  const wiese = (himmel) => `<rect width="472" height="204" fill="${himmel}"/><path d="M0 150 Q120 130 240 146 T472 140 L472 204 L0 204 Z" fill="#94cd60"/>`;
  const regenStriche = (x1, x2, y1, y2, dichte = 30) => {
    let r = "";
    for (let y = y1, z = 0; y < y2; y += 26, z += 1) for (let x = x1 + (z % 2) * (dichte / 2); x < x2; x += dichte) r += `<path d="M${f(x)} ${y} l-3 10" stroke="#8fbde8" stroke-width="2.6" stroke-linecap="round"/>`;
    return r;
  };
  const pfuetze = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#5bb8e6"/><ellipse cx="${x - rx * 0.2}" cy="${y - ry * 0.2}" rx="${rx * 0.55}" ry="${ry * 0.4}" fill="#8fd3f4"/>`;
  const ausruf = (x, y, r = 18) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ffffff" stroke="#c3c7cf" stroke-width="2"/><rect x="-3.5" y="${f(-r * 0.6)}" width="7" height="${f(r * 0.75)}" rx="3.5" fill="#e8543f"/><circle cx="0" cy="${f(r * 0.45)}" r="3.6" fill="#e8543f"/></g>`;
  const rocco = (x, y, s, pose, laune, extra = "") => `<g transform="translate(${x} ${y}) scale(${s})">${A.rocco(pose, laune)}${extra}</g>`;
  A.GESCHICHTEN_BILDER.rain = [
    () => `${wiese("#cdeefb")}${at(404, 50, 0.55, A.DING.sun())}${wolke(120, 40, 0.5)}
      <g transform="translate(76 160) scale(0.7)">${A.DING.tree()}</g>
      ${[[300, 176], [350, 186], [168, 184]].map(([x, y]) => at(x, y, 0.42, A.DING.flower())).join("")}
      ${tb('data-wort="raccoon"', rocco(240, 196, 0.95, "steh", "freude"))}
      ${tb('data-wort="tshirt"', at(240, 196, 0.95, roccoShirt()))}`,
    () => `${wiese("#c9d3de")}${at(292, 40, 0.42, A.DING.sun())}
      ${pfuetze(196, 186, 54, 8)}
      ${tb('data-wort="rain"', at(196, 140, 0.8, A.DING.rain()))}
      ${tb('data-wort="cloud"', at(196, 64, 1.2, A.DING.cloud()))}
      ${rocco(380, 196, 0.92, "steh", "traurig", roccoShirt())}
      ${ausruf(330, 70)}`,
    () => `${wiese("#c9d3de")}${regenStriche(10, 470, 8, 150)}
      ${at(70, 34, 0.7, A.DING.cloud())}${at(400, 30, 0.6, A.DING.cloud())}
      ${pfuetze(330, 184, 46, 7)}
      ${tb('data-wort="raccoon"', rocco(220, 194, 0.95, "steh", "froh"))}
      ${tb('data-wort="coat"', at(220, 194, 0.95, roccoMantel("steh")))}
      ${tb('data-wort="boots"', at(220, 194, 0.95, stiefel()))}`,
    () => `${wiese("#cdeefb")}
      ${tb('data-wort="rainbow"', at(334, 128, 1.65, regenbogen(60, 8.6, 24) + woelkchen(-40, 26, 0.9) + woelkchen(40, 26, 0.9)))}
      ${at(60, 34, 0.45, A.DING.cloud())}${at(440, 34, 0.42, A.DING.sun())}
      ${pfuetze(140, 188, 64, 9)}
      ${[-1, 1].map((s) => `<path d="M${140 + 40 * s} 184 q${10 * s} -14 ${22 * s} -10 M${140 + 30 * s} 180 q${6 * s} -20 ${14 * s} -24" stroke="#5bb8e6" stroke-width="3.4" fill="none" stroke-linecap="round"/>`).join("")}
      ${[[86, 160], [196, 156], [102, 140], [180, 136]].map(([x, y]) => tropfen(x, y, 4, "#5bb8e6")).join("")}
      ${rocco(140, 178, 0.92, "jubel", "freude", roccoMantel("jubel") + stiefel())}
      ${herz(52, 84, 0.8)}${herz(224, 56, 0.6)}`,
  ];
  A.TITELBILD.rain = 3;

  // =========================================================================
  // «Where is the cat?»: die Katze in, auf, unter, hinter oder neben einem
  // Ding. Ein Bild 300 × 220, der Boden bei y = 200.
  // =========================================================================
  const KORB = "#d9a25c", KORB_D = "#b9803f", KORB_H = "#ecc488", KORB_I = "#7a4f2c";
  const korbWeben = () => {
    let w = "";
    [-12, 2, 16].forEach((y, r) => {
      const hb = 54 - ((y + 22) * 12) / 56 - 6;
      for (let x = -hb + (r % 2) * 7; x < hb - 6; x += 14) w += `<rect x="${f(x)}" y="${y - 4}" width="11" height="8" rx="4" fill="${KORB_H}"/>`;
    });
    return w;
  };
  const korb = (teil = "ganz", deckel = false) => {
    const hinten = `<path d="M-58 -24 A58 12 0 0 1 58 -24" stroke="${KORB_D}" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="-24" rx="53" ry="8" fill="${KORB_I}"/>`;
    const vorne = `<path d="M-56 -24 Q-55 12 -45 30 Q-42 36 -34 36 H34 Q42 36 45 30 Q55 12 56 -24 A56 10 0 0 1 -56 -24 Z" fill="${KORB}"/>${korbWeben()}
      <path d="M-58 -24 A58 12 0 0 0 58 -24" stroke="${KORB_D}" stroke-width="9" fill="none" stroke-linecap="round"/>
      ${[-44, -26, -8, 10, 28, 46].map((x) => `<path d="M${x} ${f(-24 + 12 * Math.sqrt(1 - (x / 58) ** 2) - 3)} l6 5" stroke="${KORB_H}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}
      ${[-1, 1].map((s) => `<path d="M${58 * s} -26 q${12 * s} 2 ${10 * s} 12 q${-2 * s} 6 ${-10 * s} 4" stroke="${KORB_D}" stroke-width="6" fill="none" stroke-linecap="round"/>`).join("")}`;
    const zu = `<ellipse cx="0" cy="-27" rx="61" ry="13" fill="${KORB_D}"/><ellipse cx="0" cy="-30" rx="55" ry="10" fill="${KORB}"/>
      <path d="M-40 -30 Q0 -40 40 -30" stroke="${KORB_H}" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="-37" rx="9" ry="5" fill="${KORB_D}"/>`;
    if (teil === "hinten") return hinten;
    if (teil === "vorne") return vorne;
    return `${hinten}${vorne}${deckel ? zu : ""}`;
  };
  A.DING.basket = () => korb();
  A.STICKER.basket = [0.48, -4];

  const KS = 0.8; // Massstab der Katze
  const katze = (x, y, w = 0, s = KS) => at(x, y, s, A.DING.cat(), w);
  // Katze liegt mit dem Bauch auf der Höhe yB
  const katzeLiegt = (x, yB, s = KS) => katze(x, f(yB - 22 * s), 0, s);
  // Nur der Kopf der Katze (ohne Leib und Schwanz), (x, y) = Mitte des Kopfs
  const katzenKopf = () => A.DING.cat().replace(/<path d="M34 6[^>]*\/>/, "").replace(/<ellipse cx="6" cy="0"[^>]*\/>/, "").replace(/<path d="M0 -19[^>]*\/>/, "");
  const kopf = (x, y, s = KS) => at(f(x + 26 * s), f(y + 4 * s), s, katzenKopf());
  // Zwei Pfoten auf einer Kante (die Katze schaut von hinten darüber)
  const pfoten = (x1, x2, y) => [x1, x2].map((x) => `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="4.6" fill="#8d8f9c"/><path d="M${x - 2} ${y + 1} v3 M${x + 2} ${y + 1} v3" stroke="#6f7180" stroke-width="1.3" stroke-linecap="round"/>`).join("");
  const schwanz = (d) => `<path d="${d}" stroke="#7b7d8a" stroke-width="7.4" fill="none" stroke-linecap="round"/>`;
  const schatten = (x, b) => `<ellipse cx="${x}" cy="201" rx="${b}" ry="5" fill="#000000" opacity="0.08"/>`;
  const raum = () => `<rect width="300" height="220" fill="#fdeedd"/>${[[40, 40], [130, 70], [230, 30], [270, 110], [80, 120], [190, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#f7dcc0"/>`).join("")}
    <rect y="164" width="300" height="56" fill="#e2b884"/><path d="M0 190 H300 M0 210 H300" stroke="#d3a46d" stroke-width="1.6"/><rect y="160" width="300" height="6" fill="#ffffff"/>`;
  const kloetze = (x, y) => [["#e8543f", "#3a7bd5"], ["#ffd23f", "#3fbf74"]].map(([a, b], i) => `<g transform="translate(${x[i]} 0)">
    <rect x="-13" y="${y - 26}" width="26" height="26" rx="4" fill="${a}"/><rect x="-13" y="${y - 52}" width="26" height="26" rx="4" fill="${b}"/>
    <circle cx="0" cy="${y - 13}" r="5" fill="#ffffff" opacity="0.6"/><rect x="-5" y="${y - 44}" width="10" height="10" rx="2" fill="#ffffff" opacity="0.6"/></g>`).join("");

  // Die Dinge, mit Platz für die Katze
  const BOX = 1.15, BETT = 0.85, HOCH = 52, TISCH = 1.25, STUHL = 1.85;
  const kiste = (x, yB, art = "offen") => {
    const k = A.DING.box();
    if (art === "zu") return at(x, f(yB - 30 * BOX), BOX, k.replace(/<path d="M-?48 -26 L-?60 -44[^>]*\/>/g, "") + `<path d="M-52 -34 H52 L48 -24 H-48 Z" fill="#c08a55"/><rect x="-9" y="-34" width="18" height="10" fill="#e9d2a8"/>`);
    if (art === "vorne") return at(x, f(yB - 30 * BOX), BOX, (k.match(/<path d="M-48 -26 L48 -26[^>]*\/>/) || [""])[0] + (k.match(/<path d="M-30 0 H30"[^>]*\/>/) || [""])[0]);
    return at(x, f(yB - 30 * BOX), BOX, k);
  };
  const korbAn = (x, yB, teil, deckel) => at(x, f(yB - 36 * BOX), BOX, korb(teil, deckel));
  // Das Bett auf hohen Beinen (damit die Katze darunter passt)
  const bett = (x, yB) => at(x, f(yB - (40 + HOCH) * BETT), BETT, `${[-108, 98].map((bx) => `<rect x="${bx}" y="38" width="10" height="${HOCH + 2}" fill="#8a5a35"/>`).join("")}${A.DING.bed()}`);
  // Der Tisch mit einem karierten Tischtuch (es reicht nicht bis zum Boden)
  const tischTuch = `<path d="M-84 -41 H84 V-12 ${Array(8).fill("q-10.5 7 -21 0").join(" ")} Z" fill="#ffffff"/>
    ${[-70, -42, -14, 14, 42, 70].map((x) => `<rect x="${x - 7}" y="-41" width="14" height="${[-70, 70].includes(x) ? 32 : 33}" fill="#e8543f" opacity="0.5"/>`).join("")}
    ${[-34, -22].map((y) => `<rect x="-84" y="${y}" width="168" height="7" fill="#e8543f" opacity="0.5"/>`).join("")}
    <rect x="-86" y="-44" width="172" height="6" rx="3" fill="#f6c9c0"/>`;
  const tisch = (x, yB) => at(x, f(yB - 38 * TISCH), TISCH, `${A.DING.table()}${tischTuch}`);
  // Eine Wolldecke, über den Sitz des Stuhls geworfen (nur bei «behind»)
  const stuhlDecke = `<path d="M-29 -10 H33 Q38 8 36 26 L33 38 Q22 31 12 35 Q2 30 -8 35 Q-18 30 -29 37 Q-33 14 -29 -10 Z" fill="#3fbf74"/>
    ${[4, 18].map((y) => `<path d="M-31 ${y} H37" stroke="#2f9d5c" stroke-width="5"/><path d="M-31 ${y + 5} H37" stroke="#ffd23f" stroke-width="1.6"/>`).join("")}
    ${[-14, 12].map((x) => `<path d="M${x} -9 V33" stroke="#2f9d5c" stroke-width="5" opacity="0.7"/>`).join("")}
    <path d="M-30 -10 Q2 -15 34 -10 L33 -4 Q2 -9 -30 -4 Z" fill="#2f9d5c"/>`;
  const stuhl = (x, yB, decke = false) => at(x, f(yB - 40 * STUHL), STUHL, `${A.DING.chair()}${decke ? stuhlDecke : ""}`);

  // Höhen (y im Bild) der Oberkanten
  const yKisteRand = f(200 - (30 + 26) * BOX), yKisteZu = f(200 - (30 + 34) * BOX), yKisteKlappe = f(200 - (30 + 44) * BOX);
  const yKorbRand = f(200 - (36 + 24) * BOX), yKorbHinten = f(200 - (36 + 40) * BOX), yKorbZu = f(200 - (36 + 36) * BOX);
  const yBettDecke = f(200 - (40 + HOCH + 24) * BETT);
  const yTuch = f(200 - (38 + 44) * TISCH), ySitz = f(200 - 44 * STUHL), yDecke = f(200 - 51 * STUHL);

  const BILDER = {
    box: {
      in: () => `${schatten(150, 66)}${kiste(150, 200)}${katze(162, yKisteRand - 7, 26)}${kiste(150, 200, "vorne")}`,
      on: () => `${schatten(150, 66)}${kiste(150, 200, "zu")}${katzeLiegt(150, yKisteZu)}`,
      under: () => `${schatten(150, 80)}${kloetze([94, 206], 200)}${kiste(150, 148)}${katzeLiegt(152, 200)}`,
      behind: () => `${schatten(150, 66)}${schwanz("M200 176 Q236 180 240 154 Q242 138 232 134")}${kopf(110, yKisteKlappe - 9)}${kiste(150, 200)}${pfoten(99, 122, yKisteKlappe + 1)}`,
      next: () => `${schatten(104, 66)}${kiste(104, 200)}${schatten(236, 34)}${katzeLiegt(236, 200)}`,
    },
    basket: {
      in: () => `${schatten(150, 66)}${korbAn(150, 200, "hinten")}${katze(164, yKorbRand - 3, 24)}${korbAn(150, 200, "vorne")}`,
      on: () => `${schatten(150, 66)}${korbAn(150, 200, "ganz", true)}${katzeLiegt(150, yKorbZu + 4)}`,
      under: () => `${schatten(150, 80)}${kloetze([94, 206], 200)}${korbAn(150, 148, "ganz")}${katzeLiegt(152, 200)}`,
      behind: () => `${schatten(150, 66)}${schwanz("M204 172 Q240 176 244 150 Q246 134 236 130")}${kopf(108, yKorbHinten - 8)}${korbAn(150, 200, "ganz")}${pfoten(97, 120, yKorbHinten + 4)}`,
      next: () => `${schatten(104, 66)}${korbAn(104, 200, "ganz")}${schatten(236, 34)}${katzeLiegt(236, 200)}`,
    },
    bed: {
      in: () => `${schatten(150, 104)}${bett(150, 200)}${katze(116, yBettDecke - 4, 0)}${at(150, f(200 - (40 + HOCH) * BETT), BETT, `<path d="M-58 16 V-14 Q-40 -44 -6 -38 Q20 -34 30 -22 H104 V6 Q104 16 94 16 Z" fill="#3a7bd5"/>${[-30, 0, 30, 60, 86].map((dx, i) => `<circle cx="${dx}" cy="${i < 2 ? -18 : -6}" r="5" fill="#ffd166" opacity="0.9"/>`).join("")}`)}`,
      on: () => `${schatten(150, 104)}${bett(150, 200)}${katzeLiegt(176, yBettDecke)}`,
      under: () => `${schatten(150, 104)}${bett(150, 200)}${katzeLiegt(150, 200)}`,
      behind: () => `${schatten(150, 104)}${schwanz("M236 132 Q268 134 272 108 Q274 92 264 88")}${kopf(140, yBettDecke - 9)}${bett(150, 200)}${pfoten(129, 152, yBettDecke + 1)}`,
      next: () => `${schatten(112, 100)}${bett(112, 200)}${schatten(256, 34)}${katzeLiegt(256, 200)}`,
    },
    table: {
      in: () => BILDER.table.on(),
      on: () => `${schatten(150, 96)}${tisch(150, 200)}${katzeLiegt(150, yTuch + 2)}`,
      under: () => `${schatten(150, 96)}${tisch(150, 200)}${katzeLiegt(150, 200)}`,
      behind: () => `${schatten(150, 96)}${schwanz("M244 126 Q272 128 274 104 Q275 90 266 86")}${kopf(116, yTuch - 8)}${tisch(150, 200)}${pfoten(105, 128, yTuch + 2)}`,
      next: () => `${schatten(110, 96)}${tisch(110, 200)}${schatten(250, 34)}${katzeLiegt(250, 200)}`,
    },
    chair: {
      in: () => BILDER.chair.on(),
      on: () => `${schatten(150, 54)}${stuhl(140, 200)}${katzeLiegt(156, ySitz)}`,
      under: () => `${schatten(150, 54)}${katzeLiegt(152, 200)}${stuhl(140, 200)}`,
      behind: () => `${schatten(150, 54)}${schwanz("M190 150 Q222 152 226 126 Q228 110 218 106")}${kopf(156, yDecke - 8)}${stuhl(140, 200, true)}${pfoten(145, 168, yDecke + 3)}`,
      next: () => `${schatten(100, 54)}${stuhl(96, 200)}${schatten(226, 34)}${katzeLiegt(226, 200)}`,
    },
  };
  A.WO_KATZE = (wo, ding) => {
    const d = BILDER[ding] || BILDER.box;
    return `${raum()}${(d[wo] || d.next)()}`;
  };
})();

// Englischecke, Welt holidays (für englisch-art-2.js)
// Holidays in America: eine Strasse am Abend mit drei Häusern – links für
// Halloween (Herbstlaub, Mond mit Fledermaus), in der Mitte für Thanksgiving,
// Ostern und den 4. Juli (Fähnchen, Feuerwerk), rechts für Weihnachten (Schnee).
// Die Geschichte «Trick or treat!»: Rocco, ein kleines Gespenst – und das ist
// Cousine Ruby (A.ruby aus englisch-art-3.js).
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { tb, bildHintergrund, menschOder, wolke, FARBE } = A.hilfen;
  const { DUNKEL, GRAU_D } = FARBE;
  const f = (n) => Number(n.toFixed(1));
  const at = (x, y, s, inhalt) => `<g transform="translate(${x} ${y}) scale(${s})">${inhalt}</g>`;
  const ORANGE = "#f2861f", ORANGE_D = "#e2701a", ORANGE_H = "#f99a32", GLUT = "#ffd23f";
  const SCHNEE = "#f3f7fc", SCHNEE_D = "#dbe6f3", SCHNEE_RAND = "#b9cbe0";
  const LILA = "#5b4a8b", LILA_H = "#8a78bd";
  const herz = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/>`;

  // Ein eingewickeltes Bonbon (um 0,0, etwa 94 × 34)
  const bonbon = (x, y, s, farbe, streifen, papier) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-20 0 L-42 -15 Q-47 0 -42 15 Z M20 0 L42 -15 Q47 0 42 15 Z" fill="${papier}"/>
    <path d="M-38 -10 L-30 0 L-38 10 M38 -10 L30 0 L38 10" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round"/>
    <ellipse rx="24" ry="17" fill="${farbe}"/>
    <path d="M-13 -12 L-5 12 M3 -14 L11 12" stroke="${streifen}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="-10" cy="-8" rx="6" ry="3.4" fill="#ffffff" opacity="0.5"/></g>`;
  // Ein Feuerwerk-Stern: n Strahlen mit Punkten an den Enden
  const funken = (x, y, r, farbe, n, punkt, dreh = 0) => Array.from({ length: n }, (_, k) => {
    const a = (((k / n) * 360 + dreh) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return `<path d="M${f(x + c * r * 0.32)} ${f(y + s * r * 0.32)} L${f(x + c * r * 0.8)} ${f(y + s * r * 0.8)}" stroke="${farbe}" stroke-width="${r > 30 ? 5 : 4}" stroke-linecap="round"/><circle cx="${f(x + c * r)}" cy="${f(y + s * r)}" r="${r > 30 ? 4.2 : 3.2}" fill="${punkt}"/>`;
  }).join("") + `<circle cx="${x}" cy="${y}" r="${f(r * 0.15)}" fill="${punkt}"/>`;
  // Ein fünfzackiger Stern (für die Baumspitze)
  const zacken = (x, y, r, farbe, rand) => `<polygon points="${Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${f(x + rr * Math.cos(a))},${f(y + rr * Math.sin(a))}`; }).join(" ")}" fill="${farbe}" stroke="${rand}" stroke-width="2" stroke-linejoin="round"/>`;
  // Das Osterei: oben spitzer (Halbachse 48), unten runder (38)
  const eiBreite = (y) => 34 * Math.sqrt(Math.max(0, 1 - (y / (y < 0 ? 48 : 38)) ** 2));
  const eiBand = (y1, y2, farbe) => {
    const ys = [0, 1, 2, 3].map((k) => y1 + ((y2 - y1) * k) / 3);
    return `<polygon points="${[...ys.map((y) => `${f(eiBreite(y))},${f(y)}`), ...ys.reverse().map((y) => `${f(-eiBreite(y))},${f(y)}`)].join(" ")}" fill="${farbe}"/>`;
  };
  const eiZacken = (y, h, farbe) => {
    const w = eiBreite(y) - 4;
    return `<polyline points="${Array.from({ length: 9 }, (_, k) => `${f(-w + (w * k) / 4)},${f(y + (k % 2 ? h : -h))}`).join(" ")}" stroke="${farbe}" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  };
  const FEDERN = ["#a84d1c", "#e8a33a", "#c8632a", "#f5c242", "#c8632a", "#e8a33a", "#a84d1c"];
  const FEDER_SPITZE = ["#c8632a", "#f5c242", "#e8a33a", "#fbe08a", "#e8a33a", "#f5c242", "#c8632a"];
  const STANGE = "M21 50 V-30 A21 21 0 0 0 -21 -30 V-18";

  Object.assign(A.DING, {
    pumpkin: () => `<path d="M2 -34 Q0 -50 10 -58" stroke="#5d7f2a" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M8 -46 Q22 -60 34 -48 Q22 -40 8 -46 Z" fill="#7cc34a"/>
      <ellipse cx="-30" cy="2" rx="27" ry="37" fill="${ORANGE_D}"/><ellipse cx="30" cy="2" rx="27" ry="37" fill="${ORANGE_D}"/>
      <ellipse cx="-14" cy="0" rx="26" ry="40" fill="${ORANGE}"/><ellipse cx="14" cy="0" rx="26" ry="40" fill="${ORANGE}"/>
      <ellipse cx="0" cy="-1" rx="17" ry="41" fill="${ORANGE_H}"/>
      <path d="M-30 -8 L-20 -24 L-10 -8 Z M10 -8 L20 -24 L30 -8 Z M-5 5 L0 -2 L5 5 Z" fill="${GLUT}" stroke="${GLUT}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-32 12 Q0 50 32 12 Q0 26 -32 12 Z" fill="${GLUT}" stroke="${GLUT}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="-13" y="17" width="9" height="8" rx="1.5" fill="${ORANGE_H}"/><rect x="5" y="17" width="9" height="8" rx="1.5" fill="${ORANGE_H}"/>`,
    ghost: () => `<path d="M-30 -2 Q-52 -6 -55 -28 Q-40 -31 -30 -18 Z M30 -2 Q52 -6 55 -28 Q40 -31 30 -18 Z" fill="#ffffff" stroke="#d3dcea" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-36 38 V-12 Q-36 -52 0 -52 Q36 -52 36 -12 V38 q-9 -12 -18 0 t-18 0 t-18 0 t-18 0 Z" fill="#ffffff" stroke="#d3dcea" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M24 -36 Q32 -26 31 -10 V32 Q26 29 22 34 Q26 10 24 -36 Z" fill="#edf2f9"/>
      <ellipse cx="-12" cy="-16" rx="6" ry="8" fill="${DUNKEL}"/><ellipse cx="12" cy="-16" rx="6" ry="8" fill="${DUNKEL}"/>
      <circle cx="-10" cy="-19" r="2.2" fill="#ffffff"/><circle cx="14" cy="-19" r="2.2" fill="#ffffff"/>
      <path d="M-9 0 Q0 13 9 0 Z" fill="#7a2f3f"/>
      <circle cx="-23" cy="-3" r="5" fill="#ef6fa8" opacity="0.45"/><circle cx="23" cy="-3" r="5" fill="#ef6fa8" opacity="0.45"/>`,
    bat: () => `${[1, -1].map((s) => `<g transform="scale(${s} 1)"><path d="M10 -4 Q30 -32 62 -22 Q55 -12 56 0 Q47 -8 40 3 Q33 -6 26 9 Q20 0 12 10 Z" fill="${LILA}"/>
      <path d="M17 0 Q30 -16 52 -18 M23 5 Q34 -6 45 -10" stroke="${LILA_H}" stroke-width="2" fill="none" stroke-linecap="round"/></g>`).join("")}
      <path d="M-15 -22 L-13 -41 L-3 -28 Z M15 -22 L13 -41 L3 -28 Z" fill="${LILA}"/><path d="M-12 -26 L-11.5 -35 L-6 -28 Z M12 -26 L11.5 -35 L6 -28 Z" fill="#ef9ac0"/>
      <ellipse cx="0" cy="12" rx="15" ry="15" fill="${LILA}"/><ellipse cx="0" cy="14" rx="9" ry="10" fill="${LILA_H}"/>
      <circle cx="0" cy="-12" r="17" fill="${LILA}"/>
      <circle cx="-7" cy="-14" r="5.6" fill="#ffffff"/><circle cx="7" cy="-14" r="5.6" fill="#ffffff"/><circle cx="-6" cy="-13" r="3" fill="${DUNKEL}"/><circle cx="8" cy="-13" r="3" fill="${DUNKEL}"/>
      <path d="M-5 -3 Q0 2 5 -3" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="-12" cy="-5" r="3" fill="#ef6fa8" opacity="0.7"/><circle cx="12" cy="-5" r="3" fill="#ef6fa8" opacity="0.7"/>
      <path d="M-5 26 l-2 5 M5 26 l2 5" stroke="${LILA}" stroke-width="3" stroke-linecap="round"/>`,
    candy: () => bonbon(-27, 10, 0.8, "#b06ad8", "#d8b0f4", "#ffd23f") + bonbon(27, 12, 0.8, "#3fbf74", "#a8ebc2", "#ef6fa8") + bonbon(0, -6, 1, ORANGE, "#ffd166", "#4fc3f7"),
    turkey: () => `${[-70, -46, -23, 0, 23, 46, 70].map((a, i) => `<g transform="rotate(${a} 0 6)"><ellipse cx="0" cy="-30" rx="14" ry="30" fill="${FEDERN[i]}"/><ellipse cx="0" cy="-44" rx="8" ry="13" fill="${FEDER_SPITZE[i]}"/></g>`).join("")}
      <path d="M-12 44 V52 M-19 53 H-5 M12 44 V52 M5 53 H19" stroke="#f5a623" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="0" cy="18" rx="30" ry="30" fill="#8a5a35"/><ellipse cx="0" cy="25" rx="19" ry="19" fill="#a0703f"/>
      <ellipse cx="-27" cy="22" rx="10" ry="18" transform="rotate(14 -27 22)" fill="#6d4628"/><ellipse cx="27" cy="22" rx="10" ry="18" transform="rotate(-14 27 22)" fill="#6d4628"/>
      <ellipse cx="0" cy="-18" rx="15" ry="17" fill="#9c6a3e"/>
      <circle cx="-6" cy="-22" r="5" fill="#ffffff"/><circle cx="6" cy="-22" r="5" fill="#ffffff"/><circle cx="-5.5" cy="-21.5" r="2.6" fill="${DUNKEL}"/><circle cx="6.5" cy="-21.5" r="2.6" fill="${DUNKEL}"/>
      <path d="M2 -12 Q11 -4 6 10 Q-1 4 -1 -8 Z" fill="#e63946"/>
      <path d="M-6 -15 L6 -15 L0 -6 Z" fill="#f5a623" stroke="#f5a623" stroke-width="2" stroke-linejoin="round"/>`,
    pie: () => `<path d="M-22 -22 q-6 -7 0 -14 t0 -12 M0 -26 q-6 -7 0 -14 t0 -12 M22 -22 q-6 -7 0 -14 t0 -12" stroke="#c9d1de" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M-60 4 L-50 28 Q-48 32 -42 32 H42 Q48 32 50 28 L60 4 Z" fill="#c98b4f"/><path d="M-52 22 H52" stroke="#b07a45" stroke-width="3"/>
      <ellipse cx="0" cy="4" rx="60" ry="20" fill="#e3b07a"/>
      ${Array.from({ length: 22 }, (_, k) => { const a = (k / 22) * 2 * Math.PI; return `<circle cx="${f(54 * Math.cos(a))}" cy="${f(4 + 16 * Math.sin(a))}" r="5.5" fill="#d49a55"/>`; }).join("")}
      <ellipse cx="0" cy="4" rx="46" ry="12.5" fill="#e0782a"/><ellipse cx="-16" cy="2" rx="15" ry="4" fill="#ef9445"/>
      <path d="M-16 4 Q-20 -5 -9 -7 Q-6 -17 4 -13 Q14 -15 14 -5 Q22 -1 16 4 Q0 8 -16 4 Z" fill="#ffffff"/><path d="M-3 -9 q4 -2 7 2" stroke="#e3e8f0" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    christmastree: () => `<rect x="-9" y="36" width="18" height="16" fill="#8a5a35"/>
      <path d="M-19 50 H19 L15 64 H-15 Z" fill="#c8423b"/><rect x="-23" y="46" width="46" height="8" rx="3" fill="#a83631"/>
      ${["M0 -22 L-52 40 H52 Z", "M0 -46 L-40 8 H40 Z", "M0 -66 L-27 -22 H27 Z"].map((d) => `<path d="${d}" fill="#2f9d5c" stroke="#2f9d5c" stroke-width="8" stroke-linejoin="round"/>`).join("")}
      <path d="M-46 40 Q0 48 46 40 L52 44 H-52 Z M-34 8 Q0 15 34 8 L40 12 H-40 Z M-22 -22 Q0 -17 22 -22 L27 -18 H-27 Z" fill="#26844d"/>
      <path d="M-26 -10 Q0 4 24 -14 M-40 28 Q0 42 36 20" stroke="#ffd166" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      ${[[-12, -36, "#e63946"], [11, -44, "#4fc3f7"], [-24, -2, "#ffd23f"], [20, -2, "#ef6fa8"], [3, -24, "#e63946"], [-34, 30, "#4fc3f7"], [-8, 22, "#ef6fa8"], [16, 34, "#ffd23f"], [37, 26, "#e63946"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${c}"/><circle cx="${x - 1.8}" cy="${y - 1.8}" r="1.6" fill="#ffffff" opacity="0.7"/>`).join("")}
      ${zacken(0, -70, 14, "#ffd23f", "#f5b800")}`,
    snowman: () => `<path d="M-16 -10 L-46 -30 M-38 -25 L-42 -36 M-38 -25 L-50 -22 M16 -10 L46 -30 M38 -25 L42 -36 M38 -25 L50 -22" stroke="#8a5a35" stroke-width="4" stroke-linecap="round"/>
      <circle cx="0" cy="26" r="29" fill="#ffffff" stroke="${SCHNEE_RAND}" stroke-width="2.5"/><circle cx="0" cy="-14" r="21" fill="#ffffff" stroke="${SCHNEE_RAND}" stroke-width="2.5"/>
      <circle cx="0" cy="-44" r="16" fill="#ffffff" stroke="${SCHNEE_RAND}" stroke-width="2.5"/>
      <path d="M14 8 Q26 26 12 50 Q24 48 28 30 Q28 14 14 8 Z" fill="#e6eef8"/>
      <rect x="-18" y="-61" width="36" height="5" rx="2.5" fill="${DUNKEL}"/><rect x="-11" y="-82" width="22" height="23" rx="3" fill="${DUNKEL}"/><rect x="-11" y="-66" width="22" height="5" fill="#e8543f"/>
      <circle cx="-6" cy="-48" r="2.6" fill="${DUNKEL}"/><circle cx="6" cy="-48" r="2.6" fill="${DUNKEL}"/><path d="M0 -44 L17 -41 L0 -38 Z" fill="#f57c00"/>
      ${[-8, -4, 0, 4, 8].map((x) => `<circle cx="${x}" cy="${f(-35 + (1 - (x / 8) ** 2) * 2.2)}" r="1.5" fill="${DUNKEL}"/>`).join("")}
      <path d="M-17 -31 Q0 -23 17 -31 L18 -24 Q0 -16 -18 -24 Z" fill="#e8543f"/><path d="M5 -25 L9 -5 L17 -7 L14 -27 Z" fill="#e8543f"/><path d="M9 -11 L16.5 -13" stroke="#ffd166" stroke-width="2.5"/>
      ${[-12, -3, 18, 30].map((y) => `<circle cx="0" cy="${y}" r="2.8" fill="${DUNKEL}"/>`).join("")}`,
    stocking: () => `<g transform="translate(-12 4)"><path d="M-4 -62 Q2 -74 8 -62" stroke="#c98a00" stroke-width="3" fill="none"/>
      <path d="M-22 -46 H16 V4 Q16 12 24 16 L40 23 Q56 31 50 46 Q44 58 26 52 L-4 40 Q-24 31 -22 10 Z" fill="#e63946"/>
      <path d="M-22 12 Q-23 30 -5 39.5 L1 27 Q-10 22 -10 12 Z" fill="#ffffff"/><path d="M38 22 L40 23 Q56 31 50 46 Q44 58 30 53 Q42 40 38 22 Z" fill="#ffffff"/>
      ${[[-10, -28], [6, -18], [-12, -6], [5, 4], [22, 32], [-4, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#ffffff" opacity="0.75"/>`).join("")}
      <rect x="-28" y="-62" width="50" height="20" rx="10" fill="#ffffff"/>
      <ellipse cx="-14" cy="-55" rx="7" ry="3.6" transform="rotate(-20 -14 -55)" fill="#3fa34d"/><ellipse cx="-2" cy="-56" rx="7" ry="3.6" transform="rotate(20 -2 -56)" fill="#3fa34d"/><circle cx="-8" cy="-53" r="3.4" fill="#e63946"/></g>`,
    candycane: () => `<path d="${STANGE}" stroke="${SCHNEE_RAND}" stroke-width="21" fill="none" stroke-linecap="round"/>
      <path d="${STANGE}" stroke="#ffffff" stroke-width="17" fill="none" stroke-linecap="round"/>
      <path d="${STANGE}" stroke="#e63946" stroke-width="17" fill="none" stroke-dasharray="9 9"/>
      <path d="M21 -14 L5 -24 L5 -4 Z M21 -14 L37 -24 L37 -4 Z" fill="#3fa34d" stroke="#3fa34d" stroke-width="2" stroke-linejoin="round"/><circle cx="21" cy="-14" r="4.5" fill="#2f8a3f"/>`,
    reindeer: () => `<g transform="translate(-6 22)">
      <path d="M-30 6 L-52 18 M-22 8 L-40 26" stroke="#8a5a35" stroke-width="9" stroke-linecap="round"/><circle cx="-53" cy="19" r="5" fill="#5b3a29"/><circle cx="-41" cy="27" r="5" fill="#5b3a29"/>
      <path d="M18 4 L28 20 L40 16 M8 8 L16 24 L28 22" stroke="#8a5a35" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="41" cy="16" r="5" fill="#5b3a29"/><circle cx="29" cy="22" r="5" fill="#5b3a29"/>
      <ellipse cx="-46" cy="-14" rx="9" ry="6" transform="rotate(-20 -46 -14)" fill="#f3e3c8"/><ellipse cx="-6" cy="-4" rx="40" ry="20" fill="#a0612f"/><ellipse cx="-4" cy="6" rx="26" ry="9" fill="#d9a46c"/>
      <path d="M12 -14 Q22 -34 30 -44 L46 -34 Q34 -18 30 4 Z" fill="#a0612f"/>
      <path d="M38 -54 Q34 -70 22 -76 M33 -66 Q26 -67 21 -62 M46 -55 Q52 -70 48 -82 M50 -68 Q58 -70 62 -76" stroke="#6d4628" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="29" cy="-52" rx="9" ry="4.5" transform="rotate(-25 29 -52)" fill="#8a5a35"/><ellipse cx="42" cy="-44" rx="15" ry="12" fill="#a0612f"/><ellipse cx="55" cy="-38" rx="10" ry="8" fill="#c98b4f"/>
      <circle cx="63" cy="-40" r="6.5" fill="#e63946"/><circle cx="61" cy="-42" r="2" fill="#ffb3b8"/>
      <circle cx="45" cy="-48" r="3" fill="${DUNKEL}"/><circle cx="46" cy="-49" r="1" fill="#ffffff"/><path d="M50 -33 q4 3 8 0" stroke="#6d4628" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 -30 Q32 -21 43 -28" stroke="#e8543f" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="33" cy="-21" r="5" fill="#ffd23f"/></g>`,
    fireworks: () => funken(-12, -12, 46, "#e63946", 12, "#ffd23f") + funken(36, 30, 24, "#4fc3f7", 9, "#ffffff", 10) + funken(-38, 36, 20, "#ffd23f", 8, "#ef6fa8", 20),
    easteregg: () => `<path d="M-34 0 A34 48 0 0 1 34 0 A34 38 0 0 1 -34 0 Z" fill="#f48fb1"/>
      ${eiBand(-16, -2, "#ffd23f")}${eiZacken(-9, 4, "#4fc3f7")}${eiBand(12, 21, "#ffffff")}
      ${[[-12, -30], [10, -32], [-1, -40], [19, -22], [-21, -22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#ffffff"/>`).join("")}
      ${[[-14, 29], [0, 31], [14, 29]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#4fc3f7"/>`).join("")}
      <ellipse cx="-17" cy="-24" rx="4.5" ry="9" transform="rotate(25 -17 -24)" fill="#ffffff" opacity="0.4"/>`,
  });

  // ===========================================================================
  // Die Strasse am Abend (1000 × 560)
  // ===========================================================================
  const HIMMEL = [[0, "#3f4b94"], [70, "#4c56a0"], [128, "#6162ad"], [180, "#7b6db7"], [224, "#9879be"], [262, "#b886c2"], [298, "#da9aba"], [330, "#f1b5a8"]];
  const himmel = (bis, baender = HIMMEL, breite = 1000) => baender.map(([y, c], i) => `<rect y="${y}" width="${breite}" height="${(baender[i + 1]?.[0] ?? bis) - y}" fill="${c}"/>`).join("");
  const funkeln = (liste) => liste.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1.6 : 2.4}" fill="#fff6d0"/>`).join("");
  const flocken = (liste) => liste.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 2.4 : 3.4}" fill="#ffffff" opacity="0.9"/>`).join("");
  const blatt = (x, y, w, c) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.6" transform="rotate(${w} ${x} ${y})" fill="${c}"/>`;
  const tanne = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-6" width="10" height="12" fill="#6d4628"/>
    <path d="M0 -70 L-26 -30 H-14 L-32 0 H32 L14 -30 H26 Z" fill="#2e6f52"/><path d="M0 -70 L-12 -52 Q0 -48 12 -52 Z M-20 -32 Q0 -26 20 -32 L15 -38 Q0 -34 -15 -38 Z M-28 -4 Q0 4 28 -4 L22 -10 Q0 -4 -22 -10 Z" fill="#ffffff"/></g>`;
  const tulpe = (x, y, c) => `<path d="M${x} ${y} V${y - 20}" stroke="#3fa34d" stroke-width="3"/><ellipse cx="${x + 5}" cy="${y - 7}" rx="6" ry="2.6" transform="rotate(-35 ${x + 5} ${y - 7})" fill="#4caf50"/>
    <path d="M${x - 7} ${y - 30} L${x - 3.5} ${y - 24} L${x} ${y - 31} L${x + 3.5} ${y - 24} L${x + 7} ${y - 30} Q${x + 8} ${y - 18} ${x} ${y - 18} Q${x - 8} ${y - 18} ${x - 7} ${y - 30} Z" fill="${c}"/>`;
  // Ein Fächer aus Fahnenstoff (4. Juli) unter dem Dach, Mitte oben bei (x, y)
  const faecher = (x, y, r) => `<path d="M${x - r} ${y} A${r} ${r} 0 0 0 ${x + r} ${y} Z" fill="#ffffff"/>
    <path d="M${x - r} ${y} A${r} ${r} 0 0 0 ${x + r} ${y} L${x + r * 0.62} ${y} A${r * 0.62} ${r * 0.62} 0 0 1 ${x - r * 0.62} ${y} Z" fill="#e63946"/>
    <path d="M${x - r * 0.62} ${y} A${r * 0.62} ${r * 0.62} 0 0 0 ${x + r * 0.62} ${y} L${x + r * 0.36} ${y} A${r * 0.36} ${r * 0.36} 0 0 1 ${x - r * 0.36} ${y} Z" fill="#ffffff"/>
    <path d="M${x - r * 0.36} ${y} A${r * 0.36} ${r * 0.36} 0 0 0 ${x + r * 0.36} ${y} Z" fill="#2f5fb3"/>
    <rect x="${x - r - 2}" y="${y - 3}" width="${2 * r + 4}" height="5" rx="2" fill="#2f5fb3"/>`;
  const lichter = (x1, x2, y, durch, n) => {
    let s = `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + 2 * durch} ${x2} ${y}" stroke="#2e6f52" stroke-width="2" fill="none"/>`;
    for (let i = 0; i < n; i += 1) {
      const t = (i + 0.5) / n;
      s += `<circle cx="${f(x1 + (x2 - x1) * t)}" cy="${f(y + 4 * durch * t * (1 - t) + 3)}" r="3.6" fill="${["#ffd23f", "#e63946", "#4fc3f7", "#8bd36b", "#ef6fa8"][i % 5]}"/>`;
    }
    return s;
  };

  A.HINTERGRUND.holidays = () => {
    let s = himmel(400);
    s += funkeln([[40, 120], [120, 150], [330, 40], [372, 150], [300, 214], [604, 44], [640, 196], [590, 160], [890, 120], [960, 176], [850, 210], [420, 210], [60, 210], [700, 60], [980, 240], [150, 250], [350, 92]]);
    // Der Mond (mit der Fledermaus davor)
    s += `<circle cx="232" cy="120" r="56" fill="#fff1b8" opacity="0.35"/><circle cx="232" cy="120" r="48" fill="#fff1b8"/>
      <circle cx="210" cy="102" r="8" fill="#f6e39a"/><circle cx="256" cy="140" r="11" fill="#f6e39a"/><circle cx="257" cy="99" r="5" fill="#f6e39a"/>`;
    // Hügel: links und in der Mitte im Abendlicht, rechts verschneit
    s += `<path d="M0 334 Q110 300 230 322 T480 318 T700 326 L700 400 H0 Z" fill="#7a68a8"/>
      <path d="M600 372 Q640 334 720 314 Q800 296 880 318 T1000 312 V400 H600 Z" fill="#d5e0ef"/>`;
    s += tanne(668, 362, 0.9) + tanne(712, 356, 0.7) + tanne(986, 342, 0.8);
    // Der Boden: Herbstlaub – Wiese – Schnee
    s += `<path d="M0 360 Q250 350 500 358 T1000 356 V560 H0 Z" fill="#8fc75c"/>
      <path d="M0 360 Q170 352 330 357 Q300 420 336 470 Q372 520 330 560 H0 Z" fill="#b9b356"/>
      <path d="M1000 354 Q820 350 664 357 Q630 420 668 476 Q700 524 660 560 H1000 Z" fill="${SCHNEE}"/>
      <path d="M680 420 Q760 404 850 420 Q760 432 680 420 Z M760 520 Q860 500 980 518 Q860 532 760 520 Z M900 446 Q950 436 1000 444 V452 Q950 452 900 446 Z" fill="${SCHNEE_D}"/>`;
    s += [[30, 420, 20, "#e8543f"], [190, 404, -30, "#f5a623"], [260, 456, 40, "#c8632a"], [40, 520, -10, "#f5a623"], [150, 548, 30, "#e8543f"], [290, 528, -40, "#f5a623"], [170, 470, 60, "#c8632a"], [300, 400, 10, "#e8543f"], [90, 494, -50, "#c8632a"]].map(([x, y, w, c]) => blatt(x, y, w, c)).join("");

    // Links: das Halloween-Haus
    s += `<rect x="40" y="264" width="150" height="112" fill="#5fa889"/>
      <path d="M26 270 L115 202 L204 270 Z" fill="${LILA}" stroke="${LILA}" stroke-width="8" stroke-linejoin="round"/>
      <circle cx="115" cy="240" r="13" fill="#ffd166"/><path d="M115 227 V253 M102 240 H128" stroke="${LILA}" stroke-width="3"/>
      ${[56, 136].map((x) => `<rect x="${x}" y="284" width="38" height="34" rx="4" fill="#ffd166"/><path d="M${x + 19} 284 V318 M${x} 301 H${x + 38}" stroke="#4d8f73" stroke-width="3"/><rect x="${x - 3}" y="316" width="44" height="6" rx="2" fill="#4d8f73"/>`).join("")}
      <path d="M99 376 V334 Q99 318 115 318 Q131 318 131 334 V376 Z" fill="#7b5ea7"/><circle cx="125" cy="350" r="3" fill="#ffd166"/>
      <rect x="92" y="372" width="46" height="8" rx="2" fill="#8d8478"/>
      ${lichter(30, 200, 272, 6, 9).replace(/#e63946|#4fc3f7|#8bd36b|#ef6fa8/g, (c) => ({ "#e63946": "#f5a623", "#4fc3f7": "#b06ad8", "#8bd36b": "#8bd36b", "#ef6fa8": "#f5a623" })[c])}
      <path d="M115 380 Q100 420 132 470 Q160 520 120 560 L170 560 Q200 520 168 470 Q140 420 131 380 Z" fill="#cfc28e" opacity="0.8"/>`;
    // Ein Herbstbaum (das Gespenst schwebt davor)
    s += `<rect x="322" y="270" width="18" height="98" rx="5" fill="#8a5a35"/><path d="M331 300 L310 282 M331 292 L352 276" stroke="#8a5a35" stroke-width="7" stroke-linecap="round"/>
      <circle cx="331" cy="238" r="40" fill="#f08a24"/><circle cx="300" cy="264" r="26" fill="#e8543f"/><circle cx="362" cy="262" r="24" fill="#f5a623"/><circle cx="331" cy="204" r="25" fill="#f5a623"/><circle cx="356" cy="222" r="18" fill="#e8543f"/>
      ${blatt(300, 344, 30, "#f08a24")}${blatt(370, 356, -20, "#e8543f")}`;
    // Mitte: das Haus für Thanksgiving, Ostern und den 4. Juli
    s += `<rect x="410" y="272" width="180" height="104" fill="#f6e3c4"/>
      <path d="M394 278 L500 208 L606 278 Z" fill="#3a7bd5" stroke="#3a7bd5" stroke-width="8" stroke-linejoin="round"/>
      <rect x="406" y="276" width="188" height="6" rx="2" fill="#2f63bd"/>
      ${faecher(446, 284, 18)}${faecher(554, 284, 18)}
      <circle cx="500" cy="248" r="12" fill="#ffd166"/><path d="M500 236 V260 M488 248 H512" stroke="#2f63bd" stroke-width="3"/>
      ${[424, 536].map((x) => `<rect x="${x}" y="306" width="40" height="34" rx="4" fill="#ffd166"/><path d="M${x + 20} 306 V340 M${x} 323 H${x + 40}" stroke="#ffffff" stroke-width="3"/><rect x="${x - 3}" y="338" width="46" height="6" rx="2" fill="#ffffff"/>`).join("")}
      <rect x="484" y="318" width="32" height="58" rx="3" fill="#c8423b"/><circle cx="510" cy="350" r="2.6" fill="#ffd166"/>
      <circle cx="500" cy="334" r="9" fill="none" stroke="#e8a33a" stroke-width="5"/><circle cx="500" cy="325" r="2.6" fill="#e8543f"/><circle cx="491" cy="336" r="2.6" fill="#c8632a"/><circle cx="509" cy="336" r="2.6" fill="#e8543f"/>
      <rect x="478" y="372" width="44" height="8" rx="2" fill="#c3b49a"/>
      <path d="M592 376 V270" stroke="#c3c7cf" stroke-width="4"/><path d="M594 272 H630 V296 H594 Z" fill="#ffffff"/>
      ${[0, 1, 2].map((k) => `<rect x="594" y="${275 + k * 8}" width="36" height="4" fill="#e63946"/>`).join("")}<rect x="594" y="272" width="16" height="13" fill="#2f5fb3"/>
      <path d="M404 376 L398 330 M404 376 L410 326 M404 376 L392 340" stroke="#d9b35a" stroke-width="4" stroke-linecap="round"/><ellipse cx="404" cy="372" rx="12" ry="6" fill="#c8a24a"/>
      <path d="M500 380 Q520 430 486 470 Q456 510 476 560 L528 560 Q508 510 534 470 Q560 430 516 380 Z" fill="#e8d9b0" opacity="0.8"/>
      ${[[420, 546, "#ef6fa8"], [436, 552, "#ffd23f"], [520, 548, "#b06ad8"], [536, 554, "#ef6fa8"], [552, 546, "#ffd23f"]].map(([x, y, c]) => tulpe(x, y, c)).join("")}`;
    // Der Tisch mit der Wähe
    s += `<rect x="536" y="494" width="110" height="9" rx="4" fill="#a0612f"/><rect x="546" y="503" width="8" height="40" rx="3" fill="#8a5a35"/><rect x="628" y="503" width="8" height="40" rx="3" fill="#8a5a35"/>`;
    // Rechts: das Weihnachtshaus im Schnee
    s += `<rect x="728" y="266" width="168" height="110" fill="#b07a45"/>
      ${[288, 310, 332, 354].map((y) => `<path d="M728 ${y} H896" stroke="#96653a" stroke-width="3"/>`).join("")}
      <rect x="854" y="210" width="20" height="40" fill="#8f2d29"/><rect x="850" y="204" width="28" height="9" rx="4" fill="#ffffff"/>
      <path d="M714 272 L812 202 L910 272 Z" fill="#8f2d29" stroke="#8f2d29" stroke-width="8" stroke-linejoin="round"/>
      <path d="M708 274 L812 198 L916 274 Q904 284 892 276 Q880 288 866 278 Q852 288 838 278 Q824 290 810 279 Q796 290 782 278 Q768 288 754 278 Q740 288 726 278 Q716 284 708 274 Z" fill="#ffffff"/>
      ${lichter(722, 902, 284, 5, 12)}
      <circle cx="812" cy="242" r="12" fill="#ffd166"/><path d="M812 230 V254 M800 242 H824" stroke="#ffffff" stroke-width="3"/>
      <rect x="846" y="304" width="38" height="34" rx="4" fill="#ffd166"/><path d="M865 304 V338 M846 321 H884" stroke="#ffffff" stroke-width="3"/><rect x="843" y="336" width="44" height="6" rx="2" fill="#ffffff"/>
      <rect x="798" y="318" width="32" height="58" rx="3" fill="#2f8a3f"/><circle cx="824" cy="350" r="2.6" fill="#ffd166"/>
      <circle cx="814" cy="334" r="9" fill="none" stroke="#3fa34d" stroke-width="5"/><circle cx="814" cy="343" r="3" fill="#e63946"/>
      <path d="M730 292 Q760 300 790 292" stroke="#2e6f52" stroke-width="4" fill="none"/>
      <rect x="792" y="372" width="44" height="8" rx="2" fill="${SCHNEE_D}"/>
      <path d="M814 380 Q800 430 832 476 Q860 520 840 560 L888 560 Q904 520 878 476 Q850 430 830 380 Z" fill="${SCHNEE_D}" opacity="0.8"/>`;
    s += [[642, 196, 7], [616, 214, 5], [594, 226, 4]].map(([x, y, r]) => `<path d="M${x - r} ${y} L${x + r} ${y} M${x} ${y - r} L${x} ${y + r}" stroke="#fff6d0" stroke-width="2.6" stroke-linecap="round"/>`).join("");
    s += flocken([[640, 120], [690, 250], [760, 120], [940, 300], [980, 200], [880, 170], [660, 300], [740, 220], [960, 380], [700, 520], [890, 540], [620, 230]]);
    return s;
  };

  A.ORTE.holidays = {
    bat: [232, 122, 0.82, [52, -32]],
    fireworks: [500, 128, 1.0, [40, -48]],
    reindeer: [724, 150, 0.92, [52, -52]],
    ghost: [268, 262, 0.9, [40, -46]],
    stocking: [762, 320, 0.66, [26, -56]],
    pumpkin: [92, 440, 0.95, [46, -50]],
    candy: [214, 506, 1.0, [52, -18]],
    turkey: [362, 438, 0.95, [50, -50]],
    easteregg: [476, 496, 0.9, [28, -40]],
    pie: [590, 470, 0.92, [52, -20]],
    snowman: [712, 452, 0.88, [30, -70]],
    candycane: [832, 470, 0.85, [32, -48]],
    christmastree: [940, 418, 0.95, [46, -34]],
  };

  Object.assign(A.STICKER, {
    pumpkin: [0.48, 10], ghost: [0.52, 4], bat: [0.44, 4], candy: [0.5, 0], turkey: [0.46, 3], pie: [0.46, 14],
    christmastree: [0.4, 10], snowman: [0.42, 13], stocking: [0.44, 6], candycane: [0.46, 0], reindeer: [0.46, 0],
    fireworks: [0.46, 0], easteregg: [0.6, 5],
  });
  A.AUFNAEHER_BILD.holidays = "pumpkin";
  A.AUFNAEHER_FARBE.holidays = "#b3332b";

  // ===========================================================================
  // Die Geschichte «Trick or treat!» (vier Bilder, je 472 × 204)
  // ===========================================================================
  const ruby = (...a) => (A.ruby || A.rocco)(...a);
  const BILD_HIMMEL = [[0, "#4c56a0"], [40, "#6162ad"], [76, "#7b6db7"], [104, "#9879be"], [126, "#b886c2"], [144, "#da9aba"]];
  const abend = ({ mond = [410, 42, 22], haus = true } = {}) => `${himmel(204, BILD_HIMMEL, 472)}
    ${funkeln([[40, 20], [120, 46], [200, 18], [300, 36], [350, 70], [250, 64], [70, 84], [440, 96], [160, 90]])}
    ${mond ? `<circle cx="${mond[0]}" cy="${mond[1]}" r="${mond[2] + 6}" fill="#fff1b8" opacity="0.35"/><circle cx="${mond[0]}" cy="${mond[1]}" r="${mond[2]}" fill="#fff1b8"/><circle cx="${mond[0] - 7}" cy="${mond[1] - 6}" r="${f(mond[2] * 0.18)}" fill="#f6e39a"/><circle cx="${mond[0] + 8}" cy="${mond[1] + 7}" r="${f(mond[2] * 0.24)}" fill="#f6e39a"/>` : ""}
    <path d="M0 150 Q90 128 200 142 T472 136 V170 H0 Z" fill="#7a68a8"/>
    ${haus ? `<rect x="14" y="104" width="70" height="52" fill="#5fa889"/><path d="M6 108 L49 76 L92 108 Z" fill="${LILA}" stroke="${LILA}" stroke-width="5" stroke-linejoin="round"/>
      <rect x="24" y="116" width="18" height="16" rx="2" fill="#ffd166"/><rect x="56" y="116" width="18" height="16" rx="2" fill="#ffd166"/><circle cx="49" cy="94" r="6" fill="#ffd166"/>` : ""}
    <path d="M0 156 Q120 146 240 154 T472 150 V204 H0 Z" fill="#b9b356"/>
    ${[[30, 176, 20, "#e8543f"], [120, 190, -30, "#f5a623"], [260, 186, 40, "#c8632a"], [420, 174, -10, "#f5a623"], [360, 196, 30, "#e8543f"], [200, 168, 60, "#f5a623"]].map(([x, y, w, c]) => blatt(x, y, w, c)).join("")}`;
  // Pfoten, die etwas vor dem Bauch halten (in Roccos Massen, Füsse bei 0,0)
  const pfoten = (dx, y) => `<ellipse cx="${-dx}" cy="${y}" rx="7" ry="9" fill="${GRAU_D}"/><ellipse cx="${dx}" cy="${y}" rx="7" ry="9" fill="${GRAU_D}"/>`;
  // Ruby unter einem weissen Tuch: ein kleines Gespenst (Füsse bei 0,0, Arme hoch: «Buh!»)
  const SCHWANZ = "M8 -20 C46 -16 72 -34 70 -66 C69 -84 60 -96 50 -102";
  const tuchGespenst = () => `<path d="${SCHWANZ}" stroke="#c3c7cf" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="${SCHWANZ}" stroke="#4f5560" stroke-width="22" fill="none" stroke-dasharray="11 13" stroke-dashoffset="-14"/><circle cx="50" cy="-102" r="11" fill="${DUNKEL}"/>
    <ellipse cx="-12" cy="-6" rx="11" ry="7" fill="${DUNKEL}"/><ellipse cx="12" cy="-6" rx="11" ry="7" fill="${DUNKEL}"/>
    <path d="M-36 -78 Q-60 -86 -62 -114 Q-62 -130 -50 -128 Q-42 -110 -34 -100 Z M36 -78 Q60 -86 62 -114 Q62 -130 50 -128 Q42 -110 34 -100 Z" fill="#ffffff" stroke="#d3dcea" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-40 -10 V-100 Q-40 -148 0 -148 Q40 -148 40 -100 V-10 q-10 -12 -20 0 t-20 0 t-20 0 t-20 0 Z" fill="#ffffff" stroke="#d3dcea" stroke-width="3" stroke-linejoin="round"/>
    <path d="M26 -132 Q34 -118 33 -100 V-16 Q28 -19 24 -12 Q28 -60 26 -132 Z" fill="#edf2f9"/>
    <ellipse cx="-13" cy="-108" rx="7" ry="9" fill="${DUNKEL}"/><ellipse cx="13" cy="-108" rx="7" ry="9" fill="${DUNKEL}"/>
    <circle cx="-12" cy="-110" r="2.6" fill="#ffffff"/><circle cx="14" cy="-110" r="2.6" fill="#ffffff"/>
    <ellipse cx="0" cy="-84" rx="8" ry="10" fill="#7a2f3f"/>`;
  // Das Tuch, das hinuntergerutscht ist: hinter Ruby und um ihre Füsse
  const tuchHinten = `<path d="M-24 -90 Q0 -102 24 -90 Q42 -52 54 -8 Q30 2 0 0 Q-30 2 -54 -8 Q-42 -52 -24 -90 Z" fill="#ffffff" stroke="#d3dcea" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 -70 Q40 -40 46 -12 M-30 -70 Q-40 -40 -46 -12" stroke="#e3e9f2" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const tuchUnten = `<path d="M-56 0 Q-58 -22 -40 -30 Q-30 -20 -20 -32 Q-8 -22 4 -34 Q16 -22 28 -32 Q40 -22 50 -28 Q60 -14 56 0 Z" fill="#ffffff" stroke="#d3dcea" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="-22" cy="-12" rx="6" ry="4.5" fill="${DUNKEL}"/><ellipse cx="2" cy="-14" rx="6" ry="4.5" fill="${DUNKEL}"/>
    <path d="M-48 -8 Q-30 -4 -14 -8 M14 -10 Q30 -6 46 -12" stroke="#e3e9f2" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  // Ein Korb voller Bonbons (in Roccos Massen vor dem Bauch, Henkel oben)
  const korb = () => `<path d="M-26 -34 Q0 -84 26 -34" stroke="#8a5a35" stroke-width="5" fill="none"/>
    ${bonbon(-13, -41, 0.5, "#b06ad8", "#d8b0f4", "#ffd23f")}${bonbon(14, -42, 0.5, "#3fbf74", "#a8ebc2", "#ef6fa8")}${bonbon(0, -52, 0.54, ORANGE, "#ffd166", "#4fc3f7")}
    ${bonbon(-2, -36, 0.44, "#e63946", "#ff9aa2", "#ffffff")}
    <path d="M-30 -34 H30 L24 -6 Q22 0 16 0 H-16 Q-22 0 -24 -6 Z" fill="#c98b4f"/>
    <path d="M-28 -24 H28 M-26 -14 H26" stroke="#a8743f" stroke-width="3"/><path d="M-12 -34 V0 M0 -34 V0 M12 -34 V0" stroke="#a8743f" stroke-width="2.5"/>
    <rect x="-32" y="-37" width="64" height="7" rx="3.5" fill="#b07a45"/>`;
  const schreck = (x, y) => `<path d="M${x - 44} ${y - 20} l-12 -8 M${x - 48} ${y} l-14 0 M${x - 44} ${y + 20} l-12 8 M${x + 44} ${y - 20} l12 -8 M${x + 48} ${y} l14 0" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`;
  const lachen = (x, y) => `<path d="M${x} ${y} q6 -8 12 0 M${x + 6} ${y - 14} q6 -8 12 0" stroke="#fff6d0" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  A.GESCHICHTEN_BILDER.halloween = [
    () => `${abend()}
      ${tb('data-wort="raccoon"', at(236, 196, 0.95, A.rocco("steh", "freude")))}
      ${tb('data-wort="pumpkin"', at(236, 196, 0.95, at(0, -30, 0.76, A.DING.pumpkin()) + pfoten(41, -30)))}`,
    () => `${abend()}
      ${at(130, 196, 0.92, A.rocco("jubel", "hoch"))}${schreck(130, 102)}
      ${at(214, 182, 0.36, A.DING.pumpkin())}
      ${tb('data-wort="ghost"', at(340, 196, 0.92, tuchGespenst()))}
      <path d="M296 104 l-12 -6 M294 116 l-14 2 M298 128 l-11 8" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`,
    () => `${abend()}
      ${tb('data-wort="raccoon"', at(130, 196, 0.92, A.rocco("jubel", "freude")))}
      ${at(340, 196, 0.92, tuchHinten)}
      ${tb('data-wort="raccoon"', at(340, 196, 0.92, ruby("wink", "freude")))}
      ${at(340, 198, 0.92, tuchUnten)}
      ${lachen(178, 70)}${lachen(380, 66)}${herz(236, 60, 1)}${herz(258, 40, 0.65)}`,
    () => `${abend({ mond: [236, 52, 32], haus: false })}
      ${tb('data-wort="bat"', at(236, 54, 0.56, A.DING.bat()))}
      <rect x="390" y="96" width="70" height="60" fill="#5fa889"/><path d="M382 100 L425 70 L468 100 Z" fill="${LILA}" stroke="${LILA}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M412 156 V128 Q412 118 425 118 Q438 118 438 128 V156 Z" fill="#ffd166"/>
      ${at(126, 196, 0.92, A.rocco("steh", "freude"))}
      ${tb('data-wort="candy"', at(126, 196, 0.92, korb() + pfoten(33, -26)))}
      ${at(330, 196, 0.92, ruby("steh", "freude"))}
      ${tb('data-wort="candy"', at(330, 196, 0.92, korb() + pfoten(33, -26)))}`,
  ];
  A.TITELBILD.halloween = 0;
})();

// Englischecke, Spiele «Make a monster» und «Opposites» (für englisch-art-4.js)
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { wolke, FARBE } = A.hilfen;
  const { DUNKEL } = FARBE;
  const f = (n) => String(Math.round(n * 10) / 10);
  const zahl = (n, min, max) => Math.max(min, Math.min(max, Math.round(Number(n) || 0)));
  const at = (x, y, s, inhalt) => `<g transform="translate(${x} ${y}) scale(${s})">${inhalt}</g>`;
  const herz = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/>`;

  // Farben: "#rgb" / "#rrggbb" → [r, g, b], mischen, Helligkeit (0 schwarz … 1 weiss)
  const WEISS = [255, 255, 255], SCHWARZ = [0, 0, 0];
  const rgbAus = (c) => {
    let h = String(c || "").trim().replace(/^#/, "");
    if (h.length === 3) h = h.replace(/./g, (x) => x + x);
    return /^[0-9a-f]{6}$/i.test(h) ? [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) : null;
  };
  const mische = (rgb, ziel, t) => `#${rgb.map((v, i) => Math.round(v + (ziel[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
  const helligkeit = (rgb) => {
    const [r, g, b] = rgb.map((v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // =========================================================================
  // «Make a monster»: ein rundes, freundliches Monster, Füsse bei (0,0),
  // etwa 300 hoch (Hörner bis y = -302) und 265 breit (Hände bis x = ±133).
  //   farbe   Körperfarbe (jede Hex-Farbe; sehr helle bekommen einen Rand,
  //           sehr dunkle helle Lippen)
  //   augen 0–5 (im Bogen), arme 0–4 (oben/unten, links/rechts), beine 0–4
  //   mund    "lacht" | "froh" | "traurig" | "staunt" | "zunge"
  // =========================================================================
  const KOERPER = "M0 -282 C70 -282 104 -244 104 -164 C104 -84 88 -40 0 -40 C-88 -40 -104 -84 -104 -164 C-104 -244 -70 -282 0 -282 Z";
  const HORN = "M-66 -259 C-78 -272 -80 -292 -72 -302 C-60 -295 -46 -285 -36 -275 Z";
  const AUGE_R = [0, 30, 24, 20, 17, 14.5];
  const BEIN_X = [[], [0], [-44, 44], [-62, 0, 62], [-75, -25, 25, 75]];
  // Ein Arm rechts: Ansatz (im Körper), Bogenpunkt, Hand; links gespiegelt
  const ARM = { oben: [[82, -222], [110, -232], [118, -266]], unten: [[86, -104], [118, -96], [119, -62]] };
  const ARME = [[], [["oben", 1]], [["oben", -1], ["oben", 1]], [["oben", -1], ["unten", -1], ["oben", 1]], [["oben", -1], ["unten", -1], ["oben", 1], ["unten", 1]]];
  A.MONSTER = ({ farbe = "#8bd36b", augen = 2, arme = 2, beine = 2, mund = "lacht" } = {}) => {
    const rgb = rgbAus(farbe) || rgbAus("#8bd36b");
    const L = helligkeit(rgb), hell = L > 0.72, dunkel = L < 0.16;
    const RAND = "#aeb5c1", rand = hell ? ` stroke="${RAND}" stroke-width="3"` : "";
    const haut = mische(rgb, WEISS, 0), glied = mische(rgb, SCHWARZ, hell ? 0.07 : 0.16);
    const bauch = hell ? "#eef0f3" : mische(rgb, WEISS, dunkel ? 0.26 : 0.36);
    const linie = dunkel ? "#ffffff" : DUNKEL, lippe = dunkel ? mische(rgb, WEISS, 0.62) : DUNKEL;
    const nA = zahl(augen, 0, 5), r = AUGE_R[nA], abstand = 2 * r + (nA >= 4 ? 9.5 : 14);
    const arm = ([[ax, ay], [bx, by], [hx, hy]], s) => {
      const d = `M${ax * s} ${ay} Q${bx * s} ${by} ${hx * s} ${hy}`;
      return `${hell ? `<path d="${d}" stroke="${RAND}" stroke-width="26" fill="none" stroke-linecap="round"/>` : ""}<path d="${d}" stroke="${glied}" stroke-width="20" fill="none" stroke-linecap="round"/>
        <circle cx="${hx * s}" cy="${hy}" r="14.5" fill="${glied}"${rand}/>`;
    };
    const bein = (x) => `<rect x="${x - 13}" y="-64" width="26" height="56" rx="11" fill="${glied}"${rand}/><ellipse cx="${x}" cy="-10" rx="22" ry="10" fill="${glied}"${rand}/>
      ${[-10, 0, 10].map((d) => `<circle cx="${x + d}" cy="-4.5" r="3.6" fill="${hell ? "#d3d8e0" : "#fff3d6"}"/>`).join("")}`;
    const auge = (i) => {
      const x = (i - (nA - 1) / 2) * abstand, y = (nA === 1 ? -204 : -214) + 0.0045 * x * x;
      return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#ffffff" stroke="${DUNKEL}" stroke-width="3"/>
        <circle cx="${f(x)}" cy="${f(y + r * 0.12)}" r="${f(r * 0.5)}" fill="${DUNKEL}"/><circle cx="${f(x - r * 0.18)}" cy="${f(y - r * 0.08)}" r="${f(r * 0.17)}" fill="#ffffff"/>`;
    };
    const MUND = {
      lacht: `<path d="M-38 -142 Q0 -136 38 -142 Q34 -96 0 -96 Q-34 -96 -38 -142 Z" fill="#7a2333" stroke="${lippe}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M-19 -104 Q0 -120 19 -104 Q11 -98.5 0 -98.5 Q-11 -98.5 -19 -104 Z" fill="#ef7f9f"/>
        <rect x="-25" y="-140" width="12" height="11" rx="3" fill="#ffffff"/><rect x="13" y="-140" width="12" height="11" rx="3" fill="#ffffff"/>`,
      froh: `<path d="M-32 -134 Q0 -100 32 -134" stroke="${linie}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      traurig: `<path d="M-28 -104 Q0 -132 28 -104" stroke="${linie}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      staunt: `<ellipse cx="0" cy="-120" rx="15" ry="19" fill="#7a2333" stroke="${lippe}" stroke-width="3.5"/><ellipse cx="0" cy="-109" rx="8" ry="5" fill="#ef7f9f"/>`,
      zunge: `<path d="M-14 -119 Q-14 -92 0 -92 Q14 -92 14 -119 Z" fill="#ef7f9f" stroke="${lippe}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M0 -114 V-102" stroke="#d65c80" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M-34 -128 Q0 -108 34 -128" stroke="${linie}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    };
    return `<g>
      <ellipse cx="0" cy="0" rx="104" ry="9" fill="${DUNKEL}" opacity="0.12"/>
      ${[1, -1].map((s) => `<path d="${HORN}" transform="scale(${s} 1)" fill="#fff3d6" stroke="#dcc79a" stroke-width="2.5" stroke-linejoin="round"/>`).join("")}
      ${ARME[zahl(arme, 0, 4)].map(([wo, s]) => arm(ARM[wo], s)).join("")}
      ${BEIN_X[zahl(beine, 0, 4)].map(bein).join("")}
      <path d="${KOERPER}" fill="${haut}"${rand}/>
      <ellipse cx="0" cy="-64" rx="54" ry="18" fill="${bauch}"/>
      ${Array.from({ length: nA }, (_, i) => auge(i)).join("")}
      ${[-64, 64].map((x) => `<circle cx="${x}" cy="-124" r="11" fill="#ff9db4" opacity="0.85"/>`).join("")}
      ${MUND[mund] || MUND.lacht}
    </g>`;
  };

  // =========================================================================
  // «Opposites»: je ein Bildpaar, jedes Bild 220 × 180, als helle Karte
  // =========================================================================
  const karte = (innen) => `<rect x="3" y="3" width="214" height="174" rx="20" fill="#fffaf0" stroke="#e8d9b9" stroke-width="3"/>${innen}`;
  const BODEN = `<path d="M22 152 H198" stroke="#eadbb9" stroke-width="4" stroke-linecap="round"/>`;
  const schatten = (x, rx, y = 152) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="6" fill="${DUNKEL}" opacity="0.1"/>`;
  // Eine Tasse mit dampfendem Kakao
  const kakao = () => `<ellipse cx="106" cy="151" rx="66" ry="10" fill="#dfe6ef"/><ellipse cx="106" cy="148" rx="50" ry="6" fill="#eef2f7"/>
    <path d="M148 90 Q178 88 176 112 Q174 134 146 132" stroke="#c8423b" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M62 76 H150 V122 Q150 148 124 148 H88 Q62 148 62 122 Z" fill="#e8543f"/>
    <ellipse cx="106" cy="76" rx="44" ry="10" fill="#c8423b"/><ellipse cx="106" cy="77" rx="38" ry="7" fill="#7b4a2b"/>
    <path transform="translate(106 108) scale(1.2)" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ffffff" opacity="0.9"/>
    ${[[84, 62], [106, 58], [128, 62]].map(([x, y]) => `<path d="M${x} ${y} q-11 -10 0 -20 t0 -20" stroke="#b7bfcc" stroke-width="5.5" fill="none" stroke-linecap="round"/>`).join("")}`;
  // Ein Eiswürfel: Vorderseite (x, y, Seite s), Deckel und Seite schräg hinten rechts
  const wuerfel = (x, y, s) => {
    const d = s * 0.32, h = s * 0.26;
    return `<g stroke="#8cc8e6" stroke-width="2.5" stroke-linejoin="round">
      <path d="M${x} ${y} L${f(x + d)} ${f(y - h)} H${f(x + s + d)} L${x + s} ${y} Z" fill="#eefaff"/>
      <path d="M${x + s} ${y} L${f(x + s + d)} ${f(y - h)} V${f(y + s - h)} L${x + s} ${y + s} Z" fill="#a9daf2"/>
      <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="3" fill="#cdeefb"/></g>
      <path d="M${x + 9} ${y + 10} V${y + s - 14} M${x + 17} ${y + 9} V${y + 17}" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`;
  };
  const flocke = (x, y, r) => `<path d="${[0, 60, 120].map((g) => { const c = Math.cos((g * Math.PI) / 180) * r, s = Math.sin((g * Math.PI) / 180) * r; return `M${f(x - c)} ${f(y - s)} L${f(x + c)} ${f(y + s)}`; }).join(" ")}" stroke="#7cc3ea" stroke-width="3.2" stroke-linecap="round"/>`;
  // Ein Glas; voll mit Orangensaft oder leer
  const glas = (voll) => `${schatten(110, 40)}
    <path d="M70 28 H150 L142 142 Q141 150 133 150 H87 Q79 150 78 142 Z" fill="#eef8fd" stroke="#9cc7de" stroke-width="4" stroke-linejoin="round"/>
    <path d="M80 134 H140 L139.5 141 Q139 146 133 146 H87 Q81 146 80.5 141 Z" fill="#d6ecf7"/>
    ${voll ? `<path d="M74.5 38 H145.5 L138.5 140 Q138 146 132 146 H88 Q82 146 81.5 140 Z" fill="#f5a623"/><ellipse cx="110" cy="38" rx="35.5" ry="5" fill="#ffc861"/>
      <circle cx="122" cy="80" r="3.5" fill="#ffc861"/><circle cx="104" cy="112" r="2.8" fill="#ffc861"/><circle cx="126" cy="122" r="2.4" fill="#ffc861"/>` : ""}
    <path d="M86 42 L91 132" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
    <ellipse cx="110" cy="28" rx="40" ry="6" fill="none" stroke="#9cc7de" stroke-width="3"/>`;
  // Die Wand mit dem Türrahmen
  const tuer = (innen) => karte(`<path d="M12 30 Q12 12 30 12 H190 Q208 12 208 30 V150 H12 Z" fill="#f6e3c4"/>
    <path d="M12 150 H208 V156 Q208 168 196 168 H24 Q12 168 12 156 Z" fill="#c08a55"/>
    <rect x="70" y="24" width="80" height="128" rx="5" fill="#8a5a35"/>${innen}`);
  // Das Rennauto (Boden bei 0, nach rechts)
  const rad = (x) => `<circle cx="${x}" cy="-17" r="17" fill="${DUNKEL}"/><circle cx="${x}" cy="-17" r="7" fill="#c3c7cf"/>`;
  const rennauto = () => `<rect x="-70" y="-68" width="26" height="8" rx="3" fill="#c62f3b"/><rect x="-62" y="-64" width="7" height="22" fill="#c62f3b"/>
    <path d="M-66 -18 L-64 -40 Q-62 -48 -52 -48 L-8 -50 Q0 -64 16 -64 H24 Q34 -64 38 -54 L74 -36 Q80 -30 76 -18 Z" fill="#e63946"/>
    <circle cx="20" cy="-63" r="11" fill="#ffd23f"/><path d="M21 -68 H28 Q33 -68 33 -63 Q33 -58 28 -58 H21 Z" fill="${DUNKEL}"/><path d="M10 -66 Q20 -76 30 -70" stroke="#e8543f" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-58 -30 H66" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><circle cx="4" cy="-40" r="7" fill="#ffffff"/>
    <rect x="68" y="-32" width="8" height="6" rx="3" fill="#fff3b0"/>${rad(-40)}${rad(50)}`;
  // Ein Himmel in der Karte mit Hügel und Häuschen
  const himmel = (farbe, innen) => karte(`<rect x="12" y="12" width="196" height="156" rx="12" fill="${farbe}"/>${innen}`);
  const huegel = (farbe) => `<path d="M12 130 Q64 106 118 120 T208 112 V156 Q208 168 196 168 H24 Q12 168 12 156 Z" fill="${farbe}"/>`;
  const haeuschen = (wand, dach, fenster, tuerFarbe) => `<rect x="138" y="104" width="44" height="34" rx="2" fill="${wand}"/>
    <path d="M132 106 L160 84 L188 106 Z" fill="${dach}" stroke="${dach}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="145" y="112" width="13" height="11" rx="2" fill="${fenster}"/><rect x="164" y="118" width="11" height="20" rx="2" fill="${tuerFarbe}"/>`;
  // Ein Haus mit 1–4 Stockwerken, gleich breit; daneben ein Busch
  const haus = (stockwerke) => {
    const H = 28, unten = 152, oben = unten - H * stockwerke;
    const fenster = (x, y, w = 16) => `<rect x="${x}" y="${y}" width="${w}" height="13" rx="2" fill="#cfeefa" stroke="#ffffff" stroke-width="2.5"/>`;
    let s = `<rect x="75" y="${oben}" width="70" height="${H * stockwerke}" fill="#ffd166"/>
      <path d="M68 ${oben + 2} L110 ${oben - 22} L152 ${oben + 2} Z" fill="#e8543f" stroke="#e8543f" stroke-width="4" stroke-linejoin="round"/>`;
    for (let k = 1; k < stockwerke; k++) s += fenster(84, unten - H * (k + 1) + 8) + fenster(120, unten - H * (k + 1) + 8);
    return `${s}${fenster(81, 133, 13)}${fenster(126, 133, 13)}<rect x="101" y="130" width="18" height="22" rx="3" fill="#a0612f"/><circle cx="115" cy="142" r="1.8" fill="#ffd166"/>
      <circle cx="170" cy="144" r="10" fill="#5cbf5c"/><circle cx="182" cy="146" r="8" fill="#4caf50"/><circle cx="48" cy="146" r="8" fill="#4caf50"/><circle cx="38" cy="147" r="6" fill="#5cbf5c"/>`;
  };
  const stern = (x, y, r) => (A.stern ? A.stern(x, y, r) : `<circle cx="${x}" cy="${y}" r="${r / 2}" fill="#ffd166"/>`);

  // Rocco traurig, für «sad» noch deutlicher: Brauen innen hoch, grösserer Bogen
  const traurig = () => A.roccoKopf("traurig").replace("M-18 -13 L-8 -10 M18 -13 L8 -10", "M-19 -10 L-8 -15 M19 -10 L8 -15")
    .replace("M-6 19 Q0 14 6 19", "M-8 21 Q0 13 8 21");

  A.GEGENTEILE = {
    big: () => karte(`${BODEN}${schatten(110, 54)}${at(110, 88, 2.1, A.DING.ball())}`),
    small: () => karte(`${BODEN}${schatten(110, 18)}${at(110, 131, 0.7, A.DING.ball())}`),
    hot: () => karte(kakao()),
    cold: () => karte(`<ellipse cx="108" cy="151" rx="64" ry="8" fill="#cdeefb" opacity="0.8"/>
      ${wuerfel(48, 104, 46)}${wuerfel(102, 104, 46)}${wuerfel(76, 52, 46)}
      ${flocke(34, 42, 10)}${flocke(184, 46, 8)}${flocke(186, 116, 9)}${flocke(30, 110, 7)}
      <circle cx="160" cy="30" r="3" fill="#7cc3ea"/><circle cx="52" cy="74" r="2.6" fill="#7cc3ea"/>`),
    happy: () => karte(`${at(110, 100, 2.15, A.roccoKopf("freude"))}${herz(34, 42)}${herz(188, 36, 0.8)}`),
    sad: () => karte(at(110, 100, 2.15, `${traurig()}<path d="M-13 4 q-4.5 6.5 -4.5 9.5 a4.5 4.5 0 0 0 9 0 q0 -3 -4.5 -9.5 Z" fill="#4fc3f7"/>`)),
    full: () => karte(glas(true)),
    empty: () => karte(glas(false)),
    open: () => tuer(`<rect x="77" y="31" width="66" height="121" fill="#bfe6f5"/><circle cx="126" cy="54" r="10" fill="#ffe27a"/>
      <path d="M77 120 Q104 108 143 116 V152 H77 Z" fill="#94cd60"/>
      <path d="M77 31 L46 20 V164 L77 152 Z" fill="#c08a55" stroke="#a8743f" stroke-width="2" stroke-linejoin="round"/>
      <path d="M71 42 L52 36 V80 L71 83 Z M71 95 L52 94 V148 L71 142 Z" fill="#b07a45"/><circle cx="56" cy="90" r="5" fill="#ffd166"/>`),
    closed: () => tuer(`<rect x="77" y="31" width="66" height="121" rx="2" fill="#c08a55"/>
      <rect x="85" y="40" width="50" height="40" rx="3" fill="#b07a45"/><rect x="85" y="90" width="50" height="52" rx="3" fill="#b07a45"/>
      <circle cx="134" cy="88" r="5.5" fill="#ffd166"/>`),
    fast: () => karte(`${BODEN}${schatten(128, 66)}
      ${[[18, 90, 36], [10, 108, 44], [20, 126, 32]].map(([x, y, l]) => `<path d="M${x} ${y} H${x + l}" stroke="#9aa0ab" stroke-width="5" stroke-linecap="round"/>`).join("")}
      <circle cx="58" cy="144" r="7" fill="#dfe3ea"/><circle cx="46" cy="138" r="5" fill="#dfe3ea"/>${at(130, 152, 0.95, rennauto())}`),
    slow: () => karte(`${BODEN}${schatten(112, 70)}<path d="M18 150 H52" stroke="#cfe6f2" stroke-width="6" stroke-linecap="round"/>
      <path d="M162 80 L152 54 M174 80 L182 54" stroke="#b9dd7a" stroke-width="6" stroke-linecap="round"/>
      <circle cx="152" cy="52" r="7" fill="#ffffff" stroke="#9cc45c" stroke-width="2"/><circle cx="153" cy="53" r="3.2" fill="${DUNKEL}"/>
      <circle cx="182" cy="52" r="7" fill="#ffffff" stroke="#9cc45c" stroke-width="2"/><circle cx="183" cy="53" r="3.2" fill="${DUNKEL}"/>
      <path d="M44 150 Q38 134 58 134 H138 Q148 134 150 122 L154 90 Q156 76 168 76 Q180 76 180 90 L176 136 Q174 150 158 150 Z" fill="#b9dd7a"/>
      <path d="M161 100 Q167 106 173 100" stroke="${DUNKEL}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="98" cy="98" r="40" fill="#f5a623"/>
      <path d="M98 98 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0 a16 16 0 0 1 -32 0 a20 20 0 0 1 40 0 a24 24 0 0 1 -48 0" stroke="#c9771a" stroke-width="5" fill="none" stroke-linecap="round"/>`),
    day: () => himmel("#8fd3f4", `${at(58, 56, 0.6, A.DING.sun())}${wolke(150, 48, 0.55)}${huegel("#94cd60")}${haeuschen("#fff3d6", "#e8543f", "#cfeefa", "#a0612f")}`),
    night: () => himmel("#1f2d5c", `<circle cx="60" cy="54" r="30" fill="#ffe27a"/><circle cx="74" cy="44" r="25" fill="#1f2d5c"/>
      ${[[126, 34, 8], [178, 50, 6], [108, 72, 5], [160, 24, 5], [196, 82, 4.5], [34, 102, 5]].map(([x, y, r]) => stern(x, y, r)).join("")}
      ${huegel("#2f5a46")}${haeuschen("#8a8ea8", "#7a3a40", "#ffd166", "#5a4a5e")}`),
    tall: () => karte(`${BODEN}${haus(4)}`),
    short: () => karte(`${BODEN}${haus(1)}`),
  };
})();
