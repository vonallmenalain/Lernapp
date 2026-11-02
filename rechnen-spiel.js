/*
 * rechnen-spiel.js – Was alle Spiele der Rechenecke gemeinsam haben.
 *
 * Ein Spiel meldet sich hier an (spiel({ id, titel, help, aufgabe })) und
 * schreibt nur, was in einer Aufgabe passiert. Alles andere kommt von hier:
 *
 *   Bühne      game-shell.js wie bei jedem Spiel; zurück geht es in den
 *              Rechenwagen (index.html?rechnen=1)
 *   «Los»      jede Runde beginnt mit einem Tipp – ein Browser lässt eine
 *              frisch geöffnete Seite nicht sprechen, und die Rechenecke
 *              braucht die Stimme: Wer noch nicht liest, hört die Aufgabe.
 *   Szene      ein Bild 1000 × 560 (wie der Rechenwagen), darunter die
 *              Sprechblase und die Antwort-Leiste mit grossen Zahlen
 *   Runde      fünf Aufgaben auf «leicht», sechs darüber. Keine Uhr, und ein
 *              Fehler kostet nichts: Jede Antwort wird vorgeführt.
 *   Ergebnis   Sterne, und so viele Taler für den Drachen; die Runde, die er
 *              vorgeschlagen hat, doppelt. Davon wächst das Spiel mit.
 *
 * Die Aufgaben selbst (3+2, 6-2) merkt sich der Rechenstand mit der Zeit, die
 * das Kind gebraucht hat – daraus wird die Plus-Tafel für die Eltern.
 */
(() => {
  "use strict";

  const shellApi = () => window.LernappGameShell || null;
  const stand = () => window.LernappRechenStand || null;
  const art = () => window.LernappRechenArt || null;
  const kids = () => window.LernappKids || null;

  const RECHENWAGEN = "index.html?rechnen=1";
  const FARBE = "#3d7be0";
  const FARBE_DUNKEL = "#2f63bd";
  const reduziert = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  // Ein Rätsel vom Rätsel-Knopf der Bauecke (train-bau.js, ?bau=1): Eine
  // fertige Runde bringt eine Palette Ziegel, und zurück geht es in die
  // Bauecke statt in den Rechenwagen.
  const ausBauecke = () => {
    try { return new URLSearchParams(window.location.search).get("bau") === "1"; } catch { return false; }
  };
  const BAUECKE = "index.html?bau=1";

  function zurueck() {
    window.location.href = ausBauecke() ? BAUECKE : RECHENWAGEN;
    return true;
  }

  function el(tag, klasse, text) {
    const node = document.createElement(tag);
    if (klasse) node.className = klasse;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // ---------------------------------------------------------------------------
  // Zeit und Bewegung
  // ---------------------------------------------------------------------------
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  //   roh  die Dauer gehört zur Aufgabe (ein Blitz), sie wird auch ohne
  //        Bewegung nicht kürzer
  function tween(ms, fn, { roh = false, kurve = ease } = {}) {
    const dauer = reduziert() && !roh ? Math.min(ms, 120) : ms;
    return new Promise((fertig) => {
      const t0 = performance.now();
      const schritt = (jetzt) => {
        const t = Math.min(1, (jetzt - t0) / Math.max(1, dauer));
        fn(kurve(t));
        if (t < 1) requestAnimationFrame(schritt); else fertig();
      };
      requestAnimationFrame(schritt);
    });
  }
  const warte = (ms) => new Promise((fertig) => window.setTimeout(fertig, ms));
  const setPos = (node, x, y) => node?.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  function mische(liste) {
    const kopie = [...liste];
    for (let i = kopie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    }
    return kopie;
  }

  // ---------------------------------------------------------------------------
  // Ton und Stimme
  // ---------------------------------------------------------------------------
  function tonAn() {
    const k = kids();
    return k?.audioEnabled ? k.audioEnabled() : true;
  }
  function stimmeAn() {
    const k = kids();
    if (!tonAn() || !k?.speak) return false;
    return k.ttsEnabled ? k.ttsEnabled() : true;
  }
  // Das Klacken beim Kuppeln: ein kurzes Rauschen und ein tiefer Schlag.
  let audio = null;
  function klack() {
    if (!tonAn()) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const a = audio;
      const len = 0.07;
      const buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i += 1) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const src = a.createBufferSource();
      src.buffer = buf;
      const f = a.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 1.2;
      const g = a.createGain();
      g.gain.value = 0.35;
      src.connect(f).connect(g).connect(a.destination);
      src.start();
    } catch { /* ohne Ton */ }
  }
  const jingle = (name) => { if (tonAn()) kids()?.playJingle?.(name); };
  function blip(i = 0) {
    if (!tonAn()) return;
    const k = kids();
    if (k?.playStarSound) k.playStarSound(i % 3);
  }

  // ---------------------------------------------------------------------------
  // Die Spiele
  // ---------------------------------------------------------------------------
  /*
   * Ein Spiel meldet sich an. Nur das Spiel, dessen Seite offen ist
   * (body data-page), startet.
   *
   *   id        Kennung im Rechenstand und Seite (id.html)
   *   titel     wie es heisst
   *   help      was der Lautsprecher oben links sagt
   *   intro     was die Stimme nach «Los» einmal sagt
   *   aufgaben  wie viele Aufgaben eine Runde hat: Zahl oder (stufe) => Zahl
   *   aufgabe   async (ctx) => true/false: eine Aufgabe, richtig oder nicht
   *   runde     statt aufgabe: async (ctx) => { punkte, von }: die ganze
   *             Runde in einem (ein Brettspiel, ein Haus)
   */
  function spiel(def) {
    if (!def || document.body?.dataset.page !== def.id) return;
    const host = document.querySelector("#rechen-stage");
    if (!host || !shellApi() || !art() || !stand()) return;
    const start = () => starte(host, def);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }

  function starte(host, def) {
    let token = 0;
    const shell = shellApi().mount({
      host,
      title: def.titel,
      area: "rechnen",
      accent: FARBE,
      accentDark: FARBE_DUNKEL,
      help: def.help,
      clock: false,
      onRestart: () => los(),
      onBack: zurueck,
    });
    host.classList.add("rechen-buehne");
    stand().spielGeoeffnet(def.id);

    function los() {
      token += 1;
      kids()?.stopSpeaking?.();
      shell.clear();
      shell.setPhase("intro");
      const karte = el("div", "rechen-los");
      const kopf = art().svg(`<svg viewBox="-96 -180 120 120" class="rechen-los-drache" aria-hidden="true">${art().dracheNurKopf(stand().drache().id)}</svg>`);
      const titel = el("p", "rechen-los-titel", def.titel);
      const knopf = el("button", "rechen-los-knopf");
      knopf.type = "button";
      knopf.setAttribute("aria-label", "Los geht's!");
      knopf.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#3fbf74"/><polygon points="19,14 35,24 19,34" fill="#fff"/></svg>`;
      const stufe = stand().stufe(def.id);
      const stufeText = el("p", "rechen-los-stufe", { leicht: "leicht", mittel: "mittel", schwer: "schwer" }[stufe] || stufe);
      karte.append(kopf, titel, knopf, stufeText);
      shell.play.append(karte);
      knopf.addEventListener("click", () => {
        if (knopf.disabled) return;
        knopf.disabled = true;
        runde(++token);
      }, { once: true });
      window.setTimeout(() => knopf.focus?.({ preventScroll: true }), 50);
    }

    async function runde(meinToken) {
      const lebt = () => meinToken === token;
      shell.clear();
      shell.setPhase("play");
      const stufe = stand().stufe(def.id);
      const bau = el("div", "rechen-spielflaeche");
      const szeneHuelle = el("div", "rechen-szene-huelle");
      const szene = el("div", "rechen-szene");
      const svg = art().svg(`<svg viewBox="0 0 1000 560" class="rechen-szene-svg" role="img" aria-label="${def.titel}"></svg>`);
      szene.append(svg);
      szeneHuelle.append(szene);
      const unten = el("div", "rechen-unten");
      const blase = el("div", "rechen-blase");
      const kopf = art().svg(`<svg viewBox="-96 -180 120 120" class="rechen-blase-drache" aria-hidden="true">${art().dracheNurKopf(stand().drache().id)}</svg>`);
      const text = el("p", "rechen-blase-text");
      text.setAttribute("aria-live", "polite");
      blase.append(kopf, text);
      const punkte = el("div", "rechen-punkte");
      punkte.setAttribute("aria-hidden", "true");
      const leiste = el("div", "rechen-antworten");
      unten.append(blase, leiste);
      bau.append(punkte, szeneHuelle, unten);
      shell.play.append(bau);

      const n = typeof def.aufgaben === "function" ? def.aufgaben(stufe) : (def.aufgaben || (stufe === "leicht" ? 5 : 6));
      const lauf = { nr: 0, n, richtig: 0, used: new Set(), stufe };
      const punkteZeichnen = () => {
        punkte.innerHTML = "";
        if (!def.aufgabe) return;
        for (let i = 0; i < lauf.n; i += 1) punkte.append(el("i", i < lauf.nr ? "is-fertig" : i === lauf.nr ? "is-jetzt" : ""));
      };

      // Was eine Aufgabe zur Hand hat.
      const ctx = {
        art: art(), stand: stand(), stufe, lauf, svg, kids: kids(),
        deckel: stand().deckel(), minus: stand().minusErlaubt(),
        lebt, tween, warte, setPos, rnd, mische, klack, jingle, blip,
        reduziert: reduziert(),
        zeichne(inhalt) { svg.innerHTML = `${art().DEFS}${inhalt}`; },
        q: (sel) => svg.querySelector(sel),
        // Zieht eine Aufgabe, die in dieser Runde noch nicht kam.
        ziehe(gen) {
          let t = null;
          let ersatz = null;
          for (let k = 0; k < 400; k += 1) {
            t = gen();
            if (!t) continue;
            ersatz = ersatz || t;
            if (!lauf.used.has(t.key)) { lauf.used.add(t.key); return t; }
          }
          // Alle schon dagewesen: dann eben eine Wiederholung.
          return ersatz;
        },
        // Sagt etwas: in der Sprechblase und mit der Stimme. Wartet, bis es
        // gesagt ist (höchstens so lange, wie es dauern sollte).
        sage(satz, gesprochen = null) {
          text.textContent = satz;
          if (!lebt()) return Promise.resolve();
          if (!stimmeAn()) return warte(Math.min(2200, 500 + satz.length * 25));
          return new Promise((fertig) => {
            let fertigGesagt = false;
            const ende = () => { if (!fertigGesagt) { fertigGesagt = true; fertig(); } };
            window.setTimeout(ende, 1600 + satz.length * 90);
            try { kids().speak(gesprochen || sprechbar(satz), { onEnd: ende }); } catch { ende(); }
          });
        },
        zeige(satz) { text.textContent = satz; },
        // Die Antwort-Leiste. werte: die Zahlen zur Wahl (sonst lo bis hi).
        // aufgabe { a, op, b }: wird mit Zeit und Fehlerbild gemerkt.
        frage({ lo = 1, hi = 10, werte = null, richtig, aufgabe = null }) {
          return new Promise((fertig) => {
            leiste.innerHTML = "";
            leiste.classList.remove("ist-zu");
            let liste = werte || [];
            if (!werte) {
              if (hi - lo + 1 <= 11) for (let v = lo; v <= hi; v += 1) liste.push(v);
              else liste = auswahl(richtig, lo, hi);
            }
            leiste.dataset.anzahl = String(liste.length);
            const t0 = performance.now();
            liste.forEach((v) => {
              const b = el("button", "rechen-zahl", String(v));
              b.type = "button";
              b.dataset.wert = String(v);
              b.addEventListener("click", () => {
                if (!lebt() || leiste.classList.contains("ist-zu")) return;
                leiste.classList.add("ist-zu");
                const ok = v === richtig;
                const ms = performance.now() - t0;
                b.classList.add(ok ? "ist-richtig" : "ist-daneben");
                if (!ok) leiste.querySelector(`[data-wert="${richtig}"]`)?.classList.add("ist-loesung");
                jingle(ok ? "correct" : "retry");
                if (ok) lauf.richtig += 1;
                if (aufgabe) {
                  const s = stand();
                  s.aufgabeGeuebt(s.aufgabeKey(aufgabe.a, aufgabe.op, aufgabe.b), ok, ms);
                  if (!ok) {
                    const bild = s.fehlerVon({ a: aufgabe.a, b: aufgabe.b, op: aufgabe.op, richtig, antwort: v });
                    if (bild) s.fehlerbild(bild);
                  }
                }
                fertig({ ok, antwort: v, ms });
              });
              leiste.append(b);
            });
            window.setTimeout(() => leiste.querySelector("button")?.focus?.({ preventScroll: true }), 30);
          });
        },
        // Eine Wahl ohne Zahlen: Knöpfe in der Leiste (Text oder Bild) und/oder
        // Dinge in der Szene, die sich antippen lassen.
        //   knoepfe  [{ wert, text, html, label }]
        //   ziele    [{ el, wert }] – Elemente im Bild
        waehle({ knoepfe = [], ziele = [], richtig }) {
          return new Promise((fertig) => {
            leiste.innerHTML = "";
            leiste.classList.remove("ist-zu");
            leiste.dataset.anzahl = String(knoepfe.length);
            const t0 = performance.now();
            let vorbei = false;
            const markiere = (wert, ok) => {
              leiste.querySelectorAll("[data-wert]").forEach((b) => {
                if (b.dataset.wert === String(wert)) b.classList.add(ok ? "ist-richtig" : "ist-daneben");
                if (!ok && b.dataset.wert === String(richtig)) b.classList.add("ist-loesung");
              });
              ziele.forEach(({ el: z, wert: w }) => {
                if (String(w) === String(wert)) z.classList.add(ok ? "rw-ziel-richtig" : "rw-ziel-daneben");
                if (!ok && String(w) === String(richtig)) z.classList.add("rw-ziel-loesung");
              });
            };
            const gewaehlt = (wert) => {
              if (vorbei || !lebt()) return;
              vorbei = true;
              leiste.classList.add("ist-zu");
              ziele.forEach(({ el: z }) => z.classList.remove("rw-ziel"));
              const ok = String(wert) === String(richtig);
              markiere(wert, ok);
              jingle(ok ? "correct" : "retry");
              if (ok) lauf.richtig += 1;
              fertig({ ok, antwort: wert, ms: performance.now() - t0 });
            };
            knoepfe.forEach((k) => {
              const b = el("button", "rechen-wahlknopf");
              b.type = "button";
              b.dataset.wert = String(k.wert);
              if (k.html) b.innerHTML = k.html; else b.textContent = k.text;
              if (k.label) b.setAttribute("aria-label", k.label);
              b.addEventListener("click", () => gewaehlt(k.wert));
              leiste.append(b);
            });
            ziele.forEach(({ el: z, wert }) => {
              z.classList.add("rw-ziel");
              z.setAttribute("role", "button");
              z.setAttribute("tabindex", "0");
              z.addEventListener("click", () => gewaehlt(wert));
              z.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); gewaehlt(wert); } });
            });
            window.setTimeout(() => leiste.querySelector("button")?.focus?.({ preventScroll: true }), 30);
          });
        },
        // Ein einzelner Knopf in der Leiste («Fertig», «Bezahlen»).
        aktion({ text, icon = "haken" }) {
          return new Promise((fertig) => {
            leiste.innerHTML = "";
            leiste.classList.remove("ist-zu");
            const b = el("button", "rechen-wurf rechen-aktion");
            b.type = "button";
            const bildchen = icon === "wuerfel"
              ? `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ffffff" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="8" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="16" cy="16" r="1.8" fill="currentColor"/></svg>`
              : `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ffffff"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            b.innerHTML = `${bildchen}<span></span>`;
            b.querySelector("span").textContent = text;
            b.addEventListener("click", () => { if (b.disabled || !lebt()) return; b.disabled = true; leiste.innerHTML = ""; fertig(true); }, { once: true });
            leiste.append(b);
            window.setTimeout(() => b.focus?.({ preventScroll: true }), 30);
          });
        },
        leereLeiste() { leiste.innerHTML = ""; },
        // Zählt Dinge der Reihe nach: eine Zahl über jedem, ein heller Ton.
        //   orte  [{ g, x, y }] – wohin die Zahl kommt (g: die Gruppe)
        async zaehle(orte, schritt = 260) {
          for (let k = 0; k < orte.length; k += 1) {
            if (!lebt()) return false;
            const { g, x, y } = orte[k];
            g.insertAdjacentHTML("beforeend", art().zahlMarke(x, y, k + 1));
            blip(k);
            await warte(reduziert() ? Math.min(schritt, 120) : schritt);
          }
          return true;
        },
        // Die Wagen einer Zuggruppe, gezählt von der Lok weg.
        wagenOrte(g) {
          return [...g.querySelectorAll(".rw-wagen")].sort((x, y) => Number(x.dataset.i) - Number(y.dataset.i))
            .map((w) => ({ g: w.parentNode, x: Number(w.dataset.bx), y: Number(w.dataset.by) - 22, w }));
        },
      };

      if (def.intro) await ctx.sage(def.intro);
      if (!lebt()) return;

      let ergebnisWerte = null;
      if (def.runde) {
        ergebnisWerte = await def.runde(ctx);
      } else {
        for (lauf.nr = 0; lauf.nr < lauf.n; lauf.nr += 1) {
          punkteZeichnen();
          leiste.innerHTML = "";
          await def.aufgabe(ctx);
          if (!lebt()) return;
          await warte(1400);
          if (!lebt()) return;
        }
        punkteZeichnen();
        ergebnisWerte = { punkte: lauf.richtig, von: lauf.n };
      }
      if (!lebt() || !ergebnisWerte) return;
      ergebnis(shell, def, ergebnisWerte);
    }

    los();
  }

  // Vier Zahlen zur Wahl, wenn es zu viele wären: die richtige und drei nahe.
  function auswahl(richtig, lo, hi) {
    const set = new Set([richtig]);
    const naehe = mische([-1, 1, -2, 2, 10, -10, 3, -3]);
    for (const d of naehe) {
      if (set.size >= 4) break;
      const v = richtig + d;
      if (v >= lo && v <= hi) set.add(v);
    }
    return [...set].sort((x, y) => x - y);
  }

  // Was die Stimme liest: Rechenzeichen als Wörter.
  function sprechbar(satz) {
    return String(satz)
      .replace(/(\d)\s*\+\s*(\d)/g, "$1 plus $2")
      .replace(/(\d)\s*[−-]\s*(\d)/g, "$1 minus $2")
      .replace(/=\s*\?/g, "gleich?")
      .replace(/\s=\s/g, " gleich ");
  }

  // Drei Sterne für alles richtig, zwei ab drei Vierteln, sonst einer.
  function sterne(punkte, von) {
    if (!von) return 1;
    if (punkte >= von) return 3;
    if (punkte >= Math.ceil(von * 0.75)) return 2;
    return 1;
  }

  function ergebnis(shell, def, { punkte, von, detail = null, speech = null, stars = null }) {
    const s = stand();
    const vorher = s.drache();
    const sternZahl = stars ?? sterne(punkte, von);
    s.spielRunde(def.id, { punkte, sterne: sternZahl });
    const extra = s.missionErfuellt(def.id, sternZahl);
    const nachher = s.drache();
    const taler = sternZahl + extra;
    const name = s.dracheName() || "";
    let notiz = `+${taler} ${taler === 1 ? "Taler" : "Taler"} für ${name || "deinen Drachen"}${extra ? " – doppelt, weil er es vorgeschlagen hat" : ""}.`;
    let satz = ` ${taler === 1 ? "Ein Taler" : `${taler} Taler`} für deinen Drachen!`;
    if (nachher.nr > vorher.nr) {
      notiz = `${name || "Dein Drache"} hat eine Überraschung für dich – schau im Rechenwagen nach!`;
      satz = " Dein Drache hat eine Überraschung für dich – schau im Rechenwagen nach!";
    }
    // Je Seitenaufruf nur eine Palette (journey-plan.js, bauGeschafft).
    if (ausBauecke() && window.LernappReise?.bauGeschafft?.()?.neu) {
      notiz = `Geschafft! Der Zug bringt dir Ziegel für ein neues Stockwerk. ${notiz}`;
      satz = `${satz} Der Zug bringt dir Ziegel für ein neues Stockwerk. Tippe auf den Pfeil, und es geht zurück in die Bauecke.`;
    }
    jingle(sternZahl === 3 ? "win" : "correct");
    shell.showResult({
      label: "Geschafft!",
      stars: sternZahl,
      detail: detail || `${punkte} von ${von} richtig`,
      scores: null,
      note: { text: notiz, done: true },
      speech: `${speech || `${punkte} von ${von} richtig.`}${satz}`,
      onBack: zurueck,
    });
  }

  window.LernappRechenSpiel = { RECHENWAGEN, FARBE, spiel, sterne, zurueck, tween, warte, setPos, rnd, mische, sprechbar, auswahl };
})();
