/*
 * train-art.js – Der Zug als Zeichnung.
 *
 * Baut Lokomotive und Wagen als SVG aus einzelnen Bauteilen zusammen. Reine
 * Funktionen: rein geht eine Konfiguration, raus kommt ein SVG-Element. Kein
 * Zustand, keine Ereignisse, kein Zugriff auf den Fortschritt – train-home.js
 * holt die Zahlen bei train-progress.js und reicht sie hier herein.
 *
 * Alle Teile liegen auf demselben Boden (GROUND), damit Lok und Wagen ohne
 * Nachrechnen nebeneinanderpassen. Farben werden hier ausgerechnet und als
 * Attribut gesetzt; Umfärben heisst neu bauen, was bei rund zwanzig Elementen
 * je Teil billiger ist als eine Mutations-Logik.
 */
(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  // Gemeinsames Koordinatensystem. Der Boden ist die Schienenoberkante.
  const GROUND = 170;
  const ART_H = 200;
  const WAGON_W = 140;
  const LOCO_W = 200;
  const WHEEL_Y = GROUND - 12;

  // Wie lange ein Rad für eine Umdrehung braucht, bezogen auf das grosse
  // Treibrad der Lok. Kleinere Räder bekommen anteilig weniger Zeit – sie
  // laufen auf demselben Gleis.
  const WHEEL_TURN = 1.5;
  const WHEEL_REF = 23;

  // ---------------------------------------------------------------------------
  // Kleine Helfer
  // ---------------------------------------------------------------------------
  function el(name, attrs = {}, children = []) {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === null || value === undefined) continue;
      node.setAttribute(key, String(value));
    }
    children.filter(Boolean).forEach((child) => node.append(child));
    return node;
  }

  function group(attrs, children) { return el("g", attrs, children); }

  function clampByte(value) { return Math.max(0, Math.min(255, Math.round(value))); }

  function toRgb(hex) {
    const clean = String(hex).replace("#", "");
    const full = clean.length === 3 ? [...clean].map((c) => c + c).join("") : clean;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  }

  function toHex(rgb) { return `#${rgb.map((v) => clampByte(v).toString(16).padStart(2, "0")).join("")}`; }

  // amount < 0 dunkelt ab, > 0 hellt auf. Damit bekommt jedes Bauteil ohne
  // zweite Farbe im Konfigurationsobjekt eine Licht- und eine Schattenseite.
  function shade(hex, amount) {
    const rgb = toRgb(hex);
    const target = amount < 0 ? 0 : 255;
    const mix = Math.abs(amount);
    return toHex(rgb.map((v) => v + (target - v) * mix));
  }

  // Wählt Schwarz oder Weiss – je nachdem, was auf der Farbe besser lesbar ist.
  function inkOn(hex) {
    const [r, g, b] = toRgb(hex);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#243047" : "#ffffff";
  }

  // ---------------------------------------------------------------------------
  // Räder
  // ---------------------------------------------------------------------------
  const WHEEL_SHAPES = ["spoke", "disc", "star"];

  function wheel(cx, radius, color, shape = "spoke") {
    const rim = shade(color, -0.25);
    const parts = [el("circle", { cx: 0, cy: 0, r: radius, fill: "none", stroke: color, "stroke-width": radius * 0.36 })];

    if (shape === "disc") {
      parts.push(el("circle", { cx: 0, cy: 0, r: radius * 0.62, fill: shade(color, 0.28) }));
      parts.push(el("circle", { cx: 0, cy: 0, r: radius * 0.22, fill: rim }));
      // Ohne eine Marke sähe die Scheibe im Stillstand aus wie in der Fahrt.
      parts.push(el("rect", { x: -radius * 0.09, y: -radius * 0.58, width: radius * 0.18, height: radius * 0.3, rx: radius * 0.09, fill: rim }));
    } else if (shape === "star") {
      const points = [];
      for (let i = 0; i < 10; i += 1) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? radius * 0.72 : radius * 0.3;
        points.push(`${(Math.cos(angle) * r).toFixed(1)},${(Math.sin(angle) * r).toFixed(1)}`);
      }
      parts.push(el("polygon", { points: points.join(" "), fill: shade(color, 0.3) }));
    } else {
      const spokes = [];
      for (let i = 0; i < 4; i += 1) {
        const angle = (Math.PI / 4) * i;
        const dx = Math.cos(angle) * radius * 0.74;
        const dy = Math.sin(angle) * radius * 0.74;
        spokes.push(el("line", {
          x1: -dx, y1: -dy, x2: dx, y2: dy,
          stroke: color, "stroke-width": Math.max(2, radius * 0.16), "stroke-linecap": "round",
        }));
      }
      parts.push(...spokes);
      parts.push(el("circle", { cx: 0, cy: 0, r: radius * 0.2, fill: rim }));
    }

    // Kleine Räder drehen sich schneller als grosse – sie laufen auf demselben
    // Gleis und legen bei einer Umdrehung weniger Weg zurück. Die Zeit je
    // Umdrehung steht als CSS-Variable am Rad; die Animation selbst im CSS.
    const turn = (WHEEL_TURN * radius / WHEEL_REF).toFixed(2);
    return group({ transform: `translate(${cx},${WHEEL_Y})` }, [
      // Ein unsichtbarer Kreis, so gross wie das Rad samt Reifen. Ohne ihn
      // atmete die Umrandung der ganzen Lok im Takt der Drehung: ein Stern
      // ist nicht in jeder Stellung gleich breit. Für einen Finger wäre das
      // egal, aber das Ziel soll stillstehen, nicht zittern.
      el("circle", { cx: 0, cy: 0, r: radius * 1.2, fill: "none" }),
      group({ class: "train-wheel", style: `--turn:${turn}s` }, parts),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Tiere am Steuer
  // ---------------------------------------------------------------------------
  // Nur Köpfe: mehr ist im Führerhausfenster nicht zu sehen, und ein Kopf lässt
  // sich klar genug zeichnen, dass ein Kind das Tier auf Anhieb erkennt.
  const DRIVERS = [
    { id: "fox", name: "Fuchs", coat: "#e8763a", inner: "#ffd9b8", ear: "point" },
    { id: "bear", name: "Bär", coat: "#9a6b46", inner: "#d8b48f", ear: "round" },
    { id: "rabbit", name: "Hase", coat: "#f0ece6", inner: "#f7b8c4", ear: "long" },
    { id: "cat", name: "Katze", coat: "#8d8f9c", inner: "#e6e2ee", ear: "point" },
    { id: "panda", name: "Panda", coat: "#f4f1ec", inner: "#2f3138", ear: "round" },
    { id: "frog", name: "Frosch", coat: "#5cb85c", inner: "#c9ea9a", ear: "eyes" },
    { id: "owl", name: "Eule", coat: "#a9814f", inner: "#f3e2c0", ear: "tuft" },
    { id: "penguin", name: "Pinguin", coat: "#3a4250", inner: "#ffffff", ear: "none" },
    { id: "lion", name: "Löwe", coat: "#e0a53c", inner: "#f6dda3", ear: "mane" },
    { id: "mouse", name: "Maus", coat: "#b0b3bd", inner: "#f7c9d4", ear: "big" },
  ];
  const DRIVER_BY_ID = Object.fromEntries(DRIVERS.map((d) => [d.id, d]));

  // Zeichnet einen Tierkopf um (0,0) herum mit Radius r.
  // Wie weit ein Tier über und neben seinem Kopfkreis hinausragt, in Vielfachen
  // des Kopfradius. Die Werte stammen aus den Ohrformen unten – der Hase mit
  // seinen langen Löffeln braucht mehr als doppelt so viel Höhe wie Kopf.
  // Gebraucht wird das, damit jedes Tier ganz ins Führerhausfenster passt,
  // statt mit den Ohren durch den Rahmen zu stossen.
  const EAR_REACH = {
    point: { up: 1.5, side: 0.85 },
    round: { up: 1.24, side: 1.22 },
    big: { up: 1.34, side: 1.42 },
    long: { up: 2.13, side: 1 },
    tuft: { up: 1.3, side: 1 },
    mane: { up: 1.5, side: 1.5 },
    eyes: { up: 1.12, side: 1 },
  };

  // Der grösste Kopf, der in ein Fenster passt, samt der Höhe, auf der er
  // sitzen muss, damit die Ohrenspitzen knapp unter dem Rahmen bleiben.
  function driverFit(driverId, box, margin = 2, maxR = 16) {
    const driver = DRIVER_BY_ID[driverId] || DRIVERS[0];
    const reach = EAR_REACH[driver.ear] || { up: 1, side: 1 };
    const innerW = box.width - margin * 2;
    const innerH = box.height - margin * 2;
    const r = Math.min(maxR, innerH / (reach.up + 1), innerW / (2 * Math.max(1, reach.side)));
    return { r, cx: box.x + box.width / 2, cy: box.y + margin + reach.up * r };
  }

  function driverHead(driverId, r = 16) {
    const driver = DRIVER_BY_ID[driverId] || DRIVERS[0];
    const { coat, inner, ear } = driver;
    const dark = shade(coat, -0.45);
    const parts = [];

    // Ohren zuerst, damit der Kopf sie überlappt.
    if (ear === "point") {
      parts.push(el("polygon", { points: `${-r * 0.85},${-r * 0.4} ${-r * 0.72},${-r * 1.5} ${-r * 0.1},${-r * 0.78}`, fill: coat }));
      parts.push(el("polygon", { points: `${r * 0.85},${-r * 0.4} ${r * 0.72},${-r * 1.5} ${r * 0.1},${-r * 0.78}`, fill: coat }));
    } else if (ear === "round" || ear === "big") {
      const er = ear === "big" ? r * 0.62 : r * 0.42;
      const ey = ear === "big" ? -r * 0.72 : -r * 0.82;
      parts.push(el("circle", { cx: -r * 0.8, cy: ey, r: er, fill: ear === "round" && driverId === "panda" ? inner : coat }));
      parts.push(el("circle", { cx: r * 0.8, cy: ey, r: er, fill: ear === "round" && driverId === "panda" ? inner : coat }));
    } else if (ear === "long") {
      parts.push(el("ellipse", { cx: -r * 0.42, cy: -r * 1.35, rx: r * 0.24, ry: r * 0.78, fill: coat }));
      parts.push(el("ellipse", { cx: r * 0.42, cy: -r * 1.35, rx: r * 0.24, ry: r * 0.78, fill: coat }));
      parts.push(el("ellipse", { cx: -r * 0.42, cy: -r * 1.3, rx: r * 0.1, ry: r * 0.5, fill: inner }));
      parts.push(el("ellipse", { cx: r * 0.42, cy: -r * 1.3, rx: r * 0.1, ry: r * 0.5, fill: inner }));
    } else if (ear === "tuft") {
      parts.push(el("polygon", { points: `${-r},${-r * 0.5} ${-r * 0.86},${-r * 1.3} ${-r * 0.3},${-r * 0.8}`, fill: coat }));
      parts.push(el("polygon", { points: `${r},${-r * 0.5} ${r * 0.86},${-r * 1.3} ${r * 0.3},${-r * 0.8}`, fill: coat }));
    } else if (ear === "mane") {
      // Die Mähne braucht deutlich mehr Kontrast als der Kopf, sonst liest der
      // Löwe nur als goldene Scheibe. Zackenkranz statt zweiter Kreis.
      const points = [];
      for (let i = 0; i < 20; i += 1) {
        const angle = (Math.PI / 10) * i - Math.PI / 2;
        const rr = i % 2 === 0 ? r * 1.5 : r * 1.14;
        points.push(`${(Math.cos(angle) * rr).toFixed(1)},${(Math.sin(angle) * rr).toFixed(1)}`);
      }
      parts.push(el("polygon", { points: points.join(" "), fill: shade(coat, -0.42) }));
      parts.push(el("circle", { cx: 0, cy: 0, r: r * 1.1, fill: shade(coat, -0.18) }));
    }

    // Kopf
    parts.push(el("circle", { cx: 0, cy: 0, r, fill: coat }));

    if (driverId === "panda") {
      parts.push(el("ellipse", { cx: -r * 0.38, cy: -r * 0.1, rx: r * 0.28, ry: r * 0.32, fill: inner }));
      parts.push(el("ellipse", { cx: r * 0.38, cy: -r * 0.1, rx: r * 0.28, ry: r * 0.32, fill: inner }));
    }
    if (driverId === "penguin") {
      parts.push(el("ellipse", { cx: 0, cy: r * 0.18, rx: r * 0.66, ry: r * 0.72, fill: inner }));
    }
    if (ear === "eyes") {
      // Froschaugen sitzen oben auf dem Kopf und brauchen Weiss, sonst gehen
      // sie im grünen Kopf unter.
      [-1, 1].forEach((side) => {
        parts.push(el("circle", { cx: side * r * 0.56, cy: -r * 0.76, r: r * 0.36, fill: coat }));
        parts.push(el("circle", { cx: side * r * 0.56, cy: -r * 0.76, r: r * 0.26, fill: "#ffffff" }));
        parts.push(el("circle", { cx: side * r * 0.56, cy: -r * 0.72, r: r * 0.14, fill: "#243047" }));
      });
    }

    // Schnauze und Augen
    if (driverId === "owl") {
      // Eulen leben von grossen Augen – zwei helle Scheiben mit dunklem Kern.
      [-1, 1].forEach((side) => {
        parts.push(el("circle", { cx: side * r * 0.38, cy: -r * 0.12, r: r * 0.36, fill: inner }));
        parts.push(el("circle", { cx: side * r * 0.38, cy: -r * 0.12, r: r * 0.18, fill: "#243047" }));
      });
    } else if (driverId !== "frog") {
      parts.push(el("circle", { cx: -r * 0.32, cy: -r * 0.06, r: r * 0.13, fill: dark }));
      parts.push(el("circle", { cx: r * 0.32, cy: -r * 0.06, r: r * 0.13, fill: dark }));
    }
    if (driverId === "owl" || driverId === "penguin") {
      parts.push(el("polygon", { points: `0,${r * 0.12} ${-r * 0.2},${r * 0.42} ${r * 0.2},${r * 0.42}`, fill: "#f0a13c" }));
    } else if (driverId === "frog") {
      parts.push(el("path", { d: `M${-r * 0.4},${r * 0.28} q${r * 0.4},${r * 0.3} ${r * 0.8},0`, fill: "none", stroke: dark, "stroke-width": r * 0.12, "stroke-linecap": "round" }));
    } else {
      parts.push(el("ellipse", { cx: 0, cy: r * 0.36, rx: r * 0.34, ry: r * 0.26, fill: inner }));
      parts.push(el("circle", { cx: 0, cy: r * 0.26, r: r * 0.11, fill: dark }));
    }

    return group({ class: "train-driver" }, parts);
  }

  // ---------------------------------------------------------------------------
  // Lokomotive
  // ---------------------------------------------------------------------------
  const CHIMNEY_SHAPES = ["classic", "funnel", "double", "slim"];
  const CAB_SHAPES = ["round", "flat", "peak"];
  const LAMP_SHAPES = ["round", "square"];
  const FLAG_PATTERNS = ["plain", "stripes", "dots", "zigzag"];
  const WHISTLES = ["hoch", "tief", "doppelt", "dampf"];

  let locoUid = 0;

  const DEFAULT_LOCO = {
    driver: "fox",
    body: "#c9483a",
    cab: { shape: "round", color: "#2f6f8f" },
    wheels: { shape: "spoke", color: "#f0b429" },
    chimney: { shape: "classic", smoke: "#dfe6ee" },
    lamp: { shape: "round", color: "#ffe066" },
    whistle: "hoch",
    flag: { pattern: "stripes", color: "#f0b429" },
  };

  function locoConfig(config = {}) {
    return {
      ...DEFAULT_LOCO, ...config,
      cab: { ...DEFAULT_LOCO.cab, ...(config.cab || {}) },
      wheels: { ...DEFAULT_LOCO.wheels, ...(config.wheels || {}) },
      chimney: { ...DEFAULT_LOCO.chimney, ...(config.chimney || {}) },
      lamp: { ...DEFAULT_LOCO.lamp, ...(config.lamp || {}) },
      flag: { ...DEFAULT_LOCO.flag, ...(config.flag || {}) },
    };
  }

  // Die Lok fährt nach rechts: Führerhaus hinten links, Kessel und Kamin vorne
  // rechts, Kuhfänger ganz vorne. Jedes Bauteil ist ein eigenes <g> mit
  // data-part, damit die Werkstatt in Etappe 5 einzeln hineinzoomen kann.
  function buildLoco(config = {}) {
    const c = locoConfig(config);
    const body = c.body;
    const bodyDark = shade(body, -0.28);
    const bodyLight = shade(body, 0.22);
    const cabColor = c.cab.color;

    // --- Rahmen ---
    const frame = group({ "data-part": "frame" }, [
      el("rect", { x: 8, y: GROUND - 22, width: 178, height: 12, rx: 3, fill: shade(bodyDark, -0.3) }),
    ]);

    // --- Führerhaus ---
    // Das Fenster ist eine echte Öffnung, keine weisse Fläche: eine Maske
    // schneidet es aus dem Führerhaus, sodass die Landschaft hinter dem Tier
    // durchscheint. Ohne die Maske sässe der Chauffeur auf einem weissen Feld.
    // Das Fenster ist hoch genug für Ohren: der Hase braucht über dem Kopf mehr
    // als das Doppelte des Kopfradius, und ein quadratisches Fenster liesse
    // seine Löffel entweder abgeschnitten oder den Kopf winzig aussehen.
    const windowBox = { x: 18, y: 74, width: 46, height: 44, rx: 5 };
    const uid = locoUid += 1;
    const maskId = `loco-window-${uid}`;
    const clipId = `loco-glass-${uid}`;

    const cabParts = [el("rect", { x: 10, y: 66, width: 62, height: GROUND - 88, rx: 5, fill: cabColor })];
    if (c.cab.shape === "round") {
      cabParts.unshift(el("path", { d: "M4 68 q34 -20 74 0 v8 h-74 z", fill: shade(cabColor, -0.2) }));
    } else if (c.cab.shape === "peak") {
      cabParts.unshift(el("polygon", { points: "41,48 82,70 0,70", fill: shade(cabColor, -0.2) }));
    } else {
      cabParts.unshift(el("rect", { x: 2, y: 58, width: 78, height: 13, rx: 4, fill: shade(cabColor, -0.2) }));
    }

    const defs = el("defs", {}, [
      el("mask", { id: maskId, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: LOCO_W, height: ART_H }, [
        el("rect", { x: 0, y: 0, width: LOCO_W, height: ART_H, fill: "#ffffff" }),
        el("rect", { ...windowBox, fill: "#000000" }),
      ]),
      // Der Chauffeur sitzt hinter dem Fenster, also endet er am Fenster. Die
      // Grösse unten ist schon so gewählt, dass nichts abgeschnitten wird –
      // dieser Beschnitt ist die Zusicherung, dass auch bei einem später
      // dazukommenden Tier kein Ohr über den Rahmen hinausragt.
      el("clipPath", { id: clipId, clipPathUnits: "userSpaceOnUse" }, [
        el("rect", { ...windowBox }),
      ]),
    ]);

    const cab = group({ "data-part": "cab", mask: `url(#${maskId})` }, cabParts);

    // --- Chauffeur in der Fensteröffnung ---
    // Zwei Gruppen: die äussere trägt den Beschnitt, die innere stellt das
    // Tier an seinen Platz. An einem Element ginge das nicht – ein Beschnitt in
    // Nutzerkoordinaten wird im System *nach* dem eigenen transform gelesen und
    // läge dann irgendwo unter der Lok statt auf dem Fenster.
    const fit = driverFit(c.driver, windowBox);
    const driver = group({
      "data-part": "driver",
      "data-driver": c.driver,
      "clip-path": `url(#${clipId})`,
    }, [
      group({ transform: `translate(${fit.cx.toFixed(1)},${fit.cy.toFixed(1)})` }, [
        driverHead(c.driver, Number(fit.r.toFixed(2))),
      ]),
    ]);

    // Der Fensterrahmen kommt über den Chauffeur: so sitzt das Tier sichtbar
    // hinter dem Fenster und nicht davor aufgeklebt.
    const windowFrame = group({ "data-part": "window", "aria-hidden": "true" }, [
      el("rect", { ...windowBox, fill: "none", stroke: shade(cabColor, -0.3), "stroke-width": 4 }),
    ]);

    // --- Kessel ---
    const boiler = group({ "data-part": "body" }, [
      el("rect", { x: 68, y: 92, width: 96, height: GROUND - 114, rx: 28, fill: body }),
      el("rect", { x: 76, y: 98, width: 80, height: 10, rx: 5, fill: bodyLight, opacity: "0.55" }),
      el("circle", { cx: 158, cy: 120, r: 25, fill: bodyDark }),
      el("circle", { cx: 158, cy: 120, r: 16, fill: body }),
    ]);

    // Die Pfeife hört man, statt sie zu sehen – trotzdem braucht sie eine
    // eigene Form auf dem Kessel, sonst gäbe es in der Werkstatt nichts
    // anzutippen. Die vier Klänge unterscheiden sich nur im Ton, deshalb zeigt
    // die Form die Anzahl der Rohre.
    const pipes = { hoch: 1, tief: 1, doppelt: 2, dampf: 3 }[c.whistle] || 1;
    const whistleParts = [el("rect", { x: 92, y: 118, width: 24, height: 12, rx: 4, fill: shade(body, -0.5) })];
    for (let i = 0; i < pipes; i += 1) {
      const x = 104 - (pipes - 1) * 6 + i * 12;
      const height = c.whistle === "tief" ? 40 : 30;
      whistleParts.push(el("rect", { x: x - 4, y: 122 - height, width: 9, height, rx: 3, fill: shade(body, -0.4) }));
      whistleParts.push(el("circle", { cx: x, cy: 122 - height, r: 5.5, fill: shade(body, -0.55) }));
    }
    const whistle = group({ "data-part": "whistle" }, whistleParts);

    // --- Kamin ---
    const smoke = c.chimney.smoke;
    // mouth = Mitte und Oberkante der Kaminöffnung. Der Dampf setzt genau dort
    // an; ohne diesen gemeinsamen Punkt schweben die Wolken neben dem Kamin.
    let mouth;
    let chimneyShape;
    if (c.chimney.shape === "funnel") {
      chimneyShape = [el("path", { d: "M124 92 L128 56 L172 56 L176 92 Z", fill: bodyDark }),
                      el("rect", { x: 124, y: 48, width: 52, height: 10, rx: 4, fill: shade(body, -0.45) })];
      mouth = { x: 150, y: 48 };
    } else if (c.chimney.shape === "double") {
      chimneyShape = [el("rect", { x: 122, y: 60, width: 20, height: 34, rx: 3, fill: bodyDark }),
                      el("rect", { x: 150, y: 52, width: 20, height: 42, rx: 3, fill: bodyDark }),
                      el("rect", { x: 118, y: 54, width: 28, height: 9, rx: 3, fill: shade(body, -0.45) }),
                      el("rect", { x: 146, y: 46, width: 28, height: 9, rx: 3, fill: shade(body, -0.45) })];
      mouth = { x: 160, y: 46 };
    } else if (c.chimney.shape === "slim") {
      chimneyShape = [el("rect", { x: 140, y: 40, width: 18, height: 54, rx: 4, fill: bodyDark }),
                      el("rect", { x: 134, y: 34, width: 30, height: 9, rx: 4, fill: shade(body, -0.45) })];
      mouth = { x: 149, y: 34 };
    } else {
      chimneyShape = [el("path", { d: "M134 92 L138 58 L164 58 L168 92 Z", fill: bodyDark }),
                      el("rect", { x: 130, y: 50, width: 42, height: 11, rx: 4, fill: shade(body, -0.45) })];
      mouth = { x: 151, y: 50 };
    }
    const chimney = group({ "data-part": "chimney" }, chimneyShape);

    // Dampf. Die Wolken sind eine eigene Gruppe, damit train-home.js sie
    // animieren oder – bei prefers-reduced-motion – weglassen kann.
    // Alle drei Wolken sitzen auf der Mündung; erst die Animation trägt sie
    // versetzt nach oben weg. Steht die Animation still (prefers-reduced-motion),
    // liegt trotzdem eine Wolke sichtbar auf dem Kamin statt daneben.
    const steam = group({ "data-part": "steam", class: "train-steam", fill: smoke }, [
      el("circle", { cx: mouth.x, cy: mouth.y - 6, r: 11, class: "train-steam-puff train-steam-1" }),
      el("circle", { cx: mouth.x, cy: mouth.y - 6, r: 8, class: "train-steam-puff train-steam-2" }),
      el("circle", { cx: mouth.x, cy: mouth.y - 6, r: 9, class: "train-steam-puff train-steam-3" }),
    ]);

    // --- Lampe ---
    const lampColor = c.lamp.color;
    const lampShape = c.lamp.shape === "square"
      ? el("rect", { x: 166, y: 98, width: 22, height: 22, rx: 4, fill: lampColor, stroke: bodyDark, "stroke-width": 3 })
      : el("circle", { cx: 177, cy: 109, r: 12, fill: lampColor, stroke: bodyDark, "stroke-width": 3 });
    const lamp = group({ "data-part": "lamp" }, [
      lampShape,
      el("circle", { cx: 177, cy: 109, r: 4.5, fill: shade(lampColor, 0.55) }),
    ]);

    // --- Kuhfänger ---
    // Der Kuhfänger sitzt ganz vorne unter der Lampe. Er wird nach den Rädern
    // gezeichnet, sonst verschwindet er hinter dem vorderen Rad.
    const plough = group({ "data-part": "plough" }, [
      el("path", { d: `M176 126 L198 ${GROUND - 4} L176 ${GROUND - 4} Z`, fill: shade(cabColor, -0.15) }),
      el("line", { x1: 182, y1: 141, x2: 182, y2: GROUND - 6, stroke: shade(cabColor, 0.35), "stroke-width": 2.5 }),
      el("line", { x1: 189, y1: 155, x2: 189, y2: GROUND - 6, stroke: shade(cabColor, 0.35), "stroke-width": 2.5 }),
    ]);

    // --- Wimpel ---
    const flagColor = c.flag.color;
    const flagBody = [el("line", { x1: 41, y1: 52, x2: 41, y2: 16, stroke: shade(cabColor, -0.35), "stroke-width": 3 })];
    if (c.flag.pattern === "stripes") {
      flagBody.push(el("polygon", { points: "41,18 78,28 41,38", fill: flagColor }));
      flagBody.push(el("polygon", { points: "41,24 62,29.6 41,35", fill: shade(flagColor, -0.35) }));
    } else if (c.flag.pattern === "dots") {
      flagBody.push(el("polygon", { points: "41,18 78,28 41,38", fill: flagColor }));
      flagBody.push(el("circle", { cx: 51, cy: 25.5, r: 2.8, fill: inkOn(flagColor) }));
      flagBody.push(el("circle", { cx: 60, cy: 28.5, r: 2.8, fill: inkOn(flagColor) }));
    } else if (c.flag.pattern === "zigzag") {
      flagBody.push(el("polygon", { points: "41,18 78,28 41,38 52,28", fill: flagColor }));
    } else {
      flagBody.push(el("polygon", { points: "41,18 78,28 41,38", fill: flagColor }));
    }
    const flag = group({ "data-part": "flag" }, flagBody);

    // --- Räder ---
    const wheelColor = c.wheels.color;
    const wheels = group({ "data-part": "wheels" }, [
      wheel(38, 14, wheelColor, c.wheels.shape),
      wheel(106, 23, wheelColor, c.wheels.shape),
      wheel(160, 14, wheelColor, c.wheels.shape),
      el("line", { x1: 38, y1: WHEEL_Y, x2: 160, y2: WHEEL_Y, stroke: shade(wheelColor, -0.4), "stroke-width": 4, "stroke-linecap": "round", opacity: "0.75" }),
    ]);

    return group({ class: "train-loco", "data-loco": "true" },
      [defs, steam, flag, frame, cab, driver, windowFrame, boiler, whistle, chimney, lamp, wheels, plough]);
  }

  // ---------------------------------------------------------------------------
  // Wagen
  // ---------------------------------------------------------------------------
  // Elf Stufen. 0 ist das nackte Fahrgestell, 1–5 bauen auf, 6–10 beladen.
  // Die Räder tragen ab Stufe 0 die Bereichsfarbe, damit von Anfang an klar ist,
  // welcher Wagen zu welchem Bereich gehört.
  const WAGON_TYPES = ["boxcar", "tank", "flat", "crane", "mail"];

  const DECK_Y = GROUND - 34;      // Oberkante Ladefläche
  const BODY_TOP = 78;             // Oberkante Wand
  const ROOF_Y = 68;

  // Wie viele Frachtstücke bei Stufe 6..10 sichtbar sind.
  function cargoCount(stage, max) {
    if (stage < 6) return 0;
    return Math.round(((stage - 5) / 5) * max);
  }

  function chassis(color) {
    return [
      el("rect", { x: 6, y: DECK_Y, width: WAGON_W - 12, height: 10, rx: 2, fill: shade(color, -0.5) }),
      el("line", { x1: 0, y1: DECK_Y + 5, x2: 6, y2: DECK_Y + 5, stroke: shade(color, -0.5), "stroke-width": 5 }),
      el("line", { x1: WAGON_W - 6, y1: DECK_Y + 5, x2: WAGON_W, y2: DECK_Y + 5, stroke: shade(color, -0.5), "stroke-width": 5 }),
    ];
  }

  // --- Kastenwagen (Gedächtnis): Kisten hinter einer Schiebetür ---------------
  function boxcarBody(stage, color) {
    const parts = [];
    const dark = shade(color, -0.3);
    const wallH = DECK_Y - BODY_TOP;

    if (stage >= 1) parts.push(el("rect", { x: 8, y: DECK_Y - 12, width: WAGON_W - 16, height: 12, rx: 2, fill: shade(color, -0.15) }));
    if (stage >= 2) parts.push(el("rect", { x: WAGON_W - 26, y: BODY_TOP, width: 18, height: wallH - 10, fill: color }));
    if (stage >= 3) {
      parts.push(el("rect", { x: 8, y: BODY_TOP, width: 18, height: wallH - 10, fill: color }));
      parts.push(el("rect", { x: 26, y: BODY_TOP + 4, width: WAGON_W - 52, height: 7, fill: shade(color, -0.1) }));
    }
    if (stage >= 4) parts.push(el("rect", { x: 2, y: ROOF_Y, width: WAGON_W - 4, height: 13, rx: 4, fill: dark }));
    if (stage >= 5) {
      parts.push(el("rect", { x: 26, y: BODY_TOP + 11, width: WAGON_W - 52, height: wallH - 21, fill: color }));
      parts.push(el("rect", { x: 46, y: BODY_TOP + 14, width: 34, height: wallH - 26, rx: 2, fill: "none", stroke: shade(color, 0.45), "stroke-width": 3 }));
      parts.push(el("line", { x1: 63, y1: BODY_TOP + 14, x2: 63, y2: DECK_Y - 12, stroke: shade(color, 0.45), "stroke-width": 2.5 }));
    }

    // Beladung: die Tür steht offen, die Kisten stapeln sich von unten.
    const crates = cargoCount(stage, 6);
    if (crates > 0) {
      parts.push(el("rect", { x: 46, y: BODY_TOP + 14, width: 34, height: wallH - 26, fill: shade(color, -0.55) }));
      const spots = [[48, 0], [66, 0], [48, 1], [66, 1], [48, 2], [66, 2]];
      spots.slice(0, crates).forEach(([x, row]) => {
        parts.push(el("rect", { x, y: DECK_Y - 14 - row * 15, width: 15, height: 13, rx: 2, fill: "#e0a53c" }));
        parts.push(el("line", { x1: x, y1: DECK_Y - 8 - row * 15, x2: x + 15, y2: DECK_Y - 8 - row * 15, stroke: "#8a5f1c", "stroke-width": 1.6 }));
      });
    }
    return parts;
  }

  // --- Kesselwagen (Konzentration): Füllstand steigt sichtbar -----------------
  function tankBody(stage, color) {
    const parts = [];
    const tankTop = 92;
    const tankH = DECK_Y - tankTop - 2;

    if (stage >= 1) parts.push(el("rect", { x: 10, y: DECK_Y - 10, width: WAGON_W - 20, height: 10, rx: 3, fill: shade(color, -0.15) }));
    if (stage >= 2) parts.push(el("path", { d: `M12 ${DECK_Y - 8} a${tankH / 2} ${tankH / 2} 0 0 1 ${tankH / 2} -${tankH / 2} v${tankH / 2} z`, fill: color }));
    if (stage >= 3) parts.push(el("rect", { x: 12, y: tankTop, width: WAGON_W - 24, height: tankH, rx: tankH / 2, fill: color }));
    if (stage >= 4) parts.push(el("rect", { x: 58, y: tankTop - 14, width: 24, height: 16, rx: 5, fill: shade(color, -0.3) }));
    if (stage >= 5) {
      parts.push(el("line", { x1: 34, y1: tankTop + 8, x2: 34, y2: DECK_Y - 10, stroke: shade(color, 0.4), "stroke-width": 3 }));
      parts.push(el("line", { x1: 106, y1: tankTop + 8, x2: 106, y2: DECK_Y - 10, stroke: shade(color, 0.4), "stroke-width": 3 }));
    }

    // Beladung als Schauglas: ein Fenster im Kessel, in dem die Flüssigkeit
    // steigt. Von allen Wagen die klarste Fortschrittsanzeige ohne ein Wort.
    if (stage >= 5) {
      const glassX = 50;
      const glassY = tankTop + 8;
      const glassH = tankH - 16;
      parts.push(el("rect", { x: glassX, y: glassY, width: 40, height: glassH, rx: 4, fill: shade(color, -0.6) }));
      const level = cargoCount(stage, 5) / 5;
      if (level > 0) {
        const fillH = Math.max(3, glassH * level);
        parts.push(el("rect", { x: glassX + 3, y: glassY + glassH - fillH, width: 34, height: fillH - 2, rx: 3, fill: shade(color, 0.35) }));
        parts.push(el("rect", { x: glassX + 3, y: glassY + glassH - fillH, width: 34, height: 3, rx: 1.5, fill: shade(color, 0.6) }));
      }
      parts.push(el("rect", { x: glassX, y: glassY, width: 40, height: glassH, rx: 4, fill: "none", stroke: shade(color, 0.25), "stroke-width": 2.5 }));
    }
    return parts;
  }

  // --- Flachwagen (Geschwindigkeit): flach, mit Windschild -------------------
  function flatBody(stage, color) {
    const parts = [];
    if (stage >= 1) parts.push(el("rect", { x: 8, y: DECK_Y - 14, width: WAGON_W - 16, height: 14, rx: 3, fill: color }));
    if (stage >= 2) parts.push(el("path", { d: `M8 ${DECK_Y - 14} L8 ${DECK_Y - 42} q0 -6 6 -6 h20 l14 34 z`, fill: shade(color, -0.15) }));
    if (stage >= 3) parts.push(el("rect", { x: 8, y: DECK_Y - 18, width: WAGON_W - 16, height: 5, rx: 2, fill: shade(color, 0.3) }));
    if (stage >= 4) {
      parts.push(el("rect", { x: WAGON_W - 26, y: DECK_Y - 30, width: 18, height: 16, rx: 3, fill: shade(color, -0.2) }));
    }
    if (stage >= 5) {
      // Tempostreifen am Windschild – das Motiv des Bereichs.
      parts.push(el("polygon", { points: `40,${DECK_Y - 38} 30,${DECK_Y - 26} 37,${DECK_Y - 26} 28,${DECK_Y - 16} 44,${DECK_Y - 30} 37,${DECK_Y - 30}`, fill: shade(color, 0.55) }));
    }

    // Beladung: Ballen, die sich stapeln. Der Flachwagen ist von Haus aus
    // niedrig, deshalb muss die Ladung nach oben wachsen – sonst unterscheiden
    // sich die Stufen 6 bis 10 kaum voneinander.
    const load = cargoCount(stage, 5);
    const spots = [
      [50, DECK_Y - 36], [74, DECK_Y - 36], [98, DECK_Y - 36],
      [62, DECK_Y - 58], [86, DECK_Y - 58],
    ];
    spots.slice(0, load).forEach(([x, y]) => {
      parts.push(el("rect", { x, y, width: 22, height: 22, rx: 3, fill: shade(color, -0.38) }));
      parts.push(el("line", { x1: x + 11, y1: y, x2: x + 11, y2: y + 22, stroke: shade(color, 0.45), "stroke-width": 2.2 }));
      parts.push(el("line", { x1: x, y1: y + 11, x2: x + 22, y2: y + 11, stroke: shade(color, 0.45), "stroke-width": 2.2 }));
    });
    return parts;
  }

  // --- Kranwagen (Problemlösen): der Ausleger wächst -------------------------
  function craneBody(stage, color) {
    const parts = [];
    if (stage >= 1) parts.push(el("rect", { x: 8, y: DECK_Y - 16, width: WAGON_W - 16, height: 16, rx: 3, fill: color }));
    if (stage >= 2) parts.push(el("rect", { x: 12, y: DECK_Y - 46, width: 38, height: 30, rx: 4, fill: shade(color, -0.15) }));
    if (stage >= 3) parts.push(el("rect", { x: 20, y: DECK_Y - 40, width: 22, height: 15, rx: 2, fill: "#f7fbff", opacity: "0.85" }));
    if (stage >= 4) {
      parts.push(el("line", { x1: 48, y1: DECK_Y - 42, x2: 112, y2: 74, stroke: shade(color, -0.25), "stroke-width": 7, "stroke-linecap": "round" }));
      parts.push(el("line", { x1: 56, y1: DECK_Y - 40, x2: 106, y2: 82, stroke: shade(color, 0.35), "stroke-width": 2.5 }));
    }
    if (stage >= 5) {
      parts.push(el("line", { x1: 110, y1: 78, x2: 110, y2: DECK_Y - 34, stroke: shade(color, -0.4), "stroke-width": 2.5 }));
      parts.push(el("path", { d: `M104 ${DECK_Y - 34} q6 12 12 0`, fill: "none", stroke: shade(color, -0.4), "stroke-width": 3.5, "stroke-linecap": "round" }));
    }

    // Beladung: der Kran hat etwas zu heben.
    const load = cargoCount(stage, 4);
    const spots = [[60, DECK_Y - 32], [80, DECK_Y - 32], [100, DECK_Y - 32], [70, DECK_Y - 50]];
    spots.slice(0, load).forEach(([x, y]) => {
      parts.push(el("rect", { x, y, width: 18, height: 16, rx: 3, fill: "#e0a53c" }));
      parts.push(el("line", { x1: x, y1: y + 8, x2: x + 18, y2: y + 8, stroke: "#8a5f1c", "stroke-width": 1.8 }));
    });
    return parts;
  }

  // --- Postwagen (Zahl & Buchstabe): Fächer füllen sich ----------------------
  function mailBody(stage, color) {
    const parts = [];
    const dark = shade(color, -0.3);
    const wallH = DECK_Y - BODY_TOP;

    if (stage >= 1) parts.push(el("rect", { x: 8, y: DECK_Y - 12, width: WAGON_W - 16, height: 12, rx: 2, fill: shade(color, -0.15) }));
    if (stage >= 2) parts.push(el("rect", { x: WAGON_W - 54, y: BODY_TOP + 16, width: 46, height: wallH - 26, fill: color }));
    if (stage >= 3) parts.push(el("rect", { x: 8, y: BODY_TOP, width: WAGON_W - 16, height: wallH - 10, fill: color }));
    if (stage >= 4) parts.push(el("rect", { x: 2, y: ROOF_Y, width: WAGON_W - 4, height: 13, rx: 4, fill: dark }));
    if (stage >= 5) parts.push(el("rect", { x: 14, y: BODY_TOP + 6, width: WAGON_W - 28, height: wallH - 24, rx: 3, fill: shade(color, -0.5) }));

    // Beladung: sechs Fächer, die sich mit Briefen füllen.
    const letters = cargoCount(stage, 6);
    if (stage >= 5) {
      const slotW = 30;
      const slotH = 17;
      for (let i = 0; i < 6; i += 1) {
        const x = 20 + (i % 3) * (slotW + 6);
        const y = BODY_TOP + 11 + Math.floor(i / 3) * (slotH + 5);
        parts.push(el("rect", { x, y, width: slotW, height: slotH, rx: 2, fill: shade(color, -0.62) }));
        if (i < letters) {
          parts.push(el("rect", { x: x + 2, y: y + 2, width: slotW - 4, height: slotH - 4, rx: 1.5, fill: "#f6f1e4" }));
          parts.push(el("polyline", { points: `${x + 2},${y + 2} ${x + slotW / 2},${y + slotH / 2} ${x + slotW - 2},${y + 2}`, fill: "none", stroke: shade(color, -0.2), "stroke-width": 1.8 }));
        }
      }
    }
    return parts;
  }

  const WAGON_BODIES = { boxcar: boxcarBody, tank: tankBody, flat: flatBody, crane: craneBody, mail: mailBody };

  // Wo der Wimpel bei Stufe 10 steht. Ohne diese Tabelle schwebt er bei den
  // niedrigen Bauarten – Flachwagen, Kranwagen – frei über dem Wagen.
  const FLAG_ANCHOR = {
    boxcar: { x: 70, y: ROOF_Y },
    tank: { x: 70, y: 78 },
    flat: { x: 34, y: DECK_Y - 48 },
    crane: { x: 31, y: DECK_Y - 46 },
    mail: { x: 70, y: ROOF_Y },
  };

  /**
   * Baut einen Wagen.
   * @param {string} type  Bauart: boxcar, tank, flat, crane oder mail
   * @param {string} color Bereichsfarbe
   * @param {number} stage Ausbaustufe 0..10
   */
  function buildWagon(type, color, stage = 0) {
    const safeType = WAGON_BODIES[type] ? type : "boxcar";
    const clamped = Math.max(0, Math.min(10, Math.round(stage)));
    const parts = [...chassis(color), ...WAGON_BODIES[safeType](clamped, color)];

    // Fertig: Wimpel und goldene Räder als sichtbare Auszeichnung.
    const done = clamped >= 10;
    if (done) {
      const anchor = FLAG_ANCHOR[safeType];
      const top = anchor.y - 28;
      parts.push(el("line", { x1: anchor.x, y1: anchor.y, x2: anchor.x, y2: top, stroke: "#8a5f1c", "stroke-width": 3 }));
      parts.push(el("polygon", { points: `${anchor.x},${top + 2} ${anchor.x + 26},${top + 10} ${anchor.x},${top + 18}`, fill: "#f0b429" }));
    }

    const wheelColor = done ? "#f0b429" : color;
    parts.push(wheel(32, 13, wheelColor, "spoke"));
    parts.push(wheel(WAGON_W - 32, 13, wheelColor, "spoke"));

    return group({
      class: `train-wagon train-wagon-${safeType}${done ? " is-complete" : ""}`,
      "data-wagon": safeType,
      "data-stage": clamped,
    }, [
      // Unsichtbare Fläche unter dem Wagen, wie sie auch die Gebäude haben: ein
      // halb gebauter Wagen ist voller Lücken, und ein Tipp mitten hinein soll
      // ihn treffen und nicht durch ihn hindurchgehen.
      el("rect", { class: "train-wagon-hit", x: 0, y: 30, width: WAGON_W, height: GROUND - 20, fill: "transparent" }),
      ...parts,
    ]);
  }

  // ---------------------------------------------------------------------------
  // Ganzer Zug
  // ---------------------------------------------------------------------------
  const WAGON_GAP = 8;

  /**
   * Setzt Wagen und Lok zu einem Zug zusammen und liefert ein fertiges <svg>.
   * @param {Array}  areas  Ergebnis von LernappTrain.allAreas()
   * @param {Object} config Lok-Konfiguration
   */
  function buildTrain(areas, config = {}, options = {}) {
    const { withTrack = true, gap = WAGON_GAP, pad = 8, trailing = 0, startLabel = null } = options;
    const width = pad * 2 + areas.length * (WAGON_W + gap) + LOCO_W + trailing;
    const svg = el("svg", {
      viewBox: `0 0 ${width} ${ART_H}`,
      class: "train-svg",
      role: "img",
      xmlns: NS,
    });

    if (withTrack) svg.append(buildTrack(width));

    // Unsichtbarer Strich auf Höhe der Schienenoberkante. Auf der Bühne liegt
    // das Gleis nicht mehr im Zug, sondern fest im Bild – und der Zug muss so
    // hoch gesetzt werden, dass seine Räder darauf stehen. Die beiden
    // Koordinatensysteme werden verschieden skaliert, der Versatz lässt sich
    // deshalb nur messen. Dieser Strich ist die Marke zum Messen.
    svg.append(el("rect", { class: "train-railline", x: 0, y: GROUND, width, height: 1, fill: "none", "aria-hidden": "true" }));

    areas.forEach((area, index) => {
      const wagon = buildWagon(area.wagon, area.color, area.stage);
      wagon.setAttribute("transform", `translate(${pad + index * (WAGON_W + gap)},0)`);
      wagon.setAttribute("data-area", area.id);
      svg.append(wagon);
    });

    const loco = buildLoco(config);
    loco.setAttribute("transform", `translate(${pad + areas.length * (WAGON_W + gap)},0)`);
    svg.append(loco);

    if (startLabel) svg.append(buildStartSignal(width - trailing / 2, { label: startLabel }));

    return svg;
  }

  // ---------------------------------------------------------------------------
  // Startsignal
  // ---------------------------------------------------------------------------
  // Steht vor der Lok am rechten Bildrand, auf dem Gleis. Ein Bahnsignal statt
  // eines Knopfes: es gehört in die Welt des Zugs, und ein grüner Pfeil sagt
  // ohne ein Wort, dass es losgeht. Als <g> mit role="button", damit es auch
  // per Tastatur und Screenreader erreichbar bleibt.
  function buildStartSignal(x, options = {}) {
    const { label = "Losfahren" } = options;
    const post = shade("#4a5568", 0);
    const discY = GROUND - 74;

    return group({
      class: "train-start-signal",
      "data-part": "start",
      role: "button",
      tabindex: "0",
      "aria-label": label,
      transform: `translate(${x},0)`,
    }, [
      el("rect", { x: -5, y: discY, width: 10, height: GROUND - discY, rx: 3, fill: post }),
      el("rect", { x: -14, y: GROUND - 6, width: 28, height: 8, rx: 3, fill: shade(post, -0.25) }),
      // Unsichtbare Trefferfläche: gross genug für einen Kinderfinger und vor
      // allem konstant. Der pulsende Ring darunter würde die Fläche sonst
      // ständig verändern, und ein Ziel, das atmet, trifft man schlechter.
      el("circle", { cx: 0, cy: discY, r: 44, fill: "transparent", class: "train-start-hit" }),
      el("circle", { cx: 0, cy: discY, r: 30, class: "train-start-ring", fill: "none", stroke: "#3fbf74", "stroke-width": 4, opacity: "0.55" }),
      el("circle", { cx: 0, cy: discY, r: 24, fill: shade("#3fbf74", -0.35) }),
      el("circle", { cx: 0, cy: discY, r: 20, class: "train-start-lamp", fill: "#3fbf74" }),
      el("polygon", { points: `-7,${discY - 10} 9,${discY} -7,${discY + 10}`, fill: "#ffffff" }),
    ]);
  }

  function buildTrack(width) {
    const ties = [];
    for (let x = 10; x < width; x += 30) {
      ties.push(el("rect", { x, y: GROUND + 8, width: 5, height: 11, rx: 2, fill: "#7b5c3a", opacity: "0.55" }));
    }
    return group({ class: "train-track", "aria-hidden": "true" }, [
      ...ties,
      el("rect", { x: 0, y: GROUND, width, height: 5, rx: 2.5, fill: "#8c93a1" }),
      el("rect", { x: 0, y: GROUND + 5, width, height: 3, fill: "#6a7180", opacity: "0.7" }),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Bauteile der Lok-Werkstatt (Etappe 5)
  // ---------------------------------------------------------------------------
  // Die Farbpalette ist bewusst klein und kräftig: zwölf Farben, die ein Kind
  // auseinanderhalten kann, statt eines stufenlosen Farbwählers.
  const PALETTE = [
    "#c9483a", "#e8763a", "#f0b429", "#7cb342", "#2f8f5b", "#00a5b5",
    "#2f6f8f", "#5b6ee1", "#7c5ce6", "#c2559b", "#8a5f1c", "#4a5568",
  ];

  // Worauf die Werkstatt zoomt, wenn ein Bauteil angetippt wird. Die Rechtecke
  // liegen im Koordinatensystem der Lok und haben etwas Luft, damit das Teil
  // nicht am Rand klebt.
  const PART_FOCUS = {
    whole: { x: -4, y: 8, width: 208, height: 180 },
    driver: { x: 6, y: 60, width: 70, height: 72 },
    cab: { x: -2, y: 38, width: 92, height: 122 },
    body: { x: 60, y: 78, width: 110, height: 82 },
    whistle: { x: 82, y: 74, width: 46, height: 62 },
    chimney: { x: 110, y: 24, width: 78, height: 78 },
    lamp: { x: 152, y: 82, width: 52, height: 50 },
    wheels: { x: 14, y: 122, width: 176, height: 68 },
    flag: { x: 24, y: 6, width: 66, height: 46 },
    plough: { x: 162, y: 116, width: 46, height: 60 },
  };

  // Wo man ein Bauteil antippt. Die Zeichnungen überlappen sich – der Chauffeur
  // sitzt im Führerhaus, die Pfeife auf dem Kessel –, also lassen sich die
  // gezeichneten Formen nicht als Ziel benutzen: ein Tipp auf die Mitte des
  // Führerhauses träfe immer das Tier. Diese Felder sind bewusst
  // überschneidungsfrei, damit jedes Ziel eindeutig ist.
  const PART_HIT = {
    flag: { x: 30, y: 6, width: 56, height: 34 },
    cab: { x: 0, y: 44, width: 80, height: 30 },
    driver: { x: 18, y: 74, width: 46, height: 44 },
    whistle: { x: 86, y: 76, width: 36, height: 32 },
    body: { x: 66, y: 112, width: 46, height: 34 },
    chimney: { x: 124, y: 24, width: 62, height: 60 },
    lamp: { x: 150, y: 90, width: 52, height: 40 },
    wheels: { x: 16, y: 148, width: 170, height: 36 },
  };

  // Für die kleinen Vorschau-Plättchen braucht es engere, eher quadratische
  // Ausschnitte als für die Kamera: ein 176 breiter Räder-Streifen in einem
  // quadratischen Plättchen wäre fast nur Leerraum.
  const PART_PREVIEW = {
    flag: { x: 28, y: 6, width: 58, height: 50 },
    cab: { x: 0, y: 44, width: 82, height: 76 },
    driver: { x: 10, y: 64, width: 62, height: 62 },
    whistle: { x: 80, y: 72, width: 52, height: 58 },
    body: { x: 70, y: 86, width: 68, height: 66 },
    chimney: { x: 112, y: 24, width: 76, height: 74 },
    lamp: { x: 150, y: 82, width: 52, height: 50 },
    wheels: { x: 80, y: 128, width: 54, height: 58 },
  };

  // Wo der Hinweispunkt sitzt. Die Mitte des Trefferfelds wäre der bequeme
  // Ort, liegt aber genau auf dem, was man sehen will – beim Chauffeur mitten
  // im Gesicht. Diese Punkte liegen daneben: auf dem Führerhaus unter dem
  // Fenster, auf dem Rahmen zwischen den Rädern, neben der Fahne.
  const PART_DOT = {
    flag: { x: 76, y: 16 },
    cab: { x: 22, y: 63 },
    driver: { x: 41, y: 128 },
    whistle: { x: 104, y: 84 },
    body: { x: 90, y: 148 },
    chimney: { x: 155, y: 58 },
    lamp: { x: 179, y: 106 },
    wheels: { x: 133, y: 160 },
  };

  const LOCO_PARTS = [
    { id: "driver", label: "Chauffeur", kind: "driver", options: DRIVERS.map((d) => d.id) },
    { id: "body", label: "Kesselfarbe", kind: "color", options: PALETTE },
    { id: "wheels", label: "Räder", kind: "shapeColor", shapes: WHEEL_SHAPES, options: PALETTE },
    { id: "chimney", label: "Kamin", kind: "shapeColor", shapes: CHIMNEY_SHAPES, colorKey: "smoke", options: ["#dfe6ee", "#c9d4e2", "#e8d8c0", "#d8c8e2"] },
    { id: "cab", label: "Führerhaus", kind: "shapeColor", shapes: CAB_SHAPES, options: PALETTE },
    { id: "lamp", label: "Frontlampe", kind: "shapeColor", shapes: LAMP_SHAPES, options: ["#ffe066", "#ffffff", "#9be7ff", "#ffb3c1"] },
    { id: "whistle", label: "Pfeife", kind: "sound", options: WHISTLES },
    { id: "flag", label: "Wimpel", kind: "shapeColor", shapes: FLAG_PATTERNS, options: PALETTE },
  ];

  // ---------------------------------------------------------------------------
  // Bereichs-Symbole
  // ---------------------------------------------------------------------------
  // Ein Zeichen je Bereich, gezeichnet in einem 100×100-Feld. Die Symbole sind
  // das, was ein Kind wiedererkennt, bevor es die Farbe zuordnen kann – deshalb
  // müssen sie sich auch in Graustufen klar unterscheiden.
  function areaIcon(name, color = "#ffffff") {
    const parts = [];
    if (name === "brain") {
      parts.push(el("circle", { cx: 50, cy: 54, r: 30, fill: color }));
      parts.push(el("circle", { cx: 30, cy: 38, r: 15, fill: color }));
      parts.push(el("circle", { cx: 50, cy: 28, r: 16, fill: color }));
      parts.push(el("circle", { cx: 70, cy: 38, r: 15, fill: color }));
      // Die Falten dürfen nicht unten aus der Form herauslaufen – sonst liest
      // sich das Ganze als Blumenkohl mit Stiel statt als Gehirn.
      parts.push(el("path", {
        d: "M50 26 V78 M38 40 q-9 9 -1 18 M62 46 q9 9 1 18",
        fill: "none", stroke: "#00000055", "stroke-width": 5, "stroke-linecap": "round",
      }));
    } else if (name === "target") {
      parts.push(el("circle", { cx: 50, cy: 50, r: 34, fill: "none", stroke: color, "stroke-width": 9 }));
      parts.push(el("circle", { cx: 50, cy: 50, r: 19, fill: "none", stroke: color, "stroke-width": 9, opacity: "0.7" }));
      parts.push(el("circle", { cx: 50, cy: 50, r: 6, fill: color }));
    } else if (name === "bolt") {
      parts.push(el("polygon", { points: "58,10 26,54 46,54 40,90 74,44 52,44", fill: color }));
    } else if (name === "puzzle") {
      parts.push(el("path", {
        d: "M24 24 H74 V42 a10 10 0 0 1 0 20 V80 H58 a10 10 0 0 0 -20 0 H24 Z",
        fill: color,
      }));
    } else {
      // Zahl und Buchstabe: die Zeichen selbst sind hier der Inhalt, nicht
      // Beschriftung – deshalb ist Schrift an dieser einen Stelle richtig.
      parts.push(el("text", {
        x: 38, y: 76, "font-family": "Inter, system-ui, sans-serif", "font-size": 76,
        "font-weight": 900, fill: color, "text-anchor": "middle",
      }, []));
      parts.push(el("text", {
        x: 76, y: 82, "font-family": "Inter, system-ui, sans-serif", "font-size": 54,
        "font-weight": 900, fill: color, opacity: "0.75", "text-anchor": "middle",
      }, []));
      parts[0].textContent = "A";
      parts[1].textContent = "1";
    }
    return group({ class: "area-icon", "aria-hidden": "true" }, parts);
  }

  // ---------------------------------------------------------------------------
  // Bereichs-Tor
  // ---------------------------------------------------------------------------
  // Ein Torbogen über dem Gleis, in der Bereichsfarbe und mit dem Symbol des
  // Bereichs. Der Zug fährt hindurch – das ist die Einfahrt in den Bereich.
  const GATE_W = 232;
  const GATE_H = 132;

  function buildGate(area, options = {}) {
    const { label = area.label } = options;
    const color = area.color;
    const dark = shade(color, -0.3);
    const light = shade(color, 0.4);

    const icon = areaIcon(area.icon, inkOn(color));
    icon.setAttribute("transform", `translate(${GATE_W / 2 - 34},14) scale(0.68)`);

    return group({
      class: "train-gate",
      "data-gate": area.id,
      role: "button",
      tabindex: "0",
      "aria-label": label,
    }, [
      // Unsichtbare Trefferfläche über dem ganzen Tor – so ist das Ziel gross
      // und ändert sich nicht, wenn das Tor beim Hovern wächst.
      // Die Trefferfläche ragt nur wenig über das Tor hinaus: die Tore stehen
      // dicht gestaffelt, und zwei Trefferflächen dürfen sich nicht berühren.
      el("rect", { x: -4, y: -8, width: GATE_W + 8, height: GATE_H + 16, rx: 16, fill: "transparent", class: "train-gate-hit" }),
      // Das Innere der Halle. Ohne diese Fläche wäre der Bogen ein Loch, und
      // durch das Loch sähe man alle Gleise, die hinter dem Tor vorbeiführen –
      // fünf Tore, durch die je vier fremde Gleise laufen. Mit dem dunklen
      // Feld wird aus dem Bogen ein Schuppen, in den genau ein Gleis führt.
      el("path", {
        d: `M34 ${GATE_H} L34 74 A${GATE_W / 2 - 34} 40 0 0 1 ${GATE_W - 34} 74 L${GATE_W - 34} ${GATE_H} Z`,
        fill: shade(color, -0.62),
      }),
      el("path", {
        d: `M6 ${GATE_H} L6 60 A${GATE_W / 2 - 6} 54 0 0 1 ${GATE_W - 6} 60 L${GATE_W - 6} ${GATE_H} L${GATE_W - 34} ${GATE_H} L${GATE_W - 34} 74 A${GATE_W / 2 - 34} 40 0 0 0 34 74 L34 ${GATE_H} Z`,
        fill: color,
      }),
      el("rect", { x: 0, y: GATE_H - 12, width: GATE_W, height: 14, rx: 5, fill: dark }),
      el("rect", { x: 22, y: 46, width: GATE_W - 44, height: 8, rx: 4, fill: light, opacity: "0.6" }),
      icon,
    ]);
  }

  // ---------------------------------------------------------------------------
  // Spiel-Symbole
  // ---------------------------------------------------------------------------
  // Ein eigenes Bild je Spiel, kein Haus mehr. Zwanzig Häuser mit je einem
  // kleinen Zeichen an der Fassade sahen einander zu ähnlich: ein Kind musste
  // das Zeichen suchen, um das Spiel zu finden. Jetzt ist das Bild selbst das
  // Spiel – der Rucksack, die drei Fische, der Turm aus Blöcken –, und an
  // seiner Form ist es aus dem Augenwinkel zu erkennen.
  //
  // Alle Bilder eines Bereichs stehen in den Tönen seiner Farbe: die Bühne
  // gibt sie mit, und tones() leitet daraus Licht, Schatten und eine blasse
  // Fläche ab. Weiss, Creme und ein dunkles Tintenblau kommen als Akzente dazu,
  // sonst nichts – so sagt die Farbe, wo man ist, und die Form, was man spielt.
  //
  // Bewegt wird wenig, aber jedes Bild ein bisschen: der Fisch wippt, die
  // Karte dreht sich um, der Turm wächst. Die Bewegung steht als Klasse am
  // Teil (gi-…, siehe styles.css) und läuft nur über transform und opacity –
  // das zeichnet der Browser günstig, und wer weniger Bewegung eingestellt
  // hat, sieht das fertige Bild still.
  //
  // Jedes Bild steht in einem Feld von BUILD_W × BUILD_H Einheiten; der Boden
  // liegt bei BUILD_BASE, oben rechts bleibt Platz für die Fortschrittsmarke.
  const BUILD_W = 160;
  const BUILD_H = 180;
  const BUILD_BASE = GROUND;

  // Die Farben der fünf Bereiche, als Rückfall ohne Angabe von der Bühne.
  // Dieselben Werte wie in train-progress.js: die Prüfseite und die Kisten am
  // Wagen sollen die Bilder genau so zeigen wie die Bühne.
  const AREA_HUES = {
    gedaechtnis: "#7C5CE6",
    konzentration: "#00A5B5",
    geschwindigkeit: "#F5A623",
    problemloesen: "#3FA34D",
    zahlbuchstabe: "#E8543F",
  };

  const BUILDINGS = {
    backpack: { motif: "backpack", hue: AREA_HUES.gedaechtnis },
    memory: { motif: "memory", hue: AREA_HUES.gedaechtnis },
    beachTreasure: { motif: "beach", hue: AREA_HUES.gedaechtnis },
    tileMemory: { motif: "tiles", hue: AREA_HUES.gedaechtnis },
    flanker: { motif: "flanker", hue: AREA_HUES.konzentration },
    trackRouter: { motif: "switch", hue: AREA_HUES.konzentration },
    fishPond: { motif: "pond", hue: AREA_HUES.konzentration },
    gridlock: { motif: "gridlock", hue: AREA_HUES.konzentration },
    tiersprung: { motif: "hop", hue: AREA_HUES.geschwindigkeit },
    cardMatch: { motif: "cardMatch", hue: AREA_HUES.geschwindigkeit },
    leafFlow: { motif: "leaves", hue: AREA_HUES.geschwindigkeit },
    towerStack: { motif: "tower", hue: AREA_HUES.geschwindigkeit },
    spatialPuzzle: { motif: "spatial", hue: AREA_HUES.problemloesen },
    arukone: { motif: "arukone", hue: AREA_HUES.problemloesen },
    bimaru: { motif: "ships", hue: AREA_HUES.problemloesen },
    shikaku: { motif: "pens", hue: AREA_HUES.problemloesen },
    letterPuzzle: { motif: "letters", hue: AREA_HUES.zahlbuchstabe },
    readingPuzzle: { motif: "book", hue: AREA_HUES.zahlbuchstabe },
    kakuro: { motif: "kakuro", hue: AREA_HUES.zahlbuchstabe },
    hidoku: { motif: "hidoku", hue: AREA_HUES.zahlbuchstabe },
  };

  // Die Töne eines Bereichs. Alles, was ein Bild braucht, kommt aus der einen
  // Farbe – deshalb passt jedes Bild in jeden Bereich, ohne dass irgendwo eine
  // zweite Farbe eingetragen werden müsste.
  function tones(hue) {
    return {
      base: hue,
      dark: shade(hue, -0.28),
      deep: shade(hue, -0.52),
      light: shade(hue, 0.32),
      pale: shade(hue, 0.66),
      mist: shade(hue, 0.86),
      cream: "#fff8ea",
      ink: "#2b3440",
    };
  }

  // --- Kleine Formen, die mehrere Bilder brauchen ----------------------------
  function starPoints(cx, cy, outer, inner, n = 5) {
    const points = [];
    for (let i = 0; i < n * 2; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = -Math.PI / 2 + (i * Math.PI) / n;
      points.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`);
    }
    return points.join(" ");
  }

  function heartPath(cx, cy, s) {
    return `M${cx} ${cy + s * 0.9} C ${cx - s * 1.25} ${cy - s * 0.15}, ${cx - s * 0.8} ${cy - s * 1.15}, ${cx} ${cy - s * 0.45}`
      + ` C ${cx + s * 0.8} ${cy - s * 1.15}, ${cx + s * 1.25} ${cy - s * 0.15}, ${cx} ${cy + s * 0.9} Z`;
  }

  // Ein Glitzern: ein Stern mit vier Zacken.
  function sparkle(cx, cy, s, fill, className, style = null) {
    return el("path", {
      class: className,
      d: `M${cx} ${cy - s} Q${cx} ${cy} ${cx + s} ${cy} Q${cx} ${cy} ${cx} ${cy + s} Q${cx} ${cy} ${cx - s} ${cy} Q${cx} ${cy} ${cx} ${cy - s} Z`,
      fill,
      style,
    });
  }

  function textNode(x, y, size, fill, text, extra = {}) {
    const node = el("text", {
      x, y, "font-family": "Inter, system-ui, sans-serif", "font-size": size,
      "font-weight": 900, fill, "text-anchor": "middle", ...extra,
    }, []);
    node.textContent = text;
    return node;
  }

  // Ein Fisch, der nach rechts schaut; dir < 0 spiegelt ihn nach links. Die
  // Schwanzflosse hat ihre eigene Gruppe: sie wedelt.
  function fishNode(cx, cy, size, dir, color, t) {
    return group({ transform: `translate(${cx},${cy}) scale(${dir < 0 ? -size : size},${size})` }, [
      group({ class: "gi gi-tail" }, [
        el("polygon", { points: "-16,0 -33,-13 -33,13", fill: color }),
      ]),
      el("ellipse", { cx: 0, cy: 0, rx: 21, ry: 13, fill: color }),
      el("path", { d: "M-8 -11 q7 -10 16 -2 z", fill: color }),
      el("path", { d: "M-2 4 q5 7 9 12", fill: "none", stroke: shade(color, -0.22), "stroke-width": 3, "stroke-linecap": "round" }),
      el("circle", { cx: 10, cy: -3, r: 4.4, fill: "#ffffff" }),
      el("circle", { cx: 11.4, cy: -3, r: 2.2, fill: t.ink }),
      el("path", { d: "M14 5 q3 2 6 0", fill: "none", stroke: t.ink, "stroke-width": 1.4, "stroke-linecap": "round" }),
    ]);
  }

  // Ein Blatt mit der Spitze oben; rot dreht die Spitze dorthin, wo es hin will.
  function leafNode(cx, cy, s, rot, fill, vein) {
    return group({ transform: `translate(${cx},${cy}) rotate(${rot}) scale(${s})` }, [
      el("path", { d: "M0 -14 C 9 -5, 12 2, 12 4 A 12 12 0 0 1 -12 4 C -12 2, -9 -5, 0 -14 Z", fill }),
      el("path", { d: "M0 -8 V12 M0 -1 l-6 5 M0 -1 l6 5", fill: "none", stroke: vein, "stroke-width": 2, "stroke-linecap": "round" }),
    ]);
  }

  // Ein Würfel von schräg oben: die vordere untere Ecke liegt bei (x, y).
  function cubeNodes(x, y, s, t) {
    const dx = s * 0.87;
    const dy = s * 0.5;
    return [
      el("polygon", { points: `${x},${y} ${x},${y - s} ${x - dx},${y - s - dy} ${x - dx},${y - dy}`, fill: t.base }),
      el("polygon", { points: `${x},${y} ${x},${y - s} ${x + dx},${y - s - dy} ${x + dx},${y - dy}`, fill: t.dark }),
      el("polygon", { points: `${x},${y - s} ${x + dx},${y - s - dy} ${x},${y - 2 * s} ${x - dx},${y - s - dy}`, fill: t.light }),
    ];
  }

  // Ein Spielbrett mit feinem Raster, wie es vier Rätsel brauchen.
  function boardNodes(x0, y0, size, cells, fill, t, line) {
    const parts = [el("rect", { x: x0, y: y0, width: size, height: size, rx: 12, fill, stroke: t.dark, "stroke-width": 4 })];
    const cell = size / cells;
    for (let i = 1; i < cells; i += 1) {
      parts.push(el("path", {
        d: `M${x0 + i * cell} ${y0 + 5} V${y0 + size - 5} M${x0 + 5} ${y0 + i * cell} H${x0 + size - 5}`,
        fill: "none", stroke: line, "stroke-width": 2, opacity: "0.75",
      }));
    }
    return parts;
  }

  // Der Boden, auf dem jedes Bild steht: ein weicher Schatten. Ist das Spiel
  // geschafft, wird daraus ein goldener Teller – dasselbe Gold wie die Räder
  // des fertigen Wagens, damit "fertig" überall gleich aussieht.
  function podium(t, done) {
    const B = BUILD_BASE;
    if (done) {
      return [
        el("ellipse", { cx: 80, cy: B - 3, rx: 62, ry: 7.5, fill: "#d99a1e" }),
        el("ellipse", { cx: 80, cy: B - 5, rx: 56, ry: 5, fill: "#f0b429" }),
      ];
    }
    return [el("ellipse", { cx: 80, cy: B - 3, rx: 56, ry: 6, fill: t.deep, opacity: "0.28" })];
  }

  // --- Gedächtnis -------------------------------------------------------------
  // Rucksack packen: ein offener Rucksack, aus dem die Sachen herausschauen.
  function motifBackpack(t) {
    const B = BUILD_BASE;
    return [
      el("rect", { x: 24, y: B - 112, width: 14, height: 72, rx: 7, fill: t.deep }),
      el("rect", { x: 122, y: B - 112, width: 14, height: 72, rx: 7, fill: t.deep }),
      // Der Deckel, hochgeklappt, mit dem Griff obendrauf
      el("rect", { x: 42, y: B - 162, width: 76, height: 40, rx: 18, fill: t.dark }),
      el("path", { d: `M66 ${B - 162} a14 14 0 0 1 28 0`, fill: "none", stroke: t.deep, "stroke-width": 7, "stroke-linecap": "round" }),
      // Was gepackt wird – Flasche, Ball, Buch – wippt beim Einräumen
      group({ class: "gi gi-bob" }, [
        el("rect", { x: 52, y: B - 150, width: 16, height: 40, rx: 6, fill: t.cream }),
        el("rect", { x: 55, y: B - 156, width: 10, height: 9, rx: 3, fill: t.deep }),
        el("circle", { cx: 86, cy: B - 134, r: 14, fill: t.light }),
        el("path", { d: `M74 ${B - 138} q12 -8 24 0`, fill: "none", stroke: t.base, "stroke-width": 4, "stroke-linecap": "round" }),
        el("rect", { x: 102, y: B - 146, width: 18, height: 26, rx: 3, fill: t.cream }),
        el("rect", { x: 102, y: B - 146, width: 5, height: 26, rx: 2, fill: t.dark }),
      ]),
      // Der Rucksack selbst
      el("rect", { x: 36, y: B - 124, width: 88, height: 118, rx: 22, fill: t.base }),
      el("rect", { x: 36, y: B - 124, width: 88, height: 12, rx: 6, fill: t.light, opacity: "0.55" }),
      el("path", { d: `M48 ${B - 104} v64 M112 ${B - 104} v64`, fill: "none", stroke: t.light, "stroke-width": 2.5, "stroke-dasharray": "5 5", opacity: "0.6" }),
      // Vordertasche mit Klappe und Schnalle
      el("rect", { x: 52, y: B - 66, width: 56, height: 44, rx: 10, fill: t.dark }),
      el("rect", { x: 52, y: B - 66, width: 56, height: 16, rx: 8, fill: t.deep }),
      el("rect", { x: 73, y: B - 60, width: 14, height: 16, rx: 4, fill: t.cream }),
    ];
  }

  // Memory: Karten auf dem Tisch, zwei Sterne liegen offen – ein Paar –, und
  // eine Karte dreht sich gerade um.
  function motifMemory(t) {
    const B = BUILD_BASE;
    const cardW = 32;
    const cardH = 40;
    const cols = [24, 64, 104];
    const rows = [B - 96, B - 50];
    const back = (x, y) => [
      el("rect", { x, y, width: cardW, height: cardH, rx: 5, fill: t.base }),
      el("rect", { x: x + 4, y: y + 4, width: cardW - 8, height: cardH - 8, rx: 3, fill: "none", stroke: t.light, "stroke-width": 2 }),
      el("circle", { cx: x + cardW / 2, cy: y + cardH / 2, r: 5, fill: t.light }),
    ];
    const front = (x, y, symbol) => [
      el("rect", { x, y, width: cardW, height: cardH, rx: 5, fill: t.cream }),
      symbol === "star"
        ? el("polygon", { points: starPoints(x + cardW / 2, y + cardH / 2 + 1, 12, 5.5), fill: t.base })
        : el("path", { d: heartPath(x + cardW / 2, y + cardH / 2, 11), fill: t.base }),
    ];
    return [
      el("rect", { x: 14, y: B - 106, width: 132, height: 100, rx: 16, fill: t.pale }),
      el("rect", { x: 14, y: B - 16, width: 132, height: 10, rx: 5, fill: t.dark }),
      ...front(cols[0], rows[0], "star"), ...front(cols[1], rows[0], "star"), ...back(cols[2], rows[0]),
      ...back(cols[0], rows[1]), ...back(cols[1], rows[1]),
      group({ class: "gi gi-flip-back" }, back(cols[2], rows[1])),
      group({ class: "gi gi-flip-front", style: "transform:scaleX(0)" }, front(cols[2], rows[1], "heart")),
    ];
  }

  // Strand-Schätze: eine Palme auf einer Sanddüne, und im Sand liegen die
  // Schätze – eine Muschel, ein Seestern, ein Stein – und glitzern.
  function motifBeach(t) {
    const B = BUILD_BASE;
    return [
      el("path", { d: `M4 ${B} C 30 ${B - 50}, 130 ${B - 50}, 156 ${B} Z`, fill: t.pale }),
      el("path", { d: `M40 ${B - 20} C 60 ${B - 36}, 100 ${B - 36}, 120 ${B - 20}`, fill: "none", stroke: t.mist, "stroke-width": 4, "stroke-linecap": "round" }),
      el("path", { d: `M48 ${B - 26} Q 54 ${B - 80} 72 ${B - 120}`, fill: "none", stroke: t.deep, "stroke-width": 12, "stroke-linecap": "round" }),
      el("path", { d: `M52 ${B - 30} Q 57 ${B - 78} 72 ${B - 116}`, fill: "none", stroke: t.dark, "stroke-width": 4, "stroke-linecap": "round", opacity: "0.7" }),
      // Die Blätter wiegen sich um die Stammspitze
      group({ class: "gi gi-sway", style: "transform-origin:50% 67%" }, [
        el("path", { d: `M72 ${B - 120} C 96 ${B - 134}, 124 ${B - 122}, 132 ${B - 96} C 112 ${B - 108}, 92 ${B - 110}, 72 ${B - 120} Z`, fill: t.base }),
        el("path", { d: `M72 ${B - 120} C 48 ${B - 134}, 20 ${B - 122}, 12 ${B - 96} C 32 ${B - 108}, 52 ${B - 110}, 72 ${B - 120} Z`, fill: t.dark }),
        el("path", { d: `M72 ${B - 120} C 90 ${B - 146}, 116 ${B - 150}, 134 ${B - 134} C 112 ${B - 136}, 90 ${B - 128}, 72 ${B - 120} Z`, fill: t.light }),
        el("path", { d: `M72 ${B - 120} C 54 ${B - 146}, 28 ${B - 150}, 10 ${B - 134} C 32 ${B - 136}, 54 ${B - 128}, 72 ${B - 120} Z`, fill: t.base }),
        el("path", { d: `M72 ${B - 120} C 66 ${B - 146}, 74 ${B - 162}, 88 ${B - 168} C 88 ${B - 148}, 82 ${B - 134}, 72 ${B - 120} Z`, fill: t.light }),
        el("circle", { cx: 66, cy: B - 114, r: 6.5, fill: t.deep }),
        el("circle", { cx: 78, cy: B - 112, r: 6.5, fill: t.deep }),
      ]),
      el("path", { d: `M92 ${B - 12} a15 15 0 0 1 30 0 z`, fill: t.cream }),
      el("path", { d: `M107 ${B - 12} v-14 M99 ${B - 12} l3 -12 M115 ${B - 12} l-3 -12`, fill: "none", stroke: t.light, "stroke-width": 2.5, "stroke-linecap": "round" }),
      el("polygon", { points: starPoints(36, B - 18, 13, 6), fill: t.light }),
      el("circle", { cx: 36, cy: B - 18, r: 3, fill: t.cream }),
      el("circle", { cx: 132, cy: B - 12, r: 6, fill: t.dark }),
      sparkle(124, B - 42, 8, t.cream, "gi gi-twinkle"),
      sparkle(56, B - 46, 6, t.cream, "gi gi-twinkle", "animation-delay:-1.2s"),
    ];
  }

  // Kacheln-Knobeln: eine Tafel auf einem Pfosten, neun Kacheln, vier davon
  // leuchten – das Muster, das man sich merken soll.
  function motifTiles(t) {
    const B = BUILD_BASE;
    const parts = [
      el("rect", { x: 74, y: B - 40, width: 12, height: 40, rx: 3, fill: t.deep }),
      el("rect", { x: 22, y: B - 138, width: 116, height: 104, rx: 12, fill: t.dark }),
    ];
    const lit = new Set(["0,1", "1,0", "1,1", "2,2"]);
    const size = 30;
    const gap = 4;
    const ox = 22 + (116 - (3 * size + 2 * gap)) / 2;
    const oy = B - 138 + (104 - (3 * size + 2 * gap)) / 2;
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        const x = ox + c * (size + gap);
        const y = oy + r * (size + gap);
        const on = lit.has(`${r},${c}`);
        parts.push(el("rect", { x, y, width: size, height: size, rx: 5, fill: t.base }));
        if (on) {
          parts.push(el("rect", {
            class: "gi gi-twinkle", x, y, width: size, height: size, rx: 5, fill: t.cream,
            style: `animation-delay:${(-(r * 3 + c) * 0.35).toFixed(2)}s`,
          }));
        }
      }
    }
    return parts;
  }

  // --- Konzentration ----------------------------------------------------------
  // Schwarm-Fokus: drei Fische in einer Reihe, der mittlere schaut andersherum.
  function motifFlanker(t) {
    const B = BUILD_BASE;
    const y = B - 76;
    const wave = (d, o) => el("path", { d, fill: "none", stroke: t.light, "stroke-width": 4, "stroke-linecap": "round", opacity: String(o) });
    return [
      wave(`M12 ${B - 26} q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0`, 0.8),
      wave(`M22 ${B - 12} q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0`, 0.5),
      group({ class: "gi gi-bob" }, [fishNode(28, y, 0.75, 1, t.base, t)]),
      group({ class: "gi gi-bob", style: "animation-delay:-1.4s" }, [fishNode(80, y, 0.9, -1, t.light, t)]),
      group({ class: "gi gi-bob", style: "animation-delay:-0.7s" }, [fishNode(132, y, 0.75, 1, t.base, t)]),
      el("circle", { class: "gi gi-bubble", cx: 58, cy: B - 96, r: 3, fill: t.cream, opacity: "0.85" }),
      el("circle", { class: "gi gi-bubble", cx: 66, cy: B - 102, r: 2, fill: t.cream, opacity: "0.85", style: "animation-delay:-1.6s" }),
    ];
  }

  // Weichen-Wirrwarr: ein Gleis, das sich teilt, die Weiche schlägt um, und auf
  // beiden Ästen fährt ein Wagen davon.
  function motifSwitch(t) {
    const B = BUILD_BASE;
    const forkY = B - 62;
    const track = (d) => [
      el("path", { d, fill: "none", stroke: t.deep, "stroke-width": 14, "stroke-linecap": "round" }),
      el("path", { d, fill: "none", stroke: t.light, "stroke-width": 4, "stroke-linecap": "round", "stroke-dasharray": "6 8" }),
    ];
    const wagon = (x, y, color) => [
      el("rect", { x: x - 15, y: y - 10, width: 30, height: 20, rx: 6, fill: color }),
      el("rect", { x: x - 9, y: y - 5, width: 7, height: 7, rx: 2, fill: t.cream }),
      el("rect", { x: x + 2, y: y - 5, width: 7, height: 7, rx: 2, fill: t.cream }),
      el("circle", { cx: x - 8, cy: y + 11, r: 4, fill: t.deep }),
      el("circle", { cx: x + 8, cy: y + 11, r: 4, fill: t.deep }),
    ];
    return [
      ...track(`M80 ${B - 4} V${forkY}`),
      ...track(`M80 ${forkY} L30 ${B - 112}`),
      ...track(`M80 ${forkY} L130 ${B - 112}`),
      el("rect", { class: "gi gi-switch", x: 76, y: forkY - 34, width: 8, height: 34, rx: 4, fill: t.cream }),
      el("circle", { cx: 80, cy: forkY, r: 7, fill: t.dark }),
      group({ class: "gi gi-nudge-l" }, wagon(30, B - 124, t.base)),
      group({ class: "gi gi-nudge-r" }, wagon(130, B - 124, t.light)),
      ...wagon(80, B - 26, t.base),
    ];
  }

  // Fischteich: ein runder Teich, und darin schwimmen Fische kreuz und quer.
  function motifPond(t) {
    const B = BUILD_BASE;
    return [
      el("ellipse", { cx: 80, cy: B - 58, rx: 74, ry: 48, fill: t.deep }),
      el("ellipse", { cx: 80, cy: B - 58, rx: 66, ry: 41, fill: t.light }),
      el("ellipse", { cx: 80, cy: B - 66, rx: 52, ry: 26, fill: t.pale, opacity: "0.5" }),
      el("circle", { cx: 124, cy: B - 36, r: 10, fill: t.dark }),
      el("path", { d: `M124 ${B - 36} l11 -4 l-3 8 z`, fill: t.light }),
      group({ class: "gi gi-swim-1" }, [fishNode(52, B - 82, 0.55, 1, t.base, t)]),
      group({ class: "gi gi-swim-2" }, [fishNode(106, B - 72, 0.62, -1, t.dark, t)]),
      group({ class: "gi gi-swim-3" }, [fishNode(72, B - 46, 0.58, -1, t.cream, t)]),
      group({ class: "gi gi-swim-1", style: "animation-delay:-2.3s" }, [fishNode(104, B - 42, 0.5, 1, t.base, t)]),
      group({ class: "gi gi-swim-3", style: "animation-delay:-1.9s" }, [fishNode(40, B - 58, 0.46, 1, t.dark, t)]),
    ];
  }

  // Freie Fahrt: der helle Zug fährt zwischen zwei quer stehenden hindurch zum
  // Tor am rechten Rand.
  function motifGridlock(t) {
    const B = BUILD_BASE;
    const x0 = 18;
    const y0 = B - 140;
    const size = 124;
    const cell = 31;
    const parts = [el("rect", { x: x0, y: y0, width: size, height: size, rx: 10, fill: t.pale })];
    for (let i = 1; i < 4; i += 1) {
      parts.push(el("path", {
        d: `M${x0 + i * cell} ${y0 + 4} V${y0 + size - 4} M${x0 + 4} ${y0 + i * cell} H${x0 + size - 4}`,
        fill: "none", stroke: t.light, "stroke-width": 2, opacity: "0.7",
      }));
    }
    // Der Rahmen, rechts in der zweiten Reihe offen: das Tor.
    parts.push(el("path", {
      d: `M${x0 + size} ${y0 + 2 * cell} V${y0 + size - 10} a10 10 0 0 1 -10 10 H${x0 + 10} a10 10 0 0 1 -10 -10`
        + ` V${y0 + 10} a10 10 0 0 1 10 -10 H${x0 + size - 10} a10 10 0 0 1 10 10 V${y0 + cell}`,
      fill: "none", stroke: t.dark, "stroke-width": 5, "stroke-linecap": "round",
    }));
    parts.push(el("path", {
      d: `M${x0 + size + 3} ${y0 + 1.5 * cell} h8 m-4 -4 l4 4 l-4 4`,
      fill: "none", stroke: t.dark, "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round",
    }));
    const block = (x, y, w, h) => [
      el("rect", { x, y, width: w, height: h, rx: 6, fill: t.dark }),
      el("rect", { x: x + 5, y: y + 5, width: w - 10, height: h - 10, rx: 3, fill: "none", stroke: t.base, "stroke-width": 2.5, opacity: "0.8" }),
    ];
    parts.push(...block(x0 + 2 * cell + 3, y0 + 3, cell - 6, cell - 6));
    parts.push(...block(x0 + 2 * cell + 3, y0 + 2 * cell + 3, cell - 6, 2 * cell - 6));
    parts.push(...block(x0 + 3, y0 + 2 * cell + 3, cell - 6, 2 * cell - 6));
    parts.push(group({ class: "gi gi-slide" }, [
      el("rect", { x: x0 + 6, y: y0 + cell + 4, width: 56, height: cell - 8, rx: 7, fill: t.cream }),
      el("rect", { x: x0 + 44, y: y0 + cell + 4, width: 18, height: cell - 8, rx: 7, fill: t.deep }),
      el("rect", { x: x0 + 12, y: y0 + cell + 10, width: 24, height: 5, rx: 2.5, fill: t.light }),
    ]));
    return parts;
  }

  // --- Geschwindigkeit --------------------------------------------------------
  // Tier-Sprung: die Maus vom ersten Level hüpft über einen Baumstamm.
  function motifHop(t) {
    const B = BUILD_BASE;
    const mouse = group({ transform: `translate(64,${B - 30})` }, [
      el("path", { d: "M-22 2 C -40 6, -46 -16, -34 -24", fill: "none", stroke: t.deep, "stroke-width": 4, "stroke-linecap": "round" }),
      el("ellipse", { cx: -10, cy: 14, rx: 8, ry: 4.5, fill: t.dark }),
      el("ellipse", { cx: 14, cy: 14, rx: 7, ry: 4.5, fill: t.dark }),
      el("ellipse", { cx: 0, cy: 0, rx: 26, ry: 17, fill: t.base }),
      el("ellipse", { cx: 4, cy: 5, rx: 15, ry: 9, fill: t.light, opacity: "0.8" }),
      el("circle", { cx: 24, cy: -8, r: 14, fill: t.base }),
      el("circle", { cx: 16, cy: -24, r: 8, fill: t.base }),
      el("circle", { cx: 16, cy: -24, r: 4.5, fill: t.light }),
      el("circle", { cx: 30, cy: -22, r: 8, fill: t.base }),
      el("circle", { cx: 30, cy: -22, r: 4.5, fill: t.light }),
      el("circle", { cx: 28, cy: -9, r: 2.6, fill: t.ink }),
      el("circle", { cx: 38, cy: -4, r: 3.4, fill: t.deep }),
      el("path", { d: "M34 -2 l10 -3 M34 0 l10 3", fill: "none", stroke: t.deep, "stroke-width": 1.4, "stroke-linecap": "round" }),
    ]);
    return [
      el("path", { d: `M10 ${B - 60} h18 M4 ${B - 48} h14 M12 ${B - 36} h16`, fill: "none", stroke: t.light, "stroke-width": 4, "stroke-linecap": "round" }),
      el("rect", { x: 104, y: B - 26, width: 42, height: 22, rx: 11, fill: t.deep }),
      el("circle", { cx: 136, cy: B - 15, r: 7, fill: t.light }),
      el("circle", { cx: 136, cy: B - 15, r: 3, fill: t.dark }),
      el("ellipse", { class: "gi gi-hop-shadow", cx: 66, cy: B - 6, rx: 30, ry: 5, fill: t.deep, opacity: "0.3" }),
      group({ class: "gi gi-hop" }, [mouse]),
    ];
  }

  // Karten-Merker: zwei Karten und eine Stoppuhr – dieselbe wie die davor?
  function motifCardMatch(t) {
    const B = BUILD_BASE;
    const card = (x, y, rot, symbolFill) => group({ transform: `rotate(${rot} ${x + 22} ${y + 62})` }, [
      el("rect", { x, y, width: 44, height: 62, rx: 6, fill: t.cream }),
      el("rect", { x: x + 4, y: y + 4, width: 36, height: 54, rx: 4, fill: "none", stroke: t.pale, "stroke-width": 2 }),
      el("polygon", { points: starPoints(x + 22, y + 31, 15, 7), fill: symbolFill }),
    ]);
    return [
      card(48, B - 70, -9, t.light),
      card(80, B - 70, 7, t.base),
      el("rect", { x: 30, y: B - 156, width: 12, height: 10, rx: 3, fill: t.deep }),
      el("path", { d: `M52 ${B - 144} l8 -7`, fill: "none", stroke: t.deep, "stroke-width": 5, "stroke-linecap": "round" }),
      el("circle", { cx: 36, cy: B - 124, r: 24, fill: t.dark }),
      el("circle", { cx: 36, cy: B - 124, r: 18, fill: t.cream }),
      el("path", { d: `M36 ${B - 139} v3 M36 ${B - 112} v3 M21 ${B - 124} h3 M48 ${B - 124} h3`, fill: "none", stroke: t.dark, "stroke-width": 2.5, "stroke-linecap": "round" }),
      el("rect", { class: "gi gi-spin", x: 34, y: B - 138, width: 4, height: 14, rx: 2, fill: t.base }),
      el("circle", { cx: 36, cy: B - 124, r: 3, fill: t.dark }),
    ];
  }

  // Blätter im Strom: zwei Bäche kreuzen sich, auf dem einen treiben die
  // Blätter nach rechts, auf dem anderen nach unten.
  function motifLeaves(t) {
    const B = BUILD_BASE;
    const ripple = (d) => el("path", { d, fill: "none", stroke: t.mist, "stroke-width": 3, "stroke-linecap": "round", opacity: "0.9" });
    return [
      el("rect", { x: 62, y: B - 162, width: 36, height: 158, rx: 18, fill: t.light }),
      el("rect", { x: 6, y: B - 92, width: 148, height: 36, rx: 18, fill: t.light }),
      ripple(`M16 ${B - 80} q6 -4 12 0 M120 ${B - 66} q6 -4 12 0 M34 ${B - 66} q6 -4 12 0 M136 ${B - 82} q6 -4 12 0`),
      ripple(`M74 ${B - 146} q6 -4 12 0 M70 ${B - 30} q6 -4 12 0 M80 ${B - 118} q6 -4 12 0 M68 ${B - 50} q6 -4 12 0`),
      group({ class: "gi gi-flow-x-a" }, [leafNode(50, B - 74, 1, 90, t.base, t.pale)]),
      group({ class: "gi gi-flow-x-b" }, [leafNode(80, B - 74, 0.9, 90, t.dark, t.pale)]),
      group({ class: "gi gi-flow-x-c" }, [leafNode(110, B - 74, 1, 90, t.cream, t.light)]),
      group({ class: "gi gi-flow-y-a" }, [leafNode(80, B - 122, 0.95, 180, t.dark, t.pale)]),
      group({ class: "gi gi-flow-y-b" }, [leafNode(80, B - 40, 0.9, 180, t.cream, t.light)]),
    ];
  }

  // Turmbau: der Turm wächst Block um Block, und darüber schwingt der nächste.
  function motifTower(t) {
    const B = BUILD_BASE;
    const h = 19;
    const blocks = [[80, 70, t.base], [83, 62, t.light], [79, 54, t.dark], [84, 48, t.base], [81, 42, t.light]];
    const parts = [
      el("rect", { x: 34, y: B - 16, width: 92, height: 16, rx: 5, fill: t.deep }),
      el("rect", { x: 38, y: B - 16, width: 84, height: 4, rx: 2, fill: t.dark }),
    ];
    blocks.forEach(([cx, w, color], i) => {
      const y = B - 16 - h * (i + 1);
      parts.push(group({ class: `gi gi-build-${i + 1}` }, [
        el("rect", { x: cx - w / 2, y, width: w, height: h, rx: 4, fill: color }),
        el("rect", { x: cx - w / 2 + 3, y: y + 2, width: w - 6, height: 3, rx: 1.5, fill: "#ffffff", opacity: "0.35" }),
      ]));
    });
    const top = B - 16 - h * 5 - 26;
    parts.push(group({ class: "gi gi-swing" }, [
      el("rect", { x: 61, y: top, width: 38, height: h, rx: 4, fill: t.dark }),
      el("rect", { x: 64, y: top + 2, width: 32, height: 3, rx: 1.5, fill: "#ffffff", opacity: "0.35" }),
    ]));
    return parts;
  }

  // --- Problemlösen -----------------------------------------------------------
  // Raumdetektiv: ein Bau aus Würfeln, und die Lupe schaut ihn sich an.
  function motifSpatial(t) {
    const B = BUILD_BASE;
    const s = 24;
    const at = (i, j, k) => [66 + (i - j) * s * 0.87, B - 46 + (i + j) * s * 0.5 - k * s];
    const parts = [];
    [[0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0], [1, 1, 0]].forEach(([i, j, k]) => {
      const [x, y] = at(i, j, k);
      parts.push(...cubeNodes(x, y, s, t));
    });
    parts.push(group({ class: "gi gi-hover" }, [
      el("path", { d: `M121 ${B - 83} L142 ${B - 60}`, fill: "none", stroke: t.deep, "stroke-width": 9, "stroke-linecap": "round" }),
      el("circle", { cx: 108, cy: B - 96, r: 18, fill: t.mist, opacity: "0.55" }),
      el("circle", { cx: 108, cy: B - 96, r: 18, fill: "none", stroke: t.deep, "stroke-width": 6 }),
      el("path", { d: `M98 ${B - 102} a12 12 0 0 1 8 -8`, fill: "none", stroke: "#ffffff", "stroke-width": 3, "stroke-linecap": "round", opacity: "0.8" }),
    ]));
    return parts;
  }

  // Arukone: zwei Paare, deren Verbindung sich vor den Augen zeichnet.
  function motifArukone(t) {
    const B = BUILD_BASE;
    const x0 = 22;
    const y0 = B - 134;
    const cell = 29;
    const c = (i) => x0 + cell / 2 + i * cell;
    const r = (j) => y0 + cell / 2 + j * cell;
    const parts = boardNodes(x0, y0, 116, 4, t.pale, t, t.light);
    const wire = (d, color, delay) => el("path", {
      class: "gi gi-draw", d, pathLength: 1, fill: "none", stroke: color, "stroke-width": 9,
      "stroke-linecap": "round", "stroke-linejoin": "round", style: delay ? `animation-delay:${delay}` : null,
    });
    parts.push(wire(`M${c(0)} ${r(0)} H${c(2)} V${r(2)} H${c(3)}`, t.base, null));
    parts.push(wire(`M${c(0)} ${r(1)} V${r(3)} H${c(1)}`, t.cream, "-1.6s"));
    const dot = (i, j, color, inner) => [
      el("circle", { cx: c(i), cy: r(j), r: 9, fill: color }),
      el("circle", { cx: c(i), cy: r(j), r: 4, fill: inner }),
    ];
    parts.push(...dot(0, 0, t.dark, t.mist), ...dot(3, 2, t.dark, t.mist), ...dot(0, 1, t.cream, t.dark), ...dot(1, 3, t.cream, t.dark));
    return parts;
  }

  // Battleships: ein Schiff schaukelt auf dem Wasserfeld.
  function motifShips(t) {
    const B = BUILD_BASE;
    const x0 = 22;
    const y0 = B - 134;
    const cell = 29;
    const parts = boardNodes(x0, y0, 116, 4, t.light, t, t.pale);
    [[0, 0], [3, 0], [1, 3]].forEach(([i, j]) => {
      parts.push(el("circle", { cx: x0 + cell / 2 + i * cell, cy: y0 + cell / 2 + j * cell, r: 4.5, fill: t.dark, opacity: "0.55" }));
    });
    parts.push(group({ class: "gi gi-rock" }, [
      el("rect", { x: 96, y: y0 + 24, width: 11, height: 26, rx: 3, fill: t.dark }),
      el("rect", { x: 62, y: y0 + 34, width: 42, height: 22, rx: 5, fill: t.cream }),
      el("circle", { cx: 74, cy: y0 + 45, r: 4, fill: t.dark }),
      el("circle", { cx: 90, cy: y0 + 45, r: 4, fill: t.dark }),
      el("path", { d: `M38 ${y0 + 56} H122 L108 ${y0 + 80} H50 Z`, fill: t.deep }),
      el("path", { d: `M42 ${y0 + 62} H118`, fill: "none", stroke: t.base, "stroke-width": 4 }),
      el("circle", { class: "gi gi-bubble", cx: 101, cy: y0 + 18, r: 5, fill: t.mist, opacity: "0.9" }),
      el("circle", { class: "gi gi-bubble", cx: 106, cy: y0 + 12, r: 3.5, fill: t.mist, opacity: "0.9", style: "animation-delay:-1.5s" }),
    ]));
    parts.push(group({ class: "gi gi-wave" }, [
      el("path", { d: `M30 ${y0 + 78} q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0`, fill: "none", stroke: t.pale, "stroke-width": 4, "stroke-linecap": "round" }),
      el("path", { d: `M38 ${y0 + 98} q8 -6 16 0 t16 0 t16 0 t16 0 t16 0`, fill: "none", stroke: t.pale, "stroke-width": 4, "stroke-linecap": "round", opacity: "0.7" }),
    ]));
    return parts;
  }

  // Tiergehege: eine Weide, mit Zäunen in Gehege geteilt, in jedem ein Tier.
  function motifPens(t) {
    const B = BUILD_BASE;
    const x0 = 16;
    const y0 = B - 112;
    const w = 128;
    const h = 104;
    const post = (x, y) => el("rect", { x: x - 3, y: y - 8, width: 6, height: 16, rx: 2, fill: t.deep });
    const rail = (d) => el("path", { d, fill: "none", stroke: t.cream, "stroke-width": 5, "stroke-linecap": "round" });
    return [
      el("rect", { x: x0, y: y0, width: w, height: h, rx: 10, fill: t.light, stroke: t.dark, "stroke-width": 4 }),
      el("path", { d: `M30 ${y0 + 92} l3 -8 l3 8 M112 ${y0 + 20} l3 -8 l3 8 M60 ${y0 + 22} l3 -8 l3 8`, fill: "none", stroke: t.dark, "stroke-width": 2.5, "stroke-linecap": "round", opacity: "0.7" }),
      rail(`M78 ${y0 + 6} V${y0 + h - 6}`),
      rail(`M78 ${y0 + 56} H${x0 + w - 6}`),
      post(78, y0 + 18), post(78, y0 + 42), post(78, y0 + 70), post(78, y0 + 94),
      post(104, y0 + 56), post(130, y0 + 56),
      group({ class: "gi gi-bob" }, [
        el("path", { d: `M36 ${y0 + 76} v10 M52 ${y0 + 76} v10`, stroke: t.deep, "stroke-width": 4, "stroke-linecap": "round" }),
        el("circle", { cx: 44, cy: y0 + 60, r: 18, fill: t.cream }),
        el("circle", { cx: 32, cy: y0 + 52, r: 9, fill: t.cream }),
        el("circle", { cx: 56, cy: y0 + 50, r: 9, fill: t.cream }),
        el("circle", { cx: 44, cy: y0 + 45, r: 9, fill: t.cream }),
        el("ellipse", { cx: 58, cy: y0 + 62, rx: 9, ry: 7.5, fill: t.deep }),
        el("ellipse", { cx: 64, cy: y0 + 55, rx: 4, ry: 2.5, fill: t.deep, transform: `rotate(-30 64 ${y0 + 55})` }),
        el("circle", { cx: 61, cy: y0 + 60, r: 1.8, fill: t.cream }),
      ]),
      group({ class: "gi gi-bob", style: "animation-delay:-1.3s" }, [
        el("ellipse", { cx: 106, cy: y0 + 64, rx: 4, ry: 11, fill: t.cream }),
        el("ellipse", { cx: 116, cy: y0 + 64, rx: 4, ry: 11, fill: t.cream }),
        el("ellipse", { cx: 106, cy: y0 + 65, rx: 2, ry: 7, fill: t.pale }),
        el("ellipse", { cx: 116, cy: y0 + 65, rx: 2, ry: 7, fill: t.pale }),
        el("circle", { cx: 111, cy: y0 + 82, r: 11, fill: t.cream }),
        el("circle", { cx: 107, cy: y0 + 80, r: 1.8, fill: t.ink }),
        el("circle", { cx: 115, cy: y0 + 80, r: 1.8, fill: t.ink }),
        el("ellipse", { cx: 111, cy: y0 + 85, rx: 2.2, ry: 1.6, fill: t.dark }),
      ]),
    ];
  }

  // --- Zahl und Buchstabe -----------------------------------------------------
  // Buchstabenjagd: Buchstaben schweben herum, und der Kescher fängt das A.
  function motifLetters(t) {
    const B = BUILD_BASE;
    return [
      group({ class: "gi gi-bob", style: "animation-delay:-0.9s" }, [textNode(30, B - 88, 36, t.dark, "M")]),
      group({ class: "gi gi-bob", style: "animation-delay:-1.8s" }, [textNode(118, B - 70, 40, t.light, "B")]),
      el("ellipse", { cx: 62, cy: B - 62, rx: 32, ry: 22, fill: t.pale, opacity: "0.5" }),
      group({ class: "gi gi-bob" }, [textNode(60, B - 24, 64, t.cream, "A", { stroke: t.dark, "stroke-width": 3, "paint-order": "stroke" })]),
      // Der Kescher liegt über dem A: das Netz davor, der Rand darüber.
      group({ class: "gi gi-net" }, [
        el("path", { d: `M92 ${B - 70} L146 ${B - 124}`, fill: "none", stroke: t.deep, "stroke-width": 8, "stroke-linecap": "round" }),
        el("path", { d: `M40 ${B - 74} q22 8 44 0 M40 ${B - 52} q22 -8 44 0 M62 ${B - 84} v44 M50 ${B - 80} v36 M74 ${B - 80} v36`, fill: "none", stroke: t.dark, "stroke-width": 1.8, opacity: "0.55" }),
        el("ellipse", { cx: 62, cy: B - 62, rx: 32, ry: 22, fill: "none", stroke: t.deep, "stroke-width": 6 }),
      ]),
    ];
  }

  // Wortdetektiv: ein offenes Buch, ein Wort ist markiert, die Lupe darüber.
  function motifBook(t) {
    const B = BUILD_BASE;
    const top = B - 104;
    const bottom = B - 20;
    const line = (x, y, w, color = t.base) => el("rect", { x, y, width: w, height: 5, rx: 2.5, fill: color });
    return [
      el("path", { d: `M14 ${top + 2} Q 48 ${top - 8} 80 ${top + 2} Q 112 ${top - 8} 146 ${top + 2} V${bottom + 6} Q 112 ${bottom - 4} 80 ${bottom + 6} Q 48 ${bottom - 4} 14 ${bottom + 6} Z`, fill: t.dark }),
      el("path", { d: `M20 ${top + 6} Q 50 ${top - 2} 78 ${top + 6} V${bottom} Q 50 ${bottom - 8} 20 ${bottom} Z`, fill: t.cream }),
      el("path", { d: `M82 ${top + 6} Q 110 ${top - 2} 140 ${top + 6} V${bottom} Q 110 ${bottom - 8} 82 ${bottom} Z`, fill: t.cream }),
      el("rect", { x: 78, y: top + 2, width: 4, height: bottom - top - 2, fill: t.deep }),
      line(28, top + 22, 40), line(28, top + 36, 30), line(28, top + 50, 42), line(28, top + 64, 24),
      line(92, top + 22, 38),
      el("rect", { x: 90, y: top + 32, width: 30, height: 14, rx: 5, fill: t.light }),
      line(94, top + 36, 22, t.dark),
      line(92, top + 50, 40), line(92, top + 64, 28),
      el("path", { d: `M40 ${top - 2} v-24 h12 v24 l-6 -6 z`, fill: t.base }),
      group({ class: "gi gi-hover" }, [
        el("path", { d: `M124 ${B - 60} L142 ${B - 38}`, fill: "none", stroke: t.deep, "stroke-width": 8, "stroke-linecap": "round" }),
        el("circle", { cx: 112, cy: B - 74, r: 18, fill: t.mist, opacity: "0.6" }),
        el("circle", { cx: 112, cy: B - 74, r: 18, fill: "none", stroke: t.deep, "stroke-width": 6 }),
        el("path", { d: `M102 ${B - 80} a12 12 0 0 1 8 -8`, fill: "none", stroke: "#ffffff", "stroke-width": 3, "stroke-linecap": "round", opacity: "0.8" }),
      ]),
    ];
  }

  // Kakuro: zwei Zahlen, ein Plus, und die Summe erscheint.
  function motifKakuro(t) {
    const B = BUILD_BASE;
    const x0 = 27;
    const y0 = B - 134;
    const cell = 44;
    const gap = 6;
    const cx = (i) => x0 + gap + i * (cell + gap) + cell / 2;
    const cy = (j) => y0 + gap + j * (cell + gap) + cell / 2;
    const box = (i, j, fill) => el("rect", { x: x0 + gap + i * (cell + gap), y: y0 + gap + j * (cell + gap), width: cell, height: cell, rx: 8, fill });
    return [
      el("rect", { x: x0, y: y0, width: 106, height: 106, rx: 12, fill: t.dark }),
      box(0, 0, t.deep), box(1, 0, t.cream), box(0, 1, t.cream), box(1, 1, t.pale),
      group({ class: "gi gi-pulse" }, [textNode(cx(0), cy(0) + 14, 44, t.cream, "+")]),
      textNode(cx(1), cy(0) + 13, 36, t.dark, "3"),
      textNode(cx(0), cy(1) + 13, 36, t.dark, "4"),
      group({ class: "gi gi-fade" }, [textNode(cx(1), cy(1) + 13, 36, t.base, "7")]),
    ];
  }

  // Hidoku: ein Weg durch die Zahlen, der sich Feld für Feld zeichnet.
  function motifHidoku(t) {
    const B = BUILD_BASE;
    const x0 = 27;
    const y0 = B - 134;
    const cell = 30;
    const gap = 4;
    const m = (106 - (3 * cell + 2 * gap)) / 2;
    const px = (i) => x0 + m + i * (cell + gap);
    const py = (j) => y0 + m + j * (cell + gap);
    const cx = (i) => px(i) + cell / 2;
    const cy = (j) => py(j) + cell / 2;
    const parts = [el("rect", { x: x0, y: y0, width: 106, height: 106, rx: 12, fill: t.dark })];
    for (let j = 0; j < 3; j += 1) {
      for (let i = 0; i < 3; i += 1) {
        parts.push(el("rect", { x: px(i), y: py(j), width: cell, height: cell, rx: 6, fill: t.cream }));
      }
    }
    const steps = [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]];
    parts.push(el("path", {
      class: "gi gi-draw", pathLength: 1,
      d: steps.map(([i, j], n) => `${n === 0 ? "M" : "L"}${cx(i)} ${cy(j)}`).join(" "),
      fill: "none", stroke: t.light, "stroke-width": 12, "stroke-linecap": "round", "stroke-linejoin": "round",
    }));
    steps.forEach(([i, j], n) => parts.push(textNode(cx(i), cy(j) + 8, 22, t.deep, String(n + 1))));
    return parts;
  }

  const MOTIFS = {
    backpack: motifBackpack, memory: motifMemory, beach: motifBeach, tiles: motifTiles,
    flanker: motifFlanker, switch: motifSwitch, pond: motifPond, gridlock: motifGridlock,
    hop: motifHop, cardMatch: motifCardMatch, leaves: motifLeaves, tower: motifTower,
    spatial: motifSpatial, arukone: motifArukone, ships: motifShips, pens: motifPens,
    letters: motifLetters, book: motifBook, kakuro: motifKakuro, hidoku: motifHidoku,
  };

  // Die Fortschrittsmarke oben rechts an jedem Bild. Sie beantwortet die eine
  // Frage, die ein Kind vor der Wahl hat: bin ich hier schon fertig, oder muss
  // ich noch?
  //
  // Geschafft ist ein grüner Haken – ein Zeichen, kein Text und keine Zahl.
  // Sonst ein Ring, der sich füllt: so ist auch zu sehen, wie weit es noch ist.
  // Der Platz ist für jedes Bild derselbe, egal wie hoch es ist, damit die
  // Marke immer an derselben Stelle zu suchen ist.
  const BADGE_AT = [BUILD_W - 26, BUILD_BASE - 158];
  const BADGE_R = 14;

  function progressBadge(ratio, hue) {
    const done = ratio >= 1;
    const [cx, cy] = BADGE_AT;
    const parts = [
      el("circle", { cx, cy, r: 21, fill: done ? "#2f9e44" : "#ffffff", stroke: done ? "#247634" : "#b9c4d0", "stroke-width": 2 }),
    ];

    if (done) {
      parts.push(el("path", {
        d: `M${cx - 9} ${cy} l6 6.5 L${cx + 10} ${cy - 9}`,
        fill: "none", stroke: "#ffffff", "stroke-width": 4.5,
        "stroke-linecap": "round", "stroke-linejoin": "round",
      }));
      return group({ class: "train-building-badge is-done" }, parts);
    }

    parts.push(el("circle", { cx, cy, r: BADGE_R, fill: "none", stroke: "#d3dbe4", "stroke-width": 6 }));
    if (ratio > 0) {
      // Der Bogen beginnt oben: der Kreis wird um seinen Mittelpunkt gedreht.
      const circumference = 2 * Math.PI * BADGE_R;
      parts.push(el("circle", {
        cx, cy, r: BADGE_R, fill: "none", stroke: shade(hue, -0.25), "stroke-width": 6,
        "stroke-linecap": "round",
        "stroke-dasharray": `${(ratio * circumference).toFixed(2)} ${circumference.toFixed(2)}`,
        transform: `rotate(-90 ${cx} ${cy})`,
      }));
    }
    return group({ class: "train-building-badge" }, parts);
  }

  /**
   * Baut das Bild eines Spiels – auf der Bühne, an der Kiste des Wagens und
   * auf der Prüfseite dasselbe.
   * @param {string} gameId
   * @param {Object} options  done: fertig gespielt (goldener Boden)
   *                          ratio: 0–1 für die Fortschrittsmarke; fehlt sie,
   *                                 bleibt das Bild ohne Marke
   *                          hue: Farbe des Bereichs; fehlt sie, gilt die
   *                               Farbe des Bereichs, zu dem das Spiel gehört
   */
  function buildBuilding(gameId, options = {}) {
    const { done = false, label = gameId, ratio = null } = options;
    const spec = BUILDINGS[gameId] || BUILDINGS.memory;
    const hue = options.hue || spec.hue;
    const t = tones(hue);
    const draw = MOTIFS[spec.motif] || MOTIFS.memory;
    const parts = [...podium(t, done), ...draw(t)];

    if (typeof ratio === "number") parts.push(progressBadge(Math.max(0, Math.min(1, ratio)), hue));

    return group({
      class: `train-building${done ? " is-done" : ""}`,
      "data-building": gameId,
      role: "button",
      tabindex: "0",
      "aria-label": label,
    }, [
      el("rect", { x: 0, y: BUILD_BASE - BUILD_H, width: BUILD_W, height: BUILD_H, fill: "transparent", class: "train-building-hit" }),
      ...parts,
    ]);
  }

  window.LernappTrainArt = {
    GROUND, ART_H, WAGON_W, LOCO_W, WAGON_GAP,
    DRIVERS, DRIVER_BY_ID, PALETTE, LOCO_PARTS, DEFAULT_LOCO,
    WAGON_TYPES, WHEEL_SHAPES, CHIMNEY_SHAPES, CAB_SHAPES, LAMP_SHAPES, FLAG_PATTERNS, WHISTLES,
    el, group, shade, inkOn,
    driverHead, wheel,
    buildLoco, buildWagon, buildTrain, buildTrack, buildStartSignal,
    areaIcon, buildGate, buildBuilding, BUILDINGS, AREA_HUES, GATE_W, GATE_H, BUILD_W, BUILD_H, PART_FOCUS, PART_HIT, PART_PREVIEW, PART_DOT,
    locoConfig,
  };
})();
