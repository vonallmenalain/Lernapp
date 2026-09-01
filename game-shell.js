/*
 * game-shell.js – Die gemeinsame Bühne der Bestenlisten-Spiele.
 *
 * Landschaft der Startseite als Hintergrund, drei Knöpfe und ein Lautsprecher
 * oben links, ein Zähler oben rechts, wahlweise ein Zeitbalken darunter, und am
 * Schluss eine Bestenliste. Alles, was ein Spiel um einen Punktestand gleich
 * braucht – und nichts vom Spiel selbst.
 *
 * Das Spiel bekommt eine Fläche in der Mitte und ein paar Handgriffe:
 *   setCount(n)      Zähler oben rechts
 *   startClock(ms)   Uhr starten; sie meldet sich, wenn die Zeit um ist
 *   showResult(...)  Bestenliste mit "nochmal" und "zurück"
 *
 * Die Uhr ist wahlweise: Karten-Merker läuft gegen sie, Strand-Schätze läuft
 * ohne. Wo sie läuft, läuft sie nach der Wanduhr, nicht nach Zeitgeber-
 * Schritten. Ein Tab im Hintergrund bekommt seine Zeitgeber gedrosselt oder gar
 * nicht mehr; wer beim Zurückkommen weiterrechnete, sässe in einer Runde ohne
 * Ende.
 */
(() => {
  "use strict";

  const art = () => window.LernappTrainArt || null;
  const scenes = () => window.LernappScenes || null;
  const kids = () => window.LernappKids || null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svg(children, extra = {}) {
    return art().el("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", ...extra }, children);
  }

  const ICONS = {
    home: () => [art().el("path", {
      d: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z",
      fill: "none", stroke: "currentColor", "stroke-width": 2.2, "stroke-linejoin": "round",
    })],
    back: () => [art().el("path", {
      d: "M15 5 8 12l7 7", fill: "none", stroke: "currentColor",
      "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round",
    })],
    again: () => [
      art().el("path", {
        d: "M19 12a7 7 0 1 1-2.4-5.3", fill: "none", stroke: "currentColor",
        "stroke-width": 2.4, "stroke-linecap": "round",
      }),
      art().el("polygon", { points: "19,3 19.6,8.2 14.4,7.4", fill: "currentColor" }),
    ],
    star: () => [art().el("path", {
      d: "M12 3.2 14.7 9l6.3.8-4.6 4.3 1.2 6.2L12 17.4 6.4 20.3l1.2-6.2L3 9.8 9.3 9z",
      fill: "currentColor", stroke: "currentColor", "stroke-width": 1.4, "stroke-linejoin": "round",
    })],
    tick: () => [art().el("path", {
      d: "M5 13l4.5 4.5L19 7", fill: "none", stroke: "currentColor",
      "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round",
    })],
  };

  function iconButton(name, label, paths, onClick, extraClass = "") {
    const button = el("button", `cm-icon cm-icon-${name} ${extraClass}`.trim());
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.append(svg(paths));
    button.addEventListener("click", onClick);
    return button;
  }

  /*
   * Baut die Bühne.
   *
   *   host      das Element, in dem alles landet
   *   title     Name des Spiels – das Einzige, was oben steht
   *   area      Bereich des Zugs, für Farbe und Rückweg
   *   help      Text, den der Lautsprecher vorliest
   *   onRestart was der Neu-Knopf tut
   */
  function mount({ host, title, area, accent, accentDark, help, onRestart, onBack, clock = true }) {
    host.style.setProperty("--cm-accent", accent);
    host.style.setProperty("--cm-accent-dark", accentDark);
    host.innerHTML = "";
    host.dataset.phase = "intro";

    // --- Hintergrund: die Landschaft der Startseite --------------------------
    if (scenes()) host.append(scenes().buildScene(scenes().savedScene()));

    // --- Der Lautsprecher oben links ----------------------------------------
    // Derselbe wie in den anderen Spielen: er kennt schon den Ton-Schalter, das
    // Vorlesen und die Sprechblase für Kinder, die mitlesen wollen.
    kids()?.mountHelpButton?.();
    if (help) kids()?.setHelp?.(help);

    // --- Leiste oben ---------------------------------------------------------
    const bar = el("div", "cm-bar");
    const left = el("div", "cm-bar-left");
    left.append(iconButton("home", "Zur Startseite", ICONS.home(), () => {
      stopClock();
      window.location.href = "index.html";
    }));
    // Zurück führt nicht auf das Startbild, sondern eine Stufe zurück: bei
    // einem Spiel mit Levelwahl erst dorthin, sonst gleich in die Spielauswahl
    // des Bereichs. onBack meldet mit true, dass es die Stufe selbst genommen
    // hat.
    left.append(iconButton("back", "Zurück zur Auswahl", ICONS.back(), () => {
      stopClock();
      if (onBack?.()) return;
      window.location.href = `index.html?bereich=${encodeURIComponent(area)}`;
    }));
    left.append(iconButton("again", "Neu starten", ICONS.again(), () => { stopClock(); onRestart(); }));
    bar.append(left, el("h1", "cm-title", title));

    // Dezent oben rechts: wie viel bisher geschafft ist. Beim Karten-Merker ist
    // das nicht der Punktestand – eine Zahl, die während des Spiels auch fallen
    // kann, würde mitten im Tempo entmutigen.
    const count = el("div", "cm-count");
    count.setAttribute("role", "status");
    count.setAttribute("aria-live", "polite");
    count.append(svg(ICONS.tick(), { class: "cm-count-tick" }));
    const countValue = el("span", "cm-count-value", "0");
    count.append(countValue);
    bar.append(count);
    host.append(bar);

    // --- Zeitbalken ----------------------------------------------------------
    // Nicht jedes Spiel läuft gegen die Uhr. Ein Balken, der nie kleiner wird,
    // wäre schlimmer als keiner: er verspräche einen Zeitdruck, den es nicht
    // gibt.
    const time = el("div", "cm-time");
    time.setAttribute("aria-hidden", "true");
    const timeFill = el("span", "cm-time-fill");
    time.append(timeFill);
    if (clock) host.append(time);

    // --- Die Fläche für das Spiel -------------------------------------------
    const play = el("div", "cm-play");
    host.append(play);

    // --- Uhr ------------------------------------------------------------------
    let ticker = null;
    let endsAt = 0;
    let duration = 0;
    let onTimeUp = null;

    function paintClock() {
      const left_ = Math.max(0, endsAt - Date.now());
      timeFill.style.transform = `scaleX(${duration ? left_ / duration : 1})`;
      return left_;
    }

    function tick() {
      if (paintClock() > 0) return;
      stopClock();
      onTimeUp?.();
    }

    function startClock(ms, callback) {
      stopClock();
      duration = ms;
      endsAt = Date.now() + ms;
      onTimeUp = callback;
      paintClock();
      ticker = window.setInterval(tick, 100);
    }

    function stopClock() {
      if (ticker) { window.clearInterval(ticker); ticker = null; }
    }

    // Zurück aus dem Hintergrund: sofort nachziehen. Der Browser drosselt
    // Zeitgeber in verborgenen Tabs oder hält sie ganz an – ohne dieses
    // Nachziehen liefe die Runde weiter, obwohl die Zeit längst um ist.
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && ticker) tick();
    });
    window.addEventListener("pagehide", stopClock);

    // --- Der Überzug für das Ergebnis ---------------------------------------
    let overlay = null;
    let releaseHelp = null;

    // Nur die Tafel wegnehmen: panel() baut gleich die nächste auf und meldet
    // ihren Vorlese-Text selbst an.
    function dropOverlay() {
      overlay?.remove();
      overlay = null;
    }

    // Zurück ins Spiel: Tafel weg, und der Lautsprecher sagt wieder die Regeln.
    function closeOverlay() {
      dropOverlay();
      releaseHelp?.();
      releaseHelp = null;
    }

    function panel(children) {
      dropOverlay();
      overlay = el("div", "cm-overlay");
      const box = el("div", "cm-panel");
      children.forEach((child) => box.append(child));
      overlay.append(box);
      host.append(overlay);
      return box;
    }

    /*
     * Die Bestenliste am Schluss. store = { scores: [...] }, punkte = der
     * frische Lauf, note = eine Zeile darunter (oder nichts).
     */
    /*
     * stars   0–3: statt einer Punktzahl stehen Sterne da (Weichen-Wirrwarr)
     * scores  fehlt oder null: keine Bestenliste (bei Sternen wäre sie doppelt)
     * onBack  wohin der Zurück-Knopf führt; ohne das in die Spielauswahl
     */
    function showResult({ points, stars, detail, scores, note, speech, onBack, label = "Deine Punkte", top = 5 }) {
      host.dataset.phase = "over";
      timeFill.style.transform = "scaleX(0)";
      // Der Lautsprecher oben links sagt jetzt das Ergebnis statt der Regeln.
      // Ein Kind, das die Zahlen nicht liest, erfährt so, wie es gelaufen ist
      // und wie weit es noch bis zum fertigen Wagen hat.
      releaseHelp?.();
      releaseHelp = speech ? kids()?.pushHelp?.(speech) || null : null;
      const parts = [el("p", "cm-result-label", label)];
      if (typeof stars === "number") {
        // Drei Sterne, die leeren blass. Eine Zahl "2 von 3" müsste ein Kind
        // erst lesen; drei Bilder sieht es.
        const row = el("div", "cm-result-stars");
        row.setAttribute("aria-label", `${stars} von 3 Sternen`);
        for (let i = 0; i < 3; i += 1) {
          const star = el("span", `cm-result-star${i < stars ? " is-on" : ""}`);
          star.append(svg(ICONS.star()));
          row.append(star);
        }
        parts.push(row);
      } else {
        parts.push(el("p", "cm-result-score", String(points)));
      }
      if (detail) parts.push(el("p", "cm-result-detail", detail));

      // Der frische Lauf ist hervorgehoben – ohne die Markierung müsste ein
      // Kind seine eigene Zahl suchen. Markiert wird genau einer, sonst
      // leuchteten bei gleichem Ergebnis mehrere.
      const list = el("ol", "cm-scores");
      let marked = false;
      (scores || []).forEach((value, index) => {
        const item = el("li", "cm-score-item");
        if (!marked && value === points) { item.classList.add("is-new"); marked = true; }
        item.append(el("span", "cm-score-rank", `${index + 1}.`), el("span", "cm-score-value", String(value)));
        list.append(item);
      });
      if (scores) {
        for (let i = scores.length; i < top; i += 1) {
          const item = el("li", "cm-score-item is-empty");
          item.append(el("span", "cm-score-rank", `${i + 1}.`), el("span", "cm-score-value", "–"));
          list.append(item);
        }
        parts.push(list);
      }
      if (note) parts.push(el("p", `cm-runs${note.done ? " is-done" : ""}`, note.text));

      const actions = el("div", "cm-actions");
      actions.append(iconButton("again", "Noch einmal", ICONS.again(), () => { closeOverlay(); onRestart(); }, "big"));
      actions.append(iconButton("back", "Zurück zur Auswahl", ICONS.back(), () => {
        stopClock();
        if (onBack) { closeOverlay(); onBack(); return; }
        window.location.href = `index.html?bereich=${encodeURIComponent(area)}`;
      }, "big"));
      parts.push(actions);
      panel(parts);
    }

    return {
      play,
      el,
      icon: iconButton,
      setPhase(phase) { host.dataset.phase = phase; },
      setCount(value) { countValue.textContent = String(value); },
      startClock,
      stopClock,
      showResult,
      closeOverlay,
      clear() { play.innerHTML = ""; },
    };
  }

  window.LernappGameShell = { mount, ICONS };
})();
