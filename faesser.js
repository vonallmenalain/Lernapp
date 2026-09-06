/*
 * faesser.js – Fässer stapeln: der Turm von Hanoi mit dem Kran.
 *
 * Drei Abstellgleise, Fässer in verschiedenen Grössen. Der Kran hebt immer nur
 * das oberste Fass eines Gleises, und ein grösseres darf nie auf einem
 * kleineren landen. Alle Fässer sollen auf das Gleis mit der Fahne. Das ist
 * die ganze Regel – und sie zwingt zum Vorausdenken: um das grosse Fass zu
 * bewegen, müssen die kleinen erst woandershin, und zwar in der richtigen
 * Reihenfolge.
 *
 * Bedienung in zwei Tipps: erst das Gleis, von dem der Kran nimmt (das
 * oberste Fass hängt dann am Haken), dann das Gleis, auf das er stellt. Ein
 * Tipp auf dasselbe Gleis stellt es zurück, ohne dass es zählt. Geht es
 * nicht – das Fass darunter ist kleiner –, wackelt das Fass am Haken, und
 * der Kran wartet auf ein anderes Gleis.
 *
 * Zehn Level mit drei bis fünf Fässern und wechselnden Aufstellungen. Die
 * Bestmarke je Level ist gerechnet, nicht geschätzt: eine Breitensuche über
 * alle Stellungen liefert das Minimum, und scripts/validate-faesser.mjs
 * rechnet jede Zahl in der Tabelle nach. Drei Sterne für das Minimum, zwei bis
 * anderthalb Minimum, sonst einer – geschafft ist geschafft.
 *
 * Bühne, Knöpfe und Bestenliste kommen aus game-shell.js.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "barrels") return;

  const host = document.querySelector("#fs-stage");
  const shellApi = window.LernappGameShell;
  const cloudApi = window.LernappGameCloud;
  const art = window.LernappTrainArt;
  if (!host || !shellApi || !art) return;

  const kids = () => window.LernappKids || null;

  // ---------------------------------------------------------------------------
  // Die zehn Level
  // ---------------------------------------------------------------------------
  // n = Zahl der Fässer (1 ist das kleinste), start = die drei Gleise von
  // unten nach oben, ziel = das Gleis mit der Fahne, optimum = die wenigsten
  // Züge, in denen es geht (nachgerechnet vom Prüfskript).
  //
  // Nicht immer steht der volle Turm links: aus derselben Regel werden so ganz
  // verschiedene Aufgaben, und die ersten sind kürzer als der klassische Turm
  // aus drei – vier Züge statt sieben.
  const LEVELS = [
    { nr: 1, n: 3, start: [[3], [2, 1], []], ziel: 2, optimum: 4 },
    { nr: 2, n: 3, start: [[3, 1], [2], []], ziel: 2, optimum: 5 },
    { nr: 3, n: 3, start: [[3, 2, 1], [], []], ziel: 2, optimum: 7 },
    { nr: 4, n: 3, start: [[3, 2, 1], [], []], ziel: 1, optimum: 7 },
    { nr: 5, n: 4, start: [[4], [3, 2, 1], []], ziel: 2, optimum: 8 },
    { nr: 6, n: 4, start: [[4, 2], [3], [1]], ziel: 2, optimum: 10 },
    { nr: 7, n: 4, start: [[4, 3, 2, 1], [], []], ziel: 2, optimum: 15 },
    { nr: 8, n: 4, start: [[4, 3], [2, 1], []], ziel: 2, optimum: 15 },
    { nr: 9, n: 5, start: [[5], [4, 3, 2, 1], []], ziel: 2, optimum: 16 },
    { nr: 10, n: 5, start: [[5, 4, 3, 2, 1], [], []], ziel: 2, optimum: 31 },
  ];

  // Wie viele, sagt das Wagen-Set: fünf im ersten, neun im zweiten (kids.js).
  const LEVELS_FOR_DONE = window.LernappKids?.wagonRounds?.() || 5;

  // Jede Grösse hat ihre Farbe: fünf Fässer in einem Holzton wären beim
  // dritten Level nur noch Stufen einer Pyramide, so sind es fünf Dinge.
  const FARBEN = ["#ffd166", "#ff9f1c", "#ef476f", "#4285f4", "#8338ec"];

  // So lange fährt die Laufkatze von einem Gleis zum nächsten – dieselbe Zeit
  // wie der Übergang in styles.css, damit das Fass genau dann landet, wenn der
  // Kran über dem Gleis steht.
  const FAHRT_MS = 300;

  const HELP = [
    "Fässer stapeln. Es gibt drei Gleise, auf einem stehen Fässer.",
    "Alle Fässer sollen auf das Gleis mit der Fahne.",
    "Tippe auf ein Gleis: der Kran hebt das oberste Fass hoch.",
    "Tippe auf ein anderes Gleis: der Kran stellt es dort ab.",
    "Aber: ein grosses Fass darf nie auf einem kleinen stehen.",
    "Je weniger Züge du brauchst, desto mehr Sterne bekommst du.",
  ].join(" ");

  // ---------------------------------------------------------------------------
  // Fortschritt – lokal und in der Cloud
  // ---------------------------------------------------------------------------
  const store = cloudApi
    ? cloudApi.register({ key: "lernapp.faesser", empty: { best: {} }, merge: cloudApi.mergeLevels })
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

  // Drei Sterne für das Minimum, zwei bis anderthalb Minimum, sonst einer.
  function starsFor(zuege, optimum) {
    if (zuege <= optimum) return 3;
    if (zuege <= Math.ceil(optimum * 1.5)) return 2;
    return 1;
  }

  // ---------------------------------------------------------------------------
  // Die Regel, ohne Bild
  // ---------------------------------------------------------------------------
  function erlaubt(stapel, von, nach) {
    if (von === nach || !stapel[von].length) return false;
    const fass = stapel[von][stapel[von].length - 1];
    const ziel = stapel[nach];
    return !ziel.length || ziel[ziel.length - 1] > fass;
  }

  function geschafft(stapel, level) {
    return stapel[level.ziel].length === level.n;
  }

  // Die wenigsten Züge von einer Stellung bis "alle auf dem Zielgleis":
  // Breitensuche über alle erreichbaren Stellungen. Bei fünf Fässern sind das
  // 243 – das rechnet auch ein altes Handy im Nu.
  function optimum(level) {
    const key = (st) => st.map((gleis) => gleis.join(",")).join("|");
    const seen = new Map([[key(level.start), 0]]);
    const queue = [level.start.map((gleis) => [...gleis])];
    while (queue.length) {
      const st = queue.shift();
      const d = seen.get(key(st));
      if (geschafft(st, level)) return d;
      for (let von = 0; von < 3; von += 1) {
        for (let nach = 0; nach < 3; nach += 1) {
          if (!erlaubt(st, von, nach)) continue;
          const next = st.map((gleis) => [...gleis]);
          next[nach].push(next[von].pop());
          const k = key(next);
          if (!seen.has(k)) { seen.set(k, d + 1); queue.push(next); }
        }
      }
    }
    return -1;
  }

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------
  const state = { phase: "menu", level: null };
  let run = null;
  let shell = null;
  let platz = null;
  let laufkatze = null;
  let haken = null;
  let gleise = [];
  let stepTimer = null;

  function clearStep() {
    if (stepTimer) { window.clearTimeout(stepTimer); stepTimer = null; }
  }

  // ---------------------------------------------------------------------------
  // Levelwahl
  // ---------------------------------------------------------------------------
  function showMenu() {
    clearStep();
    run = null;
    shell.closeOverlay();
    shell.setPhase("menu");
    state.phase = "menu";
    shell.setCount(doneCount());

    shell.clear();
    shell.play.append(shell.el("p", "cm-prompt", "Welches Level möchtest du stapeln?"));

    const grid = shell.el("div", "fs-levels");
    LEVELS.forEach((level) => {
      const button = shell.el("button", "fs-level");
      button.type = "button";
      const stars = bestStars(level.nr);
      button.setAttribute("aria-label",
        `Level ${level.nr}: ${level.n} Fässer, Bestmarke ${level.optimum} Züge. ${stars ? `${stars} von 3 Sternen.` : "Noch nicht gestapelt."}`);
      button.append(shell.el("span", "fs-level-nr", String(level.nr)));

      // Die Fässer des Levels als kleiner Turm: so ist vor dem Start zu sehen,
      // wie viele es sind – ohne dass ein Kind eine Zahl lesen muss.
      const turm = shell.el("span", "fs-level-turm");
      for (let k = level.n; k >= 1; k -= 1) {
        const fass = shell.el("span", "fs-level-fass");
        fass.style.width = `${30 + k * 13}%`;
        fass.style.background = FARBEN[k - 1];
        turm.append(fass);
      }
      button.append(turm);

      const row = shell.el("span", "fs-level-stars");
      for (let i = 0; i < 3; i += 1) row.append(shell.el("span", `fs-level-star${i < stars ? " is-on" : ""}`, "★"));
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
  function fassNode(groesse) {
    const fass = shell.el("span", "fs-fass");
    fass.dataset.groesse = String(groesse);
    fass.style.setProperty("--fs-groesse", String(groesse));
    fass.style.setProperty("--fs-farbe", FARBEN[groesse - 1]);
    fass.setAttribute("aria-hidden", "true");
    return fass;
  }

  function fahne() {
    return art.el("svg", { viewBox: "0 0 30 40", class: "fs-fahne", "aria-hidden": "true" }, [
      art.el("rect", { x: 3, y: 2, width: 3, height: 38, rx: 1.5, fill: "#5a3b10" }),
      art.el("path", { d: "M6 3 L27 10 L6 17 Z", fill: "#2f9e44" }),
      art.el("path", { d: "M6 3 L27 10 L6 17 Z", fill: "none", stroke: "#1f6b2e", "stroke-width": 1.5, "stroke-linejoin": "round" }),
    ]);
  }

  function startLevel(level) {
    clearStep();
    state.phase = "play";
    state.level = level;
    shell.setPhase("play");
    shell.closeOverlay();
    shell.setCount(0);
    run = { stapel: level.start.map((gleis) => [...gleis]), zuege: 0, hebt: null, von: null, busy: false };

    shell.clear();
    shell.play.append(shell.el("p", "cm-prompt fs-prompt", "Alle Fässer auf das Gleis mit der Fahne."));

    platz = shell.el("div", "fs-platz");
    const schiene = shell.el("div", "fs-schiene");
    laufkatze = shell.el("div", "fs-laufkatze");
    laufkatze.style.setProperty("--fs-x", "0");
    const seil = shell.el("span", "fs-seil");
    haken = shell.el("span", "fs-haken");
    laufkatze.append(seil, haken);

    gleise = [0, 1, 2].map((i) => {
      const gleis = shell.el("div", `fs-gleis${i === level.ziel ? " is-ziel" : ""}`);
      gleis.setAttribute("role", "button");
      gleis.setAttribute("tabindex", "0");
      gleis.dataset.gleis = String(i);
      const pfosten = shell.el("span", "fs-pfosten");
      const stapel = shell.el("span", "fs-stapel");
      gleis.append(pfosten, stapel);
      if (i === level.ziel) gleis.append(fahne());
      gleis.addEventListener("click", () => waehle(i));
      gleis.addEventListener("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") { event.preventDefault(); waehle(i); }
      });
      return gleis;
    });
    zeichneStapel();
    platz.append(schiene, laufkatze, ...gleise);
    shell.play.append(platz);
    beschreibe();
  }

  function zeichneStapel() {
    gleise.forEach((gleis, i) => {
      const stapel = gleis.querySelector(".fs-stapel");
      stapel.innerHTML = "";
      run.stapel[i].forEach((groesse) => stapel.append(fassNode(groesse)));
    });
  }

  function beschreibe() {
    gleise.forEach((gleis, i) => {
      const inhalt = run.stapel[i].length ? `${run.stapel[i].length} Fässer, oben Grösse ${run.stapel[i][run.stapel[i].length - 1]}` : "leer";
      const hebt = run.hebt !== null && run.von === i ? " Der Kran hält gerade ein Fass von hier." : "";
      gleis.setAttribute("aria-label", `Gleis ${i + 1}${i === state.level.ziel ? " mit der Fahne" : ""}: ${inhalt}.${hebt}`);
    });
  }

  function waehle(i) {
    if (state.phase !== "play" || !run || run.busy) return;

    // Noch nichts am Haken: das oberste Fass dieses Gleises heben.
    if (run.hebt === null) {
      if (!run.stapel[i].length) {
        gleise[i].classList.remove("is-leer");
        void gleise[i].offsetWidth;
        gleise[i].classList.add("is-leer");
        return;
      }
      const groesse = run.stapel[i].pop();
      run.hebt = groesse;
      run.von = i;
      const fass = gleise[i].querySelector(".fs-stapel").lastElementChild;
      haken.append(fass);
      laufkatze.style.setProperty("--fs-x", String(i));
      laufkatze.classList.add("is-hebt");
      kids()?.vibrate?.(10);
      beschreibe();
      return;
    }

    // Dasselbe Gleis: zurückstellen, ohne dass es zählt.
    if (i === run.von) {
      stelleAb(i, false);
      return;
    }

    // Anderes Gleis: nur, wenn das Fass darunter grösser ist.
    const ziel = run.stapel[i];
    if (ziel.length && ziel[ziel.length - 1] < run.hebt) {
      laufkatze.classList.remove("is-verboten");
      void laufkatze.offsetWidth;
      laufkatze.classList.add("is-verboten");
      gleise[i].classList.remove("is-nein");
      void gleise[i].offsetWidth;
      gleise[i].classList.add("is-nein");
      kids()?.playJingle?.("retry");
      return;
    }

    // Erst fährt der Kran hin, dann landet das Fass.
    run.busy = true;
    laufkatze.style.setProperty("--fs-x", String(i));
    stepTimer = window.setTimeout(() => {
      stepTimer = null;
      run.busy = false;
      stelleAb(i, true);
    }, FAHRT_MS);
  }

  function stelleAb(i, zaehlt) {
    const fass = haken.firstElementChild;
    run.stapel[i].push(run.hebt);
    run.hebt = null;
    run.von = null;
    laufkatze.classList.remove("is-hebt", "is-verboten");
    if (fass) {
      gleise[i].querySelector(".fs-stapel").append(fass);
      fass.classList.remove("is-gelandet");
      void fass.offsetWidth;
      fass.classList.add("is-gelandet");
    }
    if (zaehlt) {
      run.zuege += 1;
      shell.setCount(run.zuege);
      kids()?.playJingle?.("star");
    }
    beschreibe();
    if (geschafft(run.stapel, state.level)) {
      state.phase = "over";
      platz.classList.add("is-geschafft");
      stepTimer = window.setTimeout(finish, 700);
    }
  }

  // ---------------------------------------------------------------------------
  // Schluss
  // ---------------------------------------------------------------------------
  function resultSpeech(stars, offen) {
    const sterne = stars === 1 ? "einen Stern" : `${stars} Sterne`;
    const zuege = run.zuege === 1 ? "einem Zug" : `${run.zuege} Zügen`;
    const marke = run.zuege <= state.level.optimum
      ? "Das geht nicht kürzer."
      : `Es geht in ${state.level.optimum} Zügen.`;
    return `Level ${state.level.nr} geschafft, in ${zuege}. ${marke} Du hast ${sterne}. ${levelsText(offen)}`;
  }

  function finish() {
    clearStep();
    const level = state.level;
    const stars = starsFor(run.zuege, level.optimum);
    recordLevel(level.nr, stars);
    const fertig = doneCount();
    kids()?.playJingle?.("win");
    shell.setCount(fertig);
    shell.showResult({
      label: `Level ${level.nr} geschafft`,
      stars,
      detail: `${run.zuege} Züge · Bestmarke ${level.optimum}`,
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
    title: "Fässer stapeln",
    area: "problemloesen",
    accent: "#3FA34D",
    accentDark: "#2b7336",
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

  // Die Tasten 1, 2 und 3 wählen die Gleise.
  document.addEventListener("keydown", (event) => {
    if (state.phase !== "play") return;
    const i = ["1", "2", "3"].indexOf(event.key);
    if (i < 0) return;
    event.preventDefault();
    waehle(i);
  });

  window.addEventListener("pagehide", clearStep);

  // Tabelle und Regel nach aussen: das Prüfskript rechnet damit ohne Browser
  // nach, ob jede Bestmarke stimmt und jedes Level lösbar ist.
  window.LernappFaesser = { LEVELS, FARBEN, LEVELS_FOR_DONE, erlaubt, geschafft, optimum, starsFor, state };
})();
