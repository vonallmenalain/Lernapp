/*
 * zahlengleis.js – Wo hält der Zug? Der Zahlenstrahl als Gleis.
 *
 * Ein Gleis quer über das Bild, links der Bahnhof 0, rechts der Bahnhof 5, 10
 * oder 20. Oben steht eine Zahl. Das Kind schiebt seine Lok dorthin, wo diese
 * Zahl auf dem Gleis liegt, und lässt los – oder tippt die Stelle einfach an.
 * Danach fährt ein Schild an die richtige Stelle und zeigt, wie nah es war.
 * Zehn Zahlen je Runde, bis zu drei Punkte je Zahl.
 *
 * Kein Zeitdruck und kein Ende nach einem Fehler: die Aufgabe ist das
 * Schätzen, und jede Antwort zeigt die richtige Stelle – das ist der Moment,
 * in dem sich die Zahlenreihe im Kopf festsetzt. Wer daneben liegt, sieht
 * wohin, und bekommt die nächste Zahl.
 *
 * Die Runde wird von selbst schwerer: die ersten Zahlen liegen auf einem Gleis
 * bis fünf mit einer Marke an jeder Zahl – da wird gezählt. Dann bis zehn mit
 * Marken nur an den Enden und in der Mitte – da wird geschätzt. Zuletzt bis
 * zwanzig. Wer dort daneben liegt, verliert nichts als Punkte; die Runde geht
 * zu Ende wie jede andere. Eine Wahl zwischen Leicht und Schwer gibt es nicht:
 * ein Vierjähriges könnte sie nicht treffen, und so bekommt jedes Kind in jeder
 * Runde die leichten und die schweren Zahlen.
 *
 * Bühne, Knöpfe und Bestenliste kommen aus game-shell.js; die Lok ist die des
 * Kindes, so wie sie auf dem Startbild steht.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "numberline") return;

  const host = document.querySelector("#zg-stage");
  const shellApi = window.LernappGameShell;
  const cloudApi = window.LernappGameCloud;
  const art = window.LernappTrainArt;
  if (!host || !shellApi || !art) return;

  const kids = () => window.LernappKids || null;

  // ---------------------------------------------------------------------------
  // Regeln
  // ---------------------------------------------------------------------------
  // Drei Gleise: bis wohin sie gehen und wo Marken stehen (alle `marken`
  // Zahlen eine). Die Enden tragen immer eine Marke mit Zahl.
  const STUFEN = [
    { bis: 5, marken: 1 },
    { bis: 10, marken: 5 },
    { bis: 20, marken: 10 },
  ];

  // Welches Gleis die zehn Zahlen einer Runde bekommen: drei auf dem kurzen,
  // vier auf dem mittleren, drei auf dem langen.
  const PLAN = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2];

  // Wie weit die Lok daneben stehen darf – in Zahlen, nicht in Bildpunkten,
  // weil ein Finger auf dem langen Gleis mehr Zahlen überdeckt als auf dem
  // kurzen. Innerhalb von `genau` gibt es drei Punkte, bis `knapp` zwei, bis
  // `nah` einen, sonst keinen.
  const TOLERANZ = [
    { genau: 0.35, knapp: 0.8, nah: 1.5 },
    { genau: 0.5, knapp: 1.2, nah: 2.5 },
    { genau: 1, knapp: 2.5, nah: 5 },
  ];

  const ZAHLEN_JE_RUNDE = PLAN.length;
  const PUNKTE_JE_ZAHL = 3;
  // So lange steht das Schild an der richtigen Stelle, bevor die nächste Zahl
  // kommt: lang genug zum Hinschauen, kurz genug, dass keine Runde zäh wird.
  const ZEIGEN_MS = 1500;
  // Wie viele, sagt das Wagen-Set: fünf im ersten, neun im zweiten (kids.js).
  const RUNS_FOR_DONE = window.LernappKids?.wagonRounds?.() || 5;
  const TOP_COUNT = 5;

  const HELP = [
    "Wo hält der Zug? Unten siehst du ein Gleis. Links ist der Bahnhof Null, rechts der letzte Bahnhof.",
    "Oben steht eine Zahl. Schieb die Lok mit dem Finger dorthin, wo diese Zahl auf dem Gleis liegt, und lass los.",
    "Du kannst die Stelle auch einfach antippen.",
    "Danach zeigt ein Schild, wo die Zahl wirklich liegt.",
    "Je näher du dran bist, desto mehr Punkte gibt es: bis zu drei für jede Zahl.",
    "Zehn Zahlen, dann ist die Runde vorbei. Du hast so viel Zeit, wie du willst.",
  ].join(" ");

  // ---------------------------------------------------------------------------
  // Bestenliste – lokal und in der Cloud
  // ---------------------------------------------------------------------------
  const store = cloudApi
    ? cloudApi.register({ key: "lernapp.zahlengleis", empty: { runs: 0, scores: [] }, merge: cloudApi.mergeScores(TOP_COUNT) })
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

  // ---------------------------------------------------------------------------
  // Zahlen und Punkte
  // ---------------------------------------------------------------------------
  // Nie die Enden – die stehen angeschrieben da – und nie zweimal dieselbe
  // hintereinander.
  function zahlFuer(stufe, vorher = null) {
    const { bis } = STUFEN[stufe];
    const moeglich = [];
    for (let n = 1; n < bis; n += 1) if (n !== vorher) moeglich.push(n);
    return moeglich[Math.floor(Math.random() * moeglich.length)];
  }

  function punkteFuer(abweichung, stufe) {
    const t = TOLERANZ[stufe];
    const weit = Math.abs(abweichung);
    if (weit <= t.genau) return 3;
    if (weit <= t.knapp) return 2;
    if (weit <= t.nah) return 1;
    return 0;
  }

  // ---------------------------------------------------------------------------
  // Die Lok des Kindes
  // ---------------------------------------------------------------------------
  // Dieselbe Lok wie auf dem Startbild: so ist es der eigene Zug, der hier
  // seinen Halt sucht. Gelesen wird, was train-home.js abgelegt hat; ohne
  // Eintrag fährt die Lok, mit der jedes Kind anfängt.
  function readLoco() {
    try {
      const raw = localStorage.getItem("lernapp.train.loco");
      return art.locoConfig(raw ? JSON.parse(raw) : {});
    } catch { return art.locoConfig({}); }
  }

  function lokBild() {
    // Der Ausschnitt lässt oben Platz für Kamin und Wimpel und endet unten an
    // den Rädern, damit die Lok auf dem Gleis steht und nicht darüber schwebt.
    return art.el("svg", {
      viewBox: `0 20 ${art.LOCO_W} ${art.GROUND - 20}`,
      class: "zg-lok-bild",
      "aria-hidden": "true",
    }, [art.buildLoco(readLoco())]);
  }

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------
  const state = {
    phase: "aufgabe", index: 0, stufe: 0, zahl: 0, vorher: null,
    p: 0, punkte: 0, genau: 0, knapp: 0, nah: 0, daneben: 0, drag: false,
  };
  let shell = null;
  let schild = null;
  let gleis = null;
  let lok = null;
  let ziel = null;
  let zielZahl = null;
  let plus = null;
  let marken = null;
  let stepTimer = null;
  let releaseHelp = null;

  function clearStep() {
    if (stepTimer) { window.clearTimeout(stepTimer); stepTimer = null; }
  }

  // ---------------------------------------------------------------------------
  // Das Gleis
  // ---------------------------------------------------------------------------
  // Alles auf dem Gleis steht an einem Anteil zwischen 0 und 1 der Strecke; die
  // Ränder links und rechts sind im CSS als --zg-rand abgezogen. So rechnet das
  // Spiel nie in Bildpunkten, und das Gleis darf so breit sein, wie die Bühne
  // hergibt.
  function baueMarken(stufe) {
    marken.innerHTML = "";
    const { bis, marken: alle } = STUFEN[stufe];
    for (let n = 0; n <= bis; n += alle) {
      const ende = n === 0 || n === bis;
      const marke = shell.el("span", `zg-marke${ende ? " is-bahnhof" : ""}`);
      marke.style.setProperty("--zg-p", String(n / bis));
      if (ende) {
        const bahnhof = shell.el("span", "zg-bahnhof");
        bahnhof.append(art.el("svg", { viewBox: "0 0 40 34", "aria-hidden": "true" }, [
          art.el("path", { d: "M4 16 L20 4 L36 16 V32 H4 Z", fill: "#fff8ea", stroke: "#8a3a2c", "stroke-width": 2.5, "stroke-linejoin": "round" }),
          art.el("rect", { x: 15, y: 20, width: 10, height: 12, fill: "#8a3a2c" }),
        ]));
        const zahl = shell.el("span", "zg-bahnhof-zahl", String(n));
        bahnhof.append(zahl);
        marke.append(bahnhof);
      } else if (bis <= 5) {
        // Auf dem kurzen Gleis steht an jeder Marke die Zahl – hier wird
        // gezählt, nicht geschätzt.
        marke.append(shell.el("span", "zg-marke-zahl", String(n)));
      }
      marken.append(marke);
    }
    gleis.setAttribute("aria-label", `Gleis von 0 bis ${bis}`);
  }

  function setLok(p, sofort = false) {
    state.p = Math.max(0, Math.min(1, p));
    lok.classList.toggle("is-sofort", sofort);
    lok.style.setProperty("--zg-p", String(state.p));
  }

  // Aus der Fingerstelle wird ein Anteil der Strecke.
  function anteilVon(clientX) {
    const box = gleis.getBoundingClientRect();
    const rand = parseFloat(getComputedStyle(gleis).getPropertyValue("--zg-rand")) || 0;
    const breite = Math.max(1, box.width - 2 * rand);
    return (clientX - box.left - rand) / breite;
  }

  // ---------------------------------------------------------------------------
  // Ablauf
  // ---------------------------------------------------------------------------
  function startRun() {
    clearStep();
    releaseHelp?.();
    releaseHelp = null;
    shell.closeOverlay();
    shell.setPhase("play");
    Object.assign(state, { phase: "aufgabe", index: 0, vorher: null, punkte: 0, genau: 0, knapp: 0, nah: 0, daneben: 0, drag: false });
    shell.setCount(0);

    shell.clear();
    schild = shell.el("div", "zg-schild");
    schild.setAttribute("role", "status");
    schild.setAttribute("aria-live", "polite");
    const fortschritt = shell.el("div", "zg-fortschritt");
    fortschritt.setAttribute("aria-hidden", "true");
    for (let i = 0; i < ZAHLEN_JE_RUNDE; i += 1) fortschritt.append(shell.el("span", "zg-punkt"));

    gleis = shell.el("div", "zg-gleis");
    gleis.setAttribute("role", "slider");
    gleis.setAttribute("tabindex", "0");
    marken = shell.el("div", "zg-marken");
    const schiene = shell.el("div", "zg-schiene");
    ziel = shell.el("div", "zg-ziel");
    zielZahl = shell.el("span", "zg-ziel-zahl");
    ziel.append(zielZahl);
    ziel.hidden = true;
    lok = shell.el("div", "zg-lok");
    lok.append(lokBild());
    plus = shell.el("span", "zg-plus");
    plus.hidden = true;
    lok.append(plus);
    gleis.append(schiene, marken, ziel, lok);

    shell.play.append(schild, fortschritt, gleis);

    naechsteZahl();
  }

  function naechsteZahl() {
    clearStep();
    state.phase = "aufgabe";
    state.stufe = PLAN[state.index];
    state.zahl = zahlFuer(state.stufe, state.vorher);
    state.vorher = state.zahl;
    const { bis } = STUFEN[state.stufe];

    baueMarken(state.stufe);
    ziel.hidden = true;
    plus.hidden = true;
    lok.classList.remove("is-genau", "is-knapp", "is-nah", "is-daneben");
    setLok(0);

    schild.textContent = String(state.zahl);
    schild.classList.remove("is-neu");
    void schild.offsetWidth;
    schild.classList.add("is-neu");
    gleis.setAttribute("aria-valuemin", "0");
    gleis.setAttribute("aria-valuemax", String(bis));
    gleis.setAttribute("aria-valuenow", "0");
    gleis.setAttribute("aria-valuetext", `Lok steht bei 0. Gesucht ist ${state.zahl}.`);
    shell.play.querySelectorAll(".zg-punkt").forEach((punkt, i) => punkt.classList.toggle("is-dran", i === state.index));

    // Der Lautsprecher sagt jetzt die Zahl – wer sie nicht lesen kann, hört
    // sie. Die Spielregeln bleiben darunter liegen und kommen zurück, sobald
    // die Runde vorbei ist.
    releaseHelp?.();
    releaseHelp = kids()?.pushHelp?.(
      `Die Zahl ist ${state.zahl}. Das Gleis geht von null bis ${bis}. Schieb die Lok dorthin, wo die ${state.zahl} liegt, und lass los.`,
    ) || null;
  }

  function antwort(p) {
    if (state.phase !== "aufgabe") return;
    state.phase = "zeigen";
    state.drag = false;
    lok.classList.remove("is-drag");
    setLok(p);
    const { bis } = STUFEN[state.stufe];
    const wert = state.p * bis;
    const punkte = punkteFuer(wert - state.zahl, state.stufe);
    const wie = ["daneben", "nah", "knapp", "genau"][punkte];
    state[wie] += 1;
    state.punkte += punkte;
    shell.setCount(state.punkte);

    // Das Schild fährt an die richtige Stelle; die Lok färbt sich danach, wie
    // nah sie steht.
    zielZahl.textContent = String(state.zahl);
    ziel.className = `zg-ziel is-${wie}`;
    ziel.style.setProperty("--zg-p", String(state.zahl / bis));
    ziel.hidden = false;
    lok.classList.add(`is-${wie}`);
    plus.textContent = punkte ? `+${punkte}` : "0";
    plus.className = `zg-plus is-${wie}`;
    plus.hidden = false;
    gleis.setAttribute("aria-valuenow", wert.toFixed(1));
    gleis.setAttribute("aria-valuetext", `Lok steht bei ${wert.toFixed(1)}, gesucht war ${state.zahl}: ${punkte} Punkte.`);

    if (punkte >= 2) { kids()?.playJingle?.("correct"); kids()?.vibrate?.(16); }
    else if (punkte === 1) kids()?.playJingle?.("star");
    else kids()?.playJingle?.("retry");

    stepTimer = window.setTimeout(() => {
      state.index += 1;
      if (state.index >= ZAHLEN_JE_RUNDE) finish();
      else naechsteZahl();
    }, ZEIGEN_MS);
  }

  function runsText(runs) {
    const left = RUNS_FOR_DONE - runs;
    if (left <= 0) return "Dieses Spiel ist geschafft – der Wagen ist gebaut.";
    return left === 1
      ? "Noch eine Runde bis zum fertigen Wagen."
      : `Noch ${left} Runden bis zum fertigen Wagen.`;
  }

  function resultSpeech(punkte, runs) {
    const treffer = state.genau === 0 ? "keine Zahl" : state.genau === 1 ? "eine Zahl" : `${state.genau} Zahlen`;
    return `Du hast ${punkte} von ${ZAHLEN_JE_RUNDE * PUNKTE_JE_ZAHL} Punkten und ${treffer} genau getroffen. ${runsText(runs)}`;
  }

  function finish() {
    clearStep();
    state.phase = "over";
    releaseHelp?.();
    releaseHelp = null;
    const punkte = state.punkte;
    const next = recordRun(punkte);
    kids()?.playJingle?.("win");
    shell.showResult({
      label: "Deine Punkte",
      points: punkte,
      detail: `${state.genau} genau · ${state.knapp} knapp · ${state.nah + state.daneben} daneben`,
      scores: next.scores,
      top: TOP_COUNT,
      note: { text: runsText(next.runs), done: next.runs >= RUNS_FOR_DONE },
      speech: resultSpeech(punkte, next.runs),
    });
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  // Kein Erklärbild und kein Startknopf: die erste Zahl steht da, die Lok
  // wartet bei null. Was zu tun ist, sagt der Lautsprecher.
  shell = shellApi.mount({
    host,
    title: "Wo hält der Zug?",
    area: "zahlbuchstabe",
    accent: "#E8543F",
    accentDark: "#a8321f",
    help: HELP,
    clock: false,
    onRestart: startRun,
  });

  startRun();

  // --- Schieben und Tippen ---------------------------------------------------
  // Ein Tipp auf das Gleis setzt die Lok dorthin und zählt schon als Antwort;
  // wer sie lieber schiebt, hält den Finger unten – die Lok folgt ihm – und
  // antwortet mit dem Loslassen. Beides ist ein Griff, kein zweiter Knopf.
  host.addEventListener("pointerdown", (event) => {
    if (state.phase !== "aufgabe" || !gleis || !gleis.contains(event.target)) return;
    event.preventDefault();
    state.drag = true;
    lok.classList.add("is-drag");
    try { gleis.setPointerCapture(event.pointerId); } catch { /* egal */ }
    setLok(anteilVon(event.clientX), true);
  });

  host.addEventListener("pointermove", (event) => {
    if (!state.drag || state.phase !== "aufgabe") return;
    setLok(anteilVon(event.clientX), true);
  });

  host.addEventListener("pointerup", (event) => {
    if (!state.drag) return;
    antwort(anteilVon(event.clientX));
  });

  host.addEventListener("pointercancel", () => {
    if (!state.drag) return;
    state.drag = false;
    lok.classList.remove("is-drag");
  });

  // --- Tastatur ----------------------------------------------------------------
  // Pfeile schieben die Lok um ein Viertel einer Zahl, Enter oder Leertaste
  // lassen sie halten.
  document.addEventListener("keydown", (event) => {
    if (state.phase !== "aufgabe") return;
    const { bis } = STUFEN[state.stufe];
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const schritt = 1 / (bis * 4);
      setLok(state.p + (event.key === "ArrowRight" ? schritt : -schritt), true);
      gleis.setAttribute("aria-valuenow", (state.p * bis).toFixed(2));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      if (document.activeElement?.tagName === "BUTTON") return;
      event.preventDefault();
      antwort(state.p);
    }
  });

  window.addEventListener("pagehide", clearStep);

  window.LernappZahlengleis = { STUFEN, PLAN, TOLERANZ, ZAHLEN_JE_RUNDE, PUNKTE_JE_ZAHL, RUNS_FOR_DONE, zahlFuer, punkteFuer, state };
})();
