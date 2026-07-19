/*
 * kids.js – Gemeinsame Kinder-Funktionen für die Lernapp.
 * Wird auf jeder Seite vor app.js geladen und stellt window.LernappKids bereit:
 * Sterne, Sticker-Zoo, Tagesziel, Profil, Vorlesen (TTS), Maskottchen, Konfetti, Töne.
 * Bewusst ohne Framework und defensiv (localStorage kann fehlschlagen).
 */
(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Speicher-Helfer
  // ---------------------------------------------------------------------------
  const KEYS = {
    stars: (game, levelId) => `lernapp.stars.${game}.${levelId}`,
    zooPoints: "lernapp.zoo.points",
    zooStickers: "lernapp.zoo.stickers",
    zooNew: "lernapp.zoo.new",
    daily: "lernapp.daily",
    profile: "lernapp.profile",
    tts: "lernapp.tts",
    lastPlayed: "lernapp.lastPlayed",
    tutorial: (game) => `lernapp.tut.${game}`,
    adventure: "lernapp.adventure.progress",
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
  // Sticker-Zoo
  // ---------------------------------------------------------------------------
  // Jeder gewonnene Stern zählt Punkte; alle STICKER_COST Punkte gibt es einen
  // neuen Sticker (Tier). Seltene Tiere brauchen einen 3-Sterne-Erfolg.
  const STICKER_COST = 5;
  const STICKERS = [
    { id: "cat", emoji: "🐱", name: "Katze", sound: "Miau!", rarity: "common" },
    { id: "dog", emoji: "🐶", name: "Hund", sound: "Wuff!", rarity: "common" },
    { id: "rabbit", emoji: "🐰", name: "Hase", sound: "Hoppel hoppel!", rarity: "common" },
    { id: "mouse", emoji: "🐭", name: "Maus", sound: "Piep!", rarity: "common" },
    { id: "frog", emoji: "🐸", name: "Frosch", sound: "Quak!", rarity: "common" },
    { id: "chick", emoji: "🐥", name: "Küken", sound: "Piep piep!", rarity: "common" },
    { id: "pig", emoji: "🐷", name: "Schwein", sound: "Oink!", rarity: "common" },
    { id: "cow", emoji: "🐮", name: "Kuh", sound: "Muuuh!", rarity: "common" },
    { id: "duck", emoji: "🦆", name: "Ente", sound: "Quak quak!", rarity: "common" },
    { id: "bee", emoji: "🐝", name: "Biene", sound: "Summ summ!", rarity: "common" },
    { id: "fish", emoji: "🐟", name: "Fisch", sound: "Blubb!", rarity: "common" },
    { id: "turtle", emoji: "🐢", name: "Schildkröte", sound: "Ganz langsam …", rarity: "common" },
    { id: "bear", emoji: "🐻", name: "Bär", sound: "Brumm!", rarity: "uncommon" },
    { id: "fox", emoji: "🦊", name: "Fuchs", sound: "Fip fip!", rarity: "uncommon" },
    { id: "panda", emoji: "🐼", name: "Panda", sound: "Mampf, mampf!", rarity: "uncommon" },
    { id: "koala", emoji: "🐨", name: "Koala", sound: "Kuschel!", rarity: "uncommon" },
    { id: "monkey", emoji: "🐵", name: "Affe", sound: "Uhu-ah-ah!", rarity: "uncommon" },
    { id: "owl", emoji: "🦉", name: "Eule", sound: "Uhu!", rarity: "uncommon" },
    { id: "penguin", emoji: "🐧", name: "Pinguin", sound: "Wack wack!", rarity: "uncommon" },
    { id: "elephant", emoji: "🐘", name: "Elefant", sound: "Törööö!", rarity: "uncommon" },
    { id: "hedgehog", emoji: "🦔", name: "Igel", sound: "Schnüff!", rarity: "uncommon" },
    { id: "butterfly", emoji: "🦋", name: "Schmetterling", sound: "Flatter flatter!", rarity: "uncommon" },
    { id: "lion", emoji: "🦁", name: "Löwe", sound: "Roaaar!", rarity: "rare" },
    { id: "tiger", emoji: "🐯", name: "Tiger", sound: "Grrr!", rarity: "rare" },
    { id: "unicorn", emoji: "🦄", name: "Einhorn", sound: "✨ Wieher! ✨", rarity: "rare" },
    { id: "dragon", emoji: "🐲", name: "Drache", sound: "Fauch!", rarity: "rare" },
    { id: "whale", emoji: "🐳", name: "Wal", sound: "Wuuuuuh!", rarity: "rare" },
    { id: "dino", emoji: "🦕", name: "Dino", sound: "Rooaar!", rarity: "rare" },
    { id: "parrot", emoji: "🦜", name: "Papagei", sound: "Hallo! Hallo!", rarity: "rare" },
    { id: "flamingo", emoji: "🦩", name: "Flamingo", sound: "Tanz mit!", rarity: "rare" },
  ];
  const STICKER_BY_ID = Object.fromEntries(STICKERS.map((s) => [s.id, s]));

  function collectedStickers() {
    const list = readJSON(KEYS.zooStickers, []);
    return Array.isArray(list) ? list.filter((id) => STICKER_BY_ID[id]) : [];
  }
  function zooPoints() {
    const value = Number(readRaw(KEYS.zooPoints));
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  function pointsToNextSticker() {
    const remainder = zooPoints() % STICKER_COST;
    return STICKER_COST - remainder;
  }
  function takeNewStickers() {
    const list = readJSON(KEYS.zooNew, []);
    writeJSON(KEYS.zooNew, []);
    return Array.isArray(list) ? list : [];
  }
  function peekNewStickers() {
    const list = readJSON(KEYS.zooNew, []);
    return Array.isArray(list) ? list : [];
  }

  function pickNewSticker(allowRare) {
    const owned = new Set(collectedStickers());
    let pool = STICKERS.filter((s) => !owned.has(s.id));
    if (!pool.length) return null; // Alle gesammelt
    // Ohne 3-Sterne-Erfolg keine seltenen Tiere.
    const withoutRare = pool.filter((s) => s.rarity !== "rare");
    if (!allowRare && withoutRare.length) pool = withoutRare;
    const weight = (s) => (s.rarity === "common" ? 5 : s.rarity === "uncommon" ? 3 : 1);
    const total = pool.reduce((sum, s) => sum + weight(s), 0);
    let roll = Math.random() * total;
    for (const sticker of pool) {
      roll -= weight(sticker);
      if (roll <= 0) return sticker;
    }
    return pool[pool.length - 1];
  }

  // Fügt Sterne als Zoo-Punkte hinzu und schaltet ggf. neue Sticker frei.
  // Gibt die Liste der neu freigeschalteten Sticker zurück.
  function addStarsToZoo(starCount, options = {}) {
    const count = Math.max(0, Math.round(Number(starCount) || 0));
    if (!count) return [];
    const before = zooPoints();
    const after = before + count;
    writeRaw(KEYS.zooPoints, String(after));
    const unlockedCount = Math.floor(after / STICKER_COST) - Math.floor(before / STICKER_COST);
    const unlocked = [];
    for (let i = 0; i < unlockedCount; i += 1) {
      const sticker = pickNewSticker(Boolean(options.threeStar));
      if (!sticker) break;
      unlocked.push(sticker);
      const owned = collectedStickers();
      owned.push(sticker.id);
      writeJSON(KEYS.zooStickers, owned);
    }
    if (unlocked.length) {
      const queued = peekNewStickers().concat(unlocked.map((s) => s.id));
      writeJSON(KEYS.zooNew, queued);
    }
    return unlocked;
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
    // Standard: aus. Es wird nicht automatisch vorgelesen – Vorlesen passiert
    // nur, wenn man den 🔊-Knopf drückt (speak(..., { force: true })).
    return false;
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
  function speak(text, options = {}) {
    if (!text || !ttsSupported()) return;
    // Automatisches Vorlesen nur, wenn eingeschaltet. Ein 🔊-Knopf erzwingt das
    // Vorlesen mit { force: true }, unabhängig von der Einstellung.
    if (!options.force && !ttsEnabled()) return;
    if (!options.queue) stopSpeaking();
    try {
      const utterance = new window.SpeechSynthesisUtterance(String(text));
      utterance.lang = "de-DE";
      utterance.rate = options.rate ?? (isYoung() ? 0.85 : 0.95);
      utterance.pitch = options.pitch ?? 1.15;
      const voice = pickGermanVoice();
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    } catch { /* ignore */ }
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
  // Töne + Vibration (eigenständig, für Seiten ohne app.js)
  // ---------------------------------------------------------------------------
  let audioContext = null;
  function ensureAudio() {
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
  function playChime() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, now + i * 0.11, 0.22, "triangle", 0.06));
  }
  function playStarSound(index = 0) {
    const ctx = ensureAudio();
    if (!ctx) return;
    tone(660 + index * 220, ctx.currentTime, 0.18, "triangle", 0.06);
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
  // Öffentliche API
  // ---------------------------------------------------------------------------
  window.LernappKids = {
    KEYS,
    // Sterne
    getStars, setStars,
    // Zoo
    STICKERS, STICKER_BY_ID, STICKER_COST,
    collectedStickers, zooPoints, pointsToNextSticker, addStarsToZoo, takeNewStickers, peekNewStickers,
    // Tagesziel
    DAILY_GOAL, recordDailySolve, dailyProgress, weeklyProgress,
    // Profil
    AVATARS, getProfile, saveProfile, isYoung,
    // TTS
    ttsSupported, ttsEnabled, setTtsEnabled, speak, stopSpeaking,
    // Maskottchen + Effekte
    mascotSVG, burstConfetti, playChime, playStarSound, vibrate, prefersReducedMotion,
    // Verlauf
    setLastPlayed, getLastPlayed, tutorialSeen, markTutorialSeen,
    // Adventure-Fortschritt
    readJSON, writeJSON,
  };
})();
