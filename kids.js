/*
 * kids.js – Gemeinsame Kinder-Funktionen für die Lernapp.
 * Wird auf jeder Seite vor app.js geladen und stellt window.LernappKids bereit:
 * Sterne, Tagesziel, Profil, Vorlesen (TTS), Maskottchen, Konfetti, Töne.
 * Bewusst ohne Framework und defensiv (localStorage kann fehlschlagen).
 */
(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Speicher-Helfer
  // ---------------------------------------------------------------------------
  const KEYS = {
    stars: (game, levelId) => `lernapp.stars.${game}.${levelId}`,
    daily: "lernapp.daily",
    profile: "lernapp.profile",
    tts: "lernapp.tts",
    lastPlayed: "lernapp.lastPlayed",
    tutorial: (game) => `lernapp.tut.${game}`,
  };

  function readRaw(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function writeRaw(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore quota/private mode */ }
  }
  function readJSON(key, fallback) {
    const raw = readRaw(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }
  function writeJSON(key, value) { writeRaw(key, JSON.stringify(value)); }

  function todayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  // ---------------------------------------------------------------------------
  // Sterne pro Level (1–3)
  // ---------------------------------------------------------------------------
  function getStars(game, levelId) {
    const raw = readRaw(KEYS.stars(game, levelId));
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? Math.min(3, value) : 0;
  }
  function setStars(game, levelId, stars) {
    const clamped = Math.max(1, Math.min(3, Math.round(stars)));
    const previous = getStars(game, levelId);
    if (clamped > previous) writeRaw(KEYS.stars(game, levelId), String(clamped));
    return { stars: clamped, improved: clamped > previous, previous };
  }

  // ---------------------------------------------------------------------------
  // Tagesziel
  // ---------------------------------------------------------------------------
  const DAILY_GOAL = 3;
  function dailyRecord() {
    const record = readJSON(KEYS.daily, {});
    return record && typeof record === "object" ? record : {};
  }
  function recordDailySolve() {
    const record = dailyRecord();
    const key = todayKey();
    record[key] = (Number(record[key]) || 0) + 1;
    // Alte Tage aufräumen (nur die letzten 14 behalten).
    const keys = Object.keys(record).sort();
    while (keys.length > 14) delete record[keys.shift()];
    writeJSON(KEYS.daily, record);
    return dailyProgress();
  }
  function dailyProgress() {
    const count = Number(dailyRecord()[todayKey()]) || 0;
    return { count, goal: DAILY_GOAL, done: count >= DAILY_GOAL };
  }
  function weeklyProgress() {
    const record = dailyRecord();
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ key, weekday: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()], count: Number(record[key]) || 0 });
    }
    return days;
  }

  // ---------------------------------------------------------------------------
  // Profil (Avatar + Altersgruppe)
  // ---------------------------------------------------------------------------
  const AVATARS = ["🦊", "🐰", "🐻", "🐼", "🐯", "🦁", "🐶", "🐱", "🐵", "🐨", "🦄", "🐸"];
  function getProfile() {
    const profile = readJSON(KEYS.profile, null);
    if (profile && typeof profile === "object" && profile.avatar) return profile;
    return null;
  }
  function saveProfile(profile) {
    if (!profile || !profile.avatar) return;
    writeJSON(KEYS.profile, { avatar: profile.avatar, age: profile.age === "young" ? "young" : "older", name: profile.name || "" });
  }
  function isYoung() { return getProfile()?.age === "young"; }

  // ---------------------------------------------------------------------------
  // Vorlesen (Web Speech API)
  // ---------------------------------------------------------------------------
  function ttsSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  }
  function ttsEnabled() {
    const setting = readRaw(KEYS.tts);
    if (setting === "0" || setting === "false" || setting === "off") return false;
    if (setting === "1" || setting === "true" || setting === "on") return true;
    // Standard: an für kleine Kinder, sonst auch an (Ton lässt sich abschalten).
    return true;
  }
  function setTtsEnabled(enabled) {
    writeRaw(KEYS.tts, enabled ? "1" : "0");
    if (!enabled) stopSpeaking();
  }
  let germanVoice = null;
  function pickGermanVoice() {
    if (!ttsSupported()) return null;
    if (germanVoice) return germanVoice;
    const voices = window.speechSynthesis.getVoices() || [];
    germanVoice = voices.find((v) => /de[-_]/i.test(v.lang) && /female|frau|petra|anna|marlene|google/i.test(v.name))
      || voices.find((v) => /de[-_]/i.test(v.lang))
      || null;
    return germanVoice;
  }
  if (ttsSupported() && typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", () => { germanVoice = null; pickGermanVoice(); });
  }
  function stopSpeaking() {
    if (ttsSupported()) { try { window.speechSynthesis.cancel(); } catch { /* ignore */ } }
  }
  // Wichtig: speak() wird ausschliesslich aus einem Klick auf einen
  // Lautsprecher-Knopf heraus aufgerufen. Die App liest nie von selbst vor.
  function speak(text, options = {}) {
    if (!text || !ttsSupported() || !ttsEnabled()) { options.onEnd?.(); return; }
    if (!options.queue) stopSpeaking();
    try {
      const utterance = new window.SpeechSynthesisUtterance(String(text));
      utterance.lang = "de-DE";
      utterance.rate = options.rate ?? (isYoung() ? 0.85 : 0.95);
      utterance.pitch = options.pitch ?? 1.15;
      const voice = pickGermanVoice();
      if (voice) utterance.voice = voice;
      if (options.onEnd) {
        utterance.addEventListener("end", () => options.onEnd());
        utterance.addEventListener("error", () => options.onEnd());
      }
      window.speechSynthesis.speak(utterance);
    } catch { options.onEnd?.(); }
  }

  // ---------------------------------------------------------------------------
  // Maskottchen "Fino" der Fuchs (Inline-SVG, verschiedene Posen)
  // ---------------------------------------------------------------------------
  function mascotSVG(pose = "happy") {
    const eyes = pose === "sad"
      ? '<circle cx="42" cy="60" r="4.5"/><circle cx="78" cy="60" r="4.5"/>'
      : pose === "think"
        ? '<circle cx="42" cy="58" r="5"/><circle cx="80" cy="56" r="5"/>'
        : '<circle cx="42" cy="58" r="5.5"/><circle cx="78" cy="58" r="5.5"/><circle cx="44" cy="56" r="1.8" fill="#fff"/><circle cx="80" cy="56" r="1.8" fill="#fff"/>';
    const mouth = pose === "sad"
      ? '<path d="M48 82 Q60 74 72 82" fill="none" stroke="#5a3210" stroke-width="3" stroke-linecap="round"/>'
      : pose === "cheer"
        ? '<path d="M46 76 Q60 96 74 76 Q60 84 46 76 Z" fill="#e8607a"/>'
        : '<path d="M48 78 Q60 90 72 78" fill="none" stroke="#5a3210" stroke-width="3" stroke-linecap="round"/>';
    const cheeks = '<circle cx="34" cy="72" r="6" fill="#ffb0a0" opacity="0.7"/><circle cx="86" cy="72" r="6" fill="#ffb0a0" opacity="0.7"/>';
    const arm = pose === "cheer" || pose === "wave"
      ? '<path d="M92 66 Q106 54 104 40" fill="none" stroke="#f08a3c" stroke-width="9" stroke-linecap="round"/>'
      : '';
    return `
      <svg class="mascot mascot-${pose}" viewBox="0 0 120 120" role="img" aria-label="Fino der Fuchs" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 34 L40 52 L26 58 Z" fill="#f08a3c"/>
        <path d="M98 34 L80 52 L94 58 Z" fill="#f08a3c"/>
        <path d="M27 40 L38 51 L31 54 Z" fill="#ffd8bf"/>
        <path d="M93 40 L82 51 L89 54 Z" fill="#ffd8bf"/>
        <ellipse cx="60" cy="66" rx="40" ry="38" fill="#f5933f"/>
        <path d="M60 40 Q34 52 40 84 Q60 96 80 84 Q86 52 60 40 Z" fill="#fff3e6"/>
        ${cheeks}
        <g fill="#3a2412">${eyes}</g>
        <ellipse cx="60" cy="76" rx="6" ry="4.5" fill="#3a2412"/>
        ${mouth}
        ${arm}
      </svg>`;
  }

  // ---------------------------------------------------------------------------
  // Konfetti
  // ---------------------------------------------------------------------------
  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  const CONFETTI_COLORS = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#8338ec", "#ff9f1c", "#ff5da2"];
  function burstConfetti(target, count) {
    if (prefersReducedMotion()) return;
    const host = target || document.body;
    if (!host) return;
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    layer.setAttribute("aria-hidden", "true");
    const total = count || 42;
    for (let i = 0; i < total; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      const angle = (Math.random() * 140 - 70);
      const distance = 120 + Math.random() * 220;
      piece.style.setProperty("--dx", `${Math.sin((angle * Math.PI) / 180) * distance}px`);
      piece.style.setProperty("--dy", `${-Math.abs(Math.cos((angle * Math.PI) / 180)) * distance - 40}px`);
      piece.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
      piece.style.setProperty("--delay", `${Math.random() * 0.25}s`);
      piece.style.setProperty("--dur", `${1 + Math.random() * 0.8}s`);
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      if (i % 3 === 0) piece.style.borderRadius = "50%";
      layer.append(piece);
    }
    host.append(layer);
    window.setTimeout(() => layer.remove(), 2600);
  }

  // ---------------------------------------------------------------------------
  // Töne, Jingles + Vibration
  // ---------------------------------------------------------------------------
  // Alle Seiten teilen sich diesen Klang-Baukasten, damit sich richtige Antworten
  // überall gleich anhören. Der globale Ton-Schalter (Lautsprecher oben rechts)
  // liegt unter demselben Schlüssel wie in app.js.
  const AUDIO_KEY = "lernapp.audioFeedback";
  let audioContext = null;
  function audioEnabled() {
    const setting = readRaw(AUDIO_KEY);
    return setting !== "0" && setting !== "false" && setting !== "off";
  }
  function setAudioEnabled(enabled) {
    writeRaw(AUDIO_KEY, enabled ? "1" : "0");
    if (!enabled && audioContext?.state === "running") audioContext.suspend().catch(() => {});
    if (!enabled) stopSpeaking();
  }
  function ensureAudio() {
    if (!audioEnabled()) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      if (!audioContext) audioContext = new AC();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      return audioContext;
    } catch { return null; }
  }
  function tone(freq, start, duration, type = "sine", volume = 0.05) {
    const ctx = ensureAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.03);
    } catch { /* ignore */ }
  }
  // Ein "Glockenton": Grundton plus leiser Oberton, damit es nach Xylophon
  // klingt und nicht nach Piepser.
  function bell(freq, start, duration, volume = 0.055) {
    tone(freq, start, duration, "triangle", volume);
    tone(freq * 2, start, duration * 0.55, "sine", volume * 0.32);
  }
  // Notenwerte für die Jingles (C-Dur, kindgerecht hell).
  const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760, C7: 2093 };
  const JINGLES = {
    // Kurzes "Ding-Ding" nach einer richtigen Antwort.
    correct: [
      { note: "G5", at: 0, dur: 0.16, vol: 0.05 },
      { note: "C6", at: 0.09, dur: 0.3, vol: 0.06 },
    ],
    // Fanfare, wenn ein Level oder eine Reise fertig ist.
    win: [
      { note: "C5", at: 0, dur: 0.16, vol: 0.05 },
      { note: "E5", at: 0.1, dur: 0.16, vol: 0.05 },
      { note: "G5", at: 0.2, dur: 0.18, vol: 0.055 },
      { note: "C6", at: 0.32, dur: 0.5, vol: 0.065 },
      { note: "E6", at: 0.44, dur: 0.55, vol: 0.04 },
      { note: "G6", at: 0.52, dur: 0.6, vol: 0.03 },
      { note: "C7", at: 0.66, dur: 0.4, vol: 0.02 },
    ],
    // Aufsteigendes Funkeln, wenn ein neues Tier freigeschaltet wird.
    unlock: [
      { note: "C6", at: 0, dur: 0.14, vol: 0.045 },
      { note: "E6", at: 0.08, dur: 0.14, vol: 0.045 },
      { note: "G6", at: 0.16, dur: 0.16, vol: 0.045 },
      { note: "C7", at: 0.26, dur: 0.42, vol: 0.04 },
    ],
    // Freundliches "Probier nochmal" – tief und leise, nie tadelnd.
    retry: [
      { note: "F5", at: 0, dur: 0.12, vol: 0.028 },
      { note: "D5", at: 0.1, dur: 0.2, vol: 0.026 },
    ],
    // Ein einzelner Stern beim Aufdecken.
    star: [{ note: "A5", at: 0, dur: 0.2, vol: 0.05 }],
  };
  // Spielt einen Jingle aus JINGLES. Unbekannte Namen werden ignoriert.
  function playJingle(name) {
    const parts = JINGLES[name];
    const ctx = parts ? ensureAudio() : null;
    if (!ctx) return;
    const now = ctx.currentTime + 0.01;
    parts.forEach((part) => bell(NOTE[part.note], now + part.at, part.dur, part.vol));
  }
  function playChime() { playJingle("win"); }
  function playStarSound(index = 0) {
    const ctx = ensureAudio();
    if (!ctx) return;
    bell([NOTE.A5, NOTE.C6, NOTE.E6][Math.min(Math.max(index, 0), 2)], ctx.currentTime + 0.01, 0.22, 0.055);
  }
  function vibrate(pattern) {
    try { if (navigator.vibrate && !prefersReducedMotion()) navigator.vibrate(pattern); } catch { /* ignore */ }
  }

  // ---------------------------------------------------------------------------
  // Zuletzt gespielt
  // ---------------------------------------------------------------------------
  function setLastPlayed(game, levelId) {
    if (!game) return;
    writeJSON(KEYS.lastPlayed, { game, levelId: levelId || null, at: Date.now() });
  }
  function getLastPlayed() { return readJSON(KEYS.lastPlayed, null); }

  // ---------------------------------------------------------------------------
  // Tutorial gesehen?
  // ---------------------------------------------------------------------------
  function tutorialSeen(game) { return readRaw(KEYS.tutorial(game)) === "1"; }
  function markTutorialSeen(game) { writeRaw(KEYS.tutorial(game), "1"); }

  // ---------------------------------------------------------------------------
  // Hilfe-Lautsprecher ("Was mache ich hier?")
  // ---------------------------------------------------------------------------
  // Die App spricht nie von selbst. Jeder Bildschirm meldet hier an, was gerade
  // zu tun ist; erklingt tut das erst, wenn das Kind den Lautsprecher antippt.
  // Zusätzlich erscheint der Text als Sprechblase – so hilft der Knopf auch auf
  // Geräten ohne Sprachausgabe.
  const helpStack = [];
  let helpButton = null;
  let helpBubble = null;
  let helpHideTimer = 0;
  let helpToken = 0;

  function currentHelp() {
    return helpStack.length ? helpStack[helpStack.length - 1].text : "";
  }
  function refreshHelpButton() {
    if (!helpButton) return;
    const text = currentHelp();
    helpButton.hidden = !text;
    helpButton.disabled = !text;
  }
  // Setzt den Hilfetext der Grundebene (die aktuelle Seite/Ansicht).
  function setHelp(text) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    if (helpStack.length && helpStack[0].base) helpStack[0].text = clean;
    else helpStack.unshift({ text: clean, base: true, id: "base" });
    if (currentHelp() === clean) hideHelpBubble();
    refreshHelpButton();
  }
  // Legt einen Hilfetext obendrauf (Dialoge, Overlays). Gibt eine Funktion zum
  // Entfernen zurück.
  function pushHelp(text) {
    helpToken += 1;
    const entry = { text: String(text || "").replace(/\s+/g, " ").trim(), id: `h${helpToken}` };
    helpStack.push(entry);
    hideHelpBubble();
    refreshHelpButton();
    return () => {
      const index = helpStack.indexOf(entry);
      if (index >= 0) helpStack.splice(index, 1);
      hideHelpBubble();
      refreshHelpButton();
    };
  }
  function hideHelpBubble() {
    window.clearTimeout(helpHideTimer);
    if (helpBubble) helpBubble.hidden = true;
    helpButton?.classList.remove("speaking");
  }
  function showHelpBubble(text) {
    if (!helpBubble) return;
    helpBubble.textContent = text;
    helpBubble.hidden = false;
    window.clearTimeout(helpHideTimer);
    // Lange Texte dürfen länger stehen bleiben (ca. Lesegeschwindigkeit).
    helpHideTimer = window.setTimeout(hideHelpBubble, Math.min(20000, 3500 + text.length * 55));
  }
  // Liest den aktuellen Hilfetext vor. Zweiter Klick beendet das Vorlesen.
  function speakHelp() {
    const text = currentHelp();
    if (!text) return;
    if (helpButton?.classList.contains("speaking")) { stopSpeaking(); hideHelpBubble(); return; }
    showHelpBubble(text);
    helpButton?.classList.add("speaking");
    speak(text, { onEnd: () => { helpButton?.classList.remove("speaking"); } });
    if (!ttsSupported() || !ttsEnabled()) helpButton?.classList.remove("speaking");
  }
  // ---------------------------------------------------------------------------
  // Ton-Schalter (oben rechts)
  // ---------------------------------------------------------------------------
  // Liegt hier statt in app.js, damit auch Seiten ohne app.js (Tier-Sprung)
  // einen Schalter haben – sie machen ja ebenfalls Geräusche.
  let audioToggle = null;
  function updateAudioToggle() {
    if (!audioToggle) return;
    const muted = !audioEnabled();
    audioToggle.classList.toggle("muted", muted);
    audioToggle.setAttribute("aria-pressed", muted ? "true" : "false");
    audioToggle.setAttribute("aria-label", muted ? "Ton einschalten" : "Ton ausschalten");
    audioToggle.title = muted ? "Ton einschalten" : "Ton ausschalten";
  }
  function mountAudioToggle() {
    if (audioToggle || document.querySelector(".sound-toggle")) return null;
    audioToggle = document.createElement("button");
    audioToggle.type = "button";
    audioToggle.className = "sound-toggle";
    audioToggle.dataset.audioToggle = "true";
    audioToggle.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path class="sound-core" d="M11 5 6 9H3v6h3l5 4V5z"/>
        <path class="sound-wave" d="M15.5 8.5a5 5 0 0 1 0 7"/>
        <path class="sound-wave sound-wave-wide" d="M18.3 5.7a9 9 0 0 1 0 12.6"/>
        <path class="sound-off-line" d="M4 4l16 16"/>
      </svg>`;
    audioToggle.addEventListener("click", () => { setAudioEnabled(!audioEnabled()); updateAudioToggle(); });
    document.body.append(audioToggle);
    updateAudioToggle();
    return audioToggle;
  }

  // Baut den Hilfe-Knopf. Die Startseite meldet keinen Text an – dort erklären
  // sich die Kacheln selbst und der Knopf bleibt verborgen.
  function mountHelpButton() {
    if (helpButton || !document.body) return null;
    const wrap = document.createElement("div");
    wrap.className = "help-voice";
    wrap.innerHTML = `
      <button type="button" class="help-voice-button" aria-label="Vorlesen: Was mache ich hier?" title="Was mache ich hier?">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path class="help-voice-core" d="M11 5 6 9H3v6h3l5 4V5z"/>
          <path class="help-voice-wave" d="M15.5 8.5a5 5 0 0 1 0 7"/>
          <path class="help-voice-wave help-voice-wave-wide" d="M18.3 5.7a9 9 0 0 1 0 12.6"/>
        </svg>
        <span class="help-voice-mark" aria-hidden="true">?</span>
      </button>
      <p class="help-voice-bubble" role="status" aria-live="polite" hidden></p>`;
    document.body.append(wrap);
    helpButton = wrap.querySelector(".help-voice-button");
    helpBubble = wrap.querySelector(".help-voice-bubble");
    helpButton.addEventListener("click", speakHelp);
    helpBubble.addEventListener("click", hideHelpBubble);
    refreshHelpButton();
    return helpButton;
  }

  // ---------------------------------------------------------------------------
  // Öffentliche API
  // ---------------------------------------------------------------------------
  window.LernappKids = {
    KEYS,
    // Sterne
    getStars, setStars,
    // Tagesziel
    DAILY_GOAL, recordDailySolve, dailyProgress, weeklyProgress,
    // Profil
    AVATARS, getProfile, saveProfile, isYoung,
    // TTS (nur auf Lautsprecher-Klick)
    ttsSupported, ttsEnabled, setTtsEnabled, speak, stopSpeaking,
    // Hilfe-Lautsprecher
    setHelp, pushHelp, speakHelp, mountHelpButton, currentHelp,
    // Maskottchen + Effekte
    mascotSVG, burstConfetti, playJingle, playChime, playStarSound, vibrate, prefersReducedMotion,
    // Ton-Schalter
    audioEnabled, setAudioEnabled, updateAudioToggle,
    // Ausrichtung
    lockLandscape,
    // Verlauf
    setLastPlayed, getLastPlayed, tutorialSeen, markTutorialSeen,
    // Speicher-Helfer
    readJSON, writeJSON,
  };

  // Der Knopf wird überall angelegt, zeigt sich aber nur, wenn der Bildschirm
  // einen Hilfetext angemeldet hat. Die Startseite meldet keinen an – dort
  // erklären die Kacheln sich selbst. Dialoge über der Startseite (z. B. "Wer
  // spielt?") schieben einen Text nach und lassen den Knopf so erscheinen.
  // ---------------------------------------------------------------------------
  // Querformat
  // ---------------------------------------------------------------------------
  // Die App ist auf Querformat ausgelegt: der Zug aus Lok und fünf Wagen ist
  // breit, und hochkant bliebe er ein flacher Streifen. Das Manifest verlangt
  // Querformat, aber im normalen Browser-Tab greift das nicht – dort zeigt
  // dieser Hinweis, dass das Gerät gedreht werden soll. Nur ein Bild, kein
  // Text: die Kinder können noch nicht lesen.
  function mountRotateHint() {
    if (document.querySelector(".rotate-hint")) return;
    const hint = document.createElement("div");
    hint.className = "rotate-hint";
    hint.setAttribute("role", "alert");
    hint.setAttribute("aria-label", "Bitte drehe das Gerät quer.");
    hint.innerHTML = `
      <svg viewBox="0 0 120 100" aria-hidden="true" focusable="false">
        <rect class="rotate-hint-device" x="42" y="8" width="36" height="62" rx="7"/>
        <circle class="rotate-hint-dot" cx="60" cy="63" r="2.6"/>
        <path class="rotate-hint-arrow" d="M26 84 a34 34 0 0 1 68 0" />
        <polygon class="rotate-hint-tip" points="94,76 102,86 86,88" />
      </svg>`;
    document.body.append(hint);
  }

  // Im installierten Vollbild lässt sich die Ausrichtung wirklich festhalten.
  // Der Aufruf braucht eine Nutzergeste und scheitert sonst still – deshalb
  // hängt er am ersten Antippen und schluckt jeden Fehler.
  function lockLandscape() {
    try {
      const lock = screen.orientation?.lock;
      if (typeof lock !== "function") return;
      lock.call(screen.orientation, "landscape").catch(() => {});
    } catch { /* nicht erlaubt – dann bleibt der Dreh-Hinweis */ }
  }

  function mountFixedButtons() {
    mountHelpButton();
    mountAudioToggle();
    mountRotateHint();
    document.addEventListener("pointerdown", lockLandscape, { once: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountFixedButtons);
  else mountFixedButtons();
})();
