/*
 * signal.js – Halt am Signal: bei Grün fahren lassen, bei Rot stillhalten.
 *
 * Aus dem Tunnel links rollt ein Zug auf das Signal zu. Steht es auf Grün,
 * wird angetippt – die Schranke geht hoch, der Zug fährt durch. Steht es auf
 * Rot, wird nicht angetippt, sondern gewartet, bis der Zug von selbst hält;
 * dann springt das Signal um, und er fährt weiter. Fünfundvierzig Sekunden
 * lang, so viele Züge wie möglich richtig.
 *
 * Drei von vier Zügen kommen bei Grün. Das ist Absicht: das Antippen soll
 * zur Gewohnheit werden, und genau diese Gewohnheit muss bei Rot unterdrückt
 * werden. Bei jedem zweiten Zug Rot wäre es nur ein Farbspiel; die Übung
 * liegt im Nicht-Tun, wenn der Finger schon will.
 *
 * Punkte: einen für jeden durchgelassenen grünen und einen für jeden
 * abgewarteten roten Zug. Ein Tipp bei Rot kostet zwei – ohne diesen Preis
 * käme, wer einfach immer tippt, auf drei Viertel der Punkte, und geübt hätte
 * er nichts. Ein grüner Zug, der nicht angetippt wurde, bleibt einfach stehen:
 * kein Punkt, kein Abzug.
 *
 * Bühne, Uhr und Bestenliste kommen aus game-shell.js; die Lok ist die des
 * Kindes vom Startbild.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "signal") return;

  const host = document.querySelector("#sg-stage");
  const shellApi = window.LernappGameShell;
  const cloudApi = window.LernappGameCloud;
  const art = window.LernappTrainArt;
  if (!host || !shellApi || !art) return;

  const kids = () => window.LernappKids || null;

  // ---------------------------------------------------------------------------
  // Regeln
  // ---------------------------------------------------------------------------
  const ROUND_MS = 45000;
  // Wie oft das Signal grün zeigt.
  const GRUEN_ANTEIL = 0.75;
  // So lange rollt der Zug vom Tunnel bis zum Signal – und so lange darf ein
  // grüner Zug angetippt werden. Ein bisschen Nachlauf kommt dazu: wer im
  // letzten Moment tippt, soll nicht leer ausgehen.
  const FAHRT_MS = 900;
  const NACHLAUF_MS = 250;
  // Danach: bei Grün fährt er durch, bei Rot wartet er und fährt dann. Beides
  // dauert gleich lang, damit die Uhr nicht den belohnt, der öfter tippt.
  const WEITER_MS = 480;
  // Ein Tipp bei Rot: der Zug ruckt, und die Pause ist länger als jede andere.
  const FEHLER_MS = 900;
  const FEHLER_KOSTEN = 2;
  // Die Farbe kommt einen Wimpernschlag nach dem Zug: erst rollt er los, dann
  // springt das Signal um. So ist es die Farbe, auf die reagiert wird, nicht
  // das Erscheinen des Zugs.
  const SIGNAL_NACH_MS = 120;
  // Wie viele, sagt das Wagen-Set: fünf im ersten, neun im zweiten (kids.js).
  const RUNS_FOR_DONE = window.LernappKids?.wagonRounds?.() || 5;
  const TOP_COUNT = 5;

  const HELP = [
    "Halt am Signal. Von links kommt ein Zug und fährt auf das Signal zu.",
    "Ist das Signal grün, tippst du – dann geht die Schranke hoch und der Zug fährt durch.",
    "Ist das Signal rot, tippst du nicht. Warte, bis der Zug von selbst hält.",
    "Für jeden grünen Zug, den du durchlässt, und für jeden roten, bei dem du wartest, gibt es einen Punkt.",
    "Tippst du bei Rot, verlierst du zwei Punkte.",
    "Du hast fünfundvierzig Sekunden. Tippe auf Starten, wenn du bereit bist.",
  ].join(" ");

  // ---------------------------------------------------------------------------
  // Bestenliste – lokal und in der Cloud
  // ---------------------------------------------------------------------------
  const store = cloudApi
    ? cloudApi.register({ key: "lernapp.signal", empty: { runs: 0, scores: [] }, merge: cloudApi.mergeScores(TOP_COUNT) })
    : {
      read: () => ({ runs: 0, scores: [] }),
      write(data) { return data; },
      update(fn) { return fn(this.read()); },
      onChange() { return () => {}; },
    };

  function recordRun(score) {
    return store.update((old) => ({
      runs: (Number(old.runs) || 0) + 1,
      scores: [...(old.scores || []), score].sort((a, b) => b - a).slice(0, TOP_COUNT),
    }));
  }

  // Punkte aus den vier Ausgängen – nie unter null.
  function punkteFuer({ durch = 0, gewartet = 0, beiRot = 0 }) {
    return Math.max(0, durch + gewartet - beiRot * FEHLER_KOSTEN);
  }

  // ---------------------------------------------------------------------------
  // Bilder
  // ---------------------------------------------------------------------------
  function readLoco() {
    try {
      const raw = localStorage.getItem("lernapp.train.loco");
      return art.locoConfig(raw ? JSON.parse(raw) : {});
    } catch { return art.locoConfig({}); }
  }

  function lokBild() {
    return art.el("svg", {
      viewBox: `0 20 ${art.LOCO_W} ${art.GROUND - 20}`,
      class: "sg-lok-bild",
      "aria-hidden": "true",
    }, [art.buildLoco(readLoco())]);
  }

  // Der Signalmast: zwei Lichter, oben Rot, unten Grün. Welches leuchtet, sagt
  // die Klasse am Element (is-gruen, is-rot); ohne beides ist er dunkel.
  function signalBild() {
    return art.el("svg", { viewBox: "0 0 60 150", class: "sg-signal-bild", "aria-hidden": "true" }, [
      art.el("rect", { x: 26, y: 70, width: 8, height: 80, rx: 3, fill: "#3c4652" }),
      art.el("rect", { x: 14, y: 138, width: 32, height: 12, rx: 4, fill: "#2b3440" }),
      art.el("rect", { x: 8, y: 2, width: 44, height: 74, rx: 14, fill: "#2b3440" }),
      art.el("circle", { class: "sg-licht sg-licht-rot", cx: 30, cy: 22, r: 13 }),
      art.el("circle", { class: "sg-licht sg-licht-gruen", cx: 30, cy: 54, r: 13 }),
    ]);
  }

  // Die Schranke: ein Balken mit Streifen, der am Pfosten hochklappt.
  function schrankeBild() {
    return art.el("svg", { viewBox: "0 0 140 60", class: "sg-schranke-bild", "aria-hidden": "true" }, [
      art.el("rect", { x: 4, y: 30, width: 14, height: 30, rx: 3, fill: "#3c4652" }),
      art.el("g", { class: "sg-balken" }, [
        art.el("rect", { x: 6, y: 26, width: 132, height: 12, rx: 6, fill: "#fff8ea" }),
        art.el("path", { d: "M30 26 l-8 12 M56 26 l-8 12 M82 26 l-8 12 M108 26 l-8 12 M134 26 l-8 12", fill: "none", stroke: "#e2694f", "stroke-width": 6 }),
        art.el("circle", { cx: 11, cy: 32, r: 6, fill: "#2b3440" }),
      ]),
    ]);
  }

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------
  const state = { phase: "intro", farbe: null, offen: false, durch: 0, gewartet: 0, beiRot: 0, verpasst: 0 };
  let shell = null;
  let strecke = null;
  let zug = null;
  let signal = null;
  let schranke = null;
  let stepTimer = null;

  function clearStep() {
    if (stepTimer) { window.clearTimeout(stepTimer); stepTimer = null; }
  }

  function later(ms, fn) {
    clearStep();
    stepTimer = window.setTimeout(() => { stepTimer = null; fn(); }, ms);
  }

  function setSignal(farbe) {
    state.farbe = farbe;
    signal.classList.toggle("is-gruen", farbe === "gruen");
    signal.classList.toggle("is-rot", farbe === "rot");
    signal.setAttribute("aria-label", farbe === "gruen" ? "Signal grün" : farbe === "rot" ? "Signal rot" : "Signal aus");
  }

  function setZug(wo) {
    zug.className = `sg-zug is-${wo}`;
  }

  function setPunkte() {
    shell.setCount(punkteFuer(state));
  }

  // ---------------------------------------------------------------------------
  // Ein Zug
  // ---------------------------------------------------------------------------
  function naechsterZug() {
    if (state.phase !== "play") return;
    state.offen = false;
    schranke.classList.remove("is-offen");
    setSignal(null);
    // Neu in den Tunnel, ohne Fahrt, dann losrollen.
    setZug("tunnel");
    void zug.offsetWidth;
    setZug("fahrt");
    const farbe = Math.random() < GRUEN_ANTEIL ? "gruen" : "rot";
    later(SIGNAL_NACH_MS, () => {
      setSignal(farbe);
      state.offen = true;
      later(FAHRT_MS + NACHLAUF_MS - SIGNAL_NACH_MS, () => zugAngekommen());
    });
  }

  // Der Zug steht am Signal, ohne dass getippt wurde.
  function zugAngekommen() {
    if (state.phase !== "play") return;
    state.offen = false;
    if (state.farbe === "rot") {
      // Richtig gewartet: das Signal springt auf Grün, und er fährt weiter.
      state.gewartet += 1;
      setPunkte();
      kids()?.playJingle?.("star");
      setSignal("gruen");
      schranke.classList.add("is-offen");
      setZug("durch");
      later(WEITER_MS, naechsterZug);
      return;
    }
    // Grün, aber nicht getippt: der Zug bleibt stehen und wird zurückgezogen.
    state.verpasst += 1;
    setZug("halt");
    later(WEITER_MS, naechsterZug);
  }

  function tipp() {
    if (state.phase !== "play" || !state.offen) return;
    state.offen = false;
    if (state.farbe === "gruen") {
      state.durch += 1;
      setPunkte();
      kids()?.playJingle?.("correct");
      kids()?.vibrate?.(16);
      schranke.classList.add("is-offen");
      setZug("durch");
      later(WEITER_MS, naechsterZug);
      return;
    }
    // Bei Rot getippt: ein Ruck, ein Blitz, zwei Punkte weg.
    state.beiRot += 1;
    setPunkte();
    kids()?.playJingle?.("retry");
    setZug("ruck");
    strecke.classList.remove("is-fehler");
    void strecke.offsetWidth;
    strecke.classList.add("is-fehler");
    later(FEHLER_MS, naechsterZug);
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  function bauStrecke() {
    strecke = shell.el("div", "sg-strecke");
    const tunnel = shell.el("div", "sg-tunnel");
    const gleis = shell.el("div", "sg-gleis");
    zug = shell.el("div", "sg-zug is-tunnel");
    zug.append(lokBild());
    signal = shell.el("div", "sg-signal");
    signal.setAttribute("role", "img");
    signal.append(signalBild());
    schranke = shell.el("div", "sg-schranke");
    schranke.append(schrankeBild());
    strecke.append(gleis, zug, tunnel, schranke, signal);
    return strecke;
  }

  function showIntro() {
    clearStep();
    shell.stopClock();
    shell.closeOverlay();
    shell.setPhase("intro");
    Object.assign(state, { phase: "intro", farbe: null, offen: false, durch: 0, gewartet: 0, beiRot: 0, verpasst: 0 });
    shell.setCount(0);

    shell.clear();
    shell.play.append(shell.el("p", "cm-prompt", "Grün: tippen. Rot: warten."));
    shell.play.append(bauStrecke());
    // Ein Beispiel steht schon da: der Zug vor dem Signal, das Signal grün.
    setZug("halt");
    setSignal("gruen");

    const start = shell.el("button", "cm-start", "Starten");
    start.type = "button";
    start.addEventListener("click", beginRound);
    shell.play.append(start);
  }

  function beginRound() {
    clearStep();
    state.phase = "play";
    shell.setPhase("play");
    shell.setCount(0);

    shell.clear();
    shell.play.append(shell.el("p", "cm-prompt", "Grün: tippen. Rot: warten."));
    shell.play.append(bauStrecke());
    const knopf = shell.el("button", "sg-knopf");
    knopf.type = "button";
    knopf.setAttribute("aria-label", "Durchlassen");
    knopf.append(art.el("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, [
      art.el("path", { d: "M5 12h13M12 5l7 7-7 7", fill: "none", stroke: "currentColor", "stroke-width": 3.2, "stroke-linecap": "round", "stroke-linejoin": "round" }),
    ]));
    knopf.addEventListener("click", tipp);
    shell.play.append(knopf);

    shell.startClock(ROUND_MS, finish);
    later(400, naechsterZug);
  }

  function runsText(runs) {
    const left = RUNS_FOR_DONE - runs;
    if (left <= 0) return "Dieses Spiel ist geschafft – der Wagen ist gebaut.";
    return left === 1
      ? "Noch eine Runde bis zum fertigen Wagen."
      : `Noch ${left} Runden bis zum fertigen Wagen.`;
  }

  function resultSpeech(punkte, runs) {
    const rot = state.beiRot === 0
      ? "Bei Rot hast du nie getippt – super gewartet."
      : state.beiRot === 1 ? "Einmal hast du bei Rot getippt." : `${state.beiRot}-mal hast du bei Rot getippt.`;
    return `Du hast ${punkte} Punkte: ${state.durch} grüne Züge durchgelassen und bei ${state.gewartet} roten gewartet. ${rot} ${runsText(runs)}`;
  }

  function finish() {
    clearStep();
    state.phase = "over";
    state.offen = false;
    const punkte = punkteFuer(state);
    const next = recordRun(punkte);
    kids()?.playJingle?.("win");
    shell.showResult({
      label: "Deine Punkte",
      points: punkte,
      detail: `${state.durch} durchgelassen · ${state.gewartet} gewartet · ${state.beiRot} bei Rot`,
      scores: next.scores,
      top: TOP_COUNT,
      note: { text: runsText(next.runs), done: next.runs >= RUNS_FOR_DONE },
      speech: resultSpeech(punkte, next.runs),
    });
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  shell = shellApi.mount({
    host,
    title: "Halt am Signal",
    area: "konzentration",
    accent: "#00A5B5",
    accentDark: "#00707c",
    help: HELP,
    onRestart: showIntro,
  });

  showIntro();

  // --- Tippen ------------------------------------------------------------------
  // Getippt wird auf der Strecke oder dem Knopf – nicht auf der ganzen Bühne,
  // sonst zählte jeder Griff zum Lautsprecher oder zu den Knöpfen oben als
  // "Durchlassen".
  host.addEventListener("pointerdown", (event) => {
    if (state.phase !== "play" || !strecke) return;
    if (!strecke.contains(event.target)) return;
    event.preventDefault();
    tipp();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== " " && event.key !== "Enter") return;
    if (document.activeElement?.tagName === "BUTTON") return;
    event.preventDefault();
    if (state.phase === "intro") beginRound();
    else if (state.phase === "play") tipp();
  });

  window.addEventListener("pagehide", clearStep);

  window.LernappSignal = { ROUND_MS, GRUEN_ANTEIL, FAHRT_MS, NACHLAUF_MS, WEITER_MS, FEHLER_MS, FEHLER_KOSTEN, RUNS_FOR_DONE, punkteFuer, state };
})();
