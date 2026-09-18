/*
 * admin.js – Der Adminbereich als eigene Seite.
 * ---------------------------------------------------------------------------
 * Bis hierher war der Adminbereich ein Abschnitt im Profilfenster: ein Popup
 * über dem Zug eines Kindes, in dem Kontenliste, Gästeliste, Spielauswertung
 * und Wagen um denselben Platz stritten. Das ist jetzt admin.html, und diese
 * Datei baut sie.
 *
 * Fünf Sichten, und jede beantwortet eine andere Frage:
 *
 *   User     Wer hat ein Konto, wer hat bezahlt, wer war wann zuletzt da,
 *            und was hat er probiert? Die ausführlichste Sicht, mit Filtern
 *            nach bezahlt/gratis und Eltern/Kind, mit Sortierung nach letzter
 *            Aktivität, Name oder Kaufstand – und mit den beiden Knöpfen, die
 *            es sonst nirgends gibt: freischalten und Gruppe setzen.
 *   Gäste    Wer spielt ohne Konto.
 *   Spiele   Was ist mit einem Spiel los – über alle Konten und Gäste.
 *   Wagen    Welches Wagen-Set gilt für alle. Familien dürfen davon abweichen
 *            (Elternbereich); hier steht, welche es tun.
 *   Gruppen  Wer sieht wessen Zug. Familien sind von selbst eine Gruppe – hier
 *            entstehen die übergreifenden, und nur hier: Das kann sonst
 *            niemand, weder ein Kind noch ein Elternkonto (firestore.rules).
 *
 * Gerechnet und gezeichnet wird mit denselben Bausteinen wie beim Kind:
 * window.LernappFirebase.ansicht (in firebase.js), train-progress.js für den
 * Zug, highscore.js für die Spiele. Eine zweite Rechnung wäre eine zweite
 * Wahrheit – und die falsche wäre immer die hier.
 *
 * Wer hier hereindarf, entscheidet nicht diese Datei, sondern firestore.rules
 * und der Server: Wer kein Admin ist, bekommt von Firestore keine Daten und
 * vom Server ein 403. Die Prüfung hier ist nur die Höflichkeit, es zu sagen,
 * statt eine leere Seite zu zeigen.
 */
(() => {
  "use strict";

  const seite = document.querySelector("[data-admin-seite]");
  const werZeile = document.querySelector("[data-admin-wer]");
  if (!seite) return;

  const cloud = () => window.LernappFirebase || null;
  const api = () => cloud()?.admin || null;
  const v = () => cloud()?.ansicht || null;
  const t = (wert) => (v()?.text || String)(wert);

  const REITER = [
    ["users", "User"],
    ["guests", "Gäste"],
    ["games", "Spiele"],
    ["wagons", "Wagen"],
    ["groups", "Gruppen"],
  ];

  const SORTIERUNGEN = [
    ["aktivitaet", "Letzte Aktivität"],
    ["kauf", "Bezahlt"],
    ["name", "Name"],
  ];

  const zustand = {
    reiter: "users",
    konten: [],
    gaeste: [],
    kaeufe: new Map(),
    geladen: { konten: false, gaeste: false, kaeufe: false },
    fehler: "",
    // User-Sicht
    kaufFilter: "alle",     // alle | bezahlt | gratis
    rolleFilter: "alle",    // alle | eltern | kinder
    sortierung: "aktivitaet",
    absteigend: true,
    suche: "",
    offenesKonto: null,
    details: new Map(),
    spielFilter: "all",
    // laufende Arbeit je Konto
    laeuft: null,
    kontoFehler: { id: null, text: "" },
    frage: null,            // {art: "reset"|"gratis-weg", uid}
    // Gäste
    offenerGast: null,
    gastDetails: new Map(),
    // Spiele
    spieleBereich: "all",
    // Wagen
    setFrage: null,
    setLaeuft: "",
    setFehler: "",
    setFertig: "",
    // Gruppen
    gruppeBearbeiten: null, // {id, name, mitglieder:Set<uid>}
    gruppeLaeuft: "",
    gruppeFehler: "",
    gruppeFertig: "",
  };

  // ---------------------------------------------------------------------------
  // Hereinkommen
  // ---------------------------------------------------------------------------
  // Die Anmeldung steht nicht sofort fest: Firebase meldet sie asynchron, und
  // firebase.js ruft dabei setAccountStatus auf. Statt einen eigenen Beobachter
  // aufzumachen, wird hier kurz gewartet – und wer nach ein paar Sekunden noch
  // nicht angemeldet ist, bekommt die Einladung, es zu tun.
  let bereitsGezeichnet = false;

  async function start() {
    const angemeldet = await warteAufAnmeldung();
    if (!angemeldet) {
      zeigeAnmeldung();
      return;
    }
    if (!api()?.isAdmin?.()) {
      zeigeAbweisung();
      return;
    }
    const wer = cloud()?.getUser?.();
    if (werZeile && wer) werZeile.textContent = wer.email || wer.name || "";
    bereitsGezeichnet = true;
    zeichne();
    lade();
  }

  function warteAufAnmeldung() {
    return new Promise((fertig) => {
      const beginn = Date.now();
      const sehen = () => {
        if (cloud()?.isSignedIn?.()) return fertig(true);
        if (Date.now() - beginn > 6000) return fertig(false);
        window.setTimeout(sehen, 120);
      };
      sehen();
    });
  }

  function zeigeAnmeldung() {
    seite.innerHTML = `
      <section class="admin-hinweis">
        <h2>Nicht angemeldet</h2>
        <p>Der Adminbereich gehört zum Konto <strong>alain.sc2@gmail.com</strong>. Melde dich im Profilfenster an – dann steht hier die Liste.</p>
        <button type="button" class="knopf" data-anmelden>Profilfenster öffnen</button>
      </section>`;
    seite.querySelector("[data-anmelden]")?.addEventListener("click", () => cloud()?.openAccount?.());
    // Wer sich im Fenster anmeldet, soll nicht noch einmal klicken müssen.
    if (!bereitsGezeichnet) window.setTimeout(() => { if (cloud()?.isSignedIn?.()) start(); }, 1500);
  }

  function zeigeAbweisung() {
    const wer = cloud()?.getUser?.();
    seite.innerHTML = `
      <section class="admin-hinweis">
        <h2>Kein Zugang</h2>
        <p>Angemeldet als <strong>${t(wer?.email || wer?.name || "unbekannt")}</strong>. Der Adminbereich gehört einem einzigen Konto, und das ist ein anderes.</p>
        <p class="account-muted">Das ist keine Höflichkeitsschranke: Die Firestore-Regeln geben die Daten ohnehin nur diesem einen, verifizierten Konto.</p>
        <p><a class="knopf zweit" href="index.html">Zur App</a></p>
      </section>`;
  }

  // ---------------------------------------------------------------------------
  // Laden
  // ---------------------------------------------------------------------------
  // Konten, Käufe und Gäste kommen in einem Zug: Die Kontenliste braucht die
  // Käufe (bezahlt oder nicht), die Spielauswertung braucht beides. Einzeln
  // nachzuladen hiesse, dass jeder Reiterwechsel wieder wartet.
  async function lade({ neu = false } = {}) {
    if (neu) {
      zustand.geladen = { konten: false, gaeste: false, kaeufe: false };
      zustand.details.clear();
      zustand.gastDetails.clear();
    }
    zustand.fehler = "";
    zeichne();
    try {
      const [konten, kaeufe, gaeste] = await Promise.all([
        zustand.geladen.konten ? zustand.konten : api().ladeKonten(),
        zustand.geladen.kaeufe ? zustand.kaeufe : api().ladeKaeufe(),
        zustand.geladen.gaeste ? zustand.gaeste : api().ladeGaeste(),
      ]);
      zustand.konten = konten;
      zustand.kaeufe = kaeufe;
      zustand.gaeste = gaeste;
      zustand.geladen = { konten: true, gaeste: true, kaeufe: true };
    } catch (fehler) {
      zustand.fehler = api().fehlerText(fehler);
    }
    zeichne();
  }

  // ---------------------------------------------------------------------------
  // Was ein Konto ist
  // ---------------------------------------------------------------------------
  // Drei Dinge, die die Liste über jedes Konto wissen muss und die nirgends
  // als Feld dastehen: welche Rolle es hat, ob es bezahlt ist, und wann es
  // zuletzt da war.
  //
  // Die Rolle steht zwar am Konto (role), aber nicht bei allen: Konten aus der
  // Zeit vor den Elternkonten haben keines. Deshalb wird sie hergeleitet –
  // eine technische Adresse gehört einem Kind, eine echte den Eltern.
  function rolleVon(konto) {
    if (konto.isAdmin || konto.role === "admin") return "admin";
    if (typeof konto.parentUid === "string" && konto.parentUid) return "kind";
    if (konto.role === "child" || konto.role === "parent") return konto.role === "child" ? "kind" : "eltern";
    const adresse = String(konto.authEmail || konto.email || "");
    return adresse.endsWith("@lernapp.local") ? "kind" : "eltern";
  }

  const ROLLEN_TEXT = { admin: "Admin", eltern: "Eltern", kind: "Kind" };

  // Bezahlt, geschenkt oder gar nichts. "gruender" sind die Konten von vor dem
  // Kauf: ein Kind ohne Elternkonto. Sie sind frei, ohne je gezahlt zu haben –
  // dieselbe Regel wie in entitlement.js, sonst stünde hier ein anderer Stand
  // als beim Kind auf dem Bildschirm.
  function kaufVon(konto) {
    const eintrag = zustand.kaeufe.get(konto.id);
    if (eintrag?.active) return eintrag.source === "admin" ? "geschenk" : "bezahlt";
    if (eintrag && !eintrag.active) return "zurueck";
    if (rolleVon(konto) === "kind" && !konto.parentUid) return "gruender";
    return "gratis";
  }

  const KAUF_TEXT = {
    bezahlt: "Bezahlt",
    geschenk: "Freigeschaltet",
    gruender: "Gründer",
    zurueck: "Zurückerstattet",
    gratis: "Gratis",
  };

  // Frei unterwegs ist, wer nichts bezahlt hat – für den Filter "Gratis" und
  // für die Zahlen oben. Ein Gründer-Konto zählt dazu: Es ist frei, aber es
  // ist kein Kauf.
  function istBezahlt(konto) {
    return kaufVon(konto) === "bezahlt";
  }

  function kontenGefiltert() {
    const suche = zustand.suche.trim().toLowerCase();
    const gefiltert = zustand.konten.filter((konto) => {
      const kauf = kaufVon(konto);
      if (zustand.kaufFilter === "bezahlt" && kauf !== "bezahlt") return false;
      if (zustand.kaufFilter === "gratis" && kauf === "bezahlt") return false;
      const rolle = rolleVon(konto);
      if (zustand.rolleFilter === "eltern" && rolle === "kind") return false;
      if (zustand.rolleFilter === "kinder" && rolle !== "kind") return false;
      if (!suche) return true;
      const heuhaufen = `${v().name(konto)} ${konto.authEmail || ""} ${konto.email || ""} ${konto.id} ${v().gruppe(konto.group)?.name || ""}`.toLowerCase();
      return heuhaufen.includes(suche);
    });

    const richtung = zustand.absteigend ? -1 : 1;
    const KAUF_RANG = { bezahlt: 0, geschenk: 1, gruender: 2, zurueck: 3, gratis: 4 };
    gefiltert.sort((a, b) => {
      if (zustand.sortierung === "name") return richtung * -1 * v().name(a).localeCompare(v().name(b), "de");
      if (zustand.sortierung === "kauf") {
        const unterschied = KAUF_RANG[kaufVon(b)] - KAUF_RANG[kaufVon(a)];
        if (unterschied) return richtung * unterschied;
        return v().zuletzt(b) - v().zuletzt(a);
      }
      return richtung * (v().zuletzt(a) - v().zuletzt(b));
    });
    return gefiltert;
  }

  // ---------------------------------------------------------------------------
  // Zeichnen
  // ---------------------------------------------------------------------------
  function zeichne() {
    seite.innerHTML = `
      <div class="admin-reiter" role="tablist" aria-label="Adminbereich">
        ${REITER.map(([id, label]) => `
          <button type="button" role="tab" data-reiter="${id}" class="${zustand.reiter === id ? "active" : ""}" aria-selected="${zustand.reiter === id}">${t(label)}</button>
        `).join("")}
        <button type="button" class="secondary-action admin-neu" data-neu-laden>Aktualisieren</button>
      </div>
      ${zustand.fehler ? `<p class="auth-status">${t(zustand.fehler)}</p>` : ""}
      <div class="admin-inhalt">${inhalt()}</div>
    `;

    seite.querySelectorAll("[data-reiter]").forEach((knopf) => {
      knopf.addEventListener("click", () => {
        zustand.reiter = knopf.dataset.reiter;
        zustand.spielFilter = "all";
        zeichne();
      });
    });
    seite.querySelector("[data-neu-laden]")?.addEventListener("click", () => lade({ neu: true }));
    binde();
  }

  function inhalt() {
    if (!zustand.geladen.konten) return `<p class="account-muted">Daten werden geladen...</p>`;
    if (zustand.reiter === "guests") return gaesteSicht();
    if (zustand.reiter === "games") return spieleSicht();
    if (zustand.reiter === "wagons") return wagenSicht();
    if (zustand.reiter === "groups") return gruppenSicht();
    return userSicht();
  }

  function binde() {
    if (zustand.reiter === "users") bindeUser();
    if (zustand.reiter === "guests") bindeGaeste();
    if (zustand.reiter === "games") bindeSpiele();
    if (zustand.reiter === "wagons") bindeWagen();
    if (zustand.reiter === "groups") bindeGruppen();
  }

  // ---------------------------------------------------------------------------
  // Sicht: User
  // ---------------------------------------------------------------------------
  function userSicht() {
    const alle = zustand.konten;
    const gezeigt = kontenGefiltert();
    const bezahlt = alle.filter(istBezahlt).length;
    const eltern = alle.filter((k) => rolleVon(k) !== "kind").length;
    const woche = Date.now() - 7 * 24 * 3600 * 1000;
    const aktiv = alle.filter((k) => v().zuletzt(k) > woche).length;

    return `
      <div class="stat-strip admin-stat-strip">
        <div><strong>${alle.length}</strong><span>Konten</span></div>
        <div><strong>${bezahlt}</strong><span>bezahlt</span></div>
        <div><strong>${alle.length - bezahlt}</strong><span>gratis</span></div>
        <div><strong>${eltern} / ${alle.length - eltern}</strong><span>Eltern / Kinder</span></div>
        <div><strong>${aktiv}</strong><span>diese Woche aktiv</span></div>
      </div>

      <div class="admin-werkzeug">
        <label class="admin-suche">
          <span class="sr-only">Suchen</span>
          <input type="search" data-suche value="${t(zustand.suche)}" placeholder="Name, Adresse, Gruppe" />
        </label>
        <div class="admin-filtergruppe" role="group" aria-label="Kaufstand">
          ${[["alle", "Alle"], ["bezahlt", "Bezahlt"], ["gratis", "Gratis"]].map(([id, label]) => `
            <button type="button" data-kauf-filter="${id}" class="${zustand.kaufFilter === id ? "active" : ""}">${label}</button>`).join("")}
        </div>
        <div class="admin-filtergruppe" role="group" aria-label="Rolle">
          ${[["alle", "Alle"], ["eltern", "Eltern"], ["kinder", "Kinder"]].map(([id, label]) => `
            <button type="button" data-rolle-filter="${id}" class="${zustand.rolleFilter === id ? "active" : ""}">${label}</button>`).join("")}
        </div>
        <div class="admin-filtergruppe" role="group" aria-label="Sortieren nach">
          ${SORTIERUNGEN.map(([id, label]) => `
            <button type="button" data-sortierung="${id}" class="${zustand.sortierung === id ? "active" : ""}">${label}${zustand.sortierung === id ? (zustand.absteigend ? " ↓" : " ↑") : ""}</button>`).join("")}
        </div>
      </div>

      <p class="account-muted admin-note">${gezeigt.length} von ${alle.length} Konten. Ein Tipp auf eine Zeile klappt sie auf.</p>
      <div class="admin-accordion" aria-label="Konten">
        ${gezeigt.length ? gezeigt.map(kontoZeile).join("") : `<p class="account-muted">Kein Konto passt zu dieser Auswahl.</p>`}
      </div>
    `;
  }

  function kontoZeile(konto) {
    const offen = zustand.offenesKonto === konto.id;
    const detail = zustand.details.get(konto.id);
    const laeuft = zustand.laeuft === konto.id;
    const rolle = rolleVon(konto);
    const kauf = kaufVon(konto);
    const gruppe = v().gruppe(konto.group);
    const summary = konto.adminSummary || v().zusammenfassung(konto, konto.levelDocs || []);
    const gesehen = v().zuletzt(konto);
    const eltern = rolle === "kind" && konto.parentUid
      ? zustand.konten.find((k) => k.id === konto.parentUid)
      : null;

    const koerper = !offen ? "" : (laeuft && !detail
      ? `<p class="account-muted">Details werden geladen...</p>`
      : kontoDetail(konto, detail));

    return `
      <article class="admin-entry${offen ? " is-open" : ""}">
        <button type="button" class="admin-entry-head" data-konto="${t(konto.id)}" aria-expanded="${offen}">
          <span class="admin-entry-caret" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="admin-entry-name">
            <strong>${t(v().name(konto))}</strong>
            <span>${t(konto.authEmail || konto.email || konto.id)}</span>
            ${eltern ? `<span>Kind von ${t(v().name(eltern))}</span>` : ""}
          </span>
          <span class="admin-marken">
            <span class="admin-marke rolle-${rolle}">${t(ROLLEN_TEXT[rolle])}</span>
            <span class="admin-marke kauf-${kauf}">${t(KAUF_TEXT[kauf])}</span>
          </span>
          <span class="admin-entry-zuletzt">
            <b>Zuletzt</b>
            ${gesehen ? t(v().datum(gesehen)) : "nie"}
          </span>
          ${gruppe ? `<span class="admin-entry-group${gruppe.by === "admin" ? " ist-admin" : ""}">${t(gruppe.name)}</span>` : ""}
          ${v().zugStreifen(konto)}
          <span class="admin-user-summary" aria-label="Kurzfassung">
            <span><b>Gelöst</b>${summary.totalSolved}</span>
            <span><b>Spielzeit</b>${t(v().dauer(summary.totalSeconds))}</span>
            <span><b>Sessions</b>${summary.sessions}</span>
          </span>
        </button>
        ${offen ? `<div class="admin-entry-body">${koerper}</div>` : ""}
      </article>
    `;
  }

  function kontoDetail(konto, detail) {
    if (!detail) return `<p class="account-muted">Details konnten nicht geladen werden.</p>`;
    if (detail.error) return `<p class="auth-status">${t(api().fehlerText(detail.error))}</p>`;
    const userData = { ...konto, ...detail.userData };
    const fehler = zustand.kontoFehler.id === konto.id ? zustand.kontoFehler.text : "";

    return `
      <div class="admin-meta">
        <span>${t(userData.authEmail || userData.email || konto.id)}</span>
        <span>Kennung: ${t(konto.id)}</span>
        <span>Erstellt: ${t(v().datum(userData.createdAt || userData.createdAtMs))}</span>
        <span>Zuletzt gesehen: ${t(v().datum(userData.lastSeenAt))}</span>
      </div>
      ${fehler ? `<p class="auth-status">${t(fehler)}</p>` : ""}
      ${kaufBlock(konto)}
      ${gruppenBlock(konto, userData)}
      ${stufeBlock(konto, userData)}
      ${resetBlock(konto)}
      ${v().kontoDetail({ ...detail, userData }, { selectedGame: zustand.spielFilter, withFilters: true })}
    `;
  }

  // --- Freischalten ----------------------------------------------------------
  // Der Knopf, den es sonst nirgends gibt: ein Konto freischalten, ohne dass
  // jemand zahlt. Geschrieben wird der Eintrag vom Server (/api/freischalten) –
  // entitlements/{uid} darf kein Client schreiben, auch der Admin nicht, sonst
  // wäre die Schranke nur so gut wie irgendein Passwort.
  //
  // Es trifft immer die ganze Familie, wie ein Kauf: Ein freigeschaltetes Kind
  // neben gesperrten Geschwistern wäre kein Geschenk, sondern ein Rätsel.
  function kaufBlock(konto) {
    const kauf = kaufVon(konto);
    const eintrag = zustand.kaeufe.get(konto.id);
    const laeuft = zustand.laeuft === konto.id;
    const frage = zustand.frage?.uid === konto.id ? zustand.frage.art : null;

    if (kauf === "bezahlt") {
      return `
        <div class="admin-reset admin-kauf">
          <div>
            <strong>Bezahlt</strong>
            <span>Gekauft ${t(v().datum(eintrag?.grantedAtMs))}${eintrag?.via ? " über das Elternkonto" : ""}. Zurückerstattet wird bei Stripe, nicht hier.</span>
          </div>
        </div>`;
    }

    if (kauf === "geschenk") {
      if (frage === "gratis-weg") {
        return `
          <div class="admin-reset admin-kauf is-confirming">
            <div>
              <strong>Freischaltung von ${t(v().name(konto))} zurücknehmen?</strong>
              <span>Die ganze Familie ist danach wieder auf dem Gratis-Stand: die erste Karte der Reise und eine Runde je Spiel. Der Fortschritt bleibt, er ist nur nicht mehr überall erreichbar.</span>
            </div>
            <div class="card-actions">
              <button type="button" class="secondary-action" data-frage-ab>Abbrechen</button>
              <button type="button" class="danger-action" data-gratis-weg="${t(konto.id)}">Ja, zurücknehmen</button>
            </div>
          </div>`;
      }
      return `
        <div class="admin-reset admin-kauf">
          <div>
            <strong>Freigeschaltet</strong>
            <span>Von Hand freigeschaltet am ${t(v().datum(eintrag?.grantedAtMs))} – ohne Zahlung. Gilt für die ganze Familie.</span>
          </div>
          <button type="button" class="secondary-action" data-gratis-frage="${t(konto.id)}" ${laeuft ? "disabled" : ""}>Freischaltung zurücknehmen</button>
        </div>`;
    }

    if (kauf === "gruender") {
      return `
        <div class="admin-reset admin-kauf">
          <div>
            <strong>Gründer-Zugang</strong>
            <span>Dieses Konto war vor dem Kauf dabei – es ist ohnehin frei und bleibt es.</span>
          </div>
        </div>`;
    }

    return `
      <div class="admin-reset admin-kauf">
        <div>
          <strong>${kauf === "zurueck" ? "Kauf zurückerstattet" : "Nicht freigeschaltet"}</strong>
          <span>Freischalten kostet dieses Konto nichts. Es gilt für die ganze Familie: das Elternkonto und alle Kinder.</span>
        </div>
        <button type="button" data-gratis-an="${t(konto.id)}" ${laeuft ? "disabled" : ""}>${laeuft ? "Läuft..." : "Gratis freischalten"}</button>
      </div>`;
  }

  // --- Gruppe eines Kontos ---------------------------------------------------
  function gruppenBlock(konto, userData) {
    const gruppe = v().gruppe(userData.group);
    const namen = bekannteGruppen();
    return `
      <div class="admin-group" data-gruppe-konto="${t(konto.id)}">
        <div>
          <strong>Gruppe${gruppe ? `: ${t(gruppe.name)}` : ""}</strong>
          <span>Konten derselben Gruppe sehen die Züge der anderen oben auf dem Startbild.${gruppe?.by === "familie" ? " Diese hier kommt von der Familie – der Server setzt sie von selbst." : ""}</span>
        </div>
        <div class="admin-group-fields">
          <label>
            <span>Gruppe</span>
            <input type="text" data-gruppe-name list="admin-gruppen-namen" placeholder="z. B. Familie" value="${t(gruppe?.name || "")}" />
          </label>
          <label>
            <span>Name des Zugs</span>
            <input type="text" data-gruppe-anzeige placeholder="${t(v().name(userData))}" value="${t(gruppe?.displayName || "")}" />
          </label>
        </div>
        <datalist id="admin-gruppen-namen">${namen.map((name) => `<option value="${t(name)}"></option>`).join("")}</datalist>
        <div class="card-actions">
          ${gruppe ? `<button type="button" class="secondary-action" data-gruppe-raus>Aus der Gruppe nehmen</button>` : ""}
          <button type="button" data-gruppe-speichern>Gruppe speichern</button>
        </div>
      </div>`;
  }

  function bekannteGruppen() {
    const namen = new Map();
    zustand.konten.forEach((konto) => {
      const gruppe = v().gruppe(konto.group);
      if (gruppe) namen.set(gruppe.id, gruppe.name);
    });
    return [...namen.values()].sort((a, b) => a.localeCompare(b, "de"));
  }

  // --- Schwierigkeitsstufe ----------------------------------------------------
  // Dieselbe Einstellung, die Eltern an ihren Kindern setzen (firebase.js,
  // renderKindStufe) – hier für jedes Konto.
  function stufeBlock(konto, userData) {
    const reise = window.LernappReise;
    if (!reise) return "";
    const kasten = (userData.gameState || {})[reise.KEY]?.data;
    const fahrt = reise.progressFor(kasten);
    const laeuft = zustand.laeuft === konto.id;
    const knopf = (wert) => `<button type="button" class="${fahrt.stufe === wert ? "" : "secondary-action"}" data-stufe="${wert}" ${laeuft ? "disabled" : ""} aria-pressed="${fahrt.stufe === wert}">${t(reise.STUFE_INFO[wert].label)} (${t(reise.STUFE_INFO[wert].alter)})${fahrt.stufe === wert ? " ✓" : ""}</button>`;
    return `
      <div class="admin-reset admin-stufe" data-stufe-konto="${t(konto.id)}">
        <div>
          <strong>Schwierigkeitsstufe</strong>
          <span>«Leicht» (3 bis 5 Jahre) verlangt auf der Reise weniger und zeigt die kleinsten Rätsel; «Mittel» (5 bis 7) ist die Reise, wie sie ist; «Schwer» (7 bis 10) gibt den Stempel nur mit drei Sternen oder der ganzen Punktzahl. Die Stufe stellt auch Buchstaben-Jagd, Wortdetektiv, Rucksack, Memory, Weichen-Wirrwarr und Freie Fahrt ein.</span>
        </div>
        <div class="card-actions">${reise.STUFEN.map(knopf).join("")}</div>
      </div>`;
  }

  // --- Zurücksetzen ----------------------------------------------------------
  function resetBlock(konto) {
    const frage = zustand.frage?.uid === konto.id ? zustand.frage.art : null;
    if (zustand.laeuft === konto.id) {
      return `<div class="admin-reset"><p class="account-muted">Läuft...</p></div>`;
    }
    if (frage === "reset") {
      return `
        <div class="admin-reset is-confirming">
          <div>
            <strong>Wirklich allen Fortschritt von ${t(v().name(konto))} zurücksetzen?</strong>
            <span>Gelöste Level, Sitzungen und Spielstände werden gelöscht. Der Zug fängt wieder von vorn an: alle Wagen starten bei 0, auch auf den Geräten des Kindes. Das lässt sich nicht rückgängig machen.</span>
          </div>
          <div class="card-actions">
            <button type="button" class="secondary-action" data-frage-ab>Abbrechen</button>
            <button type="button" class="danger-action" data-reset-ja="${t(konto.id)}">Ja, alles zurücksetzen</button>
          </div>
        </div>`;
    }
    return `
      <div class="admin-reset">
        <div>
          <strong>Fortschritt</strong>
          <span>${konto.id === cloud()?.getUser?.()?.uid ? "Das ist dein eigenes Konto." : "Zug und Wagen dieses Kontos wieder auf 0 stellen"}</span>
        </div>
        <button type="button" class="danger-action" data-reset-frage="${t(konto.id)}">Fortschritt zurücksetzen</button>
      </div>`;
  }

  function bindeUser() {
    const suche = seite.querySelector("[data-suche]");
    if (suche) {
      suche.addEventListener("input", () => {
        zustand.suche = suche.value;
        zeichne();
        const wieder = seite.querySelector("[data-suche]");
        wieder?.focus();
        wieder?.setSelectionRange(wieder.value.length, wieder.value.length);
      });
    }
    seite.querySelectorAll("[data-kauf-filter]").forEach((knopf) => {
      knopf.addEventListener("click", () => { zustand.kaufFilter = knopf.dataset.kaufFilter; zeichne(); });
    });
    seite.querySelectorAll("[data-rolle-filter]").forEach((knopf) => {
      knopf.addEventListener("click", () => { zustand.rolleFilter = knopf.dataset.rolleFilter; zeichne(); });
    });
    seite.querySelectorAll("[data-sortierung]").forEach((knopf) => {
      knopf.addEventListener("click", () => {
        const id = knopf.dataset.sortierung;
        // Noch einmal dieselbe Spalte: andersherum. Das ist die Geste, die
        // jede Tabelle kennt, und sie erspart einen zweiten Knopf.
        if (zustand.sortierung === id) zustand.absteigend = !zustand.absteigend;
        else { zustand.sortierung = id; zustand.absteigend = true; }
        zeichne();
      });
    });
    seite.querySelectorAll("[data-konto]").forEach((knopf) => {
      knopf.addEventListener("click", () => kontoAufklappen(knopf.dataset.konto));
    });
    seite.querySelectorAll("[data-admin-game]").forEach((knopf) => {
      knopf.addEventListener("click", () => { zustand.spielFilter = knopf.dataset.adminGame || "all"; zeichne(); });
    });

    seite.querySelectorAll("[data-frage-ab]").forEach((knopf) => {
      knopf.addEventListener("click", () => { zustand.frage = null; zeichne(); });
    });
    seite.querySelector("[data-reset-frage]")?.addEventListener("click", (e) => {
      zustand.frage = { art: "reset", uid: e.currentTarget.dataset.resetFrage };
      zustand.kontoFehler = { id: null, text: "" };
      zeichne();
    });
    seite.querySelector("[data-reset-ja]")?.addEventListener("click", (e) => zuruecksetzen(e.currentTarget.dataset.resetJa));
    seite.querySelector("[data-gratis-an]")?.addEventListener("click", (e) => freischalten(e.currentTarget.dataset.gratisAn, true));
    seite.querySelector("[data-gratis-frage]")?.addEventListener("click", (e) => {
      zustand.frage = { art: "gratis-weg", uid: e.currentTarget.dataset.gratisFrage };
      zeichne();
    });
    seite.querySelector("[data-gratis-weg]")?.addEventListener("click", (e) => freischalten(e.currentTarget.dataset.gratisWeg, false));

    const gruppe = seite.querySelector("[data-gruppe-konto]");
    if (gruppe) {
      const uid = gruppe.dataset.gruppeKonto;
      gruppe.querySelector("[data-gruppe-speichern]")?.addEventListener("click", () => gruppeSetzen(uid, {
        name: gruppe.querySelector("[data-gruppe-name]")?.value || "",
        displayName: gruppe.querySelector("[data-gruppe-anzeige]")?.value || "",
      }));
      gruppe.querySelector("[data-gruppe-raus]")?.addEventListener("click", () => gruppeSetzen(uid, { name: "", displayName: "" }));
    }

    const stufe = seite.querySelector("[data-stufe-konto]");
    stufe?.querySelectorAll("[data-stufe]").forEach((knopf) => {
      knopf.addEventListener("click", () => stufeSetzen(stufe.dataset.stufeKonto, knopf.dataset.stufe));
    });
  }

  async function kontoAufklappen(uid) {
    zustand.frage = null;
    zustand.kontoFehler = { id: null, text: "" };
    if (zustand.offenesKonto === uid) {
      zustand.offenesKonto = null;
      zeichne();
      return;
    }
    zustand.offenesKonto = uid;
    zustand.spielFilter = "all";
    if (!zustand.details.has(uid)) {
      zustand.laeuft = uid;
      zeichne();
      try { zustand.details.set(uid, await api().ladeKontoDetails(uid)); }
      catch (fehler) { zustand.details.set(uid, { id: uid, error: fehler }); }
      zustand.laeuft = null;
    }
    zeichne();
  }

  // Jede dieser Aktionen ändert etwas, das in der Liste steht – die Zahlen,
  // die Gruppe, den Kaufstand. Deshalb wird danach nicht nachgebessert,
  // sondern neu geladen: Nachbessern hiesse, dieselbe Zusammenfassung ein
  // zweites Mal zu bauen, und die zweite wäre irgendwann die falsche.
  async function mitLaufen(uid, tun) {
    zustand.laeuft = uid;
    zustand.frage = null;
    zustand.kontoFehler = { id: null, text: "" };
    zeichne();
    let fehlerText = "";
    try { await tun(); }
    catch (fehler) { fehlerText = api().serverFehlerText(fehler); }
    zustand.laeuft = null;
    zustand.kontoFehler = fehlerText ? { id: uid, text: fehlerText } : { id: null, text: "" };
    zustand.details.delete(uid);
    await lade({ neu: true });
    if (zustand.offenesKonto === uid) {
      try { zustand.details.set(uid, await api().ladeKontoDetails(uid)); }
      catch (fehler) { zustand.details.set(uid, { id: uid, error: fehler }); }
      zeichne();
    }
  }

  const zuruecksetzen = (uid) => mitLaufen(uid, () => api().resetProgress(uid));
  const freischalten = (uid, frei) => mitLaufen(uid, () => api().freischalten(uid, frei));
  const stufeSetzen = (uid, stufe) => mitLaufen(uid, () => api().setJourneyStufe(uid, stufe));
  const gruppeSetzen = (uid, werte) => mitLaufen(uid, () => api().setUserGroup(uid, werte));

  // ---------------------------------------------------------------------------
  // Sicht: Gäste
  // ---------------------------------------------------------------------------
  function gaesteSicht() {
    if (!zustand.gaeste.length) return `<p class="account-muted">Noch keine Gäste gefunden.</p>`;
    return `
      <p class="account-muted admin-note">Gäste spielen ohne Konto. Ihr Stand liegt auf ihrem Gerät; was hier steht, ist die Kopie in der Cloud – zurücksetzen lässt sich das von hier aus deshalb nicht.</p>
      <div class="admin-accordion" aria-label="Gäste">
        ${zustand.gaeste.map(gastZeile).join("")}
      </div>`;
  }

  function gastZeile(gast) {
    const offen = zustand.offenerGast === gast.id;
    const detail = zustand.gastDetails.get(gast.id);
    const summary = gast.adminSummary || v().zusammenfassung(gast, gast.levelDocs || []);
    const gesehen = v().zuletzt(gast);
    return `
      <article class="admin-entry${offen ? " is-open" : ""}">
        <button type="button" class="admin-entry-head" data-gast="${t(gast.id)}" aria-expanded="${offen}">
          <span class="admin-entry-caret" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="admin-entry-name">
            <strong>${t(v().name(gast))}</strong>
            <span>${t(gast.id)}</span>
          </span>
          <span class="admin-entry-zuletzt"><b>Zuletzt</b>${gesehen ? t(v().datum(gesehen)) : "nie"}</span>
          ${v().zugStreifen(gast)}
          <span class="admin-user-summary" aria-label="Kurzfassung">
            <span><b>Gelöst</b>${summary.totalSolved}</span>
            <span><b>Spielzeit</b>${t(v().dauer(summary.totalSeconds))}</span>
            <span><b>Sessions</b>${summary.sessions}</span>
          </span>
        </button>
        ${offen ? `<div class="admin-entry-body">${detail
          ? v().kontoDetail(detail, { selectedGame: zustand.spielFilter, withFilters: true })
          : `<p class="account-muted">Details werden geladen...</p>`}</div>` : ""}
      </article>`;
  }

  function bindeGaeste() {
    seite.querySelectorAll("[data-gast]").forEach((knopf) => {
      knopf.addEventListener("click", () => gastAufklappen(knopf.dataset.gast));
    });
    seite.querySelectorAll("[data-admin-game]").forEach((knopf) => {
      knopf.addEventListener("click", () => { zustand.spielFilter = knopf.dataset.adminGame || "all"; zeichne(); });
    });
  }

  async function gastAufklappen(id) {
    if (zustand.offenerGast === id) {
      zustand.offenerGast = null;
      zeichne();
      return;
    }
    zustand.offenerGast = id;
    zustand.spielFilter = "all";
    if (!zustand.gastDetails.has(id)) {
      zeichne();
      try { zustand.gastDetails.set(id, await api().ladeGastDetails(id)); }
      catch (fehler) { zustand.gastDetails.set(id, { id, error: fehler }); }
    }
    zeichne();
  }

  // ---------------------------------------------------------------------------
  // Sicht: Spiele
  // ---------------------------------------------------------------------------
  // Nicht "was hat dieses Kind gemacht", sondern "was ist mit diesem Spiel
  // los". Gerechnet über alle Konten und alle Gäste, mit derselben Datei, die
  // auch die Bestenliste der Gruppe rechnet (highscore.js) – ein Bestwert hier
  // und einer beim Kind, die auseinanderlaufen, wären schlimmer als keiner.
  function spieleSicht() {
    const hs = window.LernappHighscore;
    if (!hs) return `<p class="account-muted">Die Spiel-Auswertung ist gerade nicht zu haben.</p>`;

    const konten = [...zustand.konten, ...zustand.gaeste].map((eintrag) => ({
      id: eintrag.id,
      name: v().name(eintrag),
      gameState: eintrag.gameState || {},
      levels: eintrag.levelDocs || [],
    }));

    const alle = hs.alleAuswertungen(konten);
    const bereich = zustand.spieleBereich;
    const gezeigt = (bereich === "all" ? alle : alle.filter((e) => e.bereich === bereich))
      .sort((a, b) => (b.gespielt - a.gespielt) || a.titel.localeCompare(b.titel, "de"));

    const gespielt = alle.reduce((summe, e) => summe + e.gespielt, 0);
    const fertig = alle.reduce((summe, e) => summe + e.abgeschlossen, 0);
    const angefasst = alle.filter((e) => e.gespielt > 0).length;

    return `
      <div class="stat-strip admin-stat-strip">
        <div><strong>${konten.length}</strong><span>Konten &amp; Gäste</span></div>
        <div><strong>${gespielt}</strong><span>gespielt</span></div>
        <div><strong>${fertig}</strong><span>abgeschlossen</span></div>
        <div><strong>${angefasst}/${alle.length}</strong><span>Spiele benutzt</span></div>
      </div>
      <div class="admin-game-filter" aria-label="Bereich filtern">
        <button type="button" class="${bereich === "all" ? "active" : ""}" data-bereich="all">Alle Bereiche</button>
        ${Object.entries(hs.BEREICHE).map(([id, label]) => `
          <button type="button" class="${bereich === id ? "active" : ""}" data-bereich="${t(id)}">${t(label)}</button>`).join("")}
      </div>
      <div class="admin-game-grid">
        ${gezeigt.map((eintrag) => spielKarte(eintrag, hs)).join("")}
      </div>
      <p class="account-muted admin-note">
        Neustarts zählt nur, wer seinen Fortschritt Level für Level in der Cloud ablegt –
        die Rätsel aus dem Levelkatalog. Die Spiele mit eigenem Konto führen nur ihre
        Runden und ihre Bestenliste; dort steht ein Strich statt einer Null.
      </p>`;
  }

  function spielKarte(eintrag, hs) {
    const zahlen = [
      ["Gespielt", eintrag.gespielt],
      ["Abgeschlossen", eintrag.abgeschlossen],
      ["Neu gestartet", eintrag.neugestartet],
      ["Spieler", eintrag.spieler],
    ];
    return `
      <article class="admin-game-card${eintrag.gespielt ? "" : " is-quiet"}">
        <header>
          <strong>${t(eintrag.titel)}</strong>
          <span>${t(hs.BEREICHE[eintrag.bereich] || "")}</span>
        </header>
        <div class="admin-data-grid">
          ${zahlen.map(([label, wert]) => `<span><b>${t(label)}</b>${wert === null ? "–" : t(wert)}</span>`).join("")}
        </div>
        <p class="admin-game-best">
          ${eintrag.bestwert
            ? `<b>Bestwert</b> ${t(eintrag.bestwert)} <em>${t(eintrag.bestwertVon)}</em>`
            : "<b>Bestwert</b> noch keiner"}
        </p>
        ${eintrag.zeit ? `<small>Spielzeit zusammen: ${t(v().dauer(eintrag.zeit))}</small>` : ""}
      </article>`;
  }

  function bindeSpiele() {
    seite.querySelectorAll("[data-bereich]").forEach((knopf) => {
      knopf.addEventListener("click", () => { zustand.spieleBereich = knopf.dataset.bereich; zeichne(); });
    });
  }

  // ---------------------------------------------------------------------------
  // Sicht: Wagen
  // ---------------------------------------------------------------------------
  // Das Set für alle. Familien dürfen davon abweichen – ein Elternkonto setzt
  // im Profilfenster das Set seiner Familie, und dann steht es am Konto statt
  // in config/train. Deshalb steht hier auch, welche Familien abweichen: Sonst
  // hiesse "Aktiv" etwas anderes, als es aussieht.
  function wagenSicht() {
    const train = window.LernappTrain;
    if (!train?.SETS) return `<p class="account-muted">Der Zug ist auf dieser Seite nicht geladen.</p>`;

    const aktuell = cloud().getWagonSet();
    const aktivId = train.SET_BY_ID[aktuell.id] ? aktuell.id : train.SETS[0].id;
    const eigene = zustand.konten.filter((konto) => konto.wagonSet?.id);

    return `
      <div class="admin-sets">
        <p class="account-muted">Welche Wagen der Zug hat und wie schnell sie wachsen – für alle Konten und Gäste zugleich. Ein Wechsel setzt alle Wagen auf 0, auch auf den Geräten der Kinder. Lok, Landschaft, Namen und Gruppen bleiben.</p>
        ${train.SETS.map((set) => setKarte(set, set.id === aktivId, aktuell)).join("")}
        ${zustand.setLaeuft ? `<p class="auth-status" role="status" aria-live="polite">${t(zustand.setLaeuft)}</p>` : ""}
        ${zustand.setFehler ? `<p class="auth-status">${t(zustand.setFehler)}</p>` : ""}
        ${zustand.setFertig ? `<p class="auth-status admin-set-done" role="status">${t(zustand.setFertig)}</p>` : ""}
        <section class="admin-eigene-sets">
          <h3>Familien mit eigener Wahl</h3>
          ${eigene.length
            ? `<div class="admin-data-grid">${eigene.map((konto) => `<span><b>${t(v().name(konto))}</b>${t(train.SET_BY_ID[konto.wagonSet.id]?.label || konto.wagonSet.id)}</span>`).join("")}</div>
               <p class="account-muted">Ihre Wahl gilt vor dem Set oben. Stellst du hier um, fällt sie weg: Danach fahren wieder alle dasselbe.</p>`
            : `<p class="account-muted">Keine. Alle Konten folgen dem Set für alle.</p>`}
        </section>
      </div>`;
  }

  function setKarte(set, aktiv, aktuell) {
    const gesamt = set.stepAt[set.stepAt.length - 1];
    const tempo = `Ein Schritt nach ${set.stepAt.join(", ")} Runden je Spiel – ${gesamt} je Spiel, ${gesamt * 4} je Wagen.`;
    const seit = aktiv && aktuell.switchedAtMs ? ` seit ${v().datum(aktuell.switchedAtMs)}` : "";
    const frage = zustand.setFrage === set.id;
    const laeuft = Boolean(zustand.setLaeuft);

    let aktionen = "";
    if (aktiv) {
      aktionen = `<span class="admin-set-active">Aktiv${t(seit)}</span>`;
    } else if (frage) {
      aktionen = `
        <div class="admin-set-confirm">
          <strong>Wirklich auf «${t(set.label)}» wechseln?</strong>
          <span>Alle Wagen aller Konten starten bei 0: gelöste Level, Runden und Spielstände werden gelöscht – auch auf den Geräten der Kinder, sobald sie die App öffnen. Familien, die eigene Wagen gewählt haben, verlieren diese Wahl und fahren wieder mit. Lok, Landschaft, Namen und Gruppen bleiben. Das lässt sich nicht rückgängig machen.</span>
          <div class="card-actions">
            <button type="button" class="secondary-action" data-set-ab>Abbrechen</button>
            <button type="button" class="danger-action" data-set-ja="${t(set.id)}">Ja, wechseln und alle Wagen zurücksetzen</button>
          </div>
        </div>`;
    } else {
      aktionen = `<button type="button" data-set-frage="${t(set.id)}" ${laeuft ? "disabled" : ""}>Auf dieses Set wechseln</button>`;
    }

    return `
      <article class="admin-set${aktiv ? " is-active" : ""}${frage ? " is-confirming" : ""}">
        <header>
          <div>
            <strong>Set ${t(set.id)}: ${t(set.label)}</strong>
            <span>${t(tempo)}</span>
          </div>
        </header>
        <div class="admin-set-preview" data-set-vorschau="${t(set.id)}"></div>
        <div class="admin-set-actions">${aktionen}</div>
      </article>`;
  }

  function bindeWagen() {
    // Die Vorschau: der ganze Zug mit den fünf fertigen Wagen des Sets.
    const art = window.LernappTrainArt;
    const train = window.LernappTrain;
    if (art?.buildTrain && train?.SET_BY_ID) {
      seite.querySelectorAll("[data-set-vorschau]").forEach((wirt) => {
        const set = train.SET_BY_ID[wirt.dataset.setVorschau];
        if (!set) return;
        const areas = train.AREAS.map((area) => ({ id: area.id, color: area.color, wagon: set.wagons[area.id], stage: art.WAGON_STAGES }));
        const svg = art.buildTrain(areas, cloud().getTrainSettings?.()?.loco || {}, { withTrack: true });
        svg.setAttribute("aria-hidden", "true");
        svg.removeAttribute("role");
        wirt.append(svg);
      });
    }

    seite.querySelectorAll("[data-set-frage]").forEach((knopf) => {
      knopf.addEventListener("click", () => {
        zustand.setFrage = knopf.dataset.setFrage;
        zustand.setFehler = "";
        zustand.setFertig = "";
        zeichne();
      });
    });
    seite.querySelector("[data-set-ab]")?.addEventListener("click", () => { zustand.setFrage = null; zeichne(); });
    seite.querySelector("[data-set-ja]")?.addEventListener("click", (e) => setUmstellen(e.currentTarget.dataset.setJa));
  }

  async function setUmstellen(setId) {
    if (!setId || zustand.setLaeuft) return;
    const train = window.LernappTrain;
    const label = train?.SET_BY_ID?.[setId]?.label || `Set ${setId}`;
    zustand.setFrage = null;
    zustand.setFehler = "";
    zustand.setFertig = "";
    zustand.setLaeuft = "Die Konten werden zurückgesetzt...";
    zeichne();
    try {
      const ergebnis = await api().switchWagonSet(setId, {
        onProgress: (fertig, gesamt) => {
          zustand.setLaeuft = `Konto ${fertig} von ${gesamt} zurückgesetzt...`;
          zeichne();
        },
      });
      zustand.setFertig = `Umgestellt auf «${label}». ${ergebnis.accounts} Konten zurückgesetzt${ergebnis.eigeneWahl ? `, davon ${ergebnis.eigeneWahl} mit eigener Wahl, die nun wieder mitfahren` : ""}; Gäste ohne Konto stellen beim nächsten Öffnen der App um.`;
    } catch (fehler) {
      zustand.setFehler = api().fehlerText(fehler);
    }
    zustand.setLaeuft = "";
    await lade({ neu: true });
  }

  // ---------------------------------------------------------------------------
  // Sicht: Gruppen
  // ---------------------------------------------------------------------------
  // Eine Gruppe ist kein Dokument, sondern ein Feld am Konto (group.id). Wer
  // dieselbe id trägt, sieht die Züge der anderen auf dem Startbild.
  //
  // Familien bekommen ihre Gruppe vom Server – eine Familie ist von selbst
  // eine. Was es ohne diese Sicht nicht gibt, ist die ÜBERGREIFENDE Gruppe:
  // zwei Familien, eine Klasse, Grosseltern dazu. Die entsteht hier, und nur
  // hier: firestore.rules lässt group niemanden schreiben ausser dem Admin.
  //
  // Der Editor arbeitet mit Häkchen statt mit einem Feld je Konto: Eine Gruppe
  // ist eine Menge von Konten, und eine Menge hakt man an.
  function gruppenSicht() {
    const gruppen = new Map();
    zustand.konten.forEach((konto) => {
      const gruppe = v().gruppe(konto.group);
      if (!gruppe) return;
      if (!gruppen.has(gruppe.id)) gruppen.set(gruppe.id, { ...gruppe, mitglieder: [] });
      gruppen.get(gruppe.id).mitglieder.push(konto);
    });
    const liste = [...gruppen.values()].sort((a, b) => a.name.localeCompare(b.name, "de"));
    const ohne = zustand.konten.filter((konto) => !v().gruppe(konto.group));

    return `
      <p class="account-muted admin-note">
        Konten derselben Gruppe sehen die Züge der anderen auf dem Startbild. Familien sind von selbst
        eine Gruppe – das macht der Server beim Anlegen eines Kindes. Übergreifende Gruppen gibt es nur hier:
        Weder ein Kind noch ein Elternkonto darf Gruppen setzen.
      </p>
      ${zustand.gruppeLaeuft ? `<p class="auth-status" role="status" aria-live="polite">${t(zustand.gruppeLaeuft)}</p>` : ""}
      ${zustand.gruppeFehler ? `<p class="auth-status">${t(zustand.gruppeFehler)}</p>` : ""}
      ${zustand.gruppeFertig ? `<p class="auth-status is-ok" role="status">${t(zustand.gruppeFertig)}</p>` : ""}
      ${zustand.gruppeBearbeiten ? gruppenEditor() : `
        <div class="card-actions admin-gruppen-kopf">
          <button type="button" data-gruppe-neu>Neue Gruppe anlegen</button>
        </div>
        <div class="admin-gruppen">
          ${liste.length ? liste.map(gruppenKarte).join("") : `<p class="account-muted">Noch keine Gruppe.</p>`}
          ${ohne.length ? `
            <article class="admin-gruppe ist-leer">
              <header><strong>Ohne Gruppe</strong><span>${ohne.length} Konten</span></header>
              <ul>${ohne.map((konto) => `<li>${t(v().name(konto))} <small>${t(ROLLEN_TEXT[rolleVon(konto)])}</small></li>`).join("")}</ul>
            </article>` : ""}
        </div>`}
    `;
  }

  function gruppenKarte(gruppe) {
    return `
      <article class="admin-gruppe${gruppe.by === "admin" ? " ist-admin" : ""}">
        <header>
          <strong>${t(gruppe.name)}</strong>
          <span>${gruppe.mitglieder.length} Konten · ${gruppe.by === "admin" ? "von Hand" : "Familie"}</span>
        </header>
        <ul>
          ${gruppe.mitglieder.map((konto) => `<li>${t(v().name(konto))} <small>${t(ROLLEN_TEXT[rolleVon(konto)])}</small></li>`).join("")}
        </ul>
        <div class="card-actions">
          <button type="button" class="secondary-action" data-gruppe-auf="${t(gruppe.id)}">Mitglieder ändern</button>
        </div>
      </article>`;
  }

  function gruppenEditor() {
    const editor = zustand.gruppeBearbeiten;
    // Nach Familie gebündelt: Wer zwei Familien zusammenlegen will, hakt zwei
    // Blöcke an und nicht acht einzelne Zeilen, die er erst suchen muss.
    const familien = new Map();
    zustand.konten.forEach((konto) => {
      const kopf = (typeof konto.parentUid === "string" && konto.parentUid) ? konto.parentUid : konto.id;
      if (!familien.has(kopf)) familien.set(kopf, []);
      familien.get(kopf).push(konto);
    });

    const bloecke = [...familien.entries()].map(([kopfId, mitglieder]) => {
      const kopf = zustand.konten.find((k) => k.id === kopfId);
      const titel = kopf ? v().name(kopf) : "Ohne Elternkonto";
      const alleDrin = mitglieder.every((konto) => editor.mitglieder.has(konto.id));
      return `
        <fieldset class="admin-familie">
          <legend>
            <label><input type="checkbox" data-familie="${t(kopfId)}" ${alleDrin ? "checked" : ""} /> ${t(titel)}</label>
          </legend>
          ${mitglieder.sort((a, b) => v().name(a).localeCompare(v().name(b), "de")).map((konto) => {
            const gruppe = v().gruppe(konto.group);
            const woanders = gruppe && gruppe.id !== editor.id;
            return `
              <label class="admin-mitglied">
                <input type="checkbox" data-mitglied="${t(konto.id)}" ${editor.mitglieder.has(konto.id) ? "checked" : ""} />
                <span>${t(v().name(konto))} <small>${t(ROLLEN_TEXT[rolleVon(konto)])}</small></span>
                ${woanders ? `<em>jetzt in «${t(gruppe.name)}»</em>` : ""}
              </label>`;
          }).join("")}
        </fieldset>`;
    });

    return `
      <section class="admin-gruppe-editor">
        <h3>${editor.id ? "Gruppe ändern" : "Neue Gruppe"}</h3>
        <label class="admin-gruppe-name">
          <span>Name der Gruppe</span>
          <input type="text" data-editor-name value="${t(editor.name)}" placeholder="z. B. Nachbarschaft" />
        </label>
        <p class="account-muted">Angehakte Konten kommen in diese Gruppe. Entfernte Häkchen nehmen ein Konto heraus – gehört es zu einer Familie, bekommt es beim nächsten Anmelden seine Familiengruppe zurück.</p>
        <div class="admin-familien">${bloecke.join("")}</div>
        <div class="card-actions">
          <button type="button" class="secondary-action" data-editor-ab>Abbrechen</button>
          <button type="button" data-editor-speichern>${editor.mitglieder.size} Konten speichern</button>
        </div>
      </section>`;
  }

  function bindeGruppen() {
    seite.querySelector("[data-gruppe-neu]")?.addEventListener("click", () => {
      zustand.gruppeBearbeiten = { id: "", name: "", mitglieder: new Set() };
      zustand.gruppeFertig = "";
      zeichne();
    });
    seite.querySelectorAll("[data-gruppe-auf]").forEach((knopf) => {
      knopf.addEventListener("click", () => {
        const id = knopf.dataset.gruppeAuf;
        const mitglieder = new Set(zustand.konten.filter((k) => v().gruppe(k.group)?.id === id).map((k) => k.id));
        const name = zustand.konten.map((k) => v().gruppe(k.group)).find((g) => g?.id === id)?.name || "";
        zustand.gruppeBearbeiten = { id, name, mitglieder };
        zustand.gruppeFertig = "";
        zeichne();
      });
    });

    const editor = zustand.gruppeBearbeiten;
    if (!editor) return;

    seite.querySelector("[data-editor-name]")?.addEventListener("input", (e) => { editor.name = e.currentTarget.value; });
    seite.querySelectorAll("[data-mitglied]").forEach((kasten) => {
      kasten.addEventListener("change", () => {
        if (kasten.checked) editor.mitglieder.add(kasten.dataset.mitglied);
        else editor.mitglieder.delete(kasten.dataset.mitglied);
        zeichne();
      });
    });
    seite.querySelectorAll("[data-familie]").forEach((kasten) => {
      kasten.addEventListener("change", () => {
        const kopfId = kasten.dataset.familie;
        zustand.konten
          .filter((konto) => ((typeof konto.parentUid === "string" && konto.parentUid) ? konto.parentUid : konto.id) === kopfId)
          .forEach((konto) => { if (kasten.checked) editor.mitglieder.add(konto.id); else editor.mitglieder.delete(konto.id); });
        zeichne();
      });
    });
    seite.querySelector("[data-editor-ab]")?.addEventListener("click", () => {
      zustand.gruppeBearbeiten = null;
      zeichne();
    });
    seite.querySelector("[data-editor-speichern]")?.addEventListener("click", () => gruppeSpeichern());
  }

  // Gespeichert wird Konto für Konto: setUserGroup schreibt genau ein Feld an
  // genau ein Dokument, und die Regel lässt genau das durch. Ein Stapel wäre
  // schneller, aber er müsste dieselbe Regel für jedes Dokument einzeln
  // bestehen – gewonnen wäre nichts als eine unübersichtliche Fehlermeldung.
  async function gruppeSpeichern() {
    const editor = zustand.gruppeBearbeiten;
    if (!editor) return;
    const name = String(editor.name || "").trim();
    if (!name) {
      zustand.gruppeFehler = "Die Gruppe braucht einen Namen.";
      zeichne();
      return;
    }

    // Wer jetzt drin ist, aber nicht mehr angehakt: heraus. Nur aus DIESER
    // Gruppe – ein Konto einer anderen Gruppe bleibt, wo es ist.
    const vorher = editor.id
      ? zustand.konten.filter((k) => v().gruppe(k.group)?.id === editor.id).map((k) => k.id)
      : [];
    const hinzu = [...editor.mitglieder];
    const weg = vorher.filter((id) => !editor.mitglieder.has(id));

    zustand.gruppeFehler = "";
    zustand.gruppeFertig = "";
    let getan = 0;
    try {
      for (const uid of hinzu) {
        zustand.gruppeLaeuft = `Konto ${getan + 1} von ${hinzu.length + weg.length}...`;
        zeichne();
        const konto = zustand.konten.find((k) => k.id === uid);
        await api().setUserGroup(uid, { name, displayName: v().gruppe(konto?.group)?.displayName || "" });
        getan += 1;
      }
      for (const uid of weg) {
        zustand.gruppeLaeuft = `Konto ${getan + 1} von ${hinzu.length + weg.length}...`;
        zeichne();
        await api().setUserGroup(uid, { name: "", displayName: "" });
        getan += 1;
      }
      zustand.gruppeFertig = `«${name}»: ${hinzu.length} Konten drin${weg.length ? `, ${weg.length} herausgenommen` : ""}.`;
      zustand.gruppeBearbeiten = null;
    } catch (fehler) {
      zustand.gruppeFehler = api().fehlerText(fehler);
    }
    zustand.gruppeLaeuft = "";
    await lade({ neu: true });
  }

  // ---------------------------------------------------------------------------
  start();
})();
