/*
 * bau-art.js – Zeichnungen der Bauecke: Häuser, Zimmer, Tiere, der Lieferzug.
 * ---------------------------------------------------------------------------
 * Alles als SVG-Text, im Stil der Stilprobe (docs/bauecke-stilprobe.html) und
 * der Lok (train-art.js). Die Dinge im Zimmer zeichnet bau-moebel.js; hier
 * steht, was um sie herum ist.
 *
 * Masse eines Hauses (Haus-Einheiten, der Boden der Strasse ist y = 0, nach
 * oben negativ):
 *
 *   |Wand|          Zimmer (560)          |Wand| Lift |Wand|
 *    14                                     14   76    14      = 678 breit
 *
 *   Eine Wohnung füllt das Stockwerk; sonst stehen zwei Zimmer zu je 280
 *   nebeneinander, getrennt von einer Zwischenwand (trennwand).
 *
 *   Stockwerk i: Boden bei unten(i) = -FUSS - i * STOCK, darüber das Zimmer
 *   (240 hoch) und die Decke (16). Ganz oben das Dach.
 *
 * Nur Zeichnen, kein Verhalten: Wer was antippt, regelt train-bau.js.
 */
(() => {
  "use strict";

  const M = () => window.LernappBauMoebel;
  const K = () => window.LernappBauKatalog;
  const shade = (hex, amount) => M().shade(hex, amount);
  const farbeHex = (id, fallback = "#cccccc") => K()?.FARBE?.[id]?.hex || fallback;

  // --- Masse ----------------------------------------------------------------
  const ZW = 560;          // Zimmer breit
  const ZH = 240;          // Zimmer hoch
  const WAND = 14;
  const LIFT = 76;
  const DECKE = 16;
  const STOCK = ZH + DECKE;
  const FUSS = 14;         // Fundament über der Strasse
  const HB = WAND + ZW + WAND + LIFT + WAND;   // 678
  const ZX = WAND;          // wo das Zimmer beginnt
  const LX = WAND + ZW + WAND;                 // wo der Lift beginnt
  const DACH_H = { giebel: 130, heli: 96, turm: 200, flach: 120 };

  function unten(i) { return -FUSS - i * STOCK; }
  function oben(i) { return unten(i) - ZH; }

  // ---------------------------------------------------------------------------
  // Wandmuster und Böden
  // ---------------------------------------------------------------------------
  // Ein <pattern> je Zimmer, aus der Wandfarbe abgeleitet. id muss eindeutig
  // sein; die Ansicht hängt die Kennung des Stockwerks an.
  function musterDef(id, muster, hex) {
    const hell = shade(hex, 0.35);
    const dunkel = shade(hex, -0.12);
    const ganzDunkel = shade(hex, -0.22);
    const p = (w, h, inhalt) => `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${inhalt}</pattern>`;
    switch (muster) {
      case "streifen": return p(40, 40, `<rect x="0" y="0" width="20" height="40" fill="${dunkel}" opacity="0.55"/>`);
      case "punkte": return p(36, 36, `<circle cx="9" cy="9" r="4" fill="${hell}"/><circle cx="27" cy="27" r="4" fill="${hell}"/>`);
      case "karos": return p(40, 40, `<rect width="20" height="20" fill="${dunkel}" opacity="0.4"/><rect x="20" y="20" width="20" height="20" fill="${dunkel}" opacity="0.4"/>`);
      case "sterne": return p(60, 60, `${M().stern(15, 15, 6, hell)}${M().stern(45, 42, 4.5, hell)}`);
      case "herzen": return p(56, 56, `<path d="M14 20c-4-4-10 0-6 6l6 6l6-6c4-6-2-10-6-6z" fill="${hell}"/><path d="M42 46c-3-3-8 0-5 5l5 5l5-5c3-5-2-8-5-5z" fill="${dunkel}" opacity="0.6"/>`);
      case "blumen": return p(64, 64, `<g fill="${hell}"><circle cx="16" cy="12" r="4"/><circle cx="22" cy="16" r="4"/><circle cx="16" cy="22" r="4"/><circle cx="10" cy="16" r="4"/></g><circle cx="16" cy="16" r="3" fill="${ganzDunkel}" opacity="0.5"/><g fill="${dunkel}" opacity="0.6"><circle cx="46" cy="44" r="3"/><circle cx="51" cy="48" r="3"/><circle cx="46" cy="52" r="3"/><circle cx="41" cy="48" r="3"/></g>`);
      case "wellen": return p(60, 30, `<path d="M0 15q15-12 30 0t30 0" fill="none" stroke="${hell}" stroke-width="5"/>`);
      case "ziegel": return p(48, 24, `<rect width="48" height="24" fill="${hex}"/><path d="M0 0.5h48M0 12.5h48M24 0v12M12 12v12M36 12v12" stroke="${ganzDunkel}" stroke-width="1.6" opacity="0.6"/>`);
      case "holz": return p(30, 240, `<rect width="30" height="240" fill="${hex}"/><path d="M0.5 0v240" stroke="${ganzDunkel}" stroke-width="1.4" opacity="0.5"/><path d="M14 30q4 12 0 24M8 140q3 10 0 20" stroke="${dunkel}" stroke-width="1.2" fill="none" opacity="0.6"/>`);
      case "kacheln": return p(24, 24, `<rect width="24" height="24" fill="${hex}"/><path d="M0 0.5h24M0.5 0v24" stroke="${hell}" stroke-width="1.6"/>`);
      default: return "";
    }
  }

  // Der Boden: ein Streifen unter der Wand, mit dem Muster seiner Art.
  function boden(art, hex, y0, h, w = ZW) {
    const dunkel = shade(hex, -0.16);
    const hell = shade(hex, 0.18);
    let s = `<rect x="0" y="${y0}" width="${w}" height="${h}" fill="${hex}"/>`;
    if (art === "parkett") {
      for (let x = 0, n = 0; x < w; x += 28, n += 1) s += `<path d="M${x} ${y0 + (n % 2 ? 0 : h / 2)}v${h / 2}" stroke="${dunkel}" stroke-width="1.4"/>`;
      s += `<path d="M0 ${y0 + h / 2}h${w}" stroke="${dunkel}" stroke-width="1.4"/>`;
    } else if (art === "dielen") {
      s += `<path d="M0 ${y0 + h / 3}h${w}M0 ${y0 + (2 * h) / 3}h${w}" stroke="${dunkel}" stroke-width="1.4"/>`;
      for (let x = 40; x < w; x += 90) s += `<path d="M${x} ${y0}v${h / 3}M${x + 45} ${y0 + h / 3}v${h / 3}M${x + 20} ${y0 + (2 * h) / 3}v${h / 3}" stroke="${dunkel}" stroke-width="1.2"/>`;
    } else if (art === "plaettli") {
      for (let x = 0, n = 0; x < w; x += 24, n += 1) s += `<rect x="${x}" y="${y0}" width="24" height="${h / 2}" fill="${n % 2 ? hell : hex}"/><rect x="${x}" y="${y0 + h / 2}" width="24" height="${h / 2}" fill="${n % 2 ? hex : hell}"/>`;
    } else if (art === "teppichboden") {
      s += `<rect x="0" y="${y0}" width="${w}" height="3" fill="${dunkel}" opacity="0.5"/>`;
    } else if (art === "stein") {
      for (let x = 0, n = 0; x < w; x += 46, n += 1) s += `<rect x="${x + 1}" y="${y0 + 1}" width="44" height="${h / 2 - 2}" rx="3" fill="${n % 2 ? hell : hex}" stroke="${dunkel}" stroke-width="1"/><rect x="${x + 24}" y="${y0 + h / 2 + 1}" width="44" height="${h / 2 - 2}" rx="3" fill="${n % 2 ? hex : hell}" stroke="${dunkel}" stroke-width="1"/>`;
    } else if (art === "linoleum") {
      s += `<path d="M0 ${y0 + h / 2}h${w}" stroke="${hell}" stroke-width="2" opacity="0.7"/>`;
    } else if (art === "rasen") {
      for (let x = 4; x < w; x += 9) s += `<path d="M${x} ${y0 + 4}l2-5l2 5" fill="${shade(hex, -0.2)}"/>`;
    }
    return s;
  }

  // Die leere Hülle eines Zimmers: Wand mit Muster, Boden, Fussleiste.
  // breite: eine Wohnung ist so breit wie das Stockwerk, sonst halb so breit.
  // oben: wo die Wand endet – im KiddyDome ein Stockwerk höher (-STOCK).
  function zimmerSchale(z, musterId, breite = ZW, oben = 0) {
    const wand = farbeHex(z.wand, "#f6ead2");
    const bodenArt = K()?.BODEN?.[z.boden] || K()?.BODEN?.parkett;
    const bodenHex = z.bodenFarbe ? farbeHex(z.bodenFarbe) : (bodenArt?.farbe || "#c88c5c");
    const wy = 216;
    const def = z.muster && z.muster !== "keine" ? musterDef(musterId, z.muster, wand) : "";
    return `${def ? `<defs>${def}</defs>` : ""}` +
      `<rect class="bau-wand" x="0" y="${oben}" width="${breite}" height="${wy - oben}" fill="${wand}"/>` +
      (def ? `<rect x="0" y="${oben}" width="${breite}" height="${wy - oben}" fill="url(#${musterId})"/>` : "") +
      `<rect x="0" y="${oben}" width="${breite}" height="10" fill="#000000" opacity="0.06"/>` +
      `<g class="bau-boden">${boden(bodenArt?.id || "parkett", bodenHex, wy, ZH - wy, breite)}</g>` +
      `<rect x="0" y="${wy - 5}" width="${breite}" height="5" fill="${shade(wand, -0.25)}" opacity="0.7"/>`;
  }

  // Der Rohbau: Backsteinwand, Gerüstbretter und ein Zeichen in der Mitte.
  // So sieht ein Kind, dass hier noch etwas werden will:
  //   plus   ein Zimmer wählen
  //   frage  Wohnung oder zwei Zimmer?
  //   bett   Schlafzimmer oder Kinderzimmer?
  function rohbauSchale(breite = ZW, zeichen = "plus") {
    let s = `<rect x="0" y="0" width="${breite}" height="${ZH}" fill="#d9b38c"/>`;
    for (let y = 0, r = 0; y < 216; y += 18, r += 1) {
      for (let x = r % 2 ? -18 : 0; x < breite; x += 36) s += `<rect x="${x + 1}" y="${y + 1}" width="34" height="16" rx="2" fill="${(x + y) % 3 ? "#c98d5c" : "#d39a68"}"/>`;
    }
    s += `<rect x="0" y="216" width="${breite}" height="24" fill="#9a8c7c"/><path d="M0 228h${breite}" stroke="#867868" stroke-width="2"/>`;
    s += `<rect x="${breite * 0.07}" y="196" width="${Math.min(120, breite * 0.3)}" height="8" rx="2" fill="#c88c5c"/>`;
    const cx = breite / 2;
    let mitte = `<path d="M${cx - 22} 108h44M${cx} 86v44" stroke="#3fbf74" stroke-width="12" stroke-linecap="round"/>`;
    if (zeichen === "frage") mitte = `<text x="${cx}" y="130" text-anchor="middle" font-size="64" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#3fbf74">?</text>`;
    if (zeichen === "bett") {
      mitte = `<g transform="translate(${cx} 128) scale(0.42)">${M().zeichne("bett")}</g>` +
        `<circle cx="${cx + 30}" cy="80" r="15" fill="#3fbf74"/><path d="M${cx + 22} 80h16M${cx + 30} 72v16" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>`;
    }
    s += `<g class="bau-rohbau-plus"><circle cx="${cx}" cy="108" r="46" fill="#ffffff" opacity="0.92"/>${mitte}</g>`;
    return s;
  }

  // Die Zwischenwand eines Stockwerks mit zwei Zimmern (Haus-Einheiten).
  function trennwand(i, fassadeId) {
    const f = farbeHex(fassadeId, "#ffd3b5");
    const x = ZX + ZW / 2;
    return `<rect x="${x - 5}" y="${oben(i)}" width="10" height="${ZH}" fill="${f}"/><rect x="${x + 2}" y="${oben(i)}" width="3" height="${ZH}" fill="${shade(f, -0.2)}" opacity="0.6"/>`;
  }

  // ---------------------------------------------------------------------------
  // Die Tiere
  // ---------------------------------------------------------------------------
  // Ein Tier um (0, 0) als Fusspunkt. Gezeichnet wird es in bau-tiere.js, im
  // Stil der Bilderbücher der Leseecke – figur ist eine Buchfigur (Leo, Pippa
  // …), variante unterscheidet die gewöhnlichen Tiere einer Art. Die Teile
  // tragen Klassen, an denen train-bau.js wackelt: Beine, Wippen, Lider.
  // Fehlt bau-tiere.js, steht hier das einfache Tier vom Anfang.
  function tier(art, opts = {}) {
    const zeichner = window.LernappBauTiere;
    if (zeichner?.tier) return zeichner.tier(art, opts);
    const { gross = 1 } = opts;
    const a = K()?.TIERE?.[art] || K()?.TIERE?.fox;
    const c = a.coat;
    const inn = a.inner;
    const dark = shade(c, -0.42);
    const body = art === "penguin" ? c : shade(c, -0.12);
    const ear = a.ear;
    let ohren = "";
    let vorne = "";
    if (ear === "long") ohren = `<ellipse cx="-6" cy="-86" rx="5.5" ry="17" fill="${c}" transform="rotate(-10 -6 -86)"/><ellipse cx="-6" cy="-86" rx="2.6" ry="12" fill="${inn}" transform="rotate(-10 -6 -86)"/><ellipse cx="7" cy="-86" rx="5.5" ry="17" fill="${c}" transform="rotate(12 7 -86)"/><ellipse cx="7" cy="-86" rx="2.6" ry="12" fill="${inn}" transform="rotate(12 7 -86)"/>`;
    else if (ear === "point") ohren = `<path d="M-13 -66L-11 -84L-2 -73Z" fill="${c}"/><path d="M13 -66L11 -84L2 -73Z" fill="${c}"/><path d="M-11 -70L-10 -80L-5 -74Z" fill="${dark}"/><path d="M11 -70L10 -80L5 -74Z" fill="${dark}"/>`;
    else if (ear === "round") ohren = `<circle cx="-11" cy="-72" r="6.5" fill="${art === "panda" ? inn : c}"/><circle cx="11" cy="-72" r="6.5" fill="${art === "panda" ? inn : c}"/>`;
    else if (ear === "big") ohren = `<circle cx="-13" cy="-71" r="9.5" fill="${c}"/><circle cx="-13" cy="-71" r="5.5" fill="${inn}"/><circle cx="13" cy="-71" r="9.5" fill="${c}"/><circle cx="13" cy="-71" r="5.5" fill="${inn}"/>`;
    else if (ear === "tuft") ohren = `<path d="M-14 -68L-13 -80L-5 -73Z" fill="${dark}"/><path d="M14 -68L13 -80L5 -73Z" fill="${dark}"/>`;
    else if (ear === "mane") ohren = `<circle cx="0" cy="-61" r="21" fill="${shade(c, -0.3)}"/><circle cx="-12" cy="-74" r="5" fill="${c}"/><circle cx="12" cy="-74" r="5" fill="${c}"/>`;
    else if (ear === "horns") ohren = `<path d="M-8 -73c-8-6-12-14-8-22c2 8 6 12 12 16z" fill="#8a7a66"/><path d="M8 -73c8-6 12-14 8-22c-2 8-6 12-12 16z" fill="#8a7a66"/><ellipse cx="-14" cy="-66" rx="6" ry="3" fill="${c}"/><ellipse cx="14" cy="-66" rx="6" ry="3" fill="${c}"/>`;
    else if (ear === "flop") ohren = `<ellipse cx="-14" cy="-60" rx="6" ry="12" fill="${shade(c, -0.25)}" transform="rotate(14 -14 -60)"/><ellipse cx="14" cy="-60" rx="6" ry="12" fill="${shade(c, -0.25)}" transform="rotate(-14 14 -60)"/>`;
    else if (ear === "spikes") ohren = `<path d="M-17 -54l-6-10l7 2l-3-10l8 5l0-10l7 7l3-9l4 9l7-6l0 9l8-4l-3 9l7-1l-5 9z" fill="${shade(c, -0.35)}"/>`;
    else if (ear === "cow") ohren = `<path d="M-10 -74q-8-4-6-12q4 6 10 8z" fill="#e8dcc6"/><path d="M10 -74q8-4 6-12q-4 6-10 8z" fill="#e8dcc6"/><ellipse cx="-16" cy="-66" rx="7" ry="3.5" fill="${c}" stroke="#d8d0c4" stroke-width="1"/><ellipse cx="16" cy="-66" rx="7" ry="3.5" fill="${c}" stroke="#d8d0c4" stroke-width="1"/>`;
    else if (ear === "elefant") ohren = `<ellipse cx="-17" cy="-62" rx="11" ry="14" fill="${shade(c, -0.1)}"/><ellipse cx="17" cy="-62" rx="11" ry="14" fill="${shade(c, -0.1)}"/><ellipse cx="-17" cy="-62" rx="6" ry="9" fill="${inn}"/><ellipse cx="17" cy="-62" rx="6" ry="9" fill="${inn}"/>`;
    else if (ear === "eyes") ohren = `<circle cx="-7" cy="-74" r="6" fill="${c}"/><circle cx="7" cy="-74" r="6" fill="${c}"/>`;
    let gesicht = "";
    if (art === "owl") gesicht = `<circle cx="-6" cy="-61" r="7" fill="${inn}"/><circle cx="6" cy="-61" r="7" fill="${inn}"/>`;
    else if (art === "penguin") gesicht = `<path d="M-11 -58c0-9 5-12 11-7c6-5 11-2 11 7c0 9-6 12-11 12s-11-3-11-12z" fill="${inn}"/>`;
    else if (art === "panda") gesicht = `<ellipse cx="-6" cy="-61" rx="5" ry="6" fill="${inn}" transform="rotate(-20 -6 -61)"/><ellipse cx="6" cy="-61" rx="5" ry="6" fill="${inn}" transform="rotate(20 6 -61)"/><ellipse cx="0" cy="-54" rx="7" ry="5" fill="#ffffff"/>`;
    else if (art === "cow") gesicht = `<ellipse cx="0" cy="-52" rx="10" ry="7" fill="${inn}"/><circle cx="-4" cy="-52" r="1.6" fill="#c25b7a"/><circle cx="4" cy="-52" r="1.6" fill="#c25b7a"/><path d="M4 -72q8 0 8 8q-6 2-8-8z" fill="#3a4250"/>`;
    else if (art === "elephant") gesicht = "";
    else if (art === "frog") gesicht = `<path d="M-8 -53q8 6 16 0" fill="none" stroke="${dark}" stroke-width="2" stroke-linecap="round"/>`;
    else gesicht = `<ellipse cx="0" cy="-54" rx="8" ry="6" fill="${inn}"/>`;
    const augenR = art === "owl" ? 3.2 : 2.3;
    const augenFarbe = art === "panda" ? "#ffffff" : "#243047";
    const augenY = art === "frog" ? -74 : -62;
    const augenX = art === "frog" ? 7 : 5.6;
    let nase = `<ellipse cx="0" cy="-56" rx="2.6" ry="2" fill="#243047"/>`;
    if (art === "penguin") nase = `<path d="M-4 -56h8l-4 5z" fill="#f5a623"/>`;
    else if (art === "owl") nase = `<path d="M-2.5 -57h5l-2.5 5z" fill="#f5a623"/>`;
    else if (art === "frog" || art === "cow") nase = "";
    else if (art === "elephant") vorne = `<path d="M0 -57q-3 15 2 23q3 4 7 1" fill="none" stroke="${shade(c, -0.08)}" stroke-width="7" stroke-linecap="round"/><path d="M0 -57q-3 15 2 23" fill="none" stroke="${shade(c, 0.12)}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`;
    else if (art === "dog") nase = `<ellipse cx="0" cy="-57" rx="3.6" ry="2.6" fill="#243047"/>`;
    const fuesse = art === "penguin" || art === "owl" ? `<ellipse cx="-6" cy="-1.5" rx="6" ry="3" fill="#f5a623"/><ellipse cx="6" cy="-1.5" rx="6" ry="3" fill="#f5a623"/>` : "";
    const schwanz = art === "fox" ? `<path d="M10 -26q16 -2 20 -18q-12 2-20 10z" fill="${c}"/><path d="M24 -40q4-4 6-4q0 6-4 8z" fill="#ffffff"/>`
      : art === "squirrel" ? `<path d="M6 -20c18 2 30-10 26-30c-3-14-16-20-24-12c10 0 14 8 10 16c-4 8-14 10-14 26z" fill="${shade(c, 0.08)}"/><path d="M22 -58c6-2 10 2 10 8" fill="none" stroke="${shade(c, 0.35)}" stroke-width="3" stroke-linecap="round"/>`
        : art === "cat" ? `<path d="M10 -22q14 0 14 -16" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`
          : art === "lion" ? `<path d="M10 -22q14 4 16 -10" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="-33" r="3.5" fill="${shade(c, -0.3)}"/>`
            : art === "dog" ? `<path d="M10 -26q10 -4 12 -14" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>` : "";
    const flecken = art === "cow" ? `<ellipse cx="-4" cy="-38" rx="5" ry="4" fill="#3a4250"/><ellipse cx="6" cy="-28" rx="3.5" ry="3" fill="#3a4250"/>` : "";
    const g = gross !== 1 ? ` transform="scale(${gross})"` : "";
    return `<g${g}><ellipse cx="0" cy="0" rx="15" ry="3.6" fill="#000000" opacity="0.13"/>${schwanz}` +
      `<g class="legL"><rect x="-8" y="-21" width="6.5" height="21" rx="3" fill="${dark}"/></g><g class="legR"><rect x="1.5" y="-21" width="6.5" height="21" rx="3" fill="${dark}"/></g>${fuesse}` +
      `<g class="bob"><rect x="-12" y="-46" width="24" height="29" rx="10" fill="${body}"/><rect x="-6.5" y="-41" width="13" height="19" rx="6" fill="${art === "panda" ? "#ffffff" : inn}" opacity="0.9"/>${flecken}` +
      `<path d="M-11 -40q-7 5-7 13" fill="none" stroke="${body}" stroke-width="5" stroke-linecap="round"/>` +
      `<g class="arm"><path d="M11 -40q7 5 7 13" fill="none" stroke="${body}" stroke-width="5" stroke-linecap="round"/></g>` +
      ohren + `<circle cx="0" cy="-61" r="15" fill="${c}"/>` + gesicht + vorne +
      `<g class="eyes"><circle cx="${-augenX}" cy="${augenY}" r="${augenR}" fill="${augenFarbe}"/><circle cx="${augenX}" cy="${augenY}" r="${augenR}" fill="${augenFarbe}"/>` +
      (art === "panda" ? `<circle cx="-5.6" cy="-62" r="1.3" fill="#243047"/><circle cx="5.6" cy="-62" r="1.3" fill="#243047"/>` : "") + `</g>` +
      nase + `<circle cx="-10" cy="-54" r="2.6" fill="#ff8fa3" opacity="0.45"/><circle cx="10" cy="-54" r="2.6" fill="#ff8fa3" opacity="0.45"/></g></g>`;
  }

  // Ein Koffer für das Einziehen.
  function koffer() {
    return `<g class="bau-koffer"><rect x="10" y="-26" width="18" height="14" rx="3" fill="#e8763a"/><path d="M15 -26v-3h8v3" fill="none" stroke="#8a5734" stroke-width="2"/><rect x="10" y="-21" width="18" height="2" fill="#c45f2c"/></g>`;
  }

  // ---------------------------------------------------------------------------
  // Das Haus
  // ---------------------------------------------------------------------------
  // Die Teile, die zwischen und um die Zimmer liegen: Aussenwände, Decken,
  // der Liftschacht mit Tür und Stockwerkschild, das Fundament. Gezeichnet
  // über die Zimmer, damit nichts über den Rand ragt. offen: die Stockwerke,
  // über denen keine Decke durch das Zimmer geht (ein KiddyDome ist zwei
  // Stockwerke hoch) – dort trägt sie nur Wände und Lift.
  function hausRahmen(haus, anzahl, offen = []) {
    const fassade = farbeHex(haus.fassade, "#ffd3b5");
    const dunkel = shade(fassade, -0.18);
    const top = oben(anzahl - 1) - DECKE;
    const hoehe = -top;
    let s = "";
    // Aussenwände und Mittelwand, über die ganze Höhe.
    s += `<rect x="0" y="${top}" width="${WAND}" height="${hoehe}" fill="${fassade}"/>`;
    s += `<rect x="${WAND + ZW}" y="${top}" width="${WAND}" height="${hoehe}" fill="${fassade}"/>`;
    s += `<rect x="${HB - WAND}" y="${top}" width="${WAND}" height="${hoehe}" fill="${fassade}"/>`;
    s += `<rect x="0" y="${top}" width="3" height="${hoehe}" fill="${dunkel}" opacity="0.5"/>`;
    // Decken über jedem Stockwerk, durchgehend bis über den Lift.
    for (let i = 0; i < anzahl; i += 1) {
      const y = oben(i) - DECKE;
      const stuecke = offen.includes(i) ? [[0, WAND], [WAND + ZW, HB - WAND - ZW]] : [[0, HB]];
      stuecke.forEach(([x, w]) => {
        s += `<rect x="${x}" y="${y}" width="${w}" height="${DECKE}" fill="${fassade}"/><rect x="${x}" y="${y + DECKE - 3}" width="${w}" height="3" fill="${dunkel}" opacity="0.6"/>`;
      });
    }
    // Fundament.
    s += `<rect x="-6" y="${-FUSS}" width="${HB + 12}" height="${FUSS}" fill="#9aa5b1"/><rect x="-6" y="${-FUSS}" width="${HB + 12}" height="3" fill="#7c8796"/>`;
    return s;
  }

  // Der Liftschacht eines Stockwerks: Tür, Nummer, darüber die Sterntafel
  // (die zeichnet train-bau.js hinein, sie ändert sich oft).
  function liftStock(i) {
    const y = oben(i);
    return `<rect x="${LX}" y="${y}" width="${LIFT}" height="${ZH}" fill="#e2e7ee"/>` +
      `<rect x="${LX}" y="${y}" width="${LIFT}" height="${ZH}" fill="url(#bau-lift-schatten)"/>` +
      `<rect x="${LX + 12}" y="${y + 116}" width="${LIFT - 24}" height="${ZH - 116}" rx="3" fill="#b8c2cf"/>` +
      `<rect x="${LX + 14}" y="${y + 119}" width="${(LIFT - 28) / 2 - 1}" height="${ZH - 119}" fill="#cfd7e2"/>` +
      `<rect x="${LX + LIFT / 2 + 1}" y="${y + 119}" width="${(LIFT - 28) / 2 - 1}" height="${ZH - 119}" fill="#cfd7e2"/>` +
      `<circle cx="${LX + LIFT / 2}" cy="${y + 104}" r="9" fill="#243047"/>` +
      `<text x="${LX + LIFT / 2}" y="${y + 108}" text-anchor="middle" font-size="12" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffd166">${i === 0 ? "E" : i}</text>`;
  }

  // Die Sterntafel einer Wohnung: je Tier eine Reihe – zwei gelbe, ein
  // grüner, zwei blaue Sterne, gefüllt, was erfüllt ist. Oben (cx, y).
  // st: sterneStock() aus bau-stand.js.
  function sternTafel(st, cx, y) {
    const reihen = st?.tiere || [];
    if (!reihen.length) return "";
    const farbe = { gelb: "#ffc93c", gruen: "#4cc46b", blau: "#4f8ef7" };
    const stern = (x, yy, voll, f) => {
      const pfad = M().stern(x, yy, 5.4, voll ? farbe[f] : "#ffffff");
      return voll ? pfad : pfad.replace("/>", ` stroke="${farbe[f]}" stroke-width="1.5" opacity="0.9"/>`);
    };
    // Alle Wünsche erfüllt: Die Tafel wird golden.
    const gold = st.total > 0 && st.anzahl === st.total;
    const h = 10 + reihen.length * 15;
    let s = `<rect x="${cx - 34}" y="${y}" width="68" height="${h}" rx="9" fill="${gold ? "#fff3c4" : "#ffffff"}" opacity="0.96" stroke="${gold ? "#ffb703" : "#d3e3ec"}" stroke-width="${gold ? 4 : 2}"/>`;
    reihen.forEach((r, n) => {
      const ry = y + 12.5 + n * 15;
      const zeile = [...(r.gelb || []).map((v) => [v, "gelb"]), ...(r.gruen || []).map((v) => [v, "gruen"]), ...(r.blau || []).map((v) => [v, "blau"])];
      zeile.forEach(([voll, f], i) => { s += stern(cx - 25 + i * 12.5, ry, voll, f); });
    });
    return s;
  }
  function sternTafelHoehe(st) { return (st?.tiere?.length || 0) ? 10 + st.tiere.length * 15 : 0; }

  // Der Traumjob: eine goldene Aktentasche mit einem Funkeln – unabhängig von
  // den Sternen der Wünsche. Leer ist es ein gestrichelter Platz. Um (0, 0),
  // gut 20 breit.
  function traumAbzeichen(voll = true) {
    if (!voll) return `<rect x="-9" y="-6" width="18" height="13" rx="3" fill="#ffffff" stroke="#cbd5e0" stroke-width="1.8" stroke-dasharray="3 2"/>`;
    return `<path d="M-3.5 -6v-2.4a1.8 1.8 0 0 1 1.8-1.8h3.4a1.8 1.8 0 0 1 1.8 1.8V-6" fill="none" stroke="#a86b00" stroke-width="2"/>` +
      `<rect x="-9" y="-6" width="18" height="13" rx="3" fill="#ffc93c" stroke="#a86b00" stroke-width="1.8"/>` +
      `<path d="M-9 -0.5h18" stroke="#a86b00" stroke-width="1.4"/><rect x="-2" y="-2.2" width="4" height="3.4" rx="0.8" fill="#a86b00"/>` +
      `<path d="M10 -12l1.3 2.8 2.8 1.3-2.8 1.3L10 -3.8 8.7 -6.6 5.9 -7.9 8.7 -9.2z" fill="#fff3a0" stroke="#e0a400" stroke-width="0.8"/>`;
  }

  // Wie viele Bewohner einer Wohnung ihren Traumjob haben, von aussen – in
  // drei Stufen: Ein goldener Rahmen um die Wohnung wird mit jedem Traumjob
  // kräftiger, und links am Haus hängt ein Schild mit drei Plätzen. Haben
  // alle drei ihren Traumjob, leuchtet die Wohnung, und das Schild trägt eine
  // Krone.
  function traumRahmen(i, n) {
    const stufe = Math.max(0, Math.min(3, n));
    if (!stufe) return "";
    const y = oben(i);
    const breite = [0, 5, 8, 12][stufe];
    const farbe = ["", "#ffd166", "#ffbf3c", "#f5a300"][stufe];
    let s = "";
    if (stufe === 3) s += `<rect class="bau-traumglanz" x="${ZX + 12}" y="${y + 12}" width="${ZW - 24}" height="${ZH - 24}" rx="10" fill="none" stroke="#fff3a0" stroke-width="22" opacity="0.6"/>`;
    s += `<rect x="${ZX + breite / 2 + 1}" y="${y + breite / 2 + 1}" width="${ZW - breite - 2}" height="${ZH - breite - 2}" rx="8" fill="none" stroke="${farbe}" stroke-width="${breite}"/>`;
    return s;
  }
  function traumSchild(i, n) {
    const stufe = Math.max(0, Math.min(3, n));
    if (!stufe) return "";
    const y = oben(i) + 34;
    const x0 = -92;
    const gold = stufe === 3;
    let s = `<path d="M${x0 + 78} ${y + 18}h14" stroke="#a0aec0" stroke-width="5" stroke-linecap="round"/>` +
      `<rect x="${x0}" y="${y}" width="80" height="36" rx="11" fill="${gold ? "#fff3c4" : "#fffaf0"}" stroke="${gold ? "#f5a300" : "#e8c45a"}" stroke-width="${gold ? 4 : 3}"/>`;
    for (let k = 0; k < 3; k += 1) s += `<g transform="translate(${x0 + 17 + k * 23} ${y + 21})">${traumAbzeichen(k < stufe)}</g>`;
    if (gold) {
      const cx = x0 + 40;
      s += `<path d="M${cx - 17} ${y - 1}l-4 -19 10 9 11 -14 11 14 10 -9 -4 19z" fill="#ffc93c" stroke="#a86b00" stroke-width="2" stroke-linejoin="round"/>` +
        `<circle cx="${cx - 21}" cy="${y - 20}" r="3" fill="#ff7aa2"/><circle cx="${cx}" cy="${y - 23}" r="3.4" fill="#4f8ef7"/><circle cx="${cx + 21}" cy="${y - 20}" r="3" fill="#4cc46b"/>`;
      [[x0 - 8, y - 6, 1], [x0 + 88, y - 10, 0.8], [x0 + 6, y + 46, 0.7]].forEach(([fx, fy, k]) => {
        s += `<path d="M${fx} ${fy - 9 * k}l${2.2 * k} ${6.8 * k} ${6.8 * k} ${2.2 * k}-${6.8 * k} ${2.2 * k}L${fx} ${fy + 9 * k}l-${2.2 * k}-${6.8 * k}-${6.8 * k}-${2.2 * k} ${6.8 * k}-${2.2 * k}z" fill="#fff3a0" stroke="#e0a400" stroke-width="1"/>`;
      });
    }
    return s;
  }

  // Die Liftkabine für den Einzug: um (0, 0) als Boden der Kabine.
  function liftKabine() {
    const w = LIFT - 18;
    return `<rect x="${-w / 2}" y="-118" width="${w}" height="118" rx="5" fill="#f6d365" stroke="#c99a2e" stroke-width="3"/>` +
      `<rect x="${-w / 2 + 6}" y="-108" width="${w - 12}" height="34" rx="4" fill="#fff6d6"/>` +
      `<path d="M0 -118v-26" stroke="#4a5568" stroke-width="3"/><circle cx="0" cy="-148" r="5" fill="#4a5568"/>`;
  }

  // Das Dach, je nach Haus. x von 0 bis HB, y = oberkante der obersten Decke.
  function dach(form, farbeId, fassadeId, y) {
    const c = farbeHex(farbeId, "#ef5350");
    const f = farbeHex(fassadeId, "#ffd3b5");
    const d = shade(c, -0.2);
    if (form === "giebel") {
      return `<path d="M-24 ${y}L${HB / 2} ${y - 120}L${HB + 24} ${y}Z" fill="${c}"/><path d="M-24 ${y}L${HB / 2} ${y - 120}L${HB / 2} ${y - 108}L-6 ${y}Z" fill="${shade(c, 0.12)}"/>` +
        `<rect x="${HB * 0.7}" y="${y - 118}" width="34" height="56" fill="${shade(f, -0.25)}"/><rect x="${HB * 0.7 - 4}" y="${y - 124}" width="42" height="10" fill="${shade(f, -0.35)}"/>` +
        `<circle cx="${HB / 2}" cy="${y - 52}" r="20" fill="#ffffff"/><circle cx="${HB / 2}" cy="${y - 52}" r="15" fill="#a8ddf0" class="bau-fensterglas"/><path d="M${HB / 2} ${y - 67}v30M${HB / 2 - 15} ${y - 52}h30" stroke="#ffffff" stroke-width="3"/>`;
    }
    if (form === "heli") {
      return `<rect x="-10" y="${y - 22}" width="${HB + 20}" height="22" fill="${f}"/><rect x="-10" y="${y - 22}" width="${HB + 20}" height="5" fill="${c}"/>` +
        `<ellipse cx="${HB * 0.42}" cy="${y - 24}" rx="150" ry="14" fill="#5d6b7a"/><ellipse cx="${HB * 0.42}" cy="${y - 25}" rx="132" ry="10" fill="#6f7d8c"/>` +
        `<text x="${HB * 0.42}" y="${y - 20}" text-anchor="middle" font-size="16" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">H</text>` +
        `<g transform="translate(${HB * 0.42} ${y - 34})"><rect x="-44" y="-30" width="70" height="30" rx="14" fill="${c}"/><rect x="-36" y="-26" width="22" height="14" rx="5" fill="#cfeaff"/><path d="M26 -18h40l6-8" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><path d="M-70 -36h110" stroke="#4a5568" stroke-width="4" stroke-linecap="round"/><rect x="-12" y="-38" width="6" height="10" fill="#4a5568"/><path d="M-40 0v6M10 0v6M-50 6h70" stroke="#4a5568" stroke-width="3" stroke-linecap="round"/></g>` +
        `<rect x="${HB * 0.8}" y="${y - 70}" width="58" height="48" rx="6" fill="#ffffff" stroke="${d}" stroke-width="3"/><rect x="${HB * 0.8 + 9}" y="${y - 61}" width="40" height="30" rx="4" fill="#2f6fd6"/><text x="${HB * 0.8 + 29}" y="${y - 38}" text-anchor="middle" font-size="26" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">H</text>`;
    }
    if (form === "turm") {
      const tx = HB * 0.5;
      return `<rect x="-10" y="${y - 20}" width="${HB + 20}" height="20" fill="${c}"/>` +
        `<rect x="${tx - 50}" y="${y - 110}" width="100" height="90" fill="${f}"/><path d="M${tx - 62} ${y - 110}L${tx} ${y - 160}L${tx + 62} ${y - 110}Z" fill="${c}"/>` +
        `<circle cx="${tx}" cy="${y - 66}" r="28" fill="#ffffff" stroke="${d}" stroke-width="4"/><path d="M${tx} ${y - 66}v-18M${tx} ${y - 66}l12 8" stroke="#243047" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M${tx} ${y - 160}v-30" stroke="#4a5568" stroke-width="3"/><path d="M${tx} ${y - 190}h26l-6 7l6 7h-26z" fill="#ef5350"/>` +
        `<rect x="40" y="${y - 50}" width="120" height="30" rx="6" fill="${shade(f, -0.1)}"/><rect x="${HB - 160}" y="${y - 50}" width="120" height="30" rx="6" fill="${shade(f, -0.1)}"/>`;
    }
    // flach: das Büro mit Antenne und Sonnenkollektoren
    return `<rect x="-10" y="${y - 20}" width="${HB + 20}" height="20" fill="${c}"/><rect x="-10" y="${y - 20}" width="${HB + 20}" height="4" fill="${d}"/>` +
      [70, 200, 330].map((x) => `<g transform="translate(${x} ${y - 20})"><path d="M0 0l12-46h86l12 46z" fill="#2f4f7a"/><path d="M28 0l6-46M56 0v-46M84 0l-6-46M4 -16h102M8 -32h94" stroke="#7fa6d9" stroke-width="2"/></g>`).join("") +
      `<path d="M${HB - 80} ${y - 20}v-90M${HB - 96} ${y - 80}h32M${HB - 92} ${y - 96}h24" stroke="#4a5568" stroke-width="4" stroke-linecap="round"/><circle cx="${HB - 80}" cy="${y - 112}" r="5" fill="#ef5350" class="bau-antenne"/>`;
  }

  // Die Stelle für das nächste Stockwerk: gestrichelt, mit Plus. Dahinter
  // steht, was es braucht (train-bau.js schreibt Zahl und Zustand dazu).
  function naechsterStock(y) {
    return `<rect x="${WAND}" y="${y - ZH}" width="${ZW}" height="${ZH}" rx="10" fill="#ffffff" opacity="0.35" stroke="#ffffff" stroke-width="5" stroke-dasharray="18 12"/>` +
      `<g class="bau-plus"><circle cx="${WAND + ZW / 2}" cy="${y - ZH / 2}" r="52" fill="#3fbf74" stroke="#ffffff" stroke-width="6"/><path d="M${WAND + ZW / 2 - 24} ${y - ZH / 2}h48M${WAND + ZW / 2} ${y - ZH / 2 - 24}v48" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/></g>`;
  }

  // ---------------------------------------------------------------------------
  // Strasse, Bäume, der Lieferzug
  // ---------------------------------------------------------------------------
  function strasse(x0, x1) {
    return `<rect x="${x0}" y="0" width="${x1 - x0}" height="40" fill="#d6dbe2"/><rect x="${x0}" y="0" width="${x1 - x0}" height="4" fill="#b8c0cb"/>` +
      `<rect x="${x0}" y="40" width="${x1 - x0}" height="70" fill="#7d8796"/>` +
      `<rect x="${x0}" y="64" width="${x1 - x0}" height="6" fill="#8a6a4f"/><rect x="${x0}" y="84" width="${x1 - x0}" height="6" fill="#8a6a4f"/>` +
      Array.from({ length: Math.ceil((x1 - x0) / 34) }, (_, i) => `<rect x="${x0 + i * 34}" y="60" width="16" height="34" rx="2" fill="#6b5442"/>`).join("") +
      `<rect x="${x0}" y="62" width="${x1 - x0}" height="5" fill="#b8c0cb"/><rect x="${x0}" y="86" width="${x1 - x0}" height="5" fill="#b8c0cb"/>` +
      `<rect x="${x0}" y="110" width="${x1 - x0}" height="200" fill="#7cc05e"/>`;
  }

  function baum(x, gross = 1) {
    return `<g transform="translate(${x} 0) scale(${gross})"><rect x="-6" y="-60" width="12" height="60" rx="4" fill="#8a5734"/><circle cx="0" cy="-86" r="38" fill="#5cb85c"/><circle cx="-22" cy="-70" r="24" fill="#4aa34a"/><circle cx="22" cy="-72" r="26" fill="#6cc76a"/></g>`;
  }

  function laterne(x) {
    return `<g transform="translate(${x} 0)"><rect x="-3" y="-120" width="6" height="120" fill="#4a5568"/><path d="M-3 -118q0-12 18-12" fill="none" stroke="#4a5568" stroke-width="5"/><ellipse cx="18" cy="-126" rx="12" ry="6" fill="#4a5568"/><ellipse class="bau-laternenlicht" cx="18" cy="-120" rx="8" ry="4" fill="#fff6c2"/></g>`;
  }

  // Der Lieferzug: eine kleine Lok und ein Flachwagen mit Paletten.
  function lieferzug(paletten = 1) {
    const sichtbar = Math.min(3, Math.max(1, paletten));
    let ladung = "";
    for (let i = 0; i < sichtbar; i += 1) {
      const x = -150 + i * 52;
      ladung += `<g class="bau-palette" data-palette="${i}" transform="translate(${x} -46)">${palette()}</g>`;
    }
    return `<g class="bau-zug">` +
      `<rect x="-170" y="-30" width="170" height="16" rx="4" fill="#6b7280"/>` + ladung +
      `<circle cx="-150" cy="-10" r="12" fill="#2d3748"/><circle cx="-30" cy="-10" r="12" fill="#2d3748"/><circle cx="-150" cy="-10" r="4" fill="#cbd5e0"/><circle cx="-30" cy="-10" r="4" fill="#cbd5e0"/>` +
      `<rect x="2" y="-74" width="120" height="58" rx="10" fill="#ef5350"/><rect x="8" y="-96" width="52" height="34" rx="6" fill="#ef5350"/><rect x="14" y="-90" width="40" height="22" rx="4" fill="#cfeaff"/>` +
      `<rect x="80" y="-104" width="18" height="34" rx="4" fill="#2d3748"/><rect x="76" y="-110" width="26" height="8" rx="3" fill="#2d3748"/><path d="M122 -30l14 14h-14z" fill="#4a5568"/>` +
      `<circle cx="30" cy="-12" r="16" fill="#2d3748"/><circle cx="92" cy="-12" r="16" fill="#2d3748"/><circle cx="30" cy="-12" r="6" fill="#ffd166"/><circle cx="92" cy="-12" r="6" fill="#ffd166"/>` +
      `<circle cx="120" cy="-56" r="7" fill="#fff6c2"/>` +
      (paletten > 3 ? `<g transform="translate(-60 -110)"><rect x="-26" y="-18" width="52" height="30" rx="15" fill="#ffffff" stroke="#e8b94f" stroke-width="3"/><text x="0" y="5" text-anchor="middle" font-size="18" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#8a5734">×${paletten}</text></g>` : "") +
      `<g class="bau-rauch"><circle cx="89" cy="-120" r="9" fill="#ffffff" opacity="0.8"/><circle cx="100" cy="-136" r="12" fill="#ffffff" opacity="0.6"/></g>` +
      `</g>`;
  }

  // Eine Palette Ziegel – das Zeichen für "genug für ein Stockwerk".
  function palette() {
    let s = `<rect x="-22" y="0" width="44" height="7" rx="2" fill="#a46c43"/><rect x="-18" y="7" width="7" height="5" fill="#8a5734"/><rect x="11" y="7" width="7" height="5" fill="#8a5734"/>`;
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        const x = -21 + c * 14 + (r % 2 ? 3 : 0);
        if (x + 12 > 22) continue;
        s += `<rect x="${x}" y="${-12 - r * 12}" width="13" height="11" rx="2" fill="${(r + c) % 2 ? "#d9734e" : "#c96a4a"}"/>`;
      }
    }
    return s;
  }

  // Ein kleines Haus für den Umschalter, die Nachbarn und das Startbild.
  // st: { stockwerke, eingerichtet, fassade, dach } aus bau-stand.js.
  function minihaus(hausId, st, { breite = 60 } = {}) {
    const haus = K()?.HAUS?.[hausId];
    const form = haus?.dachForm || "flach";
    const c = farbeHex(st?.dach || haus?.dach, "#ef5350");
    const f = farbeHex(st?.fassade || haus?.fassade, "#ffd3b5");
    const n = Math.max(1, Math.min(12, st?.stockwerke || 1));
    const sh = 14;
    const w = breite;
    const h = n * sh;
    let s = `<rect x="0" y="${-h}" width="${w}" height="${h}" rx="2" fill="${f}" stroke="${shade(f, -0.25)}" stroke-width="1.5"/>`;
    for (let i = 0; i < n; i += 1) {
      const y = -(i + 1) * sh + 3;
      const an = i < (st?.eingerichtet || 0);
      s += `<rect x="6" y="${y}" width="${w * 0.24}" height="8" rx="1.5" fill="${an ? "#ffe38a" : "#c9d6e3"}"/><rect x="${w * 0.38}" y="${y}" width="${w * 0.24}" height="8" rx="1.5" fill="${an ? "#ffe38a" : "#c9d6e3"}"/><rect x="${w * 0.7}" y="${y}" width="${w * 0.22}" height="8" rx="1.5" fill="${an ? "#ffe38a" : "#c9d6e3"}"/>`;
    }
    if (form === "giebel") s += `<path d="M-4 ${-h}L${w / 2} ${-h - 18}L${w + 4} ${-h}Z" fill="${c}"/>`;
    else if (form === "heli") s += `<rect x="-2" y="${-h - 5}" width="${w + 4}" height="5" fill="${c}"/><rect x="${w / 2 - 8}" y="${-h - 17}" width="16" height="12" rx="2" fill="#2f6fd6"/><text x="${w / 2}" y="${-h - 7.5}" text-anchor="middle" font-size="10" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">H</text>`;
    else if (form === "turm") s += `<rect x="-2" y="${-h - 5}" width="${w + 4}" height="5" fill="${c}"/><rect x="${w / 2 - 9}" y="${-h - 18}" width="18" height="13" fill="${f}" stroke="${shade(f, -0.25)}" stroke-width="1"/><path d="M${w / 2 - 12} ${-h - 18}L${w / 2} ${-h - 28}L${w / 2 + 12} ${-h - 18}Z" fill="${c}"/><circle cx="${w / 2}" cy="${-h - 11.5}" r="4" fill="#ffffff"/>`;
    else s += `<rect x="-2" y="${-h - 5}" width="${w + 4}" height="5" fill="${c}"/><path d="M${w - 10} ${-h - 5}v-14" stroke="#4a5568" stroke-width="2"/><circle cx="${w - 10}" cy="${-h - 20}" r="2.4" fill="#ef5350"/>`;
    return s;
  }

  // Wie hoch ein Mini-Haus ist (für die viewBox).
  function minihausHoehe(st) {
    const n = Math.max(1, Math.min(12, st?.stockwerke || 1));
    return n * 14 + 30;
  }

  // Ein Symbol je Haus für die Knöpfe.
  function hausZeichen(hausId) {
    if (hausId === "spital") return `<rect x="3" y="3" width="18" height="18" rx="4" fill="#2f6fd6"/><text x="12" y="17.5" text-anchor="middle" font-size="14" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">H</text>`;
    if (hausId === "zentrum") return `<path d="M3 21V10l9-6 9 6v11z" fill="#ffd166"/><circle cx="12" cy="12" r="4" fill="#ffffff"/><path d="M12 12v-2.5M12 12l2 1" stroke="#243047" stroke-width="1.4" stroke-linecap="round"/><rect x="9" y="16" width="6" height="5" fill="#8a5734"/>`;
    if (hausId === "buero") return `<rect x="5" y="3" width="14" height="18" rx="1.5" fill="#4f8ef7"/><path d="M8 6h3M13 6h3M8 10h3M13 10h3M8 14h3M13 14h3" stroke="#cfeaff" stroke-width="2"/><rect x="10" y="17" width="4" height="4" fill="#243047"/>`;
    return `<path d="M2 11 12 3l10 8" fill="#ef5350"/><rect x="5" y="10" width="14" height="11" fill="#ffd3b5"/><rect x="10" y="14" width="4" height="7" fill="#8a5734"/><rect x="6.5" y="12" width="3" height="3" fill="#cfeaff"/><rect x="14.5" y="12" width="3" height="3" fill="#cfeaff"/>`;
  }

  window.LernappBauArt = {
    ZW, ZH, WAND, LIFT, DECKE, STOCK, FUSS, HB, ZX, LX, DACH_H,
    unten, oben, musterDef, boden, zimmerSchale, rohbauSchale, trennwand, tier, koffer,
    hausRahmen, liftStock, sternTafel, sternTafelHoehe, traumAbzeichen, traumRahmen, traumSchild, liftKabine, dach, naechsterStock, strasse, baum, laterne,
    lieferzug, palette, minihaus, minihausHoehe, hausZeichen,
  };
})();
