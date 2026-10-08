/*
 * bau-moebel-wohnen.js – Die eigenen Dinge der Zimmer im Wohnhaus (Bauecke):
 * Eingang, Wohnzimmer, Küche, Esszimmer, Schlafzimmer und Kinderzimmer.
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten und die Bildmotive an.
 *
 * Schlafzimmer und Kinderzimmer sind die Wohnungen der Tiere: Ihre Dinge
 * tragen tags aus dem Wunsch-Wortschatz dieser Zimmer (bau-katalog.js).
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, stern, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE } = M.hilfe;

  // --- Kleine Bausteine ------------------------------------------------------
  // Ein zusammengerollter Schirm im Schirmständer, um den Fuss gedreht. Der
  // Griff ist ein Haken (nach links oder rechts) oder ein gerader Knauf.
  const schirm = (x, dy, winkel, f, griff) => {
    const t = `transform="translate(${x} ${dy}) rotate(${winkel} 0 -18)"`;
    const knauf = griff === "gerade" ? R(-2.2, -63, 4.4, 8, DUNKEL, 2, t)
      : S(griff === "links" ? "M0 -56V-60Q0 -66 -4.5 -66Q-9 -66 -9 -61" : "M0 -56V-60Q0 -66 4.5 -66Q9 -66 9 -61", HOLZ_D, 3.2, t);
    return P("M-5 -18L-6 -42Q0 -50 6 -42L5 -18Z", f, t) + S("M-2.5 -44L-1.6 -22M2.5 -44L1.6 -22", shade(f, -0.22), 1.2, t) +
      R(-6, -39, 12, 3, shade(f, -0.35), 1.5, t) + R(-1, -57, 2, 12, METALL_D, 1, t) + knauf;
  };
  // Ein Schlüssel, der an einem Haken hängt (x, y = Mitte des Rings).
  const schluessel = (x, y, f) => C(x, y, 3.8, f) + C(x, y, 1.5, HOLZ) + R(x - 1.3, y + 3, 2.6, 11, f, 1) +
    R(x + 1, y + 9, 2.8, 2, f, 0.6) + R(x + 1, y + 12, 2, 2, f, 0.6);
  // Eine Kerzenflamme, unten rund und oben spitz (x, y = Fuss der Flamme).
  const flamme = (x, y, s = 1) => P(`M${x} ${y}c${-3 * s} 0 ${-3 * s} ${-4.5 * s} 0 ${-8 * s}c${3 * s} ${3.5 * s} ${3 * s} ${8 * s} 0 ${8 * s}z`, "#ffd166") +
    P(`M${x} ${y - 0.5 * s}c${-1.4 * s} 0 ${-1.4 * s} ${-2.2 * s} 0 ${-3.8 * s}c${1.4 * s} ${1.6 * s} ${1.4 * s} ${3.8 * s} 0 ${3.8 * s}z`, "#ff9f43");
  // Ein Herz (x, y = Mitte, r = halbe Höhe).
  const herz = (x, y, r, f) => P(`M${x} ${y + r}C${x - 2 * r} ${y - 0.2 * r} ${x - r} ${y - 1.7 * r} ${x} ${y - 0.6 * r}C${x + r} ${y - 1.7 * r} ${x + 2 * r} ${y - 0.2 * r} ${x} ${y + r}Z`, f);
  // Ein Bilderbuch, das mit dem Deckel nach vorn im Regal steht.
  const bilderbuch = (x, unten, w, h, f, bildchen) => R(x, unten - h, w, h, f, 2) + R(x, unten - h, 3, h, shade(f, -0.22), 1.5) + bildchen;
  // Ein Farbstift im Becher, um den Becherboden gedreht.
  const stift = (x, oben, f, winkel) => {
    const t = `transform="rotate(${winkel} ${x} -4)"`;
    return R(x - 1.8, oben + 5, 3.6, -4 - oben - 5, f, 0.8, t) + P(`M${x - 1.8} ${oben + 5}L${x} ${oben}L${x + 1.8} ${oben + 5}Z`, "#f2d3a2", t) +
      P(`M${x - 0.7} ${oben + 1.9}L${x} ${oben}L${x + 0.7} ${oben + 1.9}Z`, f, t);
  };
  // Ein Gummistiefel (x0 = Ferse), die Spitze zeigt nach rechts.
  const stiefel = (x0, f) => P(`M${x0} 0V-24Q${x0} -26 ${x0 + 2} -26H${x0 + 11}Q${x0 + 13} -26 ${x0 + 13} -24V-11Q${x0 + 13} -8.5 ${x0 + 16} -8.5H${x0 + 19}Q${x0 + 24} -8.5 ${x0 + 24} -3.5V0Z`, f) +
    R(x0, -2.5, 24, 2.5, DUNKEL, 1) + R(x0, -27, 13.6, 3.5, shade(f, -0.18), 1.5) + R(x0 + 3, -22, 2.5, 11, shade(f, 0.4), 1.25);
  // Ein Finken (Hausschuh) mit Hasenohren, die Spitze zeigt nach rechts.
  const finken = (x0, f) => E(x0 + 16, -14, 1.8, 4.8, f, `transform="rotate(-18 ${x0 + 16} -10)"`) + E(x0 + 20.5, -14, 1.8, 4.8, f, `transform="rotate(16 ${x0 + 20.5} -10)"`) +
    E(x0 + 16, -14, 0.8, 3, shade(f, 0.45), `transform="rotate(-18 ${x0 + 16} -10)"`) + E(x0 + 20.5, -14, 0.8, 3, shade(f, 0.45), `transform="rotate(16 ${x0 + 20.5} -10)"`) +
    P(`M${x0} 0V-5.5Q${x0} -7 ${x0 + 2} -7H${x0 + 9}Q${x0 + 12} -11 ${x0 + 18} -11Q${x0 + 25} -11 ${x0 + 25} -4V0Z`, f) +
    R(x0, -2, 25, 2, shade(f, -0.3), 1) + C(x0 + 21, -7, 1, TINTE) + C(x0 + 24, -5, 1, "#ef5350");

  // ---------------------------------------------------------------------------
  // Die Dinge
  // ---------------------------------------------------------------------------
  const DINGE = {
    // --- Eingang ---------------------------------------------------------------
    w_haustuer: { name: "Haustür", der: "die Haustür", w: 70, h: 132, farbe: "#4f8ef7", tags: ["tuer"], d: (c) =>
      R(-35, -132, 70, 132, "#e9e2d6", 4) + R(-30, -127, 60, 127, shade("#e9e2d6", -0.14), 3) + R(-29, -126, 58, 126, c, 3) +
      P("M-16 -86v-18a16 16 0 0 1 32 0v18z", "#a8ddf0") + R(-1.5, -120, 3, 34, WEISS) + R(-16, -101, 32, 3, WEISS) + S("M-10 -110l5-5", WEISS, 2.4, `opacity="0.75"`) +
      R(-18, -78, 36, 26, shade(c, 0.14), 3) + R(-18, -46, 36, 34, shade(c, 0.14), 3) +
      R(20.5, -72, 5, 17, "#d9a441", 2.5) + R(11, -68, 14, 4, "#e8b94f", 2) + C(23, -59, 1.3, DUNKEL) + R(22.4, -59, 1.2, 2.6, DUNKEL) +
      R(-30, -112, 3, 9, METALL_D, 1) + R(-30, -30, 3, 9, METALL_D, 1) + R(-33, -3, 66, 3, "#b8a99a", 1.5) },
    w_schirmstaender: { name: "Schirmständer", der: "der Schirmständer", w: 42, h: 70, tags: ["schirm"], d: () =>
      E(0, -34, 13, 3.5, "#2b6f80") + schirm(-6, 0, -5, "#ef5350", "links") + schirm(6.5, 4, 9, "#7c5ce6", "gerade") + schirm(1, -2.4, 3, "#ffd166", "rechts") +
      P("M-14 -34L-12 0H12L14 -34Z", "#6cc3d5") + R(-15, -37, 30, 5, "#8fd3e2", 2.5) + R(-13, -21, 26, 4, "#a8e0eb", 1.5) + R(-13, -3, 26, 3, "#4fa9bd", 1.5) },
    w_fussmatte: { name: "Fussmatte", der: "die Fussmatte", art: "flach", w: 72, h: 12, tags: ["teppich"], d: () =>
      P("M-36 0L-32 -11H32L36 0Z", "#b9773a") + P("M-31 -2L-28.5 -9H28.5L31 -2Z", "#d9a066") + T(0, -3.1, "HOI", 7.5, "#7a4a22") },
    w_schluesselbrett: { name: "Schlüsselbrett", der: "das Schlüsselbrett", art: "wand", w: 50, h: 46, tags: ["schluessel"], d: () =>
      P("M-21 -8L0 -20L21 -8V12H-21Z", HOLZ) + S("M-22.5 -7L0 -20.5L22.5 -7", "#ef5350", 3.5) + C(0, -9, 3.6, "#fff6c2") + S("M-3.6 -9h7.2M0 -12.6v7.2", HOLZ_D, 1) +
      [-12, 0, 12].map((x) => S(`M${x} -1v4q0 2.5 2.5 2.5`, METALL_D, 1.6)).join("") +
      schluessel(-12, 8, "#ffd166") + R(-17, 15, 5, 6, "#ef5350", 1.5) + schluessel(0, 8, METALL) + schluessel(12, 8, "#e8b94f") + R(15.5, 14, 5, 6, "#3a86ff", 1.5) },
    w_gummistiefel: { name: "Gummistiefel", der: "die Gummistiefel", klein: true, w: 36, h: 28, tags: ["schuhe"], d: () =>
      stiefel(-18, "#e8b230") + stiefel(-6, "#ffd166") },
    w_kinderwagen: { name: "Kinderwagen", der: "der Kinderwagen", w: 66, h: 66, farbe: "#7c5ce6", tags: ["kinderwagen"], d: (c) =>
      S("M-17 -11L-9 -23M14 -11L5 -23M-10 -23H7", METALL_D, 2.2) +
      C(-17, -11, 9, "none", `stroke="${DUNKEL}" stroke-width="3.6"`) + C(-17, -11, 2.6, METALL_D) + C(14, -11, 9, "none", `stroke="${DUNKEL}" stroke-width="3.6"`) + C(14, -11, 2.6, METALL_D) +
      S("M17 -40L27 -58", METALL_D, 2.6) + S("M25.5 -60h5.2", DUNKEL, 4.4) +
      P("M-29 -45H19V-34Q19 -23 7 -23H-17Q-29 -23 -29 -34Z", c) + R(-27, -38, 43, 2.2, shade(c, 0.35), 1.1) +
      R(-7, -49, 26, 5, "#fbf8f2", 2.5) + C(-1.5, -46.5, 1.1, "#ff9fb5") + C(5.5, -46.5, 1.1, "#ff9fb5") + C(12.5, -46.5, 1.1, "#ff9fb5") +
      P("M-29 -45V-48Q-29 -65 -10 -65H-5V-45Z", shade(c, -0.2)) + S("M-26 -46.5Q-25 -60 -10 -62M-19 -45.5Q-18 -55 -8 -57", shade(c, -0.38), 1.2) },
    w_hutablage: { name: "Hutablage", der: "die Hutablage", art: "wand", w: 84, h: 54, tags: ["garderobe"], d: () =>
      R(-42, -6, 84, 6, HOLZ, 2) + P("M-36 0h7l-7 8z", HOLZ_D) + P("M36 0h-7l7 8z", HOLZ_D) + R(-34, 3, 68, 5, HOLZ_D, 2) +
      [-26, -8, 10, 28].map((x) => S(`M${x} 7v5q0 3 3 3`, METALL_D, 2)).join("") +
      E(-20, -7, 15, 2.6, "#6b4430") + P("M-29 -8q0 -15 9 -15t9 15z", "#8a5a3c") + R(-28.6, -12.5, 17.2, 3, "#ef5350") + S("M-24 -21q4 3 8 0", "#6b4430", 1.2) +
      P("M8 -6q0 -16 10 -16t10 16z", "#3a86ff") + R(7, -9, 22, 4.5, "#2f6fd6", 2) + C(18, -23, 4, "#ffd166") +
      R(-31, 12, 6, 13, "#ff7a7a", 1.5) + R(-24, 12, 6, 10, "#ff7a7a", 1.5) + P("M-31 13Q-26 8 -18 13Z", "#ff7a7a") +
      R(-31, 16, 6, 2, WEISS) + R(-31, 20.5, 6, 2, WEISS) + R(-24, 16, 6, 2, WEISS) + S("M-30 25.2v1.2M-28 25.2v1.2M-26 25.2v1.2M-23 22.2v1.2M-21 22.2v1.2M-19 22.2v1.2", "#ff7a7a", 1) +
      S("M7 15q4 -5 8 0", "#5aa34a", 1.6) + R(3, 15, 16, 11, "#7cc05e", 3) + R(7, 19, 8, 2.5, shade("#7cc05e", 0.35), 1.2) },
    w_rucksack: { name: "Rucksack", der: "der Rucksack", art: "wand", w: 32, h: 48, farbe: "#ef5350", tags: ["rucksack"], d: (c) =>
      C(0, -21, 2.5, METALL_D) + S("M-4 -14Q0 -24 4 -14", shade(c, -0.35), 2.5) +
      R(-14, -16, 28, 38, c, 9) + P("M-14 -6Q-14 -16 -4 -16H4Q14 -16 14 -6V2Q0 6 -14 2Z", shade(c, -0.15)) +
      R(-8, 0, 3, 7, DUNKEL, 1) + R(5, 0, 3, 7, DUNKEL, 1) + R(-10, 8, 20, 11, shade(c, 0.15), 4) + R(-4, 12, 8, 3, "#ffd166", 1.5) },
    w_gegensprechanlage: { name: "Gegensprechanlage", der: "die Gegensprechanlage", art: "wand", w: 34, h: 44, licht: true, tags: ["klingel"], d: () =>
      R(-16.2, -21.2, 32.4, 42.4, WEISS, 5, `stroke="${RAND}" stroke-width="1.5"`) +
      P("M-13 -18H-7Q-4 -18 -4 -14V-11Q-4 -8.5 -7 -8.5V8.5Q-4 8.5 -4 11V14Q-4 18 -7 18H-13Q-15 18 -15 16V-16Q-15 -18 -13 -18Z", "#cbd5e0") +
      R(-13, -6, 4, 12, "#b8c4d2", 2) + S("M-9.5 18q0 3 3 3", "#cbd5e0", 1.4) +
      R(-1, -18, 16, 14, "#2d3748", 2.5) + R(0.5, -16.5, 13, 11, "#a8ddf0", 1.5) +
      P("M3.4 -10.5l-0.8 -3.8l3 1.7zM10.6 -10.5l0.8 -3.8l-3 1.7z", "#e8763a") + C(7, -9.5, 3.5, "#e8763a") + E(7, -7.8, 2, 1.4, WEISS) +
      C(5.7, -10.4, 0.65, TINTE) + C(8.3, -10.4, 0.65, TINTE) + C(7, -8.3, 0.6, TINTE) +
      C(7, 4, 4, "#7cc05e") + C(5.3, 4, 1.3, "none", `stroke="${WEISS}" stroke-width="0.9"`) + S("M6.6 4h3.4M9 4v1.5", WEISS, 0.9) +
      C(7, 14, 2.6, "#ffd166") },
    w_trottinett: { name: "Trottinett", der: "das Trottinett", w: 44, h: 52, farbe: "#7cc05e", tags: ["trottinett"], d: (c) =>
      S("M-20.5 -7.5Q-19.5 -12 -14.5 -12", shade(c, -0.25), 2.2) + S("M9.5 -9.5L16 -5", shade(c, -0.25), 2.6) + S("M16 -5L10.5 -48", shade(c, -0.12), 3.4) +
      S("M2.5 -49H18.5", DUNKEL, 3) + R(0, -50.5, 5.6, 3.2, "#ef5350", 1.6) + R(15, -50.5, 5.6, 3.2, "#ef5350", 1.6) +
      R(-19, -12, 30, 4, c, 2) + R(-16, -12, 24, 1.4, shade(c, -0.4), 0.7) +
      C(-16, -5, 5, DUNKEL) + C(-16, -5, 2, METALL) + C(16, -5, 5, DUNKEL) + C(16, -5, 2, METALL) },
    w_velohelm: { name: "Velohelm", der: "der Velohelm", klein: true, w: 36, h: 24, tags: ["helm"], d: () =>
      S("M-10 -6Q-7 0.5 -1 -1M7 -6Q5 -1 -1 -1", DUNKEL, 1.4) + R(-2.5, -2.5, 3, 2.5, "#2d3748", 0.8) +
      P("M-15 -6Q-15 -23 0 -23Q15 -23 16 -8L14 -6Z", "#ff9f43") + P("M10 -9L17.5 -8L15 -5L10 -6Z", "#d9772a") +
      R(-9, -19, 4, 7, "#c7651f", 2) + R(-2, -21, 4, 8, "#c7651f", 2) + R(5, -19, 4, 7, "#c7651f", 2) +
      S("M-12 -12Q0 -21 12 -12", WEISS, 1.6, `opacity="0.7"`) + R(-15, -8, 29, 3, DUNKEL, 1.5) },

    // --- Wohnzimmer ------------------------------------------------------------
    w_fernsehmoebel: { name: "Fernsehmöbel", der: "das Fernsehmöbel", w: 124, h: 34, farbe: "#e2c9a6", tags: ["schrank"], flaeche: -34, d: (c) =>
      R(-62, -34, 124, 6, shade(c, -0.14), 3) + R(-60, -29, 120, 23, c, 3) +
      R(-56, -25, 34, 15, shade(c, 0.16), 2) + R(-26, -20, 2, 5, HOLZ_DD, 1) + R(22, -25, 34, 15, shade(c, 0.16), 2) + R(24, -20, 2, 5, HOLZ_DD, 1) +
      R(-18, -25, 36, 15, shade(c, -0.5), 2) + R(-14, -16, 14, 5, "#2d3748", 1.5) + C(-3, -13.5, 1, "#7cff9e") +
      R(4, -23, 3, 13, "#ef5350", 0.8) + R(8, -22, 3, 12, "#3a86ff", 0.8) + R(12, -23, 3, 13, "#ffd166", 0.8) +
      R(-56, -6, 4, 6, DUNKEL, 2) + R(52, -6, 4, 6, DUNKEL, 2) },
    w_standuhr: { name: "Standuhr", der: "die Standuhr", w: 44, h: 138, farbe: "#a46c43", tags: ["uhr"], d: (c) =>
      R(-21, -6, 42, 6, shade(c, -0.25), 2) + R(-19, -30, 38, 25, c, 3) + R(-13, -25, 26, 15, shade(c, 0.15), 2) +
      R(-15, -98, 30, 70, c, 2) + R(-9, -92, 18, 58, "#fbf3df", 6) +
      S("M-5 -92V-74M5 -92V-68", "#c99a2e", 1) + R(-7, -74, 4, 10, "#e8b94f", 2) + R(3, -68, 4, 10, "#e8b94f", 2) +
      S("M0 -92V-50", "#c99a2e", 1.6) + C(0, -46, 6, "#e8b94f") + C(0, -46, 3.4, "#f5cf6b") +
      R(-22, -131, 44, 35, c, 4) + P("M-22 -131Q0 -144 22 -131Z", shade(c, -0.15)) + R(-22, -100, 44, 4, shade(c, -0.2), 2) +
      C(0, -114, 13, "#fbf8f2") + C(0, -114, 13, "none", `stroke="#e8b94f" stroke-width="1.6"`) +
      [0, 90, 180, 270].map((a) => R(-1, -125, 2, 3, TINTE, 0, `transform="rotate(${a} 0 -114)"`)).join("") +
      S("M0 -114V-122M0 -114L6 -110", TINTE, 1.8) + C(0, -114, 1.6, TINTE) },
    w_plattenspieler: { name: "Plattenspieler", der: "der Plattenspieler", klein: true, w: 40, h: 28, tags: ["musik"], d: () =>
      R(-20, -13, 40, 13, HOLZ, 3) + R(-20, -14, 40, 4, "#e2c9a6", 2) + R(-17, -6, 34, 1.5, HOLZ_D, 0.75) + C(11, -3.5, 1.6, DUNKEL) + C(15.5, -3.5, 1.6, DUNKEL) +
      E(-4, -15, 14, 4.2, "#1a202c") + E(-4, -15, 10, 3, "none", `stroke="#3d4656" stroke-width="0.8"`) + E(-4, -15, 3.6, 1.2, "#ef5350") +
      C(14, -16, 2.4, METALL) + S("M14 -16L7 -15", METALL_D, 1.6) + R(4.5, -16.5, 3.5, 2.4, DUNKEL, 0.8) + T(13, -20, "♪", 9, "#7c5ce6") },
    w_brettspiel: { name: "Brettspiel", der: "das Brettspiel", klein: true, w: 40, h: 18, tags: ["spiel"], d: () =>
      P("M-20 -3L-15 -12H15L20 -3Z", "#fbf3df") + R(-20, -3, 40, 3, HOLZ, 1) +
      P("M-20 -3L-18.2 -6.3H-10L-11 -3Z", "#ef5350") + P("M20 -3L18.2 -6.3H10L11 -3Z", "#3a86ff") + P("M-15 -12L-16.8 -8.7H-9.2L-8.6 -12Z", "#ffd166") + P("M15 -12L16.8 -8.7H9.2L8.6 -12Z", "#7cc05e") +
      E(0, -7.5, 11, 2.6, "none", `stroke="${HOLZ_D}" stroke-width="1" stroke-dasharray="1.6 1.4"`) +
      [[-6, "#ef5350"], [3, "#3a86ff"]].map(([x, f]) => P(`M${x - 2.4} -5L${x - 1} -10H${x + 1}L${x + 2.4} -5Z`, f) + C(x, -11, 1.9, f)).join("") +
      R(9, -17, 7, 7, WEISS, 1.5, `stroke="${RAND}" stroke-width="0.8"`) + C(11, -15, 0.8, TINTE) + C(12.5, -13.5, 0.8, TINTE) + C(14, -12, 0.8, TINTE) },
    w_jasskarten: { name: "Jasskarten", der: "die Jasskarten", klein: true, w: 34, h: 26, tags: ["spiel"], d: () =>
      P("M-17 0L-14 -4H14L17 0Z", "#2f7d57") +
      [[-30, "♦", "#ef5350"], [-10, "♣", TINTE], [10, "♥", "#ef5350"], [30, "♠", TINTE]].map(([a, z, f]) => {
        const t = `transform="rotate(${a} 0 -4)"`;
        return R(-6, -24, 12, 18, "#fffdf7", 2, `stroke="#b8c7d3" stroke-width="1" ${t}`) + T(-2.8, -17.6, z, 6, f, t) + T(1, -9, z, 8, f, t);
      }).join("") },
    w_pouf: { name: "Pouf", der: "der Pouf", w: 46, h: 32, farbe: "#ff9f6b", tags: ["sitz"], d: (c) =>
      R(-23, -30, 46, 28, c, 12) +
      [-15, -5, 5, 15].map((x) => S(`M${x - 3} -25l3 3l3 -3M${x - 3} -19l3 3l3 -3M${x - 3} -13l3 3l3 -3`, shade(c, -0.18), 1.6)).join("") +
      E(0, -28, 19, 3.5, shade(c, 0.2)) + E(0, -2, 20, 2, shade(c, -0.3)) },
    w_holzkorb: { name: "Holzkorb", der: "der Holzkorb", w: 52, h: 46, tags: ["holz"], d: () =>
      [[-5, -38, 6.5], [9, -39, 6], [-12, -30, 7], [2, -31, 7], [15, -29, 6.5]].map(([x, y, r]) =>
        C(x, y, r, "#8a5734") + C(x, y, r - 1.8, "#e2b27a") + C(x, y, (r - 1.8) * 0.5, "none", `stroke="#c4904f" stroke-width="0.9"`)).join("") +
      P("M-24 -28H24L21 0H-21Z", "#d9a066") + S("M-23 -19H23M-22 -10H22", "#b9773a", 1.8) + S("M-14 -28L-13 -0.6M-4 -28V-0.6M6 -28V-0.6M16 -28L15 -0.6", "#c4904f", 1.1) +
      R(-25, -30, 50, 4, "#c4904f", 2) },
    w_familienfotos: { name: "Familienfotos", der: "die Familienfotos", art: "wand", w: 72, h: 54, tags: ["bild"], d: () =>
      R(-36, -26, 32, 40, "#ffd166", 3) + R(-32, -22, 24, 32, "#fff6e0", 1.5) +
      C(-25, -8, 5.5, "#a46c43") + C(-29.5, -12.5, 2.2, "#a46c43") + C(-20.5, -12.5, 2.2, "#a46c43") + C(-25, -6, 2.2, "#e2b27a") +
      C(-14, -4, 4.6, "#ff9f43") + P("M-18 -7l0.5 -4.5l3 2.5zM-10 -7l-0.5 -4.5l-3 2.5z", "#ff9f43") +
      P("M-32 10q2 -8 7 -8t7 8z", "#3a86ff") + P("M-21 10q2 -7 7 -7t7 7z", "#ef5350") +
      C(14, -14, 12, "#ef5350") + C(14, -14, 9, "#e6f6fc") + C(14, -12, 4.5, "#ffd166") + C(14, -18, 3.4, "#ffd166") + P("M17 -18l3 1l-3 1z", "#ff9f43") + C(15, -19, 0.7, TINTE) +
      R(4, 4, 30, 22, "#3a86ff", 3) + R(7, 7, 24, 16, "#e6f6fc", 1.5) + P("M7 23L15 13L20 18L25 11L31 23Z", "#7cc05e") + P("M23.3 13L25 11L26.8 13.2Z", WEISS) + C(11, 11, 2, "#ffd166") },

    // --- Küche -----------------------------------------------------------------
    w_abwaschmaschine: { name: "Abwaschmaschine", der: "die Abwaschmaschine", w: 58, h: 64, tags: ["abwaschmaschine"], flaeche: -64, d: () =>
      R(-28, -63, 56, 62, WEISS, 5, `stroke="${RAND}" stroke-width="2"`) + R(-25, -60, 50, 8, "#e2e8f0", 2) + R(-21, -58.5, 13, 5, "#2d3748", 1.5) + R(-19, -57, 6, 2, "#7cff9e", 0.8) +
      C(13, -56, 1.9, "#7cc05e") + C(19, -56, 1.9, METALL_D) +
      R(-25, -50, 50, 36, "#cbd5e0", 3) + S("M-23 -36H23", METALL_D, 1.4) +
      [[-15, "#a8d8f8"], [-5, "#ffd166"], [5, "#a8d8f8"], [15, "#ff9fb5"]].map(([x, f]) => P(`M${x - 3.6} -37L${x - 2.6} -46H${x + 2.6}L${x + 3.6} -37Z`, f)).join("") +
      [[-16, "#6cc3d5"], [-9, "#ff9fb5"], [-2, "#6cc3d5"], [5, "#ff9fb5"], [12, "#6cc3d5"]].map(([x, f]) => C(x, -25, 7, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(x, -25, 4.6, "none", `stroke="${f}" stroke-width="1.3"`)).join("") +
      C(19, -30, 2.4, WEISS, `opacity="0.85"`) + C(21, -34, 1.5, WEISS, `opacity="0.85"`) + C(-20, -40, 1.6, WEISS, `opacity="0.85"`) +
      S("M-23 -17H23", METALL_D, 1.4) + R(-29, -15, 58, 8, "#e2e8f0", 3) + R(-10, -12.5, 20, 2.5, METALL_D, 1.25) + R(-26.5, -6, 53, 5, "#cbd5e0", 2) },
    w_abfallkuebel: { name: "Abfallkübel", der: "der Abfallkübel", w: 30, h: 44, farbe: "#7cc05e", tags: ["abfall"], d: (c) =>
      P("M-12 -34H12L10.5 -3H-10.5Z", c) + R(-8.5, -31, 2.6, 24, shade(c, 0.28), 1.3) + R(-11.5, -13, 23, 2.6, shade(c, -0.15), 1.3) +
      R(-11.5, -3, 23, 3, shade(c, -0.35), 1.5) + R(-5, -5.5, 10, 2.6, DUNKEL, 1.3) +
      P("M-13.5 -34Q-13.5 -39 -8.5 -39H8.5Q13.5 -39 13.5 -34Z", shade(c, -0.18)) + R(-14.5, -36, 29, 2.6, shade(c, -0.28), 1.3) + R(-6.5, -41.5, 7, 3, shade(c, -0.3), 1.5) +
      R(7.6, -44, 1.4, 3, "#8a5734", 0.7) + P("M6.6 -38.6Q6.8 -42 8.3 -42Q9.8 -42 10 -38.6Z", "#f5c542") +
      P("M7 -40.2Q3.6 -40.4 2 -36.4Q5.4 -37.4 7.6 -38.6Z", "#ffd166") + P("M9.6 -40.2Q13 -40.4 14.4 -36.4Q11.2 -37.4 9 -38.6Z", "#ffd166") + P("M7.4 -38.8Q8.3 -34.6 9.2 -38.8Z", "#ffe08a") },
    w_kuechenhelfer: { name: "Küchenhelfer", der: "die Küchenhelfer", art: "wand", w: 76, h: 46, tags: ["kuechengeraet"], d: () =>
      R(-35, -21.8, 70, 4, METALL, 2) + C(-34.8, -19.8, 3.2, METALL_D) + C(34.8, -19.8, 3.2, METALL_D) +
      S("M-25 -19v3", METALL_D, 1.4) + R(-26.5, -16, 3, 30, METALL, 1.5) + C(-25, -12, 1, METALL_D) + P("M-33 13a8 8 0 0 0 16 0z", METALL) + R(-33, 12, 16, 2, METALL_D, 1) +
      R(-10, -18, 4, 13, "#ef5350", 2) + P("M-8 -5C-16 3 -14 15 -8 18C-2 15 0 3 -8 -5Z", "none", `stroke="${METALL_D}" stroke-width="1.3"`) +
      P("M-8 -5C-12 3 -11.5 14 -8 18C-4.5 14 -4 3 -8 -5Z", "none", `stroke="${METALL_D}" stroke-width="1.3"`) + S("M-8 -5V18", METALL_D, 1.2) +
      R(7, -18, 4, 16, "#3a86ff", 2) + R(8, -2, 2, 5, METALL) + R(3, 3, 12, 14, METALL, 2) + S("M6.5 6v8M9 6v8M11.5 6v8", METALL_D, 1) +
      S("M27 -19V-3", DUNKEL, 3.5) + C(27, 7, 9.5, "#2d3748") + C(27, 7, 7, "#4a5568") + C(27, -15, 1, METALL) },
    w_mixer: { name: "Mixer", der: "der Mixer", klein: true, w: 24, h: 35, farbe: "#ef5350", tags: ["kuechengeraet"], d: (c) =>
      P("M-8.5 0L-7.6 -10H7.6L8.5 0Z", c) + C(0, -5, 2.2, shade(c, 0.45)) + R(-6.8, -13, 13.6, 3, DUNKEL, 1) +
      S("M7.6 -27H11V-16H6.8", "#a8ddf0", 1.8) + P("M-6 -13L-7.6 -30H7.6L6 -13Z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="1.1"`) +
      P("M-6.2 -14.5L-7.3 -24.5H7.3L6.2 -14.5Z", "#ff9fb5") + C(-2.5, -20.5, 1.4, "#ef5350") + C(2.5, -18, 1.4, "#ffd166") + C(1, -22.5, 1.1, "#7cc05e") +
      R(-8.5, -33, 17, 3.5, DUNKEL, 1.75) + R(-1.7, -34.6, 3.4, 1.8, DUNKEL, 0.9) },
    w_guetzliblech: { name: "Guetzliblech", der: "das Guetzliblech", klein: true, w: 40, h: 16, tags: ["essen", "backen"], d: () =>
      P("M-20 -2L-16 -10H16L20 -2Z", "#cbd5e0") + P("M-17 -3.5L-14 -8.8H14L17 -3.5Z", "#fbf3df") + R(-20, -3, 40, 3, METALL_D, 1.5) +
      stern(-10, -9, 5, "#e8b06a") + C(-10, -9, 1.6, "#ff7aa2") + herz(0, -9.5, 3.6, "#d99a55") + C(10, -8.5, 4.2, "#e8b06a") +
      C(9, -9.5, 0.8, WEISS) + C(11.5, -8, 0.8, WEISS) + C(9.5, -7, 0.8, "#ff7aa2") },

    // --- Esszimmer -------------------------------------------------------------
    w_geschirrschrank: { name: "Geschirrschrank", der: "der Geschirrschrank", w: 84, h: 132, farbe: "#b07a4f", tags: ["schrank"], flaeche: -58, fx: [-38, 38], d: (c) =>
      R(-38, -6, 76, 6, shade(c, -0.3), 2) + R(-40, -54, 80, 48, c, 4) + R(-36, -50, 34, 40, shade(c, 0.12), 3) + R(2, -50, 34, 40, shade(c, 0.12), 3) +
      C(-6, -30, 2, HOLZ_DD) + C(6, -30, 2, HOLZ_DD) + R(-42, -58, 84, 6, shade(c, -0.15), 3) +
      R(-36, -126, 72, 68, c, 4) + R(-39, -132, 78, 7, shade(c, -0.15), 3) +
      R(-31, -121, 29, 58, "#e6f6fc", 2) + R(2, -121, 29, 58, "#e6f6fc", 2) + R(-31, -92, 29, 2.5, shade(c, -0.1)) + R(2, -92, 29, 2.5, shade(c, -0.1)) +
      [-24, -9, 9, 24].map((x) => C(x, -101, 7.5, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(x, -101, 5, "none", `stroke="#3a86ff" stroke-width="1.2"`)).join("") +
      R(-27, -71, 8, 8, "#ff9fb5", 2) + S("M-19 -69q3 1 0 4", "#ff9fb5", 1.6) + R(-15, -71, 8, 8, "#ffd166", 2) + S("M-7 -69q3 1 0 4", "#ffd166", 1.6) +
      E(16, -70, 8, 6.5, "#6cc3d5") + E(16, -76, 4, 1.8, "#5aaebf") + C(16, -78, 1.6, "#5aaebf") + S("M8.5 -71L4 -76", "#6cc3d5", 2.5) + S("M23.5 -73q4 3 0 7", "#6cc3d5", 2) +
      S("M-27 -86l8 -8M6 -86l8 -8", WEISS, 2, `opacity="0.6"`) },
    w_hochstuhl: { name: "Hochstuhl", der: "der Hochstuhl", w: 42, h: 68, farbe: HOLZ, tags: ["stuhl", "sitz"], d: (c) =>
      S("M-18.5 -2L-12.5 -36M9.5 -2L3.5 -36", shade(c, -0.2), 4) + S("M-16 -16H7", shade(c, -0.2), 3) + R(1.5, -22, 10, 3, c, 1.5) +
      R(-15.5, -40, 24, 6, c, 3) + R(-13.5, -44, 18, 4.5, "#ff9fb5", 2.2) + R(-17.5, -68, 7, 32, c, 3) +
      R(-13.5, -52, 16, 4, c, 2) + S("M0.5 -50V-40", c, 3) + R(0.5, -55, 20, 4, "#6cc3d5", 2) +
      P("M5.5 -61H17.5Q16.5 -55 11.5 -55Q6.5 -55 5.5 -61Z", "#ffd166") + S("M14.5 -62L18.5 -67", METALL, 1.5) },
    w_eckbank: { name: "Eckbank", der: "die Eckbank", w: 140, h: 66, farbe: HOLZ, tags: ["sitz"], flaeche: -35, fx: [-56, 64], d: (c) =>
      R(-66, -60, 132, 26, shade(c, -0.35), 2) +
      Array.from({ length: 9 }, (_, i) => R(-64 + i * 14.4, -60, 12.4, 26, c, 2)).join("") +
      [-20.8, 8, 36.8].map((x) => herz(x, -47, 3.6, shade(c, -0.45))).join("") +
      R(-70, -64, 140, 6, shade(c, -0.15), 3) + R(-70, -64, 10, 64, shade(c, -0.12), 3) + R(-70, -66, 11, 4, shade(c, -0.25), 2) +
      R(-60, -28, 128, 7, shade(c, 0.12), 3) + R(-58, -35, 124, 8, "#ef5350", 3.5) +
      Array.from({ length: 15 }, (_, i) => R(-56 + i * 8, -35, 4, 4, WEISS, 0, `opacity="0.9"`) + R(-52 + i * 8, -31, 4, 4, WEISS, 0, `opacity="0.9"`)).join("") +
      R(-60, -21, 128, 15, c, 2) + R(-54, -18, 56, 9, shade(c, 0.12), 2) + R(8, -18, 54, 9, shade(c, 0.12), 2) + R(-60, -6, 128, 6, shade(c, -0.3), 2) },
    w_fondue: { name: "Fondue", der: "das Fondue", klein: true, w: 38, h: 39, tags: ["essen"], d: () =>
      S("M-13 -1L-10 -12M7 -1L4 -12", METALL_D, 2) + R(-6.5, -4.5, 7, 3.5, METALL, 1.5) + flamme(-3, -4.5, 0.8) + R(-13, -14, 20, 2.6, METALL_D, 1.3) +
      P("M-15 -24H9Q9 -13 -3 -13Q-15 -13 -15 -24Z", "#ef5350") + C(-9, -19, 1.2, WEISS) + C(-3, -17, 1.2, WEISS) + C(3, -19, 1.2, WEISS) +
      R(8, -23.5, 7, 3.2, "#d43f3a", 1.6) + R(14, -24, 5, 4.2, HOLZ_D, 2) + R(-16, -26, 26, 3.2, "#d43f3a", 1.6) + E(-3, -26.3, 11, 1.8, "#ffd166") +
      S("M-8 -26L-13.5 -33.5", METALL, 1.3) + S("M-13.5 -33.5L-15.6 -36.4", "#3a86ff", 2.4) +
      S("M3 -26.5Q2 -28.5 3 -29.5", "#ffd166", 1) + R(0.5, -34.5, 6, 5.5, "#e8b06a", 1.3) + P("M0.8 -30Q3.5 -27.6 6.2 -30V-29Q5.2 -26.4 4.2 -28.2Q2.4 -26.6 0.8 -29Z", "#ffd166") +
      S("M5.5 -32.5L13 -36.2", METALL, 1.3) + S("M13 -36.2L15.8 -37.4", "#7cc05e", 2.4) },
    w_raclette: { name: "Raclette", der: "das Raclette", klein: true, w: 42, h: 30, tags: ["essen"], d: () =>
      E(-9, -25, 4.5, 3, "#e8c26e") + E(0.5, -25.5, 4.6, 3.3, "#d9b25e") + E(10, -25, 4.2, 3, "#e8c26e") +
      C(-10.5, -25.5, 0.6, "#b98e3a") + C(-7.5, -24, 0.5, "#b98e3a") + C(1.5, -26.5, 0.6, "#a8802f") + C(9, -25.5, 0.6, "#b98e3a") +
      R(-18, -23, 36, 4, "#2d3748", 2) + R(-15.5, -19, 31, 5, "#ef5350", 2) + R(-13, -14.6, 26, 1.4, "#ff9f43", 0.7) +
      P("M-13 -10.5H-2.5L-3.5 -7H-12Z", "#4a5568") + E(-7.75, -10.5, 5.2, 1.5, "#ffd166") + C(-4.8, -9.2, 0.9, "#ffd166") + S("M-13 -9L-19 -6.5", "#ef5350", 2.2) +
      P("M2.5 -10.5H13L12 -7H3.5Z", "#4a5568") + E(7.75, -10.5, 5.2, 1.5, "#ffd166") + C(5, -9.2, 0.9, "#ffd166") + S("M13 -9L19 -6.5", "#3a86ff", 2.2) +
      R(-15.5, -5, 31, 2.6, "#2d3748", 1.3) + R(-14, -2.5, 3.6, 2.5, "#2d3748", 1) + R(10.4, -2.5, 3.6, 2.5, "#2d3748", 1) },
    w_kerzenstaender: { name: "Kerzenständer", der: "der Kerzenständer", klein: true, w: 30, h: 47, licht: true, tags: ["kerze"], d: () =>
      E(0, -2.5, 8, 2.5, "#e8b94f") + R(-5, -6.5, 10, 4, "#d9a441", 2) + R(-1.5, -28, 3, 23, "#e8b94f", 1.5) + C(0, -13, 2.6, "#e8b94f") +
      S("M-10 -24Q-10 -18 0 -18Q10 -18 10 -24", "#e8b94f", 2.4) +
      R(-13, -26, 6, 2.5, "#d9a441", 1.25) + R(7, -26, 6, 2.5, "#d9a441", 1.25) + R(-3, -30, 6, 2.5, "#d9a441", 1.25) +
      R(-12, -34, 4, 8, "#ef5350", 1.2) + R(8, -34, 4, 8, "#ef5350", 1.2) + R(-2, -38, 4, 8, "#ef5350", 1.2) +
      flamme(-10, -34.5) + flamme(10, -34.5) + flamme(0, -38.5) },
    w_suppenschuessel: { name: "Suppenschüssel", der: "die Suppenschüssel", klein: true, w: 40, h: 36, tags: ["geschirr", "essen"], d: () =>
      S("M-8 -26q-2 -1.8 0 -3.6t0 -3.6M-3 -28q-2 -1.8 0 -3.6t0 -3.6", "#cbd5e0", 1.3) +
      S("M-15 -15q-3.5 0 -3.5 3M15 -15q3.5 0 3.5 3", "#9fb3c8", 2.2) + R(-6.5, -4, 13, 3.5, WEISS, 1.5, `stroke="#b8c7d3" stroke-width="1"`) +
      P("M-15 -18H15Q15 -4 0 -4Q-15 -4 -15 -18Z", WEISS, `stroke="#b8c7d3" stroke-width="1.5"`) + S("M-13 -13Q0 -7 13 -13", "#3a86ff", 1.6) +
      [-9, -3, 3, 9].map((x) => C(x, -13.2 - x * x * 0.0148, 1.1, "#3a86ff")).join("") +
      S("M8 -20L14 -29", METALL, 2) + C(14.4, -29.6, 1.6, METALL) +
      P("M-14 -18Q-14 -26 0 -26Q14 -26 14 -18Z", WEISS, `stroke="#b8c7d3" stroke-width="1.5"`) + S("M-10 -20Q0 -24 10 -20", "#a8d8f8", 1.2) + C(0, -27.5, 2.4, "#3a86ff") },
    w_wasserkrug: { name: "Wasserkrug", der: "der Wasserkrug", klein: true, w: 32, h: 32, tags: ["geschirr", "trinken"], d: () =>
      S("M9 -25.8Q14.5 -25.8 14.5 -17.8Q14.5 -10.8 10 -9.8", "#a8ddf0", 2.4) +
      P("M-9 -28.8L-11 -4.8Q-11 -0.8 -7 -0.8H7Q11 -0.8 11 -4.8L9 -28.8Z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="1.4"`) + P("M-9 -28.8L-13 -31.3L-9.4 -25.3Z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="1.2"`) +
      P("M-9.9 -17.8L-10.4 -4.8Q-10.4 -1.5 -7 -1.5H7Q10.4 -1.5 10.4 -4.8L9.9 -17.8Z", "#a8d8f8", `opacity="0.9"`) +
      C(2, -10.8, 3.6, "#ffd166") + C(2, -10.8, 2.5, "#fff1b8") + P("M-6 -13.8q3 -3.5 7 -0.5q-3.5 3 -7 0.5z", "#7cc05e") + S("M-6 -25.8L-7 -6.8", WEISS, 1.4, `opacity="0.8"`) },
    w_kuckucksuhr: { name: "Kuckucksuhr", der: "die Kuckucksuhr", art: "wand", w: 46, h: 70, tags: ["uhr"], d: () =>
      S("M-8 13V22M8 13V18M0 13V24", "#8a5734", 1) + E(-8, 26, 2.8, 5, "#8a5734") + E(8, 22, 2.8, 5, "#8a5734") + S("M-10 25h4M-10 28h4M6 21h4M6 24h4", HOLZ_DD, 0.8) +
      P("M0 24q-4 4.5 0 10q4 -5.5 0 -10z", HOLZ_D) +
      R(-17, -17, 34, 31, HOLZ, 2) + R(-17, 11, 34, 3, HOLZ_D, 1.5) +
      P("M-23 -15L0 -33L23 -15Z", HOLZ_DD) + S("M-20 -16L0 -31L20 -16", HOLZ, 1.5) + C(0, -24, 2.2, "#7cc05e") +
      R(-5, -15, 10, 9, "#2d1b14", 1) + R(5, -15, 3.5, 9, HOLZ_D, 0.5) + C(0, -10.5, 3.2, "#ffd166") + P("M-3 -11l-3.5 1l3.5 1z", "#ff9f43") + C(-1, -11.5, 0.7, TINTE) +
      C(0, 2.5, 7.5, "#fbf8f2") + S("M0 2.5V-2.5M0 2.5L3.5 4.5", TINTE, 1.3) + C(0, 2.5, 1, TINTE) },

    // --- Schlafzimmer (Wohnung) -----------------------------------------------
    w_himmelbett: { name: "Himmelbett", der: "das Himmelbett", w: 156, h: 156, farbe: "#a78bfa", tags: ["bett"], d: (c) =>
      R(-76, -150, 7, 150, HOLZ_D, 3) + R(69, -150, 7, 150, HOLZ_D, 3) + C(-72.5, -151, 4, HOLZ_DD) + C(72.5, -151, 4, HOLZ_DD) +
      R(-78, -150, 156, 7, HOLZ, 3) +
      P(`M-72 -144H72V-137${"q-6 7 -12 0".repeat(12)}Z`, c) +
      P("M-69 -137H-48Q-58 -112 -63 -90Q-56 -72 -58 -52H-69Z", shade(c, -0.12)) + R(-70, -92, 9, 4, "#ffd166", 2) +
      P("M69 -137H48Q58 -112 63 -90Q56 -72 58 -52H69Z", shade(c, -0.12)) + R(61, -92, 9, 4, "#ffd166", 2) +
      R(-69, -82, 14, 52, HOLZ, 4) + R(55, -60, 14, 30, HOLZ, 4) +
      R(-62, -32, 124, 18, HOLZ, 4) + R(-58, -14, 6, 14, HOLZ_DD, 2) + R(52, -14, 6, 14, HOLZ_DD, 2) +
      R(-62, -46, 124, 16, "#fbf8f2", 7) + R(-58, -60, 30, 14, WEISS, 7) +
      P("M-22 -48H56A8 8 0 0 1 64 -40V-30H-22Z", c) + P("M-22 -48H56A8 8 0 0 1 64 -40V-38H-22Z", shade(c, 0.25)) +
      herz(8, -36, 2.6, shade(c, 0.45)) + herz(28, -35, 2.6, shade(c, 0.45)) + herz(46, -37, 2.6, shade(c, 0.45)) },
    w_schminktisch: { name: "Schminktisch", der: "der Schminktisch", w: 82, h: 122, farbe: "#f7d6e0", tags: ["spiegel"], flaeche: -54, fx: [-36, 36], d: (c) =>
      R(-36, -32, 4, 32, shade(c, -0.25), 2) + R(32, -32, 4, 32, shade(c, -0.25), 2) +
      R(-38, -50, 76, 19, c, 3) + R(-34, -47, 32, 12, shade(c, 0.18), 2) + R(2, -47, 32, 12, shade(c, 0.18), 2) + C(-18, -41, 1.8, "#e8b94f") + C(18, -41, 1.8, "#e8b94f") +
      R(-3, -62, 6, 9, shade(c, -0.22), 2) + E(0, -90, 24, 30, shade(c, -0.18)) + E(0, -90, 20, 26, "#e6f6fc") + S("M-11 -98l9 -10M-6 -88l9 -10", WEISS, 2.5, `opacity="0.85"`) +
      R(-41, -54, 82, 5, shade(c, -0.12), 2.5) +
      R(-31, -62, 8, 8, "#ff9fb5", 2.5) + R(-29, -65, 4, 3.5, "#e8b94f", 1) + R(24, -61, 4, 7, "#ef5350", 1.5) + R(23.5, -57, 5, 3, "#e8b94f", 1) },
    w_standspiegel: { name: "Standspiegel", der: "der Standspiegel", w: 50, h: 128, tags: ["spiegel"], d: () =>
      R(-25, -4, 14, 4, HOLZ_DD, 2) + R(11, -4, 14, 4, HOLZ_DD, 2) + R(-21, -96, 5, 93, HOLZ, 2.5) + R(16, -96, 5, 93, HOLZ, 2.5) +
      C(-18.5, -98, 3.5, HOLZ_D) + C(18.5, -98, 3.5, HOLZ_D) +
      E(0, -68, 15, 58, HOLZ_D) + E(0, -68, 12, 55, "#e6f6fc") + S("M-6 -96L2 -108M-3 -82L5 -94", WEISS, 2.5, `opacity="0.85"`) +
      C(-15, -68, 2.5, "#e8b94f") + C(15, -68, 2.5, "#e8b94f") },
    w_truhe: { name: "Truhe", der: "die Truhe", w: 72, h: 46, farbe: "#b07a4f", tags: ["schrank"], flaeche: -46, fx: [-24, 24], d: (c) =>
      R(-33, -4, 8, 4, shade(c, -0.35), 1.5) + R(25, -4, 8, 4, shade(c, -0.35), 1.5) + R(-35, -30, 70, 26, c, 3) +
      P("M-36 -30V-36Q-36 -46 -26 -46H26Q36 -46 36 -36V-30Z", shade(c, 0.1)) + R(-36, -31, 72, 3, shade(c, -0.22), 1.5) +
      R(-26, -45, 5, 41, shade(c, -0.38), 1) + R(21, -45, 5, 41, shade(c, -0.38), 1) +
      R(-5, -34, 10, 10, "#e8b94f", 2) + C(0, -30, 1.4, DUNKEL) + R(-0.6, -30, 1.2, 3, DUNKEL) },
    w_leselampe: { name: "Leselampe", der: "die Leselampe", art: "wand", w: 46, h: 34, farbe: "#ffd166", licht: true, tags: ["lampe"], d: (c) =>
      R(-22, -16, 6, 16, METALL_D, 2) + S("M-19 -8L0 -15L10 -3", DUNKEL, 2.4) + C(0, -15, 2, DUNKEL) +
      P("M0 11L5 -3H15L20 11Z", c) + R(-0.5, 10, 21, 2.5, shade(c, -0.2), 1.25) + E(10, 13.5, 5, 2.2, "#fff6c2") + C(10, -3, 2, DUNKEL) },
    w_radiowecker: { name: "Radiowecker", der: "der Radiowecker", klein: true, w: 36, h: 20, licht: true, tags: ["uhr"], d: () =>
      R(-6, -20, 12, 2.5, "#ef5350", 1.25) + R(-18, -18, 36, 18, "#2d3748", 5) + R(-15, -15, 21, 11, "#1a202c", 2) + T(-4.5, -6.6, "7:00", 7.5, "#ff5c5c") +
      C(11, -9, 4.6, "#4a5568") + C(11, -9, 2, "#2d3748") },
    w_bettvorleger: { name: "Bettvorleger", der: "der Bettvorleger", art: "flach", w: 78, h: 10, farbe: "#c9b6ff", tags: ["teppich"], d: (c) =>
      E(0, -4.2, 37, 4.2, c) + Array.from({ length: 15 }, (_, i) => C(-31.5 + i * 4.5, -6.4 - (i % 3) * 0.6, 2.2, c)).join("") +
      E(0, -4.4, 26, 2.2, shade(c, 0.3)) + herz(0, -4.6, 1.8, shade(c, -0.18)) + herz(-14, -4.4, 1.4, shade(c, -0.18)) + herz(14, -4.4, 1.4, shade(c, -0.18)) },
    w_finken: { name: "Finken", der: "die Finken", klein: true, w: 36, h: 20, tags: ["finken"], d: () =>
      finken(-18, "#ffb3c7") + finken(-7, "#ff9fb5") },
    w_schmuckkaestchen: { name: "Schmuckkästchen", der: "das Schmuckkästchen", klein: true, w: 30, h: 26, tags: ["schmuck"], d: () =>
      P("M-13 -12L-11 -25H11L13 -12Z", "#8f74e0") + R(-8, -22, 16, 8, "#e6f6fc", 1.5) + S("M-5 -16l3 -4", WEISS, 1.2) +
      R(-14, -12, 28, 12, "#a78bfa", 2) + R(-14, -12, 28, 2, "#e8b94f", 1) + R(-2, -8, 4, 4, "#e8b94f", 1) +
      [[-10, -12], [-11.5, -9], [-11.5, -6], [-10, -3.2], [-7.5, -2]].map(([x, y]) => C(x, y, 1.5, WEISS, `stroke="${RAND}" stroke-width="0.5"`)).join("") +
      C(7, -15.5, 3, "none", `stroke="#e8b94f" stroke-width="1.5"`) + C(7, -19, 1.9, "#ff5c7a") + stern(-7, -18, 2.2, "#ffd166") },
    w_bettflasche: { name: "Bettflasche", der: "die Bettflasche", klein: true, w: 24, h: 33, farbe: "#ef5350", tags: ["bettflasche"], d: (c) =>
      P("M-11 -2V-20Q-11 -24 -6 -25L-4 -26V-28H4V-26L6 -25Q11 -24 11 -20V-2Q11 0 9 0H-9Q-11 0 -11 -2Z", c) +
      R(-4.5, -33, 9, 5, "#ffd166", 1.5) + S("M-7 -20H7M-7 -4H7", shade(c, -0.22), 1.2) + herz(0, -11.5, 3.6, shade(c, 0.45)) + R(-9, -19, 2, 14, shade(c, 0.25), 1) },
    w_pyjama: { name: "Pyjama", der: "das Pyjama", art: "wand", w: 46, h: 66, farbe: "#6cc3d5", tags: ["pyjama"], d: (c) =>
      C(0, -31, 2, METALL_D) + S("M0 -31V-25", METALL_D, 1.6) +
      P("M-12 10H12L13 32H3L0 16L-3 32H-13Z", shade(c, -0.1)) + R(-13, 29, 10, 3, shade(c, -0.25), 1) + R(3, 29, 10, 3, shade(c, -0.25), 1) +
      P("M-8 -24L-18 -19L-23 2L-17 3.5L-14 -9V12H14V-9L17 3.5L23 2L18 -19L8 -24Q0 -19 -8 -24Z", c) +
      P("M-8 -24L0 -15L8 -24Q0 -19 -8 -24Z", shade(c, -0.25)) + S("M0 -15V12", shade(c, -0.2), 1) +
      C(0, -9, 1.2, WEISS) + C(0, -2, 1.2, WEISS) + C(0, 5, 1.2, WEISS) +
      stern(-8, -7, 2.6, "#ffd166") + stern(8, 3, 2.6, "#ffd166") + stern(-6, 22, 2.2, "#ffd166") + stern(7, 20, 2.2, "#ffd166") + stern(-17, -6, 2, "#ffd166") + stern(17, -6, 2, "#ffd166") },

    // --- Kinderzimmer (Wohnung) ------------------------------------------------
    w_spielzelt: { name: "Spielzelt", der: "das Spielzelt", w: 92, h: 112, farbe: "#ff9f6b", tags: ["spielzeug"], d: (c) =>
      S("M-4 -96L-15 -110M4 -96L15 -110M0 -96V-108.5", HOLZ_D, 3) + P("M0 -108.5L10 -104.5L0 -100.5Z", "#ef5350") +
      P("M-44 0L0 -100L44 0Z", c) + S("M0 -100L-21.7 -0.6M0 -100L21.7 -0.6", shade(c, -0.12), 1.2) +
      P("M-15 0L0 -56L15 0Z", shade(c, -0.55)) + R(-9, -9, 18, 9, "#ffd166", 4) +
      P("M0 -56L-25 0H-15Z", shade(c, 0.22)) + P("M0 -56L25 0H15Z", shade(c, 0.22)) + C(-9.5, -26, 2, "#ef5350") + C(9.5, -26, 2, "#ef5350") +
      stern(-24, -24, 4, "#ffd166") + stern(26, -14, 3.4, "#ffd166") + stern(-8, -72, 3, "#ffd166") + stern(12, -48, 3, "#ffd166") },
    w_kaufladen: { name: "Kaufladen", der: "der Kaufladen", w: 94, h: 112, farbe: "#ef5350", tags: ["spielzeug"], flaeche: -50, fx: [-42, 12], d: (c) =>
      R(-44, -100, 6, 52, HOLZ_D, 2) + R(38, -100, 6, 52, HOLZ_D, 2) + R(-38, -92, 76, 44, "#fbf3df") + R(-38, -70, 76, 4, HOLZ) +
      C(-29, -75, 4.6, "#ef5350") + C(-19, -75, 4.6, "#7cc05e") + R(-10, -82, 8, 12, "#ffd166", 2) + R(1, -80, 7, 10, "#a8d8f8", 2) + R(0.5, -82, 8, 3, "#3a86ff", 1) +
      R(13, -84, 9, 14, "#ff9fb5", 2) + C(30, -75, 4.6, "#ff9f43") +
      E(-26, -53, 9, 4, "#d99a55") + R(-12, -60, 8, 10, WEISS, 1.5, `stroke="${RAND}" stroke-width="1"`) + R(-12, -56, 8, 3, "#3a86ff") +
      Array.from({ length: 8 }, (_, i) => R(-46 + i * 11.5, -103, 11.5, 11, i % 2 ? WEISS : c) + P(`M${-46 + i * 11.5} -92a5.75 5.75 0 0 0 11.5 0z`, i % 2 ? WEISS : c)).join("") +
      R(-30, -112, 60, 10, HOLZ_D, 2) + T(0, -104.3, "LADEN", 8, WEISS) +
      R(-46, -50, 92, 6, shade(HOLZ, -0.12), 3) + R(-44, -44, 88, 44, HOLZ, 3) + R(-44, -44, 88, 5, c) +
      R(-38, -35, 36, 29, shade(HOLZ, 0.14), 2) + R(2, -35, 36, 29, shade(HOLZ, 0.14), 2) + stern(-20, -20, 7, "#ffd166") + herz(20, -20, 6, c) +
      R(18, -60, 20, 10, "#a78bfa", 2) + R(20, -65, 11, 5.5, "#e2e8f0", 1) + R(22, -57, 3, 2, WEISS) + R(27, -57, 3, 2, WEISS) + R(32, -57, 3, 2, WEISS) },
    w_spielteppich: { name: "Spielteppich", der: "der Spielteppich", art: "flach", w: 140, h: 18, tags: ["teppich", "spielzeug"], d: () =>
      P("M-70 0L-60 -18H60L70 0Z", "#7cc05e") + R(-70, -1.5, 140, 1.5, "#5aa34a") +
      E(0, -9, 46, 5.6, "none", `stroke="#6b7280" stroke-width="3.8"`) + E(0, -9, 46, 5.6, "none", `stroke="${WEISS}" stroke-width="0.7" stroke-dasharray="2.5 2.5"`) +
      R(-2, -4.6, 1.2, 3, WEISS) + R(0.4, -4.6, 1.2, 3, WEISS) + R(2.8, -4.6, 1.2, 3, WEISS) +
      E(-56, -8, 6, 2.2, "#6cc3d5") + C(55, -11, 2.4, "#3f8f3f") + C(59.5, -7.5, 2.6, "#4aa34a") + R(-10, -16, 6, 3, "#ef5350", 1) + R(14, -5, 6, 3, "#3a86ff", 1) +
      R(-26, -10, 5, 3.5, "#ffd166", 0.8) + P("M-26.6 -10L-23.5 -12.6L-20.4 -10Z", "#ef5350") + C(-14, -8.5, 2, "#4aa34a") },
    w_holzeisenbahn: { name: "Holzeisenbahn", der: "die Holzeisenbahn", klein: true, w: 44, h: 24, tags: ["spielzeug"], d: () =>
      R(-22, -3, 44, 3, HOLZ, 1.5) + S("M-20 -1.5H20", HOLZ_D, 0.8) +
      R(-19, -18, 5, 5, "#7c5ce6", 1) + R(-13.5, -17, 5, 4, "#7cc05e", 1) + R(-21, -13, 15, 7, "#ffd166", 2) + R(-6.5, -9, 4, 1.6, DUNKEL, 0.8) +
      R(7, -14, 12, 8, "#ef5350", 3) + R(12.5, -20, 4, 6, DUNKEL, 1.5) + R(11.5, -21, 6, 2, DUNKEL, 1) + C(19.5, -8, 1.4, DUNKEL) +
      R(-3, -22, 11, 16, "#3a86ff", 2) + R(-0.5, -19, 6, 5, "#a8ddf0", 1) + R(-4, -24, 13, 3, "#ffd166", 1.5) +
      [-17.5, -9.5].map((x) => C(x, -4.5, 2.5, DUNKEL)).join("") + [0.5, 9, 16].map((x) => C(x, -4.5, 2.8, DUNKEL) + C(x, -4.5, 1, "#ffd166")).join("") },
    w_raketenlampe: { name: "Raketenlampe", der: "die Raketenlampe", klein: true, w: 26, h: 42, licht: true, tags: ["lampe"], d: () =>
      P("M-7 -17L-13 0L-7 -5Z", "#ef5350") + P("M7 -17L13 0L7 -5Z", "#ef5350") + P("M-3.6 -4.5Q0 -0.5 3.6 -4.5Z", "#ffd166") +
      P("M-7 -5V-26Q-7 -35.5 0 -41.2Q7 -35.5 7 -26V-5Z", WEISS, `stroke="${RAND}" stroke-width="1.2"`) + P("M-6.4 -30Q-5 -36.5 0 -41.2Q5 -36.5 6.4 -30Z", "#ef5350") +
      C(0, -20, 3.8, "#3a86ff") + C(0, -20, 2.5, "#fff6c2") + R(-7, -8, 14, 3, "#ef5350", 1.2) },
    w_nachtlicht: { name: "Nachtlicht", der: "das Nachtlicht", klein: true, w: 24, h: 26, licht: true, tags: ["lampe"], d: () =>
      R(-9, -4, 18, 4, "#a78bfa", 2) + P("M3 -24.5A10.5 10.5 0 1 0 3 -4.5A13 13 0 0 1 3 -24.5Z", "#fff1b8", `stroke="#f5cf6b" stroke-width="1"`) +
      S("M-6 -17q1.6 1.6 3.2 0", "#c99a2e", 1) + C(-5.5, -12, 1.4, "#ffb3c7") + S("M-6 -10q1.4 1 2.8 0", "#c99a2e", 0.9) + stern(8, -20, 2.8, "#ffd166") },
    w_bilderbuchregal: { name: "Bilderbuchregal", der: "das Bilderbuchregal", w: 74, h: 80, farbe: "#7cc05e", tags: ["regal"], flaeche: -80, fx: [-33, 33], d: (c) =>
      R(-31, -75, 62, 75, shade(c, 0.5)) + R(-37, -80, 6, 80, c, 2) + R(31, -80, 6, 80, c, 2) + R(-37, -80, 74, 5, shade(c, -0.15), 2) +
      bilderbuch(-28, -54, 26, 20, "#ff7a7a", C(-14, -64, 4.5, "#ffd166")) + bilderbuch(1, -54, 26, 18, "#6cc3d5", P("M10 -63q5 -5 10 0q-5 5 -10 0z", "#ff9f43") + P("M20 -63l4 -3v6z", "#ff9f43")) +
      bilderbuch(-27, -29, 24, 20, "#ffd166", herz(-14, -39.5, 4, "#ef5350")) + bilderbuch(0, -29, 27, 19, "#a78bfa", stern(14.5, -39, 6, "#ffd166")) +
      bilderbuch(-28, -4, 26, 18, "#ff9f6b", C(-14, -13, 4.5, "#3a86ff") + P("M-18.5 -13a4.5 4.5 0 0 0 9 0z", "#ffd166")) + bilderbuch(1, -4, 26, 19, "#3a86ff", P("M17 -18a5.5 5.5 0 1 0 0 9a4.2 4.2 0 1 1 0 -9z", "#fff1b8")) +
      [-54, -29, -4].map((y) => R(-31, y - 3, 62, 3, shade(c, -0.1), 1) + R(-31, y, 62, 4, shade(c, -0.25), 1.5)).join("") },
    w_spielkueche: { name: "Spielküche", der: "die Spielküche", w: 74, h: 88, farbe: "#ff9fb5", tags: ["spielzeug"], flaeche: -52, fx: [-34, 34], d: (c) =>
      R(-35, -88, 70, 38, shade(c, 0.3), 4) + C(-24, -80, 2.5, "#ffd166") + C(-16, -80, 2.5, "#7cc05e") + C(-8, -80, 2.5, "#3a86ff") +
      C(19, -75, 7, WEISS) + S("M19 -75V-79.5M19 -75L22 -73.5", TINTE, 1.2) + herz(2, -80, 3.6, shade(c, -0.15)) +
      S("M26 -52V-60H20V-58", METALL, 2.4) +
      R(-35, -48, 70, 44, c, 4) + R(-33, -4, 6, 4, shade(c, -0.3), 1.5) + R(27, -4, 6, 4, shade(c, -0.3), 1.5) +
      R(-31, -42, 32, 34, shade(c, 0.18), 3) + C(-15, -24, 9, "#2d3748") + C(-15, -24, 7, "#a8ddf0") + P("M-20 -21h10v-3.5q-5 -3 -10 0z", "#ffd166") + R(-27, -39, 24, 2.5, WEISS, 1.25) +
      R(5, -42, 26, 34, shade(c, 0.18), 3) + C(9, -25, 2, WEISS) +
      R(-36.5, -52, 73, 5, WEISS, 2.5, `stroke="${RAND}" stroke-width="1"`) + E(-20, -52, 7, 1.6, DUNKEL) + E(-2, -52, 7, 1.6, DUNKEL) + R(12, -52.5, 18, 2.5, "#a8d8f8", 1.25) +
      R(-26, -59, 12, 7, "#ffd166", 2) + R(-27, -61, 14, 2.5, "#e8b94f", 1.25) + C(-20, -62.5, 1.3, DUNKEL) },
    w_musikdose: { name: "Musikdose", der: "die Musikdose", klein: true, w: 34, h: 26, tags: ["spielzeug", "musik"], d: () =>
      P("M-12 -12L-10 -24H10L12 -12Z", "#ffb3c7") + R(-6, -22, 12, 7, "#e6f6fc", 1) +
      R(-12, -12, 24, 12, "#ff9fb5", 2) + R(-12, -12, 24, 2, "#e8b94f", 1) + R(-12, -2, 24, 2, "#e8b94f", 1) + herz(0, -6.5, 2.6, "#ef5350") +
      S("M12 -7H15V-11", "#e8b94f", 1.5) + C(15, -11.5, 1.4, "#e8b94f") +
      E(0, -14.5, 3.8, 1.3, "#ff7aa2") + R(-0.6, -18, 1.2, 4, "#ff7aa2") + S("M-0.6 -14V-12M0.6 -14V-12", "#ffd8b8", 0.8) + S("M-3 -20L0 -17.5L3 -20", "#ffd8b8", 0.8) + C(0, -19.5, 1.6, "#ffd8b8") +
      T(-9, -20, "♪", 9, "#7c5ce6") + T(10, -21, "♫", 8, "#3a86ff") },
    w_farbstifte: { name: "Farbstifte", der: "die Farbstifte", klein: true, w: 24, h: 34, tags: ["malen"], d: () =>
      stift(-4.5, -31, "#ef5350", -11) + stift(-1.5, -34, "#ffd166", -4) + stift(1.5, -32, "#3a86ff", 4) + stift(4.5, -30, "#7cc05e", 11) +
      P("M-9 -16H9L8 0H-8Z", "#6cc3d5") + R(-9.5, -17, 19, 2.5, "#4fa9bd", 1.25) + stern(0, -8, 3.6, "#ffd166") },
    w_messlatte: { name: "Messlatte", der: "die Messlatte", art: "wand", w: 40, h: 124, tags: ["bild"], d: () =>
      R(-19, -52, 7, 112, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) +
      Array.from({ length: 11 }, (_, i) => S(`M-19 ${56 - i * 10}h${i % 2 ? 3 : 5}`, TINTE, 1)).join("") +
      R(-3, 40, 4, 20, "#ffd166", 2) + R(2, 40, 4, 18, "#f5c542", 2) + R(10, 40, 4, 20, "#ffd166", 2) + R(15, 40, 4, 18, "#f5c542", 2) +
      E(7.5, 38, 12.5, 9, "#ffd166") + P("M0 34L5 -44H13L16 34Z", "#ffd166") +
      S("M7 -56V-60M12 -56V-60", "#e8b94f", 1.6) + C(7, -60, 1.6, "#a46c43") + C(12, -60, 1.6, "#a46c43") +
      E(10, -49, 8.5, 6.5, "#ffd166") + E(15.5, -46, 4.5, 3.6, "#ffe08a") + E(3, -53, 3.2, 1.6, "#f5c542") + C(11, -51, 1.2, TINTE) + C(17.5, -46.5, 0.7, "#a46c43") +
      [[6, -32, 2.6], [11, -20, 2.4], [7, -8, 2.6], [12, 6, 2.4], [7, 20, 2.6], [2, 37, 3], [10, 40, 3.4], [16, 35, 2.6]].map(([x, y, r]) => C(x, y, r, "#e8a85a")).join("") },
  };

  // ---------------------------------------------------------------------------
  // Dinge je Zimmer: zuerst die eigenen, dann passende aus bau-moebel.js.
  // Was es überall gibt (Deckenlampe, Bild, Fenster, Pflanze, Uhr …), fehlt hier.
  // ---------------------------------------------------------------------------
  const RAEUME = {
    eingang: ["w_haustuer", "w_schirmstaender", "w_fussmatte", "w_schluesselbrett", "w_gummistiefel", "w_kinderwagen", "w_hutablage", "w_rucksack",
      "w_gegensprechanlage", "w_trottinett", "w_velohelm", "garderobe", "schuhregal", "bank", "spiegel", "briefkasten", "laeufer", "kommode"],
    wohnzimmer: ["w_fernsehmoebel", "w_standuhr", "w_plattenspieler", "w_brettspiel", "w_jasskarten", "w_pouf", "w_holzkorb", "w_familienfotos",
      "ecksofa", "kamin", "aquarium", "sofa", "sessel", "couchtisch", "fernseher", "sideboard", "buecherregal", "kissen", "radio", "schaukelstuhl"],
    kueche: ["w_abwaschmaschine", "w_abfallkuebel", "w_kuechenhelfer", "w_mixer", "w_guetzliblech", "kochherd", "kuehlschrank", "spuele", "kuechenschrank",
      "haengeschrank", "dunstabzug", "gewuerzregal", "topf", "pfanne", "mikrowelle", "kaffeemaschine", "toaster", "wasserkocher", "obstschale", "brotkorb", "tisch", "stuhl"],
    esszimmer: ["w_geschirrschrank", "w_hochstuhl", "w_eckbank", "w_fondue", "w_raclette", "w_kerzenstaender", "w_suppenschuessel", "w_wasserkrug", "w_kuckucksuhr",
      "esstisch", "geschirr", "stuhl", "sideboard", "kronleuchter", "teller", "blumenvase", "obstschale", "zopf", "kaffeetasse"],
    schlafzimmer: ["w_himmelbett", "w_schminktisch", "w_standspiegel", "w_truhe", "w_leselampe", "w_radiowecker", "w_bettvorleger", "w_finken", "w_schmuckkaestchen",
      "w_bettflasche", "w_pyjama", "bett", "doppelbett", "kleiderschrank", "wecker", "nachttisch", "kommode", "tischlampe", "vorhangfenster", "spiegel", "kissen", "buecherstapel"],
    kinderzimmer: ["w_spielzelt", "w_kaufladen", "w_spielteppich", "w_holzeisenbahn", "w_raketenlampe", "w_nachtlicht", "w_bilderbuchregal", "w_spielkueche", "w_musikdose",
      "w_farbstifte", "w_messlatte", "hochbett", "kinderbett", "spielkiste", "kloetze", "ball", "kuscheltier", "schaukelpferd", "puppenhaus", "tisch", "stuhl",
      "sitzsack", "regal", "poster", "lichterkette", "staffelei"],
  };

  // ---------------------------------------------------------------------------
  // Das Bild an der Wand jedes Zimmers (Bereich -23..23 mal -17..17).
  // ---------------------------------------------------------------------------
  const MOTIVE = {
    eingang: () => R(-23, 11, 46, 6, "#9be07a") + R(-12, -3, 24, 16, "#ffb38a", 1) + P("M-16 -2L0 -15L16 -2Z", "#ef5350") +
      R(-4, 2, 8, 11, "#4f8ef7", 1) + C(2.2, 8, 0.9, "#ffd166") + C(-8, 3, 2.4, "#a8ddf0") + C(8, 3, 2.4, "#a8ddf0") + P("M-4 13h8l2 4h-12z", "#d9a066"),
    wohnzimmer: () => R(-19, -6, 32, 10, "#ff8a65", 4) + R(-17, -1, 28, 7, "#ff9f80", 3) + R(-22, -3, 6, 11, "#f27a55", 3) + R(10, -3, 6, 11, "#f27a55", 3) +
      R(-18, 8, 3, 4, "#6b4a33", 1) + R(9, 8, 3, 4, "#6b4a33", 1) + R(-11, -4, 7, 5, "#ffd166", 2) + R(17.2, -9, 1.6, 21, DUNKEL) + P("M13 -8L15 -14H21L23 -8Z", "#ffd166") + R(-23, 12, 46, 5, "#e2c9a6"),
    kueche: () => S("M-5 -9q-2.4 -1.8 0 -3.5t0 -3.5M2 -9q-2.4 -1.8 0 -3.5t0 -3.5", "#cbd5e0", 1.5) + R(-12, -4, 24, 16, "#ef5350", 3) + R(-14, -6, 28, 4, "#d43f3a", 2) +
      R(-2, -9, 4, 3, DUNKEL, 1.5) + R(-17, -1, 5, 3, DUNKEL, 1.5) + R(12, -1, 5, 3, DUNKEL, 1.5) + C(0, 4, 3, "#ffd166") + R(-23, 12, 46, 5, "#cbd5e0"),
    esszimmer: () => C(0, 0, 12, WEISS, `stroke="${RAND}" stroke-width="1.5"`) + C(0, 0, 8, "none", `stroke="#a8d8f8" stroke-width="1.5"`) + C(-2, -1, 3.6, "#ffd166") + C(3, 2, 2.6, "#7cc05e") + C(2, -3, 2, "#ef5350") +
      S("M-17 -10V10M-19 -10V-4M-15 -10V-4M-19 -4H-15", METALL_D, 1.4) + S("M17 -10V10", METALL_D, 1.8) + P("M17 -10q3 2 2 9h-2z", METALL),
    schlafzimmer: () => R(-23, -17, 46, 34, "#2d3a6b", 2) + P("M2 -12A12 12 0 1 0 2 10A16 16 0 0 1 2 -12Z", "#fff1b8") +
      stern(12, -9, 2.6, "#ffd166") + stern(-14, -10, 2, "#ffd166") + stern(-16, 8, 2.4, "#ffd166") + stern(17, 9, 1.8, "#ffd166") + T(13, 3, "z", 6, "#a8d8f8") + T(17, -2, "z", 4.5, "#a8d8f8"),
    kinderzimmer: () => C(-8, -9, 4.4, "#c88c5c") + C(8, -9, 4.4, "#c88c5c") + C(-8, -9, 2.2, "#e2b27a") + C(8, -9, 2.2, "#e2b27a") + C(0, 1, 11, "#c88c5c") +
      E(0, 5, 5, 3.6, "#e2b27a") + C(-4, -1.5, 1.3, TINTE) + C(4, -1.5, 1.3, TINTE) + C(0, 3.5, 1.4, TINTE) + S("M-2 6.5q2 1.6 4 0", TINTE, 1) +
      P("M0 12L-7 8.5V15.5Z", "#ef5350") + P("M0 12L7 8.5V15.5Z", "#ef5350") + C(0, 12, 1.8, "#d43f3a"),
  };

  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
