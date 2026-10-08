/*
 * bau-moebel-dome.js – Die eigenen Dinge des KiddyDome (Bauecke, Haus Dorf):
 * eine Spielhalle über zwei Stockwerke mit Rutschen, Klettertürmen,
 * Sprungschloss, Trampolin, Seilen zum Hangeln und einem Mini-Lift.
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerliste und das Bildmotiv an.
 *
 * Die Halle ist doppelt so hoch wie ein Zimmer: von der Fusslinie bis zur
 * Decke etwa 405 Zeichen-Einheiten (ein Tier ist etwa 90 hoch). Darum dürfen
 * die grossen Geräte hier bis 240 breit und 380 hoch sein.
 *
 * Alle Plattformen liegen auf denselben zwei Ebenen (MITTE und OBEN), damit
 * Turm, Rutschen, Feuerwehrstange und Mini-Lift nebeneinander zusammenpassen.
 * Über OBEN bleibt Platz für ein Tier bis unter die Hallendecke – darum gibt
 * es dort keine Dächer, nur Wimpel und Kugeln auf den Pfosten.
 * Die Kabine des Mini-Lifts ist unten gezeichnet, in einer eigenen Gruppe
 * (bau-minilift-kabine, ohne transform). train-bau.js fährt sie ab und zu um
 * 280 hinauf (LIFT_HUB) und wieder hinunter: Oben steht ihr Boden genau auf OBEN.
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, stern, shade, METALL, METALL_D, DUNKEL, WEISS, TINTE } = M.hilfe;

  // Gerundet auf eine Stelle, damit berechnete Punkte kurz bleiben.
  const n = (v) => Math.round(v * 10) / 10;

  // Die Farben der Spielhalle.
  const ROT = "#ef5350";
  const GELB = "#ffd166";
  const BLAU = "#3a86ff";
  const GRUEN = "#7cc05e";
  const ORANGE = "#ff9f43";
  const PINK = "#ff6fa5";
  const VIOLETT = "#7c5ce6";
  const TUERKIS = "#3cc8c8";
  const GOLD = "#e8b94f";
  const SEIL = "#d9b25e";
  const SEIL_D = "#b9903e";
  const GLAS = "#d6f0fb";
  const NACHT = "#34508f";
  const MATTE = "#4f8ef7";
  const BUNTE = [ROT, GELB, BLAU, GRUEN, ORANGE, PINK, VIOLETT, TUERKIS];

  // Die zwei Ebenen der Halle (Oberkante der Plattformen). OBEN ist zugleich
  // der Halt der Lift-Kabine: ihr Boden liegt unten auf -12, oben auf -12 - 280.
  const MITTE = -146;
  const OBEN = -292;

  // --- Bausteine der Geräte ---------------------------------------------------
  // Ein Pfosten mit Glanzstreifen: Mitte x, von y0 (unten) bis y1 (oben).
  const pfosten = (x, y0, y1, b = 10, f = BLAU) =>
    R(n(x - b / 2), y1, b, y0 - y1, f, n(b / 2)) + R(n(x - b / 2 + 1.8), y1 + 4, 2, y0 - y1 - 8, shade(f, 0.4), 1);
  // Ein Schaumstoff-Polster um einen Pfosten, Oberkante y.
  const polster = (x, y, b = 14, h = 16, f = GELB) =>
    R(n(x - b / 2), y, b, h, f, 4) + R(n(x - b / 2 + 2.2), y + 2.5, 2.4, h - 5, shade(f, 0.45), 1.2);
  // Eine Plattform von x0 bis x1, Oberkante y.
  const deck = (x0, x1, y, f = ORANGE, dicke = 9) =>
    R(x0, y, x1 - x0, dicke, f, 3) + R(x0 + 2, y + 1, x1 - x0 - 4, 2.4, shade(f, 0.4), 1.2) + R(x0 + 2, y + dicke - 2.6, x1 - x0 - 4, 2.6, shade(f, -0.22), 1.3);
  // Ein Geländer auf y, h hoch, mit Stäben.
  const gelaender = (x0, x1, y, h = 30, f = BLAU) => {
    let staebe = "";
    for (let x = x0 + 7; x < x1 - 3; x += 7) staebe += `M${n(x)} ${y}V${y - h}`;
    return S(staebe, shade(f, 0.5), 1.8) + S(`M${x0} ${y}V${y - h}H${x1}V${y}`, f, 3.6);
  };
  // Sprossen zwischen x0 und x1, von y0 (unten) bis y1 (oben).
  const sprossen = (x0, x1, y0, y1, abstand = 18, f = GELB, dicke = 4.4) => {
    let d = "";
    for (let y = y0 - abstand; y > y1 + 6; y -= abstand) d += `M${x0} ${y}H${x1}`;
    return S(d, f, dicke);
  };
  // Ein Seilnetz mit Rauten im Rechteck x0..x1, y1 (oben)..y0 (unten): die
  // Seile laufen schräg, an den Kreuzungen sitzen Knoten.
  const rautennetz = (x0, x1, y0, y1, dx, dy, f = ROT, knoten = GELB, dicke = 2.8) => {
    const mitte = (x0 + x1) / 2;
    const q = dx / dy;
    const hoehe = y0 - y1;
    let d = `M${x0} ${y1}H${x1}V${y0}H${x0}Z`;
    for (let c = mitte - Math.ceil((hoehe * q + mitte - x0) / dx) * dx; c < x1; c += dx) {
      const ya = Math.max(y1, y1 + (x0 - c) / q);
      const yb = Math.min(y0, y1 + (x1 - c) / q);
      if (yb - ya < 1) continue;
      const xa = c + (ya - y1) * q;
      const xb = c + (yb - y1) * q;
      d += `M${n(xa)} ${n(ya)}L${n(xb)} ${n(yb)}M${n(2 * mitte - xa)} ${n(ya)}L${n(2 * mitte - xb)} ${n(yb)}`;
    }
    let k = "";
    for (let p = 1; y1 + (p * dy) / 2 < y0 - 2; p += 1) {
      for (let m = -20; m <= 20; m += 1) {
        const x = mitte + (m * dx) / 2;
        if ((m + p) % 2 || x <= x0 + 2 || x >= x1 - 2) continue;
        k += C(n(x), n(y1 + (p * dy) / 2), 2.8, knoten);
      }
    }
    return S(d, f, dicke) + k;
  };
  // Eine Wimpelkette zwischen zwei Pfosten, in der Mitte durch tief.
  const wimpel = (x0, x1, y, durch = 8) => {
    const anzahl = Math.max(2, Math.round((x1 - x0) / 18));
    let fahnen = "";
    for (let i = 0; i < anzahl; i += 1) {
      const t = (i + 0.5) / anzahl;
      const x = n(x0 + (x1 - x0) * t);
      const y0 = n(y + 4 * durch * t * (1 - t));
      fahnen += P(`M${n(x - 5)} ${y0}h10l-5 10z`, BUNTE[(i * 3) % BUNTE.length]);
    }
    return S(`M${x0} ${y}Q${n((x0 + x1) / 2)} ${y + 2 * durch} ${x1} ${y}`, DUNKEL, 1.2) + fahnen;
  };
  // Eine Kugel oben auf einem Pfosten.
  const kappe = (x, y, f = ROT, r = 7) => C(x, y, r, f) + C(n(x - r * 0.3), n(y - r * 0.3), n(r * 0.3), shade(f, 0.5));
  // Ein Griff an der Kletterwand: Hügel, Knauf oder Stern, mit Schraube.
  const griff = (x, y, f, art = 0, r = 8) => {
    const schraube = C(x, n(y - r * 0.3), 1.3, shade(f, -0.4));
    if (art === 1) return C(x, y, n(r * 0.85), shade(f, -0.18)) + C(x, n(y - 1), n(r * 0.7), f) + schraube;
    if (art === 2) return stern(x, y, n(r * 1.1), f) + schraube;
    return P(`M${n(x - r)} ${n(y + r * 0.6)}q0-${n(r * 1.7)} ${r}-${n(r * 1.7)}t${r} ${n(r * 1.7)}z`, f) +
      R(n(x - r), n(y + r * 0.6 - 2), r * 2, 2, shade(f, -0.25), 1) + schraube;
  };
  // Ein Punkt auf einer kubischen Kurve – für die Fenster der Röhrenrutsche.
  const aufKurve = (p, t) => {
    const u = 1 - t;
    return [n(u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6]),
      n(u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7])];
  };
  // Ein dicker Strich ohne runde Enden (Röhre, Rutschbahn).
  const band = (d, f, breite, extra = "") => P(d, "none", `stroke="${f}" stroke-width="${breite}"${extra ? ` ${extra}` : ""}`);

  const DINGE = {
    // --- Die grossen Geräte über zwei Stockwerke ------------------------------
    k_minilift: { name: "Mini-Lift", der: "der Mini-Lift", w: 112, h: 378, mass: 2, farbe: ROT, tags: ["spielen", "lift"], d: (c) => {
      // Der Schacht: Glaswand mit Fachwerk, das Seil, zwei Pfosten, oben das Schild.
      let fachwerk = "";
      for (let y = -6; y > -366; y -= 72) fachwerk += `M-24 ${y}L24 ${y - 72}M24 ${y}L-24 ${y - 72}`;
      const schacht = R(-26, -366, 52, 360, "#e6f5fb", 2) + S(fachwerk, "#bfe3f3", 2) + S("M0 -364V-6", DUNKEL, 1.4) +
        pfosten(-31, 0, -370) + pfosten(31, 0, -370) + R(-40, -378, 80, 14, GELB, 5) + T(0, -367.4, "LIFT", 10, shade(ROT, -0.1));
      // Plattform oben links und rechts, mit Geländer und Stütze.
      const oben = [[-56, -36], [36, 56]].map(([a, b]) => {
        const innen = a < 0 ? b : a;
        const aussen = a < 0 ? a + 6 : b - 6;
        return P(`M${innen} ${OBEN + 7}H${aussen}L${innen} ${OBEN + 26}Z`, shade(BLAU, -0.25)) + deck(a, b, OBEN, ORANGE, 7) + gelaender(a, b, OBEN, 32);
      }).join("");
      // Die Rufknöpfe unten.
      const knopf = R(39, -52, 10, 20, DUNKEL, 3) + P("M44 -48.5l3.4 4.6h-6.8z", "#7cff9e") + P("M44 -35.5l3.4 -4.6h-6.8z", "#ffb020");
      // Die Kabine – unten gezeichnet; die App fährt sie 280 hinauf.
      const kabine = `<g class="bau-minilift-kabine">` +
        R(-4, -84, 8, 7, DUNKEL, 2) + R(-29, -80, 58, 9, shade(c, -0.25), 4.5) + C(18, -81, 2.6, "#fff6c2") +
        R(-26, -74, 52, 68, c, 7) + R(-22, -68, 44, 56, GLAS, 4) +
        S("M-16 -58l10 -8M-16 -46l18 -15", WEISS, 2.4, `opacity="0.85"`) +
        R(-26, -12, 52, 6, shade(c, -0.25), 3) + stern(0, -71, 3, GELB) + `</g>`;
      return schacht + oben + deck(-56, 56, -6, ORANGE, 6) + knopf + kabine;
    } },
    k_kletterturm: { name: "Kletterturm", der: "der Kletterturm", w: 156, h: 360, mass: 2, tags: ["spielen", "klettern"], flaeche: OBEN, fx: [-66, 66], d: () => {
      const wand = R(6, MITTE + 9, 58, -MITTE - 9, GRUEN, 4) +
        [[20, -120, ROT], [46, -98, GELB], [22, -74, BLAU], [48, -52, ORANGE], [24, -30, PINK]].map(([x, y, f], i) => griff(x, y, f, i % 2, 7)).join("");
      return sprossen(-66, -4, 0, MITTE) + wand + rautennetz(-66, -4, MITTE, OBEN + 9, 31, 34) + sprossen(4, 66, MITTE, OBEN) +
        deck(-76, 76, MITTE) + deck(-76, 76, OBEN) + wimpel(-71, 71, -344, 9) +
        pfosten(-71, 0, -350) + pfosten(0, 0, OBEN - 30, 8) + pfosten(71, 0, -350) +
        [-71, 0, 71].map((x) => polster(x, -20) + polster(x, MITTE - 16) + polster(x, OBEN - 16)).join("") +
        gelaender(-66, -4, OBEN, 30) + gelaender(4, 66, OBEN, 30) +
        kappe(-71, -352) + kappe(71, -352) + kappe(0, OBEN - 32, GELB, 5);
    } },
    k_spiralrutsche: { name: "Spiralrutsche", der: "die Spiralrutsche", w: 150, h: 360, mass: 2, farbe: GELB, tags: ["spielen", "rutsche"], d: (c) => {
      // Die Bahn dreht sich dreimal um den Turm: vorn (sichtbar) und hinten.
      const r = 50;
      const halb = 42;
      const k = 24;
      let vorn = "";
      let hinten = "";
      for (let i = 0; i < 6; i += 1) {
        const y = OBEN + 6 + i * halb;
        if (i % 2 === 0) vorn += `M${-r} ${y}C${-r} ${y + k + halb / 3} ${r} ${y + k + (2 * halb) / 3} ${r} ${y + halb}`;
        else hinten += `M${r} ${y}C${r} ${y - k + halb / 3} ${-r} ${y - k + (2 * halb) / 3} ${-r} ${y + halb}`;
      }
      const ende = OBEN + 6 + 6 * halb;
      const aus = 66;   // hier endet der Auslauf, rund
      vorn += `M${-r} ${ende}C${-r} ${ende + 26} 4 -12 ${aus} -12`;
      const bahn = (d, f) => band(d, shade(f, -0.28), 17) + band(d, f, 13) + band(d, shade(f, 0.42), 3, `transform="translate(0 -4.5)"`);
      return bahn(hinten, shade(c, -0.2)) +
        R(-18, OBEN, 36, -OBEN, BLAU, 4) + R(-14, OBEN + 4, 6, -OBEN - 8, shade(BLAU, 0.35), 3) + R(8, OBEN + 4, 7, -OBEN - 8, shade(BLAU, -0.18), 3) +
        [-205, -121, -46].map((y) => C(0, y, 7.5, WEISS) + C(0, y, 5.5, GLAS) + C(-1.8, y - 1.8, 1.6, WEISS)).join("") +
        C(aus, -12, 8.5, shade(c, -0.28)) + C(aus, -12, 6.5, c) + bahn(vorn, c) +
        deck(-56, 56, OBEN) + gelaender(-24, 50, OBEN, 32) + wimpel(-50, 50, -344, 8) +
        pfosten(-50, OBEN + 3, -350, 6) + pfosten(50, OBEN + 3, -350, 6) + kappe(-50, -352) + kappe(50, -352);
    } },
    k_roehrenrutsche: { name: "Röhrenrutsche", der: "die Röhrenrutsche", w: 240, h: 360, mass: 2, farbe: GRUEN, tags: ["spielen", "rutsche"], d: (c) => {
      const stuecke = [
        [-60, -275, 20, -275, 88, -262, 88, -222],
        [88, -222, 88, -180, -30, -196, -30, -146],
        [-30, -146, -30, -108, 12, -98, 40, -74],
        [40, -74, 66, -52, 84, -20, 112, -20],
      ];
      const weg = `M${stuecke[0][0]} ${stuecke[0][1]}` + stuecke.map((p) => `C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}`).join("");
      const fenster = [[0, 0.55], [1, 0.5], [2, 0.45]].map(([i, t]) => {
        const [x, y] = aufKurve(stuecke[i], t);
        return C(x, y, 7, shade(c, -0.3)) + C(x, y, 5, GLAS) + C(n(x - 1.6), n(y - 1.6), 1.6, WEISS);
      }).join("");
      return pfosten(86, 0, -214, 8) + pfosten(-30, 0, -138, 8) +
        band(weg, shade(c, -0.25), 34) + band(weg, c, 30) + band(weg, shade(c, -0.16), 30, `stroke-dasharray="3 19"`) + band(weg, shade(c, 0.3), 6, `opacity="0.7"`) +
        fenster + E(112, -20, 6, 16, shade(c, -0.3)) + E(113, -20, 3.6, 12, "#2d3748") +
        sprossen(-107, -69, 0, OBEN, 20) + deck(-120, -56, OBEN) +
        wimpel(-112, -64, -344, 5) + pfosten(-112, 0, -350) + pfosten(-64, 0, -350) + polster(-112, -20) + polster(-64, -20) +
        gelaender(-120, -70, OBEN, 30) + kappe(-112, -352) + kappe(-64, -352);
    } },
    k_feuerwehrstange: { name: "Feuerwehrstange", der: "die Feuerwehrstange", w: 126, h: 378, mass: 2, tags: ["spielen", "klettern"], d: () =>
      sprossen(-47, 1, 0, OBEN, 20) + deck(-60, 16, OBEN, GELB) +
      pfosten(-52, 0, -334, 10, ROT) + pfosten(6, 0, -376, 10, ROT) + gelaender(-60, -16, OBEN, 30, ROT) +
      R(1, -376, 49, 8, shade(ROT, -0.25), 4) + S("M27 -368v5", DUNKEL, 1.4) + P("M20 -351q0-12 7-12t7 12l2 3h-18z", GOLD) + C(27, -347, 2, shade(GOLD, -0.3)) +
      E(42, -6, 18, 6, shade(ROT, -0.25)) + E(42, -9, 18, 6, ROT) + E(42, -9.5, 7, 2.4, shade(ROT, -0.4)) +
      R(38, -372, 8, 363, METALL, 4) + R(39.6, -368, 2.2, 356, WEISS, 1.1) + R(43.4, -368, 1.6, 356, METALL_D, 0.8) + C(42, -372, 4.4, METALL_D) +
      C(-52, -344, 11, shade(ROT, -0.25)) + C(-52, -344, 9, WEISS) + T(-52, -340.6, "118", 8.5, ROT) },
    k_kletternetz: { name: "Grosses Kletternetz", der: "das grosse Kletternetz", w: 200, h: 336, mass: 2, tags: ["spielen", "klettern"], d: () =>
      rautennetz(-90, 90, -12, -326, 45, 52) +
      pfosten(-95, 0, -326) + pfosten(95, 0, -326) + R(-100, -336, 200, 12, BLAU, 5) + R(-96, -334, 192, 3, shade(BLAU, 0.4), 1.5) +
      polster(-95, -20) + polster(95, -20) + polster(-95, -322) + polster(95, -322) +
      R(-100, -10, 200, 10, MATTE, 4) + R(-96, -9, 192, 2.6, shade(MATTE, 0.4), 1.3) },
    k_kletterwand: { name: "Grosse Kletterwand", der: "die grosse Kletterwand", w: 140, h: 340, mass: 2, farbe: VIOLETT, tags: ["spielen", "klettern"], d: (c) => {
      const griffe = [[-30, -34], [26, -52], [-6, -76], [38, -98], [-38, -118], [10, -138], [-20, -162], [36, -182], [-42, -204], [2, -222], [38, -246], [-26, -266], [16, -286]];
      const farben = [GELB, ROT, GRUEN, ORANGE, TUERKIS, PINK, WEISS];
      let loecher = "";
      for (let x = -48; x <= 48; x += 16) loecher += `M${x} -322V-14`;
      return R(-64, -334, 128, 330, c, 6) + S(loecher, shade(c, -0.22), 2.2, `stroke-dasharray="0.1 16"`) +
        S("M-64 -268h128M-64 -202h128M-64 -136h128M-64 -70h128M0 -334v330", shade(c, -0.12), 1.4) +
        griffe.map(([x, y], i) => griff(x, y, farben[i % farben.length], i % 4 === 3 ? 2 : i % 3 === 1 ? 1 : 0, i % 2 ? 9 : 8)).join("") +
        pfosten(-66, 0, -340, 8, GELB) + pfosten(66, 0, -340, 8, GELB) + R(-70, -340, 140, 8, GELB, 4) + R(-66, -338.5, 132, 2.4, shade(GELB, 0.45), 1.2) +
        S("M0 -332v5", DUNKEL, 1.4) + P("M-8 -314q0-13 8-13t8 13l2 3h-20z", GOLD) + C(0, -310, 2.2, shade(GOLD, -0.3)) +
        R(-70, -10, 140, 10, MATTE, 4) + R(-66, -9, 132, 2.6, shade(MATTE, 0.4), 1.3);
    } },

    // --- Hüpfen, Bälle, Kriechen ------------------------------------------------
    k_sprungschloss: { name: "Sprungschloss", der: "das Sprungschloss", w: 220, h: 190, farbe: MATTE, tags: ["spielen", "huepfen"], d: (c) => {
      const turm = (x) => R(x - 19, -150, 38, 124, GELB, 18) + S(`M${x - 15} -122h30M${x - 15} -94h30M${x - 15} -66h30`, shade(GELB, -0.14), 2.4) +
        S(`M${x - 10} -138v84`, shade(GELB, 0.5), 4) +
        P(`M${x - 23} -148L${x} -182L${x + 23} -148Q${x} -138 ${x - 23} -148Z`, ROT) + P(`M${x - 8} -160L${x} -182L${x + 8} -160Z`, shade(ROT, 0.25)) +
        S(`M${x} -182v-6`, DUNKEL, 1.4) + P(`M${x} -190l10 3.4l-10 3.4z`, x < 0 ? GRUEN : PINK);
      const zinnen = [-62, -31, 0, 31, 62].map((x) => C(x, -132, 12, shade(c, 0.18))).join("");
      const fenster = (x) => R(x, -116, 40, 44, "#e6f5fb", 10) + S(`M${x + 10} -114v40M${x + 20} -114v40M${x + 30} -114v40M${x + 2} -104h36M${x + 2} -94h36M${x + 2} -84h36`, "#b5cfe0", 1.2);
      return zinnen + R(-82, -134, 164, 112, shade(c, 0.18), 16) + fenster(-64) + fenster(24) + stern(0, -94, 13, GELB) +
        S("M-70 -56h140", shade(c, 0.05), 3, `opacity="0.6"`) + R(-76, -42, 152, 14, shade(c, 0.45), 7) +
        R(-106, -32, 212, 32, c, 15) + S("M-80 -29v26M-54 -29v26M-28 -29v26M28 -29v26M54 -29v26M80 -29v26", shade(c, -0.16), 2.2) +
        R(-98, -29, 196, 5, shade(c, 0.35), 2.5) + P("M-28 -26l7 -14h42l7 14z", ROT) + R(-22, -40, 44, 4, shade(ROT, 0.3), 2) +
        turm(-88) + turm(88);
    } },
    k_trampolin: { name: "Grosses Trampolin", der: "das grosse Trampolin", w: 180, h: 176, tags: ["spielen", "trampolin", "huepfen"], d: () => {
      let netzlinien = "";
      for (let i = 1; i < 12; i += 1) {
        const x = n(-86 + i * 14.33);
        const tief = Math.sqrt(1 - (x / 86) ** 2);
        netzlinien += `M${x} ${n(-56 + 14 * tief)}V${n(-164 + 12 * tief)}`;
      }
      netzlinien += "M-87 -80Q0 -52 87 -80M-87 -104Q0 -76 87 -104M-87 -128Q0 -100 87 -128M-86 -150Q0 -124 86 -150";
      return S("M-78 -4V-44M78 -4V-44", DUNKEL, 5) + E(0, -164, 86, 12, "none", `stroke="${BLAU}" stroke-width="3"`) +
        S("M-40 0V-34M40 0V-34M-56 0h32M24 0h32", DUNKEL, 5) +
        E(0, -46, 88, 16, shade(BLAU, -0.3)) + E(0, -50, 88, 16, BLAU) + E(0, -51, 72, 10, TINTE) + E(-20, -53, 30, 3, "#3a4766") +
        P(netzlinien, "none", `stroke="${DUNKEL}" stroke-width="1" opacity="0.38"`) +
        S("M-86 -54Q-90 -110 -84 -164M86 -54Q90 -110 84 -164", BLAU, 5) + S("M-44 -38V-152M44 -38V-152", BLAU, 4.4) +
        [-44, 44].map((x) => R(x - 4, -60, 8, 16, GELB, 3)).join("") + E(0, -164, 86, 12, "none", `stroke="${shade(BLAU, 0.3)}" stroke-width="1.4"`);
    } },
    k_baellebad: { name: "Bällebad", der: "das Bällebad", w: 200, h: 78, tags: ["spielen", "ball"], d: () => {
      let baelle = "";
      const reihen = [[-70, 36, 12], [-63, 66, 11], [-55, 84, 10], [-47, 88, 9]];
      reihen.forEach(([y, breite, schritt], r) => {
        for (let x = -breite; x <= breite; x += schritt) {
          const i = Math.round((x + 100) / 7) + r * 3;
          baelle += C(n(x), y, 7, BUNTE[i % BUNTE.length]) + (i % 3 ? "" : C(n(x - 2.4), y - 2.4, 1.8, WEISS, `opacity="0.75"`));
        }
      });
      return R(-96, -66, 192, 16, shade(BLAU, -0.25), 8) + baelle +
        R(-100, -44, 200, 44, BLAU, 10) + S("M-60 -34v28M-20 -34v28M20 -34v28M60 -34v28", shade(BLAU, -0.18), 2.2) +
        R(-100, -48, 200, 11, GELB, 5.5) + R(-94, -46.6, 188, 2.6, shade(GELB, 0.45), 1.3) +
        C(-80, -7, 7, ROT) + C(84, -7, 7, GELB) + C(-82.4, -9.4, 1.8, WEISS, `opacity="0.75"`);
    } },
    k_kriechtunnel: { name: "Kriechtunnel", der: "der Kriechtunnel", w: 170, h: 66, farbe: ORANGE, tags: ["spielen", "tunnel"], d: (c) => {
      let teile = "";
      let rippen = "";
      for (let i = 0; i < 6; i += 1) {
        teile += R(-72 + i * 24, -64, 24, 62, i % 2 ? shade(c, 0.45) : c);
        rippen += `M${-48 + i * 24} -63q5 30 0 60`;
      }
      return E(72, -33, 8, 31, shade(c, -0.2)) + teile + S(rippen, shade(c, -0.22), 2.4) +
        S("M-56 -57h120", WEISS, 2.4, `opacity="0.45"`) + R(-72, -5, 144, 3, shade(c, -0.2), 1.5) +
        E(-72, -33, 13, 31, shade(c, -0.3)) + E(-71, -33, 9, 26, "#2d3748") + E(-69, -45, 2.4, 6, "#4a5568");
    } },
    k_schaumstoff: { name: "Schaumstoff-Bausteine", der: "die Schaumstoff-Bausteine", klein: true, w: 40, h: 38, tags: ["spielen", "spielzeug"], d: () =>
      R(-20, -20, 20, 20, ROT, 4) + R(-17.5, -18, 15, 3, shade(ROT, 0.35), 1.5) +
      P("M-18 -21L-10 -36L-2 -21Z", GELB, `stroke="${GELB}" stroke-width="3" stroke-linejoin="round"`) +
      P("M2.5 -1V-17H19.5V-1H16A5 6 0 0 0 6 -1Z", BLAU, `stroke="${BLAU}" stroke-width="2" stroke-linejoin="round"`) + R(4, -17, 14, 2.6, shade(BLAU, 0.4), 1.3) +
      R(5, -32, 12, 14, GRUEN, 3) + E(11, -32, 6, 2, shade(GRUEN, 0.35)) },

    // --- An der Decke: Seile, Ringe, Schaukel -----------------------------------
    k_hangelringe: { name: "Hangelringe", der: "die Hangelringe", art: "decke", w: 220, h: 296, mass: 2, tags: ["spielen", "hangeln"], d: () =>
      R(-110, 0, 220, 8, BLAU, 4) + R(-106, 1.5, 212, 2.4, shade(BLAU, 0.4), 1.2) +
      [-88, -44, 0, 44, 88].map((x, i) => S(`M${x} 6V262`, SEIL, 2.8) + R(x - 3, 256, 6, 12, DUNKEL, 2) +
        C(x, 280, 11, "none", `stroke="${[ROT, GELB, GRUEN, ORANGE, PINK][i]}" stroke-width="5"`)).join("") },
    k_hangelleiter: { name: "Hangelleiter", der: "die Hangelleiter", art: "decke", w: 220, h: 266, mass: 2, tags: ["spielen", "hangeln"], d: () => {
      let sprosse = "";
      for (let i = -4; i <= 4; i += 1) sprosse += `M${n(i * 21)} 228L${n(i * 22.5)} 256`;
      return R(-110, 0, 20, 5, DUNKEL, 2) + R(90, 0, 20, 5, DUNKEL, 2) +
        S("M-96 4L-97 224M-104 4L-105 256M96 4L97 224M104 4L105 256", SEIL, 2.4) +
        R(-100, 222, 200, 7, shade(BLAU, -0.25), 3.5) + S(sprosse, GELB, 5.4) + S(sprosse, shade(GELB, 0.4), 1.4, `transform="translate(-1.2 0)"`) +
        R(-108, 254, 216, 9, BLAU, 4.5) + R(-104, 255.5, 208, 2.6, shade(BLAU, 0.4), 1.3);
    } },
    k_kletterseil: { name: "Kletterseil", der: "das Kletterseil", art: "decke", w: 30, h: 360, mass: 2, tags: ["spielen", "klettern"], d: () => {
      let dreh = "";
      for (let y = 22; y < 326; y += 8) dreh += `M-4.5 ${y + 4}l9 -5.5`;
      return R(-14, 0, 28, 6, DUNKEL, 2) + C(0, 12, 5, "none", `stroke="${METALL_D}" stroke-width="3"`) +
        R(-7, 16, 14, 314, SEIL_D, 7) + R(-5.6, 16, 11.2, 314, SEIL, 5.6) + S(dreh, SEIL_D, 1.5) +
        [70, 120, 170, 220, 270].map((y) => E(0, y, 12, 9, SEIL_D) + E(0, y - 0.6, 10.6, 7.8, shade(SEIL, -0.05)) + S(`M-8 ${y - 2}q8 6 16 0`, SEIL_D, 1.6) + E(-4.5, y - 4, 3.4, 1.7, shade(SEIL, 0.45))).join("") +
        R(-7.5, 322, 15, 9, ROT, 3) + S("M-4.5 333l-3.4 23M0 333v25M4.5 333l3.4 23", SEIL, 3.4);
    } },
    k_schaukel: { name: "Schaukel", der: "die Schaukel", art: "decke", w: 84, h: 368, mass: 2, farbe: ORANGE, tags: ["spielen", "schaukel"], d: (c) =>
      R(-40, 0, 16, 5, DUNKEL, 2) + R(24, 0, 16, 5, DUNKEL, 2) + C(-32, 9, 4, "none", `stroke="${METALL_D}" stroke-width="2.4"`) + C(32, 9, 4, "none", `stroke="${METALL_D}" stroke-width="2.4"`) +
      S("M-32 13V354M32 13V354", SEIL, 3.4) +
      R(-42, 354, 84, 13, c, 6.5) + R(-37, 355.5, 74, 3, shade(c, 0.4), 1.5) + C(-32, 356, 3.6, SEIL_D) + C(32, 356, 3.6, SEIL_D) + stern(0, 361.5, 4.6, shade(c, -0.3)) },

    // --- An der Wand ----------------------------------------------------------
    k_schild: { name: "KiddyDome-Schild", der: "das KiddyDome-Schild", art: "wand", w: 150, h: 84, licht: true, tags: ["schild"], d: () => {
      let lampen = "";
      for (let i = 0; i <= 10; i += 1) {
        const a = (Math.PI * i) / 10;
        lampen += C(n(-68 * Math.cos(a)), n(-6 - 32 * Math.sin(a)), 2.4, "#fff6c2");
      }
      const buchstaben = ["K", "I", "D", "D", "Y"].map((b, i) => `<tspan fill="${[ROT, GELB, GRUEN, TUERKIS, PINK][i]}">${b}</tspan>`).join("");
      return P("M-75 42V-6A75 36 0 0 1 75 -6V42Z", NACHT) + P("M-69 36V-6A69 31 0 0 1 69 -6V36Z", "none", `stroke="${GELB}" stroke-width="1.6" opacity="0.7"`) +
        lampen + stern(0, -26, 7, GELB) + T(0, 8, buchstaben, 27, WEISS) + T(0, 32, "DOME", 20, "#fff6c2");
    } },
    k_leuchtsterne: { name: "Leuchtsterne", der: "die Leuchtsterne", art: "wand", w: 120, h: 92, licht: true, tags: ["deko"], d: () =>
      stern(-14, -2, 40, shade(GELB, 0.5)) + stern(-14, -2, 34, GELB) + C(-22, -6, 2.6, TINTE) + C(-6, -6, 2.6, TINTE) + S("M-20 4q6 6 12 0", TINTE, 2) +
      C(-27, 1, 3, "#ff8fa3", `opacity="0.6"`) + C(-1, 1, 3, "#ff8fa3", `opacity="0.6"`) +
      stern(40, -28, 15, PINK) + stern(44, 26, 13, TUERKIS) + stern(-48, 34, 9, ORANGE) + stern(14, 38, 8, VIOLETT) + stern(-46, -36, 7, GRUEN) },
  };

  // Die Liste des KiddyDome: die eigenen Geräte und was sonst dazupasst.
  const RAEUME = {
    kiddydome: ["k_minilift", "k_kletterturm", "k_spiralrutsche", "k_roehrenrutsche", "k_feuerwehrstange", "k_kletternetz", "k_kletterwand",
      "k_sprungschloss", "k_trampolin", "k_baellebad", "k_kriechtunnel", "k_schaumstoff",
      "k_hangelringe", "k_hangelleiter", "k_kletterseil", "k_schaukel", "k_schild", "k_leuchtsterne",
      "ball", "sitzsack"],
  };

  // Das Bild an der Wand: ein kleines Sprungschloss mit Stern.
  const MOTIVE = {
    kiddydome: () => R(-23, 13, 46, 4, "#9be07a") +
      C(-8, -3, 3.4, "#7fb0ff") + C(0, -3, 3.4, "#7fb0ff") + C(8, -3, 3.4, "#7fb0ff") + R(-12, -3, 24, 14, "#7fb0ff", 3) +
      R(-17, 6, 34, 9, MATTE, 4) + P("M-4 14v-6a4 4 0 0 1 8 0v6z", "#2d3748") +
      R(-21, -6, 8, 20, GELB, 3) + R(13, -6, 8, 20, GELB, 3) + P("M-22 -5L-17 -14L-12 -5Z", ROT) + P("M12 -5L17 -14L22 -5Z", ROT) +
      stern(0, -11, 5, ORANGE),
  };
  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
