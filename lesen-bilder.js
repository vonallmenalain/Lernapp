/*
 * lesen-bilder.js – Die Bilder der Bücher.
 *
 * Jede Seite eines Buches (lesen-buecher.js) beschreibt ihr Bild als Daten:
 * die Landschaft dahinter (train-scenes.js), Tiere aus dem Zug
 * (train-art.js, buildPassenger), Emoji und ein paar eigene Zeichnungen.
 * Hier wird daraus ein SVG – für das Bücherregal (buecher.js) und den
 * Geschichtenzug (geschichtenzug.js), damit dasselbe Buch überall gleich
 * aussieht.
 *
 * Ein Bild ist 240 × 152 gross – doppelt so gross wie die Vorschau einer
 * Landschaft, die darin den Hintergrund gibt. Der Boden liegt bei 136.
 */
(() => {
  "use strict";

  const art = window.LernappLeseArt;
  const zugArt = window.LernappTrainArt;
  const szenen = window.LernappScenes;
  if (!art || !zugArt) return;

  const W = 240;
  const H = 152;
  const BODEN = 136;

  let bildNr = 0;

  function emoji(zeichen, x, y, s, dreh = 0) {
    const text = art.el("text", { x, y, "font-size": s, "text-anchor": "middle", "dominant-baseline": "central", class: "bu-emoji", transform: dreh ? `rotate(${dreh} ${x} ${y})` : null });
    text.textContent = zeichen;
    return text;
  }

  // Was es nicht als Emoji gibt.
  const ZEICHNUNGEN = {
    // Ein Stück Hauswand mit einem grossen Fenster. Mitte bei (0, 0).
    fenster: ({ licht = true }) => [
      licht ? art.el("ellipse", { cx: 0, cy: 0, rx: 100, ry: 78, fill: "url(#bu-schein)" }) : null,
      art.el("rect", { x: -64, y: -50, width: 128, height: 100, rx: 8, fill: "#e9d3ae", stroke: "#c8935a", "stroke-width": 3 }),
      art.el("rect", { x: -48, y: -36, width: 96, height: 66, rx: 7, fill: licht ? "#ffe9a8" : "#2c3f5c", stroke: "#8a5a35", "stroke-width": 5 }),
      art.el("path", { d: "M-45 -33 q12 30 0 60 l-0 -60 Z M45 -33 q-12 30 0 60 Z", fill: "#e8543f", opacity: "0.85" }),
      art.el("rect", { x: -56, y: 30, width: 112, height: 9, rx: 3, fill: "#8a5a35" }),
    ].filter(Boolean),
    // Ein Felsbuckel mit einer dunklen Öffnung. Boden bei (0, 0).
    hoehle: () => [
      art.el("path", { d: "M-118 0 Q-112 -92 -10 -104 Q104 -96 118 0 Z", fill: "#8a8f99" }),
      art.el("path", { d: "M-86 -40 Q-60 -80 -20 -84 M40 -78 Q80 -64 92 -30", stroke: "#a3a9b3", "stroke-width": 6, fill: "none", "stroke-linecap": "round" }),
      art.el("path", { d: "M-70 0 Q-64 -66 0 -70 Q64 -66 70 0 Z", fill: "#3a3f4a" }),
    ],
    // Eine Pfütze auf dem Boden. Mitte bei (0, 0).
    pfuetze: () => [
      art.el("ellipse", { cx: 0, cy: 0, rx: 46, ry: 9, fill: "#6fb7e6" }),
      art.el("ellipse", { cx: -12, cy: -2, rx: 18, ry: 3, fill: "#c4e6f8", opacity: "0.85" }),
      art.el("ellipse", { cx: 20, cy: 2, rx: 8, ry: 1.6, fill: "#c4e6f8", opacity: "0.7" }),
    ],
    // Eine Staffelei mit Leinwand. Was darauf gemalt ist, sind Dinge davor
    // (vorne); die Leinwand liegt um (0, -57). Boden bei (0, 0).
    staffelei: () => [
      art.el("path", { d: "M-26 0 L-6 -98 M26 0 L6 -98 M0 -30 L0 6", stroke: "#8a5a35", "stroke-width": 5, "stroke-linecap": "round" }),
      art.el("rect", { x: -37, y: -88, width: 74, height: 60, rx: 3, fill: "#ffffff", stroke: "#c8935a", "stroke-width": 3 }),
      art.el("rect", { x: -42, y: -29, width: 84, height: 6, rx: 2, fill: "#8a5a35" }),
    ],
    // Ein Seerosenblatt auf dem Wasser, mit einer Blüte. Mitte bei (0, 0).
    seerose: () => [
      art.el("ellipse", { cx: 0, cy: 3, rx: 56, ry: 9, fill: "#5aa9d6", opacity: "0.55" }),
      art.el("ellipse", { cx: 0, cy: 0, rx: 44, ry: 10, fill: "#4caf50" }),
      art.el("path", { d: "M0 0 L44 -3 L44 4 Z", fill: "#5aa9d6" }),
      art.el("path", { d: "M-30 -3 Q-6 -8 22 -3", stroke: "#3d9440", "stroke-width": 1.5, fill: "none" }),
      art.el("circle", { cx: -28, cy: -6, r: 5, fill: "#f7a8c8" }),
      art.el("circle", { cx: -23, cy: -9, r: 4, fill: "#f48fb1" }),
      art.el("circle", { cx: -25, cy: -6, r: 2.5, fill: "#ffd166" }),
    ],
    // Ein Schneemann: Bauch und Kopf. Fertig hat er Augen aus Steinen und
    // Arme aus Ästen; die Nase ist ein Rüebli – solange sie niemand isst.
    // Boden bei (0, 0).
    schneemann: ({ augen = false, nase = false }) => [
      art.el("ellipse", { cx: 0, cy: 1, rx: 32, ry: 5, fill: "#000000", opacity: "0.08" }),
      augen ? art.el("path", { d: "M-24 -42 L-46 -58 M24 -42 L46 -60 M-40 -54 L-44 -64 M40 -55 L45 -64", stroke: "#8a5a35", "stroke-width": 3, "stroke-linecap": "round" }) : null,
      art.el("circle", { cx: 0, cy: -27, r: 28, fill: "#ffffff", stroke: "#d6e2ee", "stroke-width": 2 }),
      art.el("circle", { cx: 0, cy: -71, r: 19, fill: "#ffffff", stroke: "#d6e2ee", "stroke-width": 2 }),
      augen ? art.el("circle", { cx: -7, cy: -75, r: 3, fill: "#4a5060" }) : null,
      augen ? art.el("circle", { cx: 7, cy: -75, r: 3, fill: "#4a5060" }) : null,
      nase ? art.el("path", { d: "M0 -70 L19 -66 L0 -63 Z", fill: "#f28c28" }) : null,
    ].filter(Boolean),
    // Ein grosses Blatt, über den Kopf gehalten ein Schirm. Mitte des Bogens
    // bei (0, 0), der Stiel zeigt nach unten bis zur Hand.
    blatt: () => [
      art.el("path", { d: "M0 -2 L3 34", stroke: "#3d8b40", "stroke-width": 3, "stroke-linecap": "round" }),
      art.el("path", { d: "M-42 8 Q-38 -26 0 -30 Q38 -26 42 8 Q21 0 0 8 Q-21 0 -42 8 Z", fill: "#4caf50" }),
      art.el("path", { d: "M0 -28 L0 6 M0 -16 L-24 -6 M0 -16 L24 -6 M0 -4 L-32 4 M0 -4 L32 4", stroke: "#2e7d32", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }),
    ],
    // Eine Fliege mit durchsichtigen Flügeln. Mitte bei (0, 0).
    fliege: () => [
      art.el("ellipse", { cx: -5, cy: -6, rx: 6, ry: 4, fill: "#e3f3fc", stroke: "#9cc4dc", "stroke-width": 0.8, opacity: "0.95" }),
      art.el("ellipse", { cx: 5, cy: -6, rx: 6, ry: 4, fill: "#e3f3fc", stroke: "#9cc4dc", "stroke-width": 0.8, opacity: "0.95" }),
      art.el("ellipse", { cx: 0, cy: 0, rx: 7, ry: 4.5, fill: "#2b2f38" }),
      art.el("circle", { cx: 6, cy: -1, r: 2.6, fill: "#b03a2e" }),
    ],
    // Ein rotes Velo von der Seite. Boden bei (0, 0), etwa 72 breit und 44
    // hoch; der Sattel liegt bei (-9, -38). Wer darauf fährt, steht dahinter,
    // das Velo davor (vorne).
    velo: () => {
      const rad = (cx) => [
        art.el("circle", { cx, cy: -13, r: 12.5, fill: "none", stroke: "#3a4250", "stroke-width": 3 }),
        art.el("path", { d: `M${cx - 11} -13 H${cx + 11} M${cx} -24 V-2 M${cx - 8} -21 L${cx + 8} -5 M${cx + 8} -21 L${cx - 8} -5`, stroke: "#9aa3b0", "stroke-width": 1 }),
        art.el("circle", { cx, cy: -13, r: 2.2, fill: "#3a4250" }),
      ];
      return [
        ...rad(-22), ...rad(22),
        art.el("path", { d: "M-22 -13 L-1 -13 L-7 -31 Z M-1 -13 L15 -31 L-7 -31 M15 -31 L22 -13", fill: "none", stroke: "#e8543f", "stroke-width": 3.4, "stroke-linejoin": "round", "stroke-linecap": "round" }),
        art.el("path", { d: "M-7 -31 L-9 -37", stroke: "#3a4250", "stroke-width": 2.6, "stroke-linecap": "round" }),
        art.el("path", { d: "M-16 -38 Q-9 -41 -2 -38 Q-9 -36 -16 -38 Z", fill: "#3a4250", stroke: "#3a4250", "stroke-width": 2, "stroke-linejoin": "round" }),
        art.el("path", { d: "M15 -31 L13 -40 L20 -42", fill: "none", stroke: "#3a4250", "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" }),
        art.el("circle", { cx: -1, cy: -13, r: 3, fill: "#3a4250" }),
      ];
    },
    // Ein Stapel Bambusstangen, von der Seite; stangen: wie viele (1 bis 8).
    // Boden bei (0, 0), etwa 92 breit.
    bambus: ({ stangen = 6 }) => {
      const teile = [];
      for (let i = 0; i < stangen; i += 1) {
        const y = -8 - i * 7;
        const x = i % 2 ? -38 : -46;
        teile.push(art.el("rect", { x, y, width: 84, height: 8, rx: 4, fill: i % 2 ? "#8bc34a" : "#7cb342", stroke: "#558b2f", "stroke-width": 1.2 }));
        teile.push(art.el("path", { d: `M${x + 24} ${y + 1} v6 M${x + 54} ${y + 1} v6`, stroke: "#558b2f", "stroke-width": 1.5 }));
      }
      const oben = -8 - (stangen - 1) * 7;
      teile.push(art.el("path", { d: `M8 ${oben} q12 -12 26 -9 q-12 3 -26 9 Z`, fill: "#66bb6a" }));
      teile.push(art.el("path", { d: `M2 ${oben} q-8 -13 -22 -12 q10 4 22 12 Z`, fill: "#4caf50" }));
      return teile;
    },
    // Ein Stein zum Draufsitzen. Boden bei (0, 0), etwa 64 breit und 28 hoch.
    stein: () => [
      art.el("path", { d: "M-32 0 Q-36 -20 -14 -27 Q8 -33 26 -21 Q36 -10 32 0 Z", fill: "#9aa0a8" }),
      art.el("path", { d: "M-18 -20 Q-4 -27 12 -23", stroke: "#c2c7ce", "stroke-width": 3, fill: "none", "stroke-linecap": "round" }),
    ],
    // Ein Wahrzeichen der Reise (train-art.js, buildLandmark): windmill,
    // treehouse, lighthouse, temple, hut, observatory, rocket, baobab – so
    // spielen Bücher an Orten, die das Kind von der Reise kennt.
    // licht: die Fenster leuchten; aus: die Lampe oben ist dunkel (der
    // Leuchtturm ohne Licht). Boden bei (0, 0).
    wahrzeichen: ({ id, licht = false, aus = false }) => {
      const bau = zugArt.buildLandmark(id);
      if (licht) bau.classList.add("is-lit");
      if (aus) {
        bau.querySelectorAll(".journey-lantern").forEach((lampe) => lampe.setAttribute("fill", "#5b6070"));
        bau.querySelectorAll(".journey-beam").forEach((strahl) => strahl.remove());
      }
      return [bau];
    },
  };

  // dreh: schief, in Grad – ein Blatt, das am Boden liegt.
  function zeichnung(z) {
    const teile = ZEICHNUNGEN[z.z]?.(z);
    if (!teile) return null;
    return art.group({ transform: `translate(${z.x} ${z.y})${z.dreh ? ` rotate(${z.dreh})` : ""} scale(${z.s || 1})` }, teile);
  }

  // Ein Tier aus dem Zug, auf dem Boden oder wo y sagt. Mit Denkblase, wenn es
  // an etwas denkt.
  function figur(f) {
    const s = f.s || 1.5;
    const y = f.y ?? BODEN;
    const dreh = f.dreh ? ` rotate(${f.dreh})` : "";
    const teile = [art.group({ transform: `translate(${f.x} ${y})${dreh} scale(${s})` }, [zugArt.buildPassenger(f.id, { waving: Boolean(f.winkt) })])];
    if (f.blase) {
      const kopf = y - 50 * s;
      const cy = Math.max(19, kopf - 22);
      const cx = Math.min(W - 20, f.x + 24);
      teile.push(art.el("circle", { cx: f.x + 10, cy: kopf - 2, r: 2.4, fill: "#ffffff" }));
      teile.push(art.el("circle", { cx: f.x + 15, cy: kopf - 9, r: 3.6, fill: "#ffffff" }));
      teile.push(art.el("circle", { cx, cy, r: 16, fill: "#ffffff", stroke: "#d6dde6", "stroke-width": 1.2 }));
      teile.push(emoji(f.blase, cx, cy + 1, 17));
    }
    return art.group({ class: "bu-figur" }, teile);
  }

  function schnee() {
    const flocken = [];
    for (let i = 0; i < 26; i += 1) {
      flocken.push(art.el("circle", { cx: (i * 37 + 11) % W, cy: (i * 23 + 7) % 104, r: 1.2 + (i % 3) * 0.6, fill: "#ffffff", opacity: "0.9" }));
    }
    return [
      art.el("path", { d: `M0 ${H} L0 104 Q40 94 80 104 T160 102 T240 100 L240 ${H} Z`, fill: "#f4f8fc" }),
      art.el("path", { d: "M0 104 Q40 94 80 104 T160 102 T240 100", stroke: "#dbe6f0", "stroke-width": 2, fill: "none" }),
      ...flocken,
    ];
  }

  //   seite  eine Seite des Buches; ohne Seite nur die Landschaft
  function buchBild(buch, seite = null) {
    const b = seite?.bild || {};
    const szene = szenen?.BY_ID?.[b.landschaft || buch.landschaft] || szenen?.SCENES?.[0] || null;
    const himmel = b.himmel || szene?.sky || ["#a8ddf0", "#dff1f7"];
    const id = `bu-himmel-${bildNr += 1}`;
    const svg = art.el("svg", { viewBox: `0 0 ${W} ${H}`, class: "bu-bild-svg", "aria-hidden": "true" });
    svg.append(art.el("defs", {}, [
      art.el("linearGradient", { id, x1: "0", y1: "0", x2: "0", y2: "1" }, [
        art.el("stop", { offset: "0", "stop-color": himmel[0] }),
        art.el("stop", { offset: "1", "stop-color": himmel[1] }),
      ]),
    ]));
    // Der Schein eines erleuchteten Fensters: einmal auf der Seite genügt,
    // jedes Bild verweist darauf.
    if (!document.getElementById("bu-schein")) {
      const vorrat = art.el("svg", { width: 0, height: 0, "aria-hidden": "true", style: "position:absolute" }, [
        art.el("defs", {}, [
          art.el("radialGradient", { id: "bu-schein" }, [
            art.el("stop", { offset: "0", "stop-color": "#ffe9a8", "stop-opacity": "0.55" }),
            art.el("stop", { offset: "1", "stop-color": "#ffe9a8", "stop-opacity": "0" }),
          ]),
        ]),
      ]);
      document.body.append(vorrat);
    }
    svg.append(art.el("rect", { x: 0, y: 0, width: W, height: H, fill: `url(#${id})` }));
    if (!b.himmel && szene?.light) svg.append(art.el("circle", { cx: 200, cy: 30, r: 15, fill: szene.light.color }));
    if (szene?.thumb) svg.append(art.group({ transform: "scale(2)" }, szene.thumb()));
    if (b.schnee) svg.append(...schnee());
    // Zeichnungen und Dinge liegen hinter den Tieren, ausser sie sind vorne:
    // das Velo, auf dem jemand fährt.
    (b.zeichnungen || []).filter((z) => !z.vorne).forEach((z) => { const g = zeichnung(z); if (g) svg.append(g); });
    (b.dinge || []).filter((d) => !d.vorne).forEach((d) => svg.append(emoji(d.e, d.x, d.y, d.s, d.dreh)));
    (b.figuren || []).forEach((f) => svg.append(figur(f)));
    (b.zeichnungen || []).filter((z) => z.vorne).forEach((z) => { const g = zeichnung(z); if (g) svg.append(g); });
    (b.dinge || []).filter((d) => d.vorne).forEach((d) => svg.append(emoji(d.e, d.x, d.y, d.s, d.dreh)));
    return svg;
  }

  // Der Umschlag: die Landschaft des Buches, davor das Tier, um das es geht.
  function umschlagBild(buch) {
    const svg = art.el("svg", { viewBox: `0 0 ${W} ${H}`, class: "bu-umschlag-svg", "aria-hidden": "true" });
    svg.append(buchBild(buch));
    svg.append(art.group({ transform: `translate(${W / 2} ${BODEN + 2}) scale(2.3)` }, [zugArt.buildPassenger(buch.figur)]));
    return svg;
  }

  window.LernappLeseBilder = { W, H, BODEN, ZEICHNUNGEN, emoji, zeichnung, figur, buchBild, umschlagBild };
})();
