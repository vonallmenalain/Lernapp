/*
 * bau-moebel-arbeit.js – Die eigenen Dinge der Zimmer Cafeteria, Archiv,
 * Computerraum, Atelier und Fitnessraum im Büro (Bauecke).
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten und die Bildmotive an.
 * tags: wofür ein Ding zählt, wenn sich ein Tier etwas wünscht (bau-katalog.js).
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, leg, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE, BUNT } = M.hilfe;

  // Bausteine, die mehrmals vorkommen.
  // Ein Ordner von vorne: Rücken mit Schild und Griffloch.
  const ordner = (x, oben, unten, f, extra = "") => {
    const h = unten - oben;
    return R(x, oben, 9, h, f, 1.5, extra) + R(x + 2, oben + 3, 5, Math.min(11, h * 0.36), WEISS, 1, extra) + C(x + 4.5, unten - h * 0.22, 2.2, WEISS, extra);
  };
  // Eine Archivschachtel von vorne: Deckelrand, Schild (mit Jahrzahl), Griffloch.
  const schachtel = (x, y, w, h, f, zahl = "") =>
    R(x, y, w, h, f, 2) + R(x, y, w, 4, shade(f, -0.12), 2) + R(x + w / 2 - 9, y + 7, 18, 9, WEISS, 1) +
    (zahl ? T(x + w / 2, y + 14.2, zahl, 7, TINTE) : "") + (h >= 26 ? E(x + w / 2, y + h - 6, 4, 2, shade(f, -0.35)) : "");

  const DINGE = {
    // --- Cafeteria --------------------------------------------------------------
    c_kaffeevollautomat: { name: "Kaffeevollautomat", der: "der Kaffeevollautomat", klein: true, w: 36, h: 40, farbe: "#3d4655", tags: ["kaffee", "kuechengeraet"], d: (c) =>
      R(-15, -39.5, 15, 7.5, "#eef9fd", 3, `stroke="${RAND}" stroke-width="1"`) +
      E(-11.5, -35, 2, 1.3, "#8a5734") + E(-7.5, -35.4, 2, 1.3, "#6b4226") + E(-3.5, -35, 2, 1.3, "#8a5734") + E(-9.5, -37.6, 2, 1.3, "#6b4226") + E(-5.5, -37.8, 2, 1.3, "#8a5734") +
      R(-18, -33, 36, 31, c, 5) + R(3, -30, 11, 6, "#a8f0c6", 1.5) + C(-12, -27, 1.6, shade(c, 0.5)) + C(-7, -27, 1.6, shade(c, 0.5)) +
      R(-12, -22, 24, 17, shade(c, -0.45), 3) + R(-4, -22, 8, 3.5, METALL, 1.5) + R(-0.8, -18.5, 1.6, 6, "#8a5734") +
      R(-4.5, -12.5, 9, 8, WEISS, 2) + S("M4.5 -11q3.5 1 0 4.5", WEISS, 1.6) + R(-10, -5, 20, 2.5, METALL, 1) + R(-18, -3, 36, 3, shade(c, -0.25), 1.5) },
    c_getraenkekuehlschrank: { name: "Getränkekühlschrank", der: "der Getränkekühlschrank", w: 58, h: 124, licht: true, tags: ["kuehlschrank", "trinken"], d: () => {
      const K = "#3a86ff";
      const flasche = (x, unten, f) => R(x - 3, unten - 13, 6, 13, f, 2) + R(x - 1.5, unten - 17, 3, 5, f, 1) + R(x - 3, unten - 9, 6, 4, WEISS, 1, `opacity="0.85"`);
      const dose = (x, unten, f) => R(x - 3.5, unten - 10, 7, 10, f, 2) + R(x - 3.5, unten - 10, 7, 1.6, METALL, 0.8);
      return R(-29, -124, 58, 120, K, 6) + R(-25, -120, 50, 12, shade(K, 0.3), 3) + S("M0 -118.5v9M-4 -116.2l8 4.5M4 -116.2l-8 4.5", WEISS, 1.6) +
        R(-25, -105, 50, 92, "#eef9fd", 3) + [-84, -60, -36].map((y) => R(-25, y, 50, 2.5, METALL)).join("") +
        [-19, -11, -3, 5, 13].map((x) => flasche(x, -84, "#7cc05e")).join("") +
        [-19, -11, -3, 5, 13].map((x, i) => flasche(x, -60, i % 2 ? "#ff9f43" : "#ffd166")).join("") +
        [-19, -11, -3, 5, 13].map((x, i) => flasche(x, -36, i % 2 ? "#ff7a7a" : "#6cc3d5")).join("") +
        [-18, -9, 0, 9].map((x, i) => dose(x, -14, i % 2 ? "#a78bfa" : "#ef5350")).join("") +
        S("M-20 -50l14-46", WEISS, 3, `opacity="0.55"`) + R(19, -92, 3.5, 34, METALL_D, 1.7) +
        R(-25, -11, 50, 5, shade(K, -0.3), 2) + leg(-25, 4, DUNKEL, 6) + leg(19, 4, DUNKEL, 6);
    } },
    c_stehtisch: { name: "Stehtisch", der: "der Stehtisch", w: 54, h: 78, farbe: "#5bb39a", flaeche: -78, tags: ["tisch"], d: (c) =>
      R(-27, -78, 54, 7, c, 3) + R(-21, -71, 42, 3, shade(c, -0.2), 1.5) +
      R(-3, -68, 6, 64, METALL_D, 2) + E(0, -26, 12, 2.5, "none", `stroke="${METALL}" stroke-width="2.5"`) + E(0, -3.5, 17, 3.5, DUNKEL) },
    c_bistrostuhl: { name: "Bistrostuhl", der: "der Bistrostuhl", w: 36, h: 62, farbe: "#7cc05e", tags: ["stuhl", "sitz"], d: (c) =>
      S("M-12 -30v-20q0-10 12-10t12 10v20", c, 4) + S("M-12 -46h24M-12 -39h24", shade(c, -0.12), 3) +
      S("M-12 -27l-4 25M12 -27l4 25", shade(c, -0.25), 3) + S("M-5 -26l-1.5 24M5 -26l1.5 24", shade(c, -0.4), 2.5) + S("M-14 -11h28", shade(c, -0.25), 2) +
      R(-17, -32, 34, 6, c, 3) + E(0, -31.5, 15, 2, shade(c, 0.25)) },
    c_schoggiautomat: { name: "Schoggiautomat", der: "der Schoggiautomat", w: 62, h: 128, farbe: "#ef5350", licht: true, tags: ["essen"], d: (c) => {
      const reihe = (unten, farben) => R(-26, unten, 38, 2, METALL) + [-19, -7, 5].map((x, i) =>
        R(x - 4.5, unten - 14, 9, 13, farben[i], 2) + R(x - 4.5, unten - 9, 9, 3, shade(farben[i], 0.45)) +
        S(`M${x - 5} ${unten - 0.5}q1.25-2.5 2.5 0t2.5 0t2.5 0t2.5 0`, METALL_D, 1)).join("");
      return R(-31, -128, 62, 124, c, 6) + R(-26, -122, 38, 98, "#eef9fd", 3) +
        reihe(-102, ["#8a5734", "#ffd166", "#7cc05e"]) + reihe(-78, ["#ff7aa2", "#8a5734", "#6cc3d5"]) +
        reihe(-54, ["#a78bfa", "#ff9f43", "#8a5734"]) + reihe(-30, ["#ffd166", "#3a86ff", "#ff7a7a"]) +
        S("M-22 -40l12-42", WEISS, 3, `opacity="0.5"`) +
        R(15, -120, 12, 10, "#2d3748", 2) + R(17, -118, 8, 4, "#7cff9e", 1) +
        [0, 1, 2].map((i) => [0, 1, 2, 3].map((j) => C(17.5 + i * 3.5, -103 + j * 4.5, 1.3, WEISS)).join("")).join("") +
        R(18, -82, 6, 2.5, DUNKEL, 1) + R(-26, -20, 38, 12, shade(c, -0.4), 3) + R(-22, -18, 30, 3, shade(c, -0.2), 1.5) +
        leg(-27, 4, DUNKEL, 6) + leg(21, 4, DUNKEL, 6);
    } },
    c_abwaschmaschine: { name: "Abwaschmaschine", der: "die Abwaschmaschine", w: 58, h: 66, flaeche: -66, tags: ["geschirr"], d: () =>
      R(-29, -66, 58, 6, "#cbd5e0", 3) + R(-26, -61, 52, 58, WEISS, 5, `stroke="${RAND}" stroke-width="2"`) +
      R(-23, -58, 46, 7, "#e2e8f0", 2.5) + R(-19, -56.5, 14, 4, "#a8d8f8", 1.5) + C(12, -54.5, 1.8, "#7cc05e") + C(17.5, -54.5, 1.8, "#cbd5e0") +
      R(-22, -49, 44, 34, "#dbe4ee", 3) +
      [-15, -5, 5, 15].map((x, i) => P(`M${x - 4} -38v-7q0-1.5 1.5-1.5h5q1.5 0 1.5 1.5v7z`, ["#ff7a7a", "#6cc3d5", "#ffd166", "#a78bfa"][i])).join("") +
      S("M-21 -38h42", METALL_D, 1.6) +
      [-16, -10, -4, 2, 8, 14].map((x, i) => E(x, -26, 2.6, 8.5, i % 2 ? "#a8d8f8" : WEISS, `stroke="${RAND}" stroke-width="1"`)).join("") +
      S("M-21 -17h42", METALL_D, 1.6) +
      P("M-25 -15h50l3 12h-56z", "#f1f5f9", `stroke="${RAND}" stroke-width="1.5"`) + R(-8, -10, 16, 2.5, "#cbd5e0", 1.2) +
      C(-17, -45, 1.6, WEISS) + C(18, -33, 1.3, WEISS) + R(-26, -3, 52, 3, "#cbd5e0", 1) },
    c_tassenregal: { name: "Tassenregal", der: "das Tassenregal", art: "wand", w: 70, h: 40, tags: ["geschirr"], d: () => {
      const tasse = (x, unten, f) => R(x - 5, unten - 12, 10, 12, f, 3) + S(`M${x + 5} ${unten - 10}q4.5 1 0 6.5`, f, 2) + C(x - 1.5, unten - 7, 1.6, WEISS, `opacity="0.7"`);
      return R(-35, -20, 4, 40, HOLZ_D, 2) + R(31, -20, 4, 40, HOLZ_D, 2) +
        [-24, -11, 2, 15].map((x, i) => tasse(x, -2, BUNT[i])).join("") +
        [-24, -11, 2].map((x, i) => tasse(x, 16, BUNT[i + 4])).join("") +
        R(15, 4, 10, 12, "#eef9fd", 2, `stroke="#a8ddf0" stroke-width="1.2"`) + R(15, 8, 10, 8, WEISS, 1.5) + R(14.5, 1.5, 11, 3.5, DUNKEL, 1.5) +
        R(-35, -20, 70, 4, HOLZ, 2) + R(-35, -2, 70, 4, HOLZ, 2) + R(-35, 16, 70, 4, HOLZ, 2);
    } },
    c_znuenitheke: { name: "Znünitheke", der: "die Znünitheke", w: 124, h: 76, farbe: "#5bb39a", flaeche: -57, fx: [4, 58], tags: ["theke", "essen"], d: (c) =>
      R(-62, -54, 124, 50, c, 5) + R(-62, -57, 124, 7, shade(c, -0.2), 3) +
      R(-56, -44, 52, 30, shade(c, 0.15), 3) + R(4, -44, 52, 30, shade(c, 0.15), 3) + R(-62, -36, 124, 4, METALL, 2) +
      P("M-58 -57l4-18h52l4 18z", "#eef9fd", `stroke="#a8ddf0" stroke-width="2"`) +
      R(-52, -61, 14, 3, "#f2d38a", 1.5) + R(-52.5, -63, 15, 2, "#7cc05e", 1) + R(-52, -65, 14, 2, "#ff9fb5", 1) + R(-52, -68, 14, 3, "#f2d38a", 1.5) +
      P("M-34 -58q6-10 12 0q-6 3-12 0z", "#e8a85a") + S("M-31 -61l1 2M-28 -62v3M-25 -61l-1 2", "#b9773a", 1) +
      P("M-17 -58l1-6h10l1 6z", "#ff9fb5") + E(-11, -64, 6, 3.5, "#8a5734") + C(-11, -68, 1.5, "#ef5350") +
      R(-60, -4, 120, 4, shade(c, -0.35), 2) },
    c_teekanne: { name: "Teekanne", der: "die Teekanne", klein: true, w: 34, h: 26, farbe: "#6cc3d5", tags: ["geschirr"], d: (c) =>
      S("M-11 -16q-5 0-4.5 8", shade(c, -0.15), 3) + S("M9 -8q5-1 6-11", c, 3.4) +
      P("M-11 -2c-5-4-5-13 0-17h22c5 4 5 13 0 17z", c) + E(0, -19, 10, 2.4, shade(c, -0.15)) + P("M-7 -20q7-7 14 0z", shade(c, 0.15)) + C(0, -24, 2, shade(c, -0.25)) +
      C(-4, -10, 1.6, WEISS) + C(4, -8, 1.6, WEISS) + C(1, -14, 1.6, WEISS) + E(0, -1.5, 9, 1.5, shade(c, -0.3)) },
    c_tablett: { name: "Tablett mit Znüni", der: "das Tablett", klein: true, w: 40, h: 24, tags: ["essen"], d: () =>
      R(-20, -4, 40, 4, "#6cc3d5", 2) + R(-18, -5, 36, 2, shade("#6cc3d5", 0.25), 1) +
      R(-17, -9, 15, 3.5, "#f2d38a", 1.5) + R(-17.5, -11, 16, 2.4, "#7cc05e", 1.2) + R(-17, -13.5, 15, 2.6, "#ff9fb5", 1) + R(-17, -17, 15, 3.6, "#f2d38a", 1.5) +
      C(3, -10, 5, "#ef5350") + S("M3 -15l0.8-3", HOLZ_DD, 1.4) + P("M4 -17q3-2.5 5.5 0q-3 2.5-5.5 0z", "#7cc05e") + C(1.5, -11.5, 1.2, WEISS, `opacity="0.6"`) +
      R(10, -18, 8, 13, "#eef9fd", 2, `stroke="#a8ddf0" stroke-width="1.2"`) + R(10.8, -13.5, 6.4, 7.8, "#ffb347", 1.5) + S("M15.5 -16l2.5-6", "#ff7aa2", 1.4) },
    c_recycling: { name: "Recyclingstation", der: "die Recyclingstation", w: 78, h: 54, tags: ["abfall"], d: () => {
      const kuebel = (x, f) => R(x - 11, -44, 22, 44, f, 4) + R(x - 12.5, -49, 25, 7, shade(f, -0.2), 3) + R(x - 4, -53, 8, 4, shade(f, -0.35), 2) + R(x - 11, -4, 22, 4, shade(f, -0.15), 2);
      return kuebel(-26, "#3a86ff") + kuebel(0, "#ffd166") + kuebel(26, "#7cc05e") +
        R(-29, -34, 6, 14, WEISS, 2) + R(-27.5, -39, 3, 6, WEISS, 1) +
        R(-4.5, -38, 9, 15, WEISS, 2) + R(-4.5, -33, 9, 3, "#ffd166") +
        P("M21 -41h10q3 0 2 3q-4 2-4 6t4 6q1 3-2 3h-10q-3 0-2-3q4-2 4-6t-4-6q-1-3 2-3z", WEISS) + S("M26 -41v-3", HOLZ_DD, 1.6) + P("M26.5 -43.5q3-3 6-1q-3 3-6 1z", WEISS);
    } },

    // --- Archiv -----------------------------------------------------------------
    c_rollregal: { name: "Rollregal", der: "das Rollregal", w: 124, h: 132, farbe: "#8fa3b8", tags: ["akten", "regal", "schrank"], d: (c) => {
      const kiste = (x, oben, f) => R(x, oben, 19, 24, f, 2) + R(x + 4.5, oben + 4, 10, 6, WEISS, 1) + E(x + 9.5, oben + 18, 3.5, 1.8, shade(f, -0.35));
      return R(-62, -6, 124, 6, METALL_D, 2) +
        R(-60, -132, 98, 124, shade(c, -0.12), 3) + R(-55, -127, 88, 116, "#f1f4f8") +
        [-98, -69, -40].map((y) => R(-55, y, 88, 4, shade(c, -0.12))).join("") +
        Array.from({ length: 8 }, (_, i) => ordner(-53 + i * 10.8, -124, -98, BUNT[i % 8])).join("") +
        [-53, -32, -11, 10].map((x, i) => kiste(x, -93, i % 2 ? "#dfe6ee" : "#e9dcc3")).join("") +
        Array.from({ length: 8 }, (_, i) => ordner(-53 + i * 10.8, -63, -40, BUNT[(i + 3) % 8])).join("") +
        [-53, -32, -11, 10].map((x, i) => kiste(x, -35, i % 2 ? "#e9dcc3" : "#dfe6ee")).join("") +
        R(38, -132, 22, 124, c, 3) + R(42, -124, 14, 9, WEISS, 1.5) + T(49, -117, "A", 7, TINTE) +
        C(49, -70, 11, "none", `stroke="${DUNKEL}" stroke-width="3"`) + S("M49 -70v-11M49 -70l9.5 5.5M49 -70l-9.5 5.5", DUNKEL, 2.4) + C(49, -70, 3.2, DUNKEL) + C(49, -81, 2.6, "#ef5350") +
        C(-48, -6, 4, DUNKEL) + C(-10, -6, 4, DUNKEL) + C(28, -6, 4, DUNKEL) + C(49, -6, 4, DUNKEL);
    } },
    c_archivschachteln: { name: "Archivschachteln", der: "die Archivschachteln", w: 66, h: 60, tags: ["akten"], d: () =>
      schachtel(-33, -30, 32, 30, "#e9dcc3", "1999") + schachtel(1, -30, 32, 30, "#dfe6ee", "2005") + schachtel(-17, -60, 32, 30, "#f2e3c6", "2012") },
    c_leiter: { name: "Leiter", der: "die Leiter", w: 38, h: 124, farbe: HOLZ, tags: ["leiter"], d: (c) =>
      [-20, -38, -56, -74, -92, -110].map((y) => {
        const x = 12 - (3 * (-4 - y)) / 112 + 1;
        return R(-x, y, 2 * x, 4.5, shade(c, -0.2), 1.5);
      }).join("") +
      P("M-18 -4L-14 -116h5L-12 -4z", c) + P("M18 -4L14 -116h-5L12 -4z", c) +
      S("M-11.5 -116v-2.5q0-4 4-4", METALL_D, 2.5) + S("M11.5 -116v-2.5q0-4-4-4", METALL_D, 2.5) +
      C(-15, -3, 3, DUNKEL) + C(15, -3, 3, DUNKEL) },
    c_karteikasten: { name: "Karteikasten", der: "der Karteikasten", klein: true, w: 32, h: 26, tags: ["akten"], d: () =>
      R(-14, -20, 28, 8, "#f8fafc", 1, `stroke="${RAND}" stroke-width="1"`) +
      R(-12.5, -23, 6, 4, "#ffd166", 1) + R(7, -23, 6, 4, "#ff7aa2", 1) + R(-2, -23.5, 6, 4.5, "#7cc05e", 1) +
      R(-6, -25, 12, 13, WEISS, 1, `stroke="${RAND}" stroke-width="1"`) + S("M-3.5 -21.5h7M-3.5 -18.5h5", "#a0aec0", 1) +
      R(-16, -14, 32, 14, HOLZ, 2.5) + R(-16, -14, 32, 3, HOLZ_D, 1.5) + R(-6, -10, 12, 5, WEISS, 1) + C(0, -3.5, 1.8, HOLZ_DD) },
    c_landkarten: { name: "Landkarten", der: "die Landkarten", w: 44, h: 70, tags: ["karte"], d: () => {
      const rolle = (x, oben, b, f, dreh) => {
        const g = `transform="rotate(${dreh} ${x} -20)"`;
        return R(x - b / 2, oben, b, 40, f, 2, g) + E(x, oben, b / 2, b / 4, shade(f, -0.12), g) + E(x, oben, b / 4, b / 8, shade(f, -0.3), g);
      };
      return rolle(-9, -64, 8, "#f4e6c8", -8) + rolle(9, -66, 8, "#a8d8f8", 7) + rolle(-1, -67, 9, "#fbf8f2", 0) + rolle(-11.5, -55, 7, "#c5ec9a", -10) + rolle(12, -57, 7, "#ffd8b8", 10) +
        R(-5.5, -58, 9, 2.5, "#ef5350") +
        P("M-17 0l-3-34h40l-3 34z", "#c9a26b") + S("M-18.5 -26h37M-18 -18h36M-17.5 -10h35", "#a8814f", 1.6) + R(-21, -37, 42, 5, "#b08850", 2.5) +
        P("M-4 -35h20v22q-10 3-20 0z", "#f4e6c8") + P("M-1 -31q5-3 8 1q-1 5-6 4q-4-1-2-5z", "#9be07a") + P("M8 -22q4-2 5 2q-2 3-5 1z", "#9be07a") +
        S("M1 -20q4 2 6-2t5-6", "#ef5350", 1, `stroke-dasharray="1.5 1.5"`) + S("M10.5 -30l3 3M13.5 -30l-3 3", "#ef5350", 1.4);
    } },
    c_aktenwagen: { name: "Aktenwagen", der: "der Aktenwagen", w: 72, h: 76, farbe: "#3a86ff", tags: ["akten"], d: (c) =>
      R(-33, -76, 66, 5, shade(c, -0.25), 2.5) + R(-33, -72, 5, 62, shade(c, -0.25), 2) + R(28, -72, 5, 62, shade(c, -0.25), 2) +
      Array.from({ length: 5 }, (_, i) => ordner(-26.5 + i * 10.6, -66, -44, BUNT[(i + 2) % 8])).join("") + R(-35, -44, 70, 5, c, 2) +
      schachtel(-27, -35, 26, 19, "#e9dcc3") + schachtel(1, -35, 26, 19, "#dfe6ee") +
      R(-35, -16, 70, 5, c, 2) + R(-33, -11, 66, 3, shade(c, -0.25), 1.5) +
      C(-26, -5, 5, DUNKEL) + C(26, -5, 5, DUNKEL) + C(-26, -5, 2, METALL) + C(26, -5, 2, METALL) },
    c_taschenlampe: { name: "Taschenlampe", der: "die Taschenlampe", klein: true, w: 40, h: 16, farbe: "#3a86ff", licht: true, tags: ["lampe"], d: (c) =>
      P("M11.5 -10L20 -16V0L11.5 -1z", "#fff6c2", `opacity="0.85"`) +
      R(-19, -9.5, 3.5, 8, shade(c, -0.25), 1.5) + R(-16.5, -9, 21, 7, c, 3) + S("M-13 -9v7M-10 -9v7M-7 -9v7", shade(c, -0.2), 1) + R(-3, -11, 6, 2.5, DUNKEL, 1) +
      P("M4 -9.5h4l3-1.5v11l-3-1.5h-4z", shade(c, -0.2)) + E(11.2, -5.5, 1.4, 5.3, "#fffbe6") },
    c_zeitungen: { name: "Alte Zeitungen", der: "die alten Zeitungen", klein: true, w: 40, h: 26, tags: ["zeitung"], d: () =>
      [["#f4f1ea", -18, 0], ["#e2e8f0", -17, -1], ["#fbf8f2", -18.5, 0.5], ["#e9e4d8", -17.5, -0.5], ["#f4f1ea", -18, 0]].map(([f, x, v], i) =>
        R(x, -4 - i * 4, 36 + v, 4, f, 1) + S(`M${x + 2} ${-2 - i * 4}h${32 + v}`, "#cbd5e0", 0.7)).join("") +
      P("M-18 -20l3-5h30l3 5z", "#f4f1ea") + S("M-12 -22.5h11", TINTE, 1.3) + S("M-11 -20.8h8", "#a0aec0", 0.8) + R(4, -24.2, 8, 3.4, "#a0aec0", 0.5) +
      S("M0 -20v19.3", "#c49a46", 1.4) + S("M0 -21q-4-4-6 0q2 2 6 0q4-4 6 0q-2 2-6 0", "#c49a46", 1.2) },
    c_lupe: { name: "Lupe", der: "die Lupe", klein: true, w: 30, h: 30, tags: ["lupe"], d: () =>
      S("M-12 -3l9-10", HOLZ_DD, 5) + C(4, -18, 10, METALL_D) + C(4, -18, 7.6, "#eef9fd") + S("M-1 -21q2.5-3.5 6-3.5", WEISS, 2) },
    c_schubladenschrank: { name: "Schubladenschrank", der: "der Schubladenschrank", w: 76, h: 96, farbe: HOLZ, flaeche: -96, tags: ["akten", "schrank"], d: (c) => {
      let s = R(-38, -96, 76, 90, c, 4);
      for (let r = 0; r < 6; r += 1) {
        for (let k = 0; k < 4; k += 1) {
          const x = -34 + k * 17.5;
          const y = -92 + r * 14;
          if (r === 1 && k === 2) s += R(x, y, 15.5, 12, shade(c, -0.45), 2);
          else s += R(x, y, 15.5, 12, shade(c, 0.15), 2) + R(x + 4.5, y + 2, 6.5, 3.5, WEISS, 1) + C(x + 7.75, y + 8.5, 1.4, HOLZ_DD);
        }
      }
      const x = 1;
      const y = -78;
      s += R(x + 1, y - 4, 13.5, 9, WEISS, 1, `stroke="${RAND}" stroke-width="1"`) + R(x + 3, y - 6, 4, 3, "#ffd166", 1) + R(x + 9, y - 5.5, 4, 3, "#ff7aa2", 1) +
        R(x - 1.5, y + 4, 18.5, 12, shade(c, 0.22), 2) + R(x + 5.5, y + 6, 6.5, 3.5, WEISS, 1) + C(x + 8.75, y + 12, 1.4, HOLZ_DD);
      return s + leg(-35, 6, shade(c, -0.3), 6) + leg(29, 6, shade(c, -0.3), 6);
    } },
    c_thermometer: { name: "Thermometer", der: "das Thermometer", art: "wand", w: 26, h: 62, tags: ["thermometer"], d: () =>
      R(-12, -30, 24, 60, HOLZ, 12) + R(-9, -27, 18, 54, "#fbf8f2", 9) +
      R(-2.6, -24, 5.2, 40, "#eef9fd", 2.6, `stroke="#cbd5e0" stroke-width="1"`) + R(-1.3, -6, 2.6, 24, "#ef5350", 1.3) + C(0, 19, 5.5, "#ef5350") + C(-1.6, 17.4, 1.4, WEISS, `opacity="0.7"`) +
      [-20, -14, -8, -2, 4, 10].map((y, i) => S(`M3.5 ${y}h${i % 2 ? 2.5 : 4}`, TINTE, 1)).join("") +
      C(-5.5, -20, 2.4, "#ffd166") + S("M-5.5 6v6M-8.1 7.5l5.2 3M-8.1 10.5l5.2-3", "#6cc3d5", 1.1) },

    // --- Computerraum -----------------------------------------------------------
    c_kabelschrank: { name: "Kabelschrank", der: "der Kabelschrank", w: 64, h: 136, licht: true, tags: ["server", "computer"], d: () => {
      const ys = [-124, -98, -72, -46, -20];
      const farben = ["#ff7a7a", "#3a86ff", "#ffd166", "#7cc05e", "#a78bfa", "#ff9f43"];
      let s = R(-32, -136, 64, 132, "#2d3748", 5) + R(-27, -130, 54, 118, "#1a202c", 3);
      ys.forEach((y, i) => {
        s += R(-24, y, 48, 10, "#4a5568", 1.5);
        for (let k = 0; k < 7; k += 1) s += R(-21 + k * 5.5, y + 3, 3.5, 4, "#1a202c", 0.8);
        s += C(19.5, y + 5, 1.7, i % 2 ? "#7cff9e" : "#ffd166");
      });
      [[0, 2], [3, 1], [5, 6]].forEach(([a, b], j) => {
        ys.slice(0, 4).forEach((y, i) => {
          const x1 = -19.25 + a * 5.5;
          const x2 = -19.25 + ((b + i) % 7) * 5.5;
          const y1 = y + 7;
          const y2 = ys[i + 1] + 3;
          s += S(`M${x1} ${y1}C${x1} ${y1 + 12} ${x2} ${y2 - 12} ${x2} ${y2}`, farben[(i + j * 2) % farben.length], 1.6);
        });
      });
      return s + R(-27, -130, 54, 118, "#a8ddf0", 3, `opacity="0.1"`) + R(23, -84, 3, 20, METALL, 1.5) + leg(-28, 4, DUNKEL, 6) + leg(22, 4, DUNKEL, 6);
    } },
    c_kontrollpult: { name: "Kontrollpult", der: "das Kontrollpult", w: 132, h: 90, farbe: "#cbd5e0", licht: true, tags: ["computer", "schreibtisch"], d: (c) =>
      R(-60, -38, 28, 38, shade(c, -0.15), 3) + R(32, -38, 28, 38, shade(c, -0.15), 3) +
      R(-56, -32, 20, 12, shade(c, 0.12), 2) + R(-56, -17, 20, 12, shade(c, 0.12), 2) + R(36, -32, 20, 12, shade(c, 0.12), 2) + R(36, -17, 20, 12, shade(c, 0.12), 2) +
      R(-50, -27, 8, 2.5, DUNKEL, 1.2) + R(-50, -12, 8, 2.5, DUNKEL, 1.2) + R(42, -27, 8, 2.5, DUNKEL, 1.2) + R(42, -12, 8, 2.5, DUNKEL, 1.2) +
      R(-66, -46, 132, 8, c, 3) +
      R(-3, -60, 6, 14, METALL_D) + R(-12, -49, 24, 3, METALL_D, 1.5) + R(-47, -58, 5, 12, METALL_D) + R(42, -58, 5, 12, METALL_D) +
      R(-22, -90, 44, 32, "#2d3748", 3) + R(-19, -87, 38, 26, "#1e3a5f", 2) +
      S("M-15 -66l7-8 6 4 7-11 6 6 6-9", "#7cff9e", 1.8) + S("M-15 -83h10", "#6cc3d5", 1.6) +
      P("M-64 -86L-26 -82V-58L-64 -56Z", "#2d3748") + P("M-61 -82.6L-29 -79.4V-61L-61 -59.4Z", "#1e3a5f") +
      C(-45, -70, 7.5, "none", `stroke="#7cff9e" stroke-width="1.2"`) + C(-45, -70, 3.5, "none", `stroke="#7cff9e" stroke-width="1"`) + S("M-45 -70l6-4", "#7cff9e", 1.4) + C(-40, -66, 1.5, "#ffd166") +
      P("M64 -86L26 -82V-58L64 -56Z", "#2d3748") + P("M61 -82.6L29 -79.4V-61L61 -59.4Z", "#1e3a5f") +
      R(33, -70, 5, 8, "#ffd166", 1) + R(40, -74, 5, 12, "#ff7a7a", 1) + R(47, -78, 5, 16.5, "#6cc3d5", 1) + R(54, -72, 4, 11, "#a78bfa", 1) +
      R(-18, -50, 30, 4, "#e2e8f0", 1.5) + E(20, -48.5, 3.5, 2.2, "#e2e8f0") +
      C(-56, -49, 2.2, "#ef5350") + C(-49, -49, 2.2, "#ffd166") + C(-42, -49, 2.2, "#7cc05e") },
    c_router: { name: "WLAN-Router", der: "der WLAN-Router", klein: true, w: 34, h: 28, licht: true, tags: ["computer"], d: () =>
      R(-13, -24, 3, 16, DUNKEL, 1.5) + R(10, -24, 3, 16, DUNKEL, 1.5) +
      R(-16, -11.75, 32, 11, WEISS, 3, `stroke="${RAND}" stroke-width="1.5"`) + [-9, -4, 1, 6].map((x, i) => C(x, -5.5, 1.5, i === 3 ? "#3a86ff" : "#7cc05e")).join("") + R(9, -6.5, 4, 2, "#cbd5e0", 1) +
      S("M-4.5 -17q4.5-4 9 0", "#3a86ff", 1.8) + S("M-8 -21q8-7 16 0", "#3a86ff", 1.8) + C(0, -13.5, 1.5, "#3a86ff") },
    c_kabelrolle: { name: "Kabelrolle", der: "die Kabelrolle", w: 48, h: 50, farbe: "#ff9f43", tags: ["kabel"], d: (c) =>
      S("M-12 -5l7-16M12 -5l-7-16", "#2d3748", 4) + R(-17, -5, 34, 5, "#2d3748", 2.5) +
      C(0, -28, 21, "#2d3748") + C(0, -28, 17, c) + C(0, -28, 13, "none", `stroke="${shade(c, -0.2)}" stroke-width="1.5"`) + C(0, -28, 9.5, "none", `stroke="${shade(c, -0.2)}" stroke-width="1.5"`) +
      C(0, -28, 7, "#e2e8f0") + C(0, -28, 3, METALL_D) + S("M0 -28l8 7", "#4a5568", 2.4) + C(8, -21, 2.6, "#ef5350") + R(-7, -50, 14, 4, "#2d3748", 2) +
      S("M15 -16q6 3 3 8", c, 3) + R(15, -8, 6, 5, "#2d3748", 1.5) + S("M21 -6.8h2M21 -4.2h2", METALL, 1) },
    c_tastatur: { name: "Tastatur und Maus", der: "die Tastatur", klein: true, w: 40, h: 12, tags: ["computer"], d: () => {
      let s = P("M-19 0l3-10h26l3 10z", "#e2e8f0");
      for (let r = 0; r < 3; r += 1) {
        for (let k = 0; k < 8; k += 1) s += R(-15.6 + k * 3.2 - (r - 1) * 0.6, -8.6 + r * 2.4, 2.4, 1.7, "#a0aec0", 0.4);
      }
      return s + R(-9, -1.8, 13, 1.4, "#a0aec0", 0.4) + E(16, -3.5, 4, 3.5, "#e2e8f0") + S("M16 -7v2.5", "#a0aec0", 0.8) + S("M16 -7q0-4-5-4", "#a0aec0", 0.9);
    } },
    c_klimaanlage: { name: "Klimaanlage", der: "die Klimaanlage", art: "wand", w: 92, h: 48, tags: ["klima"], d: () =>
      R(-45, -23, 90, 29, WEISS, 9, `stroke="${RAND}" stroke-width="2"`) + R(-40, -2, 80, 5, "#cbd5e0", 2.5) + S("M-38 0.5h76", "#a0aec0", 1.2) +
      R(24, -18, 10, 6, "#a8d8f8", 1.5) + C(38, -15, 1.8, "#7cc05e") +
      S("M-28 -17v10M-32.3 -14.5l8.6 5M-32.3 -9.5l8.6-5", "#6cc3d5", 1.6) +
      [-26, 0, 26].map((x) => S(`M${x} 10q3 3 0 6t0 6`, "#6cc3d5", 2.2)).join("") },
    c_bildschirmwand: { name: "Bildschirmwand", der: "die Bildschirmwand", art: "wand", w: 132, h: 82, licht: true, tags: ["computer"], d: () => {
      const F = [[-63, -38], [-20, -38], [23, -38], [-63, 2], [-20, 2], [23, 2]];
      return R(-66, -41, 132, 82, "#4a5568", 4) + F.map(([x, y]) => R(x, y, 40, 36, "#1e3a5f", 2)).join("") +
        S("M-59 -10l7-7 6 4 8-12 7 6 8-10 7 5", "#7cff9e", 2) +
        P("M-14 -30q8-4 14 0q4 6-2 10q-8 2-12-4z", "#7cc05e") + P("M4 -22q6-4 10 2q-2 6-8 4z", "#7cc05e") + C(-8, -26, 1.8, "#ffd166") + C(9, -18, 1.8, "#ff7a7a") + C(-2, -10, 1.8, "#ffd166") +
        R(28, -18, 6, 12, "#ffd166", 1) + R(36, -26, 6, 20, "#ff7a7a", 1) + R(44, -22, 6, 16, "#6cc3d5", 1) + R(52, -32, 6, 26, "#a78bfa", 1) +
        C(-43, 20, 11, "#6cc3d5") + P("M-43 20v-11a11 11 0 0 1 10.5 7.5z", "#ffd166") + P("M-43 20l10.5-3.5a11 11 0 0 1-6 13.5z", "#ff7a7a") +
        S("M-15 10h14M-15 16h22M-11 22h16M-11 28h10M-15 34h18", "#a8f0c6", 2) +
        T(43, 26, "OK", 15, "#7cff9e");
    } },
    c_batterie: { name: "Grosse Batterie", der: "die grosse Batterie", w: 54, h: 74, licht: true, tags: ["strom"], d: () =>
      R(-27, -74, 54, 70, "#2d3748", 5) + R(-21, -66, 42, 26, "#1a202c", 3) +
      R(-15, -61, 26, 16, "none", 2, `stroke="#7cff9e" stroke-width="2"`) + R(11, -56, 3, 6, "#7cff9e", 1) +
      [0, 1, 2].map((i) => R(-12 + i * 7.5, -58, 5.5, 10, "#7cff9e", 1)).join("") +
      P("M3 -34l-9 13h6l-3 11l10-14h-6l3-10z", "#ffd166") +
      S("M-20 -10h12M8 -10h12", "#4a5568", 2) + leg(-23, 4, DUNKEL, 6) + leg(17, 4, DUNKEL, 6) },
    c_roboterarm: { name: "Roboterarm", der: "der Roboterarm", klein: true, w: 36, h: 38, farbe: "#ff9f43", tags: ["roboter"], d: (c) =>
      R(-15, -6, 20, 6, "#4a5568", 2) + R(-11, -10, 12, 5, "#2d3748", 2) +
      S("M-5 -10L-9 -26", c, 6) + S("M-9 -26L8 -33", c, 5) +
      C(-5, -10, 3.6, shade(c, -0.3)) + C(-9, -26, 3.6, shade(c, -0.3)) + C(8, -33, 3, shade(c, -0.3)) +
      S("M8 -33L12 -27", DUNKEL, 3) + S("M8 -26h8", DUNKEL, 2.2) + S("M8.6 -26v7M15.4 -26v7", DUNKEL, 1.8) + C(12, -21, 2.8, "#3a86ff") },
    c_kabelsalat: { name: "Kabelsalat", der: "der Kabelsalat", klein: true, w: 38, h: 24, tags: ["kabel"], d: () =>
      S("M-17 -3c-2-12 12-16 13-6s-12 6-4-6s16-6 13 5", "#3a86ff", 2) +
      S("M-14 -12c6-10 20-8 15 2s-17 3-11-7s17-5 17 5", "#ff7a7a", 2) +
      S("M-9 -2c3-15 21-17 21-5s-9 4-6-5", "#ffd166", 2) +
      S("M-4 -18c9-4 17 1 12 9s-15 3-14-3", "#7cc05e", 2) +
      R(12, -7, 5, 4, DUNKEL, 1) + S("M17 -6h1.5M17 -4h1.5", METALL, 0.8) + R(-19, -6, 4, 4, "#4a5568", 1) },
    c_zahlenschloss: { name: "Zahlenschloss", der: "das Zahlenschloss", art: "wand", w: 30, h: 44, licht: true, tags: ["schloss"], d: () =>
      R(-15, -22, 30, 44, "#4a5568", 5) + R(-11, -19, 22, 8, "#1a202c", 2) + [-6, -2, 2, 6].map((x) => C(x, -15, 1.3, "#7cff9e")).join("") +
      [0, 1, 2, 3].map((r) => [0, 1, 2].map((k) => R(-10 + k * 7.5, -8 + r * 6, 5, 4.5, r === 3 && k !== 1 ? (k ? "#7cc05e" : "#ff7a7a") : "#e2e8f0", 1.2)).join("")).join("") +
      C(-5, 18, 1.7, "#7cff9e") + C(5, 18, 1.7, "#ffd166") },

    // --- Atelier ----------------------------------------------------------------
    c_zeichentisch: { name: "Zeichentisch", der: "der Zeichentisch", w: 94, h: 100, tags: ["tisch", "malen"], d: () =>
      S("M-30 -52L-38 -4M30 -52L38 -4", DUNKEL, 4) + S("M-34 -26h68", DUNKEL, 3) + R(-46, -5, 18, 5, DUNKEL, 2.5) + R(28, -5, 18, 5, DUNKEL, 2.5) +
      P("M-46 -54L46 -54L40 -100L-40 -100Z", HOLZ) + P("M-38 -59L38 -59L33.5 -95L-33.5 -95Z", WEISS) +
      S("M-16 -63v-14l10-8l10 8v14zM-11 -63v-7h5v7", "#3a86ff", 1.5) + S("M10 -64h16M10 -70h12M10 -76h14", "#a0aec0", 1.2) +
      R(-38, -90, 76, 4, "#ffd166", 1.5) +
      R(-47, -57, 94, 5, HOLZ_D, 2) + R(-30, -60, 16, 2.6, "#ef5350", 1.2) + R(-10, -60, 12, 2.6, "#3a86ff", 1.2) + R(14, -60.5, 10, 3, "#ff9fb5", 1.5) },
    c_farbmuster: { name: "Farbmuster", der: "die Farbmuster", art: "wand", w: 84, h: 62, tags: ["malen"], d: () =>
      R(-41, -30, 82, 60, WEISS, 3, `stroke="${RAND}" stroke-width="2"`) +
      ["#ef5350", "#ff9f43", "#ffd166", "#7cc05e", "#3a86ff", "#a78bfa"].map((f, i) => [0, 1, 2, 3].map((j) => R(-38 + i * 13, -27 + j * 14, 11, 12, shade(f, j * 0.22 - 0.12), 1.5)).join("")).join("") },
    c_zeichentablett: { name: "Zeichentablett", der: "das Zeichentablett", klein: true, w: 36, h: 32, licht: true, tags: ["malen", "computer"], d: () =>
      S("M8 -18L15 -1", METALL_D, 2.2) +
      P("M-17 0L-13.8 -25.8Q-13.5 -28 -11.3 -28H8.3Q10.5 -28 10.8 -25.8L14 0Z", "#2d3748") + P("M-14.6 -2.2L-11.6 -25.4H8.6L11.6 -2.2Z", WEISS) + C(-1.5, -26.7, 0.6, "#718096") +
      C(-6, -20, 3, "#ffd166") + S("M-12 -6h21", "#7cc05e", 1.4) + S("M4 -6v-8", "#7cc05e", 1.2) + C(4, -15, 2.6, "#ff7aa2") + C(4, -15, 1, "#ffd166") +
      S("M-10 -10q3-4 7-1.5", "#3a86ff", 1.4) +
      S("M10 -30L-1.5 -12.5", "#a0aec0", 2.4) + S("M-1.5 -12.5l-1 1.4", DUNKEL, 1.4) },
    c_leuchttisch: { name: "Leuchttisch", der: "der Leuchttisch", w: 100, h: 68, licht: true, flaeche: -54, fx: [-38, 38], tags: ["tisch", "malen"], d: () =>
      leg(-44, 44, METALL_D, 5) + leg(39, 44, METALL_D, 5) + S("M-41 -16h82", METALL, 3) +
      R(-48, -50, 96, 8, "#cbd5e0", 3) + R(-44, -47, 88, 2.5, "#e2e8f0", 1) +
      P("M-48 -50L-41 -60H41L48 -50Z", "#ffe9a3") + P("M-42 -51.5L-37 -58.3H37L42 -51.5Z", "#fffbe6") +
      P("M-22 -52L-19 -57.5H13L16 -52Z", WEISS, `stroke="#a8ddf0" stroke-width="0.8"`) +
      S("M-11 -53v-2.6l3.5-1.4l3.5 1.4v2.6M-3 -53.2h8M-2 -55.6h6", "#3a86ff", 0.9) +
      S("M-30 -62l-2-4M0 -62.5v-4.5M30 -62l2-4", "#ffd166", 1.6) },
    c_hausmodell: { name: "Hausmodell", der: "das Hausmodell", klein: true, w: 38, h: 32, tags: ["modell"], d: () =>
      R(-19, -4, 38, 4, "#e2c9a6", 1.5) + R(-18, -5.5, 36, 2, "#9be07a", 1) +
      R(-13, -19, 16, 14, WEISS, 1, `stroke="${RAND}" stroke-width="1.2"`) + P("M-15 -19l10-11l10 11z", "#f1f5f9", `stroke="${RAND}" stroke-width="1.2"`) +
      R(-10, -16, 4, 4, "#cbd5e0") + R(-2, -16, 4, 4, "#cbd5e0") + R(-6.5, -10, 4, 5, "#cbd5e0") +
      R(4, -12, 8, 7, WEISS, 1, `stroke="${RAND}" stroke-width="1.2"`) + S("M15.5 -5v-6", HOLZ_D, 1.2) + C(15.5, -13, 3.2, "#7cc05e") + C(-16, -8, 2.4, "#7cc05e") },
    c_farbwagen: { name: "Farbwagen", der: "der Farbwagen", w: 66, h: 80, farbe: "#ff7a7a", tags: ["malen"], d: (c) => {
      const brett = (y) => R(-32, y, 64, 10, c, 3) + R(-32, y, 64, 3, shade(c, 0.25), 1.5);
      const dose = (x, unten, f) => R(x - 5, unten - 12, 10, 12, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + R(x - 5, unten - 12, 10, 4, f, 2);
      return R(-30, -70, 4, 62, shade(c, -0.25), 2) + R(26, -70, 4, 62, shade(c, -0.25), 2) +
        R(-25, -70, 10, 12, "#eef9fd", 2, `stroke="#a8ddf0" stroke-width="1"`) + S("M-22.5 -70l-2-7M-20 -70v-8M-17.5 -70l2-7", HOLZ, 1.6) +
        C(-24.6, -77.5, 1.6, "#ef5350") + C(-20, -78.5, 1.6, "#3a86ff") + C(-15.4, -77.5, 1.6, "#ffd166") +
        R(-6, -68, 12, 10, METALL, 2) + R(-6, -68, 12, 3, "#3a86ff", 1.5) + R(9, -66, 10, 8, METALL, 2) + R(9, -66, 10, 3, "#7cc05e", 1.5) +
        brett(-62) +
        [-20, -7, 6, 19].map((x, i) => dose(x, -36, BUNT[i])).join("") + brett(-40) +
        R(-26, -24, 24, 8, WEISS, 4, `stroke="${RAND}" stroke-width="1"`) + C(-24, -20, 2.5, "#e2e8f0") + R(2, -25, 22, 9, "#ffd166", 4) + C(4.5, -20.5, 2.6, "#e8b94f") +
        brett(-18) + C(-25, -4, 4, DUNKEL) + C(25, -4, 4, DUNKEL);
    } },
    c_kamera: { name: "Fotokamera", der: "die Fotokamera", w: 44, h: 96, tags: ["foto"], d: () =>
      S("M0 -66L-19 -1.3M0 -66L19 -1.3M0 -66V-6", "#2d3748", 2.6) + R(-4, -70, 8, 6, "#2d3748", 1.5) +
      R(-17, -90, 34, 21, "#2d3748", 4) + R(-11, -95, 12, 6, "#2d3748", 2) + R(9, -93, 5, 3, "#ef5350", 1) + R(-17, -84, 34, 4, "#4a5568") +
      C(3, -79, 9, "#4a5568") + C(3, -79, 6.5, "#1a202c") + C(3, -79, 3, "#3a5a80") + C(1, -81, 1.5, WEISS, `opacity="0.8"`) + R(-14, -88, 6, 3.5, "#a8d8f8", 1) },
    c_bilderleine: { name: "Bilderleine", der: "die Bilderleine", art: "wand", w: 120, h: 46, tags: ["bild"], d: () => {
      const blatt = (x, dreh, inhalt) => {
        const t = (x + 58) / 116;
        const y = -18 + 28 * t * (1 - t);
        const g = `transform="rotate(${dreh} ${x} ${y.toFixed(1)})"`;
        return R(x - 10, y, 20, 26, WEISS, 1, `stroke="${RAND}" stroke-width="1" ${g}`) + inhalt(x, y, g) + R(x - 2, y - 3, 4, 7, HOLZ, 1, g);
      };
      return S("M-58 -18q58 14 116 0", "#9aa5b1", 1.4) + C(-58, -18, 2, DUNKEL) + C(58, -18, 2, DUNKEL) +
        blatt(-40, -5, (x, y, g) => C(x + 4, y + 7, 3.5, "#ffd166", g) + P(`M${x - 7} ${y + 22}v-8l5-5l5 5v8z`, "#ff7a7a", g) + R(x - 4, y + 17, 3, 5, "#8a5734", 0, g) + R(x - 9, y + 22, 18, 2, "#7cc05e", 0, g)) +
        blatt(-14, 4, (x, y, g) => [["#ef5350", 8], ["#ffd166", 6], ["#3a86ff", 4]].map(([f, r]) => P(`M${x - r} ${y + 18}a${r} ${r} 0 0 1 ${2 * r} 0`, "none", `stroke="${f}" stroke-width="2" ${g}`)).join("")) +
        blatt(12, -3, (x, y, g) => C(x, y + 14, 6, "#ff9f43", g) + P(`M${x - 6} ${y + 11}l1-6l4 3z`, "#ff9f43", g) + P(`M${x + 6} ${y + 11}l-1-6l-4 3z`, "#ff9f43", g) + C(x - 2, y + 13, 1, TINTE, g) + C(x + 2, y + 13, 1, TINTE, g) + C(x, y + 15.5, 0.9, "#ff7aa2", g)) +
        blatt(38, 5, (x, y, g) => P(`M${x} ${y + 20}l-6-6a3.5 3.5 0 0 1 6-5a3.5 3.5 0 0 1 6 5z`, "#ff7aa2", g));
    } },
    c_zeichenlampe: { name: "Zeichenlampe", der: "die Zeichenlampe", klein: true, w: 40, h: 40, farbe: "#3a86ff", licht: true, tags: ["lampe"], d: (c) =>
      E(-10, -2.5, 9, 2.5, shade(c, -0.25)) + S("M-10 -4L-15 -24L3 -33", shade(c, -0.15), 2.6) + S("M-12 -7L-16 -22", shade(c, 0.25), 1) +
      C(-15, -24, 2.4, shade(c, -0.3)) +
      P("M0 -34L4 -38L18 -29L6 -17Z", c) + P("M6 -17L18 -29q2 6-5 11q-5 3-7 1z", "#fff6c2") },
    c_planschrank: { name: "Planschrank", der: "der Planschrank", w: 104, h: 58, farbe: "#9aa5b1", flaeche: -58, tags: ["schrank"], d: (c) => {
      let s = R(-52, -58, 104, 52, c, 4);
      [0, 2, 3, 4].forEach((i) => {
        const y = -54 + i * 9.5;
        s += R(-48, y, 96, 8, shade(c, 0.14), 2) + (i === 2 ? "" : R(-8, y + 3, 16, 2.4, DUNKEL, 1.2) + R(-42, y + 2.2, 10, 3.6, WEISS, 1));
      });
      const y = -44.5;
      s += R(-48, y, 96, 8, shade(c, -0.45), 2) + R(-38, y - 2, 74, 7.5, "#3a86ff", 1) +
        S(`M-34 ${y + 0.5}h66M-34 ${y + 3}h66M-24 ${y - 2}v7M-6 ${y - 2}v7M12 ${y - 2}v7`, "#a8d8f8", 0.8) +
        R(-51, y + 5, 102, 8, shade(c, 0.24), 2) + R(-8, y + 8, 16, 2.4, DUNKEL, 1.2) + R(-45, y + 7.2, 10, 3.6, WEISS, 1);
      return s + leg(-48, 6, DUNKEL, 6) + leg(42, 6, DUNKEL, 6);
    } },
    c_3ddrucker: { name: "3D-Drucker", der: "der 3D-Drucker", klein: true, w: 36, h: 40, tags: ["drucker"], d: () =>
      R(-17, -40, 34, 6, "#2d3748", 2) + R(-17, -40, 4, 40, "#2d3748", 1.5) + R(13, -40, 4, 40, "#2d3748", 1.5) + R(-17, -6, 34, 6, "#2d3748", 2) +
      R(-13, -9, 26, 3, METALL, 1) + R(-13, -30, 26, 2, METALL_D, 1) + R(1, -33, 9, 7, "#ff9f43", 1.5) + P("M4 -26h3l-1.5 3z", DUNKEL) +
      E(3, -12, 6, 3, "#ffd166") + C(6.5, -16, 2.8, "#ffd166") + P("M9 -16.5l2.5 0.8-2.5 1z", "#ff9f43") + C(7.2, -16.8, 0.6, TINTE) },
    c_gliederpuppe: { name: "Gliederpuppe", der: "die Gliederpuppe", klein: true, w: 24, h: 40, tags: ["modell"], d: () => {
      const H = "#e8c39e";
      const G = "#c99a6b";
      return E(0, -2, 8, 2, HOLZ_D) + R(-1, -16, 2, 14, HOLZ_D) +
        S("M-2 -16l-2 5.5l1 5.5M2 -16l3 5.5l-1 5.5", H, 3) + C(-4, -10.5, 1.4, G) + C(5, -10.5, 1.4, G) +
        S("M-4 -27l-3 5.5l1 5.5M4 -27l5-4.5l1-5.5", H, 2.6) + C(-7, -21.5, 1.3, G) + C(9, -31.5, 1.3, G) +
        E(0, -22.5, 4, 5.5, H) + E(0, -16.5, 3.5, 2.3, G) + S("M0 -28v-2", H, 2) + E(0, -33.8, 3.3, 4, H);
    } },

    // --- Fitnessraum ------------------------------------------------------------
    c_hantelbank: { name: "Hantelbank", der: "die Hantelbank", w: 124, h: 80, farbe: "#ef5350", tags: ["fitness", "sport"], d: (c) =>
      R(-40, -72, 6, 66, DUNKEL, 2) + R(34, -72, 6, 66, DUNKEL, 2) + R(-50, -6, 26, 6, DUNKEL, 3) + R(24, -6, 26, 6, DUNKEL, 3) +
      R(-42, -62, 10, 4, METALL_D, 1.5) + R(32, -62, 10, 4, METALL_D, 1.5) + R(-62, -66, 124, 4, METALL, 2) +
      R(-60, -80, 8, 32, "#2d3748", 3) + R(-52, -76, 6, 24, "#2d3748", 2) + R(52, -80, 8, 32, "#2d3748", 3) + R(46, -76, 6, 24, "#2d3748", 2) +
      P("M-10 -26h20l6 22h-32z", DUNKEL) + R(-18, -4, 36, 4, DUNKEL, 2) + R(-18, -38, 36, 12, c, 5) + R(-14, -36, 28, 3, shade(c, 0.3), 1.5) },
    c_rudergeraet: { name: "Rudergerät", der: "das Rudergerät", w: 150, h: 56, tags: ["fitness", "sport"], d: () =>
      R(-70, -14, 6, 14, DUNKEL, 2) + R(-74, -3, 14, 3, DUNKEL, 1.5) + R(40, -6, 32, 6, DUNKEL, 3) +
      R(-70, -16, 118, 5, METALL, 2.5) +
      C(56, -26, 18, "#2d3748") + C(56, -26, 13, "#4a5568") + [0, 60, 120].map((a) => R(55, -38, 2, 24, "#2d3748", 1, `transform="rotate(${a} 56 -26)"`)).join("") + C(56, -26, 4, METALL) +
      P("M30 -16l8-18h6l-5 18z", "#3a86ff") + S("M38 -30H20", DUNKEL, 1.2) + R(14, -36, 6, 11, DUNKEL, 3) +
      R(-34, -25, 26, 8, "#ef5350", 4) + R(-28, -17, 14, 2, DUNKEL) +
      S("M58 -44l-8-4", DUNKEL, 3) + R(36, -56, 16, 10, "#2d3748", 2) + R(38, -54, 12, 6, "#7cff9e", 1) },
    c_yogamatte: { name: "Yogamatte", der: "die Yogamatte", art: "flach", w: 100, h: 12, farbe: "#a78bfa", tags: ["matte", "sport"], d: (c) =>
      R(-50, -4, 90, 4, c, 2) + S("M-46 -2h80", shade(c, 0.3), 1, `stroke-dasharray="4 4"`) +
      C(42, -6, 6, c) + C(42, -6, 3.8, shade(c, -0.2)) + C(42, -6, 1.8, c) },
    c_springseil: { name: "Springseil", der: "das Springseil", klein: true, w: 34, h: 24, tags: ["fitness", "sport"], d: () =>
      S("M-12.5 -9q-2 7.5 6 7.5q8 .5 8-4q0-4-5-3q-5 1-3 5q3 3.5 11 .5q6-2 8-6.5", "#ff7a7a", 2) +
      R(-15, -22, 5, 13, "#3a86ff", 2.5) + R(10, -22, 5, 13, "#3a86ff", 2.5) + R(-14, -10, 3, 2, DUNKEL) + R(11, -10, 3, 2, DUNKEL) },
    c_boxsack: { name: "Boxsack", der: "der Boxsack", art: "decke", w: 34, h: 118, farbe: "#ef5350", tags: ["fitness", "sport"], d: (c) =>
      S("M0 1.3v12.7", METALL_D, 2.5) + C(0, 15, 2.5, "none", `stroke="${METALL_D}" stroke-width="1.6"`) + S("M0 17l-11 12M0 17l11 12", METALL_D, 1.8) +
      R(-16, 28, 32, 88, c, 12) + R(-16, 28, 32, 9, shade(c, -0.25), 6) + R(-16, 107, 32, 9, shade(c, -0.25), 6) +
      R(-16, 62, 32, 4, shade(c, -0.18)) + S("M-9 42v58", shade(c, 0.3), 3, `opacity="0.7"`) },
    c_kugelhantel: { name: "Kugelhantel", der: "die Kugelhantel", klein: true, w: 26, h: 28, farbe: "#ff9f43", tags: ["fitness", "sport"], d: (c) =>
      S("M-7 -15v-5q0-6 7-6t7 6v5", "#2d3748", 4) + C(0, -11, 11, c) + E(0, -1.5, 7, 1.5, shade(c, -0.35)) + C(-4.5, -15, 2.5, shade(c, 0.4)) + T(0, -6.5, "8", 8, WEISS) },
    c_spiegelwand: { name: "Spiegelwand", der: "die Spiegelwand", art: "wand", w: 140, h: 96, tags: ["spiegel"], d: () =>
      R(-70, -48, 140, 84, "#cbd5e0", 3) + R(-66, -44, 64, 76, "#e6f6fc", 2) + R(2, -44, 64, 76, "#e6f6fc", 2) +
      S("M-56 -20l18-18M-52 -4l26-26M12 -20l18-18M16 -4l26-26", WEISS, 3, `opacity="0.85"`) +
      R(-62, 36, 3, 6, METALL_D) + R(-1.5, 36, 3, 6, METALL_D) + R(59, 36, 3, 6, METALL_D) + R(-70, 41, 140, 5, HOLZ, 2.5) },
    c_trinkflasche: { name: "Trinkflasche", der: "die Trinkflasche", klein: true, w: 14, h: 34, farbe: "#7cc05e", tags: ["trinken"], d: (c) =>
      R(-6, -26, 12, 26, c, 4) + R(-6, -19, 12, 9, shade(c, 0.45), 1) + P("M0 -18.5q-3 3.5-3 5a3 3 0 0 0 6 0q0-1.5-3-5z", "#3a86ff") +
      R(-4, -30, 8, 5, "#2d3748", 2) + R(-1.5, -34, 3, 5, "#2d3748", 1.5) + R(-4.5, -24, 2, 3, WEISS, 1, `opacity="0.6"`) },
    c_handtuchregal: { name: "Handtuchregal", der: "das Handtuchregal", w: 62, h: 82, flaeche: -82, tags: ["handtuch", "regal"], d: () => {
      const rolle = (x, y, f) => C(x, y, 6, f, f === WEISS ? `stroke="${RAND}" stroke-width="1"` : "") + C(x, y, 3.2, shade(f, -0.12)) + C(x, y, 1.2, shade(f, -0.28));
      const fach = (boden, f) => [-18, -6, 6, 18].map((x) => rolle(x, boden - 6, f)).join("") + [-12, 0, 12].map((x) => rolle(x, boden - 16, f)).join("");
      return R(-31, -82, 4, 82, HOLZ_D, 2) + R(27, -82, 4, 82, HOLZ_D, 2) +
        fach(-56, "#6cc3d5") + fach(-30, "#ff9fb5") + fach(-4, WEISS) +
        [-82, -56, -30, -4].map((y) => R(-31, y, 62, 4, HOLZ, 2)).join("");
    } },
    c_hantelstaender: { name: "Hantelständer", der: "der Hantelständer", w: 84, h: 62, tags: ["fitness", "sport"], d: () => {
      const hantel = (x, y, s, f) => R(x - s, y - 1.5, 2 * s, 3, METALL, 1.5) + R(x - 1.9 * s, y - 0.9 * s, 0.9 * s, 1.8 * s, f, 2) + R(x + s, y - 0.9 * s, 0.9 * s, 1.8 * s, f, 2);
      return S("M-34 -3L-30 -60M34 -3L30 -60", "#2d3748", 4) + R(-42, -5, 18, 5, "#2d3748", 2.5) + R(24, -5, 18, 5, "#2d3748", 2.5) +
        R(-36, -46, 72, 4, "#4a5568", 2) + R(-38, -22, 76, 4, "#4a5568", 2) +
        [[-20, "#ffd166"], [0, "#7cc05e"], [20, "#3a86ff"]].map(([x, f]) => hantel(x, -50.5, 5, f)).join("") +
        [[-15.5, "#ef5350"], [15.5, "#2d3748"]].map(([x, f]) => hantel(x, -28.75, 7.5, f)).join("");
    } },
    c_kraftstation: { name: "Kraftstation", der: "die Kraftstation", w: 104, h: 150, tags: ["fitness", "sport"], d: () =>
      R(-52, -6, 104, 6, "#2d3748", 3) + R(-48, -146, 6, 140, "#4a5568", 2) + R(14, -146, 5, 140, "#4a5568", 2) + R(41, -146, 5, 140, "#4a5568", 2) +
      R(-50, -150, 98, 7, "#4a5568", 3) +
      S("M24 -140V-58M36 -140V-58", METALL, 1.5) + S("M30 -136V-58M-18 -136V-104", "#1a202c", 1.2) +
      C(30, -140, 4, METALL_D) + C(-18, -140, 4, METALL_D) +
      Array.from({ length: 10 }, (_, i) => R(20, -56 + i * 4.8, 20, 4.2, "#2d3748", 1)).join("") + R(38, -38, 6, 2.4, "#ef5350", 1) +
      S("M-41 -96l6-8h34l6 8", METALL_D, 3) + R(-45, -98, 7, 7, "#2d3748", 2.5) + R(2, -98, 7, 7, "#2d3748", 2.5) +
      R(-9, -38, 4, 32, "#4a5568", 2) + R(-8.25, -60, 2.5, 14, "#4a5568", 1) + R(-24, -46, 34, 8, "#ef5350", 4) + R(-21, -66, 28, 7, "#ef5350", 3.5) },
  };

  const RAEUME = {
    cafeteria: ["c_kaffeevollautomat", "c_getraenkekuehlschrank", "c_stehtisch", "c_bistrostuhl", "c_schoggiautomat", "c_abwaschmaschine", "c_tassenregal", "c_znuenitheke", "c_teekanne", "c_tablett", "c_recycling", "toeggelikasten",
      "kaffeeautomat", "tisch", "stuhl", "barhocker", "sofa", "mikrowelle", "spuele", "kaffeetasse", "obstschale", "gipfeli"],
    archiv: ["c_rollregal", "c_archivschachteln", "c_leiter", "c_karteikasten", "c_landkarten", "c_aktenwagen", "c_taschenlampe", "c_zeitungen", "c_lupe", "c_schubladenschrank", "c_thermometer",
      "ordnerregal", "aktenschrank", "pakete", "regal", "tisch", "stuhl", "tischlampe", "buecherstapel"],
    computerraum: ["c_kabelschrank", "c_kontrollpult", "c_router", "c_kabelrolle", "c_tastatur", "c_klimaanlage", "c_bildschirmwand", "c_batterie", "c_roboterarm", "c_kabelsalat", "c_zahlenschloss", "serverschrank",
      "computer", "laptop", "schreibtisch", "buerostuhl", "telefon"],
    atelier: ["c_zeichentisch", "c_farbmuster", "c_zeichentablett", "c_leuchttisch", "c_hausmodell", "c_farbwagen", "c_kamera", "c_bilderleine", "c_zeichenlampe", "c_planschrank", "c_3ddrucker", "c_gliederpuppe",
      "staffelei", "farbtoepfe", "pinnwand", "poster", "hocker", "regal", "computer", "kloetze"],
    fitness: ["c_hantelbank", "c_rudergeraet", "c_yogamatte", "c_springseil", "c_boxsack", "c_kugelhantel", "c_spiegelwand", "c_trinkflasche", "c_handtuchregal", "c_hantelstaender", "c_kraftstation", "laufband",
      "hometrainer", "hantel", "turnmatte", "gymnastikball", "sprossenwand", "wasserspender", "radio", "bank"],
  };

  // Das Bild an der Wand (Bereich -23..23 mal -17..17).
  const MOTIVE = {
    cafeteria: () => E(0, 13, 17, 3.2, "#cbd5e0") + S("M11 1q6-1 6 4t-7 5", "#ef5350", 2.6) + P("M-11 -2h22v5q0 9-11 9t-11-9z", "#ef5350") + E(0, -2, 11, 2.4, "#8a5734") +
      S("M-4 -6q-3-2.5 0-5t0-5M4 -6q-3-2.5 0-5t0-5", "#c9b6a6", 1.8),
    archiv: () => R(8, -13, 10, 28, "#7cc05e", 1.5, `transform="rotate(-12 8 15)"`) +
      [[-19, "#3a86ff"], [-8, "#ffd166"], [3, "#ff7a7a"]].map(([x, f]) => R(x, -13, 10, 28, f, 1.5) + R(x + 2.5, -9, 5, 10, WEISS, 1) + C(x + 5, 8, 2.2, WEISS)).join(""),
    computerraum: () => R(-17, -15, 34, 23, "#2d3748", 3) + R(-14, -12, 28, 17, "#6cc3d5", 1.5) + S("M-10 -7h9M-10 -3h13M-10 1h7", WEISS, 1.6) +
      P("M6 -6v9l2.4-2.3 1.8 3.8 1.6-0.8-1.8-3.8h3.4z", WEISS) + R(-3, 8, 6, 5, METALL_D) + R(-10, 12.5, 20, 3, METALL_D, 1.5),
    atelier: () => P("M-4 -14c-11 0-18 7-17 15c1 8 10 13 20 12c7-1 8-5 5-8c-3-2-2-6 2-6c6 0 10-2 10-6c0-5-8-7-20-7z", "#e8c39e") + C(-12, 6, 2.6, "#fffaf0") +
      C(-12, -4, 3, "#ef5350") + C(-4, -9, 3, "#ffd166") + C(5, -8, 3, "#3a86ff") + C(-2, 4, 3, "#7cc05e") +
      S("M8 15l10-24", HOLZ_D, 2) + P("M16.6 -8l2.4-6l2 0.9-1.4 6z", "#ff7aa2"),
    fitness: () => R(-11, -2, 22, 4, METALL, 2) + R(-17, -10, 6, 20, "#3a86ff", 2) + R(-22, -7, 5, 14, "#3a86ff", 2) + R(11, -10, 6, 20, "#3a86ff", 2) + R(17, -7, 5, 14, "#3a86ff", 2),
  };

  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
