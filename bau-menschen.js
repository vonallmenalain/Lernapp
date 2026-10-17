/*
 * bau-menschen.js – Die Menschen der Bauecke, im Stil der Tiere (bau-tiere.js).
 * ---------------------------------------------------------------------------
 * Von Hand als SVG gezeichnet wie die Tiere: grosser runder Kopf, grosse
 * dunkle Augen mit Glanzpunkt, rosige Wangen, ein kleines Lächeln; weiche,
 * etwas dunklere Konturen statt schwarzer Linien. Den Glanz gibt derselbe
 * Verlauf wie bei den Tieren (url(#bt-licht) aus LernappBauTiere.defs(),
 * einmal im Dokument). Schlichte Kleider: T-Shirt, Hose, Rock, Kleid, Pulli.
 *
 * Masse (gross = 1): der Nullpunkt liegt zwischen den Füssen am Boden, nach
 * oben negativ. Das Kleinkind (es steht schon) ist etwa 60 hoch, die Kinder
 * etwa 100, die Erwachsenen etwa 125 (mit Dutt 129), die Grosseltern etwa
 * 120. Der Kopf ist gross: bei den Kindern gut ein Drittel der Höhe, bei den
 * Erwachsenen etwas weniger. Alles bleibt innerhalb x = ±31 (so weit
 * reichen nur die Zöpfe; Mützenschild bis 29, Stock und Handtasche bis -24).
 * Wie die Tiere schaut der Mensch leicht nach rechts; läuft er nach links,
 * spiegelt die Ansicht ihn mit scale(-1 1).
 *
 * Aufbau, gleich wie bei den Tieren (train-bau.js wackelt daran):
 *   <g>                                äusserstes g (scale, wenn gross ≠ 1;
 *                                      dazu Strichbreite und runde Ecken)
 *     <ellipse/>                       Schatten am Boden
 *     <g class="legL">…</g>            linkes Bein mit Schuh
 *     <g class="legR">…</g>            rechtes Bein mit Schuh
 *     <g class="bob">…                 alles andere (die Arme auch), zuletzt:
 *       <g class="bt-lid" opacity="0">…</g>   geschlossene Augen
 *
 * Aussehen: variante (eine ganze Zahl, % 256) wählt Hautton (vier, von hell
 * bis dunkelbraun), Haarfarbe (schwarz, dunkelbraun, hellbraun, blond, rot;
 * bei den Grosseltern grau, hellgrau, weiss), Frisur (vier je Art), Kleider
 * und deren Farbe, bei den Grosseltern auch Brille, Bart, Stock, Tasche. Die
 * Zahl wird zuerst umkehrbar gemischt: Nachbarn sehen verschieden aus, alle
 * 256 Varianten einer Art sind verschieden, und über alle 256 kommt jeder
 * Hautton und jede Frisur genau gleich oft vor (je 64-mal). Hautton und
 * Haarfarbe hängen nur von variante ab, nicht von der Art – eine Familie
 * mit derselben variante sieht verwandt aus, trägt aber andere Farben.
 *   m_baby         Locke, Flaum, Löckchen, Büscheli; Strampler mit Knöpfen
 *                  oder Latz
 *   m_maedchen     Zöpfe, Rossschwanz, Bob, zwei Lockenbäusche; Kleid,
 *                  T-Shirt und Rock oder T-Shirt und Hose
 *   m_bub          kurz, Locken, Stacheln, Dächlikappe; T-Shirt und Hose,
 *                  kurze Hose oder Latzhose (T-Shirts manchmal geringelt)
 *   m_frau         lang, Dutt, kurz, grosse Locken; Kleid, Pulli und Hose
 *                  oder Bluse und Rock
 *   m_mann         Seitenscheitel, Glatze mit Bart, Locken, kurz mit Bart;
 *                  Hemd, Pulli oder T-Shirt, dazu Hose
 *   m_grossmutter  Dutt, Locken, kurz, Zopf; Kleid, Strickjacke oder Bluse
 *                  und Rock; manchmal Brille, manchmal Handtasche
 *   m_grossvater   Haarkranz, Seitenscheitel, Schiebermütze, voll;
 *                  Weste, Strickjacke oder Pulli; manchmal Brille,
 *                  Schnauz oder Vollbart, Spazierstock
 *
 * Was es gibt (window.LernappBauMenschen):
 *   tier(art, { gross, variante })  der Mensch als SVG-Text (ein <g>)
 *   box(art)     der Kasten um die Zeichnung, für kleine Bildchen
 *   ARTEN, VARIANTEN
 *
 * Nur Zeichnen, kein Verhalten. Keine ids: das Bild darf oft im selben
 * Dokument stehen.
 */
(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Arten und Farben
  // ---------------------------------------------------------------------------
  const ARTEN = ["m_baby", "m_maedchen", "m_bub", "m_frau", "m_mann", "m_grossmutter", "m_grossvater"];
  const VARIANTEN = 256;

  // Kleiderfarben wie die Kleidungsstücke der Tiere, dazu Rosa
  const ROT = "#d9483b", BLAU = "#3f7fc4", GRUEN = "#4f9d55", GELB = "#f0b92e", VIOLETT = "#8b62c2", ORANGE = "#ef8a2c", TUERKIS = "#2aa39a", ROSA = "#e46f9b";
  const ZIER = [ROT, BLAU, GRUEN, GELB, VIOLETT, ORANGE, TUERKIS, ROSA];
  // dieselben Farben gedämpft, für die Grosseltern
  const ZIER_ALT = ["#b8574b", "#5b7fae", "#6b9a68", "#d2a442", "#8c72ad", "#c47d55", "#4b8f8b", "#b0627f"];
  const HOSE = ["#44649a", "#5d6270", "#8a6446", "#34507a"];   // Jeans, Grau, Braun, Dunkelblau
  const SCHUH = ["#5a443b", "#d9483b", "#3f7fc4", "#f4f2ee"];

  // Hauttöne: Fläche, Kontur, Wange (Farbe, Deckkraft), Mund, Wimpernlinie
  const HAUT = [
    { F: "#f7d7bf", K: "#d2a083", W: "#ff7b84", d: ".38", M: "#b5544a", L: "#4a332b" },
    { F: "#e9b68e", K: "#bb8761", W: "#f86d72", d: ".36", M: "#a3493d", L: "#44302a" },
    { F: "#c08558", K: "#8c5a36", W: "#e8565c", d: ".34", M: "#7c3a2c", L: "#36241c" },
    { F: "#89593b", K: "#5c3823", W: "#dc4f5a", d: ".32", M: "#4f2519", L: "#24150f" },
  ];
  const HAAR = [
    { F: "#30282a", K: "#17110f" },   // schwarz
    { F: "#5d3c28", K: "#392416" },   // dunkelbraun
    { F: "#9d6d42", K: "#6d4828" },   // hellbraun
    { F: "#ecc672", K: "#bf9441" },   // blond
    { F: "#cf6532", K: "#99431c" },   // rot
  ];
  const GRAU = [
    { F: "#a9a8ad", K: "#78777d" },   // grau
    { F: "#d3d1cc", K: "#a19e98" },   // hellgrau
    { F: "#f3f0ea", K: "#c2bdb4" },   // weiss
  ];

  const DUNKEL = "#2b201d";     // Augen

  // ---------------------------------------------------------------------------
  // Bausteine (wie in bau-tiere.js)
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
  const flaeche = (d, c, k = ton(c, -0.3)) => pfad(d, fl(c, k)) + pfad(d, LICHT);

  // Ein grosses, glänzendes Auge wie bei den Tieren
  function auge(x, y, rx) {
    const ry = rx * 1.15;
    return oval(x, y, rx, ry, ` fill="${DUNKEL}"`) + oval(x, y + ry * 0.52, rx * 0.56, ry * 0.28, ' fill="#ffffff" opacity=".22"') +
      kreis(x + rx * 0.3, y - ry * 0.36, rx * 0.42, ' fill="#ffffff"') +
      kreis(x - rx * 0.36, y + ry * 0.3, rx * 0.17, ' fill="#ffffff" opacity=".9"');
  }

  // Das geschlossene Auge: ein Lid in der Hautfarbe rundum und die Wimpernlinie.
  function lid(x, y, rx, haut, linie) {
    const ry = rx * 1.15;
    return oval(x, y, rx + 0.8, ry + 0.8, ` fill="${haut}"`) +
      pfad(s`M${x - rx - 0.2} ${y + 0.4}q${rx + 0.2} ${rx * 0.85} ${2 * rx + 0.4} 0`, strich(linie, 1.4));
  }

  const backe = (x, y, rx, deck, farbe) => oval(x, y, rx, rx * 0.62, ` fill="${farbe}" opacity="${deck}"`);

  // Ein Arm oder Bein als Kapsel: breite Kontur, darüber die Fläche.
  function glied(x1, y1, x2, y2, b, F, K) {
    const d = s`M${x1} ${y1}L${x2} ${y2}`;
    return pfad(d, strich(K, b + 2.6)) + pfad(d, strich(F, b));
  }

  // ---------------------------------------------------------------------------
  // Der Kopf
  // ---------------------------------------------------------------------------
  // Ein Pfad in Kopfmass (Mitte 0 0, Radius 1; nur absolute Befehle mit
  // Punktpaaren) auf den Kopf k = { x, y, r } gelegt.
  function amKopf(d, k) {
    let i = 0;
    return d.replace(/-?\d*\.?\d+/g, (z) => String(r(i++ % 2 ? k.y + z * k.r : k.x + z * k.r)));
  }
  // Ein Punkt in Kopfmass, als Winkel (Grad, 0 = rechts, 90 = oben) auf einer
  // Ellipse um (mx, my)
  const punkt = (k, mx, my, rx, ry, w) => s`${k.x + (mx + Math.cos(w * Math.PI / 180) * rx) * k.r} ${k.y + (my - Math.sin(w * Math.PI / 180) * ry) * k.r}`;
  // Buckel (Locken) längs einer Ellipse in Kopfmass, von Winkel a nach b, n
  // Buckel, die um aus nach aussen stehen (aus < 0: nach innen). Beginnt mit
  // einer Linie zum ersten Punkt (start "M": mit einem neuen Anfang).
  function buckel(k, mx, my, rx, ry, a, b, n, aus, start = "L") {
    let d = start + punkt(k, mx, my, rx, ry, a);
    for (let i = 1; i <= n; i++) {
      const w = a + (b - a) * i / n, wm = a + (b - a) * (i - 0.5) / n;
      d += `Q${punkt(k, mx, my, rx + aus, ry + aus, wm)} ${punkt(k, mx, my, rx, ry, w)}`;
    }
    return d;
  }

  // Ohren (vor dem Kopf zeichnen, er deckt sie halb)
  function ohren(k, h) {
    const R = k.r;
    return oval(k.x - 0.97 * R, k.y + 0.16 * R, 0.17 * R, 0.23 * R, fl(h.F, h.K)) +
      pfad(s`M${k.x - 0.99 * R} ${k.y + 0.06 * R}q${-0.08 * R} ${0.1 * R} ${0.02 * R} ${0.2 * R}`, strich(h.K, 0.9)) +
      oval(k.x + 0.98 * R, k.y + 0.14 * R, 0.12 * R, 0.2 * R, fl(h.F, h.K));
  }

  // Das Gesicht auf dem Kopf k: Augen, Nase, Mund, Wangen, auf Wunsch Brauen
  // (braue: Farbe) und Lachfältchen. Gibt { t, lid, augen }.
  function gesicht(k, h, ak, braue = "", falten = false) {
    const R = k.r, ex1 = k.x - 0.28 * R, ex2 = k.x + 0.5 * R, ey = k.y + 0.1 * R;
    const a1 = ak * R, a2 = a1 * 0.91;
    let t = auge(ex1, ey, a1) + auge(ex2, ey, a2);
    if (braue) {
      t += pfad(s`M${ex1 - a1 * 1.1} ${ey - a1 * 1.7}Q${ex1} ${ey - a1 * 2.35} ${ex1 + a1 * 1.05} ${ey - a1 * 1.85}M${ex2 - a2 * 1.05} ${ey - a2 * 1.85}Q${ex2} ${ey - a2 * 2.4} ${ex2 + a2 * 1.1} ${ey - a2 * 1.75}`, strich(braue, 1.4));
    }
    if (falten) {
      t += pfad(s`M${ex1 - a1 * 1.45} ${ey - a1 * 0.2}l${-a1 * 0.55} ${-a1 * 0.3}M${ex1 - a1 * 1.45} ${ey + a1 * 0.35}l${-a1 * 0.55} ${a1 * 0.2}`, strich(h.K, 0.8));
    }
    // kleine Nase (ein Bogen nach rechts) und ein Lächeln
    t += pfad(s`M${k.x + 0.19 * R} ${k.y + 0.27 * R}q${0.12 * R} ${0.11 * R} ${-0.01 * R} ${0.19 * R}`, strich(h.K, 1.2)) +
      pfad(s`M${k.x - 0.03 * R} ${k.y + 0.55 * R}Q${k.x + 0.17 * R} ${k.y + 0.71 * R} ${k.x + 0.39 * R} ${k.y + 0.53 * R}`, strich(h.M, 1.3)) +
      backe(k.x - 0.55 * R, k.y + 0.42 * R, 0.19 * R, h.d, h.W) + backe(k.x + 0.79 * R, k.y + 0.4 * R, 0.14 * R, h.d, h.W);
    return { t, lid: lid(ex1, ey, a1, h.F, h.L) + lid(ex2, ey, a2, h.F, h.L), augen: [ex1, ex2, ey, a1, a2] };
  }

  // Eine Brille um die Augen (nach dem Gesicht)
  function brille(k, augen, c = "#6b5448") {
    const [ex1, ex2, ey, a1] = augen, g = a1 * 1.85, g2 = g * 0.92;
    const glas = ` fill="#ffffff" fill-opacity=".2" stroke="${c}" stroke-width="1.3"`;
    return kreis(ex1, ey, g, glas) + kreis(ex2, ey, g2, glas) +
      pfad(s`M${ex1 + g} ${ey - 0.6}Q${(ex1 + ex2 + g - g2) / 2} ${ey - 2.2} ${ex2 - g2} ${ey - 0.6}M${ex1 - g} ${ey - 0.8}L${k.x - 0.93 * k.r} ${ey - 1.6}`, strich(c, 1.2));
  }

  // ---------------------------------------------------------------------------
  // Frisuren (Kopfmass; jede gibt { hinten, mitte, vorne, ohr })
  //   hinten: vor dem Rumpf (hinter allem), mitte: nach dem Rumpf, vor dem
  //   Kopf, vorne: nach dem Gesicht; ohr: die Ohren sind zu sehen
  // ---------------------------------------------------------------------------
  const KAPPE = {
    // kurz, mit Stirnfransen in Büscheln
    kurz: "M-1 0.18C-1.12 -0.56 -0.6 -1.13 0.04 -1.11C0.68 -1.09 1.1 -0.64 1 -0.1C0.92 -0.34 0.76 -0.46 0.56 -0.44Q0.44 -0.64 0.2 -0.52Q0 -0.68 -0.22 -0.52Q-0.46 -0.64 -0.6 -0.42Q-0.74 -0.2 -0.78 0.06Q-0.88 0.22 -1 0.18Z",
    // kurz, mit Seitenscheitel, nach rechts gekämmt
    scheitel: "M-1 0.16C-1.12 -0.56 -0.62 -1.13 0.04 -1.12C0.7 -1.1 1.12 -0.64 1 -0.04C0.94 -0.24 0.8 -0.38 0.62 -0.44C0.4 -0.5 0.18 -0.48 -0.02 -0.6C-0.24 -0.7 -0.48 -0.58 -0.62 -0.38Q-0.76 -0.18 -0.8 0.06Q-0.9 0.2 -1 0.16Z",
    // glatt nach hinten (für Dutt und Rossschwanz)
    glatt: "M-1.02 0.3C-1.14 -0.5 -0.66 -1.12 0.02 -1.1C0.7 -1.1 1.12 -0.6 1 -0.08C0.92 -0.3 0.7 -0.5 0.4 -0.56C0.1 -0.62 -0.3 -0.6 -0.56 -0.4C-0.74 -0.24 -0.8 0.05 -0.86 0.3Z",
    // Mittelscheitel (für Zöpfe)
    mitte: "M-1.02 0.3C-1.14 -0.5 -0.66 -1.1 0 -1.1C0.66 -1.1 1.1 -0.62 1 -0.05C0.9 -0.3 0.72 -0.44 0.5 -0.48C0.3 -0.52 0.12 -0.62 0.04 -0.8C-0.06 -0.6 -0.3 -0.5 -0.52 -0.42C-0.72 -0.3 -0.82 -0.05 -0.86 0.3Z",
    // gerade Stirnfransen, an den Seiten lang (Bob)
    fransen: "M-1.06 0.62C-1.18 -0.4 -0.72 -1.13 0.02 -1.13C0.74 -1.13 1.18 -0.62 1.08 0.12C1 -0.12 0.94 -0.3 0.88 -0.38C0.6 -0.36 0.3 -0.34 0 -0.38C-0.3 -0.4 -0.6 -0.4 -0.82 -0.4C-0.88 -0.1 -0.88 0.3 -0.84 0.62Z",
    // Seitenscheitel mit langer Strähne über die Stirn
    straehne: "M-1.06 0.8C-1.2 -0.3 -0.78 -1.14 0 -1.14C0.76 -1.14 1.18 -0.6 1.08 0.2C1 -0.1 0.86 -0.26 0.66 -0.3C0.3 -0.36 -0.1 -0.5 -0.38 -0.74C-0.5 -0.5 -0.7 -0.3 -0.84 -0.12C-0.9 0.2 -0.9 0.5 -0.86 0.8Z",
  };
  const haarFl = (d, H) => flaeche(d, H.F, H.K);
  const kappe = (name, k, H) => haarFl(amKopf(KAPPE[name], k), H);
  const linien = (d, k, H, w = 0.9) => pfad(amKopf(d, k), strich(H.K, w));

  // Locken: eine Wolke über dem Kopf, der Haaransatz ebenfalls in Buckeln.
  // gross: wie weit die Wolke absteht, n: wie viele Buckel
  function lockenKappe(k, H, gross = 1.08, n = 10) {
    return haarFl(buckel(k, 0, -0.04, gross, gross, 205, -25, n, 0.13, "M") +
      buckel(k, 0.02, 0.18, 0.95, 0.66, 14, 176, 7, -0.11) + "Z", H);
  }
  // Ein runder Lockenbausch (Puff) um (mx, my), Radius rr in Kopfmass
  const bausch = (k, H, mx, my, rr, n = 9) => haarFl(buckel(k, mx, my, rr, rr, 90, 450, n, 0.09, "M") + "Z", H);

  // Ein Haargummi an (x, y) in Kopfmass
  const gummi = (k, x, y, c, gr = 0.13) => oval(k.x + x * k.r, k.y + y * k.r, gr * k.r, gr * k.r * 0.8, fl(c, ton(c, -0.3)));

  const FRISUR = {
    // --- Kleinkind ---
    locke: (k, H) => ({
      vorne: haarFl(amKopf("M-0.86 -0.3C-0.8 -0.8 -0.4 -1.04 0.04 -1.04C0.46 -1.04 0.86 -0.8 0.92 -0.36C0.7 -0.6 0.4 -0.7 0.1 -0.68C-0.3 -0.66 -0.6 -0.56 -0.86 -0.3Z", k), H) +
        pfad(amKopf("M0.04 -1.02C-0.18 -1.26 0.1 -1.46 0.31 -1.32C0.46 -1.2 0.32 -1.04 0.18 -1.11", k), strich(H.F, 2.4)),
      ohr: true,
    }),
    flaum: (k, H) => ({
      vorne: haarFl(amKopf("M-0.98 0.04C-1.06 -0.6 -0.6 -1.08 0.02 -1.08C0.64 -1.08 1.04 -0.68 0.98 -0.18C0.84 -0.42 0.6 -0.54 0.36 -0.52L0.28 -0.64L0.12 -0.54L-0.02 -0.68L-0.16 -0.54C-0.42 -0.54 -0.66 -0.42 -0.78 -0.2Q-0.86 0 -0.98 0.04Z", k), H),
      ohr: true,
    }),
    loeckchen: (k, H) => ({ vorne: lockenKappe(k, H, 1.04, 9), ohr: true }),
    buescheli: (k, H, z) => ({
      hinten: haarFl(amKopf("M-0.12 -0.98C-0.38 -1.24 -0.3 -1.5 0 -1.54C0.3 -1.5 0.38 -1.24 0.14 -0.98Z", k), H),
      vorne: haarFl(amKopf("M-0.94 -0.1C-0.96 -0.7 -0.52 -1.06 0.02 -1.06C0.58 -1.06 0.98 -0.7 0.96 -0.2C0.8 -0.46 0.5 -0.6 0.14 -0.6C-0.24 -0.6 -0.66 -0.46 -0.94 -0.1Z", k), H) +
        linien("M-0.36 -0.98Q-0.2 -0.8 -0.24 -0.66M0.3 -1Q0.36 -0.82 0.28 -0.66", k, H) + gummi(k, 0.01, -1.02, z, 0.14),
      ohr: true,
    }),
    // --- Mädchen ---
    zoepfe: (k, H, z) => ({
      hinten: haarFl(amKopf("M-0.86 -0.16C-1.3 -0.32 -1.66 0.06 -1.62 0.5C-1.6 0.8 -1.44 0.98 -1.26 1.04C-1.32 0.74 -1.12 0.42 -0.86 0.24Z", k), H) +
        haarFl(amKopf("M0.86 -0.22C1.3 -0.36 1.62 0 1.6 0.44C1.58 0.74 1.42 0.92 1.24 0.98C1.3 0.68 1.1 0.38 0.86 0.2Z", k), H) +
        linien("M-1.06 0.08Q-1.36 0.3 -1.38 0.7M1.06 0.04Q1.34 0.24 1.36 0.62", k, H),
      vorne: kappe("mitte", k, H) + gummi(k, -0.98, 0.02, z) + gummi(k, 0.97, -0.03, z),
      ohr: false,
    }),
    ross: (k, H, z) => ({
      hinten: haarFl(amKopf("M-0.62 -0.86C-1.18 -1 -1.6 -0.5 -1.56 0.14C-1.52 0.6 -1.34 0.96 -1.14 1.12C-1.24 0.62 -1.2 0.06 -0.84 -0.38Z", k), H) +
        linien("M-1.06 -0.6Q-1.38 -0.2 -1.32 0.5", k, H),
      vorne: kappe("glatt", k, H) + linien("M-0.2 -1.04Q-0.5 -0.86 -0.72 -0.6M0.3 -1Q-0.1 -0.82 -0.4 -0.62", k, H) + gummi(k, -0.86, -0.66, z, 0.15),
      ohr: true,
    }),
    bob: (k, H) => ({
      hinten: haarFl(amKopf("M0 -1.1C-0.8 -1.1 -1.2 -0.62 -1.2 0.05C-1.2 0.45 -1.18 0.7 -1.06 0.86Q-0.82 0.98 -0.6 0.82L0.62 0.82Q0.86 0.98 1.08 0.84C1.18 0.6 1.18 0.3 1.16 0C1.14 -0.62 0.76 -1.1 0 -1.1Z", k), H),
      vorne: kappe("fransen", k, H) + linien("M-0.5 -0.4L-0.46 -0.6M-0.1 -0.38L-0.1 -0.58M0.32 -0.35L0.3 -0.55", k, H),
      ohr: false,
    }),
    puffs: (k, H, z) => ({
      hinten: bausch(k, H, -0.66, -0.9, 0.44) + bausch(k, H, 0.62, -0.96, 0.42),
      vorne: haarFl(amKopf("M-1 0.2C-1.1 -0.55 -0.62 -1.08 0.02 -1.08C0.66 -1.08 1.08 -0.64 1 -0.08C0.86 -0.36 0.6 -0.52 0.3 -0.54C0 -0.56 -0.36 -0.52 -0.6 -0.34C-0.78 -0.18 -0.84 0.02 -0.86 0.2Z", k), H) +
        gummi(k, -0.5, -0.72, z, 0.12) + gummi(k, 0.46, -0.78, z, 0.12),
      ohr: true,
    }),
    // --- Bub ---
    kurz: (k, H) => ({ vorne: kappe("kurz", k, H), ohr: true }),
    locken: (k, H) => ({ vorne: lockenKappe(k, H), ohr: true }),
    stachel: (k, H) => {
      let d = `M${punkt(k, 0, 0, 1, 1, 200)}L${punkt(k, 0, 0, 1.03, 1.03, 175)}`;
      for (let i = 0; i < 7; i++) {
        const w = 175 - i * 170 / 7;
        d += `L${punkt(k, 0, 0, 1.3, 1.3, w - 85 / 7)}L${punkt(k, 0, 0, 1.03, 1.03, w - 170 / 7)}`;
      }
      d += amKopf("L1 -0.1Q0.9 -0.32 0.56 -0.44L0.4 -0.64L0.2 -0.5L0 -0.7L-0.22 -0.52L-0.44 -0.66L-0.6 -0.42Q-0.74 -0.2 -0.78 0.06Q-0.88 0.22 -1 0.18Z", k);
      return { vorne: haarFl(d, H), ohr: true };
    },
    kappe: (k, H, z) => {
      const c = z, kc = ton(z, -0.3);
      return {
        vorne: kappe("kurz", k, H) +
          flaeche(amKopf("M-1.07 -0.22C-1.08 -0.86 -0.6 -1.2 0.04 -1.2C0.7 -1.2 1.1 -0.84 1.08 -0.26C0.4 -0.36 -0.4 -0.36 -1.07 -0.22Z", k), c, kc) +
          pfad(amKopf("M-0.1 -1.2Q-0.12 -0.74 0 -0.32", k), strich(kc, 0.9)) +
          pfad(amKopf("M0.3 -0.34C0.7 -0.44 1.2 -0.42 1.48 -0.26C1.56 -0.16 1.48 -0.08 1.34 -0.08C1 -0.12 0.6 -0.14 0.3 -0.18Z", k), fl(ton(c, -0.12), kc)) +
          kreis(k.x - 0.04 * k.r, k.y - 1.2 * k.r, 0.09 * k.r, fl(kc)),
        ohr: true,
      };
    },
  };

  // ---------------------------------------------------------------------------
  // Kleider
  // ---------------------------------------------------------------------------
  // Der Rumpf (Oberteil) von der Schulter ys bis zum Saum yh; ws, wh: halbe
  // Breite an der Schulter und am Saum.
  function rumpfPfad(ys, yh, ws, wh, bogen = 1.6) {
    return s`M0 ${ys}C${ws * 0.6} ${ys} ${ws} ${ys + 1} ${ws} ${ys + 6}L${wh} ${yh}Q0 ${yh + bogen} ${-wh} ${yh}L${-ws} ${ys + 6}C${-ws} ${ys + 1} ${-ws * 0.6} ${ys} 0 ${ys}Z`;
  }
  // Ein Rock von der Taille yw (halbe Breite ww) bis zum Saum yk (wk)
  function rockPfad(yw, ww, yk, wk) {
    return s`M${-ww} ${yw}L${ww} ${yw}Q${ww + 1.5} ${(yw + yk) / 2} ${wk} ${yk}Q0 ${yk + 3} ${-wk} ${yk}Q${-ww - 1.5} ${(yw + yk) / 2} ${-ww} ${yw}Z`;
  }
  // Der Halsausschnitt: Haut in einem Bogen, darüber die Kante
  function ausschnitt(m, h, kc, tief = 5) {
    const d = s`M-4.4 ${m.ys + 0.3}Q0.6 ${m.ys + tief} 5.6 ${m.ys + 0.3}`;
    return pfad(d + "Z", fl(h.F)) + pfad(d, strich(kc, 1.2));
  }
  // Hemdkragen: zwei Spitzen
  const kragen = (m, c, kc) => pfad(s`M0.6 ${m.ys + 0.6}L-5.4 ${m.ys - 0.2}L-3.4 ${m.ys + 5.6}ZM0.6 ${m.ys + 0.6}L6.6 ${m.ys - 0.2}L4.6 ${m.ys + 5.6}Z`, fl(c, kc, 1));
  // Bubikragen: zwei runde Lappen
  const bubikragen = (m) => oval(-2.4, m.ys + 2, 4, 2.6, fl("#ffffff", "#d5d0cc", 1), 14) + oval(3.6, m.ys + 2, 4, 2.6, fl("#ffffff", "#d5d0cc", 1), -14);
  // Knöpfe senkrecht ab y
  function knoepfe(x, y, n, ab, c) {
    let t = "";
    for (let i = 0; i < n; i++) t += kreis(x, y + i * ab, 0.9, fl(c));
    return t;
  }
  // Der Hosenboden über den Beinen (im wippenden Teil, vor dem Oberteil)
  const hosenboden = (m, c) => pfad(s`M${m.bl - 0.4} ${m.yh - 6}H${m.br + m.bb + 0.4}V${m.yh + 3}Q${m.br + m.bb + 0.4} ${m.yh + 6} ${m.br + m.bb - 3} ${m.yh + 6}H${m.bl + 2.6}Q${m.bl - 0.4} ${m.yh + 6} ${m.bl - 0.4} ${m.yh + 3}Z`, fl(c, ton(c, -0.3)));

  // Ein Bein mit Schuh: x linke Kante, Breite b, von y0 bis zum Boden. hose:
  // Farbe der Hose (bis hoseBis; eine lange Hose reicht bis zum Schuh, dann
  // fehlt die Haut darunter), sonst Haut; socke: Farbe eines Söckchens.
  function bein(x, b, y0, h, schuh, hose = "", hoseBis = -4.5, socke = "") {
    const lang = hose && hoseBis >= -5;
    let t = "";
    if (!lang) t += s`<rect x="${x}" y="${y0}" width="${b}" height="${-3 - y0}" rx="${b / 2}"${fl(h.F, h.K)}/>`;
    if (socke) t += s`<rect x="${x - 0.2}" y="-9" width="${b + 0.4}" height="6.5" rx="1.6"${fl(socke, ton(socke, -0.22), 1)}/>`;
    if (hose) t += s`<rect x="${x - 0.4}" y="${y0}" width="${b + 0.8}" height="${hoseBis - y0}" rx="2.2"${fl(hose, ton(hose, -0.3))}/>`;
    return t + oval(x + b / 2 + 1.4, -2.9, b / 2 + 2.4, 2.9, fl(schuh, schuh === "#f4f2ee" ? "#b9b4ab" : ton(schuh, -0.32)));
  }
  const beine = (m, h, schuh, hose, hoseBis, socke) => [bein(m.bl, m.bb, m.by, h, schuh, hose, hoseBis, socke), bein(m.br, m.bb, m.by, h, schuh, hose, hoseBis, socke)];

  // Ein Arm von der Schulter zur Hand; aermel: Farbe und Anteil (0…1)
  function arm(sx, sy, hx, hy, b, h, aermel) {
    let t = glied(sx, sy, hx, hy, b, h.F, h.K);
    if (aermel && aermel[1] > 0) {
      const [c, teil] = aermel;
      t += glied(sx, sy, sx + (hx - sx) * teil, sy + (hy - sy) * teil, b + 1.2, c, ton(c, -0.3));
    }
    return t + kreis(hx + (hx - sx) * 0.06, hy + 1.2, b * 0.56, fl(h.F, h.K));
  }

  // ---------------------------------------------------------------------------
  // Masse der Arten
  // ---------------------------------------------------------------------------
  // k: Kopf (Mitte, Radius); ys/yh: Schulter und Saum des Oberteils, ws/wh:
  // halbe Breite dort; by: oberes Ende der Beine, bb: Beinbreite, bl/br:
  // linke Kante des linken und des rechten Beins; arm: Schulter und Hand
  // rechts (links gespiegelt); ab: Armbreite; ak: Augengrösse; sch: Schatten;
  // knie: Saum von Rock und Kleid.
  const BABY = { k: { x: 1, y: -41, r: 14 }, ys: -28.5, yh: -10.5, ws: 8.5, wh: 11, by: -17, bb: 7.6, bl: -8.4, br: 0.2, arm: [6, -24, 11.2, -15.5], ab: 4.8, ak: 0.2, sch: 11 };
  const KIND = { k: { x: 1, y: -78, r: 18.5 }, ys: -60.5, yh: -34, ws: 10.5, wh: 12, by: -39, bb: 8.6, bl: -9.4, br: 0.4, arm: [7.4, -55, 13.4, -36], ab: 5.8, ak: 0.185, sch: 14, knie: -21 };
  const ERW = { k: { x: 1, y: -103, r: 17.5 }, ys: -84, yh: -49, ws: 12, wh: 12.5, by: -54, bb: 9.6, bl: -10.4, br: 0.4, arm: [9, -78.5, 15.6, -49.5], ab: 6.4, ak: 0.172, sch: 16, knie: -33 };
  const ALT = { k: { x: 1, y: -98, r: 17.5 }, ys: -79, yh: -46, ws: 12.5, wh: 14, by: -51, bb: 9.6, bl: -10.4, br: 0.4, arm: [9.4, -73.5, 16.2, -45.5], ab: 6.4, ak: 0.165, sch: 16, knie: -24 };

  // ---------------------------------------------------------------------------
  // Aussehen aus der Variante
  // ---------------------------------------------------------------------------
  // variante → 0…255, umkehrbar gemischt: Abziehen, ungerade Faktoren,
  // Tauschen der Halbbytes und Schieben mit XOR lassen sich alle umkehren,
  // also gibt jede der 256 Zahlen ein anderes p. Die Halbbytes zu tauschen
  // trägt die unteren Bits nach oben – so unterscheiden sich auch Nachbarn.
  const tausch = (x) => ((x << 4) | (x >> 4)) & 255;
  function mische(v) {
    let x = (((Math.trunc(Number(v)) || 0) % 256) + 256) % 256;
    x = tausch((13 - x) & 255);
    x = (x * 105 + 101) & 255;
    x = tausch(x ^ (x >> 3));
    x = (101 - x) & 255;
    return x ^ (x >> 4);
  }
  // Aus p: Hautton (2 Bit) und Frisur (2 Bit) je genau 64-mal; aus dem Rest
  // (0…15) Haarfarbe (rest % 5 bzw. % 3) und Kleiderfarbe (rest % 8) – nach
  // dem chinesischen Restsatz ist das Paar für jeden Rest ein anderes. Die
  // Kleiderfarbe verschiebt sich je Art: Eine Familie mit derselben
  // variante hat dieselbe Haut und dasselbe Haar, aber nicht dieselben Kleider.
  function aussehen(v, nr) {
    const p = mische(v), rest = p >> 4;
    return { haut: HAUT[p & 3], frisur: (p >> 2) & 3, haar: (rest * 3 + 1) % 5, grau: rest % 3, farbe: (rest * 5 + 2 + nr * 3) % 8, rest };
  }

  // ---------------------------------------------------------------------------
  // Die Arten
  // ---------------------------------------------------------------------------
  // Jede Art gibt { links, rechts, bob, lid, sch } zurück.

  // Zusammensetzen: t = { haar, links, rechts, unten (vor dem Oberteil),
  // oberteil, ueber (nach dem Oberteil), vorArm (vor dem vorderen Arm),
  // aermel, braue, falten, zier (nach dem Gesicht, mit augen) }
  function zusammen(m, h, t) {
    const k = m.k, [sx, sy, hx, hy] = m.arm;
    const g = gesicht(k, h, m.ak, t.braue, t.falten);
    const hr = t.haar;
    const bob = (hr.hinten || "") + arm(sx, sy, hx, hy, m.ab, h, t.aermel) + (t.unten || "") + t.oberteil + (t.ueber || "") +
      (t.vorArm || "") + arm(-sx, sy, -hx, hy, m.ab, h, t.aermel) + (hr.mitte || "") +
      (hr.ohr ? ohren(k, h) : "") + kreis(k.x, k.y, k.r, fl(h.F, h.K)) + kreis(k.x, k.y, k.r, LICHT) +
      g.t + (hr.vorne || "") + (t.zier ? t.zier(g.augen) : "");
    return { links: t.links, rechts: t.rechts, bob, lid: g.lid, sch: m.sch };
  }

  // --- Kleinkind: Strampler, ein Löckchen oder ein Büscheli ------------------
  function baby(o) {
    const m = BABY, h = o.haut, c = ZIER[o.farbe], kc = ton(c, -0.3);
    const H = HAAR[o.haar];
    const haar = FRISUR[["locke", "flaum", "loeckchen", "buescheli"][o.frisur]](m.k, H, ZIER[(o.farbe + 3) % 8]);
    // Die Beine stecken im Strampler, unten Söckchen
    const socke = o.rest & 1 ? "#ffffff" : ton(c, 0.55);
    const fuss = (x) => s`<rect x="${x}" y="${m.by}" width="${m.bb}" height="${-4 - m.by}" rx="3.4"${fl(c, kc)}/>` +
      oval(x + m.bb / 2 + 0.9, -2.6, m.bb / 2 + 1.6, 2.6, fl(socke, ton(socke, -0.25)));
    const leib = "M0 -28.5C6 -28.5 8.6 -26.5 9.2 -22C10.6 -18 11.4 -14 10.6 -10.4Q0 -7.6 -10.6 -10.4C-11.4 -14 -10.6 -18 -9.2 -22C-8.6 -26.5 -6 -28.5 0 -28.5Z";
    let ueber = "";
    if (o.rest & 2) {
      // Latz in hellerer Farbe mit zwei Knöpfen
      ueber = pfad("M-5.4 -24.5H6.4V-17Q0.5 -14.6 -5.4 -17Z", fl(ton(c, 0.45), kc, 1)) + kreis(-3.4, -22.6, 0.9, fl(kc)) + kreis(4.4, -22.6, 0.9, fl(kc));
    } else {
      ueber = knoepfe(0.5, -24.6, 3, 4.2, ton(c, 0.55));
    }
    return zusammen(m, h, {
      haar, links: fuss(m.bl), rechts: fuss(m.br),
      oberteil: flaeche(leib, c, kc) + ueber + ausschnitt(m, h, kc, 4),
      aermel: [c, 0.75],
    });
  }

  // --- Kinder ----------------------------------------------------------------
  function kind(o, maedchen) {
    const m = KIND, h = o.haut, c = ZIER[o.farbe], kc = ton(c, -0.3), c2 = ZIER[(o.farbe + 3) % 8];
    const H = HAAR[o.haar];
    const namen = maedchen ? ["zoepfe", "ross", "bob", "puffs"] : ["kurz", "locken", "stachel", "kappe"];
    const haar = FRISUR[namen[o.frisur]](m.k, H, ZIER[(o.farbe + 5) % 8]);
    const form = o.rest % 3;
    const schuh = SCHUH[(o.rest >> 2) & 3];
    const hose = HOSE[(o.rest >> 1) & 3];
    let shirt = flaeche(rumpfPfad(m.ys, m.yh, m.ws, m.wh), c, kc);
    if (o.rest % 4 === 1) {
      // Ringelshirt: weisse Streifen quer, so breit wie der Rumpf dort
      let d = "";
      for (let y = m.ys + 9; y < m.yh - 2; y += 5.5) {
        const w = m.ws + (m.wh - m.ws) * (y - m.ys - 6) / (m.yh - m.ys - 6) - 0.7;
        d += s`M${-w} ${y}Q0 ${y + 1.6} ${w} ${y}`;
      }
      shirt += pfad(d, ' fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="butt" stroke-opacity=".75"');
    }
    shirt += ausschnitt(m, h, kc);
    const t = { haar, aermel: [c, 0.4] };
    let links, rechts;
    if (maedchen && form < 2) {
      [links, rechts] = beine(m, h, schuh, "", 0, o.rest & 8 ? "#ffffff" : "");
      if (form === 0) {
        // Kleid mit Bubikragen
        t.unten = flaeche(rockPfad(m.yh - 4, m.wh - 1.5, m.knie, 15.5), c, kc);
        t.oberteil = flaeche(rumpfPfad(m.ys, m.yh - 3, m.ws, m.wh - 1), c, kc) + ausschnitt(m, h, kc) + bubikragen(m);
      } else {
        // T-Shirt und Rock
        t.unten = flaeche(rockPfad(m.yh - 4, m.wh - 1.5, m.knie, 15), c2) + pfad(s`M-4 ${m.yh}L-5.4 ${m.knie + 0.8}M5 ${m.yh}L6.4 ${m.knie + 0.8}`, strich(ton(c2, -0.3), 0.9));
        t.oberteil = shirt;
      }
    } else if (!maedchen && form === 1) {
      // T-Shirt und kurze Hose, Söckchen
      [links, rechts] = beine(m, h, schuh, hose, m.by + 13, "#ffffff");
      t.unten = hosenboden(m, hose);
      t.oberteil = shirt;
    } else if (!maedchen && form === 2) {
      // Latzhose über dem T-Shirt
      const lh = HOSE[o.rest & 1 ? 0 : 3];
      [links, rechts] = beine(m, h, schuh, lh);
      t.unten = hosenboden(m, lh);
      t.oberteil = shirt;
      const kl = ton(lh, -0.3);
      t.ueber = pfad(s`M-6.4 -49H7.4V${m.yh + 1}H-6.4Z`, fl(lh, kl)) + pfad(s`M-5.6 -48.6L-8.6 ${m.ys + 1.4}M6.6 -48.6L8.8 ${m.ys + 1.4}`, strich(kl, 3.4)) +
        pfad(s`M-5.6 -48.6L-8.6 ${m.ys + 1.4}M6.6 -48.6L8.8 ${m.ys + 1.4}`, strich(lh, 1.4)) +
        kreis(-5.2, -47.6, 1.1, fl("#f0c24e", "#b98a1f", 0.7)) + kreis(6.2, -47.6, 1.1, fl("#f0c24e", "#b98a1f", 0.7)) +
        pfad("M-2.4 -45.4H3.4V-41.2H-2.4Z", strich(kl, 0.9));
    } else {
      // T-Shirt und lange Hose
      const hs = maedchen ? c2 : hose;
      [links, rechts] = beine(m, h, schuh, hs);
      t.unten = hosenboden(m, hs);
      t.oberteil = shirt;
    }
    t.links = links;
    t.rechts = rechts;
    return zusammen(m, h, t);
  }

  // --- Erwachsene ------------------------------------------------------------
  function frau(o) {
    const m = { ...ERW, ws: 11.6, wh: 12.4 }, h = o.haut, c = ZIER[o.farbe], kc = ton(c, -0.3), c2 = ZIER[(o.farbe + 3) % 8];
    const H = HAAR[o.haar];
    const fr = o.frisur;
    const k = m.k;
    let haar;
    if (fr === 0) {
      // lang, mit Seitenscheitel
      haar = {
        hinten: haarFl(amKopf("M0 -1.14C-0.86 -1.14 -1.24 -0.56 -1.22 0.2C-1.2 0.9 -1.3 1.5 -1.2 2Q-0.6 2.12 0 1.96Q0.6 2.12 1.2 2C1.3 1.5 1.2 0.9 1.2 0.2C1.2 -0.56 0.86 -1.14 0 -1.14Z", k), H),
        vorne: kappe("straehne", k, H) + linien("M-0.36 -0.72Q-0.66 -0.4 -0.7 0.4M-0.2 -0.66Q0.2 -0.4 0.6 -0.32", k, H),
      };
    } else if (fr === 1) {
      // Dutt oben
      haar = {
        hinten: bausch(k, H, -0.12, -1.18, 0.3, 7),
        vorne: kappe("glatt", k, H) + linien("M-0.1 -1.06Q-0.5 -0.9 -0.7 -0.6M0.3 -1.02Q0 -0.84 -0.36 -0.62", k, H),
        ohr: true,
      };
    } else if (fr === 2) {
      // kurz (Pixie), Strähne zur Seite
      haar = {
        vorne: haarFl(amKopf("M-1.02 0.32C-1.16 -0.5 -0.66 -1.14 0.04 -1.13C0.72 -1.12 1.14 -0.64 1.02 -0.06C0.94 -0.22 0.82 -0.3 0.66 -0.32C0.3 -0.36 -0.06 -0.48 -0.32 -0.7C-0.44 -0.46 -0.66 -0.3 -0.8 -0.1C-0.86 0.06 -0.86 0.2 -0.84 0.34Z", k), H),
        ohr: true,
      };
    } else {
      // grosse Locken
      haar = {
        hinten: haarFl(buckel(k, 0, 0.06, 1.36, 1.28, 232, -52, 12, 0.13, "M") + "Z", H),
        vorne: lockenKappe(k, H, 1.1, 10),
      };
    }
    const form = o.rest % 3;
    const schuh = ["#5a443b", "#8a3b3b", "#3b3b46", "#7a5a3c"][(o.rest >> 2) & 3];
    const t = { haar, braue: H.K };
    let links, rechts;
    if (form === 0) {
      // Kleid
      [links, rechts] = beine(m, h, schuh);
      t.unten = flaeche(rockPfad(m.yh - 6, m.wh - 1.4, m.knie, 17), c, kc);
      t.oberteil = flaeche(rumpfPfad(m.ys, m.yh - 5, m.ws, m.wh - 1), c, kc) + ausschnitt(m, h, kc, 6);
      t.aermel = [c, 0.36];
    } else if (form === 1) {
      // Pulli und Hose
      const hs = HOSE[(o.rest >> 1) & 3];
      [links, rechts] = beine(m, h, schuh, hs);
      t.unten = hosenboden(m, hs);
      t.oberteil = flaeche(rumpfPfad(m.ys, m.yh, m.ws, m.wh), c, kc) + pfad(s`M${-m.wh + 0.3} ${m.yh - 3}Q0 ${m.yh - 1.4} ${m.wh - 0.3} ${m.yh - 3}`, strich(kc, 1)) + ausschnitt(m, h, kc, 5);
      t.aermel = [c, 0.92];
    } else {
      // Bluse und Rock
      [links, rechts] = beine(m, h, schuh);
      t.unten = flaeche(rockPfad(m.yh - 4, m.wh - 1, m.knie + 2, 15.5), c2) + pfad(s`M-4 ${m.yh}L-5.4 ${m.knie + 2.8}M5 ${m.yh}L6.4 ${m.knie + 2.8}`, strich(ton(c2, -0.3), 0.9));
      t.oberteil = flaeche(rumpfPfad(m.ys, m.yh, m.ws, m.wh - 0.5), c, kc) + ausschnitt(m, h, kc, 7) + knoepfe(0.6, m.ys + 9, 3, 6, ton(c, 0.5));
      t.aermel = [c, 0.5];
    }
    if (o.rest & 8 && haar.ohr) t.zier = () => kreis(k.x - 0.97 * k.r, k.y + 0.42 * k.r, 1.3, fl("#f3c24f", "#b98a22", 0.8));
    t.links = links;
    t.rechts = rechts;
    return zusammen(m, h, t);
  }

  // Bart: voll (um Kinn und Wangen) oder nur ein Schnauz; mit Mund darüber
  function bart(k, H, voll) {
    const mund = pfad(amKopf("M-0.02 0.66Q0.17 0.86 0.38 0.64Q0.17 0.72 -0.02 0.66Z", k), fl("#8a3b33", "#6b2a24", 0.8));
    if (voll) {
      return haarFl(amKopf("M-0.95 0.05C-0.98 0.7 -0.5 1.2 0.15 1.2C0.75 1.2 1.04 0.7 0.98 0.08C0.9 0.3 0.8 0.5 0.62 0.56C0.5 0.44 0.32 0.4 0.17 0.45C0 0.4 -0.24 0.44 -0.34 0.58C-0.52 0.6 -0.76 0.42 -0.95 0.05Z", k), H) + mund;
    }
    return haarFl(amKopf("M-0.16 0.52C-0.08 0.4 0.08 0.38 0.17 0.44C0.26 0.38 0.46 0.4 0.54 0.52C0.42 0.62 0.26 0.6 0.17 0.53C0.08 0.62 -0.06 0.62 -0.16 0.52Z", k), H);
  }
  // Haarkranz an den Seiten (Glatze)
  const kranz = (k, H) => haarFl(buckel(k, -0.9, -0.14, 0.15, 0.3, 250, 470, 6, 0.06, "M") + "Z", H) +
    haarFl(buckel(k, 0.93, -0.2, 0.09, 0.2, 110, 330, 4, 0.05, "M") + "Z", H);

  function mann(o) {
    const m = { ...ERW, ws: 13.4, wh: 13, arm: [10.2, -78.5, 16.6, -49.5] }, h = o.haut, c = ZIER[o.farbe], kc = ton(c, -0.3);
    const H = HAAR[o.haar], k = m.k;
    const fr = o.frisur;
    let haar, zier = null;
    if (fr === 0) haar = { vorne: kappe("scheitel", k, H) + linien("M-0.42 -1Q-0.3 -0.8 -0.36 -0.62", k, H), ohr: true };
    else if (fr === 1) { haar = { vorne: kranz(k, H), ohr: true }; zier = () => bart(k, H, true); }
    else if (fr === 2) haar = { vorne: lockenKappe(k, H, 1.1, 10), ohr: true };
    else { haar = { vorne: kappe("kurz", k, H), ohr: true }; zier = () => bart(k, H, true); }
    const form = o.rest % 3;
    const hs = HOSE[(o.rest >> 1) & 3];
    const schuh = ["#5a443b", "#3b3b46", "#7a5a3c", "#4a3f3a"][(o.rest >> 2) & 3];
    const [links, rechts] = beine(m, h, schuh, hs);
    const t = { haar, links, rechts, braue: H.K, unten: hosenboden(m, hs) };
    const leib = flaeche(rumpfPfad(m.ys, m.yh, m.ws, m.wh), c, kc);
    if (form === 0) {
      // Hemd mit Kragen und Knopfleiste
      t.oberteil = leib + ausschnitt(m, h, kc, 6) + kragen(m, ton(c, 0.12), kc) + knoepfe(0.6, m.ys + 9, 4, 6.4, ton(c, 0.5));
      t.aermel = [c, 0.92];
    } else if (form === 1) {
      // Pulli, darunter der weisse Hemdkragen
      t.oberteil = leib + pfad(s`M${-m.wh + 0.3} ${m.yh - 3}Q0 ${m.yh - 1.4} ${m.wh - 0.3} ${m.yh - 3}`, strich(kc, 1)) + ausschnitt(m, h, kc, 4.5) + kragen(m, "#f8f6f1", "#cfc9bf");
      t.aermel = [c, 0.92];
    } else {
      // T-Shirt
      t.oberteil = leib + ausschnitt(m, h, kc, 5);
      t.aermel = [c, 0.4];
    }
    if (zier) t.zier = zier;
    return zusammen(m, h, t);
  }

  // --- Grosseltern -----------------------------------------------------------
  function grossmutter(o) {
    const m = ALT, h = o.haut, c = ZIER_ALT[o.farbe], kc = ton(c, -0.3), c2 = ZIER_ALT[(o.farbe + 3) % 8];
    const H = GRAU[o.grau], k = m.k;
    const fr = o.frisur;
    let haar;
    if (fr === 0) haar = { hinten: bausch(k, H, -0.3, -1.12, 0.32, 7), vorne: kappe("glatt", k, H) + linien("M-0.1 -1.06Q-0.5 -0.9 -0.7 -0.6M0.3 -1.02Q0 -0.84 -0.36 -0.62", k, H), ohr: true };
    else if (fr === 1) haar = { vorne: lockenKappe(k, H, 1.1, 10), ohr: true };
    else if (fr === 2) {
      haar = {
        hinten: haarFl(amKopf("M0 -1.12C-0.82 -1.12 -1.22 -0.6 -1.2 0.06C-1.18 0.36 -1.14 0.52 -1.02 0.6Q-0.84 0.68 -0.74 0.52L0.74 0.48Q0.86 0.62 1.04 0.54C1.14 0.4 1.16 0.24 1.14 0C1.12 -0.62 0.76 -1.12 0 -1.12Z", k), H),
        vorne: haarFl(amKopf("M-1.08 0.5C-1.2 -0.4 -0.76 -1.15 0 -1.15C0.76 -1.15 1.18 -0.62 1.1 0.16C1 -0.08 0.88 -0.22 0.7 -0.3C0.36 -0.4 0 -0.52 -0.3 -0.76C-0.46 -0.5 -0.66 -0.34 -0.8 -0.16C-0.9 0.1 -0.92 0.3 -0.88 0.5Q-0.98 0.6 -1.08 0.5Z", k), H) +
          linien("M-0.3 -0.76Q-0.62 -0.4 -0.72 0.3M-0.12 -0.66Q0.3 -0.44 0.7 -0.3", k, H),
      };
    } else {
      // Zopf über die Schulter nach vorne
      let zopf = "";
      for (let i = 0; i < 6; i++) zopf += oval(-13 + i * 1.1, -84 + i * 4.8, 3.3 - i * 0.12, 3.3, fl(H.F, H.K), i % 2 ? -30 : 20);
      haar = { mitte: zopf + oval(-6.2, -55.8, 2.2, 1.6, fl(c2, ton(c2, -0.3), 1)) + pfad("M-6.6 -54.4L-7.4 -50.8M-5.6 -54.4L-5.2 -51", strich(H.K, 1.4)), vorne: kappe("glatt", k, H), ohr: true };
    }
    const form = o.rest % 3;
    const schuh = ["#5a443b", "#7a3d3d", "#3b3b46", "#6b5a4a"][(o.rest >> 2) & 3];
    const [links, rechts] = beine(m, h, schuh);
    const t = { haar, links, rechts, braue: H.K, falten: true };
    if (form === 0) {
      // Kleid mit Kragen
      t.unten = flaeche(rockPfad(m.yh - 6, m.wh - 1.6, m.knie, 17.5), c, kc);
      t.oberteil = flaeche(rumpfPfad(m.ys, m.yh - 5, m.ws, m.wh - 1), c, kc) + ausschnitt(m, h, kc, 5) + bubikragen(m) + knoepfe(0.6, m.ys + 8, 3, 5, ton(c, 0.5));
      t.aermel = [c, 0.6];
    } else if (form === 1) {
      // Kleid und Strickjacke
      t.unten = flaeche(rockPfad(m.yh - 6, m.wh - 1.6, m.knie, 17.5), c, kc);
      t.oberteil = flaeche(rumpfPfad(m.ys, m.yh + 3, m.ws, m.wh + 0.6), c2) + pfad(s`M-4 ${m.ys + 0.4}L6 ${m.ys + 0.4}L2.6 ${m.yh + 4.4}L-0.6 ${m.yh + 4.4}Z`, fl(c, kc)) +
        ausschnitt(m, h, kc, 5) + knoepfe(-1.6, m.ys + 13, 3, 6.5, ton(c2, -0.35));
      t.aermel = [c2, 0.94];
    } else {
      // Bluse und Rock
      t.unten = flaeche(rockPfad(m.yh - 4, m.wh - 1.2, m.knie, 17), c2) + pfad(s`M-4.6 ${m.yh}L-6.4 ${m.knie + 0.8}M5.6 ${m.yh}L7.4 ${m.knie + 0.8}`, strich(ton(c2, -0.3), 0.9));
      t.oberteil = flaeche(rumpfPfad(m.ys, m.yh, m.ws, m.wh - 0.4), c, kc) + ausschnitt(m, h, kc, 6) + bubikragen(m);
      t.aermel = [c, 0.6];
    }
    if (o.rest & 2) {
      // Handtasche am vorderen Arm
      const [, , hx, hy] = m.arm, tc = "#8a5a3c", tk = "#5e3c25";
      t.vorArm = pfad(s`M${-hx - 5} ${hy + 4}Q${-hx} ${hy - 6} ${-hx + 5} ${hy + 4}`, strich(tk, 1.6)) +
        flaeche(s`M${-hx - 7.4} ${hy + 3.6}H${-hx + 7}L${-hx + 6} ${hy + 14}Q${-hx} ${hy + 15.6} ${-hx - 6.4} ${hy + 14}Z`, tc, tk) + kreis(-hx - 0.2, hy + 7, 1, fl("#f0c24e", "#b98a1f", 0.6));
    }
    if (o.rest & 1) t.zier = (augen) => brille(k, augen);
    return zusammen(m, h, t);
  }

  function grossvater(o) {
    const m = { ...ALT, wh: 14.4 }, h = o.haut, c = ZIER_ALT[o.farbe], kc = ton(c, -0.3);
    const H = GRAU[o.grau], k = m.k;
    const fr = o.frisur;
    let haar;
    if (fr === 0) haar = { vorne: kranz(k, H), ohr: true };
    else if (fr === 1) haar = { vorne: kappe("scheitel", k, H), ohr: true };
    else if (fr === 2) {
      // Schiebermütze
      const mc = ["#7a6a5a", "#5f6b78", "#6f7a5a", "#8a6a4a"][o.rest & 3], mk = ton(mc, -0.3);
      haar = {
        vorne: kranz(k, H) + flaeche(amKopf("M-1.1 -0.26C-1.12 -0.84 -0.6 -1.16 0.04 -1.16C0.62 -1.16 1 -0.94 1.12 -0.62C1.3 -0.56 1.48 -0.48 1.54 -0.36C1.54 -0.26 1.4 -0.2 1.2 -0.24C0.6 -0.28 -0.3 -0.3 -1.1 -0.26Z", k), mc, mk) +
          pfad(amKopf("M-1.06 -0.4Q0 -0.5 1.04 -0.46", k), strich(mk, 0.9)),
        ohr: true,
      };
    } else {
      haar = { vorne: haarFl(amKopf("M-1.02 0.24C-1.16 -0.6 -0.66 -1.2 0.06 -1.2C0.74 -1.2 1.14 -0.7 1.02 -0.14C0.9 -0.4 0.68 -0.58 0.36 -0.62C0 -0.66 -0.4 -0.62 -0.62 -0.42C-0.78 -0.24 -0.82 0 -0.84 0.24Z", k), H) + linien("M0.36 -0.62Q0 -0.9 -0.5 -0.96M-0.1 -0.64Q-0.4 -0.8 -0.72 -0.7", k, H), ohr: true };
    }
    const bartArt = (o.rest >> 1) % 3;   // 0 keiner, 1 Schnauz, 2 Vollbart
    const form = o.rest % 3;
    const hs = ["#6b5a4a", "#5d6270", "#7a6a50", "#4a5060"][(o.rest >> 2) & 3];
    const [links, rechts] = beine(m, h, "#4a3a32", hs);
    const t = { haar, links, rechts, braue: H.K, falten: true, unten: hosenboden(m, hs) };
    const hemd = "#f4f1ea";
    if (form === 0) {
      // Hemd und Weste
      t.oberteil = flaeche(rumpfPfad(m.ys, m.yh, m.ws, m.wh), c, kc) + pfad(s`M-4.6 ${m.ys + 0.3}L6 ${m.ys + 0.3}L0.8 ${m.ys + 15}Z`, fl(hemd, "#cfc9bf", 1)) +
        ausschnitt(m, h, "#cfc9bf", 4) + kragen(m, hemd, "#cfc9bf") + knoepfe(0.8, m.ys + 19, 3, 6, ton(c, -0.35));
      t.aermel = [hemd, 0.92];
    } else if (form === 1) {
      // Strickjacke
      t.oberteil = flaeche(rumpfPfad(m.ys, m.yh + 1, m.ws, m.wh), c, kc) + pfad(s`M-4 ${m.ys + 0.4}L6 ${m.ys + 0.4}L2.2 ${m.yh + 2.4}L-0.2 ${m.yh + 2.4}Z`, fl(hemd, "#cfc9bf", 1)) +
        ausschnitt(m, h, "#cfc9bf", 4) + kragen(m, hemd, "#cfc9bf") + knoepfe(-1.4, m.ys + 13, 4, 6.5, ton(c, -0.35));
      t.aermel = [c, 0.94];
    } else {
      // Pulli
      t.oberteil = flaeche(rumpfPfad(m.ys, m.yh, m.ws, m.wh), c, kc) + pfad(s`M${-m.wh + 0.3} ${m.yh - 3}Q0 ${m.yh - 1.4} ${m.wh - 0.3} ${m.yh - 3}`, strich(kc, 1)) + ausschnitt(m, h, kc, 4.5) + kragen(m, hemd, "#cfc9bf");
      t.aermel = [c, 0.94];
    }
    if (o.rest & 8) {
      // Spazierstock in der vorderen Hand
      const [, , hx, hy] = m.arm;
      t.vorArm = glied(-hx - 1.4, hy, -hx - 3.4, -2.5, 2.4, "#9a6a42", "#6a4426") + pfad(s`M${-hx - 1.4} ${hy}C${-hx - 1.4} ${hy - 5} ${-hx + 4.4} ${hy - 5.4} ${-hx + 4.4} ${hy - 1}`, strich("#6a4426", 5)) +
        pfad(s`M${-hx - 1.4} ${hy}C${-hx - 1.4} ${hy - 5} ${-hx + 4.4} ${hy - 5.4} ${-hx + 4.4} ${hy - 1}`, strich("#9a6a42", 2.4));
    }
    const mitBrille = o.rest & 1;
    t.zier = (augen) => (bartArt ? bart(k, H, bartArt === 2) : "") + (mitBrille ? brille(k, augen) : "");
    return zusammen(m, h, t);
  }

  const ZEICHNER = {
    m_baby: baby,
    m_maedchen: (o) => kind(o, true),
    m_bub: (o) => kind(o, false),
    m_frau: frau,
    m_mann: mann,
    m_grossmutter: grossmutter,
    m_grossvater: grossvater,
  };

  // ---------------------------------------------------------------------------
  // Was die Ansicht braucht
  // ---------------------------------------------------------------------------
  // Ein Mensch als SVG-Text (ein <g>). art: eine der ARTEN (sonst die Frau);
  // variante: das Aussehen (beliebig gross, % 256).
  function tier(art, optionen) {
    const { gross = 1, variante = 0 } = optionen || {};
    const a = hat(ZEICHNER, art) ? art : "m_frau";
    const t = ZEICHNER[a](aussehen(variante, ARTEN.indexOf(a)));
    const k = Number(gross);
    const g = Number.isFinite(k) && k > 0 && k !== 1 ? ` transform="scale(${Math.round(k * 1000) / 1000})"` : "";
    return `<g${g} stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="0" cy="0" rx="${t.sch}" ry="3.6" fill="#000000" opacity=".13"/>` +
      `<g class="legL">${t.links}</g><g class="legR">${t.rechts}</g>` +
      `<g class="bob">${t.bob}<g class="bt-lid" opacity="0">${t.lid}</g></g></g>`;
  }

  // Der Kasten um die Zeichnung (gross = 1, ohne Schatten am Boden), für
  // jedes Aussehen der Art: gemessen mit getBBox über alle 256 Varianten
  // (bei Linien ohne Fläche – Arme, Stock – mit der halben Strichbreite),
  // mit 1 Einheit Rand für die Kontur, nach aussen gerundet.
  const BOX = {
    m_baby: { x0: -16, y0: -64, x1: 18, y1: 1 },
    m_maedchen: { x0: -31, y0: -105, x1: 32, y1: 1 },
    m_bub: { x0: -23, y0: -103, x1: 30, y1: 1 },
    m_frau: { x0: -25, y0: -131, x1: 27, y1: 1 },
    m_mann: { x0: -23, y0: -125, x1: 23, y1: 1 },
    m_grossmutter: { x0: -25, y0: -125, x1: 23, y1: 1 },
    m_grossvater: { x0: -24, y0: -120, x1: 30, y1: 1 },
  };
  function box(art) {
    const b = BOX[hat(BOX, art) ? art : "m_frau"];
    return { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 };
  }

  window.LernappBauMenschen = { ARTEN, VARIANTEN, tier, box };
})();
