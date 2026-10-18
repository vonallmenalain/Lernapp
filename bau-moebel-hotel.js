/*
 * bau-moebel-hotel.js – Die eigenen Dinge der Zimmer im Hotel (Bauecke):
 * Rezeption, Gästezimmer, Familienzimmer, Suite, Frühstückssaal, Wellness,
 * Kinderclub und Hotelküche.
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten, die Bildmotive und die Sätze
 * für neue Wünsche an. Alle Kennungen beginnen mit o_ (wie Hotel – das h_
 * gehört schon dem Haus).
 *
 * Die Betten heissen hier anders als bett und doppelbett: Die gibt es nur im
 * Schlafzimmer (validate-bau.mjs). Sie tragen aber den tag "bett".
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, leg, stern, topf, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE, BUNT } = M.hilfe;

  // Gerundet auf eine Stelle, damit berechnete Punkte kurz bleiben.
  const n = (v) => Math.round(v * 10) / 10;

  // Die Farben des Hotels: Gold und ein tiefes Rot, dazu Marmor und Glas.
  const GOLD = "#e8b94f";
  const GOLD_D = "#c99a2e";
  const GOLD_H = "#f6d77a";
  const BORDEAUX = "#a63d5a";
  const MARMOR = "#f1ece4";
  const MARMOR_D = "#d9cfc1";
  const GLAS = "#e6f6fc";
  const GLAS_R = "#a8ddf0";
  const INOX = "#dfe6ee";
  const INOX_D = "#b4c0cd";
  const SAUNAHOLZ = "#d9a066";
  const SAUNAHOLZ_D = "#b9824a";
  const WASSER = "#8fd6f5";
  const LEUCHTGRUEN = "#7cff9e";
  const HAUT = "#ffe0c2";

  // --- Kleine Bausteine ------------------------------------------------------
  // Ein Herz um (cx, cy); s ist ungefähr die halbe Breite.
  const herz = (cx, cy, s, fill, extra = "") =>
    P(`M${n(cx)} ${n(cy + s * 0.85)}C${n(cx - s * 1.25)} ${n(cy)} ${n(cx - s * 0.7)} ${n(cy - s * 0.95)} ${n(cx)} ${n(cy - s * 0.4)}` +
      `C${n(cx + s * 0.7)} ${n(cy - s * 0.95)} ${n(cx + s * 1.25)} ${n(cy)} ${n(cx)} ${n(cy + s * 0.85)}Z`, fill, extra);
  // Ein Volant mit Bögen (Baldachin, Vorhang): oben gerade von x0 bis x1,
  // unten anzahl Bögen, die bis tief unter die Linie y hängen.
  const volant = (x0, x1, yOben, y, tief, anzahl) => {
    const w = (x1 - x0) / anzahl;
    let d = `M${x0} ${yOben}H${x1}V${y}`;
    for (let i = anzahl - 1; i >= 0; i -= 1) d += `Q${n(x0 + w * (i + 0.5))} ${n(y + tief * 2)} ${n(x0 + w * i)} ${y}`;
    return `${d}Z`;
  };
  // Dampf, der aufsteigt (x, y = unten).
  const dampf = (x, y, h = 10) => S(`M${x} ${y}q-3 ${n(-h / 4)} 0 ${n(-h / 2)}t0 ${n(-h / 2)}`, "#cbd5e0", 1.5, `opacity="0.85"`);
  // Ein Gipfeli von der Seite (x = Mitte, y = unten).
  const gipfeli = (x, y, f = "#e8a85a") => P(`M${x - 6} ${y}q6 -10 12 0q-6 3 -12 0z`, f) + S(`M${x - 2} ${y - 3.4}l1 2.6M${x + 2} ${y - 3.4}l-1 2.6`, "#b9773a", 0.9);
  // Ein Koffer (x = links, unten = Boden), mit zwei Rippen und dem Griff oben.
  const koffer = (x, unten, w, h, f) => R(x, unten - h, w, h, f, 3.5) + R(x + w * 0.25 - 1.5, unten - h + 2, 3, h - 4, shade(f, -0.16), 1.5) +
    R(x + w * 0.75 - 1.5, unten - h + 2, 3, h - 4, shade(f, -0.16), 1.5) + R(x + 2, unten - h + 1.5, w - 4, 2.5, shade(f, 0.25), 1.2) +
    R(x + w / 2 - 4, unten - h - 3.5, 8, 4, DUNKEL, 2);
  // Ein Zeiger-Paar auf einer Uhr (stunde, minute) um (cx, cy).
  function zeiger(cx, cy, stunde, minute, laenge) {
    const a = (((stunde % 12) * 30 + minute * 0.5) * Math.PI) / 180;
    const b = (minute * 6 * Math.PI) / 180;
    return S(`M${cx} ${cy}L${n(cx + Math.sin(a) * laenge * 0.55)} ${n(cy - Math.cos(a) * laenge * 0.55)}M${cx} ${cy}L${n(cx + Math.sin(b) * laenge)} ${n(cy - Math.cos(b) * laenge)}`, TINTE, 1.3) + C(cx, cy, 1, TINTE);
  }
  // Ein Handabdruck in Farbe f, um (x, y) gedreht.
  const hand = (x, y, f, w) => `<g transform="translate(${x} ${y}) rotate(${w}) scale(0.85)">` +
    E(0, 1, 4.6, 5, f) + E(-4.4, -6, 1.4, 3.2, f) + E(-1.5, -8, 1.4, 3.6, f) + E(1.5, -8, 1.4, 3.6, f) + E(4.3, -6.4, 1.4, 3.2, f) +
    E(6, 0.5, 1.5, 3, f, `transform="rotate(55 6 0.5)"`) + "</g>";
  // Eine Orchideenblüte um (x, y).
  const bluete = (x, y, f) => C(x - 2.6, y - 0.8, 2.4, f) + C(x + 2.6, y - 0.8, 2.4, f) + C(x, y - 3, 2.4, f) + C(x - 1.8, y + 2, 2, f) + C(x + 1.8, y + 2, 2, f) + C(x, y, 1.2, "#c2185b");
  // Ein Stück Gebäck auf dem Blechwagen.
  const weggli = (x, y) => E(x, y - 3.5, 5, 3.6, "#d99a55") + S(`M${x - 3} ${y - 4.6}q3 -1.6 6 0`, "#b9773a", 1);

  // ---------------------------------------------------------------------------
  // Die Dinge
  // ---------------------------------------------------------------------------
  const DINGE = {
    // --- Rezeption -------------------------------------------------------------
    o_rezeptionstheke: { name: "Rezeptionstheke", der: "die Rezeptionstheke", kat: "laden", w: 140, h: 66, farbe: BORDEAUX, flaeche: -66, tags: ["theke", "empfang"], d: (c) =>
      R(-66, -58, 132, 58, c, 4) + R(-60, -50, 36, 40, shade(c, 0.12), 3) + R(24, -50, 36, 40, shade(c, 0.12), 3) +
      R(-20, -50, 40, 40, shade(c, -0.14), 3) + stern(-11, -30, 5, GOLD) + stern(0, -30, 5, GOLD) + stern(11, -30, 5, GOLD) +
      R(-66, -58, 132, 3, GOLD) + R(-66, -6, 132, 6, shade(c, -0.3), 2) +
      R(-70, -66, 140, 9, MARMOR, 3) + S("M-58 -62h18M12 -63q8 2 22 0", MARMOR_D, 1) },
    o_hotelklingel: { name: "Hotelklingel", der: "die Hotelklingel", kat: "laden", klein: true, w: 26, h: 20, tags: ["klingel"], d: () =>
      R(-12, -4, 24, 4, HOLZ_D, 2) + P("M-9 -4a9 9 0 0 1 18 0z", GOLD) + S("M-5.5 -7.5a5.5 5.5 0 0 1 3.5-3", "#fff1b8", 1.4) +
      R(-1.2, -16, 2.4, 3.5, GOLD_D, 1) + E(0, -16.5, 3.4, 1.5, GOLD_D) + S("M-8 -16l-3-2M8 -16l3-2M0 -19v-0.1", GOLD, 1.2) },
    o_schluesselfaecher: { name: "Schlüsselfächer", der: "die Schlüsselfächer", kat: "buero", art: "wand", w: 84, h: 64, tags: ["schluessel"], d: () =>
      R(-42, -32, 84, 64, HOLZ_D, 4) + R(-38, -28, 76, 56, "#e9d2b4", 2) +
      [0, 1, 2].map((r) => [0, 1, 2, 3].map((k) => {
        const x = -36 + k * 18.5;
        const y = -26 + r * 18;
        const hatSchluessel = (r * 4 + k) % 3 !== 1;
        return R(x, y, 16, 15, "#7a4a2a", 1.5) + (hatSchluessel
          ? S(`M${x + 8} ${y + 1.5}v2`, GOLD_D, 1) + C(x + 8, y + 5, 1.7, "none", `stroke="${METALL}" stroke-width="1"`) +
            R(x + 5.5, y + 6.6, 5, 7.4, (r + k) % 2 ? GOLD : BORDEAUX, 1.8) + C(x + 8, y + 11.4, 0.9, (r + k) % 2 ? GOLD_D : "#ffd6e0")
          : R(x + 3, y + 9, 10, 4, WEISS, 1));
      }).join("")).join("") },
    o_gepaeckwagen: { name: "Gepäckwagen", der: "der Gepäckwagen", kat: "laden", w: 80, h: 124, farbe: BORDEAUX, tags: ["koffer"], d: (c) =>
      R(-36, -112, 4, 92, GOLD, 2) + R(32, -112, 4, 92, GOLD, 2) + S("M-34 -110Q0 -130 34 -110", GOLD, 4) + S("M-34 -96H34", GOLD, 2.4) +
      S("M22 -96v3", METALL_D, 1.4) + R(14, -93, 16, 52, "#4a5568", 4) + S("M22 -90v44", "#2d3748", 1) + R(16, -88, 5, 3, GOLD, 1) +
      koffer(-30, -20, 38, 34, "#3a86ff") + koffer(-26, -57.5, 30, 22, "#ffd166") + C(-18, -46, 3, "#ef5350") + stern(-18, -46, 1.8, WEISS) +
      R(-38, -16, 76, 6, GOLD_D, 3) + R(-36, -21, 72, 5, c, 2) +
      C(-30, -6, 6, DUNKEL) + C(-30, -6, 2.2, METALL) + C(30, -6, 6, DUNKEL) + C(30, -6, 2.2, METALL) },
    o_koffer: { name: "Koffer", der: "der Koffer", kat: "laden", klein: true, w: 34, h: 54, farbe: "#3a86ff", tags: ["koffer"], d: (c) =>
      S("M-6 -34V-52H6V-34", METALL_D, 2.6) + R(-15, -37, 30, 33, c, 5) + R(-9, -34, 3, 27, shade(c, -0.16), 1.5) + R(6, -34, 3, 27, shade(c, -0.16), 1.5) +
      R(-13, -35, 26, 3, shade(c, 0.25), 1.5) + R(-4, -24, 9, 7, "#ffd166", 1.5) + stern(0.5, -20.5, 2.2, "#ef5350") +
      C(-10, -2.5, 2.5, DUNKEL) + C(10, -2.5, 2.5, DUNKEL) },
    o_reisetasche: { name: "Reisetasche", der: "die Reisetasche", kat: "laden", klein: true, w: 40, h: 28, farbe: "#a0663e", tags: ["koffer"], d: (c) =>
      S("M-8 -20Q-8 -27 0 -27Q8 -27 8 -20", shade(c, -0.3), 2.4) + R(-18, -21, 36, 19, c, 8) + R(-18, -6, 36, 4, shade(c, -0.22), 2) +
      S("M-14 -17.5h28", shade(c, -0.28), 1.2) + R(-14, -14, 8, 9, shade(c, 0.14), 2) + R(6, -14, 8, 9, shade(c, 0.14), 2) +
      C(-10, -9.5, 0.9, GOLD) + C(10, -9.5, 0.9, GOLD) + R(-15, -2, 5, 2, DUNKEL, 1) + R(10, -2, 5, 2, DUNKEL, 1) },
    o_prospektstaender: { name: "Prospektständer", der: "der Prospektständer", kat: "laden", w: 44, h: 104, d: () => {
      const farben = ["#7cc05e", "#6cc3d5", "#3a86ff", "#ff7aa2", "#a78bfa", "#ffe08a"];
      const bild = (k, x, y) => [
        P(`M${x + 2} ${y + 7}l5 -5.5l2.5 2.5l2 -2l3.5 5z`, WEISS),
        C(x + 7.5, y + 4, 2.6, "#ffd166"),
        P(`M${x + 3.5} ${y + 5}h8l-1.5 2h-5z`, WEISS) + P(`M${x + 7.5} ${y + 4.6}V${y + 1}l3 3.6z`, WEISS),
        herz(x + 7.5, y + 4, 2.6, WEISS),
        stern(x + 7.5, y + 4, 3, "#ffd166"),
        S(`M${x + 1} ${y + 2}l13 2`, DUNKEL, 0.6) + R(x + 6, y + 3.4, 4, 3, "#ef5350", 1),
      ][k];
      return E(0, -3, 16, 3.5, DUNKEL) + R(-2, -62, 4, 59, METALL, 2) + R(-20, -104, 40, 44, METALL_D, 3) + R(-18, -102, 36, 40, "#dfe6ee", 2) +
        [-100, -87, -74].map((y, r) => [-16, 1].map((x, s) => {
          const k = r * 2 + s;
          return R(x, y, 15, 12, farben[k], 1.5) + bild(k, x, y) + R(x - 1, y + 6, 17, 7, "#f4f8fb", 1.5, `opacity="0.85"`) + R(x - 1, y + 6, 17, 1.2, WEISS, 0.6);
        }).join("")).join("");
    } },
    o_lobbysofa: { name: "Lobbysofa", der: "das Lobbysofa", kat: "sitzen", w: 128, h: 56, farbe: "#3f8f7a", tags: ["sofa", "sitz"], d: (c) =>
      R(-56, -56, 112, 30, shade(c, -0.12), 12) + [-42, -28, -14, 0, 14, 28, 42].map((x, i) => C(x, i % 2 ? -40 : -48, 1.4, shade(c, -0.4))).join("") +
      R(-56, -30, 112, 20, c, 6) + R(-50, -35, 49, 11, shade(c, 0.12), 5) + R(1, -35, 49, 11, shade(c, 0.12), 5) +
      R(-64, -44, 18, 34, shade(c, -0.02), 8) + E(-55, -44, 10, 5, shade(c, 0.16)) + R(46, -44, 18, 34, shade(c, -0.02), 8) + E(55, -44, 10, 5, shade(c, 0.16)) +
      R(-56, -12, 112, 2, GOLD) + leg(-58, 10, HOLZ_DD, 7) + leg(51, 10, HOLZ_DD, 7) },
    o_weltuhren: { name: "Weltuhren", der: "die Weltuhren", kat: "deko", art: "wand", w: 116, h: 44, tags: ["uhr"], d: () =>
      R(-58, -22, 116, 44, HOLZ_D, 4) + R(-55, -19, 110, 38, "#f3e6d2", 3) +
      [[-41, "ZÜRICH", 9, 0], [-14, "LONDON", 8, 0], [14, "NEW YORK", 3, 0], [41, "TOKIO", 4, 0]].map(([x, ort, h, m]) =>
        C(x, -5, 11, DUNKEL) + C(x, -5, 9, WEISS) + [0, 3, 6, 9].map((s) => C(n(x + Math.sin((s * Math.PI) / 6) * 7.4), n(-5 - Math.cos((s * Math.PI) / 6) * 7.4), 0.7, TINTE)).join("") +
        zeiger(x, -5, h, m, 7) + R(x - 12, 9, 24, 7, GOLD, 2) + T(x, 14.3, ort, 4.2, "#5b3a29")).join("") },
    o_drehtuer: { name: "Drehtür", der: "die Drehtür", kat: "deko", w: 110, h: 150, tags: ["tuer"], d: () =>
      R(-46, -136, 92, 128, GLAS, 2, `opacity="0.9"`) +
      R(-40, -132, 36, 122, "#cfeaf6", 2, `stroke="${GOLD_D}" stroke-width="2"`) + R(6, -132, 22, 122, "#bfe3f2", 2, `stroke="${GOLD_D}" stroke-width="2"`) +
      R(34, -132, 5, 122, GOLD_D, 1.5) + R(-2.5, -136, 5, 128, GOLD_D, 1.5) + R(-36, -74, 28, 3, GOLD, 1.5) + R(9, -74, 16, 3, GOLD, 1.5) +
      S("M-34 -118l14 -14M-32 -98l18 -18M10 -120l10 -10", WEISS, 2.4, `opacity="0.7"`) +
      R(-52, -136, 6, 128, GOLD_D, 2) + R(46, -136, 6, 128, GOLD_D, 2) +
      R(-55, -150, 110, 15, BORDEAUX, 4) + R(-55, -137, 110, 3, GOLD, 1.5) + [-28, -14, 0, 14, 28].map((x) => stern(x, -143.5, 4.2, GOLD)).join("") +
      R(-55, -8, 110, 8, MARMOR_D, 2) },
    o_hotelschild: { name: "Hotelschild", der: "das Hotelschild", kat: "deko", art: "wand", w: 110, h: 44, licht: true, d: () =>
      R(-55, -22, 110, 44, BORDEAUX, 6) + R(-51, -18, 102, 36, "none", 4, `stroke="${GOLD}" stroke-width="1.6"`) +
      T(0, 7, "HOTEL", 19, "#ffe7a3") + stern(-41, -1, 5, GOLD) + stern(41, -1, 5, GOLD) },
    o_hotellift: { name: "Hotellift", der: "der Hotellift", kat: "deko", w: 86, h: 146, tags: ["lift"], d: () =>
      R(-43, -146, 86, 146, "#d9c8a9", 4) + P("M-17 -124a17 17 0 0 1 34 0z", GOLD) + P("M-13 -124a13 13 0 0 1 26 0z", "#2d3748") +
      [0, 1, 2, 3, 4].map((k) => C(n(Math.cos(Math.PI + (k * Math.PI) / 4) * 10.4), n(-124 + Math.sin(Math.PI + (k * Math.PI) / 4) * 10.4), 1.1, "#fff6c2")).join("") +
      S(`M0 -124L${n(9 * Math.cos(-0.9))} ${n(-124 + 9 * Math.sin(-0.9))}`, GOLD_H, 1.6) + C(0, -124, 1.8, GOLD) +
      R(-33, -118, 66, 118, GOLD_D, 2) + R(-31, -116, 30.5, 116, GOLD, 1.5) + R(0.5, -116, 30.5, 116, GOLD, 1.5) +
      [[-27, -108], [4.5, -108], [-27, -56], [4.5, -56]].map(([x, y]) => R(x, y, 22.5, 46, "none", 2, `stroke="${GOLD_D}" stroke-width="1.4"`)).join("") +
      S("M-24 -100l10 -10M8 -100l10 -10", "#fff1b8", 2, `opacity="0.8"`) +
      R(35, -74, 6, 16, "#2d3748", 2) + P("M38 -71l-2 3h4z", "#ffd166") + P("M38 -61l-2 -3h4z", "#fff6c2") + R(-36, -4, 72, 4, GOLD_D, 1.5) },
    o_gaestebuch: { name: "Gästebuch", der: "das Gästebuch", kat: "buero", klein: true, w: 36, h: 18, tags: ["buecher"], d: () =>
      P("M-17 0V-3Q-8 -6 0 -3Q8 -6 17 -3V0Z", BORDEAUX) +
      P("M0 -4Q-8 -10 -16 -7V-2Q-8 -5 0 -1Z", "#fbf8f2", `stroke="${RAND}" stroke-width="0.8"`) + P("M0 -4Q8 -10 16 -7V-2Q8 -5 0 -1Z", "#f6f0e2", `stroke="${RAND}" stroke-width="0.8"`) +
      S("M-13 -6.5q5 -2 10 -0.5M-13 -4.5q5 -2 10 -0.5", "#9aa5b1", 0.6) + S("M3 -6.4q2 -2 3 0t3 0t3 -1", TINTE, 0.7) +
      S("M6 -5L15 -14", "#2d3748", 1.8) + S("M15 -14l1.6 -1.6", GOLD, 1.8) },
    o_roterteppich: { name: "Roter Teppich", der: "der rote Teppich", kat: "deko", art: "flach", w: 166, h: 10, farbe: "#c0392b", tags: ["teppich"], d: (c) =>
      R(-80, -9, 160, 9, c, 1.5) + R(-80, -9, 160, 1.6, GOLD) + R(-80, -2.4, 160, 1.6, GOLD) + S("M-81.5 -8v7M81.5 -8v7", GOLD, 1.4, `stroke-dasharray="1.4 1.4"`) },

    // --- Gästezimmer -------------------------------------------------------------
    o_hotelbett: { name: "Hotelbett", der: "das Hotelbett", kat: "sitzen", w: 150, h: 74, farbe: BORDEAUX, tags: ["bett"], d: (c) =>
      R(-60, -26, 134, 14, "#e2d8ca", 4) + leg(-56, 12, DUNKEL, 5) + leg(66, 12, DUNKEL, 5) + R(-60, -40, 134, 16, "#fbf8f2", 7) +
      R(-57, -57, 30, 17, WEISS, 8, `stroke="${RAND}" stroke-width="1.2"`) + R(-44, -54, 28, 15, WEISS, 7, `stroke="${RAND}" stroke-width="1.2"`) +
      R(-32, -50, 16, 12, c, 5) + R(-30, -48, 12, 2, shade(c, 0.3), 1) +
      P("M-24 -44H64A10 10 0 0 1 74 -34V-24H-24Z", WEISS, `stroke="${RAND}" stroke-width="1.2"`) + S("M-23 -38H72", "#e6edf2", 1.4) +
      R(42, -45, 18, 21, c, 2) + R(42, -45, 18, 3, shade(c, 0.25), 1.5) + R(42, -34, 18, 1.6, GOLD) +
      R(-75, -74, 16, 74, c, 6) + S("M-70 -68V-8M-64 -68V-8", shade(c, -0.2), 1.2) },
    o_schoggikissen: { name: "Schoggi auf dem Kissen", der: "die Schoggi auf dem Kissen", kat: "sitzen", klein: true, w: 34, h: 26, tags: ["schoggi", "kissen"], d: () =>
      P("M-17 -2c-3-8 0-18 4-20c10 3 20 3 26 0c4 4 6 12 4 20c-10 3-24 3-34 0z", WEISS, `stroke="${RAND}" stroke-width="1.2"`) + S("M-8 -10q8 2 16 0", "#e2e8f0", 1.4) +
      R(-7, -25, 14, 9, "#5b3a29", 1.5) + R(-7, -25, 14, 3, GOLD, 1.2) + R(-5, -19.6, 10, 1.2, "#7a4f36", 0.6) + herz(0, -23.4, 1.2, BORDEAUX) },
    o_minibar: { name: "Minibar", der: "die Minibar", kat: "kueche", w: 42, h: 42, flaeche: -42, tags: ["minibar", "trinken"], d: () =>
      R(-21, -42, 42, 40, "#2d3748", 4) + R(-17, -38, 30, 32, "#1a202c", 2) + R(-16, -37, 28, 30, "#d6eef7", 2, `opacity="0.92"`) + R(-16, -22.5, 28, 1.5, "#9aa5b1") +
      [[-13.5, "#7cc05e"], [-8.5, "#ef5350"], [-3.5, "#ffd166"], [1.5, "#6cc3d5"], [6.5, "#ff9f43"]].map(([x, f]) => R(x, -34, 3.4, 11, f, 1.2) + R(x + 0.9, -36.6, 1.6, 3, f, 0.6)).join("") +
      [[-13.5, "#3a86ff"], [-8, "#ef5350"], [-2.5, "#7cc05e"], [3, "#a78bfa"]].map(([x, f]) => R(x, -19, 4.4, 7, f, 1) + R(x, -19, 4.4, 1.4, METALL, 0.6)).join("") +
      R(14.5, -34, 2.5, 20, METALL, 1.2) + leg(-18, 2, DUNKEL, 4) + leg(14, 2, DUNKEL, 4) },
    o_kofferablage: { name: "Kofferablage", der: "die Kofferablage", kat: "tische", w: 64, h: 32, flaeche: -31, d: () =>
      S("M-24 0L24 -27M24 0L-24 -27", HOLZ_D, 3.4) + C(0, -13.5, 2.4, HOLZ_DD) + R(-30, -31, 60, 4, HOLZ, 2) +
      [-16, 0, 16].map((x) => R(x - 4, -28, 8, 4, BORDEAUX, 1.5)).join("") + R(-28, -2, 8, 2, HOLZ_DD, 1) + R(20, -2, 8, 2, HOLZ_DD, 1) },
    o_hotelschrank: { name: "Hotelschrank", der: "der Hotelschrank", kat: "tische", w: 84, h: 136, farbe: "#e9dcc6", tags: ["schrank"], d: (c) =>
      R(-42, -132, 78, 128, c, 5, `stroke="${shade(c, -0.2)}" stroke-width="2"`) + R(-44, -136, 82, 6, shade(c, -0.12), 3) +
      R(-38, -126, 36, 116, shade(c, 0.06), 3) + R(-8, -74, 3, 14, HOLZ_DD, 1.5) +
      R(1, -126, 32, 116, shade(c, -0.42), 3) + R(4, -121, 26, 10, "#f3e6d2", 3) + R(4, -117, 26, 1.5, BORDEAUX) + R(1, -110.5, 32, 2.5, shade(c, -0.15)) +
      R(3, -102, 28, 2, METALL, 1) + [11, 23].map((x) => S(`M${x} -101v2.5l-6 4.5h12l-6 -4.5`, METALL_D, 1.2)).join("") +
      P("M5 -94h12l3 5-3 1v22h-12v-22l-3-1z", "#a8d8f8") + S("M11 -94v24", "#7fb8d8", 0.8) +
      R(5, -42, 24, 22, "#4a5568", 2.5) + R(7, -40, 20, 18, "#5a6577", 2) + C(13, -31, 4, METALL_D) + C(13, -31, 1.5, METALL) + C(23, -36, 1.2, LEUCHTGRUEN) +
      [-32, -29, -26].map((y) => R(21, y, 4, 1.6, "#cbd5e0", 0.5)).join("") +
      R(36, -126, 6, 116, shade(c, 0.12), 2) + R(38, -74, 2, 10, HOLZ_DD, 1) + leg(-38, 4, HOLZ_DD, 6) + leg(28, 4, HOLZ_DD, 6) },
    o_nichtstoeren: { name: "Bitte nicht stören", der: "das Schild «Bitte nicht stören»", kat: "deko", art: "wand", w: 28, h: 54, tags: ["nichtstoeren"], d: () =>
      R(-13, -27, 26, 54, "#2f3b6b", 6) + C(0, -18, 5.5, "#1c2547") + C(0, -18, 3, GOLD) +
      P("M1 -8a8 8 0 1 0 6 12a6.5 6.5 0 1 1 -6 -12z", "#ffd166") + T(7, -2, "z", 6, WEISS) + T(10, -7, "z", 4.5, WEISS) + stern(-8, -6, 1.8, "#fff6c2") +
      T(0, 15, "BITTE NICHT", 3.6, WEISS) + T(0, 20.5, "STÖREN", 3.6, WEISS) },
    o_bademantel: { name: "Bademantel", der: "der Bademantel", kat: "bad", art: "wand", w: 50, h: 80, farbe: "#ffffff", tags: ["bademantel"], d: (c) =>
      R(-1, -37, 2, 4, METALL_D, 1) + C(0, -37, 2.4, METALL_D) +
      P("M-9 -33L-20 -27L-24 4L-18 6L-15 -6V38H15V-6L18 6L24 4L20 -27L9 -33Q0 -27 -9 -33Z", c, `stroke="${shade(c, -0.2)}" stroke-width="1.2"`) +
      P("M-9 -33Q-6 -17 0 -5Q6 -17 9 -33Q0 -27 -9 -33Z", shade(c, -0.07)) + S("M0 -5V38", shade(c, -0.18), 1.2) +
      R(-24.5, 0, 7, 5, shade(c, -0.08), 2) + R(17.5, 0, 7, 5, shade(c, -0.08), 2) +
      R(-15, 4, 30, 4, shade(c, -0.12), 2) + S("M1 8l-4 13M4 8l4 12", shade(c, -0.12), 2.6) +
      R(5, 14, 8, 9, shade(c, -0.05), 2, `stroke="${shade(c, -0.15)}" stroke-width="0.8"`) + stern(-8, -8, 2.6, GOLD) },
    o_flachbildschirm: { name: "Flachbildschirm", der: "der Flachbildschirm", kat: "deko", art: "wand", w: 92, h: 52, licht: true, tags: ["fernseher"], d: () =>
      R(-46, -26, 92, 52, "#1f2733", 4) + R(-42, -22, 84, 42, "#8fd0ef", 2) + C(-34, -12, 5, "#ffd166") +
      P("M-2 8L8 -12L12 -8L22 8Z", "#9aa5b1") + P("M5.6 -7L8 -12L11.6 -8.4L9.5 -7L8 -8.5L6.8 -6.5Z", WEISS) +
      P("M-42 20V6Q-30 -2 -18 6T6 6T42 4V20Z", "#7cc05e") + E(-14, 15, 14, 3, "#6cc3d5") +
      R(-24, -19, 48, 9, WEISS, 4.5, `opacity="0.9"`) + T(0, -12.4, "WILLKOMMEN", 6.4, BORDEAUX) + C(40, 23, 1, "#ef5350") },
    o_wandlampe: { name: "Wandlampe", der: "die Wandlampe", kat: "deko", art: "wand", w: 44, h: 50, farbe: "#f6ead2", licht: true, tags: ["lampe"], d: (c) =>
      R(-21, -23, 7, 18, GOLD_D, 2.5) + S("M-15 -14H2Q8 -14 8 -8V-3", GOLD_D, 2.4) + C(-15, -14, 2, GOLD) +
      E(8, 17, 9, 2.6, "#fff6c2") + P("M-1 -3H17L22 14H-6Z", c) + R(-1, -4, 18, 2, shade(c, -0.1), 1) + R(-6, 12.5, 28, 2.5, shade(c, -0.15), 1.2) },
    o_servierwagen: { name: "Zimmerservice-Wagen", der: "der Zimmerservice-Wagen", kat: "laden", w: 76, h: 70, tags: ["essen"], d: () =>
      R(-31, -18, 3, 14, METALL_D, 1.5) + R(28, -18, 3, 14, METALL_D, 1.5) + R(-32, -12, 64, 3, METALL, 1.5) +
      C(-29.5, -4, 4, DUNKEL) + C(-29.5, -4, 1.5, METALL) + C(29.5, -4, 4, DUNKEL) + C(29.5, -4, 1.5, METALL) +
      P("M-35 -38H35L32 -18H-32Z", WEISS, `stroke="${RAND}" stroke-width="1.2"`) + R(-34, -25, 67, 2, BORDEAUX) +
      R(-36, -42, 72, 5, WEISS, 2.5, `stroke="${RAND}" stroke-width="1.2"`) +
      E(-8, -42.5, 17, 2.4, METALL) + P("M-22 -43a14 13 0 0 1 28 0z", "#dfe6ee") + C(-8, -57.5, 2.6, METALL_D) + S("M-17 -47a9 9 0 0 1 5 -6", WEISS, 2, `opacity="0.9"`) +
      R(17, -54, 7, 12, GLAS, 2.5, `stroke="${GLAS_R}" stroke-width="1.2"`) + S("M20.5 -54v-9", "#5cb85c", 1.4) + P("M20.5 -58q4 -3 6 0q-3 2 -6 0z", "#5cb85c") +
      C(20.5, -65, 3.6, "#ef5350") + C(20.5, -65, 1.6, "#c93b3b") + R(27, -51, 7, 9, GLAS, 1.5, `stroke="${GLAS_R}" stroke-width="1"`) + R(27.6, -47, 5.8, 4.6, "#ffb347", 1) },
    o_zimmersafe: { name: "Zimmersafe", der: "der Zimmersafe", kat: "buero", klein: true, w: 30, h: 26, d: () =>
      R(-15, -26, 30, 24, "#4a5568", 3) + R(-12, -23, 24, 18, "#5a6577", 2) + R(-10, -21, 10, 4, LEUCHTGRUEN, 1) +
      [-9, -5.5, -2].map((x) => [-14, -10.5, -7].map((y) => C(x, y, 0.9, "#cbd5e0")).join("")).join("") +
      C(6, -14, 4.5, METALL) + C(6, -14, 1.6, DUNKEL) + S("M6 -18.5v9M1.5 -14h9", METALL_D, 0.8) + R(-13, -2, 5, 2, DUNKEL, 1) + R(8, -2, 5, 2, DUNKEL, 1) },
    o_teetablett: { name: "Teetablett", der: "das Teetablett", kat: "kueche", klein: true, w: 44, h: 26, tags: ["tee", "trinken"], d: () =>
      R(-20, -4, 40, 4, HOLZ, 2) + S("M-16 -12l-3 -4", "#e2e8f0", 2.4) + P("M-17 -4l1.5 -16h12l1.5 16z", "#e2e8f0") + S("M-1.5 -18q5 2 3 10", METALL, 2.4) + R(-13, -23, 6, 3, DUNKEL, 1.5) +
      [[1, "#7cc05e"], [10, "#ff9f43"]].map(([x, f]) => R(x, -12, 8, 8, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + S(`M${x + 8} -10q3 1 0 4`, RAND, 1.4) +
        S(`M${x + 5} -12l2 -5`, "#9aa5b1", 0.7) + R(x + 6, -19, 3, 3, f, 0.6)).join("") },
    o_zimmertuer: { name: "Zimmertür", der: "die Zimmertür", kat: "deko", w: 72, h: 134, farbe: "#a46c43", tags: ["tuer"], d: (c) =>
      R(-36, -134, 72, 134, "#e9e2d6", 4) + R(-30, -128, 60, 128, c, 3) + R(-24, -120, 48, 50, shade(c, 0.08), 3) + R(-24, -62, 48, 46, shade(c, 0.08), 3) +
      R(-11, -114, 22, 13, GOLD, 2.5) + T(0, -104, "12", 10, "#5b3a29") + C(0, -94, 2.2, GOLD_D) + C(0, -94, 1, TINTE) +
      R(19, -84, 7, 11, "#2d3748", 1.5) + R(20.5, -82, 4, 2, "#4a5568", 0.5) + C(22.5, -76.5, 1, LEUCHTGRUEN) +
      R(19, -66, 4, 6, GOLD_D, 1.5) + R(10, -65, 13, 3, GOLD, 1.5) + R(-30, -12, 60, 9, "#d5dde6", 1.5) },
    o_hotelfinken: { name: "Hotelfinken", der: "die Hotelfinken", kat: "bad", klein: true, w: 38, h: 14, farbe: "#ffffff", tags: ["finken"], d: (c) =>
      [-18, -5].map((x0) => P(`M${x0} 0V-4Q${x0} -6 ${x0 + 2} -6H${x0 + 8}Q${x0 + 12} -10 ${x0 + 18} -10Q${x0 + 24} -10 ${x0 + 24} -4V0Z`, c, `stroke="${shade(c, -0.2)}" stroke-width="1"`) +
        R(x0, -2, 24, 2, "#cbd5e0", 1) + S(`M${x0 + 10} -7.6q5 -2 10 -0.6`, shade(c, -0.12), 1) + C(x0 + 17, -6.4, 1.3, GOLD)).join("") },

    // --- Familienzimmer -----------------------------------------------------------
    o_etagenbett: { name: "Etagenbett", der: "das Etagenbett", kat: "sitzen", w: 116, h: 152, farbe: "#3a86ff", tags: ["bett", "etagenbett"], d: (c) =>
      R(-56, -150, 8, 150, WEISS, 3, `stroke="${RAND}" stroke-width="1.5"`) + R(48, -150, 8, 150, WEISS, 3, `stroke="${RAND}" stroke-width="1.5"`) +
      C(-52, -150, 4.5, c) + C(52, -150, 4.5, c) + R(-50, -142, 100, 5, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) +
      S("M-48 -136Q0 -126 48 -136", "#9aa5b1", 1) + [-36, -22, -8, 6, 20, 34].map((x, i) => {
        const y = n(-136 + 10 * (1 - (x / 48) ** 2) * 0.8);
        return P(`M${x - 4} ${y}h8l-4 7z`, BUNT[i % BUNT.length]);
      }).join("") +
      // oben
      R(-52, -96, 104, 10, "#e9e2d6", 3) + R(-50, -106, 100, 11, "#fbf8f2", 5) + R(-48, -116, 22, 11, WEISS, 5, `stroke="${RAND}" stroke-width="1"`) +
      P("M-22 -108h66a6 6 0 0 1 6 6v6h-72z", c) + stern(-4, -102, 3, WEISS) + stern(14, -102, 3, WEISS) + stern(32, -102, 3, WEISS) +
      R(-48, -120, 62, 4, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + [-30, -10, 8].map((x) => R(x, -117, 3, 12, WEISS, 1, `stroke="${RAND}" stroke-width="0.8"`)).join("") +
      // unten
      R(-52, -26, 104, 10, "#e9e2d6", 3) + R(-50, -36, 100, 11, "#fbf8f2", 5) + R(-48, -46, 22, 11, WEISS, 5, `stroke="${RAND}" stroke-width="1"`) +
      P("M-22 -38h66a6 6 0 0 1 6 6v6h-72z", "#ffd166") + [-10, 4, 18, 32].map((x, i) => C(x, i % 2 ? -30 : -33, 1.8, "#ff9f43")).join("") +
      // Leiter
      R(26, -106, 4, 106, shade(c, -0.1), 2) + R(42, -106, 4, 106, shade(c, -0.1), 2) + [-88, -70, -52, -34, -16].map((y) => R(26, y, 20, 4, c, 2)).join("") },
    o_reisebett: { name: "Reisebett", der: "das Reisebett", kat: "sitzen", w: 78, h: 64, farbe: "#7c8db5", tags: ["babybett", "bett"], d: (c) =>
      R(-28, -30, 56, 18, "#ffb3c7", 4) + C(12, -60, 2.6, "#d9a066") + C(22, -60, 2.6, "#d9a066") + C(17, -55, 6, "#d9a066") + E(17, -52.6, 2.6, 1.8, "#f0cfa0") +
      C(15, -56, 0.8, TINTE) + C(19, -56, 0.8, TINTE) +
      R(-32, -48, 64, 38, "#eef2f7", 2, `opacity="0.85"`) +
      S([-26, -19.5, -13, -6.5, 0, 6.5, 13, 19.5, 26].map((x) => `M${x} -48V-10`).join("") + [-42, -35.5, -29, -22.5, -16].map((y) => `M-32 ${y}H32`).join(""), "#c3ccd8", 0.7) +
      R(-36, -54, 72, 6, c, 3) + R(-36, -12, 72, 6, c, 3) + R(-38, -54, 6, 50, shade(c, -0.15), 2) + R(32, -54, 6, 50, shade(c, -0.15), 2) +
      R(-39, -4, 8, 4, DUNKEL, 2) + R(31, -4, 8, 4, DUNKEL, 2) },
    o_familienbett: { name: "Familienbett", der: "das Familienbett", kat: "sitzen", w: 180, h: 80, farbe: "#7cc05e", tags: ["bett"], d: (c) =>
      R(-88, -80, 176, 40, HOLZ_D, 10) + R(-82, -74, 164, 28, HOLZ, 7) + herz(0, -64, 6, HOLZ_D) +
      R(-80, -57, 36, 16, WEISS, 8, `stroke="${RAND}" stroke-width="1.2"`) + R(44, -57, 36, 16, WEISS, 8, `stroke="${RAND}" stroke-width="1.2"`) +
      R(-38, -53, 30, 13, "#ffd166", 6) + R(8, -53, 30, 13, "#ff9fb5", 6) + stern(-23, -46.5, 3, WEISS) + herz(23, -46.5, 3, WEISS) +
      R(-86, -44, 172, 30, c, 8) + R(-86, -44, 172, 7, shade(c, 0.25), 4) + [-60, -30, 0, 30, 60].map((x) => stern(x, -25, 4, shade(c, 0.45))).join("") +
      R(-86, -18, 172, 7, "#fbf8f2", 3) + R(-88, -13, 176, 7, HOLZ, 3) + leg(-84, 6, HOLZ_DD, 7) + leg(77, 6, HOLZ_DD, 7) },
    o_sofabett: { name: "Sofabett", der: "das Sofabett", kat: "sitzen", w: 128, h: 56, farbe: "#a78bfa", tags: ["sofa", "bett", "sitz"], d: (c) =>
      R(-56, -56, 112, 26, shade(c, -0.14), 11) + R(-56, -32, 112, 18, c, 6) + R(-50, -44, 26, 13, WEISS, 6, `stroke="${RAND}" stroke-width="1"`) +
      P("M-22 -38H44A8 8 0 0 1 52 -30V-18H-22Z", "#ffd166") + stern(0, -29, 3, WEISS) + stern(16, -27, 3, WEISS) + stern(32, -30, 3, WEISS) +
      R(-64, -42, 14, 30, shade(c, -0.05), 7) + R(50, -42, 14, 30, shade(c, -0.05), 7) +
      R(-52, -14, 104, 6, HOLZ_D, 2) + C(-44, -4, 4, DUNKEL) + C(0, -4, 4, DUNKEL) + C(44, -4, 4, DUNKEL) },
    o_kinderbadewanne: { name: "Kinderbadewanne", der: "die Kinderbadewanne", kat: "bad", w: 64, h: 44, farbe: "#6cc3d5", tags: ["wanne"], d: (c) =>
      S("M-20 0L-14 -16M20 0L14 -16", "#cbd5e0", 3) + S("M-22 0h6M16 0h6", "#9aa5b1", 2.4) +
      C(-16, -34, 5, WEISS) + C(-8, -36, 6, WEISS) + C(1, -34, 4.5, WEISS) +
      C(14, -37, 4, "#ffd166") + C(17, -41, 2.6, "#ffd166") + P("M19 -41.6l3 0.8-3 1.2z", "#ff9f43") + C(17.6, -42, 0.7, TINTE) +
      P("M-30 -30H30Q28 -14 18 -14H-18Q-28 -14 -30 -30Z", c) + R(-32, -32, 64, 5, shade(c, 0.2), 2.5) +
      S("M-22 -22q4 -3 8 0t8 0t8 0t8 0", WEISS, 1.4, `opacity="0.8"`) },
    o_hochstuhl: { name: "Hochstuhl", der: "der Hochstuhl", kat: "sitzen", w: 44, h: 84, farbe: "#ef5350", tags: ["stuhl", "sitz"], d: (c) =>
      S("M-17 0L-9 -46M17 0L7 -46", HOLZ_D, 3.4) + R(-13, -20, 26, 3, HOLZ_D, 1.5) + R(-14, -48, 26, 5, HOLZ, 2.5) +
      R(-15, -82, 7, 38, HOLZ, 3) + R(-13, -78, 6, 30, c, 2.5) + R(-12, -51, 22, 4, c, 2) +
      R(12, -60, 3, 12, HOLZ_D, 1.5) + R(-4, -62, 24, 4, c, 2) + C(6, -65, 3, "#ffd166") + stern(6, -65, 1.8, "#ff9f43") },
    o_babyphone: { name: "Babyphone", der: "das Babyphone", kat: "deko", klein: true, w: 18, h: 28, licht: true, d: () =>
      R(3, -28, 2, 8, "#cbd5e0", 1) + R(-7, -22, 14, 22, WEISS, 5, `stroke="${RAND}" stroke-width="1.2"`) +
      [-3, 0, 3].map((x) => C(x, -16.5, 0.9, "#9aa5b1") + C(x, -13.5, 0.9, "#9aa5b1")).join("") + C(0, -6.5, 1.8, LEUCHTGRUEN) },
    o_leiterlispiel: { name: "Leiterlispiel", der: "das Leiterlispiel", kat: "spielen", klein: true, w: 40, h: 30, tags: ["spielzeug"], d: () =>
      R(-19, -30, 28, 28, "#fff6c2", 2, `stroke="${HOLZ_D}" stroke-width="1.4"`) +
      [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((k) => (r + k) % 2 ? R(-17 + k * 6.25, -28 + r * 6.25, 5.8, 5.8, BUNT[(r * 4 + k) % BUNT.length], 0.8) : "").join("")).join("") +
      S("M-14 -6L-4 -24M-10 -4L0 -22", HOLZ_D, 1.4) + S("M-11.5 -10.5l4 2M-9 -15l4 2M-6.5 -19.5l4 2", HOLZ_D, 1.2) +
      S("M2 -6q4 -4 2 -8t2 -8", "#5cb85c", 2) + C(4, -22, 1.6, "#5cb85c") +
      R(11, -9, 8, 8, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + C(13, -7, 0.9, TINTE) + C(15, -5, 0.9, TINTE) + C(17, -3, 0.9, TINTE) +
      [[-8, "#ef5350"], [2, "#3a86ff"]].map(([x, f]) => P(`M${x - 2.4} 0l1.2 -5h2.4l1.2 5z`, f) + C(x, -6, 1.8, f)).join("") },
    o_sternenlampe: { name: "Sternenlampe", der: "die Sternenlampe", kat: "deko", klein: true, w: 26, h: 28, licht: true, tags: ["lampe"], d: () =>
      stern(-9, -20, 2, "#ffd166") + stern(9, -23, 2.4, "#ffd166") + stern(0, -25, 1.6, "#ffd166") + stern(-12, -12, 1.4, "#ffd166") + stern(12, -14, 1.6, "#ffd166") +
      R(-10, -6, 20, 6, "#a78bfa", 3) + P("M-10 -6a10 10 0 0 1 20 0z", "#3b4a8a") + stern(-4, -10, 2, "#ffe7a3") + stern(3, -12, 1.6, "#ffe7a3") + C(5, -8, 1, "#ffe7a3") },
    o_kindertritt: { name: "Kindertritt", der: "der Kindertritt", kat: "tische", w: 36, h: 22, farbe: "#7cc05e", flaeche: -22, d: (c) =>
      R(-16, -16, 6, 16, shade(c, -0.15), 2) + R(10, -16, 6, 16, shade(c, -0.15), 2) + R(-12, -10, 24, 3, shade(c, -0.25), 1.5) +
      R(-18, -22, 36, 6, c, 3) + stern(-6, -19, 2, WEISS) + stern(6, -19, 2, WEISS) },
    o_kinderbademantel: { name: "Kinderbademantel", der: "der Kinderbademantel", kat: "bad", art: "wand", w: 40, h: 58, farbe: "#ff9fb5", tags: ["bademantel"], d: (c) =>
      E(-6, -23, 2.6, 5, c) + E(6, -23, 2.6, 5, c) + E(-6, -23, 1.2, 3, shade(c, 0.45)) + E(6, -23, 1.2, 3, shade(c, 0.45)) +
      P("M-8 -10L-16 -6L-19 14L-14 15L-12 4V28H12V4L14 15L19 14L16 -6L8 -10Q0 -6 -8 -10Z", c) + S("M0 -6V28", shade(c, -0.2), 1) +
      P("M-9 -10Q-10 -22 0 -23Q10 -22 9 -10Z", c) + C(0, -26, 2, METALL_D) +
      C(-3.2, -16, 1, TINTE) + C(3.2, -16, 1, TINTE) + E(0, -13.6, 1.4, 1, "#c2185b") + C(-5.5, -13, 1.4, shade(c, 0.35)) + C(5.5, -13, 1.4, shade(c, 0.35)) +
      R(-12, 6, 24, 3, shade(c, -0.15), 1.5) + herz(6, 18, 3, shade(c, 0.4)) },
    o_malbuch: { name: "Malbuch", der: "das Malbuch", kat: "buero", klein: true, w: 36, h: 26, tags: ["malen"], d: () =>
      P("M-17 0V-3Q-11 -6 -5 -3Q1 -6 7 -3V0Z", "#3a86ff") +
      P("M-5 -4Q-11 -9 -16 -7V-2Q-11 -5 -5 -1Z", WEISS, `stroke="${RAND}" stroke-width="0.8"`) + P("M-5 -4Q1 -9 6 -7V-2Q1 -5 -5 -1Z", WEISS, `stroke="${RAND}" stroke-width="0.8"`) +
      C(-11, -5, 1.8, "none", `stroke="#9aa5b1" stroke-width="0.6"`) + C(1, -5.4, 1.8, "#ffd166") +
      [[11, -21, "#3a86ff"], [13.6, -22, "#7cc05e"], [16.2, -20, "#ef5350"]].map(([x, y, f]) => R(x, y, 2, 10, f, 0.6) + P(`M${x} ${y}l1 -2.4l1 2.4z`, "#f2d3a2")).join("") +
      R(10, -12, 9, 12, "#ff9f43", 2) },
    o_spielkorb: { name: "Spielkorb", der: "der Spielkorb", kat: "spielen", w: 56, h: 46, tags: ["spielzeug"], d: () =>
      C(-10, -30, 9, "#ef5350") + P("M-19 -30a9 9 0 0 0 18 0z", "#ffd166") + C(-13, -34, 2, WEISS, `opacity="0.7"`) +
      S("M10 -26V-44", HOLZ_D, 1.4) + P("M11 -43V-28H21Z", WEISS, `stroke="${RAND}" stroke-width="0.8"`) + P("M10 -44l4 1.4-4 1.4z", "#ef5350") + P("M2 -28h17l-3 4h-11z", "#3a86ff") +
      P("M-25 -24H25L21 0H-21Z", "#d9b06a") + S("M-24 -18h48M-23 -12h46M-22 -6h44", "#b9894a", 1.4) +
      S("M-15 -24l-1.5 24M-5 -24l-0.5 24M5 -24l0.5 24M15 -24l1.5 24", "#c99a52", 1.2) + R(-27, -28, 54, 5, "#c99a52", 2.5) },

    // --- Suite -------------------------------------------------------------------
    o_himmelbett: { name: "Königs-Himmelbett", der: "das Königs-Himmelbett", kat: "sitzen", w: 180, h: 170, farbe: BORDEAUX, tags: ["bett", "vorhang"], d: (c) =>
      R(-81, -148, 162, 100, shade(c, 0.62), 0, `opacity="0.7"`) + S("M-50 -142V-50M-20 -142V-50M10 -142V-50M40 -142V-50", shade(c, 0.4), 1.4, `opacity="0.6"`) +
      R(-88, -156, 7, 156, GOLD_D, 3) + R(81, -156, 7, 156, GOLD_D, 3) + C(-84.5, -157, 4, GOLD) + C(84.5, -157, 4, GOLD) +
      P("M-81 -140H-62Q-70 -114 -73 -92Q-68 -72 -70 -50H-81Z", shade(c, -0.1)) + R(-82, -94, 12, 4, GOLD, 2) +
      P("M81 -140H62Q70 -114 73 -92Q68 -72 70 -50H81Z", shade(c, -0.1)) + R(70, -94, 12, 4, GOLD, 2) +
      R(-90, -156, 180, 8, GOLD, 3) + P(volant(-86, 86, -148, -142, 4, 8), c) +
      P("M-12 -156L-15 -167L-6 -161L0 -170L6 -161L15 -167L12 -156Z", GOLD) + C(-6, -159, 1.4, "#ef5350") + C(0, -160, 1.6, "#3a86ff") + C(6, -159, 1.4, "#7cc05e") +
      R(-66, -32, 140, 18, "#f3e6d2", 4) + R(-66, -32, 140, 3, GOLD, 1.5) + leg(-62, 14, GOLD_D, 6) + leg(66, 14, GOLD_D, 6) +
      R(-66, -48, 140, 17, "#fbf8f2", 8) +
      R(-64, -63, 32, 16, WEISS, 8, `stroke="${RAND}" stroke-width="1.2"`) + R(-50, -60, 30, 14, "#f6ead2", 7, `stroke="#e8d9b8" stroke-width="1"`) + R(-38, -56, 16, 12, c, 5) +
      P("M-26 -52H62A10 10 0 0 1 72 -42V-30H-26Z", "#f6e7c8") + S("M-25 -46H70", "#ead6ad", 1.4) +
      R(44, -53, 18, 23, c, 2) + R(44, -53, 18, 3, shade(c, 0.25), 1.5) + R(44, -42, 18, 1.6, GOLD) +
      R(-80, -104, 16, 104, GOLD_D, 7) + R(-78, -100, 12, 94, c, 5) + [-88, -76, -64].map((y) => C(-72, y, 1.3, shade(c, -0.35))).join("") + C(-72, -105, 4, GOLD) },
    o_whirlpoolwanne: { name: "Whirlpool-Wanne", der: "die Whirlpool-Wanne", kat: "bad", w: 136, h: 68, tags: ["wanne", "whirlpool"], d: () =>
      R(-68, -14, 136, 14, MARMOR, 3, `stroke="${MARMOR_D}" stroke-width="1.2"`) + S("M-56 -8q10 -4 18 2M20 -10q8 4 20 0", MARMOR_D, 1) +
      P("M-60 -48H60Q58 -14 40 -14H-40Q-58 -14 -60 -48Z", WEISS, `stroke="${RAND}" stroke-width="2"`) + C(-40, -30, 2, "#cbd5e0") + C(40, -30, 2, "#cbd5e0") +
      [-48, -36, -22, -8, 6, 20, 34, 48].map((x, i) => C(x, -53 - (i % 3) * 2, 6 + (i % 2) * 1.5, WEISS, `stroke="#e2e8f0" stroke-width="1"`)).join("") +
      R(-62, -50, 124, 5, GOLD, 2.5) + C(-14, -64, 2, "none", `stroke="${GLAS_R}" stroke-width="1"`) + C(12, -66, 1.6, "none", `stroke="${GLAS_R}" stroke-width="1"`) + C(26, -63, 1.2, "none", `stroke="${GLAS_R}" stroke-width="1"`) +
      E(-26, -58, 2.6, 1.6, "#ef5350", `transform="rotate(-20 -26 -58)"`) + E(14, -59, 2.6, 1.6, "#ef5350", `transform="rotate(25 14 -59)"`) + E(38, -57, 2.4, 1.5, "#ef5350") +
      S("M56 -50V-62H46", GOLD, 4) + R(43, -63, 5, 6, GOLD_D, 1.5) +
      C(-40, -60, 4, GOLD) + C(-37, -64, 2.6, GOLD) + P("M-34.6 -64.5l3 0.8-3 1.2z", "#ff9f43") + C(-36.6, -64.8, 0.7, TINTE) },
    o_sirupkuehler: { name: "Sirup im Kühler", der: "der Sirup im Kühler", kat: "kueche", klein: true, w: 38, h: 40, tags: ["trinken"], d: () =>
      R(-1, -40, 6, 9, GLAS, 1.5, `stroke="${GLAS_R}" stroke-width="1"`) + E(2, -25, 8, 8, GLAS, `stroke="${GLAS_R}" stroke-width="1.2"`) + E(2, -23, 6.5, 5.5, "#e8506a") +
      S("M-2 -29q1 -2 3 -2", WEISS, 1.2) +
      R(-11, -28, 6, 6, "#f4fbff", 1.2, `stroke="${GLAS_R}" stroke-width="0.8" transform="rotate(-12 -8 -25)"`) + R(9, -29, 5, 5, "#f4fbff", 1.2, `stroke="${GLAS_R}" stroke-width="0.8" transform="rotate(15 11.5 -26.5)"`) +
      P("M-14 -22H14L11 0H-11Z", "#dfe6ee") + R(-15, -24, 30, 4, METALL, 2) + S("M-9 -18l-1 14", WEISS, 1.6, `opacity="0.8"`) +
      C(-15.5, -15, 2.6, "none", `stroke="${METALL_D}" stroke-width="1.2"`) + C(15.5, -15, 2.6, "none", `stroke="${METALL_D}" stroke-width="1.2"`) },
    o_fluegel: { name: "Flügel", der: "der Flügel", kat: "spielen", w: 150, h: 100, farbe: "#2d3748", tags: ["klavier", "musik"], d: (c) =>
      P("M-40 -52L58 -98L68 -52Z", shade(c, 0.12)) + P("M-30 -52L54 -82L61 -52Z", GOLD_D) + S("M-18 -52L52 -76M-4 -52L54 -70M10 -52L56 -64", GOLD_H, 0.8) +
      S("M44 -52L46 -88", "#8a5734", 2) +
      P("M-60 -52H46Q72 -52 72 -42V-36H-60Z", c) + S("M-58 -50H46Q70 -50 70 -42", shade(c, 0.3), 1.4) +
      R(-74, -48, 16, 6, c, 2) + R(-74, -48, 16, 2.6, WEISS) + P("M-58 -52L-54 -68L-44 -66L-48 -52Z", c) + P("M-56 -54L-52.5 -66.4L-45.5 -65L-49 -53Z", WEISS) +
      C(-51.5, -61, 1, TINTE) + C(-49.5, -57, 1, TINTE) +
      R(-56, -36, 8, 30, c, 3) + R(60, -36, 8, 30, c, 3) + R(14, -36, 7, 28, shade(c, 0.18), 3) + C(-52, -3, 3, GOLD) + C(64, -3, 3, GOLD) + C(17.5, -5, 2.6, GOLD) +
      R(-24, -36, 3, 22, GOLD_D, 1) + R(-17, -36, 3, 22, GOLD_D, 1) + R(-26, -14, 14, 4, c, 2) + [-25, -20.7, -16.4].map((x) => R(x, -11, 3.4, 3, GOLD, 1)).join("") },
    o_marmorsaeule: { name: "Marmorsäule", der: "die Marmorsäule", kat: "deko", w: 46, h: 160, flaeche: -160, fx: [-18, 18], d: () =>
      R(-23, -14, 46, 14, MARMOR_D, 3) + R(-20, -21, 40, 8, MARMOR, 3) + R(-15, -24, 30, 3, GOLD, 1.5) +
      R(-14, -140, 28, 116, MARMOR, 2) + S("M-8 -138V-26M-2.7 -138V-26M2.7 -138V-26M8 -138V-26", MARMOR_D, 1.4) +
      S("M-10 -112q6 10 2 22M5 -72q-4 12 2 20", "#cfc4b4", 0.9) +
      R(-20, -149, 40, 10, MARMOR, 3) + C(-18, -144, 4.5, MARMOR, `stroke="${MARMOR_D}" stroke-width="1.4"`) + C(18, -144, 4.5, MARMOR, `stroke="${MARMOR_D}" stroke-width="1.4"`) +
      C(-18, -144, 1.4, MARMOR_D) + C(18, -144, 1.4, MARMOR_D) + R(-23, -160, 46, 11, MARMOR, 3, `stroke="${MARMOR_D}" stroke-width="1.2"`) + R(-23, -152, 46, 2, GOLD) },
    o_fruechtekorb: { name: "Früchtekorb", der: "der Früchtekorb", kat: "essen", klein: true, w: 40, h: 38, tags: ["fruechte", "essen"], d: () =>
      S("M-15 -15Q-15 -37 0 -37Q15 -37 15 -15", "#c99a52", 2.4) +
      P("M-7 -27l-4 -7l3 2l1 -5l1.5 4.5l2.5 -3.5l-1 6z", "#5cb85c") + E(-6, -21, 5, 7, "#e8b94f") + S("M-10 -24l7 6M-10 -18l7 -6M-9.5 -21l5 -5", "#c99a2e", 0.8) +
      [[5, -22], [8, -22], [6.5, -19.5], [3.5, -19.5], [9.5, -19.5], [5, -17], [8, -17]].map(([x, y]) => C(x, y, 1.9, "#7c5ce6")).join("") + S("M6.5 -24v-3", "#5cb85c", 1) +
      C(-13, -16, 4, "#ff9f43") + C(12, -16, 4, "#ef5350") + P("M12 -20q2 -3 4 -2q-1 2 -4 2z", "#5cb85c") + P("M-14 -15q8 6 20 1q-11 0 -20 -5z", "#ffd166") +
      P("M-18 -14H18L14 0H-14Z", "#d9b06a") + S("M-17 -9h34M-16 -4h32", "#b9894a", 1.2) + R(-19, -16, 38, 4, "#c99a52", 2) },
    o_balkontuer: { name: "Balkontür", der: "die Balkontür", kat: "deko", w: 96, h: 150, fenster: true, tags: ["fenster", "tuer"], d: () =>
      R(-48, -150, 96, 150, WEISS, 4, `stroke="${RAND}" stroke-width="1.5"`) + R(-44, -146, 42, 140, WEISS, 2) + R(2, -146, 42, 140, WEISS, 2) +
      R(-40, -142, 34, 132, "#a8ddf0", 2, `class="bau-fensterglas"`) + R(6, -142, 34, 132, "#a8ddf0", 2, `class="bau-fensterglas"`) +
      S("M-40 -44H40M-34 -44V-12M-26 -44V-12M-18 -44V-12M-10 -44V-12M10 -44V-12M18 -44V-12M26 -44V-12M34 -44V-12", "#6b7280", 1.6) +
      [-110, -76].map((y) => R(-40, y, 34, 3, WEISS) + R(6, y, 34, 3, WEISS)).join("") +
      S("M-34 -130l10 -10M12 -130l8 -8", WEISS, 2.4, `opacity="0.7"`) + R(-8, -82, 3, 12, GOLD, 1.5) + R(5, -82, 3, 12, GOLD, 1.5) + R(-48, -6, 96, 6, MARMOR_D, 2) },
    o_goldspiegel: { name: "Goldspiegel", der: "der Goldspiegel", kat: "deko", art: "wand", w: 56, h: 76, tags: ["spiegel"], d: () =>
      P("M-12 -28Q-6 -38 0 -36Q6 -38 12 -28Z", GOLD) + C(0, -33, 2.6, GOLD_D) + C(-25, -2, 3.4, GOLD) + C(25, -2, 3.4, GOLD) +
      E(0, 2, 25, 33, GOLD) + E(0, 2, 21.5, 29.5, GOLD_D) + E(0, 2, 20, 28, "#e6f6fc") + S("M-10 -12l10 -10M-6 0l8 -8", WEISS, 2.6) +
      P("M-9 33Q0 40 9 33Z", GOLD) + C(0, 36, 2, GOLD_D) },
    o_thronsessel: { name: "Thronsessel", der: "der Thronsessel", kat: "sitzen", w: 72, h: 96, farbe: BORDEAUX, tags: ["sitz", "sofa"], d: (c) =>
      P("M-8 -86L-10 -94L-4 -90L0 -95L4 -90L10 -94L8 -86Z", GOLD) +
      R(-25, -88, 50, 56, GOLD_D, 14) + R(-21, -84, 42, 50, c, 11) + [[-10, -72], [0, -66], [10, -72], [-10, -56], [0, -50], [10, -56]].map(([x, y]) => C(x, y, 1.3, shade(c, -0.35))).join("") +
      S("M-24 -18q-6 9 -2 18", GOLD_D, 4) + S("M24 -18q6 9 2 18", GOLD_D, 4) +
      R(-27, -38, 54, 14, c, 6) + R(-23, -41, 46, 6, shade(c, 0.15), 3) + R(-29, -26, 58, 8, GOLD, 3) + C(0, -22, 2.4, "#ef5350") +
      R(-36, -52, 10, 30, GOLD, 4) + R(-36, -54, 10, 6, shade(c, 0.15), 3) + R(26, -52, 10, 30, GOLD, 4) + R(26, -54, 10, 6, shade(c, 0.15), 3) },
    o_pralinen: { name: "Pralinen", der: "die Pralinen", kat: "essen", klein: true, w: 34, h: 18, tags: ["essen"], d: () =>
      P("M-15 -8L-13 -18H13L15 -8Z", "#c94a68") + herz(0, -13, 3, GOLD) +
      C(-10.5, -8.5, 3.2, "#5b3a29") + C(-3.5, -8.5, 3.2, "#8a5734") + C(3.5, -8.5, 3.2, "#f3e6d2") + C(10.5, -8.5, 3.2, "#5b3a29") +
      C(-10.5, -10, 0.9, GOLD) + S("M-5.5 -9.5h4", "#f3e6d2", 0.7) + C(3.5, -10, 0.9, "#ff9fb5") + S("M8.5 -10q2 -1.4 4 0", "#c98a45", 0.8) +
      R(-16, -8, 32, 8, BORDEAUX, 2) + R(-16, -8, 32, 2, GOLD, 1) },
    o_blumenarrangement: { name: "Blumenarrangement", der: "das Blumenarrangement", kat: "deko", w: 56, h: 94, tags: ["blumen", "pflanze"], d: () =>
      S("M0 -40L-16 -62M0 -40L0 -72M0 -40L15 -64M0 -40L-8 -82M0 -40L9 -84M0 -40L-21 -76M0 -40L21 -78", "#4aa34a", 2) +
      P("M-6 -50q-10 -4 -14 2q8 4 14 -2z", "#5cb85c") + P("M6 -52q10 -6 14 0q-8 5 -14 0z", "#4aa34a") +
      [[-16, -62, 7, "#ef5350"], [0, -73, 8, "#ff9fb5"], [15, -64, 7, "#ffd166"], [-8, -83, 6, "#fff1f5"], [9, -85, 6, "#ef5350"], [-21, -77, 5, "#a78bfa"], [21, -79, 5, "#ff9fb5"]]
        .map(([x, y, r, f]) => C(x, y, r, f, f === "#fff1f5" ? `stroke="#f2c6d2" stroke-width="1"` : "") + C(x, y, n(r * 0.45), shade(f, -0.18))).join("") +
      P("M-11 0L-13 -5Q-19 -20 -9 -34H9Q19 -20 13 -5L11 0Z", "#f6f1e8", `stroke="#e2d8ca" stroke-width="1"`) + R(-15, -22, 30, 3, GOLD) +
      R(-8, -40, 16, 7, "#efe6dc", 2.5) + R(-9, -41, 18, 3, GOLD, 1.5) },
    o_suiteschild: { name: "Suite-Schild", der: "das Suite-Schild", kat: "deko", art: "wand", w: 72, h: 42, d: () =>
      R(-35, -20, 70, 40, GOLD, 6) + R(-31, -16, 62, 32, "#5b2333", 4) + P("M-8 -2L-10 -12L-4 -8L0 -13L4 -8L10 -12L8 -2Z", GOLD) +
      T(0, 12, "SUITE", 11, GOLD_H) },
    o_perserteppich: { name: "Perserteppich", der: "der Perserteppich", kat: "deko", art: "flach", w: 156, h: 14, farbe: BORDEAUX, tags: ["teppich"], d: (c) =>
      R(-75, -12, 150, 12, c, 2) + R(-71, -10, 142, 8, shade(c, -0.22), 1.5) +
      [-56, -40, -24, -8, 8, 24, 40, 56].map((x, i) => P(`M${x} -10l4 4l-4 4l-4 -4z`, i % 2 ? GOLD : "#f3e6d2")).join("") +
      R(-75, -12, 150, 1.6, GOLD) + S("M-76.5 -11v10M76.5 -11v10", "#f3e6d2", 1.4, `stroke-dasharray="1.4 1.4"`) },

    // --- Frühstückssaal ------------------------------------------------------------
    o_buffet: { name: "Frühstücksbuffet", der: "das Frühstücksbuffet", kat: "laden", w: 170, h: 74, flaeche: -50, fx: [-54, 54], tags: ["buffet", "theke", "essen"], d: () =>
      R(-85, -4, 170, 4, "#e2e8f0", 2) + R(-84, -46, 168, 42, WEISS, 2, `stroke="${RAND}" stroke-width="1.2"`) +
      S([-60, -30, 0, 30, 60].map((x) => `M${x} -36V-8`).join(""), "#edf2f6", 1.2) + P(volant(-84, 84, -10, -6, 1.5, 14), "#f4f8fb") +
      R(-84, -45, 168, 6, BORDEAUX, 1) + R(-84, -39, 168, 1.5, GOLD) + R(-85, -50, 170, 6, WEISS, 3, `stroke="${RAND}" stroke-width="1.2"`) +
      [-70, 70].map((x) => R(x - 10, -56, 20, 6, METALL_D, 2) + R(x - 12, -62, 24, 7, "#cfd8e3", 3) + P(`M${x - 11} -62a11 8 0 0 1 22 0z`, "#dfe6ee") +
        C(x, -71, 2, METALL_D) + S(`M${x - 6} -65a6 4 0 0 1 4 -3`, WEISS, 1.4)).join("") },
    o_mueeslispender: { name: "Müesli-Spender", der: "der Müesli-Spender", kat: "kueche", klein: true, w: 42, h: 56, tags: ["essen"], d: () =>
      R(-20, -54, 3, 48, METALL, 1.5) + R(17, -54, 3, 48, METALL, 1.5) + R(-20, -56, 40, 3, METALL_D, 1.5) + R(-20, -6, 40, 6, METALL_D, 2) +
      R(-15, -51, 13, 28, GLAS, 4, `stroke="${GLAS_R}" stroke-width="1"`) + R(2, -51, 13, 28, GLAS, 4, `stroke="${GLAS_R}" stroke-width="1"`) +
      R(-14, -42, 11, 18, "#e8c27a", 3) + [[-11, -36], [-7, -32], [-12, -28], [-6, -39], [-9, -30]].map(([x, y]) => C(x, y, 1, "#8a5734")).join("") +
      R(3, -44, 11, 20, "#f2b44f", 3) + S("M5 -40l3 1M9 -36l3 -1M5 -32l3 1M8 -28l3 -1", "#d9973a", 1) +
      R(-11.5, -22, 6, 5, "#ef5350", 1.5) + R(5.5, -22, 6, 5, "#3a86ff", 1.5) + R(-10, -17, 3, 5, "#cbd5e0", 1) + R(7, -17, 3, 5, "#cbd5e0", 1) +
      P("M-15 -11h13q-1 5 -6.5 5t-6.5 -5z", WEISS, `stroke="${RAND}" stroke-width="0.8"`) + P("M2 -11h13q-1 5 -6.5 5t-6.5 -5z", WEISS, `stroke="${RAND}" stroke-width="0.8"`) },
    o_saftspender: { name: "Saftspender", der: "der Saftspender", kat: "kueche", klein: true, w: 40, h: 44, tags: ["saft", "trinken"], d: () =>
      R(-17, -8, 3, 8, METALL_D, 1) + R(14, -8, 3, 8, METALL_D, 1) + R(-19, -12, 38, 4, METALL_D, 2) +
      R(-18, -40, 16, 28, GLAS, 5, `stroke="${GLAS_R}" stroke-width="1"`) + R(-17, -34, 14, 21, "#ff9f43", 4) + C(-10, -25, 3.4, "#ffd166") + S("M-10 -28.4v6.8M-13.4 -25h6.8", "#ff9f43", 0.8) +
      R(2, -40, 16, 28, GLAS, 5, `stroke="${GLAS_R}" stroke-width="1"`) + R(3, -34, 14, 21, "#ef5350", 4) + P("M10 -28q-4 0 -3 4q1 3 3 4q2 -1 3 -4q1 -4 -3 -4z", "#c93b3b") + S("M9 -28.6l1 -1.6l1 1.6", "#5cb85c", 1) +
      R(-19, -43, 18, 4, "#cbd5e0", 2) + R(1, -43, 18, 4, "#cbd5e0", 2) + R(-12, -15, 4, 3, DUNKEL, 1) + R(8, -15, 4, 3, DUNKEL, 1) },
    o_gipfelikorb: { name: "Gipfelikorb", der: "der Gipfelikorb", kat: "essen", klein: true, w: 38, h: 22, tags: ["brot", "essen"], d: () =>
      P("M-17 -10L-12 -18L-4 -10Z", "#fbf8f2", `stroke="${RAND}" stroke-width="0.8"`) + P("M17 -10L12 -18L4 -10Z", "#fbf8f2", `stroke="${RAND}" stroke-width="0.8"`) +
      weggli(9, -9.5) + gipfeli(-6, -10) + gipfeli(1, -13, "#d9973f") +
      P("M-18 -10H18L14 0H-14Z", "#c88c5c") + S("M-16 -5h32", HOLZ_D, 1.2) + R(-19, -11, 38, 3, HOLZ_D, 1.5) },
    o_grosskaffeemaschine: { name: "Grosse Kaffeemaschine", der: "die grosse Kaffeemaschine", kat: "kueche", klein: true, w: 52, h: 48, farbe: "#ef5350", tags: ["kaffee"], d: (c) =>
      R(-26, -4, 52, 4, DUNKEL, 2) + R(-24, -36, 48, 32, INOX, 4) + R(-24, -36, 9, 32, c, 3) + R(15, -36, 9, 32, c, 3) + R(-23, -40, 46, 4, METALL, 2) +
      [-15, -5, 5].map((x) => R(x, -46, 8, 6, WEISS, 2, `stroke="${RAND}" stroke-width="0.8"`)).join("") +
      C(0, -31, 3.4, WEISS, `stroke="${METALL_D}" stroke-width="1"`) + S("M0 -31l2 -2", "#ef5350", 0.8) +
      R(-12, -25, 9, 5, METALL_D, 1.5) + R(3, -25, 9, 5, METALL_D, 1.5) + R(-10, -20, 5, 2, DUNKEL, 1) + R(5, -20, 5, 2, DUNKEL, 1) +
      R(-11, -15, 7, 6, WEISS, 1.5, `stroke="${RAND}" stroke-width="0.8"`) + R(4, -15, 7, 6, WEISS, 1.5, `stroke="${RAND}" stroke-width="0.8"`) +
      E(-7.5, -15, 2.8, 0.8, "#8a5734") + E(7.5, -15, 2.8, 0.8, "#8a5734") + R(-18, -9, 36, 4, "#4a5568", 1.5) + S("M19.5 -28v12", METALL_D, 1.6) },
    o_eierkocher: { name: "Eierkocher", der: "der Eierkocher", kat: "kueche", klein: true, w: 30, h: 26, tags: ["essen"], d: () =>
      E(-5, -12, 3.6, 4.6, "#fbf3e4") + E(5, -12, 3.6, 4.6, "#f3e3c8") + E(0, -17, 3.6, 4.6, "#fbf3e4") +
      P("M-12 -8a12 12 0 0 1 24 0z", GLAS, `opacity="0.6" stroke="${GLAS_R}" stroke-width="1.2"`) + R(-2, -23, 4, 3, DUNKEL, 1.5) +
      R(-14, -8, 28, 8, "#ffd166", 4) + C(8, -4, 1.6, "#ef5350") },
    o_fruehstueckstisch: { name: "Frühstückstisch", der: "der Frühstückstisch", kat: "tische", w: 84, h: 50, farbe: "#ff9f43", flaeche: -50, tags: ["tisch"], d: (c) =>
      R(-3, -34, 6, 30, HOLZ_D, 2) + E(0, -3, 16, 3.5, HOLZ_DD) + R(-42, -50, 84, 6, WEISS, 3) + P("M-42 -46H42V-34H-42Z", c) +
      Array.from({ length: 14 }, (_, k) => [0, 1].map((r) => (k + r) % 2 ? "" : R(-42 + k * 6, -46 + r * 6, 6, 6, WEISS, 0, `opacity="0.5"`)).join("")).join("") },
    o_konfitueren: { name: "Konfitüren", der: "die Konfitüren", kat: "essen", klein: true, w: 36, h: 20, tags: ["essen"], d: () =>
      [[-11, "#d63c5a"], [0, "#ff9f43"], [11, "#5a4ea6"]].map(([x, f]) => R(x - 5, -14, 10, 14, f, 2.5) + R(x - 3.5, -10, 7, 5, "#fff6c2", 1) +
        R(x - 6, -18, 12, 5, "#ef5350", 2) + C(x - 3, -15.6, 0.8, WEISS) + C(x, -16.6, 0.8, WEISS) + C(x + 3, -15.6, 0.8, WEISS)).join("") },
    o_waffeleisen: { name: "Waffeleisen", der: "das Waffeleisen", kat: "kueche", klein: true, w: 34, h: 28, tags: ["essen"], d: () =>
      P("M-15 -12L-11 -27H11L15 -12Z", "#3a4556") + herz(-5, -21, 2.6, "#5a6880") + herz(5, -21, 2.6, "#5a6880") + herz(0, -16, 2.6, "#5a6880") +
      R(-12, -13, 24, 2, DUNKEL, 1) + R(-16, -9, 32, 9, "#4a5568", 3) + C(-11, -4.5, 1.3, "#ef5350") + R(11, -6, 5, 3, DUNKEL, 1.5) +
      P("M-12 -9q0 -4 4 -4h16q4 0 4 4z", "#e8b06a") + S("M-6 -12.6v3.4M0 -13v4M6 -12.6v3.4", "#c98a45", 0.8) },
    o_fruehstuecksei: { name: "Frühstücksei", der: "das Frühstücksei", kat: "essen", klein: true, w: 18, h: 26, tags: ["essen"], d: () =>
      E(0, -15, 5, 6.5, "#fbf3e4") + P("M-5.6 -14a5.6 9 0 0 1 11.2 0z", "#ef5350") + R(-5.8, -15, 11.6, 2.4, "#f48a88", 1.2) +
      S("M-2.6 -18v-3M0 -19v-3.4M2.6 -18v-3", "#c93b3b", 0.8) + C(0, -23.5, 2.2, "#ffd166") +
      P("M-6 -11H6Q6 -5 2 -4V-2H5V0H-5V-2H-2V-4Q-6 -5 -6 -11Z", "#6cc3d5") },
    o_kaeseplatte: { name: "Käseplatte", der: "die Käseplatte", kat: "essen", klein: true, w: 46, h: 20, tags: ["kaese", "essen"], d: () =>
      R(-19, -4, 38, 4, HOLZ, 2) + R(19, -3.4, 4, 2.6, HOLZ_D, 1.3) +
      P("M-17 -4V-14L4 -19V-4Z", "#ffd166") + P("M-17 -14L4 -19L6 -18L-15 -13Z", "#ffe08a") + C(-11, -9, 2, "#e8b94f") + C(-4, -13, 1.6, "#e8b94f") + C(0, -7, 2.2, "#e8b94f") +
      [[10, -6.6], [14, -6.6], [12, -9.8], [8, -9.8], [16, -9.8], [12, -13]].map(([x, y]) => C(x, y, 2.1, "#7cc05e")).join("") + S("M12 -15v-2", "#8a5734", 1) },
    o_fruechtesalat: { name: "Früchtesalat", der: "der Früchtesalat", kat: "essen", klein: true, w: 30, h: 22, tags: ["fruechte", "essen"], d: () =>
      C(-6, -13, 3.4, "#ef5350") + C(1, -14.5, 3.2, "#7cc05e") + C(1, -14.5, 1.6, "#c5ec9a") + C(7, -12.5, 3, "#ffd166") + C(-1, -11, 2.4, "#3a4fb6") +
      P("M2 -18q3 -4 6 -2q-2 3 -6 2z", "#5cb85c") +
      C(-7, -7, 2.4, "#ff9f43") + C(-1, -5, 2.4, "#ef5350") + C(5, -7, 2.4, "#7cc05e") + C(1, -9, 2, "#ffd166") +
      P("M-14 -12H14Q12 0 0 0Q-12 0 -14 -12Z", GLAS, `opacity="0.55" stroke="${GLAS_R}" stroke-width="1.2"`) },
    o_fruehstueckstafel: { name: "Frühstückstafel", der: "die Frühstückstafel", kat: "deko", art: "wand", w: 64, h: 48, tags: ["menue"], d: () =>
      R(-32, -24, 64, 48, HOLZ_D, 4) + R(-28, -20, 56, 40, "#2f3b35", 2) + T(0, -9, "FRÜHSTÜCK", 7.5, "#f4f1ea") +
      P("M-21 -1h9v5q0 4 -4.5 4t-4.5 -4z", "#f4f1ea") + S("M-12 1q3 0 2 3", "#f4f1ea", 1.2) + S("M-17.5 -3q-1.5 -2 0 -4", "#f4f1ea", 0.8) +
      P("M-5 7q6 -10 12 0q-6 3 -12 0z", "#e8b06a") + E(17, 3, 3.4, 4.4, "#fff6c2") + T(0, 17, "7 – 10 UHR", 5, "#ffd166") },
    o_teekiste: { name: "Teekiste", der: "die Teekiste", kat: "kueche", klein: true, w: 32, h: 20, tags: ["tee", "trinken"], d: () =>
      [-11, -5.5, 0, 5.5, 11].map((x, i) => R(x - 2.6, -17, 5.2, 6, ["#7cc05e", "#ffd166", "#ff9fb5", "#6cc3d5", "#ff9f43"][i], 1)).join("") +
      R(-16, -12, 32, 12, HOLZ, 2.5) + R(-14, -10, 28, 8, shade(HOLZ, 0.12), 1.5) + R(-7, -8.5, 14, 5, "#fff6c2", 1) + T(0, -4.7, "TEE", 4, HOLZ_DD) },

    // --- Wellness ------------------------------------------------------------------
    o_sauna: { name: "Sauna", der: "die Sauna", kat: "bad", w: 120, h: 150, tags: ["sauna"], d: () =>
      R(-58, -144, 116, 144, SAUNAHOLZ, 3) + S(Array.from({ length: 11 }, (_, i) => `M-58 ${-132 + i * 12}H58`).join(""), SAUNAHOLZ_D, 1.2) +
      R(-60, -150, 120, 8, "#a8774a", 3) + R(-24, -140, 48, 12, "#8a5734", 3) + T(0, -131, "SAUNA", 9, "#fff1d6") +
      R(-16, -124, 40, 124, "#c48a52", 3) + R(-16, -124, 40, 124, "none", 3, `stroke="#8a5734" stroke-width="1.4"`) +
      R(-8, -114, 24, 44, "#ffb347", 4, `opacity="0.85"`) + R(-8, -86, 24, 4, "#d9893a") + S("M-4 -108l6 -6M-4 -98l10 -10", WEISS, 1.6, `opacity="0.6"`) +
      R(16, -70, 3.4, 18, "#8a5734", 1.5) +
      R(-48, -110, 12, 34, WEISS, 5, `stroke="${RAND}" stroke-width="1"`) + R(-43.5, -105, 3, 22, "#fbd5d5", 1.5) + R(-43.5, -96, 3, 13, "#ef5350", 1.5) + C(-42, -82, 3.4, "#ef5350") +
      R(34, -110, 16, 16, "#ffb347", 3, `opacity="0.7"`) + S("M42 -110v16M34 -102h16", "#c48a52", 1.6) + R(-60, -4, 120, 4, "#a8774a", 2) },
    o_massageliege: { name: "Massageliege", der: "die Massageliege", kat: "bad", w: 124, h: 52, farbe: "#7cc05e", tags: ["massage", "liege"], d: (c) =>
      S("M-34 -32V-3M50 -32V-3", HOLZ_D, 5) + R(-34, -14, 84, 3, HOLZ_D, 1.5) + R(-38, -3, 8, 3, HOLZ_DD, 1.5) + R(46, -3, 8, 3, HOLZ_DD, 1.5) +
      R(-46, -42, 108, 10, "#f3e6d2", 5) + R(-48, -40, 3, 4, METALL_D, 1) + R(-62, -44, 15, 7, "#f3e6d2", 3.5) +
      P("M-20 -44H44V-31Q34 -27 24 -31Q14 -27 4 -31Q-6 -27 -16 -31Q-18 -30 -20 -31Z", c) + R(-20, -41, 64, 2, shade(c, 0.3), 1) +
      R(44, -50, 16, 8, WEISS, 4, `stroke="${RAND}" stroke-width="1"`) +
      [0, 72, 144, 216, 288].map((a) => C(n(8 + Math.cos((a * Math.PI) / 180) * 2.4), n(-46 + Math.sin((a * Math.PI) / 180) * 2.4), 1.8, WEISS)).join("") + C(8, -46, 1.4, "#ffd166") },
    o_dampfbad: { name: "Dampfbad", der: "das Dampfbad", kat: "bad", w: 104, h: 150, d: () =>
      P("M-52 0V-130Q-52 -150 -32 -150H32Q52 -150 52 -130V0Z", "#3fa7c0") +
      S(Array.from({ length: 13 }, (_, i) => `M-52 ${-128 + i * 10}H52`).join("") + Array.from({ length: 9 }, (_, i) => `M${-40 + i * 10} -130V0`).join(""), "#7fd1e0", 0.8, `opacity="0.7"`) +
      [[-46, -106], [36, -86], [-36, -46], [42, -26], [-44, -16]].map(([x, y]) => R(x, y, 8, 8, "#7fd1e0", 1)).join("") +
      R(-26, -142, 52, 11, WEISS, 3) + T(0, -133.6, "DAMPFBAD", 7, "#2b7a8c") +
      R(-24, -124, 48, 124, GLAS, 3, `opacity="0.8" stroke="#cbd5e0" stroke-width="2"`) +
      [[-10, -92, 10], [4, -98, 12], [13, -82, 9], [-8, -72, 9], [6, -64, 8], [-12, -108, 7], [10, -114, 7]].map(([x, y, r]) => C(x, y, r, WEISS, `opacity="0.85"`)).join("") +
      R(15, -70, 3, 18, METALL, 1.5) },
    o_whirlpool: { name: "Whirlpool", der: "der Whirlpool", kat: "bad", w: 160, h: 60, tags: ["whirlpool"], d: () =>
      P("M-72 -40V-45Q-66 -48 -60 -45T-48 -45T-36 -45T-24 -45T-12 -45T0 -45T12 -45T24 -45T36 -45T48 -45T60 -45T72 -45V-40Z", "#6cc3e8") + [-60, -46, -32, -18, -4, 10, 24, 38, 52].map((x, i) => C(x, n(-46 - (i % 3) * 1.6), 4 + (i % 2), WEISS, `stroke="#cfe9f5" stroke-width="1"`)).join("") +
      [[-40, -54, 1.8], [-12, -56, 2.2], [20, -55, 1.6], [44, -53, 2]].map(([x, y, r]) => C(x, y, r, "none", `stroke="${WASSER}" stroke-width="1"`)).join("") +
      R(-76, -40, 152, 8, "#e2e8f0", 4) + R(-72, -34, 144, 34, "#c48a52", 4) + S("M-48 -32V-4M-24 -32V-4M0 -32V-4M24 -32V-4M48 -32V-4", "#a8774a", 1.4) + R(-72, -4, 144, 4, "#a8774a", 2) +
      R(70, -18, 10, 18, "#b07a4f", 2) + R(70, -18, 10, 2, SAUNAHOLZ) + S("M74 -40V-54Q74 -58 70 -58H64", METALL, 2.6) },
    o_ruheliege: { name: "Ruheliege", der: "die Ruheliege", kat: "sitzen", w: 116, h: 52, farbe: "#6cc3d5", tags: ["liegestuhl", "sitz"], d: (c) =>
      P("M-48 -22L-57 -50L-48 -52L-39 -24Z", MARMOR, `stroke="${MARMOR_D}" stroke-width="1"`) + P("M-40 -24L-48 -48L-43 -49L-34 -26Z", c) +
      R(-44, -16, 5, 16, MARMOR_D, 2) + R(48, -16, 5, 16, MARMOR_D, 2) + R(-48, -22, 104, 6, MARMOR, 3, `stroke="${MARMOR_D}" stroke-width="1"`) +
      R(-36, -30, 92, 8, c, 4) + S("M-34 -26H54", shade(c, 0.3), 1) + R(36, -37, 16, 7, WEISS, 3.5, `stroke="${RAND}" stroke-width="1"`) },
    o_frotteetuecher: { name: "Frotteetücher", der: "die Frotteetücher", kat: "bad", klein: true, w: 32, h: 34, farbe: "#7cc05e", tags: ["handtuch"], d: (c) =>
      R(-15, -8, 30, 8, c, 3) + R(-15, -16, 30, 8, WEISS, 3, `stroke="${RAND}" stroke-width="1"`) + R(-15, -24, 30, 8, c, 3) +
      S("M-15 -4h30M-15 -20h30", shade(c, -0.15), 0.8) + S("M-15 -12h30", "#e2e8f0", 0.8) +
      [0, 72, 144, 216, 288].map((a) => C(n(3 + Math.cos(((a - 90) * Math.PI) / 180) * 3), n(-28 + Math.sin(((a - 90) * Math.PI) / 180) * 3), 2.4, WEISS, `stroke="#f2d6e0" stroke-width="0.6"`)).join("") +
      C(3, -28, 1.6, "#ffd166") },
    o_duftlampe: { name: "Duftlampe", der: "die Duftlampe", kat: "deko", klein: true, w: 20, h: 30, licht: true, tags: ["lampe"], d: () =>
      S("M-2 -20q-2 -3 0 -6t0 -4M3 -20q2 -3 0 -5", "#cbd5e0", 1.2) + P("M-7 0L-5 -16H5L7 0Z", "#f3e6d2") + P("M-3 -2v-6a3 3 0 0 1 6 0v6z", "#ffb347") +
      P("M0 -4c-1.4 0 -1.4 -2 0 -3.6c1.4 1.6 1.4 3.6 0 3.6z", "#fff6c2") + E(0, -17, 7, 2.5, "#e6d3b3") + E(0, -17.5, 5, 1.4, "#a78bfa") },
    o_teebar: { name: "Kräutertee-Bar", der: "die Kräutertee-Bar", kat: "kueche", w: 100, h: 86, flaeche: -47, fx: [-46, 8], tags: ["tee", "trinken", "theke"], d: () =>
      R(-48, -44, 96, 40, "#c48a52", 4) + S([-36, -24, -12, 0, 12, 24, 36].map((x) => `M${x} -40V-8`).join(""), "#a8774a", 1.4) + R(-48, -6, 96, 6, "#8a5734", 2) +
      R(-50, -47, 100, 5, MARMOR, 2.5) + R(-34, -34, 24, 16, MARMOR, 3) + P("M-26 -21q2 -9 10 -10q-1 9 -10 10z", "#7cc05e") + S("M-25 -22l7 -7", "#5a9e3e", 0.8) +
      R(14, -50, 24, 3, METALL_D, 1.5) + R(14, -78, 24, 28, GLAS, 6, `stroke="${GLAS_R}" stroke-width="1.2"`) + R(15, -70, 22, 19, "#d9a35a", 5, `opacity="0.9"`) +
      P("M20 -62q3 -4 6 -2q-2 3 -6 2z", "#5cb85c") + P("M28 -58q3 -4 6 -2q-2 3 -6 2z", "#4aa34a") + R(15, -81, 22, 4, "#a8774a", 2) + C(26, -83, 2, "#a8774a") + R(24, -53, 4, 4, METALL_D, 1) +
      R(40, -60, 8, 13, GLAS, 2, `stroke="${GLAS_R}" stroke-width="1"`) + R(40.5, -54, 7, 6.5, "#7cc05e", 1.5) + R(39.5, -62, 9, 3, "#a8774a", 1.5) },
    o_bambusbrunnen: { name: "Bambusbrunnen", der: "der Bambusbrunnen", kat: "deko", w: 64, h: 64, tags: ["bambus"], d: () =>
      P("M26 -52q4 -8 6 -12q-1 8 -6 12z", "#5cb85c") + P("M20 -54q-6 -4 -6 -10q5 3 6 10z", "#4aa34a") +
      R(19, -58, 8, 58, "#7cc05e", 2) + R(18.5, -42, 9, 2.2, "#5a9e3e", 1) + R(18.5, -24, 9, 2.2, "#5a9e3e", 1) + E(23, -58, 4, 1.4, "#c5ec9a") +
      S("M-8 -36q-1 8 -1 16", WASSER, 2) + S("M22 -48L-6 -38", "#7cc05e", 6) + S("M8 -43l0.6 1.6", "#5a9e3e", 1.2) + E(-7, -37.8, 2, 3, "#5a9e3e") +
      P("M-28 -18H16Q14 0 -6 0Q-26 0 -28 -18Z", "#9aa5b1") + E(-6, -18, 21, 3, WASSER) + E(-8, -18, 7, 1.5, "none", `stroke="${WEISS}" stroke-width="0.8"`) +
      E(-26, -2, 4, 2.4, "#cbd5e0") + E(12, -2, 3.4, 2, "#a0aec0") + E(28, -3, 4, 2.6, "#cbd5e0") },
    o_steinturm: { name: "Steinturm", der: "der Steinturm", kat: "deko", klein: true, w: 22, h: 32, d: () =>
      E(0, -4, 10, 4, "#7c8796") + E(0, -11, 8, 3.6, "#9aa5b1") + E(0, -17.5, 6.5, 3.2, "#6b7280") + E(0, -23, 5, 2.8, "#a0aec0") + E(0, -28, 3.6, 2.4, "#7c8796") +
      [[-4, -6, 3], [-3, -13, 2.4], [-2, -19, 2], [-1.6, -24.4, 1.6]].map(([x, y, r]) => E(x, y, r, 0.8, WEISS, `opacity="0.4"`)).join("") },
    o_klangschale: { name: "Klangschale", der: "die Klangschale", kat: "deko", klein: true, w: 34, h: 18, tags: ["musik"], d: () =>
      R(-12, -5, 24, 5, "#7c5ce6", 2.5) + P("M-11 -12H11Q10 -4 0 -4Q-10 -4 -11 -12Z", GOLD) + E(0, -12, 11, 2, GOLD_D) + E(0, -12, 9, 1.3, "#a8772a") +
      S("M13 -15q3 3 0 6M15.5 -17q5 5 0 10", GOLD, 1) + S("M-16 -3L-6 -12", HOLZ_D, 1.6) + C(-6, -12, 1.8, "#8a5734") },
    o_fussbad: { name: "Fussbad", der: "das Fussbad", kat: "bad", w: 54, h: 30, d: () =>
      dampf(-8, -24, 8) + dampf(6, -24, 8) + E(0, -22, 23, 3, WASSER) + C(-10, -22, 1.6, "#ff9fb5") + C(4, -21.6, 1.4, "#ffd166") + C(12, -22.4, 1.6, "#ff9fb5") +
      P("M-24 -22H24L21 0H-21Z", "#c48a52") + R(-23.5, -17, 47, 3, METALL_D) + R(-22, -7, 44, 3, METALL_D) + S("M-12 -14v4M0 -14v4M12 -14v4", "#a8774a", 1) },
    o_saunakuebel: { name: "Saunakübel", der: "der Saunakübel", kat: "bad", klein: true, w: 30, h: 32, d: () =>
      E(0, -16, 10.5, 2, WASSER) + S("M5 -16L14 -30", HOLZ_D, 2.4) + E(4, -16.5, 4, 1.6, HOLZ_DD) +
      P("M-11 -16H11L9 0H-9Z", "#c48a52") + R(-11, -13, 22, 2, METALL_D) + R(-10, -5, 20, 2, METALL_D) + S("M-4 -11v6M4 -11v6", "#a8774a", 0.9) },
    o_gurkenwasser: { name: "Gurkenwasser", der: "das Gurkenwasser", kat: "kueche", klein: true, w: 22, h: 30, tags: ["trinken"], d: () =>
      P("M-4 -30h8v6q6 4 6 12v10q0 2 -2 2h-16q-2 0 -2 -2v-10q0 -8 6 -12z", GLAS, `stroke="${GLAS_R}" stroke-width="1.2"`) + R(-8, -16, 16, 14, "#cdeef8", 2) +
      C(-3, -10, 3, "#c5e384", `stroke="#5cb85c" stroke-width="1"`) + C(3, -6, 3, "#c5e384", `stroke="#5cb85c" stroke-width="1"`) + C(3, -13, 2.6, "#fff1b8", `stroke="#ffd166" stroke-width="1"`) +
      P("M-1 -22q3 -4 6 -2q-2 3 -6 2z", "#5cb85c") },
    o_orchidee: { name: "Orchidee", der: "die Orchidee", kat: "deko", klein: true, w: 26, h: 42, tags: ["pflanze", "blumen"], d: () =>
      S("M3 -15V-38", "#8a5734", 1) + S("M1 -15Q0 -36 7 -34", "#5a9e3e", 1.2) + bluete(-6, -29, "#f5a3d6") + bluete(0, -35, "#f5a3d6") + bluete(7, -32, "#f8c4e4") +
      E(-6, -14, 6, 2.2, "#4aa34a", `transform="rotate(-15 -6 -14)"`) + E(6, -14, 6, 2.2, "#5cb85c", `transform="rotate(15 6 -14)"`) + topf(14, 10, "#f1ece4") },

    // --- Kinderclub ----------------------------------------------------------------
    o_basteltisch: { name: "Basteltisch", der: "der Basteltisch", kat: "tische", w: 96, h: 56, farbe: "#ffd166", flaeche: -34, fx: [-44, -4], tags: ["tisch", "malen"], d: (c) =>
      leg(-42, 28, "#ef5350", 6) + leg(36, 28, "#3a86ff", 6) + R(-48, -34, 96, 6, c, 3) +
      [-38, -30, -22, -14, -6].map((x, i) => E(x, -25, 4, 2.6, "none", `stroke="${BUNT[i]}" stroke-width="1.8"`)).join("") +
      R(3, -52, 2, 9, "#ef5350", 0.8) + R(6, -54, 2, 11, "#7cc05e", 0.8) + R(9, -51, 2, 8, "#3a86ff", 0.8) + R(1, -44, 11, 10, "#7c5ce6", 2) +
      R(16, -37, 28, 3, "#a8d8f8", 1) + R(18, -40, 26, 3, "#ff9fb5", 1) + stern(26, -44, 4, "#ffd166") + C(37, -42, 2.4, "#ff7aa2") + C(41, -42.6, 2, "#7cc05e") },
    o_kletterwuerfel: { name: "Kletterwürfel", der: "der Kletterwürfel", kat: "spielen", w: 92, h: 92, farbe: "#6cc3d5", tags: ["klettern", "spielzeug"], d: (c) =>
      P("M-44 -76L-28 -92H44L28 -76Z", shade(c, 0.3)) + P("M28 -76L44 -92V-16L28 0Z", shade(c, -0.2)) + R(-44, -76, 72, 76, c, 2) +
      C(-8, -38, 18, "#ffd166") + C(-8, -38, 13, shade(c, -0.55)) +
      S("M31 -66l10 -10M31 -50l10 -10M31 -34l10 -10M31 -18l10 -10", shade(c, -0.4), 2.4) +
      [[-36, -68, "#ef5350"], [18, -66, "#3a86ff"], [-35, -10, "#7cc05e"], [20, -12, "#a78bfa"], [-34, -40, "#ff9f43"], [18, -40, "#ffd166"]].map(([x, y, f]) => E(x, y, 3.6, 2.6, f)).join("") },
    o_kostuemkiste: { name: "Kostümkiste", der: "die Kostümkiste", kat: "spielen", w: 76, h: 70, tags: ["kostuem", "spielzeug"], d: () =>
      P("M-34 -34L-30 -52H30L34 -34Z", "#8a5734") + R(-30, -52, 60, 3, GOLD_D, 1.5) +
      P("M10 -38L21 -66L32 -38Z", "#7c5ce6") + stern(19, -50, 2.6, "#ffd166") + stern(25, -44, 2, "#ffd166") + E(21, -38, 13, 2.6, "#6a4fd0") +
      P("M-24 -38L-26 -52L-19 -45L-13 -55L-7 -45L0 -52L-2 -38Z", GOLD) + C(-13, -42, 1.8, "#ef5350") + C(-20, -41, 1.4, "#3a86ff") + C(-6, -41, 1.4, "#7cc05e") +
      P("M-2 -35l3 -8l3 6l3 -8l3 8l3 -6l2 8z", "#ff9fb5") +
      R(-34, -34, 68, 34, "#a46c43", 4) + R(-34, -27, 68, 4, "#8a5734") + R(-34, -12, 68, 4, "#8a5734") +
      R(-34, -34, 6, 6, GOLD_D, 2) + R(28, -34, 6, 6, GOLD_D, 2) + R(-34, -6, 6, 6, GOLD_D, 2) + R(28, -6, 6, 6, GOLD_D, 2) +
      R(-4, -30, 8, 9, GOLD, 1.5) + C(0, -25.5, 1.2, "#5b3a29") +
      S("M-30 -33q8 12 16 2t16 4", "#ff7aa2", 5, `stroke-dasharray="0.1 3.6"`) },
    o_kasperlitheater: { name: "Kasperlitheater", der: "das Kasperlitheater", kat: "spielen", w: 92, h: 138, farbe: "#ef5350", tags: ["theater", "spielzeug"], d: (c) =>
      R(-42, -122, 84, 122, "#3a86ff", 3) + P("M-46 -122L-40 -138H40L46 -122Z", "#ffd166") +
      stern(-20, -130, 3.4, "#ef5350") + stern(0, -130.5, 4, "#ef5350") + stern(20, -130, 3.4, "#ef5350") +
      R(-31, -108, 62, 44, "#1f2b44", 2) +
      P("M-7 -86Q-2 -104 11 -98L7 -86Z", "#ef5350") + C(11, -98, 2, GOLD) + C(0, -80, 7.5, HAUT) + C(-4, -77, 1.6, "#ffb3b3") + C(4, -77, 1.6, "#ffb3b3") +
      C(-2.6, -81.5, 1, TINTE) + C(2.6, -81.5, 1, TINTE) + C(0, -79, 2, "#ff7a7a") + S("M-3.6 -76q3.6 3 7.2 0", TINTE, 0.9) +
      P("M-9 -72H9L11 -66H-11Z", "#7cc05e") + C(-11, -69, 2.4, HAUT) + C(11, -69, 2.4, HAUT) +
      P("M-31 -108H-14Q-18 -90 -24 -66H-31Z", c) + P("M31 -108H14Q18 -90 24 -66H31Z", c) + P(volant(-31, 31, -108, -103, 2, 6), shade(c, -0.15)) +
      R(-35, -66, 70, 5, "#a46c43", 2) + R(-34, -56, 68, 48, shade("#3a86ff", 0.15), 3) + stern(0, -32, 9, "#ffd166") +
      C(-22, -46, 3, "#ff9fb5") + C(22, -46, 3, "#7cc05e") + C(-22, -18, 3, "#7cc05e") + C(22, -18, 3, "#ff9fb5") + R(-42, -6, 84, 6, "#2d5fb8", 2) },
    o_malwand: { name: "Malwand", der: "die Malwand", kat: "buero", art: "wand", w: 124, h: 84, tags: ["malen", "bild"], d: () =>
      R(-56, -35, 112, 70, WEISS, 1, `stroke="${RAND}" stroke-width="1"`) + R(-62, -42, 124, 8, HOLZ_D, 4) + C(-58, -38, 3, HOLZ_DD) + C(58, -38, 3, HOLZ_DD) +
      C(-42, -20, 6, "#ffd166") + S("M-42 -30v-3M-42 -10v3M-52 -20h-3M-32 -20h3M-49 -27l-2 -2M-35 -27l2 -2M-49 -13l-2 2M-35 -13l2 2", "#ffd166", 1.4) +
      S("M-56 6H4", "#7cc05e", 2) + R(-26, -10, 18, 16, "#ff9f6b", 1) + P("M-28 -10L-17 -20L-6 -10Z", "#ef5350") + R(-19, -2, 5, 8, "#8a5734") + R(-24, -7, 4, 4, "#a8ddf0") +
      S("M-50 6v-7M-4 6v-6", "#5cb85c", 1.2) + C(-50, -2, 2.4, "#ff7aa2") + C(-4, -1, 2.4, "#a78bfa") +
      ["#ef5350", "#ff9f43", "#ffd166", "#7cc05e", "#3a86ff"].map((f, i) => S(`M${n(10 + i * 2.4)} 12A${n(16 - i * 2.4)} ${n(16 - i * 2.4)} 0 0 1 ${n(42 - i * 2.4)} 12`, f, 2.4)).join("") +
      P("M-42 18q4 -6 8 -2q6 -2 4 4q4 4 -2 6q-4 4 -8 0q-6 0 -2 -8z", "#a78bfa", `opacity="0.85"`) + C(46, -22, 3, "#6cc3d5", `opacity="0.8"`) + C(50, -16, 1.6, "#6cc3d5", `opacity="0.8"`) +
      R(-58, 35, 116, 6, HOLZ, 2) + R(-40, 31, 10, 4, "#ef5350", 1) + R(-24, 31, 10, 4, "#3a86ff", 1) + R(-8, 31, 10, 4, "#7cc05e", 1) + R(8, 31, 10, 4, "#ffd166", 1) },
    o_burgzelt: { name: "Burgzelt", der: "das Burgzelt", kat: "spielen", w: 96, h: 122, farbe: "#a78bfa", tags: ["spielzeug"], d: (c) =>
      S("M-36 -114V-120M36 -114V-120", DUNKEL, 1.4) + P("M-36 -121l7 2.4-7 2.4z", "#ffd166") + P("M36 -121l7 2.4-7 2.4z", "#ffd166") +
      R(-44, -92, 16, 92, shade(c, -0.12), 2) + R(28, -92, 16, 92, shade(c, -0.12), 2) +
      P("M-47 -92L-36 -114L-25 -92Z", "#ef5350") + P("M25 -92L36 -114L47 -92Z", "#ef5350") +
      P("M-39 -70v-8a3 3 0 0 1 6 0v8z", shade(c, -0.5)) + P("M33 -70v-8a3 3 0 0 1 6 0v8z", shade(c, -0.5)) +
      R(-28, -66, 56, 66, c, 1) + [-28, -16, -4, 8, 20].map((x) => R(x, -74, 8, 9, c, 1)).join("") +
      P("M-12 0V-28a12 12 0 0 1 24 0V0Z", shade(c, -0.5)) + P("M-12 0V-28Q-10 -36 -4 -39L-6 0Z", shade(c, 0.25)) + P("M12 0V-28Q10 -36 4 -39L6 0Z", shade(c, 0.25)) +
      stern(-18, -50, 3.4, "#ffd166") + stern(18, -50, 3.4, "#ffd166") + herz(0, -54, 3.4, "#ff7aa2") },
    o_baellebad: { name: "Bällebad", der: "das Bällebad", kat: "spielen", w: 124, h: 58, tags: ["ball", "spielzeug"], d: () => {
      const baelle = [[-52, -38], [-40, -38], [-28, -38], [-16, -38], [-4, -38], [8, -38], [20, -38], [32, -38], [44, -38], [54, -38],
        [-46, -45], [-33, -45], [-20, -45], [-7, -45], [6, -45], [19, -45], [32, -45], [45, -45], [-26, -51], [-12, -51], [2, -51], [16, -51], [30, -51]];
      return baelle.map(([x, y], i) => C(x, y, 6, BUNT[(i * 3) % BUNT.length]) + C(x - 2, y - 2, 1.6, WEISS, `opacity="0.7"`)).join("") +
        R(-60, -34, 120, 34, "#3a86ff", 9) + R(-62, -38, 124, 9, "#6cc3d5", 4.5) + S("M-30 -29V-4M0 -29V-4M30 -29V-4", "#2f6fd0", 1.2) +
        [-45, -15, 15, 45].map((x) => stern(x, -17, 4, "#ffd166")).join("");
    } },
    o_bastelregal: { name: "Bastelregal", der: "das Bastelregal", kat: "tische", w: 84, h: 70, flaeche: -70, tags: ["regal", "malen"], d: () =>
      R(-42, -70, 84, 66, HOLZ, 4) + R(-42, -4, 84, 4, HOLZ_D, 2) +
      [-64, -34].map((y, r) => [-38, -12, 14].map((x, k) => {
        const i = r * 3 + k;
        const drin = [
          R(x + 4, y + 1, 2, 9, "#ef5350", 0.8) + R(x + 8, y - 1, 2, 11, "#3a86ff", 0.8) + R(x + 12, y + 2, 2, 8, "#7cc05e", 0.8) + R(x + 16, y, 2, 10, "#ffd166", 0.8),
          C(x + 7, y + 7, 2.6, "#ff7aa2") + C(x + 12, y + 6, 2.6, "#ffd166") + C(x + 17, y + 7, 2.6, "#7cc05e"),
          R(x + 5, y + 2, 4, 8, "#a8d8f8", 1) + R(x + 11, y, 4, 10, "#ff9fb5", 1) + R(x + 17, y + 2, 4, 8, "#ffd166", 1),
          S(`M${x + 6} ${y + 10}V${y + 1}M${x + 11} ${y + 10}V${y}`, HOLZ_D, 1.4) + C(x + 6, y + 1, 1.6, "#ef5350") + C(x + 11, y, 1.6, "#3a86ff"),
          R(x + 6, y + 2, 5, 8, WEISS, 1.5) + R(x + 6, y + 1, 5, 2.4, "#a78bfa", 1) + R(x + 13, y + 3, 5, 7, WEISS, 1.5) + R(x + 13, y + 2, 5, 2.4, "#ff9f43", 1),
          C(x + 8, y + 7, 3.4, "#ef5350") + C(x + 15, y + 7, 3.4, "#6cc3d5") + S(`M${x + 11} ${y + 6}q3 -4 6 -2`, "#ef5350", 0.8),
        ][i];
        return R(x, y, 24, 28, HOLZ_D, 2) + drin + R(x + 1, y + 8, 22, 20, BUNT[(i * 3 + 1) % BUNT.length], 3) + R(x + 7, y + 13, 10, 6, WEISS, 1.5) +
          (i % 2 ? C(x + 12, y + 16, 1.6, BUNT[i]) : stern(x + 12, y + 16, 2, BUNT[i]));
      }).join("")).join("") },
    o_clubschild: { name: "Kinderclub-Schild", der: "das Kinderclub-Schild", kat: "deko", art: "wand", w: 110, h: 50, d: () =>
      R(-55, -25, 110, 50, WEISS, 10, `stroke="${RAND}" stroke-width="1.5"`) +
      ["#ef5350", "#ff9f43", "#ffd166", "#7cc05e", "#3a86ff"].map((f, i) => S(`M${n(-50 + i * 2.6)} 0A${n(14 - i * 2.6)} ${n(14 - i * 2.6)} 0 0 1 ${n(-22 - i * 2.6)} 0`, f, 2.6)).join("") +
      C(-50, 0, 3.4, "#e6f6fc") + C(-46, 1, 3, "#e6f6fc") + C(-22, 0, 3.4, "#e6f6fc") + C(-26, 1, 3, "#e6f6fc") +
      C(38, -7, 7, "#ffd166") + S("M38 -18v3M38 4v-3M27 -7h3M49 -7h-3M30 -15l2 2M46 -15l-2 2M30 1l2 -2M46 1l-2 -2", "#ffd166", 1.6) +
      stern(4, -12, 4, "#ff7aa2") + stern(16, -6, 3, "#6cc3d5") + T(2, 18, "KINDERCLUB", 11, "#7c5ce6") },
    o_kuschelecke: { name: "Kuschelecke", der: "die Kuschelecke", kat: "sitzen", w: 100, h: 46, tags: ["kissen", "sitz"], d: () =>
      R(-46, -44, 40, 32, "#ff9fb5", 13) + S("M-38 -28q12 4 24 0", "#f07fa0", 1.4) + R(4, -46, 42, 34, "#6cc3d5", 13) + S("M12 -30q13 4 26 0", "#4fa9bc", 1.4) +
      R(-50, -14, 100, 14, "#ffd166", 6) + S("M-50 -7H50", "#f0b93a", 1.2) +
      R(-20, -34, 34, 22, "#7cc05e", 10) + stern(-3, -23, 5, "#ffd166") + C(36, -20, 8, "#a78bfa") + herz(36, -20, 3, WEISS) },
    o_seifenblasen: { name: "Seifenblasen", der: "die Seifenblasen", kat: "spielen", klein: true, w: 26, h: 36, tags: ["spielzeug"], d: () =>
      C(3, -29, 5, GLAS, `opacity="0.6" stroke="#8fc9e8" stroke-width="1"`) + S("M0 -31a3 3 0 0 1 2 -2", WEISS, 1) + C(-6, -25, 3.2, GLAS, `opacity="0.6" stroke="#8fc9e8" stroke-width="1"`) +
      C(10, -32, 2.2, GLAS, `opacity="0.6" stroke="#8fc9e8" stroke-width="1"`) +
      S("M1 -10L7 -20", "#ffd166", 1.4) + C(8.4, -22.6, 3, "none", `stroke="#ffd166" stroke-width="1.4"`) +
      R(-9, -14, 10, 14, "#6cc3d5", 3) + R(-8, -17, 8, 4, "#ef5350", 1.5) + stern(-4, -7, 2.6, WEISS) },
    o_handabdruecke: { name: "Handabdrücke", der: "die Handabdrücke", kat: "deko", art: "wand", w: 70, h: 52, tags: ["bild", "malen"], d: () =>
      R(-35, -26, 70, 52, HOLZ, 3) + R(-31, -22, 62, 44, WEISS, 1) +
      hand(-18, -6, "#ef5350", -12) + hand(0, -9, "#3a86ff", 4) + hand(18, -5, "#7cc05e", 14) + hand(-9, 12, "#ffd166", -4) + hand(10, 12, "#a78bfa", 10) },
    o_huepfball: { name: "Hüpfball", der: "der Hüpfball", kat: "spielen", w: 40, h: 46, farbe: "#ff9f43", tags: ["ball", "spielzeug"], d: (c) =>
      R(-10, -45, 6, 11, shade(c, -0.12), 3, `transform="rotate(-14 -7 -38)"`) + R(4, -45, 6, 11, shade(c, -0.12), 3, `transform="rotate(14 7 -38)"`) +
      C(0, -19, 19, c) + E(-7, -27, 5, 3, shade(c, 0.35), `transform="rotate(-30 -7 -27)"`) +
      C(-6, -21, 1.8, TINTE) + C(6, -21, 1.8, TINTE) + S("M-7 -13q7 6 14 0", TINTE, 1.6) + C(-10, -15, 2.4, shade(c, 0.3)) + C(10, -15, 2.4, shade(c, 0.3)) },
    o_holzregenbogen: { name: "Holzregenbogen", der: "der Holzregenbogen", kat: "spielen", klein: true, w: 38, h: 20, tags: ["spielzeug"], d: () =>
      [[17.6, 14.2, "#ef5350"], [14, 10.6, "#ffd166"], [10.4, 7, "#7cc05e"], [6.8, 3.4, "#3a86ff"]].map(([ra, ri, f]) =>
        P(`M${-ra} 0A${ra} ${ra} 0 0 1 ${ra} 0H${ri}A${ri} ${ri} 0 0 0 ${-ri} 0Z`, f)).join("") + P("M-3 0a3 3 0 0 1 6 0z", "#a78bfa") },
    o_kinderschminke: { name: "Kinderschminke", der: "die Kinderschminke", kat: "spielen", klein: true, w: 32, h: 16, tags: ["malen"], d: () =>
      P("M-15 -6L-13 -15H13L15 -6Z", "#cbd5e0") + R(-10, -13.5, 20, 6, "#e6f6fc", 1.5) + S("M-6 -9l3 -3M2 -9l3 -3", WEISS, 1) +
      R(-15, -6, 30, 6, "#e2e8f0", 2) + [-10.5, -5.25, 0, 5.25, 10.5].map((x, i) => E(x, -6, 2.4, 1.1, BUNT[i])).join("") },

    // --- Hotelküche ---------------------------------------------------------------
    o_grossherd: { name: "Grossherd", der: "der Grossherd", kat: "kueche", w: 136, h: 68, flaeche: -68, tags: ["herd"], d: () =>
      R(-68, -62, 136, 56, INOX, 4, `stroke="${INOX_D}" stroke-width="1.5"`) + R(-68, -68, 136, 7, "#2d3748", 3) +
      [-48, -16, 16, 48].map((x) => E(x, -68, 10, 2.2, "#4a5568") + E(x, -68.4, 5, 1, "#ef5350", `opacity="0.7"`)).join("") +
      R(-64, -58, 128, 8, "#c3ccd8", 2) + [-56, -44, -32, -20, 20, 32, 44, 56].map((x) => C(x, -54, 2.6, DUNKEL)).join("") + R(-10, -57, 20, 6, "#2d3748", 1.5) + C(0, -54, 1.2, "#ef5350") +
      [-63, 5].map((x) => R(x, -46, 58, 36, "#c9d3de", 3) + R(x + 6, -36, 46, 20, "#2d3748", 3) + R(x + 8, -34, 42, 16, "#ffb347", 2, `opacity="0.35"`) + R(x + 6, -43, 46, 3, METALL_D, 1.5)).join("") +
      R(-68, -6, 136, 6, DUNKEL, 2) },
    o_suppentopf: { name: "Grosser Suppentopf", der: "der grosse Suppentopf", kat: "kueche", klein: true, w: 46, h: 48, tags: ["geschirr"], d: () =>
      dampf(-8, -35, 11) + dampf(2, -35, 9) + S("M8 -31L17 -45", METALL_D, 2.4) + E(0, -31, 16, 2.4, "#ff9f43") +
      R(-17, -30, 34, 28, "#cfd8e3", 3) + R(-14, -28, 5, 24, "#e6ecf2", 2) + R(-19, -32, 38, 3.4, METALL, 1.7) +
      R(-23, -26, 6, 4, METALL_D, 1.5) + R(17, -26, 6, 4, METALL_D, 1.5) + R(-17, -3, 34, 3, METALL_D, 1.5) },
    o_tellerstapel: { name: "Tellerstapel", der: "der Tellerstapel", kat: "kueche", klein: true, w: 34, h: 44, tags: ["geschirr"], d: () =>
      Array.from({ length: 11 }, (_, i) => {
        const y = n(-4 - i * 3.6);
        return R(-15, y, 30, 3.4, WEISS, 1.7, `stroke="${RAND}" stroke-width="0.9"`) + R(-13, n(y + 1.3), 26, 0.8, "#a8d8f8");
      }).join("") + E(0, -40.6, 15, 2.6, WEISS, `stroke="${RAND}" stroke-width="1"`) + E(0, -40.6, 10, 1.4, "#eef3f7") },
    o_kuehlraumtuer: { name: "Kühlraumtür", der: "die Kühlraumtür", kat: "kueche", w: 86, h: 150, tags: ["kuehlschrank", "tuer"], d: () =>
      R(-43, -150, 86, 150, "#aab6c3", 4) + R(-36, -142, 72, 142, INOX, 3) + R(-36, -142, 72, 142, "none", 3, `stroke="#8a97a6" stroke-width="2"`) +
      R(-38, -130, 6, 14, METALL_D, 2) + R(-38, -30, 6, 14, METALL_D, 2) +
      C(0, -110, 13, "#3a86ff") + S("M0 -120v20M-8.7 -115l17.4 10M-8.7 -105l17.4 -10", WEISS, 2) +
      S("M-2.6 -118l2.6 2.6l2.6 -2.6M-2.6 -102l2.6 -2.6l2.6 2.6", WEISS, 1.2) +
      R(-30, -78, 24, 12, "#2d3748", 2) + T(-18, -69.4, "-18°", 7, "#7cdcff") +
      R(22, -86, 8, 32, METALL_D, 3) + R(12, -76, 18, 8, "#4a5568", 3) + R(-36, -20, 72, 14, "#c3ccd8", 2) +
      P("M-36 -6q6 -4 12 0t12 0t12 0t12 0t12 0t12 0V0H-36Z", "#f4fbff") },
    o_ruesttisch: { name: "Rüsttisch", der: "der Rüsttisch", kat: "kueche", w: 116, h: 60, flaeche: -48, fx: [-54, 0], tags: ["tisch", "gemuese"], d: () =>
      R(-55, -43, 4, 43, METALL_D, 1.5) + R(51, -43, 4, 43, METALL_D, 1.5) + R(-55, -16, 110, 3.4, "#c3ccd8", 1.5) +
      R(-46, -28, 26, 12, "#a46c43", 2) + S("M-46 -22h26", "#8a5734", 1) + E(-40, -29, 4, 2.6, "#d9a35a") + E(-32, -30, 4, 2.8, "#c99050") + E(-25, -29, 3.6, 2.4, "#d9a35a") +
      P("M8 -16Q8 -26 19 -26Q30 -26 30 -16Z", "#cfd8e3") + [[14, -21], [19, -23], [24, -21], [16.5, -18.5], [21.5, -18.5]].map(([x, y]) => C(x, y, 0.9, "#8a97a6")).join("") +
      R(-58, -48, 116, 5, "#cfd8e3", 2) + R(-58, -44, 116, 2, INOX_D) +
      R(6, -51, 44, 3, HOLZ, 1.5) + P("M10 -52.4L26 -54.4L10 -56.6Z", "#ff9f43") + S("M10 -54.5l-3 -3M10 -54.5l-4 0", "#5cb85c", 1.4) +
      C(29, -52.6, 1.8, "#ff9f43") + C(33, -52.6, 1.8, "#ff9f43") + C(31, -55.4, 1.8, "#ff9f43") +
      R(35, -53.4, 9, 2.2, METALL, 1) + R(43, -53.8, 6, 3, DUNKEL, 1.5) },
    o_kochmuetze: { name: "Kochmütze", der: "die Kochmütze", kat: "kueche", art: "wand", w: 52, h: 66, tags: ["kleider"], d: () =>
      R(-25, -33, 50, 6, HOLZ_D, 3) + C(-12, -27, 2, METALL_D) + C(12, -27, 2, METALL_D) +
      S("M-12 -27v4", "#9aa5b1", 1.2) +
      C(-18, -14, 5.5, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(-6, -14, 5.5, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(-12, -17, 6.6, WEISS, `stroke="${RAND}" stroke-width="1"`) +
      R(-22, -11, 20, 9, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + S("M-18 -9v5M-12 -9v5M-6 -9v5", "#e2e8f0", 1) +
      S("M7 -24Q12 -32 17 -24", "#3a6ea5", 1.6) + P("M7 -25H17V-12L20 -6V30H4V-6L7 -12Z", "#3a6ea5") + S("M8 -24V30M12 -25V30M16 -24V30", WEISS, 1, `opacity="0.6"`) +
      S("M4 -4q-4 2 -3 8M20 -4q4 2 3 8", "#3a6ea5", 1.4) + R(7, 8, 10, 8, "#2f5d8f", 1.5) },
    o_durchreiche: { name: "Durchreiche", der: "die Durchreiche", kat: "kueche", art: "wand", w: 132, h: 76, licht: true, d: () =>
      [-40, 0, 40].map((x) => P(`M${x - 6} -22L${x - 16} 18H${x + 16}L${x + 6} -22Z`, "#ffd9a0", `opacity="0.35"`)).join("") +
      R(-62, -38, 124, 8, "#4a5568", 3) + [-40, 0, 40].map((x) => P(`M${x - 10} -30h20l-4 8h-12z`, "#2d3748") + E(x, -21.5, 6, 1.8, "#ffb347")).join("") +
      [-25, 16].map((x) => R(x, -30, 9, 13, WEISS, 1, `stroke="${RAND}" stroke-width="0.8"`) + S(`M${x + 2} -26h5M${x + 2} -23h5M${x + 2} -20h3`, "#9aa5b1", 0.7)).join("") +
      R(-64, 20, 128, 7, "#cfd8e3", 2) + R(-64, 25, 128, 2, INOX_D) +
      E(-36, 18.5, 14, 2.4, WEISS, `stroke="${RAND}" stroke-width="1"`) + E(-36, 15.5, 9, 3, "#e8b06a") + S("M-41 15h10M-40 17h8", "#c98a45", 0.8) + C(-33, 13, 1.4, "#5cb85c") +
      E(-2, 18.5, 14, 2.4, WEISS, `stroke="${RAND}" stroke-width="1"`) + E(-2, 15, 8, 3.4, "#ffd166") + C(-2, 13, 3, "#ef5350") + P("M0 11q3 -3 5 -1q-2 3 -5 1z", "#5cb85c") +
      E(30, 18.5, 12, 2.2, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(26, 15, 3, "#7cc05e") + C(31, 14, 3.4, "#5cb85c") + C(34, 15.5, 2, "#ef5350") +
      P("M48 20a7 7 0 0 1 14 0z", "#cfd8e3") + R(54.2, 10, 1.6, 3, METALL_D) + E(55, 10, 2.4, 1, METALL_D) },
    o_serviceglocke: { name: "Service-Glocke", der: "die Service-Glocke", kat: "kueche", klein: true, w: 22, h: 20, tags: ["klingel"], d: () =>
      R(-11, -4, 22, 4, "#2d3748", 2) + P("M-8.5 -4a8.5 8.5 0 0 1 17 0z", "#cfd8e3") + S("M-5 -7a5 5 0 0 1 3 -3", WEISS, 1.4) +
      R(-1, -15, 2, 3.4, METALL_D) + E(0, -15.5, 3, 1.3, METALL_D) + S("M-10 -14l-2 -2M10 -14l2 -2", METALL, 1.2) },
    o_schoepfkellen: { name: "Schöpfkellen", der: "die Schöpfkellen", kat: "kueche", art: "wand", w: 76, h: 54, tags: ["geschirr"], d: () =>
      R(-36, -25, 72, 5, METALL_D, 2.5) +
      S("M-26 -22V12", METALL, 2.4) + P("M-32 12a6 6 0 0 0 12 0z", METALL) +
      S("M-9 -22V-4", "#4a5568", 3) + P("M-9 -4C-16 4 -13 22 -9 22C-5 22 -2 4 -9 -4Z", "none", `stroke="${METALL}" stroke-width="1.2"`) +
      P("M-9 -4C-13 4 -11 22 -9 22C-7 22 -5 4 -9 -4Z", "none", `stroke="${METALL}" stroke-width="1.2"`) +
      S("M8 -22V6", HOLZ_D, 2.4) + R(4, 6, 8, 14, HOLZ, 2) +
      S("M26 -22V8", METALL, 2.4) + C(26, 14, 6, METALL) + [[24, 12], [28, 12], [26, 15], [23.4, 16], [28.6, 16]].map(([x, y]) => C(x, y, 0.9, "#6b7280")).join("") +
      [-26, -9, 8, 26].map((x) => C(x, -22.5, 1.4, DUNKEL)).join("") },
    o_blechwagen: { name: "Blechwagen", der: "der Blechwagen", kat: "kueche", w: 64, h: 124, tags: ["brot", "regal"], d: () =>
      R(-30, -120, 4, 110, METALL, 2) + R(26, -120, 4, 110, METALL, 2) + R(-30, -122, 60, 4, METALL_D, 2) + R(-30, -12, 60, 4, METALL_D, 2) +
      C(-24, -4, 4, DUNKEL) + C(-24, -4, 1.4, METALL) + C(24, -4, 4, DUNKEL) + C(24, -4, 1.4, METALL) +
      [-98, -74, -50, -26].map((y) => R(-26, y, 52, 3, "#cfd8e3", 1)).join("") +
      [-16, -2, 12].map((x) => gipfeli(x, -98)).join("") + gipfeli(22, -98, "#d9973f") +
      [-17, -5, 7, 19].map((x) => weggli(x, -74)).join("") +
      E(-14, -53.5, 6, 4, "#d99a55") + E(-6, -54, 6, 4.4, "#c98a45") + E(2, -53.5, 6, 4, "#d99a55") + S("M-18 -56q4 3 8 0q4 3 8 0q4 3 8 0", "#a86a30", 1.2) +
      C(14, -52.6, 3, "#e8b06a") + C(21, -52.6, 3, "#e8b06a") + C(14, -52.6, 1, "#ef5350") + C(21, -52.6, 1, "#ef5350") +
      [-12, 10].map((x) => P(`M${x - 11} -26q0 -9 11 -9t11 9z`, "#c98a45") + S(`M${x - 5} -32l2 3M${x} -33l2 3M${x + 5} -32l2 3`, "#a86a30", 1)).join("") },
    o_ruehrmaschine: { name: "Grosse Rührmaschine", der: "die grosse Rührmaschine", kat: "kueche", w: 60, h: 96, farbe: "#ef5350", d: (c) =>
      R(-24, -10, 48, 10, c, 3) + R(10, -86, 16, 76, c, 5) + R(13, -82, 3, 66, shade(c, 0.25), 1.5) + R(-7, -28, 6, 18, shade(c, -0.15), 2) +
      R(-22, -96, 48, 16, c, 7) + S("M-14 -90h20", shade(c, -0.25), 1.2) + R(-7, -80, 4, 24, METALL_D, 1) +
      P("M-20 -56Q-14 -64 -5 -60Q4 -66 12 -56Z", "#f6e3b4") + P("M-24 -54H14L10 -28H-20Z", "#cfd8e3") + R(-26, -56, 42, 4, METALL, 2) +
      S("M-18 -50l2 18", WEISS, 1.6, `opacity="0.7"`) + S("M12 -42H16", METALL_D, 3) + C(18, -70, 2.4, "#2d3748") },
    o_kartoffelsack: { name: "Kartoffelsack", der: "der Kartoffelsack", kat: "essen", w: 44, h: 48, tags: ["gemuese", "essen"], d: () =>
      E(-8, -40, 6, 4, "#d9a35a") + E(2, -42, 6, 4.5, "#c99050") + E(10, -39, 5, 3.6, "#d9a35a") + C(-9, -41, 0.7, "#8a5a30") + C(3, -43, 0.7, "#8a5a30") +
      P("M-18 0Q-22 -24 -14 -36H14Q22 -24 18 0Z", "#c9a46a") + S("M-14 -28h28M-17 -18h34M-18 -8h36", "#b08a52", 0.8, `stroke-dasharray="2 2"`) +
      R(-16, -38, 32, 5, "#b89058", 2.5) + T(0, -14, "KARTOFFELN", 4.2, "#7a5a30") },
    o_fritteuse: { name: "Fritteuse", der: "die Fritteuse", kat: "kueche", klein: true, w: 36, h: 40, tags: ["essen"], d: () =>
      [[-8, -38], [-5, -36], [-2, -39], [1, -35], [4, -37]].map(([x, y]) => R(x, y, 2.2, -y - 26, "#ffd166", 1)).join("") +
      R(-10, -30, 18, 10, "none", 1.5, `stroke="${METALL_D}" stroke-width="1.4"`) + S("M-10 -25h18M-4 -30v10M2 -30v10", METALL_D, 0.6) + S("M8 -28H16", DUNKEL, 2.4) +
      E(-1, -18, 13, 2, "#f2c14e") + R(-16, -18, 30, 18, "#cfd8e3", 3) + R(-12, -12, 22, 6, "#2d3748", 1.5) + C(-7, -9, 1.4, "#ef5350") + C(-2, -9, 1.4, LEUCHTGRUEN) + R(-16, -2, 30, 2, METALL_D, 1) },
    o_gastroabwasch: { name: "Grosse Abwaschmaschine", der: "die grosse Abwaschmaschine", kat: "kueche", w: 70, h: 112, d: () =>
      S("M18 -106q-2 -3 0 -6", "#cbd5e0", 1.4) + S("M10 -106q2 -3 0 -5", "#cbd5e0", 1.4) +
      R(-30, -104, 60, 56, INOX, 4, `stroke="${INOX_D}" stroke-width="1.5"`) + R(-26, -100, 30, 8, "#2d3748", 2) + C(-21, -96, 1.4, LEUCHTGRUEN) + R(-16, -97.5, 16, 3, "#7cdcff", 1) +
      S("M-20 -84h40M-20 -78h40", INOX_D, 1) + R(-24, -58, 48, 4, METALL_D, 2) +
      R(-35, -48, 70, 6, "#cfd8e3", 2) + R(-33, -42, 66, 38, INOX, 3, `stroke="${INOX_D}" stroke-width="1"`) + R(-29, -38, 58, 30, "#d5dde6", 2) +
      R(-33, -4, 5, 4, METALL_D, 1) + R(28, -4, 5, 4, METALL_D, 1) },
  };

  // Jede Liste: zuerst die eigenen Dinge des Zimmers, dann passende bestehende.
  // Den Koffer gibt es auch in den Zimmern der Gäste (ein Gast will ihn etwa
  // neben dem Schrank). Aus Küche und Wohnzimmer nur wenig ausleihen: Dort
  // müssen mindestens zehn Dinge bleiben, die es nur dort gibt.
  const RAEUME = {
    rezeption: [
      "o_rezeptionstheke", "o_hotelklingel", "o_schluesselfaecher", "o_gepaeckwagen", "o_koffer", "o_reisetasche", "o_prospektstaender",
      "o_lobbysofa", "o_weltuhren", "o_drehtuer", "o_hotelschild", "o_hotellift", "o_gaestebuch", "o_roterteppich",
      "kronleuchter", "telefon", "computer", "grosspflanze", "sessel", "couchtisch",
    ],
    gaestezimmer: [
      "o_hotelbett", "o_schoggikissen", "o_minibar", "o_kofferablage", "o_hotelschrank", "o_nichtstoeren", "o_bademantel",
      "o_flachbildschirm", "o_wandlampe", "o_servierwagen", "o_zimmersafe", "o_teetablett", "o_zimmertuer", "o_hotelfinken",
      "o_koffer", "nachttisch", "schreibtisch", "stuhl", "vorhangfenster", "telefon", "tischlampe",
    ],
    familienzimmer: [
      "o_etagenbett", "o_reisebett", "o_familienbett", "o_sofabett", "o_kinderbadewanne", "o_hochstuhl", "o_babyphone",
      "o_leiterlispiel", "o_sternenlampe", "o_kindertritt", "o_kinderbademantel", "o_malbuch", "o_spielkorb",
      "o_koffer", "spielkiste", "kuscheltier", "kloetze", "sitzsack", "kleiderschrank", "nachttisch", "lichterkette",
    ],
    suite: [
      "o_himmelbett", "o_whirlpoolwanne", "o_sirupkuehler", "o_fluegel", "o_marmorsaeule", "o_fruechtekorb", "o_balkontuer",
      "o_goldspiegel", "o_thronsessel", "o_pralinen", "o_blumenarrangement", "o_suiteschild", "o_perserteppich",
      "o_koffer", "kamin", "kronleuchter", "sessel", "couchtisch", "vorhangfenster", "sideboard", "blumenvase",
    ],
    fruehstueck: [
      "o_buffet", "o_mueeslispender", "o_saftspender", "o_gipfelikorb", "o_grosskaffeemaschine", "o_eierkocher", "o_fruehstueckstisch",
      "o_konfitueren", "o_waffeleisen", "o_fruehstuecksei", "o_kaeseplatte", "o_fruechtesalat", "o_fruehstueckstafel", "o_teekiste",
      "stuhl", "toaster", "milch", "zopf", "honig", "kaffeetasse",
    ],
    wellness: [
      "o_sauna", "o_massageliege", "o_dampfbad", "o_whirlpool", "o_ruheliege", "o_frotteetuecher", "o_duftlampe", "o_teebar",
      "o_bambusbrunnen", "o_steinturm", "o_klangschale", "o_fussbad", "o_saunakuebel", "o_gurkenwasser", "o_orchidee",
      "bambus", "grosspflanze", "handtuch", "lavabo", "spiegel",
    ],
    kinderclub: [
      "o_basteltisch", "o_kletterwuerfel", "o_kostuemkiste", "o_kasperlitheater", "o_malwand", "o_burgzelt", "o_baellebad",
      "o_bastelregal", "o_clubschild", "o_kuschelecke", "o_seifenblasen", "o_handabdruecke", "o_huepfball", "o_holzregenbogen", "o_kinderschminke",
      "kloetze", "puppenhaus", "schaukelpferd", "staffelei", "farbtoepfe",
    ],
    hotelkueche: [
      "o_grossherd", "o_suppentopf", "o_tellerstapel", "o_kuehlraumtuer", "o_ruesttisch", "o_kochmuetze", "o_durchreiche",
      "o_serviceglocke", "o_schoepfkellen", "o_blechwagen", "o_ruehrmaschine", "o_kartoffelsack", "o_fritteuse", "o_gastroabwasch",
      "spuele", "mikrowelle", "teller", "pfanne", "gewuerzregal",
    ],
  };

  // Das Bild an der Wand jedes Zimmers (Bereich x -23..23, y -17..17).
  const MOTIVE = {
    // Die Klingel an der Rezeption, darüber drei Sterne.
    rezeption: () => R(-23, -17, 46, 34, "#5b2333", 2) + stern(-12, -9, 4, GOLD) + stern(0, -11, 4.6, GOLD) + stern(12, -9, 4, GOLD) +
      R(-12, 10, 24, 3, HOLZ_D, 1.5) + P("M-9 10a9 9 0 0 1 18 0z", GOLD) + S("M-5.5 6.5a5.5 5.5 0 0 1 3.5 -3", "#fff1b8", 1.2) + R(-1, -2, 2, 3.4, GOLD_D) + E(0, -2.4, 2.6, 1.2, GOLD_D),
    // Ein Hotelbett unter dem Mond.
    gaestezimmer: () => R(-23, -17, 46, 34, "#2f3b6b", 2) + P("M10 -14a7 7 0 1 0 6 10a5.5 5.5 0 1 1 -6 -10z", "#ffd166") + stern(-14, -10, 2, "#fff6c2") + stern(-4, -13, 1.6, "#fff6c2") + stern(2, -6, 1.4, "#fff6c2") +
      R(-18, -1, 4, 15, HOLZ_D, 1) + R(-14, 6, 32, 5, WEISS, 2) + R(-13, 2, 8, 5, WEISS, 2) + P("M-4 4h19a3 3 0 0 1 3 3v4h-22z", BORDEAUX) + R(-14, 11, 32, 2, "#e2d8ca") + R(-13, 13, 2, 3, DUNKEL) + R(15, 13, 2, 3, DUNKEL),
    // Eine Entenfamilie auf dem Weiher.
    familienzimmer: () => R(-23, -17, 46, 34, "#bfe6f5", 2) + R(-23, 6, 46, 11, "#6cc3d5") + S("M-20 12q3 -2 6 0M8 14q3 -2 6 0", WEISS, 1) +
      E(-8, 5, 9, 5.5, "#ffd166") + C(-1, -3, 4.5, "#ffd166") + P("M3 -3.5l4 1-4 1.4z", "#ff9f43") + C(0, -4, 0.9, TINTE) + S("M-12 3q4 3 8 0", "#f0b93a", 1.2) +
      E(8, 8, 4.5, 3, "#ffe08a") + C(11, 4, 2.6, "#ffe08a") + P("M13.4 3.6l2.4 0.6-2.4 0.9z", "#ff9f43") + C(11.6, 3.4, 0.6, TINTE) +
      E(17, 9, 4, 2.8, "#ffe08a") + C(19.5, 5.5, 2.3, "#ffe08a") + P("M21.6 5.2l2 0.5-2 0.8z", "#ff9f43") + C(20, 5, 0.6, TINTE),
    // Eine goldene Krone.
    suite: () => R(-23, -17, 46, 34, "#5b2333", 2) + P("M-14 8L-17 -8L-7 0L0 -12L7 0L17 -8L14 8Z", GOLD) + R(-14, 8, 28, 4, GOLD_D, 1) +
      C(-7, 4, 1.6, "#ef5350") + C(0, 3, 1.8, "#3a86ff") + C(7, 4, 1.6, "#7cc05e") + C(0, -12, 1.8, GOLD_H) + C(-17, -8, 1.6, GOLD_H) + C(17, -8, 1.6, GOLD_H),
    // Eine Tasse Kaffee und ein Gipfeli.
    fruehstueck: () => R(-23, -17, 46, 34, "#fff6e0", 2) + R(-23, 9, 46, 8, "#ffcf9e") +
      S("M-12 -8q-2 -3 0 -6M-7 -8q-2 -3 0 -6", "#cbd5e0", 1.2) + E(-9, 9, 11, 2, WEISS, `stroke="${RAND}" stroke-width="1"`) + R(-16, -5, 14, 13, WEISS, 3, `stroke="${RAND}" stroke-width="1"`) +
      S("M-2 -2q5 1 0 6", RAND, 1.8) + E(-9, -5, 7, 1.6, "#8a5734") + P("M2 6q10 -16 20 0q-10 5 -20 0z", "#e8a85a") + S("M8 0l1.6 4M12 -1.4v5M16 0l-1.6 4", "#b9773a", 1),
    // Ein Turm aus Steinen und ein Bambusblatt.
    wellness: () => R(-23, -17, 46, 34, "#d8efe6", 2) + R(-23, 12, 46, 5, "#8fd6c8") +
      E(0, 11, 12, 4, "#7c8796") + E(0, 4, 9.5, 3.5, "#9aa5b1") + E(0, -2, 7, 3, "#6b7280") + E(0, -7, 5, 2.5, "#a0aec0") +
      P("M8 -10q10 -8 14 -2q-8 4 -14 2z", "#5cb85c") + P("M-8 -6q-10 -8 -14 -2q8 4 14 2z", "#4aa34a"),
    // Ein Regenbogen zwischen zwei Wolken.
    kinderclub: () => R(-23, -17, 46, 34, "#bfe6f5", 2) +
      ["#ef5350", "#ff9f43", "#ffd166", "#7cc05e", "#3a86ff"].map((f, i) => S(`M${n(-17 + i * 2.6)} 10A${n(17 - i * 2.6)} ${n(17 - i * 2.6)} 0 0 1 ${n(17 - i * 2.6)} 10`, f, 2.6)).join("") +
      C(-16, 10, 4.5, WEISS) + C(-11, 11, 4, WEISS) + C(-20, 12, 3.4, WEISS) + C(16, 10, 4.5, WEISS) + C(11, 11, 4, WEISS) + C(20, 12, 3.4, WEISS),
    // Eine Kochmütze vor Kelle und Gabel.
    hotelkueche: () => R(-23, -17, 46, 34, "#ffe7d6", 2) + S("M-15 14L13 -10", METALL_D, 2) + E(14.6, -11.6, 2.6, 3.6, METALL_D, `transform="rotate(45 14.6 -11.6)"`) +
      S("M15 14L-13 -10M-13 -10l-3 -3M-13 -10l-1 -4M-13 -10l-4 -1", METALL_D, 2) +
      C(-6, -1, 5.5, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(6, -1, 5.5, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(0, -5, 6.5, WEISS, `stroke="${RAND}" stroke-width="1"`) +
      R(-8, 2, 16, 8, WEISS, 2, `stroke="${RAND}" stroke-width="1"`),
  };

  // Wie die neuen Wünsche heissen: "Ich hätte gerne …" und was "Zeig mir" zeigt.
  // Auch für tags, die schon an Dingen hingen, aber noch keinen Satz hatten
  // (schluessel, klingel, tuer, lift, finken).
  const WUENSCHE = {
    minibar: { ein: "eine Minibar", zeige: "o_minibar" },
    koffer: { ein: "einen Koffer", zeige: "o_koffer" },
    bademantel: { ein: "einen Bademantel", zeige: "o_bademantel" },
    schoggi: { ein: "Schoggi auf dem Kissen", zeige: "o_schoggikissen" },
    nichtstoeren: { ein: "ein Schild «Bitte nicht stören»", zeige: "o_nichtstoeren" },
    etagenbett: { ein: "ein Etagenbett", zeige: "o_etagenbett" },
    whirlpool: { ein: "einen Whirlpool", zeige: "o_whirlpool" },
    buffet: { ein: "ein Frühstücksbuffet", zeige: "o_buffet" },
    saft: { ein: "Saft", zeige: "o_saftspender" },
    sauna: { ein: "eine Sauna", zeige: "o_sauna" },
    massage: { ein: "eine Massageliege", zeige: "o_massageliege" },
    kostuem: { ein: "ein Kostüm zum Verkleiden", zeige: "o_kostuemkiste" },
    theater: { ein: "ein Kasperlitheater", zeige: "o_kasperlitheater" },
    schluessel: { ein: "einen Schlüssel", zeige: "o_schluesselfaecher" },
    klingel: { ein: "eine Klingel", zeige: "o_hotelklingel" },
    tuer: { ein: "eine Tür", zeige: "o_drehtuer" },
    lift: { ein: "einen Lift", zeige: "o_hotellift" },
    finken: { ein: "Finken", zeige: "o_hotelfinken" },
  };

  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE, wuensche: WUENSCHE });
})();
