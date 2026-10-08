/*
 * bau-moebel-haus.js – Die eigenen Dinge der Zimmer Badezimmer, Waschzimmer,
 * Bastelzimmer, Terrasse und Keller im Wohnhaus (Bauecke).
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten und die Bildmotive an.
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, leg, stern, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE } = M.hilfe;

  const DINGE = {
    // --- Badezimmer -------------------------------------------------------------
    h_waschtisch: { name: "Waschtisch", der: "der Waschtisch", kat: "bad", w: 84, h: 72, farbe: "#6cc3d5", tags: ["lavabo"], flaeche: -50, fx: [-40, -16], d: (c) =>
      S("M26 -50v-16q0-4-4-4h-8v3", METALL, 3.5) + S("M26 -63l5-4", METALL_D, 2.5) +
      R(-40, -44, 80, 38, c, 4) + R(-36, -40, 34, 30, shade(c, 0.15), 3) + R(2, -40, 34, 30, shade(c, 0.15), 3) +
      R(-7, -30, 3, 10, DUNKEL, 1.5) + R(4, -30, 3, 10, DUNKEL, 1.5) + leg(-36, 6, DUNKEL, 4) + leg(32, 6, DUNKEL, 4) +
      R(-42, -50, 84, 7, WEISS, 3, `stroke="${RAND}" stroke-width="1.5"`) +
      P("M-12 -62h44q-2 12-22 12t-22-12z", WEISS, `stroke="${RAND}" stroke-width="2"`) + E(10, -61, 18, 2.2, "#a8ddf0") },
    h_spiegelschrank: { name: "Spiegelschrank", der: "der Spiegelschrank", kat: "bad", art: "wand", w: 70, h: 58, licht: true, tags: ["spiegel", "schrank"], d: () =>
      R(-30, -29, 60, 6, "#fff6c2", 3) + R(-34, -25, 68, 3, METALL, 1.5) +
      R(-35, -22, 70, 46, WEISS, 4, `stroke="${RAND}" stroke-width="2"`) + R(-31, -18, 30, 38, "#cfe9f3", 2) + R(1, -18, 30, 38, "#cfe9f3", 2) +
      S("M-25 -6l10-9M-21 4l6-5M7 -6l10-9M11 4l6-5", WEISS, 2.5) + R(-4, -2, 2, 8, METALL_D, 1) + R(2, -2, 2, 8, METALL_D, 1) + R(-30, 25, 60, 4, "#e2e8f0", 2) },
    h_bademantel: { name: "Bademantel", der: "der Bademantel", kat: "bad", art: "wand", w: 50, h: 74, farbe: "#c9b6ff", d: (c) =>
      R(-3, -37, 6, 6, METALL_D, 3) +
      R(-25, -27, 9, 38, shade(c, -0.12), 4) + R(16, -27, 9, 38, shade(c, -0.12), 4) + R(-25, 8, 9, 4, shade(c, 0.3), 2) + R(16, 8, 9, 4, shade(c, 0.3), 2) +
      P("M-9 -33L-20 -28L-21 37H21L20 -28L9 -33Q0 -29 -9 -33Z", c) + P("M-9 -33L0 -8L9 -33L5 -34L0 -18L-5 -34Z", shade(c, 0.3)) +
      R(-21, -2, 42, 5, shade(c, -0.2), 2) + S("M-2 3l-5 13M2 3l4 12", shade(c, -0.2), 3) + R(-17, 12, 11, 9, shade(c, 0.15), 2) + R(-21, 33, 42, 4, shade(c, 0.25), 2) },
    h_wcpapier: { name: "WC-Papier", der: "das WC-Papier", kat: "bad", art: "wand", w: 36, h: 42, d: () =>
      R(-16, -21, 33, 3.5, METALL, 1.75) + R(-16, -21, 3, 15, METALL_D, 1.5) + R(14, -21, 3, 15, METALL_D, 1.5) +
      R(-12, -17, 26, 22, WEISS, 5, `stroke="${RAND}" stroke-width="1.5"`) + R(-6, -14, 17, 3, "#eef3f8", 1.5) +
      E(-12, -6, 4.5, 11, WEISS, `stroke="${RAND}" stroke-width="1.5"`) + E(-12, -6, 1.8, 4.5, "#cbd5e0") +
      R(-6, -2, 18, 23, WEISS, 1, `stroke="${RAND}" stroke-width="1.5"`) + S("M-4 7h14M-4 14h14", RAND, 1.2, `stroke-dasharray="2 2"`) },
    h_wcbuerste: { name: "WC-Bürste", der: "die WC-Bürste", kat: "bad", w: 18, h: 40, farbe: "#6cc3d5", d: (c) =>
      R(-1.6, -37, 3.2, 24, c, 1.5) + C(0, -37, 2.6, c) + P("M-8 -16h16l-1.5 16h-13z", WEISS, `stroke="${RAND}" stroke-width="1.5"`) + R(-7.6, -12, 15.2, 3, c) },
    h_personenwaage: { name: "Personenwaage", der: "die Personenwaage", kat: "bad", w: 46, h: 16, d: () =>
      P("M-18 -15H18L23 -5H-23Z", "#e2e8f0") + R(-23, -6, 46, 6, "#a0aec0", 3) +
      R(-7, -14, 14, 5, "#2d3748", 1.5) + T(0, -10.2, "20", 4.5, "#7cff9e") + E(-11, -7.5, 5, 1.6, "#cbd5e0") + E(11, -7.5, 5, 1.6, "#cbd5e0") },
    h_foehn: { name: "Föhn", der: "der Föhn", kat: "bad", klein: true, w: 34, h: 30, farbe: "#ff7aa2", d: (c) =>
      S("M-1 -3q-8 3-14 0", DUNKEL, 1.5) + P("M-5 -18h10l2 16h-10z", shade(c, -0.12)) +
      R(8, -28, 9, 10, shade(c, -0.25), 2) + R(-13, -30, 24, 14, c, 7) + C(-10, -23, 6.5, shade(c, -0.15)) +
      S("M-14 -23h6M-11 -26v6", shade(c, -0.35), 1.2) + R(-1, -13, 4, 4, WEISS, 1) + S("M-7 -27h10", shade(c, 0.3), 2) },
    h_badeente: { name: "Badeente", der: "die Badeente", kat: "bad", klein: true, w: 28, h: 24, tags: ["spielzeug"], d: () =>
      P("M-11 -9l-3-8l8 4z", "#ffd166") + E(-1, -7, 12, 7, "#ffd166") + C(6, -16, 6.5, "#ffd166") +
      P("M11 -17.5l3 1.5-3 2.5z", "#ff9f43") + C(7.5, -18, 1.3, TINTE) + P("M-6 -9q6-6 11 0q-6 3-11 0z", "#f5b83d") },
    h_seifenspender: { name: "Seifenspender", der: "der Seifenspender", kat: "bad", klein: true, w: 18, h: 28, farbe: "#7cc05e", d: (c) =>
      R(-7, -19, 14, 19, c, 4) + R(-7, -8, 14, 8, shade(c, -0.15), 3) + R(-4.5, -15, 9, 7, WEISS, 2) + C(-1, -12, 1.6, "#a8ddf0") + C(1.8, -10.5, 1.2, "#a8ddf0") +
      R(-1.5, -23, 3, 5, METALL_D, 1) + R(-3, -27, 11, 4, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) },
    h_zahnpasta: { name: "Zahnpasta", der: "die Zahnpasta", kat: "bad", klein: true, w: 32, h: 12, d: () =>
      P("M-13 -11H5L10 -8V-3L5 0H-13Z", WEISS, `stroke="${RAND}" stroke-width="1.2"`) + R(-15, -11.5, 3, 12, "#cbd5e0", 1) +
      R(-7, -9, 9, 7, "#3a86ff", 1.5) + R(10, -8, 4, 5, "#ef5350", 1) },

    // --- Waschzimmer ------------------------------------------------------------
    h_waschtrog: { name: "Waschtrog", der: "der Waschtrog", kat: "bad", w: 72, h: 80, tags: ["lavabo"], d: () =>
      S("M22 -62v-12h-12v4", METALL, 4) + R(18, -80, 9, 4, "#3a86ff", 2) + P("M10 -68q-2 3 0 4.5q2-1.5 0-4.5z", "#6cc3d5") +
      leg(-32, 34, METALL_D, 5) + leg(27, 34, METALL_D, 5) + R(-30, -14, 60, 3, METALL, 1.5) +
      R(-34, -60, 68, 28, "#e2e8f0", 6) + R(-36, -64, 72, 7, "#cbd5e0", 3.5) + R(-30, -55, 60, 4, "#bcc7d3", 2) },
    h_waescheleine: { name: "Wäscheleine", der: "die Wäscheleine", kat: "bad", art: "decke", w: 180, h: 56, tags: ["waesche"], d: () => {
      const hemd = (x, y, f) => P(`M${x - 8} ${y}L${x - 16} ${y + 2}L${x - 21} ${y + 11}L${x - 15} ${y + 14}L${x - 12} ${y + 9}V${y + 30}H${x + 12}V${y + 9}L${x + 15} ${y + 14}L${x + 21} ${y + 11}L${x + 16} ${y + 2}L${x + 8} ${y}Q${x} ${y + 5} ${x - 8} ${y}Z`, f);
      const socke = (x, y, f) => P(`M${x} ${y}h7v12q0 2 2 2h4q4 0 4 4t-4 4h-9q-4 0-4-4z`, f) + R(x, y, 7, 3, shade(f, -0.2), 1);
      const klammer = (x, y) => R(x - 1.5, y - 3, 3, 7, HOLZ, 1);
      return S("M-86 0v12M86 0v12", METALL_D, 1.6) + S("M-86 12Q0 26 86 12", "#9aa5b1", 1.6) +
        hemd(-56, 16, "#ff7a7a") + klammer(-66, 15) + klammer(-46, 17) +
        socke(-30, 18, "#ffd166") + klammer(-26.5, 18.3) + socke(-12, 18.8, "#6cc3d5") + klammer(-8.5, 18.9) +
        P("M8 18.5H30L32 52H22L19 30L16 52H6Z", "#3a86ff") + R(8, 18.5, 22, 4, "#2f6fd6", 1) + klammer(11, 18.8) + klammer(27, 18.3) +
        P("M52 16H64L67 24L72 46H44L49 24Z", "#a78bfa") + klammer(55, 16.4) + klammer(61, 15.6);
    } },
    h_waeschesack: { name: "Wäschesack", der: "der Wäschesack", kat: "bad", w: 46, h: 62, farbe: "#7cc05e", tags: ["waesche"], d: (c) =>
      P("M-9 -46q-6-10 1-14l5 3q-3 4 0 11z", "#ff7a7a") + P("M3 -46l3-12h7l-2 12z", "#ffd166") +
      P("M-19 0q-6-22 1-42l-2-6h40l-2 6q7 20 1 42z", c) + S("M-15 -44q15 5 30 0", shade(c, -0.25), 2.2) + S("M12 -42l3 10", shade(c, -0.25), 1.5) + C(15, -31, 2.2, shade(c, -0.3)) +
      C(-8, -24, 3, shade(c, 0.3)) + C(6, -14, 3, shade(c, 0.3)) + C(-4, -8, 2.5, shade(c, 0.3)) + C(8, -30, 2.5, shade(c, 0.3)) },
    h_putzkessel: { name: "Putzkessel", der: "der Putzkessel", kat: "bad", w: 50, h: 96, farbe: "#ef5350", d: (c) =>
      S("M2 -26L20 -92", HOLZ, 4) + C(20.5, -93, 2.5, shade(HOLZ, -0.2)) +
      [[-14, -31, 4.5], [-6, -33, 5.5], [4, -31, 4.5]].map(([x, y, r]) => C(x, y, r, "#eef8fc", `stroke="#a8ddf0" stroke-width="1.2"`)).join("") +
      P("M-23 -30h34l-3 30h-28z", c) + R(-24, -32, 36, 5, shade(c, -0.15), 2.5) + S("M-21 -28q15-20 30 0", METALL_D, 1.6) + R(-18, -18, 24, 3, shade(c, 0.25), 1.5) +
      P("M-22 -33h9v13q-4.5 3-9 0z", "#ffd166") + S("M-20 -26h5", "#e8b94f", 1.2) },
    h_staubsauger: { name: "Staubsauger", der: "der Staubsauger", kat: "bad", w: 66, h: 62, farbe: "#a78bfa", d: (c) =>
      S("M10 -58L25 -6", METALL, 4) + R(17, -7, 15, 7, DUNKEL, 3) +
      S("M-2 -18C8 -22 2 -52 10 -58", DUNKEL, 4) + R(5, -62, 12, 7, shade(c, -0.2), 3) +
      P("M-30 -6C-32 -26 -18 -34 -8 -32C2 -30 6 -20 4 -6Z", c) + S("M-24 -24q6-6 14-5", shade(c, 0.35), 3) + C(-12, -20, 3, WEISS) +
      C(-20, -5, 5, DUNKEL) + C(-4, -5, 5, DUNKEL) + C(-20, -5, 2, METALL) + C(-4, -5, 2, METALL) },
    h_hemd: { name: "Hemd am Bügel", der: "das Hemd am Bügel", kat: "bad", art: "wand", w: 48, h: 66, farbe: "#a8d8f8", tags: ["waesche"], d: (c) =>
      S("M0 -26v-3q0-3 3-3t3 3", METALL_D, 1.8) +
      R(-23, -21, 8, 37, shade(c, -0.1), 3) + R(15, -21, 8, 37, shade(c, -0.1), 3) + R(-23, 12, 8, 5, shade(c, -0.28), 2) + R(15, 12, 8, 5, shade(c, -0.28), 2) +
      P("M-8 -26L-19 -21V31H19V-21L8 -26Q0 -22 -8 -26Z", c) + S("M0 -20V31", shade(c, -0.18), 1.4) +
      [-12, -2, 8, 18].map((y) => C(2.4, y, 1.3, shade(c, -0.4))).join("") + R(-14, -14, 9, 8, shade(c, 0.2), 1.5) +
      P("M-8 -26L-2 -16L0 -21L2 -16L8 -26L0 -23Z", WEISS) },
    h_buegeleisen: { name: "Bügeleisen", der: "das Bügeleisen", kat: "bad", klein: true, w: 34, h: 24, farbe: "#6cc3d5", tags: ["buegeln"], d: (c) =>
      S("M-11 -15V-20Q-11 -22 -8 -22H3Q6 -22 7 -15", shade(c, -0.3), 3) +
      P("M-15 -5V-11Q-15 -15 -10 -15H2Q9 -15 15 -5Z", c) + C(-6, -10, 2.6, WEISS) + C(-6, -10, 1, shade(c, -0.3)) +
      P("M-16 -5H15Q17 -3 17 0H-16Z", METALL) + S("M-15 -9q-3 3-1 9", DUNKEL, 1.4) },
    h_waschmittel: { name: "Waschmittel", der: "das Waschmittel", kat: "bad", klein: true, w: 22, h: 30, farbe: "#3a86ff", tags: ["waesche"], d: (c) =>
      R(3, -29, 7, 6, "#ffd166", 1.5) + R(-10, -24, 20, 24, c, 4) + R(-7, -21, 6, 8, shade(c, -0.3), 2.5) +
      R(-7, -11, 14, 8, WEISS, 2) + C(-3, -7, 2.2, "#a8ddf0") + C(1.5, -8, 1.6, "#a8ddf0") + C(3.5, -5.5, 1.3, "#a8ddf0") },
    h_klammern: { name: "Wäscheklammern", der: "die Wäscheklammern", kat: "bad", klein: true, w: 30, h: 24, tags: ["waesche"], d: () =>
      [[-8, "#ff7a7a", -14], [-2, "#ffd166", 6], [4, "#7cc05e", -6], [9, "#6cc3d5", 14]].map(([x, f, a]) =>
        R(x - 1.8, -23, 3.6, 13, f, 1.2, `transform="rotate(${a} ${x} -12)"`) + C(x, -17, 0.9, METALL_D, `transform="rotate(${a} ${x} -12)"`)).join("") +
      P("M-14 -12h28l-3 12h-22z", "#e2c9a6") + S("M-13 -7.5h26M-12 -3.5h24", "#c4a57e", 1.4) },
    h_socken: { name: "Socken", der: "die Socken", kat: "bad", klein: true, w: 32, h: 20, farbe: "#ff9f6b", tags: ["waesche"], d: (c) =>
      [-15, -1].map((x) => P(`M${x} -20h7v10q0 2 2 2h4q4 0 4 4t-4 4h-9q-4 0-4-4z`, c) + R(x, -20, 7, 3, shade(c, -0.22), 1) + R(x, -14, 7, 2, WEISS) + P(`M${x + 13} -8q4 0 4 4t-4 4z`, shade(c, -0.22))).join("") },
    h_spruehflasche: { name: "Sprühflasche", der: "die Sprühflasche", kat: "bad", klein: true, w: 22, h: 32, farbe: "#ff9fb5", d: (c) =>
      P("M-7 0V-14Q-7 -18 -4 -19H4Q7 -18 7 -14V0Z", c) + R(-5, -13, 10, 7, WEISS, 1.5) + P("M0 -12q-2.6 3 0 4.4q2.6-1.4 0-4.4z", shade(c, -0.2)) +
      R(-3, -23, 6, 5, WEISS, 1, `stroke="${RAND}" stroke-width="1"`) + P("M-4 -23V-30H6L10 -27V-23Z", WEISS, `stroke="${RAND}" stroke-width="1"`) + R(9.5, -29, 1.6, 3, DUNKEL, 0.6) +
      P("M2 -23l2 6h-2.5l-1.5-6z", "#cbd5e0") },

    // --- Bastelzimmer -----------------------------------------------------------
    h_basteltisch: { name: "Basteltisch", der: "der Basteltisch", kat: "buero", w: 100, h: 50, farbe: "#ffd166", tags: ["tisch", "malen"], flaeche: -50, d: (c) =>
      leg(-46, 42, shade(c, -0.3), 6) + leg(40, 42, shade(c, -0.3), 6) + R(-44, -16, 88, 5, shade(c, -0.18), 2) +
      ["#ef5350", "#ffd166", "#3a86ff", "#7cc05e", "#ff9fb5"].map((f, i) => R(-38, -18.6 - i * 2.6, 26, 2.6, f, 1)).join("") +
      ["#ef5350", "#ffd166", "#7cc05e", "#a78bfa", "#ff9f43"].map((f, i) => P(`M${11 + i * 5} -27v-4l2-3l2 3v4z`, f)).join("") + R(8, -27, 28, 11, "#3a86ff", 2) +
      R(-50, -50, 100, 8, c, 3) + C(-30, -46, 2.4, "#ef5350") + E(-10, -45.5, 4, 2, "#3a86ff") + P("M-12 -43h4v4a2 2 0 0 1-4 0z", "#3a86ff") + C(16, -46, 2, "#7cc05e") + E(34, -45.5, 3, 1.8, "#a78bfa") },
    h_werkbank: { name: "Werkbank", der: "die Werkbank", kat: "laden", w: 110, h: 64, tags: ["werkzeug", "tisch"], flaeche: -52, fx: [-24, 50], d: () =>
      R(-50, -42, 8, 42, HOLZ_D, 2) + R(42, -42, 8, 42, HOLZ_D, 2) + R(-50, -14, 100, 5, HOLZ_D, 2) +
      R(-40, -22, 34, 8, "#e8c48f", 1.5) + R(-36, -28, 30, 6, "#d9a066", 1.5) +
      R(0, -27, 11, 12, HOLZ_DD, 3) + R(3, -24, 5, 5, "#f6e7d0", 2) + P("M9 -25L40 -21V-16H9Z", METALL) + P(`M10 -16${"l1.5 2l1.5-2".repeat(10)}z`, METALL_D) +
      R(-55, -52, 110, 10, HOLZ, 3) + R(-55, -44, 110, 2, HOLZ_D) +
      R(-50, -60, 22, 8, "#3a86ff", 2) + R(-48, -64, 6, 5, METALL_D, 1) + R(-36, -64, 6, 5, METALL_D, 1) + S("M-39 -56h-14", METALL, 2.4) + C(-53, -56, 2, METALL_D) },
    h_naehmaschine: { name: "Nähmaschine", der: "die Nähmaschine", kat: "buero", klein: true, w: 40, h: 36, farbe: "#ef5350", d: (c) =>
      R(-19, -9, 17, 3, "#6cc3d5", 1) + R(-20, -6, 40, 6, shade(c, -0.3), 2) +
      R(7, -28, 10, 23, c, 3) + R(-17, -29, 34, 9, c, 4.5) + R(-17, -29, 9, 16, c, 3) + S("M-13.5 -13v5", METALL_D, 1.4) + R(-16.5, -9.5, 6, 2, METALL_D, 1) +
      C(16, -23, 4, shade(c, -0.2)) + C(16, -23, 1.4, WEISS) + R(-4, -26.5, 9, 2.5, WEISS, 1.25, `opacity="0.6"`) +
      R(0, -34, 5, 5, "#ffd166", 1) + R(-1, -35, 7, 1.5, HOLZ_D, 0.75) + R(-1, -29.5, 7, 1.5, HOLZ_D, 0.75) + S("M2.5 -31.5q-10-2-15 11", "#ffd166", 0.8) },
    h_wollkorb: { name: "Wollkorb", der: "der Wollkorb", kat: "buero", klein: true, w: 36, h: 34, d: () =>
      S("M5 -14L12 -31M9 -14L16 -29", METALL, 1.8) + C(12, -31, 1.8, "#ef5350") + C(16, -29, 1.8, "#ef5350") +
      C(-8, -15, 7, "#ff7aa2") + S("M-13 -18q5 4 10 0M-14 -13q6 3 12-1", shade("#ff7aa2", -0.2), 1.1) +
      C(6, -16, 7, "#7cc05e") + S("M1 -19q5 4 10 0M0 -14q6 3 12-1", shade("#7cc05e", -0.2), 1.1) +
      C(-1, -21, 6, "#ffd166") + S("M-5 -24q4 3 8 0", shade("#ffd166", -0.2), 1.1) +
      P("M-17 -14h34l-3 14h-28z", "#d9a066") + S("M-16 -9.5h32M-15 -4.5h30", "#b9773a", 1.4) + S("M-15 -12q-3 6-1 12", "#ff7aa2", 1.2) },
    h_farbpalette: { name: "Farbpalette", der: "die Farbpalette", kat: "buero", klein: true, w: 38, h: 30, tags: ["malen"], d: () =>
      P("M2 -29C-12 -29 -19 -21 -19 -13C-19 -4 -11 0 -1 0C8 0 13 -4 11 -8C9 -12 3 -11 4 -15C5 -19 14 -18 17 -21C20 -25 13 -29 2 -29Z", HOLZ) +
      C(9, -23, 2.6, "#fbf8f2") + C(-12, -19, 3.4, "#ef5350") + C(-5, -24, 3.4, "#ffd166") + C(3, -24.5, 3, "#7cc05e") + C(-13, -10, 3.4, "#3a86ff") + C(-5, -5, 3.2, "#a78bfa") + C(4, -4.5, 2.8, "#ff9f43") +
      S("M-6 -12L14 -2", HOLZ_DD, 2) + P("M-7.5 -12.8l-3.5-1.7 1.5 3.5z", "#ef5350") },
    h_pinselbecher: { name: "Pinselbecher", der: "der Pinselbecher", kat: "buero", klein: true, w: 22, h: 36, tags: ["malen"], d: () =>
      S("M-4 -14L-7 -29M0 -14V-31M4 -14L8 -28", HOLZ_D, 2) + E(-7.3, -30.5, 1.9, 3.2, "#ef5350") + E(0, -32.5, 1.9, 3.2, "#ffd166") + E(8.3, -29.5, 1.9, 3.2, "#3a86ff") +
      P("M-8 -17h16l-1.5 17h-13z", "#e6f6fc", `stroke="${RAND}" stroke-width="1.2"`) + P("M-7.6 -11h15.2l-1 10.5h-13.2z", "#a78bfa", `opacity="0.55"`) },
    h_bastelkiste: { name: "Bastelkiste", der: "die Bastelkiste", kat: "buero", w: 56, h: 42, farbe: "#a78bfa", d: (c) =>
      P("M-24 -24q-2-14 9-17q-2 9-7 17z", "#6cc3d5") + S("M4 -24q1-10 7-9q6 1 4-8", "#ff9f43", 2.4) +
      C(-13, -27, 5, "#ff7aa2") + C(-3, -29, 5, "#ffd166") + C(17, -27, 4.5, "#7cc05e") + C(8, -29, 4, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(9, -29, 2, TINTE) +
      R(-26, -26, 52, 26, c, 4) + R(-27, -28, 54, 7, shade(c, -0.15), 3.5) + R(-8, -18, 16, 4, shade(c, -0.35), 2) +
      C(-12, -8, 3, "#ffd166") + C(0, -8, 3, "#ef5350") + C(12, -8, 3, "#6cc3d5") },
    h_malschuerze: { name: "Malschürze", der: "die Malschürze", kat: "buero", art: "wand", w: 40, h: 58, farbe: "#3a86ff", tags: ["malen"], d: (c) =>
      C(0, -27, 2.4, METALL_D) + S("M-6 -18Q0 -32 6 -18", shade(c, -0.2), 2) + S("M-14 -2l-5 9M14 -2l5 9", shade(c, -0.2), 1.8) +
      P("M-7 -19H7L9 -6L15 -3L13 28H-13L-15 -3L-9 -6Z", c) + R(-7, 7, 14, 10, shade(c, 0.2), 2) +
      C(-8, -1, 2.6, "#ef5350") + C(5, -11, 2, "#7cc05e") + C(8, 14, 2.3, "#ffd166") + E(-6, 21, 3, 2, "#ff9fb5") + C(1, 0, 1.6, "#ffd166") },
    h_knete: { name: "Knete", der: "die Knete", kat: "buero", klein: true, w: 34, h: 17, d: () =>
      R(-16, -13, 11, 13, "#ff7a7a", 2.5) + R(-17, -16, 13, 4, shade("#ff7a7a", -0.2), 2) +
      R(-3, -11, 11, 11, "#ffd166", 2.5) + R(-4, -14, 13, 4, shade("#ffd166", -0.2), 2) +
      C(12, -12, 4, "#6cc3d5") + S("M6 -2.5h6q3 0 3-3", "#7cc05e", 4) },
    h_leim: { name: "Leim", der: "der Leim", kat: "buero", klein: true, w: 14, h: 28, d: () =>
      R(-6, -18, 12, 18, WEISS, 3, `stroke="${RAND}" stroke-width="1.5"`) + R(-6, -12, 12, 7, "#ff9f43", 1) + P("M-4 -18h8l-2-6h-4z", "#ff9f43") + R(-0.8, -28, 1.6, 4.5, "#ff9f43", 0.8) },
    h_schere: { name: "Schere", der: "die Schere", kat: "buero", klein: true, w: 32, h: 17, farbe: "#ef5350", d: (c) =>
      P("M-3 -9L15 -15L15.6 -13L-2 -7Z", METALL) + P("M-3 -7L15 -1L15.6 -3L-2 -9Z", METALL_D) +
      S("M-7 -10.5L-3 -8.5M-7 -5.5L-3 -7.5", c, 2.4) + C(-11, -11.5, 3.4, "none", `stroke="${c}" stroke-width="2.4"`) + C(-11, -4.2, 3.4, "none", `stroke="${c}" stroke-width="2.4"`) + C(-2.5, -8, 1.2, DUNKEL) },
    h_kartonrakete: { name: "Kartonrakete", der: "die Kartonrakete", kat: "spielen", w: 46, h: 92, tags: ["spielzeug"], d: () =>
      P("M-12 -36L-22 -10V0H-12Z", "#ef5350") + P("M12 -36L22 -10V0H12Z", "#ef5350") + P("M-8 -10L-5 0L-2 -6L0 0L2 -6L5 0L8 -10Z", "#ff9f43") +
      R(-12, -74, 24, 64, "#d9a066", 2) + R(-12, -48, 24, 3, "#c4904f") + R(-12, -24, 24, 3, "#c4904f") + S("M-6 -70v20", "#e8b57a", 2) +
      P("M-12 -74L0 -91L12 -74Z", "#ef5350") + C(0, -60, 6.5, "#6cc3d5", `stroke="${WEISS}" stroke-width="2"`) + stern(0, -36, 5, "#ffd166") },
    h_bilderleine: { name: "Bilderleine", der: "die Bilderleine", kat: "buero", art: "decke", w: 170, h: 52, tags: ["bild"], d: () => {
      const blatt = (x, y) => R(x - 13, y, 26, 32, WEISS, 1, `stroke="${RAND}" stroke-width="1.2"`) + R(x - 1.5, y - 3, 3, 7, "#ff7aa2", 1);
      return S("M-82 0v10M82 0v10", METALL_D, 1.5) + S("M-82 10Q0 22 82 10", "#9aa5b1", 1.5) +
        blatt(-52, 13.5) + C(-45, 21, 4, "#ffd166") + R(-60, 31, 12, 10, "#ef5350") + P("M-62 31l8-7l8 7z", "#a46c43") + R(-63, 41, 22, 3, "#7cc05e") +
        blatt(0, 16) + S("M0 44v-14", "#5cb85c", 1.6) + C(0, 26, 6, "#ff7aa2") + C(0, 26, 2.6, "#ffd166") + P("M0 38q-6-4-6 0q3 2 6 0z", "#5cb85c") +
        blatt(52, 13.5) + [["#ef5350", 10], ["#ffd166", 7.5], ["#3a86ff", 5]].map(([f, r]) => P(`M${52 - r} 35a${r} ${r} 0 0 1 ${r * 2} 0`, "none", `stroke="${f}" stroke-width="2.4"`)).join("") + C(59, 20, 3, "#ffd166");
    } },

    // --- Terrasse ---------------------------------------------------------------
    h_sonnenschirm: { name: "Sonnenschirm", der: "der Sonnenschirm", kat: "deko", w: 120, h: 140, farbe: "#ef5350", d: (c) =>
      P("M-16 0L-11 -9H11L16 0Z", DUNKEL) + R(-2, -134, 4, 126, METALL_D, 2) +
      P("M-60 -98C-50 -124 -26 -136 0 -136C26 -136 50 -124 60 -98Z", c) + P("M0 -136L-36 -98H-12Z", WEISS) + P("M0 -136L12 -98H36Z", WEISS) +
      [-48, -24, 0, 24, 48].map((x, i) => P(`M${x - 12} -98.5a12 7 0 0 0 24 0z`, i % 2 ? WEISS : c)).join("") + C(0, -137, 3, shade(c, -0.25)) },
    h_grill: { name: "Grill", der: "der Grill", kat: "kueche", w: 64, h: 86, d: () =>
      S("M-12 -64q-5-6 0-11t0-10M4 -64q-5-6 0-11t0-10", "#cbd5e0", 2.2) +
      S("M-14 -36L-22 -2M14 -36L22 -2M0 -34V-4", DUNKEL, 3) + R(-10, -16, 20, 3, METALL, 1.5) +
      P("M-26 -52H26Q26 -30 0 -30Q-26 -30 -26 -52Z", "#2d3748") + R(-30, -50, 6, 3, DUNKEL, 1.5) + R(24, -50, 6, 3, DUNKEL, 1.5) +
      R(-24, -54, 48, 2.5, "#ff7a3d", 1) + R(-27, -56, 54, 3, METALL, 1.5) +
      R(-19, -62, 15, 6, "#c0583a", 3) + R(1, -62, 15, 6, "#d0663f", 3) + S("M-15 -62v6M-9 -62v6M5 -62v6M11 -62v6", "#8a3a22", 1) },
    h_gartentisch: { name: "Gartentisch", der: "der Gartentisch", kat: "tische", w: 80, h: 48, farbe: "#5cbf62", tags: ["tisch"], flaeche: -48, d: (c) =>
      S("M-28 -43Q-34 -20 -27 -2M28 -43Q34 -20 27 -2", shade(c, -0.22), 3.5) + S("M0 -43V-2", shade(c, -0.22), 3) + S("M-30 -20Q0 -14 30 -20", shade(c, -0.22), 2) +
      R(-34, -44, 68, 4, shade(c, -0.12), 2) + R(-40, -48, 80, 5, c, 2.5) },
    h_gartenstuhl: { name: "Gartenstuhl", der: "der Gartenstuhl", kat: "sitzen", w: 42, h: 66, farbe: "#5cbf62", tags: ["stuhl", "sitz"], d: (c) =>
      R(-16, -66, 4, 38, shade(c, -0.22), 2) + R(12, -66, 4, 38, shade(c, -0.22), 2) +
      [-64, -55, -46].map((y) => R(-17, y, 34, 6, c, 2.5)).join("") +
      S("M-15 -28L-19 -2M15 -28L19 -2M-14 -12L14 -20", shade(c, -0.22), 3) + R(-20, -33, 40, 6, c, 3) },
    h_haengematte: { name: "Hängematte", der: "die Hängematte", kat: "spielen", w: 170, h: 90, farbe: "#ff9f43", tags: ["sitz"], d: (c) =>
      R(-78, -7, 156, 6, HOLZ_D, 3) + S("M-72 -4Q-86 -50 -70 -86M72 -4Q86 -50 70 -86", HOLZ_D, 5) +
      S("M-70 -86L-56 -58M-70 -86L-50 -55M70 -86L56 -58M70 -86L50 -55", "#c4a57e", 1.4) +
      P("M-58 -60Q0 -20 58 -60L56 -52Q0 12 -56 -52Z", c) + S("M-57 -57Q0 -14 57 -57", "#ffd166", 2.5) + S("M-56 -54Q0 4 56 -54", WEISS, 1.6) },
    h_planschbecken: { name: "Planschbecken", der: "das Planschbecken", kat: "spielen", w: 120, h: 38, farbe: "#6cc3d5", d: (c) =>
      E(0, -31, 54, 6, "#4fb3e8") + S("M-30 -33q4-2 8 0M14 -34q4-2 8 0", WEISS, 1.4, `opacity="0.8"`) +
      R(-60, -11, 120, 11, c, 5.5) + R(-59, -21, 118, 11, "#ffd166", 5.5) + R(-58, -31, 116, 11, c, 5.5) +
      [-40, -20, 0, 20, 40].map((x) => C(x, -15.5, 1.8, WEISS)).join("") },
    h_gartenzwerg: { name: "Gartenzwerg", der: "der Gartenzwerg", kat: "deko", w: 28, h: 50, d: () =>
      R(-10, -5, 9, 5, "#5b3a29", 2.5) + R(1, -5, 9, 5, "#5b3a29", 2.5) +
      P("M-11 -30Q-13 -16 -10 -4H10Q13 -16 11 -30Z", "#3a86ff") + R(-11, -16, 22, 3, "#5b3a29") + R(-2, -16.5, 4, 4, "#ffd166", 1) +
      C(0, -33, 6, "#ffd7b5") + P("M-6.5 -32Q-7 -19 0 -17Q7 -19 6.5 -32Q0 -28 -6.5 -32Z", WEISS, `stroke="${RAND}" stroke-width="1"`) + C(0, -31.5, 2, "#ff9f9f") +
      C(-2.6, -33.3, 0.9, TINTE) + C(2.6, -33.3, 0.9, TINTE) + P("M-8 -36Q-6 -46 3 -50Q4 -43 8 -36Z", "#ef5350") + R(-8.5, -37.5, 17, 3, shade("#ef5350", -0.15), 1.5) },
    h_hochbeet: { name: "Hochbeet", der: "das Hochbeet", kat: "deko", w: 90, h: 64, tags: ["pflanze", "gemuese"], d: () =>
      S("M14 -40V-62", HOLZ_D, 2) + S("M14 -46q-8-2-10-8M14 -54q8-2 10-8M14 -44q7 0 9-6", "#4aa34a", 2.4) + C(8, -50, 3.6, "#ef5350") + C(20, -56, 3.6, "#ef5350") + C(18, -46, 3.2, "#ff7a59") +
      C(-30, -43, 7.5, "#5cb85c") + C(-30, -44, 4, "#9be07a") + C(-12, -43, 7.5, "#5cb85c") + C(-12, -44, 4, "#9be07a") +
      S("M30 -40l-3-11M33 -40l1-12M36 -40l4-10", "#5cb85c", 2) + R(-42, -42, 84, 5, "#7a5235", 2) + P("M29 -42h7l-3.5 5z", "#ff9f43") +
      R(-45, -38, 90, 32, HOLZ, 3) + S("M-45 -28h90M-45 -17h90", HOLZ_D, 1.5) + leg(-42, 6, HOLZ_DD, 6) + leg(36, 6, HOLZ_DD, 6) },
    h_blumenkiste: { name: "Blumenkiste", der: "die Blumenkiste", kat: "deko", w: 72, h: 42, farbe: "#d9734e", tags: ["blumen", "pflanze"], d: (c) => {
      const bluete = (x, y, f) => [0, 1, 2, 3, 4].map((i) => C((x + 3.4 * Math.cos(i * 1.2566 - 1.5708)).toFixed(1), (y + 3.4 * Math.sin(i * 1.2566 - 1.5708)).toFixed(1), 3, f)).join("") + C(x, y, 2, "#ffd166");
      return [-27, -15, -3, 9, 21, 29].map((x) => C(x, -22, 6.5, "#4aa34a")).join("") + [-22, -8, 6, 20].map((x) => C(x, -26, 6, "#5cb85c")).join("") +
        [[-25, -33], [-11, -30], [3, -33], [17, -30], [29, -33]].map(([x, y], i) => bluete(x, y, i % 2 ? "#ff7aa2" : "#ef5350")).join("") +
        R(-35, -18, 70, 18, c, 3) + R(-36, -20, 72, 5, shade(c, -0.15), 2.5) + R(-30, -12, 60, 2, shade(c, 0.2), 1);
    } },
    h_gelaender: { name: "Geländer", der: "das Geländer", kat: "deko", w: 130, h: 58, farbe: "#ffffff", flaeche: -54, d: (c) => {
      const rand = `stroke="${shade(c, -0.18)}" stroke-width="1.2"`;
      return [-42, -30, -18, -6, 6, 18, 30, 42].map((x) => R(x - 3, -48, 6, 38, shade(c, -0.06), 2, rand)).join("") +
        R(-63, -14, 126, 5, shade(c, -0.1), 2, rand) + R(-65, -58, 9, 58, c, 2, rand) + R(56, -58, 9, 58, c, 2, rand) + R(-62, -54, 124, 7, c, 3, rand);
    } },
    h_giesskanne: { name: "Giesskanne", der: "die Giesskanne", kat: "deko", klein: true, w: 36, h: 30, farbe: "#5cbf62", d: (c) =>
      S("M-13 -18Q-13 -27 -5 -27Q3 -27 3 -18", shade(c, -0.25), 2.6) +
      P("M3 -8L13 -22L15.5 -20L6 -3Z", c) + P("M11 -25.5L16 -27L18 -21L13.5 -20Z", shade(c, -0.25)) +
      R(-16, -18, 21, 18, c, 3) + R(-16, -18, 21, 4, shade(c, -0.15), 2) + R(-12, -11, 13, 2, shade(c, 0.3), 1) },
    h_sirup: { name: "Sirup", der: "der Sirup", kat: "essen", klein: true, w: 36, h: 26, tags: ["trinken"], d: () =>
      S("M-12 -18q-5 0-5 6t5 5", RAND, 2.2) + P("M-12 0V-21Q-12 -24 -9 -24H1Q4 -24 4 -21V0Z", "#e6f6fc", `stroke="${RAND}" stroke-width="1"`) +
      R(-11.5, -16, 15, 15.5, "#ef5350", 2, `opacity="0.85"`) + P("M4 -22l3-2v3z", "#e6f6fc", `stroke="${RAND}" stroke-width="1"`) +
      S("M14 -13L16.5 -24", "#ffd166", 1.6) + R(8, -14, 9, 14, "#e6f6fc", 2, `stroke="${RAND}" stroke-width="1"`) + R(8.5, -10, 8, 9.5, "#ef5350", 1.5, `opacity="0.85"`) + C(15.5, -14.5, 2.4, "#ffd166") },
    h_lampions: { name: "Lampions", der: "die Lampions", kat: "deko", art: "decke", w: 180, h: 46, licht: true, tags: ["lampe", "deko"], d: () =>
      S("M-86 0v6M86 0v6", METALL_D, 1.5) + S("M-86 6Q0 24 86 6", "#4a5568", 1.5) +
      [[-60, "#ef5350"], [-30, "#ffd166"], [0, "#5cbf62"], [30, "#ff9f43"], [60, "#3a86ff"]].map(([x, f]) => {
        const y = Math.round((6 + 9 * (1 - (x / 86) ** 2)) * 10) / 10;
        return S(`M${x} ${y}v3`, DUNKEL, 1.2) + R(x - 4, y + 3, 8, 3, DUNKEL, 1) + E(x, y + 15, 10, 10, f) + E(x, y + 15, 4.5, 6.5, "#fff6c2", `opacity="0.55"`) +
          S(`M${x - 9} ${y + 11}h18M${x - 9.5} ${y + 15}h19M${x - 9} ${y + 19}h18`, shade(f, -0.2), 1) + R(x - 3, y + 24, 6, 3, DUNKEL, 1);
      }).join("") },
    h_windspiel: { name: "Windspiel", der: "das Windspiel", kat: "deko", art: "decke", w: 36, h: 76, tags: ["deko"], d: () =>
      S("M0 0V14", "#9aa5b1", 1.2) + E(0, 16, 15, 3.5, HOLZ) + S("M-11 18v4M-4 18v4M4 18v4M11 18v4M0 18v40", "#9aa5b1", 1) +
      [[-11, 26, "#ef5350"], [-4, 34, "#ffd166"], [4, 30, "#6cc3d5"], [11, 22, "#a78bfa"]].map(([x, l, f]) => R(x - 2, 22, 4, l, f, 2)).join("") +
      C(0, 50, 3, HOLZ_D) + stern(0, 66, 9, "#ffd166") },

    // --- Keller -----------------------------------------------------------------
    h_vorratsregal: { name: "Vorratsregal", der: "das Vorratsregal", kat: "tische", w: 86, h: 108, tags: ["regal", "essen"], flaeche: -108, d: () => {
      const glas = (x, unten, f) => R(x - 6, unten - 16, 12, 16, "#e6f6fc", 3, `stroke="${RAND}" stroke-width="1"`) + R(x - 5.5, unten - 12, 11, 11.5, f, 2.5) +
        R(x - 7, unten - 19, 14, 4, "#ef5350", 1.5) + C(x - 3.5, unten - 17, 0.9, WEISS) + C(x, unten - 17, 0.9, WEISS) + C(x + 3.5, unten - 17, 0.9, WEISS);
      const flasche = (x, unten, f) => R(x - 4.5, unten - 16, 9, 16, f, 3) + R(x - 2, unten - 22, 4, 7, f, 1.5) + R(x - 2.5, unten - 24, 5, 3, DUNKEL, 1) + R(x - 3, unten - 12, 6, 6, WEISS, 1);
      return R(-43, -108, 6, 108, HOLZ_D, 2) + R(37, -108, 6, 108, HOLZ_D, 2) +
        glas(-26, -74, "#e0435a") + glas(-10, -74, "#ff9f43") + glas(6, -74, "#8e44ad") + glas(22, -74, "#e0435a") +
        flasche(-28, -40, "#e8b94f") + flasche(-17, -40, "#e8b94f") + glas(2, -40, "#9bc53d") + glas(20, -40, "#ff9f43") +
        C(-28, -22, 5, "#ef5350") + C(-19, -23, 5, "#7cc05e") + C(-10, -22, 5, "#ef5350") + R(-34, -20, 30, 14, HOLZ_D, 2) +
        P("M6 -6q-3-16 4-19h14q7 3 4 19z", "#e2c9a6") + P("M12 -25l-3-5h16l-3 5z", "#d4b48a") + S("M11 -25h14", "#b9773a", 1.6) +
        [-108, -74, -40, -6].map((y) => R(-43, y, 86, 6, HOLZ, 2)).join("");
    } },
    h_mostfass: { name: "Mostfass", der: "das Mostfass", kat: "kueche", w: 62, h: 66, tags: ["trinken"], d: () =>
      P("M-30 0L-21 -18H-13L-17 0Z", HOLZ_D) + P("M30 0L21 -18H13L17 0Z", HOLZ_D) +
      C(0, -38, 27, "#6b7280") + C(0, -38, 24, "#b07a4f") + C(0, -38, 20, "#c98d55") +
      S("M-10 -55.3V-20.7M0 -58V-18M10 -55.3V-20.7", "#a46c43", 1.4) + R(-13, -49, 26, 10, "#f2d9b0", 2) + T(0, -41.5, "MOST", 8, "#5b3a29") +
      R(-1, -20, 2, 12, "#ffd166", 1) + R(-5, -31, 10, 3, METALL, 1.5) + R(-2, -29, 4, 9, METALL_D, 1.5) +
      R(-5, -9, 10, 9, "#e6f6fc", 2, `stroke="${RAND}" stroke-width="1"`) + R(-4.5, -6, 9, 5.5, "#ffd166", 1.5) },
    h_kartoffelkiste: { name: "Kartoffelkiste", der: "die Kartoffelkiste", kat: "essen", w: 58, h: 42, tags: ["essen", "gemuese"], d: () =>
      [[-12, -35, 7, 5], [3, -36, 7, 5.5], [-18, -29, 8, 6], [-4, -31, 8, 6], [10, -29, 8, 6], [21, -31, 6.5, 5.5]].map(([x, y, rx, ry], i) =>
        E(x, y, rx, ry, i % 2 ? "#d4ab72" : "#c9a06a") + C(x - 2, y - 1, 0.9, "#8a6a3a") + C(x + 3, y + 1, 0.8, "#8a6a3a")).join("") +
      R(-29, -26, 58, 26, HOLZ, 3) + R(-29, -17.5, 58, 2.5, HOLZ_D) + R(-29, -9, 58, 2.5, HOLZ_D) + R(-6, -23, 12, 4, HOLZ_DD, 2) },
    h_gefriertruhe: { name: "Gefriertruhe", der: "die Gefriertruhe", kat: "kueche", w: 94, h: 58, flaeche: -58, d: () =>
      R(-45, -50, 90, 46, WEISS, 5, `stroke="${RAND}" stroke-width="2"`) + R(-46, -58, 92, 9, "#f1f5f9", 4, `stroke="${RAND}" stroke-width="2"`) +
      R(-10, -49, 20, 4, METALL_D, 2) + S("M0 -40v18M-7.8 -35.5l15.6 9M-7.8 -26.5l15.6 -9", "#6cc3d5", 2.2) +
      C(34, -42, 2.5, "#7cc05e") + S("M-38 -14h16M-38 -10h16", RAND, 1.5) + leg(-40, 4, DUNKEL, 5) + leg(35, 4, DUNKEL, 5) },
    h_heizung: { name: "Heizung", der: "die Heizung", kat: "deko", w: 60, h: 112, licht: true, d: () =>
      R(-20, -112, 6, 14, "#ef5350", 2) + R(14, -112, 6, 14, "#3a86ff", 2) +
      R(-28, -100, 56, 96, "#e2e8f0", 6) + R(-28, -100, 56, 16, "#cbd5e0", 6) + R(-28, -88, 56, 4, "#cbd5e0") + C(-12, -92, 3, "#7cc05e") + C(-3, -92, 3, "#ffd166") +
      C(10, -66, 9, WEISS, `stroke="${RAND}" stroke-width="2"`) + S("M10 -66l5-4", "#ef5350", 1.8) + C(10, -66, 1.5, DUNKEL) +
      R(-13, -44, 26, 20, "#2d3748", 3) + P("M-7 -26q-2-9 4-14q0 5 3 3q4 5-1 11z", "#ff9f43") + P("M-3 -26q0-5 2-7q2 4 2 7z", "#ffd166") +
      leg(-24, 4, DUNKEL, 6) + leg(18, 4, DUNKEL, 6) },
    h_schlitten: { name: "Schlitten", der: "der Schlitten", kat: "spielen", w: 86, h: 34, farbe: "#c88c5c", tags: ["spielzeug"], d: (c) =>
      R(-30, -27, 5, 23, shade(c, -0.2), 1.5) + R(-6, -27, 5, 23, shade(c, -0.2), 1.5) + R(18, -27, 5, 23, shade(c, -0.2), 1.5) +
      S("M-38 -3H30Q40 -3 40 -13Q40 -22 33 -25", shade(c, -0.3), 4) + S("M-38 -1H30", METALL, 1.6) +
      R(-38, -32, 72, 7, c, 3) + S("M-36 -28.5h68", shade(c, -0.15), 1) + S("M38 -20q6 8 2 18", "#ef5350", 1.8) },
    h_skis: { name: "Skis", der: "die Skis", kat: "spielen", w: 34, h: 118, farbe: "#ef5350", d: (c) =>
      S("M7 -2L9 -100M13 -2L13 -98", METALL_D, 2) + R(6.5, -108, 5, 11, DUNKEL, 2) + R(11, -106, 5, 11, DUNKEL, 2) +
      C(8.2, -12, 3.2, "none", `stroke="${DUNKEL}" stroke-width="1.5"`) + C(13, -12, 3.2, "none", `stroke="${DUNKEL}" stroke-width="1.5"`) +
      R(-14, -116, 8, 114, c, 4) + R(-5, -113, 8, 111, shade(c, -0.15), 4) +
      R(-14, -102, 8, 3, WEISS) + R(-5, -99, 8, 3, WEISS) + R(-15, -54, 10, 9, DUNKEL, 2) + R(-6, -51, 10, 9, DUNKEL, 2) },
    h_gartengeraete: { name: "Gartengeräte", der: "die Gartengeräte", kat: "laden", w: 44, h: 106, tags: ["werkzeug"], d: () =>
      R(-17, -106, 10, 4, HOLZ_DD, 2) + S("M-12 -102V-30", HOLZ_D, 3.5) + P("M-20 -32H-4V-11Q-4 -2 -12 0Q-20 -2 -20 -11Z", METALL) + R(-14, -36, 4, 6, METALL_D, 1) +
      S("M9 -104V-14", HOLZ, 3.5) + R(-2, -16, 22, 4, METALL_D, 1.5) + S("M0 -12v9M5 -12v9M10 -12v9M15 -12v9M19 -12v9", METALL_D, 1.8) },
    h_werkzeugkiste: { name: "Werkzeugkiste", der: "die Werkzeugkiste", kat: "laden", klein: true, w: 40, h: 32, farbe: "#ef5350", tags: ["werkzeug"], d: (c) =>
      R(-14, -28, 3, 12, HOLZ_D, 1) + R(-17, -31, 9, 4, METALL_D, 1.5) + R(8, -30, 4, 10, "#ffd166", 1.5) + S("M-8 -18V-24H8V-18", DUNKEL, 3) +
      R(-18, -18, 36, 18, c, 3) + R(-18, -18, 36, 5, shade(c, -0.15), 3) + R(-3, -15, 6, 5, METALL, 1) },
    h_taschenlampe: { name: "Taschenlampe", der: "die Taschenlampe", kat: "deko", klein: true, w: 36, h: 16, licht: true, d: () =>
      P("M11 -11L18 -15V0L11 -1Z", "#fff6c2", `opacity="0.75"`) +
      R(-17, -10, 20, 8, "#3a86ff", 3) + P("M3 -10L9 -12V0L3 -2Z", "#2d3748") + R(9, -12, 2, 12, "#fff6c2", 1) + R(-8, -12, 6, 2.5, "#ef5350", 1) },
    h_konfi: { name: "Konfitüre", der: "die Konfitüre", kat: "essen", klein: true, w: 36, h: 24, tags: ["essen"], d: () =>
      [[-8, "#e0435a"], [9, "#ff9f43"]].map(([x, f]) => R(x - 7, -18, 14, 18, "#e6f6fc", 3, `stroke="${RAND}" stroke-width="1"`) + R(x - 6.5, -14, 13, 13.5, f, 2.5) +
        R(x - 5, -11, 10, 6, WEISS, 1) + C(x, -8, 1.8, f) + P(`M${x - 9} -18L${x - 7} -23H${x + 7}L${x + 9} -18Z`, "#ef5350") +
        R(x - 4.5, -22, 2.5, 2, WEISS) + R(x + 0.5, -22, 2.5, 2, WEISS) + R(x - 7, -20, 2.5, 2, WEISS) + R(x - 2, -20, 2.5, 2, WEISS) + R(x + 3, -20, 2.5, 2, WEISS) +
        S(`M${x - 8} -18.5h16`, "#ffd166", 1)).join("") },
    h_spinnennetz: { name: "Spinnennetz", der: "das Spinnennetz", kat: "deko", art: "wand", w: 54, h: 54, d: () => {
      const winkel = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4);
      const pt = (a, r) => `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
      const ring = (r) => `M${pt(0, r)}` + winkel.map((a) => `Q${pt(a + Math.PI / 8, r * 0.8)} ${pt(a + Math.PI / 4, r)}`).join("");
      return S(winkel.map((a) => `M0 0L${pt(a, 25)}`).join(""), "#9aa5b1", 1) + [8, 15, 22].map((r) => S(ring(r), "#9aa5b1", 1)).join("") +
        S("M7 9l-6-4M7 12h-7M7 15l-6 4M15 9l6-4M15 12h7M15 15l6 4", TINTE, 1.3) + C(11, 13, 4.5, TINTE) + C(11, 7.5, 3, TINTE) + C(10, 7, 0.9, WEISS) + C(12, 7, 0.9, WEISS);
    } },
  };

  // Die Liste jedes Zimmers: zuerst, was nur hierher gehört, dazu Passendes
  // aus bau-moebel.js. Licht, Bild, Pflanze, Fenster, Uhr und Teppich gibt es
  // ohnehin überall.
  const RAEUME = {
    bad: ["wanne", "dusche", "wc", "lavabo", "h_waschtisch", "h_spiegelschrank", "spiegel", "handtuch", "h_bademantel", "h_wcpapier", "h_wcbuerste",
      "h_personenwaage", "zahnputzbecher", "h_zahnpasta", "h_seifenspender", "h_foehn", "h_badeente", "badteppich", "waeschekorb", "rundfenster"],
    waschzimmer: ["waschmaschine", "tumbler", "h_waschtrog", "lavabo", "waeschestaender", "h_waescheleine", "buegelbrett", "h_buegeleisen", "h_hemd",
      "waeschekorb", "h_waeschesack", "h_socken", "h_klammern", "h_waschmittel", "h_spruehflasche", "h_putzkessel", "h_staubsauger", "regal", "handtuch", "radio"],
    bastelzimmer: ["h_basteltisch", "h_werkbank", "staffelei", "h_bilderleine", "h_malschuerze", "farbtoepfe", "h_farbpalette", "h_pinselbecher", "h_bastelkiste",
      "h_naehmaschine", "h_wollkorb", "h_knete", "h_leim", "h_schere", "h_kartonrakete", "stuhl", "hocker", "regal", "pinnwand", "werkzeugwand", "poster"],
    terrasse: ["h_sonnenschirm", "liegestuhl", "h_haengematte", "h_gartentisch", "h_gartenstuhl", "bank", "h_grill", "h_sirup", "h_planschbecken", "ball",
      "h_hochbeet", "h_blumenkiste", "blumeneimer", "grosspflanze", "h_giesskanne", "h_gartenzwerg", "h_gelaender", "h_lampions", "lichterkette", "h_windspiel", "vogelhaus"],
    keller: ["h_vorratsregal", "regal", "h_konfi", "honig", "aepfel", "milch", "h_kartoffelkiste", "h_mostfass", "h_gefriertruhe", "h_heizung", "velo",
      "h_schlitten", "h_skis", "h_gartengeraete", "werkzeugwand", "h_werkzeugkiste", "h_taschenlampe", "pakete", "hantel", "h_spinnennetz"],
  };

  // Das Bild an der Wand (Bereich -23..23 mal -17..17, Grund cremeweiss).
  const glas = (x, f) => R(x - 7, -7, 14, 20, "#e6f6fc", 3, `stroke="${RAND}" stroke-width="1"`) + R(x - 6.5, -3, 13, 15.5, f, 2.5) + R(x - 5, 1, 10, 6, WEISS, 1) +
    P(`M${x - 9} -7L${x - 7} -12H${x + 7}L${x + 9} -7Z`, "#ef5350") + R(x - 4.5, -11, 2.5, 2, WEISS) + R(x + 0.5, -11, 2.5, 2, WEISS) + R(x - 2, -9, 2.5, 2, WEISS) + R(x + 3, -9, 2.5, 2, WEISS);
  const MOTIVE = {
    bad: () => R(-23, 4, 46, 13, "#a8ddf0") +
      P("M-11 2l-3-7l7 3z", "#ffd166") + E(-1, 3, 11, 6.5, "#ffd166") + C(6, -6, 6, "#ffd166") + P("M11 -7l5 1.5-5 2.5z", "#ff9f43") + C(7.5, -8, 1.2, TINTE) + P("M-6 2q5-5 10 0q-5 3-10 0z", "#f5b83d") +
      R(-23, 8, 46, 9, "#a8ddf0") + S("M-22 8q5.5-3 11 0t11 0t11 0t11 0", "#6cc3d5", 1.6) +
      C(-15, -9, 3, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(-9, -13, 2, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(16, -12, 2.5, WEISS, `stroke="${RAND}" stroke-width="1"`),
    waschzimmer: () => S("M-23 -12Q0 -4 23 -12", "#9aa5b1", 1.2) +
      P("M-14 -9L-20 -6L-22 0L-18 1.5L-17 -1V12H-3V-1L-2 1.5L2 0L0 -6L-6 -9Q-10 -6 -14 -9Z", "#ff7a7a") + R(-15, -11, 2.4, 5, HOLZ, 1) + R(-7.4, -11, 2.4, 5, HOLZ, 1) +
      P("M6 -8.5h5v8q0 2 2 2h3q3 0 3 3t-3 3h-7q-3 0-3-3z", "#ffd166") + R(6, -8.5, 5, 2.5, "#e8b94f", 1) + R(7.3, -11, 2.4, 5, HOLZ, 1) +
      C(14, -1, 2, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(18, -5, 1.4, WEISS, `stroke="${RAND}" stroke-width="1"`),
    bastelzimmer: () => P("M2 -15C-12 -15 -19 -9 -19 -1C-19 8 -10 13 0 13C9 13 13 9 11 5C9 2 3 3 4 -1C5 -5 14 -4 17 -7C20 -11 13 -15 2 -15Z", HOLZ) +
      C(9, -9, 2.4, "#fffaf0") + C(-12, -5, 3, "#ef5350") + C(-5, -10, 3, "#ffd166") + C(3, -10, 2.6, "#7cc05e") + C(-12, 5, 3, "#3a86ff") + C(-3, 8, 2.8, "#a78bfa") + C(5, 9, 2.4, "#ff9f43") +
      S("M8 6L21 15", HOLZ_DD, 2) + P("M6 4.5l-3-2 0.8 3.6z", "#ef5350"),
    terrasse: () => R(-23, 9, 46, 8, "#d9a066") + S("M-23 13h46", "#b9773a", 1) +
      C(15, -8, 4.5, "#ffd166") + S("M15 -16v2M15 -2v2M7 -8h2M21 -8h2M9.3 -13.7l1.4 1.4M19.3 -3.7l1.4 1.4M20.7 -13.7l-1.4 1.4M10.7 -3.7l-1.4 1.4", "#ffd166", 1.4) +
      S("M-6 -4V9", DUNKEL, 1.4) + P("M-21 -3Q-6 -19 9 -3Z", "#ef5350") + P("M-6 -11L-11 -3H-1Z", WEISS),
    keller: () => glas(-9, "#e0435a") + glas(9, "#8e44ad") + R(-23, 13, 46, 4, HOLZ),
  };

  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
