/*
 * train-leseecke.js – Der Lesewagen von innen.
 *
 * Eine Ansicht der Bühne wie die Reise (train-journey.js): train-home.js gibt
 * ihr einen Platz, sie zeichnet das Zimmer und meldet, wohin ein Tipp führt.
 * Gezeichnet wird in lesen-art.js, was ein Kind schon kann, steht in
 * lesen-stand.js.
 *
 * Jedes Ding im Zimmer ist ein Weg in einen Teil der Leseecke:
 *
 *   Sessel mit Lesewurm  weiterlesen: der Wurm sucht aus, was dran ist
 *   Trommel              Silben hören (Silbenzug)
 *   Buchstabenhaus       Laute und Buchstaben
 *   Wortkiste            Laute zu Wörtern kuppeln
 *   Spielzeugzug         Sätze (Stimmt das?)
 *   Bücherregal          Bücher
 *
 * Was hier nicht geschieht: Fortschritt schreiben. Das tun die Spiele.
 */
(() => {
  "use strict";

  const art = () => window.LernappLeseArt || null;
  const stand = () => window.LernappLeseStand || null;
  const kids = () => window.LernappKids || null;

  // Wohin jedes Ding führt.
  const ZIELE = {
    silben: "silbenzug.html",
    buchstaben: "buchstabenhaus.html",
    woerter: "lautekuppeln.html",
    saetze: "stimmtdas.html",
    buecher: "buecher.html",
  };

  const HILFE = [
    "Der Lesewagen.",
    "Tippe auf den Lesewurm im Sessel, und er sucht dir etwas aus.",
    "Die Trommel ist für Silben, das Buchstabenhaus für Buchstaben,",
    "die Kiste für Wörter, der kleine Zug für Sätze und das Regal für Bücher.",
  ].join(" ");

  // Wie lang der Wurm war, als das Kind ihn zuletzt gesehen hat. Ist er
  // seither gewachsen, wird das gezeigt – über den Vergleich, nicht über eine
  // Nachricht der Spiele: So stimmt es auch nach einem Neuladen.
  const GESEHEN_KEY = "lernapp.lesen.gesehen";

  function gesehen() {
    try { return Number(localStorage.getItem(GESEHEN_KEY)) || 0; } catch { return 0; }
  }
  function merkeGesehen(glieder) {
    try { localStorage.setItem(GESEHEN_KEY, String(glieder)); } catch { /* privater Modus */ }
  }

  // Die Leseschrift erst holen, wenn jemand in den Wagen steigt: Das Startbild
  // braucht sie nicht.
  function schriftLaden() {
    if (document.querySelector("link[data-leseschrift]")) return;
    const version = document.querySelector('script[src^="train-home.js"]')?.getAttribute("src")?.split("?")[1] || "";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `leseschrift.css${version ? `?${version}` : ""}`;
    link.dataset.leseschrift = "1";
    document.head.append(link);
  }

  // Ein Schloss an einem Ding, dessen Schnupperrunde gespielt ist – wie an den
  // Häusern der Bereiche.
  function schloss(svg, ort) {
    const ziel = ZIELE[ort];
    const schranke = window.LernappEntitlement;
    if (!ziel || !schranke?.gameGespielt?.(ziel)) return;
    const knoten = svg.querySelector(`[data-ort="${ort}"]`);
    if (!knoten) return;
    knoten.classList.add("is-locked");
    const box = knoten.getBBox?.();
    if (!box) return;
    const a = art();
    knoten.append(a.group({ class: "lese-ort-schloss", transform: `translate(${box.x + box.width - 26} ${box.y + 10})` }, [
      a.el("circle", { cx: 0, cy: 0, r: 26, fill: "#ffd166", stroke: "#b8860b", "stroke-width": 3 }),
      a.el("path", { d: "M-9 -4 v-6 a9 9 0 0 1 18 0 v6", fill: "none", stroke: "#5b3a29", "stroke-width": 4 }),
      a.el("rect", { x: -12, y: -5, width: 24, height: 18, rx: 4, fill: "#5b3a29" }),
    ]));
  }

  /*
   *   host    das Element auf der Bühne, in das das Zimmer kommt
   *   onPlay  (seite) => …, öffnet ein Spiel (train-home.js, enterGame)
   */
  function mount({ host, onPlay }) {
    const a = art();
    const s = stand();
    if (!a || !host) return;
    schriftLaden();
    const jetzt = s ? s.stand() : { woerter: 0, buecher: {} };
    const glieder = s ? s.wurmGlieder(jetzt) : 1;
    const gelesen = Object.keys(jetzt.buecher || {}).length;
    const svg = a.buildLesezimmer({ glieder, gelesen });
    host.innerHTML = "";
    host.append(svg);

    svg.querySelectorAll("[data-ort]").forEach((knoten) => {
      const ort = knoten.getAttribute("data-ort");
      const los = () => {
        if (ort === "weiter") {
          const naechstes = s?.naechstes?.();
          onPlay?.(naechstes?.page || ZIELE.buchstaben);
          return;
        }
        if (ZIELE[ort]) onPlay?.(ZIELE[ort]);
      };
      knoten.addEventListener("click", los);
      knoten.addEventListener("keydown", (ereignis) => {
        if (ereignis.key === "Enter" || ereignis.key === " ") { ereignis.preventDefault(); los(); }
      });
    });

    // Schlösser erst nach dem Einhängen: getBBox misst nur Gezeichnetes.
    window.requestAnimationFrame(() => Object.keys(ZIELE).forEach((ort) => schloss(svg, ort)));

    // Ist der Wurm gewachsen, seit das Kind zuletzt hier war? Dann sagt der
    // Lautsprecher das zuerst. Der Text gehört zur Ansicht: train-home.js
    // räumt ihn beim Verlassen weg.
    const vorher = gesehen();
    const gewachsen = vorher && glieder > vorher;
    if (gewachsen) {
      svg.querySelector(".lesewurm")?.classList.add("is-gewachsen");
      kids()?.playJingle?.("unlock");
    }
    kids()?.setHelp?.(gewachsen ? `Dein Lesewurm ist gewachsen! Er hat jetzt ${glieder} Glieder. ${HILFE}` : HILFE);
    merkeGesehen(glieder);
  }

  window.LernappLeseecke = { mount, ZIELE, HILFE };
})();
