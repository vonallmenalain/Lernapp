/*
 * bau-moebel-station.js – Die eigenen Dinge der Zimmer Labor, Physiotherapie,
 * Bettenstation, Apotheke, Augenabteilung, Intensivstation und Cafeteria im
 * Spital (Bauecke).
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten und die Bildmotive an.
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, leg, stern, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE, BUNT } = M.hilfe;

  // Gerundet, damit in den Zeichnungen keine langen Kommazahlen stehen.
  const n = (v) => Math.round(v * 100) / 100;
  // Ein Rad mit Nabe.
  const rad = (x, y, r = 4) => C(x, y, r, DUNKEL) + C(x, y, n(r * 0.4), METALL);
  // Ein dunkler Bildschirm mit Rand.
  const schirm = (x, y, w, h) => R(x, y, w, h, "#2d3748", 3) + R(x + 2, y + 2, w - 4, h - 4, "#1a202c", 2);
  // Ein Herz um (x, y): oben bei y - 6k, die Spitze bei y + 3k, etwa 10k breit.
  const herz = (x, y, k, f) => P(`M${n(x)} ${n(y + 3 * k)}C${n(x - 6 * k)} ${n(y - k)} ${n(x - 6 * k)} ${n(y - 6 * k)} ${n(x - 3 * k)} ${n(y - 6 * k)}` +
    `C${n(x - 1.5 * k)} ${n(y - 6 * k)} ${n(x - 0.5 * k)} ${n(y - 5 * k)} ${n(x)} ${n(y - 4 * k)}C${n(x + 0.5 * k)} ${n(y - 5 * k)} ${n(x + 1.5 * k)} ${n(y - 6 * k)} ${n(x + 3 * k)} ${n(y - 6 * k)}` +
    `C${n(x + 6 * k)} ${n(y - 6 * k)} ${n(x + 6 * k)} ${n(y - k)} ${n(x)} ${n(y + 3 * k)}Z`, f);
  // Eine Herzschlag-Linie, w breit, ab (x, y).
  const ekg = (x, y, w, f, sw = 1.6) => S(`M${n(x)} ${n(y)}h${n(w * 0.3)}l${n(w * 0.06)} ${n(-w * 0.16)}l${n(w * 0.08)} ${n(w * 0.3)}l${n(w * 0.07)} ${n(-w * 0.22)}l${n(w * 0.05)} ${n(w * 0.08)}h${n(w * 0.44)}`, f, sw);
  // Eine Flasche, die bei y = unten steht.
  const flasche = (x, unten, w, h, f, deckel = DUNKEL) => R(x, unten - h, w, h, f, n(w * 0.35)) + R(n(x + w * 0.3), unten - h - 4, n(w * 0.4), 5, f, 1) + R(n(x + w * 0.27), unten - h - 5.5, n(w * 0.46), 2.4, deckel, 1);
  // Eine Hantel, die bei y = unten liegt.
  const hantel = (unten, halb, bw, bh, f) => R(-halb + bw, n(unten - bh / 2 - 1.3), 2 * (halb - bw), 2.6, METALL, 1.3) + R(-halb, unten - bh, bw, bh, f, 2) + R(halb - bw, unten - bh, bw, bh, f, 2);
  // Medikamenten-Packungen in einem Fach, immer gleich verteilt.
  function packungen(x0, x1, unten, reihe) {
    const farben = ["#ef5350", "#3a86ff", "#7cc05e", "#ff9f43", "#a78bfa", "#ffd166", "#6cc3d5", "#ff7aa2"];
    let s = "";
    let x = x0;
    for (let i = 0; x < x1 - 6; i += 1) {
      const w = 7 + ((i * 5 + reihe * 3) % 5);
      const h = 11 + ((i * 7 + reihe * 2) % 3) * 3;
      if (x + w > x1) break;
      const f = farben[(i + reihe * 3) % farben.length];
      s += (i + reihe) % 4 === 3
        ? flasche(x, unten, w, h - 3, "#a0522d", f)
        : R(x, unten - h, w, h, WEISS, 1.2, `stroke="${RAND}" stroke-width="0.8"`) + R(x, unten - h + 2, w, 3.4, f) + R(n(x + 1.5), unten - h + 7.4, w - 3, 1.3, "#cbd5e0");
      x = n(x + w + 1.4);
    }
    return s;
  }

  const DINGE = {
    // --- Labor -----------------------------------------------------------------
    t_laborabzug: { name: "Laborabzug", der: "der Laborabzug", w: 92, h: 132, farbe: "#6cc3d5", flaeche: -56, fx: [-36, 36], tags: ["labor"], d: (c) =>
      R(-12, -132, 24, 16, METALL, 2) + R(-16, -120, 32, 4, METALL_D, 2) +
      R(-46, -118, 92, 66, c, 5) + R(-40, -110, 80, 54, "#f1f5f9", 2) +
      P("M-32 -56l5-12v-8h6v8l5 12z", "#7cc05e") + S("M-27 -73v5", WEISS, 1.4, `opacity="0.7"`) +
      R(0, -82, 4, 12, "#c9b6ff", 1.5) + C(2, -64, 8, "#a78bfa") + C(-1, -67, 2, WEISS, `opacity="0.6"`) +
      R(16, -74, 12, 18, "#a0522d", 3) + R(19, -78, 6, 5, "#6b3a18", 1.5) + R(18, -68, 8, 6, WEISS, 1) +
      R(-40, -110, 80, 30, "#a8d8f8", 2, `opacity="0.45"`) + S("M-32 -100l12-6M-12 -100l6-3", WEISS, 2, `opacity="0.8"`) +
      R(-40, -82, 80, 4, shade(c, -0.3), 2) + C(43, -100, 2, "#7cff9e") +
      R(-46, -56, 92, 6, "#2d3748", 2) + R(-44, -50, 88, 46, shade(c, -0.08), 4) +
      R(-40, -46, 38, 38, shade(c, 0.18), 3) + R(2, -46, 38, 38, shade(c, 0.18), 3) +
      R(-7, -32, 3, 10, DUNKEL, 1.5) + R(4, -32, 3, 10, DUNKEL, 1.5) + leg(-42, 4, DUNKEL, 6) + leg(36, 4, DUNKEL, 6) },
    t_probenkuehlschrank: { name: "Probenkühlschrank", der: "der Probenkühlschrank", w: 56, h: 114, tags: ["kuehlschrank", "labor"], d: () =>
      R(-28, -114, 56, 110, WEISS, 6, `stroke="${RAND}" stroke-width="2"`) +
      R(-24, -110, 48, 14, "#e2e8f0", 3) + R(-20, -107, 18, 8, "#1a202c", 2) + T(-11, -100.6, "4°", 6.5, "#7cff9e") +
      S("M13 -103h8M17 -107v8M14.2 -105.8l5.6 5.6M19.8 -105.8l-5.6 5.6", "#3a86ff", 1.3) +
      R(-24, -92, 48, 82, "#e6f6fc", 3, `stroke="#a8ddf0" stroke-width="2"`) +
      [-70, -46, -22].map((y, r) => R(-22, y, 40, 2.5, "#a8ddf0", 1) + [-18, -11, -4, 3, 10].map((x, i) => {
        const f = BUNT[(i + r * 2) % BUNT.length];
        return R(x, y - 15, 5, 15, WEISS, 2.5, `stroke="${RAND}" stroke-width="0.8"`) + R(x, y - 8, 5, 8, f, 2.5) + R(x - 0.5, y - 17, 6, 3, shade(f, -0.25), 1);
      }).join("")).join("") +
      R(19, -78, 3, 30, METALL_D, 1.5) + leg(-22, 4, DUNKEL, 6) + leg(16, 4, DUNKEL, 6) },
    t_labortisch: { name: "Labortisch", der: "der Labortisch", w: 120, h: 104, farbe: "#6cc3d5", flaeche: -50, fx: [-38, 56], tags: ["tisch", "labor"], d: (c) =>
      R(-38, -84, 4, 34, METALL, 2) + R(52, -84, 4, 34, METALL, 2) + R(-42, -84, 102, 5, METALL_D, 2) +
      flasche(-33, -84, 10, 12, "#a0522d") + R(-31, -79, 6, 5, WEISS, 1) + flasche(-18, -84, 9, 10, "#3a86ff") +
      P("M-2 -84l4-9v-5h5v5l4 9z", "#ff9f43") + R(18, -94, 12, 10, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + R(17, -97, 14, 4, "#7cc05e", 2) +
      P("M38 -97h11l-1 13h-9z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="1"`) + R(39, -91, 9, 6.5, "#ffd166", 1) +
      S("M-52 -50v-14q0-5 5-5h5v5", METALL_D, 3) +
      R(-60, -50, 120, 7, "#2d3748", 2) + R(-58, -43, 116, 39, c, 3) +
      R(-54, -39, 34, 14, shade(c, 0.18), 2) + R(-54, -22, 34, 14, shade(c, 0.18), 2) + R(-41, -33, 8, 2.5, DUNKEL, 1.2) + R(-41, -16, 8, 2.5, DUNKEL, 1.2) +
      R(-16, -39, 34, 31, shade(c, 0.18), 2) + R(20, -39, 34, 31, shade(c, 0.18), 2) + R(13, -29, 2.5, 10, DUNKEL, 1.2) + R(23, -29, 2.5, 10, DUNKEL, 1.2) +
      R(-56, -4, 112, 4, shade(c, -0.35), 1.5) },
    t_analysegeraet: { name: "Analysegerät", der: "das Analysegerät", w: 84, h: 94, licht: true, tags: ["labor"], d: () =>
      R(-42, -78, 84, 74, WEISS, 6, `stroke="${RAND}" stroke-width="2"`) + R(-42, -58, 84, 6, "#3a86ff") +
      E(-16, -78, 20, 5, "#cbd5e0") +
      [-30, -23, -16, -9, -2].map((x, i) => R(x - 2, -92, 4, 14, "#e6f6fc", 2, `stroke="${RAND}" stroke-width="0.8"`) + R(x - 2, -86, 4, 8, ["#ef5350", "#ffd166", "#ef5350", "#7cc05e", "#a78bfa"][i], 2) + R(x - 2.5, -94, 5, 3, DUNKEL, 1)).join("") +
      R(-36, -81, 40, 4, "#a0aec0", 2) +
      schirm(10, -94, 28, 18) + R(15, -82, 3, 4, "#7cff9e") + R(19.5, -85, 3, 7, "#7cff9e") + R(24, -88, 3, 10, "#ffd166") + R(28.5, -84, 3, 6, "#7cff9e") +
      R(-36, -48, 42, 38, "#e2e8f0", 4) + C(-15, -29, 10, "#cbe9f5") + C(-15, -29, 3, "#a0aec0") + S("M-15 -36v14M-22 -29h14", "#a0aec0", 1.2) +
      R(14, -40, 22, 3, DUNKEL, 1.5) + R(16, -50, 18, 11, WEISS, 1, `stroke="${RAND}" stroke-width="1"`) + S("M19 -47h12M19 -44h8", "#9aa5b1", 1) +
      C(18, -24, 2.5, "#7cc05e") + C(25, -24, 2.5, "#ffd166") + C(32, -24, 2.5, "#ef5350") +
      leg(-38, 4, DUNKEL, 6) + leg(32, 4, DUNKEL, 6) },
    t_laborkittel: { name: "Laborkittel", der: "der Laborkittel", art: "wand", w: 44, h: 70, d: () =>
      R(-8, -35, 16, 6, HOLZ_D, 3) + S("M0 -30v4", METALL_D, 2) +
      P("M-12 -27h24l7 6l2 50q0 4-4 4h-34q-4 0-4-4l2-50z", "#f4f8fb", `stroke="#b9cad6" stroke-width="1.5"`) +
      S("M-14 -19l-1 38M14 -19l1 38", "#d5e1ea", 1.5) + R(-21, 18, 7, 4, "#e2ebf2", 1.5) + R(14, 18, 7, 4, "#e2ebf2", 1.5) +
      S("M-7 -27l7 13l7-13", "#b9cad6", 1.5) + S("M0 -14v47", "#d5e1ea", 1.5) +
      C(0, -6, 1.5, "#b9cad6") + C(0, 6, 1.5, "#b9cad6") + C(0, 18, 1.5, "#b9cad6") +
      R(4, -11, 2, 7, "#3a86ff", 1) + R(7.5, -10, 2, 6, "#ef5350", 1) + R(3, -6, 10, 9, "#e6eef4", 1.5) +
      R(-13, -8, 9, 5, "#6cc3d5", 1) },
    t_flaschenregal: { name: "Flaschenregal", der: "das Flaschenregal", art: "wand", w: 72, h: 36, tags: ["labor"], d: () =>
      flasche(-32, 8, 11, 15, "#a0522d") + R(-30.5, -2, 8, 6, WEISS, 1) +
      R(-12, -12, 4, 9, "#d6eef8", 1) + C(-10, 1, 7, "#d6eef8") + P("M-17 1a7 7 0 0 0 14 0z", "#3a86ff") +
      flasche(3, 8, 9, 13, "#5cbf62") + R(16, -2, 12, 10, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + R(15, -5, 14, 4, "#ef5350", 2) +
      R(-36, 8, 72, 5, HOLZ_D, 2) + P("M-30 13h6l-6 5z", HOLZ_DD) + P("M30 13h-6l6 5z", HOLZ_DD) },
    t_pipette: { name: "Pipette", der: "die Pipette", klein: true, w: 18, h: 36, tags: ["labor"], d: () =>
      R(-1.4, -30, 2.8, 22, "#e6f6fc", 1.4, `stroke="#8fc7e0" stroke-width="0.8" transform="rotate(12 0 -14)"`) +
      E(0, -31.5, 3.6, 4.5, "#ef5350", `transform="rotate(12 0 -14)"`) +
      P("M-8 -16h16l-1.5 16h-13z", "#e6f6fc", `stroke="${RAND}" stroke-width="1" opacity="0.85"`) + P("M-7.3 -9h14.6l-0.8 9h-13z", "#6cc3d5") +
      S("M-5 -13v8", WEISS, 1.2, `opacity="0.7"`) },
    t_petrischalen: { name: "Petrischalen", der: "die Petrischalen", klein: true, w: 34, h: 14, tags: ["labor"], d: () =>
      R(-16, -6, 32, 6, "#d6eef8", 2.5) + E(0, -6, 16, 3.2, "#e6f6fc", `stroke="${RAND}" stroke-width="1"`) +
      R(-15, -11, 30, 5, "#d6eef8", 2.5) + E(0, -11, 15, 3, "#ffe08a", `stroke="#cfe6f2" stroke-width="1"`) +
      C(-7, -11, 1.4, "#ef5350") + C(-2, -12, 1.1, "#7cc05e") + C(3, -10.5, 1.5, "#a78bfa") + C(8, -11.6, 1.2, "#ff9f43") + C(1, -12.6, 0.9, "#ef5350") },
    t_glaskolben: { name: "Glaskolben", der: "die Glaskolben", klein: true, w: 32, h: 36, tags: ["labor"], d: () =>
      P("M-9 -30h6v10l7 16q1 4-3 4h-14q-4 0-3-4l7-16z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="1"`) +
      P("M-12.5 -12h13l3.5 8q1 4-3 4h-14q-4 0-3-4z", "#7cc05e") + S("M-6 -27v6", WEISS, 1.2, `opacity="0.8"`) +
      C(-6, -33, 1.6, "#9be07a") + C(-3, -34.5, 1.1, "#9be07a") +
      R(7, -26, 4, 11, "#e6f6fc", 1, `stroke="#a8ddf0" stroke-width="1"`) + C(9, -9, 7, "#e6f6fc", `stroke="#a8ddf0" stroke-width="1"`) +
      P("M2 -9a7 7 0 0 0 14 0z", "#a78bfa") + C(9, -20, 1.2, "#c9b6ff") + E(9, -1.5, 5, 1.5, HOLZ_D) },
    t_bunsenbrenner: { name: "Bunsenbrenner", der: "der Bunsenbrenner", klein: true, w: 18, h: 38, tags: ["labor"], d: () =>
      E(0, -2.4, 9, 2.4, DUNKEL) + R(-8, -5, 16, 4, METALL_D, 2) + R(-2.5, -26, 5, 22, METALL, 1.5) + R(-3.5, -14, 7, 4, METALL_D, 1.2) +
      S("M3 -6q5 0 5 4", "#ff9f43", 2) +
      P("M0 -38q6 7 3.5 11.5q-3.5 2.5-7 0q-2.5-4.5 3.5-11.5z", "#3a86ff") + P("M0 -33q3 4 1.5 6.5q-1.5 1.2-3 0q-1-2.5 1.5-6.5z", "#a8d8f8") },
    t_schutzbrille: { name: "Schutzbrille", der: "die Schutzbrille", klein: true, w: 32, h: 14, farbe: "#7cc05e", d: (c) =>
      R(-16, -10, 32, 3, DUNKEL, 1.5) +
      P("M-13 -13q0-1 1-1h24q1 0 1 1v10q0 2-2 2h-7q-2-4-4-4t-4 4h-7q-2 0-2-2z", c) +
      R(-11, -12, 9, 7, "#cbe9f5", 2.5) + R(2, -12, 9, 7, "#cbe9f5", 2.5) + S("M-9 -9.5l3-1.5M4 -9.5l3-1.5", WEISS, 1) },

    // --- Physiotherapie ----------------------------------------------------------
    t_skelett: { name: "Skelett", der: "das Skelett", w: 40, h: 104, d: () => {
      const B = "#f4ead5";
      const L = "#cdbb98";
      return E(0, -3.5, 15, 3.5, DUNKEL) + R(-1.8, -42, 3.6, 39, METALL_D, 1.5) +
        S("M-5 -40l-2 17l1 16M5 -40l2 17l-1 16", B, 3.6) + E(-7, -6, 4.5, 2, B) + E(7, -6, 4.5, 2, B) +
        P("M-11 -47q11-7 22 0q-1 8-11 9q-10-1-11-9z", B) + C(-4, -44, 1.6, L) + C(4, -44, 1.6, L) +
        R(-2, -84, 4, 40, B, 2) + S("M-2.5 -56h5M-2.5 -51h5", L, 1) +
        [-78, -72, -66, -60].map((y, i) => S(`M-1 ${y}q-${12 - i} 1-${11 - i} 6M1 ${y}q${12 - i} 1 ${11 - i} 6`, B, 2.4)).join("") +
        S("M-13 -84h26", B, 3) + S("M-13 -84l-3 20l1 17M13 -84l3 20l-1 17", B, 3) + C(-15, -45, 2.6, B) + C(15, -45, 2.6, B) +
        C(0, -94, 9, B) + R(-5.5, -89, 11, 6, B, 2.5) + C(-3.4, -95, 2.4, "#6b5a48") + C(3.4, -95, 2.4, "#6b5a48") +
        P("M0 -92.5l-1.3 2.6h2.6z", "#6b5a48") + S("M-3.5 -86h7M-1.5 -87.5v3M1.5 -87.5v3", L, 0.9);
    } },
    t_uebungstreppe: { name: "Übungstreppe", der: "die Übungstreppe", w: 124, h: 72, farbe: HOLZ, tags: ["physio", "sport"], d: (c) =>
      P("M-60 0v-12h16v-12h16v-12h56v12h16v12h16v12z", c) +
      [[-60, -12, 16], [-44, -24, 16], [-28, -36, 56], [28, -24, 16], [44, -12, 16]].map(([x, y, w]) => R(x, y, w, 3, shade(c, 0.22))).join("") +
      [[-60, -12], [-44, -24], [-28, -36], [24, -36], [40, -24], [56, -12]].map(([x, y]) => R(x, y, 4, 3, "#ffd166")).join("") +
      S("M-44 -12v12M-28 -24v24M28 -24v24M44 -12v12", shade(c, -0.2), 1.4) +
      S("M-54 -12v-30M-20 -36v-30M20 -36v-30M54 -12v-30", METALL, 3) + S("M-54 -42L-20 -66H20L54 -42", METALL_D, 4) },
    t_wackelbrett: { name: "Wackelbrett", der: "das Wackelbrett", w: 56, h: 20, farbe: "#3a86ff", tags: ["physio", "sport"], d: (c) =>
      P("M-13 -10a13 10 0 0 0 26 0z", shade(c, -0.3)) + R(-28, -17, 56, 7, c, 3.5) + R(-24, -16, 48, 2, shade(c, 0.3), 1) +
      [-18, -9, 0, 9, 18].map((x) => C(x, -17.5, 1.3, shade(c, -0.15))).join("") },
    t_kuehlkissen: { name: "Kühlkissen", der: "das Kühlkissen", klein: true, w: 28, h: 12, d: () =>
      R(-14, -11, 28, 11, "#6cc3d5", 4) + R(-11, -9, 22, 7, "#a8e4f0", 3) +
      S("M0 -9.5v6M-2.6 -8l5.2 3M-2.6 -5l5.2-3", WEISS, 1.2) },
    t_hantelstaender: { name: "Hantelständer", der: "der Hantelständer", w: 52, h: 62, tags: ["fitness", "sport"], d: () =>
      R(-23, -62, 4, 60, DUNKEL, 2) + R(19, -62, 4, 60, DUNKEL, 2) + R(-26, -3, 12, 3, DUNKEL, 1.5) + R(14, -3, 12, 3, DUNKEL, 1.5) +
      R(-20, -42, 40, 3, METALL_D, 1.5) + R(-20, -22, 40, 3, METALL_D, 1.5) + R(-20, -5, 40, 3, METALL_D, 1.5) +
      hantel(-42, 12, 5, 9, "#ffd166") + hantel(-22, 15, 6, 12, "#3a86ff") + hantel(-5, 18, 7, 14, "#ef5350") },
    t_igelball: { name: "Igelball", der: "der Igelball", klein: true, w: 22, h: 22, farbe: "#ff7aa2", tags: ["ball"], d: (c) => {
      let stacheln = "";
      for (let i = 0; i < 16; i += 1) {
        const a = (i / 16) * Math.PI * 2;
        const p = (w, r) => `${n(Math.cos(w) * r)} ${n(-11 + Math.sin(w) * r)}`;
        stacheln += `M${p(a - 0.2, 7.4)}L${p(a, 11)}L${p(a + 0.2, 7.4)}Z`;
      }
      return P(stacheln, shade(c, -0.12)) + C(0, -11, 8, c) +
        [[-3, -14], [2, -15], [4.5, -10], [-1, -9.5], [-5, -8], [0, -12.5], [3, -6.5]].map(([x, y]) => C(x, y, 1.1, shade(c, 0.3))).join("");
    } },
    t_uebungsplakat: { name: "Übungsplakat", der: "das Übungsplakat", art: "wand", w: 52, h: 66, tags: ["bild"], d: () => {
      const st = (d) => S(d, TINTE, 1.6);
      return R(-26, -33, 52, 66, WEISS, 3, `stroke="${RAND}" stroke-width="1.5"`) +
        R(-23, -30, 22, 28, "#e3f6d5", 2) + R(1, -30, 22, 28, "#dff1fb", 2) + R(-23, 2, 22, 28, "#fff3cc", 2) + R(1, 2, 22, 28, "#ffe3ec", 2) +
        C(-12, -22, 2.6, TINTE) + st("M-12 -19v9M-12 -10l-3 6M-12 -10l3 6M-12 -17l-4-6M-12 -17l4-6") +
        C(13, -21, 2.6, TINTE) + st("M13 -18l-1 7M12 -11l5 1l-1 6M12 -11l-4 2l0 5M13 -16h6") +
        C(-15, 11, 2.6, TINTE) + st("M-12 28l0-6M-12 22l-3-6M-12 22l3 6M-12 22q-1-6-3-9M-13 16q-5-3-3-8M-13 16l5 3") +
        C(12, 9, 2.6, TINTE) + st("M12 12v8M12 20v7M12 20l6-2M7 15h10");
    } },
    t_therapiebaender: { name: "Therapiebänder", der: "die Therapiebänder", art: "wand", w: 46, h: 58, tags: ["physio", "fitness"], d: () =>
      R(-21, -29, 42, 6, HOLZ_D, 3) + [-14, -4, 6, 16].map((x) => C(x, -26, 1.8, HOLZ_DD)).join("") +
      [[-14, 34, "#ffd166"], [-4, 44, "#ef5350"], [6, 38, "#3a86ff"], [16, 30, "#7cc05e"]].map(([x, l, f]) =>
        S(`M${x - 2} -25v${l}q2 6 4 0v-${l}`, f, 3)).join("") },
    t_balancierbalken: { name: "Balancierbalken", der: "der Balancierbalken", w: 124, h: 28, farbe: "#ff9f43", tags: ["physio", "sport"], d: (c) =>
      P("M-52 -18h16l5 18h-26z", METALL_D) + P("M36 -18h16l5 18h-26z", METALL_D) +
      R(-62, -28, 124, 10, c, 4) + R(-60, -27, 120, 2.5, shade(c, 0.3), 1.2) },
    t_rotlichtlampe: { name: "Rotlichtlampe", der: "die Rotlichtlampe", w: 46, h: 104, licht: true, tags: ["lampe"], d: () => {
      const t = `transform="translate(5 -87) rotate(25)"`;
      return S("M0 -6l-15 5M0 -6l15 5M0 -6v4", DUNKEL, 3) + R(-2, -80, 4, 74, METALL, 2) + S("M0 -80q0-5 4-7", METALL_D, 3) +
        P("M-14 0a14 12 0 0 1 28 0z", "#4a5568", t) + E(0, 0, 14, 3.5, "#ff5c5c", t) + E(0, 0, 9, 2, "#ffb3a8", t);
    } },

    // --- Bettenstation -------------------------------------------------------------
    t_spitalnachttisch: { name: "Spitalnachttisch", der: "der Spitalnachttisch", w: 46, h: 58, farbe: "#a8d8f8", flaeche: -58, fx: [-20, 18], tags: ["nachttisch"], d: (c) =>
      R(-20, -56, 40, 46, c, 4) + R(-22, -58, 44, 5, shade(c, -0.2), 2.5) +
      R(-16, -50, 32, 11, shade(c, 0.2), 2) + R(-5, -46, 10, 2.5, DUNKEL, 1.2) +
      R(-16, -36, 32, 22, shade(c, 0.2), 2) + R(10, -30, 2.5, 9, DUNKEL, 1.2) +
      S("M20 -50h2.5v14h-2.5", METALL_D, 1.6) + R(19.5, -50, 3.5, 17, WEISS, 1.5) + R(19.5, -38, 3.5, 2, "#6cc3d5") +
      R(-18, -10, 36, 3, METALL_D, 1.5) + rad(-14, -4, 4) + rad(14, -4, 4) },
    t_besucherstuhl: { name: "Besucherstuhl", der: "der Besucherstuhl", w: 44, h: 64, farbe: "#ff9f6b", tags: ["stuhl", "sitz"], d: (c) =>
      R(-15, -64, 30, 30, shade(c, -0.12), 9) + R(-11, -60, 22, 20, shade(c, 0.08), 7) +
      S("M-19 -43v15M19 -43v15", METALL_D, 2.4) + R(-22, -46, 8, 4, HOLZ_D, 2) + R(14, -46, 8, 4, HOLZ_D, 2) +
      R(-18, -36, 36, 10, c, 5) + R(-14, -35, 28, 3, shade(c, 0.25), 1.5) +
      leg(-16, 26, METALL_D, 4) + leg(12, 26, METALL_D, 4) },
    t_rufknopf: { name: "Rufknopf", der: "der Rufknopf", art: "wand", w: 30, h: 54, licht: true, d: () =>
      R(-13, -27, 26, 16, WEISS, 3, `stroke="${RAND}" stroke-width="1.5"`) + C(-4, -19, 4.2, "#ffd166") + C(6, -19, 2.5, "#7cc05e") +
      S("M-4 -11q-8 10 0 18q4 4 0 6", "#9aa5b1", 2) +
      R(-8, 11, 14, 16, "#e2e8f0", 5) + C(-1, 18, 4.5, "#ef5350") + C(-2.2, 16.6, 1.4, "#ff9f9f") },
    t_besserungskarte: { name: "Gute-Besserung-Karte", der: "die Gute-Besserung-Karte", klein: true, w: 26, h: 24, d: () =>
      P("M-5 -22h14l4 22h-14z", "#ffd8b8") + R(-12, -22, 18, 22, "#fffaf0", 1.5, `stroke="${RAND}" stroke-width="1"`) +
      herz(-3, -9, 1.05, "#ff7aa2") + C(-8, -18, 1.4, "#ffd166") + C(2, -18, 1.4, "#7cc05e") },
    t_essenstablett: { name: "Essenstablett", der: "das Essenstablett", klein: true, w: 40, h: 22, tags: ["essen"], d: () =>
      R(-20, -4, 40, 4, "#6cc3d5", 2) +
      P("M-17 -4q0-13 11-13t11 13z", "#cbd5e0") + C(-6, -18, 2, METALL_D) + S("M-13 -8q1-5 5-6", WEISS, 1.6, `opacity="0.8"`) +
      P("M8 -15h8l-1 11h-6z", "#ff9f43") + R(8, -16, 8, 2, "#ffe0b8", 1) + C(17, -6.5, 2.5, "#ef5350") },
    t_fieberkurve: { name: "Fieberkurve", der: "die Fieberkurve", art: "wand", w: 32, h: 42, d: () =>
      R(-16, -21, 32, 42, HOLZ, 3) + R(-13, -15, 26, 33, WEISS, 1) + R(-6, -21, 12, 6, METALL_D, 2) +
      S("M-11 -6h22M-11 2h22M-11 10h22", "#e2e8f0", 0.8) +
      S("M-11 6l4-6l4 3l4-10l4 5l5-2", "#ef5350", 1.6) + S("M-11 13l5-2l5 1l5-3l6 1", "#3a86ff", 1.2) },
    t_rollator: { name: "Rollator", der: "der Rollator", w: 56, h: 74, farbe: "#ef5350", d: (c) =>
      S("M-16 -6L-12 -65M17 -7L-12 -57", c, 4.5) + S("M-12 -65l-7-1.5", c, 4.5) + R(-27, -70.5, 12, 6.5, DUNKEL, 3.2) +
      S("M-14 -62q6 2 8 8", METALL_D, 1.6) +
      R(-7, -35, 15, 12, "#cbd5e0", 2) + S("M-3 -35v12M1 -35v12M5 -35v12M-7 -29h15", "#9aa5b1", 1) + R(-17, -41, 27, 5, DUNKEL, 2.5) +
      rad(-16, -6, 6) + rad(17, -7, 7) },
    t_pflegewagen: { name: "Pflegewagen", der: "der Pflegewagen", w: 62, h: 76, farbe: "#7cc05e", flaeche: -66, fx: [-24, 20], d: (c) =>
      S("M24 -60h4v-14", METALL_D, 2.6) + R(-27, -66, 52, 4, "#e2e8f0", 2) + R(-26, -62, 50, 50, "#f1f5f9", 3) +
      [-59, -47, -35, -23].map((y, i) => R(-23, y, 44, 10, i % 2 ? shade(c, 0.2) : c, 2) + R(-5, y + 4, 8, 2.4, DUNKEL, 1.2)).join("") +
      R(-31, -52, 6, 14, "#ffd166", 2) + R(-31, -54, 6, 3, shade("#ffd166", -0.2), 1) +
      R(-24, -12, 48, 3, METALL_D, 1.5) + rad(-19, -4, 4) + rad(19, -4, 4) },
    t_waeschewagen: { name: "Wäschewagen", der: "der Wäschewagen", w: 54, h: 82, tags: ["waesche"], d: () =>
      S("M-22 -74v64M22 -74v64", METALL_D, 3) +
      P("M-21 -72h42v42q0 12-12 14h-18q-12-2-12-14z", "#6cc3d5") + S("M-13 -60v40M0 -62v44M13 -60v40", "#5aaec0", 1.2) +
      P("M-18 -74q4-8 12-4q6-6 12 0q8-4 12 4z", WEISS, `stroke="#b9cad6" stroke-width="1.2"`) + P("M4 -74q3-7 9-4l4 4z", "#ff9fb5") +
      R(-25, -76, 50, 5, METALL, 2.5) +
      R(-24, -12, 48, 3, METALL_D, 1.5) + rad(-18, -5, 5) + rad(18, -5, 5) },
    t_fernseharm: { name: "Fernseher am Arm", der: "der Fernseher am Arm", art: "wand", w: 66, h: 32, licht: true, tags: ["fernseher"], d: () =>
      R(-33, -5, 6, 20, METALL_D, 2) + S("M-27 5h14l10-6", METALL, 3.5) + C(-13, 5, 2.5, METALL_D) +
      R(-4, -15, 36, 26, "#2d3748", 3) + R(-1.5, -12.5, 31, 21, "#6cc3d5", 2) + R(-1.5, -1, 31, 9.5, "#9be07a") +
      C(22, -6, 4, "#ffd166") + C(8, -1, 5, "#e8763a") + P("M4 -5l1-5l3 3z", "#e8763a") + C(6.5, -2, 0.9, TINTE) },
    t_wasserkrug: { name: "Wasserkrug", der: "der Wasserkrug", klein: true, w: 26, h: 26, tags: ["trinken"], d: () =>
      S("M-8 -18q-5 3-1 10", "#a8ddf0", 2) + P("M-8 -22h12l3-3v4q-2 2-2 6v15h-13z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="1"`) +
      R(-7, -13, 10.5, 12, "#a8d8f8", 2) +
      P("M5 -11h7l-1 11h-5z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="1"`) + P("M5.6 -6h5.8l-0.5 5.5h-4.8z", "#a8d8f8") },
    t_finken: { name: "Finken", der: "die Finken", w: 40, h: 16, farbe: "#ff9fb5", tags: ["schuhe"], d: (c) => {
      const fink = (x, f) => R(x, -3, 24, 3, shade(f, -0.35), 1.5) +
        P(`M${x} -3v-3q0-2 2-2h6q3-5 9-5q6 0 6 9v1z`, f) + E(x + 5, -7.4, 3.6, 1.1, shade(f, -0.3)) + C(x + 16, -13.2, 2.6, WEISS);
      return fink(-6, shade(c, -0.12)) + fink(-19, c);
    } },

    // --- Apotheke ------------------------------------------------------------------
    t_schubladenschrank: { name: "Schubladenschrank", der: "der Schubladenschrank", w: 88, h: 104, farbe: HOLZ, flaeche: -104, tags: ["schrank", "medikamente"], d: (c) =>
      R(-42, -98, 84, 92, c, 3) + R(-44, -104, 88, 7, shade(c, -0.18), 3) + R(-42, -7, 84, 7, shade(c, -0.32), 2) +
      Array.from({ length: 24 }, (_, i) => {
        const x = -38 + (i % 4) * 19.25;
        const y = -94 + Math.floor(i / 4) * 14.5;
        return R(x, y, 17.5, 12.5, shade(c, 0.14), 2) + R(x + 4.25, y + 2, 9, 3.6, "#fbf8f2", 1) + C(x + 8.75, y + 8.6, 1.5, HOLZ_DD);
      }).join("") },
    t_medikamentenregal: { name: "Medikamentenregal", der: "das Medikamentenregal", w: 92, h: 112, farbe: "#2f9e5c", tags: ["medikamente", "regal", "schrank"], d: (c) =>
      R(-46, -112, 92, 112, c, 4) + R(-40, -106, 80, 100, "#f4fbf7") +
      [-82, -57, -32].map((y) => R(-40, y, 80, 4, c)).join("") +
      packungen(-38, 38, -82, 0) + packungen(-38, 38, -57, 1) + packungen(-38, 38, -32, 2) + packungen(-38, 38, -6, 3) },
    t_apothekentheke: { name: "Apothekentheke", der: "die Apothekentheke", w: 124, h: 62, farbe: "#5cbf62", flaeche: -62, tags: ["theke"], d: (c) =>
      R(-60, -55, 120, 55, c, 4) + R(-62, -62, 124, 8, "#e2e8f0", 4) + R(-62, -56, 124, 2, shade(c, -0.25)) +
      R(-52, -48, 104, 38, shade(c, 0.15), 3) + C(0, -29, 14, WEISS) + R(-4, -39, 8, 20, "#2f9e5c", 1.5) + R(-10, -33, 20, 8, "#2f9e5c", 1.5) +
      R(-60, -6, 120, 6, shade(c, -0.35), 2) },
    t_tablettenbox: { name: "Tablettenbox", der: "die Tablettenbox", klein: true, w: 36, h: 16, tags: ["medikamente"], d: () =>
      R(-18, -11, 36, 11, "#f1f5f9", 2.5, `stroke="${RAND}" stroke-width="1"`) +
      [0, 1, 3, 4, 5, 6].map((i) => R(-17 + i * 5, -10, 4, 9, BUNT[i], 1.2, `opacity="0.85"`) + C(-15 + i * 5, -4, 1.2, WEISS)).join("") +
      R(-7, -10, 4, 9, "#fffaf0", 1.2) + C(-5.6, -6, 1.3, "#ff7aa2") + C(-4.6, -3.2, 1.3, "#ffd166") + R(-7.2, -16, 4.4, 5, BUNT[2], 1.2) },
    t_hustensirup: { name: "Hustensirup", der: "der Hustensirup", klein: true, w: 15, h: 32, tags: ["medikamente"], d: () =>
      R(-7, -24, 14, 24, "#8a4b20", 4) + R(-3.5, -27, 7, 4, "#6b3a18", 1.5) +
      P("M-5.5 -32h11l-1 5h-9z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="1"`) +
      R(-6, -18, 12, 10, "#fff1b8", 1.5) + P("M0 -16q-3.5 4 0 6q3.5-2 0-6z", "#ff9f43") + R(-5.5, -22, 2, 13, WEISS, 1, `opacity="0.35"`) },
    t_moerser: { name: "Mörser", der: "der Mörser", klein: true, w: 26, h: 26, d: () =>
      E(0, -12, 12, 2.6, "#cbd5e0") + E(0, -12, 9.5, 1.6, "#7cc05e") +
      R(-2.6, -27, 5.2, 18, "#a0aec0", 2.6, `transform="rotate(28 0 -10)"`) +
      P("M-12 -12h24q-1 11-9 12h-6q-8-1-9-12z", WEISS, `stroke="${RAND}" stroke-width="1.2"`) + S("M-8 -8q2 4 6 5", "#e2e8f0", 1.4) },
    t_pflaster: { name: "Pflaster", der: "die Pflaster", klein: true, w: 28, h: 26, d: () =>
      R(-4, -26, 7, 18, "#f2c79b", 3.5, `transform="rotate(-14 0 -10)"`) + R(-2.5, -20, 4, 6, "#fbe3c8", 1, `transform="rotate(-14 0 -10)"`) +
      R(2, -25, 7, 18, "#f2c79b", 3.5, `transform="rotate(12 5 -10)"`) + R(3.5, -19, 4, 6, "#fbe3c8", 1, `transform="rotate(12 5 -10)"`) +
      R(-13, -14, 26, 14, "#3a86ff", 2.5) + herz(0, -6, 0.75, WEISS) },
    t_apothekenschild: { name: "Apothekenschild", der: "das Apothekenschild", art: "wand", w: 40, h: 40, licht: true, d: () =>
      R(-19, -19, 38, 38, WEISS, 6, `stroke="#cbd5e0" stroke-width="2"`) +
      R(-5, -15, 10, 30, "#2f9e5c", 2) + R(-15, -5, 30, 10, "#2f9e5c", 2) + R(-2.5, -12.5, 5, 25, "#5cbf62", 1) + R(-12.5, -2.5, 25, 5, "#5cbf62", 1) },
    t_salbe: { name: "Salbe", der: "die Salbe", klein: true, w: 32, h: 14, tags: ["medikamente"], d: () =>
      R(-16, -12.5, 4.5, 12, "#cbd5e0", 1) + S("M-14.8 -11v9M-13 -11v9", "#a0aec0", 0.8) +
      P("M-12 -12h16q5 1 7 4v3q-2 3-7 4h-16z", WEISS, `stroke="${RAND}" stroke-width="1"`) +
      R(-9, -10.5, 11, 8, "#7cc05e", 2) + P("M-5.5 -4.5q0-4 4-4q0 4-4 4z", WEISS) +
      R(10.5, -8, 2.5, 3, "#e2e8f0") + R(12.5, -9.5, 3.5, 6, "#ef5350", 1.2) },
    t_kraeuterglaeser: { name: "Kräutergläser", der: "die Kräutergläser", klein: true, w: 30, h: 28, d: () =>
      R(-13, -22, 13, 22, "#e6f6fc", 3, `stroke="#a8ddf0" stroke-width="1"`) + R(-12, -16, 11, 15, "#7cc05e", 2) +
      [[-9, -12], [-5, -9], [-8, -5], [-4, -14]].map(([x, y]) => E(x, y, 2, 1.2, "#4aa34a")).join("") + R(-11, -11, 9, 5, "#fffaf0", 1) +
      R(-14, -26, 15, 5, "#2f9e5c", 2) +
      R(2, -16, 12, 16, "#e6f6fc", 3, `stroke="#a8ddf0" stroke-width="1"`) + R(3, -11, 10, 10, "#fff1b8", 2) +
      [[5.5, -8], [9.5, -5], [6, -3.5], [10, -9]].map(([x, y]) => C(x, y, 1.3, "#ffd166")).join("") + R(1, -20, 14, 5, "#ef5350", 2) },
    t_apothekerwaage: { name: "Apothekerwaage", der: "die Apothekerwaage", klein: true, w: 38, h: 32, tags: ["waage"], d: () =>
      R(-10, -5, 20, 5, HOLZ_D, 2) + R(-1.5, -27, 3, 22, "#c49a46", 1) + S("M-12 -26h24", "#c49a46", 2.4) + C(0, -28.5, 2.8, "#e8b94f") +
      S("M-12 -26l-5 13M-12 -26l5 13M12 -26l-5 13M12 -26l5 13", "#c49a46", 0.9) +
      P("M-18 -13h12q-1 5-6 5t-6-5z", "#e8b94f") + P("M6 -13h12q-1 5-6 5t-6-5z", "#e8b94f") +
      R(-14, -16, 4, 3, METALL_D, 1) + C(10, -14.4, 1.6, "#ff7aa2") + C(13.6, -14.4, 1.6, WEISS) },

    // --- Augenabteilung --------------------------------------------------------------
    t_brillenmessgeraet: { name: "Brillenmessgerät", der: "das Brillenmessgerät", w: 70, h: 110, tags: ["sehtest"], d: () =>
      E(18, -3.5, 14, 3.5, DUNKEL) + R(14, -104, 8, 100, "#e2e8f0", 3) + R(15.5, -96, 2, 84, "#cbd5e0") +
      R(-14, -110, 36, 6, METALL_D, 3) + R(-10, -104, 6, 10, METALL_D) +
      C(-20, -80, 13, "#4a5568") + C(4, -80, 13, "#4a5568") + R(-12, -90, 8, 18, "#4a5568", 3) +
      C(-20, -80, 6.5, "#2d3748") + C(4, -80, 6.5, "#2d3748") + C(-20, -80, 5, "#a8d8f8") + C(4, -80, 5, "#a8d8f8") +
      S("M-22 -82l3-3M2 -82l3-3", WEISS, 1.2) +
      [[-20, -92], [-31, -84], [-29, -71], [4, -92], [15, -84], [13, -71]].map(([x, y], i) => C(x, y, 2.2, i % 3 === 0 ? "#ffd166" : WEISS)).join("") },
    t_augenmikroskop: { name: "Augenmikroskop", der: "das Augenmikroskop", w: 66, h: 100, tags: ["mikroskop"], d: () =>
      R(-20, -6, 40, 6, METALL_D, 3) + R(-5, -50, 10, 44, "#cbd5e0", 2) + R(-32, -56, 64, 6, WEISS, 3, `stroke="${RAND}" stroke-width="1.5"`) +
      R(-26, -62, 52, 6, "#4a5568", 2) +
      R(-26, -100, 3, 38, METALL_D, 1.5) + R(-27, -72, 9, 3, "#2d3748", 1.5) + R(-27, -94, 9, 3, "#2d3748", 1.5) +
      R(-4, -98, 9, 36, "#4a5568", 2) + R(-6, -100, 13, 8, "#2d3748", 2) + S("M-5 -78l-14 4", "#ffd166", 1.6) +
      R(2, -84, 20, 9, "#4a5568", 3) + R(20, -86, 8, 5, DUNKEL, 2) + R(20, -79, 8, 5, DUNKEL, 2) +
      R(12, -70, 3, 8, METALL_D) + C(13.5, -71, 2.6, DUNKEL) },
    t_brillenwand: { name: "Brillenwand", der: "die Brillenwand", art: "wand", w: 84, h: 58, d: () => {
      const farben = ["#ef5350", "#3a86ff", "#2d3748", "#ff9f43", "#a78bfa", "#7cc05e", "#ff7aa2", "#8a5734", "#6cc3d5"];
      const brille = (x, y, f, eckig) => (eckig
        ? R(x - 10, y - 4, 8.4, 7, "#f4fbff", 2, `stroke="${f}" stroke-width="1.8"`) + R(x + 1.6, y - 4, 8.4, 7, "#f4fbff", 2, `stroke="${f}" stroke-width="1.8"`)
        : C(x - 5.4, y, 4.2, "#f4fbff", `stroke="${f}" stroke-width="1.8"`) + C(x + 5.4, y, 4.2, "#f4fbff", `stroke="${f}" stroke-width="1.8"`)) +
        S(`M${x - 1.4} ${y - 1}q1.4-1.6 2.8 0`, f, 1.4);
      return R(-42, -29, 84, 58, HOLZ, 4) + R(-38, -25, 76, 50, "#fffaf0", 2) +
        [-10, 7, 24].map((y) => R(-38, y, 76, 2.5, HOLZ_D)).join("") +
        [-16, 1, 18].map((y, r) => [-24, 0, 24].map((x, i) => brille(x, y, farben[r * 3 + i], (r + i) % 2 === 1)).join("")).join("");
    } },
    t_augenmodell: { name: "Augenmodell", der: "das Augenmodell", klein: true, w: 26, h: 34, d: () =>
      E(0, -2.6, 10, 2.6, DUNKEL) + R(-1.5, -13, 3, 11, METALL_D, 1) +
      C(0, -23, 11, WEISS, `stroke="${RAND}" stroke-width="1.5"`) + S("M-9 -27q3 1 4-2M-8 -17q3-2 5 0M8 -29q-2 2-5 1M9 -18q-3 0-4-2", "#ff9fb5", 0.9) +
      C(0, -23, 5.4, "#4f8ef7") + C(0, -23, 2.6, TINTE) + C(-1.8, -25, 1.2, WEISS) },
    t_brille: { name: "Brille", der: "die Brille", klein: true, w: 32, h: 15, farbe: "#ef5350", d: (c) =>
      S("M-15 -5h30", shade(c, -0.25), 1.6) +
      C(-8, -7.2, 6, "#e6f6fc", `stroke="${c}" stroke-width="2.4"`) + C(8, -7.2, 6, "#e6f6fc", `stroke="${c}" stroke-width="2.4"`) +
      S("M-2 -8.2q2-2 4 0", c, 2) + S("M-11 -9.2l3-3M5 -9.2l3-3", WEISS, 1.2) },
    t_augentropfen: { name: "Augentropfen", der: "die Augentropfen", klein: true, w: 14, h: 24, tags: ["medikamente"], d: () =>
      R(-6, -16, 10, 16, WEISS, 3, `stroke="${RAND}" stroke-width="1"`) + R(-6, -11, 10, 6, "#3a86ff", 1) +
      E(-1, -8, 3, 1.8, WEISS) + C(-1, -8, 1, "#1a3a8a") +
      P("M-3.5 -16l1.5-6h2l1.5 6z", WEISS, `stroke="${RAND}" stroke-width="1"`) +
      P("M4.5 -23q-2.4 3.4 0 4.4q2.4-1 0-4.4z", "#6cc3d5") },
    t_untersuchungsstuhl: { name: "Untersuchungsstuhl", der: "der Untersuchungsstuhl", w: 66, h: 92, farbe: "#3a86ff", tags: ["stuhl", "sitz"], d: (c) =>
      E(0, -4, 20, 4, DUNKEL) + R(-5, -30, 10, 26, METALL, 3) + R(-9, -34, 18, 6, METALL_D, 3) +
      R(-24, -80, 12, 44, c, 6, `transform="rotate(-8 -18 -40)"`) + R(-26, -90, 14, 11, shade(c, -0.18), 5, `transform="rotate(-8 -18 -40)"`) +
      R(-18, -42, 40, 10, c, 5) + P("M18 -40l11 22l-6 3l-11-21z", shade(c, -0.1)) +
      R(-12, -52, 26, 5, shade(c, -0.25), 2.5) + R(9, -48, 3, 8, METALL_D) },
    t_bildersehtest: { name: "Bilder-Sehtest", der: "der Bilder-Sehtest", art: "wand", w: 52, h: 72, tags: ["sehtest", "bild"], d: () =>
      R(-26, -36, 52, 72, WEISS, 3, `stroke="${RAND}" stroke-width="2"`) +
      P("M-10 -10v-12l10-9l10 9v12z", TINTE) +
      C(-9, 2, 5.5, TINTE) + S("M-9 -3.5l1-3", TINTE, 1.4) + stern(9, 2, 6.5, TINTE) +
      C(-13, 16, 3, TINTE) + R(-6.5, 13, 6, 6, TINTE) + P("M2 19v-4l3-3l3 3v4z", TINTE) + herz(14, 16.5, 0.55, TINTE) +
      [-12, -6, 0, 6, 12].map((x, i) => (i % 2 ? R(x - 1.3, 25.7, 2.6, 2.6, TINTE) : C(x, 27, 1.4, TINTE))).join("") },
    t_farbsehtest: { name: "Farbsehtest", der: "der Farbsehtest", art: "wand", w: 42, h: 42, tags: ["sehtest", "bild"], d: () => {
      const abstand = (px, py, ax, ay, bx, by) => {
        const dx = bx - ax;
        const dy = by - ay;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(px - ax - t * dx, py - ay - t * dy);
      };
      let punkte = "";
      for (let j = -6; j <= 6; j += 1) {
        for (let i = -6; i <= 6; i += 1) {
          const x = i * 3 + (j % 2 ? 1.5 : 0);
          const y = j * 2.7;
          if (Math.hypot(x, y) > 16.6) continue;
          const k = Math.abs(i * 7 + j * 3) % 3;
          const sieben = Math.min(abstand(x, y, -7, -9.5, 7.5, -9.5), abstand(x, y, 7.5, -9.5, -1.5, 11)) < 3.1;
          const f = sieben ? ["#2f9e5c", "#3f9e4a", "#4aa34a"][k] : ["#ffb347", "#ff9f43", "#f6c26b"][k];
          punkte += C(n(x), n(y), n(1.05 + k * 0.2), f);
        }
      }
      return R(-21, -21, 42, 42, WEISS, 4, `stroke="${RAND}" stroke-width="1.5"`) + C(0, 0, 18.5, "#fff6e0") + punkte;
    } },
    t_lupe: { name: "Lupe", der: "die Lupe", klein: true, w: 20, h: 30, d: () =>
      E(0, -2.5, 8, 2.5, DUNKEL) + R(-1.6, -12, 3.2, 10, METALL_D, 1.2) +
      C(0, -19.5, 8.5, "#d6f0fb", `stroke="${DUNKEL}" stroke-width="2.6"`) + S("M-4.5 -22.5q2-3 5-3.4", WEISS, 1.4) },

    // --- Intensivstation ---------------------------------------------------------------
    t_intensivbett: { name: "Intensivbett", der: "das Intensivbett", w: 140, h: 84, farbe: "#6cc3d5", tags: ["spitalbett", "bett"], d: (c) => {
      const kipp = `transform="rotate(32 -34 -46)"`;
      return rad(-54, -6, 6) + rad(54, -6, 6) + R(-60, -16, 120, 6, METALL_D, 3) + R(-40, -36, 80, 20, "#cbd5e0", 4) +
        R(-70, -82, 9, 68, WEISS, 4, `stroke="#b9cad6" stroke-width="1.5"`) + R(61, -64, 9, 50, WEISS, 4, `stroke="#b9cad6" stroke-width="1.5"`) +
        R(-61, -44, 122, 8, METALL, 3) +
        R(-36, -52, 94, 9, WEISS, 4, `stroke="${RAND}" stroke-width="1.2"`) +
        R(-62, -52, 30, 9, WEISS, 4, `stroke="${RAND}" stroke-width="1.2" ${kipp}`) +
        R(-58, -62, 18, 10, "#f4f8fb", 5, `stroke="${RAND}" stroke-width="1.2" ${kipp}`) +
        P("M-30 -54h82a6 6 0 0 1 6 6v4h-88z", c) + P("M-30 -54h82a6 6 0 0 1 6 6v1h-88z", shade(c, 0.25)) +
        S("M-26 -62h56M-26 -51h56M-26 -62v11M30 -62v11", "#9aa5b1", 2.4) +
        R(-6, -66, 16, 11, "#2d3748", 2) + C(-1.5, -60.5, 1.6, "#7cff9e") + C(3, -60.5, 1.6, "#ffd166") + C(7, -60.5, 1.4, "#6cc3d5");
    } },
    t_beatmungsgeraet: { name: "Beatmungsgerät", der: "das Beatmungsgerät", w: 54, h: 106, licht: true, d: () =>
      R(-20, -12, 40, 4, METALL_D, 2) + rad(-16, -5, 5) + rad(16, -5, 5) + R(-2.5, -62, 5, 50, METALL, 2) +
      R(-18, -84, 36, 24, WEISS, 4, `stroke="#b9cad6" stroke-width="1.5"`) + R(-14, -79, 12, 4, "#cbd5e0", 2) + C(6, -77, 2.2, "#7cc05e") + C(12, -77, 2.2, "#ffd166") +
      R(-14, -71, 9, 7, "#cbe9f5", 2) +
      schirm(-20, -106, 40, 24) + S("M-16 -96q2-5 4 0t4 0t4 0t4 0t4 0t4 0t4 0", "#7cff9e", 1.4) + S("M-16 -89h6l2-3h6l2 3h14", "#ffd166", 1.2) +
      S("M18 -72q8 2 7 18q-1 16-12 20", "#a8d8f8", 5) + S("M18 -72q8 2 7 18q-1 16-12 20", "#7fbfdc", 5, `stroke-dasharray="1.4 2.6" stroke-linecap="butt"`) },
    t_monitorwand: { name: "Monitorwand", der: "die Monitorwand", art: "wand", w: 100, h: 54, licht: true, tags: ["monitor"], d: () =>
      R(-48, 21, 96, 5, METALL_D, 2.5) + S("M-36 21v-5M36 21v-5M0 21v-6", METALL_D, 3) +
      schirm(-22, -27, 44, 42) + ekg(-18, -16, 26, "#7cff9e", 1.4) + T(14, -13, "72", 7, "#7cff9e") +
      S("M-18 -2q3-6 6 0t6 0t6 0t6 0", "#ffd166", 1.2) + T(14, 0, "98", 7, "#ffd166") +
      S("M-18 9q4-4 8 0t8 0t8 0", "#6cc3d5", 1.2) + T(14, 11, "16", 6, "#6cc3d5") +
      schirm(-48, -16, 24, 32) + ekg(-45, -6, 18, "#7cff9e", 1.2) + S("M-45 6q2-4 4 0t4 0t4 0t4 0", "#ffd166", 1) +
      schirm(24, -16, 24, 32) + R(28, -2, 3, 12, "#6cc3d5") + R(33, -7, 3, 17, "#7cff9e") + R(38, -4, 3, 14, "#ffd166") },
    t_infusionspumpen: { name: "Infusionspumpen", der: "die Infusionspumpen", w: 40, h: 110, licht: true, tags: ["infusion"], d: () =>
      S("M0 -7l-16 4M0 -7l16 4", DUNKEL, 3) + rad(-16, -3, 3) + rad(16, -3, 3) + R(-2, -106, 4, 100, METALL, 2) + S("M-13 -106h26", METALL_D, 3) +
      R(-15, -103, 11, 17, "#e6f6fc", 3, `stroke="${RAND}" stroke-width="1"`) + R(-14, -96, 9, 9, "#ffd166", 2) +
      R(4, -103, 11, 17, "#e6f6fc", 3, `stroke="${RAND}" stroke-width="1"`) + R(5, -97, 9, 10, "#a8d8f8", 2) +
      S("M-9.5 -86v12M9.5 -86v12", "#c9d9e3", 1.2) +
      [-74, -58, -42].map((y, i) => R(-17, y, 34, 13, WEISS, 3, `stroke="#b9cad6" stroke-width="1.2"`) + R(-13, y + 3, 13, 7, "#1a202c", 1.5) + R(-11, y + 5, 8, 2.6, "#7cff9e", 1) +
        C(6, y + 6.5, 2.2, ["#ffd166", "#7cc05e", "#ffd166"][i]) + C(12, y + 6.5, 2.2, "#cbd5e0")).join("") +
      S("M-9 -29q-4 8 2 14M9 -29q4 8-2 14", "#c9d9e3", 1.2) },
    t_spritzenpumpe: { name: "Spritzenpumpe", der: "die Spritzenpumpe", klein: true, w: 40, h: 20, licht: true, tags: ["infusion"], d: () =>
      R(-19.5, -12, 39, 11.5, WEISS, 3, `stroke="#b9cad6" stroke-width="1"`) + R(8, -10, 9, 6, "#1a202c", 1.5) + R(9.5, -8.5, 6, 3, "#7cff9e", 1) + C(-14, -6, 1.8, "#ffd166") + C(-8, -6, 1.8, "#7cc05e") +
      S("M-17 -15.5h-3", "#c9d9e3", 1.4) + R(-17, -19, 24, 7, "#f4f8fb", 2, `stroke="#b9cad6" stroke-width="0.8"`) + R(-16, -18, 14, 5, "#ffd166", 1.5) +
      R(7, -17, 7, 3, METALL_D, 1) + R(14, -20, 2.5, 9, METALL_D, 1) },
    t_sauerstoffflasche: { name: "Sauerstoffflasche", der: "die Sauerstoffflasche", w: 32, h: 86, farbe: "#5cbf62", d: (c) =>
      S("M-12 -8l-2-50", DUNKEL, 2) + R(-14, -10, 28, 4, DUNKEL, 2) + rad(-10, -4, 4) + rad(10, -4, 4) +
      R(-9, -72, 18, 62, c, 8) + P("M-9 -64q0-9 9-9t9 9z", WEISS) + R(-9, -44, 18, 10, shade(c, 0.3)) + T(0, -36.5, "O2", 7, shade(c, -0.45)) +
      R(-3, -80, 6, 8, METALL_D, 1.5) + R(-6, -82, 12, 3, METALL, 1.5) +
      C(8, -79, 5, WEISS, `stroke="${METALL_D}" stroke-width="1.5"`) + S("M8 -79l2.5-2.5", "#ef5350", 1) },
    t_pflegepult: { name: "Pflegepult", der: "das Pflegepult", w: 100, h: 86, farbe: "#a8d8f8", licht: true, flaeche: -46, fx: [-46, 46], tags: ["monitor", "computer", "tisch"], d: (c) =>
      R(-25, -58, 4, 12, METALL_D) + R(19, -58, 4, 12, METALL_D) +
      schirm(-40, -84, 34, 26) + ekg(-37, -72, 28, "#7cff9e", 1.3) + herz(-12, -76, 0.45, "#ff5c7a") +
      schirm(4, -84, 34, 26) + R(9, -68, 4, 6, "#6cc3d5") + R(15, -72, 4, 10, "#7cff9e") + R(21, -70, 4, 8, "#ffd166") + R(27, -75, 4, 13, "#7cff9e") +
      R(-50, -46, 100, 6, c, 3) + R(-14, -49, 28, 3, "#4a5568", 1.5) +
      R(-46, -40, 34, 36, shade(c, -0.1), 3) + R(-42, -36, 26, 12, shade(c, 0.15), 2) + R(-42, -21, 26, 13, shade(c, 0.15), 2) +
      R(-32, -31, 6, 2.4, DUNKEL, 1.2) + R(-32, -16, 6, 2.4, DUNKEL, 1.2) + leg(40, 40, shade(c, -0.25), 6) + R(-46, -4, 34, 4, shade(c, -0.3), 1.5) },
    t_patientenlift: { name: "Patientenlift", der: "der Patientenlift", w: 88, h: 118, farbe: "#7cc05e", d: (c) =>
      R(-40, -12, 80, 6, METALL_D, 3) + rad(-34, -4, 4) + rad(34, -4, 4) +
      R(-34, -104, 8, 92, WEISS, 3, `stroke="#b9cad6" stroke-width="1.4"`) + R(-31, -70, 5, 30, METALL_D, 2) +
      R(-36, -112, 70, 7, WEISS, 3, `stroke="#b9cad6" stroke-width="1.4" transform="rotate(-5 -30 -108)"`) +
      S("M30 -110v10", METALL_D, 2) + S("M18 -100h24", METALL_D, 3) + S("M19 -100l-1 8M41 -100l1 8", METALL_D, 1.4) +
      P("M17 -92q-2 22 6 32q7 6 14 0q8-10 6-32z", c) + P("M20 -88q0 16 6 24q4 3 8 0q5-8 5-24z", shade(c, 0.2)) +
      S("M-26 -86q10 4 6 18", "#9aa5b1", 1.4) + R(-24, -70, 8, 12, "#2d3748", 2) + C(-20, -66, 1.6, "#7cff9e") },
    t_sauerstoffmaske: { name: "Sauerstoffmaske", der: "die Sauerstoffmaske", klein: true, w: 30, h: 20, d: () =>
      S("M-8 -13q-6-2-5 6q1 5 4 6M8 -13q6-2 5 6q-1 5-4 6", "#9aa5b1", 1.2) +
      S("M2 -1.5q5 2 11-1", "#7fd1b0", 2.4) +
      P("M0 -19q5 0 7 6l3 7q1 4-4 5h-12q-5-1-4-5l3-7q2-6 7-6z", "#d8f5ec", `stroke="#4fb38c" stroke-width="1.4" opacity="0.95"`) +
      S("M-3 -14.5q3-2 6 0", "#4fb38c", 1) + R(-3, -3.5, 6, 3.5, "#4fb38c", 1) + S("M-3 -12l-2 4M3 -12l2 4", WEISS, 1, `opacity="0.8"`) },
    t_alarmlampe: { name: "Alarmlampe", der: "die Alarmlampe", art: "wand", w: 30, h: 34, licht: true, d: () =>
      R(-10, 7, 20, 8, DUNKEL, 2) + P("M-8 7v-10a8 8 0 0 1 16 0v10z", "#ff7a59") + R(-5, -6, 3, 11, "#ffc2a8", 1.5) +
      S("M-11 -9l-3-3M11 -9l3-3M0 -12v-4", "#ff7a59", 1.8) },
    t_pulsmesser: { name: "Pulsmesser", der: "der Pulsmesser", klein: true, w: 30, h: 16, licht: true, d: () =>
      S("M-14 -4q-1-6 3-6", "#9aa5b1", 1.4) + R(-11, -14, 18, 14, WEISS, 4, `stroke="#b9cad6" stroke-width="1"`) + R(-8.5, -11.5, 13, 9, "#1a202c", 1.5) +
      T(-4, -4.8, "98", 6, "#7cff9e") + herz(1.6, -7.6, 0.33, "#ff5c7a") +
      P("M7 -12h4q4 0 4 6t-4 6h-4z", "#3a86ff") + C(11, -6, 1.8, "#ff5c5c") },

    // --- Cafeteria -------------------------------------------------------------------
    t_essenstheke: { name: "Essenstheke", der: "die Essenstheke", w: 160, h: 88, farbe: "#ff9f43", flaeche: -48, fx: [-76, 76], tags: ["theke", "essen"], d: (c) =>
      [[-56, "#7cc05e"], [-28, "#ffd166"], [0, "#ff7a59"], [28, "#d99a55"], [56, "#a8d8f8"]].map(([x, f]) =>
        R(x - 12, -67, 24, 4, METALL, 1.5) + P(`M${x - 11} -67q11-10 22 0z`, f)).join("") +
      C(-60, -69, 1.6, "#ff9f43") + C(-52, -70, 1.6, "#ef5350") + S("M2 -70l8-10", METALL_D, 1.6) +
      P("M-72 -66l5-20h134l5 20z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="1.5" opacity="0.45"`) + S("M-70 -66v-20M70 -66v-20", METALL_D, 2) +
      R(-76, -64, 152, 5, "#e2e8f0", 2.5) + R(-74, -60, 148, 56, c, 4) + R(-68, -40, 136, 28, shade(c, 0.15), 3) +
      R(-74, -6, 148, 6, shade(c, -0.35), 2) +
      R(-78, -48, 156, 4, METALL, 2) + S("M-60 -44v6M0 -44v6M60 -44v6", METALL_D, 2) },
    t_tablettwagen: { name: "Tablettwagen", der: "der Tablettwagen", w: 56, h: 98, d: () =>
      R(-24, -94, 4, 84, METALL_D, 2) + R(20, -94, 4, 84, METALL_D, 2) + R(-26, -98, 52, 4, METALL, 2) + R(-26, -12, 52, 3, METALL, 1.5) +
      R(-14, -76, 14, 2.6, WEISS, 1.3, `stroke="${RAND}" stroke-width="0.8"`) + R(6, -79, 6, 6, "#6cc3d5", 1.5) + R(-8, -53, 6, 7, "#e6f6fc", 1.5, `stroke="${RAND}" stroke-width="0.8"`) +
      R(4, -36, 16, 2.6, WEISS, 1.3, `stroke="${RAND}" stroke-width="0.8"`) +
      [-86, -73, -60, -46, -33, -20].map((y, i) => R(-22, y, 44, 3.5, i % 2 ? "#ff9f43" : "#a0704a", 1.5)).join("") +
      rad(-20, -5, 4.5) + rad(20, -5, 4.5) },
    t_getraenkekuehlschrank: { name: "Getränkekühlschrank", der: "der Getränkekühlschrank", w: 58, h: 124, farbe: "#3a86ff", licht: true, tags: ["kuehlschrank", "trinken"], d: (c) =>
      R(-29, -124, 58, 120, c, 6) + R(-25, -120, 50, 12, shade(c, 0.25), 3) + C(0, -114, 3.5, WEISS) + P("M0 -117.5l-2.4 3.5h4.8z", "#a8d8f8") +
      R(-25, -104, 50, 94, "#e6f6fc", 3, `stroke="${shade(c, -0.25)}" stroke-width="2"`) +
      [-80, -56, -32, -12].map((y, r) => (r < 3 ? R(-23, y, 46, 2.5, "#a8ddf0", 1) : "") + [-20, -13, -6, 1, 8, 15].map((x, i) => {
        const f = ["#a8d8f8", "#ff9f43", "#7cc05e", "#ef5350", "#ffd166", "#a78bfa"][(i + r * 2) % 6];
        return (i + r) % 3 === 2 ? R(x, y - 10, 6, 10, f, 1.5) + R(x, y - 10, 6, 1.6, METALL) : flasche(x, y, 6, 12, f);
      }).join("")).join("") +
      R(19, -86, 3, 30, METALL_D, 1.5) + leg(-25, 4, DUNKEL, 6) + leg(19, 4, DUNKEL, 6) },
    t_snackautomat: { name: "Snackautomat", der: "der Snackautomat", w: 64, h: 126, farbe: "#ef5350", licht: true, tags: ["essen"], d: (c) =>
      R(-32, -126, 64, 122, c, 6) + R(-27, -118, 40, 82, "#e6f6fc", 3) +
      [-100, -82, -64, -46].map((y, r) => [-24, -14, -4, 6].map((x, i) => {
        const f = ["#ffd166", "#7cc05e", "#ff9f43", "#a78bfa", "#6cc3d5", "#ff7aa2"][(i + r * 3) % 6];
        return R(x, y - 13, 8, 13, f, 2) + R(x + 1.5, y - 9, 5, 3, WEISS, 1, `opacity="0.7"`) + S(`M${x - 1} ${y + 2}l2 2l2-2l2 2l2-2l2 2`, METALL_D, 1);
      }).join("")).join("") +
      R(17, -118, 11, 50, shade(c, -0.25), 2) + R(19, -115, 7, 5, "#1a202c", 1) + R(20, -114, 5, 3, "#7cff9e", 0.5) +
      [0, 1, 2, 3].map((r) => [0, 1].map((s) => R(19.5 + s * 3.6, -106 + r * 4, 2.4, 2.4, WEISS, 0.8)).join("")).join("") +
      R(21, -86, 3, 7, DUNKEL, 1) +
      R(-27, -30, 40, 14, "#1a202c", 3) + R(-25, -28, 36, 4, "#2d3748", 2) + leg(-28, 4, DUNKEL, 6) + leg(22, 4, DUNKEL, 6) },
    t_bistrotisch: { name: "Bistrotisch", der: "der Bistrotisch", w: 52, h: 72, farbe: HOLZ, flaeche: -72, tags: ["tisch"], d: (c) =>
      R(-26, -72, 52, 6, c, 3) + R(-20, -66, 40, 3, shade(c, -0.2), 1.5) + R(-2.5, -63, 5, 58, METALL_D, 2) +
      E(0, -26, 12, 2.5, "none", `stroke="${METALL}" stroke-width="2"`) + E(0, -3.5, 16, 3.5, DUNKEL) },
    t_abfallstation: { name: "Abfallstation", der: "die Abfallstation", w: 76, h: 62, d: () => {
      const kuebel = (x, f) => P(`M${x - 11} -50h22l-2 46h-18z`, f) + R(x - 12, -56, 24, 7, shade(f, -0.2), 3);
      return R(-38, -4, 76, 4, DUNKEL, 2) +
        kuebel(-25, "#3a86ff") + E(-25, -52.5, 5, 1.6, DUNKEL) + T(-25, -38, "PET", 6.5, WEISS) + P("M-27.5 -14v-12l1.5-3v-3h2v3l1.5 3v12z", WEISS) +
        kuebel(0, "#9aa5b1") + R(-5, -53.5, 10, 2.4, DUNKEL, 1.2) + T(0, -38, "ALU", 6.5, WEISS) + R(-3.5, -29, 7, 14, WEISS, 1.5) + R(-3.5, -26, 7, 2, "#9aa5b1") +
        kuebel(25, "#5cbf62") + R(20, -53.5, 10, 2.4, DUNKEL, 1.2) + P("M25 -16q-6-4-4-12q4 4 4 9q0-5 4-9q2 8-4 12z", WEISS) + C(25, -30, 2, WEISS);
    } },
    t_tagesmenue: { name: "Tagesmenü", der: "das Tagesmenü", klein: true, w: 42, h: 20, tags: ["essen"], d: () =>
      R(-21, -4, 42, 4, "#a0704a", 2) + R(-19, -3, 38, 1.2, shade("#a0704a", 0.25), 0.6) +
      E(-8, -5, 11, 2, WEISS, `stroke="${RAND}" stroke-width="1"`) + P("M-16 -6q8-9 16 0z", "#ffd166") + S("M-13 -7.5q2.5-3 5 0t5 0", "#e8b94f", 1) +
      E(-8, -10.2, 3.6, 1.8, "#ef5350") + C(-6.4, -11.2, 1, "#7cc05e") +
      P("M3 -9h10q-1 5-5 5t-5-5z", WEISS, `stroke="${RAND}" stroke-width="1"`) + C(5.5, -10, 1.8, "#7cc05e") + C(8.5, -10.5, 1.8, "#5cbf62") + C(10.6, -9.8, 1.3, "#ef5350") +
      P("M14.5 -16h5l-0.8 12h-3.4z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="0.8"`) + P("M14.9 -12h4.2l-0.5 7.6h-3.2z", "#ff9f43") },
    t_suppe: { name: "Suppe", der: "die Suppe", klein: true, w: 30, h: 24, tags: ["essen"], d: () =>
      E(0, -1.8, 14, 1.8, WEISS, `stroke="${RAND}" stroke-width="1"`) +
      P("M-12 -12h24q-1 10-12 10t-12-10z", WEISS, `stroke="${RAND}" stroke-width="1.2"`) + E(0, -12, 12, 2.6, "#ff9f43") +
      C(-4, -12.4, 1, "#ffd166") + C(3, -11.6, 1, "#ffd166") + S("M5 -13l7-6", METALL, 2) + E(12.5, -19.5, 2, 1.3, METALL) +
      S("M-5 -16q-2-2 0-4t0-4M1 -16q-2-2 0-4t0-4", "#cbd5e0", 1.2) },
    t_besteck: { name: "Besteck", der: "das Besteck", klein: true, w: 28, h: 32, tags: ["geschirr"], d: () =>
      S("M-7 -14v-11M-3 -14v-9", METALL, 1.6) + S("M-8.6 -25v-4M-7 -25v-4M-5.4 -25v-4M-4.6 -23v-4M-3 -23v-4M-1.4 -23v-4", METALL, 0.8) +
      S("M1 -14v-10M5 -14v-12", METALL, 1.6) + E(1, -26, 2.2, 3, METALL) + E(5, -28, 2.2, 3, METALL) +
      P("M8.5 -14v-13q3.5 2 3 10z", METALL_D) + P("M11 -14v-11q3 2 2.6 8z", METALL_D) +
      R(-12, -16, 24, 16, HOLZ, 3) + R(-12, -16, 24, 3, HOLZ_D, 2) },
    t_sandwich: { name: "Sandwich", der: "das Sandwich", klein: true, w: 34, h: 16, tags: ["essen", "brot"], d: () =>
      P("M-16 -4q0-4 4-4h24q4 0 4 4v1q0 3-3 3h-26q-3 0-3-3z", "#e8b06a") +
      S("M-15 -8q2-2 4 0t4 0t4 0t4 0t4 0t4 0t4 0", "#7cc05e", 2.4) +
      R(-12, -11, 8, 2.6, "#ef5350", 1) + R(-2, -11, 8, 2.6, "#ef5350", 1) + R(7, -11, 7, 2.6, "#ffd166", 1) +
      P("M-16 -10q2-6 16-6t16 6z", "#d99a55") + S("M-8 -13l2-2M0 -14l2-2M8 -13l2-2", "#b9773a", 1) },
    t_cafeschild: { name: "Cafeteria-Schild", der: "das Cafeteria-Schild", art: "wand", w: 50, h: 34, licht: true, d: () =>
      S("M-14 -17v3M14 -17v3", METALL_D, 1.6) + R(-25, -15, 50, 30, "#2d3748", 6) + R(-22, -12, 44, 24, "#fff6e0", 4) +
      S("M-17 -6q-1.5-2 0-4M-13 -6q-1.5-2 0-4", "#c49a46", 1.2) +
      R(-20, -4, 10, 10, "#ef5350", 2.5) + S("M-10 -1.5q4 0.5 0 5", "#ef5350", 2) + E(-15, 7, 7, 1.6, "#ef5350") +
      T(9.5, 4, "CAFE", 7.5, "#8a5734") },
    t_saftspender: { name: "Saftspender", der: "der Saftspender", klein: true, w: 26, h: 40, tags: ["trinken"], d: () =>
      R(-11, -10, 22, 10, "#cbd5e0", 2) + R(-8, -4, 16, 2, "#a0aec0", 1) +
      R(-10, -36, 20, 26, "#e6f6fc", 4, `stroke="#a8ddf0" stroke-width="1.5"`) + R(-8.5, -29, 17, 17.5, "#ff9f43", 3) +
      C(-3, -21, 3, "#ffd166") + C(3.5, -25, 2.5, "#ffd166") + R(-11, -40, 22, 4, METALL_D, 2) +
      R(6, -15, 6, 3, DUNKEL, 1) + R(10, -15, 2.5, 5, DUNKEL, 1) },
  };

  const RAEUME = {
    labor: ["t_laborabzug", "t_probenkuehlschrank", "t_labortisch", "t_analysegeraet", "t_laborkittel", "t_flaschenregal", "t_pipette", "t_petrischalen", "t_glaskolben", "t_bunsenbrenner", "t_schutzbrille",
      "mikroskop", "reagenzglaeser", "zentrifuge", "hocker", "computer", "lavabo", "schreibtisch"],
    physio: ["t_skelett", "t_uebungstreppe", "t_wackelbrett", "t_kuehlkissen", "t_hantelstaender", "t_igelball", "t_uebungsplakat", "t_therapiebaender", "t_balancierbalken", "t_rotlichtlampe",
      "barren", "gymnastikball", "turnmatte", "sprossenwand", "liege", "hantel", "hometrainer", "kruecken", "spiegel", "radio"],
    bettenstation: ["t_spitalnachttisch", "t_besucherstuhl", "t_rufknopf", "t_besserungskarte", "t_essenstablett", "t_fieberkurve", "t_rollator", "t_pflegewagen", "t_waeschewagen", "t_fernseharm", "t_wasserkrug", "t_finken",
      "spitalbett", "infusion", "paravent", "fernseher", "blumenvase", "tischlampe", "vorhangfenster", "kissen"],
    apotheke: ["t_schubladenschrank", "t_medikamentenregal", "t_apothekentheke", "t_tablettenbox", "t_hustensirup", "t_moerser", "t_pflaster", "t_apothekenschild", "t_salbe", "t_kraeuterglaeser", "t_apothekerwaage",
      "medikamentenschrank", "medikamente", "kasse", "computer", "waage", "stuhl"],
    augen: ["t_brillenmessgeraet", "t_augenmikroskop", "t_brillenwand", "t_augenmodell", "t_brille", "t_augentropfen", "t_untersuchungsstuhl", "t_bildersehtest", "t_farbsehtest", "t_lupe",
      "sehtest", "stuhl", "schreibtisch", "computer", "spiegel"],
    intensiv: ["t_intensivbett", "t_beatmungsgeraet", "t_monitorwand", "t_infusionspumpen", "t_spritzenpumpe", "t_sauerstoffflasche", "t_pflegepult", "t_patientenlift", "t_sauerstoffmaske", "t_alarmlampe", "t_pulsmesser",
      "spitalbett", "herzmonitor", "infusion", "ultraschall", "paravent", "medikamente"],
    spitalcafeteria: ["t_essenstheke", "t_tablettwagen", "t_getraenkekuehlschrank", "t_snackautomat", "t_bistrotisch", "t_abfallstation", "t_tagesmenue", "t_suppe", "t_besteck", "t_sandwich", "t_saftspender", "t_cafeschild",
      "restauranttisch", "stuhl", "kuchenvitrine", "kaffeeautomat", "ladentheke", "kasse", "kaffeetasse", "kuchen", "gipfeli", "menuetafel"],
  };

  const MOTIVE = {
    // Ein Glaskolben mit grünem Saft, daneben ein Reagenzglas.
    labor: () => P("M-4 -13h8v9l9 15q1 3-2 3h-22q-3 0-2-3l9-15z", "#e6f6fc", `stroke="#8fc7e0" stroke-width="1.2"`) +
      P("M-8.2 3h16.4l4.8 8q1 3-2 3h-22q-3 0-2-3z", "#7cc05e") + C(-2, 7, 1.4, "#c5ec9a") + C(3, 9, 1, "#c5ec9a") + C(1, -9, 1.3, "#7cc05e") + C(-1, -15, 1, "#7cc05e") +
      R(16, -10, 5, 22, "#e6f6fc", 2.5, `stroke="#8fc7e0" stroke-width="1"`) + R(16, 2, 5, 10, "#ef5350", 2.5),
    // Ein Gymnastikball und eine Hantel auf der Matte.
    physio: () => R(-23, 10, 46, 7, "#3a86ff", 2) + C(-8, -1, 11, "#a78bfa") + S("M-15 -7q5-5 11-3", "#c9b6ff", 2.4) +
      R(7, 3.7, 12, 2.6, METALL, 1) + R(4, 0, 4, 10, "#ff7a59", 1.5) + R(18, 0, 4, 10, "#ff7a59", 1.5),
    // Ein Bett, ein schlafender Kopf und der Mond.
    bettenstation: () => C(14, -9, 6, "#ffd166") + C(16.5, -11, 5, "#fffaf0") + stern(-16, -11, 2.4, "#ffd166") + stern(4, -13, 2, "#ffd166") +
      R(-20, -4, 4, 18, HOLZ_D, 1.5) + R(-17, 6, 36, 4, HOLZ, 1.5) + R(-17, 10, 3, 4, HOLZ_D) + R(16, 10, 3, 4, HOLZ_D) +
      R(-16, 1, 34, 6, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + R(-15, -3, 9, 5, WEISS, 2.5, `stroke="${RAND}" stroke-width="1"`) +
      C(-10, -3, 3, "#ffe0c2") + S("M-11.5 -3.5h1M-9 -3.5h1", TINTE, 0.8) + P("M-6 -1h22q3 0 3 3v4h-25z", "#6cc3d5") + T(0, -6, "Zz", 6, "#9aa5b1"),
    // Das grüne Apothekenkreuz und eine Kapsel.
    apotheke: () => R(-13, -13, 8, 26, "#2f9e5c", 1.5) + R(-22, -4, 26, 8, "#2f9e5c", 1.5) +
      R(4, -3.5, 9, 7, "#ff7a7a", 3.5, `transform="rotate(-35 12 0)"`) + R(11, -3.5, 9, 7, WEISS, 3.5, `stroke="${RAND}" stroke-width="1" transform="rotate(-35 12 0)"`),
    // Ein grosses Auge.
    augen: () => P("M-20 0q20-20 40 0q-20 20-40 0z", WEISS, `stroke="${TINTE}" stroke-width="1.6"`) + C(0, 0, 8, "#4f8ef7") + C(0, 0, 3.6, TINTE) + C(-2.4, -2.6, 1.6, WEISS) +
      S("M-14 -8l-3-4M-6 -11l-1-4M2 -11.5v-4M10 -10l2-4M16 -6l3-3", TINTE, 1.4),
    // Ein Überwachungsbildschirm mit Herzschlag.
    intensiv: () => schirm(-21, -15, 42, 26) + ekg(-17, 0, 30, "#7cff9e", 1.6) + herz(13, -6, 0.5, "#ff5c7a") + R(-4, 11, 8, 3, METALL_D) + R(-10, 13.5, 20, 2.5, METALL_D, 1),
    // Eine Tasse Kaffee und ein Gipfeli.
    spitalcafeteria: () => E(-9, 13, 12, 2.4, WEISS, `stroke="${RAND}" stroke-width="1"`) + R(-18, -1, 18, 14, "#ef5350", 3) + S("M0 2q6 1 0 7", "#ef5350", 2.4) + E(-9, -1, 9, 2, "#8a5734") +
      S("M-12 -5q-2-3 0-6t0-5M-6 -5q-2-3 0-6t0-5", "#cbd5e0", 1.4) +
      P("M6 12q8-16 16 0q-8 4-16 0z", "#e8a85a") + S("M10 6l2 3M14 4v4M18 6l-2 3", "#b9773a", 1.1),
  };

  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
