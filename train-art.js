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
  // Gebäude
  // ---------------------------------------------------------------------------
  // Ein Motiv je Spiel. Statt fünfzehn Einzelzeichnungen gibt es sieben
  // Grundformen und je ein Zeichen an der Fassade: das hält die Häuser als
  // Gruppe zusammen und macht sie trotzdem einzeln erkennbar.
  const BUILD_W = 160;
  const BUILD_BASE = GROUND;

  const BUILDINGS = {
    backpack: { kind: "backpack", emblem: null, hue: "#e0913c" },
    memory: { kind: "house", emblem: "cards", hue: "#8a6fe0" },
    cardMatch: { kind: "hut", emblem: "cardCheck", hue: "#e0913c" },
    beachTreasure: { kind: "hut", emblem: "shell", hue: "#e8b45a" },
    tileMemory: { kind: "barn", emblem: "grid", hue: "#9a6fd0" },
    flanker: { kind: "hall", emblem: "fish", hue: "#3ba7b5" },
    trackRouter: { kind: "tower", emblem: "switch", hue: "#2f8f9c" },
    fishPond: { kind: "hut", emblem: "net", hue: "#2f9ec0" },
    gridlock: { kind: "barn", emblem: "gleis", hue: "#2f8f9c" },
    tiersprung: { kind: "hall", emblem: "bolt", hue: "#e8a13c" },
    leafFlow: { kind: "barn", emblem: "leaf", hue: "#d98a33" },
    towerStack: { kind: "tower", emblem: "blocks", hue: "#d99a2f" },
    spatialPuzzle: { kind: "tower", emblem: "cube", hue: "#3f8f6a" },
    arukone: { kind: "house", emblem: "wires", hue: "#63a83f" },
    bimaru: { kind: "lighthouse", emblem: null, hue: "#4a8fb0" },
    shikaku: { kind: "barn", emblem: "fence", hue: "#a8863c" },
    letterPuzzle: { kind: "tower", emblem: "letter", hue: "#e0563f" },
    readingPuzzle: { kind: "house", emblem: "book", hue: "#b8496a" },
    kakuro: { kind: "tower", emblem: "plus", hue: "#c97a3c" },
    hidoku: { kind: "house", emblem: "numbers", hue: "#d94f4f" },
  };

  function emblem(name, cx, cy, color) {
    const parts = [];
    const ink = "#2b3440";
    if (name === "cards") {
      parts.push(el("rect", { x: cx - 20, y: cy - 16, width: 22, height: 30, rx: 3, fill: "#fdfbf6", transform: `rotate(-12 ${cx - 9} ${cy})` }));
      parts.push(el("rect", { x: cx - 2, y: cy - 16, width: 22, height: 30, rx: 3, fill: "#fdfbf6", transform: `rotate(10 ${cx + 9} ${cy})` }));
      parts.push(el("circle", { cx: cx + 9, cy, r: 5, fill: color }));
    } else if (name === "cardCheck") {
      parts.push(el("rect", { x: cx - 15, y: cy - 18, width: 30, height: 36, rx: 4, fill: "#fdfbf6" }));
      parts.push(el("polyline", { points: `${cx - 8},${cy} ${cx - 2},${cy + 7} ${cx + 9},${cy - 8}`, fill: "none", stroke: color, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    } else if (name === "shell") {
      parts.push(el("path", { d: `M${cx} ${cy + 16} a20 20 0 0 1 -20 -20 h40 a20 20 0 0 1 -20 20 z`, fill: "#fdfbf6" }));
      parts.push(el("path", { d: `M${cx} ${cy + 15} v-19 M${cx - 9} ${cy + 11} l4 -15 M${cx + 9} ${cy + 11} l-4 -15`, stroke: color, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }));
    } else if (name === "fish") {
      parts.push(el("ellipse", { cx, cy, rx: 20, ry: 12, fill: "#fdfbf6" }));
      parts.push(el("polygon", { points: `${cx + 18},${cy} ${cx + 30},${cy - 10} ${cx + 30},${cy + 10}`, fill: "#fdfbf6" }));
      parts.push(el("circle", { cx: cx - 9, cy: cy - 3, r: 3.4, fill: ink }));
    } else if (name === "grid") {
      // Neun Kacheln, drei davon hell: das Muster, das man sich merken soll.
      [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].forEach(([sx, sy], i) => {
        const hell = i === 1 || i === 3 || i === 8;
        parts.push(el("rect", {
          x: cx + sx * 13 - 5.5, y: cy + sy * 13 - 5.5, width: 11, height: 11, rx: 2,
          fill: hell ? "#fdfbf6" : "none", stroke: "#fdfbf6", "stroke-width": 2,
        }));
      });
    } else if (name === "net") {
      // Ein Kescher: Bügel, Netz und Stiel – klar unterscheidbar vom Fisch, den
      // der Schwarm-Fokus nebenan trägt.
      // Gefüllt statt gestrichelt: eine dünne Linienzeichnung verschwindet auf
      // dem kleinen Gebäude, eine geschlossene Fläche nicht.
      parts.push(el("line", { x1: cx + 4, y1: cy + 2, x2: cx + 17, y2: cy + 20, stroke: "#fdfbf6", "stroke-width": 6, "stroke-linecap": "round" }));
      parts.push(el("ellipse", { cx: cx - 4, cy: cy - 7, rx: 18, ry: 14, fill: "#fdfbf6" }));
      parts.push(el("path", {
        d: `M${cx - 21} ${cy - 7} h34 M${cx - 4} ${cy - 20} v27`,
        fill: "none", stroke: color, "stroke-width": 3,
      }));
    } else if (name === "leaf") {
      // Dasselbe Blatt wie im Spiel: vorne spitz, hinten rund, mit Mittelader.
      // An der Spitze hängt dort die halbe Regel – sie muss auch hier die Form
      // sein, an der man das Haus wiedererkennt.
      parts.push(el("path", {
        d: `M${cx} ${cy - 20} C ${cx + 14} ${cy - 7} ${cx + 17} ${cy + 3} ${cx + 17} ${cy + 5} A 17 17 0 0 1 ${cx - 17} ${cy + 5} C ${cx - 17} ${cy + 3} ${cx - 14} ${cy - 7} ${cx} ${cy - 20} Z`,
        fill: "#fdfbf6",
      }));
      parts.push(el("path", {
        d: `M${cx} ${cy - 14} V${cy + 20} M${cx} ${cy - 4} l-9 7 M${cx} ${cy - 4} l9 7`,
        fill: "none", stroke: color, "stroke-width": 3, "stroke-linecap": "round",
      }));
    } else if (name === "blocks") {
      // Drei Blöcke, jeder ein Stück versetzt und schmaler als der darunter:
      // genau das, was im Spiel passiert. Ein senkrechter Stapel sähe aus wie
      // eine Mauer und sagte nichts über das Treffen.
      [[-18, 8, 36], [-13, -4, 30], [-6, -16, 22]].forEach(([dx, dy, w]) => {
        parts.push(el("rect", { x: cx + dx, y: cy + dy, width: w, height: 10, rx: 2, fill: "#fdfbf6" }));
      });
    } else if (name === "switch") {
      parts.push(el("rect", { x: cx - 22, y: cy + 8, width: 44, height: 6, rx: 3, fill: "#fdfbf6" }));
      parts.push(el("line", { x1: cx - 10, y1: cy + 8, x2: cx + 12, y2: cy - 14, stroke: "#fdfbf6", "stroke-width": 6, "stroke-linecap": "round" }));
      parts.push(el("circle", { cx: cx + 12, cy: cy - 14, r: 6, fill: color }));
    } else if (name === "gleis") {
      // Freie Fahrt: ein Wagen von oben, davor der offene Weg nach rechts. Die
      // Weiche nebenan zeigt eine Verzweigung, hier geht es geradeaus hinaus –
      // daran sind die beiden Häuser auseinanderzuhalten.
      parts.push(el("rect", { x: cx - 26, y: cy - 9, width: 30, height: 18, rx: 5, fill: "#fdfbf6" }));
      parts.push(el("rect", { x: cx - 21, y: cy - 5, width: 9, height: 10, rx: 2, fill: color }));
      parts.push(el("path", {
        d: `M${cx + 10} ${cy - 12} l11 12 l-11 12`,
        fill: "none", stroke: "#fdfbf6", "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round",
      }));
    } else if (name === "bolt") {
      parts.push(el("polygon", { points: `${cx + 6},${cy - 20} ${cx - 12},${cy + 3} ${cx - 1},${cy + 3} ${cx - 5},${cy + 20} ${cx + 14},${cy - 4} ${cx + 2},${cy - 4}`, fill: "#fdfbf6" }));
    } else if (name === "cube") {
      parts.push(el("polygon", { points: `${cx},${cy - 18} ${cx + 17},${cy - 8} ${cx + 17},${cy + 10} ${cx},${cy + 20} ${cx - 17},${cy + 10} ${cx - 17},${cy - 8}`, fill: "#fdfbf6" }));
      parts.push(el("path", { d: `M${cx - 17} ${cy - 8} L${cx} ${cy + 2} L${cx + 17} ${cy - 8} M${cx} ${cy + 2} v18`, fill: "none", stroke: color, "stroke-width": 3 }));
    } else if (name === "wires") {
      parts.push(el("circle", { cx: cx - 16, cy: cy - 10, r: 6, fill: "#fdfbf6" }));
      parts.push(el("circle", { cx: cx + 16, cy: cy + 10, r: 6, fill: "#fdfbf6" }));
      parts.push(el("path", { d: `M${cx - 16} ${cy - 10} H${cx + 4} V${cy + 10} H${cx + 16}`, fill: "none", stroke: "#fdfbf6", "stroke-width": 5, "stroke-linejoin": "round" }));
    } else if (name === "fence") {
      parts.push(el("path", { d: `M${cx - 22} ${cy + 16} v-22 M${cx - 7} ${cy + 16} v-26 M${cx + 8} ${cy + 16} v-26 M${cx + 23} ${cy + 16} v-22`, stroke: "#fdfbf6", "stroke-width": 5, "stroke-linecap": "round" }));
      parts.push(el("path", { d: `M${cx - 26} ${cy - 4} H${cx + 27} M${cx - 26} ${cy + 7} H${cx + 27}`, stroke: "#fdfbf6", "stroke-width": 4 }));
    } else if (name === "book") {
      parts.push(el("path", { d: `M${cx - 22} ${cy - 14} h18 a4 4 0 0 1 4 4 v24 a4 4 0 0 0 -4 -4 h-18 z`, fill: "#fdfbf6" }));
      parts.push(el("path", { d: `M${cx + 22} ${cy - 14} h-18 a4 4 0 0 0 -4 4 v24 a4 4 0 0 1 4 -4 h18 z`, fill: "#fdfbf6", opacity: "0.82" }));
    } else if (name === "plus") {
      parts.push(el("path", { d: `M${cx} ${cy - 18} v36 M${cx - 18} ${cy} h36`, stroke: "#fdfbf6", "stroke-width": 8, "stroke-linecap": "round" }));
    } else if (name === "letter" || name === "numbers") {
      const glyph = el("text", {
        x: cx, y: cy + 15, "font-family": "Inter, system-ui, sans-serif",
        "font-size": name === "letter" ? 42 : 30, "font-weight": 900,
        fill: "#fdfbf6", "text-anchor": "middle",
      }, []);
      glyph.textContent = name === "letter" ? "A" : "123";
      parts.push(glyph);
    }
    return group({ "aria-hidden": "true" }, parts);
  }

  function buildingShell(kind, hue) {
    const dark = shade(hue, -0.3);
    const light = shade(hue, 0.25);
    const roof = shade(hue, -0.45);
    const w = BUILD_W;
    const parts = [];

    if (kind === "house") {
      parts.push(el("rect", { x: 22, y: BUILD_BASE - 92, width: w - 44, height: 92, rx: 4, fill: hue }));
      parts.push(el("polygon", { points: `10,${BUILD_BASE - 88} ${w / 2},${BUILD_BASE - 138} ${w - 10},${BUILD_BASE - 88}`, fill: roof }));
      parts.push(el("rect", { x: w / 2 - 16, y: BUILD_BASE - 40, width: 32, height: 40, rx: 3, fill: dark }));
      return { parts, emblemAt: [w / 2, BUILD_BASE - 74] };
    }
    if (kind === "tower") {
      parts.push(el("rect", { x: 38, y: BUILD_BASE - 148, width: w - 76, height: 148, rx: 5, fill: hue }));
      parts.push(el("rect", { x: 28, y: BUILD_BASE - 160, width: w - 56, height: 16, rx: 5, fill: roof }));
      parts.push(el("rect", { x: 46, y: BUILD_BASE - 176, width: w - 92, height: 18, rx: 4, fill: roof, opacity: "0.75" }));
      parts.push(el("rect", { x: w / 2 - 14, y: BUILD_BASE - 36, width: 28, height: 36, rx: 3, fill: dark }));
      return { parts, emblemAt: [w / 2, BUILD_BASE - 106] };
    }
    if (kind === "hut") {
      parts.push(el("rect", { x: 26, y: BUILD_BASE - 74, width: w - 52, height: 74, rx: 4, fill: hue }));
      parts.push(el("path", { d: `M14 ${BUILD_BASE - 70} a${w / 2 - 14} 46 0 0 1 ${w - 28} 0 z`, fill: roof }));
      parts.push(el("rect", { x: w / 2 - 15, y: BUILD_BASE - 34, width: 30, height: 34, rx: 3, fill: dark }));
      return { parts, emblemAt: [w / 2, BUILD_BASE - 56] };
    }
    if (kind === "hall") {
      parts.push(el("rect", { x: 10, y: BUILD_BASE - 84, width: w - 20, height: 84, rx: 5, fill: hue }));
      parts.push(el("path", { d: `M4 ${BUILD_BASE - 80} a${w / 2 - 4} 40 0 0 1 ${w - 8} 0 z`, fill: roof }));
      parts.push(el("rect", { x: w / 2 - 24, y: BUILD_BASE - 44, width: 48, height: 44, rx: 4, fill: dark }));
      return { parts, emblemAt: [w / 2, BUILD_BASE - 62] };
    }
    if (kind === "barn") {
      parts.push(el("rect", { x: 18, y: BUILD_BASE - 88, width: w - 36, height: 88, rx: 4, fill: hue }));
      parts.push(el("path", { d: `M8 ${BUILD_BASE - 84} L${w / 2} ${BUILD_BASE - 132} L${w - 8} ${BUILD_BASE - 84} L${w - 8} ${BUILD_BASE - 74} L${w / 2} ${BUILD_BASE - 116} L8 ${BUILD_BASE - 74} Z`, fill: roof }));
      parts.push(el("rect", { x: w / 2 - 22, y: BUILD_BASE - 50, width: 44, height: 50, rx: 3, fill: dark }));
      parts.push(el("path", { d: `M${w / 2 - 22} ${BUILD_BASE - 50} L${w / 2 + 22} ${BUILD_BASE} M${w / 2 + 22} ${BUILD_BASE - 50} L${w / 2 - 22} ${BUILD_BASE}`, stroke: light, "stroke-width": 4, opacity: "0.6" }));
      return { parts, emblemAt: [w / 2, BUILD_BASE - 72] };
    }
    if (kind === "lighthouse") {
      parts.push(el("path", { d: `M${w / 2 - 26} ${BUILD_BASE} L${w / 2 - 17} ${BUILD_BASE - 126} h34 L${w / 2 + 26} ${BUILD_BASE} Z`, fill: "#f4f1ea" }));
      parts.push(el("path", { d: `M${w / 2 - 23} ${BUILD_BASE - 34} h46 M${w / 2 - 20} ${BUILD_BASE - 70} h40 M${w / 2 - 18} ${BUILD_BASE - 104} h36`, stroke: hue, "stroke-width": 13 }));
      parts.push(el("rect", { x: w / 2 - 22, y: BUILD_BASE - 142, width: 44, height: 18, rx: 4, fill: shade(hue, -0.4) }));
      parts.push(el("rect", { x: w / 2 - 14, y: BUILD_BASE - 160, width: 28, height: 20, rx: 4, fill: "#ffe066" }));
      parts.push(el("path", { d: `M${w / 2 + 16} ${BUILD_BASE - 150} l26 -10 v22 z`, fill: "#ffe066", opacity: "0.45" }));
      parts.push(el("path", { d: `M${w / 2 - 16} ${BUILD_BASE - 150} l-26 -10 v22 z`, fill: "#ffe066", opacity: "0.45" }));
      return { parts, emblemAt: null };
    }
    // Rucksack: das einzige Gebäude, das gar kein Haus ist – Rucksack packen
    // erkennt ein Kind an nichts schneller als an einem Rucksack.
    parts.push(el("rect", { x: 30, y: BUILD_BASE - 118, width: w - 60, height: 118, rx: 26, fill: hue }));
    parts.push(el("path", { d: `M${w / 2 - 26} ${BUILD_BASE - 112} a26 30 0 0 1 52 0`, fill: "none", stroke: shade(hue, -0.35), "stroke-width": 10 }));
    parts.push(el("rect", { x: 44, y: BUILD_BASE - 62, width: w - 88, height: 40, rx: 8, fill: shade(hue, -0.28) }));
    parts.push(el("rect", { x: w / 2 - 10, y: BUILD_BASE - 74, width: 20, height: 16, rx: 4, fill: shade(hue, -0.45) }));
    parts.push(el("rect", { x: w / 2 - 20, y: BUILD_BASE - 22, width: 40, height: 22, rx: 5, fill: shade(hue, -0.15) }));
    return { parts, emblemAt: [w / 2, BUILD_BASE - 92] };
  }

  // Die Fortschrittsmarke oben rechts an jedem Gebäude. Sie beantwortet die
  // eine Frage, die ein Kind vor der Wahl hat: bin ich hier schon fertig, oder
  // muss ich noch?
  //
  // Geschafft ist ein grüner Haken – ein Zeichen, kein Text und keine Zahl.
  // Sonst ein Ring, der sich füllt: so ist auch zu sehen, wie weit es noch ist.
  // Der Platz ist für jedes Gebäude derselbe, egal wie hoch das Dach ist, damit
  // die Marke immer an derselben Stelle zu suchen ist.
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
   * Baut ein Gebäude für ein Spiel.
   * @param {string} gameId
   * @param {Object} options  done: fertig gespielt (Licht an, Fahne)
   *                          ratio: 0–1 für die Fortschrittsmarke; fehlt sie,
   *                                 bleibt das Gebäude ohne Marke
   *                          hue: Farbe der Wände; fehlt sie, gilt die eigene
   *                               Farbe des Gebäudes. Die Bühne gibt die Farbe
   *                               des Bereichs mit – so stehen alle Häuser
   *                               eines Bereichs in einer Farbe da.
   */
  function buildBuilding(gameId, options = {}) {
    const { done = false, label = gameId, ratio = null } = options;
    const spec = BUILDINGS[gameId] || BUILDINGS.memory;
    const hue = options.hue || spec.hue;
    const { parts, emblemAt } = buildingShell(spec.kind, hue);

    if (spec.emblem && emblemAt) parts.push(emblem(spec.emblem, emblemAt[0], emblemAt[1], hue));

    // Fertig gespielt: Licht in den Fenstern und eine Fahne auf dem Dach. So
    // ist im Bereich auf einen Blick zu sehen, wo schon alles gelöst ist.
    if (done) {
      parts.push(el("circle", { cx: 34, cy: BUILD_BASE - 26, r: 7, fill: "#ffe066" }));
      parts.push(el("circle", { cx: BUILD_W - 34, cy: BUILD_BASE - 26, r: 7, fill: "#ffe066" }));
      parts.push(el("line", { x1: BUILD_W - 26, y1: BUILD_BASE - 96, x2: BUILD_W - 26, y2: BUILD_BASE - 140, stroke: "#8a5f1c", "stroke-width": 3 }));
      parts.push(el("polygon", { points: `${BUILD_W - 26},${BUILD_BASE - 138} ${BUILD_W - 2},${BUILD_BASE - 130} ${BUILD_W - 26},${BUILD_BASE - 122}`, fill: "#f0b429" }));
    }

    if (typeof ratio === "number") parts.push(progressBadge(Math.max(0, Math.min(1, ratio)), hue));

    return group({
      class: `train-building${done ? " is-done" : ""}`,
      "data-building": gameId,
      role: "button",
      tabindex: "0",
      "aria-label": label,
    }, [
      el("rect", { x: 0, y: BUILD_BASE - 180, width: BUILD_W, height: 180, fill: "transparent", class: "train-building-hit" }),
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
    areaIcon, buildGate, buildBuilding, BUILDINGS, GATE_W, GATE_H, BUILD_W, PART_FOCUS, PART_HIT, PART_PREVIEW, PART_DOT,
    locoConfig,
  };
})();
