/*
 * bau-tiere.js – Die Tiere der Bauecke, im Stil der Bilderbücher der Leseecke.
 * ---------------------------------------------------------------------------
 * Von Hand als SVG gezeichnet, nach den Figuren der Bücher: grosser runder
 * Kopf, grosse dunkle Augen mit Glanzpunkt, rosige Wangen, kleiner runder
 * Körper; weiche, etwas dunklere Konturen statt schwarzer Linien. Die Rundung
 * und den Glanz gibt ein Verlauf, der über die flachen Farbflächen gelegt
 * wird (defs(), einmal im Dokument).
 *
 * Masse (gross = 1): der Nullpunkt liegt zwischen den Füssen am Boden, nach
 * oben negativ. Der Kopf reicht bis etwa y = -85, Ohren und Hörner bis -112;
 * Körper und Kopf bleiben innerhalb x = ±27, der Schwanz geht bis x = -40.
 * Das Tier schaut leicht nach rechts; läuft es nach links, spiegelt die
 * Ansicht es mit scale(-1 1).
 *
 * Aufbau, an dem train-bau.js wackelt:
 *   <g>                                äusserstes g (scale, wenn gross ≠ 1;
 *                                      dazu Strichbreite und runde Ecken,
 *                                      die alle Teile erben)
 *     <ellipse/>                       Schatten am Boden
 *     <g class="legL">…</g>            linkes Bein
 *     <g class="legR">…</g>            rechtes Bein
 *     <g class="bob">…                 alles andere, zuletzt:
 *       <g class="bt-lid" opacity="0">…</g>   geschlossene Augen
 *
 * Was es gibt (window.LernappBauTiere):
 *   tier(art, { gross, variante, figur })  das Tier als SVG-Text
 *   defs()       die Verläufe (ids bt-…), einmal ins Dokument, nicht in ein
 *                SVG mit display:none, sonst fehlt der Glanz
 *   box(art, { figur })  der Kasten um die Zeichnung, für kleine Bildchen
 *   ARTEN, FIGUREN
 *
 * Figuren: Mit { figur: "fino" } zeichnet tier() die Figur genau so, wie sie
 * im Buch aussieht (FIGUREN: Kennung → Art; die Figur bestimmt die Art).
 * Ohne figur ist es ein gewöhnliches Tier der Art, mit einem schlichteren
 * Kleidungsstück, dessen Farbe variante % 4 wählt.
 *
 * Nur Zeichnen, kein Verhalten.
 */
(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Arten, Figuren, Farben
  // ---------------------------------------------------------------------------
  const ARTEN = ["fox", "bear", "rabbit", "cat", "panda", "frog", "owl", "penguin", "lion", "mouse", "squirrel", "ibex", "dog", "hedgehog", "cow", "elephant"];

  // Die Figuren aus den Büchern der Leseecke: Kennung → Art.
  const FIGUREN = {
    fino: "fox", bruno: "bear", mamabaer: "bear", hoppel: "rabbit", tim: "cat",
    pippa: "panda", fred: "frog", fridolin: "frog", ella: "owl", pino: "penguin",
    paul: "penguin", leo: "lion", mia: "mouse", rosa: "mouse", flitz: "squirrel",
    sepp: "ibex",
  };
  // Grösser als die anderen (Opa Paul, Mama Bär)
  const GROESSE = { paul: 1.1, mamabaer: 1.1 };

  // Farben für das Kleidungsstück der gewöhnlichen Tiere (variante % 4). Die
  // Farbe der Buchfigur kommt bei ihrer Art nicht vor.
  const ROT = "#d9483b", BLAU = "#3f7fc4", GRUEN = "#4f9d55", GELB = "#f0b92e", VIOLETT = "#8b62c2", ORANGE = "#ef8a2c", TUERKIS = "#2aa39a";
  const ZIER = {
    fox: [BLAU, GRUEN, GELB, VIOLETT],       // Halstuch – Fino: roter Strickschal
    bear: [BLAU, GELB, VIOLETT, TUERKIS],    // Masche – Bruno: grüne Weste, Mama Bär: rotes Karotuch
    rabbit: [ROT, GRUEN, GELB, VIOLETT],     // Fliege – Hoppel: blaues Ringelshirt
    cat: [ROT, BLAU, GRUEN, VIOLETT],        // Halsband mit Glöckchen – Tim: nichts
    panda: [BLAU, GRUEN, GELB, VIOLETT],     // Halstuch – Pippa: rote Blume
    frog: [ROT, BLAU, VIOLETT, ORANGE],      // Fliege – Fred: gelber Hut
    owl: [BLAU, ROT, GRUEN, VIOLETT],        // Schal – Ella: nichts
    penguin: [ROT, GELB, GRUEN, VIOLETT],    // Fliege – Pino: hellblauer Schal
    lion: [BLAU, GRUEN, ROT, VIOLETT],       // Fliege – Leo: nichts
    mouse: [BLAU, GRUEN, GELB, ORANGE],      // T-Shirt – Mia: rotes Kleid
    squirrel: [BLAU, ROT, GELB, VIOLETT],    // Halstuch – Flitz: grüner Schal
    ibex: [BLAU, GRUEN, GELB, VIOLETT],      // Schal – Sepp: rotes Halstuch
    dog: [ROT, BLAU, GRUEN, GELB],           // Halsband mit Marke
    hedgehog: [ROT, BLAU, GRUEN, GELB],      // Schal
    cow: [ROT, BLAU, GRUEN, VIOLETT],        // Riemen der Glocke
    elephant: [ROT, BLAU, GELB, VIOLETT],    // Mütze
  };

  const DUNKEL = "#2b201d";     // Augen, Nasen
  const WANGE = "#ff7b84";

  // ---------------------------------------------------------------------------
  // Bausteine
  // ---------------------------------------------------------------------------
  const hat = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const r = (n) => Math.round(n * 10) / 10;
  // Text mit Zahlen: jede eingesetzte Zahl auf eine Nachkommastelle
  const s = (teile, ...werte) => teile.reduce((a, t, i) => a + (typeof werte[i - 1] === "number" ? r(werte[i - 1]) : werte[i - 1]) + t);

  // Farbe heller (k > 0) oder dunkler (k < 0)
  function ton(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const ziel = k < 0 ? 0 : 255;
    const a = Math.abs(k);
    const kanal = (v) => Math.round(v + (ziel - v) * a);
    const rgb = (kanal(n >> 16) << 16) | (kanal((n >> 8) & 255) << 8) | kanal(n & 255);
    return `#${(0x1000000 | rgb).toString(16).slice(1)}`;
  }

  // Attribute: weiche Kontur, Linie, Fläche. Strichbreite 1.3 und runde
  // Ecken und Enden erbt alles vom äussersten g.
  const rand = (c, w = 1.3) => ` stroke="${c}"${w === 1.3 ? "" : ` stroke-width="${w}"`}`;
  const strich = (c, w = 1.2) => ` fill="none"${rand(c, w)}`;
  const fl = (c, k, w) => ` fill="${c}"${k ? rand(k, w) : ""}`;
  const LICHT = ' fill="url(#bt-licht)"';

  const kreis = (x, y, rr, a) => s`<circle cx="${x}" cy="${y}" r="${rr}"${a}/>`;
  const oval = (x, y, rx, ry, a, d = 0) => s`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${d ? s` transform="rotate(${d} ${x} ${y})"` : ""}${a}/>`;
  const pfad = (d, a) => `<path d="${d}"${a}/>`;

  // Ein grosses, glänzendes Auge wie in den Büchern. Bei farbigen Augen
  // (Katze, Eule, Frosch) ist iris die Farbe und pupille der dunkle Kern.
  function auge(x, y, rx, iris = DUNKEL, pupille = "") {
    const ry = rx * 1.15;
    let t = oval(x, y, rx, ry, ` fill="${iris}"`);
    if (pupille) t += oval(x + rx * 0.08, y + ry * 0.04, rx * 0.64, ry * 0.7, ` fill="${pupille}"`);
    return t + oval(x, y + ry * 0.52, rx * 0.56, ry * 0.28, ' fill="#ffffff" opacity=".22"') +
      kreis(x + rx * 0.3, y - ry * 0.36, rx * 0.42, ' fill="#ffffff"') +
      kreis(x - rx * 0.36, y + ry * 0.3, rx * 0.17, ' fill="#ffffff" opacity=".9"');
  }

  // Das geschlossene Auge: ein Lid in der Farbe rundum und die Wimpernlinie.
  function lid(x, y, rx, fell, linie = "#3b2b26") {
    const ry = rx * 1.15;
    return oval(x, y, rx + 0.8, ry + 0.8, ` fill="${fell}"`) +
      pfad(s`M${x - rx - 0.2} ${y + 0.4}q${rx + 0.2} ${rx * 0.85} ${2 * rx + 0.4} 0`, strich(linie, 1.4));
  }

  const backe = (x, y, rx = 3.6, deck = ".38", farbe = WANGE) => oval(x, y, rx, rx * 0.62, ` fill="${farbe}" opacity="${deck}"`);

  // Ein Bein mit Fuss; x ist die linke Kante, der Fuss zeigt nach rechts.
  function bein(x, fell, k, fuss = fell, b = 7.5) {
    return s`<rect x="${x}" y="-20" width="${b}" height="18" rx="${b / 2}"${fl(fell, k)}/>` +
      oval(x + b / 2 + 1.2, -2.9, 5.6, 2.9, fl(fuss, k));
  }
  const beine = (fell, k, fuss, b) => [bein(-11, fell, k, fuss, b), bein(0, fell, k, fuss, b)];

  // Arme: hinten (rechts im Bild, halb hinter dem Körper) und vorne (links).
  const armHinten = (a) => oval(14.5, -31, 4.4, 9, a, -20);
  const armVorne = (a) => oval(-14, -31, 4.5, 9, a, 20);
  const HAND_H = [17.4, -23.4];   // wo die Hand des hinteren Arms ist
  const HAND_V = [-16.9, -23.4];

  // Der Rumpf: eine weiche Birne, w = halbe Breite.
  function rumpf(w = 15.5) {
    const a = w * 0.62;
    return s`M0 -48C${a} -48 ${w} -40 ${w} -27C${w} -17 ${a} -11 0 -11C${-a} -11 ${-w} -17 ${-w} -27C${-w} -40 ${-a} -48 0 -48Z`;
  }
  // Rumpf mit Innerem (Bauch) und dem Licht darüber.
  const rumpfMit = (w, F, K, innen = "") => pfad(rumpf(w), fl(F, K)) + innen + pfad(rumpf(w), LICHT);
  // Ein runder Kopf mit Licht.
  const kopfMit = (x, y, rr, F, K) => kreis(x, y, rr, fl(F, K)) + kreis(x, y, rr, LICHT);

  // Punkt auf einer kubischen Kurve
  function kubisch(p, t) {
    const u = 1 - t;
    return [0, 1].map((i) => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]);
  }
  // Der Rumpf oberhalb eines Saums auf Höhe yh (für Hemd, Weste, Pulli):
  // die untere Kurve des Rumpfs wird beim Saum geteilt.
  function rumpfOben(w, yh, bogen = 2) {
    const a = w * 0.62;
    const p = [[w, -27], [w, -17], [a, -11], [0, -11]];
    let t0 = 0, t1 = 1;
    for (let i = 0; i < 30; i++) { const m = (t0 + t1) / 2; if (kubisch(p, m)[1] < yh) t0 = m; else t1 = m; }
    const t = (t0 + t1) / 2;
    const l = (u, v) => [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t];
    const q1 = l(p[0], p[1]);
    const q2 = l(q1, l(p[1], p[2]));
    const h = kubisch(p, t);
    return s`M0 -48C${a} -48 ${w} -40 ${w} -27C${q1[0]} ${q1[1]} ${q2[0]} ${q2[1]} ${h[0]} ${h[1]}Q0 ${h[1] + bogen} ${-h[0]} ${h[1]}C${-q2[0]} ${q2[1]} ${-q1[0]} ${q1[1]} ${-w} -27C${-w} -40 ${-a} -48 0 -48Z`;
  }
  // Halbe Breite des Rumpfs auf Höhe y (für Streifen)
  function rumpfBreite(w, y) {
    const a = w * 0.62;
    const p = y < -27 ? [[0, -48], [a, -48], [w, -40], [w, -27]] : [[w, -27], [w, -17], [a, -11], [0, -11]];
    let t0 = 0, t1 = 1;
    for (let i = 0; i < 30; i++) {
      const m = (t0 + t1) / 2;
      if (kubisch(p, m)[1] < y) t0 = m; else t1 = m;
    }
    return kubisch(p, (t0 + t1) / 2)[0];
  }

  // Punkt auf einer quadratischen Kurve
  const quad = (p0, c, p1, t) => [0, 1].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * t * (1 - t) * c[i] + t * t * p1[i]);

  // ---------------------------------------------------------------------------
  // Kleider und Schmuck (am Hals: Kinn bei y ≈ -41.5, vorne bei x ≈ 3)
  // ---------------------------------------------------------------------------
  // Ein Band um den Hals; von oben verdeckt es der Kopf. dicke: sichtbare Höhe.
  function band(c, k, dicke = 6, x = 2, y = -47) {
    return pfad(s`M-13 ${y}Q${x} ${y + 8.5} 16 ${y}L15.6 ${y + dicke}Q${x} ${y + dicke + 8.5} -12.6 ${y + dicke}Z`, fl(c, k));
  }

  // Halstuch: vorne ein Dreieck, das unter dem Band hervorhängt.
  function halstuch(c, x = 3) {
    const k = ton(c, -0.3);
    return pfad(s`M${x - 6.5} -39L${x + 6.5} -39L${x + 0.6} -27Z`, fl(c, k)) +
      pfad(s`M${x - 2.5} -35.5L${x + 0.4} -30`, strich(ton(c, 0.3), 1)) + band(c, k, 5.5);
  }

  // Halsband mit Marke (Hund) oder Glöckchen (Katze)
  function halsband(c, glocke = false, x = 3, y = -47) {
    const k = ton(c, -0.3);
    const gold = "#f3c24f", kg = "#b98a22", m = y + 12.4;
    const anh = glocke
      ? kreis(x, m, 2.9, fl(gold, kg, 1)) + pfad(s`M${x - 2.6} ${m + 0.2}H${x + 2.6}M${x} ${m + 0.2}V${m + 2.4}`, strich(kg, 0.8)) + kreis(x - 1, m - 1, 0.8, ' fill="#ffffff" opacity=".8"')
      : kreis(x, m + 0.3, 2.9, fl(gold, kg, 1)) + kreis(x - 0.8, m - 0.5, 0.8, ' fill="#ffffff" opacity=".8"');
    return band(c, k, 4.4, 2, y) + anh;
  }

  // Fliege: nach dem Kopf zeichnen, sie sitzt unter dem Kinn.
  function fliege(c, x = 3, y = -40) {
    const k = ton(c, -0.3);
    return pfad(s`M${x} ${y}L${x - 7.2} ${y - 4.6}Q${x - 8.6} ${y} ${x - 7.2} ${y + 4.6}ZM${x} ${y}L${x + 7.2} ${y - 4.6}Q${x + 8.6} ${y} ${x + 7.2} ${y + 4.6}Z`, fl(c, k)) +
      oval(x, y, 2.3, 2.7, fl(ton(c, -0.1), k));
  }

  // Masche mit zwei Bändeln (wie beim Teddy): nach dem Kopf zeichnen.
  function masche(c, x = 3, y = -40) {
    const k = ton(c, -0.3);
    return pfad(s`M${x - 1} ${y + 1}L${x - 5} ${y + 9.5}L${x - 1.8} ${y + 8.6}L${x + 0.4} ${y + 1.6}ZM${x + 1} ${y + 1}L${x + 5} ${y + 9.5}L${x + 1.8} ${y + 8.6}L${x - 0.4} ${y + 1.6}Z`, fl(c, k)) +
      pfad(s`M${x} ${y}C${x - 3} ${y - 6.5} ${x - 10.5} ${y - 6.5} ${x - 10} ${y - 0.5}C${x - 9.5} ${y + 4.5} ${x - 3} ${y + 3.5} ${x} ${y}ZM${x} ${y}C${x + 3} ${y - 6.5} ${x + 10.5} ${y - 6.5} ${x + 10} ${y - 0.5}C${x + 9.5} ${y + 4.5} ${x + 3} ${y + 3.5} ${x} ${y}Z`, fl(c, k)) +
      oval(x, y, 2.4, 2.7, fl(ton(c, -0.08), k));
  }

  // Ein glatter Schal: Band und ein Ende, das vorne herunterhängt.
  function schal(c, ende = -5) {
    const k = ton(c, -0.3);
    return band(c, k, 7.5) + pfad(s`M${ende - 3} -37.5L${ende - 5.5} -20L${ende + 2.5} -19.5L${ende + 3.5} -36Z`, fl(c, k)) +
      pfad(s`M${ende - 4.6} -23.5L${ende + 2.8} -23`, strich(k, 0.9));
  }

  // Ein gestrickter Schal mit Rippen und Fransen (Fino, Flitz, Pino).
  function strickschal(c, ende = -5) {
    const k = ton(c, -0.32);
    const o0 = [-13.5, -48], oc = [2, -39], o1 = [16.5, -48];
    const u0 = [-13.5, -39], uc = [2, -30], u1 = [16.5, -39];
    let rippen = "";
    [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92].forEach((t) => {
      const a = quad(o0, oc, o1, t), b = quad(u0, uc, u1, t);
      rippen += s`M${a[0]} ${a[1] + 2}L${b[0]} ${b[1] - 0.9}`;
    });
    const e = ende;
    return pfad(s`M${o0[0]} ${o0[1]}Q${oc[0]} ${oc[1]} ${o1[0]} ${o1[1]}L${u1[0]} ${u1[1]}Q${uc[0]} ${uc[1]} ${u0[0]} ${u0[1]}Z`, fl(c, k)) +
      pfad(rippen, strich(k, 0.9)) +
      pfad(s`M${e - 3} -37L${e - 5.5} -18.5L${e + 3} -18L${e + 3.6} -35.5Z`, fl(c, k)) +
      pfad(s`M${e - 3.9} -31H${e + 3.4}M${e - 4.6} -26H${e + 3.2}M${e - 5.2} -21.5H${e + 3.1}`, strich(k, 0.9)) +
      pfad(s`M${e - 4.6} -18.2V-15M${e - 2} -18.1V-14.8M${e + 0.6} -18V-14.7M${e + 2.7} -17.9V-14.8`, strich(c, 1.4));
  }

  // T-Shirt über dem Rumpf (w), mit kurzen Ärmeln an den Schultern.
  function shirt(c, w, k = ton(c, -0.28)) {
    return pfad(rumpfOben(w, -20, 1.5), fl(c, k)) + pfad(rumpfOben(w, -20, 1.5), LICHT);
  }
  const aermelHinten = (c, k = ton(c, -0.28)) => oval(13.6, -37.2, 5, 4.6, fl(c, k), -20);
  const aermelVorne = (c, k = ton(c, -0.28)) => oval(-13.2, -37.2, 5.1, 4.7, fl(c, k), 20);

  // ---------------------------------------------------------------------------
  // Die Arten
  // ---------------------------------------------------------------------------
  // Jede Art gibt { links, rechts, bob, lid } zurück; o = { figur, farbe }.

  // --- Fuchs (Fino: roter Strickschal mit Fransen) ---------------------------
  function fuchs(o) {
    const F = "#e8793a", K = "#b4531f", W = "#fff6ea", KW = "#ecd6c0", D = "#4a3129", KD = "#2e1d17", IN = "#fde3cf";
    const [links, rechts] = beine(D, KD, D, 6.8);
    const bob =
      pfad("M-9 -15C-24 -12 -38 -22 -38 -38C-38 -46 -36 -52 -33 -55C-30 -50 -26 -42 -19 -36C-15 -32 -11 -30 -8 -29Z", fl(F, K)) +
      pfad("M-38.1 -40.5C-38.2 -46.5 -36.2 -51.8 -33 -55C-31 -51.5 -29 -47.6 -27.2 -44.6C-29.6 -43 -31.6 -44.4 -33.4 -42.4C-35 -43.6 -36.6 -42 -38.1 -40.5Z", fl(W, KW)) +
      armHinten(fl(F, K)) + kreis(...HAND_H, 3.3, fl(D, KD)) +
      rumpfMit(13, F, K, oval(2.5, -30, 6.5, 12.5, fl(W))) +
      armVorne(fl(F, K)) + kreis(...HAND_V, 3.4, fl(D, KD)) +
      (o.figur === "fino" ? strickschal("#d8443a", -4) : halstuch(o.farbe)) +
      pfad("M-18 -72L-14.5 -98L-3 -81Z", fl(F, K)) + pfad("M-15.2 -78L-14.2 -91.5L-7.6 -82.2Z", fl(IN)) + pfad("M-15.7 -89.5L-14.5 -98L-10.7 -92.6Z", fl(D, KD)) +
      pfad("M5 -82L16.5 -98L20 -70Z", fl(F, K)) + pfad("M9 -81.5L15.6 -91L17.6 -75Z", fl(IN)) + pfad("M13.6 -93.7L16.5 -98L17.4 -91.9Z", fl(D, KD)) +
      kopfMit(1, -63, 20.5, F, K) +
      pfad("M7 -62.5C13.5 -62 20 -60 24.6 -57.4C26.6 -56.2 26.4 -53.6 24.4 -52.8C20 -51.2 13 -50.8 7 -51.5", fl(F, K)) +
      pfad("M-20.6 -59.2C-16.5 -58 -12.5 -58 -9 -59.2C-6 -60.2 -2 -58.4 1 -56.2C4 -54 8 -53.6 12.5 -54.2C17 -54.8 21.5 -54.8 25.4 -54.2C25 -52.2 23.5 -51.4 21 -51C15 -50 9.5 -47.6 4 -45.8C-2 -44 -8 -44.4 -12.5 -46.6L-17.8 -46.4L-16.4 -49.8L-21.8 -51.4L-19.2 -54.4Z", fl(W)) +
      oval(24.8, -56.8, 2.6, 2.1, fl(DUNKEL)) + oval(24.1, -57.5, 0.9, 0.5, ' fill="#ffffff" opacity=".6"') +
      pfad("M24.2 -53.6Q20.6 -49.4 14.6 -50.6", strich(K, 1.3)) +
      auge(-3.5, -64.5, 3.4) + auge(10.5, -64.5, 3.1) +
      backe(-10.5, -56.3, 3.3) + backe(14, -58.6, 2.6);
    return { links, rechts, bob, lid: lid(-3.5, -64.5, 3.4, F) + lid(10.5, -64.5, 3.1, F) };
  }

  // Ein rot-weiss kariertes Halstuch (Mama Bär): Dreieck und Band mit
  // durchscheinenden weissen Streifen.
  function karotuch() {
    const c = "#d8433b", k = "#9c2d27";
    const A = [-4.5, -39.5], B = [12.5, -39.5], C = [4, -24];
    let waag = "", senk = "";
    for (let y = -37; y < -26; y += 3) {
      const t = (y - A[1]) / (C[1] - A[1]);
      waag += s`M${A[0] + (C[0] - A[0]) * t + 0.8} ${y}H${B[0] + (C[0] - B[0]) * t - 0.8}`;
    }
    for (let x = -1.5; x < 11; x += 3) {
      const t = x <= C[0] ? (x - A[0]) / (C[0] - A[0]) : (B[0] - x) / (B[0] - C[0]);
      senk += s`M${x} -39V${A[1] + (C[1] - A[1]) * t - 0.8}`;
    }
    let bandStreifen = "";
    [-0.12, 0.04, 0.2, 0.36, 0.52, 0.68, 0.84, 1].forEach((t) => {
      const a = quad([-13, -47], [2, -38.5], [16, -47], Math.max(0, t));
      bandStreifen += s`M${a[0]} ${a[1] + 1}V${a[1] + 5.5}`;
    });
    const weiss = ' fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linecap="butt" stroke-opacity=".62"';
    return pfad(s`M${A[0]} ${A[1]}L${B[0]} ${B[1]}L${C[0]} ${C[1]}Z`, fl(c, k)) + pfad(waag, weiss) + pfad(senk, weiss) +
      band(c, k, 5.5) + pfad(bandStreifen, weiss) + pfad("M-12.8 -44Q2 -35 15.8 -44", weiss);
  }

  // --- Bär (Bruno: olivgrüne Weste; Mama Bär: grösser, kariertes Halstuch) -----
  function baer(o) {
    const F = "#9c6b45", K = "#6c4529", B = "#e2c49c", KB = "#c49f75", IN = "#e8a58a", N = "#382622";
    const [links, rechts] = beine(F, K);
    let kleid = "", vorKopf = "", nachKopf = "", wimpern = "";
    if (o.figur === "bruno") {
      const g = "#71964a", kg = "#4b6d31", gt = "#5f8540";
      kleid = pfad(rumpfOben(16, -15.5, 1.2), fl(g, kg)) +
        pfad("M-1.6 -47C-3.2 -36 -3.2 -24 -1.2 -15.2H8.4C10 -24 10 -36 8.6 -47Z", fl(B)) +
        pfad("M-1.6 -47C-3.2 -36 -3.2 -24 -1.2 -15.2M8.6 -47C10 -36 10 -24 8.4 -15.2", strich(kg, 1.3)) +
        s`<rect x="-12.8" y="-28.4" width="7.4" height="7" rx="1.4"${fl(gt, kg, 1)}/>` + pfad("M-12.8 -25.6H-5.4", strich(kg, 1)) + kreis(-9.1, -26.4, 0.8, fl("#e9d9a6")) +
        s`<rect x="10.8" y="-28.4" width="4.6" height="7" rx="1.4"${fl(gt, kg, 1)}/>` + pfad("M10.8 -25.6H15.4", strich(kg, 1));
    } else if (o.figur === "mamabaer") {
      vorKopf = karotuch();
      wimpern = pfad("M-8 -66.4l-1.8 -1.2M-7.6 -64.6l-2 -0.2M18.1 -66.6l1.6 -1.2M18.4 -64.8l1.8 -0.3", strich(N, 0.9));
    } else {
      nachKopf = masche(o.farbe);
    }
    const bob =
      kreis(-14.5, -18, 3.4, fl(F, K)) +
      armHinten(fl(F, K)) +
      rumpfMit(16, F, K, oval(3.5, -24, 9, 13, fl(B))) + kleid +
      armVorne(fl(F, K)) + vorKopf +
      kreis(-14, -80, 7.2, fl(F, K)) + kreis(-13.6, -79.5, 4, fl(IN)) +
      kreis(16, -80.5, 6.6, fl(F, K)) + kreis(15.6, -80, 3.6, fl(IN)) +
      pfad("M-4 -83.6C-3 -87.6 0 -88.1 1 -85.1C2 -88.1 5.5 -88.1 6 -83.6Z", fl(F, K)) +
      kopfMit(1, -63, 22, F, K) +
      oval(5.5, -55, 9.5, 7, fl(B, KB)) +
      pfad("M1.8 -59.3Q5.5 -61.3 9.2 -59.3Q8.8 -56.3 5.5 -55.3Q2.2 -56.3 1.8 -59.3Z", fl(N)) + oval(4.3, -59.4, 1.4, 0.8, ' fill="#ffffff" opacity=".45"') +
      pfad("M5.5 -55.3V-53.3M2 -52.4Q3.8 -50.2 5.5 -53Q7.2 -50.2 9 -52.4", strich(N, 1.2)) +
      auge(-4.5, -64.5, 3.4) + auge(15, -64.5, 3.1) + wimpern +
      backe(-10.5, -56.5) + backe(19, -57, 3) + nachKopf;
    return { links, rechts, bob, lid: lid(-4.5, -64.5, 3.4, F) + lid(15, -64.5, 3.1, F) };
  }

  // --- Hase (Hoppel: Ringelshirt, weiss mit blauen Streifen) -------------------
  function hase(o) {
    const F = "#aa9b8f", K = "#77695f", W = "#f2ece5", KW = "#d3c7bb", IN = "#f3a3ae", N = "#e8899a";
    const [links, rechts] = beine(F, K);
    let kleid = "", aermelH = "", aermelV = "", nachKopf = "";
    if (o.figur === "hoppel") {
      const h = "#fbfaf7", kh = "#c6ccd6", st = "#3d6db3";
      let streifen = "";
      [-38, -32.5, -27, -21.6].forEach((y) => {
        const b = rumpfBreite(15, y) - 0.7;
        streifen += s`M${-b} ${y}Q0 ${y + 2.2} ${b} ${y}`;
      });
      kleid = pfad(rumpfOben(15, -18.5, 1.2), fl(h, kh)) + pfad(streifen, ` fill="none" stroke="${st}" stroke-width="2.6" stroke-linecap="butt"`) + pfad(rumpfOben(15, -18.5, 1.2), LICHT);
      aermelH = oval(13, -37, 5, 4.8, fl(h, kh), -20) + pfad("M9.6 -36.4Q13 -34.6 16.8 -37.6", ` fill="none" stroke="${st}" stroke-width="2.2" stroke-linecap="butt"`);
      aermelV = oval(-12.6, -37, 5.1, 4.9, fl(h, kh), 20) + pfad("M-16.6 -37.6Q-12.6 -34.6 -9.2 -36.4", ` fill="none" stroke="${st}" stroke-width="2.2" stroke-linecap="butt"`);
    } else {
      nachKopf = fliege(o.farbe);
    }
    const bob =
      kreis(-15, -19, 4.8, fl(W, KW)) +
      armHinten(fl(F, K)) + aermelH +
      rumpfMit(15, F, K, oval(3, -22, 8.5, 9.5, fl(W))) + kleid +
      armVorne(fl(F, K)) + aermelV +
      oval(-7.5, -91, 6.2, 19, fl(F, K), -10) + oval(-7.2, -90, 3, 14, fl(IN), -10) +
      oval(10, -91, 5.8, 19, fl(F, K), 12) + oval(9.8, -90, 2.8, 14, fl(IN), 12) +
      kopfMit(1, -63, 21, F, K) +
      pfad("M-2.5 -83.4C-1.5 -87.4 1.5 -87.9 2.5 -84.9C3.5 -87.4 6 -87.4 6.5 -83.6Z", fl(F, K)) +
      oval(3.6, -55.5, 4.6, 3.8, fl(W)) + oval(9.6, -55.5, 4.4, 3.8, fl(W)) +
      s`<rect x="5.4" y="-54.6" width="2.4" height="2.8" rx=".6"${fl("#ffffff", KW, 0.6)}/>` +
      pfad("M4.3 -59.6Q6.6 -61 8.9 -59.6Q8.3 -57.3 6.6 -56.6Q4.9 -57.3 4.3 -59.6Z", fl(N)) +
      pfad("M6.6 -56.6V-55M3.8 -53.9Q5.3 -52.3 6.6 -54.9Q7.9 -52.3 9.4 -53.9", strich(K, 1.1)) +
      pfad("M-1 -56L-9 -57.5M-1 -54L-9 -53.4M14 -56L21.5 -57.5M14 -54L21.5 -53.4", strich(K, 0.6)) +
      auge(-3.5, -64.5, 3.4) + auge(14, -64.5, 3.1) +
      backe(-9.5, -56.5) + backe(18, -57, 3) + nachKopf;
    return { links, rechts, bob, lid: lid(-3.5, -64.5, 3.4, F) + lid(14, -64.5, 3.1, F) };
  }

  // --- Katze (Tim: grau getigerter Kater, zwei Farbkleckse am Bauch) -----------
  function katze(o) {
    const F = "#9097a3", K = "#626874", S = "#656b77", W = "#f8f7f4", KW = "#d9d6d0", IN = "#f2a5b0", N = "#ea8f9b";
    const [links, rechts] = beine(F, K, W);
    const tim = o.figur === "tim";
    const schwanz = "M-11 -17C-25 -15 -32 -25 -31 -37C-30.5 -44 -27 -48 -23 -48";
    const kleckse = tim ? pfad("M0.6 -27.6C1.6 -30.2 5 -30 5.2 -27.6C6.6 -27.2 6 -24.8 4.4 -25C3.4 -23.4 0.8 -24 1 -25.6C-0.6 -25.6 -0.8 -27.4 0.6 -27.6Z", fl("#4d8fd6")) + kreis(7.6, -21, 1.9, fl("#e2534a")) + kreis(5.6, -18.8, 0.9, fl("#e2534a")) : "";
    const bob =
      pfad(schwanz, strich(K, 7.4)) + pfad(schwanz, strich(F, 5)) + pfad(schwanz, ` fill="none" stroke="${S}" stroke-width="5" stroke-linecap="butt" stroke-dasharray="2.6 3.4"`) +
      armHinten(fl(F, K)) + kreis(...HAND_H, 3.2, fl(W, KW)) +
      rumpfMit(14.5, F, K, oval(3.5, -28, 7.5, 13, fl(W)) + kleckse + pfad("M-14.4 -34Q-11.5 -33 -9.8 -35.5M-14.8 -27.5Q-11.5 -26.5 -9.8 -29M-14.2 -21Q-11.5 -20 -10 -22.5", strich(S, 1.8))) +
      armVorne(fl(F, K)) + kreis(...HAND_V, 3.3, fl(W, KW)) +
      (tim ? "" : halsband(o.farbe, true)) +
      pfad("M-18 -71L-15.5 -95L-3.5 -82Z", fl(F, K)) + pfad("M-15.6 -76.5L-14.7 -90L-7.6 -82.4Z", fl(IN)) +
      pfad("M5.5 -83L16.5 -95L20 -70.5Z", fl(F, K)) + pfad("M9.2 -82.6L15.6 -90L17.4 -74.5Z", fl(IN)) +
      oval(1, -62.5, 22, 20.5, fl(F, K)) + oval(1, -62.5, 22, 20.5, LICHT) +
      pfad("M-1 -82.2V-77.5M3.5 -82.7V-76.5M8 -82V-77.5M-21 -61H-16.5M-20.8 -57.5H-17M23 -61H18.8", strich(S, 1.8)) +
      oval(3.6, -55, 4.4, 3.6, fl(W)) + oval(9.6, -55, 4.2, 3.6, fl(W)) + oval(6.6, -51.9, 3.5, 2.6, fl(W)) +
      pfad("M4.7 -58.8H8.5L6.6 -56.6Z", fl(N, N, 0.8)) +
      pfad("M6.6 -56.6V-55M3.8 -53.9Q5.3 -52.3 6.6 -54.9Q7.9 -52.3 9.4 -53.9", strich(K, 1.1)) +
      pfad("M0 -55.5L-11 -57.5M0 -53.5L-11 -52.5M13.5 -55.5L24.5 -57.5M13.5 -53.5L24.5 -52.5", strich("#5a5f69", 0.6)) +
      auge(-4, -64, 3.7, "#8bb35f", "#27302a") + auge(12.5, -64, 3.4, "#8bb35f", "#27302a") +
      backe(-10.5, -56.5) + backe(18, -57, 3);
    return { links, rechts, bob, lid: lid(-4, -64, 3.7, F) + lid(12.5, -64, 3.4, F) };
  }

  // --- Panda (Pippa: rote Blume am Ohr, Ohren innen rosa) ----------------------
  function panda(o) {
    const W = "#f8f6f2", KW = "#bdb7ae", S = "#2f3137", KS = "#1c1d22";
    const pippa = o.figur === "pippa";
    const IN = pippa ? "#e9a3ae" : "#4a484d";
    const [links, rechts] = beine(S, KS);
    let vorKopf = "", nachKopf = "";
    if (pippa) {
      const c = "#e0443a", k = "#a92e26";
      let blatt = "";
      for (let i = 0; i < 5; i++) {
        const w = (i * 72 - 90) * Math.PI / 180;
        blatt += kreis(9 + Math.cos(w) * 3.4, -82.5 + Math.sin(w) * 3.4, 3.3, fl(c, k, 1));
      }
      nachKopf = blatt + kreis(9, -82.5, 2.1, fl("#f6d04d", "#d6a72a", 0.8));
    } else {
      vorKopf = halstuch(o.farbe);
    }
    const bob =
      armHinten(fl(S, KS)) +
      rumpfMit(16, W, KW, pfad("M-16 -33C-15 -42 -9 -48 0 -48C9 -48 15 -42 16 -33C10 -37.5 -10 -37.5 -16 -33Z", fl(S))) +
      armVorne(fl(S, KS)) + vorKopf +
      kreis(-14.5, -80, 7.2, fl(S, KS)) + kreis(-14.2, -79.6, 3.8, fl(IN)) + kreis(16, -80.5, 6.6, fl(S, KS)) + kreis(15.7, -80.1, 3.4, fl(IN)) +
      kopfMit(1, -63, 22, W, KW) +
      oval(-5, -63, 6, 8, fl(S), 28) + oval(13, -63, 5.4, 7.4, fl(S), -28) +
      oval(5.5, -54, 8, 6, fl("#fffdf9", "#ddd6cc", 1)) +
      pfad("M3 -57.6Q5.6 -59.2 8.2 -57.6Q7.8 -55.4 5.6 -54.8Q3.4 -55.4 3 -57.6Z", fl(S)) +
      pfad("M5.6 -54.8V-53.4M3 -52.5Q4.4 -50.8 5.6 -53Q6.8 -50.8 8.2 -52.5", strich(KS, 1.1)) +
      oval(-4.6, -63.6, 4.1, 4.7, ' fill="#ece8e2"') + auge(-4.6, -63.6, 3.3) +
      oval(12.6, -63.6, 3.7, 4.3, ' fill="#ece8e2"') + auge(12.6, -63.6, 3) +
      backe(-11, -55) + backe(18.5, -55.5, 3) + nachKopf;
    return { links, rechts, bob, lid: lid(-4.6, -63.6, 3.3, S, "#b9b5b0") + lid(12.6, -63.6, 3, S, "#b9b5b0") };
  }

  // --- Frosch (Fred: gelber Regenhut; Fridolin: hellgrün, ohne Kleider) --------
  function frosch(o) {
    const fri = o.figur === "fridolin", hut = o.figur === "fred";
    const G = fri ? "#9ad26a" : "#7dbb5d", K = fri ? "#5f9b3c" : "#4f8b3b", B = fri ? "#eef4b4" : hut ? "#f1e58a" : "#e8eeb0", SP = fri ? "#5f9c42" : "#5a9842";
    const fuss = (x) => s`<rect x="${x}" y="-20" width="7" height="18" rx="3.5"${fl(G, K)}/>` +
      pfad(s`M${x - 1.5} -2.6C${x - 1.5} -6 ${x + 7} -6.5 ${x + 11} -4.6C${x + 12.8} -3.8 ${x + 12.4} -1.6 ${x + 11} -1.2C${x + 9.6} -0.4 ${x + 8.6} -1 ${x + 7.4} -0.6C${x + 6} 0 ${x + 4.6} -0.4 ${x + 3.4} 0C${x + 1.6} 0.4 ${x - 1.5} 0 ${x - 1.5} -2.6Z`, fl(G, K));
    const [links, rechts] = [fuss(-11), fuss(0)];
    const augeY = hut ? -66.5 : -71;
    let nachKopf = "";
    if (hut) {
      const c = "#f2c230", k = "#c4951a";
      nachKopf = pfad("M-10.5 -77C-10.5 -86 -5.5 -91.5 2 -91.5C9.5 -91.5 14.5 -86 14.5 -77Z", fl(c, k)) +
        pfad("M-10.5 -80.4Q2 -82.8 14.5 -80.4L14.5 -77.2H-10.5Z", fl("#e3ab22", k, 1)) +
        pfad("M-18.5 -75.4Q2 -84.6 22.5 -75.4Q24 -73 20.8 -73.2Q2 -79.6 -16.8 -73.2Q-20 -73 -18.5 -75.4Z", fl(c, k)) +
        pfad("M-6.5 -86.5Q-3.5 -89.6 0.5 -90.4", strich("#fff1b8", 1.4));
    } else if (!fri) {
      nachKopf = fliege(o.farbe, 3, -40.5);
    }
    const bob =
      oval(14, -30, 4, 8.6, fl(G, K), -24) + kreis(17.6, -22.6, 3, fl(G, K)) +
      rumpfMit(15.5, G, K, oval(3, -25, 9.5, 12, fl(B)) + kreis(-11, -31, 2.2, fl(SP)) + kreis(-12.4, -22, 1.7, fl(SP)) + kreis(-7.5, -38, 1.5, fl(SP))) +
      oval(-13.6, -30, 4.1, 8.8, fl(G, K), 24) + kreis(-17.4, -22.4, 3.1, fl(G, K)) + kreis(-13.8, -33, 1.3, fl(SP)) +
      (hut ? "" : kreis(-6.5, -72, 8.6, fl(G, K)) + kreis(11, -72, 8, fl(G, K))) +
      oval(1.5, -60, 22.5, 17, fl(G, K)) + oval(1.5, -60, 22.5, 17, LICHT) +
      kreis(-6.5, augeY, hut ? 7.2 : 7.6, fl(G)) + kreis(11, augeY, hut ? 6.8 : 7, fl(G)) +
      kreis(-14.5, -57, 1.8, fl(SP)) + kreis(19, -63, 1.5, fl(SP)) + kreis(-13, -65, 1.2, fl(SP)) +
      auge(-6.5, augeY, 4.8, fri ? "#d9eeb0" : "#f2e28c", DUNKEL) + auge(11, augeY, 4.5, fri ? "#d9eeb0" : "#f2e28c", DUNKEL) +
      kreis(4.2, -61, 0.8, fl(K)) + kreis(7, -61, 0.8, fl(K)) +
      pfad("M-7 -54.5Q4 -46.5 15 -54.5", strich(K, 1.5)) +
      backe(-11, -56.5, 3.6, ".75", "#ff8ea6") + backe(18.5, -57, 3.2, ".75", "#ff8ea6") + nachKopf;
    return { links, rechts, bob, lid: lid(-6.5, augeY, 4.8, G) + lid(11, augeY, 4.5, G) };
  }

  // --- Eule (Ella: braun, getupfter Federbauch, gelbe Augen, ohne Kleider) -----
  function eule(o) {
    const F = "#9b7350", K = "#6b4c33", C = "#f5e6c8", KC = "#cdb48f", V = "#b08a63", BE = "#f2a13a", KBE = "#c77a22";
    const fuss = (x) => s`<rect x="${x + 1}" y="-14" width="5" height="12" rx="2.5"${fl(BE, KBE)}/>` +
      oval(x + 1.5, -1.8, 2.2, 1.7, fl(BE, KBE, 1)) + oval(x + 4.2, -1.6, 2.2, 1.8, fl(BE, KBE, 1)) + oval(x + 7, -1.8, 2.2, 1.7, fl(BE, KBE, 1));
    const [links, rechts] = [fuss(-10), fuss(0.5)];
    let tupfen = "";
    [[-2, -31], [3.5, -32.5], [9, -31], [0.5, -26], [6, -26.5], [11, -25], [-3, -21], [3, -20.5], [8.5, -19.5], [5, -15]].forEach(([x, y]) => {
      tupfen += oval(x, y, 0.9, 1.3, fl(V));
    });
    const zier = o.figur === "ella" ? "" : schal(o.farbe, -4);
    const leib = "M1 -46C12 -46 18 -36 18 -25C18 -14 11 -7.5 1 -7.5C-9 -7.5 -16 -14 -16 -25C-16 -36 -10 -46 1 -46Z";
    const bob =
      pfad("M13 -42C20 -38 22.5 -28 21 -18C20.5 -15 19 -13 17.5 -11.5C15.5 -16 13.5 -24 12.5 -32Z", fl(ton(F, -0.06), K)) +
      pfad(leib, fl(F, K)) + oval(3, -24.5, 11, 14, fl(C, KC, 1)) + tupfen + pfad(leib, LICHT) +
      pfad("M-10 -43C-18 -41 -21 -31 -20 -21C-19.5 -16 -18 -13 -16 -11C-13 -16 -10 -24 -8.5 -32C-8 -36 -8.5 -40 -10 -43Z", fl(ton(F, -0.06), K)) +
      pfad("M-17.5 -24Q-15.5 -20 -13 -19M-18.6 -30Q-16 -26 -12.5 -25.5", strich(K, 0.9)) +
      zier +
      pfad("M-14 -77L-17 -88L-7.5 -80.5Z", fl(F, K)) + pfad("M10.5 -80.5L19 -87.5L17 -77Z", fl(F, K)) +
      kopfMit(1, -61, 22, F, K) +
      pfad("M-2 -79.5l1.4 2l1.4 -2M4.6 -79.6l1.4 2l1.4 -2", strich(V, 1.1)) +
      kreis(-4.5, -61.5, 9.6, fl(C, KC, 1)) + kreis(11, -61.5, 8.9, fl(C, KC, 1)) + oval(3.3, -58, 6, 6.5, fl(C)) +
      auge(-4.5, -62, 5.4, "#f2c23a", DUNKEL) + auge(11, -62, 5, "#f2c23a", DUNKEL) +
      pfad("M1.2 -57.8H5.8L3.5 -52.6Z", fl(BE, KBE, 1)) +
      backe(-10.5, -54, 3) + backe(17, -54, 2.6);
    return { links, rechts, bob, lid: lid(-4.5, -62, 5.4, C, K) + lid(11, -62, 5, C, K) };
  }

  // --- Pinguin (Pino: hellblauer Strickschal; Opa Paul: Mütze, Pulli, Brille) --
  function pinguin(o) {
    const NV = "#34415f", K = "#222b40", W = "#f8f7f2", KW = "#cfcbc4", BE = "#f4a03a", KBE = "#c77a20";
    const paul = o.figur === "paul";
    const fuss = (x) => s`<rect x="${x + 1.5}" y="-14" width="5" height="12" rx="2.5"${fl(BE, KBE)}/>` + oval(x + 5.3, -2.4, 6.2, 2.6, fl(BE, KBE));
    const [links, rechts] = [fuss(-11), fuss(0)];
    const leib = "M1 -83.5A20.5 20.5 0 0 0 -17.6 -52.5C-18.6 -45 -18.2 -35 -17.6 -26C-17 -13 -10 -7 1 -7C12 -7 19 -13 19.6 -26C20.2 -35 20.2 -45 19.4 -52.5A20.5 20.5 0 0 0 1 -83.5Z";
    let kleid = "", vorKopf = "", nachKopf = "";
    if (paul) {
      const p = "#4a5f86", kp = "#2f3d5a";
      kleid = pfad("M-18 -44C-18.5 -36 -18.4 -27 -17.8 -18Q1 -13.5 19.8 -18C20.4 -27 20.4 -36 19.8 -44C12 -40 -10 -40 -18 -44Z", fl(p, kp)) +
        pfad("M-6 -40V-19M1 -39V-16.5M8 -39.5V-17M14 -41V-18.5M-12.5 -41.5V-19.5", ` fill="none" stroke="${kp}" stroke-width="1" stroke-linecap="butt" stroke-dasharray="2 1.6"`) +
        pfad("M-18 -44Q1 -38 19.8 -44L19.6 -38.5Q1 -32.5 -17.9 -38.5Z", fl(ton(p, 0.08), kp)) + pfad("M-12 -42V-37M-6 -40.8V-35.6M0 -40.3V-35M6 -40.6V-35.4M12 -41.6V-36.4", strich(kp, 0.9));
      nachKopf =
        pfad("M-17 -68.5C-20 -69.5 -22.6 -68 -23.2 -65.6L-25.6 -64.4L-23 -62.6L-25.4 -60.2L-22.2 -59.6L-23.6 -56.6L-19.8 -57.6L-17.2 -56Z", fl("#ffffff", "#c3c8d2", 1)) +
        pfad("M19.6 -68.6C22.4 -69 24.4 -67.4 24.6 -65.2L26.6 -63.6L24.4 -62.2L26.2 -59.6L22.6 -59.4L20.6 -57.2Z", fl("#ffffff", "#c3c8d2", 1)) +
        pfad("M-7.5 -69.6Q-4 -72 -0.5 -70M6.4 -70Q9.6 -72.2 13 -69.8", strich("#ffffff", 2)) +
        pfad("M-15 -77.5C-15 -86 -8 -90.5 1.5 -90.5C11 -90.5 17.5 -86 17.5 -77.5Z", fl("#3b4a6b", "#232b40")) +
        pfad("M-15.5 -78Q1 -82 18 -78L18 -75.4Q1 -79.2 -15.5 -75.4Z", fl("#2a3249", "#1b2132", 1)) +
        pfad("M4 -76.6Q14 -78 22 -74.4Q15 -72 4 -73.6Z", fl("#20263a", "#141826", 1)) + kreis(1.5, -80.6, 1.6, fl("#f2c94c")) +
        kreis(-3.5, -63, 5.1, ' fill="#ffffff" fill-opacity=".18" stroke="#7c818c" stroke-width="1.4"') + kreis(10, -63, 4.7, ' fill="#ffffff" fill-opacity=".18" stroke="#7c818c" stroke-width="1.4"') +
        pfad("M1.6 -63.6Q3.3 -65 5.3 -63.6", strich("#7c818c", 1.2));
    } else if (o.figur === "pino") {
      vorKopf = strickschal("#8cc3e1", 11);
    } else {
      nachKopf = fliege(o.farbe, 2.5, -41);
    }
    const bob =
      pfad("M18 -42C23.5 -36 25 -27 23.5 -19C21 -23 19 -29 18 -34Z", fl(ton(NV, -0.05), K)) +
      pfad(leib, fl(NV, K)) + oval(2.5, -26, 12.5, 16, fl(W, KW, 1)) + pfad(leib, LICHT) + kleid +
      pfad("M-16 -42C-22 -36 -24 -26 -22 -17C-19 -21 -16 -28 -14.5 -34Z", fl(ton(NV, -0.05), K)) +
      vorKopf +
      pfad("M0.5 -83.5Q-1 -88 2.5 -89.5Q1.5 -86.5 3.5 -84", fl(NV, K, 1)) +
      kreis(-3.5, -62.5, 8.3, fl(W)) + kreis(10, -62.5, 7.7, fl(W)) + oval(3.5, -56, 11, 7.5, fl(W)) +
      auge(-3.5, -63, 3.5, "#1f2638") + auge(10, -63, 3.2, "#1f2638") +
      pfad("M2.5 -57.5Q7 -59.8 11.5 -57Q8.2 -53.6 4.4 -54.6Z", fl(BE, KBE, 1)) +
      backe(-9.5, -55.5, 3.2) + backe(15.5, -56, 2.8) + nachKopf;
    return { links, rechts, bob, lid: lid(-3.5, -63, 3.5, W, "#3b4560") + lid(10, -63, 3.2, W, "#3b4560") };
  }

  // --- Löwe (Leo: goldgelb, zottige Mähne, Schwanzquaste, ohne Kleider) --------
  function loewe(o) {
    const Y = "#f3c266", K = "#c8913c", M = "#e0772f", KM = "#b5561c", MI = "#c9601f", C = "#fde8bf", N = "#5a3929", IN = "#f2a68f";
    const [links, rechts] = beine(Y, K);
    // Mähne: zottige Büschel rundherum, unten länger (bis auf die Brust)
    let maehne = "";
    const n = 15, weite = (w) => 22 + 4 * Math.max(0, Math.sin(w));
    for (let i = 0; i <= n; i++) {
      const w = (i / n) * Math.PI * 2 - Math.PI / 2;
      const p = [1 + Math.cos(w) * weite(w), -62 + Math.sin(w) * weite(w)];
      if (i === 0) maehne += s`M${p[0]} ${p[1]}`;
      else {
        const wm = w - Math.PI / n + 0.13;
        maehne += s`Q${1 + Math.cos(wm) * (weite(wm) + 7.5)} ${-62 + Math.sin(wm) * (weite(wm) + 7.5)} ${p[0]} ${p[1]}`;
      }
    }
    maehne += "Z";
    const bob =
      pfad("M-12 -15C-24 -12 -32 -18 -32 -30", strich(K, 5.2)) + pfad("M-12 -15C-24 -12 -32 -18 -32 -30", strich(Y, 3)) +
      pfad("M-32 -28.5C-35.5 -29 -36.5 -33 -35 -36C-34 -38.5 -32 -40 -31.5 -42.5C-29.5 -40 -28 -37 -28.5 -33.5C-28.8 -30.5 -30 -28.5 -32 -28.5Z", fl(M, KM)) +
      armHinten(fl(Y, K)) +
      rumpfMit(15, Y, K, oval(2.5, -24, 9, 12, fl(C))) +
      armVorne(fl(Y, K)) +
      pfad(maehne, fl(M, KM)) + kreis(1, -62, 21.5, fl(MI)) + pfad(maehne, LICHT) +
      kreis(-12.5, -77.5, 5.6, fl(Y, K)) + kreis(-12.3, -77.3, 3, fl(IN)) + kreis(14.5, -77.5, 5.2, fl(Y, K)) + kreis(14.3, -77.3, 2.8, fl(IN)) +
      kopfMit(1.5, -61, 17.5, Y, K) +
      oval(3.4, -53.4, 4.8, 3.9, fl(C)) + oval(10.6, -53.4, 4.6, 3.9, fl(C)) + oval(7, -50.4, 3.6, 2.6, fl(C)) +
      pfad("M4.2 -57.6Q7 -59.4 9.8 -57.6Q9.3 -55.2 7 -54.4Q4.7 -55.2 4.2 -57.6Z", fl(N)) +
      pfad("M7 -54.4V-52.8M4 -51.8Q5.6 -50 7 -52.6Q8.4 -50 10 -51.8", strich(N, 1.1)) +
      kreis(2.5, -53.5, 0.5, fl(N)) + kreis(4, -52, 0.5, fl(N)) + kreis(11.5, -53.5, 0.5, fl(N)) + kreis(10, -52, 0.5, fl(N)) +
      auge(-3.5, -62.5, 3.2) + auge(12.5, -62.5, 3) +
      backe(-8.5, -55, 3) + backe(16.5, -55.5, 2.6) +
      (o.figur === "leo" ? "" : fliege(o.farbe, 3, -36));
    return { links, rechts, bob, lid: lid(-3.5, -62.5, 3.2, Y) + lid(12.5, -62.5, 3, Y) };
  }

  // --- Maus (Mia: rotes Kleid mit Bubikragen; Oma Rosa: Brille, Tuch, Schürze) --
  function maus(o) {
    const G = "#a1a5af", K = "#71757f", IN = "#f3a7b1", W = "#efedec", N = "#e57e8e", T = "#e9a3ae", KT = "#c97987";
    const rosa = o.figur === "rosa";
    const [links, rechts] = beine(G, K, rosa ? "#7e6aa8" : G);
    let kleid = "", aermelH = "", aermelV = "", nachKopf = "";
    if (o.figur === "mia" || rosa) {
      const c = rosa ? "#a99ad8" : "#d8443e", k = ton(c, -0.3);
      const saum = rosa ? -7 : -12;
      const rock = s`M-6 -46C-10 -45 -12 -41 -13 -36L-17.5 ${saum - 2}Q0 ${saum + 2.5} 17.5 ${saum - 2}L13 -36C12 -41 10 -45 6 -46Z`;
      kleid = pfad(rock, fl(c, k)) + pfad(rock, LICHT);
      if (rosa) {
        kleid += pfad("M-8 -36C-9 -28 -11 -20 -11 -12Q2 -9 15 -12C14 -20 12.5 -28 12 -36Q2 -33 -8 -36Z", fl("#fbf8f2", "#d9d2c6", 1)) +
          pfad("M-11 -12Q-9 -10 -7 -12Q-5 -10 -3 -12Q-1 -10 1 -12Q3 -10 5 -12Q7 -10 9 -12Q11 -10 13 -12Q14.4 -10.6 15 -12", strich("#d9d2c6", 1));
      }
      aermelH = oval(13.4, -37, 5.2, 4.8, fl(c, k), -20);
      aermelV = oval(-13, -37, 5.3, 4.9, fl(c, k), 20);
      const kragen = oval(-0.5, -39.6, 4, 2.6, fl("#ffffff", "#d5d0cc", 1), 12) + oval(7, -39.6, 4, 2.6, fl("#ffffff", "#d5d0cc", 1), -12);
      if (rosa) {
        const sh = "#9d78c4", ks = "#6f4f93", glas = ' fill="#ffffff" fill-opacity=".2" stroke="#6e7480" stroke-width="1.3"';
        nachKopf = kragen + pfad("M-14 -44C-16 -38 -16 -33 -15 -29Q-4 -30 3 -25Q10 -30 18 -29C18.5 -33 18.5 -38 16.5 -44Q2 -37 -14 -44Z", fl(sh, ks)) +
          pfad("M-12 -40L-10 -31M-7 -38.4L-5.6 -29.6M10 -38.4L8.6 -29.6M14 -40L13 -31", strich(ks, 0.8)) +
          pfad("M1.5 -26L0 -20.5M4.5 -26L6 -20.5", strich(ks, 1.6)) + oval(3, -27.5, 2.6, 2.2, fl(ton(sh, -0.1), ks, 1)) +
          kreis(-3.2, -62, 5.1, glas) + kreis(13.2, -62, 4.6, glas) + pfad("M1.9 -62.6Q5 -64.4 8.6 -62.6", strich("#6e7480", 1.2));
      } else {
        nachKopf = kragen;
      }
    } else {
      kleid = shirt(o.farbe, 14);
      aermelH = aermelHinten(o.farbe);
      aermelV = aermelVorne(o.farbe);
    }
    const haar = rosa
      ? kreis(1.5, -81.8, 4.8, fl("#e4e6ea", "#a6aab3", 1)) + kreis(-3.2, -80.2, 3.5, fl("#e4e6ea", "#a6aab3", 1)) + kreis(6.2, -80.2, 3.5, fl("#e4e6ea", "#a6aab3", 1))
      : pfad("M-3 -79.5Q-2 -84.5 1.5 -83Q2 -86.5 5 -83.5Q6.5 -84 6.5 -80", fl(G, K));
    const bob =
      pfad("M-10 -14C-22 -12 -30 -16 -32 -24C-34 -31 -30 -36 -26 -34", strich(KT, 3.6)) + pfad("M-10 -14C-22 -12 -30 -16 -32 -24C-34 -31 -30 -36 -26 -34", strich(T, 2.2)) +
      armHinten(fl(G, K)) + aermelH +
      rumpfMit(14, G, K, oval(3, -24, 7.5, 10, fl(W))) + kleid +
      armVorne(fl(G, K)) + aermelV +
      kreis(-15.5, -78, 10.5, fl(G, K)) + kreis(-15, -77.5, 7, fl(IN)) + kreis(17, -77.5, 9.8, fl(G, K)) + kreis(16.6, -77, 6.4, fl(IN)) +
      haar + kopfMit(1, -61, 20.5, G, K) + (rosa ? kreis(1.5, -80.6, 3.2, fl("#e4e6ea")) : "") +
      oval(6, -54, 7, 5, fl(W)) +
      oval(6.5, -57, 2.3, 1.8, fl(N)) +
      pfad("M3.6 -53.2Q6.5 -50 9.4 -53.2", strich(K, 1.1)) +
      pfad("M-0.5 -55L-10 -56.5M-0.5 -53L-10 -52.5M13 -55L22.5 -56.5M13 -53L22.5 -52.5", strich(K, 0.6)) +
      auge(-3.2, -62, 3.4) + auge(13.2, -62, 3.1) +
      backe(-9, -55.5) + backe(18, -56, 3) + nachKopf;
    return { links, rechts, bob, lid: lid(-3.2, -62, 3.4, G) + lid(13.2, -62, 3.1, G) };
  }

  // --- Eichhörnchen (Flitz: grüner Strickschal, eingerollter Buschschwanz) -----
  function eichhoernchen(o) {
    const O = "#d26b33", K = "#a1481b", C = "#fdf0de", T = "#8b3c1a", N = "#3b2723", IN = "#f6b48a";
    const [links, rechts] = beine(O, K);
    const schwanz = "M-8 -24C-13 -28 -17 -34 -17 -40C-17 -48 -14 -55 -15 -62C-16 -70 -18 -78 -24 -80C-29 -82 -34 -82 -36.5 -79C-38.8 -76.4 -40 -73.6 -38.8 -70.8C-37 -70 -35 -71.8 -33.2 -72.6C-31 -72 -29.4 -68 -30.2 -64C-31.4 -58 -38 -52 -37 -42C-36 -26 -22 -13 -9 -13Z";
    const bob =
      pfad(schwanz, fl(ton(O, 0.04), K)) + pfad(schwanz, LICHT) +
      pfad("M-31 -44C-31.5 -54 -25.5 -62 -24.5 -71M-33.6 -76.6C-31.2 -77.6 -29.4 -76 -30.2 -73.4", strich(ton(O, 0.3), 1.8)) +
      armHinten(fl(O, K)) +
      rumpfMit(14, O, K, oval(3, -25, 8.5, 12, fl(C))) +
      armVorne(fl(O, K)) +
      (o.figur === "flitz" ? strickschal("#5e9a4a", -5) : halstuch(o.farbe)) +
      pfad("M-16 -73L-13 -93L-4 -81Z", fl(O, K)) + pfad("M-13.4 -78L-12.6 -88.5L-7.4 -81.5Z", fl(IN)) +
      pfad("M-13 -93L-15.6 -99M-13 -93L-12.4 -99.6M-13 -93L-9.6 -98", strich(T, 1.6)) +
      pfad("M5 -82L14 -93L18 -72Z", fl(O, K)) + pfad("M8.5 -81.6L13.6 -88.4L15.6 -75.5Z", fl(IN)) +
      pfad("M14 -93L12 -99.4M14 -93L15.4 -99.4M14 -93L17.8 -97.4", strich(T, 1.6)) +
      kopfMit(1, -63, 21, O, K) +
      oval(5.5, -54, 10.5, 7.5, fl(C)) +
      oval(6.5, -57.4, 2.4, 1.9, fl(N)) +
      pfad("M6.5 -55.5V-54M3.6 -53Q5.1 -51.3 6.5 -53.9Q7.9 -51.3 9.4 -53", strich(N, 1.1)) +
      auge(-3.5, -64.5, 3.5) + auge(13.5, -64.5, 3.2) +
      backe(-9.5, -57) + backe(18, -57.5, 3);
    return { links, rechts, bob, lid: lid(-3.5, -64.5, 3.5, O) + lid(13.5, -64.5, 3.2, O) };
  }

  // --- Steinbock (Sepp: rotes Halstuch mit Knoten, Kinnbärtchen) ---------------
  function steinbock(o) {
    const F = "#9c8e80", K = "#6c6056", C = "#eee6da", KC = "#cfc3b2", H = "#8f765d", KH = "#65513f", BD = "#857868", HO = "#4b4139", IN = "#e6aaa4";
    const huf = (x) => s`<rect x="${x + 0.5}" y="-20" width="6.5" height="17" rx="3"${fl(F, K)}/><rect x="${x}" y="-6" width="7.5" height="6" rx="2"${fl(HO, "#2f2823")}/>`;
    const [links, rechts] = [huf(-10.5), huf(0.5)];
    let zier;
    if (o.figur === "sepp") {
      const c = "#d23f36", k = "#9a2a23";
      zier = pfad("M-3.5 -39L11.5 -39L4 -26.5Z", fl(c, k)) + band(c, k, 5) +
        pfad("M3 -36.4L-1.5 -30.5L1.6 -30L4 -35ZM5 -36.4L10 -31L7 -30.2L4.2 -35Z", fl(c, k)) + kreis(4, -36.6, 2.3, fl(ton(c, -0.08), k));
    } else {
      zier = schal(o.farbe, -4);
    }
    // Hörner: vorne und hinten je eine Sichel mit Rillen
    const horn = (x, y, w, h) => {
      const vorn = [[x, y], [x + 1, y - 15], [x - 8 + w * 0.2, y - 27], [x - w, y - h]];
      const hinten = [[x - w, y - h], [x - w + 9, y - h + 6], [x - 9.5, y - 14], [x - 9.5, y + 2]];
      let rillen = "";
      [0.18, 0.34, 0.5, 0.66, 0.82].forEach((t) => {
        const a = kubisch(vorn, t), b = kubisch(hinten, 1 - t);
        rillen += s`M${a[0] + (b[0] - a[0]) * 0.12} ${a[1] + (b[1] - a[1]) * 0.12}L${b[0] + (a[0] - b[0]) * 0.12} ${b[1] + (a[1] - b[1]) * 0.12}`;
      });
      return [s`M${x} ${y}C${vorn[1][0]} ${vorn[1][1]} ${vorn[2][0]} ${vorn[2][1]} ${vorn[3][0]} ${vorn[3][1]}C${hinten[1][0]} ${hinten[1][1]} ${hinten[2][0]} ${hinten[2][1]} ${hinten[3][0]} ${hinten[3][1]}Z`, rillen];
    };
    const [h1, r1] = horn(5, -80, 20, 30), [h2, r2] = horn(-2.5, -78.5, 25, 29);
    const bob =
      pfad("M-13 -30Q-19 -34 -18 -40Q-14 -37 -12 -34Z", fl(F, K)) +
      armHinten(fl(F, K)) + s`<rect x="15.2" y="-25.6" width="5" height="4.6" rx="1.6" transform="rotate(-20 17.7 -23.3)"${fl(HO)}/>` +
      rumpfMit(14, F, K, oval(3, -22, 8, 10, fl(C)) + kreis(-9, -34, 1.2, fl(C)) + kreis(-12, -28, 1, fl(C)) + kreis(-8, -24, 1.1, fl(C))) +
      armVorne(fl(F, K)) + s`<rect x="-19.4" y="-25.6" width="5" height="4.6" rx="1.6" transform="rotate(20 -16.9 -23.3)"${fl(HO)}/>` +
      zier +
      pfad(h1, fl(ton(H, -0.1), KH)) + pfad(r1, strich(KH, 1)) +
      pfad(h2, fl(H, KH)) + pfad(r2, strich(KH, 1.1)) +
      oval(-16, -71, 8, 3.4, fl(F, K), 14) + oval(-15.8, -70.8, 4.8, 1.8, fl(IN), 14) +
      oval(18, -72.5, 7, 3.1, fl(F, K), -14) + oval(17.8, -72.3, 4.2, 1.6, fl(IN), -14) +
      oval(2, -63, 16.5, 18.5, fl(F, K), -8) + oval(2, -63, 16.5, 18.5, LICHT, -8) +
      oval(7.6, -50.6, 8.2, 6.2, fl(C, KC, 1), -8) +
      pfad("M5.8 -45Q6 -40 8.2 -38.2Q9.9 -41.2 10.2 -45.4Z", fl(BD, ton(BD, -0.28), 1)) +
      oval(5.4, -52.2, 1, 0.75, fl(K)) + oval(10.2, -52.9, 1, 0.75, fl(K)) +
      pfad("M5 -48.6Q7.8 -46.7 10.8 -48.9", strich(K, 1.1)) +
      auge(-4, -65, 3.5) + auge(9.5, -65.5, 3.2) +
      backe(-8.5, -57.5, 3) + backe(14.5, -58.5, 2.4);
    return { links, rechts, bob, lid: lid(-4, -65, 3.5, F) + lid(9.5, -65.5, 3.2, F) };
  }

  // --- Hund (Schlappohren, Halsband mit Marke) ---------------------------------
  function hund(o) {
    const D = "#cf9c66", K = "#9a6a3e", E = "#8e5c37", KE = "#64401f", C = "#f8ead6", KC = "#dcc6a8", N = "#33241f";
    const [links, rechts] = beine(D, K, C);
    const schwanz = "M-12 -22C-19 -25 -22 -32 -21 -38";
    const bob =
      pfad(schwanz, strich(K, 6.4)) + pfad(schwanz, strich(D, 4.2)) +
      armHinten(fl(D, K)) + kreis(...HAND_H, 3.2, fl(C, KC)) +
      rumpfMit(14.5, D, K, oval(3, -27, 8, 12, fl(C))) +
      armVorne(fl(D, K)) + kreis(...HAND_V, 3.3, fl(C, KC)) +
      halsband(o.farbe, false, 3, -45) +
      kopfMit(1, -61, 21, D, K) +
      pfad("M3 -81.5C1 -73 1 -65 2 -58.5H10C9 -65 8 -73 6 -81.5Z", fl(C)) +
      oval(6, -53, 10, 7.5, fl(C, KC, 1)) +
      oval(6.5, -57.5, 3.8, 2.8, fl(N)) + oval(5.2, -58.4, 1.3, 0.7, ' fill="#ffffff" opacity=".5"') +
      pfad("M5.2 -50.6Q6.6 -46.2 8.2 -50.4Z", fl("#ef8f9a", "#c96876", 0.8)) +
      pfad("M6.5 -54.7V-52.4M2.6 -51.4Q4.6 -48.8 6.5 -52Q8.4 -48.8 10.4 -51.4", strich(N, 1.1)) +
      pfad("M-10 -80C-17 -80 -23.5 -71 -23.5 -61C-23.5 -55 -21 -51 -18.5 -52C-16.5 -57 -15 -66 -13.5 -72C-12.8 -75 -11.5 -77.5 -10 -80Z", fl(E, KE)) +
      pfad("M12 -80C19 -80 24.5 -71 24.5 -61C24.5 -55 22 -51 19.5 -52C17.5 -57 16.5 -66 15 -72C14.3 -75 13.3 -77.5 12 -80Z", fl(E, KE)) +
      auge(-3.5, -63, 3.4) + auge(12.5, -63, 3.1) +
      backe(-9, -55.5, 3) + backe(15.5, -55.5, 2.6);
    return { links, rechts, bob, lid: lid(-3.5, -63, 3.4, D) + lid(12.5, -63, 3.1, D) };
  }

  // --- Igel (Stachelkleid, glatter Schal) --------------------------------------
  function igel(o) {
    const S = "#8a6748", KS = "#5e432e", SL = "#a8835e", F = "#f0dcc0", KF = "#c9a983", N = "#2f2420", L = "#c7a27b", KL = "#97754f";
    const [links, rechts] = beine(L, KL);
    // Zacken auf einem Bogen vom Scheitel über den Rücken bis zum Boden
    const zacken = (rx, ry, von, bis, n, tief) => {
      let d = "";
      for (let i = 0; i <= n * 2; i++) {
        const w = (von + (bis - von) * i / (n * 2)) * Math.PI / 180;
        const k = i % 2 ? 1 : tief;
        d += s`${i ? "L" : "M"}${Math.cos(w) * rx * k} ${-46 - Math.sin(w) * ry * k}`;
      }
      return d;
    };
    const kleid = zacken(26, 40, 58, 262, 13, 0.84) + "L6 -20L10 -60Z";
    const gesicht = "M-6 -72C-2 -77.5 6 -78 12 -74.5C17 -71.5 20 -66.5 22 -61.5C24.5 -60.2 27.4 -57.8 28 -55.6C28.4 -53.6 26.4 -52.2 23.4 -52.6C19.4 -51.8 15.4 -48.2 9.4 -46.8C2.4 -45.2 -4.6 -47.2 -7.6 -52.2C-10.6 -57.2 -10.4 -67 -6 -72Z";
    const bob =
      pfad(kleid, fl(S, KS)) + pfad(kleid, LICHT) + pfad(zacken(21, 33, 75, 250, 11, 0.82), strich(SL, 1.1)) +
      armHinten(fl(L, KL)) +
      rumpfMit(14, F, KF) +
      armVorne(fl(L, KL)) +
      schal(o.farbe, -2) +
      kreis(-5, -70, 3.6, fl(F, KF)) + kreis(-4.9, -69.9, 2, fl("#e8b4a4")) +
      pfad(gesicht, fl(F, KF)) + pfad(gesicht, LICHT) +
      kreis(27.4, -55.6, 2.3, fl(N)) + kreis(26.7, -56.3, 0.7, ' fill="#ffffff" opacity=".6"') +
      pfad("M17 -51.6Q20.5 -49.2 24 -51.8", strich(KF, 1.2)) +
      auge(3, -62, 3.3) + auge(14.5, -62.5, 3) +
      backe(-1, -54.5, 3) + backe(18.5, -56, 2.4);
    return { links, rechts, bob, lid: lid(3, -62, 3.3, F) + lid(14.5, -62.5, 3, F) };
  }

  // --- Kuh (Flecken, Hörnchen, Glocke am Riemen) -------------------------------
  function kuh(o) {
    const W = "#fbf8f2", K = "#cbbfb1", SP = "#4b4a52", P = "#f6b3c2", KP = "#d88aa0", H = "#f0e4c8", KH = "#c4b28c", HO = "#5b524b", IN = "#f4b7c5";
    const huf = (x) => s`<rect x="${x}" y="-20" width="7.5" height="17" rx="3.5"${fl(W, K)}/><rect x="${x - 0.2}" y="-6" width="7.9" height="6" rx="2"${fl(HO, "#3a332e")}/>`;
    const [links, rechts] = [huf(-11), huf(0)];
    const c = o.farbe, kc = ton(c, -0.3);
    const bob =
      pfad("M-12 -16C-22 -16 -28 -22 -28 -32", strich(K, 4)) + pfad("M-12 -16C-22 -16 -28 -22 -28 -32", strich(W, 2.4)) +
      pfad("M-28 -30.5C-30.5 -32 -30.5 -36 -28 -38C-25.5 -36 -25.5 -32 -28 -30.5Z", fl(SP)) +
      armHinten(fl(W, K)) + s`<rect x="15.2" y="-25.6" width="5" height="4.6" rx="1.6" transform="rotate(-20 17.7 -23.3)"${fl(HO)}/>` +
      rumpfMit(15.5, W, K, pfad("M-15.3 -36C-11 -38 -6 -35 -6.5 -30C-7 -25 -11 -23 -15.4 -24.5C-15.8 -28 -15.8 -32 -15.3 -36Z", fl(SP)) + pfad("M6 -18C9 -21 14 -20 15.2 -17C13.5 -14 10 -12 6.5 -12.5C4.5 -14 4.5 -16 6 -18Z", fl(SP))) +
      armVorne(fl(W, K)) + s`<rect x="-19.4" y="-25.6" width="5" height="4.6" rx="1.6" transform="rotate(20 -16.9 -23.3)"${fl(HO)}/>` +
      band(c, kc, 4.5) +
      pfad("M-9 -78.5Q-13 -82 -12 -88Q-8 -85 -5 -80Z", fl(H, KH)) + pfad("M8 -80Q12 -83.5 12 -89Q15 -84 12.5 -78.5Z", fl(H, KH)) +
      oval(-20, -66, 7, 3.6, fl(W, K), -18) + oval(-19.6, -66, 4, 1.8, fl(IN), -18) +
      oval(21.5, -67, 6.5, 3.4, fl(W, K), 18) + oval(21.2, -67, 3.6, 1.6, fl(IN), 18) +
      oval(1, -63, 19.5, 19, fl(W, K)) +
      pfad("M-12.5 -76C-8 -80.6 -2 -79.6 -1 -74.5C0 -69.5 -6 -67.5 -10 -70C-12.5 -71.5 -15 -73 -12.5 -76Z", fl(SP)) +
      pfad("M-3 -81.6Q-1 -85 1.5 -82Q3.5 -85 5.5 -81.6", fl(SP)) +
      oval(1, -63, 19.5, 19, LICHT) +
      oval(5, -50.5, 12, 8, fl(P, KP)) +
      oval(1, -51.5, 1.7, 1.2, fl(KP)) + oval(9, -51.5, 1.7, 1.2, fl(KP)) +
      pfad("M2 -46.5Q5 -44.5 8 -46.5", strich(KP, 1.1)) +
      auge(-4.5, -63.5, 3.3) + auge(11, -63.5, 3) +
      backe(-11.5, -57, 3) + backe(16.5, -57.5, 2.6) +
      pfad("M0.4 -38.6H7.6L8.6 -31.6Q4 -30 -0.6 -31.6Z", fl("#f0c24e", "#b98a1f")) + kreis(4, -30.8, 1.3, fl("#b98a1f"));
    return { links, rechts, bob, lid: lid(-4.5, -63.5, 3.3, W, "#6d625a") + lid(11, -63.5, 3, W, "#6d625a") };
  }

  // --- Elefant (grosse Ohren, Rüssel, Strickmütze) -----------------------------
  function elefant(o) {
    const E = "#a6aebb", K = "#737c8b", IN = "#efb1bf", L = "#c3c9d3", T = "#f6f1e6";
    const bein2 = (x) => s`<rect x="${x}" y="-20" width="8.5" height="20" rx="3.5"${fl(E, K)}/>` +
      pfad(s`M${x + 1.6} -0.8a1.4 1.4 0 0 1 2.8 0M${x + 4.6} -0.8a1.4 1.4 0 0 1 2.8 0`, fl(T, "#cfc8b8", 0.6));
    const [links, rechts] = [bein2(-11.5), bein2(0.5)];
    const c = o.farbe, kc = ton(c, -0.3);
    const bob =
      pfad("M-12 -18C-20 -18 -25 -24 -25 -31", strich(K, 3.6)) + pfad("M-12 -18C-20 -18 -25 -24 -25 -31", strich(E, 2)) +
      pfad("M-25 -29.5C-27.5 -31 -27.5 -35 -25 -37C-22.5 -35 -22.5 -31 -25 -29.5Z", fl(K)) +
      armHinten(fl(E, K)) +
      rumpfMit(15.5, E, K, oval(3, -24, 9, 12, fl(L))) +
      armVorne(fl(E, K)) +
      oval(-15.5, -61, 11, 14.5, fl(E, K), -10) + oval(-16, -60.5, 7, 10, fl(IN), -10) +
      oval(18, -61, 8.6, 13.5, fl(E, K), 10) + oval(18.4, -60.8, 5, 9.2, fl(IN), 10) +
      kopfMit(1, -62.5, 19.5, E, K) +
      pfad("M2 -58C1 -50 3 -42.5 10 -40.5C13 -39.7 16.5 -41.5 17.5 -44.5C17.8 -45.5 16.5 -46 15.5 -45.3C14 -44.2 12.5 -44.3 11.5 -45.5C9.5 -48 9.5 -53 10.5 -58Z", fl(E, K)) +
      pfad("M2.4 -52Q5.9 -50.8 9.6 -52M3.6 -47.6Q6.6 -46.4 9.6 -47.6", strich(K, 0.9)) +
      auge(-4, -65, 3.3) + auge(11.5, -65, 3) +
      backe(-9.5, -57) + backe(16, -58, 2.6) +
      pfad("M-13 -76C-12 -86 -5 -90 2 -90C9 -90 15 -86 16 -76Q2 -79.5 -13 -76Z", fl(c, kc)) +
      pfad("M-14 -77Q2 -81 17 -77L17.5 -73.5Q2 -77.5 -14.5 -73.5Z", fl(ton(c, -0.12), kc)) +
      pfad("M-10 -76.5V-73.8M-5 -77.6V-74.8M0 -78V-75.2M5 -78V-75.2M10 -77.4V-74.6M14.5 -76.6V-74", strich(kc, 0.8)) +
      kreis(2, -91, 4.4, fl(ton(c, 0.4), ton(c, 0.1)));
    return { links, rechts, bob, lid: lid(-4, -65, 3.3, E) + lid(11.5, -65, 3, E) };
  }

  const ZEICHNER = {
    fox: fuchs, bear: baer, rabbit: hase, cat: katze, panda, frog: frosch, owl: eule, penguin: pinguin,
    lion: loewe, mouse: maus, squirrel: eichhoernchen, ibex: steinbock, dog: hund, hedgehog: igel, cow: kuh, elephant: elefant,
  };

  // ---------------------------------------------------------------------------
  // Was die Ansicht braucht
  // ---------------------------------------------------------------------------
  // Ein Tier als SVG-Text (ein <g>). art: eine der ARTEN (sonst Fuchs);
  // figur: Kennung einer Buchfigur (bestimmt dann auch die Art); variante:
  // Farbe des Kleidungsstücks eines gewöhnlichen Tiers (beliebig gross, % 4).
  function tier(art, optionen) {
    const { gross = 1, variante = 0, figur = "" } = optionen || {};
    const fig = hat(FIGUREN, figur) ? figur : "";
    const a = fig ? FIGUREN[fig] : (hat(ZEICHNER, art) ? art : "fox");
    const v = (((Math.trunc(Number(variante)) || 0) % 4) + 4) % 4;
    const t = ZEICHNER[a]({ figur: fig, farbe: ZIER[a][v] });
    const k = Number(gross);
    const g = Number.isFinite(k) && k > 0 && k !== 1 ? ` transform="scale(${Math.round(k * 1000) / 1000})"` : "";
    // Grössere Figuren: innen vergrössert, damit die Klassen frei bleiben.
    const f = GROESSE[fig] || 1;
    const in_ = (x) => (f === 1 ? x : `<g transform="scale(${f})">${x}</g>`);
    return `<g${g} stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="0" cy="0" rx="${r(16 * f)}" ry="3.6" fill="#000000" opacity=".13"/>` +
      `<g class="legL">${in_(t.links)}</g><g class="legR">${in_(t.rechts)}</g>` +
      `<g class="bob">${in_(t.bob)}<g class="bt-lid" opacity="0">${in_(t.lid)}</g></g></g>`;
  }

  // Die Verläufe, einmal ins Dokument: Licht oben links, Rundung am Rand.
  function defs() {
    return '<radialGradient id="bt-licht" gradientUnits="objectBoundingBox" cx=".36" cy=".3" r=".78">' +
      '<stop offset="0" stop-color="#ffffff" stop-opacity=".38"/><stop offset=".34" stop-color="#ffffff" stop-opacity="0"/>' +
      '<stop offset=".64" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".2"/></radialGradient>';
  }

  // Der Kasten um die Zeichnung (gross = 1, ohne Schatten am Boden).
  // gemessen mit getBBox (ohne Schatten), mit 1 Einheit Rand für die Kontur:
  // BOX passt für jedes Aussehen der Art, BOX_GEWOEHNLICH für das gewöhnliche
  // Tier (alle Varianten), BOX_FIGUR für die Buchfigur.
  const BOX = {
    fox: { x0: -40, y0: -99, x1: 29, y1: 1 },
    bear: { x0: -25, y0: -97, x1: 27, y1: 1 },
    rabbit: { x0: -23, y0: -112, x1: 24, y1: 1 },
    cat: { x0: -33, y0: -96, x1: 26, y1: 1 },
    panda: { x0: -23, y0: -91, x1: 24, y1: 1 },
    frog: { x0: -22, y0: -93, x1: 25, y1: 1 },
    owl: { x0: -22, y0: -89, x1: 24, y1: 1 },
    penguin: { x0: -30, y0: -101, x1: 31, y1: 1 },
    lion: { x0: -37, y0: -89, x1: 28, y1: 1 },
    mouse: { x0: -34, y0: -90, x1: 28, y1: 1 },
    squirrel: { x0: -41, y0: -101, x1: 23, y1: 1 },
    ibex: { x0: -29, y0: -111, x1: 27, y1: 1 },
    dog: { x0: -25, y0: -83, x1: 26, y1: 1 },
    hedgehog: { x0: -27, y0: -87, x1: 31, y1: 1 },
    cow: { x0: -31, y0: -90, x1: 30, y1: 1 },
    elephant: { x0: -30, y0: -97, x1: 30, y1: 1 },
  };
  const BOX_GEWOEHNLICH = {
    fox: { x0: -40, y0: -99, x1: 29, y1: 1 },
    bear: { x0: -23, y0: -89, x1: 25, y1: 1 },
    rabbit: { x0: -23, y0: -112, x1: 24, y1: 1 },
    cat: { x0: -33, y0: -96, x1: 26, y1: 1 },
    panda: { x0: -23, y0: -89, x1: 24, y1: 1 },
    frog: { x0: -22, y0: -82, x1: 25, y1: 1 },
    owl: { x0: -22, y0: -89, x1: 24, y1: 1 },
    penguin: { x0: -24, y0: -91, x1: 26, y1: 1 },
    lion: { x0: -37, y0: -89, x1: 28, y1: 1 },
    mouse: { x0: -34, y0: -90, x1: 28, y1: 1 },
    squirrel: { x0: -41, y0: -101, x1: 23, y1: 1 },
    ibex: { x0: -29, y0: -111, x1: 27, y1: 1 },
    dog: { x0: -25, y0: -83, x1: 26, y1: 1 },
    hedgehog: { x0: -27, y0: -87, x1: 31, y1: 1 },
    cow: { x0: -31, y0: -90, x1: 30, y1: 1 },
    elephant: { x0: -30, y0: -97, x1: 30, y1: 1 },
  };
  const BOX_FIGUR = {
    fino: { x0: -40, y0: -99, x1: 29, y1: 1 },
    bruno: { x0: -23, y0: -89, x1: 25, y1: 1 },
    mamabaer: { x0: -25, y0: -97, x1: 27, y1: 1 },
    hoppel: { x0: -23, y0: -112, x1: 24, y1: 1 },
    tim: { x0: -33, y0: -96, x1: 26, y1: 1 },
    pippa: { x0: -23, y0: -91, x1: 24, y1: 1 },
    fred: { x0: -22, y0: -93, x1: 25, y1: 1 },
    fridolin: { x0: -22, y0: -82, x1: 25, y1: 1 },
    ella: { x0: -22, y0: -89, x1: 24, y1: 1 },
    pino: { x0: -24, y0: -91, x1: 26, y1: 1 },
    paul: { x0: -30, y0: -101, x1: 31, y1: 1 },
    leo: { x0: -37, y0: -89, x1: 28, y1: 1 },
    mia: { x0: -34, y0: -90, x1: 28, y1: 1 },
    rosa: { x0: -34, y0: -90, x1: 28, y1: 1 },
    flitz: { x0: -41, y0: -101, x1: 23, y1: 1 },
    sepp: { x0: -29, y0: -111, x1: 27, y1: 1 },
  };
  // box(art): passt für jedes Aussehen der Art (gewöhnlich und Figuren);
  // box(art, { figur }): genau für dieses Aussehen – figur "" (oder eine
  // unbekannte Kennung) ist das gewöhnliche Tier, wie bei tier().
  function box(art, optionen) {
    const a = hat(ZEICHNER, art) ? art : "fox";
    let b = BOX[a];
    if (optionen && typeof optionen === "object" && "figur" in optionen) {
      b = hat(BOX_FIGUR, optionen.figur) ? BOX_FIGUR[optionen.figur] : BOX_GEWOEHNLICH[a];
    }
    return { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 };
  }

  window.LernappBauTiere = { ARTEN, FIGUREN, tier, defs, box };
})();
