/*
 * weichen.js – Weichen-Wirrwarr über zehn Level.
 *
 * Aus dem Tunnel links kommen Züge, jeder in einer Farbe; rechts stehen die
 * Häuser in denselben Farben. Dazwischen liegt ein Baum aus Weichen. Angetippt
 * wird immer nur eine Weiche, nie ein Zug – das ist die ganze Aufgabe: früh
 * genug umstellen.
 *
 * Ein Level ist vorbei, wenn der letzte Zug angekommen ist – richtig oder
 * falsch. Es gibt kein Weiterfahren nach einem Fehler und kein vorzeitiges
 * Ende: was losgefahren ist, kommt irgendwo an.
 *
 * Das Streckennetz wird gerechnet, nicht gezeichnet: für n Häuser entsteht ein
 * ausgeglichener Baum mit n-1 Weichen. Zehn von Hand gepflegte Netze wären
 * zehnmal die Gelegenheit, ein Haus unerreichbar zu machen.
 *
 * Gezeichnet wird auf eine Leinwand statt in SVG: bis zu vier Züge bewegen
 * sich gleichzeitig, und dafür ist ein Bild pro Bild neu gemaltes Canvas
 * ruhiger als hundert Knoten, die der Browser einzeln nachrechnet.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "trackrouter") return;

  const host = document.querySelector("#tr-stage");
  const shellApi = window.LernappGameShell;
  const cloudApi = window.LernappGameCloud;
  const art = window.LernappTrainArt;
  if (!host || !shellApi || !art) return;

  const kids = () => window.LernappKids || null;

  // ---------------------------------------------------------------------------
  // Die zehn Level
  // ---------------------------------------------------------------------------
  // farben = Häuser und Zugfarben, zuege = wie viele fahren insgesamt,
  // takt = Abstand der Abfahrten, gleichzeitig = wie viele höchstens zugleich
  // auf der Strecke sind.
  //
  // tempo ist die Strecke, die ein Zug in einer Sekunde zurücklegt, gemessen in
  // Bildbreiten – nicht Gleisstücke pro Sekunde. Ein Zug fährt damit überall
  // gleich schnell; nach Gleisstücken gerechnet raste er auf den langen Ästen
  // und kroch auf den kurzen.
  //
  // Die Züge fahren noch einmal halb so schnell: in Level 1 braucht einer gut
  // eine halbe Minute über das Bild, in Level 10 gut zwanzig Sekunden. Auf drei
  // Sterne kommt nur, wer keinen einzigen Zug verfährt, und dafür muss vor
  // jeder Weiche Zeit zum Schauen bleiben – in den schweren Levels war die
  // vorher weg.
  //
  // Wie oft eine Entscheidung ansteht, hängt nicht am Takt, sondern daran, wie
  // viele Züge zugleich unterwegs sind mal ihrem Tempo: halbes Tempo heisst
  // halb so viele Weichen pro Minute. Genau das war gewünscht, und deshalb
  // bleiben Takt und Gleichzeitigkeit, wie sie waren – mehr Züge nebeneinander
  // hätten die Entscheidungsdichte wieder hochgezogen.
  //
  // Weil ein Zug damit doppelt so lange über das Bild braucht, fahren halb so
  // viele: sonst dauerte ein Level über zwei Minuten statt gut einer. Die
  // Rechnung dazu steht in scripts/validate-weichen.mjs und wird dort geprüft.
  //
  // Schwerer wird es weiterhin über die Dichte, nicht über das Tempo. Ab
  // Level 4 zieht das Tempo leicht an, aber auch in Level 10 fährt ein Zug
  // langsamer als früher in Level 1.
  const LEVELS = [
    { nr: 1, farben: 3, zuege: 8, tempo: 0.0275, takt: 2600, gleichzeitig: 4 },
    { nr: 2, farben: 4, zuege: 8, tempo: 0.0275, takt: 2400, gleichzeitig: 4 },
    { nr: 3, farben: 5, zuege: 10, tempo: 0.03, takt: 2200, gleichzeitig: 5 },
    { nr: 4, farben: 5, zuege: 12, tempo: 0.0325, takt: 2000, gleichzeitig: 6 },
    { nr: 5, farben: 6, zuege: 12, tempo: 0.035, takt: 1900, gleichzeitig: 6 },
    { nr: 6, farben: 6, zuege: 15, tempo: 0.0375, takt: 1800, gleichzeitig: 6 },
    { nr: 7, farben: 7, zuege: 15, tempo: 0.04, takt: 1700, gleichzeitig: 6 },
    { nr: 8, farben: 8, zuege: 15, tempo: 0.0425, takt: 1600, gleichzeitig: 6 },
    { nr: 9, farben: 8, zuege: 18, tempo: 0.045, takt: 1500, gleichzeitig: 6 },
    { nr: 10, farben: 9, zuege: 18, tempo: 0.0475, takt: 1400, gleichzeitig: 6 },
  ];

  // Fünf abgeschlossene Level, und der Wagen im Bereich Konzentration ist für
  // dieses Spiel fertig – welche fünf, ist gleich.
  // Wie viele, sagt das Wagen-Set: fünf im ersten, neun im zweiten (kids.js).
  const LEVELS_FOR_DONE = window.LernappKids?.wagonRounds?.() || 5;

  // Neun Farben, jede mit eigenem Zeichen: Farbe allein trennt neun Häuser zu
  // schwach, und für ein farbenblindes Kind gar nicht.
  const FARBEN = [
    { name: "rot", color: "#ef476f", ink: "#7a1029", symbol: "★" },
    { name: "orange", color: "#ff9f1c", ink: "#7c4600", symbol: "▲" },
    { name: "gelb", color: "#ffd166", ink: "#7a5800", symbol: "●" },
    { name: "grün", color: "#06d6a0", ink: "#03614a", symbol: "■" },
    { name: "türkis", color: "#2ec4d6", ink: "#0a5a66", symbol: "◆" },
    { name: "blau", color: "#4285f4", ink: "#123a80", symbol: "♥" },
    { name: "lila", color: "#8338ec", ink: "#3b1273", symbol: "✚" },
    { name: "pink", color: "#ff5da2", ink: "#7d1348", symbol: "⬟" },
    { name: "braun", color: "#a4713b", ink: "#4a2f13", symbol: "✦" },
  ];

  const HELP = [
    "Weichen-Wirrwarr. Links kommen Züge aus dem Tunnel, rechts stehen die Häuser.",
    "Jeder Zug muss zum Haus mit seiner Farbe und seinem Zeichen fahren.",
    "Dazwischen liegen die Weichen: die lila Kreise mit dem Pfeil.",
    "Tippe auf eine Weiche, dann zeigt der Pfeil in die andere Richtung.",
    "Stell sie um, bevor der Zug dort ankommt.",
    "Auf die Züge tippst du nie.",
    "Das Level ist fertig, wenn der letzte Zug angekommen ist.",
  ].join(" ");

  // ---------------------------------------------------------------------------
  // Fortschritt – lokal und in der Cloud
  // ---------------------------------------------------------------------------
  const store = cloudApi
    ? cloudApi.register({ key: "lernapp.trackrouter", empty: { best: {} }, merge: cloudApi.mergeLevels })
    : {
      read: () => ({ best: {} }),
      write(data) { return data; },
      update(fn) { return fn(this.read()); },
      onChange() { return () => {}; },
    };

  const bestStars = (nr) => Number(store.read().best?.[nr]?.stars) || 0;
  const doneCount = () => Object.values(store.read().best || {}).filter((entry) => (Number(entry?.stars) || 0) > 0).length;

  function recordLevel(nr, stars) {
    return store.update((old) => {
      const best = { ...(old.best || {}) };
      if ((Number(best[nr]?.stars) || 0) < stars) best[nr] = { stars };
      return { ...old, best };
    });
  }

  // Fehlerlos sind drei Sterne. Bis zu vier verfahrene Züge zwei, darüber
  // einer – ein Level bleibt immer geschafft, auch wenn vieles danebenging.
  function starsFor(verfahren) {
    if (verfahren === 0) return 3;
    if (verfahren <= 4) return 2;
    return 1;
  }

  // ---------------------------------------------------------------------------
  // Das Streckennetz
  // ---------------------------------------------------------------------------
  // Ein ausgeglichener Baum: eine Einfahrt links, n Häuser rechts, dazwischen
  // n-1 Weichen. Die Koordinaten sind auf 0–1 normiert.
  // Wo die erste Weiche steht. Vom Tunnel bei 0.02 aus sind das gut 0.28 der
  // Breite – doppelt so viel Anlauf wie vorher.
  const FIRST_SWITCH_X = 0.30;

  function buildNet(count) {
    const nodes = [];
    const edges = [];
    const depth = Math.max(1, Math.ceil(Math.log2(count)));
    const yFor = (index) => (index + 0.5) / count;

    for (let i = 0; i < count; i += 1) {
      nodes.push({ id: `h${i}`, type: "station", x: 0.93, y: yFor(i), line: i });
    }

    let switches = 0;
    function build(lo, hi, level) {
      if (hi - lo === 1) return `h${lo}`;
      const mid = lo + Math.ceil((hi - lo) / 2);
      const id = `w${switches += 1}`;
      nodes.push({
        id,
        type: "switch",
        // Die erste Weiche liegt weit rechts: die Strecke aus dem Tunnel ist
        // die Bedenkzeit, und die braucht ein Kind, bevor der erste Zug da ist.
        x: FIRST_SWITCH_X + level * ((0.72 - FIRST_SWITCH_X) / depth),
        y: (yFor(lo) + yFor(hi - 1)) / 2,
      });
      edges.push([id, build(lo, mid, level + 1)], [id, build(mid, hi, level + 1)]);
      return id;
    }

    const root = build(0, count, 0);
    nodes.push({ id: "start", type: "spawn", x: 0.02, y: 0.5 });
    edges.push(["start", root]);
    return { nodes, edges };
  }

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------
  const state = { phase: "menu", level: null, net: null };
  let shell = null;
  let board = null;
  let canvas = null;
  let ctx = null;
  let size = null;
  let frame = 0;
  let run = null;

  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const nodeById = (id) => state.net.nodes.find((node) => node.id === id);
  const outgoing = (id) => state.net.edges.filter(([from]) => from === id).map(([, to]) => to);

  function stopLoop() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  // ---------------------------------------------------------------------------
  // Levelwahl
  // ---------------------------------------------------------------------------
  function showMenu() {
    stopLoop();
    run = null;
    shell.closeOverlay();
    shell.setPhase("menu");
    state.phase = "menu";
    shell.setCount(doneCount());

    shell.clear();
    shell.play.append(shell.el("p", "cm-prompt", "Welches Level möchtest du fahren?"));

    const grid = shell.el("div", "tr-levels");
    LEVELS.forEach((level) => {
      const button = shell.el("button", "tr-level");
      button.type = "button";
      const stars = bestStars(level.nr);
      button.setAttribute("aria-label",
        `Level ${level.nr}: ${level.farben} Farben, ${level.zuege} Züge. ${stars ? `${stars} von 3 Sternen.` : "Noch nicht gefahren."}`);
      button.append(shell.el("span", "tr-level-nr", String(level.nr)));

      // Die Farben des Levels als Punktreihe: so ist vor dem Start zu sehen,
      // wie voll es wird – ohne dass ein Kind eine Zahl lesen muss.
      const dots = shell.el("span", "tr-level-colors");
      for (let i = 0; i < level.farben; i += 1) {
        const dot = shell.el("span", "tr-level-dot");
        dot.style.background = FARBEN[i].color;
        dots.append(dot);
      }
      button.append(dots);

      const row = shell.el("span", "tr-level-stars");
      for (let i = 0; i < 3; i += 1) row.append(shell.el("span", `tr-level-star${i < stars ? " is-on" : ""}`, "★"));
      button.append(row);

      button.addEventListener("click", () => startLevel(level));
      grid.append(button);
    });
    shell.play.append(grid);
  }

  function levelsText(done) {
    const left = LEVELS_FOR_DONE - done;
    if (left <= 0) return "Dieses Spiel ist geschafft – der Wagen ist gebaut.";
    return left === 1
      ? "Noch ein Level bis zum fertigen Wagen."
      : `Noch ${left} Level bis zum fertigen Wagen.`;
  }

  // ---------------------------------------------------------------------------
  // Ein Level
  // ---------------------------------------------------------------------------
  // Ein Tipp auf das Level, und es geht sofort los – kein zweiter Knopf.
  function startLevel(level) {
    stopLoop();
    state.phase = "play";
    state.level = level;
    state.net = buildNet(level.farben);
    shell.setPhase("play");
    shell.closeOverlay();
    shell.setCount(0);

    run = {
      switches: {},
      trains: [],
      gestartet: 0,
      angekommen: 0,
      richtig: 0,
      verfahren: 0,
      blink: null,
      naechsteAbfahrt: 0,
      letzterRahmen: 0,
    };

    shell.clear();
    board = shell.el("div", "tr-board");
    canvas = document.createElement("canvas");
    canvas.className = "tr-canvas";
    canvas.setAttribute("aria-label", `Gleisnetz mit ${level.farben} Häusern und ${level.farben - 1} Weichen`);
    canvas.addEventListener("pointerdown", handleTap);
    board.append(canvas);
    shell.play.append(board);

    size = null;
    window.requestAnimationFrame(() => {
      if (!canvas?.isConnected) return;
      resizeCanvas();
      draw();
      run.letzterRahmen = performance.now();
      run.naechsteAbfahrt = run.letzterRahmen + 700;
      frame = window.requestAnimationFrame(tick);
    });
  }

  function resizeCanvas() {
    if (!canvas) return;
    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 240;
    if (size && size.width === width && size.height === height && ctx) return;
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    size = { width, height };
  }

  const PAD = 34;
  const px = (node) => ({
    x: node.x * (size.width - PAD * 2) + PAD,
    y: node.y * (size.height - PAD * 2) + PAD,
  });
  const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

  // Bei neun Häusern übereinander wird alles kleiner gezeichnet, damit nichts
  // überlappt.
  function scale() {
    const room = (size.height - PAD * 2) / Math.max(2, state.level.farben);
    return clamp(room / 58, 0.42, 1);
  }

  function switchTarget(id) {
    const outs = outgoing(id);
    return outs[(run.switches[id] || 0) % outs.length];
  }

  // ---------------------------------------------------------------------------
  // Fahren
  // ---------------------------------------------------------------------------
  // Wie lang ein Zug auf dem Bild ist, in Bildbreiten. Gezeichnet misst er vom
  // hinteren Wagen bis zum Schornstein gut 44 Einheiten.
  function zugLaenge() {
    return 44 * 1.35 * scale() / Math.max(1, size.width);
  }

  function spawnTrain() {
    if (run.gestartet >= state.level.zuege) return false;
    if (run.trains.length >= state.level.gleichzeitig) return false;
    // Seit die Züge halb so schnell fahren, kommen sie im selben Takt halb so
    // weit auseinander aus dem Tunnel. Auf einem schmalen Handybild ist ein Zug
    // fast ein Sechstel der Breite lang – ohne diese Sperre schöbe sich der
    // nächste in den vorherigen hinein. Er wartet deshalb, bis der davor eine
    // Zuglänge und einen Viertel weit draussen ist: genug für eine sichtbare
    // Lücke, wenig genug, dass auch auf dem Handy so viele Züge zugleich fahren
    // wie vorgesehen. Auf breiten Bildern greift die Sperre nie.
    const letzter = run.trains[run.trains.length - 1];
    if (letzter && letzter.from === "start"
      && letzter.t * edgeLength("start", letzter.to) < zugLaenge() * 1.25) return false;
    run.gestartet += 1;
    run.trains.push({
      // Eine Nummer je Zug: die Liste schrumpft, wenn einer ankommt, und über
      // den Platz darin liesse sich kein Zug wiedererkennen.
      id: run.gestartet,
      line: Math.floor(Math.random() * state.level.farben),
      from: "start",
      to: outgoing("start")[0],
      t: 0,
    });
    return true;
  }

  // Wie lang ein Gleisstueck auf dem Bild ist, gemessen in Bildbreiten. Ohne
  // das fuhren die Zuege ueberall gleich lange – und damit auf einem langen
  // Stueck fuenfmal so schnell wie auf einem kurzen.
  function edgeLength(fromId, toId) {
    const a = px(nodeById(fromId));
    const b = px(nodeById(toId));
    return Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)) / Math.max(1, size.width);
  }

  function advance(train, delta) {
    train.t += state.level.tempo * delta / edgeLength(train.from, train.to);
    while (train.t >= 1) {
      train.t -= 1;
      const node = nodeById(train.to);
      if (!node) { train.done = true; return; }
      if (node.type === "station") {
        train.done = true;
        run.angekommen += 1;
        const ok = node.line === train.line;
        if (ok) {
          run.richtig += 1;
          shell.setCount(run.richtig);
          kids()?.playJingle?.("correct");
          kids()?.vibrate?.(14);
        } else {
          run.verfahren += 1;
          kids()?.playJingle?.("retry");
        }
        run.blink = { id: node.id, bis: performance.now() + (ok ? 420 : 560), ok };
        return;
      }
      const next = node.type === "switch" ? switchTarget(node.id) : outgoing(node.id)[0];
      if (!next) { train.done = true; return; }
      train.from = node.id;
      train.to = next;
    }
  }

  function tick(now) {
    frame = 0;
    if (!run || state.phase !== "play") return;
    const delta = Math.min(0.05, (now - run.letzterRahmen) / 1000 || 0);
    run.letzterRahmen = now;

    run.trains.forEach((train) => advance(train, delta));
    run.trains = run.trains.filter((train) => !train.done);

    if (now >= run.naechsteAbfahrt) {
      // Ist die Strecke voll, wird gleich wieder nachgeschaut statt die
      // Abfahrt zu verwerfen: sonst führe ein volles Level immer kürzer.
      const los = spawnTrain();
      run.naechsteAbfahrt = now + (los ? state.level.takt : 300);
    }

    draw();

    // Fertig ist das Level erst, wenn der letzte Zug angekommen ist.
    if (run.angekommen >= state.level.zuege) { finish(); return; }
    frame = window.requestAnimationFrame(tick);
  }

  // ---------------------------------------------------------------------------
  // Zeichnen
  // ---------------------------------------------------------------------------
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

  function drawTrack() {
    state.net.edges.forEach(([fromId, toId]) => {
      const from = px(nodeById(fromId));
      const to = px(nodeById(toId));
      const gewaehlt = nodeById(fromId).type !== "switch" || switchTarget(fromId) === toId;
      ctx.lineCap = "round";
      // Schwellenbett, dann die Schiene. Der nicht gewählte Ast bleibt blass
      // und gestrichelt: so ist auf einen Blick zu sehen, wohin es geht.
      ctx.strokeStyle = "#d7dbe8";
      ctx.lineWidth = 14 * scale() + 4;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      ctx.strokeStyle = gewaehlt ? "#7a8299" : "#e7e9f2";
      ctx.lineWidth = (gewaehlt ? 7 : 4) * scale() + 1;
      ctx.setLineDash(gewaehlt ? [] : [10, 9]);
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function drawStation(node) {
    const pos = px(node);
    const farbe = FARBEN[node.line % FARBEN.length];
    const blink = run.blink && run.blink.id === node.id && performance.now() < run.blink.bis;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.scale(scale(), scale());
    if (blink) {
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fillStyle = run.blink.ok ? "rgba(6,214,160,0.4)" : "rgba(239,71,111,0.35)";
      ctx.fill();
    }
    ctx.fillStyle = farbe.color;
    ctx.strokeStyle = farbe.ink;
    ctx.lineWidth = 2.5;
    roundRect(-19, -6, 38, 26, 6);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-23, -6); ctx.lineTo(0, -24); ctx.lineTo(23, -6); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = farbe.ink;
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(farbe.symbol, 0, 8);
    ctx.restore();
  }

  function drawSwitch(node) {
    const pos = px(node);
    const ziel = nodeById(switchTarget(node.id));
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.scale(scale(), scale());
    ctx.beginPath();
    ctx.arc(0, 0, 21, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#6c5ce7";
    ctx.lineWidth = 4;
    ctx.fill(); ctx.stroke();
    if (ziel) {
      const to = px(ziel);
      // Der Winkel stammt aus den echten Koordinaten, nicht aus dem skalierten
      // System – deshalb erst jetzt drehen.
      ctx.rotate(Math.atan2(to.y - pos.y, to.x - pos.x));
      ctx.strokeStyle = "#6c5ce7";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(8, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(9, 0); ctx.lineTo(2, 6); ctx.stroke();
    }
    ctx.restore();
  }

  // Ein Zug statt eines Vierecks: Lok mit Führerhaus, Schornstein und Rädern,
  // dahinter ein Wagen mit dem Zeichen seiner Farbe. Er zeigt in Fahrtrichtung.
  function drawTrain(train) {
    const from = nodeById(train.from);
    const to = nodeById(train.to);
    if (!from || !to) return;
    const a = px(from);
    const b = px(to);
    const pos = lerp(a, b, train.t);
    const farbe = FARBEN[train.line % FARBEN.length];
    const dunkel = art.shade(farbe.color, -0.3);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x));
    // Etwas grösser als der Rest: der Zug ist das, was sich bewegt, und sein
    // Zeichen muss man im Vorbeifahren lesen können.
    ctx.scale(scale() * 1.35, scale() * 1.35);
    ctx.lineWidth = 2;
    ctx.strokeStyle = farbe.ink;

    // Räder zuerst, damit die Aufbauten darüber liegen.
    ctx.fillStyle = "#3a4657";
    [-25, -18, -4, 7].forEach((x) => {
      ctx.beginPath();
      ctx.arc(x, 9, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Wagen hinten.
    ctx.fillStyle = farbe.color;
    roundRect(-30, -8, 20, 17, 4);
    ctx.fill(); ctx.stroke();

    // Kupplung.
    ctx.strokeStyle = "#3a4657";
    ctx.beginPath(); ctx.moveTo(-10, 5); ctx.lineTo(-7, 5); ctx.stroke();
    ctx.strokeStyle = farbe.ink;

    // Lok: Kessel, Führerhaus, Schornstein.
    ctx.fillStyle = farbe.color;
    roundRect(-7, -9, 20, 18, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = dunkel;
    roundRect(-6, -17, 10, 9, 2);
    ctx.fill(); ctx.stroke();
    roundRect(7, -16, 5, 8, 1.5);
    ctx.fill(); ctx.stroke();

    // Das Zeichen auf dem Wagen – gegen die Fahrtrichtung zurückgedreht, damit
    // es auch bergab lesbar bleibt.
    ctx.save();
    ctx.translate(-20, 0);
    ctx.rotate(-Math.atan2(b.y - a.y, b.x - a.x));
    ctx.fillStyle = farbe.ink;
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(farbe.symbol, 0, 1);
    ctx.restore();
    ctx.restore();
  }

  // Der Tunnel, aus dem die Züge kommen.
  function drawTunnel(node) {
    const pos = px(node);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.scale(scale(), scale());
    ctx.fillStyle = "#8d99ae";
    ctx.beginPath();
    ctx.moveTo(-16, 20);
    ctx.lineTo(-16, 0);
    ctx.arc(0, 0, 16, Math.PI, 0);
    ctx.lineTo(16, 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2f3b47";
    ctx.beginPath();
    ctx.moveTo(-10, 20);
    ctx.lineTo(-10, 0);
    ctx.arc(0, 0, 10, Math.PI, 0);
    ctx.lineTo(10, 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    if (!ctx || !size || !run) return;
    ctx.clearRect(0, 0, size.width, size.height);
    drawTrack();
    state.net.nodes.filter((node) => node.type === "station").forEach(drawStation);
    run.trains.forEach(drawTrain);
    // Weichen über die Züge: sie sind das, worauf getippt wird, und ein Zug,
    // der gerade darüber rollt, darf die Tippfläche nicht verdecken.
    state.net.nodes.filter((node) => node.type === "switch").forEach(drawSwitch);
    // Der Tunnel ganz zuletzt: so kommt ein Zug aus ihm heraus gefahren, statt
    // vor ihm aufzutauchen.
    state.net.nodes.filter((node) => node.type === "spawn").forEach(drawTunnel);
  }

  function handleTap(event) {
    if (state.phase !== "play" || !canvas || !size) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const treffer = state.net.nodes
      .filter((node) => node.type === "switch")
      .map((node) => ({ node, pos: px(node) }))
      .find(({ pos }) => Math.hypot(pos.x - x, pos.y - y) <= Math.max(30, 34 * scale()));
    if (!treffer) return;
    const outs = outgoing(treffer.node.id);
    run.switches[treffer.node.id] = ((run.switches[treffer.node.id] || 0) + 1) % outs.length;
    kids()?.playJingle?.("star");
    kids()?.vibrate?.(12);
    draw();
  }

  // ---------------------------------------------------------------------------
  // Schluss
  // ---------------------------------------------------------------------------
  function resultSpeech(stars, offen) {
    const sterne = stars === 1 ? "einen Stern" : `${stars} Sterne`;
    const fehler = run.verfahren === 0
      ? "Kein Zug ist falsch gefahren."
      : run.verfahren === 1 ? "Ein Zug ist falsch gefahren." : `${run.verfahren} Züge sind falsch gefahren.`;
    return `Level ${state.level.nr} geschafft. Du hast ${sterne}. ${fehler} ${levelsText(offen)}`;
  }

  function finish() {
    stopLoop();
    state.phase = "over";
    const stars = starsFor(run.verfahren);
    const level = state.level;
    recordLevel(level.nr, stars);
    const fertig = doneCount();
    kids()?.playJingle?.("win");
    shell.setCount(fertig);
    shell.showResult({
      label: `Level ${level.nr} geschafft`,
      stars,
      // "angekommen" waere schief: angekommen sind alle, richtig nur diese.
      detail: `${run.richtig} richtig · ${run.verfahren} verfahren`,
      note: { text: levelsText(fertig), done: fertig >= LEVELS_FOR_DONE },
      speech: resultSpeech(stars, fertig),
      onBack: showMenu,
    });
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  shell = shellApi.mount({
    host,
    title: "Weichen-Wirrwarr",
    area: "konzentration",
    accent: "#00A5B5",
    accentDark: "#00707c",
    help: HELP,
    clock: false,
    // Neu starten heisst: dasselbe Level noch einmal, aus der Levelwahl heraus
    // wieder die Levelwahl.
    onRestart: () => (state.phase === "menu" ? showMenu() : startLevel(state.level)),
    // Zurück aus einem Level führt in die Levelwahl, nicht gleich aus dem Spiel
    // heraus. Erst von der Levelwahl aus geht es in die Bereichsauswahl.
    onBack: () => {
      if (state.phase === "menu") return false;
      showMenu();
      return true;
    },
  });

  showMenu();

  // Die Tabelle, das Netz und die Sternregel nach aussen: die Prüfskripte
  // rechnen damit ohne Browser nach, ob jedes Haus erreichbar ist und die zehn
  // Level anwachsen.
  window.LernappWeichen = {
    LEVELS, FARBEN, buildNet, starsFor, LEVELS_FOR_DONE, FIRST_SWITCH_X,
    // Die Züge, die gerade unterwegs sind – als Kopie, nur zum Nachmessen.
    // Der Browsertest prüft damit, dass ein Zug auf jedem Gleisstück gleich
    // schnell fährt, statt auf den langen zu rasen.
    trains: () => (run ? run.trains.map((train) => ({ ...train })) : []),
  };

  window.addEventListener("resize", () => { resizeCanvas(); draw(); });
  window.addEventListener("orientationchange", () => { resizeCanvas(); draw(); });
  window.addEventListener("pagehide", stopLoop);
})();
