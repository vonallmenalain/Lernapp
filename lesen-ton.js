/*
 * lesen-ton.js – Was die Leseecke hören lässt: Laute, Wörter, Sätze.
 *
 * Zwei Quellen:
 *
 *   Aufnahmen       Die Laute einer echten Stimme (lesen-laute.js). Nur sie
 *                   können ein «mmm» oder ein «sch» – die Sprachausgabe sagt
 *                   bei einem einzelnen Buchstaben seinen Namen («Em»), und
 *                   genau den soll ein Kind beim Lesenlernen nicht hören.
 *   Sprachausgabe   Alles andere: Wörter, Silben, Sätze, Bücher. Das kann sie
 *                   gut, und es braucht nichts herunterzuladen.
 *
 * Feste Texte – die Sätze eines Buches, seine Fragen – können ausserdem als
 * Aufnahme mit derselben Stimme wie die Laute vorliegen (lesen-stimme.js).
 * Dann spielt sprich() die Aufnahme statt der Sprachausgabe; wie, steht in
 * kids.js (aufnahmeStuecke, aufnahmeFolge). Ein Wort leuchtet dabei nicht
 * einzeln mit – es leuchtet der ganze Satz.
 *
 * Fehlt die Aufnahme eines Lautes, spricht die Sprachausgabe ihn nur, wenn sie
 * es richtig kann (Selbstlaute, Zwielaute: «a», «ei»). Sonst bleibt er stumm,
 * und laut() meldet das zurück – das Spiel zeigt ihn dann, statt ihn falsch zu
 * sagen.
 *
 * Gesprochen wird nur nach einem Tipp: Ein Browser lässt eine Seite nicht von
 * selbst sprechen, bevor jemand sie berührt hat, und die App liest ohnehin nie
 * ungefragt vor. Ein Hörspiel beginnt deshalb immer mit einem Tipp auf «Los».
 *
 * Der Ton-Schalter oben rechts gilt auch hier: stumm ist stumm.
 */
(() => {
  "use strict";

  const kids = () => window.LernappKids || null;
  const inhalte = () => window.LernappLeseInhalte || null;

  function tonAn() {
    const k = kids();
    return k?.audioEnabled ? k.audioEnabled() : true;
  }

  function stimmeAn() {
    const k = kids();
    if (!tonAn()) return false;
    return k?.ttsEnabled ? k.ttsEnabled() : true;
  }

  function sprachausgabe() {
    return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  }

  // Dieselbe Stimme wie der Lautsprecher der App (kids.js, pickGermanVoice):
  // die im Profil gewählte oder die natürlichste deutsche des Geräts. Nur
  // ohne kids.js sucht die Leseecke selbst eine deutsche.
  function deutscheStimme() {
    if (!sprachausgabe()) return null;
    const k = kids();
    if (k?.pickGermanVoice) return k.pickGermanVoice();
    const alle = window.speechSynthesis.getVoices() || [];
    return alle.find((v) => /^de([-_]|$)/i.test(v.lang || "")) || null;
  }

  // ---------------------------------------------------------------------------
  // Aufnahmen
  // ---------------------------------------------------------------------------
  // lesen-laute.js trägt sie als { id: "data:audio/…" }. Die Datei ist da,
  // auch wenn sie noch leer ist – sonst stünde in jeder Konsole ein Fehler.
  function aufnahme(id) {
    const alle = window.LernappLauteAufnahmen || {};
    const quelle = alle[id];
    return typeof quelle === "string" && quelle ? quelle : null;
  }

  function hatAufnahme(id) { return Boolean(aufnahme(id)); }

  let laufend = null;   // das Audio-Element, das gerade spielt
  let folge = 0;        // jede neue Ausgabe macht ältere ungültig

  function stop() {
    folge += 1;
    if (laufend) { try { laufend.pause(); } catch { /* egal */ } laufend = null; }
    kids()?.aufnahmeStopp?.();
    if (sprachausgabe()) { try { window.speechSynthesis.cancel(); } catch { /* egal */ } }
  }

  function spieleDatei(quelle) {
    return new Promise((fertig) => {
      try {
        const audio = new Audio(quelle);
        laufend = audio;
        const ende = () => { if (laufend === audio) laufend = null; fertig(true); };
        audio.addEventListener("ended", ende);
        audio.addEventListener("error", () => { if (laufend === audio) laufend = null; fertig(false); });
        const versuch = audio.play();
        if (versuch?.catch) versuch.catch(() => fertig(false));
      } catch { fertig(false); }
    });
  }

  // ---------------------------------------------------------------------------
  // Sprachausgabe
  // ---------------------------------------------------------------------------
  //   rate    langsamer für Silben und Leseanfänger
  //   onWord  (index) => …, für das Mitleuchten der Wörter. Nur wo der Browser
  //           Wortgrenzen meldet; Chrome auf Android tut das nicht – dann
  //           leuchtet der ganze Satz (siehe lesebuch: satzweise sprechen).
  //   pitch   1: keine künstlich höhere Stimme – sie macht natürliche Stimmen
  //           hölzern
  // Gibt es den Text als Aufnahme (lesen-stimme.js), spielt sie; rate, pitch
  // und onWord gelten dann nur für Teile, die die Sprachausgabe spricht.
  function sprich(text, { rate = 0.9, pitch = 1, onWord = null, warteschlange = false } = {}) {
    if (!text || !stimmeAn()) return Promise.resolve(false);
    const k = kids();
    const stuecke = k?.aufnahmeStuecke ? k.aufnahmeStuecke(text) : [];
    if (!stuecke.some((stueck) => stueck.datei)) return sprichGeraet(text, { rate, pitch, onWord, warteschlange });
    if (!warteschlange) stop();
    const meine = folge;
    return k.aufnahmeFolge(stuecke, {
      geraet: (teil, versatz) => sprichGeraet(teil, {
        rate, pitch, warteschlange: true, onWord: onWord ? (nr) => onWord(nr + versatz) : null,
      }),
    }).then((ok) => ok && meine === folge);
  }

  // Die Sprachausgabe des Geräts.
  function sprichGeraet(text, { rate = 0.9, pitch = 1, onWord = null, warteschlange = false } = {}) {
    return new Promise((fertig) => {
      if (!text || !sprachausgabe() || !stimmeAn()) { fertig(false); return; }
      if (!warteschlange) stop();
      const meine = folge;
      try {
        const u = new window.SpeechSynthesisUtterance(String(text));
        const v = deutscheStimme();
        u.lang = v?.lang || "de-DE";
        u.rate = rate;
        u.pitch = pitch;
        if (v) u.voice = v;
        if (onWord) {
          // Aus der Zeichenstelle wird die Nummer des Wortes: gezählt werden
          // die Wortanfänge bis dorthin.
          const anfaenge = [];
          String(text).replace(/\S+/g, (wort, stelle) => { anfaenge.push(stelle); return wort; });
          u.addEventListener("boundary", (ereignis) => {
            if (ereignis.name && ereignis.name !== "word") return;
            const stelle = ereignis.charIndex;
            let nr = 0;
            while (nr + 1 < anfaenge.length && anfaenge[nr + 1] <= stelle) nr += 1;
            if (meine === folge) onWord(nr);
          });
        }
        let erledigt = false;
        const ende = (ok) => { if (erledigt) return; erledigt = true; fertig(ok && meine === folge); };
        u.addEventListener("end", () => ende(true));
        u.addEventListener("error", () => ende(false));
        window.speechSynthesis.speak(u);
        // Manche Browser melden das Ende nie (Safari nach dem Sperrbildschirm).
        // Nach einer grosszügigen Frist gilt die Ausgabe als fertig.
        window.setTimeout(() => ende(true), 1500 + String(text).length * 140);
      } catch { fertig(false); }
    });
  }

  const pause = (ms) => new Promise((weiter) => window.setTimeout(weiter, ms));

  // Mehrere Stücke nacheinander, mit Luft dazwischen: «Ba – na – ne».
  async function sprichFolge(teile, { abstand = 260, rate = 0.8 } = {}) {
    stop();
    const meine = folge;
    for (const teil of teile) {
      if (meine !== folge) return false;
      await sprich(teil, { rate, warteschlange: true });
      if (meine !== folge) return false;
      await pause(abstand);
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Ein Laut
  // ---------------------------------------------------------------------------
  // true: er war zu hören. false: keine Aufnahme, und die Sprachausgabe kann
  // ihn nicht richtig sagen – das Spiel zeigt ihn dann nur.
  async function laut(id) {
    if (!tonAn()) return false;
    const quelle = aufnahme(id);
    if (quelle) {
      stop();
      return spieleDatei(quelle);
    }
    const eintrag = inhalte()?.LAUT_BY_ID?.[id];
    if (eintrag?.stimme) return sprich(eintrag.stimme, { rate: 0.75 });
    return false;
  }

  // Kann dieser Laut hörbar werden – als Aufnahme oder richtig gesprochen?
  function lautHoerbar(id) {
    if (hatAufnahme(id)) return true;
    return Boolean(inhalte()?.LAUT_BY_ID?.[id]?.stimme);
  }

  // Ein kurzes, weiches Klopfen: wenn ein stummer Laut angetippt wurde, hört
  // das Kind wenigstens, dass der Tipp angekommen ist.
  let ctx = null;
  function klopf(freq = 520) {
    if (!tonAn()) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      if (!ctx) ctx = new AC();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch { /* ohne Ton */ }
  }

  window.addEventListener("pagehide", stop);

  window.LernappLeseTon = {
    laut, lautHoerbar, hatAufnahme, sprich, sprichFolge, stop, klopf, tonAn, stimmeAn, pause,
  };
})();
