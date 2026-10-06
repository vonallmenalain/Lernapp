/*
 * meinname.js – Mein Name: Buchstabe für Buchstabe an die Lok.
 *
 * Der eigene Name ist das erste Wort, das ein Kind lesen will – und oft das
 * erste, das es schreibt. Hier fährt er als Zug: Hinter der Lok stehen leere
 * Plätze, daneben warten die Buchstaben-Wagen durcheinander. Der Reihe nach
 * angetippt, kuppeln sie an; ist der Name ganz, sagt die Stimme ihn, und der
 * Zug fährt ab. Drei Fahrten, jede ein bisschen selbständiger:
 *
 *   1  die Buchstaben stehen blass auf den leeren Plätzen
 *   2  der Name steht nur noch auf dem Schild darüber
 *   3  das Schild ist zugedeckt – ein Tipp lässt kurz hineinschauen –, und
 *      zwei Wagen gehören gar nicht zum Namen
 *
 * Der Name kommt aus dem Kinderkonto. Ohne Konto (oder wenn dort ein anderer
 * steht) tippt ihn ein Erwachsener ein; er bleibt dann auf diesem Gerät. In
 * den Spielstand, der in die Cloud geht, kommt er nicht: Ein echter Name
 * gehört nicht dorthin.
 *
 * Hier bekommt auch der Lesewurm seinen Namen – über den Knopf unter dem
 * Wurm oder über das Schild im Lesewagen (meinname.html?wurm=1, immer frei).
 * Das Kind legt ihn aus Buchstaben, und die Stimme liest jedes Mal, was
 * dasteht: «Mo», «Mol», «Moli». Der Würfel schlägt einen Namen vor.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "meinname") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const inhalte = window.LernappLeseInhalte;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  if (!host || !spiel || !inhalte || !ton || !art || !stand) return;

  const kids = () => window.LernappKids || null;

  const ID = "meinname";
  const FAHRTEN = 3;
  const MAX_BUCHSTABEN = 12;
  const WURM_MAX = 8;
  const NAME_KEY = "lernapp.lesen.meinname";
  const FARBEN = ["#2f6fd0", "#e8543f", "#3fa34d", "#f5a623", "#7c5ce6", "#00a5b5"];
  const SELBSTLAUTE = ["a", "e", "i", "o", "u"];
  const nurTaufe = new URLSearchParams(window.location.search).get("wurm") === "1";

  const HELP = [
    "Mein Name. Kupple die Buchstaben deines Namens der Reihe nach an die Lok.",
    "Fang vorne an. Auf dem Schild steht, wie dein Name geschrieben wird.",
  ].join(" ");
  const HELP_WURM = [
    "Wie soll dein Lesewurm heissen? Tippe Buchstaben an – die Stimme liest, was dasteht.",
    "Der Pfeil nimmt den letzten Buchstaben weg, der Würfel schlägt einen Namen vor, der Haken tauft ihn.",
  ].join(" ");

  const zeige = (text) => stand.zeige?.(text) ?? text;
  const klein = (text) => String(text || "").toLocaleLowerCase("de");
  const zufall = (liste) => liste[Math.floor(Math.random() * liste.length)];

  // ---------------------------------------------------------------------------
  // Der Name
  // ---------------------------------------------------------------------------
  function eingetippt() {
    try { return stand.nameSauber(localStorage.getItem(NAME_KEY) || ""); } catch { return ""; }
  }
  function merke(name) {
    try {
      if (name) localStorage.setItem(NAME_KEY, name);
      else localStorage.removeItem(NAME_KEY);
    } catch { /* privater Modus */ }
  }

  // Aus dem Konto nur ein richtiger Vorname: keine Adresse, keine Ziffern und
  // nicht der Ersatzname «Kind».
  function ausKonto() {
    const name = String(window.LernappFirebase?.getUser?.()?.name || "");
    if (!name || /[@\d]/.test(name)) return "";
    const vorname = stand.nameSauber(name.split(" ")[0]);
    return vorname && vorname !== "Kind" ? vorname : "";
  }

  const derName = () => eingetippt() || ausKonto();

  // Die Teile des Namens: Buchstaben zum Kuppeln, dazwischen ein Bindestrich
  // oder Leerschlag, der von selbst mitfährt. Höchstens zwölf Buchstaben –
  // länger wird der Zug auf keinem Bildschirm.
  function teileVon(name) {
    const teile = [];
    let buchstaben = 0;
    for (const zeichen of String(name || "")) {
      const istBuchstabe = /\p{L}/u.test(zeichen);
      if (istBuchstabe && buchstaben >= MAX_BUCHSTABEN) break;
      if (istBuchstabe) buchstaben += 1;
      teile.push({ zeichen, buchstabe: istBuchstabe, nr: teile.length });
    }
    while (teile.length && !teile[teile.length - 1].buchstabe) teile.pop();
    return teile;
  }

  // Den Laut eines Buchstabens, wenn er zu hören ist; sonst ein Klopfen, damit
  // das Kind merkt, dass der Tipp angekommen ist.
  async function sageBuchstabe(zeichen, stelle = 0) {
    const id = klein(zeichen);
    if (inhalte.LAUT_BY_ID[id] && ton.lautHoerbar(id)) return ton.laut(id);
    ton.klopf(420 + stelle * 30);
    return false;
  }

  const state = {
    modus: "intro", phase: "intro", name: "", teile: [], farben: [], fahrt: 0, punkte: 0,
    fehler: 0, fehlgriffe: 0, dran: 0, wurmName: "",
  };
  let shell = null;
  let el = {};

  function wurmBild({ winkt = false, klasse = "mn-wurm" } = {}) {
    const svg = art.el("svg", { viewBox: "-70 -95 140 130", class: klasse, "aria-hidden": "true" });
    svg.append(art.buildLesewurm(3, { r: 16, buch: false, winkt }));
    return svg;
  }

  // ---------------------------------------------------------------------------
  // Vor der ersten Fahrt
  // ---------------------------------------------------------------------------
  //   bearbeiten  das Feld zum Eintippen statt des Schilds
  function intro({ bearbeiten = false } = {}) {
    state.modus = "intro";
    state.phase = "intro";
    host.classList.remove("mn-ohne-zaehler");
    shell.clear();
    shell.setPhase("intro");
    shell.closeOverlay();
    shell.setCount(0);
    kids()?.setHelp?.(HELP);
    state.name = derName();

    const karte = shell.el("div", "lese-los mn-intro");
    const links = shell.el("div", "mn-intro-wurm");
    links.append(wurmBild({ winkt: true }));
    const wurmName = stand.wurmName();
    const taufe = shell.el("button", "mn-taufe-knopf", wurmName ? zeige(wurmName) : "Name?");
    taufe.type = "button";
    taufe.setAttribute("aria-label", wurmName ? `Dein Lesewurm heisst ${wurmName}. Antippen, um ihm einen neuen Namen zu geben` : "Gib deinem Lesewurm einen Namen");
    taufe.addEventListener("click", taufen);
    links.append(taufe);
    karte.append(links);

    if (bearbeiten || !state.name) {
      karte.append(eingabe(state.name));
      shell.play.append(karte);
      return;
    }
    const mitte = shell.el("div", "mn-intro-mitte");
    const schild = shell.el("p", "mn-schild", zeige(state.name));
    const aendern = shell.el("button", "mn-aendern", "✏️");
    aendern.type = "button";
    aendern.setAttribute("aria-label", "Einen anderen Namen eintippen");
    aendern.addEventListener("click", () => intro({ bearbeiten: true }));
    mitte.append(schild, aendern);
    const los = shell.el("button", "lese-los-knopf");
    los.type = "button";
    los.setAttribute("aria-label", "Los geht's!");
    los.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#3fbf74"/><polygon points="19,14 35,24 19,34" fill="#fff"/></svg>`;
    los.addEventListener("click", () => { los.disabled = true; startFahrten(); }, { once: true });
    karte.append(mitte, los);
    shell.play.append(karte);
    window.setTimeout(() => los.focus?.({ preventScroll: true }), 50);
  }

  // Das Feld für den Namen. Leer übernommen heisst: wieder der Name aus dem
  // Konto, wenn es einen gibt.
  function eingabe(vorschlag = "") {
    const form = shell.el("form", "mn-eingabe");
    const label = shell.el("label", "mn-eingabe-label");
    label.append(shell.el("span", "", "Wie heisst du?"));
    const feld = document.createElement("input");
    feld.type = "text";
    feld.name = "name";
    feld.maxLength = 16;
    feld.autocomplete = "off";
    feld.spellcheck = false;
    feld.setAttribute("autocapitalize", "words");
    feld.placeholder = "z. B. Lina";
    feld.value = vorschlag;
    label.append(feld);
    const ok = shell.el("button", "mn-eingabe-ok", "✓");
    ok.type = "submit";
    ok.setAttribute("aria-label", "Name übernehmen");
    const hinweis = shell.el("p", "mn-hinweis", "Ein Erwachsener tippt den Namen ein. Er bleibt nur auf diesem Gerät.");
    form.append(label, ok, hinweis);
    form.addEventListener("submit", (ereignis) => {
      ereignis.preventDefault();
      const name = stand.nameSauber(feld.value);
      if (!name && !ausKonto()) { feld.focus(); return; }
      merke(name);
      intro();
    });
    return form;
  }

  // ---------------------------------------------------------------------------
  // Die Fahrten
  // ---------------------------------------------------------------------------
  function startFahrten() {
    state.modus = "fahrt";
    state.fahrt = 0;
    state.punkte = 0;
    state.teile = teileVon(state.name);
    shell.setCount(0);
    shell.setPhase("play");
    buehne();
    naechsteFahrt();
  }

  function buehne() {
    shell.clear();
    const schild = shell.el("div", "mn-schild-reihe");
    const gleis = shell.el("div", "mn-gleis");
    const zug = shell.el("div", "mn-zug");
    const lok = spiel.eigeneLok();
    const plaetze = shell.el("div", "mn-plaetze");
    if (lok) zug.append(lok);
    zug.append(plaetze);
    gleis.append(zug, shell.el("div", "silben-schiene"));
    const neben = shell.el("div", "mn-neben");
    shell.play.append(schild, gleis, neben);
    shell.play.style.setProperty("--mn-n", String(Math.max(4, state.teile.length)));
    el = { schild, gleis, zug, plaetze, neben };
  }

  function naechsteFahrt() {
    state.dran = 0;
    state.fehler = 0;
    state.fehlgriffe = 0;
    state.farben = [];
    state.phase = "kuppeln";
    el.zug.classList.remove("faehrt-ab");
    zeichneSchild();
    zeichnePlaetze();
    zeichneNeben();
  }

  // Das Schild über dem Zug: offen in den ersten beiden Fahrten, in der
  // dritten zugedeckt – ein Tipp zeigt den Namen kurz.
  function zeichneSchild() {
    el.schild.innerHTML = "";
    const schild = shell.el("p", "mn-schild", zeige(state.name));
    if (state.fahrt < 2) { el.schild.append(schild); return; }
    schild.classList.add("ist-zu");
    schild.setAttribute("aria-hidden", "true");
    const gucken = shell.el("button", "mn-gucken", "👀");
    gucken.type = "button";
    gucken.setAttribute("aria-label", "Kurz aufs Schild schauen");
    let zu = null;
    gucken.addEventListener("click", () => {
      schild.classList.remove("ist-zu");
      window.clearTimeout(zu);
      zu = window.setTimeout(() => schild.classList.add("ist-zu"), 1600);
    });
    el.schild.append(schild, gucken);
  }

  function wagenSvg(zeichen, farbe) {
    return art.buildLautWagen(zeige(zeichen), { farbe });
  }

  function zeichnePlaetze() {
    el.plaetze.innerHTML = "";
    state.teile.forEach((teil, i) => {
      const voll = i < state.dran;
      const platz = shell.el("span", `mn-platz${voll ? " ist-voll" : " ist-leer"}${teil.buchstabe ? "" : " ist-zeichen"}`);
      if (voll) platz.append(wagenSvg(teil.zeichen, teil.buchstabe ? state.farben[i] || FARBEN[0] : "#9aa7b8"));
      else platz.append(wagenSvg(state.fahrt === 0 || !teil.buchstabe ? teil.zeichen : "", "#c9d3df"));
      el.plaetze.append(platz);
    });
  }

  // Buchstaben, die nicht zum Namen gehören – für die dritte Fahrt.
  function fremde(anzahl) {
    const imNamen = new Set(state.teile.map((t) => klein(t.zeichen)));
    const vorrat = "abdefgiklmnoprstuwz".split("").filter((b) => !imNamen.has(b));
    return spiel.ziehe(vorrat, anzahl).map((zeichen) => ({ zeichen, buchstabe: true, fremd: true }));
  }

  function zeichneNeben() {
    el.neben.innerHTML = "";
    const buchstaben = state.teile.filter((t) => t.buchstabe);
    const alle = [...buchstaben, ...(state.fahrt === 2 ? fremde(2) : [])];
    // Gemischt – aber nie schon in der richtigen Reihenfolge.
    let liste;
    let versuch = 0;
    do { liste = spiel.mische(alle); versuch += 1; } while (liste.length > 1 && liste.every((t, i) => t === alle[i]) && versuch < 20);
    liste.forEach((teil, i) => {
      const farbe = FARBEN[i % FARBEN.length];
      const knopf = shell.el("button", "mn-wagen");
      knopf.type = "button";
      knopf.dataset.zeichen = klein(teil.zeichen);
      if (teil.fremd) knopf.dataset.fremd = "1";
      knopf.setAttribute("aria-label", `Buchstabe ${teil.zeichen}`);
      knopf.append(wagenSvg(teil.zeichen, farbe));
      knopf.addEventListener("click", () => kuppeln(teil, knopf, farbe));
      el.neben.append(knopf);
    });
  }

  // Bindestrich und Leerschlag fahren von selbst mit.
  function weiterSchieben() {
    while (state.dran < state.teile.length && !state.teile[state.dran].buchstabe) state.dran += 1;
  }

  function zeigeHin() {
    const ziel = state.teile[state.dran];
    if (!ziel) return;
    [...el.neben.querySelectorAll(".mn-wagen")].find((k) => k.dataset.zeichen === klein(ziel.zeichen))?.classList.add("zeigt-hin");
  }

  async function kuppeln(teil, knopf, farbe) {
    if (state.phase !== "kuppeln") return;
    const ziel = state.teile[state.dran];
    // Gross oder klein ist egal: Ein «a» passt, wo im Namen ein «A» steht.
    if (!ziel || klein(teil.zeichen) !== klein(ziel.zeichen)) {
      state.fehler += 1;
      state.fehlgriffe += 1;
      knopf.classList.remove("stoesst");
      void knopf.offsetWidth;
      knopf.classList.add("stoesst");
      kids()?.playJingle?.("retry");
      sageBuchstabe(teil.zeichen);
      if (state.fehlgriffe >= 2) zeigeHin();
      return;
    }
    state.phase = "rollt";
    knopf.remove();
    el.neben.querySelectorAll(".zeigt-hin").forEach((k) => k.classList.remove("zeigt-hin"));
    state.farben[state.dran] = farbe;
    state.dran += 1;
    state.fehlgriffe = 0;
    weiterSchieben();
    zeichnePlaetze();
    kids()?.vibrate?.(10);
    await sageBuchstabe(ziel.zeichen, state.dran);
    if (state.dran < state.teile.length) { state.phase = "kuppeln"; return; }
    await fahrtFertig();
  }

  async function fahrtFertig() {
    state.phase = "faehrt";
    if (state.fehler === 0) {
      state.punkte += 1;
      shell.setCount(state.punkte);
    }
    kids()?.playJingle?.("correct");
    await ton.pause(250);
    await ton.sprich(state.name, { rate: 0.85 });
    await ton.pause(250);
    kids()?.playHorn?.({ chuffs: 2 });
    el.zug.classList.add("faehrt-ab");
    await ton.pause(900);
    state.fahrt += 1;
    if (state.fahrt >= FAHRTEN) { fertig(); return; }
    naechsteFahrt();
  }

  function fertig() {
    state.phase = "over";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von: FAHRTEN,
      woerter: FAHRTEN,
      label: "Mein Name",
      detail: `${state.punkte} von ${FAHRTEN} Fahrten ohne Fehlgriff`,
      speech: state.punkte === FAHRTEN
        ? `Dreimal ohne Fehlgriff. Dein Name ist ${state.name}!`
        : `Dein Name ist dreimal gefahren. ${state.name}!`,
    });
  }

  // ---------------------------------------------------------------------------
  // Der Lesewurm bekommt einen Namen
  // ---------------------------------------------------------------------------
  // Die Buchstaben dafür: die Selbstlaute immer – ohne sie lässt sich kein
  // Name sprechen –, dazu die Mitlaute aus dem Buchstabenhaus dieses Kindes,
  // mindestens acht und höchstens fünfzehn. Nur einzelne Buchstaben.
  function tastenLaute() {
    const gruppe = inhalte.GRUPPE_JE_LESESTUFE[stand.lesestufe?.() || "buchstaben"] || 3;
    const einzeln = (id) => /^[a-z]$/.test(id) && !SELBSTLAUTE.includes(id);
    const mitlaute = inhalte.hausLaute(stand.bekannteLaute?.() || null, gruppe).map((l) => l.id).filter(einzeln).slice(0, 15);
    for (const laut of inhalte.LAUTE) {
      if (mitlaute.length >= 8) break;
      if (einzeln(laut.id) && !mitlaute.includes(laut.id)) mitlaute.push(laut.id);
    }
    return { selbstlaute: [...SELBSTLAUTE], mitlaute };
  }

  const vorne = (name) => (name ? name.charAt(0).toLocaleUpperCase("de") + name.slice(1) : "");

  function taufen() {
    state.modus = "wurm";
    state.phase = "taufen";
    // Taufen ist keine Runde: kein Zähler oben rechts.
    host.classList.add("mn-ohne-zaehler");
    state.wurmName = klein(stand.wurmName());
    shell.clear();
    shell.closeOverlay();
    shell.setPhase("play");
    kids()?.setHelp?.(HELP_WURM);
    const { selbstlaute, mitlaute } = tastenLaute();

    const buehneWurm = shell.el("div", "mn-taufe");
    const links = shell.el("div", "mn-taufe-links");
    const bild = wurmBild({ klasse: "mn-wurm mn-taufe-wurm" });
    const schild = shell.el("p", "mn-wurmschild");
    schild.setAttribute("aria-live", "polite");
    const leiste = shell.el("div", "mn-taufe-leiste");
    const weg = shell.el("button", "mn-taste-aktion mn-weg", "⌫");
    weg.type = "button";
    weg.setAttribute("aria-label", "Letzten Buchstaben wegnehmen");
    const wuerfel = shell.el("button", "mn-taste-aktion mn-wuerfel", "🎲");
    wuerfel.type = "button";
    wuerfel.setAttribute("aria-label", "Einen Namen vorschlagen");
    const fertigKnopf = shell.el("button", "mn-taste-aktion mn-fertig", "✓");
    fertigKnopf.type = "button";
    fertigKnopf.setAttribute("aria-label", "So soll er heissen");
    leiste.append(weg, wuerfel, fertigKnopf);
    links.append(bild, schild, leiste);

    const tasten = shell.el("div", "mn-tasten");
    const reihe = (liste, klasse) => {
      const zeile = shell.el("div", `mn-tasten-reihe ${klasse}`);
      liste.forEach((id) => {
        const taste = shell.el("button", "mn-taste", zeige(id));
        taste.type = "button";
        taste.dataset.laut = id;
        taste.setAttribute("aria-label", `Buchstabe ${id.toUpperCase()}`);
        taste.addEventListener("click", () => tippe(id));
        zeile.append(taste);
      });
      return zeile;
    };
    tasten.append(reihe(selbstlaute, "ist-selbstlaut"), reihe(mitlaute, "ist-mitlaut"));
    buehneWurm.append(links, tasten);
    shell.play.append(buehneWurm);
    el = { schild, bild, weg, wuerfel, fertigKnopf, tasten };

    weg.addEventListener("click", zurueckTaste);
    wuerfel.addEventListener("click", () => wuerfeln(selbstlaute, mitlaute));
    fertigKnopf.addEventListener("click", bestaetigen);
    zeigeWurmName();
  }

  function zeigeWurmName() {
    const name = vorne(state.wurmName);
    el.schild.textContent = name ? zeige(name) : "?";
    el.schild.classList.toggle("ist-leer", !name);
    el.fertigKnopf.disabled = state.wurmName.length < 2;
    el.weg.disabled = !state.wurmName;
  }

  // Was dasteht, vorgelesen. Ein einzelner Buchstabe nicht: Die Stimme sagte
  // «Em» statt «mmm» – dann sein Laut, wenn es ihn gibt.
  function vorlesen() {
    if (!state.wurmName) return;
    if (state.wurmName.length === 1) { sageBuchstabe(state.wurmName); return; }
    ton.sprich(vorne(state.wurmName), { rate: 0.85 });
  }

  function tippe(id) {
    if (state.phase !== "taufen") return;
    if (state.wurmName.length >= WURM_MAX) {
      ton.klopf(300);
      el.schild.classList.remove("wackelt");
      void el.schild.offsetWidth;
      el.schild.classList.add("wackelt");
      return;
    }
    state.wurmName += id;
    zeigeWurmName();
    vorlesen();
  }

  function zurueckTaste() {
    if (state.phase !== "taufen" || !state.wurmName) return;
    state.wurmName = state.wurmName.slice(0, -1);
    zeigeWurmName();
    vorlesen();
  }

  // Zwei Silben aus Mitlaut und Selbstlaut, manchmal ein Mitlaut dazu:
  // «Molu», «Tika», «Lomas».
  function wuerfeln(selbstlaute, mitlaute) {
    if (state.phase !== "taufen") return;
    const silbe = () => zufall(mitlaute) + zufall(selbstlaute);
    let name = silbe() + silbe();
    if (Math.random() < 0.35) name += zufall(mitlaute);
    state.wurmName = name.slice(0, WURM_MAX);
    zeigeWurmName();
    vorlesen();
  }

  async function bestaetigen() {
    if (state.phase !== "taufen" || state.wurmName.length < 2) return;
    state.phase = "getauft";
    const name = stand.nameSauber(state.wurmName);
    stand.wurmTaufen(name);
    el.tasten.querySelectorAll("button").forEach((k) => { k.disabled = true; });
    el.bild.replaceWith(wurmBild({ winkt: true, klasse: "mn-wurm mn-taufe-wurm ist-getauft" }));
    el.schild.classList.add("ist-getauft");
    kids()?.playJingle?.("star");
    await ton.sprich(`Hallo! Ich heisse ${name}.`, { rate: 0.9 });
    await ton.pause(700);
    if (nurTaufe) spiel.zurueck();
    else intro();
  }

  shell = spiel.mount({
    host,
    id: ID,
    title: nurTaufe ? "Lesewurm-Name" : "Mein Name",
    help: nurTaufe ? HELP_WURM : HELP,
    onRestart: () => (nurTaufe ? taufen() : intro()),
  });
  if (nurTaufe) taufen();
  else intro();

  // Für die Prüfung (check-leseecke.mjs).
  window.LernappMeinName = {
    FAHRTEN, MAX_BUCHSTABEN, WURM_MAX, NAME_KEY, teileVon, derName, tastenLaute,
    jetzt: () => ({ modus: state.modus, phase: state.phase, fahrt: state.fahrt, dran: state.dran, punkte: state.punkte, name: state.name, wurmName: state.wurmName }),
  };
})();
