/*
 * englisch-art-2.js – Die Zeichnungen der Englischecke aus Etappe 2: die
 * Welten The Park, The Zoo und The Beach mit ihren Wimmelbildern, Stickern,
 * Aufnähern und je einer Bildgeschichte («Rocco and the kite.», «Hello,
 * elephant!», «The big wave.»).
 *
 * Wie englisch-art.js: flache Farben, runde Formen, kein Text im Bild. Jede
 * Welt legt ihre Dinge in window.LernappEnglischArt dazu (DING, ORTE,
 * HINTERGRUND, STICKER, AUFNAEHER_BILD, AUFNAEHER_FARBE, GESCHICHTEN_BILDER,
 * TITELBILD). Kommt nach englisch-art.js.
 */

// Englischecke, Welt park (für englisch-art-2.js)
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { tb, bildHintergrund, menschOder, wolke, FARBE } = A.hilfen;
  const { DUNKEL, HAUT } = FARBE;
  const SCHNUR = "#5d6882";
  const herz = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/>`;

  Object.assign(A.DING, {
    slide: () => `<path d="M-36 -44 C4 -44 6 50 70 54" stroke="#e0a000" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="M-36 -44 C4 -44 6 50 70 54" stroke="#ffd23f" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M-30 -45 C6 -45 8 46 66 51" stroke="#fff3b0" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="5" y="6" width="8" height="60" rx="3" fill="#2f63bd"/>
      <rect x="-70" y="-48" width="9" height="114" rx="3.5" fill="#3a7bd5"/><rect x="-42" y="-48" width="9" height="114" rx="3.5" fill="#3a7bd5"/>
      ${[-26, -4, 18, 40].map((y) => `<rect x="-63" y="${y}" width="24" height="6" rx="2" fill="#2f63bd"/>`).join("")}
      <path d="M-66 -50 V-60 Q-66 -66 -59 -66 H-45 Q-38 -66 -38 -59 V-50" stroke="#e8543f" stroke-width="6" fill="none"/>
      <rect x="-74" y="-52" width="46" height="10" rx="4" fill="#e8543f"/>`,
    swing: () => `<path d="M-62 -66 L-80 56 M-62 -66 L-44 56 M62 -66 L44 56 M62 -66 L80 56" stroke="#e8543f" stroke-width="8" stroke-linecap="round"/>
      <rect x="-74" y="-75" width="148" height="12" rx="5" fill="#c8423b"/>
      <path d="M-40 -64 V18 M-14 -64 V18" stroke="#8d939e" stroke-width="2.5"/><rect x="-46" y="15" width="38" height="9" rx="3" fill="#3a7bd5"/>
      <g transform="rotate(-20 26 -64)"><path d="M13 -64 V18 M39 -64 V18" stroke="#8d939e" stroke-width="2.5"/><rect x="7" y="15" width="38" height="9" rx="3" fill="#ffd23f"/></g>`,
    sandbox: () => `<path d="M-64 -14 L64 -14 L80 30 L-80 30 Z" fill="#b07a45"/><path d="M-57 -9 L57 -9 L69 25 L-69 25 Z" fill="#f2d48a"/>
      <path d="M-52 18 Q-28 -10 -4 18 Z" fill="#e6c372"/>
      <g transform="rotate(-18 -26 10)"><rect x="-29" y="-42" width="6" height="40" rx="3" fill="#8a5a35"/><rect x="-35" y="-46" width="18" height="6" rx="3" fill="#8a5a35"/><path d="M-36 -6 H-16 L-18 12 Q-26 18 -34 12 Z" fill="#e8543f"/></g>
      <path d="M20 -16 H50 L45 16 H25 Z" fill="#3a7bd5"/><ellipse cx="35" cy="-16" rx="15" ry="3.5" fill="#2f63bd"/><path d="M21 -15 Q35 -38 49 -15" stroke="#2f63bd" stroke-width="3" fill="none"/>
      <rect x="-80" y="28" width="160" height="14" rx="3" fill="#c08a55"/><path d="M-40 28 V42 M0 28 V42 M40 28 V42" stroke="#a8743f" stroke-width="2"/>`,
    kite: (schnur = true) => `${schnur ? `<path d="M0 -10 Q14 26 30 64" stroke="${SCHNUR}" stroke-width="2" fill="none"/>` : ""}
      <path d="M0 40 q-10 8 -4 16 t-4 16 t-4 14" stroke="${SCHNUR}" stroke-width="2" fill="none"/>
      ${[[-4, 56], [-8, 72], [-12, 86]].map(([x, y]) => `<path d="M${x} ${y} l-9 -5 v10 Z M${x} ${y} l9 -5 v10 Z" fill="#3a7bd5"/>`).join("")}
      <path d="M0 -56 L-36 -16 H0 Z M36 -16 L0 40 V-16 Z" fill="#e8543f"/><path d="M0 -56 L36 -16 H0 Z M-36 -16 L0 40 V-16 Z" fill="#ffd23f"/>
      <path d="M0 -56 V40 M-36 -16 H36" stroke="#8a5a35" stroke-width="2.5"/>`,
    bike: () => `<circle cx="-38" cy="20" r="22" fill="none" stroke="${DUNKEL}" stroke-width="7"/><circle cx="38" cy="20" r="22" fill="none" stroke="${DUNKEL}" stroke-width="7"/>
      <path d="M-38 6 V34 M-52 20 H-24 M38 6 V34 M24 20 H52" stroke="#c3c7cf" stroke-width="2"/>
      <path d="M-38 20 L-8 20 L20 -16 L-20 -16 Z M-8 20 L-23 -28 M38 20 L20 -16 L15 -32" stroke="#e8543f" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M-34 -31 H-12" stroke="${DUNKEL}" stroke-width="7" stroke-linecap="round"/><path d="M6 -34 Q15 -38 27 -32" stroke="${DUNKEL}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="-8" cy="20" r="6" fill="#3a3f4a"/>`,
    bench: () => `<path d="M-50 10 V42 M50 10 V42 M-46 -42 V2 M46 -42 V2" stroke="#3a3f4a" stroke-width="7" stroke-linecap="round"/>
      <rect x="-66" y="-46" width="132" height="12" rx="4" fill="#c98b4f"/><rect x="-66" y="-28" width="132" height="12" rx="4" fill="#c98b4f"/>
      <rect x="-70" y="-4" width="140" height="13" rx="4" fill="#b8763d"/><rect x="-66" y="9" width="132" height="5" rx="2" fill="#8a5a35"/>
      <path d="M-58 42 H-42 M42 42 H58" stroke="#3a3f4a" stroke-width="6" stroke-linecap="round"/>`,
    bird: () => `<path d="M-28 2 L-48 -8 L-44 14 Z" fill="#2f63bd"/>
      <ellipse cx="-4" cy="6" rx="28" ry="20" fill="#4a90e2"/><ellipse cx="0" cy="13" rx="17" ry="10" fill="#d4e8ff"/>
      <circle cx="22" cy="-8" r="15" fill="#4a90e2"/><path d="M35 -11 L49 -6 L35 -1 Z" fill="#f5a623"/>
      <circle cx="26" cy="-11" r="3" fill="${DUNKEL}"/>
      <path d="M-16 0 Q-24 -38 4 -42 Q2 -16 12 0 Z" fill="#2f63bd"/>`,
    butterfly: () => `<path d="M0 -18 Q-4 -34 -14 -38 M0 -18 Q4 -34 14 -38" stroke="${DUNKEL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M-2 -8 Q-30 -46 -42 -20 Q-46 2 -2 2 Z" fill="#ef6fa8"/><path d="M2 -8 Q30 -46 42 -20 Q46 2 2 2 Z" fill="#ef6fa8"/>
      <path d="M-2 4 Q-34 4 -30 24 Q-20 38 -2 12 Z" fill="#b06ad8"/><path d="M2 4 Q34 4 30 24 Q20 38 2 12 Z" fill="#b06ad8"/>
      <circle cx="-24" cy="-14" r="6" fill="#ffd166"/><circle cx="24" cy="-14" r="6" fill="#ffd166"/><circle cx="-17" cy="18" r="4" fill="#f3e3ff"/><circle cx="17" cy="18" r="4" fill="#f3e3ff"/>
      <ellipse cx="0" cy="2" rx="4.5" ry="19" fill="${DUNKEL}"/>`,
    squirrel: () => `<path d="M6 40 C46 42 58 2 48 -24 C42 -42 22 -52 12 -40 C4 -30 20 -24 24 -8 C28 10 18 26 2 30 Z" fill="#a84d1c"/>
      <path d="M18 31 C38 26 46 0 39 -22" stroke="#d07a3c" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="-6" cy="14" rx="20" ry="25" fill="#c8632a"/><ellipse cx="-13" cy="18" rx="10" ry="16" fill="#f3cfa0"/>
      <path d="M-22 -30 L-25 -48 L-12 -36 Z M-6 -34 L-2 -51 L4 -34 Z" fill="#a84d1c"/>
      <circle cx="-12" cy="-22" r="16" fill="#c8632a"/><ellipse cx="-25" cy="-17" rx="8" ry="6.5" fill="#f3cfa0"/>
      <circle cx="-32" cy="-19" r="2.8" fill="${DUNKEL}"/><circle cx="-16" cy="-26" r="3.2" fill="${DUNKEL}"/>
      <ellipse cx="-24" cy="4" rx="7" ry="6" fill="#8a5a35"/><path d="M-28 -1 q4 -4 8 0" stroke="#5b3a29" stroke-width="2" fill="none"/>
      <ellipse cx="-17" cy="9" rx="6" ry="4" fill="#c8632a"/>
      <ellipse cx="-16" cy="38" rx="10" ry="5" fill="#a84d1c"/><ellipse cx="4" cy="38" rx="9" ry="5" fill="#a84d1c"/>`,
    boy: () => menschOder("m_bub", 1.2, `<rect x="-14" y="-46" width="11" height="46" rx="4" fill="#3a3f4a"/><rect x="3" y="-46" width="11" height="46" rx="4" fill="#3a3f4a"/>
      <rect x="-20" y="-88" width="40" height="46" rx="12" fill="#3fbf74"/><circle cx="0" cy="-106" r="21" fill="${HAUT}"/>
      <path d="M-21 -108 Q-20 -130 0 -129 Q20 -130 21 -108 Q10 -118 0 -116 Q-10 -118 -21 -108 Z" fill="#6d4628"/>
      <circle cx="-7" cy="-104" r="2.6" fill="${DUNKEL}"/><circle cx="7" cy="-104" r="2.6" fill="${DUNKEL}"/><path d="M-6 -96 Q0 -91 6 -96" stroke="${DUNKEL}" stroke-width="2" fill="none" stroke-linecap="round"/>`),
    girl: () => menschOder("m_maedchen", 1.2, `<rect x="-12" y="-36" width="9" height="36" rx="4" fill="${HAUT}"/><rect x="3" y="-36" width="9" height="36" rx="4" fill="${HAUT}"/>
      <path d="M-14 -88 H14 L28 -34 H-28 Z" fill="#ef6fa8"/><circle cx="0" cy="-106" r="21" fill="${HAUT}"/>
      <path d="M-21 -108 Q-20 -130 0 -129 Q20 -130 21 -108 Q10 -118 0 -116 Q-10 -118 -21 -108 Z" fill="#a0612f"/>
      <circle cx="-26" cy="-104" r="8" fill="#a0612f"/><circle cx="26" cy="-104" r="8" fill="#a0612f"/>
      <circle cx="-7" cy="-104" r="2.6" fill="${DUNKEL}"/><circle cx="7" cy="-104" r="2.6" fill="${DUNKEL}"/><path d="M-6 -96 Q0 -91 6 -96" stroke="${DUNKEL}" stroke-width="2" fill="none" stroke-linecap="round"/>`),
    scooter: () => `<path d="M38 30 L28 -52" stroke="#3fbf74" stroke-width="8" stroke-linecap="round"/><path d="M14 -54 H42" stroke="${DUNKEL}" stroke-width="7" stroke-linecap="round"/>
      <rect x="-54" y="24" width="96" height="10" rx="5" fill="#3fbf74"/><path d="M-54 30 Q-62 30 -60 38" stroke="#2f9d5c" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="-44" cy="42" r="10" fill="${DUNKEL}"/><circle cx="42" cy="42" r="10" fill="${DUNKEL}"/><circle cx="-44" cy="42" r="3.5" fill="#c3c7cf"/><circle cx="42" cy="42" r="3.5" fill="#c3c7cf"/>`,
  });

  // Der Spielplatz im Park: Himmel, Bäume am Rand, Wiese, ein Weg; zuletzt die
  // Schnur vom Drachen zur Hand des Buben (passt zu ORTE.park.kite und .boy)
  A.HINTERGRUND.park = () => {
    const baum = (x, y, s, f) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-7" y="-14" width="14" height="44" rx="4" fill="#8a6a4a"/><circle cx="0" cy="-40" r="32" fill="${f}"/><circle cx="-24" cy="-18" r="22" fill="${f}"/><circle cx="24" cy="-18" r="22" fill="${f}"/></g>`;
    const busch = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#86c96c"><circle cx="-18" cy="0" r="18"/><circle cx="0" cy="-8" r="22"/><circle cx="20" cy="0" r="17"/></g>`;
    return `<rect width="1000" height="560" fill="url(#himmel)"/>
      ${wolke(450, 62, 0.9)}${wolke(870, 170, 0.7)}${wolke(150, 160, 0.65)}
      <path d="M0 268 Q200 236 420 256 T820 246 T1000 256 L1000 560 L0 560 Z" fill="#b5dc8a"/>
      ${busch(270, 290, 1)}${busch(560, 286, 0.9)}${busch(800, 284, 1.1)}
      ${baum(38, 282, 1.35, "#6fba5a")}${baum(112, 290, 1.0, "#7cc66a")}${baum(910, 278, 1.25, "#6fba5a")}${baum(978, 292, 1.0, "#7cc66a")}
      <path d="M0 318 Q260 296 520 312 T1000 304 L1000 560 L0 560 Z" fill="#94cd60"/>
      <path d="M300 560 Q330 470 500 428 Q660 388 720 312 L770 310 Q726 410 560 454 Q430 492 440 560 Z" fill="#ead6a6"/>
      ${[[40, 360], [300, 380], [610, 520], [960, 470], [880, 540], [180, 548], [520, 352]].map(([x, y]) => `<path d="M${x} ${y} l-5 -10 M${x} ${y} l0 -12 M${x} ${y} l5 -10" stroke="#6fb23f" stroke-width="3" stroke-linecap="round"/>`).join("")}
      ${[[70, 380, "#ffffff"], [640, 534, "#ffd166"], [930, 492, "#ffffff"], [340, 396, "#ffd166"]].map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="4" fill="${f}"/>`).join("")}
      <path d="M670 176 L731 370" stroke="${SCHNUR}" stroke-width="2"/>`;
  };

  A.ORTE.park = {
    bird: [300, 118, 1.3, [44, -40]],
    kite: [640, 112, 1.0, [36, -50]],
    butterfly: [940, 250, 1.2, [34, -36]],
    slide: [170, 274, 1.25, [-30, -64]],
    swing: [430, 284, 1.2, [74, -72]],
    squirrel: [600, 340, 1.0, [40, -40]],
    boy: [748, 416, 1.0, [26, -120]],
    bench: [880, 392, 1.0, [62, -46]],
    girl: [110, 520, 1.0, [30, -120]],
    scooter: [270, 494, 1.0, [40, -52]],
    ball: [420, 506, 1.2, [24, -24]],
    bike: [570, 482, 1.1, [50, -34]],
    sandbox: [800, 494, 1.1, [70, -16]],
  };

  Object.assign(A.STICKER, {
    slide: [0.36, 0], swing: [0.36, 8], sandbox: [0.4, 0], kite: [0.42, -16], bike: [0.45, -2], bench: [0.42, 2],
    bird: [0.58, 8], butterfly: [0.66, 4], squirrel: [0.6, 2], boy: [0.5, 57], girl: [0.5, 57], scooter: [0.5, -4],
  });
  A.AUFNAEHER_BILD.park = "slide";
  A.AUFNAEHER_FARBE.park = "#f08a24";

  // Die Bildgeschichte «Rocco and the kite.»
  const rocco = (x, y, s, pose, laune) => `<g transform="translate(${x} ${y}) scale(${s})">${A.rocco(pose, laune)}</g>`;
  const drachen = (x, y, s, w = 0, schnur = true) => `<g transform="translate(${x} ${y}) rotate(${w}) scale(${s})">${A.DING.kite(schnur)}</g>`;
  const windStrich = (x, y, l) => `<path d="M${x} ${y} q${l / 4} -8 ${l / 2} 0 t${l / 2} 0" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  A.GESCHICHTEN_BILDER.kite = [
    () => `${bildHintergrund()}${windStrich(320, 46, 80)}${windStrich(366, 76, 70)}${windStrich(330, 108, 90)}${windStrich(60, 44, 60)}
      <path d="M222 165 Q196 150 134 98" stroke="${SCHNUR}" stroke-width="2" fill="none"/>
      ${tb('data-wort="kite"', drachen(130, 92, 0.62, -16, false))}
      ${tb('data-wort="raccoon"', rocco(250, 196, 0.95, "steh", "froh"))}`,
    () => `${bildHintergrund()}${wolke(250, 46, 0.5)}${wolke(430, 110, 0.45)}
      <path d="M309 129 Q210 124 114 56" stroke="${SCHNUR}" stroke-width="2" fill="none"/>
      ${tb('data-wort="kite"', drachen(110, 48, 0.55, -14, false))}
      <path d="M50 92 l0 -14 M44 84 l6 -7 l6 7 M170 70 l0 -14 M164 62 l6 -7 l6 7" stroke="#3a7bd5" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${rocco(340, 196, 0.95, "jubel", "hoch")}`,
    () => `${bildHintergrund()}${tb('data-wort="tree"', `<g transform="translate(140 196) scale(1.05)">${A.DING.tree()}</g>`)}
      ${tb('data-wort="kite"', `${drachen(156, 102, 0.5, 22, false)}<path d="M156 106 q14 18 8 36 t10 32" stroke="${SCHNUR}" stroke-width="2" fill="none"/>`)}
      ${rocco(350, 196, 0.95, "steh", "traurig")}
      <g transform="translate(286 64)"><circle r="20" fill="#ffffff" stroke="#c3c7cf" stroke-width="2"/><rect x="-3.5" y="-12" width="7" height="16" rx="3.5" fill="#e8543f"/><circle cx="0" cy="10" r="3.8" fill="#e8543f"/></g>`,
    () => `${bildHintergrund()}<g transform="translate(64 196) scale(0.9)">${A.DING.tree()}</g>
      <path d="M80 82 Q122 70 142 110" stroke="#ffffff" stroke-width="3" stroke-dasharray="5 7" fill="none" stroke-linecap="round"/>
      ${tb('data-wort="kite"', `${drachen(240, 110, 0.55, 12, false)}<path d="M238 116 Q202 140 174 150" stroke="${SCHNUR}" stroke-width="2" fill="none"/>`)}
      ${tb('data-wort="squirrel"', `<g transform="translate(150 146) scale(-0.95 0.95)">${A.DING.squirrel()}</g>`)}
      ${rocco(362, 196, 0.95, "jubel", "freude")}
      ${herz(296, 44)}${herz(432, 30, 0.8)}`,
  ];
  A.TITELBILD.kite = 1;
})();

// Englischecke, Welt zoo (für englisch-art-2.js)
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { tb, bildHintergrund, menschOder, wolke, FARBE } = A.hilfen;
  const { DUNKEL } = FARBE;

  // Kleine Helfer: Streifen in einer Ellipse (Zebra, Tiger), ein Fragezeichen,
  // ein Zaun, ein Felsen, ein Busch, Wasser
  const f1 = (n) => Number(n.toFixed(1));
  const halb = (cx, rx, ry, x) => ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const zebraStreifen = (cx, cy, rx, ry, xs, w = 5) => xs.map((x) => {
    const h = f1(halb(cx, rx, ry, x) * 0.9);
    return `<path d="M${x} ${f1(cy - h)} Q${x + 5} ${cy} ${x} ${f1(cy + h)}" stroke="${DUNKEL}" stroke-width="${w}" fill="none"/>`;
  }).join("");
  const tigerStreifen = (cx, cy, rx, ry, xs) => xs.map((x) => {
    const h = halb(cx, rx, ry, x);
    const y0 = f1(cy - h + 2);
    return `<path d="M${x - 3} ${y0} L${x + 4} ${y0} L${x + 2} ${f1(y0 + h * 0.9)} Z" fill="${DUNKEL}"/>`;
  }).join("");
  const frage = (x, y, r = 20) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ffffff" stroke="#c3c7cf" stroke-width="2"/>
    <g transform="scale(${r / 20})"><path d="M-7 -6 Q-7 -14 0 -14 Q8 -14 8 -7 Q8 -2 2 1 Q0 3 0 6" stroke="#3a7bd5" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="0" cy="12.5" r="3.2" fill="#3a7bd5"/></g></g>`;
  const zaun = (x1, x2, y, s = 1) => {
    let z = "";
    for (let x = x1; x <= x2; x += 34 * s) z += `<rect x="${f1(x)}" y="${f1(y - 26 * s)}" width="${f1(7 * s)}" height="${f1(30 * s)}" rx="${f1(3 * s)}" fill="#b07a45"/>`;
    return `<rect x="${x1 - 4}" y="${f1(y - 20 * s)}" width="${f1(x2 - x1 + 15 * s)}" height="${f1(6 * s)}" rx="3" fill="#d6a46f"/><rect x="${x1 - 4}" y="${f1(y - 8 * s)}" width="${f1(x2 - x1 + 15 * s)}" height="${f1(6 * s)}" rx="3" fill="#d6a46f"/>${z}`;
  };
  const fels = (x, y, b, h) => `<path d="M${x - b / 2} ${y} Q${x - b / 2} ${y - h * 0.8} ${x - b * 0.2} ${y - h} Q${x + b * 0.15} ${y - h * 1.05} ${x + b * 0.35} ${y - h * 0.7} Q${x + b / 2} ${y - h * 0.4} ${x + b / 2} ${y} Z" fill="#a9aeb8"/>
    <path d="M${x - b * 0.3} ${y - h * 0.75} Q${x - b * 0.1} ${y - h * 0.92} ${x + b * 0.12} ${y - h * 0.86}" stroke="#c7cbd3" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const busch = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-22" cy="-14" r="18" fill="#5ea83f"/><circle cx="22" cy="-14" r="18" fill="#5ea83f"/><circle cx="0" cy="-24" r="22" fill="#6dbb4b"/><rect x="-38" y="-16" width="76" height="16" rx="8" fill="#5ea83f"/></g>`;
  const akazie = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-3 0 L-2 -30 L-14 -44 M-2 -30 L12 -46" stroke="#8a6a45" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="-48" rx="38" ry="9" fill="#7aa64a"/></g>`;
  const wellen = (x1, x2, y, farbe = "#ffffff") => {
    let d = `M${x1} ${y}`;
    for (let x = x1; x < x2; x += 24) d += ` q6 -5 12 0 t12 0`;
    return `<path d="${d}" stroke="${farbe}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  };
  const tropfen = (x, y, r = 5) => `<path d="M${x} ${y - r * 1.8} Q${x + r} ${y - r * 0.4} ${x + r} ${y} A${r} ${r} 0 0 1 ${x - r} ${y} Q${x - r} ${y - r * 0.4} ${x} ${y - r * 1.8} Z" fill="#5bb8e6"/>`;
  const herz = (x, y) => `<path d="M${x} ${y} c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/>`;

  // =========================================================================
  // Die Tiere (jedes um (0,0), Füsse meist bei +45 … +50)
  // =========================================================================
  const ELEFANT = "#a3aebb", ELEFANT_D = "#8a96a4";
  Object.assign(A.DING, {
    lion: () => `<path d="M-44 -6 Q-70 -4 -66 -30" stroke="#d9952e" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="-66" cy="-35" rx="7" ry="9" fill="#a3481a"/>
      ${[-38, -22, 8, 22].map((x) => `<rect x="${x}" y="0" width="13" height="46" rx="5" fill="#d9952e"/>`).join("")}
      <ellipse cx="-6" cy="-4" rx="44" ry="25" fill="#eaa93f"/>
      ${Array.from({ length: 12 }, (_, k) => `<circle cx="${f1(30 + 31 * Math.cos((k * Math.PI) / 6))}" cy="${f1(-28 + 31 * Math.sin((k * Math.PI) / 6))}" r="12" fill="#a3481a"/>`).join("")}
      <circle cx="30" cy="-28" r="33" fill="#b8561c"/><circle cx="15" cy="-47" r="7" fill="#eaa93f"/><circle cx="45" cy="-47" r="7" fill="#eaa93f"/>
      <circle cx="30" cy="-27" r="20" fill="#f4c45f"/><ellipse cx="30" cy="-15" rx="11" ry="8" fill="#fde3a7"/>
      <circle cx="23" cy="-31" r="3" fill="${DUNKEL}"/><circle cx="37" cy="-31" r="3" fill="${DUNKEL}"/><path d="M26 -22 L34 -22 L30 -17 Z" fill="#6d3416"/>
      <path d="M30 -17 V-13 M25 -12 Q30 -9 35 -12" stroke="#6d3416" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    tiger: () => `<path d="M-48 -8 Q-74 -10 -70 -40" stroke="#f2862a" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M-48 -8 Q-74 -10 -70 -40" stroke="${DUNKEL}" stroke-width="8" fill="none" stroke-dasharray="5 7" stroke-dashoffset="-6"/>
      ${[-38, -22, 8, 22].map((x) => `<rect x="${x}" y="0" width="13" height="46" rx="5" fill="#e57a20"/><rect x="${x}" y="14" width="13" height="4" fill="${DUNKEL}"/><rect x="${x}" y="40" width="13" height="6" rx="3" fill="#fff4e6"/>`).join("")}
      <ellipse cx="-6" cy="-4" rx="46" ry="24" fill="#f2862a"/><ellipse cx="-6" cy="12" rx="30" ry="8" fill="#fff4e6"/>
      ${tigerStreifen(-6, -4, 46, 24, [-40, -27, -14, -1, 12])}
      <circle cx="14" cy="-46" r="9" fill="#f2862a"/><circle cx="50" cy="-46" r="9" fill="#f2862a"/><circle cx="14" cy="-46" r="4.5" fill="#fff4e6"/><circle cx="50" cy="-46" r="4.5" fill="#fff4e6"/><circle cx="32" cy="-26" r="24" fill="#f2862a"/>
      <path d="M25 -48 l2 9 M32 -50 v11 M39 -48 l-2 9 M8 -30 h9 M9 -21 h7 M56 -30 h-9 M55 -21 h-7" stroke="${DUNKEL}" stroke-width="3.2" stroke-linecap="round"/>
      <ellipse cx="25" cy="-13" rx="10" ry="8" fill="#fff4e6"/><ellipse cx="39" cy="-13" rx="10" ry="8" fill="#fff4e6"/>
      <circle cx="24" cy="-29" r="3.2" fill="${DUNKEL}"/><circle cx="40" cy="-29" r="3.2" fill="${DUNKEL}"/><path d="M28 -19 L36 -19 L32 -14 Z" fill="#e8737a"/><path d="M27 -9 Q32 -6 37 -9" stroke="${DUNKEL}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    elephant: (pose) => {
      const ruessel = pose === "spritz"
        ? `<path d="M58 -30 Q80 -40 78 -66 Q77 -78 86 -80" stroke="${ELEFANT}" stroke-width="13" fill="none" stroke-linecap="round"/>`
        : `<path d="M57 -16 Q68 6 62 30 Q60 40 70 38" stroke="${ELEFANT}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
      return `<path d="M-54 -14 Q-64 0 -61 16" stroke="${ELEFANT_D}" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="-61" cy="19" rx="3.5" ry="5" fill="#5d6470"/>
      ${[-46, -26, 6, 24].map((x) => `<rect x="${x}" y="6" width="18" height="42" rx="6" fill="${ELEFANT_D}"/>${[3, 9, 15].map((d) => `<circle cx="${x + d}" cy="45" r="2.2" fill="#e9edf3"/>`).join("")}`).join("")}
      <ellipse cx="-8" cy="-8" rx="50" ry="36" fill="${ELEFANT}"/>
      <circle cx="38" cy="-24" r="27" fill="${ELEFANT}"/>${ruessel}
      <ellipse cx="20" cy="-20" rx="20" ry="27" fill="${ELEFANT_D}"/><ellipse cx="20" cy="-19" rx="12" ry="18" fill="#e8b4c2"/>
      <path d="M50 -6 q6 9 16 6" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="47" cy="-32" r="3.4" fill="${DUNKEL}"/><circle cx="52" cy="-22" r="4" fill="#f2a0b4" opacity="0.6"/>`;
    },
    giraffe: () => `<path d="M-52 0 Q-60 16 -58 38" stroke="#e8aa36" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="-58" cy="41" rx="4" ry="6" fill="#8a4a1a"/>
      ${[-44, -30, 0, 14].map((x) => `<rect x="${x}" y="12" width="10" height="80" rx="4" fill="#efb43e"/><rect x="${x}" y="86" width="10" height="7" rx="2" fill="#6d4628"/>`).join("")}
      <ellipse cx="-14" cy="4" rx="40" ry="22" fill="#f7c548"/><path d="M4 -4 L22 -100 L40 -96 L34 8 Z" fill="#f7c548"/>
      <path d="M8 -14 L24 -100" stroke="#b8561c" stroke-width="5" stroke-linecap="round" stroke-dasharray="7 4"/>
      ${[[-40, -4, 13, 10], [-22, -12, 12, 9], [-6, -6, 11, 10], [-30, 8, 12, 9], [-12, 10, 11, 8], [16, -20, 11, 9], [19, -44, 10, 9], [23, -68, 9, 8]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#c06a22"/>`).join("")}
      <rect x="25" y="-126" width="5" height="18" rx="2.5" fill="#c06a22"/><rect x="36" y="-127" width="5" height="18" rx="2.5" fill="#c06a22"/><circle cx="27.5" cy="-127" r="4.5" fill="#8a4a1a"/><circle cx="38.5" cy="-128" r="4.5" fill="#8a4a1a"/>
      <ellipse cx="18" cy="-108" rx="10" ry="4.5" transform="rotate(-25 18 -108)" fill="#efb43e"/>
      <ellipse cx="40" cy="-104" rx="21" ry="13" transform="rotate(18 40 -104)" fill="#f7c548"/><ellipse cx="55" cy="-97" rx="10" ry="9" fill="#fbe08a"/>
      <circle cx="40" cy="-108" r="3.2" fill="${DUNKEL}"/><circle cx="59" cy="-99" r="1.8" fill="#8a4a1a"/><path d="M50 -90 Q55 -87 60 -90" stroke="#8a4a1a" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    monkey: () => `<path d="M-6 28 C-52 40 -60 -12 -46 -50 Q-40 -64 -30 -62" stroke="#7a4a2a" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="-64" y="-70" width="128" height="11" rx="5.5" fill="#7a4f2c"/><ellipse cx="-56" cy="-74" rx="13" ry="6" transform="rotate(-20 -56 -74)" fill="#4caf50"/><ellipse cx="54" cy="-75" rx="13" ry="6" transform="rotate(20 54 -75)" fill="#4caf50"/><ellipse cx="34" cy="-74" rx="9" ry="5" transform="rotate(-15 34 -74)" fill="#5cbf5c"/>
      <path d="M12 -12 Q22 -40 16 -62" stroke="#7a4a2a" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="16" cy="-64" r="6" fill="#e3b07a"/>
      <path d="M-10 -8 Q-26 2 -28 18" stroke="#7a4a2a" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-28" cy="20" r="5.5" fill="#e3b07a"/>
      <path d="M-6 26 Q-12 40 -6 48 M6 26 Q14 40 22 42" stroke="#7a4a2a" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-6" cy="49" r="5" fill="#e3b07a"/><circle cx="23" cy="42" r="5" fill="#e3b07a"/>
      <ellipse cx="0" cy="8" rx="17" ry="23" fill="#8a5a35"/><ellipse cx="0" cy="12" rx="10" ry="14" fill="#d9a46c"/>
      <circle cx="-20" cy="-34" r="9" fill="#8a5a35"/><circle cx="16" cy="-34" r="9" fill="#8a5a35"/><circle cx="-20" cy="-34" r="5" fill="#e3b07a"/><circle cx="16" cy="-34" r="5" fill="#e3b07a"/><circle cx="-2" cy="-34" r="17" fill="#8a5a35"/>
      <ellipse cx="-7" cy="-37" rx="6.5" ry="7" fill="#e3b07a"/><ellipse cx="3" cy="-37" rx="6.5" ry="7" fill="#e3b07a"/><ellipse cx="-2" cy="-27" rx="11" ry="8" fill="#e3b07a"/>
      <circle cx="-7" cy="-37" r="2.8" fill="${DUNKEL}"/><circle cx="3" cy="-37" r="2.8" fill="${DUNKEL}"/><circle cx="-4" cy="-29" r="1.2" fill="#6d4628"/><circle cx="0" cy="-29" r="1.2" fill="#6d4628"/><path d="M-7 -24 Q-2 -20 3 -24" stroke="#6d4628" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    zebra: () => `<path d="M-44 -12 Q-56 -2 -54 20" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="-54" cy="23" rx="4" ry="7" fill="${DUNKEL}"/>
      ${[-36, -22, 12, 26].map((x) => `<rect x="${x}" y="2" width="11" height="46" rx="4" fill="#ffffff" stroke="#d5dbe3" stroke-width="1.5"/>${[14, 24, 34].map((y) => `<rect x="${x}" y="${y}" width="11" height="4" fill="${DUNKEL}"/>`).join("")}<rect x="${x}" y="42" width="11" height="7" rx="2" fill="${DUNKEL}"/>`).join("")}
      <ellipse cx="-4" cy="-4" rx="42" ry="23" fill="#ffffff" stroke="#d5dbe3" stroke-width="1.5"/>
      ${zebraStreifen(-4, -4, 42, 23, [-34, -22, -10, 2, 14])}
      <path d="M16 -16 L32 -54 L52 -46 L40 -2 Z" fill="#ffffff"/><path d="M24 -24 L42 -18 M27 -34 L46 -28 M31 -44 L49 -38" stroke="${DUNKEL}" stroke-width="5"/>
      <path d="M18 -18 L33 -56" stroke="${DUNKEL}" stroke-width="8" stroke-linecap="round"/>
      <path d="M36 -60 L40 -74 L46 -58 Z" fill="#ffffff" stroke="#d5dbe3" stroke-width="1.5"/><ellipse cx="52" cy="-42" rx="23" ry="11" transform="rotate(38 52 -42)" fill="#ffffff"/>
      <path d="M44 -52 L54 -48 M41 -44 L52 -38" stroke="${DUNKEL}" stroke-width="4"/>
      <ellipse cx="65" cy="-30" rx="9" ry="8" transform="rotate(38 65 -30)" fill="${DUNKEL}"/><circle cx="50" cy="-47" r="2.8" fill="${DUNKEL}"/>`,
    bear: () => `<circle cx="-50" cy="-12" r="6" fill="#774a28"/>
      ${[-36, -20, 10, 26].map((x) => `<rect x="${x}" y="4" width="16" height="38" rx="7" fill="#774a28"/>`).join("")}
      <ellipse cx="-6" cy="-6" rx="46" ry="30" fill="#8d5a32"/><circle cx="14" cy="-24" r="20" fill="#8d5a32"/>
      <circle cx="22" cy="-50" r="9" fill="#8d5a32"/><circle cx="52" cy="-50" r="9" fill="#8d5a32"/><circle cx="22" cy="-50" r="4.5" fill="#c9925a"/><circle cx="52" cy="-50" r="4.5" fill="#c9925a"/>
      <circle cx="37" cy="-30" r="23" fill="#8d5a32"/><ellipse cx="37" cy="-20" rx="12" ry="9" fill="#d9a46c"/>
      <ellipse cx="37" cy="-24" rx="5" ry="3.8" fill="${DUNKEL}"/><path d="M37 -20 V-16 M32 -15 Q37 -11 42 -15" stroke="${DUNKEL}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="29" cy="-35" r="3" fill="${DUNKEL}"/><circle cx="45" cy="-35" r="3" fill="${DUNKEL}"/>`,
    snake: () => {
      const d = "M-58 34 C-44 50 -20 50 -14 36 C-8 22 14 20 22 34 C30 48 54 46 54 28 C54 12 40 0 36 -18";
      return `<path d="${d}" stroke="#45a845" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="${d}" stroke="#8bd36b" stroke-width="6" fill="none" stroke-dasharray="4 11" stroke-linecap="round"/>
      <path d="M48 -27 L58 -24 M58 -24 L63 -29 M58 -24 L62 -18" stroke="#e63946" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="36" cy="-28" rx="16" ry="12" transform="rotate(-10 36 -28)" fill="#45a845"/>
      <circle cx="32" cy="-33" r="4.5" fill="#ffffff"/><circle cx="43" cy="-35" r="4.5" fill="#ffffff"/><circle cx="33" cy="-33" r="2.4" fill="${DUNKEL}"/><circle cx="44" cy="-35" r="2.4" fill="${DUNKEL}"/>
      <path d="M38 -22 Q44 -20 49 -24" stroke="#2f7a2f" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    },
    penguin: () => `<ellipse cx="-12" cy="47" rx="11" ry="5" fill="#f5a623"/><ellipse cx="12" cy="47" rx="11" ry="5" fill="#f5a623"/>
      <ellipse cx="-27" cy="6" rx="8" ry="22" transform="rotate(22 -27 6)" fill="#3a3f4a"/><ellipse cx="27" cy="6" rx="8" ry="22" transform="rotate(-22 27 6)" fill="#3a3f4a"/>
      <ellipse cx="0" cy="6" rx="27" ry="40" fill="#3a3f4a"/><ellipse cx="0" cy="14" rx="19" ry="31" fill="#ffffff"/>
      <circle cx="0" cy="-36" r="21" fill="#3a3f4a"/><ellipse cx="-7" cy="-36" rx="7" ry="8.5" fill="#ffffff"/><ellipse cx="7" cy="-36" rx="7" ry="8.5" fill="#ffffff"/>
      <circle cx="-6" cy="-36" r="3" fill="${DUNKEL}"/><circle cx="6" cy="-36" r="3" fill="${DUNKEL}"/>
      <path d="M-6 -28 L6 -28 L0 -19 Z" fill="#f5a623"/><circle cx="-14" cy="-26" r="3" fill="#ef9a9a" opacity="0.7"/><circle cx="14" cy="-26" r="3" fill="#ef9a9a" opacity="0.7"/>`,
    crocodile: () => `<path d="M-38 -6 Q-66 -6 -86 8 Q-62 12 -38 12 Z" fill="#4f9a43"/>
      <rect x="-30" y="4" width="13" height="18" rx="5" fill="#3c7d33"/><rect x="16" y="4" width="13" height="18" rx="5" fill="#3c7d33"/>
      <ellipse cx="-4" cy="0" rx="44" ry="15" fill="#4f9a43"/><ellipse cx="-4" cy="9" rx="36" ry="5" fill="#a8d468"/>
      ${[-36, -26, -16, -6, 4, 14, -48, -58, -68].map((x) => { const top = x < -40 ? -6 + (x + 40) * -0.02 : -halb(-4, 44, 15, x); return `<path d="M${x - 4} ${f1(top + 2)} L${x} ${f1(top - 6)} L${x + 4} ${f1(top + 2)} Z" fill="#3c7d33"/>`; }).join("")}
      <path d="M28 -10 L84 -6 Q90 -2 86 2 L28 4 Z" fill="#4f9a43"/><path d="M28 4 L84 4 Q88 8 82 10 L28 12 Z" fill="#63ad55"/>
      ${[40, 50, 60, 70].map((x) => `<path d="M${x} 3 l3 4 l3 -4 Z" fill="#ffffff"/>`).join("")}
      <ellipse cx="32" cy="-4" rx="15" ry="12" fill="#4f9a43"/>
      <circle cx="34" cy="-15" r="8" fill="#4f9a43"/><circle cx="35" cy="-16" r="5" fill="#ffffff"/><circle cx="36" cy="-16" r="2.6" fill="${DUNKEL}"/>
      <circle cx="82" cy="-6" r="2" fill="#2f6a29"/>`,
    hippo: () => `<ellipse cx="-30" cy="6" rx="40" ry="24" fill="#8f86a6"/>
      <ellipse cx="2" cy="-40" rx="6" ry="8" fill="#8f86a6"/><ellipse cx="36" cy="-40" rx="6" ry="8" fill="#8f86a6"/><ellipse cx="2" cy="-40" rx="3" ry="4.5" fill="#e9a5b8"/><ellipse cx="36" cy="-40" rx="3" ry="4.5" fill="#e9a5b8"/>
      <ellipse cx="19" cy="-16" rx="30" ry="24" fill="#9d94b4"/>
      <circle cx="8" cy="-30" r="7" fill="#9d94b4"/><circle cx="30" cy="-30" r="7" fill="#9d94b4"/><circle cx="8" cy="-31" r="3.2" fill="${DUNKEL}"/><circle cx="30" cy="-31" r="3.2" fill="${DUNKEL}"/>
      <ellipse cx="19" cy="4" rx="34" ry="19" fill="#b2a8c6"/>
      <ellipse cx="7" cy="-4" rx="4.5" ry="3.2" fill="#6d6485"/><ellipse cx="31" cy="-4" rx="4.5" ry="3.2" fill="#6d6485"/>
      <path d="M2 12 Q19 18 36 12" stroke="#6d6485" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M-74 20 Q-62 12 -50 18 T-26 18 T-2 18 T22 18 T46 18 T70 18 Q80 30 62 40 Q0 48 -62 40 Q-82 30 -74 20 Z" fill="#7fcdf2"/>
      ${wellen(-60, 50, 30)}`,
    parrot: () => `<path d="M-4 22 L-20 70 L-8 68 Z" fill="#3a7bd5"/><path d="M2 24 L-8 74 L4 70 Z" fill="#ffd23f"/><path d="M6 22 L4 68 L14 62 Z" fill="#e63946"/>
      <rect x="-44" y="32" width="88" height="9" rx="4.5" fill="#8a5a35"/><ellipse cx="-42" cy="30" rx="10" ry="5" transform="rotate(-25 -42 30)" fill="#4caf50"/><ellipse cx="44" cy="31" rx="10" ry="5" transform="rotate(25 44 31)" fill="#4caf50"/>
      <ellipse cx="0" cy="2" rx="21" ry="30" transform="rotate(-8)" fill="#e63946"/>
      <path d="M-16 -12 Q-30 18 -10 40 Q6 18 0 -8 Z" fill="#3a7bd5"/><path d="M-16 -12 Q-24 6 -18 18 Q-6 6 -6 -10 Z" fill="#ffd23f"/>
      <ellipse cx="-4" cy="33" rx="5" ry="4" fill="#6f7682"/><ellipse cx="8" cy="33" rx="5" ry="4" fill="#6f7682"/>
      <circle cx="6" cy="-34" r="18" fill="#e63946"/><ellipse cx="13" cy="-36" rx="8" ry="7" fill="#ffffff"/><circle cx="14" cy="-36" r="3" fill="${DUNKEL}"/>
      <path d="M20 -42 Q38 -42 35 -20 Q31 -27 22 -27 Z" fill="#f1e6cf"/><path d="M22 -28 Q30 -25 27 -19 Q22 -20 21 -25 Z" fill="${DUNKEL}"/>`,
    kangaroo: () => `<path d="M-8 18 Q-40 38 -76 50 Q-40 50 -4 34 Z" fill="#b5793f"/>
      <ellipse cx="8" cy="51" rx="26" ry="6" fill="#b5793f"/><ellipse cx="-4" cy="26" rx="18" ry="23" fill="#c98b4f"/>
      <ellipse cx="6" cy="-8" rx="22" ry="36" transform="rotate(12 6 -8)" fill="#c98b4f"/><ellipse cx="13" cy="0" rx="13" ry="24" transform="rotate(12 13 0)" fill="#e3b07a"/>
      <ellipse cx="11" cy="-14" rx="3" ry="7" transform="rotate(-15 11 -14)" fill="#c98b4f"/><ellipse cx="17" cy="-15" rx="3" ry="7" transform="rotate(10 17 -15)" fill="#c98b4f"/><circle cx="15" cy="-4" r="8.5" fill="#c98b4f"/><ellipse cx="21" cy="-2" rx="5" ry="4" fill="#c98b4f"/><circle cx="16" cy="-6" r="1.9" fill="${DUNKEL}"/><circle cx="25" cy="-3" r="1.7" fill="${DUNKEL}"/>
      <path d="M0 2 Q2 28 16 28 Q31 28 31 2 Q16 10 0 2 Z" fill="#e3b07a" stroke="#b5793f" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M22 -28 Q34 -20 34 -8" stroke="#b5793f" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="13" cy="-74" rx="5" ry="13" transform="rotate(-15 13 -74)" fill="#c98b4f"/><ellipse cx="23" cy="-75" rx="5" ry="13" transform="rotate(12 23 -75)" fill="#c98b4f"/>
      <ellipse cx="13" cy="-73" rx="2.4" ry="8" transform="rotate(-15 13 -73)" fill="#e3b07a"/><ellipse cx="23" cy="-74" rx="2.4" ry="8" transform="rotate(12 23 -74)" fill="#e3b07a"/>
      <ellipse cx="20" cy="-52" rx="15" ry="13" fill="#c98b4f"/><ellipse cx="33" cy="-47" rx="11" ry="7" fill="#c98b4f"/><circle cx="42" cy="-49" r="3" fill="${DUNKEL}"/><circle cx="23" cy="-56" r="2.8" fill="${DUNKEL}"/>`,
  });

  // =========================================================================
  // Der Zoo (1000 × 560)
  // =========================================================================
  A.HINTERGRUND.zoo = () => `<rect width="1000" height="560" fill="url(#himmel)"/>
    ${wolke(330, 64, 0.9)}${wolke(560, 104, 0.7)}${wolke(740, 58, 0.6)}
    <path d="M0 214 Q150 186 320 208 T660 200 T1000 210 L1000 560 L0 560 Z" fill="#e6d68e"/>
    ${akazie(200, 214, 0.8)}${akazie(700, 204, 0.7)}${akazie(880, 212, 0.9)}
    <path d="M0 268 Q250 246 520 266 T1000 258 L1000 560 L0 560 Z" fill="#a8d468"/>
    <path d="M330 560 Q350 470 430 400 Q470 360 560 350 L640 350 Q520 372 480 420 Q420 480 440 560 Z" fill="#ecdcb4"/>
    ${fels(790, 298, 170, 52)}
    <rect x="931" y="254" width="8" height="52" rx="3" fill="#8a5a35"/><ellipse cx="935" cy="306" rx="20" ry="5" fill="#8a5a35" opacity="0.4"/>
    <rect x="578" y="150" width="20" height="160" rx="8" fill="#8a5a35"/><circle cx="548" cy="150" r="24" fill="#43a047"/><circle cx="580" cy="132" r="34" fill="#4caf50"/><circle cx="630" cy="126" r="28" fill="#5cbf5c"/>
    ${fels(80, 448, 150, 70)}
    ${zaun(10, 360, 330, 0.9)}${zaun(690, 990, 334, 0.9)}
    <ellipse cx="615" cy="484" rx="210" ry="66" fill="#9aa0ab"/><ellipse cx="615" cy="482" rx="196" ry="56" fill="#5bb8e6"/><ellipse cx="615" cy="486" rx="176" ry="44" fill="#7fcdf2"/>
    ${wellen(500, 590, 520)}${wellen(700, 760, 462)}
    ${busch(380, 330, 0.7)}${busch(980, 420, 0.8)}${busch(30, 540, 0.8)}`;

  A.ORTE.zoo = {
    giraffe: [92, 214, 0.9, [56, -122]],
    zebra: [250, 254, 1.0, [62, -62]],
    elephant: [430, 252, 1.05, [62, -52]],
    monkey: [620, 236, 0.95, [36, -70]],
    lion: [790, 228, 1.0, [62, -58]],
    parrot: [935, 222, 0.9, [30, -46]],
    bear: [110, 402, 1.0, [56, -54]],
    kangaroo: [290, 390, 0.95, [40, -80]],
    crocodile: [520, 432, 0.95, [80, -20]],
    snake: [205, 492, 0.9, [50, -36]],
    penguin: [390, 500, 0.9, [24, -52]],
    hippo: [675, 482, 1.0, [52, -40]],
    tiger: [880, 478, 1.0, [56, -52]],
  };

  Object.assign(A.STICKER, {
    lion: [0.42, 12], tiger: [0.4, 10], elephant: [0.4, 6], giraffe: [0.28, 18], monkey: [0.42, 14], zebra: [0.42, 12],
    bear: [0.46, 8], snake: [0.46, -4], penguin: [0.5, 2], crocodile: [0.37, 0], hippo: [0.44, 2], parrot: [0.44, -10], kangaroo: [0.4, 16],
  });

  A.AUFNAEHER_BILD.zoo = "elephant";
  A.AUFNAEHER_FARBE.zoo = "#cf9a2e";

  // =========================================================================
  // Die Geschichte «Hello, elephant!» (vier Bilder, je 472 × 204)
  // =========================================================================
  const zooBild = (becken) => `<rect width="472" height="204" fill="#cdeefb"/>
    <path d="M0 132 Q120 116 240 128 T472 122 L472 204 L0 204 Z" fill="#e6d68e"/>
    <path d="M0 156 Q120 142 240 152 T472 148 L472 204 L0 204 Z" fill="#a8d468"/>
    ${becken ? `<ellipse cx="${becken}" cy="184" rx="140" ry="22" fill="#9aa0ab"/><ellipse cx="${becken}" cy="183" rx="130" ry="17" fill="#5bb8e6"/><ellipse cx="${becken}" cy="185" rx="114" ry="12" fill="#7fcdf2"/>` : ""}`;
  // Rocco winkt: wie «steh», aber der linke Arm ist hoch und nach aussen
  const roccoWinkt = (laune = "froh") => A.rocco("wink", laune);
  A.GESCHICHTEN_BILDER.elephant = [
    () => `${zooBild()}${zaun(250, 470, 168, 0.7)}${busch(446, 166, 0.5)}
      <rect x="74" y="24" width="18" height="156" rx="7" fill="#8a5a35"/><circle cx="44" cy="24" r="28" fill="#43a047"/><circle cx="94" cy="10" r="30" fill="#4caf50"/><circle cx="140" cy="16" r="22" fill="#5cbf5c"/>
      ${tb('data-wort="monkey"', `<g transform="translate(152 106) scale(0.95)">${A.DING.monkey()}</g>`)}
      ${tb('data-wort="raccoon"', `<g transform="translate(330 196) scale(0.95)">${roccoWinkt()}</g>`)}
      <path d="M274 96 q-8 10 -2 22 M263 89 q-13 14 -4 34" stroke="#5d6882" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    () => `${zooBild()}${zaun(250, 470, 170, 0.7)}${busch(60, 160, 0.6)}
      ${tb('data-wort="giraffe"', `<g transform="translate(300 106) scale(0.78)">${A.DING.giraffe()}</g>`)}
      <g transform="translate(196 196) scale(0.6)">${A.rocco("steh", "hoch")}</g>`,
    () => `${zooBild(320)}${zaun(170, 470, 160, 0.7)}
      ${[[290, 182], [326, 178], [356, 186]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${4 + i}" fill="none" stroke="#ffffff" stroke-width="2"/>`).join("")}
      ${tb('data-wort="raccoon"', `<g transform="translate(110 196) scale(0.95)">${A.rocco("steh", "hoch")}</g>`)}
      ${frage(178, 56, 22)}`,
    () => `${zooBild(320)}
      ${tb('data-wort="elephant"', `<g transform="translate(330 140) scale(-1.0 1.0)">${A.DING.elephant("spritz")}</g>`)}
      ${[[236, 46, 6], [210, 40, 5], [186, 52, 6], [222, 66, 4], [196, 72, 5], [170, 66, 4], [250, 30, 5], [146, 60, 5], [128, 48, 4]].map(([x, y, r]) => tropfen(x, y, r)).join("")}
      ${[[262, 184, 6], [400, 186, 6], [276, 172, 4], [388, 172, 5]].map(([x, y, r]) => tropfen(x, y, r)).join("")}
      ${tb('data-wort="raccoon"', `<g transform="translate(96 196) scale(0.95)">${A.rocco("jubel", "freude")}</g>`)}
      ${herz(166, 26)}`,
  ];
  A.TITELBILD.elephant = 3;
})();

// Englischecke, Welt beach (für englisch-art-2.js)
(() => {
  const A = window.LernappEnglischArt;
  if (!A) return;
  const { tb, wolke, FARBE } = A.hilfen;
  const { DUNKEL } = FARBE;
  const f = (n) => n.toFixed(1);
  const SAND = "#f6dca6", SAND_NASS = "#e4c184";

  Object.assign(A.DING, {
    shell: () => {
      const H = 30, P = (a, r) => `${f(r * Math.cos(a * Math.PI / 180))},${f(H + r * Math.sin(a * Math.PI / 180))}`;
      const w = [200, 228, 256, 284, 312, 340];
      const rand = w.slice(1).map((a, k) => `Q${P((w[k] + a) / 2, 84)} ${P(a, 68)}`).join(" ");
      return `<path d="M-14 ${H - 4} L-20 42 L20 42 L14 ${H - 4} Z" fill="#ef7f9b"/>
        <path d="M0 ${H} L${P(200, 68)} ${rand} Z" fill="#f9a8b8"/>
        <path d="${w.slice(1, 5).map((a) => `M0 ${H} L${P(a, 62)}`).join(" ")}" stroke="#ec86a0" stroke-width="4" stroke-linecap="round"/>`;
    },
    crab: () => `<path d="M-28 8 l-24 8 M-30 16 l-22 16 M-24 22 l-14 20 M28 8 l24 8 M30 16 l22 16 M24 22 l14 20" stroke="#d0402c" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M-26 -4 Q-42 -10 -46 -26 M26 -4 Q42 -10 46 -26" stroke="#d0402c" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M-46 -22 Q-66 -26 -64 -46 Q-62 -58 -50 -58 L-48 -44 L-38 -54 Q-30 -44 -34 -32 Q-38 -22 -46 -22 Z" fill="#e8543f"/>
      <path d="M46 -22 Q66 -26 64 -46 Q62 -58 50 -58 L48 -44 L38 -54 Q30 -44 34 -32 Q38 -22 46 -22 Z" fill="#e8543f"/>
      <path d="M-10 -12 V-26 M10 -12 V-26" stroke="#d0402c" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="0" cy="8" rx="36" ry="24" fill="#e8543f"/><ellipse cx="0" cy="18" rx="24" ry="10" fill="#f0735f"/>
      <circle cx="-10" cy="-29" r="7.5" fill="#ffffff"/><circle cx="10" cy="-29" r="7.5" fill="#ffffff"/>
      <circle cx="-9" cy="-28" r="3.6" fill="${DUNKEL}"/><circle cx="11" cy="-28" r="3.6" fill="${DUNKEL}"/>
      <path d="M-9 8 Q0 16 9 8" stroke="${DUNKEL}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
    fish: () => `<path d="M-58 44 q10 -9 20 0 t20 0 M4 44 q10 -9 20 0" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="-40" cy="24" r="4.5" fill="#ffffff"/><circle cx="-52" cy="14" r="3.2" fill="#ffffff"/><circle cx="-26" cy="32" r="3" fill="#ffffff"/>
      <g transform="rotate(-30)">
        <path d="M-30 2 L-60 -20 Q-54 2 -60 24 Z" fill="#ff8c1a"/><path d="M-10 -16 Q4 -38 24 -16 Z" fill="#ff8c1a"/>
        <ellipse cx="4" cy="2" rx="38" ry="21" fill="#ffb02e"/>
        <path d="M-12 -16 Q-4 2 -12 20 M2 -18 Q10 2 2 22" stroke="#ff8c1a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M6 10 Q16 14 18 24 Q8 22 6 10 Z" fill="#ff8c1a"/>
        <circle cx="26" cy="-4" r="6" fill="#ffffff"/><circle cx="27.5" cy="-4" r="3.2" fill="${DUNKEL}"/>
        <path d="M41 6 q-5 4 -10 1" stroke="${DUNKEL}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      </g>`,
    boat: () => `<rect x="-3" y="-80" width="6" height="102" rx="3" fill="#8a5a35"/>
      <path d="M3 -80 L24 -73 L3 -66 Z" fill="#e8543f"/>
      <path d="M8 -70 Q30 -30 60 12 L8 12 Z" fill="#ffffff"/><path d="M8 -26 L36 -26 Q44 -14 51 0 L8 0 Z" fill="#3a7bd5"/>
      <path d="M-8 -58 Q-26 -26 -46 12 L-8 12 Z" fill="#ffd166"/>
      <path d="M-66 18 L66 18 L50 46 Q0 52 -48 46 Z" fill="#e8543f"/><rect x="-66" y="16" width="132" height="8" rx="4" fill="#ffffff"/>
      <circle cx="-24" cy="34" r="4.5" fill="#ffffff"/><circle cx="0" cy="35" r="4.5" fill="#ffffff"/><circle cx="24" cy="34" r="4.5" fill="#ffffff"/>`,
    wave: () => `<path d="M16 -16 C24 -32 50 -34 58 -20 L58 6 C56 24 60 36 66 44 L44 44 C16 30 6 4 16 -16 Z" fill="#8ed6f4"/>
      <path d="M-92 44 C-62 38 -46 -30 2 -48 C44 -62 82 -36 76 -8 C72 10 48 12 42 -4 C38 -18 50 -26 60 -18 C52 -36 26 -36 16 -16 C6 4 16 30 44 44 Z" fill="#1f7fc4"/>
      <path d="M-66 44 C-46 36 -32 -4 -2 -24 C-8 4 0 30 20 44 Z" fill="#3a9ee0"/>
      <path d="M-50 -14 C-30 -42 0 -54 30 -52 C58 -50 78 -32 76 -8 C70 -28 48 -40 26 -40 C2 -40 -24 -30 -50 -14 Z" fill="#ffffff"/>
      <circle cx="62" cy="-18" r="6" fill="#ffffff"/><circle cx="-56" cy="-14" r="5" fill="#ffffff"/><circle cx="-66" cy="-4" r="3.5" fill="#ffffff"/>
      <path d="M-90 44 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    hat: () => `<ellipse cx="0" cy="14" rx="66" ry="21" fill="#e2b456"/><ellipse cx="0" cy="11" rx="58" ry="15" fill="#f1cd78"/>
      <path d="M-32 12 Q-34 -40 0 -40 Q34 -40 32 12 Z" fill="#f6da8c"/>
      <path d="M-26 -22 Q0 -28 26 -22 M-30 -10 Q0 -16 30 -10" stroke="#e4bd62" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M-32 -2 Q0 6 32 -2 L32 10 Q0 18 -32 10 Z" fill="#e8543f"/>
      <circle cx="20" cy="5" r="8" fill="#ffffff"/><circle cx="20" cy="5" r="3.5" fill="#ffd23f"/>`,
    icecream: () => `<path d="M-25 -4 L25 -4 L2 61 Q0 65 -2 61 Z" fill="#e3a55a"/>
      <path d="M-24 -2 L15 20 M-17 16 L9 38 M-10 34 L3 46 M24 -2 L-15 20 M17 16 L-9 38 M10 34 L-3 46" stroke="#c4843c" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M-30 -2 Q-34 -32 0 -34 Q34 -32 30 -2 q-6 8 -12 0 q-6 10 -12 0 q-6 8 -12 0 q-6 10 -12 0 q-6 8 -12 0 Z" fill="#f79cc0"/>
      <circle cx="0" cy="-42" r="21" fill="#8fdfbf"/><circle cx="-8" cy="-50" r="5" fill="#c4f2df"/><circle cx="-14" cy="-18" r="5" fill="#fbc4da"/>
      <path d="M5 -66 Q8 -76 16 -78" stroke="#4caf50" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="4" cy="-62" r="7.5" fill="#e63946"/>`,
    bucket: () => `<path d="M-38 -32 Q0 -92 38 -32" stroke="#1d5fae" stroke-width="4" fill="none"/>
      <ellipse cx="0" cy="-32" rx="40" ry="9" fill="#d9a85c" stroke="#2a6fc0" stroke-width="5"/>
      <g transform="rotate(22 0 -32)"><rect x="-4" y="-96" width="8" height="66" rx="3" fill="#ffd23f"/><rect x="-14" y="-102" width="28" height="10" rx="5" fill="#ffd23f"/></g>
      <path d="M-40 -32 A40 9 0 0 0 40 -32 L31 40 Q0 47 -31 40 Z" fill="#3a8fe0"/>
      <path d="M-40 -32 A40 9 0 0 0 40 -32" stroke="#2a6fc0" stroke-width="5" fill="none"/>
      <path d="M0 -6 l5 10 l11 1 l-8 7 l3 11 l-11 -6 l-11 6 l3 -11 l-8 -7 l11 -1 Z" fill="#ffffff"/>`,
    umbrella: () => {
      const xs = [-86, -52, -17, 17, 52, 86];
      return `<g transform="rotate(-10)"><rect x="-3.5" y="-90" width="7" height="164" rx="3.5" fill="#8a5a35"/>
        <path d="M-86 -36 C-84 -98 84 -98 86 -36 Z" fill="#e8543f"/>
        ${xs.slice(0, 5).map((x, i) => `<path d="M0 -82 L${x} -36 Q${(x + xs[i + 1]) / 2} -24 ${xs[i + 1]} -36 Z" fill="${i % 2 ? "#ffffff" : "#e8543f"}"/>`).join("")}
        <circle cx="0" cy="-84" r="6" fill="#ffd166"/></g>
        <ellipse cx="13" cy="72" rx="26" ry="6" fill="#e4c184"/>`;
    },
    starfish: () => {
      const p = Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, r = i % 2 ? 19 : 44; return `${f(r * Math.cos(a))},${f(r * Math.sin(a) + 4)}`; }).join(" ");
      const punkte = [0, 1, 2, 3, 4].map((k) => { const a = (Math.PI * 2 / 5) * k - Math.PI / 2; return [16, 29].map((d) => `<circle cx="${f(d * Math.cos(a))}" cy="${f(d * Math.sin(a) + 4)}" r="${d > 20 ? 3 : 4}" fill="#ffc28f"/>`).join(""); }).join("");
      return `<polygon points="${p}" fill="#ff8a3d" stroke="#ff8a3d" stroke-width="12" stroke-linejoin="round"/>${punkte}<circle cx="0" cy="4" r="5" fill="#ffc28f"/>`;
    },
    sandcastle: () => `<rect x="-66" y="-14" width="132" height="60" rx="4" fill="#e7b45e"/>
      <path d="M-70 -46 h10 v-8 h8 v8 h8 v-8 h8 v8 h2 V46 h-36 Z" fill="#e7b45e"/><path d="M70 -46 h-10 v-8 h-8 v8 h-8 v-8 h-8 v8 h-2 V46 h36 Z" fill="#e7b45e"/>
      <path d="M-24 -68 h10 v-8 h8 v8 h12 v-8 h8 v8 h10 V46 h-48 Z" fill="#efc272"/>
      <rect x="52" y="-46" width="18" height="92" fill="#d9a24c"/><rect x="12" y="-68" width="12" height="114" fill="#e2ad5a"/>
      <path d="M-12 46 V28 Q0 12 12 28 V46 Z" fill="#a8743f"/>
      <rect x="-6" y="-48" width="12" height="16" rx="6" fill="#a8743f"/><rect x="-57" y="-28" width="10" height="13" rx="5" fill="#a8743f"/><rect x="47" y="-28" width="10" height="13" rx="5" fill="#a8743f"/>
      <path d="M0 -76 V-98" stroke="${DUNKEL}" stroke-width="3" stroke-linecap="round"/><path d="M1 -98 L22 -92 L1 -85 Z" fill="#e8543f"/>
      <path d="M-66 46 H66" stroke="#d9a24c" stroke-width="4" stroke-linecap="round"/>`,
    seagull: () => `<path d="M-6 -2 Q-26 -34 -62 -26 Q-34 -18 -16 8 Z" fill="#c9d1db"/><path d="M-62 -26 Q-52 -30 -42 -29 L-50 -20 Z" fill="#4f5560"/>
      <path d="M-30 2 L-48 -6 L-46 12 Z" fill="#ffffff"/>
      <ellipse cx="-2" cy="4" rx="32" ry="13" fill="#ffffff"/><circle cx="26" cy="-4" r="12" fill="#ffffff"/>
      <path d="M36 -6 L52 -1 L36 3 Z" fill="#ffb703"/><circle cx="29" cy="-7" r="2.6" fill="${DUNKEL}"/>
      <path d="M2 0 Q16 -38 52 -40 Q30 -24 18 8 Z" fill="#dfe5ec"/><path d="M52 -40 Q44 -34 40 -30 L46 -26 Z" fill="#4f5560"/>`,
    sunglasses: () => `<path d="M-54 -12 L-64 -24 M54 -12 L64 -24" stroke="#ef476f" stroke-width="6" stroke-linecap="round"/>
      <path d="M-10 -8 Q0 -18 10 -8" stroke="#ef476f" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="-60" y="-24" width="54" height="44" rx="18" fill="#ef476f"/><rect x="6" y="-24" width="54" height="44" rx="18" fill="#ef476f"/>
      <rect x="-54" y="-18" width="42" height="32" rx="13" fill="${DUNKEL}"/><rect x="12" y="-18" width="42" height="32" rx="13" fill="${DUNKEL}"/>
      <path d="M-46 -8 L-34 -12 M20 -8 L32 -12" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`,
  });

  // Hintergrund: Himmel, Meer mit Horizont, Sandstrand vorne
  const tuch = (x, y, w) => `<g transform="rotate(-5 ${x} ${y})"><rect x="${x - w / 2}" y="${y - 34}" width="${w}" height="68" rx="8" fill="#ffffff"/>
    ${[0, 2, 4].map((k) => `<rect x="${x - w / 2 + k * w / 6}" y="${y - 34}" width="${w / 6}" height="68" rx="${k ? 0 : 8}" fill="#4fc3c7"/>`).join("")}</g>`;
  A.HINTERGRUND.beach = () => `<rect width="1000" height="560" fill="url(#himmel)"/>
    ${wolke(400, 64, 0.95)}${wolke(760, 150, 0.7)}${wolke(110, 150, 0.6)}
    <rect y="226" width="1000" height="150" fill="#45a8e0"/><rect y="226" width="1000" height="10" fill="#2f8fd0"/>
    <path d="M0 300 Q125 290 250 300 T500 300 T750 300 T1000 298 V376 H0 Z" fill="#5cbde9"/>
    ${[[90, 256], [330, 248], [560, 262], [860, 252], [130, 320], [470, 330], [930, 322]].map(([x, y]) => `<path d="M${x} ${y} h26" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`).join("")}
    <path d="M0 352 Q90 340 190 350 T400 348 T620 352 T820 346 T1000 350 V376 H0 Z" fill="#8fdaf3"/>
    <path d="M0 366 Q120 350 250 362 T520 358 T780 364 T1000 356 L1000 560 L0 560 Z" fill="${SAND_NASS}"/>
    <path d="M0 384 Q130 370 260 382 T540 378 T800 384 T1000 376 L1000 560 L0 560 Z" fill="${SAND}"/>
    <path d="M0 366 Q120 350 250 362 T520 358 T780 364 T1000 356" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${tuch(800, 508, 180)}
    ${[[60, 520], [300, 548], [470, 410], [620, 548], [940, 548], [180, 404]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="#e6c48a"/>`).join("")}`;

  A.ORTE.beach = {
    seagull: [580, 128, 1.0, [48, -36]],
    boat: [200, 272, 1.05, [56, -78]],
    fish: [420, 268, 1.0, [40, -46]],
    wave: [690, 300, 1.0, [70, -48]],
    umbrella: [890, 386, 1.0, [74, -84]],
    sandcastle: [520, 432, 1.0, [62, -92]],
    bucket: [672, 470, 0.85, [36, -92]],
    crab: [380, 470, 0.95, [58, -54]],
    starfish: [250, 420, 0.85, [40, -40]],
    icecream: [94, 446, 1.0, [26, -66]],
    hat: [230, 516, 0.95, [58, -34]],
    shell: [586, 518, 0.72, [58, -40]],
    sunglasses: [800, 506, 1.0, [58, -22]],
  };

  Object.assign(A.STICKER, {
    shell: [0.44, 2], crab: [0.42, 6], fish: [0.42, 0], boat: [0.34, 16], wave: [0.32, 4], hat: [0.42, 6], icecream: [0.42, 4],
    bucket: [0.38, 20], umbrella: [0.33, 8], starfish: [0.56, -4], sandcastle: [0.34, 26], seagull: [0.46, 12], sunglasses: [0.46, 2],
  });
  A.AUFNAEHER_BILD.beach = "icecream";
  A.AUFNAEHER_FARBE.beach = "#17b3ac";

  // Die Bildgeschichte «The big wave.»
  const strand = (nass = false) => `<rect width="472" height="204" fill="#cdeefb"/>${wolke(84, 34, 0.45)}${wolke(360, 24, 0.35)}
    <rect y="92" width="472" height="56" fill="#45a8e0"/><rect y="92" width="472" height="6" fill="#2f8fd0"/>
    <path d="M0 126 Q60 120 120 126 T240 126 T360 126 T472 124 V150 H0 Z" fill="#7fd3f0"/>
    <path d="M0 144 Q80 134 170 142 T340 140 T472 138 L472 204 L0 204 Z" fill="${nass ? SAND_NASS : SAND}"/>
    <path d="M0 144 Q80 134 170 142 T340 140 T472 138" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const herz = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 c-6 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -4 -18 -10 -8z" fill="#ef6fa8"/>`;
  const at = (x, y, s, inhalt) => `<g transform="translate(${x} ${y}) scale(${s})">${inhalt}</g>`;
  const schaufel = (x, y) => `<g transform="translate(${x} ${y}) rotate(-20)"><rect x="-2.5" y="-4" width="5" height="26" rx="2" fill="#ffd23f"/><path d="M-9 20 h18 l-3 12 q-6 5 -12 0 Z" fill="#ffd23f"/></g>`;
  A.GESCHICHTEN_BILDER.wave = [
    () => `${strand()}${tb('data-wort="raccoon"', at(130, 192, 0.9, A.rocco("steh", "froh")))}${schaufel(152, 152)}
      ${tb('data-wort="sandcastle"', at(290, 166, 0.6, A.DING.sandcastle()))}
      ${at(392, 176, 0.42, A.DING.bucket())}`,
    () => `${strand()}${at(110, 192, 0.9, A.rocco("wirf", "freude"))}
      ${at(250, 166, 0.6, A.DING.sandcastle())}
      ${tb('data-wort="crab"', at(370, 172, 0.62, A.DING.crab()))}
      ${herz(190, 52, 0.8)}`,
    () => `${strand()}${at(84, 192, 0.9, A.rocco("jubel", "traurig"))}
      ${at(200, 166, 0.6, A.DING.sandcastle())}
      ${tb('data-wort="wave"', at(350, 128, 1.38, A.DING.wave()))}
      <circle cx="250" cy="70" r="5" fill="#ffffff"/><circle cx="236" cy="88" r="3.5" fill="#ffffff"/><circle cx="262" cy="52" r="3" fill="#ffffff"/>
      <g transform="translate(150 48)"><circle r="18" fill="#ffffff" stroke="#c3c7cf" stroke-width="2"/><rect x="-3.5" y="-11" width="7" height="14" rx="3.5" fill="#e8543f"/><circle cy="8" r="3.8" fill="#e8543f"/></g>`,
    () => `${strand(true)}<ellipse cx="428" cy="186" rx="34" ry="6" fill="#9fd9f0"/><ellipse cx="36" cy="174" rx="22" ry="4.5" fill="#9fd9f0"/>
      ${at(110, 192, 0.9, A.rocco("jubel", "freude"))}
      ${tb('data-wort="sandcastle"', at(240, 172, 0.42, A.DING.sandcastle()))}
      ${tb('data-wort="crab"', at(340, 176, 0.55, A.DING.crab()))}
      ${herz(196, 50, 0.8)}${herz(300, 66, 0.6)}`,
  ];
  A.TITELBILD.wave = 2;
})();
