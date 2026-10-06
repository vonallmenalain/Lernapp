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
 *   Sofa mit Lesewurm    die Hauptmission: Über ihm steht auf einer Karte,
 *                        was er als Nächstes vorschlägt – ein Tipp auf ihn
 *   Missionskarte        oder auf die Karte (ein eigener Knopf, der dasselbe
 *                        tut: mission wie weiter) startet es
 *   Trommel              Hören: Silbenzug, Laut-Position, Reimkupplung,
 *                        Anlaut-Lauscher
 *   Buchstabenhaus       Laute und Buchstaben
 *   Wortkiste            Wörter: Laute kuppeln, Wer fährt mit?, Wörter bauen,
 *                        Silbenbahn, Blitzwörter, Quatschwörter
 *   Spielzeugzug         Sätze: Stimmt das?, Lückensätze, Satz kuppeln, …
 *   Bücherregal          Bücher: das Regal und der Geschichtenzug
 *   Pinnwand             Lesedetektive: Wer bin ich?, Detektivfälle,
 *                        Steckbriefe, Postkarten, Wortbaustelle
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
 * Beim Hereinkommen hüpft reihum alles, was sich antippen lässt – wie die
 * Wagen auf dem Startbild (REIHUM). Die Einrichtung hüpft nie: So sieht ein
 * Kind, was ein Knopf ist und was nur dasteht.
 *
 * Der Lesewurm wächst von den Runden (lesen-stand.js, wurmStand; gezeichnet in
 * lesen-wurm.js): Jede ist ein Buchstabe in seiner Leiste, die Runde, die er
 * vorschlägt, zwei. Ist die Leiste voll, verwandelt er sich – gezeigt wird das
 * beim nächsten Besuch: Das Geschenk geht auf, er verschwindet und erscheint
 * in der neuen Stufe. Nach drei Leben (Lesefalter, Lesewurm-Express,
 * Lesezauberer) ist er fertig; die fertigen stehen oben auf dem Regal.
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
    "Auf dem Sofa zeigt dir der Lesewurm, was als Nächstes dran ist: Tippe auf ihn oder auf den grünen Knopf.",
    "Für jede Runde bekommt er einen Buchstaben, für seine Runde zwei, und ist seine Leiste voll, gibt es eine Überraschung.",
    "Die Trommel ist zum Hören, das Buchstabenhaus für Buchstaben,",
    "die Kiste für Wörter, der kleine Zug für Sätze und das Regal für Bücher.",
    "An der Pinnwand warten Rätsel für Lesedetektive.",
    "Auf dem Schild steht der Name deines Lesewurms.",
  ].join(" ");

  // Wohin das Schild am Sessel führt: Dort bekommt der Lesewurm seinen Namen.
  const TAUFE = "meinname.html?wurm=1";

  // In dieser Reihenfolge hüpfen die Dinge beim Hereinkommen: einmal im
  // Uhrzeigersinn durchs Zimmer, oben links beim Buchstabenhaus los, und
  // zuletzt der Lesewurm in der Mitte und seine Karte. Eine Welle liest sich
  // als «all das kannst du antippen», ein gemeinsamer Hüpfer als Ruckeln.
  const REIHUM = ["buchstaben", "detektiv", "buecher", "woerter", "saetze", "silben", "wurmname", "weiter", "mission"];
  // Wann das erste Ding hüpft und wie viel später jedes nächste: erst, wenn
  // das Zimmer eingeblendet ist (leseecke-ein im Stylesheet).
  const HUEPF_START = 0.55;
  const HUEPF_ABSTAND = 0.13;

  // Wo der Lesewurm stand, als das Kind ihn zuletzt gesehen hat: welche Stufe
  // (nr, 1 bis 45) und wie viele Buchstaben er hatte. Hat er sich seither
  // verwandelt, zeigt das Zimmer die Verwandlung; sind nur Buchstaben
  // dazugekommen, springen sie in die Leiste. Über den Vergleich, nicht über
  // eine Nachricht der Spiele: So stimmt es auch nach einem Neuladen.
  const WURM_GESEHEN_KEY = "lernapp.lesen.wurm-gesehen";
  // Genauso die Einrichtung: wie viele Dinge schon dastanden.
  const AUSBAU_GESEHEN_KEY = "lernapp.lesen.ausbau-gesehen";

  function gesehen(key) {
    try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
  }
  function merkeGesehen(wert, key) {
    try { localStorage.setItem(key, String(wert)); } catch { /* privater Modus */ }
  }
  function wurmGesehen() {
    try {
      const w = JSON.parse(localStorage.getItem(WURM_GESEHEN_KEY) || "null");
      return w && Number(w.nr) > 0 ? { nr: Number(w.nr), buchstaben: Number(w.buchstaben) || 0 } : null;
    } catch { return null; }
  }
  function merkeWurm(wurm, buchstaben) {
    try { localStorage.setItem(WURM_GESEHEN_KEY, JSON.stringify({ nr: wurm.nr, buchstaben })); } catch { /* privater Modus */ }
  }

  // So lange dauern die Schritte der Verwandlung: die letzten Buchstaben
  // springen in die Leiste (je Feld), das Geschenk geht auf, der Wurm
  // verschwindet – dann erscheint er neu.
  const FELD_MS = 180;
  const GESCHENK_MS = 700;
  const WEG_MS = 450;
  const reduziert = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

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

  // Ob an einem Ding ein Schloss hängt: wenn die Schnupperrunde jedes Spiels
  // dahinter gespielt ist – wie an den Häusern der Bereiche. Ist noch eines
  // offen, trägt nur dessen Karte in der Auswahl kein Schloss.
  function zu(ort) {
    const spiele = spieleAm(ort);
    return spiele.length > 0 && spiele.every((spiel) => gespielt(spiel.page));
  }

  function schloss(svg, ort) {
    if (!zu(ort)) return;
    const knoten = svg.querySelector(`[data-ort="${ort}"]`);
    if (!knoten) return;
    knoten.classList.add("is-locked");
    // Am Regal zählt das Regal selbst, nicht die Würmer obendrauf.
    const box = (knoten.querySelector(":scope > .lese-ort-bild") || knoten).getBBox?.();
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

  // Was der Wurm als Nächstes vorschlägt, für die Missionskarte: Bild, Name,
  // wohin ein Tipp führt und ob die Schnupperrunde schon verbraucht ist. Bei
  // den Büchern sucht das Regal das Buch aus (buecher.html?weiter=1).
  function mission() {
    const n = stand()?.naechstes?.();
    if (!n) return null;
    const buch = n.id === "buecher";
    return { id: n.id, page: n.page, bild: buch ? "📖" : n.bild || "📖", name: buch ? "Ein Buch" : n.titel, sagt: buch ? "ein Buch" : n.titel, zu: gespielt(n.page) };
  }

  // Der Name des Lesewurms, wie er im Zimmer steht – leer ohne Taufe.
  function wurmName(s, jetzt) {
    const name = s?.wurmName?.(jetzt) || "";
    return name ? (s?.zeige?.(name) ?? name) : "";
  }

  // Was der Lautsprecher zur Mission sagt.
  function missionSatz(m, wurm, name) {
    if (!m) return "";
    const wer = name || "Dein Lesewurm";
    let satz = `${wer} hat eine Idee: ${m.sagt}! Tippe auf ihn, und es geht los.`;
    if (wurm?.braucht > 0) {
      const rest = Math.max(1, wurm.braucht - wurm.hat);
      satz += ` Noch ${rest} ${rest === 1 ? "Buchstabe" : "Buchstaben"} bis zur nächsten Überraschung.`;
    }
    return satz;
  }

  // Aus der Stufe nr (1 bis 45) Leben und Stufe darin.
  function lebenUndStufe(nr) {
    const n = Math.max(1, Math.round(nr) || 1);
    return { leben: Math.min(2, Math.floor((n - 1) / 15)), stufe: ((n - 1) % 15) + 1 };
  }

  // Das Zimmer, das gerade steht: sein Platz auf der Bühne, wohin ein Tipp
  // führt, und was es zeigt (zustand). laeuft: Eine Verwandlung spielt
  // gerade; Bescheide aus der Cloud warten, bis sie fertig ist.
  let offen = null;

  // Was das Zimmer zeigt: der Lesewurm in seiner Stufe, seine Leiste und sein
  // Name, was er vorschlägt, die gelesenen Bücher, die Einrichtung und die
  // Schlösser an den Dingen. Den Zug draussen, die Lok und die Landschaft
  // sieht hier niemand.
  function zustand() {
    const s = stand();
    const jetzt = s ? s.stand() : { woerter: 0, buecher: {} };
    const wurm = s?.wurmStand?.(jetzt) || null;
    const m = mission();
    return JSON.stringify([
      wurm ? [wurm.nr, wurm.hat, wurm.braucht] : 0,
      m ? [m.id, m.zu] : null,
      Object.keys(jetzt.buecher || {}).length,
      wurmName(s, jetzt),
      s?.wagenStufe?.(jetzt) || 0,
      Object.keys(ORTE).filter(zu),
    ]);
  }

  /*
   *   host    das Element auf der Bühne, in das das Zimmer kommt
   *   onPlay  (seite) => …, öffnet ein Spiel (train-home.js, enterGame)
   */
  function mount({ host, onPlay }) {
    if (!art() || !host) return;
    schriftLaden();
    offen = { host, onPlay, zustand: "", laeuft: false, ausbauVorher: 0 };
    zeichne();
  }

  // Nach der Rückkehr aus einem Lesespiel melden sich Anmeldung, Schranke,
  // Einstellungen und Fortschritt nacheinander aus der Cloud. Früher baute
  // jeder Bescheid das Zimmer neu, und es blendete sich jedes Mal von vorn
  // ein: drei-, viermal hintereinander. Jetzt fragt train-home.js hier nach,
  // und neu gezeichnet wird nur, wenn sich am Zimmer etwas ändert – an Ort und
  // Stelle, ohne Einblenden, und eine offene Auswahl bleibt offen.
  function auffrischen() {
    if (!offen?.host.isConnected || offen.laeuft || zustand() === offen.zustand) return false;
    zeichne();
    return true;
  }

  // Baut das Zimmer einmal und hängt es ein: an die Stelle des alten, oder
  // neu, dann hüpft es (nur beim Hereinkommen, und nicht, wenn gleich eine
  // Verwandlung kommt – dann ist die das Ereignis).
  //   wurm, mission  was buildLesezimmer zeichnet (siehe dort)
  function baue({ wurm, mission: karte, huepfen = true }) {
    const { host, onPlay } = offen;
    const a = art();
    const s = stand();
    const jetzt = s ? s.stand() : { woerter: 0, buecher: {} };
    const gelesen = Object.keys(jetzt.buecher || {}).length;
    const ausbau = s?.wagenStufe?.(jetzt) || 0;
    const svg = a.buildLesezimmer({
      glieder: s ? s.wurmGlieder(jetzt) : 1,
      gelesen,
      wurmName: wurmName(s, jetzt),
      ausbau,
      neuAb: offen.ausbauVorher,
      wurm,
      mission: karte,
    });
    // Beim Auffrischen weicht nur die Zeichnung: Der Platz bleibt, also blendet
    // sich nichts neu ein, und die Auswahl darüber bleibt stehen.
    const alt = host.querySelector(":scope > .lesezimmer-svg");
    // Gehüpft wird nur beim Hereinkommen. Bringt die Cloud danach etwas Neues
    // und das Zimmer frischt sich auf, hüpft nichts ein zweites Mal.
    if (!alt && huepfen) svg.classList.add("is-huepfen");
    if (alt) alt.replaceWith(svg);
    else host.append(svg);

    svg.querySelectorAll("[data-ort]").forEach((knoten) => {
      const ort = knoten.getAttribute("data-ort");
      const reihe = REIHUM.indexOf(ort);
      knoten.style.setProperty("--ort-verzug", `${(HUEPF_START + Math.max(0, reihe) * HUEPF_ABSTAND).toFixed(2)}s`);
      const los = () => {
        if (ort === "weiter" || ort === "mission") {
          // Die Hauptmission – der Wurm oder seine Karte: Wird dieses Spiel
          // jetzt fertig gespielt, gibt es für den Wurm einen Buchstaben mehr
          // (lesen-stand.js, missionErfuellt).
          const m = mission();
          if (m) s?.missionStarten?.(m.id);
          onPlay?.(m?.page || "buchstabenhaus.html");
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
    return svg;
  }

  const warte = (ms) => new Promise((fertig) => window.setTimeout(fertig, ms));

  async function zeichne() {
    const a = art();
    const s = stand();
    const anfang = zustand();
    // Das Zimmer, für das diese Verwandlung spielt. Geht das Kind hinaus und
    // gleich wieder hinein, gehört die Bühne dem neuen Besuch: Die alte
    // Verwandlung hört dann auf, statt dazwischenzuzeichnen.
    const meins = offen;
    const vorbei = () => offen !== meins || !meins.host.isConnected;
    const jetzt = s ? s.stand() : { woerter: 0, buecher: {} };
    const name = wurmName(s, jetzt);
    const wurm = s?.wurmStand?.(jetzt) || null;
    const buchstaben = s?.buchstaben?.(jetzt) || 0;
    const m = mission();
    // Die Einrichtung: Was seit dem letzten Besuch dazugekommen ist, leuchtet.
    // Beim allerersten Besuch ist nichts «neu» – es ist einfach da.
    const ausbau = s?.wagenStufe?.(jetzt) || 0;
    offen.ausbauVorher = (() => {
      try { return localStorage.getItem(AUSBAU_GESEHEN_KEY) === null ? ausbau : gesehen(AUSBAU_GESEHEN_KEY); } catch { return ausbau; }
    })();
    const neues = (a.AUSBAU || []).slice(offen.ausbauVorher, ausbau).map((ding) => ding.name);

    // Der Wurm: Hat er sich seit dem letzten Besuch verwandelt, oder sind nur
    // Buchstaben dazugekommen? Beim allerersten Besuch steht er einfach da.
    const vorher = wurmGesehen() || (wurm ? { nr: wurm.nr, buchstaben } : null);
    const verwandelt = Boolean(wurm && vorher && wurm.nr > vorher.nr);
    const karte = (stufe, extra = {}) => (m ? { bild: m.bild, name: m.name, zu: m.zu, hat: stufe?.hat || 0, braucht: stufe?.braucht || 0, ...extra } : null);
    const wurmBild = (stufe, extra = {}) => (wurm ? { leben: stufe.leben, stufe: stufe.stufe, regal: stufe.regal, ...extra } : null);

    if (verwandelt && !reduziert()) {
      // Zuerst der Wurm, wie er war: Die letzten Buchstaben springen in die
      // Leiste, das Geschenk geht auf, er verschwindet. Der Lautsprecher
      // bleibt dabei da; was er sagt, kommt am Schluss.
      offen.laeuft = true;
      kids()?.setHelp?.(HILFE);
      const alt = s.wurmAus(vorher.buchstaben);
      const ort = lebenUndStufe(vorher.nr);
      const altStufe = { ...alt, leben: ort.leben, stufe: ort.stufe, regal: ort.leben, braucht: alt.nr === vorher.nr ? alt.braucht : (ort.stufe < 15 ? s.WURM_BEDARF[ort.stufe - 1] : s.WURM_WECHSEL) };
      const altHat = alt.nr === vorher.nr ? alt.hat : 0;
      baue({ wurm: wurmBild(altStufe), mission: karte(altStufe, { hat: altStufe.braucht, neuAb: altHat }), huepfen: false });
      await warte(300 + Math.max(0, altStufe.braucht - altHat) * FELD_MS);
      if (vorbei()) return;
      baue({ wurm: wurmBild(altStufe), mission: karte(altStufe, { hat: altStufe.braucht, geschenkAuf: true }), huepfen: false });
      await warte(GESCHENK_MS);
      if (vorbei()) return;
      baue({ wurm: wurmBild(altStufe, { weg: true }), mission: karte(altStufe, { hat: altStufe.braucht, geschenkAuf: true }), huepfen: false });
      await warte(WEG_MS);
      if (vorbei()) return;
    }
    // Der Wurm, wie er jetzt ist. Nach einer Verwandlung erscheint er mit
    // Sternen; ist dabei ein fertiger aufs Regal gezogen, funkelt der dort.
    const regalNeu = verwandelt && vorher && wurm && wurm.leben > lebenUndStufe(vorher.nr).leben;
    const neuAb = verwandelt ? 0 : wurm && vorher && wurm.nr === vorher.nr ? Math.max(0, wurm.hat - (buchstaben - vorher.buchstaben)) : Infinity;
    const svg = baue({
      // Ohne Bewegung kein Knall: Seine Sterne stünden sonst still um den Wurm.
      wurm: wurmBild(wurm || {}, { neu: verwandelt, knall: verwandelt && !reduziert(), regalNeu }),
      mission: karte(wurm, { neuAb }),
      huepfen: !verwandelt,
    });
    offen.laeuft = false;

    // Was der Lautsprecher sagt. Der Text gehört zur Ansicht: train-home.js
    // räumt ihn beim Verlassen weg.
    const teile = [];
    if (verwandelt) {
      kids()?.playJingle?.("unlock");
      const W = window.LernappLeseWurm;
      teile.push(regalNeu ? W?.LEBEN?.[wurm.leben - 1]?.wechsel || "" : `Überraschung! ${W?.sagt?.(wurm.leben, wurm.stufe, name) || ""}`);
    } else if (neues.length) {
      kids()?.playJingle?.("unlock");
    }
    if (!verwandelt && wurm && vorher && buchstaben > vorher.buchstaben && wurm.braucht > 0) {
      const dazu = buchstaben - vorher.buchstaben;
      teile.push(`${dazu === 1 ? "Ein neuer Buchstabe" : `${dazu} neue Buchstaben`} für ${name || "deinen Lesewurm"}!`);
    }
    if (neues.length) teile.push(`Neu im Lesewagen: ${neues.length > 1 ? `${neues.slice(0, -1).join(", ")} und ${neues[neues.length - 1]}` : neues[0]}!`);
    const satz = missionSatz(m, wurm, name);
    // Steht die Auswahl offen, gehört der Lautsprecher ihr – ausser es gibt
    // etwas Neues zu sagen.
    if (teile.length) kids()?.setHelp?.(`${teile.join(" ")} ${satz} ${HILFE}`);
    else if (!offen.host.querySelector(".lese-wahl")) kids()?.setHelp?.(`${satz} ${HILFE}`);
    if (wurm) merkeWurm(wurm, buchstaben);
    merkeGesehen(ausbau, AUSBAU_GESEHEN_KEY);
    offen.zustand = anfang;
    // Kam während der Verwandlung etwas aus der Cloud, jetzt nachholen.
    if (svg) auffrischen();
  }

  // Bringt die Cloud einen neueren Lesestand – gelesen auf einem anderen
  // Gerät –, frischt sich das Zimmer selbst auf.
  stand()?.onChange?.(() => auffrischen());

  window.LernappLeseecke = { mount, auffrischen, ZIELE, ORTE, HILFE, TAUFE, REIHUM, spieleAm };
})();
