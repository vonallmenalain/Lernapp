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
 *   auf Zeit    ab Stufe «schwer» bieten «Stimmt das?» und «Stolperwörter»
 *               neben «Los» eine Runde auf Zeit an: 45 Sekunden, so viele
 *               Sätze wie möglich – das übt Tempo, ohne das Verstehen
 *               auszulassen. Ihr Ergebnis ist ein eigener Bestwert.
 */
(() => {
  "use strict";

  const shellApi = () => window.LernappGameShell || null;
  const stand = () => window.LernappLeseStand || null;
  const art = () => window.LernappLeseArt || null;
  const kids = () => window.LernappKids || null;

  const LESEWAGEN = "index.html?lesen=1";
  // Eine Runde auf Zeit dauert so lange.
  const ZEIT_MS = 45000;
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
  //   zeit  { onLos }: daneben der Knopf für die Runde auf Zeit
  function losKnopf(shell, { text = "Los geht's!", onLos, zeit = null }) {
    shell.clear();
    shell.setPhase("intro");
    const karte = shell.el("div", "lese-los");
    const wurm = art()?.el("svg", { viewBox: "-70 -95 140 130", class: "lese-los-wurm", "aria-hidden": "true" });
    if (wurm) {
      wurm.append(art().buildLesewurm(3, { r: 16, buch: false, winkt: true }));
      // Hat das Kind ihn getauft (Mein Name), steht sein Name darunter.
      const name = stand()?.wurmName?.() || "";
      if (name) {
        const spalte = shell.el("div", "lese-los-wurmspalte");
        spalte.append(wurm, shell.el("span", "lese-los-wurmname", stand()?.zeige?.(name) ?? name));
        karte.append(spalte);
      } else karte.append(wurm);
    }
    const knopf = shell.el("button", "lese-los-knopf");
    knopf.type = "button";
    knopf.setAttribute("aria-label", text);
    knopf.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#3fbf74"/><polygon points="19,14 35,24 19,34" fill="#fff"/></svg>`;
    karte.append(knopf);
    let uhr = null;
    if (zeit) {
      uhr = shell.el("button", "lese-zeit-knopf");
      uhr.type = "button";
      uhr.setAttribute("aria-label", `Auf Zeit: ${ZEIT_MS / 1000} Sekunden`);
      uhr.append(shell.el("span", "lese-zeit-bild", "⏱️"), shell.el("span", "lese-zeit-text", stand()?.zeige?.(`${ZEIT_MS / 1000} Sekunden`) ?? `${ZEIT_MS / 1000} Sekunden`));
      karte.append(uhr);
    }
    // Ein Tipp entscheidet: Danach nimmt keiner der beiden Knöpfe mehr etwas an.
    const zu = () => { knopf.disabled = true; if (uhr) uhr.disabled = true; };
    knopf.addEventListener("click", () => { if (knopf.disabled) return; zu(); onLos?.(); });
    uhr?.addEventListener("click", () => { if (uhr.disabled) return; zu(); zeit.onLos?.(); });
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
  //   zeit     eine Runde auf Zeit: von ist dann das Ziel für drei Sterne,
  //            und das Ergebnis zählt als Bestwert auf Zeit
  function ergebnis(shell, { id, punkte, von, woerter = 0, detail, speech, label = "Geschafft!", stars = null, onBack = null, zeit = false }) {
    const s = stand();
    const glieder = s?.wurmGlieder?.() || 1;
    const bisher = Number(s?.stand?.().spiele?.[id]?.zeit) || 0;
    if (zeit) s?.zeitRunde?.(id, { punkte });
    else s?.spielRunde?.(id, { punkte });
    if (woerter) s?.woerterGelesen?.(woerter);
    const neu = s?.wurmGlieder?.() || 1;
    const sternZahl = stars ?? sterne(punkte, von);
    const wurm = neu > glieder ? " Dein Lesewurm ist gewachsen!" : "";
    // Ein neuer Bestwert auf Zeit – nicht schon beim allerersten Mal.
    const rekord = zeit && bisher > 0 && punkte > bisher ? " Neuer Rekord!" : "";
    const notiz = [rekord.trim(), wurm.trim()].filter(Boolean).join(" ");
    kids()?.playJingle?.(sternZahl === 3 || rekord ? "win" : "correct");
    shell.showResult({
      label,
      stars: sternZahl,
      detail: detail || `${punkte} von ${von} richtig`,
      scores: null,
      note: notiz ? { text: notiz, done: true } : null,
      speech: `${speech || `${punkte} von ${von} richtig.`}${rekord}${wurm}`,
      onBack: onBack || zurueck,
    });
  }

  // Wie viele das Kind auf Zeit bisher höchstens geschafft hat (0: noch nie).
  function zeitBest(id) {
    return Number(stand()?.stand?.().spiele?.[id]?.zeit) || 0;
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

  window.LernappLeseSpiel = { LESEWAGEN, FARBE, ZEIT_MS, mount, zurueck, losKnopf, sterne, ergebnis, zeitBest, bildKarte, mische, ziehe, eigeneLok };
})();
