/*
 * lesen-wurm.js – Der Lesewurm in seinen drei Leben.
 *
 * Wie die Wagen des Zugs wächst der Lesewurm in Stufen, die man sieht, und
 * ein paar verwandeln ihn. Er lebt drei Leben nacheinander, jedes mit
 * fünfzehn Stufen (lesen-stand.js, wurmStand, rechnet, wo er steht):
 *
 *   Lesefalter         er schlüpft aus einem Buch, frisst sich durch
 *                      Buchstaben, spinnt sich in Buchseiten ein und kommt als
 *                      Schmetterling mit derselben Brille heraus
 *   Lesewurm-Express   ein neuer Wurm: aus seinen Gliedern werden Wagen, aus
 *                      der Mütze ein Kamin
 *   Lesezauberer       ein dritter: sein Buch leuchtet, er bekommt Hut,
 *                      Zauberstift, Eule Ella und einen fliegenden Teppich
 *
 * Ist ein Leben fertig, zieht der fertige Wurm aufs Bücherregal (vitrine),
 * und ein neuer schlüpft. Dazu die Missionskarte über dem Sofa: was der Wurm
 * als Nächstes vorschlägt, der grüne Knopf und die Leiste mit den Buchstaben
 * bis zur nächsten Überraschung.
 *
 * Gezeichnet im Stil von lesen-art.js (flache Farben, runde Formen). Der
 * Ursprung (0, 0) des Wurms liegt auf dem Sitz des Sofas unter seiner Mitte.
 * Was sich bewegt, bewegt sich über Klassen (lw-…) im Stylesheet, nie über
 * das transform-Attribut einer Gruppe, die damit ihre Lage hält.
 * Zeichnet nur; was ein Tipp tut, entscheidet train-leseecke.js.
 */
(() => {
  "use strict";

  const A = window.LernappLeseArt;
  const { el, group, shade } = A;

  const G = "#7ac74f";
  const GD = "#4f9a35";
  const INK = "#3a4250";
  const GOLD = "#f0b429";
  const WANGE = "#ff9b8f";
  const REGENBOGEN = ["#ff6b6b", "#ffb347", "#ffe66d", "#6ee7a8", "#6ec6ff", "#a78bfa"];

  const kreis = (cx, cy, r, fill, extra = {}) => el("circle", { cx: f(cx), cy: f(cy), r: f(r), fill, ...extra });
  const pfad = (d, fill, extra = {}) => el("path", { d, fill, ...extra });
  const linie = (d, farbe, breite, extra = {}) => el("path", { d, fill: "none", stroke: farbe, "stroke-width": breite, "stroke-linecap": "round", "stroke-linejoin": "round", ...extra });
  const eck = (x, y, w, h, fill, extra = {}) => el("rect", { x: f(x), y: f(y), width: f(w), height: f(h), fill, ...extra });
  const text = (x, y, inhalt, extra = {}) => {
    const t = el("text", { x: f(x), y: f(y), "text-anchor": "middle", "font-family": "Andika, Inter, system-ui, sans-serif", "font-weight": 700, ...extra });
    t.textContent = inhalt;
    return t;
  };
  function f(n) { return Math.round(Number(n) * 10) / 10; }

  function stern(cx, cy, r, attrs = {}) {
    const punkte = [];
    for (let i = 0; i < 10; i += 1) {
      const w = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      punkte.push(`${f(cx + Math.cos(w) * rr)},${f(cy + Math.sin(w) * rr)}`);
    }
    return el("polygon", { points: punkte.join(" "), ...attrs });
  }
  // Ein Funkeln: vier Spitzen.
  function funkeln(cx, cy, s, fill = "#ffffff", klasse = "lw-funkeln", verzug = 0) {
    return pfad(`M${cx} ${cy - s} Q${cx + s * 0.18} ${cy - s * 0.18} ${cx + s} ${cy} Q${cx + s * 0.18} ${cy + s * 0.18} ${cx} ${cy + s} Q${cx - s * 0.18} ${cy + s * 0.18} ${cx - s} ${cy} Q${cx - s * 0.18} ${cy - s * 0.18} ${cx} ${cy - s} Z`, fill, { class: klasse, style: `animation-delay:${verzug}s` });
  }

  // ---------------------------------------------------------------------------
  // Der Körper
  // ---------------------------------------------------------------------------
  // Der Wurm liegt auf dem Sitz und reckt vorne den Kopf hoch. Gezählt wird
  // vom Hals aus nach hinten: Zuerst geht es den Bogen hinunter, dann auf dem
  // Sitz nach links. So bleibt der Kopf, wo er ist, und der Wurm wird nach
  // hinten länger.
  //   R   wie hoch er den Kopf reckt (klein: liegt flach wie ein Zug)
  function koerper(n, { r = 24, R = 52, s = 36, hx = 40 } = {}) {
    const C = { x: hx, y: -r - R };
    const viertel = (Math.PI * R) / 2;
    const glieder = [];
    for (let i = 0; i < n; i += 1) {
      const d = s * 0.55 + i * s;
      const ri = r * (1 - 0.26 * Math.min(1, i / 8));
      if (d <= viertel) {
        const t = d / R;
        glieder.push({ x: C.x + R * Math.cos(t), y: Math.min(C.y + R * Math.sin(t), -ri), r: ri });
      } else {
        glieder.push({ x: C.x - (d - viertel), y: -ri, r: ri });
      }
    }
    return { glieder, hals: { x: C.x + R, y: C.y } };
  }

  function schatten(glieder, extra = 0) {
    const xs = glieder.map((g) => g.x);
    const links = Math.min(...xs) - 20 - extra;
    const rechts = Math.max(...xs) + 28 + extra;
    return el("ellipse", { cx: f((links + rechts) / 2), cy: 2, rx: f((rechts - links) / 2), ry: 9, fill: "#000", opacity: "0.13" });
  }

  // Ein Glied, wie es die Stufe will: grün mit Rand, dazu Tupfen, Streifen,
  // Sterne oder Regenbogen.
  function glied(g, i, o = {}) {
    const hell = i % 2 === 0;
    const grund = o.farbe ? o.farbe(i) : (hell ? G : shade(G, -0.1));
    const teile = [kreis(g.x, g.y, g.r, grund, { stroke: o.rand || GD, "stroke-width": f(g.r * 0.09) })];
    if (o.streifen) {
      teile.push(pfad(`M${f(g.x - g.r * 0.32)} ${f(g.y - g.r * 0.94)} Q${f(g.x - g.r * 0.5)} ${f(g.y)} ${f(g.x - g.r * 0.32)} ${f(g.y + g.r * 0.94)} L${f(g.x - g.r * 0.02)} ${f(g.y + g.r * 0.99)} Q${f(g.x - g.r * 0.2)} ${f(g.y)} ${f(g.x - g.r * 0.02)} ${f(g.y - g.r * 0.99)} Z`, o.streifen(i), { opacity: "0.95" }));
    }
    if (o.tupfen) {
      teile.push(kreis(g.x + g.r * 0.28, g.y - g.r * 0.32, g.r * 0.2, o.tupfen));
      teile.push(kreis(g.x - g.r * 0.1, g.y + g.r * 0.3, g.r * 0.13, o.tupfen, { opacity: "0.85" }));
    }
    if (o.sternchen && i % 2 === 1) teile.push(stern(g.x, g.y - g.r * 0.15, g.r * 0.42, { fill: "#fff3b0", opacity: "0.95" }));
    // Ein heller Glanz oben links: Er macht aus dem Kreis eine Kugel.
    teile.push(el("ellipse", { cx: f(g.x - g.r * 0.35), cy: f(g.y - g.r * 0.45), rx: f(g.r * 0.28), ry: f(g.r * 0.16), fill: "#ffffff", opacity: "0.35", transform: `rotate(-30 ${f(g.x - g.r * 0.35)} ${f(g.y - g.r * 0.45)})` }));
    return group({}, teile);
  }

  // Füsschen unter den Gliedern, die auf dem Sitz liegen.
  function fuesse(glieder) {
    return glieder.filter((g) => g.y >= -g.r * 1.35).flatMap((g) => [
      el("ellipse", { cx: f(g.x - g.r * 0.3), cy: -3, rx: f(g.r * 0.24), ry: f(g.r * 0.26), fill: shade(GD, -0.12) }),
      el("ellipse", { cx: f(g.x + g.r * 0.32), cy: -3, rx: f(g.r * 0.24), ry: f(g.r * 0.26), fill: shade(GD, -0.12) }),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Der Kopf
  // ---------------------------------------------------------------------------
  //   augen  offen | zu | gross
  //   mund   laecheln | gaehnen | kauen | oh | pfeife
  //   oben   schopf | fuehler | keiner
  function kopf(k, o = {}) {
    const farbe = o.farbe || G;
    const rand = o.rand || GD;
    const teile = [];
    const oben = o.oben || "schopf";
    if (oben === "fuehler") {
      teile.push(linie(`M${f(-k * 0.3)} ${f(-k * 0.85)} Q${f(-k * 0.55)} ${f(-k * 1.5)} ${f(-k * 0.85)} ${f(-k * 1.75)}`, rand, k * 0.1));
      teile.push(linie(`M${f(k * 0.3)} ${f(-k * 0.85)} Q${f(k * 0.55)} ${f(-k * 1.5)} ${f(k * 0.85)} ${f(-k * 1.75)}`, rand, k * 0.1));
      teile.push(group({ class: "lw-fuehlerkugel" }, [kreis(-k * 0.88, -k * 1.8, k * 0.17, o.kugel || "#ffd166", { stroke: shade(o.kugel || "#ffd166", -0.3), "stroke-width": 1.5 })]));
      teile.push(group({ class: "lw-fuehlerkugel", style: "animation-delay:-0.6s" }, [kreis(k * 0.88, -k * 1.8, k * 0.17, o.kugel || "#ffd166", { stroke: shade(o.kugel || "#ffd166", -0.3), "stroke-width": 1.5 })]));
    }
    teile.push(kreis(0, 0, k, farbe, { stroke: rand, "stroke-width": f(k * 0.07) }));
    teile.push(el("ellipse", { cx: f(-k * 0.4), cy: f(-k * 0.55), rx: f(k * 0.26), ry: f(k * 0.14), fill: "#ffffff", opacity: "0.3", transform: `rotate(-30 ${f(-k * 0.4)} ${f(-k * 0.55)})` }));
    // Bäckchen
    const backe = o.mund === "kauen" ? 0.26 : 0.2;
    teile.push(kreis(-k * 0.58, k * 0.36, k * backe, WANGE, { opacity: "0.6" }));
    teile.push(kreis(k * 0.58, k * 0.36, k * backe, WANGE, { opacity: "0.6" }));
    // Augen
    const augen = o.augen || "offen";
    if (augen === "zu") {
      teile.push(linie(`M${f(-k * 0.52)} ${f(-k * 0.1)} q${f(k * 0.16)} ${f(k * 0.12)} ${f(k * 0.32)} 0`, INK, k * 0.08));
      teile.push(linie(`M${f(k * 0.2)} ${f(-k * 0.1)} q${f(k * 0.16)} ${f(k * 0.12)} ${f(k * 0.32)} 0`, INK, k * 0.08));
    } else {
      const gr = augen === "gross" ? 1.15 : 1;
      teile.push(kreis(-k * 0.36, -k * 0.12, k * 0.27 * gr, "#ffffff"));
      teile.push(kreis(k * 0.36, -k * 0.12, k * 0.27 * gr, "#ffffff"));
      teile.push(kreis(-k * 0.31, -k * 0.08, k * 0.13 * gr, INK, { class: "lw-auge" }));
      teile.push(kreis(k * 0.41, -k * 0.08, k * 0.13 * gr, INK, { class: "lw-auge" }));
      teile.push(kreis(-k * 0.27, -k * 0.13, k * 0.045, "#ffffff"));
      teile.push(kreis(k * 0.45, -k * 0.13, k * 0.045, "#ffffff"));
    }
    // Die runde Lesebrille – an ihr erkennt man ihn in jeder Gestalt.
    if (o.brille !== false) {
      const glas = o.goldbrille ? GOLD : INK;
      teile.push(kreis(-k * 0.36, -k * 0.12, k * 0.34, "none", { stroke: glas, "stroke-width": f(k * 0.08) }));
      teile.push(kreis(k * 0.36, -k * 0.12, k * 0.34, "none", { stroke: glas, "stroke-width": f(k * 0.08) }));
      teile.push(linie(`M${f(-k * 0.03)} ${f(-k * 0.15)} q${f(k * 0.03)} ${f(-k * 0.06)} ${f(k * 0.06)} 0`, glas, k * 0.07));
    }
    // Mund
    const mund = o.mund || "laecheln";
    const lippe = shade(GD, -0.3);
    if (mund === "gaehnen") teile.push(el("ellipse", { cx: 0, cy: f(k * 0.45), rx: f(k * 0.16), ry: f(k * 0.22), fill: "#8a3b3b" }));
    else if (mund === "oh") teile.push(kreis(0, k * 0.45, k * 0.12, "#8a3b3b"));
    else if (mund === "kauen") teile.push(linie(`M${f(-k * 0.22)} ${f(k * 0.42)} q${f(k * 0.11)} ${f(k * 0.1)} ${f(k * 0.22)} 0 q${f(k * 0.11)} ${f(-k * 0.1)} ${f(k * 0.22)} 0`, lippe, k * 0.08));
    else if (mund === "pfeife") {
      teile.push(linie(`M${f(-k * 0.2)} ${f(k * 0.4)} q${f(k * 0.2)} ${f(k * 0.16)} ${f(k * 0.4)} 0`, lippe, k * 0.08));
      teile.push(group({ transform: `translate(${f(k * 0.18)} ${f(k * 0.52)}) rotate(18)` }, [
        eck(0, -k * 0.09, k * 0.62, k * 0.18, GOLD, { rx: f(k * 0.06) }),
        kreis(k * 0.66, 0, k * 0.17, GOLD),
        kreis(k * 0.66, 0, k * 0.07, shade(GOLD, -0.4)),
      ]));
    } else teile.push(linie(`M${f(-k * 0.3)} ${f(k * 0.38)} q${f(k * 0.3)} ${f(k * 0.28)} ${f(k * 0.6)} 0`, lippe, k * 0.09));
    if (oben === "schopf") {
      teile.push(linie(`M${f(-k * 0.1)} ${f(-k * 0.95)} q${f(-k * 0.15)} ${f(-k * 0.45)} ${f(k * 0.2)} ${f(-k * 0.55)} M${f(k * 0.12)} ${f(-k * 0.95)} q${f(k * 0.05)} ${f(-k * 0.38)} ${f(k * 0.42)} ${f(-k * 0.36)}`, rand, k * 0.1));
    }
    return teile;
  }

  // Ein offenes Buch vor der Brust.
  function buch(k, { farbe = "#2f6f8f", leuchtet = false, angeknabbert = false } = {}) {
    const teile = [];
    if (leuchtet) teile.push(el("ellipse", { cx: 0, cy: f(k * 0.2), rx: f(k * 1.5), ry: f(k * 1.05), fill: "url(#lw-buchlicht)", class: "lw-buchlicht" }));
    const links = angeknabbert
      ? `M0 0 L${f(-k * 0.95)} ${f(-k * 0.2)} L${f(-k * 0.95)} ${f(k * 0.05)} q${f(k * 0.2)} ${f(k * 0.06)} ${f(k * 0.12)} ${f(k * 0.22)} q${f(-k * 0.16)} ${f(k * 0.04)} ${f(-k * 0.12)} ${f(k * 0.28)} L${f(-k * 0.95)} ${f(k * 0.55)} L0 ${f(k * 0.72)} Z`
      : `M0 0 L${f(-k * 0.95)} ${f(-k * 0.2)} L${f(-k * 0.95)} ${f(k * 0.55)} L0 ${f(k * 0.72)} Z`;
    teile.push(pfad(links, "#ffffff", { stroke: farbe, "stroke-width": f(k * 0.07), "stroke-linejoin": "round" }));
    teile.push(pfad(`M0 0 L${f(k * 0.95)} ${f(-k * 0.2)} L${f(k * 0.95)} ${f(k * 0.55)} L0 ${f(k * 0.72)} Z`, "#ffffff", { stroke: farbe, "stroke-width": f(k * 0.07), "stroke-linejoin": "round" }));
    teile.push(linie(`M${f(-k * 0.75)} ${f(k * 0.05)} L${f(-k * 0.2)} ${f(k * 0.15)} M${f(-k * 0.75)} ${f(k * 0.25)} L${f(-k * 0.2)} ${f(k * 0.35)} M${f(k * 0.2)} ${f(k * 0.15)} L${f(k * 0.75)} ${f(k * 0.05)} M${f(k * 0.2)} ${f(k * 0.35)} L${f(k * 0.75)} ${f(k * 0.25)}`, "#9aa7b8", k * 0.05));
    return teile;
  }

  // Der ganze liegende Wurm: Körper, Hals, Kopf, Buch.
  //   n        so viele Glieder
  //   glied    Muster der Glieder (siehe glied)
  //   kopfO    was der Kopf trägt (siehe kopf)
  //   aufsatz  (k) => Teile über dem Kopf: Mütze, Hut, Kamin …
  //   buchO    das Buch (false: keins)
  function liegenderWurm(n, { r = 24, R = 52, k = 31, glied: muster = {}, kopfO = {}, aufsatz = null, buchO = {}, mitFuessen = false, vorKopf = null, hinten = null, amHals = null } = {}) {
    const { glieder, hals } = koerper(n, { r, R });
    // Mit Füsschen steht er ein wenig höher: Sonst verschwänden sie unter ihm.
    if (mitFuessen) { glieder.forEach((g) => { g.y -= r * 0.28; }); hals.y -= r * 0.28; }
    const teile = [schatten(glieder)];
    if (hinten) teile.push(...hinten(glieder));
    if (mitFuessen) teile.push(...fuesse(glieder));
    for (let i = glieder.length - 1; i >= 0; i -= 1) teile.push(glied(glieder[i], i, muster));
    const kopfPos = { x: hals.x + 4, y: hals.y - k * 0.62 };
    const kopfTeile = [...kopf(k, kopfO)];
    if (aufsatz) kopfTeile.push(...aufsatz(k));
    teile.push(group({ class: "lw-kopf", transform: `translate(${f(kopfPos.x)} ${f(kopfPos.y)})` }, [group({ class: "lw-nicken" }, kopfTeile)]));
    if (amHals) teile.push(...amHals(kopfPos, k, glieder));
    if (buchO !== false) teile.push(group({ transform: `translate(${f(kopfPos.x - k * 0.15)} ${f(kopfPos.y + k * 1.0)}) rotate(-6)` }, buch(k, buchO)));
    if (vorKopf) teile.push(...vorKopf(kopfPos, k, glieder));
    return { teile, glieder, kopfPos };
  }

  // ---------------------------------------------------------------------------
  // Hüte und Mützen
  // ---------------------------------------------------------------------------
  function schlafmuetze(k) {
    return [group({ transform: `translate(${f(-k * 0.05)} ${f(-k * 0.78)}) rotate(-12)` }, [
      pfad(`M${f(-k * 0.82)} ${f(k * 0.1)} Q${f(-k * 0.2)} ${f(-k * 1.3)} ${f(k * 1.05)} ${f(-k * 0.55)} Q${f(k * 0.35)} ${f(-k * 0.55)} ${f(k * 0.82)} ${f(k * 0.1)} Z`, "#6c8cff"),
      ...[[-0.35, -0.45], [0.2, -0.75], [0.45, -0.25]].map(([x, y]) => stern(k * x, k * y, k * 0.11, { fill: "#fff3b0" })),
      eck(-k * 0.92, -k * 0.02, k * 1.84, k * 0.26, "#ffffff", { rx: f(k * 0.13) }),
      kreis(k * 1.1, -k * 0.55, k * 0.2, "#ffffff"),
    ])];
  }

  function schaffnermuetze(k, gold = false) {
    const farbe = gold ? GOLD : "#2f4b8f";
    return [group({ transform: `translate(0 ${f(-k * 0.72)})` }, [
      pfad(`M${f(-k * 0.78)} ${f(k * 0.06)} Q${f(-k * 0.8)} ${f(-k * 0.62)} 0 ${f(-k * 0.66)} Q${f(k * 0.8)} ${f(-k * 0.62)} ${f(k * 0.78)} ${f(k * 0.06)} Z`, farbe),
      eck(-k * 0.82, -k * 0.08, k * 1.64, k * 0.2, shade(farbe, -0.3), { rx: f(k * 0.08) }),
      pfad(`M${f(-k * 0.5)} ${f(k * 0.12)} Q0 ${f(k * 0.42)} ${f(k * 0.6)} ${f(k * 0.12)} Z`, shade(farbe, -0.45)),
      kreis(0, -k * 0.32, k * 0.15, gold ? "#fff3b0" : GOLD),
    ])];
  }

  // Der Kamin wächst aus der Mütze; der Rauch steigt in Wölkchen auf.
  function kamin(k, { regenbogen = false } = {}) {
    const wolke = (x, y, r, i) => kreis(x, y, r, regenbogen ? REGENBOGEN[i % REGENBOGEN.length] : "#eef2f6", { class: `lw-rauch lw-rauch-${i % 3}`, opacity: regenbogen ? "0.85" : "0.9" });
    return [
      group({ transform: `translate(${f(k * 0.35)} ${f(-k * 1.3)})` }, [
        eck(-k * 0.16, -k * 0.6, k * 0.32, k * 0.62, "#4a5568", { rx: f(k * 0.05) }),
        eck(-k * 0.24, -k * 0.72, k * 0.48, k * 0.16, "#2d3748", { rx: f(k * 0.06) }),
        wolke(k * 0.05, -k * 1.0, k * 0.2, 0),
        wolke(k * 0.3, -k * 1.35, k * 0.26, 1),
        wolke(k * 0.6, -k * 1.75, k * 0.32, 2),
      ]),
    ];
  }

  function zauberhut(k, { mond = false } = {}) {
    return [group({ transform: `translate(${f(k * 0.05)} ${f(-k * 0.7)}) rotate(10)` }, [
      el("ellipse", { cx: 0, cy: f(k * 0.05), rx: f(k * 1.1), ry: f(k * 0.24), fill: "#3b4fb8" }),
      pfad(`M${f(-k * 0.7)} ${f(k * 0.02)} Q${f(-k * 0.2)} ${f(-k * 1.2)} ${f(k * 0.25)} ${f(-k * 2.05)} Q${f(k * 0.38)} ${f(-k * 1.1)} ${f(k * 0.7)} ${f(k * 0.02)} Z`, "#4c63d2"),
      pfad(`M${f(-k * 0.62)} ${f(-k * 0.12)} Q0 ${f(-k * 0.34)} ${f(k * 0.64)} ${f(-k * 0.12)} L${f(k * 0.66)} ${f(k * 0.02)} Q0 ${f(-k * 0.2)} ${f(-k * 0.66)} ${f(k * 0.02)} Z`, GOLD),
      stern(-k * 0.18, -k * 0.62, k * 0.16, { fill: "#fff3b0" }),
      stern(k * 0.22, -k * 1.15, k * 0.12, { fill: "#fff3b0" }),
      stern(k * 0.02, -k * 0.95, k * 0.07, { fill: "#ffffff" }),
      ...(mond ? [
        pfad(`M${f(k * 0.3)} ${f(-k * 2.18)} a${f(k * 0.22)} ${f(k * 0.22)} 0 1 0 ${f(k * 0.18)} ${f(k * 0.34)} a${f(k * 0.16)} ${f(k * 0.16)} 0 1 1 ${f(-k * 0.18)} ${f(-k * 0.34)} Z`, "#ffe58a", { stroke: "#e8a700", "stroke-width": 1.2 }),
        kreis(k * 0.28, -k * 1.92, k * 0.1, GOLD, { class: "lw-gloeckchen" }),
      ] : []),
    ])];
  }

  // ---------------------------------------------------------------------------
  // A – Vom Lesewurm zum Lesefalter
  // ---------------------------------------------------------------------------
  // Ein Buch mit einem Loch: Darin wohnt jemand. Er kriecht heraus, wächst,
  // bekommt Tupfen, Füsschen und Fühler, frisst sich durch ein Buch, wird
  // müde – und spinnt sich in einen Kokon aus Buchseiten. Der wackelt, bricht
  // auf, und heraus kommt ein Schmetterling mit derselben Brille.
  //   titel  wie die Stufe heisst (Elternbericht, Beschriftung)
  //   sagt   was der Lautsprecher bei der Verwandlung sagt; {wer} ist der
  //          Name des Wurms oder «Dein Lesewurm»
  //   ueberraschung  eine der grossen Verwandlungen
  const A_STUFEN = [
    { titel: "Wer wohnt im Buch?", sagt: "Da wohnt jemand im Buch!", ueberraschung: true },
    { titel: "Er kriecht heraus", sagt: "{wer} ist aus dem Buch gekrochen!" },
    { titel: "Länger", sagt: "{wer} ist länger geworden!" },
    { titel: "Tupfen", sagt: "{wer} hat gelbe Tupfen bekommen!", ueberraschung: true },
    { titel: "Füsschen", sagt: "{wer} hat Füsschen bekommen!" },
    { titel: "Fühler", sagt: "{wer} hat Fühler bekommen!" },
    { titel: "Streifen", sagt: "{wer} ist dick und bunt geringelt!" },
    { titel: "Nimmersatt", sagt: "{wer} frisst sich durchs Buch!", ueberraschung: true },
    { titel: "Müde", sagt: "{wer} ist müde. Was hat er wohl vor?" },
    { titel: "Der Kokon", sagt: "Pssst! {wer} hat sich in Buchseiten eingesponnen.", ueberraschung: true },
    { titel: "Es wackelt!", sagt: "Der Kokon wackelt! Gleich passiert etwas.", ueberraschung: true },
    { titel: "Geschlüpft!", sagt: "Ein Schmetterling! {wer} ist ein Lesefalter geworden.", ueberraschung: true },
    { titel: "Grosse Flügel", sagt: "Der Lesefalter hat grosse Flügel mit Buchstaben!" },
    { titel: "Regenbogen", sagt: "Seine Flügel leuchten in allen Farben!" },
    { titel: "Er fliegt!", sagt: "Der Lesefalter fliegt!", ueberraschung: true },
  ];

  function kokon(stufe) {
    const wackelt = stufe >= 11;
    const teile = [el("ellipse", { cx: 10, cy: 2, rx: 120, ry: 10, fill: "#000", opacity: "0.13" })];
    const huelle = [
      el("ellipse", { cx: 10, cy: -46, rx: 118, ry: 46, fill: "#fbf3df", stroke: "#c8b48a", "stroke-width": 3 }),
      // Seiten, um ihn gewickelt
      ...[-70, -30, 10, 50, 86].map((x, i) => pfad(`M${x - 14} ${-88 + Math.abs(x - 10) * 0.05} Q${x + 8} -46 ${x - 14} ${-4 - Math.abs(x - 10) * 0.05} L${x + 6} ${-4 - Math.abs(x - 10) * 0.05} Q${x + 28} -46 ${x + 6} ${-88 + Math.abs(x - 10) * 0.05} Z`, i % 2 ? "#fffaf0" : "#f3e7c8", { stroke: "#d9c79e", "stroke-width": 1.5 })),
      ...[-84, -44, -4, 36].map((x) => linie(`M${x} -60 h16 M${x} -50 h20 M${x} -40 h14 M${x} -30 h18`, "#b7c0cc", 2)),
      // Die Brille schaut vorne heraus
      kreis(92, -52, 13, "#a8ddf0", { opacity: "0.8" }),
      kreis(118, -52, 13, "#a8ddf0", { opacity: "0.8" }),
      kreis(92, -52, 13, "none", { stroke: INK, "stroke-width": 3.5 }),
      kreis(118, -52, 13, "none", { stroke: INK, "stroke-width": 3.5 }),
      linie("M104 -54 q1 -3 2 0", INK, 3),
      ...(stufe === 10 ? [linie("M86 -52 q6 4 12 0 M112 -52 q6 4 12 0", INK, 2.5)] : [kreis(94, -51, 4.5, INK), kreis(120, -51, 4.5, INK)]),
    ];
    if (wackelt) {
      huelle.push(linie("M-40 -92 l8 14 l-10 10 l9 12 l-6 10", "#8a7a5a", 3));
      huelle.push(linie("M30 -92 l-7 12 l9 9 l-8 12", "#8a7a5a", 3));
    }
    if (wackelt) {
      // Licht scheint aus den Rissen: ein Schein dahinter und feine Strahlen.
      teile.push(el("ellipse", { cx: 0, cy: -60, rx: 170, ry: 95, fill: "url(#lw-buchlicht)", class: "lw-strahlen" }));
      teile.push(group({ class: "lw-strahlen" }, [
        [-36, -96, -52, -140], [-30, -98, -22, -146], [-40, -94, -76, -124],
        [32, -96, 22, -144], [38, -96, 60, -138], [30, -98, 4, -136],
      ].map(([x1, y1, x2, y2]) => linie(`M${x1} ${y1} L${x2} ${y2}`, "#ffe58a", 5, { opacity: "0.85" }))));
    }
    teile.push(group({ class: wackelt ? "lw-wackeln" : "lw-atmen" }, huelle));
    if (stufe === 10) {
      teile.push(group({ class: "lw-zzz" }, [text(150, -100, "z", { "font-size": 22, fill: "#7c8a99" }), text(166, -122, "z", { "font-size": 28, fill: "#7c8a99" })]));
    }
    if (wackelt) teile.push(funkeln(-70, -110, 9, "#ffd166"), funkeln(60, -116, 7, "#ffffff", "lw-funkeln", -0.7), funkeln(140, -90, 8, "#ffd166", "lw-funkeln", -1.2));
    return teile;
  }

  // Der Schmetterling von vorne: Körper aus kleinen Gliedern, der Kopf des
  // Lesewurms obendrauf, vier Flügel.
  //   sitzt  der fertige Lesefalter auf dem Regal: ohne Kokon und Glitzer,
  //          die Flügel gehen nur ab und zu auf und zu
  function falter(stufe, { sitzt = false } = {}) {
    const fliegt = stufe >= 15 && !sitzt;
    const gross = stufe >= 13;
    const bunt = stufe >= 14;
    const k = 26;
    const teile = [];
    // Fliegend schwebt er knapp über dem Sofa: Höher reichten seine Flügel im
    // Zimmer über die Pinnwand, und ein Tipp darauf träfe ihn statt sie.
    const y0 = fliegt ? -16 : sitzt ? -18 : 0;
    // Reste des Kokons auf dem Sitz
    if (sitzt) {
      // nichts darunter: Er sitzt auf dem Brett
    } else if (!fliegt) {
      teile.push(el("ellipse", { cx: 0, cy: 2, rx: 95, ry: 9, fill: "#000", opacity: "0.12" }));
      teile.push(pfad("M-82 0 Q-90 -26 -70 -38 L-60 -22 L-48 -34 L-40 -14 L-30 -26 L-26 0 Z", "#fbf3df", { stroke: "#c8b48a", "stroke-width": 2.5 }));
      teile.push(pfad("M30 0 L34 -24 L44 -12 L54 -30 L62 -16 L74 -32 Q92 -20 84 0 Z", "#f3e7c8", { stroke: "#c8b48a", "stroke-width": 2.5 }));
    } else {
      teile.push(el("ellipse", { cx: 0, cy: 2, rx: 60, ry: 7, fill: "#000", opacity: "0.08", class: "lw-falterschatten" }));
    }
    const fluegelFarbe = (i) => (bunt ? `url(#lw-fluegel-${i})` : gross ? (i < 2 ? "#8fd3ff" : "#b6e88f") : "#dff3d0");
    const randFarbe = bunt ? GOLD : gross ? "#3d7fb8" : "#9cc98a";
    const fluegel = (seite) => {
      const s = seite;
      const skala = gross ? 1 : 0.5;
      const oben = gross
        ? `M0 -78 C${s * 40} -150 ${s * 120} -160 ${s * 128} -110 C${s * 134} -70 ${s * 80} -56 0 -62 Z`
        : `M0 -74 C${s * 18} -104 ${s * 50} -112 ${s * 58} -96 L${s * 50} -90 L${s * 60} -82 L${s * 46} -76 L${s * 50} -66 C${s * 30} -62 ${s * 14} -64 0 -66 Z`;
      const unten = gross
        ? `M0 -58 C${s * 70} -60 ${s * 104} -30 ${s * 88} -4 C${s * 74} 18 ${s * 26} 2 0 -40 Z`
        : `M0 -58 C${s * 30} -60 ${s * 46} -46 ${s * 40} -34 L${s * 32} -36 L${s * 34} -28 C${s * 20} -28 ${s * 8} -36 0 -46 Z`;
      const muster = [];
      if (gross) {
        const buchst = s < 0 ? ["A", "b"] : ["C", "d"];
        muster.push(kreis(s * 84, -112, 22, "#ffffff", { opacity: "0.9" }));
        muster.push(text(s * 84, -104, buchst[0], { "font-size": 26, fill: bunt ? "#e8543f" : "#2f6f8f" }));
        muster.push(kreis(s * 58, -24, 15, "#ffffff", { opacity: "0.9" }));
        muster.push(text(s * 58, -18, buchst[1], { "font-size": 18, fill: bunt ? "#7c5ce6" : "#3fa34d" }));
        if (bunt) muster.push(...[[s * 110, -136], [s * 40, -128], [s * 82, -2]].map(([x, y]) => kreis(x, y, 4, "#ffffff", { opacity: "0.8" })));
      }
      return group({ class: fliegt ? `lw-fluegel lw-fluegel-${s < 0 ? "l" : "r"}` : sitzt ? `lw-fluegel-ruhig lw-fluegel-${s < 0 ? "l" : "r"}` : "lw-fluegel-still" }, [
        pfad(oben, fluegelFarbe(s < 0 ? 0 : 1), { stroke: randFarbe, "stroke-width": gross ? 4 : 2.5, "stroke-linejoin": "round", transform: gross ? null : `scale(${skala * 2})`, opacity: gross ? "1" : "0.95" }),
        pfad(unten, fluegelFarbe(s < 0 ? 2 : 3), { stroke: randFarbe, "stroke-width": gross ? 4 : 2.5, "stroke-linejoin": "round", transform: gross ? null : `scale(${skala * 2})` }),
        ...muster,
      ]);
    };
    const koerperTeile = [
      ...[[-22, 13], [-40, 15], [-58, 16]].map(([y, r], i) => kreis(0, y, r, i % 2 ? shade(G, -0.1) : G, { stroke: GD, "stroke-width": 1.8 })),
    ];
    const kopfTeile = kopf(k, { oben: "fuehler", kugel: bunt ? "#ff8fab" : "#ffd166", goldbrille: stufe >= 14, mund: stufe === 12 ? "oh" : "laecheln", augen: stufe === 12 ? "gross" : "offen" });
    const tier = group({ class: fliegt ? "lw-schweben" : null, transform: `translate(14 ${y0})` }, [
      fluegel(-1), fluegel(1),
      ...koerperTeile,
      group({ transform: "translate(0 -92)" }, [group({ class: "lw-nicken" }, kopfTeile)]),
    ]);
    teile.push(tier);
    if (fliegt) {
      // Glitzerspur aus Buchstaben
      teile.push(group({ class: "lw-glitzer" }, [
        funkeln(-120, -40, 8, "#ffd166"), funkeln(-150, -90, 6, "#ffffff", "lw-funkeln", -0.5), funkeln(-96, -120, 7, "#ff8fab", "lw-funkeln", -1),
        text(-136, -60, "a", { "font-size": 18, fill: "#7c5ce6", class: "lw-krume" }),
        text(-110, -150, "B", { "font-size": 16, fill: "#00a5b5", class: "lw-krume", style: "animation-delay:-1.3s" }),
        text(150, -130, "m", { "font-size": 17, fill: "#e8543f", class: "lw-krume", style: "animation-delay:-0.6s" }),
      ]));
    }
    if (stufe === 12) teile.push(funkeln(-60, -150, 8, "#ffd166"), funkeln(80, -140, 6, "#ffd166", "lw-funkeln", -0.8));
    return teile;
  }

  // Ein dickes, geschlossenes Buch, schräg von oben: vorne die Seiten, oben
  // der rote Deckel mit einem runden Loch. Aus dem Loch schaut er heraus.
  //   kopfDa  der kleine Kopf im Loch (Stufe 1); sonst ist das Loch leer
  function lochbuch({ kopfDa = true, x = 0 } = {}) {
    const lochX = x + 22;
    const lochY = -52;
    const teile = [
      el("ellipse", { cx: x + 10, cy: 2, rx: 112, ry: 10, fill: "#000", opacity: "0.14" }),
      // Seiten vorne
      pfad(`M${x - 92} -34 L${x + 104} -34 L${x + 104} -2 Q${x + 6} 4 ${x - 92} -2 Z`, "#fff6e0", { stroke: "#c8b48a", "stroke-width": 2.5 }),
      ...[-26, -18, -10].map((y) => linie(`M${x - 84} ${y} Q${x + 6} ${y + 3} ${x + 96} ${y}`, "#e2d4b0", 2)),
      // Rücken links und Deckel oben
      pfad(`M${x - 100} -38 Q${x - 108} -18 ${x - 100} 2 L${x - 88} 2 L${x - 88} -38 Z`, "#b03a2e"),
      pfad(`M${x - 100} -38 L${x + 108} -38 L${x + 86} -74 L${x - 74} -74 Z`, "#e8543f", { stroke: "#b03a2e", "stroke-width": 3, "stroke-linejoin": "round" }),
      pfad(`M${x - 64} -66 L${x + 78} -66`, "#ffd166", { stroke: "#ffd166", "stroke-width": 3, opacity: "0.8" }),
      el("ellipse", { cx: lochX, cy: lochY, rx: 27, ry: 9, fill: "#5b2a22" }),
    ];
    if (kopfDa) {
      teile.push(group({ class: "lw-gucken", transform: `translate(${lochX} ${lochY - 22})` }, [group({ class: "lw-nicken" }, kopf(24, {}))]));
      // Der vordere Rand des Lochs liegt über dem Hals: So kommt er aus dem Buch.
      teile.push(pfad(`M${lochX - 27} ${lochY} A27 9 0 0 0 ${lochX + 27} ${lochY} L${lochX + 31} ${lochY + 12} L${lochX - 31} ${lochY + 12} Z`, "#e8543f"));
      teile.push(linie(`M${lochX - 27} ${lochY} A27 9 0 0 0 ${lochX + 27} ${lochY}`, "#b03a2e", 2.5));
    }
    return teile;
  }

  function zeichneA(stufe) {
    if (stufe === 1) {
      return group({}, [
        ...lochbuch({}),
        funkeln(92, -104, 8, "#ffd166"),
        funkeln(-40, -96, 6, "#ffd166", "lw-funkeln", -0.9),
        text(-6, -96, "?", { "font-size": 26, fill: "#7c5ce6", class: "lw-zzz" }),
      ]);
    }
    if (stufe === 10 || stufe === 11) return group({}, kokon(stufe));
    if (stufe >= 12) return group({}, falter(stufe));
    const n = [0, 0, 2, 4, 6, 7, 7, 8, 8, 8][stufe];
    const muster = {};
    if (stufe >= 4) muster.tupfen = "#ffd166";
    if (stufe >= 7) muster.streifen = (i) => (i % 2 ? "#ffe066" : "#9be36e");
    const { teile } = liegenderWurm(n, {
      r: stufe >= 7 ? 26 : 24,
      glied: muster,
      mitFuessen: stufe >= 5,
      // Das leere Buch, aus dem er gekrochen ist, liegt noch eine Weile da.
      hinten: stufe <= 3 ? () => [group({ transform: `translate(${stufe === 2 ? -40 : -96} 0) scale(0.55)` }, lochbuch({ kopfDa: false }))] : null,
      kopfO: {
        oben: stufe >= 6 ? "fuehler" : "schopf",
        mund: stufe === 8 ? "kauen" : stufe === 9 ? "gaehnen" : "laecheln",
        augen: stufe === 9 ? "zu" : "offen",
      },
      aufsatz: stufe === 9 ? schlafmuetze : null,
      buchO: { angeknabbert: stufe >= 8 },
      vorKopf: (pos, k) => {
        const extra = [];
        if (stufe === 8) {
          // Buchstaben-Krümel fallen aus dem angeknabberten Buch.
          extra.push(group({ class: "lw-kruemel" }, [
            ["a", -1.5, 1.2, "#e8543f", 0], ["M", -2.1, 0.7, "#3fa34d", -0.5], ["o", 1.3, 1.5, "#7c5ce6", -1.0],
            ["S", -1.0, 1.9, "#00a5b5", -1.5], ["i", 1.8, 0.9, "#f5a623", -0.3], ["L", -2.5, 1.6, "#ef6fa8", -1.2],
          ].map(([b, dx, dy, farbe, verzug]) => text(pos.x + k * dx, pos.y + k * dy, b, { "font-size": 21, fill: farbe, class: "lw-krume", style: `animation-delay:${verzug}s` }))));
        }
        // Neben dem Kopf, nicht darüber: Dort steht im Zimmer die Missionskarte.
        if (stufe === 9) extra.push(group({ class: "lw-zzz" }, [text(pos.x + k * 2.3, pos.y - k * 0.1, "z", { "font-size": 18, fill: "#7c8a99" }), text(pos.x + k * 2.9, pos.y - k * 0.4, "z", { "font-size": 24, fill: "#7c8a99" })]));
        return extra;
      },
    });
    return group({}, teile);
  }

  // ---------------------------------------------------------------------------
  // B – Der Lesewurm-Express
  // ---------------------------------------------------------------------------
  // Der Wurm wird ein Zug: Schaffnermütze, Räder, eine Pfeife, aus den
  // Gliedern werden Wagen, vorne raucht ein Kamin. Er lädt Bücher, nimmt einen
  // Fahrgast mit und dampft zuletzt in Regenbogenwölkchen los.
  const B_STUFEN = [
    { titel: "Ein neuer Wurm", sagt: "Ein neuer kleiner Lesewurm ist da!", ueberraschung: true },
    { titel: "Länger", sagt: "{wer} ist länger geworden!" },
    { titel: "Schaffnermütze", sagt: "{wer} hat eine Schaffnermütze. Was hat er wohl vor?", ueberraschung: true },
    { titel: "Räder", sagt: "{wer} hat Räder bekommen!", ueberraschung: true },
    { titel: "Die Pfeife", sagt: "{wer} hat eine Pfeife: Tuut!" },
    { titel: "Wagen", sagt: "Aus seinen Gliedern sind Wagen geworden!", ueberraschung: true },
    { titel: "Kupplungen", sagt: "Die Wagen haben Kupplungen und rote Puffer!" },
    { titel: "Der Kamin", sagt: "Aus der Mütze raucht ein Kamin!", ueberraschung: true },
    { titel: "Scheinwerfer", sagt: "Vorne leuchtet ein Scheinwerfer!" },
    { titel: "Bücher laden", sagt: "Die Wagen sind voller Bücher!" },
    { titel: "Ein Fahrgast", sagt: "Ein Marienkäfer fährt mit!", ueberraschung: true },
    { titel: "Schienen", sagt: "Jetzt fährt er auf Schienen!" },
    { titel: "Goldene Räder", sagt: "Die Räder sind golden!" },
    { titel: "Fahne und Lichter", sagt: "Eine Fahne und Lichter an den Wagen!" },
    { titel: "Volldampf!", sagt: "Volldampf! Der Lesewurm-Express fährt!", ueberraschung: true },
  ];
  const WAGENFARBEN = ["#e8543f", "#f5a623", "#3fa34d", "#00a5b5", "#7c5ce6", "#ef6fa8", "#2f6f8f"];

  // Bis Stufe 5 ist er ein Wurm (mit Mütze, Rädern, Pfeife), ab Stufe 6 ein
  // Zug: vorne die Lok mit seinem Kopf, dahinter drei Wagen.
  function zeichneB(stufe) {
    return stufe < 6 ? expressWurm(stufe) : expressZug(stufe);
  }

  function expressRad(x, y, gr, stufe, parkt = false) {
    const farbe = stufe >= 13 ? GOLD : "#3a3f4a";
    return group({ transform: `translate(${f(x)} ${f(y)})` }, [group({ class: stufe >= 15 && !parkt ? "lw-rad" : null }, [
      kreis(0, 0, gr, farbe, { stroke: shade(farbe, -0.3), "stroke-width": 2 }),
      ...(stufe >= 13
        ? [stern(0, 0, gr * 0.62, { fill: "#fff3b0" })]
        : [linie(`M${f(-gr * 0.6)} 0 H${f(gr * 0.6)} M0 ${f(-gr * 0.6)} V${f(gr * 0.6)}`, "#9aa3b2", 2), kreis(0, 0, gr * 0.3, "#9aa3b2")]),
    ])]);
  }

  function expressWurm(stufe) {
    const n = [0, 2, 4, 4, 5, 6][stufe];
    const raeder = stufe >= 4;
    const hub = raeder ? 12 : 0;
    const { glieder, hals } = koerper(n, { r: 24, R: 34, s: 36, hx: 52 });
    glieder.forEach((g) => { g.y -= hub; });
    const k = 31;
    const kopfPos = { x: hals.x + 8, y: hals.y - hub - k * 0.55 };
    const teile = [schatten(glieder, 10)];
    for (let i = glieder.length - 1; i >= 0; i -= 1) {
      teile.push(glied(glieder[i], i, {}));
      if (raeder) teile.push(expressRad(glieder[i].x, -9, 9, stufe));
    }
    const kopfTeile = [...kopf(k, { mund: stufe === 5 ? "pfeife" : "laecheln" })];
    if (stufe >= 3) kopfTeile.push(...schaffnermuetze(k));
    teile.push(group({ class: "lw-kopf", transform: `translate(${f(kopfPos.x)} ${f(kopfPos.y)})` }, [group({ class: "lw-nicken" }, kopfTeile)]));
    teile.push(group({ transform: `translate(${f(kopfPos.x - k * 0.15)} ${f(kopfPos.y + k * 1.0)}) rotate(-6)` }, buch(k)));
    if (stufe === 5) {
      teile.push(group({ class: "lw-tuut" }, [
        kreis(kopfPos.x + k * 1.9, kopfPos.y + k * 0.2, 9, "#eef2f6"),
        kreis(kopfPos.x + k * 2.4, kopfPos.y - k * 0.15, 12, "#eef2f6"),
        text(kopfPos.x + k * 2.5, kopfPos.y - k * 0.85, "tuut!", { "font-size": 17, fill: "#7c8a99" }),
      ]));
    }
    return group({}, teile);
  }

  //   parkt  der fertige Express auf dem Regal: die Räder stehen still, er
  //          ruckelt nicht, nur der Rauch steigt
  function expressZug(stufe, { parkt = false } = {}) {
    const hub = 14;
    const faehrt = stufe >= 15 && !parkt;
    const k = 31;
    const teile = [];
    // Die Lok: ein grüner Kessel, vorne oben sein Kopf.
    const lok = { x: 30, w: 86, h: 50 };
    const kopfPos = { x: lok.x + lok.w - 2, y: -hub - lok.h - 4 };
    const wagen = [-28, -92, -156].map((x, i) => ({ x, w: 54, h: 46, farbe: WAGENFARBEN[[0, 4, 3][i]] }));
    const links = wagen[wagen.length - 1].x;
    teile.push(el("ellipse", { cx: f((links + kopfPos.x + 40) / 2), cy: 2, rx: f((kopfPos.x + 40 - links) / 2 + 8), ry: 9, fill: "#000", opacity: "0.13" }));
    if (stufe >= 12) {
      for (let x = links - 26; x < kopfPos.x + 60; x += 22) teile.push(eck(x, -5, 12, 7, "#8d6e52", { rx: 2 }));
      teile.push(eck(links - 30, -7, kopfPos.x + 90 - links, 3.5, "#6d7480", { rx: 1.5 }));
    }
    const zug = [];
    wagen.forEach((w, i) => {
      const y = -hub - w.h;
      if (stufe >= 10) {
        [[w.x + 7, 10, 24, "#e8543f"], [w.x + 19, 9, 28, "#3fa34d"], [w.x + 30, 11, 21, "#2f6f8f"], [w.x + 43, 8, 25, "#f5a623"]]
          .forEach(([bx, bw, bh, bf]) => zug.push(eck(bx, y - bh + 3, bw, bh, bf, { rx: 2 }), eck(bx + bw * 0.2, y - bh + 8, bw * 0.6, 3, "#ffffff", { opacity: "0.55", rx: 1 })));
      }
      if (stufe >= 11 && i === wagen.length - 1) {
        // Ein Marienkäfer fährt im letzten Wagen mit und winkt.
        zug.push(group({ transform: `translate(${f(w.x + w.w / 2)} ${f(y - 2)})` }, [
          kreis(0, -12, 13, "#e8543f", { stroke: INK, "stroke-width": 2 }),
          linie("M0 -25 V1", INK, 2),
          kreis(-6, -14, 3, INK), kreis(6, -9, 3, INK), kreis(-5, -5, 2.5, INK), kreis(5, -19, 2.5, INK),
          kreis(0, -27, 7, INK),
          kreis(-2.6, -28, 1.8, "#ffffff"), kreis(2.6, -28, 1.8, "#ffffff"),
          group({ class: "lw-winken" }, [linie("M9 -20 l10 -12", INK, 2.4)]),
        ]));
      }
      zug.push(eck(w.x, y, w.w, w.h, w.farbe, { rx: 9, stroke: shade(w.farbe, -0.3), "stroke-width": 2.5 }));
      zug.push(eck(w.x - 2, y - 2, w.w + 4, 11, G, { rx: 6, stroke: GD, "stroke-width": 2 }));
      zug.push(eck(w.x + 9, y + 16, w.w - 18, 17, "#fff6e0", { rx: 5 }));
      zug.push(linie(`M${w.x + w.w / 2} ${y + 16} V${y + 33}`, shade(w.farbe, -0.2), 2.5));
      if (stufe >= 14) zug.push(...[0.2, 0.5, 0.8].map((t, j) => kreis(w.x + w.w * t, y + 3.5, 3.4, REGENBOGEN[(i * 2 + j) % REGENBOGEN.length], { class: `lese-birne lese-birne-${j}` })));
      if (stufe >= 14 && i === wagen.length - 1) {
        zug.push(linie(`M${w.x + 5} ${y - 1} V${y - 54}`, INK, 2.5));
        zug.push(pfad(`M${w.x + 6} ${y - 54} L${w.x + 38} ${y - 45} L${w.x + 6} ${y - 36} Z`, "#ffd166", { class: "lw-fahne" }));
      }
      zug.push(expressRad(w.x + 13, -11, 10, stufe, parkt), expressRad(w.x + w.w - 13, -11, 10, stufe, parkt));
      if (stufe >= 7) {
        // Kupplung zum Fahrzeug davor, mit roten Puffern
        const vorn = i === 0 ? lok.x : wagen[i - 1].x;
        const xa = w.x + w.w;
        zug.push(eck(xa - 2, -hub - 17, vorn - xa + 4, 5, INK, { rx: 2 }));
        zug.push(kreis(xa + 2, -hub - 15, 4.5, "#e8543f"), kreis(vorn - 2, -hub - 15, 4.5, "#e8543f"));
      }
    });
    // Der Kessel
    zug.push(eck(lok.x, -hub - lok.h, lok.w, lok.h, G, { rx: 18, stroke: GD, "stroke-width": 2.5 }));
    zug.push(eck(lok.x + 8, -hub - lok.h + 4, lok.w - 26, 9, shade(G, 0.28), { rx: 5 }));
    zug.push(...[lok.x + 26, lok.x + 52].map((x) => linie(`M${x} ${-hub - lok.h + 2} V${-hub - 2}`, GD, 2.5, { opacity: "0.6" })));
    zug.push(pfad(`M${lok.x + lok.w - 4} ${-hub - 8} L${lok.x + lok.w + 22} ${-2} L${lok.x + lok.w - 4} ${-2} Z`, "#e8543f", { stroke: shade("#e8543f", -0.3), "stroke-width": 2 }));
    zug.push(expressRad(lok.x + 20, -13, 12, stufe, parkt), expressRad(lok.x + lok.w - 24, -13, 12, stufe, parkt));
    if (stufe >= 9) {
      zug.push(pfad(`M${lok.x + lok.w + 4} ${-hub - 30} L${lok.x + lok.w + 110} ${-hub - 58} L${lok.x + lok.w + 110} ${-hub + 6} L${lok.x + lok.w + 4} ${-hub - 14} Z`, "url(#lw-scheinwerfer)", { opacity: "0.75" }));
      zug.push(kreis(lok.x + lok.w + 3, -hub - 22, 8, "#ffe066", { stroke: shade(GOLD, -0.3), "stroke-width": 2 }));
    }
    teile.push(group({ class: faehrt ? "lw-fahren" : null }, zug));
    const kopfTeile = [...kopf(k, {}), ...schaffnermuetze(k, stufe >= 15)];
    if (stufe >= 8) kopfTeile.push(...kamin(k, { regenbogen: stufe >= 15 }));
    teile.push(group({ class: faehrt ? "lw-fahren" : null }, [group({ class: "lw-kopf", transform: `translate(${f(kopfPos.x)} ${f(kopfPos.y)})` }, [group({ class: "lw-nicken" }, kopfTeile)])]));
    return group({}, teile);
  }

  // ---------------------------------------------------------------------------
  // C – Der Lesezauberer
  // ---------------------------------------------------------------------------
  // Das Buch beginnt zu leuchten, Buchstaben steigen auf, und der Wurm wird ein
  // Zauberer: Hut, Zauberstift, Umhang, eine Eule als Freundin. Zuletzt
  // schwebt er auf einem fliegenden Teppich unter einem Regenbogen aus
  // Buchstaben.
  const C_STUFEN = [
    { titel: "Noch ein neuer Wurm", sagt: "Noch ein neuer kleiner Lesewurm ist da!", ueberraschung: true },
    { titel: "Das Buch leuchtet", sagt: "Sein Buch leuchtet!", ueberraschung: true },
    { titel: "Buchstaben steigen auf", sagt: "Aus dem Buch schweben Buchstaben!", ueberraschung: true },
    { titel: "Der Zauberhut", sagt: "{wer} hat einen Zauberhut!" },
    { titel: "Sternenglieder", sagt: "Auf seinen Gliedern funkeln Sterne!" },
    { titel: "Der Zauberstift", sagt: "{wer} hat einen Zauberstift!", ueberraschung: true },
    { titel: "Der Zauberschal", sagt: "{wer} hat einen Zauberschal!" },
    { titel: "Eule Ella", sagt: "Eule Ella ist zu Besuch!", ueberraschung: true },
    { titel: "Das Buch schwebt", sagt: "Sein Buch schwebt!" },
    { titel: "Sternenkreis", sagt: "Sterne kreisen um ihn!" },
    { titel: "Regenbogenglieder", sagt: "Er schimmert in allen Farben!", ueberraschung: true },
    { titel: "Er schwebt", sagt: "{wer} schwebt!" },
    { titel: "Fliegender Teppich", sagt: "Ein fliegender Teppich!", ueberraschung: true },
    { titel: "Goldene Brille", sagt: "{wer} hat eine goldene Brille!" },
    { titel: "Regenbogen aus Buchstaben", sagt: "Ein Regenbogen aus Buchstaben! Alle drei Lesewürmer sind fertig.", ueberraschung: true },
  ];

  function eule(hut = false) {
    return group({ class: "lw-eule" }, [
      el("ellipse", { cx: 0, cy: 0, rx: 20, ry: 24, fill: "#a0785a", stroke: "#6e4f38", "stroke-width": 2 }),
      el("ellipse", { cx: 0, cy: 6, rx: 12, ry: 15, fill: "#e8d3b0" }),
      kreis(-8, -9, 8, "#ffffff", { stroke: "#6e4f38", "stroke-width": 1.5 }), kreis(8, -9, 8, "#ffffff", { stroke: "#6e4f38", "stroke-width": 1.5 }),
      kreis(-7, -8, 4, INK, { class: "lw-auge" }), kreis(7, -8, 4, INK, { class: "lw-auge" }),
      pfad("M-3 -2 L3 -2 L0 4 Z", "#f5a623"),
      pfad("M-14 -20 L-10 -30 L-5 -21 Z M14 -20 L10 -30 L5 -21 Z", "#a0785a"),
      ...(hut ? [pfad("M-9 -24 L1 -52 L10 -24 Z", "#4c63d2"), stern(1, -34, 4, { fill: "#fff3b0" })] : []),
      pfad("M-6 22 l-3 6 M0 23 v6 M6 22 l3 6", "none", { stroke: "#f5a623", "stroke-width": 2.5, "stroke-linecap": "round" }),
    ]);
  }

  function zeichneC(stufe) {
    const n = [0, 2, 4, 4, 4, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6][stufe];
    const schwebt = stufe >= 12;
    const muster = {};
    if (stufe >= 5) muster.sternchen = true;
    if (stufe >= 11) muster.farbe = (i) => REGENBOGEN[i % REGENBOGEN.length];
    if (stufe >= 11) muster.rand = "#5b6bbf";
    const k = 31;
    const { teile, glieder, kopfPos } = liegenderWurm(n, {
      glied: muster,
      kopfO: { goldbrille: stufe >= 14 },
      aufsatz: stufe >= 4 ? (kk) => zauberhut(kk, { mond: stufe >= 11 }) : null,
      buchO: stufe >= 9 ? false : { leuchtet: stufe >= 2 },
      amHals: (pos, kk) => {
        if (stufe < 7) return [];
        // Der Zauberschal: um den Hals, die Enden flattern nach hinten.
        const lila = "#7c5ce6";
        const dunkel = "#5a3fc0";
        const ende = (dx, dy, verzug) => group({ class: "lw-schalende", style: `animation-delay:${verzug}s` }, [
          pfad(`M${f(pos.x - kk * 0.72)} ${f(pos.y + kk * 0.66)} Q${f(pos.x - kk * 1.2)} ${f(pos.y + kk * 0.9)} ${f(pos.x - kk * dx)} ${f(pos.y + kk * dy)} L${f(pos.x - kk * (dx - 0.36))} ${f(pos.y + kk * (dy + 0.12))} Q${f(pos.x - kk * 0.95)} ${f(pos.y + kk * 1.0)} ${f(pos.x - kk * 0.45)} ${f(pos.y + kk * 0.86)} Z`, lila, { stroke: dunkel, "stroke-width": 2 }),
          linie(`M${f(pos.x - kk * dx)} ${f(pos.y + kk * dy)} l-4 7 M${f(pos.x - kk * (dx - 0.18))} ${f(pos.y + kk * (dy + 0.06))} l-2 8 M${f(pos.x - kk * (dx - 0.36))} ${f(pos.y + kk * (dy + 0.12))} l0 8`, "#ffd166", 2.5),
        ]);
        return [
          ende(2.0, 1.25, 0), ende(1.75, 1.6, -0.5),
          linie(`M${f(pos.x - kk * 0.92)} ${f(pos.y + kk * 0.5)} Q${f(pos.x)} ${f(pos.y + kk * 1.22)} ${f(pos.x + kk * 0.92)} ${f(pos.y + kk * 0.5)}`, lila, kk * 0.42),
          linie(`M${f(pos.x - kk * 0.92)} ${f(pos.y + kk * 0.5)} Q${f(pos.x)} ${f(pos.y + kk * 1.22)} ${f(pos.x + kk * 0.92)} ${f(pos.y + kk * 0.5)}`, dunkel, 2, { opacity: "0.5", transform: `translate(0 ${f(kk * 0.2)})` }),
          pfad(`M${f(pos.x + kk * 0.38)} ${f(pos.y + kk * 0.78)} a5 5 0 1 0 4 7 a3.6 3.6 0 1 1 -4 -7 Z`, "#ffe58a"),
          pfad(`M${f(pos.x - kk * 0.42)} ${f(pos.y + kk * 0.8)} a5 5 0 1 0 4 7 a3.6 3.6 0 1 1 -4 -7 Z`, "#ffe58a"),
        ];
      },
      vorKopf: (pos, kk, gl) => {
        const extra = [];
        if (stufe >= 9) {
          extra.push(group({ class: "lw-schwebebuch" }, [group({ transform: `translate(${f(pos.x - kk * 1.55)} ${f(pos.y + kk * 0.1)}) rotate(-10)` }, buch(kk * 0.95, { leuchtet: true }))]));
        }
        if (stufe >= 3) {
          const bx = stufe >= 9 ? pos.x - kk * 1.55 : pos.x - kk * 0.15;
          const by = stufe >= 9 ? pos.y + kk * 0.1 : pos.y + kk * 1.0;
          extra.push(group({ class: "lw-aufsteigen" }, [
            text(bx - 30, by - 10, "A", { "font-size": 26, fill: "#e8543f", class: "lw-buchstabe" }),
            text(bx - 4, by - 18, "b", { "font-size": 23, fill: "#3fa34d", class: "lw-buchstabe", style: "animation-delay:-0.9s" }),
            text(bx - 52, by - 4, "M", { "font-size": 22, fill: "#7c5ce6", class: "lw-buchstabe", style: "animation-delay:-1.8s" }),
          ]));
        }
        if (stufe >= 6) {
          // Der Zauberstift in der Hand
          extra.push(group({ transform: `translate(${f(pos.x + kk * 0.9)} ${f(pos.y + kk * 0.9)}) rotate(-38)` }, [
            eck(-4, -2, 8, 44, "#ffd166", { rx: 2, stroke: "#c98a3f", "stroke-width": 1.5 }),
            eck(-4, 36, 8, 8, "#ef6fa8", { rx: 2 }),
            pfad("M-4 -2 L0 -12 L4 -2 Z", "#e8c59a"),
            stern(0, -20, 10, { fill: GOLD, stroke: shade(GOLD, -0.3), "stroke-width": 1.2, class: "lw-stabstern" }),
          ]));
          extra.push(funkeln(pos.x + kk * 1.9, pos.y - kk * 0.3, 7, "#ffd166"), funkeln(pos.x + kk * 2.4, pos.y + kk * 0.3, 5, "#ffffff", "lw-funkeln", -0.6));
        }
        if (stufe >= 10) {
          extra.push(group({ transform: `translate(${f(pos.x)} ${f(pos.y - kk * 0.2)})` }, [group({ class: "lw-kreisen" }, [
            stern(kk * 1.55, 0, 7, { fill: "#ffd166" }), stern(-kk * 1.55, 0, 6, { fill: "#a78bfa" }), stern(0, -kk * 1.5, 6, { fill: "#6ec6ff" }), stern(0, kk * 1.5, 5, { fill: "#ff8fab" }),
          ])]));
        }
        return extra;
      },
    });
    const ganz = [];
    if (stufe >= 13) {
      // Der fliegende Teppich: eine Buchseite mit Fransen
      const xs = glieder.map((g) => g.x);
      const links = Math.min(...xs) - 30;
      const rechts = kopfPos.x + 44;
      ganz.push(group({ class: "lw-teppich" }, [
        pfad(`M${links} 6 Q${(links + rechts) / 2} -4 ${rechts} 6 L${rechts - 6} 20 Q${(links + rechts) / 2} 12 ${links + 6} 20 Z`, "#fff6e0", { stroke: "#c8935a", "stroke-width": 3 }),
        linie(`M${links + 30} 9 h40 M${links + 90} 7 h50 M${links + 160} 7 h40`, "#b7c0cc", 2.5),
        ...[links, rechts].flatMap((x) => [0, 6, 12].map((dy) => linie(`M${x} ${8 + dy} l${x === links ? -9 : 9} 2`, "#e8543f", 2.5))),
      ]));
    }
    // Er schwebt nur ein wenig: Mit dem Zauberhut reichte er sonst im Zimmer
    // bis in die Missionskarte über ihm.
    const wurm = group({ class: schwebt ? "lw-schweben" : null, transform: schwebt ? "translate(0 -10)" : null }, [...ganz, ...teile]);
    const alles = [];
    if (stufe >= 15) {
      // Regenbogen aus Buchstaben über dem Sofa – hoch und schmal: So reicht
      // er im Zimmer weder links ans Namensschild noch oben an die Pinnwand.
      const bogen = [];
      const woerter = "ABCDEFGHIJKLMNOP".split("");
      REGENBOGEN.forEach((farbe, ring) => {
        const rx = 160 - ring * 12;
        const ry = 150 - ring * 12;
        bogen.push(pfad(`M${-rx} -10 A${rx} ${ry} 0 0 1 ${rx} -10`, "none", { stroke: farbe, "stroke-width": 11, opacity: "0.55" }));
      });
      woerter.forEach((b, i) => {
        const t = Math.PI * (0.06 + 0.88 * (i / (woerter.length - 1)));
        bogen.push(text(-Math.cos(t) * 147, -10 - Math.sin(t) * 137 + 7, b, { "font-size": 20, fill: "#ffffff", stroke: "#7c5ce6", "stroke-width": 0.8, class: "lw-funkeln", style: `animation-delay:${-i * 0.2}s` }));
      });
      alles.push(group({ class: "lw-regenbogen" }, bogen));
    }
    if (stufe >= 8) alles.push(group({ transform: "translate(-150 -8)" }, [eule(stufe >= 14)]));
    alles.push(wurm);
    if (schwebt) alles.unshift(el("ellipse", { cx: 0, cy: 2, rx: 120, ry: 8, fill: "#a78bfa", opacity: "0.25", class: "lw-falterschatten" }));
    return group({}, alles);
  }

  // ---------------------------------------------------------------------------
  // Die Hauptmission: die Missionskarte mit ihrer Leiste
  // ---------------------------------------------------------------------------
  // Die Sprechblase zeigt, was als Nächstes dran ist: das Bild des Spiels,
  // sein Name, und ein grüner Knopf wie vor jeder Runde. Ausschnitt um den
  // Zipfel unten links (0, 0), der zum Kopf des Wurms zeigt.
  //   bild, name   das Spiel, das als Nächstes dran ist
  //   hat, braucht so viele Buchstaben liegen in der Leiste, so viele braucht
  //                es bis zur nächsten Stufe (0: alles geschafft, keine Leiste)
  //   neuAb        die Felder ab hier sind neu und springen hinein
  //   geschenkAuf  das Geschenk geht auf (die Verwandlung beginnt)
  //   zu           die Schnupperrunde des Spiels ist verbraucht: ein Schloss
  //                am Knopf, wie an den Dingen im Zimmer
  function sprechblase({ bild = "🥁", name = "Silbenzug", hat = 0, braucht = 0, breite = 236, neuAb = Infinity, geschenkAuf = false, zu = false } = {}) {
    const leiste = braucht > 0;
    const h = leiste ? 110 : 76;
    const x0 = -24;
    const y0 = -h - 40;
    // Lange Namen (Buchstabenhaus, Buchstaben-Signal) werden kleiner und nie
    // breiter als der Platz zwischen Bild und Knopf.
    const schrift = name.length > 15 ? 12 : name.length > 13 ? 14 : name.length > 10 ? 16 : 19;
    const teile = [
      el("ellipse", { cx: x0 + breite / 2, cy: y0 + h + 6, rx: breite / 2 - 10, ry: 8, fill: "#000", opacity: "0.06" }),
      pfad(`M0 0 L${x0 + 40} ${y0 + h - 3} L${x0 + 80} ${y0 + h - 3} Z`, "#ffffff", { stroke: "#e0cfa8", "stroke-width": 3, "stroke-linejoin": "round" }),
      eck(x0, y0, breite, h, "#ffffff", { rx: 28, stroke: "#e0cfa8", "stroke-width": 3 }),
      pfad(`M2.5 -3 L${x0 + 42} ${y0 + h - 6} L${x0 + 78} ${y0 + h - 6} Z`, "#ffffff"),
      Object.assign(el("text", { x: x0 + 38, y: y0 + 53, "text-anchor": "middle", "font-size": 40 }), { textContent: bild }),
      text(x0 + 117, y0 + 46, name, { "font-size": schrift, fill: INK, class: "lw-missionsname", ...(name.length > 13 ? { textLength: 108, lengthAdjust: "spacingAndGlyphs" } : {}) }),
      group({ transform: `translate(${x0 + breite - 36} ${y0 + 38})` }, [group({ class: "lw-los" }, [
        kreis(0, 0, 25, "#3fbf74", { stroke: "#2f9e5c", "stroke-width": 2.5 }),
        pfad("M-7 -11 L12 0 L-7 11 Z", "#ffffff"),
      ]), ...(zu ? [group({ class: "lw-schloss", transform: "translate(18 -18)" }, [
        kreis(0, 0, 13, "#ffd166", { stroke: "#b8860b", "stroke-width": 2 }),
        pfad("M-4.5 -2 v-3 a4.5 4.5 0 0 1 9 0 v3", "none", { stroke: "#5b3a29", "stroke-width": 2.2 }),
        eck(-6, -2.5, 12, 9, "#5b3a29", { rx: 2 }),
      ])] : [])]),
    ];
    if (leiste) {
      // Die Leiste: ein Feld je Portion bis zur nächsten Stufe, gefüllte mit
      // einem Buchstaben, am Ende das Geschenk mit der Überraschung.
      const farben = ["#e8543f", "#f5a623", "#3fa34d", "#00a5b5", "#7c5ce6", "#ef6fa8", "#2f6f8f", "#e8543f"];
      const buchst = "AMOLSIRE";
      const platz = breite - 44 - 44;
      const feld = Math.min(24, (platz - (braucht - 1) * 5) / braucht);
      const yL = y0 + 82;
      teile.push(eck(x0 + 14, yL - 15, breite - 28, 30, "#f6efe2", { rx: 15 }));
      for (let i = 0; i < braucht; i += 1) {
        const x = x0 + 24 + i * (feld + 5);
        if (i < hat) {
          teile.push(group({ transform: `translate(${f(x + feld / 2)} ${yL}) rotate(${((i * 37) % 16) - 8})` }, [group({ class: i >= neuAb ? "lw-feld-neu" : null, style: i >= neuAb ? `animation-delay:${(i - neuAb) * 0.18}s` : null }, [
            eck(-feld / 2, -feld / 2, feld, feld, farben[i % farben.length], { rx: 5 }),
            text(0, feld * 0.28, buchst[i % buchst.length], { "font-size": f(feld * 0.7), fill: "#ffffff" }),
          ])]));
        } else {
          teile.push(eck(x, yL - feld / 2, feld, feld, "#ffffff", { rx: 5, stroke: "#d8cbb0", "stroke-width": 2, "stroke-dasharray": "4 3" }));
        }
      }
      const gx = x0 + breite - 34;
      teile.push(group({ transform: `translate(${gx} ${yL + 1})` }, [group({ class: geschenkAuf ? "lw-geschenk lw-geschenk-auf" : hat >= braucht - 1 ? "lw-geschenk lw-geschenk-bald" : "lw-geschenk" }, [
        eck(-14, -8, 28, 20, "#e8543f", { rx: 3 }),
        eck(-16, -14, 32, 8, "#ff6b5b", { rx: 3 }),
        eck(-3, -14, 6, 26, "#ffd166"),
        pfad("M0 -14 q-10 -12 -13 -4 q2 5 13 4 Z M0 -14 q10 -12 13 -4 q-2 5 -13 4 Z", "#ffd166"),
        text(0, 9, "?", { "font-size": 13, fill: "#ffffff" }),
      ])]));
    }
    return group({ class: "lw-blase", "data-hat": leiste ? hat : 0, "data-braucht": braucht, "data-zu": zu ? "1" : null }, teile);
  }

  // Der Knall bei der Verwandlung: Sterne und Buchstaben fliegen auseinander.
  function knall() {
    const farben = ["#ffd166", "#ef6fa8", "#6ec6ff", "#8bd36b", "#ffffff", "#a78bfa"];
    const teile = [kreis(0, 0, 70, "url(#lw-buchlicht)", { class: "lw-blitz" })];
    for (let i = 0; i < 14; i += 1) {
      const w = (Math.PI * 2 * i) / 14;
      const weit = 110 + (i % 3) * 30;
      const dx = Math.round(Math.cos(w) * weit);
      const dy = Math.round(Math.sin(w) * weit * 0.75);
      const stil = `--dx:${dx}px;--dy:${dy}px;animation-delay:${(i % 4) * 0.04}s`;
      teile.push(i % 3 === 0
        ? text(0, 6, "ABCDEFGHIJKLMNOP"[i], { "font-size": 22, fill: farben[i % farben.length], class: "lw-knall-teil", style: stil, stroke: "#7c5ce6", "stroke-width": 0.6 })
        : stern(0, 0, 9 + (i % 2) * 4, { fill: farben[i % farben.length], class: "lw-knall-teil", style: stil }));
    }
    return group({ class: "lw-knall" }, teile);
  }

  // Die Verläufe und Formen, die die Zeichnungen brauchen. Einmal ins SVG.
  function defs() {
    const verlauf = (id, farben) => el("linearGradient", { id, x1: "0", y1: "0", x2: "1", y2: "1" }, farben.map((c, i) => el("stop", { offset: String(i / (farben.length - 1)), "stop-color": c })));
    return el("defs", {}, [
      el("radialGradient", { id: "lw-buchlicht", cx: "50%", cy: "50%", r: "50%" }, [
        el("stop", { offset: "0", "stop-color": "#fff3b0", "stop-opacity": "0.95" }),
        el("stop", { offset: "1", "stop-color": "#fff3b0", "stop-opacity": "0" }),
      ]),
      el("linearGradient", { id: "lw-scheinwerfer", x1: "0", y1: "0", x2: "1", y2: "0" }, [
        el("stop", { offset: "0", "stop-color": "#fff3b0", "stop-opacity": "0.9" }),
        el("stop", { offset: "1", "stop-color": "#fff3b0", "stop-opacity": "0" }),
      ]),
      el("radialGradient", { id: "lw-buehne", cx: "50%", cy: "55%", r: "50%" }, [
        el("stop", { offset: "0", "stop-color": "#fff1b8", "stop-opacity": "0.9" }),
        el("stop", { offset: "0.6", "stop-color": "#ffe8a0", "stop-opacity": "0.35" }),
        el("stop", { offset: "1", "stop-color": "#ffe8a0", "stop-opacity": "0" }),
      ]),
      verlauf("lw-fluegel-0", ["#ff8fab", "#ffd166", "#6ee7a8"]),
      verlauf("lw-fluegel-1", ["#6ec6ff", "#a78bfa", "#ff8fab"]),
      verlauf("lw-fluegel-2", ["#ffd166", "#ff8fab"]),
      verlauf("lw-fluegel-3", ["#a78bfa", "#6ec6ff"]),
    ]);
  }

  // Die drei Leben, in dieser Reihenfolge.
  //   massstab, versatz  so gross und so weit verschoben sitzt er auf dem Sofa
  //            (der Lesezauberer etwas kleiner: Sein Hut bliebe sonst nicht
  //            unter der Missionskarte)
  //   wechsel  was der Lautsprecher sagt, wenn er fertig aufs Regal zieht
  const LEBEN = [
    { id: "falter", name: "Lesefalter", stufen: A_STUFEN, zeichne: zeichneA, massstab: 1.2, versatz: 8,
      wechsel: "Der Lesefalter fliegt aufs Regal – und schau: Ein neuer kleiner Lesewurm ist da!" },
    { id: "express", name: "Lesewurm-Express", stufen: B_STUFEN, zeichne: zeichneB, massstab: 1.1, versatz: 0,
      wechsel: "Der Lesewurm-Express fährt aufs Regal – und schau: Noch ein neuer kleiner Lesewurm ist da!" },
    { id: "zauberer", name: "Lesezauberer", stufen: C_STUFEN, zeichne: zeichneC, massstab: 1.1, versatz: 8, wechsel: "" },
  ];

  // Der Wurm in einem Leben und einer Stufe, für das Sofa: (0, 0) auf dem
  // Sitz, schon so gross, wie er dort sitzt.
  function zeichne(leben = 0, stufe = 1) {
    const l = LEBEN[Math.max(0, Math.min(LEBEN.length - 1, leben))];
    const st = Math.max(1, Math.min(15, Math.round(stufe) || 1));
    return group({ class: `lesewurm lw-wurm lw-${l.id}`, "data-leben": l.id, "data-stufe": st, transform: `translate(${l.versatz} 0) scale(${l.massstab})` }, [
      group({ class: "lw-wurm-inhalt" }, [l.zeichne(st)]),
    ]);
  }

  // Die fertigen Würmer auf dem Bücherregal: zuerst der Lesefalter, nach dem
  // zweiten Leben daneben der Lesewurm-Express. Ausschnitt des Regals: das
  // obere Brett von (0, 0) bis (230, 0) – train-leseecke legt die Vitrine
  // ins Regal, damit sie mit ihm hüpft.
  //   regal  so viele fertige Würmer (0 bis 2)
  //   neu    der zuletzt eingezogene funkelt
  function vitrine(regal = 0, { neu = false } = {}) {
    if (regal < 1) return null;
    const teile = [];
    const falterX = regal >= 2 ? 76 : 116;
    teile.push(group({ class: `lw-vitrine-falter${neu && regal === 1 ? " is-neu" : ""}`, "data-regal": "falter", transform: `translate(${falterX} 0) scale(0.36)` }, falter(15, { sitzt: true })));
    if (regal >= 2) {
      teile.push(group({ class: `lw-vitrine-express${neu ? " is-neu" : ""}`, "data-regal": "express", transform: "translate(174 0) scale(0.3)" }, [expressZug(15, { parkt: true })]));
    }
    return group({ class: "lw-vitrine", "aria-hidden": "true" }, teile);
  }

  // Was der Lautsprecher zu einer Stufe sagt, mit dem Namen des Wurms.
  function sagt(leben, stufe, name = "") {
    const text = LEBEN[leben]?.stufen[stufe - 1]?.sagt || "";
    // {wer} steht immer am Anfang eines Satzes.
    return text.replace(/\{wer\}/g, name || "Dein Lesewurm");
  }

  window.LernappLeseWurm = { LEBEN, zeichne, vitrine, sagt, sprechblase, knall, defs };
})();
