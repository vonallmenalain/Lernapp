/*
 * bau-moebel-buero.js – Die eigenen Dinge der Zimmer Empfang, Grossraumbüro,
 * Einzelbüro, Sitzungszimmer, Druckerraum und WC im Büro (Bauecke).
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten und die Bildmotive an.
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, leg, stern, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE } = M.hilfe;

  const GOLD = "#e8b94f";
  const GLAS = "#e6f6fc";
  const BILDSCHIRM = "#2d3748";
  const rand = (breite = 1.5) => `stroke="${RAND}" stroke-width="${breite}"`;

  const DINGE = {
    // --- Empfang --------------------------------------------------------------
    b_empfangspult: { name: "Empfangspult", der: "das Empfangspult", w: 140, h: 72, farbe: "#5bb39a", flaeche: -72, d: (c) =>
      P("M-66 -64h132v56q0 8-8 8h-116q-8 0-8-8z", c) +
      P("M-66 -64h16v64h-8q-8 0-8-8z", shade(c, -0.14)) + P("M66 -64h-16v64h8q8 0 8-8z", shade(c, -0.14)) +
      R(-66, -64, 132, 7, shade(c, 0.2)) + R(-48, -6, 96, 6, shade(c, -0.3), 2) +
      C(0, -33, 11, WEISS) + C(0, -39, 2.4, c) + R(-2.2, -35, 4.4, 11, c, 1.6) +
      R(-66, -65, 132, 2, shade(c, -0.25)) + R(-70, -72, 140, 8, "#e2c9a6", 4) },
    b_wartestuehle: { name: "Wartestühle", der: "die Wartestühle", w: 112, h: 60, farbe: "#ff9f43", d: (c) =>
      R(-50, -24, 100, 5, METALL_D, 2) + leg(-38.5, 19, METALL_D, 5) + leg(33.5, 19, METALL_D, 5) +
      R(-46, -3, 20, 3, DUNKEL, 1.5) + R(26, -3, 20, 3, DUNKEL, 1.5) +
      [-34, 0, 34].map((x) => R(x - 2, -37, 4, 6, METALL) + R(x - 13, -60, 26, 24, c, 8) + R(x - 9, -56, 18, 5, shade(c, 0.22), 2.5) +
        R(x - 14, -32, 28, 8, shade(c, -0.1), 4)).join("") +
      [-51, -17, 17, 51].map((x) => R(x - 1.5, -44, 3, 20, METALL_D, 1.5) + R(x - 5, -46, 10, 4, DUNKEL, 2)).join("") },
    b_lift: { name: "Lift", der: "der Lift", w: 80, h: 134, d: () =>
      R(-40, -134, 80, 134, "#b8c2cc", 5) + R(-35, -116, 58, 116, DUNKEL, 2) +
      R(-34, -115, 27.5, 115, "#e2e8f0", 1) + R(-5.5, -115, 27.5, 115, "#e2e8f0", 1) +
      S("M-27 -106v88M2 -106v88", WEISS, 2.5, `opacity="0.8"`) +
      R(-24, -130, 36, 10, "#1f2733", 3) + P("M-18 -122l4-5l4 5z", "#7cff9e") + T(2, -121.5, "3", 9, "#ffd166") +
      R(26.5, -74, 10, 22, BILDSCHIRM, 3) + P("M28.5 -66l3-5l3 5z", "#ffd166") + P("M28.5 -60l3 5l3-5z", WEISS) +
      R(-36, -3, 60, 3, METALL_D, 1.5) },
    b_schirmstaender: { name: "Schirmständer", der: "der Schirmständer", w: 34, h: 66, d: () => {
      const schirm = (x, oben, f) => P(`M${x - 5} -20Q${x - 5} ${oben + 12} ${x} ${oben}Q${x + 5} ${oben + 12} ${x + 5} -20z`, f) +
        S(`M${x} -21V${oben + 6}`, shade(f, -0.25), 1.2) + S(`M${x} ${oben}v-6`, DUNKEL, 1.8);
      return schirm(1, -54, "#3a86ff") + S("M1 -60a3.5 3.5 0 0 1 7 0v2", HOLZ_DD, 2.6) +
        schirm(-7, -47, "#ef5350") + S("M-7 -53a3.5 3.5 0 0 1 7 0v2", HOLZ_DD, 2.6) +
        schirm(8, -43, "#ffd166") + S("M8 -49v-3", DUNKEL, 1.8) + C(8, -52.5, 2.4, HOLZ_DD) +
        P("M-13 -22h26l-2 22h-22z", "#4a5568") + R(-12.5, -12, 25, 3, METALL_D) + R(-15, -24, 30, 5, "#2d3748", 2.5);
    } },
    b_firmenschild: { name: "Firmenschild", der: "das Firmenschild", art: "wand", w: 96, h: 40, licht: true, d: () =>
      R(-48, -20, 96, 40, "#2d3748", 6) + R(-45, -17, 90, 34, "#34508f", 4) +
      C(-29, 0, 12, "#ffd166") + E(-29, 3.5, 5.5, 4.5, "#34508f") +
      C(-35, -3, 2.3, "#34508f") + C(-31.5, -7, 2.3, "#34508f") + C(-26.5, -7, 2.3, "#34508f") + C(-23, -3, 2.3, "#34508f") +
      T(12, 6.5, "FIRMA", 17, WEISS) },
    b_infobildschirm: { name: "Infobildschirm", der: "der Infobildschirm", art: "wand", w: 84, h: 52, licht: true, d: () =>
      R(-42, -26, 84, 52, BILDSCHIRM, 5) + R(-38, -22, 76, 40, "#3a86ff", 2) + R(-38, 12, 76, 6, "#2f6fd6") +
      C(-29, -13, 5, "#ffd166") + S("M-29 -21v-2M-29 -3v-2M-37 -13h2M-23 -13h2", "#ffd166", 1.4) +
      T(25, -9, "9:00", 9, WEISS) + T(0, 9, "HALLO", 17, WEISS) +
      [-30, -18, -6, 6, 18].map((x) => R(x, 14, 8, 2, "#a8d8f8", 1)).join("") + C(36, 22, 1.4, "#7cff9e") },
    b_wegweiser: { name: "Wegweiser", der: "der Wegweiser", art: "wand", w: 72, h: 62, d: () =>
      R(-3, -31, 6, 62, METALL_D, 2) +
      P("M-32 -28h56l8 9-8 9h-56z", "#3a86ff") + T(-4, -14.5, "WC", 11, WEISS) +
      P("M32 -9h-56l-8 9 8 9h56z", "#5cbf62") + R(0, -4, 9, 8, WEISS, 2) + S("M9 -2q4 0 3 3t-3 2", WEISS, 1.6) + S("M2.5 -6q1.5-2 0-4M6.5 -6q1.5-2 0-4", WEISS, 1.2) +
      P("M-32 10h56l8 9-8 9h-56z", "#ff9f43") + T(-4, 23.5, "LIFT", 10, WEISS) },
    b_schluesselkasten: { name: "Schlüsselkasten", der: "der Schlüsselkasten", art: "wand", w: 50, h: 44, d: () =>
      R(-25, -22, 50, 44, HOLZ_D, 4) + R(-22, -19, 44, 38, "#f3e6d2", 2) +
      [[-12, -16, "#ef5350"], [12, -16, "#3a86ff"], [-12, 0, "#ffd166"], [0, 0, "#a78bfa"], [12, 0, "#5cbf62"]]
        .map(([x, y, f]) => C(x, y, 1.4, DUNKEL) + C(x, y + 5, 3.8, f) + C(x, y + 5, 1.3, "#f3e6d2") + R(x - 1.3, y + 8, 2.6, 7, GOLD, 1.2) + R(x + 1, y + 10.5, 3.5, 2.2, GOLD, 0.6) + R(x + 1, y + 13, 2.5, 1.8, GOLD, 0.5)).join("") +
      C(0, -16, 1.4, DUNKEL) },
    b_tischglocke: { name: "Tischglocke", der: "die Tischglocke", klein: true, w: 24, h: 22, d: () =>
      R(-12, -5, 24, 5, HOLZ_DD, 2.5) + P("M-10 -5a10 10 0 0 1 20 0z", GOLD) + R(-1.5, -19, 3, 5, METALL_D, 1) + E(0, -19.5, 3.5, 1.6, METALL_D) +
      S("M-6 -8q0-4 3-6", "#fff6c2", 1.6) },
    b_gaestebuch: { name: "Gästebuch", der: "das Gästebuch", klein: true, w: 36, h: 16, d: () =>
      P("M-18 0l2-5h32l2 5z", "#7c5ce6") +
      P("M-16 -4l1-9q7-3 15 0v10q-8-3-16-1z", "#fffaf0") + P("M16 -4l-1-9q-7-3-15 0v10q8-3 16-1z", "#fff3dc") +
      S("M-12 -9.5q4.5-1.5 9 0M-12 -6.5q4.5-1.5 9 0M3 -9.5q4.5-1.5 9 0", "#9aa5b1", 1) + S("M3 -4l11-8", "#3a86ff", 2) + C(3, -4, 1.1, TINTE) },
    b_namensschilder: { name: "Namensschilder", der: "die Namensschilder", klein: true, w: 34, h: 28, d: () =>
      S("M-12 -24q2.5-6 5 0", "#ef5350", 1.4) + S("M7 -24q2.5-6 5 0", "#7cc05e", 1.4) +
      R(-15, -24, 11, 14, WEISS, 1.5, rand(1)) + R(-15, -24, 11, 3, "#ef5350", 1.5) +
      R(4, -24, 11, 14, WEISS, 1.5, rand(1)) + R(4, -24, 11, 3, "#7cc05e", 1.5) +
      S("M-4 -21q4-7 8 0", "#3a86ff", 1.4) + R(-10, -21, 20, 16, WEISS, 2, rand(1)) + R(-10, -21, 20, 4, "#3a86ff", 2) + T(0, -10, "GAST", 4.8, TINTE) +
      R(-17, -6, 34, 6, DUNKEL, 3) },
    b_bonbonglas: { name: "Bonbonglas", der: "das Bonbonglas", klein: true, w: 24, h: 32, d: () =>
      P("M-10 -24h20v20q0 4-4 4h-12q-4 0-4-4z", GLAS, `stroke="#a8ddf0" stroke-width="1.5"`) +
      [[-5, -5, "#ff7a7a"], [2, -5, "#ffd166"], [6, -10, "#7cc05e"], [-2, -11, "#a78bfa"], [-6, -16, "#6cc3d5"], [3, -17, "#ff9f6b"], [-1, -21, "#ff7aa2"]]
        .map(([x, y, f]) => C(x, y, 3.3, f)).join("") +
      S("M-7 -20v12", WEISS, 1.6, `opacity="0.75"`) + R(-9, -28, 18, 5, "#ef5350", 2) + C(0, -29.5, 2.4, "#ef5350") },

    // --- Grossraumbüro ----------------------------------------------------------
    b_doppelpult: { name: "Doppelschreibtisch", der: "der Doppelschreibtisch", w: 150, h: 74, farbe: "#7cc05e", flaeche: -50, d: (c) =>
      R(-62, -74, 124, 26, c, 5) + R(-62, -74, 124, 4, shade(c, -0.15), 3) + R(-1, -72, 2, 22, shade(c, -0.2)) +
      R(-50, -68, 11, 11, "#ffd166", 1.5) + C(-44.5, -67, 1.3, "#ef5350") + R(40, -66, 11, 10, "#ff9fb5", 1.5) + C(45.5, -65, 1.3, "#3a86ff") +
      R(-75, -50, 150, 7, "#e2e8f0", 3) + R(-71, -43, 142, 3, "#cbd5e0", 1.5) +
      leg(-71, 43, METALL_D, 5) + leg(-2.5, 43, METALL_D, 5) + leg(66, 43, METALL_D, 5) +
      R(-75, -3, 13, 3, DUNKEL, 1.5) + R(-6.5, -3, 13, 3, DUNKEL, 1.5) + R(62, -3, 13, 3, DUNKEL, 1.5) },
    b_trennwand: { name: "Trennwand", der: "die Trennwand", w: 74, h: 104, farbe: "#6cc3d5", d: (c) =>
      R(-36, -104, 35, 92, shade(c, -0.2), 8) + R(1, -104, 35, 92, shade(c, -0.2), 8) +
      R(-33, -101, 29, 86, c, 6) + R(4, -101, 29, 86, shade(c, -0.07), 6) +
      R(-3, -90, 6, 5, METALL_D, 1.5) + R(-3, -34, 6, 5, METALL_D, 1.5) +
      R(-27, -90, 15, 12, WEISS, 1, `transform="rotate(-5 -19.5 -84)"`) + C(-19.5, -89, 1.6, "#ef5350") +
      R(11, -72, 14, 13, "#ffd166", 1, `transform="rotate(4 18 -65)"`) + C(18, -71, 1.6, "#3a86ff") +
      leg(-24, 12, METALL_D, 5) + leg(19, 12, METALL_D, 5) + R(-32, -3, 21, 3, DUNKEL, 1.5) + R(11, -3, 21, 3, DUNKEL, 1.5) },
    b_rollcontainer: { name: "Rollcontainer", der: "der Rollcontainer", w: 40, h: 56, farbe: "#ffd166", flaeche: -56, d: (c) =>
      R(-19, -52, 38, 44, "#e2e8f0", 3) + R(-20, -56, 40, 5, "#cbd5e0", 2.5) +
      [[-49, 10], [-37, 10], [-25, 15]].map(([y, h]) => R(-16, y, 32, h, c, 2) + R(-6, y + 3, 12, 2.6, shade(c, -0.35), 1.3)).join("") +
      R(-17, -8, 34, 2.5, METALL_D, 1) + C(-12, -3.5, 3.5, DUNKEL) + C(12, -3.5, 3.5, DUNKEL) },
    b_planungstafel: { name: "Planungstafel", der: "die Planungstafel", w: 98, h: 124, d: () =>
      S("M-36 -58v50M36 -58v50", METALL_D, 4) + S("M-45 -8h18M27 -8h18", DUNKEL, 4) +
      [-44, -28, 28, 44].map((x) => C(x, -3.5, 3.5, DUNKEL)).join("") +
      R(-48, -124, 96, 66, "#cbd5e0", 4) + R(-45, -121, 90, 60, WEISS, 2) + S("M-15 -118v54M15 -118v54", "#cbd5e0", 1.4) +
      R(-42, -118, 24, 4, "#7c5ce6", 1.5) + R(-12, -118, 24, 4, "#ff9f43", 1.5) + R(18, -118, 24, 4, "#5cbf62", 1.5) +
      [[-39, -110, "#ffd166"], [-27, -110, "#ff9fb5"], [-39, -97, "#a8d8f8"], [-27, -97, "#ffd166"], [-39, -84, "#ffd166"],
        [-11, -110, "#ff9fb5"], [1, -110, "#ffd166"], [-11, -97, "#a8d8f8"], [19, -110, "#c5ec9a"], [31, -110, "#c5ec9a"]]
        .map(([x, y, f]) => R(x, y, 10, 10, f, 1)).join("") +
      S("M21 -105l2 2 4-4M33 -105l2 2 4-4", "#2f9e5c", 1.5) +
      R(-40, -58, 80, 3, METALL, 1.5) + R(-22, -61, 12, 3, "#ef5350", 1.5) + R(-6, -61, 12, 3, "#3a86ff", 1.5) },
    b_schliessfaecher: { name: "Schliessfächer", der: "die Schliessfächer", w: 72, h: 112, farbe: "#3a86ff", flaeche: -112, d: (c) =>
      R(-36, -112, 72, 108, shade(c, -0.25), 4) +
      [0, 1, 2].map((r) => [0, 1].map((s) => {
        const x = -33 + s * 34;
        const y = -109 + r * 35;
        return R(x, y, 32, 32, c, 3) + R(x + 4, y + 4, 10, 8, WEISS, 1.5) + T(x + 9, y + 10.5, String(r * 2 + s + 1), 7, TINTE) +
          C(x + 25, y + 15, 2.6, "#ffd166") + R(x + 24.2, y + 15, 1.6, 4, GOLD, 0.5) +
          S(`M${x + 6} ${y + 22}h14M${x + 6} ${y + 26}h14`, shade(c, -0.18), 1.5);
      }).join("")).join("") + leg(-32, 4, DUNKEL, 6) + leg(26, 4, DUNKEL, 6) },
    b_papierkorb: { name: "Papierkorb", der: "der Papierkorb", w: 30, h: 40, d: () =>
      C(-5, -32, 5.5, WEISS, rand(1.2)) + C(5, -33, 5, "#fffaf0", rand(1.2)) + S("M-8 -34l3 2M-4 -36l1 3M3 -36l3 2M7 -32l-2-1", "#cbd5e0", 1) +
      P("M-14 -30h28l-3 30h-22z", DUNKEL) +
      S("M-9 -28l1 26M-3.5 -28l.5 26M2 -28v26M7.5 -28l-.5 26", METALL_D, 1.3) + S("M-13 -19h26M-12 -10h24", METALL_D, 1.3) +
      R(-15, -32, 30, 4, "#2d3748", 2) },
    b_ventilator: { name: "Ventilator", der: "der Ventilator", w: 44, h: 96, d: () =>
      E(0, -3, 16, 4, DUNKEL) + C(7, -4, 1.5, "#7cc05e") + R(-2.5, -60, 5, 57, METALL) + R(-5, -58, 10, 6, METALL_D, 2) +
      C(0, -74, 20, "#e2e8f0") +
      [0, 120, 240].map((a) => E(0, -83, 5.5, 9, "#6cc3d5", `transform="rotate(${a} 0 -74)"`)).join("") +
      C(0, -74, 20, "none", `stroke="${METALL_D}" stroke-width="2"`) + C(0, -74, 12, "none", `stroke="${METALL}" stroke-width="1"`) +
      S("M-20 -74h40M0 -94v40", METALL, 1) + C(0, -74, 4.5, DUNKEL) },
    b_kalender: { name: "Kalender", der: "der Kalender", art: "wand", w: 40, h: 56, d: () =>
      R(-20, -25, 40, 52, WEISS, 3, rand(1.5)) + R(-17, -21, 34, 20, "#a8ddf0", 2) +
      P("M-17 -1L-6 -14L0 -8L7 -18L17 -1Z", "#5cbf62") + P("M4.6 -14.5L7 -18L9.1 -14.5Z", WEISS) + C(-10, -15, 3.2, "#ffd166") +
      [3, 9, 15, 21].map((y) => [-16, -9.5, -3, 3.5, 10].map((x) => R(x, y, 5, 4, "#e2e8f0", 1)).join("")).join("") +
      C(6, 17, 4, "none", `stroke="#ef5350" stroke-width="1.4"`) + R(-11, -28, 3, 6, DUNKEL, 1.5) + R(8, -28, 3, 6, DUNKEL, 1.5) },
    b_kopfhoerer: { name: "Kopfhörer", der: "die Kopfhörer", klein: true, w: 30, h: 34, farbe: "#ef5350", d: (c) =>
      E(0, -2, 9, 2.5, DUNKEL) + R(-1.5, -30, 3, 28, METALL_D, 1.5) +
      S("M-11 -16v-4a11 11 0 0 1 22 0v4", DUNKEL, 3.4) +
      R(-9, -18, 3, 9, shade(c, -0.35), 1.5) + R(6, -18, 3, 9, shade(c, -0.35), 1.5) +
      R(-15, -20, 7, 13, c, 3) + R(8, -20, 7, 13, c, 3) },
    b_stiftebecher: { name: "Stiftebecher", der: "der Stiftebecher", klein: true, w: 22, h: 32, d: () =>
      R(-9, -26, 3, 12, "#7cc05e", 1) + S("M-4 -14v-14", "#ffd166", 3.4) + P("M-5.7 -28l1.7-3.5l1.7 3.5z", "#f2d3a6") + C(-4, -31, 0.7, TINTE) +
      S("M1 -14l2-15", "#3a86ff", 2.6) + S("M5 -14l5-12", "#ef5350", 2.6) +
      R(-9, -16, 18, 16, "#ff9f6b", 3) + R(-9, -12, 18, 3, "#ffc49a") },
    b_ordner: { name: "Ordner", der: "die Ordner", klein: true, w: 34, h: 34, d: () =>
      [[-16, "#3a86ff"], [-5, "#ef5350"], [6, "#5cbf62"]].map(([x, f]) => R(x, -32, 10, 32, f, 2) + R(x + 2, -27, 6, 10, WEISS, 1) + C(x + 5, -8, 2.3, WEISS)).join("") },
    b_bildschirme: { name: "Bildschirme", der: "die Bildschirme", klein: true, w: 46, h: 32, licht: true, d: () =>
      R(-1.5, -17, 3, 10, METALL) + R(-12, -8, 24, 3, METALL_D, 1.5) +
      R(-22, -32, 21, 16, BILDSCHIRM, 2) + R(-20.5, -30.5, 18, 13, "#6cc3d5", 1) +
      R(-18, -21, 3, 3, WEISS) + R(-14, -24, 3, 6, WEISS) + R(-10, -27, 3, 9, "#ffd166") + R(-6, -23, 3, 5, WEISS) +
      R(1, -32, 21, 16, BILDSCHIRM, 2) + R(2.5, -30.5, 18, 13, "#a8d8f8", 1) + S("M5 -27h12M5 -24h8M5 -21h11", WEISS, 1.4) +
      R(-20, -3, 26, 3, "#cbd5e0", 1.5) + R(11, -3.5, 6, 3.5, "#cbd5e0", 1.75) },

    // --- Einzelbüro -------------------------------------------------------------
    b_chefpult: { name: "Chefschreibtisch", der: "der Chefschreibtisch", w: 140, h: 58, farbe: "#8a5734", flaeche: -58, d: (c) =>
      R(-64, -50, 40, 46, c, 3) + R(24, -50, 40, 46, c, 3) + R(-24, -50, 48, 34, shade(c, -0.2)) + R(-19, -46, 38, 24, shade(c, -0.1), 2) +
      [-46, -32, -18].map((y) => R(-60, y, 32, 12, shade(c, 0.12), 2) + C(-44, y + 6, 2, GOLD) + R(28, y, 32, 12, shade(c, 0.12), 2) + C(44, y + 6, 2, GOLD)).join("") +
      R(-66, -6, 132, 6, shade(c, -0.3), 2) + R(-70, -58, 140, 9, shade(c, 0.15), 3) + R(-68, -50, 136, 2, shade(c, -0.25)) },
    b_chefsessel: { name: "Chefsessel", der: "der Chefsessel", w: 56, h: 94, farbe: "#7a3b2e", d: (c) =>
      R(-20, -94, 40, 54, c, 12) + R(-17, -91, 34, 9, shade(c, 0.15), 6) +
      [-79, -67, -55].map((y) => [-9, 0, 9].map((x) => C(x, y, 1.7, shade(c, -0.35))).join("")).join("") +
      R(-3, -32, 6, 20, METALL_D, 2) +
      R(-23, -44, 46, 13, c, 6) + R(-21, -44, 42, 4, shade(c, 0.2), 3) +
      R(-26, -52, 4, 10, METALL_D, 2) + R(22, -52, 4, 10, METALL_D, 2) + R(-28, -58, 9, 7, shade(c, -0.15), 3.5) + R(19, -58, 9, 7, shade(c, -0.15), 3.5) +
      S("M-22 -6l22-7l22 7", DUNKEL, 4) + C(-22, -3.5, 3.5, DUNKEL) + C(22, -3.5, 3.5, DUNKEL) + C(0, -5, 3.5, DUNKEL) },
    b_ledersofa: { name: "Ledersofa", der: "das Ledersofa", w: 122, h: 54, farbe: "#8a4b3b", d: (c) =>
      R(-54, -54, 108, 28, shade(c, -0.12), 8) +
      S("M-42 -47L-35 -38L-28 -47L-21 -38L-14 -47L-7 -38L0 -47L7 -38L14 -47L21 -38L28 -47L35 -38L42 -47", shade(c, -0.25), 1) +
      [-42, -28, -14, 0, 14, 28, 42].map((x) => C(x, -47, 1.6, shade(c, -0.4))).join("") + [-35, -21, -7, 7, 21, 35].map((x) => C(x, -38, 1.6, shade(c, -0.4))).join("") +
      R(-52, -30, 104, 14, c, 6) + R(-50, -30, 100, 4, shade(c, 0.15), 3) + S("M-17 -29v12M17 -29v12", shade(c, -0.22), 1.4) +
      R(-54, -18, 108, 10, shade(c, -0.18), 4) +
      R(-61, -44, 17, 36, shade(c, -0.04), 7) + E(-52.5, -44, 9.5, 6, shade(c, 0.12)) + C(-52.5, -44, 2.6, shade(c, -0.2)) +
      R(44, -44, 17, 36, shade(c, -0.04), 7) + E(52.5, -44, 9.5, 6, shade(c, 0.12)) + C(52.5, -44, 2.6, shade(c, -0.2)) +
      leg(-50, 8, HOLZ_DD, 6) + leg(44, 8, HOLZ_DD, 6) },
    b_tresor: { name: "Tresor", der: "der Tresor", w: 52, h: 60, flaeche: -60, d: () =>
      R(-26, -60, 52, 56, METALL_D, 5) + R(-21, -55, 42, 46, METALL, 3) + R(-21, -55, 42, 3, "#b8c2cc", 2) +
      R(-24, -50, 4, 8, DUNKEL, 1.5) + R(-24, -24, 4, 8, DUNKEL, 1.5) +
      C(-6, -32, 9, DUNKEL) + C(-6, -32, 6.5, "#cbd5e0") +
      [0, 60, 120, 180, 240, 300].map((a) => R(-6.5, -38, 1, 2, DUNKEL, 0, `transform="rotate(${a} -6 -32)"`)).join("") +
      S("M-6 -32v-4", "#ef5350", 1.6) + C(-6, -32, 1.6, DUNKEL) +
      S("M12 -39v14M6 -35.5l12 7M6 -28.5l12-7", DUNKEL, 2.2) + C(12, -32, 2.5, DUNKEL) +
      leg(-23, 4, DUNKEL, 7) + leg(16, 4, DUNKEL, 7) },
    b_bankerlampe: { name: "Schreibtischlampe", der: "die Schreibtischlampe", klein: true, w: 32, h: 28, farbe: "#2f7d4f", licht: true, d: (c) =>
      E(0, -2.5, 10, 2.5, "#c99a2e") + R(-1.5, -17, 3, 15, GOLD, 1) +
      P("M-15 -17q0-10 15-10t15 10z", c) + S("M-10 -20q3-4 8-5", shade(c, 0.35), 1.6) + R(-15, -18, 30, 2.5, GOLD, 1.25) + E(0, -14.5, 10, 1.4, "#fff6c2") +
      S("M8 -15.5v6", GOLD, 0.8) + C(8, -9, 1.1, GOLD) },
    b_diplom: { name: "Diplom", der: "das Diplom", art: "wand", w: 46, h: 36, d: () =>
      R(-23, -18, 46, 36, GOLD, 3) + R(-19, -14, 38, 28, "#fffaf0", 1.5) +
      S("M-9 -8h18", TINTE, 2.2) + S("M-13 -2h26M-13 3h26M-13 8h12", "#9aa5b1", 1.3) +
      P("M7 10l-2 6 3-1 1 2 1-6z", "#c62828") + P("M13 10l2 6-3-1-1 2-1-6z", "#c62828") + C(10, 8, 5, "#ef5350") + stern(10, 8, 3.2, "#ffd166") },
    b_aktenkoffer: { name: "Aktenkoffer", der: "der Aktenkoffer", klein: true, w: 40, h: 30, farbe: "#3a4250", d: (c) =>
      S("M-7 -24v-2.5q0-2 2-2h10q2 0 2 2v2.5", shade(c, -0.3), 2.6) +
      R(-20, -24, 40, 24, c, 3.5) + R(-20, -24, 40, 6, shade(c, 0.15), 3) + R(-20, -19, 40, 1.5, shade(c, -0.3)) +
      R(-13, -21, 6, 5, GOLD, 1.2) + R(7, -21, 6, 5, GOLD, 1.2) + R(-20, -4, 40, 1.5, shade(c, -0.25)) },
    b_stempel: { name: "Stempel", der: "der Stempel", klein: true, w: 34, h: 26, d: () =>
      R(1, -6, 16, 6, "#4a5568", 2) + R(3, -7.5, 12, 2.5, "#ef5350", 1) +
      R(-16, -12, 15, 8, HOLZ, 2) + R(-15, -4, 13, 4, "#ef5350", 1) + R(-10.5, -17, 4, 6, HOLZ_D, 1) + C(-8.5, -21, 4.5, HOLZ_D) + C(-10, -22.5, 1.4, shade(HOLZ_D, 0.3)) },
    b_bilderrahmen: { name: "Bilderrahmen", der: "der Bilderrahmen", klein: true, w: 22, h: 28, d: () =>
      S("M4 -20l6 20", HOLZ_DD, 2) + R(-10, -27, 20, 26, HOLZ, 2.5) + R(-7, -24, 14, 20, "#cfeaff", 1) +
      P("M-6.5 -4q0-6 3.5-6.5q3.5 .5 3.5 6.5z", "#e8763a") + C(-3, -14, 2.8, "#e8763a") + P("M-5.5 -16l1-3.5 2 2.5zM-0.5 -16l-1-3.5-2 2.5z", "#e8763a") +
      P("M0.5 -4q0-5 3-5.5q3 .5 3 5.5z", "#9a6b46") + C(3.5, -12, 2.4, "#9a6b46") + C(1.6, -14.2, 1, "#9a6b46") + C(5.4, -14.2, 1, "#9a6b46") },
    b_tischschild: { name: "Tischschild", der: "das Tischschild", klein: true, w: 34, h: 14, d: () =>
      P("M-17 0l3-12h28l3 12z", "#2d3748") + R(-14, -14, 28, 2.5, "#4a5568", 1.2) + T(0, -3, "CHEF", 8.5, "#ffd166") },
    b_pokal: { name: "Pokal", der: "der Pokal", klein: true, w: 26, h: 34, d: () =>
      R(-9, -6, 18, 6, HOLZ_DD, 1.5) + R(-6, -9, 12, 3, GOLD, 1) + R(-1.5, -16, 3, 7, GOLD) +
      S("M-8 -29q-7 0-6 6q1 4 7 4M8 -29q7 0 6 6q-1 4-7 4", GOLD, 2.2) +
      P("M-9 -32h18q0 14-9 16q-9-2-9-16z", "#ffd166") + E(0, -32, 9, 1.8, GOLD) + stern(0, -24, 3.6, "#fff6c2") },

    // --- Sitzungszimmer -----------------------------------------------------------
    b_sitzungsstuhl: { name: "Sitzungsstuhl", der: "der Sitzungsstuhl", w: 40, h: 66, farbe: "#ff7a59", d: (c) =>
      S("M-15.5 -60L-12 -32H11Q16 -32 16 -27V-7Q16 -2 11 -2H-17", METALL, 3.5) +
      R(-16.5, -64, 10, 30, c, 5, `transform="rotate(-7 -11.5 -36)"`) + R(-14.5, -61, 3.5, 22, shade(c, 0.2), 1.75, `transform="rotate(-7 -11.5 -36)"`) +
      R(-18, -39, 35, 9, c, 4.5) + R(-16, -39, 31, 3, shade(c, 0.2), 1.5) },
    b_beamer: { name: "Beamer", der: "der Beamer", art: "decke", w: 56, h: 44, licht: true, d: () =>
      R(-10, 0, 20, 4, METALL_D, 2) + R(-2, 4, 4, 16, METALL) + R(-14, 19, 28, 4, METALL_D, 2) +
      P("M21 28l7-6v20l-7-6z", "#fff6c2", `opacity="0.8"`) +
      R(-26, 23, 50, 19, "#e2e8f0", 7) + S("M-20 29h16M-20 33h16", "#cbd5e0", 1.6) +
      C(12, 32, 8, "#4a5568") + C(12, 32, 5, "#a8d8f8") + C(13.5, 30.5, 1.5, WEISS) + C(-20, 38, 1.6, "#7cff9e") },
    b_leinwand: { name: "Leinwand", der: "die Leinwand", art: "wand", w: 124, h: 94, licht: true, d: () =>
      R(-56, -38, 112, 76, "#2d3748", 1) + R(-53, -35, 106, 68, "#fbf8f2") +
      R(-44, -29, 40, 5, "#9aa5b1", 2.5) +
      [[-44, 18, "#3a86ff"], [-32, 26, "#5cbf62"], [-20, 34, "#ffd166"], [-8, 44, "#ef5350"]].map(([x, h, f]) => R(x, 27 - h, 9, h, f, 1.5)).join("") +
      S("M-47 27.5h52", "#9aa5b1", 1.2) +
      C(29, 2, 17, "#6cc3d5") + P("M29 2V-15A17 17 0 0 1 45.2 7.3Z", "#ffd166") + P("M29 2L45.2 7.3A17 17 0 0 1 23.2 18Z", "#ff7aa2") +
      R(-62, -47, 124, 9, "#e2e8f0", 4.5) + R(-62, -47, 5, 9, METALL_D, 2) + R(57, -47, 5, 9, METALL_D, 2) +
      R(-56, 37, 112, 4, "#2d3748", 2) + S("M0 41v3", DUNKEL, 1.4) + C(0, 45, 1.8, DUNKEL) },
    b_flipchart: { name: "Flipchart", der: "das Flipchart", w: 60, h: 118, d: () =>
      S("M-14 -46l-9 46M14 -46l9 46M0 -46v42", METALL_D, 3) +
      P("M-22 -108q22-12 44 0z", "#ece6da") + R(-24, -106, 48, 60, "#cbd5e0", 3) + R(-22, -104, 44, 56, WEISS, 1, rand(1)) + R(-25, -110, 50, 6, DUNKEL, 3) +
      C(-9, -88, 7, "none", `stroke="#3a86ff" stroke-width="1.6"`) + C(-11.5, -90, 1, "#3a86ff") + C(-6.5, -90, 1, "#3a86ff") + S("M-12 -86q3 3 6 0", "#3a86ff", 1.4) +
      S("M4 -93l2 2 4-4M4 -84l2 2 4-4", "#2f9e5c", 1.8) + S("M12 -91h6M12 -82h6", "#9aa5b1", 1.6) +
      S("M-16 -56l8-6 6 4 12-12", "#ef5350", 1.8) + P("M11 -71l-6 1 4.5 4.5z", "#ef5350") +
      R(-24, -47, 48, 3, METALL, 1.5) + R(-16, -50, 9, 3, "#ef5350", 1.5) + R(-5, -50, 9, 3, "#3a86ff", 1.5) },
    b_rednerpult: { name: "Rednerpult", der: "das Rednerpult", w: 58, h: 102, farbe: "#a46c43", d: (c) =>
      S("M14 -84q3-10-6-15", DUNKEL, 2) + E(6, -100, 4, 2.4, "#2d3748", `transform="rotate(-25 6 -100)"`) +
      P("M-27 -78l4-8h46l4 8z", shade(c, 0.22)) + R(-28, -79, 56, 5, shade(c, -0.12), 2) +
      P("M-24 -74h48l-6 68h-36z", c) + P("M-10 -74h20l-3 68h-14z", shade(c, 0.07)) + C(0, -50, 9, shade(c, 0.25)) + stern(0, -50, 6, "#ffd166") +
      R(-26, -6, 52, 6, shade(c, -0.3), 2) },
    b_mikrofon: { name: "Mikrofon", der: "das Mikrofon", klein: true, w: 24, h: 33, d: () =>
      R(-12, -5, 18, 5, "#2d3748", 2.5) + C(2, -2.5, 1.2, "#ef5350") + R(-4, -18, 2, 13, METALL_D) +
      S("M-4 -16l7-8", "#2d3748", 3.6) + C(6, -27, 5.5, METALL) + S("M2 -29h8M2 -25.5h8M4 -31.5v9M8 -31.5v9", METALL_D, 0.8) },
    b_wasserkrug: { name: "Wasserkrug", der: "der Wasserkrug", klein: true, w: 40, h: 30, d: () => {
      const krug = "M-14 -26H2Q4 -14 3 -2Q3 0 1 0H-13Q-15 0 -15 -2Q-16 -14 -14 -26Z";
      return S("M2 -22q9 0 9 8q0 6-8 7", "#a8ddf0", 2.6) + P("M-14 -26l-5-2.5 1.5 3.5 3.5 3z", GLAS, `stroke="#a8ddf0" stroke-width="1.2"`) +
        P(krug, GLAS) + P("M-15.2 -16H3.6Q4 -8 3 -2Q3 0 1 0H-13Q-15 0 -15 -2Q-15.6 -9 -15.2 -16Z", "#a8d8f8", `opacity="0.85"`) +
        R(-11, -15, 5, 5, WEISS, 1, `opacity="0.75"`) + R(-4, -13, 5, 5, WEISS, 1, `opacity="0.75"`) + C(-5, -18, 3.4, "#ffd166") + C(-5, -18, 2.3, "#fff1b8") +
        P(krug, "none", `stroke="#a8ddf0" stroke-width="1.4"`) + S("M-11.5 -22q-1 7 0 14", WEISS, 1.5, `opacity="0.85"`) +
        P("M12 -14h6l-.8 14h-4.4z", GLAS, `stroke="#a8ddf0" stroke-width="1.2"`) + R(12.9, -8, 4.2, 7, "#a8d8f8", 0.5);
    } },
    b_kaffeekanne: { name: "Kaffeekanne", der: "die Kaffeekanne", klein: true, w: 30, h: 30, farbe: "#9aa5b1", d: (c) =>
      S("M6 -19q7 0 7 6v2q0 5-7 5", "#2d3748", 2.6) +
      R(-10, -22, 16, 20, c, 4) + R(-10, -11, 16, 3, shade(c, -0.25)) + R(-7, -19, 2.5, 13, shade(c, 0.35), 1.2) +
      P("M-10 -22q0-5 8-5t8 5z", "#2d3748") + R(-4, -30, 4, 3, "#2d3748", 1.5) + P("M-10 -21l-4-2.5v5l4 1z", "#2d3748") +
      R(-11, -3, 18, 3, "#2d3748", 1.5) },
    b_guetzli: { name: "Guetzli", der: "die Guetzli", klein: true, w: 34, h: 16, d: () =>
      C(0, -10, 6, "#8a5734") + C(-2, -12, 1, "#fff1b8") + C(2, -9, 1, "#fff1b8") +
      C(-8, -8, 5.5, "#d99a55") + C(-10, -9, 1, "#5b3a29") + C(-6, -6, 1, "#5b3a29") + C(-8, -11.5, 0.9, "#5b3a29") +
      C(8, -8, 5.5, "#f2d38a") + C(8, -8, 2, "#ef5350") +
      E(0, -3, 17, 3, WEISS, rand(1.5)) },
    b_filzstifte: { name: "Filzstifte", der: "die Filzstifte", klein: true, w: 30, h: 24, d: () =>
      [[-9, "#ef5350", -23], [-3, "#3a86ff", -21], [3, "#5cbf62", -23], [9, "#2d3748", -20]]
        .map(([x, f, y]) => R(x - 2.8, y, 5.6, -y - 4, WEISS, 2, rand(1)) + R(x - 2.8, y, 5.6, 6, f, 2) + R(x - 2.8, y + 8, 5.6, 2, f)).join("") +
      R(-14, -9, 28, 9, METALL_D, 2.5) + R(-14, -9, 28, 2.5, METALL, 1.25) },
    b_notizblock: { name: "Notizblock", der: "der Notizblock", klein: true, w: 28, h: 28, d: () =>
      R(-12, -25, 20, 25, "#fff1b8", 2) + S("M-9 -17h14M-9 -13h14M-9 -9h10M-9 -5h12", "#e8b94f", 1.1) +
      [-9, -5, -1, 3].map((x) => C(x + 1, -25, 1.6, "none", `stroke="${DUNKEL}" stroke-width="1.2"`)).join("") +
      S("M12 0v-20", "#ffd166", 3) + P("M10.5 -20l1.5-4.5 1.5 4.5z", "#f2d3a6") + R(10.5, -2, 3, 2, "#ff9fb5", 0.5) },

    // --- Druckerraum ------------------------------------------------------------
    b_grosskopierer: { name: "Grosskopierer", der: "der Grosskopierer", w: 120, h: 112, d: () =>
      R(36, -82, 20, 72, "#cbd5e0", 4) + R(50, -70, 10, 4, WEISS, 1, rand(1)) + R(52, -66, 8, 3, METALL, 1.5) + R(50, -50, 10, 4, WEISS, 1, rand(1)) + R(52, -46, 8, 3, METALL, 1.5) +
      P("M-46 -66l-12 6v3l12-3z", "#cbd5e0") +
      R(-46, -92, 82, 88, "#e2e8f0", 6) + R(-40, -84, 60, 6, "#cbd5e0", 2) + R(-34, -88, 30, 4, WEISS, 1, rand(1)) +
      [-72, -56, -40, -24].map((y) => R(-42, y, 74, 13, "#f1f5f9", 2) + R(-14, y + 5, 20, 3, METALL_D, 1.5) + R(22, y + 4, 6, 5, "#5cbf62", 1)).join("") +
      R(-48, -100, 86, 10, "#cbd5e0", 4) + P("M-42 -100l4-7h40l4 7z", "#f1f5f9") + P("M-36 -106l2-4h30l2 4z", WEISS, rand(1)) +
      R(14, -106, 22, 12, BILDSCHIRM, 3) + R(16, -104, 18, 8, "#6cc3d5", 1.5) +
      R(-44, -6, 98, 6, DUNKEL, 2) },
    b_plakatdrucker: { name: "Plakatdrucker", der: "der Plakatdrucker", w: 130, h: 92, d: () =>
      S("M-52 -66v58M52 -66v58", METALL_D, 4) + S("M-52 -34h104", METALL, 2.5) + S("M-60 -6h16M44 -6h16", DUNKEL, 4) +
      [-58, -46, 46, 58].map((x) => C(x, -3, 3, DUNKEL)).join("") +
      R(-62, -90, 124, 24, DUNKEL, 8) + R(-58, -90, 116, 5, METALL_D, 3) +
      [[-54, "#3cc8c8"], [-48, "#ff6fa5"], [-42, "#ffd166"], [-36, "#2d3748"]].map(([x, f]) => R(x, -84, 4, 9, f, 1)).join("") +
      R(34, -86, 22, 11, "#2d3748", 2) + R(36, -84, 11, 7, "#7cff9e", 1) + C(51.5, -80.5, 1.8, "#ffd166") + R(-50, -68, 100, 3, "#1a202c", 1.5) +
      P("M-44 -66h88v32q-44 10-88 0z", WEISS, rand(1)) + R(-40, -62, 80, 26, "#cfeaff") +
      P("M-40 -36l18-14 10 7 14-13 16 12 10-6 12 8v6h-80z", "#5cbf62") + C(26, -54, 5, "#ffd166") },
    b_schredder: { name: "Schredder", der: "der Schredder", w: 40, h: 66, d: () =>
      R(-9, -66, 18, 10, WEISS, 1, rand(1)) + S("M-6 -62.5h12M-6 -59.5h9", "#9aa5b1", 1) +
      R(-18, -48, 36, 44, DUNKEL, 4) + R(-12, -42, 24, 28, METALL, 3) +
      S("M-9 -16v-14M-6 -16v-18M-3 -16v-12M0 -16v-17M3 -16v-13M6 -16v-16M9 -16v-11", WEISS, 1.3) +
      R(-20, -58, 40, 11, "#2d3748", 4) + R(-13, -58, 26, 2.5, "#1a202c", 1) + C(14, -52.5, 1.6, "#7cff9e") +
      C(-13, -3, 3, DUNKEL) + C(13, -3, 3, DUNKEL) },
    b_papierregal: { name: "Papierregal", der: "das Papierregal", w: 84, h: 104, farbe: "#9aa5b1", flaeche: -104, d: (c) => {
      const ries = (x, y, f) => R(x, y, 22, 8, WEISS, 1, rand(0.8)) + R(x, y + 3, 22, 2.5, f);
      const bunt = ["#ff9fb5", "#ffd166", "#c5ec9a", "#a8d8f8", "#c9b6ff", "#ffb88a"];
      return R(-42, -104, 5, 104, shade(c, -0.2), 2) + R(37, -104, 5, 104, shade(c, -0.2), 2) +
        ries(-34, -80, "#3a86ff") + ries(-34, -88, "#3a86ff") + ries(-34, -96, "#3a86ff") + ries(-8, -80, "#5cbf62") + ries(-8, -88, "#5cbf62") + ries(16, -80, "#ff9f43") +
        Array.from({ length: 9 }, (_, i) => R(-34, -43 - i * 2.6, 28, 2.6, bunt[i % 6])).join("") +
        Array.from({ length: 7 }, (_, i) => R(0, -43 - i * 2.6, 28, 2.6, bunt[(i + 3) % 6])).join("") +
        R(-34, -30, 30, 22, "#d9a066", 2) + R(-28, -24, 12, 7, WEISS, 1) + R(2, -26, 32, 18, "#c98d55", 2) + R(2, -21, 32, 3, "#b9773a") +
        [-104, -72, -40, -8].map((y) => R(-42, y, 84, 5, c, 2)).join("");
    } },
    b_postwagen: { name: "Postwagen", der: "der Postwagen", w: 72, h: 74, d: () =>
      S("M-30 -66v58M30 -42v34", METALL_D, 3) + R(-36, -74, 12, 6, DUNKEL, 3) +
      R(-20, -64, 12, 9, WEISS, 1, rand(1)) + R(-6, -66, 12, 10, "#fff1b8", 1) + R(8, -63, 11, 8, WEISS, 1, rand(1)) + R(1.5, -65, 3, 3.5, "#ef5350", 0.5) +
      R(-24, -58, 46, 16, "#ffcc00", 3) + R(-24, -58, 46, 4, "#e6b800", 2) +
      R(-32, -42, 64, 4, METALL, 2) + R(-22, -30, 24, 16, "#d9a066", 2) + R(-12, -30, 4, 16, "#b9773a") + R(6, -26, 18, 12, "#c98d55", 2) +
      R(-32, -14, 64, 4, METALL, 2) + C(-24, -5, 5, DUNKEL) + C(24, -5, 5, DUNKEL) + C(-24, -5, 1.8, METALL) + C(24, -5, 1.8, METALL) },
    b_altpapier: { name: "Altpapier", der: "das Altpapier", w: 56, h: 38, d: () =>
      R(-26, -17, 52, 17, "#f4f1ea", 2, `stroke="#cbd5e0" stroke-width="1.2"`) + S("M-24 -12.5h48M-24 -8.5h48M-24 -4.5h48", "#d6d0c4", 1) +
      S("M0 -17v17", "#c4904f", 2) +
      R(-20, -33, 44, 16, "#fbf8f2", 2, `stroke="#cbd5e0" stroke-width="1.2"`) + R(-15, -29, 14, 3, TINTE, 1) + S("M-15 -24h14M-15 -21h11", "#9aa5b1", 1) + R(8, -29, 12, 8, METALL, 1) +
      S("M3 -33v16", "#c4904f", 2) + P("M3 -33q-5-5-6 0q1 2 6 0z", "#c4904f") + P("M3 -33q5-5 6 0q-1 2-6 0z", "#c4904f") },
    b_postfaecher: { name: "Postfächer", der: "die Postfächer", art: "wand", w: 80, h: 60, d: () =>
      R(-40, -30, 80, 60, HOLZ_D, 4) +
      [0, 1, 2].map((r) => [0, 1, 2, 3].map((s) => {
        const x = -36 + s * 18.5;
        const y = -26 + r * 18.5;
        const brief = [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1][r * 4 + s];
        const f = ["#ffffff", "#fff1b8", "#a8d8f8", "#ffb3c7"][(r + s) % 4];
        return R(x, y, 16.5, 15, "#5b3a29", 1.5) + (brief ? R(x + 2, y + 5, 12.5, 10, f, 1) + S(`M${x + 2} ${y + 5}l6.25 4 6.25-4`, "#c9b6a0", 0.8) : "") +
          R(x + 4, y + 15.6, 8.5, 2.2, "#fff1b8", 0.5);
      }).join("")).join("") },
    b_feuerloescher: { name: "Feuerlöscher", der: "der Feuerlöscher", art: "wand", w: 38, h: 56, d: () =>
      R(-9, -14, 18, 4, METALL_D, 1.5) + R(-9, -20, 18, 44, "#ef5350", 7) + R(-6, -15, 3, 32, "#ff8a80", 1.5) +
      R(-6, -2, 12, 12, WEISS, 1.5) + P("M0 8.5q-4-1-4-4.5q0-3 2.5-5q0 2.5 1.5 3q0-3 2.5-5q2 3 2 7q0 4.5-2 4.5z", "#ff9f43") +
      R(-4, -26, 8, 6, "#2d3748", 1.5) + P("M-3 -26l13-2.5v2.5l-13 2.5z", "#2d3748") + C(-6.5, -24, 2, "none", `stroke="#ffd166" stroke-width="1.2"`) +
      S("M4 -24q12 2 12 16v20", "#2d3748", 2.4) + R(13.8, 12, 4.4, 8, "#2d3748", 1.5) },
    b_papierstapel: { name: "Papierstapel", der: "der Papierstapel", klein: true, w: 34, h: 22, d: () =>
      R(-16, -8, 32, 8, WEISS, 1, rand(1)) + R(-16, -6, 32, 3, "#3a86ff") +
      R(-15, -11, 30, 2.6, WEISS, 0.5, `${rand(0.8)} transform="rotate(-3 0 -10)"`) + R(-14, -13.6, 30, 2.6, WEISS, 0.5, `${rand(0.8)} transform="rotate(2.5 0 -12)"`) +
      P("M-15 -15l3-6h24l3 6z", WEISS, rand(0.8)) + S("M-8 -19h14M-9.5 -17h17", "#9aa5b1", 0.8) },
    b_heftmaschine: { name: "Heftmaschine", der: "die Heftmaschine", klein: true, w: 30, h: 14, farbe: "#ef5350", d: (c) =>
      R(-15, -3.5, 30, 3.5, "#2d3748", 1.75) + R(8, -4.5, 6, 1.5, METALL, 0.7) +
      R(-12, -6, 23, 1.6, METALL, 0.8) + P("M-14 -5v-4q0-4 4-4h17q7 0 7 4v2q0 2-2 2z", c) + S("M-8 -11h12", shade(c, 0.3), 1.4) + C(-11, -7, 1.5, METALL_D) },
    b_locher: { name: "Locher", der: "der Locher", klein: true, w: 30, h: 18, d: () =>
      C(-13, -1.5, 1.6, "#ffd166") + C(12.5, -1.5, 1.6, "#ff9fb5") + C(15, -4, 1.3, "#a8d8f8") +
      R(-11, -6, 22, 6, "#4a5568", 2) + R(-8, -11, 5, 6, METALL_D, 1) + R(3, -11, 5, 6, METALL_D, 1) +
      P("M-12 -11q0-6 6-6h12q6 0 6 6z", "#3a86ff") + S("M-6 -14.5h12", "#8ab8ff", 1.4) },
    b_couverts: { name: "Couverts", der: "die Couverts", klein: true, w: 32, h: 22, d: () =>
      R(-14, -20, 22, 15, "#fff1b8", 1.5, `transform="rotate(-8 -3 -12)"`) + S("M-14 -20l11 8 11-8", "#e8b94f", 1, `transform="rotate(-8 -3 -12)"`) +
      R(-12, -16, 26, 16, WEISS, 1.5, rand(1)) + S("M-12 -16l13 9 13-9", RAND, 1.2) + R(8, -14, 4, 5, "#ef5350", 0.5) },

    // --- WC -------------------------------------------------------------------
    b_pissoir: { name: "Pissoir", der: "das Pissoir", w: 36, h: 78, d: () =>
      R(-2, -78, 4, 18, METALL, 2) + R(-6, -74, 12, 5, METALL_D, 2.5) +
      R(-2.5, -24, 5, 20, METALL, 2) + R(-7, -4, 14, 4, METALL_D, 2) +
      P("M-14 -62h28v28q0 12-14 14q-14-2-14-14z", WEISS, rand(2)) + P("M-9 -56h18v20q0 9-9 10q-9-1-9-10z", GLAS) + E(0, -30, 3, 1.2, "#cbd5e0") },
    b_wckabine: { name: "WC-Kabine", der: "die WC-Kabine", w: 80, h: 140, farbe: "#6cc3d5", d: (c) =>
      leg(-38, 14, METALL_D, 4) + leg(34, 14, METALL_D, 4) +
      R(-40, -136, 7, 124, shade(c, -0.18), 2) + R(33, -136, 7, 124, shade(c, -0.18), 2) + R(-40, -140, 80, 5, METALL, 2.5) +
      R(-32, -130, 64, 116, c, 3) + R(-28, -126, 4, 108, shade(c, 0.18), 2) +
      R(-11, -112, 22, 14, WEISS, 3) + T(0, -101, "WC", 11, "#34508f") +
      C(22, -78, 4, WEISS) + C(22, -78, 2.8, "#5cbf62") + R(13, -68, 9, 3, METALL_D, 1.5) +
      R(-33, -118, 2.5, 7, METALL_D, 1) + R(-33, -34, 2.5, 7, METALL_D, 1) },
    b_waschtisch: { name: "Waschtisch", der: "der Waschtisch", w: 124, h: 70, flaeche: -56, fx: [-60, 60], d: () =>
      leg(-56, 48, METALL_D, 4) + leg(52, 48, METALL_D, 4) +
      R(-32.5, -40, 5, 12, METALL, 2) + C(-30, -27, 4, METALL) + R(27.5, -40, 5, 12, METALL, 2) + C(30, -27, 4, METALL) +
      P("M-46 -50h32q0 12-16 12t-16-12z", WEISS, rand(1.5)) + P("M14 -50h32q0 12-16 12t-16-12z", WEISS, rand(1.5)) +
      R(-62, -56, 124, 8, "#f1f5f9", 3, rand(1.5)) +
      S("M-38 -56v-12h8", METALL, 3.5) + S("M22 -56v-12h8", METALL, 3.5) + R(-41, -58, 6, 3, METALL_D, 1.5) + R(19, -58, 6, 3, METALL_D, 1.5) },
    b_putzwagen: { name: "Putzwagen", der: "der Putzwagen", w: 86, h: 94, farbe: "#3a86ff", d: (c) =>
      S("M24 -36l6-56", HOLZ, 3) +
      R(-40, -74, 5, 62, c, 2.5) + R(-43, -78, 9, 6, DUNKEL, 3) + R(-40, -16, 80, 6, c, 3) +
      R(-34, -56, 30, 3, DUNKEL, 1.5) + P("M-33 -53h28v30q-14 8-28 0z", METALL) + S("M-26 -47q4 6 0 14", "#b8c2cc", 1.4) +
      R(-40, -58, 44, 4, c, 2) +
      R(-34, -72, 9, 14, "#5cbf62", 2.5) + P("M-33 -72h7v-3h-3l-4 2z", WEISS) + R(-20, -70, 9, 12, "#ff9fb5", 2.5) + R(-18, -73, 5, 3, WEISS, 1) +
      P("M14 -44q3-6 6-2q3-6 6-1q3-5 6 1z", "#efe9dc") + P("M8 -40h30l-3 24h-24z", "#ffd166") + R(6, -42, 34, 4, GOLD, 2) +
      C(-32, -5, 5, DUNKEL) + C(32, -5, 5, DUNKEL) + C(-32, -5, 1.8, METALL) + C(32, -5, 1.8, METALL) },
    b_warnschild: { name: "Warnschild", der: "das Warnschild", w: 40, h: 64, d: () =>
      P("M9 -60l11 58h-5l-9-54z", "#e8b94f") + P("M-11 -60h22l9 58h-40z", "#ffd166") + R(-8, -64, 16, 5, GOLD, 2.5) +
      C(5, -46, 4, TINTE) + S("M3 -41l-6 12", TINTE, 4) + S("M1 -37l-9-3M1 -37l8 3", TINTE, 2.6) + S("M-3 -29l-9 4M-3 -29l7 6", TINTE, 2.6) +
      S("M-13 -15q3-3 6 0t6 0t6 0t6 0", TINTE, 1.8) },
    b_abfallkuebel: { name: "Abfallkübel", der: "der Abfallkübel", w: 30, h: 42, d: () =>
      P("M-13 -34h26l-1.5 30h-23z", "#cbd5e0") + R(-9, -30, 3, 24, "#e2e8f0", 1.5) + R(-13, -5, 26, 5, METALL_D, 2) +
      P("M-6 -3h12l2 3h-16z", DUNKEL) + P("M-14 -34q0-8 14-8t14 8z", METALL) + R(-14.5, -36, 29, 3, METALL_D, 1.5) },
    b_wcbuerste: { name: "WC-Bürste", der: "die WC-Bürste", w: 18, h: 40, d: () =>
      R(-1.5, -36, 3, 22, "#6cc3d5", 1.5) + C(0, -36, 2.6, "#6cc3d5") + E(0, -18.5, 5.5, 3.5, METALL) + S("M-3 -19l-1-3M0 -19.5v-3.5M3 -19l1-3", METALL_D, 1) +
      P("M-7 -17h14l-1.5 17h-11z", "#e2e8f0", `stroke="#b8c2cc" stroke-width="1.5"`) + R(-8, -19, 16, 3, "#cbd5e0", 1.5) },
    b_seifenspender: { name: "Seifenspender", der: "der Seifenspender", art: "wand", w: 22, h: 36, d: () =>
      R(-10, -17, 20, 24, WEISS, 4, rand(1.5)) + R(-6, -13, 12, 10, "#ff9fb5", 2) + R(-6, 3, 12, 4, "#cbd5e0", 2) + R(-1.5, 7, 3, 3, METALL_D, 1) +
      P("M0 10q-2.5 3.5-2.5 5a2.5 2.5 0 0 0 5 0q0-1.5-2.5-5z", "#ff9fb5") },
    b_handtuchspender: { name: "Handtuchspender", der: "der Handtuchspender", art: "wand", w: 40, h: 46, d: () =>
      R(-18, -23, 36, 32, WEISS, 5, rand(1.5)) + S("M-14 -14h28", RAND, 1.4) + R(-4, -19, 8, 3, "#cbd5e0", 1.5) + R(-18, -2, 36, 3, "#6cc3d5") +
      R(-10, 6, 20, 3, METALL, 1.5) + P("M-8 8h16l-1 13h-14z", "#f4f1ea", rand(1)) + S("M-7 15h14", RAND, 1) },
    b_haendetrockner: { name: "Händetrockner", der: "der Händetrockner", art: "wand", w: 40, h: 42, d: () =>
      R(-18, -21, 36, 24, "#e2e8f0", 9) + R(-14, -17, 28, 16, "#cbd5e0", 6) + C(10, -9, 1.6, "#ef5350") + R(-8, 3, 16, 4, METALL_D, 2) +
      S("M-6 10q2 2.5 0 5t0 5M0 10q2 2.5 0 5t0 5M6 10q2 2.5 0 5t0 5", "#ff9f43", 1.6) },
    b_wcschild: { name: "WC-Schild", der: "das WC-Schild", art: "wand", w: 46, h: 32, d: () =>
      R(-23, -16, 46, 32, "#34508f", 5) + S("M0 -10v20", WEISS, 1.4, `opacity="0.7"`) +
      C(-11, -8, 3, WEISS) + R(-14.5, -4, 7, 10, WEISS, 2.5) + R(-14, 4, 3, 8, WEISS, 1.2) + R(-10.5, 4, 3, 8, WEISS, 1.2) +
      C(11, -8, 3, WEISS) + P("M11 -4.5l6 10.5h-12z", WEISS) + R(8, 5, 2.6, 7, WEISS, 1.2) + R(11.4, 5, 2.6, 7, WEISS, 1.2) },
    b_wcpapier: { name: "WC-Papier", der: "das WC-Papier", klein: true, w: 30, h: 28, d: () =>
      [[-7.5, -7.5], [7.5, -7.5], [0, -20]].map(([x, y]) => C(x, y, 7.2, WEISS, rand(1.2)) + C(x, y, 4.5, "none", `stroke="#eef2f6" stroke-width="1"`) + C(x, y, 2.4, "#d6c3ae")).join("") },
  };

  const RAEUME = {
    bueroempfang: ["b_empfangspult", "b_wartestuehle", "b_lift", "b_schirmstaender", "b_firmenschild", "b_infobildschirm", "b_wegweiser", "b_schluesselkasten",
      "b_tischglocke", "b_gaestebuch", "b_namensschilder", "b_bonbonglas",
      "empfangstheke", "computer", "telefon", "sessel", "sofa", "couchtisch", "wasserspender", "grosspflanze", "zeitungsstaender", "kronleuchter"],
    grossraum: ["b_doppelpult", "b_trennwand", "b_rollcontainer", "b_planungstafel", "b_schliessfaecher", "b_papierkorb", "b_ventilator", "b_kalender",
      "b_kopfhoerer", "b_stiftebecher", "b_ordner", "b_bildschirme",
      "schreibtisch", "buerostuhl", "computer", "laptop", "telefon", "aktenschrank", "ordnerregal", "pinnwand", "tischlampe", "grosspflanze"],
    einzelbuero: ["b_chefpult", "b_chefsessel", "b_ledersofa", "b_tresor", "b_bankerlampe", "b_diplom", "b_aktenkoffer", "b_stempel", "b_bilderrahmen",
      "b_tischschild", "b_pokal",
      "schreibtisch", "buerostuhl", "computer", "laptop", "telefon", "sessel", "buecherregal", "aktenschrank", "weltkarte", "globus", "kaffeemaschine"],
    sitzung: ["sitzungstisch", "b_sitzungsstuhl", "b_beamer", "b_leinwand", "b_flipchart", "b_rednerpult", "b_mikrofon", "b_wasserkrug", "b_kaffeekanne",
      "b_guetzli", "b_filzstifte", "b_notizblock",
      "buerostuhl", "whiteboard", "pinnwand", "laptop", "wasserspender", "kaffeetasse"],
    drucker: ["b_grosskopierer", "b_plakatdrucker", "b_schredder", "b_papierregal", "b_postwagen", "b_altpapier", "b_postfaecher", "b_feuerloescher",
      "b_papierstapel", "b_heftmaschine", "b_locher", "b_couverts",
      "kopierer", "drucker", "tisch", "regal", "aktenschrank", "ordnerregal", "pakete"],
    buerowc: ["b_pissoir", "b_wckabine", "b_waschtisch", "b_putzwagen", "b_warnschild", "b_abfallkuebel", "b_wcbuerste", "b_seifenspender", "b_handtuchspender",
      "b_haendetrockner", "b_wcschild", "b_wcpapier",
      "wc", "lavabo", "spiegel", "handtuch"],
  };

  const MOTIVE = {
    // Eine Tischglocke: "Bitte läuten!"
    bueroempfang: () => R(-14, 8, 28, 5, HOLZ_D, 2.5) + P("M-12 8a12 12 0 0 1 24 0z", GOLD) + R(-1.5, -8, 3, 5, METALL_D, 1) + E(0, -8.5, 4, 1.8, METALL_D) +
      S("M-7 4q0-5 4-8", "#fff6c2", 2) + S("M15 -8l4-3M16 -2h5M-15 -8l-4-3M-16 -2h-5", "#ffb347", 1.6),
    // Ein Bildschirm mit Säulen
    grossraum: () => R(-17, -15, 34, 23, BILDSCHIRM, 3) + R(-14, -12, 28, 17, "#6cc3d5", 1.5) +
      R(-10, -1, 4, 4, WEISS, 1) + R(-4, -5, 4, 8, WEISS, 1) + R(2, -9, 4, 12, "#ffd166", 1) + R(8, -6, 4, 9, WEISS, 1) +
      R(-2, 8, 4, 4, METALL) + R(-9, 12, 18, 3, METALL_D, 1.5),
    // Hemdkragen mit Krawatte
    einzelbuero: () => R(-16, -15, 32, 31, "#a8d8f8", 3) + P("M-12 -15l12 9-4 6-9-9z", WEISS) + P("M12 -15l-12 9 4 6 9-9z", WEISS) +
      P("M-3.5 -7h7l-1.5 5h-4z", "#ef5350") + P("M-2 -2h4l3 13-5 5-5-5z", "#ef5350") + S("M-2.2 2l4.4 3M-3 8l6 3.5", "#ffd166", 1.4),
    // Zwei Sprechblasen
    sitzung: () => R(-20, -14, 24, 15, "#6cc3d5", 7) + P("M-15 0l-3 7 8-6z", "#6cc3d5") + S("M-15 -9h14M-15 -5h9", WEISS, 2) +
      R(-4, -3, 24, 15, "#ffd166", 7) + P("M14 11l3 6-8-5z", "#ffd166") + C(2, 4.5, 1.8, WEISS) + C(8, 4.5, 1.8, WEISS) + C(14, 4.5, 1.8, WEISS),
    // Ein Drucker, aus dem ein Blatt kommt
    drucker: () => R(-9, -15, 18, 9, WEISS, 1, rand(1.2)) + R(-17, -7, 34, 15, METALL, 3) + R(-17, -7, 34, 4, "#b8c2cc", 2) + C(12, -2, 1.8, "#5cbf62") +
      R(-11, 3, 22, 4, DUNKEL, 1.5) + R(-9, 5, 18, 12, WEISS, 1, rand(1.2)) + S("M-6 9h12M-6 12h9", "#9aa5b1", 1.2),
    // Eine Rolle WC-Papier am Halter, vor hellblauen Plättli
    buerowc: () => R(-23, -17, 46, 34, "#cfeaff", 2) + S("M-23 -6h46M-23 5h46M-11.5 -17v34M0 -17v34M11.5 -17v34", WEISS, 1.2) +
      R(-21, -9, 3, 8, METALL_D, 1) + S("M-19 -5h6", METALL_D, 2.2) +
      R(-12, 1, 24, 15, WEISS, 0, rand(1.2)) + S("M-11 9h22", "#b8c2cc", 1, `stroke-dasharray="1.6 1.6"`) +
      R(-12, -13, 24, 16, WEISS, 0, rand(1.2)) + E(-12, -5, 4, 8, WEISS, rand(1.2)) + E(-12, -5, 1.6, 3.5, "#d6c3ae"),
  };

  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
