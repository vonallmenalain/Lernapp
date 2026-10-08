/*
 * bau-moebel-laeden.js – Die eigenen Dinge der Zimmer Eingangshalle,
 * Lebensmittelladen, Bäckerei, Spielwarenladen, Kleiderladen, Blumenladen
 * und Coiffeur im Dorf (Bauecke).
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten und die Bildmotive an.
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, leg, stern, topf, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE, BUNT } = M.hilfe;

  // Ein Stern mit vielen Zacken (Aktionsschild, Sonnenblume im Blumenwagen).
  function zacken(cx, cy, aussen, innen, n, fill) {
    const pkt = [];
    for (let i = 0; i < n * 2; i += 1) {
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      const r = i % 2 ? innen : aussen;
      pkt.push(`${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`);
    }
    return P(`M${pkt.join("L")}Z`, fill);
  }

  // Eine Brezel um (cx, cy); k = Grösse (1 ist etwa 40 breit und 27 hoch).
  function brezel(cx, cy, k, f, salz = true) {
    const z = (v) => +v.toFixed(2);
    const p = (x, y) => `${z(cx + x * k)} ${z(cy + y * k)}`;
    const seil = `M${p(-6, 7)}L${p(0, -2)}C${p(4, -6)} ${p(6, -10)} ${p(9, -10)}C${p(14, -10)} ${p(17, -4)} ${p(16, 1)}` +
      `C${p(15, 7)} ${p(9, 11)} ${p(0, 11)}C${p(-9, 11)} ${p(-15, 7)} ${p(-16, 1)}C${p(-17, -4)} ${p(-14, -10)} ${p(-9, -10)}` +
      `C${p(-6, -10)} ${p(-4, -6)} ${p(0, -2)}L${p(6, 7)}`;
    const bauch = `M${p(16, 1)}C${p(15, 7)} ${p(9, 11)} ${p(0, 11)}C${p(-9, 11)} ${p(-15, 7)} ${p(-16, 1)}`;
    const koerner = salz ? [[-11, 8.5], [-4, 10.5], [4, 10.5], [11, 8.5], [14.5, -4], [-14.5, -4], [8, -9.5], [-8, -9.5]]
      .map(([x, y]) => C(z(cx + x * k), z(cy + y * k), z(0.9 * k), WEISS)).join("") : "";
    return S(seil, f, z(5 * k)) + S(bauch, f, z(7 * k)) + S(seil, shade(f, 0.3), z(1.4 * k), `opacity="0.7"`) + koerner;
  }

  // Eine Getreideähre, unten bei (x, y), um winkel gedreht (Mehlsack, Bäckertheke).
  function aehre(x, y, f, winkel = 0) {
    const t = `transform="rotate(${winkel} ${x} ${y})"`;
    return S(`M${x} ${y}v-15`, f, 1.3, t) + [0, 1, 2].map((j) => E(x - 2.2, y - 6 - j * 3, 1.6, 2.6, f, `transform="rotate(${winkel} ${x} ${y}) rotate(-25 ${x - 2.2} ${y - 6 - j * 3})"`) +
      E(x + 2.2, y - 6 - j * 3, 1.6, 2.6, f, `transform="rotate(${winkel} ${x} ${y}) rotate(25 ${x + 2.2} ${y - 6 - j * 3})"`)).join("") + E(x, y - 16, 1.4, 2.6, f, t);
  }

  // Eine Socke (Bündchen oben links, Spitze nach rechts), um winkel gedreht.
  function socke(x, y, f, band, winkel = 0) {
    const t = `transform="rotate(${winkel} ${x} ${y})"`;
    return P(`M${x} ${y}h9v14q0 2 2 2h7q5 0 5 5t-5 5h-11q-7 0-7-7z`, f, t) + R(x, y, 9, 3.5, band, 1, t) + R(x, y + 7, 9, 2.2, band, 0, t) + R(x, y + 11, 9, 2.2, band, 0, t) +
      P(`M${x} ${y + 19}q0 7 7 7h1v-5q-6 0-8-4z`, band, t);
  }

  // Kleine Spielsachen für das Spielzeugregal (stehen auf der Höhe y).
  const spielauto = (x, y, f) => R(x - 10, y - 11, 20, 7, f, 3) + R(x - 6, y - 16, 11, 6, f, 2.5) + R(x - 4.5, y - 15, 8, 4, "#a8d8f8", 1) +
    C(x - 6, y - 3.5, 3.5, DUNKEL) + C(x + 6, y - 3.5, 3.5, DUNKEL);
  const ente = (x, y) => E(x, y - 6, 9, 6, "#ffd166") + C(x + 4, y - 15, 5, "#ffd166") + P(`M${x + 8} ${y - 16}l5 1.5l-5 2z`, "#ff9f43") +
    C(x + 5, y - 16.5, 1, TINTE) + P(`M${x - 5} ${y - 8}q4-4 9 0q-4 3-9 0z`, "#f5b82e");
  const baerchen = (x, y, f) => E(x, y - 9, 8, 9, f) + C(x - 5, y - 26, 2.6, f) + C(x + 5, y - 26, 2.6, f) + C(x, y - 21, 6.5, f) +
    E(x, y - 19, 3, 2.2, shade(f, 0.35)) + C(x, y - 20, 1, TINTE) + C(x - 2.4, y - 22.5, 0.9, TINTE) + C(x + 2.4, y - 22.5, 0.9, TINTE) +
    E(x - 5, y - 2, 3.5, 2.4, shade(f, 0.2)) + E(x + 5, y - 2, 3.5, 2.4, shade(f, 0.2));

  // Schuhe von der Seite (Spitze nach rechts), stehen auf der Höhe y.
  const turnschuh = (x, y, f) => P(`M${x} ${y}v-7q0-3 3-3h5l3 3h7q4 0 5 4v3z`, f) + R(x, y - 2, 23, 2, WEISS, 1) + S(`M${x + 6} ${y - 7}l3 2M${x + 9} ${y - 8}l3 2`, WEISS, 1.1);
  const stiefel = (x, y, f) => P(`M${x} ${y}v-18h8v12h7q4 0 4 4v2z`, f) + R(x, y - 2, 19, 2, shade(f, -0.3), 1) + R(x, y - 18, 8, 2.5, shade(f, 0.25), 1);
  const ballerina = (x, y, f) => P(`M${x} ${y}q0-6 4-6h11q5 0 5 6z`, f) + E(x + 10, y - 4.5, 4, 1.4, shade(f, -0.3)) + C(x + 14, y - 5, 1.4, WEISS);

  // Ein Kopf für das Frisuren-Poster (Gesicht, Augen, Lächeln).
  const gesicht = (x, y, haut) => C(x, y, 7, haut) + C(x - 2.4, y - 0.5, 0.9, TINTE) + C(x + 2.4, y - 0.5, 0.9, TINTE) + S(`M${x - 2} ${y + 3}q2 1.6 4 0`, TINTE, 0.9);

  const DINGE = {
    // --- Eingangshalle ---------------------------------------------------------
    d_infotheke: { name: "Infotheke", der: "die Infotheke", w: 120, h: 64, farbe: "#ffd166", flaeche: -64, tags: ["theke"], d: (c) =>
      R(-56, -58, 112, 58, c, 5) + R(-56, -58, 112, 7, shade(c, -0.14)) + R(-50, -45, 34, 34, shade(c, 0.22), 4) + R(16, -45, 34, 34, shade(c, 0.22), 4) +
      R(-56, -7, 112, 7, shade(c, -0.25), 3) + R(-60, -64, 120, 8, shade(c, -0.3), 4) +
      C(0, -28, 13, "#3a86ff") + C(0, -35, 2.6, WEISS) + R(-2.4, -30.5, 4.8, 12, WEISS, 2) },
    d_wegweiser: { name: "Wegweiser", der: "der Wegweiser", w: 70, h: 130, d: () => {
      const schild = (y, rechts, f, wort, tf) => (rechts
        ? P(`M-5 ${y}h31l8 8l-8 8h-31z`, f) + T(11, y + 11.6, wort, 9, tf)
        : P(`M5 ${y}h-31l-8 8l8 8h31z`, f) + T(-11, y + 11.6, wort, 9, tf));
      return E(0, -4, 16, 4, DUNKEL) + R(-3, -124, 6, 122, METALL_D, 3) + C(0, -125, 4, METALL) +
        schild(-118, true, "#ffd166", "POST", TINTE) + schild(-96, false, "#ef5350", "KINO", WEISS) +
        schild(-74, true, "#3a86ff", "WC", WEISS) + schild(-52, false, "#7cc05e", "BAD", WEISS);
    } },
    d_brunnen: { name: "Brunnen", der: "der Brunnen", w: 104, h: 100, d: () =>
      R(-9, -86, 18, 52, "#c4ccd4", 3) + R(-12, -92, 24, 8, "#aab4bf", 3) +
      S("M-4 -92l-3-3M0 -92v-3M4 -92l3-3", "#4aa34a", 1.6) + C(-7, -95, 3.5, "#ff7aa2") + C(0, -96, 3.5, "#ffd166") + C(7, -95, 3.5, "#ff7a7a") +
      R(-25, -70, 16, 4, METALL_D, 2) + R(9, -70, 16, 4, METALL_D, 2) +
      S("M-24 -67q-4 12-2 29M24 -67q4 12 2 29", "#6cc3d5", 3.6) + S("M-24.5 -64q-2.5 8-1.5 16M24.5 -64q2.5 8 1.5 16", "#c9eefa", 1.2) +
      R(-48, -36, 96, 36, "#aab4bf", 6) + S("M-36 -26h20M10 -18h24M-20 -10h14", "#9aa3ad", 1.6) +
      R(-52, -42, 104, 8, "#c4ccd4", 4) + E(0, -40.5, 44, 2.2, "#8fd6f5") +
      C(-27, -43, 1.8, "#8fd6f5") + C(-20, -44, 1.5, "#8fd6f5") + C(20, -44, 1.5, "#8fd6f5") + C(27, -43, 1.8, "#8fd6f5") },
    d_geldautomat: { name: "Geldautomat", der: "der Geldautomat", w: 56, h: 112, licht: true, d: () =>
      R(-28, -112, 56, 106, "#cbd5e0", 6) + R(-28, -112, 56, 16, "#3a86ff", 6) + R(-28, -102, 56, 6, "#3a86ff") +
      R(-11, -108, 22, 10, WEISS, 2) + C(0, -103, 3, "#3a86ff") +
      R(-20, -90, 40, 28, "#2d3748", 3) + R(-17, -87, 34, 22, "#6cc3d5", 2) + R(-13, -83, 18, 3, WEISS, 1.5) +
      R(-13, -77, 24, 3, WEISS, 1.5, `opacity="0.7"`) + R(-13, -71, 14, 3, WEISS, 1.5, `opacity="0.7"`) +
      [-56, -50, -44, -38].map((y) => [-18, -12, -6].map((x) => R(x, y, 4.5, 4.5, "#4a5568", 1)).join("")).join("") +
      R(4, -56, 13, 4.5, "#7cc05e", 1) + R(4, -50, 13, 4.5, "#ffd166", 1) + R(4, -44, 13, 4.5, "#ef5350", 1) + R(4, -37.5, 13, 3, "#1a202c", 1.5) +
      R(-10, -28, 20, 13, "#7cc05e", 1.5) + R(-7, -25, 14, 7, "#9be07a", 1) + C(0, -21.5, 2.2, "#5a9e3e") + R(-15, -30, 30, 4, "#1a202c", 2) +
      R(-28, -6, 56, 6, METALL_D, 3) },
    d_lift: { name: "Lift", der: "der Lift", w: 90, h: 130, licht: true, d: () =>
      R(-45, -130, 90, 130, "#9aa5b1", 4) + R(-34, -112, 68, 112, "#6b7280") +
      R(-33, -111, 32, 111, "#cbd5e0", 1) + R(1, -111, 32, 111, "#cbd5e0", 1) +
      S("M-26 -98l10-10M-26 -86l6-6M8 -98l10-10M8 -86l6-6", WEISS, 2.5, `opacity="0.7"`) +
      R(-16, -127, 32, 12, "#1a202c", 2) + P("M-10 -118l4-6l4 6z", "#7cff9e") + T(6, -117.5, "2", 9, "#7cff9e") +
      R(36, -72, 7, 22, "#2d3748", 2) + C(39.5, -66, 2.2, "#ffd166") + C(39.5, -56, 2.2, "#ffd166") +
      R(-36, -3, 72, 3, METALL_D, 1) },
    d_dorfplan: { name: "Dorfplan", der: "der Dorfplan", art: "wand", w: 96, h: 66, d: () => {
      const haus = (x, y, f) => R(x - 4, y - 3, 8, 6, f, 1) + P(`M${x - 5} ${y - 3}l5-5l5 5z`, shade(f, -0.3));
      const baum = (x, y) => C(x, y, 3.2, "#5cb85c");
      return R(-48, -33, 96, 66, "#4a5568", 4) + R(-44, -29, 88, 58, "#dff0c8", 2) +
        P("M16 29q4-14 28-16v16z", "#8fd6f5") +
        S("M-44 6h88M-4 -29v58M-4 6l48-30", "#fbf8f2", 5) +
        haus(-32, -18, "#ff7a7a") + haus(-18, -20, "#ffd166") + haus(-25, -6, "#a78bfa") + haus(8, -18, "#6cc3d5") + haus(22, -24, "#ff9f6b") +
        haus(-30, 18, "#7cc05e") + haus(-16, 20, "#ff7a7a") + haus(8, 18, "#ffd166") +
        baum(-40, -24) + baum(-38, 12) + baum(2, 24) + baum(30, -2) + baum(18, -4) +
        C(-4, 6, 4.5, "#ef5350") + C(-4, 6, 1.8, WEISS);
    } },
    d_fundkiste: { name: "Fundkiste", der: "die Fundkiste", w: 74, h: 64, d: () =>
      S("M20 -34v-20", DUNKEL, 2) + S("M20 -54q0-6 5-6t5 5", DUNKEL, 2.6) + P("M15 -34l5-16l5 16z", "#7c5ce6") +
      P("M-9 -34q0-16 11-16t11 16z", "#ffd166") + C(2, -51, 3.6, "#ff7a7a") + R(-10, -38, 24, 5, "#ffb347", 2) +
      P("M-27 -34v-12q0-7 7-7t7 7v12z", "#3a86ff") + E(-28, -42, 3, 5, "#3a86ff") + R(-27, -38, 14, 4, "#2f6fd6", 1.5) +
      P("M-30 -36l-6 -9h16l4 9z", "#c98d55") + P("M30 -36l6 -9h-16l-4 9z", "#c98d55") +
      R(-30, -36, 60, 36, "#d9a066", 3) + R(-30, -36, 60, 4, "#c98d55") + T(0, -8, "?", 24, "#a86a30") +
      R(6, -38, 8, 24, "#7cc05e", 2) + R(6, -30, 8, 3, WEISS) + R(6, -22, 8, 3, WEISS) + S("M7 -14v3M10 -14v3M13 -14v3", "#7cc05e", 1.2) },
    d_stuhlreihe: { name: "Stuhlreihe", der: "die Stuhlreihe", w: 112, h: 60, farbe: "#3a86ff", tags: ["sitz", "stuhl"], d: (c) =>
      leg(-46, 24, METALL_D, 4) + leg(42, 24, METALL_D, 4) + R(-52, -3, 14, 3, METALL_D, 1.5) + R(38, -3, 14, 3, METALL_D, 1.5) +
      R(-54, -27, 108, 4, METALL_D, 2) +
      [-36, 0, 36].map((x) => R(x - 15, -60, 30, 30, shade(c, -0.14), 8) + R(x - 11, -55, 22, 4, shade(c, 0.15), 2) + R(x - 17, -35, 34, 9, c, 4)).join("") },
    d_abfallkuebel: { name: "Abfallkübel", der: "der Abfallkübel", w: 38, h: 56, farbe: "#7cc05e", d: (c) =>
      R(-15, -44, 30, 41, c, 4) + S("M-8 -40v33M0 -40v33M8 -40v33", shade(c, -0.15), 2) +
      P("M-18 -43q0-13 18-13t18 13z", shade(c, -0.22)) + R(-9, -51, 18, 4.5, "#2d3748", 2.2) + R(-19, -46, 38, 5, shade(c, -0.32), 2.5) +
      R(-14, -4, 28, 4, DUNKEL, 2) },
    d_schirmstaender: { name: "Schirmständer", der: "der Schirmständer", w: 40, h: 68, d: () => {
      const schirm = (x, oben, f, griff, links) => P(`M${x - 5} -30L${x} ${oben + 8}L${x + 5} -30Z`, f) + S(`M${x} ${oben + 10}v-8`, DUNKEL, 2) +
        S(links ? `M${x} ${oben + 2}q0-6 -5-6t-5 5` : `M${x} ${oben + 2}q0-6 5-6t5 5`, griff, 2.8);
      return schirm(-7, -56, "#ef5350", "#8a5734", true) + schirm(8, -62, "#3a86ff", DUNKEL, false) + schirm(1, -50, "#ffd166", "#ef5350", false) +
        R(-15, -34, 30, 34, "#6b7280", 4) + R(-17, -36, 34, 5, "#4a5568", 2.5) + R(-15, -22, 30, 3, "#9aa5b1") + R(-15, -12, 30, 3, "#9aa5b1");
    } },
    d_snackautomat: { name: "Snackautomat", der: "der Snackautomat", w: 64, h: 124, farbe: "#ef5350", licht: true, d: (c) => {
      const reihe = (y, i) => [-23, -12, -1].map((x, j) => {
        const f = BUNT[(i * 3 + j) % BUNT.length];
        return (i + j) % 3 === 1
          ? R(x + 1, y - 14, 7, 14, f, 3) + R(x + 2.5, y - 17, 4, 4, f, 1)
          : R(x, y - 11, 9, 11, f, 2) + R(x + 2, y - 8, 5, 3, WEISS, 1, `opacity="0.7"`);
      }).join("") + R(-26, y, 38, 2, "#9aa5b1");
      return R(-32, -124, 64, 120, c, 6) + R(-26, -116, 38, 88, "#e6f6fc", 3) + [-98, -78, -58, -38].map(reihe).join("") +
        S("M-22 -112l8-8", WEISS, 2.5, `opacity="0.6"`) +
        R(16, -116, 12, 88, shade(c, -0.18), 3) + R(18, -112, 8, 6, "#7cff9e", 1.5) +
        [-100, -94, -88].map((y) => C(20, y, 1.4, WEISS) + C(24, y, 1.4, WEISS)).join("") + R(20, -80, 4, 9, "#1a202c", 1.5) +
        R(-26, -24, 38, 12, "#2d3748", 3) + R(-23, -21, 32, 3, "#4a5568", 1.5) + leg(-28, 4, DUNKEL, 6) + leg(22, 4, DUNKEL, 6);
    } },
    d_plakatwand: { name: "Plakatwand", der: "die Plakatwand", art: "wand", w: 110, h: 70, tags: ["pinnwand"], d: () =>
      R(-55, -35, 110, 70, HOLZ_D, 4) + R(-51, -31, 102, 62, "#e9e4da", 2) +
      R(-47, -27, 30, 40, "#ffd166", 1) + P("M-45 9l13-22l13 22z", "#ef5350") + P("M-36 9l4-22l4 22z", WEISS) + R(-35, 2, 6, 7, "#2d3748", 1) +
      S("M-32 -13v-6", DUNKEL, 1) + P("M-32 -19l5 1.5l-5 1.5z", "#3a86ff") +
      R(-13, -29, 28, 36, "#a78bfa", 1) + R(-1, -21, 2.2, 18, WEISS) + R(10, -24, 2.2, 18, WEISS) + P("M-1 -21l13-3v5l-13 3z", WEISS) +
      E(-3.5, -3, 4.2, 3.2, WEISS) + E(7.5, -6, 4.2, 3.2, WEISS) +
      R(19, -27, 28, 38, "#a8d8f8", 1) + R(19, 1, 28, 10, "#9be07a") + C(33, -12, 6, "#ffd166") +
      S("M33 -23v-3M33 1v-3M22 -12h3M41 -12h3M25 -20l2 2M39 -4l2 2M41 -20l-2 2M25 -4l2-2", "#ffd166", 1.4) +
      R(-11, 12, 24, 16, WEISS, 1) + S("M-7 16h16M-7 20h12", "#9aa5b1", 1.2) + [-9, -4, 1, 6].map((x) => R(x, 28, 4, 5, WEISS, 0.5)).join("") +
      C(-32, -26, 2, "#ef5350") + C(1, -28, 2, "#3a86ff") + C(33, -26, 2, "#7cc05e") + C(1, 13, 1.6, "#ffd166") },
    d_tischglocke: { name: "Tischglocke", der: "die Tischglocke", klein: true, w: 24, h: 20, d: () =>
      R(-12, -4, 24, 4, "#2d3748", 2) + P("M-10 -4a10 9 0 0 1 20 0z", "#e8b94f") + S("M-6 -8q2-3 5-4", "#fff1b8", 1.5) +
      R(-1.2, -16, 2.4, 4, "#c9a227", 1) + C(0, -17, 2.6, "#c9a227") },
    d_prospekte: { name: "Prospekte", der: "die Prospekte", klein: true, w: 32, h: 34, d: () =>
      R(-14, -28, 9, 24, "#ffd166", 1) + P("M-13 -16l3-6l3 6z", "#7cc05e") + P("M-10 -16l3-5l2 5z", "#5cb85c") +
      R(-4, -33, 9, 29, "#6cc3d5", 1) + C(0.5, -26, 2.5, "#ffd166") + R(-3, -19, 7, 2, WEISS, 1) +
      R(6, -26, 9, 22, "#ff9fb5", 1) + P("M7 -17h7l-1.5 2.5h-4z", "#3a86ff") + S("M10.5 -17v-5", DUNKEL, 0.8) + P("M10.5 -22l3 3h-3z", WEISS) +
      R(-15, -14, 30, 10, "#e6f6fc", 1.5, `opacity="0.85"`) + R(-15, -4, 30, 4, "#cbd5e0", 1.5) },

    // --- Lebensmittelladen -----------------------------------------------------
    d_kassentheke: { name: "Kassentheke", der: "die Kassentheke", w: 132, h: 74, farbe: "#ff9f6b", flaeche: -55, fx: [-58, 6], tags: ["theke", "kasse"], d: (c) =>
      R(-65, -48, 130, 48, c, 5) + R(-60, -40, 86, 26, shade(c, 0.15), 3) + T(-17, -22, "KASSE", 11, shade(c, -0.45)) + R(30, -44, 30, 38, shade(c, -0.1), 3) +
      R(-65, -6, 130, 6, shade(c, -0.25), 3) +
      R(-66, -52, 132, 6, "#cbd5e0", 3) + R(-62, -55, 72, 5, "#2d3748", 2.5) + C(-59, -52.5, 1.6, "#9aa5b1") + C(7, -52.5, 1.6, "#9aa5b1") +
      R(16, -53, 12, 2, "#ef5350", 1) +
      R(48, -60, 4, 8, METALL_D) + R(38, -74, 24, 16, "#2d3748", 3) + R(41, -71, 18, 8, "#a8f0c6", 1.5) +
      [42, 47, 52].map((x) => R(x, -62.5, 3.5, 2.5, "#cbd5e0", 1)).join("") },
    d_tiefkuehler: { name: "Tiefkühltruhe", der: "die Tiefkühltruhe", w: 100, h: 60, tags: ["kuehlschrank", "waren"], d: () => {
      const flocke = (x, y) => S(`M${x} ${y - 6}v12M${x - 5.2} ${y - 3}l10.4 6M${x - 5.2} ${y + 3}l10.4 -6`, WEISS, 1.6);
      return R(-40, -57, 20, 10, "#ef5350", 2) + C(-30, -53, 2.5, "#ffd166") + R(-16, -59, 14, 12, "#5cb85c", 4) + C(-11, -54, 1.6, "#9be07a") + C(-7, -52, 1.6, "#9be07a") +
        E(11, -53, 8, 5.5, "#ff7aa2") + E(11, -55, 6, 2.5, "#ffb3c7") + E(29, -53, 8, 5.5, "#ffb347") + E(29, -55, 6, 2.5, "#ffd9a0") +
        P("M-48 -46l4-12h88l4 12z", "#e6f6fc", `opacity="0.4"`) + P("M-48 -46l4-12h88l4 12z", "none", `stroke="#a8ddf0" stroke-width="2"`) + S("M0 -58v12", "#a8ddf0", 1.5) +
        S("M-40 -50l6-6M18 -50l6-6", WEISS, 2, `opacity="0.8"`) +
        R(-50, -48, 100, 44, "#d4ecfa", 6) + R(-46, -36, 92, 18, "#a8d8f8", 4) + flocke(-28, -27) + flocke(0, -27) + flocke(28, -27) +
        R(-50, -49, 100, 4, WEISS, 2) + R(-48, -6, 96, 6, "#9aa5b1", 3);
    } },
    d_kuehlregal: { name: "Kühlregal", der: "das Kühlregal", w: 70, h: 126, licht: true, tags: ["kuehlschrank", "waren"], d: () => {
      const milch = (x) => P(`M${x} -86v-11l4-3l4 3v11z`, WEISS, `stroke="${RAND}" stroke-width="1"`) + R(x, -94, 8, 4, "#3a86ff");
      const becher = (x, f) => R(x, -70, 9, 8, f, 2) + R(x - 0.5, -71.5, 10, 2.5, WEISS, 1);
      const flasche = (x, f, y) => R(x, y - 16, 9, 16, f, 3) + R(x + 2.5, y - 20, 4, 5, f, 1) + R(x + 2, y - 21.5, 5, 2.5, "#2d3748", 1);
      return R(-35, -126, 70, 122, "#cbd5e0", 6) + R(-35, -126, 70, 14, "#3a86ff", 6) + R(-35, -116, 70, 4, "#3a86ff") + T(0, -115.5, "MILCH", 9, WEISS) +
        R(-30, -108, 60, 98, "#e6f6fc", 3) + [-86, -62, -38].map((y) => R(-30, y, 60, 2.5, "#cbd5e0")).join("") +
        [-27, -16, -5, 6, 17].map(milch).join("") +
        becher(-27, "#ff9fb5") + becher(-16, "#ffd166") + becher(-5, "#a78bfa") + R(7, -68, 18, 6, "#ffd166", 1.5) + R(7, -68, 18, 2, "#ffe9a8", 1) +
        P("M-27 -38v-8l14-5v13z", "#ffd166") + C(-21, -42, 1.4, "#e8b94f") + C(-17, -45, 1.2, "#e8b94f") + flasche(-8, WEISS, -38) + flasche(4, WEISS, -38) + E(19, -43, 8, 5, "#ffe08a") +
        flasche(-26, "#ff9f43", -10) + flasche(-14, "#ffd166", -10) + flasche(-2, "#a8d8f8", -10) + flasche(10, "#7cc05e", -10) +
        S("M-24 -102l8-8", WEISS, 2.5, `opacity="0.6"`) + R(31, -80, 3, 26, METALL_D, 1.5) + leg(-31, 4, DUNKEL, 6) + leg(25, 4, DUNKEL, 6);
    } },
    d_gemuesewaage: { name: "Gemüsewaage", der: "die Gemüsewaage", klein: true, w: 36, h: 34, tags: ["waage"], d: () =>
      C(-6, -22, 5, "#ef5350") + C(4, -22, 5, "#ff5c5c") + C(-1, -27, 4.5, "#ef5350") + stern(-1, -31, 2.4, "#5cb85c") + stern(4, -26.5, 2.2, "#5cb85c") + stern(-6, -26.5, 2.2, "#5cb85c") +
      P("M-17 -18h34l-4 5h-26z", "#cbd5e0") + R(-3, -14, 6, 4, "#9aa5b1") +
      R(-16, -11, 32, 11, "#e2e8f0", 3) + R(-11, -9, 22, 7, "#2d3748", 1.5) + T(0, -3.6, "1.20", 5.5, "#7cff9e") },
    d_einkaufskorb: { name: "Einkaufskorb", der: "der Einkaufskorb", klein: true, w: 38, h: 34, farbe: "#ef5350", d: (c) =>
      E(-6, -22, 3.5, 11, "#e8b06a", `transform="rotate(-25 -6 -22)"`) + R(4, -29, 8, 13, WEISS, 1.5, `stroke="${RAND}" stroke-width="1"`) + R(4, -25, 8, 5, "#3a86ff") +
      C(-11, -19, 5, "#7cc05e") + C(12, -20, 4.5, "#ff9f43") +
      S("M-13 -18q0-16 13-16t13 16", shade(c, -0.25), 2.5) +
      P("M-18 -18h36l-3 18h-30z", c) + [-12, -6, 0, 6, 12].map((x) => R(x - 1.5, -14, 3, 9, shade(c, -0.22), 1)).join("") + R(-18, -19, 36, 3, shade(c, -0.15), 1.5) },
    d_getraenke: { name: "Getränkekisten", der: "die Getränkekisten", w: 58, h: 70, farbe: "#3a86ff", tags: ["trinken", "waren"], d: (c) => {
      const kiste = (y) => R(-28, y, 56, 28, c, 3) + R(-24, y + 4, 48, 20, shade(c, 0.15), 2) + R(-18, y + 6, 12, 4, shade(c, -0.35), 2) + R(6, y + 6, 12, 4, shade(c, -0.35), 2) +
        S(`M-12 ${y + 14}v8M0 ${y + 14}v8M12 ${y + 14}v8`, shade(c, -0.15), 2);
      const flaschen = [-20, -10, 0, 10, 20].map((x, i) => R(x - 3.5, -64, 7, 10, i % 2 ? "#7cc05e" : "#a8d8f8", 2) + R(x - 1.5, -68, 3, 5, i % 2 ? "#5a9e3e" : "#6cc3d5", 1) + R(x - 2, -70, 4, 2.5, "#ef5350", 1)).join("");
      return flaschen + kiste(-56) + kiste(-28);
    } },
    d_konserven: { name: "Konserven", der: "die Konserven", klein: true, w: 36, h: 32, tags: ["essen", "waren"], d: () => {
      const dose = (x, y, f) => R(x - 5.5, y - 10, 11, 10, "#cbd5e0", 1.5) + R(x - 5.5, y - 8, 11, 6, f) + C(x, y - 5, 1.8, WEISS, `opacity="0.8"`);
      return dose(-12, 0, "#ef5350") + dose(0, 0, "#7cc05e") + dose(12, 0, "#ffd166") + dose(-6, -10.5, "#ff9f43") + dose(6, -10.5, "#ef5350") + dose(0, -21, "#7cc05e");
    } },
    d_eier: { name: "Eier", der: "die Eier", klein: true, w: 34, h: 18, tags: ["essen"], d: () =>
      P("M-16 -9l2-7h28l2 7z", "#d6cfc2") +
      [[-11, "#fbf1de"], [-4, "#e8c9a0"], [3, "#fbf1de"], [10, "#e8c9a0"]].map(([x, f]) => E(x, -9, 3.6, 4.8, f)).join("") +
      R(-17, -8, 34, 8, "#cfc6b5", 2) + S("M-7.5 -8v3M-0.5 -8v3M6.5 -8v3", "#bdb3a0", 1) },
    d_aktionsschild: { name: "Aktionsschild", der: "das Aktionsschild", art: "wand", w: 50, h: 50, d: () =>
      zacken(0, 0, 24, 18, 14, "#ef5350") + C(0, 0, 16, "#ffd166") + T(0, 7.5, "%", 22, "#ef5350") },
    d_bananen: { name: "Bananen", der: "die Bananen", klein: true, w: 36, h: 22, tags: ["fruechte", "essen"], d: () => {
      const banane = (d, f) => P(`M-14 ${-14 + d}Q0 ${-4 + d} 15 ${-17 + d}Q2 ${6 + d} -14 ${-10 + d}Z`, f) + S(`M-11 ${-11 + d}Q1 ${-3 + d} 13 ${-14.5 + d}`, shade(f, -0.12), 1) + C(15, -16.6 + d, 1.4, "#5b3a29");
      return banane(-3, "#f5c84a") + banane(0, "#ffd166") + banane(3, "#ffe08a") + R(-18, -18, 6, 11, "#8a6a34", 2.5);
    } },

    // --- Bäckerei ---------------------------------------------------------------
    d_backofen: { name: "Backofen", der: "der Backofen", w: 100, h: 122, licht: true, d: () => {
      const deck = (y) => R(-44, y, 70, 30, "#9aa5b1", 3) + R(-39, y + 5, 60, 15, "#2d1b14", 2) + R(-39, y + 5, 60, 15, "#ff9f43", 2, `opacity="0.35"`) +
        [-28, -10, 8].map((x) => E(x, y + 16, 8, 4, "#d99a55") + S(`M${x - 4} ${y + 14}l3 -1M${x} ${y + 14}l3 -1`, "#b9773a", 1)).join("") + R(-40, y + 23, 62, 3, METALL_D, 1.5);
      return R(-46, -122, 92, 8, "#9aa5b1", 3) + R(-50, -116, 100, 108, "#cbd5e0", 6) + deck(-110) + deck(-76) + deck(-42) +
        R(30, -110, 16, 98, "#4a5568", 3) + [-102, -84, -66].map((y) => C(38, y, 4, "#ffd166") + R(37.2, y - 4, 1.6, 4, "#2d3748")).join("") +
        C(38, -46, 2.5, "#7cff9e") + C(38, -38, 2.5, "#ef5350") + leg(-46, 8, DUNKEL, 6) + leg(40, 8, DUNKEL, 6);
    } },
    d_baeckertheke: { name: "Bäckertheke", der: "die Bäckertheke", w: 130, h: 78, farbe: "#d9a066", flaeche: -78, fx: [-50, 50], tags: ["theke", "brot"], d: (c) => {
      const gipfeli = (x, y) => P(`M${x - 7} ${y}q7-10 14 0q-7 3-14 0z`, "#e8a85a") + S(`M${x - 3} ${y - 4}l1.5 2.5M${x + 1} ${y - 5}l1 3`, "#b9773a", 0.9);
      const weggli = (x, y) => E(x, y - 4, 6, 4.5, "#d99a55") + S(`M${x} ${y - 8}v6`, "#b9773a", 1);
      return R(-62, -48, 124, 48, c, 5) + R(-58, -40, 54, 30, shade(c, 0.18), 3) + R(4, -40, 54, 30, shade(c, 0.18), 3) + R(-62, -6, 124, 6, shade(c, -0.25), 3) +
        aehre(-31, -14, shade(c, -0.3), -18) + aehre(-31, -14, shade(c, -0.3), 18) + aehre(31, -14, shade(c, -0.3), -18) + aehre(31, -14, shade(c, -0.3), 18) +
        P("M-60 -48l6-30h108l6 30z", "#e6f6fc") + R(-56, -64, 112, 2.5, "#cbd5e0") +
        gipfeli(-40, -64) + gipfeli(-24, -64) + brezel(-4, -71.5, 0.42, "#b9773a") + weggli(16, -64) + weggli(30, -64) + weggli(44, -64) +
        E(-38, -53, 13, 5, "#c98a45") + S("M-46 -55l4-2M-39 -56l4-2M-32 -55l4-2", "#a86a30", 1.3) + E(-10, -53, 12, 5, "#b9773a") +
        E(14, -52, 9, 4, "#e8b06a") + E(34, -52, 9, 4, "#d99a55") + C(34, -55, 1.2, WEISS) + C(30, -53, 1, WEISS) +
        P("M-60 -48l6-30h108l6 30z", "#ffffff", `opacity="0.25"`) + P("M-60 -48l6-30h108l6 30z", "none", `stroke="#a8ddf0" stroke-width="2"`) +
        R(-64, -50, 128, 4, shade(c, -0.3), 2);
    } },
    d_brotwagen: { name: "Brotwagen", der: "der Brotwagen", w: 64, h: 118, tags: ["brot"], d: () => {
      const blech = (y) => R(-28, y, 56, 3, METALL_D, 1) + [-19, -6.5, 6, 18.5].map((x) => E(x, y - 3.5, 5.6, 4, "#d99a55") + E(x - 1, y - 5, 3, 1.6, "#e8b06a")).join("");
      return R(-30, -118, 5, 108, METALL, 2) + R(25, -118, 5, 108, METALL, 2) + R(-30, -118, 60, 4, METALL_D, 2) +
        [-100, -80, -60, -40].map(blech).join("") + R(-30, -16, 60, 4, METALL_D, 2) + C(-24, -6, 6, DUNKEL) + C(24, -6, 6, DUNKEL) + C(-24, -6, 2, METALL) + C(24, -6, 2, METALL);
    } },
    d_mehlsack: { name: "Mehlsack", der: "der Mehlsack", w: 44, h: 56, d: () =>
      P("M-10 -46l-5-8h30l-5 8z", "#efe6d2") + R(-11, -48, 22, 4, "#c4a57e", 2) +
      P("M-19 0c-4-16-3-32 4-44h30c7 12 8 28 4 44z", "#f4ead5") + S("M-13 -38q13 3 26 0", "#e2d6bd", 1.5) +
      T(0, -12, "MEHL", 10, "#8a5734") + aehre(0, -22, "#d9a066") +
      E(14, -2, 8, 2, WEISS, `opacity="0.9"`) + C(21, -4, 1.4, WEISS) + C(17, -5, 1, WEISS) },
    d_teigschuessel: { name: "Teigschüssel", der: "die Teigschüssel", klein: true, w: 38, h: 30, farbe: "#6cc3d5", d: (c) =>
      S("M2 -16l10-11", HOLZ_D, 3) + E(0, -16, 14, 6.5, "#f6e2bd") + E(-3, -19, 6, 2.5, "#fff4dc") +
      P("M-18 -16h36q-1 16-18 16t-18-16z", c) + R(-19, -18, 38, 4, shade(c, -0.15), 2) + E(0, -1.5, 9, 1.5, shade(c, -0.25)) },
    d_brezel: { name: "Brezel", der: "die Brezel", klein: true, w: 34, h: 24, tags: ["brot", "essen"], d: () => brezel(0, -11.6, 0.8, "#b9773a") },
    d_grittibaenz: { name: "Grittibänz", der: "der Grittibänz", klein: true, w: 38, h: 42, tags: ["brot", "essen"], d: () => {
      const teig = "#d99a55";
      const hell = "#e8b06a";
      const rosine = "#5b3a29";
      return E(-6, -7, 4.5, 7, teig) + E(6, -7, 4.5, 7, teig) +
        E(-11, -25, 7, 3.6, teig, `transform="rotate(-35 -11 -25)"`) + E(11, -25, 7, 3.6, teig, `transform="rotate(35 11 -25)"`) +
        E(0, -19, 9, 11, teig) + E(-2, -22, 4, 6, hell, `opacity="0.6"`) +
        C(0, -34, 7.5, teig) + C(-2, -36, 3, hell, `opacity="0.6"`) +
        C(-2.6, -35, 1.2, rosine) + C(2.6, -35, 1.2, rosine) + S("M-2.5 -31.5q2.5 2 5 0", rosine, 1) +
        C(0, -22, 1.4, rosine) + C(0, -16, 1.4, rosine) +
        S("M3 -30l6 3", WEISS, 1.6) + R(9, -31, 3.4, 4, WEISS, 1);
    } },
    d_waehe: { name: "Wähe", der: "die Wähe", klein: true, w: 40, h: 16, tags: ["kuchen", "essen"], d: () =>
      E(0, -3, 19.5, 3, WEISS, `stroke="${RAND}" stroke-width="1.5"`) +
      P("M-17 -6v-4h34v4q0 3-17 3t-17-3z", "#c98a45") +
      E(0, -10, 17, 4.5, "#e8b06a") + E(0, -10, 14, 3.4, "#f6dfae") +
      [[-9, -10], [-4, -12], [2, -11], [8, -9], [-2, -8.5], [10, -11.5], [-11, -8.5], [5, -12.5]].map(([x, y]) => E(x, y, 2.4, 1.3, "#7b3f8c") + E(x - 0.6, y - 0.4, 1, 0.5, "#a86bc0")).join("") },
    d_torte: { name: "Torte", der: "die Torte", klein: true, w: 32, h: 42, farbe: "#ff9fb5", tags: ["kuchen", "essen"], d: (c) =>
      E(0, -2, 9, 2, "#cbd5e0") + R(-1.5, -9, 3, 7, "#cbd5e0") + E(0, -9.5, 15, 2.5, "#e2e8f0") +
      R(-13, -24, 26, 14, c, 3) + R(-13, -18, 26, 2.5, WEISS) + [-10, -5, 0, 5, 10].map((x) => C(x, -24, 2.4, WEISS)).join("") +
      R(-8, -34, 16, 10, shade(c, 0.25), 3) + [-5, 0, 5].map((x) => C(x, -34, 2, WEISS)).join("") +
      C(0, -37, 3, "#ef5350") + P("M-2 -40l2 1.5l2-1.5l-2 3z", "#5cb85c") },
    d_brot: { name: "Brot", der: "das Brot", klein: true, w: 38, h: 22, tags: ["brot", "essen"], d: () =>
      E(0, -1, 17, 1.6, "#a86a30", `opacity="0.35"`) + E(0, -10, 18, 10, "#c98a45") + E(-3, -13, 13, 6, "#d99a55") +
      S("M-11 -12l5-5M-3 -14l5-5M5 -13l5-5", "#a86a30", 1.8) + [[-8, -7], [2, -5], [9, -8], [-13, -6], [12, -12]].map(([x, y]) => C(x, y, 0.9, "#f6e7d0")).join("") },
    d_guetzli: { name: "Guetzli", der: "die Guetzli", klein: true, w: 26, h: 34, tags: ["essen"], d: () =>
      C(-4, -7, 6, "#e8b06a") + C(4, -11, 6, "#d99a55") + C(-2, -19, 6, "#e8b06a") +
      [[-6, -8], [-2, -5], [3, -12], [6, -9], [-4, -20], [0, -17]].map(([x, y]) => C(x, y, 1.1, "#5b3a29")).join("") +
      R(-11, -27, 22, 27, "#e6f6fc", 6, `opacity="0.35"`) + R(-11, -27, 22, 27, "none", 6, `stroke="#a8ddf0" stroke-width="1.5"`) +
      S("M-7 -22v10", WEISS, 1.6, `opacity="0.8"`) + R(-12, -30, 24, 5, "#ef5350", 2) + R(-3, -34, 6, 4, "#ef5350", 2) },
    d_baeckerschild: { name: "Bäckerschild", der: "das Bäckerschild", art: "wand", w: 64, h: 60, d: () =>
      R(-32, -28, 5, 22, DUNKEL, 2) + S("M-30 -22h54M-30 -10q22 0 36-12", DUNKEL, 2.5) + S("M24 -22q5 0 5 5", DUNKEL, 2) +
      C(-14, -17, 3, "none", `stroke="${DUNKEL}" stroke-width="1.6"`) + S("M-4 -22v20M16 -22v20", DUNKEL, 1.4) +
      brezel(6, 10, 1.15, "#e8b94f", false) },

    // --- Spielwarenladen -------------------------------------------------------
    d_spielzeugregal: { name: "Spielzeugregal", der: "das Spielzeugregal", w: 96, h: 110, farbe: "#ff9f6b", tags: ["spielzeug", "regal"], d: (c) =>
      R(-48, -110, 96, 110, c, 5) + R(-42, -104, 84, 98, shade(c, 0.6)) + R(-42, -72, 84, 5, c) + R(-42, -38, 84, 5, c) +
      spielauto(-28, -72, "#ef5350") + ente(0, -72) + baerchen(26, -72, "#c88c5c") +
      R(-38, -60, 16, 22, "#3a86ff", 2) + stern(-30, -50, 4.5, "#ffd166") + R(-20, -56, 14, 18, "#7cc05e", 2) + C(-15.5, -49, 1.6, WEISS) + C(-10.5, -44, 1.6, WEISS) +
      C(9, -47, 9, "#ff5c7a") + P("M0 -47a9 9 0 0 0 18 0z", "#ffd166") + R(22, -64, 16, 26, "#a78bfa", 2) + C(30, -55, 4, "#ffe0c2") + P("M26 -57q4-6 8 0z", "#8a5734") + R(25, -50, 10, 9, "#ff9fb5", 2) +
      R(-38, -18, 12, 12, "#ef5350", 2) + R(-25, -18, 12, 12, "#ffd166", 2) + R(-31.5, -30, 12, 12, "#6cc3d5", 2) +
      P("M0 -6l-4-9h30l-4 9z", "#3a86ff") + R(10, -32, 2, 17, HOLZ_D) + P("M13 -31l11 15h-11z", WEISS) + P("M9 -29l-9 13h9z", "#ffd166") },
    d_eisenbahn: { name: "Eisenbahn", der: "die Eisenbahn", w: 124, h: 66, tags: ["spielzeug"], d: () =>
      leg(-56, 26, HOLZ_D, 6) + leg(50, 26, HOLZ_D, 6) + R(-62, -32, 124, 8, HOLZ, 3) + R(-60, -36, 120, 5, "#7cc05e", 2.5) +
      P("M22 -35q4-24 20-26q16 2 18 26z", "#9be07a") + P("M31 -35v-7a7 7 0 0 1 14 0v7z", "#2d3748") +
      R(-55, -48, 3, 12, HOLZ_D, 1) + C(-53.5, -51, 6, "#4aa34a") +
      R(-58, -38, 116, 2, METALL_D, 1) +
      R(-42, -48, 16, 9, "#ef5350", 2) + R(-28, -56, 10, 17, "#ef5350", 2) + R(-26, -54, 6, 5, "#a8d8f8", 1) + R(-30, -58, 14, 3, "#2d3748", 1) +
      R(-40, -55, 4, 7, DUNKEL, 1) + C(-38, -59, 2.6, "#e2e8f0") + C(-42, -62, 2.2, "#e2e8f0") +
      C(-37, -38, 3, DUNKEL) + C(-30, -38, 3, DUNKEL) + C(-22, -38, 3, DUNKEL) +
      R(-16, -46, 15, 8, "#3a86ff", 2) + C(-12, -38, 3, DUNKEL) + C(-5, -38, 3, DUNKEL) +
      R(2, -46, 15, 8, "#ffd166", 2) + C(6, -38, 3, DUNKEL) + C(13, -38, 3, DUNKEL) + S("M-18 -42h2M0 -42h2", DUNKEL, 1.5) },
    d_baellekorb: { name: "Bällekorb", der: "der Bällekorb", w: 58, h: 70, tags: ["ball", "spielzeug"], d: () =>
      C(-14, -54, 9, "#ef5350") + C(4, -58, 10, "#3a86ff") + C(18, -52, 8, "#ffd166") + C(-2, -48, 7, "#7cc05e") +
      S("M-19 -58q4-4 9-3M0 -63q4-4 9-3", WEISS, 1.6, `opacity="0.7"`) +
      R(-26, -50, 52, 46, "#e2e8f0", 3) +
      C(-12, -36, 9, "#ff9f43") + C(9, -37, 10, "#a78bfa") + C(-2, -18, 10, "#6cc3d5") + C(16, -15, 8, "#ff5c7a") + C(-18, -14, 7, "#ffd166") +
      S("M-26 -50v46M-13 -50v46M0 -50v46M13 -50v46M26 -50v46M-26 -35h52M-26 -20h52", METALL, 1.8) +
      R(-28, -52, 56, 4, METALL_D, 2) + R(-28, -6, 56, 4, METALL_D, 2) + leg(-24, 2, DUNKEL, 4) + leg(20, 2, DUNKEL, 4) },
    d_puppenwagen: { name: "Puppenwagen", der: "der Puppenwagen", w: 60, h: 62, farbe: "#ff9fb5", tags: ["spielzeug"], d: (c) =>
      S("M14 -34l10-22h6", METALL_D, 3) +
      C(-4, -38, 5, "#ffe0c2") + P("M-9 -39q5-8 10 0q-5-3-10 0z", "#8a5734") + C(-5.5, -38.5, 0.8, TINTE) + C(-2.5, -38.5, 0.8, TINTE) +
      P("M-26 -34h42q0 18-21 18t-21-18z", c) + R(-27, -36, 44, 4, shade(c, -0.15), 2) +
      P("M-26 -36a17 17 0 0 1 17 -17v17z", shade(c, -0.2)) + S("M-22 -38l7 -9M-16 -36l3 -13", shade(c, -0.35), 1.2) +
      S("M-14 -18l-4 10M2 -18l4 10", METALL_D, 2) +
      C(-18, -8, 7, "none", `stroke="${DUNKEL}" stroke-width="2.5"`) + C(6, -8, 7, "none", `stroke="${DUNKEL}" stroke-width="2.5"`) + C(-18, -8, 1.6, METALL_D) + C(6, -8, 1.6, METALL_D) },
    d_teddy: { name: "Grosser Teddy", der: "der grosse Teddy", w: 66, h: 76, farbe: "#d9a066", tags: ["kuscheltier", "spielzeug"], d: (c) =>
      E(-21, -32, 7, 13, shade(c, -0.08), `transform="rotate(25 -21 -32)"`) + E(21, -32, 7, 13, shade(c, -0.08), `transform="rotate(-25 21 -32)"`) +
      E(0, -28, 20, 22, c) + E(0, -24, 12, 13, shade(c, 0.3)) +
      E(-18, -8, 10, 8, c) + E(18, -8, 10, 8, c) + E(-18, -8, 5, 4, shade(c, 0.35)) + E(18, -8, 5, 4, shade(c, 0.35)) +
      C(-13, -68, 6, c) + C(13, -68, 6, c) + C(-13, -68, 3, shade(c, 0.35)) + C(13, -68, 3, shade(c, 0.35)) +
      C(0, -56, 16, c) + E(0, -51, 7, 5, shade(c, 0.35)) + E(0, -54, 2.6, 2, TINTE) + C(-6, -60, 1.8, TINTE) + C(6, -60, 1.8, TINTE) + S("M-2 -50q2 2 4 0", TINTE, 1) +
      P("M-9 -42l9 4l-9 4z", "#ef5350") + P("M9 -42l-9 4l9 4z", "#ef5350") + C(0, -38, 2.2, "#c43c3c") },
    d_rutschauto: { name: "Rutschauto", der: "das Rutschauto", w: 60, h: 42, farbe: "#3a86ff", tags: ["spielzeug"], d: (c) =>
      R(-22, -32, 18, 10, shade(c, -0.2), 4) + S("M12 -24l5-9", DUNKEL, 2.5) + R(13, -37, 10, 3.5, DUNKEL, 1.5) +
      R(-28, -24, 56, 14, c, 7) + R(-28, -18, 56, 3, shade(c, 0.25)) + C(24, -18, 2.6, "#ffd166") +
      C(-16, -8, 8, DUNKEL) + C(-16, -8, 3, "#cbd5e0") + C(16, -8, 8, DUNKEL) + C(16, -8, 3, "#cbd5e0") },
    d_drachen: { name: "Drachen", der: "der Drachen", art: "wand", w: 44, h: 92, tags: ["spielzeug"], d: () =>
      P("M0 -44L-20 -18H0Z", "#ef5350") + P("M0 -44L20 -18H0Z", "#ffd166") + P("M-20 -18L0 18V-18Z", "#3a86ff") + P("M20 -18L0 18V-18Z", "#7cc05e") +
      S("M0 -44v62M-20 -18h40", HOLZ_D, 1.5) + S("M0 18q-8 6 0 12t-2 12", DUNKEL, 1.2) +
      [[-3, 23, "#ef5350"], [-1, 31, "#ffd166"], [-3, 38, "#3a86ff"]].map(([x, y, f]) => P(`M${x - 5} ${y - 3}l5 3l-5 3z`, f) + P(`M${x + 5} ${y - 3}l-5 3l5 3z`, f)).join("") },
    d_ballone: { name: "Ballone", der: "die Ballone", art: "decke", w: 60, h: 82, d: () =>
      S("M-15 30q2 20 15 44M15 28q-2 22-15 46M0 40v34", "#9aa5b1", 1) +
      E(-15, 15, 12, 14, "#ef5350") + E(15, 14, 12, 14, "#3a86ff") + E(0, 26, 12, 14, "#ffd166") +
      P("M-17 31l2-2l2 2z", "#ef5350") + P("M13 30l2-2l2 2z", "#3a86ff") + P("M-2 42l2-2l2 2z", "#ffd166") +
      E(-19, 9, 3, 5, WEISS, `opacity="0.6"`) + E(11, 8, 3, 5, WEISS, `opacity="0.6"`) + E(-4, 20, 3, 5, WEISS, `opacity="0.6"`) +
      P("M0 74l-6-3v6z", "#ff7aa2") + P("M0 74l6-3v6z", "#ff7aa2") + S("M0 75l-3 6M0 75l3 6", "#ff7aa2", 1.2) },
    d_kreisel: { name: "Kreisel", der: "der Kreisel", klein: true, w: 30, h: 28, tags: ["spielzeug"], d: () =>
      S("M-14 -6q-3-4 0-8M14 -6q3-4 0-8", "#9aa5b1", 1.2) +
      R(-1.5, -28, 3, 9, "#8a5734", 1.5) + P("M0 -1L-11 -13Q-11 -20 0 -20Q11 -20 11 -13Z", "#ef5350") +
      P("M-11 -13Q0 -9 11 -13L8 -10Q0 -6 -8 -10Z", "#ffd166") + P("M-6 -7Q0 -4 6 -7L4 -5Q0 -3 -4 -5Z", "#3a86ff") },
    d_roboter: { name: "Roboter", der: "der Roboter", klein: true, w: 28, h: 38, farbe: "#6cc3d5", tags: ["spielzeug"], d: (c) =>
      R(-7, -10, 5, 10, shade(c, -0.25), 1.5) + R(2, -10, 5, 10, shade(c, -0.25), 1.5) +
      R(-13, -22, 4, 10, shade(c, -0.15), 2) + R(9, -22, 4, 10, shade(c, -0.15), 2) +
      R(-9, -24, 18, 15, c, 3) + R(-5, -20, 10, 6, "#ffd166", 1.5) + C(-2, -17, 1.2, "#ef5350") + C(2, -17, 1.2, "#7cc05e") +
      R(-8, -34, 16, 10, c, 3) + C(-3.5, -29, 2.2, WEISS) + C(3.5, -29, 2.2, WEISS) + C(-3.5, -29, 1, TINTE) + C(3.5, -29, 1, TINTE) + R(-3, -26.5, 6, 1.5, DUNKEL, 0.5) +
      S("M0 -34v-2", DUNKEL, 1.2) + C(0, -36.5, 1.5, "#ef5350") },
    d_brettspiele: { name: "Brettspiele", der: "die Brettspiele", klein: true, w: 36, h: 30, tags: ["spielzeug"], d: () =>
      R(-16, -8, 32, 8, "#3a86ff", 1.5) + R(-16, -8, 32, 2, "#2f6fd6", 1) + stern(-8, -4, 2.4, "#ffd166") +
      R(-14, -15, 28, 7, "#ef5350", 1.5) + R(-14, -15, 28, 2, "#c43c3c", 1) + C(6, -11.5, 1.6, WEISS) +
      R(-12, -21, 24, 6, "#7cc05e", 1.5) + R(-12, -21, 24, 2, "#5a9e3e", 1) +
      R(2, -29, 8, 8, WEISS, 1.5, `stroke="${RAND}" stroke-width="1"`) + C(4, -27, 0.9, TINTE) + C(6, -25, 0.9, TINTE) + C(8, -23, 0.9, TINTE) },
    d_ritterburg: { name: "Ritterburg", der: "die Ritterburg", klein: true, w: 46, h: 46, tags: ["spielzeug"], d: () =>
      R(-11, -24, 22, 24, "#cbd5e0") + [-11, -4, 3].map((x) => R(x, -27, 4.5, 4, "#cbd5e0")).join("") + R(9, -27, 2, 4, "#cbd5e0") +
      P("M-5 0v-8a5 5 0 0 1 10 0v8z", "#8a5734") +
      R(-21, -32, 10, 32, "#b8c2cc", 1) + R(11, -32, 10, 32, "#b8c2cc", 1) +
      P("M-23 -32l7-10l7 10z", "#ef5350") + P("M9 -32l7-10l7 10z", "#ef5350") +
      S("M-16 -42v-2M16 -42v-2", DUNKEL, 1) + P("M-16 -44l4 1l-4 1z", "#ffd166") + P("M16 -44l4 1l-4 1z", "#3a86ff") +
      R(-17, -24, 2, 5, DUNKEL, 1) + R(15, -24, 2, 5, DUNKEL, 1) },
    d_dino: { name: "Dino", der: "der Dino", klein: true, w: 48, h: 38, farbe: "#7cc05e", tags: ["spielzeug"], d: (c) =>
      R(-12, -10, 5, 10, shade(c, -0.2), 2) + R(4, -10, 5, 10, shade(c, -0.2), 2) +
      P("M-11 -17q-8 4-13 10q8-2 14-6z", c) + S("M8 -18q5-6 6-14", c, 5) + E(17, -33, 5, 3.2, c) + C(18.5, -34, 0.9, TINTE) +
      E(-1, -14, 13, 8, c) + R(-8, -10, 5, 10, c, 2) + R(8, -10, 5, 10, c, 2) +
      C(-5, -17, 1.8, shade(c, -0.2)) + C(2, -19, 1.5, shade(c, -0.2)) + C(0, -13, 1.5, shade(c, -0.2)) },

    // --- Kleiderladen ----------------------------------------------------------
    d_umkleide: { name: "Umkleidekabine", der: "die Umkleidekabine", w: 76, h: 140, farbe: "#a78bfa", d: (c) =>
      R(-33, -133, 66, 129, "#f6ead2") + R(-37, -133, 4, 133, HOLZ_D, 2) + R(33, -133, 4, 133, HOLZ_D, 2) + R(-38, -140, 76, 8, HOLZ_D, 3) +
      R(20, -110, 2.5, 6, METALL_D, 1) + P("M14 -104l-6 4l2 5l4-2v14h14v-14l4 2l2-5l-6-4q-3 2-7 2t-7-2z", "#ffd166") +
      R(-33, -4, 66, 4, HOLZ_DD, 1) +
      P("M-28 -4v-5h6l4 3v2z", "#4a5568") + P("M-15 -4v-5h6l4 3v2z", "#4a5568") +
      R(-35, -134, 70, 3, METALL, 1.5) + P("M-33 -132h46q-3 60 2 122h-48z", c) +
      S("M-24 -130q-2 60 0 118M-12 -130q-2 60 0 118M0 -130q-2 60 2 118", shade(c, -0.15), 2) +
      [-30, -20, -10, 0, 10].map((x) => C(x, -132, 2, METALL_D)).join("") },
    d_hutstaender: { name: "Hutständer", der: "der Hutständer", w: 64, h: 104, tags: ["kleider"], d: () =>
      E(0, -4, 15, 4, DUNKEL) + R(-2.5, -86, 5, 84, HOLZ_D, 2) + S("M0 -68l-15-8M0 -48l15-8M0 -32l-12-6", HOLZ_D, 3) +
      R(-18, -40, 6, 26, "#7cc05e", 2) + R(-11, -40, 6, 20, "#5cb85c", 2) + R(-18, -32, 6, 3, WEISS) + R(-18, -24, 6, 3, WEISS) + R(-11, -30, 6, 3, WEISS) +
      S("M-17 -14v3M-14.5 -14v3M-10 -20v3M-7.5 -20v3", "#7cc05e", 1.2) + R(-19, -42, 15, 5, "#7cc05e", 2.5) +
      P("M-24 -75q0-13 11-13t11 13z", "#3a86ff") + E(-25, -75, 6, 2.2, "#2f6fd6") + C(-13, -88, 1.8, "#2f6fd6") + S("M-13 -87v11", "#2f6fd6", 1) +
      P("M5 -55q0-14 11-14t11 14z", "#ff7aa2") + R(4, -58, 24, 6, "#e85d8c", 3) + S("M9 -64v6M14 -66v8M19 -66v8M24 -64v6", "#e85d8c", 1) + C(16, -71, 4.5, WEISS, `stroke="${RAND}" stroke-width="1"`) +
      E(0, -88, 22, 5, "#f2d38a") + P("M-11 -90q0-14 11-14t11 14z", "#f2d38a") + R(-11, -93, 22, 4, "#ef5350", 1.5) + E(0, -88, 22, 5, "none", `stroke="#d9b25e" stroke-width="1"`) },
    d_kleidertisch: { name: "Kleidertisch", der: "der Kleidertisch", w: 104, h: 60, farbe: "#c88c5c", flaeche: -40, fx: [-2, 20], tags: ["kleider", "tisch"], d: (c) => {
      const stapel = (x, w, farben) => farben.map((f, i) => R(x, -46 - i * 6, w, 6, f, 2) + S(`M${x + 3} ${-43 - i * 6}h${w - 6}`, shade(f, -0.18), 1)).join("");
      return leg(-48, 34, shade(c, -0.25), 6) + leg(42, 34, shade(c, -0.25), 6) + R(-46, -14, 92, 4, shade(c, -0.15), 2) +
        R(-40, -24, 22, 10, "#e2c9a6", 1.5) + R(18, -24, 22, 10, "#ff9fb5", 1.5) +
        R(-52, -40, 104, 7, c, 3) + R(-50, -33, 100, 3, shade(c, -0.2)) +
        stapel(-48, 22, ["#ef5350", "#ff9fb5", "#ef5350"]) + stapel(-24, 20, ["#3a86ff", "#2f6fd6", "#4f8ef7"]) + stapel(24, 24, ["#7cc05e", "#ffd166", "#a78bfa"]);
    } },
    d_schuhwand: { name: "Schuhwand", der: "die Schuhwand", art: "wand", w: 92, h: 76, tags: ["schuhe"], d: () =>
      R(-46, -38, 92, 76, "#f6ead2", 4) + [-14, 10, 34].map((y) => R(-44, y, 88, 4, HOLZ_D, 2)).join("") +
      turnschuh(-40, -14, "#ef5350") + turnschuh(-12, -14, "#3a86ff") + turnschuh(16, -14, "#7cc05e") +
      stiefel(-40, 10, "#8a5734") + stiefel(-30, 10, "#8a5734") + ballerina(-4, 10, "#ff7aa2") + ballerina(18, 10, "#a78bfa") +
      stiefel(-38, 34, "#ffd166") + stiefel(-26, 34, "#ffd166") + turnschuh(0, 34, "#ff9f6b") + ballerina(22, 34, "#6cc3d5") },
    d_standspiegel: { name: "Standspiegel", der: "der Standspiegel", w: 48, h: 128, farbe: "#ffd166", tags: ["spiegel"], d: (c) =>
      S("M-16 0l8-14M16 0l-8-14", shade(c, -0.25), 4) + R(-3, -18, 6, 8, shade(c, -0.25), 2) +
      R(-21, -128, 42, 112, c, 21) + R(-17, -124, 34, 104, "#e6f6fc", 17) + S("M-9 -104l12-12M-8 -90l12-12", WEISS, 3, `opacity="0.8"`) },
    d_kleiderbuegel: { name: "Kleiderbügel", der: "die Kleiderbügel", art: "wand", w: 96, h: 72, tags: ["kleider"], d: () => {
      const buegel = (x) => S(`M${x} -30v-3q0-3 3-3`, METALL_D, 1.4) + S(`M${x - 11} -22l11-8l11 8`, METALL_D, 1.6);
      return R(-46, -34, 92, 4, METALL, 2) + R(-44, -36, 4, 8, METALL_D, 1) + R(40, -36, 4, 8, METALL_D, 1) +
        buegel(-28) + P("M-36 -23h16l3 12l9 34h-40l9-34z", "#ff7aa2") + R(-36, -12, 16, 3, "#e85d8c") +
        buegel(0) + P("M-11 -23h22l2 54h-10l-3-38l-3 38h-10z", "#3a86ff") + S("M-11 -18h22", "#2f6fd6", 1.2) +
        buegel(28) + P("M19 -23l-10 6l4 7l6-3v24h18v-24l6 3l4-7l-10-6q-3 3-9 3t-9-3z", "#ffd166") + C(28, -8, 2.6, "#ef5350");
    } },
    d_socken: { name: "Socken", der: "die Socken", w: 56, h: 52, tags: ["kleider"], d: () =>
      socke(-6, -20, "#ef5350", WEISS, 195) + socke(19, -20, "#3a86ff", "#ffd166", 160) +
      P("M-24 -24h48l-4 24h-40z", "#e2c9a6") + S("M-22 -16h44M-21 -8h42", "#c4a57e", 2) + R(-26, -27, 52, 5, "#c4a57e", 2.5) +
      socke(-14, -27, "#7cc05e", "#ffd166", 0) },
    d_sonnenbrillen: { name: "Sonnenbrillen", der: "die Sonnenbrillen", klein: true, w: 30, h: 40, d: () => {
      const brille = (y, f) => R(-13, y - 1, 11, 8, f, 3.5) + R(2, y - 1, 11, 8, f, 3.5) + R(-12, y, 9, 6, "#2d3748", 3) + R(3, y, 9, 6, "#2d3748", 3) +
        R(-3, y + 1, 6, 2, f, 1) + S(`M-10 ${y + 2.5}l2 -1.5M5 ${y + 2.5}l2 -1.5`, WEISS, 1, `opacity="0.7"`);
      return E(0, -2, 9, 2.5, DUNKEL) + R(-1.5, -38, 3, 36, METALL_D, 1.5) + C(0, -38, 2.2, METALL_D) + brille(-34, "#ef5350") + brille(-24, "#3a86ff") + brille(-14, "#ffd166");
    } },
    d_tragtaschen: { name: "Tragtaschen", der: "die Tragtaschen", klein: true, w: 36, h: 34, farbe: "#ff7aa2", d: (c) =>
      S("M0 -26q0-8 5-8t5 8", "#8a5734", 1.4) + R(-4, -26, 20, 26, "#ffd166", 1.5) + R(-4, -26, 20, 3, "#f5b82e") +
      S("M-12 -18q0-8 5-8t5 8", DUNKEL, 1.4) + P("M-14 -18l3-7l3 5l3-6l2 8z", "#a8d8f8") +
      R(-17, -18, 20, 18, c, 1.5) + R(-17, -18, 20, 3, shade(c, -0.15)) + C(-7, -8, 3.2, WEISS, `opacity="0.85"`) },
    d_turnschuhe: { name: "Turnschuhe", der: "die Turnschuhe", klein: true, w: 38, h: 16, farbe: "#3a86ff", d: (c) => {
      const schuh = (dx, dy, f) => P(`M${-17 + dx} ${dy}v-8q0-3 3-3h7l4 4h9q5 0 6 5v2z`, f) + R(-17 + dx, dy - 2.5, 29, 2.5, WEISS, 1.2) +
        P(`M${4 + dx} ${dy - 2.5}q1-4 5-4.5q3 0.5 3 4.5z`, WEISS) + R(-17 + dx, dy - 10, 3, 7, shade(f, -0.3), 1.2) +
        S(`M${-9 + dx} ${dy - 9}l3 2M${-6 + dx} ${dy - 10}l3 2`, WEISS, 1.2);
      return schuh(5, -2, shade(c, -0.2)) + schuh(0, 0, c);
    } },

    // --- Blumenladen -----------------------------------------------------------
    d_blumenwagen: { name: "Blumenwagen", der: "der Blumenwagen", w: 116, h: 90, tags: ["blumen", "pflanze"], d: () => {
      const eimer = (x) => P(`M${x - 9} -46h18l-2 16h-14z`, METALL) + R(x - 10, -48, 20, 4, METALL_D, 2);
      const tulpe = (x, y, f) => P(`M${x - 4.5} ${y - 4}v-6l2.25 3l2.25-4l2.25 4l2.25-3v6q0 4-4.5 4t-4.5-4z`, f);
      const tulpen = (x) => S(`M${x - 4} -46l-3-24M${x} -46v-28M${x + 4} -46l3-22`, "#4aa34a", 2) + tulpe(x - 7, -68, "#ef5350") + tulpe(x, -72, "#ff5c7a") + tulpe(x + 7, -66, "#ef5350");
      const sonne = (x, y) => zacken(x, y, 8, 5, 10, "#ffd166") + C(x, y, 3.6, "#8a5734");
      const sonnenblumen = (x) => S(`M${x - 4} -46l-3-32M${x + 4} -46l3-26`, "#4aa34a", 2.2) + sonne(x - 7, -80) + sonne(x + 7, -74);
      const rosen = (x) => S(`M${x - 5} -46l-2-20M${x} -46v-24M${x + 5} -46l2-18`, "#3f8f3f", 2) +
        [[-7, -66], [0, -71], [7, -64]].map(([dx, y]) => C(x + dx, y, 4.2, "#e8455e") + S(`M${x + dx - 2} ${y}q2-3 4 0`, "#b8304a", 1.1)).join("");
      const lavendel = (x) => [-6, -2, 2, 6].map((dx, i) => S(`M${x + dx * 0.3} -46L${x + dx} ${-64 - (i % 2) * 4}`, "#5a9e3e", 1.4) + E(x + dx, -68 - (i % 2) * 4, 2, 6, "#a78bfa")).join("");
      const rad = (x) => C(x, -15, 12.5, "none", `stroke="${HOLZ_DD}" stroke-width="4"`) + S(`M${x - 12} -15h24M${x} -27v24M${x - 8.5} -23.5l17 17M${x + 8.5} -23.5l-17 17`, HOLZ_D, 1.6) + C(x, -15, 3, HOLZ_DD);
      return tulpen(-42) + sonnenblumen(-20) + rosen(2) + lavendel(24) + eimer(-42) + eimer(-20) + eimer(2) + eimer(24) +
        R(-56, -30, 100, 12, HOLZ, 3) + S("M-52 -24h92", HOLZ_D, 1.2) + R(40, -24, 4, 24, HOLZ_D, 2) + S("M42 -28l14-8", HOLZ_D, 4) + rad(-34) + rad(16);
    } },
    d_blumenkuehler: { name: "Blumenkühlschrank", der: "der Blumenkühlschrank", w: 70, h: 126, licht: true, tags: ["blumen"], d: () => {
      const eimer = (x, y) => P(`M${x - 7} ${y - 12}h14l-2 12h-10z`, METALL) + R(x - 7.5, y - 13, 15, 3, METALL_D, 1.5);
      const strauss = (x, y, f) => S(`M${x - 3} ${y - 12}l-2-14M${x} ${y - 12}v-16M${x + 3} ${y - 12}l2-14`, "#4aa34a", 1.6) +
        C(x - 5, y - 27, 3.6, f) + C(x + 5, y - 27, 3.6, f) + C(x, y - 30, 3.6, f) + C(x, y - 30, 1.3, shade(f, -0.3));
      const blume = [0, 72, 144, 216, 288].map((a) => C(+(Math.cos((a * Math.PI) / 180) * 3.4).toFixed(1), +(-119 + Math.sin((a * Math.PI) / 180) * 3.4).toFixed(1), 2.3, WEISS)).join("") + C(0, -119, 2, "#ffd166");
      return R(-35, -126, 70, 122, "#cbd5e0", 6) + R(-35, -126, 70, 14, "#5cb85c", 6) + R(-35, -116, 70, 4, "#5cb85c") + blume +
        R(-30, -108, 60, 98, "#e6f6fc", 3) +
        strauss(-18, -60, "#ef5350") + eimer(-18, -60) + strauss(0, -60, "#ffd166") + eimer(0, -60) + strauss(18, -60, "#ff7aa2") + eimer(18, -60) + R(-30, -60, 60, 2.5, "#cbd5e0") +
        strauss(-18, -12, "#a78bfa") + eimer(-18, -12) + strauss(0, -12, "#ff9f6b") + eimer(0, -12) + strauss(18, -12, WEISS) + eimer(18, -12) +
        S("M-24 -102l8-8", WEISS, 2.5, `opacity="0.6"`) + R(31, -80, 3, 26, METALL_D, 1.5) + leg(-31, 4, DUNKEL, 6) + leg(25, 4, DUNKEL, 6);
    } },
    d_bindetisch: { name: "Bindetisch", der: "der Bindetisch", w: 104, h: 74, farbe: "#c88c5c", flaeche: -46, fx: [-14, 12], tags: ["tisch", "blumen"], d: (c) =>
      leg(-46, 39, shade(c, -0.25), 6) + leg(40, 39, shade(c, -0.25), 6) + R(-44, -16, 88, 4, shade(c, -0.15), 2) +
      R(-36, -27, 28, 11, "#ffb3c7") + E(-36, -21.5, 3, 5.5, "#ff9fb5") + E(-8, -21.5, 3, 5.5, "#ffd6e2") + E(-8, -21.5, 1.2, 2.2, "#e88aa6") +
      S("M12 -28l-2-6M16 -28v-8M20 -28l3-6", "#4aa34a", 2) + E(9, -35, 3, 5, "#5cb85c", `transform="rotate(-30 9 -35)"`) + E(23, -35, 3, 5, "#5cb85c", `transform="rotate(30 23 -35)"`) +
      P("M8 -28h16l-2 12h-12z", METALL) + R(7, -29, 18, 3, METALL_D, 1.5) +
      R(-52, -46, 104, 7, c, 3) + R(-50, -39, 100, 3, shade(c, -0.2)) +
      S("M-50 -49h12", "#4aa34a", 2) + P("M-42 -48l16-8v13z", "#fff1b8") + C(-24, -55, 4, "#ef5350") + C(-21, -49, 4, "#ffd166") + C(-27, -51, 3.6, "#ff7aa2") +
      S("M-40 -49l14 2", "#ef5350", 1.4) +
      R(18, -74, 4, 28, DUNKEL, 1.5) + R(46, -74, 4, 28, DUNKEL, 1.5) + R(18, -66, 32, 2.5, DUNKEL, 1) +
      [[25, "#ef5350"], [34, "#ffd166"], [43, "#a78bfa"]].map(([x, f]) => R(x - 3.5, -72, 7, 14, f, 2) + R(x - 4, -72, 8, 2, shade(f, -0.25), 1) + R(x - 4, -60, 8, 2, shade(f, -0.25), 1) +
        S(`M${x} -58q3 5 -1 11`, f, 2)).join("") },
    d_samentueten: { name: "Samentüten", der: "die Samentüten", klein: true, w: 32, h: 28, d: () =>
      R(-15, -23, 12, 17, "#7cc05e", 1.5) + R(-13.5, -21, 9, 9, WEISS, 1) + zacken(-9, -16.5, 3.6, 2.4, 8, "#ffd166") + C(-9, -16.5, 1.4, "#8a5734") +
      R(-6, -27, 12, 19, "#ff9f6b", 1.5) + R(-4.5, -25, 9, 9, WEISS, 1) + P("M-2 -22h4l-2 6z", "#ff8c2a") + S("M0 -22l-1.5-2M0 -22l1.5-2", "#5cb85c", 1) +
      R(3, -23, 12, 17, "#a78bfa", 1.5) + R(4.5, -21, 9, 9, WEISS, 1) + P("M6.5 -17v-3l1.25 1.5l1.25-2l1.25 2l1.25-1.5v3q0 2-2.5 2t-2.5-2z", "#ef5350") + S("M9 -15v3", "#5cb85c", 1) +
      R(-16, -8, 32, 8, HOLZ, 2) + R(-16, -8, 32, 2, HOLZ_D, 1) },
    d_giesskanne: { name: "Giesskanne", der: "die Giesskanne", klein: true, w: 40, h: 28, farbe: "#9aa5b1", d: (c) =>
      S("M-7 -20q7-9 14 0", shade(c, -0.25), 2.4) + S("M8 -6l7-10", c, 3.2) + E(15.6, -17.4, 2.4, 3.6, shade(c, -0.2), `transform="rotate(37 15.6 -17.4)"`) +
      R(-10, -20, 20, 20, c, 4) + R(-10, -15, 20, 3, shade(c, 0.2)) + S("M-10 -17q-7 0-7 6t7 6", shade(c, -0.25), 2.4) },
    d_kranz: { name: "Kranz", der: "der Kranz", art: "wand", w: 52, h: 56, tags: ["blumen"], d: () => {
      let s = C(0, -2, 17, "none", `stroke="#3f8f3f" stroke-width="10"`);
      for (let i = 0; i < 16; i += 1) {
        const a = (i / 16) * Math.PI * 2;
        const x = +(Math.cos(a) * 17).toFixed(1);
        const y = +(-2 + Math.sin(a) * 17).toFixed(1);
        s += E(x, y, 5, 2.6, i % 2 ? "#5cb85c" : "#6cc76a", `transform="rotate(${((a * 180) / Math.PI + 60).toFixed(0)} ${x} ${y})"`);
      }
      s += [[-12, -13], [10, -15], [17, 3], [-17, 2], [-4, -19]].map(([x, y]) => C(x, y, 2.4, "#ff7aa2") + C(x, y, 1, "#ffd166")).join("");
      s += [[14, -9], [-15, -7], [6, -18], [-9, 11]].map(([x, y]) => C(x, y, 1.8, "#ef5350")).join("");
      return s + P("M0 15l-9-5v10z", "#ef5350") + P("M0 15l9-5v10z", "#ef5350") + C(0, 15, 2.4, "#c43c3c") + S("M-1 17l-5 9M1 17l5 9", "#ef5350", 2.4);
    } },
    d_sonnenblume: { name: "Sonnenblume", der: "die Sonnenblume", w: 50, h: 122, tags: ["blumen", "pflanze"], d: () => {
      let blatt = "";
      for (let i = 0; i < 14; i += 1) blatt += E(0, -113, 4, 7, i % 2 ? "#ffd166" : "#f5b82e", `transform="rotate(${((i * 360) / 14).toFixed(1)} 0 -100)"`);
      return R(-2.5, -96, 5, 70, "#4aa34a", 2) +
        P("M0 -52c-6-10-18-12-24-6c8 8 18 8 24 6z", "#5cb85c") + P("M0 -70c6-10 18-12 24-6c-8 8-18 8-24 6z", "#4aa34a") +
        topf(26, 24, "#d9734e") + blatt + C(0, -100, 9, "#8a5734") +
        [[-3, -103], [3, -103], [0, -99], [-4, -97], [4, -97], [0, -104]].map(([x, y]) => C(x, y, 1, "#5b3a29")).join("");
    } },
    d_tulpen: { name: "Tulpen", der: "die Tulpen", klein: true, w: 28, h: 40, farbe: "#ef5350", tags: ["blumen", "pflanze"], d: (c) => {
      const kopf = (x, y) => P(`M${x - 4.5} ${y - 4}v-6l2.25 3l2.25-4l2.25 4l2.25-3v6q0 4-4.5 4t-4.5-4z`, c);
      return S("M-6 -12l-2-12M0 -12v-16M6 -12l2-11", "#4aa34a", 2) + P("M-2 -12q-10-6-8-16q6 6 8 16z", "#5cb85c") + P("M2 -12q10-6 8-16q-6 6-8 16z", "#5cb85c") +
        kopf(-8, -24) + kopf(0, -28) + kopf(8, -23) + topf(16, 12, "#6cc3d5");
    } },
    d_gartenzwerg: { name: "Gartenzwerg", der: "der Gartenzwerg", klein: true, w: 26, h: 40, d: () =>
      E(-4, -2, 4.2, 2.4, "#5b3a29") + E(4, -2, 4.2, 2.4, "#5b3a29") +
      E(-8, -13, 2.6, 4.5, "#3a86ff") + E(8, -13, 2.6, 4.5, "#3a86ff") + C(-8.5, -9, 2, "#ffd9b8") + C(8.5, -9, 2, "#ffd9b8") +
      P("M-8 -3q-1-12 2-16h12q3 4 2 16z", "#3a86ff") + R(-8, -10, 16, 2.6, "#5b3a29") + R(-1.5, -10.5, 3, 3.6, "#ffd166", 0.5) +
      C(0, -22, 5, "#ffd9b8") + P("M-6 -21q6 14 12 0q-6 3-12 0z", WEISS) + C(0, -21.5, 1.6, "#ff9f9f") + C(-2, -24, 0.8, TINTE) + C(2, -24, 0.8, TINTE) +
      P("M-7 -25q3-4 6-14q2-1 3 0q1 8 5 14z", "#ef5350") },
    d_blumenkasten: { name: "Blumenkasten", der: "der Blumenkasten", art: "wand", w: 84, h: 44, tags: ["blumen", "pflanze"], d: () => {
      const bluete = (x, y) => [[0, -3], [-3, 0], [3, 0], [-1.5, 3], [1.5, 3], [0, 0]].map(([dx, dy], i) => C(x + dx, y + dy, 2.6, i % 2 ? "#ef5350" : "#ff5c5c")).join("");
      return [-32, -20, -8, 4, 16, 28].map((x, i) => C(x, 2 - (i % 2) * 3, 6, i % 2 ? "#4aa34a" : "#5cb85c")).join("") +
        S("M-26 0v-8M-6 0v-10M14 0v-8M30 0v-6", "#3f8f3f", 1.4) +
        bluete(-26, -12) + bluete(-6, -14) + bluete(14, -12) + bluete(30, -9) +
        R(-40, 4, 80, 16, HOLZ, 3) + S("M-38 9h76M-38 14h76", HOLZ_D, 1) +
        E(-30, 8, 5, 3, "#5cb85c") + E(22, 9, 5, 3, "#4aa34a") + E(-33, 13, 3, 2, "#4aa34a");
    } },

    // --- Coiffeur ---------------------------------------------------------------
    d_waschstuhl: { name: "Haarwaschbecken", der: "das Haarwaschbecken", w: 96, h: 74, farbe: "#5bb39a", tags: ["lavabo", "coiffeur"], d: (c) =>
      R(-36, -48, 14, 48, "#e2e8f0", 3) + R(-40, -4, 22, 4, "#cbd5e0", 2) + S("M-34 -62v-8h8", METALL, 3) + R(-28, -72, 6, 4, METALL_D, 1.5) +
      P("M-46 -62h32q-2 16-16 16t-16-16z", WEISS, `stroke="${RAND}" stroke-width="2"`) + S("M-40 -58q10 4 20 0", "#a8d8f8", 2, `opacity="0.8"`) +
      R(6, -30, 14, 26, METALL_D, 3) + R(-6, -6, 40, 6, DUNKEL, 3) +
      S("M-6 -38L-18 -58", shade(c, -0.12), 12) + E(-19, -60, 6, 3.2, shade(c, 0.3), `transform="rotate(-60 -19 -60)"`) +
      R(-12, -42, 50, 12, c, 5) + R(-8, -40, 42, 3, shade(c, 0.25), 1.5) + S("M34 -36L43 -20", shade(c, -0.12), 9) },
    d_autostuhl: { name: "Autostuhl", der: "der Autostuhl", w: 80, h: 70, farbe: "#ef5350", tags: ["coiffeur", "sitz"], d: (c) =>
      E(0, -4, 22, 4, METALL_D) + R(-4, -24, 8, 21, METALL, 2) + R(-12, -16, 24, 3, METALL_D, 1.5) +
      R(-30, -66, 14, 24, shade(c, -0.15), 5) + S("M18 -46l6-12", DUNKEL, 2.4) + E(25, -59, 2.2, 6.5, DUNKEL, `transform="rotate(20 25 -59)"`) +
      R(-38, -48, 76, 22, c, 10) + R(-38, -40, 76, 3, shade(c, 0.25)) + C(34, -40, 3, "#ffd166") + R(-40, -32, 8, 4, shade(c, -0.3), 2) +
      C(-22, -24, 7, DUNKEL) + C(-22, -24, 2.8, "#cbd5e0") + C(22, -24, 7, DUNKEL) + C(22, -24, 2.8, "#cbd5e0") },
    d_rollwagen: { name: "Rollwagen", der: "der Rollwagen", w: 48, h: 72, farbe: "#7c5ce6", flaeche: -66, fx: [-18, 18], d: (c) =>
      R(-21, -66, 4, 58, shade(c, -0.25), 2) + R(17, -66, 4, 58, shade(c, -0.25), 2) +
      [-14, -7, 0, 7, 14].map((x, i) => R(x - 3, -50, 6, 8, ["#ff7aa2", "#ffd166", "#6cc3d5", "#7cc05e", "#ff9f6b"][i], 2.5)).join("") +
      R(-16, -32, 6, 14, "#6cc3d5", 2) + R(-15, -35, 4, 3, WEISS, 1) + R(-7, -30, 7, 12, "#ffd166", 2) +
      R(4, -26, 15, 7, "#2d3748", 3.5) + S("M6 -27v-2M9 -27v-2M12 -27v-2M15 -27v-2M6 -18v2M9 -18v2M12 -18v2M15 -18v2", "#2d3748", 1) +
      R(-23, -66, 46, 5, c, 2.5) + R(-23, -42, 46, 5, c, 2.5) + R(-23, -18, 46, 5, c, 2.5) +
      C(-17, -5, 4.5, DUNKEL) + C(17, -5, 4.5, DUNKEL) },
    d_frisuren: { name: "Frisuren-Poster", der: "das Frisuren-Poster", art: "wand", w: 60, h: 76, tags: ["bild"], d: () =>
      R(-30, -38, 60, 76, "#fbf8f2", 3, `stroke="${RAND}" stroke-width="1.5"`) +
      [[-21, -26], [-15, -30], [-9, -26], [-22, -19], [-8, -19]].map(([x, y]) => C(x, y, 5, "#3b2a20")).join("") + gesicht(-15, -19, "#a8754f") +
      P("M6 -22q0-12 9-12t9 12v16h-4v-10h-10v10h-4z", "#e8b94f") + gesicht(15, -19, "#ffe0c2") + P("M8 -24q7-8 14 0q-7-3-14 0z", "#e8b94f") +
      P("M-24 18v-6q0-12 9-12t9 12v6h-3v-6h-12v6z", "#c0503a") + gesicht(-15, 15, "#f2c9a0") + P("M-22 10q7-8 14 0z", "#c0503a") +
      gesicht(15, 15, "#e0ac7e") + P("M8 11l1-9l3 5l3-8l3 8l3-5l1 9q-7-3-14 0z", "#3a86ff") },
    d_foehn: { name: "Föhn", der: "der Föhn", klein: true, w: 42, h: 30, farbe: "#ff7aa2", d: (c) =>
      R(-11, -18, 8, 18, shade(c, -0.15), 3) + C(-7, -7, 1.4, WEISS) +
      R(-17, -30, 24, 13, c, 6.5) + C(-16, -23.5, 5, shade(c, -0.2)) + S("M-18 -26v5M-15 -27v7", shade(c, 0.3), 1.2) +
      R(7, -28.5, 5, 10, shade(c, -0.3), 2) + S("M14 -26.5h4M14 -23.5h6M14 -20.5h4", "#6cc3d5", 1.4) },
    d_schere: { name: "Schere und Kamm", der: "die Schere und der Kamm", klein: true, w: 22, h: 38, d: () =>
      R(2, -36, 3, 22, "#2d3748", 1) + [-35, -32, -29, -26, -23, -20].map((y) => R(5, y, 4, 1.4, "#2d3748", 0.5)).join("") +
      S("M-6 -29l4 14M-1 -29l-4 14", METALL, 2) + C(-6.5, -32, 3.2, "none", `stroke="#ef5350" stroke-width="2"`) + C(-0.5, -32, 3.2, "none", `stroke="#ef5350" stroke-width="2"`) +
      R(-9, -16, 18, 16, "#6cc3d5", 3) + R(-10, -17, 20, 3, shade("#6cc3d5", -0.18), 1.5) },
    d_haarspray: { name: "Haarspray", der: "der Haarspray", klein: true, w: 18, h: 34, d: () =>
      R(-6, -24, 12, 24, "#a78bfa", 3) + R(-6, -16, 12, 6, WEISS, 0, `opacity="0.85"`) + R(-5, -30, 10, 6, "#cbd5e0", 2) + R(-1, -32.5, 4, 3, DUNKEL, 1) +
      C(6, -33, 1, "#a8d8f8") + C(8, -31, 0.9, "#a8d8f8") + C(5, -30, 0.8, "#a8d8f8") },
    d_besen: { name: "Besen", der: "der Besen", w: 50, h: 96, d: () =>
      R(-11, -96, 4, 70, HOLZ, 2) + R(-17, -30, 16, 6, "#ef5350", 2) + P("M-21 0l3-26h18l3 26z", "#e8c26e") + S("M-15 -4l1-18M-9 -4v-18M-3 -4l-1-18", "#c9a14c", 1.2) +
      S("M4 -2q2-4 5-1t5-1t5 1t4 0", "#8a5734", 1.6) + S("M6 -5q3-4 6-1t6 0t5 0", "#e8b94f", 1.6) + S("M9 -8q3-3 5 0t5 0", "#3b2a20", 1.6) },
    d_shampoo: { name: "Shampoo", der: "das Shampoo", klein: true, w: 30, h: 34, d: () =>
      R(-13, -24, 11, 24, "#6cc3d5", 3) + R(-11, -27, 7, 4, WEISS, 1) + R(-9, -31, 3, 5, WEISS, 1) + R(-9, -31, 7, 2, WEISS, 1) + R(-13, -15, 11, 6, WEISS, 1, `opacity="0.8"`) +
      R(1, -20, 12, 20, "#ff9fb5", 5) + R(3, -23, 8, 4, "#ef5350", 2) + C(7, -10, 3, WEISS, `opacity="0.8"`) +
      C(-1, -29, 2, "none", `stroke="#a8d8f8" stroke-width="1"`) + C(4, -31, 1.4, "none", `stroke="#a8d8f8" stroke-width="1"`) },
    d_lutscher: { name: "Lutscher", der: "die Lutscher", klein: true, w: 26, h: 38, d: () =>
      S("M-5 -16l-3-14M0 -16v-17M5 -16l3-13", "#cbd5e0", 1.8) +
      C(-8, -31, 4.5, "#ef5350") + C(0, -34, 4.5, "#ffd166") + C(8, -30, 4.5, "#7cc05e") +
      S("M-8 -31m-2 0a2 2 0 1 1 3 1.5M0 -34m-2 0a2 2 0 1 1 3 1.5M8 -30m-2 0a2 2 0 1 1 3 1.5", WEISS, 1.1, `opacity="0.85"`) +
      R(-10, -18, 20, 18, "#e6f6fc", 5, `opacity="0.75"`) + R(-10, -18, 20, 18, "none", 5, `stroke="#a8ddf0" stroke-width="1.5"`) + R(-11, -20, 22, 4, "#cbd5e0", 2) },
  };

  const RAEUME = {
    eingangshalle: ["d_infotheke", "d_wegweiser", "d_brunnen", "d_geldautomat", "d_lift", "d_dorfplan", "d_fundkiste", "d_stuhlreihe", "d_abfallkuebel", "d_schirmstaender",
      "d_snackautomat", "d_plakatwand", "d_tischglocke", "d_prospekte", "bank", "grosspflanze", "briefkasten", "wasserspender", "laeufer", "kronleuchter", "pinnwand"],
    lebensmittel: ["d_kassentheke", "d_tiefkuehler", "d_kuehlregal", "d_gemuesewaage", "d_einkaufskorb", "d_getraenke", "d_konserven", "d_eier", "d_aktionsschild", "d_bananen",
      "warenregal", "obstkiste", "gemuesekiste", "kuehltheke", "einkaufswagen", "kaese", "ladentheke", "kasse", "brotregal", "milch", "aepfel"],
    baeckerei: ["d_backofen", "d_baeckertheke", "d_brotwagen", "d_mehlsack", "d_teigschuessel", "d_brezel", "d_grittibaenz", "d_waehe", "d_torte", "d_brot", "d_guetzli", "d_baeckerschild",
      "brotregal", "kasse", "kuchenvitrine", "gipfeli", "zopf", "kuchen", "brotkorb", "tisch", "stuhl", "kaffeemaschine"],
    spielwaren: ["d_spielzeugregal", "d_eisenbahn", "d_baellekorb", "d_puppenwagen", "d_teddy", "d_rutschauto", "d_drachen", "d_ballone", "d_kreisel", "d_roboter", "d_brettspiele", "d_ritterburg", "d_dino",
      "ladentheke", "kasse", "spielkiste", "kloetze", "ball", "kuscheltier", "schaukelpferd", "puppenhaus", "trommel"],
    kleider: ["d_umkleide", "d_hutstaender", "d_kleidertisch", "d_schuhwand", "d_standspiegel", "d_kleiderbuegel", "d_socken", "d_sonnenbrillen", "d_tragtaschen", "d_turnschuhe",
      "kleiderstaender", "schaufensterpuppe", "spiegel", "ladentheke", "kasse", "schuhregal", "hocker"],
    blumen: ["d_blumenwagen", "d_blumenkuehler", "d_bindetisch", "d_samentueten", "d_giesskanne", "d_kranz", "d_sonnenblume", "d_tulpen", "d_gartenzwerg", "d_blumenkasten",
      "blumenstrauss", "kaktus", "bambus", "haengepflanze", "blumeneimer", "blumenvase", "grosspflanze", "ladentheke", "kasse", "regal"],
    coiffeur: ["d_waschstuhl", "d_autostuhl", "d_rollwagen", "d_frisuren", "d_foehn", "d_schere", "d_haarspray", "d_besen", "d_shampoo", "d_lutscher",
      "coiffeurstuhl", "coiffeurspiegel", "trockenhaube", "lavabo", "handtuch", "ladentheke", "kasse", "zeitungsstaender", "bank"],
  };

  const MOTIVE = {
    // Das Dorf mit seinem Turm
    eingangshalle: () => R(-23, 12, 46, 5, "#9be07a") + R(-15, -2, 30, 15, "#ffe8a3", 1) + P("M-18 -2l18-8l18 8z", "#5cb85c") +
      R(-5, -12, 10, 10, "#ffe8a3") + P("M-7 -12l7-5l7 5z", "#5cb85c") + C(0, -7, 2.6, WEISS) + S("M0 -7v-1.6M0 -7l1.2 0.8", TINTE, 0.7) +
      R(-3, 5, 6, 8, HOLZ_D, 1) + R(-12, 2, 5, 5, "#a8d8f8", 1) + R(7, 2, 5, 5, "#a8d8f8", 1) + C(17, -11, 4, "#ffd166"),
    // Ein Korb voll Einkäufe
    lebensmittel: () => E(-6, -4, 3, 11, "#e8b06a", `transform="rotate(-30 -6 -4)"`) + C(6, -1, 5.5, "#ef5350") + S("M6 -6.5l1-3", "#8a5734", 1) +
      P("M11 3l9-13l2.5 2z", "#ff9f43") + S("M21 -9l2-4M21 -9l4-1", "#5cb85c", 1.3) +
      S("M-12 2q0-16 12-16t12 16", HOLZ_D, 2) + P("M-17 2h34l-4 13h-26z", "#c88c5c") + S("M-15 6h30M-14 10h28", HOLZ_D, 1),
    // Eine Brezel
    baeckerei: () => brezel(0, -1, 1.1, "#b9773a"),
    // Ein Teddybär
    spielwaren: () => C(-10, -9, 5, "#c88c5c") + C(10, -9, 5, "#c88c5c") + C(-10, -9, 2.4, "#e8c09a") + C(10, -9, 2.4, "#e8c09a") +
      C(0, 2, 12, "#c88c5c") + E(0, 6, 5.5, 4, "#e8c09a") + E(0, 4, 2, 1.5, TINTE) + C(-4.5, -1, 1.4, TINTE) + C(4.5, -1, 1.4, TINTE) + S("M-2 8q2 1.6 4 0", TINTE, 0.9),
    // Ein T-Shirt am Bügel
    kleider: () => S("M0 -14v-1q0-2 2.5-2", METALL_D, 1.2) + S("M-12 -7l12-7l12 7", METALL_D, 1.5) +
      P("M-6 -10l-12 6l4 7l5-3v15h18v-15l5 3l4-7l-12-6q-3 3-6 3t-6-3z", "#ef5350") + R(-9, 1, 18, 3, WEISS),
    // Drei Tulpen
    blumen: () => S("M-10 17l1-20M0 17v-24M10 17l-1-19", "#4aa34a", 2) + P("M-2 17q-12-8-10-20q8 8 10 20z", "#5cb85c") + P("M2 17q12-8 10-20q-8 8-10 20z", "#5cb85c") +
      [[-9, -3, "#ef5350"], [0, -7, "#ffd166"], [9, -2, "#ff7aa2"]].map(([x, y, f]) => P(`M${x - 5} ${y - 4}v-7l2.5 3.5l2.5-4.5l2.5 4.5l2.5-3.5v7q0 5-5 5t-5-5z`, f)).join(""),
    // Schere und Kamm
    coiffeur: () => R(4, -4, 18, 5, "#2d3748", 1.5) + [6, 9, 12, 15, 18].map((x) => R(x, 1, 1.4, 5, "#2d3748", 0.5)).join("") +
      S("M-10 6L8 -14M-2 8L4 -15", METALL, 2.4) + C(-12, 9, 4, "none", `stroke="#ef5350" stroke-width="2.4"`) + C(-3, 11, 4, "none", `stroke="#ef5350" stroke-width="2.4"`),
  };

  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
