/*
 * lesen-art.js – Die Zeichnungen der Leseecke.
 *
 * Alles als SVG, im Stil des Zugs (train-art.js): flache Farben, runde Ecken,
 * kein Text, den ein Kind lesen müsste – ausser den Buchstaben, um die es geht.
 *
 *   buildLesewagen()        der alte Wagen auf dem Abstellgleis, für das
 *                           Startbild
 *   buildLesezimmer(stand)  der Wagen von innen: Sessel, Regal, Buchstabenhaus,
 *                           Trommel, Wortkiste, Spielzeugzug
 *   buildLesewurm(glieder)  der Lesewurm – je gelesene Wörter ein Glied mehr
 *   buildTrommel(), buildLautWagen(text), buildDing(id)  Teile der Spiele
 *
 * Zeichnet nur; was ein Tipp tut, entscheiden train-leseecke.js und die Spiele.
 */
(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  function el(name, attrs = {}, children = []) {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === null || value === undefined) continue;
      node.setAttribute(key, String(value));
    }
    children.filter(Boolean).forEach((child) => node.append(child));
    return node;
  }
  const group = (attrs, children) => el("g", attrs, children);

  function shade(hex, amount) {
    const clean = String(hex).replace("#", "");
    const full = clean.length === 3 ? [...clean].map((c) => c + c).join("") : clean;
    const rgb = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    const target = amount < 0 ? 0 : 255;
    const mix = Math.abs(amount);
    return `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v + (target - v) * mix))).toString(16).padStart(2, "0")).join("")}`;
  }

  // Die Farben der Leseecke: warmes Holz, ein rotes Sofa, grüner Wurm.
  const FARBE = {
    holz: "#c8935a",
    holzDunkel: "#8a5a35",
    wand: "#f4e4c9",
    boden: "#b07a4a",
    sessel: "#d9534f",
    wurm: "#7ac74f",
    wurmDunkel: "#4f9a35",
    licht: "#ffd98a",
    tinte: "#3a4250",
    wagen: "#c4553a",
    dach: "#5b3a29",
  };
  const BUCHFARBEN = ["#e8543f", "#3fa34d", "#00a5b5", "#f5a623", "#7c5ce6", "#ef6fa8", "#2f6f8f"];

  // ---------------------------------------------------------------------------
  // Der Lesewurm
  // ---------------------------------------------------------------------------
  // Glieder auf einer flachen Spirale: der Schwanz in der Mitte, der Kopf am
  // äusseren Ende. Mit wenigen Gliedern ist das ein kleiner Bogen, mit vielen
  // ein dicker Wickel – er wächst, ohne je aus seinem Platz zu fallen.
  // Gedreht wird so, dass das letzte Glied oben liegt: Dort sitzt der Kopf, und
  // der Hals führt nicht quer über den Wickel.
  function spirale(anzahl, abstand) {
    const roh = [];
    const b = (abstand * 1.25) / (2 * Math.PI);
    let theta = 1.2;
    for (let i = 0; i < anzahl; i += 1) {
      const r = b * theta;
      roh.push({ r, theta });
      theta += abstand / Math.sqrt(r * r + b * b);
    }
    const drehung = -Math.PI / 2 - roh[roh.length - 1].theta + 0.5;
    return roh.map(({ r, theta: t }) => ({ x: r * Math.cos(t + drehung), y: r * Math.sin(t + drehung) * 0.5 }));
  }

  //   glieder  wie lang er ist (1 = nur der Kopf und ein Glied)
  //   r        Grösse eines Gliedes
  //   buch     hält ein offenes Buch
  function buildLesewurm(glieder = 1, { r = 20, buch = true, winkt = false } = {}) {
    const anzahl = Math.max(1, Math.round(glieder));
    const punkte = spirale(anzahl, r * 1.45);
    const letzter = punkte[punkte.length - 1];
    // Der Kopf sitzt über dem letzten Glied, ein wenig nach oben gereckt.
    const kopf = { x: letzter.x + r * 0.5, y: letzter.y - r * 1.55 };
    const teile = [];
    teile.push(el("ellipse", { cx: 0, cy: r * 0.9, rx: Math.max(r * 1.6, Math.abs(letzter.x) + r * 1.4), ry: r * 0.5, fill: "#000", opacity: "0.12" }));
    punkte.forEach((p, i) => {
      const hell = i % 2 === 0;
      teile.push(el("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: (r * (0.86 + 0.14 * (i / Math.max(1, anzahl - 1)))).toFixed(1), fill: hell ? FARBE.wurm : shade(FARBE.wurm, -0.1), stroke: FARBE.wurmDunkel, "stroke-width": r * 0.08 }));
    });
    // Hals: vom letzten Glied zum Kopf.
    teile.push(el("path", { d: `M${letzter.x} ${letzter.y} Q${letzter.x + r * 0.9} ${letzter.y - r * 0.6} ${kopf.x} ${kopf.y}`, stroke: FARBE.wurm, "stroke-width": r * 1.5, "stroke-linecap": "round", fill: "none" }));
    const k = r * 1.3;
    const gesicht = [
      el("circle", { cx: 0, cy: 0, r: k, fill: FARBE.wurm, stroke: FARBE.wurmDunkel, "stroke-width": r * 0.08 }),
      // Bäckchen
      el("circle", { cx: -k * 0.55, cy: k * 0.35, r: k * 0.2, fill: "#ff9b8f", opacity: "0.6" }),
      el("circle", { cx: k * 0.55, cy: k * 0.35, r: k * 0.2, fill: "#ff9b8f", opacity: "0.6" }),
      // Augen hinter der Brille
      el("circle", { cx: -k * 0.36, cy: -k * 0.12, r: k * 0.27, fill: "#ffffff" }),
      el("circle", { cx: k * 0.36, cy: -k * 0.12, r: k * 0.27, fill: "#ffffff" }),
      el("circle", { cx: -k * 0.32, cy: -k * 0.08, r: k * 0.13, fill: FARBE.tinte, class: "wurm-auge" }),
      el("circle", { cx: k * 0.4, cy: -k * 0.08, r: k * 0.13, fill: FARBE.tinte, class: "wurm-auge" }),
      // Die runde Lesebrille
      el("circle", { cx: -k * 0.36, cy: -k * 0.12, r: k * 0.34, fill: "none", stroke: FARBE.tinte, "stroke-width": k * 0.08 }),
      el("circle", { cx: k * 0.36, cy: -k * 0.12, r: k * 0.34, fill: "none", stroke: FARBE.tinte, "stroke-width": k * 0.08 }),
      el("path", { d: `M${-k * 0.03} ${-k * 0.15} q${k * 0.03} ${-k * 0.06} ${k * 0.06} 0`, stroke: FARBE.tinte, "stroke-width": k * 0.07, fill: "none" }),
      // Lächeln
      el("path", { d: `M${-k * 0.3} ${k * 0.38} q${k * 0.3} ${k * 0.28} ${k * 0.6} 0`, stroke: shade(FARBE.wurmDunkel, -0.3), "stroke-width": k * 0.09, fill: "none", "stroke-linecap": "round" }),
      // Ein Schopf obendrauf
      el("path", { d: `M${-k * 0.1} ${-k * 0.95} q${-k * 0.15} ${-k * 0.45} ${k * 0.2} ${-k * 0.55} M${k * 0.12} ${-k * 0.95} q${k * 0.05} ${-k * 0.38} ${k * 0.42} ${-k * 0.36}`, stroke: FARBE.wurmDunkel, "stroke-width": k * 0.1, fill: "none", "stroke-linecap": "round" }),
    ];
    if (buch) {
      // Ein offenes Buch vor der Brust
      gesicht.push(group({ transform: `translate(${-k * 0.1} ${k * 1.05}) rotate(-6)` }, [
        el("path", { d: `M0 0 L${-k * 0.95} ${-k * 0.2} L${-k * 0.95} ${k * 0.55} L0 ${k * 0.72} Z`, fill: "#ffffff", stroke: "#2f6f8f", "stroke-width": k * 0.07, "stroke-linejoin": "round" }),
        el("path", { d: `M0 0 L${k * 0.95} ${-k * 0.2} L${k * 0.95} ${k * 0.55} L0 ${k * 0.72} Z`, fill: "#ffffff", stroke: "#2f6f8f", "stroke-width": k * 0.07, "stroke-linejoin": "round" }),
        el("path", { d: `M${-k * 0.75} ${k * 0.05} L${-k * 0.2} ${k * 0.15} M${-k * 0.75} ${k * 0.25} L${-k * 0.2} ${k * 0.35} M${k * 0.2} ${k * 0.15} L${k * 0.75} ${k * 0.05} M${k * 0.2} ${k * 0.35} L${k * 0.75} ${k * 0.25}`, stroke: "#9aa7b8", "stroke-width": k * 0.05 }),
      ]));
    }
    if (winkt) {
      gesicht.push(el("path", { class: "wurm-winken", d: `M${k * 0.9} ${k * 0.2} q${k * 0.6} ${-k * 0.2} ${k * 0.8} ${-k * 0.9}`, stroke: FARBE.wurm, "stroke-width": k * 0.3, fill: "none", "stroke-linecap": "round" }));
    }
    // Zwei Gruppen: die äussere trägt die Lage, die innere darf sich bewegen
    // (Nicken im Stylesheet), ohne die Lage zu überschreiben.
    teile.push(group({ class: "wurm-kopf", transform: `translate(${kopf.x.toFixed(1)} ${kopf.y.toFixed(1)})` }, [group({ class: "wurm-gesicht" }, gesicht)]));
    return group({ class: "lesewurm", "data-glieder": anzahl }, teile);
  }

  // ---------------------------------------------------------------------------
  // Der Lesewagen auf dem Abstellgleis – für das Startbild
  // ---------------------------------------------------------------------------
  // Ein alter Holzwagen mit warmem Licht in den Fenstern, im mittleren schaut
  // der Lesewurm heraus. Vorne ein Prellbock: Hier fährt nichts mehr weg, hier
  // wird gelesen. Ausschnitt 0 0 220 150, das Gleis liegt bei y = 132.
  const WAGEN_W = 220;
  const WAGEN_H = 150;
  function buildLesewagen({ glieder = 1 } = {}) {
    const schiene = [];
    for (let x = 6; x < 214; x += 16) schiene.push(el("rect", { x, y: 130, width: 9, height: 10, rx: 2, fill: "#8d6e52" }));
    const rad = (cx) => group({ transform: `translate(${cx} 124)` }, [
      el("circle", { cx: 0, cy: 0, r: 9.5, fill: "#3a3f4a" }),
      el("circle", { cx: 0, cy: 0, r: 4, fill: "#9aa3b2" }),
    ]);
    const fenster = (x) => el("rect", { x, y: 62, width: 30, height: 26, rx: 5, fill: FARBE.licht, stroke: shade(FARBE.wagen, -0.35), "stroke-width": 3 });
    return el("svg", { viewBox: `0 0 ${WAGEN_W} ${WAGEN_H}`, class: "lesewagen-svg", "aria-hidden": "true" }, [
      // Gleis und Prellbock
      ...schiene,
      el("rect", { x: 0, y: 128, width: 220, height: 3.5, rx: 1.5, fill: "#6d7480" }),
      el("rect", { x: 0, y: 135, width: 220, height: 3.5, rx: 1.5, fill: "#6d7480" }),
      group({ class: "lesewagen-prellbock" }, [
        el("rect", { x: 6, y: 96, width: 10, height: 34, rx: 2, fill: "#5b3a29" }),
        el("rect", { x: 2, y: 92, width: 22, height: 12, rx: 3, fill: "#e8543f" }),
        el("rect", { x: 6, y: 95, width: 14, height: 6, rx: 2, fill: "#ffffff" }),
      ]),
      // Der Wagen
      el("rect", { x: 36, y: 110, width: 168, height: 10, rx: 3, fill: "#3a3f4a" }),
      rad(62), rad(178),
      el("rect", { x: 40, y: 44, width: 160, height: 70, rx: 8, fill: FARBE.wagen }),
      ...[56, 80, 104, 128, 152, 176].map((x) => el("rect", { x, y: 46, width: 2, height: 66, fill: shade(FARBE.wagen, -0.18), opacity: "0.7" })),
      el("path", { d: "M32 48 Q120 18 208 48 L208 54 Q120 26 32 54 Z", fill: FARBE.dach }),
      // Ofenrohr mit Rauch: drinnen ist es warm
      el("rect", { x: 166, y: 24, width: 9, height: 20, rx: 2, fill: "#4a5568" }),
      el("circle", { class: "lesewagen-rauch", cx: 171, cy: 18, r: 6, fill: "#e8edf3", opacity: "0.85" }),
      el("circle", { class: "lesewagen-rauch lesewagen-rauch-2", cx: 178, cy: 9, r: 4.5, fill: "#e8edf3", opacity: "0.6" }),
      fenster(52), fenster(105), fenster(158),
      // Der Wurm schaut aus dem mittleren Fenster
      group({ transform: "translate(120 82) scale(0.62)" }, [buildLesewurm(1, { r: 14, buch: false })]),
      el("rect", { x: 103, y: 87, width: 34, height: 4, rx: 2, fill: shade(FARBE.wagen, -0.35) }),
      // Das Schild: ein offenes Buch
      group({ transform: "translate(120 101)" }, [
        el("rect", { x: -17, y: -7, width: 34, height: 14, rx: 4, fill: "#fff6e0", stroke: FARBE.dach, "stroke-width": 2 }),
        el("path", { d: "M0 -3 L-9 -5 L-9 4 L0 6 Z M0 -3 L9 -5 L9 4 L0 6 Z", fill: "#2f6f8f" }),
      ]),
      // Blumen am Gleis
      el("circle", { cx: 26, cy: 126, r: 3.5, fill: "#ef6fa8" }),
      el("circle", { cx: 212, cy: 125, r: 3, fill: "#f5a623" }),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Das Zimmer im Wagen
  // ---------------------------------------------------------------------------
  // Ausschnitt 1200 × 675. Jedes Ding, das etwas tut, ist ein eigenes <g> mit
  // data-ort – dort hängt train-leseecke.js den Tipp an.
  const ZIMMER_W = 1200;
  const ZIMMER_H = 675;

  // Drei Bretter, nicht höher: Oben rechts liegen auf jedem Bildschirm die
  // Knöpfe für Ton und Konto, und das Regal soll nicht darunter reichen.
  function buecherregal(gelesen = 0) {
    const teile = [
      el("rect", { x: 0, y: 0, width: 230, height: 322, rx: 10, fill: FARBE.holzDunkel }),
      el("rect", { x: 14, y: 14, width: 202, height: 294, rx: 6, fill: shade(FARBE.holzDunkel, -0.25) }),
    ];
    // Drei Bretter voller Bücher. Gelesene stehen ganz vorne und leuchten.
    for (let brett = 0; brett < 3; brett += 1) {
      const y = 22 + brett * 98;
      let x = 22;
      let nr = 0;
      while (x < 200) {
        const b = 16 + ((brett * 7 + nr * 5) % 4) * 4;
        const h = 62 + ((brett * 3 + nr * 11) % 3) * 8;
        const farbe = BUCHFARBEN[(brett * 3 + nr) % BUCHFARBEN.length];
        const nummer = brett * 8 + nr;
        const leuchtet = nummer < gelesen;
        if (x + b > 208) break;
        teile.push(el("rect", { x, y: y + 84 - h, width: b, height: h, rx: 3, fill: farbe, class: leuchtet ? "regal-buch is-gelesen" : "regal-buch" }));
        teile.push(el("rect", { x: x + b * 0.25, y: y + 84 - h + 10, width: b * 0.5, height: 4, rx: 2, fill: "#ffffff", opacity: "0.55" }));
        x += b + 3;
        nr += 1;
      }
      teile.push(el("rect", { x: 14, y: y + 84, width: 202, height: 12, fill: FARBE.holz }));
    }
    return teile;
  }

  function buchstabenhausWand() {
    const fenster = [["A", "B", "C"], ["M", "O", "S"]];
    const teile = [
      el("path", { d: "M0 90 L120 0 L240 90 Z", fill: "#e8543f", stroke: shade("#e8543f", -0.3), "stroke-width": 5, "stroke-linejoin": "round" }),
      el("rect", { x: 16, y: 88, width: 208, height: 170, rx: 8, fill: "#fff6e0", stroke: shade("#c8935a", -0.25), "stroke-width": 5 }),
      el("rect", { x: 100, y: 196, width: 40, height: 62, rx: 6, fill: "#2f6f8f" }),
      el("circle", { cx: 120, cy: 50, r: 18, fill: "#ffd98a", stroke: shade("#e8543f", -0.3), "stroke-width": 4 }),
    ];
    fenster.forEach((reihe, r) => reihe.forEach((buchstabe, s) => {
      const x = 32 + s * 64 + (r === 1 && s === 1 ? 0 : 0);
      const y = 102 + r * 50;
      if (r === 1 && s === 1) return; // dort ist die Tür
      teile.push(el("rect", { x, y, width: 48, height: 40, rx: 6, fill: "#a8ddf0", stroke: "#2f6f8f", "stroke-width": 3 }));
      teile.push(el("text", { x: x + 24, y: y + 30, "text-anchor": "middle", "font-size": 28, "font-weight": 700, "font-family": "Andika, Inter, system-ui, sans-serif", fill: FARBE.tinte }, []));
      teile[teile.length - 1].textContent = buchstabe;
    }));
    return teile;
  }

  function trommel() {
    return [
      el("ellipse", { cx: 0, cy: 70, rx: 78, ry: 14, fill: "#000", opacity: "0.15" }),
      el("rect", { x: -70, y: 0, width: 140, height: 70, fill: "#e8543f" }),
      ...[-50, -15, 20, 55].map((x, i) => el("path", { d: `M${x} 6 L${x + 18} 64 M${x + 18} 6 L${x} 64`, stroke: "#ffd98a", "stroke-width": 4, opacity: i % 2 ? "0.9" : "0.7" })),
      el("ellipse", { cx: 0, cy: 70, rx: 70, ry: 14, fill: shade("#e8543f", -0.25) }),
      el("ellipse", { cx: 0, cy: 0, rx: 70, ry: 16, fill: "#fff6e0", stroke: "#c8935a", "stroke-width": 5 }),
      el("rect", { x: 10, y: -46, width: 8, height: 50, rx: 4, fill: FARBE.holzDunkel, transform: "rotate(30 14 -20)" }),
      el("circle", { cx: 2, cy: -46, r: 10, fill: "#ffffff", stroke: FARBE.holzDunkel, "stroke-width": 3 }),
    ];
  }

  function wortkiste() {
    const klotz = (x, y, buchstabe, farbe, drehung) => group({ transform: `translate(${x} ${y}) rotate(${drehung})` }, [
      el("rect", { x: -24, y: -24, width: 48, height: 48, rx: 7, fill: farbe, stroke: shade(farbe, -0.3), "stroke-width": 3 }),
      Object.assign(el("text", { x: 0, y: 12, "text-anchor": "middle", "font-size": 32, "font-weight": 700, "font-family": "Andika, Inter, system-ui, sans-serif", fill: "#ffffff" }), { textContent: buchstabe }),
    ]);
    return [
      el("ellipse", { cx: 0, cy: 96, rx: 112, ry: 12, fill: "#000", opacity: "0.15" }),
      klotz(-46, -8, "W", "#3fa34d", -12),
      klotz(4, -20, "O", "#f5a623", 6),
      klotz(52, -6, "R", "#7c5ce6", 14),
      el("rect", { x: -100, y: 10, width: 200, height: 86, rx: 10, fill: "#4a90d9", stroke: shade("#4a90d9", -0.3), "stroke-width": 4 }),
      el("rect", { x: -100, y: 10, width: 200, height: 16, rx: 6, fill: shade("#4a90d9", -0.15) }),
      el("circle", { cx: -60, cy: 58, r: 9, fill: "#ffd166" }),
      el("circle", { cx: 0, cy: 58, r: 9, fill: "#ef6fa8" }),
      el("circle", { cx: 60, cy: 58, r: 9, fill: "#a8ddf0" }),
    ];
  }

  // Ein Spielzeugzug mit drei Wagen, auf denen Wörter stehen könnten.
  function spielzeugzug() {
    const wagen = (x, farbe) => group({}, [
      el("rect", { x, y: 18, width: 70, height: 36, rx: 6, fill: farbe }),
      el("rect", { x: x + 8, y: 26, width: 54, height: 10, rx: 4, fill: "#ffffff", opacity: "0.85" }),
      el("circle", { cx: x + 16, cy: 58, r: 9, fill: "#3a3f4a" }),
      el("circle", { cx: x + 54, cy: 58, r: 9, fill: "#3a3f4a" }),
    ]);
    return [
      el("rect", { x: -200, y: 66, width: 420, height: 6, rx: 3, fill: "#8d6e52" }),
      wagen(-196, "#f5a623"), wagen(-118, "#3fa34d"), wagen(-40, "#00a5b5"),
      // Die kleine Lok vorne rechts
      el("rect", { x: 40, y: 14, width: 90, height: 40, rx: 8, fill: "#e8543f" }),
      el("rect", { x: 104, y: -10, width: 30, height: 40, rx: 6, fill: "#2f6f8f" }),
      el("rect", { x: 110, y: -2, width: 16, height: 14, rx: 3, fill: FARBE.licht }),
      el("rect", { x: 56, y: -6, width: 14, height: 22, rx: 3, fill: "#3a3f4a" }),
      el("circle", { cx: 60, cy: 58, r: 11, fill: "#3a3f4a" }),
      el("circle", { cx: 108, cy: 58, r: 11, fill: "#3a3f4a" }),
      el("circle", { cx: 138, cy: 34, r: 7, fill: FARBE.licht }),
    ];
  }

  function sessel() {
    return [
      el("ellipse", { cx: 0, cy: 150, rx: 190, ry: 20, fill: "#000", opacity: "0.15" }),
      el("rect", { x: -150, y: -60, width: 300, height: 150, rx: 50, fill: shade(FARBE.sessel, -0.12) }),
      el("rect", { x: -175, y: 10, width: 70, height: 130, rx: 30, fill: FARBE.sessel }),
      el("rect", { x: 105, y: 10, width: 70, height: 130, rx: 30, fill: FARBE.sessel }),
      el("rect", { x: -120, y: 60, width: 240, height: 80, rx: 24, fill: shade(FARBE.sessel, 0.12) }),
      el("rect", { x: -150, y: 132, width: 18, height: 26, rx: 4, fill: FARBE.holzDunkel }),
      el("rect", { x: 132, y: 132, width: 18, height: 26, rx: 4, fill: FARBE.holzDunkel }),
    ];
  }

  // Die Lampe von der Decke – ihr Licht fällt auf den Sessel.
  function lampe() {
    return [
      el("path", { d: "M0 0 L0 70", stroke: FARBE.tinte, "stroke-width": 4 }),
      el("path", { d: "M-46 112 L-28 70 L28 70 L46 112 Z", fill: "#f5a623" }),
      el("ellipse", { cx: 0, cy: 112, rx: 46, ry: 8, fill: shade("#f5a623", -0.2) }),
      el("circle", { cx: 0, cy: 118, r: 10, fill: FARBE.licht }),
    ];
  }

  // Das Namensschild des Lesewurms: ein Brett auf einem Pfosten links vom
  // Sessel. Ohne Namen steht ein Fragezeichen darauf – ein Tipp, und das
  // Kind tauft ihn (meinname.html?wurm=1). Lange Namen werden schmaler
  // geschrieben, das Brett bleibt gleich breit.
  function namensschild(name = "") {
    const text = String(name || "") || "?";
    const breite = 150;
    const schrift = el("text", {
      x: 0, y: -6, "text-anchor": "middle", "font-size": 32, "font-weight": 700,
      "font-family": "Andika, Inter, system-ui, sans-serif", fill: FARBE.tinte, class: "lese-wurmname",
      ...(text.length > 6 ? { textLength: breite - 34, lengthAdjust: "spacingAndGlyphs" } : {}),
    });
    schrift.textContent = text;
    return [
      el("ellipse", { cx: 0, cy: 120, rx: 34, ry: 8, fill: "#000", opacity: "0.15" }),
      el("rect", { x: -7, y: 12, width: 14, height: 110, rx: 4, fill: FARBE.holzDunkel }),
      el("rect", { x: -breite / 2, y: -48, width: breite, height: 62, rx: 12, fill: shade(FARBE.holz, 0.08), stroke: FARBE.holzDunkel, "stroke-width": 5 }),
      el("circle", { cx: -breite / 2 + 13, cy: -35, r: 3.5, fill: FARBE.holzDunkel }),
      el("circle", { cx: breite / 2 - 13, cy: -35, r: 3.5, fill: FARBE.holzDunkel }),
      schrift,
    ];
  }

  //   stand     aus lesen-stand.js: glieder (Lesewurm), gelesen (Bücher),
  //             wurmName (wie das Kind ihn getauft hat)
  function buildLesezimmer({ glieder = 1, gelesen = 0, wurmName = "" } = {}) {
    const svg = el("svg", { viewBox: `0 0 ${ZIMMER_W} ${ZIMMER_H}`, class: "lesezimmer-svg", role: "img", "aria-label": "Im Lesewagen" });
    const defs = el("defs", {}, [
      el("radialGradient", { id: "lese-licht", cx: "50%", cy: "30%", r: "60%" }, [
        el("stop", { offset: "0", "stop-color": "#fff3c4", "stop-opacity": "0.85" }),
        el("stop", { offset: "1", "stop-color": "#fff3c4", "stop-opacity": "0" }),
      ]),
    ]);
    svg.append(defs);
    // Wand, Holzleisten, Boden
    svg.append(el("rect", { x: -400, y: -200, width: 2000, height: 1100, fill: FARBE.wand }));
    for (let x = -400; x < 1600; x += 60) svg.append(el("rect", { x, y: 70, width: 2, height: 470, fill: shade(FARBE.wand, -0.08) }));
    svg.append(el("path", { d: "M-400 -200 L1600 -200 L1600 60 Q600 -40 -400 60 Z", fill: FARBE.dach }));
    svg.append(el("rect", { x: -400, y: 520, width: 2000, height: 400, fill: FARBE.boden }));
    for (let x = -400; x < 1600; x += 90) svg.append(el("rect", { x, y: 520, width: 3, height: 400, fill: shade(FARBE.boden, -0.15) }));
    svg.append(el("rect", { x: -400, y: 512, width: 2000, height: 14, fill: FARBE.holzDunkel }));
    // Fenster mit Himmel und Hügeln
    [[300, 120], [690, 120]].forEach(([x, y]) => {
      svg.append(group({ class: "lesezimmer-fenster" }, [
        el("rect", { x, y, width: 200, height: 150, rx: 18, fill: "#a8ddf0", stroke: FARBE.holzDunkel, "stroke-width": 10 }),
        el("path", { d: `M${x + 6} ${y + 120} Q${x + 60} ${y + 80} ${x + 110} ${y + 112} T${x + 194} ${y + 100} L${x + 194} ${y + 144} L${x + 6} ${y + 144} Z`, fill: "#8fcf7a" }),
        el("circle", { cx: x + 150, cy: y + 42, r: 16, fill: "#ffd166" }),
        el("rect", { x: x + 96, y, width: 8, height: 150, fill: FARBE.holzDunkel }),
      ]));
    });
    svg.append(el("ellipse", { cx: 600, cy: 360, rx: 520, ry: 330, fill: "url(#lese-licht)" }));
    // Teppich
    svg.append(el("ellipse", { cx: 560, cy: 600, rx: 360, ry: 50, fill: "#7c5ce6", opacity: "0.55" }));
    svg.append(el("ellipse", { cx: 560, cy: 600, rx: 300, ry: 36, fill: "none", stroke: "#ffd166", "stroke-width": 6, opacity: "0.7", "stroke-dasharray": "18 14" }));

    const ort = (id, label, transform, kinder) => group({ class: `lese-ort lese-ort-${id}`, "data-ort": id, transform, role: "button", tabindex: "0", "aria-label": label }, kinder);

    svg.append(group({ transform: "translate(600 0)" }, lampe()));
    svg.append(ort("buchstaben", "Das Buchstabenhaus", "translate(48 150)", buchstabenhausWand()));
    svg.append(ort("buecher", "Das Bücherregal", "translate(940 172)", buecherregal(gelesen)));
    svg.append(ort("weiter", "Der Lesewurm im Sessel: Er sucht dir etwas aus", "translate(590 400)", [
      ...sessel(),
      group({ transform: "translate(-10 70)" }, [buildLesewurm(glieder, { r: 24, buch: true })]),
    ]));
    svg.append(ort("wurmname", wurmName ? `Das Schild: Der Lesewurm heisst ${wurmName}` : "Das Schild: Hier bekommt der Lesewurm seinen Namen", "translate(322 470)", namensschild(wurmName)));
    svg.append(ort("silben", "Die Silbentrommel", "translate(150 540)", trommel()));
    svg.append(ort("woerter", "Die Wortkiste", "translate(1010 560)", wortkiste()));
    svg.append(ort("saetze", "Der Satzzug", "translate(560 590) scale(0.8)", spielzeugzug()));
    return svg;
  }

  // ---------------------------------------------------------------------------
  // Teile der Spiele
  // ---------------------------------------------------------------------------
  // Die Silbentrommel, gross, zum Draufhauen. Ausschnitt -90 -60 180 150.
  function buildTrommel() {
    return el("svg", { viewBox: "-90 -60 180 150", class: "lese-trommel-svg", "aria-hidden": "true" }, trommel());
  }

  // Ein Wagen mit einem Laut oder einer Silbe darauf. Ausschnitt 0 0 w 100,
  // das Gleis auf y = 92.
  //   farbe   Wagenfarbe; die Silbenfarben wechseln sich ab
  function buildLautWagen(text, { farbe = "#00a5b5", breite = 0, klein = false } = {}) {
    const zeichen = String(text || "");
    const w = breite || Math.max(84, 46 + zeichen.length * 30);
    const teile = [
      el("rect", { x: 4, y: 64, width: w - 8, height: 12, rx: 3, fill: shade(farbe, -0.35) }),
      el("circle", { cx: 22, cy: 82, r: 10, fill: "#3a3f4a" }), el("circle", { cx: 22, cy: 82, r: 4, fill: "#9aa3b2" }),
      el("circle", { cx: w - 22, cy: 82, r: 10, fill: "#3a3f4a" }), el("circle", { cx: w - 22, cy: 82, r: 4, fill: "#9aa3b2" }),
      el("rect", { x: 8, y: 6, width: w - 16, height: 62, rx: 10, fill: farbe }),
      el("rect", { x: 16, y: 12, width: w - 32, height: 50, rx: 8, fill: "#ffffff" }),
      // Kupplungen links und rechts
      el("rect", { x: 0, y: 66, width: 8, height: 6, rx: 2, fill: "#3a3f4a", class: "kupplung kupplung-links" }),
      el("rect", { x: w - 8, y: 66, width: 8, height: 6, rx: 2, fill: "#3a3f4a", class: "kupplung kupplung-rechts" }),
    ];
    const schrift = el("text", { x: w / 2, y: 50, "text-anchor": "middle", "font-size": klein ? 30 : 40, "font-weight": 700, "font-family": "Andika, Inter, system-ui, sans-serif", fill: FARBE.tinte, class: "lautwagen-text" });
    schrift.textContent = zeichen;
    teile.push(schrift);
    return el("svg", { viewBox: `0 0 ${w} 96`, class: "lautwagen-svg", width: w, height: 96, "aria-hidden": "true" }, teile);
  }

  // Die Dinge für «Stimmt das?». Jedes steht auf y = 0 (Boden) und kennt die
  // Stellen, an denen ein Tier auf, unter oder neben ihm steht.
  //   oben   wo die Füsse eines Tieres stehen, das darauf steht
  //   unten  wo es darunter steht
  //   rechts wie weit daneben
  const DINGE = {
    tisch: {
      teile: () => [
        el("rect", { x: -110, y: -96, width: 220, height: 18, rx: 6, fill: FARBE.holz }),
        el("rect", { x: -98, y: -80, width: 14, height: 80, rx: 4, fill: FARBE.holzDunkel }),
        el("rect", { x: 84, y: -80, width: 14, height: 80, rx: 4, fill: FARBE.holzDunkel }),
      ],
      oben: -96, unten: 0, rechts: 175,
    },
    stuhl: {
      teile: () => [
        el("rect", { x: -40, y: -150, width: 12, height: 150, rx: 4, fill: FARBE.holzDunkel }),
        el("rect", { x: 28, y: -66, width: 12, height: 66, rx: 4, fill: FARBE.holzDunkel }),
        el("rect", { x: -44, y: -74, width: 90, height: 14, rx: 5, fill: FARBE.holz }),
        el("rect", { x: -40, y: -150, width: 12, height: 80, rx: 4, fill: FARBE.holz }),
        el("rect", { x: -40, y: -150, width: 40, height: 12, rx: 4, fill: FARBE.holz }),
      ],
      oben: -74, unten: 0, rechts: 110,
    },
    bett: {
      teile: () => [
        el("rect", { x: -150, y: -110, width: 22, height: 110, rx: 6, fill: FARBE.holzDunkel }),
        el("rect", { x: 128, y: -70, width: 22, height: 70, rx: 6, fill: FARBE.holzDunkel }),
        el("rect", { x: -140, y: -62, width: 280, height: 34, rx: 10, fill: "#a8ddf0" }),
        el("rect", { x: -128, y: -82, width: 70, height: 26, rx: 12, fill: "#ffffff" }),
        el("rect", { x: -60, y: -66, width: 190, height: 18, rx: 8, fill: "#ef6fa8" }),
      ],
      oben: -62, unten: 0, rechts: 200,
    },
    kiste: {
      teile: () => [
        el("rect", { x: -70, y: -100, width: 140, height: 100, rx: 8, fill: "#d8a25e", stroke: shade("#d8a25e", -0.3), "stroke-width": 4 }),
        el("path", { d: "M-70 -100 L70 0 M70 -100 L-70 0", stroke: shade("#d8a25e", -0.25), "stroke-width": 4 }),
      ],
      oben: -100, unten: 0, rechts: 140,
    },
    baum: {
      teile: () => [
        el("rect", { x: -16, y: -150, width: 32, height: 150, rx: 8, fill: "#8a5a35" }),
        el("circle", { cx: -60, cy: -190, r: 70, fill: "#3fa34d" }),
        el("circle", { cx: 60, cy: -190, r: 70, fill: "#3fa34d" }),
        el("circle", { cx: 0, cy: -250, r: 80, fill: "#4fb85d" }),
        el("rect", { x: -100, y: -210, width: 200, height: 14, rx: 6, fill: "#7a4f2e" }),
      ],
      // Auf dem Baum: auf dem dicken Ast. Unter dem Baum: im Schatten der Krone.
      oben: -210, unten: 0, rechts: 190,
    },
    haus: {
      teile: () => [
        el("rect", { x: -100, y: -150, width: 200, height: 150, rx: 6, fill: "#f4e4c9", stroke: "#c8935a", "stroke-width": 4 }),
        el("path", { d: "M-120 -146 L0 -230 L120 -146 Z", fill: "#e8543f" }),
        el("rect", { x: -20, y: -70, width: 40, height: 70, rx: 5, fill: "#2f6f8f" }),
        el("rect", { x: -78, y: -120, width: 40, height: 34, rx: 4, fill: "#a8ddf0" }),
        el("rect", { x: 38, y: -120, width: 40, height: 34, rx: 4, fill: "#a8ddf0" }),
        el("rect", { x: -40, y: -226, width: 80, height: 8, rx: 3, fill: "#c9483a" }),
      ],
      // Auf dem Haus: oben auf dem First.
      oben: -226, unten: 0, rechts: 175,
    },
  };

  function buildDing(id) {
    const ding = DINGE[id];
    if (!ding) return null;
    return group({ class: `lese-ding lese-ding-${id}`, "data-ding": id }, ding.teile());
  }

  // ---------------------------------------------------------------------------
  // Das Bild zu einem Satz (Stimmt das?, Lückensätze)
  // ---------------------------------------------------------------------------
  // Ein Ding, Tiere darauf, darunter oder daneben, und was sie tun. Gezeichnet
  // wird immer die Wahrheit; der Satz dazu steht in lesen-inhalte.js
  // (satzTeile).
  //   lage  { tier, ding, wo, anzahl, tun }   ohne tun stehen die Tiere
  const SZENE_X0 = -70;          // wo das Ding steht; rechts davon ist Platz für «neben»
  const TIER_GROESSE = 2.3;
  // Wie viele Tiere an welcher Stelle Platz haben, und wo genau sie stehen
  // (Abstand vom Ding in seinen eigenen Einheiten).
  const PLAETZE = {
    tisch: { auf: [[0], [-45, 45], [-75, 0, 75]], unter: [[0], [-38, 38]] },
    stuhl: { auf: [[2]] },
    bett: { auf: [[20], [-30, 60], [-70, 10, 90]] },
    kiste: { auf: [[0], [-32, 32]] },
    baum: { auf: [[-30], [-60, 50]], unter: [[-62], [-70, 70]] },
    haus: { auf: [[0]] },
  };
  const NEBEN = [0, 64, 128];

  // Wie viele Tiere dort Platz haben. Wer schläft, liegt – und liegt allein.
  function platzFuer(dingId, wo, tun = "steht") {
    if (tun === "schlaeft") return 1;
    if (wo === "neben") return NEBEN.length;
    return (PLAETZE[dingId]?.[wo] || [[0]]).length;
  }

  // Wie hoch ein Tier mit dem, was es tut, ins Bild ragt (Einheiten der Figur).
  const TUN_HOEHE = { steht: 50, liest: 50, singt: 68, huepft: 84, schlaeft: 30 };
  // Passt das ins Bild? Wer auf dem Dach singt oder auf dem Baum hüpft, stösst
  // oben an den Rand; wer unter dem Tisch hüpft, an die Tischplatte.
  function szenePasst(lage) {
    const ding = DINGE[lage.ding];
    if (!ding) return false;
    const tun = lage.tun || "steht";
    if (lage.wo === "unter" && lage.ding === "tisch" && tun === "huepft") return false;
    const boden = lage.wo === "auf" ? ding.oben : 0;
    return boden - (TUN_HOEHE[tun] || 50) * TIER_GROESSE >= -345;
  }

  // Eine Note, in den Einheiten der Figur.
  function note(x, y, s = 1) {
    return group({ transform: `translate(${x} ${y}) scale(${s})` }, [
      el("ellipse", { cx: 0, cy: 0, rx: 3.6, ry: 2.7, fill: "#7c5ce6", transform: "rotate(-20)" }),
      el("rect", { x: 2.3, y: -13, width: 1.6, height: 13, fill: "#7c5ce6" }),
      el("path", { d: "M3.9 -13 q5 2 6 7", stroke: "#7c5ce6", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }),
    ]);
  }

  // Ein Tier und was es tut – in den Einheiten der Figur aus train-art.js:
  // Füsse auf 0, der Kopf um -35, gut 45 hoch.
  function szenenTier(tierId, tun = "steht") {
    const zug = window.LernappTrainArt;
    const figur = zug ? zug.buildPassenger(tierId) : group({}, []);
    const teile = [];
    if (tun === "schlaeft") {
      // Hingelegt, der Kopf links; darüber «z z Z».
      const zzz = el("text", { x: -36, y: -24, "font-size": 12, "font-weight": 700, "font-family": "Andika, Inter, system-ui, sans-serif", fill: "#2f6fd0" });
      zzz.textContent = "z z Z";
      teile.push(group({ transform: "translate(22 -15) rotate(-90)" }, [figur]), zzz);
    } else if (tun === "huepft") {
      // Hoch in der Luft: darunter Striche, wie er abgesprungen ist, und sein
      // Schatten am Boden.
      teile.push(el("ellipse", { cx: 0, cy: 1, rx: 10, ry: 2.4, fill: "#000000", opacity: "0.14" }));
      teile.push(el("path", { d: "M-7 -7 L-7 -21 M0 -5 L0 -24 M7 -7 L7 -21", stroke: "#7a889c", "stroke-width": 1.8, fill: "none", "stroke-linecap": "round" }));
      teile.push(group({ transform: "translate(0 -30)" }, [figur]));
    } else {
      teile.push(figur);
      if (tun === "liest") {
        // Ein offenes Buch vor dem Bauch.
        teile.push(el("path", { d: "M-12 -24 Q-6 -27 0 -23 Q6 -27 12 -24 L12 -12 Q6 -15 0 -11 Q-6 -15 -12 -12 Z", fill: "#ffffff", stroke: "#2f6fd0", "stroke-width": 1.4 }));
        teile.push(el("path", { d: "M0 -23 L0 -11 M-8 -21 L-3 -20 M-8 -17 L-3 -16 M3 -20 L8 -21 M3 -16 L8 -17", stroke: "#2f6fd0", "stroke-width": 0.9 }));
      }
      if (tun === "singt") teile.push(note(15, -46), note(25, -57, 0.8));
    }
    return group({ class: "szene-tier", "data-tier": tierId, "data-tun": tun }, teile);
  }

  function buildSzene(lage, { klasse = "szene-svg", label = "Das Bild zum Satz" } = {}) {
    const svg = el("svg", { viewBox: "-300 -340 600 380", class: klasse, role: "img", "aria-label": label });
    svg.append(el("rect", { x: -296, y: -336, width: 592, height: 372, rx: 26, fill: "#eaf6fd" }));
    svg.append(el("rect", { x: -296, y: 0, width: 592, height: 36, fill: "#9fd68a" }));
    svg.append(el("rect", { x: -296, y: -2, width: 592, height: 6, fill: "#7fbf6a" }));
    const dingInfo = DINGE[lage.ding];
    if (!dingInfo) return svg;
    const anzahl = Math.max(1, Math.min(Number(lage.anzahl) || 1, platzFuer(lage.ding, lage.wo, lage.tun)));
    const xs = lage.wo === "neben"
      ? NEBEN.slice(0, anzahl).map((x) => dingInfo.rechts + x)
      : (PLAETZE[lage.ding]?.[lage.wo] || [[0]])[anzahl - 1] || [0];
    const y = lage.wo === "auf" ? dingInfo.oben : 0;
    const tiere = xs.map((x) => group({ transform: `translate(${SZENE_X0 + x} ${y}) scale(${TIER_GROESSE})` }, [szenenTier(lage.tier, lage.tun || "steht")]));
    // Wer unter dem Tisch steht, steht hinter dessen Platte: erst die Tiere,
    // dann der Tisch. Sonst erst das Ding, dann die Tiere.
    const dingGruppe = group({ transform: `translate(${SZENE_X0} 0)` }, [buildDing(lage.ding)]);
    if (lage.wo === "unter" && lage.ding === "tisch") svg.append(...tiere, dingGruppe);
    else svg.append(dingGruppe, ...tiere);
    return svg;
  }

  window.LernappLeseArt = {
    FARBE, BUCHFARBEN, WAGEN_W, WAGEN_H, ZIMMER_W, ZIMMER_H, DINGE,
    el, group, shade,
    buildLesewurm, buildLesewagen, buildLesezimmer, buildTrommel, buildLautWagen, buildDing,
    SZENE_PLAETZE: PLAETZE, SZENE_NEBEN: NEBEN, platzFuer, szenePasst, buildSzene,
  };
})();
