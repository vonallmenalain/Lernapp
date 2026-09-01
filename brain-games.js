/*
 * brain-games.js – Weichen-Wirrwarr für die Lernapp.
 *
 * Geteilte Aufmerksamkeit und vorausschauendes Planen: Weichen stellen, damit
 * jeder Wagen zum passenden Haus fährt.
 *
 * Karten-Merker, Strand-Schätze und Schwarm-Fokus standen einmal hier und sind
 * ausgezogen: alle drei spielen jetzt eine einzige Runde auf eine Bestenliste
 * statt eine Reihe von Leveln und brauchen weder Weltenwahl noch Sterne. Sie
 * stehen in kartenmerker.js, strandschatz.js und schwarmfokus.js auf der
 * gemeinsamen Bühne aus game-shell.js.
 *
 * Die Spiele bringen keine eigene Hülle mit: sie melden sich bei app.js an und
 * benutzen dieselbe Weltenwahl, Levelauswahl, Sternewertung, Erfolgsfeier und
 * denselben Hilfe-Lautsprecher wie alle anderen Rätsel. Diese Datei wird vor
 * app.js geladen und setzt window.LernappBrainGames.
 *
 * Gemeinsame Grundsätze (bewusst kindgerecht):
 *   - Kein "Game Over". Fehler kosten Sterne, nie den Spielstand.
 *   - Kein rotes X und keine Minuspunkte; Rückmeldung ist freundlich.
 *   - Grosse Tippflächen (mindestens 56 px), feste Knopfpositionen.
 *   - Kurze Runden (rund 60–90 Sekunden).
 *   - Sanft mitwachsende Schwierigkeit innerhalb einer Runde.
 */
(() => {
  "use strict";

  // ===========================================================================
  // Spielbeschreibungen (fliessen in GAME_CONFIGS von app.js)
  // ===========================================================================
  const configs = {

    trackRouter: {
      title: "Weichen-Wirrwarr", eyebrow: "Vorausschauend planen", code: "Y",
      subtitle: "Stelle die Weichen, damit jeder Wagen zum passenden Haus fährt.",
      success: "Alles angekommen! Du hast die Weichen im Griff.",
      rules: [
        "Jeder Wagen muss zum Haus mit seiner Farbe und seinem Zeichen fahren.",
        "Tippe auf eine Weiche, um sie umzustellen – am besten früh genug.",
        "Auf den Wagen selbst tippst du nie.",
      ],
    },
  };

  const pages = {

    trackRouter: "weichen.html",
  };

  // ===========================================================================
  // Level-Daten
  // ===========================================================================
  // Jedes Level ist reine Konfiguration – die Schwierigkeitskurve lässt sich
  // hier verändern, ohne die Spiellogik anzufassen.

  const DIFFICULTY_ORDER = ["easy", "medium", "hard", "extreme"];


  // --- Weichen-Wirrwarr ------------------------------------------------------
  // speed = Anteil eines Gleisstücks pro Sekunde. 0.4 heisst also: zweieinhalb
  // Sekunden von einem Knoten zum nächsten – genug Zeit, um die Weiche zu
  // stellen, aber nicht so viel, dass es langweilig wird.
  const TRACK_LEVELS = {
    easy: [
      { layout: "split2", lines: 2, deliveries: 5, speed: 0.38, spawnMs: 2200, maxCars: 1 },
      { layout: "split2", lines: 2, deliveries: 6, speed: 0.44, spawnMs: 2100, maxCars: 2 },
      { layout: "split3", lines: 3, deliveries: 6, speed: 0.42, spawnMs: 2200, maxCars: 2 },
    ],
    medium: [
      { layout: "split3", lines: 3, deliveries: 8, speed: 0.5, spawnMs: 2000, maxCars: 2 },
      { layout: "tree4", lines: 4, deliveries: 8, speed: 0.5, spawnMs: 2000, maxCars: 3 },
      { layout: "tree4", lines: 4, deliveries: 9, speed: 0.56, spawnMs: 1800, maxCars: 3 },
    ],
    hard: [
      { layout: "tree4", lines: 4, deliveries: 10, speed: 0.62, spawnMs: 2000, maxCars: 3 },
      { layout: "cross4", lines: 4, deliveries: 10, speed: 0.6, spawnMs: 2000, maxCars: 4 },
      { layout: "cross4", lines: 4, deliveries: 12, speed: 0.68, spawnMs: 1800, maxCars: 4 },
    ],
    extreme: [
      { layout: "tree5", lines: 5, deliveries: 12, speed: 0.7, spawnMs: 1700, maxCars: 4 },
      { layout: "tree5", lines: 5, deliveries: 14, speed: 0.78, spawnMs: 1500, maxCars: 5 },
      { layout: "cross4", lines: 4, deliveries: 14, speed: 0.88, spawnMs: 1400, maxCars: 5 },
    ],
  };

  const LEVEL_DESCRIPTIONS = {

    trackRouter: {
      easy: "Eine Weiche, zwei Häuser – in Ruhe planen.",
      medium: "Mehrere Weichen hintereinander und mehr Wagen unterwegs.",
      hard: "Viel los auf der Strecke: früh umstellen lohnt sich.",
      extreme: "Fünf Farben, volles Tempo, kein Zögern.",
    },
  };

  const BADGE = {

    trackRouter: (rule) => `${rule.deliveries} Wagen`,
  };

  const LEVEL_RULES = {

    trackRouter: TRACK_LEVELS,
  };

  // Baut aus den Regel-Tabellen die Level-Objekte, die app.js erwartet.
  function buildLevels(makeLevel) {
    const result = {};
    Object.entries(LEVEL_RULES).forEach(([game, byDifficulty]) => {
      result[game] = DIFFICULTY_ORDER.flatMap((difficulty) =>
        (byDifficulty[difficulty] || []).map((rule, index) => makeLevel(game, difficulty, index + 1, {
          rule,
          badge: BADGE[game](rule),
          description: LEVEL_DESCRIPTIONS[game][difficulty],
        })));
    });
    return result;
  }

  // ===========================================================================
  // Gemeinsame Helfer
  // ===========================================================================
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const shuffle = (items) => {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  // Sterne aus einer Trefferquote. Bewusst grosszügig: auch eine Runde mit
  // ein paar Fehlern soll sich nach Erfolg anfühlen.
  function starsFromAccuracy(correct, total, thresholds = [0.88, 0.66]) {
    if (!total) return 1;
    const ratio = correct / total;
    if (ratio >= thresholds[0]) return 3;
    if (ratio >= thresholds[1]) return 2;
    return 1;
  }
  function starsFromMistakes(mistakes, twoStarLimit = 2) {
    if (mistakes === 0) return 3;
    if (mistakes <= twoStarLimit) return 2;
    return 1;
  }

  // Sanfte Anpassung innerhalb einer Runde: nach vier richtigen Antworten wird
  // es ein Stück schneller, nach einem Fehler bekommt das Kind wieder Luft.
  function createPacer(options = {}) {
    const min = options.min ?? 0.72;
    const max = options.max ?? 1.35;
    let factor = 1;
    let streak = 0;
    return {
      get factor() { return factor; },
      correct() {
        streak += 1;
        if (streak >= 4) { streak = 0; factor = clamp(factor - 0.08, min, max); }
      },
      wrong() {
        streak = 0;
        factor = clamp(factor + 0.16, min, max);
      },
    };
  }

  // Fortschrittspunkte, die alle vier Spiele oben anzeigen.
  function renderDots(done, total, extraClass = "") {
    const row = el("div", `brain-dots ${extraClass}`.trim());
    row.setAttribute("aria-label", `Aufgabe ${Math.min(done + 1, total)} von ${total}`);
    for (let i = 0; i < total; i += 1) {
      row.append(el("span", `brain-dot${i < done ? " done" : i === done ? " current" : ""}`));
    }
    return row;
  }

  // Kopfzeile mit Fortschritt und einem kleinen Zähler rechts.
  function renderHead(done, total, note) {
    const head = el("div", "brain-head");
    head.append(renderDots(done, total));
    if (note) head.append(el("span", "brain-note", note));
    return head;
  }

  // Ein Zeitbalken, der leerläuft. Rein visuell – die Logik steckt im Timer.
  function renderTimeBar(durationMs) {
    const wrap = el("div", "brain-timebar");
    wrap.setAttribute("aria-hidden", "true");
    const fill = el("span", "brain-timebar-fill");
    fill.style.animationDuration = `${Math.max(200, durationMs)}ms`;
    wrap.append(fill);
    return wrap;
  }

  // Kleiner Timer-Helfer, der sich sauber abräumen lässt.
  function createTimers() {
    let ids = [];
    return {
      after(ms, callback) {
        const id = window.setTimeout(() => {
          ids = ids.filter((entry) => entry !== id);
          callback();
        }, ms);
        ids.push(id);
        return id;
      },
      clear() {
        ids.forEach((id) => window.clearTimeout(id));
        ids = [];
      },
    };
  }

  // Farbpalette für Karten, Schätze und Wagen. Bewusst gut unterscheidbar und
  // jeweils mit eigenem Zeichen, damit Farbe nie das einzige Merkmal ist.
  const PALETTE = [
    { id: "red", name: "rot", color: "#ef476f", ink: "#7a1029", symbol: "★" },
    { id: "orange", name: "orange", color: "#ff9f1c", ink: "#7c4600", symbol: "▲" },
    { id: "yellow", name: "gelb", color: "#ffd166", ink: "#7a5800", symbol: "●" },
    { id: "green", name: "grün", color: "#06d6a0", ink: "#03614a", symbol: "■" },
    { id: "teal", name: "türkis", color: "#2ec4d6", ink: "#0a5a66", symbol: "◆" },
    { id: "blue", name: "blau", color: "#4285f4", ink: "#123a80", symbol: "♥" },
    { id: "violet", name: "lila", color: "#8338ec", ink: "#3b1273", symbol: "✚" },
    { id: "pink", name: "pink", color: "#ff5da2", ink: "#7d1348", symbol: "⬟" },
  ];


  // ===========================================================================
  // Spiel 3: Weichen-Wirrwarr
  // ===========================================================================
  // Das einzige Echtzeitspiel der vier. Das Streckennetz ist ein Graph aus
  // Knoten (Start, Weiche, Haus) und Kanten (Gleisstücke). Wagen fahren mit
  // festem Tempo entlang der Kanten; an einer Weiche nehmen sie den Ast, der
  // gerade eingestellt ist. Angetippt wird immer nur die Weiche, nie der Wagen.
  //
  // Koordinaten sind auf 0–1 normiert und werden auf die Leinwand skaliert.
  const TRACK_LAYOUTS = {
    // Eine Weiche, zwei Häuser.
    split2: {
      nodes: [
        { id: "start", type: "spawn", x: 0.06, y: 0.5 },
        { id: "w1", type: "switch", x: 0.46, y: 0.5 },
        { id: "h0", type: "station", x: 0.9, y: 0.22, line: 0 },
        { id: "h1", type: "station", x: 0.9, y: 0.78, line: 1 },
      ],
      edges: [["start", "w1"], ["w1", "h0"], ["w1", "h1"]],
    },
    // Zwei Weichen hintereinander, drei Häuser.
    split3: {
      nodes: [
        { id: "start", type: "spawn", x: 0.05, y: 0.5 },
        { id: "w1", type: "switch", x: 0.34, y: 0.5 },
        { id: "w2", type: "switch", x: 0.63, y: 0.7 },
        { id: "h0", type: "station", x: 0.92, y: 0.16, line: 0 },
        { id: "h1", type: "station", x: 0.92, y: 0.55, line: 1 },
        { id: "h2", type: "station", x: 0.92, y: 0.88, line: 2 },
      ],
      edges: [["start", "w1"], ["w1", "h0"], ["w1", "w2"], ["w2", "h1"], ["w2", "h2"]],
    },
    // Vollständiger Baum: drei Weichen, vier Häuser.
    tree4: {
      nodes: [
        { id: "start", type: "spawn", x: 0.04, y: 0.5 },
        { id: "w1", type: "switch", x: 0.3, y: 0.5 },
        { id: "w2", type: "switch", x: 0.6, y: 0.26 },
        { id: "w3", type: "switch", x: 0.6, y: 0.74 },
        { id: "h0", type: "station", x: 0.93, y: 0.1, line: 0 },
        { id: "h1", type: "station", x: 0.93, y: 0.38, line: 1 },
        { id: "h2", type: "station", x: 0.93, y: 0.64, line: 2 },
        { id: "h3", type: "station", x: 0.93, y: 0.92, line: 3 },
      ],
      edges: [["start", "w1"], ["w1", "w2"], ["w1", "w3"], ["w2", "h0"], ["w2", "h1"], ["w3", "h2"], ["w3", "h3"]],
    },
    // Zwei Startpunkte, die sich eine Weichenstrasse teilen.
    cross4: {
      nodes: [
        { id: "startA", type: "spawn", x: 0.04, y: 0.24 },
        { id: "startB", type: "spawn", x: 0.04, y: 0.76 },
        { id: "j1", type: "join", x: 0.26, y: 0.5 },
        { id: "w1", type: "switch", x: 0.46, y: 0.5 },
        { id: "w2", type: "switch", x: 0.7, y: 0.26 },
        { id: "w3", type: "switch", x: 0.7, y: 0.74 },
        { id: "h0", type: "station", x: 0.94, y: 0.1, line: 0 },
        { id: "h1", type: "station", x: 0.94, y: 0.38, line: 1 },
        { id: "h2", type: "station", x: 0.94, y: 0.64, line: 2 },
        { id: "h3", type: "station", x: 0.94, y: 0.92, line: 3 },
      ],
      edges: [["startA", "j1"], ["startB", "j1"], ["j1", "w1"], ["w1", "w2"], ["w1", "w3"],
        ["w2", "h0"], ["w2", "h1"], ["w3", "h2"], ["w3", "h3"]],
    },
    // Vier Weichen, fünf Häuser – die längste Strecke.
    tree5: {
      nodes: [
        { id: "start", type: "spawn", x: 0.03, y: 0.5 },
        { id: "w1", type: "switch", x: 0.24, y: 0.5 },
        { id: "w2", type: "switch", x: 0.5, y: 0.24 },
        { id: "w3", type: "switch", x: 0.5, y: 0.76 },
        { id: "w4", type: "switch", x: 0.73, y: 0.6 },
        { id: "h0", type: "station", x: 0.94, y: 0.08, line: 0 },
        { id: "h1", type: "station", x: 0.94, y: 0.3, line: 1 },
        { id: "h2", type: "station", x: 0.94, y: 0.52, line: 2 },
        { id: "h3", type: "station", x: 0.94, y: 0.74, line: 3 },
        { id: "h4", type: "station", x: 0.94, y: 0.94, line: 4 },
      ],
      edges: [["start", "w1"], ["w1", "w2"], ["w1", "w3"], ["w2", "h0"], ["w2", "h1"],
        ["w3", "w4"], ["w3", "h4"], ["w4", "h2"], ["w4", "h3"]],
    },
  };

  const TRACK_CANVAS_RATIO = 0.76; // Höhe im Verhältnis zur Breite

  function createTrackRouter(api) {
    let s = null;
    let frame = 0;
    let canvas = null;
    let ctx = null;
    let hud = null;

    // Die Leinwand zeichnet sich selbst; die Kopfzeile ist normales DOM und
    // muss deshalb von Hand nachgeführt werden.
    function syncHud() {
      if (!hud || !s) return;
      if (hud.delivered === s.delivered && hud.missed === s.missed) return;
      hud.delivered = s.delivered;
      hud.missed = s.missed;
      Array.from(hud.dots.children).forEach((dot, index) => {
        dot.className = `brain-dot${index < s.delivered ? " done" : index === s.delivered ? " current" : ""}`;
      });
      hud.note.textContent = s.missed ? `${s.missed} verfahren` : "alles richtig";
    }

    function roundRect(x, y, width, height, radius) {
      if (typeof ctx.roundRect === "function") { ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); return; }
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    }
    function layout() { return TRACK_LAYOUTS[s.rule.layout] || TRACK_LAYOUTS.split2; }
    function nodeById(id) { return layout().nodes.find((node) => node.id === id); }
    function outgoing(id) { return layout().edges.filter(([from]) => from === id).map(([, to]) => to); }
    function spawnNodes() { return layout().nodes.filter((node) => node.type === "spawn"); }

    // Welche Häuser sind von diesem Knoten aus überhaupt erreichbar? Damit
    // bekommt jede Weiche eine sinnvolle Beschriftung und der Spawn weiss,
    // welche Farben er ausgeben darf.
    function reachable(id, seen = new Set()) {
      if (seen.has(id)) return [];
      seen.add(id);
      const node = nodeById(id);
      if (!node) return [];
      if (node.type === "station") return [node.line];
      return outgoing(id).flatMap((next) => reachable(next, seen));
    }

    function stop() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    }

    function activeLines() {
      return layout().nodes.filter((node) => node.type === "station" && node.line < s.rule.lines).map((node) => node.line);
    }

    function spawnCar() {
      if (s.cars.length >= s.rule.maxCars) return;
      const from = pick(spawnNodes());
      const options = reachable(from.id).filter((line) => line < s.rule.lines);
      if (!options.length) return;
      s.cars.push({
        line: pick(options),
        from: from.id,
        to: outgoing(from.id)[0],
        t: 0,
        id: s.nextCarId++,
      });
    }

    function switchTarget(nodeId) {
      const outs = outgoing(nodeId);
      const index = s.switches[nodeId] || 0;
      return outs[index % outs.length];
    }

    function advanceCar(car, delta) {
      car.t += s.rule.speed * delta * s.pace;
      while (car.t >= 1) {
        car.t -= 1;
        const arrived = nodeById(car.to);
        if (!arrived) { car.done = true; return; }
        if (arrived.type === "station") {
          car.done = true;
          if (arrived.line === car.line) {
            s.delivered += 1;
            s.flash = { nodeId: arrived.id, until: performance.now() + 420, ok: true };
            api.playJingle("correct");
            api.kids()?.vibrate?.(16);
          } else {
            s.missed += 1;
            s.flash = { nodeId: arrived.id, until: performance.now() + 520, ok: false };
            // Erholungsphase: nach einem Fehler wird es kurz ruhiger.
            s.pace = 0.82;
            s.nextSpawnAt = performance.now() + s.rule.spawnMs * 1.4;
            api.playJingle("retry");
          }
          return;
        }
        const next = arrived.type === "switch" ? switchTarget(arrived.id) : outgoing(arrived.id)[0];
        if (!next) { car.done = true; return; }
        car.from = arrived.id;
        car.to = next;
      }
    }

    function tick(now) {
      frame = 0;
      if (!s || s.done) return;
      const delta = Math.min(0.05, (now - s.lastFrame) / 1000 || 0);
      s.lastFrame = now;
      s.cars.forEach((car) => advanceCar(car, delta));
      s.cars = s.cars.filter((car) => !car.done);
      if (s.pace < 1) s.pace = Math.min(1, s.pace + delta * 0.25);
      if (now >= s.nextSpawnAt) {
        spawnCar();
        s.nextSpawnAt = now + s.rule.spawnMs / Math.max(0.6, s.pace);
      }
      draw();
      syncHud();
      if (s.delivered >= s.rule.deliveries) {
        s.done = true;
        api.render();
        api.handleWin();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    }

    function resizeCanvas() {
      if (!canvas) return;
      const width = canvas.clientWidth || 320;
      const height = Math.round(width * TRACK_CANVAS_RATIO);
      if (s.size && s.size.width === width && s.size.height === height && ctx) return;
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.size = { width, height };
    }

    const px = (node) => ({ x: node.x * (s.size.width - 56) + 28, y: node.y * (s.size.height - 56) + 28 });
    // Auf kleinen Leinwänden – und bei fünf Häusern übereinander – wird alles
    // etwas kleiner gezeichnet, damit nichts überlappt.
    function drawScale() {
      const stations = layout().nodes.filter((node) => node.type === "station").length;
      const room = (s.size.height - 56) / Math.max(2, stations);
      return clamp(room / 58, 0.62, 1);
    }
    const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

    function drawTrack() {
      const { edges } = layout();
      edges.forEach(([fromId, toId]) => {
        const from = px(nodeById(fromId));
        const to = px(nodeById(toId));
        const fromNode = nodeById(fromId);
        const chosen = fromNode.type !== "switch" || switchTarget(fromId) === toId;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#d7dbe8";
        ctx.lineWidth = 16;
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
        ctx.strokeStyle = chosen ? "#7a8299" : "#e7e9f2";
        ctx.lineWidth = chosen ? 8 : 5;
        ctx.setLineDash(chosen ? [] : [10, 9]);
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    function drawStation(node) {
      const pos = px(node);
      const palette = PALETTE[node.line % PALETTE.length];
      const flash = s.flash && s.flash.nodeId === node.id && performance.now() < s.flash.until;
      const dim = node.line >= s.rule.lines;
      ctx.save();
      ctx.globalAlpha = dim ? 0.25 : 1;
      ctx.translate(pos.x, pos.y);
      ctx.scale(drawScale(), drawScale());
      if (flash) {
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = s.flash.ok ? "rgba(6,214,160,0.35)" : "rgba(255,159,28,0.35)";
        ctx.fill();
      }
      // Haus: Körper plus Dach.
      ctx.fillStyle = palette.color;
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 2.5;
      roundRect(-19, -6, 38, 26, 6);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-23, -6); ctx.lineTo(0, -24); ctx.lineTo(23, -6); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = palette.ink;
      ctx.font = "bold 15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(palette.symbol, 0, 8);
      ctx.restore();
    }

    function drawSwitch(node) {
      const pos = px(node);
      const target = nodeById(switchTarget(node.id));
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.scale(drawScale(), drawScale());
      ctx.beginPath();
      ctx.arc(0, 0, 21, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#6c5ce7";
      ctx.lineWidth = 4;
      ctx.fill(); ctx.stroke();
      if (target) {
        const to = px(target);
        const angle = Math.atan2(to.y - pos.y, to.x - pos.x);
        // Der Winkel stammt aus den echten Koordinaten, nicht aus dem
        // skalierten System – deshalb erst jetzt drehen.
        ctx.rotate(angle);
        ctx.strokeStyle = "#6c5ce7";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(8, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(9, 0); ctx.lineTo(2, 6); ctx.stroke();
      }
      ctx.restore();
    }

    function drawCar(car) {
      const from = nodeById(car.from);
      const to = nodeById(car.to);
      if (!from || !to) return;
      const pos = lerp(px(from), px(to), car.t);
      const palette = PALETTE[car.line % PALETTE.length];
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.scale(drawScale(), drawScale());
      ctx.fillStyle = palette.color;
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 2.5;
      roundRect(-16, -12, 32, 24, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = palette.ink;
      ctx.font = "bold 14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(palette.symbol, 0, 1);
      ctx.restore();
    }

    function draw() {
      if (!ctx || !s.size) return;
      ctx.clearRect(0, 0, s.size.width, s.size.height);
      drawTrack();
      layout().nodes.forEach((node) => {
        if (node.type === "station") drawStation(node);
        else if (node.type === "switch") drawSwitch(node);
      });
      s.cars.forEach(drawCar);
    }

    function handleTap(event) {
      if (!s || s.done || !canvas || s.phase !== "playing") return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const hit = layout().nodes
        .filter((node) => node.type === "switch")
        .map((node) => ({ node, pos: px(node) }))
        .find(({ pos }) => Math.hypot(pos.x - x, pos.y - y) <= Math.max(30, 34 * drawScale()));
      if (!hit) return;
      const outs = outgoing(hit.node.id);
      s.switches[hit.node.id] = ((s.switches[hit.node.id] || 0) + 1) % outs.length;
      api.playJingle("star");
      api.kids()?.vibrate?.(12);
      draw();
    }

    function startLoop() {
      stop();
      s.lastFrame = performance.now();
      s.nextSpawnAt = s.lastFrame + 900;
      frame = window.requestAnimationFrame(tick);
    }

    function beginRound() {
      s.phase = "playing";
      api.render();
    }

    // Fenstergrösse ändert sich (Drehen, Tastatur) – Leinwand nachziehen.
    function watchSize(node) {
      if (typeof ResizeObserver !== "function") return;
      const observer = new ResizeObserver(() => {
        if (!node.isConnected) { observer.disconnect(); return; }
        resizeCanvas();
        draw();
      });
      observer.observe(node);
    }

    return {
      stop,
      resetState(level) {
        stop();
        s = {
          rule: level.rule,
          switches: {},
          cars: [],
          nextCarId: 1,
          delivered: 0,
          missed: 0,
          pace: 1,
          lastFrame: 0,
          nextSpawnAt: 0,
          flash: null,
          size: null,
          phase: "intro",
          done: false,
        };
        api.setStatus("Stelle die Weichen, bevor der Wagen ankommt.");
      },
      checkWin() { return Boolean(s?.done); },
      solveResult() { return { delivered: s?.delivered || 0, missed: s?.missed || 0 }; },
      stars() { return starsFromMistakes(s?.missed || 0, 2); },
      helpText(level) {
        const lines = activeLines().map((line) => PALETTE[line % PALETTE.length].name).join(", ");
        if (s?.phase === "intro") return "Tippe auf Los geht's, dann rollen die ersten Wagen los.";
        return `Jeder Wagen muss zum Haus mit derselben Farbe fahren. Die Farben sind ${lines}. Tippe auf die lila Kreise, das sind die Weichen. Noch ${Math.max(0, level.rule.deliveries - (s?.delivered || 0))} Wagen bis zum Ziel.`;
      },
      render(level) {
        const board = api.board;
        const running = Boolean(frame);
        board.innerHTML = "";
        board.className = "board task-board brain-board track-board";
        board.style.setProperty("--size", 1);
        const head = renderHead(s.delivered, s.rule.deliveries, s.missed ? `${s.missed} verfahren` : "alles richtig");
        board.append(head);
        hud = {
          dots: head.querySelector(".brain-dots"),
          note: head.querySelector(".brain-note"),
          delivered: s.delivered,
          missed: s.missed,
        };

        canvas = el("canvas", "track-canvas");
        canvas.setAttribute("aria-label", "Gleisnetz mit Weichen");
        board.append(canvas);

        if (s.phase === "intro") {
          const legend = el("div", "track-legend");
          activeLines().forEach((line) => {
            const palette = PALETTE[line % PALETTE.length];
            const chip = el("span", "track-legend-chip");
            chip.style.setProperty("--chip-color", palette.color);
            chip.style.setProperty("--chip-ink", palette.ink);
            chip.append(el("span", "track-legend-symbol", palette.symbol));
            chip.append(el("span", null, palette.name));
            legend.append(chip);
          });
          board.append(legend);
          const go = el("button", "brain-primary-button", "Los geht's! 🚃");
          go.type = "button";
          go.addEventListener("click", beginRound);
          board.append(go);
        } else {
          board.append(el("p", "brain-hint", "Tippe auf die Weichen – nie auf die Wagen."));
        }

        // Nach dem Anhängen steht erst die Breite fest.
        s.size = null;
        window.requestAnimationFrame(() => {
          if (!canvas?.isConnected) return;
          resizeCanvas();
          draw();
          if (!running && !s.done && s.phase === "playing") startLoop();
        });
        canvas.addEventListener("pointerdown", handleTap);
        watchSize(canvas);
      },
    };
  }

  // ===========================================================================
  // Anmeldung bei app.js
  // ===========================================================================
  function createHandlers(api) {
    return {

      trackRouter: createTrackRouter(api),
    };
  }

  window.LernappBrainGames = { configs, pages, buildLevels, createHandlers };
})();
