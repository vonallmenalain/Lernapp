/*
 * train-journey.js – Die Streckenkarte der Reise.
 *
 * Eine Landschaft je Karte, das Gleis als Schlange in drei Bahnen, zehn
 * Stationen mit dem Bild ihres Spiels, Nebel über dem, was noch kommt, der
 * eigene Zug klein an der aktuellen Station und oben rechts der Ziel-Bahnhof
 * mit dem Schaufenster. Gezeichnet wird in die Bühnen-Ebene des Startbilds;
 * was zu tun ist, steht in journey-plan.js, der Rahmen (Zurück-Knopf,
 * Ansichten, Feiern der Wagen) in train-home.js.
 *
 * Der Zug ist von der Seite gezeichnet und kann eine Kehre nicht sichtbar
 * durchfahren – er käme auf dem Kopf stehend heraus. Deshalb steht an jeder
 * Kehre etwas Grosses (rechts ein Berg mit Tunnel, links ein Wald), hinter dem
 * er sich unbemerkt umdreht. Für die Kinder ist das ein Versteckspiel.
 *
 * Jede Karte hat ihren Fahrgast (wartet an Station 1, steigt in den ersten
 * Wagen, steigt am Ziel aus – dort geht ein Licht an) und ihre
 * Streckenbesonderheit: Kühe am Bahnübergang, ein Bach mit Holzbrücke, die
 * Fähre über die Bucht, eine Lianenbrücke, die Zahnradstrecke, die Nacht mit
 * Glühwürmchen und Scheinwerfer, der Mond mit der Erde am Himmel, Elefanten
 * in der Savanne. Nach fünf Fehlversuchen kommt die Schiebelok.
 *
 * Die Karte zeigt nur den eigenen Zug: wie weit die anderen sind, steht auf
 * dem Startbild an ihren Zügen – zweimal dasselbe wäre hier nur Gedränge.
 *
 * Gefeiert wird, was seit dem letzten Öffnen dazugekommen ist: die Karte
 * merkt sich, an welcher Station sie den Zug zuletzt gezeigt hat
 * (lernapp.reise.gesehen), und spielt beim nächsten Mal Stempel um Stempel
 * und Fahrt um Fahrt nach – auch wenn dazwischen die Seite neu geladen wurde
 * oder der Stand aus der Cloud kam.
 */
(() => {
  "use strict";

  const art = window.LernappTrainArt;
  const reise = window.LernappReise;
  if (!art || !reise) return;
  const { el, group, shade } = art;
  const scenes = () => window.LernappScenes || null;
  const kids = () => window.LernappKids || null;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, reduced() ? 0 : ms));

  // ---------------------------------------------------------------------------
  // Masse
  // ---------------------------------------------------------------------------
  // Dieselbe Ebene wie vor den Toren: 1200 × 620, unten ausgerichtet.
  const W = 1200;
  const H = 620;
  const BLEED = 700;
  // Drei Bahnen, unten beginnt es. Die Kehren liegen rechts (unten → Mitte)
  // und links (Mitte → oben).
  const STOPS = [[180, 540], [420, 540], [660, 540], [900, 540], [900, 370], [600, 370], [300, 370], [300, 200], [600, 200], [1000, 200]];
  const PATH_D = "M-420 540 H1040 C1150 540 1150 370 1040 370 H160 C50 370 50 200 160 200 H1700";
  const TRAIN_SCALE = 0.24;
  const STATION_SCALE = 0.5;
  const CHOICE_SCALE = 0.36;
  const ALT_SCALE = 0.34;
  const LANDMARK_AT = [1092, 200];
  const SHOWCASE_AT = [1160, 200];
  // Wo der Zug vor einer Station hält: ein Stück davor, damit die Lok das
  // Bild nicht verdeckt und ein Tipp die Station trifft, nicht den Zug.
  const STOP_BEFORE = 56;
  const AREA_ORDER = ["gedaechtnis", "konzentration", "geschwindigkeit", "problemloesen", "zahlbuchstabe"];

  // Die Farben je Landschaft für Hügel, Kehren und Bäume. Himmel und Boden
  // kommen aus train-scenes.js, das Übrige steht hier, weil die Landschaften
  // ihre Hügelfarben nur beim Zeichnen kennen.
  const LOOK = {
    wiese: { far: "#9fc9a6", far2: "#86b98f", mid: "#6faa6b", rock: "#8e9aa8", crown: "#4f9350", crown2: "#57a058", trunk: "#7b5c3a", plant: "tree" },
    wald: { far: "#7fae87", far2: "#68986f", mid: "#4e8250", rock: "#6f7b89", crown: "#2f6b3b", crown2: "#377643", trunk: "#5b4229", plant: "fir" },
    see: { far: "#8fb9c4", far2: "#57b6d8", mid: "#a7bd72", rock: "#8e9aa8", crown: "#4f9350", crown2: "#57a058", trunk: "#7b5c3a", plant: "tree", water: true },
    dschungel: { far: "#6fbd8f", far2: "#55a475", mid: "#3f8f57", rock: "#7a8a7c", crown: "#2f7d4b", crown2: "#368a54", trunk: "#7b5c3a", plant: "palm" },
    berge: { far: "#8fa6bd", far2: "#7d95ad", mid: "#6f8496", rock: "#7d8d9c", crown: "#5f7a5c", crown2: "#54704f", trunk: "#5b4229", plant: "fir", peaks: true },
    nacht: { far: "#31456a", far2: "#293a5c", mid: "#22314e", rock: "#3a4d6f", crown: "#1b2c47", crown2: "#20334f", trunk: "#16203a", plant: "fir", stars: true },
    savanne: { far: "#d9b44a", far2: "#c9a13c", mid: "#b8913a", rock: "#a8896a", crown: "#4f8a3c", crown2: "#5a9646", trunk: "#6d4b2a", plant: "acacia" },
    weltraum: { far: "#5b6480", far2: "#4a536d", mid: "#7d8598", rock: "#6a7188", crown: "#8f96a8", crown2: "#7d8598", trunk: "#6a7188", plant: "rock", stars: true, earth: true },
  };
  // Wo der Fahrgast wartet: rechts der ersten Station, ausserhalb von Signal
  // und Ausweichgleis. Und wo er am Ziel steht: vor dem Wahrzeichen.
  const PLATFORM_AT = [STOPS[0][0] + 120, STOPS[0][1]];
  const HOME_AT = [LANDMARK_AT[0] + 26, LANDMARK_AT[1]];
  // Wie der Lautsprecher die Fahrgäste und ihr Zuhause nennt.
  const PASSENGER_NAMES = {
    rabbit: "der Hase", squirrel: "das Eichhörnchen", penguin: "der Pinguin", panda: "der Panda",
    ibex: "der Steinbock", owl: "die Eule", mouse: "die Maus", lion: "der Löwe",
  };
  const LANDMARK_HOMES = {
    windmill: "bei der Windmühle", treehouse: "im Baumhaus", lighthouse: "im Leuchtturm", temple: "im Tempel",
    hut: "in der Gipfelhütte", observatory: "in der Sternwarte", rocket: "in der Rakete", baobab: "im Baobab",
  };
  function passengerName(id) { return PASSENGER_NAMES[id] || "ein Tier"; }
  function passengerPronoun(id) {
    const name = passengerName(id);
    return name.startsWith("die") ? "Sie" : name.startsWith("das") ? "Es" : "Er";
  }
  // Die Schiebelok: gelb, mit dem Bären am Steuer – nicht die Lok des Kindes.
  const PUSHER = { body: "#f0b429", cab: { color: "#4a5568" }, driver: "bear", wheels: { shape: "disc", color: "#4a5568" }, flag: { pattern: "plain", color: "#c9483a" }, whistle: "tief" };
  const FALLBACK_SCENE = { sky: ["#a8ddf0", "#dff1f7"], ground: "#8fc45e", groundDark: "#6da645", light: { color: "#ffd166", glow: 0.35 } };

  function sceneOf(map) {
    return scenes()?.BY_ID?.[map.scene] || FALLBACK_SCENE;
  }
  function lookOf(map) { return LOOK[map.scene] || LOOK.wiese; }

  // ---------------------------------------------------------------------------
  // Das Gleis vermessen – einmal für die ganze Sitzung
  // ---------------------------------------------------------------------------
  // Wo eine Station auf dem Gleis liegt, lässt sich nicht rechnen, nur messen.
  // Früher lief dafür je Station der ganze Pfad in Zweierschritten durch: gut
  // 27000 Messungen bei jedem Öffnen der Karte, auf einem Tablet mehrere
  // Sekunden, in denen nichts geschah.
  //
  // Jetzt wird der Pfad einmal grob abgetastet, und jede Station sucht in
  // diesem Raster ihren nächsten Punkt und verfeinert ihn nur dort. Das
  // Ergebnis hängt allein am Pfad, ist also für alle Karten dasselbe und
  // bleibt gespeichert. Aus 27000 Messungen werden knapp tausend.
  const COARSE = 12;
  let rail = null;

  function measureRail() {
    if (rail) return rail;
    // Ein eigenes, unsichtbares SVG: so lässt sich messen, bevor (und ohne
    // dass) die Karte im Bild hängt – und das Ergebnis steht schon bereit,
    // wenn das Kind das Streckenschild antippt.
    const holder = el("svg", { width: "0", height: "0", "aria-hidden": "true", focusable: "false", class: "journey-ruler" });
    const path = el("path", { d: PATH_D, fill: "none", stroke: "none" });
    holder.append(path);
    document.body.append(holder);
    const total = path.getTotalLength ? path.getTotalLength() : 4600;
    const xs = [];
    const ys = [];
    for (let d = 0; d <= total + COARSE; d += COARSE) {
      const p = path.getPointAtLength ? path.getPointAtLength(Math.min(d, total)) : { x: 0, y: 0 };
      xs.push(p.x);
      ys.push(p.y);
    }
    function at(d) {
      if (!path.getPointAtLength) return { x: 0, y: 540 };
      // Vor dem Anfang und hinter dem Ende läuft das Gleis gerade weiter:
      // dort fährt der Zug herein und hinaus.
      if (d <= 0) { const p = path.getPointAtLength(0); return { x: p.x + d, y: p.y }; }
      if (d >= total) { const p = path.getPointAtLength(total); return { x: p.x + (d - total), y: p.y }; }
      return path.getPointAtLength(d);
    }
    function nearest(x, y) {
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i < xs.length; i += 1) {
        const dd = (xs[i] - x) ** 2 + (ys[i] - y) ** 2;
        if (dd < bd) { bd = dd; best = i; }
      }
      // Im Raster gefunden, im Fenster daneben verfeinert.
      let d = best * COARSE;
      for (let step = COARSE / 2; step >= 0.5; step /= 2) {
        [-step, step].forEach((delta) => {
          const t = Math.max(0, Math.min(total, d + delta));
          const p = at(t);
          const dd = (p.x - x) ** 2 + (p.y - y) ** 2;
          if (dd < bd) { bd = dd; d = t; }
        });
      }
      return d;
    }
    rail = {
      total, at,
      L: STOPS.map(([x, y]) => nearest(x, y)),
      platform: nearest(PLATFORM_AT[0], PLATFORM_AT[1]),
      bay: nearest(1035, STOPS[0][1]),
    };
    return rail;
  }

  // ---------------------------------------------------------------------------
  // Kleine Helfer
  // ---------------------------------------------------------------------------
  function strip(node) {
    node.querySelectorAll("[tabindex], [role]").forEach((n) => { n.removeAttribute("tabindex"); n.removeAttribute("role"); });
    node.removeAttribute("tabindex");
    node.removeAttribute("role");
    node.classList.remove("train-building");
    return node;
  }
  function activate(node, action) {
    node.addEventListener("click", (event) => { event.stopPropagation(); action(); });
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
    });
  }
  function textNode(x, y, size, fill, value) {
    const node = el("text", { x, y, "font-family": "Inter, system-ui, sans-serif", "font-size": size, "font-weight": 900, fill, "text-anchor": "middle" });
    node.textContent = String(value);
    return node;
  }

  // ---------------------------------------------------------------------------
  // Die Landschaft der Karte
  // ---------------------------------------------------------------------------
  // Über die Ränder hinaus gezeichnet: die Ebene wird ins Fenster eingepasst,
  // und links und rechts bliebe sonst die Landschaft des Startbilds stehen –
  // eine andere als die der Karte.
  function hills(top, amplitude, fill) {
    const from = -BLEED;
    const to = W + BLEED;
    const step = 200;
    let d = `M${from} ${H + BLEED} L${from} ${top}`;
    for (let x = from; x < to; x += step) {
      d += ` Q${x + step / 2} ${top - amplitude} ${x + step} ${top}`;
    }
    return el("path", { d: `${d} L${to} ${H + BLEED} Z`, fill });
  }

  function tree(x, y, scale, look) {
    const list = scenes();
    if (look.plant === "fir" && list?.fir) return list.fir(x, y, scale, look.trunk, look.crown);
    if (look.plant === "palm" && list?.palm) return list.palm(x, y, scale, look.trunk, look.crown);
    if (look.plant === "rock") {
      return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
        el("ellipse", { cx: 0, cy: 0, rx: 26, ry: 8, fill: shade(look.crown, -0.25) }),
        el("path", { d: "M-24 0 Q-20 -30 0 -32 Q22 -30 24 0 Z", fill: look.crown }),
        el("path", { d: "M-10 -14 q8 -10 18 -4", fill: "none", stroke: shade(look.crown, 0.18), "stroke-width": 4, "stroke-linecap": "round" }),
      ]);
    }
    if (look.plant === "acacia") {
      return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
        el("rect", { x: -4, y: -30, width: 8, height: 36, rx: 3, fill: look.trunk }),
        el("path", { d: "M-34 -30 q34 -30 68 0 q-34 8 -68 0 z", fill: look.crown }),
      ]);
    }
    if (list?.tree) return list.tree(x, y, scale, look.trunk, look.crown);
    return group({ transform: `translate(${x},${y}) scale(${scale})` }, [
      el("rect", { x: -5, y: -18, width: 10, height: 26, rx: 3, fill: look.trunk }),
      el("circle", { cx: 0, cy: -34, r: 24, fill: look.crown }),
    ]);
  }

  let skyUid = 0;
  function buildBackground(map) {
    const scene = sceneOf(map);
    const look = lookOf(map);
    const skyId = `journey-sky-${skyUid += 1}`;
    const parts = [
      el("defs", {}, [
        el("linearGradient", { id: skyId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
          el("stop", { offset: "0", "stop-color": scene.sky[0] }),
          el("stop", { offset: "1", "stop-color": scene.sky[1] }),
        ]),
      ]),
      el("rect", { x: -BLEED, y: -BLEED, width: W + 2 * BLEED, height: H + 2 * BLEED, fill: `url(#${skyId})` }),
    ];
    if (look.stars) {
      for (let i = 0; i < 40; i += 1) {
        const x = -BLEED + ((i * 197) % (W + 2 * BLEED));
        const y = -60 + ((i * 89) % 150);
        parts.push(el("circle", { cx: x, cy: y, r: 1.4 + (i % 3), fill: "#ffffff", opacity: String(0.5 + (i % 4) * 0.12) }));
      }
    }
    if (look.earth) {
      parts.push(el("circle", { cx: 250, cy: 78, r: 46, fill: "#3d7be0" }));
      parts.push(el("path", { d: "M222 62 q18 -14 34 -2 q-10 16 -34 2 z M258 88 q20 -9 30 8 q-16 12 -30 -8 z M228 100 q12 -7 22 2 q-10 10 -22 -2 z", fill: "#5cb85c" }));
      parts.push(el("path", { d: "M216 50 a46 46 0 0 1 24 -14", fill: "none", stroke: "#ffffff", "stroke-width": 6, "stroke-linecap": "round", opacity: "0.55" }));
    }
    parts.push(el("circle", { cx: 930, cy: 60, r: 40, fill: scene.light.color, opacity: String(scene.light.glow) }));
    parts.push(el("circle", { cx: 930, cy: 60, r: 26, fill: scene.light.color }));
    if (look.peaks) {
      parts.push(el("polygon", { points: `-100,150 160,20 420,150`, fill: look.far }));
      parts.push(el("polygon", { points: `300,150 560,4 820,150`, fill: look.far2 }));
      parts.push(el("polygon", { points: `700,150 980,30 1260,150`, fill: look.far }));
      parts.push(el("polygon", { points: `520,36 560,4 600,36 580,30 560,42 540,30`, fill: "#f4f8fb" }));
    } else {
      parts.push(hills(96, 46, look.far));
      parts.push(hills(124, 28, look.far2));
    }
    if (look.water) {
      parts.push(el("rect", { x: -BLEED, y: 118, width: W + 2 * BLEED, height: 40, fill: "#57b6d8" }));
      parts.push(el("path", { d: "M-600 130 q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0", fill: "none", stroke: "#8fd8ee", "stroke-width": 3, class: "journey-water" }));
    }
    parts.push(el("rect", { x: -BLEED, y: 140, width: W + 2 * BLEED, height: H + BLEED, fill: scene.ground }));
    parts.push(hills(150, 16, look.mid));
    parts.push(el("rect", { x: -BLEED, y: 594, width: W + 2 * BLEED, height: BLEED, fill: scene.groundDark }));
    // Bäume zwischen den Bahnen, nicht auf ihnen und nicht vor den Stationen.
    [[80, 290, 0.9], [470, 286, 0.7], [760, 292, 0.8], [1150, 292, 0.7], [140, 470, 0.75], [520, 466, 0.7], [780, 470, 0.9], [1120, 476, 0.8], [-120, 300, 0.9], [-200, 480, 0.8], [1320, 300, 0.9], [1380, 480, 0.8]]
      .forEach(([x, y, s], i) => parts.push(tree(x, y, s, i % 2 ? { ...look, crown: look.crown2 } : look)));
    parts.push(...featureBack(map));
    return group({ class: "journey-bg", "aria-hidden": "true" }, parts);
  }

  // ---------------------------------------------------------------------------
  // Die Streckenbesonderheiten
  // ---------------------------------------------------------------------------
  // Je Karte eine (journey-plan.js, feature). Was hinter dem Gleis liegt,
  // kommt in den Hintergrund; was am Gleis steht, auf die Gleis-Ebene; die
  // Fähre in die Kehre (buildCovers). Der Nebel und die Stationen bleiben frei.
  function cow(x, y, flip = false) {
    return group({ transform: `translate(${x},${y})${flip ? " scale(-1,1)" : ""}` }, [
      el("rect", { x: -12, y: -8, width: 4, height: 9, rx: 1.5, fill: "#3a4250" }),
      el("rect", { x: 7, y: -8, width: 4, height: 9, rx: 1.5, fill: "#3a4250" }),
      el("ellipse", { cx: 0, cy: -14, rx: 17, ry: 9, fill: "#f4f1ea" }),
      el("ellipse", { cx: -6, cy: -15, rx: 6, ry: 4.5, fill: "#3a4250" }),
      el("ellipse", { cx: 8, cy: -11, rx: 4, ry: 3, fill: "#3a4250" }),
      el("circle", { cx: 17, cy: -20, r: 6, fill: "#f4f1ea" }),
      el("ellipse", { cx: 19, cy: -17, rx: 4, ry: 2.6, fill: "#f7b8c4" }),
      el("ellipse", { cx: 13, cy: -25, rx: 2.6, ry: 1.6, fill: "#f4f1ea" }),
      el("ellipse", { cx: 21, cy: -25, rx: 2.6, ry: 1.6, fill: "#f4f1ea" }),
      el("circle", { cx: 18.5, cy: -21, r: 0.9, fill: "#243047" }),
    ]);
  }
  function elephant(x, y, scale, color) {
    return group({ transform: `translate(${x},${y}) scale(${scale})`, fill: color }, [
      el("ellipse", { cx: 0, cy: -20, rx: 24, ry: 15 }),
      el("rect", { x: -18, y: -12, width: 8, height: 12, rx: 2 }), el("rect", { x: 8, y: -12, width: 8, height: 12, rx: 2 }),
      el("circle", { cx: 26, cy: -28, r: 10 }),
      el("path", { d: "M32 -22 q8 8 4 20", fill: "none", stroke: color, "stroke-width": 5, "stroke-linecap": "round" }),
      el("ellipse", { cx: 20, cy: -30, rx: 6, ry: 8, opacity: "0.8" }),
    ]);
  }
  function featureBack(map) {
    const look = lookOf(map);
    switch (map.feature) {
      case "cows":
        return [
          el("path", { d: "M497 494 l16 16 M513 494 l-16 16", stroke: "#ffffff", "stroke-width": 8, "stroke-linecap": "round" }),
          el("path", { d: "M497 494 l16 16 M513 494 l-16 16", stroke: "#c9483a", "stroke-width": 4, "stroke-linecap": "round" }),
          el("rect", { x: 503, y: 508, width: 4, height: 34, fill: "#4a5568" }),
          cow(545, 578), cow(600, 584, true),
        ];
      case "brook":
        return [
          el("path", { d: "M452 292 q-14 30 4 60 q16 30 -6 60 q-14 26 2 52", fill: "none", stroke: "#57b6d8", "stroke-width": 22, "stroke-linecap": "round" }),
          el("path", { d: "M452 292 q-14 30 4 60 q16 30 -6 60 q-14 26 2 52", fill: "none", stroke: "#8fd8ee", "stroke-width": 4, "stroke-linecap": "round", opacity: "0.8", "stroke-dasharray": "10 14" }),
        ];
      case "liana":
        return [
          el("path", { d: "M652 206 L660 262 L710 262 L718 206 Z", fill: shade(look.mid, -0.35) }),
          el("ellipse", { cx: 685, cy: 258, rx: 22, ry: 5, fill: "#57b6d8" }),
        ];
      case "night":
        return [4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => el("circle", {
          cx: 160 + i * 96 + (i % 3) * 20, cy: i % 2 ? 300 - (i % 4) * 14 : 470 - (i % 3) * 16, r: 2.6, fill: "#ffe98a",
          class: "journey-firefly", style: `animation-delay: ${(i * 0.7) % 4}s`,
        }));
      case "moon":
        return [[240, 300], [700, 296], [1000, 470], [380, 476]].map(([x, y], i) => group({}, [
          el("ellipse", { cx: x, cy: y, rx: 30 + (i % 2) * 10, ry: 9, fill: shade(look.mid, -0.3) }),
          el("ellipse", { cx: x, cy: y - 3, rx: 24 + (i % 2) * 8, ry: 6, fill: shade(look.mid, 0.15) }),
        ]));
      case "elephants":
        return [elephant(240, 142, 0.8, "#8a6b3c"), elephant(330, 142, 0.6, "#7a5c30")];
      default:
        return [];
    }
  }
  // Was auf der Gleis-Ebene liegt: unter den Schienen (die Brücke) oder
  // darüber (Geländer, Seile, die Zahnstange).
  function featureTrack(map, { above = false } = {}) {
    const wood = { base: "#c98a3f", dark: "#8a5f1c" };
    switch (map.feature) {
      case "brook":
        return above
          ? [el("path", { d: "M428 352 H472 M428 388 H472", stroke: wood.dark, "stroke-width": 3, "stroke-linecap": "round" })]
          : [el("rect", { x: 428, y: 356, width: 44, height: 28, rx: 4, fill: wood.base }),
            el("path", { d: "M436 356 V384 M446 356 V384 M456 356 V384 M466 356 V384", stroke: wood.dark, "stroke-width": 1.5, opacity: "0.6" })];
      case "liana": {
        if (!above) return [el("rect", { x: 646, y: 190, width: 78, height: 20, rx: 3, fill: wood.base })];
        const hangers = [];
        for (let x = 656; x <= 714; x += 10) {
          const t = (x - 685) / 39;
          const y = 150 + 26 * (1 - t * t);
          hangers.push(el("line", { x1: x, y1: y, x2: x, y2: 192, stroke: wood.dark, "stroke-width": 2 }));
        }
        return [
          el("rect", { x: 644, y: 148, width: 5, height: 54, fill: wood.dark }), el("rect", { x: 721, y: 148, width: 5, height: 54, fill: wood.dark }),
          el("path", { d: "M646 150 Q685 178 724 150", fill: "none", stroke: wood.dark, "stroke-width": 3 }),
          ...hangers,
          el("path", { d: "M664 120 q-6 40 4 68 M700 116 q8 36 -2 70", fill: "none", stroke: "#3f8f57", "stroke-width": 4, "stroke-linecap": "round" }),
        ];
      }
      case "rack": {
        if (!above) return [];
        const teeth = [];
        for (let x = 332; x <= 568; x += 10) teeth.push(el("rect", { x: x - 2, y: 196, width: 4, height: 8, rx: 1, fill: "#4a5568" }));
        return teeth;
      }
      default:
        return [];
    }
  }

  // Rechts ein Berg mit zwei Tunnelmündern, links ein dichter Wald: dahinter
  // dreht sich der Zug um.
  function buildCovers(map, { ferryUp = false } = {}) {
    const look = lookOf(map);
    const rockDark = shade(look.rock, -0.3);
    const portal = (x, y) => group({}, [
      el("path", { d: `M${x - 22} ${y + 6} v-30 a22 24 0 0 1 44 0 v30 z`, fill: rockDark }),
      el("path", { d: `M${x - 15} ${y + 6} v-26 a15 17 0 0 1 30 0 v26 z`, fill: "#1f2733" }),
      // In der Nacht leuchtet der Tunnelmund: der Scheinwerfer der Lok.
      ...(look.stars ? [el("ellipse", { cx: x, cy: y - 10, rx: 11, ry: 13, fill: "#ffe066", opacity: "0.3", class: "journey-portal-glow" })] : []),
    ]);
    // Auf der See-Karte ist die Kehre rechts eine Bucht: der Zug fährt ins
    // Bootshaus, die Fähre trägt ihn hinüber, oben kommt er wieder heraus.
    const pier = (x, y) => group({}, [
      el("rect", { x: x - 24, y: y - 48, width: 48, height: 48, rx: 4, fill: "#e8d9a8" }),
      el("polygon", { points: `${x - 30},${y - 46} ${x + 30},${y - 46} ${x},${y - 66}`, fill: "#c9483a" }),
      el("rect", { x: x - 15, y: y - 34, width: 30, height: 34, rx: 3, fill: "#1f2733" }),
      el("rect", { x: x - 6, y: y - 30, width: 12, height: 8, rx: 2, fill: "#a8ddf0" }),
    ]);
    const mountain = map.feature === "ferry"
      ? group({ class: "journey-bay" }, [
        el("rect", { x: 1035, y: 330, width: BLEED + W, height: H + BLEED, fill: "#57b6d8" }),
        el("path", { d: "M1050 400 q10 -6 20 0 t20 0 t20 0 M1080 470 q10 -6 20 0 t20 0 t20 0 M1060 560 q10 -6 20 0 t20 0 t20 0", fill: "none", stroke: "#8fd8ee", "stroke-width": 3, "stroke-linecap": "round", opacity: "0.8" }),
        group({ class: "journey-ferry-host", transform: `translate(1122,${ferryUp ? 370 : 540})` }, [art.buildFerry()]),
        pier(1035, 540), pier(1035, 370),
      ])
      : group({}, [
        el("polygon", { points: `1035,${H + BLEED} 1035,320 1090,280 1150,296 ${W + BLEED},360 ${W + BLEED},${H + BLEED}`, fill: look.rock }),
        el("polygon", { points: "1035,320 1090,280 1150,296 1122,322 1078,310", fill: shade(look.rock, 0.12) }),
        el("polygon", { points: "1082,290 1090,280 1104,286 1096,294 1088,290", fill: "#f4f8fb" }),
        portal(1035, 540), portal(1035, 370),
      ]);
    const crowns = [[40, 350, 48], [100, 362, 52], [150, 342, 44], [60, 280, 50], [120, 290, 54], [45, 210, 46], [110, 205, 50], [160, 230, 40], [80, 150, 44], [140, 160, 42], [-20, 300, 50], [-60, 220, 46]];
    const forest = group({}, [
      ...[[40, 420], [100, 426], [150, 420]].map(([x, y]) => el("rect", { x: x - 6, y: y - 40, width: 12, height: 40, rx: 4, fill: look.trunk })),
      ...crowns.map(([cx, cy, r], i) => el("circle", { cx, cy, r, fill: i % 3 === 1 ? shade(look.crown, 0.1) : i % 3 === 2 ? shade(look.crown, -0.1) : look.crown })),
    ]);
    return group({ class: "journey-covers", "aria-hidden": "true" }, [mountain, forest]);
  }

  // ---------------------------------------------------------------------------
  // Das Gleis
  // ---------------------------------------------------------------------------
  // Gezeichnet wie die Rampen zu den Toren: Schwellenband, Schiene, Lichtkante.
  function rails(extra = {}) {
    return group(extra, [
      el("path", { d: PATH_D, fill: "none", stroke: "#7b5c3a", "stroke-width": 17, "stroke-linecap": "round", opacity: "0.4" }),
      el("path", { d: PATH_D, fill: "none", stroke: "#8c93a1", "stroke-width": 9, "stroke-linecap": "round" }),
      el("path", { d: PATH_D, fill: "none", stroke: "#dfe4ec", "stroke-width": 3, "stroke-linecap": "round", opacity: "0.85" }),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Belohnungen als Bild
  // ---------------------------------------------------------------------------
  // Dasselbe Bild im Schaufenster, auf der Feier-Tafel und – als Vorlage – in
  // der Werkstatt: die eigene Lok mit dem neuen Teil, auf das Teil beschnitten.
  function partPicture(part, config) {
    const box = art.PART_PREVIEW[part] || art.PART_FOCUS[part] || art.PART_FOCUS.whole;
    return el("svg", { viewBox: `${box.x} ${box.y} ${box.width} ${box.height}`, class: "journey-reward-art", "aria-hidden": "true" }, [strip(art.buildLoco(config))]);
  }

  let thumbUid = 0;
  function sceneThumb(id) {
    const list = scenes();
    const scene = list?.BY_ID?.[id];
    if (!scene) return null;
    const skyId = `journey-thumb-${thumbUid += 1}`;
    return el("svg", { viewBox: `0 0 ${list.TW} ${list.TH}`, class: "journey-reward-art journey-reward-scene", "aria-hidden": "true" }, [
      el("defs", {}, [
        el("linearGradient", { id: skyId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
          el("stop", { offset: "0", "stop-color": scene.sky[0] }),
          el("stop", { offset: "1", "stop-color": scene.sky[1] }),
        ]),
      ]),
      el("rect", { x: 0, y: 0, width: list.TW, height: list.TH, fill: `url(#${skyId})` }),
      el("circle", { cx: 98, cy: 16, r: 8, fill: scene.light.color }),
      ...scene.thumb(),
    ]);
  }

  function rewardPicture(reward, loco) {
    const base = art.locoConfig(loco || {});
    switch (reward.id) {
      case "flag-rainbow": return partPicture("flag", { ...base, flag: { ...base.flag, pattern: "rainbow" } });
      case "driver-squirrel": return partPicture("driver", { ...base, driver: "squirrel" });
      case "driver-ibex": return partPicture("driver", { ...base, driver: "ibex" });
      case "whistle-schiffshorn": return partPicture("whistle", { ...base, whistle: "schiffshorn" });
      case "starloco": return partPicture("whole", { ...base, lamp: { ...base.lamp, shape: "star" }, flag: { pattern: "stars", color: "#2f6f8f" } });
      case "scene-savanne": return sceneThumb("savanne") || partPicture("whole", base);
      case "gold-1": return partPicture("wheels", { ...base, wheels: { ...base.wheels, shape: "sun" } });
      case "gold-2": return partPicture("flag", { ...base, flag: { ...base.flag, pattern: "sun" } });
      case "scene-weltraum": return sceneThumb("weltraum") || partPicture("whole", base);
      default:
        // Reise 2: ein Goldstern auf dem Reise-Schild – das Führerhaus mit
        // Fenster und Schild, alle sechs Sterne, so viele golden wie verdient.
        if (reward.part === "plate") {
          return el("svg", { viewBox: "-2 56 92 100", class: "journey-reward-art", "aria-hidden": "true" }, [
            strip(art.buildLoco({ ...base, journeyStars: 6, journeyGold: Math.max(1, Number(reward.star) || 1) })),
          ]);
        }
        return partPicture("whole", base);
    }
  }

  // ---------------------------------------------------------------------------
  // Die Karte
  // ---------------------------------------------------------------------------
  let mountToken = 0;
  let playing = false;
  let settleHook = null;

  function isPlaying() { return playing; }

  /*
   * Baut die Karte in host.
   *
   *   host       das Element in der Bühnen-Ebene
   *   stage      die Bühne, für die Feier-Tafel und Konfetti
   *   loco       die Lok des Kindes (für den kleinen Zug und die Bilder)
   *   areas      der Stand der fünf Wagen (train-progress.js)
   *   mode       "enter"  – der Zug fährt ein (von den Toren her)
   *              "return" – zurück aus einem Spiel: was neu ist, wird gefeiert
   *              "quiet"  – nur zeichnen (Neuzeichnen der Bühne)
   *   returned   die Station, aus der das Kind zurückkommt (oder null)
   *   celebrate  (fn) => void: reiht eine Feier in die Warteschlange der Bühne
   *   onPlay     (url) => void: das Kind will ein Spiel öffnen
   *   onSettled  () => void: die Feiern sind durch
   */
  function mount({ host, stage, loco, areas, mode = "quiet", returned = null, visit = null, celebrate, onPlay, onVisit, onSettled }) {
    const token = mountToken += 1;
    settleHook = onSettled || null;
    host.innerHTML = "";
    host.classList.add("journey");
    if (mode === "enter") host.classList.add("is-entering");
    if (mode === "visit") {
      host.classList.add("is-switching");
      window.setTimeout(() => host.classList.remove("is-switching"), 900);
    }

    const seen = reise.readSeen() || { station: 1, gold: [], goldenMaps: 0, pushed: [] };
    // Die Schiebelok: nach fünf Fehlversuchen an der aktuellen Station
    // schiebt sie den Zug weiter, sobald das Kind auf die Karte zurückkommt.
    let pushPending = null;
    if (Number.isInteger(returned) && reise.needsPush(returned) && returned === reise.current()) {
      if (reise.pushThrough(returned)) pushPending = returned;
    }
    const current = reise.current();
    const total = reise.STATION_COUNT;
    const currentMap = Math.min(reise.MAPS.length - 1, reise.mapIndexOf(Math.min(current, total)));
    // Zu Besuch auf einer fertigen Karte: vom Fahrplan aus, oder zurück aus
    // einer Station, die dort noch einmal gespielt wurde. Dort gibt es keine
    // Fahrt mehr, nur Stempel, die golden werden können.
    // Zurück aus der letzten Station einer Karte ist kein Besuch, solange die
    // Karte ihre Ankunft noch nicht gefeiert hat (die gemerkte Station liegt
    // dann noch nicht dahinter): erst die Feier, dann rückt der Zug weiter.
    let visiting = null;
    if (Number.isInteger(visit) && visit >= 0 && visit < currentMap && reise.mapFinished(visit)) visiting = visit;
    else if (returned && reise.mapIndexOf(returned) < currentMap && reise.mapFinished(reise.mapIndexOf(returned)) && seen.station > returned) visiting = reise.mapIndexOf(returned);
    // Von welcher Station aus gespielt wird: dort, wo die Karte den Zug
    // zuletzt gezeigt hat – oder an der aktuellen, wenn nichts neu ist. Beim
    // blossen Neuzeichnen und zu Besuch steht gleich der Endstand da.
    const startNr = mode === "quiet" || visiting !== null ? Math.min(current, total + 1) : Math.max(1, Math.min(seen.station, current, total));
    let mapIndex = visiting !== null ? visiting : Math.min(reise.MAPS.length - 1, reise.mapIndexOf(Math.min(startNr, total)));
    let visibleCurrent = Math.min(startNr, total + 1);
    const goldShown = new Set(seen.gold || []);
    // Golden zeigt sich ein Stempel sofort – ausser an der Station, aus der
    // das Kind gerade zurückkommt: dort fällt er erst mit der Feier.
    const goldPending = returned && reise.isDone(returned) && (Number(reise.doneInfo(returned)?.stars) || 0) >= 3 && !goldShown.has(returned)
      ? returned : null;
    // Und ein echter Stempel auf einer Station, die vorher nur geschoben war.
    const restampPending = returned && reise.isDone(returned) && !reise.doneInfo(returned)?.pushed && (seen.pushed || []).includes(returned)
      ? returned : null;
    let restampShown = false;

    // --- SVG und Ebenen ------------------------------------------------------
    const svg = el("svg", {
      class: "stage-svg journey-map", viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMax meet",
      role: "group", "aria-label": "Die Streckenkarte der Reise",
    });
    const layers = {};
    ["bg", "track", "lit", "front", "stations", "signal", "train", "covers"].forEach((name) => {
      layers[name] = group({ class: `journey-layer journey-${name}` });
      svg.append(layers[name]);
    });

    // Gemessen wird am eigenen Lineal, einmal für die ganze Sitzung.
    const { total: total_, L, platform: PLATFORM_D, bay: BAY_D, at: pointAt } = measureRail();
    const headAt = (i) => L[i] - STOP_BEFORE;

    // --- Kopfzeile: zehn Punkte ----------------------------------------------
    // Ein Knopf: die zehn Punkte dieser Karte, und ein Tipp darauf öffnet den
    // Fahrplan mit allen sechs.
    const dots = document.createElement("button");
    dots.type = "button";
    dots.className = "journey-dots";
    dots.addEventListener("click", () => { if (!busy && !playing) showPlan(); });

    // --- Konfetti-Host über einem Punkt der Karte ------------------------------
    function burstXY(cx, cy, count = 26) {
      const box = svg.getBoundingClientRect();
      const hostBox = host.getBoundingClientRect();
      if (!box.width) return;
      const scale = box.width / W;
      const spot = document.createElement("div");
      spot.className = "journey-burst";
      spot.style.left = `${box.left - hostBox.left + (cx - 60) * scale}px`;
      spot.style.top = `${box.top - hostBox.top + (cy - 60) * scale}px`;
      spot.style.width = `${120 * scale}px`;
      spot.style.height = `${120 * scale}px`;
      host.append(spot);
      kids()?.burstConfetti?.(spot, count);
      window.setTimeout(() => spot.remove(), 2800);
    }
    function burstAt(i, count = 26) {
      const [x, y] = STOPS[i];
      burstXY(x, y - 140, count);
    }
    // Feuerwerk über der Nacht-Karte: Schlag auf Schlag über den Himmel.
    async function fireworks() {
      const spots = [[300, 80], [640, 50], [900, 100], [460, 130], [780, 30], [1050, 70]];
      for (const [x, y] of spots) {
        if (token !== mountToken) return;
        burstXY(x, y, 32);
        kids()?.playStarSound?.(2);
        await wait(230);
      }
    }

    // --- Der Zug ---------------------------------------------------------------
    const plate = reise.plateStars();
    const train = group({ class: "journey-train", "aria-hidden": "true" });
    const vehicles = [];
    const locoNode = group({}, [strip(art.buildLoco({ ...art.locoConfig(loco || {}), journeyStars: plate.stars, journeyGold: plate.gold }))]);
    // Der Scheinwerferkegel vor der Lok – zu sehen nur in der Nacht und im
    // All, und nur in der Fahrt (styles.css).
    locoNode.append(el("polygon", { points: "192,98 340,58 340,150", fill: "#ffe066", class: "journey-headlight" }));
    vehicles.push({ node: locoNode, cx: 100, off: 100 * TRAIN_SCALE });
    [...AREA_ORDER].reverse().forEach((id, j) => {
      const area = (areas || []).find((entry) => entry.id === id) || { wagon: "boxcar", color: "#7C5CE6", stage: 0 };
      const wagon = strip(art.buildWagon(area.wagon, area.color, area.stage));
      vehicles.push({ node: group({}, [wagon]), cx: 70, off: (art.LOCO_W + art.WAGON_GAP + 70 + j * (art.WAGON_W + art.WAGON_GAP)) * TRAIN_SCALE });
    });
    [...vehicles].reverse().forEach((v) => train.append(v.node));
    layers.train.append(train);
    const TRAIN_LEN = (art.LOCO_W + art.WAGON_GAP + AREA_ORDER.length * (art.WAGON_W + art.WAGON_GAP)) * TRAIN_SCALE;

    // Der Fahrgast schaut aus dem ersten Wagen hinter der Lok. Die äussere
    // Gruppe stellt ihn hin, die innere blendet das Stylesheet ein und aus –
    // ein CSS-transform würde die Aufstellung überschreiben.
    const aboardSlot = group({ transform: `translate(${art.WAGON_W / 2},74)` });
    vehicles[1].node.append(aboardSlot);
    let aboardHead = null;
    function setAboard(passengerId, shown) {
      aboardSlot.innerHTML = "";
      aboardHead = null;
      if (!passengerId) return;
      aboardHead = group({ class: `journey-aboard${shown ? " is-aboard" : ""}` }, [strip(art.driverHead(passengerId, 15))]);
      aboardSlot.append(aboardHead);
    }

    let head = 0;
    function place(v, d) {
      const p = pointAt(d);
      const q = pointAt(d + 2);
      const a = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      const left = Math.cos(a * Math.PI / 180) < 0;
      const r = left ? a - 180 : a;
      v.node.setAttribute("transform", `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${r.toFixed(1)}) ${left ? "scale(-1,1) " : ""}scale(${TRAIN_SCALE}) translate(${-v.cx},${-art.GROUND})`);
    }
    function setHead(d) {
      head = d;
      vehicles.forEach((v) => place(v, d - v.off));
    }
    function drive(from, to, ms, during = null) {
      return new Promise((resolve) => {
        if (reduced() || token !== mountToken) { setHead(to); during?.(to); resolve(); return; }
        train.classList.add("is-driving");
        const t0 = performance.now();
        const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
        const step = (now) => {
          if (token !== mountToken) { train.classList.remove("is-driving"); resolve(); return; }
          const t = Math.min(1, (now - t0) / ms);
          setHead(from + (to - from) * ease(t));
          during?.(head);
          if (t < 1) { window.requestAnimationFrame(step); return; }
          train.classList.remove("is-driving");
          resolve();
        };
        window.requestAnimationFrame(step);
      });
    }
    // Ein einzelnes Fahrzeug fährt: die Schiebelok kommt und geht allein.
    function slide(v, from, to, ms) {
      return new Promise((resolve) => {
        if (reduced() || token !== mountToken) { place(v, to); resolve(); return; }
        const t0 = performance.now();
        const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
        const step = (now) => {
          if (token !== mountToken) { resolve(); return; }
          const t = Math.min(1, (now - t0) / ms);
          place(v, from + (to - from) * ease(t));
          if (t < 1) { window.requestAnimationFrame(step); return; }
          resolve();
        };
        window.requestAnimationFrame(step);
      });
    }

    // --- Signal ----------------------------------------------------------------
    const signal = art.buildJourneySignal();
    layers.signal.append(signal);
    function placeSignal(i) {
      const [x, y] = STOPS[i];
      signal.setAttribute("transform", `translate(${x + 58},${y})`);
      signal.classList.remove("is-hidden");
    }
    function hideSignal() { signal.classList.add("is-hidden"); }

    // --- Stationen -------------------------------------------------------------
    const stationNodes = [];

    function nrOf(i) { return mapIndex * reise.STATIONS_PER_MAP + i + 1; }

    // Ob eine Station als gestempelt gezeigt wird: gespeichert ist sie es
    // vielleicht schon, aber die Feier ist noch nicht bei ihr angekommen.
    function shownDone(nr) { return reise.isDone(nr) && nr < visibleCurrent; }
    function shownGold(nr) {
      const info = reise.doneInfo(nr);
      if (!info || (Number(info.stars) || 0) < 3 || !shownDone(nr)) return false;
      return nr !== goldPending || goldShown.has(nr);
    }
    // Grau, wo die Schiebelok geschoben hat – und noch grau, bis der echte
    // Stempel, mit dem das Kind zurückkommt, gefeiert ist.
    function shownPushed(nr) {
      const info = reise.doneInfo(nr);
      if (!info) return false;
      if (info.pushed) return true;
      return nr === restampPending && !restampShown && !goldShown.has(nr);
    }

    function building(gameId, color, title) {
      const node = strip(art.buildBuilding(gameId, { hue: color, label: title }));
      // Die Klasse für das Wachsen beim Antippen. Sie muss auf dem Bild selbst
      // sitzen und nicht auf der Gruppe, die es aufstellt: ein transform-origin
      // aus dem Stylesheet verschiebt sonst die Aufstellung mit.
      node.classList.add("journey-motif");
      return node;
    }

    function buildStation(i) {
      const nr = nrOf(i);
      const [x, y] = STOPS[i];
      const task = reise.taskFor(nr);
      const color = task?.color || "#7C5CE6";
      const g = group({ class: "journey-station", "data-station": String(nr), transform: `translate(${x},${y})` });
      // Grosse, unsichtbare Trefferfläche: ein Kinderfinger trifft die Station,
      // nicht das Bild. Sie reicht bis unter die Nummer – die ist das Ziel,
      // das ein Kind ansteuert.
      g.append(el("rect", { x: -64, y: -112, width: 128, height: 168, rx: 18, fill: "transparent", class: "journey-station-hit" }));

      if (task?.choice) {
        // Wahlstation: zwei Bilder nebeneinander, jedes für sich antippbar.
        g.classList.add("has-choice");
        task.choice.forEach((option, k) => {
          const pick = group({
            class: "journey-choice", "data-choice": option.game, role: "button", tabindex: "0",
            "aria-label": `${option.title}: ${option.speech}`,
            transform: `translate(${k === 0 ? -66 : 8},${-4 - art.GROUND * CHOICE_SCALE}) scale(${CHOICE_SCALE})`,
          }, [
            el("rect", { x: -6, y: art.GROUND - art.BUILD_H - 6, width: art.BUILD_W + 12, height: art.BUILD_H + 12, rx: 14, fill: "transparent" }),
            building(option.game, color, option.title),
          ]);
          activate(pick, () => choose(nr, option));
          g.append(pick);
        });
        g.append(group({ transform: "translate(0,10)" }, [art.buildSwitchMark(color)]));
      } else if (task) {
        g.append(group({ class: "journey-picture", transform: `translate(-40,${-4 - art.GROUND * STATION_SCALE}) scale(${STATION_SCALE})` }, [building(task.game, color, task.title)]));
        if (task.viaAlt) g.append(group({ transform: "translate(-60,4)" }, [art.buildSwitchMark(color)]));
      }

      // Die Nummer unter dem Gleis: gross, in der Farbe ihres Bereichs, mit
      // weissem Rand. Sie ist die eine Zahl, die hier stehen darf – und
      // zugleich das Ziel für den Finger. An der Station, die dran ist, legt
      // sich ein grüner Ring darum und pulst: hier geht es weiter.
      g.append(group({ class: "journey-number" }, [
        el("circle", { cx: 0, cy: 30, r: 29, class: "journey-number-ring", fill: "none", stroke: "#3fbf74", "stroke-width": 5 }),
        el("circle", { cx: 0, cy: 30, r: 23, class: "journey-number-disc", fill: color, stroke: "#ffffff", "stroke-width": 4 }),
        textNode(0, i + 1 >= 10 ? 39 : 39.5, i + 1 >= 10 ? 24 : 27, "#ffffff", i + 1),
      ]));
      g.append(group({ class: "journey-stamp-slot", transform: "translate(36,-98)" }));
      g.append(group({ transform: "translate(0,-52) scale(1.3)" }, [art.buildFog()]));

      // Das Ausweichgleis: nach zwei Fehlversuchen steht neben der Station ein
      // zweites Spiel, mit gestellter Weiche davor.
      const alt = !task?.choice && !task?.viaAlt && !reise.isDone(nr) && reise.triesFor(nr) >= reise.TRIES_FOR_ALT ? reise.altTaskFor(nr) : null;
      if (alt) {
        const side = group({
          class: "journey-alt", role: "button", tabindex: "0", "aria-label": `Ausweichgleis: ${alt.title}. ${alt.speech}`,
          transform: `translate(${x > 700 ? -128 : 68},0)`,
        }, [
          el("rect", { x: -34, y: -74, width: 70, height: 84, rx: 12, fill: "transparent" }),
          el("path", { d: x > 700 ? "M64 0 q-30 0 -40 -6" : "M-64 0 q30 0 40 -6", fill: "none", stroke: "#8c93a1", "stroke-width": 6, "stroke-linecap": "round", opacity: "0.8" }),
          group({ transform: `translate(-27,${-6 - art.GROUND * ALT_SCALE}) scale(${ALT_SCALE})` }, [building(alt.game, color, alt.title)]),
          group({ transform: "translate(-34,-4)" }, [art.buildSwitchMark(color)]),
        ]);
        activate(side, () => { if (busy) return; reise.useAlt(nr); go(reise.taskFor(nr)); });
        g.append(side);
      }

      if (!task?.choice) activate(g, () => onStation(i));
      return g;
    }

    function renderStations() {
      layers.stations.innerHTML = "";
      stationNodes.length = 0;
      for (let i = 0; i < reise.STATIONS_PER_MAP; i += 1) {
        const node = buildStation(i);
        stationNodes.push(node);
        layers.stations.append(node);
      }
      applyStates();
    }

    function stampFor(i, { fresh = false } = {}) {
      const nr = nrOf(i);
      const task = reise.taskFor(nr);
      const slot = stationNodes[i]?.querySelector(".journey-stamp-slot");
      if (!slot) return;
      slot.innerHTML = "";
      const stamp = art.buildStamp(task?.color || "#7C5CE6", { gold: shownGold(nr), pushed: shownPushed(nr) });
      if (fresh) stamp.classList.add("is-new");
      slot.append(stamp);
    }

    function applyStates() {
      stationNodes.forEach((node, i) => {
        const nr = nrOf(i);
        const done = shownDone(nr);
        node.classList.toggle("is-done", done);
        node.classList.toggle("is-current", nr === visibleCurrent);
        node.classList.toggle("is-next", nr === visibleCurrent + 1);
        node.classList.toggle("is-fog", !done && nr > visibleCurrent + 1);
        const tappable = nr === visibleCurrent || done;
        if (tappable && !node.classList.contains("has-choice")) { node.setAttribute("role", "button"); node.setAttribute("tabindex", "0"); }
        else { node.removeAttribute("role"); node.removeAttribute("tabindex"); }
        const task = reise.taskFor(nr);
        const label = task?.choice
          ? `Station ${i + 1}, Wahlstation: ${task.choice.map((c) => c.title).join(" oder ")}.`
          : `Station ${i + 1}: ${task?.title || ""}. ${task?.speech || ""}`;
        node.setAttribute("aria-label", `${label}${done ? (shownPushed(nr) ? " Von der Schiebelok geschoben, noch ohne Stempel." : " Gestempelt.") : nr === visibleCurrent ? " Hier geht es weiter." : nr > visibleCurrent + 1 ? " Noch im Nebel." : ""}`);
        if (done && !node.querySelector(".journey-stamp")) stampFor(i);
      });
      dots.innerHTML = "";
      dots.append(el("svg", { viewBox: "0 -10 96 62", class: "journey-dots-glyph", "aria-hidden": "true" }, [art.routeGlyph("currentColor")]));
      let doneCount = 0;
      for (let i = 0; i < reise.STATIONS_PER_MAP; i += 1) {
        const nr = nrOf(i);
        const d = document.createElement("span");
        d.className = "journey-dot";
        if (shownDone(nr)) { d.classList.add(shownPushed(nr) ? "is-pushed" : shownGold(nr) ? "is-gold" : "is-done"); doneCount += 1; }
        dots.append(d);
      }
      dots.setAttribute("aria-label", `Fahrplan öffnen. Karte ${reise.MAPS[mapIndex].nr}: ${doneCount} von ${reise.STATIONS_PER_MAP} Stationen gestempelt.`);
    }

    // --- Ziel-Bahnhof und Fahrgast ---------------------------------------------
    let showcase = null;
    let landmarkNode = null;
    let platformFigure = null;
    let boarded = false;
    // Wo der Fahrgast gerade ist: auf dem Bahnsteig, bis der Zug Station 1
    // verlässt; im Wagen, bis die Karte fertig ist; dann zu Hause am Ziel.
    function passengerState() {
      if (visibleCurrent > nrOf(reise.STATIONS_PER_MAP - 1)) return "home";
      if (visibleCurrent > nrOf(0)) return "aboard";
      return "platform";
    }
    function placeHome(map, arriving) {
      const figure = group({ class: `journey-passenger-stand is-home${arriving ? " is-arriving" : ""}` }, [art.buildPassenger(map.passenger, { waving: true })]);
      layers.front.append(group({ transform: `translate(${HOME_AT[0]},${HOME_AT[1]}) scale(0.9)` }, [figure]));
      landmarkNode?.classList.add("is-lit");
    }
    // Der erste Wagen fährt am Bahnsteig vorbei: der Fahrgast springt auf.
    function boardPassenger() {
      if (boarded) return;
      boarded = true;
      platformFigure?.classList.add("is-boarding");
      aboardHead?.classList.add("is-aboard");
      kids()?.playStarSound?.(0);
    }
    // Am Ziel steigt er aus, winkt – und zu Hause geht ein Licht an.
    function alightPassenger(map) {
      if (!map.passenger) return;
      aboardHead?.classList.remove("is-aboard");
      placeHome(map, true);
    }
    function renderFront(map) {
      layers.front.innerHTML = "";
      const [lx, ly] = LANDMARK_AT;
      landmarkNode = art.buildLandmark(map.landmark);
      layers.front.append(group({ transform: `translate(${lx},${ly})` }, [landmarkNode]));
      const [sx, sy] = SHOWCASE_AT;
      const pic = rewardPicture(map.reward, loco);
      pic.setAttribute("x", "-25");
      pic.setAttribute("y", "-22");
      pic.setAttribute("width", "50");
      pic.setAttribute("height", "44");
      const unlocked = reise.mapFinished(mapIndex) && visibleCurrent > nrOf(reise.STATIONS_PER_MAP - 1);
      showcase = art.buildShowcase(pic, { locked: !unlocked });
      showcase.setAttribute("role", "img");
      showcase.setAttribute("aria-label", `${unlocked ? "Belohnung dieser Karte, freigeschaltet" : "Belohnung dieser Karte, noch gesperrt"}: ${map.reward.label}.`);
      layers.front.append(group({ transform: `translate(${sx},${sy})` }, [showcase]));

      // Der Fahrgast: auf dem Bahnsteig, im Wagen oder zu Hause.
      platformFigure = null;
      const state = map.passenger ? passengerState() : null;
      if (state === "platform") {
        platformFigure = group({ class: "journey-passenger-stand" }, [art.buildPassenger(map.passenger)]);
        layers.front.append(group({ transform: `translate(${PLATFORM_AT[0]},${PLATFORM_AT[1]})` }, [platformFigure]));
      } else if (state === "home") {
        placeHome(map, false);
      }
      setAboard(map.passenger, state === "aboard");
      boarded = state !== "platform";
    }

    // --- Die ganze Karte zeichnen ----------------------------------------------
    function drawMap() {
      const map = reise.MAPS[mapIndex];
      host.dataset.map = map.id;
      if (lookOf(map).stars) host.dataset.night = "1"; else delete host.dataset.night;
      layers.bg.innerHTML = "";
      layers.bg.append(buildBackground(map));
      layers.track.innerHTML = "";
      layers.track.append(...featureTrack(map), rails({ class: "journey-rails-dim" }), ...featureTrack(map, { above: true }));
      layers.lit.innerHTML = "";
      // Gelegt ist das Gleis bis zur aktuellen Station.
      const upto = Math.min(reise.STATIONS_PER_MAP - 1, Math.max(0, visibleCurrent - nrOf(0)));
      layers.lit.append(litSegment(0, L[upto]));
      renderFront(map);
      layers.covers.innerHTML = "";
      layers.covers.append(buildCovers(map, { ferryUp: visibleCurrent >= nrOf(4) }));
      renderStations();
    }
    // Die Fähre trägt den Zug vom unteren Bootshaus zum oberen.
    function ferryCross() {
      const ferry = layers.covers.querySelector(".journey-ferry-host");
      return new Promise((resolve) => {
        if (!ferry) { resolve(); return; }
        kids()?.playWhistle?.("schiffshorn");
        const from = STOPS[0][1];
        const to = STOPS[4][1];
        const dock = () => ferry.setAttribute("transform", `translate(1122,${to})`);
        if (reduced() || !ferry.animate) { dock(); resolve(); return; }
        const anim = ferry.animate(
          [{ transform: `translate(1122px, ${from}px)` }, { transform: `translate(1122px, ${to}px)` }],
          { duration: 1800, easing: "ease-in-out", fill: "forwards" },
        );
        anim.finished.catch(() => {}).then(() => { dock(); anim.cancel(); resolve(); });
      });
    }

    function litSegment(a, b) {
      const g = rails({ class: "journey-rails-lit" });
      g.querySelectorAll("path").forEach((p) => {
        p.setAttribute("stroke-dasharray", `${Math.max(0, b - a)} ${total_ + 10}`);
        p.setAttribute("stroke-dashoffset", String(-a));
      });
      return g;
    }

    function layTrack(a, b) {
      const g = litSegment(a, b);
      layers.lit.append(g);
      if (reduced() || token !== mountToken || !g.querySelector("path").animate) return Promise.resolve();
      const anims = [...g.querySelectorAll("path")].map((p) => p.animate(
        [{ strokeDasharray: `0 ${total_ + 10}` }, { strokeDasharray: `${b - a} ${total_ + 10}` }],
        { duration: 700, easing: "ease-out", fill: "forwards" },
      ));
      return Promise.all(anims.map((a_) => a_.finished.catch(() => {}))).then(() => {});
    }

    // --- Sprechen --------------------------------------------------------------
    let justPushed = null;
    function speakState() {
      const map = reise.MAPS[mapIndex];
      const lapPrefix = map.lap === 2 ? "Reise 2, " : "";
      if (visiting !== null) {
        kids()?.setHelp?.(`${lapPrefix}Karte ${map.nr}, ${map.name} – fertig. Tippe auf eine Station, um sie noch einmal zu spielen: mit drei Sternen wird der Stempel golden. Mit dem Pfeil oben links kommst du zurück zu deiner Karte.`);
        return;
      }
      if (visibleCurrent > reise.STATION_COUNT) {
        kids()?.setHelp?.("Du hast beide Reisen geschafft – alle hundertdreissig Stationen! Dein Zug steht an der Sternwarte, und auf dem Reise-Schild sind alle Sterne golden.");
        return;
      }
      const i = visibleCurrent - nrOf(0);
      const task = reise.taskFor(visibleCurrent);
      if (!task) return;
      let text = `${lapPrefix}Karte ${map.nr}, ${map.name}. Station ${i + 1} von ${reise.STATIONS_PER_MAP}. `;
      if (justPushed) {
        text += "Die Schiebelok hat den Zug zur nächsten Station geschoben. Die Station davor hat noch keinen Stempel – du kannst sie später noch einmal spielen. ";
        justPushed = null;
      }
      if (i === 0 && map.passenger) text += `Auf dem Bahnsteig wartet ${passengerName(map.passenger)}: ${passengerPronoun(map.passenger).toLowerCase()} fährt mit. `;
      if (task.choice) {
        text += `Wahlstation: ${task.choice.map((c) => c.title).join(" oder ")}. Tippe eines an.`;
      } else {
        text += `Als Nächstes: ${task.title}. ${task.speech} Tippe auf die Station mit dem grünen Signal.`;
        if (!task.viaAlt && reise.triesFor(visibleCurrent) >= reise.TRIES_FOR_ALT) {
          const alt = reise.altTaskFor(visibleCurrent);
          if (alt) text += ` Oder nimm das Ausweichgleis: ${alt.title}.`;
        }
      }
      const left = reise.STATIONS_PER_MAP - i;
      text += ` Am Ziel wartet: ${map.reward.label}${left > 1 ? `, noch ${left} Stationen` : ", die nächste Station"}.`;
      kids()?.setHelp?.(text);
    }

    // --- Antippen --------------------------------------------------------------
    let busy = false;
    function go(task) {
      if (!task || task.choice || busy) return;
      busy = true;
      onPlay?.(reise.urlFor(task));
    }
    function choose(nr, option) {
      if (busy || nr !== visibleCurrent || playing) return;
      reise.choose(nr, option.game);
      const node = stationNodes[nr - nrOf(0)];
      node?.querySelectorAll(".journey-choice").forEach((pick) => {
        pick.classList.toggle("is-chosen", pick.dataset.choice === option.game);
        pick.classList.toggle("is-dropped", pick.dataset.choice !== option.game);
      });
      window.setTimeout(() => go(reise.taskFor(nr)), reduced() ? 0 : 320);
    }
    function onStation(i) {
      if (busy || playing) return;
      const nr = nrOf(i);
      if (nr !== visibleCurrent && !shownDone(nr)) return;
      go(reise.taskFor(nr));
    }

    // --- Feiern: was seit dem letzten Mal dazukam ------------------------------
    function stationIndexOf(nr) { return nr - nrOf(0); }

    async function finishMap(map) {
      // Das Wahrzeichen tut etwas, der Fahrgast steigt aus und zu Hause geht
      // ein Licht an, das Schloss fällt, dann die Tafel. In der Nacht dazu
      // Feuerwerk über der Sternwarte.
      svg.classList.add("is-party");
      showcase?.classList.remove("is-locked");
      showcase?.setAttribute("aria-label", `Belohnung dieser Karte, freigeschaltet: ${map.reward.label}.`);
      kids()?.playJingle?.("wagon");
      kids()?.vibrate?.([12, 60, 18]);
      burstAt(reise.STATIONS_PER_MAP - 1, 40);
      alightPassenger(map);
      if (map.feature === "night") await fireworks(); else await wait(1300);
      if (token !== mountToken) return;
      const firstLap = reise.LAPS[0];
      const lastOfFirst = mapIndex === firstLap.firstMap + firstLap.maps - 1;
      const lastOfAll = mapIndex === reise.MAPS.length - 1;
      const home = map.passenger
        ? ` ${passengerName(map.passenger).replace(/^\w/, (c) => c.toUpperCase())} ist zu Hause: ${LANDMARK_HOMES[map.landmark] || "am Ziel"} geht ein Licht an.`
        : "";
      const where = map.reward.part === "scene" ? "Du kannst sie oben links auswählen."
        : map.reward.part === "plate" ? "Er leuchtet auf dem Reise-Schild deiner Lok – auch für die Gruppe zu sehen."
        : "Du findest es in der Werkstatt an deiner Lok.";
      const onward = lastOfAll ? " Beide Reisen sind geschafft – alle hundertdreissig Stationen!"
        : lastOfFirst ? " Die ganze erste Reise ist geschafft – und weiter geht es: Reise 2 beginnt im Weltraum!" : "";
      await showReward({
        aria: `Karte ${map.nr} geschafft: ${map.reward.label} ist frei.${onward}`,
        title: lastOfAll ? "Beide Reisen geschafft!" : `Karte ${map.nr} geschafft!`,
        note: `Neu für deinen Zug: ${map.reward.part === "plate" ? "ein goldener Stern" : map.reward.label}. ${where}${home}${onward}`,
        picture: rewardPicture(map.reward, loco),
        color: map.lap === 2 ? "#b8860b" : "#2b5fb3",
      });
      svg.classList.remove("is-party");
    }

    // Die Schiebelok kommt von hinten, kuppelt an, schiebt mit – und fährt
    // nach der Station wieder zurück.
    let pusher = null;
    async function pushArrives(i) {
      pusher = { node: group({ class: "journey-pusher is-driving" }, [strip(art.buildLoco(PUSHER))]), cx: 100, off: TRAIN_LEN + 8 + 100 * TRAIN_SCALE };
      train.prepend(pusher.node);
      const at = head - pusher.off;
      kids()?.playHorn?.({ chuffs: 2 });
      await slide(pusher, at - 360, at, 1300);
      if (token !== mountToken) return;
      pusher.node.classList.remove("is-driving");
      vehicles.push(pusher);
      kids()?.vibrate?.(24);
      stampFor(i, { fresh: true });
      applyStates();
    }
    async function pushLeaves() {
      if (!pusher) return;
      const gone = pusher;
      pusher = null;
      const at = vehicles.indexOf(gone);
      if (at >= 0) vehicles.splice(at, 1);
      gone.node.classList.add("is-driving");
      kids()?.playWhistle?.("tief");
      await slide(gone, head - gone.off, head - gone.off - 380, 1200);
      gone.node.remove();
    }

    // Die Fahrt von Station i zur nächsten – mit allem, was die Strecke dort
    // hat: der Fahrgast, der aufspringt, die Fähre über die Bucht, die
    // Zahnradstrecke, und die Pfeife vor der Ankunft.
    async function segment(i) {
      const map = reise.MAPS[mapIndex];
      const from = headAt(i);
      const to = headAt(i + 1);
      kids()?.playHorn?.({ chuffs: 2 });
      const boardingD = PLATFORM_D + vehicles[1].off - 10;
      const during = i === 0 && map.passenger && !boarded ? (d) => { if (d >= boardingD) boardPassenger(); } : null;
      if (map.feature === "ferry" && i === 3) {
        const inside = BAY_D + TRAIN_LEN + 10;
        await drive(from, inside, 1500, during);
        if (token !== mountToken) return;
        await ferryCross();
        if (token !== mountToken) return;
        await drive(inside, to, 1500);
      } else if (map.feature === "rack" && i === 7) {
        train.classList.add("is-rack");
        kids()?.playRattle?.(4);
        await drive(from, to, 4300, during);
        train.classList.remove("is-rack");
      } else {
        await drive(from, to, 2400, during);
      }
      if (token !== mountToken) return;
      if (i === 0 && map.passenger) boardPassenger();
      kids()?.playWhistle?.(art.locoConfig(loco || {}).whistle);
    }

    // Der Bonus für ganz goldene Karten – gefeiert, sobald eine dazukommt.
    // Er steht in keinem Schaufenster, die Tafel ist die Überraschung.
    async function celebrateGold() {
      const golden = reise.goldenMaps();
      const shown = Number(seen.goldenMaps) || 0;
      for (let n = shown + 1; n <= golden; n += 1) {
        const bonus = reise.BONUSES.find((entry) => entry.after === n);
        if (!bonus || token !== mountToken) continue;
        await showReward({
          aria: `Zehn goldene Stempel: ${bonus.label} ist frei.`,
          title: "Zehn goldene Stempel!",
          note: `Neu für deinen Zug: ${bonus.label}. Du findest es in der Werkstatt an deiner Lok.`,
          picture: rewardPicture(bonus, loco),
          color: "#f0b429",
        });
      }
      seen.goldenMaps = golden;
    }

    // Die Feier-Tafel: dieselbe wie beim Wagen, mit dem neuen Teil gross in
    // der Mitte. Bleibt stehen, bis das Kind tippt.
    function showReward({ aria, title: titleText, note: noteText, picture, color = "#2b5fb3" }) {
      return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "wagon-reward journey-reward";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-label", aria || titleText);
        const card = document.createElement("div");
        card.className = "wagon-reward-card";
        card.style.setProperty("--reward-color", color);
        const title = document.createElement("p");
        title.className = "wagon-reward-title";
        title.textContent = titleText;
        const pic = document.createElement("div");
        pic.className = "journey-reward-pic";
        pic.append(picture);
        const note = document.createElement("p");
        note.className = "wagon-reward-note";
        note.textContent = noteText;
        const weiter = document.createElement("button");
        weiter.type = "button";
        weiter.className = "wagon-reward-next";
        weiter.setAttribute("aria-label", "Weiter");
        weiter.append(el("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [
          el("path", { d: "M5 13l4.5 4.5L19 7", fill: "none", stroke: "currentColor", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }),
        ]));
        card.append(title, pic, note, weiter);
        overlay.append(card);
        stage.append(overlay);
        const release = kids()?.pushHelp?.(`${titleText} ${noteText} Tippe auf den Haken, um weiterzufahren.`) || null;
        kids()?.playJingle?.("unlock");
        window.setTimeout(() => kids()?.burstConfetti?.(card, 44), reduced() ? 0 : 200);
        let fertig = false;
        const done = () => { fertig = true; overlay.classList.add("is-done"); };
        if (reduced()) done(); else window.setTimeout(done, 900);
        let closed = false;
        const close = () => {
          if (!fertig || closed) return;
          closed = true;
          release?.();
          overlay.remove();
          resolve();
        };
        overlay.addEventListener("click", close);
      });
    }

    async function switchMap(next) {
      // Rechts hinaus, die neue Karte herein, links wieder hinein.
      hideSignal();
      kids()?.playHorn?.({ chuffs: 3 });
      await drive(head, total_ + 420, 1800);
      if (token !== mountToken) return;
      mapIndex = next;
      host.classList.remove("is-entering");
      host.classList.add("is-switching");
      drawMap();
      setHead(headAt(0) - 520);
      window.setTimeout(() => host.classList.remove("is-switching"), 900);
      await wait(120);
      await drive(headAt(0) - 520, headAt(0), 1700);
    }

    // Spielt Stempel und Fahrten von der zuletzt gezeigten Station bis zur
    // aktuellen. Bricht ab, sobald die Karte neu gebaut wurde (token).
    async function playNew() {
      playing = true;
      try {
        const target = visiting !== null ? visibleCurrent : Math.min(current, total + 1);
        while (visibleCurrent < target && token === mountToken) {
          const nr = visibleCurrent;
          const i = stationIndexOf(nr);
          const info = reise.doneInfo(nr);
          if (info && (Number(info.stars) || 0) >= 3) goldShown.add(nr);
          visibleCurrent = nr + 1;
          if (nr === pushPending) {
            await pushArrives(i);
            if (token !== mountToken) return;
          } else {
            stampFor(i, { fresh: true });
            applyStates();
            kids()?.playStarSound?.(goldShown.has(nr) ? 2 : 1);
            kids()?.vibrate?.(14);
            burstAt(i, goldShown.has(nr) ? 30 : 18);
          }
          hideSignal();
          await wait(900);
          if (token !== mountToken) return;
          const last = i === reise.STATIONS_PER_MAP - 1;
          if (last) {
            if (nr === pushPending) { await pushLeaves(); justPushed = nr; }
            if (token !== mountToken) return;
            await finishMap(reise.MAPS[mapIndex]);
            if (token !== mountToken) return;
            if (mapIndex + 1 < reise.MAPS.length) {
              await switchMap(mapIndex + 1);
              if (token !== mountToken) return;
            }
          } else {
            await layTrack(L[i], L[i + 1]);
            if (token !== mountToken) return;
            await segment(i);
            if (token !== mountToken) return;
            if (nr === pushPending) { await pushLeaves(); justPushed = nr; }
            if (token !== mountToken) return;
          }
        }
        // Ein goldener Stempel auf einer Station, die schon gestempelt war.
        if (goldPending && !goldShown.has(goldPending) && goldPending >= nrOf(0) && goldPending <= nrOf(reise.STATIONS_PER_MAP - 1)) {
          goldShown.add(goldPending);
          restampShown = true;
          stampFor(stationIndexOf(goldPending), { fresh: true });
          applyStates();
          kids()?.playJingle?.("unlock");
          burstAt(stationIndexOf(goldPending), 30);
          await wait(800);
        }
        // Ein echter Stempel, wo vorher die Schiebelok geschoben hatte.
        if (restampPending && !restampShown && restampPending >= nrOf(0) && restampPending <= nrOf(reise.STATIONS_PER_MAP - 1)) {
          restampShown = true;
          stampFor(stationIndexOf(restampPending), { fresh: true });
          applyStates();
          kids()?.playStarSound?.(1);
          burstAt(stationIndexOf(restampPending), 20);
          await wait(800);
        }
        if (token === mountToken) await celebrateGold();
      } finally {
        if (token === mountToken) settle();
        playing = false;
        settleHook?.();
      }
    }

    // Der Zug steht, das Signal auch, gemerkt ist der Stand.
    function settle() {
      visibleCurrent = Math.min(current, total + 1);
      const inThisMap = visibleCurrent <= total && reise.mapIndexOf(visibleCurrent) === mapIndex;
      const i = stationIndexOf(inThisMap ? visibleCurrent : nrOf(reise.STATIONS_PER_MAP - 1));
      applyStates();
      if (inThisMap) placeSignal(i); else hideSignal();
      // Zu Besuch rückt die gemerkte Station nicht vor: was auf der aktuellen
      // Karte neu ist, wird beim nächsten Mal dort gefeiert.
      const before = reise.readSeen() || { station: 1 };
      reise.writeSeen({
        station: visiting !== null ? Math.max(1, before.station) : visibleCurrent,
        gold: reise.goldenStations(),
        goldenMaps: reise.goldenMaps(),
        pushed: Object.entries(reise.read().done || {}).filter(([, entry]) => entry?.pushed).map(([nr]) => Number(nr)),
      });
      speakState();
    }

    // -------------------------------------------------------------------------
    // Der Fahrplan: alle sechs Karten
    // -------------------------------------------------------------------------
    // Wie ein Liniennetzplan: je Karte ein Bild mit dem Wahrzeichen, zehn
    // Punkte (gestempelt, golden), die Belohnung am Ziel, die eigene Karte
    // markiert. Fertige Karten lassen sich antippen und noch einmal fahren –
    // für goldene Stempel.
    function lockSvg(cls = "journey-plan-lock") {
      return el("svg", { viewBox: "0 0 24 24", class: cls, "aria-hidden": "true" }, [
        el("path", { d: "M7 11V8a5 5 0 0 1 10 0v3", fill: "none", stroke: "currentColor", "stroke-width": 2.4, "stroke-linecap": "round" }),
        el("rect", { x: 5, y: 11, width: 14, height: 10, rx: 3, fill: "currentColor" }),
      ]);
    }

    function planArt(map) {
      const scene = sceneOf(map);
      const look = lookOf(map);
      const id = `journey-plan-sky-${skyUid += 1}`;
      return el("svg", { viewBox: "0 0 120 84", class: "journey-plan-art", "aria-hidden": "true" }, [
        el("defs", {}, [
          el("linearGradient", { id, x1: "0", y1: "0", x2: "0", y2: "1" }, [
            el("stop", { offset: "0", "stop-color": scene.sky[0] }),
            el("stop", { offset: "1", "stop-color": scene.sky[1] }),
          ]),
        ]),
        el("rect", { x: 0, y: 0, width: 120, height: 84, fill: `url(#${id})` }),
        el("circle", { cx: 100, cy: 16, r: 8, fill: scene.light.color }),
        el("path", { d: "M0 84 L0 46 Q20 34 40 46 T80 46 T120 46 L120 84 Z", fill: look.far }),
        el("rect", { x: 0, y: 58, width: 120, height: 26, fill: scene.ground }),
        el("rect", { x: 0, y: 74, width: 120, height: 3, fill: "#8c93a1", opacity: "0.8" }),
        group({ transform: "translate(74,74) scale(0.42)" }, [art.buildLandmark(map.landmark)]),
      ]);
    }

    function showPlan() {
      if (stage.querySelector(".journey-plan")) return;
      const overlay = document.createElement("div");
      overlay.className = "journey-plan";
      overlay.setAttribute("role", "dialog");
      // Mit Reise 2 stehen zwei Reihen: die Karten rücken enger zusammen.
      if (current > reise.LAPS[0].last) overlay.classList.add("has-lap2");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Der Fahrplan der Reise");

      const said = [];
      const lap2Open = current > reise.LAPS[0].last;
      function cardFor(map, k) {
        const finished = reise.mapFinished(k);
        const golden = reise.mapGolden(k);
        const isCurrent = k === currentMap;
        const locked = k > currentMap;
        const card = document.createElement("button");
        card.type = "button";
        card.className = `journey-plan-card${isCurrent && current <= total ? " is-current" : ""}${finished ? " is-done" : ""}${golden ? " is-golden" : ""}${locked ? " is-locked" : ""}${map.lap === 2 ? " is-lap2" : ""}`;
        card.disabled = locked;
        card.append(planArt(map));

        const dotsRow = document.createElement("span");
        dotsRow.className = "journey-plan-dots";
        let done = 0;
        let gold = 0;
        let pushed = 0;
        for (let i = 1; i <= reise.STATIONS_PER_MAP; i += 1) {
          const info = reise.doneInfo(k * reise.STATIONS_PER_MAP + i);
          const d = document.createElement("span");
          if (info) {
            done += 1;
            if (info.pushed) { pushed += 1; d.className = "is-pushed"; }
            else if ((Number(info.stars) || 0) >= 3) { gold += 1; d.className = "is-gold"; } else d.className = "is-done";
          }
          dotsRow.append(d);
        }
        const name = document.createElement("span");
        name.className = "journey-plan-name";
        name.textContent = `${map.nr} · ${map.name}`;
        const reward = document.createElement("span");
        reward.className = "journey-plan-reward";
        reward.append(rewardPicture(map.reward, loco));
        if (!finished) reward.append(lockSvg());
        card.append(dotsRow, name, reward);
        if (isCurrent && current <= total) {
          const here = document.createElement("span");
          here.className = "journey-plan-here";
          here.append(el("svg", { viewBox: `0 30 ${art.LOCO_W} ${art.ART_H - 30}`, "aria-hidden": "true" }, [strip(art.buildLoco(art.locoConfig(loco || {})))]));
          card.append(here);
        }

        const state = locked ? "noch im Nebel"
          : finished ? (golden ? "fertig, alle Stempel golden" : `fertig, ${gold} von ${reise.STATIONS_PER_MAP} Stempeln golden${pushed ? `, ${pushed} geschoben` : ""}`)
          : `${done} von ${reise.STATIONS_PER_MAP} Stationen gestempelt`;
        card.setAttribute("aria-label", `Karte ${map.nr}, ${map.name}: ${state}.${finished ? " Antippen, um sie noch einmal zu fahren." : isCurrent ? " Deine Karte. Antippen, um sie zu zeigen." : ""}`);
        said.push(`Karte ${map.nr}, ${map.name}: ${state}.`);
        card.addEventListener("click", () => {
          if (locked) return;
          close();
          onVisit?.(isCurrent ? null : k);
        });
        return card;
      }

      // Eine Reihe je Reise; die zweite erst, wenn die erste geschafft ist.
      const rows = [];
      reise.LAPS.forEach((lap) => {
        if (lap.nr === 2 && !lap2Open) return;
        const row = document.createElement("div");
        row.className = `journey-plan-row${lap.nr === 2 ? " is-lap2" : ""}`;
        if (lap.nr === 2) {
          const head = document.createElement("span");
          head.className = "journey-plan-lap";
          head.textContent = "Reise 2";
          row.append(head);
          said.push("Reise 2:");
        }
        for (let k = lap.firstMap; k < lap.firstMap + lap.maps; k += 1) row.append(cardFor(reise.MAPS[k], k));
        rows.push(row);
      });

      // Der Fuss: wie weit auf dieser Reise, und der Bonus für goldene Karten.
      const foot = document.createElement("div");
      foot.className = "journey-plan-foot";
      const stand = document.createElement("span");
      stand.className = "journey-plan-stand";
      const lapNow = reise.lapOf(Math.min(current, total));
      const inLap = (nr) => nr >= lapNow.first && nr <= lapNow.last;
      const doneLap = Object.keys(reise.read().done || {}).map(Number).filter(inLap).length;
      const goldLap = reise.goldenStations().filter(inLap).length;
      stand.textContent = `${lapNow.nr === 2 ? "Reise 2 · " : ""}${doneLap} von ${lapNow.total} Stationen · ${goldLap} goldene Stempel`;
      foot.append(stand);
      reise.BONUSES.forEach((bonus) => {
        const open = reise.hasReward(bonus.id);
        const b = document.createElement("span");
        b.className = `journey-plan-bonus${open ? " is-open" : ""}`;
        b.setAttribute("role", "img");
        b.setAttribute("aria-label", `${bonus.label}: ${open ? "frei" : `noch gesperrt – ${bonus.text}`}.`);
        b.append(rewardPicture(bonus, loco));
        if (!open) b.append(lockSvg());
        foot.append(b);
      });

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "scene-close";
      closeButton.setAttribute("aria-label", "Schliessen");
      closeButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;
      closeButton.addEventListener("click", () => close());

      overlay.append(...rows, foot, closeButton);
      overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
      stage.append(overlay);
      const release = kids()?.pushHelp?.(`Der Fahrplan${lap2Open ? ": Reise 1 und Reise 2" : ": sechs Karten"}. ${said.join(" ")} ${stand.textContent}. Tippe auf eine fertige Karte, um sie noch einmal zu fahren.`) || null;
      function close() {
        release?.();
        overlay.remove();
      }
      closeButton.focus({ preventScroll: true });
    }

    // --- Los ---------------------------------------------------------------------
    drawMap();
    // Neu ist eine weitere Station, ein goldener Stempel aus dem Spiel – oder
    // eine Karte, die schon ganz golden ist, deren Bonus aber noch nie gefeiert
    // wurde.
    const goldenNew = reise.goldenMaps() > (Number(seen.goldenMaps) || 0);
    const pending = Boolean(goldPending) || Boolean(restampPending) || goldenNew;
    const somethingNew = visiting === null ? current > seen.station || pending : pending;
    const standAt = stationIndexOf(Math.min(visibleCurrent, nrOf(reise.STATIONS_PER_MAP - 1)));

    // Der Zug steht an seinem Platz, bevor die Karte ins Bild kommt. Vorher
    // hing das leere SVG schon da, während Landschaft, Stationen und Zug erst
    // noch gebaut wurden: für einen Moment war eine halbe Karte zu sehen, und
    // der Zug sass in der linken oberen Ecke.
    const startsOutside = mode === "enter" && !reduced() && !somethingNew;
    setHead(startsOutside ? headAt(standAt) - 520 : headAt(standAt));
    applyStates();
    host.append(svg, dots);

    if (somethingNew && mode !== "quiet") {
      setHead(headAt(standAt));
      applyStates();
      hideSignal();
      const play = () => playNew();
      if (celebrate) celebrate((done) => play().then(done, done)); else play();
    } else if (mode === "enter" && !reduced()) {
      hideSignal();
      setHead(headAt(standAt) - 520);
      playing = true;
      const enter = async () => {
        try {
          kids()?.playHorn?.({ chuffs: 3 });
          await wait(80);
          await drive(headAt(standAt) - 520, headAt(standAt), 1700);
        } finally {
          if (token === mountToken) settle();
          playing = false;
          settleHook?.();
        }
      };
      if (celebrate) celebrate((done) => enter().then(done, done)); else enter();
    } else {
      setHead(headAt(standAt));
      settle();
    }

    return {
      destroy() { if (token === mountToken) mountToken += 1; },
    };
  }

  // Vor dem ersten Öffnen im Leerlauf aufrufen: dann ist das Gleis schon
  // vermessen, wenn das Kind das Streckenschild antippt.
  function warmUp() { try { measureRail(); } catch { /* ohne Messung baut die Karte sie selbst */ } }

  window.LernappJourney = { mount, isPlaying, rewardPicture, warmUp, LOOK, STOPS, PATH_D };
})();
