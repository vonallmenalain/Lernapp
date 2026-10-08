/*
 * train-bau.js – Die Bauecke: vier Häuser an einer Strasse, Stockwerk für
 * Stockwerk gebaut und Zimmer für Zimmer eingerichtet.
 * ---------------------------------------------------------------------------
 * Konzept: docs/BAUECKE-KONZEPT.md. Hier steht, was man sieht und antippt:
 *
 *   Hausansicht   ein Haus im Querschnitt, darüber der Umschalter für die vier
 *                 Häuser, rechts die Ziegel und der Rätsel-Knopf. Ziehen
 *                 schiebt das Haus hinauf und hinunter, Wischen zur Seite
 *                 wechselt das Haus. Im Wohnhaus sind die Wohnungen (ein
 *                 Zimmer, bis zu drei Tiere, die Sterntafel am Lift); alle
 *                 anderen Stockwerke haben zwei Zimmer. Ein Tipp auf ein
 *                 Zimmer zoomt hinein; im Ordnen-Modus wandern die Stockwerke.
 *   Zimmer        das Zimmer bildschirmfüllend, unten die Schublade mit den
 *                 Dingen dieses Zimmers, den Dingen für überall, Wand und
 *                 Boden. Dinge werden gezogen, fallen auf den Boden oder auf
 *                 einen Tisch, lassen sich anmalen, umdrehen, vergrössern und
 *                 wegräumen.
 *   Tier-Tafel    die Bewohner einer Wohnung: wo jedes gerade ist (mit Weg
 *                 dorthin), was es sich wünscht (gelbe, grüne, blaue Sterne),
 *                 sein Traumjob und seine Arbeit.
 *   Einzug        ein neues Tier kommt die Strasse entlang, fährt mit dem Lift
 *                 in seine Wohnung – und es gibt ein Feuerwerk.
 *
 * Ist das Vorlesen an, liest ein Tipp auf einen Text ihn vor.
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
 * Wird nach bau-moebel*.js, bau-katalog.js, bau-stand.js und bau-art.js
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
  const gross = (wort) => (wort ? wort.charAt(0).toUpperCase() + wort.slice(1) : "");
  const textSicher = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

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
    zimmer: -1,            // Stockwerk des gezoomten Zimmers, -1 = Hausansicht
    slot: 0,               // welches Zimmer des Stockwerks (0 links, 1 rechts)
    zimmerId: "",          // Kennung dieses Stockwerks – es kann wandern
    nacht: false,
    kamera: { ty: 0, tx: 0, vy: 0, min: 0, max: 0, skala: 1, welt: null },
    auswahl: null,         // Kennung des gewählten Dings im Zimmer
    schublade: "zimmer",
    rueck: [],             // Rückgängig-Schritte im Zimmer
    tafel: null,           // offene Tier-Tafel { seed }
    overlay: null,         // offene Wahl (Haus, Stockwerk, Zimmerart, Fassade)
    ordnen: false,         // Stockwerke umstellen
    besetzt: false,        // eine Animation, die keinen Tipp verträgt
    kommt: "",             // ein Tier, das gerade einzieht (noch nicht im Zimmer)
    letzterEinzug: 0,
    tickUhr: 0,
    abmelden: null,
  };
  const els = {};
  // Seit wann eine Bewegung keinen Tipp verträgt (siehe zurueck()).
  let besetztSeit = 0;
  function besetze() { ui.besetzt = true; besetztSeit = performance.now(); }

  function stand() { return S().lesen(); }
  function aktHaus() { return S().haus(ui.haus); }
  function aktStock() { return S().stock(ui.haus, ui.zimmer); }
  function aktZimmer() { return S().zimmer(ui.haus, ui.zimmer, ui.slot); }
  function zimmerBreite() { return S().breiteVon(aktStock()); }
  // Wie hoch das offene Zimmer ist und wo seine Wand oben endet (der
  // KiddyDome reicht ein Stockwerk höher).
  function zimmerHoehe() { return S().hoeheVon(aktStock()); }
  function zimmerOben() { return S().obenVon(aktStock()); }

  // ---------------------------------------------------------------------------
  // Einbau in die Bühne
  // ---------------------------------------------------------------------------
  function mount({ host, stage = null, onPlay = null } = {}) {
    unmount();
    ui.host = host;
    ui.stage = stage;
    ui.onPlay = onPlay;
    ui.zimmer = -1;
    ui.slot = 0;
    ui.tafel = null;
    ui.uebersicht = false;
    ui.overlay = null;
    ui.ordnen = false;
    ui.besetzt = false;
    ui.kommt = "";
    try { ui.nacht = localStorage.getItem("lernapp.bau.nacht") === "1"; } catch { ui.nacht = false; }
    const gewaehlt = stand().gewaehlt;
    ui.haus = S().HAUS_IDS.includes(gewaehlt) ? gewaehlt : (zuletztHaus() || "wohnhaus");

    host.classList.add("bauecke");
    host.classList.toggle("is-nacht", ui.nacht);
    host.innerHTML = "";
    if (S().neuereFassung?.()) { zeigeNeuereFassung(); return; }

    els.himmel = el("div", "bau-himmel");
    els.himmel.innerHTML = `<div class="bau-sonne"></div><div class="bau-mond"></div><div class="bau-wolke w1"></div><div class="bau-wolke w2"></div>`;
    els.welt = el("div", "bau-welt");
    els.nachbarL = el("button", "bau-nachbar is-links", { type: "button" });
    els.nachbarR = el("button", "bau-nachbar is-rechts", { type: "button" });
    els.nachbarL.addEventListener("click", () => wechsleHaus(-1));
    els.nachbarR.addEventListener("click", () => wechsleHaus(1));
    els.umschalter = el("nav", "bau-umschalter", { "aria-label": "Die vier Häuser" });
    els.hud = el("div", "bau-hud");
    // Links: alle Bewohner auf einen Blick – im Haus und beim Einrichten.
    els.bewohner = knopf("bau-bewohnerknopf", "Alle Bewohner", "", () => oeffneUebersicht());
    els.zimmer = el("div", "bau-zimmeransicht");
    els.zimmer.hidden = true;
    els.flug = el("div", "bau-flug");
    host.append(els.himmel, els.welt, els.nachbarL, els.nachbarR, els.umschalter, els.hud, els.bewohner, els.zimmer, els.flug);
    // Die Verläufe der Tiere (bau-tiere.js): einmal für alle Bilder der Bauecke.
    const tierDefs = window.LernappBauTiere?.defs?.() || "";
    if (tierDefs) host.append(el("div", "bau-tierdefs", { "aria-hidden": "true", html: `<svg xmlns="${NS}" width="0" height="0" focusable="false"><defs>${tierDefs}</defs></svg>` }));
    els.tafel = null;
    els.uebersicht = null;

    baueUmschalter();
    baueHud();
    baueZimmerRahmen();
    zeichneHaus();
    weltEreignisse();
    host.addEventListener("click", liesText);

    // Wer sich ändert, zeichnet nach: die Cloud, neue Ziegel, ein Tier.
    ui.traumBekannt = traumStand();
    ui.alleBekannt = alleStand();
    ui.abmelden = S().onChange((grund) => {
      if (!ui.host?.isConnected) return;
      if (grund === "neuer" || grund === "konto") { mount({ host: ui.host, stage: ui.stage, onPlay: ui.onPlay }); return; }
      if (grund !== "ziegel") pruefeAlleSterne();
      if (grund !== "zimmer" && grund !== "ziegel") pruefeTraumjobs();
      if (grund === "zimmer") { aktualisiereSterne(); return; }
      if (grund === "ziegel") { aktualisiereHud(); pruefeLieferung(); return; }
      if (grund === "cloud" || grund === "tier" || grund === "wunsch") { auffrischen(); }
    });
    window.addEventListener("resize", beiGroesse);
    planeLifte();
    ui.tickUhr = window.setInterval(zeitTick, 4000);
    zeitTick();
    hilfeHaus();

    if (!gewaehlt) zeigeHauswahl();
    else pruefeLieferung();
  }

  // Ein anderes Gerät hat die Bauecke schon mit einer neueren Fassung der App
  // gespeichert. Diese hier zeigt dann nichts an, statt zu löschen, was sie
  // nicht kennt (bau-stand.js, FORMAT) – bis die neue Fassung geladen ist.
  // Das tut pwa.js gleich von selbst; der Knopf ist für den, der nicht warten mag.
  function zeigeNeuereFassung() {
    const box = el("div", "bau-neuer", { role: "status" });
    box.append(
      el("p", "", { text: "Die Bauecke wird gerade erneuert. Einen Moment!" }),
      knopf("bau-neuer-knopf", "Neu laden", `${svgVon(`<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`, "0 0 24 24")}<span>Neu laden</span>`, () => window.location.reload()),
    );
    ui.host.append(box);
    hilfe("");
    sag("Die Bauecke wird gerade erneuert. Einen Moment!");
  }

  function unmount() {
    window.clearTimeout(traumUhr);
    window.clearTimeout(alleUhr);
    window.clearTimeout(liftUhr);
    if (ui.tickUhr) window.clearInterval(ui.tickUhr);
    ui.tickUhr = 0;
    ui.abmelden?.();
    ui.abmelden = null;
    window.removeEventListener("resize", beiGroesse);
    ui.host?.removeEventListener("click", liesText);
    tweens.clear();
    jedesBild.clear();
    tiere.clear();
    if (tierUhr) window.clearTimeout(tierUhr);
    tierUhr = 0;
    // Eine Lieferung oder ein Einzug, mitten im Flug verlassen, kommt nicht
    // mehr an (die Bewegungen sind eben gelöscht) – die nächste darf trotzdem.
    liefert = false;
    ui.kommt = "";
    if (ui.host) ui.host.classList.remove("bauecke", "is-nacht", "ist-zimmer", "ist-ordnen", "kann-lesen");
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
    if (ui.tafel) { schliesseTafel({ zurueck: true }); return true; }
    if (ui.uebersicht) { schliesseUebersicht(); return true; }
    if (ui.zimmer >= 0) { schliesseZimmer(); return true; }
    if (ui.ordnen) { schalteOrdnen(false); return true; }
    S().speichern(true);
    return false;
  }

  // Von aussen neu zeichnen (die Cloud, ein anderes Gerät, die Bühne). Nur
  // wenn sich am Haus wirklich etwas geändert hat, und nie mitten in einer
  // Bewegung: Die Bühne ruft das nach dem Laden mehrmals auf.
  function auffrischen() {
    if (!ui.host?.isConnected || !els.umschalter) return;
    folgeStockwerk();
    aktualisiereHud();
    baueUmschalter();
    if (ui.besetzt || zieht) return;
    const jetzt = zeichenStand();
    if (jetzt === ui.gezeichnet) { if (ui.tafel) fuelleTafel(); if (ui.uebersicht) fuelleUebersicht(); return; }
    if (ui.zimmer >= 0) {
      if (!aktZimmer()?.raum) { schliesseZimmer(true); return; }
      zeichneZimmer();
    } else zeichneHaus({ behalteKamera: true });
    if (ui.tafel) fuelleTafel();
    if (ui.uebersicht) fuelleUebersicht();
  }
  let zieht = false;
  // Kommt aus der Cloud ein Stockwerk dazu oder stellt das Kind sie um, kann
  // sich die Reihenfolge verschieben: Das offene Zimmer folgt seinem Stockwerk.
  function folgeStockwerk() {
    if (ui.zimmer < 0 || !ui.zimmerId) return;
    const i = S().indexVon(ui.haus, ui.zimmerId);
    if (i >= 0) ui.zimmer = i;
  }
  // Was ein Neuzeichnen nötig macht: das Haus selbst, und ob das Plus gerade
  // baut oder vor der Schranke steht (ein Kauf, frische Ziegel).
  function zeichenStand() { return `${JSON.stringify(aktHaus())}|${S().kannBauen(ui.haus).grund}|${ui.ordnen}`; }

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

  // Vorlesen per Tipp: Ist das Vorlesen an, liest ein Tipp auf einen Text ihn
  // vor – auf der Tafel, in den Wahl-Fenstern, im Zimmerkopf. Knöpfe sprechen
  // selbst, die bleiben hier aussen vor.
  function liesText(e) {
    if (!kannLesen()) return;
    const ziel = e.target.closest?.(".bau-lies, .bau-tafel p, .bau-tafel h2, .bau-tafel h3, .bau-uebersicht h2, .bau-uebersicht h3, .bau-uebersicht p, .bau-wahl h2, .bau-wahl p, .bau-wahl h3");
    if (!ziel || e.target.closest("button")) return;
    sag(ziel.dataset.lies || ziel.textContent.trim());
    // Kurz hervorheben, was gerade vorgelesen wird.
    ziel.classList.add("is-liest");
    window.setTimeout(() => ziel.classList.remove("is-liest"), 1400);
  }
  function kannLesen() { return Boolean(kids()?.ttsEnabled?.()); }

  // ---------------------------------------------------------------------------
  // Was die Zeit tut: Wünsche wechseln, Tiere ziehen ein
  // ---------------------------------------------------------------------------
  function zeitTick() {
    if (!ui.host?.isConnected) return;
    ui.host.classList.toggle("kann-lesen", kannLesen());
    S().tick().forEach((e) => {
      if (e.typ === "neuerWunsch") blaseAnSeed(e.seed, "Ich habe einen neuen Wunsch! ⭐", 3600);
    });
    pruefeZuzug();
  }

  // Ein neues Tier zieht ein – aber nur, wenn das Kind es sieht: im Wohnhaus,
  // in der Hausansicht, mit nichts anderem offen. Sonst zeigt der Umschalter,
  // dass im Wohnhaus jemand wartet.
  function pruefeZuzug() {
    const fall = S().zuzugFaellig();
    const tab = els.umschalter?.querySelector(`.bau-tab[data-haus="wohnhaus"]`);
    tab?.classList.toggle("hat-neues", Boolean(fall) && ui.haus !== "wohnhaus");
    if (!fall) return;
    if (ui.haus !== "wohnhaus" || ui.zimmer >= 0 || ui.overlay || ui.tafel || ui.uebersicht || ui.besetzt || ui.ordnen || liefert) return;
    if (performance.now() - ui.letzterEinzug < 30000 && ui.letzterEinzug) return;
    const tier = S().ziehtEin(fall.hausId, fall.index);
    if (tier) zeigeEinzug(fall.index, tier);
  }

  // Wer gerade seinen Traumjob hat (je Tier: ja oder nein).
  function traumStand() {
    return new Map(S().alleTiere().map((e) => [e.tier.seed, S().hatTraumjob(e.tier.seed)]));
  }

  // Bekommt ein Tier seinen Traumjob (weil das Zimmer jetzt gebaut ist oder
  // dort Platz wurde), wird gefeiert: ein Klang, Konfetti oder Feuerwerk,
  // und das Tier sagt es. Wer eben erst einzieht, zählt nicht – den Einzug
  // sagt die Ansicht selbst an.
  let traumUhr = 0;
  function pruefeTraumjobs() {
    window.clearTimeout(traumUhr);
    traumUhr = window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      const vorher = ui.traumBekannt || new Map();
      const jetzt = traumStand();
      ui.traumBekannt = jetzt;
      const neu = [...jetzt].filter(([seed, hat]) => hat && vorher.has(seed) && !vorher.get(seed)).map(([seed]) => seed);
      if (neu.length) feiereTraumjob(neu);
    }, 60);
  }

  function feiereTraumjob(seeds) {
    klang("win");
    const job = S().jobVon(seeds[0]);
    const svg = els.welt?.querySelector("svg");
    if (ui.zimmer >= 0) kids()?.burstConfetti?.(els.zimmer, 40);
    else if (svg && job && job.haus === ui.haus) {
      const st = S().stock(job.haus, job.index);
      const breite = S().breiteVon(st);
      feuerwerk(svg, A().ZX + job.slot * HALB + breite / 2, A().oben(job.index) + S().obenVon(st) / 2 + 50, breite);
    }
    seeds.forEach((seed) => window.setTimeout(() => blaseAnSeed(seed, "Mein Traumjob! 🌟", 3400), 700));
    // Haben jetzt alle drei einer Wohnung ihren Traumjob, sagt die Bauecke es.
    const voll = [...new Set(seeds.map((seed) => S().findeTier(seed)).filter(Boolean).map((r) => r.index))]
      .filter((index) => { const st = S().stock("wohnhaus", index); return st?.tiere.length === 3 && S().traumjobsStock("wohnhaus", index) === 3; });
    if (voll.length) {
      const namen = S().stock("wohnhaus", voll[0]).tiere.map((t) => t.n);
      window.setTimeout(() => sag(`Juhui! ${namenListe(namen)} haben alle ihren Traumjob. Schau dir ihre Wohnung im Wohnhaus an!`), 4200);
    }
  }

  // Wer alle Sterne hat (je Tier: ja oder nein).
  function alleStand() {
    return new Map(S().alleTiere().map((e) => { const st = S().sterne(e.tier.seed); return [e.tier.seed, st.total > 0 && st.anzahl === st.total]; }));
  }

  // Bekommt ein Tier seinen letzten Stern – gleich wo der Wunsch erfüllt
  // wurde –, wird gefeiert: ein goldenes Band mit dem Tier, Konfetti oder
  // Feuerwerk, und die Bauecke sagt es. Wer eben einzieht, zählt nicht.
  let alleUhr = 0;
  function pruefeAlleSterne() {
    window.clearTimeout(alleUhr);
    alleUhr = window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      const vorher = ui.alleBekannt || new Map();
      const jetzt = alleStand();
      ui.alleBekannt = jetzt;
      const neu = [...jetzt].filter(([seed, hat]) => hat && vorher.has(seed) && !vorher.get(seed)).map(([seed]) => seed);
      if (neu.length) feiereAlleSterne(neu);
    }, 80);
  }

  function feiereAlleSterne(seeds) {
    const ref = S().findeTier(seeds[0]);
    if (!ref) return;
    const { tier } = ref;
    // Erst das Danke für den Wunsch, dann die Feier.
    window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      klang("win");
      const total = S().sterne(tier.seed).total;
      ui.host.querySelector(".bau-sternband")?.remove();
      const band = el("div", "bau-sternband", { role: "status" });
      band.innerHTML = `${tierBildchen(tier, 64, 76, "bau-sternband-tier")}` +
        `<span class="bau-sternband-text"><b>Alle Sterne!</b><span>${textSicher(tier.n)} ist überglücklich.</span></span>` +
        `<span class="bau-sternband-sterne" aria-hidden="true">${Array.from({ length: total }, (_, i) => `<i class="bau-stern bau-stern-gross bau-stern-weiss" style="animation-delay:${(0.2 + i * 0.12).toFixed(2)}s"></i>`).join("")}</span>`;
      ui.host.append(band);
      window.setTimeout(() => band.classList.add("is-weg"), 3800);
      window.setTimeout(() => band.remove(), 4400);
      if (ui.zimmer >= 0) kids()?.burstConfetti?.(els.zimmer, 60);
      else if (ref.hausId === ui.haus) {
        const svg = els.welt?.querySelector("svg");
        const st = S().stock(ref.hausId, ref.index);
        if (svg && st) feuerwerk(svg, A().ZX + S().breiteVon(st) / 2, A().oben(ref.index) + 50, S().breiteVon(st));
      }
      for (const t of tiere.values()) if (seeds.includes(t.tier.seed)) { t.huepf = 1; wecke(); }
      sag(`Juhui! ${tier.n} hat alle Sterne! ${tier.n} ist überglücklich.`);
    }, ui.zimmer >= 0 ? 1300 : 300);
  }

  // ---------------------------------------------------------------------------
  // Hilfe-Texte
  // ---------------------------------------------------------------------------
  function hilfeHaus() {
    const haus = K().HAUS[ui.haus];
    const wohnen = ui.haus === "wohnhaus" ? " In den Wohnungen wohnen die Tiere; tippe auf die Sterne am Lift, und du siehst, was sie sich wünschen." : "";
    hilfe(`Das ist ${haus.der}. Tippe auf ein Zimmer, um es einzurichten.${wohnen} Für ein neues Stockwerk brauchst du Ziegel: Tippe auf den Rätsel-Knopf. Mit dem Pfeil-Knopf stellst du die Stockwerke um. Oben wechselst du zwischen den vier Häusern. Der Bewohner-Knopf links zeigt dir alle Tiere auf einen Blick.`);
  }
  function hilfeZimmer() {
    hilfe("Zieh Dinge aus der Schublade ins Zimmer, oder tippe sie an. Tippe auf ein Ding im Zimmer, um es anzumalen, umzudrehen, grösser oder kleiner zu machen. Mit dem Pinsel malst du die Wand an, mit dem Boden-Knopf den Boden. Mit dem Stift änderst du, was für ein Zimmer es ist. Der Bewohner-Knopf links zeigt dir alle Tiere und was ihnen noch fehlt.");
  }

  // ---------------------------------------------------------------------------
  // Der Umschalter: vier Häuser, immer erreichbar
  // ---------------------------------------------------------------------------
  function baueUmschalter() {
    if (!els.umschalter) return;
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
    if (ui.uebersicht) schliesseUebersicht({ weiter: true });
    if (ui.ordnen) schalteOrdnen(false, { stumm: true });
    besetze();
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
    pruefeZuzug();
  }

  // ---------------------------------------------------------------------------
  // Rechts: Ziegel, Rätsel, Ordnen, Tag und Nacht, Fassade
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
    els.ordnenKnopf = knopf("bau-rund bau-ordnenknopf", "Stockwerke umstellen", svgVon(`<path d="M8 4v16M8 4 4.5 7.5M8 4l3.5 3.5M16 20V4M16 20l-3.5-3.5M16 20l3.5-3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`, "0 0 24 24"), () => schalteOrdnen(!ui.ordnen));
    els.nachtKnopf = knopf("bau-rund bau-nachtknopf", "Tag oder Nacht", "", schalteNacht);
    els.fassade = knopf("bau-rund bau-fassadeknopf", "Das Haus anmalen", svgVon(`<rect x="4" y="3" width="14" height="7" rx="2" fill="#ff7aa2"/><path d="M18 6h2v6h-9v3" fill="none" stroke="#4a5568" stroke-width="2"/><rect x="9" y="15" width="4" height="7" rx="1.5" fill="#4a5568"/>`, "0 0 24 24"), zeigeFassadenwahl);
    els.hud.append(els.ziegel, els.raetsel, els.ordnenKnopf, els.nachtKnopf, els.fassade);
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
    els.ordnenKnopf.classList.toggle("is-an", ui.ordnen);
    els.ordnenKnopf.setAttribute("aria-label", ui.ordnen ? "Fertig umgestellt" : "Stockwerke umstellen");
    const plus = els.welt?.querySelector("[data-ziel='plus']");
    if (plus) plus.classList.toggle("is-bereit", S().kannBauen(ui.haus).ok);
    aktualisiereBewohnerKnopf();
  }

  // Der Bewohner-Knopf zeigt, wie viele Tiere im Wohnhaus wohnen.
  function aktualisiereBewohnerKnopf() {
    if (!els.bewohner) return;
    const n = S().alleTiere().length;
    const label = n ? `Alle Bewohner: ${n === 1 ? "ein Tier" : `${n} Tiere`}` : "Alle Bewohner";
    els.bewohner.innerHTML = `${svgVon(PFOTE, "0 0 32 32", "bau-bewohnerknopf-bild")}<span>Bewohner</span>${n ? `<b class="bau-bewohnerknopf-zahl">${n}</b>` : ""}`;
    els.bewohner.setAttribute("aria-label", label);
    els.bewohner.title = label;
  }
  const KREUZ = `<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`;
  const PFEIL_ZURUECK = `<path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  const PFOTE = `<ellipse cx="16" cy="21.6" rx="7.6" ry="6.4" fill="#ffffff"/>` +
    `<ellipse cx="7.4" cy="13.4" rx="3" ry="3.8" transform="rotate(-22 7.4 13.4)" fill="#ffffff"/>` +
    `<ellipse cx="12.6" cy="8.2" rx="3" ry="3.9" transform="rotate(-7 12.6 8.2)" fill="#ffffff"/>` +
    `<ellipse cx="19.4" cy="8.2" rx="3" ry="3.9" transform="rotate(7 19.4 8.2)" fill="#ffffff"/>` +
    `<ellipse cx="24.6" cy="13.4" rx="3" ry="3.8" transform="rotate(22 24.6 13.4)" fill="#ffffff"/>`;

  function schalteNacht() {
    ui.nacht = !ui.nacht;
    try { localStorage.setItem("lernapp.bau.nacht", ui.nacht ? "1" : "0"); } catch { /* privater Modus */ }
    ui.host.classList.toggle("is-nacht", ui.nacht);
    aktualisiereHud();
    sag(ui.nacht ? "Es ist Nacht. Gute Nacht!" : "Es ist Tag. Guten Morgen!");
    if (ui.zimmer >= 0) zeichneZimmer(); else zeichneHaus({ behalteKamera: true });
  }

  // Stockwerke umstellen: An jedem Stockwerk erscheinen Pfeile nach oben und
  // unten – so kommt der Eingang nach unten.
  function schalteOrdnen(an, { stumm = false } = {}) {
    if (ui.zimmer >= 0 && an) return;
    ui.ordnen = an;
    ui.host.classList.toggle("ist-ordnen", an);
    aktualisiereHud();
    zeichneHaus({ behalteKamera: true });
    if (stumm) return;
    if (an) {
      sag("Mit den Pfeilen stellst du die Stockwerke um. Fertig? Dann tippe noch einmal auf den Pfeil-Knopf.");
      hilfe("Tippe auf einen Pfeil, und das Stockwerk tauscht den Platz mit dem darüber oder darunter. Fertig? Tippe noch einmal auf den Pfeil-Knopf.");
    } else {
      sag("Fertig umgestellt.");
      hilfeHaus();
    }
  }

  async function verschiebeStock(index, richtung) {
    if (ui.besetzt) return;
    const vorher = aktHaus().stock.map((s) => s.id);
    const j = S().verschiebe(ui.haus, index, richtung);
    if (j === index) return;
    klang("correct");
    zeichneHaus({ behalteKamera: true });
    // Jedes Stockwerk, das den Platz gewechselt hat, gleitet an seinen neuen
    // (bei einem KiddyDome sind es mehrere).
    if (!reduced()) {
      const wege = aktHaus().stock.map((s, neu) => ({ neu, alt: vorher.indexOf(s.id) })).filter((w) => w.alt >= 0 && w.alt !== w.neu);
      await Promise.all(wege.map(({ neu, alt }) => {
        const node = els.welt.querySelector(`.bau-stockreihe[data-stock="${neu}"]`);
        if (!node) return null;
        const dy = A().oben(alt) - A().oben(neu);
        node.setAttribute("transform", `translate(0 ${dy})`);
        return tweenP(320, (p) => node.setAttribute("transform", `translate(0 ${dy * (1 - p)})`), { e: ease.out }).then(() => node.removeAttribute("transform"));
      }));
    }
    const st = S().stock(ui.haus, j);
    sag(stockName(st, j));
  }

  // Wie ein Stockwerk heisst: "das Erdgeschoss mit der Küche und dem Bad".
  // Ein KiddyDome nennt beide Stockwerke.
  function stockName(st, index) {
    const nummer = (i) => (i === 0 ? "das Erdgeschoss" : `der ${i}. Stock`);
    if (st?.art === "oben") return stockName(S().stock(ui.haus, index - 1), index - 1);
    const wo = S().istDoppel(st) ? `${gross(nummer(index))} und ${nummer(index + 1)}` : gross(nummer(index));
    const namen = (st?.zimmer || []).map((z) => K().RAEUME[z.raum]?.der).filter(Boolean);
    if (!namen.length) return `${wo}.`;
    return `${wo}: ${namen.join(" und ")}.`;
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
  const HALB = 280;           // ein Zimmer auf einem Stockwerk mit zwei Zimmern

  function weltOben(anzahl) { return A().oben(anzahl - 1) - A().DECKE - A().ZH - 300; }

  function kameraTransform(tx, ty) { return `translate3d(${Math.round(tx)}px, ${Math.round(ty)}px, 0)`; }

  // Wie gross das Haus steht: auf dem Tablet gut zweieinhalb Stockwerke im
  // Bild, auf dem Handy knapp zwei.
  function messeWelt() {
    const w = ui.host.clientWidth || 800;
    const h = ui.host.clientHeight || 500;
    // Auf dem Tablet passen die drei Wohnungen vom Anfang samt Strasse ins Bild.
    const sichtbar = h < 520 ? 1.75 : 3.6;
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

  // Wo ein Zimmer auf dem Bildschirm steht (für die Kamera und den Zoom).
  function zimmerAufSchirm(index, slot = 0) {
    const k = ui.kamera;
    const st = S().stock(ui.haus, index);
    const breite = S().breiteVon(st);
    const y = (A().oben(index) + S().obenVon(st) - k.y0) * k.skala + k.ty;
    const x = (A().ZX + slot * HALB - WX0) * k.skala + k.tx;
    return { x, y, w: breite * k.skala, h: S().hoeheVon(st) * k.skala };
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

  // Die Kamera so, dass dieses Stockwerk gut im Bild ist (y in Haus-Einheiten
  // statt eines Stockwerks: dorthin).
  function kameraZiel(yHaus) {
    const h = ui.host.clientHeight || 500;
    const k = ui.kamera;
    return clamp(h * 0.55 - (yHaus - k.y0) * k.skala, k.min, k.max);
  }
  function kameraAuf(index, sanft = true) {
    const k = ui.kamera;
    // Ein KiddyDome: auf seine Mitte, auch vom oberen Stockwerk aus.
    const st = S().stock(ui.haus, index);
    const unten = st?.art === "oben" ? index - 1 : index;
    const doppel = S().istDoppel(S().stock(ui.haus, unten));
    const ziel = kameraZiel(doppel ? A().oben(unten) - A().DECKE / 2 : A().oben(index) + A().ZH / 2);
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
      `<clipPath id="bau-clip-voll"><rect x="0" y="0" width="${art.ZW}" height="${art.ZH}"/></clipPath>` +
      `<clipPath id="bau-clip-halb"><rect x="0" y="0" width="${HALB}" height="${art.ZH}"/></clipPath>` +
      `<clipPath id="bau-clip-doppel"><rect x="0" y="${-art.STOCK}" width="${art.ZW}" height="${art.ZH + art.STOCK}"/></clipPath>` +
      `<radialGradient id="bau-glanz"><stop offset="0" stop-color="#fff6c2" stop-opacity="0.75"/><stop offset="1" stop-color="#fff6c2" stop-opacity="0"/></radialGradient></defs>`;
    s += `<g class="bau-hintergrund">`;
    s += art.baum(-260, 1.15) + art.baum(-120, 0.9) + art.laterne(-40) + art.baum(art.HB + 110, 1) + art.laterne(art.HB + 40) + art.baum(art.HB + 260, 1.2);
    s += `</g>`;
    s += art.strasse(WX0, WX1);
    // Die Stockwerke: je eine Reihe (die beim Umstellen wandert).
    let zimmerTeil = "";
    let liftTeil = "";
    for (let i = 0; i < anzahl; i += 1) {
      const st = haus.stock[i];
      zimmerTeil += `<g class="bau-stockreihe" data-stock="${i}">${stockMarkup(st, i)}${traumMarkup(st, i)}</g>`;
      liftTeil += `<g class="bau-lift" data-stock="${i}">${art.liftStock(i)}</g>`;
      if (st.tiere.length) liftTeil += `<g class="bau-tafelknopf" data-ziel="tafel" data-stock="${i}" role="button" tabindex="0" aria-label="Wer hier wohnt">${art.sternTafel(S().sterneStock(ui.haus, i), art.LX + art.LIFT / 2, art.oben(i) + 10)}</g>`;
    }
    s += zimmerTeil;
    // Über dem unteren Stockwerk eines KiddyDome geht keine Decke durch.
    const offen = haus.stock.map((st, i) => (S().istDoppel(st) ? i : -1)).filter((i) => i >= 0);
    s += `<g class="bau-rahmen">${art.hausRahmen(haus, anzahl, offen)}</g>`;
    for (let i = 0; i < anzahl; i += 1) if (haus.stock[i].art === "zwei") s += art.trennwand(i, haus.fassade);
    s += liftTeil;
    const dachY = art.oben(anzahl - 1) - art.DECKE;
    s += `<g class="bau-dach">${art.dach(hausInfo.dachForm, haus.dach, haus.fassade, dachY)}</g>`;
    // Die Stelle für das nächste Stockwerk, über dem Dach – nur, wenn Ziegel
    // da sind. Ohne Ziegel wäre sie ein Knopf, der nichts tut; dann zeigt der
    // Rätsel-Knopf den Weg.
    const kann = S().kannBauen(ui.haus);
    if (!ui.ordnen && (kann.ok || kann.grund === "schranke")) {
      s += `<g class="bau-naechster${kann.ok ? " is-bereit" : ""}" data-ziel="plus" role="button" tabindex="0" aria-label="Ein neues Stockwerk bauen">${art.naechsterStock(plusY())}</g>`;
    }
    if (ui.ordnen) s += ordnenMarkup(anzahl);
    s += `<g class="bau-zuglage"></g><g class="bau-einzuglage" pointer-events="none"></g>`;
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

  // Ein Stockwerk in der Hausansicht: eine Wohnung, zwei Zimmer oder der
  // Rohbau – jedes Zimmer ein eigenes Ziel zum Antippen.
  function stockMarkup(st, i) {
    const art = A();
    const y = art.oben(i);
    const feld = (slot, breite, ziel, inhalt, label, clip = breite === HALB ? "bau-clip-halb" : "bau-clip-voll") =>
      `<g class="bau-raum${ziel !== "zimmer" ? " is-rohbau" : ""}" data-ziel="${ziel}" data-stock="${i}" data-slot="${slot}" role="button" tabindex="0" aria-label="${textSicher(label)}" transform="translate(${art.ZX + slot * HALB} ${y})" clip-path="url(#${clip})">${inhalt}</g>`;
    if (st.art === "") return feld(0, art.ZW, "rohbau", art.rohbauSchale(art.ZW, "frage"), "Ein neues Stockwerk: Was soll es werden?");
    // Das obere Stockwerk eines KiddyDome: Den zeichnet das untere, über beide.
    if (st.art === "oben") return "";
    if (S().istDoppel(st)) return feld(0, art.ZW, "zimmer", zimmerInhalt(ui.haus, i, 0, { klein: true }), K().RAEUME[st.zimmer[0].raum]?.name || "Zimmer", "bau-clip-doppel");
    if (st.art === "wohnung") {
      const z = st.zimmer[0];
      if (!z.raum) return feld(0, art.ZW, "wohnungwahl", art.rohbauSchale(art.ZW, "bett"), "Eine leere Wohnung: Schlafzimmer oder Kinderzimmer?");
      return feld(0, art.ZW, "zimmer", zimmerInhalt(ui.haus, i, 0, { klein: true }), K().RAEUME[z.raum]?.name || "Zimmer");
    }
    // Spital, Dorf, Büro: ein Zimmer über das ganze Stockwerk.
    if (st.art === "eins") {
      const z = st.zimmer[0];
      if (!z.raum) return feld(0, art.ZW, "leer", art.rohbauSchale(art.ZW, "plus"), "Ein leeres Stockwerk: Was soll hier hinein?");
      return feld(0, art.ZW, "zimmer", zimmerInhalt(ui.haus, i, 0, { klein: true }), K().RAEUME[z.raum]?.name || "Zimmer");
    }
    // Wohnhaus: zwei Zimmer nebeneinander.
    return st.zimmer.map((z, slot) => (z.raum
      ? feld(slot, HALB, "zimmer", zimmerInhalt(ui.haus, i, slot, { klein: true }), K().RAEUME[z.raum]?.name || "Zimmer")
      : feld(slot, HALB, "leer", art.rohbauSchale(HALB, "plus"), "Ein leeres Zimmer: Was soll es werden?"))).join("");
  }

  // Wie viele hier ihren Traumjob haben: von aussen zu sehen, in drei Stufen
  // (bau-art.js). Ein Tipp aufs Schild öffnet die Tafel der Wohnung.
  function traumMarkup(st, i) {
    if (st.art !== "wohnung" || !st.tiere.length) return "";
    const n = S().traumjobsStock(ui.haus, i);
    if (!n) return "";
    const art = A();
    const satz = n === st.tiere.length
      ? (n === 1 ? "Wer hier wohnt, hat den Traumjob" : `Alle ${n} hier haben ihren Traumjob`)
      : `${n} von ${st.tiere.length} hier ${n === 1 ? "hat den" : "haben ihren"} Traumjob`;
    return `<g pointer-events="none">${art.traumRahmen(i, n)}</g>` +
      `<g class="bau-traummarke${n >= 3 ? " is-gold" : ""}" data-ziel="tafel" data-stock="${i}" data-stufe="${n}" role="button" tabindex="0" aria-label="${satz}">${art.traumSchild(i, n)}</g>`;
  }

  // Die Pfeile zum Umstellen, rechts am Haus. Ein KiddyDome wandert als
  // Ganzes: ein Rahmen und ein Paar Pfeile für beide Stockwerke.
  function ordnenMarkup(anzahl) {
    const art = A();
    const stock = aktHaus().stock;
    const x = art.HB + 46;
    let s = "";
    for (let i = 0; i < anzahl; i += 1) {
      const doppel = S().istDoppel(stock[i]) && stock[i + 1]?.art === "oben";
      const top = doppel ? art.oben(i + 1) : art.oben(i);
      const hoehe = art.oben(i) + art.ZH - top;
      const y = top + hoehe / 2;
      const letzter = i + (doppel ? 1 : 0);
      s += `<rect x="${art.ZX - 4}" y="${top - 4}" width="${art.ZW + 8}" height="${hoehe + 8}" rx="8" fill="none" stroke="#3fbf74" stroke-width="5" stroke-dasharray="14 10" pointer-events="none"/>`;
      const pfeil = (ziel, dy, d, label) => `<g class="bau-ordnenpfeil" data-ziel="${ziel}" data-stock="${i}" role="button" tabindex="0" aria-label="${label}"><circle cx="${x}" cy="${y + dy}" r="34" fill="#3fbf74" stroke="#ffffff" stroke-width="5"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      if (letzter < anzahl - 1) s += pfeil("hoch", -42, `M${x - 14} ${y - 36}l14-14l14 14`, "Nach oben");
      if (i > 0) s += pfeil("runter", 42, `M${x - 14} ${y + 36}l14 14l14-14`, "Nach unten");
      i = letzter;
    }
    return s;
  }

  // Ein Zimmer als SVG-Text: in der Hausansicht (klein) wie im Zoom.
  function zimmerInhalt(hausId, index, slot, { klein = false } = {}) {
    const st = S().stock(hausId, index);
    const z = st?.zimmer?.[slot];
    if (!z) return "";
    const breite = S().breiteVon(st);
    if (!z.raum) return A().rohbauSchale(breite, st.art === "wohnung" ? "bett" : "plus");
    const oben = S().obenVon(st);
    let s = A().zimmerSchale(z, `bau-muster-${hausId}-${index}-${slot}${klein ? "-k" : ""}`, breite, oben);
    s += dingeMarkup(z, z.raum);
    s += `<g class="bau-tierlage" data-tierlage="${index}:${slot}"></g>`;
    if (ui.nacht) s += nachtMarkup(z, breite, oben);
    return s;
  }

  // Die Dinge in Zeichenreihenfolge: was an der Wand hängt, zuerst; dann
  // Teppiche; dann was steht, von hinten nach vorn – und was auf einem Tisch
  // steht, gleich nach seinem Tisch.
  function reihenfolge(z) {
    const dinge = M().DINGE;
    const tiefe = new Map();
    const stehend = z.dinge.filter((d) => dinge[d.i]?.art === "boden");
    stehend.forEach((d) => tiefe.set(d.k, d.y));
    stehend.forEach((d) => {
      const traeger = traegerVon(z, d);
      if (traeger) tiefe.set(d.k, (tiefe.get(traeger.k) ?? traeger.y) + 0.01);
    });
    const rang = (d) => {
      const art = dinge[d.i]?.art;
      if (art === "wand") return 0;
      if (art === "decke") return 1;
      if (art === "flach") return 2;
      return 3;
    };
    return z.dinge.map((d, i) => ({ d, i })).sort((a, b) => {
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
    const k = M().massVon(d.i) * (d.s || 1);
    return `translate(${d.x} ${d.y}) scale(${d.f ? -k : k} ${k})`;
  }

  function dingeMarkup(z, raumId) {
    return reihenfolge(z).map((d) => {
      const farbe = d.c ? farbeHex(d.c) : null;
      return `<g class="bau-ding" data-k="${d.k}" data-i="${d.i}" transform="${dingTransform(d)}">${griffFlaeche(d.i)}${M().zeichne(d.i, farbe, raumId)}</g>`;
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
  function nachtMarkup(z, breite, oben = 0) {
    const h = A().ZH - oben;
    if (!z.licht) return `<rect x="0" y="${oben}" width="${breite}" height="${h}" fill="#0b1530" opacity="0.62" pointer-events="none"/>`;
    let s = `<rect x="0" y="${oben}" width="${breite}" height="${h}" fill="#1b2350" opacity="0.18" pointer-events="none"/>`;
    z.dinge.forEach((d) => {
      const ding = M().DINGE[d.i];
      if (!ding?.licht) return;
      const u = M().umriss(d.i, d.s);
      const cy = d.y + (u.y0 + u.y1) / 2;
      s += `<circle cx="${d.x}" cy="${cy}" r="${Math.max(60, (u.x1 - u.x0) * 0.9)}" fill="url(#bau-glanz)" pointer-events="none"/>`;
    });
    return s;
  }

  // Worauf ein kleines Ding steht – auf der Fläche eines anderen, oder null.
  function traegerVon(z, d) {
    const ding = M().DINGE[d.i];
    if (!ding?.klein) return null;
    let bester = null;
    z.dinge.forEach((u) => {
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
    const k = M().massVon(u.i) * (u.s || 1);
    let [a, b] = ding.fx;
    if (u.f) [a, b] = [-b, -a];
    return { y: u.y + ding.flaeche * k, x0: u.x + a * k, x1: u.x + b * k };
  }

  // --- Sterne nachführen, ohne das ganze Haus neu zu bauen ------------------
  function aktualisiereSterne() {
    baueUmschalter();
    if (ui.zimmer >= 0) zeichneZimmerKopf();
    if (ui.tafel) fuelleTafel();
    if (ui.uebersicht) fuelleUebersicht();
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
    const slot = Number(ziel.getAttribute("data-slot")) || 0;
    if (art === "hoch" || art === "runter") { verschiebeStock(index, art === "hoch" ? 1 : -1); return; }
    if (ui.ordnen) { sag(stockName(S().stock(ui.haus, index), index)); return; }
    if (art === "plus") { neuesStockwerk(); return; }
    if (art === "tafel") { oeffneTafelStock(ui.haus, index); return; }
    if (art === "tier") { oeffneTafel(ziel.getAttribute("data-seed")); return; }
    if (art === "rohbau") { zeigeArtwahl(index); return; }
    if (art === "wohnungwahl") { zeigeWohnungswahl(index); return; }
    if (art === "leer") { zeigeRaumwahl(index, slot); return; }
    if (art === "zimmer") oeffneZimmer(index, slot);
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
    besetze();
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
    const stockEl = svg?.querySelector(`.bau-stockreihe[data-stock="${index}"]`);
    const unten = A().unten(index);
    if (plusEl) plusEl.style.opacity = "0";
    if (stockEl && !reduced()) {
      const y = A().oben(index);
      const wachse = (p) => `translate(0 ${y + A().ZH}) scale(1 ${Math.max(0.001, p)}) translate(0 ${-(y + A().ZH)})`;
      stockEl.setAttribute("transform", wachse(0));
      if (dachEl) dachEl.setAttribute("transform", `translate(0 ${A().STOCK})`);
      await tweenP(650, (p) => {
        if (dachEl) dachEl.setAttribute("transform", `translate(0 ${A().STOCK * (1 - p)})`);
      }, { e: ease.out });
      staub(svg, A().ZX + A().ZW / 2, unten);
      await tweenP(700, (p) => stockEl.setAttribute("transform", wachse(p)), { e: ease.out });
      stockEl.removeAttribute("transform");
      dachEl?.removeAttribute("transform");
    }
    if (plusEl) tween(300, (p) => { plusEl.style.opacity = String(p); });
    baueUmschalter();
    ui.besetzt = false;
    await warte(250);
    if (ui.haus === "wohnhaus") zeigeArtwahl(index);
    else zeigeRaumwahl(index, 0);
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

  // Ein Feuerwerk über einer Stelle der Hausansicht: drei Sterne, die
  // nacheinander aufgehen und in bunten Funken zerstieben.
  // Ein Feuerwerk über dem Zimmer: Raketen steigen auf, platzen in zwei
  // Ringen mit einem hellen Blitz – gut zu sehen, nach zwei Sekunden vorbei.
  function feuerwerk(svg, x, y, breite = A().ZW) {
    if (!svg) return;
    if (reduced()) { kids()?.burstConfetti?.(svg, 30); return; }
    const farben = [["#ffd166", "#ff9f43"], ["#ff7aa2", "#a78bfa"], ["#6cc3d5", "#7cc05e"], ["#ffe066", "#ff6b6b"], ["#b197fc", "#63e6be"]];
    const abstand = breite / (farben.length + 1);
    farben.forEach(([a, b], n) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "bau-feuerwerk");
      g.setAttribute("pointer-events", "none");
      const cx = x - breite / 2 + abstand * (n + 1);
      const cy = y + [10, -30, 30, -20, 0][n];
      const startY = y + 190;
      const spur = document.createElementNS(NS, "path");
      spur.setAttribute("stroke", a);
      spur.setAttribute("stroke-width", "6");
      spur.setAttribute("stroke-linecap", "round");
      const blitz = document.createElementNS(NS, "circle");
      blitz.setAttribute("fill", "#fffbe6");
      blitz.setAttribute("cx", String(cx));
      blitz.setAttribute("cy", String(cy));
      blitz.setAttribute("r", "0");
      g.append(spur, blitz);
      const funken = Array.from({ length: 24 }, (_, i) => {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("fill", i % 2 ? a : b);
        c.setAttribute("r", "0");
        g.append(c);
        return { c, w: (i / 24) * Math.PI * 2 + n * 0.4, v: (i % 2 ? 80 : 130) + (i % 3) * 14 };
      });
      svg.append(g);
      tween(1800, (p) => {
        if (p < 0.24) {
          const q = ease.out(p / 0.24);
          const kopf = startY + (cy - startY) * q;
          spur.setAttribute("d", `M${cx} ${Math.min(startY, kopf + 46).toFixed(1)}L${cx} ${kopf.toFixed(1)}`);
          return;
        }
        spur.setAttribute("d", "");
        const q = (p - 0.24) / 0.76;
        blitz.setAttribute("r", String(26 + 40 * q));
        blitz.setAttribute("opacity", String(Math.max(0, 0.95 - q * 2.4)));
        funken.forEach((f) => {
          const r = f.v * Math.sqrt(q);
          f.c.setAttribute("cx", String(cx + Math.cos(f.w) * r));
          f.c.setAttribute("cy", String(cy + Math.sin(f.w) * r + q * q * 50));
          f.c.setAttribute("r", String(8 * (1 - q) + 1.5));
          f.c.setAttribute("opacity", String(1 - q ** 1.5));
        });
      }, { delay: n * 230, e: ease.lin, done: () => g.remove() });
    });
  }

  // Das neue Zuhause leuchtet kurz auf: ein goldener Rahmen um das Zimmer
  // und ein Glanz um das Tier.
  function leuchte(svg, index, tierX, tierY) {
    if (!svg || reduced()) return;
    const art = A();
    const g = document.createElementNS(NS, "g");
    g.setAttribute("pointer-events", "none");
    g.innerHTML = `<rect x="${art.ZX + 6}" y="${art.oben(index) + 6}" width="${art.ZW - 12}" height="${art.ZH - 12}" rx="10" fill="none" stroke="#ffd166" stroke-width="12"/>` +
      `<circle cx="${tierX}" cy="${tierY}" r="40" fill="none" stroke="#fff3a0" stroke-width="10"/>`;
    svg.append(g);
    const [rahmen, ring] = g.children;
    tween(2200, (p) => {
      rahmen.setAttribute("opacity", String(0.95 * Math.abs(Math.sin(p * Math.PI * 3)) * (1 - p * 0.6)));
      ring.setAttribute("r", String(40 + 110 * p));
      ring.setAttribute("opacity", String(Math.max(0, 1 - p * 1.3)));
    }, { e: ease.lin, done: () => g.remove() });
  }

  function stupse(node) {
    if (!node) return;
    // Ein Teil der Hausansicht steht mit seinem transform-Attribut an seinem
    // Platz. Eine CSS-Animation auf transform ersetzt dieses – das Zimmer
    // spränge für die Dauer aus dem Bild. Darum wippt es über die
    // Bildschleife, um seine eigene Mitte.
    if (node instanceof SVGElement) {
      if (reduced() || node.dataset.stups) return;
      let box;
      try { box = node.getBBox(); } catch { return; }
      const basis = node.getAttribute("transform") || "";
      const cx = (box.x + box.width / 2).toFixed(1);
      const cy = (box.y + box.height / 2).toFixed(1);
      const um = (s) => `${basis} translate(${cx} ${cy}) scale(${s.toFixed(3)}) translate(${-cx} ${-cy})`;
      node.dataset.stups = "1";
      tween(800, (p) => node.setAttribute("transform", um(p < 0.3 ? 1 + 0.16 * (p / 0.3) : p < 0.6 ? 1.16 - 0.2 * ((p - 0.3) / 0.3) : 0.96 + 0.04 * ((p - 0.6) / 0.4))), {
        e: ease.lin,
        done: () => { delete node.dataset.stups; if (basis) node.setAttribute("transform", basis); else node.removeAttribute("transform"); },
      });
      return;
    }
    node.classList.remove("is-stups");
    void node.getBoundingClientRect();
    node.classList.add("is-stups");
    window.setTimeout(() => node.classList.remove("is-stups"), 900);
  }

  // ---------------------------------------------------------------------------
  // Der Lieferzug: Ziegel aus einem gelösten Rätsel
  // ---------------------------------------------------------------------------
  let liefert = false;
  async function pruefeLieferung() {
    if (liefert || !ui.host?.isConnected || ui.zimmer >= 0 || ui.overlay || !els.welt) return;
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
    besetze();
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
  // Der Einzug: die Strasse entlang, mit dem Lift hinauf, ins Zimmer
  // ---------------------------------------------------------------------------
  async function zeigeEinzug(index, tier) {
    if (!ui.host?.isConnected || !tier) return;
    ui.letzterEinzug = performance.now();
    const art = A();
    const k = M().MASS;
    ui.kommt = tier.seed;
    besetze();
    zeichneHaus({ behalteKamera: true });
    const svg = els.welt.querySelector("svg");
    const lage = svg?.querySelector(".bau-einzuglage");
    // Eine Figur aus den Büchern kennen die Kinder: Sie wird mit ihrem Buch angesagt.
    const figur = S().figurVon(tier);
    const kommt = figur ? `${tier.n} aus dem Buch «${figur.buecher[0].titel}» zieht ein!` : `${tier.n}, ${K().TIERE[tier.a]?.der || ""}, zieht ein.`;
    const zielX = art.ZX + 120 + (S().hash(tier.seed) % 300);
    const zielY = art.oben(index) + S().GEO.STAND + 2;
    if (!lage || reduced()) {
      ui.kommt = "";
      ui.besetzt = false;
      tierOrte.set(tier.seed, { x: zielX - art.ZX, ziel: zielX - art.ZX, modus: "steht", richtung: -1 });
      zeichneHaus({ stockwerk: index });
      feuerwerk(els.welt.querySelector("svg"), art.ZX + art.ZW / 2, art.oben(index) + 50);
      klang("win");
      sag(kommt);
      return;
    }
    klang("unlock");
    sag(`Da kommt jemand! ${kommt}`);
    // Unten an der Strasse anfangen.
    const kam = ui.kamera;
    const start = kam.ty;
    await tweenP(450, (p) => { kam.ty = start + (kam.min - start) * p; setzeKamera(); }, { e: ease.inOut });
    const g = document.createElementNS(NS, "g");
    g.innerHTML = `<g class="bau-tier-dreh">${tierSvg(tier)}${art.koffer()}</g>`;
    lage.append(g);
    const kabine = document.createElementNS(NS, "g");
    kabine.innerHTML = art.liftKabine();
    const liftX = art.LX + art.LIFT / 2;
    const setze = (node, x, y, flip = 1) => node.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(flip * k).toFixed(3)} ${k})`);
    // 1. Die Strasse entlang bis zum Lift.
    const x0 = WX0 + 80;
    await tweenP(1700, (p) => setze(g, x0 + (liftX - x0) * p, 28 - Math.abs(Math.sin(p * 18)) * 3), { e: ease.lin });
    // 2. In die Kabine, die unten wartet.
    lage.insertBefore(kabine, g);
    const unten0 = art.unten(0);
    kabine.setAttribute("transform", `translate(${liftX} ${unten0})`);
    await tweenP(300, (p) => setze(g, liftX, 28 + (unten0 - 2 - 28) * p), { e: ease.out });
    // 3. Hinauf – die Kamera fährt mit.
    const zielUnten = art.unten(index);
    const dauer = Math.min(2600, 500 + index * 380);
    const kamStart = kam.ty;
    const kamZiel = kameraZiel(zielUnten - 80);
    await tweenP(dauer, (p) => {
      const y = unten0 + (zielUnten - unten0) * p;
      kabine.setAttribute("transform", `translate(${liftX} ${y})`);
      setze(g, liftX, y - 2);
      kam.ty = kamStart + (kamZiel - kamStart) * p;
      setzeKamera();
    }, { e: ease.inOut });
    // 4. Aus dem Lift ins Zimmer.
    await tweenP(Math.max(500, (liftX - zielX) * 3.2), (p) => setze(g, liftX + (zielX - liftX) * p, zielUnten - (zielUnten - zielY) * Math.min(1, p * 3) - Math.abs(Math.sin(p * 14)) * 3, -1), { e: ease.lin });
    kabine.remove();
    g.remove();
    ui.kommt = "";
    tierOrte.set(tier.seed, { x: zielX - art.ZX, ziel: zielX - art.ZX, modus: "steht", richtung: -1 });
    ui.besetzt = false;
    zeichneHaus({ behalteKamera: true });
    baueUmschalter();
    feuerwerk(els.welt.querySelector("svg"), art.ZX + art.ZW / 2, art.oben(index) + 50);
    leuchte(els.welt.querySelector("svg"), index, zielX, zielY - 30);
    klang("win");
    for (const t of tiere.values()) if (t.tier.seed === tier.seed) { t.huepf = 1; wecke(); }
    sag(`Willkommen, ${tier.n}! ${tier.n} wohnt jetzt hier.${S().hatTraumjob(tier.seed) ? ` Und ${tier.n} hat schon den Traumjob!` : ""}`);
    window.setTimeout(() => blaseAnSeed(tier.seed, "Hallo! Ich wohne jetzt hier! 🎉", 3200), 900);
  }

  // ---------------------------------------------------------------------------
  // Tiere: wohnen, arbeiten, besuchen, laufen
  // ---------------------------------------------------------------------------
  // Je sichtbares Tier ein kleiner Zustand. Sie laufen ab und zu ein Stück,
  // halten an, zeigen manchmal einen Wunsch – und schlafen nachts.
  const tiere = new Map();
  // Wo jedes Tier zuletzt stand – damit es beim Neuzeichnen nicht an den
  // Anfang springt.
  const tierOrte = new Map();

  function starteTiereHaus() {
    tiere.clear();
    const svg = els.welt.querySelector("svg");
    if (!svg) return;
    const jetzt = Date.now();
    aktHaus().stock.forEach((st, index) => {
      st.zimmer.forEach((z, slot) => {
        const lage = svg.querySelector(`[data-tierlage="${index}:${slot}"]`);
        if (!lage) return;
        bevoelkere(lage, index, slot, st, jetzt);
      });
    });
    planeTiere();
  }

  // Wer in diesem Zimmer ist: die Bewohner, die zu Hause sind, und wer zu
  // Besuch ist oder hier arbeitet. Wer aus der Wohnung unterwegs ist, steht
  // auf dem Schild an der Tür.
  function bevoelkere(lage, index, slot, st, jetzt) {
    lage.innerHTML = "";
    const breite = S().breiteVon(st);
    const dome = S().istDoppel(st);
    const weg = [];
    if (st.art === "wohnung" && slot === 0) {
      st.tiere.forEach((tier) => {
        if (tier.seed === ui.kommt) return;
        const wo = S().aufenthalt(tier.seed, jetzt);
        if (!wo || wo.wo === "daheim") setzeTier(lage, { tier, wohnt: true, breite });
        else weg.push(tier);
      });
      if (weg.length) lage.insertAdjacentHTML("beforeend", tuerSchild(weg, index));
    }
    S().besucher(ui.haus, index, slot, jetzt).forEach((b, n) => {
      if (b.tier.seed === ui.kommt) return;
      setzeTier(lage, { tier: b.tier, wohnt: false, grund: b.grund, breite, x: breite * 0.65 - n * 50, dome });
    });
  }

  function tuerSchild(weg, index) {
    const namen = weg.map((t) => t.n).join(", ");
    const breite = Math.max(88, namen.length * 8 + 30);
    return `<g class="bau-schild" data-ziel="tafel" data-stock="${index}" transform="translate(${breite / 2 + 12} 120)"><rect x="${-breite / 2}" y="-26" width="${breite}" height="40" rx="8" fill="#ffffff" stroke="#e8b94f" stroke-width="3"/><text x="0" y="-6" text-anchor="middle" font-size="13" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#8a5734">Unterwegs:</text><text x="0" y="9" text-anchor="middle" font-size="12" font-family="'Baloo 2', Nunito, sans-serif" fill="#8a5734">🚶 ${textSicher(namen)}</text></g>`;
  }

  // Ein Tier, wie bau-tiere.js es zeichnet: eine Buchfigur wie in ihrem Buch,
  // die anderen einer Art je nach Kennung ein wenig verschieden angezogen.
  function tierSvg(tier, opts = {}) {
    return A().tier(tier.a, { figur: S().figurVon(tier)?.id || "", variante: S().hash(tier.seed) % 4, ...opts });
  }
  // Ein Tier als Bildchen (Zimmerkopf, Tafel): ganz zu sehen, so gross es in
  // w × h passt, mit den Füssen unten.
  function tierBildchen(tier, w, h, cls = "") {
    const figur = S().figurVon(tier)?.id || "";
    const box = window.LernappBauTiere?.box?.(tier.a, { figur }) || { x0: -30, y0: -106, x1: 34, y1: 0 };
    const k = Math.min((w - 2) / (box.x1 - box.x0), (h - 3) / (box.y1 - box.y0));
    const x = w / 2 - ((box.x0 + box.x1) / 2) * k;
    return svgVon(`<g transform="translate(${x.toFixed(1)} ${h - 2}) scale(${k.toFixed(3)})">${tierSvg(tier)}</g>`, `0 0 ${w} ${h}`, cls);
  }

  const RAND = 28;
  // dome: im KiddyDome – dort wird gehüpft, und zwar hoch.
  function setzeTier(lage, { tier, wohnt, grund = "", breite = A().ZW, x = null, dome = false }) {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "bau-tier");
    g.setAttribute("data-ziel", "tier");
    g.setAttribute("data-seed", tier.seed);
    g.setAttribute("role", "button");
    g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", `${tier.n}, ${K().TIERE[tier.a]?.der || ""}`);
    const k = M().MASS;
    // Abzeichen und Schlaf-z bleiben so gross wie vor der Halbierung der
    // Tiere (MASS 1.2) – sonst wären sie kaum zu sehen.
    const lesbar = 1.2 / k;
    // Bei der Arbeit: die Aktentasche – golden, wenn es der Traumjob ist.
    const traum = grund === "arbeit" && S().hatTraumjob(tier.seed);
    const ob = (-100 - 14 * lesbar).toFixed(1);
    const abzeichen = traum
      ? `<g transform="translate(-16 ${ob}) scale(${lesbar.toFixed(3)})"><circle r="13" fill="#fff3c4" stroke="#f5a300" stroke-width="2.5"/>${A().traumAbzeichen(true)}</g>`
      : grund === "arbeit" ? `<g transform="translate(-16 ${ob}) scale(${lesbar.toFixed(3)})"><circle r="11" fill="#ffffff" stroke="#8a5734" stroke-width="2"/><text y="5" text-anchor="middle" font-size="13">💼</text></g>` : "";
    g.innerHTML = `<g class="bau-tier-dreh">${tierSvg(tier)}</g>${abzeichen}<g class="bau-zzz" style="display:none"><g transform="translate(12 -110) scale(${lesbar.toFixed(3)})"><text x="0" y="0" font-size="18" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">z</text><text x="12" y="-14" font-size="14" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">z</text></g></g>`;
    lage.append(g);
    const ort = tierOrte.get(tier.seed);
    // Mindestens RAND vom Rand weg: Der Schwanz ragt gut 25 Einheiten hinaus.
    const startX = clamp(ort?.x ?? x ?? (60 + ((S().hash(tier.seed) % Math.max(40, breite - 120)))), RAND, breite - RAND);
    const t = {
      g, dreh: g.querySelector(".bau-tier-dreh"), bob: g.querySelector(".bob"), legL: g.querySelector(".legL"), legR: g.querySelector(".legR"), zzz: g.querySelector(".bau-zzz"), lid: g.querySelector(".bt-lid"),
      x: startX, y: S().GEO.STAND + 2, ziel: startX, richtung: 1, modus: "steht", bis: performance.now() + 800 + Math.random() * 2500,
      phase: Math.random() * 6, k, wohnt, tier, breite, huepf: 0, dome,
    };
    if (ort) { t.ziel = clamp(ort.ziel ?? t.x, RAND, breite - RAND); t.modus = ort.modus || "steht"; t.richtung = ort.richtung || 1; }
    stelleTier(t, 0);
    tiere.set(g, t);
  }

  function stelleTier(t, dt) {
    const schlaeft = ui.nacht && t.tier.a !== "owl" && t.modus !== "geht";
    t.zzz.style.display = schlaeft ? "" : "none";
    // Wer schläft, hat die Augen zu (die Lider zeichnet bau-tiere.js).
    if (t.schlaeft !== schlaeft) { t.schlaeft = schlaeft; t.lid?.setAttribute("opacity", schlaeft ? "1" : "0"); }
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
    const sprung = t.huepf > 0 ? -Math.sin(Math.PI * (1 - t.huepf)) * (t.dome ? 23 : 11) : 0;
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
        const schritt = 52 * dt;
        t.richtung = d < 0 ? -1 : 1;
        if (Math.abs(d) <= schritt) {
          t.x = t.ziel;
          t.modus = "steht";
          t.bis = jetzt + 1800 + Math.random() * 4200;
        } else { t.x += Math.sign(d) * schritt; laeuft = true; }
      }
      stelleTier(t, dt);
      tierOrte.set(t.tier.seed, { x: t.x, ziel: t.ziel, modus: t.modus, richtung: t.richtung });
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
        // Ab und zu blinzeln.
        if (t.lid && !t.schlaeft && Math.random() < 0.2) {
          t.lid.setAttribute("opacity", "1");
          window.setTimeout(() => { if (!t.schlaeft) t.lid.setAttribute("opacity", "0"); }, 160);
        }
        if (t.modus !== "steht") return;
        if (ui.nacht && t.tier.a !== "owl") return;
        if (jetzt >= t.bis && t.dome && Math.random() < 0.45) {
          // Im KiddyDome: hüpfen, wo man gerade ist.
          t.huepf = 1;
          t.bis = jetzt + 1200 + Math.random() * 2600;
          bald = Math.min(bald, t.bis - jetzt);
        } else if (jetzt >= t.bis) {
          t.ziel = clamp(t.x + (Math.random() - 0.5) * Math.min(260, t.breite * 0.6), RAND, t.breite - RAND);
          t.modus = "geht";
          if (Math.random() < 0.25) zeigeWunschBlase(t);
        } else bald = Math.min(bald, t.bis - jetzt);
      });
      wecke();
      tierUhr = window.setTimeout(naechstes, Number.isFinite(bald) ? Math.max(400, bald) : 3000);
    };
    tierUhr = window.setTimeout(naechstes, 900);
  }

  // Der Mini-Lift im KiddyDome fährt ab und zu hinauf, wartet und fährt
  // wieder hinunter – über die eine Schleife, nicht als CSS-Animation. Der
  // Hub ist so gross, wie bau-moebel-dome.js die Kabine zeichnet.
  const LIFT_HUB = 280;
  let liftUhr = 0;
  function planeLifte() {
    window.clearTimeout(liftUhr);
    liftUhr = window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      fahreLifte();
      planeLifte();
    }, 6500 + Math.random() * 4000);
  }
  function fahreLifte() {
    if (reduced() || ui.besetzt) return;
    const wo = ui.zimmer >= 0 ? els.zimmerBuehne : els.welt;
    wo?.querySelectorAll(".bau-minilift-kabine").forEach((kabine, n) => {
      const stelle = (p) => kabine.setAttribute("transform", `translate(0 ${(-LIFT_HUB * p).toFixed(1)})`);
      tween(1900, stelle, { e: ease.inOut, delay: n * 500, done: () => tween(1900, (p) => stelle(1 - p), { e: ease.inOut, delay: 1600 }) });
    });
  }

  // Ab und zu zeigt ein Tier, was es sich wünscht – als Bild in einer Blase.
  function zeigeWunschBlase(t) {
    if (!t.wohnt) return;
    const offen = S().wuensche(t.tier.seed).filter((w) => !w.erfuellt);
    if (!offen.length) return;
    const w = offen[Math.floor(Math.random() * offen.length)];
    blaseAnTier(t, wunschBild(w, 34), 3800);
  }

  // halb: wie breit die Blase zur Hälfte ist – für Text mitwachsend.
  function blaseAnTier(t, inhalt, dauer = 3000, halb = 30) {
    t.g.querySelector(".bau-blase")?.remove();
    const b = document.createElementNS(NS, "g");
    b.setAttribute("class", "bau-blase");
    // So gross wie vor der Halbierung der Tiere (MASS 1.2), gleich über dem Kopf.
    const lesbar = 1.2 / t.k;
    b.setAttribute("transform", `translate(14 ${(-108 - 12 * lesbar).toFixed(1)}) scale(${lesbar.toFixed(3)})`);
    const w = halb * 2;
    b.innerHTML = `<path d="M${-halb} -46h${w}a12 12 0 0 1 12 12v28a12 12 0 0 1-12 12h${-(w - 16)}l-10 12l0-12h-6a12 12 0 0 1-12-12v-28a12 12 0 0 1 12-12z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/><g transform="translate(0 -20)">${inhalt}</g>`;
    t.g.append(b);
    window.setTimeout(() => b.remove(), dauer);
  }

  // Eine Blase mit Text an einem bestimmten Tier.
  function blaseAnSeed(seed, text, dauer = 3000) {
    for (const t of tiere.values()) {
      if (t.tier.seed === seed) {
        const halb = Math.max(30, text.length * 3.6 + 4);
        blaseAnTier(t, `<text x="0" y="6" text-anchor="middle" font-size="13" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#243047">${textSicher(text)}</text>`, dauer, halb);
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
    // Oben in einer Zeile: Name und Tiere, daneben die Werkzeuge – zwischen
    // Zurück-Knopf und Lautsprecher links und den festen Knöpfen rechts.
    els.kopfzeile = el("div", "bau-kopfzeile");
    els.kopfzeile.append(els.zimmerKopf, els.werkzeug);
    els.zimmer.append(els.zimmerBuehne, els.kopfzeile, els.schublade, els.bearbeiten, els.muell);
    zimmerEreignisse();
  }

  async function oeffneZimmer(index, slot = 0) {
    if (ui.besetzt) return;
    const st = S().stock(ui.haus, index);
    const z = st?.zimmer?.[slot];
    if (!z?.raum) return;
    besetze();
    ui.zimmer = index;
    ui.slot = slot;
    ui.zimmerId = st.id;
    merkeErfuellt();
    ui.auswahl = null;
    ui.rueck = [];
    ui.schublade = "zimmer";
    const raum = K().RAEUME[z.raum];
    sag(`${raum.der}. ${zimmerSatz(st, slot)}`);
    // Der Zoom: Die Hausansicht wächst vom Zimmer aus auf den Platz des
    // Zimmers im Zoom (unscharf, aber schnell), dann steht das scharfe Zimmer da.
    const von = zimmerAufSchirm(index, slot);
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

  // Wer hier wohnt oder arbeitet – ein Satz zum Zimmer.
  function zimmerSatz(st, slot) {
    if (st.art === "wohnung") {
      const namen = st.tiere.map((t) => t.n);
      if (!namen.length) return "";
      return `Hier ${namen.length === 1 ? "wohnt" : "wohnen"} ${namen.join(" und ")}.`;
    }
    const leute = S().zimmerTiere(ui.haus, ui.zimmer >= 0 ? ui.zimmer : S().indexVon(ui.haus, st.id), slot);
    const traum = leute.filter((l) => l.traumHier).map((l) => l.tier.n);
    const wunsch = leute.filter((l) => l.wunsch && !l.traumHier).map((l) => l.tier.n);
    const teile = [];
    if (traum.length) teile.push(`${namenListe(traum)} ${traum.length === 1 ? "hat" : "haben"} hier den Traumjob!`);
    if (wunsch.length) teile.push(`${namenListe(wunsch)} ${wunsch.length === 1 ? "hat" : "haben"} sich dieses Zimmer gewünscht.`);
    return teile.join(" ");
  }
  function namenListe(namen) {
    return namen.length > 1 ? `${namen.slice(0, -1).join(", ")} und ${namen.at(-1)}` : (namen[0] || "");
  }

  async function schliesseZimmer(sofort = false) {
    if (ui.zimmer < 0) return;
    const index = ui.zimmer;
    const slot = ui.slot;
    waehleAus(null);
    S().speichern(true);
    ui.zimmer = -1;
    ui.zimmerId = "";
    besetze();
    zeichneHaus({ behalteKamera: true });
    kameraAuf(index, false);
    els.welt.style.visibility = "";
    if (!sofort && !reduced()) {
      const st = S().stock(ui.haus, index);
      const von = zimmerRechteck(S().breiteVon(st), S().hoeheVon(st));
      const nach = zimmerAufSchirm(index, slot);
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
    pruefeZuzug();
  }

  // Wo das Zimmer im Zoom steht: so gross wie möglich zwischen Kopfzeile und
  // Schublade. Ein halbes Zimmer ist schmaler – und dafür höher im Bild; der
  // KiddyDome doppelt so hoch.
  function zimmerRechteck(breite = zimmerBreite(), hoehe = zimmerHoehe()) {
    const w = ui.host.clientWidth || 800;
    const h = ui.host.clientHeight || 500;
    const klein = h < 520;
    const oben = klein ? 50 : 78;
    const unten = klein ? 104 : 178;
    const rand = 10;
    let pw = w - rand * 2;
    const ph = h - oben - unten - 8;
    let k = Math.min(pw / breite, ph / hoehe);
    // Links steht der Bewohner-Knopf: Reichte das Zimmer sonst bis an den
    // Rand, rückt es ihm aus dem Weg.
    const frei = els.bewohner?.isConnected ? els.bewohner.offsetLeft + els.bewohner.offsetWidth + 8 : 0;
    if ((w - breite * k) / 2 < frei) {
      pw = w - frei - rand;
      k = Math.min(pw / breite, ph / hoehe);
      return { x: frei + (pw - breite * k) / 2, y: oben + (ph - hoehe * k) / 2 + 4, w: breite * k, h: hoehe * k, k };
    }
    const zw = breite * k;
    const zh = hoehe * k;
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
    const st = aktStock();
    const z = aktZimmer();
    if (!st || !z) return;
    ui.zimmerId = st.id;
    const breite = zimmerBreite();
    const raum = K().RAEUME[z.raum];
    const oben = zimmerOben();
    const zh = zimmerHoehe();
    const mitte = oben + zh / 2;
    els.zimmerBuehne.innerHTML = `<svg xmlns="${NS}" class="bau-zimmer-svg${ui.nacht ? " is-nacht" : ""}" viewBox="0 ${oben} ${breite} ${zh}" role="img" aria-label="${raum?.name || "Zimmer"}">` +
      `<defs><radialGradient id="bau-glanz-z"><stop offset="0" stop-color="#fff6c2" stop-opacity="0.75"/><stop offset="1" stop-color="#fff6c2" stop-opacity="0"/></radialGradient></defs>` +
      `${zimmerInhalt(ui.haus, ui.zimmer, ui.slot).replace(/url\(#bau-glanz\)/g, "url(#bau-glanz-z)")}` +
      `<rect class="bau-auswahlrahmen" x="0" y="0" width="0" height="0" rx="8" fill="none" stroke="#3fbf74" stroke-width="3" stroke-dasharray="10 7" visibility="hidden" pointer-events="none"/>` +
      `${z.dinge.length ? "" : `<g class="bau-leerhinweis" pointer-events="none"><text x="${breite / 2}" y="${mitte - 12}" text-anchor="middle" font-size="${breite < 400 ? 15 : 22}" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#243047" opacity="0.45">Zieh Dinge aus der Schublade hierher</text><path d="M${breite / 2} ${mitte + 4}v34m-12-12l12 12l12-12" fill="none" stroke="#243047" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/></g>`}` +
      `</svg>`;
    ui.gezeichnet = zeichenStand();
    passeZimmerEin();
    zeichneZimmerKopf();
    zeichneWerkzeug();
    zeichneSchublade();
    if (ui.auswahl && !z.dinge.some((d) => d.k === ui.auswahl)) waehleAus(null);
    else if (ui.auswahl) zeigeAuswahl();
    if (ui.zimmer >= 0 && !els.zimmer.hidden) starteTiereZimmer();
  }

  function starteTiereZimmer() {
    tiere.clear();
    const svg = els.zimmerBuehne.querySelector("svg");
    const lage = svg?.querySelector(".bau-tierlage");
    if (!lage) return;
    bevoelkere(lage, ui.zimmer, ui.slot, aktStock(), Date.now());
    planeTiere();
  }

  // Oben im Zimmer: Name, wer hier wohnt (oder arbeitet), die Sterne.
  function zeichneZimmerKopf() {
    if (ui.zimmer < 0) return;
    const st = aktStock();
    const z = aktZimmer();
    if (!st || !z) return;
    const raum = K().RAEUME[z.raum];
    els.zimmerKopf.innerHTML = "";
    const name = knopf("bau-zimmername", `${raum.name}: vorlesen`, `<span>${raum.name}</span>${svgVon(`<path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`, "0 0 24 24", "bau-lautsprecher")}`,
      () => sag(`${raum.der}. ${raum.text}${raum.job ? ` Hier kann man ${raum.job}.` : ""}`));
    els.zimmerKopf.append(name);
    const bild = (tier) => tierBildchen(tier, 48, 52, "bau-zimmertier-bild");
    const abzeichen = svgVon(`<g transform="translate(13 14)">${A().traumAbzeichen(true)}</g>`, "0 0 28 26", "bau-traumzeichen");
    if (st.art === "wohnung") {
      // Die Bewohner mit ihren Sternen; wer den Traumjob hat, trägt das Abzeichen.
      st.tiere.forEach((tier) => {
        const st5 = S().sterne(tier.seed);
        const laune = S().laune(tier.seed);
        const traum = S().hatTraumjob(tier.seed);
        const voll = st5.total > 0 && st5.anzahl === st5.total;
        const t = knopf(`bau-zimmertier${traum ? " is-traum" : ""}${voll ? " is-alle" : ""}`, `${tier.n}: ${voll ? "alle Sterne" : `${st5.anzahl} von ${st5.total} Sternen`}${traum ? ", hat den Traumjob" : ""}. Antippen für mehr.`,
          `${bild(tier)}<span class="bau-sternreihe">${sternReiheHtml(st5)}</span><span class="bau-sternzahl"><i class="bau-stern is-gelb is-voll"></i>${st5.anzahl}/${st5.total}</span>${voll ? `<span class="bau-zimmertier-pokal" aria-hidden="true">🏆</span>` : ""}${traum ? abzeichen : ""}<span class="bau-laune" aria-hidden="true">${laune.emoji}</span>`,
          () => oeffneTafel(tier.seed));
        els.zimmerKopf.append(t);
      });
      return;
    }
    // Ein Zimmer in Spital, Dorf oder Büro: nur, wer hier den Traumjob hat
    // oder sich dieses Zimmer wünscht – ohne die Sterne der Wohnung.
    const leute = S().zimmerTiere(ui.haus, ui.zimmer, ui.slot);
    leute.slice(0, 4).forEach(({ tier, traumHier, wunsch }) => {
      const warum = traumHier ? "hat hier den Traumjob" : "hat sich dieses Zimmer gewünscht";
      const t = knopf(`bau-zimmertier is-arbeit${traumHier ? " is-traum" : ""}`, `${tier.n} ${warum}. Antippen für mehr.`,
        `${bild(tier)}<span class="bau-zimmertier-name">${textSicher(tier.n)}</span>${traumHier ? abzeichen : ""}${wunsch ? `<i class="bau-stern is-blau is-voll" aria-hidden="true"></i>` : ""}`,
        () => { sag(`${tier.n} ${warum}.`); oeffneTafel(tier.seed); });
      els.zimmerKopf.append(t);
    });
    if (leute.length > 4) els.zimmerKopf.append(el("span", "bau-zimmertier is-mehr", { text: `+${leute.length - 4}`, "aria-label": `und ${leute.length - 4} weitere` }));
  }

  function sternReiheHtml(st) {
    const s = (voll, f) => `<i class="bau-stern is-${f}${voll ? " is-voll" : ""}"></i>`;
    return st.gelb.map((v) => s(v, "gelb")).join("") + st.gruen.map((v) => s(v, "gruen")).join("") + st.blau.map((v) => s(v, "blau")).join("");
  }

  // Die Werkzeuge rechts oben im Zimmer: Rückgängig, Licht, Zimmerart (Stift).
  function zeichneWerkzeug() {
    if (ui.zimmer < 0) return;
    const z = aktZimmer();
    els.werkzeug.innerHTML = "";
    const rueck = knopf("bau-rund", "Rückgängig", svgVon(`<path d="M9 7 4 12l5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12h9a5 5 0 0 1 0 10h-2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`, "0 0 24 24"), rueckgaengig);
    rueck.disabled = ui.rueck.length === 0;
    const licht = knopf(`bau-rund${z?.licht ? " is-an" : ""}`, z?.licht ? "Licht ausschalten" : "Licht einschalten",
      svgVon(`<path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3z" fill="${z?.licht ? "#ffd166" : "none"}" stroke="currentColor" stroke-width="2"/><path d="M9.5 20h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`, "0 0 24 24"),
      () => {
        merkeRueck();
        S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (zz) => { zz.licht = zz.licht ? 0 : 1; });
        sag(aktZimmer().licht ? "Licht an." : "Licht aus.");
        zeichneZimmer();
      });
    const stift = knopf("bau-rund bau-stiftknopf", "Zimmerart ändern", svgVon(`<path d="M4 20l1.2-4.6L15.8 4.8a2.1 2.1 0 0 1 3 0l.4.4a2.1 2.1 0 0 1 0 3L8.6 18.8z" fill="#ffd166" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 6.6l3.4 3.4" stroke="currentColor" stroke-width="1.8"/><path d="M4 20l1.2-4.6 3.4 3.4z" fill="#f2c9a6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`, "0 0 24 24"),
      () => (aktStock()?.art === "wohnung" ? zeigeWohnungswahl(ui.zimmer) : zeigeRaumwahl(ui.zimmer, ui.slot)));
    els.werkzeug.append(rueck, licht, stift);
  }

  // ---------------------------------------------------------------------------
  // Die Schublade
  // ---------------------------------------------------------------------------
  // Jedes Zimmer hat seine eigenen Dinge; dazu ein paar, die überall passen
  // (Licht, ein Bild, eine Pflanze …), in Wohnungen die Lieblingsdinge der
  // Tiere – und Wand und Boden.
  function zeichneSchublade() {
    if (ui.zimmer < 0) return;
    const st = aktStock();
    const z = aktZimmer();
    const raum = K().RAEUME[z.raum];
    els.schublade.innerHTML = "";
    const reiter = el("div", "bau-reiter", { role: "tablist" });
    const wohnung = st.art === "wohnung";
    const tabs = [
      { id: "zimmer", name: `Dinge für ${raum.der.replace(/^der /, "den ")}`, icon: svgVon(dingBild(raum.icon, 20), "-12 -12 24 24") },
      ...(wohnung ? [{ id: "tiere", name: "Was Tiere mögen", icon: `<span class="bau-reiter-emoji">🐾</span>` }] : []),
      { id: "ueberall", name: "Licht, Bilder, Pflanzen", icon: `<span class="bau-reiter-emoji">💡</span>` },
      { id: "wand", name: "Wand anmalen", icon: svgVon(`<rect x="3" y="4" width="13" height="7" rx="2" fill="#ff7aa2"/><path d="M16 7h3v6h-8v3" fill="none" stroke="#4a5568" stroke-width="2"/><rect x="9" y="16" width="4" height="6" rx="1.5" fill="#4a5568"/>`, "0 0 24 24") },
      { id: "boden", name: "Boden", icon: svgVon(`<path d="M2 15h20v6H2z" fill="#c88c5c"/><path d="M2 18h20M8 15v3M15 18v3" stroke="#8a5734" stroke-width="1.4"/><rect x="2" y="3" width="20" height="12" fill="#cfeaff"/>`, "0 0 24 24") },
    ];
    if (!tabs.some((t) => t.id === ui.schublade)) ui.schublade = "zimmer";
    tabs.forEach((tab) => {
      const b = knopf(`bau-reiter-knopf${ui.schublade === tab.id ? " is-aktiv" : ""}`, tab.name, tab.icon, () => {
        ui.schublade = tab.id;
        waehleAus(null);
        sag(tab.name);
        zeichneSchublade();
      });
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", ui.schublade === tab.id ? "true" : "false");
      b.dataset.reiter = tab.id;
      reiter.append(b);
    });
    const inhalt = el("div", "bau-inhalt");
    if (ui.schublade === "wand") fuelleWand(inhalt, z);
    else if (ui.schublade === "boden") fuelleBoden(inhalt, z);
    else fuelleDinge(inhalt, schubladeDinge(ui.schublade, z.raum));
    els.schublade.append(reiter, inhalt);
    reiter.querySelector(".is-aktiv")?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }

  // Was in einer Schublade liegt. In der Wohnung kommt zuerst, was sich die
  // Tiere wünschen.
  function schubladeDinge(id, raumId) {
    const M0 = M();
    if (id === "ueberall") return M0.UEBERALL.filter((x) => M0.DINGE[x]);
    if (id === "tiere") return K().LIEBLINGS.filter((x) => M0.DINGE[x]);
    const eigene = K().dingeFuer(raumId).filter((x) => !K().LIEBLINGS.includes(x) || !aktStock()?.tiere?.length);
    const gewuenscht = gewuenschteDinge();
    return [...eigene.filter((x) => gewuenscht.has(x)), ...eigene.filter((x) => !gewuenscht.has(x))];
  }

  // Wo ein gewünschtes Ding in der Schublade liegt: zuerst das vorgeschlagene,
  // sonst eines mit derselben Eigenschaft – bei den Dingen des Zimmers, den
  // Lieblingsdingen der Tiere oder dem, was es überall gibt.
  function findeInSchublade(tag, zeige) {
    const raumId = aktZimmer()?.raum || "";
    const passt = (id) => M().DINGE[id]?.tags?.includes(tag);
    for (const reiter of ["zimmer", "tiere", "ueberall"]) {
      if (reiter === "tiere" && aktStock()?.art !== "wohnung") continue;
      const liste = schubladeDinge(reiter, raumId);
      const id = liste.includes(zeige) ? zeige : liste.find(passt);
      if (id) return { reiter, id };
    }
    return null;
  }

  // Die Dinge, die sich die Bewohner noch wünschen (ein Stern im Knopf).
  function gewuenschteDinge() {
    const st = aktStock();
    if (st?.art !== "wohnung") return new Set();
    const tags = st.tiere.flatMap((t) => S().wuensche(t.seed).filter((w) => w.typ === "ding" && !w.erfuellt).map((w) => w.tag));
    return new Set(Object.values(M().DINGE).filter((d) => tags.some((tag) => d.tags.includes(tag))).map((d) => d.id));
  }

  function fuelleDinge(inhalt, ids) {
    const gewuenscht = gewuenschteDinge();
    const raumId = aktZimmer()?.raum || "";
    ids.forEach((id) => {
      const ding = M().DINGE[id];
      const b = el("button", `bau-ding-knopf${gewuenscht.has(id) ? " is-gewuenscht" : ""}`, { type: "button", "aria-label": ding.name, title: ding.name });
      b.dataset.ding = id;
      const box = Math.max(ding.w, ding.h);
      const pad = box * 0.12;
      const y0 = ding.art === "wand" ? -ding.h / 2 : ding.art === "decke" ? 0 : -ding.h;
      b.innerHTML = svgVon(M().zeichne(id, null, raumId), `${-box / 2 - pad} ${y0 + ding.h / 2 - box / 2 - pad} ${box + pad * 2} ${box + pad * 2}`) + (gewuenscht.has(id) ? `<span class="bau-wunschmarke" aria-hidden="true">★</span>` : "");
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

  function fuelleWand(inhalt, z) {
    const farben = el("div", "bau-farbreihe");
    K().FARBEN.forEach((farbe) => {
      farben.append(farbKnopf(farbe, z.wand === farbe.id, () => {
        merkeRueck();
        S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (zz) => { zz.wand = farbe.id; });
        sag(farbe.name);
        rolleFarbe();
      }));
    });
    const muster = el("div", "bau-musterreihe");
    K().MUSTER.forEach((m) => {
      const b = el("button", `bau-muster${z.muster === m.id ? " is-aktiv" : ""}`, { type: "button", "aria-label": m.name, title: m.name });
      const id = `bau-muster-vorschau-${m.id}`;
      const hex = farbeHex(z.wand);
      b.innerHTML = svgVon(`<defs>${A().musterDef(id, m.id, hex)}</defs><rect width="60" height="60" fill="${hex}"/>${m.id === "keine" ? "" : `<rect width="60" height="60" fill="url(#${id})"/>`}`, "0 0 60 60");
      b.addEventListener("click", () => {
        merkeRueck();
        S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (zz) => { zz.muster = m.id; });
        sag(m.name);
        rolleFarbe();
      });
      muster.append(b);
    });
    inhalt.append(farben, muster);
    inhalt.classList.add("is-farben");
  }

  function fuelleBoden(inhalt, z) {
    const arten = el("div", "bau-musterreihe");
    K().BOEDEN.forEach((b0) => {
      const b = el("button", `bau-muster${z.boden === b0.id ? " is-aktiv" : ""}`, { type: "button", "aria-label": b0.name, title: b0.name });
      const hex = z.bodenFarbe ? farbeHex(z.bodenFarbe) : b0.farbe;
      b.innerHTML = svgVon(`<g transform="scale(0.5) translate(0 0)">${A().boden(b0.id, b0.id === z.boden ? hex : b0.farbe, 0, 120, 120)}</g>`, "0 0 60 60");
      b.addEventListener("click", () => {
        merkeRueck();
        S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (zz) => { zz.boden = b0.id; zz.bodenFarbe = ""; });
        sag(b0.name);
        zeichneZimmer();
      });
      arten.append(b);
    });
    const farben = el("div", "bau-farbreihe");
    K().FARBEN.forEach((farbe) => {
      farben.append(farbKnopf(farbe, z.bodenFarbe === farbe.id, () => {
        merkeRueck();
        S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (zz) => { zz.bodenFarbe = farbe.id; });
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
    if (!neu || reduced() || !alt) { pruefeDank(); return; }
    const breite = zimmerBreite();
    const oben = zimmerOben();
    const deck = document.createElementNS(NS, "rect");
    deck.setAttribute("y", String(oben));
    deck.setAttribute("height", String(S().GEO.WAND_UNTEN - oben));
    deck.setAttribute("fill", alt);
    deck.setAttribute("pointer-events", "none");
    const wand = neu.querySelector(".bau-boden");
    wand?.parentNode?.insertBefore(deck, wand);
    tween(520, (p) => {
      deck.setAttribute("x", String(breite * p));
      deck.setAttribute("width", String(breite * (1 - p)));
    }, { e: ease.inOut, done: () => deck.remove() });
    pruefeDank();
  }

  // ---------------------------------------------------------------------------
  // Dinge stellen, ziehen, bearbeiten
  // ---------------------------------------------------------------------------
  function merkeRueck() {
    const z = aktZimmer();
    if (!z) return;
    ui.rueck.push(JSON.stringify({ wand: z.wand, muster: z.muster, boden: z.boden, bodenFarbe: z.bodenFarbe, licht: z.licht, dinge: z.dinge }));
    if (ui.rueck.length > 40) ui.rueck.shift();
  }

  function rueckgaengig() {
    const schritt = ui.rueck.pop();
    if (!schritt) return;
    const alt = JSON.parse(schritt);
    S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (z) => { Object.assign(z, alt); });
    waehleAus(null);
    sag("Rückgängig.");
    zeichneZimmer();
  }

  // Ein Ding per Antippen ins Zimmer: an die freieste Stelle, und es fällt von
  // oben hinein.
  function stelleDing(id, { x = null, y = null } = {}) {
    const z = aktZimmer();
    if (!z) return null;
    if (z.dinge.length >= S().dingeMax(zimmerBreite())) { sag("Das Zimmer ist voll. Räum zuerst etwas weg."); return null; }
    const ding = M().DINGE[id];
    const geo = S().GEO;
    const ort = x === null ? freieStelle(z, id) : { x, y };
    const d = { k: S().kennung("d"), i: id, x: ort.x, y: ort.y, c: "", f: 0, s: 1 };
    if (ding.art === "boden" || ding.art === "flach") {
      const lande = landeplatz(z, d, ort.y ?? geo.STAND);
      d.y = lande.y;
    } else if (ding.art === "decke") d.y = zimmerOben();
    begrenze(d);
    merkeRueck();
    const fallVon = ding.art === "boden" ? d.y - 140 : null;
    S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (zz) => { zz.dinge.push(d); });
    zeichneZimmer();
    waehleAus(d.k, { stumm: true });
    if (fallVon !== null) falle(d, fallVon);
    else poof(d);
    pruefeDank();
    return d;
  }

  // Wo ist am meisten Platz? Von der Mitte aus nach links und rechts suchen.
  function freieStelle(z, id) {
    const ding = M().DINGE[id];
    const geo = S().GEO;
    const breite = zimmerBreite();
    const u = M().umriss(id, 1);
    const halb = (u.x1 - u.x0) / 2;
    let bester = { x: breite / 2, wert: Infinity };
    for (let x = halb + 6; x <= breite - halb - 6; x += 10) {
      let ueber = 0;
      z.dinge.forEach((d) => {
        const andere = M().DINGE[d.i];
        if (!andere || andere.art !== ding.art) return;
        const v = M().umriss(d.i, d.s);
        const a0 = x - halb;
        const a1 = x + halb;
        const b0 = d.x + v.x0;
        const b1 = d.x + v.x1;
        ueber += Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
      });
      const wert = ueber + Math.abs(x - breite / 2) * 0.05;
      if (wert < bester.wert) bester = { x, wert };
    }
    // An die Wand: gut zwei Fünftel hinunter (im KiddyDome entsprechend höher).
    const oben = zimmerOben();
    if (ding.art === "wand") return { x: bester.x, y: Math.round(oben + (geo.WAND_UNTEN - oben) * 0.43) };
    if (ding.art === "decke") return { x: bester.x, y: oben };
    return { x: bester.x, y: geo.STAND };
  }

  // Ein Ding im Zimmer halten – nichts ragt aus der Wand oder unter den Boden.
  // Was höher ist als das Zimmer (ein Gerät aus dem KiddyDome, nachdem er ein
  // anderes Zimmer wurde), steht trotzdem auf dem Boden.
  function begrenze(d) {
    const ding = M().DINGE[d.i];
    const geo = S().GEO;
    const breite = zimmerBreite();
    const oben = zimmerOben();
    const u = M().umriss(d.i, d.s);
    d.x = clamp(d.x, Math.min(-u.x0 + 2, breite / 2), Math.max(breite - u.x1 - 2, breite / 2));
    if (ding?.art === "wand") d.y = clamp(d.y, oben - u.y0 + 4, geo.WAND_UNTEN - u.y1 - 2);
    else if (ding?.art === "decke") d.y = oben;
    else if (ding?.art === "flach") d.y = clamp(d.y, geo.STAND_HINTEN, geo.STAND_VORNE);
    else d.y = clamp(d.y, Math.min(Math.max(oben - u.y0 + 2, oben), geo.STAND), geo.STAND_VORNE);
  }

  // Wohin ein losgelassenes Ding fällt: auf die höchste Fläche darunter (nur
  // kleine Dinge), sonst auf den Boden – weiter vorn, wenn es tief losgelassen
  // wurde.
  function landeplatz(z, d, yLos) {
    const geo = S().GEO;
    const ding = M().DINGE[d.i];
    if (ding.art === "flach") return { y: clamp(yLos, geo.STAND_HINTEN, geo.STAND_VORNE) };
    if (ding.klein) {
      let beste = null;
      z.dinge.forEach((u) => {
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
    const k = M().massVon(d.i) * (d.s || 1);
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
  function dingDaten(k) { return aktZimmer()?.dinge.find((d) => d.k === k) || null; }

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
          const w = ding.w * M().massVon(id) * r.k;
          const h = ding.h * M().massVon(id) * r.k;
          geist.style.width = `${w}px`;
          geist.style.height = `${h}px`;
          const y0 = ding.art === "wand" ? -ding.h / 2 : ding.art === "decke" ? 0 : -ding.h;
          geist.innerHTML = svgVon(M().zeichne(id, null, aktZimmer()?.raum || ""), `${-ding.w / 2} ${y0} ${ding.w} ${ding.h}`);
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
          const yBasis = art === "wand" ? p.y : art === "decke" ? zimmerOben() : p.y + (h * 0.15) / r.k;
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
      if (schild) { griff = null; oeffneTafelStock(ui.haus, ui.zimmer); return; }
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
      const z = aktZimmer();
      // Was auf diesem Ding steht, wandert mit – gemerkt über die Kennung,
      // nachgeschlagen bei jeder Bewegung, wie das gezogene Ding selbst.
      const mit = z.dinge.filter((u) => u.k !== d.k && traegerVon(z, u)?.k === d.k).map((u) => ({ k: u.k, dx: u.x - d.x, dy: u.y - d.y }));
      griff = { typ: "ding", id: e.pointerId, k, x0: e.clientX, y0: e.clientY, dx: d.x - p.x, dy: d.y - p.y, bewegt: false, mit, vorher: JSON.stringify(z.dinge) };
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
        griff.mit.forEach(({ k }) => { const n = dingKnoten(k); n?.parentNode?.append(n); });
      }
      const d = dingDaten(griff.k);
      const p = zimmerPunkt(e.clientX, e.clientY);
      if (!d || !p) return;
      d.x = p.x + griff.dx;
      d.y = p.y + griff.dy;
      const ding = M().DINGE[d.i];
      if (ding.art === "decke") d.y = zimmerOben();
      begrenzeLocker(d);
      dingKnoten(d.k)?.setAttribute("transform", dingTransform(d));
      griff.mit.forEach(({ k, dx, dy }) => {
        const u = dingDaten(k);
        if (!u) return;
        u.x = d.x + dx;
        u.y = d.y + dy;
        dingKnoten(k)?.setAttribute("transform", dingTransform(u));
      });
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
        if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 10) oeffneTafel(g.el.getAttribute("data-seed"));
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
      const z = aktZimmer();
      const d = dingDaten(g.k);
      // Der alte Stand für Rückgängig: so, wie es vor dem Ziehen war.
      ui.rueck.push(JSON.stringify({ wand: z.wand, muster: z.muster, boden: z.boden, bodenFarbe: z.bodenFarbe, licht: z.licht, dinge: JSON.parse(g.vorher) }));
      if (imKorb && d) { entferne(d.k, { schonGemerkt: true }); return; }
      if (d) {
        const ding = M().DINGE[d.i];
        if (ding.art === "boden" || ding.art === "flach") {
          const vonY = d.y;
          const lande = landeplatz(z, d, d.y);
          d.y = lande.y;
          begrenze(d);
          const dy = d.y - vonY;
          g.mit.forEach(({ k }) => { const u = dingDaten(k); if (u) { u.y += dy; begrenze(u); } });
          if (Math.abs(dy) > 4) falle(d, vonY);
        } else begrenze(d);
      }
      S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, () => {});
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
    const breite = zimmerBreite();
    const u = M().umriss(d.i, d.s);
    d.x = clamp(d.x, -u.x0 - 20, breite - u.x1 + 20);
    d.y = clamp(d.y, Math.min(zimmerOben() - u.y0 - 20, geo.H), geo.H + 20);
  }

  function entferne(k, { schonGemerkt = false } = {}) {
    const d = dingDaten(k);
    if (!d) return;
    if (!schonGemerkt) merkeRueck();
    poof(d, "#f1f5f9");
    const ding = M().DINGE[d.i];
    S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (z) => { z.dinge = z.dinge.filter((u) => u.k !== k); });
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
          S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (z) => { const u = z.dinge.find((x) => x.k === d.k); if (u) u.c = id; });
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
    aktion("", "Nach vorne", `<rect x="3" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="4" width="11" height="11" rx="2" fill="currentColor"/>`, () => aendereDing(d.k, (u, z) => stapleUm(u, z, 1), "Nach vorne."));
    aktion("", "Nach hinten", `<rect x="9" y="4" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="9" width="11" height="11" rx="2" fill="currentColor"/>`, () => aendereDing(d.k, (u, z) => stapleUm(u, z, -1), "Nach hinten."));
    aktion("is-weg", "Wegräumen", `<path d="M7 7h10l-1 13H8z" fill="currentColor"/><rect x="5" y="4.5" width="14" height="2.5" rx="1" fill="currentColor"/>`, () => entferne(d.k));
    els.bearbeiten.append(zeile);
    els.bearbeiten.hidden = false;
  }

  // Nach vorne (+1) oder nach hinten (-1). Was auf dem Boden steht, ordnet
  // seine Tiefe – weiter vorn heisst weiter unten im Bild (y), siehe
  // reihenfolge(). Die Reihenfolge der Liste zählt nur bei gleicher Tiefe.
  // Darum rückt das Ding vor oder hinter alles, was es überdeckt; ganz vorn
  // oder ganz hinten auf dem Boden entscheidet dann die Liste.
  function stapleUm(u, z, richtung) {
    z.dinge = richtung > 0 ? z.dinge.filter((x) => x.k !== u.k).concat([u]) : [u].concat(z.dinge.filter((x) => x.k !== u.k));
    const art = M().DINGE[u.i]?.art;
    if ((art !== "boden" && art !== "flach") || traegerVon(z, u)) return;
    const geo = S().GEO;
    const a = M().umriss(u.i, u.s);
    const ueberdeckt = z.dinge.filter((x) => {
      if (x.k === u.k || M().DINGE[x.i]?.art !== art || traegerVon(z, x)) return false;
      const b = M().umriss(x.i, x.s);
      return u.x + a.x0 < x.x + b.x1 && x.x + b.x0 < u.x + a.x1;
    });
    if (!ueberdeckt.length) return;
    if (richtung > 0) {
      const vorn = Math.max(...ueberdeckt.map((x) => x.y));
      if (u.y <= vorn) u.y = Math.min(vorn + 0.5, geo.STAND_VORNE);
    } else {
      const hinten = Math.min(...ueberdeckt.map((x) => x.y));
      if (u.y >= hinten) {
        u.y = Math.max(hinten - 0.5, geo.STAND_HINTEN);
        begrenze(u);
      }
      // Ein Ding, das höher ist als das Zimmer, darf nicht weiter nach hinten
      // (sonst ragte es oben hinaus) – dann rücken die anderen ein wenig vor.
      ueberdeckt.forEach((x) => { if (x.y < u.y) rueckeAuf(z, x, u.y); });
    }
  }

  // Ein Ding auf die Tiefe y stellen; was obendrauf steht, kommt mit.
  function rueckeAuf(z, x, y) {
    const obendrauf = z.dinge.filter((w) => w.k !== x.k && traegerVon(z, w)?.k === x.k);
    x.y = y;
    const fl = flaecheVon(x);
    if (fl) obendrauf.forEach((w) => { w.y = fl.y; });
  }

  function naechsteGroesse(s) {
    let beste = GROESSEN[2];
    GROESSEN.forEach((g) => { if (Math.abs(g - s) < Math.abs(beste - s)) beste = g; });
    return beste;
  }

  function aendereDing(k, fn, sprich) {
    merkeRueck();
    S().aendereZimmer(ui.haus, ui.zimmer, ui.slot, (z) => {
      const u = z.dinge.find((x) => x.k === k);
      if (!u) return;
      const traegt = z.dinge.filter((x) => x.k !== k && traegerVon(z, x)?.k === k);
      const yAlt = flaecheVon(u)?.y;
      fn(u, z);
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
    const lade = els.schublade?.getBoundingClientRect();
    const schublade = lade?.height ? lade.top - host.top : hoch;
    // Zuerst über dem Ding, dann darunter, sonst daneben – auf der Seite mit
    // mehr Platz. Nie über die Schublade: Aus der will das Kind weiter wählen,
    // während das Menü offen bleibt.
    let x = mitte - w / 2;
    let y = a.y - h - 12;
    if (y < kopf) {
      y = b.y + 12;
      if (y + h > raum.y + raum.h + 4) {
        y = clamp((a.y + b.y) / 2 - h / 2, kopf, Math.max(kopf, schublade - h - 6));
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
  // Was die Bewohner dieser Wohnung jetzt schon erfüllt haben – damit nur
  // Neues bedankt wird.
  function merkeErfuellt() {
    const st = S().stock(ui.haus, ui.zimmer);
    (st?.tiere || []).forEach((t) => erfuelltVorher.set(t.seed, S().wuensche(t.seed).filter((w) => w.erfuellt).map((w) => w.id)));
  }
  function pruefeDank() {
    const st = aktStock();
    if (st?.art !== "wohnung") return;
    let gedankt = false;
    st.tiere.forEach((tier) => {
      const jetzt = S().wuensche(tier.seed).filter((w) => w.erfuellt).map((w) => w.id);
      const vorher = erfuelltVorher.get(tier.seed);
      erfuelltVorher.set(tier.seed, jetzt);
      if (!vorher || gedankt) return;
      const neu = jetzt.filter((id) => !vorher.includes(id));
      if (!neu.length) return;
      gedankt = true;
      const w = S().wuensche(tier.seed).find((x) => x.id === neu[0]);
      for (const t of tiere.values()) {
        if (t.tier.seed === tier.seed) {
          t.huepf = 1;
          blaseAnTier(t, `<text x="0" y="8" text-anchor="middle" font-size="26">💛</text>`, 2200);
          wecke();
        }
      }
      klang("correct");
      const dank = w?.typ === "ding" ? `Juhu, ${K().DING_WUENSCHE[w.tag]?.ein || "danke"}! Danke!` : w?.typ === "farbe" ? "Juhu, meine Lieblingsfarbe! Danke!" : "Danke!";
      sag(`${tier.n}: ${dank}`);
      // Waren das alle Sterne, feiert feiereAlleSterne() – gleich danach.
    });
    if (gedankt) zeichneZimmerKopf();
  }

  // ---------------------------------------------------------------------------
  // Alle Bewohner: je Wohnung die Tiere mit Sternen, Traumjob und Wünschen
  // ---------------------------------------------------------------------------
  // Der Knopf links öffnet sie, im Haus wie beim Einrichten. Ein Tipp auf ein
  // Tier öffnet seine Tafel; wer sie schliesst, ist wieder hier.
  function oeffneUebersicht({ stumm = false } = {}) {
    if (!ui.host?.isConnected || ui.besetzt || ui.overlay || ui.ordnen) return false;
    if (ui.tafel) schliesseTafel();
    ui.uebersicht = true;
    if (!els.uebersicht?.isConnected) {
      els.uebersicht = el("div", "bau-uebersicht", { role: "dialog", "aria-modal": "true", "aria-label": "Alle Bewohner" });
      els.uebersicht.addEventListener("click", (e) => { if (e.target === els.uebersicht) schliesseUebersicht(); });
      ui.host.append(els.uebersicht);
    }
    els.uebersicht.hidden = false;
    fuelleUebersicht();
    if (!stumm) sag(uebersichtSatz());
    hilfe("Hier siehst du alle Tiere aus dem Wohnhaus: wie viele Sterne sie haben, ihren Traumjob und ihre Wünsche. Was noch fehlt, ist bunt; was erfüllt ist, hat einen Haken. Tippe auf ein Tier, dann siehst du alles über es.");
    return true;
  }

  // weiter: gleich geht die Tafel eines Tiers auf – kein Einzug dazwischen.
  function schliesseUebersicht({ weiter = false } = {}) {
    ui.uebersicht = false;
    if (els.uebersicht) els.uebersicht.hidden = true;
    if (weiter) return;
    if (ui.zimmer >= 0) hilfeZimmer(); else hilfeHaus();
    pruefeZuzug();
  }

  function uebersichtSatz(alle = S().alleTiere()) {
    if (!alle.length) return "Noch wohnt niemand im Wohnhaus. Richte dort eine Wohnung ein – dann zieht bald jemand ein!";
    const sterne = alle.map((e) => S().sterne(e.tier.seed));
    const anzahl = sterne.reduce((n, s) => n + s.anzahl, 0);
    const total = sterne.reduce((n, s) => n + s.total, 0);
    const traum = alle.filter((e) => S().hatTraumjob(e.tier.seed)).length;
    const voll = sterne.filter((s) => s.total > 0 && s.anzahl === s.total).length;
    const wer = alle.length === 1 ? "Ein Tier wohnt" : `${alle.length} Tiere wohnen`;
    const vollSatz = voll === 0 ? "" : voll === 1 ? " Eines hat schon alle Sterne." : ` ${voll} haben schon alle Sterne.`;
    const traumSatz = traum === 0 ? "Noch keines hat seinen Traumjob." : traum === 1 ? "Eines hat seinen Traumjob." : `${traum} haben ihren Traumjob.`;
    return `${wer} im Wohnhaus. Zusammen haben sie ${anzahl} von ${total} Sternen.${vollSatz} ${traumSatz}`;
  }

  function fuelleUebersicht() {
    if (!ui.uebersicht || !els.uebersicht) return;
    const katalog = K();
    const alle = S().alleTiere();
    const karte = el("div", "bau-uebersicht-karte");
    karte.append(knopf("bau-uebersicht-zu", "Schliessen", svgVon(KREUZ, "0 0 24 24"), () => schliesseUebersicht()));
    const satz = uebersichtSatz(alle);
    const kopf = el("div", "bau-uebersicht-kopf");
    kopf.append(el("h2", "", { text: "Alle Bewohner" }), el("p", "bau-lies", { text: satz }));
    karte.append(kopf);
    if (!alle.length) {
      if (ui.haus !== "wohnhaus" || ui.zimmer >= 0) {
        karte.append(knopf("bau-knopf-klein bau-uebersicht-hin", "Zum Wohnhaus", "Zum Wohnhaus →", async () => {
          schliesseUebersicht({ weiter: true });
          if (ui.zimmer >= 0) await schliesseZimmer(true);
          await zeigeHaus("wohnhaus", 1);
        }));
      }
      els.uebersicht.innerHTML = "";
      els.uebersicht.append(karte);
      return;
    }
    // Je Wohnung eine Gruppe, unten im Haus zuerst – wie am Lift: E, 1, 2 …
    const wohnungen = new Map();
    alle.forEach((e) => {
      if (!wohnungen.has(e.stock.id)) wohnungen.set(e.stock.id, { index: e.index, hausId: e.hausId, stock: e.stock, tiere: [] });
      wohnungen.get(e.stock.id).tiere.push(e.tier);
    });
    [...wohnungen.values()].sort((a, b) => a.index - b.index).forEach((w) => {
      const gruppe = el("section", "bau-uebersicht-wohnung");
      const raum = katalog.RAEUME[w.stock.zimmer[0]?.raum];
      const stockwerk = w.index === 0 ? "Erdgeschoss" : `${w.index}. Stock`;
      const titel = `${stockwerk}${raum ? ` · ${raum.name}` : ""}`;
      const h = el("h3", "bau-uebersicht-stock bau-lies", { "data-lies": `${stockwerk}${raum ? `: ${raum.der}` : ""}.` });
      h.innerHTML = `<span class="bau-stockmarke" aria-hidden="true">${w.index === 0 ? "E" : w.index}</span>${textSicher(titel)}`;
      const liste = el("div", "bau-uebersicht-liste");
      w.tiere.forEach((tier) => liste.append(bewohnerKarte(tier)));
      gruppe.append(h, liste);
      karte.append(gruppe);
    });
    const legende = el("p", "bau-legende bau-lies", { "data-lies": "Bunte Bilder: Das wünscht sich das Tier noch. Mit Haken: schon erfüllt. Gelb für die Wohnung, grün für das Wohnhaus, blau für die anderen Häuser." });
    legende.innerHTML = `<i class="bau-stern is-gelb is-voll"></i> Wohnung <i class="bau-stern is-gruen is-voll"></i> Wohnhaus <i class="bau-stern is-blau is-voll"></i> andere Häuser · <span class="bau-legende-haken" aria-hidden="true">✓</span> schon erfüllt`;
    karte.append(legende);
    const scroll = els.uebersicht.querySelector(".bau-uebersicht-karte")?.scrollTop || 0;
    els.uebersicht.innerHTML = "";
    els.uebersicht.append(karte);
    karte.scrollTop = scroll;
  }

  // Ein Tier in der Übersicht: Bild, Name, Sterne, Traumjob und die Wünsche –
  // was noch fehlt zuerst und bunt, Erfülltes blass mit Haken.
  function bewohnerKarte(tier) {
    const katalog = K();
    const art = katalog.TIERE[tier.a];
    const sterne = S().sterne(tier.seed);
    const alleSterne = sterne.total > 0 && sterne.anzahl === sterne.total;
    const laune = S().laune(tier.seed);
    const hatTraum = S().hatTraumjob(tier.seed);
    const traumRaum = katalog.RAEUME[String(tier.traum || "").split(":")[1]];
    const wuensche = S().wuensche(tier.seed);
    const offen = wuensche.filter((w) => !w.erfuellt);
    const figur = S().figurVon(tier);
    const wunschSatz = offen.length === 0 ? "Alle Wünsche sind erfüllt." : offen.length === 1 ? "Ein Wunsch fehlt noch." : `${offen.length} Wünsche fehlen noch.`;
    const traumSatz = traumRaum ? ` Traumjob: ${traumRaum.name}${hatTraum ? " – geschafft!" : "."}` : "";
    const label = `${tier.n}, ${art?.der || ""}. ${alleSterne ? "Alle Sterne!" : `${sterne.anzahl} von ${sterne.total} Sternen.`}${traumSatz} ${wunschSatz}`;
    const bilder = [...offen, ...wuensche.filter((w) => w.erfuellt)].map((w) =>
      `<span class="bau-bewohner-wunsch is-${w.stern}${w.erfuellt ? " is-erfuellt" : ""}">${svgVon(wunschBild(w, 32), "-19 -19 38 38")}</span>`).join("");
    return knopf(`bau-bewohner${hatTraum ? " is-traum" : ""}${alleSterne ? " is-alle" : ""}`, label,
      `<span class="bau-bewohner-bild">${tierBildchen(tier, 66, 80)}${figur ? `<span class="bau-bewohner-buch" aria-hidden="true">📖</span>` : ""}</span>` +
      `<span class="bau-bewohner-text">` +
      `<span class="bau-bewohner-name"><b>${textSicher(tier.n)}</b> <span class="bau-bewohner-laune" aria-hidden="true">${laune.emoji}</span></span>` +
      `<span class="bau-bewohner-art">${textSicher(art?.name || "")}</span>` +
      `<span class="bau-bewohner-sterne"><span class="bau-sternreihe">${sternReiheHtml(sterne)}</span>${alleSterne ? `<span class="bau-bewohner-alle">🏆 Alle Sterne!</span>` : `<span>${sterne.anzahl}/${sterne.total}</span>`}</span>` +
      (traumRaum ? `<span class="bau-bewohner-traum${hatTraum ? " is-erfuellt" : ""}">${traumZeichen("", hatTraum)}<span><small>Traumjob:</small> ${textSicher(traumRaum.name)}</span>${hatTraum ? `<span class="bau-bewohner-haken" aria-hidden="true">✓</span>` : ""}</span>` : "") +
      `<span class="bau-bewohner-wuensche">${bilder}</span>` +
      `</span>`,
      () => {
        schliesseUebersicht({ weiter: true });
        oeffneTafel(tier.seed, { ausUebersicht: true });
      });
  }

  // ---------------------------------------------------------------------------
  // Die Tier-Tafel: wer hier wohnt, wo es gerade ist, was es sich wünscht
  // ---------------------------------------------------------------------------
  function oeffneTafelStock(hausId, index) {
    const st = S().stock(hausId, index);
    if (st?.tiere?.length) { oeffneTafel(st.tiere[0].seed); return; }
    // Ein Zimmer der anderen Häuser: wer hier arbeitet.
    const arbeiter = S().alleTiere().find((e) => { const j = S().jobVon(e.tier.seed); return j && j.haus === hausId && j.index === index; });
    if (arbeiter) oeffneTafel(arbeiter.tier.seed);
  }

  // ausUebersicht: aus «Alle Bewohner» geöffnet – Schliessen führt dorthin
  // zurück.
  function oeffneTafel(seed, { ausUebersicht = false } = {}) {
    const ref = S().findeTier(seed);
    if (!ref) return;
    ui.tafel = { seed, ausUebersicht };
    // Nach dem Verlassen der Bauecke hängt die alte Tafel nicht mehr im Bild
    // (mount leert die Bühne) – dann eine neue.
    if (!els.tafel?.isConnected) {
      els.tafel = el("div", "bau-tafel", { role: "dialog", "aria-modal": "true" });
      els.tafel.addEventListener("click", (e) => { if (e.target === els.tafel) schliesseTafel({ zurueck: true }); });
      ui.host.append(els.tafel);
    }
    els.tafel.hidden = false;
    fuelleTafel();
    const laune = S().laune(seed);
    sag(`${ref.tier.n}, ${K().TIERE[ref.tier.a].der}. ${laune.text}`);
    hilfe(`Hier siehst du, was sich ${ref.tier.n} wünscht: Gelbe Sterne sind Wünsche für die Wohnung, grüne für das Wohnhaus, blaue für die anderen Häuser. Dazu den Traumjob und wo ${ref.tier.n} gerade ist. Oben wechselst du zu den Mitbewohnern. Ist das Vorlesen an, liest ein Tipp auf einen Text ihn vor.`);
  }

  // zurueck: das Kind schliesst die Tafel nur (Kreuz, daneben tippen, Zurück).
  // Kam es aus «Alle Bewohner», ist es wieder dort. Wer hingeht oder einen
  // Wunsch gezeigt bekommt, schliesst ohne.
  function schliesseTafel({ zurueck = false } = {}) {
    const zurUebersicht = zurueck && Boolean(ui.tafel?.ausUebersicht);
    ui.tafel = null;
    if (els.tafel) els.tafel.hidden = true;
    if (zurUebersicht && oeffneUebersicht({ stumm: true })) return;
    if (ui.zimmer >= 0) hilfeZimmer(); else hilfeHaus();
    pruefeZuzug();
  }

  function fuelleTafel() {
    if (!ui.tafel || !els.tafel) return;
    const ref = S().findeTier(ui.tafel.seed);
    if (!ref) { schliesseTafel(); return; }
    const { tier, stock: st } = ref;
    const katalog = K();
    const art = katalog.TIERE[tier.a];
    const raum = katalog.RAEUME[st.zimmer[0]?.raum];
    const laune = S().laune(tier.seed);
    const sterne = S().sterne(tier.seed);
    const karte = el("div", "bau-tafel-karte");
    const zu = ui.tafel.ausUebersicht
      ? knopf("bau-tafel-zu", "Zurück zu allen Bewohnern", svgVon(PFEIL_ZURUECK, "0 0 24 24"), () => schliesseTafel({ zurueck: true }))
      : knopf("bau-tafel-zu", "Schliessen", svgVon(KREUZ, "0 0 24 24"), () => schliesseTafel({ zurueck: true }));
    karte.append(zu);
    // Die Mitbewohner: ein Bild je Tier zum Wechseln.
    if (st.tiere.length > 1) {
      const leiste = el("div", "bau-tafel-leiste", { role: "tablist", "aria-label": "Wer hier wohnt" });
      st.tiere.forEach((t) => {
        const traum = S().hatTraumjob(t.seed);
        const b = knopf(`bau-tafel-wechsel${t.seed === tier.seed ? " is-aktiv" : ""}${traum ? " is-traum" : ""}`, `${t.n}, ${katalog.TIERE[t.a].der}${traum ? ", hat den Traumjob" : ""}`, `${tierBildchen(t, 48, 52)}<span>${textSicher(t.n)}</span>${traum ? traumZeichen() : ""}`, () => {
          ui.tafel = { ...ui.tafel, seed: t.seed };
          fuelleTafel();
          sag(`${t.n}. ${S().laune(t.seed).text}`);
        });
        b.setAttribute("role", "tab");
        leiste.append(b);
      });
      karte.append(leiste);
    }
    const kopf = el("div", "bau-tafel-kopf");
    kopf.innerHTML = `${tierBildchen(tier, 80, 100, "bau-tafel-tier")}` +
      `<div class="bau-tafel-wer"><h2>${textSicher(tier.n)}${S().hatTraumjob(tier.seed) ? ` ${traumZeichen("hat den Traumjob")}` : ""}</h2><p>${gross(art.der)} · wohnt ${S().imRaum(raum?.id)} ${katalog.HAUS.wohnhaus.im}</p>` +
      `<p class="bau-tafel-laune"><span aria-hidden="true">${laune.emoji}</span> ${laune.text}</p></div>`;
    // Gleich darunter, gross: die Sterne.
    karte.append(kopf, sternKachel(tier, sterne));
    // Wo es gerade ist – mit dem Weg dorthin.
    const wo = S().aufenthalt(tier.seed);
    const woZeile = el("div", `bau-tafel-wo${wo?.wo === "daheim" ? " is-daheim" : ""}`);
    const woText = `${tier.n} ${S().woText(tier.seed)}.`;
    woZeile.append(el("p", "bau-lies", { html: `<span aria-hidden="true">${wo?.wo === "arbeit" ? "💼" : wo?.wo === "besuch" ? "🚶" : "🏠"}</span> ${textSicher(woText)}`, "data-lies": woText }));
    if (wo) woZeile.append(knopf("bau-knopf-klein bau-hingehen", `Zu ${tier.n} gehen`, `Hingehen →`, () => { schliesseTafel(); geheZu(wo.haus, wo.index, wo.slot, tier.seed); }));
    karte.append(woZeile);
    // Die Wünsche.
    const liste = el("ul", "bau-wunschliste");
    S().wuensche(tier.seed).forEach((w) => {
      const li = el("li", `bau-wunsch is-${w.stern}${w.erfuellt ? " is-erfuellt" : ""}${w.neu ? " is-neu" : ""}`);
      const b = knopf("bau-wunsch-text", w.text, `<i class="bau-stern is-${w.stern}${w.erfuellt ? " is-voll" : ""}"></i>${svgVon(wunschBild(w, 40), "-24 -24 48 48", "bau-wunsch-bild")}<span>${textSicher(w.kurz)}</span>${w.neu ? `<em>neu</em>` : ""}`, () => sag(w.erfuellt ? `${w.text} Das hast du schon erfüllt!` : w.text));
      li.append(b);
      if (!w.erfuellt) li.append(knopf("bau-zeig", "Zeig mir, wie", "→", () => zeigeWunsch(tier.seed, w)));
      else li.append(el("span", "bau-haken", { "aria-hidden": "true", text: "✓" }));
      liste.append(li);
    });
    const legende = el("p", "bau-legende bau-lies", { "data-lies": "Gelbe Sterne: Wünsche für die Wohnung. Grüne: für das Wohnhaus. Blaue: für die anderen Häuser." });
    legende.innerHTML = `<i class="bau-stern is-gelb is-voll"></i> Wohnung <i class="bau-stern is-gruen is-voll"></i> Wohnhaus <i class="bau-stern is-blau is-voll"></i> andere Häuser`;
    karte.append(liste, legende);
    // Traumjob und Arbeit.
    karte.append(arbeitTeil(tier));
    // Ganz unten: aus welchem Buch der Leseecke die Figur kommt (klein, mit
    // dem Umschlag) und das Ausziehen.
    const fuss = el("div", "bau-tafel-fuss");
    const figur = S().figurVon(tier);
    const buch = figur?.buecher?.[0];
    if (buch) {
      const satz = `${figur.ich} Aus dem Buch «${buch.titel}».`;
      const box = el("div", "bau-tafel-buch bau-lies", { "data-lies": satz });
      box.innerHTML = `<img src="bilder/buecher/${buch.id}/umschlag-klein.webp" alt="" loading="lazy" decoding="async">` +
        `<p><b>Aus dem Buch «${textSicher(buch.titel)}»</b><span>${textSicher(figur.ich)}</span></p>`;
      fuss.append(box);
    }
    fuss.append(knopf("bau-hinaus", `${tier.n} ausziehen lassen`, `🧳 Ausziehen lassen`, () => frageAuszug(tier)));
    karte.append(fuss);
    els.tafel.innerHTML = "";
    els.tafel.append(karte);
  }

  // Die Sterne eines Tiers als Kachel: gross, geholte gefüllt, offene hohl.
  // Hat es alle, wird die Kachel golden – mit Pokal.
  function sternKachel(tier, sterne) {
    const alle = sterne.total > 0 && sterne.anzahl === sterne.total;
    const fehlt = sterne.total - sterne.anzahl;
    const noch = fehlt === 1 ? "Noch ein Wunsch" : `Noch ${fehlt} Wünsche`;
    const satz = alle
      ? `${tier.n} hat alle ${sterne.total} Sterne! ${tier.n} ist überglücklich.`
      : `${tier.n} hat ${sterne.anzahl} von ${sterne.total} Sternen. ${noch} – unten steht, welche.`;
    const box = el("div", `bau-sternkachel bau-lies${alle ? " is-alle" : ""}`, { "data-lies": satz });
    const reihe = [...sterne.gelb.map((v) => [v, "gelb"]), ...sterne.gruen.map((v) => [v, "gruen"]), ...sterne.blau.map((v) => [v, "blau"])];
    box.innerHTML = `<span class="bau-sternkachel-sterne" aria-hidden="true">${reihe.map(([v, f]) => `<i class="bau-stern bau-stern-gross is-${f}${v ? " is-voll" : ""}"></i>`).join("")}</span>` +
      `<span class="bau-sternkachel-text">${alle
        ? `<b>Alle Sterne!</b><span>${textSicher(tier.n)} ist überglücklich.</span>`
        : `<b>${sterne.anzahl} von ${sterne.total} Sternen</b><span>${noch} – unten steht, welche.</span>`}</span>` +
      (alle ? `<span class="bau-sternkachel-pokal" aria-hidden="true">🏆</span>` : "");
    return box;
  }

  // Der Traumjob und die Arbeit, die ein Tier gerade hat.
  function arbeitTeil(tier) {
    const box = el("div", "bau-tafel-arbeit");
    const [traumHaus, traumRaum] = String(tier.traum || "").split(":");
    const job = S().jobVon(tier.seed);
    const traumText = traumRaum ? S().jobText(traumRaum, traumHaus) : "";
    if (traumText) {
      const erfuellt = job?.traum;
      const satz = erfuellt
        ? `Traumjob: ${traumText}. ${tier.n} arbeitet schon dort!`
        : `Traumjob: ${traumText}. ${zimmerFehlt(traumHaus, traumRaum) ? `Dafür braucht es ${K().RAEUME[traumRaum]?.ein || "dieses Zimmer"} ${K().HAUS[traumHaus]?.im || ""}.` : "Dort ist gerade kein Platz frei."}`;
      const zeile = el("div", `bau-traum${erfuellt ? " is-erfuellt" : ""}`);
      zeile.append(el("p", "bau-lies", { html: `${traumZeichen("", erfuellt)} <b>Traumjob:</b> ${textSicher(traumText)}${erfuellt ? " – geschafft!" : ""}`, "data-lies": satz }));
      if (!erfuellt && zimmerFehlt(traumHaus, traumRaum)) zeile.append(knopf("bau-zeig", "Zeig mir, wo", "→", () => zeigeZimmerBauen(traumHaus, traumRaum)));
      box.append(zeile);
    }
    // Die Arbeit – nur, wenn es nicht schon der Traumjob ist.
    if (job?.traum) return box;
    let arbeitSatz;
    if (job) {
      const z = S().zimmer(job.haus, job.index, job.slot);
      arbeitSatz = `Arbeit: ${S().jobText(z?.raum, job.haus)}.`;
    } else arbeitSatz = "Sucht noch Arbeit. Richte im Spital, im Dorf oder im Büro ein Zimmer ein!";
    box.append(el("p", "bau-arbeit bau-lies", { html: `<span aria-hidden="true">💼</span> ${textSicher(arbeitSatz)}`, "data-lies": `${tier.n}: ${arbeitSatz}` }));
    return box;
  }

  // Das Abzeichen des Traumjobs als kleines Bild (leer: noch nicht).
  function traumZeichen(titel = "", voll = true) {
    return `<span class="bau-traumzeichen-klein"${titel ? ` title="${titel}"` : ` aria-hidden="true"`}>${svgVon(`<g transform="translate(13 14)">${A().traumAbzeichen(voll)}</g>`, "0 0 28 26")}</span>`;
  }

  function zimmerFehlt(hausId, raumId) {
    return !(S().haus(hausId)?.stock || []).some((s) => s.zimmer.some((z) => z.raum === raumId));
  }

  function frageAuszug(tier) {
    if (!ui.tafel) return;
    const karte = els.tafel.querySelector(".bau-tafel-karte");
    const frageEl = el("div", "bau-frage-auszug", { role: "alertdialog" });
    frageEl.innerHTML = `<p>Soll ${textSicher(tier.n)} wirklich ausziehen? Dann kommt bald ein neues Tier.</p>`;
    const ja = knopf("bau-knopf-klein is-ja", "Ja, ausziehen", "Ja", () => {
      const name = tier.n;
      S().hinausschicken(tier.seed);
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
  async function zeigeWunsch(seed, w) {
    const ref = S().findeTier(seed);
    if (!ref) return;
    schliesseTafel();
    sag(w.text);
    if (w.typ === "ding" || w.typ === "farbe") {
      if (ui.haus !== ref.hausId) await zeigeHaus(ref.hausId, 1, { stockwerk: ref.index, ohneSprache: true });
      if (ui.zimmer !== ref.index || ui.slot !== 0) {
        if (ui.zimmer >= 0) await schliesseZimmer(true);
        await oeffneZimmer(ref.index, 0);
      }
      if (w.typ === "farbe") {
        ui.schublade = "wand";
        zeichneSchublade();
        const knopfEl = els.schublade.querySelector(`.bau-farbe[aria-label="${K().FARBE[w.farbe]?.name}"]`);
        knopfEl?.scrollIntoView?.({ block: "nearest", inline: "center" });
        stupse(knopfEl);
        return;
      }
      const fund = findeInSchublade(w.tag, w.zeige);
      ui.schublade = fund?.reiter || "zimmer";
      zeichneSchublade();
      const knopfEl = fund ? els.schublade.querySelector(`[data-ding="${fund.id}"]`) : null;
      knopfEl?.scrollIntoView?.({ block: "nearest", inline: "center" });
      stupse(knopfEl);
      return;
    }
    zeigeZimmerBauen(w.haus, w.raum);
  }

  // Wo ein neues Zimmer hinkann: ein leerer Platz in einem Stockwerk, ein
  // Rohbau, sonst das Plus (oder der Rätsel-Knopf für Ziegel).
  async function zeigeZimmerBauen(hausId, raumId) {
    if (ui.tafel) schliesseTafel();
    if (ui.zimmer >= 0) await schliesseZimmer(true);
    if (ui.haus !== hausId) await zeigeHaus(hausId, 1, { ohneSprache: true });
    const raum = K().RAEUME[raumId];
    const stock = aktHaus().stock;
    const wen = (raum?.der || "das Zimmer").replace(/^der /, "den ");
    let leer = null;
    stock.forEach((s, i) => { if (!leer && (s.art === "zwei" || s.art === "eins")) { const slot = s.zimmer.findIndex((z) => !z.raum); if (slot >= 0) leer = { i, slot }; } });
    // Der KiddyDome: am liebsten ein leeres Stockwerk mit einem freien daneben.
    if (raum?.doppel) {
      const paar = stock.findIndex((s, i) => s.art === "eins" && !s.zimmer[0]?.raum && S().doppelPlatz(hausId, i));
      if (paar >= 0) leer = { i: paar, slot: 0 };
    }
    const roh = stock.findIndex((s) => s.art === "");
    if (leer) {
      kameraAuf(leer.i);
      const zwei = raum?.doppel && !S().doppelPlatz(hausId, leer.i) ? ` ${gross(raum.der)} braucht zwei Stockwerke – im Fenster kannst du gleich noch eines dazubauen.` : "";
      sag(`Hier ist noch Platz. Tippe auf das Plus und wähle ${wen}.${zwei}`);
      stupse(els.welt.querySelector(`.bau-raum[data-stock="${leer.i}"][data-slot="${leer.slot}"]`));
    } else if (roh >= 0) {
      kameraAuf(roh);
      sag(`Hier ist noch ein leeres Stockwerk. Tippe darauf, wähle zwei Zimmer und dann ${wen}.`);
      stupse(els.welt.querySelector(`.bau-raum[data-stock="${roh}"]`));
    } else {
      const kann = S().kannBauen(hausId);
      kameraAuf(stock.length - 1);
      sag(kann.ok ? "Tippe auf das grüne Plus, dann baust du ein neues Stockwerk dafür." : "Dafür brauchst du ein neues Stockwerk. Löse ein Rätsel, dann bringt der Zug die Ziegel!");
      stupse(kann.ok ? els.welt.querySelector("[data-ziel='plus']") : els.raetsel);
    }
  }

  // Zu einem Tier: ins richtige Haus, zum Stockwerk – und es hüpft.
  async function geheZu(hausId, index, slot, seed) {
    if (ui.zimmer >= 0) await schliesseZimmer(true);
    if (ui.haus !== hausId) await zeigeHaus(hausId, 1, { stockwerk: index, ohneSprache: true });
    else kameraAuf(index);
    const raum = K().RAEUME[S().zimmer(hausId, index, slot)?.raum];
    if (raum) sag(`${raum.der} ${K().HAUS[hausId].im}.`);
    await warte(500);
    // Das Tier hüpft – angestupst wird es nicht: Seine Lage schreibt die
    // Bildschleife in jedem Bild neu.
    for (const t of tiere.values()) if (t.tier.seed === seed) { t.huepf = 1; wecke(); }
  }

  // ---------------------------------------------------------------------------
  // Wählen: das erste Haus, was ein Stockwerk wird, die Zimmerart, die Fassade
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
      else { sag(`${K().HAUS[gewaehlt].der}! Tippe auf ein Stockwerk und wähle, was es werden soll.`); }
      window.setTimeout(pruefeLieferung, 700);
    });
    ok.disabled = true;
    karte.append(raster, ok);
    sag("Willkommen in der Bauecke! Welches Haus baust du zuerst? Tippe auf ein Haus.");
  }

  // Eine Wahl mit grossen Karten: Bild, Name, ein Satz; ein Tipp liest vor,
  // der Haken wählt.
  // Eine Karte kann prüfen, ob sie hier geht (pruefe → { ok, text, knopf }):
  // Der KiddyDome braucht zwei Stockwerke. Geht es nicht, steht der Hinweis
  // da, der Haken bleibt aus – und vielleicht hilft ein Knopf.
  function kartenWahl({ cls, titel, frage, karten, aktiv = "", okText = "Das nehme ich! ✓", weiter }) {
    const { karte } = oeffneOverlay(cls, titel);
    let gewaehlt = aktiv;
    const raster = el("div", "bau-wahl-raster is-zimmer");
    const zeige = (k) => {
      const p = k?.pruefe?.() || null;
      beschrieb.textContent = k?.text || frage;
      hinweis.textContent = p?.text || "";
      hinweis.hidden = !p?.text;
      hinweis.classList.toggle("is-warnung", Boolean(p && !p.ok));
      ok.disabled = !k || Boolean(p && !p.ok);
      ok.hidden = Boolean(p?.knopf);
      extra.hidden = !p?.knopf;
      if (p?.knopf) {
        extra.textContent = p.knopf.text;
        extra.setAttribute("aria-label", p.knopf.text);
        extra.title = p.knopf.text;
        extra.onclick = () => { schliesseOverlay(); p.knopf.fn(); };
      }
      return p;
    };
    karten.forEach((k) => {
      const b = knopf(`bau-wahl-feld${gewaehlt === k.id ? " is-aktiv" : ""}`, k.name,
        `${svgVon(k.bild, "-34 -34 68 68", "bau-wahl-bild")}<span>${k.name}</span>${k.schon ? `<i class="bau-schon" title="gibt es schon">✓</i>` : ""}`, () => {
          gewaehlt = k.id;
          raster.querySelectorAll(".bau-wahl-feld").forEach((x) => x.classList.toggle("is-aktiv", x === b));
          const p = zeige(k);
          sag(p && !p.ok ? `${k.der || k.name}. ${p.text}` : `${k.der || k.name}. ${k.text}${p?.text ? ` ${p.text}` : ""}`);
        });
      raster.append(b);
    });
    const beschrieb = el("p", "bau-wahl-text");
    const hinweis = el("p", "bau-wahl-hinweis");
    const ok = knopf("bau-ok", okText.replace(/ ✓$/, ""), okText, () => { if (gewaehlt && !ok.disabled) { schliesseOverlay(); weiter(gewaehlt); } });
    const extra = knopf("bau-dazu", "", "", null);
    const ab = knopf("bau-abbrechen", "Abbrechen", "Abbrechen", () => { schliesseOverlay(); sag("Abgebrochen."); });
    zeige(karten.find((k) => k.id === gewaehlt));
    // Der Hinweis steht unten bei den Knöpfen – dort bleibt er sichtbar,
    // auch wenn die Karten rollen.
    const unten = el("div", "bau-wahl-unten");
    unten.append(hinweis, ab, extra, ok);
    karte.append(raster, beschrieb, unten);
    sag(frage);
  }

  // Ein neues Stockwerk im Wohnhaus: Wohnt hier jemand, oder kommen zwei
  // Zimmer hin?
  function zeigeArtwahl(index) {
    const st = S().stock(ui.haus, index);
    if (!st || st.art) return;
    kartenWahl({
      cls: "is-artwahl",
      titel: "Was wird das neue Stockwerk?",
      frage: "Was wird das neue Stockwerk? Eine Wohnung, in der Tiere wohnen, oder zwei Zimmer wie Küche und Bad?",
      karten: [
        { id: "wohnung", name: "Wohnung", text: "Eine Wohnung: Hier wohnen bis zu drei Tiere – in einem Schlafzimmer oder einem Kinderzimmer.", bild: dingBild("bett", 56) },
        { id: "zwei", name: "Zwei Zimmer", text: "Zwei Zimmer nebeneinander: zum Beispiel Küche und Bad, Wohnzimmer oder Waschküche.", bild: `<g transform="translate(-16 0)">${dingBild("kochherd", 30)}</g><g transform="translate(17 0)">${dingBild("wanne", 30)}</g>` },
      ],
      okText: "Das wird es! ✓",
      weiter: async (art) => {
        S().waehleArt(ui.haus, index, art);
        zeichneHaus({ stockwerk: index });
        klang("correct");
        if (art === "wohnung") { await warte(350); zeigeWohnungswahl(index); return; }
        sag("Zwei Zimmer! Tippe auf eines und wähle, was es werden soll.");
        stupse(els.welt.querySelector(`.bau-raum[data-stock="${index}"][data-slot="0"]`));
      },
    });
  }

  // Eine Wohnung: Schlafzimmer oder Kinderzimmer? Beim ersten Mal zieht
  // gleich ein Tier ein.
  function zeigeWohnungswahl(index) {
    const st = S().stock(ui.haus, index);
    if (st?.art !== "wohnung") return;
    const z = st.zimmer[0];
    kartenWahl({
      cls: "is-raumwahl",
      titel: z.raum ? "Was soll diese Wohnung sein?" : "Eine leere Wohnung!",
      frage: z.raum ? "Was soll diese Wohnung sein?" : "Eine leere Wohnung! Wird sie ein Schlafzimmer oder ein Kinderzimmer? Dann zieht gleich jemand ein.",
      aktiv: z.raum,
      karten: K().WOHNEN.map((id) => { const r = K().RAEUME[id]; return { id, name: r.name, der: r.der, text: r.text, bild: dingBild(r.icon, 56) }; }),
      weiter: async (raumId) => {
        if (raumId === z.raum) return;
        const ergebnis = S().waehleRaum(ui.haus, index, 0, raumId);
        const raum = K().RAEUME[raumId];
        if (ui.zimmer === index) {
          merkeErfuellt();
          zeichneZimmer();
          sag(`Das ist jetzt ${raum.der}.`);
          return;
        }
        if (ergebnis && typeof ergebnis === "object") {
          sag(`${raum.der}!`);
          await zeigeEinzug(index, ergebnis);
          await warte(1600);
          if (ui.zimmer < 0 && !ui.overlay && !ui.tafel) oeffneZimmer(index, 0);
          return;
        }
        zeichneHaus({ stockwerk: index });
      },
    });
  }

  // Ein Zimmer auf einem Stockwerk mit zwei Zimmern: welche Art?
  function zeigeRaumwahl(index, slot) {
    const st = S().stock(ui.haus, index);
    const z = st?.zimmer?.[slot];
    if (!z || st.art === "wohnung") return;
    const haus = K().HAUS[ui.haus];
    const vorhanden = new Set(aktHaus().stock.flatMap((s) => s.zimmer.map((x) => x.raum)).filter(Boolean));
    kartenWahl({
      cls: "is-raumwahl",
      titel: z.raum ? "Was soll dieses Zimmer werden?" : `Ein neues Zimmer ${haus.im}`,
      frage: z.raum ? "Was soll dieses Zimmer werden?" : "Was wird das neue Zimmer? Tippe auf ein Zimmer, dann hörst du, was dort geschieht.",
      aktiv: z.raum,
      karten: haus.raeume.filter((id) => !K().RAEUME[id].wohnen).map((id) => {
        const r = K().RAEUME[id];
        return { id, name: r.name, der: r.der, text: r.job ? `${r.text} Hier kann man ${r.job}.` : r.text, bild: dingBild(r.icon, 56), schon: vorhanden.has(id),
          pruefe: r.doppel ? () => doppelHinweis(index, id) : null };
      }),
      weiter: async (raumId) => {
        if (raumId === z.raum) return;
        const raum = K().RAEUME[raumId];
        const ergebnis = S().waehleRaum(ui.haus, index, slot, raumId);
        if (!ergebnis) { sag(doppelHinweis(index, raumId).text); return; }
        // Der KiddyDome steht auf dem unteren der beiden Stockwerke.
        const ziel = typeof ergebnis === "object" && Number.isInteger(ergebnis.unten) ? ergebnis.unten : index;
        if (ui.zimmer === index && ui.slot === slot) {
          zeichneZimmer();
          sag(`Das ist jetzt ${raum.der}.`);
          return;
        }
        zeichneHaus({ stockwerk: ziel });
        klang("correct");
        sag(raum.doppel ? `${raum.der}! ${pronomen(raum.der)} ist zwei Stockwerke hoch.` : `${raum.der}!`);
        await warte(450);
        oeffneZimmer(ziel, slot);
      },
    });
  }

  // Der KiddyDome braucht zwei Stockwerke übereinander: Geht es hier? Sonst
  // ein Hinweis – und, wenn Ziegel da sind, ein Knopf, der gleich darüber ein
  // Stockwerk dazubaut.
  function doppelHinweis(index, raumId) {
    const raum = K().RAEUME[raumId];
    const name = gross(raum.der);
    const platz = S().doppelPlatz(ui.haus, index);
    if (platz) {
      const wo = platz.unten === index ? "dieses Stockwerk und das darüber" : "dieses Stockwerk und das darunter";
      return { ok: true, text: `${name} ist so hoch wie zwei Stockwerke: ${pronomen(raum.der)} braucht ${wo}.` };
    }
    const satz = `${name} braucht zwei Stockwerke übereinander – hier ist nur eines frei.`;
    const kann = S().kannBauen(ui.haus);
    if (kann.ok) return { ok: false, text: `${satz} Baue gleich darüber noch eines dazu!`, knopf: { text: "Stockwerk dazubauen", fn: () => baueDazuFuer(index, raumId) } };
    if (kann.grund === "ziegel") return { ok: false, text: `${satz} Löse ein Rätsel für Ziegel, dann kannst du noch ein Stockwerk dazubauen.` };
    if (kann.grund === "schranke") return { ok: false, text: `${satz} Für mehr Stockwerke müssen deine Eltern die Schranke öffnen.` };
    return { ok: false, text: `${satz} Dieses Haus ist schon ganz hoch – wähle ein anderes Zimmer.` };
  }
  const pronomen = (der) => ({ der: "Er", die: "Sie", das: "Es" })[String(der).split(" ")[0]] || "Es";

  // Ein Stockwerk gleich über diesem bauen – und darin den KiddyDome.
  async function baueDazuFuer(index, raumId) {
    if (ui.besetzt) return;
    const raum = K().RAEUME[raumId];
    const neu = S().baueStockwerk(ui.haus, { ueber: index });
    if (neu < 0) { neuesStockwerk(); return; }
    klang("unlock");
    aktualisiereHud();
    baueUmschalter();
    const ergebnis = S().waehleRaum(ui.haus, index, 0, raumId);
    const satz = `Ein neues Stockwerk! ${gross(raum.der)} ist jetzt zwei Stockwerke hoch.`;
    if (ui.zimmer >= 0) {
      zeichneZimmer();
      kids()?.burstConfetti?.(els.zimmer, 30);
      sag(ergebnis ? satz : "Ein neues Stockwerk!");
      return;
    }
    zeichneHaus({ stockwerk: index });
    if (!ergebnis) { sag("Ein neues Stockwerk!"); return; }
    const svg = els.welt.querySelector("svg");
    staub(svg, A().ZX + A().ZW / 2, A().unten(index));
    feuerwerk(svg, A().ZX + A().ZW / 2, A().oben(index) - A().STOCK / 2 + 50);
    sag(satz);
    await warte(1200);
    if (ui.zimmer < 0 && !ui.overlay && !ui.tafel) oeffneZimmer(index, 0);
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
