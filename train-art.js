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
    const parts = [el("circle", { cx, cy: WHEEL_Y, r: radius, fill: "none", stroke: color, "stroke-width": radius * 0.36 })];

    if (shape === "disc") {
      parts.push(el("circle", { cx, cy: WHEEL_Y, r: radius * 0.62, fill: shade(color, 0.28) }));
      parts.push(el("circle", { cx, cy: WHEEL_Y, r: radius * 0.22, fill: rim }));
    } else if (shape === "star") {
      const points = [];
      for (let i = 0; i < 10; i += 1) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? radius * 0.72 : radius * 0.3;
        points.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(WHEEL_Y + Math.sin(angle) * r).toFixed(1)}`);
      }
      parts.push(el("polygon", { points: points.join(" "), fill: shade(color, 0.3) }));
    } else {
      const spokes = [];
      for (let i = 0; i < 4; i += 1) {
        const angle = (Math.PI / 4) * i;
        const dx = Math.cos(angle) * radius * 0.74;
        const dy = Math.sin(angle) * radius * 0.74;
        spokes.push(el("line", {
          x1: cx - dx, y1: WHEEL_Y - dy, x2: cx + dx, y2: WHEEL_Y + dy,
          stroke: color, "stroke-width": Math.max(2, radius * 0.16), "stroke-linecap": "round",
        }));
      }
      parts.push(...spokes);
      parts.push(el("circle", { cx, cy: WHEEL_Y, r: radius * 0.2, fill: rim }));
    }

    return group({ class: "train-wheel" }, parts);
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
    const cabParts = [
      el("rect", { x: 10, y: 66, width: 62, height: GROUND - 88, rx: 5, fill: cabColor }),
      el("rect", { x: 22, y: 78, width: 38, height: 32, rx: 4, fill: "#f7fbff", opacity: "0.9" }),
    ];
    if (c.cab.shape === "round") {
      cabParts.unshift(el("path", { d: "M4 68 q34 -20 74 0 v8 h-74 z", fill: shade(cabColor, -0.2) }));
    } else if (c.cab.shape === "peak") {
      cabParts.unshift(el("polygon", { points: "41,48 82,70 0,70", fill: shade(cabColor, -0.2) }));
    } else {
      cabParts.unshift(el("rect", { x: 2, y: 58, width: 78, height: 13, rx: 4, fill: shade(cabColor, -0.2) }));
    }
    const cab = group({ "data-part": "cab" }, cabParts);

    // --- Chauffeur im Fenster ---
    const driver = group({ "data-part": "driver", transform: "translate(41,96)" }, [driverHead(c.driver, 15)]);

    // --- Kessel ---
    const boiler = group({ "data-part": "body" }, [
      el("rect", { x: 68, y: 92, width: 96, height: GROUND - 114, rx: 28, fill: body }),
      el("rect", { x: 76, y: 98, width: 80, height: 10, rx: 5, fill: bodyLight, opacity: "0.55" }),
      el("circle", { cx: 158, cy: 120, r: 25, fill: bodyDark }),
      el("circle", { cx: 158, cy: 120, r: 16, fill: body }),
      el("rect", { x: 98, y: 88, width: 12, height: 40, rx: 4, fill: bodyDark }),
    ]);

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
      [steam, flag, frame, cab, driver, boiler, chimney, lamp, wheels, plough]);
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
    }, parts);
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
    const { withTrack = true, gap = WAGON_GAP, pad = 8 } = options;
    const width = pad * 2 + areas.length * (WAGON_W + gap) + LOCO_W;
    const svg = el("svg", {
      viewBox: `0 0 ${width} ${ART_H}`,
      class: "train-svg",
      role: "img",
      xmlns: NS,
    });

    if (withTrack) svg.append(buildTrack(width));

    areas.forEach((area, index) => {
      const wagon = buildWagon(area.wagon, area.color, area.stage);
      wagon.setAttribute("transform", `translate(${pad + index * (WAGON_W + gap)},0)`);
      wagon.setAttribute("data-area", area.id);
      svg.append(wagon);
    });

    const loco = buildLoco(config);
    loco.setAttribute("transform", `translate(${pad + areas.length * (WAGON_W + gap)},0)`);
    svg.append(loco);

    return svg;
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

  window.LernappTrainArt = {
    GROUND, ART_H, WAGON_W, LOCO_W, WAGON_GAP,
    DRIVERS, DRIVER_BY_ID, PALETTE, LOCO_PARTS, DEFAULT_LOCO,
    WAGON_TYPES, WHEEL_SHAPES, CHIMNEY_SHAPES, CAB_SHAPES, LAMP_SHAPES, FLAG_PATTERNS, WHISTLES,
    el, group, shade, inkOn,
    driverHead, wheel,
    buildLoco, buildWagon, buildTrain, buildTrack,
    locoConfig,
  };
})();
