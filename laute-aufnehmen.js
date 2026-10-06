/*
 * laute-aufnehmen.js – Die Laute der Leseecke einsprechen.
 *
 * Eine Seite für Erwachsene, kein Spiel: Je Laut ein Knopf zum Aufnehmen, einer
 * zum Anhören. Am Schluss entsteht daraus die Datei lesen-laute.js, die die
 * App mitliefert (docs/LAUTE-AUFNEHMEN.md beschreibt den ganzen Weg).
 *
 * Was mit einer Aufnahme geschieht:
 *
 *   1. Das Mikrofon nimmt bis zu drei Sekunden auf (MediaRecorder; ein
 *      zweiter Tipp hält früher an).
 *   2. Stille vorne und hinten wird weggeschnitten, ein kleiner Rand bleibt.
 *   3. Auf 16 kHz umgerechnet, auf eine gleiche Lautstärke gebracht, mit
 *      weichem Ein- und Ausblenden – sonst knackt es.
 *   4. Als WAV (16 Bit, mono) in eine Daten-Adresse verpackt: Die spielt jeder
 *      Browser ab, und sie braucht keinen eigenen Ordner im Build.
 *
 * Die Aufnahmen bleiben auf diesem Gerät liegen, bis die Datei erstellt ist –
 * nicht unter "lernapp.", denn alles dort räumt «Fortschritt zurücksetzen»
 * weg. Hochgeladen wird nichts.
 */
(() => {
  "use strict";

  const RATE = 16000;
  const MAX_SEKUNDEN = 1.2;

  // ---------------------------------------------------------------------------
  // Ton: umrechnen, zuschneiden, verpacken
  // ---------------------------------------------------------------------------
  // Fenster von 10 ms; was unter 8 % des lautesten Fensters bleibt, ist Stille.
  // Vorne bleiben 40 ms Rand, hinten 80 ms – ein «t» klingt kurz nach.
  function zuschneiden(daten, rate) {
    const fenster = Math.max(1, Math.round(rate * 0.01));
    const pegel = [];
    for (let i = 0; i < daten.length; i += fenster) {
      let summe = 0;
      const ende = Math.min(i + fenster, daten.length);
      for (let j = i; j < ende; j += 1) summe += daten[j] * daten[j];
      pegel.push(Math.sqrt(summe / (ende - i)));
    }
    const lautester = Math.max(0, ...pegel);
    if (lautester < 0.004) return null;
    const schwelle = Math.max(lautester * 0.08, 0.002);
    const erstes = pegel.findIndex((p) => p >= schwelle);
    let letztes = pegel.length - 1;
    while (letztes > erstes && pegel[letztes] < schwelle) letztes -= 1;
    const von = Math.max(0, (erstes - 4) * fenster);
    const bis = Math.min(daten.length, (letztes + 1 + 8) * fenster);
    return daten.slice(von, bis);
  }

  // Auf eine kleinere Abtastrate: erst ein Tiefpass knapp unter der neuen
  // Grenze (gefensterter Sinus, Blackman), sonst klirrt ein «s» – dann an den
  // neuen Stellen abgelesen. Ohne OfflineAudioContext, den ältere Safaris für
  // 16 kHz nicht hergeben.
  function umrechnen(daten, von, nach) {
    if (von === nach) return Float32Array.from(daten);
    let gefiltert = daten;
    if (nach < von) {
      const grenze = 0.45 * nach / von;
      const halb = 48;
      const kern = new Float32Array(2 * halb + 1);
      let summe = 0;
      for (let i = -halb; i <= halb; i += 1) {
        const sinc = i === 0 ? 2 * grenze : Math.sin(2 * Math.PI * grenze * i) / (Math.PI * i);
        const fensterWert = 0.42 + 0.5 * Math.cos(Math.PI * i / halb) + 0.08 * Math.cos(2 * Math.PI * i / halb);
        kern[i + halb] = sinc * fensterWert;
        summe += kern[i + halb];
      }
      for (let i = 0; i < kern.length; i += 1) kern[i] /= summe;
      gefiltert = new Float32Array(daten.length);
      for (let n = 0; n < daten.length; n += 1) {
        let wert = 0;
        for (let k = -halb; k <= halb; k += 1) {
          const m = n + k;
          if (m >= 0 && m < daten.length) wert += daten[m] * kern[k + halb];
        }
        gefiltert[n] = wert;
      }
    }
    const laenge = Math.max(1, Math.floor(daten.length * nach / von));
    const aus = new Float32Array(laenge);
    const schritt = von / nach;
    for (let j = 0; j < laenge; j += 1) {
      const stelle = j * schritt;
      const a = Math.floor(stelle);
      const anteil = stelle - a;
      const x = gefiltert[a] || 0;
      const y = gefiltert[Math.min(a + 1, gefiltert.length - 1)] || 0;
      aus[j] = x + (y - x) * anteil;
    }
    return aus;
  }

  // Gleich laut (Spitze bei 90 %) und weich ein- und ausgeblendet.
  function glaetten(daten, rate) {
    let spitze = 0;
    for (let i = 0; i < daten.length; i += 1) spitze = Math.max(spitze, Math.abs(daten[i]));
    const faktor = spitze > 0 ? 0.9 / spitze : 1;
    const ein = Math.min(daten.length, Math.round(rate * 0.008));
    const aus = Math.min(daten.length, Math.round(rate * 0.04));
    const ergebnis = new Float32Array(daten.length);
    for (let i = 0; i < daten.length; i += 1) {
      let wert = daten[i] * faktor;
      if (i < ein) wert *= i / ein;
      const rest = daten.length - 1 - i;
      if (rest < aus) wert *= rest / aus;
      ergebnis[i] = wert;
    }
    return ergebnis;
  }

  function wav(daten, rate) {
    const puffer = new ArrayBuffer(44 + daten.length * 2);
    const sicht = new DataView(puffer);
    const text = (stelle, wort) => { for (let i = 0; i < wort.length; i += 1) sicht.setUint8(stelle + i, wort.charCodeAt(i)); };
    text(0, "RIFF");
    sicht.setUint32(4, 36 + daten.length * 2, true);
    text(8, "WAVE");
    text(12, "fmt ");
    sicht.setUint32(16, 16, true);
    sicht.setUint16(20, 1, true);          // PCM
    sicht.setUint16(22, 1, true);          // mono
    sicht.setUint32(24, rate, true);
    sicht.setUint32(28, rate * 2, true);
    sicht.setUint16(32, 2, true);
    sicht.setUint16(34, 16, true);
    text(36, "data");
    sicht.setUint32(40, daten.length * 2, true);
    for (let i = 0; i < daten.length; i += 1) {
      const wert = Math.max(-1, Math.min(1, daten[i]));
      sicht.setInt16(44 + i * 2, Math.round(wert * 32767), true);
    }
    return new Uint8Array(puffer);
  }

  function base64(bytes) {
    let text = "";
    const stueck = 0x8000;
    for (let i = 0; i < bytes.length; i += stueck) text += String.fromCharCode.apply(null, bytes.subarray(i, i + stueck));
    return window.btoa(text);
  }

  // Wie jeder Laut klingen soll. Der Laut, nicht der Name des Buchstabens:
  // «mmm», nicht «Em». Bei den kurzen Lauten (b, d, g, k, p, t) kein «e»
  // hinterher – «b», nicht «be».
  const HINWEISE = {
    m: "«mmm» – Lippen zu und summen, gut eine halbe Sekunde",
    a: "«a» wie in Affe – klar und kurz, ohne «h» davor",
    l: "«lll» – Zungenspitze oben an die Zähne, klingen lassen",
    i: "«i» wie in Igel",
    o: "«o» wie in Ohr",
    s: "«sss» – zischen wie eine Schlange",
    e: "«e» wie in Ente",
    r: "«rrr» – so, wie du das R sprichst, kurz rollen lassen",
    n: "«nnn» – Mund offen, durch die Nase summen",
    u: "«u» wie in Uhr",
    f: "«fff» – Luft zwischen Zähnen und Unterlippe",
    w: "«www» – wie f, aber mit Stimme",
    h: "«h» – nur ein Hauch, wie auf eine Brille hauchen",
    d: "«d» – ganz kurz, kein «e» hinterher",
    t: "«t» – ganz kurz und hart, kein «e» hinterher",
    b: "«b» – ganz kurz, kein «e» hinterher",
    k: "«k» – ganz kurz, kein «e» hinterher",
    p: "«p» – ganz kurz, ein kleiner Luftstoss",
    g: "«g» – ganz kurz, kein «e» hinterher",
    ei: "«ei» wie in Eis",
    au: "«au» wie in Auto",
    sch: "«schsch» – wie wenn du jemanden leise machst",
    eu: "«eu» wie in Eule",
    ie: "«ii» – ein langes i wie in Biene",
    ch: "«ch» wie in Buch – hinten im Hals",
    z: "«ts» wie in Zebra – kurz",
    j: "«j» wie in Jacke – ein wenig dehnen",
    v: "«fff» wie in Vogel – V klingt hier wie F",
    st: "«scht» wie in Stern",
    sp: "«schp» wie in Spinne",
    pf: "«pf» wie in Pferd – kurz",
    "ä": "«ä» wie in Käse",
    "ö": "«ö» wie in Löffel",
    "ü": "«ü» wie in Tür",
    ck: "«k» wie in Socke – kurz",
    ng: "«ng» wie in Schlange – durch die Nase, kein g am Schluss",
  };

  // Für die Prüfung (validate-lesen.mjs rechnet die Bearbeitung ohne Browser
  // nach) – deshalb vor dem Blick auf die Seite.
  window.LernappLauteAufnehmen = { RATE, MAX_SEKUNDEN, HINWEISE, zuschneiden, umrechnen, glaetten, wav };

  if (document.body.dataset.page !== "laute-aufnehmen") return;

  const inhalte = window.LernappLeseInhalte;
  const liste = document.querySelector("[data-laute]");
  const meldungFeld = document.querySelector("[data-meldung]");
  const zaehler = document.querySelector("[data-zaehler]");
  if (!inhalte || !liste) return;

  const SPEICHER = "gripszug.laute.aufnahmen";
  const AUFNAHME_MS = 3000;

  // ---------------------------------------------------------------------------
  // Speichern auf dem Gerät
  // ---------------------------------------------------------------------------
  function laden() {
    try { return JSON.parse(localStorage.getItem(SPEICHER) || "{}") || {}; } catch { return {}; }
  }
  function speichern() {
    try {
      localStorage.setItem(SPEICHER, JSON.stringify(neu));
      return true;
    } catch {
      meldung("Der Speicher dieses Browsers ist voll – erstelle die Datei jetzt, bevor du weiter aufnimmst.", "fehler");
      return false;
    }
  }

  let neu = laden();
  const inApp = window.LernappLauteAufnahmen || {};
  const aufnahme = (id) => neu[id] || inApp[id] || null;

  function meldung(text, art = "") {
    if (!meldungFeld) return;
    meldungFeld.textContent = text;
    meldungFeld.dataset.art = art;
  }

  let kontext = null;
  function audioKontext() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!kontext) kontext = new AC();
    if (kontext.state === "suspended") kontext.resume().catch(() => {});
    return kontext;
  }

  function dekodieren(ctx, bytes) {
    return new Promise((fertig, fehler) => {
      // Ältere Safaris kennen nur die Fassung mit Rückrufen.
      const versuch = ctx.decodeAudioData(bytes, fertig, fehler);
      if (versuch?.then) versuch.then(fertig, fehler);
    });
  }

  // Aus der Aufnahme wird die Daten-Adresse – oder eine Erklärung, warum nicht.
  async function verarbeiten(blob) {
    const ctx = audioKontext();
    if (!ctx) return { fehler: "Dieser Browser kann keine Töne verarbeiten." };
    let puffer;
    try { puffer = await dekodieren(ctx, await blob.arrayBuffer()); } catch { return { fehler: "Die Aufnahme liess sich nicht lesen. Noch einmal?" }; }
    const rate = puffer.sampleRate;
    const mono = new Float32Array(puffer.length);
    for (let kanal = 0; kanal < puffer.numberOfChannels; kanal += 1) {
      const daten = puffer.getChannelData(kanal);
      for (let i = 0; i < daten.length; i += 1) mono[i] += daten[i] / puffer.numberOfChannels;
    }
    let voll = 0;
    for (let i = 0; i < mono.length; i += 1) if (Math.abs(mono[i]) > 0.985) voll += 1;
    let stueck = zuschneiden(mono, rate);
    if (!stueck || stueck.length < rate * 0.04) return { fehler: "Da war nichts zu hören. Näher ans Mikrofon und noch einmal." };
    const warnungen = [];
    if (voll > rate * 0.002) warnungen.push("etwas übersteuert – ein wenig weiter weg vom Mikrofon wäre besser");
    if (stueck.length > rate * MAX_SEKUNDEN) {
      stueck = stueck.slice(0, Math.round(rate * MAX_SEKUNDEN));
      warnungen.push(`länger als ${String(MAX_SEKUNDEN).replace(".", ",")} Sekunden – gekürzt`);
    }
    let spitze = 0;
    for (let i = 0; i < stueck.length; i += 1) spitze = Math.max(spitze, Math.abs(stueck[i]));
    if (spitze < 0.05) warnungen.push("sehr leise – näher ans Mikrofon wäre besser");
    const fertig = glaetten(umrechnen(stueck, rate, RATE), RATE);
    return {
      url: `data:audio/wav;base64,${base64(wav(fertig, RATE))}`,
      sekunden: fertig.length / RATE,
      warnungen,
    };
  }

  // ---------------------------------------------------------------------------
  // Aufnehmen und Abspielen
  // ---------------------------------------------------------------------------
  let strom = null;
  let laeuft = null;   // { recorder, id }
  let spieler = null;

  async function mikrofon() {
    if (strom && strom.getAudioTracks().some((spur) => spur.readyState === "live")) return strom;
    strom = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: false, noiseSuppression: true, autoGainControl: false },
    });
    return strom;
  }

  function aufnahmeTyp() {
    if (typeof window.MediaRecorder !== "function") return null;
    const typen = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"];
    return typen.find((typ) => window.MediaRecorder.isTypeSupported?.(typ)) || "";
  }

  // Ein Pegel unter dem Knopf, solange aufgenommen wird: So sieht man, dass
  // das Mikrofon hört.
  function pegelZeigen(zeile, stream) {
    const ctx = audioKontext();
    const balken = zeile.querySelector(".la-pegel span");
    if (!ctx || !balken) return () => {};
    const quelle = ctx.createMediaStreamSource(stream);
    const analyse = ctx.createAnalyser();
    analyse.fftSize = 512;
    quelle.connect(analyse);
    const werte = new Float32Array(analyse.fftSize);
    let aktiv = true;
    const zeichne = () => {
      if (!aktiv) return;
      analyse.getFloatTimeDomainData(werte);
      let spitze = 0;
      for (let i = 0; i < werte.length; i += 1) spitze = Math.max(spitze, Math.abs(werte[i]));
      balken.style.width = `${Math.min(100, Math.round(Math.sqrt(spitze) * 100))}%`;
      window.requestAnimationFrame(zeichne);
    };
    zeichne();
    return () => {
      aktiv = false;
      balken.style.width = "0%";
      try { quelle.disconnect(); } catch { /* egal */ }
    };
  }

  async function aufnehmen(laut, zeile) {
    // Ein zweiter Tipp hält an.
    if (laeuft) {
      if (laeuft.id === laut.id && laeuft.recorder.state === "recording") laeuft.recorder.stop();
      return;
    }
    const typ = aufnahmeTyp();
    if (typ === null) { meldung("Dieser Browser kann nicht aufnehmen. Nimm Chrome oder Safari in einer neuen Fassung.", "fehler"); return; }
    let stream;
    try { stream = await mikrofon(); } catch {
      meldung("Ohne Mikrofon geht es nicht. Erlaube der Seite das Mikrofon (in der Adresszeile) und tippe noch einmal.", "fehler");
      return;
    }
    stopAbspielen();
    const teile = [];
    const recorder = new window.MediaRecorder(stream, typ ? { mimeType: typ } : undefined);
    laeuft = { recorder, id: laut.id };
    recorder.addEventListener("dataavailable", (ereignis) => { if (ereignis.data?.size) teile.push(ereignis.data); });
    const gestoppt = new Promise((fertig) => recorder.addEventListener("stop", fertig, { once: true }));
    recorder.addEventListener("start", () => {
      zeile.classList.add("nimmt-auf");
      meldung(`Aufnahme läuft – jetzt «${laut.gross}» sprechen: ${HINWEISE[laut.id] || ""}`, "laeuft");
    }, { once: true });
    const pegelAus = pegelZeigen(zeile, stream);
    zeile.querySelector(".la-auf").textContent = "■ Stopp";
    recorder.start();
    const uhr = window.setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, AUFNAHME_MS);
    await gestoppt;
    window.clearTimeout(uhr);
    pegelAus();
    laeuft = null;
    zeile.classList.remove("nimmt-auf");
    zeile.querySelector(".la-auf").textContent = "● Aufnehmen";
    meldung("Wird bearbeitet …");
    const ergebnis = await verarbeiten(new Blob(teile, { type: recorder.mimeType || typ || "audio/webm" }));
    if (ergebnis.fehler) { meldung(`${laut.gross}: ${ergebnis.fehler}`, "fehler"); return; }
    neu[laut.id] = ergebnis.url;
    speichern();
    zeichneZeile(zeile, laut);
    zaehlen();
    const dauer = `${ergebnis.sekunden.toFixed(2).replace(".", ",")} s`;
    meldung(ergebnis.warnungen.length
      ? `${laut.gross} aufgenommen (${dauer}), aber ${ergebnis.warnungen.join(" und ")}. Anhören – und bei Bedarf noch einmal.`
      : `${laut.gross} aufgenommen (${dauer}). Hör es dir an.`, ergebnis.warnungen.length ? "warnung" : "ok");
    abspielen(laut.id, zeile);
  }

  function stopAbspielen() {
    if (spieler) { try { spieler.pause(); } catch { /* egal */ } spieler = null; }
    liste.querySelectorAll(".spielt").forEach((z) => z.classList.remove("spielt"));
  }

  function abspielen(id, zeile) {
    const quelle = aufnahme(id);
    if (!quelle) return Promise.resolve(false);
    stopAbspielen();
    return new Promise((fertig) => {
      const audio = new Audio(quelle);
      spieler = audio;
      zeile?.classList.add("spielt");
      const ende = (ok) => { zeile?.classList.remove("spielt"); if (spieler === audio) spieler = null; fertig(ok); };
      audio.addEventListener("ended", () => ende(true));
      audio.addEventListener("error", () => ende(false));
      audio.play()?.catch?.(() => ende(false));
    });
  }

  async function alleAnhoeren() {
    for (const laut of inhalte.LAUTE) {
      const zeile = liste.querySelector(`[data-id="${CSS.escape(laut.id)}"]`);
      if (!aufnahme(laut.id)) continue;
      zeile?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      const ok = await abspielen(laut.id, zeile);
      if (!ok) break;
      await new Promise((weiter) => window.setTimeout(weiter, 350));
    }
  }

  // ---------------------------------------------------------------------------
  // Die Datei
  // ---------------------------------------------------------------------------
  function datei() {
    const eintraege = inhalte.LAUTE.filter((laut) => aufnahme(laut.id));
    const zeilen = eintraege.map((laut) => `  ${JSON.stringify(laut.id)}: ${JSON.stringify(aufnahme(laut.id))},`);
    const bytes = eintraege.reduce((n, laut) => n + Math.round((aufnahme(laut.id).length - 22) * 0.75), 0);
    const heute = new Date();
    const datum = `${heute.getDate()}.${heute.getMonth() + 1}.${heute.getFullYear()}`;
    return [
      "/*",
      " * lesen-laute.js – Die aufgenommenen Laute der Leseecke.",
      " *",
      ` * Erzeugt mit laute-aufnehmen.html am ${datum}: ${eintraege.length} von ${inhalte.LAUTE.length} Lauten,`,
      ` * WAV, 16 kHz, 16 Bit, mono, zusammen ${Math.round(bytes / 1024)} KB. Nicht von Hand ändern –`,
      " * neu aufnehmen und die Datei neu erstellen (docs/LAUTE-AUFNEHMEN.md).",
      " *",
      " * Fehlt ein Laut, spricht lesen-ton.js die Selbstlaute mit der",
      " * Sprachausgabe und lässt die übrigen stumm, statt «Em» zu sagen.",
      " */",
      "window.LernappLauteAufnahmen = {",
      ...zeilen,
      "};",
      "",
    ].join("\n");
  }

  function herunterladen() {
    const text = datei();
    const blob = new Blob([text], { type: "text/javascript" });
    const adresse = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = adresse;
    link.download = "lesen-laute.js";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(adresse), 4000);
    meldung("lesen-laute.js ist erstellt. Wie sie in die App kommt, steht in der Anleitung oben.", "ok");
  }

  async function teilen() {
    const file = new File([datei()], "lesen-laute.js", { type: "text/javascript" });
    try {
      await navigator.share({ files: [file], title: "lesen-laute.js" });
      meldung("Geteilt.", "ok");
    } catch (fehler) {
      if (fehler?.name !== "AbortError") meldung("Teilen ging nicht – nimm «Herunterladen».", "fehler");
    }
  }

  // ---------------------------------------------------------------------------
  // Die Liste
  // ---------------------------------------------------------------------------
  function zeichneZeile(zeile, laut) {
    const hatNeu = Boolean(neu[laut.id]);
    const hatApp = Boolean(inApp[laut.id]);
    const stand = zeile.querySelector(".la-stand");
    stand.textContent = hatNeu ? "neu aufgenommen" : hatApp ? "in der App" : "fehlt";
    stand.dataset.stand = hatNeu ? "neu" : hatApp ? "app" : "fehlt";
    zeile.querySelector(".la-hoer").disabled = !hatNeu && !hatApp;
    zeile.querySelector(".la-weg").hidden = !hatNeu;
  }

  function zaehlen() {
    const da = inhalte.LAUTE.filter((laut) => aufnahme(laut.id)).length;
    const neue = inhalte.LAUTE.filter((laut) => neu[laut.id]).length;
    if (zaehler) zaehler.textContent = `${da} von ${inhalte.LAUTE.length} Lauten${neue ? `, ${neue} davon neu` : ""}`;
    document.querySelector("[data-datei]")?.toggleAttribute("disabled", !neue);
    document.querySelector("[data-teilen]")?.toggleAttribute("disabled", !neue);
  }

  function aufbauen() {
    const gruppen = [...new Set(inhalte.LAUTE.map((laut) => laut.gruppe))];
    gruppen.forEach((gruppe) => {
      const laute = inhalte.LAUTE.filter((laut) => laut.gruppe === gruppe);
      const block = document.createElement("section");
      block.className = "la-gruppe";
      const kopf = document.createElement("h2");
      kopf.textContent = `Gruppe ${gruppe}: ${laute.map((laut) => laut.gross).join(" ")}`;
      const ul = document.createElement("ul");
      laute.forEach((laut) => {
        const zeile = document.createElement("li");
        zeile.className = "la-laut";
        zeile.dataset.id = laut.id;
        zeile.innerHTML = `
          <span class="la-zeichen" lang="de"></span>
          <span class="la-wort"><span class="la-bild" aria-hidden="true"></span><span class="la-wort-text"></span></span>
          <span class="la-hinweis"></span>
          <span class="la-knoepfe">
            <button type="button" class="la-auf">● Aufnehmen</button>
            <button type="button" class="la-hoer">▶ Anhören</button>
            <button type="button" class="la-weg" aria-label="Neue Aufnahme verwerfen">✕</button>
          </span>
          <span class="la-stand"></span>
          <span class="la-pegel" aria-hidden="true"><span></span></span>`;
        zeile.querySelector(".la-zeichen").textContent = laut.gross === laut.klein ? laut.gross : `${laut.gross} ${laut.klein}`;
        zeile.querySelector(".la-bild").textContent = laut.bild;
        zeile.querySelector(".la-wort-text").textContent = `wie ${laut.wort}`;
        zeile.querySelector(".la-hinweis").textContent = HINWEISE[laut.id] || "";
        zeile.querySelector(".la-auf").addEventListener("click", () => aufnehmen(laut, zeile));
        zeile.querySelector(".la-hoer").addEventListener("click", () => abspielen(laut.id, zeile));
        zeile.querySelector(".la-weg").addEventListener("click", () => {
          delete neu[laut.id];
          speichern();
          zeichneZeile(zeile, laut);
          zaehlen();
          meldung(`Die neue Aufnahme von ${laut.gross} ist verworfen.`);
        });
        zeichneZeile(zeile, laut);
        ul.append(zeile);
      });
      block.append(kopf, ul);
      liste.append(block);
    });
    document.querySelector("[data-alle]")?.addEventListener("click", alleAnhoeren);
    document.querySelector("[data-datei]")?.addEventListener("click", herunterladen);
    const teilenKnopf = document.querySelector("[data-teilen]");
    if (teilenKnopf) {
      const kannTeilen = typeof navigator.canShare === "function" && navigator.canShare({ files: [new File(["x"], "x.js", { type: "text/javascript" })] });
      teilenKnopf.hidden = !kannTeilen;
      teilenKnopf.addEventListener("click", teilen);
    }
    zaehlen();
    if (aufnahmeTyp() === null) meldung("Dieser Browser kann nicht aufnehmen. Nimm Chrome oder Safari in einer neuen Fassung.", "fehler");
  }

  window.addEventListener("pagehide", () => { strom?.getTracks().forEach((spur) => spur.stop()); });

  aufbauen();

  Object.assign(window.LernappLauteAufnehmen, { datei });
})();
