/*
 * train-bau.js – Die Bauecke: vier Häuser an einer Strasse, Stockwerk für
 * Stockwerk gebaut und Zimmer für Zimmer eingerichtet.
 * ---------------------------------------------------------------------------
 * Konzept: docs/BAUECKE-KONZEPT.md. Hier steht, was man sieht und antippt:
 *
 *   Hausansicht   ein Haus im Querschnitt, darüber der Umschalter für die vier
 *                 Häuser, rechts die Ziegel und der Rätsel-Knopf. Ziehen
 *                 schiebt das Haus hinauf und hinunter, Wischen zur Seite
 *                 wechselt das Haus. Ein Tipp auf ein Stockwerk zoomt hinein.
 *   Zimmer        das Stockwerk bildschirmfüllend, unten die Schublade mit den
 *                 Dingen, die Wand- und Bodenfarben. Dinge werden gezogen,
 *                 fallen auf den Boden oder auf einen Tisch, lassen sich
 *                 anmalen, umdrehen, vergrössern und wegräumen.
 *   Tier-Tafel    wer hier wohnt, was es sich wünscht (gelbe, grüne, blaue
 *                 Sterne), wie zufrieden es ist – und ein kleines Gespräch.
 *
 * Die Ziegel kommen aus Rätseln: Der Knopf öffnet ein zufälliges Rätsel
 * (journey-plan.js, bauRaetsel), und wer es löst, bekommt eine Palette – genug
 * für ein Stockwerk. Zurück in der Bauecke bringt der Zug sie.
 *
 * Bewegung läuft über eine einzige requestAnimationFrame-Schleife und
 * Attribute, nicht über CSS-Animationen an SVG-Teilen: Auf dem Xiaomi Pad
 * machten die aus jedem Teil eine eigene Ebene (siehe Konzept 7.3). Die
 * Schleife schläft, wenn nichts mehr läuft.
 *
 * Wird nach bau-moebel.js, bau-katalog.js, bau-stand.js und bau-art.js
 * geladen; train-home.js ruft mount() auf, wenn das Kind den Bauplatz antippt.
 */
(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const A = () => window.LernappBauArt;
  const M = () => window.LernappBauMoebel;
  const K = () => window.LernappBauKatalog;
  const S = () => window.LernappBauStand;
  const kids = () => window.LernappKids || null;
  const reise = () => window.LernappReise || null;
  const schranke = () => window.LernappEntitlement || null;
  const reduced = () => Boolean(kids()?.prefersReducedMotion?.()) || Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  // ---------------------------------------------------------------------------
  // Kleine Helfer
  // ---------------------------------------------------------------------------
  function el(tag, cls = "", attrs = {}) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
      else node.setAttribute(key, value);
    });
    return node;
  }
  function knopf(cls, label, inhalt, onClick) {
    const b = el("button", cls, { type: "button", "aria-label": label, title: label });
    if (inhalt) b.innerHTML = inhalt;
    if (onClick) b.addEventListener("click", onClick);
    return b;
  }
  function svgVon(markup, viewBox, cls = "") {
    return `<svg xmlns="${NS}" viewBox="${viewBox}"${cls ? ` class="${cls}"` : ""} aria-hidden="true" focusable="false">${markup}</svg>`;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const farbeHex = (id, fallback = "#cccccc") => K()?.FARBE?.[id]?.hex || fallback;

  // Sprechen: jedes Antippen von etwas, das man wählt, wird vorgelesen – so
  // hat es sich der Auftraggeber gewünscht. Ist das Vorlesen ausgeschaltet
  // (kids.js, lernapp.tts), bleibt es still.
  function sag(text) {
    if (!text) return;
    kids()?.speak?.(text);
  }
  function hilfe(text) { kids()?.setHelp?.(text || ""); }
  function klang(name) { kids()?.playJingle?.(name); }

  // --- Bewegung -------------------------------------------------------------
  const ease = {
    out: (t) => 1 - (1 - t) ** 3,
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
    in: (t) => t * t,
    back: (t) => { const c1 = 1.5; const c3 = c1 + 1; return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2; },
    lin: (t) => t,
  };
  const tweens = new Set();
  let schleife = 0;
  let letztesBild = 0;
  const jedesBild = new Set();   // Aufgaben, die in jedem Bild laufen (Kamera, Tiere)

  function tween(dauer, fn, { e = ease.out, delay = 0, done = null } = {}) {
    if (reduced() || dauer <= 0) { fn(1); done?.(); return null; }
    const t = { start: performance.now() + delay, dauer, fn, e, done };
    tweens.add(t);
    wecke();
    return t;
  }
  const tweenP = (dauer, fn, opts = {}) => new Promise((ok) => tween(dauer, fn, { ...opts, done: () => { opts.done?.(); ok(); } }));
  const warte = (ms) => new Promise((ok) => window.setTimeout(ok, reduced() ? 0 : ms));

  function wecke() {
    if (schleife) return;
    letztesBild = performance.now();
    schleife = window.requestAnimationFrame(bild);
  }
  function bild(jetzt) {
    schleife = 0;
    const dt = Math.min(0.05, (jetzt - letztesBild) / 1000);
    letztesBild = jetzt;
    tweens.forEach((t) => {
      if (jetzt < t.start) return;
      const p = Math.min(1, (jetzt - t.start) / t.dauer);
      t.fn(t.e(p));
      if (p >= 1) { tweens.delete(t); t.done?.(); }
    });
    let weiter = tweens.size > 0;
    jedesBild.forEach((fn) => { if (fn(dt, jetzt)) weiter = true; });
    if (weiter && ui.host?.isConnected) schleife = window.requestAnimationFrame(bild);
  }

  // ---------------------------------------------------------------------------
  // Zustand der Ansicht
  // ---------------------------------------------------------------------------
  const ui = {
    host: null,
    stage: null,
    onPlay: null,
    haus: "wohnhaus",
    zimmer: -1,            // gezoomtes Stockwerk, -1 = Hausansicht
    nacht: false,
    kamera: { ty: 0, tx: 0, vy: 0, min: 0, max: 0, skala: 1, welt: null },
    auswahl: null,         // Kennung des gewählten Dings im Zimmer
    schublade: "passt",
    rueck: [],             // Rückgängig-Schritte im Zimmer
    tafel: null,           // offene Tier-Tafel { hausId, index }
    overlay: null,         // offene Wahl (Haus, Zimmerart, Fassade)
    besetzt: false,        // eine Animation, die keinen Tipp verträgt
    tickUhr: 0,
    abmelden: null,
  };
  const els = {};
  // Seit wann eine Bewegung keinen Tipp verträgt (siehe zurueck()).
  let besetztSeit = 0;

  function stand() { return S().lesen(); }
  function aktHaus() { return S().haus(ui.haus); }

  // ---------------------------------------------------------------------------
  // Einbau in die Bühne
  // ---------------------------------------------------------------------------
  function mount({ host, stage = null, onPlay = null } = {}) {
    unmount();
    ui.host = host;
    ui.stage = stage;
    ui.onPlay = onPlay;
    ui.zimmer = -1;
    ui.tafel = null;
    ui.overlay = null;
    ui.besetzt = false;
    try { ui.nacht = localStorage.getItem("lernapp.bau.nacht") === "1"; } catch { ui.nacht = false; }
    const gewaehlt = stand().gewaehlt;
    ui.haus = S().HAUS_IDS.includes(gewaehlt) ? gewaehlt : (zuletztHaus() || "wohnhaus");

    host.classList.add("bauecke");
    host.classList.toggle("is-nacht", ui.nacht);
    host.innerHTML = "";

    els.himmel = el("div", "bau-himmel");
    els.himmel.innerHTML = `<div class="bau-sonne"></div><div class="bau-mond"></div><div class="bau-wolke w1"></div><div class="bau-wolke w2"></div>`;
    els.welt = el("div", "bau-welt");
    els.nachbarL = el("button", "bau-nachbar is-links", { type: "button" });
    els.nachbarR = el("button", "bau-nachbar is-rechts", { type: "button" });
    els.nachbarL.addEventListener("click", () => wechsleHaus(-1));
    els.nachbarR.addEventListener("click", () => wechsleHaus(1));
    els.umschalter = el("nav", "bau-umschalter", { "aria-label": "Die vier Häuser" });
    els.hud = el("div", "bau-hud");
    els.zimmer = el("div", "bau-zimmeransicht");
    els.zimmer.hidden = true;
    els.flug = el("div", "bau-flug");
    host.append(els.himmel, els.welt, els.nachbarL, els.nachbarR, els.umschalter, els.hud, els.zimmer, els.flug);

    baueUmschalter();
    baueHud();
    baueZimmerRahmen();
    zeichneHaus();
    weltEreignisse();

    // Wer sich ändert, zeichnet nach: die Cloud, neue Ziegel, ein Tier.
    ui.abmelden = S().onChange((grund) => {
      if (!ui.host?.isConnected) return;
      if (grund === "zimmer") { aktualisiereSterne(); return; }
      if (grund === "ziegel") { aktualisiereHud(); pruefeLieferung(); return; }
      if (grund === "cloud" || grund === "tier" || grund === "wunsch") { auffrischen(); }
    });
    window.addEventListener("resize", beiGroesse);
    ui.tickUhr = window.setInterval(zeitTick, 4000);
    zeitTick();
    hilfeHaus();

    if (!gewaehlt) zeigeHauswahl();
    else pruefeLieferung();
  }

  function unmount() {
    if (ui.tickUhr) window.clearInterval(ui.tickUhr);
    ui.tickUhr = 0;
    ui.abmelden?.();
    ui.abmelden = null;
    window.removeEventListener("resize", beiGroesse);
    tweens.clear();
    jedesBild.clear();
    tiere.clear();
    if (tierUhr) window.clearTimeout(tierUhr);
    tierUhr = 0;
    if (ui.host) ui.host.classList.remove("bauecke", "is-nacht", "ist-zimmer");
    ui.host = null;
  }

  // Der Zurück-Knopf der Bühne fragt zuerst hier: Ist etwas offen, geht es
  // eine Stufe zurück. Erst aus der Hausansicht geht es hinaus.
  function zurueck() {
    if (!ui.host?.isConnected) return false;
    // Eine Bewegung läuft – kurz warten. Hängt sie (ein Fehler mitten in
    // einer Animation), gibt der Knopf sie nach ein paar Sekunden frei.
    if (ui.besetzt && performance.now() - besetztSeit < 4000) return true;
    ui.besetzt = false;
    if (ui.overlay) { schliesseOverlay(); return true; }
    if (ui.tafel) { schliesseTafel(); return true; }
    if (ui.zimmer >= 0) { schliesseZimmer(); return true; }
    S().speichern(true);
    return false;
  }

  // Von aussen neu zeichnen (die Cloud, ein anderes Gerät, die Bühne). Nur
  // wenn sich am Haus wirklich etwas geändert hat, und nie mitten in einer
  // Bewegung: Die Bühne ruft das nach dem Laden mehrmals auf.
  function auffrischen() {
    if (!ui.host?.isConnected) return;
    aktualisiereHud();
    baueUmschalter();
    if (ui.besetzt || zieht) return;
    const jetzt = zeichenStand();
    if (jetzt === ui.gezeichnet) { if (ui.tafel) fuelleTafel(); return; }
    if (ui.zimmer >= 0) {
      if (!S().stock(ui.haus, ui.zimmer)?.raum) { schliesseZimmer(true); return; }
      zeichneZimmer();
    } else zeichneHaus({ behalteKamera: true });
    if (ui.tafel) fuelleTafel();
  }
  let zieht = false;
  // Was ein Neuzeichnen nötig macht: das Haus selbst, und ob das Plus gerade
  // baut oder vor der Schranke steht (ein Kauf, frische Ziegel).
  function zeichenStand() { return `${JSON.stringify(aktHaus())}|${S().kannBauen(ui.haus).grund}`; }

  let groesseUhr = 0;
  function beiGroesse() {
    window.clearTimeout(groesseUhr);
    groesseUhr = window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      if (ui.zimmer >= 0) passeZimmerEin();
      else { messeWelt(); setzeKamera(); }
    }, 120);
  }

  function zuletztHaus() {
    try { const id = localStorage.getItem("lernapp.bau.haus"); return S().HAUS_IDS.includes(id) ? id : ""; } catch { return ""; }
  }
  function merkeHaus(id) { try { localStorage.setItem("lernapp.bau.haus", id); } catch { /* privater Modus */ } }

  // ---------------------------------------------------------------------------
  // Was die Zeit tut
  // ---------------------------------------------------------------------------
  function zeitTick() {
    if (!ui.host?.isConnected) return;
    const ereignisse = S().tick();
    ereignisse.forEach((e) => {
      if (e.typ === "eingezogen" && e.hausId === ui.haus) {
        const st = S().stock(e.hausId, e.index);
        if (st?.tier) zeigeBlase(e.hausId, e.index, `${st.tier.n} zieht ein! 🧳`, 3200);
      }
      if (e.typ === "neuerWunsch" && e.hausId === ui.haus) zeigeBlase(e.hausId, e.index, "Ich habe einen neuen Wunsch! ⭐", 3600);
    });
  }

  // ---------------------------------------------------------------------------
  // Hilfe-Texte
  // ---------------------------------------------------------------------------
  function hilfeHaus() {
    const haus = K().HAUS[ui.haus];
    hilfe(`Das ist ${haus.der}. Tippe auf ein Stockwerk, um es einzurichten. Für ein neues Stockwerk brauchst du Ziegel: Tippe auf den Rätsel-Knopf. Wenn du das Rätsel löst, bringt der Zug die Ziegel. Oben wechselst du zwischen den vier Häusern.`);
  }
  function hilfeZimmer() {
    hilfe("Zieh Dinge aus der Schublade ins Zimmer, oder tippe sie an. Tippe auf ein Ding im Zimmer, um es anzumalen, umzudrehen, grösser oder kleiner zu machen. Mit dem Pinsel malst du die Wand an, mit dem Boden-Knopf den Boden. Auf das Tier tippen zeigt, was es sich wünscht.");
  }

  // ---------------------------------------------------------------------------
  // Der Umschalter: vier Häuser, immer erreichbar
  // ---------------------------------------------------------------------------
  function baueUmschalter() {
    const fort = S().fortschritt();
    els.umschalter.innerHTML = "";
    S().HAUS_IDS.forEach((id) => {
      const haus = K().HAUS[id];
      const f = fort.find((eintrag) => eintrag.id === id);
      const b = knopf(`bau-tab${id === ui.haus ? " is-aktiv" : ""}`, `${haus.name}: ${f.stockwerke} ${f.stockwerke === 1 ? "Stockwerk" : "Stockwerke"}, ${f.sterne} Sterne`,
        `${svgVon(A().hausZeichen(id), "0 0 24 24", "bau-tab-zeichen")}<span class="bau-tab-name">${haus.name}</span><span class="bau-tab-sterne">★ ${f.sterne}</span>`,
        () => { if (id !== ui.haus) zeigeHaus(id, id > ui.haus ? 1 : -1); else sag(haus.der); });
      b.dataset.haus = id;
      els.umschalter.append(b);
    });
    // Die Nachbarn am Rand: ein Stück vom Haus links und rechts.
    const ids = S().HAUS_IDS;
    const i = ids.indexOf(ui.haus);
    const links = ids[(i + ids.length - 1) % ids.length];
    const rechts = ids[(i + 1) % ids.length];
    [[els.nachbarL, links], [els.nachbarR, rechts]].forEach(([b, id]) => {
      const f = fort.find((eintrag) => eintrag.id === id);
      const h = A().minihausHoehe(f);
      b.innerHTML = svgVon(`<g transform="translate(6 ${h - 4})">${A().minihaus(id, f, { breite: 60 })}</g>`, `0 0 72 ${h}`);
      b.setAttribute("aria-label", `Zum ${K().HAUS[id].name}`);
      b.title = K().HAUS[id].name;
    });
  }

  function wechsleHaus(richtung) {
    const ids = S().HAUS_IDS;
    const i = ids.indexOf(ui.haus);
    zeigeHaus(ids[(i + richtung + ids.length) % ids.length], richtung);
  }

  // Ein anderes Haus: das alte gleitet hinaus, das neue herein.
  async function zeigeHaus(id, richtung = 1, { stockwerk = -1, ohneSprache = false } = {}) {
    if (ui.besetzt || !K().HAUS[id]) return;
    if (ui.zimmer >= 0) await schliesseZimmer(true);
    if (ui.tafel) schliesseTafel();
    ui.besetzt = true; besetztSeit = performance.now();
    const weg = richtung >= 0 ? -1 : 1;
    const breite = ui.host.clientWidth || 800;
    await tweenP(220, (p) => { els.welt.style.transform = kameraTransform(ui.kamera.tx + weg * breite * 0.6 * p, ui.kamera.ty); els.welt.style.opacity = String(1 - p); }, { e: ease.in });
    ui.haus = id;
    merkeHaus(id);
    baueUmschalter();
    zeichneHaus({ stockwerk });
    const ziel = ui.kamera.tx;
    els.welt.style.transform = kameraTransform(ziel - weg * breite * 0.6, ui.kamera.ty);
    await tweenP(260, (p) => { els.welt.style.transform = kameraTransform(ziel - weg * breite * 0.6 * (1 - p), ui.kamera.ty); els.welt.style.opacity = String(p); });
    els.welt.style.opacity = "";
    setzeKamera();
    ui.besetzt = false;
    hilfeHaus();
    if (!ohneSprache) sag(`${K().HAUS[id].der}.`);
  }

  // ---------------------------------------------------------------------------
  // Rechts: Ziegel, Rätsel, Tag und Nacht, Fassade
  // ---------------------------------------------------------------------------
  function baueHud() {
    els.hud.innerHTML = "";
    els.ziegel = el("div", "bau-ziegel", { role: "status" });
    els.ziegel.innerHTML = `${svgVon(`<g transform="translate(32 40)">${A().palette()}</g>`, "0 0 64 56", "bau-ziegel-bild")}<span class="bau-ziegel-zahl">0</span>`;
    els.ziegel.addEventListener("click", () => {
      const n = S().paletten();
      sag(n === 1 ? "Du hast eine Palette Ziegel. Das reicht für ein neues Stockwerk." : n > 1 ? `Du hast ${n} Paletten Ziegel. Jede reicht für ein Stockwerk.` : "Du hast keine Ziegel. Löse ein Rätsel, dann bringt der Zug welche.");
    });
    els.raetsel = knopf("bau-raetsel", "Ein Rätsel lösen und Ziegel bekommen",
      `${svgVon(`<path d="M10 6h8a2 2 0 0 1 2 2v3a2.5 2.5 0 1 1 0 5v3a2 2 0 0 1-2 2h-3a2.5 2.5 0 1 0-5 0H7a2 2 0 0 1-2-2v-3a2.5 2.5 0 1 0 0-5V8a2 2 0 0 1 2-2h3a2.5 2.5 0 1 1 5 0z" fill="#ffffff"/>`, "0 0 26 26", "bau-raetsel-bild")}<span>Rätsel</span>`,
      starteRaetsel);
    els.nachtKnopf = knopf("bau-rund bau-nachtknopf", "Tag oder Nacht", "", schalteNacht);
    els.fassade = knopf("bau-rund bau-fassadeknopf", "Das Haus anmalen", svgVon(`<rect x="4" y="3" width="14" height="7" rx="2" fill="#ff7aa2"/><path d="M18 6h2v6h-9v3" fill="none" stroke="#4a5568" stroke-width="2"/><rect x="9" y="15" width="4" height="7" rx="1.5" fill="#4a5568"/>`, "0 0 24 24"), zeigeFassadenwahl);
    els.hud.append(els.ziegel, els.raetsel, els.nachtKnopf, els.fassade);
    aktualisiereHud();
  }

  function aktualisiereHud() {
    if (!els.ziegel) return;
    const n = S().paletten();
    els.ziegel.querySelector(".bau-ziegel-zahl").textContent = String(n);
    els.ziegel.classList.toggle("is-leer", n < 1);
    els.ziegel.setAttribute("aria-label", `${n} ${n === 1 ? "Palette" : "Paletten"} Ziegel`);
    els.nachtKnopf.innerHTML = ui.nacht
      ? svgVon(`<circle cx="12" cy="12" r="5" fill="#ffd166"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M5 19l2-2" stroke="#ffd166" stroke-width="2" stroke-linecap="round"/>`, "0 0 24 24")
      : svgVon(`<path d="M16 3a9 9 0 1 0 5 15a7 7 0 0 1-5-15z" fill="#34508f"/><circle cx="18" cy="6" r="1.2" fill="#34508f"/>`, "0 0 24 24");
    els.nachtKnopf.setAttribute("aria-label", ui.nacht ? "Tag machen" : "Nacht machen");
    const plus = els.welt?.querySelector("[data-ziel='plus']");
    if (plus) plus.classList.toggle("is-bereit", S().kannBauen(ui.haus).ok);
  }

  function schalteNacht() {
    ui.nacht = !ui.nacht;
    try { localStorage.setItem("lernapp.bau.nacht", ui.nacht ? "1" : "0"); } catch { /* privater Modus */ }
    ui.host.classList.toggle("is-nacht", ui.nacht);
    aktualisiereHud();
    sag(ui.nacht ? "Es ist Nacht. Gute Nacht!" : "Es ist Tag. Guten Morgen!");
    if (ui.zimmer >= 0) zeichneZimmer(); else zeichneHaus({ behalteKamera: true });
  }

  // Der Rätsel-Knopf: ein zufälliges Rätsel aus der Reise, passend zum Kind.
  async function starteRaetsel() {
    if (ui.besetzt) return;
    const r = reise();
    if (!r?.bauRaetsel) { sag("Gerade gibt es kein Rätsel."); return; }
    // Erst wenn feststeht, wer spielt: sonst gälte ein Kind mit Kauf für einen
    // Augenblick als Gast und bekäme nur die Rätsel der ersten Karte.
    await schranke()?.whenReady?.(3000);
    const task = r.bauRaetsel();
    if (!task) { sag("Gerade gibt es kein Rätsel."); return; }
    S().speichern(true);
    sag(`Ein Rätsel für Ziegel: ${task.title}!`);
    const url = r.bauUrlFor(task);
    if (typeof ui.onPlay === "function") ui.onPlay(url);
    else window.location.href = url;
  }

  // ---------------------------------------------------------------------------
  // Die Hausansicht
  // ---------------------------------------------------------------------------
  const WX0 = -440;
  const WX1 = 678 + 440;
  const GRUND = 190;          // so weit reicht die Welt unter die Strasse

  function weltOben(anzahl) { return A().oben(anzahl - 1) - A().DECKE - A().ZH - 300; }

  function kameraTransform(tx, ty) { return `translate3d(${Math.round(tx)}px, ${Math.round(ty)}px, 0)`; }

  // Wie gross das Haus steht: auf dem Tablet gut zweieinhalb Stockwerke im
  // Bild, auf dem Handy knapp zwei.
  function messeWelt() {
    const w = ui.host.clientWidth || 800;
    const h = ui.host.clientHeight || 500;
    const sichtbar = h < 520 ? 1.75 : 2.6;
    const skala = clamp(Math.min((w * 0.6) / A().HB, (h - 70) / (sichtbar * A().STOCK)), 0.3, 1.6);
    ui.kamera.skala = skala;
    const anzahl = aktHaus().stock.length;
    const y0 = weltOben(anzahl);
    const weltH = (GRUND - y0) * skala;
    ui.kamera.y0 = y0;
    ui.kamera.tx = w / 2 - (A().HB / 2 - WX0) * skala;
    // Unten: die Strasse am unteren Rand. Oben: der Himmel über dem Dach am
    // oberen Rand. Ist die Welt niedriger als das Bild, steht sie unten.
    ui.kamera.min = h - weltH;
    ui.kamera.max = Math.max(ui.kamera.min, 0);
    const svg = els.welt.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", String(Math.round((WX1 - WX0) * skala)));
      svg.setAttribute("height", String(Math.round(weltH)));
    }
  }

  function setzeKamera() {
    ui.kamera.ty = clamp(ui.kamera.ty, ui.kamera.min, ui.kamera.max);
    els.welt.style.transform = kameraTransform(ui.kamera.tx, ui.kamera.ty);
  }

  // Wo ein Stockwerk auf dem Bildschirm steht (für die Kamera und den Zoom).
  function stockAufSchirm(index) {
    const k = ui.kamera;
    const y = (A().oben(index) - k.y0) * k.skala + k.ty;
    const x = (A().ZX - WX0) * k.skala + k.tx;
    return { x, y, w: A().ZW * k.skala, h: A().ZH * k.skala };
  }

  // Der erste Blick auf ein Haus: Passt es ganz ins Bild – samt dem Plus für
  // das nächste Stockwerk –, steht es ganz da. Sonst sieht man die unteren
  // Stockwerke und die Strasse.
  function kameraStart() {
    const k = ui.kamera;
    const h = ui.host.clientHeight || 500;
    const kopf = h < 520 ? 64 : 84;
    const plusOben = plusY() - A().ZH - 20;
    const dachOben = A().oben(aktHaus().stock.length - 1) - A().DECKE - (A().DACH_H[K().HAUS[ui.haus].dachForm] || 120) - 20;
    const ganzOben = els.welt.querySelector("[data-ziel='plus']") ? plusOben : dachOben;
    const hoehe = (110 - ganzOben) * k.skala;
    // Passt alles samt Gleis ins Bild, steht es ganz da; sonst unten.
    if (hoehe <= h - kopf) k.ty = kopf - (ganzOben - k.y0) * k.skala;
    else k.ty = k.min;
    setzeKamera();
  }

  // Wo das Plus für das nächste Stockwerk sitzt (Unterkante, Haus-Einheiten).
  function plusY() {
    const dachY = A().oben(aktHaus().stock.length - 1) - A().DECKE;
    return dachY - (A().DACH_H[K().HAUS[ui.haus].dachForm] || 120) - 40;
  }

  // Die Kamera zum Plus: nach einer Lieferung ist es der nächste Schritt.
  function kameraAufPlus(sanft = true) {
    const k = ui.kamera;
    const h = ui.host.clientHeight || 500;
    const kopf = h < 520 ? 64 : 84;
    const ziel = clamp(kopf + 10 - (plusY() - A().ZH - 20 - k.y0) * k.skala, k.min, k.max);
    if (!sanft) { k.ty = ziel; setzeKamera(); return; }
    const start = k.ty;
    tween(700, (p) => { k.ty = start + (ziel - start) * p; setzeKamera(); }, { e: ease.inOut });
  }

  // Die Kamera so, dass dieses Stockwerk gut im Bild ist.
  function kameraAuf(index, sanft = true) {
    const h = ui.host.clientHeight || 500;
    const k = ui.kamera;
    const yWelt = (A().oben(index) + A().ZH / 2 - k.y0) * k.skala;
    const ziel = clamp(h * 0.55 - yWelt, k.min, k.max);
    if (!sanft) { k.ty = ziel; setzeKamera(); return; }
    const start = k.ty;
    tween(420, (p) => { k.ty = start + (ziel - start) * p; setzeKamera(); }, { e: ease.inOut });
  }

  function zeichneHaus({ stockwerk = -1, behalteKamera = false } = {}) {
    const art = A();
    const haus = aktHaus();
    const anzahl = haus.stock.length;
    const vorher = ui.kamera.ty;
    const warAlt = ui.kamera.anzahl === anzahl && ui.kamera.hausGezeichnet === ui.haus;
    messeWelt();
    const y0 = ui.kamera.y0;
    const katalog = K();
    const hausInfo = katalog.HAUS[ui.haus];
    let s = `<defs><linearGradient id="bau-lift-schatten" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.12"/><stop offset="0.3" stop-color="#000" stop-opacity="0"/></linearGradient>` +
      `<clipPath id="bau-zimmerclip"><rect x="0" y="0" width="${art.ZW}" height="${art.ZH}"/></clipPath>` +
      `<radialGradient id="bau-glanz"><stop offset="0" stop-color="#fff6c2" stop-opacity="0.75"/><stop offset="1" stop-color="#fff6c2" stop-opacity="0"/></radialGradient></defs>`;
    s += `<g class="bau-hintergrund">`;
    s += art.baum(-260, 1.15) + art.baum(-120, 0.9) + art.laterne(-40) + art.baum(art.HB + 110, 1) + art.laterne(art.HB + 40) + art.baum(art.HB + 260, 1.2);
    s += `</g>`;
    s += art.strasse(WX0, WX1);
    // Die Zimmer
    for (let i = 0; i < anzahl; i += 1) {
      s += `<g class="bau-stock${haus.stock[i].raum ? "" : " is-rohbau"}" data-ziel="stock" data-stock="${i}" transform="translate(${art.ZX} ${art.oben(i)})" clip-path="url(#bau-zimmerclip)">${zimmerInhalt(ui.haus, i, { klein: true })}</g>`;
    }
    s += `<g class="bau-rahmen">${art.hausRahmen(haus, anzahl)}</g>`;
    for (let i = 0; i < anzahl; i += 1) {
      s += `<g class="bau-lift" data-stock="${i}">${art.liftStock(i)}</g>`;
      if (haus.stock[i].tier) s += `<g class="bau-tafelknopf" data-ziel="tafel" data-stock="${i}" role="button" tabindex="0">${art.sternTafel(S().sterne(ui.haus, i), art.LX + art.LIFT / 2, art.oben(i) + 52)}</g>`;
    }
    const dachY = art.oben(anzahl - 1) - art.DECKE;
    s += `<g class="bau-dach">${art.dach(hausInfo.dachForm, haus.dach, haus.fassade, dachY)}</g>`;
    // Die Stelle für das nächste Stockwerk, über dem Dach – nur, wenn Ziegel
    // da sind. Ohne Ziegel wäre sie ein Knopf, der nichts tut; dann zeigt der
    // Rätsel-Knopf den Weg.
    const kann = S().kannBauen(ui.haus);
    if (kann.ok || kann.grund === "schranke") {
      s += `<g class="bau-naechster${kann.ok ? " is-bereit" : ""}" data-ziel="plus" role="button" tabindex="0" aria-label="Ein neues Stockwerk bauen">${art.naechsterStock(plusY())}</g>`;
    }
    s += `<g class="bau-zuglage"></g>`;
    const svg = `<svg xmlns="${NS}" class="bau-haus-svg${ui.nacht ? " is-nacht" : ""}" viewBox="${WX0} ${y0} ${WX1 - WX0} ${GRUND - y0}" width="${Math.round((WX1 - WX0) * ui.kamera.skala)}" height="${Math.round((GRUND - y0) * ui.kamera.skala)}" role="img" aria-label="${hausInfo.name} mit ${anzahl} ${anzahl === 1 ? "Stockwerk" : "Stockwerken"}">${s}</svg>`;
    els.welt.innerHTML = svg;
    ui.gezeichnet = zeichenStand();
    ui.kamera.anzahl = anzahl;
    ui.kamera.hausGezeichnet = ui.haus;
    if (stockwerk >= 0) kameraAuf(stockwerk, false);
    else if (behalteKamera || warAlt) { ui.kamera.ty = vorher; setzeKamera(); }
    else kameraStart();
    starteTiereHaus();
  }

  // Ein Zimmer als SVG-Text: in der Hausansicht (klein) wie im Zoom.
  function zimmerInhalt(hausId, index, { klein = false } = {}) {
    const st = S().stock(hausId, index);
    if (!st) return "";
    if (!st.raum) return A().rohbauSchale();
    let s = A().zimmerSchale(st, `bau-muster-${hausId}-${index}${klein ? "-k" : ""}`);
    s += dingeMarkup(st);
    s += `<g class="bau-tierlage" data-tierlage="${index}"></g>`;
    if (ui.nacht) s += nachtMarkup(st);
    return s;
  }

  // Die Dinge in Zeichenreihenfolge: was an der Wand hängt, zuerst; dann
  // Teppiche; dann was steht, von hinten nach vorn – und was auf einem Tisch
  // steht, gleich nach seinem Tisch.
  function reihenfolge(st) {
    const dinge = M().DINGE;
    const tiefe = new Map();
    const stehend = st.dinge.filter((d) => dinge[d.i]?.art === "boden");
    stehend.forEach((d) => tiefe.set(d.k, d.y));
    stehend.forEach((d) => {
      const traeger = traegerVon(st, d);
      if (traeger) tiefe.set(d.k, (tiefe.get(traeger.k) ?? traeger.y) + 0.01);
    });
    const rang = (d) => {
      const art = dinge[d.i]?.art;
      if (art === "wand") return 0;
      if (art === "decke") return 1;
      if (art === "flach") return 2;
      return 3;
    };
    return st.dinge.map((d, i) => ({ d, i })).sort((a, b) => {
      const ra = rang(a.d);
      const rb = rang(b.d);
      if (ra !== rb) return ra - rb;
      if (ra === 3 || ra === 2) {
        const ta = tiefe.get(a.d.k) ?? a.d.y;
        const tb = tiefe.get(b.d.k) ?? b.d.y;
        if (Math.abs(ta - tb) > 0.001) return ta - tb;
      }
      return a.i - b.i;
    }).map((eintrag) => eintrag.d);
  }

  function dingTransform(d) {
    const k = M().MASS * (d.s || 1);
    return `translate(${d.x} ${d.y}) scale(${d.f ? -k : k} ${k})`;
  }

  function dingeMarkup(st) {
    return reihenfolge(st).map((d) => {
      const farbe = d.c ? farbeHex(d.c) : null;
      return `<g class="bau-ding" data-k="${d.k}" data-i="${d.i}" transform="${dingTransform(d)}">${griffFlaeche(d.i)}${M().zeichne(d.i, farbe)}</g>`;
    }).join("");
  }

  // Eine unsichtbare Fläche über das ganze Ding: Ein Tisch lässt sich auch
  // zwischen den Beinen greifen, eine Stehlampe neben dem dünnen Stab. Sie
  // liegt im Ding, also hinter allem, was weiter vorn steht.
  function griffFlaeche(id) {
    const ding = M().DINGE[id];
    if (!ding) return "";
    const y = ding.art === "wand" ? -ding.h / 2 : ding.art === "decke" ? 0 : -ding.h;
    return `<rect class="bau-griff" x="${-ding.w / 2}" y="${y}" width="${ding.w}" height="${ding.h}" fill="transparent"/>`;
  }

  // Die Nacht im Zimmer: ohne Licht dunkel, mit Licht ein warmer Schein um
  // jede Lampe.
  function nachtMarkup(st) {
    const art = A();
    if (!st.licht) return `<rect x="0" y="0" width="${art.ZW}" height="${art.ZH}" fill="#0b1530" opacity="0.62" pointer-events="none"/>`;
    let s = `<rect x="0" y="0" width="${art.ZW}" height="${art.ZH}" fill="#1b2350" opacity="0.18" pointer-events="none"/>`;
    st.dinge.forEach((d) => {
      const ding = M().DINGE[d.i];
      if (!ding?.licht) return;
      const u = M().umriss(d.i, d.s);
      const cy = d.y + (u.y0 + u.y1) / 2;
      s += `<circle cx="${d.x}" cy="${cy}" r="${Math.max(60, (u.x1 - u.x0) * 0.9)}" fill="url(#bau-glanz)" pointer-events="none"/>`;
    });
    return s;
  }

  // Worauf ein kleines Ding steht – auf der Fläche eines anderen, oder null.
  function traegerVon(st, d) {
    const ding = M().DINGE[d.i];
    if (!ding?.klein) return null;
    let bester = null;
    st.dinge.forEach((u) => {
      if (u.k === d.k) return;
      const fl = flaecheVon(u);
      if (!fl) return;
      if (Math.abs(d.y - fl.y) < 2.5 && d.x >= fl.x0 - 2 && d.x <= fl.x1 + 2) bester = u;
    });
    return bester;
  }

  // Die Fläche eines Dings in Zimmer-Einheiten: Höhe und Bereich links/rechts.
  function flaecheVon(u) {
    const ding = M().DINGE[u.i];
    if (!ding || typeof ding.flaeche !== "number" || ding.art !== "boden") return null;
    const k = M().MASS * (u.s || 1);
    let [a, b] = ding.fx;
    if (u.f) [a, b] = [-b, -a];
    return { y: u.y + ding.flaeche * k, x0: u.x + a * k, x1: u.x + b * k };
  }

  // --- Sterne nachführen, ohne das ganze Haus neu zu bauen ------------------
  function aktualisiereSterne() {
    baueUmschalter();
    if (ui.zimmer >= 0) zeichneZimmerKopf();
    if (ui.tafel) fuelleTafel();
  }

  // --- Antippen und Ziehen in der Hausansicht ------------------------------
  function weltEreignisse() {
    let zug = null;
    els.welt.addEventListener("pointerdown", (e) => {
      if (ui.besetzt || ui.zimmer >= 0 || e.button > 0) return;
      zug = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ty0: ui.kamera.ty, t0: performance.now(), bewegt: false, ziel: e.target.closest?.("[data-ziel]") || null, verlauf: [] };
      ui.kamera.vy = 0;
      try { els.welt.setPointerCapture(e.pointerId); } catch { /* egal */ }
    });
    els.welt.addEventListener("pointermove", (e) => {
      if (!zug || e.pointerId !== zug.id) return;
      const dx = e.clientX - zug.x0;
      const dy = e.clientY - zug.y0;
      if (!zug.bewegt && Math.hypot(dx, dy) > 9) zug.bewegt = true;
      if (!zug.bewegt) return;
      const k = ui.kamera;
      let ty = zug.ty0 + dy;
      // Gummiband am Ende
      if (ty > k.max) ty = k.max + (ty - k.max) * 0.35;
      if (ty < k.min) ty = k.min + (ty - k.min) * 0.35;
      k.ty = ty;
      els.welt.style.transform = kameraTransform(k.tx + (Math.abs(dx) > Math.abs(dy) * 1.4 ? dx * 0.35 : 0), k.ty);
      zug.verlauf.push({ t: performance.now(), y: e.clientY });
      if (zug.verlauf.length > 6) zug.verlauf.shift();
    });
    const ende = (e) => {
      if (!zug || e.pointerId !== zug.id) return;
      const z = zug;
      zug = null;
      const dx = e.clientX - z.x0;
      const dy = e.clientY - z.y0;
      if (!z.bewegt) { tippeWelt(z.ziel); return; }
      // Wischen zur Seite wechselt das Haus.
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.4) { setzeKamera(); wechsleHaus(dx < 0 ? 1 : -1); return; }
      const v = z.verlauf;
      if (v.length >= 2) {
        const a = v[0];
        const b = v[v.length - 1];
        ui.kamera.vy = (b.y - a.y) / Math.max(16, b.t - a.t) * 16;
      }
      jedesBild.add(schwung);
      wecke();
    };
    els.welt.addEventListener("pointerup", ende);
    els.welt.addEventListener("pointercancel", ende);
    els.welt.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const ziel = e.target.closest?.("[data-ziel]");
      if (ziel) { e.preventDefault(); tippeWelt(ziel); }
    });
  }

  // Nach dem Loslassen gleitet das Haus aus und federt an den Enden zurück.
  function schwung() {
    const k = ui.kamera;
    k.ty += k.vy;
    k.vy *= 0.92;
    if (k.ty > k.max) { k.ty += (k.max - k.ty) * 0.2; k.vy *= 0.5; }
    if (k.ty < k.min) { k.ty += (k.min - k.ty) * 0.2; k.vy *= 0.5; }
    els.welt.style.transform = kameraTransform(k.tx, k.ty);
    const ruhig = Math.abs(k.vy) < 0.3 && k.ty <= k.max + 0.5 && k.ty >= k.min - 0.5;
    if (ruhig) { jedesBild.delete(schwung); setzeKamera(); return false; }
    return true;
  }

  function tippeWelt(ziel) {
    if (!ziel) return;
    const art = ziel.getAttribute("data-ziel");
    const index = Number(ziel.getAttribute("data-stock"));
    if (art === "plus") { neuesStockwerk(); return; }
    if (art === "tafel") { oeffneTafel(ui.haus, index); return; }
    if (art === "tier") { oeffneTafel(ziel.getAttribute("data-haus") || ui.haus, Number(ziel.getAttribute("data-index"))); return; }
    if (art === "stock") {
      const st = S().stock(ui.haus, index);
      if (!st) return;
      if (!st.raum) { zeigeRaumwahl(index); return; }
      oeffneZimmer(index);
    }
  }

  // ---------------------------------------------------------------------------
  // Ein neues Stockwerk
  // ---------------------------------------------------------------------------
  async function neuesStockwerk() {
    if (ui.besetzt) return;
    const kann = S().kannBauen(ui.haus);
    if (!kann.ok) {
      if (kann.grund === "ziegel") {
        sag("Für ein neues Stockwerk brauchst du eine Palette Ziegel. Löse ein Rätsel, dann bringt der Zug sie dir!");
        stupse(els.raetsel);
      } else if (kann.grund === "schranke") {
        sag("Hier geht es weiter, wenn deine Eltern die Schranke öffnen.");
        schranke()?.showGate?.({ host: ui.stage || ui.host, ziel: null });
      } else if (kann.grund === "voll") sag("Dieses Haus ist fertig gebaut. So hoch geht es nicht weiter!");
      return;
    }
    ui.besetzt = true; besetztSeit = performance.now();
    const index = S().baueStockwerk(ui.haus);
    if (index < 0) { ui.besetzt = false; return; }
    klang("unlock");
    sag("Ein neues Stockwerk!");
    aktualisiereHud();
    zeichneHaus({ stockwerk: index });
    // Das Dach hebt sich, die Mauern wachsen darunter hoch.
    const svg = els.welt.querySelector("svg");
    const dachEl = svg?.querySelector(".bau-dach");
    const plusEl = svg?.querySelector(".bau-naechster");
    const stockEl = svg?.querySelector(`.bau-stock[data-stock="${index}"]`);
    const unten = A().unten(index);
    if (plusEl) plusEl.style.opacity = "0";
    if (stockEl && !reduced()) {
      const basis = stockEl.getAttribute("transform");
      stockEl.setAttribute("transform", `${basis} translate(0 ${A().ZH}) scale(1 0.001) translate(0 ${-A().ZH})`);
      if (dachEl) dachEl.setAttribute("transform", `translate(0 ${A().STOCK})`);
      await tweenP(650, (p) => {
        if (dachEl) dachEl.setAttribute("transform", `translate(0 ${A().STOCK * (1 - p)})`);
      }, { e: ease.out });
      staub(svg, A().ZX + A().ZW / 2, unten);
      await tweenP(700, (p) => {
        stockEl.setAttribute("transform", `${basis} translate(0 ${A().ZH}) scale(1 ${Math.max(0.001, p)}) translate(0 ${-A().ZH})`);
      }, { e: ease.out });
      stockEl.setAttribute("transform", basis);
      dachEl?.removeAttribute("transform");
    }
    if (plusEl) tween(300, (p) => { plusEl.style.opacity = String(p); });
    baueUmschalter();
    ui.besetzt = false;
    await warte(250);
    zeigeRaumwahl(index);
  }

  // Ein paar Staubwolken an einer Stelle der Hausansicht.
  function staub(svg, x, y) {
    if (!svg || reduced()) return;
    const g = document.createElementNS(NS, "g");
    g.setAttribute("pointer-events", "none");
    const wolken = Array.from({ length: 7 }, (_, i) => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("fill", "#efe6d8");
      g.append(c);
      return { c, dx: (i - 3) * 50 + (Math.random() - 0.5) * 30, r: 14 + Math.random() * 12 };
    });
    svg.append(g);
    tween(900, (p) => {
      wolken.forEach((w) => {
        w.c.setAttribute("cx", String(x + w.dx * (0.4 + p)));
        w.c.setAttribute("cy", String(y - 10 - p * 30));
        w.c.setAttribute("r", String(w.r * (0.6 + p)));
        w.c.setAttribute("opacity", String(0.85 * (1 - p)));
      });
    }, { done: () => g.remove() });
  }

  function stupse(node) {
    if (!node) return;
    node.classList.remove("is-stups");
    void node.offsetWidth;
    node.classList.add("is-stups");
    window.setTimeout(() => node.classList.remove("is-stups"), 900);
  }

  // ---------------------------------------------------------------------------
  // Der Lieferzug: Ziegel aus einem gelösten Rätsel
  // ---------------------------------------------------------------------------
  let liefert = false;
  async function pruefeLieferung() {
    if (liefert || !ui.host?.isConnected || ui.zimmer >= 0 || ui.overlay) return;
    const neu = S().neueLieferung();
    if (neu < 1) return;
    liefert = true;
    try { await liefere(neu); } finally { liefert = false; }
  }

  async function liefere(anzahl) {
    const svg = els.welt.querySelector("svg");
    const lage = svg?.querySelector(".bau-zuglage");
    S().merkeGezeigt();
    if (!lage || reduced()) {
      aktualisiereHud();
      zeichneHaus({ behalteKamera: true });
      kameraAufPlus(false);
      sag(anzahl === 1 ? "Der Zug hat eine Palette Ziegel gebracht. Tippe auf das Plus, und ein neues Stockwerk entsteht!" : `Der Zug hat ${anzahl} Paletten Ziegel gebracht!`);
      return;
    }
    ui.besetzt = true; besetztSeit = performance.now();
    // Der Zug fährt unten auf dem Gleis: dorthin schauen.
    if (ui.kamera.ty > ui.kamera.min + 2) {
      const start = ui.kamera.ty;
      await tweenP(450, (p) => { ui.kamera.ty = start + (ui.kamera.min - start) * p; setzeKamera(); }, { e: ease.inOut });
    }
    lage.innerHTML = A().lieferzug(anzahl);
    const zug = lage.querySelector(".bau-zug");
    const yGleis = 62;
    const xStart = WX0 - 220;
    const xHalt = A().HB / 2 - 40;
    zug.setAttribute("transform", `translate(${xStart} ${yGleis})`);
    kids()?.playHorn?.();
    sag("Tuut! Der Zug bringt Ziegel!");
    await tweenP(1500, (p) => zug.setAttribute("transform", `translate(${xStart + (xHalt - xStart) * p} ${yGleis})`), { e: ease.out });
    // Die Paletten fliegen zum Ziegelzähler oben rechts.
    const ziel = els.ziegel.getBoundingClientRect();
    const paletten = [...lage.querySelectorAll(".bau-palette")];
    for (const p of paletten) {
      const von = p.getBoundingClientRect();
      p.style.opacity = "0";
      await fliege(von, ziel);
      const zahl = els.ziegel.querySelector(".bau-ziegel-zahl");
      zahl.textContent = String(Math.min(S().paletten(), Number(zahl.textContent) + 1));
      stupse(els.ziegel);
      klang("correct");
    }
    aktualisiereHud();
    await tweenP(1100, (p) => zug.setAttribute("transform", `translate(${xHalt + (WX1 + 300 - xHalt) * p} ${yGleis})`), { e: ease.in });
    lage.innerHTML = "";
    ui.besetzt = false;
    zeichneHaus({ behalteKamera: true });
    kameraAufPlus();
    await warte(750);
    const plus = els.welt.querySelector("[data-ziel='plus']");
    if (plus) stupse(plus);
    sag(anzahl === 1 ? "Die Ziegel sind da! Tippe auf das grüne Plus, und ein neues Stockwerk entsteht." : `${anzahl} Paletten Ziegel sind da! Jede reicht für ein Stockwerk.`);
  }

  // Eine Palette fliegt im Bogen von a nach b (Bildschirm-Rechtecke).
  function fliege(von, nach) {
    const node = el("div", "bau-flieger");
    node.innerHTML = svgVon(`<g transform="translate(32 40)">${A().palette()}</g>`, "0 0 64 56");
    els.flug.append(node);
    const x0 = von.left + von.width / 2;
    const y0 = von.top + von.height / 2;
    const x1 = nach.left + nach.width / 2;
    const y1 = nach.top + nach.height / 2;
    return tweenP(650, (p) => {
      const x = x0 + (x1 - x0) * p;
      const y = y0 + (y1 - y0) * p - Math.sin(Math.PI * p) * 120;
      node.style.transform = `translate3d(${x - 28}px, ${y - 24}px, 0) scale(${1 - 0.35 * p})`;
    }, { e: ease.inOut, done: () => node.remove() });
  }

  // ---------------------------------------------------------------------------
  // Tiere: wohnen, laufen, winken
  // ---------------------------------------------------------------------------
  // Je sichtbares Tier ein kleiner Zustand. Sie laufen ab und zu ein Stück,
  // halten an, zeigen manchmal einen Wunsch – und schlafen nachts.
  const tiere = new Map();
  // Wo jedes Tier zuletzt stand – damit es beim Neuzeichnen des Zimmers nicht
  // an den Anfang springt.
  const tierOrte = new Map();
  const tierSchluessel = (hausId, index, tier) => `${hausId}:${index}:${tier.seed}`;

  function starteTiereHaus() {
    tiere.clear();
    const svg = els.welt.querySelector("svg");
    if (!svg) return;
    const jetzt = Date.now();
    aktHaus().stock.forEach((st, index) => {
      const lage = svg.querySelector(`[data-tierlage="${index}"]`);
      if (!lage) return;
      lage.innerHTML = "";
      const zuHause = st.tier && !S().aufenthalt(ui.haus, index, jetzt);
      if (st.tier && zuHause) setzeTier(lage, { hausId: ui.haus, index, tier: st.tier, wohnt: true });
      else if (st.tier) lage.insertAdjacentHTML("beforeend", tuerSchild(st, index));
      S().besucher(ui.haus, index, jetzt).forEach((b, n) => setzeTier(lage, { hausId: b.haus, index: b.index, tier: b.tier, wohnt: false, x: 380 + n * 60 }));
    });
    planeTiere();
  }

  function tuerSchild(st, index) {
    return `<g class="bau-schild" data-ziel="tafel" data-stock="${index}" transform="translate(70 120)"><rect x="-44" y="-26" width="88" height="40" rx="8" fill="#ffffff" stroke="#e8b94f" stroke-width="3"/><text x="0" y="-2" text-anchor="middle" font-size="15" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#8a5734">Bin weg!</text><text x="0" y="12" text-anchor="middle" font-size="12" font-family="'Baloo 2', Nunito, sans-serif" fill="#8a5734">🚶 ${st.tier.n}</text></g>`;
  }

  function setzeTier(lage, { hausId, index, tier, wohnt, x = null }) {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "bau-tier");
    g.setAttribute("data-ziel", "tier");
    g.setAttribute("data-haus", hausId);
    g.setAttribute("data-index", String(index));
    g.setAttribute("role", "button");
    g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", `${tier.n}, ${K().TIERE[tier.a]?.der || ""}`);
    const k = M().MASS;
    g.innerHTML = `<g class="bau-tier-dreh">${A().tier(tier.a)}</g><g class="bau-zzz" style="display:none"><text x="12" y="-110" font-size="18" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">z</text><text x="24" y="-124" font-size="14" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">z</text></g>`;
    lage.append(g);
    const ort = tierOrte.get(tierSchluessel(hausId, index, tier));
    const startX = ort?.x ?? x ?? (90 + ((S().hash(tier.seed) % 300)));
    const t = {
      g, dreh: g.querySelector(".bau-tier-dreh"), bob: g.querySelector(".bob"), legL: g.querySelector(".legL"), legR: g.querySelector(".legR"), zzz: g.querySelector(".bau-zzz"),
      x: startX, y: S().GEO.STAND + 2, ziel: startX, richtung: 1, modus: "steht", bis: performance.now() + 800 + Math.random() * 2500,
      phase: Math.random() * 6, k, hausId, index, wohnt, tier, huepf: 0,
    };
    if (ort) { t.ziel = ort.ziel ?? t.x; t.modus = ort.modus || "steht"; t.richtung = ort.richtung || 1; }
    // Neu eingezogen? Dann kommt es mit dem Koffer von links.
    if (!ort && wohnt && Date.now() - (tier.seit || 0) < 6000) {
      t.x = -40;
      t.ziel = startX;
      t.modus = "geht";
      g.querySelector(".bau-tier-dreh").insertAdjacentHTML("beforeend", A().koffer());
      t.koffer = true;
    }
    stelleTier(t, 0);
    tiere.set(g, t);
  }

  function stelleTier(t, dt) {
    const schlaeft = ui.nacht && t.tier.a !== "owl" && t.modus !== "geht";
    t.zzz.style.display = schlaeft ? "" : "none";
    let bob = 0;
    let bein = 0;
    if (t.modus === "geht" && !schlaeft) {
      t.phase += dt * 10;
      bob = Math.abs(Math.sin(t.phase)) * -2.2;
      bein = Math.sin(t.phase) * 3;
    } else {
      t.phase += dt * 2;
      bob = schlaeft ? 0 : Math.sin(t.phase) * 0.6;
    }
    const sprung = t.huepf > 0 ? -Math.sin(Math.PI * (1 - t.huepf)) * 22 : 0;
    t.g.setAttribute("transform", `translate(${t.x.toFixed(1)} ${(t.y + sprung).toFixed(1)}) scale(${t.k})`);
    t.dreh.setAttribute("transform", t.richtung < 0 ? "scale(-1 1)" : "");
    t.bob?.setAttribute("transform", `translate(0 ${bob.toFixed(2)})`);
    t.legL?.setAttribute("transform", `translate(0 ${(-Math.max(0, bein)).toFixed(2)})`);
    t.legR?.setAttribute("transform", `translate(0 ${(-Math.max(0, -bein)).toFixed(2)})`);
  }

  // Ein Bild für alle Tiere. Läuft keines, schläft die Schleife, und ein
  // Zeitgeber weckt sie, wenn das nächste losgehen soll.
  let tierUhr = 0;
  function tierBild(dt, jetzt) {
    let laeuft = false;
    tiere.forEach((t) => {
      if (!t.g.isConnected) { tiere.delete(t.g); return; }
      if (t.huepf > 0) { t.huepf = Math.max(0, t.huepf - dt * 2.4); laeuft = true; }
      if (t.modus === "geht") {
        const d = t.ziel - t.x;
        // Mit dem Koffer kommt es zügig herein, sonst schlendert es.
        const schritt = (t.koffer ? 130 : 52) * dt;
        t.richtung = d < 0 ? -1 : 1;
        if (Math.abs(d) <= schritt) {
          t.x = t.ziel;
          t.modus = "steht";
          t.bis = jetzt + 1800 + Math.random() * 4200;
          if (t.koffer) { t.g.querySelector(".bau-koffer")?.remove(); t.koffer = false; t.huepf = 1; }
        } else { t.x += Math.sign(d) * schritt; laeuft = true; }
      }
      stelleTier(t, dt);
      tierOrte.set(tierSchluessel(t.hausId, t.index, t.tier), { x: t.x, ziel: t.ziel, modus: t.modus === "geht" && !t.koffer ? "geht" : "steht", richtung: t.richtung });
    });
    return laeuft;
  }

  function planeTiere() {
    jedesBild.add(tierBild);
    wecke();
    if (tierUhr) window.clearTimeout(tierUhr);
    const naechstes = () => {
      tierUhr = 0;
      if (!ui.host?.isConnected) return;
      const jetzt = performance.now();
      let bald = Infinity;
      tiere.forEach((t) => {
        if (t.modus !== "steht") return;
        if (ui.nacht && t.tier.a !== "owl") return;
        if (jetzt >= t.bis) {
          const breite = A().ZW;
          t.ziel = clamp(t.x + (Math.random() - 0.5) * 260, 40, breite - 40);
          t.modus = "geht";
          if (Math.random() < 0.25) zeigeWunschBlase(t);
        } else bald = Math.min(bald, t.bis - jetzt);
      });
      wecke();
      tierUhr = window.setTimeout(naechstes, Number.isFinite(bald) ? Math.max(400, bald) : 3000);
    };
    tierUhr = window.setTimeout(naechstes, 900);
  }

  // Ab und zu zeigt ein Tier, was es sich wünscht – als Bild in einer Blase.
  function zeigeWunschBlase(t) {
    if (!t.wohnt) return;
    const offen = S().wuensche(t.hausId, t.index).filter((w) => !w.erfuellt);
    if (!offen.length) return;
    const w = offen[Math.floor(Math.random() * offen.length)];
    blaseAnTier(t, wunschBild(w, 34), 3800);
  }

  // halb: wie breit die Blase zur Hälfte ist – für Text mitwachsend.
  function blaseAnTier(t, inhalt, dauer = 3000, halb = 30) {
    t.g.querySelector(".bau-blase")?.remove();
    const b = document.createElementNS(NS, "g");
    b.setAttribute("class", "bau-blase");
    b.setAttribute("transform", "translate(14 -120)");
    const w = halb * 2;
    b.innerHTML = `<path d="M${-halb} -46h${w}a12 12 0 0 1 12 12v28a12 12 0 0 1-12 12h${-(w - 16)}l-10 12l0-12h-6a12 12 0 0 1-12-12v-28a12 12 0 0 1 12-12z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/><g transform="translate(0 -20)">${inhalt}</g>`;
    t.g.append(b);
    window.setTimeout(() => b.remove(), dauer);
  }

  // Eine Blase über einem Stockwerk der Hausansicht (Einzug, neuer Wunsch).
  function zeigeBlase(hausId, index, text, dauer = 3000) {
    for (const t of tiere.values()) {
      if (t.hausId === hausId && t.index === index && t.wohnt) {
        const halb = Math.max(30, text.length * 3.6 + 4);
        blaseAnTier(t, `<text x="0" y="6" text-anchor="middle" font-size="13" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#243047">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`, dauer, halb);
        return;
      }
    }
  }

  // Das Bild zu einem Wunsch: das Ding, die Farbe oder das Zimmer.
  function wunschBild(w, groesse = 30) {
    if (w.typ === "ding") return dingBild(w.zeige, groesse);
    if (w.typ === "farbe") {
      const hex = farbeHex(w.farbe);
      return `<rect x="${-groesse / 2}" y="${-groesse / 2}" width="${groesse}" height="${groesse}" rx="6" fill="${hex}" stroke="#ffffff" stroke-width="2"/><path d="M${-groesse / 4} ${groesse / 6}l${groesse / 2} ${-groesse / 2}" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`;
    }
    return dingBild(w.icon, groesse);
  }

  // Ein Ding, eingepasst in ein Quadrat um (0, 0).
  function dingBild(id, groesse = 30) {
    const ding = M().DINGE[id];
    if (!ding) return "";
    const k = groesse / Math.max(ding.w, ding.h);
    const dy = ding.art === "wand" ? 0 : ding.art === "decke" ? -ding.h / 2 : ding.h / 2;
    return `<g transform="scale(${k.toFixed(3)}) translate(0 ${dy})">${M().zeichne(id)}</g>`;
  }

  // ---------------------------------------------------------------------------
  // Das Zimmer: Zoom hinein, einrichten, Zoom hinaus
  // ---------------------------------------------------------------------------
  function baueZimmerRahmen() {
    els.zimmer.innerHTML = "";
    els.zimmerKopf = el("div", "bau-zimmerkopf");
    els.zimmerBuehne = el("div", "bau-zimmerbuehne");
    els.werkzeug = el("div", "bau-werkzeug");
    els.schublade = el("div", "bau-schublade");
    els.bearbeiten = el("div", "bau-bearbeiten");
    els.bearbeiten.hidden = true;
    els.muell = el("div", "bau-muell", { "aria-hidden": "true" });
    els.muell.innerHTML = svgVon(`<path d="M7 7h10l-1 13H8z" fill="#ffffff"/><rect x="5" y="4.5" width="14" height="2.5" rx="1" fill="#ffffff"/><rect x="10" y="2.5" width="4" height="2.5" rx="1" fill="#ffffff"/>`, "0 0 24 24");
    els.muell.hidden = true;
    // Oben in einer Zeile: Name und Tier, daneben die Werkzeuge – zwischen
    // Zurück-Knopf und Lautsprecher links und den festen Knöpfen rechts.
    els.kopfzeile = el("div", "bau-kopfzeile");
    els.kopfzeile.append(els.zimmerKopf, els.werkzeug);
    els.zimmer.append(els.zimmerBuehne, els.kopfzeile, els.schublade, els.bearbeiten, els.muell);
    zimmerEreignisse();
  }

  async function oeffneZimmer(index) {
    if (ui.besetzt) return;
    const st = S().stock(ui.haus, index);
    if (!st?.raum) return;
    ui.besetzt = true; besetztSeit = performance.now();
    ui.zimmer = index;
    merkeErfuellt();
    ui.auswahl = null;
    ui.rueck = [];
    ui.schublade = "passt";
    const raum = K().RAEUME[st.raum];
    sag(st.tier ? `${raum.der}. ${S().aufenthalt(ui.haus, index) ? `${st.tier.n} ist gerade unterwegs.` : `Hier ${ui.haus === "wohnhaus" ? "wohnt" : "arbeitet"} ${st.tier.n}.`}` : `${raum.der}.`);
    // Der Zoom: Die Hausansicht wächst vom Stockwerk aus auf den Platz des
    // Zimmers (unscharf, aber schnell), dann steht das scharfe Zimmer da.
    const von = stockAufSchirm(index);
    zeichneZimmer();
    const nach = zimmerRechteck();
    els.zimmer.hidden = false;
    ui.host.classList.add("ist-zimmer");
    if (!reduced()) {
      const k = nach.w / von.w;
      const ox = von.x;
      const oy = von.y;
      els.zimmer.classList.add("is-einblenden");
      els.welt.style.transformOrigin = `${ox - ui.kamera.tx}px ${oy - ui.kamera.ty}px`;
      await tweenP(420, (p) => {
        const s = 1 + (k - 1) * p;
        const tx = ui.kamera.tx + (nach.x - ox) * p;
        const ty = ui.kamera.ty + (nach.y - oy) * p;
        els.welt.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
        els.zimmer.style.opacity = String(clamp((p - 0.55) / 0.45, 0, 1));
      }, { e: ease.inOut });
      els.zimmer.classList.remove("is-einblenden");
      els.zimmer.style.opacity = "";
    }
    els.welt.style.visibility = "hidden";
    els.welt.style.transformOrigin = "";
    setzeKamera();
    ui.besetzt = false;
    hilfeZimmer();
    starteTiereZimmer();
  }

  async function schliesseZimmer(sofort = false) {
    if (ui.zimmer < 0) return;
    const index = ui.zimmer;
    waehleAus(null);
    S().speichern(true);
    ui.zimmer = -1;
    ui.besetzt = true; besetztSeit = performance.now();
    zeichneHaus({ behalteKamera: true });
    kameraAuf(index, false);
    els.welt.style.visibility = "";
    if (!sofort && !reduced()) {
      const von = zimmerRechteck();
      const nach = stockAufSchirm(index);
      const k = von.w / nach.w;
      els.welt.style.transformOrigin = `${nach.x - ui.kamera.tx}px ${nach.y - ui.kamera.ty}px`;
      await tweenP(380, (p) => {
        const q = 1 - p;
        const s = 1 + (k - 1) * q;
        const tx = ui.kamera.tx + (von.x - nach.x) * q;
        const ty = ui.kamera.ty + (von.y - nach.y) * q;
        els.welt.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
        els.zimmer.style.opacity = String(clamp(1 - p / 0.4, 0, 1));
      }, { e: ease.inOut });
      els.welt.style.transformOrigin = "";
    }
    els.zimmer.hidden = true;
    els.zimmer.style.opacity = "";
    ui.host.classList.remove("ist-zimmer");
    setzeKamera();
    ui.besetzt = false;
    hilfeHaus();
    baueUmschalter();
    pruefeLieferung();
  }

  // Wo das Zimmer im Zoom steht: so gross wie möglich zwischen Kopfzeile und
  // Schublade.
  function zimmerRechteck() {
    const w = ui.host.clientWidth || 800;
    const h = ui.host.clientHeight || 500;
    const klein = h < 520;
    const oben = klein ? 50 : 78;
    const unten = klein ? 104 : 178;
    const rand = 10;
    const pw = w - rand * 2;
    const ph = h - oben - unten - 8;
    const art = A();
    const k = Math.min(pw / art.ZW, ph / art.ZH);
    const zw = art.ZW * k;
    const zh = art.ZH * k;
    return { x: (w - zw) / 2, y: oben + (ph - zh) / 2 + 4, w: zw, h: zh, k };
  }

  function passeZimmerEin() {
    const r = zimmerRechteck();
    const svg = els.zimmerBuehne.querySelector("svg");
    if (!svg) return;
    svg.style.left = `${r.x}px`;
    svg.style.top = `${r.y}px`;
    svg.style.width = `${r.w}px`;
    svg.style.height = `${r.h}px`;
    platziereBearbeiten();
  }

  function zeichneZimmer() {
    const st = S().stock(ui.haus, ui.zimmer);
    if (!st) return;
    const art = A();
    const raum = K().RAEUME[st.raum];
    els.zimmerBuehne.innerHTML = `<svg xmlns="${NS}" class="bau-zimmer-svg${ui.nacht ? " is-nacht" : ""}" viewBox="0 0 ${art.ZW} ${art.ZH}" role="img" aria-label="${raum?.name || "Zimmer"}">` +
      `<defs><radialGradient id="bau-glanz-z"><stop offset="0" stop-color="#fff6c2" stop-opacity="0.75"/><stop offset="1" stop-color="#fff6c2" stop-opacity="0"/></radialGradient></defs>` +
      `${zimmerInhalt(ui.haus, ui.zimmer).replace(/url\(#bau-glanz\)/g, "url(#bau-glanz-z)")}` +
      `<rect class="bau-auswahlrahmen" x="0" y="0" width="0" height="0" rx="8" fill="none" stroke="#3fbf74" stroke-width="3" stroke-dasharray="10 7" visibility="hidden" pointer-events="none"/>` +
      `${st.dinge.length ? "" : `<g class="bau-leerhinweis" pointer-events="none"><text x="${art.ZW / 2}" y="${art.ZH / 2 - 12}" text-anchor="middle" font-size="22" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#243047" opacity="0.45">Zieh Dinge aus der Schublade hierher</text><path d="M${art.ZW / 2} ${art.ZH / 2 + 4}v34m-12-12l12 12l12-12" fill="none" stroke="#243047" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/></g>`}` +
      `</svg>`;
    ui.gezeichnet = zeichenStand();
    passeZimmerEin();
    zeichneZimmerKopf();
    zeichneWerkzeug();
    zeichneSchublade();
    if (ui.auswahl && !st.dinge.some((d) => d.k === ui.auswahl)) waehleAus(null);
    else if (ui.auswahl) zeigeAuswahl();
    if (ui.zimmer >= 0 && !els.zimmer.hidden) starteTiereZimmer();
  }

  function starteTiereZimmer() {
    tiere.clear();
    const svg = els.zimmerBuehne.querySelector("svg");
    const lage = svg?.querySelector(".bau-tierlage");
    if (!lage) return;
    lage.innerHTML = "";
    const st = S().stock(ui.haus, ui.zimmer);
    const jetzt = Date.now();
    if (st?.tier && !S().aufenthalt(ui.haus, ui.zimmer, jetzt)) setzeTier(lage, { hausId: ui.haus, index: ui.zimmer, tier: st.tier, wohnt: true });
    else if (st?.tier) lage.insertAdjacentHTML("beforeend", tuerSchild(st, ui.zimmer));
    S().besucher(ui.haus, ui.zimmer, jetzt).forEach((b, n) => setzeTier(lage, { hausId: b.haus, index: b.index, tier: b.tier, wohnt: false, x: 360 + n * 70 }));
    planeTiere();
  }

  // Oben im Zimmer: Name, wer hier wohnt, die Sterne.
  function zeichneZimmerKopf() {
    if (ui.zimmer < 0) return;
    const st = S().stock(ui.haus, ui.zimmer);
    if (!st) return;
    const raum = K().RAEUME[st.raum];
    els.zimmerKopf.innerHTML = "";
    const name = knopf("bau-zimmername", `${raum.name}: vorlesen`, `<span>${raum.name}</span>${svgVon(`<path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`, "0 0 24 24", "bau-lautsprecher")}`,
      () => sag(`${raum.der}. ${raum.text}`));
    els.zimmerKopf.append(name);
    if (st.tier) {
      const st8 = S().sterne(ui.haus, ui.zimmer);
      const laune = S().laune(ui.haus, ui.zimmer);
      const t = knopf("bau-zimmertier", `${st.tier.n}: ${st8.anzahl} von ${st8.total} Sternen. Antippen für die Wünsche.`,
        `${svgVon(`<g transform="translate(24 50) scale(0.62)">${A().tier(st.tier.a)}</g>`, "0 0 48 52", "bau-zimmertier-bild")}<span class="bau-sternreihe">${sternReiheHtml(st8)}</span><span class="bau-sternzahl"><i class="bau-stern is-gelb is-voll"></i>${st8.anzahl}/${st8.total}</span><span class="bau-laune" aria-hidden="true">${laune.emoji}</span>`,
        () => oeffneTafel(ui.haus, ui.zimmer));
      els.zimmerKopf.append(t);
    }
  }

  function sternReiheHtml(st) {
    const s = (voll, f) => `<i class="bau-stern is-${f}${voll ? " is-voll" : ""}"></i>`;
    return st.gelb.map((v) => s(v, "gelb")).join("") + st.gruen.map((v) => s(v, "gruen")).join("") + st.blau.map((v) => s(v, "blau")).join("");
  }

  // Die Werkzeuge rechts oben im Zimmer: Rückgängig, Licht, Zimmerart.
  function zeichneWerkzeug() {
    if (ui.zimmer < 0) return;
    const st = S().stock(ui.haus, ui.zimmer);
    els.werkzeug.innerHTML = "";
    const rueck = knopf("bau-rund", "Rückgängig", svgVon(`<path d="M9 7 4 12l5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12h9a5 5 0 0 1 0 10h-2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`, "0 0 24 24"), rueckgaengig);
    rueck.disabled = ui.rueck.length === 0;
    const licht = knopf(`bau-rund${st?.licht ? " is-an" : ""}`, st?.licht ? "Licht ausschalten" : "Licht einschalten",
      svgVon(`<path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3z" fill="${st?.licht ? "#ffd166" : "none"}" stroke="currentColor" stroke-width="2"/><path d="M9.5 20h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`, "0 0 24 24"),
      () => {
        merkeRueck();
        S().aendereStock(ui.haus, ui.zimmer, (s) => { s.licht = s.licht ? 0 : 1; });
        sag(S().stock(ui.haus, ui.zimmer).licht ? "Licht an." : "Licht aus.");
        zeichneZimmer();
      });
    const raumArt = knopf("bau-rund", "Zimmerart ändern", svgVon(`<path d="M4 20V9l8-5 8 5v11h-5v-6H9v6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`, "0 0 24 24"), () => zeigeRaumwahl(ui.zimmer));
    els.werkzeug.append(rueck, licht, raumArt);
  }

  // ---------------------------------------------------------------------------
  // Die Schublade
  // ---------------------------------------------------------------------------
  function zeichneSchublade() {
    if (ui.zimmer < 0) return;
    const st = S().stock(ui.haus, ui.zimmer);
    const raum = K().RAEUME[st.raum];
    els.schublade.innerHTML = "";
    const reiter = el("div", "bau-reiter", { role: "tablist" });
    const tabs = [
      { id: "wand", name: "Wand anmalen", icon: svgVon(`<rect x="3" y="4" width="13" height="7" rx="2" fill="#ff7aa2"/><path d="M16 7h3v6h-8v3" fill="none" stroke="#4a5568" stroke-width="2"/><rect x="9" y="16" width="4" height="6" rx="1.5" fill="#4a5568"/>`, "0 0 24 24") },
      { id: "boden", name: "Boden", icon: svgVon(`<path d="M2 15h20v6H2z" fill="#c88c5c"/><path d="M2 18h20M8 15v3M15 18v3" stroke="#8a5734" stroke-width="1.4"/><rect x="2" y="3" width="20" height="12" fill="#cfeaff"/>`, "0 0 24 24") },
      { id: "passt", name: `Passt in ${raum.der.replace(/^der /, "den ")}`, icon: `<span class="bau-reiter-emoji">⭐</span>` },
      ...M().KATEGORIEN.map((kat) => ({ id: kat.id, name: kat.name, icon: `<span class="bau-reiter-emoji">${kat.icon}</span>` })),
    ];
    tabs.forEach((tab) => {
      const b = knopf(`bau-reiter-knopf${ui.schublade === tab.id ? " is-aktiv" : ""}`, tab.name, tab.icon, () => {
        ui.schublade = tab.id;
        waehleAus(null);
        sag(tab.id === "passt" ? "Das passt hierher." : tab.name);
        zeichneSchublade();
      });
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", ui.schublade === tab.id ? "true" : "false");
      reiter.append(b);
    });
    const inhalt = el("div", "bau-inhalt");
    if (ui.schublade === "wand") fuelleWand(inhalt, st);
    else if (ui.schublade === "boden") fuelleBoden(inhalt, st);
    else fuelleDinge(inhalt, ui.schublade === "passt" ? passendFuer(st) : Object.values(M().DINGE).filter((d) => d.kat === ui.schublade).map((d) => d.id));
    els.schublade.append(reiter, inhalt);
    reiter.querySelector(".is-aktiv")?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }

  // "Passt hierher": was zur Zimmerart gehört, und was sich das Tier wünscht.
  function passendFuer(st) {
    const raum = K().RAEUME[st.raum];
    const ids = [...(raum?.passend || [])];
    if (st.tier) {
      S().wuensche(ui.haus, ui.zimmer).forEach((w) => { if (w.typ === "ding" && w.zeige && !ids.includes(w.zeige)) ids.unshift(w.zeige); });
    }
    return ids.filter((id) => M().DINGE[id]);
  }

  function fuelleDinge(inhalt, ids) {
    const st = S().stock(ui.haus, ui.zimmer);
    const gewuenscht = new Set(st?.tier ? S().wuensche(ui.haus, ui.zimmer).filter((w) => w.typ === "ding" && !w.erfuellt).flatMap((w) => Object.values(M().DINGE).filter((d) => d.tags.includes(w.tag)).map((d) => d.id)) : []);
    ids.forEach((id) => {
      const ding = M().DINGE[id];
      const b = el("button", `bau-ding-knopf${gewuenscht.has(id) ? " is-gewuenscht" : ""}`, { type: "button", "aria-label": ding.name, title: ding.name });
      b.dataset.ding = id;
      const box = Math.max(ding.w, ding.h);
      const pad = box * 0.12;
      const y0 = ding.art === "wand" ? -ding.h / 2 : ding.art === "decke" ? 0 : -ding.h;
      b.innerHTML = svgVon(M().zeichne(id), `${-box / 2 - pad} ${y0 + ding.h / 2 - box / 2 - pad} ${box + pad * 2} ${box + pad * 2}`) + (gewuenscht.has(id) ? `<span class="bau-wunschmarke" aria-hidden="true">★</span>` : "");
      b.addEventListener("pointerdown", (e) => schubladeGriff(e, id));
      b.addEventListener("click", (e) => {
        if (b.dataset.gezogen === "1") { b.dataset.gezogen = ""; e.preventDefault(); return; }
        sag(ding.der);
        stelleDing(id);
      });
      inhalt.append(b);
    });
  }

  function farbKnopf(farbe, aktiv, onClick, label = farbe.name) {
    const b = el("button", `bau-farbe${aktiv ? " is-aktiv" : ""}`, { type: "button", "aria-label": label, title: label });
    b.style.setProperty("--farbe", farbe.hex);
    b.addEventListener("click", onClick);
    return b;
  }

  function fuelleWand(inhalt, st) {
    const farben = el("div", "bau-farbreihe");
    K().FARBEN.forEach((farbe) => {
      farben.append(farbKnopf(farbe, st.wand === farbe.id, () => {
        merkeRueck();
        S().aendereStock(ui.haus, ui.zimmer, (s) => { s.wand = farbe.id; });
        sag(farbe.name);
        rolleFarbe();
      }));
    });
    const muster = el("div", "bau-musterreihe");
    K().MUSTER.forEach((m) => {
      const b = el("button", `bau-muster${st.muster === m.id ? " is-aktiv" : ""}`, { type: "button", "aria-label": m.name, title: m.name });
      const id = `bau-muster-vorschau-${m.id}`;
      const hex = farbeHex(st.wand);
      b.innerHTML = svgVon(`<defs>${A().musterDef(id, m.id, hex)}</defs><rect width="60" height="60" fill="${hex}"/>${m.id === "keine" ? "" : `<rect width="60" height="60" fill="url(#${id})"/>`}`, "0 0 60 60");
      b.addEventListener("click", () => {
        merkeRueck();
        S().aendereStock(ui.haus, ui.zimmer, (s) => { s.muster = m.id; });
        sag(m.name);
        rolleFarbe();
      });
      muster.append(b);
    });
    inhalt.append(farben, muster);
    inhalt.classList.add("is-farben");
  }

  function fuelleBoden(inhalt, st) {
    const arten = el("div", "bau-musterreihe");
    K().BOEDEN.forEach((b0) => {
      const b = el("button", `bau-muster${st.boden === b0.id ? " is-aktiv" : ""}`, { type: "button", "aria-label": b0.name, title: b0.name });
      const hex = st.bodenFarbe ? farbeHex(st.bodenFarbe) : b0.farbe;
      b.innerHTML = svgVon(`<g transform="scale(0.5) translate(0 0)">${A().boden(b0.id, b0.id === st.boden ? hex : b0.farbe, 0, 120, 120)}</g>`, "0 0 60 60");
      b.addEventListener("click", () => {
        merkeRueck();
        S().aendereStock(ui.haus, ui.zimmer, (s) => { s.boden = b0.id; s.bodenFarbe = ""; });
        sag(b0.name);
        zeichneZimmer();
      });
      arten.append(b);
    });
    const farben = el("div", "bau-farbreihe");
    K().FARBEN.forEach((farbe) => {
      farben.append(farbKnopf(farbe, st.bodenFarbe === farbe.id, () => {
        merkeRueck();
        S().aendereStock(ui.haus, ui.zimmer, (s) => { s.bodenFarbe = farbe.id; });
        sag(`Boden ${farbe.name}`);
        zeichneZimmer();
      }, `Boden ${farbe.name}`));
    });
    inhalt.append(arten, farben);
    inhalt.classList.add("is-farben");
  }

  // Die Wand wird neu gemalt – mit einem kurzen Wisch von links nach rechts,
  // wie mit einem Farbroller.
  function rolleFarbe() {
    const svg = els.zimmerBuehne.querySelector("svg");
    const alt = svg?.querySelector(".bau-wand")?.getAttribute("fill");
    zeichneZimmer();
    const neu = els.zimmerBuehne.querySelector("svg");
    if (!neu || reduced() || !alt) return;
    const deck = document.createElementNS(NS, "rect");
    deck.setAttribute("y", "0");
    deck.setAttribute("height", "216");
    deck.setAttribute("fill", alt);
    deck.setAttribute("pointer-events", "none");
    const wand = neu.querySelector(".bau-boden");
    wand?.parentNode?.insertBefore(deck, wand);
    tween(520, (p) => {
      deck.setAttribute("x", String(A().ZW * p));
      deck.setAttribute("width", String(A().ZW * (1 - p)));
    }, { e: ease.inOut, done: () => deck.remove() });
    pruefeDank();
  }

  // ---------------------------------------------------------------------------
  // Dinge stellen, ziehen, bearbeiten
  // ---------------------------------------------------------------------------
  function merkeRueck() {
    const st = S().stock(ui.haus, ui.zimmer);
    if (!st) return;
    ui.rueck.push(JSON.stringify({ wand: st.wand, muster: st.muster, boden: st.boden, bodenFarbe: st.bodenFarbe, licht: st.licht, dinge: st.dinge }));
    if (ui.rueck.length > 40) ui.rueck.shift();
  }

  function rueckgaengig() {
    const schritt = ui.rueck.pop();
    if (!schritt) return;
    const alt = JSON.parse(schritt);
    S().aendereStock(ui.haus, ui.zimmer, (s) => { Object.assign(s, alt); });
    waehleAus(null);
    sag("Rückgängig.");
    zeichneZimmer();
  }

  // Ein Ding per Antippen ins Zimmer: an die freieste Stelle, und es fällt von
  // oben hinein.
  function stelleDing(id, { x = null, y = null } = {}) {
    const st = S().stock(ui.haus, ui.zimmer);
    if (!st) return null;
    if (st.dinge.length >= S().DINGE_MAX) { sag("Das Zimmer ist voll. Räum zuerst etwas weg."); return null; }
    const ding = M().DINGE[id];
    const geo = S().GEO;
    const ort = x === null ? freieStelle(st, id) : { x, y };
    const d = { k: S().kennung("d"), i: id, x: ort.x, y: ort.y, c: "", f: 0, s: 1 };
    if (ding.art === "boden" || ding.art === "flach") {
      const lande = landeplatz(st, d, ort.y ?? geo.STAND);
      d.y = lande.y;
    } else if (ding.art === "decke") d.y = 0;
    begrenze(d);
    merkeRueck();
    const fallVon = ding.art === "boden" ? d.y - 140 : null;
    S().aendereStock(ui.haus, ui.zimmer, (s) => { s.dinge.push(d); });
    zeichneZimmer();
    waehleAus(d.k, { stumm: true });
    if (fallVon !== null) falle(d, fallVon);
    else poof(d);
    pruefeDank();
    return d;
  }

  // Wo ist am meisten Platz? Von der Mitte aus nach links und rechts suchen.
  function freieStelle(st, id) {
    const ding = M().DINGE[id];
    const geo = S().GEO;
    const u = M().umriss(id, 1);
    const halb = (u.x1 - u.x0) / 2;
    let bester = { x: geo.W / 2, wert: Infinity };
    for (let x = halb + 6; x <= geo.W - halb - 6; x += 14) {
      let ueber = 0;
      st.dinge.forEach((d) => {
        const andere = M().DINGE[d.i];
        if (!andere || andere.art !== ding.art) return;
        const v = M().umriss(d.i, d.s);
        const a0 = x - halb;
        const a1 = x + halb;
        const b0 = d.x + v.x0;
        const b1 = d.x + v.x1;
        ueber += Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
      });
      const wert = ueber + Math.abs(x - geo.W / 2) * 0.05;
      if (wert < bester.wert) bester = { x, wert };
    }
    if (ding.art === "wand") return { x: bester.x, y: 92 };
    if (ding.art === "decke") return { x: bester.x, y: 0 };
    return { x: bester.x, y: geo.STAND };
  }

  // Ein Ding im Zimmer halten – nichts ragt aus der Wand oder unter den Boden.
  function begrenze(d) {
    const ding = M().DINGE[d.i];
    const geo = S().GEO;
    const u = M().umriss(d.i, d.s);
    d.x = clamp(d.x, -u.x0 + 2, geo.W - u.x1 - 2);
    if (ding.art === "wand") d.y = clamp(d.y, -u.y0 + 4, geo.WAND_UNTEN - u.y1 - 2);
    else if (ding.art === "decke") d.y = 0;
    else if (ding.art === "flach") d.y = clamp(d.y, geo.STAND_HINTEN, geo.STAND_VORNE);
    else d.y = clamp(d.y, Math.max(-u.y0 + 2, 0), geo.STAND_VORNE);
  }

  // Wohin ein losgelassenes Ding fällt: auf die höchste Fläche darunter (nur
  // kleine Dinge), sonst auf den Boden – weiter vorn, wenn es tief losgelassen
  // wurde.
  function landeplatz(st, d, yLos) {
    const geo = S().GEO;
    const ding = M().DINGE[d.i];
    if (ding.art === "flach") return { y: clamp(yLos, geo.STAND_HINTEN, geo.STAND_VORNE) };
    if (ding.klein) {
      let beste = null;
      st.dinge.forEach((u) => {
        if (u.k === d.k) return;
        const fl = flaecheVon(u);
        if (!fl || d.x < fl.x0 || d.x > fl.x1) return;
        if (fl.y < yLos - 18) return;   // die Fläche liegt über dem Ding
        if (!beste || fl.y < beste.y) beste = fl;
      });
      if (beste) return { y: beste.y, traeger: true };
    }
    if (yLos >= geo.STAND_HINTEN && yLos <= geo.STAND_VORNE) return { y: yLos };
    return { y: yLos > geo.STAND_VORNE ? geo.STAND_VORNE : geo.STAND };
  }

  // Das Fallen: von oben herab, mit einem kleinen Stauchen beim Aufkommen.
  function falle(d, vonY) {
    const node = dingKnoten(d.k);
    if (!node || reduced()) return;
    const zielY = d.y;
    const k = M().MASS * (d.s || 1);
    tween(420, (p) => {
      const y = vonY + (zielY - vonY) * p;
      node.setAttribute("transform", `translate(${d.x} ${y}) scale(${d.f ? -k : k} ${k})`);
    }, { e: ease.in, done: () => {
      tween(220, (p) => {
        const quetsch = Math.sin(Math.PI * p) * 0.12;
        node.setAttribute("transform", `translate(${d.x} ${zielY}) scale(${(d.f ? -k : k) * (1 + quetsch)} ${k * (1 - quetsch)})`);
      }, { e: ease.lin, done: () => node.setAttribute("transform", dingTransform(d)) });
    } });
  }

  // Wolkenkringel, wo ein Ding auftaucht oder verschwindet.
  function poof(d, farbe = "#ffffff") {
    const svg = els.zimmerBuehne.querySelector("svg");
    if (!svg || reduced()) return;
    const u = M().umriss(d.i, d.s);
    const cx = d.x;
    const cy = d.y + (u.y0 + u.y1) / 2;
    const g = document.createElementNS(NS, "g");
    g.setAttribute("pointer-events", "none");
    const teile = Array.from({ length: 8 }, (_, i) => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("fill", farbe);
      c.setAttribute("stroke", "#e2e8f0");
      g.append(c);
      return { c, a: (i / 8) * Math.PI * 2 };
    });
    svg.append(g);
    tween(520, (p) => {
      teile.forEach((t) => {
        t.c.setAttribute("cx", String(cx + Math.cos(t.a) * (20 + p * 40)));
        t.c.setAttribute("cy", String(cy + Math.sin(t.a) * (14 + p * 30)));
        t.c.setAttribute("r", String(9 * (1 - p) + 2));
        t.c.setAttribute("opacity", String(1 - p));
      });
    }, { done: () => g.remove() });
  }

  function dingKnoten(k) { return els.zimmerBuehne.querySelector(`.bau-ding[data-k="${k}"]`); }
  function dingDaten(k) { return S().stock(ui.haus, ui.zimmer)?.dinge.find((d) => d.k === k) || null; }

  // Bildschirm → Zimmer-Einheiten.
  function zimmerPunkt(clientX, clientY) {
    const svg = els.zimmerBuehne.querySelector("svg");
    if (!svg) return null;
    const m = svg.getScreenCTM();
    if (!m) return null;
    const p = svg.createSVGPoint();
    p.x = clientX;
    p.y = clientY;
    const q = p.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  }
  function imZimmer(clientX, clientY) {
    const svg = els.zimmerBuehne.querySelector("svg");
    if (!svg) return false;
    const r = svg.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }
  function imMuell(clientX, clientY) {
    if (els.muell.hidden) return false;
    const r = els.muell.getBoundingClientRect();
    return clientX >= r.left - 16 && clientX <= r.right + 16 && clientY >= r.top - 16 && clientY <= r.bottom + 16;
  }

  // --- Ziehen aus der Schublade ---------------------------------------------
  function schubladeGriff(e, id) {
    if (e.button > 0) return;
    const knopfEl = e.currentTarget;
    const start = { x: e.clientX, y: e.clientY };
    let geist = null;
    let aktiv = false;
    const pid = e.pointerId;
    const bewegen = (ev) => {
      if (ev.pointerId !== pid) return;
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!aktiv) {
        // Erst wer klar nach oben zieht, holt ein Ding heraus – waagrecht
        // wird die Schublade gescrollt.
        if (dy < -12 && Math.abs(dy) > Math.abs(dx) * 0.8) {
          aktiv = true;
          knopfEl.dataset.gezogen = "1";
          geist = el("div", "bau-geist");
          const ding = M().DINGE[id];
          const r = zimmerRechteck();
          const w = ding.w * M().MASS * r.k;
          const h = ding.h * M().MASS * r.k;
          geist.style.width = `${w}px`;
          geist.style.height = `${h}px`;
          const y0 = ding.art === "wand" ? -ding.h / 2 : ding.art === "decke" ? 0 : -ding.h;
          geist.innerHTML = svgVon(M().zeichne(id), `${-ding.w / 2} ${y0} ${ding.w} ${ding.h}`);
          geist.dataset.art = ding.art;
          els.flug.append(geist);
          els.muell.hidden = true;
          sag(ding.der);
        } else if (Math.abs(dx) > 12) { aufraeumen(); return; }
      }
      if (aktiv && geist) {
        const art = geist.dataset.art;
        const w = parseFloat(geist.style.width);
        const h = parseFloat(geist.style.height);
        const gx = ev.clientX - w / 2;
        const gy = art === "wand" ? ev.clientY - h / 2 : art === "decke" ? ev.clientY - h * 0.2 : ev.clientY - h * 0.85;
        geist.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
        geist.classList.toggle("is-draussen", !imZimmer(ev.clientX, ev.clientY));
      }
    };
    const loslassen = (ev) => {
      if (ev.pointerId !== pid) return;
      if (aktiv && geist) {
        const art = geist.dataset.art;
        const h = parseFloat(geist.style.height);
        if (imZimmer(ev.clientX, ev.clientY)) {
          const r = zimmerRechteck();
          const p = zimmerPunkt(ev.clientX, ev.clientY);
          const yBasis = art === "wand" ? p.y : art === "decke" ? 0 : p.y + (h * 0.15) / r.k;
          const d = stelleDing(id, { x: p.x, y: yBasis });
          if (d) poof(d);
        }
      }
      aufraeumen();
    };
    function aufraeumen() {
      window.removeEventListener("pointermove", bewegen);
      window.removeEventListener("pointerup", loslassen);
      window.removeEventListener("pointercancel", loslassen);
      geist?.remove();
      geist = null;
      window.setTimeout(() => { knopfEl.dataset.gezogen = ""; }, 50);
    }
    window.addEventListener("pointermove", bewegen);
    window.addEventListener("pointerup", loslassen);
    window.addEventListener("pointercancel", loslassen);
  }

  // --- Ziehen im Zimmer -------------------------------------------------------
  function zimmerEreignisse() {
    let griff = null;
    els.zimmerBuehne.addEventListener("pointerdown", (e) => {
      if (ui.besetzt || e.button > 0) return;
      const schild = e.target.closest?.(".bau-schild");
      if (schild) { griff = null; oeffneTafel(ui.haus, ui.zimmer); return; }
      const tierEl = e.target.closest?.(".bau-tier");
      if (tierEl) {
        griff = { typ: "tier", id: e.pointerId, el: tierEl, x0: e.clientX, y0: e.clientY };
        return;
      }
      const dingEl = e.target.closest?.(".bau-ding");
      if (!dingEl) { griff = { typ: "leer", id: e.pointerId, x0: e.clientX, y0: e.clientY }; return; }
      const k = dingEl.getAttribute("data-k");
      const d = dingDaten(k);
      if (!d) return;
      const p = zimmerPunkt(e.clientX, e.clientY);
      const st = S().stock(ui.haus, ui.zimmer);
      // Was auf diesem Ding steht, wandert mit.
      const mit = st.dinge.filter((u) => u.k !== d.k && traegerVon(st, u)?.k === d.k).map((u) => ({ u, dx: u.x - d.x, dy: u.y - d.y }));
      griff = { typ: "ding", id: e.pointerId, k, x0: e.clientX, y0: e.clientY, dx: d.x - p.x, dy: d.y - p.y, bewegt: false, mit, vorher: JSON.stringify(st.dinge) };
      try { els.zimmerBuehne.setPointerCapture(e.pointerId); } catch { /* egal */ }
      e.preventDefault();
    });
    els.zimmerBuehne.addEventListener("pointermove", (e) => {
      if (!griff || e.pointerId !== griff.id || griff.typ !== "ding") return;
      if (!griff.bewegt && Math.hypot(e.clientX - griff.x0, e.clientY - griff.y0) < 6) return;
      if (!griff.bewegt) {
        griff.bewegt = true;
        zieht = true;
        els.bearbeiten.hidden = true;
        els.muell.hidden = false;
        dingKnoten(griff.k)?.parentNode?.append(dingKnoten(griff.k));
        griff.mit.forEach(({ u }) => { const n = dingKnoten(u.k); n?.parentNode?.append(n); });
      }
      const d = dingDaten(griff.k);
      const p = zimmerPunkt(e.clientX, e.clientY);
      if (!d || !p) return;
      d.x = p.x + griff.dx;
      d.y = p.y + griff.dy;
      const ding = M().DINGE[d.i];
      if (ding.art === "decke") d.y = 0;
      begrenzeLocker(d);
      dingKnoten(d.k)?.setAttribute("transform", dingTransform(d));
      griff.mit.forEach(({ u, dx, dy }) => { u.x = d.x + dx; u.y = d.y + dy; dingKnoten(u.k)?.setAttribute("transform", dingTransform(u)); });
      zeigeAuswahl();
      els.muell.classList.toggle("is-ueber", imMuell(e.clientX, e.clientY));
    });
    const ende = (e) => {
      if (!griff || e.pointerId !== griff.id) return;
      const g = griff;
      griff = null;
      zieht = false;
      els.muell.classList.remove("is-ueber");
      if (g.typ === "tier") {
        if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 10) oeffneTafel(g.el.getAttribute("data-haus"), Number(g.el.getAttribute("data-index")));
        return;
      }
      if (g.typ === "leer") { if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 10) waehleAus(null); return; }
      if (!g.bewegt) {
        const ding = M().DINGE[dingDaten(g.k)?.i];
        if (ui.auswahl === g.k) sag(ding?.der);
        waehleAus(g.k);
        return;
      }
      const imKorb = imMuell(e.clientX, e.clientY);
      els.muell.hidden = true;
      const st = S().stock(ui.haus, ui.zimmer);
      const d = dingDaten(g.k);
      // Der alte Stand für Rückgängig: so, wie es vor dem Ziehen war.
      ui.rueck.push(JSON.stringify({ wand: st.wand, muster: st.muster, boden: st.boden, bodenFarbe: st.bodenFarbe, licht: st.licht, dinge: JSON.parse(g.vorher) }));
      if (imKorb && d) { entferne(d.k, { schonGemerkt: true }); return; }
      if (d) {
        const ding = M().DINGE[d.i];
        if (ding.art === "boden" || ding.art === "flach") {
          const vonY = d.y;
          const lande = landeplatz(st, d, d.y);
          d.y = lande.y;
          begrenze(d);
          const dy = d.y - vonY;
          g.mit.forEach(({ u }) => { u.y += dy; begrenze(u); });
          if (Math.abs(dy) > 4) falle(d, vonY);
        } else begrenze(d);
      }
      S().aendereStock(ui.haus, ui.zimmer, () => {});
      zeichneZimmer();
      waehleAus(g.k, { stumm: true });
      pruefeDank();
    };
    els.zimmerBuehne.addEventListener("pointerup", ende);
    els.zimmerBuehne.addEventListener("pointercancel", ende);
  }

  // Beim Ziehen darf ein Ding über den Boden hinaus nach oben – fallen lassen
  // regelt erst das Loslassen.
  function begrenzeLocker(d) {
    const geo = S().GEO;
    const u = M().umriss(d.i, d.s);
    d.x = clamp(d.x, -u.x0 - 20, geo.W - u.x1 + 20);
    d.y = clamp(d.y, -u.y0 - 20, geo.H + 20);
  }

  function entferne(k, { schonGemerkt = false } = {}) {
    const d = dingDaten(k);
    if (!d) return;
    if (!schonGemerkt) merkeRueck();
    poof(d, "#f1f5f9");
    const ding = M().DINGE[d.i];
    S().aendereStock(ui.haus, ui.zimmer, (s) => { s.dinge = s.dinge.filter((u) => u.k !== k); });
    waehleAus(null);
    zeichneZimmer();
    sag(`${ding?.der || "Das Ding"} ist weg.`);
    klang("wrong");
  }

  // --- Das gewählte Ding und sein Menü ---------------------------------------
  function waehleAus(k, { stumm = false } = {}) {
    ui.auswahl = k;
    if (!k) {
      els.bearbeiten.hidden = true;
      els.zimmerBuehne.querySelector(".bau-auswahlrahmen")?.setAttribute("visibility", "hidden");
      return;
    }
    const d = dingDaten(k);
    if (!d) { waehleAus(null); return; }
    if (!stumm) sag(M().DINGE[d.i]?.der);
    baueBearbeiten(d);
    zeigeAuswahl();
  }

  function zeigeAuswahl() {
    const rahmen = els.zimmerBuehne.querySelector(".bau-auswahlrahmen");
    const d = ui.auswahl ? dingDaten(ui.auswahl) : null;
    if (!rahmen || !d) return;
    const u = M().umriss(d.i, d.s);
    rahmen.setAttribute("x", String(d.x + u.x0 - 6));
    rahmen.setAttribute("y", String(d.y + u.y0 - 6));
    rahmen.setAttribute("width", String(u.x1 - u.x0 + 12));
    rahmen.setAttribute("height", String(u.y1 - u.y0 + 12));
    rahmen.setAttribute("visibility", "visible");
    rahmen.parentNode.append(rahmen);
    platziereBearbeiten();
  }

  const GROESSEN = [0.7, 0.85, 1, 1.2, 1.4];

  function baueBearbeiten(d) {
    const ding = M().DINGE[d.i];
    els.bearbeiten.innerHTML = "";
    const zeile = el("div", "bau-bearbeiten-zeile");
    if (ding.farbe) {
      const farben = el("div", "bau-bearbeiten-farben");
      ["", "rot", "orange", "gelb", "gruen", "tuerkis", "blau", "violett", "rosa", "braun", "grau", "weiss", "schwarz"].forEach((id) => {
        const farbe = id ? K().FARBE[id] : { id: "", name: "Wie am Anfang", hex: ding.farbe };
        const b = farbKnopf(farbe, d.c === id, () => {
          merkeRueck();
          S().aendereStock(ui.haus, ui.zimmer, (s) => { const u = s.dinge.find((x) => x.k === d.k); if (u) u.c = id; });
          sag(farbe.name);
          zeichneZimmer();
          waehleAus(d.k, { stumm: true });
          pruefeDank();
        });
        if (!id) b.classList.add("is-grund");
        farben.append(b);
      });
      els.bearbeiten.append(farben);
    }
    const aktion = (cls, label, svg, fn) => zeile.append(knopf(`bau-aktion ${cls}`, label, svgVon(svg, "0 0 24 24"), fn));
    aktion("", "Umdrehen", `<path d="M12 3v18" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/><path d="M9 7 3 12l6 5zM15 7l6 5-6 5z" fill="currentColor"/>`, () => aendereDing(d.k, (u) => { u.f = u.f ? 0 : 1; }, "Umgedreht."));
    aktion("", "Kleiner", `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.5 12h9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`, () => aendereDing(d.k, (u) => { u.s = GROESSEN[Math.max(0, GROESSEN.indexOf(naechsteGroesse(u.s)) - 1)]; }, "Kleiner."));
    aktion("", "Grösser", `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.5 12h9M12 7.5v9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`, () => aendereDing(d.k, (u) => { u.s = GROESSEN[Math.min(GROESSEN.length - 1, GROESSEN.indexOf(naechsteGroesse(u.s)) + 1)]; }, "Grösser."));
    aktion("", "Nach vorne", `<rect x="3" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="4" width="11" height="11" rx="2" fill="currentColor"/>`, () => aendereDing(d.k, (u, s) => { s.dinge = s.dinge.filter((x) => x.k !== u.k).concat([u]); }, "Nach vorne."));
    aktion("", "Nach hinten", `<rect x="9" y="4" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="9" width="11" height="11" rx="2" fill="currentColor"/>`, () => aendereDing(d.k, (u, s) => { s.dinge = [u].concat(s.dinge.filter((x) => x.k !== u.k)); }, "Nach hinten."));
    aktion("is-weg", "Wegräumen", `<path d="M7 7h10l-1 13H8z" fill="currentColor"/><rect x="5" y="4.5" width="14" height="2.5" rx="1" fill="currentColor"/>`, () => entferne(d.k));
    els.bearbeiten.append(zeile);
    els.bearbeiten.hidden = false;
  }

  function naechsteGroesse(s) {
    let beste = GROESSEN[2];
    GROESSEN.forEach((g) => { if (Math.abs(g - s) < Math.abs(beste - s)) beste = g; });
    return beste;
  }

  function aendereDing(k, fn, sprich) {
    merkeRueck();
    S().aendereStock(ui.haus, ui.zimmer, (s) => {
      const u = s.dinge.find((x) => x.k === k);
      if (!u) return;
      const traegt = s.dinge.filter((x) => x.k !== k && traegerVon(s, x)?.k === k);
      const yAlt = flaecheVon(u)?.y;
      fn(u, s);
      begrenze(u);
      // Was obendrauf steht, bleibt obendrauf.
      const yNeu = flaecheVon(u)?.y;
      if (yAlt !== undefined && yNeu !== undefined) traegt.forEach((x) => { x.y = yNeu; begrenze(x); });
    });
    sag(sprich);
    zeichneZimmer();
    waehleAus(k, { stumm: true });
  }

  // Das Menü über dem Ding, aber immer ganz im Bild.
  function platziereBearbeiten() {
    if (els.bearbeiten.hidden || !ui.auswahl) return;
    const d = dingDaten(ui.auswahl);
    const svg = els.zimmerBuehne.querySelector("svg");
    if (!d || !svg) return;
    const u = M().umriss(d.i, d.s);
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = svg.createSVGPoint();
    p.x = d.x;
    p.y = d.y + u.y0;
    const host = ui.host.getBoundingClientRect();
    const ecke = (x, y) => { p.x = x; p.y = y; const q = p.matrixTransform(m); return { x: q.x - host.left, y: q.y - host.top }; };
    const a = ecke(d.x + u.x0, d.y + u.y0);
    const b = ecke(d.x + u.x1, d.y + u.y1);
    const links = Math.min(a.x, b.x);
    const rechts = Math.max(a.x, b.x);
    const w = els.bearbeiten.offsetWidth || 300;
    const h = els.bearbeiten.offsetHeight || 60;
    const breite = ui.host.clientWidth;
    const hoch = ui.host.clientHeight || 500;
    const raum = zimmerRechteck();
    const kopf = hoch < 520 ? 56 : 74;
    const mitte = (links + rechts) / 2;
    // Zuerst über dem Ding, dann darunter (aber nie über die Schublade), sonst
    // daneben – auf der Seite mit mehr Platz.
    let x = mitte - w / 2;
    let y = a.y - h - 12;
    if (y < kopf) {
      y = b.y + 12;
      if (y + h > raum.y + raum.h + 4) {
        y = clamp((a.y + b.y) / 2 - h / 2, kopf, hoch - h - 8);
        x = mitte < breite / 2 ? rechts + 12 : links - w - 12;
      }
    }
    x = clamp(x, 8, breite - w - 8);
    y = clamp(y, 8, hoch - h - 8);
    els.bearbeiten.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }

  // ---------------------------------------------------------------------------
  // Dank: ein Wunsch ist eben in Erfüllung gegangen
  // ---------------------------------------------------------------------------
  const erfuelltVorher = new Map();
  // Was jetzt schon erfüllt ist – damit nur Neues bedankt wird.
  function merkeErfuellt() {
    if (ui.zimmer < 0) return;
    erfuelltVorher.set(`${ui.haus}:${ui.zimmer}`, S().wuensche(ui.haus, ui.zimmer).filter((w) => w.erfuellt).map((w) => w.id));
  }
  function pruefeDank() {
    if (ui.zimmer < 0) return;
    const schluessel = `${ui.haus}:${ui.zimmer}`;
    const jetzt = S().wuensche(ui.haus, ui.zimmer).filter((w) => w.erfuellt).map((w) => w.id);
    const vorher = erfuelltVorher.get(schluessel);
    erfuelltVorher.set(schluessel, jetzt);
    if (!vorher) return;
    const neu = jetzt.filter((id) => !vorher.includes(id));
    if (!neu.length) return;
    const w = S().wuensche(ui.haus, ui.zimmer).find((x) => x.id === neu[0]);
    const st = S().stock(ui.haus, ui.zimmer);
    for (const t of tiere.values()) {
      if (t.wohnt && t.index === ui.zimmer && t.hausId === ui.haus) {
        t.huepf = 1;
        blaseAnTier(t, `<text x="0" y="8" text-anchor="middle" font-size="26">💛</text>`, 2200);
        wecke();
      }
    }
    klang("correct");
    const dank = w?.typ === "ding" ? `Juhu, ${K().DING_WUENSCHE[w.tag]?.ein || "danke"}! Danke!` : w?.typ === "farbe" ? "Juhu, meine Lieblingsfarbe! Danke!" : "Danke!";
    sag(`${st?.tier?.n ? `${st.tier.n}: ` : ""}${dank}`);
    const alle = S().sterne(ui.haus, ui.zimmer);
    if (alle.total && alle.anzahl === alle.total) {
      window.setTimeout(() => {
        klang("unlock");
        const svg = els.zimmerBuehne.querySelector("svg");
        if (svg) kids()?.burstConfetti?.(svg, 40);
        sag(`${st.tier.n} ist überglücklich! Alle Sterne!`);
      }, 1400);
    }
    zeichneZimmerKopf();
  }

  // ---------------------------------------------------------------------------
  // Die Tier-Tafel
  // ---------------------------------------------------------------------------
  function oeffneTafel(hausId, index) {
    const st = S().stock(hausId, index);
    if (!st?.tier) return;
    ui.tafel = { hausId, index, gespraech: [] };
    if (!els.tafel) {
      els.tafel = el("div", "bau-tafel", { role: "dialog", "aria-modal": "true" });
      els.tafel.addEventListener("click", (e) => { if (e.target === els.tafel) schliesseTafel(); });
      ui.host.append(els.tafel);
    }
    els.tafel.hidden = false;
    fuelleTafel();
    const laune = S().laune(hausId, index);
    sag(`${st.tier.n}, ${K().TIERE[st.tier.a].der}. ${laune.text}`);
    hilfe(`Hier siehst du, was sich ${st.tier.n} wünscht. Gelbe Sterne sind Wünsche für das Zimmer, grüne für das Haus, blaue für ein anderes Haus. Tippe auf einen Wunsch, und er wird vorgelesen. Unten kannst du mit ${st.tier.n} plaudern.`);
  }

  function schliesseTafel() {
    ui.tafel = null;
    if (els.tafel) els.tafel.hidden = true;
    if (ui.zimmer >= 0) hilfeZimmer(); else hilfeHaus();
  }

  function fuelleTafel() {
    if (!ui.tafel || !els.tafel) return;
    const { hausId, index } = ui.tafel;
    const st = S().stock(hausId, index);
    if (!st?.tier) { schliesseTafel(); return; }
    const katalog = K();
    const art = katalog.TIERE[st.tier.a];
    const raum = katalog.RAEUME[st.raum];
    const laune = S().laune(hausId, index);
    const sterne = S().sterne(hausId, index);
    const wo = S().aufenthalt(hausId, index);
    const karte = el("div", "bau-tafel-karte");
    const zu = knopf("bau-tafel-zu", "Schliessen", svgVon(`<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, "0 0 24 24"), schliesseTafel);
    const kopf = el("div", "bau-tafel-kopf");
    kopf.innerHTML = `${svgVon(`<g transform="translate(40 92) scale(1.05)">${A().tier(st.tier.a)}</g>`, "0 0 80 100", "bau-tafel-tier")}` +
      `<div class="bau-tafel-wer"><h2>${st.tier.n}</h2><p>${art.der.replace(/^\w/, (c) => c.toUpperCase())} · ${hausId === "wohnhaus" ? "wohnt" : "arbeitet"} ${S().imRaum(st.raum)}</p>` +
      `<p class="bau-tafel-laune"><span aria-hidden="true">${laune.emoji}</span> ${laune.text}</p>` +
      `<p class="bau-tafel-zahl"><span class="bau-sternreihe">${sternReiheHtml(sterne)}</span> ${sterne.anzahl} von ${sterne.total}</p></div>`;
    karte.append(zu, kopf);
    if (wo) {
      const ziel = S().stock(wo.haus, wo.index);
      const zeile = el("div", "bau-tafel-unterwegs");
      zeile.innerHTML = `<span>🚶 ${st.tier.n} ist gerade ${wo.grund === "arbeit" ? "bei der Arbeit" : "unterwegs"} – ${S().imRaum(ziel.raum)} ${katalog.HAUS[wo.haus].im}.</span>`;
      zeile.append(knopf("bau-knopf-klein", `Zu ${st.tier.n} gehen`, `Hingehen →`, () => { schliesseTafel(); geheZu(wo.haus, wo.index); }));
      karte.append(zeile);
    }
    const liste = el("ul", "bau-wunschliste");
    S().wuensche(hausId, index).forEach((w) => {
      const li = el("li", `bau-wunsch is-${w.stern}${w.erfuellt ? " is-erfuellt" : ""}${w.neu ? " is-neu" : ""}`);
      const b = knopf("bau-wunsch-text", w.text, `<i class="bau-stern is-${w.stern}${w.erfuellt ? " is-voll" : ""}"></i>${svgVon(wunschBild(w, 40), "-24 -24 48 48", "bau-wunsch-bild")}<span>${w.kurz}</span>${w.neu ? `<em>neu</em>` : ""}`, () => sag(w.erfuellt ? `${w.text} Das hast du schon erfüllt!` : w.text));
      li.append(b);
      if (!w.erfuellt) li.append(knopf("bau-zeig", "Zeig mir, wie", "→", () => zeigeWunsch(hausId, index, w)));
      else li.append(el("span", "bau-haken", { "aria-hidden": "true", text: "✓" }));
      liste.append(li);
    });
    const legende = el("p", "bau-legende");
    legende.innerHTML = `<i class="bau-stern is-gelb is-voll"></i> Zimmer <i class="bau-stern is-gruen is-voll"></i> ${katalog.HAUS[hausId].name} <i class="bau-stern is-blau is-voll"></i> andere Häuser`;
    const plaudern = el("div", "bau-plaudern");
    const verlauf = el("div", "bau-verlauf", { "aria-live": "polite" });
    (ui.tafel.gespraech || []).slice(-4).forEach((z) => {
      verlauf.append(el("p", "bau-sagt is-kind", { text: z.frage }));
      verlauf.append(el("p", "bau-sagt is-tier", { text: z.antwort }));
    });
    const fragen = el("div", "bau-fragen");
    katalog.PLAUDERN.forEach((f) => {
      fragen.append(knopf("bau-frage", f.text, `<span aria-hidden="true">${f.emoji}</span><span class="bau-frage-text">${f.text}</span>`, () => frage(f)));
    });
    plaudern.append(verlauf, fragen);
    const weg = knopf("bau-hinaus", `${st.tier.n} ausziehen lassen`, `🧳 Ausziehen lassen`, () => frageAuszug(st.tier));
    karte.append(liste, legende, plaudern, weg);
    els.tafel.innerHTML = "";
    els.tafel.append(karte);
    verlauf.scrollTop = verlauf.scrollHeight;
  }

  function frage(f) {
    if (!ui.tafel) return;
    const { hausId, index } = ui.tafel;
    const antwort = S().antwort(hausId, index, f.id);
    ui.tafel.gespraech.push({ frage: `${f.emoji} ${f.text}`, antwort });
    fuelleTafel();
    sag(antwort);
    if (f.id === "lied") klang("win");
    for (const t of tiere.values()) {
      if (t.hausId === hausId && t.index === index) { t.huepf = 1; wecke(); }
    }
  }

  function frageAuszug(tier) {
    if (!ui.tafel) return;
    const { hausId, index } = ui.tafel;
    const karte = els.tafel.querySelector(".bau-tafel-karte");
    const frageEl = el("div", "bau-frage-auszug", { role: "alertdialog" });
    frageEl.innerHTML = `<p>Soll ${tier.n} wirklich ausziehen? Dann kommt bald ein neues Tier.</p>`;
    const ja = knopf("bau-knopf-klein is-ja", "Ja, ausziehen", "Ja", () => {
      const name = tier.n;
      S().hinausschicken(hausId, index);
      sag(`Tschüss, ${name}! Bald zieht jemand Neues ein.`);
      schliesseTafel();
      if (ui.zimmer >= 0) zeichneZimmer(); else zeichneHaus({ behalteKamera: true });
    });
    const nein = knopf("bau-knopf-klein", "Nein, bleiben", "Nein", () => { frageEl.remove(); sag(`${tier.n} bleibt.`); });
    frageEl.append(ja, nein);
    karte.append(frageEl);
    sag(`Soll ${tier.n} wirklich ausziehen? Dann kommt bald ein neues Tier.`);
  }

  // "Zeig mir": zum Ding in der Schublade, zur Wandfarbe oder zum Haus, in
  // dem das gewünschte Zimmer fehlt.
  async function zeigeWunsch(hausId, index, w) {
    schliesseTafel();
    sag(w.text);
    if (w.typ === "ding" || w.typ === "farbe") {
      if (ui.haus !== hausId) await zeigeHaus(hausId, 1, { stockwerk: index, ohneSprache: true });
      if (ui.zimmer !== index) {
        if (ui.zimmer >= 0) await schliesseZimmer(true);
        await oeffneZimmer(index);
      }
      if (w.typ === "farbe") {
        ui.schublade = "wand";
        zeichneSchublade();
        const knopfEl = els.schublade.querySelector(`.bau-farbe[aria-label="${K().FARBE[w.farbe]?.name}"]`);
        knopfEl?.scrollIntoView?.({ block: "nearest", inline: "center" });
        stupse(knopfEl);
        return;
      }
      ui.schublade = M().DINGE[w.zeige]?.kat || "passt";
      zeichneSchublade();
      const knopfEl = els.schublade.querySelector(`[data-ding="${w.zeige}"]`);
      knopfEl?.scrollIntoView?.({ block: "nearest", inline: "center" });
      stupse(knopfEl);
      return;
    }
    // Ein Zimmer im eigenen oder in einem anderen Haus.
    const ziel = w.haus;
    if (ui.zimmer >= 0) await schliesseZimmer(true);
    if (ui.haus !== ziel) await zeigeHaus(ziel, 1, { ohneSprache: true });
    const roh = aktHaus().stock.findIndex((s) => !s.raum);
    if (roh >= 0) {
      kameraAuf(roh);
      const raum = K().RAEUME[w.raum];
      sag(`Hier ist noch Platz. Tippe auf das Plus im Stockwerk und wähle ${raum?.der || "das Zimmer"}.`);
      stupse(els.welt.querySelector(`.bau-stock[data-stock="${roh}"]`));
    } else {
      const kann = S().kannBauen(ziel);
      kameraAuf(aktHaus().stock.length - 1);
      sag(kann.ok ? "Tippe auf das grüne Plus, dann baust du ein neues Stockwerk dafür." : "Dafür brauchst du ein neues Stockwerk. Löse ein Rätsel, dann bringt der Zug die Ziegel!");
      stupse(kann.ok ? els.welt.querySelector("[data-ziel='plus']") : els.raetsel);
    }
  }

  // Zu einem Tier, das unterwegs ist: ins andere Haus, zum Stockwerk.
  async function geheZu(hausId, index) {
    if (ui.zimmer >= 0) await schliesseZimmer(true);
    if (ui.haus !== hausId) await zeigeHaus(hausId, 1, { stockwerk: index, ohneSprache: true });
    else kameraAuf(index);
    const raum = K().RAEUME[S().stock(hausId, index)?.raum];
    if (raum) sag(`${raum.der} ${K().HAUS[hausId].im}.`);
  }

  // ---------------------------------------------------------------------------
  // Wählen: das erste Haus, die Zimmerart, die Fassade
  // ---------------------------------------------------------------------------
  function oeffneOverlay(cls, titel) {
    schliesseOverlay();
    const wahl = el("div", `bau-wahl ${cls}`, { role: "dialog", "aria-modal": "true", "aria-label": titel });
    const karte = el("div", "bau-wahl-karte");
    const kopf = el("div", "bau-wahl-kopf");
    kopf.append(el("h2", "", { text: titel }));
    karte.append(kopf);
    wahl.append(karte);
    ui.host.append(wahl);
    ui.overlay = wahl;
    return { wahl, karte, kopf };
  }
  function schliesseOverlay() {
    ui.overlay?.remove();
    ui.overlay = null;
  }

  // Ganz am Anfang: Welches Haus zuerst?
  function zeigeHauswahl() {
    const { karte } = oeffneOverlay("is-hauswahl", "Welches Haus baust du zuerst?");
    let gewaehlt = "";
    const raster = el("div", "bau-wahl-raster");
    const fort = S().fortschritt();
    S().HAUS_IDS.forEach((id) => {
      const haus = K().HAUS[id];
      const f = { ...fort.find((x) => x.id === id), stockwerke: 3, eingerichtet: 2 };
      const b = knopf("bau-wahl-feld", haus.name, `${svgVon(`<g transform="translate(14 ${A().minihausHoehe(f) - 2})">${A().minihaus(id, f, { breite: 72 })}</g>`, `0 0 100 ${A().minihausHoehe(f)}`, "bau-wahl-bild")}<span>${haus.name}</span>`, () => {
        gewaehlt = id;
        raster.querySelectorAll(".bau-wahl-feld").forEach((x) => x.classList.toggle("is-aktiv", x === b));
        ok.disabled = false;
        sag(`${haus.der}. ${haus.text}`);
      });
      raster.append(b);
    });
    const ok = knopf("bau-ok", "Hier baue ich", "Hier baue ich! ✓", () => {
      if (!gewaehlt) return;
      S().setzeGewaehlt(gewaehlt);
      schliesseOverlay();
      if (gewaehlt !== ui.haus) zeigeHaus(gewaehlt, 1);
      else { sag(`${K().HAUS[gewaehlt].der}! Tippe auf das Stockwerk und wähle, was es werden soll.`); }
      window.setTimeout(pruefeLieferung, 700);
    });
    ok.disabled = true;
    karte.append(raster, ok);
    sag("Willkommen in der Bauecke! Welches Haus baust du zuerst? Tippe auf ein Haus.");
  }

  // Die Zimmerart: Karten mit Bild und Namen; ein Tipp liest vor, was dort
  // geschieht, der Haken wählt.
  function zeigeRaumwahl(index) {
    const st = S().stock(ui.haus, index);
    if (!st) return;
    const haus = K().HAUS[ui.haus];
    const { karte } = oeffneOverlay("is-raumwahl", st.raum ? "Was soll dieses Zimmer werden?" : `Was wird das neue Stockwerk ${haus.im}?`);
    let gewaehlt = st.raum || "";
    const raster = el("div", "bau-wahl-raster is-zimmer");
    const vorhanden = new Set(aktHaus().stock.map((s) => s.raum).filter(Boolean));
    haus.raeume.forEach((raumId) => {
      const raum = K().RAEUME[raumId];
      const b = knopf(`bau-wahl-feld${gewaehlt === raumId ? " is-aktiv" : ""}`, raum.name,
        `${svgVon(dingBild(raum.icon, 56), "-34 -34 68 68", "bau-wahl-bild")}<span>${raum.name}</span>${vorhanden.has(raumId) ? `<i class="bau-schon" title="gibt es schon">✓</i>` : ""}`, () => {
          gewaehlt = raumId;
          raster.querySelectorAll(".bau-wahl-feld").forEach((x) => x.classList.toggle("is-aktiv", x === b));
          ok.disabled = false;
          beschrieb.textContent = raum.text;
          sag(`${raum.der}. ${raum.text}`);
        });
      raster.append(b);
    });
    const beschrieb = el("p", "bau-wahl-text", { text: gewaehlt ? K().RAEUME[gewaehlt].text : "Tippe auf ein Zimmer, dann hörst du, was dort geschieht." });
    const ok = knopf("bau-ok", "Das nehme ich", "Das nehme ich! ✓", async () => {
      if (!gewaehlt) return;
      const neu = !st.raum;
      const gleich = st.raum === gewaehlt;
      schliesseOverlay();
      if (!gleich) S().waehleRaum(ui.haus, index, gewaehlt);
      const raum = K().RAEUME[gewaehlt];
      if (ui.zimmer === index) {
        merkeErfuellt();
        zeichneZimmer();
        sag(`Das ist jetzt ${raum.der}.`);
        return;
      }
      zeichneHaus({ stockwerk: index });
      klang("correct");
      if (neu) {
        const tier = S().stock(ui.haus, index)?.tier;
        sag(`${raum.der}! ${tier ? `${tier.n}, ${K().TIERE[tier.a].der}, zieht ein.` : ""}`);
      }
      await warte(500);
      oeffneZimmer(index);
    });
    ok.disabled = !gewaehlt;
    const ab = knopf("bau-abbrechen", "Abbrechen", "Abbrechen", () => { schliesseOverlay(); sag("Abgebrochen."); });
    const unten = el("div", "bau-wahl-unten");
    unten.append(ab, ok);
    karte.append(raster, beschrieb, unten);
    sag(st.raum ? "Was soll dieses Zimmer werden?" : `Was wird das neue Stockwerk? Tippe auf ein Zimmer.`);
  }

  // Das Haus anmalen: Fassade und Dach.
  function zeigeFassadenwahl() {
    const haus = aktHaus();
    const { karte } = oeffneOverlay("is-fassade", `${K().HAUS[ui.haus].name} anmalen`);
    const zeile = (titel, feld) => {
      const box = el("div", "bau-fassade-zeile");
      box.append(el("h3", "", { text: titel }));
      const farben = el("div", "bau-farbreihe");
      K().FARBEN.forEach((farbe) => {
        farben.append(farbKnopf(farbe, haus[feld] === farbe.id, () => {
          S().aendereHaus(ui.haus, (h) => { h[feld] = farbe.id; });
          sag(`${titel}: ${farbe.name}`);
          farben.querySelectorAll(".bau-farbe").forEach((x) => x.classList.toggle("is-aktiv", x.getAttribute("aria-label") === farbe.name));
          zeichneHaus({ behalteKamera: true });
          baueUmschalter();
        }));
      });
      box.append(farben);
      return box;
    };
    const fertig = knopf("bau-ok", "Fertig", "Fertig ✓", () => { schliesseOverlay(); sag("Schön!"); });
    karte.append(zeile("Hauswand", "fassade"), zeile("Dach", "dach"), fertig);
    sag("Welche Farbe bekommt das Haus? Oben die Hauswand, unten das Dach.");
  }

  window.LernappBau = { mount, unmount, zurueck, auffrischen, pruefeLieferung };
})();
