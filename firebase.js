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
    mathPuzzle: "Zahlenzauber",
    sequencePuzzle: "Zahlenfolge",
    shapeSequencePuzzle: "Figurenfolge",
    oddOneOut: "Was passt nicht?",
    whatFits: "Was passt?",
    readingPuzzle: "Wortdetektiv",
    countPuzzle: "Zählzauber",
    letterPuzzle: "Buchstaben-Jagd",
    backpack: "Rucksack packen",
    memory: "Memory",
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
    mathPuzzle: 40,
    sequencePuzzle: 40,
    shapeSequencePuzzle: 40,
    oddOneOut: 40,
    whatFits: 40,
    readingPuzzle: 40,
    countPuzzle: 40,
    letterPuzzle: 40,
    backpack: 4,
    memory: 40,
  };

  const LOCAL_SOLVED_PREFIX = "lernapp.solved.";
  const LOCAL_GUEST_ID_KEY = "lernapp.guest.id";
  const LOCAL_GUEST_CREATED_KEY = "lernapp.guest.createdAt";
  const GUEST_ID_PREFIX = "guest_";
  const CHILD_LOGIN_DOMAIN = "lernapp.local";
  const PASSWORD_SUFFIX = "::lernapp";
  const MIN_CHILD_PASSWORD_LENGTH = 4;
  const HEARTBEAT_MS = 30000;
  const ADMIN_EMAILS = new Set(["alain.sc2@gmail.com"]);
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
    pendingDisplayName: null,
    unlockedMode: false,
    guestId: null,
    guestCreatedAtMs: 0,
    adminView: "users",
    adminUsers: [],
    adminGuests: [],
    adminDetails: new Map(),
    adminGuestDetails: new Map(),
    selectedAdminUserId: null,
    selectedAdminGuestId: null,
    selectedAdminGame: "all",
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
  const accountPanel = modal.querySelector(".account-panel");
  const closeButton = modal.querySelector(".account-close");

  const cloudApi = {
    registerLevels,
    isSignedIn: () => Boolean(state.user),
    isLevelSolved,
    isUnlockedModeEnabled: () => Boolean(state.user && state.unlockedMode),
    recordLevelStart,
    recordMove,
    recordReset,
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
      state.guestId = getGuestId();
      state.firebaseReady = true;
      state.auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL)
        .catch(() => {})
        .finally(() => state.auth.onAuthStateChanged(handleAuthState));
      startHeartbeat();
    } catch (error) {
      state.firebaseReady = false;
      renderError("Firebase konnte nicht gestartet werden.", error);
    }
  }

  async function handleAuthState(user) {
    if (user && state.activeSession?.ownerKind === "guest") {
      await flushCurrentSession({ close: true, includeElapsed: true });
      stopActiveSession();
    }

    state.user = user || null;
    setAccountStatus(Boolean(user));

    if (!user) {
      state.progress.clear();
      state.unlockedMode = false;
      resetAdminState();
      stopActiveSession();
      renderLoggedOut();
      window.LernappRefreshProgress?.();
      return;
    }

    try {
      await upsertUserProfile(user);
      if (!isAdminUser(user)) resetAdminState();
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
      if (localStorage.getItem(progressKey(level)) === "1") result.push({ ...level });
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
    });
  }

  function cleanDisplayName(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function loginSlug(value) {
    return cleanDisplayName(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function technicalEmailFromName(value) {
    const slug = loginSlug(value);
    if (!slug) throw authInputError("lernapp/missing-name");
    return `${slug}@${CHILD_LOGIN_DOMAIN}`;
  }

  function emailForSignIn(value) {
    const loginName = cleanDisplayName(value);
    if (!loginName) throw authInputError("lernapp/missing-name");
    return loginName.includes("@") ? loginName.toLowerCase() : technicalEmailFromName(loginName);
  }

  function childPassword(value) {
    const password = String(value || "");
    if (password.length < MIN_CHILD_PASSWORD_LENGTH) throw authInputError("lernapp/short-password");
    return `${password}${PASSWORD_SUFFIX}`;
  }

  function passwordForSignIn(loginName, password) {
    return cleanDisplayName(loginName).includes("@") ? String(password || "") : childPassword(password);
  }

  function isTechnicalEmail(email) {
    return String(email || "").toLowerCase().endsWith(`@${CHILD_LOGIN_DOMAIN}`);
  }

  function normalizedEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function isAdminUser(user = state.user) {
    if (!user || !ADMIN_EMAILS.has(normalizedEmail(user.email))) return false;
    const hasGoogleProvider = user.providerData?.some((provider) => provider.providerId === "google.com");
    return Boolean(user.emailVerified || hasGoogleProvider);
  }

  function resetAdminState() {
    state.adminView = "users";
    state.adminUsers = [];
    state.adminGuests = [];
    state.adminDetails.clear();
    state.adminGuestDetails.clear();
    state.selectedAdminUserId = null;
    state.selectedAdminGuestId = null;
    state.selectedAdminGame = "all";
  }

  function randomToken(length = 16) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = new Uint8Array(length);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
    }
    return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  }

  function getGuestId() {
    if (state.guestId) return state.guestId;
    const fallback = `${GUEST_ID_PREFIX}${Date.now().toString(36)}${randomToken(8)}`;

    try {
      const saved = localStorage.getItem(LOCAL_GUEST_ID_KEY);
      if (saved && saved.startsWith(GUEST_ID_PREFIX)) {
        state.guestId = saved;
      } else {
        state.guestId = fallback;
        localStorage.setItem(LOCAL_GUEST_ID_KEY, state.guestId);
      }

      const savedCreatedAt = Number(localStorage.getItem(LOCAL_GUEST_CREATED_KEY));
      state.guestCreatedAtMs = Number.isFinite(savedCreatedAt) && savedCreatedAt > 0 ? savedCreatedAt : Date.now();
      localStorage.setItem(LOCAL_GUEST_CREATED_KEY, String(state.guestCreatedAtMs));
    } catch (error) {
      state.guestId = fallback;
      state.guestCreatedAtMs = state.guestCreatedAtMs || Date.now();
    }

    return state.guestId;
  }

  function guestDisplayName(guestId = getGuestId()) {
    return `Gast ${String(guestId || "").slice(-6).toUpperCase()}`;
  }

  function fallbackNameFromEmail(email) {
    if (!email) return "Kind";
    const localPart = String(email).split("@")[0] || "kind";
    return localPart.replace(/[-_.]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function profileNameForUser(user, userData = {}) {
    return cleanDisplayName(
      state.pendingDisplayName ||
      userData.username ||
      user.displayName ||
      (isTechnicalEmail(user.email) ? fallbackNameFromEmail(user.email) : user.email) ||
      "Kind"
    );
  }

  function authInputError(code) {
    return Object.assign(new Error(code), { code });
  }

  async function upsertUserProfile(user) {
    const ref = userRef();
    const existing = await ref.get();
    const existingData = existing.data() || {};
    state.unlockedMode = Boolean(existingData.levelAccess?.unlockAllLevels);
    const providers = user.providerData.map((provider) => provider.providerId);
    const username = profileNameForUser(user, existingData);
    const isNameLogin = isTechnicalEmail(user.email);
    const admin = isAdminUser(user);
    const payload = {
      authEmail: user.email || null,
      email: isNameLogin ? null : (user.email || null),
      username,
      displayName: username,
      role: admin ? "admin" : "user",
      isAdmin: admin,
      loginMethod: isNameLogin ? "name-password" : (providers.includes("google.com") ? "google" : "email-password"),
      providers,
      localPersistence: true,
      updatedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    };

    if (!existing.exists) {
      payload.createdAt = serverTimestamp();
      payload.stats = {
        totalSeconds: 0,
        moves: 0,
        resets: 0,
        solvedLevels: 0,
        sessions: 0,
      };
    }

    await ref.set(payload, { merge: true });
    state.pendingDisplayName = null;
  }

  function userRef(userId = state.user?.uid) {
    return userId ? state.db.collection("users").doc(userId) : null;
  }

  function guestRef(guestId = getGuestId()) {
    return guestId ? state.db.collection("guests").doc(guestId) : null;
  }

  function currentOwner() {
    if (!state.db) return null;
    if (state.user?.uid) return { kind: "user", id: state.user.uid };
    return { kind: "guest", id: getGuestId() };
  }

  function sessionOwner(session) {
    if (!state.db || !session) return null;
    if (session.ownerKind && session.ownerId) return { kind: session.ownerKind, id: session.ownerId };
    return currentOwner();
  }

  function ownerRef(owner) {
    if (!owner?.id) return null;
    return owner.kind === "guest" ? guestRef(owner.id) : userRef(owner.id);
  }

  function ownerActivityPayload(owner, stats = {}) {
    const payload = {
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (Object.keys(stats).length) payload.stats = stats;

    if (owner?.kind === "guest") {
      payload.type = "guest";
      payload.guestId = owner.id;
      payload.displayName = guestDisplayName(owner.id);
      payload.createdAtMs = state.guestCreatedAtMs || Date.now();
      payload.localPersistence = true;
    }

    return payload;
  }

  function serverTimestamp() {
    return window.firebase.firestore.FieldValue.serverTimestamp();
  }

  function increment(value) {
    return window.firebase.firestore.FieldValue.increment(value);
  }

  async function signIn(loginName, password) {
    await state.auth.signInWithEmailAndPassword(emailForSignIn(loginName), passwordForSignIn(loginName, password));
  }

  async function signUp(loginName, password) {
    const displayName = cleanDisplayName(loginName);
    const email = technicalEmailFromName(displayName);
    state.pendingDisplayName = displayName;
    try {
      const credential = await state.auth.createUserWithEmailAndPassword(email, childPassword(password));
      if (credential.user?.updateProfile) await credential.user.updateProfile({ displayName });
    } catch (error) {
      state.pendingDisplayName = null;
      throw error;
    }
  }

  async function signInWithGoogle() {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    await state.auth.signInWithPopup(provider);
  }

  async function signOut() {
    await flushCurrentSession({ close: true });
    await state.auth.signOut();
  }

  async function setUnlockAllLevels(enabled) {
    if (!state.user || !state.db) return;
    const previousMode = state.unlockedMode;
    state.unlockedMode = Boolean(enabled);
    try {
      await userRef().set({
        levelAccess: {
          unlockAllLevels: state.unlockedMode,
          updatedAt: serverTimestamp(),
        },
        lastSeenAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      state.unlockedMode = previousMode;
      throw error;
    }
    window.LernappRefreshProgress?.();
    await refreshDashboard();
  }

  function recordLevelStart(rawLevel) {
    const level = normalizeLevel(rawLevel);
    if (!level) return;

    flushCurrentSession({ close: true });
    const owner = currentOwner();

    state.activeSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      level,
      ownerKind: owner?.kind || null,
      ownerId: owner?.id || null,
      startedAtMs: Date.now(),
      lastFlushMs: Date.now(),
      moves: 0,
      resets: 0,
      flushedMoves: 0,
      flushedResets: 0,
      solved: false,
      closed: false,
    };

    const ownerDoc = ownerRef(owner);
    if (!state.db || !ownerDoc) return;

    const batch = state.db.batch();
    const session = sessionRef(state.activeSession);
    const levelDoc = levelRef(level, owner);

    batch.set(session, {
      ...level,
      ownerKind: owner.kind,
      ownerId: owner.id,
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      durationSeconds: 0,
      moves: 0,
      resets: 0,
      solved: false,
    }, { merge: true });

    batch.set(levelDoc, {
      ...level,
      attempts: increment(1),
      lastPlayedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    batch.set(ownerDoc, ownerActivityPayload(owner, { sessions: increment(1) }), { merge: true });

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

  function solveResultOptions(result = {}) {
    if (typeof result === "number") return {};
    return { ...(result || {}) };
  }

  function solveMetadata(options = {}) {
    const payload = {};
    ["elapsedSeconds", "flawless", "correct", "target", "best"].forEach((key) => {
      const value = Number(options[key]);
      if (Number.isFinite(value)) payload[key] = value;
    });
    return payload;
  }

  function recordSolve(rawLevel, result = {}) {
    const level = normalizeLevel(rawLevel);
    if (!level) return;
    const options = solveResultOptions(result);
    const key = levelKey(level);
    const cached = state.progress.get(key) || {};
    if (!state.user) {
      localStorage.setItem(progressKey(level), "1");
    }
    state.progress.set(levelKey(level), {
      ...cached,
      ...level,
      solved: true,
      ...solveMetadata(options),
    });
    if (state.activeSession && levelKey(state.activeSession.level) === levelKey(level)) {
      state.activeSession.solved = true;
    }
    const owner = state.activeSession && levelKey(state.activeSession.level) === levelKey(level)
      ? sessionOwner(state.activeSession)
      : currentOwner();
    mergeSolvedLevel(level, options, owner).catch(() => {});
    flushCurrentSession({ solved: true, close: true });
  }

  async function mergeSolvedLevel(level, options = {}, owner = currentOwner()) {
    const ownerDoc = ownerRef(owner);
    if (!ownerDoc || !state.db) return;
    const key = levelKey(level);
    const levelDoc = levelRef(level, owner);
    const cached = owner?.kind === "user" ? state.progress.get(key) : (await levelDoc.get()).data();
    const wasSolved = Boolean(cached?.solved);
    const payload = {
      ...level,
      solved: true,
      ...solveMetadata(options),
      updatedAt: serverTimestamp(),
      lastPlayedAt: serverTimestamp(),
    };

    if (!wasSolved) payload.solvedAt = serverTimestamp();
    if (options.migrated) payload.migratedFromLocal = true;

    const batch = state.db.batch();
    batch.set(levelDoc, payload, { merge: true });

    if (!wasSolved) {
      batch.set(ownerDoc, ownerActivityPayload(owner, { solvedLevels: increment(1) }), { merge: true });
    }

    await batch.commit();
    if (owner?.kind === "user") {
      state.progress.set(key, { ...(cached || {}), ...level, solved: true, ...solveMetadata(options) });
    }
  }

  function levelRef(level, owner = currentOwner()) {
    return ownerRef(owner).collection("levelProgress").doc(levelKey(level));
  }

  function sessionRef(session) {
    return ownerRef(sessionOwner(session)).collection("sessions").doc(session.id);
  }

  async function flushCurrentSession(options = {}) {
    const session = state.activeSession;
    if (!session || !state.db || session.closed) return;
    const owner = sessionOwner(session);
    const ownerDoc = ownerRef(owner);
    if (!ownerDoc) return;

    const now = Date.now();
    const includeElapsed = options.includeElapsed || document.visibilityState === "visible";
    const deltaSeconds = includeElapsed ? Math.max(0, Math.floor((now - session.lastFlushMs) / 1000)) : 0;
    const moveDelta = session.moves - session.flushedMoves;
    const resetDelta = session.resets - session.flushedResets;
    const shouldClose = Boolean(options.close || options.solved);

    if (!deltaSeconds && !moveDelta && !resetDelta && !shouldClose) return;

    session.lastFlushMs = now;
    session.flushedMoves = session.moves;
    session.flushedResets = session.resets;
    if (shouldClose) session.closed = true;

    const solved = Boolean(options.solved || session.solved);
    const batch = state.db.batch();
    const levelPayload = {
      ...session.level,
      timeSeconds: increment(deltaSeconds),
      moves: increment(moveDelta),
      resets: increment(resetDelta),
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
      solved,
      updatedAt: serverTimestamp(),
    };

    if (shouldClose) sessionPayload.endedAt = serverTimestamp();

    batch.set(levelRef(session.level, owner), levelPayload, { merge: true });
    batch.set(sessionRef(session), sessionPayload, { merge: true });
    batch.set(ownerDoc, ownerActivityPayload(owner, {
        totalSeconds: increment(deltaSeconds),
        moves: increment(moveDelta),
        resets: increment(resetDelta),
      }), { merge: true });

    try {
      await batch.commit();
      if (solved && owner.kind === "user") {
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
    const source = state.user ? profileNameForUser(state.user) : "";
    initial.textContent = isLoggedIn ? source.trim().charAt(0).toUpperCase() : "";
  }

  // Das Profilfenster ist für Erwachsene; der Hilfe-Lautsprecher erklärt es
  // trotzdem kurz, damit auf keinem Bildschirm der falsche Text vorgelesen wird.
  let releaseAccountHelp = null;

  function openModal() {
    modal.hidden = false;
    modal.classList.remove("hidden");
    state.dashboardOpen = true;
    if (state.user) refreshDashboard();
    else renderLoggedOut();
    releaseAccountHelp?.();
    releaseAccountHelp = window.LernappKids?.pushHelp?.("Das ist das Profilfenster für Erwachsene. Hier siehst du den Lernfortschritt und kannst dich an- oder abmelden. Mit dem Kreuz oben rechts schliesst du das Fenster.") || null;
    modalContent.querySelector("input, button")?.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.classList.add("hidden");
    state.dashboardOpen = false;
    releaseAccountHelp?.();
    releaseAccountHelp = null;
    accountButton.focus();
  }

  function renderLoggedOut() {
    accountPanel.classList.remove("has-admin");
    modalContent.innerHTML = `
      <p class="small-label">Profil</p>
      <h2 id="account-modal-title">Einloggen</h2>
      <p class="account-muted">Ein Name und ein kurzes Passwort reichen. Auf diesem Gerät bleibst du auch nach einem Neustart angemeldet.</p>
      <form class="auth-form" data-auth-mode="login">
        <label>
          <span>Name</span>
          <input name="loginName" type="text" autocomplete="username" required />
        </label>
        <label>
          <span>Passwort</span>
          <input name="password" type="password" autocomplete="current-password" minlength="4" required />
        </label>
        <div class="auth-actions">
          <button type="submit" data-mode="login">Einloggen</button>
          <button type="button" class="secondary-action" data-auth-register>Neues Konto</button>
        </div>
        <button type="button" class="google-action" data-auth-google>Mit Google anmelden</button>
      </form>
      <p class="auth-status" role="status" aria-live="polite">${state.firebaseReady ? "" : "Firebase SDK ist noch nicht geladen."}</p>
    `;

    const form = modalContent.querySelector(".auth-form");
    const registerButton = modalContent.querySelector("[data-auth-register]");
    const googleButton = modalContent.querySelector("[data-auth-google]");
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
        await signIn(String(formData.get("loginName")), String(formData.get("password")));
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
        await signUp(String(formData.get("loginName")), String(formData.get("password")));
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
    state.unlockedMode = Boolean(userData.levelAccess?.unlockAllLevels);
    const progressDocs = progressSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const sessions = sessionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    progressDocs.forEach((entry) => {
      state.progress.set(entry.id, entry);
    });

    if (!state.dashboardOpen && modal.hidden) return;
    renderDashboard(userData, progressDocs, sessions);
    if (isAdminUser()) hydrateAdminSection();
  }

  function renderDashboard(userData, progressDocs, sessions) {
    const stats = summarizeProgress(userData, progressDocs);
    const loginName = userData.username || profileNameForUser(state.user, userData);
    const providerText = providerLabel(state.user.providerData.map((provider) => provider.providerId), userData);
    const admin = isAdminUser();
    accountPanel.classList.toggle("has-admin", admin);

    modalContent.innerHTML = `
      <p class="small-label">Profil</p>
      <h2 id="account-modal-title">Dashboard</h2>
      <div class="profile-summary">
        <div>
          <span class="account-muted">Angemeldet als</span>
          <strong>${escapeHtml(loginName)}</strong>
          <small>${providerText}</small>
        </div>
        <button type="button" class="secondary-action" data-logout>Logout</button>
      </div>
      <div class="unlock-mode-card${state.unlockedMode ? " active" : ""}">
        <div>
          <strong>Levelmodus</strong>
          <span>${state.unlockedMode ? "Alle Levels frei" : "Gesperrter Modus"}</span>
        </div>
        <button type="button" class="${state.unlockedMode ? "secondary-action" : ""}" data-unlock-mode-toggle>
          ${state.unlockedMode ? "Gesperrten Modus einschalten" : "Alle Levels freischalten"}
        </button>
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
      ${admin ? renderAdminSectionShell() : ""}
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

    modalContent.querySelector("[data-unlock-mode-toggle]").addEventListener("click", async () => {
      const status = modalContent.querySelector(".auth-status");
      status.textContent = state.unlockedMode ? "Gesperrter Modus wird eingeschaltet..." : "Alle Levels werden freigeschaltet...";
      try {
        await setUnlockAllLevels(!state.unlockedMode);
      } catch (error) {
        status.textContent = authErrorMessage(error);
      }
    });
  }

  function renderAdminSectionShell() {
    return `
      <section class="admin-section" data-admin-section>
        <div class="admin-section-head">
          <div>
            <p class="small-label">Administration</p>
            <h3>Admin-Bereich</h3>
            <p class="account-muted">Accounts, G&auml;ste, Level-Fortschritte und Spielsitzungen.</p>
            <div class="admin-tabs" role="tablist" aria-label="Admin-Bereich wechseln">
              <button type="button" data-admin-view="users">User</button>
              <button type="button" data-admin-view="guests">G&auml;ste</button>
            </div>
          </div>
          <button type="button" class="secondary-action" data-admin-refresh>Aktualisieren</button>
        </div>
        <div class="admin-body" data-admin-body>
          <p class="account-muted">Admin-Daten werden geladen...</p>
        </div>
      </section>
    `;
  }

  async function hydrateAdminSection({ force = false } = {}) {
    const root = modalContent.querySelector("[data-admin-section]");
    if (!root || !isAdminUser()) return;

    if (!root.dataset.adminBound) {
      root.querySelector("[data-admin-refresh]")?.addEventListener("click", () => hydrateAdminSection({ force: true }));
      root.querySelectorAll("[data-admin-view]").forEach((button) => {
        button.addEventListener("click", () => {
          state.adminView = button.dataset.adminView || "users";
          state.selectedAdminGame = "all";
          hydrateAdminSection();
        });
      });
      root.dataset.adminBound = "true";
    }

    if (force) {
      state.adminUsers = [];
      state.adminGuests = [];
      state.adminDetails.clear();
      state.adminGuestDetails.clear();
    }

    updateAdminViewButtons(root);
    if (state.adminView === "guests") {
      await hydrateAdminGuests(root);
      return;
    }

    if (!state.adminUsers.length) {
      renderAdminBody(root, "<p class=\"account-muted\">Admin-Daten werden geladen...</p>");
      try {
        state.adminUsers = await loadAdminUsers();
        if (!state.selectedAdminUserId && state.adminUsers.length) state.selectedAdminUserId = state.adminUsers[0].id;
      } catch (error) {
        renderAdminBody(root, `<p class="auth-status">${escapeHtml(authErrorMessage(error))}</p>`);
        return;
      }
    }

    renderAdminUsers(root);
    if (state.selectedAdminUserId && !state.adminDetails.has(state.selectedAdminUserId)) {
      await selectAdminUser(state.selectedAdminUserId, { root });
    }
  }

  async function hydrateAdminGuests(root) {
    if (!state.adminGuests.length) {
      renderAdminBody(root, "<p class=\"account-muted\">Gast-Daten werden geladen...</p>");
      try {
        state.adminGuests = await loadAdminGuests();
        if (!state.selectedAdminGuestId && state.adminGuests.length) state.selectedAdminGuestId = state.adminGuests[0].id;
      } catch (error) {
        renderAdminBody(root, `<p class="auth-status">${escapeHtml(authErrorMessage(error))}</p>`);
        return;
      }
    }

    renderAdminGuests(root);
    if (state.selectedAdminGuestId && !state.adminGuestDetails.has(state.selectedAdminGuestId)) {
      await selectAdminGuest(state.selectedAdminGuestId, { root });
    }
  }

  function updateAdminViewButtons(root) {
    root.querySelectorAll("[data-admin-view]").forEach((button) => {
      const active = button.dataset.adminView === state.adminView;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function renderAdminBody(root, html) {
    const body = root?.querySelector("[data-admin-body]");
    if (body) body.innerHTML = html;
  }

  async function loadAdminUsers() {
    const snapshot = await state.db.collection("users").get();
    const users = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const aDate = timestampDate(a.lastSeenAt || a.updatedAt || a.createdAt)?.getTime() || 0;
        const bDate = timestampDate(b.lastSeenAt || b.updatedAt || b.createdAt)?.getTime() || 0;
        return bDate - aDate;
      });
    return attachAdminSummaries("users", users);
  }

  async function loadAdminGuests() {
    const snapshot = await state.db.collection("guests").get();
    const guests = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data(), type: "guest" }))
      .sort((a, b) => {
        const aDate = timestampDate(a.lastSeenAt || a.updatedAt || a.createdAt || a.createdAtMs)?.getTime() || 0;
        const bDate = timestampDate(b.lastSeenAt || b.updatedAt || b.createdAt || b.createdAtMs)?.getTime() || 0;
        return bDate - aDate;
      });
    return attachAdminSummaries("guests", guests);
  }

  async function attachAdminSummaries(collectionName, entries) {
    return Promise.all(entries.map(async (entry) => {
      try {
        const snapshot = await state.db.collection(collectionName).doc(entry.id).collection("levelProgress").get();
        const progressDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return { ...entry, adminSummary: summarizeAdminEntity(entry, progressDocs) };
      } catch (error) {
        return entry;
      }
    }));
  }

  async function loadAdminUserDetails(userId) {
    const ref = state.db.collection("users").doc(userId);
    const [userDoc, progressSnapshot, sessionSnapshot] = await Promise.all([
      ref.get(),
      ref.collection("levelProgress").get(),
      ref.collection("sessions").orderBy("startedAt", "desc").get(),
    ]);

    return {
      id: userId,
      userData: userDoc.data() || {},
      progressDocs: progressSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      sessions: sessionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  }

  async function loadAdminGuestDetails(guestId) {
    const ref = state.db.collection("guests").doc(guestId);
    const [guestDoc, progressSnapshot, sessionSnapshot] = await Promise.all([
      ref.get(),
      ref.collection("levelProgress").get(),
      ref.collection("sessions").orderBy("startedAt", "desc").get(),
    ]);

    return {
      id: guestId,
      kind: "guest",
      userData: { type: "guest", ...(guestDoc.data() || {}) },
      progressDocs: progressSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      sessions: sessionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  }

  async function selectAdminUser(userId, { root = modalContent.querySelector("[data-admin-section]"), force = false } = {}) {
    if (!root) return;
    state.selectedAdminUserId = userId;
    renderAdminUsers(root, { loadingUserId: userId });

    try {
      if (force || !state.adminDetails.has(userId)) {
        state.adminDetails.set(userId, await loadAdminUserDetails(userId));
      }
    } catch (error) {
      state.adminDetails.set(userId, { id: userId, error });
    }

    if (modalContent.contains(root)) renderAdminUsers(root);
  }

  async function selectAdminGuest(guestId, { root = modalContent.querySelector("[data-admin-section]"), force = false } = {}) {
    if (!root) return;
    state.selectedAdminGuestId = guestId;
    renderAdminGuests(root, { loadingGuestId: guestId });

    try {
      if (force || !state.adminGuestDetails.has(guestId)) {
        state.adminGuestDetails.set(guestId, await loadAdminGuestDetails(guestId));
      }
    } catch (error) {
      state.adminGuestDetails.set(guestId, { id: guestId, kind: "guest", error });
    }

    if (modalContent.contains(root)) renderAdminGuests(root);
  }

  function renderAdminUsers(root, { loadingUserId = null } = {}) {
    const users = state.adminUsers;
    if (!users.length) {
      renderAdminBody(root, "<p class=\"account-muted\">Noch keine User gefunden.</p>");
      return;
    }

    const selectedId = state.selectedAdminUserId || users[0].id;
    state.selectedAdminUserId = selectedId;
    const detail = state.adminDetails.get(selectedId);

    renderAdminBody(root, `
      <div class="admin-layout">
        <div class="admin-user-list" aria-label="User">
          ${users.map((user) => renderAdminUserButton(user, selectedId)).join("")}
        </div>
        <div class="admin-detail" data-admin-detail>
          ${loadingUserId === selectedId && !detail ? "<p class=\"account-muted\">Details werden geladen...</p>" : renderAdminUserDetail(detail, users.find((user) => user.id === selectedId))}
        </div>
      </div>
    `);

    root.querySelectorAll("[data-admin-user]").forEach((button) => {
      button.addEventListener("click", () => selectAdminUser(button.dataset.adminUser, { root }));
    });

    root.querySelectorAll("[data-admin-game]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedAdminGame = button.dataset.adminGame || "all";
        renderAdminUsers(root);
      });
    });
  }

  function renderAdminGuests(root, { loadingGuestId = null } = {}) {
    const guests = state.adminGuests;
    if (!guests.length) {
      renderAdminBody(root, "<p class=\"account-muted\">Noch keine G&auml;ste gefunden.</p>");
      return;
    }

    const selectedId = state.selectedAdminGuestId || guests[0].id;
    state.selectedAdminGuestId = selectedId;
    const detail = state.adminGuestDetails.get(selectedId);

    renderAdminBody(root, `
      <div class="admin-layout">
        <div class="admin-user-list" aria-label="G&auml;ste">
          ${guests.map((guest) => renderAdminGuestButton(guest, selectedId)).join("")}
        </div>
        <div class="admin-detail" data-admin-detail>
          ${loadingGuestId === selectedId && !detail ? "<p class=\"account-muted\">Details werden geladen...</p>" : renderAdminUserDetail(detail, guests.find((guest) => guest.id === selectedId))}
        </div>
      </div>
    `);

    root.querySelectorAll("[data-admin-guest]").forEach((button) => {
      button.addEventListener("click", () => selectAdminGuest(button.dataset.adminGuest, { root }));
    });

    root.querySelectorAll("[data-admin-game]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedAdminGame = button.dataset.adminGame || "all";
        renderAdminGuests(root);
      });
    });
  }

  function renderAdminUserButton(user, selectedId) {
    return renderAdminEntityButton(user, selectedId, "user");
  }

  function renderAdminGuestButton(guest, selectedId) {
    return renderAdminEntityButton(guest, selectedId, "guest");
  }

  function renderAdminEntityButton(entity, selectedId, kind) {
    const summary = entity.adminSummary || summarizeAdminEntity(entity, []);
    const name = adminDisplayName(entity);
    const subline = kind === "guest" ? entity.id : (entity.authEmail || entity.email || entity.id);
    const dataAttribute = kind === "guest" ? "data-admin-guest" : "data-admin-user";
    return `
      <button type="button" class="admin-user-button${entity.id === selectedId ? " active" : ""}" ${dataAttribute}="${escapeHtml(entity.id)}">
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(subline)}</span>
        <div class="admin-user-summary" aria-label="Kurzfassung">
          <span><b>Spielzeit</b>${escapeHtml(formatDuration(summary.totalSeconds))}</span>
          <span><b>Gel&ouml;st</b>${escapeHtml(summary.totalSolved)}</span>
          <span><b>Sessions</b>${escapeHtml(summary.sessions)}</span>
        </div>
        <em>${escapeHtml(adminTopLevelsText(summary))}</em>
      </button>
    `;
  }

  function renderAdminUserDetail(detail, fallbackUser = {}) {
    if (!detail) return "<p class=\"account-muted\">Wähle einen User aus.</p>";
    if (detail.error) return `<p class="auth-status">${escapeHtml(authErrorMessage(detail.error))}</p>`;

    const userData = { ...fallbackUser, ...detail.userData };
    const progressDocs = detail.progressDocs || [];
    const sessions = detail.sessions || [];
    const summary = summarizeAdminEntity(userData, progressDocs, sessions);
    const selectedGame = adminSelectedGame(progressDocs, sessions);
    const filteredProgress = selectedGame === "all" ? progressDocs : progressDocs.filter((entry) => entry.game === selectedGame);
    const filteredSessions = selectedGame === "all" ? sessions : sessions.filter((session) => session.game === selectedGame);
    const isGuest = userData.type === "guest" || detail.kind === "guest";
    const identityLine = isGuest ? `Gast-ID: ${detail.id}` : (userData.authEmail || userData.email || detail.id);

    return `
      <div class="admin-detail-head">
        <div>
          <h3>${escapeHtml(adminDisplayName(userData))}</h3>
          <p class="account-muted">${escapeHtml(identityLine)}</p>
        </div>
        <div class="admin-meta">
          <span>Erstellt: ${formatDateTime(userData.createdAt || userData.createdAtMs)}</span>
          <span>Zuletzt gesehen: ${formatDateTime(userData.lastSeenAt)}</span>
        </div>
      </div>
      <div class="stat-strip admin-stat-strip">
        <div><strong>${summary.totalSolved}</strong><span>gelöst</span></div>
        <div><strong>${formatDuration(summary.totalSeconds)}</strong><span>Spielzeit</span></div>
        <div><strong>${summary.moves}</strong><span>Züge</span></div>
        <div><strong>${sessions.filter((session) => !session.solved && session.endedAt).length}</strong><span>Abbrüche</span></div>
      </div>
      ${renderAdminTopLevels(summary)}
      ${renderAdminGameFilters(progressDocs, sessions, selectedGame)}
      <div class="admin-columns">
        <section>
          <h4>Level-Fortschritt</h4>
          <div class="admin-data-list">
            ${filteredProgress.length ? [...filteredProgress].sort(adminLevelSort).map(renderAdminLevelDetail).join("") : "<p class=\"account-muted\">Keine Leveldaten für diese Auswahl.</p>"}
          </div>
        </section>
        <section>
          <h4>Sitzungen</h4>
          <div class="admin-data-list">
            ${filteredSessions.length ? filteredSessions.map(renderAdminSessionDetail).join("") : "<p class=\"account-muted\">Keine Sitzungen für diese Auswahl.</p>"}
          </div>
        </section>
      </div>
    `;
  }

  function adminDisplayName(userData = {}) {
    if (userData.type === "guest") return cleanDisplayName(userData.displayName || guestDisplayName(userData.guestId || userData.id));
    return cleanDisplayName(userData.displayName || userData.username || userData.email || userData.authEmail || "Unbekannter User");
  }

  function adminSelectedGame(progressDocs, sessions) {
    const available = new Set(["all"]);
    progressDocs.forEach((entry) => { if (entry.game) available.add(entry.game); });
    sessions.forEach((session) => { if (session.game) available.add(session.game); });
    if (!available.has(state.selectedAdminGame)) state.selectedAdminGame = "all";
    return state.selectedAdminGame;
  }

  function renderAdminGameFilters(progressDocs, sessions, selectedGame) {
    const games = new Set();
    progressDocs.forEach((entry) => { if (entry.game) games.add(entry.game); });
    sessions.forEach((session) => { if (session.game) games.add(session.game); });
    const labeledGames = Object.keys(GAME_LABELS).filter((game) => games.has(game));
    const customGames = [...games].filter((game) => !GAME_LABELS[game]).sort((a, b) => a.localeCompare(b, "de"));
    const options = ["all", ...labeledGames, ...customGames];
    return `
      <div class="admin-game-filter" aria-label="Rätselart filtern">
        ${options.map((game) => `
          <button type="button" class="${game === selectedGame ? "active" : ""}" data-admin-game="${escapeHtml(game)}">
            ${game === "all" ? "Alle" : escapeHtml(GAME_LABELS[game] || game)}
          </button>
        `).join("")}
      </div>
    `;
  }

  function adminLevelSort(a, b) {
    return `${GAME_LABELS[a.game] || a.game || ""} ${a.levelName || a.levelId || ""}`.localeCompare(`${GAME_LABELS[b.game] || b.game || ""} ${b.levelName || b.levelId || ""}`, "de");
  }

  function renderAdminLevelDetail(entry) {
    const status = entry.solved ? "Gelöst" : (Number(entry.attempts || 0) ? "Begonnen" : "Offen");
    const details = [
      ["Status", status],
      ["Versuche", Number(entry.attempts || 0)],
      ["Zeit", formatDuration(Number(entry.timeSeconds || entry.elapsedSeconds || 0))],
      ["Züge", Number(entry.moves || 0)],
      ["Resets", Number(entry.resets || 0)],
      ["Gelöst am", formatDateTime(entry.solvedAt)],
      ["Zuletzt", formatDateTime(entry.lastPlayedAt || entry.updatedAt)],
    ];

    if (entry.target) details.splice(4, 0, ["Fortschritt", `${Number(entry.correct || 0)}/${Number(entry.target || 0)}`]);
    if (entry.best) details.splice(4, 0, ["Bestwert", Number(entry.best)]);

    return `
      <article class="admin-data-card">
        <strong>${escapeHtml(GAME_LABELS[entry.game] || entry.game || "Rätsel")} · ${escapeHtml(entry.levelName || entry.title || entry.levelId || entry.id || "Level")}</strong>
        <span>${escapeHtml(DIFFICULTY_LABELS[entry.difficulty] || entry.difficulty || "")}</span>
        <div class="admin-data-grid">${details.map(renderAdminDetailPair).join("")}</div>
      </article>
    `;
  }

  function renderAdminSessionDetail(session) {
    const status = session.solved ? "Gelöst" : (session.endedAt ? "Abgebrochen" : "Offen");
    const details = [
      ["Status", status],
      ["Start", formatDateTime(session.startedAt)],
      ["Ende", formatDateTime(session.endedAt)],
      ["Dauer", formatDuration(Number(session.durationSeconds || 0))],
      ["Züge", Number(session.moves || 0)],
      ["Resets", Number(session.resets || 0)],
    ];

    return `
      <article class="admin-data-card ${session.solved ? "solved" : (session.endedAt ? "abandoned" : "open")}">
        <strong>${escapeHtml(GAME_LABELS[session.game] || session.game || "Rätsel")} · ${escapeHtml(session.levelName || session.title || session.levelId || "Level")}</strong>
        <span>${escapeHtml(DIFFICULTY_LABELS[session.difficulty] || session.difficulty || "")}</span>
        <div class="admin-data-grid">${details.map(renderAdminDetailPair).join("")}</div>
      </article>
    `;
  }

  function renderAdminDetailPair([label, value]) {
    return `<span><b>${escapeHtml(label)}</b>${escapeHtml(value ?? "-")}</span>`;
  }

  function summarizeAdminEntity(entityData = {}, progressDocs = [], sessions = []) {
    const stats = summarizeProgress(entityData, progressDocs);
    const topLevels = progressDocs
      .map((entry) => {
        const attempts = Number(entry.attempts || 0) || (entry.solved || entry.timeSeconds || entry.moves ? 1 : 0);
        return {
          entry,
          attempts,
          seconds: Number(entry.timeSeconds || entry.elapsedSeconds || 0),
        };
      })
      .filter((item) => item.attempts > 0)
      .sort((a, b) => (b.attempts - a.attempts) || (b.seconds - a.seconds) || adminLevelSort(a.entry, b.entry))
      .slice(0, 3);

    return {
      ...stats,
      sessions: Number(entityData.stats?.sessions || 0) || sessions.length || 0,
      attemptedLevels: progressDocs.filter((entry) => entry.solved || Number(entry.attempts || 0) || Number(entry.timeSeconds || 0)).length,
      topLevels,
    };
  }

  function adminLevelShortLabel(entry = {}) {
    const game = GAME_LABELS[entry.game] || entry.game || "Rätsel";
    const level = entry.levelName || entry.title || entry.levelId || entry.id || "Level";
    return `${game} · ${level}`;
  }

  function adminTopLevelsText(summary = {}) {
    if (!summary.topLevels?.length) return "Top: noch keine Level";
    return `Top: ${summary.topLevels.map((item) => `${adminLevelShortLabel(item.entry)} (${item.attempts}x)`).join(", ")}`;
  }

  function renderAdminTopLevels(summary = {}) {
    if (!summary.topLevels?.length) {
      return `<section class="admin-top-levels"><h4>Meist gespielte Level</h4><p class="account-muted">Noch keine gespielten Level.</p></section>`;
    }

    return `
      <section class="admin-top-levels">
        <h4>Meist gespielte Level</h4>
        <div>
          ${summary.topLevels.map((item) => `
            <span>
              <b>${escapeHtml(adminLevelShortLabel(item.entry))}</b>
              ${escapeHtml(`${item.attempts}x gespielt · ${formatDuration(item.seconds)}`)}
            </span>
          `).join("")}
        </div>
      </section>
    `;
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

  function providerLabel(providers, userData = {}) {
    if (userData.loginMethod === "name-password" || isTechnicalEmail(state.user?.email)) return "Name und Passwort · auf diesem Gerät gespeichert";
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

  function timestampDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    if (value instanceof Date) return value;
    if (Number.isFinite(value.seconds)) return new Date(value.seconds * 1000);
    if (Number.isFinite(value)) return new Date(value);
    return null;
  }

  function formatDateTime(value) {
    const date = timestampDate(value);
    if (!date || Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("de-CH", { dateStyle: "short", timeStyle: "short" }).format(date);
  }

  function authErrorMessage(error) {
    const code = error?.code || "";
    if (code.includes("missing-name")) return "Bitte gib einen Namen ein.";
    if (code.includes("short-password") || code.includes("weak-password")) return "Das Passwort muss mindestens 4 Zeichen haben.";
    if (code.includes("invalid-email")) return "Dieser Name kann nicht verwendet werden.";
    if (code.includes("email-already-in-use")) return "Dieser Name ist bereits vergeben.";
    if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) return "Name oder Passwort stimmt nicht.";
    if (code.includes("permission-denied")) return "Keine Berechtigung. Der Admin-Bereich ist nur für das verifizierte Admin-Google-Konto freigegeben.";
    if (code.includes("popup")) return "Die Google-Anmeldung wurde nicht abgeschlossen.";
    return "Die Anmeldung hat nicht geklappt. Prüfe Firebase Auth und die Firestore-Regeln.";
  }

  function renderError(message, error) {
    accountPanel.classList.remove("has-admin");
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
