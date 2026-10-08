/*
 * bau-moebel-spital.js – Die eigenen Dinge der Zimmer Empfang, Notfall,
 * Kinderabteilung, Radiologie, Innere Medizin, Operationssaal und
 * Geburtsabteilung (Bauecke).
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten und die Bildmotive an.
 * Kein rotes Kreuz: Das Spital zeigt ein weisses H auf Blau oder ein Herz.
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, leg, stern, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE, BUNT } = M.hilfe;

  // Farben, die hier öfter vorkommen.
  const SPITALBLAU = "#2f6fd0";
  const BILDSCHIRM = "#1a202c";
  const GLAS = "#e6f6fc";
  const HAUT = "#ffe0c2";
  const KNOCHEN = "#f4ead5";
  const KNOCHEN_RAND = "#cdbb98";
  const LEUCHTGRUEN = "#7cff9e";

  // Gerundet, damit die Zeichnung kurz bleibt und überall gleich ist.
  const n = (v) => Math.round(v * 10) / 10;
  const dreh = (winkel, x, y) => `transform="rotate(${winkel} ${x} ${y})"`;

  // Ein Herz um (cx, cy); s ist ungefähr die halbe Breite.
  const herz = (cx, cy, s, fill, extra = "") =>
    P(`M${n(cx)} ${n(cy + s * 0.85)}C${n(cx - s * 1.25)} ${n(cy)} ${n(cx - s * 0.7)} ${n(cy - s * 0.95)} ${n(cx)} ${n(cy - s * 0.4)}` +
      `C${n(cx + s * 0.7)} ${n(cy - s * 0.95)} ${n(cx + s * 1.25)} ${n(cy)} ${n(cx)} ${n(cy + s * 0.85)}Z`, fill, extra);

  // Das Warnzeichen für Strahlen: drei Flügel um einen Punkt.
  function strahlen(cx, cy, r1, r2, fill) {
    const p = (r, w) => `${n(cx + Math.cos(w) * r)} ${n(cy + Math.sin(w) * r)}`;
    return [90, 210, 330].map((mitte) => {
      const a = ((mitte - 30) * Math.PI) / 180;
      const b = ((mitte + 30) * Math.PI) / 180;
      return P(`M${p(r1, a)}L${p(r2, a)}A${r2} ${r2} 0 0 1 ${p(r2, b)}L${p(r1, b)}A${r1} ${r1} 0 0 0 ${p(r1, a)}Z`, fill);
    }).join("") + C(cx, cy, r1 * 0.75, fill);
  }

  // Ein Knochen mit feinem Rand, damit er auch auf heller Wand sichtbar ist.
  const knochen = (d, breite) => S(d, KNOCHEN_RAND, breite + 1.6) + S(d, KNOCHEN, breite);

  // Das H des Spitals aus drei Balken.
  const hZeichen = (cx, cy, g, fill) =>
    R(n(cx - g), n(cy - g * 1.1), n(g * 0.62), n(g * 2.2), fill, n(g * 0.12)) +
    R(n(cx + g * 0.38), n(cy - g * 1.1), n(g * 0.62), n(g * 2.2), fill, n(g * 0.12)) +
    R(n(cx - g * 0.45), n(cy - g * 0.3), n(g * 0.9), n(g * 0.6), fill);

  // Ein Clog (Spitalschuh) von der Seite, Spitze nach rechts, mit Fersenriemen.
  function clog(x, f) {
    const dunkel = shade(f, -0.3);
    return R(x, -2.6, 24, 2.6, shade(f, -0.2), 1.3) +
      P(`M${x + 1} -2.6V-8Q${x + 1} -10.5 ${x + 3.5} -10.5L${x + 9} -9.5Q${x + 14} -13.5 ${x + 20} -10.5Q${x + 24} -8 ${x + 24} -2.6Z`, f) +
      E(x + 6, -9.6, 3.8, 1.3, dunkel) + S(`M${x + 2} -9Q${x - 1.5} -6 ${x + 2} -3.5`, dunkel, 1.4) +
      [[13, -9.6], [16.5, -10.4], [19.8, -8.6], [15, -7], [18.3, -5.8]].map(([dx, y]) => C(x + dx, y, 0.85, WEISS)).join("");
  }

  const DINGE = {
    // --- Empfang ---------------------------------------------------------------
    s_wartestuehle: { name: "Wartestühle", der: "die Wartestühle", kat: "spital", w: 112, h: 58, farbe: "#3a86ff", tags: ["sitz", "stuhl"], d: (c) =>
      R(-50, -26, 100, 5, METALL_D, 2) + leg(-42, 22, METALL_D, 5) + leg(37, 22, METALL_D, 5) + R(-48, -4, 17, 4, DUNKEL, 2) + R(31, -4, 17, 4, DUNKEL, 2) +
      [-37, 0, 37].map((x) => R(x - 15, -58, 30, 28, shade(c, -0.12), 9) + R(x - 10, -54, 20, 4, shade(c, 0.25), 2) + R(x - 17, -34, 34, 10, c, 5)).join("") +
      [-53, -18.5, 18.5, 53].map((x) => R(x - 2, -40, 4, 14, METALL, 2) + R(x - 3, -43, 6, 4, DUNKEL, 2)).join("") },
    s_nummernautomat: { name: "Nummernautomat", der: "der Nummernautomat", kat: "spital", w: 40, h: 104, farbe: "#3a86ff", licht: true, d: (c) =>
      E(0, -3.5, 15, 3.5, DUNKEL) + R(-3, -64, 6, 61, METALL, 2) +
      R(-20, -104, 40, 44, "#e2e8f0", 7) + R(-20, -104, 40, 10, c, 6) + R(-20, -99, 40, 5, c) +
      R(-15, -91, 30, 15, "#2d3748", 3) + T(0, -79.5, "42", 12, "#ff6b6b") +
      C(-9, -68, 4.5, "#7cc05e") + C(-10, -69.5, 1.8, "#c5ec9a") + R(1, -70, 15, 3, "#2d3748", 1.5) +
      P("M3 -68.5h11v15l-1.8-1.5-1.9 1.5-1.8-1.5-1.9 1.5-1.8-1.5-1.8 1.5z", WEISS, `stroke="${RAND}" stroke-width="1"`) + T(8.5, -58.5, "43", 5, TINTE) },
    s_wegweiser: { name: "Wegweiser", der: "der Wegweiser", kat: "spital", art: "wand", w: 72, h: 52, d: () =>
      R(-36, -26, 72, 52, SPITALBLAU, 5) + R(-32, -9.5, 64, 1.5, "#5b8fe0") + R(-32, 8, 64, 1.5, "#5b8fe0") +
      P("M-31 -17l8-7v4.5h9v5h-9v4.5z", WEISS) + R(4, -24, 3.5, 13, WEISS, 1.5) + R(6, -15, 24, 4, WEISS, 1.5) + C(11.5, -18.5, 2.8, WEISS) + R(15.5, -21, 14, 5, WEISS, 2.5) +
      P("M-14 0l-8 7v-4.5h-9v-5h9v-4.5z", WEISS) + T(17, 5, "WC", 13, WEISS) +
      P("M-22.5 10l7 7.5h-4.5v7h-5v-7h-4.5z", WEISS) + herz(17, 17, 6.5, WEISS) },
    s_infobildschirm: { name: "Infobildschirm", der: "der Infobildschirm", kat: "spital", art: "wand", w: 72, h: 46, licht: true, d: () =>
      R(-36, -23, 72, 46, "#2d3748", 5) + R(-32, -19, 64, 38, "#173a63", 3) + R(-32, -19, 64, 9, "#3a86ff", 3) + R(-32, -13, 64, 3, "#3a86ff") +
      C(-26, -14.5, 2, WEISS) + R(-21, -15.5, 20, 2, WEISS, 1, `opacity="0.8"`) +
      T(-15, 3, "42", 13, "#ffd166") + S("M-3 -1.5h8", WEISS, 2) + P("M8 -1.5l-4-3.5v7z", WEISS) + T(18, 3, "3", 13, LEUCHTGRUEN) +
      T(-15, 16.5, "17", 10, "#cbd5e0") + S("M-3 13h8", "#cbd5e0", 1.6) + P("M8 13l-3.5-3v6z", "#cbd5e0") + T(18, 16.5, "5", 10, "#cbd5e0") },
    s_desinfektion: { name: "Desinfektionsspender", der: "der Desinfektionsspender", kat: "spital", w: 30, h: 100, d: () =>
      R(-13, -5, 26, 5, METALL_D, 2.5) + R(-2.5, -68, 5, 64, METALL, 2) + R(-11, -56, 22, 4, METALL_D, 2) +
      R(-12, -99, 24, 31, WEISS, 5, `stroke="${RAND}" stroke-width="1.5"`) + R(-8, -96, 16, 18, "#a8d8f8", 3) + R(-8, -89, 16, 11, "#6cc3d5", 3) +
      R(-7, -73, 14, 3, DUNKEL, 1.5) + R(-1.5, -71, 3, 4, DUNKEL, 1) +
      R(-9, -44, 18, 20, "#7cc05e", 4) + P("M0 -40c-4 5-5 7.5-5 9.5a5 5 0 0 0 10 0c0-2-1-4.5-5-9.5z", WEISS) },
    s_prospekte: { name: "Prospekte", der: "die Prospekte", kat: "spital", art: "wand", w: 50, h: 60, d: () =>
      R(-25, -30, 50, 60, "#cbd5e0", 4) + R(-22, -27, 44, 54, "#dfe6ee", 3) +
      [[-25, ["#ff9fb5", "#ffd166", "#7cc05e"]], [4, ["#6cc3d5", "#a78bfa", "#ff9f6b"]]].map(([y, farben], reihe) =>
        [-20, -6.5, 7].map((x, i) => {
          const bild = reihe === 0 && i === 1 ? herz(x + 6.5, y + 6.5, 3.6, WEISS)
            : reihe === 1 && i === 0 ? hZeichen(x + 6.5, y + 6.5, 3, WEISS) : C(x + 6.5, y + 6.5, 3.2, WEISS);
          return R(x, y, 13, 21, farben[i], 1.5) + bild + R(x + 2.5, y + 11.5, 8, 1.4, WEISS, 0.7) +
            R(x - 1, y + 13.5, 15, 9.5, "#f4f8fb", 1.5, `opacity="0.8"`) + R(x - 1, y + 13.5, 15, 1.5, WEISS, 0.7);
        }).join("")).join("") },
    s_klingel: { name: "Klingel", der: "die Klingel", kat: "spital", klein: true, w: 22, h: 18, d: () =>
      R(-11, -4, 22, 4, DUNKEL, 2) + P("M-9 -4a9 9 0 0 1 18 0z", "#f2c14e") + S("M-5.5 -8a5.5 5.5 0 0 1 3.5-3", "#fff1b8", 1.4) +
      R(-1.2, -16, 2.4, 4, METALL_D, 1) + E(0, -16.4, 3.2, 1.4, METALL_D) },
    s_klemmbrett: { name: "Klemmbrett", der: "das Klemmbrett", kat: "spital", klein: true, w: 22, h: 30, d: () =>
      R(-10, -28, 20, 28, HOLZ, 2.5) + R(-8, -24, 16, 22, WEISS, 1) + R(-5, -30, 10, 5, METALL_D, 1.5) +
      S("M-5.5 -19h11M-5.5 -15h11M-5.5 -11h11M-5.5 -7h6", "#9aa5b1", 1.1) + S("M2.5 -8l1.5 1.5 3-3.5", "#7cc05e", 1.3) },
    s_stempel: { name: "Stempel", der: "der Stempel", kat: "spital", klein: true, w: 30, h: 26, d: () =>
      R(-15, -6, 15, 6, "#2d3748", 1.5) + R(-14, -7, 13, 2.5, "#7c5ce6", 1.2) +
      R(2, -2, 12, 2, "#ef5350", 0.8) + R(1, -11, 14, 9, HOLZ, 2) + R(6.5, -17, 3, 6, HOLZ_D, 1) + C(8, -21, 4.5, "#ef5350") + C(6.6, -22.4, 1.4, "#ff9a9a") },
    s_rollstuhlschild: { name: "Rollstuhl-Schild", der: "das Rollstuhl-Schild", kat: "spital", art: "wand", w: 36, h: 36, d: () =>
      R(-18, -18, 36, 36, SPITALBLAU, 4) + C(-2, -11.5, 3.4, WEISS) + S("M-2 -6v10h9l3.5 9", WEISS, 3.4) + S("M-2 -1h7", WEISS, 2.6) +
      S("M-8.1 3.9A8 8 0 1 0 5.5 6.3", WEISS, 2.6) },
    s_hschild: { name: "Spitalschild", der: "das Spitalschild", kat: "spital", art: "wand", w: 46, h: 46, licht: true, d: () =>
      R(-22.25, -22.25, 44.5, 44.5, WEISS, 7, `stroke="${RAND}" stroke-width="1.5"`) + R(-19, -19, 38, 38, SPITALBLAU, 5) + hZeichen(0, 0, 11, WEISS) },
    s_absperrung: { name: "Absperrung", der: "die Absperrung", kat: "spital", w: 96, h: 48, farbe: "#3a86ff", d: (c) =>
      [-40, 40].map((x) => E(x, -3, 7.5, 3, METALL_D) + R(x - 2.5, -44, 5, 41, METALL, 2) + C(x, -45.5, 2.5, METALL_D)).join("") +
      P("M-38 -40Q0 -28 38 -40v6Q0 -22 -38 -34z", c) + S("M-34 -38.6Q0 -27.6 34 -38.6", shade(c, 0.3), 1) +
      R(-44, -42, 8, 5, DUNKEL, 1.5) + R(36, -42, 8, 5, DUNKEL, 1.5) },
    s_perlenspiel: { name: "Perlenspiel", der: "das Perlenspiel", kat: "spital", w: 60, h: 64, tags: ["spielzeug"], d: () =>
      S("M-20 -22V-48Q-20 -60 -9 -60Q2 -60 2 -48V-22", "#ef5350", 2.6) + S("M-8 -22V-36Q-8 -44 2 -44H10Q20 -44 20 -36V-22", "#3a86ff", 2.6) +
      S("M8 -22Q8 -32 14 -32Q20 -32 22 -50Q24 -58 27 -54", "#7cc05e", 2.6) +
      C(-20, -32, 4, "#ffd166") + C(-20, -41, 4, "#7cc05e") + C(-12, -59.5, 4, "#3a86ff") + C(2, -45, 4, "#ff9f43") +
      C(-8, -29, 4, "#ef5350") + C(7, -44, 4, "#ffd166") + C(20, -31, 4, "#a78bfa") + C(23, -48, 3.6, "#ff7aa2") +
      R(-27, -22, 54, 22, HOLZ, 4) + R(-27, -22, 54, 4, HOLZ_D, 2) + C(-15, -10, 3, HOLZ_D) + C(0, -10, 3, HOLZ_D) + C(15, -10, 3, HOLZ_D) },

    // --- Notfall ---------------------------------------------------------------
    s_krankentrage: { name: "Krankentrage", der: "die Krankentrage", kat: "spital", w: 126, h: 62, farbe: "#ff9f43", tags: ["liege"], d: (c) =>
      S("M-42 -14L38 -36M42 -14L-38 -36", METALL, 4) + R(-50, -16, 100, 4, METALL_D, 2) +
      C(-46, -6, 6, DUNKEL) + C(-46, -6, 2.2, METALL) + C(46, -6, 6, DUNKEL) + C(46, -6, 2.2, METALL) +
      R(-58, -38, 116, 5, METALL, 2.5) + R(-63, -37, 7, 3, DUNKEL, 1.5) + R(56, -37, 7, 3, DUNKEL, 1.5) +
      R(-56, -47, 30, 10, shade(c, -0.08), 5, dreh(24, -28, -42)) + R(-50, -53, 15, 7, WEISS, 3.5, dreh(24, -28, -42)) +
      R(-32, -47, 86, 10, c, 5) + R(-26, -46, 76, 2.5, shade(c, 0.25), 1.2) +
      R(-6, -48, 5, 12, "#2d3748", 1.5) + R(22, -48, 5, 12, "#2d3748", 1.5) + R(32, -53, 20, 7, "#a8d8f8", 3.5) },
    s_defibrillator: { name: "Defibrillator", der: "der Defibrillator", kat: "spital", klein: true, w: 40, h: 30, farbe: "#ffb020", d: (c) =>
      R(-17, -29, 14, 5, "#2d3748", 2.5) + R(3, -29, 14, 5, "#2d3748", 2.5) + R(-12, -30, 4, 3, "#2d3748", 1) + R(8, -30, 4, 3, "#2d3748", 1) +
      R(-19, -25, 38, 25, c, 5) + R(-15, -21, 17, 11, BILDSCHIRM, 2) + S("M-14 -15.5h4l1.5-3.5 2 7 1.5-3.5h5", LEUCHTGRUEN, 1.2) +
      herz(11, -15.5, 6.5, "#ef5350") + P("M11.8 -21l-3 5h2.6l-1.6 4.6 4.2-5.8h-2.6l1.6-3.8z", WEISS) +
      C(-12, -5, 2, "#7cc05e") + C(-6, -5, 2, "#2d3748") + C(11, -5, 3, "#ef5350") },
    s_sauerstoff: { name: "Sauerstoffflasche", der: "die Sauerstoffflasche", kat: "spital", w: 46, h: 100, d: () =>
      S("M14 -9V-74h-5", METALL_D, 3) + R(-16, -9, 32, 4, METALL_D, 2) + C(-11, -4, 4, DUNKEL) + C(11, -4, 4, DUNKEL) +
      R(-10, -84, 20, 76, WEISS, 9, `stroke="${RAND}" stroke-width="1.5"`) + R(-9.2, -75, 18.4, 6, "#7cc05e") +
      R(-7, -52, 14, 14, GLAS, 2) + T(0, -41.5, "O2", 9, "#3a86ff") +
      R(-4, -92, 8, 9, METALL_D, 2) + R(-6, -95, 12, 4, DUNKEL, 2) + R(3, -91, 4, 2, METALL_D) +
      C(9, -90, 5.5, WEISS, `stroke="${METALL_D}" stroke-width="1.8"`) + S("M9 -90l2.6-2.8", "#ef5350", 1.3) +
      S("M-4 -88q-15 2-14 22", "#a8d8f8", 2.2) + P("M-23 -67h12l-2 9q-4 3-8 0z", GLAS, `stroke="#a8d8f8" stroke-width="1.5"`) },
    s_notfallwagen: { name: "Notfallwagen", der: "der Notfallwagen", kat: "spital", w: 64, h: 80, farbe: "#ef5350", flaeche: -80, d: (c) =>
      R(-30, -75, 60, 63, c, 4) + R(-32, -80, 64, 6, shade(c, -0.2), 3) +
      [-71, -56, -41, -26].map((y) => R(-26, y, 52, 12, shade(c, 0.18), 2.5) + R(-7, y + 4.5, 14, 3, WEISS, 1.5)).join("") +
      R(-31, -12, 62, 4, DUNKEL, 2) + C(-24, -4, 4, DUNKEL) + C(24, -4, 4, DUNKEL) },
    s_blaulicht: { name: "Blaulicht", der: "das Blaulicht", kat: "spital", art: "wand", w: 40, h: 40, licht: true, tags: ["lampe"], d: () =>
      S("M-15 -2h-4M15 -2h4M-12 -13l-3.5-3.5M12 -13l3.5-3.5M0 -16v-3", "#3a86ff", 2.5) +
      P("M-11 8V0a11 11 0 0 1 22 0v8z", "#3a86ff") + P("M-7 8V1a7 7 0 0 1 14 0v7z", "#6cc3d5") + S("M-6 -2a6 6 0 0 1 4-4", WEISS, 1.6, `opacity="0.85"`) +
      R(-14, 8, 28, 7, DUNKEL, 2) + R(-4, 15, 8, 4, DUNKEL, 1) },
    s_notrufknopf: { name: "Notrufknopf", der: "der Notrufknopf", kat: "spital", art: "wand", w: 30, h: 30, d: () =>
      R(-15, -15, 30, 30, "#ffd166", 4) + C(0, 0, 10.5, "#9b2c2c") + C(0, -1, 9, "#ef5350") + C(-3, -4, 3, "#ff9a9a") },
    s_notruf144: { name: "Notruf 144", der: "die Notrufnummer 144", kat: "spital", art: "wand", w: 44, h: 30, d: () => {
      // Der Hörer, aufrecht gezeichnet und schräg gestellt.
      const hoerer = `transform="translate(-10.5 0.5) rotate(-45) scale(0.85)"`;
      return R(-21.25, -14.25, 42.5, 28.5, WEISS, 4, `stroke="${RAND}" stroke-width="1.5"`) + C(-11, 0, 9, "#ef5350") +
        S("M-1.5 -6Q-4.5 0 -1.5 6", WEISS, 3.4, hoerer) + R(-3.5, -9.5, 7.5, 4.6, WEISS, 2, hoerer) + R(-3.5, 4.9, 7.5, 4.6, WEISS, 2, hoerer) +
        T(9.5, 4.8, "144", 12, "#ef5350");
    } },
    s_pflaster: { name: "Pflaster", der: "die Pflaster", kat: "spital", klein: true, w: 30, h: 24, d: () =>
      R(-15, -24, 20, 24, "#6cc3d5", 2.5) + R(-13, -14.5, 16, 7, "#f2c79b", 3.5, dreh(-25, -5, -11)) + R(-8, -14, 6, 6, "#e3a47a", 1.2, dreh(-25, -5, -11)) +
      C(-10.5, -14, 0.7, "#e3a47a") + C(0.6, -9.4, 0.7, "#e3a47a") + R(-12, -22, 14, 2, WEISS, 1, `opacity="0.7"`) +
      R(2.5, -5, 12, 5, "#f2c79b", 2.5) + R(6.5, -5, 4, 5, "#e3a47a", 0.8) },
    s_gips: { name: "Gipsbein", der: "das Gipsbein", kat: "spital", klein: true, w: 36, h: 32, d: () =>
      P("M-14 -30h13v19h9q6 0 6 6v5h-28z", WEISS, `stroke="${RAND}" stroke-width="1.5"`) + E(-7.5, -30, 6.5, 2, "#e2e8f0") +
      P("M12.5 -9.5q5.5 0.5 5.5 4.75t-5.5 4.75z", HAUT) + S("M15.6 -7.4v0.1M16.8 -4.8v0.1M15.8 -2.2v0.1", "#e9b48f", 1.5) +
      herz(-8, -21, 3, "#ff7aa2") + stern(5, -5.5, 3.2, "#ffd166") + S("M-11.5 -12.5l2.5-2 2.5 2 2.5-2", "#3a86ff", 1.2) + S("M-4.5 -4q3-3 6 0", "#7cc05e", 1.2) },
    s_kuehlkissen: { name: "Kühlkissen", der: "das Kühlkissen", kat: "spital", klein: true, w: 28, h: 16, d: () =>
      P("M-13 -2c-2-6 0-12 4-13c6-1 12-1 18 0c4 1 6 7 4 13c-8 2-18 2-26 0z", "#6cc3d5") + E(-6, -11, 3.5, 1.6, WEISS, `opacity="0.55"`) +
      S("M0 -12.5v9M-3.9 -10.25l7.8 4.5M-3.9 -5.75l7.8-4.5", WEISS, 1.4) },

    // --- Kinderabteilung --------------------------------------------------------
    s_kinderspitalbett: { name: "Kinderspitalbett", der: "das Kinderspitalbett", kat: "spital", w: 110, h: 74, farbe: "#ffd166", tags: ["spitalbett", "bett"], d: (c) =>
      C(-42, -5, 5, DUNKEL) + C(42, -5, 5, DUNKEL) + R(-44, -28, 4, 20, METALL_D, 1.5) + R(40, -28, 4, 20, METALL_D, 1.5) + R(-50, -30, 100, 6, METALL, 3) +
      R(-55, -74, 12, 50, c, 6) + R(43, -58, 12, 34, c, 6) + herz(-49, -64, 3.4, WEISS) +
      R(-46, -42, 92, 12, WEISS, 5, `stroke="${RAND}" stroke-width="1"`) + R(-44, -53, 22, 11, WEISS, 5, `stroke="${RAND}" stroke-width="1"`) +
      C(-38, -58, 2.6, "#c88c5c") + C(-28, -58, 2.6, "#c88c5c") + C(-33, -54, 5.5, "#c88c5c") + E(-33, -52.5, 2.6, 1.8, "#ecc9a0") + C(-35, -55.5, 0.8, TINTE) + C(-31, -55.5, 0.8, TINTE) +
      P("M-24 -46h62a6 6 0 0 1 6 6v10h-68z", "#6cc3d5") + stern(-8, -38, 3, WEISS) + stern(12, -38, 3, WEISS) + stern(30, -38, 3, WEISS) +
      R(-26, -58, 64, 4, c, 2) + [-22, -12, -2, 8, 18, 28].map((x) => R(x, -55, 2.4, 15, shade(c, -0.12), 1)).join("") },
    s_messlatte: { name: "Messlatte", der: "die Messlatte", kat: "spital", art: "wand", w: 44, h: 150, d: () => {
      const fell = "#ffc94d";
      const fleck = "#e8973a";
      return R(-22, -70, 11, 144, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) +
        Array.from({ length: 14 }, (_, i) => R(-22, -64 + i * 10, i % 5 === 0 ? 8 : 5, 1.4, i % 5 === 0 ? "#ef5350" : METALL_D)).join("") +
        R(-6, 54, 4.5, 21, fell, 2) + R(1, 56, 4.5, 19, fleck, 2) + R(8, 56, 4.5, 19, fell, 2) + R(14, 54, 4.5, 21, fleck, 2) +
        E(5, 50, 13, 9, fell) + S("M-7 47q-4 4-3 10", fell, 2) + P("M1 46L4 -52h8L13 46z", fell) +
        E(12, -58, 8, 6, fell) + E(17.5, -55.5, 4, 3.6, "#f2b13e") + R(6.5, -71, 2.4, 9, fleck, 1.2) + R(11.5, -71, 2.4, 9, fleck, 1.2) +
        C(7.7, -71.5, 2, "#a8662a") + C(12.7, -71.5, 2, "#a8662a") + P("M4 -61l-5-3 5-1z", fell) + C(11, -60, 1.4, TINTE) +
        [[6, 30, 3], [9, 12, 2.5], [6, -6, 2.6], [9, -24, 2.3], [7, -40, 2.2], [0, 50, 3.4], [9, 47, 3], [14, 53, 2.4]].map(([x, y, r]) => E(x, y, r, r * 1.2, fleck)).join("");
    } },
    s_teddy: { name: "Teddy mit Verband", der: "der Teddy mit Verband", kat: "spital", klein: true, w: 30, h: 36, farbe: "#d9a066", tags: ["kuscheltier", "spielzeug"], d: (c) => {
      const fell = c;
      const hell = shade(c, 0.45);
      return C(-9, -30, 5, fell) + C(9, -30, 5, fell) + C(-9, -30, 2.4, hell) + C(9, -30, 2.4, hell) +
        E(0, -9, 12, 9, fell) + C(-9, -4, 4, shade(c, -0.15)) + C(9, -4, 4, shade(c, -0.15)) + C(0, -23, 11, fell) +
        P("M-10.5 -27.5q10.5-8 21-2l-1 4q-10-5.5-19 1.5z", WEISS, `stroke="${RAND}" stroke-width="0.8"`) + R(8, -30, 4, 4, WEISS, 1.5) +
        E(0, -18.5, 5, 3.6, hell) + E(0, -20, 1.8, 1.3, TINTE) + C(-4, -23, 1.5, TINTE) + C(4, -23, 1.5, TINTE) + S("M-1.6 -16.8q1.6 1.2 3.2 0", TINTE, 0.9) +
        R(-5, -10, 10, 4, "#f2c79b", 2, dreh(-20, 0, -8)) + R(-1.5, -10, 3, 4, "#e3a47a", 0.8, dreh(-20, 0, -8));
    } },
    s_kinderzeichnungen: { name: "Kinderzeichnungen", der: "die Kinderzeichnungen", kat: "spital", art: "wand", w: 76, h: 36, tags: ["bild"], d: () => {
      const blatt = `stroke="${RAND}" stroke-width="1"`;
      // Jedes Blatt leicht schief angeklebt; alles 6 tiefer, damit es mittig hängt.
      const schief = (w, x, y) => `transform="translate(0 6) rotate(${w} ${x} ${y})"`;
      const a = schief(-6, -25, -4);
      const b = schief(3, 0, -6);
      const c = schief(-4, 25, -4);
      return R(-36, -18, 22, 28, WEISS, 1, `${blatt} ${a}`) + C(-20, -12, 3.5, "#ffd166", a) + R(-32, -4, 10, 9, "#ff9f6b", 0, a) + P("M-34 -4l7-6 7 6z", "#ef5350", a) + S("M-35 6h20", "#7cc05e", 2, a) + R(-28.5, 0, 3, 5, "#8a5734", 0, a) +
        R(-11, -20, 22, 28, WEISS, 1, `${blatt} ${b}`) + S("M-8 0a8 8 0 0 1 16 0", "#ef5350", 2, b) + S("M-5.5 0a5.5 5.5 0 0 1 11 0", "#ffd166", 2, b) + S("M-3 0a3 3 0 0 1 6 0", "#3a86ff", 2, b) + C(-7, 1, 2.6, "#a8d8f8", b) + C(7.5, 1, 2.6, "#a8d8f8", b) + C(5, -13, 3, "#ffd166", b) +
        R(14, -18, 22, 28, WEISS, 1, `${blatt} ${c}`) + herz(25, -10, 5, "#ff7aa2", c) + C(25, -1.5, 2.2, "#3a86ff", c) + S("M25 0.5v4M21.5 2h7M25 4.5l-2.6 4M25 4.5l2.6 4", "#3a86ff", 1.3, c) +
        R(-29, -21, 8, 4, "#fff1b8", 1, `opacity="0.9" ${a}`) + R(-4, -23, 8, 4, "#fff1b8", 1, `opacity="0.9" ${b}`) + R(21, -21, 8, 4, "#fff1b8", 1, `opacity="0.9" ${c}`);
    } },
    s_spielteppich: { name: "Spielteppich", der: "der Spielteppich", kat: "spital", art: "flach", w: 132, h: 16, tags: ["teppich", "spielzeug"], d: () =>
      P("M-58 -15h116l8 15h-132z", "#8fd16b") + P("M-61.8 -9.5h123.6l2 4h-127.6z", "#9aa5b1") + P("M-18 -15h8l-3 15h-8z", "#9aa5b1") + P("M26 -15h8l4 15h-8z", "#9aa5b1") +
      S("M-60 -7.5h120", WEISS, 0.8, `stroke-dasharray="3 3"`) +
      R(-46, -14, 9, 3.5, "#ff7a7a", 1) + R(2, -14, 9, 3.5, "#ffd166", 1) + R(42, -4.5, 10, 4, "#3a86ff", 1) + R(-40, -4.5, 10, 4, "#a78bfa", 1) + C(12, -2.5, 2.2, "#4aa34a") + C(-30, -12.5, 1.8, "#4aa34a") +
      R(-66, -1.4, 132, 1.4, "#6aa84f") },
    s_tierinfusion: { name: "Infusionsständer mit Bär", der: "der Infusionsständer mit Bär", kat: "spital", w: 32, h: 114, tags: ["infusion"], d: () =>
      S("M-13 -4h26", "#ff7aa2", 3.5) + C(-13, -2.5, 2.6, DUNKEL) + C(13, -2.5, 2.6, DUNKEL) + C(0, -2.5, 2.6, DUNKEL) +
      R(-2, -98, 4, 94, METALL, 2) + R(-2.5, -30, 5, 4, "#ffd166", 1.5) + R(-2.5, -50, 5, 4, "#7cc05e", 1.5) + R(-2.5, -70, 5, 4, "#6cc3d5", 1.5) +
      R(-14, -96, 28, 3, METALL_D, 1.5) + R(-15, -93, 12, 18, GLAS, 4, `stroke="${RAND}" stroke-width="1.5"`) + R(-13, -86, 8, 9, "#ffd8e4", 2) +
      C(-11, -89, 0.9, TINTE) + C(-7, -89, 0.9, TINTE) + S("M-10.5 -85.8q1.5 1.3 3 0", TINTE, 0.8) + S("M-9 -75q-5 20 6 32", "#c9d9e3", 1.5) +
      C(-6, -110, 3, "#c88c5c") + C(6, -110, 3, "#c88c5c") + C(0, -105, 7, "#c88c5c") + E(0, -102.5, 3.2, 2.3, "#ecc9a0") +
      C(-2.5, -106.5, 1, TINTE) + C(2.5, -106.5, 1, TINTE) + E(0, -103.6, 1.2, 0.9, TINTE) },
    s_bilderbuecher: { name: "Bilderbuchkiste", der: "die Bilderbuchkiste", kat: "spital", w: 62, h: 54, farbe: "#ff9f6b", tags: ["buecher"], d: (c) =>
      R(-27, -50, 18, 26, "#6cc3d5", 2) + C(-18, -42, 4.5, "#ffd166") + R(-24, -34, 12, 2, WEISS, 1) +
      R(-8, -54, 18, 30, "#ff9fb5", 2) + P("M-3.5 -47l1-5 3 3zM5.5 -47l-1-5-3 3z", "#ff9f43") + C(1, -44, 5, "#ff9f43") + C(-1, -45, 0.9, TINTE) + C(3, -45, 0.9, TINTE) +
      R(11, -48, 17, 24, "#7cc05e", 2) + stern(19.5, -38, 5, "#ffd166") +
      R(-31, -28, 62, 28, c, 4) + R(-31, -28, 62, 5, shade(c, -0.15), 3) + T(0, -7, "ABC", 12, WEISS) },
    s_maltisch: { name: "Maltisch", der: "der Maltisch", kat: "spital", w: 78, h: 50, farbe: "#7cc05e", flaeche: -32, fx: [-34, 12], tags: ["tisch", "malen"], d: (c) =>
      R(-39, -32, 78, 6, c, 3) + leg(-34, 26, "#ffd166", 6) + leg(28, 26, "#3a86ff", 6) + R(-30, -14, 60, 3, shade(c, -0.2), 1.5) +
      R(-28, -34, 30, 2.5, WEISS, 1) + R(4, -34.5, 10, 2.5, "#a78bfa", 1) +
      R(19.5, -48, 2.4, 8, "#3a86ff", 1) + R(22.5, -50, 2.4, 10, "#ffd166", 1) + R(25.5, -47, 2.4, 7, "#ef5350", 1) + R(28.5, -49, 2.4, 9, "#7cc05e", 1) + R(18, -42, 14, 10, "#ff9fb5", 2) },
    s_ballone: { name: "Ballone", der: "die Ballone", kat: "spital", art: "decke", w: 56, h: 86, d: () =>
      S("M-15 31Q-14 56 -3 80M4 29Q-4 54 -3 80M18 37Q8 60 -3 80", "#9aa5b1", 1.1) +
      E(-15, 15, 11, 13, "#ef5350") + P("M-15 28l-2 3h4z", "#ef5350") + E(4, 13, 11, 13, "#ffd166") + P("M4 26l-2 3h4z", "#ffd166") +
      E(18, 23, 10, 12, "#3a86ff") + P("M18 35l-2 3h4z", "#3a86ff") +
      E(-19, 9, 2.4, 4, WEISS, `opacity="0.6"`) + E(0, 7, 2.4, 4, WEISS, `opacity="0.6"`) + E(14, 18, 2.2, 3.6, WEISS, `opacity="0.6"`) +
      P("M-3 80l-5-3v6zM-3 80l5-3v6z", "#ff7aa2") },
    s_rutschauto: { name: "Rutschauto", der: "das Rutschauto", kat: "spital", w: 58, h: 44, farbe: "#ef5350", tags: ["spielzeug"], d: (c) =>
      R(-24, -36, 14, 12, shade(c, -0.15), 5) + S("M10 -28l5-8", DUNKEL, 2.5) + E(16, -38, 6, 2.2, DUNKEL) +
      R(-28, -28, 56, 16, c, 7) + R(-12, -29, 16, 3, shade(c, -0.25), 1.5) + R(-22, -24, 44, 3, shade(c, 0.25), 1.5) + C(25, -20, 2.5, "#fff6c2") +
      C(-17, -8, 8, DUNKEL) + C(-17, -8, 3.5, METALL) + C(18, -8, 8, DUNKEL) + C(18, -8, 3.5, METALL) },
    s_kinderrollstuhl: { name: "Kinderrollstuhl", der: "der Kinderrollstuhl", kat: "spital", w: 50, h: 52, farbe: "#a78bfa", tags: ["rollstuhl"], d: (c) =>
      C(-5, -18, 17, "none", `stroke="${DUNKEL}" stroke-width="4"`) + C(-5, -18, 12.5, "none", `stroke="#ffd166" stroke-width="2"`) + C(-5, -18, 3, METALL_D) +
      S("M-5 -18l8-8M-5 -18l-8 8M-5 -18l8 8M-5 -18l-8-8", "#ff9fb5", 1.4) +
      S("M11 -29l6 17", METALL_D, 3) + R(13, -14, 10, 3, DUNKEL, 1.5) + C(19, -4, 4, DUNKEL) + C(19, -4, 1.4, METALL) +
      R(-17, -32, 30, 7, c, 3) + R(-20, -52, 7, 24, c, 3) + R(-14, -42, 20, 4, shade(c, -0.2), 2) + R(2, -40, 3, 9, shade(c, -0.2), 1.5) +
      S("M-20 -50h-4", DUNKEL, 4) + stern(-16.5, -45, 3, "#ffd166") },

    // --- Radiologie --------------------------------------------------------------
    s_mri: { name: "MRI-Röhre", der: "die MRI-Röhre", kat: "spital", w: 160, h: 110, d: () =>
      R(-20, -108, 96, 100, "#f1f5f9", 22, `stroke="${RAND}" stroke-width="2"`) + R(-22, -10, 100, 10, "#cbd5e0", 3) + R(-20, -24, 96, 4, "#3a86ff") +
      C(28, -60, 36, "#dbe4ee") + C(28, -60, 36, "none", `stroke="#3a86ff" stroke-width="3"`) + C(28, -60, 27, "#5a6b80") + C(31, -60, 21, "#3c4a5c") +
      C(64, -98, 3, LEUCHTGRUEN) +
      R(-66, -45, 50, 37, "#e2e8f0", 5) + R(-72, -10, 62, 10, METALL_D, 3) + R(-80, -54, 112, 9, "#6cc3d5", 4.5) + R(-78, -59, 22, 6, WEISS, 3) },
    s_bleischuerze: { name: "Bleischürze", der: "die Bleischürze", kat: "spital", art: "wand", w: 40, h: 68, farbe: "#5a67d8", d: (c) =>
      R(-1.5, -34, 3, 5, METALL_D, 1) + S("M-15 -26L0 -31L15 -26", METALL_D, 2.5) +
      P("M-13 -27H-6Q0 -19 6 -27H13Q11 -17 18 -11V26Q18 32 12 32H-12Q-18 32 -18 26V-11Q-11 -17 -13 -27Z", c) +
      S("M-6 -26.5Q0 -18.5 6 -26.5", shade(c, -0.3), 3) + R(-13, -12, 4, 34, shade(c, 0.2), 2) +
      R(-18, 4, 36, 4, shade(c, -0.25), 2) + R(-3, 3, 6, 6, METALL, 1.5) + C(9, -6, 4.6, "#ffd166") + strahlen(9, -6, 0.9, 3.7, "#2d3748") },
    s_warnschild: { name: "Warnschild", der: "das Warnschild", kat: "spital", art: "wand", w: 40, h: 36, d: () =>
      P("M0 -16L18 15H-18Z", "#ffd166", `stroke="#2d3748" stroke-width="3" stroke-linejoin="round"`) + strahlen(0, 5, 2.4, 8.5, "#2d3748") },
    s_bedienpult: { name: "Bedienpult", der: "das Bedienpult", kat: "spital", w: 106, h: 80, licht: true, tags: ["computer"], d: () =>
      R(-49, -33, 30, 33, "#a0aec0", 3) + R(-46, -28, 24, 10, "#b8c4d2", 2) + R(-46, -15, 24, 10, "#b8c4d2", 2) + leg(41, 33, METALL_D, 6) +
      R(-53, -40, 106, 7, "#cbd5e0", 3) + R(-16, -43, 30, 3, DUNKEL, 1.5) + P("M22 -40a4 4 0 0 1 8 0z", "#ef5350") +
      R(-29, -48, 4, 8, METALL_D) + R(25, -48, 4, 8, METALL_D) +
      R(-50, -80, 46, 32, "#2d3748", 4) + R(-47, -77, 40, 26, BILDSCHIRM, 2) + S("M-27 -74v21", GLAS, 2.2) +
      S("M-27 -71q-9 0-12 5M-27 -65.5q-9 0-12 5M-27 -60q-9 0-12 5M-27 -71q9 0 12 5M-27 -65.5q9 0 12 5M-27 -60q9 0 12 5", GLAS, 1.5, `opacity="0.85"`) +
      R(4, -80, 46, 32, "#2d3748", 4) + R(7, -77, 40, 26, BILDSCHIRM, 2) + C(27, -67, 8, GLAS, `opacity="0.85"`) + R(23, -61, 8, 6, GLAS, 2, `opacity="0.85"`) +
      C(24, -68, 2, BILDSCHIRM) + C(30, -68, 2, BILDSCHIRM) },
    s_skelett: { name: "Skelett", der: "das Skelett", kat: "spital", w: 46, h: 126, d: () =>
      E(0, -3, 15, 3.5, DUNKEL) + R(-1.5, -26, 3, 24, METALL_D) +
      knochen("M-6 -58L-8 -32L-8 -12", 4.5) + knochen("M6 -58L8 -32L8 -12", 4.5) + C(-8, -32, 2.6, KNOCHEN) + C(8, -32, 2.6, KNOCHEN) +
      E(-10, -10, 4, 2.2, KNOCHEN, `stroke="${KNOCHEN_RAND}" stroke-width="0.8"`) + E(10, -10, 4, 2.2, KNOCHEN, `stroke="${KNOCHEN_RAND}" stroke-width="0.8"`) +
      knochen("M-12 -100l-5 22l-1 18", 3.5) + knochen("M12 -100l5 22l1 18", 3.5) + C(-18, -58, 3, KNOCHEN, `stroke="${KNOCHEN_RAND}" stroke-width="0.8"`) + C(18, -58, 3, KNOCHEN, `stroke="${KNOCHEN_RAND}" stroke-width="0.8"`) +
      knochen("M0 -102V-62", 3.4) + knochen("M-12 -101h24", 3) +
      knochen("M-10 -94q10-5 20 0", 2.6) + knochen("M-11 -88q11-5 22 0", 2.6) + knochen("M-11 -82q11-5 22 0", 2.6) + knochen("M-9 -76q9-4 18 0", 2.6) +
      P("M-11 -64q11-6 22 0l-3 9q-8 4-16 0z", KNOCHEN, `stroke="${KNOCHEN_RAND}" stroke-width="1"`) +
      C(0, -114, 10, KNOCHEN, `stroke="${KNOCHEN_RAND}" stroke-width="1"`) + R(-6, -108, 12, 7, KNOCHEN, 3, `stroke="${KNOCHEN_RAND}" stroke-width="1"`) +
      C(-3.6, -115, 2.8, "#5a6577") + C(3.6, -115, 2.8, "#5a6577") + P("M0 -112l-1.4 3h2.8z", "#5a6577") + S("M-3.5 -104.5h7M-1.5 -106v3M1.5 -106v3", "#5a6577", 0.7) },
    s_leuchtkasten: { name: "Leuchtkasten", der: "der Leuchtkasten", kat: "spital", art: "wand", w: 82, h: 50, licht: true, tags: ["roentgenbild", "bild"], d: () =>
      R(-41, -25, 82, 50, "#e2e8f0", 4) + R(-38, -22, 76, 44, "#f7fbff", 2) +
      R(-36, -20, 34, 40, BILDSCHIRM, 2) + S("M-22 19v-8M-16 19v-8", GLAS, 2.6, `opacity="0.85"`) +
      S("M-25 7l-2-10M-21 7l-0.5-11M-17 7l1-11M-13 7l2.5-9", GLAS, 2, `opacity="0.85"`) +
      S("M-27.5 -5l-1.2-9M-21.5 -6l-0.4-10M-15.5 -6l0.8-10M-10 -3.5l2-8", GLAS, 1.6, `opacity="0.85"`) + S("M-26 9l-6-5l-2-5", GLAS, 2, `opacity="0.85"`) +
      R(2, -20, 34, 40, BILDSCHIRM, 2) + S("M19 -14v28", GLAS, 5, `opacity="0.85"`) + C(16.8, -15, 3.2, GLAS, `opacity="0.85"`) + C(21.2, -15, 3.2, GLAS, `opacity="0.85"`) +
      C(16.8, 15, 3.2, GLAS, `opacity="0.85"`) + C(21.2, 15, 3.2, GLAS, `opacity="0.85"`) + S("M15.5 -1l3 2-2 2 4 1.5", BILDSCHIRM, 1.4) },
    s_kopfhoerer: { name: "Kopfhörer", der: "der Kopfhörer", kat: "spital", klein: true, w: 30, h: 26, farbe: "#3a86ff", tags: ["musik"], d: (c) =>
      S("M-11 -12a11 12 0 0 1 22 0", "#4a5568", 3.5) + R(-15, -15, 8, 14, c, 3.5) + R(7, -15, 8, 14, c, 3.5) +
      R(-8, -13, 2.5, 10, DUNKEL, 1) + R(5.5, -13, 2.5, 10, DUNKEL, 1) + T(0, -4, "♪", 9, "#7c5ce6") },
    s_roentgenmappe: { name: "Röntgenbilder", der: "die Röntgenbilder", kat: "spital", klein: true, w: 34, h: 30, d: () =>
      R(-12, -30, 24, 18, BILDSCHIRM, 2) + S("M-5 -24l10 6", GLAS, 2.4) + C(-6.5, -25, 1.8, GLAS) + C(-4.5, -23, 1.8, GLAS) + C(4.5, -19.5, 1.8, GLAS) + C(6.5, -17.5, 1.8, GLAS) +
      R(-16, -18, 32, 18, "#e8c98f", 2) + R(-10, -12, 20, 7, WEISS, 1) + S("M-8 -8.5h12", "#9aa5b1", 1) },
    s_schutzwand: { name: "Schutzwand", der: "die Schutzwand", kat: "spital", w: 56, h: 104, d: () =>
      R(-26, -12, 52, 5, METALL_D, 2.5) + C(-20, -4, 4, DUNKEL) + C(20, -4, 4, DUNKEL) +
      R(-24, -104, 48, 92, "#a0aec0", 6) + R(-20, -100, 40, 84, "#b8c4d2", 4) +
      R(-14, -94, 28, 26, "#bfe3f2", 3, `stroke="#8a9bb0" stroke-width="2"`) + S("M-8 -88l6-6M0 -84l8-8", WEISS, 2, `opacity="0.7"`) +
      C(0, -44, 10, "#ffd166") + strahlen(0, -44, 1.8, 7.5, "#2d3748") },

    // --- Innere Medizin ------------------------------------------------------------
    s_blutdruck: { name: "Blutdruckmesser", der: "der Blutdruckmesser", kat: "spital", klein: true, w: 38, h: 26, d: () =>
      R(-18, -13, 21, 13, "#3a86ff", 4) + R(-15, -9, 10, 4, "#a8d8f8", 1.5) + S("M3 -6q6 0 7-10", DUNKEL, 1.6) + S("M3 -3q8 0 10-1", DUNKEL, 1.6) +
      C(10, -17, 8, WEISS, `stroke="${METALL_D}" stroke-width="2"`) + S("M10 -17l3.5-4", "#ef5350", 1.4) + C(10, -17, 1.2, TINTE) +
      S("M4.5 -17h1.4M10 -22.5v1.4M15.5 -17h-1.4", METALL_D, 1) + E(15, -4, 4.5, 4, "#2d3748") },
    s_ekg: { name: "EKG-Gerät", der: "das EKG-Gerät", kat: "spital", w: 54, h: 82, licht: true, tags: ["monitor"], d: () =>
      R(-22, -10, 44, 5, DUNKEL, 2.5) + C(-18, -4, 4, DUNKEL) + C(18, -4, 4, DUNKEL) + R(-3, -46, 6, 36, METALL, 2) +
      R(-12, -80, 24, 4, METALL_D, 2) + R(-25, -77, 50, 31, "#e2e8f0", 5) + R(-21, -73, 28, 18, BILDSCHIRM, 2) +
      S("M-20 -64h4l2-6 3 11 2-5h3l2-4 2 8 1-4h2", LEUCHTGRUEN, 1.3) + C(13, -69, 2, "#7cc05e") + C(19, -69, 2, "#ffd166") + R(11, -63, 11, 3, DUNKEL, 1.5) +
      P("M8 -48h14v14q-3.5 3-7 0q-3.5 3-7 0z", "#ffe4ec") + S("M9 -42h2l1.5-4 2 8 1.5-4h4", "#ef5350", 0.9) +
      S("M-24 -58Q-27 -44 -21 -30", "#9aa5b1", 1.2) + S("M-24 -54Q-26 -40 -15 -28", "#9aa5b1", 1.2) + S("M-24 -50Q-24 -38 -9 -32", "#9aa5b1", 1.2) +
      C(-21, -30, 2.2, "#ef5350") + C(-15, -28, 2.2, "#ffd166") + C(-9, -32, 2.2, "#7cc05e") },
    s_herzmodell: { name: "Herzmodell", der: "das Herzmodell", kat: "spital", klein: true, w: 20, h: 34, d: () =>
      R(-9, -4, 18, 4, DUNKEL, 2) + R(-1.5, -10, 3, 7, METALL_D, 1) +
      S("M-2 -25q0-7 5-7q5 0 5 5", "#d64545", 3.5) + S("M4 -24v-6", "#3a86ff", 3) + S("M-6 -23l-2-5", "#3a86ff", 3) +
      herz(0, -18, 10, "#ef5350") + S("M3 -21q-3 5 0 10", "#3a86ff", 1.3) + E(-4, -21, 2.2, 1.4, WEISS, `opacity="0.55"`) },
    s_fiebermesser: { name: "Fiebermesser", der: "der Fiebermesser", kat: "spital", klein: true, w: 36, h: 10, d: () =>
      R(10, -6.2, 8, 3.4, METALL, 1.7) + R(-17.3, -8.8, 29.3, 8.1, WEISS, 4, `stroke="${RAND}" stroke-width="1.4"`) +
      R(-13, -7.4, 12, 5.4, "#cbe9f5", 1.2) + T(-7, -3, "38", 4.8, TINTE) + C(5, -4.75, 1.8, "#3a86ff") },
    s_pillendose: { name: "Pillendose", der: "die Pillendose", kat: "spital", klein: true, w: 38, h: 16, tags: ["medikamente"], d: () =>
      R(-19, -11, 38, 11, "#e2e8f0", 2.5) +
      Array.from({ length: 7 }, (_, i) => {
        const x = -17.6 + i * 5.1;
        return R(x, -9, 4.4, 7, "#f7fbff", 1) + C(x + 2.2, -4.5, 1.5, ["#ff9f43", "#ef5350", "#7cc05e", "#3a86ff", "#ffd166", "#a78bfa", "#ff7aa2"][i]) + R(x, -15, 4.4, 4, BUNT[i], 1.2);
      }).join("") },
    s_koerperposter: { name: "Körper-Poster", der: "das Körper-Poster", kat: "spital", art: "wand", w: 50, h: 70, tags: ["bild"], d: () =>
      R(-24, -34, 48, 68, WEISS, 2, `stroke="${RAND}" stroke-width="2"`) +
      S("M-12 -13l-5 20M12 -13l5 20", HAUT, 5) + S("M-5 11v20M5 11v20", HAUT, 6) + P("M-11 -15h22l-1 27h-20z", HAUT) + R(-2.5, -19, 5, 5, HAUT) + C(0, -24, 6.5, HAUT) +
      E(0, -26, 4, 2.4, "#ffb3c7") + E(-5, -6, 4, 6.5, "#ff9fb5") + E(5, -6, 4, 6.5, "#ff9fb5") + herz(1.5, -4, 3.4, "#ef5350") +
      P("M-3 3q6-3 7 1t-4 4q-5 0-3-5z", "#ff9f6b") + S("M-6 9q3-2 6 0t6 0", "#e8a85a", 1.6) },
    s_untersuchungslampe: { name: "Untersuchungslampe", der: "die Untersuchungslampe", kat: "spital", w: 52, h: 112, licht: true, tags: ["lampe"], d: () =>
      S("M-14 -5h28", DUNKEL, 3.5) + C(-14, -2.5, 2.6, DUNKEL) + C(14, -2.5, 2.6, DUNKEL) + C(0, -2.5, 2.6, DUNKEL) +
      R(-2.5, -80, 5, 75, METALL, 2) + S("M0 -80q0-24 14-26", METALL_D, 3.5) +
      S("M7 -86l-3 6M14 -86v7M21 -86l3 6", "#ffe58a", 1.6, `opacity="0.8"`) + E(14, -98, 11, 7, "#e2e8f0") + E(14, -94.5, 8, 3.5, "#fff6c2") },
    s_rollhocker: { name: "Rollhocker", der: "der Rollhocker", kat: "spital", w: 40, h: 48, farbe: "#3a86ff", tags: ["stuhl", "sitz"], d: (c) =>
      S("M-16 -9l16-4l16 4", DUNKEL, 4) + C(-16, -4.5, 4.5, DUNKEL) + C(16, -4.5, 4.5, DUNKEL) + C(0, -5, 4, DUNKEL) +
      R(-3, -37, 6, 26, METALL, 2) + E(0, -22, 11, 2.5, "none", `stroke="${METALL_D}" stroke-width="2"`) +
      R(-17, -48, 34, 11, c, 5.5) + R(-13, -46, 26, 3, shade(c, 0.25), 1.5) },
    s_arztkittel: { name: "Arztkittel", der: "der Arztkittel", kat: "spital", art: "wand", w: 48, h: 76, d: () =>
      R(-2, -38, 4, 6, METALL_D, 1.5) +
      P("M-15 -28l-7 4l-1 36h7l2-30z", WEISS, `stroke="${RAND}" stroke-width="1.5"`) + P("M15 -28l7 4l1 36h-7l-2-30z", WEISS, `stroke="${RAND}" stroke-width="1.5"`) +
      P("M-15 -28L-17 37H17L15 -28L6 -31L0 -16L-6 -31Z", WEISS, `stroke="${RAND}" stroke-width="1.5"`) + P("M-6 -31L0 -16L6 -31Z", "#a8d8f8") +
      S("M-15 -28L0 -34L15 -28", METALL_D, 2.5) +
      C(0, -6, 1.5, RAND) + C(0, 6, 1.5, RAND) + C(0, 18, 1.5, RAND) + R(-13, 12, 9, 9, "none", 1.5, `stroke="${RAND}" stroke-width="1.4"`) + R(4, 12, 9, 9, "none", 1.5, `stroke="${RAND}" stroke-width="1.4"`) +
      R(5, -12, 8, 7, "none", 1, `stroke="${RAND}" stroke-width="1.2"`) + R(7, -16, 2, 6, "#3a86ff", 1) +
      S("M-7 -30Q-10 -8 0 -6Q8 -8 7 -30", "#2d3748", 1.8) + C(0, -5, 3.2, METALL) + C(0, -5, 1.6, "#cbd5e0") },
    s_reflexhammer: { name: "Reflexhammer", der: "der Reflexhammer", kat: "spital", klein: true, w: 30, h: 24, d: () => {
      // Waagrecht gezeichnet (Stiel nach rechts, Kopf quer dazu) und schräg gestellt.
      const schraeg = `transform="translate(-12.5 -3) rotate(-30)"`;
      return R(0, -1.4, 22, 2.8, METALL, 1.4, schraeg) + R(0, -1.9, 8, 3.8, DUNKEL, 1.9, schraeg) +
        R(19.5, -7.5, 7, 15, "#ef5350", 3.5, schraeg) + R(21, -6, 1.8, 9, "#ff9a9a", 0.9, schraeg);
    } },

    // --- Operationssaal -------------------------------------------------------------
    s_instrumententisch: { name: "Instrumententisch", der: "der Instrumententisch", kat: "spital", w: 68, h: 64, tags: ["tisch"], d: () => {
      const st = "#f8fafc";
      return C(-26, -4, 4, DUNKEL) + C(26, -4, 4, DUNKEL) + R(-30, -14, 60, 4, METALL_D, 2) + R(-28, -50, 4, 40, METALL, 1.5) + R(24, -50, 4, 40, METALL, 1.5) +
        P("M-34 -50h68l-6-14h-56z", "#cbd5e0") + P("M-31 -51h62l-5-11.5h-52z", "#4fb39a") + R(-34, -51, 68, 3, METALL_D, 1.5) +
        C(-20, -55, 2, "none", `stroke="${st}" stroke-width="1.3"`) + C(-20, -59.5, 2, "none", `stroke="${st}" stroke-width="1.3"`) + S("M-18.3 -56l11-0.8M-18.3 -58.5l11 0.8", st, 1.3) +
        S("M-3 -55h9", st, 1.4) + P("M6 -56.2l6 1.2-6 1.2z", st) + S("M16 -59h12M16 -56h12", st, 1.2) + C(15, -57.5, 1.6, "none", `stroke="${st}" stroke-width="1"`);
    } },
    s_narkosegeraet: { name: "Narkosegerät", der: "das Narkosegerät", kat: "spital", w: 66, h: 124, licht: true, d: () =>
      R(-30, -12, 60, 5, DUNKEL, 2.5) + C(-24, -4, 4, DUNKEL) + C(24, -4, 4, DUNKEL) +
      R(-28, -50, 56, 38, "#e2e8f0", 4) + R(-24, -46, 48, 14, "#cbd5e0", 2.5) + R(-24, -29, 48, 14, "#cbd5e0", 2.5) + R(-6, -41, 12, 3, DUNKEL, 1.5) + R(-6, -24, 12, 3, DUNKEL, 1.5) +
      R(-32, -55, 64, 5, "#cbd5e0", 2.5) + R(-22, -98, 44, 43, "#e2e8f0", 4) +
      C(-12, -86, 5.5, WEISS, `stroke="${METALL_D}" stroke-width="1.5"`) + C(1, -86, 5.5, WEISS, `stroke="${METALL_D}" stroke-width="1.5"`) + S("M-12 -86l2.5-3M1 -86l-3-2", "#ef5350", 1.2) +
      C(-12, -70, 3, "#3a86ff") + C(-3, -70, 3, "#ffd166") + C(6, -70, 3, "#7cc05e") +
      R(12, -94, 3, 20, GLAS, 1.5, `stroke="${RAND}" stroke-width="1"`) + R(16.5, -94, 3, 20, GLAS, 1.5, `stroke="${RAND}" stroke-width="1"`) + C(13.5, -82, 1.4, "#ef5350") + C(18, -87, 1.4, "#3a86ff") +
      R(-26, -124, 52, 27, "#2d3748", 4) + R(-23, -121, 46, 21, BILDSCHIRM, 2) + S("M-21 -114h6l2-4 3 8 2-4h6", LEUCHTGRUEN, 1.3) + S("M-21 -105q3-4 6 0t6 0t6 0", "#ffd166", 1.3) + T(15, -107, "98", 8, "#6cc3d5") +
      S("M22 -76q10 2 8 12", "#a0aec0", 3) + E(28, -56, 5, 8, "#6c8cd5") +
      S("M-22 -66q-10 4-8 14", "#a8d8f8", 3) + P("M-33 -53h10l-1 6q-4 3-8 0z", GLAS, `stroke="#a8d8f8" stroke-width="1.5"`) },
    s_opkittel: { name: "OP-Kittel", der: "der OP-Kittel", kat: "spital", art: "wand", w: 42, h: 70, farbe: "#4fb39a", d: (c) =>
      R(-2, -35, 4, 5, METALL_D, 1.5) +
      P("M-12 -26l-8 5v26h6l2-22z", shade(c, -0.12)) + P("M12 -26l8 5v26h-6l-2-22z", shade(c, -0.12)) +
      P("M-12 -26L-17 33H17L12 -26Q0 -21 -12 -26Z", c) + P("M-5 -24.5L0 -17L5 -24.5Z", shade(c, -0.25)) +
      P("M-11 -26q0-9 11-9t11 9z", shade(c, 0.22)) + R(4, 8, 8, 8, shade(c, -0.1), 1.5) +
      R(-7, -12, 14, 8, "#a8d8f8", 2) + S("M-7 -10q-4 0-4 3M7 -10q4 0 4 3", "#a8d8f8", 1) + S("M-5 -9h10M-5 -7h10", "#7fb8d8", 0.7) },
    s_handschuhe: { name: "Handschuhe", der: "die Handschuhe", kat: "spital", klein: true, w: 28, h: 28, d: () => {
      const g = "#7fa8f5";
      return R(-9.5, -23, 2.6, 8, g, 1.3, dreh(-30, -8, -18)) + R(-5.5, -26, 2.6, 10, g, 1.3) + R(-2.5, -28, 2.6, 12, g, 1.3) + R(0.5, -27.5, 2.6, 11.5, g, 1.3) + R(3.5, -25.5, 2.6, 9.5, g, 1.3) +
        R(-6, -20, 12, 5, g, 2) + R(-13.5, -16.5, 27, 15.75, WEISS, 2, `stroke="${RAND}" stroke-width="1.5"`) + E(0, -17, 8, 1.6, "#cbd5e0") + R(-10, -11, 20, 7, "#6c9cf0", 1.5);
    } },
    s_opmonitor: { name: "OP-Bildschirm", der: "der OP-Bildschirm", kat: "spital", art: "decke", w: 64, h: 68, licht: true, tags: ["monitor"], d: () =>
      R(-8, 0, 16, 4, METALL_D, 2) + R(-2.5, 3, 5, 22, METALL, 2) + C(0, 26, 4, METALL_D) +
      R(-30, 30, 60, 38, "#2d3748", 4) + R(-27, 33, 54, 31, BILDSCHIRM, 2) +
      S("M-25 46h7l3-7 4 14 3-9 2 4h5", LEUCHTGRUEN, 1.5) + T(17, 47, "72", 9, LEUCHTGRUEN) + T(9, 46, "♥", 7, "#ff5c7a") +
      S("M-25 58q3-4 6 0t6 0t6 0t6 0", "#ffd166", 1.3) + T(17, 61, "98", 7, "#6cc3d5") },
    s_waschrinne: { name: "Waschrinne", der: "die Waschrinne", kat: "spital", w: 102, h: 82, tags: ["lavabo"], d: () =>
      R(-50, -82, 100, 34, GLAS, 3) + S("M-50 -65h100M-25 -82v34M0 -82v34M25 -82v34", "#cbe3ef", 1) + R(-5, -80, 10, 13, WEISS, 2.5, `stroke="${RAND}" stroke-width="1"`) + R(-1.5, -67, 3, 3, DUNKEL, 1) +
      leg(-42, 28, METALL_D, 5) + leg(37, 28, METALL_D, 5) +
      P("M-50 -50h100l-5 18q-1 4-5 4h-80q-4 0-5-4z", "#cbd5e0") + P("M-46 -48h92l-1 4h-90z", "#a0aec0") + R(-51, -52, 102, 4, METALL, 2) +
      S("M-22 -50v-20q0-7 7-7q6 0 6 6v3", METALL_D, 3) + S("M18 -50v-20q0-7 7-7q6 0 6 6v3", METALL_D, 3) + S("M-9 -64v8M31 -64v8", "#6cc3d5", 1.6, `stroke-dasharray="2 3"`) },
    s_nierenschale: { name: "Nierenschale", der: "die Nierenschale", kat: "spital", klein: true, w: 32, h: 12, d: () =>
      P("M-15 -6.5C-15 -12.5 15 -12.5 15 -6.5C15 -0.5 6 0.5 0 -3.5C-6 0.5 -15 -0.5 -15 -6.5Z", METALL) + P("M-12 -7C-12 -10.9 12 -10.9 12 -7C12 -3.5 5 -2.9 0 -5.5C-5 -2.9 -12 -3.5 -12 -7Z", "#cbd5e0") +
      C(-8, -8, 1.6, "none", `stroke="${DUNKEL}" stroke-width="1"`) + C(-8, -4.9, 1.6, "none", `stroke="${DUNKEL}" stroke-width="1"`) + S("M-6.6 -7.5l11-2M-6.6 -5.5l11 2.6", DUNKEL, 1) },
    s_opschild: { name: "OP-Schild", der: "das OP-Schild", kat: "spital", art: "wand", w: 50, h: 26, licht: true, d: () =>
      R(-25, -13, 50, 26, "#2d3748", 5) + R(-22, -10, 44, 20, "#ef5350", 3) + T(0, 7, "OP", 18, WEISS) },
    s_opschuhe: { name: "OP-Schuhe", der: "die OP-Schuhe", kat: "spital", klein: true, w: 40, h: 13, farbe: "#ff7aa2", d: (c) =>
      clog(-18.5, shade(c, -0.15)) + clog(-5, c) },

    // --- Geburtsabteilung ------------------------------------------------------------
    s_wickeltisch: { name: "Wickeltisch", der: "der Wickeltisch", kat: "spital", w: 80, h: 78, farbe: "#a8d8f8", flaeche: -71, fx: [-27, 27], tags: ["tisch"], d: (c) =>
      leg(-36, 6, HOLZ_DD, 5) + leg(31, 6, HOLZ_DD, 5) + R(-38, -60, 76, 54, c, 4) +
      R(-34, -55, 68, 22, shade(c, 0.15), 3) + R(-34, -30, 68, 22, shade(c, 0.15), 3) + C(0, -44, 2.4, shade(c, -0.35)) + C(0, -19, 2.4, shade(c, -0.35)) +
      R(-40, -64, 80, 5, shade(c, -0.18), 2.5) +
      P("M-37 -63V-73Q-37 -77.5 -33 -77Q-29.5 -76.5 -29 -71H29Q29.5 -76.5 33 -77Q37 -77.5 37 -73V-63Z", "#fff1b8") + S("M-31 -66.5h62", "#ffe08a", 1.2) +
      C(-20, -68.5, 1.4, "#ffb3c7") + C(-7, -68.5, 1.4, "#a8d8f8") + C(7, -68.5, 1.4, "#ffb3c7") + C(20, -68.5, 1.4, "#a8d8f8") +
      R(-40, -60, 7, 22, "#ffb3c7", 2) + R(-40, -42, 7, 2.5, "#ff9fb5", 1) },
    s_gebaerbett: { name: "Gebärbett", der: "das Gebärbett", kat: "spital", w: 128, h: 80, farbe: "#c9b6ff", tags: ["bett", "spitalbett"], d: (c) =>
      R(-44, -7, 88, 6, METALL_D, 3) + C(-38, -3, 3.4, DUNKEL) + C(38, -3, 3.4, DUNKEL) + R(-18, -38, 36, 32, "#cbd5e0", 4) +
      R(-58, -48, 38, 12, shade(c, -0.08), 6, dreh(30, -20, -42)) + R(-54, -57, 18, 9, WEISS, 4.5, dreh(30, -20, -42)) +
      R(24, -48, 32, 12, shade(c, -0.12), 6, dreh(32, 26, -42)) +
      R(-24, -48, 52, 12, c, 6) + R(-18, -47, 40, 3, shade(c, 0.25), 1.5) + R(-20, -37, 44, 3, METALL, 1.5) +
      S("M2 -48v-20q0-8 8-8h8q8 0 8 8v20", METALL, 3) + herz(14, -61, 4, "#ff7aa2") },
    s_babywaage: { name: "Babywaage", der: "die Babywaage", kat: "spital", klein: true, w: 44, h: 22, tags: ["waage"], d: () =>
      R(-3, -12, 6, 4, METALL_D, 1) + P("M-22 -20Q0 -10 22 -20L19 -13Q0 -5 -19 -13Z", "#ffb3c7") + S("M-17 -16.5Q0 -9 17 -16.5", WEISS, 1, `opacity="0.7"`) +
      R(-18, -9, 36, 9, "#e2e8f0", 3) + R(-7, -7.5, 14, 6, "#2d3748", 1.5) + T(0, -2.8, "3,4", 4.8, LEUCHTGRUEN) },
    s_stillsessel: { name: "Stillsessel", der: "der Stillsessel", kat: "spital", w: 76, h: 72, farbe: "#a78bfa", tags: ["sofa", "sitz"], d: (c) =>
      S("M-34 -7Q0 0 34 -7", HOLZ_D, 5) + R(-24, -15, 5, 10, HOLZ_D, 2) + R(19, -15, 5, 10, HOLZ_D, 2) +
      R(-28, -72, 56, 46, shade(c, -0.14), 15) + C(-10, -58, 1.6, shade(c, -0.32)) + C(10, -58, 1.6, shade(c, -0.32)) + C(0, -47, 1.6, shade(c, -0.32)) +
      R(-28, -32, 56, 18, c, 6) + R(-37, -46, 14, 32, shade(c, -0.04), 7) + R(23, -46, 14, 32, shade(c, -0.04), 7) +
      P("M-30 -34Q0 -20 30 -34L32 -41Q0 -25 -32 -41Z", "#ffd166") + C(-16, -31, 1.4, "#ff9f6b") + C(0, -28, 1.4, "#ff9f6b") + C(16, -31, 1.4, "#ff9f6b") },
    s_schoppen: { name: "Schoppen", der: "der Schoppen", kat: "spital", klein: true, w: 16, h: 32, tags: ["milch"], d: () =>
      R(-6.5, -22.5, 13, 21.9, GLAS, 4, `stroke="${RAND}" stroke-width="1.2"`) + R(-5.5, -14, 11, 13, "#fff3cf", 3) + S("M-5 -18h3M-5 -14h3M-5 -10h3", "#a8d8f8", 0.8) +
      herz(1.5, -7, 2.4, "#ff9fb5") + R(-7.5, -25.5, 15, 4.5, "#ff9fb5", 1.8) + P("M-4.5 -25.5q0-3 2.5-3.5q0-3 2-3t2 3q2.5 0.5 2.5 3.5z", "#f5c99a") },
    s_nuggi: { name: "Nuggi", der: "der Nuggi", kat: "spital", klein: true, w: 20, h: 17, farbe: "#6cc3d5", d: (c) =>
      E(0, -11, 9, 6, c) + C(-5.5, -11, 1.3, shade(c, 0.55)) + C(5.5, -11, 1.3, shade(c, 0.55)) + C(0, -11, 2.8, "#ffd166") + C(0, -5.4, 4.2, "none", `stroke="#ff9fb5" stroke-width="2.2"`) },
    s_mobile: { name: "Mobile", der: "das Mobile", kat: "spital", art: "decke", w: 64, h: 66, d: () =>
      S("M0 0v18", "#9aa5b1", 1.2) + S("M-26 20Q0 14 26 20", HOLZ_D, 2.5) + S("M-24 20v14M-8 17.5v26M8 17.5v20M24 20v12", "#9aa5b1", 1) +
      stern(-24, 40, 7, "#ffd166") + P("M-8 43a7 7 0 1 0 6 11a6 6 0 1 1-6-11z", "#ffe08a") +
      C(5, 42, 4, "#a8d8f8") + C(10, 40.5, 5, "#a8d8f8") + C(14.5, 43, 3.5, "#a8d8f8") + R(5, 42, 10, 4.5, "#a8d8f8", 2) + herz(24, 37, 5, "#ff9fb5") },
    s_babybad: { name: "Babybadewanne", der: "die Babybadewanne", kat: "spital", w: 66, h: 62, farbe: "#a8d8f8", d: (c) =>
      S("M-24 -2L20 -40M24 -2L-20 -40", METALL_D, 3) + R(-28, -3, 10, 3, DUNKEL, 1.5) + R(18, -3, 10, 3, DUNKEL, 1.5) +
      C(-16, -49, 4.5, WEISS) + C(-9, -51, 5.5, WEISS) + C(-2, -48.5, 4, WEISS) +
      E(14, -49, 7, 4, "#ffd166") + C(18, -55, 4, "#ffd166") + P("M21.5 -55.5l4 1-4 1.6z", "#f5a623") + C(19, -56.5, 0.9, TINTE) +
      P("M-31 -46h62l-6 16q-2 4-6 4h-38q-4 0-6-4z", c) + R(-33, -48, 66, 5, shade(c, -0.22), 2.5) },
    s_storchenbild: { name: "Storchenbild", der: "das Storchenbild", kat: "spital", art: "wand", w: 52, h: 62, tags: ["bild"], d: () =>
      R(-26, -31, 52, 62, "#d6effa", 3) + R(-25, -30, 50, 60, "none", 3, `stroke="${WEISS}" stroke-width="2"`) +
      C(-14, 20, 4, WEISS) + C(-9, 18.5, 5, WEISS) + C(-4, 20, 4, WEISS) + C(12, 24, 3, WEISS) + C(16, 23, 4, WEISS) +
      S("M-16 -4L-24 1", "#ff7a59", 1.6) + E(-8, -8, 12, 5.5, WEISS) + P("M-10 -11Q-18 -27 -6 -26Q0 -18 0 -11Z", WEISS) + P("M-15 -24q4-4 10-2l-2 3q-4-1-8-1z", TINTE) +
      S("M3 -10Q8 -15 11 -15", WEISS, 3.5) + C(11, -15, 3, WEISS) + C(11.5, -16, 0.8, TINTE) + P("M13 -16.5L22 -13.5L13 -14.2Z", "#ff7a59") +
      S("M19 -14v5", "#cbd5e0", 1) + P("M13 -9h12l-2 10q-4 3-8 0z", "#ffb3c7") + C(19, -4.5, 2.6, HAUT) + R(16.5, -9.5, 5, 2.6, "#ff9fb5", 1) },
    s_kinderwagen: { name: "Kinderwagen", der: "der Kinderwagen", kat: "spital", w: 66, h: 70, farbe: "#7c5ce6", d: (c) =>
      S("M-17 -9L4 -26M19 -9L-2 -26", METALL_D, 2.5) + S("M21 -44L29 -60H31.5", DUNKEL, 3) +
      P("M-29 -48H19Q23 -48 23 -44V-38Q23 -26 9 -24H-17Q-29 -26 -29 -38Z", c) + R(-8, -50, 28, 4, WEISS, 2) +
      P("M-29 -48Q-29 -70 -6 -70V-48Z", shade(c, -0.18)) + S("M-24 -48Q-22 -62 -6 -64M-17 -48Q-14 -58 -6 -59", shade(c, -0.35), 1.2) +
      C(-17, -9, 9, "none", `stroke="${DUNKEL}" stroke-width="3.5"`) + C(-17, -9, 2.5, METALL_D) + C(19, -9, 9, "none", `stroke="${DUNKEL}" stroke-width="3.5"`) + C(19, -9, 2.5, METALL_D) },
    s_rassel: { name: "Rassel", der: "die Rassel", kat: "spital", klein: true, w: 18, h: 30, farbe: "#ff9fb5", tags: ["spielzeug"], d: (c) =>
      C(0, -4.8, 3.4, "none", `stroke="#ffd166" stroke-width="2.4"`) + R(-2, -17, 4, 10, "#ffd166", 2) + R(-4, -17, 8, 3, "#ff7aa2", 1.5) +
      C(0, -22, 8, c) + C(-3, -24, 1.6, WEISS) + C(3, -20.5, 1.6, WEISS) + C(3.4, -26, 1.4, "#ffd166") + C(-3.6, -19, 1.4, "#ffd166") },
  };

  // Jede Liste: zuerst die eigenen Dinge des Zimmers, dann passende bestehende.
  const RAEUME = {
    empfang: [
      "s_hschild", "s_wartestuehle", "s_nummernautomat", "s_infobildschirm", "s_wegweiser", "s_desinfektion", "s_absperrung",
      "s_prospekte", "s_perlenspiel", "s_rollstuhlschild", "s_klingel", "s_klemmbrett", "s_stempel",
      "empfangstheke", "computer", "telefon", "wasserspender", "zeitungsstaender", "rollstuhl", "erstehilfe",
    ],
    notfall: [
      "s_krankentrage", "s_notfallwagen", "s_defibrillator", "s_sauerstoff", "s_blaulicht", "s_notruf144", "s_notrufknopf",
      "s_pflaster", "s_gips", "s_kuehlkissen", "arztkoffer",
      "spitalbett", "herzmonitor", "infusion", "rollstuhl", "paravent", "erstehilfe", "medikamente", "stethoskop", "kruecken", "liege",
    ],
    paediatrie: [
      "s_kinderspitalbett", "s_teddy", "s_messlatte", "s_tierinfusion", "s_kinderzeichnungen", "s_ballone", "s_bilderbuecher",
      "s_maltisch", "s_rutschauto", "s_spielteppich", "s_kinderrollstuhl",
      "kuscheltier", "spielkiste", "kloetze", "waage", "stethoskop", "poster", "buecherstapel", "sitzsack", "liege",
    ],
    radiologie: [
      "roentgen", "s_mri", "roentgenbild", "s_leuchtkasten", "s_skelett", "s_bedienpult", "s_bleischuerze", "s_warnschild",
      "s_schutzwand", "s_kopfhoerer", "s_roentgenmappe",
      "ultraschall", "liege", "computer", "paravent", "stuhl", "kruecken",
    ],
    innere: [
      "s_ekg", "s_blutdruck", "s_koerperposter", "s_herzmodell", "s_arztkittel", "s_untersuchungslampe", "s_rollhocker",
      "s_fiebermesser", "s_pillendose", "s_reflexhammer",
      "spitalbett", "herzmonitor", "liege", "stethoskop", "medikamente", "computer", "schreibtisch", "stuhl", "infusion", "waage", "paravent",
    ],
    chirurgie: [
      "operationstisch", "oplampe", "s_narkosegeraet", "s_instrumententisch", "s_opmonitor", "s_waschrinne", "s_opkittel",
      "s_opschild", "s_handschuhe", "s_nierenschale", "s_opschuhe",
      "herzmonitor", "infusion", "medikamente", "paravent", "lavabo",
    ],
    geburt: [
      "wiege", "brutkasten", "s_gebaerbett", "s_wickeltisch", "s_babywaage", "s_stillsessel", "s_kinderwagen", "s_babybad",
      "s_mobile", "s_storchenbild", "s_schoppen", "s_nuggi", "s_rassel",
      "spitalbett", "kuscheltier", "blumenvase", "herzmonitor", "vorhangfenster",
    ],
  };

  // Das Bild an der Wand jedes Zimmers (Bereich x -23..23, y -17..17).
  const MOTIVE = {
    // Das Spitalzeichen: ein weisses H auf Blau.
    empfang: () => R(-13, -14, 26, 28, SPITALBLAU, 4) + hZeichen(0, 0, 8.5, WEISS),
    // Ein Krankenwagen mit Blaulicht und der Nummer 144.
    notfall: () =>
      R(-4, -13, 7, 4, "#3a86ff", 2) + R(-20, -10, 30, 18, WEISS, 3, `stroke="${RAND}" stroke-width="1.2"`) +
      P("M10 -5h6l5 6v7h-11z", WEISS, `stroke="${RAND}" stroke-width="1.2"`) + P("M12 -3h3.4l3.6 4.4h-7z", "#a8d8f8") +
      R(-20, 1, 41, 3, "#ff9f43") + T(-5, -1.5, "144", 7.5, "#ef5350") + C(-11, 9, 4, DUNKEL) + C(-11, 9, 1.6, METALL) + C(13, 9, 4, DUNKEL) + C(13, 9, 1.6, METALL),
    // Ein Teddy mit Pflaster.
    paediatrie: () =>
      C(-9, -9, 5, "#d9a066") + C(9, -9, 5, "#d9a066") + C(-9, -9, 2.4, "#f0cfa0") + C(9, -9, 2.4, "#f0cfa0") + C(0, 1, 12, "#d9a066") +
      E(0, 5, 5.5, 4, "#f0cfa0") + E(0, 3.4, 2, 1.4, TINTE) + C(-4.5, -1, 1.5, TINTE) + C(4.5, -1, 1.5, TINTE) + S("M-1.8 6.6q1.8 1.3 3.6 0", TINTE, 0.9) +
      R(-10, -7, 9, 3.6, "#f2c79b", 1.8, dreh(-30, -5.5, -5.2)) + R(-7.2, -7, 3, 3.6, "#e3a47a", 0.6, dreh(-30, -5.5, -5.2)),
    // Ein Röntgenbild von einer Hand.
    radiologie: () =>
      R(-13, -16, 26, 32, BILDSCHIRM, 2) + S("M-2 15v-6M3 15v-6", GLAS, 2.2) + S("M-5 7l-2-8M-1 7l-0.4-9M3 7l1-9M6.5 7l2-7", GLAS, 1.7) +
      S("M-7.2 -2l-1-7M-1.5 -3l-0.3-8M4 -3l0.6-8M8.5 -0.5l1.6-6", GLAS, 1.3) + S("M-6 9l-5-4l-1.6-4", GLAS, 1.7),
    // Ein Herz mit Herzschlag-Linie.
    innere: () =>
      herz(0, 0, 14, "#ef5350") + S("M-22 1h10M12 1h10", "#2d3748", 1.6) + S("M-12 1h4l2.5-6 4 13 3-10 2 3h8.5", WEISS, 1.8),
    // Eine Chirurgin mit Haube und Maske.
    chirurgie: () =>
      C(0, 2, 11, HAUT) + P("M-12.5 -2q0-14 12.5-14t12.5 14z", "#4fb39a") + R(-12.5, -4, 25, 3.5, "#3f9a83", 1.5) +
      C(-4.2, 0.5, 1.4, TINTE) + C(4.2, 0.5, 1.4, TINTE) + R(-9, 4, 18, 9.5, "#a8d8f8", 3) + S("M-9 6h-3M9 6h3", "#a8d8f8", 1) + S("M-6 7.5h12M-6 10h12", "#7fb8d8", 0.7),
    // Ein Neugeborenes, gut eingepackt.
    geburt: () =>
      stern(-16, -9, 3.4, "#ffd166") + stern(16, -11, 2.8, "#ffd166") + stern(17, 9, 2.2, "#ffd166") +
      E(0, 3, 12, 13, "#ffb3c7") + P("M-12 1q12 7 24 0v6q-12 7-24 0z", "#ff9fb5") + C(0, -5, 7, HAUT) +
      P("M-9 -4a9 9 0 0 1 18 0", "none", `stroke="#ffb3c7" stroke-width="3"`) + S("M-3.5 -5.5q1 1 2 0M1.5 -5.5q1 1 2 0", TINTE, 0.8) +
      C(-3.8, -2.6, 1.2, "#ffb3c7") + C(3.8, -2.6, 1.2, "#ffb3c7") + herz(0, 10, 3, WEISS),
  };

  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
