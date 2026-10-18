/*
 * train-bau.js – Die Bauecke: fünf Häuser an einer Strasse, Stockwerk für
 * Stockwerk gebaut und Zimmer für Zimmer eingerichtet.
 * ---------------------------------------------------------------------------
 * Konzept: docs/BAUECKE-KONZEPT.md. Hier steht, was man sieht und antippt:
 *
 *   Hausansicht   ein Haus im Querschnitt, darüber der Umschalter für die vier
 *                 Häuser, rechts die Ziegel und der Rätsel-Knopf. Ziehen
 *                 schiebt das Haus hinauf und hinunter, Wischen zur Seite
 *                 wechselt das Haus, zwei Finger zoomen bis zum ganzen Haus
 *                 (wie der Ansicht-Knopf unten links). Im Wohnhaus sind die Wohnungen (ein
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
 *   Überraschung  etwa jede halbe Stunde braust ein Blitzzug über das Gleis,
 *                 und ein Glücksstern versteckt sich in einem Zimmer: Wer sie
 *                 antippt, bekommt je eine Palette.
 *   Sterne        links zählt die Sternenleiter alle Sterne des Dorfs; jede
 *                 Stufe bringt dem Dorf etwas ins Bild. Wer alle Sterne hat,
 *                 trägt eine Krone; eine Wohnung voller Sterne hat einen
 *                 goldenen, glitzernden Rahmen.
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
  const W = () => window.LernappBauWetter || null;
  const SCH = () => window.LernappBauSchmuck || null;
  const SP = () => window.LernappBauSpiele || null;
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
  // Wer im Dorf wohnt (bau-katalog.js, VOLK): Tiere oder Menschen – für die
  // Sätze ("die Tiere", "ein Tier", "Tiere").
  const wer = () => K().VOLK?.[S().volk?.() || "tiere"] || { name: "Tiere", wer: "die Tiere", ein: "ein Tier", viele: "Tiere" };
  const menschen = () => S().volk?.() === "menschen";
  // Wer nachts wach ist: die Eule und die Fledermaus.
  const NACHTAKTIV = ["owl", "bat"];

  // Sprechen: jedes Antippen von etwas, das man wählt, wird vorgelesen – so
  // hat es sich der Auftraggeber gewünscht. Ist das Vorlesen ausgeschaltet
  // (kids.js, lernapp.tts), bleibt es still.
  function sag(text) {
    if (!text) return;
    kids()?.speak?.(text);
  }
  // Die Hilfe wechselt oft gleich nach einer Ansage (sag, dann hilfe); die
  // Ansage soll trotzdem zu Ende kommen.
  function hilfe(text) { kids()?.setHelp?.(text || "", { ansageBleibt: true }); }
  // Die Spiele (bau-spiele.js) sagen "wrong" – kids.js kennt dafür "retry".
  function klang(name) { kids()?.playJingle?.(name === "wrong" ? "retry" : name); }

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
    kamera: { ty: 0, tx: 0, vy: 0, min: 0, max: 0, skala: 1, welt: null, stufe: 0, basis: 1, ganz: 1 },
    auswahl: null,         // Kennung des gewählten Dings im Zimmer
    schublade: "zimmer",
    rueck: [],             // Rückgängig-Schritte im Zimmer
    tafel: null,           // offene Tier-Tafel { seed }
    overlay: null,         // offene Wahl (Haus, Stockwerk, Zimmerart, Fassade)
    ordnen: false,         // Stockwerke umstellen
    dorf: false,           // alle Häuser auf einen Blick (dritte Stufe der Ansicht)
    leiter: false,         // die Sternenleiter ist offen
    blitz: null,           // ein Blitzzug, der gerade vorbeibraust
    heli: null,            // ein Rettungshelikopter, der gerade vorbeifliegt
    album: false,          // das Sammelalbum ist offen
    ruhm: false,           // die Ruhmeshalle ist offen
    spiel: null,           // ein Spiel in einem Zimmer läuft (schliessen)
    wetter: null,          // Jahreszeit und Wetter (bau-wetter.js)
    stern: null,           // wo sich der Glücksstern versteckt
    leiterBekannt: 0,      // wie viele Stufen der Sternenleiter schon gefeiert sind
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
  // Wie hoch jedes Stockwerk des Hauses im Bild ist: die zwei eines KiddyDome
  // so hoch wie früher (ZH_HOCH), alle anderen ZH (bau-art.js).
  function stockHoehen() {
    return (aktHaus()?.stock || []).map((st) => (st.art === "oben" || S().istDoppel(st) ? A().ZH_HOCH : A().ZH));
  }
  // Wo ein Zimmer-Inhalt im Haus liegt: Sein Boden (Zimmer-Einheiten
  // BODEN_Y) auf dem Boden des Stockwerks.
  function inhaltY(index) { return A().unten(index) - A().BODEN_Y; }

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
    ui.leiter = false;
    ui.overlay = null;
    ui.ordnen = false;
    ui.dorf = false;
    ui.besetzt = false;
    ui.kommt = "";
    ui.blitz = null;
    ui.heli = null;
    ui.stern = null;
    ui.album = false;
    ui.ruhm = false;
    ui.spiel = null;
    ui.kamera.stufe = 0;
    pinch = null;
    try { ui.nacht = localStorage.getItem("lernapp.bau.nacht") === "1"; } catch { ui.nacht = false; }
    const gewaehlt = stand().gewaehlt;
    ui.haus = S().HAUS_IDS.includes(gewaehlt) ? gewaehlt : (zuletztHaus() || "wohnhaus");

    host.classList.add("bauecke");
    host.classList.toggle("is-nacht", ui.nacht);
    // Jahreszeit und Wetter (bau-wetter.js): Klassen, Himmel, Bäume, Schnee.
    ui.wetter = W()?.heute?.() || null;
    A().hoehenVon(stockHoehen);
    host.innerHTML = "";
    if (S().neuereFassung?.()) { zeigeNeuereFassung(); return; }

    els.himmel = el("div", "bau-himmel");
    els.himmel.innerHTML = `<div class="bau-sonne"></div><div class="bau-mond"></div><div class="bau-wolke w1"></div><div class="bau-wolke w2"></div>`;
    // Strasse, Gleis und Wiese über die ganze Breite: ein flaches Band hinter
    // dem Haus, das mit ihm wandert (zeigeWelt).
    els.boden = el("div", "bau-gelaende");
    els.bodenBand = el("div", "bau-gelaende-band");
    els.boden.append(els.bodenBand);
    els.welt = el("div", "bau-welt");
    // Alle vier Häuser nebeneinander: ein Bild so gross wie der Bildschirm.
    els.dorf = el("div", "bau-dorf");
    els.dorf.hidden = true;
    els.dorf.addEventListener("click", (e) => {
      const haus = e.target.closest?.("[data-dorf-haus]")?.getAttribute("data-dorf-haus");
      if (haus) verlasseDorf({ zu: haus });
    });
    // Unten links: das Haus gross oder ganz auf einem Bildschirm.
    els.ansicht = knopf("bau-ansichtknopf", "Das ganze Haus zeigen", "", () => wechsleAnsicht());
    els.umschalter = el("nav", "bau-umschalter", { "aria-label": "Die fünf Häuser" });
    els.hud = el("div", "bau-hud");
    // Links: alle Bewohner auf einen Blick – im Haus und beim Einrichten.
    els.bewohner = knopf("bau-bewohnerknopf", "Alle Bewohner", "", () => oeffneUebersicht());
    // Darunter: alle Sterne des Dorfs und die Sternenleiter, das Sammelalbum
    // und die Ruhmeshalle (mit dem Neustart).
    els.leiterKnopf = knopf("bau-leiterknopf", "Sternenleiter", "", () => oeffneLeiter());
    els.albumKnopf = knopf("bau-seitenknopf bau-albumknopf", "Sammelalbum", `${svgVon(ALBUM_ZEICHEN, "0 0 32 32")}<span>Album</span>`, () => oeffneAlbum());
    els.ruhmKnopf = knopf("bau-seitenknopf bau-ruhmknopf", "Ruhmeshalle", `${svgVon(POKAL_ZEICHEN, "0 0 32 32")}<span>Ruhm</span>`, () => oeffneRuhm());
    els.zimmer = el("div", "bau-zimmeransicht");
    els.zimmer.hidden = true;
    els.flug = el("div", "bau-flug");
    els.seite = el("div", "bau-seite");
    els.seite.append(els.albumKnopf, els.ruhmKnopf);
    host.append(els.himmel, els.boden, els.welt, els.dorf, els.ansicht, els.umschalter, els.hud, els.bewohner, els.leiterKnopf, els.seite, els.zimmer, els.flug);
    // Wolken und Regenbogen hinten im Himmel, Regen, Schnee und Blätter auf
    // einer einzigen bewegten Ebene zwischen Boden und Haus.
    if (ui.wetter && W()?.anwenden) ui.wetter = W().anwenden(host, els.himmel, els.welt, ui.wetter);
    // Die Verläufe der Tiere (bau-tiere.js): einmal für alle Bilder der Bauecke.
    const tierDefs = window.LernappBauTiere?.defs?.() || "";
    if (tierDefs) host.append(el("div", "bau-tierdefs", { "aria-hidden": "true", html: `<svg xmlns="${NS}" width="0" height="0" focusable="false"><defs>${tierDefs}</defs></svg>` }));
    els.tafel = null;
    els.uebersicht = null;
    els.leiter = null;
    els.album = null;
    els.ruhm = null;
    ui.leiterBekannt = S().sternenleiter().erreicht;

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
      if (grund === "neuer" || grund === "konto" || grund === "neustart") { mount({ host: ui.host, stage: ui.stage, onPlay: ui.onPlay }); return; }
      if (grund === "tragen" || grund === "bonus") { if (grund === "bonus") { aktualisiereLeiterKnopf(); pruefeLeiter(); } if (grund === "tragen" && !ui.besetzt && !zieht) { if (ui.zimmer >= 0) starteTiereZimmer(); else starteTiereHaus(); } return; }
      if (grund !== "ziegel") { pruefeAlleSterne(); pruefeLeiter(); }
      if (grund !== "zimmer" && grund !== "ziegel") pruefeTraumjobs();
      // Ist mit dem Ding der letzte Wunsch einer Stufe erfüllt, kommt die
      // Feier gleich – nicht erst mit dem nächsten Takt (zeitTick).
      if (grund === "zimmer") { aktualisiereSterne(); window.clearTimeout(ui.tickBald); ui.tickBald = window.setTimeout(zeitTick, 500); return; }
      if (grund === "ziegel") { aktualisiereHud(); pruefeLieferung(); return; }
      if (["cloud", "tier", "wunsch", "stufe", "baby", "weh", "gast"].includes(grund)) { auffrischen(); }
    });
    window.addEventListener("resize", beiGroesse);
    planeLifte();
    ui.tickUhr = window.setInterval(zeitTick, 4000);
    glitzerUhr = window.setInterval(glitzern, 480);
    zeitTick();
    hilfeHaus();

    if (!gewaehlt) zeigeHauswahl();
    else {
      pruefeLieferung();
      sageWetter();
    }
  }

  // Einmal am Tag sagt die Bauecke, welche Jahreszeit und welches Wetter ist
  // (und ob ein Fest ist): "Es ist Herbst. Heute regnet es."
  // Sie wartet, bis nichts anderes offen ist – sonst unterbräche sie, was
  // gerade gesagt wird.
  function sageWetter(versuch = 0) {
    const w = ui.wetter;
    if (!w?.text || versuch > 20) return;
    let gesagt = "";
    try { gesagt = localStorage.getItem("lernapp.bau.wetter") || ""; } catch { /* privater Modus */ }
    const heute = `${new Date().toDateString()}|${w.wetter}`;
    if (gesagt === heute) return;
    window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      if (!ruhig()) { sageWetter(versuch + 1); return; }
      try { localStorage.setItem("lernapp.bau.wetter", heute); } catch { /* privater Modus */ }
      const fest = w.festText || "";
      sag(`${w.text}${fest ? ` ${fest}` : ""}`);
    }, versuch ? 5000 : 1800);
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
    window.clearTimeout(leiterUhr);
    window.clearInterval(glitzerUhr);
    glitzerUhr = 0;
    window.clearTimeout(ui.tickBald);
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
    ui.blitz = null;
    pinch = null;
    zugEbenen.forEach((zug) => zug.ebene.remove());
    zugEbenen.clear();
    ui.spiel?.();
    ui.spiel = null;
    ui.heli = null;
    if (ui.host) ui.host.classList.remove("bauecke", "is-nacht", "ist-zimmer", "ist-ordnen", "kann-lesen", ...(W()?.KLASSEN || []));
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
    if (ui.spiel) { ui.spiel(); ui.spiel = null; return true; }
    if (ui.overlay) { schliesseOverlay(); return true; }
    if (ui.tafel) { schliesseTafel({ zurueck: true }); return true; }
    if (ui.album) { schliesseAlbum(); return true; }
    if (ui.ruhm) { schliesseRuhm(); return true; }
    if (ui.uebersicht) { schliesseUebersicht(); return true; }
    if (ui.leiter) { schliesseLeiter(); return true; }
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
    if (ui.besetzt || zieht || pinch) return;
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
      if (ui.dorf) els.dorf.innerHTML = dorfSvg();
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
    // Ein Kasten, der sagt, wie er gelesen wird (data-lies), geht vor – auch
    // wenn der Tipp auf einen Absatz darin fiel.
    const ziel = e.target.closest?.(".bau-lies[data-lies]") || e.target.closest?.(".bau-lies, .bau-tafel p, .bau-tafel h2, .bau-tafel h3, .bau-uebersicht h2, .bau-uebersicht h3, .bau-uebersicht p, .bau-wahl h2, .bau-wahl p, .bau-wahl h3");
    if (!ziel || e.target.closest("button")) return;
    sag(ziel.dataset.lies || lesbarerText(ziel));
    // Kurz hervorheben, was gerade vorgelesen wird.
    ziel.classList.add("is-liest");
    window.setTimeout(() => ziel.classList.remove("is-liest"), 1400);
  }
  function kannLesen() { return Boolean(kids()?.ttsEnabled?.()); }
  // Der Text eines Elements ohne das, was nur Schmuck ist (aria-hidden: ein
  // Smiley vor der Laune, ein Abzeichen).
  function lesbarerText(ziel) {
    const kopie = ziel.cloneNode(true);
    kopie.querySelectorAll('[aria-hidden="true"]').forEach((x) => x.remove());
    return kopie.textContent.replace(/\s+/g, " ").trim();
  }

  // ---------------------------------------------------------------------------
  // Was die Zeit tut: Wünsche wechseln, Tiere ziehen ein
  // ---------------------------------------------------------------------------
  function zeitTick() {
    if (!ui.host?.isConnected) return;
    ui.host.classList.toggle("kann-lesen", kannLesen());
    // Alle drei Stunden kann das Wetter wechseln (auf allen Geräten gleich).
    const w = W()?.heute?.();
    if (w && ui.wetter && (w.datum !== ui.wetter.datum || w.block !== ui.wetter.block)) {
      ui.wetter = W().anwenden(ui.host, els.himmel, els.welt, w);
      passeBoden();
      if (ui.zimmer < 0 && !ui.besetzt && !zieht && !pinch) zeichneHaus({ behalteKamera: true });
    }
    S().tick().forEach((e) => {
      if (e.typ === "stufe") feiereStufe(e);
      if (e.typ === "gross") window.setTimeout(() => sag(`${e.n} ist gross geworden! Bald zieht ${e.n} in eine eigene Wohnung.`), 400);
      if (e.typ === "abreise") zeigeAbreise(e);
    });
    pruefeZuzug();
    pruefeBlitzzug();
    pruefeGluecksstern();
    pruefeFeuerwerk();
    pruefeHeli();
    pruefeWeh();
    pruefeBaby();
    pruefeGast();
  }

  // Ob gerade nichts anderes läuft: in der Hausansicht, nichts offen.
  function ruhig() {
    return ui.zimmer < 0 && !ui.overlay && !ui.tafel && !ui.uebersicht && !ui.leiter && !ui.album && !ui.ruhm && !ui.spiel && !ui.besetzt && !ui.ordnen && !liefert && !ui.blitz && !ui.heli && !pinch && !ui.dorf && !zieht;
  }

  // Ein Band oben in der Mitte, ein paar Sekunden lang (wie bei allen Sternen).
  function band(bild, titel, text, cls = "") {
    ui.host.querySelector(".bau-sternband")?.remove();
    const b = el("div", `bau-sternband${cls ? ` ${cls}` : ""}`, { role: "status" });
    b.innerHTML = `${bild}<span class="bau-sternband-text"><b>${textSicher(titel)}</b><span>${textSicher(text)}</span></span>`;
    ui.host.append(b);
    window.setTimeout(() => b.classList.add("is-weg"), 4200);
    window.setTimeout(() => b.remove(), 4800);
    return b;
  }
  // Die Medaille einer Stufe (1 Bronze, 2 Silber, 3 Gold).
  function medaille(stufe, gross = 30) {
    const m = SCH()?.medaille?.(stufe);
    if (m) return svgVon(m, "-16 -20 32 40", `bau-medaille is-${["", "bronze", "silber", "gold"][stufe] || "bronze"}`).replace("<svg ", `<svg width="${gross}" height="${Math.round(gross * 1.25)}" `);
    return `<span class="bau-medaille-ersatz is-${["", "bronze", "silber", "gold"][stufe] || "bronze"}" aria-hidden="true">★</span>`;
  }

  // Ein Bewohner hat eine Stufe geschafft: Silber oder Gold – mit neuen,
  // schwierigeren Wünschen. Nach Gold ist er überglücklich (feiereAlleSterne).
  function feiereStufe(e) {
    const ref = S().findeTier(e.seed);
    if (!ref || e.fertig) return;
    const name = K().STUFEN?.[e.stufe - 2]?.name || "";
    const neu = K().STUFEN?.[e.stufe - 1]?.name || "";
    window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      klang("win");
      band(`${tierBildchen(ref.tier, 64, 76, "bau-sternband-tier")}${medaille(e.stufe - 1, 34)}`, `${name} geschafft!`, `${ref.tier.n} ist jetzt auf der Stufe ${neu} – mit neuen Wünschen.`, "is-stufe");
      if (ui.zimmer >= 0) kids()?.burstConfetti?.(els.zimmer, 50);
      else if (ref.hausId === ui.haus) {
        const svg = hausSvg();
        const st = S().stock(ref.hausId, ref.index);
        if (svg && st) feuerwerk(svg, A().ZX + S().breiteVon(st) / 2, inhaltY(ref.index) + S().obenVon(st) + 50, S().breiteVon(st));
      }
      for (const t of tiere.values()) if (t.tier.seed === e.seed) { t.huepf = 1; wecke(); }
      sag(`Juhui! ${ref.tier.n} hat die Stufe ${name} geschafft! ${ref.tier.n} hat neue Wünsche.`);
      if (ui.tafel) fuelleTafel();
      if (ui.uebersicht) fuelleUebersicht();
    }, ui.zimmer >= 0 ? 1300 : 300);
  }

  // Die letzte Stufe der Sternenleiter: Etwa alle drei Minuten steigt über
  // dem Haus ein Feuerwerk – nur in der Hausansicht und wenn sonst nichts läuft.
  let naechstesFeuerwerk = 0;
  function pruefeFeuerwerk() {
    if (!K().LEITER.slice(0, S().sternenleiter().erreicht).some((x) => x.id === "feuerwerk")) return;
    const jetzt = performance.now();
    if (!naechstesFeuerwerk) { naechstesFeuerwerk = jetzt + 60000; return; }
    if (jetzt < naechstesFeuerwerk) return;
    if (ui.zimmer >= 0 || ui.overlay || ui.tafel || ui.uebersicht || ui.leiter || ui.besetzt || ui.dorf || pinch || liefert || ui.blitz) return;
    naechstesFeuerwerk = jetzt + 150000 + Math.random() * 90000;
    const svg = hausSvg();
    const k = ui.kamera;
    // Oben im sichtbaren Teil des Hauses.
    const sichtOben = (kopfHoehe() - k.ty) / k.skala + k.y0;
    feuerwerk(svg, A().HB / 2, Math.max(hausOben() + 60, sichtOben + 160), A().HB);
    klang("win");
  }

  // ---------------------------------------------------------------------------
  // Das Spital: der Storch, Wehwehchen, der Rettungshelikopter
  // ---------------------------------------------------------------------------
  // Was durch den Himmel fliegt, liegt wie die Züge auf einer eigenen Ebene
  // (neueZugEbene) – oben im sichtbaren Teil des Bildes. Die Kästen um die
  // Zeichnungen aus bau-schmuck.js:
  const HELI_BOX = [-120, -52, 112, 52];
  const STORCH_BOX = [-72, -52, 80, 34];
  const HELI_MS = 7500;        // so lange braucht der Helikopter durchs Bild
  // Wo der Himmel im Bild ist (Haus-Einheiten): knapp unter dem Kopf.
  function himmelY(abstand = 90) {
    const k = ui.kamera;
    return (kopfHoehe() - k.ty) / k.skala + k.y0 + abstand;
  }
  function bildRaender() {
    const k = ui.kamera;
    const w = ui.host?.clientWidth || 800;
    return { links: -k.tx / k.skala + WX0, rechts: (w - k.tx) / k.skala + WX0 };
  }

  // Etwa jede halbe Stunde fliegt der Rettungshelikopter über das Dorf. Wer
  // ihn antippt, hilft ihm landen – wenn das Spital einen Notfall hat.
  function pruefeHeli() {
    if (!S().heliFaellig?.()) return;
    if (!ruhig() || !hausSvg() || !SCH()?.helikopter) return;
    starteHeli();
  }

  function starteHeli() {
    if (!hausSvg() || ui.heli || !SCH()?.helikopter) return false;
    const { links, rechts } = bildRaender();
    const ebene = neueZugEbene(SCH().helikopter(), HELI_BOX, { antippbar: true });
    const g = ebene.ebene;
    g.classList.add("bau-heli");
    g.setAttribute("role", "button");
    g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", "Der Rettungshelikopter – tippe ihn an!");
    const heli = { g, ebene, angetippt: false, fertig: false, t: 0, rotor: g.querySelector(".bau-rotor"), heck: g.querySelector(".bau-heckrotor") };
    ui.heli = heli;
    // Die Rotoren drehen sich in jedem Bild (ohne CSS-Animation).
    heli.drehe = (dt) => {
      if (heli.fertig) return false;
      heli.t += dt;
      const s = Math.cos(heli.t * 38);
      heli.rotor?.setAttribute("transform", `translate(0 -41) scale(${s.toFixed(2)} 1) translate(0 41)`);
      heli.heck?.setAttribute("transform", `rotate(${((heli.t * 1400) % 360).toFixed(0)} -106 -6)`);
      return true;
    };
    jedesBild.add(heli.drehe);
    const tipp = (e) => { e.stopPropagation(); e.preventDefault(); tippeHeli(heli); };
    g.addEventListener("pointerdown", tipp);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") tipp(e); });
    sag("Hörst du das? Der Rettungshelikopter kommt! Tippe ihn an.");
    const y = himmelY(70);
    if (reduced()) {
      setzeZugEbene(ebene, (links + rechts) / 2, y);
      window.setTimeout(() => heliVorbei(heli), 10000);
      return true;
    }
    const x0 = links - 130;
    const x1 = rechts + 140;
    setzeZugEbene(ebene, x0, y);
    heli.flug = tween(HELI_MS, (p) => setzeZugEbene(ebene, x0 + (x1 - x0) * p, y + Math.sin(p * 9) * 6), { e: ease.lin, delay: 300, done: () => heliVorbei(heli) });
    wecke();
    return true;
  }

  async function tippeHeli(heli) {
    if (heli.angetippt || heli.fertig || ui.heli !== heli) return;
    heli.angetippt = true;
    if (heli.flug) tweens.delete(heli.flug);
    const { gerettet } = S().heliVorbei(true);
    const x = heli.ebene.x;
    const y = heli.ebene.y;
    if (gerettet) {
      klang("win");
      band(svgVon(SCH().helikopter(), "-120 -52 232 104", "bau-sternband-heli").replace("<svg ", `<svg width="92" height="42" `), "Gerettet!", "Ein Stern für das Dorf.", "is-bonus");
      sag("Danke! Der Helikopter bringt einen Patienten in den Notfall. Dort wird ihm geholfen. Das gibt einen Stern für das Dorf!");
    } else {
      klang("correct");
      sag("Der Helikopter bringt einen Patienten. Aber im Spital gibt es noch keinen Notfall, wo er landen kann. Richte im Spital einen Notfall ein!");
    }
    // Kurz in der Luft stehen, dann davon.
    await tweenP(900, (p) => setzeZugEbene(heli.ebene, x, y - Math.sin(p * Math.PI) * 14), { e: ease.inOut });
    const { rechts } = bildRaender();
    await tweenP(1600, (p) => setzeZugEbene(heli.ebene, x + (rechts + 160 - x) * p, y - p * 60), { e: ease.in });
    heliVorbei(heli);
  }

  function heliVorbei(heli) {
    if (heli.fertig) return;
    heli.fertig = true;
    jedesBild.delete(heli.drehe);
    entferneZugEbene(heli.ebene);
    if (ui.heli === heli) ui.heli = null;
    if (!heli.angetippt) S().heliVorbei(false);
  }

  // Ab und zu bringt der Storch einem Bewohner des Wohnhauses ein Baby – wenn
  // es im Spital eine Geburtsabteilung gibt. Das Kind sieht es im Wohnhaus.
  function pruefeBaby() {
    if (ui.haus !== "wohnhaus" || !ruhig() || !hausSvg()) return;
    const fall = S().babyFaellig?.();
    if (!fall) return;
    if (fall.fehlt) {
      sag("Im Wohnhaus wünscht sich jemand ein Baby. Dafür braucht das Spital eine Geburtsabteilung!");
      return;
    }
    bringeBaby(fall);
  }

  async function bringeBaby(fall) {
    const ref = S().findeTier(fall.seed);
    if (!ref) return;
    besetze();
    const st = S().stock("wohnhaus", fall.index);
    const breite = S().breiteVon(st);
    // Zuerst zur Wohnung, dann kommt der Storch von links.
    kameraAuf(fall.index);
    await warte(650);
    const zielX = A().ZX + breite * 0.55;
    const zielY = inhaltY(fall.index) + S().obenVon(st) + 40;
    const storch = SCH()?.storch ? neueZugEbene(SCH().storch(), STORCH_BOX) : null;
    klang("unlock");
    sag("Schau, der Storch kommt!");
    if (storch && !reduced()) {
      const fluegel = storch.ebene.querySelector(".bau-fluegel");
      const { links } = bildRaender();
      const x0 = links - 90;
      const y0 = himmelY(60);
      let t = 0;
      const schlag = (dt) => { t += dt; fluegel?.setAttribute("transform", `rotate(${(Math.sin(t * 9) * 22 - 2).toFixed(1)} 2 -4)`); return !storch.fertig; };
      jedesBild.add(schlag);
      await tweenP(2600, (p) => setzeZugEbene(storch, x0 + (zielX - x0) * p, y0 + (zielY - y0) * ease.inOut(p) - Math.sin(p * Math.PI) * 40), { e: ease.lin });
      storch.fertig = true;
      jedesBild.delete(schlag);
    }
    const baby = S().bekommtBaby(fall.seed);
    ui.besetzt = false;
    zeichneHaus({ behalteKamera: true });
    if (storch && !reduced()) {
      const x = storch.x;
      const y = storch.y;
      const { rechts } = bildRaender();
      tween(1800, (p) => setzeZugEbene(storch, x + (rechts + 120 - x) * p, y - p * 160), { e: ease.in, done: () => entferneZugEbene(storch) });
    } else if (storch) entferneZugEbene(storch);
    if (!baby) return;
    const svg = hausSvg();
    if (svg) feuerwerk(svg, A().ZX + breite / 2, zielY + 10, breite);
    klang("win");
    for (const t of tiere.values()) if (t.tier.seed === `${fall.seed}~b` || t.tier.seed === fall.seed) { t.huepf = 1; wecke(); }
    band(tierBildchen({ a: baby.a, n: baby.n, seed: `${fall.seed}~b`, istBaby: true, eltern: fall.seed }, 54, 64, "bau-sternband-tier"), "Ein Baby!", `${baby.n} ist da. Ein Stern für das Dorf.`, "is-baby");
    sag(`Juhui, ein Baby! ${ref.tier.n} hat ein Baby bekommen. Es heisst ${baby.n}. Das gibt einen Stern für das Dorf! Tippe auf die Sterne am Lift, dann siehst du, was das Baby braucht.`);
    aktualisiereLeiterKnopf();
  }

  // Ab und zu hat ein Bewohner ein Wehwehchen. Er sagt es – wer ihn antippt,
  // kann ihn ins Spital bringen.
  function pruefeWeh() {
    if (!ruhig()) return;
    const fall = S().wehFaellig?.();
    if (!fall) return;
    const ref = S().findeTier(fall.seed);
    const weh = K().WEH?.[fall.art];
    if (!ref || !weh) return;
    window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      blaseAnSeed(fall.seed, "Aua! 🤕", 3600);
      sag(`Oh je, ${ref.tier.n} hat ein Wehwehchen! ${weh.ich} Tippe auf die Sterne am Lift, dann kannst du helfen.`);
    }, 500);
  }

  // Ins Spital: Welche Abteilung hilft? Die Karten zeigen alle Abteilungen
  // des Spitals, die es gibt und die es noch nicht gibt.
  function zeigeSpitalWahl(seed) {
    const ref = S().findeTier(seed);
    const weh = K().WEH?.[ref?.tier?.weh?.art];
    if (!ref || !weh) return;
    const n = ref.tier.n;
    const raeume = K().HAUS.spital.raeume.filter((id) => !["empfang", "spitalcafeteria", "bettenstation"].includes(id));
    kartenWahl({
      cls: "is-raumwahl is-spitalwahl",
      titel: `Wohin bringst du ${n}?`,
      frage: `Wo hilft man bei diesem Wehwehchen? ${weh.ich}`,
      karten: raeume.map((id) => {
        const r = K().RAEUME[id];
        return { id, name: r.name, der: r.der, text: r.text, bild: dingBild(r.icon, 56), schon: !zimmerFehlt("spital", id) };
      }),
      okText: "Dorthin bringen ✓",
      weiter: (raumId) => heileIn(seed, raumId),
    });
  }

  function heileIn(seed, raumId) {
    const ref = S().findeTier(seed);
    const weh = K().WEH?.[ref?.tier?.weh?.art];
    if (!ref || !weh) return "";
    const n = ref.tier.n;
    const raum = K().RAEUME[raumId];
    const ergebnis = S().heile(seed, raumId);
    if (ergebnis === "geheilt") {
      klang("win");
      band(tierBildchen(ref.tier, 54, 64, "bau-sternband-tier"), "Geholfen!", `${n} geht es besser. Ein Stern für das Dorf.`, "is-bonus");
      sag(`${weh.richtig} Jetzt geht es schon viel besser. Das gibt einen Stern für das Dorf!`);
      if (ui.zimmer >= 0) kids()?.burstConfetti?.(els.zimmer, 40);
      for (const t of tiere.values()) if (t.tier.seed === seed) { t.huepf = 1; wecke(); }
      aktualisiereLeiterKnopf();
      if (ui.tafel) fuelleTafel();
    } else if (ergebnis === "fehlt") {
      sag(`Richtig, ${raum?.der || "diese Abteilung"} würde helfen! Aber im Spital gibt es diese Abteilung noch nicht, oder es steht noch nichts darin. Richte ${(raum?.der || "sie").replace(/^der /, "den ")} im Spital ein!`);
      if (zimmerFehlt("spital", raumId)) window.setTimeout(() => zeigeZimmerBauen("spital", raumId), 2600);
    } else if (ergebnis === "falsch") {
      klang("retry");
      sag(`Hmm, ${raum?.der || "dort"} kann bei diesem Wehwehchen nicht helfen. Versuch es mit einer anderen Abteilung!`);
    }
    return ergebnis;
  }

  // ---------------------------------------------------------------------------
  // Das Hotel: Feriengäste kommen und reisen ab
  // ---------------------------------------------------------------------------
  // In ein Gästezimmer mit Bett kommt ab und zu ein Feriengast – wenn es eine
  // Rezeption gibt. Das Kind sieht ihn ankommen, wenn es im Hotel ist; sonst
  // zeigt der Umschalter einen Punkt am Hotel.
  function pruefeGast() {
    const tab = els.umschalter?.querySelector(`.bau-tab[data-haus="hotel"]`);
    if (!ruhig()) return;
    const fall = S().gastFaellig?.();
    tab?.classList.toggle("hat-neues", Boolean(fall?.hausId) && ui.haus !== "hotel");
    if (!fall) return;
    if (fall.fehlt) {
      if (ui.haus === "hotel") sag("Im Hotel ist ein Gästezimmer bereit. Aber für Feriengäste braucht es zuerst eine Rezeption!");
      return;
    }
    if (ui.haus !== "hotel") return;
    const gast = S().gastKommt(fall.index);
    if (gast) zeigeGastAnkunft(fall.index, gast);
  }

  async function zeigeGastAnkunft(index, gast) {
    kameraAuf(index);
    zeichneHaus({ behalteKamera: true });
    await warte(500);
    if (!ui.host?.isConnected) return;
    const svg = hausSvg();
    const st = S().stock("hotel", index);
    if (svg && st) leuchte(svg, index, A().ZX + S().breiteVon(st) * 0.4, inhaltY(index) + S().GEO.STAND - 30);
    klang("unlock");
    for (const t of tiere.values()) if (t.tier.seed === gast.seed) { t.huepf = 1; wecke(); }
    band(tierBildchen(gast, 54, 64, "bau-sternband-tier"), "Ein Feriengast!", `${gast.n} ist im Hotel angekommen.`, "is-gast");
    sag(`Ein Feriengast ist angekommen: ${gast.n}, ${K().TIERE[gast.a]?.der || ""}. Tippe auf den Gast, dann siehst du seine Wünsche.`);
    window.setTimeout(() => blaseAnSeed(gast.seed, "Hallo! Ich mache hier Ferien! 🧳", 3400), 800);
  }

  // Ein Gast reist ab und gibt dem Hotel Sterne. Fünf Sterne bringen dem
  // Dorf einen Stern.
  function zeigeAbreise(e) {
    window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      const sterne = Math.max(1, Math.min(5, Number(e.sterne) || 1));
      const reihe = `<span class="bau-gaststerne" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<i class="bau-stern is-gold${n <= sterne ? " is-voll" : ""}"></i>`).join("")}</span>`;
      band(`${tierBildchen({ a: e.a, n: e.n, seed: `abreise-${e.n}` }, 54, 64, "bau-sternband-tier")}${reihe}`, `${e.n} reist ab`,
        sterne === 5 ? "Fünf Sterne für das Hotel! Ein Stern für das Dorf." : `${sterne} ${sterne === 1 ? "Stern" : "Sterne"} für das Hotel.`, "is-gast");
      if (sterne === 5) { klang("win"); aktualisiereLeiterKnopf(); }
      sag(sterne === 5
        ? `${e.n} reist ab. Alles war perfekt! Fünf Sterne für das Hotel! Das gibt einen Stern für das Dorf.`
        : `${e.n} reist ab. Das Hotel bekommt ${sterne === 1 ? "einen Stern" : `${sterne} Sterne`}. Beim nächsten Gast klappt es noch besser!`);
      if (ui.haus === "hotel" && ui.zimmer < 0 && !ui.besetzt && !zieht) zeichneHaus({ behalteKamera: true });
      if (ui.tafel?.gast) fuelleTafel();
    }, 600);
  }

  // Ein Tipp auf eine Figur: ein Bewohner oder ein Feriengast.
  function oeffneTierOderGast(seed) {
    if (S().findeTier(seed)) { oeffneTafel(seed); return; }
    if (S().findeGast?.(seed)) oeffneGastTafel(seed);
  }

  // Ein neues Tier zieht ein – aber nur, wenn das Kind es sieht: im Wohnhaus,
  // in der Hausansicht, mit nichts anderem offen. Sonst zeigt der Umschalter,
  // dass im Wohnhaus jemand wartet.
  function pruefeZuzug() {
    const fall = S().zuzugFaellig();
    const tab = els.umschalter?.querySelector(`.bau-tab[data-haus="wohnhaus"]`);
    tab?.classList.toggle("hat-neues", Boolean(fall) && ui.haus !== "wohnhaus");
    if (!fall) return;
    if (ui.haus !== "wohnhaus" || ui.zimmer >= 0 || ui.overlay || ui.tafel || ui.uebersicht || ui.leiter || ui.besetzt || ui.ordnen || liefert || ui.blitz || pinch || ui.dorf) return;
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
      feuerwerk(svg, A().ZX + job.slot * HALB + breite / 2, inhaltY(job.index) + S().obenVon(st) + 50, breite);
    }
    seeds.forEach((seed) => window.setTimeout(() => blaseAnSeed(seed, "Mein Traumjob! 🌟", 3400), 700));
    // Haben jetzt alle drei einer Wohnung ihren Traumjob, sagt die Bauecke es.
    const voll = [...new Set(seeds.map((seed) => S().findeTier(seed)).filter(Boolean).map((r) => r.index))]
      .filter((index) => { const st = S().stock("wohnhaus", index); return st?.tiere.length === 3 && S().traumjobsStock("wohnhaus", index) === 3; });
    if (voll.length) {
      const erstes = S().stock("wohnhaus", voll[0]).tiere[0]?.n;
      window.setTimeout(() => sag(`Juhui! In der Wohnung von ${erstes} haben jetzt alle drei ihren Traumjob. Schau dir ihre Wohnung im Wohnhaus an!`), 4200);
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
      const anders = [...jetzt].some(([seed, hat]) => vorher.get(seed) !== hat);
      aktualisiereKronen();
      if (anders && ui.zimmer < 0 && !ui.besetzt && !zieht) zeichneHaus({ behalteKamera: true });
      if (anders && ui.zimmer >= 0) passeGoldAn();
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
      ui.host.querySelector(".bau-sternband")?.remove();
      const b = el("div", "bau-sternband", { role: "status" });
      b.innerHTML = `${tierBildchen(tier, 64, 76, "bau-sternband-tier")}` +
        `<span class="bau-sternband-text"><b>Alle Sterne!</b><span>${textSicher(tier.n)} ist überglücklich.</span></span>` +
        `<span class="bau-sternband-sterne" aria-hidden="true">${[1, 2, 3].map((n) => medaille(n, 30)).join("")}</span>`;
      ui.host.append(b);
      window.setTimeout(() => b.classList.add("is-weg"), 3800);
      window.setTimeout(() => b.remove(), 4400);
      if (ui.zimmer >= 0) kids()?.burstConfetti?.(els.zimmer, 60);
      else if (ref.hausId === ui.haus) {
        const svg = els.welt?.querySelector("svg");
        const st = S().stock(ref.hausId, ref.index);
        if (svg && st) feuerwerk(svg, A().ZX + S().breiteVon(st) / 2, inhaltY(ref.index) + S().obenVon(st) + 50, S().breiteVon(st));
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
    const wohnen = ui.haus === "wohnhaus" ? ` In den Wohnungen wohnen ${wer().wer}; tippe auf die Sterne am Lift, und du siehst, was sie sich wünschen.` : "";
    const hotel = ui.haus === "hotel" ? " In die Gästezimmer kommen Feriengäste, sobald es eine Rezeption gibt. Tippe auf einen Gast, dann siehst du seine Wünsche." : "";
    hilfe(`Das ist ${haus.der}. Tippe auf ein Zimmer, um es einzurichten.${wohnen}${hotel} Für ein neues Stockwerk brauchst du Ziegel: Tippe auf den Rätsel-Knopf. Mit dem Pfeil-Knopf stellst du die Stockwerke um. Oben wechselst du zwischen den fünf Häusern. Der Bewohner-Knopf links zeigt dir alle Bewohner auf einen Blick. Halte einen Bewohner mit dem Finger fest, dann kannst du ihn in ein anderes Zimmer tragen.`);
  }
  function hilfeZimmer() {
    hilfe("Zieh Dinge aus der Schublade ins Zimmer, oder tippe sie an. Tippe auf ein Ding im Zimmer, um es anzumalen, umzudrehen, grösser oder kleiner zu machen. Mit dem Pinsel malst du die Wand an, mit dem Boden-Knopf den Boden. Mit dem Stift änderst du, was für ein Zimmer es ist. Jedes passende Ding gibt dem Zimmer einen Platz mehr. Der Bewohner-Knopf links zeigt dir alle Bewohner und was ihnen noch fehlt.");
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
      // Sterne gibt es nur, wo jemand wohnt: im Wohnhaus. Bei Spital, Dorf
      // und Büro stünde immer eine 0.
      const mitSternen = id === "wohnhaus";
      const b = knopf(`bau-tab${id === ui.haus ? " is-aktiv" : ""}`, `${haus.name}: ${f.stockwerke} ${f.stockwerke === 1 ? "Stockwerk" : "Stockwerke"}${mitSternen ? `, ${f.sterne} Sterne` : ""}`,
        `${svgVon(A().hausZeichen(id), "0 0 24 24", "bau-tab-zeichen")}<span class="bau-tab-name">${haus.name}</span>${mitSternen ? `<span class="bau-tab-sterne">★ ${f.sterne}</span>` : ""}`,
        () => { if (id !== ui.haus) zeigeHaus(id, id > ui.haus ? 1 : -1); else sag(haus.der); });
      b.dataset.haus = id;
      els.umschalter.append(b);
    });
    zeigeSternTipp();
  }

  function wechsleHaus(richtung) {
    const ids = S().HAUS_IDS;
    const i = ids.indexOf(ui.haus);
    zeigeHaus(ids[(i + richtung + ids.length) % ids.length], richtung);
  }

  // Ein anderes Haus: das alte gleitet hinaus, das neue herein.
  async function zeigeHaus(id, richtung = 1, { stockwerk = -1, ohneSprache = false } = {}) {
    if (ui.besetzt || !K().HAUS[id]) return;
    if (ui.dorf) {
      ui.dorf = false;
      els.dorf.hidden = true;
      els.dorf.innerHTML = "";
      els.welt.style.visibility = "";
      els.boden.style.visibility = "";
      zeigeAnsichtKnopf();
    }
    if (ui.zimmer >= 0) await schliesseZimmer(true);
    if (ui.tafel) schliesseTafel();
    if (ui.uebersicht) schliesseUebersicht({ weiter: true });
    if (ui.leiter) { ui.leiter = false; if (els.leiter) els.leiter.hidden = true; }
    if (ui.ordnen) schalteOrdnen(false, { stumm: true });
    besetze();
    const weg = richtung >= 0 ? -1 : 1;
    const breite = ui.host.clientWidth || 800;
    await tweenP(220, (p) => { zeigeWeltRund(ui.kamera.tx + weg * breite * 0.6 * p, ui.kamera.ty, { bodenTx: Math.round(ui.kamera.tx) }); els.welt.style.opacity = String(1 - p); }, { e: ease.in });
    ui.haus = id;
    merkeHaus(id);
    baueUmschalter();
    zeichneHaus({ stockwerk });
    const ziel = ui.kamera.tx;
    zeigeWeltRund(ziel - weg * breite * 0.6, ui.kamera.ty, { bodenTx: Math.round(ziel) });
    await tweenP(260, (p) => { zeigeWeltRund(ziel - weg * breite * 0.6 * (1 - p), ui.kamera.ty, { bodenTx: Math.round(ziel) }); els.welt.style.opacity = String(p); });
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
    aktualisiereLeiterKnopf();
  }

  // Der Bewohner-Knopf zeigt, wie viele Tiere im Wohnhaus wohnen.
  function aktualisiereBewohnerKnopf() {
    if (!els.bewohner) return;
    const n = S().alleTiere().length;
    const label = n ? `Alle Bewohner: ${n === 1 ? wer().ein : `${n} ${wer().viele}`}` : "Alle Bewohner";
    els.bewohner.innerHTML = `${svgVon(menschen() ? FIGUR : PFOTE, "0 0 32 32", "bau-bewohnerknopf-bild")}<span>Bewohner</span>${n ? `<b class="bau-bewohnerknopf-zahl">${n}</b>` : ""}`;
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

  // Ein Mensch als Zeichen (der Bewohner-Knopf im Dorf der Menschen).
  const FIGUR = `<circle cx="16" cy="9" r="5.6" fill="#ffffff"/><path d="M6.5 28c0-6.6 4.3-11.5 9.5-11.5s9.5 4.9 9.5 11.5z" fill="#ffffff"/>`;
  // Das Album und der Pokal für die Knöpfe links.
  const ALBUM_ZEICHEN = `<rect x="6" y="4" width="20" height="24" rx="3" fill="#ffffff"/><rect x="6" y="4" width="5" height="24" rx="2" fill="#ffd166"/>` +
    `<rect x="14" y="9" width="8" height="7" rx="1.5" fill="#7cc05e"/><circle cx="18" cy="21.5" r="3" fill="#ff7aa2"/>`;
  const POKAL_ZEICHEN = `<path d="M10 5h12v6a6 6 0 0 1-12 0z" fill="#ffd166"/><path d="M10 7H6.5a3.5 3.5 0 0 0 3.8 5M22 7h3.5a3.5 3.5 0 0 1-3.8 5" fill="none" stroke="#ffd166" stroke-width="2.2"/>` +
    `<rect x="14.5" y="16" width="3" height="5" fill="#ffd166"/><rect x="10" y="21" width="12" height="5" rx="1.5" fill="#ffffff"/>`;

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
    const untenVorher = vorher.map((_, i) => A().unten(i));
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
        const dy = untenVorher[alt] - A().unten(neu);
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

  // Die Welt (das Haus-SVG, eine eigene Ebene) und der Boden darunter
  // (Strasse, Gleis und Wiese über die ganze Breite) bewegen sich zusammen.
  // Der Boden ist keine eigene Ebene: Er malt nur, was zu sehen ist. Früher
  // reichten Strasse und Wiese im Haus-SVG 4000 Einheiten über das Haus
  // hinaus – die Ebene wurde rund 9500 × 4000 Bildpunkte gross, und auf dem
  // Tablet ging beim Zoomen der Grafikspeicher aus: Das Bild flackerte oder
  // zerfiel, bis die App neu startete.
  // bodenTx: wo der Boden steht, wenn er nicht mit dem Haus wandert (beim
  // Wechsel des Hauses gleitet nur das Haus hinaus).
  function zeigeWelt(tx, ty, { s = 1, origin = null, bodenTx = tx } = {}) {
    const zoom = s !== 1 ? ` scale(${s})` : "";
    els.welt.style.transform = `translate3d(${tx}px, ${ty}px, 0)${zoom}`;
    if (origin !== null) els.welt.style.transformOrigin = origin;
    if (!els.boden) return;
    els.boden.style.transform = `translate(${bodenTx}px, ${ty}px)${zoom}`;
    if (origin !== null) els.boden.style.transformOrigin = origin;
  }
  function zeigeWeltRund(tx, ty, opts) { zeigeWelt(Math.round(tx), Math.round(ty), opts); }
  // Der Boden im aktuellen Massstab: Seine Oberkante ist die Strasse.
  function passeBoden() {
    if (!els.bodenBand) return;
    const k = ui.kamera;
    const u = k.skala;
    // Das Band beginnt 20000 Bildpunkte links vom Haus; die Schwellen liegen
    // alle 34 Einheiten, die erste bei x = 14 (wie früher im Haus-SVG).
    const phase = (((14 - WX0) * u + 20000) % (34 * u) + 34 * u) % (34 * u);
    els.bodenBand.style.top = `${((0 - k.y0) * u).toFixed(1)}px`;
    // Im Winter (und an einem Schneetag) liegt Schnee auf Strasse und Wiese.
    const schnee = ui.wetter?.schneeLiegt && W()?.bodenSchnee ? `${W().bodenSchnee(u)}, ` : "";
    els.bodenBand.style.background = schnee + A().bodenStil(u, phase);
  }

  // Wie gross das Haus steht. Am grössten (basis) gemessen an den alten,
  // hohen Stockwerken (STOCK_HOCH) – so bleiben Dinge und Tiere gleich gross,
  // und seit die Stockwerke niedriger sind, passt mehr vom Haus ins Bild. Am
  // kleinsten (ganz) steht das ganze Haus auf einem Bildschirm, vom Plus (oder
  // Dach) bis unter das Gleis. Dazwischen liegt der Zoom: ui.kamera.stufe, 0
  // ist basis, 1 ist ganz. Zwei Finger und der Ansicht-Knopf unten links
  // ändern ihn; er bleibt beim Neuzeichnen und beim Wechsel des Hauses.
  const UNTER_GLEIS = 110;     // hier endet die Strasse samt Gleis (Haus-Einheiten)
  function messeWelt() {
    const k = ui.kamera;
    const w = ui.host.clientWidth || 800;
    const h = ui.host.clientHeight || 500;
    // Auf dem Tablet passen die drei Wohnungen vom Anfang samt Strasse ins Bild.
    const sichtbar = h < 520 ? 1.75 : 3.6;
    const basis = clamp(Math.min((w * 0.6) / A().HB, (h - 70) / (sichtbar * A().STOCK_HOCH)), 0.3, 1.6);
    // Bis 0.02: Auch vierzig Stockwerke voller KiddyDomes passen so noch auf
    // ein Handy quer.
    const ganz = clamp(Math.min((h - kopfHoehe() - 14) / (UNTER_GLEIS - hausOben()), (w * 0.94) / (A().HB + 180)), 0.02, basis);
    k.basis = basis;
    k.ganz = ganz;
    const skala = skalaVon(k.stufe);
    k.skala = skala;
    const anzahl = aktHaus().stock.length;
    const y0 = weltOben(anzahl);
    const weltH = (GRUND - y0) * skala;
    k.y0 = y0;
    k.tx = w / 2 - (A().HB / 2 - WX0) * skala;
    const grenzen = grenzenBei(skala);
    k.min = grenzen.min;
    k.max = grenzen.max;
    const svg = hausSvg();
    if (svg) {
      svg.setAttribute("width", String(Math.round((WX1 - WX0) * skala)));
      svg.setAttribute("height", String(Math.round(weltH)));
    }
    zugEbenen.forEach(passeZugEbene);
    passeBoden();
    zeigeAnsichtKnopf();
  }
  const kopfHoehe = () => ((ui.host?.clientHeight || 500) < 520 ? 64 : 84);
  const hausSvg = () => els.welt?.querySelector(".bau-haus-svg") || null;
  // Der Zoom als Massstab und zurück – in gleichen Schritten (geometrisch).
  function skalaVon(stufe) {
    const k = ui.kamera;
    return k.basis * (k.ganz / k.basis) ** clamp(Number(stufe) || 0, 0, 1);
  }
  function stufeVon(skala) {
    const k = ui.kamera;
    if (k.ganz >= k.basis * 0.999) return 0;
    return clamp(Math.log(skala / k.basis) / Math.log(k.ganz / k.basis), 0, 1);
  }
  // Wie weit die Kamera hinauf und hinunter darf, bei diesem Massstab. Unten:
  // der Boden der Welt am unteren Rand. Oben: das Plus (oder das Dach) knapp
  // unter der Kopfzeile – darüber ist nur Himmel. Ist die Welt niedriger als
  // das Bild, steht sie unten.
  function grenzenBei(skala) {
    const h = ui.host.clientHeight || 500;
    const k = ui.kamera;
    const min = h - (GRUND - k.y0) * skala;
    return { min, max: Math.max(min, kopfHoehe() + 10 - (hausOben() - k.y0) * skala) };
  }

  function setzeKamera() {
    ui.kamera.ty = clamp(ui.kamera.ty, ui.kamera.min, ui.kamera.max);
    zeigeWeltRund(ui.kamera.tx, ui.kamera.ty);
  }

  // Während zwei Finger zoomen oder der Ansicht-Knopf gleitet, wird die Welt
  // nur verkleinert (eine Ebene, schnell); erst am Ende zeichnet sie im neuen
  // Massstab (zoomUebernehmen) – wieder scharf. Das Haus bleibt waagrecht in
  // der Mitte.
  function zoomZeigen(skala, ty) {
    const k = ui.kamera;
    const w = ui.host.clientWidth || 800;
    const tx = w / 2 - (A().HB / 2 - WX0) * skala;
    zeigeWeltRund(tx, ty, { s: Number((skala / k.skala).toFixed(4)) });
  }
  function zoomUebernehmen(skala, ty) {
    const k = ui.kamera;
    k.stufe = stufeVon(skala);
    messeWelt();
    k.ty = ty;
    setzeKamera();
  }

  // Wo ein Zimmer auf dem Bildschirm steht (für die Kamera und den Zoom).
  function zimmerAufSchirm(index, slot = 0) {
    const k = ui.kamera;
    const st = S().stock(ui.haus, index);
    const breite = S().breiteVon(st);
    const y = (inhaltY(index) + S().obenVon(st) - k.y0) * k.skala + k.ty;
    const x = (A().ZX + slot * HALB - WX0) * k.skala + k.tx;
    return { x, y, w: breite * k.skala, h: S().hoeheVon(st) * k.skala };
  }

  // Der erste Blick auf ein Haus: Passt es ganz ins Bild – samt dem Plus für
  // das nächste Stockwerk –, steht es ganz da. Sonst sieht man die unteren
  // Stockwerke und die Strasse.
  function kameraStart() {
    const k = ui.kamera;
    k.ty = startTy(k.skala);
    setzeKamera();
  }
  // Wo die Kamera bei diesem Massstab für den ersten Blick steht.
  function startTy(skala) {
    const h = ui.host.clientHeight || 500;
    const hoehe = (UNTER_GLEIS - hausOben()) * skala;
    // Passt alles samt Gleis ins Bild, steht es ganz da (oben knapp unter der
    // Kopfzeile); sonst sieht man die unteren Stockwerke und die Strasse.
    const { min, max } = grenzenBei(skala);
    return hoehe <= h - kopfHoehe() - 10 ? max : min;
  }
  // Das Oberste am Haus: das Plus fürs nächste Stockwerk, sonst das Dach.
  function hausOben() {
    if (hatPlus()) return plusY() - A().ZH - 20;
    return A().oben(aktHaus().stock.length - 1) - A().DECKE - (A().DACH_H[K().HAUS[ui.haus].dachForm] || 120) - 20;
  }
  // Ob über dem Dach das Plus steht: nur, wenn Ziegel da sind (oder die
  // Schranke wartet). Ohne Ziegel wäre es ein Knopf, der nichts tut; dann
  // zeigt der Rätsel-Knopf den Weg.
  function hatPlus() {
    const kann = S().kannBauen(ui.haus);
    return !ui.ordnen && (kann.ok || kann.grund === "schranke");
  }
  function plusMarkup() {
    if (!hatPlus()) return "";
    const kann = S().kannBauen(ui.haus);
    return `<g class="bau-naechster${kann.ok ? " is-bereit" : ""}" data-ziel="plus" role="button" tabindex="0" aria-label="Ein neues Stockwerk bauen">${A().naechsterStock(plusY())}</g>`;
  }
  // Das Plus neu, ohne das ganze Haus neu zu zeichnen (nach einer Lieferung):
  // Ein neues Bild des ganzen Hauses kostete auf dem Tablet ein Flackern.
  function erneuerePlus() {
    const svg = hausSvg();
    if (!svg) return;
    svg.querySelector(".bau-naechster")?.remove();
    const markup = plusMarkup();
    if (markup) svg.querySelector(".bau-zuglage")?.insertAdjacentHTML("beforebegin", markup);
    ui.gezeichnet = zeichenStand();
    // Das Plus gehört zum ganzen Haus: Der kleinste Zoom rechnet neu.
    const vorher = ui.kamera.ty;
    messeWelt();
    ui.kamera.ty = vorher;
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
    const ziel = clamp(kopfHoehe() + 10 - (plusY() - A().ZH - 20 - k.y0) * k.skala, k.min, k.max);
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
    const ziel = kameraZiel(doppel ? A().oben(unten) - A().DECKE / 2 : A().oben(index) + A().hoehe(index) / 2);
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
    let s = hausDefs();
    s += hausInhalt();
    s += `<g class="bau-zuglage"></g><g class="bau-einzuglage" pointer-events="none"></g>`;
    const svg = `<svg xmlns="${NS}" class="bau-haus-svg${ui.nacht ? " is-nacht" : ""}" viewBox="${WX0} ${y0} ${WX1 - WX0} ${GRUND - y0}" width="${Math.round((WX1 - WX0) * ui.kamera.skala)}" height="${Math.round((GRUND - y0) * ui.kamera.skala)}" role="img" aria-label="${hausInfo.name} mit ${anzahl} ${anzahl === 1 ? "Stockwerk" : "Stockwerken"}">${s}</svg>`;
    // Nur das Haus-SVG wird ersetzt: Ein Zug, der gerade auf seiner eigenen
    // Ebene fährt (zugEbene), fährt weiter.
    const vorlage = document.createElement("template");
    vorlage.innerHTML = svg;
    const altesSvg = hausSvg();
    if (altesSvg) altesSvg.replaceWith(vorlage.content.firstElementChild);
    else els.welt.prepend(vorlage.content.firstElementChild);
    ui.gezeichnet = zeichenStand();
    ui.kamera.anzahl = anzahl;
    ui.kamera.hausGezeichnet = ui.haus;
    if (stockwerk >= 0) kameraAuf(stockwerk, false);
    else if (behalteKamera || warAlt) { ui.kamera.ty = vorher; setzeKamera(); }
    else kameraStart();
    starteTiereHaus();
  }

  // Was jedes Haus-Bild braucht: Schatten, die Umrisse der Zimmer, Glanz.
  function hausDefs() {
    const art = A();
    return `<defs><linearGradient id="bau-lift-schatten" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.12"/><stop offset="0.3" stop-color="#000" stop-opacity="0"/></linearGradient>` +
      `<clipPath id="bau-clip-voll"><rect x="0" y="${art.OBEN_Y}" width="${art.ZW}" height="${art.ZH}"/></clipPath>` +
      `<clipPath id="bau-clip-halb"><rect x="0" y="${art.OBEN_Y}" width="${HALB}" height="${art.ZH}"/></clipPath>` +
      `<clipPath id="bau-clip-doppel"><rect x="0" y="${-S().GEO.STOCK}" width="${art.ZW}" height="${S().GEO.H + S().GEO.STOCK}"/></clipPath>` +
      `<radialGradient id="bau-glanz"><stop offset="0" stop-color="#fff6c2" stop-opacity="0.75"/><stop offset="1" stop-color="#fff6c2" stop-opacity="0"/></radialGradient></defs>`;
  }

  // Das Haus ui.haus als SVG-Inhalt: Bäume, Stockwerke, Rahmen, Lift, Dach.
  // Für das Dorf (alle vier Häuser) ohne den Schmuck der Sternenleiter, der
  // nur einmal dasteht, und ohne Plus und Umstellen.
  function hausInhalt({ schmuck = true, knoepfe = true } = {}) {
    const art = A();
    const haus = aktHaus();
    const anzahl = haus.stock.length;
    const hausInfo = K().HAUS[ui.haus];
    const stufen = S().sternenleiter().erreicht;
    let s = `<g class="bau-hintergrund">`;
    if (schmuck) s += schmuckMarkup("hinten", stufen);
    // Die Bäume je nach Jahreszeit (bau-wetter.js), dazu was zur Jahreszeit
    // und zu einem Fest an die Strasse gehört.
    const w = ui.wetter;
    const baum = (x, gross, nr) => (w && W()?.baum ? W().baum(x, gross, w.jahreszeit, nr) : art.baum(x, gross));
    s += baum(-260, 1.15, 0) + baum(-120, 0.9, 1) + art.laterne(-40) + baum(art.HB + 110, 1, 2) + art.laterne(art.HB + 40) + baum(art.HB + 260, 1.2, 3);
    if (schmuck && w && W()?.deko) s += `<g pointer-events="none">${W().deko(w.jahreszeit, w.fest)}</g>`;
    if (schmuck) s += schmuckMarkup("strasse", stufen);
    if (schmuck && ui.haus === "wohnhaus") s += ruhmMarkup();
    s += `</g>`;
    // Strasse, Gleis und Wiese zeichnet der Boden hinter dem Haus (zeigeWelt).
    // Die Stockwerke: je eine Reihe (die beim Umstellen wandert).
    let zimmerTeil = "";
    let liftTeil = "";
    for (let i = 0; i < anzahl; i += 1) {
      const st = haus.stock[i];
      zimmerTeil += `<g class="bau-stockreihe" data-stock="${i}">${stockMarkup(st, i)}${traumMarkup(st, i)}</g>`;
      liftTeil += `<g class="bau-lift" data-stock="${i}">${art.liftStock(i)}</g>`;
      if (st.tiere.length) liftTeil += `<g class="bau-tafelknopf" data-ziel="tafel" data-stock="${i}" role="button" tabindex="0" aria-label="Wer hier wohnt">${art.sternTafel(S().sterneStock(ui.haus, i), art.LX + art.LIFT / 2, art.oben(i) + 6)}</g>`;
    }
    s += zimmerTeil;
    // Über dem unteren Stockwerk eines KiddyDome geht keine Decke durch.
    const offen = haus.stock.map((st, i) => (S().istDoppel(st) ? i : -1)).filter((i) => i >= 0);
    s += `<g class="bau-rahmen">${art.hausRahmen(haus, anzahl, offen)}</g>`;
    for (let i = 0; i < anzahl; i += 1) if (haus.stock[i].art === "zwei") s += art.trennwand(i, haus.fassade);
    // Alle in einer Wohnung haben alle Sterne: ein goldener Rahmen, der glitzert.
    for (let i = 0; i < anzahl; i += 1) if (wohnungStrahlt(haus.stock[i])) s += `<g class="bau-sternrahmen" data-stock="${i}" pointer-events="none">${art.sternRahmen(i)}</g>`;
    s += liftTeil;
    const dachY = art.oben(anzahl - 1) - art.DECKE;
    s += `<g class="bau-dach">${art.dach(hausInfo.dachForm, haus.dach, haus.fassade, dachY, { sterne: ui.haus === "hotel" ? S().hotelRuf() : 0 })}`;
    if (ui.wetter?.schneeLiegt && W()?.dachSchnee) s += `<g pointer-events="none">${W().dachSchnee(hausInfo.dachForm, dachY)}</g>`;
    s += `</g>`;
    s += schmuckMarkup("dach", stufen, hausInfo.dachForm, dachY);
    if (!knoepfe) return s;
    // Die Stelle für das nächste Stockwerk, über dem Dach (hatPlus).
    s += plusMarkup();
    if (ui.ordnen) s += ordnenMarkup(anzahl);
    return s;
  }

  // Ein Stockwerk in der Hausansicht: eine Wohnung, zwei Zimmer oder der
  // Rohbau – jedes Zimmer ein eigenes Ziel zum Antippen.
  function stockMarkup(st, i) {
    const art = A();
    const y = inhaltY(i);
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
      const hoehe = art.unten(i) - top;
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
    if (sternHier(hausId, index, slot)) s += sternMarkup();
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
  function nachtMarkup(z, breite, oben = S().GEO.OBEN) {
    const h = S().GEO.H - oben;
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
    aktualisiereKronen();
    aktualisiereLeiterKnopf();
    if (ui.zimmer >= 0) { zeichneZimmerKopf(); passeGoldAn(); }
    if (ui.tafel) fuelleTafel();
    if (ui.uebersicht) fuelleUebersicht();
  }

  // --- Antippen und Ziehen in der Hausansicht ------------------------------
  // Zwei Finger auf dem Haus zoomen: auseinander näher heran (bis zum
  // grössten Zoom), zusammen weiter weg (bis zum ganzen Haus). Der Punkt
  // zwischen den Fingern bleibt unter den Fingern.
  let pinch = null;   // { d0, s0, wy, s, ty, my }
  function weltEreignisse() {
    let zug = null;
    const finger = new Map();   // pointerId → { x, y }
    let nachPinch = false;      // nach dem Zoomen zählt der übrige Finger nicht
    const zwei = () => [...finger.values()].slice(0, 2);
    const abstand = () => { const [a, b] = zwei(); return Math.hypot(a.x - b.x, a.y - b.y); };
    const mitte = () => { const [a, b] = zwei(); return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
    // Auch auf dem Boden neben dem Haus lässt es sich ziehen und zoomen.
    const runter = (e) => {
      if (ui.zimmer >= 0 || e.button > 0) return;
      // Der erste Finger einer neuen Berührung: Was noch als «unten» galt, ist
      // längst weg (ein Loslassen, das nie ankam). Sonst hielte die Bauecke
      // jeden Tipp für den zweiten Finger eines Zooms – bis zum Neustart.
      if (e.isPrimary && finger.size) {
        finger.clear();
        zug = null;
        nachPinch = false;
        if (pinch) beendePinch();
      }
      finger.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { els.welt.setPointerCapture(e.pointerId); } catch { /* egal */ }
      if (finger.size === 2 && !ui.besetzt && !pinch && !zug?.tragen) {
        // Der zweite Finger: kein Tipp und kein Ziehen mehr, sondern Zoom.
        if (zug) window.clearTimeout(zug.halte);
        const k = ui.kamera;
        const m = mitte();
        zug = null;
        jedesBild.delete(schwung);
        k.vy = 0;
        pinch = { d0: Math.max(24, abstand()), s0: k.skala, wy: (m.y - k.ty) / k.skala + k.y0, s: k.skala, ty: k.ty, my: m.y };
        zoomZeigen(k.skala, k.ty);
        return;
      }
      if (finger.size > 1 || nachPinch || ui.besetzt) return;
      zug = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ty0: ui.kamera.ty, t0: performance.now(), bewegt: false, ziel: zielBei(e), verlauf: [] };
      ui.kamera.vy = 0;
      // Einen Bewohner einen Moment festhalten: Dann trägt ihn der Finger in
      // ein anderes Zimmer (oder über den Umschalter in ein anderes Haus).
      const z = zug;
      if (z.ziel?.getAttribute("data-ziel") === "tier" && !ui.ordnen) {
        z.halte = window.setTimeout(() => { if (zug === z && !z.bewegt && !pinch && finger.size === 1) beginneTragen(z); }, 420);
      }
    };
    // --- Tragen ---------------------------------------------------------------
    const raumUnter = (x, y) => (document.elementsFromPoint?.(x, y) || []).map((n) => n.closest?.('.bau-raum[data-ziel="zimmer"]')).find(Boolean) || null;
    const tabUnter = (x, y) => (document.elementsFromPoint?.(x, y) || []).map((n) => n.closest?.(".bau-tab[data-haus]")).find(Boolean) || null;
    const setzeGeist = (t, x, y) => { t.geist.style.transform = `translate3d(${Math.round(x - 35)}px, ${Math.round(y - 70)}px, 0)`; };
    const beginneTragen = (z) => {
      const seed = z.ziel.getAttribute("data-seed");
      const ref = S().findeTier(seed);
      if (!ref || ui.besetzt || !ui.host?.isConnected) return;
      const geist = el("div", "bau-trage", { "aria-hidden": "true" });
      geist.innerHTML = tierBildchen(ref.tier, 70, 84);
      els.flug.append(geist);
      z.tragen = { seed, ref, geist, raum: null, tab: null, tabSeit: 0 };
      z.ziel.setAttribute("opacity", "0.3");
      setzeGeist(z.tragen, z.x0, z.y0);
      kids()?.vibrate?.(18);
      klang("star");
      sag("Wohin soll es gehen?");
    };
    const bewegeTragen = (z, e) => {
      const t = z.tragen;
      setzeGeist(t, e.clientX, e.clientY);
      const raum = raumUnter(e.clientX, e.clientY);
      if (raum !== t.raum) { t.raum?.classList.remove("is-trageziel"); raum?.classList.add("is-trageziel"); t.raum = raum; }
      // Am oberen oder unteren Rand fährt das Haus mit.
      const h = ui.host.clientHeight || 600;
      const k = ui.kamera;
      if (e.clientY < kopfHoehe() + 50) { k.ty = Math.min(k.max, k.ty + 9); zeigeWeltRund(k.tx, k.ty); }
      else if (e.clientY > h - 70) { k.ty = Math.max(k.min, k.ty - 9); zeigeWeltRund(k.tx, k.ty); }
      // Über einem Haus im Umschalter: kurz warten, dann geht es dorthin.
      const tab = tabUnter(e.clientX, e.clientY);
      const id = tab?.dataset.haus || "";
      if (!id || id === ui.haus) { t.tab = null; return; }
      if (t.tab !== id) { t.tab = id; t.tabSeit = performance.now(); return; }
      if (performance.now() - t.tabSeit > 650 && !ui.besetzt) {
        t.tab = null;
        t.raum = null;
        const ziel = S().HAUS_IDS.indexOf(id) > S().HAUS_IDS.indexOf(ui.haus) ? 1 : -1;
        zeigeHaus(id, ziel, { ohneSprache: true }).then(() => sag(`${K().HAUS[id].der}. Lass los, wo es hin soll.`));
      }
    };
    const lasseFallen = (z, e) => {
      const t = z.tragen;
      t.geist.remove();
      t.raum?.classList.remove("is-trageziel");
      z.ziel?.removeAttribute?.("opacity");
      const raum = !ui.besetzt ? raumUnter(e.clientX, e.clientY) : null;
      if (!raum) { sag("Wieder zurück."); if (!ui.besetzt) starteTiereHaus(); return; }
      const index = Number(raum.getAttribute("data-stock"));
      const slot = Number(raum.getAttribute("data-slot")) || 0;
      const zi = S().zimmer(ui.haus, index, slot);
      const r = K().RAEUME[zi?.raum];
      if (!r) { starteTiereHaus(); return; }
      // Wo der Finger losliess: dort steht der Bewohner im Zimmer.
      const k = ui.kamera;
      const box = ui.host.getBoundingClientRect();
      const x = (e.clientX - box.left - k.tx) / k.skala + WX0 - (A().ZX + slot * HALB);
      // Mit einem Wehwehchen ins Spital: Hilft man dort?
      if (t.ref.tier.weh && ui.haus === "spital") {
        const erg = heileIn(t.seed, zi.raum);
        if (erg !== "geheilt") { starteTiereHaus(); return; }
      }
      if (!S().trage(t.seed, ui.haus, index, slot)) { starteTiereHaus(); return; }
      tierOrte.set(t.seed, { x, ziel: x, modus: "steht", richtung: 1 });
      starteTiereHaus();
      if (!(t.ref.tier.weh && ui.haus === "spital")) sag(`${r.der}! Ein Besuch für eine Weile.`);
      for (const tt of tiere.values()) if (tt.tier.seed === t.seed) { tt.huepf = 1; wecke(); }
      window.setTimeout(() => blaseAnSeed(t.seed, "Hier gefällt es mir! 😊", 2600), 500);
    };
    const zieht = (e) => {
      if (finger.has(e.pointerId)) finger.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (zug?.tragen && e.pointerId === zug.id) { bewegeTragen(zug, e); return; }
      if (pinch && finger.size >= 2) {
        const k = ui.kamera;
        const m = mitte();
        let s = (pinch.s0 * abstand()) / pinch.d0;
        // Über die Grenzen hinaus nur zäh, wie ein Gummiband.
        if (s < k.ganz) s = k.ganz * (s / k.ganz) ** 0.3;
        if (s > k.basis) s = k.basis * (s / k.basis) ** 0.3;
        pinch.s = s;
        pinch.my = m.y;
        pinch.ty = m.y - (pinch.wy - k.y0) * s;
        zoomZeigen(s, pinch.ty);
        return;
      }
      if (!zug || e.pointerId !== zug.id) return;
      const dx = e.clientX - zug.x0;
      const dy = e.clientY - zug.y0;
      // Ein Kinderfinger wackelt beim Tippen: erst ab 14 Bildpunkten ist es Ziehen.
      if (!zug.bewegt && Math.hypot(dx, dy) > 14) { zug.bewegt = true; window.clearTimeout(zug.halte); }
      if (!zug.bewegt) return;
      const k = ui.kamera;
      let ty = zug.ty0 + dy;
      // Gummiband am Ende
      if (ty > k.max) ty = k.max + (ty - k.max) * 0.35;
      if (ty < k.min) ty = k.min + (ty - k.min) * 0.35;
      k.ty = ty;
      zeigeWeltRund(k.tx + (Math.abs(dx) > Math.abs(dy) * 1.4 ? dx * 0.35 : 0), k.ty);
      zug.verlauf.push({ t: performance.now(), y: e.clientY });
      if (zug.verlauf.length > 6) zug.verlauf.shift();
    };
    const ende = (e) => {
      finger.delete(e.pointerId);
      if (pinch) {
        if (finger.size < 2) beendePinch();
        nachPinch = finger.size > 0;
        return;
      }
      if (finger.size === 0) nachPinch = false;
      if (!zug || e.pointerId !== zug.id) return;
      const z = zug;
      zug = null;
      window.clearTimeout(z.halte);
      if (z.tragen) { lasseFallen(z, e); return; }
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
    [els.welt, els.bodenBand].forEach((ziel) => {
      ziel.addEventListener("pointerdown", runter);
      ziel.addEventListener("pointermove", zieht);
      ziel.addEventListener("pointerup", ende);
      ziel.addEventListener("pointercancel", ende);
    });
    // Geht der Finger verloren (das Haus wird neu gezeichnet, ein Fenster geht
    // auf), kommt sein Loslassen nicht mehr hier an.
    els.welt.addEventListener("lostpointercapture", (e) => { if (finger.has(e.pointerId)) ende(e); });
    els.welt.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const ziel = e.target.closest?.("[data-ziel]");
      if (ziel) { e.preventDefault(); tippeWelt(ziel); }
    });
  }

  // Die Finger sind weg: Der Zoom bleibt, wo er ist – oder federt in die
  // Grenzen zurück –, und das Haus zeichnet sich scharf im neuen Massstab.
  function beendePinch() {
    const p = pinch;
    pinch = null;
    if (!p) return;
    const k = ui.kamera;
    const s1 = clamp(p.s, k.ganz, k.basis);
    const { min, max } = grenzenBei(s1);
    const ty1 = clamp(p.my - (p.wy - k.y0) * s1, min, max);
    if (Math.abs(s1 - p.s) < 1e-4 && Math.abs(ty1 - p.ty) < 0.5) { zoomUebernehmen(s1, ty1); return; }
    zoomGleiten(p.s, p.ty, s1, ty1, 220);
  }

  // Der Ansicht-Knopf unten links: das Haus gross (wie bisher) oder ganz auf
  // einem Bildschirm – und wieder zurück.
  function wechsleAnsicht() {
    if (ui.besetzt || ui.zimmer >= 0 || pinch) return;
    const k = ui.kamera;
    // Drei Stufen: das Haus gross, das ganze Haus, alle vier Häuser.
    if (ui.dorf) { verlasseDorf({ naeher: true }); return; }
    const schonGanz = k.ganz >= k.basis * 0.98 || k.stufe > 0.02;
    if (schonGanz) { zeigeDorf(); return; }
    const h = ui.host.clientHeight || 500;
    const zuGanz = k.stufe <= 0.02;
    const s1 = zuGanz ? k.ganz : k.basis;
    let ty1;
    if (zuGanz) ty1 = startTy(s1);
    else {
      // Näher heran: Was in der Mitte des Bildes steht, bleibt dort.
      const wy = (h / 2 - k.ty) / k.skala + k.y0;
      const { min, max } = grenzenBei(s1);
      ty1 = clamp(h / 2 - (wy - k.y0) * s1, min, max);
    }
    sag(zuGanz ? "Das ganze Haus." : "Wieder näher heran.");
    zoomGleiten(k.skala, k.ty, s1, ty1, 480);
  }
  // Von einem Zoom zum anderen gleiten: nur die Ebene verkleinert, am Ende
  // scharf im neuen Massstab.
  function zoomGleiten(s0, ty0, s1, ty1, dauer) {
    jedesBild.delete(schwung);
    besetze();
    tween(dauer, (p) => zoomZeigen(s0 * (s1 / s0) ** p, ty0 + (ty1 - ty0) * p), { e: ease.inOut, done: () => { zoomUebernehmen(s1, ty1); ui.besetzt = false; } });
  }
  function zeigeAnsichtKnopf() {
    const b = els.ansicht;
    if (!b) return;
    const k = ui.kamera;
    // Was der nächste Tipp zeigt: das ganze Haus, alle vier Häuser, wieder nah.
    const stufe = ui.dorf ? "nah" : (k.stufe > 0.02 || k.ganz >= k.basis * 0.98) ? "dorf" : "ganz";
    const label = { ganz: "Das ganze Haus zeigen", dorf: "Alle fünf Häuser zeigen", nah: "Wieder näher heran" }[stufe];
    if (b.dataset.stufe === stufe) return;
    b.dataset.stufe = stufe;
    b.classList.toggle("is-weit", stufe !== "ganz");
    b.innerHTML = svgVon({ ganz: GANZES_HAUS, dorf: ALLE_HAEUSER, nah: LUPE_PLUS }[stufe], "0 0 32 32");
    b.setAttribute("aria-label", label);
    b.title = label;
  }
  const GANZES_HAUS = `<path d="M4 10V4h6M28 10V4h-6M4 22v6h6M28 22v6h-6" fill="none" stroke="#3fbf74" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M10.5 16.5v7.5h11v-7.5" fill="#ffd3b5" stroke="#243047" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M8.5 17.5 16 11l7.5 6.5" fill="none" stroke="#ef5350" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<rect x="14.2" y="19" width="3.6" height="5" rx="0.8" fill="#8a5734"/>`;
  const ALLE_HAEUSER = `<path d="M4 10V4h6M28 10V4h-6M4 22v6h6M28 22v6h-6" fill="none" stroke="#3fbf74" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
    [7, 13, 19, 25].map((x, i) => `<rect x="${x - 2.4}" y="${[14, 11, 15, 12][i]}" width="4.8" height="${[10, 13, 9, 12][i]}" rx="0.8" fill="${["#ffd3b5", "#cfe8ff", "#ffe9a8", "#d9f2e3"][i]}" stroke="#243047" stroke-width="1.4"/>`).join("");
  const LUPE_PLUS = `<circle cx="14" cy="14" r="8.5" fill="#ffffff" stroke="#243047" stroke-width="2.8"/>` +
    `<path d="M20.4 20.4 27 27" stroke="#243047" stroke-width="3.6" stroke-linecap="round"/>` +
    `<path d="M14 10v8M10 14h8" stroke="#3fbf74" stroke-width="3" stroke-linecap="round"/>`;

  // ---------------------------------------------------------------------------
  // Alle vier Häuser auf einen Blick: die dritte Stufe des Ansicht-Knopfs.
  // Ein eigenes Bild, so gross wie der Bildschirm (nie grösser – siehe
  // zeigeWelt): die vier Häuser nebeneinander an der Strasse, der Schmuck der
  // Sternenleiter einmal in der Mitte. Ein Tipp auf ein Haus führt hin.
  // ---------------------------------------------------------------------------
  const DORF_LUECKE = 300;
  function dorfSvg() {
    const art = A();
    const w = ui.host.clientWidth || 800;
    const h = ui.host.clientHeight || 500;
    const alt = ui.haus;
    const breite = S().HAUS_IDS.length * art.HB + (S().HAUS_IDS.length - 1) * DORF_LUECKE;
    let haeuser = "";
    let oben = 0;
    try {
      S().HAUS_IDS.forEach((id, i) => {
        ui.haus = id;
        const dx = i * (art.HB + DORF_LUECKE);
        const anzahl = aktHaus().stock.length;
        const dachY = art.oben(anzahl - 1) - art.DECKE - (art.DACH_H[K().HAUS[id].dachForm] || 120);
        const name = K().HAUS[id].name;
        const schild = `<g transform="translate(${art.HB / 2} ${dachY - 70})"><rect x="${-name.length * 17 - 34}" y="-44" width="${name.length * 34 + 68}" height="72" rx="36" fill="#ffffff" stroke="${id === alt ? "#3fbf74" : "#e2e8f0"}" stroke-width="8"/><text x="0" y="12" text-anchor="middle" font-size="46" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#243047">${textSicher(name)}</text></g>`;
        haeuser += `<g class="bau-dorf-haus" data-dorf-haus="${id}" transform="translate(${dx} 0)" role="button" tabindex="0" aria-label="${textSicher(name)}">` +
          `<rect x="-120" y="${dachY - 130}" width="${art.HB + 240}" height="${-dachY + 250}" fill="transparent"/>${hausInhalt({ schmuck: false, knoepfe: false })}${schild}</g>`;
        oben = Math.min(oben, dachY - 130);
      });
    } finally { ui.haus = alt; }
    // So gross, dass alle vier ins Bild passen; unten die Strasse.
    const kopf = kopfHoehe() + 16;
    const skala = Math.min((w * 0.94) / breite, (h - kopf - 8) / (GRUND - oben));
    const vbW = w / skala;
    const vbH = h / skala;
    const x0 = breite / 2 - vbW / 2;
    const y0 = GRUND - vbH;
    const stufen = S().sternenleiter().erreicht;
    const schmuck = `<g transform="translate(${breite / 2 - art.HB / 2} 0)">${schmuckMarkup("hinten", stufen)}${schmuckMarkup("strasse", stufen)}</g>`;
    // Eigene Kennungen: Das gewählte Haus steht (versteckt) auch in der
    // Hausansicht – mit denselben Mustern; der Browser nähme sonst die dort.
    const inhalt = `${hausDefs()}${art.strasse(x0, x0 + vbW)}<rect x="${x0}" y="110" width="${vbW}" height="${GRUND + 400}" fill="#7cc05e"/>${schmuck}${haeuser}`
      .replace(/ id="/g, ' id="dorf-').replace(/url\(#/g, "url(#dorf-").replace(/href="#/g, 'href="#dorf-');
    return `<svg xmlns="${NS}" class="bau-dorf-svg${ui.nacht ? " is-nacht" : ""}" viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}" width="${w}" height="${h}" role="img" aria-label="Alle fünf Häuser">${inhalt}</svg>`;
  }
  function zeigeDorf() {
    if (!els.dorf) return;
    ui.dorf = true;
    els.dorf.innerHTML = dorfSvg();
    els.dorf.hidden = false;
    els.welt.style.visibility = "hidden";
    els.boden.style.visibility = "hidden";
    tiere.clear();
    zeigeAnsichtKnopf();
    sag("Alle fünf Häuser. Tippe auf ein Haus, dann bist du dort.");
  }
  // Zurück zu einem Haus: zu einem angetippten (ganz im Bild) oder mit dem
  // Knopf zum gewählten (wieder nah).
  function verlasseDorf({ zu = ui.haus, naeher = false } = {}) {
    if (!ui.dorf) return;
    ui.dorf = false;
    els.dorf.hidden = true;
    els.dorf.innerHTML = "";
    els.welt.style.visibility = "";
    els.boden.style.visibility = "";
    ui.kamera.stufe = naeher ? 0 : 1;
    if (zu !== ui.haus) { zeigeHaus(zu, S().HAUS_IDS.indexOf(zu) > S().HAUS_IDS.indexOf(ui.haus) ? 1 : -1); return; }
    // Die Kamera fängt neu an (der alte Platz gehörte zum alten Massstab).
    ui.kamera.anzahl = -1;
    zeichneHaus();
    sag(naeher ? "Wieder näher heran." : `${K().HAUS[zu].der}.`);
  }

  // Nach dem Loslassen gleitet das Haus aus und federt an den Enden zurück.
  function schwung() {
    const k = ui.kamera;
    k.ty += k.vy;
    k.vy *= 0.92;
    if (k.ty > k.max) { k.ty += (k.max - k.ty) * 0.2; k.vy *= 0.5; }
    if (k.ty < k.min) { k.ty += (k.min - k.ty) * 0.2; k.vy *= 0.5; }
    zeigeWeltRund(k.tx, k.ty);
    const ruhig = Math.abs(k.vy) < 0.3 && k.ty <= k.max + 0.5 && k.ty >= k.min - 0.5;
    if (ruhig) { jedesBild.delete(schwung); setzeKamera(); return false; }
    return true;
  }

  // Was ein Tipp trifft. Stehen zwei Tiere nah beieinander, decken sich ihre
  // Tippflächen (setzeTier): Es gilt das Tier, dessen Mitte näher ist.
  function zielBei(e) {
    const ziel = e.target.closest?.("[data-ziel]") || null;
    if (ziel?.getAttribute("data-ziel") !== "tier") return ziel;
    let bestes = ziel;
    let abstand = Infinity;
    new Set((document.elementsFromPoint?.(e.clientX, e.clientY) || []).map((n) => n.closest?.(".bau-tier")).filter(Boolean)).forEach((t) => {
      const r = t.querySelector(".bau-tier-dreh")?.getBoundingClientRect();
      if (!r) return;
      const d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY);
      if (d < abstand) { abstand = d; bestes = t; }
    });
    return bestes;
  }

  function tippeWelt(ziel) {
    if (!ziel) return;
    const art = ziel.getAttribute("data-ziel");
    const index = Number(ziel.getAttribute("data-stock"));
    const slot = Number(ziel.getAttribute("data-slot")) || 0;
    if (art === "gluecksstern") { findeGluecksstern(ziel); return; }
    if (art === "hoch" || art === "runter") { verschiebeStock(index, art === "hoch" ? 1 : -1); return; }
    if (ui.ordnen) { sag(stockName(S().stock(ui.haus, index), index)); return; }
    if (art === "plus") { neuesStockwerk(); return; }
    if (art === "tafel") { oeffneTafelStock(ui.haus, index); return; }
    if (art === "ruhm") { oeffneRuhm(); return; }
    if (art === "heli") return;
    if (art === "tier") { oeffneTierOderGast(ziel.getAttribute("data-seed")); return; }
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
      const wachse = (p) => `translate(0 ${unten}) scale(1 ${Math.max(0.001, p)}) translate(0 ${-unten})`;
      const hub = A().hoehe(index) + A().DECKE;
      stockEl.setAttribute("transform", wachse(0));
      if (dachEl) dachEl.setAttribute("transform", `translate(0 ${hub})`);
      await tweenP(650, (p) => {
        if (dachEl) dachEl.setAttribute("transform", `translate(0 ${hub * (1 - p)})`);
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
    g.innerHTML = `<rect x="${art.ZX + 6}" y="${art.oben(index) + 6}" width="${art.ZW - 12}" height="${art.hoehe(index) - 12}" rx="10" fill="none" stroke="#ffd166" stroke-width="12"/>` +
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
    if (liefert || ui.blitz || pinch || ui.dorf || !ui.host?.isConnected || ui.zimmer >= 0 || ui.overlay || !els.welt) return;
    const neu = S().neueLieferung();
    if (neu < 1) return;
    liefert = true;
    try { await liefere(neu); } finally { liefert = false; }
  }

  async function liefere(anzahl) {
    S().merkeGezeigt();
    if (!hausSvg() || reduced()) {
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
    const zug = neueZugEbene(A().lieferzug(anzahl), LIEFERZUG_BOX);
    const xStart = WX0 - 220;
    const xHalt = A().HB / 2 - 40;
    setzeZugEbene(zug, xStart);
    kids()?.playHorn?.();
    sag("Tuut! Der Zug bringt Ziegel!");
    await tweenP(1500, (p) => setzeZugEbene(zug, xStart + (xHalt - xStart) * p), { e: ease.out });
    // Die Paletten fliegen zum Ziegelzähler oben rechts.
    const ziel = els.ziegel.getBoundingClientRect();
    const paletten = [...zug.ebene.querySelectorAll(".bau-palette")];
    for (const p of paletten) {
      const von = p.getBoundingClientRect();
      p.setAttribute("opacity", "0");
      await fliege(von, ziel);
      const zahl = els.ziegel.querySelector(".bau-ziegel-zahl");
      zahl.textContent = String(Math.min(S().paletten(), Number(zahl.textContent) + 1));
      stupse(els.ziegel);
      klang("correct");
    }
    aktualisiereHud();
    await tweenP(1100, (p) => setzeZugEbene(zug, xHalt + (WX1 + 300 - xHalt) * p), { e: ease.in });
    entferneZugEbene(zug);
    ui.besetzt = false;
    // Nur das Plus kommt dazu – nicht das ganze Haus neu.
    erneuerePlus();
    kameraAufPlus();
    await warte(750);
    const plus = els.welt.querySelector("[data-ziel='plus']");
    if (plus) stupse(plus);
    sag(anzahl === 1 ? "Die Ziegel sind da! Tippe auf das grüne Plus, und ein neues Stockwerk entsteht." : `${anzahl} Paletten Ziegel sind da! Jede reicht für ein Stockwerk.`);
  }

  // ---------------------------------------------------------------------------
  // Was über das Gleis fährt (Lieferzug, Blitzzug), fährt auf einer eigenen
  // Ebene: ein kleines SVG in einem div über dem Haus, das nur verschoben wird
  // (transform). Fuhr der Zug im grossen Haus-SVG, malte der Browser in jedem
  // Bild die Stelle neu, über die er fuhr – auf dem Tablet ruckelte und
  // flackerte es. So malt er den Zug einmal und schiebt ihn nur noch.
  // ---------------------------------------------------------------------------
  // Was jede Zeichnung um ihren Nullpunkt braucht: [x0, y0, x1, y1].
  const LIEFERZUG_BOX = [-180, -160, 145, 10];
  const BLITZZUG_BOX = [-305, -155, 225, 30];
  const zugEbenen = new Set();
  function neueZugEbene(markup, box, { antippbar = false } = {}) {
    const ebene = el("div", `bau-zugebene${antippbar ? " is-antippbar" : ""}`);
    ebene.innerHTML = `<svg xmlns="${NS}" viewBox="${box[0]} ${box[1]} ${box[2] - box[0]} ${box[3] - box[1]}" aria-hidden="true">${markup}</svg>`;
    const zug = { ebene, box, x: 0, y: GLEIS_Y };
    els.welt.append(ebene);
    zugEbenen.add(zug);
    passeZugEbene(zug);
    return zug;
  }
  // Grösse und Lage im aktuellen Massstab (auch nach einem Zoom).
  function passeZugEbene(zug) {
    const k = ui.kamera;
    const svg = zug.ebene.firstElementChild;
    svg.setAttribute("width", ((zug.box[2] - zug.box[0]) * k.skala).toFixed(1));
    svg.setAttribute("height", ((zug.box[3] - zug.box[1]) * k.skala).toFixed(1));
    setzeZugEbene(zug, zug.x, zug.y);
  }
  // x, y: wo der Nullpunkt der Zeichnung in der Welt steht.
  function setzeZugEbene(zug, x, y = zug.y) {
    const k = ui.kamera;
    zug.x = x;
    zug.y = y;
    zug.ebene.style.transform = `translate3d(${((x + zug.box[0] - WX0) * k.skala).toFixed(1)}px, ${((y + zug.box[1] - k.y0) * k.skala).toFixed(1)}px, 0)`;
  }
  function entferneZugEbene(zug) {
    zug.ebene.remove();
    zugEbenen.delete(zug);
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
  // Was golden glitzert – der Sternenrahmen, der Glücksstern, die Ladung des
  // Blitzzugs, Statue und Dachstern: zwei Gruppen leuchten abwechselnd auf.
  // Ein Zeitgeber setzt nur die Deckkraft, ohne CSS-Animation an SVG-Teilen
  // (siehe oben) und ohne die Bild-Schleife wach zu halten.
  // ---------------------------------------------------------------------------
  let glitzerUhr = 0;
  let glitzerTakt = false;
  function glitzern() {
    if (!ui.host?.isConnected || document.hidden || reduced()) return;
    glitzerTakt = !glitzerTakt;
    const wo = ui.zimmer >= 0 ? els.zimmerBuehne : els.welt;
    wo?.querySelectorAll(".bau-glitzer-a").forEach((n) => n.setAttribute("opacity", glitzerTakt ? "1" : "0.2"));
    wo?.querySelectorAll(".bau-glitzer-b").forEach((n) => n.setAttribute("opacity", glitzerTakt ? "0.2" : "1"));
    // Der Glanz um eine Wohnung mit drei Traumjobs pulsiert langsam mit
    // (früher eine CSS-Animation, die das Haus in jedem Bild neu malte).
    wo?.querySelectorAll(".bau-traumglanz").forEach((n) => n.setAttribute("opacity", glitzerTakt ? "0.75" : "0.4"));
  }

  // ---------------------------------------------------------------------------
  // Der Blitzzug: Etwa jede halbe Stunde braust ein schneller Zug mit einer
  // Palette über das Gleis. Wer ihn antippt, bevor er weg ist, bekommt sie –
  // verpasst, kommt er nach ein paar Minuten wieder (bau-stand.js).
  // ---------------------------------------------------------------------------
  const BLITZ_MS = 3800;       // so lange braucht er durchs Bild
  const GLEIS_Y = 62;          // wo die Züge fahren (Haus-Einheiten)

  // Er kommt nur, wenn das Kind ihn sehen kann: in der Hausansicht, mit dem
  // Gleis im Bild und nichts anderem offen.
  function gleisImBild() {
    const k = ui.kamera;
    const h = ui.host?.clientHeight || 500;
    const y = (GLEIS_Y - k.y0) * k.skala + k.ty;
    return y > 60 && y < h - 10;
  }
  function pruefeBlitzzug() {
    // Zuerst fragen: Beim ersten Besuch stellt das die Uhr.
    if (!S().blitzzugFaellig()) return;
    if (ui.blitz || liefert || ui.besetzt || ui.zimmer >= 0 || ui.overlay || ui.tafel || ui.uebersicht || ui.leiter || ui.ordnen || zieht || pinch || ui.dorf) return;
    if (!hausSvg() || !gleisImBild()) return;
    starteBlitzzug();
  }

  function starteBlitzzug() {
    if (!hausSvg() || ui.blitz) return false;
    const k = ui.kamera;
    const w = ui.host.clientWidth || 800;
    // Von links ausserhalb des Bildes bis rechts hinaus.
    const links = -k.tx / k.skala + WX0;
    const rechts = (w - k.tx) / k.skala + WX0;
    const zug = neueZugEbene(A().blitzzug(), BLITZZUG_BOX, { antippbar: true });
    const g = zug.ebene;
    g.classList.add("bau-blitz");
    g.setAttribute("role", "button");
    g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", "Der Blitzzug mit einer Palette Ziegel – schnell antippen!");
    const blitz = { g, zug, gefangen: false, fertig: false };
    ui.blitz = blitz;
    // Gleich beim Berühren, nicht erst beim Loslassen: Er ist schnell.
    const fang = (e) => { e.stopPropagation(); e.preventDefault(); fangeBlitzzug(blitz); };
    g.addEventListener("pointerdown", fang);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") fang(e); });
    kids()?.playWhistle?.("doppelt");
    sag("Achtung, der Blitzzug! Schnell, tippe ihn an!");
    if (reduced()) {
      // Ohne Bewegung hält er eine Weile mitten im Bild.
      setzeZugEbene(zug, (links + rechts) / 2);
      window.setTimeout(() => blitzzugVorbei(blitz), 9000);
      return true;
    }
    const x0 = links - 230;
    const x1 = rechts + 330;
    setzeZugEbene(zug, x0);
    tween(BLITZ_MS, (p) => setzeZugEbene(zug, x0 + (x1 - x0) * p), { e: ease.lin, delay: 500, done: () => blitzzugVorbei(blitz) });
    return true;
  }

  async function fangeBlitzzug(blitz) {
    if (blitz.gefangen || blitz.fertig || ui.blitz !== blitz) return;
    blitz.gefangen = true;
    S().blitzzugVorbei(true);
    const ladung = blitz.g.querySelector(".bau-blitz-ladung");
    const von = ladung?.querySelector(".bau-palette")?.getBoundingClientRect();
    ladung?.setAttribute("opacity", "0");
    S().bonusPalette();
    klang("win");
    sag("Gefangen! Der Blitzzug schenkt dir eine Palette Ziegel.");
    await paletteZumZaehler(von);
  }

  function blitzzugVorbei(blitz) {
    if (blitz.fertig) return;
    blitz.fertig = true;
    entferneZugEbene(blitz.zug);
    if (ui.blitz === blitz) ui.blitz = null;
    if (!ui.host?.isConnected) return;
    if (!blitz.gefangen) {
      S().blitzzugVorbei(false);
      if (ui.zimmer < 0) sag("Schade, der Blitzzug war zu schnell. Bald kommt er wieder!");
    }
    // Was während der Fahrt warten musste.
    pruefeLieferung();
  }

  // Eine geschenkte Palette fliegt zum Ziegelzähler – im Zimmer, wo er nicht
  // zu sehen ist, nach oben rechts. Danach steht das Plus bereit.
  async function paletteZumZaehler(von) {
    const sichtbar = els.ziegel?.offsetParent;
    const w = ui.host?.clientWidth || 800;
    const ziel = sichtbar ? els.ziegel.getBoundingClientRect() : { left: w - 90, top: 20, width: 60, height: 50 };
    if (von && von.width) await fliege(von, ziel);
    if (!ui.host?.isConnected) return;
    aktualisiereHud();
    if (sichtbar) stupse(els.ziegel);
    klang("correct");
    if (ui.zimmer < 0 && !ui.besetzt && zeichenStand() !== ui.gezeichnet) zeichneHaus({ behalteKamera: true });
  }

  // ---------------------------------------------------------------------------
  // Der Glücksstern: Etwa jede halbe Stunde versteckt sich ein lachender
  // Stern in einem Zimmer des Dorfs. Wer ihn findet und antippt, bekommt eine
  // Palette Ziegel. Nach einer Minute zeigt der Umschalter, in welchem Haus.
  // ---------------------------------------------------------------------------
  const STERN_TIPP_MS = 60 * 1000;
  const STERN_MASS = 0.75;

  function sternIndex(stern = ui.stern) {
    if (!stern) return -1;
    const index = S().indexVon(stern.haus, stern.stockId);
    return index >= 0 && S().zimmer(stern.haus, index, stern.slot)?.raum ? index : -1;
  }
  function pruefeGluecksstern() {
    if (ui.dorf) return;
    // Sein Zimmer gibt es nicht mehr (umgebaut, aus der Cloud): neu verstecken.
    if (ui.stern && sternIndex() < 0) ui.stern = null;
    if (ui.stern) { zeigeSternTipp(); return; }
    if (!S().sternFaellig()) return;
    versteckeStern();
  }

  // ort: { haus, index, slot, x, y } für die Prüfskripte; sonst zufällig.
  function versteckeStern(ort = null) {
    const verstecke = S().sternVerstecke();
    const v = ort || verstecke[Math.floor(Math.random() * verstecke.length)];
    if (!v) return null;
    const st = S().stock(v.haus, v.index);
    if (!st?.zimmer?.[v.slot || 0]?.raum) return null;
    const breite = S().breiteVon(st);
    const oben = S().obenVon(st);
    const x = ort?.x ?? 34 + Math.random() * (breite - 68);
    const y = ort?.y ?? oben + 26 + Math.random() * (196 - oben - 26);
    ui.stern = { haus: v.haus, stockId: st.id, slot: v.slot || 0, x: Math.round(x), y: Math.round(y), seit: Date.now() };
    zeigeSternJetzt();
    if (!ui.besetzt) sag("Psst! Irgendwo im Dorf hat sich ein Glücksstern versteckt. Findest du ihn?");
    return { ...ui.stern, index: v.index };
  }

  function sternMarkup() {
    const s = ui.stern;
    return `<g class="bau-gluecksstern" data-ziel="gluecksstern" role="button" tabindex="0" aria-label="Der Glücksstern!" transform="translate(${s.x} ${s.y}) scale(${STERN_MASS})">` +
      `<circle r="34" fill="transparent"/>${A().gluecksstern()}</g>`;
  }
  function sternHier(hausId, index, slot) {
    const s = ui.stern;
    return Boolean(s) && s.haus === hausId && s.slot === slot && S().stock(hausId, index)?.id === s.stockId;
  }

  // Taucht er auf, während das Kind schaut, kommt er gleich ins Bild – ohne
  // alles neu zu zeichnen (vielleicht zieht es gerade ein Ding).
  function zeigeSternJetzt() {
    const s = ui.stern;
    const index = sternIndex();
    if (!s || index < 0 || s.haus !== ui.haus) return;
    if (ui.zimmer < 0) {
      const raum = els.welt?.querySelector(`.bau-raum[data-stock="${index}"][data-slot="${s.slot}"]`);
      if (raum && !raum.querySelector(".bau-gluecksstern")) raum.insertAdjacentHTML("beforeend", sternMarkup());
    } else if (ui.zimmer === index && ui.slot === s.slot) {
      const svg = els.zimmerBuehne?.querySelector("svg");
      const rahmen = svg?.querySelector(".bau-auswahlrahmen");
      if (svg && !svg.querySelector(".bau-gluecksstern")) {
        if (rahmen) rahmen.insertAdjacentHTML("beforebegin", sternMarkup());
        else svg.insertAdjacentHTML("beforeend", sternMarkup());
      }
    }
  }

  // Nach einer Minute funkelt das Haus im Umschalter, in dem er steckt.
  function zeigeSternTipp() {
    const s = ui.stern;
    els.umschalter?.querySelectorAll(".bau-tab").forEach((tab) => {
      tab.classList.toggle("hat-stern", Boolean(s) && tab.dataset.haus === s.haus && Date.now() - s.seit > STERN_TIPP_MS);
    });
  }

  async function findeGluecksstern(node) {
    const s = ui.stern;
    if (!s || s.gefunden) return;
    s.gefunden = true;
    ui.stern = null;
    zeigeSternTipp();
    S().sternGefunden();
    S().bonusPalette();
    klang("win");
    sag("Du hast den Glücksstern gefunden! Er schenkt dir eine Palette Ziegel.");
    const von = node?.getBoundingClientRect?.();
    document.querySelectorAll(".bau-gluecksstern").forEach((n) => { if (n !== node) n.remove(); });
    if (node && !reduced()) {
      const basis = node.getAttribute("transform") || "";
      await tweenP(380, (p) => node.setAttribute("transform", `${basis} scale(${(1 + p * 0.8).toFixed(3)})`), { e: ease.out });
    }
    node?.remove();
    await paletteZumZaehler(von);
  }

  // ---------------------------------------------------------------------------
  // Die Sternenleiter: alle Sterne des Dorfs – links der Zähler, ein Tipp
  // zeigt die Stufen. Jede neue Stufe bringt dem Dorf etwas (bau-katalog.js,
  // LEITER; gezeichnet in bau-art.js).
  // ---------------------------------------------------------------------------
  function leiterSatz(l = S().sternenleiter()) {
    const naechste = K().LEITER[l.erreicht];
    const wieviel = l.jetzt === 1 ? "einen Stern" : `${l.jetzt} Sterne`;
    if (!naechste) return `Das Dorf hat ${wieviel}. Die ganze Sternenleiter ist geschafft – das Dorf funkelt!`;
    const fehlt = Math.max(1, naechste.sterne - l.jetzt);
    return `Das Dorf hat ${wieviel}. Noch ${fehlt === 1 ? "ein Stern" : `${fehlt} Sterne`} bis zur nächsten Stufe: ${naechste.name}.`;
  }

  function aktualisiereLeiterKnopf(l = S().sternenleiter()) {
    if (!els.leiterKnopf) return;
    const naechste = K().LEITER[l.erreicht];
    const vorher = K().LEITER[l.erreicht - 1]?.sterne || 0;
    const anteil = naechste ? clamp((l.jetzt - vorher) / Math.max(1, naechste.sterne - vorher), 0, 1) : 1;
    els.leiterKnopf.innerHTML = `<span class="bau-leiterknopf-zahl"><i class="bau-stern is-gelb is-voll" aria-hidden="true"></i>${l.jetzt}</span>` +
      `<span class="bau-leiterknopf-balken" aria-hidden="true"><i style="width:${Math.round(anteil * 100)}%"></i></span>` +
      `<span class="bau-leiterknopf-text">${naechste ? `bis ${naechste.sterne}` : "geschafft!"}</span>`;
    els.leiterKnopf.classList.toggle("is-fertig", !naechste);
    const label = `Sternenleiter: ${leiterSatz(l)}`;
    els.leiterKnopf.setAttribute("aria-label", label);
    els.leiterKnopf.title = label;
  }

  function oeffneLeiter({ stumm = false } = {}) {
    if (!ui.host?.isConnected || ui.besetzt || ui.overlay || ui.ordnen) return false;
    if (ui.tafel) schliesseTafel();
    if (ui.uebersicht) schliesseUebersicht({ weiter: true });
    ui.leiter = true;
    if (!els.leiter?.isConnected) {
      els.leiter = el("div", "bau-uebersicht bau-leiter", { role: "dialog", "aria-modal": "true", "aria-label": "Die Sternenleiter des Dorfs" });
      els.leiter.addEventListener("click", (e) => { if (e.target === els.leiter) schliesseLeiter(); });
      ui.host.append(els.leiter);
    }
    els.leiter.hidden = false;
    fuelleLeiter();
    if (!stumm) sag(leiterSatz());
    hilfe("Jeder Stern, den ein Bewohner bekommt, zählt für das ganze Dorf – auch die Sterne der Babys, aus dem Spital, dem Hotel und den Spielen. Auf jeder Stufe der Sternenleiter bekommt das Dorf etwas Neues. Erfülle die Wünsche der Bewohner, dann steigst du höher!");
    return true;
  }

  function schliesseLeiter() {
    ui.leiter = false;
    if (els.leiter) els.leiter.hidden = true;
    if (ui.zimmer >= 0) hilfeZimmer(); else hilfeHaus();
    pruefeZuzug();
  }

  function fuelleLeiter() {
    if (!ui.leiter || !els.leiter) return;
    const l = S().sternenleiter();
    const karte = el("div", "bau-uebersicht-karte bau-leiter-karte");
    karte.append(knopf("bau-uebersicht-zu", "Schliessen", svgVon(KREUZ, "0 0 24 24"), () => schliesseLeiter()));
    const kopf = el("div", "bau-uebersicht-kopf");
    kopf.append(el("h2", "", { text: "Sternenleiter des Dorfs" }), el("p", "bau-lies", { text: leiterSatz(l) }));
    karte.append(kopf);
    const liste = el("ol", "bau-leiter-liste");
    // Wie eine Leiter: die höchste Stufe oben.
    [...K().LEITER].map((stufe, n) => ({ stufe, n })).reverse().forEach(({ stufe, n }) => {
      const erreicht = n < l.erreicht;
      const naechste = n === l.erreicht;
      const zustand = erreicht ? "is-erreicht" : naechste ? "is-naechste" : "is-spaeter";
      const bild = A().leiterBild(stufe.id);
      const fehlt = Math.max(0, stufe.sterne - l.jetzt);
      const rechts = erreicht ? `<span class="bau-leiter-haken" aria-hidden="true">✓</span>`
        : naechste ? `<span class="bau-leiter-fehlt">noch <b>${fehlt}</b> <i class="bau-stern is-gelb is-voll"></i></span>`
          : `<span class="bau-leiter-schloss" aria-hidden="true">🔒</span>`;
      const satz = `${stufe.sterne} Sterne: ${stufe.name}. ${stufe.text} ${erreicht ? "Geschafft!" : naechste ? `Noch ${fehlt === 1 ? "ein Stern" : `${fehlt} Sterne`}.` : ""}`;
      const zeile = el("li", `bau-leiter-stufe bau-lies ${zustand}`, { "data-lies": satz.trim() });
      zeile.innerHTML = `<span class="bau-leiter-marke"><i class="bau-stern is-gelb is-voll" aria-hidden="true"></i>${stufe.sterne}</span>` +
        `<span class="bau-leiter-bild">${svgVon(bild.markup, bild.viewBox)}</span>` +
        `<span class="bau-leiter-text"><b>${textSicher(stufe.name)}</b><span>${textSicher(stufe.text)}</span></span>${rechts}`;
      liste.append(zeile);
    });
    karte.append(liste);
    els.leiter.innerHTML = "";
    els.leiter.append(karte);
    // Die nächste Stufe ins Bild – nur die Karte rollt, nicht die Seite.
    window.requestAnimationFrame(() => {
      const naechste = karte.querySelector(".is-naechste");
      if (naechste) karte.scrollTop = Math.max(0, naechste.offsetTop - karte.clientHeight / 2 + naechste.offsetHeight / 2);
    });
  }

  // Ist eine neue Stufe erreicht, feiert die Bauecke – nach einer Feier für
  // alle Sterne, damit sich die Bänder nicht überdecken.
  let leiterUhr = 0;
  function pruefeLeiter() {
    window.clearTimeout(leiterUhr);
    leiterUhr = window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      const l = S().sternenleiter();
      aktualisiereLeiterKnopf(l);
      if (ui.leiter) fuelleLeiter();
      if (l.erreicht <= ui.leiterBekannt) { ui.leiterBekannt = Math.max(ui.leiterBekannt, l.erreicht); return; }
      const neu = K().LEITER[l.erreicht - 1];
      ui.leiterBekannt = l.erreicht;
      feiereLeiter(neu, l, 0);
    }, 140);
  }

  function feiereLeiter(stufe, l, versuch) {
    if (!ui.host?.isConnected || !stufe) return;
    // Läuft noch ein Band (alle Sterne), danach.
    if ((ui.host.querySelector(".bau-sternband, .bau-leiterband") || ui.besetzt) && versuch < 12) {
      window.setTimeout(() => feiereLeiter(stufe, l, versuch + 1), 600);
      return;
    }
    window.setTimeout(() => {
      if (!ui.host?.isConnected) return;
      klang("wagon");
      const bild = A().leiterBild(stufe.id);
      ui.host.querySelector(".bau-leiterband")?.remove();
      const band = el("div", "bau-leiterband", { role: "status" });
      band.innerHTML = `<span class="bau-sternband-bild">${svgVon(bild.markup, bild.viewBox)}</span>` +
        `<span class="bau-sternband-text"><b>${textSicher(stufe.name)}!</b><span>${stufe.sterne} Sterne im Dorf – neue Stufe der Sternenleiter.</span></span>`;
      ui.host.append(band);
      window.setTimeout(() => band.classList.add("is-weg"), 4200);
      window.setTimeout(() => band.remove(), 4800);
      if (ui.zimmer >= 0) kids()?.burstConfetti?.(els.zimmer, 40);
      else {
        zeichneHaus({ behalteKamera: true });
        const svg = els.welt?.querySelector("svg");
        if (svg) feuerwerk(svg, A().HB / 2, -260, A().HB);
      }
      sag(`Juhui! Das Dorf hat ${stufe.sterne} Sterne. ${stufe.text}`);
    }, versuch ? 300 : (ui.zimmer >= 0 ? 1500 : 400));
  }

  // Was das Dorf schon hat (die Stufen der Leiter), in der Hausansicht.
  // teil: "hinten" (Regenbogen, Ballon), "strasse" (an der Strasse), "dach";
  // erreicht: wie viele Stufen (sternenleiter()).
  function schmuckMarkup(teil, erreicht, dachForm = "", dachY = 0) {
    const art = A();
    const hat = new Set(K().LEITER.slice(0, erreicht).map((s) => s.id));
    if (!hat.size) return "";
    let s = "";
    // Die Stufen ab 240 Sternen (bau-leiter.js): jede an ihrem Platz – was
    // zuhinterst steht (Polarlicht, Berg mit Seilbahn, Sternwarte) vor allem
    // anderen, der Rest nach den älteren Bildern.
    const neue = window.LernappBauLeiter?.BILDER || {};
    const neuesBild = (hinterst) => Object.entries(neue).forEach(([id, b]) => {
      if (!hat.has(id) || b.platz?.teil !== teil || Boolean(b.platz.zuhinterst) !== hinterst) return;
      s += `<g class="bau-schmuck" transform="translate(${b.platz.x} ${b.platz.y}) scale(${b.platz.s || 1})">${b.zeichne()}</g>`;
      // Der Regenbogen gleich hinter dem Polarlicht: So bleibt der Berg davor klar.
      if (id === "polarlicht" && hat.has("regenbogen") && teil === "hinten") s += `<g class="bau-schmuck" opacity="0.55" transform="translate(${A().HB / 2} 0)">${A().regenbogen(760)}</g>`;
    });
    neuesBild(true);
    const regenbogenSchon = hat.has("polarlicht") && Boolean(neue.polarlicht);
    if (teil === "hinten") {
      if (hat.has("schloss")) s += `<g class="bau-schmuck" transform="translate(-230 0) scale(0.9)">${art.schloss()}</g>`;
      if (hat.has("zeppelin")) s += `<g class="bau-schmuck" transform="translate(-200 -860) scale(0.85)">${art.zeppelin()}</g>`;
      if (hat.has("drachen")) s += `<g class="bau-schmuck" transform="translate(-150 -600)">${art.drachen()}</g><g class="bau-schmuck" transform="translate(${art.HB + 210} -700) scale(0.85)">${art.drachen("#4f8ef7", "#9cc3ff")}</g>`;
      if (hat.has("regenbogen") && !regenbogenSchon) s += `<g class="bau-schmuck" opacity="0.55" transform="translate(${art.HB / 2} 0)">${art.regenbogen(760)}</g>`;
      if (hat.has("windmuehle")) s += `<g class="bau-schmuck" transform="translate(-330 0)">${art.windmuehle()}</g>`;
      if (hat.has("riesenrad")) s += `<g class="bau-schmuck" transform="translate(${art.HB + 330} 0)">${art.riesenrad()}</g>`;
      if (hat.has("ballon")) s += `<g class="bau-schmuck" transform="translate(${art.HB + 150} -330)">${art.ballon()}</g>`;
    }
    if (teil === "strasse") {
      if (hat.has("fahnen")) s += `<g class="bau-schmuck" transform="translate(-430 -132)">${art.wimpel(387, 20)}</g><g class="bau-schmuck" transform="translate(${art.HB + 43} -112)">${art.wimpel(387, -20)}</g>`;
      if (hat.has("statue")) s += `<g class="bau-schmuck" transform="translate(-372 0)">${art.statue()}</g>`;
      if (hat.has("brunnen")) s += `<g class="bau-schmuck" transform="translate(-190 0)">${art.brunnen()}</g>`;
      if (hat.has("karussell")) s += `<g class="bau-schmuck" transform="translate(${art.HB + 186} 0) scale(0.85)">${art.karussell()}</g>`;
      if (hat.has("teich")) s += `<g class="bau-schmuck" transform="translate(-230 0)">${art.teich()}</g>`;
      if (hat.has("garten")) s += `<g class="bau-schmuck" transform="translate(${art.HB + 240} 0)">${art.garten()}</g>`;
      if (hat.has("blumen")) s += `<g class="bau-schmuck" transform="translate(-250 0)">${art.blumen(150)}</g><g class="bau-schmuck" transform="translate(-75 0)">${art.blumen(56)}</g><g class="bau-schmuck" transform="translate(${art.HB + 80} 0)">${art.blumen(56)}</g><g class="bau-schmuck" transform="translate(${art.HB + 330} 0)">${art.blumen(120)}</g>`;
    }
    neuesBild(false);
    if (teil === "dach" && hat.has("dachstern")) {
      const [x, y] = art.dachsternOrt(dachForm, dachY);
      s += `<g class="bau-schmuck" transform="translate(${x} ${y})">${art.dachstern()}</g>`;
    }
    return s ? `<g pointer-events="none">${s}</g>` : "";
  }

  // Vor dem Wohnhaus: die Ruhmeshalle (wenn es frühere Dörfer gibt) und das
  // Denkmal für ein Dorf mit Goldpokal. Ein Tipp auf die Halle öffnet sie.
  function ruhmMarkup() {
    const ruhm = S().lesen().ruhm || [];
    if (!ruhm.length) return "";
    let s = "";
    const halle = SCH()?.ruhmeshalle?.();
    if (halle) s += `<g class="bau-ruhmhalle" data-ziel="ruhm" role="button" tabindex="0" aria-label="Die Ruhmeshalle" transform="translate(-345 0) scale(0.85)"><rect x="-90" y="-165" width="180" height="170" fill="transparent"/>${halle}</g>`;
    const d = S().denkmal();
    const bild = d && SCH()?.denkmal?.();
    if (bild) {
      s += `<g pointer-events="none" transform="translate(${A().HB + 405} 0) scale(0.72)">${bild}` +
        `<text x="0" y="-46" text-anchor="middle" font-size="11" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#5b3a00">Dorf ${d.nr}</text></g>`;
    }
    return s;
  }

  // Haben alle, die in einer Wohnung wohnen, alle Sterne? Dann glitzert ein
  // goldener Rahmen um sie.
  function wohnungStrahlt(st) {
    if (st?.art !== "wohnung" || !st.tiere.length) return false;
    return st.tiere.every((t) => { const z = S().sterne(t.seed); return z.total > 0 && z.anzahl === z.total; });
  }

  // Die Krone über einem Tier mit allen Sternen: im Haus und im Zimmer.
  function aktualisiereKronen() {
    tiere.forEach((t) => {
      const krone = t.g.querySelector(".bau-krone");
      if (!krone) return;
      const z = S().sterne(t.tier.seed);
      krone.style.display = z.total > 0 && z.anzahl === z.total ? "" : "none";
    });
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
    const zielY = inhaltY(index) + S().GEO.STAND + 2;
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
        if (!wo || wo.wo === "daheim") setzeMitBaby(lage, { tier, wohnt: true, breite });
        else weg.push(tier);
      });
      if (weg.length) lage.insertAdjacentHTML("beforeend", tuerSchild(weg, index));
    }
    // Ein Feriengast im Hotel – mit Koffer.
    if (st.gast && slot === 0 && st.gast.seed !== ui.kommt) setzeTier(lage, { tier: st.gast, wohnt: false, grund: "gast", breite, x: breite * 0.4 });
    S().besucher(ui.haus, index, slot, jetzt).forEach((b, n) => {
      if (b.tier.seed === ui.kommt) return;
      setzeMitBaby(lage, { tier: b.tier, wohnt: false, grund: b.grund, breite, x: breite * 0.65 - n * 50, dome });
    });
  }

  // Ein Bewohner – und sein Baby gleich daneben, wenn es eines hat.
  function setzeMitBaby(lage, opts) {
    setzeTier(lage, opts);
    const baby = opts.tier.baby;
    if (!baby) return;
    const ort = tierOrte.get(opts.tier.seed);
    const x = (ort?.x ?? opts.x ?? 80) + 26;
    setzeTier(lage, { tier: { a: baby.a, n: baby.n, seed: `${opts.tier.seed}~b`, baby: null, istBaby: true, eltern: opts.tier.seed }, wohnt: opts.wohnt, breite: opts.breite, x, gross: 0.58 });
  }

  function tuerSchild(weg, index) {
    const namen = weg.map((t) => t.n).join(", ");
    const breite = Math.max(88, namen.length * 8 + 30);
    return `<g class="bau-schild" data-ziel="tafel" data-stock="${index}" transform="translate(${breite / 2 + 12} 120)"><rect x="${-breite / 2}" y="-26" width="${breite}" height="40" rx="8" fill="#ffffff" stroke="#e8b94f" stroke-width="3"/><text x="0" y="-6" text-anchor="middle" font-size="13" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#8a5734">Unterwegs:</text><text x="0" y="9" text-anchor="middle" font-size="12" font-family="'Baloo 2', Nunito, sans-serif" fill="#8a5734">🚶 ${textSicher(namen)}</text></g>`;
  }

  // Ein Tier, wie bau-tiere.js es zeichnet: eine Buchfigur wie in ihrem Buch,
  // die anderen einer Art je nach Kennung ein wenig verschieden angezogen.
  // Menschen zeichnet bau-menschen.js (viele Gesichter: variante bis 256).
  function tierSvg(tier, opts = {}) {
    const mensch = String(tier.a).startsWith("m_");
    return A().tier(tier.a, { figur: S().figurVon(tier)?.id || "", variante: S().hash(tier.istBaby ? tier.eltern + tier.n : tier.seed) % (mensch ? 256 : 4), ...opts });
  }
  // Der Kasten um die Zeichnung eines Bewohners (für Bildchen, Krone, Blasen).
  function tierBox(tier) {
    if (String(tier.a).startsWith("m_")) return window.LernappBauMenschen?.box?.(tier.a) || { x0: -30, y0: -126, x1: 30, y1: 0 };
    return window.LernappBauTiere?.box?.(tier.a, { figur: S().figurVon(tier)?.id || "" }) || { x0: -30, y0: -106, x1: 34, y1: 0 };
  }
  // Ein Tier als Bildchen (Zimmerkopf, Tafel): ganz zu sehen, so gross es in
  // w × h passt, mit den Füssen unten.
  function tierBildchen(tier, w, h, cls = "") {
    const box = tierBox(tier);
    const k = Math.min((w - 2) / (box.x1 - box.x0), (h - 3) / (box.y1 - box.y0));
    const x = w / 2 - ((box.x0 + box.x1) / 2) * k;
    return svgVon(`<g transform="translate(${x.toFixed(1)} ${h - 2}) scale(${k.toFixed(3)})">${tierSvg(tier)}</g>`, `0 0 ${w} ${h}`, cls);
  }

  const RAND = 28;
  // dome: im KiddyDome – dort wird gehüpft, und zwar hoch. gross: kleiner
  // gezeichnet (ein Baby). grund "gast": ein Feriengast mit Koffer.
  function setzeTier(lage, { tier, wohnt, grund = "", breite = A().ZW, x = null, dome = false, gross = 1 }) {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", `bau-tier${tier.istBaby ? " is-baby" : ""}`);
    g.setAttribute("data-ziel", "tier");
    g.setAttribute("data-seed", tier.istBaby ? tier.eltern : tier.seed);
    g.setAttribute("role", "button");
    g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", tier.istBaby ? `${tier.n}, das Baby` : `${tier.n}, ${K().TIERE[tier.a]?.der || ""}`);
    const k = M().MASS * gross;
    // Wo der Kopf aufhört: Eine Giraffe oder ein Erwachsener ist höher als
    // ein Fuchs – Krone, Schlaf-z und Abzeichen sitzen über dem Kopf.
    const oben = Math.min(0, (tierBox(tier).y0 || -99) + 99);
    // Abzeichen und Schlaf-z bleiben so gross wie vor der Halbierung der
    // Tiere (MASS 1.2) – sonst wären sie kaum zu sehen.
    const lesbar = 1.2 / k;
    // Bei der Arbeit: die Aktentasche – golden, wenn es der Traumjob ist.
    const traum = grund === "arbeit" && S().hatTraumjob(tier.seed);
    const ob = (-100 - 14 * lesbar + oben).toFixed(1);
    const abzeichen = traum
      ? `<g transform="translate(-16 ${ob}) scale(${lesbar.toFixed(3)})"><circle r="13" fill="#fff3c4" stroke="#f5a300" stroke-width="2.5"/>${A().traumAbzeichen(true)}</g>`
      : grund === "arbeit" ? `<g transform="translate(-16 ${ob}) scale(${lesbar.toFixed(3)})"><circle r="11" fill="#ffffff" stroke="#8a5734" stroke-width="2"/><text y="5" text-anchor="middle" font-size="13">💼</text></g>` : "";
    // Hat es alle Sterne, trägt es eine kleine Krone (aktualisiereKronen).
    const sterne = tier.istBaby || grund === "gast" ? { total: 0, anzahl: 0 } : S().sterne(tier.seed);
    const alle = sterne.total > 0 && sterne.anzahl === sterne.total;
    const kroneMass = (0.84 / k).toFixed(3);
    const krone = `<g class="bau-krone" transform="translate(${abzeichen ? 12 : 0} ${-92 + oben}) scale(${kroneMass})"${alle ? "" : ` style="display:none"`}>${A().krone()}</g>`;
    // Ein Wehwehchen (bau-schmuck.js): ein Pflaster, ein Gips, ein Taschentuch …
    const weh = tier.weh && SCH()?.weh ? `<g class="bau-weh" pointer-events="none">${SCH().weh(tier.weh.art)}</g>` : "";
    // Ein Feriengast hat seinen Koffer dabei.
    const koffer = grund === "gast" ? A().koffer() : "";
    // Im Haus sind die Tiere klein (auf dem Tablet etwa 25 × 50 Bildpunkte),
    // und zwischen Beinen, Ohren und Schwanz ging ein Tipp ins Zimmer dahinter.
    // Eine unsichtbare Fläche rundherum macht jedes Tier gut antippbar.
    const treffer = lage.closest?.(".bau-welt") ? `<rect class="bau-tier-treffer" x="-62" y="-150" width="124" height="162" rx="34"/>` : "";
    g.innerHTML = `${treffer}<g class="bau-tier-dreh">${tierSvg(tier)}${weh}${koffer}</g>${krone}${abzeichen}<g class="bau-zzz" style="display:none"><g transform="translate(12 ${-110 + oben}) scale(${lesbar.toFixed(3)})"><text x="0" y="0" font-size="18" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">z</text><text x="12" y="-14" font-size="14" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">z</text></g></g>`;
    lage.append(g);
    const ort = tierOrte.get(tier.seed);
    // Mindestens RAND vom Rand weg: Der Schwanz ragt gut 25 Einheiten hinaus.
    const startX = clamp(ort?.x ?? x ?? (60 + ((S().hash(tier.seed) % Math.max(40, breite - 120)))), RAND, breite - RAND);
    const t = {
      g, dreh: g.querySelector(".bau-tier-dreh"), bob: g.querySelector(".bob"), legL: g.querySelector(".legL"), legR: g.querySelector(".legR"), zzz: g.querySelector(".bau-zzz"), lid: g.querySelector(".bt-lid"),
      x: startX, y: S().GEO.STAND + 2, ziel: startX, richtung: 1, modus: "steht", bis: performance.now() + 800 + Math.random() * 2500,
      phase: Math.random() * 6, k, wohnt, tier, breite, huepf: 0, dome, oben,
    };
    if (ort) { t.ziel = clamp(ort.ziel ?? t.x, RAND, breite - RAND); t.modus = ort.modus || "steht"; t.richtung = ort.richtung || 1; }
    stelleTier(t, 0);
    tiere.set(g, t);
  }

  function stelleTier(t, dt) {
    const schlaeft = ui.nacht && !NACHTAKTIV.includes(t.tier.a) && t.modus !== "geht";
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
        if (ui.nacht && !NACHTAKTIV.includes(t.tier.a)) return;
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
    if (!t.wohnt || t.tier.istBaby) return;
    // Wer ein Wehwehchen hat, zeigt das zuerst.
    if (t.tier.weh && Math.random() < 0.6) { blaseAnTier(t, `<text x="0" y="8" text-anchor="middle" font-size="24">🤕</text>`, 3200); return; }
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
    // Halb so gross wie vor der Halbierung der Tiere (dort MASS 1.2): Die
    // Blase schrumpft mit dem Tier. Gleich über dem Kopf.
    const groesse = 0.6 / t.k;
    b.setAttribute("transform", `translate(14 ${(-108 - 12 * groesse + (t.oben || 0)).toFixed(1)}) scale(${groesse.toFixed(3)})`);
    const w = halb * 2;
    b.innerHTML = `<path d="M${-halb} -46h${w}a12 12 0 0 1 12 12v28a12 12 0 0 1-12 12h${-(w - 16)}l-10 12l0-12h-6a12 12 0 0 1-12-12v-28a12 12 0 0 1 12-12z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/><g transform="translate(0 -20)">${inhalt}</g>`;
    t.g.append(b);
    window.setTimeout(() => b.remove(), dauer);
  }

  // Eine Blase mit Text an einem bestimmten Tier.
  function blaseAnSeed(seed, text, dauer = 3000) {
    for (const t of tiere.values()) {
      if (t.tier.seed === seed && !t.tier.istBaby) {
        const halb = Math.max(30, text.length * 3.6 + 4);
        blaseAnTier(t, `<text x="0" y="6" text-anchor="middle" font-size="13" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#243047">${textSicher(text)}</text>`, dauer, halb);
        return;
      }
    }
  }

  // Das Bild zu einem Wunsch: das Ding, die Farbe (Wand: ein Pinselstrich,
  // Boden: Dielen) oder das Zimmer.
  function wunschBild(w, groesse = 30) {
    if (w.typ === "ding" || w.typ === "zeit") return dingBild(w.zeige, groesse);
    if (w.typ === "farbig") {
      const hex = farbeHex(w.farbe);
      return `${dingBild(w.zeige, groesse, hex)}<circle cx="${groesse * 0.36}" cy="${groesse * 0.36}" r="${groesse * 0.18}" fill="${hex}" stroke="#ffffff" stroke-width="2"/>`;
    }
    if (w.typ === "anzahl") {
      return `${dingBild(w.zeige, groesse * 0.86)}<g transform="translate(${groesse * 0.3} ${groesse * 0.3})"><circle r="${groesse * 0.24}" fill="#243047" stroke="#ffffff" stroke-width="1.6"/><text y="${groesse * 0.09}" text-anchor="middle" font-size="${groesse * 0.3}" font-weight="800" font-family="'Baloo 2', Nunito, sans-serif" fill="#ffffff">${w.anzahl}</text></g>`;
    }
    if (w.typ === "ort") {
      // Das Ding klein vor dem, wo es hin soll.
      return `<g transform="translate(${-groesse * 0.12} ${groesse * 0.08})" opacity="0.85">${dingBild(w.dortZeige, groesse * 0.82)}</g><g transform="translate(${groesse * 0.22} ${-groesse * 0.18})">${dingBild(w.zeige, groesse * 0.52)}</g>`;
    }
    if (w.typ === "stock") {
      const h = groesse / 2;
      if (w.lage === "neben") return `${dingBild(w.icon, groesse * 0.8)}<path d="M${-h} ${-h * 0.2}l${h * 0.3} ${-h * 0.3}v${h * 0.6}z" fill="#a46be0"/>`;
      const pfeil = w.lage === "oben" ? `M0 ${-h * 0.8}l${h * 0.55} ${h * 0.6}h${-h * 0.32}v${h * 0.95}h${-h * 0.46}v${-h * 0.95}h${-h * 0.32}z`
        : w.lage === "unten" ? `M0 ${h * 0.8}l${h * 0.55} ${-h * 0.6}h${-h * 0.32}v${-h * 0.95}h${-h * 0.46}v${h * 0.95}h${-h * 0.32}z` : "";
      return `<rect x="${-h * 0.62}" y="${-h * 0.9}" width="${h * 1.24}" height="${h * 1.8}" rx="${h * 0.15}" fill="#efe6fa" stroke="#a46be0" stroke-width="2"/>` +
        (pfeil ? `<path d="${pfeil}" fill="#a46be0"/>` : `<text y="${h * 0.32}" text-anchor="middle" font-size="${groesse * 0.55}">🤫</text>`);
    }
    if (w.typ === "freund") {
      const f = w.freundTier;
      if (!f) return "";
      const box = tierBox(f);
      const k = (groesse * 0.95) / Math.max(box.x1 - box.x0, box.y1 - box.y0);
      return `<g transform="translate(${(-(box.x0 + box.x1) / 2 * k).toFixed(1)} ${(groesse / 2 - 1).toFixed(1)}) scale(${k.toFixed(3)})">${tierSvg(f)}</g>`;
    }
    if (w.typ === "farbe" || w.typ === "boden") {
      const hex = farbeHex(w.farbe);
      const h = groesse / 2;
      const zeichen = w.typ === "boden"
        ? `<path d="M${-h + 4} ${-h / 3}h${groesse - 8}M${-h + 4} ${h / 3}h${groesse - 8}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>`
        : `<path d="M${-groesse / 4} ${groesse / 6}l${groesse / 2} ${-groesse / 2}" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`;
      return `<rect x="${-h}" y="${-h}" width="${groesse}" height="${groesse}" rx="6" fill="${hex}" stroke="#ffffff" stroke-width="2"/>${zeichen}`;
    }
    return dingBild(w.icon, groesse);
  }

  // Ein Ding, eingepasst in ein Quadrat um (0, 0) – auf Wunsch angemalt.
  function dingBild(id, groesse = 30, farbe = null) {
    const ding = M().DINGE[id];
    if (!ding) return "";
    const k = groesse / Math.max(ding.w, ding.h);
    const dy = ding.art === "wand" ? 0 : ding.art === "decke" ? -ding.h / 2 : ding.h / 2;
    return `<g transform="scale(${k.toFixed(3)}) translate(0 ${dy})">${M().zeichne(id, ding.farbe ? farbe : null)}</g>`;
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
      const origin = `${ox - ui.kamera.tx}px ${oy - ui.kamera.ty}px`;
      await tweenP(420, (p) => {
        const s = 1 + (k - 1) * p;
        const tx = ui.kamera.tx + (nach.x - ox) * p;
        const ty = ui.kamera.ty + (nach.y - oy) * p;
        zeigeWelt(tx, ty, { s, origin });
        els.zimmer.style.opacity = String(clamp((p - 0.55) / 0.45, 0, 1));
      }, { e: ease.inOut });
      els.zimmer.classList.remove("is-einblenden");
      els.zimmer.style.opacity = "";
    }
    els.welt.style.visibility = "hidden";
    els.boden.style.visibility = "hidden";
    zeigeWelt(ui.kamera.tx, ui.kamera.ty, { origin: "" });
    setzeKamera();
    ui.besetzt = false;
    hilfeZimmer();
    starteTiereZimmer();
  }

  // Wer hier wohnt oder arbeitet – zum Zimmer. Je Satz ein Name: So gibt es
  // jeden Satz als Aufnahme (bau-stimme.js), auch wenn die Tiere wechseln.
  function zimmerSatz(st, slot) {
    if (st.art === "wohnung") {
      return st.tiere.map((t, i) => (i === 0 ? `Hier wohnt ${t.n}.` : `${t.n} wohnt auch hier.`)).join(" ");
    }
    const leute = S().zimmerTiere(ui.haus, ui.zimmer >= 0 ? ui.zimmer : S().indexVon(ui.haus, st.id), slot);
    const traum = leute.filter((l) => l.traumHier).map((l) => l.tier.n);
    const wunsch = leute.filter((l) => l.wunsch && !l.traumHier).map((l) => l.tier.n);
    return [
      ...traum.map((n, i) => (i === 0 ? `${n} hat hier den Traumjob!` : `${n} hat hier auch den Traumjob!`)),
      ...wunsch.map((n, i) => (i === 0 ? `${n} hat sich dieses Zimmer gewünscht.` : `${n} hat es sich auch gewünscht.`)),
    ].join(" ");
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
    els.boden.style.visibility = "";
    if (!sofort && !reduced()) {
      const st = S().stock(ui.haus, index);
      const von = zimmerRechteck(S().breiteVon(st), S().hoeheVon(st));
      const nach = zimmerAufSchirm(index, slot);
      const k = von.w / nach.w;
      const origin = `${nach.x - ui.kamera.tx}px ${nach.y - ui.kamera.ty}px`;
      await tweenP(380, (p) => {
        const q = 1 - p;
        const s = 1 + (k - 1) * q;
        const tx = ui.kamera.tx + (von.x - nach.x) * q;
        const ty = ui.kamera.ty + (von.y - nach.y) * q;
        zeigeWelt(tx, ty, { s, origin });
        els.zimmer.style.opacity = String(clamp(1 - p / 0.4, 0, 1));
      }, { e: ease.inOut });
      zeigeWelt(ui.kamera.tx, ui.kamera.ty, { origin: "" });
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

  // Wohnen hier nur Tiere mit allen Sternen, glänzt das Zimmer golden.
  function passeGoldAn() {
    const svg = els.zimmerBuehne?.querySelector("svg");
    if (svg) svg.classList.toggle("is-strahlt", ui.zimmer >= 0 && wohnungStrahlt(aktStock()));
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
    passeGoldAn();
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
        const t = knopf(`bau-zimmertier${traum ? " is-traum" : ""}${voll ? " is-alle" : ""}`, `${tier.n}: ${voll ? "alle drei Stufen" : `Stufe ${stufeName(st5)}, ${st5.stufeAnzahl} von ${st5.stufeTotal} Sternen`}${traum ? ", hat den Traumjob" : ""}. Antippen für mehr.`,
          `${bild(tier)}${voll ? "" : `<span class="bau-sternreihe">${sternReiheHtml(st5)}</span>`}<span class="bau-sternzahl">${stufeHtml(st5)}${voll ? "" : `${st5.stufeAnzahl}/${st5.stufeTotal}`}</span>${voll ? `<span class="bau-zimmertier-pokal" aria-hidden="true">🏆</span>` : ""}${traum ? abzeichen : ""}<span class="bau-laune" aria-hidden="true">${laune.emoji}${tier.weh ? "🩹" : ""}</span>`,
          () => oeffneTafel(tier.seed));
        els.zimmerKopf.append(t);
      });
      return;
    }
    // Ein Gästezimmer im Hotel: der Feriengast mit seinen Wünschen.
    if (st.gast && ui.slot === 0) {
      const g = st.gast;
      const gs = S().gastSterne(ui.zimmer);
      els.zimmerKopf.append(knopf("bau-zimmertier is-gast", `${g.n}, Feriengast: ${gs.anzahl} von ${gs.total} Wünschen erfüllt. Antippen für mehr.`,
        `${bild(g)}<span class="bau-zimmertier-name">${textSicher(g.n)} 🧳</span><span class="bau-sternzahl">${gs.anzahl}/${gs.total}</span>`, () => oeffneGastTafel(g.seed)));
    }
    // Wie viele Plätze das Zimmer hat: so viele verschiedene passende Dinge
    // darin stehen (höchstens zwölf) – und wie viele schon belegt sind.
    const p = S().platzZimmer?.(ui.haus, ui.zimmer, ui.slot);
    if (p) {
      const satz = p.platz === 0
        ? "Hier hat noch niemand Platz. Jedes Ding, das in dieses Zimmer gehört, gibt einen Platz."
        : `In diesem Zimmer sind ${p.belegt} von ${p.platz} Plätzen belegt. ${p.platz < p.max ? "Jedes neue passende Ding gibt einen Platz mehr – bis zu zwölf." : "Mehr Plätze gehen nicht. Für noch mehr Bewohner braucht es ein zweites solches Zimmer."}`;
      els.zimmerKopf.append(knopf(`bau-platz${p.platz > 0 && p.belegt >= p.platz ? " is-voll" : ""}`, satz,
        `${svgVon(`<path d="M7 4h10v8H7z" fill="#ffd166" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 12h14v3H5zM7 15v5M17 15v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`, "0 0 24 24")}<span>${p.belegt}/${p.platz}</span>`,
        () => sag(satz)));
    }
    // Ein Zimmer in Spital, Dorf, Büro oder Hotel: nur, wer hier den Traumjob
    // hat oder sich dieses Zimmer wünscht – ohne die Sterne der Wohnung.
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

  // Die Sterne der Stufe als Reihe (gelb, grün, blau, lila, gold).
  function sternReiheHtml(st) {
    const s = (voll, f) => `<i class="bau-stern is-${f}${voll ? " is-voll" : ""}"></i>`;
    return ["gelb", "gruen", "blau", "lila", "gold"].map((f) => (st[f] || []).map((v) => s(v, f)).join("")).join("");
  }
  // Die Stufe als kleines Abzeichen: «Silber 3/5».
  function stufeHtml(st) {
    if (st.fertig) return `<span class="bau-stufe is-gold" aria-hidden="true">${medaille(3, 18)}</span>`;
    return `<span class="bau-stufe is-${["", "bronze", "silber", "gold"][st.stufe] || "bronze"}" aria-hidden="true">${medaille(st.stufe, 18)}</span>`;
  }
  const stufeName = (st) => K().STUFEN?.[(st.stufe || 1) - 1]?.name || "Bronze";

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
    // Ein kleines Spiel in diesem Zimmer (bau-spiele.js).
    if (z?.raum && SP()?.hat?.(z.raum)) {
      const name = SP().SPIELE?.[z.raum]?.name || "Spielen";
      const geschafft = (S().lesen().album?.spiele || []).includes(z.raum);
      els.werkzeug.append(knopf(`bau-rund bau-spielknopf${geschafft ? "" : " is-neu"}`, `Spielen: ${name}`, svgVon(WUERFEL, "0 0 24 24"), () => starteSpiel(z.raum)));
    }
  }

  // Ein Spiel im Zimmer: als Ebene über der Bauecke. Wer im Zimmer ist, spielt
  // mit (der Kunde, der Gast, der Patient). Beim ersten Mal ein Stern.
  const WUERFEL = `<rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="#ffffff" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.7" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.7" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.7" fill="currentColor"/>`;
  function starteSpiel(raumId) {
    if (ui.spiel || !SP()?.starte || !ui.host?.isConnected) return;
    waehleAus(null);
    const wer = [...tiere.values()].find((t) => t.g.isConnected && !t.tier.istBaby)?.tier
      || S().zimmerTiere(ui.haus, ui.zimmer, ui.slot)[0]?.tier || aktStock()?.tiere?.[0] || null;
    const figur = wer ? { art: wer.a, variante: S().hash(wer.seed) % (String(wer.a).startsWith("m_") ? 256 : 4) } : null;
    let schliessen = null;
    let offen = true;
    const zu = () => {
      if (!offen) return;
      offen = false;
      ui.spiel = null;
      if (ui.zimmer >= 0) hilfeZimmer();
    };
    schliessen = SP().starte({
      host: ui.host, raumId, sag, klang, figur,
      fertig: () => {
        if (!S().spielGeschafft(raumId)) return;
        band(`<span class="bau-sternband-emoji" aria-hidden="true">🎲</span>`, "Spiel geschafft!", "Das erste Mal: ein Stern für das Dorf.", "is-bonus");
        aktualisiereLeiterKnopf();
        zeichneWerkzeug();
      },
      geschlossen: () => { schliessen = null; zu(); },
    });
    if (typeof schliessen !== "function") { offen = false; return; }
    // Der Zurück-Knopf schliesst das Spiel.
    ui.spiel = () => { const s = schliessen; schliessen = null; zu(); s?.(); };
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
      ...(wohnung ? [{ id: "tiere", name: menschen() ? "Was Menschen mögen" : "Was Tiere mögen", icon: `<span class="bau-reiter-emoji">${menschen() ? "🧸" : "🐾"}</span>` }] : []),
      ...(saisonDinge().length ? [{ id: "saison", name: `Dinge für den ${K().JAHRESZEITEN?.[S().jahreszeit()]?.name || "Herbst"}`, icon: `<span class="bau-reiter-emoji">${{ fruehling: "🌷", sommer: "☀️", herbst: "🍂", winter: "⛄" }[S().jahreszeit()] || "🍂"}</span>` }] : []),
      ...(S().schaetzeFrei?.() ? [{ id: "schaetze", name: "Goldene Schätze", icon: `<span class="bau-reiter-emoji">✨</span>` }] : []),
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
    if (id === "tiere") return (menschen() ? K().lieblingeMenschen() : K().LIEBLINGS).filter((x) => M0.DINGE[x]);
    if (id === "saison") return saisonDinge();
    if (id === "schaetze") return (M0.SCHAETZE || []).filter((x) => M0.DINGE[x]);
    const lieb = new Set(menschen() ? K().lieblingeMenschen() : K().LIEBLINGS);
    const eigene = K().dingeFuer(raumId).filter((x) => !lieb.has(x) || !aktStock()?.tiere?.length);
    const gewuenscht = gewuenschteDinge();
    return [...eigene.filter((x) => gewuenscht.has(x)), ...eigene.filter((x) => !gewuenscht.has(x))];
  }

  // Wo ein gewünschtes Ding in der Schublade liegt: zuerst das vorgeschlagene,
  // sonst eines mit derselben Eigenschaft – bei den Dingen des Zimmers, den
  // Lieblingsdingen der Tiere oder dem, was es überall gibt.
  // Die Dinge der Jahreszeit (bau-moebel-extra.js): in jedem Zimmer.
  function saisonDinge() { return (M().SAISON?.[S().jahreszeit?.()] || []).filter((x) => M().DINGE[x]); }

  function findeInSchublade(tag, zeige) {
    const raumId = aktZimmer()?.raum || "";
    const passt = (id) => M().DINGE[id]?.tags?.includes(tag);
    for (const reiter of ["zimmer", "tiere", "saison", "schaetze", "ueberall"]) {
      if (reiter === "tiere" && aktStock()?.art !== "wohnung") continue;
      if (reiter === "schaetze" && !S().schaetzeFrei?.()) continue;
      const liste = schubladeDinge(reiter, raumId);
      const id = liste.includes(zeige) ? zeige : liste.find(passt);
      if (id) return { reiter, id };
    }
    return null;
  }

  // Die Dinge, die sich die Bewohner noch wünschen (ein Stern im Knopf).
  function gewuenschteDinge() {
    const st = aktStock();
    const offen = (liste) => liste.filter((w) => w.tag && !w.erfuellt && ZIMMER_WUNSCH.includes(w.typ)).flatMap((w) => [w.tag, ...(w.dort ? [w.dort] : [])]);
    let tags = [];
    if (st?.art === "wohnung") tags = st.tiere.flatMap((t) => offen([...S().wuensche(t.seed), ...S().babyWuensche(t.seed)]));
    else if (st?.gast && ui.slot === 0) tags = offen(S().gastWunschListe(ui.zimmer));
    if (!tags.length) return new Set();
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
      const glueck = e.target.closest?.(".bau-gluecksstern");
      if (glueck) { griff = null; e.preventDefault(); findeGluecksstern(glueck); return; }
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
      // Einen Bewohner im Zimmer an eine andere Stelle tragen.
      if (griff?.typ === "tier" && e.pointerId === griff.id) {
        const t = tiere.get(griff.el);
        if (!t || (!griff.bewegt && Math.hypot(e.clientX - griff.x0, e.clientY - griff.y0) < 10)) return;
        if (!griff.bewegt) { griff.bewegt = true; try { els.zimmerBuehne.setPointerCapture(e.pointerId); } catch { /* egal */ } }
        const m = t.g.parentNode?.getScreenCTM?.();
        if (!m) return;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        t.x = clamp(p.x, RAND, t.breite - RAND);
        t.ziel = t.x;
        t.modus = "steht";
        t.y = S().GEO.STAND - 14;
        stelleTier(t, 0);
        return;
      }
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
        const t = tiere.get(g.el);
        if (g.bewegt && t) { t.y = S().GEO.STAND + 2; t.huepf = 1; t.bis = performance.now() + 5000; wecke(); return; }
        if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 10) oeffneTierOderGast(g.el.getAttribute("data-seed"));
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
    if (st?.gast) erfuelltVorher.set(st.gast.seed, S().gastWunschListe(ui.zimmer).filter((w) => w.erfuellt).map((w) => w.id));
  }
  // Was ein Bewohner zum erfüllten Wunsch sagt.
  function dankFuer(w) {
    if (w?.tag && ZIMMER_WUNSCH.includes(w.typ)) return `Juhu, ${K().DING_WUENSCHE[w.tag]?.ein || "danke"}! Danke!`;
    if (w?.typ === "farbe" || w?.typ === "boden") return "Juhu, meine Lieblingsfarbe! Danke!";
    return "Danke!";
  }
  function pruefeDank() {
    const st = aktStock();
    // Ein Feriengast im Gästezimmer dankt auch.
    if (st?.gast && ui.slot === 0) {
      const g = st.gast;
      const liste = S().gastWunschListe(ui.zimmer);
      const jetzt = liste.filter((w) => w.erfuellt).map((w) => w.id);
      const vorher = erfuelltVorher.get(g.seed);
      erfuelltVorher.set(g.seed, jetzt);
      const neu = vorher ? jetzt.filter((id) => !vorher.includes(id)) : [];
      if (!neu.length) return;
      for (const t of tiere.values()) if (t.tier.seed === g.seed) { t.huepf = 1; blaseAnTier(t, `<text x="0" y="8" text-anchor="middle" font-size="26">💛</text>`, 2200); wecke(); }
      klang("correct");
      sag(`${g.n}: ${dankFuer(liste.find((x) => x.id === neu[0]))}`);
      zeichneZimmerKopf();
      return;
    }
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
      sag(`${tier.n}: ${dankFuer(w)}`);
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
    hilfe("Hier siehst du alle Bewohner des Wohnhauses: auf welcher Stufe sie sind, wie viele Sterne sie haben, ihren Traumjob und ihre Wünsche. Was noch fehlt, ist bunt; was erfüllt ist, hat einen Haken. Tippe auf einen Bewohner, dann siehst du alles über ihn.");
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
    const m = menschen();
    const wer = alle.length === 1 ? (m ? "Ein Mensch wohnt" : "Ein Tier wohnt") : `${alle.length} ${m ? "Menschen" : "Tiere"} wohnen`;
    const eines = m ? "Einer" : "Eines";
    const vollSatz = voll === 0 ? "" : voll === 1 ? ` ${eines} hat schon alle drei Stufen geschafft.` : ` ${voll} haben schon alle drei Stufen geschafft.`;
    const traumSatz = traum === 0 ? `Noch ${m ? "keiner" : "keines"} hat seinen Traumjob.` : traum === 1 ? `${eines} hat seinen Traumjob.` : `${traum} haben ihren Traumjob.`;
    const fehlt = total - anzahl;
    const fehltSatz = fehlt <= 0 ? "Mehr gibt es gerade nicht." : fehlt === 1 ? "Ein Stern fehlt noch." : `${fehlt} fehlen noch.`;
    return `${wer} im Wohnhaus. Zusammen haben sie ${anzahl === 1 ? "einen Stern" : `${anzahl} Sterne`}. ${fehltSatz}${vollSatz} ${traumSatz}`;
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
    const legende = el("p", "bau-legende bau-lies", { "data-lies": "Bunte Bilder: Das wünscht sich der Bewohner noch. Mit Haken: schon erfüllt. Gelb für die Wohnung, grün für das Wohnhaus, blau für die anderen Häuser, lila für die Lage der Wohnung, Gold für den Traumjob." });
    legende.innerHTML = `<i class="bau-stern is-gelb is-voll"></i> Wohnung <i class="bau-stern is-gruen is-voll"></i> Wohnhaus <i class="bau-stern is-blau is-voll"></i> andere Häuser <i class="bau-stern is-lila is-voll"></i> Lage <i class="bau-stern is-gold is-voll"></i> Traumjob · <span class="bau-legende-haken" aria-hidden="true">✓</span> schon erfüllt`;
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
    const wuensche = [...S().wuensche(tier.seed), ...S().babyWuensche(tier.seed)];
    const offen = wuensche.filter((w) => !w.erfuellt);
    const figur = S().figurVon(tier);
    const wunschSatz = offen.length === 0 ? "Alle Wünsche sind erfüllt." : offen.length === 1 ? "Ein Wunsch fehlt noch." : `${offen.length} Wünsche fehlen noch.`;
    const traumSatz = traumRaum ? ` Traumjob: ${traumRaum.name}${hatTraum ? " – geschafft!" : "."}` : "";
    const label = `${tier.n}, ${art?.der || ""}. ${alleSterne ? "Alle drei Stufen geschafft!" : `Stufe ${stufeName(sterne)}: ${sterne.stufeAnzahl} von ${sterne.stufeTotal} Sternen.`}${traumSatz} ${wunschSatz}`;
    const bilder = [...offen, ...wuensche.filter((w) => w.erfuellt)].map((w) =>
      `<span class="bau-bewohner-wunsch is-${w.stern}${w.erfuellt ? " is-erfuellt" : ""}">${svgVon(wunschBild(w, 32), "-19 -19 38 38")}</span>`).join("");
    return knopf(`bau-bewohner${hatTraum ? " is-traum" : ""}${alleSterne ? " is-alle" : ""}`, label,
      `<span class="bau-bewohner-bild">${tierBildchen(tier, 66, 80)}${figur ? `<span class="bau-bewohner-buch" aria-hidden="true">📖</span>` : ""}</span>` +
      `<span class="bau-bewohner-text">` +
      `<span class="bau-bewohner-name"><b>${textSicher(tier.n)}</b> <span class="bau-bewohner-laune" aria-hidden="true">${laune.emoji}${tier.weh ? " 🩹" : ""}${tier.baby ? " 👶" : ""}</span></span>` +
      `<span class="bau-bewohner-art">${textSicher(art?.name || "")}</span>` +
      `<span class="bau-bewohner-sterne">${stufeHtml(sterne)}${alleSterne ? `<i class="bau-stern is-gold is-voll"></i><span class="bau-bewohner-alle">🏆 Alle Stufen!</span>` : `<span class="bau-sternreihe">${sternReiheHtml(sterne)}</span><span>${sterne.stufeAnzahl}/${sterne.stufeTotal}</span>`}</span>` +
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
    tafelBox();
    fuelleTafel();
    const laune = S().laune(seed);
    sag(`${ref.tier.n}, ${K().TIERE[ref.tier.a].der}. ${laune.text}`);
    hilfe(`Hier siehst du alle Wünsche. Jeder Bewohner hat drei Stufen: Bronze, Silber und Gold. Sind alle Wünsche einer Stufe erfüllt, kommen neue, schwierigere. Gelbe Sterne sind Wünsche für die Wohnung, grüne für das Wohnhaus, blaue für die anderen Häuser, lila für die Lage der Wohnung. Der goldene Stern ist der Traumjob. Oben wechselst du zu den Mitbewohnern. Ist das Vorlesen an, liest ein Tipp auf einen Text ihn vor.`);
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
    if (ui.tafel.gast) { fuelleGastTafel(); return; }
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
    // Gleich darunter, gross: die Stufe und ihre Sterne – und ein Wehwehchen.
    karte.append(kopf, sternKachel(tier, sterne));
    const weh = wehTeil(tier);
    if (weh) karte.append(weh);
    // Wo es gerade ist – mit dem Weg dorthin.
    const wo = S().aufenthalt(tier.seed);
    const woZeile = el("div", `bau-tafel-wo${wo?.wo === "daheim" ? " is-daheim" : ""}`);
    const woText = `${tier.n} ${S().woText(tier.seed)}.`;
    woZeile.append(el("p", "bau-lies", { html: `<span aria-hidden="true">${wo?.wo === "arbeit" ? "💼" : wo?.wo === "besuch" ? "🚶" : "🏠"}</span> ${textSicher(woText)}`, "data-lies": woText }));
    if (wo) woZeile.append(knopf("bau-knopf-klein bau-hingehen", `Zu ${tier.n} gehen`, `Hingehen →`, () => { schliesseTafel(); geheZu(wo.haus, wo.index, wo.slot, tier.seed); }));
    karte.append(woZeile);
    // Die Wünsche der Stufe.
    const liste = el("ul", "bau-wunschliste");
    const wuensche = S().wuensche(tier.seed);
    wuensche.forEach((w) => liste.append(wunschZeile(tier.seed, w)));
    if (!wuensche.length && sterne.fertig) {
      const satz = `${tier.n} hat alle drei Stufen geschafft! Alle Wünsche sind erfüllt. Danke!`;
      karte.append(el("p", "bau-tafel-fertig bau-lies", { html: `<span aria-hidden="true">👑</span> ${textSicher(satz)}`, "data-lies": satz }));
    } else karte.append(liste, sternLegende(sterne.stufe === 1));
    // Ein Baby und was es braucht.
    const baby = babyTeil(tier);
    if (baby) karte.append(baby);
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

  // Die Sterne eines Bewohners als Kachel: die drei Stufen als Medaillen, die
  // Sterne der Stufe gross (geholte gefüllt, offene hohl). Hat er alle drei
  // Stufen geschafft, wird die Kachel golden – mit Pokal.
  function sternKachel(tier, sterne) {
    const alle = sterne.fertig || (sterne.total > 0 && sterne.anzahl === sterne.total);
    const fehlt = sterne.stufeTotal - sterne.stufeAnzahl;
    const noch = fehlt === 1 ? "Noch ein Wunsch" : `Noch ${fehlt} Wünsche`;
    const name = stufeName(sterne);
    const satz = alle
      ? `${tier.n} hat alle drei Stufen geschafft! ${tier.n} ist überglücklich.`
      : `Stufe ${name}: ${sterne.stufeAnzahl} von ${sterne.stufeTotal} Sternen. ${noch} – unten steht, welche. Insgesamt ${sterne.anzahl} von ${sterne.total} Sternen.`;
    const box = el("div", `bau-sternkachel bau-lies${alle ? " is-alle" : ""}`, { "data-lies": satz });
    const medaillen = (K().STUFEN || []).map((s) => {
      const geschafft = alle || s.nr < sterne.stufe;
      const jetzt = !alle && s.nr === sterne.stufe;
      return `<span class="bau-sternkachel-stufe${geschafft ? " is-geschafft" : ""}${jetzt ? " is-jetzt" : ""}">${medaille(s.nr, 26)}<small>${s.name}</small></span>`;
    }).join("");
    box.innerHTML = `<span class="bau-sternkachel-stufen" aria-hidden="true">${medaillen}</span>` +
      (alle ? "" : `<span class="bau-sternkachel-sterne" aria-hidden="true">${["gelb", "gruen", "blau", "lila", "gold"].map((f) => (sterne[f] || []).map((v) => `<i class="bau-stern bau-stern-gross is-${f}${v ? " is-voll" : ""}"></i>`).join("")).join("")}</span>`) +
      `<span class="bau-sternkachel-text">${alle
        ? `<b>Alle drei Stufen!</b><span>${textSicher(tier.n)} ist überglücklich.</span>`
        : `<b>Stufe ${textSicher(name)}: ${sterne.stufeAnzahl} von ${sterne.stufeTotal} Sternen</b><span>${noch} – unten steht, welche. Insgesamt ${sterne.anzahl} von ${sterne.total}.</span>`}</span>` +
      (alle ? `<span class="bau-sternkachel-pokal" aria-hidden="true">🏆</span>` : "");
    return box;
  }

  // Ein Wehwehchen auf der Tafel: was weh tut – und der Weg ins Spital.
  function wehTeil(tier) {
    const weh = K().WEH?.[tier.weh?.art];
    if (!weh) return null;
    const box = el("div", "bau-tafel-weh");
    const satz = `${weh.ich} Wer hilft? Bring den Patienten in die richtige Abteilung im Spital.`;
    box.append(el("p", "bau-lies", { html: `<span aria-hidden="true">🩹</span> <b>${textSicher(weh.kurz)}:</b> ${textSicher(weh.ich)}`, "data-lies": satz }));
    box.append(knopf("bau-knopf-klein bau-insspital", `${tier.n} ins Spital bringen`, "🏥 Ins Spital bringen", () => zeigeSpitalWahl(tier.seed)));
    return box;
  }

  // Ein Baby auf der Tafel: wie es heisst und was es braucht (rosa Sterne –
  // jeder ist ein Stern für das Dorf).
  function babyTeil(tier) {
    const baby = tier.baby;
    if (!baby) return null;
    const box = el("section", "bau-tafel-baby");
    const babyTier = { a: baby.a, n: baby.n, seed: `${tier.seed}~b`, istBaby: true, eltern: tier.seed };
    const kopf = el("div", "bau-tafel-baby-kopf bau-lies", { "data-lies": `Das Baby heisst ${baby.n}. Es braucht ein paar Dinge. Jeder erfüllte Wunsch ist ein Stern für das Dorf. Bald ist es gross und zieht in eine eigene Wohnung.` });
    kopf.innerHTML = `${tierBildchen(babyTier, 44, 50)}<span><b>Baby ${textSicher(baby.n)}</b><small>Jeder erfüllte Wunsch ist ein Stern für das Dorf.</small></span>`;
    const liste = el("ul", "bau-wunschliste is-baby");
    S().babyWuensche(tier.seed).forEach((w) => liste.append(wunschZeile(tier.seed, w)));
    box.append(kopf, liste);
    return box;
  }

  // Eine Zeile der Wunschliste: Stern, Bild, kurzer Text, «Zeig mir».
  function wunschZeile(seed, w) {
    const li = el("li", `bau-wunsch is-${w.stern}${w.erfuellt ? " is-erfuellt" : ""}${w.neu ? " is-neu" : ""}`);
    const b = knopf("bau-wunsch-text", w.text, `<i class="bau-stern is-${w.stern}${w.erfuellt ? " is-voll" : ""}"></i>${svgVon(wunschBild(w, 40), "-24 -24 48 48", "bau-wunsch-bild")}<span>${textSicher(w.kurz)}</span>${w.neu ? `<em>neu</em>` : ""}`, () => sag(w.erfuellt ? `${w.text} Das hast du schon erfüllt!` : w.text));
    li.append(b);
    if (!w.erfuellt) li.append(knopf("bau-zeig", "Zeig mir, wie", "→", () => zeigeWunsch(seed, w)));
    else li.append(el("span", "bau-haken", { "aria-hidden": "true", text: "✓" }));
    return li;
  }

  // Die Legende unter den Wünschen: welche Farbe wofür steht.
  function sternLegende(mitGold = true) {
    const legende = el("p", "bau-legende bau-lies", { "data-lies": `Gelbe Sterne: Wünsche für die Wohnung. Grüne: für das Wohnhaus. Blaue: für die anderen Häuser. Lila: wo die Wohnung im Haus liegt.${mitGold ? " Gold: der Traumjob." : ""}` });
    legende.innerHTML = `<i class="bau-stern is-gelb is-voll"></i> Wohnung <i class="bau-stern is-gruen is-voll"></i> Wohnhaus <i class="bau-stern is-blau is-voll"></i> andere Häuser <i class="bau-stern is-lila is-voll"></i> Lage${mitGold ? ` <i class="bau-stern is-gold is-voll"></i> Traumjob` : ""}`;
    return legende;
  }

  // Die Tafel öffnen oder die alte wiederverwenden.
  function tafelBox() {
    if (!els.tafel?.isConnected) {
      els.tafel = el("div", "bau-tafel", { role: "dialog", "aria-modal": "true" });
      els.tafel.addEventListener("click", (e) => { if (e.target === els.tafel) schliesseTafel({ zurueck: true }); });
      ui.host.append(els.tafel);
    }
    els.tafel.hidden = false;
    return els.tafel;
  }

  // ---------------------------------------------------------------------------
  // Die Gast-Tafel: was sich ein Feriengast wünscht
  // ---------------------------------------------------------------------------
  function oeffneGastTafel(seed) {
    const g = S().findeGast?.(seed);
    if (!g) return;
    if (ui.uebersicht) schliesseUebersicht({ weiter: true });
    ui.tafel = { gast: seed };
    tafelBox();
    fuelleTafel();
    sag(`${g.gast.n}, ${K().TIERE[g.gast.a]?.der || ""}. ${gastLaune(g).text}`);
    hilfe("Ein Feriengast wünscht sich alles ganz genau so, wie er es mag: im Gästezimmer und im Hotel. Sind alle Wünsche erfüllt, gibt er dem Hotel fünf Sterne – und das Dorf bekommt einen Stern. Tippe auf den Pfeil, dann zeige ich dir, wie.");
  }

  function gastLaune(g) {
    const s = S().gastSterne(g.index);
    if (s.total > 0 && s.anzahl === s.total) return { emoji: "🤩", text: "Alles ist perfekt! Bald reist der Gast zufrieden ab." };
    if (s.anzahl * 2 >= s.total) return { emoji: "😊", text: "Dem Gast gefällt es im Hotel." };
    return { emoji: "🙂", text: "Der Gast wünscht sich noch einiges." };
  }

  function fuelleGastTafel() {
    const g = S().findeGast?.(ui.tafel.gast);
    if (!g) { schliesseTafel(); return; }
    const { gast } = g;
    const katalog = K();
    const raum = katalog.RAEUME[g.stock.zimmer[0]?.raum];
    const laune = gastLaune(g);
    const s = S().gastSterne(g.index);
    const karte = el("div", "bau-tafel-karte is-gast");
    karte.append(knopf("bau-tafel-zu", "Schliessen", svgVon(KREUZ, "0 0 24 24"), () => schliesseTafel({ zurueck: true })));
    const kopf = el("div", "bau-tafel-kopf");
    kopf.innerHTML = `${tierBildchen(gast, 80, 100, "bau-tafel-tier")}` +
      `<div class="bau-tafel-wer"><h2>${textSicher(gast.n)} <span class="bau-gastmarke" aria-hidden="true">🧳</span></h2><p>${gross(katalog.TIERE[gast.a]?.der || "")} · Feriengast ${S().imRaum(raum?.id)} ${katalog.HAUS.hotel.im}</p>` +
      `<p class="bau-tafel-laune"><span aria-hidden="true">${laune.emoji}</span> ${textSicher(laune.text)}</p></div>`;
    karte.append(kopf);
    const alle = s.total > 0 && s.anzahl === s.total;
    const satz = alle ? "Alle Wünsche sind erfüllt! Das gibt bestimmt fünf Sterne für das Hotel." : `${s.anzahl} von ${s.total} Wünschen sind erfüllt. Sind alle erfüllt, gibt es fünf Sterne für das Hotel.`;
    const kachel = el("div", `bau-sternkachel bau-lies${alle ? " is-alle" : ""}`, { "data-lies": satz });
    kachel.innerHTML = `<span class="bau-sternkachel-sterne" aria-hidden="true">${S().gastWunschListe(g.index).map((w) => `<i class="bau-stern bau-stern-gross is-${w.stern}${w.erfuellt ? " is-voll" : ""}"></i>`).join("")}</span>` +
      `<span class="bau-sternkachel-text"><b>${s.anzahl} von ${s.total} Wünschen</b><span>${alle ? "Alles perfekt!" : "Alle erfüllt: fünf Sterne für das Hotel."}</span></span>`;
    karte.append(kachel);
    const liste = el("ul", "bau-wunschliste");
    S().gastWunschListe(g.index).forEach((w) => liste.append(wunschZeile(gast.seed, w)));
    karte.append(liste);
    // Wie gut das Hotel bisher war.
    const ruf = S().hotelRuf();
    if (ruf > 0) {
      const rufSatz = `Die Feriengäste geben dem Hotel im Schnitt ${ruf === 1 ? "einen Stern" : `${ruf} Sterne`}.`;
      karte.append(el("p", "bau-hotelruf bau-lies", { html: `<span class="bau-gaststerne" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<i class="bau-stern is-gold${n <= ruf ? " is-voll" : ""}"></i>`).join("")}</span> ${textSicher(rufSatz)}`, "data-lies": rufSatz }));
    }
    els.tafel.innerHTML = "";
    els.tafel.append(karte);
  }

  // "Zeig mir" für die Lage: im Wohnhaus die Stockwerke umstellen.
  async function zeigeLage(ref, w) {
    if (w.typ === "stock" && w.lage === "neben" && zimmerFehlt("wohnhaus", w.raum)) {
      await zeigeZimmerBauen("wohnhaus", w.raum);
      window.setTimeout(() => sag("Danach stellst du die Stockwerke mit dem Pfeil-Knopf so um, dass es gleich neben der Wohnung ist."), 3800);
      return;
    }
    if (ui.zimmer >= 0) await schliesseZimmer(true);
    if (ui.haus !== "wohnhaus") await zeigeHaus("wohnhaus", 1, { stockwerk: ref.index, ohneSprache: true });
    kameraAuf(ref.index);
    if (!ui.ordnen) schalteOrdnen(true, { stumm: true });
    const raum = K().RAEUME[w.raum];
    const satz = w.typ === "freund"
      ? "Schieb die Stockwerke mit den Pfeilen, bis die beiden gleich übereinander wohnen."
      : w.lage === "oben" ? "Schieb die Wohnung mit den Pfeilen nach oben – in eines der drei obersten Stockwerke."
        : w.lage === "unten" ? "Schieb die Wohnung mit den Pfeilen nach unten – ins Erdgeschoss, in den ersten oder in den zweiten Stock."
          : w.lage === "ruhig" ? "Über und unter der Wohnung soll kein Kinderzimmer sein. Schieb die Stockwerke mit den Pfeilen."
            : `Schieb die Stockwerke mit den Pfeilen, bis ${raum?.der || "das Zimmer"} gleich über oder unter der Wohnung ist.`;
    window.setTimeout(() => sag(satz), 1200);
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
    } else arbeitSatz = "Sucht noch Arbeit. Richte im Spital, im Dorf, im Büro oder im Hotel ein Zimmer ein!";
    box.append(el("p", "bau-arbeit bau-lies", { html: `<span aria-hidden="true">💼</span> ${textSicher(arbeitSatz)}`, "data-lies": `${tier.n}: ${arbeitSatz}` }));
    return box;
  }

  // Das Abzeichen des Traumjobs als kleines Bild (leer: noch nicht).
  function traumZeichen(titel = "", voll = true) {
    return `<span class="bau-traumzeichen-klein"${titel ? ` title="${titel}"` : ` aria-hidden="true"`}>${svgVon(`<g transform="translate(13 14)">${A().traumAbzeichen(voll)}</g>`, "0 0 28 26")}</span>`;
  }

  // Wer sich ein Zimmer wünscht oder dort den Traumjob hätte – für die Karten
  // der Zimmerwahl: So sieht man beim Bauen, was die Tiere froh macht.
  function werWillDas(hausId, raumId) {
    const traum = [];
    const wunsch = [];
    S().alleTiere().forEach(({ tier }) => {
      if (tier.traum === `${hausId}:${raumId}` && !S().hatTraumjob(tier.seed)) traum.push(tier);
      const w = S().wuensche(tier.seed).find((x) => !x.erfuellt && (x.typ === "raum" || x.typ === "fremd") && x.haus === hausId && x.raum === raumId);
      if (w) wunsch.push({ tier, stern: w.stern });
    });
    return { traum, wunsch };
  }
  // Oben links auf der Karte: das goldene Traumjob-Zeichen und ein Stern in
  // der Farbe des Wunsches, mit der Zahl, wenn es mehrere sind.
  function wunschMarken(wer) {
    if (!wer || (!wer.traum.length && !wer.wunsch.length)) return "";
    const zahl = (n) => (n > 1 ? `<b>${n}</b>` : "");
    const titel = [...wer.traum.map((t) => `Traumjob von ${t.n}`), ...wer.wunsch.map((w) => `Wunsch von ${w.tier.n}`)].join(", ");
    const traum = wer.traum.length ? `<span class="bau-wahl-marke is-traum">${traumZeichen("")}${zahl(wer.traum.length)}</span>` : "";
    const farbe = wer.wunsch.some((w) => w.stern === "blau") ? "blau" : "gruen";
    const wunsch = wer.wunsch.length ? `<span class="bau-wahl-marke is-wunsch"><i class="bau-stern is-${farbe} is-voll" aria-hidden="true"></i>${zahl(wer.wunsch.length)}</span>` : "";
    return `<span class="bau-wahl-marken" title="${textSicher(titel)}">${traum}${wunsch}</span>`;
  }
  function werSatz(wer) {
    if (!wer) return "";
    return [...wer.traum.map((t) => ` ${t.n} hätte hier den Traumjob!`), ...wer.wunsch.map((w) => ` ${w.tier.n} wünscht sich dieses Zimmer.`)].join("");
  }

  function zimmerFehlt(hausId, raumId) {
    return !(S().haus(hausId)?.stock || []).some((s) => s.zimmer.some((z) => z.raum === raumId));
  }

  function frageAuszug(tier) {
    if (!ui.tafel) return;
    const karte = els.tafel.querySelector(".bau-tafel-karte");
    const frageEl = el("div", "bau-frage-auszug", { role: "alertdialog" });
    frageEl.innerHTML = `<p>Soll ${textSicher(tier.n)} wirklich ausziehen? Dann zieht bald jemand Neues ein.</p>`;
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
    sag(`Soll ${tier.n} wirklich ausziehen? Dann zieht bald jemand Neues ein.`);
  }

  // "Zeig mir": zum Ding in der Schublade, zur Wand- oder Bodenfarbe, zum
  // Umstellen der Stockwerke (Lage) oder zum Haus, in dem das gewünschte
  // Zimmer fehlt. Auch für Feriengäste (ihr Gästezimmer im Hotel).
  const ZIMMER_WUNSCH = ["ding", "farbig", "anzahl", "ort", "zeit", "farbe", "boden"];
  async function zeigeWunsch(seed, w) {
    const ref = S().findeTier(seed);
    const gast = ref ? null : S().findeGast?.(seed);
    const ziel = ref ? { hausId: ref.hausId, index: ref.index } : gast ? { hausId: "hotel", index: gast.index } : null;
    if (!ziel) return;
    schliesseTafel();
    sag(w.text);
    if (ZIMMER_WUNSCH.includes(w.typ)) {
      if (ui.haus !== ziel.hausId) await zeigeHaus(ziel.hausId, 1, { stockwerk: ziel.index, ohneSprache: true });
      if (ui.zimmer !== ziel.index || ui.slot !== 0) {
        if (ui.zimmer >= 0) await schliesseZimmer(true);
        await oeffneZimmer(ziel.index, 0);
      }
      if (w.typ === "farbe" || w.typ === "boden") {
        ui.schublade = w.typ === "boden" ? "boden" : "wand";
        zeichneSchublade();
        const name = K().FARBE[w.farbe]?.name;
        const knopfEl = els.schublade.querySelector(`.bau-farbe[aria-label="${w.typ === "boden" ? `Boden ${name}` : name}"]`);
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
      // Ein Wunsch in einer Farbe: Danach mit dem Pinsel des Dings anmalen.
      if (w.typ === "farbig") window.setTimeout(() => sag("Stell es ins Zimmer, tippe es an und mal es mit der richtigen Farbe an."), 2600);
      return;
    }
    if ((w.typ === "stock" || w.typ === "freund") && ref) { await zeigeLage(ref, w); return; }
    // Das Zimmer gibt es schon, aber es hat keinen Platz frei: hinein und
    // passende Dinge dazustellen – sonst ein neues bauen.
    if (w.haus && w.raum && !zimmerFehlt(w.haus, w.raum) && await zeigeVollesZimmer(w.haus, w.raum)) return;
    zeigeZimmerBauen(w.haus, w.raum);
  }

  // Ein Zimmer dieser Art, das noch Plätze bekommen kann (weniger als zwölf
  // verschiedene passende Dinge): hinein, und die Schublade zeigt ein Ding,
  // das noch fehlt. Zurück: ob es so ein Zimmer gab.
  async function zeigeVollesZimmer(hausId, raumId) {
    const max = 12;
    let ziel = null;
    (S().haus(hausId)?.stock || []).forEach((s, index) => s.zimmer.forEach((z, slot) => {
      if (ziel || z.raum !== raumId) return;
      const p = S().platzZimmer?.(hausId, index, slot);
      if (p && p.platz < (p.max || max)) ziel = { index, slot, platz: p.platz };
    }));
    if (!ziel) {
      sag("Dieses Zimmer ist ganz voll. Baue noch eines dazu!");
      await warte(1400);
      return false;
    }
    if (ui.zimmer >= 0) await schliesseZimmer(true);
    if (ui.haus !== hausId) await zeigeHaus(hausId, 1, { stockwerk: ziel.index, ohneSprache: true });
    await oeffneZimmer(ziel.index, ziel.slot);
    ui.schublade = "zimmer";
    zeichneSchublade();
    const drin = new Set((aktZimmer()?.dinge || []).map((d) => d.i));
    const eigene = new Set(M().RAUM_DINGE?.[raumId] || []);
    const fehlt = schubladeDinge("zimmer", raumId).find((id) => eigene.has(id) && !drin.has(id));
    const knopfEl = fehlt ? els.schublade.querySelector(`[data-ding="${fehlt}"]`) : null;
    knopfEl?.scrollIntoView?.({ block: "nearest", inline: "center" });
    stupse(knopfEl);
    sag(ziel.platz === 0
      ? "Hier ist noch kein Platz: Das Zimmer ist leer. Jedes Ding, das hierher gehört, gibt einen Platz."
      : "Hier sind alle Plätze besetzt. Stell noch ein anderes Ding hinein, das hierher gehört – dann gibt es einen Platz mehr.");
    return true;
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
  // Das Sammelalbum: was es im Dorf schon alles gab
  // ---------------------------------------------------------------------------
  // Bleibt auch nach einem Neustart (bau-stand.js, album). Oben die Seiten:
  // Bewohner, Traumjobs, Zimmer, Dinge, Gäste, Spiele, Spital.
  const ALBUM_SEITEN = [
    { id: "bewohner", name: "Bewohner", emoji: "🦊" },
    { id: "jobs", name: "Traumjobs", emoji: "💼" },
    { id: "zimmer", name: "Zimmer", emoji: "🚪" },
    { id: "dinge", name: "Dinge", emoji: "🛋️" },
    { id: "gaeste", name: "Gäste", emoji: "🧳" },
    { id: "spiele", name: "Spiele", emoji: "🎲" },
    { id: "spital", name: "Spital", emoji: "🏥" },
  ];

  function oeffneAlbum() {
    if (!ui.host?.isConnected || ui.besetzt || ui.overlay || ui.ordnen) return;
    if (ui.tafel) schliesseTafel();
    if (ui.uebersicht) schliesseUebersicht({ weiter: true });
    if (ui.ruhm) schliesseRuhm();
    S().sammle?.();
    ui.album = true;
    ui.albumSeite = ui.albumSeite || "bewohner";
    if (!els.album?.isConnected) {
      els.album = el("div", "bau-uebersicht bau-album", { role: "dialog", "aria-modal": "true", "aria-label": "Sammelalbum" });
      els.album.addEventListener("click", (e) => { if (e.target === els.album) schliesseAlbum(); });
      ui.host.append(els.album);
    }
    els.album.hidden = false;
    fuelleAlbum();
    sag("Das Sammelalbum. Hier ist alles, was es in deinem Dorf schon gab – auch in früheren Dörfern. Oben wählst du eine Seite.");
    hilfe("Im Sammelalbum siehst du alle Bewohner, Traumjobs, Zimmer und Dinge, die es in deinem Dorf schon gab, dazu die Feriengäste, die Spiele und was im Spital geschah. Was noch fehlt, ist grau. Bei den seltenen Bewohnern steht, was sie anlockt.");
  }

  function schliesseAlbum() {
    ui.album = false;
    if (els.album) els.album.hidden = true;
    if (ui.zimmer >= 0) hilfeZimmer(); else hilfeHaus();
  }

  // Ein Feld im Album: ein Bild (oder grau mit Fragezeichen), ein Name.
  function albumFeld(bild, name, hat, satz, cls = "") {
    const b = knopf(`bau-album-feld${hat ? " is-hat" : ""}${cls ? ` ${cls}` : ""}`, satz || name,
      `<span class="bau-album-bild">${bild}${hat ? "" : `<b class="bau-album-frage" aria-hidden="true">?</b>`}</span><span class="bau-album-name">${textSicher(hat ? name : "???")}</span>`,
      () => sag(satz || name));
    return b;
  }
  function albumZahl(hat, alle) { return `${hat} von ${alle}`; }

  function fuelleAlbum() {
    if (!ui.album || !els.album) return;
    const katalog = K();
    const album = S().lesen().album || {};
    const liste = (k) => new Set(album[k] || []);
    const karte = el("div", "bau-uebersicht-karte bau-album-karte");
    karte.append(knopf("bau-uebersicht-zu", "Schliessen", svgVon(KREUZ, "0 0 24 24"), () => schliesseAlbum()));
    const kopf = el("div", "bau-uebersicht-kopf");
    kopf.append(el("h2", "", { text: "Sammelalbum" }));
    karte.append(kopf);
    const reiter = el("div", "bau-album-reiter", { role: "tablist" });
    ALBUM_SEITEN.forEach((seite) => {
      const b = knopf(`bau-album-tab${ui.albumSeite === seite.id ? " is-aktiv" : ""}`, seite.name, `<span aria-hidden="true">${seite.emoji}</span><span>${seite.name}</span>`, () => {
        ui.albumSeite = seite.id;
        sag(seite.name);
        fuelleAlbum();
      });
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", ui.albumSeite === seite.id ? "true" : "false");
      reiter.append(b);
    });
    karte.append(reiter);
    const inhalt = el("div", "bau-album-inhalt");
    const raster = (titel, satz, felder) => {
      const sek = el("section", "bau-album-gruppe");
      sek.append(el("h3", "bau-lies", { text: titel, "data-lies": satz || titel }));
      const r = el("div", "bau-album-raster");
      felder.forEach((f) => r.append(f));
      sek.append(r);
      inhalt.append(sek);
    };
    const seite = ui.albumSeite;
    if (seite === "bewohner") {
      const arten = liste("arten");
      const figuren = liste("figuren");
      const tierFeld = (a) => {
        const t = katalog.TIERE[a];
        const hat = arten.has(a);
        const bild = tierBildchen({ a, n: t.name, seed: `album-${a}` }, 54, 62, hat ? "" : "is-grau");
        const satz = hat ? `${t.name}. ${t.fakt || ""}`.trim() : t.selten && t.lockt ? `Ein seltener Bewohner. ${t.lockt}` : "Dieser Bewohner war noch nie in deinem Dorf.";
        return albumFeld(bild, t.name, hat, satz, t.selten ? "is-selten" : "");
      };
      const tierIds = katalog.TIER_IDS || [];
      const selten = katalog.SELTEN_IDS || [];
      const menschenIds = katalog.MENSCH_IDS || [];
      const zaehle = (ids) => ids.filter((a) => arten.has(a)).length;
      raster(`Tiere · ${albumZahl(zaehle(tierIds), tierIds.length)}`, `Tiere: ${zaehle(tierIds)} von ${tierIds.length}.`, tierIds.map(tierFeld));
      raster(`Seltene Tiere · ${albumZahl(zaehle(selten), selten.length)}`, "Seltene Tiere kommen nur, wenn es im Dorf etwas Besonderes gibt. Tippe auf ein graues Feld, dann hörst du, was.", selten.map(tierFeld));
      raster(`Menschen · ${albumZahl(zaehle(menschenIds), menschenIds.length)}`, `Menschen: ${zaehle(menschenIds)} von ${menschenIds.length}.`, menschenIds.map(tierFeld));
      const figs = katalog.FIGUREN || [];
      raster(`Figuren aus den Büchern · ${albumZahl(figs.filter((f) => figuren.has(f.id)).length, figs.length)}`, "Figuren aus den Büchern der Leseecke.", figs.map((f) => {
        const hat = figuren.has(f.id);
        const bild = tierBildchen({ a: f.a, n: f.n, seed: `album-${f.id}` }, 54, 62, hat ? "" : "is-grau");
        return albumFeld(bild, f.n, hat, hat ? f.ich : `Eine Figur aus dem Buch «${f.buecher[0]?.titel || ""}».`);
      }));
    } else if (seite === "jobs") {
      const jobs = liste("jobs");
      katalog.HAEUSER.filter((h) => h.id !== "wohnhaus").forEach((haus) => {
        const ids = haus.raeume.filter((id) => katalog.JOBS[id]);
        if (!ids.length) return;
        raster(`${haus.name} · ${albumZahl(ids.filter((id) => jobs.has(id)).length, ids.length)}`, `Traumjobs ${haus.im}.`, ids.map((id) => {
          const r = katalog.RAEUME[id];
          return albumFeld(svgVon(dingBild(r.icon, 40), "-24 -24 48 48"), r.name, jobs.has(id), jobs.has(id) ? `${r.der}: ${katalog.JOBS[id]}. Hier hatte schon jemand den Traumjob!` : `${r.der}: Hier hatte noch niemand den Traumjob.`);
        }));
      });
    } else if (seite === "zimmer") {
      const raeume = liste("raeume");
      katalog.HAEUSER.forEach((haus) => {
        const ids = haus.raeume;
        raster(`${haus.name} · ${albumZahl(ids.filter((id) => raeume.has(id)).length, ids.length)}`, `Zimmer ${haus.im}.`, ids.map((id) => {
          const r = katalog.RAEUME[id];
          return albumFeld(svgVon(dingBild(r.icon, 40), "-24 -24 48 48"), r.name, raeume.has(id), raeume.has(id) ? `${r.der}. ${r.text}` : `${r.der}: Das hast du noch nie eingerichtet.`);
        }));
      });
    } else if (seite === "dinge") {
      const dinge = liste("dinge");
      const alle = Object.keys(M().DINGE);
      const hat = alle.filter((id) => dinge.has(id));
      const satz = "Hier sind alle Dinge, die du schon in deine Zimmer gestellt hast.";
      const balken = el("div", "bau-album-balken bau-lies", { "data-lies": satz, role: "img", "aria-label": satz });
      balken.innerHTML = `<span style="width:${Math.round((100 * hat.length) / Math.max(1, alle.length))}%"></span><b>${hat.length} / ${alle.length}</b>`;
      inhalt.append(balken);
      // Nur die Dinge, die es schon gab (über tausend Bilder wären zu viel
      // für ein Tablet) – nach Namen geordnet.
      raster(hat.length ? "Diese Dinge hast du schon in deine Zimmer gestellt" : "Noch steht kein Ding in einem Zimmer", "", [...hat].sort((a, b) => M().DINGE[a].name.localeCompare(M().DINGE[b].name, "de")).map((id) => {
        const d = M().DINGE[id];
        return albumFeld(svgVon(dingBild(id, 34), "-20 -20 40 40"), d.name, true, d.name, "is-klein");
      }));
    } else if (seite === "gaeste") {
      const gaeste = liste("gaeste");
      const ids = [...(katalog.TIER_IDS || []), ...(katalog.SELTEN_IDS || []), ...(katalog.MENSCH_IDS || [])];
      const bewertungen = S().lesen().bewertungen || [];
      const satz = gaeste.size ? `Schon ${gaeste.size === 1 ? "ein Feriengast" : `${gaeste.size} verschiedene Feriengäste`} waren im Hotel.` : "Noch war kein Feriengast im Hotel. Baue im Hotel eine Rezeption und ein Gästezimmer mit Bett!";
      inhalt.append(el("p", "bau-album-satz bau-lies", { text: satz }));
      if (bewertungen.length) {
        const ruf = S().hotelRuf();
        inhalt.append(el("p", "bau-hotelruf bau-lies", { html: `<span class="bau-gaststerne" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<i class="bau-stern is-gold${n <= ruf ? " is-voll" : ""}"></i>`).join("")}</span> Die Feriengäste geben dem Hotel im Schnitt ${ruf === 1 ? "einen Stern" : `${ruf} Sterne`}.` }));
      }
      raster("Feriengäste", "", ids.map((a) => {
        const t = katalog.TIERE[a];
        const hat = gaeste.has(a);
        return albumFeld(tierBildchen({ a, n: t.name, seed: `gast-${a}` }, 54, 62, hat ? "" : "is-grau"), t.name, hat, hat ? `${t.der} war schon als Feriengast im Hotel.` : "Dieser Feriengast war noch nie im Hotel.");
      }));
    } else if (seite === "spiele") {
      const spiele = liste("spiele");
      const raeume = Object.keys(SP()?.SPIELE || {});
      const satz = raeume.length ? `In manchen Zimmern gibt es ein kleines Spiel: Tippe dort auf den Würfel-Knopf. Du hast schon ${spiele.size} von ${raeume.length} Spielen geschafft.` : "Bald gibt es Spiele in den Zimmern.";
      inhalt.append(el("p", "bau-album-satz bau-lies", { text: satz }));
      raster("Spiele", "", raeume.map((id) => {
        const r = katalog.RAEUME[id];
        if (!r) return el("span");
        const hat = spiele.has(id);
        const titel = SP()?.SPIELE?.[id]?.name || r.name;
        return albumFeld(svgVon(dingBild(r.icon, 40), "-24 -24 48 48"), titel, hat, hat ? `${titel}: geschafft!` : `Dieses Spiel findest du ${S().imRaum(id)} ${katalog.HAUS[r.haus]?.im || ""}.`);
      }));
    } else if (seite === "spital") {
      const z = (k) => Number(album[k]) || 0;
      const zeile = (emoji, satz) => inhalt.append(el("p", "bau-album-satz bau-lies", { html: `<span aria-hidden="true">${emoji}</span> ${textSicher(satz)}`, "data-lies": satz }));
      zeile("👶", z("babys") === 0 ? "Noch hat der Storch kein Baby gebracht." : z("babys") === 1 ? "Der Storch hat schon ein Baby gebracht." : `Der Storch hat schon ${z("babys")} Babys gebracht.`);
      zeile("🩹", z("geheilt") === 0 ? "Noch hat das Spital niemandem geholfen." : z("geheilt") === 1 ? "Das Spital hat schon einmal geholfen." : `Das Spital hat schon ${z("geheilt")} Mal geholfen.`);
      zeile("🚁", z("gerettet") === 0 ? "Noch ist der Rettungshelikopter nie gelandet." : z("gerettet") === 1 ? "Der Rettungshelikopter ist schon einmal gelandet." : `Der Rettungshelikopter ist schon ${z("gerettet")} Mal gelandet.`);
      const weh = liste("weh");
      raster("Wehwehchen", "Bei diesen Wehwehchen hat das Spital schon geholfen.", Object.entries(katalog.WEH || {}).map(([id, w]) => {
        const r = katalog.RAEUME[w.raum];
        return albumFeld(svgVon(dingBild(r?.icon, 40), "-24 -24 48 48"), w.kurz, weh.has(id), weh.has(id) ? `${w.kurz}: ${w.richtig}` : "Bei diesem Wehwehchen hat das Spital noch nie geholfen.");
      }));
    }
    karte.append(inhalt);
    els.album.innerHTML = "";
    els.album.append(karte);
  }

  // ---------------------------------------------------------------------------
  // Die Ruhmeshalle: frühere Dörfer – und ein neues Dorf gründen
  // ---------------------------------------------------------------------------
  function pokalBild(id, gross = 46) {
    const p = SCH()?.pokal?.(id);
    if (!p) return `<span class="bau-pokal-ersatz" aria-hidden="true">🏆</span>`;
    return svgVon(p, "-40 -94 80 98", `bau-pokal is-${id}`).replace("<svg ", `<svg width="${gross}" height="${Math.round(gross * 1.22)}" `);
  }

  function oeffneRuhm() {
    if (!ui.host?.isConnected || ui.besetzt || ui.overlay || ui.ordnen) return;
    if (ui.tafel) schliesseTafel();
    if (ui.uebersicht) schliesseUebersicht({ weiter: true });
    if (ui.album) schliesseAlbum();
    ui.ruhm = true;
    if (!els.ruhm?.isConnected) {
      els.ruhm = el("div", "bau-uebersicht bau-ruhm", { role: "dialog", "aria-modal": "true", "aria-label": "Ruhmeshalle" });
      els.ruhm.addEventListener("click", (e) => { if (e.target === els.ruhm) schliesseRuhm(); });
      ui.host.append(els.ruhm);
    }
    els.ruhm.hidden = false;
    fuelleRuhm();
    const v = S().neustartVorschau();
    const ruhm = S().lesen().ruhm || [];
    sag(`Die Ruhmeshalle. ${ruhm.length ? `Hier stehen deine früheren Dörfer.` : "Noch steht hier kein Dorf."} ${pokalSatz(v)}`);
    hilfe("In der Ruhmeshalle stehen deine früheren Dörfer mit ihren Pokalen. Unten kannst du ein neues Dorf gründen: Dann kommt dein jetziges Dorf hierher, und du beginnst von vorne – mit Tieren oder mit Menschen.");
  }

  function schliesseRuhm() {
    ui.ruhm = false;
    if (els.ruhm) els.ruhm.hidden = true;
    if (ui.zimmer >= 0) hilfeZimmer(); else hilfeHaus();
  }

  // Was ein neues Dorf jetzt brächte – ein Satz.
  function pokalSatz(v = S().neustartVorschau()) {
    if (v.pokal) return `Wenn du jetzt ein neues Dorf gründest, bekommst du den ${v.pokal.name}.`;
    const erster = (K().POKALE || [])[0];
    const fehlt = Math.max(0, (erster?.sterne || 100) - v.sterne);
    return fehlt === 1 ? "Noch ein Stern, dann gibt es beim Neustart einen Pokal." : `Noch ${fehlt} Sterne, dann gibt es beim Neustart einen Pokal.`;
  }

  // Ein früheres Dorf als kleine Häuserreihe.
  function dorfReihe(haeuser) {
    let x = 4;
    let s = "";
    let hoch = 0;
    S().HAUS_IDS.forEach((id) => {
      const h = haeuser?.[id];
      if (!h) return;
      const f = { id, stockwerke: Math.max(1, h.stockwerke || 1), eingerichtet: h.eingerichtet || 0, fassade: h.fassade, dach: h.dach };
      hoch = Math.max(hoch, A().minihausHoehe(f));
      s += `<g transform="translate(${x} 0)">${A().minihaus(id, f, { breite: 46 })}</g>`;
      x += 56;
    });
    hoch = Math.min(220, hoch || 60);
    return svgVon(`<g transform="translate(0 ${hoch - 2})">${s}</g>`, `0 0 ${x} ${hoch}`, "bau-ruhm-dorf");
  }

  function fuelleRuhm() {
    if (!ui.ruhm || !els.ruhm) return;
    const v = S().neustartVorschau();
    const ruhm = [...(S().lesen().ruhm || [])].reverse();
    const karte = el("div", "bau-uebersicht-karte bau-ruhm-karte");
    karte.append(knopf("bau-uebersicht-zu", "Schliessen", svgVon(KREUZ, "0 0 24 24"), () => schliesseRuhm()));
    const kopf = el("div", "bau-uebersicht-kopf bau-ruhm-kopf");
    const halle = SCH()?.ruhmeshalle?.();
    kopf.innerHTML = `${halle ? svgVon(halle, "-84 -156 168 160", "bau-ruhm-halle") : ""}<h2>Ruhmeshalle</h2>`;
    karte.append(kopf);
    // Das Dorf jetzt.
    const jetzt = el("section", "bau-ruhm-jetzt");
    const volkName = K().VOLK?.[v.volk]?.name || "Tiere";
    const jetztSatz = `Dein Dorf jetzt: Dorf ${v.nr} mit ${v.volk === "menschen" ? "Menschen" : "Tieren"}. Das Dorf hat ${v.sterne === 1 ? "einen Stern" : `${v.sterne} Sterne`}. ${pokalSatz(v)}`;
    jetzt.append(el("h3", "bau-lies", { text: `Dein Dorf jetzt · Dorf ${v.nr}`, "data-lies": jetztSatz }));
    const zeile = el("div", "bau-ruhm-zeile");
    zeile.innerHTML = `${v.pokal ? pokalBild(v.pokal.id, 46) : `<span class="bau-ruhm-keinpokal" aria-hidden="true">${pokalBild("bronze", 46)}</span>`}` +
      `<span class="bau-ruhm-text"><b>★ ${v.sterne} · ${textSicher(volkName)}</b><span>${textSicher(pokalSatz(v))}</span></span>`;
    jetzt.append(zeile);
    // Die Pokale: ab 100, 200, 300 Sternen.
    const stufen = el("div", "bau-ruhm-pokale");
    (K().POKALE || []).forEach((p) => {
      const erreicht = v.sterne >= p.sterne;
      stufen.append(knopf(`bau-ruhm-pokalstufe${erreicht ? " is-erreicht" : ""}`, `${p.name}: ab ${p.sterne} Sternen`,
        `${pokalBild(p.id, 34)}<span><b>${textSicher(p.name)}</b><small>ab ${p.sterne} ★</small></span>`,
        () => sag(pokalText(p))));
    });
    jetzt.append(stufen);
    jetzt.append(knopf("bau-ok bau-neustartknopf", "Neues Dorf gründen", "🏗️ Neues Dorf gründen", () => zeigeNeustart()));
    karte.append(jetzt);
    // Die früheren Dörfer.
    if (ruhm.length) {
      const liste = el("section", "bau-ruhm-liste");
      liste.append(el("h3", "", { text: "Frühere Dörfer" }));
      ruhm.forEach((r) => {
        const p = (K().POKALE || []).find((x) => x.id === r.pokal);
        const name = K().VOLK?.[r.volk]?.name || "Tiere";
        const satz = `Dorf ${r.nr} mit ${r.volk === "menschen" ? "Menschen" : "Tieren"}. ${p ? `Dafür gab es den ${p.name}.` : "Es hatte noch keinen Pokal."}`;
        const box = el("div", "bau-ruhm-eintrag bau-lies", { "data-lies": satz });
        box.innerHTML = `<span class="bau-ruhm-pokal">${p ? pokalBild(p.id, 40) : ""}</span>` +
          `<span class="bau-ruhm-text"><b>Dorf ${r.nr} · ${textSicher(name)}</b><span>★ ${r.sterne} · ${r.bewohner} Bewohner</span></span>${dorfReihe(r.haeuser)}`;
        liste.append(box);
      });
      karte.append(liste);
    }
    els.ruhm.innerHTML = "";
    els.ruhm.append(karte);
  }

  function pokalText(p) {
    const dazu = [`${p.paletten} Paletten Ziegel als Geschenk für das neue Dorf`];
    if (p.schaetze) dazu.push("goldene Möbel");
    if (p.denkmal) dazu.push("ein Denkmal vor dem Wohnhaus");
    return `Den ${p.name} gibt es ab ${p.sterne} Sternen. Dazu: ${dazu.join(", ")}.`;
  }

  // Ein neues Dorf gründen: zuerst genau erklären, was passiert, dann Tiere
  // oder Menschen wählen, dann noch einmal fragen. Keine Elternschranke –
  // aber nichts geschieht aus Versehen.
  function neustartErklaerung(v) {
    const p = v.pokal;
    const satzPokal = p
      ? `Das Dorf hat ${v.sterne} Sterne. Dafür bekommst du den ${p.name}.`
      : `Das Dorf hat ${v.sterne === 1 ? "einen Stern" : `${v.sterne} Sterne`}. Einen Pokal gibt es erst ab 100 Sternen – diesmal gibt es noch keinen.`;
    const ziegel = v.uebrig + (p?.paletten || 0);
    return [
      "Dein jetziges Dorf kommt mit allen Häusern in die Ruhmeshalle. Dort kannst du es immer wieder anschauen.",
      `Für die Sterne gibt es einen Pokal: ab 100 Sternen Bronze, ab 200 Silber, ab 300 Gold. ${satzPokal}`,
      "Das neue Dorf beginnt ganz von vorne: Alle Stockwerke, Zimmer, Dinge und Bewohner sind weg. Jedes Haus hat wieder nur sein erstes Stockwerk.",
      "Die Sternenleiter beginnt wieder bei null. Die Wünsche sind so anspruchsvoll wie jetzt.",
      `Ziegel, die du noch nicht verbaut hast, nimmst du mit.${p ? ` Dazu schenkt dir der Pokal ${p.paletten} Paletten.` : ""} Im neuen Dorf hast du ${ziegel === 1 ? "eine Palette" : `${ziegel} Paletten`}.`,
      "Ab dem Silberpokal gibt es im neuen Dorf goldene Möbel. Mit dem Goldpokal steht ein Denkmal vor dem Wohnhaus.",
      "Das Sammelalbum und die Ruhmeshalle bleiben, wie sie sind.",
      "Im neuen Dorf wählst du: Wohnen dort Tiere oder Menschen?",
      "Ein neues Dorf lässt sich nicht rückgängig machen.",
    ];
  }

  function zeigeNeustart() {
    const v = S().neustartVorschau();
    if (ui.ruhm) schliesseRuhm();
    const { karte } = oeffneOverlay("is-neustart", "Ein neues Dorf gründen?");
    const punkte = neustartErklaerung(v);
    const frage = "Was passiert, wenn du ein neues Dorf gründest?";
    karte.append(el("p", "bau-wahl-text bau-lies", { text: frage }));
    const liste = el("ul", "bau-neustart-liste");
    punkte.forEach((p) => liste.append(el("li", "bau-lies", { text: p })));
    karte.append(liste);
    const unten = el("div", "bau-wahl-unten");
    unten.append(
      knopf("bau-abbrechen", "Abbrechen", "Abbrechen", () => { schliesseOverlay(); sag("Abgebrochen. Dein Dorf bleibt, wie es ist."); }),
      knopf("bau-ok", "Weiter", "Weiter →", () => zeigeVolkwahl(v)),
    );
    karte.append(unten);
    sag(`${frage} ${punkte.join(" ")}`);
  }

  function zeigeVolkwahl(v) {
    const fuchs = tierBildchen({ a: "fox", n: "Fuchs", seed: "wahl-fuchs" }, 60, 66);
    const mensch = tierBildchen({ a: "m_maedchen", n: "Mädchen", seed: "wahl-mensch" }, 60, 66);
    const karten = ["tiere", "menschen"].map((id) => ({ id, ...K().VOLK[id] }));
    const { karte } = oeffneOverlay("is-volkwahl", "Wer wohnt im neuen Dorf?");
    let gewaehlt = "";
    const raster = el("div", "bau-wahl-raster");
    const text = el("p", "bau-wahl-text", { text: "Wer wohnt im neuen Dorf: Tiere oder Menschen?" });
    karten.forEach((k) => {
      const b = knopf("bau-wahl-feld", k.name, `<span class="bau-wahl-bild is-figur">${k.id === "tiere" ? fuchs : mensch}</span><span>${k.name}</span>`, () => {
        gewaehlt = k.id;
        raster.querySelectorAll(".bau-wahl-feld").forEach((x) => x.classList.toggle("is-aktiv", x === b));
        text.textContent = k.text;
        ok.disabled = false;
        sag(k.text);
      });
      raster.append(b);
    });
    const ok = knopf("bau-ok", "Weiter", "Weiter →", () => { if (gewaehlt) zeigeNeustartFrage(v, gewaehlt); });
    ok.disabled = true;
    const unten = el("div", "bau-wahl-unten");
    unten.append(knopf("bau-abbrechen", "Abbrechen", "Abbrechen", () => { schliesseOverlay(); sag("Abgebrochen. Dein Dorf bleibt, wie es ist."); }), ok);
    karte.append(raster, text, unten);
    sag("Wer wohnt im neuen Dorf: Tiere oder Menschen?");
  }

  function zeigeNeustartFrage(v, volk) {
    const { karte } = oeffneOverlay("is-neustart", "Bist du ganz sicher?");
    const name = K().VOLK[volk]?.name || "Tieren";
    const satz = `Dein Dorf kommt in die Ruhmeshalle. Dann beginnt ein neues Dorf – mit ${volk === "menschen" ? "Menschen" : "Tieren"}. Das lässt sich nicht rückgängig machen.`;
    karte.append(el("p", "bau-wahl-text bau-lies", { text: satz }));
    if (v.pokal) karte.append(el("div", "bau-neustart-pokal", { html: `${pokalBild(v.pokal.id, 64)}<b>${textSicher(v.pokal.name)}</b>` }));
    const unten = el("div", "bau-wahl-unten");
    unten.append(
      knopf("bau-abbrechen", "Nein, doch nicht", "Nein, doch nicht", () => { schliesseOverlay(); sag("Gut. Dein Dorf bleibt, wie es ist."); }),
      knopf("bau-ok is-neustart", "Ja, neues Dorf gründen", "Ja, neues Dorf gründen!", () => {
        schliesseOverlay();
        const ergebnis = S().neustart({ volk });
        if (!ergebnis) return;
        // Die Bauecke zeichnet sich neu (onChange "neustart"); danach die Feier.
        window.setTimeout(() => feiereNeustart(ergebnis, name), 700);
      }),
    );
    karte.append(unten);
    sag(`Bist du ganz sicher? ${satz}`);
  }

  function feiereNeustart({ eintrag, pokal }, name) {
    if (!ui.host?.isConnected) return;
    klang("win");
    kids()?.burstConfetti?.(ui.host, 70);
    const geschenk = pokal ? `${pokal.paletten} Paletten Ziegel als Geschenk.` : "Viel Spass beim Bauen!";
    band(pokal ? pokalBild(pokal.id, 44) : `<span class="bau-sternband-emoji" aria-hidden="true">🏗️</span>`, `Dorf ${eintrag.nr + 1}`, pokal ? `${pokal.name}! ${geschenk}` : geschenk, "is-bonus");
    sag(`Juhui, ein neues Dorf! Hier wohnen jetzt ${name}. ${pokal ? `Du hast den ${pokal.name} bekommen. Er steht in der Ruhmeshalle.` : "Dein altes Dorf steht in der Ruhmeshalle."} ${pokal ? `Als Geschenk bekommst du ${pokal.paletten} Paletten Ziegel.` : ""} Welches Haus baust du zuerst?`);
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
        sag(`${haus.der}. ${id === "wohnhaus" && menschen() ? haus.text.replace("die Tiere", "die Menschen") : haus.text}`);
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
      const froh = k.wer?.traum.length ? " hat-traum" : k.wer?.wunsch.length ? ` hat-wunsch is-${k.wer.wunsch.some((w) => w.stern === "blau") ? "blau" : "gruen"}` : "";
      const b = knopf(`bau-wahl-feld${froh}${gewaehlt === k.id ? " is-aktiv" : ""}`, k.name,
        `${svgVon(k.bild, "-34 -34 68 68", "bau-wahl-bild")}<span>${k.name}</span>${k.schon ? `<i class="bau-schon" title="gibt es schon">✓</i>` : ""}${wunschMarken(k.wer)}`, () => {
          gewaehlt = k.id;
          raster.querySelectorAll(".bau-wahl-feld").forEach((x) => x.classList.toggle("is-aktiv", x === b));
          const p = zeige(k);
          sag(p && !p.ok ? `${k.der || k.name}. ${p.text}` : `${k.der || k.name}. ${k.text}${p?.text ? ` ${p.text}` : ""}${werSatz(k.wer)}`);
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
      frage: `Was wird das neue Stockwerk? Eine Wohnung, in der ${wer().viele} wohnen, oder zwei Zimmer wie Küche und Bad?`,
      karten: [
        { id: "wohnung", name: "Wohnung", text: `Eine Wohnung: Hier wohnen bis zu drei ${wer().viele} – in einem Schlafzimmer oder einem Kinderzimmer.`, bild: dingBild("bett", 56) },
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
      karten: K().WOHNEN.map((id) => { const r = K().RAEUME[id]; return { id, name: r.name, der: r.der, text: r.text, bild: dingBild(r.icon, 56), wer: werWillDas(ui.haus, id) }; }),
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
          wer: werWillDas(ui.haus, id), pruefe: r.doppel ? () => doppelHinweis(index, id) : null };
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
    feuerwerk(svg, A().ZX + A().ZW / 2, A().oben(index) - A().STOCK_HOCH / 2 + 50);
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

  // blitzzug(), gluecksstern(ort) und heli() lassen die Überraschungen sofort kommen –
  // für die Prüfskripte (scripts/check-bau.mjs).
  window.LernappBau = {
    mount, unmount, zurueck, auffrischen, pruefeLieferung,
    blitzzug: () => (ui.zimmer < 0 && !ui.blitz ? starteBlitzzug() : false),
    gluecksstern: (ort = null) => versteckeStern(ort),
    heli: () => (ui.zimmer < 0 && !ui.heli ? starteHeli() : false),
  };
})();
