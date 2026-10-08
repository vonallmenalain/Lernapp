/*
 * bau-moebel-freizeit.js – Die eigenen Dinge der Zimmer Spielplatz, Hallenbad,
 * Turnhalle, Kino, Musikzimmer und Velowerkstatt (Bauecke, Haus Dorf).
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten und die Bildmotive an.
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, leg, stern, topf, buecherReihe, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE, BUNT } = M.hilfe;

  // Gerundet auf eine Stelle, damit berechnete Punkte kurz bleiben.
  const n = (v) => Math.round(v * 10) / 10;
  const ROT = "#ef5350";
  const GOLD = "#e8b94f";
  const WASSER = "#8fd6f5";

  // Ein Velorad von der Seite: Pneu und Nabe.
  const rad = (x, y, r, dicke = 4) => C(x, y, r, "none", `stroke="${DUNKEL}" stroke-width="${dicke}"`) + C(x, y, 2.6, METALL_D);

  // Der Körper eines Streichinstruments (Cello, Geige): Zargen, Griffbrett,
  // Schnecke, Steg. tr verschiebt und verkleinert alles zusammen.
  function streicher(holz, tr = "") {
    const t = tr ? `transform="${tr}"` : "";
    return P("M0 -86C-10 -86 -14 -80 -13 -72C-12 -66 -8 -64 -9 -58C-10 -54 -19 -52 -19 -38C-19 -22 -10 -14 0 -14C10 -14 19 -22 19 -38C19 -52 10 -54 9 -58C8 -64 12 -66 13 -72C14 -80 10 -86 0 -86Z", holz, t) +
      S("M-8 -50q-3 6 0 12M8 -50q3 6 0 12", "#3a2414", 1.4, t) +
      P("M-2.6 -112h5.2l1.6 58h-8.4z", "#2d3748", t) + C(0, -114, 4, shade(holz, -0.3), t) + C(0, -114, 1.6, shade(holz, 0.2), t) +
      S("M-4 -107h-3M4 -103h3M-4 -99h-3", "#3a2414", 2, t) +
      P("M-4 -32h8l-1.5 12h-5z", "#2d3748", t) + R(-6, -38, 12, 3, "#f2d38a", 1, t) +
      S("M-1.4 -108V-24M1.4 -108V-24", "#f4ead5", 0.6, t);
  }

  const DINGE = {
    // --- Spielplatz -----------------------------------------------------------
    f_wippe: { name: "Wippe", der: "die Wippe", w: 128, h: 52, farbe: "#ff9f43", tags: ["spielplatz"], d: (c) =>
      S("M-40 -16v-13M-46 -29h12M40 -33v-14M34 -47h12", DUNKEL, 3.5) +
      P("M-14 0l10-24h8l10 24z", METALL_D) + R(-18, -3, 36, 3, DUNKEL, 1.5) +
      S("M-58 -11L58 -36", c, 8) + S("M-58 -11L-48 -13.2M48 -33.8L58 -36", shade(c, -0.28), 8.4) + S("M-40 -16.9L40 -34.1", shade(c, 0.3), 1.6) +
      C(0, -23.5, 4.5, DUNKEL) + C(0, -23.5, 1.8, METALL) },
    f_karussell: { name: "Karussell", der: "das Karussell", w: 112, h: 66, farbe: "#3a86ff", tags: ["spielplatz"], d: (c) => {
      const pkt = (a) => `${n(54 * Math.cos(a))} ${n(-21 + 10 * Math.sin(a))}`;
      const keil = (a, b, f) => P(`M0 -21L${pkt(a)}A54 10 0 0 1 ${pkt(b)}z`, f);
      const stueck = Math.PI / 3;
      return R(-8, -12, 16, 12, DUNKEL, 2) + E(0, -16, 54, 10, shade(c, -0.3)) +
        [0, 1, 2, 3, 4, 5].map((i) => keil(i * stueck, (i + 1) * stueck, i % 2 ? shade(c, 0.45) : c)).join("") +
        R(-4, -60, 8, 40, METALL_D, 3) +
        S("M0 -56Q-36 -56 -46 -24M0 -56Q36 -56 46 -24M0 -56Q-18 -50 -22 -13M0 -56Q18 -50 22 -13", ROT, 3.5) +
        C(0, -60, 5.5, "#ffd166");
    } },
    f_spielhaus: { name: "Spielhaus", der: "das Spielhaus", w: 88, h: 106, farbe: "#ffd166", tags: ["spielplatz"], d: (c) =>
      leg(-32, 14, HOLZ_DD, 6) + leg(26, 14, HOLZ_DD, 6) + R(-38, -16, 76, 5, HOLZ_D, 2) +
      R(-32, -66, 64, 50, c, 3) + S("M-32 -54h64M-32 -42h64M-32 -30h64", shade(c, -0.12), 1.5) +
      R(-25, -59, 20, 17, WEISS, 2) + R(-23, -57, 16, 13, "#a8ddf0", 1.5) + R(-16, -57, 2, 13, WEISS) + R(-23, -51.5, 16, 2, WEISS) +
      P("M3 -16v-26a10 10 0 0 1 20 0v26z", "#8a5734") + C(18, -29, 1.8, "#ffd166") +
      P("M-44 -63L0 -96L44 -63z", ROT) + R(-44, -66, 88, 6, "#c94040", 3) +
      S("M0 -96v-9", DUNKEL, 2) + P("M1 -105l11 3.5l-11 3.5z", "#3a86ff") },
    f_kletternetz: { name: "Kletternetz", der: "das Kletternetz", w: 112, h: 112, tags: ["spielplatz", "klettern"], d: () => {
      const seil = "#3a86ff";
      const xs = [-54, -27, 0, 27, 54];
      const ys = [-84, -62, -40, -18];
      const k = (y) => (y + 106) / 104;
      return R(-3, -108, 6, 106, DUNKEL, 2) + R(-56, -4, 112, 4, DUNKEL, 2) +
        xs.map((x) => S(`M0 -106L${x} -2`, seil, 2.6)).join("") +
        ys.map((y) => S(`M${n(-54 * k(y))} ${y}H${n(54 * k(y))}`, seil, 2.6)).join("") +
        ys.slice(1).map((y) => xs.map((x) => C(n(x * k(y)), y, 2.4, "#ffd166")).join("")).join("") +
        C(0, -106, 5, ROT);
    } },
    f_wippente: { name: "Wippente", der: "die Wippente", w: 66, h: 66, farbe: "#ffd166", tags: ["spielplatz"], d: (c) =>
      R(-18, -5, 36, 5, DUNKEL, 2.5) + S("M-8 -7L8 -11L-8 -15L8 -19L-8 -23L8 -27L0 -30", METALL_D, 3.5) +
      P("M-20 -42L-31 -56L-15 -48z", c) + E(-2, -38, 24, 12, c) + P("M-16 -40q8-10 20-3q-10 9-20 3z", shade(c, -0.15)) +
      C(16, -53, 10, c) + P("M25 -55l8 2.5l-8 4z", "#ff9f43") + C(19, -56, 1.9, TINTE) +
      S("M12 -46h-9", ROT, 3.5) + S("M-4 -28h-10", ROT, 3.5) },
    f_nestschaukel: { name: "Nestschaukel", der: "die Nestschaukel", w: 120, h: 120, farbe: ROT, tags: ["spielplatz", "schaukel"], d: (c) => {
      const tiefe = (x) => n(-42 + 16 * (1 - (x / 38) ** 2));
      return S("M-55.8 -2.5L-46 -114M-36.2 -2.5L-46 -114M55.8 -2.5L46 -114M36.2 -2.5L46 -114", HOLZ_D, 5) + R(-54, -120, 108, 8, HOLZ, 3) +
        S("M-12 -112L-40 -43M-12 -112L-10 -35M12 -112L40 -43M12 -112L10 -35", METALL_D, 1.8) +
        P("M-38 -42Q0 -10 38 -42z", "#2d3748") +
        [-24, -12, 0, 12, 24].map((x) => S(`M${x} -42V${tiefe(x)}`, "#a0aec0", 1.2)).join("") + S("M-31 -36.5Q0 -24 31 -36.5", "#a0aec0", 1.2) +
        E(0, -42, 40, 8, "none", `stroke="${c}" stroke-width="6"`) + C(-12, -112, 2.5, METALL_D) + C(12, -112, 2.5, METALL_D);
    } },
    f_seilbahn: { name: "Seilbahn", der: "die Seilbahn", w: 192, h: 120, tags: ["spielplatz"], d: () =>
      R(-93, -110, 8, 110, HOLZ_D, 2) + R(-69, -110, 8, 110, HOLZ_D, 2) + [-58, -44, -30, -16].map((y) => R(-88, y, 22, 3.5, HOLZ, 1.5)).join("") +
      R(-95, -72, 36, 6, HOLZ, 2) + R(-90, -90, 24, 3.5, HOLZ, 1.5) + R(-94, -112, 34, 4, HOLZ_D, 2) + P("M-96 -110l19-10l19 10z", ROT) +
      S("M87 -60L70 -2.5", HOLZ_D, 5) + R(83, -94, 9, 94, HOLZ_D, 2) + R(82, -98, 12, 6, ROT, 2) +
      S("M-66 -104Q20 -78 86 -84", DUNKEL, 3) + R(72, -88, 8, 7, "#2d3748", 2) +
      S("M-24 -88v40", "#c49a46", 3) + R(-31, -94, 14, 8, "#ffd166", 2.5) + C(-27.5, -95, 2.2, DUNKEL) + C(-20.5, -96, 2.2, DUNKEL) +
      E(-24, -44, 16, 5, shade(ROT, -0.25)) + E(-24, -47, 16, 5, ROT) + E(-27, -48.5, 6, 1.6, "#ff9a98") },
    f_wasserpumpe: { name: "Wasserpumpe", der: "die Wasserpumpe", w: 74, h: 80, tags: ["spielplatz", "wasser"], d: () =>
      R(-33, -27, 38, 6, "#6cc3d5", 3) + R(-36, -24, 44, 24, "#a0aec0", 4) + R(-36, -24, 44, 4, "#b8c2cc", 2) +
      R(6, -66, 14, 66, "#2f7d4f", 4) + R(4, -71, 18, 6, "#25663f", 3) + C(13, -73, 3, "#25663f") +
      P("M6 -50h-11a3 3 0 0 0 -3 3v4h5v-2h9z", "#2f7d4f") + S("M-5.5 -42v14", "#6cc3d5", 3) + C(-10, -30, 1.4, "#6cc3d5") + C(-1, -30, 1.4, "#6cc3d5") +
      S("M18 -62L32 -74", DUNKEL, 4) + C(33, -75, 3, DUNKEL) + C(18, -62, 2.5, METALL) },
    f_sandburg: { name: "Sandburg", der: "die Sandburg", w: 52, h: 44, tags: ["spielplatz"], d: () => {
      const zinnen = (x) => [0, 4, 8].map((d) => R(x + d, -42, 3, 4, "#f2d38a", 0.8)).join("");
      return P("M-26 0q2-11 13-12h26q11 1 13 12z", "#f2d38a") +
        R(-13, -30, 26, 20, "#e8c26e", 2) + R(-21, -38, 11, 28, "#f2d38a", 2) + R(10, -38, 11, 28, "#f2d38a", 2) + zinnen(-21) + zinnen(10) +
        P("M-5 -10v-8a5 5 0 0 1 10 0v8z", "#c49a46") + R(-17, -30, 3, 4, "#c49a46", 1) + R(14, -30, 3, 4, "#c49a46", 1) +
        S("M0 -30v-12", HOLZ_D, 1.5) + P("M0 -42l9 3l-9 3z", ROT) + C(-18, -4, 2.2, "#ff9fb5") + C(17, -5, 1.8, WEISS);
    } },
    f_sandspielzeug: { name: "Sandspielzeug", der: "das Sandspielzeug", klein: true, w: 40, h: 30, tags: ["spielzeug"], d: () =>
      P("M-17 -21q8-6 17 0z", "#f2d38a") + P("M-18 -20h19l-2.5 20h-14z", ROT) + R(-19, -22, 21, 3.5, "#c94040", 1.5) + S("M-17 -21q8.5-11 17 0", DUNKEL, 1.3) +
      S("M16.5 -27V-5", "#7cc05e", 2) + R(12.5, -6, 8, 2.6, "#7cc05e", 1) + S("M13.5 -3.4v3M15.5 -3.4v3M17.5 -3.4v3M19.5 -3.4v3", "#7cc05e", 1.1) +
      S("M7.5 -10L9.8 -28M7 -29h5.6", "#3a86ff", 2.4) + P("M3 0l0.8-10h7.4l0.8 10z", "#3a86ff") },
    f_picknicktisch: { name: "Picknicktisch", der: "der Picknicktisch", w: 112, h: 48, farbe: HOLZ, tags: ["tisch", "sitz", "spielplatz"], flaeche: -46, fx: [-48, 48], d: (c) =>
      S("M-40 -40L-49.4 -2.5M-40 -40L-30.6 -2.5M40 -40L30.6 -2.5M40 -40L49.4 -2.5", shade(c, -0.3), 5) +
      R(-52, -46, 104, 7, c, 3) + R(-50, -39, 100, 3, shade(c, -0.18)) +
      R(-56, -22, 112, 6, shade(c, 0.08), 3) + R(-56, -16, 112, 2.5, shade(c, -0.22)) },
    f_abfallkuebel: { name: "Abfallkübel", der: "der Abfallkübel", w: 32, h: 56, tags: ["spielplatz"], d: () =>
      R(-2.5, -50, 5, 50, METALL_D, 2) + R(-9, -3, 18, 3, DUNKEL, 1.5) +
      P("M-13 -44h26l-2.5 26h-21z", "#5cbf62") + S("M-8 -40l1 18M0 -40v18M8 -40l-1 18", "#3f9e4a", 1.4) +
      P("M-15 -44q15-14 30 0z", "#2f7d4f") + R(-9, -48, 18, 4, "#1f4d33", 2) },

    // --- Hallenbad ------------------------------------------------------------
    f_wasserrutsche: { name: "Wasserrutsche", der: "die Wasserrutsche", w: 150, h: 150, farbe: "#ffd166", tags: ["rutsche", "wasser"], d: (c) => {
      const bahn = "M-48 -132C0 -136 46 -128 42 -104C38 -82 -30 -94 -30 -68C-30 -44 44 -58 50 -34C53 -22 56 -16 64 -12";
      return R(-72, -136, 5, 136, METALL_D, 2) + R(-54, -136, 5, 136, METALL_D, 2) + [-118, -100, -82, -64, -46, -28, -10].map((y) => R(-70, y, 18, 3.5, METALL, 1.5)).join("") +
        R(-75, -140, 29, 6, "#3a86ff", 2) + S("M-73 -140v-8h25v8", METALL, 2) +
        R(36, -100, 5, 100, METALL_D, 2) + R(-34, -66, 5, 66, METALL_D, 2) +
        S(bahn, shade(c, -0.25), 15) + S(bahn, c, 11) + S(bahn, WASSER, 3.5) +
        E(66, -4, 9, 3, WASSER) + C(70, -16, 2, "#6cc3d5") + C(64, -20, 1.6, "#6cc3d5") + C(72, -10, 1.4, "#6cc3d5");
    } },
    f_startblock: { name: "Startblock", der: "der Startblock", w: 44, h: 50, tags: ["wasser"], d: () =>
      R(-14, -38, 26, 37, WEISS, 3, `stroke="${RAND}" stroke-width="2"`) + R(8, -36, 3, 33, "#e2e8f0") +
      P("M-20 -46L22 -38V-33L-20 -41Z", "#3a86ff") + T(-1, -8, "3", 22, "#3a86ff") },
    f_bademeisterstuhl: { name: "Bademeisterstuhl", der: "der Bademeisterstuhl", w: 64, h: 148, tags: ["sitz"], d: () => {
      const links = (y) => n(-27 + 10 * (-y / 104));
      return S("M-26.8 -2.5L-17 -104M26.8 -2.5L17 -104", HOLZ_D, 5) + [-22, -44, -66, -88].map((y) => R(links(y), y, -2 * links(y), 4, HOLZ, 2)).join("") +
        S("M-24 -110v-14h6M24 -110v-14h-6", METALL_D, 2.5) +
        R(-18, -144, 36, 36, ROT, 7) + R(-18, -130, 36, 6, WEISS) + R(-24, -110, 48, 8, ROT, 3);
    } },
    f_duschsaeule: { name: "Duschsäule", der: "die Duschsäule", w: 52, h: 128, tags: ["dusche", "wasser"], d: () =>
      E(0, -2, 22, 2, "#a8ddf0") + E(0, -3, 13, 3, METALL_D) + R(-4, -122, 8, 120, METALL, 3) + R(-1.5, -118, 2, 112, WEISS, 1, `opacity="0.5"`) +
      S("M-17 -114V-122H17V-114", METALL_D, 3) + P("M-24 -114h14l-2 4h-10z", METALL_D) + P("M10 -114h14l-2 4h-10z", METALL_D) +
      S("M-21 -106v26M-17 -106v32M-13 -106v26M13 -106v26M17 -106v32M21 -106v26", "#6cc3d5", 1.8, `stroke-dasharray="5 4"`) +
      C(0, -70, 4, "#3a86ff") + C(0, -70, 1.6, WEISS) },
    f_planschbecken: { name: "Planschbecken", der: "das Planschbecken", w: 116, h: 40, farbe: "#ff9fb5", tags: ["becken", "wasser"], d: (c) =>
      E(0, -29, 56, 7.5, shade(c, -0.2)) + E(0, -29, 48, 4.5, WASSER) +
      E(24, -31, 5, 3, "#ffd166") + C(28, -35, 2.6, "#ffd166") + P("M30 -35.5l2.5 0.8l-2.5 1z", "#ff9f43") +
      R(-58, -27, 116, 9, c, 4.5) + R(-58, -18, 116, 9, shade(c, 0.35), 4.5) + R(-58, -9, 116, 9, c, 4.5) +
      S("M-50 -24h100M-50 -6h100", shade(c, 0.3), 1.6) },
    f_garderobenkasten: { name: "Garderobenkasten", der: "der Garderobenkasten", w: 72, h: 112, farbe: "#6cc3d5", tags: ["schrank"], d: (c) =>
      R(-36, -112, 72, 108, shade(c, -0.25), 4) +
      [[-33, -109], [2, -109], [-33, -74], [2, -74], [-33, -39], [2, -39]].map(([x, y], i) =>
        R(x, y, 31, 33, c, 3) + S(`M${x + 5} ${y + 5}h12M${x + 5} ${y + 8}h12`, shade(c, -0.2), 1.4) + T(x + 11, y + 25, String(i + 1), 11, WEISS) + C(x + 25, y + 17, 2.4, shade(c, -0.45))).join("") +
      R(26, -58, 2, 6, METALL_D, 1) + E(27, -48, 4, 5, "none", `stroke="#ff9f43" stroke-width="2"`) +
      leg(-32, 4, DUNKEL, 5) + leg(27, 4, DUNKEL, 5) },
    f_schwimmnudeln: { name: "Schwimmnudeln", der: "die Schwimmnudeln", klein: true, w: 34, h: 40, tags: ["wasser", "spielzeug"], d: () =>
      [[-8, 34, "#ff6fa5", -7], [8, 30, "#7cc05e", 7], [0, 38, "#ffd166", 0]].map(([x, h, f, a]) =>
        R(x - 4, -h, 8, h, f, 4, `transform="rotate(${a} ${x} 0)"`) + E(x, -h + 2.5, 1.8, 1.1, shade(f, -0.35), `transform="rotate(${a} ${x} 0)"`)).join("") },
    f_schwimmfluegeli: { name: "Schwimmflügeli", der: "die Schwimmflügeli", klein: true, w: 38, h: 22, tags: ["wasser"], d: () =>
      [-9.5, 9.5].map((x) => R(x - 8.5, -19, 17, 19, "#ff9f43", 7.5) + R(x - 8.5, -10.5, 17, 2, "#e8822a") + E(x, -9.5, 3.4, 5.2, "#c96a1e") +
        S(`M${x - 5.5} -15a6 6 0 0 1 4 -2.4`, "#ffd0a0", 1.6) + R(x + 3, -21, 3, 3, WEISS, 1)).join("") },
    f_taucherbrille: { name: "Taucherbrille", der: "die Taucherbrille", klein: true, w: 36, h: 26, tags: ["wasser"], d: () =>
      S("M14 -24v17q0 5 -5 5h-3", "#ffd166", 3.4) + R(11.5, -26, 5, 4, "#ff9f43", 1.5) +
      S("M-17 -10q-1 7 4 9", DUNKEL, 2) +
      R(-17, -17, 27, 13, "#3a86ff", 5) + R(-15, -15, 10.5, 9, "#a8ddf0", 3) + R(-2.5, -15, 10.5, 9, "#a8ddf0", 3) + P("M-4.5 -4l1.5-4h1l1.5 4z", "#3a86ff") +
      S("M-13 -12l3-2M0 -12l3-2", WEISS, 1.2, `opacity="0.8"`) },
    f_flossen: { name: "Flossen", der: "die Flossen", klein: true, w: 34, h: 40, tags: ["wasser"], d: () =>
      [[-6, -6], [6, 6]].map(([x, a]) => {
        const tr = `transform="rotate(${a} ${x} 0)"`;
        return P(`M${x - 4} -10L${x - 7} -37Q${x} -32 ${x + 7} -37L${x + 4} -10Z`, "#ffd166", tr) + S(`M${x - 2.5} -14L${x - 4.5} -32M${x + 2.5} -14L${x + 4.5} -32`, GOLD, 1.5, tr) + R(x - 5, -13, 10, 13, "#2d3748", 4, tr);
      }).join("") },
    f_schwimmring: { name: "Schwimmring", der: "der Schwimmring", klein: true, w: 40, h: 20, farbe: "#7cc05e", tags: ["wasser", "spielzeug"], d: (c) =>
      E(0, -10, 19, 9.5, c) + E(0, -10, 14.5, 6, "none", `stroke="${WEISS}" stroke-width="5" stroke-dasharray="7 7"`) + E(0, -12, 7.5, 3, shade(c, -0.4)) + E(-8, -15, 4, 1.6, WEISS, `opacity="0.6"`) },
    f_fischmosaik: { name: "Fischmosaik", der: "das Fischmosaik", art: "wand", w: 72, h: 56, tags: ["bild"], d: () =>
      R(-36, -28, 72, 56, "#3a86ff", 4) + R(-33, -25, 66, 50, WASSER, 2) + S("M-33 -12.5h66M-33 0h66M-33 12.5h66M-22 -25v50M-11 -25v50M0 -25v50M11 -25v50M22 -25v50", WEISS, 1, `opacity="0.55"`) +
      S("M-27 24q-4-8 0-16M-21 24q4-8 0-14", "#3f9e4a", 2.5) +
      P("M14 2l12-10v20z", "#ff9f43") + E(-2, 2, 18, 11, "#ff9f43") + P("M-8 -8q6-8 12 0z", "#ff7a2a") + S("M4 -6v16M10 -5v14", "#ffd166", 2.4) +
      C(-11, 0, 2.6, WEISS) + C(-11, 0, 1.3, TINTE) +
      C(-24, -12, 3, "none", `stroke="${WEISS}" stroke-width="1.4"`) + C(-20, -19, 2, "none", `stroke="${WEISS}" stroke-width="1.2"`) },

    // --- Turnhalle ------------------------------------------------------------
    f_schwedenkasten: { name: "Schwedenkasten", der: "der Schwedenkasten", w: 96, h: 72, farbe: HOLZ, tags: ["sport"], flaeche: -72, fx: [-38, 38], d: (c) => {
      const hw = (y) => n(47 + (y / 58) * 6);
      return P("M-47 0L-41 -58H41L47 0Z", c) +
        [-14.5, -29, -43.5].map((y) => S(`M${-hw(y)} ${y}H${hw(y)}`, shade(c, -0.3), 1.6)).join("") +
        [-7.25, -21.75, -36.25].map((y) => E(-24, y, 8, 3, shade(c, -0.5)) + E(24, y, 8, 3, shade(c, -0.5))).join("") +
        R(-43, -71, 86, 15, "#f6ead2", 7) + R(-43, -71, 86, 15, "none", 7, `stroke="#e2c9a6" stroke-width="2"`) + S("M-37 -63.5h74", "#e2c9a6", 1.2, `stroke-dasharray="3 3"`);
    } },
    f_bock: { name: "Bock", der: "der Bock", w: 62, h: 64, farbe: "#8a5734", tags: ["sport"], d: (c) =>
      S("M-2 -28L-14 -2M2 -28L14 -2", METALL, 4) + S("M-4 -28L-24 -2M4 -28L24 -2", METALL_D, 5) + E(-24, -2, 5, 2.4, DUNKEL) + E(24, -2, 5, 2.4, DUNKEL) +
      R(-6, -48, 12, 22, METALL, 2) + R(-4.5, -40, 9, 3, METALL_D, 1) +
      R(-29, -64, 58, 20, c, 10) + R(-22, -61, 44, 5, shade(c, 0.22), 2.5) + S("M-25 -47h50", shade(c, -0.25), 1.2, `stroke-dasharray="3 3"`) },
    f_ringe: { name: "Ringe", der: "die Ringe", art: "decke", w: 56, h: 130, tags: ["sport"], d: () =>
      R(-22, 0, 44, 5, METALL_D, 2) + S("M-12 4L-15 104M12 4L15 104", "#4a5568", 3.4) + R(-18, 94, 6, 8, METALL, 1.5) + R(12, 94, 6, 8, METALL, 1.5) +
      C(-15, 115, 9.5, "none", `stroke="${HOLZ}" stroke-width="4.5"`) + C(15, 115, 9.5, "none", `stroke="${HOLZ}" stroke-width="4.5"`) },
    f_klettertau: { name: "Klettertau", der: "das Klettertau", art: "decke", w: 36, h: 160, tags: ["sport", "klettern"], d: () => {
      const tau = (x) => S(`M${x} 6V146`, "#d9b25e", 7) + Array.from({ length: 23 }, (_, i) => S(`M${x - 3} ${12 + i * 6}l6 -4`, "#b9903e", 1.3)).join("") +
        E(x, 148, 5, 6, "#c99a2e") + S(`M${x - 3} 152l-1.5 6M${x} 153v6M${x + 3} 152l1.5 6`, "#d9b25e", 2);
      return R(-18, 0, 36, 6, METALL_D, 2) + tau(-9) + tau(9);
    } },
    f_reck: { name: "Reck", der: "das Reck", w: 112, h: 112, tags: ["sport"], d: () =>
      R(-42, -6, 84, 6, "#3a86ff", 3) + R(-40, -6, 80, 2, "#6aa6ff", 1) +
      S("M-48 -90L-55 -2M48 -90L55 -2", DUNKEL, 1.6) + R(-51.5, -50, 3, 7, METALL, 1) + R(48.5, -50, 3, 7, METALL, 1) +
      R(-51, -110, 6, 110, METALL_D, 2.5) + R(45, -110, 6, 110, METALL_D, 2.5) +
      R(-53, -112, 10, 5, ROT, 2) + R(43, -112, 10, 5, ROT, 2) + R(-48, -105, 96, 5.5, METALL, 2.75) + R(-44, -104.2, 88, 1.4, WEISS, 0, `opacity="0.8"`) +
      R(-56, -3, 14, 3, DUNKEL, 1.5) + R(42, -3, 14, 3, DUNKEL, 1.5) },
    f_schwebebalken: { name: "Schwebebalken", der: "der Schwebebalken", w: 160, h: 56, tags: ["sport"], d: () =>
      R(-56, -46, 8, 42, METALL_D, 2) + R(48, -46, 8, 42, METALL_D, 2) + R(-68, -5, 32, 5, DUNKEL, 2.5) + R(36, -5, 32, 5, DUNKEL, 2.5) +
      R(-60, -24, 16, 4, METALL, 2) + R(44, -24, 16, 4, METALL, 2) +
      R(-80, -56, 160, 12, HOLZ, 4) + R(-80, -56, 160, 4.5, "#e2c9a6", 2.25) + R(-80, -46, 160, 2, HOLZ_D) },
    f_dickematte: { name: "Dicke Matte", der: "die dicke Matte", w: 150, h: 40, farbe: "#3a86ff", tags: ["matte", "sport"], flaeche: -40, d: (c) =>
      R(-75, -40, 150, 40, c, 9) + R(-75, -40, 150, 9, shade(c, 0.22), 7) + S("M-68 -31H68", shade(c, 0.4), 1.4, `stroke-dasharray="4 4"`) + S("M-68 -6H68", shade(c, -0.25), 1.4, `stroke-dasharray="4 4"`) +
      R(-50, -24, 22, 7, shade(c, -0.3), 3.5) + R(28, -24, 22, 7, shade(c, -0.3), 3.5) },
    f_ballwagen: { name: "Ballwagen", der: "der Ballwagen", w: 76, h: 72, tags: ["ball", "sport"], d: () => {
      const basket = (x, y) => C(x, y, 9, "#ff8c2a") + S(`M${x - 9} ${y}h18M${x - 5.5} ${y - 7}q4 7 0 14M${x + 5.5} ${y - 7}q-4 7 0 14`, "#3a2a1a", 1.2);
      const volley = (x, y) => C(x, y, 9, "#ffd166") + S(`M${x - 8.5} ${y - 3}Q${x} ${y - 1} ${x + 6} ${y - 7}M${x - 6} ${y + 6.5}Q${x + 2} ${y + 1} ${x + 8.8} ${y + 2}`, "#3a86ff", 2.2);
      const fuss = (x, y) => C(x, y, 9, WEISS, `stroke="${RAND}" stroke-width="1"`) + P(`M${x} ${y - 3.2}l3 2.2l-1.1 3.6h-3.8l-1.1-3.6z`, "#2d3748") + C(x - 7, y - 3, 1.8, "#2d3748") + C(x + 7, y - 3, 1.8, "#2d3748") + C(x - 4, y + 7, 1.8, "#2d3748") + C(x + 4, y + 7, 1.8, "#2d3748");
      let netz = "";
      for (let x = -22.5; x < 30; x += 7.5) netz += `M${x} -50V-14`;
      netz += "M-30 -42.5H30M-30 -35H30M-30 -27.5H30M-30 -20H30";
      return C(-22, -6, 6, DUNKEL) + C(22, -6, 6, DUNKEL) + C(-22, -6, 2.2, METALL) + C(22, -6, 2.2, METALL) +
        basket(-17, -55) + volley(2, -59) + fuss(19, -54) + volley(-18, -38) + basket(0, -40) + fuss(18, -37) + fuss(-10, -23) + basket(10, -23) +
        S(netz, METALL_D, 1, `opacity="0.75"`) + R(-30, -50, 60, 38, "none", 2, `stroke="${METALL_D}" stroke-width="3"`) + S("M-26 -12l-2 6M26 -12l2 6M30 -48l6 -8", METALL_D, 3);
    } },
    f_tor: { name: "Tor", der: "das Tor", w: 132, h: 84, tags: ["sport"], d: () => {
      let netz = "";
      for (let x = -50; x <= 50; x += 10) netz += `M${x} -76V-3`;
      for (let y = -68; y <= -8; y += 10) netz += `M-58 ${y}H58`;
      const streifenSenk = (x) => [-84, -64, -44, -24].map((y) => R(x, y, 8, 10, ROT)).join("");
      return S(netz, "#cbd5e0", 1) + R(-60, -4, 120, 3, "#a0aec0", 1.5) +
        R(-66, -84, 8, 84, WEISS, 1, `stroke="${RAND}" stroke-width="1"`) + R(58, -84, 8, 84, WEISS, 1, `stroke="${RAND}" stroke-width="1"`) + R(-66, -84, 132, 8, WEISS, 1, `stroke="${RAND}" stroke-width="1"`) +
        streifenSenk(-66) + streifenSenk(58) + [-46, -26, -6, 14, 34].map((x) => R(x, -84, 12, 8, ROT)).join("");
    } },
    f_anzeigetafel: { name: "Anzeigetafel", der: "die Anzeigetafel", art: "wand", w: 92, h: 52, licht: true, tags: ["sport"], d: () =>
      R(-46, -26, 92, 52, "#2d3748", 5) + T(-22, -12, "HEIM", 8, WEISS) + T(22, -12, "GAST", 8, WEISS) +
      R(-36, -6, 28, 26, "#1a202c", 3) + R(8, -6, 28, 26, "#1a202c", 3) + T(-22, 15, "3", 22, "#ffb020") + T(22, 15, "2", 22, "#ffb020") +
      C(0, 1, 2.2, "#ffb020") + C(0, 11, 2.2, "#ffb020") },
    f_basketball: { name: "Basketball", der: "der Basketball", klein: true, w: 28, h: 28, tags: ["ball", "sport"], d: () =>
      C(0, -14, 14, "#ff8c2a") + S("M-13.3 -14h26.6M0 -27.3v26.6M-9.5 -24.5q6 10.5 0 21M9.5 -24.5q-6 10.5 0 21", "#3a2a1a", 1.4) + C(-5, -20, 3, WEISS, `opacity="0.35"`) },
    f_huetchen: { name: "Hütchen", der: "die Hütchen", klein: true, w: 42, h: 26, tags: ["sport"], d: () => {
      const huet = (x, h) => {
        const xl = (t) => n(x - 8 + 5.5 * t);
        const xr = (t) => n(x + 8 - 5.5 * t);
        const y = (t) => n(-3 - (h - 3) * t);
        return R(x - 10, -3, 20, 3, "#e8763a", 1.5) + P(`M${x - 8} -3L${x - 2.5} ${-h}h5L${x + 8} -3z`, "#ff9f43") +
          P(`M${xl(0.38)} ${y(0.38)}L${xl(0.6)} ${y(0.6)}H${xr(0.6)}L${xr(0.38)} ${y(0.38)}Z`, WEISS);
      };
      return huet(-11, 24) + huet(11, 18);
    } },
    f_unihockey: { name: "Unihockeyschläger", der: "die Unihockeyschläger", klein: true, w: 38, h: 40, tags: ["sport"], d: () =>
      S("M-12 -38L6 -8", "#2d3748", 3) + P("M4 -10L6 -2Q12 0 18 -2L18 -6Q12 -5 8 -10Z", "#3a86ff") + S("M-12 -38L-10 -34.5", "#ffd166", 3.4) +
      S("M12 -38L-6 -8", "#4a5568", 3) + P("M-4 -10L-6 -2Q-12 0 -18 -2L-18 -6Q-12 -5 -8 -10Z", ROT) + S("M12 -38L10 -34.5", "#ffd166", 3.4) +
      C(0, -5, 5, WEISS, `stroke="${RAND}" stroke-width="1"`) + C(-2, -6, 1, "#cbd5e0") + C(2, -4, 1, "#cbd5e0") + C(1.5, -8, 1, "#cbd5e0") },
    f_turnschuhe: { name: "Turnschuhe", der: "die Turnschuhe", klein: true, w: 42, h: 18, tags: ["sport"], d: () => {
      const schuh = (x, f) => P(`M${x - 10} -3V-12Q${x - 10} -16 ${x - 6} -16L${x - 1} -15L${x + 4} -11Q${x + 11} -10 ${x + 11} -5V-3Z`, f) +
        R(x - 10, -12.5, 4, 9, shade(f, -0.22), 1.5) + S(`M${x} -13.4l2 2.2M${x + 2.6} -11.8l2 2.2`, WEISS, 1.3) +
        R(x - 11, -4, 23, 4, WEISS, 2, `stroke="${RAND}" stroke-width="1"`);
      return schuh(-9, "#3a86ff") + schuh(9, ROT);
    } },

    // --- Kino -----------------------------------------------------------------
    f_projektor: { name: "Filmprojektor", der: "der Filmprojektor", w: 66, h: 100, licht: true, d: () => {
      const spule = (x, y, r) => C(x, y, r, METALL_D) + C(x, y, r - 2, METALL) + [0, 120, 240].map((a) => C(n(x + (r * 0.5) * Math.cos((a * Math.PI) / 180)), n(y + (r * 0.5) * Math.sin((a * Math.PI) / 180)), n(r * 0.26), "#4a5568")).join("") + C(x, y, 2.4, "#4a5568");
      return S("M0 -44L-18 -2M0 -44L18 -2M0 -44V-2", DUNKEL, 3) +
        S("M-12 -80L-6 -64M12 -84L8 -64", METALL_D, 3) + spule(-12, -80, 14) + spule(12, -84, 12) +
        R(-26, -66, 46, 22, "#4a5568", 5) + R(-20, -60, 18, 3, "#2d3748", 1.5) + R(-20, -54, 18, 3, "#2d3748", 1.5) +
        R(20, -62, 9, 14, "#2d3748", 2) + E(30, -55, 2.6, 5.5, "#fff6c2") + C(10, -55, 3, ROT);
    } },
    f_kinokasse: { name: "Kinokasse", der: "die Kinokasse", w: 100, h: 120, farbe: ROT, tags: ["kasse", "theke"], flaeche: -56, fx: [-44, 44], d: (c) =>
      R(-44, -100, 88, 100, shade(c, -0.18), 4) + R(-36, -94, 72, 36, "#e6f6fc", 3) + R(-36, -94, 72, 36, "none", 3, `stroke="${shade(c, -0.35)}" stroke-width="2"`) +
      S("M-28 -86l10-6M-24 -78l14-9", WEISS, 2, `opacity="0.8"`) + [-4, 0, 4].map((x) => C(x, -76, 1.2, shade(c, -0.35))).join("") + [-2, 2].map((x) => C(x, -72, 1.2, shade(c, -0.35))).join("") +
      R(-10, -62, 20, 4, "#2d3748", 2) + R(-4, -60, 8, 6, "#ffd166", 1) +
      R(-48, -56, 96, 6, shade(c, -0.35), 3) + R(-44, -50, 88, 50, c, 3) + stern(-24, -26, 8, "#ffd166") + stern(24, -26, 8, "#ffd166") + stern(0, -28, 5, "#fff1b8") +
      R(-50, -120, 100, 20, shade(c, -0.35), 6) + T(0, -104.5, "KASSE", 13, "#ffd166") },
    f_popcornmaschine: { name: "Popcornmaschine", der: "die Popcornmaschine", w: 62, h: 116, licht: true, tags: ["popcorn"], d: () => {
      let mais = "";
      for (let i = 0; i < 27; i += 1) {
        const reihe = Math.floor(i / 9);
        const x = -21 + (i % 9) * 5.2 + reihe * 1.6;
        const y = -61 - reihe * 5 - (i % 2) * 1.5;
        if (reihe === 2 && (i % 9 === 0 || i % 9 === 8)) continue;
        mais += C(n(x), n(y), 3.6, ["#fff6c2", "#fffaf0", "#ffe9a8"][i % 3]);
      }
      return C(-20, -6, 6, DUNKEL) + C(20, -6, 6, DUNKEL) + C(-20, -6, 2.2, METALL) + C(20, -6, 2.2, METALL) +
        R(-28, -56, 56, 46, ROT, 4) + R(-22, -50, 44, 32, shade(ROT, 0.18), 3) + stern(0, -34, 9, "#ffd166") +
        R(-27, -102, 54, 46, "#e6f6fc", 2) + mais + R(-8, -96, 16, 10, METALL_D, 3) + R(-1, -102, 2, 6, METALL_D) + C(-4, -84, 2.4, "#fff6c2") + C(5, -86, 2.4, "#fffaf0") +
        R(-27, -102, 54, 46, "none", 2, `stroke="${shade(ROT, -0.2)}" stroke-width="3"`) +
        P("M-31 -102L-25 -114H25L31 -102Z", ROT) + R(-31, -103, 62, 4, shade(ROT, -0.25), 2);
    } },
    f_vorhang: { name: "Vorhang", der: "der Vorhang", art: "wand", w: 184, h: 112, farbe: ROT, tags: ["vorhang"], d: (c) => {
      const dunkel = shade(c, -0.22);
      const tuch = (s) => P(`M${-92 * s} -44H${-52 * s}Q${-60 * s} -6 ${-68 * s} 14Q${-62 * s} 34 ${-56 * s} 56H${-92 * s}Z`, c) +
        S(`M${-82 * s} -42Q${-84 * s} -8 ${-80 * s} 14M${-70 * s} -42Q${-72 * s} -6 ${-74 * s} 14M${-84 * s} 20Q${-82 * s} 40 ${-84 * s} 54M${-72 * s} 22Q${-68 * s} 40 ${-66 * s} 54`, dunkel, 2) +
        S(`M${-90 * s} 12Q${-80 * s} 20 ${-68 * s} 14`, "#ffd166", 3.5);
      const bogen = Array.from({ length: 8 }, (_, i) => C(-80.5 + i * 23, -42, 11.5, dunkel) + C(-80.5 + i * 23, -30.5, 2.2, "#ffd166")).join("");
      return tuch(1) + tuch(-1) + bogen + R(-92, -56, 184, 16, dunkel, 3) + R(-92, -43, 184, 2.5, "#ffd166");
    } },
    f_filmplakat: { name: "Filmplakat", der: "das Filmplakat", art: "wand", w: 52, h: 72, tags: ["bild"], d: () =>
      R(-26, -36, 52, 72, "#7c5ce6", 2) + R(-26, -36, 8, 72, "#1a202c") + R(18, -36, 8, 72, "#1a202c") +
      Array.from({ length: 9 }, (_, i) => R(-24, -33 + i * 8, 4, 4, WEISS, 1) + R(20, -33 + i * 8, 4, 4, WEISS, 1)).join("") +
      stern(-9, -26, 3.5, "#ffd166") + stern(10, -20, 2.5, "#ffd166") + C(-12, -10, 1.2, WEISS) + C(12, 0, 1.2, WEISS) +
      P("M0 -24q8 7 7 24h-14q-1-17 7-24z", WEISS) + C(0, -9, 3.4, "#6cc3d5") + P("M-7 -4l-5 8h5zM7 -4l5 8h-5z", ROT) + P("M-4 1l4 10l4 -10z", "#ff9f43") + P("M-2 1l2 6l2 -6z", "#ffd166") +
      R(-15, 20, 30, 9, "#ffd166", 2) },
    f_leuchtschild: { name: "Leuchtschild", der: "das Leuchtschild", art: "wand", w: 104, h: 44, licht: true, d: () =>
      R(-52, -22, 104, 44, "#2d3748", 8) + R(-45, -15, 90, 30, ROT, 5) + T(0, 9, "KINO", 23, "#fff6c2") +
      Array.from({ length: 9 }, (_, i) => C(-44 + i * 11, -18.5, 2.2, "#ffd166") + C(-44 + i * 11, 18.5, 2.2, "#ffd166")).join("") +
      [-8, 0, 8].map((y) => C(-48.5, y, 2.2, "#ffd166") + C(48.5, y, 2.2, "#ffd166")).join("") },
    f_absperrung: { name: "Absperrung", der: "die Absperrung", w: 100, h: 52, d: () =>
      [-40, 40].map((x) => E(x, -3, 9, 3, "#c99a2e") + R(x - 3, -44, 6, 41, GOLD, 2) + C(x, -46, 4.5, "#ffd166")).join("") +
      S("M-37 -40Q0 -10 37 -40", "#b71c1c", 5) + S("M-37 -41Q0 -12 37 -41", ROT, 2) },
    f_filmrolle: { name: "Filmrolle", der: "die Filmrolle", klein: true, w: 38, h: 32, d: () =>
      R(-4, -5, 23, 5, "#2d3748", 1) + [0, 5, 10, 15].map((x) => R(x - 1, -4.2, 2.5, 1.2, "#fff6c2") + R(x - 1, -1.8, 2.5, 1.2, "#fff6c2")).join("") +
      C(-4, -16, 15, METALL_D) + C(-4, -16, 13, METALL) +
      [0, 72, 144, 216, 288].map((a) => C(n(-4 + 7.5 * Math.cos((a * Math.PI) / 180)), n(-16 + 7.5 * Math.sin((a * Math.PI) / 180)), 3.4, "#4a5568")).join("") + C(-4, -16, 2.4, "#4a5568") },
    f_kinobrille: { name: "3D-Brille", der: "die 3D-Brille", klein: true, w: 38, h: 15, d: () =>
      S("M-16 -8.5l-2 7M16 -8.5l2 7", DUNKEL, 1.6) + R(-17, -13, 34, 12, WEISS, 3, `stroke="${RAND}" stroke-width="1.2"`) +
      R(-14.5, -10.5, 12, 7.5, ROT, 2, `opacity="0.85"`) + R(2.5, -10.5, 12, 7.5, "#29c5d6", 2, `opacity="0.85"`) },
    f_getraenk: { name: "Getränk", der: "das Getränk", klein: true, w: 20, h: 36, farbe: "#3a86ff", tags: ["trinken"], d: (c) =>
      S("M2 -27l4 -7", "#ff7a7a", 2.4) + P("M-8 -25h16l-2.5 25h-11z", c) + S("M-7 -14q3.5 -3 7 0t7 0", WEISS, 2.4) +
      R(-9.5, -28, 19, 4, WEISS, 2, `stroke="${RAND}" stroke-width="1"`) },
    f_billette: { name: "Billette", der: "die Billette", klein: true, w: 36, h: 26, d: () => {
      const billett = (x, y, a, f) => {
        const tr = `transform="rotate(${a} ${x} ${y})"`;
        return P(`M${x - 11} ${y - 7}H${x + 11}V${y - 2.6}A2.6 2.6 0 0 0 ${x + 11} ${y + 2.6}V${y + 7}H${x - 11}V${y + 2.6}A2.6 2.6 0 0 0 ${x - 11} ${y - 2.6}Z`, f, tr) +
          S(`M${x - 5} ${y - 6}V${y + 6}`, WEISS, 1, `stroke-dasharray="1.6 1.6" ${tr}`) + C(x + 3, y, 3.4, WEISS, `opacity="0.9" ${tr}`) + C(x + 3, y, 1.6, f, tr);
      };
      return billett(-5, -15, -12, "#ffd166") + billett(5, -9, 8, "#ff7a7a");
    } },
    f_filmklappe: { name: "Filmklappe", der: "die Filmklappe", klein: true, w: 32, h: 36, d: () => {
      const tr = `transform="rotate(-14 -15 -23)"`;
      const streifen = (y, extra) => [0, 1, 2, 3].map((i) => P(`M${-12 + i * 8} ${y}h4l-3 5h-4z`, WEISS, extra)).join("");
      return R(-15, -17, 30, 17, "#2d3748", 2) + S("M-11 -11h22M-11 -7h22M-11 -3h14", "#cbd5e0", 1) + R(-15, -22, 30, 5, "#2d3748", 1) + streifen(-22, "") +
        R(-15, -28, 30, 5, "#2d3748", 1, tr) + streifen(-28, tr);
    } },

    // --- Musikzimmer ----------------------------------------------------------
    f_schlagzeug: { name: "Schlagzeug", der: "das Schlagzeug", w: 112, h: 100, farbe: ROT, tags: ["musik", "trommel"], d: (c) => {
      const kessel = (x, y, w, h) => R(x - w / 2, y, w, h, c, 3) + R(x - w / 2, y + h / 2 - 1, w, 2, shade(c, 0.3)) + E(x, y, w / 2, 3, "#fbf8f2");
      return S("M-42 -88V-2M-48 -2h12M40 -94V-46", METALL_D, 2.2) + E(-42, -88, 14, 2.6, GOLD) + E(-42, -84, 14, 2.6, "#d4a017") +
        E(40, -94, 15, 3, "#ffd166", `transform="rotate(-10 40 -94)"`) +
        S("M36 -1V-30M52 -1V-30", METALL_D, 2) + kessel(44, -40, 22, 34) +
        S("M-20 -10l-5.2 8.8M20 -10l5.2 8.8", METALL_D, 2.5) + C(0, -32, 27, shade(c, -0.25)) + C(0, -32, 23, "#fbf8f2") + C(0, -32, 9, c) +
        kessel(-14, -70, 22, 14) + kessel(14, -72, 22, 14) +
        S("M-38 -6l-5 5M-38 -6l5 5M-38 -6V-34", METALL_D, 2) + kessel(-38, -46, 24, 12);
    } },
    f_harfe: { name: "Harfe", der: "die Harfe", w: 68, h: 124, farbe: GOLD, tags: ["musik"], d: (c) => {
      const hals = (t) => [(1 - t) ** 2 * -22 + 2 * t * (1 - t) * 4 + t * t * 30, (1 - t) ** 2 * -114 + 2 * t * (1 - t) * -132 + t * t * -92];
      const halsY = (x) => {
        let a = 0;
        let b = 1;
        for (let k = 0; k < 24; k += 1) { const m = (a + b) / 2; if (hals(m)[0] < x) a = m; else b = m; }
        return hals(a)[1];
      };
      let saiten = "";
      for (let i = 0; i < 9; i += 1) {
        const x = -14 + i * 5;
        saiten += S(`M${x} ${n(halsY(x))}V${n(-8 - (x + 14) * (84 / 44))}`, i % 3 === 0 ? ROT : "#fbf8f2", 1.1);
      }
      return R(-29, -8, 40, 8, shade(c, -0.3), 3) + saiten + P("M-20 -6L-6 -6L33 -92L27 -95Z", HOLZ_D) +
        R(-27, -114, 7, 106, c, 3) + S("M-22 -114Q4 -132 30 -92", c, 6) + C(-23.5, -116, 5, c);
    } },
    f_cello: { name: "Cello", der: "das Cello", w: 46, h: 118, tags: ["musik"], d: () =>
      S("M12 -108L20 -6", HOLZ_DD, 1.6) + S("M14.5 -107L22 -8", "#f4ead5", 1) +
      S("M0 -14V-1", METALL_D, 2.2) + streicher("#b9652f") },
    f_alphorn: { name: "Alphorn", der: "das Alphorn", w: 190, h: 60, tags: ["musik"], d: () => {
      const rohr = "M-88.8 -51.7L32 -6.3Q58 2 78 -4Q92 -10 92 -27L75 -40Q72 -26 60 -21Q48 -18 36 -17.7L-87.2 -56.3Z";
      const band = (t) => {
        const x = -88 + 122 * t;
        const y = -54 + 42 * t;
        const hw = 2.4 + 3.6 * t + 0.7;
        return S(`M${n(x - 0.3256 * hw)} ${n(y + 0.9457 * hw)}L${n(x + 0.3256 * hw)} ${n(y - 0.9457 * hw)}`, HOLZ_DD, 2.2);
      };
      return S("M-57.5 -1.5L-46 -38M-42.5 -1.5L-54 -38", HOLZ_DD, 3) +
        P(rohr, HOLZ) + S("M-80 -55L30 -15", shade(HOLZ, 0.25), 1.4) + [0.14, 0.38, 0.62, 0.86].map(band).join("") +
        E(83.5, -33.5, 10.7, 3.6, "#5b3a29", `transform="rotate(37.4 83.5 -33.5)"`) +
        stern(64, -11, 4.5, WEISS) + C(64, -11, 1.5, "#ffd166") + R(-93, -57, 6, 5, HOLZ_DD, 1.5);
    } },
    f_notenstaender: { name: "Notenständer", der: "der Notenständer", w: 46, h: 104, tags: ["musik"], d: () =>
      S("M0 -34L-17 -2M0 -34L17 -2M0 -34V-2", METALL_D, 2.4) + R(-1.8, -76, 3.6, 44, METALL_D, 1.5) +
      P("M-23 -103H23L21 -72H-21Z", DUNKEL) + R(-18, -100, 36, 25, WEISS, 1) + R(-23, -74, 46, 3.5, METALL_D, 1.5) +
      S("M-15 -95h30M-15 -92.5h30M-15 -90h30M-15 -84h30M-15 -81.5h30M-15 -79h30", "#9aa5b1", 0.7) +
      [[-10, -91], [-4, -93], [3, -90], [10, -92], [-8, -80], [2, -82], [9, -80]].map(([x, y]) => E(x, y, 1.7, 1.2, TINTE) + R(x + 1.2, y - 6, 0.8, 6, TINTE)).join("") },
    f_mikrofon: { name: "Mikrofon", der: "das Mikrofon", w: 32, h: 104, tags: ["musik"], d: () =>
      S("M4 -76q16 30 8 74", DUNKEL, 1.2) + E(0, -3, 14, 3.5, DUNKEL) + R(-1.8, -80, 3.6, 78, METALL_D, 1.5) +
      R(-3.5, -92, 7, 14, "#2d3748", 2.5) + C(0, -96, 7, METALL) + S("M-5 -99h10M-6 -96h12M-5 -93h10M-3 -101.5v11M0 -103v14M3 -101.5v11", METALL_D, 0.8) },
    f_lautsprecher: { name: "Lautsprecher", der: "der Lautsprecher", w: 44, h: 72, flaeche: -72, tags: ["musik"], d: () =>
      R(-22, -72, 44, 70, "#2d3748", 5) + C(0, -24, 15, "#1a202c") + C(0, -24, 11, "#4a5568") + C(0, -24, 4.5, "#1a202c") +
      C(0, -54, 8, "#1a202c") + C(0, -54, 5, "#4a5568") + C(0, -54, 2, "#1a202c") + C(15, -66, 1.6, "#7cff9e") + leg(-18, 2, "#1a202c", 6) + leg(12, 2, "#1a202c", 6) },
    f_notentafel: { name: "Notentafel", der: "die Notentafel", art: "wand", w: 104, h: 62, tags: ["musik"], d: () => {
      const kreide = "#f4f1ea";
      const note = (x, y) => E(x, y, 3.6, 2.6, kreide, `transform="rotate(-20 ${x} ${y})"`) + R(x + 2.4, y - 14, 1.4, 14, kreide);
      return R(-52, -31, 104, 62, HOLZ_D, 5) + R(-47, -26, 94, 50, "#2f5d50", 3) +
        S("M-40 -12h80M-40 -6h80M-40 0h80M-40 6h80M-40 12h80", kreide, 1, `opacity="0.75"`) +
        note(-28, 9) + note(-16, 3) + note(-4, 0) + note(8, -6) + P("M-1.6 -14L9.8 -20v3L-1.6 -11z", kreide) + note(24, 6) +
        R(-44, 26, 88, 4, HOLZ_DD, 1.5) + R(10, 23, 10, 3, WEISS, 1.5);
    } },
    f_xylophon: { name: "Xylophon", der: "das Xylophon", klein: true, w: 40, h: 22, tags: ["musik", "spielzeug"], d: () =>
      S("M-18.8 -19L18.8 -15M-18.8 -3L18.8 -7", HOLZ_D, 2.4) +
      ["#ef5350", "#ff9f43", "#ffd166", "#7cc05e", "#3cc8c8", "#3a86ff", "#7c5ce6", "#ff6fa5"].map((f, i) => {
        const h = 18 - i * 1.4;
        const x = -18.4 + i * 4.6;
        return R(n(x), n(-11 - h / 2), 4, n(h), f, 1.5) + C(n(x + 2), n(-11 - h / 2 + 2.2), 0.7, WEISS) + C(n(x + 2), n(-11 + h / 2 - 2.2), 0.7, WEISS);
      }).join("") + S("M-14 -1L8 -1", HOLZ, 1.4) + C(10, -1.6, 2.2, ROT) },
    f_trompete: { name: "Trompete", der: "die Trompete", klein: true, w: 42, h: 18, tags: ["musik"], d: () =>
      S("M-16 -8H8M-12 -8q-5 0 -5 3.4t5 3.4H6q4 0 4 -3.4", GOLD, 2.4) + R(-20, -9.5, 4, 3, "#c99a2e", 1) +
      [-6, -1, 4].map((x) => R(x - 1.6, -15, 3.2, 9, "#d4a017", 1) + C(x, -15.5, 2, "#ffd166")).join("") +
      P("M7 -10L19 -16V0L7 -6Z", "#ffd166") + E(19, -8, 1.6, 8, GOLD) },
    f_geige: { name: "Geige", der: "die Geige", klein: true, w: 22, h: 44, tags: ["musik"], d: () =>
      S("M4.5 -41L8.5 -1.5", HOLZ_DD, 1.2) + S("M6.1 -40.5L9.9 -2", "#f4ead5", 0.8) + streicher("#c0602c", "translate(-2.5 5.3) scale(0.38)") },
    f_handorgel: { name: "Handorgel", der: "die Handorgel", klein: true, w: 40, h: 32, farbe: ROT, tags: ["musik"], d: (c) =>
      R(-8, -27, 16, 25, "#2d3748", 1) + Array.from({ length: 6 }, (_, i) => R(-8 + i * 2.8, -27, 1.4, 25, i % 2 ? "#fbf8f2" : shade(c, -0.3))).join("") +
      R(-20, -29, 13, 29, c, 3) + [[-16, -24], [-11, -24], [-16, -18], [-11, -18], [-16, -12], [-11, -12], [-16, -6], [-11, -6]].map(([x, y]) => C(x + 0.5, y, 1.5, WEISS)).join("") +
      R(7, -29, 13, 29, c, 3) + R(9, -27, 7, 24, WEISS, 1) + [-24, -18, -12, -6].map((y) => R(12, y, 4, 2.4, TINTE, 0.6)).join("") + S("M9 -21h7M9 -15h7M9 -9h7", RAND, 0.6) +
      R(-6, -31, 12, 3, HOLZ_D, 1.5) },
    f_triangel: { name: "Triangel", der: "der Triangel", klein: true, w: 26, h: 36, tags: ["musik"], d: () =>
      R(-12, -3, 24, 3, HOLZ_D, 1.5) + R(-12, -35, 3, 33, HOLZ_D, 1.5) + R(-12, -35, 17, 3, HOLZ_D, 1.5) + S("M3 -32v4", ROT, 1) +
      S("M-6 -8L3 -27L12 -8H-2", METALL, 2.4) },
    f_blockfloete: { name: "Blockflöte", der: "die Blockflöte", klein: true, w: 12, h: 42, tags: ["musik"], d: () => {
      const holz = "#e2b27a";
      return P("M-3 -40h6l0.5 34h-7z", holz) + P("M-4.5 -6h9l0.8 6h-10.6z", shade(holz, -0.12)) + P("M-3.5 -40q3.5 -3 7 0z", shade(holz, -0.25)) +
        R(-2, -33, 4, 2.2, "#5b3a29", 0.8) + R(-3.2, -29, 6.4, 1.4, shade(holz, -0.2)) + [-25, -21, -17, -13, -9].map((y) => C(0, y, 1, "#5b3a29")).join("");
    } },

    // --- Velowerkstatt --------------------------------------------------------
    f_montagestaender: { name: "Montageständer", der: "der Montageständer", w: 106, h: 84, farbe: "#3a86ff", tags: ["velo", "werkzeug"], d: (c) => {
      const dy = -26;
      return S("M0 -10L-20 -2M0 -10L20 -2", DUNKEL, 4) + R(-3, -66, 6, 58, "#2d3748", 2) +
        rad(-30, -20 + dy, 19) + rad(30, -20 + dy, 19) +
        S(`M-30 ${-20 + dy}l18 -26h30l12 26M-12 ${-46 + dy}l14 26h-32M2 ${-20 + dy}l16 -26`, c, 4) + S(`M-16 ${-50 + dy}h10`, "#2d3748", 5) + S(`M18 ${-46 + dy}l-2 -8h8`, DUNKEL, 3) +
        R(-5, -77, 12, 10, ROT, 3) + R(-1, -68, 4, 4, "#2d3748", 1);
    } },
    f_werkbank: { name: "Werkbank", der: "die Werkbank", w: 112, h: 66, farbe: HOLZ, tags: ["werkzeug"], flaeche: -50, fx: [-50, 30], d: (c) =>
      leg(-52, 42, shade(c, -0.25), 7) + leg(45, 42, shade(c, -0.25), 7) + R(-52, -14, 104, 5, shade(c, -0.12), 2) +
      C(-30, -26, 11, "none", `stroke="${DUNKEL}" stroke-width="3.5"`) + C(-30, -26, 2, METALL_D) + R(8, -24, 30, 10, ROT, 2) + R(18, -27, 10, 3, DUNKEL, 1) +
      R(-56, -50, 112, 8, c, 3) + R(-20, -42, 30, 10, shade(c, 0.12), 2) + R(-8, -38, 6, 2.5, HOLZ_DD, 1.2) +
      R(34, -58, 16, 8, "#3a86ff", 2) + R(34, -64, 5, 6, "#3a86ff", 1.5) + R(45, -64, 5, 6, "#3a86ff", 1.5) + S("M48 -54h5", METALL_D, 2) + C(54, -54, 1.6, METALL_D) },
    f_velopumpe: { name: "Velopumpe", der: "die Velopumpe", w: 32, h: 74, tags: ["werkzeug", "velo"], d: () =>
      S("M5 -40q14 6 8 30q-2 8 2 9", DUNKEL, 2) + R(12, -4, 4, 4, METALL_D, 1) +
      R(-14, -4, 28, 4, DUNKEL, 2) + R(-5, -60, 10, 56, ROT, 4) + R(-5, -60, 10, 4, "#c94040", 2) +
      C(0, -18, 6, "#2d3748") + C(0, -18, 4.6, WEISS) + S("M0 -18l2.4 -2.4", ROT, 1) +
      R(-1.5, -69, 3, 10, METALL, 1.5) + R(-12, -73, 24, 5, DUNKEL, 2.5) },
    f_veloanhaenger: { name: "Veloanhänger", der: "der Veloanhänger", w: 92, h: 76, farbe: "#ffd166", d: (c) =>
      S("M-30 -52V-74", METALL_D, 1.5) + P("M-30 -74l15 4l-15 4z", "#ff9f43") +
      S("M36 -24L44.5 -17", METALL_D, 3) +
      P("M-36 -18V-46q0-12 12-12h38q12 0 18 16l6 24z", c) + R(-28, -52, 34, 24, "#a8ddf0", 4, `opacity="0.85"`) + S("M-20 -52v24M-12 -52v24M-4 -52v24M-28 -44h34M-28 -36h34", "#7fb8d0", 0.8) +
      R(-36, -22, 78, 5, shade(c, -0.25), 2) +
      C(-4, -13, 13, DUNKEL) + C(-4, -13, 9, "#e2e8f0") + C(-4, -13, 2.5, METALL_D) },
    f_trottinett: { name: "Trottinett", der: "das Trottinett", w: 54, h: 60, farbe: "#7cc05e", tags: ["spielzeug"], d: (c) =>
      S("M18 -8L13 -55", METALL, 3.5) + S("M3 -56h18", DUNKEL, 3.5) + R(1, -58, 6, 4, ROT, 2) + R(17, -58, 6, 4, ROT, 2) +
      S("M10 -12L16 -18", c, 4) + R(-22, -14, 34, 5, c, 2.5) + P("M-22 -14q-6 0 -4 -6l4 1z", shade(c, -0.2)) +
      C(-19, -7, 7, DUNKEL) + C(-19, -7, 2.6, METALL) + C(18, -7, 7, DUNKEL) + C(18, -7, 2.6, METALL) },
    f_dreirad: { name: "Dreirad", der: "das Dreirad", w: 58, h: 52, farbe: ROT, tags: ["spielzeug"], d: (c) =>
      C(-19, -10, 8.5, "none", `stroke="${METALL_D}" stroke-width="3.2"`) +
      S("M-15 -10.8L-6 -30L10 -36M-6 -30L12 -16M10 -36L12 -16", c, 4) + E(-7, -33, 7, 2.6, "#2d3748") +
      C(-15, -10.8, 9, "none", `stroke="${DUNKEL}" stroke-width="3.5"`) + C(-15, -10.8, 2, METALL_D) +
      C(12, -16, 14, "none", `stroke="${DUNKEL}" stroke-width="4"`) + C(12, -16, 2.4, METALL_D) + S("M12 -16l4 5", DUNKEL, 2) + R(14, -12, 6, 2.5, DUNKEL, 1) +
      S("M10 -36L8 -46h8", DUNKEL, 3) + R(12, -48, 7, 4, "#ffd166", 2) },
    f_pneus: { name: "Pneus", der: "die Pneus", art: "wand", w: 96, h: 60, d: () => {
      const pneu = (x, y, r, flanke) => C(x, y, r, "none", `stroke="${DUNKEL}" stroke-width="5"`) + C(x, y, r - 3.2, "none", `stroke="${flanke}" stroke-width="1.6"`);
      return R(-46, -30, 92, 6, HOLZ_D, 3) + [-26, 6, 30].map((x) => S(`M${x} -25v5`, METALL_D, 2.5)).join("") +
        pneu(-26, 0.5, 18, "#4a5568") + pneu(6, 2.5, 20, "#c99a2e") + pneu(30, -3.5, 14, "#4a5568");
    } },
    f_veloschild: { name: "Veloschild", der: "das Veloschild", art: "wand", w: 72, h: 48, d: () =>
      R(-36, -24, 72, 48, "#3a86ff", 6) + R(-32, -20, 64, 40, "none", 4, `stroke="${WEISS}" stroke-width="1.6"`) +
      T(0, -6, "VELO", 12, WEISS) + C(-12, 9, 7, "none", `stroke="${WEISS}" stroke-width="2.2"`) + C(12, 9, 7, "none", `stroke="${WEISS}" stroke-width="2.2"`) +
      S("M-12 9l6 -9h10l6 9M-6 0l6 9h-12M0 9l4 -9M-8 -1h5M4 0l1 -3h3", WEISS, 1.8) },
    f_teileregal: { name: "Ersatzteilregal", der: "das Ersatzteilregal", w: 86, h: 104, flaeche: -104, tags: ["regal"], d: () =>
      R(-43, -104, 6, 104, METALL_D, 2) + R(37, -104, 6, 104, METALL_D, 2) + [-104, -70, -36, -5].map((y) => R(-43, y, 86, 5, METALL, 2)).join("") +
      R(-25, -79, 3, 10, METALL, 1) + R(3, -79, 3, 10, METALL, 1) +
      P("M-35 -80q0-6 8-6h6q8 0 14 3q1 2-2 3q-6 1-9 3h-13q-4 0-4-3z", "#2d3748") + P("M-7 -80q0-6 8-6h6q8 0 14 3q1 2-2 3q-6 1-9 3h-13q-4 0-4-3z", ROT) +
      R(24, -74, 12, 4, "#2d3748", 2) + P("M24.5 -75a5.5 5.5 0 0 1 11 0z", "#cbd5e0") +
      C(-20, -52, 15, "none", `stroke="${DUNKEL}" stroke-width="3.5"`) + C(-20, -52, 11, "none", `stroke="${METALL}" stroke-width="1.4"`) + S("M-20 -63v22M-31 -52h22", METALL, 0.9) +
      E(14, -44, 13, 6, "none", `stroke="${METALL_D}" stroke-width="2.4" stroke-dasharray="2 1.4"`) +
      R(-36, -26, 22, 22, "#ff9f43", 2) + R(-10, -24, 22, 20, "#3a86ff", 2) + R(16, -28, 20, 24, "#7cc05e", 2) +
      R(-31, -21, 12, 5, WEISS, 1) + R(-5, -19, 12, 5, WEISS, 1) + R(20, -23, 12, 5, WEISS, 1) },
    f_velohelm: { name: "Velohelm", der: "der Velohelm", klein: true, w: 34, h: 22, farbe: "#3a86ff", d: (c) =>
      S("M-9 -3q5 6 12 0", DUNKEL, 1.4) + P("M-17 -3q-1 -19 17 -19q17 0 17 15l-3 4h-8l-2 -3h-21z", c) +
      P("M-9 -14q3 -4 7 -5l1 3q-4 1 -6 4z", "#1a202c") + P("M1 -18h5l-1 3h-4z", "#1a202c") + P("M10 -17q3 1 4 4l-3 1q-1 -2 -3 -3z", "#1a202c") +
      S("M-14 -7q14 -6 28 -1", shade(c, 0.35), 2) },
    f_kettenoel: { name: "Kettenöl", der: "das Kettenöl", klein: true, w: 30, h: 30, tags: ["werkzeug"], d: () =>
      S("M2 -24L13 -29", METALL_D, 1.8) + C(13.5, -26, 1.4, "#2d3748") + S("M-11 -14q-5 4 0 9", "#5cb85c", 2) +
      P("M-11 0v-14q0 -5 5 -5h8q5 0 5 5v14z", "#7cc05e") + P("M-8 -19l4 -6h4l4 6z", "#5cb85c") + R(-8, -13, 12, 7, WEISS, 1) + T(-2, -7.4, "ÖL", 5.5, "#2f7d4f") },
    f_veloschloss: { name: "Veloschloss", der: "das Veloschloss", klein: true, w: 26, h: 30, d: () =>
      S("M-7 -7V-20a7 7 0 0 1 14 0V-7", METALL, 3.5) + R(-12, -10, 24, 10, ROT, 4) + C(0, -5.5, 1.8, "#2d3748") + R(-0.6, -5.5, 1.2, 3, "#2d3748") },
    f_veloglocke: { name: "Veloglocke", der: "die Veloglocke", klein: true, w: 28, h: 22, d: () =>
      S("M-12.3 -3H8", "#4a5568", 3.4) + R(4, -6, 10, 6, "#2d3748", 3) + R(-7, -8, 5, 5, METALL_D, 1) +
      P("M-12.5 -9a8 8 0 0 1 16 0z", "#e2e8f0") + R(-13.5, -10, 18, 2.6, METALL, 1.3) + C(-4.5, -17.5, 1.5, METALL_D) + C(-8, -13, 1.8, WEISS, `opacity="0.9"`) +
      S("M3 -8l4 -3", METALL_D, 2) + S("M7 -17q3 2 2 5M10 -20q4 3 3 7", "#ffb020", 1.4) },
  };

  // Jede Liste: die eigenen neuen Dinge, die bisher eigenen und was sonst passt.
  const RAEUME = {
    spielplatz: ["f_wippe", "f_karussell", "f_spielhaus", "f_kletternetz", "f_wippente", "f_nestschaukel", "f_seilbahn", "f_wasserpumpe", "f_sandburg", "f_sandspielzeug", "f_picknicktisch", "f_abfallkuebel",
      "schaukel", "klettergeruest", "rutsche", "sandkasten", "trampolin", "ball", "bank", "grosspflanze", "vogelhaus"],
    hallenbad: ["f_wasserrutsche", "f_startblock", "f_bademeisterstuhl", "f_duschsaeule", "f_planschbecken", "f_garderobenkasten", "f_schwimmnudeln", "f_schwimmfluegeli", "f_taucherbrille", "f_flossen", "f_schwimmring", "f_fischmosaik",
      "schwimmbecken", "sprungbrett", "rettungsring", "liegestuhl", "ball", "handtuch", "bank", "grosspflanze"],
    turnhalle: ["f_schwedenkasten", "f_bock", "f_ringe", "f_klettertau", "f_reck", "f_schwebebalken", "f_dickematte", "f_ballwagen", "f_tor", "f_anzeigetafel", "f_basketball", "f_huetchen", "f_unihockey", "f_turnschuhe",
      "kletterwand", "basketballkorb", "sprossenwand", "turnmatte", "ball", "trampolin", "bank"],
    kino: ["f_projektor", "f_kinokasse", "f_popcornmaschine", "f_vorhang", "f_filmplakat", "f_leuchtschild", "f_absperrung", "f_filmrolle", "f_kinobrille", "f_getraenk", "f_billette", "f_filmklappe",
      "kinosessel", "popcorn", "leinwand", "glacetheke", "kasse", "ladentheke", "lichterkette"],
    musik: ["f_schlagzeug", "f_harfe", "f_cello", "f_alphorn", "f_notenstaender", "f_mikrofon", "f_lautsprecher", "f_notentafel", "f_xylophon", "f_trompete", "f_geige", "f_handorgel", "f_triangel", "f_blockfloete",
      "klavier", "gitarre", "trommel", "radio", "hocker", "stuhl", "poster"],
    velowerkstatt: ["f_montagestaender", "f_werkbank", "f_velopumpe", "f_veloanhaenger", "f_trottinett", "f_dreirad", "f_pneus", "f_veloschild", "f_teileregal", "f_velohelm", "f_kettenoel", "f_veloschloss", "f_veloglocke",
      "velo", "werkzeugwand", "regal", "ladentheke", "kasse", "hocker", "pakete"],
  };

  // Das Bild an der Wand: Rutschbahn, Rettungsring im Wasser, Basketball,
  // Filmrolle, Noten, Velo.
  const MOTIVE = {
    spielplatz: () => R(-23, 7, 46, 10, "#9be07a") + C(13, -8, 4.5, "#ffd166") +
      R(-16, -10, 2.4, 17, DUNKEL) + R(-9, -10, 2.4, 17, DUNKEL) + [-4, 0, 4].map((y) => R(-16, y, 9, 1.6, METALL_D)).join("") + R(-17, -12, 11, 3, "#ffd166", 1) +
      S("M-6 -9C2 -8 6 4 16 7", "#ff7a59", 3.6),
    hallenbad: () => R(-23, 2, 46, 15, "#4fb3e8") + C(0, -1, 8, "none", `stroke="${ROT}" stroke-width="4"`) +
      [45, 135, 225, 315].map((a) => C(0, -1, 8, "none", `stroke="${WEISS}" stroke-width="4" stroke-dasharray="4 46.3" transform="rotate(${a} 0 -1)"`)).join("") +
      P("M-23 4q4.6-3 9.2 0t9.2 0t9.2 0t9.2 0t9.2 0v13h-46z", "#4fb3e8", `opacity="0.75"`) + C(-14, -10, 2, "none", `stroke="#4fb3e8" stroke-width="1"`) + C(-10, -14, 1.4, "none", `stroke="#4fb3e8" stroke-width="1"`),
    turnhalle: () => R(-23, 12, 46, 5, "#e2b27a") + R(2, -15, 20, 13, WEISS, 1, `stroke="${RAND}" stroke-width="1.2"`) + R(8, -11, 8, 5, "none", 0.5, `stroke="${ROT}" stroke-width="1"`) +
      E(12, -1, 6, 1.6, "none", `stroke="#ff7a59" stroke-width="1.6"`) + C(-9, 3, 7.5, "#ff8c2a") + S("M-16.5 3h15M-9 -4.5v15M-14 -2.5q3 5.5 0 11M-4 -2.5q-3 5.5 0 11", "#3a2a1a", 0.9),
    kino: () => R(-2, 6, 24, 6, "#2d3748", 1) + [2, 8, 14].map((x) => R(x, 7, 3, 1.4, "#fff6c2") + R(x, 9.6, 3, 1.4, "#fff6c2")).join("") +
      C(-8, -2, 12, METALL_D) + C(-8, -2, 10, METALL) + [0, 72, 144, 216, 288].map((a) => C(n(-8 + 5.8 * Math.cos((a * Math.PI) / 180)), n(-2 + 5.8 * Math.sin((a * Math.PI) / 180)), 2.5, "#4a5568")).join("") +
      stern(15, -9, 5, "#ffd166"),
    musik: () => E(-11, 9, 5, 3.6, "#7c5ce6", `transform="rotate(-20 -11 9)"`) + E(9, 5, 5, 3.6, "#7c5ce6", `transform="rotate(-20 9 5)"`) +
      R(-7.6, -12, 2.2, 21, "#7c5ce6") + R(12.4, -16, 2.2, 21, "#7c5ce6") + P("M-7.6 -12L14.6 -16v5L-7.6 -7z", "#7c5ce6"),
    velowerkstatt: () => C(-11, 6, 8, "none", `stroke="${DUNKEL}" stroke-width="2.4"`) + C(11, 6, 8, "none", `stroke="${DUNKEL}" stroke-width="2.4"`) +
      S("M-11 6l7 -10h12l3 10M-4 -4l5 10h-12M1 6l6 -10", ROT, 2.2) + S("M-6 -6h5", DUNKEL, 2.4) + S("M8 -4l-1 -4h4", DUNKEL, 1.6),
  };
  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
