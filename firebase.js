(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyDJKaBS1W-EU6d8N3pL2R4amSl8R0vD-Uc",
    authDomain: "lernapp-8d944.firebaseapp.com",
    projectId: "lernapp-8d944",
    storageBucket: "lernapp-8d944.firebasestorage.app",
    messagingSenderId: "123146993935",
    appId: "1:123146993935:web:8843f8c35e9a2a4b4e3e7a",
  };

  const GAME_LABELS = {
    arukone: "Arukone",
    bimaru: "Meerestiere",
    kakuro: "Kakuro",
    shikaku: "Tiergehege",
    hidoku: "Hidoku",
    sudoku: "Sudoku",
  };

  const DIFFICULTY_LABELS = {
    easy: "Leicht",
    medium: "Mittel",
    hard: "Schwer",
    extreme: "Extrem",
  };

  const DEFAULT_TOTALS = {
    arukone: 40,
    bimaru: 40,
    kakuro: 40,
    shikaku: 40,
    hidoku: 40,
    sudoku: 40,
  };

  const LOCAL_SOLVED_PREFIX = "lernapp.solved.";
  const HEARTBEAT_MS = 30000;
  const state = {
    app: null,
    auth: null,
    db: null,
    user: null,
    progress: new Map(),
    levelCatalog: [],
    levelsByKey: new Map(),
    activeSession: null,
    heartbeatId: null,
    dashboardOpen: false,
    firebaseReady: false,
  };

  const accountButton = document.createElement("button");
  accountButton.className = "account-button";
  accountButton.type = "button";
  accountButton.setAttribute("aria-label", "Login und Profil öffnen");
  accountButton.title = "Login und Profil";
  accountButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20 21a8 8 0 0 0-16 0"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
    <span class="account-initial" aria-hidden="true"></span>
  `;

  const modal = document.createElement("section");
  modal.className = "account-modal hidden";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "account-modal-title");
  modal.innerHTML = `
    <div class="account-panel">
      <button class="account-close" type="button" aria-label="Profilfenster schließen" title="Schließen">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="account-content"></div>
    </div>
  `;

  document.body.append(accountButton, modal);

  const modalContent = modal.querySelector(".account-content");
  const closeButton = modal.querySelector(".account-close");

  const cloudApi = {
    registerLevels,
    isSignedIn: () => Boolean(state.user),
    isLevelSolved,
    recordLevelStart,
    recordMove,
    recordReset,
    recordHint,
    recordSolve,
    flushCurrentSession,
    refreshDashboard,
  };

  window.LernappFirebase = cloudApi;

  accountButton.addEventListener("click", () => openModal());
  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushCurrentSession({ includeElapsed: true });
    else if (state.activeSession) state.activeSession.lastFlushMs = Date.now();
  });
  window.addEventListener("pagehide", () => {
    flushCurrentSession({ close: true, includeElapsed: true });
  });

  initialiseFirebase();
  renderLoggedOut();

  function initialiseFirebase() {
    if (!window.firebase?.initializeApp) {
      state.firebaseReady = false;
      setAccountStatus(false);
      return;
    }

    try {
      state.app = window.firebase.apps?.length ? window.firebase.app() : window.firebase.initializeApp(firebaseConfig);
      state.auth = window.firebase.auth();
      state.db = window.firebase.firestore();
      state.firebaseReady = true;
      state.auth.onAuthStateChanged(handleAuthState);
      startHeartbeat();
    } catch (error) {
      state.firebaseReady = false;
      renderError("Firebase konnte nicht gestartet werden.", error);
    }
  }

  async function handleAuthState(user) {
    state.user = user || null;
    setAccountStatus(Boolean(user));

    if (!user) {
      state.progress.clear();
      stopActiveSession();
      renderLoggedOut();
      window.LernappRefreshProgress?.();
      return;
    }

    try {
      await upsertUserProfile(user);
      await loadProgress();
      await syncLocalSolvedProgress();
      await refreshDashboard();
      window.LernappRefreshProgress?.();
    } catch (error) {
      renderError("Firebase ist verbunden, aber Firestore hat den Zugriff abgelehnt oder ist noch nicht eingerichtet.", error);
    }
  }

  function registerLevels(catalog) {
    const entries = Array.isArray(catalog)
      ? catalog
      : Object.values(catalog || {}).flat();

    state.levelCatalog = entries.map(normalizeLevel).filter(Boolean);
    state.levelsByKey = new Map(state.levelCatalog.map((level) => [levelKey(level), level]));

    if (state.user) {
      syncLocalSolvedProgress().then(() => refreshDashboard()).catch(() => {});
    }
  }

  function normalizeLevel(level) {
    if (!level || !level.game) return null;
    return {
      game: level.game,
      levelId: level.id || level.levelId || level.levelName,
      levelName: level.levelName || level.id || "Level",
      title: level.title || level.levelName || "Level",
      difficulty: level.difficulty || "easy",
      size: level.size || null,
      rows: level.rows || null,
      cols: level.cols || null,
    };
  }

  function levelKey(level) {
    const game = level.game || "unknown";
    const id = level.levelId || level.id || level.levelName || "level";
    return `${game}_${String(id).replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  }

  function progressKey(level) {
    const id = level.levelId || level.id || level.levelName;
    return `${LOCAL_SOLVED_PREFIX}${level.game}.${id}`;
  }

  function isLevelSolved(level) {
    const normalized = normalizeLevel(level);
    return Boolean(normalized && state.progress.get(levelKey(normalized))?.solved);
  }

  function localSolvedLevels() {
    const result = [];
    const known = new Set(state.levelCatalog.map((level) => `${level.game}.${level.levelId}`));

    state.levelCatalog.forEach((level) => {
      if (localStorage.getItem(progressKey(level)) === "1") result.push(level);
    });

    Object.keys(localStorage)
      .filter((key) => key.startsWith(LOCAL_SOLVED_PREFIX) && localStorage.getItem(key) === "1")
      .forEach((key) => {
        const rest = key.slice(LOCAL_SOLVED_PREFIX.length);
        const separator = rest.indexOf(".");
        if (separator < 0) return;
        const game = rest.slice(0, separator);
        const levelId = rest.slice(separator + 1);
        if (known.has(`${game}.${levelId}`)) return;
        result.push({ game, levelId, levelName: levelId, title: levelId, difficulty: "easy" });
      });

    return result;
  }

  async function syncLocalSolvedProgress() {
    if (!state.user || !state.db) return;
    const solved = localSolvedLevels();
    await Promise.all(solved.map((level) => mergeSolvedLevel(level, { migrated: true })));
  }

  async function loadProgress() {
    if (!state.user || !state.db) return;
    const snapshot = await userRef().collection("levelProgress").get();
    state.progress.clear();

    snapshot.forEach((doc) => {
      const data = doc.data();
      state.progress.set(doc.id, data);
      if (data.solved && data.game && data.levelId) {
        localStorage.setItem(progressKey(data), "1");
      }
    });
  }

  async function upsertUserProfile(user) {
    const ref = userRef();
    const existing = await ref.get();
    const providers = user.providerData.map((provider) => provider.providerId);
    const payload = {
      email: user.email || null,
      displayName: user.displayName || null,
      providers,
      updatedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    };

    if (!existing.exists) {
      payload.createdAt = serverTimestamp();
      payload.stats = {
        totalSeconds: 0,
        moves: 0,
        resets: 0,
        hints: 0,
        solvedLevels: 0,
        sessions: 0,
      };
    }

    await ref.set(payload, { merge: true });
  }

  function userRef() {
    return state.db.collection("users").doc(state.user.uid);
  }

  function serverTimestamp() {
    return window.firebase.firestore.FieldValue.serverTimestamp();
  }

  function increment(value) {
    return window.firebase.firestore.FieldValue.increment(value);
  }

  async function signIn(email, password) {
    await state.auth.signInWithEmailAndPassword(email, password);
  }

  async function signUp(email, password) {
    await state.auth.createUserWithEmailAndPassword(email, password);
  }

  async function signInWithGoogle() {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    await state.auth.signInWithPopup(provider);
  }

  async function signOut() {
    await flushCurrentSession({ close: true });
    await state.auth.signOut();
  }

  function recordLevelStart(rawLevel) {
    const level = normalizeLevel(rawLevel);
    if (!level) return;

    flushCurrentSession({ close: true });

    state.activeSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      level,
      startedAtMs: Date.now(),
      lastFlushMs: Date.now(),
      moves: 0,
      resets: 0,
      hints: 0,
      flushedMoves: 0,
      flushedResets: 0,
      flushedHints: 0,
      solved: false,
      closed: false,
    };

    if (!state.user || !state.db) return;

    const batch = state.db.batch();
    const session = sessionRef(state.activeSession);
    const levelDoc = levelRef(level);

    batch.set(session, {
      ...level,
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      durationSeconds: 0,
      moves: 0,
      resets: 0,
      hints: 0,
      solved: false,
    }, { merge: true });

    batch.set(levelDoc, {
      ...level,
      attempts: increment(1),
      lastPlayedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    batch.set(userRef(), {
      stats: { sessions: increment(1) },
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    batch.commit().catch(() => {});
  }

  function recordMove() {
    if (state.activeSession) state.activeSession.moves += 1;
  }

  function recordReset() {
    if (state.activeSession) {
      state.activeSession.resets += 1;
      flushCurrentSession();
    }
  }

  function recordHint() {
    if (state.activeSession) {
      state.activeSession.hints += 1;
      flushCurrentSession();
    }
  }

  function recordSolve(rawLevel) {
    const level = normalizeLevel(rawLevel);
    if (!level) return;
    localStorage.setItem(progressKey(level), "1");
    if (state.activeSession && levelKey(state.activeSession.level) === levelKey(level)) {
      state.activeSession.solved = true;
    }
    mergeSolvedLevel(level).catch(() => {});
    flushCurrentSession({ solved: true, close: true });
  }

  async function mergeSolvedLevel(level, options = {}) {
    if (!state.user || !state.db) return;
    const key = levelKey(level);
    const cached = state.progress.get(key);
    const wasSolved = Boolean(cached?.solved);
    const payload = {
      ...level,
      solved: true,
      updatedAt: serverTimestamp(),
      lastPlayedAt: serverTimestamp(),
    };

    if (!wasSolved) payload.solvedAt = serverTimestamp();
    if (options.migrated) payload.migratedFromLocal = true;

    const batch = state.db.batch();
    batch.set(levelRef(level), payload, { merge: true });

    if (!wasSolved) {
      batch.set(userRef(), {
        stats: { solvedLevels: increment(1) },
        lastSeenAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();
    state.progress.set(key, { ...(cached || {}), ...level, solved: true });
  }

  function levelRef(level) {
    return userRef().collection("levelProgress").doc(levelKey(level));
  }

  function sessionRef(session) {
    return userRef().collection("sessions").doc(session.id);
  }

  async function flushCurrentSession(options = {}) {
    const session = state.activeSession;
    if (!session || !state.user || !state.db || session.closed) return;

    const now = Date.now();
    const includeElapsed = options.includeElapsed || document.visibilityState === "visible";
    const deltaSeconds = includeElapsed ? Math.max(0, Math.floor((now - session.lastFlushMs) / 1000)) : 0;
    const moveDelta = session.moves - session.flushedMoves;
    const resetDelta = session.resets - session.flushedResets;
    const hintDelta = session.hints - session.flushedHints;
    const shouldClose = Boolean(options.close || options.solved);

    if (!deltaSeconds && !moveDelta && !resetDelta && !hintDelta && !shouldClose) return;

    session.lastFlushMs = now;
    session.flushedMoves = session.moves;
    session.flushedResets = session.resets;
    session.flushedHints = session.hints;
    if (shouldClose) session.closed = true;

    const solved = Boolean(options.solved || session.solved);
    const batch = state.db.batch();
    const levelPayload = {
      ...session.level,
      timeSeconds: increment(deltaSeconds),
      moves: increment(moveDelta),
      resets: increment(resetDelta),
      hints: increment(hintDelta),
      lastPlayedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (solved) {
      levelPayload.solved = true;
      levelPayload.solvedAt = serverTimestamp();
    }

    const sessionPayload = {
      durationSeconds: increment(deltaSeconds),
      moves: session.moves,
      resets: session.resets,
      hints: session.hints,
      solved,
      updatedAt: serverTimestamp(),
    };

    if (shouldClose) sessionPayload.endedAt = serverTimestamp();

    batch.set(levelRef(session.level), levelPayload, { merge: true });
    batch.set(sessionRef(session), sessionPayload, { merge: true });
    batch.set(userRef(), {
      stats: {
        totalSeconds: increment(deltaSeconds),
        moves: increment(moveDelta),
        resets: increment(resetDelta),
        hints: increment(hintDelta),
      },
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    try {
      await batch.commit();
      if (solved) {
        state.progress.set(levelKey(session.level), {
          ...(state.progress.get(levelKey(session.level)) || {}),
          ...session.level,
          solved: true,
        });
      }
      if (state.dashboardOpen) refreshDashboard();
    } catch (error) {
      session.lastFlushMs = now - (deltaSeconds * 1000);
      session.flushedMoves -= moveDelta;
      session.flushedResets -= resetDelta;
      session.flushedHints -= hintDelta;
      session.closed = false;
    }
  }

  function stopActiveSession() {
    state.activeSession = null;
  }

  function startHeartbeat() {
    if (state.heartbeatId) return;
    state.heartbeatId = window.setInterval(() => {
      if (state.activeSession && document.visibilityState === "visible") flushCurrentSession();
    }, HEARTBEAT_MS);
  }

  function setAccountStatus(isLoggedIn) {
    accountButton.classList.toggle("signed-in", isLoggedIn);
    accountButton.title = isLoggedIn ? "Profil und Dashboard" : "Login";
    const initial = accountButton.querySelector(".account-initial");
    if (!initial) return;
    const source = state.user?.displayName || state.user?.email || "";
    initial.textContent = isLoggedIn ? source.trim().charAt(0).toUpperCase() : "";
  }

  function openModal() {
    modal.hidden = false;
    modal.classList.remove("hidden");
    state.dashboardOpen = true;
    if (state.user) refreshDashboard();
    else renderLoggedOut();
    modalContent.querySelector("input, button")?.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.classList.add("hidden");
    state.dashboardOpen = false;
    accountButton.focus();
  }

  function renderLoggedOut() {
    modalContent.innerHTML = `
      <p class="small-label">Profil</p>
      <h2 id="account-modal-title">Einloggen</h2>
      <p class="account-muted">Melde dich an, damit gelöste Levels, Spielzeit, Resets und Fortschritte in Firebase gespeichert werden.</p>
      <form class="auth-form" data-auth-mode="login">
        <label>
          <span>E-Mail</span>
          <input name="email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>Passwort</span>
          <input name="password" type="password" autocomplete="current-password" minlength="6" required />
        </label>
        <div class="auth-actions">
          <button type="submit" data-mode="login">Einloggen</button>
          <button type="button" class="secondary-action" data-auth-register>Registrieren</button>
        </div>
      </form>
      <button type="button" class="google-action" data-google-login>Mit Google anmelden</button>
      <p class="auth-status" role="status" aria-live="polite">${state.firebaseReady ? "" : "Firebase SDK ist noch nicht geladen."}</p>
    `;

    const form = modalContent.querySelector(".auth-form");
    const registerButton = modalContent.querySelector("[data-auth-register]");
    const googleButton = modalContent.querySelector("[data-google-login]");
    const status = modalContent.querySelector(".auth-status");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!state.firebaseReady) {
        status.textContent = "Firebase ist nicht verfügbar.";
        return;
      }
      const formData = new FormData(form);
      status.textContent = "Anmeldung läuft...";
      try {
        await signIn(String(formData.get("email")), String(formData.get("password")));
      } catch (error) {
        status.textContent = authErrorMessage(error);
      }
    });

    registerButton.addEventListener("click", async () => {
      if (!state.firebaseReady) {
        status.textContent = "Firebase ist nicht verfügbar.";
        return;
      }
      const formData = new FormData(form);
      status.textContent = "Konto wird erstellt...";
      try {
        await signUp(String(formData.get("email")), String(formData.get("password")));
      } catch (error) {
        status.textContent = authErrorMessage(error);
      }
    });

    googleButton.addEventListener("click", async () => {
      if (!state.firebaseReady) {
        status.textContent = "Firebase ist nicht verfügbar.";
        return;
      }
      status.textContent = "Google-Anmeldung wird geöffnet...";
      try {
        await signInWithGoogle();
      } catch (error) {
        status.textContent = authErrorMessage(error);
      }
    });
  }

  async function refreshDashboard() {
    if (!state.user || !state.db) return;

    const [userDoc, progressSnapshot, sessionSnapshot] = await Promise.all([
      userRef().get(),
      userRef().collection("levelProgress").get(),
      userRef().collection("sessions").orderBy("startedAt", "desc").limit(8).get(),
    ]);

    const userData = userDoc.data() || {};
    const progressDocs = progressSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const sessions = sessionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    progressDocs.forEach((entry) => {
      state.progress.set(entry.id, entry);
      if (entry.solved && entry.game && entry.levelId) localStorage.setItem(progressKey(entry), "1");
    });

    if (!state.dashboardOpen && modal.hidden) return;
    renderDashboard(userData, progressDocs, sessions);
  }

  function renderDashboard(userData, progressDocs, sessions) {
    const stats = summarizeProgress(userData, progressDocs);
    const providerText = providerLabel(state.user.providerData.map((provider) => provider.providerId));

    modalContent.innerHTML = `
      <p class="small-label">Profil</p>
      <h2 id="account-modal-title">Dashboard</h2>
      <div class="profile-summary">
        <div>
          <span class="account-muted">Angemeldet als</span>
          <strong>${escapeHtml(state.user.email || state.user.displayName || "Unbekannt")}</strong>
          <small>${providerText}</small>
        </div>
        <button type="button" class="secondary-action" data-logout>Logout</button>
      </div>
      <div class="stat-strip" aria-label="Gesamtstatistik">
        <div><strong>${stats.totalSolved}</strong><span>gelöst</span></div>
        <div><strong>${formatDuration(stats.totalSeconds)}</strong><span>Spielzeit</span></div>
        <div><strong>${stats.resets}</strong><span>Resets</span></div>
        <div><strong>${stats.moves}</strong><span>Züge</span></div>
      </div>
      <div class="progress-list">
        ${stats.byGame.map(renderProgressCard).join("")}
      </div>
      <div class="session-list">
        <h3>Letzte Spielstände</h3>
        ${sessions.length ? sessions.map(renderSession).join("") : "<p class=\"account-muted\">Noch keine Cloud-Spielstände vorhanden.</p>"}
      </div>
      <p class="auth-status" role="status" aria-live="polite"></p>
    `;

    modalContent.querySelector("[data-logout]").addEventListener("click", async () => {
      const status = modalContent.querySelector(".auth-status");
      status.textContent = "Logout läuft...";
      try {
        await signOut();
      } catch (error) {
        status.textContent = authErrorMessage(error);
      }
    });
  }

  function summarizeProgress(userData, progressDocs) {
    const totals = { ...DEFAULT_TOTALS };
    state.levelCatalog.forEach((level) => {
      totals[level.game] = (totals[level.game] || 0) + 0;
    });

    Object.keys(GAME_LABELS).forEach((game) => {
      const exactTotal = state.levelCatalog.filter((level) => level.game === game).length;
      if (exactTotal) totals[game] = exactTotal;
    });

    const solvedByGame = {};
    const timeByGame = {};
    const resetsByGame = {};
    let totalSolved = 0;
    let totalSeconds = Number(userData.stats?.totalSeconds || 0);
    let resets = Number(userData.stats?.resets || 0);
    let moves = Number(userData.stats?.moves || 0);

    progressDocs.forEach((entry) => {
      if (!entry.game) return;
      if (entry.solved) {
        solvedByGame[entry.game] = (solvedByGame[entry.game] || 0) + 1;
        totalSolved += 1;
      }
      timeByGame[entry.game] = (timeByGame[entry.game] || 0) + Number(entry.timeSeconds || 0);
      resetsByGame[entry.game] = (resetsByGame[entry.game] || 0) + Number(entry.resets || 0);
    });

    if (!totalSeconds) totalSeconds = progressDocs.reduce((sum, entry) => sum + Number(entry.timeSeconds || 0), 0);
    if (!resets) resets = progressDocs.reduce((sum, entry) => sum + Number(entry.resets || 0), 0);
    if (!moves) moves = progressDocs.reduce((sum, entry) => sum + Number(entry.moves || 0), 0);

    return {
      totalSolved,
      totalSeconds,
      resets,
      moves,
      byGame: Object.keys(GAME_LABELS).map((game) => ({
        game,
        label: GAME_LABELS[game],
        solved: solvedByGame[game] || 0,
        total: totals[game] || 0,
        seconds: timeByGame[game] || 0,
        resets: resetsByGame[game] || 0,
      })),
    };
  }

  function renderProgressCard(item) {
    const percent = item.total ? Math.round((item.solved / item.total) * 100) : 0;
    return `
      <article class="progress-card">
        <div>
          <strong>${escapeHtml(item.label)}</strong>
          <span>${item.solved}/${item.total || "?"} Levels</span>
        </div>
        <div class="progress-bar" aria-label="${escapeHtml(item.label)} Fortschritt ${percent}%">
          <span style="width: ${percent}%"></span>
        </div>
        <small>${percent}% · ${formatDuration(item.seconds)} · ${item.resets} Resets</small>
      </article>
    `;
  }

  function renderSession(session) {
    const levelLabel = session.levelName || session.title || session.levelId || "Level";
    const gameLabel = GAME_LABELS[session.game] || session.game || "Rätsel";
    const difficulty = DIFFICULTY_LABELS[session.difficulty] || session.difficulty || "";
    return `
      <article class="session-item">
        <div>
          <strong>${escapeHtml(gameLabel)} · ${escapeHtml(levelLabel)}</strong>
          <span>${escapeHtml(difficulty)}${session.solved ? " · gelöst" : ""}</span>
        </div>
        <small>${formatDuration(Number(session.durationSeconds || 0))} · ${Number(session.moves || 0)} Züge · ${Number(session.resets || 0)} Resets</small>
      </article>
    `;
  }

  function providerLabel(providers) {
    if (providers.includes("google.com")) return "Google-Konto";
    if (providers.includes("password")) return "E-Mail und Passwort";
    return providers.join(", ") || "Firebase Auth";
  }

  function formatDuration(seconds) {
    const value = Math.max(0, Number(seconds || 0));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    if (hours) return `${hours} h ${minutes} min`;
    if (minutes) return `${minutes} min`;
    return `${value % 60} s`;
  }

  function authErrorMessage(error) {
    const code = error?.code || "";
    if (code.includes("invalid-email")) return "Bitte gib eine gültige E-Mail-Adresse ein.";
    if (code.includes("weak-password")) return "Das Passwort muss mindestens 6 Zeichen haben.";
    if (code.includes("email-already-in-use")) return "Für diese E-Mail existiert bereits ein Konto.";
    if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) return "E-Mail oder Passwort stimmt nicht.";
    if (code.includes("popup")) return "Die Google-Anmeldung wurde nicht abgeschlossen.";
    return "Die Anmeldung hat nicht geklappt. Prüfe Firebase Auth und die erlaubten Domains.";
  }

  function renderError(message, error) {
    modalContent.innerHTML = `
      <p class="small-label">Profil</p>
      <h2 id="account-modal-title">Firebase</h2>
      <p class="account-muted">${escapeHtml(message)}</p>
      <p class="auth-status">${escapeHtml(error?.message || "")}</p>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
