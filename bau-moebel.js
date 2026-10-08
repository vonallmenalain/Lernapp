/*
 * bau-moebel.js – Die Dinge der Bauecke: Möbel, Geräte, Spielsachen, Deko.
 * ---------------------------------------------------------------------------
 * Jedes Ding ist eine kleine SVG-Zeichnung im Stil der Stilprobe
 * (docs/bauecke-stilprobe.html): flache Farben, runde Ecken, ein Hauch
 * Schatten über shade(). Gezeichnet wird in "Zeichen-Einheiten"; im Zimmer
 * wird alles mit MASS vergrössert, damit Tiere und Möbel zueinander passen.
 *
 * Wo der Nullpunkt liegt, sagt die Art:
 *   boden   steht auf dem Boden – Nullpunkt unten in der Mitte, nach oben
 *           negativ. Fällt beim Loslassen auf den Boden oder auf eine Fläche.
 *   wand    hängt an der Wand – Nullpunkt in der Mitte, frei verschiebbar.
 *   decke   hängt an der Decke – Nullpunkt oben in der Mitte.
 *   flach   liegt auf dem Boden (Teppiche) – unter allem anderen.
 *
 *   klein   darf auch auf eine Fläche: auf den Tisch, die Kommode, die Theke.
 *   flaeche Höhe der Oberseite über dem Fuss (negativ) – hier dürfen kleine
 *           Dinge stehen; fx ist der Bereich links und rechts davon.
 *   farbe   die Grundfarbe, wenn sich das Ding umfärben lässt (sonst fehlt sie)
 *   licht   leuchtet in der Nacht
 *   tags    wofür es zählt, wenn ein Tier sich etwas wünscht (bau-katalog.js)
 *   kat     in welcher Schublade es liegt
 *
 * Die Datei zeichnet nur; was wo steht, weiss bau-stand.js, und wie es auf
 * den Bildschirm kommt, train-bau.js.
 */
(() => {
  "use strict";

  // Wie viel grösser die Dinge im Zimmer stehen als gezeichnet.
  const MASS = 1.2;

  function shade(hex, amount) {
    const h = String(hex || "#888888").replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    if (!Number.isFinite(n)) return hex;
    const mix = (c) => {
      const v = amount >= 0 ? c + (255 - c) * amount : c * (1 + amount);
      return Math.max(0, Math.min(255, Math.round(v)));
    };
    const r = mix((n >> 16) & 255);
    const g = mix((n >> 8) & 255);
    const b = mix(n & 255);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  // Kleine Bausteine, damit die Zeichnungen lesbar bleiben.
  const R = (x, y, w, h, fill, rx = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ""} fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
  const C = (cx, cy, r, fill, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
  const E = (cx, cy, rx, ry, fill, extra = "") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
  const P = (d, fill, extra = "") => `<path d="${d}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
  const S = (d, stroke, width, extra = "") => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${extra ? ` ${extra}` : ""}/>`;
  const T = (x, y, text, size, fill, extra = "") => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="${fill}"${extra ? ` ${extra}` : ""}>${text}</text>`;
  const leg = (x, h, c, w = 6) => R(x, -h, w, h, c, 2);

  const HOLZ = "#c88c5c";
  const HOLZ_D = "#a46c43";
  const HOLZ_DD = "#8a5734";
  const METALL = "#9aa5b1";
  const METALL_D = "#6b7280";
  const DUNKEL = "#4a5568";
  const WEISS = "#ffffff";
  const RAND = "#d3e3ec";
  const TINTE = "#243047";
  const BUNT = ["#ff7a7a", "#6cc3d5", "#ffd166", "#7c5ce6", "#7cc05e", "#ff9f6b", "#a78bfa", "#3a86ff"];

  // Bücher in einem Fach, immer gleich verteilt (keine Zufallszahlen: dieselbe
  // Zeichnung auf jedem Gerät).
  function buecherReihe(x0, x1, unten, hoehe, versatz = 0) {
    let s = "";
    let x = x0;
    for (let i = 0; x < x1 - 6; i += 1) {
      const w = 7 + ((i * 7 + versatz * 3) % 5);
      const h = hoehe - ((i * 5 + versatz) % 3) * 4;
      if (x + w > x1) break;
      s += R(x, unten - h, w, h, BUNT[(i + versatz * 3) % BUNT.length], 1.5);
      x += w + 2;
    }
    return s;
  }

  function stern(cx, cy, r, fill) {
    const pts = [];
    for (let i = 0; i < 10; i += 1) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
  }

  // Ein Blumentopf mit Blättern – für mehrere Pflanzen.
  function topf(w, h, c = "#d9734e") {
    return P(`M${-w / 2} ${-h}h${w}l-${w * 0.12} ${h}h-${w * 0.76}z`, c) + R(-w / 2 - 2, -h - 5, w + 4, 7, shade(c, -0.12), 3);
  }

  // ---------------------------------------------------------------------------
  // Die Dinge
  // ---------------------------------------------------------------------------
  const DINGE = {
    // --- Sitzen und Liegen ----------------------------------------------------
    bett: { name: "Bett", der: "das Bett", kat: "sitzen", w: 124, h: 66, farbe: "#7c5ce6", tags: ["bett"], d: (c) =>
      R(-62, -66, 14, 66, HOLZ_D, 6) + R(48, -46, 14, 46, HOLZ_D, 6) +
      R(-50, -30, 100, 18, HOLZ, 4) + leg(-46, 12, HOLZ_DD) + leg(40, 12, HOLZ_DD) +
      R(-50, -44, 100, 16, "#fbf8f2", 7) + R(-47, -56, 30, 14, WEISS, 7) +
      P("M-16 -46h56a8 8 0 0 1 8 8v12h-64z", c) + P("M-16 -46h56a8 8 0 0 1 8 8v2h-64z", shade(c, 0.25)) },
    doppelbett: { name: "Doppelbett", der: "das Doppelbett", kat: "sitzen", w: 150, h: 72, farbe: "#ff8fab", tags: ["bett"], d: (c) =>
      R(-75, -72, 16, 72, HOLZ_D, 7) + R(59, -48, 16, 48, HOLZ_D, 7) +
      R(-62, -30, 124, 18, HOLZ, 4) + leg(-58, 12, HOLZ_DD) + leg(52, 12, HOLZ_DD) +
      R(-62, -46, 124, 18, "#fbf8f2", 8) + R(-58, -59, 28, 14, WEISS, 7) + R(-28, -59, 28, 14, WEISS, 7) +
      P("M2 -48h52a8 8 0 0 1 8 8v12h-60z", c) + P("M2 -48h52a8 8 0 0 1 8 8v2h-60z", shade(c, 0.25)) +
      C(20, -36, 2.5, shade(c, 0.45)) + C(36, -32, 2.5, shade(c, 0.45)) + C(48, -38, 2.5, shade(c, 0.45)) },
    kinderbett: { name: "Kinderbett", der: "das Kinderbett", kat: "sitzen", w: 96, h: 60, farbe: "#6cc3d5", tags: ["bett"], d: (c) =>
      R(-48, -60, 12, 60, "#ffd166", 6) + R(36, -44, 12, 44, "#ffd166", 6) +
      R(-38, -26, 76, 14, "#ffb347", 4) + leg(-34, 12, "#f5a623") + leg(28, 12, "#f5a623") +
      R(-38, -38, 76, 14, "#fbf8f2", 6) + R(-35, -48, 22, 12, WEISS, 6) +
      P("M-10 -40h40a7 7 0 0 1 7 7v9h-47z", c) + stern(12, -32, 5, "#ffd166") },
    hochbett: { name: "Hochbett", der: "das Hochbett", kat: "sitzen", w: 104, h: 128, farbe: "#7cc05e", tags: ["bett"], d: (c) =>
      R(-52, -128, 8, 128, HOLZ_D, 3) + R(44, -128, 8, 128, HOLZ_D, 3) +
      R(-48, -84, 96, 12, HOLZ, 4) + R(-48, -28, 96, 12, HOLZ, 4) +
      R(-44, -96, 88, 12, "#fbf8f2", 6) + R(-42, -106, 22, 11, WEISS, 6) + P("M-16 -98h52a6 6 0 0 1 6 6v8h-58z", c) +
      R(-44, -40, 88, 12, "#fbf8f2", 6) + R(-42, -50, 22, 11, WEISS, 6) + P("M-16 -42h52a6 6 0 0 1 6 6v8h-58z", shade(c, -0.18)) +
      R(-48, -118, 96, 5, HOLZ_D, 2) +
      [-70, -56, -42, -28, -14].map((y) => R(30, y, 14, 4, HOLZ_DD, 2)).join("") + R(28, -84, 4, 84, HOLZ_DD, 2) + R(42, -84, 4, 84, HOLZ_DD, 2) },
    sofa: { name: "Sofa", der: "das Sofa", kat: "sitzen", w: 116, h: 48, farbe: "#ff8a65", tags: ["sofa", "sitz"], d: (c) =>
      R(-52, -48, 104, 28, shade(c, -0.14), 11) + R(-52, -26, 104, 18, c, 6) +
      R(-45, -35, 43, 13, shade(c, 0.14), 6) + R(2, -35, 43, 13, shade(c, 0.14), 6) +
      R(-58, -38, 15, 30, shade(c, -0.05), 7) + R(43, -38, 15, 30, shade(c, -0.05), 7) +
      leg(-46, 8, "#6b4a33") + leg(40, 8, "#6b4a33") },
    ecksofa: { name: "Grosses Sofa", der: "das grosse Sofa", kat: "sitzen", w: 160, h: 50, farbe: "#5bb39a", tags: ["sofa", "sitz"], d: (c) =>
      R(-74, -50, 148, 30, shade(c, -0.14), 12) + R(-74, -26, 148, 18, c, 6) +
      [-66, -20, 26].map((x) => R(x, -36, 42, 13, shade(c, 0.14), 6)).join("") +
      R(-80, -40, 15, 32, shade(c, -0.05), 7) + R(65, -40, 15, 32, shade(c, -0.05), 7) +
      R(-52, -46, 18, 16, "#ffd166", 5) + R(30, -46, 18, 16, "#ff7aa2", 5) +
      leg(-70, 8, "#6b4a33") + leg(64, 8, "#6b4a33") },
    sessel: { name: "Sessel", der: "der Sessel", kat: "sitzen", w: 76, h: 54, farbe: "#5bb39a", tags: ["sofa", "sitz"], d: (c) =>
      R(-30, -54, 60, 32, shade(c, -0.14), 12) + R(-30, -28, 60, 20, c, 6) +
      R(-24, -36, 48, 12, shade(c, 0.16), 6) + R(-38, -40, 15, 32, shade(c, -0.05), 7) + R(23, -40, 15, 32, shade(c, -0.05), 7) +
      leg(-28, 8, "#6b4a33") + leg(22, 8, "#6b4a33") },
    stuhl: { name: "Stuhl", der: "der Stuhl", kat: "sitzen", w: 36, h: 62, farbe: HOLZ, tags: ["stuhl", "sitz"], d: (c) =>
      R(-15, -62, 7, 62, shade(c, -0.18), 3) + R(-15, -31, 31, 7, c, 3) + leg(9, 24, shade(c, -0.18)) + R(-15, -60, 7, 24, c, 3) },
    hocker: { name: "Hocker", der: "der Hocker", kat: "sitzen", w: 30, h: 30, farbe: "#ff7a7a", tags: ["stuhl", "sitz"], flaeche: -30, d: (c) =>
      R(-15, -30, 30, 8, c, 4) + leg(-12, 22, HOLZ_D, 5) + leg(7, 22, HOLZ_D, 5) + R(-11, -12, 22, 3, HOLZ_D, 1.5) },
    sitzsack: { name: "Sitzsack", der: "der Sitzsack", kat: "sitzen", w: 56, h: 40, farbe: "#ff6fa5", tags: ["sitz", "sofa"], d: (c) =>
      P("M-28 0c-4-16 4-38 26-40c20-2 32 16 30 40z", c) + P("M-14 -18c4-10 16-12 24-6c-8 2-14 6-24 6z", shade(c, 0.25)) + E(0, -1, 28, 3, shade(c, -0.25)) },
    schaukelstuhl: { name: "Schaukelstuhl", der: "der Schaukelstuhl", kat: "sitzen", w: 60, h: 66, farbe: HOLZ, tags: ["stuhl", "sitz"], d: (c) =>
      S("M-28 -2q28 8 56 0", shade(c, -0.25), 5) + R(-20, -30, 6, 28, shade(c, -0.18), 2) + R(14, -30, 6, 28, shade(c, -0.18), 2) +
      R(-22, -34, 44, 7, c, 3) + R(-24, -66, 8, 40, c, 3) + R(-20, -62, 4, 30, shade(c, 0.2), 2) + R(-22, -44, 20, 10, "#ff9fb5", 5) },
    bank: { name: "Bank", der: "die Bank", kat: "sitzen", w: 100, h: 36, farbe: HOLZ, tags: ["sitz"], flaeche: -24, d: (c) =>
      R(-50, -24, 100, 8, c, 3) + R(-50, -36, 100, 6, shade(c, -0.1), 3) + leg(-44, 16, shade(c, -0.3)) + leg(38, 16, shade(c, -0.3)) },
    kissen: { name: "Kissen", der: "das Kissen", kat: "sitzen", klein: true, w: 36, h: 22, farbe: "#ffd166", tags: ["kissen"], d: (c) =>
      P("M-17 -2c-3-8 0-18 4-20c10 3 20 3 26 0c4 4 6 12 4 20c-10 3-24 3-34 0z", c) + S("M-8 -12q8 2 16 0", shade(c, -0.2), 1.6) },

    // --- Tische und Schränke --------------------------------------------------
    tisch: { name: "Tisch", der: "der Tisch", kat: "tische", w: 72, h: 46, farbe: HOLZ, tags: ["tisch"], flaeche: -46, d: (c) =>
      R(-36, -46, 72, 8, c, 3) + leg(-30, 38, shade(c, -0.2)) + leg(24, 38, shade(c, -0.2)) },
    esstisch: { name: "Esstisch", der: "der Esstisch", kat: "tische", w: 120, h: 48, farbe: HOLZ, tags: ["tisch"], flaeche: -48, d: (c) =>
      R(-60, -48, 120, 9, c, 3) + R(-56, -39, 112, 4, shade(c, -0.15)) + leg(-54, 35, shade(c, -0.2), 7) + leg(47, 35, shade(c, -0.2), 7) },
    couchtisch: { name: "Salontisch", der: "der Salontisch", kat: "tische", w: 70, h: 26, farbe: HOLZ, tags: ["tisch"], flaeche: -26, d: (c) =>
      R(-35, -26, 70, 7, c, 3) + R(-30, -10, 60, 4, shade(c, -0.15), 2) + leg(-31, 19, shade(c, -0.25), 5) + leg(26, 19, shade(c, -0.25), 5) },
    schreibtisch: { name: "Schreibtisch", der: "der Schreibtisch", kat: "tische", w: 96, h: 50, farbe: HOLZ, tags: ["tisch", "schreibtisch"], flaeche: -50, d: (c) =>
      R(-48, -50, 96, 8, c, 3) + R(14, -42, 30, 42, shade(c, -0.12), 3) + R(18, -36, 22, 13, shade(c, 0.12), 2) + R(18, -19, 22, 13, shade(c, 0.12), 2) +
      C(29, -29, 2, DUNKEL) + C(29, -12, 2, DUNKEL) + leg(-44, 42, shade(c, -0.25)) },
    nachttisch: { name: "Nachttisch", der: "der Nachttisch", kat: "tische", w: 34, h: 36, farbe: HOLZ, tags: ["nachttisch"], flaeche: -36, d: (c) =>
      R(-17, -36, 34, 32, c, 4) + R(-13, -30, 26, 11, shade(c, 0.12), 2) + C(0, -24, 2, DUNKEL) + leg(-15, 4, shade(c, -0.3), 4) + leg(11, 4, shade(c, -0.3), 4) },
    kommode: { name: "Kommode", der: "die Kommode", kat: "tische", w: 70, h: 56, farbe: "#ffffff", tags: ["schrank"], flaeche: -56, d: (c) =>
      R(-35, -56, 70, 50, c, 5, `stroke="${shade(c, -0.18)}" stroke-width="2"`) + [-50, -34, -18].map((y) => R(-30, y, 60, 13, shade(c, -0.06), 3) + R(-6, y + 5, 12, 3, HOLZ_D, 1.5)).join("") +
      leg(-31, 6, HOLZ_DD, 5) + leg(26, 6, HOLZ_DD, 5) },
    kleiderschrank: { name: "Kleiderschrank", der: "der Kleiderschrank", kat: "tische", w: 76, h: 124, farbe: "#f6ead2", tags: ["schrank"], d: (c) =>
      R(-38, -124, 76, 118, c, 5, `stroke="${shade(c, -0.2)}" stroke-width="2"`) + R(-1, -120, 2, 110, shade(c, -0.22)) +
      R(-8, -70, 4, 16, HOLZ_DD, 2) + R(4, -70, 4, 16, HOLZ_DD, 2) + R(-34, -128, 68, 6, shade(c, -0.12), 3) +
      leg(-34, 6, HOLZ_DD, 6) + leg(28, 6, HOLZ_DD, 6) },
    regal: { name: "Regal", der: "das Regal", kat: "tische", w: 80, h: 100, farbe: HOLZ, tags: ["regal", "schrank"], flaeche: -100, d: (c) =>
      R(-40, -100, 6, 100, shade(c, -0.15), 2) + R(34, -100, 6, 100, shade(c, -0.15), 2) +
      [-100, -68, -36, -6].map((y) => R(-40, y, 80, 6, c, 2)).join("") +
      R(-28, -88, 16, 20, "#a8ddf0", 3) + C(6, -78, 9, "#7cc05e") + R(18, -90, 12, 22, "#ffd166", 3) +
      R(-30, -56, 24, 20, "#ff9fb5", 4) + R(2, -54, 28, 18, "#c9b6ff", 4) },
    buecherregal: { name: "Bücherregal", der: "das Bücherregal", kat: "tische", w: 94, h: 108, farbe: "#9a6640", tags: ["buecher", "regal", "schrank"], d: (c) =>
      R(-47, -108, 94, 108, c, 4) + R(-41, -102, 82, 96, "#f3e6d2") + R(-41, -72, 82, 5, c) + R(-41, -39, 82, 5, c) +
      buecherReihe(-39, 39, -72, 30, 0) + buecherReihe(-39, 39, -39, 29, 1) + buecherReihe(-39, 39, -6, 29, 2) },
    sideboard: { name: "Sideboard", der: "das Sideboard", kat: "tische", w: 100, h: 40, farbe: "#4f8ef7", tags: ["schrank"], flaeche: -40, d: (c) =>
      R(-50, -40, 100, 34, c, 4) + R(-46, -36, 30, 26, shade(c, 0.12), 3) + R(-14, -36, 28, 26, shade(c, 0.12), 3) + R(16, -36, 30, 26, shade(c, 0.12), 3) +
      R(-33, -24, 4, 4, WEISS, 2) + R(-2, -24, 4, 4, WEISS, 2) + R(29, -24, 4, 4, WEISS, 2) + leg(-44, 6, DUNKEL, 4) + leg(40, 6, DUNKEL, 4) },
    garderobe: { name: "Garderobe", der: "die Garderobe", kat: "tische", w: 56, h: 120, tags: ["garderobe"], d: () =>
      R(-3, -116, 6, 112, HOLZ_D, 2) + E(0, -3, 20, 4, HOLZ_DD) + R(-24, -118, 48, 6, HOLZ, 3) +
      P("M-22 -112c-6 4-8 20-6 44h14c2-20 0-36-8-44z", "#e8763a") + P("M18 -112c8 4 10 24 8 50h-16c-2-24 0-40 8-50z", "#4f8ef7") +
      C(-4, -106, 7, "#ffd166") + R(-10, -105, 12, 3, "#e8b94f", 1.5) },
    schuhregal: { name: "Schuhregal", der: "das Schuhregal", kat: "tische", w: 60, h: 30, farbe: HOLZ, tags: ["schuhe", "regal"], flaeche: -30, d: (c) =>
      R(-30, -30, 60, 5, c, 2) + R(-30, -14, 60, 4, c, 2) + leg(-30, 30, shade(c, -0.2), 4) + leg(26, 30, shade(c, -0.2), 4) +
      P("M-24 -14v-8h8l6 5v3z", "#ff7a7a") + P("M-6 -14v-8h8l6 5v3z", "#3a86ff") + P("M12 -14v-8h8l6 5v3z", "#ffd166") +
      P("M-22 0v-7h9l5 4v3z", "#7cc05e") + P("M2 0v-7h9l5 4v3z", "#a78bfa") },

    // --- Küche und Essen ------------------------------------------------------
    kochherd: { name: "Kochherd", der: "der Kochherd", kat: "kueche", w: 60, h: 64, tags: ["herd"], flaeche: -64, d: () =>
      R(-30, -64, 60, 64, WEISS, 5, `stroke="${RAND}" stroke-width="2"`) + R(-30, -64, 60, 8, DUNKEL, 3) +
      E(-14, -62, 9, 2.5, "#2d3748") + E(14, -62, 9, 2.5, "#2d3748") +
      [-20, -7, 6, 19].map((x) => C(x, -50, 3, METALL_D)).join("") +
      R(-24, -42, 48, 34, "#2d3748", 4) + R(-20, -38, 40, 26, "#ffb347", 3, `opacity="0.35"`) + R(-16, -46, 32, 3, METALL, 1.5) },
    kuehlschrank: { name: "Kühlschrank", der: "der Kühlschrank", kat: "kueche", w: 54, h: 116, farbe: "#ffffff", tags: ["kuehlschrank"], d: (c) =>
      R(-27, -116, 54, 112, c, 7, `stroke="${shade(c, -0.15)}" stroke-width="2"`) + R(-25, -78, 50, 3, shade(c, -0.18)) +
      R(18, -108, 4, 22, METALL_D, 2) + R(18, -70, 4, 28, METALL_D, 2) +
      C(-12, -96, 5, "#ff7a7a") + R(-4, -100, 10, 8, "#ffd166", 2) + C(-8, -60, 4, "#7cc05e") + leg(-22, 4, DUNKEL, 6) + leg(16, 4, DUNKEL, 6) },
    spuele: { name: "Spülbecken", der: "das Spülbecken", kat: "kueche", w: 70, h: 64, farbe: "#6cc3d5", tags: ["spuele"], flaeche: -48, fx: [6, 34], d: (c) =>
      R(-35, -48, 70, 42, c, 4) + R(-31, -42, 30, 32, shade(c, 0.15), 3) + R(1, -42, 30, 32, shade(c, 0.15), 3) +
      R(-37, -52, 74, 6, "#e2e8f0", 3) + R(-26, -52, 26, 5, "#a0aec0", 2) + S("M-13 -52v-10h8v4", METALL_D, 3) + leg(-31, 6, DUNKEL, 4) + leg(27, 6, DUNKEL, 4) },
    kuechenschrank: { name: "Küchenschrank", der: "der Küchenschrank", kat: "kueche", w: 70, h: 52, farbe: "#ffd166", tags: ["kuechenschrank"], flaeche: -52, d: (c) =>
      R(-35, -48, 70, 42, c, 4) + R(-31, -44, 30, 34, shade(c, 0.15), 3) + R(1, -44, 30, 34, shade(c, 0.15), 3) +
      R(-37, -52, 74, 6, "#e2e8f0", 3) + R(-6, -30, 3, 10, DUNKEL, 1.5) + R(4, -30, 3, 10, DUNKEL, 1.5) + leg(-31, 6, DUNKEL, 4) + leg(27, 6, DUNKEL, 4) },
    haengeschrank: { name: "Hängeschrank", der: "der Hängeschrank", kat: "kueche", art: "wand", w: 70, h: 36, farbe: "#ffd166", tags: ["kuechenschrank"], d: (c) =>
      R(-35, -18, 70, 36, c, 4) + R(-31, -14, 30, 28, shade(c, 0.15), 3) + R(1, -14, 30, 28, shade(c, 0.15), 3) + R(-6, 4, 3, 8, DUNKEL, 1.5) + R(4, 4, 3, 8, DUNKEL, 1.5) },
    dunstabzug: { name: "Dampfabzug", der: "der Dampfabzug", kat: "kueche", art: "wand", w: 56, h: 40, d: () =>
      R(-8, -20, 16, 18, METALL, 2) + P("M-28 20l8-22h40l8 22z", "#cbd5e0") + R(-28, 16, 56, 4, METALL_D, 2) },
    gewuerzregal: { name: "Gewürzregal", der: "das Gewürzregal", kat: "kueche", art: "wand", w: 60, h: 24, d: () =>
      R(-30, 8, 60, 5, HOLZ_D, 2) + [-24, -12, 0, 12].map((x, i) => R(x, -8, 9, 16, ["#ff7a7a", "#ffd166", "#7cc05e", "#ff9f6b"][i], 2) + R(x, -11, 9, 4, DUNKEL, 1.5)).join("") },
    mikrowelle: { name: "Mikrowelle", der: "die Mikrowelle", kat: "kueche", klein: true, w: 36, h: 22, tags: ["kuechengeraet"], d: () =>
      R(-18, -22, 36, 22, "#e2e8f0", 3) + R(-15, -19, 22, 16, "#2d3748", 2) + R(10, -18, 5, 3, "#7cc05e", 1) + C(12.5, -10, 2, METALL_D) + C(12.5, -5, 2, METALL_D) },
    kaffeemaschine: { name: "Kaffeemaschine", der: "die Kaffeemaschine", kat: "kueche", klein: true, w: 22, h: 28, farbe: "#ef5350", tags: ["kuechengeraet", "kaffee"], d: (c) =>
      R(-11, -28, 22, 26, c, 4) + R(-7, -14, 14, 10, "#2d3748", 2) + R(-4, -8, 8, 6, WEISS, 1.5) + C(6, -22, 2, WEISS) + R(-12, -3, 24, 3, DUNKEL, 1.5) },
    toaster: { name: "Toaster", der: "der Toaster", kat: "kueche", klein: true, w: 26, h: 18, farbe: "#a8d8f8", tags: ["kuechengeraet"], d: (c) =>
      R(-9, -22, 7, 8, "#e8b94f", 2) + R(2, -22, 7, 8, "#e8b94f", 2) + R(-13, -16, 26, 16, c, 6) + R(9, -10, 6, 3, DUNKEL, 1.5) },
    wasserkocher: { name: "Wasserkocher", der: "der Wasserkocher", kat: "kueche", klein: true, w: 20, h: 26, tags: ["kuechengeraet"], d: () =>
      P("M-8 -2l2-20h12l2 20z", "#e2e8f0") + S("M8 -20q6 2 4 12", "#9aa5b1", 3) + R(-10, -3, 20, 3, DUNKEL, 1.5) + R(-4, -26, 8, 4, DUNKEL, 2) },
    topf: { name: "Kochtopf", der: "der Kochtopf", kat: "kueche", klein: true, w: 30, h: 22, farbe: "#ef5350", tags: ["geschirr"], d: (c) =>
      R(-12, -18, 24, 18, c, 4) + R(-15, -20, 30, 4, shade(c, -0.15), 2) + R(-17, -14, 5, 3, DUNKEL, 1.5) + R(12, -14, 5, 3, DUNKEL, 1.5) + R(-3, -24, 6, 4, DUNKEL, 2) },
    pfanne: { name: "Pfanne", der: "die Pfanne", kat: "kueche", klein: true, w: 36, h: 12, tags: ["geschirr"], d: () =>
      P("M-16 -8h22l-2 8h-18z", "#2d3748") + R(6, -8, 14, 3, HOLZ_D, 1.5) + E(-6, -8, 8, 2, "#ffd166") + C(-6, -9, 2, "#ff9f43") },
    geschirr: { name: "Geschirr", der: "das Geschirr", kat: "kueche", klein: true, w: 30, h: 16, tags: ["geschirr"], d: () =>
      E(0, -2, 15, 3, WEISS, `stroke="${RAND}" stroke-width="1.5"`) + E(0, -6, 14, 3, "#a8d8f8") + E(0, -10, 13, 3, WEISS, `stroke="${RAND}" stroke-width="1.5"`) + E(0, -14, 12, 3, "#ffb3c7") },
    obstschale: { name: "Früchteschale", der: "die Früchteschale", kat: "kueche", klein: true, w: 34, h: 18, tags: ["fruechte", "essen"], d: () =>
      C(-8, -12, 6, "#ff5c5c") + C(4, -13, 6, "#ffd166") + C(-1, -17, 5, "#7cc05e") + C(10, -10, 5, "#ff9f43") + P("M-17 -9h34q-2 9-17 9t-17-9z", "#6cc3d5") },
    brotkorb: { name: "Brotkorb", der: "der Brotkorb", kat: "kueche", klein: true, w: 32, h: 18, tags: ["brot", "essen"], d: () =>
      E(-4, -12, 11, 6, "#d99a55") + S("M-12 -12q8-4 16 0", "#b9773a", 1.5) + E(6, -11, 8, 5, "#e8b06a") + P("M-16 -9h32l-4 9h-24z", "#c88c5c") + S("M-14 -5h28", HOLZ_D, 1.4) },

    // --- Bad und Wäsche -------------------------------------------------------
    wanne: { name: "Badewanne", der: "die Badewanne", kat: "bad", w: 118, h: 64, farbe: "#ffffff", tags: ["wanne"], d: (c) =>
      R(-42, -11, 8, 11, "#ffd166", 3) + R(34, -11, 8, 11, "#ffd166", 3) +
      R(-56, -46, 112, 37, c, 16, `stroke="${RAND}" stroke-width="2"`) + S("M47 -46v-14h-11", METALL, 5) +
      C(-22, -50, 8, WEISS) + C(-9, -54, 10, WEISS) + C(6, -50, 7, WEISS) +
      C(24, -53, 5.5, "#ffd166") + P("M28.5 -54l6 1-6 2.4z", "#f5a623") + C(25.5, -55, 1.1, TINTE) },
    dusche: { name: "Dusche", der: "die Dusche", kat: "bad", w: 60, h: 140, tags: ["wanne", "dusche"], d: () =>
      R(-30, -8, 60, 8, "#e2e8f0", 3) + R(-28, -136, 56, 128, "#a8d8f8", 4, `opacity="0.35"`) + R(-28, -136, 3, 128, METALL, 1.5) + R(25, -136, 3, 128, METALL, 1.5) +
      R(-30, -140, 60, 5, METALL, 2) + S("M-14 -128v-6h16", METALL_D, 3) + R(-2, -128, 12, 4, METALL_D, 2) +
      [-122, -112, -102].map((y, i) => S(`M${-6 + i * 2} ${y}l-2 7`, "#6cc3d5", 2)).join("") + S("M8 -118l2 7M12 -104l2 7", "#6cc3d5", 2) },
    wc: { name: "WC", der: "das WC", kat: "bad", w: 48, h: 64, tags: ["wc"], d: () =>
      R(4, -64, 17, 30, WEISS, 4, `stroke="${RAND}" stroke-width="2"`) +
      P("M-20 -36h37v6q0 18-16 22h-6v8h-9v-10q-6-6-6-20z", WEISS, `stroke="${RAND}" stroke-width="2"`) + R(-22, -41, 41, 6, "#a8ddf0", 3) },
    lavabo: { name: "Lavabo", der: "das Lavabo", kat: "bad", w: 56, h: 62, tags: ["lavabo"], flaeche: -60, fx: [-26, -16], d: () =>
      R(-6, -42, 12, 42, WEISS, 4, `stroke="${RAND}" stroke-width="2"`) +
      P("M-27 -60h54q-2 18-21 20h-12q-19-2-21-20z", WEISS, `stroke="${RAND}" stroke-width="2"`) + S("M0 -60v-8h8", METALL, 4) },
    spiegel: { name: "Spiegel", der: "der Spiegel", kat: "bad", art: "wand", w: 44, h: 56, tags: ["spiegel"], d: () =>
      E(0, 0, 22, 28, "#c9d9e3") + E(0, 0, 18, 24, "#e6f6fc") + S("M-8 -12l8-8", WEISS, 3) + S("M-4 -4l5-5", WEISS, 2) },
    handtuch: { name: "Tücher", der: "die Tücher", kat: "bad", art: "wand", w: 50, h: 40, farbe: "#ff9fb5", tags: ["handtuch"], d: (c) =>
      R(-25, -20, 50, 4, METALL, 2) + R(-21, -18, 18, 34, c, 3) + R(-21, 8, 18, 3, shade(c, 0.3)) + R(3, -18, 18, 30, "#a8d8f8", 3) + R(3, 4, 18, 3, WEISS) },
    waschmaschine: { name: "Waschmaschine", der: "die Waschmaschine", kat: "bad", w: 56, h: 64, tags: ["waschmaschine"], flaeche: -64, d: () =>
      R(-28, -64, 56, 62, WEISS, 6, `stroke="${RAND}" stroke-width="2"`) + R(-24, -60, 48, 10, "#e2e8f0", 3) + C(14, -55, 3, "#3a86ff") + R(-20, -57, 16, 4, "#7cc05e", 2) +
      C(0, -26, 18, "#cbd5e0") + C(0, -26, 14, "#6cc3d5") + P("M-14 -24q7-6 14 0t14 0v4a14 14 0 0 1-28 0z", "#3a86ff", `opacity="0.6"`) + C(-6, -32, 3, WEISS, `opacity="0.8"`) },
    tumbler: { name: "Tumbler", der: "der Tumbler", kat: "bad", w: 56, h: 64, tags: ["tumbler", "waschmaschine"], flaeche: -64, d: () =>
      R(-28, -64, 56, 62, WEISS, 6, `stroke="${RAND}" stroke-width="2"`) + R(-24, -60, 48, 10, "#e2e8f0", 3) + C(14, -55, 3, "#ff9f43") +
      C(0, -26, 18, "#cbd5e0") + C(0, -26, 14, "#2d3748") + P("M-8 -30q4-6 8 0t8 0", "none", `stroke="#ff9fb5" stroke-width="5" stroke-linecap="round"`) + P("M-8 -20q4-6 8 0t8 0", "none", `stroke="#ffd166" stroke-width="5" stroke-linecap="round"`) },
    waeschekorb: { name: "Wäschekorb", der: "der Wäschekorb", kat: "bad", w: 38, h: 34, tags: ["waesche"], d: () =>
      P("M-14 -30q4-8 12-4q6-6 14 0q6 2 4 6z", "#ff9fb5") + C(-6, -32, 5, "#a8d8f8") + P("M-19 -28h38l-4 28h-30z", "#e2c9a6") + S("M-17 -18h34M-16 -9h32", "#c4a57e", 2) },
    waeschestaender: { name: "Wäscheständer", der: "der Wäscheständer", kat: "bad", w: 80, h: 60, tags: ["waesche"], d: () =>
      S("M-36 0l20-50M36 0l-20-50", METALL, 3) + S("M-30 -46h60M-30 -38h60", METALL_D, 2) +
      R(-26, -46, 14, 22, "#ff7a7a", 2) + R(-8, -46, 16, 26, "#ffd166", 2) + R(12, -46, 14, 18, "#6cc3d5", 2) + C(-19, -48, 2, "#ff9f43") + C(0, -48, 2, "#ff9f43") + C(19, -48, 2, "#ff9f43") },
    buegelbrett: { name: "Bügelbrett", der: "das Bügelbrett", kat: "bad", w: 90, h: 50, tags: ["waesche", "buegeln"], d: () =>
      S("M-24 0l40-42M24 0l-40-42", METALL_D, 3) + P("M-44 -44h70q18 0 18 4t-18 4h-70z", "#a8d8f8") + S("M-38 -42h60", "#6cc3d5", 1.5, `stroke-dasharray="4 4"`) +
      P("M-14 -48h18q4 0 4 4h-26z", "#4f8ef7") + R(-8, -52, 10, 4, DUNKEL, 2) },
    zahnputzbecher: { name: "Zahnbürsten", der: "die Zahnbürsten", kat: "bad", klein: true, w: 16, h: 26, tags: ["zahnbuerste"], d: () =>
      R(-4, -30, 2.5, 16, "#ff7a7a", 1) + R(1, -32, 2.5, 18, "#3a86ff", 1) + P("M-7 -16h14l-2 16h-10z", "#a8d8f8") },
    badteppich: { name: "Badvorleger", der: "der Badvorleger", kat: "bad", art: "flach", w: 70, h: 8, farbe: "#6cc3d5", tags: ["teppich"], d: (c) =>
      R(-35, -6, 70, 6, c, 3) + S("M-30 -3h60", shade(c, 0.3), 1.6, `stroke-dasharray="3 4"`) },

    // --- Spital ---------------------------------------------------------------
    spitalbett: { name: "Spitalbett", der: "das Spitalbett", kat: "spital", w: 130, h: 72, farbe: "#a8d8f8", tags: ["spitalbett", "bett"], d: (c) =>
      R(-62, -72, 6, 62, METALL_D, 2) + R(56, -58, 6, 48, METALL_D, 2) + R(-60, -32, 120, 8, METALL, 3) +
      C(-50, -6, 6, DUNKEL) + C(50, -6, 6, DUNKEL) + R(-52, -26, 4, 16, METALL_D) + R(48, -26, 4, 16, METALL_D) +
      P("M-56 -40h20l10 -12h-30z", WEISS) + R(-56, -44, 112, 12, WEISS, 5) + R(-54, -58, 26, 12, WEISS, 6) +
      P("M-24 -46h76a6 6 0 0 1 6 6v8h-82z", c) + R(-58, -70, 40, 3, METALL, 1.5) },
    liege: { name: "Untersuchungsliege", der: "die Untersuchungsliege", kat: "spital", w: 110, h: 50, farbe: "#7cc05e", tags: ["liege"], flaeche: -40, d: (c) =>
      R(-52, -40, 104, 10, c, 4) + P("M-52 -40l-4-10h24l4 10z", shade(c, -0.1)) + R(-48, -30, 96, 4, METALL) +
      leg(-46, 26, METALL_D, 5) + leg(41, 26, METALL_D, 5) + R(-46, -12, 92, 3, METALL, 1.5) + R(-40, -44, 80, 4, WEISS, 2, `opacity="0.85"`) },
    rollstuhl: { name: "Rollstuhl", der: "der Rollstuhl", kat: "spital", w: 56, h: 56, farbe: "#3a86ff", tags: ["rollstuhl"], d: (c) =>
      C(-6, -22, 21, "none", `stroke="${DUNKEL}" stroke-width="4"`) + C(-6, -22, 3, METALL_D) + S("M-6 -22l12-12", METALL, 2) +
      R(-20, -36, 34, 7, c, 3) + R(-22, -58, 7, 26, c, 3) + S("M-22 -56h-6", DUNKEL, 4) + S("M14 -32l10 26", METALL_D, 3) + C(24, -6, 5, DUNKEL) },
    infusion: { name: "Infusionsständer", der: "der Infusionsständer", kat: "spital", w: 26, h: 110, tags: ["infusion"], d: () =>
      R(-2, -104, 4, 100, METALL, 2) + S("M-12 -2h24M0 -4l-10 4M0 -4l10 4", METALL_D, 3) + R(-12, -106, 24, 3, METALL_D, 1.5) +
      R(-14, -102, 12, 18, "#e6f6fc", 4, `stroke="${RAND}" stroke-width="1.5"`) + R(-12, -94, 8, 8, "#a8d8f8", 2) + S("M-8 -84q-4 20 6 30", "#c9d9e3", 1.5) },
    roentgen: { name: "Röntgengerät", der: "das Röntgengerät", kat: "spital", w: 100, h: 124, tags: ["roentgen"], d: () =>
      R(-50, -6, 100, 6, METALL_D, 3) + R(-46, -124, 12, 118, "#cbd5e0", 3) + R(-40, -100, 60, 14, "#e2e8f0", 4) + R(14, -108, 26, 30, "#a0aec0", 6) +
      C(27, -82, 6, "#ffd166") + R(-30, -70, 76, 46, "#2d3748", 5) + R(-26, -66, 68, 38, "#1a202c", 3) +
      P("M4 -62c-6 0-6 6 0 6v18c-6 0-6 6 0 6h4c6 0 6-6 0-6v-18c6 0 6-6 0-6z", "#e6f6fc") + C(-14, -48, 6, "#e6f6fc", `opacity="0.5"`) + R(-28, -24, 72, 18, "#cbd5e0", 3) },
    roentgenbild: { name: "Röntgenbild", der: "das Röntgenbild", kat: "spital", art: "wand", w: 56, h: 44, licht: true, tags: ["roentgenbild", "bild"], d: () =>
      R(-28, -22, 56, 44, "#e2e8f0", 4) + R(-24, -18, 48, 36, "#1a202c", 2) +
      C(0, -6, 9, "#e6f6fc", `opacity="0.85"`) + R(-3, 2, 6, 14, "#e6f6fc", 2, `opacity="0.85"`) + S("M-12 -4l-6 10M12 -4l6 10", "#e6f6fc", 3, `opacity="0.7"`) + C(-3, -8, 2, "#1a202c") + C(3, -8, 2, "#1a202c") },
    herzmonitor: { name: "Herzmonitor", der: "der Herzmonitor", kat: "spital", w: 40, h: 96, licht: true, tags: ["monitor"], d: () =>
      R(-2, -62, 4, 58, METALL, 2) + S("M-12 -2h24", METALL_D, 3) + C(-10, -2, 3, DUNKEL) + C(10, -2, 3, DUNKEL) +
      R(-20, -96, 40, 34, "#2d3748", 5) + R(-16, -92, 32, 24, "#1a202c", 3) + S("M-14 -80h6l3-8 4 14 3-10 2 4h10", "#7cff9e", 2) + T(9, -71, "♥", 7, "#ff5c7a") },
    empfangstheke: { name: "Empfangstheke", der: "die Empfangstheke", kat: "spital", w: 130, h: 64, farbe: "#6cc3d5", tags: ["theke", "empfang"], flaeche: -64, d: (c) =>
      R(-65, -64, 130, 8, shade(c, 0.25), 4) + R(-62, -56, 124, 56, c, 4) + R(-62, -38, 124, 5, shade(c, -0.15)) + R(-50, -26, 100, 16, shade(c, 0.15), 3) +
      T(0, -13, "EMPFANG", 11, shade(c, -0.45)) },
    medikamentenschrank: { name: "Medikamentenschrank", der: "der Medikamentenschrank", kat: "spital", w: 80, h: 116, tags: ["medikamente", "schrank"], d: () =>
      R(-40, -116, 80, 112, WEISS, 5, `stroke="${RAND}" stroke-width="2"`) + R(-35, -110, 70, 70, "#e6f6fc", 3) +
      [-90, -62].map((y) => R(-35, y, 70, 3, RAND)).join("") +
      [[-28, -104, "#ff7a7a"], [-16, -102, "#ffd166"], [-4, -104, "#7cc05e"], [10, -101, "#a78bfa"], [22, -103, "#ff9f6b"], [-26, -78, "#6cc3d5"], [-12, -80, "#ff7aa2"], [4, -78, "#ffd166"], [18, -80, "#7cc05e"]]
        .map(([x, y, f]) => R(x, y, 9, 14, f, 2) + R(x + 1, y - 3, 7, 4, WEISS, 1.5)).join("") +
      R(-35, -36, 70, 28, "#f1f5f9", 3) + R(-4, -26, 8, 4, METALL_D, 2) + leg(-36, 4, DUNKEL, 6) + leg(30, 4, DUNKEL, 6) },
    mikroskop: { name: "Mikroskop", der: "das Mikroskop", kat: "spital", klein: true, w: 24, h: 32, tags: ["mikroskop", "labor"], d: () =>
      E(0, -2, 12, 3, DUNKEL) + S("M6 -4c0-10-2-16-8-22", "#4a5568", 4) + R(-6, -32, 7, 14, "#4a5568", 2, `transform="rotate(-25 -2 -25)"`) + R(-8, -14, 14, 3, METALL, 1.5) },
    wiege: { name: "Babybettchen", der: "das Babybettchen", kat: "spital", w: 64, h: 52, farbe: "#ffb3c7", tags: ["babybett", "bett"], d: (c) =>
      R(-30, -44, 60, 30, shade(c, 0.4), 8, `stroke="${shade(c, -0.15)}" stroke-width="2"`) + [-20, -10, 0, 10, 20].map((x) => R(x, -42, 2.5, 26, shade(c, -0.1), 1)).join("") +
      R(-24, -34, 22, 12, WEISS, 6) + C(-14, -38, 6, "#ffe0c2") + P("M-8 -36h28v10h-28z", c) + leg(-26, 14, METALL_D, 4) + leg(22, 14, METALL_D, 4) + C(-24, -1, 3, DUNKEL) + C(24, -1, 3, DUNKEL) },
    brutkasten: { name: "Brutkasten", der: "der Brutkasten", kat: "spital", w: 70, h: 70, tags: ["babybett"], d: () =>
      R(-34, -36, 68, 8, "#cbd5e0", 3) + P("M-30 -36v-22q0-10 10-10h40q10 0 10 10v22z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="2" opacity="0.9"`) +
      R(-14, -46, 20, 9, WEISS, 4) + C(-12, -45, 5, "#ffe0c2") + R(-8, -48, 18, 10, "#ffd166", 5) + R(-6, -28, 12, 22, METALL, 2) + R(-26, -6, 52, 6, METALL_D, 3) + C(18, -32, 2.5, "#7cc05e") },
    waage: { name: "Waage mit Messlatte", der: "die Waage", kat: "spital", w: 34, h: 100, tags: ["waage"], d: () =>
      R(-17, -10, 34, 10, "#e2e8f0", 3) + R(-12, -8, 24, 4, "#cbd5e0", 2) + R(10, -100, 5, 92, WEISS, 2, `stroke="${RAND}" stroke-width="1.5"`) +
      [-90, -78, -66, -54, -42, -30].map((y) => R(10, y, 3, 1.4, METALL_D)).join("") + R(-6, -100, 20, 4, METALL_D, 2) + R(-8, -24, 12, 10, "#2d3748", 2) + T(-2, -16, "25", 6, "#7cff9e") },
    sehtest: { name: "Sehtest", der: "die Sehtest-Tafel", kat: "spital", art: "wand", w: 50, h: 70, tags: ["sehtest", "bild"], d: () =>
      R(-25, -35, 50, 70, WEISS, 3, `stroke="${RAND}" stroke-width="2"`) + T(0, -14, "E", 20, TINTE) + T(-8, 6, "F", 11, TINTE) + T(8, 6, "P", 11, TINTE) +
      T(-12, 20, "T", 7, TINTE) + T(-4, 20, "O", 7, TINTE) + T(4, 20, "Z", 7, TINTE) + T(12, 20, "L", 7, TINTE) + T(0, 30, "P E C F D", 4.5, TINTE) },
    erstehilfe: { name: "Erste-Hilfe-Kasten", der: "der Erste-Hilfe-Kasten", kat: "spital", art: "wand", w: 34, h: 30, tags: ["erstehilfe"], d: () =>
      R(-17, -15, 34, 30, "#2f9e5c", 4) + R(-4, -10, 8, 20, WEISS, 1) + R(-10, -4, 20, 8, WEISS, 1) + R(-6, -19, 12, 5, "#2f9e5c", 2) },
    operationstisch: { name: "Operationstisch", der: "der Operationstisch", kat: "spital", w: 120, h: 60, tags: ["operation"], flaeche: -48, d: () =>
      R(-58, -48, 116, 10, "#6cc3d5", 4) + R(-50, -38, 100, 5, METALL) + R(-8, -34, 16, 26, METALL, 3) + R(-30, -8, 60, 8, METALL_D, 3) +
      R(-54, -54, 26, 8, WEISS, 4) + P("M-26 -52h76v6h-76z", "#7cc05e") },
    oplampe: { name: "Operationslampe", der: "die Operationslampe", kat: "spital", art: "decke", w: 90, h: 50, licht: true, tags: ["oplampe", "lampe"], d: () =>
      R(-3, 0, 6, 26, METALL, 2) + R(-30, 22, 60, 6, METALL_D, 3) + E(-22, 34, 16, 9, "#e2e8f0") + E(22, 34, 16, 9, "#e2e8f0") + E(-22, 36, 11, 5, "#fff6c2") + E(22, 36, 11, 5, "#fff6c2") + E(0, 40, 14, 8, "#e2e8f0") + E(0, 42, 9, 4, "#fff6c2") },
    kruecken: { name: "Krücken", der: "die Krücken", kat: "spital", w: 28, h: 88, tags: ["kruecken"], d: () =>
      S("M-8 0l4-80M8 0l-4-80", METALL, 4) + R(-12, -86, 12, 6, "#2d3748", 3) + R(0, -86, 12, 6, "#2d3748", 3) + R(-9, -50, 9, 4, "#2d3748", 2) + R(1, -50, 9, 4, "#2d3748", 2) },
    ultraschall: { name: "Ultraschall", der: "das Ultraschallgerät", kat: "spital", w: 60, h: 96, licht: true, tags: ["ultraschall"], d: () =>
      R(-24, -50, 48, 44, "#e2e8f0", 5) + R(-20, -46, 40, 10, "#cbd5e0", 3) + [-14, -6, 2, 10].map((x) => C(x, -41, 2.2, METALL_D)).join("") +
      R(-4, -66, 8, 18, METALL, 2) + R(-26, -96, 52, 34, "#2d3748", 5) + R(-22, -92, 44, 26, "#1a202c", 3) +
      P("M-10 -70a12 12 0 0 1 20 0z", "#7c8796", `opacity="0.6"`) + C(0, -76, 4, "#a8b3c2", `opacity="0.7"`) + C(-20, -4, 4, DUNKEL) + C(20, -4, 4, DUNKEL) + S("M24 -30q12 6 6 18", "#2d3748", 2) },
    arztkoffer: { name: "Arztkoffer", der: "der Arztkoffer", kat: "spital", klein: true, w: 38, h: 28, tags: ["arztkoffer"], d: () =>
      R(-19, -22, 38, 22, "#8a5734", 5) + S("M-8 -22v-5h16v5", "#5b3a29", 3) + R(-4, -17, 8, 12, WEISS, 1) + R(-9, -13, 18, 4, WEISS, 1) },
    stethoskop: { name: "Stethoskop", der: "das Stethoskop", kat: "spital", klein: true, w: 26, h: 22, tags: ["arztkoffer"], d: () =>
      S("M-8 -20v8q0 8 8 8t8-8v-8", "#2d3748", 2.5) + S("M0 -4v2q0 2 4 2h4", "#2d3748", 2.5) + C(10, -1, 4, METALL) + C(-8, -21, 2, METALL_D) + C(8, -21, 2, METALL_D) },
    reagenzglaeser: { name: "Reagenzgläser", der: "die Reagenzgläser", kat: "spital", klein: true, w: 30, h: 28, tags: ["labor"], d: () =>
      R(-15, -12, 30, 4, HOLZ_D, 1.5) + R(-15, -2, 30, 2, HOLZ_D) + leg(-15, 12, HOLZ_DD, 3) + leg(12, 12, HOLZ_DD, 3) +
      [[-10, "#ff7a7a"], [-3, "#7cc05e"], [4, "#6cc3d5"], [11, "#ffd166"]].map(([x, f]) => R(x - 2.5, -28, 5, 22, "#e6f6fc", 2.5, `stroke="${RAND}" stroke-width="1"`) + R(x - 2.5, -18, 5, 12, f, 2.5)).join("") },
    zentrifuge: { name: "Laborgerät", der: "das Laborgerät", kat: "spital", klein: true, w: 30, h: 26, tags: ["labor"], d: () =>
      R(-15, -20, 30, 20, "#e2e8f0", 5) + E(0, -20, 13, 4, "#cbd5e0") + R(-10, -12, 12, 6, "#2d3748", 2) + C(8, -9, 3, "#7cc05e") },
    paravent: { name: "Paravent", der: "der Paravent", kat: "spital", w: 80, h: 96, farbe: "#a8d8f8", tags: ["paravent"], d: (c) =>
      [-38, -13, 12].map((x, i) => R(x, -92, 24, 84, i === 1 ? shade(c, -0.1) : c, 2) + R(x, -96, 24, 5, METALL, 2)).join("") + leg(-36, 8, METALL_D, 4) + leg(32, 8, METALL_D, 4) },
    gymnastikball: { name: "Gymnastikball", der: "der Gymnastikball", kat: "spital", w: 44, h: 44, farbe: "#a78bfa", tags: ["ball", "sport"], d: (c) =>
      C(0, -22, 22, c) + P("M-16 -34q10-8 22-4", "none", `stroke="${shade(c, 0.35)}" stroke-width="4" stroke-linecap="round"`) },
    barren: { name: "Gehbarren", der: "der Gehbarren", kat: "spital", w: 120, h: 56, tags: ["sport", "physio"], d: () =>
      R(-56, -50, 112, 5, "#cbd5e0", 2.5) + R(-56, -38, 112, 5, METALL, 2.5) + [-54, -10, 34].map((x) => R(x, -50, 5, 50, METALL_D, 2)).join("") + R(-60, -4, 120, 4, "#7cc05e", 2) },
    medikamente: { name: "Medikamente", der: "die Medikamente", kat: "spital", klein: true, w: 26, h: 22, tags: ["medikamente"], d: () =>
      R(-12, -18, 10, 18, "#ff9f43", 2) + R(-12, -21, 10, 4, WEISS, 1.5) + R(1, -14, 12, 14, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + R(3, -10, 8, 4, "#3a86ff", 1) },

    // --- Laden und Restaurant ---------------------------------------------------
    ladentheke: { name: "Ladentheke", der: "die Ladentheke", kat: "laden", w: 120, h: 60, farbe: "#6c5ce7", tags: ["theke"], flaeche: -60, d: (c) =>
      R(-60, -54, 120, 54, c, 6) + R(-60, -60, 120, 9, shade(c, -0.15), 4) + R(-60, -32, 120, 6, shade(c, 0.18)) + stern(-36, -17, 6, "#ffd166") + stern(36, -17, 6, "#ffd166") },
    kasse: { name: "Kasse", der: "die Kasse", kat: "laden", klein: true, w: 44, h: 36, tags: ["kasse"], d: () =>
      R(-22, -16, 44, 16, DUNKEL, 3) + R(-18, -30, 26, 16, "#2d3748", 3) + R(-15, -27, 16, 6, "#a8f0c6", 1.5) + R(10, -36, 8, 22, "#4a5568", 2) +
      [-16, -10, -4].map((x) => R(x, -12, 4, 3, "#cbd5e0", 1)).join("") + R(4, -12, 12, 6, "#cbd5e0", 1.5) },
    warenregal: { name: "Warenregal", der: "das Warenregal", kat: "laden", w: 94, h: 106, tags: ["waren", "regal"], d: () =>
      R(-47, -106, 94, 106, "#b07a4f", 4) + R(-41, -100, 82, 94, "#f6e7d0") + R(-41, -73, 82, 5, "#b07a4f") + R(-41, -42, 82, 5, "#b07a4f") +
      R(-37, -95, 14, 22, "#ff7a7a", 3) + R(-19, -91, 14, 18, "#6cc3d5", 3) + C(7, -82, 9, "#ffd166") + R(21, -97, 15, 24, "#7cc05e", 3) +
      E(-24, -50, 13, 7.5, "#d9a066") + E(1, -50, 13, 7.5, "#c98d55") + E(26, -50, 12, 7.5, "#d9a066") +
      R(-37, -31, 20, 25, "#a78bfa", 3) + R(-13, -29, 20, 23, "#ff9f6b", 3) + R(11, -33, 24, 27, "#6cc3d5", 3) },
    obstkiste: { name: "Früchtekiste", der: "die Früchtekiste", kat: "laden", w: 58, h: 52, tags: ["fruechte", "waren", "essen"], d: () =>
      R(-29, -31, 58, 31, HOLZ, 4) + R(-29, -19, 58, 4, HOLZ_D) +
      C(-16, -35, 8, "#ff5c5c") + C(0, -37, 8, "#7cc05e") + C(16, -35, 8, "#ffb347") + C(-8, -44, 7, "#ff7a7a") + C(9, -45, 7, "#ffd166") },
    gemuesekiste: { name: "Gemüsekiste", der: "die Gemüsekiste", kat: "laden", w: 58, h: 52, tags: ["gemuese", "waren", "essen"], d: () =>
      P("M-20 -32l6-14l6 14z", "#ff9f43") + S("M-14 -46l-3-6M-14 -46l3-7", "#5cb85c", 2.5) + P("M-6 -32l5-16l5 16z", "#ff9f43") + S("M-1 -48v-7", "#5cb85c", 2.5) +
      C(10, -38, 9, "#7cc05e") + C(13, -42, 6, "#9be07a") + C(22, -34, 6, "#ef5350") + R(-29, -31, 58, 31, HOLZ, 4) + R(-29, -19, 58, 4, HOLZ_D) },
    brotregal: { name: "Brotregal", der: "das Brotregal", kat: "laden", w: 90, h: 100, tags: ["brot", "waren", "essen", "baeckerei"], d: () =>
      R(-45, -100, 90, 100, "#b07a4f", 4) + R(-39, -94, 78, 88, "#f6e7d0") + R(-39, -66, 78, 4, "#b07a4f") + R(-39, -36, 78, 4, "#b07a4f") +
      E(-22, -74, 14, 7, "#d99a55") + S("M-30 -74q8-4 16 0", "#b9773a", 1.5) + E(10, -74, 14, 7, "#c98a45") + S("M2 -76l4 4M8 -76l4 4M14 -76l4 4", "#a86a30", 1.5) +
      P("M-34 -42q8-12 16 0q-8 4-16 0z", "#e8b06a") + P("M-14 -42q8-12 16 0q-8 4-16 0z", "#e8b06a") + P("M6 -42q8-12 16 0q-8 4-16 0z", "#e8b06a") +
      P("M-30 -12c0-10 10-12 18-8c8-4 18-2 18 8c0 4-6 6-18 6s-18-2-18-6z", "#d99a55") + S("M-20 -16q6 4 12 0q6 4 12 0", "#b9773a", 1.6) + C(28, -16, 8, "#e8b06a") },
    kuehltheke: { name: "Kühltheke", der: "die Kühltheke", kat: "laden", w: 110, h: 70, tags: ["kuehlschrank", "waren", "essen"], d: () =>
      R(-55, -44, 110, 44, WEISS, 5, `stroke="${RAND}" stroke-width="2"`) + P("M-52 -44l6-26h92l6 26z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="2"`) +
      R(-46, -40, 92, 14, "#cbe9f5", 3) + R(-42, -40, 14, 10, WEISS, 2) + R(-42, -43, 14, 4, "#3a86ff", 1) + P("M-22 -30l12-10h10l-6 10z", "#ffd166") + C(12, -35, 6, "#ffd166") + R(24, -40, 16, 10, "#ff9fb5", 2) +
      R(-46, -20, 92, 4, "#cbd5e0", 2) },
    glacetheke: { name: "Glacevitrine", der: "die Glacevitrine", kat: "laden", w: 90, h: 80, farbe: "#ff9fb5", tags: ["glace", "essen"], d: (c) =>
      R(-45, -46, 90, 46, c, 6) + R(-45, -50, 90, 6, shade(c, -0.15), 3) + P("M-42 -50l6-22h72l6 22z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="2"`) +
      [["#ffd166", -30], ["#ff7aa2", -15], ["#7cc05e", 0], ["#c9b6ff", 15], ["#8a5734", 30]].map(([f, x]) => E(x, -54, 7, 5, f)).join("") + T(0, -18, "GLACE", 11, shade(c, -0.45)) },
    kuchenvitrine: { name: "Kuchenvitrine", der: "die Kuchenvitrine", kat: "laden", w: 90, h: 82, tags: ["kuchen", "essen"], d: () =>
      R(-45, -46, 90, 46, HOLZ_D, 6) + P("M-42 -46l6-36h72l6 36z", "#e6f6fc", `stroke="#a8ddf0" stroke-width="2"`) + R(-38, -66, 76, 3, "#cbd5e0") +
      P("M-30 -66v-8q8-6 16 0v8z", "#ff9fb5") + R(-30, -70, 16, 2, WEISS) + P("M-6 -66l10-10l10 10z", "#ffd166") + P("M18 -66v-7q7-5 14 0v7z", "#8a5734") +
      P("M-28 -48v-8q8-6 16 0v8z", "#7cc05e") + P("M-4 -48l10-10l10 10z", "#ff7a7a") + P("M18 -48v-8q7-5 14 0v8z", "#ffb347") + R(-36, -36, 72, 22, shade(HOLZ_D, 0.15), 3) },
    kleiderstaender: { name: "Kleiderständer", der: "der Kleiderständer", kat: "laden", w: 90, h: 100, tags: ["kleider"], d: () =>
      S("M-40 0v-96h80v96", METALL, 4) + S("M-46 0h12M34 0h12", METALL_D, 4) +
      [[-30, "#ff7a7a"], [-12, "#ffd166"], [6, "#6cc3d5"], [24, "#a78bfa"]].map(([x, f]) => S(`M${x + 6} -96v-4`, METALL_D, 2) + P(`M${x} -92h12l4 10v34h-20v-34z`, f)).join("") },
    schaufensterpuppe: { name: "Schaufensterpuppe", der: "die Schaufensterpuppe", kat: "laden", w: 36, h: 110, farbe: "#ef5350", tags: ["kleider"], d: (c) =>
      R(-2, -26, 4, 22, METALL_D, 2) + E(0, -3, 14, 4, DUNKEL) + C(0, -100, 10, "#f2e3cf") + R(-3, -91, 6, 6, "#f2e3cf") +
      P("M-14 -86h28l4 44h-36z", c) + P("M-16 -44h32l2 18h-36z", shade(c, -0.25)) + S("M-14 -84l-6 30M14 -84l6 30", "#f2e3cf", 5) },
    einkaufswagen: { name: "Einkaufswagen", der: "der Einkaufswagen", kat: "laden", w: 60, h: 60, tags: ["einkaufswagen"], d: () =>
      S("M-30 -54h8l8 34h38l6-26h-50", "#4f8ef7", 4) + S("M-10 -38h40M-8 -30h36", "#4f8ef7", 2) + C(-10, -6, 5, DUNKEL) + C(22, -6, 5, DUNKEL) + S("M-12 -18h36", METALL_D, 3) +
      C(-2, -48, 7, "#7cc05e") + R(6, -54, 10, 14, "#ffd166", 2) + C(20, -46, 6, "#ff7a7a") },
    restauranttisch: { name: "Restauranttisch", der: "der Restauranttisch", kat: "laden", w: 90, h: 52, farbe: "#ef5350", tags: ["tisch", "restaurant"], flaeche: -52, d: (c) =>
      R(-45, -52, 90, 8, WEISS, 3) + P("M-45 -48h90v10l-10 6-10-6-10 6-10-6-10 6-10-6-10 6-10-6-10 6z", c) +
      [-30, -10, 10, 30].map((x) => R(x - 4, -48, 8, 8, WEISS, 1, `opacity="0.85"`)).join("") + R(-3, -38, 6, 38, DUNKEL, 2) + E(0, -2, 16, 3, DUNKEL) },
    barhocker: { name: "Barhocker", der: "der Barhocker", kat: "laden", w: 30, h: 56, farbe: "#ef5350", tags: ["stuhl", "sitz"], d: (c) =>
      E(0, -54, 15, 4, c) + R(-15, -56, 30, 6, c, 3) + R(-2, -50, 4, 46, METALL_D, 2) + E(0, -20, 10, 2, METALL) + E(0, -2, 13, 3, DUNKEL) },
    pizzaofen: { name: "Pizzaofen", der: "der Pizzaofen", kat: "laden", w: 80, h: 96, licht: true, tags: ["ofen", "restaurant"], d: () =>
      R(-40, -40, 80, 40, "#b07a4f", 4) + P("M-38 -40q0-50 38-50t38 50z", "#c96a4a") + P("M-38 -40q0-50 38-50t38 50z", "none", `stroke="#a8553a" stroke-width="3"`) +
      P("M-16 -40v-14a16 16 0 0 1 32 0v14z", "#2d1b14") + P("M-10 -40q2-12 6-6q2-10 6 0q4-8 6 4v2z", "#ff9f43") + R(-6, -98, 12, 18, "#8a5734", 2) +
      [-30, -10, 10].map((x) => R(x, -30, 20, 8, "#a0704a", 2)).join("") },
    menuetafel: { name: "Menütafel", der: "die Menütafel", kat: "laden", art: "wand", w: 60, h: 50, tags: ["menue", "restaurant", "bild"], d: () =>
      R(-30, -25, 60, 50, HOLZ_D, 4) + R(-26, -21, 52, 42, "#2f3b35", 2) + T(0, -8, "MENÜ", 9, "#f4f1ea") +
      S("M-18 0h22M-18 7h16M-18 14h20", "#f4f1ea", 1.6, `opacity="0.8"`) + C(16, 2, 4, "#ffd166") + C(16, 11, 3, "#ff7a7a") },
    blumeneimer: { name: "Blumeneimer", der: "die Blumeneimer", kat: "laden", w: 50, h: 56, tags: ["blumen", "pflanze"], d: () =>
      S("M-14 -26v-22M-10 -26l4-24M2 -26v-20M8 -26l6-22", "#5cb85c", 2.5) +
      C(-14, -50, 6, "#ff7aa2") + C(-6, -52, 6, "#ffd166") + C(2, -48, 6, "#ff7a7a") + C(14, -50, 6, "#a78bfa") + C(-14, -50, 2.5, "#ffd166") + C(14, -50, 2.5, "#ffd166") +
      P("M-24 -26h22l-3 26h-16z", "#9aa5b1") + P("M2 -26h22l-3 26h-16z", "#cbd5e0") },
    blumenstrauss: { name: "Blumenstrauss", der: "der Blumenstrauss", kat: "deko", klein: true, w: 24, h: 40, tags: ["blumen", "pflanze"], d: () =>
      S("M-6 -14l-4-16M0 -14v-20M6 -14l4-16", "#5cb85c", 2) + C(-10, -32, 5, "#ff7aa2") + C(0, -36, 5, "#ffd166") + C(10, -32, 5, "#a78bfa") +
      P("M-9 -16h18l-3 16h-12z", "#6cc3d5") },
    coiffeurstuhl: { name: "Coiffeurstuhl", der: "der Coiffeurstuhl", kat: "laden", w: 52, h: 70, farbe: "#2d3748", tags: ["coiffeur", "sitz"], d: (c) =>
      R(-20, -70, 40, 36, c, 10) + R(-22, -38, 44, 12, c, 6) + R(-26, -44, 8, 18, shade(c, 0.2), 4) + R(18, -44, 8, 18, shade(c, 0.2), 4) +
      R(-4, -26, 8, 20, METALL, 2) + E(0, -3, 18, 4, METALL_D) + R(-10, -16, 20, 3, METALL_D, 1.5) },
    trockenhaube: { name: "Trockenhaube", der: "die Trockenhaube", kat: "laden", w: 56, h: 110, farbe: "#ff9fb5", tags: ["coiffeur"], d: (c) =>
      R(-3, -80, 6, 76, METALL, 2) + E(0, -3, 16, 4, METALL_D) + P("M-26 -82q0-28 26-28t26 28l-6 6h-40z", c) + R(-22, -82, 44, 6, shade(c, -0.2), 3) + C(14, -96, 3, WEISS, `opacity="0.7"`) },
    coiffeurspiegel: { name: "Coiffeurspiegel", der: "der Coiffeurspiegel", kat: "laden", art: "wand", w: 56, h: 80, licht: true, tags: ["spiegel", "coiffeur"], d: () =>
      R(-28, -40, 56, 80, "#2d3748", 6) + R(-22, -34, 44, 68, "#e6f6fc", 3) + S("M-12 -20l14-14M-6 -2l14-14", WEISS, 3) +
      [-30, -14, 2, 18].map((y) => C(-25, y, 3, "#fff6c2") + C(25, y, 3, "#fff6c2")).join("") },
    briefkasten: { name: "Briefkasten", der: "der Briefkasten", kat: "laden", w: 36, h: 62, tags: ["post"], d: () =>
      R(-4, -24, 8, 24, DUNKEL, 2) + R(-18, -62, 36, 40, "#ffcc00", 6) + R(-12, -54, 24, 4, "#2d3748", 2) + P("M-8 -42h16l-8 6z", "#2d3748") + R(-18, -30, 36, 4, "#e6b800") },
    pakete: { name: "Pakete", der: "die Pakete", kat: "laden", w: 56, h: 52, tags: ["post", "pakete"], d: () =>
      R(-26, -24, 30, 24, "#d9a066", 2) + R(-13, -24, 4, 24, "#b9773a") + R(4, -20, 24, 20, "#c98d55", 2) + R(14, -20, 4, 20, "#a86a30") + R(-16, -48, 28, 24, "#e2b27a", 2) + R(-4, -48, 4, 24, "#c4904f") + R(-14, -42, 10, 6, WEISS, 1) },
    velo: { name: "Velo", der: "das Velo", kat: "laden", w: 100, h: 56, farbe: "#ef5350", tags: ["velo"], d: (c) =>
      C(-30, -20, 19, "none", `stroke="${DUNKEL}" stroke-width="4"`) + C(30, -20, 19, "none", `stroke="${DUNKEL}" stroke-width="4"`) + C(-30, -20, 3, METALL_D) + C(30, -20, 3, METALL_D) +
      S("M-30 -20l18-26h30l12 26M-12 -46l14 26h-32M2 -20l16-26", c, 4) + S("M-16 -50h10", "#2d3748", 5) + S("M18 -46l-2-8h8", DUNKEL, 3) },
    werkzeugwand: { name: "Werkzeugwand", der: "die Werkzeugwand", kat: "laden", art: "wand", w: 100, h: 56, tags: ["werkzeug"], d: () =>
      R(-50, -28, 100, 56, "#c88c5c", 4) + [-36, -20, -4, 12, 28, 44].map((x) => [-16, 0, 16].map((y) => C(x - 6, y, 1.4, "#8a5734")).join("")).join("") +
      S("M-38 -18v28", "#ef5350", 4) + R(-44, -22, 12, 7, METALL, 2) + S("M-14 -18l10 26", METALL_D, 3) + C(-14, -19, 5, "none", `stroke="${METALL_D}" stroke-width="3"`) +
      S("M10 -18v24", "#ffd166", 4) + R(7, 2, 6, 10, DUNKEL, 2) + S("M30 -20v30M24 -20h12", "#3a86ff", 4) },
    kaffeetasse: { name: "Tasse", der: "die Tasse", kat: "kueche", klein: true, w: 18, h: 14, farbe: "#ef5350", tags: ["geschirr", "kaffee"], d: (c) =>
      R(-7, -13, 12, 13, c, 3) + S("M5 -10q5 1 0 6", c, 2.5) + E(-1, -13, 6, 1.5, "#8a5734") },
    teller: { name: "Teller mit Essen", der: "der Teller", kat: "kueche", klein: true, w: 36, h: 12, tags: ["geschirr", "essen"], d: () =>
      E(0, -3, 18, 3.5, WEISS, `stroke="${RAND}" stroke-width="1.5"`) + E(-5, -7, 8, 4, "#ffd166") + C(6, -8, 4, "#ef5350") + C(8, -6, 3, "#7cc05e") },

    // --- Spielen und Sport ----------------------------------------------------
    rutsche: { name: "Rutschbahn", der: "die Rutschbahn", kat: "spielen", w: 120, h: 104, farbe: "#ff7a59", tags: ["spielplatz", "rutsche"], d: (c) =>
      R(-56, -98, 6, 98, DUNKEL) + R(-36, -98, 6, 98, DUNKEL) + [-80, -60, -40, -20].map((y) => R(-56, y, 26, 5, METALL_D, 2)).join("") +
      R(-60, -104, 36, 9, "#ffd166", 3) + S("M-26 -96C8 -94 16 -28 56 -9", c, 13) + S("M-26 -100C8 -98 16 -32 56 -13", shade(c, 0.3), 3) },
    schaukel: { name: "Schaukel", der: "die Schaukel", kat: "spielen", w: 100, h: 120, farbe: "#3a86ff", tags: ["spielplatz", "schaukel"], d: (c) =>
      S("M-48 0l12-116M48 0l-12-116", c, 6) + R(-40, -120, 80, 7, shade(c, -0.2), 3) + S("M-14 -114v76M14 -114v76", METALL_D, 2) + R(-20, -40, 40, 7, "#ffd166", 3) },
    sandkasten: { name: "Sandkasten", der: "der Sandkasten", kat: "spielen", w: 120, h: 34, tags: ["spielplatz", "sand"], d: () =>
      P("M-54 -20q54-14 108 0v10h-108z", "#f2d38a") + R(-60, -14, 120, 14, "#c88c5c", 3) + R(-60, -18, 120, 5, "#a46c43", 2) +
      P("M14 -30h10l-2 10h-6z", "#ff7a7a") + S("M19 -30v-6", "#ff7a7a", 2) + P("M-30 -24l8-10l8 10z", "#e8c26e") + R(-40, -26, 10, 6, "#6cc3d5", 2) },
    trampolin: { name: "Trampolin", der: "das Trampolin", kat: "spielen", w: 88, h: 36, tags: ["trampolin", "sport"], d: () =>
      R(-38, -26, 6, 26, DUNKEL) + R(32, -26, 6, 26, DUNKEL) + E(0, -27, 44, 9, "#3a86ff") + E(0, -28, 34, 5.5, TINTE) },
    klettergeruest: { name: "Klettergerüst", der: "das Klettergerüst", kat: "spielen", w: 110, h: 110, farbe: "#7cc05e", tags: ["spielplatz", "klettern"], d: (c) =>
      S("M-52 0v-100M-18 0v-100M18 0v-100M52 0v-100", c, 6) + [-100, -75, -50, -25].map((y) => S(`M-52 ${y}h104`, shade(c, -0.2), 5)).join("") +
      P("M-60 -100h120l-10 -10h-100z", "#ffd166") },
    ball: { name: "Ball", der: "der Ball", kat: "spielen", klein: true, w: 30, h: 30, farbe: "#ff5c7a", tags: ["ball", "spielzeug"], d: (c) =>
      C(0, -15, 15, c) + P("M-15 -15a15 15 0 0 0 30 0z", "#ffd166") + P("M-5 -15a5 15 0 0 0 10 0z", WEISS) + C(-5, -22, 3.4, WEISS, `opacity="0.7"`) },
    spielkiste: { name: "Spielkiste", der: "die Spielkiste", kat: "spielen", w: 66, h: 60, farbe: "#3a86ff", tags: ["spielzeug"], d: (c) =>
      C(-14, -44, 8, "#ff5c7a") + R(2, -58, 7, 20, "#ffd166", 3) + C(18, -42, 6, "#7cc05e") +
      R(-33, -35, 66, 35, c, 5) + R(-35, -41, 70, 10, shade(c, -0.15), 5) + stern(0, -18, 8, "#ffd166") },
    kloetze: { name: "Bauklötze", der: "die Bauklötze", kat: "spielen", klein: true, w: 56, h: 44, tags: ["spielzeug"], d: () => {
      const b = (x, y, c, l) => R(x, y, 21, 21, c, 3) + T(x + 10.5, y + 15.5, l, 14, WEISS);
      return b(-27, -21, "#ff7a7a", "A") + b(-4, -21, "#6cc3d5", "B") + b(-16, -43, "#7c5ce6", "C");
    } },
    schaukelpferd: { name: "Schaukelpferd", der: "das Schaukelpferd", kat: "spielen", w: 72, h: 70, farbe: "#ffd166", tags: ["spielzeug"], d: (c) =>
      S("M-33 -6Q0 7 33 -6", HOLZ_D, 6) + leg(-21, 26, HOLZ_D) + leg(14, 26, HOLZ_D) +
      R(-25, -46, 46, 21, c, 10) + P("M13 -45l8-23h13l-2 15-10 10z", c) + S("M20 -68q-7 10-4 21", "#ff7a59", 5) + C(27, -61, 2.2, TINTE) +
      R(-8, -50, 17, 8, "#ff5c7a", 3) + S("M-25 -40q-10 4-8 16", "#ff7a59", 5) },
    puppenhaus: { name: "Puppenhaus", der: "das Puppenhaus", kat: "spielen", w: 80, h: 86, farbe: "#ff9fb5", tags: ["spielzeug"], d: (c) =>
      P("M-40 -56l40-30l40 30z", shade(c, -0.25)) + R(-36, -56, 72, 56, c, 3) + R(-36, -30, 72, 3, shade(c, -0.2)) +
      R(-30, -52, 24, 20, "#fff6c2", 2) + R(6, -52, 24, 20, "#a8d8f8", 2) + R(-30, -26, 24, 24, "#c5ec9a", 2) + R(6, -26, 24, 24, "#ffd8b8", 2) + C(-18, -40, 4, "#ff7a59") + R(14, -12, 8, 10, HOLZ_D, 2) },
    toeggelikasten: { name: "Töggelikasten", der: "der Töggelikasten", kat: "spielen", w: 110, h: 64, tags: ["spiel", "sport"], d: () =>
      R(-50, -52, 100, 30, HOLZ_D, 4) + R(-46, -48, 92, 22, "#5cbf62", 2) + S("M0 -48v22", WEISS, 1.5) + C(0, -37, 5, "none", `stroke="${WEISS}" stroke-width="1.5"`) +
      [-30, -10, 10, 30].map((x, i) => S(`M${x} -60v44`, METALL, 2) + R(x - 3, -42, 6, 10, i % 2 ? "#ef5350" : "#3a86ff", 2)).join("") +
      leg(-46, 22, HOLZ_DD, 6) + leg(40, 22, HOLZ_DD, 6) },
    basketballkorb: { name: "Basketballkorb", der: "der Basketballkorb", kat: "spielen", art: "wand", w: 56, h: 60, tags: ["basketball", "sport"], d: () =>
      R(-28, -30, 56, 36, WEISS, 3, `stroke="${RAND}" stroke-width="2"`) + R(-12, -18, 24, 16, "none", 1, `stroke="#ef5350" stroke-width="2"`) +
      E(0, 8, 14, 3, "none", `stroke="#ff7a59" stroke-width="3"`) + S("M-12 9l4 20M12 9l-4 20M-4 10l2 20M4 10l-2 20", "#e2e8f0", 1.5) },
    turnmatte: { name: "Turnmatte", der: "die Turnmatte", kat: "spielen", art: "flach", w: 130, h: 10, farbe: "#3a86ff", tags: ["sport", "matte"], d: (c) =>
      R(-65, -10, 130, 10, c, 4) + S("M-22 -10v10M22 -10v10", shade(c, -0.2), 1.5) },
    sprossenwand: { name: "Sprossenwand", der: "die Sprossenwand", kat: "spielen", art: "wand", w: 100, h: 150, tags: ["sport", "klettern"], d: () =>
      R(-50, -75, 8, 150, HOLZ_D, 3) + R(42, -75, 8, 150, HOLZ_D, 3) + R(-4, -75, 8, 150, HOLZ_D, 3) +
      Array.from({ length: 11 }, (_, i) => R(-46, -68 + i * 13.5, 92, 4, HOLZ, 2)).join("") },
    kletterwand: { name: "Kletterwand", der: "die Kletterwand", kat: "spielen", art: "wand", w: 100, h: 150, tags: ["klettern", "sport"], d: () =>
      R(-50, -75, 100, 150, "#c4cbd4", 6) + R(-46, -71, 92, 142, "#d6dbe2", 4) +
      [[-30, -56, "#ef5350"], [10, -60, "#ffd166"], [30, -40, "#3a86ff"], [-16, -32, "#7cc05e"], [16, -14, "#ff9f43"], [-34, -4, "#a78bfa"], [0, 12, "#ef5350"], [28, 22, "#7cc05e"], [-22, 34, "#ffd166"], [8, 52, "#3a86ff"], [-36, 58, "#ff9f43"]]
        .map(([x, y, f]) => P(`M${x - 6} ${y + 4}q0-10 6-10t6 10z`, f)).join("") },
    schwimmbecken: { name: "Schwimmbecken", der: "das Schwimmbecken", kat: "spielen", w: 200, h: 44, tags: ["becken", "wasser"], d: () =>
      R(-100, -34, 200, 34, "#e2e8f0", 6) + R(-94, -30, 188, 30, "#4fb3e8", 4) + P("M-94 -26q12-6 24 0t24 0t24 0t24 0t24 0t24 0t24 0t24 0v4h-188z", "#8fd6f5") +
      S("M-60 -14q8-4 16 0M20 -10q8-4 16 0", WEISS, 2, `opacity="0.6"`) + S("M84 -34v-14h-8", METALL, 3) + S("M90 -34v-14", METALL, 3) + S("M84 -42h6", METALL, 2) },
    sprungbrett: { name: "Sprungbrett", der: "das Sprungbrett", kat: "spielen", w: 92, h: 46, tags: ["sprungbrett"], d: () =>
      R(-46, -36, 26, 36, METALL, 4) + R(-44, -30, 22, 4, "#7c8796") + R(-44, -18, 22, 4, "#7c8796") + R(-46, -45, 92, 9, "#3a86ff", 4.5) },
    liegestuhl: { name: "Liegestuhl", der: "der Liegestuhl", kat: "spielen", w: 80, h: 48, farbe: "#ff9f6b", tags: ["liegestuhl", "sitz"], d: (c) =>
      leg(-34, 15, HOLZ_D) + leg(24, 15, HOLZ_D) + S("M-36 -17H25L37 -44", c, 9) + S("M-36 -17H25L37 -44", WEISS, 3, `stroke-dasharray="8 8"`) },
    rettungsring: { name: "Rettungsring", der: "der Rettungsring", kat: "spielen", art: "wand", w: 40, h: 40, tags: ["rettungsring"], d: () =>
      C(0, 0, 18, "none", `stroke="#ef5350" stroke-width="9"`) + [0, 90, 180, 270].map((a) => C(0, 0, 18, "none", `stroke="${WEISS}" stroke-width="9" stroke-dasharray="7 106" transform="rotate(${a + 20})"`)).join("") },
    leinwand: { name: "Kinoleinwand", der: "die Kinoleinwand", kat: "spielen", art: "wand", w: 180, h: 96, licht: true, tags: ["kino", "bild"], d: () =>
      R(-90, -48, 180, 96, "#2d3748", 4) + R(-84, -42, 168, 84, "#fbf8f2", 2) + R(-84, 6, 168, 36, "#c5ec9a") + C(50, -20, 12, "#ffd166") +
      R(-50, -14, 50, 22, "#ef5350", 4) + R(-20, -24, 18, 14, "#ef5350", 3) + C(-40, 10, 6, TINTE) + C(-12, 10, 6, TINTE) + R(-4, -30, 6, 8, TINTE, 2) + C(4, -38, 5, WEISS, `opacity="0.85"`) },
    kinosessel: { name: "Kinosessel", der: "die Kinosessel", kat: "spielen", w: 120, h: 50, farbe: "#ef5350", tags: ["kinosessel", "sitz"], d: (c) =>
      [-40, 0, 40].map((x) => R(x - 18, -50, 36, 30, shade(c, -0.12), 8) + R(x - 18, -26, 36, 14, c, 5)).join("") + R(-60, -12, 120, 6, DUNKEL, 3) + leg(-56, 6, DUNKEL, 6) + leg(50, 6, DUNKEL, 6) },
    popcorn: { name: "Popcorn", der: "das Popcorn", kat: "essen", klein: true, w: 22, h: 30, tags: ["popcorn", "essen"], d: () =>
      C(-6, -26, 5, "#fff6c2") + C(0, -29, 5, "#fffaf0") + C(6, -26, 5, "#fff6c2") + P("M-10 -24h20l-3 24h-14z", "#ef5350") + R(-4, -24, 4, 24, WEISS) },
    klavier: { name: "Klavier", der: "das Klavier", kat: "spielen", w: 110, h: 96, farbe: "#2d3748", tags: ["klavier", "musik"], flaeche: -96, d: (c) =>
      R(-50, -96, 100, 56, c, 5) + R(-54, -44, 108, 10, c, 3) + R(-50, -42, 100, 7, WEISS) + Array.from({ length: 14 }, (_, i) => R(-48 + i * 7, -42, 1, 7, RAND)).join("") +
      [-46, -39, -25, -18, -11, 3, 10, 24, 31, 38].map((x) => R(x, -42, 4, 4, TINTE)).join("") + R(-46, -34, 6, 34, c, 2) + R(40, -34, 6, 34, c, 2) + R(-20, -84, 40, 18, "#fbf8f2", 2) },
    trommel: { name: "Trommel", der: "die Trommel", kat: "spielen", w: 44, h: 44, farbe: "#ef5350", tags: ["trommel", "musik", "spielzeug"], d: (c) =>
      R(-20, -34, 40, 30, c, 4) + E(0, -34, 20, 5, "#fbf8f2") + S("M-20 -30l10 22l10-22l10 22l10-22", "#ffd166", 2) + E(0, -4, 20, 4, shade(c, -0.2)) + S("M-26 -44l14 8M26 -46l-14 10", HOLZ, 3) },
    gitarre: { name: "Gitarre", der: "die Gitarre", kat: "spielen", w: 34, h: 86, farbe: "#e8763a", tags: ["gitarre", "musik"], d: (c) =>
      S("M-10 0l10-12l10 12", DUNKEL, 3) + R(-3, -86, 6, 46, HOLZ_DD, 2) + C(0, -32, 14, c) + C(0, -18, 16, c) + C(0, -28, 5, TINTE) + R(-6, -14, 12, 3, HOLZ_DD, 1.5) + R(-5, -90, 10, 8, HOLZ_DD, 2) },
    laufband: { name: "Laufband", der: "das Laufband", kat: "spielen", w: 110, h: 80, tags: ["sport", "fitness"], d: () =>
      R(-52, -14, 104, 14, "#2d3748", 6) + R(-48, -16, 96, 5, "#4a5568", 2.5) + S("M36 -14l10-58", METALL, 5) + R(30, -80, 30, 14, DUNKEL, 4) + R(34, -77, 16, 8, "#7cff9e", 2) + S("M38 -66h-14", METALL_D, 4) },
    hantel: { name: "Hantel", der: "die Hantel", kat: "spielen", klein: true, w: 34, h: 14, tags: ["fitness", "sport"], d: () =>
      R(-10, -9, 20, 4, METALL, 2) + R(-17, -14, 8, 14, "#3a86ff", 2) + R(9, -14, 8, 14, "#3a86ff", 2) },
    hometrainer: { name: "Hometrainer", der: "der Hometrainer", kat: "spielen", w: 70, h: 80, farbe: "#7cc05e", tags: ["fitness", "sport", "velo"], d: (c) =>
      R(-30, -8, 60, 8, DUNKEL, 4) + C(-14, -20, 14, c) + C(-14, -20, 5, shade(c, -0.3)) + S("M-14 -20l18-36M4 -56l18 4", DUNKEL, 5) + R(-6, -60, 20, 7, "#2d3748", 3) + S("M22 -52l4-18", DUNKEL, 4) + R(18, -72, 18, 6, DUNKEL, 3) },

    // --- Büro und Lernen --------------------------------------------------------
    buerostuhl: { name: "Bürostuhl", der: "der Bürostuhl", kat: "buero", w: 46, h: 74, farbe: "#3a86ff", tags: ["stuhl", "sitz", "buerostuhl"], d: (c) =>
      R(-16, -74, 32, 34, c, 9) + R(-20, -40, 40, 10, c, 5) + R(-3, -30, 6, 20, METALL_D, 2) +
      S("M-18 -6l18-6l18 6", DUNKEL, 4) + C(-18, -3, 3.5, DUNKEL) + C(18, -3, 3.5, DUNKEL) + C(0, -6, 3.5, DUNKEL) },
    computer: { name: "Computer", der: "der Computer", kat: "buero", klein: true, w: 46, h: 44, licht: true, tags: ["computer"], d: () =>
      R(-22, -44, 44, 30, "#2d3748", 4) + R(-19, -41, 38, 24, "#6cc3d5", 2) + R(-14, -36, 16, 4, WEISS, 1.5, `opacity="0.85"`) + R(-14, -29, 24, 3, WEISS, 1.5, `opacity="0.6"`) +
      R(-4, -14, 8, 8, METALL, 2) + R(-14, -7, 28, 4, METALL_D, 2) + R(-22, -3, 30, 3, "#cbd5e0", 1.5) },
    laptop: { name: "Laptop", der: "der Laptop", kat: "buero", klein: true, w: 38, h: 24, licht: true, tags: ["computer"], d: () =>
      P("M-15 -24h30l3 20h-36z", "#a0aec0") + P("M-13 -22h26l2.5 16h-31z", "#a8d8f8") + R(-19, -4, 38, 4, "#cbd5e0", 2) },
    drucker: { name: "Drucker", der: "der Drucker", kat: "buero", klein: true, w: 50, h: 30, tags: ["drucker"], d: () =>
      R(-22, -38, 30, 14, WEISS, 2, `stroke="${RAND}" stroke-width="1.5"`) + R(-25, -26, 50, 22, "#e2e8f0", 4) + R(-18, -8, 36, 8, "#cbd5e0", 2) + R(-14, -6, 28, 6, WEISS, 1) + C(16, -18, 2.5, "#7cc05e") },
    kopierer: { name: "Kopierer", der: "der Kopierer", kat: "buero", w: 80, h: 96, tags: ["drucker", "kopierer"], d: () =>
      R(-38, -96, 76, 10, "#cbd5e0", 3) + R(-40, -86, 80, 50, "#e2e8f0", 5) + R(-34, -80, 30, 10, "#2d3748", 2) + R(-30, -78, 22, 6, "#7cff9e", 1.5) +
      R(4, -80, 30, 6, "#cbd5e0", 2) + R(-30, -50, 60, 10, WEISS, 2, `stroke="${RAND}" stroke-width="1.5"`) + R(-40, -36, 80, 32, "#cbd5e0", 5) + R(-34, -30, 68, 10, "#e2e8f0", 2) + R(-34, -16, 68, 10, "#e2e8f0", 2) + leg(-36, 4, DUNKEL, 6) + leg(30, 4, DUNKEL, 6) },
    aktenschrank: { name: "Aktenschrank", der: "der Aktenschrank", kat: "buero", w: 60, h: 110, farbe: "#9aa5b1", tags: ["schrank", "akten"], flaeche: -110, d: (c) =>
      R(-30, -110, 60, 106, c, 4) + [-104, -78, -52, -26].map((y) => R(-26, y, 52, 22, shade(c, 0.12), 3) + R(-8, y + 9, 16, 4, DUNKEL, 2) + R(-6, y + 3, 12, 4, WEISS, 1)).join("") + leg(-26, 4, DUNKEL, 6) + leg(20, 4, DUNKEL, 6) },
    whiteboard: { name: "Whiteboard", der: "das Whiteboard", kat: "buero", art: "wand", w: 130, h: 80, tags: ["tafel", "bild"], d: () =>
      R(-65, -40, 130, 80, "#cbd5e0", 4) + R(-61, -36, 122, 72, WEISS, 2) + S("M-50 24l20-18l16 8l22-26l20 12l16-16", "#3a86ff", 3) +
      R(-48, -28, 28, 14, "#ffd166", 2) + R(30, -28, 22, 14, "#ff9fb5", 2) + R(-40, 38, 80, 4, METALL, 2) + R(-20, 34, 14, 4, "#ef5350", 2) + R(0, 34, 14, 4, "#3a86ff", 2) },
    sitzungstisch: { name: "Sitzungstisch", der: "der Sitzungstisch", kat: "buero", w: 180, h: 50, farbe: "#f6ead2", tags: ["tisch"], flaeche: -50, d: (c) =>
      R(-90, -50, 180, 10, c, 5, `stroke="${shade(c, -0.25)}" stroke-width="2"`) + R(-70, -40, 20, 40, shade(c, -0.25), 3) + R(50, -40, 20, 40, shade(c, -0.25), 3) },
    wasserspender: { name: "Wasserspender", der: "der Wasserspender", kat: "buero", w: 38, h: 100, tags: ["wasser", "trinken"], d: () =>
      P("M-14 -100h28v4q0 8-6 10v6h-16v-6q-6-2-6-10z", "#a8d8f8", `opacity="0.9"`) + R(-12, -96, 24, 12, "#6cc3d5", 4, `opacity="0.6"`) +
      R(-18, -80, 36, 76, "#e2e8f0", 5) + R(-6, -64, 12, 10, "#2d3748", 2) + R(-4, -56, 3, 5, "#3a86ff") + R(2, -56, 3, 5, "#ef5350") + R(-10, -40, 20, 4, METALL, 2) + leg(-16, 4, DUNKEL, 6) + leg(10, 4, DUNKEL, 6) },
    kaffeeautomat: { name: "Kaffeeautomat", der: "der Kaffeeautomat", kat: "buero", w: 52, h: 120, licht: true, tags: ["kaffee", "kuechengeraet"], d: () =>
      R(-26, -120, 52, 116, "#2d3748", 6) + R(-20, -112, 40, 40, "#8a5734", 3) + T(0, -88, "☕", 22, WEISS) +
      R(-20, -64, 26, 10, "#7cff9e", 2) + [-56, -48, -40].map((y) => R(10, y, 10, 5, METALL, 2)).join("") + R(-12, -32, 24, 20, "#1a202c", 3) + R(-6, -22, 10, 10, WEISS, 2) + leg(-22, 4, DUNKEL, 6) + leg(16, 4, DUNKEL, 6) },
    pinnwand: { name: "Pinnwand", der: "die Pinnwand", kat: "buero", art: "wand", w: 80, h: 56, tags: ["pinnwand", "bild"], d: () =>
      R(-40, -28, 80, 56, HOLZ_D, 4) + R(-36, -24, 72, 48, "#d9a066", 2) + R(-30, -18, 20, 16, "#ffd166", 1, `transform="rotate(-6 -20 -10)"`) + R(-4, -20, 18, 22, WEISS, 1) +
      R(18, -16, 16, 14, "#ff9fb5", 1, `transform="rotate(5 26 -9)"`) + R(-26, 4, 22, 14, "#a8d8f8", 1) + R(6, 6, 24, 12, "#c5ec9a", 1, `transform="rotate(-4 18 12)"`) +
      C(-20, -16, 2, "#ef5350") + C(5, -18, 2, "#3a86ff") + C(26, -14, 2, "#7cc05e") + C(-15, 6, 2, "#ef5350") + C(18, 8, 2, "#ffd166") },
    serverschrank: { name: "Server", der: "der Server", kat: "buero", w: 60, h: 136, licht: true, tags: ["server", "computer"], d: () =>
      R(-30, -136, 60, 132, "#1f2733", 5) + Array.from({ length: 8 }, (_, i) => {
        const y = -128 + i * 15;
        return R(-24, y, 48, 11, "#2d3748", 2) + C(-17, y + 5.5, 2, i % 3 ? "#7cff9e" : "#ffd166") + C(-11, y + 5.5, 2, i % 2 ? "#7cff9e" : "#3a86ff") + R(-2, y + 4, 22, 3, "#4a5568", 1.5);
      }).join("") + leg(-26, 4, DUNKEL, 6) + leg(20, 4, DUNKEL, 6) },
    ordnerregal: { name: "Ordnerregal", der: "das Ordnerregal", kat: "buero", w: 94, h: 108, tags: ["akten", "regal", "schrank"], d: () =>
      R(-47, -108, 94, 108, "#9aa5b1", 4) + R(-41, -102, 82, 96, "#e2e8f0") + R(-41, -72, 82, 5, "#9aa5b1") + R(-41, -39, 82, 5, "#9aa5b1") +
      [[-102, -72], [-67, -39], [-34, -6]].map(([oben, unten], reihe) => Array.from({ length: 7 }, (_, i) => {
        const x = -39 + i * 11;
        const f = BUNT[(i + reihe * 2) % BUNT.length];
        return R(x, oben + 2, 9, unten - oben - 4, f, 1.5) + C(x + 4.5, unten - 9, 2.4, WEISS);
      }).join("")).join("") },
    telefon: { name: "Telefon", der: "das Telefon", kat: "buero", klein: true, w: 28, h: 16, farbe: "#ef5350", tags: ["telefon"], d: (c) =>
      R(-12, -10, 24, 10, c, 3) + P("M-14 -10q0-8 4-8h20q4 0 4 8h-6v-3h-16v3z", shade(c, -0.2)) + [-6, 0, 6].map((x) => C(x, -5, 1.5, WEISS)).join("") },
    wandtafel: { name: "Wandtafel", der: "die Wandtafel", kat: "buero", art: "wand", w: 126, h: 76, tags: ["tafel", "schule"], d: () =>
      R(-63, -38, 126, 76, HOLZ_D, 6) + R(-57, -32, 114, 62, "#2f5d50", 3) + T(0, 8, "2 + 3 = 5", 24, "#f4f1ea", `opacity="0.92"`) +
      R(-48, 34, 96, 5, HOLZ_DD, 2) + R(24, 30, 12, 4, WEISS, 2) },
    schulpult: { name: "Schulpult", der: "das Schulpult", kat: "buero", w: 64, h: 46, farbe: HOLZ, tags: ["tisch", "pult"], flaeche: -45, d: (c) =>
      R(-32, -45, 64, 7, c, 2) + leg(-27, 38, METALL_D) + leg(21, 38, METALL_D) + R(-26, -36, 52, 10, shade(c, -0.15), 2) },
    globus: { name: "Globus", der: "der Globus", kat: "buero", klein: true, w: 38, h: 54, tags: ["globus", "schule"], d: () =>
      R(-12, -6, 24, 6, HOLZ_D, 2) + R(-2, -22, 4, 16, HOLZ_D) + C(0, -37, 16, "#6cc3d5") +
      P("M-11 -45q6-2 9 4q-2 6-9 6q-4-4 0-10z", "#7cc05e") + P("M4 -35q6-2 8 4q-4 6-8 2z", "#7cc05e") + P("M-17 -37a17 17 0 0 0 34 0", "none", `stroke="${HOLZ_D}" stroke-width="2.4"`) },
    weltkarte: { name: "Weltkarte", der: "die Weltkarte", kat: "buero", art: "wand", w: 110, h: 70, tags: ["bild", "karte", "schule"], d: () =>
      R(-55, -35, 110, 70, HOLZ, 3) + R(-51, -31, 102, 62, "#a8d8f8", 2) +
      P("M-44 -20q8-8 18-4q4 8-2 14q-6 2-8 10q-6 2-8-6q-6-6 0-14z", "#9be07a") + P("M-14 -22q10-6 16 0q2 6-4 8q2 10-4 16q-6-4-6-12q-6-4-2-12z", "#c5ec9a") +
      P("M6 -24q14-6 30 0q8 6 2 12q-8 2-12 8q-6-2-10-8q-12-2-10-12z", "#9be07a") + P("M28 6q8-2 12 4q-2 6-10 6q-4-4-2-10z", "#c5ec9a") + P("M-6 18q10-4 20 0q-4 6-20 0z", "#f4f1ea") },
    buecherwagen: { name: "Bücherwagen", der: "der Bücherwagen", kat: "buero", w: 80, h: 70, farbe: "#ef5350", tags: ["buecher"], d: (c) =>
      R(-38, -58, 76, 6, c, 3) + R(-38, -30, 76, 6, c, 3) + R(-38, -58, 5, 46, shade(c, -0.2), 2) + R(33, -58, 5, 46, shade(c, -0.2), 2) +
      buecherReihe(-32, 32, -58, 22, 4) + buecherReihe(-32, 32, -30, 20, 5) + C(-30, -6, 6, DUNKEL) + C(30, -6, 6, DUNKEL) + R(-36, -14, 72, 3, METALL_D) },
    lesekissen: { name: "Lesekissen", der: "das Lesekissen", kat: "buero", w: 56, h: 26, farbe: "#ffd166", tags: ["kissen", "sitz", "lesen"], d: (c) =>
      P("M-28 0c-2-14 6-26 28-26s30 12 28 26z", c) + S("M-16 -12q16 6 32 0", shade(c, -0.18), 2) + R(-10, -30, 20, 6, "#6cc3d5", 2) + R(-8, -34, 16, 5, "#ff7a7a", 2) },
    zeitungsstaender: { name: "Zeitungsständer", der: "der Zeitungsständer", kat: "buero", w: 44, h: 80, tags: ["zeitung", "lesen"], d: () =>
      S("M-18 0v-76M18 0v-76", METALL_D, 3) + S("M-18 -60h36M-18 -32h36", METALL, 3) +
      R(-14, -76, 28, 18, "#fbf8f2", 1, `stroke="${RAND}" stroke-width="1"`) + R(-10, -72, 12, 4, TINTE) + S("M-10 -64h20", "#9aa5b1", 1.5) +
      R(-14, -48, 28, 18, "#fff1b8", 1) + R(-10, -44, 18, 4, "#ef5350") },
    buecherstapel: { name: "Bücherstapel", der: "der Bücherstapel", kat: "buero", klein: true, w: 30, h: 24, tags: ["buecher", "lesen"], d: () =>
      R(-15, -8, 30, 8, "#ef5350", 2) + R(-13, -15, 26, 7, "#3a86ff", 2) + R(-14, -22, 28, 7, "#ffd166", 2) + R(-11, -6, 22, 2, WEISS, 1) },
    staffelei: { name: "Staffelei", der: "die Staffelei", kat: "buero", w: 60, h: 110, tags: ["malen", "bild"], d: () =>
      S("M-20 0l16-104M20 0l-16-104M0 -104v104", HOLZ_D, 4) + R(-26, -44, 52, 5, HOLZ, 2) +
      R(-24, -96, 48, 52, WEISS, 2, `stroke="${RAND}" stroke-width="1.5"`) + C(10, -82, 7, "#ffd166") + P("M-24 -52l14-18l10 10l12-14l12 22z", "#7cc05e") + S("M-16 -86q4-6 10 0", "#3a86ff", 2) },
    farbtoepfe: { name: "Farbtöpfe", der: "die Farbtöpfe", kat: "buero", klein: true, w: 34, h: 20, tags: ["malen"], d: () =>
      [[-11, "#ef5350"], [0, "#ffd166"], [11, "#3a86ff"]].map(([x, f]) => R(x - 5, -14, 10, 14, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) + R(x - 5, -14, 10, 5, f, 2)).join("") + S("M8 -14l8-12", HOLZ_D, 2) + C(16, -26, 2.4, "#7cc05e") },

    // --- Deko und Licht ---------------------------------------------------------
    pflanze: { name: "Pflanze", der: "die Pflanze", kat: "deko", w: 40, h: 82, tags: ["pflanze"], d: () =>
      P("M-14 -27h28l-4 27h-20z", "#d9734e") + R(-16, -31, 32, 7, "#c2603d", 3) +
      P("M0 -31C-4 -51 -22 -57 -27 -49C-22 -41 -8 -37 0 -31Z", "#5cb85c") + P("M0 -31C4 -55 22 -63 27 -55C22 -45 8 -39 0 -31Z", "#4aa34a") + P("M0 -31C-2 -59 6 -75 2 -82C-8 -71 -8 -47 0 -31Z", "#6cc76a") },
    grosspflanze: { name: "Grosse Pflanze", der: "die grosse Pflanze", kat: "deko", w: 60, h: 130, tags: ["pflanze"], d: () =>
      topf(36, 34, "#e8e1d6") + S("M0 -38v-40M0 -60l-18-24M0 -70l20-30", "#3f8f3f", 3) +
      P("M-18 -84c-22-6-30 12-20 26c8-4 18-12 20-26z", "#4aa34a") + P("M20 -100c22-10 34 8 24 24c-10-2-22-10-24-24z", "#5cb85c") +
      P("M0 -78c-10-24 6-46 14-50c4 16-2 38-14 50z", "#6cc76a") + P("M-2 -58c-26 0-34 18-26 30c12-2 22-14 26-30z", "#5cb85c") },
    bambus: { name: "Bambus", der: "der Bambus", kat: "deko", w: 50, h: 140, tags: ["bambus", "pflanze"], d: () =>
      topf(34, 30, "#c2603d") + [-8, 2, 12].map((x, i) => {
        const top = -136 + i * 10;
        return R(x - 2.5, top, 5, -34 - top, "#7cc05e", 2) + [0.25, 0.5, 0.75].map((t) => R(x - 3, top + (-34 - top) * t, 6, 2.5, "#5a9e3e", 1)).join("") +
          P(`M${x} ${top + 12}q-14-2-18 6q10 2 18-6z`, "#5cb85c") + P(`M${x} ${top + 30}q14-4 18 4q-10 4-18-4z`, "#4aa34a");
      }).join("") },
    kaktus: { name: "Kaktus", der: "der Kaktus", kat: "deko", klein: true, w: 22, h: 32, tags: ["pflanze"], d: () =>
      topf(16, 10, "#d9734e") + R(-4, -32, 8, 20, "#5cb85c", 4) + R(-11, -26, 6, 10, "#5cb85c", 3) + R(5, -28, 6, 9, "#5cb85c", 3) + C(0, -33, 2.5, "#ff7aa2") },
    blumenvase: { name: "Blumenvase", der: "die Blumenvase", kat: "deko", klein: true, w: 24, h: 40, tags: ["blumen", "pflanze"], d: () =>
      S("M0 -16v-14M0 -20l-7-10M0 -20l7-12", "#5cb85c", 2) + C(-7, -31, 4.5, "#ff7aa2") + C(0, -33, 4.5, "#ffd166") + C(7, -33, 4.5, "#ff7a7a") +
      P("M-6 -18h12q4 8 0 18h-12q-4-10 0-18z", "#6cc3d5") },
    bild: { name: "Bild", der: "das Bild", kat: "deko", art: "wand", w: 56, h: 44, tags: ["bild"], d: () =>
      R(-28, -22, 56, 44, HOLZ, 4) + R(-23, -17, 46, 34, "#bfe6f5", 2) + P("M-23 17L-9 1L1 9L11 -3L23 9V17Z", "#7cc05e") + C(11, -8, 4.5, "#ffd166") },
    tierbild: { name: "Familienbild", der: "das Familienbild", kat: "deko", art: "wand", w: 44, h: 52, tags: ["bild"], d: () =>
      R(-22, -26, 44, 52, "#ffd166", 4) + R(-17, -21, 34, 42, "#fff6e0", 2) + C(-6, -2, 8, "#e8763a") + C(8, 0, 7, "#9a6b46") + P("M-10 -12l2-8l4 6z", "#e8763a") + P("M-2 -12l2-8l2 6z", "#e8763a") +
      C(6, -8, 3, "#9a6b46") + C(12, -7, 3, "#9a6b46") + P("M-14 21q6-10 10-10q6 0 8 10z", "#e8763a") + P("M0 21q6-10 8-10q6 0 8 10z", "#9a6b46") },
    poster: { name: "Poster", der: "das Poster", kat: "deko", art: "wand", w: 48, h: 64, farbe: "#c9b6ff", tags: ["bild"], d: (c) =>
      R(-24, -32, 48, 64, c, 2) + [["#ef5350", 22], ["#ff9f43", 18], ["#ffd166", 14], ["#7cc05e", 10], ["#3a86ff", 6]].map(([f, r]) => P(`M${-r} 10a${r} ${r} 0 0 1 ${r * 2} 0`, "none", `stroke="${f}" stroke-width="4"`)).join("") +
      C(-12, 14, 6, WEISS) + C(-6, 14, 7, WEISS) + C(10, 14, 6, WEISS) + stern(12, -20, 5, "#ffd166") },
    uhr: { name: "Uhr", der: "die Uhr", kat: "deko", art: "wand", w: 36, h: 36, farbe: "#ef5350", tags: ["uhr"], d: (c) =>
      C(0, 0, 18, c) + C(0, 0, 14, WEISS) + [0, 90, 180, 270].map((a) => R(-1, -13, 2, 3, TINTE, 0, `transform="rotate(${a})"`)).join("") + S("M0 0v-9M0 0l6 4", TINTE, 2) + C(0, 0, 1.6, TINTE) },
    teppich: { name: "Teppich", der: "der Teppich", kat: "deko", art: "flach", w: 128, h: 14, farbe: "#ff9fb5", tags: ["teppich"], d: (c) =>
      E(0, -2, 64, 9, c) + E(0, -2, 50, 5.5, "none", `stroke="${WEISS}" stroke-width="2" stroke-dasharray="6 5" opacity="0.7"`) },
    laeufer: { name: "Läufer", der: "der Läufer", kat: "deko", art: "flach", w: 110, h: 10, farbe: "#3cc8c8", tags: ["teppich"], d: (c) =>
      R(-55, -8, 110, 8, c, 2) + R(-55, -6, 110, 1.6, WEISS, 0, `opacity="0.7"`) + R(-55, -2.6, 110, 1.6, shade(c, -0.25)) + S("M-58 -7v6M58 -7v6", c, 1.4, `stroke-dasharray="1.5 1.5"`) },
    stehlampe: { name: "Stehlampe", der: "die Stehlampe", kat: "deko", w: 36, h: 112, farbe: "#ffd166", licht: true, tags: ["lampe"], d: (c) =>
      E(0, -3, 14, 4, DUNKEL) + R(-2.5, -88, 5, 86, DUNKEL) + P("M-17 -86L-10 -112H10L17 -86Z", c) + R(-17, -88, 34, 4, shade(c, -0.12), 2) },
    tischlampe: { name: "Tischlampe", der: "die Tischlampe", kat: "deko", klein: true, w: 26, h: 36, farbe: "#ff9fb5", licht: true, tags: ["lampe"], d: (c) =>
      E(0, -2, 9, 2.5, DUNKEL) + R(-1.5, -22, 3, 20, DUNKEL) + P("M-12 -20L-7 -36H7L12 -20Z", c) },
    deckenlampe: { name: "Deckenlampe", der: "die Deckenlampe", kat: "deko", art: "decke", w: 40, h: 54, farbe: "#ffd166", licht: true, tags: ["lampe"], d: (c) =>
      R(-1, 0, 2, 34, DUNKEL) + P("M-20 54q0-20 20-20t20 20z", c) + E(0, 54, 8, 3, "#fff6c2") },
    kronleuchter: { name: "Kronleuchter", der: "der Kronleuchter", kat: "deko", art: "decke", w: 80, h: 60, licht: true, tags: ["lampe"], d: () =>
      R(-1, 0, 2, 22, "#e8b94f") + S("M-34 40q34 16 68 0", "#e8b94f", 3) + S("M0 22v26M-20 34v-8M20 34v-8", "#e8b94f", 2) +
      [-34, -20, 0, 20, 34].map((x) => R(x - 2.5, 30, 5, 10, WEISS, 1.5) + E(x, 27, 2.5, 4, "#ffd166")).join("") + C(0, 52, 4, "#a8d8f8") },
    lichterkette: { name: "Lichterkette", der: "die Lichterkette", kat: "deko", art: "decke", w: 200, h: 24, licht: true, tags: ["lampe", "deko"], d: () =>
      S("M-100 2Q-50 26 0 2T100 2", "#4a5568", 1.6) + [-88, -66, -44, -22, 0, 22, 44, 66, 88].map((x, i) => {
        const y = 2 + Math.abs(Math.sin(((x + 100) / 100) * Math.PI)) * 12;
        return E(x, y + 5, 3.5, 5, ["#ffd166", "#ff7aa2", "#7cc05e", "#6cc3d5"][i % 4]);
      }).join("") },
    girlande: { name: "Girlande", der: "die Girlande", kat: "deko", art: "decke", w: 200, h: 26, tags: ["deko"], d: () =>
      S("M-100 2Q0 22 100 2", "#9aa5b1", 1.4) + [-84, -60, -36, -12, 12, 36, 60, 84].map((x, i) => {
        const y = 2 + (1 - (x / 100) ** 2) * 10;
        return P(`M${x - 8} ${y}h16l-8 14z`, BUNT[i % BUNT.length]);
      }).join("") },
    haengepflanze: { name: "Hängepflanze", der: "die Hängepflanze", kat: "deko", art: "decke", w: 44, h: 64, tags: ["pflanze"], d: () =>
      S("M0 0v20M0 20l-12 14M0 20l12 14", "#9aa5b1", 1.5) + P("M-14 34h28q-2 12-14 12t-14-12z", "#d9734e") +
      S("M-10 40q-8 10-6 22M10 40q8 10 4 20M0 44q0 8-2 16", "#4aa34a", 3) + C(-16, 60, 4, "#5cb85c") + C(14, 58, 4, "#5cb85c") + C(-2, 60, 3.5, "#6cc76a") },
    fenster: { name: "Fenster", der: "das Fenster", kat: "deko", art: "wand", w: 80, h: 90, fenster: true, tags: ["fenster"], d: () =>
      R(-40, -45, 80, 90, WEISS, 4) + R(-34, -39, 68, 78, "#a8ddf0", 2, `class="bau-fensterglas"`) +
      R(-2, -39, 4, 78, WEISS) + R(-34, -2, 68, 4, WEISS) + R(-42, 42, 84, 6, "#e2e8f0", 2) + S("M-26 -28l10-8M14 -28l8-6", WEISS, 2.5, `opacity="0.7"`) },
    rundfenster: { name: "Rundes Fenster", der: "das runde Fenster", kat: "deko", art: "wand", w: 60, h: 60, fenster: true, tags: ["fenster"], d: () =>
      C(0, 0, 30, WEISS) + C(0, 0, 24, "#a8ddf0", `class="bau-fensterglas"`) + R(-2, -24, 4, 48, WEISS) + R(-24, -2, 48, 4, WEISS) + S("M-14 -12l8-6", WEISS, 2.5, `opacity="0.7"`) },
    vorhangfenster: { name: "Fenster mit Vorhang", der: "das Fenster mit Vorhang", kat: "deko", art: "wand", w: 100, h: 100, fenster: true, farbe: "#ff9fb5", tags: ["fenster", "vorhang"], d: (c) =>
      R(-36, -40, 72, 84, WEISS, 4) + R(-31, -35, 62, 74, "#a8ddf0", 2, `class="bau-fensterglas"`) + R(-2, -35, 4, 74, WEISS) + R(-31, 0, 62, 4, WEISS) +
      R(-50, -50, 100, 6, HOLZ_D, 3) + P("M-48 -46h22q-4 30 4 90h-26z", c) + P("M48 -46h-22q4 30-4 90h26z", c) + S("M-40 -40v80M40 -40v80", shade(c, -0.15), 2) },
    kuscheltier: { name: "Kuscheltier", der: "das Kuscheltier", kat: "deko", klein: true, w: 30, h: 34, farbe: "#c88c5c", tags: ["spielzeug", "kuscheltier"], d: (c) =>
      C(-9, -30, 5, c) + C(9, -30, 5, c) + C(0, -24, 11, c) + E(0, -8, 12, 9, c) + E(0, -21, 5, 3.5, shade(c, 0.3)) + C(-4, -27, 1.6, TINTE) + C(4, -27, 1.6, TINTE) + C(0, -22, 1.6, TINTE) + C(-9, -3, 4, shade(c, -0.15)) + C(9, -3, 4, shade(c, -0.15)) },
    aquarium: { name: "Aquarium", der: "das Aquarium", kat: "deko", w: 80, h: 90, licht: true, tags: ["aquarium", "wasser"], d: () =>
      R(-36, -34, 72, 34, HOLZ_D, 4) + R(-38, -86, 76, 52, "#cbe9f5", 4, `stroke="#a8ddf0" stroke-width="3"`) + R(-35, -78, 70, 42, "#6cc3d5", 2, `opacity="0.75"`) +
      P("M-35 -40q12-6 24 0t24 0t22 0v4h-70z", "#f2d38a") + S("M-24 -40q-4-14 2-24M24 -40q4-12-2-20", "#4aa34a", 3) +
      P("M-6 -62q8-8 16 0q-8 8-16 0z", "#ff9f43") + P("M10 -62l6-5v10z", "#ff9f43") + P("M-22 -54q6-6 12 0q-6 6-12 0z", "#ffd166") + P("M-10 -54l5-4v8z", "#ffd166") + C(14, -72, 2, WEISS, `opacity="0.8"`) + C(18, -78, 1.5, WEISS, `opacity="0.8"`) },
    kamin: { name: "Cheminée", der: "das Cheminée", kat: "deko", w: 100, h: 96, licht: true, tags: ["kamin"], flaeche: -96, d: () =>
      R(-50, -96, 100, 10, "#cbd5e0", 3) + R(-44, -86, 88, 86, "#d6c3ae", 3) + [-76, -60, -44, -28, -12].map((y, i) => R(-44, y, 88, 1.5, "#b9a58e") + R(i % 2 ? -14 : 14, y, 1.5, 16, "#b9a58e")).join("") +
      P("M-26 0v-38a26 26 0 0 1 52 0v38z", "#2d1b14") + P("M-14 0q-2-16 6-24q2 10 6 4q4 12 8-4q8 12 2 24z", "#ff9f43") + P("M-6 0q0-10 4-14q2 6 4 2q4 6 2 12z", "#ffd166") + R(-20, -6, 40, 6, "#8a5734", 2) },
    fernseher: { name: "Fernseher", der: "der Fernseher", kat: "deko", klein: true, w: 80, h: 52, licht: true, tags: ["fernseher"], d: () =>
      R(-40, -52, 80, 46, "#2d3748", 4) + R(-36, -48, 72, 38, "#6cc3d5", 2) + R(-36, -24, 72, 14, "#9be07a") + C(18, -38, 6, "#ffd166") + C(-12, -26, 7, "#e8763a") + P("M-17 -32l2-6l4 4z", "#e8763a") +
      R(-4, -6, 8, 4, DUNKEL) + R(-16, -3, 32, 3, DUNKEL, 1.5) },
    radio: { name: "Radio", der: "das Radio", kat: "deko", klein: true, w: 30, h: 22, farbe: "#7cc05e", tags: ["musik"], d: (c) =>
      S("M-8 -18l14-8", METALL_D, 1.5) + R(-15, -18, 30, 18, c, 4) + C(-6, -9, 6, shade(c, -0.3)) + C(-6, -9, 3, shade(c, 0.3)) + R(4, -14, 8, 4, WEISS, 1) + C(8, -5, 2.4, WEISS) },
    wecker: { name: "Wecker", der: "der Wecker", kat: "deko", klein: true, w: 20, h: 22, farbe: "#3a86ff", tags: ["uhr"], d: (c) =>
      C(-6, -19, 3.5, c) + C(6, -19, 3.5, c) + C(0, -10, 9, c) + C(0, -10, 6.5, WEISS) + S("M0 -10v-4M0 -10l3 2", TINTE, 1.4) + S("M-6 -2l-2 2M6 -2l2 2", c, 2) },
    laubhaufen: { name: "Laubhaufen", der: "der Laubhaufen", kat: "deko", w: 64, h: 30, tags: ["laub"], d: () =>
      P("M-32 0q2-22 20-28q12-6 24 0q18 6 20 28z", "#c98a45") + [[-18, -16, "#e8763a"], [-4, -24, "#ffb347"], [10, -18, "#d9734e"], [22, -8, "#ffd166"], [-24, -6, "#ff9f43"], [4, -8, "#a86a30"]]
        .map(([x, y, f]) => E(x, y, 7, 4, f, `transform="rotate(${x} ${x} ${y})"`)).join("") },
    heuballen: { name: "Heuballen", der: "der Heuballen", kat: "deko", w: 72, h: 50, tags: ["heu"], d: () =>
      R(-36, -50, 72, 50, "#f2d38a", 8) + S("M-30 -40h60M-30 -26h60M-30 -12h60", "#d9b25e", 2) + S("M-20 -50v50M20 -50v50", "#c49a46", 3) + S("M-34 -46l-6-4M34 -8l6 3M-30 -2l-6 3", "#e8c26e", 2) },
    hundekorb: { name: "Hundekörbchen", der: "das Hundekörbchen", kat: "deko", w: 70, h: 30, farbe: "#ef5350", tags: ["koerbchen"], d: (c) =>
      P("M-35 0q-2-26 10-28h50q12 2 10 28z", c) + E(0, -14, 26, 9, shade(c, 0.35)) + E(0, -14, 20, 6, "#fbf8f2") + S("M-30 -26h60", shade(c, -0.2), 2) },
    kratzbaum: { name: "Kratzbaum", der: "der Kratzbaum", kat: "deko", w: 50, h: 110, farbe: "#a78bfa", tags: ["kratzbaum"], d: (c) =>
      R(-24, -8, 48, 8, c, 3) + R(-6, -100, 12, 92, "#e2c9a6", 3) + S("M-6 -86h12M-6 -70h12M-6 -54h12M-6 -38h12M-6 -22h12", "#c4a57e", 1.5) +
      R(-20, -64, 40, 7, c, 3) + R(-16, -106, 32, 10, c, 4) + C(12, -52, 5, "#ffd166") + S("M12 -57v-5", "#9aa5b1", 1) },
    kletterfelsen: { name: "Kletterfelsen", der: "der Kletterfelsen", kat: "deko", w: 84, h: 70, farbe: "#a99a86", tags: ["klettern"], d: (c) =>
      P("M-42 0L-34 -38L-14 -60L8 -70L28 -52L42 -20L40 0Z", c) + P("M-34 -38L-14 -60L8 -70L2 -44L-20 -30Z", shade(c, 0.18)) +
      P("M8 -70L28 -52L42 -20L22 -28L2 -44Z", shade(c, -0.12)) + P("M-20 -30L2 -44L22 -28L18 0H-26Z", shade(c, 0.06)) +
      [[-24, -18, "#ffd166"], [-6, -34, "#ef5350"], [14, -16, "#6cc3d5"], [22, -42, "#7cc05e"], [-2, -56, "#ff9f43"]].map(([x, y, f]) => E(x, y, 4, 3, f)).join("") +
      P("M-14 -60l4-6l6 4l-4 6z", "#ffffff", `opacity="0.8"`) + P("M8 -70l4-5l5 4l-4 5z", "#ffffff", `opacity="0.8"`) },
    vogelhaus: { name: "Vogelhäuschen", der: "das Vogelhäuschen", kat: "deko", art: "wand", w: 40, h: 46, tags: ["deko"], d: () =>
      P("M-20 -6l20-18l20 18z", "#ef5350") + R(-16, -6, 32, 28, "#ffd166", 2) + C(0, 4, 6, "#5b3a29") + R(-10, 22, 20, 3, HOLZ_D, 1.5) + C(14, 18, 4, "#6cc3d5") + P("M17 17l4 1-4 2z", "#ff9f43") },

    // --- Leckereien -------------------------------------------------------------
    rueebli: { name: "Rüebli", der: "die Rüebli", kat: "essen", klein: true, w: 36, h: 30, tags: ["rueebli", "essen"], d: () =>
      P("M-12 -18l4-12l4 12z", "#ff9f43") + S("M-8 -30l-3-5M-8 -30l2-6", "#5cb85c", 2) + P("M-2 -18l4-14l4 14z", "#ff8c2a") + S("M2 -32l-2-6M2 -32l3-5", "#5cb85c", 2) + P("M8 -18l4-11l4 11z", "#ff9f43") + S("M12 -29l2-5", "#5cb85c", 2) +
      P("M-17 -18h34l-4 18h-26z", "#c88c5c") + S("M-15 -10h30", HOLZ_D, 1.4) },
    honig: { name: "Honigtopf", der: "der Honigtopf", kat: "essen", klein: true, w: 26, h: 30, tags: ["honig", "essen"], d: () =>
      P("M-11 -22h22q4 10 0 22h-22q-4-12 0-22z", "#ffb020") + R(-12, -26, 24, 6, "#e8b94f", 3) + P("M-12 -20q4 6 8 0t8 0t8 0", "none", `stroke="#ffd166" stroke-width="2.5"`) + R(-6, -14, 12, 7, "#fff6c2", 1) + T(0, -8.5, "HONIG", 3.6, "#8a5734") },
    nuesse: { name: "Nüsse", der: "die Nüsse", kat: "essen", klein: true, w: 32, h: 18, tags: ["nuesse", "essen"], d: () =>
      C(-7, -10, 5, "#a86a30") + C(2, -12, 5, "#c98d55") + C(9, -9, 4.5, "#a86a30") + P("M-16 -8h32q-2 8-16 8t-16-8z", "#7cc05e") },
    kaese: { name: "Käse", der: "der Käse", kat: "essen", klein: true, w: 32, h: 22, tags: ["kaese", "essen"], d: () =>
      P("M-16 0v-12l30-10v22z", "#ffd166") + P("M-16 -12l30-10l2 2l-30 10z", "#ffe08a") + C(-6, -6, 2.5, "#e8b94f") + C(4, -11, 2, "#e8b94f") + C(8, -4, 2.8, "#e8b94f") },
    fisch: { name: "Fisch", der: "der Fisch", kat: "essen", klein: true, w: 40, h: 14, tags: ["fisch", "essen"], d: () =>
      E(0, -2, 20, 3, WEISS, `stroke="${RAND}" stroke-width="1.5"`) + P("M-12 -8q10-8 20 0q-10 8-20 0z", "#6cc3d5") + P("M8 -8l7-5v10z", "#6cc3d5") + C(-8, -9, 1.2, TINTE) },
    melone: { name: "Melone", der: "die Melone", kat: "essen", klein: true, w: 42, h: 32, tags: ["melone", "essen"], d: () =>
      E(0, -15, 20, 15, "#3f9e4a") + S("M-14 -26q4 12 0 22M-4 -30q3 15 0 28M8 -29q-3 14 0 26", "#7cc05e", 2) + P("M6 -4l14-14l4 6z", "#ef5350") },
    beeren: { name: "Beeren", der: "die Beeren", kat: "essen", klein: true, w: 30, h: 16, tags: ["beeren", "essen"], d: () =>
      C(-7, -10, 3.5, "#c2185b") + C(-1, -12, 3.5, "#3949ab") + C(5, -10, 3.5, "#c2185b") + C(1, -7, 3, "#3949ab") + C(-5, -6, 3, "#ef5350") + P("M-14 -6h28q-2 6-14 6t-14-6z", WEISS, `stroke="${RAND}" stroke-width="1"`) },
    knochen: { name: "Knochen", der: "der Knochen", kat: "essen", klein: true, w: 34, h: 12, tags: ["knochen", "essen"], d: () =>
      R(-11, -8, 22, 5, "#f4ead5", 2) + C(-13, -9, 3.5, "#f4ead5") + C(-13, -3, 3.5, "#f4ead5") + C(13, -9, 3.5, "#f4ead5") + C(13, -3, 3.5, "#f4ead5") },
    kuchen: { name: "Kuchen", der: "der Kuchen", kat: "essen", klein: true, w: 38, h: 32, tags: ["kuchen", "essen"], d: () =>
      E(0, -2, 19, 3.5, WEISS, `stroke="${RAND}" stroke-width="1.5"`) + R(-15, -20, 30, 18, "#ffb3c7", 4) + R(-15, -14, 30, 4, "#fff1b8") + P("M-15 -20q4 4 7 0t8 0t8 0t7 0v-2h-30z", WEISS) +
      R(-1, -30, 2.5, 9, "#a8d8f8", 1) + E(0.2, -32, 2, 3, "#ffd166") + C(-8, -22, 2, "#ef5350") + C(8, -22, 2, "#ef5350") },
    pizza: { name: "Pizza", der: "die Pizza", kat: "essen", klein: true, w: 42, h: 10, tags: ["pizza", "essen"], d: () =>
      R(-21, -3, 42, 3, HOLZ_D, 1.5) + E(0, -5, 18, 3.5, "#e8b06a") + E(0, -6, 15, 2.6, "#ef5350") + C(-7, -6.5, 2, "#ffd166") + C(5, -6.8, 2.2, "#ffd166") + C(0, -5.8, 1.6, "#5cb85c") },
    gipfeli: { name: "Gipfeli", der: "die Gipfeli", kat: "essen", klein: true, w: 34, h: 16, tags: ["brot", "essen"], d: () =>
      E(0, -2, 17, 3, WEISS, `stroke="${RAND}" stroke-width="1.5"`) + P("M-14 -6q6-10 12 0q-6 3-12 0z", "#e8a85a") + P("M0 -6q6-10 12 0q-6 3-12 0z", "#d9973f") + S("M-10 -9l2 3M-6 -10v4M4 -9l2 3M8 -10v4", "#b9773a", 1) },
    aepfel: { name: "Äpfel", der: "die Äpfel", kat: "essen", klein: true, w: 36, h: 26, tags: ["fruechte", "essen", "aepfel"], d: () =>
      C(-7, -14, 7, "#ef5350") + C(7, -14, 7, "#7cc05e") + C(0, -20, 6.5, "#ff7a7a") + S("M0 -26l1-4", "#8a5734", 1.6) + P("M-17 -10h34l-4 10h-26z", "#c88c5c") },
    glace: { name: "Glace", der: "die Glace", kat: "essen", klein: true, w: 16, h: 34, tags: ["glace", "essen"], d: () =>
      P("M-6 -16h12l-6 16z", "#e8b06a") + S("M-4 -12l6 8M2 -14l-4 8", "#c98a45", 1) + C(0, -20, 6, "#ff9fb5") + C(-2, -27, 5, "#ffd166") + C(1, -31, 2, "#ef5350") },
    milch: { name: "Milch", der: "die Milch", kat: "essen", klein: true, w: 18, h: 30, tags: ["milch", "essen"], d: () =>
      P("M-8 -24l8-6l8 6v24h-16z", WEISS, `stroke="${RAND}" stroke-width="1.5"`) + R(-8, -18, 16, 8, "#3a86ff") + T(0, -12, "MILCH", 3.4, WEISS) },
    zopf: { name: "Zopf", der: "der Zopf", kat: "essen", klein: true, w: 38, h: 18, tags: ["brot", "essen"], d: () =>
      E(-10, -8, 9, 7, "#d99a55") + E(0, -9, 9, 8, "#c98a45") + E(10, -8, 9, 7, "#d99a55") + S("M-14 -12q4 4 8 0q4 4 8 0q4 4 8 0", "#a86a30", 1.6) + C(-4, -12, 1, "#fff1b8") + C(6, -12, 1, "#fff1b8") },
  };

  // Die Schubladen. Die erste ("passt") füllt train-bau.js je Zimmer.
  const KATEGORIEN = [
    { id: "sitzen", name: "Sitzen und Liegen", icon: "🛋️" },
    { id: "tische", name: "Tische und Schränke", icon: "🗄️" },
    { id: "kueche", name: "Küche", icon: "🍳" },
    { id: "bad", name: "Bad und Wäsche", icon: "🛁" },
    { id: "spital", name: "Spital", icon: "🩺" },
    { id: "laden", name: "Laden und Restaurant", icon: "🛒" },
    { id: "spielen", name: "Spielen und Sport", icon: "⚽" },
    { id: "buero", name: "Büro und Lernen", icon: "💻" },
    { id: "deko", name: "Deko und Licht", icon: "🪴" },
    { id: "essen", name: "Leckereien", icon: "🥕" },
  ];

  // ---------------------------------------------------------------------------
  // Dinge je Zimmer
  // ---------------------------------------------------------------------------
  // Jede Zimmerart hat ihre eigenen Dinge – im Eingang steht kein Bett, im
  // Schlafzimmer keine Dusche. Welche, steht in RAUM_DINGE (gefüllt von den
  // Dateien bau-moebel-<haus>.js über dazu()). Nur wenige Dinge gibt es
  // überall: Licht, ein Bild, eine Pflanze, ein Fenster, eine Uhr, ein Teppich.
  // Das Bild zeigt, was zum Zimmer passt (MOTIVE): im Spital ein Herz, in der
  // Bibliothek ein Buch.
  const UEBERALL = ["deckenlampe", "stehlampe", "bild", "fenster", "pflanze", "uhr", "teppich"];
  const RAUM_DINGE = {};
  const MOTIVE = {};

  // Das Bild an der Wand: ein Rahmen, darin das Motiv des Zimmers. Ein Motiv
  // zeichnet in den Bereich -23..23 mal -17..17 (die Mitte ist 0, 0).
  const MOTIV_STANDARD = () => R(-23, -17, 46, 34, "#bfe6f5", 2) + P("M-23 17L-9 1L1 9L11 -3L23 9V17Z", "#7cc05e") + C(11, -8, 4.5, "#ffd166");
  DINGE.bild.d = (c, raum) => {
    let motiv = "";
    try { motiv = (MOTIVE[raum] || MOTIV_STANDARD)(c); } catch { motiv = MOTIV_STANDARD(); }
    return R(-28, -22, 56, 44, HOLZ, 4) + R(-23, -17, 46, 34, "#fffaf0", 2) + motiv + R(-23, -17, 46, 34, "none", 2, `stroke="${HOLZ_D}" stroke-width="1"`);
  };

  // Ergänzt, was jede Zeichnung braucht, an einer Stelle: die Art (boden ist
  // der Normalfall), den Bereich der Fläche und den Namen mit Artikel.
  function ergaenze(id, ding) {
    ding.id = id;
    ding.art = ding.art || "boden";
    ding.tags = ding.tags || [];
    if (typeof ding.flaeche === "number" && !ding.fx) ding.fx = [-ding.w / 2 + 4, ding.w / 2 - 4];
    return ding;
  }
  Object.entries(DINGE).forEach(([id, ding]) => ergaenze(id, ding));

  // Weitere Dinge, die Zimmerlisten und die Bildmotive aus bau-moebel-<haus>.js.
  // Eine Kennung gibt es nur einmal: Wer eine schon vergebene noch einmal
  // bringt, wird übergangen (und validate-bau.mjs meldet es).
  const doppelt = [];
  function dazu({ dinge = {}, raeume = {}, motive = {} } = {}) {
    Object.entries(dinge).forEach(([id, ding]) => {
      if (DINGE[id]) { doppelt.push(id); return; }
      DINGE[id] = ergaenze(id, ding);
    });
    Object.entries(raeume).forEach(([raum, ids]) => {
      const liste = RAUM_DINGE[raum] || (RAUM_DINGE[raum] = []);
      ids.forEach((id) => { if (!liste.includes(id)) liste.push(id); });
    });
    Object.assign(MOTIVE, motive);
  }

  // Die Zeichnung eines Dings, mit seiner Farbe (oder der Grundfarbe). Das
  // Zimmer braucht nur das Bild – für sein Motiv.
  function zeichne(id, farbe = null, raum = "") {
    const ding = DINGE[id];
    if (!ding) return "";
    try { return ding.d(farbe || ding.farbe || "#7c5ce6", raum); } catch { return ""; }
  }

  // Wie viel Platz ein Ding im Zimmer braucht (in Zimmer-Einheiten, mit MASS
  // und der Grösse des Kindes s): links, oben, rechts, unten um den Nullpunkt.
  function umriss(id, s = 1) {
    const ding = DINGE[id];
    if (!ding) return { x0: 0, y0: 0, x1: 0, y1: 0 };
    const k = MASS * s;
    const w = (ding.w * k) / 2;
    if (ding.art === "wand") return { x0: -w, y0: (-ding.h * k) / 2, x1: w, y1: (ding.h * k) / 2 };
    if (ding.art === "decke") return { x0: -w, y0: 0, x1: w, y1: ding.h * k };
    return { x0: -w, y0: -ding.h * k, x1: w, y1: 0 };
  }

  // Die Bausteine für die Dateien bau-moebel-<haus>.js – damit alle Dinge im
  // selben Stil gezeichnet sind.
  const hilfe = { R, C, E, P, S, T, leg, stern, topf, buecherReihe, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE, BUNT };

  window.LernappBauMoebel = { MASS, DINGE, KATEGORIEN, UEBERALL, RAUM_DINGE, MOTIVE, doppelt, dazu, zeichne, umriss, shade, stern, hilfe };
})();
