/*
 * bau-moebel-extra.js – Dinge, die zu keinem Zimmer gehören (Bauecke):
 * Saison-Deko, goldene Belohnungsmöbel und Lieblingssachen der Menschen.
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet hier keine Zimmerlisten an, sondern:
 *
 *   saison    j_…  was zur Jahreszeit passt – Frühling, Sommer, Herbst und
 *                  Winter je eine Liste (Osternest, Sonnenschirm, Räbeliechtli,
 *                  Weihnachtsbaum …)
 *   schaetze  g_…  goldene Möbel als Belohnung; sie funkeln mit den Gruppen
 *                  bau-glitzer-a/b, die train-bau.js abwechselnd aufleuchten
 *                  lässt (wie die Statue im Dorf)
 *   menschen  m_…  was menschliche Bewohnerinnen und Bewohner gern haben:
 *                  Strickzeug, Schach, Skateboard, Fotoapparat …
 *   wuensche       für jede neue Eigenschaft (tag) der Satz für "Ich hätte
 *                  gerne …" und das Ding, das "Zeig mir" zeigt – im Format von
 *                  DING_WUENSCHE in bau-katalog.js
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, leg, stern, topf, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE } = M.hilfe;

  // Gerundet auf eine Stelle, damit berechnete Punkte kurz bleiben.
  const n = (v) => Math.round(v * 10) / 10;

  // Gold in vier Tönen: Fläche, Glanz, Schatten, Rand.
  const GOLD = "#ffc93c";
  const GOLD_H = "#ffe27a";
  const GOLD_D = "#e0a400";
  const GOLD_R = "#a86b00";
  const SCHOGGI = "#8a5734";
  const TANNE = "#3f9e4a";
  const ORANGE = "#ff9f43";
  const GLUT = "#ffd166";
  const SCHEIN = "#fff3a0";

  // Ein Funkeln mit vier Spitzen um (x, y) – wie in bau-art.js.
  function funkeln(x, y, r, farbe = SCHEIN) {
    const k = n(r * 0.28);
    return P(`M${x} ${n(y - r)}L${n(x + k)} ${n(y - k)}L${n(x + r)} ${y}L${n(x + k)} ${n(y + k)}L${x} ${n(y + r)}L${n(x - k)} ${n(y + k)}L${n(x - r)} ${y}L${n(x - k)} ${n(y - k)}Z`, farbe);
  }
  // Zwei Gruppen, die abwechselnd aufleuchten (train-bau.js setzt die Deckkraft).
  const glitzer = (a, b) => `<g class="bau-glitzer-a">${a}</g><g class="bau-glitzer-b">${b}</g>`;
  // Ein Stern mit Rand.
  const sternRand = (x, y, r, fill, rand = GOLD_R, breite = 1.5) =>
    stern(x, y, r, fill).replace("/>", ` stroke="${rand}" stroke-width="${breite}" stroke-linejoin="round"/>`);
  // Eine kleine Blüte mit fünf Blättern.
  const bluete = (x, y, r, f, mitte = GLUT) =>
    [0, 72, 144, 216, 288].map((g) => C(n(x + Math.cos((g * Math.PI) / 180) * r), n(y + Math.sin((g * Math.PI) / 180) * r), n(r * 0.8), f)).join("") + C(x, y, n(r * 0.7), mitte);
  // Eine Flamme (Kerze, Laterne) mit hellem Kern, Spitze bei (x, y).
  const flamme = (x, y, k = 1) => C(x, n(y + 4 * k), n(5 * k), SCHEIN, `opacity="0.5"`) +
    P(`M${x} ${y}q${n(3 * k)} ${n(4 * k)} ${n(2.4 * k)} ${n(6 * k)}q-${n(0.8 * k)} ${n(1.6 * k)}-${n(2.4 * k)} ${n(1.6 * k)}t-${n(2.4 * k)}-${n(1.6 * k)}q-${n(0.6 * k)}-${n(2 * k)} ${n(2.4 * k)}-${n(6 * k)}z`, ORANGE) +
    E(x, n(y + 5.6 * k), n(1.1 * k), n(1.8 * k), GLUT);
  // Ein Blatt, schräg gestellt.
  const blatt = (x, y, rx, ry, f, winkel) => E(x, y, rx, ry, f, `transform="rotate(${winkel} ${x} ${y})"`);
  // Ein kleiner Pokal für die Vitrine, unten Mitte bei (x, y).
  const pokalKlein = (x, y, k, f, hell, dunkel) =>
    R(n(x - 6 * k), n(y - 3 * k), n(12 * k), n(3 * k), dunkel, 1) + R(n(x - 1.5 * k), n(y - 8 * k), n(3 * k), n(5 * k), f) +
    S(`M${n(x - 7 * k)} ${n(y - 19 * k)}q-${n(4 * k)} 0-${n(4 * k)} ${n(3 * k)}t${n(5 * k)} ${n(4 * k)}M${n(x + 7 * k)} ${n(y - 19 * k)}q${n(4 * k)} 0 ${n(4 * k)} ${n(3 * k)}t-${n(5 * k)} ${n(4 * k)}`, dunkel, n(1.6 * k)) +
    P(`M${n(x - 7.5 * k)} ${n(y - 21 * k)}h${n(15 * k)}q0 ${n(10 * k)}-${n(7.5 * k)} ${n(12 * k)}q-${n(7.5 * k)}-${n(2 * k)}-${n(7.5 * k)}-${n(12 * k)}z`, f) +
    R(n(x - 5 * k), n(y - 19 * k), n(2.4 * k), n(7 * k), hell, 1);

  const DINGE = {
    // --- Frühling ---------------------------------------------------------------
    j_osternest: { name: "Osternest", der: "das Osternest", kat: "deko", klein: true, w: 42, h: 26, tags: ["ostern", "fruehling"], d: () =>
      E(0, -10, 19, 5, "#8a5734") +
      E(-9, -14, 5, 6.5, "#ff7aa2") + S("M-13.5 -15l3-2 3 2 3-2", WEISS, 1.3) +
      E(1, -17, 5, 6.5, GLUT) + C(-0.5, -19, 1.1, "#ff7a7a") + C(2.5, -17, 1.1, "#ff7a7a") + C(0, -15, 1.1, "#ff7a7a") +
      E(10, -14, 4.6, 6, "#6cc3d5") + S("M5.6 -13h8.8", WEISS, 1.6) + S("M6 -16h8", "#3a86ff", 1.1) +
      P("M-18 -10l1-5 2 3 1-5 2 4 2-4 1 4 2-5 2 5 2-4 1 4 2-5 2 5 2-4 1 4 2-5 2 5 1-4 2 5 2-4 1 5z", "#7cc05e") +
      P("M-20 -11q2 11 20 11t20-11q-8 5-20 5t-20-5z", "#c98d55") + S("M-17 -7q17 5 34 0M-13 -3q13 3 26 0", "#a86a30", 1.2) },
    j_osterhase: { name: "Schoggihase", der: "der Schoggihase", kat: "essen", klein: true, w: 24, h: 34, tags: ["ostern", "essen", "fruehling"], d: () =>
      E(-2.5, -27, 2.4, 6, SCHOGGI, `transform="rotate(-12 -2.5 -27)"`) + E(3.5, -27.5, 2.4, 6, SCHOGGI, `transform="rotate(14 3.5 -27.5)"`) +
      E(-2.5, -27, 1, 4, "#a86a30", `transform="rotate(-12 -2.5 -27)"`) + E(3.5, -27.5, 1, 4, "#a86a30", `transform="rotate(14 3.5 -27.5)"`) +
      E(-1, -8, 9.5, 8, SCHOGGI) + C(1, -18, 6.5, SCHOGGI) + C(-9.5, -8, 3, "#7a4a2a") +
      P("M-6 -11q0-5 4-6", "none", `stroke="#b07a4f" stroke-width="2" stroke-linecap="round"`) + C(-1.5, -20.5, 1.2, "#b07a4f") +
      C(3.5, -19, 1.1, "#3d2414") + C(7, -16.5, 1.2, "#5b3a29") + E(5, -1.5, 4.2, 1.8, "#a86a30") +
      S("M-4 -12.5q5 2.5 10 0", "#ef5350", 2) + P("M1 -11.5l-4-2.5v5zM1 -11.5l4-2.5v5z", "#ef5350") + C(1, -9.5, 1.8, GLUT) },
    j_tulpen: { name: "Tulpentopf", der: "der Tulpentopf", kat: "deko", klein: true, w: 30, h: 44, farbe: "#ff5c7a", tags: ["blumen", "pflanze", "fruehling"], d: (c) => {
      const tulpe = (x, y, f) => P(`M${x - 4.5} ${y - 7}q-0.5 9 4.5 9t4.5-9l-2.2 2.6-2.3-3.6-2.3 3.6z`, f) + P(`M${x - 1} ${y - 4}q-0.5 4 1 6`, "none", `stroke="${shade(f, 0.35)}" stroke-width="1.2" stroke-linecap="round"`);
      return S("M-7 -16q-2-6-1-12M0 -16v-18M7 -16q1-5 1-10", "#4aa34a", 2) +
        P("M-2 -16q-10-4-12-14q8 2 12 14z", "#5cb85c") + P("M2 -16q10-2 12-12q-9 1-12 12z", "#4aa34a") +
        tulpe(-8, -28, c) + tulpe(0, -35, shade(c, 0.22)) + tulpe(8, -26, shade(c, -0.12)) + topf(18, 12, "#d9734e");
    } },
    j_vogelhaus: { name: "Vogelhäuschen mit Blüten", der: "das Vogelhäuschen mit Blüten", kat: "deko", art: "wand", w: 56, h: 60, farbe: "#6cc3d5", tags: ["vogel", "fruehling"], d: (c) =>
      S("M-27 -24q22-8 54 0", "#8a5734", 3) + S("M-12 -27q-4-4-2-8M14 -26q4-4 3-8", "#8a5734", 1.6) +
      bluete(-20, -26, 2.6, "#ffb3c7") + bluete(-13, -35, 2.2, WEISS) + bluete(6, -29, 2.4, "#ffb3c7") + bluete(17, -34, 2.2, WEISS) + bluete(22, -25, 2.4, "#ffb3c7") +
      blatt(-4, -28, 3, 1.6, "#7cc05e", -20) + blatt(12, -24, 3, 1.6, "#7cc05e", 25) +
      S("M0 -26v8", METALL_D, 1.2) +
      R(-13, -6, 26, 25, c, 2) + R(-13, -6, 26, 4, shade(c, -0.18)) + P("M-19 -4l19-15l19 15z", "#ef5350") + S("M-19 -4l19-15l19 15", shade("#ef5350", -0.2), 2.4) +
      C(0, 4, 5.5, "#5b3a29") + C(-1.5, 2.5, 1.4, shade(c, 0.4)) + S("M0 11.5v4", HOLZ_D, 2) + R(-16, 19, 32, 4, HOLZ_D, 2) +
      C(-9, 18.5, 0.9, "#c98d55") + C(-6, 18.3, 0.9, "#c98d55") + C(9, 18.5, 0.9, "#c98d55") +
      E(18, 15, 6, 4.3, GLUT) + C(22, 10.5, 3.6, "#3a86ff") + C(23.3, 11.4, 1.6, WEISS) + C(23.4, 11, 0.7, TINTE) + P("M25.4 11.8l2.6 0.8-2.6 1.1z", ORANGE) +
      P("M12.5 14q-3 1-4 4l5-1z", "#4f8ef7") + S("M17 19v3M20 19v3", ORANGE, 1) },
    j_kranz: { name: "Frühlingskranz", der: "der Frühlingskranz", kat: "deko", art: "wand", w: 52, h: 52, farbe: "#ff9fb5", tags: ["blumen", "fruehling"], d: (c) => {
      const ring = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const a = (i * Math.PI) / 6;
        const x = n(Math.cos(a) * 17);
        const y = n(Math.sin(a) * 17);
        return blatt(x, y, 5.5, 2.6, i % 2 ? "#5cb85c" : "#7cc05e", n((a * 180) / Math.PI + 90 + (i % 2 ? 20 : -20)));
      }).join("");
      const blueten = [[-30, "#ffd166"], [30, WEISS], [150, "#a78bfa"], [-150, WEISS], [-90, "#ff7aa2"], [10, "#a78bfa"], [-60, WEISS], [170, "#ffd166"]].map(([g, f]) => {
        const a = (g * Math.PI) / 180;
        return bluete(n(Math.cos(a) * 17), n(Math.sin(a) * 17), 2.6, f, f === "#ffd166" ? ORANGE : GLUT);
      }).join("");
      return S("M0 -26v8", METALL_D, 1.2) + C(0, 0, 17, "none", `stroke="#4aa34a" stroke-width="5"`) + ring + blueten +
        P("M0 17l-9-5q-3 5 1 8zM0 17l9-5q3 5-1 8z", c) + P("M-1 18l-5 9 3-1 1 3 3-9zM1 18l5 9-3-1-1 3-3-9z", shade(c, -0.15)) + C(0, 17, 2.6, shade(c, -0.25));
    } },
    j_gummistiefel: { name: "Gummistiefel", der: "die Gummistiefel", kat: "deko", klein: true, w: 36, h: 30, farbe: "#ffd166", tags: ["gummistiefel", "fruehling"], d: (c) => {
      const stiefel = (x, f) => P(`M${x} -27h11v17q8 0 10 5v5h-21z`, f) + R(x - 1, -29, 13, 4, shade(f, -0.15), 2) + R(x, -3, 21, 3, DUNKEL, 1.5) +
        R(x + 2, -24, 2.4, 14, shade(f, 0.35), 1.2) + C(x + 7, -19, 1.4, WEISS) + C(x + 5, -13, 1.4, WEISS) + C(x + 14, -6, 1.4, WEISS);
      return stiefel(-17, shade(c, -0.12)) + stiefel(-5, c);
    } },

    // --- Sommer ------------------------------------------------------------------
    j_sonnenschirm: { name: "Sonnenschirm", der: "der Sonnenschirm", kat: "deko", w: 100, h: 120, farbe: "#ef5350", tags: ["sommer"], d: (c) => {
      const kanten = [-48, -32, -16, 0, 16, 32, 48];
      let dach = "";
      for (let i = 0; i < 6; i += 1) {
        const a = kanten[i];
        const b = kanten[i + 1];
        dach += P(`M0 -114Q${n(a * 0.7)} -112 ${a} -92Q${n((a + b) / 2)} -86 ${b} -92Q${n(b * 0.7)} -112 0 -114Z`, i % 2 ? WEISS : c, `stroke="${shade(c, -0.2)}" stroke-width="1" stroke-linejoin="round"`);
      }
      return E(0, -3, 15, 4, DUNKEL) + R(-9, -9, 18, 7, METALL_D, 3) + R(-1.8, -100, 3.6, 92, "#e2e8f0") + R(-1.8, -60, 3.6, 6, METALL_D, 1) +
        dach + kanten.map((x) => C(x, -91, 1.8, shade(c, -0.25))).join("") + R(-1.5, -120, 3, 7, METALL_D, 1.5) + C(0, -120, 2.6, GLUT);
    } },
    j_planschbecken: { name: "Planschbecken", der: "das Planschbecken", kat: "spielen", w: 112, h: 42, farbe: "#4f8ef7", tags: ["sommer", "becken", "wasser"], d: (c) =>
      R(-54, -10, 108, 10, c, 5) + R(-54, -20, 108, 10, WEISS, 5, `stroke="${RAND}" stroke-width="1"`) + R(-54, -30, 108, 10, c, 5) +
      R(-46, -28, 30, 2.4, shade(c, 0.4), 1.2) + R(-46, -8, 30, 2.4, shade(c, 0.4), 1.2) +
      E(0, -30, 49, 3.6, "#8fd6f5") + S("M-30 -30q6-2 12 0M8 -30q6-2 12 0", WEISS, 1.2) +
      E(24, -32, 6.5, 3.8, "#ffd166") + C(28, -37, 3.6, "#ffd166") + P("M31 -37.5l4 1-4 1.6z", ORANGE) + C(29, -38, 0.8, TINTE) + P("M19 -34q-3-3-1-5", "none", `stroke="#ffd166" stroke-width="2" stroke-linecap="round"`) +
      C(-30, -36, 6, WEISS) + P("M-30 -42a6 6 0 0 1 6 6h-6z", "#ef5350") + P("M-36 -36a6 6 0 0 0 6 6v-6z", "#ffd166") + P("M-30 -30a6 6 0 0 0 6-6h-6z", "#3a86ff") },
    j_ventilator: { name: "Ventilator", der: "der Ventilator", kat: "deko", w: 46, h: 76, farbe: "#6cc3d5", tags: ["sommer", "klima"], d: (c) =>
      E(0, -3, 16, 4.5, shade(c, -0.2)) + R(-2, -46, 4, 42, METALL) + R(-4, -42, 8, 5, METALL_D, 2) + R(-5, -62, 10, 10, shade(c, -0.2), 4) +
      [0, 120, 240].map((g) => P("M0 0q-6-8-3-15q6 0 6 9z", c, `transform="translate(0 -58) rotate(${g})"`)).join("") +
      C(0, -58, 17, "none", `stroke="${METALL}" stroke-width="2"`) + C(0, -58, 11, "none", `stroke="${METALL}" stroke-width="1" opacity="0.7"`) +
      S("M0 -75v34M-17 -58h34M-12 -70l24 24M12 -70l-24 24", METALL, 0.8, `opacity="0.7"`) + C(0, -58, 4, shade(c, -0.25)) + C(-1, -59, 1.4, WEISS) +
      S("M20 -66q4 2 0 5M22 -56q4 2 0 5", "#a8ddf0", 1.4) },
    j_glacebecher: { name: "Glacebecher", der: "der Glacebecher", kat: "essen", klein: true, w: 24, h: 40, tags: ["glace", "essen", "sommer"], d: () =>
      E(0, -1.6, 7, 1.8, "#cfe9f3") + R(-1.2, -9, 2.4, 8, "#cfe9f3") +
      R(4, -34, 2.6, 16, "#e8b06a", 1, `transform="rotate(20 5 -26)"`) + S("M4.5 -30l2.5-1M5.5 -26l2.5-1", "#c98a45", 0.8, `transform="rotate(20 5 -26)"`) +
      C(-5, -21, 5, "#ff9fb5") + C(5, -21, 5, "#fff1b8") + C(0, -25, 5, SCHOGGI) +
      C(-2.4, -29, 2.6, WEISS) + C(2.4, -29, 2.6, WEISS) + C(0, -31.4, 2.4, WEISS) + C(0.5, -34.6, 2, "#ef5350") + S("M0.5 -36.6q1-2.4 3-2.4", "#5cb85c", 0.9) +
      P("M-10 -19h20q-1 10-10 12q-9-2-10-12z", "#e6f6fc", `opacity="0.9" stroke="${RAND}" stroke-width="1"`) + S("M-7 -17q0 5 3 7", WEISS, 1.4) },
    j_sonnenbrille: { name: "Sonnenbrille", der: "die Sonnenbrille", kat: "deko", klein: true, w: 32, h: 12, farbe: "#ff7aa2", tags: ["sommer"], d: (c) =>
      E(0, -0.8, 15, 1.4, "#000000", `opacity="0.1"`) + S("M-15 -7l-1 6M15 -7l1 6", shade(c, -0.25), 1.6) +
      R(-15, -11, 13, 10, c, 4) + R(2, -11, 13, 10, c, 4) + R(-13.5, -9.5, 10, 7, "#2d3748", 3) + R(3.5, -9.5, 10, 7, "#2d3748", 3) +
      S("M-2 -7.5q2-2 4 0", c, 2) + S("M-11 -6l3-2.5M6 -6l3-2.5", WEISS, 1.1, `opacity="0.75"`) },
    j_badetuch: { name: "Badetuch", der: "das Badetuch", kat: "bad", art: "flach", w: 106, h: 13, farbe: "#ff9f43", tags: ["sommer", "handtuch"], d: (c) =>
      P("M-46 -11H46L51 0H-51Z", c) + [-28, -8, 12, 32].map((x) => P(`M${x - 3} -11h6l${n(x * 0.11 + 0.6)} 11h-${n(6 * 1.1)}z`, WEISS)).join("") +
      P("M-51 0H51L50 1.5H-50Z", shade(c, -0.25)) + S("M-47 -10l-5 10M47 -10l5 10", shade(c, -0.3), 1.2, `stroke-dasharray="1.2 1.4"`) },

    // --- Herbst --------------------------------------------------------------------
    j_kuerbis: { name: "Kürbis", der: "der Kürbis", kat: "deko", klein: true, w: 42, h: 34, farbe: "#ff9f43", tags: ["herbst", "kuerbis"], d: (c) =>
      S("M2 -26q6-6 12-2q2 4-2 5", "#5cb85c", 1.4) + blatt(10, -29, 5, 2.6, "#7cc05e", -20) +
      E(-9, -13, 10, 12.5, shade(c, -0.12)) + E(9, -13, 10, 12.5, shade(c, -0.12)) + E(0, -13, 10.5, 13, c) +
      S("M-4 -24q-3 10 0 21M4 -24q3 10 0 21", shade(c, -0.22), 1.3) + S("M-15 -20q-2 6 0 10", shade(c, 0.3), 2) +
      P("M-2 -25l1-6h3l1 6z", "#8a5734") },
    j_kuerbislicht: { name: "Kürbislaterne", der: "die Kürbislaterne", kat: "deko", klein: true, licht: true, w: 42, h: 36, tags: ["herbst", "kuerbis", "laterne"], d: () =>
      C(0, -14, 21, SCHEIN, `opacity="0.35"`) +
      E(-9, -13, 10, 12.5, "#e8822a") + E(9, -13, 10, 12.5, "#e8822a") + E(0, -13, 10.5, 13, ORANGE) +
      S("M-15 -20q-2 6 0 10", "#ffc07a", 2) + P("M-2 -25l1-6h3l1 6z", "#8a5734") + S("M2 -28q5-5 9-1", "#5cb85c", 1.4) +
      P("M-11 -15q3-6 6 0q-3-2-6 0z", GLUT) + P("M5 -15q3-6 6 0q-3-2-6 0z", GLUT) +
      P("M-9 -9q9 8 18 0q-2 6-9 6t-9-6z", GLUT) + E(0, -6, 4, 1.4, SCHEIN) + C(-12, -10, 1.8, "#ff7a7a", `opacity="0.6"`) + C(12, -10, 1.8, "#ff7a7a", `opacity="0.6"`) },
    j_raebeliechtli: { name: "Räbeliechtli", der: "das Räbeliechtli", kat: "deko", klein: true, licht: true, w: 30, h: 52, tags: ["herbst", "laterne"], d: () =>
      C(0, -15, 16, SCHEIN, `opacity="0.4"`) +
      S("M-10 -27L0 -46M10 -27L0 -46M0 -25V-46", "#c4a57e", 1) + R(-8, -49, 16, 3.4, HOLZ_D, 1.7) +
      S("M0 -3q1 2 3 2.4", "#b9a58e", 1.2) +
      P("M-11 -27q-5 15 2 21q9 6 18 0q7-6 2-21z", "#f6eedd") + P("M-11 -27q0 5 1 9h20q1-4 1-9z", "#c48ac0", `opacity="0.85"`) +
      E(0, -27, 11, 3, "#e9dcc0") + E(0, -27, 8.6, 2, "#ffb347") +
      sternRand(-4, -13, 3.6, GLUT, ORANGE, 0.8) + P("M5 -18a4 4 0 1 0 2 7a3 3 0 1 1-2-7z", GLUT) + C(4, -6, 1.3, GLUT) + C(-6, -6, 1.1, GLUT) + C(7, -22, 1, GLUT) },
    j_laubkorb: { name: "Laubkorb", der: "der Laubkorb", kat: "deko", w: 56, h: 44, tags: ["herbst", "laub"], d: () =>
      [[-16, -32, "#e8763a", 30], [-4, -38, "#ffb347", -20], [9, -35, "#d9734e", 40], [18, -28, "#ffd166", -30], [-20, -24, "#ff9f43", 10], [2, -30, "#a86a30", 70], [-9, -30, "#ef5350", -50], [13, -24, "#e8763a", 20]]
        .map(([x, y, f, g]) => blatt(x, y, 7, 4, f, g)).join("") +
      S("M-22 -22q-8-4-6-12M22 -22q8-4 6-12", HOLZ_D, 2.6) +
      P("M-24 -22h48l-5 22h-38z", HOLZ) + S("M-22 -15h44M-21 -8h42", HOLZ_D, 1.6) + S("M-12 -22l1 22M0 -22v22M12 -22l-1 22", HOLZ_D, 1.2, `opacity="0.6"`) +
      R(-25, -24, 50, 4, HOLZ_D, 2) + blatt(26, -2, 5, 2.6, "#ffb347", 20) + blatt(-27, -1.6, 4.6, 2.4, "#e8763a", -15) },
    j_pilzkorb: { name: "Pilzkörbchen", der: "das Pilzkörbchen", kat: "essen", klein: true, w: 36, h: 32, tags: ["herbst", "pilze", "essen"], d: () =>
      S("M-13 -12q13-22 26 0", HOLZ, 1.8) +
      R(-9.5, -19, 5, 8, "#f4ead5", 2) + P("M-14 -18q7-11 14 0z", "#9a5b2e") + P("M-11 -20q3-4 6-5", "none", `stroke="#c98d55" stroke-width="1.4" stroke-linecap="round"`) +
      R(1.5, -22, 5.4, 11, "#f4ead5", 2) + P("M-3 -21q8-12 16 0z", "#7a4a22") + P("M0 -23q3-5 7-6", "none", `stroke="#b07a4f" stroke-width="1.4" stroke-linecap="round"`) +
      P("M-6 -11l-2.4-5q4.4-2.4 8.8 0l-2.4 5z", "#ffb020") + P("M7 -11l-1.6-4q3.6-2 7.2 0l-1.6 4z", "#ffc340") +
      P("M-16 -12h32l-4 12h-24z", HOLZ) + S("M-15 -7h30M-13 -3h26", HOLZ_D, 1.2) + R(-17, -13, 34, 3, HOLZ_D, 1.5) },
    j_drachen: { name: "Drachen", der: "der Drachen", kat: "spielen", art: "wand", w: 60, h: 100, farbe: "#ef5350", tags: ["herbst", "drachen", "spielzeug"], d: (c) =>
      S("M0 6q12 10 0 20t0 20", "#6b7280", 1.4) + [[-6, 16, "#4f8ef7"], [6, 28, "#7cc05e"], [-6, 40, GLUT]].map(([x, y, f]) => P(`M${x - 5} ${y - 3}l5 3-5 3zM${x + 5} ${y - 3}l-5 3 5 3z`, f)).join("") +
      P("M0 -48L26 -18L0 6L-26 -18z", c) + P("M0 -48L26 -18H0z", GLUT) + P("M0 6L-26 -18H0z", shade(c, 0.3)) +
      S("M0 -48V6M-26 -18H26", WEISS, 1.8) +
      C(-6, -22, 1.8, TINTE) + C(6, -22, 1.8, TINTE) + S("M-5 -15q5 4 10 0", TINTE, 1.6) + C(-10, -15, 2, "#ff9fb5", `opacity="0.8"`) + C(10, -15, 2, "#ff9fb5", `opacity="0.8"`) },

    // --- Winter --------------------------------------------------------------------
    j_weihnachtsbaum: { name: "Weihnachtsbaum", der: "der Weihnachtsbaum", kat: "deko", licht: true, w: 96, h: 150, farbe: "#ef5350", tags: ["winter", "weihnachtsbaum"], d: (c) => {
      const kugel = (x, y, f, r = 4) => C(x, y, r, f) + C(n(x - r * 0.35), n(y - r * 0.35), n(r * 0.3), WEISS, `opacity="0.8"`) + R(n(x - 1), n(y - r - 1.6), 2, 2, GOLD_D, 0.5);
      const lichter = [[-30, -32], [-6, -26], [20, -30], [36, -34], [-20, -66], [4, -62], [24, -66], [-12, -96], [12, -98], [0, -112]];
      return P("M-14 -16h28l-3 16h-22z", HOLZ_D) + R(-15, -18, 30, 4, HOLZ_DD, 2) + R(-4.5, -28, 9, 12, "#8a5734") +
        P("M-44 -26L0 -74L44 -26Q0 -16 -44 -26Z", TANNE) + P("M-35 -60L0 -102L35 -60Q0 -51 -35 -60Z", "#4fb35a") + P("M-26 -92L0 -128L26 -92Q0 -85 -26 -92Z", "#5cc064") +
        P("M-44 -26Q0 -16 44 -26l-3-4Q0 -21 -41 -30z", "#358a40") + P("M-35 -60Q0 -51 35 -60l-3-4Q0 -56 -32 -64z", TANNE) + P("M-26 -92Q0 -85 26 -92l-3-4Q0 -89 -23 -96z", "#4fb35a") +
        S("M-36 -36Q0 -22 30 -44M-28 -70Q0 -58 24 -76M-18 -102Q0 -94 14 -108", GLUT, 2) +
        lichter.map(([x, y]) => C(x, y, 1.6, SCHEIN)).join("") +
        kugel(-26, -40, c) + kugel(10, -34, GLUT) + kugel(30, -42, c, 4.4) + kugel(-12, -50, shade(c, 0.35)) +
        kugel(-16, -78, GLUT) + kugel(14, -72, c) + kugel(-2, -86, shade(c, 0.35), 3.6) + kugel(8, -108, c, 3.4) + kugel(-12, -112, GLUT, 3) +
        C(0, -134, 14, SCHEIN, `opacity="0.45"`) + sternRand(0, -134, 11, GOLD, GOLD_R, 1.8) + stern(-1, -135, 5.5, GOLD_H) +
        R(-42, -12, 18, 12, "#7c5ce6", 2) + R(-34.5, -12, 3, 12, GLUT) + S("M-33 -12q-5-5-7 0M-33 -12q5-5 7 0", GLUT, 1.5) +
        R(24, -10, 16, 10, "#6cc3d5", 2) + R(30.5, -10, 3, 10, WEISS) + S("M32 -10q-4-4-6 0M32 -10q4-4 6 0", WEISS, 1.4);
    } },
    j_adventskranz: { name: "Adventskranz", der: "der Adventskranz", kat: "deko", klein: true, licht: true, w: 48, h: 32, farbe: "#ef5350", tags: ["winter", "advent", "kerze"], d: (c) => {
      const kerze = (x, y, h) => R(x - 3, y - h, 6, h, c, 1.5) + R(x - 3, y - h, 2, h, shade(c, 0.3), 1) + S(`M${x} ${y - h}v-2`, TINTE, 0.8) + flamme(x, y - h - 9, 0.9);
      return E(0, -7, 22, 6.5, "#2f7a3a") + kerze(-13, -9, 12) + kerze(13, -9, 10) +
        E(0, -7, 13, 3, "#245e2d") + P("M-22 -7q0 7 22 7t22-7q0 4-22 4t-22-4z", "#3f8f3f") +
        [[-18, -4], [-10, -2], [-2, -1.5], [8, -2], [16, -3.5], [20, -8], [-20, -9]].map(([x, y], i) => blatt(x, y, 4, 1.8, i % 2 ? "#5cb85c" : "#4aa34a", i * 30 - 60)).join("") +
        kerze(-5, -3, 8) + kerze(6, -3, 6) +
        C(-15, -2.5, 1.6, "#ef5350") + C(-13, -1.5, 1.6, "#ef5350") + C(17, -3, 1.6, "#ef5350") + C(1, -0.5, 1.4, GOLD);
    } },
    j_schneekugel: { name: "Schneekugel", der: "die Schneekugel", kat: "deko", klein: true, w: 26, h: 32, farbe: "#ef5350", tags: ["winter", "schneemann"], d: (c) =>
      C(0, -19, 11, "#cfe9f3") + P("M-11 -17q11 4 22 0v1a11 11 0 0 1-22 0z", WEISS) + P("M4 -14l4-9 4 9z", TANNE) +
      C(-3, -12, 3.6, WEISS) + C(-3, -17.5, 2.6, WEISS) + C(-3.8, -18, 0.5, TINTE) + C(-2.2, -18, 0.5, TINTE) + P("M-3 -17.2l2 0.6-2 0.5z", ORANGE) +
      [[-6, -25], [2, -27], [6, -21], [-8, -20], [0, -22], [8, -26]].map(([x, y]) => C(x, y, 0.8, WEISS)).join("") +
      P("M-6 -27q3-3 7-3", "none", `stroke="${WEISS}" stroke-width="1.6" stroke-linecap="round" opacity="0.85"`) +
      C(0, -19, 11, "none", `stroke="#a8ddf0" stroke-width="1.2"`) + P("M-10 -9h20l2 9h-24z", c) + R(-10, -9, 20, 2.4, shade(c, -0.2), 1) + C(0, -4, 1.6, GLUT) },
    j_lebkuchenhaus: { name: "Lebkuchenhaus", der: "das Lebkuchenhaus", kat: "essen", klein: true, w: 40, h: 38, tags: ["winter", "lebkuchen", "essen"], d: () =>
      R(8, -34, 5, 9, "#a86a30", 1) + R(7.4, -36, 6.2, 3, WEISS, 1.5) +
      R(-15, -19, 30, 19, "#c98a45", 1.5) + P("M-19 -17L0 -35L19 -17Z", "#a86a30") + P("M-19 -17L0 -35L19 -17", "none", `stroke="${WEISS}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`) +
      S("M-15 -21l3 3 3-3 3 3 3-3 3 3 3-3 3 3 3-3 3 3", WEISS, 1.2) +
      C(-10, -23, 1.6, "#ef5350") + C(0, -30, 1.6, "#7cc05e") + C(9, -24, 1.6, "#3a86ff") + C(-5, -27, 1.4, GLUT) + C(5, -28, 1.4, "#ff7aa2") +
      P("M-4 0v-8a4 4 0 0 1 8 0v8z", "#8a5734") + P("M-4 0v-8a4 4 0 0 1 8 0v8", "none", `stroke="${WEISS}" stroke-width="1.2"`) + C(2, -4, 0.9, GLUT) +
      R(-12, -15, 6, 6, "#ffd166", 1, `stroke="${WEISS}" stroke-width="1.4"`) + R(7, -15, 6, 6, "#ffd166", 1, `stroke="${WEISS}" stroke-width="1.4"`) +
      C(-12, -3, 1.6, "#ef5350") + C(-8, -3, 1.6, WEISS) + C(9, -3, 1.6, "#7cc05e") + C(13, -3, 1.6, WEISS) },
    j_chlaussack: { name: "Chlaussack", der: "der Chlaussack", kat: "essen", w: 56, h: 48, tags: ["winter", "samichlaus", "nuesse", "fruechte"], d: () => {
      const mandarine = (x, y, r = 5) => C(x, y, r, ORANGE) + C(n(x - r * 0.35), n(y - r * 0.35), n(r * 0.28), "#ffc07a") + blatt(n(x + 1.5), n(y - r), 2.6, 1.2, "#5cb85c", -20);
      const nuss = (x, y, g = 0) => P(`M${x - 4} ${y}q0-3 2-3q2 1 4 0q2 0 2 3t-2 3q-2-1-4 0q-2 0-2-3z`, "#d8b07a", `transform="rotate(${g} ${x} ${y})"`) + S(`M${x - 1} ${y - 2}v4M${x + 1.5} ${y - 2}v4`, "#b9894f", 0.7, `transform="rotate(${g} ${x} ${y})"`);
      return P("M-22 0q-7-22 1-36q21-6 42 0q8 14 1 36z", "#c9a46a") +
        mandarine(-12, -38) + mandarine(-1, -42, 5.5) + nuss(9, -40, -20) + C(15, -37, 3.6, "#a86a30") + S("M15 -40.4v6.8", "#7a4a20", 0.8) + mandarine(5, -35, 4.6) + nuss(-7, -34, 25) +
        P("M-22 -33q22 7 44 0l1 5q-23 7-46 0z", "#b48d52") + S("M-16 -24q2 10-1 20M14 -24q-2 10 1 20M-2 -20v18", "#b48d52", 1.2, `opacity="0.8"`) +
        S("M-20 -30q-6 2-8 8", "#ef5350", 1.6) + C(-28, -21, 1.8, "#ef5350") +
        blatt(-24, -36, 6, 2, TANNE, -30) + blatt(-27, -32, 5, 1.8, "#4fb35a", -10) +
        mandarine(23, -4, 4.4) + nuss(-25, -3, 10) + nuss(14, -2, -15);
    } },
    j_schneemann: { name: "Watte-Schneemann", der: "der Watte-Schneemann", kat: "deko", klein: true, w: 28, h: 40, farbe: "#ef5350", tags: ["winter", "schneemann"], d: (c) => {
      const watte = (x, y, r) => [0, 45, 90, 135, 180, 225, 270, 315].map((g) => C(n(x + Math.cos((g * Math.PI) / 180) * r * 0.82), n(y + Math.sin((g * Math.PI) / 180) * r * 0.82), n(r * 0.32), "#f1f5f9")).join("") + C(x, y, r, WEISS);
      return E(0, -1.5, 12, 2.6, HOLZ_D) + watte(0, -11, 9.5) + watte(0, -25, 7) +
        C(0, -14, 1.1, TINTE) + C(0, -9, 1.1, TINTE) + C(-2.4, -27, 1, TINTE) + C(2.4, -27, 1, TINTE) + P("M0 -25l6 1.2-6 1.4z", ORANGE) +
        S("M-2.6 -22q2.6 1.6 5.2 0", TINTE, 0.8) + R(-7, -20, 14, 3.4, c, 1.7) + R(3, -19, 3.4, 8, shade(c, -0.12), 1.5) +
        R(-7.5, -33, 15, 2.4, "#2d3748", 1.2) + R(-5, -40, 10, 8, "#2d3748", 1.5) + R(-5, -35.5, 10, 1.8, c);
    } },

    // --- Gold: Belohnungen ------------------------------------------------------
    g_sofa: { name: "Goldenes Sofa", der: "das goldene Sofa", kat: "sitzen", w: 128, h: 66, farbe: "#c0392b", tags: ["sofa", "sitz", "gold"], d: (c) =>
      C(-48, -3.5, 4, GOLD_D) + C(48, -3.5, 4, GOLD_D) + R(-50, -10, 5, 7, GOLD, 2) + R(45, -10, 5, 7, GOLD, 2) +
      P("M-56 -28v-14q0-16 56-18q56 2 56 18v14z", GOLD, `stroke="${GOLD_R}" stroke-width="2"`) + P("M-49 -28v-12q0-11 49-13q49 2 49 13v12z", c) +
      [[-30, -44], [-10, -46], [10, -46], [30, -44], [-20, -36], [0, -37], [20, -36]].map(([x, y]) => C(x, y, 1.6, GOLD_H)).join("") +
      R(-52, -30, 104, 16, shade(c, -0.12), 6) + R(-47, -36, 45, 12, shade(c, 0.12), 6) + R(2, -36, 45, 12, shade(c, 0.12), 6) +
      R(-56, -16, 112, 8, GOLD, 4, `stroke="${GOLD_R}" stroke-width="1.4"`) + R(-50, -13.5, 100, 2, GOLD_H, 1) +
      C(-36, -12, 1.8, "#ff7aa2") + C(0, -12, 2, "#4f8ef7") + C(36, -12, 1.8, "#4cc46b") +
      R(-64, -40, 14, 30, GOLD, 7, `stroke="${GOLD_R}" stroke-width="1.6"`) + R(50, -40, 14, 30, GOLD, 7, `stroke="${GOLD_R}" stroke-width="1.6"`) +
      C(-57, -39, 5, GOLD_H) + C(-57, -39, 2.2, GOLD_D) + C(57, -39, 5, GOLD_H) + C(57, -39, 2.2, GOLD_D) +
      sternRand(0, -59, 7, GOLD_H, GOLD_R, 1.6) +
      glitzer(funkeln(-42, -54, 6) + funkeln(60, -22, 4.5), funkeln(40, -56, 5.5) + funkeln(-60, -22, 4)) },
    g_bett: { name: "Goldenes Bett", der: "das goldene Bett", kat: "sitzen", w: 140, h: 100, farbe: "#7c5ce6", tags: ["bett", "gold"], d: (c) =>
      R(-70, -82, 16, 82, GOLD, 6, `stroke="${GOLD_R}" stroke-width="1.6"`) + R(-66, -76, 3, 66, GOLD_H, 1.5) +
      P("M-73 -84l-3-12 7 6 7-10 7 10 7-6-3 12z", GOLD, `stroke="${GOLD_R}" stroke-width="1.6" stroke-linejoin="round"`) +
      C(-76, -97, 2, "#ff7aa2") + C(-62, -101, 2.2, "#4f8ef7") + C(-48, -97, 2, "#4cc46b") +
      R(54, -56, 16, 56, GOLD, 6, `stroke="${GOLD_R}" stroke-width="1.6"`) + C(62, -60, 5.5, GOLD_H, `stroke="${GOLD_R}" stroke-width="1.4"`) + R(58, -50, 3, 40, GOLD_H, 1.5) +
      R(-56, -32, 112, 14, GOLD, 4, `stroke="${GOLD_R}" stroke-width="1.4"`) + R(-50, -28, 100, 2.4, GOLD_H, 1) +
      C(-30, -22, 2, "#ff7aa2") + C(0, -22, 2.2, "#4f8ef7") + C(30, -22, 2, "#4cc46b") +
      leg(-52, 18, GOLD_D) + leg(46, 18, GOLD_D) +
      R(-56, -46, 112, 16, "#fbf8f2", 7) + R(-53, -58, 32, 14, WEISS, 7, `stroke="${GOLD}" stroke-width="1.6"`) +
      P("M-18 -48h64a8 8 0 0 1 8 8v12h-72z", c) + P("M-18 -48h64a8 8 0 0 1 8 8v2h-72z", shade(c, 0.25)) +
      stern(4, -36, 3.6, GOLD_H) + stern(22, -33, 3, GOLD_H) + stern(40, -37, 3.4, GOLD_H) +
      glitzer(funkeln(-80, -76, 6) + funkeln(70, -70, 4.5), funkeln(-46, -88, 5) + funkeln(78, -48, 4)) },
    g_thron: { name: "Thron", der: "der Thron", kat: "sitzen", w: 76, h: 124, farbe: "#c0392b", tags: ["sitz", "stuhl", "gold"], d: (c) =>
      leg(-27, 30, GOLD_D, 6) + leg(21, 30, GOLD_D, 6) + C(-24, -2.5, 4, GOLD) + C(24, -2.5, 4, GOLD) +
      P("M-27 -40V-92q0-14 27-16q27 2 27 16V-40z", GOLD, `stroke="${GOLD_R}" stroke-width="2"`) +
      P("M-20 -44V-88q0-9 20-11q20 2 20 11V-44z", c) + P("M-14 -88q0-5 14-6", "none", `stroke="${shade(c, 0.3)}" stroke-width="2" stroke-linecap="round"`) +
      [[-8, -80], [8, -80], [0, -70], [-8, -60], [8, -60], [0, -50]].map(([x, y]) => C(x, y, 1.6, GOLD_H)).join("") +
      P("M-13 -108l-3-12 7 6 9-10 9 10 7-6-3 12z", GOLD, `stroke="${GOLD_R}" stroke-width="1.6" stroke-linejoin="round"`) +
      C(-16, -121, 2, "#ff7aa2") + C(0, -125, 2.4, "#4f8ef7") + C(16, -121, 2, "#4cc46b") + C(0, -100, 3, "#ef5350", `stroke="${GOLD_R}" stroke-width="1"`) +
      R(-30, -46, 60, 10, shade(c, 0.1), 5) + R(-32, -37, 64, 9, GOLD, 3, `stroke="${GOLD_R}" stroke-width="1.4"`) + C(0, -32.5, 2.4, "#4f8ef7") +
      P("M-24 -28h48l-4 10h-40z", GOLD_D) +
      R(-38, -60, 11, 26, GOLD, 5, `stroke="${GOLD_R}" stroke-width="1.4"`) + R(27, -60, 11, 26, GOLD, 5, `stroke="${GOLD_R}" stroke-width="1.4"`) +
      C(-32.5, -62, 5.5, GOLD_H, `stroke="${GOLD_R}" stroke-width="1.2"`) + C(32.5, -62, 5.5, GOLD_H, `stroke="${GOLD_R}" stroke-width="1.2"`) +
      glitzer(funkeln(-30, -104, 6) + funkeln(34, -80, 4.5), funkeln(30, -110, 5.5) + funkeln(-36, -76, 4)) },
    g_kronleuchter: { name: "Goldener Kronleuchter", der: "der goldene Kronleuchter", kat: "deko", art: "decke", licht: true, w: 104, h: 88, tags: ["lampe", "gold"], d: () => {
      const kerze = (x, y) => R(x - 2.2, y - 12, 4.4, 10, "#fffaf0", 1.5, `stroke="#e2d3b4" stroke-width="0.8"`) + S(`M${x} ${y - 12}v-1.4`, TINTE, 0.8) + flamme(x, y - 20, 0.8) +
        P(`M${x - 5.5} ${y - 3}h11q0 5.5-5.5 5.5t-5.5-5.5z`, GOLD, `stroke="${GOLD_R}" stroke-width="1"`);
      const tropfen = (x, y) => S(`M${x} ${y - 6}v4`, GOLD_D, 0.8) + P(`M${x} ${y - 2}q3 4 0 8q-3-4 0-8z`, "#cfeaff", `stroke="#8fc3e8" stroke-width="0.8"`);
      return [4, 10, 16].map((y) => E(0, y, 2, 3, "none", `stroke="${GOLD_D}" stroke-width="1.4"`)).join("") +
        S("M-46 48q0 16 46 16t46-16M-26 34q0 10 26 10t26-10", GOLD, 3.6) + S("M-46 48q0 16 46 16t46-16", GOLD_R, 0.8, `opacity="0.5"`) +
        R(-3, 20, 6, 46, GOLD, 3) + C(0, 22, 4, GOLD_H) + C(0, 40, 5, GOLD) + C(-1.5, 38.5, 1.6, GOLD_H) +
        kerze(-46, 48) + kerze(-23, 59) + kerze(23, 59) + kerze(46, 48) + kerze(-26, 34) + kerze(26, 34) +
        tropfen(-36, 63) + tropfen(-12, 70) + tropfen(12, 70) + tropfen(36, 63) +
        C(0, 66, 6, GOLD, `stroke="${GOLD_R}" stroke-width="1"`) + P("M0 71q5 6 0 15q-5-9 0-15z", "#cfeaff", `stroke="#8fc3e8" stroke-width="0.8"`) +
        glitzer(funkeln(-40, 30, 5) + funkeln(16, 80, 4) + funkeln(48, 66, 3.6), funkeln(40, 28, 4.6) + funkeln(-18, 82, 3.6) + funkeln(-50, 66, 3.6));
    } },
    g_vitrine: { name: "Pokalvitrine", der: "die Pokalvitrine", kat: "tische", w: 84, h: 132, tags: ["regal", "schrank", "gold"], d: () =>
      leg(-38, 8, GOLD_D, 6) + leg(32, 8, GOLD_D, 6) +
      P("M-34 -118q34-14 68 0z", GOLD, `stroke="${GOLD_R}" stroke-width="1.6"`) + sternRand(0, -123, 7, GOLD_H, GOLD_R, 1.4) +
      R(-41, -120, 82, 114, GOLD, 5, `stroke="${GOLD_R}" stroke-width="1.6"`) + R(-35, -114, 70, 102, "#e6f6fc") + R(-35, -114, 70, 102, "#8a5734", 2, `opacity="0.12"`) +
      R(-35, -80, 70, 4, GOLD_D) + R(-35, -46, 70, 4, GOLD_D) +
      pokalKlein(0, -80, 1.1, GOLD, GOLD_H, GOLD_R) + pokalKlein(-21, -80, 0.85, "#cfd8e3", "#f4f7fb", "#7d8a9b") + pokalKlein(21, -80, 0.85, "#d98a4e", "#f2b583", "#8a4a20") +
      S("M-24 -76v-6M-20 -76l-4-6", "#4f8ef7", 2) + C(-22, -54, 6, GOLD, `stroke="${GOLD_R}" stroke-width="1"`) + stern(-22, -54, 3.4, GOLD_H) +
      S("M2 -76v-6", "#ef5350", 2) + C(2, -54, 5, "#cfd8e3", `stroke="#7d8a9b" stroke-width="1"`) + stern(2, -54, 2.8, WEISS) +
      sternRand(22, -60, 9, GOLD, GOLD_R, 1.4) + R(18, -50, 8, 4, GOLD_D, 1) +
      E(-14, -14, 10, 3, "#7c5ce6") + C(-14, -20, 5, GOLD) + C(-14, -20, 3, GOLD_H) + R(4, -24, 24, 12, "#ef5350", 2) + S("M8 -18h16", GOLD_H, 1.4) +
      S("M-30 -104l14-12M-30 -66l10-9M10 -36l12-10", WEISS, 2.6, `opacity="0.7"`) + R(30, -70, 3, 14, GOLD_R, 1.5) +
      glitzer(funkeln(-6, -102, 5) + funkeln(30, -34, 4), funkeln(14, -98, 4.5) + funkeln(-28, -30, 4)) },
    g_spiegel: { name: "Goldener Spiegel", der: "der goldene Spiegel", kat: "deko", art: "wand", w: 60, h: 84, tags: ["spiegel", "gold"], d: () =>
      C(-24, 6, 4, GOLD, `stroke="${GOLD_R}" stroke-width="1.2"`) + C(24, 6, 4, GOLD, `stroke="${GOLD_R}" stroke-width="1.2"`) +
      E(0, 6, 24, 32, GOLD, `stroke="${GOLD_R}" stroke-width="2"`) + E(0, 6, 20, 28, GOLD_H) + E(0, 6, 17.5, 25.5, "#dff3fb") +
      S("M-9 -6l10-11M-6 4l6-7", WEISS, 3, `opacity="0.85"`) +
      P("M-11 -26l-2-10 6 4 7-8 7 8 6-4-2 10z", GOLD, `stroke="${GOLD_R}" stroke-width="1.4" stroke-linejoin="round"`) +
      C(-13, -37, 1.8, "#ff7aa2") + C(0, -41, 2, "#4f8ef7") + C(13, -37, 1.8, "#4cc46b") +
      P("M-8 36q8 8 16 0q-4 6-8 6t-8-6z", GOLD, `stroke="${GOLD_R}" stroke-width="1.2"`) + C(0, 38, 2, "#ef5350") +
      glitzer(funkeln(10, -10, 4.6, WEISS) + funkeln(-26, -20, 4), funkeln(-6, 18, 4, WEISS) + funkeln(27, -14, 3.6)) },
    g_teppich: { name: "Sternenteppich", der: "der Sternenteppich", kat: "deko", art: "flach", w: 142, h: 18, farbe: "#2f3a8f", tags: ["teppich", "gold"], d: (c) =>
      E(0, -4, 70, 11, GOLD) + E(0, -4, 64, 8.5, c) + E(0, -4, 56, 6, "none", `stroke="${GOLD_H}" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.8"`) +
      [[-40, -5, 3.4], [-20, -2, 2.6], [0, -6, 4], [20, -2, 2.6], [40, -5, 3.4], [-30, -9, 2], [10, -10, 2], [30, -9.5, 1.8], [-8, -1, 1.8]].map(([x, y, r]) => stern(x, y, r, GOLD_H)).join("") +
      glitzer(funkeln(-48, -4, 3.4) + funkeln(16, -6, 3), funkeln(48, -4, 3.4) + funkeln(-14, -6, 3)) },
    g_sternstatue: { name: "Goldene Sternstatue", der: "die goldene Sternstatue", kat: "deko", w: 60, h: 106, tags: ["gold"], d: () =>
      R(-21, -12, 42, 12, "#9aa5b1", 2) + R(-16, -46, 32, 36, "#b8c2cf", 2) + R(-19, -50, 38, 6, "#9aa5b1", 2) + R(-9, -36, 18, 11, GOLD, 2, `stroke="${GOLD_R}" stroke-width="1"`) +
      S("M-5 -30.5h10", GOLD_R, 1.4) + S("M-14 -52q-6-8-4-16M14 -52q6-8 4-16", "#4cc46b", 2.4) +
      blatt(-17, -60, 3, 1.6, "#5cb85c", -60) + blatt(17, -60, 3, 1.6, "#5cb85c", 60) + blatt(-16, -54, 3, 1.6, "#5cb85c", -40) + blatt(16, -54, 3, 1.6, "#5cb85c", 40) +
      C(0, -76, 26, SCHEIN, `opacity="0.4"`) + sternRand(0, -76, 25, GOLD, GOLD_R, 2.4) + stern(-2.5, -78.5, 13, GOLD_H) +
      C(-5, -77, 2.2, "#7a4d00") + C(5, -77, 2.2, "#7a4d00") + S("M-5 -71q5 4 10 0", "#7a4d00", 2) + C(-9, -72, 2, "#ff8fab", `opacity="0.7"`) + C(9, -72, 2, "#ff8fab", `opacity="0.7"`) +
      glitzer(funkeln(-25, -98, 6) + funkeln(24, -60, 4.6), funkeln(25, -100, 5.4) + funkeln(-25, -58, 4.6)) },

    // --- Lieblingssachen der Menschen ------------------------------------------
    m_strickkorb: { name: "Strickkorb", der: "der Strickkorb", kat: "deko", w: 48, h: 42, farbe: "#ff7aa2", tags: ["strickzeug"], d: (c) => {
      const knaeuel = (x, y, r, f) => C(x, y, r, f) + S(`M${n(x - r * 0.8)} ${n(y - r * 0.3)}q${n(r * 0.8)} ${n(r * 0.6)} ${n(r * 1.6)} 0M${n(x - r * 0.7)} ${n(y + r * 0.3)}q${n(r * 0.7)} ${n(r * 0.6)} ${n(r * 1.4)} 0M${n(x - r * 0.2)} ${n(y - r * 0.9)}q${n(-r * 0.4)} ${n(r * 0.9)} ${n(r * 0.3)} ${n(r * 1.8)}`, shade(f, -0.2), 1);
      return S("M-6 -38L4 -20M8 -40L0 -20", METALL, 1.8) + C(-6.5, -39, 1.8, "#ef5350") + C(8.5, -41, 1.8, "#ffd166") +
        knaeuel(-10, -24, 7, "#6cc3d5") + knaeuel(10, -23, 6.5, "#ffd166") + knaeuel(1, -27, 7, c) +
        P("M-21 -20h42l-4 20h-34z", HOLZ) + S("M-20 -13h40M-19 -6h38", HOLZ_D, 1.4) + S("M-10 -20l1 20M0 -20v20M10 -20l-1 20", HOLZ_D, 1, `opacity="0.55"`) + R(-22, -22, 44, 4, HOLZ_D, 2) +
        P("M5 -23h13v13l-1.6 1.6-1.6-1.6-1.6 1.6-1.6-1.6-1.6 1.6-1.6-1.6-1.6 1.6-1.6-1.6z", c) + S("M8 -21v10M11.5 -21v10M15 -21v10", shade(c, -0.2), 1) +
        S("M1 -27q2 3 5 4", c, 1.2);
    } },
    m_schach: { name: "Schachbrett", der: "das Schachbrett", kat: "spielen", klein: true, w: 42, h: 20, tags: ["schach"], d: () => {
      // Das Brett liegt schräg: oben 32 breit, unten 40, zwei Reihen sichtbar.
      let feld = "";
      for (let r = 0; r < 3; r += 1) {
        for (let k = 0; k < 8; k += 1) {
          const y0 = -9 + r * 2.4;
          const y1 = y0 + 2.4;
          const b0 = 16 + r * 1.333;
          const b1 = b0 + 1.333;
          const x00 = n(-b0 + (k * 2 * b0) / 8);
          const x01 = n(-b0 + ((k + 1) * 2 * b0) / 8);
          const x10 = n(-b1 + ((k + 1) * 2 * b1) / 8);
          const x11 = n(-b1 + (k * 2 * b1) / 8);
          feld += P(`M${x00} ${n(y0)}L${x01} ${n(y0)}L${x10} ${n(y1)}L${x11} ${n(y1)}Z`, (r + k) % 2 ? "#8a5734" : "#f4ead5");
        }
      }
      const bauer = (x, y, f, rand) => P(`M${x - 3} ${y}h6l-1.4-5h-3.2z`, f, `stroke="${rand}" stroke-width="0.7"`) + C(x, y - 6.4, 2, f, `stroke="${rand}" stroke-width="0.7"`);
      return feld + R(-20, -1.8, 40, 2.4, HOLZ_DD, 1) +
        bauer(-5, -3.4, "#fbf8f2", "#b9a58e") + bauer(12, -6, "#2d3748", "#1a202c") +
        P("M-1 -3h7l-1-3q2-4-1-9q-3-1-5 1l-2 3 2 1 2-1q-2 3-2 8z", "#2d3748") + C(2.8, -12, 0.6, WEISS) +
        P("M-17 -5h6l-1-4h-4z", "#fbf8f2", `stroke="#b9a58e" stroke-width="0.7"`) + R(-16.6, -14, 5.2, 5, "#fbf8f2", 1, `stroke="#b9a58e" stroke-width="0.7"`) + S("M-14 -18v4M-15.6 -16.4h3.2", "#b9a58e", 1);
    } },
    m_skateboard: { name: "Skateboard", der: "das Skateboard", kat: "spielen", w: 64, h: 16, farbe: "#7c5ce6", tags: ["skateboard", "sport"], d: (c) =>
      P("M-23 -8h10l-2-3h-6zM13 -8h10l-2-3h-6z", METALL) + R(-19.5, -9.6, 3, 2, METALL_D, 0.8) + R(16.5, -9.6, 3, 2, METALL_D, 0.8) +
      C(-21, -4, 4, shade(GLUT, -0.15)) + C(-16, -4, 4, GLUT) + C(16, -4, 4, shade(GLUT, -0.15)) + C(21, -4, 4, GLUT) + C(-16, -4, 1.4, ORANGE) + C(21, -4, 1.4, ORANGE) +
      P("M-31 -15q2 5 8 5h46q6 0 8-5l1.8 1.2q-2.4 6.6-9.8 6.6h-46q-7.4 0-9.8-6.6z", c) +
      S("M-30.6 -15.2q2 4.4 7.6 4.4h46q5.6 0 7.6-4.4", "#2d3748", 1.2) +
      stern(0, -8.6, 2.2, GLUT) + R(-12, -9.4, 6, 1.4, WEISS, 0.7) + R(6, -9.4, 6, 1.4, WEISS, 0.7) },
    m_fotoapparat: { name: "Fotoapparat", der: "der Fotoapparat", kat: "deko", klein: true, w: 38, h: 24, farbe: "#4f8ef7", tags: ["fotoapparat", "foto"], d: (c) =>
      R(-11, -22, 9, 5, METALL_D, 1.5) + R(6, -21, 5, 3, "#ef5350", 1.5) + R(-8.5, -21, 4, 2.6, "#cfe9f3", 1) +
      R(-15, -18, 30, 17, "#e2e8f0", 3) + R(-15, -14, 30, 10, c, 2) + S("M-15 -18v17M15 -18v17", shade(c, -0.25), 1) +
      C(0, -9.5, 7.5, METALL_D) + C(0, -9.5, 5.6, "#2d3748") + C(0, -9.5, 3.4, "#1a202c") + C(-1.6, -11.2, 1.4, WEISS, `opacity="0.8"`) +
      R(10, -16, 3.6, 2.4, GLUT, 1) + S("M-17 -12q-3 6 1 10M17 -12q3 6-1 10", "#2d3748", 1.4) },
    m_teekanne: { name: "Teekanne", der: "die Teekanne", kat: "kueche", klein: true, w: 42, h: 40, farbe: "#6cc3d5", tags: ["tee", "geschirr"], d: (c) =>
      S("M-2 -30q-2-3 0-5t0-5M4 -29q-2-3 0-5", "#cbd5e0", 1.2) +
      P("M-9 -6q-6-1-8-6l-3-8q2-1 3 1l3 6q1 2 5 2z", c) + P("M-20 -20q2-1 3 1", "none", `stroke="${shade(c, -0.25)}" stroke-width="1.2" stroke-linecap="round"`) +
      S("M10 -18q8-1 6 7q-1 4-6 4", shade(c, -0.15), 2.6) +
      E(0, -11, 12, 10, c) + P("M-12 -11q12 4 24 0v1q-2 9-12 9t-12-9z", shade(c, -0.12)) +
      E(0, -20.5, 7, 2, shade(c, -0.2)) + P("M-6 -21q6-6 12 0z", c) + C(0, -25, 1.8, shade(c, -0.25)) +
      C(-5, -12, 1.4, WEISS) + C(0, -8, 1.4, WEISS) + C(5, -12, 1.4, WEISS) + C(-3, -16, 1, WEISS) + C(4, -6, 1, WEISS) +
      P("M-8 -16q2-3 5-4", "none", `stroke="${WEISS}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"`) + E(0, -0.8, 9, 1.2, shade(c, -0.3)) },
    m_puzzle: { name: "Puzzle", der: "das Puzzle", kat: "spielen", klein: true, w: 48, h: 12, tags: ["puzzle", "spielzeug"], d: () => {
      // Ein Teil, flach liegend: Nase oben, um (x, y).
      const teil = (x, y, f) => P(`M${x - 3.5} ${y - 1.6}h2.4q1.1-2 2.2 0h2.4v1.2q1.4-0.6 1.4 0.4t-1.4 0.4v1.2h-7z`, f) + R(x - 3.5, y + 1.2, 7, 0.8, shade(f, -0.25), 0.4);
      return R(-19, -1.8, 38, 1.8, "#a0aec0", 0.8) + P("M-15 -9h30l4 7.2h-38z", "#bfe6f5") +
        P("M-17 -5.4q8-4 17-1t19 0.4l1.4 4H-19z", "#7cc05e") + P("M-2 -5.2q6-3 13 0.6l3 2.6H-3z", "#5cb85c") + C(9, -7.4, 1.6, GLUT) +
        R(-11, -7.2, 7, 4, "#cfe9f3", 0.4) + P("M-10 -6l2.6-2 2.6 2v2h-5.2z", "#ef5350") + R(-8.4, -5.4, 2, 1.4, WEISS) +
        P("M3 -4.4h5.2l0.8 2.4h-6.6z", "#5a6b7d") +
        S("M-7.5 -9l-1.5 7.2M0 -9v7.2M7.5 -9l1.5 7.2M-17 -5.4h34", "#ffffff", 0.5, `opacity="0.6"`) +
        P("M-15 -9h30l4 7.2h-38z", "none", `stroke="#a0aec0" stroke-width="0.9" stroke-linejoin="round"`) +
        teil(-21.5, -2.4, "#3a86ff") + teil(20.5, -2.4, "#ff9f43");
    } },
    m_fussballtor: { name: "Fussballtor", der: "das Fussballtor", kat: "spielen", w: 96, h: 64, tags: ["fussball", "ball", "sport"], d: () => {
      let netz = "";
      for (let x = -36; x <= 36; x += 8) netz += `M${x} -56V-2`;
      for (let y = -48; y >= -48 && y <= -4; y += 8) netz += `M-40 ${y}H40`;
      return P("M-40 -56h80v54h-80z", "#e6f6fc", `opacity="0.5"`) + S(netz, "#b8c2cf", 0.8) +
        S("M-44 -3.2V-58H44V-3.2", "#9aa5b1", 6.4) + S("M-44 -3.2V-58H44V-3.2", WEISS, 4.4) + R(-46, -2, 4, 2, DUNKEL, 1) + R(42, -2, 4, 2, DUNKEL, 1) +
        C(28, -7, 7, WEISS, `stroke="#cbd5e0" stroke-width="1"`) + P("M28 -10l2.6 1.8-1 3h-3.2l-1-3z", TINTE) +
        P("M22.4 -9l2 1-0.4 2.6-2.4 0.4q-0.4-2 0.8-4z", TINTE) + P("M33.6 -9l-2 1 0.4 2.6 2.4 0.4q0.4-2-0.8-4z", TINTE) + P("M26 -1.2l1-2.4h2l1 2.4q-2 0.6-4 0z", TINTE);
    } },
    m_giesskanne: { name: "Giesskanne", der: "die Giesskanne", kat: "deko", klein: true, w: 46, h: 28, farbe: "#7cc05e", tags: ["giessen"], d: (c) =>
      S("M-16 -20q8-10 16 0", shade(c, -0.2), 2.4) +
      P("M0 -8l13-12 2 2-13 12z", shade(c, -0.1)) + P("M12 -22l5-3 3 4-4 3z", shade(c, -0.25)) +
      P("M-18 -20h18l2 20h-22z", c) + R(-19, -21, 20, 3, shade(c, -0.18), 1.5) + R(-15, -16, 3, 12, shade(c, 0.3), 1.5) +
      [[19, -17], [17, -13], [21, -12]].map(([x, y]) => P(`M${x} ${y}q1.5 2.4 0 3q-1.5-0.6 0-3z`, "#8fd6f5")).join("") },
  };

  // Was zu welcher Jahreszeit passt.
  const SAISON = {
    fruehling: ["j_osternest", "j_osterhase", "j_tulpen", "j_vogelhaus", "j_kranz", "j_gummistiefel"],
    sommer: ["j_sonnenschirm", "j_planschbecken", "j_ventilator", "j_glacebecher", "j_sonnenbrille", "j_badetuch"],
    herbst: ["j_kuerbis", "j_kuerbislicht", "j_raebeliechtli", "j_laubkorb", "j_pilzkorb", "j_drachen"],
    winter: ["j_weihnachtsbaum", "j_adventskranz", "j_schneekugel", "j_lebkuchenhaus", "j_chlaussack", "j_schneemann"],
  };

  // Die goldenen Belohnungen.
  const SCHAETZE = ["g_sofa", "g_bett", "g_thron", "g_kronleuchter", "g_vitrine", "g_spiegel", "g_teppich", "g_sternstatue"];

  // Was Menschen gern haben.
  const MENSCHEN = ["m_strickkorb", "m_schach", "m_skateboard", "m_fotoapparat", "m_teekanne", "m_puzzle", "m_fussballtor", "m_giesskanne"];

  // Die neuen Wünsche: "Ich hätte gerne …" und was "Zeig mir" zeigt.
  const WUENSCHE = {
    fruehling: { ein: "etwas für den Frühling", zeige: "j_tulpen" },
    sommer: { ein: "etwas für den Sommer", zeige: "j_sonnenschirm" },
    herbst: { ein: "etwas für den Herbst", zeige: "j_kuerbis" },
    winter: { ein: "etwas für den Winter", zeige: "j_schneemann" },
    ostern: { ein: "ein Osternest", zeige: "j_osternest" },
    vogel: { ein: "ein Vogelhäuschen", zeige: "j_vogelhaus" },
    gummistiefel: { ein: "Gummistiefel", zeige: "j_gummistiefel" },
    kuerbis: { ein: "einen Kürbis", zeige: "j_kuerbis" },
    laterne: { ein: "eine Laterne", zeige: "j_raebeliechtli" },
    pilze: { ein: "Pilze", zeige: "j_pilzkorb" },
    drachen: { ein: "einen Drachen", zeige: "j_drachen" },
    weihnachtsbaum: { ein: "einen Weihnachtsbaum", zeige: "j_weihnachtsbaum" },
    advent: { ein: "einen Adventskranz", zeige: "j_adventskranz" },
    schneemann: { ein: "einen Schneemann", zeige: "j_schneemann" },
    lebkuchen: { ein: "Lebkuchen", zeige: "j_lebkuchenhaus" },
    samichlaus: { ein: "einen Chlaussack", zeige: "j_chlaussack" },
    gold: { ein: "etwas Goldenes", zeige: "g_sternstatue" },
    strickzeug: { ein: "Strickzeug", zeige: "m_strickkorb" },
    schach: { ein: "ein Schachspiel", zeige: "m_schach" },
    skateboard: { ein: "ein Skateboard", zeige: "m_skateboard" },
    fotoapparat: { ein: "einen Fotoapparat", zeige: "m_fotoapparat" },
    tee: { ein: "Tee", zeige: "m_teekanne" },
    puzzle: { ein: "ein Puzzle", zeige: "m_puzzle" },
    fussball: { ein: "ein Fussballtor", zeige: "m_fussballtor" },
    giessen: { ein: "eine Giesskanne", zeige: "m_giesskanne" },
  };

  M.dazu({ dinge: DINGE, wuensche: WUENSCHE, saison: SAISON, schaetze: SCHAETZE, menschen: MENSCHEN });
})();
