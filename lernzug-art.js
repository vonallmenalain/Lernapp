/*
 * lernzug-art.js – Der Lernzug auf dem Startbild.
 *
 * Über dem Gripszug fährt auf einem zweiten Gleis der Lernzug: vorn die
 * Lernlok, dahinter die Lernwagen – der Lesewagen, der Rechenwagen und (sobald
 * es ihn gibt) der Englischwagen. Gezeichnet in denselben Einheiten wie der
 * Gripszug (train-art.js: Schienenoberkante bei GROUND, ein Wagen 140 breit),
 * damit beide Züge auf dem Bild gleich gross sind.
 *
 * Ein Lernwagen wird in 15 Schritten gebaut, so wie die Wagen des Gripszugs in
 * zwölf. Was es ist, sieht man trotzdem vom ersten Tag an: Schon auf dem
 * nackten Fahrgestell stehen das Schild (ABC, 123 …) und das Maskottchen, und
 * ein gestrichelter Umriss zeigt, was einmal daraus wird.
 *
 *   0  Fahrgestell, Räder, Schild auf zwei Pfosten, Maskottchen, Umriss
 *   1  Boden                       9  Blumenkästen
 *   2  halbe Wände                10  warmes Licht in den Fenstern
 *   3  Wände mit Fenstern         11  Ladung auf dem Dach
 *   4  Dach                       12  Lichterkette
 *   5  das Besondere oben         13  mehr Ladung
 *   6  Laternen (beim Caboose:    14  zwei Sterne am Wagen
 *      Plattformen mit Geländer)  15  Wimpel und goldene Räder – wie am
 *   7  Zierleiste                     fertigen Wagen des Gripszugs
 *   8  Vorhänge
 *
 * Zeichnet nur. Wo der Zug steht und was ein Tipp tut, entscheidet
 * train-home.js.
 */
(() => {
  "use strict";

  const art = window.LernappTrainArt;
  if (!art) return;
  const { el, group, shade, wheel, GROUND, ART_H } = art;

  const WAGEN_W = art.WAGON_W;   // 140 – so breit wie ein Wagen des Gripszugs
  const LOK_W = 170;
  const LUECKE = 4;              // wie der Gripszug auf dem Startbild
  const RAND = 4;
  const STUFEN = 15;
  const DECK = GROUND - 34;      // Oberkante des Fahrgestells
  const GOLD = art.GOLD;
  const FONT = "'Baloo 2', Nunito, ui-rounded, system-ui, sans-serif";

  // Die Wagen. Farben wie ihre Zimmer: der Lesewagen rot, der Rechenwagen gelb,
  // der Englischwagen blau – drei Grundfarben, auf einen Blick zu unterscheiden.
  const WAGEN = {
    lesen: { name: "Lesewagen", koerper: "#c4553a", dach: "#5b3a29", leiste: "#ffd166", schild: "ABC", tinte: "#c4553a" },
    rechnen: { name: "Rechenwagen", koerper: "#f7c843", dach: "#3d7be0", leiste: "#e8543f", schild: "123", tinte: "#2f63bd" },
    englisch: { name: "Englischwagen", koerper: "#3a7bd5", dach: "#e8543f", leiste: "#ffffff", schild: "Hello", tinte: "#1f4f99" },
  };
  // Was bei welchem Schritt dazukommt – für die Feier und die Ansagen.
  const SCHRITTE = [
    "das Fahrgestell", "der Boden", "die Wände", "die Fenster", "das Dach", "das Besondere oben",
    "die Laternen", "die Zierleiste", "die Vorhänge", "die Blumenkästen", "das Licht",
    "die Ladung", "die Lichterkette", "mehr Ladung", "die Sterne", "Wimpel und goldene Räder",
  ];

  const f1 = (n) => (Math.round(n * 10) / 10).toString();
  const rect = (x, y, w, h, fill, extra = {}) => el("rect", { x, y, width: w, height: h, fill, ...extra });
  const circle = (cx, cy, r, fill, extra = {}) => el("circle", { cx, cy, r, fill, ...extra });
  const path = (d, fill, extra = {}) => el("path", { d, fill, ...extra });
  const text = (x, y, inhalt, size, fill) => {
    const node = el("text", { x, y, "text-anchor": "middle", "font-family": FONT, "font-weight": "800", "font-size": size, fill });
    node.textContent = inhalt;
    return node;
  };
  // SVG-Text (rechnen-art.js zeichnet als Text) als Gruppe.
  function ausText(inhalt, attrs = {}) {
    const tpl = document.createElement("template");
    tpl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${inhalt}</svg>`;
    const g = group(attrs);
    [...tpl.content.firstElementChild.childNodes].forEach((node) => g.append(node));
    return g;
  }
  // Ein Stern, wie ihn die Sammelbilder der App haben.
  function stern(cx, cy, r, fill = GOLD) {
    const punkte = [];
    for (let i = 0; i < 10; i += 1) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      punkte.push(`${f1(cx + rr * Math.cos(a))},${f1(cy + rr * Math.sin(a))}`);
    }
    return el("polygon", { points: punkte.join(" "), fill, stroke: shade(fill, -0.3), "stroke-width": 1.2, "stroke-linejoin": "round" });
  }

  // ---------------------------------------------------------------------------
  // Die Maskottchen, etwa 30 Einheiten gross, um (0, 0)
  // ---------------------------------------------------------------------------
  //   lesen     { glieder }          der Lesewurm (lesen-art.js)
  //   rechnen   { leben, ei }        der Rechendrache oder sein Ei (rechnen-art.js)
  //   englisch  { }                  Rocco, der Waschbär (englisch-art.js)
  function maskottchen(id, m = {}) {
    if (id === "lesen") {
      const lese = window.LernappLeseArt;
      if (lese?.buildLesewurm) return group({ transform: "translate(0 6) scale(0.5)" }, [lese.buildLesewurm(Math.min(4, Math.max(1, m.glieder || 1)), { r: 14, buch: false })]);
      return circle(0, 0, 10, "#7ac74f");
    }
    if (id === "rechnen") {
      if (m.ei) return group({}, [el("ellipse", { cx: 0, cy: 2, rx: 9, ry: 11.5, fill: "#fff7e0", stroke: "#e9d8b4", "stroke-width": 1.2 }), path("M-8 0 q4 3 8 0 t8 0", "none", { stroke: "#46b98a", "stroke-width": 2 })]);
      const rechnen = window.LernappRechenArt;
      const leben = ["baby", "lok", "stern"][m.leben || 0] || "baby";
      if (rechnen?.dracheNurKopf) return ausText(rechnen.dracheNurKopf(leben), { transform: "translate(8 37) scale(0.3)" });
      return circle(0, 0, 10, "#46b98a");
    }
    const englisch = window.LernappEnglischArt;
    if (englisch?.roccoKopf) return ausText(englisch.roccoKopf("froh"), { transform: "scale(0.42)" });
    return circle(0, 0, 10, "#9aa0ab");
  }

  // ---------------------------------------------------------------------------
  // Ein Lernwagen, 140 breit, Schienenoberkante bei GROUND
  // ---------------------------------------------------------------------------
  //   id     lesen | rechnen | englisch
  //   stufe  0 bis 15
  //   m      was das Maskottchen braucht (siehe maskottchen)
  //   neu    der Schritt, der gerade dazugekommen ist: er springt hervor
  function buildLernwagen(id, stufe = 0, m = {}, { neu = null } = {}) {
    const w = WAGEN[id] || WAGEN.lesen;
    const s = Math.max(0, Math.min(STUFEN, Math.round(stufe)));
    const fertig = s >= STUFEN;
    const teile = [];
    const schritt = (n, kinder) => {
      if (s < n) return;
      teile.push(group({ class: `lernwagen-schritt${n === neu ? " is-new" : ""}`, "data-schritt": n }, kinder.filter(Boolean)));
    };
    const dunkel = shade(w.koerper, -0.45);

    // 0 – Fahrgestell, Kupplungen und der Umriss dessen, was kommt
    const gestell = [
      rect(6, DECK, WAGEN_W - 12, 10, dunkel, { rx: 2 }),
      el("line", { x1: 0, y1: DECK + 5, x2: 6, y2: DECK + 5, stroke: dunkel, "stroke-width": 5 }),
      el("line", { x1: WAGEN_W - 6, y1: DECK + 5, x2: WAGEN_W, y2: DECK + 5, stroke: dunkel, "stroke-width": 5 }),
    ];
    if (s < 4) {
      gestell.push(rect(10, 62, 120, DECK - 62, "none", { rx: 8, stroke: w.koerper, "stroke-width": 2.5, "stroke-dasharray": "6 5", opacity: "0.75" }));
      gestell.push(path("M4 64 Q70 38 136 64", "none", { stroke: w.dach, "stroke-width": 2.5, "stroke-dasharray": "6 5", opacity: "0.7" }));
    }
    teile.push(group({ class: "lernwagen-gestell" }, gestell));

    // 1 – Boden
    schritt(1, [rect(8, DECK - 8, WAGEN_W - 16, 8, "#b07a45", { rx: 2 }), rect(8, DECK - 8, WAGEN_W - 16, 2, "#c8935a")]);

    // Das Maskottchen steht, solange keine Fenster da sind, auf dem Boden
    // neben dem Schild. Hinter einer halben Wand schaut es darüber.
    const imFenster = s >= 3;
    const tier = group({ class: "lernwagen-tier", transform: imFenster ? "translate(70 82)" : `translate(28 ${s >= 1 ? 106 : 114})` }, [maskottchen(id, m)]);
    if (!imFenster) teile.push(tier);

    // 2 – halbe Wände, 3 – ganze Wände mit Fenstern
    schritt(2, s >= 3 ? [] : [rect(10, 96, 120, DECK - 8 - 96, w.koerper, { rx: 3 })]);
    const fensterX = [18, 56, 94];
    const licht = s >= 10;
    schritt(3, [
      rect(10, 62, 120, DECK - 8 - 62, w.koerper, { rx: 8 }),
      ...[34, 72, 110].map((x) => rect(x, 64, 1.6, DECK - 12 - 64, shade(w.koerper, -0.15), { opacity: "0.6" })),
      ...fensterX.map((x) => rect(x, 68, 28, 24, licht ? "#ffe9a8" : "#cdeefa", { rx: 5, stroke: shade(w.koerper, -0.35), "stroke-width": 2.5 })),
    ]);
    if (imFenster) teile.push(tier);
    if (imFenster) teile.push(rect(55, 90, 30, 3, shade(w.koerper, -0.35), { rx: 1.5 }));

    // 4 – Dach
    schritt(4, [path("M4 64 Q70 38 136 64 L136 70 Q70 44 4 70 Z", w.dach)]);

    // 5 – das Besondere oben
    if (id === "lesen") {
      schritt(5, [rect(104, 32, 9, 22, "#4a5568", { rx: 2 }), rect(101, 30, 15, 5, "#3a4250", { rx: 2 }),
        circle(108.5, 24, 5.5, "#e8edf3", { class: "lernwagen-rauch", opacity: "0.85" }), circle(115, 15, 4, "#e8edf3", { class: "lernwagen-rauch lernwagen-rauch-2", opacity: "0.6" })]);
    } else if (id === "rechnen") {
      const perlen = [];
      for (let i = 0; i < 10; i += 1) perlen.push(circle(30 + i * 8.8, 44, 3.8, i < 5 ? "#e8543f" : "#3d7be0"));
      schritt(5, [rect(26, 37, 3, 12, "#8a5a35"), rect(111, 37, 3, 12, "#8a5a35"), rect(26, 43, 88, 2, "#8a5a35"), ...perlen]);
    } else {
      schritt(5, [rect(46, 22, 48, 26, w.koerper, { rx: 4 }), rect(52, 27, 15, 13, "#cdeefa", { rx: 2.5 }), rect(73, 27, 15, 13, "#cdeefa", { rx: 2.5 }),
        path("M40 22 L100 22 L94 14 L46 14 Z", w.dach)]);
    }

    // 6 – Laternen an den Enden; der Caboose bekommt seine Plattformen
    if (id === "englisch") {
      schritt(6, [
        rect(0, DECK - 6, 12, 6, "#3a3f4a", { rx: 1.5 }), rect(WAGEN_W - 12, DECK - 6, 12, 6, "#3a3f4a", { rx: 1.5 }),
        path(`M2 ${DECK - 6} L2 ${DECK - 34} L10 ${DECK - 34} M${WAGEN_W - 2} ${DECK - 6} L${WAGEN_W - 2} ${DECK - 34} L${WAGEN_W - 10} ${DECK - 34} M2 ${DECK - 20} L10 ${DECK - 20} M${WAGEN_W - 2} ${DECK - 20} L${WAGEN_W - 10} ${DECK - 20}`, "none", { stroke: "#ffffff", "stroke-width": 2.6, "stroke-linecap": "round" }),
      ]);
    } else {
      const laterne = (x) => [rect(x - 1, 74, 2, 6, "#3a3f4a"), rect(x - 5, 80, 10, 12, "#3a3f4a", { rx: 2.5 }), rect(x - 3, 82, 6, 8, "#ffd166", { rx: 1.5 })];
      schritt(6, [...laterne(5), ...laterne(WAGEN_W - 5)]);
    }

    // 7 – Zierleiste; am Rechenwagen in den Fünfer-Farben
    if (id === "rechnen") {
      const felder = [];
      for (let i = 0; i < 10; i += 1) felder.push(rect(14 + i * 11.2, 96, 11.2, 5, i < 5 ? "#e8543f" : "#3d7be0"));
      schritt(7, felder);
    } else {
      schritt(7, [rect(12, 96, 116, 5, w.leiste, { rx: 2, opacity: id === "englisch" ? "0.95" : "1" })]);
    }

    // 8 – Vorhänge, 9 – Blumenkästen
    const vorhang = (x) => [path(`M${x + 1} 69 L${x + 9} 69 Q${x + 5} 79 ${x + 2} 91 L${x + 1} 91 Z`, "#ef6fa8"), path(`M${x + 27} 69 L${x + 19} 69 Q${x + 23} 79 ${x + 26} 91 L${x + 27} 91 Z`, "#ef6fa8")];
    schritt(8, [...vorhang(18), ...vorhang(94)]);
    const kasten = (x) => [rect(x - 1, 92, 30, 5, "#8a5a35", { rx: 1.5 }), circle(x + 7, 91, 2.8, "#ef6fa8"), circle(x + 14, 90, 2.8, "#ffd166"), circle(x + 21, 91, 2.8, "#8bd36b")];
    schritt(9, [...kasten(18), ...kasten(94)]);

    // 10 – warmes Licht (die Fenster sind dann gelb, siehe oben) und ein Schein
    schritt(10, fensterX.map((x) => rect(x - 3, 65, 34, 30, "#ffd166", { rx: 7, opacity: "0.25" })));

    // 11, 13 – Ladung auf dem Dach
    const ladung = (n) => {
      if (id === "lesen") {
        const x = [16, 38, 118][n];
        return [rect(x, 49 - (n === 2 ? 2 : 0), 16, 6, "#3d7be0", { rx: 1.5 }), rect(x + 1, 43 - (n === 2 ? 2 : 0), 14, 6, "#ffd166", { rx: 1.5 }), rect(x, 37 - (n === 2 ? 2 : 0), 16, 6, "#e8543f", { rx: 1.5 })];
      }
      if (id === "rechnen") {
        const x = [12, 120, 103][n];
        return [0, 1, 2, 3].map((k) => rect(x, 54 - k * 5 - (n === 0 ? 0 : 2), 14, 5, GOLD, { rx: 2, stroke: "#c98a00", "stroke-width": 0.8 }));
      }
      const x = [6, 24, 112][n];
      return [rect(x, n === 2 ? 46 : 42, 18, 14, ["#8a5a35", "#e8543f", "#3fa34d"][n], { rx: 3 }), circle(x + 6, n === 2 ? 53 : 49, 2.6, "#ffd166"), rect(x + 6, n === 2 ? 43 : 39, 6, 4, "#3a3f4a", { rx: 1 })];
    };
    schritt(11, ladung(0));
    schritt(13, [...ladung(1), ...ladung(2)]);

    // 12 – Lichterkette entlang des Dachs
    const lichter = [];
    for (let i = 0; i <= 10; i += 1) {
      const t = i / 10;
      const x = 8 + 124 * t;
      const y = 68 - 22 * Math.sin(t * Math.PI) + 4;
      lichter.push(circle(f1(x), f1(y), 2.4, ["#ffd166", "#ef6fa8", "#4fc3f7", "#8bd36b"][i % 4], { class: `lernwagen-birne lernwagen-birne-${i % 3}` }));
    }
    schritt(12, lichter);

    // Das Schild – vom ersten Tag an. Ohne Wände steht es auf zwei Pfosten.
    const schild = [];
    if (s < 2) schild.push(rect(54, 122, 4, DECK - 122, "#8a5a35"), rect(82, 122, 4, DECK - 122, "#8a5a35"));
    schild.push(rect(44, 104, 52, 20, "#fff6e0", { rx: 5, stroke: w.tinte, "stroke-width": 2 }));
    schild.push(text(70, 119, w.schild, w.schild.length > 3 ? 13 : 15, w.tinte));
    teile.push(group({ class: "lernwagen-schild" }, schild));

    // 14 – zwei Sterne neben dem Schild
    const sternFarbe = id === "rechnen" ? "#e8543f" : GOLD;
    schritt(14, [stern(34, 114, 6.5, sternFarbe), stern(106, 114, 6.5, sternFarbe)]);

    // 15 – Wimpel und goldene Räder
    // Der Wimpel steht dort, wo oben Platz ist: über der Dachmitte, über dem
    // Zählrahmen oder neben dem Aussichtsturm.
    const wimpel = { lesen: [70, 50, 18], rechnen: [70, 39, 9], englisch: [100, 54, 22] }[id] || [70, 50, 18];
    const [wx, wUnten, wOben] = wimpel;
    schritt(15, [el("line", { x1: wx, y1: wUnten, x2: wx, y2: wOben, stroke: "#8a5f1c", "stroke-width": 3 }), el("polygon", { points: `${wx},${wOben + 1} ${wx + 26},${wOben + 9} ${wx},${wOben + 17}`, fill: GOLD })]);

    const radFarbe = fertig ? GOLD : dunkel;
    teile.push(wheel(32, 13, radFarbe, "spoke"));
    teile.push(wheel(WAGEN_W - 32, 13, radFarbe, "spoke"));

    return group({
      class: `lernwagen lernwagen-${id}${fertig ? " is-complete" : ""}`,
      "data-lernwagen": id,
      "data-stufe": s,
    }, [
      // Unsichtbare Fläche: ein halb gebauter Wagen ist voller Lücken, ein
      // Tipp mitten hinein soll ihn trotzdem treffen.
      rect(0, 12, WAGEN_W, GROUND - 12, "transparent", { class: "lernwagen-hit" }),
      ...teile,
    ]);
  }

  // ---------------------------------------------------------------------------
  // Die Lernlok, 170 breit: lila, mit Glocke und dem Schild «ABC 123». Im
  // Führerhaus sitzt, wer zuletzt besucht wurde.
  // ---------------------------------------------------------------------------
  function buildLernlok({ fahrer = "lesen", m = {} } = {}) {
    const lila = "#6c5ce7";
    const hell = "#8577f0";
    const teile = [
      path(`M154 ${DECK} L170 ${GROUND - 12} L154 ${GROUND - 12} Z`, "#4b3cb0"),
      rect(60, 80, 98, 54, hell, { rx: 27 }),
      rect(116, 46, 20, 36, "#3a3f4a", { rx: 3 }), rect(111, 40, 30, 9, "#2b2f38", { rx: 3 }),
      circle(126, 30, 6, "#e8edf3", { class: "lernlok-dampf", opacity: "0.8" }), circle(134, 20, 4.5, "#e8edf3", { class: "lernlok-dampf lernlok-dampf-2", opacity: "0.6" }),
      path("M82 80 Q90 60 98 80 Z", GOLD), rect(87, 76, 6, 5, "#c98a00"),
      circle(156, 96, 8, "#ffd166"), circle(156, 96, 4, "#fff6d0"),
      rect(78, 98, 62, 22, "#ffffff", { rx: 5 }),
      text(109, 114, "ABC 123", 14, lila),
      rect(6, 38, 62, 98, lila, { rx: 9 }),
      path("M0 40 Q37 20 74 40 L74 48 L0 48 Z", "#5141c9"),
      rect(15, 54, 44, 40, "#cdeefa", { rx: 6 }),
      group({ class: "lernlok-fahrer", transform: "translate(37 78)" }, [maskottchen(fahrer, m)]),
      rect(2, DECK - 2, 156, 11, "#3a3f4a", { rx: 4 }),
      wheel(34, 14, "#ffd166", "spoke"),
      wheel(88, 14, "#ffd166", "spoke"),
      wheel(138, 12, "#ffd166", "spoke"),
    ];
    return group({ class: "lernlok", "data-lernlok": "1" }, [rect(0, 12, LOK_W, GROUND - 12, "transparent"), ...teile]);
  }

  // Ein Wagen oder die Lok allein in einem eigenen <svg> – für die Knöpfe auf
  // dem Startbild und für die Feier.
  // Unten endet der Ausschnitt knapp unter den Rädern: Darunter beginnt schon
  // der Gripszug, und ein Tipp auf dessen Wagen darf nicht hier landen.
  // Oben beginnt er dort, wo der höchste fertige Wagen aufhört (der Wimpel
  // über dem Zählrahmen, 161 über der Schiene) – leerer Rand darüber würde nur
  // die Knöpfe oben links streifen.
  const KNOPF_HOEHE = GROUND + 5;
  const KNOPF_OBEN = 8;
  function wagenSvg(node, breite, { label = "", ausschnitt = null } = {}) {
    const v = ausschnitt || { x: 0, y: KNOPF_OBEN, width: breite, height: KNOPF_HOEHE - KNOPF_OBEN };
    const svg = el("svg", { viewBox: `${v.x} ${v.y} ${v.width} ${v.height}`, class: "lernzug-teil-svg", "aria-hidden": label ? null : "true", role: label ? "img" : null, "aria-label": label || null });
    svg.append(node);
    return svg;
  }
  const WAGEN_AUSSCHNITT = { x: -6, y: 0, width: WAGEN_W + 12, height: GROUND + 16 };

  // Das Gleis unter dem Lernzug, quer über das ganze Bild, mit den Kupplungen
  // zwischen den Wagen. Breite in Einheiten des Zugs.
  function buildGleis(breite, wagenZahl) {
    const teile = [];
    for (let x = 0; x < breite; x += 46) teile.push(rect(x, GROUND + 14, 8, 15, "#7b5c3a", { opacity: "0.5" , rx: 3 }));
    teile.push(rect(0, GROUND + 9, breite, 22, "#a7cf7c", { opacity: "0.55" }));
    teile.push(rect(0, GROUND, breite, 9, "#8c93a1", { rx: 4, class: "lernzug-schiene" }));
    teile.push(rect(0, GROUND + 9, breite, 5, "#6a7180", { opacity: "0.7" }));
    for (let i = 0; i < wagenZahl; i += 1) {
      const x = RAND + i * (WAGEN_W + LUECKE) + WAGEN_W;
      teile.push(rect(x - 2, DECK + 3, LUECKE + 4, 4, "#3a3f4a", { rx: 2 }));
    }
    return el("svg", { viewBox: `0 0 ${f1(breite)} ${ART_H + 14}`, class: "lernzug-gleis", "aria-hidden": "true", preserveAspectRatio: "xMinYMin meet" }, teile);
  }

  // Wo Wagen i und die Lok im Zug stehen (Einheiten, von links).
  const wagenX = (i) => RAND + i * (WAGEN_W + LUECKE);
  const lokX = (wagenZahl) => RAND + wagenZahl * (WAGEN_W + LUECKE);
  const zugBreite = (wagenZahl) => lokX(wagenZahl) + LOK_W + RAND;

  window.LernappLernzugArt = {
    WAGEN, SCHRITTE, STUFEN, WAGEN_W, LOK_W, LUECKE, RAND, WAGEN_AUSSCHNITT, KNOPF_HOEHE, KNOPF_OBEN,
    maskottchen, buildLernwagen, buildLernlok, buildGleis, wagenSvg, wagenX, lokX, zugBreite, stern,
  };
})();
