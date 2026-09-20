/*
 * game-cloud.js – Spielstände, die dem Kind folgen.
 *
 * Bestenlisten, Rundenzahlen, freigeschaltete Level: alles, was ein Spiel
 * selbst führt und nicht über den Levelkatalog läuft. Die Katalog-Spiele legen
 * ihren Fortschritt Level für Level in Firestore ab; die Spiele mit eigenem
 * Konto – Tier-Sprung, der Karten-Merker – bekommen hier eine gemeinsame
 * Ablage.
 *
 * Gespeichert wird immer zuerst auf dem Gerät: ohne Konto und ohne Netz muss
 * ein Ergebnis stehen bleiben. Angemeldet geht derselbe Stand zusätzlich nach
 * Firestore, an dasselbe Dokument wie der übrige Fortschritt.
 *
 * Zusammengeführt wird pro Spiel, nicht pauschal. Beim Aussehen der Lok kann
 * die neuere Fassung gewinnen – bei einer Bestenliste nicht: wer auf dem Handy
 * 50 Punkte geschafft hat und danach auf dem Tablet 10, hat immer noch 50
 * geschafft. Deshalb bringt jedes Spiel seine eigene Zusammenführung mit.
 */
(() => {
  "use strict";

  const cloud = () => window.LernappFirebase || null;

  // Alle angemeldeten Spielstände, damit ein Zurücksetzen sie alle erreicht.
  // Ohne diese Liste bliebe der Stand im Speicher jedes Kontos stehen: der
  // localStorage wäre leer, das nächste write() schriebe den alten Stand
  // wieder hin.
  const accounts = [];

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch { return value; }
  }

  function readLocal(key, fallback) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "null");
      return raw && typeof raw === "object" ? raw : fallback;
    } catch { return fallback; }
  }

  function writeLocal(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* privater Modus */ }
  }

  /*
   * Meldet einen Spielstand an.
   *
   *   key      Schlüssel im localStorage und Feldname in der Cloud.
   *   empty    Was ein leerer Stand ist.
   *   merge    (a, b) => zusammengeführter Stand. Muss beide Richtungen gleich
   *            behandeln: dieselbe Zusammenführung läuft auf jedem Gerät.
   *
   * Zurück kommt ein kleines Konto mit read(), write() und onChange().
   */
  function register({ key, empty = {}, merge = (local) => local }) {
    let current = readLocal(key, empty);
    const listeners = [];

    function apply(next, { save = true } = {}) {
      current = next;
      writeLocal(key, next);
      if (save) cloud()?.saveGameState?.(key, next);
      listeners.forEach((fn) => { try { fn(current); } catch { /* egal */ } });
    }

    // Was aus der Cloud kommt, wird mit dem Gerätestand vereinigt und – falls
    // dabei etwas Neues herauskam – gleich wieder hochgeschoben. So gleichen
    // sich zwei Geräte über die Cloud an, ohne dass eines etwas verliert.
    function absorb(entry) {
      if (!entry?.data) return;
      const merged = merge(current, entry.data);
      const changed = JSON.stringify(merged) !== JSON.stringify(current);
      const missing = JSON.stringify(merged) !== JSON.stringify(entry.data);
      if (changed) apply(merged, { save: false });
      if (missing) cloud()?.saveGameState?.(key, merged);
    }

    document.addEventListener("lernapp:game-state", (event) => {
      const all = event.detail;
      // Beim Abmelden kommt null: dann gilt wieder, was auf dem Gerät steht.
      if (all && all[key]) absorb(all[key]);
    });

    // Falls die Anmeldung schon durch war, bevor diese Datei zuhörte.
    absorb(cloud()?.getGameState?.(key));

    const account = {
      read() { return current; },
      write(data) { apply(data); return current; },
      // Bequemer Weg für "nimm den alten Stand und gib den neuen zurück".
      update(fn) { return this.write(fn(current)); },
      // Zurück auf leer. Geschrieben wird nur auf das Gerät: den Stand in der
      // Cloud räumt firebase.js in einem Zug weg, und ein Schreibvorgang je
      // Spiel legte ihn gleich wieder an.
      reset() { apply(clone(empty), { save: false }); return current; },
      onChange(fn) { listeners.push(fn); return () => {
        const i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      }; },
    };

    accounts.push(account);
    return account;
  }

  // Alles auf leer – für "Fortschritt zurücksetzen" im Profil und für ein
  // Konto, das anderswo zurückgesetzt wurde. Jedes Spiel meldet sich danach
  // bei seinen Zuhörern, der Zug zeichnet sich also von selbst neu.
  function resetAll() {
    accounts.forEach((account) => {
      try { account.reset(); } catch { /* ein Spiel darf die anderen nicht aufhalten */ }
    });
  }

  // --- Fertige Zusammenführungen ---------------------------------------------

  // Bestenliste plus Rundenzähler. Derselbe Stand kommt mehrfach an – vom
  // Gerät in die Cloud und von dort zurück, bei jedem Abgleich –, deshalb darf
  // beim Zusammenführen kein Ergebnis doppelt werden. Vorher wurden die beiden
  // Listen aneinandergehängt: aus einer 29 wurden zwei, dann vier, und die
  // Bestenliste zeigte viermal dieselbe Runde. Jetzt bleibt von jeder
  // Punktzahl so oft, wie sie auf einer Seite höchstens vorkommt: zweimal 29
  // auf demselben Gerät sind zwei Runden, 29 hier und 29 aus der Cloud sind
  // dieselbe. Der Zähler nimmt aus demselben Grund den grösseren Wert und
  // summiert nicht.
  //
  // Und nie mehr Ergebnisse als Runden: eine Liste, die länger ist, trägt
  // Doppelte aus der Zeit des Aneinanderhängens. Die fallen zuerst weg, das
  // häufigste zuerst – so heilt ein Stand von damals beim nächsten Abgleich.
  // Lauter verschiedene Ergebnisse bleiben stehen, auch wenn der Zähler
  // kleiner ist: der wird über Geräte hinweg nicht summiert, die Liste schon.
  function mergeScores(limit = 5) {
    const zaehle = (list) => {
      const counts = new Map();
      (Array.isArray(list) ? list : []).filter((n) => Number.isFinite(n)).forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));
      return counts;
    };
    return (a, b) => {
      const runs = Math.max(Number(a.runs) || 0, Number(b.runs) || 0);
      const ca = zaehle(a.scores);
      const cb = zaehle(b.scores);
      const counts = new Map();
      new Set([...ca.keys(), ...cb.keys()]).forEach((n) => counts.set(n, Math.max(ca.get(n) || 0, cb.get(n) || 0)));

      let total = 0;
      counts.forEach((k) => { total += k; });
      while (runs > 0 && total > runs) {
        let top = null;
        counts.forEach((k, n) => { if (k > 1 && (top === null || k > counts.get(top))) top = n; });
        if (top === null) break;
        counts.set(top, counts.get(top) - 1);
        total -= 1;
      }

      const scores = [];
      counts.forEach((k, n) => { for (let i = 0; i < k; i += 1) scores.push(n); });
      scores.sort((x, y) => y - x);
      return { runs, scores: scores.slice(0, limit) };
    };
  }

  // Level mit Sternen: je Level das bessere Ergebnis, freigeschaltet ist, was
  // auf irgendeinem Gerät freigeschaltet war. Zählt das Spiel daneben seine
  // Runden (Memory), gilt die höhere Zahl – summieren wäre falsch, derselbe
  // Stand kann mehrfach ankommen.
  function mergeLevels(a, b) {
    const best = {};
    [a.best || {}, b.best || {}].forEach((source) => {
      Object.keys(source).forEach((id) => {
        const entry = source[id];
        if (!entry || typeof entry !== "object") return;
        const known = best[id];
        if (!known || (Number(entry.stars) || 0) > (Number(known.stars) || 0)) best[id] = entry;
      });
    });
    const merged = { ...a, ...b, best, unlocked: Math.max(Number(a.unlocked) || 0, Number(b.unlocked) || 0) };
    if ("runs" in a || "runs" in b) merged.runs = Math.max(Number(a.runs) || 0, Number(b.runs) || 0);
    return merged;
  }

  window.LernappGameCloud = { register, resetAll, mergeScores, mergeLevels };
})();
