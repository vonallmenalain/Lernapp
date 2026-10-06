/*
 * lesen-spiel.js – Was alle Spiele der Leseecke gemeinsam haben.
 *
 * Die Bühne kommt aus game-shell.js wie bei jedem anderen Spiel. Hier steht
 * nur, was in der Leseecke anders ist:
 *
 *   zurück      führt in den Lesewagen (index.html?lesen=1), nicht in einen
 *               Bereich des Zugs
 *   «Los»       jede Runde beginnt mit einem Tipp. Ein Browser lässt eine
 *               frisch geöffnete Seite nicht sprechen, bevor sie berührt
 *               wurde – und die Hörspiele brauchen die Stimme vom ersten
 *               Wort an.
 *   Ergebnis    Sterne statt Bestenliste, und der Lesestand wird geschrieben:
 *               Runde gespielt, Wörter für den Lesewurm.
 */
(() => {
  "use strict";

  const shellApi = () => window.LernappGameShell || null;
  const stand = () => window.LernappLeseStand || null;
  const art = () => window.LernappLeseArt || null;
  const kids = () => window.LernappKids || null;

  const LESEWAGEN = "index.html?lesen=1";
  const FARBE = "#c4553a";
  const FARBE_DUNKEL = "#8f3a26";

  function zurueck() {
    window.location.href = LESEWAGEN;
    return true;
  }

  // Die Bühne für ein Spiel der Leseecke.
  //   id      Kennung im Lesestand (silbenzug, buchstabenhaus …)
  //   onBack  der Pfeil zurück, wenn er nicht gleich in den Lesewagen soll
  //           (das Bücherregal: aus einem Buch erst zurück ans Regal)
  function mount({ host, id, title, help, onRestart, onBack = null, clock = false }) {
    const shell = shellApi()?.mount({
      host,
      title,
      area: "lesen",
      accent: FARBE,
      accentDark: FARBE_DUNKEL,
      help,
      clock,
      onRestart,
      onBack: onBack || zurueck,
    });
    host.classList.add("lese-buehne");
    stand()?.spielGeoeffnet?.(id);
    return shell;
  }

  // Der grosse Knopf vor jeder Runde, mit dem Lesewurm daneben.
  function losKnopf(shell, { text = "Los geht's!", onLos }) {
    shell.clear();
    shell.setPhase("intro");
    const karte = shell.el("div", "lese-los");
    const wurm = art()?.el("svg", { viewBox: "-70 -95 140 130", class: "lese-los-wurm", "aria-hidden": "true" });
    if (wurm) {
      wurm.append(art().buildLesewurm(3, { r: 16, buch: false, winkt: true }));
      karte.append(wurm);
    }
    const knopf = shell.el("button", "lese-los-knopf");
    knopf.type = "button";
    knopf.setAttribute("aria-label", text);
    knopf.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#3fbf74"/><polygon points="19,14 35,24 19,34" fill="#fff"/></svg>`;
    knopf.addEventListener("click", () => { knopf.disabled = true; onLos?.(); }, { once: true });
    karte.append(knopf);
    shell.play.append(karte);
    window.setTimeout(() => knopf.focus?.({ preventScroll: true }), 50);
    return karte;
  }

  // Drei Sterne für alles richtig, zwei ab drei Vierteln, sonst einer.
  function sterne(punkte, von) {
    if (!von) return 1;
    if (punkte >= von) return 3;
    if (punkte >= Math.ceil(von * 0.75)) return 2;
    return 1;
  }

  // Das Ende einer Runde: Lesestand schreiben, Sterne zeigen, vorlesen.
  //   woerter  so viele Wörter hat das Kind in dieser Runde gelesen oder
  //            gehört – davon wächst der Lesewurm
  //   stars    wenn die Sterne anders gerechnet werden (ein Buch)
  //   onBack   wohin der Zurück-Knopf der Tafel führt; sonst in den Lesewagen
  function ergebnis(shell, { id, punkte, von, woerter = 0, detail, speech, label = "Geschafft!", stars = null, onBack = null }) {
    const s = stand();
    const glieder = s?.wurmGlieder?.() || 1;
    s?.spielRunde?.(id, { punkte });
    if (woerter) s?.woerterGelesen?.(woerter);
    const neu = s?.wurmGlieder?.() || 1;
    const sternZahl = stars ?? sterne(punkte, von);
    const wurm = neu > glieder ? " Dein Lesewurm ist gewachsen!" : "";
    kids()?.playJingle?.(sternZahl === 3 ? "win" : "correct");
    shell.showResult({
      label,
      stars: sternZahl,
      detail: detail || `${punkte} von ${von} richtig`,
      scores: null,
      note: wurm ? { text: "Dein Lesewurm ist gewachsen!", done: true } : null,
      speech: `${speech || `${punkte} von ${von} richtig.`}${wurm}`,
      onBack: onBack || zurueck,
    });
  }

  // Ein Bild aus einem Emoji, gross und rund gerahmt.
  function bildKarte(shell, emoji, { klasse = "", label = "" } = {}) {
    const karte = shell.el("div", `lese-bild ${klasse}`.trim());
    karte.textContent = emoji;
    if (label) { karte.setAttribute("role", "img"); karte.setAttribute("aria-label", label); }
    else karte.setAttribute("aria-hidden", "true");
    return karte;
  }

  // Mischen (Fisher-Yates) und zufällig ziehen.
  function mische(liste) {
    const kopie = [...liste];
    for (let i = kopie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    }
    return kopie;
  }

  // n verschiedene Elemente, wenn möglich ohne die zuletzt gezogenen.
  function ziehe(liste, n, vermeiden = []) {
    const frisch = mische(liste.filter((x) => !vermeiden.includes(x)));
    const rest = mische(liste.filter((x) => vermeiden.includes(x)));
    return [...frisch, ...rest].slice(0, n);
  }

  // Die Lok des Kindes, so wie sie in der Werkstatt gebaut ist.
  function eigeneLok() {
    const zug = window.LernappTrainArt;
    if (!zug) return null;
    let config = {};
    try { config = JSON.parse(localStorage.getItem("lernapp.train.loco") || "{}") || {}; } catch { config = {}; }
    const svg = zug.el("svg", { viewBox: `0 0 ${zug.LOCO_W} ${zug.ART_H}`, class: "lese-lok", "aria-hidden": "true" });
    svg.append(zug.buildLoco(config));
    return svg;
  }

  window.LernappLeseSpiel = { LESEWAGEN, FARBE, mount, zurueck, losKnopf, sterne, ergebnis, bildKarte, mische, ziehe, eigeneLok };
})();
