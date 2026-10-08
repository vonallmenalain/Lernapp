/*
 * bau-moebel-dienste.js – Die eigenen Dinge der Zimmer Restaurant, Café, Post,
 * Bibliothek, Schulzimmer, Kita und Toiletten im Dorf (Bauecke).
 * ---------------------------------------------------------------------------
 * Gezeichnet wie bau-moebel.js (dort stehen Arten, Felder und Nullpunkte).
 * dazu() meldet die Dinge, die Zimmerlisten und die Bildmotive an.
 */
(() => {
  "use strict";
  const M = window.LernappBauMoebel;
  if (!M?.dazu) return;
  const { R, C, E, P, S, T, leg, stern, buecherReihe, shade, HOLZ, HOLZ_D, HOLZ_DD, METALL, METALL_D, DUNKEL, WEISS, RAND, TINTE, BUNT } = M.hilfe;

  // Weisses bekommt einen feinen Rand, damit es auf hellem Grund nicht verschwindet.
  const rand = (breite = 1.2) => `stroke="${RAND}" stroke-width="${breite}"`;
  const GLAS = "#e6f6fc";
  const GLAS_RAND = `stroke="#a8ddf0" stroke-width="1"`;
  const KARTON = ["#d9a066", "#c98d55", "#e2b27a"];
  const POSTGELB = "#ffcc00";

  // Ein Paket: Karton, Klebeband in der Mitte, Adresszettel, wenn Platz ist.
  const paket = (x, unten, w, h, f) => R(x, unten - h, w, h, f, 2) + R(x + w / 2 - 2, unten - h, 4, h, shade(f, -0.18)) +
    (w >= 22 ? R(x + 2.5, unten - 8, w / 2 - 6, 5, WEISS, 1) : "");
  // Zahlen auf zwei Stellen runden, damit die Zeichnung kurz bleibt.
  const z = (v) => Math.round(v * 100) / 100;
  // Ein Brief von vorne: Marke oben rechts, Adresse als Striche.
  const brief = (x, y, w, h, f) => R(x, y, w, h, f, 1.2, `stroke="#cdbfa6" stroke-width="0.8"`) + R(x + w - 5, y + 1.5, 3.6, 4.2, "#ef5350", 0.6) +
    S(`M${x + 2.5} ${z(y + h * 0.58)}h${z(w * 0.45)}M${x + 2.5} ${z(y + h * 0.58 + 2.6)}h${z(w * 0.32)}`, "#9aa5b1", 0.9);
  // Eine Gabel, aufrecht gezeichnet (Zinken oben) und dann an x, y gedreht.
  const gabel = (x, y, winkel, f = METALL) => {
    const t = `transform="translate(${x} ${y}) rotate(${winkel})"`;
    return R(-0.8, 0, 1.6, 11, f, 0.8, t) + P("M-2.6 0h5.2v-1.4q0-1.2-1.2-1.2h-2.8q-1.2 0-1.2 1.2z", f, t) + [-2.6, -0.5, 1.6].map((x0) => R(x0, -6.4, 1, 4.4, f, 0.5, t)).join("");
  };
  // Ein Herz um den Punkt x, y; gr ist etwa seine Höhe.
  const herz = (x, y, gr, f) => P(`M${x} ${z(y + gr * 0.55)}q${z(-gr * 0.85)}-${z(gr * 0.5)}-${z(gr * 0.68)}-${z(gr * 1.05)}q${z(gr * 0.28)}-${z(gr * 0.45)} ${z(gr * 0.68)} 0q${z(gr * 0.4)}-${z(gr * 0.45)} ${z(gr * 0.68)} 0q${z(gr * 0.17)} ${z(gr * 0.55)}-${z(gr * 0.68)} ${z(gr * 1.05)}z`, f);
  // Eine Postkarte mit kleinem Bild (Berg, Meer, Blumenwiese, See mit Segelboot).
  const KARTEN_HIMMEL = ["#a8d8f8", "#bfe6f5", "#c5ec9a", "#ffe0b8"];
  function postkarte(x, y, w, h, k) {
    const ix = x + 1.4;
    const iy = y + 1.4;
    const iw = w - 2.8;
    const ih = h - 2.8;
    const a = (t) => z(ix + iw * t);
    const b = (t) => z(iy + ih * t);
    let bild = R(z(ix), z(iy), z(iw), z(ih), KARTEN_HIMMEL[k % 4], 0.6);
    if (k % 4 === 0) bild += P(`M${a(0)} ${b(1)}L${a(0.5)} ${b(0.3)}L${a(1)} ${b(1)}z`, "#7cc05e") + P(`M${a(0.36)} ${b(0.5)}L${a(0.5)} ${b(0.3)}L${a(0.64)} ${b(0.5)}z`, WEISS);
    if (k % 4 === 1) bild += C(a(0.7), b(0.3), z(Math.min(iw, ih) * 0.16), "#ffd166") + R(a(0), b(0.62), z(iw), z(ih * 0.38), "#3a86ff");
    if (k % 4 === 2) bild += R(a(0), b(0.6), z(iw), z(ih * 0.4), "#7cc05e") + C(a(0.3), b(0.55), 1.4, "#ff7aa2") + C(a(0.7), b(0.62), 1.4, "#ffd166");
    if (k % 4 === 3) bild += R(a(0), b(0.62), z(iw), z(ih * 0.38), "#6cc3d5") + P(`M${a(0.5)} ${b(0.2)}L${a(0.5)} ${b(0.6)}L${a(0.8)} ${b(0.6)}z`, WEISS) + R(a(0.3), b(0.6), z(iw * 0.5), 1.6, "#ef5350");
    return R(x, y, w, h, WEISS, 1, rand(0.8)) + bild;
  }
  // Bilderbuch von vorne: farbiger Deckel mit einem einfachen Bild.
  const BUCH_FARBEN = ["#3a86ff", "#ffd166", "#ff9fb5", "#7cc05e", "#34508f", "#ff9f6b", "#6cc3d5", "#a78bfa", "#ef5350"];
  function bilderbuch(x, y, k) {
    const f = BUCH_FARBEN[k % BUCH_FARBEN.length];
    const mx = x + 9;
    const my = y + 9;
    const bilder = [
      C(mx, my, 4.6, "#ffd166") + C(mx - 1.6, my - 1, 0.7, TINTE) + C(mx + 1.6, my - 1, 0.7, TINTE),
      C(mx, my + 1, 4.6, "#ff9f43") + P(`M${mx - 4.4} ${my - 1}l1-5 3 3zM${mx + 4.4} ${my - 1}l-1-5-3 3z`, "#ff9f43") + C(mx - 1.6, my, 0.7, TINTE) + C(mx + 1.6, my, 0.7, TINTE),
      herz(mx, my, 7, "#ef5350"),
      C(mx, my - 1, 2, "#ffd166") + [0, 72, 144, 216, 288].map((a) => E(mx, my - 4.4, 1.8, 2.6, WEISS, `transform="rotate(${a} ${mx} ${my - 1})"`)).join("") + C(mx, my - 1, 1.8, "#ffd166"),
      P(`M${mx + 1} ${my - 6}a5 5 0 1 0 3 8a4 4 0 1 1-3-8z`, "#ffd166") + stern(mx - 3, my - 3, 2, WEISS),
      P(`M${mx - 5} ${my}q5-5 9 0q-4 5-9 0z`, "#6cc3d5") + P(`M${mx + 3} ${my}l3-3v6z`, "#6cc3d5") + C(mx - 2.6, my - 0.6, 0.7, TINTE),
      R(mx - 5, my - 2, 10, 5, "#ef5350", 1.5) + P(`M${mx - 3} ${my - 2}l1.4-3h4l1.4 3z`, "#ef5350") + C(mx - 3, my + 3.4, 1.6, TINTE) + C(mx + 3, my + 3.4, 1.6, TINTE),
      P(`M${mx - 5} ${my - 1}l5-5 5 5z`, "#ef5350") + R(mx - 4, my - 1, 8, 6, WEISS, 0.5) + R(mx - 1, my + 1.4, 2.4, 3.6, HOLZ_D, 0.4),
      C(mx, my, 4.6, WEISS) + P(`M${mx - 4.6} ${my}a4.6 4.6 0 0 0 9.2 0z`, "#3a86ff") + C(mx - 1.6, my - 2, 1, WEISS),
    ];
    return R(x, y, 18, 19, f, 2) + R(x, y, 2.4, 19, shade(f, -0.2), 1) + bilder[k % bilder.length];
  }

  const DINGE = {
    // --- Restaurant -------------------------------------------------------------
    e_salatbuffet: { name: "Salatbuffet", der: "das Salatbuffet", w: 124, h: 82, farbe: "#5bb39a", tags: ["essen"], d: (c) => {
      const schale = (x) => P(`M${x - 12} -59h24q-1 9-12 9t-12-9z`, WEISS, rand(1.4));
      const salat = (x) => C(x - 6, -61, 5, "#7cc05e") + C(x + 5, -61, 5, "#5cb85c") + C(x, -64.5, 5.5, "#9be07a") + C(x + 3, -62, 2, "#ef5350");
      const tomaten = (x) => C(x - 6, -61, 4.4, "#ef5350") + C(x + 6, -61, 4.4, "#ef5350") + C(x, -64.5, 4.6, "#ff6b5b") + S(`M${x - 6} -65v-1.6M${x + 6} -65v-1.6M${x} -69v-1.6`, "#3f8f3f", 1.2) + C(x - 1.5, -66, 1.2, WEISS, `opacity="0.6"`);
      const rueebli = (x) => S(`M${x - 7} -58l2.6-9M${x - 2.4} -58l.8-10.5M${x + 2.4} -58l-.6-10M${x + 7} -58l-2.4-8.6`, "#ff9f43", 3.2);
      const mais = (x) => [[-7, -60.5], [-2.4, -60.5], [2.4, -60.5], [7, -60.5], [-4.8, -64.5], [0, -65], [4.8, -64.5], [-2.2, -68.5], [2.2, -68.5]].map(([dx, y]) => C(x + dx, y, 2.5, dx % 2 ? "#ffd166" : "#f5c242")).join("");
      return R(-62, -82, 124, 5, "#bfe6f5", 2.5) + R(-59, -78, 3, 28, METALL_D, 1.5) + R(56, -78, 3, 28, METALL_D, 1.5) + S("M-50 -80h22M14 -80h30", WEISS, 1.4, `opacity="0.8"`) +
        R(-60, -46, 120, 40, c, 5) + R(-54, -40, 50, 28, shade(c, 0.15), 3) + R(4, -40, 50, 28, shade(c, 0.15), 3) + R(-58, -7, 116, 7, shade(c, -0.3), 3) + R(-62, -51, 124, 6, "#e2e8f0", 3) +
        salat(-42) + schale(-42) + tomaten(-14) + schale(-14) + rueebli(14) + schale(14) + mais(42) + schale(42) + S("M-33 -63l9-12", METALL, 1.6);
    } },
    e_servierwagen: { name: "Servierwagen", der: "der Servierwagen", w: 72, h: 66, farbe: "#e8b94f", flaeche: -52, fx: [-30, 22], d: (c) =>
      R(-31, -52, 4, 44, shade(c, -0.15), 2) + R(21, -52, 4, 44, shade(c, -0.15), 2) + S("M23 -50q2-13 11-13.4", shade(c, -0.15), 3) +
      E(-20, -21.5, 10, 2, WEISS, rand(1)) + E(-20, -24, 10, 2, WEISS, rand(1)) + E(-20, -26.5, 10, 2, WEISS, rand(1)) +
      R(1, -31, 6, 10, GLAS, 1.5, GLAS_RAND) + R(10, -31, 6, 10, GLAS, 1.5, GLAS_RAND) + R(1.6, -26, 4.8, 4.4, "#ff9f43", 1) +
      R(-33, -20, 60, 5, c, 2.5) + R(-33, -52, 60, 5, c, 2.5) + P("M-34 -51h62v6q-31 5-62 0z", WEISS, rand(1)) + S("M-30 -47q27 3.6 54 0", RAND, 0.8) +
      C(-25, -6, 6, DUNKEL) + C(-25, -6, 2, METALL) + C(19, -6, 6, DUNKEL) + C(19, -6, 2, METALL) },
    e_hochstuhl: { name: "Hochstuhl", der: "der Hochstuhl", w: 46, h: 86, farbe: "#3a86ff", tags: ["stuhl", "sitz"], d: (c) =>
      S("M-10 -44L-19 -2.4M10 -44L19 -2.4", shade(c, -0.2), 4.5) + S("M-15 -18h30", shade(c, -0.2), 3) + R(6, -32, 12, 3, shade(c, -0.2), 1.5) +
      R(-15, -84, 7, 38, c, 3.5) + R(-8, -76, 5, 24, "#ffd166", 2.5) + R(-14, -50, 27, 7, c, 3) + R(-12, -64, 26, 4, c, 2) + R(10, -62, 4, 14, shade(c, -0.1), 2) +
      R(6, -69, 17, 5, shade(c, 0.25), 2.5) },
    e_polsterbank: { name: "Polsterbank", der: "die Polsterbank", w: 112, h: 62, farbe: "#ef5350", tags: ["sitz", "sofa"], d: (c) =>
      R(-50, -58, 100, 34, shade(c, -0.12), 9) + [-33, -16.5, 0, 16.5, 33].map((x) => S(`M${x} -53v20`, shade(c, -0.3), 2)).join("") +
      R(-50, -28, 100, 13, c, 6) + R(-46, -27, 92, 3, shade(c, 0.2), 1.5) + R(-50, -16, 100, 16, HOLZ_D, 3) + R(-50, -16, 100, 3, HOLZ_DD, 1.5) +
      R(-56, -62, 8, 62, HOLZ_D, 3) + R(48, -62, 8, 62, HOLZ_D, 3) + R(-56, -62, 8, 4, HOLZ_DD, 2) + R(48, -62, 8, 4, HOLZ_DD, 2) },
    e_kochmuetze: { name: "Kochmütze", der: "die Kochmütze", art: "wand", w: 54, h: 50, d: () =>
      R(-26, -25, 52, 6, HOLZ_D, 3) + R(-13, -20, 4, 6, HOLZ_DD, 2) + R(10, -20, 4, 6, HOLZ_DD, 2) +
      C(-19, -4, 7.8, RAND) + C(-11, -8, 8.8, RAND) + C(-3, -4, 7.8, RAND) + R(-22, 0.4, 22, 13, RAND, 3) +
      C(-19, -4, 6.8, WEISS) + C(-11, -8, 7.8, WEISS) + C(-3, -4, 6.8, WEISS) + R(-21, 1.4, 20, 11, WEISS, 2.5) + S("M-16 4v7M-11 4v7M-6 4v7", RAND, 1) +
      S("M6 -7L12 -15L18 -7", "#c62828", 1.6) + P("M5 -8h14l2 6v22q-9 4-18 0v-22z", "#ef5350") + R(8, 6, 10, 7, "#ff7a7a", 2) + S("M3 0l-4 6M21 0l4 6", "#c62828", 1.4) },
    e_spaghetti: { name: "Spaghetti", der: "die Spaghetti", klein: true, w: 36, h: 22, tags: ["essen"], d: () =>
      E(0, -4, 18, 3.4, WEISS, rand(1.5)) + P("M-13 -5q1-12 13-12q12 0 13 12z", "#f2cc6b") +
      S("M-10 -6q3-6 7-3t7-3t6 2M-7 -10q4-4 8-1t6-2M-4 -14q3-2 6 0", "#d9a93f", 1.2) +
      P("M-7 -13.5q7-6 14 0q-3 3-7 2.5q-4 .5-7-2.5z", "#ef5350") + C(-2, -14.5, 2.4, "#a0522d") + C(2.6, -15, 2.2, "#8b4513") + P("M0 -18.6q2.6-2.6 4.6 0q-2.6 1.8-4.6 0z", "#5cb85c") +
      gabel(6, -9, -150) },
    e_roesti: { name: "Rösti", der: "die Rösti", klein: true, w: 34, h: 16, tags: ["essen"], d: () =>
      E(0, -3.8, 17, 3.2, WEISS, rand(1.5)) + P("M-14 -5q0-6 14-6q14 0 14 6q-14 4-28 0z", "#e09a3a") + E(0, -9.5, 13, 2.8, "#f2b84b") +
      S("M-10 -9l3-1M-5 -10.6l3 1M8 -9.4l3 1M-8 -6.4h3M4 -6.6l3-.4", "#c97f24", 1) +
      E(3, -11.6, 7.5, 2.6, WEISS, rand(0.6)) + C(4, -12.6, 2.8, "#ffb020") + C(3.2, -13.4, 0.8, WEISS) },
    e_fondue: { name: "Fondue", der: "das Fondue", klein: true, w: 38, h: 38, tags: ["essen"], d: () =>
      S("M-11.3 -1l3.3-12M11.3 -1l-3.3-12", METALL_D, 2) + E(0, -9, 2.6, 3.6, "#ff9f43") + E(0, -8.4, 1.4, 2, "#ffd166") + R(-11, -15, 22, 3, METALL_D, 1.5) +
      S("M-3 -27l-9-6.6", METALL, 1.3) + S("M-12 -33.6l-3.4-2.4", "#3a86ff", 2.6) + S("M4 -27l7-7", METALL, 1.3) + S("M11 -34l2.6-2.6", "#7cc05e", 2.6) +
      P("M-12 -27h24q1 12-8 12h-8q-9 0-8-12z", "#e74c3c") + R(11, -26, 7.5, 3.4, HOLZ_DD, 1.7) +
      C(-6, -20, 1.2, WEISS) + C(0, -19, 1.2, WEISS) + C(6, -20, 1.2, WEISS) + E(0, -27, 11.5, 2.6, "#ffd166") + C(-4, -27.4, 1, "#ffe9a6") + C(5, -27, 0.8, "#ffe9a6") },
    e_servierglocke: { name: "Servierglocke", der: "die Servierglocke", klein: true, w: 36, h: 26, tags: ["essen"], d: () =>
      E(0, -2.6, 18, 2.6, WEISS, rand(1.4)) + P("M-15 -5a15 16 0 0 1 30 0z", "#cbd5e0") + R(-16, -6.5, 32, 3, METALL, 1.5) +
      S("M-9 -10q1-6 6-8", WEISS, 2, `opacity="0.85"`) + R(-1.2, -23, 2.4, 3, METALL_D, 1) + C(0, -23.5, 2.2, METALL_D) },
    e_wasserkrug: { name: "Wasserkrug", der: "der Wasserkrug", klein: true, w: 34, h: 30, tags: ["trinken"], d: () =>
      S("M3.4 -22q7 0 7 7q0 6-6 7", "#a8ddf0", 2.4) +
      P("M-13 -25H3L4.2 -4Q4.4 -0.8 1.2 -0.8H-11Q-14.2 -0.8 -14 -4Z", GLAS, `stroke="#a8ddf0" stroke-width="1.2"`) + P("M-13 -25l-3.4-2.4l.6 4z", GLAS, `stroke="#a8ddf0" stroke-width="1"`) +
      P("M-12.4 -16H2.4L3.4 -4.2Q3.6 -1.6 1 -1.6H-10.8Q-13.4 -1.6 -13.2 -4.2Z", "#a8ddf0") +
      C(-6, -9, 3.2, "#ffd166") + C(-6, -9, 2.2, "#fff1b8") + S("M-6 -11.2v4.4M-8.2 -9h4.4", "#ffd166", 0.6) + R(-2, -14.4, 4, 4, WEISS, 1, `opacity="0.75"`) +
      S("M-10.4 -22v5", WEISS, 1.4, `opacity="0.8"`) + R(11.5, -11, 5.2, 10.4, GLAS, 1.5, GLAS_RAND) + R(12, -7, 4.2, 5.8, "#a8ddf0", 1) },
    e_kerzenstaender: { name: "Kerzenständer", der: "der Kerzenständer", klein: true, w: 26, h: 40, licht: true, d: () =>
      E(0, -2.6, 8, 2.4, "#d9a53a") + R(-6, -5.4, 12, 3, "#e8b94f", 1.5) + R(-1.4, -22, 2.8, 17, "#e8b94f", 1) + E(0, -13, 2.6, 1.6, "#d9a53a") +
      S("M-9 -24q0 5 9 5q9 0 9-5", "#e8b94f", 2.2) + R(-12, -26, 6, 3, "#d9a53a", 1.5) + R(6, -26, 6, 3, "#d9a53a", 1.5) + R(-3, -25, 6, 3, "#d9a53a", 1.5) +
      R(-11, -32, 4, 6, WEISS, 1.5, rand(0.8)) + R(7, -32, 4, 6, WEISS, 1.5, rand(0.8)) + R(-2, -33, 4, 8, WEISS, 1.5, rand(0.8)) +
      [[-9, -34.6], [9, -34.6], [0, -35.6]].map(([x, y]) => E(x, y, 1.7, 2.8, "#ffb020") + E(x, y + 0.5, 0.9, 1.6, "#fff6c2")).join("") },

    // --- Café -------------------------------------------------------------------
    e_tortenvitrine: { name: "Tortenvitrine", der: "die Tortenvitrine", w: 68, h: 132, farbe: "#8a5734", licht: true, tags: ["kuchen"], d: (c) =>
      leg(-28, 4, DUNKEL, 6) + leg(22, 4, DUNKEL, 6) + R(-32, -30, 64, 26, c, 4) + R(-24, -24, 48, 10, shade(c, -0.25), 2) + S("M-20 -19h40", shade(c, -0.45), 1) +
      R(-32, -126, 64, 98, c, 6) + R(-27, -121, 54, 88, GLAS, 3) + R(-25, -119, 50, 3, "#fff6c2", 1.5) + R(-34, -132, 68, 8, shade(c, -0.2), 4) +
      R(-27, -94, 54, 2.5, "#a8ddf0", 1) + R(-27, -64, 54, 2.5, "#a8ddf0", 1) +
      // oben: Erdbeertorte und Schoggitorte
      R(-23, -108, 20, 14, "#ffb3c7", 3) + R(-23, -103, 20, 2.4, "#fff1d6") + R(-23, -110, 20, 4, WEISS, 2) + C(-17, -111.5, 2, "#ef5350") + C(-9, -111.5, 2, "#ef5350") +
      R(1, -106, 21, 12, "#8a5734", 3) + R(1, -108, 21, 4.4, "#5b3a29", 2) + P("M4 -104q1 4 2 0M12 -104q1 5 2 0M18 -104q1 3 2 0", "#5b3a29") + C(11.5, -110, 1.8, "#ffd166") +
      // Mitte: drei Cupcakes
      [[-16, "#6cc3d5", "#ff9fb5"], [0, "#ffd166", "#fff1d6"], [16, "#a78bfa", "#c9b6ff"]].map(([x, papier, creme]) =>
        P(`M${x - 6} -74h12l-2 10h-8z`, papier) + S(`M${x - 3} -73l.6 8M${x} -73v8M${x + 3} -73l-.6 8`, shade(papier, -0.2), 0.8) +
        C(x - 3, -76, 3.4, creme) + C(x + 3, -76, 3.4, creme) + C(x, -79.4, 3.6, creme) + C(x, -83.4, 1.6, "#ef5350")).join("") +
      // unten: Früchtewähe und Rüeblitorte
      R(-24, -42, 22, 9, "#e8b06a", 3) + R(-23, -44, 20, 3, "#ffd166", 1.5) + C(-20, -45, 2.2, "#ef5350") + C(-15, -45.6, 2.2, "#7cc05e") + C(-10, -45, 2.2, "#ef5350") + C(-5, -45.6, 2.2, "#3949ab") +
      R(3, -47, 20, 14, "#e8a85a", 3) + R(3, -42, 20, 2, "#c98a45") + R(3, -49, 20, 4, WEISS, 2) + P("M10 -50.5l3.4-1.4l-1 6z", "#ff9f43") + S("M13.4 -51.9l1.6-1.6", "#5cb85c", 1) },
    e_espressomaschine: { name: "Espressomaschine", der: "die Espressomaschine", klein: true, w: 40, h: 40, tags: ["kaffee"], d: () =>
      R(-17, -35, 34, 3, METALL, 1.5) + R(-13, -40, 7, 5, WEISS, 1.5, rand(0.8)) + R(-4, -40, 7, 5, WEISS, 1.5, rand(0.8)) +
      R(-19, -32, 38, 28, "#ef5350", 5) + R(-15, -29, 30, 9, "#e2e8f0", 3) + C(-9.6, -24.5, 3.2, WEISS, `stroke="${METALL_D}" stroke-width="0.8"`) + S("M-9.6 -24.5l1.8-1.4", "#ef5350", 0.8) +
      C(4.6, -24.5, 1.8, "#7cc05e") + C(9.8, -24.5, 1.8, "#ffd166") +
      R(-8, -17, 12, 4, METALL_D, 1.5) + R(-7, -13.4, 10, 3, DUNKEL, 1.5) + S("M-7 -11.9l-11 3.2", "#2d3748", 3.2) +
      R(-5, -8.6, 6, 4.4, WEISS, 1.2, rand(0.8)) + S("M-2 -10.2v1.4", "#8a5734", 1) +
      S("M13 -19q3 5 1 11", METALL_D, 1.8) + P("M9.4 -4.5h7.4l-.8-5.4h-5.8z", METALL) + R(-17, -4.5, 34, 4.5, DUNKEL, 1.5) },
    e_bistrotisch: { name: "Bistrotisch", der: "der Bistrotisch", w: 50, h: 52, flaeche: -52, tags: ["tisch"], d: () =>
      P("M-17 0q2-6 14-8h6q12 2 14 8z", "#2d3748") + R(-2.2, -46, 4.4, 40, "#2d3748", 2) + E(0, -26, 3.4, 2.4, "#2d3748") + E(0, -38, 2.8, 1.8, "#2d3748") +
      R(-23, -47.5, 46, 2.4, "#2d3748", 1) + R(-25, -52, 50, 5, "#f4efe7", 2.5, `stroke="#d8cfc2" stroke-width="1.2"`) + S("M-18 -49.5q6-1 10 0t10 0", "#d8cfc2", 0.8) },
    e_cafestuhl: { name: "Caféstuhl", der: "der Caféstuhl", w: 36, h: 66, farbe: "#8a5734", tags: ["stuhl", "sitz"], d: (c) =>
      S("M-7 -30l-2 28M7 -30l2 28", shade(c, -0.3), 2.8) +
      S("M-12 -33C-15 -50 -13 -64 0 -64C13 -64 15 -50 12 -33", c, 3.6) + S("M-7 -35C-9 -46 -8 -56 0 -56C8 -56 9 -46 7 -35", c, 2.2) +
      S("M-12 -30Q-14 -14 -16 -2M12 -30Q14 -14 16 -2", c, 3.2) + E(0, -14, 13.6, 2.6, "none", `stroke="${c}" stroke-width="1.8"`) +
      E(0, -31, 15, 4.5, c) + E(0, -31.6, 12.4, 3, "#e9cf9a") + S("M-8 -31.6h16M-4 -33.6h8", "#d4b47a", 0.8) },
    e_tortenstueck: { name: "Tortenstück", der: "das Tortenstück", klein: true, w: 32, h: 26, tags: ["kuchen", "essen"], d: () =>
      E(0, -2.6, 16, 2.8, WEISS, rand(1.2)) + P("M-12 -5L-4 -19H12V-5Z", "#f6d48b") + P("M-10.3 -8L-9.1 -10H12V-8Z", "#ff7aa2") + P("M-8 -12L-6.9 -14H12V-12Z", "#fff6e8") +
      P("M-5.7 -16L-4 -19H12V-16Z", "#ffd0dc") + E(7, -20, 3.6, 2.2, "#fff6e8") + P("M4 -21q3-5 6 0q-1 3-3 4q-2-1-3-4z", "#ef5350") + P("M5.6 -22.6l1.4-2 1.4 2z", "#5cb85c") +
      S("M-15 -4.6l7-1.4", METALL, 1.2) },
    e_cappuccino: { name: "Cappuccino", der: "der Cappuccino", klein: true, w: 26, h: 24, d: () =>
      E(0, -2.4, 13, 2.4, WEISS, rand(1.2)) + S("M8 -12.5q5 0 4 4q-1 2.6-5 2.6", RAND, 2.8) + S("M8 -12.5q5 0 4 4q-1 2.6-5 2.6", WEISS, 1.2) +
      P("M-8 -15h16q0 11-8 11q-8 0-8-11z", WEISS, rand(1.2)) + E(0, -15, 8, 2.2, "#b9773a") + E(0, -15.2, 6.6, 1.6, "#f6e7d0") +
      P("M0 -14.2q-2.4-1.4-1.2-2.4q.8-.6 1.2.3q.4-.9 1.2-.3q1.2 1-1.2 2.4z", "#b9773a") + S("M-2.5 -18.4q-2-2.4 0-4.8M2.5 -18.4q2-2.4 0-4.8", "#cbd5e0", 1.2) },
    e_sirup: { name: "Sirup", der: "der Sirup", klein: true, w: 18, h: 32, tags: ["trinken"], d: () =>
      P("M-6 -23h12l-1.4 22q-.1 1-1 1h-7.2q-.9 0-1-1z", GLAS, GLAS_RAND) + P("M-5.5 -17h11l-1.1 15.5h-8.8z", "#ff5c7a") + R(-3.6, -15, 3.6, 3.6, WEISS, 0.8, `opacity="0.55"`) +
      S("M1 -9l2-18l4-2", "#3a86ff", 1.6) + C(-5, -23, 3.4, "#ffd166") + C(-5, -23, 2.3, "#fff1b8") + S("M-5 -25v4M-7 -23h4", "#ffd166", 0.6) },
    e_glacebecher: { name: "Glacebecher", der: "der Glacebecher", klein: true, w: 28, h: 40, tags: ["glace", "essen"], d: () =>
      E(0, -1.6, 8, 1.6, GLAS, GLAS_RAND) + R(-1.3, -8, 2.6, 6.5, "#cfeef9", 1) +
      S("M-6 -24l-5-9", METALL, 1.3) + E(-11.4, -34, 1.4, 2.2, METALL) +
      C(-5.5, -21, 5.2, "#ff9fb5") + C(5.5, -21, 5.2, "#8a5734") + C(0, -26, 5.2, "#fff1d6") +
      C(-1.6, -31, 3.6, RAND) + C(1.6, -31, 3.6, RAND) + C(0, -33.2, 3.2, RAND) + C(-1.6, -31, 2.8, WEISS) + C(1.6, -31, 2.8, WEISS) + C(0, -33.2, 2.4, WEISS) +
      C(1, -36, 2, "#ef5350") + S("M1.4 -37.8q1.4-1.6 2.8-1.6", "#5cb85c", 0.8) + P("M5 -26l6.5-6l1.6 1.6l-6.5 6z", "#e8b06a") +
      P("M-11 -19h22q-1 9-11 11q-10-2-11-11z", GLAS, `stroke="#a8ddf0" stroke-width="1" opacity="0.92"`) + C(-5.5, -17, 3.6, "#ff9fb5", `opacity="0.45"`) + C(5.5, -17, 3.6, "#8a5734", `opacity="0.45"`) },
    e_teekanne: { name: "Teekanne", der: "die Teekanne", klein: true, w: 34, h: 26, farbe: "#6cc3d5", tags: ["geschirr"], d: (c) =>
      S("M-10 -16q-5.5 1-5.5 6q0 4 4 5", c, 2.4) + P("M8 -9q5-1 5.6-9l2.4.8q-.6 10-7 12z", c) + E(0, -11, 11, 9.5, c) + R(-7, -3, 14, 3, shade(c, -0.2), 1.5) +
      E(0, -20, 6, 1.8, shade(c, -0.15)) + C(0, -22.5, 2, shade(c, -0.15)) + C(-4, -11, 1.5, WEISS) + C(3, -14, 1.5, WEISS) + C(4, -7, 1.5, WEISS) + C(-3, -5.6, 1.2, WEISS) +
      S("M-7 -14q1-3 4-4", shade(c, 0.45), 1.6) },
    e_kreidetafel: { name: "Kreidetafel", der: "die Kreidetafel", w: 40, h: 62, tags: ["menue"], d: () =>
      R(-19, -8, 5, 8, HOLZ_DD, 2) + R(14, -8, 5, 8, HOLZ_DD, 2) + P("M-12 -62h24l7 56h-38z", HOLZ_D) + P("M-10 -58h20l6 48h-32z", "#2f3b35") +
      T(0, -47, "CAFÉ", 8, "#f4f1ea") + S("M-6 -38h10v3.5q0 4.5-5 4.5t-5-4.5zM4 -36.5q3.2 0 3.2 2.2t-3.2 2.2", "#f4f1ea", 1.2) +
      S("M-3 -40.6q-1.6-1.2 0-2.4t0-2.4M1 -40.6q-1.6-1.2 0-2.4t0-2.4", "#f4f1ea", 1) + S("M-11 -22h15M-10 -16h12", "#f4f1ea", 1.2, `opacity="0.7"`) + herz(9, -19, 4.4, "#ff9fb5") },
    e_zeitungshalter: { name: "Zeitungshalter", der: "der Zeitungshalter", art: "wand", w: 52, h: 64, tags: ["zeitung"], d: () =>
      R(-26, -31, 52, 5, HOLZ_D, 2.5) + [[-16, 50, TINTE], [0, 46, "#ef5350"], [16, 52, "#3a86ff"]].map(([x, lang, f]) =>
        S(`M${x} -26v3`, METALL_D, 1.6) + R(x - 6.5, -21, 13, lang, "#fbf8f2", 1, rand(1)) + R(x - 5, -18, 10, 2.8, f, 1) + R(x - 5, -13, 5.5, 6, "#a8d8f8", 1) +
        S(`M${x + 2} -12h3M${x + 2} -9h3M${x - 5} -4h10M${x - 5} -1h10M${x - 5} 2h8M${x - 5} 7h10M${x - 5} 10h7`, "#9aa5b1", 0.9) + R(x - 7.5, -23, 15, 3, HOLZ, 1.5)).join("") },

    // --- Post -------------------------------------------------------------------
    e_postschalter: { name: "Postschalter", der: "der Postschalter", w: 132, h: 102, farbe: POSTGELB, flaeche: -58, tags: ["theke"], d: (c) =>
      R(-63, -92, 4, 34, METALL_D, 2) + R(59, -92, 4, 34, METALL_D, 2) + R(-59, -90, 118, 26, GLAS, 2, `opacity="0.85"`) + S("M-50 -84l8-4M-44 -76l12-8M30 -84l8-4", WEISS, 1.6) +
      R(-64, -94, 128, 4, METALL_D, 2) + R(-20, -102, 40, 9, "#2d3748", 3) + T(0, -94.8, "POST", 7, c) +
      R(-64, -54, 128, 54, c, 5) + R(-56, -46, 50, 34, shade(c, 0.22), 3) + R(6, -46, 50, 34, shade(c, 0.22), 3) + R(-62, -6, 124, 6, shade(c, -0.35), 2) +
      R(-41, -36, 20, 14, WEISS, 1.5) + S("M-41 -36l10 7.5l10-7.5", shade(c, -0.3), 1.4) + paket(22, -21, 18, 16, KARTON[0]) +
      R(-66, -58, 132, 6, "#e2e8f0", 3) },
    e_postfaecher: { name: "Postfächer", der: "die Postfächer", art: "wand", w: 86, h: 62, d: () =>
      R(-43, -31, 86, 62, HOLZ_DD, 4) + Array.from({ length: 12 }, (_, i) => {
        const x = -39 + (i % 4) * 20;
        const y = -27 + Math.floor(i / 4) * 19;
        return R(x, y, 18, 17, "#e8c26e", 2) + R(x + 4.5, y + 2.5, 9, 5.4, "#fbf8f2", 1) + T(x + 9, y + 6.9, String(i + 1), 5, TINTE) + C(x + 14, y + 12, 1.5, "#8a5734") +
          (i === 5 ? R(x + 2.5, y + 9.6, 9, 5, WEISS, 0.8, rand(0.6)) + R(x + 8.6, y + 10.4, 2.2, 2.4, "#ef5350", 0.4) : "");
      }).join("") },
    e_paketregal: { name: "Paketregal", der: "das Paketregal", w: 92, h: 110, tags: ["regal", "pakete"], d: () =>
      R(-46, -110, 5, 110, METALL_D, 2) + R(41, -110, 5, 110, METALL_D, 2) +
      paket(-40, -74, 24, 26, KARTON[0]) + paket(-14, -74, 18, 17, KARTON[1]) + paket(6, -74, 32, 30, KARTON[2]) +
      paket(-40, -40, 30, 22, KARTON[2]) + paket(-8, -40, 16, 27, KARTON[0]) + paket(10, -40, 28, 18, KARTON[1]) + R(14, -54, 20, 3, POSTGELB, 1) +
      paket(-40, -6, 26, 28, KARTON[1]) + paket(-12, -6, 22, 20, KARTON[0]) + paket(12, -6, 28, 30, KARTON[2]) +
      [-110, -74, -40, -6].map((y) => R(-46, y, 92, 4, METALL, 2)).join("") },
    e_paketwaage: { name: "Paketwaage", der: "die Paketwaage", klein: true, w: 40, h: 24, tags: ["waage"], d: () =>
      R(-16, -15, 32, 15, "#ef5350", 4) + R(-4, -18, 8, 4, METALL_D, 1) + R(-20, -22, 40, 4.4, "#cbd5e0", 2) + R(-18, -21.6, 36, 1.2, WEISS, 0.6, `opacity="0.7"`) +
      C(0, -7.6, 5.4, WEISS, `stroke="#c62828" stroke-width="1"`) + S("M0 -12v1.4M-4.4 -7.6h1.4M4.4 -7.6h-1.4M-3.1 -10.7l1 1M3.1 -10.7l-1 1", TINTE, 0.7) +
      S("M0 -7.6l2.6-2.4", TINTE, 1) + C(0, -7.6, 0.9, TINTE) },
    e_paketwagen: { name: "Paketwagen", der: "der Paketwagen", w: 70, h: 74, farbe: POSTGELB, tags: ["pakete"], d: (c) =>
      S("M28 -10V-66", shade(c, -0.15), 4) + S("M24 -70h8", "#2d3748", 4) +
      paket(-31, -14, 30, 22, KARTON[0]) + paket(0, -14, 24, 18, KARTON[1]) + paket(-27, -36, 24, 20, KARTON[2]) + paket(-1, -32, 20, 16, KARTON[0]) + paket(-24, -56, 20, 14, KARTON[1]) +
      R(-33, -14, 64, 6, c, 2.5) + C(-24, -5, 5, DUNKEL) + C(-24, -5, 1.8, METALL) + C(20, -5, 5, DUNKEL) + C(20, -5, 1.8, METALL) },
    e_briefmarken: { name: "Briefmarken", der: "die Briefmarken", art: "wand", w: 50, h: 40, d: () => {
      const grund = "#dfe7ef";
      const marke = (x, y, k) => {
        let s = R(x, y, 13, 15, WEISS, 0.5);
        for (let i = 0; i < 5; i += 1) s += C(x + 1.3 + i * 2.6, y, 0.9, grund) + C(x + 1.3 + i * 2.6, y + 15, 0.9, grund);
        for (let j = 0; j < 6; j += 1) s += C(x, y + 1.25 + j * 2.5, 0.9, grund) + C(x + 13, y + 1.25 + j * 2.5, 0.9, grund);
        const ix = x + 2;
        const iy = y + 2;
        const bilder = [
          R(ix, iy, 9, 9, "#a8d8f8", 1) + P(`M${ix} ${iy + 9}l4.5-6.5l4.5 6.5z`, "#7cc05e") + P(`M${ix + 3.2} ${iy + 4.4}l1.3-1.9l1.3 1.9z`, WEISS),
          R(ix, iy, 9, 9, "#c5ec9a", 1) + [0, 72, 144, 216, 288].map((a) => E(ix + 4.5, iy + 2.6, 1.3, 1.9, "#ff7aa2", `transform="rotate(${a} ${ix + 4.5} ${iy + 4.5})"`)).join("") + C(ix + 4.5, iy + 4.5, 1.3, "#ffd166"),
          R(ix, iy, 9, 9, "#fff1b8", 1) + C(ix + 4.5, iy + 4.5, 2.6, "#ffb020") + S(`M${ix + 4.5} ${iy + 0.6}v1.2M${ix + 4.5} ${iy + 7.2}v1.2M${ix + 0.6} ${iy + 4.5}h1.2M${ix + 7.2} ${iy + 4.5}h1.2`, "#ffb020", 0.9),
          R(ix, iy, 9, 9, "#ffd3e0", 1) + herz(ix + 4.5, iy + 4.6, 5.6, "#ef5350"),
          R(ix, iy, 9, 9, "#bfe6f5", 1) + R(ix, iy + 6, 9, 3, "#3a86ff") + P(`M${ix + 4.5} ${iy + 1.2}v4.2h3z`, WEISS) + R(ix + 2.6, iy + 5.4, 4.6, 1.2, "#ef5350"),
          R(ix, iy, 9, 9, "#e3d8ff", 1) + stern(ix + 4.5, iy + 4.7, 3.8, "#a78bfa"),
        ];
        return s + bilder[k] + R(ix, iy + 10, 5, 1.4, "#9aa5b1", 0.5);
      };
      return R(-25, -20, 50, 40, grund, 3) + [0, 1, 2, 3, 4, 5].map((k) => marke(-21.5 + (k % 3) * 15, k < 3 ? -17 : 2, k)).join("");
    } },
    e_stempel: { name: "Stempel", der: "der Stempel", klein: true, w: 32, h: 26, d: () =>
      R(0, -5, 16, 5, DUNKEL, 1.5) + R(1.5, -6.5, 13, 2, "#ef5350", 1) +
      R(-14, -4, 14, 4, "#ef5350", 1) + R(-15, -10, 16, 6, HOLZ, 2) + R(-9, -16, 4, 6, HOLZ_D, 1.5) + E(-7, -20, 5, 4.4, "#ef5350") + E(-8.4, -21.4, 1.6, 1.1, WEISS, `opacity="0.6"`) },
    e_briefe: { name: "Briefe", der: "die Briefe", klein: true, w: 32, h: 24, d: () =>
      brief(-14, -21, 15, 12, WEISS) + brief(-3, -23, 16, 13, "#fff1b8") + brief(4, -19, 11, 10, "#d6ecfa") + R(-16, -7, 32, 7, HOLZ, 2) + R(-14, -4.5, 28, 1.6, HOLZ_D, 0.8) },
    e_postschild: { name: "Postschild", der: "das Postschild", art: "wand", w: 60, h: 34, d: () =>
      R(-30, -17, 60, 34, POSTGELB, 5) + R(-27, -14, 54, 28, "none", 3, `stroke="#e6b800" stroke-width="1.2"`) +
      E(-17, -1, 5.2, 4.2, "none", `stroke="#1a202c" stroke-width="2.2"`) + S("M-12.2 -1h1.6", "#1a202c", 2.4) + P("M-11 -3.6L-4 -8.4q1.4 7.4 0 14.8L-11 1.6z", "#1a202c") +
      S("M-22.2 -1h-2.4", "#1a202c", 1.8) + S("M-17 3.2q0 3.4 2.6 5.4", "#1a202c", 1) + E(-14.2, 9.6, 1.3, 1.8, "#1a202c") + T(13.5, 3.8, "POST", 10, "#1a202c") },
    e_postkartenstaender: { name: "Postkartenständer", der: "der Postkartenständer", w: 48, h: 106, d: () =>
      E(0, -3.6, 15, 3.4, DUNKEL) + R(-2, -100, 4, 97, METALL_D, 2) + C(0, -102, 3, METALL_D) +
      [-82, -58, -34].map((y, reihe) => postkarte(-22, y - 16, 11, 15, reihe * 3) + postkarte(11, y - 16, 11, 15, reihe * 3 + 2) + postkarte(-9, y - 18, 18, 17, reihe * 3 + 1) + R(-23, y - 1, 46, 2, METALL, 1)).join("") },
    e_postsack: { name: "Postsack", der: "der Postsack", w: 50, h: 62, d: () =>
      P("M-21 -2Q-27 -24 -20 -40Q-16 -46 -10 -47H10Q16 -46 20 -40Q27 -24 21 -2Q0 2 -21 -2Z", "#c4a57e") + E(0, -47, 11, 3, "#8f7352") +
      R(-10, -57, 12, 9, WEISS, 1, `${rand(0.8)} transform="rotate(-18 -4 -52)"`) + R(-1, -59, 12, 9, "#fff1b8", 1, `${rand(0.8)} transform="rotate(10 5 -54)"`) + R(5, -55, 11, 8, "#d6ecfa", 1, `${rand(0.8)} transform="rotate(26 10 -51)"`) +
      P("M-11.6 -47q11.6 4 23.2 0v2.4q-11.6 4-23.2 0z", "#b39470") + S("M-17 -36q4 2 3 8M15 -34q-3 3-2 8", "#b39470", 1.4) +
      R(-9, -27, 18, 12, POSTGELB, 2) + R(-6, -24.5, 12, 7, WEISS, 1) + S("M-6 -24.5l6 4l6-4", "#c9a227", 1) },
    e_paket: { name: "Paket", der: "das Paket", klein: true, w: 28, h: 24, tags: ["pakete"], d: () =>
      R(-13, -19, 26, 19, KARTON[0], 2) + R(-13, -19, 26, 3.4, KARTON[2], 2) + R(-11, -14.6, 8, 5, WEISS, 1) + S("M-10 -12.6h5", "#9aa5b1", 0.8) +
      S("M0 -19v18.4M-12.4 -9.5h24.8", HOLZ_DD, 1.2) + S("M0 -19q-5-5-6-1q0 2 6 1q5-5 6-1q0 2-6 1", HOLZ_DD, 1.2) },

    // --- Bibliothek ---------------------------------------------------------------
    e_leiterregal: { name: "Hohes Bücherregal", der: "das hohe Bücherregal", w: 110, h: 160, farbe: "#9a6640", tags: ["buecher", "regal"], d: (c) => {
      const holm = (t) => [18 + t * 20, 32 + t * 20, -150 + t * 147];
      return R(-50, -160, 100, 160, c, 4) + R(-44, -154, 88, 148, "#f3e6d2") + [-118, -82, -46].map((y) => R(-44, y, 88, 5, c)).join("") +
        buecherReihe(-42, 42, -118, 30, 0) + buecherReihe(-42, 42, -82, 27, 1) + buecherReihe(-42, 42, -46, 27, 2) + buecherReihe(-42, 42, -6, 30, 3) +
        R(-50, -6, 100, 6, shade(c, -0.2), 2) + R(-50, -150, 100, 3, METALL_D, 1.5) +
        [0.12, 0.27, 0.42, 0.57, 0.72, 0.87].map((t) => { const [x1, x2, y] = holm(t); return S(`M${x1} ${y}H${x2}`, "#d19a5b", 3); }).join("") +
        S("M18 -150L38 -3M32 -150L52 -3", "#e2b27a", 4) + S("M18 -150q0-4 3-4M32 -150q0-4 3-4", METALL_D, 1.6) + C(38, -3, 3, DUNKEL) + C(52, -3, 3, DUNKEL);
    } },
    e_ausleihtheke: { name: "Ausleihtheke", der: "die Ausleihtheke", w: 124, h: 64, farbe: "#6cc3d5", flaeche: -64, tags: ["theke"], d: (c) =>
      R(-60, -56, 120, 56, c, 5) + R(-54, -50, 28, 40, shade(c, 0.15), 3) + R(26, -50, 28, 40, shade(c, 0.15), 3) + R(-58, -6, 116, 6, shade(c, -0.3), 2) +
      P("M-18 -46Q-9 -51 0 -46Q9 -51 18 -46V-22Q9 -27 0 -22Q-9 -27 -18 -22Z", shade(c, -0.35)) +
      P("M-16 -47Q-8 -51 0 -46.6V-23.6Q-8 -28 -16 -24Z", WEISS) + P("M16 -47Q8 -51 0 -46.6V-23.6Q8 -28 16 -24Z", "#fbf8f2") +
      S("M-13 -41q5-2 10 0M-13 -36q5-2 10 0M-13 -31q5-2 10 0M3 -41q5-2 10 0M3 -36q5-2 10 0M3 -31q4-1.6 8 0", "#9aa5b1", 1) +
      R(-62, -64, 124, 8, HOLZ, 4) },
    e_ohrensessel: { name: "Ohrensessel", der: "der Ohrensessel", w: 72, h: 78, farbe: "#2f7d4f", tags: ["sitz", "sofa"], d: (c) =>
      R(-24, -78, 48, 50, shade(c, -0.12), 12) + P("M-24 -72q-11 0-12 12v18h12z", shade(c, -0.04)) + P("M24 -72q11 0 12 12v18h-12z", shade(c, -0.04)) +
      C(-10, -64, 1.6, shade(c, -0.35)) + C(10, -64, 1.6, shade(c, -0.35)) + C(0, -56, 1.6, shade(c, -0.35)) + C(-10, -48, 1.6, shade(c, -0.35)) + C(10, -48, 1.6, shade(c, -0.35)) +
      R(-30, -11, 6, 11, HOLZ_DD, 2) + R(24, -11, 6, 11, HOLZ_DD, 2) + R(-34, -24, 68, 14, c, 5) + R(-25, -36, 50, 12, shade(c, 0.16), 5) +
      R(-36, -46, 13, 32, c, 6) + R(23, -46, 13, 32, c, 6) + R(-35, -46, 11, 4, shade(c, 0.2), 2) + R(24, -46, 11, 4, shade(c, 0.2), 2) },
    e_leselampe: { name: "Leselampe", der: "die Leselampe", klein: true, w: 34, h: 30, licht: true, tags: ["lampe"], d: () =>
      E(0, -2.6, 9, 2.4, "#d9a53a") + R(-7, -5, 14, 3, "#e8b94f", 1.5) + R(-1.2, -19, 2.4, 15, "#e8b94f", 1) + S("M9 -16.6v6", "#e8b94f", 0.8) + C(9, -10, 1.1, "#e8b94f") +
      P("M-16 -18q1-10 16-10q15 0 16 10z", "#2f7d4f") + S("M-10 -21q3-4 9-5", "#5fae7d", 1.4) + R(-16, -19, 32, 2.4, "#e8b94f", 1) + E(0, -15.8, 11, 1.8, "#fff6c2", `opacity="0.85"`) },
    e_rueckgabe: { name: "Bücherrückgabe", der: "die Bücherrückgabe", w: 56, h: 76, farbe: "#4f8ef7", d: (c) =>
      leg(-24, 4, DUNKEL, 6) + leg(18, 4, DUNKEL, 6) + R(-26, -62, 52, 58, c, 6) + R(-28, -66, 56, 6, shade(c, -0.3), 3) +
      R(-15, -55, 30, 5, "#1f2733", 2.5) + R(-7, -74, 14, 21, "#ef5350", 2) + R(-7, -74, 2.6, 21, "#c62828", 1) + R(-2.6, -70, 7.6, 4, WEISS, 1) +
      R(-19, -44, 38, 32, "#1f3b6e", 3) + R(-16, -19, 32, 6, "#7cc05e", 1.5) + R(-13, -25, 25, 6, "#ffd166", 1.5) + R(-10, -31, 22, 6, "#ff9fb5", 1.5) +
      P("M4 -31l9-10l3.6 3l-9 10z", "#a78bfa") + R(-19, -44, 38, 32, "#cfeef9", 3, `opacity="0.22"`) + S("M-15 -40h6M-15 -36.6h3", WEISS, 1.4, `opacity="0.7"`) },
    e_leiseschild: { name: "Leise-Schild", der: "das Leise-Schild", art: "wand", w: 40, h: 46, d: () =>
      R(-20, -23, 40, 46, WEISS, 6, `stroke="#a8ddf0" stroke-width="2"`) + C(0, -6, 12, "#ffd166") + S("M-7 -9q2.5-2.5 5 0M2 -9q2.5-2.5 5 0", TINTE, 1.4) +
      E(0, -0.6, 2.2, 1.6, "#c2603d") + R(-4, 4, 8, 6.4, "#f5b98a", 3) + R(-1.6, -5, 3.2, 12, "#f5b98a", 1.6) + T(0, 19.5, "PSST", 8, "#3a86ff") },
    e_lupe: { name: "Lupe", der: "die Lupe", klein: true, w: 26, h: 28, d: () =>
      S("M2 -10L10 -1.5", HOLZ_DD, 4) + S("M0 -12.5L2.6 -9.8", METALL_D, 3.4) + C(-5, -19, 8, "#2d3748") + C(-5, -19, 6.2, "#cfeef9") + S("M-9 -21q1-3 4-4", WEISS, 1.4) },
    e_karteikasten: { name: "Karteikasten", der: "der Karteikasten", w: 62, h: 72, farbe: HOLZ, d: (c) =>
      leg(-27, 6, shade(c, -0.35), 5) + leg(22, 6, shade(c, -0.35), 5) + R(-30, -72, 60, 66, c, 4) +
      "ABCDEFGHIJKL".split("").map((buchstabe, i) => {
        const x = -26 + (i % 3) * 18;
        const y = -68 + Math.floor(i / 3) * 15.5;
        return R(x, y, 16, 13, shade(c, 0.15), 2) + R(x + 4, y + 1.6, 8, 5.6, "#fbf8f2", 1) + T(x + 8, y + 6.3, buchstabe, 5, TINTE) + R(x + 5, y + 9.4, 6, 2, shade(c, -0.35), 1);
      }).join("") },
    e_offenesbuch: { name: "Offenes Buch", der: "das offene Buch", klein: true, w: 36, h: 26, tags: ["buecher"], d: () =>
      P("M-17 -5Q-8 -8 0 -5Q8 -8 17 -5V-22Q8 -25 0 -22Q-8 -25 -17 -22Z", "#3a86ff") +
      P("M-15 -7Q-7 -9.6 0 -6.6V-22Q-7 -25 -15 -22.6Z", WEISS) + P("M15 -7Q7 -9.6 0 -6.6V-22Q7 -25 15 -22.6Z", "#fbf8f2") + S("M0 -22V-6.6", RAND, 1) +
      S("M-12 -19q5-1.5 9 0M-12 -15.5q5-1.5 9 0M-12 -12q5-1.5 9 0M3 -19q5-1.5 9 0M3 -15.5q5-1.5 9 0M3 -12q4-1 7 0", "#9aa5b1", 0.9) +
      R(-12, -4.5, 24, 4.5, HOLZ_D, 2) },

    // --- Schulzimmer --------------------------------------------------------------
    e_lehrerpult: { name: "Lehrerpult", der: "das Lehrerpult", w: 104, h: 56, farbe: HOLZ, flaeche: -56, tags: ["tisch", "pult", "schreibtisch"], d: (c) =>
      R(-48, -4, 10, 4, shade(c, -0.3), 1.5) + R(38, -4, 10, 4, shade(c, -0.3), 1.5) + R(-48, -48, 96, 44, c, 3) + R(-42, -43, 50, 34, shade(c, 0.1), 3) +
      [-44, -31, -18].map((y) => R(14, y, 30, 11, shade(c, 0.14), 2) + R(25, y + 4.5, 8, 2.4, DUNKEL, 1.2)).join("") + R(-52, -56, 104, 8, shade(c, -0.12), 3) },
    e_faecherregal: { name: "Fächerregal", der: "das Fächerregal", w: 92, h: 92, farbe: HOLZ, tags: ["regal"], d: (c) =>
      leg(-42, 4, shade(c, -0.35), 6) + leg(36, 4, shade(c, -0.35), 6) + R(-46, -92, 92, 88, c, 4) + R(-42, -88, 84, 80, "#f3e6d2", 2) +
      Array.from({ length: 12 }, (_, i) => {
        const x = -40 + (i % 3) * 27.3;
        const y = -86 + Math.floor(i / 3) * 19.5;
        const f = BUNT[(i * 3 + Math.floor(i / 3)) % BUNT.length];
        return R(x, y, 25, 17, f, 3) + R(x + 8.5, y + 3.5, 8, 3, shade(f, -0.25), 1.5) + R(x + 7, y + 10, 11, 4.5, WEISS, 1);
      }).join("") },
    e_hellraumprojektor: { name: "Hellraumprojektor", der: "der Hellraumprojektor", w: 72, h: 104, licht: true, d: () =>
      R(-32, -37, 4, 30, METALL, 1.5) + R(28, -37, 4, 30, METALL, 1.5) + R(-34, -16, 68, 4, METALL, 2) + R(-34, -42, 68, 5, METALL_D, 2) + C(-30, -4, 4, DUNKEL) + C(30, -4, 4, DUNKEL) +
      R(17, -100, 4, 40, METALL_D, 2) + R(-24, -60, 48, 18, "#e2e8f0", 4) + S("M-18 -51h12M-18 -47h12", "#cbd5e0", 1.4) + C(14, -50, 2.4, "#7cc05e") + R(-22, -62, 44, 3, "#bfe6f5", 1.5) +
      P("M-6 -100l-14-4v8z", "#fff6c2", `opacity="0.7"`) + R(-6, -104, 30, 10, "#2d3748", 3) + E(4, -93, 6, 2, "#a8d8f8") },
    e_rechenrahmen: { name: "Rechenrahmen", der: "der Rechenrahmen", klein: true, w: 40, h: 38, d: () => {
      // Fünf Stangen mit je sieben Kugeln, links und rechts verschieden weit geschoben.
      const reihen = [[2, "#ef5350"], [4, "#ffd166"], [1, "#3a86ff"], [5, "#7cc05e"], [3, "#ff9f43"]];
      return R(-19, -38, 3.6, 34, HOLZ_D, 1.8) + R(15.4, -38, 3.6, 34, HOLZ_D, 1.8) + R(-17, -38, 34, 3, HOLZ, 1.5) +
        reihen.map(([links, f], r) => {
          const y = -31 + r * 5;
          let s = S(`M-15.4 ${y}H15.4`, METALL, 0.9);
          for (let i = 0; i < 7; i += 1) s += C(i < links ? -13.4 + i * 4 : 13.4 - (6 - i) * 4, y, 2, f);
          return s;
        }).join("") + R(-20, -6, 40, 6, HOLZ, 2.5);
    } },
    e_schulsack: { name: "Schulsack", der: "der Schulsack", klein: true, w: 32, h: 36, farbe: "#3a86ff", d: (c) =>
      S("M-11 -30q-5 6-4 16M11 -30q5 6 4 16", shade(c, -0.3), 2.4) + S("M-4 -32q4-4.4 8 0", DUNKEL, 2) + R(-13, -32, 26, 32, c, 6) +
      P("M-13 -26q0-6 6-6h14q6 0 6 6v12h-26z", shade(c, -0.15)) + R(-10, -22, 6, 4, "#ffd166", 1) + R(4, -22, 6, 4, "#ffd166", 1) + R(-3, -16.4, 6, 4, DUNKEL, 1) +
      R(-9, -8, 18, 5, shade(c, 0.2), 2) },
    e_farbstifte: { name: "Farbstifte", der: "die Farbstifte", klein: true, w: 20, h: 34, tags: ["malen"], d: () =>
      R(-9, -29, 3.5, 16, "#ffd166", 0.8) + S("M-9 -27h1.6M-9 -24h1.6M-9 -21h1.6M-9 -18h1.6", "#b9902a", 0.6) +
      [[-4.6, -26, "#ef5350"], [-1.2, -29, "#3a86ff"], [2.2, -27, "#7cc05e"], [5.6, -28, "#ff9f43"]].map(([x, top, f]) =>
        R(x - 1.5, top, 3, 20, f, 0.6) + P(`M${x - 1.5} ${top}l1.5-4l1.5 4z`, "#f2d3a0") + P(`M${x - 0.6} ${top - 2.4}l.6-1.6l.6 1.6z`, f)).join("") +
      R(-8, -16, 16, 16, "#a78bfa", 3) + R(-8, -12, 16, 3, shade("#a78bfa", 0.3)) },
    e_znueni: { name: "Znüni", der: "das Znüni", klein: true, w: 34, h: 20, tags: ["essen"], d: () =>
      P("M-14 -10L-8 -18L-1 -10Z", "#e8b06a") + P("M-12.4 -10.6L-8 -16.4L-3 -10.6Z", "#f6d48b") + P("M-5 -10L1 -16.6L5 -10Z", "#d99a55") + R(-4, -12.4, 8, 1.6, "#7cc05e", 0.6) +
      R(-16, -10, 22, 10, "#6cc3d5", 2.5) + R(-16, -10, 22, 2.6, shade("#6cc3d5", -0.15), 1.2) + C(-5, -4.6, 2.4, WEISS, `opacity="0.5"`) +
      C(11, -6, 5.5, "#ef5350") + C(9.4, -7.8, 1.4, WEISS, `opacity="0.7"`) + S("M11 -11.5l1-2.5", HOLZ_DD, 1) + P("M12 -13q3-2 4 0q-2 2-4 0z", "#5cb85c") },
    e_abcplakat: { name: "ABC-Plakat", der: "das ABC-Plakat", art: "wand", w: 62, h: 72, tags: ["bild"], d: () =>
      R(-31, -36, 62, 72, WEISS, 2, rand(1.5)) + T(-17, -10, "A", 22, "#ef5350") + T(0, -10, "B", 22, "#3a86ff") + T(17, -10, "C", 22, "#7cc05e") +
      C(-17, 7, 6, "#ef5350") + S("M-17 1l1-3", HOLZ_DD, 1.2) + P("M-16 -1q3-2 5 0q-3 2-5 0z", "#5cb85c") + C(-19, 5, 1.4, WEISS, `opacity="0.7"`) +
      C(0, 7, 6, "#3a86ff") + P("M-6 7a6 6 0 0 0 12 0z", "#ffd166") + P("M-2 7a2 6 0 0 0 4 0z", WEISS) +
      C(12, 6, 2.6, "#ff9f43") + C(22, 6, 2.6, "#ff9f43") + C(17, 7.5, 5.4, "#ffe0c2") + P("M12.6 3l4.4-9l4.4 9z", "#a78bfa") + C(17, -6.4, 1.4, "#ffd166") +
      C(15, 6.6, 0.9, TINTE) + C(19, 6.6, 0.9, TINTE) + C(17, 8.6, 1.6, "#ef5350") + S("M15 10.6q2 1.6 4 0", "#c2603d", 0.8) +
      T(-17, 28, "a", 12, "#ef5350") + T(0, 28, "b", 12, "#3a86ff") + T(17, 28, "c", 12, "#7cc05e") },
    e_zahlenplakat: { name: "Zahlenplakat", der: "das Zahlenplakat", art: "wand", w: 72, h: 46, tags: ["bild"], d: () => {
      const punkte = { 1: [[0, 0]], 2: [[-3, -3], [3, 3]], 3: [[-3, -3], [0, 0], [3, 3]], 4: [[-3, -3], [3, -3], [-3, 3], [3, 3]], 5: [[-3, -3], [3, -3], [0, 0], [-3, 3], [3, 3]] };
      const farben = ["#ef5350", "#ff9f43", "#3a86ff", "#7cc05e", "#a78bfa"];
      return R(-36, -23, 72, 46, "#fff1b8", 2, `stroke="#f2d38a" stroke-width="1.5"`) +
        [1, 2, 3, 4, 5].map((n, i) => {
          const x = -28 + i * 14;
          return T(x, -4, String(n), 14, farben[i]) + R(x - 6, 5, 12, 12, WEISS, 2.5) + punkte[n].map(([dx, dy]) => C(x + dx, 11 + dy, 1.5, farben[i])).join("");
        }).join("");
    } },
    e_pausenglocke: { name: "Pausenglocke", der: "die Pausenglocke", art: "wand", w: 40, h: 44, d: () =>
      R(-12, -22, 24, 5, HOLZ_D, 2.5) + S("M0 -17v4", METALL_D, 2) + S("M-18 -4q-3 5 0 10M18 -4q3 5 0 10", "#ffb020", 1.4) +
      S("M0 14v6", "#c4a57e", 1.4) + C(0, 15, 2.6, "#a87b22") + P("M-11 9q0-20 11-22q11 2 11 22l3 4h-28z", "#e8b94f") + R(-14, 11, 28, 3, "#d9a53a", 1.5) + S("M-5 -6q-3 6-3 13", "#fff1b8", 1.6) },

    // --- Kita ---------------------------------------------------------------------
    e_gitterbett: { name: "Gitterbett", der: "das Gitterbett", w: 86, h: 72, farbe: "#7cc05e", tags: ["bett", "babybett"], d: (c) =>
      R(-36, -30, 72, 8, "#fbf8f2", 3) + R(-34, -38.6, 17, 9, WEISS, 4, rand(1)) + P("M-14 -36h44q2 0 2 2v6h-46z", "#ffd166") + C(-2, -32, 1.4, WEISS) + C(10, -33, 1.4, WEISS) + C(22, -32, 1.4, WEISS) +
      R(-36, -24, 72, 6, shade(c, -0.1), 3) + [-30, -21, -12, -3, 6, 15, 24].map((x) => R(x, -58, 3.5, 34, shade(c, 0.15), 1.75)).join("") + R(-36, -64, 72, 6, shade(c, 0.15), 3) +
      R(-43, -72, 7, 72, c, 3) + R(36, -72, 7, 72, c, 3) + stern(-39.5, -64, 3, "#ffd166") + stern(39.5, -64, 3, "#ffd166") },
    e_spielmatte: { name: "Spielmatte", der: "die Spielmatte", art: "flach", w: 130, h: 12, tags: ["teppich"], d: () => {
      // Puzzle-Platten, leicht von oben gesehen: Oberseite schräg, vorne die Kante.
      const farben = ["#ff7a7a", "#ffd166", "#7cc05e", "#6cc3d5", "#a78bfa"];
      return farben.map((f, i) => P(`M${z(-61 + i * 25.2)} -12h25.2l-4 9h-25.2z`, f) + R(z(-65 + i * 25.2), -3.4, 25.2, 3.4, shade(f, -0.22), i === 0 || i === 4 ? 1.6 : 0)).join("") +
        farben.slice(0, 4).map((f, i) => C(z(-63 + (i + 1) * 25.2 + 1.8), -7.5, 2.6, f)).join("") + S("M-58 -10.4h21M-33 -10.4h21M-8 -10.4h21M17 -10.4h21M42 -10.4h21", WEISS, 1, `opacity="0.45"`);
    } },
    e_ziehwagen: { name: "Ziehwagen", der: "der Ziehwagen", w: 62, h: 42, farbe: "#ef5350", tags: ["spielzeug"], d: (c) =>
      R(-20, -33, 11, 11, "#3a86ff", 1.5) + C(-3, -27, 5.6, "#7cc05e") + P("M4 -21l6-11l6 11z", "#ffd166") + R(-17, -40, 6, 6, "#ff9f43", 1) +
      R(-24, -22, 40, 13, c, 3) + R(-22, -19, 36, 3, shade(c, 0.2), 1.5) + S("M16 -16q10 2 12 12", DUNKEL, 1.2) + C(28, -3, 2.4, HOLZ_D) +
      C(-15, -6, 6, "#ffd166") + C(-15, -6, 2, "#e8a23a") + C(7, -6, 6, "#ffd166") + C(7, -6, 2, "#e8a23a") },
    e_kinderstuehlchen: { name: "Kinderstühlchen", der: "das Kinderstühlchen", w: 30, h: 44, farbe: "#ff9f43", tags: ["stuhl", "sitz"], d: (c) =>
      R(-11, -32, 3.5, 12, shade(c, -0.18), 1.5) + R(7.5, -32, 3.5, 12, shade(c, -0.18), 1.5) + R(-12, -20, 4.5, 20, shade(c, -0.18), 2) + R(7.5, -20, 4.5, 20, shade(c, -0.18), 2) +
      R(-12, -44, 24, 14, c, 5) + herz(0, -37, 7, WEISS) + R(-14, -24, 28, 5, shade(c, 0.15), 2.5) },
    e_kitagarderobe: { name: "Kita-Garderobe", der: "die Kita-Garderobe", art: "wand", w: 100, h: 46, tags: ["garderobe"], d: () => {
      // Über jedem Haken das Zeichen eines Kindes: Sonne, Herz, Stern, Blume.
      const zeichen = [
        (x) => C(x, -17, 2.4, "#ffd166") + S(`M${x} -20.6v-.8M${x} -13.4v.8M${x - 3.6} -17h-.8M${x + 3.6} -17h.8`, "#ffd166", 1),
        (x) => herz(x, -17, 5, "#ef5350"),
        (x) => stern(x, -17, 3.4, "#3a86ff"),
        (x) => C(x + 1.8, -17, 1.4, "#a78bfa") + C(x - 1.8, -17, 1.4, "#a78bfa") + C(x, -15.2, 1.4, "#a78bfa") + C(x, -18.8, 1.4, "#a78bfa") + C(x, -17, 1.1, "#ffd166"),
      ];
      const jacke = (x, f) => R(x - 10.5, -4, 4, 18, shade(f, -0.12), 2) + R(x + 6.5, -4, 4, 18, shade(f, -0.12), 2) + R(x - 7.5, -6, 15, 26, f, 3) + S(`M${x} -3v21`, shade(f, -0.25), 1) + P(`M${x - 4} -6l4 4 4-4z`, shade(f, -0.2));
      return R(-50, -23, 100, 12, HOLZ, 3) + [-36, -12, 12, 36].map((x, i) => R(x - 5.5, -21, 11, 8, WEISS, 2) + zeichen[i](x) + S(`M${x} -11v4q0 2.6 2.6 2.6`, METALL_D, 1.8)).join("") +
        jacke(-36, "#ef5350") +
        S("M-15 -5q3-4 6 0", "#2f6fd6", 1.6) + R(-20, -4, 16, 20, "#3a86ff", 4) + R(-20, -4, 16, 8, "#2f6fd6", 4) + R(-17, 9, 10, 5, "#6fa8ff", 2) +
        jacke(12, "#ffd166") +
        P("M28 0q8-4 16 0l2 20q-10 4-20 0z", "#7cc05e") + S("M30 0L36 -6L42 0", "#4a8f3a", 1.2);
    } },
    e_bilderbuchregal: { name: "Bilderbuchregal", der: "das Bilderbuchregal", w: 80, h: 78, farbe: HOLZ, tags: ["buecher", "regal"], d: (c) =>
      leg(-36, 4, shade(c, -0.35), 5) + leg(31, 4, shade(c, -0.35), 5) + R(-40, -78, 80, 74, c, 4) + R(-36, -74, 72, 66, "#f3e6d2", 2) +
      [-52, -29, -6].map((y, reihe) => [-33, -9, 15].map((x, i) => bilderbuch(x, y - 19, reihe * 3 + i)).join("") + R(-36, y - 2, 72, 4, shade(c, -0.2), 1.5)).join("") },
    e_stofftierkorb: { name: "Stofftierkorb", der: "der Stofftierkorb", w: 50, h: 52, tags: ["kuscheltier", "spielzeug"], d: () =>
      E(8, -44, 2.6, 7.5, "#f2e6ea") + E(15, -43, 2.6, 7.5, "#f2e6ea") + E(8, -44, 1.2, 5.5, "#ffb3c7") + E(15, -43, 1.2, 5.5, "#ffb3c7") + C(11.5, -32, 7.5, "#f2e6ea") +
      C(9, -33, 1, TINTE) + C(14, -33, 1, TINTE) + C(11.5, -30.4, 1, "#ff7aa2") +
      C(-16, -38, 3.6, "#c88c5c") + C(-4, -38, 3.6, "#c88c5c") + C(-10, -31, 8.5, "#c88c5c") + E(-10, -28, 3.6, 2.6, "#e8c49a") + E(-10, -29, 1.3, 0.9, TINTE) + C(-13, -32.5, 1, TINTE) + C(-7, -32.5, 1, TINTE) +
      P("M-23 -25h46l-4 25h-38z", "#d9a066") + S("M-21.4 -17h42.8M-20 -9h40", "#b9773a", 1.4) + S("M-12 -24v23M0 -24v23M12 -24v23", "#c98d55", 1.2) + R(-25, -28, 50, 5, "#c98d55", 2.5) },
    e_baellebad: { name: "Bällebad", der: "das Bällebad", w: 110, h: 46, farbe: "#3a86ff", tags: ["ball", "spielzeug"], d: (c) => {
      const reihen = [[-40, [-36, -24, -12, 0, 12, 24, 36]], [-34, [-46, -34.5, -23, -11.5, 0, 11.5, 23, 34.5, 46]], [-28, [-48, -36, -24, -12, 0, 12, 24, 36, 48]]];
      const farben = ["#ff7a7a", "#ffd166", "#7cc05e", "#6cc3d5", "#ff9f6b", "#a78bfa", "#ff6fa5"];
      return reihen.map(([y, xs], r) => xs.map((x, i) => C(x, y, 6, farben[(i * 2 + r * 3) % farben.length]) + C(x - 2, y - 2.2, 1.4, WEISS, `opacity="0.6"`)).join("")).join("") +
        R(-55, -30, 110, 30, c, 9) + R(-53, -30, 106, 5, shade(c, 0.25), 2.5) + S("M-27 -24v20M0 -24v20M27 -24v20", shade(c, -0.18), 2);
    } },
    e_schoppen: { name: "Schoppen", der: "der Schoppen", klein: true, w: 16, h: 32, tags: ["milch"], d: () =>
      R(-6.5, -22, 13, 22, "#d6eef8", 4, `stroke="#a8ddf0" stroke-width="1"`) + R(-5.5, -15, 11, 14, WEISS, 3) + S("M-5 -12h2.4M-5 -8h2.4M-5 -4h2.4", "#9fc6d6", 0.8) +
      R(-7.5, -25, 15, 4.5, "#ff9fb5", 2) + P("M-3.6 -25q0-6 3.6-7q3.6 1 3.6 7z", "#f2c38a") },
    e_kinderwagen: { name: "Kinderwagen", der: "der Kinderwagen", w: 76, h: 70, farbe: "#7c5ce6", d: (c) =>
      S("M-22 -10.5L-12 -26M16 -10.5L8 -26", METALL_D, 2.4) + S("M16 -42L30 -64h6", METALL_D, 3) +
      P("M-30 -46h46v8q0 14-20 16h-8q-18-2-18-16z", c) + R(-30, -46, 46, 4, shade(c, 0.25), 2) + P("M-30 -46a22 22 0 0 1 22-22v22z", shade(c, -0.18)) +
      S("M-26 -57q6-4 11-3M-20 -63q4-2 8-2", shade(c, -0.35), 1.2) +
      C(-22, -10.5, 9, "none", `stroke="${DUNKEL}" stroke-width="3"`) + C(-22, -10.5, 2, METALL_D) + C(16, -10.5, 9, "none", `stroke="${DUNKEL}" stroke-width="3"`) + C(16, -10.5, 2, METALL_D) },
    e_mobile: { name: "Mobile", der: "das Mobile", art: "decke", w: 72, h: 60, d: () =>
      R(-0.6, 0, 1.2, 16, METALL) + C(0, 16, 2, HOLZ_D) + S("M-28 20q28-8 56 0", HOLZ_D, 2) + S("M-26 19.4v14M0 16v26M24 19.6v12", METALL, 0.8) +
      P("M-23 34a8 8 0 1 0 0 15a6.5 6.5 0 1 1 0-15z", "#ffd166") + stern(0, 49, 8, "#ff9f43") +
      C(19.5, 37, 4.5, "#a8d8f8") + C(25, 34, 5.5, "#a8d8f8") + C(30.5, 37, 4.5, "#a8d8f8") + R(16, 36.4, 18, 5.6, "#a8d8f8", 2.8) },
    e_stapelturm: { name: "Stapelturm", der: "der Stapelturm", klein: true, w: 26, h: 36, tags: ["spielzeug"], d: () =>
      R(-1.5, -32, 3, 28, HOLZ_D, 1.5) + R(-11.5, -11.5, 23, 6.5, "#ef5350", 3.25) + R(-10, -17.5, 20, 6.5, "#ff9f43", 3.25) + R(-8.5, -23.5, 17, 6.5, "#ffd166", 3.25) +
      R(-7, -29.5, 14, 6.5, "#7cc05e", 3.25) + C(0, -32, 3.4, "#3a86ff") + R(-13, -5, 26, 5, HOLZ, 2.5) },

    // --- Toiletten ----------------------------------------------------------------
    e_wckabine: { name: "WC-Kabine", der: "die WC-Kabine", w: 84, h: 142, farbe: "#6cc3d5", tags: ["wc"], d: (c) =>
      R(-8, -20, 16, 20, WEISS, 3, rand(1.5)) + R(-42, -136, 7, 128, shade(c, -0.18), 2) + R(35, -136, 7, 128, shade(c, -0.18), 2) +
      R(-41, -8, 5, 8, METALL_D, 1.5) + R(36, -8, 5, 8, METALL_D, 1.5) + R(-34, -130, 68, 112, c, 3) + R(-28, -92, 56, 64, shade(c, 0.12), 3) +
      R(-35, -122, 3, 8, METALL_D, 1) + R(-35, -36, 3, 8, METALL_D, 1) + R(-42, -142, 84, 6, METALL, 2.5) +
      R(-11, -114, 22, 14, WEISS, 3) + T(0, -103.4, "WC", 10, TINTE) + C(22, -82, 4, "#7cc05e", `stroke="${METALL_D}" stroke-width="1.2"`) + R(16, -72, 10, 4, METALL_D, 2) },
    e_pissoir: { name: "Pissoir", der: "das Pissoir", w: 36, h: 86, tags: ["wc"], d: () =>
      R(-2, -86, 4, 22, METALL, 2) + R(-5, -68, 10, 6, METALL_D, 2) + R(-2.5, -24, 5, 24, METALL, 1.5) +
      P("M-13 -62q13-4 26 0q3 1 3 6v20q0 16-16 20q-16-4-16-20v-20q0-5 3-6z", WEISS, rand(2)) + P("M-9 -46q9-3 18 0v9q0 9-9 11q-9-2-9-11z", "#dfeaf1") +
      E(0, -29.6, 3, 1.2, "#9fc6d6") + S("M-11 -56q2-2 6-2.4", RAND, 1.4) },
    e_doppellavabo: { name: "Doppellavabo", der: "das Doppellavabo", w: 124, h: 66, flaeche: -52, fx: [-10, 10], tags: ["lavabo"], d: () =>
      [-32, 32].map((x) => R(x - 2, -32, 4, 32, METALL, 1.5) + P(`M${x - 20} -46h40q-2 16-20 16q-18 0-20-16z`, WEISS, rand(2)) + S(`M${x} -52v-9h7`, METALL, 3.2) + R(x - 4, -64, 8, 3, METALL_D, 1.5)).join("") +
      R(-62, -52, 124, 7, "#e2e8f0", 3) },
    e_wickeltisch: { name: "Wickeltisch", der: "der Wickeltisch", w: 92, h: 70, farbe: "#a8d8f8", d: (c) =>
      leg(-40, 4, DUNKEL, 5) + leg(35, 4, DUNKEL, 5) + R(-42, -50, 84, 46, c, 4) + R(-37, -45, 36, 36, shade(c, -0.15), 3) +
      R(-34, -21, 30, 11, WEISS, 5, rand(0.8)) + R(-32, -32, 26, 10, WEISS, 5, rand(0.8)) + R(-24, -19, 6, 3, "#ffd166", 1) + R(-23, -30, 6, 3, "#ff9fb5", 1) +
      R(3, -45, 34, 36, shade(c, 0.18), 3) + C(8, -27, 2, DUNKEL) +
      R(-44, -58, 88, 9, "#ff9fb5", 4) + R(-46, -66, 12, 17, "#ff9fb5", 6) + R(34, -66, 12, 17, "#ff9fb5", 6) + C(-20, -53.6, 1.4, WEISS) + C(-6, -53.6, 1.4, WEISS) + C(24, -53.6, 1.4, WEISS) +
      E(12, -61.5, 5, 3.4, "#ffd166") + C(15.5, -65.5, 2.8, "#ffd166") + P("M18 -66l2.6.8l-2.6.8z", "#ff9f43") + C(16, -66.2, 0.6, TINTE) },
    e_putzwagen: { name: "Putzwagen", der: "der Putzwagen", w: 78, h: 88, d: () =>
      R(18, -80, 4, 66, METALL_D, 2) + S("M22 -80h8v8", METALL_D, 3) + S("M-16 -42L-6 -86", HOLZ, 2.6) +
      P("M-34 -40h28l-3 26h-22z", "#3a86ff") + R(-35, -42, 30, 3, "#2f6fd6", 1.5) + S("M-32 -42q12-10 24 0", METALL_D, 1.4) + S("M-14 -40l2-6M-10 -40l-1-5", "#e2e8f0", 2) +
      R(0, -48, 30, 4, METALL, 2) + [[6, "#7cc05e"], [16, "#ff9fb5"]].map(([x, f]) => R(x - 3, -62, 6, 14, f, 2) + R(x - 2.5, -67, 5, 5.4, "#f1f5f9", 1.5) + R(x + 2.4, -66.6, 3, 1.8, "#cbd5e0", 0.8) + S(`M${x + 1} -61.6l2 3`, "#cbd5e0", 1)).join("") +
      R(22, -40, 12, 24, "#ffd166", 3) + S("M24 -40l4-4l4 4", "#e8b94f", 1.2) +
      R(-36, -14, 70, 6, DUNKEL, 2.5) + C(-30, -4, 4, DUNKEL) + C(28, -4, 4, DUNKEL) },
    e_abfallkuebel: { name: "Abfallkübel", der: "der Abfallkübel", w: 32, h: 46, farbe: "#7cc05e", d: (c) =>
      P("M-13 -38h26l-2.4 35h-21.2z", c) + R(-9, -34, 3, 26, shade(c, 0.25), 1.5) + R(-11.5, -3, 23, 3, shade(c, -0.3), 1.5) + R(-6, -4, 12, 3, METALL_D, 1.5) +
      P("M-15 -38q15-9 30 0z", shade(c, -0.15)) + R(-15, -39.5, 30, 3, shade(c, -0.25), 1.5) + R(-3, -44, 6, 2.6, shade(c, -0.3), 1.2) },
    e_warnschild: { name: "Warnschild", der: "das Warnschild", w: 36, h: 56, d: () =>
      R(-18, -3, 5, 3, DUNKEL, 1.5) + R(13, -3, 5, 3, DUNKEL, 1.5) + P("M-10 -54h20l7 52h-34z", "#ffd000") + S("M-10 -54h20l7 52h-34z", "#e6b800", 1.6) + R(-4, -51, 8, 3, "#e6b800", 1.5) +
      S("M0 -42l11 19h-22z", TINTE, 1.8) + R(-1.2, -37, 2.4, 8, TINTE, 1.2) + C(0, -26.4, 1.4, TINTE) + S("M-12 -14q2-2 4 0t4 0t4 0t4 0t4 0t4 0", "#3a86ff", 1.4) },
    e_haendetrockner: { name: "Händetrockner", der: "der Händetrockner", art: "wand", w: 40, h: 46, d: () =>
      R(-17, -23, 34, 24, WEISS, 7, rand(2)) + R(-12, -18, 24, 3, "#e2e8f0", 1.5) + C(11, -10, 1.8, "#7cc05e") + R(-8, 0, 16, 5, "#cbd5e0", 2.5) +
      S("M-5 8q2 3 0 6t0 6M0 8q2 3 0 6t0 6M5 8q2 3 0 6t0 6", "#6cc3d5", 1.3) },
    e_seifenspender: { name: "Seifenspender", der: "der Seifenspender", art: "wand", w: 24, h: 38, d: () =>
      R(-8, -17, 16, 25, WEISS, 4, rand(1.5)) + R(-4.5, -13, 9, 11, "#ff9fb5", 2) + R(-6.5, 7, 13, 4, "#cbd5e0", 2) + R(-1.5, 11, 3, 3, METALL_D, 1) +
      P("M0 15.4q2 2.6 0 3.4q-2-.8 0-3.4z", "#ff9fb5") + C(9, -8, 2.4, "none", `stroke="#a8ddf0" stroke-width="1"`) + C(10, -2, 1.5, "none", `stroke="#a8ddf0" stroke-width="1"`) + C(-9.5, 12, 1.8, "none", `stroke="#a8ddf0" stroke-width="1"`) },
    e_papiertuchspender: { name: "Papiertuchspender", der: "der Papiertuchspender", art: "wand", w: 34, h: 44, tags: ["handtuch"], d: () =>
      R(-16, -22, 32, 30, "#e2e8f0", 4, `stroke="#cbd5e0" stroke-width="1.5"`) + R(-6, -16, 12, 3, "#9aa5b1", 1.5) + R(-11, 5, 22, 3, "#9aa5b1", 1.5) +
      P("M-9 7h18l-1.5 13h-15z", WEISS, rand(1)) + S("M-6 13h12", RAND, 0.8) },
    e_wcschild: { name: "WC-Schild", der: "das WC-Schild", art: "wand", w: 46, h: 46, d: () =>
      R(-23, -23, 46, 46, WEISS, 6, rand(2)) + T(0, -6, "WC", 15, TINTE) + S("M0 0v18", RAND, 1.4) +
      C(-11, 2, 2.6, "#3a86ff") + R(-14.5, 5.5, 7, 8, "#3a86ff", 2) + R(-14, 13, 2.6, 6, "#3a86ff", 1) + R(-10.6, 13, 2.6, 6, "#3a86ff", 1) +
      C(11, 2, 2.6, "#ef5350") + P("M11 5.5l5 9h-10z", "#ef5350") + R(8.6, 14, 2.4, 5, "#ef5350", 1) + R(11, 14, 2.4, 5, "#ef5350", 1) },
    e_wcpapier: { name: "WC-Papier", der: "das WC-Papier", klein: true, w: 28, h: 30, d: () => {
      const rolle = (x, y) => R(x - 6, y - 12, 12, 12, WEISS, 2, rand(1.5)) + E(x, y - 12, 6, 2, WEISS, rand(1.5)) + E(x, y - 12, 2, 0.8, "#cbd5e0");
      return rolle(-6.5, 0) + rolle(6.5, 0) + rolle(0, -13) + P("M6 -22v9q-1 1-2 0v-8z", WEISS, rand(0.8));
    } },
  };

  const RAEUME = {
    restaurant: ["e_salatbuffet", "e_servierwagen", "e_hochstuhl", "e_polsterbank", "e_kochmuetze", "e_spaghetti", "e_roesti", "e_fondue", "e_servierglocke", "e_wasserkrug", "e_kerzenstaender",
      "barhocker", "pizzaofen", "pizza", "restauranttisch", "stuhl", "menuetafel", "teller", "kaffeetasse", "blumenvase", "kronleuchter"],
    cafe: ["e_tortenvitrine", "e_espressomaschine", "e_bistrotisch", "e_cafestuhl", "e_tortenstueck", "e_cappuccino", "e_sirup", "e_glacebecher", "e_teekanne", "e_kreidetafel", "e_zeitungshalter",
      "glace", "kuchenvitrine", "glacetheke", "ladentheke", "kasse", "kaffeetasse", "kuchen", "gipfeli", "menuetafel", "blumenvase", "lichterkette"],
    post: ["e_postschalter", "e_postfaecher", "e_paketregal", "e_paketwaage", "e_paketwagen", "e_briefmarken", "e_stempel", "e_briefe", "e_postschild", "e_postkartenstaender", "e_postsack", "e_paket",
      "briefkasten", "pakete", "kasse", "computer", "telefon", "stuhl"],
    bibliothek: ["e_leiterregal", "e_ausleihtheke", "e_ohrensessel", "e_leselampe", "e_rueckgabe", "e_leiseschild", "e_lupe", "e_karteikasten", "e_offenesbuch",
      "buecherwagen", "lesekissen", "buecherregal", "sessel", "tisch", "stuhl", "globus", "weltkarte", "buecherstapel", "computer", "zeitungsstaender"],
    schule: ["e_lehrerpult", "e_faecherregal", "e_hellraumprojektor", "e_rechenrahmen", "e_schulsack", "e_farbstifte", "e_znueni", "e_abcplakat", "e_zahlenplakat", "e_pausenglocke",
      "wandtafel", "schulpult", "stuhl", "globus", "weltkarte", "buecherregal", "computer", "pinnwand", "staffelei", "buecherstapel"],
    kita: ["e_gitterbett", "e_spielmatte", "e_ziehwagen", "e_kinderstuehlchen", "e_kitagarderobe", "e_bilderbuchregal", "e_stofftierkorb", "e_baellebad", "e_schoppen", "e_kinderwagen", "e_mobile", "e_stapelturm",
      "spielkiste", "kloetze", "ball", "kuscheltier", "schaukelpferd", "puppenhaus", "rutsche", "tisch", "sitzsack", "girlande"],
    toiletten: ["e_wckabine", "e_pissoir", "e_doppellavabo", "e_wickeltisch", "e_putzwagen", "e_abfallkuebel", "e_warnschild", "e_haendetrockner", "e_seifenspender", "e_papiertuchspender", "e_wcschild", "e_wcpapier",
      "wc", "lavabo", "spiegel", "handtuch"],
  };

  const MOTIVE = {
    // Ein Teller Spaghetti mit Gabel und Messer
    restaurant: () => C(0, 1, 12.5, "#e8dccb") + C(0, 1, 11, WEISS) + C(0, 1, 7.5, "#f6efe4") + E(0, 1, 6, 4, "#f2cc6b") + S("M-4 1q2-2 4 0t4 0M-3 3.4q2-1.6 4 0", "#d9a93f", 0.8) + C(0, -0.6, 2.4, "#ef5350") +
      R(-19, -8, 2, 19, METALL_D, 1) + R(-21, -14, 1.2, 7, METALL_D, 0.6) + R(-19.4, -14, 1.2, 7, METALL_D, 0.6) + R(-17.8, -14, 1.2, 7, METALL_D, 0.6) + R(-21, -8.6, 4.4, 2.4, METALL_D, 1) +
      P("M17 -14q4.4 3 3.4 12h-3.4z", METALL) + R(17, -2.4, 3.4, 13, METALL_D, 1.2),
    // Eine Tasse mit Dampf
    cafe: () => E(0, 11, 15, 3.4, "#e8dccb") + E(0, 10.4, 12, 2.4, WEISS) + S("M10 0q6 0 5 5q-1 3-6 3", "#ff7aa2", 2.4) + P("M-10 -3h20q0 13-10 13q-10 0-10-13z", "#ff7aa2") +
      E(0, -3, 10, 2.6, "#8a5734") + S("M-4 -6.5q-2-2 0-4.2q2-2 0-4.2M4 -6.5q2-2 0-4.2q-2-2 0-4.2", "#c9b8a6", 1.6),
    // Ein Briefumschlag mit Marke
    post: () => R(-18, -12, 36, 24, WEISS, 2, `stroke="#d9c7a8" stroke-width="1.4"`) + S("M-18 12l13-10M18 12l-13-10", "#e8dccb", 1.2) + S("M-18 -12l18 12.6l18-12.6", "#d9c7a8", 1.4) +
      R(9, -10, 7, 8, "#ef5350", 1) + R(10.4, -8.6, 4.2, 5.2, "#ffd166", 0.5),
    // Ein offenes Buch
    bibliothek: () => P("M-21 -11Q-10 -15 0 -11Q10 -15 21 -11V11Q10 7 0 11Q-10 7 -21 11Z", "#3a86ff") +
      P("M-19 -12Q-9 -15 0 -11V9Q-9 5 -19 9Z", WEISS) + P("M19 -12Q9 -15 0 -11V9Q9 5 19 9Z", "#fbf8f2") + S("M0 -11V9", RAND, 1) +
      S("M-15 -6q6-2 11 0M-15 -1q6-2 11 0M-15 4q6-2 11 0M4 -6q6-2 11 0M4 -1q6-2 11 0M4 4q5-1.6 9 0", "#9aa5b1", 1.2),
    // ABC und ein Bleistift
    schule: () => T(-13, 5, "A", 18, "#ef5350") + T(0, 5, "B", 18, "#3a86ff") + T(13, 5, "C", 18, "#7cc05e") +
      R(-16, 9, 3, 4, "#ff9fb5", 1) + R(-13.4, 9, 21, 4, "#ffd166", 0.6) + P("M7.6 9l5 2l-5 2z", "#f2d3a0") + P("M11.2 10.4l1.4.6l-1.4.6z", TINTE),
    // Ein Teddybär mit Herzen
    kita: () => C(-9, -8, 4.4, "#c88c5c") + C(9, -8, 4.4, "#c88c5c") + C(-9, -8, 2.2, "#e8c49a") + C(9, -8, 2.2, "#e8c49a") + C(0, 1, 10, "#c88c5c") +
      E(0, 4.6, 4.6, 3.4, "#e8c49a") + E(0, 3, 1.7, 1.2, TINTE) + C(-3.6, -1.6, 1.2, TINTE) + C(3.6, -1.6, 1.2, TINTE) + S("M-1.6 6.4q1.6 1.4 3.2 0", TINTE, 0.8) +
      herz(-17, -12, 6, "#ff7aa2") + herz(17, 5, 6, "#ff7aa2") + herz(16, -13, 5, "#ffd166") + herz(-17, 6, 5, "#ffd166"),
    // Frau und Mann wie auf dem WC-Schild
    toiletten: () => S("M0 -14v28", "#cbd5e0", 1.4) +
      C(-10, -9, 3.2, "#3a86ff") + R(-14.5, -4.5, 9, 11, "#3a86ff", 2.5) + R(-13.8, 5, 3.2, 9, "#3a86ff", 1.2) + R(-9.4, 5, 3.2, 9, "#3a86ff", 1.2) +
      C(10, -9, 3.2, "#ef5350") + P("M10 -4.5l6.5 12h-13z", "#ef5350") + R(7.2, 6, 3, 8, "#ef5350", 1.2) + R(9.8, 6, 3, 8, "#ef5350", 1.2),
  };

  M.dazu({ dinge: DINGE, raeume: RAEUME, motive: MOTIVE });
})();
