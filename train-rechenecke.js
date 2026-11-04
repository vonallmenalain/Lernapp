/*
 * train-rechenecke.js – Der Rechenwagen von innen.
 *
 * Eine Ansicht der Bühne wie das Lesezimmer (train-leseecke.js): train-home.js
 * gibt ihr einen Platz, sie zeichnet das Zimmer und meldet, wohin ein Tipp
 * führt. Gezeichnet wird in rechnen-art.js, was ein Kind schon kann, steht in
 * rechnen-stand.js.
 *
 * Jedes Ding im Zimmer ist ein Weg zu Spielen – welches Spiel wo steht, sagt
 * der Katalog (rechnen-stand.js, SPIELE, ort). Steht nur eines dahinter, geht
 * es gleich los; stehen mehrere dahinter, kommt eine Auswahl mit Bildern
 * (dieselbe wie im Lesewagen). Ein Ding ohne Spiel steht gar nicht da: Der
 * Wagen füllt sich mit jeder Etappe.
 *
 *   Drache und Karte   die Hauptmission: er schlägt vor, was dran ist
 *   Schatz             sagt, wie viele Taler es sind – in Türmen zu zehn
 *   Tür                führt in den Lesewagen
 *
 * Der Drache wächst von den Talern (rechnen-stand.js, drache): Hat er seit dem
 * letzten Besuch eine Zacke bekommen, verwandelt er sich vor den Augen des
 * Kindes; sind nur Taler dazugekommen, fallen sie einzeln auf den Haufen.
 *
 * Was hier nicht geschieht: Fortschritt schreiben. Das tun die Spiele.
 */
(() => {
  "use strict";

  const art = () => window.LernappRechenArt || null;
  const stand = () => window.LernappRechenStand || null;
  const kids = () => window.LernappKids || null;

  // Die Dinge im Zimmer und wie die Auswahl dahinter heisst.
  const ORTE = {
    gleis: "Das Rangiergleis",
    tunnel: "Der Tunnel",
    fenster: "Das Fenster",
    perron: "Der Perron",
    wuerfel: "Die Würfel",
    zahlenhaus: "Das Zahlenhaus",
    teppich: "Der Zahlenteppich",
    zaehlrahmen: "Der Zählrahmen",
    kiosk: "Der Kiosk",
    kiste: "Die Spielzeugkiste",
    waage: "Die Waage",
    uhr: "Die Bahnhofsuhr",
    schatz: "Der Schatz",
  };

  // Was hinter dem Schatz ausser Spielen steht: Ansichten ohne Runden, immer
  // frei (sie zählen nichts, sie zeigen nur).
  const ANSICHTEN = {
    schatz: [
      { id: "sternenhimmel", titel: "Sternenhimmel", bild: "✨", zeige: (host) => zeigeSterne(host) },
      { id: "album", titel: "Sammelalbum", bild: "📒", zeige: (host) => zeigeAlbum(host) },
    ],
  };

  // In dieser Reihenfolge hüpfen die Dinge beim Hereinkommen: einmal durchs
  // Zimmer, zuletzt der Drache und seine Karte.
  const REIHUM = ["tuer", "zaehlrahmen", "fenster", "uhr", "kiosk", "kiste", "wuerfel", "gleis", "name", "teppich", "tunnel", "waage", "zahlenhaus", "perron", "schatz", "drache", "mission"];
  const HUEPF_START = 0.5;
  const HUEPF_ABSTAND = 0.1;

  const DRACHE_GESEHEN_KEY = "lernapp.rechnen.drache-gesehen";
  const AUSBAU_GESEHEN_KEY = "lernapp.rechnen.ausbau-gesehen";
  const reduziert = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const warte = (ms) => new Promise((fertig) => window.setTimeout(fertig, ms));

  function gesehen() {
    try {
      const w = JSON.parse(localStorage.getItem(DRACHE_GESEHEN_KEY) || "null");
      return w && Number.isFinite(Number(w.taler)) ? { taler: Number(w.taler), nr: Number(w.nr) || 1 } : null;
    } catch { return null; }
  }
  function merkeGesehen(d) {
    try { localStorage.setItem(DRACHE_GESEHEN_KEY, JSON.stringify({ taler: d.taler, nr: d.nr })); } catch { /* privater Modus */ }
  }
  function ausbauGesehen(jetzt) {
    try { const v = localStorage.getItem(AUSBAU_GESEHEN_KEY); return v === null ? jetzt : Number(v) || 0; } catch { return jetzt; }
  }
  function merkeAusbau(n) {
    try { localStorage.setItem(AUSBAU_GESEHEN_KEY, String(n)); } catch { /* privater Modus */ }
  }

  // Die Spiele hinter einem Ding, in der Reihenfolge des Katalogs.
  function spieleAm(ort) {
    const katalog = stand()?.SPIELE || {};
    const aktiv = stand()?.aktiv || (() => true);
    return Object.entries(katalog).filter(([id, spiel]) => spiel.ort === ort && aktiv(id)).map(([id, spiel]) => ({ id, ...spiel }));
  }
  const gespielt = (page) => Boolean(window.LernappEntitlement?.gameGespielt?.(page));
  function zu(ort) {
    const spiele = spieleAm(ort);
    return spiele.length > 0 && spiele.every((spiel) => gespielt(spiel.page));
  }

  function dracheWer() {
    const name = stand()?.dracheName?.() || "";
    return name || "Dein Drache";
  }

  const HILFE = [
    "Der Rechenwagen.",
    "In der Mitte sitzt dein Drache. Er schlägt vor, was als Nächstes dran ist: Tippe auf ihn oder auf den grünen Knopf.",
    "Für jede Runde bekommt er Taler, so viele wie Sterne – für seine Runde doppelt.",
    "Immer zehn Taler legt er auf einen Turm, und für fünf Taler wächst ihm eine neue Zacke.",
    "Alles, was beim Hereinkommen hüpft, führt zu Spielen. Hat ein Ding mehrere, kannst du eines aussuchen.",
    "Auf dem Schild vor dem Kissen steht der Name deines Drachen.",
    "Die Tür führt in den Lesewagen.",
  ].join(" ");

  // Was der Drache vorschlägt, für die Missionskarte.
  function mission() {
    const n = stand()?.naechstes?.();
    if (!n) return null;
    return { id: n.id, page: n.page, bild: n.bild, name: n.titel, zu: gespielt(n.page) };
  }

  function schatzSatz(n) {
    const truhen = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const e = n % 10;
    const teile = [];
    if (truhen) teile.push(truhen === 1 ? "eine Truhe mit hundert" : `${truhen} Truhen mit je hundert`);
    if (t) teile.push(t === 1 ? "ein Turm zu zehn" : `${t} Türme zu zehn`);
    if (e) teile.push(e === 1 ? "ein einzelner" : `${e} einzelne`);
    if (!n) return "Der Schatz ist noch leer. Spiel eine Runde, dann bekommt dein Drache Taler!";
    return `${n} ${n === 1 ? "Taler" : "Taler"}: ${teile.join(" und ")}.`;
  }

  // Die Auswahl hinter einem Ding – wie im Lesewagen, mit eigenen Klassen.
  function zeigeWahl(host, ort, onPlay) {
    host.querySelector(".rechen-wahl")?.remove();
    const spiele = [...spieleAm(ort), ...(ANSICHTEN[ort] || [])];
    const titel = ORTE[ort] || "";
    const huelle = document.createElement("div");
    huelle.className = "rechen-wahl";
    huelle.setAttribute("role", "dialog");
    huelle.setAttribute("aria-label", titel);
    const karte = document.createElement("div");
    karte.className = "rechen-wahl-karte";
    const kopf = document.createElement("p");
    kopf.className = "rechen-wahl-titel";
    kopf.textContent = titel;
    const knopfZu = document.createElement("button");
    knopfZu.type = "button";
    knopfZu.className = "rechen-wahl-zu";
    knopfZu.setAttribute("aria-label", "Schliessen");
    knopfZu.textContent = "✕";
    const reihe = document.createElement("div");
    reihe.className = "rechen-wahl-spiele";
    spiele.forEach((spiel) => {
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "rechen-wahl-spiel";
      knopf.dataset.spiel = spiel.id;
      if (spiel.page) knopf.dataset.page = spiel.page;
      const verbraucht = spiel.page ? gespielt(spiel.page) : false;
      knopf.setAttribute("aria-label", `${spiel.titel}${verbraucht ? ", gesperrt" : ""}`);
      const bild = document.createElement("span");
      bild.className = "rechen-wahl-bild";
      bild.textContent = spiel.bild || "🔢";
      const name = document.createElement("span");
      name.className = "rechen-wahl-name";
      name.textContent = spiel.titel;
      knopf.append(bild, name);
      if (verbraucht) {
        knopf.classList.add("is-locked");
        const s = document.createElement("span");
        s.className = "rechen-wahl-schloss";
        s.setAttribute("aria-hidden", "true");
        s.textContent = "🔒";
        knopf.append(s);
      }
      knopf.addEventListener("click", () => { if (spiel.zeige) { schliessen(); spiel.zeige(host); } else onPlay?.(spiel.page); });
      reihe.append(knopf);
    });
    const schliessen = () => {
      huelle.remove();
      kids()?.setHelp?.(HILFE);
      document.removeEventListener("keydown", taste);
    };
    const taste = (ereignis) => { if (ereignis.key === "Escape") schliessen(); };
    knopfZu.addEventListener("click", schliessen);
    huelle.addEventListener("click", (ereignis) => { if (ereignis.target === huelle) schliessen(); });
    document.addEventListener("keydown", taste);
    const zeile = document.createElement("div");
    zeile.className = "rechen-wahl-kopf";
    zeile.append(kopf, knopfZu);
    karte.append(zeile, reihe);
    huelle.append(karte);
    host.append(huelle);
    kids()?.setHelp?.(`${titel}. Tippe auf ein Spiel: ${spiele.map((spiel) => spiel.titel).join(", ")}.`);
    window.setTimeout(() => reihe.querySelector("button")?.focus?.({ preventScroll: true }), 30);
  }

  // Die Tür: in den Lesewagen oder in den Englischwagen. Zwei Bilder der
  // Wagen, wie sie im Lernzug stehen.
  function zeigeTueren(host) {
    host.querySelector(".rechen-wahl")?.remove();
    const z = window.LernappLernzugArt;
    const huelle = document.createElement("div");
    huelle.className = "rechen-wahl rechen-tueren";
    huelle.setAttribute("role", "dialog");
    huelle.setAttribute("aria-label", "Wohin?");
    const karte = document.createElement("div");
    karte.className = "rechen-wahl-karte";
    const kopf = document.createElement("div");
    kopf.className = "rechen-wahl-kopf";
    const titel = document.createElement("p");
    titel.className = "rechen-wahl-titel";
    titel.textContent = "Wohin?";
    const zuKnopf = document.createElement("button");
    zuKnopf.type = "button";
    zuKnopf.className = "rechen-wahl-zu";
    zuKnopf.setAttribute("aria-label", "Schliessen");
    zuKnopf.textContent = "✕";
    kopf.append(titel, zuKnopf);
    const reihe = document.createElement("div");
    reihe.className = "rechen-wahl-spiele";
    const schliessen = () => { huelle.remove(); kids()?.setHelp?.(HILFE); document.removeEventListener("keydown", taste); };
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    [["englisch", "Englischwagen", offen.onEnglisch], ["lesen", "Lesewagen", offen.onLesen]].forEach(([id, name, los]) => {
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "rechen-wahl-spiel";
      knopf.dataset.tuer = id;
      knopf.setAttribute("aria-label", `In den ${name}`);
      const bild = document.createElement("span");
      bild.className = "rechen-wahl-bild";
      if (z) bild.append(z.wagenSvg(z.buildLernwagen(id, 15, id === "lesen" ? { glieder: 3 } : {}), z.WAGEN_W));
      const wort = document.createElement("span");
      wort.className = "rechen-wahl-name";
      wort.textContent = name;
      knopf.append(bild, wort);
      knopf.addEventListener("click", () => { schliessen(); los?.(); });
      reihe.append(knopf);
    });
    zuKnopf.addEventListener("click", schliessen);
    huelle.addEventListener("click", (e) => { if (e.target === huelle) schliessen(); });
    document.addEventListener("keydown", taste);
    karte.append(kopf, reihe);
    huelle.append(karte);
    host.append(huelle);
    kids()?.setHelp?.("Wohin? In den Englischwagen oder in den Lesewagen.");
  }

  // Die Taufe: Namen zum Antippen (ein Kind tippt, liest aber noch nicht
  // jedes Wort – die Stimme sagt den Namen), ein Würfel für einen
  // zufälligen, und für Erwachsene ein Feld für einen eigenen.
  const NAMEN = ["Zacki", "Funki", "Flammi", "Rubi", "Knobel", "Zahlino", "Glitzer", "Puffi", "Fauchi", "Zipfel"];
  function zeigeTaufe(host) {
    host.querySelector(".rechen-wahl")?.remove();
    const s = stand();
    const huelle = document.createElement("div");
    huelle.className = "rechen-wahl rechen-taufe";
    huelle.setAttribute("role", "dialog");
    huelle.setAttribute("aria-label", "Wie soll dein Drache heissen?");
    const karte = document.createElement("div");
    karte.className = "rechen-wahl-karte";
    const kopf = document.createElement("div");
    kopf.className = "rechen-wahl-kopf";
    const titel = document.createElement("p");
    titel.className = "rechen-wahl-titel";
    titel.textContent = "Wie soll dein Drache heissen?";
    const zuKnopf = document.createElement("button");
    zuKnopf.type = "button";
    zuKnopf.className = "rechen-wahl-zu";
    zuKnopf.setAttribute("aria-label", "Schliessen");
    zuKnopf.textContent = "✕";
    kopf.append(titel, zuKnopf);
    const reihe = document.createElement("div");
    reihe.className = "rechen-taufe-namen";
    const schliessen = () => { huelle.remove(); kids()?.setHelp?.(HILFE); document.removeEventListener("keydown", taste); };
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    const taufen = (name) => {
      const sauber = s.nameSauber(name);
      if (!sauber) return;
      s.dracheTaufen(sauber);
      kids()?.playJingle?.("unlock");
      kids()?.speak?.(NAMEN.includes(sauber) ? `Dein Drache heisst jetzt ${sauber}!` : "Dein Drache hat jetzt einen Namen!");
      schliessen();
      zeichne({ huepfen: false });
    };
    const knopf = (text, wert, klasse = "") => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `rechen-taufe-name ${klasse}`.trim();
      b.textContent = text;
      b.addEventListener("click", () => {
        if (wert === null) { const n = NAMEN[Math.floor(Math.random() * NAMEN.length)]; kids()?.speak?.(n); taufen(n); return; }
        taufen(wert);
      });
      return b;
    };
    NAMEN.forEach((n) => reihe.append(knopf(n, n)));
    reihe.append(knopf("🎲", null, "ist-wuerfel"));
    const form = document.createElement("form");
    form.className = "rechen-taufe-eigen";
    const feld = document.createElement("input");
    feld.type = "text";
    feld.id = "rechen-taufe-feld";
    feld.maxLength = 16;
    feld.placeholder = "Eigener Name";
    feld.setAttribute("aria-label", "Eigener Name für den Drachen");
    const ok = document.createElement("button");
    ok.type = "submit";
    ok.textContent = "OK";
    form.append(feld, ok);
    form.addEventListener("submit", (e) => { e.preventDefault(); taufen(feld.value); });
    zuKnopf.addEventListener("click", schliessen);
    huelle.addEventListener("click", (e) => { if (e.target === huelle) schliessen(); });
    document.addEventListener("keydown", taste);
    karte.append(kopf, reihe, form);
    huelle.append(karte);
    host.append(huelle);
    kids()?.setHelp?.("Wie soll dein Drache heissen? Tippe auf einen Namen, oder auf den Würfel für einen zufälligen.");
    window.setTimeout(() => reihe.querySelector("button")?.focus?.({ preventScroll: true }), 30);
  }

  // Der Sternenhimmel: Jede Plus-Aufgabe, die sitzt (schnell und richtig an
  // zwei Tagen), ist ein leuchtender Stern. Drei Sternbilder: plus eins, das
  // Doppelte, die Zehnerfreunde. Ein Tipp auf einen Stern sagt seine Aufgabe.
  const STERNBILDER = [
    { name: "Plus eins", aufgaben: Array.from({ length: 10 }, (_, i) => [i, 1]), ort: (i) => [120 + i * 34, 330 - Math.sin(i / 9 * Math.PI) * 60] },
    { name: "Das Doppelte", aufgaben: Array.from({ length: 10 }, (_, i) => [i + 1, i + 1]), ort: (i) => [480 + Math.cos(i / 9 * Math.PI) * 120, 230 - Math.sin(i / 9 * Math.PI) * 120 + 60] },
    { name: "Zehnerfreunde", aufgaben: Array.from({ length: 9 }, (_, i) => [i + 1, 9 - i]), ort: (i) => [790 + Math.cos(i / 9 * Math.PI * 2) * 90, 230 + Math.sin(i / 9 * Math.PI * 2) * 90] },
  ];
  function zeigeSterne(host) {
    host.querySelector(".rechen-wahl")?.remove();
    const s = stand();
    const jetzt = s.stand();
    const sitzt = (a, b) => s.sitzt(jetzt.aufgaben?.[`${a}+${b}`]) || s.sitzt(jetzt.aufgaben?.[`${b}+${a}`]);
    let leuchten = 0;
    let alle = 0;
    let bild = '<svg viewBox="0 0 1000 460" class="rechen-himmel-svg" role="img" aria-label="Der Sternenhimmel der Plus-Aufgaben"><rect width="1000" height="460" rx="24" fill="#1d2a5c"/>';
    for (let i = 0; i < 40; i += 1) bild += `<circle cx="${(i * 97) % 1000}" cy="${(i * 53) % 460}" r="1.4" fill="#ffffff" opacity="0.5"/>`;
    STERNBILDER.forEach((sb) => {
      const punkte = sb.aufgaben.map((_, i) => sb.ort(i));
      bild += `<polyline points="${punkte.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#5a6aa8" stroke-width="2"/>`;
      sb.aufgaben.forEach(([a, b], i) => {
        const [x, y] = punkte[i];
        const an = sitzt(a, b);
        alle += 1;
        if (an) leuchten += 1;
        bild += `<g class="rechen-stern${an ? " ist-an" : ""}" data-satz="${a} und ${b} sind ${a + b}." role="button" tabindex="0" aria-label="${a} plus ${b}"><path d="M${x} ${y - 14} l4 9 10 1 -8 7 3 10 -9 -5 -9 5 3 -10 -8 -7 10 -1 Z" fill="${an ? "#ffd166" : "#3a4a85"}"/><circle cx="${x}" cy="${y}" r="20" fill="#000" fill-opacity="0"/></g>`;
      });
      const [lx, ly] = sb.ort(Math.floor(sb.aufgaben.length / 2));
      bild += `<text x="${lx}" y="${ly + 50}" text-anchor="middle" font-size="18" font-weight="800" fill="#c9d4ff" font-family="'Baloo 2', Nunito, sans-serif">${sb.name}</text>`;
    });
    bild += "</svg>";
    const huelle = document.createElement("div");
    huelle.className = "rechen-wahl rechen-himmel";
    huelle.setAttribute("role", "dialog");
    huelle.setAttribute("aria-label", "Sternenhimmel");
    const karte = document.createElement("div");
    karte.className = "rechen-wahl-karte rechen-himmel-karte";
    const kopf = document.createElement("div");
    kopf.className = "rechen-wahl-kopf";
    const titel = document.createElement("p");
    titel.className = "rechen-wahl-titel";
    titel.textContent = `Sternenhimmel: ${leuchten} von ${alle} Sternen leuchten`;
    const zuKnopf = document.createElement("button");
    zuKnopf.type = "button";
    zuKnopf.className = "rechen-wahl-zu";
    zuKnopf.setAttribute("aria-label", "Schliessen");
    zuKnopf.textContent = "✕";
    kopf.append(titel, zuKnopf);
    const flaeche = document.createElement("div");
    flaeche.innerHTML = bild;
    karte.append(kopf, flaeche);
    huelle.append(karte);
    host.append(huelle);
    const schliessen = () => { huelle.remove(); kids()?.setHelp?.(HILFE); document.removeEventListener("keydown", taste); };
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    zuKnopf.addEventListener("click", schliessen);
    huelle.addEventListener("click", (e) => { if (e.target === huelle) schliessen(); });
    document.addEventListener("keydown", taste);
    huelle.querySelectorAll(".rechen-stern").forEach((st) => st.addEventListener("click", () => kids()?.speak?.(st.dataset.satz)));
    const satz = leuchten ? `${leuchten === 1 ? "Ein Stern leuchtet" : `${leuchten} Sterne leuchten`}. Jeder Stern ist eine Aufgabe, die du schon weisst, ohne zu zählen.` : "Noch ist der Himmel dunkel. Jede Aufgabe, die du schnell und richtig weisst, wird ein Stern.";
    kids()?.setHelp?.(satz);
    kids()?.speak?.(satz);
  }

  // Das Sammelalbum «Zahlen in der Welt»: für je fünf Taler ein Bild mehr,
  // jedes mit so vielen Dingen, in Reihen zu fünf.
  const ALBUM = [
    ["☀️", "Sonne", "Sonnen"], ["🧦", "Socke", "Socken"], ["🛞", "Rad", "Räder"], ["🐾", "Pfote", "Pfoten"], ["⭐", "Stern", "Sterne"],
    ["🥚", "Ei", "Eier"], ["🐟", "Fisch", "Fische"], ["🐚", "Muschel", "Muscheln"], ["🎳", "Kegel", "Kegel"], ["🍓", "Erdbeere", "Erdbeeren"],
    ["🍎", "Apfel", "Äpfel"], ["🌷", "Tulpe", "Tulpen"], ["🐞", "Marienkäfer", "Marienkäfer"], ["🎈", "Ballon", "Ballone"], ["🐥", "Küken", "Küken"],
    ["🍪", "Guetzli", "Guetzli"], ["🌰", "Nuss", "Nüsse"], ["🦋", "Schmetterling", "Schmetterlinge"], ["🍄", "Pilz", "Pilze"], ["🐝", "Biene", "Bienen"],
  ];
  const albumSatz = (n) => `${n} ${n === 1 ? ALBUM[0][1] : ALBUM[n - 1][2]}.`;
  function zeigeAlbum(host) {
    host.querySelector(".rechen-wahl")?.remove();
    const s = stand();
    const offenBis = Math.min(ALBUM.length, 1 + Math.floor(s.taler() / 5));
    const huelle = document.createElement("div");
    huelle.className = "rechen-wahl rechen-album";
    huelle.setAttribute("role", "dialog");
    huelle.setAttribute("aria-label", "Sammelalbum");
    const karte = document.createElement("div");
    karte.className = "rechen-wahl-karte rechen-album-karte";
    const kopf = document.createElement("div");
    kopf.className = "rechen-wahl-kopf";
    const titel = document.createElement("p");
    titel.className = "rechen-wahl-titel";
    titel.textContent = `Zahlen in der Welt: ${offenBis} von ${ALBUM.length}`;
    const zuKnopf = document.createElement("button");
    zuKnopf.type = "button";
    zuKnopf.className = "rechen-wahl-zu";
    zuKnopf.setAttribute("aria-label", "Schliessen");
    zuKnopf.textContent = "✕";
    kopf.append(titel, zuKnopf);
    const raster = document.createElement("div");
    raster.className = "rechen-album-raster";
    ALBUM.forEach(([emoji, ein, mehr], i) => {
      const n = i + 1;
      const blatt = document.createElement("button");
      blatt.type = "button";
      blatt.className = `rechen-album-blatt${n <= offenBis ? "" : " ist-zu"}`;
      if (n <= offenBis) {
        blatt.setAttribute("aria-label", `${n} ${n === 1 ? ein : mehr}`);
        const zahl = document.createElement("span");
        zahl.className = "rechen-album-zahl";
        zahl.textContent = String(n);
        const dinge = document.createElement("span");
        dinge.className = "rechen-album-dinge";
        for (let k = 0; k < n; k += 1) { const d = document.createElement("span"); d.textContent = emoji; dinge.append(d); }
        blatt.append(zahl, dinge);
        blatt.addEventListener("click", () => kids()?.speak?.(albumSatz(n)));
      } else {
        blatt.setAttribute("aria-label", "Noch zu");
        blatt.textContent = "?";
      }
      raster.append(blatt);
    });
    karte.append(kopf, raster);
    huelle.append(karte);
    host.append(huelle);
    const schliessen = () => { huelle.remove(); kids()?.setHelp?.(HILFE); document.removeEventListener("keydown", taste); };
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    zuKnopf.addEventListener("click", schliessen);
    huelle.addEventListener("click", (e) => { if (e.target === huelle) schliessen(); });
    document.addEventListener("keydown", taste);
    const satz = "Das Sammelalbum. Für je fünf Taler kommt ein neues Bild dazu. Tippe auf ein Bild, und zähl mit!";
    kids()?.setHelp?.(satz);
    kids()?.speak?.(satz);
  }

  // Aufträge für draussen: Nach einer Weile in der Rechenecke gähnt der
  // Drache und gibt einen Auftrag für die echte Welt. Beim nächsten Besuch an
  // einem anderen Tag fragt er nach – geschafft gibt einen Taler.
  const AUFTRAEGE = [
    "Zähl beim Znacht, wie viele Gabeln auf dem Tisch liegen!",
    "Zähl auf dem nächsten Spaziergang alle roten Autos!",
    "Zähl die Treppenstufen bis zu eurer Tür!",
    "Zähl, wie viele Schuhe bei der Haustür stehen!",
    "Zähl, wie viele Fenster euer Haus hat!",
    "Hüpf zehnmal auf einem Bein und zähl laut mit!",
    "Zähl beim Zmorge, wie viele Löffel auf dem Tisch liegen!",
    "Zähl alle Kissen auf eurem Sofa!",
  ];
  const BESUCH_KEY = "lernapp.rechnen.besuch";
  const AUFTRAG_KEY = "lernapp.rechnen.auftrag";
  const tagHeute = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const liesJson = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
  const schreibJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* privater Modus */ } };
  function auftragPruefen(host) {
    const s = stand();
    const heute = tagHeute();
    let besuch = liesJson(BESUCH_KEY);
    if (!besuch || besuch.tag !== heute) { besuch = { tag: heute, seit: Date.now() }; schreibJson(BESUCH_KEY, besuch); }
    const auftrag = liesJson(AUFTRAG_KEY);
    const karte = (titel, text, knoepfe) => {
      host.querySelector(".rechen-wahl")?.remove();
      const huelle = document.createElement("div");
      huelle.className = "rechen-wahl rechen-auftrag";
      huelle.setAttribute("role", "dialog");
      huelle.setAttribute("aria-label", titel);
      const k = document.createElement("div");
      k.className = "rechen-wahl-karte";
      const kopf = document.createElement("p");
      kopf.className = "rechen-wahl-titel";
      kopf.textContent = titel;
      const p = document.createElement("p");
      p.className = "rechen-auftrag-text";
      p.textContent = text;
      const reihe = document.createElement("div");
      reihe.className = "rechen-auftrag-knoepfe";
      knoepfe.forEach(([label, fn, klasse]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `rechen-taufe-name ${klasse || ""}`.trim();
        b.textContent = label;
        b.addEventListener("click", () => { huelle.remove(); kids()?.setHelp?.(HILFE); fn(); });
        reihe.append(b);
      });
      k.append(kopf, p, reihe);
      huelle.append(k);
      host.append(huelle);
      window.setTimeout(() => reihe.querySelector("button")?.focus?.({ preventScroll: true }), 30);
    };
    // Ein Auftrag von einem früheren Tag wartet noch.
    if (auftrag && auftrag.tag !== heute && !auftrag.erledigt) {
      const text = AUFTRAEGE[auftrag.nr] || AUFTRAEGE[0];
      const frage = `Hast du deinen Auftrag geschafft? ${text}`;
      karte("Dein Auftrag", text, [
        ["Ja, geschafft!", () => { s.auftragErledigt(); schreibJson(AUFTRAG_KEY, { ...auftrag, erledigt: true }); kids()?.playJingle?.("unlock"); kids()?.speak?.("Super! Dafür bekommt dein Drache einen Taler."); }, "ist-ja"],
        ["Noch nicht", () => { schreibJson(AUFTRAG_KEY, { ...auftrag, erledigt: true }); kids()?.speak?.("Macht nichts. Vielleicht ein anderes Mal!"); }],
      ]);
      kids()?.speak?.(frage);
      return true;
    }
    const grenze = s.gaehnenNach();
    if (!grenze || (auftrag && auftrag.tag === heute)) return false;
    if (Date.now() - besuch.seit < grenze * 60 * 1000) return false;
    const nr = Math.floor(Math.random() * AUFTRAEGE.length);
    schreibJson(AUFTRAG_KEY, { tag: heute, nr, erledigt: false });
    const satz = `Dein Drache gähnt: Zeit für eine Pause! Hier ist ein Auftrag für draussen. ${AUFTRAEGE[nr]}`;
    karte("Zeit für eine Pause!", AUFTRAEGE[nr], [["Mach ich!", () => {}, "ist-ja"]]);
    kids()?.speak?.(satz);
    return true;
  }

  let offen = null;

  // Was das Zimmer zeigt – ändert es sich, wird neu gezeichnet.
  function zustand() {
    const s = stand();
    if (!s) return "";
    const jetzt = s.stand();
    const d = s.drache(jetzt);
    const m = mission();
    return JSON.stringify([d.taler, m ? [m.id, m.zu] : null, s.wagenStufe(jetzt), s.dracheName(jetzt), Object.keys(ORTE).filter(zu)]);
  }

  /*
   *   host     das Element auf der Bühne, in das das Zimmer kommt
   *   onPlay   (seite) => …, öffnet ein Spiel (train-home.js, enterGame)
   *   onLesen  () => …, geht durch die Tür in den Lesewagen
   */
  function mount({ host, onPlay, onLesen, onEnglisch = null }) {
    if (!art() || !stand() || !host) return;
    offen = { host, onPlay, onLesen, onEnglisch, zustand: "", laeuft: false };
    zeichne();
  }

  function auffrischen() {
    if (!offen?.host.isConnected || offen.laeuft || zustand() === offen.zustand) return false;
    zeichne({ huepfen: false });
    return true;
  }

  // Baut das Zimmer und hängt es ein.
  //   d       wie der Drache dasteht ({ leben, stufe, ei, neu, weg, knall })
  //   taler   wie viele Taler der Haufen zeigt
  //   karte   die Missionskarte
  function baue({ d, taler, karte, huepfen = true, ausbauNeuAb = Infinity }) {
    const { host, onPlay, onLesen } = offen;
    const a = art();
    const s = stand();
    const jetzt = s.stand();
    const orte = new Set(Object.keys(ORTE).filter((ort) => spieleAm(ort).length > 0));
    const gesperrt = new Set([...orte].filter(zu));
    const label = `${dracheWer()}: ${s.DRACHE_NAMEN[s.DRACHE_LEBEN[d.leben]] || "Drache"} mit ${d.stufe} ${d.stufe === 1 ? "Zacke" : "Zacken"}. Antippen, und er schlägt etwas vor.`;
    const svg = a.svg(a.zimmer({
      orte, drache: d, regal: d.regal || 0, taler, karte, zu: gesperrt,
      ausbau: s.wagenStufe(jetzt), neuAb: ausbauNeuAb,
      labels: { drache: label },
      name: s.dracheName(jetzt),
    }));
    const alt = host.querySelector(":scope > .rechenzimmer-svg");
    if (!alt && huepfen && !reduziert()) svg.classList.add("is-huepfen");
    if (alt) alt.replaceWith(svg);
    else host.append(svg);

    svg.querySelectorAll("[data-ort]").forEach((knoten) => {
      const ort = knoten.getAttribute("data-ort");
      const reihe = REIHUM.indexOf(ort);
      knoten.style.setProperty("--ort-verzug", `${(HUEPF_START + Math.max(0, reihe) * HUEPF_ABSTAND).toFixed(2)}s`);
      const los = () => {
        if (offen?.laeuft && ort !== "tuer") return;
        if (ort === "drache" || ort === "mission") {
          const m = mission();
          if (m) s.missionStarten(m.id);
          onPlay?.(m?.page || "kuppelplus.html");
          return;
        }
        if (ort === "tuer") {
          // Der Rechenwagen hängt im Lernzug zwischen Lese- und Englischwagen:
          // Die Tür fragt, wohin.
          if (offen?.onEnglisch && onLesen) zeigeTueren(host);
          else onLesen?.();
          return;
        }
        if (ort === "name") { zeigeTaufe(host); return; }
        if (ort === "schatz") {
          kids()?.speak?.(schatzSatz(s.taler()));
          if (spieleAm("schatz").length || ANSICHTEN.schatz?.length) zeigeWahl(host, "schatz", onPlay);
          return;
        }
        const spiele = spieleAm(ort);
        if (spiele.length === 1) onPlay?.(spiele[0].page);
        else if (spiele.length > 1) zeigeWahl(host, ort, onPlay);
      };
      knoten.addEventListener("click", los);
      knoten.addEventListener("keydown", (ereignis) => {
        if (ereignis.key === "Enter" || ereignis.key === " ") { ereignis.preventDefault(); los(); }
      });
    });
    return svg;
  }

  function karteFuer(m, d, extra = {}) {
    if (!m) return null;
    const a = art();
    return { name: m.name, bild: m.bild, zu: m.zu, wer: dracheWer(), hat: d.hat, braucht: d.braucht, naechsteFarbe: a.fuenfer(d.stufe), ...extra };
  }

  async function zeichne({ huepfen = true } = {}) {
    const s = stand();
    const a = art();
    const meins = offen;
    const vorbei = () => offen !== meins || !meins.host.isConnected;
    const anfang = zustand();
    const jetzt = s.stand();
    const d = s.drache(jetzt);
    const m = mission();
    const vorher = gesehen() || { taler: d.taler, nr: d.nr };
    const mehr = Math.max(0, d.taler - vorher.taler);
    // Verwandelt hat er sich, wenn er eine Zacke mehr hat – oder wenn er aus
    // dem Ei geschlüpft ist (der erste Taler).
    const geschluepft = vorher.taler === 0 && d.taler > 0;
    const verwandelt = d.nr > vorher.nr || geschluepft;
    const ausbau = s.wagenStufe(jetzt);
    const ausbauVorher = ausbauGesehen(ausbau);
    const neues = (a.AUSBAU || []).slice(ausbauVorher, ausbau).map((ding) => ding.name);
    const bild = (dd, extra = {}) => ({ leben: dd.leben, stufe: dd.stufe, regal: dd.regal, ei: dd.taler === 0, ...extra });

    if (mehr > 0 && !reduziert()) {
      // Die neuen Taler fallen einzeln auf den Haufen; die Leiste füllt sich
      // mit. Dann – wenn es so weit ist – verwandelt sich der Drache.
      offen.laeuft = true;
      kids()?.setHelp?.(HILFE);
      let t = vorher.taler;
      let vor = s.dracheAus(t);
      baue({ d: bild(vor), taler: t, karte: karteFuer(m, vor), huepfen: false });
      await warte(600);
      const schritt = Math.max(90, Math.min(260, 2200 / mehr));
      while (t < d.taler) {
        if (vorbei()) return;
        t += 1;
        const zwischen = s.dracheAus(t);
        const neueZacke = zwischen.nr > vor.nr || vor.taler === 0;
        const svg = offen.host.querySelector(".rechenzimmer-svg");
        const haufen = svg?.querySelector(".rw-schatz");
        if (haufen) haufen.innerHTML = a.schatz(t);
        const kartenOrt = svg?.querySelector('[data-ort="mission"] .rechen-ort-bild');
        // Die Leiste: Wird die Zacke voll, bleibt sie voll stehen, bis der
        // Drache sich verwandelt hat.
        if (kartenOrt && m) kartenOrt.innerHTML = a.karte(karteFuer(m, neueZacke ? { ...vor, hat: vor.braucht } : zwischen));
        kids()?.playJingle?.("star");
        await warte(schritt);
        if (neueZacke && !vorbei()) {
          // Eine neue Zacke! Der Drache wird kurz klein und kommt mit einem Knall wieder.
          baue({ d: bild(vor, { weg: true }), taler: t, karte: karteFuer(m, { ...vor, hat: vor.braucht }), huepfen: false });
          await warte(450);
          if (vorbei()) return;
          baue({ d: bild(zwischen, { neu: true, knall: true }), taler: t, karte: karteFuer(m, zwischen), huepfen: false });
          kids()?.playJingle?.("unlock");
          await warte(900);
        }
        vor = zwischen;
      }
      if (vorbei()) return;
    }

    baue({ d: bild(d, { neu: verwandelt && reduziert() }), taler: d.taler, karte: karteFuer(m, d), huepfen: huepfen && mehr === 0, ausbauNeuAb: ausbauVorher });
    offen.laeuft = false;

    const teile = [];
    if (verwandelt) {
      const ueber = a.UEBERRASCHUNG[d.stufe];
      const lebenNeu = s.dracheAus(vorher.taler).leben < d.leben;
      if (geschluepft && d.nr === 1) teile.push("Überraschung! Dein Drache ist aus dem Ei geschlüpft!");
      else if (lebenNeu) teile.push(`Überraschung! Dein Drache ist fertig gewachsen und sitzt jetzt auf dem Regal. Ein neuer Drache ist da: der ${s.DRACHE_NAMEN[s.DRACHE_LEBEN[d.leben]]}!`);
      else if (ueber === "besonders") teile.push(`Überraschung! Dein Drache hat jetzt ${d.stufe} Zacken – und etwas Neues: schau genau hin!`);
      else teile.push(`Überraschung! Dein Drache hat eine neue Zacke. Jetzt sind es ${d.stufe}.`);
    } else if (mehr > 0) {
      teile.push(`${mehr === 1 ? "Ein neuer Taler" : `${mehr} neue Taler`} für deinen Drachen!`);
    }
    if (neues.length) {
      kids()?.playJingle?.("unlock");
      teile.push(`Neu im Rechenwagen: ${neues.map((ding) => `${ding.charAt(0).toUpperCase()}${ding.slice(1)}!`).join(" ")}`);
    }
    let satz = "";
    if (m) {
      satz = `Dein Drache hat eine Idee: ${m.name}! Tippe auf ihn, und es geht los.`;
      if (d.braucht > 0) {
        const rest = Math.max(1, d.braucht - d.hat);
        satz += ` Noch ${rest} ${rest === 1 ? "Taler" : "Taler"} bis zur nächsten ${d.stufe >= s.DRACHE_STUFEN ? "Überraschung" : "Zacke"}.`;
      }
    }
    if (teile.length) kids()?.setHelp?.(`${teile.join(" ")} ${satz} ${HILFE}`);
    else if (!offen.host.querySelector(".rechen-wahl")) kids()?.setHelp?.(`${satz} ${HILFE}`);
    merkeGesehen(d);
    merkeAusbau(ausbau);
    if (!offen.host.querySelector(".rechen-wahl")) auftragPruefen(offen.host);
    offen.zustand = anfang;
    if (zustand() !== anfang) auffrischen();
  }

  stand()?.onChange?.(() => auffrischen());

  window.LernappRechenecke = { mount, auffrischen, ORTE, ANSICHTEN, HILFE, REIHUM, NAMEN, ALBUM, AUFTRAEGE, albumSatz, spieleAm, schatzSatz };
})();
