/*
 * rechnen-art.js – Was die Rechenecke zeichnet.
 *
 *   wagenAussen(stand)   der Rechenwagen auf dem zweiten Abstellgleis, für
 *                        das Startbild (220 × 150 wie der Lesewagen)
 *   zimmer(stand)        der Wagen von innen (1000 × 560): jedes Ding, das
 *                        etwas tut, ist ein <g> mit data-ort – dort hängt
 *                        train-rechenecke.js den Tipp an
 *   drache(d)            der Rechendrache in seinem Leben und seiner Stufe;
 *                        jede Stufe eine Zacke, in Fünfer-Farben
 *   schatz(n)            seine Taler: immer zehn zu einem Turm, die einzelnen
 *                        in Reihen zu fünf
 *   karte(m)             die Missionskarte über ihm
 *   LOK, wagen, fensterWagen, kopf, tunnel …   Teile der Spiele
 *
 * Gezeichnet wird als SVG-Text, der in ein <svg> kommt (svg(text) macht
 * daraus ein Element). Die Tiere sind die der App (train-art.js,
 * driverHead), damit im Fenster dieselben Gesichter schauen wie auf der Lok.
 *
 * Die Fünfer-Farben gelten überall gleich: die ersten fünf rot, die
 * nächsten fünf blau, dann gelb – an den Wagen, an den Zacken, an den
 * Wimpeln. Wer sie kennt, sieht die 7 als «fünf und zwei».
 */
(() => {
  "use strict";

  const C = {
    rot: "#e8543f", blau: "#3d7be0", gelb: "#ffd166", gold: "#f4b400", goldDunkel: "#c98a00",
    lila: "#6c5ce7", lilaHell: "#8577f0", ink: "#243047", dunkel: "#2f3a52", grau: "#9aa3b5",
    wand: "#fff1cf", taefer: "#f3d9a4", boden: "#d9a46c", bodenLinie: "#c48f58", holz: "#b07a45", holzDunkel: "#8a5a35",
    glas: "#cdeefa", gruen: "#6fbf5a", gruenDunkel: "#4f9e3c",
  };
  const fuenfer = (i) => (i < 5 ? C.rot : i < 10 ? C.blau : C.gelb);
  const FONT = "font-family=\"'Baloo 2', Nunito, ui-rounded, system-ui, sans-serif\" font-weight=\"800\"";
  const f1 = (n) => (Math.round(n * 10) / 10).toString();

  // Aus SVG-Text ein Element. Ein <template> parst <svg> richtig im
  // SVG-Namensraum.
  function svg(text) {
    const tpl = document.createElement("template");
    tpl.innerHTML = text.trim();
    return tpl.content.firstElementChild;
  }

  // ---------------------------------------------------------------------------
  // Tiere: die Köpfe der App, als Text
  // ---------------------------------------------------------------------------
  const kopfCache = new Map();
  const TIERE = ["fox", "bear", "rabbit", "cat", "panda", "frog", "owl", "penguin", "lion", "mouse"];
  function kopf(id, cx, cy, r) {
    const key = `${id}|${r}`;
    if (!kopfCache.has(key)) {
      let text = `<circle r="${r}" fill="#e8763a"/>`;
      try {
        const node = window.LernappTrainArt?.driverHead?.(id, r);
        if (node) text = new XMLSerializer().serializeToString(node).replace(/\sxmlns="[^"]*"/g, "");
      } catch { /* dann eben ein Kreis */ }
      kopfCache.set(key, text);
    }
    return `<g transform="translate(${f1(cx)} ${f1(cy)})">${kopfCache.get(key)}</g>`;
  }

  // ---------------------------------------------------------------------------
  // Lok und Wagen der Spiele. Ursprung unten links, auf der Schiene.
  // ---------------------------------------------------------------------------
  const LOK = `
    <rect x="2" y="-84" width="46" height="10" rx="5" fill="${C.dunkel}"/>
    <rect x="6" y="-76" width="38" height="58" rx="6" fill="${C.lila}"/>
    <rect x="13" y="-68" width="24" height="18" rx="4" fill="${C.glas}"/>
    <rect x="40" y="-58" width="62" height="40" rx="12" fill="${C.lilaHell}"/>
    <rect x="40" y="-58" width="62" height="10" rx="5" fill="${C.ink}" fill-opacity="0.12"/>
    <rect x="80" y="-80" width="14" height="24" rx="3" fill="${C.dunkel}"/>
    <rect x="76" y="-85" width="22" height="7" rx="3" fill="${C.dunkel}"/>
    <circle cx="64" cy="-58" r="6" fill="${C.gelb}"/>
    <circle cx="102" cy="-42" r="4" fill="#fff6c2"/>
    <rect x="100" y="-28" width="8" height="9" rx="2" fill="${C.dunkel}"/>
    <circle cx="24" cy="-12" r="12" fill="${C.dunkel}"/><circle cx="24" cy="-12" r="4" fill="#c9d1df"/>
    <circle cx="62" cy="-9" r="9" fill="${C.dunkel}"/><circle cx="62" cy="-9" r="3" fill="#c9d1df"/>
    <circle cx="88" cy="-9" r="9" fill="${C.dunkel}"/><circle cx="88" cy="-9" r="3" fill="#c9d1df"/>`;
  const LOK_W = 108;
  function lok(k = 1, gespiegelt = false) {
    return gespiegelt
      ? `<g transform="translate(${f1(LOK_W * k)} 0) scale(${-k} ${k})">${LOK}</g>`
      : `<g transform="scale(${k})">${LOK}</g>`;
  }
  // Ein Wagen, 58 breit. data-bx/data-by: wo die Zahl über ihm steht.
  const WAGEN_W = 58;
  function wagenBasis(fill, inhalt = "") {
    return `
      <rect x="-6" y="-31" width="6" height="5" fill="${C.dunkel}"/>
      <rect class="wb" x="0" y="-56" width="58" height="42" rx="7" fill="${fill}"/>
      <rect x="0" y="-56" width="58" height="9" rx="4" fill="${C.ink}" fill-opacity="0.18"/>
      <rect x="6" y="-42" width="46" height="12" rx="4" fill="#ffffff" fill-opacity="0.3"/>
      ${inhalt}
      <circle cx="15" cy="-9" r="9" fill="${C.dunkel}"/><circle cx="15" cy="-9" r="3" fill="#c9d1df"/>
      <circle cx="43" cy="-9" r="9" fill="${C.dunkel}"/><circle cx="43" cy="-9" r="3" fill="#c9d1df"/>`;
  }
  function wagen(lx, fill, k = 1, i = 0, inhalt = "") {
    return `<g class="rw-wagen" data-i="${i}" data-bx="${f1(lx + 29 * k)}" data-by="${f1(-56 * k)}"><g transform="translate(${f1(lx)} 0) scale(${k})">${wagenBasis(fill, inhalt)}</g></g>`;
  }
  // Ein Schild mit einer Zahl, über einem Zug.
  function schild(x, y, text, farbe = C.ink) {
    const w = Math.max(52, 22 + String(text).length * 20);
    return `<g class="rw-schild"><rect x="${f1(x - w / 2)}" y="${y - 24}" width="${w}" height="46" rx="12" fill="#ffffff" stroke="${C.ink}" stroke-opacity="0.2" stroke-width="2"/><text x="${f1(x)}" y="${y + 12}" text-anchor="middle" font-size="34" ${FONT} fill="${farbe}">${text}</text></g>`;
  }
  // Die Zahl über einem Ding, wenn gezählt wird.
  function zahlMarke(x, y, n, r = 15) {
    return `<g class="rw-marke"><circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="#ffffff" stroke="${C.lila}" stroke-width="3"/><text x="${f1(x)}" y="${f1(y + r * 0.4)}" text-anchor="middle" font-size="${Math.round(r * 1.2)}" ${FONT} fill="${C.ink}">${n}</text></g>`;
  }

  // Ein Wagen mit einer oder zwei Reihen zu fünf Fenstern (das Zehnerfeld).
  // Gefüllt wird von links oben, Reihe für Reihe. Ursprung unten links.
  //   tiere   die Kennungen der Tiere in den Fenstern, der Reihe nach
  function fensterWagen(n, reihen, W, tiere = TIERE, start = 0) {
    const pad = 18, gap = 10, cols = 5;
    const win = (W - 2 * pad - (cols - 1) * gap) / cols;
    const wh = win * 0.9;
    const H = pad * 2 + reihen * wh + (reihen - 1) * gap;
    const oben = -H - 26;
    let s = `<rect x="10" y="${f1(oben - 12)}" width="${W - 20}" height="16" rx="8" fill="${C.dunkel}"/>
      <rect x="0" y="${f1(oben)}" width="${W}" height="${f1(H)}" rx="16" fill="${C.gelb}"/>
      <rect x="0" y="${f1(oben + H - 12)}" width="${W}" height="12" rx="6" fill="#e0a92e"/>`;
    const plaetze = [];
    for (let r = 0; r < reihen; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const idx = r * cols + c;
        const x = pad + c * (win + gap);
        const y = oben + pad + r * (wh + gap);
        s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(win)}" height="${f1(wh)}" rx="8" fill="${C.glas}"/>`;
        if (idx < n) {
          s += kopf(tiere[(start + idx) % tiere.length], x + win / 2, y + wh * 0.58, win * 0.26);
          plaetze.push({ x: x + win - 8, y: y + 6, mx: x + win / 2, my: y + wh / 2 });
        }
      }
    }
    [0.17, 0.31, 0.69, 0.83].forEach((q) => { s += `<circle cx="${f1(W * q)}" cy="-14" r="14" fill="${C.dunkel}"/><circle cx="${f1(W * q)}" cy="-14" r="5" fill="#c9d1df"/>`; });
    return { svg: s, plaetze, hoehe: H + 38 };
  }

  // Ein Personenwagen mit Fenstern nebeneinander, für Einsteigen bitte!
  //   plaetze  so viele Fenster; sitzen: die Tiere darin (Kennungen)
  //   beschlagen  die Fenster sind beschlagen – man sieht niemanden
  function personenWagen(plaetze, sitzen = [], { beschlagen = false, W = 560 } = {}) {
    const pad = 16, gap = 8;
    const win = (W - 2 * pad - (plaetze - 1) * gap) / plaetze;
    const wh = Math.min(70, win * 0.95);
    const H = wh + 36;
    const oben = -H - 26;
    let s = `<rect x="8" y="${f1(oben - 12)}" width="${W - 16}" height="16" rx="8" fill="${C.dunkel}"/>
      <rect x="0" y="${f1(oben)}" width="${W}" height="${f1(H)}" rx="14" fill="${C.blau}"/>
      <rect x="0" y="${f1(oben + H - 10)}" width="${W}" height="10" rx="5" fill="#2f63bd"/>`;
    const orte = [];
    for (let i = 0; i < plaetze; i += 1) {
      const x = pad + i * (win + gap);
      const y = oben + 14;
      s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(win)}" height="${f1(wh)}" rx="8" fill="${C.glas}"/>`;
      orte.push({ x: x + win / 2, y: y + wh * 0.58, r: Math.min(win, wh) * 0.3, top: y });
      if (sitzen[i] && !beschlagen) s += kopf(sitzen[i], x + win / 2, y + wh * 0.58, Math.min(win, wh) * 0.3);
      if (beschlagen) s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(win)}" height="${f1(wh)}" rx="8" fill="#ffffff" fill-opacity="0.82"/><path d="M${f1(x + 8)} ${f1(y + wh * 0.4)} q${f1(win * 0.2)} -8 ${f1(win * 0.4)} 0" stroke="${C.glas}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    [0.15, 0.3, 0.7, 0.85].forEach((q) => { s += `<circle cx="${f1(W * q)}" cy="-14" r="14" fill="${C.dunkel}"/><circle cx="${f1(W * q)}" cy="-14" r="5" fill="#c9d1df"/>`; });
    return { svg: s, orte, hoehe: H + 38 };
  }

  // Der Spielzeugtunnel: ein grüner Berg, links das Tor.
  function tunnelBerg(x0 = 410, boden = 448) {
    return `<path d="M${x0} ${boden} L${x0} ${boden - 108} Q${x0 + 4} ${boden - 186} ${x0 + 76} ${boden - 200} Q${x0 + 146} ${boden - 266} ${x0 + 240} ${boden - 234} Q${x0 + 320} ${boden - 290} ${x0 + 418} ${boden - 242} Q${x0 + 496} ${boden - 252} ${x0 + 540} ${boden - 186} Q${x0 + 582} ${boden - 144} ${x0 + 582} ${boden} Z" fill="${C.gruen}"/>
      <path d="M${x0 + 60} ${boden - 196} q8 -14 16 0 M${x0 + 230} ${boden - 234} q8 -14 16 0 M${x0 + 410} ${boden - 242} q8 -14 16 0 M${x0 + 520} ${boden - 186} q7 -12 14 0" stroke="${C.gruenDunkel}" stroke-width="4" fill="none"/>
      <circle cx="${x0 + 150}" cy="${boden - 148}" r="20" fill="#5aa848"/><circle cx="${x0 + 350}" cy="${boden - 168}" r="26" fill="#5aa848"/><circle cx="${x0 + 470}" cy="${boden - 108}" r="18" fill="#5aa848"/>
      <path d="M${x0 + 4} ${boden} V${boden - 66} Q${x0 + 4} ${boden - 112} ${x0 + 52} ${boden - 112} Q${x0 + 100} ${boden - 112} ${x0 + 100} ${boden - 66} V${boden} Z" fill="#2b3346"/>
      <path d="M${x0 + 4} ${boden - 66} Q${x0 + 4} ${boden - 112} ${x0 + 52} ${boden - 112} Q${x0 + 100} ${boden - 112} ${x0 + 100} ${boden - 66}" stroke="${C.grau}" stroke-width="8" fill="none"/>
      <rect x="${x0 + 274}" y="${boden - 298}" width="4" height="40" fill="#5d6882"/><path d="M${x0 + 278} ${boden - 298} L${x0 + 306} ${boden - 288} L${x0 + 278} ${boden - 278} Z" fill="${C.rot}"/>`;
  }

  // Ein Würfel von vorn, mit Augen. Ursprung oben links, Seite w.
  const AUGEN = {
    1: [[0.5, 0.5]], 2: [[0.27, 0.27], [0.73, 0.73]], 3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.27, 0.22], [0.73, 0.22], [0.27, 0.5], [0.73, 0.5], [0.27, 0.78], [0.73, 0.78]],
  };
  function wuerfel(x, y, w, n, farbe = C.rot, auge = "#ffffff") {
    const p = AUGEN[n] || [];
    return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(w)}" rx="${f1(w * 0.18)}" fill="${farbe}"/>${p.map(([a, b]) => `<circle cx="${f1(x + a * w)}" cy="${f1(y + b * w)}" r="${f1(w * 0.09)}" fill="${auge}"/>`).join("")}`;
  }

  // Wand, Täfer und Boden eines Spiels – der Rechenwagen von innen, ohne Dinge.
  //   spur  wo die Schiene liegt (oder null)
  function raum(spur = 448) {
    let s = `
      <rect x="0" y="0" width="1000" height="300" fill="${C.wand}"/>
      <rect x="0" y="250" width="1000" height="50" fill="${C.taefer}"/>
      <rect x="0" y="250" width="1000" height="4" fill="#e2c389"/>
      <rect x="0" y="300" width="1000" height="260" fill="${C.boden}"/>
      <path d="M0 350 H1000 M0 400 H1000 M0 500 H1000" stroke="${C.bodenLinie}" stroke-width="2"/>
      <path d="M0 0 H1000 V22 Q500 36 0 22 Z" fill="${C.holzDunkel}"/>`;
    if (spur !== null) {
      s += `<rect x="0" y="${spur}" width="1000" height="6" fill="#8b95a8"/>`;
      for (let x = 6; x < 1000; x += 30) s += `<rect x="${x}" y="${spur + 6}" width="16" height="8" rx="2" fill="#9b6b3f"/>`;
    }
    return s;
  }

  // Der Blick aus dem grossen Fenster (Blitzblick): Himmel, Hügel, Gleis.
  function fensterBlick() {
    return `
      <rect x="0" y="0" width="1000" height="560" fill="${C.wand}"/>
      <rect x="0" y="476" width="1000" height="84" fill="${C.taefer}"/>
      <rect x="40" y="24" width="920" height="440" rx="34" fill="${C.blau}"/>
      <g clip-path="url(#rw-gross)">
        <rect x="60" y="44" width="880" height="400" fill="url(#rw-himmel)"/>
        <circle cx="830" cy="104" r="34" fill="#ffe27a"/>
        <path d="M150 110 q20 -24 46 -8 q24 -18 44 4 q22 2 18 18 h-118 q-10 -12 10 -14 Z" fill="#ffffff" fill-opacity="0.9"/>
        <path d="M60 320 Q200 262 340 306 T620 290 T940 300 V444 H60 Z" fill="#9ed27f"/>
        <path d="M60 368 Q260 330 460 362 T940 354 V444 H60 Z" fill="#7cc05e"/>
        <rect x="60" y="404" width="880" height="6" fill="#8b95a8"/>
        ${Array.from({ length: 30 }, (_, i) => `<rect x="${66 + i * 30}" y="410" width="16" height="8" rx="2" fill="#9b6b3f"/>`).join("")}
        <g class="rw-fensterzug"></g>
      </g>
      <rect x="28" y="458" width="944" height="18" rx="7" fill="${C.holz}"/>`;
  }

  const DEFS = `<defs>
    <linearGradient id="rw-himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8ddf0"/><stop offset="1" stop-color="#e6f5fa"/></linearGradient>
    <filter id="rw-schatten" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="${C.ink}" flood-opacity="0.22"/></filter>
    <clipPath id="rw-fl"><rect x="72" y="94" width="206" height="116" rx="10"/></clipPath>
    <clipPath id="rw-fr"><rect x="724" y="94" width="206" height="116" rx="10"/></clipPath>
    <clipPath id="rw-gross"><rect x="60" y="44" width="880" height="400" rx="20"/></clipPath>
  </defs>`;

  // ---------------------------------------------------------------------------
  // Der Rechendrache
  // ---------------------------------------------------------------------------
  // Drei Leben, je mit eigenen Farben und eigenen Überraschungen. Die Zacken
  // auf dem Rücken zählen die Stufe: die ersten fünf rot, dann blau, dann gelb.
  const LEBEN = {
    baby: { koerper: "#46b98a", dunkel: "#2f8f69", bauch: "#fde7a6", streifen: "#f1cf72", fluegel: "#8e7cf0", schnauze: "#5fcb9d", horn: C.gelb },
    lok: { koerper: "#5b8def", dunkel: "#3b67c4", bauch: "#ffe3b3", streifen: "#f5c97a", fluegel: "#e8543f", schnauze: "#7aa6f5", horn: "#f4b400" },
    stern: { koerper: "#5a4bb5", dunkel: "#3d3290", bauch: "#e3dcff", streifen: "#c6bbff", fluegel: "#ffd166", schnauze: "#7466cf", horn: "#ffe27a" },
  };
  // Was bei welcher Stufe dazukommt (eine Überraschung etwa jede zweite).
  const UEBERRASCHUNG = {
    2: "fluegel", 4: "hoerner", 6: "schal", 8: "gross", 10: "besonders", 12: "funkeln", 14: "krone",
  };
  const BESONDERS = { baby: "Blumenkranz", lok: "Lokführermütze", stern: "Sternenstab" };
  function dracheKopf(p, extras = {}) {
    const hoerner = extras.hoerner ? `<path d="M-36 -144 Q-42 -166 -28 -172 Q-26 -156 -21 -146 Z" fill="${p.horn}"/>
      <path d="M-6 -141 Q-2 -162 11 -164 Q4 -151 4 -139 Z" fill="${p.horn}"/>` : `<circle cx="-30" cy="-146" r="5" fill="${p.horn}"/><circle cx="-2" cy="-144" r="5" fill="${p.horn}"/>`;
    return `${hoerner}
      <circle cx="-26" cy="-110" r="38" fill="${p.koerper}"/>
      <ellipse cx="-52" cy="-97" rx="25" ry="18" fill="${p.schnauze}"/>
      <circle cx="-66" cy="-101" r="2.8" fill="${p.dunkel}"/><circle cx="-56" cy="-104" r="2.8" fill="${p.dunkel}"/>
      <g class="rw-augen"><ellipse cx="-35" cy="-121" rx="10" ry="12" fill="#ffffff"/><ellipse cx="-11" cy="-119" rx="9" ry="11" fill="#ffffff"/>
      <circle cx="-38" cy="-119" r="5.5" fill="${C.ink}"/><circle cx="-14" cy="-117" r="5" fill="${C.ink}"/>
      <circle cx="-36" cy="-122" r="2" fill="#ffffff"/><circle cx="-12" cy="-120" r="1.8" fill="#ffffff"/></g>
      <circle cx="-12" cy="-94" r="6" fill="#ff8fa3" fill-opacity="0.6"/>
      <path d="M-66 -88 Q-52 -79 -38 -88" stroke="${p.dunkel}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  // Was ein Drache bei dieser Stufe trägt.
  function extrasVon(stufe) {
    const e = {};
    Object.entries(UEBERRASCHUNG).forEach(([s, was]) => { if (stufe >= Number(s)) e[was] = true; });
    return e;
  }
  //   d  { leben: "baby"|"lok"|"stern" oder 0..2, stufe: 1..15, ei: true (noch nicht geschlüpft) }
  function drache(d = {}) {
    const lebenId = typeof d.leben === "number" ? ["baby", "lok", "stern"][d.leben] || "baby" : (d.leben || "baby");
    const p = LEBEN[lebenId] || LEBEN.baby;
    const stufe = Math.max(1, Math.min(15, Math.round(Number(d.stufe) || 1)));
    if (d.ei) {
      return `<g class="rw-ei"><ellipse cx="0" cy="-4" rx="46" ry="9" fill="${C.ink}" fill-opacity="0.12"/>
        <ellipse cx="0" cy="-58" rx="44" ry="56" fill="#fff7e0"/>
        <path d="M-40 -66 q12 10 22 0 t22 0 t22 0 t18 2" stroke="${p.koerper}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <circle cx="-16" cy="-86" r="7" fill="${p.fluegel}" fill-opacity="0.7"/><circle cx="18" cy="-40" r="9" fill="${p.koerper}" fill-opacity="0.6"/><circle cx="20" cy="-92" r="5" fill="${C.gelb}"/></g>`;
    }
    const x = extrasVon(stufe);
    const gross = 0.82 + 0.18 * ((stufe - 1) / 14);
    let zacken = "";
    for (let i = 0; i < stufe; i += 1) {
      const th = (-80 + i * (120 / 14)) * Math.PI / 180;
      const nx = Math.cos(th), ny = Math.sin(th);
      const cx = 6 + 54 * nx, cy = -50 + 48 * ny;
      const tx = cx + nx * 17, ty = cy + ny * 17;
      const px = -ny * 6, py = nx * 6;
      zacken += `<path d="M${f1(cx + px)} ${f1(cy + py)} L${f1(tx)} ${f1(ty)} L${f1(cx - px)} ${f1(cy - py)} Z" fill="${fuenfer(i)}" stroke="${C.ink}" stroke-opacity="0.18" stroke-width="1"/>`;
    }
    const fluegel = x.fluegel
      ? `<path class="rw-fluegel" d="M30 -88 Q72 -132 94 -98 Q80 -98 76 -86 Q66 -94 58 -80 Q48 -88 32 -72 Z" fill="${p.fluegel}"/>`
      : `<path d="M34 -84 Q52 -104 62 -88 Q50 -86 36 -74 Z" fill="${p.fluegel}"/>`;
    const schal = x.schal ? `<path d="M-60 -78 Q-26 -62 8 -76 L10 -66 Q-26 -50 -62 -68 Z" fill="${lebenId === "stern" ? C.gold : C.rot}"/><path d="M-6 -70 L4 -40 L-10 -42 Z" fill="${lebenId === "stern" ? C.gold : C.rot}"/>` : "";
    let besonders = "";
    if (x.besonders && lebenId === "baby") besonders = `<g>${[-50, -36, -22, -8, 6].map((cx, i) => `<circle cx="${cx}" cy="${-146 + Math.abs(i - 2) * 3}" r="6" fill="${["#ef6fa8", "#ffd166", "#ffffff", "#ffd166", "#ef6fa8"][i]}"/>`).join("")}</g>`;
    if (x.besonders && lebenId === "lok") besonders = `<path d="M-58 -136 Q-26 -164 8 -138 L8 -128 L-58 -126 Z" fill="${C.blau}"/><path d="M-58 -132 H8" stroke="#ffffff" stroke-width="3"/><rect x="-64" y="-130" width="34" height="7" rx="3" fill="#2f63bd"/>`;
    if (x.besonders && lebenId === "stern") besonders = `<path d="M-74 -74 L-92 -26" stroke="${C.holzDunkel}" stroke-width="4" stroke-linecap="round"/><path d="M-74 -86 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1 Z" fill="${C.gelb}"/>`;
    const krone = x.krone ? `<path d="M-48 -146 L-44 -164 L-34 -152 L-26 -168 L-18 -152 L-8 -164 L-4 -146 Z" fill="${C.gold}" stroke="${C.goldDunkel}" stroke-width="2"/>` : "";
    const funkeln = x.funkeln ? `<g class="rw-funkeln"><path d="M70 -150 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="${C.gelb}"/><path d="M-96 -120 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="${C.gelb}"/></g>` : "";
    let lokSachen = "";
    if (lebenId === "lok") lokSachen = `<g class="rw-dampf"><circle cx="-84" cy="-112" r="8" fill="#ffffff" fill-opacity="0.85"/><circle cx="-98" cy="-126" r="6" fill="#ffffff" fill-opacity="0.6"/></g>`;
    let sterne = "";
    if (lebenId === "stern") sterne = `<g fill="#ffe27a">${[[24, -40], [36, -66], [12, -18], [-8, -30], [42, -30]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="3"/>`).join("")}</g>`;
    return `<g class="rw-drache" transform="scale(${f1(gross * 100) / 100})">
      <ellipse cx="0" cy="0" rx="70" ry="9" fill="${C.ink}" fill-opacity="0.1"/>
      ${fluegel}
      <path d="M34 -16 Q94 -4 106 -44" stroke="${p.koerper}" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M98 -50 L124 -68 L114 -38 Z" fill="${lebenId === "stern" ? C.gelb : p.horn}"/>
      ${zacken}
      <ellipse cx="6" cy="-50" rx="56" ry="50" fill="${p.koerper}"/>
      <ellipse cx="-8" cy="-44" rx="34" ry="36" fill="${p.bauch}"/>
      <path d="M-30 -60 Q-8 -52 14 -60 M-34 -44 Q-8 -36 18 -44 M-30 -28 Q-8 -20 14 -28" stroke="${p.streifen}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${sterne}
      <ellipse cx="-42" cy="-54" rx="9" ry="15" fill="${p.dunkel}" transform="rotate(32 -42 -54)"/>
      <ellipse cx="-24" cy="-4" rx="19" ry="9" fill="${p.dunkel}"/><ellipse cx="30" cy="-4" rx="19" ry="9" fill="${p.dunkel}"/>
      <circle cx="-38" cy="-4" r="2.5" fill="#ffffff"/><circle cx="-31" cy="-1" r="2.5" fill="#ffffff"/>
      ${dracheKopf(p, x)}${schal}${besonders}${krone}${funkeln}${lokSachen}
    </g>`;
  }
  // Nur der Kopf, für die Sprechblase der Spiele und das Fenster draussen.
  function dracheNurKopf(leben = "baby") {
    const p = LEBEN[leben] || LEBEN.baby;
    return dracheKopf(p, { hoerner: true });
  }

  // Der Schatz: immer zehn Taler zu einem Turm, die einzelnen in Reihen zu
  // fünf. Ab hundert steht eine Truhe da (für jedes Hundert eine).
  //   x0, y0  wo der Haufen liegt (die Mitte der vordersten Turmreihe, unten)
  function schatz(n, x0 = 630, y0 = 386) {
    const truhen = Math.floor(n / 100);
    const tuerme = Math.floor((n % 100) / 10);
    const einzeln = n % 10;
    let s = `<ellipse cx="${x0 + 30}" cy="${y0 + 6}" rx="56" ry="8" fill="${C.ink}" fill-opacity="0.12"/>`;
    for (let t = 0; t < truhen; t += 1) {
      const tx = x0 - 40 - t * 14, ty = y0 - 4 - t * 6;
      s += `<rect x="${tx - 20}" y="${ty - 26}" width="40" height="26" rx="5" fill="${C.holzDunkel}"/><path d="M${tx - 20} ${ty - 26} Q${tx} ${ty - 42} ${tx + 20} ${ty - 26} Z" fill="${C.holz}"/><rect x="${tx - 4}" y="${ty - 22}" width="8" height="10" rx="2" fill="${C.gold}"/>`;
    }
    const orte = [];
    for (let t = 0; t < tuerme; t += 1) orte.push({ row: Math.floor(t / 3), col: t % 3 });
    orte.sort((a, b) => b.row - a.row);
    for (const { row, col } of orte) {
      const x = x0 + col * 25 + (row % 2) * 12;
      const base = y0 - row * 11;
      for (let c = 0; c < 10; c += 1) {
        const y = base - c * 4.4;
        s += `<ellipse cx="${x}" cy="${f1(y + 2)}" rx="11.5" ry="4" fill="${C.goldDunkel}"/><ellipse cx="${x}" cy="${f1(y)}" rx="11.5" ry="4" fill="${C.gold}"/>`;
      }
      s += `<ellipse cx="${x}" cy="${f1(base - 39.6)}" rx="6" ry="1.6" fill="#ffe08a"/>`;
    }
    for (let e = 0; e < einzeln; e += 1) {
      const x = x0 - 2 + (e % 5) * 15;
      const y = y0 + 18 + Math.floor(e / 5) * 10;
      s += `<ellipse class="rw-taler" cx="${x}" cy="${f1(y + 1.6)}" rx="6.5" ry="3.2" fill="${C.goldDunkel}"/><ellipse cx="${x}" cy="${y}" rx="6.5" ry="3.2" fill="${C.gold}"/>`;
    }
    return s;
  }

  // Die Missionskarte: was der Drache vorschlägt, und die Leiste bis zur
  // nächsten Zacke – fünf Felder, eine Hand voll.
  //   m  { name, bild, zu, hat, braucht, neuAb, naechsteFarbe, fertig }
  function karte(m) {
    if (!m) return "";
    let felder = "";
    const n = Math.max(0, Number(m.braucht) || 0);
    const breite = n > 5 ? 20 : 30;
    for (let i = 0; i < n; i += 1) {
      const x = 380 + i * breite;
      const voll = i < (m.hat || 0);
      const neu = voll && i >= (m.neuAb ?? Infinity);
      felder += voll
        ? `<circle class="${neu ? "rw-feld-neu" : ""}" cx="${x}" cy="140" r="${n > 5 ? 8 : 10}" fill="${C.gold}" stroke="${C.goldDunkel}" stroke-width="2"/>`
        : `<circle cx="${x}" cy="140" r="${n > 5 ? 8 : 10}" fill="#ffffff" stroke="#d6cfa8" stroke-width="2" stroke-dasharray="4 3"/>`;
    }
    if (n > 0) {
      const zx = 380 + n * breite + 6;
      felder += n === 5
        ? `<path d="M${zx - 9} 150 L${zx} 126 L${zx + 9} 150 Z" fill="${m.naechsteFarbe || C.rot}"/>`
        : `<g transform="translate(${zx} 140)"><rect x="-11" y="-9" width="22" height="18" rx="3" fill="${C.rot}"/><rect x="-2" y="-9" width="4" height="18" fill="${C.gelb}"/><path d="M-8 -9 Q-4 -18 0 -9 Q4 -18 8 -9" stroke="${C.gelb}" stroke-width="3" fill="none"/></g>`;
    }
    const schloss = m.zu ? `<g transform="translate(612 72)"><circle r="16" fill="${C.gelb}" stroke="#b8860b" stroke-width="3"/><path d="M-6 -3 v-4 a6 6 0 0 1 12 0 v4" fill="none" stroke="#5b3a29" stroke-width="3"/><rect x="-8" y="-3" width="16" height="12" rx="3" fill="#5b3a29"/></g>` : "";
    return `
      <g filter="url(#rw-schatten)"><rect x="356" y="66" width="288" height="98" rx="18" fill="#ffffff"/><path d="M488 163 L498 178 L508 163 Z" fill="#ffffff"/></g>
      <text x="378" y="92" font-size="15" font-weight="700" fill="#5d6882" font-family="Nunito, sans-serif">${m.wer || "Dein Drache"} schlägt vor:</text>
      <text x="378" y="120" font-size="25" ${FONT} fill="${C.ink}">${m.name}</text>
      <circle cx="612" cy="106" r="20" fill="#3fbf74"/><path d="M606 96 L622 106 L606 116 Z" fill="#ffffff"/>
      ${felder}${schloss}`;
  }

  // ---------------------------------------------------------------------------
  // Der Rechenwagen von aussen (Startbild), 220 × 150 wie der Lesewagen
  // ---------------------------------------------------------------------------
  const AUSSEN_W = 220;
  const AUSSEN_H = 150;
  function wagenAussen({ leben = 0, stufe = 1, ei = false, ausbau = 0 } = {}) {
    const lebenId = ["baby", "lok", "stern"][leben] || "baby";
    const p = LEBEN[lebenId];
    let schiene = "";
    for (let x = 6; x < 214; x += 16) schiene += `<rect x="${x}" y="130" width="9" height="10" rx="2" fill="#8d6e52"/>`;
    const rad = (cx) => `<g transform="translate(${cx} 124)"><circle r="9.5" fill="#3a3f4a"/><circle r="4" fill="#9aa3b2"/></g>`;
    let zahlen = "";
    for (let i = 0; i < 10; i += 1) zahlen += `<circle cx="${58 + i * 13.8}" cy="56" r="5.2" fill="${fuenfer(i)}"/><text x="${58 + i * 13.8}" y="58.6" text-anchor="middle" font-size="7" ${FONT} fill="#ffffff">${i + 1}</text>`;
    const fenster = (x) => `<rect x="${x}" y="66" width="30" height="26" rx="5" fill="${C.glas}" stroke="#2f63bd" stroke-width="3"/>`;
    const kopfImFenster = ei
      ? `<ellipse cx="120" cy="84" rx="9" ry="11" fill="#fff7e0"/><path d="M112 82 q4 3 8 0 t8 0" stroke="${p.koerper}" stroke-width="2" fill="none"/>`
      : `<g transform="translate(126 106) scale(0.3)">${dracheKopf(p, { hoerner: true })}</g>`;
    let lichter = "";
    if (ausbau >= 10) {
      for (let i = 0; i < 10; i += 1) {
        const t = (i + 0.5) / 10;
        const x = 40 + 160 * t;
        const y = 46 + 8 * Math.sin(t * Math.PI);
        lichter += `<circle class="rw-birne" cx="${f1(x)}" cy="${f1(y)}" r="2.6" fill="${fuenfer(i)}"/>`;
      }
    }
    return `<svg viewBox="0 0 ${AUSSEN_W} ${AUSSEN_H}" class="rechenwagen-svg" aria-hidden="true" focusable="false">
      ${schiene}
      <rect x="0" y="128" width="220" height="3.5" rx="1.5" fill="#6d7480"/>
      <rect x="0" y="135" width="220" height="3.5" rx="1.5" fill="#6d7480"/>
      <rect x="196" y="96" width="10" height="34" rx="2" fill="#5b3a29"/><rect x="192" y="92" width="22" height="12" rx="3" fill="${C.blau}"/><rect x="196" y="95" width="14" height="6" rx="2" fill="#ffffff"/>
      <rect x="20" y="110" width="168" height="10" rx="3" fill="#3a3f4a"/>
      ${rad(46)}${rad(162)}
      <rect x="24" y="44" width="160" height="70" rx="8" fill="${C.gelb}"/>
      ${[40, 64, 88, 112, 136, 160].map((x) => `<rect x="${x}" y="46" width="2" height="66" fill="#e0a92e" opacity="0.7"/>`).join("")}
      <path d="M16 48 Q104 18 192 48 L192 54 Q104 26 16 54 Z" fill="${C.blau}"/>
      ${zahlen}
      ${fenster(36)}${fenster(89)}${fenster(142)}
      ${kopfImFenster}
      <rect x="87" y="91" width="34" height="4" rx="2" fill="#2f63bd"/>
      <g transform="translate(104 103)"><rect x="-17" y="-7" width="34" height="14" rx="4" fill="#fff6e0" stroke="${C.blau}" stroke-width="2"/><text x="0" y="4" text-anchor="middle" font-size="10" ${FONT} fill="${C.rot}">1+2</text></g>
      <circle cx="200" cy="125" r="3" fill="#ef6fa8"/><circle cx="12" cy="126" r="3.5" fill="#f5a623"/>
      ${lichter}
    </svg>`;
  }

  // ---------------------------------------------------------------------------
  // Das Zimmer, 1000 × 560
  // ---------------------------------------------------------------------------
  //   orte     welche Dinge Spiele haben (nur die werden gezeichnet und sind
  //            Knöpfe): Menge der Ort-Kennungen
  //   drache   { leben, stufe, ei, neu, weg, knall } – wie er dasteht
  //   regal    so viele fertige Drachen auf dem Regal
  //   taler    der Schatz
  //   karte    die Missionskarte (siehe karte)
  //   ausbau   so viele Dinge der Einrichtung
  //   neuAb    ab welchem Ding der Einrichtung es neu ist (leuchtet)
  //   zu       Orte mit Schloss: Menge
  //   name     wie das Kind den Drachen getauft hat ("" = noch nicht)
  function zimmer({ orte = new Set(), drache: d = {}, regal = 0, taler = 0, karte: m = null, ausbau = 0, neuAb = Infinity, zu = new Set(), labels = {}, name = "" } = {}) {
    const ort = (id, label, inhalt, box) => {
      const [x, y, w, h] = box;
      const schloss = zu.has(id) ? `<g class="rw-schloss" transform="translate(${x + w - 18} ${y + 18})"><circle r="18" fill="${C.gelb}" stroke="#b8860b" stroke-width="3"/><path d="M-6 -3 v-4 a6 6 0 0 1 12 0 v4" fill="none" stroke="#5b3a29" stroke-width="3"/><rect x="-8" y="-3" width="16" height="12" rx="3" fill="#5b3a29"/></g>` : "";
      return `<g class="rechen-ort rechen-ort-${id}${zu.has(id) ? " is-locked" : ""}" data-ort="${id}" role="button" tabindex="0" aria-label="${labels[id] || label}"><g class="rechen-ort-bild">${inhalt}</g>${schloss}<rect class="rechen-hitbox" x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></g>`;
    };
    let s = `<svg viewBox="0 0 1000 560" class="rechenzimmer-svg" role="group" aria-label="Der Rechenwagen von innen">${DEFS}
      <rect x="0" y="0" width="1000" height="390" fill="${C.wand}"/>
      <rect x="0" y="334" width="1000" height="56" fill="${C.taefer}"/>
      <rect x="0" y="334" width="1000" height="4" fill="#e2c389"/>
      <rect x="0" y="390" width="1000" height="170" fill="${C.boden}"/>
      <path d="M0 430 H1000 M0 474 H1000 M0 520 H1000" stroke="${C.bodenLinie}" stroke-width="2"/>
      <path d="M150 390 V430 M420 390 V430 M690 390 V430 M300 430 V474 M560 430 V474 M860 430 V474 M90 474 V520 M470 474 V520 M780 474 V520" stroke="${C.bodenLinie}" stroke-width="2"/>
      <path d="M0 0 H1000 V22 Q500 36 0 22 Z" fill="${C.holzDunkel}"/>`;
    // Die Zahlenwimpel 1 bis 10 – sie hängen von Anfang an.
    s += `<path d="M20 26 Q500 48 980 26" stroke="${C.holzDunkel}" stroke-width="2" fill="none"/>`;
    for (let i = 1; i <= 10; i += 1) {
      const t = (i + 0.5) / 12, u = 1 - t;
      const x = u * u * 20 + 2 * u * t * 500 + t * t * 980;
      const y = u * u * 26 + 2 * u * t * 48 + t * t * 26;
      s += `<path d="M${f1(x - 16)} ${f1(y)} L${f1(x + 16)} ${f1(y)} L${f1(x)} ${f1(y + 30)} Z" fill="${fuenfer(i - 1)}"/><text x="${f1(x)}" y="${f1(y + 15)}" text-anchor="middle" font-size="14" ${FONT} fill="#ffffff">${i}</text>`;
    }
    s += einrichtung(ausbau, neuAb);

    // Die Tür in den Lesewagen – immer da.
    s += ort("tuer", "Die Tür in den Lesewagen", `
      <rect x="2" y="104" width="40" height="288" rx="8" fill="${C.holz}"/>
      <rect x="8" y="116" width="28" height="264" rx="5" fill="#c48f58"/>
      <circle cx="22" cy="160" r="11" fill="${C.glas}" stroke="${C.holzDunkel}" stroke-width="3"/>
      <g transform="translate(22 214)"><rect x="-11" y="-8" width="22" height="16" rx="2" fill="#2f6f8f"/><path d="M0 -6 L-8 -8 L-8 6 L0 8 Z M0 -6 L8 -8 L8 6 L0 8 Z" fill="#fff6e0"/></g>
      <circle cx="34" cy="262" r="4" fill="${C.gold}"/>`, [0, 100, 44, 296]);

    if (orte.has("zaehlrahmen")) {
      let perlen = "";
      for (let i = 0; i < 10; i += 1) perlen += `<circle cx="${66 + i * 12}" cy="284" r="5.8" fill="${fuenfer(i)}"/><circle cx="${66 + i * 12}" cy="324" r="5.8" fill="${fuenfer(i)}"/>`;
      s += ort("zaehlrahmen", "Der Zählrahmen", `
        <rect x="48" y="246" width="10" height="148" rx="4" fill="${C.holz}"/><rect x="184" y="246" width="10" height="148" rx="4" fill="${C.holz}"/>
        <rect x="44" y="240" width="154" height="12" rx="5" fill="${C.holzDunkel}"/><rect x="44" y="352" width="154" height="12" rx="5" fill="${C.holzDunkel}"/>
        <path d="M58 284 H184 M58 324 H184" stroke="${C.grau}" stroke-width="3"/>${perlen}
        <rect x="40" y="392" width="26" height="6" rx="3" fill="${C.holzDunkel}"/><rect x="176" y="392" width="26" height="6" rx="3" fill="${C.holzDunkel}"/>`, [40, 236, 162, 150]);
    }

    if (orte.has("fenster")) s += ort("fenster", "Das Fenster", fenster(72, "rw-fl", false), [48, 78, 252, 158]);

    if (orte.has("kiosk")) {
      let markise = "";
      for (let k = 0; k < 7; k += 1) {
        const farbe = k % 2 ? "#ffffff" : C.rot;
        markise += `<rect x="${206 + k * 22}" y="244" width="22" height="22" fill="${farbe}"/><circle cx="${217 + k * 22}" cy="266" r="11" fill="${farbe}"/>`;
      }
      s += ort("kiosk", "Der Kiosk", `
        <rect x="238" y="214" width="88" height="25" rx="8" fill="#ffffff" stroke="${C.rot}" stroke-width="2"/>
        <text x="282" y="233" text-anchor="middle" font-size="17" ${FONT} fill="${C.rot}">KIOSK</text>${markise}
        <rect x="214" y="270" width="6" height="36" fill="${C.holz}"/><rect x="344" y="270" width="6" height="36" fill="${C.holz}"/>
        <path d="M238 284 L258 284 L248 304 Z" fill="#e0a96d"/><circle cx="248" cy="280" r="10" fill="#ff8fa3"/>
        <circle cx="284" cy="295" r="9" fill="${C.rot}"/><path d="M284 286 q4 -6 8 -4" stroke="#3f8f3a" stroke-width="3" fill="none"/>
        <rect x="306" y="280" width="36" height="24" rx="4" fill="${C.lila}"/><rect x="310" y="284" width="28" height="8" rx="2" fill="${C.glas}"/>
        <rect x="210" y="304" width="144" height="88" rx="6" fill="${C.gelb}"/>
        <rect x="220" y="316" width="124" height="64" rx="6" fill="${C.gold}" fill-opacity="0.35"/>
        <text x="282" y="356" text-anchor="middle" font-size="20" ${FONT} fill="#9a6a00">3 Fr. · 1 Fr.</text>`, [204, 208, 158, 190]);
    }

    if (orte.has("uhr")) {
      s += ort("uhr", "Die Bahnhofsuhr", `<circle cx="326" cy="110" r="24" fill="#ffffff" stroke="${C.dunkel}" stroke-width="4"/>
        ${Array.from({ length: 12 }, (_, i) => `<rect x="325" y="90" width="2" height="5" fill="${C.dunkel}" transform="rotate(${i * 30} 326 110)"/>`).join("")}
        <path d="M326 110 V94 M326 110 H338" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/><circle cx="326" cy="110" r="3" fill="${C.rot}"/>`, [300, 84, 52, 52]);
    }

    if (m) s += ort("mission", `Die Missionskarte: ${m.name}. Antippen, und es geht los.`, karte(m), [354, 60, 296, 122]);

    // Das Regal mit den fertigen Drachen
    if (regal > 0) {
      s += `<g class="rw-regal"><rect x="840" y="186" width="120" height="8" rx="3" fill="${C.holzDunkel}"/>`;
      for (let i = 0; i < Math.min(2, regal); i += 1) s += `<g transform="translate(${870 + i * 52} 186) scale(0.26)">${drache({ leben: i, stufe: 15 })}</g>`;
      s += `</g>`;
    }

    const dracheBild = `<g class="rw-platz${d.neu ? " is-neu" : ""}${d.weg ? " is-weg" : ""}"><g transform="translate(496 378)">${drache(d)}</g></g>${d.knall ? knall(496, 300) : ""}`;
    s += ort("drache", labels.drache || "Der Rechendrache", `
      <ellipse cx="500" cy="402" rx="120" ry="12" fill="${C.ink}" fill-opacity="0.12"/>
      <ellipse cx="500" cy="380" rx="112" ry="24" fill="${C.lila}"/>
      <ellipse cx="500" cy="372" rx="98" ry="14" fill="${C.lilaHell}"/>
      <circle cx="392" cy="384" r="6" fill="${C.gelb}"/><circle cx="608" cy="384" r="6" fill="${C.gelb}"/>
      ${dracheBild}`, [386, 196, 228, 206]);

    // Das Namensschild vor dem Kissen: ein Tipp, und das Kind tauft den Drachen.
    const schildText = name ? (name.length > 9 ? `${name.slice(0, 8)}…` : name) : "?";
    s += ort("name", name ? `Das Schild: Dein Drache heisst ${name}` : "Das Schild: Hier bekommt dein Drache einen Namen", `
      <rect x="428" y="430" width="6" height="26" fill="${C.holzDunkel}"/>
      <rect x="398" y="404" width="66" height="30" rx="7" fill="#f6e3b4" stroke="${C.holzDunkel}" stroke-width="3"/>
      <text x="431" y="${name ? 425 : 427}" text-anchor="middle" font-size="${name ? (schildText.length > 6 ? 12 : 15) : 20}" ${FONT} fill="${C.ink}">${schildText.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`, [394, 404, 72, 54]);

    s += ort("schatz", "Der Schatz", `<g class="rw-schatz">${schatz(taler)}</g>`, [600, 320, 108, 90]);

    if (orte.has("waage")) {
      s += ort("waage", "Die Waage", `
        <rect x="714" y="344" width="92" height="10" rx="4" fill="${C.holz}"/>
        <rect x="720" y="354" width="7" height="44" fill="${C.holzDunkel}"/><rect x="793" y="354" width="7" height="44" fill="${C.holzDunkel}"/>
        <rect x="756" y="300" width="8" height="44" fill="${C.holzDunkel}"/><rect x="744" y="338" width="32" height="7" rx="3" fill="${C.holzDunkel}"/>
        <path d="M724 306 L796 298" stroke="${C.holzDunkel}" stroke-width="5" stroke-linecap="round"/><circle cx="760" cy="302" r="5" fill="${C.gold}"/>
        <path d="M724 306 L712 330 M724 306 L736 330 M796 298 L784 322 M796 298 L808 322" stroke="${C.grau}" stroke-width="1.5"/>
        <path d="M706 330 Q724 344 742 330 Z" fill="#c9d1df"/><path d="M778 322 Q796 336 814 322 Z" fill="#c9d1df"/>
        <circle cx="716" cy="325" r="5" fill="${C.rot}"/><circle cx="726" cy="325" r="5" fill="${C.rot}"/><circle cx="721" cy="317" r="5" fill="${C.rot}"/>
        <circle cx="791" cy="317" r="5" fill="${C.blau}"/><circle cx="801" cy="317" r="5" fill="${C.blau}"/>`, [702, 288, 108, 112]);
    }

    if (orte.has("perron")) s += ort("perron", "Das Fenster mit dem Perron", fenster(724, "rw-fr", true), [700, 78, 252, 156]);

    if (orte.has("zahlenhaus")) {
      let zimmerPunkte = "";
      [[1, 4], [2, 3], [3, 2]].forEach(([l, r], k) => {
        const cy = 304 + k * 35;
        for (let i = 0; i < l; i += 1) zimmerPunkte += `<circle cx="${860 - (l - 1) * 6 + i * 12}" cy="${cy}" r="5" fill="${C.rot}"/>`;
        for (let i = 0; i < r; i += 1) zimmerPunkte += `<circle cx="${920 - (r - 1) * 6 + i * 12}" cy="${cy}" r="5" fill="${C.blau}"/>`;
      });
      s += ort("zahlenhaus", "Das Zahlenhaus", `
        <rect x="830" y="286" width="120" height="106" fill="#ffffff" stroke="#e2c389" stroke-width="2"/>
        <path d="M890 286 V392 M830 321 H950 M830 356 H950" stroke="#e2c389" stroke-width="2"/>
        <path d="M818 290 L890 240 L962 290 Z" fill="${C.rot}"/>
        <circle cx="890" cy="270" r="15" fill="#ffffff"/>
        <text x="890" y="278" text-anchor="middle" font-size="22" ${FONT} fill="${C.rot}">5</text>${zimmerPunkte}`, [812, 238, 156, 162]);
    }

    if (orte.has("kiste")) {
      s += ort("kiste", "Die Spielzeugkiste", `
        <ellipse cx="124" cy="452" rx="92" ry="7" fill="${C.ink}" fill-opacity="0.12"/>
        <rect x="40" y="410" width="168" height="40" rx="8" fill="${C.lila}"/>
        <rect x="40" y="402" width="168" height="14" rx="6" fill="${C.lilaHell}"/>
        <circle cx="70" cy="398" r="12" fill="${C.rot}"/><path d="M96 410 L110 386 L124 410 Z" fill="${C.gelb}"/><rect x="134" y="388" width="22" height="22" rx="3" fill="${C.blau}"/><rect x="164" y="394" width="30" height="16" rx="3" fill="#3fbf74"/>`, [30, 388, 188, 68]);
    }

    if (orte.has("wuerfel")) {
      s += ort("wuerfel", "Die Würfel", `
        <ellipse cx="290" cy="456" rx="64" ry="7" fill="${C.ink}" fill-opacity="0.12"/>
        <path d="M236 410 L248 400 L292 400 L280 410 Z" fill="#f07a69"/><path d="M280 410 L292 400 L292 444 L280 454 Z" fill="#c4412f"/>
        ${wuerfel(236, 410, 44, 5, C.rot)}
        <path d="M296 416 L306 407 L346 407 L336 416 Z" fill="#6c9af0"/><path d="M336 416 L346 407 L346 447 L336 456 Z" fill="#2f63bd"/>
        ${wuerfel(296, 416, 40, 3, C.blau)}`, [226, 394, 128, 66]);
    }

    if (orte.has("teppich")) {
      let felder = "";
      for (let i = 0; i < 10; i += 1) felder += `<rect x="${478 + i * 21}" y="420" width="19" height="28" rx="3" fill="${fuenfer(i)}" fill-opacity="0.85"/><text x="${487.5 + i * 21}" y="439" text-anchor="middle" font-size="12" ${FONT} fill="#ffffff">${i + 1}</text>`;
      s += ort("teppich", "Der Zahlenteppich", `<rect x="474" y="414" width="214" height="40" rx="6" fill="#fff6e0"/>${felder}`, [470, 412, 220, 46]);
    }

    // Das Rangiergleis mit zwei Spielzeugzügen und dem Tunnel
    s += `<rect x="20" y="500" width="960" height="5" rx="2" fill="#8b95a8"/>`;
    for (let x = 30; x < 970; x += 26) s += `<rect x="${x}" y="505" width="14" height="6" rx="2" fill="#9b6b3f"/>`;
    if (orte.has("gleis")) {
      let zugA = lok(1, true);
      for (let i = 0; i < 3; i += 1) zugA += wagen(116 + i * 64, fuenfer(i), 1, i);
      let zugB = "";
      for (let j = 0; j < 2; j += 1) zugB += wagen(6 + j * 64, C.gelb, 1, j);
      s += ort("gleis", "Das Rangiergleis", `<g transform="translate(54 500) scale(0.62)">${zugA}</g><g transform="translate(296 500) scale(0.62)">${zugB}</g>`, [24, 458, 400, 80]);
    }
    if (orte.has("tunnel")) {
      s += ort("tunnel", "Der Tunnel", `
        <path d="M700 505 L700 470 Q706 438 744 432 Q790 404 840 424 Q890 408 920 440 Q948 456 950 505 Z" fill="${C.gruen}"/>
        <path d="M760 430 q6 -10 12 0 M850 420 q6 -10 12 0 M900 440 q5 -9 10 0" stroke="${C.gruenDunkel}" stroke-width="3" fill="none"/>
        <path d="M706 505 V480 Q706 458 730 458 Q754 458 754 480 V505 Z" fill="#2b3346"/>
        <rect x="836" y="384" width="3" height="34" fill="#5d6882"/><path d="M839 384 L862 392 L839 400 Z" fill="${C.rot}"/>`, [692, 424, 270, 114]);
    }
    return `${s}</svg>`;
  }

  function fenster(x0, clip, perron) {
    let s = `<rect x="${x0 - 12}" y="82" width="230" height="140" rx="18" fill="${C.blau}"/>
      <g clip-path="url(#${clip})">
      <rect x="${x0}" y="94" width="206" height="116" fill="url(#rw-himmel)"/>
      ${perron ? "" : `<circle cx="${x0 + 170}" cy="118" r="14" fill="#ffe27a"/>`}
      <path d="M${x0} 182 Q${x0 + 60} 150 ${x0 + 120} 172 T${x0 + 206} 166 V210 H${x0} Z" fill="#9ed27f"/>
      <path d="M${x0} 196 Q${x0 + 80} 178 ${x0 + 150} 194 T${x0 + 206} 190 V210 H${x0} Z" fill="#7cc05e"/>`;
    if (perron) {
      s += `<rect x="${x0}" y="190" width="206" height="20" fill="#c9d1df"/>
        <rect x="${x0 + 128}" y="140" width="5" height="50" fill="#5d6882"/>
        <rect x="${x0 + 104}" y="130" width="54" height="18" rx="4" fill="#ffffff" stroke="${C.blau}" stroke-width="2"/>
        <text x="${x0 + 131}" y="144" text-anchor="middle" font-size="12" ${FONT} fill="${C.blau}">Perron</text>
        ${kopf("fox", x0 + 34, 176, 10)}${kopf("rabbit", x0 + 62, 178, 9)}${kopf("bear", x0 + 88, 176, 10)}`;
    } else {
      s += `<g transform="translate(${x0 + 104} 196)">
        <rect x="0" y="-48" width="118" height="40" rx="8" fill="${C.gelb}"/>
        ${[0, 1, 2, 3, 4].map((c) => `<rect x="${6 + c * 22}" y="-43" width="17" height="14" rx="3" fill="${C.glas}"/><rect x="${6 + c * 22}" y="-26" width="17" height="14" rx="3" fill="${C.glas}"/>`).join("")}
        ${[0, 1, 2, 3, 4].map((c) => `<circle cx="${14.5 + c * 22}" cy="-36" r="5" fill="${C.rot}"/>`).join("")}
        <circle cx="14.5" cy="-19" r="5" fill="${C.blau}"/><circle cx="36.5" cy="-19" r="5" fill="${C.blau}"/>
        <circle cx="24" cy="-5" r="6" fill="${C.dunkel}"/><circle cx="94" cy="-5" r="6" fill="${C.dunkel}"/></g>`;
    }
    return `${s}</g><rect x="${x0 - 20}" y="220" width="246" height="11" rx="5" fill="${C.holz}"/>`;
  }

  function knall(x, y) {
    let s = `<g class="rw-knall" transform="translate(${x} ${y})">`;
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2;
      s += `<path d="M${f1(Math.cos(a) * 60)} ${f1(Math.sin(a) * 60)} l4 9 9 3 -9 3 -4 9 -4 -9 -9 -3 9 -3 Z" fill="${fuenfer(i)}"/>`;
    }
    return `${s}</g>`;
  }

  // ---------------------------------------------------------------------------
  // Die Einrichtung: fünfzehn Dinge, und jedes ist selbst eine Zahl.
  // ---------------------------------------------------------------------------
  // Keine Knöpfe – getippt wird hindurch (pointer-events: none im Stylesheet).
  const AUSBAU = [
    { id: "lampe", name: "eine Lampe", zahl: 1 },
    { id: "kissen", name: "zwei Kissen", zahl: 2 },
    { id: "bilder", name: "drei Bilder", zahl: 3 },
    { id: "kerzen", name: "vier Kerzen", zahl: 4 },
    { id: "blume", name: "eine Blume mit fünf Blüten", zahl: 5 },
    { id: "fische", name: "ein Bild mit sechs Fischen", zahl: 6 },
    { id: "buecher", name: "sieben Bücher", zahl: 7 },
    { id: "kaefer", name: "ein Marienkäfer mit acht Punkten", zahl: 8 },
    { id: "pflanze", name: "eine Hängepflanze mit neun Blättern", zahl: 9 },
    { id: "lichter", name: "eine Lichterkette mit zehn Lichtern", zahl: 10 },
    { id: "mobile", name: "ein Mobile mit Sternen", zahl: 5 },
    { id: "schatzkarte", name: "eine Schatzkarte", zahl: 1 },
    { id: "kegel", name: "neun Kegel", zahl: 9 },
    { id: "katze", name: "eine Katze mit sechs Streifen", zahl: 6 },
    { id: "himmel", name: "ein Sternenhimmel", zahl: 0 },
  ];
  function einrichtung(ausbau = 0, neuAb = Infinity) {
    const hat = (id) => AUSBAU.findIndex((a) => a.id === id) < ausbau;
    const neu = (id) => { const i = AUSBAU.findIndex((a) => a.id === id); return i >= neuAb && i < ausbau; };
    const ding = (id, inhalt) => (hat(id) ? `<g class="rw-ausbau${neu(id) ? " is-neu" : ""}" data-ausbau="${id}">${inhalt}</g>` : "");
    let s = "";
    s += ding("himmel", `<g fill="#ffe27a" opacity="0.8">${[[120, 60], [260, 44], [690, 50], [840, 64], [560, 58]].map(([x, y]) => `<path d="M${x} ${y} l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z"/>`).join("")}</g>`);
    s += ding("lichter", `<path d="M48 70 Q500 92 952 70" stroke="#5d6882" stroke-width="1.5" fill="none"/>${Array.from({ length: 10 }, (_, i) => { const t = (i + 0.5) / 10; const x = 48 + 904 * t; const y = 70 + 22 * 4 * t * (1 - t); return `<circle class="rw-birne" cx="${f1(x)}" cy="${f1(y + 4)}" r="5" fill="${fuenfer(i)}"/>`; }).join("")}`);
    s += ding("lampe", `<path d="M620 22 V58" stroke="#5d6882" stroke-width="2"/><path d="M604 58 h32 l-6 14 h-20 Z" fill="${C.rot}"/><circle cx="620" cy="76" r="5" fill="#fff6c2"/>`);
    s += ding("bilder", `<g><rect x="304" y="150" width="34" height="26" rx="3" fill="#ffffff" stroke="${C.holzDunkel}" stroke-width="3"/><circle cx="321" cy="163" r="6" fill="${C.gelb}"/></g><g><rect x="304" y="184" width="34" height="26" rx="3" fill="#ffffff" stroke="${C.holzDunkel}" stroke-width="3"/><path d="M308 206 l8 -10 6 6 6 -8 6 12 Z" fill="${C.gruen}"/></g><g><rect x="662" y="186" width="30" height="24" rx="3" fill="#ffffff" stroke="${C.holzDunkel}" stroke-width="3"/><path d="M668 204 q9 -14 18 0" stroke="${C.blau}" stroke-width="3" fill="none"/></g>`);
    s += ding("fische", `<rect x="660" y="236" width="36" height="44" rx="3" fill="#cdeefa" stroke="${C.holzDunkel}" stroke-width="3"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${666 + (i % 2) * 14} ${244 + Math.floor(i / 2) * 12} q4 -4 8 0 q-4 4 -8 0 l-3 -3 v6 Z" fill="${C.rot}"/>`).join("")}`);
    s += ding("kerzen", `${[0, 1, 2, 3].map((i) => `<rect x="${358 + i * 8}" y="${318}" width="5" height="16" fill="#ffffff"/><circle cx="${360.5 + i * 8}" cy="314" r="3" fill="${C.gold}"/>`).join("")}`);
    s += ding("kissen", `<ellipse cx="410" cy="364" rx="18" ry="11" fill="${C.gelb}"/><ellipse cx="590" cy="364" rx="18" ry="11" fill="#3fbf74"/>`);
    s += ding("blume", `<rect x="958" y="370" width="22" height="20" rx="3" fill="${C.holz}"/><path d="M969 370 V346" stroke="#3f8f3a" stroke-width="3"/>${[0, 1, 2, 3, 4].map((i) => { const a = i / 5 * Math.PI * 2; return `<circle cx="${f1(969 + Math.cos(a) * 8)}" cy="${f1(338 + Math.sin(a) * 8)}" r="5" fill="#ef6fa8"/>`; }).join("")}<circle cx="969" cy="338" r="4" fill="${C.gelb}"/>`);
    s += ding("buecher", `${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${846 + i * 9}" y="${200 - (i % 3) * 4}" width="7" height="${24 + (i % 3) * 4}" rx="1" fill="${[C.rot, C.blau, C.gelb, "#3fbf74", C.lila, "#ef6fa8", C.gold][i]}"/>`).join("")}<rect x="842" y="224" width="70" height="5" rx="2" fill="${C.holzDunkel}"/>`);
    s += ding("kaefer", `<g transform="translate(366 268)"><circle r="17" fill="${C.rot}"/><path d="M0 -17 V17" stroke="${C.ink}" stroke-width="2"/><circle cy="-18" r="7" fill="${C.ink}"/>${[[-8, -8], [8, -8], [-10, 1], [10, 1], [-7, 9], [7, 9], [-3, -2], [3, -2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${C.ink}"/>`).join("")}</g>`);
    s += ding("pflanze", `<path d="M980 22 V70" stroke="#5d6882" stroke-width="2"/><path d="M968 70 h24 l-4 14 h-16 Z" fill="${C.holz}"/>${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${f1(972 + (i % 2) * 16 - 4)}" cy="${88 + i * 7}" rx="7" ry="4" fill="#3fbf74"/>`).join("")}`);
    s += ding("mobile", `<path d="M200 22 V44 M176 44 H224" stroke="#5d6882" stroke-width="2"/>${[176, 188, 200, 212, 224].map((x, i) => `<path d="M${x} 44 V${54 + (i % 2) * 8}" stroke="#5d6882" stroke-width="1"/><path d="M${x} ${56 + (i % 2) * 8} l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1 Z" fill="${C.gelb}"/>`).join("")}`);
    s += ding("schatzkarte", `<path d="M370 196 h40 v30 h-40 Z" fill="#f6e3b4" stroke="${C.holzDunkel}" stroke-width="2"/><path d="M376 220 q8 -12 16 -4 t12 -8" stroke="${C.rot}" stroke-width="2" stroke-dasharray="3 3" fill="none"/><path d="M400 204 l4 4 m0 -4 l-4 4" stroke="${C.rot}" stroke-width="2"/>`);
    s += ding("kegel", `${Array.from({ length: 9 }, (_, i) => { const r = Math.floor(i / 3); const c = i % 3; return `<g transform="translate(${716 + c * 12 + r * 6} ${470 - r * 8})"><ellipse cx="0" cy="0" rx="4" ry="8" fill="#ffffff" stroke="${C.grau}"/><rect x="-3" y="-4" width="6" height="2" fill="${C.rot}"/></g>`; }).join("")}`);
    s += ding("katze", `<g transform="translate(624 470)"><ellipse cx="0" cy="0" rx="26" ry="12" fill="#8d8f9c"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${-14 + i * 6} -10 v8" stroke="#5d6070" stroke-width="2"/>`).join("")}<circle cx="-24" cy="-6" r="9" fill="#8d8f9c"/><path d="M-30 -12 l2 -8 4 6 M-22 -13 l3 -7 2 7" fill="#8d8f9c" stroke="#8d8f9c"/><path d="M-28 -6 q2 2 4 0" stroke="${C.ink}" stroke-width="1.5" fill="none"/><path d="M24 2 q14 0 10 -14" stroke="#8d8f9c" stroke-width="5" fill="none" stroke-linecap="round"/></g>`);
    return s;
  }

  window.LernappRechenArt = {
    C, fuenfer, FONT, svg, kopf, TIERE, LOK, LOK_W, lok, WAGEN_W, wagen, wagenBasis, schild, zahlMarke,
    fensterWagen, personenWagen, tunnelBerg, wuerfel, AUGEN, raum, fensterBlick, DEFS,
    LEBEN, UEBERRASCHUNG, BESONDERS, extrasVon, drache, dracheNurKopf, schatz, karte, knall,
    AUSSEN_W, AUSSEN_H, wagenAussen, zimmer, AUSBAU, einrichtung,
  };
})();
