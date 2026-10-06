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
 *   Trommel              Hören: Silbenzug, Laut-Position, Reimkupplung,
 *                        Anlaut-Lauscher
 *   Buchstabenhaus       Laute und Buchstaben
 *   Wortkiste            Wörter: Laute kuppeln, Wer fährt mit?, Wörter bauen,
 *                        Silbenbahn, Blitzwörter, Quatschwörter
 *   Spielzeugzug         Sätze: Stimmt das?, Lückensätze, Satz kuppeln, …
 *   Bücherregal          Bücher: das Regal und der Geschichtenzug
 *   Pinnwand             Lesedetektive: Wer bin ich?, Wortbaustelle
 *   Schild am Sessel     der Name des Lesewurms: ein Tipp, und das Kind tauft
 *                        ihn (meinname.html?wurm=1)
 *
 * Steht hinter einem Ding nur ein Spiel, geht es gleich los; stehen mehrere
 * dahinter, kommt eine kleine Auswahl mit Bildern. Welches Spiel wo steht,
 * sagt der Katalog in lesen-stand.js (SPIELE, ort).
 *
 * Das Zimmer wird mit jedem gelesenen Stück gemütlicher (lesen-art.js,
 * AUSBAU; lesen-stand.js, wagenStufe). Was seit dem letzten Besuch dazukam,
 * leuchtet, und der Lautsprecher sagt es.
 *
 * Was hier nicht geschieht: Fortschritt schreiben. Das tun die Spiele.
 */
(() => {
  "use strict";

  const art = () => window.LernappLeseArt || null;
  const stand = () => window.LernappLeseStand || null;
  const kids = () => window.LernappKids || null;

  // Die Dinge im Zimmer und wie die Auswahl dahinter heisst.
  const ORTE = {
    silben: "Hören",
    buchstaben: "Buchstaben",
    woerter: "Wörter",
    saetze: "Sätze",
    buecher: "Bücher",
    detektiv: "Lesedetektive",
  };

  // Die Spiele hinter einem Ding, in der Reihenfolge des Katalogs.
  function spieleAm(ort) {
    const katalog = stand()?.SPIELE || {};
    return Object.entries(katalog).filter(([, spiel]) => spiel.ort === ort).map(([id, spiel]) => ({ id, ...spiel }));
  }

  // Für die Prüfung und alte Aufrufer: das erste Spiel je Ding.
  const ZIELE = new Proxy({}, { get: (_, ort) => spieleAm(String(ort))[0]?.page });

  const HILFE = [
    "Der Lesewagen.",
    "Tippe auf den Lesewurm im Sessel, und er sucht dir etwas aus.",
    "Die Trommel ist zum Hören, das Buchstabenhaus für Buchstaben,",
    "die Kiste für Wörter, der kleine Zug für Sätze und das Regal für Bücher.",
    "An der Pinnwand warten Rätsel für Lesedetektive.",
    "Auf dem Schild steht der Name deines Lesewurms.",
  ].join(" ");

  // Wohin das Schild am Sessel führt: Dort bekommt der Lesewurm seinen Namen.
  const TAUFE = "meinname.html?wurm=1";

  // Wie lang der Wurm war, als das Kind ihn zuletzt gesehen hat. Ist er
  // seither gewachsen, wird das gezeigt – über den Vergleich, nicht über eine
  // Nachricht der Spiele: So stimmt es auch nach einem Neuladen.
  const GESEHEN_KEY = "lernapp.lesen.gesehen";
  // Genauso die Einrichtung: wie viele Dinge schon dastanden.
  const AUSBAU_GESEHEN_KEY = "lernapp.lesen.ausbau-gesehen";

  function gesehen(key = GESEHEN_KEY) {
    try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
  }
  function merkeGesehen(wert, key = GESEHEN_KEY) {
    try { localStorage.setItem(key, String(wert)); } catch { /* privater Modus */ }
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

  const gespielt = (page) => Boolean(window.LernappEntitlement?.gameGespielt?.(page));

  // Ein Schloss an einem Ding, wenn die Schnupperrunde jedes Spiels dahinter
  // gespielt ist – wie an den Häusern der Bereiche. Ist noch eines offen,
  // trägt nur dessen Karte in der Auswahl kein Schloss.
  function schloss(svg, ort) {
    const spiele = spieleAm(ort);
    if (!spiele.length || !spiele.every((spiel) => gespielt(spiel.page))) return;
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

  // Die Auswahl hinter einem Ding: grosse Karten mit Bild und Namen. Das Bild
  // genügt einem Kind, das noch nicht liest; den Namen liest der Lautsprecher.
  function zeigeWahl(host, ort, onPlay) {
    host.querySelector(".lese-wahl")?.remove();
    const spiele = spieleAm(ort);
    const titel = ORTE[ort] || "";
    const huelle = document.createElement("div");
    huelle.className = "lese-wahl";
    huelle.setAttribute("role", "dialog");
    huelle.setAttribute("aria-label", titel);
    const karte = document.createElement("div");
    karte.className = "lese-wahl-karte";
    const kopf = document.createElement("p");
    kopf.className = "lese-wahl-titel";
    kopf.textContent = titel;
    const zu = document.createElement("button");
    zu.type = "button";
    zu.className = "lese-wahl-zu";
    zu.setAttribute("aria-label", "Schliessen");
    zu.textContent = "✕";
    const reihe = document.createElement("div");
    reihe.className = "lese-wahl-spiele";
    spiele.forEach((spiel) => {
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "lese-wahl-spiel";
      knopf.dataset.spiel = spiel.id;
      knopf.dataset.page = spiel.page;
      const verbraucht = gespielt(spiel.page);
      knopf.setAttribute("aria-label", `${spiel.titel}${verbraucht ? ", gesperrt" : ""}`);
      const bild = document.createElement("span");
      bild.className = "lese-wahl-bild";
      bild.textContent = spiel.bild || "📖";
      const name = document.createElement("span");
      name.className = "lese-wahl-name";
      name.textContent = spiel.titel;
      knopf.append(bild, name);
      if (verbraucht) {
        knopf.classList.add("is-locked");
        const s = document.createElement("span");
        s.className = "lese-wahl-schloss";
        s.setAttribute("aria-hidden", "true");
        s.textContent = "🔒";
        knopf.append(s);
      }
      knopf.addEventListener("click", () => onPlay?.(spiel.page));
      reihe.append(knopf);
    });
    const schliessen = () => {
      huelle.remove();
      kids()?.setHelp?.(HILFE);
      document.removeEventListener("keydown", taste);
    };
    const taste = (ereignis) => { if (ereignis.key === "Escape") schliessen(); };
    zu.addEventListener("click", schliessen);
    huelle.addEventListener("click", (ereignis) => { if (ereignis.target === huelle) schliessen(); });
    document.addEventListener("keydown", taste);
    // Titel und Kreuz in einer eigenen Zeile über den Karten: So liegt das
    // Kreuz nie über einem Spiel.
    const zeile = document.createElement("div");
    zeile.className = "lese-wahl-kopf";
    zeile.append(kopf, zu);
    karte.append(zeile, reihe);
    huelle.append(karte);
    host.append(huelle);
    kids()?.setHelp?.(`${titel}. Tippe auf ein Spiel: ${spiele.map((spiel) => spiel.titel).join(", ")}.`);
    window.setTimeout(() => reihe.querySelector("button")?.focus?.({ preventScroll: true }), 30);
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
    const wurmName = s?.wurmName?.(jetzt) || "";
    // Die Einrichtung: Was seit dem letzten Besuch dazugekommen ist, leuchtet.
    // Beim allerersten Besuch ist nichts «neu» – es ist einfach da.
    const ausbau = s?.wagenStufe?.(jetzt) || 0;
    const ausbauVorher = (() => {
      try { return localStorage.getItem(AUSBAU_GESEHEN_KEY) === null ? ausbau : gesehen(AUSBAU_GESEHEN_KEY); } catch { return ausbau; }
    })();
    const svg = a.buildLesezimmer({ glieder, gelesen, wurmName: s?.zeige?.(wurmName) ?? wurmName, ausbau, neuAb: ausbauVorher });
    host.innerHTML = "";
    host.append(svg);

    svg.querySelectorAll("[data-ort]").forEach((knoten) => {
      const ort = knoten.getAttribute("data-ort");
      const los = () => {
        if (ort === "weiter") {
          const naechstes = s?.naechstes?.();
          onPlay?.(naechstes?.page || "buchstabenhaus.html");
          return;
        }
        if (ort === "wurmname") { onPlay?.(TAUFE); return; }
        const spiele = spieleAm(ort);
        if (spiele.length === 1) onPlay?.(spiele[0].page);
        else if (spiele.length > 1) zeigeWahl(host, ort, onPlay);
      };
      knoten.addEventListener("click", los);
      knoten.addEventListener("keydown", (ereignis) => {
        if (ereignis.key === "Enter" || ereignis.key === " ") { ereignis.preventDefault(); los(); }
      });
    });

    // Schlösser erst nach dem Einhängen: getBBox misst nur Gezeichnetes.
    window.requestAnimationFrame(() => Object.keys(ORTE).forEach((ort) => schloss(svg, ort)));

    // Ist der Wurm gewachsen, seit das Kind zuletzt hier war? Dann sagt der
    // Lautsprecher das zuerst. Der Text gehört zur Ansicht: train-home.js
    // räumt ihn beim Verlassen weg.
    const vorher = gesehen();
    const gewachsen = vorher && glieder > vorher;
    if (gewachsen) svg.querySelector(".lesewurm")?.classList.add("is-gewachsen");
    const neues = (a.AUSBAU || []).slice(ausbauVorher, ausbau).map((ding) => ding.name);
    if (gewachsen || neues.length) kids()?.playJingle?.("unlock");
    const hallo = wurmName ? `Dein Lesewurm ${wurmName} sagt hallo. ` : "";
    const teile = [];
    if (gewachsen) teile.push(`Dein Lesewurm ist gewachsen! Er hat jetzt ${glieder} Glieder.`);
    if (neues.length) teile.push(`Neu im Lesewagen: ${neues.length > 1 ? `${neues.slice(0, -1).join(", ")} und ${neues[neues.length - 1]}` : neues[0]}!`);
    kids()?.setHelp?.(teile.length ? `${teile.join(" ")} ${HILFE}` : `${hallo}${HILFE}`);
    merkeGesehen(glieder);
    merkeGesehen(ausbau, AUSBAU_GESEHEN_KEY);
  }

  window.LernappLeseecke = { mount, ZIELE, ORTE, HILFE, TAUFE, spieleAm };
})();
