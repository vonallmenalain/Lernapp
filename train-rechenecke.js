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
  };

  // In dieser Reihenfolge hüpfen die Dinge beim Hereinkommen: einmal durchs
  // Zimmer, zuletzt der Drache und seine Karte.
  const REIHUM = ["tuer", "zaehlrahmen", "fenster", "uhr", "kiosk", "kiste", "wuerfel", "gleis", "teppich", "tunnel", "waage", "zahlenhaus", "perron", "schatz", "drache", "mission"];
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
    return Object.entries(katalog).filter(([, spiel]) => spiel.ort === ort).map(([id, spiel]) => ({ id, ...spiel }));
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
    "Die Dinge im Wagen sind Spiele: das Gleis, der Tunnel, die Fenster, die Würfel und das Zahlenhaus.",
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
    const spiele = spieleAm(ort);
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
      knopf.dataset.page = spiel.page;
      const verbraucht = gespielt(spiel.page);
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
      knopf.addEventListener("click", () => onPlay?.(spiel.page));
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
  function mount({ host, onPlay, onLesen }) {
    if (!art() || !stand() || !host) return;
    offen = { host, onPlay, onLesen, zustand: "", laeuft: false };
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
        if (ort === "tuer") { onLesen?.(); return; }
        if (ort === "schatz") { kids()?.speak?.(schatzSatz(s.taler())); return; }
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
    offen.zustand = anfang;
    if (zustand() !== anfang) auffrischen();
  }

  stand()?.onChange?.(() => auffrischen());

  window.LernappRechenecke = { mount, auffrischen, ORTE, HILFE, REIHUM, spieleAm, schatzSatz };
})();
