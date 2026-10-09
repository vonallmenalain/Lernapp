/*
 * buecher.js – Das Bücherregal und der Leser.
 *
 * Das Regal zeigt die Bücher aus lesen-buecher.js, nach Stufen geordnet: zum
 * Zuhören, erste Sätze, kleine Geschichten, Geschichten, Kapitelbücher. Ein
 * Tipp öffnet ein Buch auf seiner Titelseite. Dort wählt das Kind, wie es
 * lesen will:
 *
 *   Vorlesen   die Stimme liest jede Seite, Satz für Satz leuchtet mit
 *   Zusammen   abwechselnd: einen Satz die Stimme, den nächsten das Kind –
 *              sein Satz leuchtet grün, und mit dem Pfeil geht es weiter
 *   Selbst     nichts von allein; ein Tipp auf ein Wort sagt es, der
 *              Lautsprecher unten liest die Seite
 *
 * Ein Hörbuch kennt nur Vorlesen. In jeder Art sagt ein Tipp auf ein Wort
 * dieses Wort – so bleibt niemand an einem Wort hängen. Für Ältere können
 * die Eltern diese Wort-Hilfe abschalten (lesen-stand.js, wortHilfe): Dann
 * schweigt beim Selber- und Zusammenlesen ein Tipp auf ein Wort, und der
 * Lautsprecher unten fehlt. Wie gross die Schrift steht, wählen sie auch.
 *
 * Ein Kapitelbuch ist länger: Über der ersten Seite eines Kapitels steht
 * seine Überschrift (die Stimme liest sie mit, ausser beim Selberlesen), und
 * ein Lesezeichen merkt sich auf dem Gerät, wo das Kind aufgehört hat. Auf
 * der Titelseite geht es dort weiter; ist das Buch zu Ende gelesen, fällt das
 * Lesezeichen heraus.
 *
 * Nach der letzten Seite kommen Fragen zum Buch. Wer danebentippt, kann im
 * Buch nachsehen: Die Seite, auf der es steht, geht auf, und von dort geht es
 * zurück zur Frage. Sterne gibt es für die Fragen, die gleich stimmten; der
 * Lesewurm wächst um jedes Wort des Buches, gelesen oder gehört.
 *
 * Zwei Bücher sind frei, die anderen gehören zum Kauf (entitlement.js,
 * buchFree). Das Regal selbst ist nie gesperrt, und ein Buch verbraucht
 * keine Schnupperrunde: Lesen soll nicht nach einer Runde aufhören.
 *
 * Adressen: buecher.html (das Regal), buecher.html?buch=hase-rueebli (ein
 * Buch), buecher.html?weiter=1 (der Lesewurm im Sessel hat «Bücher»
 * gewählt: das nächste passende Buch, das noch nicht gelesen ist).
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "buecher") return;

  const host = document.querySelector("#lese-stage");
  const spiel = window.LernappLeseSpiel;
  const bib = window.LernappLeseBuecher;
  const ton = window.LernappLeseTon;
  const art = window.LernappLeseArt;
  const stand = window.LernappLeseStand;
  const zugArt = window.LernappTrainArt;
  if (!host || !spiel || !bib || !ton || !art || !zugArt || !window.LernappLeseBilder) return;

  const kids = () => window.LernappKids || null;
  const schranke = () => window.LernappEntitlement || null;

  const ID = "buecher";
  // Die Bilder der Seiten und Umschläge zeichnet lesen-bilder.js.
  const { buchBild, umschlagBild, vorladen } = window.LernappLeseBilder;

  // Wie schnell die Stimme liest: Für Erstleser langsamer.
  const TEMPO = { hoerbuch: 0.9, erste: 0.78, klein: 0.85, geschichte: 0.9, kapitel: 0.95 };
  // Das Lesezeichen der Kapitelbücher: { buchId: { seite, modus, at } }, nur
  // auf dem Gerät.
  const LESEZEICHEN_KEY = "lernapp.lesen.lesezeichen";

  const MODI = {
    vorlesen: { titel: "Vorlesen", bild: "👂" },
    zusammen: { titel: "Zusammen", bild: "👥" },
    selbst: { titel: "Selbst lesen", bild: "👀" },
  };

  const HELP_REGAL = [
    "Das Bücherregal. Tippe auf ein Buch, und es geht auf.",
    "Oben wählst du das Fach: Bücher zum Zuhören, erste Sätze, kleine Geschichten, Geschichten und Kapitelbücher.",
  ].join(" ");
  const HELP_TITEL = [
    "Wie möchtest du lesen?",
    "Vorlesen: Die Stimme liest dir alles vor.",
    "Zusammen: Ihr lest abwechselnd, einen Satz die Stimme, einen Satz du.",
    "Selbst lesen: Du liest, und wenn du ein Wort hören willst, tippst du darauf.",
  ].join(" ");
  const HELP_HOERBUCH = "Ein Buch zum Zuhören. Tippe auf den grünen Knopf, und die Stimme liest es dir vor.";
  const HELP_SEITE = {
    vorlesen: "Die Stimme liest dir die Seite vor. Mit dem Pfeil rechts blätterst du um. Tippe auf ein Wort, und du hörst es noch einmal.",
    zusammen: "Ihr lest abwechselnd. Leuchtet ein Satz grün, bist du dran: Lies ihn, dann tippe auf den Pfeil rechts. Tippe auf ein Wort, und du hörst es.",
    selbst: "Lies die Seite. Tippe auf ein Wort, und du hörst es. Der Lautsprecher unten liest die ganze Seite vor, der Pfeil rechts blättert um.",
  };
  // Ohne Wort-Hilfe (von den Eltern abgeschaltet).
  const HELP_SEITE_OHNE = {
    zusammen: "Ihr lest abwechselnd. Leuchtet ein Satz grün, bist du dran: Lies ihn, dann tippe auf den Pfeil rechts.",
    selbst: "Lies die Seite. Der Pfeil rechts blättert um.",
  };
  const HELP_FRAGE = "Fragen zum Buch. Tippe auf die richtige Antwort. Weisst du es nicht mehr? Dann tippe auf das Buch und schau nach.";

  // Was zu welcher Lesestufe passt, für den Lesewurm im Sessel.
  const PASST = {
    hoeren: ["hoerbuch"],
    buchstaben: ["hoerbuch", "erste"],
    woerter: ["erste", "klein", "hoerbuch"],
    saetze: ["klein", "erste", "geschichte", "kapitel"],
    geschichten: ["geschichte", "kapitel", "klein"],
  };

  const state = {
    ansicht: "regal",   // regal, titel, seite, frage, ende
    fach: null,         // welches Fach im Regal offen ist (eine Stufe)
    buch: null,
    modus: "vorlesen",
    seite: 0,
    satz: 0,            // Zusammen: der Satz der Seite, der gerade dran ist
    liest: false,       // die Stimme liest gerade einen Satz der Seite
    frage: 0,
    punkte: 0,
    falsch: new Set(),  // in der aktuellen Frage schon falsch getippt
    nachsehen: false,   // eine Seite ist aus den Fragen heraus offen
    lauf: 0,            // jede neue Ausgabe macht ältere ungültig
    gewischt: 0,
  };
  let shell = null;
  let el = {};

  // ---------------------------------------------------------------------------
  // Frei oder gekauft?
  // ---------------------------------------------------------------------------
  // Sagt ein Tipp auf ein Wort es vor? Beim Vorlesen immer, sonst nur, wenn
  // die Eltern die Wort-Hilfe nicht abgeschaltet haben.
  function wortHilfe() {
    return state.modus === "vorlesen" || stand?.wortHilfe?.() !== false;
  }

  function frei(buch) {
    const s = schranke();
    if (!s) return true;
    if (typeof s.buchFree === "function") return s.buchFree(buch.id);
    return Boolean(buch.gratis) || Boolean(s.isFree?.());
  }

  function gelesen() {
    try { return stand?.stand?.().buecher || {}; } catch { return {}; }
  }

  // ---------------------------------------------------------------------------
  // Kapitel und Lesezeichen
  // ---------------------------------------------------------------------------
  // Das wievielte Kapitel auf dieser Seite läuft (ab 1); 0 in einem Buch ohne
  // Kapitel.
  function kapitelNr(buch, seitenNr) {
    return buch.seiten.slice(0, seitenNr + 1).filter((s) => s.kapitel).length;
  }

  // So liest die Stimme eine Überschrift: «Kapitel 2. Der Sturm.» – eine
  // Frage bleibt eine Frage: «Kapitel 3. Wer ist da?»
  function kapitelSatz(buch, seitenNr) {
    const kopf = buch.seiten[seitenNr].kapitel;
    return `Kapitel ${kapitelNr(buch, seitenNr)}. ${kopf}${/[.!?]$/.test(kopf) ? "" : "."}`;
  }

  function lesezeichen() {
    try { return JSON.parse(localStorage.getItem(LESEZEICHEN_KEY) || "{}") || {}; } catch { return {}; }
  }

  function lesezeichenSchreiben(alle) {
    try { localStorage.setItem(LESEZEICHEN_KEY, JSON.stringify(alle)); } catch { /* privater Modus */ }
  }

  // Wo das Kind in einem Kapitelbuch aufgehört hat – nur mitten im Buch; auf
  // der ersten Seite fängt es ohnehin vorne an.
  function lesezeichenVon(buch) {
    if (buch?.stufe !== "kapitel") return null;
    const zeichen = lesezeichen()[buch.id];
    const seite = Number(zeichen?.seite);
    if (!Number.isInteger(seite) || seite < 1 || seite >= buch.seiten.length) return null;
    return { seite, modus: MODI[zeichen.modus] ? zeichen.modus : "selbst" };
  }

  function lesezeichenSetzen(buch, seite, modus) {
    if (buch?.stufe !== "kapitel") return;
    const alle = lesezeichen();
    alle[buch.id] = { seite, modus, at: Date.now() };
    lesezeichenSchreiben(alle);
  }

  function lesezeichenWeg(buch) {
    const alle = lesezeichen();
    if (!alle[buch?.id]) return;
    delete alle[buch.id];
    lesezeichenSchreiben(alle);
  }

  function adresse(buchId) {
    try { window.history.replaceState(null, "", buchId ? `buecher.html?buch=${encodeURIComponent(buchId)}` : "buecher.html"); } catch { /* egal */ }
  }

  function titel(text) {
    const kopf = host.querySelector(".cm-title");
    if (kopf) kopf.textContent = text;
  }

  // Den laufenden Vorleser anhalten: alles, was er noch vorhatte, verfällt.
  function stopLesen() {
    state.lauf += 1;
    state.liest = false;
    ton.stop();
  }

  // ---------------------------------------------------------------------------
  // Das Regal
  // ---------------------------------------------------------------------------
  function sterneZeile(anzahl) {
    const zeile = shell.el("span", "bu-sterne");
    zeile.setAttribute("aria-label", `${anzahl} von 3 Sternen`);
    for (let i = 0; i < 3; i += 1) zeile.append(shell.el("span", i < anzahl ? "bu-stern is-on" : "bu-stern", "★"));
    return zeile;
  }

  function schlossBild() {
    const svg = art.el("svg", { viewBox: "-30 -30 60 60", class: "bu-schloss", "aria-hidden": "true" }, [
      art.el("circle", { cx: 0, cy: 0, r: 27, fill: "#ffd166", stroke: "#b8860b", "stroke-width": 3 }),
      art.el("path", { d: "M-9 -4 v-6 a9 9 0 0 1 18 0 v6", fill: "none", stroke: "#5b3a29", "stroke-width": 4 }),
      art.el("rect", { x: -12, y: -5, width: 24, height: 18, rx: 4, fill: "#5b3a29" }),
    ]);
    return svg;
  }

  function umschlag(buch) {
    const knopf = shell.el("button", "bu-umschlag");
    knopf.type = "button";
    knopf.dataset.buch = buch.id;
    knopf.style.setProperty("--buch", buch.farbe);
    const offen = frei(buch);
    const eintrag = gelesen()[buch.id];
    knopf.setAttribute("aria-label", `${buch.titel}${eintrag ? ", gelesen" : ""}${offen ? "" : ", gesperrt"}`);
    const deckel = shell.el("span", "bu-umschlag-deckel");
    deckel.append(umschlagBild(buch), shell.el("span", "bu-umschlag-titel", stand?.zeige?.(buch.titel) ?? buch.titel));
    knopf.append(deckel);
    if (eintrag) knopf.append(sterneZeile(Number(eintrag.sterne) || 1));
    if (!offen) {
      knopf.classList.add("is-locked");
      knopf.append(schlossBild());
    }
    knopf.addEventListener("click", () => oeffne(buch));
    return knopf;
  }

  // Welches Fach aufgeht, wenn das Kind noch keines gewählt hat: das zu
  // seiner Lesestufe.
  const FACH_JE_LESESTUFE = { hoeren: "hoerbuch", buchstaben: "hoerbuch", woerter: "erste", saetze: "klein", geschichten: "geschichte" };

  // Das Regal hat ein Fach je Stufe; oben die Reiter, offen ist eines. So
  // bleiben die Bücher gross genug zum Antippen, auch wenn es viele sind.
  function zeigeRegal() {
    stopLesen();
    state.ansicht = "regal";
    state.buch = null;
    state.nachsehen = false;
    adresse(null);
    titel("Bücherregal");
    kids()?.setHelp?.(HELP_REGAL);
    shell.closeOverlay();
    shell.setPhase("intro");
    shell.clear();
    host.dataset.ansicht = "regal";
    const stufen = bib.STUFEN.filter((stufe) => bib.BUECHER.some((b) => b.stufe === stufe.id));
    if (!stufen.some((stufe) => stufe.id === state.fach)) {
      const passend = FACH_JE_LESESTUFE[stand?.lesestufe?.() || ""];
      state.fach = stufen.some((stufe) => stufe.id === passend) ? passend : stufen[0]?.id;
    }
    const reiter = shell.el("div", "bu-reiter-leiste");
    reiter.setAttribute("role", "tablist");
    reiter.setAttribute("aria-label", "Fächer im Regal");
    const regal = shell.el("div", "bu-regal");
    const gelesenJetzt = gelesen();
    stufen.forEach((stufe) => {
      const liste = bib.BUECHER.filter((b) => b.stufe === stufe.id);
      const offen = stufe.id === state.fach;
      const knopf = shell.el("button", `bu-reiter${offen ? " is-offen" : ""}`);
      knopf.type = "button";
      knopf.dataset.stufe = stufe.id;
      knopf.setAttribute("role", "tab");
      knopf.setAttribute("aria-selected", offen ? "true" : "false");
      knopf.append(shell.el("span", "bu-schild-zeichen", { hoerbuch: "👂", kapitel: "📚" }[stufe.id] || "📖"), shell.el("span", "bu-reiter-text", stufe.titel));
      // Ein Haken, wenn jedes Buch im Fach gelesen ist.
      if (liste.every((b) => gelesenJetzt[b.id])) knopf.append(shell.el("span", "bu-reiter-fertig", "✓"));
      knopf.addEventListener("click", () => {
        if (state.fach === stufe.id) return;
        state.fach = stufe.id;
        zeigeRegal();
      });
      reiter.append(knopf);
      const fach = shell.el("section", "bu-fach");
      fach.dataset.stufe = stufe.id;
      fach.setAttribute("role", "tabpanel");
      fach.setAttribute("aria-label", stufe.titel);
      fach.hidden = !offen;
      const reihe = shell.el("div", "bu-reihe");
      liste.forEach((buch) => reihe.append(umschlag(buch)));
      fach.append(reihe, shell.el("div", "bu-brett"));
      regal.append(fach);
    });
    shell.play.append(reiter, regal);
    regalEinpassen();
  }

  // Die Bücher des offenen Fachs in einer Reihe, so gross, wie es Breite und
  // Höhe erlauben: Auf dem Handy rollt nichts (scripts/check-handy.mjs).
  //   Abstände wie im Stylesheet: Regal 12 px Rand, Fach 2 × 6 px, 8 px
  //   zwischen zwei Büchern.
  function regalEinpassen() {
    const regal = shell.play.querySelector(".bu-regal");
    if (!regal) return;
    const buecher = regal.querySelectorAll(".bu-fach:not([hidden]) .bu-umschlag").length || 1;
    const breite = shell.play.clientWidth - 24 - 12 - (buecher - 1) * 8;
    // In der Höhe: Reiter, Brett, Sterne und Rand brauchen rund 130 px; ein
    // Umschlag ist 4 : 3 hoch.
    const hoehe = (shell.play.clientHeight - 130) * 0.75;
    const w = Math.max(56, Math.min(168, breite / buecher, hoehe));
    regal.style.setProperty("--bu-w", `${Math.floor(w)}px`);
  }
  window.addEventListener("resize", () => { if (state.ansicht === "regal") regalEinpassen(); });

  // Ist das Regal zu sehen, zeichnet es sich neu, wenn sich Schlösser
  // bewegen: Der Kontostand kommt beim Laden erst nach dem ersten Bild.
  function regalAuffrischen() {
    if (state.ansicht !== "regal") return;
    const scroll = shell.play.querySelector(".bu-regal")?.scrollLeft || 0;
    zeigeRegal();
    const regal = shell.play.querySelector(".bu-regal");
    if (regal) regal.scrollLeft = scroll;
  }

  // ---------------------------------------------------------------------------
  // Ein Buch öffnen: die Titelseite
  // ---------------------------------------------------------------------------
  function vorschlag(buch) {
    if (buch.stufe === "hoerbuch") return "vorlesen";
    const lesestufe = stand?.lesestufe?.() || "buchstaben";
    if (lesestufe === "hoeren" || lesestufe === "buchstaben") return "vorlesen";
    if (lesestufe === "woerter") return buch.stufe === "erste" ? "zusammen" : "vorlesen";
    if (lesestufe === "saetze") return buch.stufe === "erste" ? "selbst" : "zusammen";
    return "selbst";
  }

  function oeffne(buch) {
    if (!buch) return;
    if (!frei(buch)) {
      schranke()?.showGate?.({ host, ziel: `buecher.html?buch=${buch.id}` });
      return;
    }
    zeigeTitel(buch);
  }

  function zeigeTitel(buch) {
    stopLesen();
    state.buch = buch;
    state.ansicht = "titel";
    state.nachsehen = false;
    adresse(buch.id);
    titel(buch.titel);
    shell.closeOverlay();
    shell.setPhase("intro");
    shell.clear();
    host.dataset.ansicht = "titel";
    const hoerbuch = buch.stufe === "hoerbuch";
    kids()?.setHelp?.(hoerbuch ? HELP_HOERBUCH : HELP_TITEL);

    const seite = shell.el("div", "bu-titelseite");
    const deckel = shell.el("button", "bu-titel-deckel");
    deckel.type = "button";
    deckel.style.setProperty("--buch", buch.farbe);
    deckel.setAttribute("aria-label", `Der Titel: ${buch.titel}`);
    deckel.append(umschlagBild(buch, { gross: true }), shell.el("span", "bu-titel-text", stand?.zeige?.(buch.titel) ?? buch.titel));
    deckel.addEventListener("click", () => ton.sprich(buch.titel, { rate: TEMPO[buch.stufe] || 0.9 }));
    vorladen(buch);

    const wahl = shell.el("div", "bu-wahl");
    const stufe = bib.STUFEN.find((s) => s.id === buch.stufe);
    wahl.append(shell.el("p", "bu-stufe", stufe ? stufe.titel : ""));
    const knoepfe = shell.el("div", "bu-modi");
    const empfohlen = vorschlag(buch);
    const modi = hoerbuch ? ["vorlesen"] : ["vorlesen", "zusammen", "selbst"];
    modi.forEach((modus) => {
      const knopf = shell.el("button", `bu-modus${modus === empfohlen ? " is-empfohlen" : ""}`);
      knopf.type = "button";
      knopf.dataset.modus = modus;
      knopf.setAttribute("aria-label", hoerbuch ? "Vorlesen" : MODI[modus].titel);
      if (hoerbuch) {
        knopf.classList.add("is-los");
        knopf.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#3fbf74"/><polygon points="19,14 35,24 19,34" fill="#fff"/></svg>`;
      } else {
        knopf.append(shell.el("span", "bu-modus-bild", MODI[modus].bild), shell.el("span", "bu-modus-text", MODI[modus].titel));
      }
      knopf.addEventListener("click", () => beginne(modus));
      knoepfe.append(knopf);
    });
    wahl.append(knoepfe);
    // Ein Kapitelbuch, das mittendrin liegen blieb: Das Lesezeichen führt
    // dorthin zurück, in derselben Art zu lesen. Die Arten oben fangen vorne an.
    const zeichen = lesezeichenVon(buch);
    if (zeichen) {
      const nr = kapitelNr(buch, zeichen.seite);
      const weiter = shell.el("button", "bu-lesezeichen");
      weiter.type = "button";
      weiter.dataset.seite = String(zeichen.seite);
      weiter.setAttribute("aria-label", `Weiterlesen bei Kapitel ${nr}`);
      weiter.append(shell.el("span", "bu-lesezeichen-bild", "🔖"), shell.el("span", "bu-lesezeichen-text", stand?.zeige?.(`Weiter bei Kapitel ${nr}`) ?? `Weiter bei Kapitel ${nr}`));
      weiter.addEventListener("click", () => beginne(zeichen.modus, zeichen.seite));
      wahl.classList.add("hat-lesezeichen");
      wahl.append(weiter);
    }
    const eintrag = gelesen()[buch.id];
    if (eintrag) wahl.append(sterneZeile(Number(eintrag.sterne) || 1));
    seite.append(deckel, wahl);
    shell.play.append(seite);
    // Der Titel – wenn der Browser schon sprechen darf (nach einem Tipp im
    // Regal). Kommt das Kind direkt hierher, bleibt es still bis zum ersten
    // Tipp.
    window.setTimeout(() => { if (state.ansicht === "titel" && state.buch === buch) ton.sprich(buch.titel, { rate: TEMPO[buch.stufe] || 0.9 }); }, 250);
    window.setTimeout(() => (wahl.querySelector(".bu-lesezeichen") || knoepfe.querySelector(".is-empfohlen"))?.focus?.({ preventScroll: true }), 60);
  }

  //   ab   die Seite, auf der es losgeht (das Lesezeichen); sonst vorne
  function beginne(modus, ab = 0) {
    if (!state.buch) return;
    state.modus = modus;
    state.seite = ab;
    state.punkte = 0;
    shell.setPhase("play");
    zeigeSeite();
  }

  // ---------------------------------------------------------------------------
  // Eine Seite
  // ---------------------------------------------------------------------------
  // Die Sätze des ganzen Buches sind durchgezählt; im Zusammen-Modus ist jeder
  // zweite der des Kindes. Bei einem Satz je Seite heisst das: jede zweite
  // Seite.
  function satzAnfang(buch, seitenNr) {
    let n = 0;
    for (let i = 0; i < seitenNr; i += 1) n += bib.saetze(buch.seiten[i].text).length;
    return n;
  }

  function istKindSatz(nrAufSeite) {
    if (state.modus !== "zusammen" || !state.buch) return false;
    return (satzAnfang(state.buch, state.seite) + nrAufSeite) % 2 === 1;
  }

  // Die Überschrift über der ersten Seite eines Kapitels. Ein Tipp liest sie.
  function kapitelKopf(buch, seitenNr) {
    const zeige = (text) => stand?.zeige?.(text) ?? text;
    const kopf = shell.el("button", "bu-kapitel");
    kopf.type = "button";
    kopf.append(shell.el("span", "bu-kapitel-nr", zeige(`Kapitel ${kapitelNr(buch, seitenNr)}`)), shell.el("span", "bu-kapitel-titel", zeige(buch.seiten[seitenNr].kapitel)));
    kopf.addEventListener("click", () => {
      if (Date.now() - state.gewischt < 400 || !wortHilfe()) return;
      stopLesen();
      ton.sprich(kapitelSatz(buch, seitenNr), { rate: TEMPO[buch.stufe] || 0.9 });
    });
    return kopf;
  }

  function seitenText(seite) {
    const box = shell.el("div", "bu-text");
    if (seite.kapitel) box.append(kapitelKopf(state.buch, state.seite));
    bib.saetze(seite.text).forEach((satz, nr) => {
      const zeile = shell.el("span", "bu-satz");
      zeile.dataset.nr = String(nr);
      bib.woerter(satz).forEach((token, i) => {
        if (i) zeile.append(document.createTextNode(" "));
        const wort = bib.nurWort(token);
        const zeigen = stand?.zeige?.(token) ?? token;
        if (!wort) { zeile.append(document.createTextNode(zeigen)); return; }
        const knopf = shell.el("span", "bu-wort", zeigen);
        knopf.dataset.wort = wort;
        knopf.addEventListener("click", (ereignis) => { ereignis.stopPropagation(); wortAntippen(knopf); });
        zeile.append(knopf);
      });
      box.append(zeile, document.createTextNode(" "));
    });
    return box;
  }

  function leiste() {
    const unten = shell.el("div", "bu-leiste");
    const zurueck = shell.el("button", "bu-pfeil bu-zurueck");
    zurueck.type = "button";
    zurueck.setAttribute("aria-label", "Zurückblättern");
    zurueck.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#ffffff"/><polyline points="28,13 17,24 28,35" fill="none" stroke="#243047" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    zurueck.addEventListener("click", zurueckBlaettern);
    const punkte = shell.el("div", "bu-punkte");
    punkte.setAttribute("aria-hidden", "true");
    const vorlesen = shell.el("button", "bu-vorlesen");
    vorlesen.type = "button";
    vorlesen.setAttribute("aria-label", "Die Seite vorlesen");
    vorlesen.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#ffffff"/><path d="M12 20 h6 l8 -7 v22 l-8 -7 h-6 z" fill="#243047"/><path d="M30 18 q4 6 0 12 M33 14 q8 10 0 20" fill="none" stroke="#243047" stroke-width="3" stroke-linecap="round"/></svg>`;
    vorlesen.addEventListener("click", seiteVorlesen);
    const weiter = shell.el("button", "bu-pfeil bu-weiter");
    weiter.type = "button";
    weiter.setAttribute("aria-label", "Umblättern");
    weiter.addEventListener("click", weiterTippen);
    unten.append(zurueck, punkte, vorlesen, weiter);
    return { unten, zurueck, punkte, vorlesen, weiter };
  }

  const PFEIL_WEITER = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#3fbf74"/><polyline points="20,13 31,24 20,35" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const PFEIL_FRAGE = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#3fbf74"/><path d="M33 30 v-6 a8 8 0 0 0 -8 -8 h-10" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><polyline points="20,10 14,16 20,22" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function zeigeSeite() {
    stopLesen();
    const buch = state.buch;
    const seite = buch.seiten[state.seite];
    state.ansicht = "seite";
    state.satz = 0;
    host.dataset.ansicht = "seite";
    shell.closeOverlay();
    shell.clear();
    const hilfe = wortHilfe() ? HELP_SEITE[state.modus] : HELP_SEITE_OHNE[state.modus] || HELP_SEITE[state.modus];
    kids()?.setHelp?.(state.nachsehen ? `Hier steht es. ${hilfe} Der Pfeil führt zurück zur Frage.` : hilfe);

    const blatt = shell.el("div", "bu-buch");
    blatt.dataset.stufe = buch.stufe;
    blatt.dataset.modus = state.modus;
    blatt.dataset.groesse = stand?.schriftGroesse?.() || "normal";
    if (!wortHilfe()) blatt.dataset.hilfe = "aus";
    const doppel = shell.el("div", "bu-seite");
    const bild = shell.el("div", "bu-bild");
    bild.append(buchBild(buch, seite));
    const text = seitenText(seite);
    doppel.append(bild, text);
    const l = leiste();
    blatt.append(doppel, l.unten);
    shell.play.append(blatt);
    el = { blatt, doppel, text, ...l };
    // Das Lesezeichen wandert mit – nicht beim Nachsehen aus den Fragen.
    if (!state.nachsehen) lesezeichenSetzen(buch, state.seite, state.modus);

    // Seitenpunkte: wo im Buch das Kind ist.
    buch.seiten.forEach((_, i) => el.punkte.append(shell.el("span", i === state.seite ? "bu-punkt is-hier" : i < state.seite ? "bu-punkt is-gelesen" : "bu-punkt")));
    el.zurueck.hidden = state.nachsehen;
    el.punkte.hidden = state.nachsehen;
    // Ohne Wort-Hilfe liest auch der Lautsprecher die Seite nicht vor.
    el.vorlesen.hidden = !wortHilfe();
    el.weiter.innerHTML = state.nachsehen ? PFEIL_FRAGE : PFEIL_WEITER;
    el.weiter.setAttribute("aria-label", state.nachsehen ? "Zurück zur Frage" : state.seite === buch.seiten.length - 1 ? "Zu den Fragen" : "Umblättern");

    textEinpassen();
    wischen(doppel);
    blatt.classList.add("blaettert");
    if (state.modus !== "selbst") window.setTimeout(() => { if (state.ansicht === "seite" && el.blatt === blatt) lies(); }, 380);
  }

  // Passt der Text einer langen Seite auf einem kleinen Handy nicht in seinen
  // Kasten, wird die Schrift kleiner, statt dass der Kasten rollt – bis zu
  // einer Grenze, unter der ein Kind nicht mehr gut liest.
  function textEinpassen() {
    const kasten = el.text;
    if (!kasten) return;
    kasten.style.fontSize = "";
    let groesse = parseFloat(window.getComputedStyle(kasten).fontSize) || 18;
    for (let i = 0; i < 24 && kasten.scrollHeight > kasten.clientHeight + 1 && groesse > 13; i += 1) {
      groesse -= 1;
      kasten.style.fontSize = `${groesse}px`;
    }
  }
  window.addEventListener("resize", () => { if (state.ansicht === "seite") textEinpassen(); });

  // Wischen blättert, wie in jedem Buch auf dem Tablet.
  function wischen(flaeche) {
    let start = null;
    flaeche.addEventListener("pointerdown", (ereignis) => { start = { x: ereignis.clientX, y: ereignis.clientY }; });
    flaeche.addEventListener("pointerup", (ereignis) => {
      if (!start) return;
      const dx = ereignis.clientX - start.x;
      const dy = ereignis.clientY - start.y;
      start = null;
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      state.gewischt = Date.now();
      if (dx < 0) weiterTippen();
      else if (!state.nachsehen) zurueckBlaettern();
    });
    flaeche.addEventListener("pointercancel", () => { start = null; });
  }

  function markiere(nr, wer) {
    el.text?.querySelector(".bu-kapitel")?.classList.toggle("ist-dran", wer === "kopf");
    el.text?.querySelectorAll(".bu-satz").forEach((zeile, i) => {
      zeile.classList.toggle("ist-dran", i === nr && wer === "stimme");
      zeile.classList.toggle("du-bist-dran", i === nr && wer === "kind");
    });
    el.text?.querySelectorAll(".bu-wort.ist-gesprochen").forEach((w) => w.classList.remove("ist-gesprochen"));
    el.weiter?.classList.toggle("pulst", wer === "kind" || wer === "fertig");
  }

  // Einen Satz sprechen und Wort für Wort mitleuchten – wo der Browser die
  // Wortgrenzen meldet. Wo nicht, leuchtet der ganze Satz.
  function sprichSatz(zeile) {
    const woerter = [...zeile.querySelectorAll(".bu-wort")];
    const text = [...zeile.childNodes].map((k) => k.textContent).join("");
    const tokens = bib.woerter(text);
    // Die Wortnummern der Sprachausgabe zählen alle Stücke zwischen
    // Leerzeichen, auch einen Gedankenstrich. Welches davon ein Wort ist:
    const zuWort = [];
    let w = 0;
    tokens.forEach((token) => { zuWort.push(bib.nurWort(token) ? w++ : -1); });
    const satz = bib.saetze(state.buch.seiten[state.seite].text)[Number(zeile.dataset.nr)] || text;
    return ton.sprich(satz, {
      rate: TEMPO[state.buch.stufe] || 0.9,
      onWord: (nr) => {
        woerter.forEach((wort) => wort.classList.remove("ist-gesprochen"));
        const index = zuWort[nr];
        if (index >= 0) woerter[index]?.classList.add("ist-gesprochen");
      },
    });
  }

  //   ab     ab welchem Satz der Seite
  //   alles  auch die Sätze des Kindes (der Lautsprecher unten)
  // state.liest bleibt gesetzt, solange der Vorleser die Seite in der Hand
  // hat – auch in der kurzen Pause zwischen zwei Sätzen. Ist es aus, obwohl
  // die Seite nicht fertig ist, wurde er unterbrochen (ein Tipp auf ein Wort),
  // und der Pfeil lässt ihn weiterlesen, statt umzublättern.
  async function lies({ ab = 0, alles = false } = {}) {
    stopLesen();
    const meine = state.lauf;
    const zeilen = [...(el.text?.querySelectorAll(".bu-satz") || [])];
    state.liest = true;
    // Eine Kapitelüberschrift kommt zuerst – beim Selberlesen nur über den
    // Lautsprecher.
    if (ab === 0 && el.text?.querySelector(".bu-kapitel") && (alles || state.modus !== "selbst")) {
      markiere(-1, "kopf");
      await ton.sprich(kapitelSatz(state.buch, state.seite), { rate: TEMPO[state.buch.stufe] || 0.9 });
      if (meine !== state.lauf) return;
      await ton.pause(320);
    }
    for (let i = ab; i < zeilen.length; i += 1) {
      if (meine !== state.lauf) return;
      if (!alles && istKindSatz(i)) {
        state.satz = i;
        state.liest = false;
        markiere(i, "kind");
        return;
      }
      if (!alles) state.satz = i;
      markiere(i, "stimme");
      await sprichSatz(zeilen[i]);
      if (meine !== state.lauf) return;
      await ton.pause(260);
    }
    if (meine !== state.lauf) return;
    state.liest = false;
    if (alles && state.modus === "zusammen" && state.satz < zeilen.length && istKindSatz(state.satz)) {
      // Nach dem Vorlesen ist das Kind wieder dran, wo es war.
      markiere(state.satz, "kind");
      return;
    }
    if (!alles) state.satz = zeilen.length;
    markiere(-1, "fertig");
  }

  function seiteVorlesen() {
    if (state.ansicht !== "seite" || !wortHilfe()) return;
    lies({ alles: true });
  }

  function wortAntippen(knopf) {
    if (Date.now() - state.gewischt < 400) return;
    if (!wortHilfe()) return;
    // Spricht die Stimme gerade, hört sie auf: Das Kind will dieses Wort.
    const warZusammen = state.modus === "zusammen";
    stopLesen();
    el.text?.querySelectorAll(".bu-satz.ist-dran, .bu-kapitel.ist-dran").forEach((z) => z.classList.remove("ist-dran"));
    knopf.classList.remove("ist-getippt");
    void knopf.offsetWidth;
    knopf.classList.add("ist-getippt");
    ton.sprich(knopf.dataset.wort, { rate: 0.8 });
    if (warZusammen && istKindSatz(state.satz)) markiere(state.satz, "kind");
    else el.weiter?.classList.add("pulst");
  }

  function weiterTippen() {
    if (state.ansicht !== "seite") return;
    if (state.nachsehen) { zurueckZurFrage(); return; }
    const anzahl = el.text?.querySelectorAll(".bu-satz").length || 0;
    if (state.modus === "zusammen" && state.satz < anzahl) {
      if (istKindSatz(state.satz)) {
        // Das Kind hat seinen Satz gelesen. War es der letzte der Seite, wird
        // gleich umgeblättert, sonst liest die Stimme weiter.
        kids()?.vibrate?.(10);
        if (state.satz + 1 < anzahl) { lies({ ab: state.satz + 1 }); return; }
      } else if (!state.liest) {
        // Unterbrochen (ein Tipp auf ein Wort): Die Stimme macht weiter.
        lies({ ab: state.satz });
        return;
      }
    }
    naechsteSeite();
  }

  function naechsteSeite() {
    stopLesen();
    if (state.seite < state.buch.seiten.length - 1) {
      state.seite += 1;
      ton.klopf(640);
      zeigeSeite();
      return;
    }
    starteFragen();
  }

  function zurueckBlaettern() {
    if (state.ansicht !== "seite" || state.nachsehen) return;
    stopLesen();
    if (state.seite === 0) { zeigeTitel(state.buch); return; }
    state.seite -= 1;
    zeigeSeite();
  }

  // ---------------------------------------------------------------------------
  // Fragen zum Buch
  // ---------------------------------------------------------------------------
  function starteFragen() {
    state.frage = 0;
    state.punkte = 0;
    state.falsch = new Set();
    zeigeFrage();
  }

  // Wird die Frage vorgelesen? Beim Hörbuch und beim Vorlesen immer – dort
  // liest das Kind ja nicht selbst.
  function frageVorlesen() {
    return state.buch.stufe === "hoerbuch" || state.modus === "vorlesen";
  }

  function frageSprechen(frage) {
    const nurText = frage.antworten.every((a) => !a.bild && !a.figur);
    let text = frage.frage;
    if (nurText && frageVorlesen()) {
      const teile = frage.antworten.map((a) => a.text.replace(/[.!?]$/, ""));
      text += ` ${teile.slice(0, -1).join(", ")} oder ${teile[teile.length - 1]}?`;
    }
    return ton.sprich(text, { rate: TEMPO[state.buch.stufe] || 0.9 });
  }

  function antwortBild(antwort) {
    if (antwort.figur) {
      const svg = art.el("svg", { viewBox: "-24 -30 48 48", class: "bu-antwort-figur", "aria-hidden": "true" });
      svg.append(zugArt.driverHead(antwort.figur, 14));
      return svg;
    }
    if (antwort.bild) return shell.el("span", "bu-antwort-emoji", antwort.bild);
    return null;
  }

  function zeigeFrage() {
    stopLesen();
    const buch = state.buch;
    const frage = buch.fragen[state.frage];
    state.ansicht = "frage";
    state.nachsehen = false;
    host.dataset.ansicht = "frage";
    shell.clear();
    kids()?.setHelp?.(HELP_FRAGE);

    const box = shell.el("div", "bu-fragen");
    box.dataset.stufe = buch.stufe;
    const kopf = shell.el("div", "bu-frage-kopf");
    const hoeren = shell.el("button", "bu-vorlesen bu-frage-ton");
    hoeren.type = "button";
    hoeren.setAttribute("aria-label", "Die Frage vorlesen");
    hoeren.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#ffffff"/><path d="M12 20 h6 l8 -7 v22 l-8 -7 h-6 z" fill="#243047"/><path d="M30 18 q4 6 0 12 M33 14 q8 10 0 20" fill="none" stroke="#243047" stroke-width="3" stroke-linecap="round"/></svg>`;
    hoeren.addEventListener("click", () => frageSprechen(frage));
    // Ohne Wort-Hilfe liest das Kind auch die Frage selbst.
    hoeren.hidden = !wortHilfe();
    const text = shell.el("p", "bu-frage", stand?.zeige?.(frage.frage) ?? frage.frage);
    kopf.append(hoeren, text);

    const antworten = shell.el("div", "bu-antworten");
    frage.antworten.forEach((antwort, i) => {
      const knopf = shell.el("button", "bu-antwort");
      knopf.type = "button";
      knopf.dataset.nr = String(i);
      knopf.setAttribute("aria-label", antwort.text);
      const bild = antwortBild(antwort);
      if (bild) knopf.append(bild);
      else knopf.classList.add("nur-text");
      knopf.append(shell.el("span", "bu-antwort-text", stand?.zeige?.(antwort.text) ?? antwort.text));
      if (state.falsch.has(i)) knopf.classList.add("ist-falsch");
      knopf.addEventListener("click", () => antworte(i, knopf));
      antworten.append(knopf);
    });

    const unten = shell.el("div", "bu-frage-unten");
    const nachsehen = shell.el("button", "bu-nachsehen");
    nachsehen.type = "button";
    nachsehen.setAttribute("aria-label", "Im Buch nachsehen");
    nachsehen.append(shell.el("span", "bu-nachsehen-bild", "📖"), shell.el("span", "bu-nachsehen-text", "Im Buch nachsehen"));
    nachsehen.hidden = state.falsch.size === 0;
    nachsehen.addEventListener("click", imBuchNachsehen);
    const punkte = shell.el("div", "bu-punkte");
    punkte.setAttribute("aria-hidden", "true");
    buch.fragen.forEach((_, i) => punkte.append(shell.el("span", i === state.frage ? "bu-punkt is-hier" : i < state.frage ? "bu-punkt is-gelesen" : "bu-punkt")));
    unten.append(nachsehen, punkte);

    box.append(kopf, antworten, unten);
    shell.play.append(box);
    el = { fragen: box, antworten, nachsehen };
    if (state.falsch.size >= 2) zeigeHin();
    if (frageVorlesen()) window.setTimeout(() => { if (state.ansicht === "frage" && el.fragen === box) frageSprechen(frage); }, 350);
  }

  function zeigeHin() {
    const richtig = state.buch.fragen[state.frage].richtig;
    el.antworten?.querySelector(`.bu-antwort[data-nr="${richtig}"]`)?.classList.add("zeigt-hin");
  }

  async function antworte(i, knopf) {
    if (state.ansicht !== "frage" || knopf.classList.contains("ist-falsch")) return;
    const frage = state.buch.fragen[state.frage];
    if (i !== frage.richtig) {
      state.falsch.add(i);
      knopf.classList.remove("wackelt");
      void knopf.offsetWidth;
      knopf.classList.add("wackelt", "ist-falsch");
      kids()?.playJingle?.("retry");
      el.nachsehen.hidden = false;
      el.nachsehen.classList.add("ist-neu");
      if (state.falsch.size >= 2) zeigeHin();
      if (frageVorlesen()) ton.sprich("Nicht ganz. Schau doch im Buch nach!", { rate: 0.9 });
      return;
    }
    state.ansicht = "frage-richtig";
    if (state.falsch.size === 0) state.punkte += 1;
    knopf.classList.add("ist-richtig");
    kids()?.playJingle?.("correct");
    await ton.sprich(frage.antworten[i].text, { rate: 0.9 });
    await ton.pause(500);
    if (state.ansicht !== "frage-richtig") return;
    state.frage += 1;
    state.falsch = new Set();
    if (state.frage >= state.buch.fragen.length) { fertig(); return; }
    zeigeFrage();
  }

  function imBuchNachsehen() {
    if (state.ansicht !== "frage") return;
    const frage = state.buch.fragen[state.frage];
    state.nachsehen = true;
    state.seite = Math.max(0, Math.min(state.buch.seiten.length - 1, (Number(frage.seite) || 1) - 1));
    zeigeSeite();
  }

  function zurueckZurFrage() {
    stopLesen();
    state.nachsehen = false;
    zeigeFrage();
  }

  // ---------------------------------------------------------------------------
  // Das Ende
  // ---------------------------------------------------------------------------
  function fertig() {
    stopLesen();
    const buch = state.buch;
    state.ansicht = "ende";
    host.dataset.ansicht = "ende";
    const von = buch.fragen.length;
    // Gelesen ist gelesen: Auch ohne eine richtige Antwort gibt es einen
    // Stern. Drei für alles gleich richtig, zwei mit einem Fehler.
    const sterne = state.punkte >= von ? 3 : state.punkte >= von - 1 ? 2 : 1;
    stand?.buchGelesen?.(buch.id, { sterne });
    // Ausgelesen: Das Lesezeichen fällt heraus.
    lesezeichenWeg(buch);
    const gehoert = state.modus === "vorlesen";
    spiel.ergebnis(shell, {
      id: ID,
      punkte: state.punkte,
      von,
      woerter: bib.wortZahl(buch),
      stars: sterne,
      label: buch.titel,
      detail: `${state.punkte} von ${von} Fragen gleich richtig`,
      speech: `${gehoert ? "Du hast das Buch angehört" : "Du hast das Buch gelesen"}: ${buch.titel}${/[.!?…]$/.test(buch.titel) ? "" : "."} ${state.punkte === von ? "Und jede Frage gleich richtig beantwortet!" : `${state.punkte} von ${von} Fragen waren gleich richtig.`}`,
      onBack: zeigeRegal,
    });
  }

  // ---------------------------------------------------------------------------
  // Der Lesewurm im Sessel hat «Bücher» gewählt
  // ---------------------------------------------------------------------------
  function naechstesBuch() {
    const stufen = PASST[stand?.lesestufe?.()] || PASST.buchstaben;
    const schon = gelesen();
    const kandidaten = bib.BUECHER.filter((b) => stufen.includes(b.stufe) && frei(b));
    const neu = kandidaten.filter((b) => !schon[b.id]).sort((a, b) => stufen.indexOf(a.stufe) - stufen.indexOf(b.stufe));
    if (neu.length) return neu[0];
    // Alles gelesen: das, was am längsten her ist.
    return [...kandidaten].sort((a, b) => (Number(schon[a.id]?.at) || 0) - (Number(schon[b.id]?.at) || 0))[0] || null;
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  // Pfeil zurück: aus einem Buch ans Regal, vom Regal in den Lesewagen.
  function zurueckKnopf() {
    if (state.ansicht !== "regal") { zeigeRegal(); return true; }
    return spiel.zurueck();
  }

  // «Noch einmal»: dasselbe Buch von vorn, im Regal das Regal.
  function nochEinmal() {
    if (state.buch) zeigeTitel(state.buch);
    else zeigeRegal();
  }

  // Die Adresse ist gelesen; die Seite trägt ab jetzt nur noch, was offen ist.
  // Das muss vor der Bühne geschehen: Sie fragt die Schranke nach der Adresse.
  let wunsch = null;
  let weiterLesen = false;
  try {
    const params = new URLSearchParams(window.location.search);
    wunsch = params.get("buch");
    weiterLesen = params.get("weiter") === "1";
  } catch { /* ohne Adresse */ }
  adresse(null);

  shell = spiel.mount({ host, id: ID, title: "Bücherregal", help: HELP_REGAL, onRestart: nochEinmal, onBack: zurueckKnopf });
  host.classList.add("bu-buehne");
  zeigeRegal();

  // Erst wenn feststeht, wer liest, stimmen die Schlösser – und erst dann
  // geht ein gewünschtes Buch auf.
  const bereit = schranke()?.whenReady?.() || Promise.resolve(true);
  bereit.then(() => {
    regalAuffrischen();
    if (wunsch && bib.BY_ID[wunsch]) oeffne(bib.BY_ID[wunsch]);
    else if (weiterLesen) {
      const buch = naechstesBuch();
      if (buch) oeffne(buch);
    }
  });
  schranke()?.onChange?.(regalAuffrischen);
  stand?.onChange?.(() => { if (state.ansicht === "regal") regalAuffrischen(); });

  window.LernappBuecher = { buchBild, naechstesBuch, vorschlag, oeffne, zeigeRegal, kapitelNr, lesezeichenVon, LESEZEICHEN_KEY, state };
})();
