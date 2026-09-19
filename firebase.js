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
    starter: "Garten",
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
  // Wann dieses Gerät zuletzt einen Besuch gemeldet hat – siehe besuchMelden().
  const LOCAL_GUEST_PING_KEY = "lernapp.guest.lastPing";
  const GUEST_ID_PREFIX = "guest_";
  // Ein Neuladen ist kein zweiter Besuch. Derselbe Abstand steht im Server
  // (netlify/functions/besuch.mjs, ZAEHL_ABSTAND_MS) – der hier spart den
  // Aufruf, der dort entscheidet.
  const BESUCH_ABSTAND_MS = 30 * 60 * 1000;
  const CHILD_LOGIN_DOMAIN = "lernapp.local";
  const PASSWORD_SUFFIX = "::lernapp";
  const MIN_CHILD_PASSWORD_LENGTH = 4;
  const HEARTBEAT_MS = 30000;
  const ADMIN_EMAILS = new Set(["alain.sc2@gmail.com"]);
  // Was beim Zurücksetzen auf dem Gerät stehen bleibt. Eine Liste dessen, was
  // bleibt, statt einer Liste dessen, was geht: ein neues Spiel bringt seinen
  // eigenen Schlüssel mit, und der soll beim Zurücksetzen von selbst mitgehen,
  // ohne dass hier jemand nachträgt. Einstellungen, Gastkennung und das
  // Aussehen des Zugs sind kein Fortschritt und bleiben.
  const LOCAL_KEY_PREFIX = "lernapp.";
  const LOCAL_RESET_PREFIX = "lernapp.reset.";
  // Welches Wagen-Set gilt, samt Zeitpunkt des letzten Wechsels. Gilt für alle
  // – deshalb steht es in der Cloud unter config/train und wird hier nur
  // gespiegelt. Kein Fortschritt: es überlebt jedes Zurücksetzen.
  const LOCAL_WAGON_SET_KEY = "lernapp.train.set";
  const LOCAL_KEEP_KEYS = new Set([
    "lernapp.tts",             // Vorlesen an/aus
    "lernapp.audioFeedback",   // Töne an/aus
    "lernapp.train.loco",      // Aussehen der Lok
    "lernapp.train.scene",     // gewählte Landschaft
    "lernapp.train.savedAt",
    LOCAL_WAGON_SET_KEY,       // welches Wagen-Set gilt
    LOCAL_GUEST_ID_KEY,
    LOCAL_GUEST_CREATED_KEY,
    LOCAL_GUEST_PING_KEY,
  ]);
  const EMPTY_STATS = { totalSeconds: 0, moves: 0, resets: 0, solvedLevels: 0, sessions: 0 };
  const state = {
    app: null,
    auth: null,
    db: null,
    user: null,
    // Einmal je Seitenaufruf, nicht einmal je Anmeldewechsel: besuchMelden()
    // hängt an handleAuthState, und das läuft auch beim Abmelden noch einmal.
    besuchGemeldet: false,
    progress: new Map(),
    levelCatalog: [],
    levelsByKey: new Map(),
    activeSession: null,
    heartbeatId: null,
    dashboardOpen: false,
    firebaseReady: false,
    trainSettings: null,
    gameState: null,
    group: null,
    pendingDisplayName: null,
    unlockedMode: false,
    // Die Familie und der Kauf. role sagt, was für ein Konto das ist:
    // "child" mit technischer Adresse, "parent" mit echter, "admin" der eine.
    // parentUid steht am Kind, children am Elternkonto – beides schreibt der
    // Server, der Client liest es nur (firestore.rules). entitlement ist der
    // Kaufstand aus entitlements/{uid}, live beobachtet: Nach dem Kauf muss
    // niemand neu laden.
    role: null,
    parentUid: null,
    children: [],
    entitlement: null,
    entitlementLoaded: false,
    entitlementUnsubscribe: null,
    // Ob schon feststeht, wer hier spielt. Beim Laden einer Seite weiss das
    // niemand: Firebase holt die gespeicherte Anmeldung erst aus dem Speicher,
    // und bis dahin sieht ein angemeldetes Kind aus wie ein Gast. Wer in
    // diesem Moment sperrt, zeigt einem Kind, dem alles gehört, das Tor
    // (entitlement.js, isLoaded).
    //   authReady     der erste Bescheid von Firebase ist da
    //   profileReady  das Kontodokument ist gelesen – erst dann steht die
    //                 Rolle fest, und an ihr hängt der Gründer-Zugang
    authReady: false,
    profileReady: false,
    // Das Profilfenster zeigt ausnahmsweise den Verkaufsbildschirm: Das Kind
    // stand vor der Schranke, ein Erwachsener hat die Rechenaufgabe gelöst –
    // dann gehört dorthin, was der Kauf kostet und bringt, nicht das
    // Anmeldeformular (renderKaufSeite).
    kaufModus: false,
    // Zurück von der Kasse: "erfolg" oder "abbruch", einmal gezeigt.
    kaufRueckkehr: null,
    // Ein Server-Aufruf läuft – der Knopf dazu ist so lange stumm.
    serverBusy: false,
    guestId: null,
    guestCreatedAtMs: 0,
    progressResetAtMs: 0,
    // Das Wagen-Set. Zwei Quellen: config/train gilt für alle, users/<uid>
    // .wagonSet für dieses eine Konto. Welches zählt, entscheidet der
    // Zeitpunkt des Wechsels – das jüngere gewinnt.
    wagonSet: null,
    globalWagonSet: null,
    ownWagonSet: null,
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
    // Der Kauf und die Familie. Was jemand darf, entscheidet nicht diese
    // Zeile, sondern firestore.rules; hier steht nur, was gelesen wurde.
    getEntitlement,
    isEntitlementLoaded: () => state.entitlementLoaded,
    isAccountReady,
    getRole,
    getParentUid,
    getChildren,
    isParentAccount,
    getUser: () => (state.user ? { uid: state.user.uid, email: state.user.email || null, name: profileNameForUser(state.user) } : null),
    openAccount: () => openModal(),
    // Hinter dem Elterntor: erst der Preis, dann die Anmeldung (renderKaufSeite).
    openKauf: () => openKauf(),
    // Der Server: Kasse und Kinder. Wer das darf, entscheidet der Server am
    // Token – hier wird nur angerufen.
    zurKasse,
    kindAnlegen,
    kindPasswortSetzen,
    familieVerbinden,
    // Wie aus Name und Passwort eines Kindes Adresse und Passwort für Firebase
    // werden. Der Server (netlify/functions/_lib/kind.mjs) rechnet dasselbe,
    // wenn er ein Kind anlegt – scripts/test-functions.mjs vergleicht beide.
    kontoSchema: { technicalEmailFromName, childPassword, isTechnicalEmail, loginSlug },
    // Ohne Angabe das eigene Konto. Mit Angabe ein fremdes – wer das darf,
    // entscheidet nicht diese Zeile, sondern firestore.rules.
    resetProgress: (userId) => resetProgressFor(userId || state.user?.uid),
    recordLevelStart,
    recordMove,
    recordReset,
    recordSolve,
    flushCurrentSession,
    refreshDashboard,
    getTrainSettings,
    saveTrainSettings,
    getGameState,
    saveGameState,
    // Gruppen: mit wem der eigene Zug auf dem Startbild das Gleis teilt.
    getGroup,
    loadGroupTrains,
    // Alle der Gruppe, das eigene Konto eingeschlossen: die Bestenliste will
    // auch den eigenen Namen zeigen.
    loadGroupMembers,
    // Zuordnen darf nur der Admin. Wer das ist, entscheidet nicht diese Zeile,
    // sondern firestore.rules.
    setUserGroup,
    // Das Wagen-Set: welche Wagen der Zug hat und wie schnell sie wachsen.
    // Lesen darf jeder, umstellen nur der Admin – auch das steht in den Regeln.
    getWagonSet,
    switchWagonSet,
    // Das Set der eigenen Familie: ein Elternkonto wählt es für sich und
    // seine Kinder. Auch hier entscheidet die Regel, nicht diese Zeile.
    getFamilyWagonSet,
    switchFamilyWagonSet,
    clearFamilyWagonSet,

    // --- Für admin.html --------------------------------------------------
    // Die eigene Seite des Adminbereichs zeichnet selbst (admin.js); von hier
    // bekommt sie die Daten und die gemeinsamen Bausteine. Alles darunter ist
    // eine Auskunft, keine Berechtigung: Wer nichts lesen darf, bekommt von
    // Firestore nichts – das entscheidet firestore.rules.
    admin: {
      isAdmin: () => isAdminUser(),
      ladeKonten: loadAdminUsers,
      ladeGaeste: loadAdminGuests,
      ladeKaeufe: loadEntitlements,
      ladeKontoDetails: loadAdminUserDetails,
      ladeGastDetails: loadAdminGuestDetails,
      loescheGast: deleteGuest,
      loescheGaeste: deleteGuests,
      hatGespielt: guestHasPlayed,
      setUserGroup,
      setJourneyStufe: setJourneyStufeFor,
      resetProgress: resetProgressFor,
      freischalten: kontoFreischalten,
      loeschen: kontoLoeschen,
      switchWagonSet,
      // Der Reiter E-Mail: das Archiv und die Weiterleitung.
      ladeMails: loadMails,
      mailEinstellungen,
      speichereMailEinstellungen,
      testMail: testMailSchicken,
      fehlerText: (error) => authErrorMessage(error),
      serverFehlerText: (error) => serverErrorMessage(error),
    },

    // Die Bausteine, aus denen Elternbereich und Adminseite ein Konto zeichnen.
    // Sie stehen in firebase.js, weil beide Seiten dasselbe zeigen sollen.
    ansicht: {
      name: entityDisplayName,
      zuletzt: lastActivityMs,
      zusammenfassung: summarizeEntity,
      zugStreifen: renderTrainStrip,
      zugDetail: renderTrainDetail,
      levelAbdeckung: renderLevelCoverage,
      levelKarte: renderLevelDetail,
      sitzungsKarte: renderSessionDetail,
      spielFilter: renderGameFilters,
      topLevel: renderTopLevels,
      kontoDetail: renderEntityDetail,
      levelSort,
      gruppe: readGroup,
      spielName: gameLabel,
      dauer: formatDuration,
      datum: formatDateTime,
      zeitpunkt: timestampDate,
      text: escapeHtml,
    },
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

  liesKaufRueckkehr();
  initialiseFirebase();
  renderLoggedOut();

  function initialiseFirebase() {
    if (!window.firebase?.initializeApp) {
      state.firebaseReady = false;
      // Kein SDK, kein Konto: Der Stand steht fest, bevor er je wackeln konnte.
      state.authReady = true;
      state.profileReady = true;
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
      watchWagonSet();
    } catch (error) {
      state.firebaseReady = false;
      state.authReady = true;
      state.profileReady = true;
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
      state.trainSettings = null;
      state.gameState = null;
      state.group = null;
      state.progressResetAtMs = 0;
      state.role = null;
      state.parentUid = null;
      state.children = [];
      // Ohne Konto gilt wieder das Set für alle. Zurückgesetzt wird dabei
      // nichts: applyWagonSet räumt nur bei einem NEUEREN Wechsel auf, und
      // das globale ist älter als das, was dieses Gerät schon kennt.
      state.ownWagonSet = null;
      applyWagonSet(effectiveWagonSet());
      resetElternState();
      stopWatchingEntitlement();
      stopActiveSession();
      // Niemand angemeldet – mehr gibt es nicht zu wissen.
      state.authReady = true;
      state.profileReady = true;
      announceEntitlement();
      renderLoggedOut();
      announceProgress();
      // Ohne Konto zählt wieder, was auf diesem Gerät steht.
      announceTrainSettings();
      announceGameState();
      // Und ohne Konto gibt es keine Gruppe: das Startbild räumt die fremden
      // Züge weg, statt den Stand des abgemeldeten Kindes stehen zu lassen.
      announceGroup();
      // Jetzt erst steht fest, dass hier ein Gast sitzt und kein Konto. Genau
      // das ist der Besuch, der gezählt werden soll – wer angemeldet ist,
      // steht im Reiter "User" und nicht bei den Gästen.
      besuchMelden();
      return;
    }

    // Bis das Kontodokument gelesen ist, ist die Rolle unbekannt – und ein
    // Konto ohne bekannte Rolle gilt nirgends als frei. Deshalb steht der
    // Stand hier ausdrücklich auf "noch nicht": Die Schranke wartet darauf,
    // statt zu sperren.
    state.profileReady = false;
    try {
      await upsertUserProfile(user);
      state.authReady = true;
      state.profileReady = true;
      // Die Rolle steht – der Kauf kommt gleich (watchEntitlement). Wer
      // zuhört, rechnet jetzt neu: ein Gründerkind ist ab hier frei.
      announceEntitlement();
      watchEntitlement(user.uid);
      // Vor allem anderen: wurde dieses Konto anderswo zurückgesetzt, muss
      // dieses Gerät seinen alten Stand loswerden, bevor syncLocalSolvedProgress
      // ihn wieder hochschiebt.
      applyRemoteProgressReset(user.uid);
      announceTrainSettings();
      announceGameState();
      announceGroup();
      await loadProgress();
      await syncLocalSolvedProgress();
      await refreshDashboard();
      announceProgress();
      familieNachholen();
      if (state.kaufRueckkehr && modal.hidden) openModal();
    } catch (error) {
      // Auch ein Fehlschlag ist ein Bescheid: Sonst wartete die Schranke
      // ewig auf einen Stand, der nicht mehr kommt.
      state.authReady = true;
      state.profileReady = true;
      announceEntitlement();
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

  // --- Den Besuch melden -------------------------------------------------------
  // Bis hierher entstand ein Gastdokument erst beim ersten gestarteten Level
  // (recordLevelStart). Wer die App nur öffnete und wieder ging, hinterliess
  // nichts – und fehlte damit in der Antwort auf die Frage, wie viele Leute
  // überhaupt vorbeischauen. Dieser eine Aufruf schliesst die Lücke.
  //
  // Er geht über den Server (netlify/functions/besuch.mjs) statt direkt nach
  // Firestore, und zwar wegen des Standorts: Woher die Anfrage kommt, weiss
  // das Netlify-Edge, nicht der Browser. Das Gerät liest der Server aus dem
  // User-Agent, den er ohnehin bekommt – der Client schickt nur, was der
  // Server nicht sehen kann.
  //
  // Nichts davon darf je etwas kaputtmachen: Ein Zähler ist das Unwichtigste
  // in dieser App. Deshalb wird nicht gewartet, nichts geworfen und im
  // Fehlerfall geschwiegen – ein Kind soll nie merken, dass hier etwas nicht
  // ging.
  function besuchAngaben() {
    const angaben = { seite: document.body?.dataset?.page || "" };
    try { angaben.sprache = navigator.language || ""; } catch { /* egal */ }
    try { angaben.zeitzone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* egal */ }
    try {
      // Gerundet auf ganze Pixel und ohne Pixeldichte: Die Frage lautet "wie
      // gross ist der Bildschirm", nicht "welches Gerät genau ist das".
      if (window.screen?.width) angaben.bildschirm = `${Math.round(window.screen.width)}×${Math.round(window.screen.height)}`;
    } catch { /* egal */ }
    try {
      if (window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator?.standalone) angaben.installiert = true;
    } catch { /* egal */ }
    return angaben;
  }

  function besuchMelden() {
    if (state.besuchGemeldet) return;
    state.besuchGemeldet = true;

    // Zweite Bremse neben der auf dem Server: Ein Neuladen ist kein zweiter
    // Besuch, und ein Aufruf, den wir gar nicht erst machen, kostet auch
    // nichts. Der Server zählt trotzdem selbst nach – dieser Schlüssel steht
    // auf dem Gerät des Gastes und ist damit keine Tatsache, sondern eine
    // Ersparnis.
    try {
      const zuletzt = Number(localStorage.getItem(LOCAL_GUEST_PING_KEY)) || 0;
      if (zuletzt && Date.now() - zuletzt < BESUCH_ABSTAND_MS) return;
      localStorage.setItem(LOCAL_GUEST_PING_KEY, String(Date.now()));
    } catch { /* Kein localStorage: dann eben jedes Mal – der Server bremst. */ }

    const guestId = getGuestId();
    if (!guestId) return;
    offenerServerAufruf("besuch", { guestId, client: besuchAngaben() }).catch(() => {
      // Kein Netz, kein Server, keine Funktion: Dann fehlt eine Zeile in einer
      // Statistik. Mehr ist hier nicht passiert.
    });
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
    state.trainSettings = readTrainSettings(existingData.trainSettings);
    state.gameState = readGameState(existingData.gameState);
    state.group = readGroup(existingData.group);
    state.progressResetAtMs = Number(existingData.progressReset?.atMs) || 0;
    state.parentUid = typeof existingData.parentUid === "string" ? existingData.parentUid : null;
    state.children = readChildren(existingData.children);
    // Das Wagen-Set der Familie, falls die Eltern eines gesetzt haben. Es
    // kommt hier an und nicht über einen eigenen Beobachter: Ein onSnapshot
    // auf das eigene Konto meldete jede Zahl, die dieses Gerät selbst
    // hochschreibt, und das sind viele. Ein Wechsel der Eltern erreicht ein
    // anderes Gerät der Familie deshalb beim nächsten Öffnen der App.
    applyOwnWagonSet(existingData.wagonSet);
    const providers = user.providerData.map((provider) => provider.providerId);
    const username = profileNameForUser(user, existingData);
    const isNameLogin = isTechnicalEmail(user.email);
    const admin = isAdminUser(user);
    // Was für ein Konto das ist, entscheidet die Adresse: eine technische
    // gehört einem Kind, eine echte den Eltern. Der Admin ist der eine mit
    // der bekannten Adresse. Das Feld ist eine Auskunft, keine Berechtigung –
    // was jemand darf, entscheidet firestore.rules.
    state.role = admin ? "admin" : (isNameLogin ? "child" : "parent");
    const payload = {
      authEmail: user.email || null,
      email: isNameLogin ? null : (user.email || null),
      username,
      displayName: username,
      role: state.role,
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

  // --- Die Einstellungen des Zugs -------------------------------------------
  // Aussehen der Lok und gewählte Landschaft liegen als Feld am selben
  // Dokument wie der Fortschritt: users/<uid>. Wer sich am Tablet anmeldet,
  // findet dieselbe Lok vor wie am Laptop.
  //
  // Wessen Fassung gilt, entscheidet updatedAt – eine Zahl in Millisekunden,
  // vom Gerät gesetzt. Ein Server-Zeitstempel wäre genauer, käme aber erst
  // beim nächsten Lesen zurück; bis dahin wüsste kein Gerät, wie alt seine
  // eigene Fassung ist.
  function readTrainSettings(raw) {
    if (!raw || typeof raw !== "object") return null;
    const updatedAt = Number(raw.updatedAt);
    return {
      loco: raw.loco && typeof raw.loco === "object" ? raw.loco : null,
      scene: typeof raw.scene === "string" ? raw.scene : null,
      updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
    };
  }

  function getTrainSettings() {
    return state.trainSettings ? { ...state.trainSettings } : null;
  }

  function announceTrainSettings() {
    document.dispatchEvent(new CustomEvent("lernapp:train-settings", { detail: getTrainSettings() }));
  }

  // --- Spielstände ----------------------------------------------------------
  // Bestenlisten, Rundenzahlen und alles andere, was ein Spiel selbst führt.
  // Die Katalog-Spiele legen ihren Fortschritt Level für Level unter
  // users/<uid>/levelProgress ab; Spiele mit eigenem Konto – Tier-Sprung, der
  // Karten-Merker – haben dort nichts zu suchen. Sie bekommen ein Feld am
  // Benutzerdokument, in dem jedes Spiel seinen eigenen Kasten hat.
  //
  // Zusammengeführt wird nicht hier: was "neuer" heisst, weiss nur das Spiel.
  // Eine Bestenliste will vereinigt werden, ein Levelstand hochgezählt. Diese
  // Seite reicht die Kästen nur durch.
  function readGameState(raw) {
    if (!raw || typeof raw !== "object") return {};
    const out = {};
    Object.keys(raw).forEach((key) => {
      const entry = raw[key];
      if (!entry || typeof entry !== "object" || !entry.data) return;
      const at = Number(entry.updatedAt);
      out[key] = { data: entry.data, updatedAt: Number.isFinite(at) ? at : 0 };
    });
    return out;
  }

  function getGameState(key) {
    if (!state.gameState) return null;
    if (!key) return JSON.parse(JSON.stringify(state.gameState));
    const entry = state.gameState[key];
    return entry ? JSON.parse(JSON.stringify(entry)) : null;
  }

  function announceGameState() {
    document.dispatchEvent(new CustomEvent("lernapp:game-state", { detail: getGameState() }));
  }

  // --- Gespielt, aber ohne Level -----------------------------------------------
  // Die Spiele mit eigenem Konto – Turmbau, Memory, Tier-Sprung, der
  // Karten-Merker und die übrigen aus game-cloud.js – laufen nicht über den
  // Levelkatalog. Sie rufen recordLevelStart nie auf, und ihr Stand ging für
  // einen Gast nirgendwohin: saveGameState brach ohne Konto ab. Ein Kind, das
  // eine Stunde Turmbau spielt, hinterliess in der Cloud genau nichts – im
  // Adminbereich stand bei jedem dieser Spiele "nie gespielt", und zwar
  // unabhängig davon, wie viel wirklich gespielt wurde.
  //
  // Eine blosse Marke "hat gespielt" reichte dafür nicht: Sie beantwortet, OB
  // jemand gespielt hat, aber nicht WAS. Die Frage lautet aber "wer hat
  // Turmbau gespielt, und wie weit ist er gekommen" – und die beantwortet nur
  // der Kasten des Spiels selbst.
  //
  // Deshalb geht er jetzt auch für einen Gast in die Cloud, in derselben Form
  // wie bei einem Konto (gameState.<schluessel> = { data, updatedAt }). Der
  // Adminbereich rechnet damit unverändert weiter.
  //
  // Was sich dabei NICHT ändert: Massgeblich bleibt das Gerät. Gelesen wird
  // der Kasten für einen Gast nie zurück – game-cloud.js führt ihn aus dem
  // localStorage, und ein zweites Gerät hat ohnehin eine eigene Gastkennung.
  // Was hier liegt, ist eine Kopie für den Adminbereich, kein Speicherort.
  function gastSpielstandSichern(key, entry) {
    if (!state.db || !state.firebaseReady) return;
    const owner = currentOwner();
    if (owner?.kind !== "guest") return;
    ownerRef(owner)
      .set({
        ...ownerActivityPayload(owner),
        // Die Marke bleibt: guestHasPlayed() fragt zuerst sie, und sie
        // beantwortet die Frage auch dann noch, wenn ein Spiel einmal keinen
        // Kasten schreibt.
        hatGespielt: true,
        letztesSpielAt: serverTimestamp(),
        gameState: { [key]: entry },
      }, { merge: true })
      .catch(() => {
        // Wie überall bei den Gastzahlen: Eine fehlende Zeile in einer
        // Statistik ist kein Grund, ein Spiel zu stören.
      });
  }

  async function saveGameState(key, data) {
    if (!key || !data || typeof data !== "object") return false;
    const entry = { data, updatedAt: Date.now() };

    if (!state.user || !state.db) {
      // Ohne Konto: Der Stand bleibt auf dem Gerät, eine Kopie geht in die
      // Cloud. Zurück kommt false, weil sich für die App nichts geändert hat –
      // state.gameState gehört einem Konto, und ein Gast hat keines.
      gastSpielstandSichern(key, entry);
      return false;
    }

    const previous = state.gameState;
    state.gameState = { ...(state.gameState || {}), [key]: entry };
    try {
      // Nur das eine Feld: ein Schreibvorgang mit dem ganzen Kasten würde die
      // Stände anderer Spiele überschreiben, die inzwischen dazugekommen sind.
      await userRef().set({ gameState: { [key]: entry }, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch (error) {
      state.gameState = previous;
      console.warn(`Spielstand ${key} konnte nicht gespeichert werden`, error);
      return false;
    }
  }

  function announceProgress() {
    window.LernappRefreshProgress?.();
    document.dispatchEvent(new CustomEvent("lernapp:progress-changed"));
  }

  async function saveTrainSettings(settings) {
    const stored = readTrainSettings(settings);
    if (!stored) return false;
    // Ohne Konto bleibt die Lok auf dem Gerät. Das Gastdokument wäre der
    // falsche Ort: seine Kennung steht im localStorage und wandert nicht mit.
    if (!state.user || !state.db) return false;
    if (!stored.updatedAt) stored.updatedAt = Date.now();

    const previous = state.trainSettings;
    state.trainSettings = stored;
    try {
      await userRef().set({ trainSettings: stored, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch (error) {
      // Die Lok steht schon lokal; ein abgelehnter Schreibvorgang darf das
      // Startbild nicht aufhalten.
      state.trainSettings = previous;
      console.warn("Lok-Einstellung konnte nicht gespeichert werden", error);
      return false;
    }
  }

  // --- Gruppen --------------------------------------------------------------
  // Mehrere Konten, die ihre Züge nebeneinander sehen: eine Familie, eine
  // Klasse. Die Gruppe steht als Feld am Konto – users/<uid>.group – und nicht
  // in einer eigenen Kollektion. Das ist der Grund, warum die Regel in
  // firestore.rules so kurz ausfällt: sie entscheidet über dasselbe Dokument,
  // das sie freigibt.
  //
  //   id           gemeinsamer Schlüssel aller Mitglieder
  //   name         wie die Gruppe heisst (nur zum Anzeigen im Admin-Bereich)
  //   displayName  unter welchem Namen der Zug dieses Kontos in der Gruppe steht
  //   by           woher die Gruppe kommt: "familie" vom Server, "admin" von Hand
  //
  // Geschrieben wird das Feld nur vom Admin – und vom Server, der jede Familie
  // von selbst zu einer Gruppe macht (netlify/functions/_lib/familie.mjs). An
  // "by" erkennt der Server, was er nicht anfassen darf: Eine übergreifende
  // Gruppe, die der Admin gesetzt hat, überlebt jede Anmeldung.
  function readGroup(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = String(raw.id || "").trim();
    if (!id) return null;
    return {
      id,
      name: cleanDisplayName(raw.name) || id,
      displayName: cleanDisplayName(raw.displayName),
      by: raw.by === "admin" ? "admin" : "familie",
    };
  }

  function getGroup() {
    return state.group ? { ...state.group } : null;
  }

  function announceGroup() {
    document.dispatchEvent(new CustomEvent("lernapp:group-changed", { detail: getGroup() }));
  }

  // ---------------------------------------------------------------------------
  // Der Kauf
  // ---------------------------------------------------------------------------
  // entitlements/{uid} schreibt nur der Server, nach einer Zahlung bei Stripe.
  // Hier wird er nur gelesen – und zwar beobachtet, nicht einmal geholt: Wer
  // im Profilfenster kauft, kommt von Stripe zurück, und der Eintrag ist da,
  // ohne dass jemand neu laden muss. Wer die Sperre in der App entscheidet
  // (entitlement.js), hört auf lernapp:entitlement-changed.
  function readEntitlement(data) {
    if (!data || typeof data !== "object") return null;
    return {
      plan: typeof data.plan === "string" ? data.plan : "",
      active: Boolean(data.active),
      via: typeof data.via === "string" ? data.via : null,
      grantedAtMs: Number(data.grantedAtMs) || 0,
    };
  }

  function watchEntitlement(userId) {
    stopWatchingEntitlement();
    if (!state.db || !userId) return;
    state.entitlementLoaded = false;
    const uebernehmen = (snapshot) => {
      const next = snapshot?.exists ? readEntitlement(snapshot.data()) : null;
      const changed = JSON.stringify(next) !== JSON.stringify(state.entitlement) || !state.entitlementLoaded;
      state.entitlement = next;
      state.entitlementLoaded = true;
      if (changed) announceEntitlement();
      if (changed && state.dashboardOpen && state.user) refreshDashboard().catch(() => {});
    };
    // Kein Zugriff oder kein Netz: dann gilt "nicht gekauft" – die Sperre
    // fällt zu, nicht auf. Ein Kind aus der Zeit vor dem Kauf bleibt trotzdem
    // frei, das entscheidet entitlement.js an der Rolle.
    const gescheitert = () => {
      state.entitlement = null;
      state.entitlementLoaded = true;
      announceEntitlement();
    };
    // Nichts hiervon darf den Anmeldevorgang zu Fall bringen: Der Kauf ist
    // ein Zusatz zum Konto, nicht seine Voraussetzung. Fehlt onSnapshot –
    // etwa in einem Prüfskript mit nachgebautem Firestore –, reicht ein
    // einmaliges Lesen.
    try {
      const ref = state.db.collection("entitlements").doc(userId);
      if (typeof ref.onSnapshot === "function") {
        state.entitlementUnsubscribe = ref.onSnapshot(uebernehmen, gescheitert);
      } else {
        Promise.resolve(ref.get()).then(uebernehmen, gescheitert);
      }
    } catch {
      gescheitert();
    }
  }

  function stopWatchingEntitlement() {
    if (typeof state.entitlementUnsubscribe === "function") state.entitlementUnsubscribe();
    state.entitlementUnsubscribe = null;
    const hatte = state.entitlement || state.entitlementLoaded;
    state.entitlement = null;
    state.entitlementLoaded = false;
    if (hatte) announceEntitlement();
  }

  function announceEntitlement() {
    document.dispatchEvent(new CustomEvent("lernapp:entitlement-changed", { detail: getEntitlement() }));
  }

  function getEntitlement() {
    return state.entitlement ? { ...state.entitlement } : null;
  }

  // ---------------------------------------------------------------------------
  // Die Statuszeile
  // ---------------------------------------------------------------------------
  // .auth-status ist rot, und das ist richtig: Dort steht meistens, was
  // schiefging. Nur stand dort auch "Die Kasse wird geöffnet..." – in
  // Alarmrot, mitten im Kauf, und es sah aus, als wäre gerade etwas
  // misslungen. Eine Meldung, die nur sagt, dass etwas läuft, ist kein
  // Fehler; sie bekommt die ruhige Farbe.
  //
  // Drei Zustände, mehr gibt es nicht: "fehler" (rot, die Vorgabe), "ok"
  // (grün) und "laeuft" (grau). Wer eine neue Meldung setzt, überschreibt
  // damit auch immer den vorherigen Zustand – deshalb steht das hier an
  // einer Stelle und nicht als classList.add neben jedem Text.
  function zeigeMeldung(element, text, art = "fehler") {
    if (!element) return;
    element.textContent = text;
    element.classList.toggle("is-ok", art === "ok");
    element.classList.toggle("is-laeuft", art === "laeuft");
  }

  // ---------------------------------------------------------------------------
  // Der Server
  // ---------------------------------------------------------------------------
  // Die Netlify-Funktionen unter /api/ tun, was der Client nicht darf: Kinder
  // anlegen, die Kasse bei Stripe öffnen, Mails verschicken. Sie erkennen den
  // Anrufer am ID-Token des Kontos – Firebase stellt es aus, der Server prüft
  // es.
  // nutzer: normalerweise das angemeldete Konto. Mitgegeben wird es nur direkt
  // nach dem Anlegen – dann steht das Konto schon fest, aber der Beobachter
  // von Firebase hat state.user noch nicht gesetzt, und ohne Token gäbe es
  // eine Absage für etwas, das längst erlaubt ist.
  async function serverAufruf(pfad, body = {}, nutzer = null) {
    const konto = nutzer || state.user;
    if (!konto) throw authInputError("lernapp/not-signed-in");
    const token = await konto.getIdToken();
    let antwort;
    try {
      antwort = await fetch(`/api/${pfad}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body || {}),
      });
    } catch {
      throw authInputError("auth/network-request-failed");
    }
    let daten = {};
    try { daten = await antwort.json(); } catch { daten = {}; }
    if (!antwort.ok) {
      const fehler = new Error(daten.message || "Der Server hat abgelehnt.");
      fehler.code = `server/${daten.error || antwort.status}`;
      fehler.status = antwort.status;
      throw fehler;
    }
    return daten;
  }

  // Der eine Aufruf, der ohne Anmeldung auskommt: "Passwort vergessen". Wer
  // sein Passwort vergessen hat, kann sich ja gerade nicht anmelden. Der
  // Server prüft deshalb nicht, wer anruft, sondern bremst nach Adresse
  // (netlify/functions/passwort-mail.mjs).
  async function offenerServerAufruf(pfad, body = {}) {
    const antwort = await fetch(`/api/${pfad}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!antwort.ok) {
      const fehler = new Error("Der Server hat abgelehnt.");
      fehler.code = `server/${antwort.status}`;
      throw fehler;
    }
    return antwort.json().catch(() => ({}));
  }

  // Die Kasse: Der Server erstellt die Sitzung bei Stripe, wir gehen hin.
  async function zurKasse() {
    const { url } = await serverAufruf("checkout");
    if (!url) throw new Error("Die Kasse hat keine Adresse geliefert.");
    window.location.assign(url);
  }

  // stufe: die Altersgruppe, als Schwierigkeitsstufe (journey-plan.js, STUFEN).
  async function kindAnlegen(name, passwort, stufe = "mittel") {
    const ergebnis = await serverAufruf("kind-anlegen", { name, passwort, stufe });
    if (ergebnis?.uid) state.children = [...state.children, { uid: ergebnis.uid, name: ergebnis.name || name }];
    return ergebnis;
  }

  async function kindPasswortSetzen(uid, passwort) {
    return serverAufruf("kind-passwort", { uid, passwort });
  }

  // Ein Kinderprofil ganz entfernen: Konto, Fortschritt, Anmeldung. Der Server
  // prüft an children[] der Eltern, ob das Kind wirklich zu ihnen gehört.
  async function kindLoeschen(uid) {
    const ergebnis = await serverAufruf("kind-loeschen", { uid });
    state.children = state.children.filter((kind) => kind.uid !== uid);
    return ergebnis;
  }

  // Ein Konto freischalten, ohne dass jemand zahlt – oder die Freischaltung
  // zurücknehmen. Nur der Admin; geprüft wird das am Token auf dem Server,
  // nicht an dieser Zeile. Es trifft immer die ganze Familie, wie ein Kauf.
  async function kontoFreischalten(uid, frei = true) {
    return serverAufruf("freischalten", { uid, frei: frei !== false });
  }

  // Ein Konto restlos entfernen, Anmeldung eingeschlossen. Nur der Admin;
  // geprüft wird das am Token auf dem Server, nicht an dieser Zeile. Ein
  // Elternkonto mit Kindern geht nur mit auchKinder – sonst blieben die
  // Kinder als Konten ohne Eltern zurück und wären damit dauerhaft frei.
  async function kontoLoeschen(uid, auchKinder = false) {
    return serverAufruf("konto-loeschen", { uid, auchKinder: auchKinder === true });
  }

  // Die Familie als Gruppe: Damit stehen die Züge der Geschwister auf dem
  // Startbild nebeneinander. Neue Kinder bekommen das beim Anlegen; Konten
  // von vorher holen es hier nach – einmal je Sitzung, still, und ein
  // Fehlschlag darf nichts aufhalten: Ohne Gruppe fehlt ein Zug auf dem
  // Bild, sonst nichts.
  let familieGefragt = false;
  async function familieVerbinden() {
    const antwort = await serverAufruf("familie");
    if (antwort?.gruppe) applyGroup(readGroup(antwort.gruppe));
    return antwort;
  }

  function familieNachholen() {
    if (familieGefragt || state.group) return;
    const gehoertZuFamilie = (state.role === "child" && state.parentUid) || (isParentAccount() && state.children.length > 0);
    if (!gehoertZuFamilie) return;
    familieGefragt = true;
    familieVerbinden().catch(() => { /* beim nächsten Anmelden wieder */ });
  }

  // Zurück von der Kasse. Stripe leitet auf ?kauf=erfolg oder ?kauf=abbruch;
  // der Parameter wird gelesen, aus der Adresse genommen und einmal im
  // Profilfenster gezeigt. Ob wirklich bezahlt wurde, sagt nicht die
  // Adresse, sondern der Eintrag, den der Webhook schreibt – auf den wartet
  // die Karte im Profilfenster.
  function liesKaufRueckkehr() {
    try {
      const params = new URLSearchParams(window.location.search);
      const kauf = params.get("kauf");
      if (kauf !== "erfolg" && kauf !== "abbruch") return;
      state.kaufRueckkehr = kauf;
      params.delete("kauf");
      params.delete("session_id");
      const rest = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}`);
    } catch { /* ohne Verlauf oder ohne Adresse */ }
  }

  // ---------------------------------------------------------------------------
  // Die Familie
  // ---------------------------------------------------------------------------

  // children[] am Elternkonto: {uid, name}. Der Server schreibt es, wenn er
  // ein Kind anlegt; hier wird es gelesen, damit das Profilfenster die Kinder
  // nennen kann, ohne ihre Konten lesen zu dürfen.
  function readChildren(value) {
    if (!Array.isArray(value)) return [];
    return value
      .map((entry) => {
        if (typeof entry === "string") return { uid: entry, name: "" };
        if (entry && typeof entry === "object" && typeof entry.uid === "string") {
          return { uid: entry.uid, name: typeof entry.name === "string" ? entry.name : "" };
        }
        return null;
      })
      .filter(Boolean);
  }

  // Steht fest, wer hier spielt? Erst dann darf etwas gesperrt werden. Ohne
  // Firebase ist es das Gerät allein; mit Firebase braucht es den Bescheid
  // der Anmeldung, und bei einem angemeldeten Konto dazu die Rolle (der
  // Gründer-Zugang hängt an ihr) und den Kaufstand.
  function isAccountReady() {
    if (!state.firebaseReady) return true;
    if (!state.authReady) return false;
    if (!state.user) return true;
    return state.profileReady && state.entitlementLoaded;
  }

  function getRole() { return state.user ? state.role : null; }
  function getParentUid() { return state.user ? state.parentUid : null; }
  function getChildren() { return state.user ? state.children.map((child) => ({ ...child })) : []; }
  // Ein Elternkonto kauft und legt Kinder an. Der Admin ist auch eines: Er
  // hat eine echte Adresse, und seine Kinder sollen bei ihm stehen.
  function isParentAccount() { return state.role === "parent" || state.role === "admin"; }

  // ---------------------------------------------------------------------------
  // Eltern: Anmelden mit echter Adresse
  // ---------------------------------------------------------------------------
  // Anders als beim Kind gibt es hier keine technische Adresse und keine
  // feste Endung am Passwort: Es ist ein gewöhnliches Firebase-Konto, mit dem
  // auch "Passwort vergessen" geht – die Mail kommt von Firebase.
  function cleanEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function assertParentEmail(email) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw authInputError("auth/invalid-parent-email");
    if (isTechnicalEmail(email)) throw authInputError("auth/invalid-parent-email");
  }

  async function signInParent(email, password) {
    const clean = cleanEmail(email);
    assertParentEmail(clean);
    await state.auth.signInWithEmailAndPassword(clean, String(password || ""));
  }

  async function signUpParent(email, password) {
    const clean = cleanEmail(email);
    assertParentEmail(clean);
    if (String(password || "").length < 6) throw authInputError("auth/parent-password-short");
    const credential = await state.auth.createUserWithEmailAndPassword(clean, String(password));
    await begruessung(credential?.user);
  }

  // Die Begrüssung, und mit ihr der Bestätigungslink.
  //
  // Bis hierher stand hier sendEmailVerification – Firebase schickte dann von
  // selbst eine Mail: Absender noreply@lernapp-8d944.firebaseapp.com, Betreff
  // "Verify your email for project-123146993935", darunter ein nackter Link.
  // Wer so etwas bekommt, glaubt an Betrug, nicht an eine Kinder-App.
  //
  // Jetzt schreibt der Server die Mail, mit kids@alae.app als Absender, und
  // rechnet denselben Bestätigungslink selbst aus
  // (netlify/functions/willkommen.mjs). Bestätigen muss weiterhin niemand.
  //
  // Zwei Dinge sind hier Absicht:
  //
  //   - Gewartet wird darauf. Direkt nach dem Anlegen geht es in der Kaufkarte
  //     weiter zur Kasse, und ein Aufruf, der erst nach dem Seitenwechsel
  //     losläuft, läuft gar nicht mehr.
  //   - Und ein Fehler bleibt hier. Ein Konto ist angelegt, auch wenn die
  //     Begrüssung hängt; wer deshalb eine Fehlermeldung bekäme, versuchte es
  //     noch einmal – und stünde dann vor "diese Adresse gibt es schon".
  async function begruessung(nutzer) {
    try {
      await serverAufruf("willkommen", {}, nutzer || null);
    } catch (fehler) {
      console.warn("Begrüssungsmail nicht ausgelöst", fehler);
    }
  }

  async function sendParentPasswordReset(email) {
    const clean = cleanEmail(email);
    assertParentEmail(clean);
    // Auch diese Mail schreibt der Server. Geht er nicht ans Telefon – Netz
    // weg, Funktion schläft –, oder sagt er, dass er gar nicht verschicken
    // kann (RESEND_API_KEY fehlt), schickt Firebase sie wie früher: hässlich,
    // aber da. Ein vergessenes Passwort ist der schlechteste Moment für
    // "probier es später noch einmal".
    //
    // Was der Server NICHT verrät, ist, ob es zu dieser Adresse ein Konto
    // gibt: Seine Antwort ist für jede Adresse dieselbe.
    try {
      const antwort = await offenerServerAufruf("passwort-mail", { email: clean });
      if (antwort?.versand === false) throw new Error("Der Server kann keine Mails verschicken.");
    } catch (fehler) {
      console.warn("Passwortmail über den Server ging nicht, Firebase übernimmt", fehler);
      await state.auth.sendPasswordResetEmail(clean);
    }
  }

  // Übernimmt eine gelesene Gruppe und meldet sie weiter, wenn sich etwas
  // geändert hat. Ohne den Vergleich meldete jedes Öffnen des Profilfensters
  // eine Änderung, und das Startbild lüde die fremden Züge jedes Mal neu.
  function applyGroup(group) {
    const before = JSON.stringify(state.group || null);
    state.group = group;
    if (JSON.stringify(state.group || null) === before) return false;
    announceGroup();
    return true;
  }

  // Der Name, unter dem ein Konto in der Gruppe steht. Der vom Admin vergebene
  // geht vor: er ist der einzige, den ein Erwachsener bewusst gewählt hat.
  function groupTrainName(userData = {}) {
    return cleanDisplayName(
      userData.group?.displayName ||
      userData.displayName ||
      userData.username ||
      "Kind"
    ) || "Kind";
  }

  // Die anderen Züge der Gruppe, mit allem, was das Startbild braucht: der
  // Name, die Lok, und woraus train-progress.js den Stand rechnet – gelöste
  // Level und die Spielstände der Spiele mit eigenem Konto.
  //
  // Ein Mitglied, dessen Level sich nicht lesen lassen, fällt nicht aus der
  // Gruppe – sein Zug steht dann eben leer da. Ein Fehler an einem Konto darf
  // nicht das ganze Gleis abräumen.
  async function loadGroupMembers() {
    if (!state.user || !state.db || !state.group?.id) return [];

    const snapshot = await state.db.collection("users").where("group.id", "==", state.group.id).get();

    const members = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data() || {};
      const settings = readTrainSettings(data.trainSettings);
      const member = {
        id: doc.id,
        name: groupTrainName(data),
        // Das eigene Konto ist dabei, aber gekennzeichnet: auf dem Gleis steht
        // es nicht ein zweites Mal, in der Bestenliste dagegen schon – wer
        // seinen Namen dort nicht findet, glaubt, er sei nicht dabei.
        eigen: doc.id === state.user.uid,
        loco: settings?.loco || null,
        // Auch die Landschaft: wer den Zug eines anderen gross ansieht, sieht
        // ihn vor dessen Himmel stehen, nicht vor dem eigenen.
        scene: settings?.scene || null,
        gameState: readGameState(data.gameState),
        // Zweimal dasselbe, für zwei Rechnungen: der Zug braucht nur zu wissen,
        // was gelöst ist, die Bestenliste auch Zeit, Züge und Neustarts.
        solved: [],
        levels: [],
      };

      try {
        const levels = await state.db.collection("users").doc(doc.id).collection("levelProgress").get();
        levels.forEach((entry) => {
          const level = { id: entry.id, ...(entry.data() || {}) };
          member.levels.push(level);
          if (level.solved && level.game && level.levelId) member.solved.push(`${level.game}.${level.levelId}`);
        });
      } catch (error) {
        console.warn(`Level von ${doc.id} konnten nicht gelesen werden`, error);
      }

      return member;
    }));

    // Immer dieselbe Reihenfolge: ein Gleis, dessen Züge bei jedem Start die
    // Plätze tauschen, verwirrt mehr als es zeigt.
    members.sort((a, b) => a.name.localeCompare(b.name, "de"));
    return members;
  }

  // Nur die anderen – für das Gleis über dem eigenen Zug.
  async function loadGroupTrains() {
    return (await loadGroupMembers()).filter((member) => !member.eigen);
  }

  // Ordnet ein Konto einer Gruppe zu oder nimmt es heraus. Nur der Admin darf
  // das; die Regel lässt genau dieses eine Feld durch. Ein leerer Name nimmt
  // das Konto heraus – und ein Konto einer Familie bekommt beim nächsten
  // Anmelden seine Familiengruppe zurück, weil der Server sie nachträgt.
  async function setUserGroup(userId, { name = "", displayName = "" } = {}) {
    if (!userId || !state.db) return false;
    const groupName = cleanDisplayName(name);
    const id = loginSlug(groupName);
    // by: "admin" ist die Marke, an der der Server diese Zuordnung stehen
    // lässt. Ohne sie schriebe familieVerbinden bei der nächsten Anmeldung
    // die Familiengruppe darüber – und eine übergreifende Gruppe hielte
    // keinen Tag.
    const payload = id
      ? { id, name: groupName, displayName: cleanDisplayName(displayName), by: "admin", updatedAt: Date.now() }
      : deleteField();

    await state.db.collection("users").doc(userId).set(
      { group: payload, updatedAt: serverTimestamp() },
      { merge: true },
    );

    // Das eigene Konto: die Gruppe im Zustand stimmt sonst bis zum nächsten
    // Anmelden nicht. Ein fremdes: die Gruppe kann dieselbe sein, dann steht
    // auf dem Startbild jetzt ein Zug mehr oder weniger.
    if (userId === state.user?.uid) applyGroup(id ? readGroup(payload) : null);
    else announceGroup();
    return true;
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

  function deleteField() {
    return window.firebase.firestore.FieldValue.delete();
  }

  async function signIn(loginName, password) {
    await state.auth.signInWithEmailAndPassword(emailForSignIn(loginName), passwordForSignIn(loginName, password));
  }

  async function signInWithGoogle() {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    const credential = await state.auth.signInWithPopup(provider);
    // Wer sich zum ersten Mal mit Google anmeldet, legt damit ein Elternkonto
    // an – und soll dieselbe Begrüssung bekommen wie jemand, der es mit
    // Adresse und Passwort tut. Einen Bestätigungslink braucht diese Mail
    // nicht: Bei Google ist die Adresse bewiesen.
    if (credential?.additionalUserInfo?.isNewUser) await begruessung(credential.user);
  }

  async function signOut() {
    await flushCurrentSession({ close: true });
    await state.auth.signOut();
  }


  // --- Das Wagen-Set ---------------------------------------------------------
  // Der Zug hat zwei Sets Wagen: die Güterwagen und die Gestalten, die sich
  // aus Fracht verwandeln. Es gibt sie an zwei Stellen, und das ist der Kern
  // dieses Abschnitts:
  //
  //   config/train            gilt für alle, auch für Gäste ohne Konto.
  //                           Umstellen darf das nur der Admin.
  //   users/<uid>.wagonSet    gilt für dieses eine Konto. Setzen darf das ein
  //                           Elternkonto – für sich und seine Kinder –, und
  //                           es gilt dann auch nur für diese Familie.
  //
  // Welches von beiden zählt, ist eine Frage des Vorrangs und ausdrücklich
  // KEINE der Uhrzeit: Die Wahl der Familie gewinnt, solange es sie gibt, und
  // ein globaler Wechsel des Admins hebt alle Familienwahlen auf (er schreibt
  // das Feld an jedem Konto weg). Damit wirkt "für alle" wirklich für alle.
  //
  // Zwei Zeitmarken zu vergleichen wäre der naheliegende Weg gewesen und war
  // der falsche: switchedAtMs kommt vom Gerät dessen, der umstellt – beim
  // globalen Wechsel vom Laptop des Admins, bei der Familie vom Handy der
  // Eltern. Geht das Handy einen Tag vor, hätte ein späterer globaler Wechsel
  // die kleinere Zahl und käme bei dieser Familie nie an, obwohl ihr
  // Fortschritt dabei zurückgesetzt würde. Verglichen wird eine Zeitmarke
  // deshalb nur noch mit sich selbst: die aus der Cloud mit der Kopie, die
  // dieses Gerät davon gemerkt hat (applyWagonSet).
  //
  // Ein Wechsel heisst: andere Wagen, anderes Tempo, und alle Wagen beginnen
  // bei 0.
  //
  // Dazu trägt das Dokument den Zeitpunkt des Wechsels. Jedes Gerät merkt
  // sich, welchen Wechsel es schon kennt, und räumt bei einem neueren seinen
  // Fortschritt weg, bevor irgendetwas davon hochgeschoben würde – dieselbe
  // Marke wie beim Zurücksetzen eines Kontos, nur für alle. Die Konten selbst
  // setzt der Admin beim Wechsel eines nach dem anderen zurück; Gäste haben
  // ihren Stand nur auf dem Gerät, und das räumt beim nächsten Öffnen auf.
  //
  // Die Zahl bleibt eine Zahl in Millisekunden vom Gerät des Umstellenden und
  // wird nur mit sich selbst verglichen: Uhren müssen nicht übereinstimmen.
  function wagonSetRef() {
    return state.db ? state.db.collection("config").doc("train") : null;
  }

  function readWagonSet(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = String(raw.wagonSet ?? raw.id ?? "").trim();
    if (!id || id.length > 8) return null;
    const switchedAtMs = Number(raw.switchedAtMs);
    return { id, switchedAtMs: Number.isFinite(switchedAtMs) ? switchedAtMs : 0 };
  }

  function readLocalWagonSet() {
    try {
      return readWagonSet(JSON.parse(localStorage.getItem(LOCAL_WAGON_SET_KEY) || "null"));
    } catch { return null; }
  }

  function writeLocalWagonSet(set) {
    try {
      localStorage.setItem(LOCAL_WAGON_SET_KEY, JSON.stringify({ id: set.id, switchedAtMs: set.switchedAtMs }));
    } catch { /* privater Modus */ }
  }

  // Das wirksame Set: die Wahl der Familie, sonst die für alle. Kennt dieses
  // Gerät keines von beiden, gilt das zuletzt gemerkte, und ganz am Anfang
  // das erste.
  function effectiveWagonSet() {
    return state.ownWagonSet || state.globalWagonSet || null;
  }

  function getWagonSet() {
    return state.wagonSet || readLocalWagonSet() || { id: "1", switchedAtMs: 0 };
  }

  // Das Set der eigenen Familie, sofern eines gesetzt ist – sonst null, und
  // dann gilt das globale. Der Elternbereich zeigt das eine oder das andere.
  function getFamilyWagonSet() {
    return state.ownWagonSet ? { ...state.ownWagonSet } : null;
  }

  // Übernimmt das Set, das am eigenen Konto steht. Wird beim Anmelden und bei
  // jedem Lesen des Kontos aufgerufen; ohne Konto gibt es keines.
  function applyOwnWagonSet(raw) {
    state.ownWagonSet = readWagonSet(raw);
    return applyWagonSet(effectiveWagonSet());
  }

  // Hört auf das Dokument, solange die Seite offen ist: stellt der Admin um,
  // während ein Kind spielt, wechseln dessen Wagen beim nächsten Blick auf den
  // Zug – nicht erst beim nächsten Öffnen der App. Ohne Netz oder vor dem
  // Anlegen der Regeln bleibt es beim gemerkten Set.
  function watchWagonSet() {
    const ref = wagonSetRef();
    if (!ref) return;
    const uebernehmen = (doc) => {
      state.globalWagonSet = readWagonSet(typeof doc?.data === "function" ? doc.data() : null);
      applyWagonSet(effectiveWagonSet());
    };
    const melden = (error) => console.warn("Das Wagen-Set konnte nicht gelesen werden", error);
    try {
      if (typeof ref.onSnapshot === "function") ref.onSnapshot(uebernehmen, melden);
      else ref.get().then(uebernehmen).catch(melden);
    } catch (error) {
      melden(error);
    }
  }

  // Übernimmt ein Set aus der Cloud. Ist der Wechsel neuer als der, den dieses
  // Gerät kennt, geht alles weg, was vor ihm gespielt wurde – lokal und im
  // Speicher der angemeldeten Konten –, und der Zug zeichnet sich neu.
  function applyWagonSet(remote) {
    if (!remote?.id) return false;
    const local = readLocalWagonSet();
    const newer = remote.switchedAtMs > (local?.switchedAtMs || 0);
    const changed = !local || local.id !== remote.id || newer;
    state.wagonSet = remote;
    if (!changed) return false;

    writeLocalWagonSet(remote);
    if (newer) {
      clearLocalProgress();
      window.LernappGameCloud?.resetAll?.();
      state.progress.clear();
      state.gameState = {};
      announceGameState();
      // Angemeldet: der Stand in der Cloud ist vom Admin geleert worden, aber
      // was hier im Speicher liegt, stammt von vor dem Wechsel. Neu holen.
      if (state.user && state.db) loadProgress().then(announceProgress).catch(() => {});
    }
    document.dispatchEvent(new CustomEvent("lernapp:wagon-set", { detail: { ...remote } }));
    announceProgress();
    return true;
  }

  // Erst jedes betroffene Konto zurücksetzen, dann das Set umstellen. In
  // dieser Reihenfolge, damit ein Gerät, das den Wechsel sieht, in der Cloud
  // schon leere Konten vorfindet. onProgress meldet, wie weit es ist – bei
  // einem Dutzend Konten dauert das einen Moment.
  async function resetAccountsForSwitch(ids, onProgress) {
    // Das eigene Konto zuletzt: es räumt auch dieses Gerät auf, und bis dahin
    // sollen die anderen schon durch sein.
    const reihe = [...ids].sort((a, b) => (a === state.user?.uid) - (b === state.user?.uid));
    let done = 0;
    for (const userId of reihe) {
      await resetProgressFor(userId);
      done += 1;
      onProgress?.(done, reihe.length);
    }
    return reihe.length;
  }

  // Der globale Wechsel, nur für den Admin: alle Konten, und config/train.
  //
  // Dabei fallen die Familienwahlen weg. Ohne das hiesse "für alle" in
  // Wahrheit "für alle ausser denen, die sich einmal anders entschieden
  // haben" – und deren Fortschritt würde hier trotzdem zurückgesetzt, ihre
  // Wagen aber nicht gewechselt. Wer danach wieder eigene Wagen will, wählt
  // sie neu; das ist ein Klick und dafür eindeutig.
  async function switchWagonSet(id, { onProgress } = {}) {
    const setId = String(id || "").trim();
    if (!setId || !state.db || !isAdminUser()) throw Object.assign(new Error("lernapp/not-admin"), { code: "permission-denied" });

    const snapshot = await state.db.collection("users").get();
    const ids = snapshot.docs.map((doc) => doc.id);
    const eigeneWahl = snapshot.docs.filter((doc) => doc.data()?.wagonSet?.id).map((doc) => doc.id);
    const accounts = await resetAccountsForSwitch(ids, onProgress);
    for (const userId of eigeneWahl) {
      await userRef(userId).set({ wagonSet: deleteField(), updatedAt: serverTimestamp() }, { merge: true });
    }
    state.ownWagonSet = null;

    const switchedAtMs = Date.now();
    await wagonSetRef().set({
      wagonSet: setId,
      switchedAtMs,
      switchedAt: serverTimestamp(),
      switchedBy: state.user?.uid || null,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Dieses Gerät gleich, nicht erst über den Umweg der Cloud.
    state.globalWagonSet = { id: setId, switchedAtMs };
    applyWagonSet(effectiveWagonSet());
    return { accounts, switchedAtMs, eigeneWahl: eigeneWahl.length };
  }

  // Ein Elternkonto ohne Kinder ist noch keine Familie – und es DARF das Feld
  // nicht schreiben: firestore.rules lässt das eigene wagonSet nur durch, wenn
  // children[] nicht leer ist (hasChildren). Geprüft wird das hier, VOR dem
  // Zurücksetzen: Sonst wäre der Fortschritt gelöscht und der Wechsel danach
  // abgelehnt – das Schlimmste von beidem. Die Karte bleibt ohne Kinder
  // ohnehin weg; das hier ist die zweite Tür für denselben Raum.
  function canSetFamilyWagonSet() {
    return Boolean(state.user) && isParentAccount() && state.children.length > 0;
  }

  function assertFamilyWagonAllowed() {
    if (!canSetFamilyWagonSet()) throw Object.assign(new Error("lernapp/family-needed"), { code: "lernapp/family-needed" });
  }

  // Der Wechsel für eine Familie, nur für ein Elternkonto: die eigenen Konten,
  // und das Set steht an jedem davon statt in config/train. Dasselbe Bild für
  // das Kind – nur eben nicht für alle anderen Familien.
  //
  // Geschrieben wird an jedes Konto einzeln und nicht einmal am Elternkonto,
  // weil ein Kind das Konto seiner Eltern nicht liest: Es kennt nur sein
  // eigenes Dokument. Ein Feld, das es nicht lesen darf, könnte es auch nicht
  // befolgen.
  async function switchFamilyWagonSet(id, { onProgress } = {}) {
    const setId = String(id || "").trim();
    if (!setId || !state.db || !state.user) throw authInputError("lernapp/not-signed-in");
    assertFamilyWagonAllowed();

    const ids = [state.user.uid, ...state.children.map((kind) => kind.uid)];
    const accounts = await resetAccountsForSwitch(ids, onProgress);

    const switchedAtMs = Date.now();
    const payload = { id: setId, switchedAtMs, switchedBy: state.user.uid };
    for (const userId of ids) {
      await userRef(userId).set({ wagonSet: payload, updatedAt: serverTimestamp() }, { merge: true });
    }

    state.ownWagonSet = { id: setId, switchedAtMs };
    applyWagonSet(effectiveWagonSet());
    return { accounts, switchedAtMs };
  }

  // Zurück zum Set, das für alle gilt: das Feld am Konto verschwindet, und
  // damit zählt wieder config/train. Auch das setzt zurück – der Zug sähe
  // sonst anders aus, als sein Fortschritt sagt.
  async function clearFamilyWagonSet({ onProgress } = {}) {
    if (!state.db || !state.user) throw authInputError("lernapp/not-signed-in");
    assertFamilyWagonAllowed();

    const ids = [state.user.uid, ...state.children.map((kind) => kind.uid)];
    const accounts = await resetAccountsForSwitch(ids, onProgress);
    for (const userId of ids) {
      await userRef(userId).set({ wagonSet: deleteField(), updatedAt: serverTimestamp() }, { merge: true });
    }

    state.ownWagonSet = null;
    // Ohne eigenes Set gilt wieder das globale – und weil es älter ist als der
    // Stand, den dieses Gerät kennt, räumt applyWagonSet von sich aus nichts
    // weg. Das haben die Zurücksetzungen oben schon getan.
    applyWagonSet(effectiveWagonSet());
    return { accounts };
  }

  // --- Fortschritt zurücksetzen ---------------------------------------------
  // Weg müssen vier Dinge: die gelösten Level und die Sitzungen als eigene
  // Dokumente, die Gesamtzahlen am Konto und die Spielstände der Spiele mit
  // eigenem Konto. Was bleibt, ist das Profil selbst – Name, Lok, Landschaft,
  // Levelmodus. Ein Kind, das von vorn anfängt, soll seine Lok behalten.
  //
  // Dazu eine Marke am Konto. Zurückgesetzt werden kann von einem anderen Gerät
  // aus: der Admin an seinem Laptop, das Kind am Tablet. Das Tablet erfährt
  // davon erst bei der nächsten Anmeldung, und bis dahin steht sein alter Stand
  // im localStorage. Ohne Marke schöbe es ihn beim Anmelden gleich wieder hoch
  // (syncLocalSolvedProgress tut genau das) – zurückgesetzt wäre nichts. Die
  // Marke ist eine Zahl in Millisekunden vom zurücksetzenden Gerät; verglichen
  // wird sie nur mit sich selbst, Uhren zweier Geräte müssen also nicht
  // übereinstimmen.
  async function resetProgressFor(userId) {
    if (!state.db || !userId) return false;
    const ref = userRef(userId);
    if (!ref) return false;
    const own = userId === state.user?.uid;

    // Eine laufende Sitzung würde ihre Zahlen nach dem Aufräumen nachtragen.
    if (own) stopActiveSession();

    // Die Schwierigkeitsstufe überlebt das Zurücksetzen: Sie ist keine
    // Leistung, sondern das Alter des Kindes – läge sie im gelöschten
    // gameState, spielte ein Dreijähriges danach auf "mittel".
    const reise = window.LernappReise;
    let stufe = null;
    try {
      const kasten = ((await ref.get()).data()?.gameState || {})[reise?.KEY]?.data;
      if (reise && kasten && (kasten.stufe || kasten.tempo)) stufe = reise.stufeIn(kasten);
    } catch { stufe = null; }

    await deleteAllDocs(ref.collection("levelProgress"));
    await deleteAllDocs(ref.collection("sessions"));

    const resetAtMs = Date.now();
    await ref.set({
      stats: { ...EMPTY_STATS },
      gameState: deleteField(),
      progressReset: {
        atMs: resetAtMs,
        at: serverTimestamp(),
        by: own ? "self" : "admin",
        byUid: state.user?.uid || null,
      },
      updatedAt: serverTimestamp(),
    }, { merge: true });
    if (stufe) {
      await ref.set({
        gameState: { [reise.KEY]: { data: { stufe, stufeAt: resetAtMs }, updatedAt: resetAtMs } },
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    // Das eigene Konto auf diesem Gerät: alles hier auch wegräumen. Ein fremdes
    // Konto nicht – der Fortschritt am Admin-Gerät gehört dem Admin.
    if (own) {
      state.progress.clear();
      state.gameState = {};
      state.progressResetAtMs = resetAtMs;
      clearLocalProgress();
      markLocalReset(userId, resetAtMs);
      window.LernappGameCloud?.resetAll?.();
      if (stufe) reise.setStufe(stufe);
      announceGameState();
      announceProgress();
    }

    return true;
  }

  // Ein Konto, das anderswo zurückgesetzt wurde: dieses Gerät zieht nach. Nur
  // einmal je Marke – sonst verlöre das Kind bei jeder Anmeldung, was es seit
  // dem Zurücksetzen gespielt hat.
  function applyRemoteProgressReset(userId) {
    const resetAtMs = state.progressResetAtMs;
    if (!resetAtMs || !userId) return false;
    if (readLocalReset(userId) >= resetAtMs) return false;

    clearLocalProgress();
    markLocalReset(userId, resetAtMs);
    window.LernappGameCloud?.resetAll?.();
    return true;
  }

  // Firestore löscht keine Sammlung, nur Dokumente. Und ein Stapel fasst 500:
  // vierzig Level mal fünf Spiele plus Sitzungen kommen da durchaus hin.
  async function deleteAllDocs(collectionRef) {
    const snapshot = await collectionRef.get();
    const docs = snapshot.docs;
    for (let index = 0; index < docs.length; index += 400) {
      const batch = state.db.batch();
      docs.slice(index, index + 400).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
    return docs.length;
  }

  function localResetKey(userId) {
    return `${LOCAL_RESET_PREFIX}${userId}`;
  }

  // Je Konto gemerkt: auf einem geteilten Gerät darf das Zurücksetzen des einen
  // Kindes nicht als erledigt gelten, wenn sich das andere anmeldet.
  function readLocalReset(userId) {
    try {
      const value = Number(localStorage.getItem(localResetKey(userId)));
      return Number.isFinite(value) ? value : 0;
    } catch { return 0; }
  }

  function markLocalReset(userId, atMs) {
    try { localStorage.setItem(localResetKey(userId), String(atMs)); } catch { /* privater Modus */ }
  }

  // Alles unter "lernapp." ist Fortschritt, ausser dem, was in LOCAL_KEEP_KEYS
  // steht: gelöste Level, Sterne, Bestenlisten, Übungsstände und die gesehenen
  // Wagenstufen. Letztere müssen mit: sie merken sich den höchsten je gesehenen
  // Stand, und ohne sie bliebe die Feier beim Wiederaufbau des ersten Wagens aus.
  function clearLocalProgress() {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(LOCAL_KEY_PREFIX))
        .filter((key) => !key.startsWith(LOCAL_RESET_PREFIX) && !LOCAL_KEEP_KEYS.has(key))
        .forEach((key) => localStorage.removeItem(key));
    } catch { /* privater Modus */ }
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
    if (state.kaufModus) renderKaufSeite();
    else if (state.user) refreshDashboard();
    else renderLoggedOut();
    releaseAccountHelp?.();
    releaseAccountHelp = window.LernappKids?.pushHelp?.(state.kaufModus
      ? "Das ist die Seite für Erwachsene: Hier steht, was Gripszug kostet und was dazugehört. Mit dem Kreuz oben rechts schliesst du das Fenster."
      : "Das ist das Profilfenster für Erwachsene. Hier siehst du den Lernfortschritt und kannst dich an- oder abmelden. Mit dem Kreuz oben rechts schliesst du das Fenster.") || null;
    modalContent.querySelector("input, button")?.focus();
  }

  // Das Tor der Schranke führt hierher: erst der Preis, dann die Anmeldung.
  function openKauf() {
    state.kaufModus = true;
    openModal();
  }

  function closeModal() {
    modal.hidden = true;
    modal.classList.add("hidden");
    state.dashboardOpen = false;
    state.kaufModus = false;
    state.kaufRueckkehr = null;
    releaseAccountHelp?.();
    releaseAccountHelp = null;
    accountButton.focus();
  }

  // Zwei Wege ins Konto. Das Kind: Name und Passwort, wie bisher. Die
  // Eltern: ihre E-Mail-Adresse – damit kaufen sie, legen Kinderprofile an
  // und bekommen "Passwort vergessen" per Mail. Ein neues Kind legt nicht
  // mehr das Kind selbst an, sondern das Elternkonto: sonst gehörte es zu
  // niemandem, und der Kauf der Eltern käme nie bei ihm an. Konten aus der
  // Zeit davor melden sich wie immer an.
  const LOGIN_TAB_KEY = "lernapp.login.reiter";

  function readLoginTab() {
    try { return localStorage.getItem(LOGIN_TAB_KEY) === "eltern" ? "eltern" : "kind"; } catch { return "kind"; }
  }

  function writeLoginTab(tab) {
    try { localStorage.setItem(LOGIN_TAB_KEY, tab); } catch { /* privater Modus */ }
  }

  function renderLoggedOut() {
    // Im Kaufmodus bleibt der Verkaufsbildschirm stehen – auch wenn sich
    // zwischendurch ein Konto abmeldet (ein Kind, das dem Elternkonto Platz
    // macht). Sonst stünde mitten im Kauf plötzlich "Anmelden" da.
    if (state.kaufModus) { renderKaufSeite(); return; }
    accountPanel.classList.remove("has-admin");
    const tab = readLoginTab();
    modalContent.innerHTML = `
      <p class="small-label">Profil</p>
      <h2 id="account-modal-title">Anmelden</h2>
      <div class="auth-tabs" role="tablist" aria-label="Wer meldet sich an?">
        <button type="button" class="auth-tab" role="tab" data-auth-tab="kind" aria-selected="${tab === "kind"}" aria-controls="auth-pane-kind">
          Kind<small>Name und Passwort</small>
        </button>
        <button type="button" class="auth-tab" role="tab" data-auth-tab="eltern" aria-selected="${tab === "eltern"}" aria-controls="auth-pane-eltern">
          Eltern<small>E-Mail-Adresse</small>
        </button>
      </div>

      <form class="auth-form auth-pane" id="auth-pane-kind" role="tabpanel" data-auth-pane="kind" ${tab === "kind" ? "" : "hidden"}>
        <p class="auth-hint">Der Name und das Passwort, die deine Eltern für dich angelegt haben.</p>
        <label>
          <span>Name</span>
          <input name="loginName" type="text" autocomplete="username" autocapitalize="none" required />
        </label>
        <label>
          <span>Passwort</span>
          <input name="password" type="password" autocomplete="current-password" minlength="4" required />
        </label>
        <div class="auth-actions">
          <button type="submit">Einloggen</button>
        </div>
        <p class="auth-hint">Noch kein Konto? <button type="button" data-auth-switch="eltern">Die Eltern legen es an.</button></p>
      </form>

      <form class="auth-form auth-pane" id="auth-pane-eltern" role="tabpanel" data-auth-pane="eltern" ${tab === "eltern" ? "" : "hidden"}>
        <p class="auth-hint">Mit deiner E-Mail-Adresse. Hier kaufst du Gripszug und legst Profile für deine Kinder an.</p>
        <label>
          <span>E-Mail-Adresse</span>
          <input name="email" type="email" autocomplete="email" inputmode="email" required />
        </label>
        <label>
          <span>Passwort</span>
          <input name="password" type="password" autocomplete="current-password" minlength="6" required />
        </label>
        <div class="auth-actions">
          <button type="submit">Einloggen</button>
          <button type="button" class="secondary-action" data-auth-register>Neues Elternkonto</button>
        </div>
        <button type="button" class="auth-link" data-auth-reset>Passwort vergessen?</button>
        <button type="button" class="google-action" data-auth-google>Mit Google anmelden</button>
      </form>
      <p class="auth-status" role="status" aria-live="polite">${state.firebaseReady ? "" : "Firebase SDK ist noch nicht geladen."}</p>
      <p class="auth-rechtliches"><a href="willkommen.html">Was ist Gripszug?</a> · <a href="kontakt.html">Kontakt</a> · <a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a> · <a href="agb.html">AGB</a></p>
    `;

    const status = modalContent.querySelector(".auth-status");
    // art: "fehler" (Vorgabe), "ok" oder "laeuft". true bleibt erlaubt und
    // heisst "ok" – so lesen sich die Aufrufe von früher weiter richtig.
    const setStatus = (text, art = "fehler") => zeigeMeldung(status, text, art === true ? "ok" : art);
    const bereit = () => {
      if (state.firebaseReady) return true;
      setStatus("Firebase ist nicht verfügbar.");
      return false;
    };

    // Die Reiter
    const zeigeReiter = (name) => {
      modalContent.querySelectorAll("[data-auth-tab]").forEach((button) => {
        button.setAttribute("aria-selected", String(button.dataset.authTab === name));
      });
      modalContent.querySelectorAll("[data-auth-pane]").forEach((pane) => {
        pane.hidden = pane.dataset.authPane !== name;
      });
      setStatus("");
      writeLoginTab(name);
      modalContent.querySelector(`[data-auth-pane="${name}"] input`)?.focus();
    };
    modalContent.querySelectorAll("[data-auth-tab]").forEach((button) => {
      button.addEventListener("click", () => zeigeReiter(button.dataset.authTab));
    });
    modalContent.querySelectorAll("[data-auth-switch]").forEach((button) => {
      button.addEventListener("click", () => zeigeReiter(button.dataset.authSwitch));
    });

    // Das Kind
    const kindForm = modalContent.querySelector('[data-auth-pane="kind"]');
    kindForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!bereit()) return;
      const formData = new FormData(kindForm);
      setStatus("Anmeldung läuft...", "laeuft");
      try {
        await signIn(String(formData.get("loginName")), String(formData.get("password")));
      } catch (error) {
        setStatus(authErrorMessage(error));
      }
    });

    // Die Eltern
    const elternForm = modalContent.querySelector('[data-auth-pane="eltern"]');
    const elternDaten = () => {
      const formData = new FormData(elternForm);
      return { email: String(formData.get("email") || ""), password: String(formData.get("password") || "") };
    };
    elternForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!bereit()) return;
      const { email, password } = elternDaten();
      setStatus("Anmeldung läuft...", "laeuft");
      try {
        await signInParent(email, password);
      } catch (error) {
        setStatus(authErrorMessage(error));
      }
    });
    elternForm.querySelector("[data-auth-register]").addEventListener("click", async () => {
      if (!bereit()) return;
      const { email, password } = elternDaten();
      setStatus("Elternkonto wird erstellt...", "laeuft");
      try {
        await signUpParent(email, password);
      } catch (error) {
        setStatus(authErrorMessage(error));
      }
    });
    elternForm.querySelector("[data-auth-reset]").addEventListener("click", async () => {
      if (!bereit()) return;
      const { email } = elternDaten();
      setStatus("Mail wird verschickt...", "laeuft");
      try {
        await sendParentPasswordReset(email);
        setStatus(`Eine Mail zum Zurücksetzen ist unterwegs an ${cleanEmail(email)}.`, true);
      } catch (error) {
        setStatus(authErrorMessage(error));
      }
    });
    elternForm.querySelector("[data-auth-google]").addEventListener("click", async () => {
      if (!bereit()) return;
      setStatus("Google-Anmeldung wird geöffnet...", "laeuft");
      try {
        await signInWithGoogle();
      } catch (error) {
        setStatus(authErrorMessage(error));
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
    state.parentUid = typeof userData.parentUid === "string" ? userData.parentUid : null;
    state.children = readChildren(userData.children);
    applyGroup(readGroup(userData.group));
    applyOwnWagonSet(userData.wagonSet);
    const progressDocs = progressSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const sessions = sessionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    progressDocs.forEach((entry) => {
      state.progress.set(entry.id, entry);
    });

    if (!state.dashboardOpen && modal.hidden) return;
    if (state.kaufModus) { renderKaufSeite(); return; }
    renderDashboard(userData, progressDocs, sessions);
  }

  function renderDashboard(userData, progressDocs, sessions) {
    const stats = summarizeProgress(userData, progressDocs);
    const loginName = userData.username || profileNameForUser(state.user, userData);
    const providerText = providerLabel(state.user.providerData.map((provider) => provider.providerId), userData);
    // Das breite Panel gehörte einmal dem Adminbereich; der hat jetzt eine
    // eigene Seite. Breit braucht es nun der Elternbereich: die Kinder zum
    // Aufklappen, mit Zug, Levelabdeckung und Sitzungen.
    accountPanel.classList.toggle("has-admin", isParentAccount());

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
      ${renderKaufRueckkehr()}
      ${renderAdminLink()}
      ${renderKaufKarte()}
      ${isParentAccount() ? renderKinderKarte() : ""}
      ${isParentAccount() ? `<div data-wagen-platz>${renderFamilienWagenKarte()}</div>` : ""}
      ${renderResetProgressCard()}
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
      zeigeMeldung(status, "Logout läuft...", "laeuft");
      try {
        await signOut();
      } catch (error) {
        zeigeMeldung(status, authErrorMessage(error));
      }
    });

    bindKaufKarte();
    if (isParentAccount()) {
      bindKinderKarte();
      bindFamilienWagenKarte();
    }
    bindResetProgressCard();
  }

  // ---------------------------------------------------------------------------
  // Der Weg in den Adminbereich
  // ---------------------------------------------------------------------------
  // Der Adminbereich war einmal ein Abschnitt in diesem Fenster. Er ist es
  // nicht mehr: Kontenliste, Gästeliste, Spielauswertung, Wagen und Gruppen
  // brauchen Platz, und ein Popup über dem Zug eines Kindes ist der falsche
  // Ort dafür. Hier steht nur noch die Tür – die Seite dahinter ist admin.html.
  function renderAdminLink() {
    if (!isAdminUser()) return "";
    return `
      <a class="unlock-mode-card admin-link" href="admin.html">
        <div>
          <strong>Adminbereich</strong>
          <span>Konten, G&auml;ste, Spiele, Wagen und Gruppen &#8211; auf einer eigenen Seite.</span>
        </div>
        <span class="admin-link-knopf">Zum Adminbereich</span>
      </a>`;
  }

  // ---------------------------------------------------------------------------
  // Der Kauf im Profilfenster
  // ---------------------------------------------------------------------------
  // Eine Karte, je nach Konto ein anderer Satz: Das Elternkonto kauft hier;
  // ein Kind mit Elternkonto sieht, ob die Eltern gekauft haben; ein Konto
  // aus der Zeit davor ist frei und erfährt, warum.
  const KAUF_PREIS = "CHF 30";

  function kaufStand() {
    const e = state.entitlement;
    if (e?.active) return "gekauft";
    if (e && !e.active) return "zurueck";
    if (state.role === "child" && !state.parentUid) return "gruender";
    return "offen";
  }

  function renderKaufRueckkehr() {
    if (!state.kaufRueckkehr) return "";
    if (state.kaufRueckkehr === "abbruch") {
      return `<div class="kauf-hinweis" role="status">Die Kasse wurde geschlossen. Es wurde nichts abgebucht.</div>`;
    }
    return `<div class="kauf-hinweis is-ok" role="status">Danke! Die Zahlung ist angekommen. ${state.entitlement?.active ? "Gripszug ist freigeschaltet." : "Die Freischaltung kommt in wenigen Sekunden – dieses Fenster zeigt sie von selbst."}</div>`;
  }

  function renderKaufKarte() {
    const stand = kaufStand();
    const eltern = isParentAccount();
    if (stand === "gekauft") {
      const seit = state.entitlement.grantedAtMs ? formatDateTime(new Date(state.entitlement.grantedAtMs)) : "";
      const via = state.entitlement.via ? "Freigeschaltet durch dein Elternkonto." : (eltern ? "Alle Kinder unten sind freigeschaltet." : "");
      return `
        <div class="unlock-mode-card kauf-karte active" data-kauf-karte>
          <div>
            <strong>Gripszug Familie ✓</strong>
            <span>${escapeHtml(via)}${seit ? ` Gekauft am ${escapeHtml(seit)}.` : ""}</span>
          </div>
        </div>`;
    }
    if (stand === "gruender") {
      return `
        <div class="unlock-mode-card kauf-karte active" data-kauf-karte>
          <div>
            <strong>Gründer-Zugang</strong>
            <span>Dieses Konto war vor dem Kauf dabei. Alles ist frei – und bleibt es.</span>
          </div>
        </div>`;
    }
    if (!eltern) {
      return `
        <div class="unlock-mode-card kauf-karte" data-kauf-karte>
          <div>
            <strong>Noch nicht freigeschaltet</strong>
            <span>Gripszug kauft man im Elternkonto. Danach sind alle Kinder der Familie frei.</span>
          </div>
        </div>`;
    }
    return `
      <div class="unlock-mode-card kauf-karte" data-kauf-karte>
        <div>
          <strong>${stand === "zurueck" ? "Der Kauf wurde zurückerstattet" : "Gripszug Familie"}</strong>
          <span>Alle 25 Spiele, alle 130 Stationen, bis zu 4 Kinder. Einmal zahlen, für immer – kein Abo, keine Werbung.</span>
        </div>
        <button type="button" data-kaufen>${stand === "zurueck" ? "Erneut kaufen" : "Jetzt kaufen"} · ${KAUF_PREIS}</button>
        <p class="auth-status karten-status" role="status" aria-live="polite"></p>
      </div>`;
  }

  function bindKaufKarte() {
    const knopf = modalContent.querySelector("[data-kaufen]");
    if (!knopf) return;
    knopf.addEventListener("click", async () => {
      if (state.serverBusy) return;
      const status = modalContent.querySelector("[data-kauf-karte] .karten-status") || modalContent.querySelector(".auth-status");
      state.serverBusy = true;
      knopf.disabled = true;
      zeigeMeldung(status, "Weiterleitung zur Zahlung...", "laeuft");
      try {
        await zurKasse();
      } catch (error) {
        state.serverBusy = false;
        knopf.disabled = false;
        if (error?.code === "server/already-owned") { await refreshDashboard(); return; }
        zeigeMeldung(status, serverErrorMessage(error));
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Der Verkaufsbildschirm hinter dem Elterntor
  // ---------------------------------------------------------------------------
  // Vor der Schranke steht das Kind, dahinter die Rechenaufgabe, und wer die
  // löst, ist erwachsen (entitlement.js). Dieser Mensch will zuerst wissen,
  // was das kostet – ein Anmeldeformular wäre eine Frage, bevor das Angebot
  // dasteht. Also: oben der Preis und was dazugehört, darunter der kürzeste
  // Weg an die Kasse. Dieselben Punkte wie auf willkommen.html, nur kompakt;
  // wer es ausführlich will, findet den Link am Fuss.
  //
  // Angemeldet wird hier nur als Eltern: Ein Kinderkonto kann nicht kaufen –
  // der Server erkennt es an der technischen Adresse und lehnt ab
  // (netlify/functions/_lib/anfrage.mjs). Deshalb führt jeder Weg über eine
  // E-Mail-Adresse, und nach der Anmeldung geht es ohne Zwischenhalt weiter
  // an die Kasse: Wer bis hierher getippt hat, will kaufen, nicht ein Profil
  // ansehen.
  // Kurz genug für eine Zeile: Die Liste steht auf dem Handy untereinander und
  // zweispaltig auf dem Tisch – Zeilen, die umbrechen, machen daraus ein
  // Treppenmuster statt einer Aufzählung.
  const KAUF_VORTEILE = [
    "Alle 25 Spiele, alle Stufen",
    "Alle 130 Stationen der Reise",
    "Bis zu 4 Kinder mit eigenem Zug",
    "Fortschritt auf jedem Gerät",
    "Alle neuen Spiele inbegriffen",
  ];

  // Nach dem Anmelden steht das Konto erst fest, wenn Firebase den Wechsel
  // gemeldet hat (handleAuthState). Die Kasse braucht das Token dieses Kontos,
  // also wird darauf gewartet – ein paar Hundertstel, keine Sanduhr.
  async function warteAufKonto(ms = 8000) {
    const bis = Date.now() + ms;
    while (!state.user && Date.now() < bis) await new Promise((weiter) => setTimeout(weiter, 50));
    return Boolean(state.user);
  }

  function renderKaufSeite() {
    accountPanel.classList.remove("has-admin");
    const stand = kaufStand();
    const frei = stand === "gekauft" || stand === "gruender";
    const eltern = Boolean(state.user) && isParentAccount();
    const kindDa = Boolean(state.user) && !eltern;
    const rechtliches = `<p class="auth-rechtliches"><a href="willkommen.html">Alles über Gripszug</a> · <a href="kontakt.html">Kontakt</a> · <a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a> · <a href="agb.html">AGB</a></p>`;

    if (frei) {
      modalContent.innerHTML = `
        <div class="kauf-seite">
          <p class="small-label">Für Eltern</p>
          <h2 id="account-modal-title">Gripszug ist freigeschaltet</h2>
          <p class="kauf-frei">Alle Spiele, alle Stationen, alle Kinder dieser Familie. Es gibt nichts mehr zu bezahlen.</p>
          <div class="auth-actions"><button type="button" data-kauf-fertig>Weiterspielen</button></div>
          ${rechtliches}
        </div>`;
      modalContent.querySelector("[data-kauf-fertig]").addEventListener("click", closeModal);
      return;
    }

    const anmeldung = `
      <form class="auth-form kauf-anmeldung" data-kauf-form>
        <p class="auth-hint">${kindDa
          ? "Gekauft wird im Elternkonto – nicht im Konto des Kindes. Melde dich an oder leg eines an; dein Kind bleibt, wo es ist."
          : "Eine Adresse, ein Passwort – und der nächste Tipp führt an die Kasse."}</p>
        <label>
          <span>E-Mail-Adresse der Eltern</span>
          <input name="email" type="email" autocomplete="email" inputmode="email" required />
        </label>
        <label>
          <span>Passwort (ab 6 Zeichen)</span>
          <input name="password" type="password" autocomplete="new-password" minlength="6" required />
        </label>
        <div class="auth-actions kauf-aktionen">
          <button type="submit">Konto anlegen und bezahlen</button>
          <button type="button" class="secondary-action" data-kauf-anmelden>Ich habe schon ein Konto</button>
        </div>
        <button type="button" class="google-action" data-kauf-google>Mit Google anmelden und bezahlen</button>
        <button type="button" class="auth-link" data-kauf-reset>Passwort vergessen?</button>
        <p class="auth-status" role="status" aria-live="polite">${state.firebaseReady ? "" : "Firebase SDK ist noch nicht geladen."}</p>
      </form>`;

    // Hier stand einmal ein Satz über Stripe und die Wartezeit. Er stand
    // zwischen dem Entschluss und dem Knopf, sagte nichts, was der Knopf
    // nicht selbst sagt, und die Adresse darunter kennt, wer sie eben
    // eingetippt hat.
    const kaufen = `
      <div class="kauf-anmeldung">
        <button type="button" class="kauf-knopf" data-kaufen>Jetzt kaufen · ${KAUF_PREIS}</button>
        <p class="auth-status" role="status" aria-live="polite"></p>
      </div>`;

    modalContent.innerHTML = `
      <div class="kauf-seite">
        <p class="small-label">Für Eltern</p>
        <h2 id="account-modal-title">${stand === "zurueck" ? "Gripszug wieder freischalten" : "Die ganze Strecke öffnen"}</h2>
        <p class="kauf-preis"><strong>${KAUF_PREIS}</strong><span>einmal – für die ganze Familie, für immer</span></p>
        <ul class="kauf-vorteile">${KAUF_VORTEILE.map((zeile) => `<li>${escapeHtml(zeile)}</li>`).join("")}</ul>
        <p class="kauf-versprechen"><span>Kein Abo</span><span>Keine Werbung</span><span>Kein echter Name nötig</span></p>
        ${eltern ? kaufen : anmeldung}
        ${rechtliches}
      </div>`;

    if (eltern) { bindKaufKarte(); return; }
    bindKaufAnmeldung();
  }

  // Anmelden und ohne Zwischenhalt an die Kasse. Klappt die Kasse nicht, bleibt
  // das Konto trotzdem bestehen – die Meldung sagt, was war, und der Knopf
  // steht dann im Profilfenster.
  function bindKaufAnmeldung() {
    const form = modalContent.querySelector("[data-kauf-form]");
    if (!form) return;
    const status = form.querySelector(".auth-status");
    const knoepfe = [...form.querySelectorAll("button")];
    const daten = () => {
      const werte = new FormData(form);
      return { email: String(werte.get("email") || ""), password: String(werte.get("password") || "") };
    };
    // art: "fehler" (Vorgabe), "ok" oder "laeuft". true bleibt erlaubt und
    // heisst "ok" – so lesen sich die Aufrufe von früher weiter richtig.
    const setStatus = (text, art = "fehler") => zeigeMeldung(status, text, art === true ? "ok" : art);

    async function zurKasseMit(tun, text) {
      if (!state.firebaseReady) { setStatus("Firebase ist nicht verfügbar."); return; }
      if (state.serverBusy) return;
      state.serverBusy = true;
      knoepfe.forEach((knopf) => { knopf.disabled = true; });
      setStatus(text);
      try {
        await tun();
        if (!(await warteAufKonto())) throw authInputError("lernapp/not-signed-in");
        setStatus("Weiterleitung zur Zahlung...", "laeuft");
        await zurKasse();
        // Ab hier übernimmt Stripe: Die Seite wechselt, dieses Fenster geht mit.
      } catch (fehler) {
        state.serverBusy = false;
        knoepfe.forEach((knopf) => { knopf.disabled = false; });
        setStatus(kaufFehlerText(fehler));
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const { email, password } = daten();
      zurKasseMit(() => signUpParent(email, password), "Elternkonto wird angelegt...");
    });
    form.querySelector("[data-kauf-anmelden]").addEventListener("click", () => {
      const { email, password } = daten();
      if (!form.reportValidity()) return;
      zurKasseMit(() => signInParent(email, password), "Anmeldung läuft...");
    });
    form.querySelector("[data-kauf-google]").addEventListener("click", () => {
      zurKasseMit(() => signInWithGoogle(), "Google-Anmeldung wird geöffnet...");
    });
    form.querySelector("[data-kauf-reset]").addEventListener("click", async () => {
      if (!state.firebaseReady) { setStatus("Firebase ist nicht verfügbar."); return; }
      const { email } = daten();
      setStatus("Mail wird verschickt...", "laeuft");
      try {
        await sendParentPasswordReset(email);
        setStatus(`Eine Mail zum Zurücksetzen ist unterwegs an ${cleanEmail(email)}.`, true);
      } catch (fehler) {
        setStatus(kaufFehlerText(fehler));
      }
    });
  }

  // Dieselben Fehler wie bei der Anmeldung – nur zwei sagen hier etwas anderes,
  // weil sie hier etwas anderes bedeuten: Eine Adresse, die es schon gibt, ist
  // kein "Name vergeben", sondern der Hinweis auf den zweiten Knopf.
  function kaufFehlerText(fehler) {
    const code = fehler?.code || "";
    if (code.includes("email-already-in-use")) return "Diese Adresse hat schon ein Konto. Tipp auf «Ich habe schon ein Konto».";
    if (code === "server/already-owned") return "Diese Familie hat Gripszug schon – schliesse das Fenster und spiel weiter.";
    if (code.startsWith("server/")) return serverErrorMessage(fehler);
    return authErrorMessage(fehler);
  }

  // ---------------------------------------------------------------------------
  // Die Kinder im Profilfenster
  // ---------------------------------------------------------------------------
  const MAX_KINDER = 4;

  // Die Rückmeldung steht in der Karte, bei dem, was sie betrifft – nicht am
  // Ende des Fensters, wo sie beim Formular weiter oben niemand sieht. Weil
  // die Karte nach jedem Schritt neu gezeichnet wird, kommt die Meldung als
  // Teil des Bildes mit.
  // Der Zustand des Elternbereichs: welches Kind aufgeklappt ist, was gerade
  // läuft, was zu bestätigen ist. Er lebt hier und nicht im DOM, weil die
  // Karte nach jedem Schritt neu gezeichnet wird.
  const eltern = {
    offenesKind: null,
    kindDetails: new Map(),
    kindLaeuft: null,
    kindForm: null,
    kindMeldung: null,
    // Zurücksetzen und Löschen fragen nach: {art: "reset"|"weg", uid}
    kindFrage: null,
    wagenFrage: null,
    wagenLaeuft: "",
    wagenFehler: "",
    wagenFertig: "",
  };

  function resetElternState() {
    eltern.offenesKind = null;
    eltern.kindDetails.clear();
    eltern.kindLaeuft = null;
    eltern.kindForm = null;
    eltern.kindMeldung = null;
    eltern.kindFrage = null;
    eltern.wagenFrage = null;
    eltern.wagenLaeuft = "";
    eltern.wagenFehler = "";
    eltern.wagenFertig = "";
  }

  // Das Konto eines Kindes samt Leveln und Sitzungen. Lesen darf das ein
  // Elternkonto seit firestore.rules (isParentOf) – und nur die eigenen:
  // Wer eine fremde Kennung einsetzte, bekäme von Firestore nichts.
  async function loadKindDetails(uid) {
    const ref = state.db.collection("users").doc(uid);
    const [doc, progressSnapshot, sessionSnapshot] = await Promise.all([
      ref.get(),
      ref.collection("levelProgress").get(),
      ref.collection("sessions").orderBy("startedAt", "desc").get(),
    ]);
    return {
      id: uid,
      userData: doc.data() || {},
      progressDocs: progressSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
      sessions: sessionSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  }

  // Die Rückmeldung steht in der Karte, bei dem, was sie betrifft – nicht am
  // Ende des Fensters, wo sie beim Formular weiter oben niemand sieht. Weil
  // die Karte nach jedem Schritt neu gezeichnet wird, kommt die Meldung als
  // Teil des Bildes mit.
  function renderKinderKarte() {
    const kinder = state.children;
    const form = eltern.kindForm;
    const meldung = eltern.kindMeldung;
    const zeilen = kinder.length
      ? kinder.map((kind) => renderKindZeile(kind, form)).join("")
      : `<li class="kind-zeile kind-leer">Noch kein Kind. Leg das erste an – mit dem Namen und dem Passwort meldet es sich dann an.</li>`;

    const neu = form?.art === "neu" ? `
      <form class="kind-form kind-form-neu" data-kind-neu-form>
        <label><span>Name des Kindes</span><input name="name" type="text" required autocomplete="off" autocapitalize="words" placeholder="z. B. Lina" /></label>
        <label><span>Passwort (ab 4 Zeichen)</span><input name="passwort" type="password" minlength="4" required autocomplete="new-password" placeholder="z. B. 1234" /></label>
        <p class="auth-hint">Damit meldet sich dein Kind an. Ein Spitzname reicht – der echte Name muss nirgends stehen.</p>
        ${renderStufeWahl("mittel")}
        <div class="card-actions">
          <button type="button" class="secondary-action" data-kind-abbrechen>Abbrechen</button>
          <button type="submit">Kind anlegen</button>
        </div>
      </form>` : (kinder.length < MAX_KINDER ? `<button type="button" class="secondary-action" data-kind-neu>Kind hinzufügen</button>` : `<p class="auth-hint">Vier Kinder – mehr gehen je Elternkonto nicht.</p>`);

    return `
      <div class="unlock-mode-card kinder-karte" data-kinder-karte>
        <div class="kinder-kopf">
          <strong>Kinder</strong>
          <span>${kinder.length} von ${MAX_KINDER}${kaufStand() === "gekauft" ? " · alle freigeschaltet" : ""}</span>
        </div>
        <p class="auth-hint">Tipp auf ein Kind: Zug, probierte Level, Sitzungen. Was du hier änderst, gilt nur für deine Familie.</p>
        <ul class="kinder-liste">${zeilen}</ul>
        ${neu}
        <p class="auth-status karten-status${meldung?.ok ? " is-ok" : ""}" role="status" aria-live="polite">${meldung ? escapeHtml(meldung.text) : ""}</p>
      </div>`;
  }

  // Eine Zeile je Kind: zugeklappt der Name, wann es zuletzt da war und sein
  // Zug als fünf Balken. Aufgeklappt alles Weitere.
  function renderKindZeile(kind, form) {
    const offen = eltern.offenesKind === kind.uid;
    const detail = eltern.kindDetails.get(kind.uid);
    const laeuft = eltern.kindLaeuft === kind.uid;
    const entity = detail ? { ...detail.userData, levelDocs: detail.progressDocs } : null;
    const gesehen = entity ? lastActivityMs(entity) : 0;

    const frage = eltern.kindFrage?.uid === kind.uid ? eltern.kindFrage.art : null;
    const koerper = !offen ? "" : (detail
      ? `
        <div class="kind-detail">
          ${frage === "reset" ? `
            <div class="admin-reset is-confirming">
              <div>
                <strong>Wirklich allen Fortschritt von ${escapeHtml(kind.name || "diesem Kind")} zurücksetzen?</strong>
                <span>Gelöste Level, Sitzungen und Spielstände werden gelöscht. Der Zug fängt wieder von vorn an: alle Wagen starten bei 0, auch auf dem Gerät des Kindes. Lok und Landschaft bleiben. Das lässt sich nicht rückgängig machen.</span>
              </div>
              <div class="card-actions">
                <button type="button" class="secondary-action" data-kind-frage-ab>Abbrechen</button>
                <button type="button" class="danger-action" data-kind-reset-ja="${escapeHtml(kind.uid)}">Ja, zurücksetzen</button>
              </div>
            </div>` : ""}
          ${frage === "weg" ? `
            <div class="admin-reset is-confirming">
              <div>
                <strong>Konto von ${escapeHtml(kind.name || "diesem Kind")} wirklich löschen?</strong>
                <span>Das Konto, sein Fortschritt und seine Anmeldung verschwinden. Danach ist der Name wieder frei. Das lässt sich nicht rückgängig machen – zum blossen Neuanfangen reicht «Fortschritt zurücksetzen».</span>
              </div>
              <div class="card-actions">
                <button type="button" class="secondary-action" data-kind-frage-ab>Abbrechen</button>
                <button type="button" class="danger-action" data-kind-weg-ja="${escapeHtml(kind.uid)}">Ja, Konto löschen</button>
              </div>
            </div>` : ""}
          <div class="card-actions kind-aktionen">
            <button type="button" class="secondary-action" data-kind-passwort="${escapeHtml(kind.uid)}">Passwort neu</button>
            <button type="button" class="secondary-action" data-kind-reset="${escapeHtml(kind.uid)}">Fortschritt zurücksetzen</button>
            <button type="button" class="danger-action" data-kind-weg="${escapeHtml(kind.uid)}">Konto löschen</button>
          </div>
          ${renderKindStufe(kind, detail)}
          ${renderEntityDetail(detail, { withFilters: false })}
        </div>`
      : `<div class="kind-detail"><p class="account-muted">${laeuft ? "Wird geladen..." : "Konnte nicht geladen werden."}</p></div>`);

    return `
      <li class="kind-zeile${offen ? " is-open" : ""}" data-kind-uid="${escapeHtml(kind.uid)}">
        <button type="button" class="kind-kopf" data-kind-auf="${escapeHtml(kind.uid)}" aria-expanded="${offen ? "true" : "false"}">
          <span class="admin-entry-caret" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="kind-name">
            <strong>${escapeHtml(kind.name || "Kind")}</strong>
            <span>${gesehen ? `zuletzt ${escapeHtml(formatDateTime(gesehen))}` : (detail ? "noch nie gespielt" : "")}</span>
          </span>
          ${entity ? renderTrainStrip(entity) : ""}
        </button>
        ${form?.art === "passwort" && form.uid === kind.uid ? `
          <form class="kind-form" data-kind-passwort-form>
            <input name="passwort" type="password" minlength="4" required placeholder="Neues Passwort" autocomplete="new-password" />
            <button type="submit">Speichern</button>
            <button type="button" class="secondary-action" data-kind-abbrechen>Abbrechen</button>
          </form>` : ""}
        ${koerper}
      </li>`;
  }

  // Die drei Stufen mit Name und Alter, wie journey-plan.js sie führt – mit
  // Ersatz für den Fall, dass die Datei auf dieser Seite fehlt.
  function stufenInfo() {
    return window.LernappReise?.STUFE_INFO || {
      leicht: { label: "Leicht", alter: "3 bis 5 Jahre" },
      mittel: { label: "Mittel", alter: "5 bis 7 Jahre" },
      schwer: { label: "Schwer", alter: "7 bis 10 Jahre" },
    };
  }
  const STUFE_ERKLAERUNG = "«Leicht» (3 bis 5 Jahre) verlangt auf der Reise weniger und zeigt die kleinsten Rätsel; «Mittel» (5 bis 7) ist die Reise, wie sie ist; «Schwer» (7 bis 10) gibt den Stempel nur mit drei Sternen oder der ganzen Punktzahl. Die Stufe stellt auch Buchstaben-Jagd, Wortdetektiv, Rucksack, Memory, Weichen-Wirrwarr und Freie Fahrt ein.";

  // Die Altersgruppe beim Anlegen: drei Knöpfe, einer ist gewählt. Sie wird
  // zur Schwierigkeitsstufe des Kindes und lässt sich am Kind jederzeit
  // umstellen.
  function renderStufeWahl(gewaehlt) {
    const knoepfe = Object.entries(stufenInfo()).map(([wert, eintrag]) => `
          <label>
            <input type="radio" name="stufe" value="${wert}" ${wert === gewaehlt ? "checked" : ""} />
            <span><strong>${escapeHtml(eintrag.label)}</strong><small>${escapeHtml(eintrag.alter)}</small></span>
          </label>`).join("");
    return `
        <fieldset class="kind-stufe-wahl">
          <legend>Wie alt ist dein Kind?</legend>
          <div class="kind-stufe-knoepfe">${knoepfe}</div>
        </fieldset>
        <p class="auth-hint">Die Stufe bestimmt, wie schwer die Reise und die Spiele sind – von den Rätseln bis zum Tempo der Züge. Du kannst sie später jederzeit umstellen.</p>`;
  }

  // Die Schwierigkeitsstufe des eigenen Kindes. Dieselbe Einstellung, die der
  // Admin für jedes Konto setzen kann – hier für die eigene Familie. Sie liegt
  // im Kasten der Reise (gameState), und den darf ein Elternkonto an seinem
  // Kind schreiben (firestore.rules, isProgressReset).
  function renderKindStufe(kind, detail) {
    const reise = window.LernappReise;
    if (!reise || !detail?.userData) return "";
    const fahrt = reise.progressFor((detail.userData.gameState || {})[reise.KEY]?.data);
    const busy = eltern.kindLaeuft === kind.uid;
    const knopf = ([wert, eintrag]) => `<button type="button" class="${fahrt.stufe === wert ? "" : "secondary-action"}" data-kind-stufe="${wert}" ${busy ? "disabled" : ""} aria-pressed="${fahrt.stufe === wert ? "true" : "false"}">${escapeHtml(eintrag.label)} (${escapeHtml(eintrag.alter)})${fahrt.stufe === wert ? " ✓" : ""}</button>`;
    return `
      <div class="admin-reset admin-stufe">
        <div>
          <strong>Schwierigkeitsstufe</strong>
          <span>${STUFE_ERKLAERUNG} Gilt auf allen Geräten deines Kindes.</span>
        </div>
        <div class="card-actions">${Object.entries(stufenInfo()).map(knopf).join("")}</div>
      </div>`;
  }

  async function kindStufeSetzen(uid, stufe) {
    if (!uid) return;
    eltern.kindLaeuft = uid;
    eltern.kindMeldung = { ok: false, text: "Die Schwierigkeitsstufe wird gespeichert..." };
    zeichneKinderKarte();
    try {
      await setJourneyStufeFor(uid, stufe);
      eltern.kindDetails.delete(uid);
      await kindNachladen(uid);
      eltern.kindMeldung = { ok: true, text: `Schwierigkeitsstufe auf «${stufenInfo()[stufe]?.label || stufe}» gestellt.` };
    } catch (error) {
      eltern.kindMeldung = { ok: false, text: authErrorMessage(error) };
    }
    eltern.kindLaeuft = null;
    zeichneKinderKarte();
  }

  function zeichneKinderKarte() {
    const karte = modalContent.querySelector("[data-kinder-karte]");
    if (!karte) return;
    karte.outerHTML = renderKinderKarte();
    bindKinderKarte();
    // Das erste Kind bringt die Wagenkarte, das letzte nimmt sie wieder mit.
    zeichneWagenKarte();
  }

  function bindKinderKarte() {
    const karte = modalContent.querySelector("[data-kinder-karte]");
    if (!karte) return;
    const status = karte.querySelector(".karten-status");
    const zeichne = (form, meldung = null) => {
      eltern.kindForm = form;
      eltern.kindMeldung = meldung;
      zeichneKinderKarte();
      modalContent.querySelector("[data-kinder-karte] input")?.focus();
    };

    karte.querySelector("[data-kind-neu]")?.addEventListener("click", () => zeichne({ art: "neu" }));
    karte.querySelectorAll("[data-kind-passwort]").forEach((knopf) => {
      knopf.addEventListener("click", () => zeichne({ art: "passwort", uid: knopf.dataset.kindPasswort }));
    });
    karte.querySelectorAll("[data-kind-abbrechen]").forEach((knopf) => {
      knopf.addEventListener("click", () => zeichne(null));
    });
    karte.querySelectorAll("[data-kind-auf]").forEach((knopf) => {
      knopf.addEventListener("click", () => kindAufklappen(knopf.dataset.kindAuf));
    });
    karte.querySelectorAll("[data-kind-reset]").forEach((knopf) => {
      knopf.addEventListener("click", () => { eltern.kindFrage = { art: "reset", uid: knopf.dataset.kindReset }; zeichne(null); });
    });
    karte.querySelectorAll("[data-kind-weg]").forEach((knopf) => {
      knopf.addEventListener("click", () => { eltern.kindFrage = { art: "weg", uid: knopf.dataset.kindWeg }; zeichne(null); });
    });
    karte.querySelectorAll("[data-kind-frage-ab]").forEach((knopf) => {
      knopf.addEventListener("click", () => { eltern.kindFrage = null; zeichne(null); });
    });
    karte.querySelector("[data-kind-reset-ja]")?.addEventListener("click", (event) => {
      kindZuruecksetzen(event.currentTarget.dataset.kindResetJa);
    });
    karte.querySelector("[data-kind-weg-ja]")?.addEventListener("click", (event) => {
      kindEntfernen(event.currentTarget.dataset.kindWegJa);
    });
    karte.querySelectorAll("[data-kind-stufe]").forEach((knopf) => {
      knopf.addEventListener("click", () => kindStufeSetzen(eltern.offenesKind, knopf.dataset.kindStufe));
    });

    karte.querySelector("[data-kind-neu-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (state.serverBusy) return;
      const daten = new FormData(event.currentTarget);
      state.serverBusy = true;
      zeigeMeldung(status, "Kind wird angelegt...", "laeuft");
      try {
        const kind = await kindAnlegen(String(daten.get("name")), String(daten.get("passwort")), String(daten.get("stufe") || "mittel"));
        zeichne(null, { ok: true, text: `${kind.name} kann sich jetzt mit Name und Passwort anmelden.` });
      } catch (error) {
        zeigeMeldung(status, serverErrorMessage(error));
      } finally {
        state.serverBusy = false;
      }
    });

    karte.querySelector("[data-kind-passwort-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (state.serverBusy) return;
      const uid = event.currentTarget.closest("[data-kind-uid]")?.dataset.kindUid;
      const daten = new FormData(event.currentTarget);
      state.serverBusy = true;
      zeigeMeldung(status, "Passwort wird gesetzt...", "laeuft");
      try {
        await kindPasswortSetzen(uid, String(daten.get("passwort")));
        zeichne(null, { ok: true, text: "Das neue Passwort gilt ab sofort." });
      } catch (error) {
        zeigeMeldung(status, serverErrorMessage(error));
      } finally {
        state.serverBusy = false;
      }
    });
  }

  // Ein zweiter Tipp auf dieselbe Zeile klappt sie wieder zu – sonst gäbe es
  // keinen Weg zurück zur kurzen Liste.
  async function kindAufklappen(uid) {
    if (!uid) return;
    eltern.kindForm = null;
    eltern.kindFrage = null;
    if (eltern.offenesKind === uid) {
      eltern.offenesKind = null;
      zeichneKinderKarte();
      return;
    }
    eltern.offenesKind = uid;
    if (!eltern.kindDetails.has(uid)) {
      eltern.kindLaeuft = uid;
      zeichneKinderKarte();
      try {
        eltern.kindDetails.set(uid, await loadKindDetails(uid));
      } catch (error) {
        eltern.kindDetails.set(uid, { id: uid, error });
      }
      eltern.kindLaeuft = null;
    }
    zeichneKinderKarte();
  }

  async function kindZuruecksetzen(uid) {
    if (!uid || state.serverBusy) return;
    eltern.kindFrage = null;
    eltern.kindMeldung = { ok: false, text: "Fortschritt wird zurückgesetzt..." };
    zeichneKinderKarte();
    try {
      await resetProgressFor(uid);
      eltern.kindDetails.delete(uid);
      await kindNachladen(uid);
      eltern.kindMeldung = { ok: true, text: "Zurückgesetzt. Der Zug beginnt wieder bei 0." };
    } catch (error) {
      eltern.kindMeldung = { ok: false, text: authErrorMessage(error) };
    }
    zeichneKinderKarte();
  }

  async function kindEntfernen(uid) {
    if (!uid || state.serverBusy) return;
    const name = state.children.find((kind) => kind.uid === uid)?.name || "Das Kind";
    eltern.kindFrage = null;
    state.serverBusy = true;
    eltern.kindMeldung = { ok: false, text: "Konto wird gelöscht..." };
    zeichneKinderKarte();
    try {
      await kindLoeschen(uid);
      eltern.kindDetails.delete(uid);
      if (eltern.offenesKind === uid) eltern.offenesKind = null;
      eltern.kindMeldung = { ok: true, text: `${name} ist gelöscht. Der Name ist wieder frei.` };
    } catch (error) {
      eltern.kindMeldung = { ok: false, text: serverErrorMessage(error) };
    }
    state.serverBusy = false;
    zeichneKinderKarte();
  }

  async function kindNachladen(uid) {
    if (!uid || eltern.offenesKind !== uid) return;
    try { eltern.kindDetails.set(uid, await loadKindDetails(uid)); }
    catch (error) { eltern.kindDetails.set(uid, { id: uid, error }); }
  }

  // ---------------------------------------------------------------------------
  // Die Wagen der Familie
  // ---------------------------------------------------------------------------
  // Dasselbe, was der Admin für alle tut – nur für die eigene Familie. Wer
  // hier umstellt, ändert nichts an anderen Familien: Das Set steht am Konto
  // (users/<uid>.wagonSet) und nicht in config/train.
  //
  // Ein Wechsel setzt den Fortschritt der ganzen Familie auf 0. Deshalb eine
  // Rückfrage, die das ausspricht, und ein Weg zurück zum Set für alle.
  function renderFamilienWagenKarte() {
    const train = window.LernappTrain;
    if (!train?.SETS) return "";
    // Ohne Kinder gibt es keine Familie, für die sich etwas festlegen liesse –
    // und die Regeln liessen das Feld auch gar nicht zu.
    if (!canSetFamilyWagonSet()) return "";
    const aktuell = getWagonSet();
    const eigen = getFamilyWagonSet();
    const aktivId = train.SET_BY_ID[aktuell.id] ? aktuell.id : train.SETS[0].id;
    const laeuft = Boolean(eltern.wagenLaeuft);

    const knopfFuer = (set) => {
      if (set.id === aktivId) return `<span class="admin-set-active">Aktiv${eigen ? " · für deine Familie gewählt" : " · gilt für alle"}</span>`;
      if (eltern.wagenFrage === set.id) {
        return `
          <div class="admin-set-confirm">
            <strong>Wirklich auf «${escapeHtml(set.label)}» wechseln?</strong>
            <span>Alle Wagen deiner Familie starten bei 0: gelöste Level, Runden und Spielstände werden gelöscht – bei dir und bei jedem deiner Kinder, auch auf ihren Geräten, sobald sie die App öffnen. Lok, Landschaft und Namen bleiben. Das lässt sich nicht rückgängig machen.</span>
            <span>Neue Kinder bekommen diese Wagen von selbst. Stellt Gripszug später für alle um, fährt auch deine Familie wieder mit.</span>
            <div class="card-actions">
              <button type="button" class="secondary-action" data-wagen-ab>Abbrechen</button>
              <button type="button" class="danger-action" data-wagen-ja="${escapeHtml(set.id)}">Ja, wechseln</button>
            </div>
          </div>`;
      }
      return `<button type="button" class="secondary-action" data-wagen-set="${escapeHtml(set.id)}" ${laeuft ? "disabled" : ""}>Diese Wagen für meine Familie</button>`;
    };

    return `
      <div class="unlock-mode-card wagen-karte" data-wagen-karte>
        <div class="karten-kopf">
          <strong>Wagen deiner Familie</strong>
          <span>${eigen ? "eigene Wahl" : "wie bei allen"}</span>
        </div>
        <p class="auth-hint">Welche Wagen der Zug hat und wie schnell sie wachsen. Die Wahl gilt für dich und deine Kinder – für niemanden sonst.</p>
        <div class="wagen-sets">
          ${train.SETS.map((set) => `
            <article class="admin-set${set.id === aktivId ? " is-active" : ""}">
              <header>
                <div>
                  <strong>${escapeHtml(set.label)}</strong>
                  <span>${escapeHtml(`Ein Schritt nach ${set.stepAt.join(", ")} Runden je Spiel.`)}</span>
                </div>
              </header>
              <div class="admin-set-actions">${knopfFuer(set)}</div>
            </article>
          `).join("")}
        </div>
        ${eigen ? `
          <div class="card-actions">
            ${eltern.wagenFrage === "zurueck"
              ? `<button type="button" class="secondary-action" data-wagen-ab>Abbrechen</button><button type="button" class="danger-action" data-wagen-zurueck-ja>Ja, zur&uuml;ck zu den Wagen f&uuml;r alle</button>`
              : `<button type="button" class="secondary-action" data-wagen-zurueck ${laeuft ? "disabled" : ""}>Zur&uuml;ck zu den Wagen f&uuml;r alle</button>`}
          </div>
          ${eltern.wagenFrage === "zurueck" ? `<p class="auth-hint">Auch das setzt die Wagen deiner Familie auf 0.</p>` : ""}` : ""}
        ${eltern.wagenLaeuft ? `<p class="auth-status karten-status" role="status" aria-live="polite">${escapeHtml(eltern.wagenLaeuft)}</p>` : ""}
        ${eltern.wagenFehler ? `<p class="auth-status">${escapeHtml(eltern.wagenFehler)}</p>` : ""}
        ${eltern.wagenFertig ? `<p class="auth-status is-ok" role="status">${escapeHtml(eltern.wagenFertig)}</p>` : ""}
      </div>`;
  }

  // Gezeichnet wird in den Platz, nicht über die Karte: Mit dem ersten Kind
  // entsteht sie, mit dem letzten verschwindet sie – und eine Karte, die es
  // gerade nicht gibt, liesse sich nicht ersetzen.
  function zeichneWagenKarte() {
    const platz = modalContent.querySelector("[data-wagen-platz]");
    if (!platz) return;
    platz.innerHTML = renderFamilienWagenKarte();
    bindFamilienWagenKarte();
  }

  function bindFamilienWagenKarte() {
    const karte = modalContent.querySelector("[data-wagen-karte]");
    if (!karte) return;
    const frage = (wert) => { eltern.wagenFrage = wert; eltern.wagenFehler = ""; eltern.wagenFertig = ""; zeichneWagenKarte(); };
    karte.querySelectorAll("[data-wagen-set]").forEach((knopf) => {
      knopf.addEventListener("click", () => frage(knopf.dataset.wagenSet));
    });
    karte.querySelector("[data-wagen-zurueck]")?.addEventListener("click", () => frage("zurueck"));
    karte.querySelectorAll("[data-wagen-ab]").forEach((knopf) => {
      knopf.addEventListener("click", () => frage(null));
    });
    karte.querySelector("[data-wagen-ja]")?.addEventListener("click", (event) => {
      wagenUmstellen(event.currentTarget.dataset.wagenJa);
    });
    karte.querySelector("[data-wagen-zurueck-ja]")?.addEventListener("click", () => wagenUmstellen(null));
  }

  // setId gesetzt: auf dieses Set. setId null: zurück zum Set für alle.
  async function wagenUmstellen(setId) {
    if (eltern.wagenLaeuft) return;
    const train = window.LernappTrain;
    const label = setId ? (train?.SET_BY_ID?.[setId]?.label || `Set ${setId}`) : "die Wagen für alle";
    eltern.wagenFrage = null;
    eltern.wagenFehler = "";
    eltern.wagenFertig = "";
    eltern.wagenLaeuft = "Die Konten der Familie werden zurückgesetzt...";
    zeichneWagenKarte();

    const melden = (done, total) => {
      eltern.wagenLaeuft = `Konto ${done} von ${total} zurückgesetzt...`;
      zeichneWagenKarte();
    };

    try {
      const ergebnis = setId
        ? await switchFamilyWagonSet(setId, { onProgress: melden })
        : await clearFamilyWagonSet({ onProgress: melden });
      eltern.wagenFertig = `Umgestellt auf ${label}. ${ergebnis.accounts} Konten zurückgesetzt; andere Geräte deiner Familie stellen beim nächsten Öffnen der App um.`;
      eltern.kindDetails.clear();
    } catch (error) {
      eltern.wagenFehler = authErrorMessage(error);
    }
    eltern.wagenLaeuft = "";
    // Das eigene Konto ist mit zurückgesetzt: das ganze Profilfenster neu.
    try { await refreshDashboard(); } catch { zeichneWagenKarte(); }
  }


  function serverErrorMessage(error) {
    const code = String(error?.code || "");
    if (code === "server/not-signed-in" || code === "server/bad-token") return "Die Anmeldung ist abgelaufen. Bitte neu anmelden.";
    if (code === "server/parents-only") return "Das kann nur ein Elternkonto.";
    if (code === "server/admin-only") return "Das kann nur der Administrator.";
    if (code === "server/no-account") return "Dieses Konto gibt es nicht (mehr). Lade die Liste neu.";
    if (code === "server/already-paid") return "Diese Familie hat bezahlt – da ist nichts freizuschalten.";
    if (code === "server/paid-not-gift") return "Diese Familie hat bezahlt. Ein Kauf wird bei Stripe zurückerstattet, nicht hier.";
    if (code === "server/name-taken") return "Diesen Namen gibt es schon. Nimm einen anderen – mit Nachnamen oder einer Zahl.";
    if (code === "server/short-password") return "Das Passwort muss mindestens 4 Zeichen haben.";
    if (code === "server/missing-name") return "Bitte gib einen Namen ein.";
    if (code === "server/too-many-children") return "Vier Kinder – mehr gehen je Elternkonto nicht.";
    if (code === "server/not-your-child") return "Dieses Kind gehört nicht zu deinem Konto.";
    if (code === "server/already-owned") return "Dieses Konto hat Gripszug schon gekauft.";
    if (code === "server/bad-address") return "Das ist keine gültige E-Mail-Adresse.";
    if (code === "server/no-key") return "RESEND_API_KEY fehlt bei Netlify – ohne Schlüssel verschickt Gripszug nichts.";
    if (code === "server/not-yourself") return "Dein eigenes Konto löschst du nicht hier.";
    if (code === "server/admin-account") return "Ein Admin-Konto wird hier nicht gelöscht.";
    if (code === "server/has-children") return error?.message || "Dieses Elternkonto führt noch Kinder.";
    if (code === "server/send-failed") return error?.message || "Die Mail ging nicht raus. Steht die Domain bei Resend auf \u00ABverified\u00BB?";
    // 502/504: Die Funktion war kalt und hat zu lange gebraucht. Der zweite
    // Versuch trifft sie wach an und geht fast immer durch.
    if (code === "server/502" || code === "server/504") return "Der Server hat zu lange gebraucht – er war noch am Aufwachen. Bitte gleich noch einmal tippen.";
    if (code === "server/404") return "Der Server ist gerade nicht erreichbar. Bitte später noch einmal.";
    if (code === "server/500") return "Auf dem Server ist etwas schiefgegangen. Bitte später noch einmal.";
    if (code.includes("network")) return "Keine Verbindung. Bitte prüfe das Netz.";
    return error?.message || "Das hat nicht geklappt.";
  }


  // Zurücksetzen ist nicht rückgängig zu machen, also fragt die Karte nach:
  // erst der Klick, dann die Frage, dann die Tat. Eine eigene Rückfrage statt
  // confirm(): das Fenster steht in einer PWA nicht überall zur Verfügung, und
  // der Satz darf erklären, was genau verschwindet.
  function renderResetProgressCard(confirming = false) {
    if (confirming) {
      return `
        <div class="unlock-mode-card reset-card is-confirming" data-reset-card>
          <div>
            <strong>Wirklich allen Fortschritt zurücksetzen?</strong>
            <span>Gelöste Level, Sitzungen, Sterne und Bestenlisten werden gelöscht. Der Zug fängt wieder von vorn an: alle Wagen starten bei 0. Lok und Landschaft bleiben. Das lässt sich nicht rückgängig machen.</span>
          </div>
          <div class="card-actions">
            <button type="button" class="secondary-action" data-reset-cancel>Abbrechen</button>
            <button type="button" class="danger-action" data-reset-confirm>Ja, alles zurücksetzen</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="unlock-mode-card reset-card" data-reset-card>
        <div>
          <strong>Fortschritt</strong>
          <span>Zug und Wagen wieder auf 0 stellen</span>
        </div>
        <button type="button" class="danger-action" data-reset-progress>Fortschritt zurücksetzen</button>
      </div>
    `;
  }

  function bindResetProgressCard() {
    const card = modalContent.querySelector("[data-reset-card]");
    if (!card) return;

    const swap = (confirming) => {
      card.outerHTML = renderResetProgressCard(confirming);
      bindResetProgressCard();
    };

    const setStatus = (text, art = "fehler") => zeigeMeldung(modalContent.querySelector(".auth-status"), text, art);

    card.querySelector("[data-reset-progress]")?.addEventListener("click", () => {
      setStatus("");
      swap(true);
    });

    card.querySelector("[data-reset-cancel]")?.addEventListener("click", () => {
      setStatus("");
      swap(false);
    });

    card.querySelector("[data-reset-confirm]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      setStatus("Fortschritt wird zurückgesetzt...", "laeuft");
      try {
        await resetProgressFor(state.user?.uid);
        // resetProgressFor hat das Dashboard nicht neu gebaut; das passiert
        // hier, damit die Zahlen und die Karte wieder zusammenpassen.
        await refreshDashboard();
        setStatus("Fortschritt zurückgesetzt. Der Zug beginnt wieder bei 0.");
      } catch (error) {
        button.disabled = false;
        setStatus(authErrorMessage(error));
      }
    });
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

  // Alle Käufe auf einmal – daraus entscheidet die Adminseite, welches Konto
  // bezahlt ist und welches gratis unterwegs. Lesen darf das nur der Admin
  // (firestore.rules); ein Konto ohne Eintrag ist einfach keines mit Kauf.
  //
  // Zurück kommt eine Map von Kennung auf den Eintrag, damit die Kontenliste
  // nicht für jedes Konto einzeln nachfragen muss.
  async function loadEntitlements() {
    const snapshot = await state.db.collection("entitlements").get();
    const map = new Map();
    snapshot.docs.forEach((doc) => {
      const data = doc.data() || {};
      map.set(doc.id, {
        plan: typeof data.plan === "string" ? data.plan : "",
        active: Boolean(data.active),
        source: typeof data.source === "string" ? data.source : "",
        via: typeof data.via === "string" ? data.via : null,
        grantedAtMs: Number(data.grantedAtMs) || 0,
        refundedAtMs: Number(data.refundedAtMs) || 0,
      });
    });
    return map;
  }

  // --- Die Post ---------------------------------------------------------------
  // Jede Mail, die Gripszug verschickt hat, und jede, die an kids@alae.app
  // ankam, steht in "mails" (netlify/functions/_lib/mail.mjs schreibt sie
  // dorthin). Lesen darf das nur der Admin, schreiben niemand – auch er nicht:
  // Ein Postausgang, in dem sich Einträge ändern lassen, ist keiner.
  //
  // Die Neuesten zuerst, und nicht alle: Wer weiter zurück will, sucht in
  // Resend oder im weitergeleiteten Postfach. Der Adminbereich ist der
  // schnelle Blick, kein Archiv für die Ewigkeit.
  const MAIL_GRENZE = 300;

  async function loadMails() {
    const snapshot = await state.db.collection("mails").orderBy("zeitMs", "desc").limit(MAIL_GRENZE).get();
    return snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        richtung: data.richtung === "ein" ? "ein" : "aus",
        art: typeof data.art === "string" ? data.art : "sonstige",
        status: typeof data.status === "string" ? data.status : "",
        von: typeof data.von === "string" ? data.von : "",
        an: typeof data.an === "string" ? data.an : "",
        betreff: typeof data.betreff === "string" ? data.betreff : "",
        text: typeof data.text === "string" ? data.text : "",
        html: typeof data.html === "string" ? data.html : "",
        fehler: typeof data.fehler === "string" ? data.fehler : "",
        uid: typeof data.uid === "string" ? data.uid : "",
        pruefung: data.pruefung || null,
        anhaenge: Array.isArray(data.anhaenge) ? data.anhaenge.map((name) => String(name)) : [],
        zeitMs: Number(data.zeitMs) || timestampDate(data.zeit)?.getTime() || 0,
      };
    });
  }

  // Die Weiterleitung: Wohin die Post an kids@alae.app geht. Gelesen wird sie
  // über den Server, damit in einer Antwort auch steht, ob überhaupt ein
  // Schlüssel hinterlegt ist – das sieht das Dokument nicht.
  // Als Funktionsdeklaration, nicht als const: cloudApi steht weiter oben in
  // dieser Datei und nennt sie beim Namen. Ein const wäre zu diesem Zeitpunkt
  // noch nicht da (temporal dead zone), und der Adminbereich bekäme beim Laden
  // einen ReferenceError statt einer Oberfläche.
  function mailEinstellungen() {
    return serverAufruf("mail-einstellungen", { aktion: "lesen" });
  }

  function speichereMailEinstellungen(weiterleitungAn, weiterleitungAktiv) {
    return serverAufruf("mail-einstellungen", { aktion: "speichern", weiterleitungAn, weiterleitungAktiv });
  }

  function testMailSchicken(weiterleitungAn) {
    return serverAufruf("mail-einstellungen", { aktion: "test", weiterleitungAn });
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

  // Die Level jedes Kontos werden hier ohnehin gelesen – für die Kurzfassung in
  // der Zeile. Sie bleiben am Eintrag stehen, weil die Auswertung je Spiel und
  // der Zug-Fortschritt genau daraus gerechnet werden; ein zweites Lesen wäre
  // derselbe Weg zum selben Ziel.
  async function attachAdminSummaries(collectionName, entries) {
    return Promise.all(entries.map(async (entry) => {
      try {
        const snapshot = await state.db.collection(collectionName).doc(entry.id).collection("levelProgress").get();
        const progressDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return { ...entry, levelDocs: progressDocs, adminSummary: summarizeEntity(entry, progressDocs) };
      } catch (error) {
        return { ...entry, levelDocs: [] };
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

  // --- Gäste löschen -----------------------------------------------------------
  // Der Gegenpart zum Zählen: Wer Besuche sammelt, muss sie auch wieder
  // loswerden können, sonst wächst die Liste, bis niemand mehr hinsieht.
  //
  // Es nimmt niemandem etwas weg. Der Stand eines Gastes liegt auf seinem
  // Gerät (localStorage, LOCAL_SOLVED_PREFIX); das Dokument hier ist die
  // Kopie, die der Adminbereich lesen kann. Ein gelöschter Gast spielt weiter,
  // wo er aufgehört hat – nur die Statistik ist weg. Genau deshalb gibt es für
  // Gäste bis heute keinen Zurücksetzen-Knopf: Er täte auf dem Gerät nichts.
  //
  // Kommt der Gast wieder, legt ihn besuch.mjs neu an – mit der alten Kennung,
  // aber bei Besuch eins. Auch das ist kein Verlust, sondern der Sinn der
  // Sache: Gelöscht ist gelöscht, und weitergezählt wird ab jetzt.
  async function deleteGuest(guestId) {
    if (!guestId) return;
    const ref = state.db.collection("guests").doc(guestId);
    // Erst die Unterordner, dann das Dokument. Andersherum bliebe bei einem
    // Abbruch ein Level-Fortschritt ohne Gast stehen – in Firestore ist ein
    // gelöschtes Dokument kein gelöschter Unterordner, und was dort liegt,
    // sähe danach niemand mehr, weil die Liste nur über guests/ geht.
    await deleteAllDocs(ref.collection("levelProgress"));
    await deleteAllDocs(ref.collection("sessions"));
    await ref.delete();
  }

  // Hat dieser Gast gespielt? Die Frage entscheidet, wen der Sammelknopf im
  // Adminbereich anfasst – deshalb steht sie hier und nicht dort: Eine zweite
  // Fassung in admin.js wäre eine zweite Wahrheit, und die teurere Hälfte der
  // Antwort (der Level-Fortschritt) wird ohnehin hier gelesen.
  //
  // Mehrere Wege, weil mehrere Stellen Spuren hinterlassen: recordLevelStart,
  // mergeSolvedLevel und flushCurrentSession für die Spiele mit Levelkatalog –
  // und gastSpielstandSichern für die Spiele mit eigenem Kasten, die gar keine
  // Level haben. Wer nur den ersten prüfte, hielte eine Stunde Turmbau für
  // einen Nichtbesuch.
  function guestHasPlayed(guest, levelDocs = guest?.levelDocs) {
    if (!guest) return false;
    if (guest.hatGespielt === true) return true;
    if ((levelDocs?.length || 0) > 0) return true;
    // Der Kasten eines Spiels ohne Level. Auch ein alter Gast, dessen Marke
    // noch fehlt, ist damit erkannt – geschrieben wurde der Kasten schon,
    // bevor es die Marke gab.
    if (Object.keys(readGameState(guest.gameState)).length > 0) return true;
    const stats = guest.stats || {};
    return Number(stats.sessions || 0) > 0
      || Number(stats.solvedLevels || 0) > 0
      || Number(stats.totalSeconds || 0) > 0;
  }

  // Nacheinander, nicht alle auf einmal: Jeder Gast sind bis zu drei Runden
  // Lesen und Löschen, und ein Promise.all über hundert Gäste heisst hundert
  // gleichzeitige Abfragen. Firestore nimmt das übel, und der Sammelknopf
  // läuft ohnehin im Hintergrund.
  //
  // nurOhneSpiel liest jeden Gast unmittelbar vor dem Löschen noch einmal.
  // Das ist nicht übervorsichtig: Der Adminbereich kann stundenlang offen
  // stehen, und zwischen dem Laden der Liste und dem Klick auf "Ja" kann ein
  // Kind angefangen haben zu spielen. Der Knopf verspricht, nur Geräte ohne
  // Spiel anzufassen – ohne diese Nachfrage wäre das Versprechen an einen
  // Stand gebunden, der beliebig alt sein darf.
  async function deleteGuests(guestIds = [], { nurOhneSpiel = false } = {}) {
    let geloescht = 0;
    const uebersprungen = [];
    for (const id of guestIds) {
      if (nurOhneSpiel && await guestPlayedNow(id)) { uebersprungen.push(id); continue; }
      await deleteGuest(id);
      geloescht += 1;
    }
    return { geloescht, uebersprungen };
  }

  // Der frische Blick auf einen einzelnen Gast. limit(1) genügt: Gefragt ist,
  // OB etwas dasteht, nicht wie viel.
  async function guestPlayedNow(guestId) {
    const ref = state.db.collection("guests").doc(guestId);
    try {
      const [gastDoc, level, sitzungen] = await Promise.all([
        ref.get(),
        ref.collection("levelProgress").limit(1).get(),
        ref.collection("sessions").limit(1).get(),
      ]);
      if (!gastDoc.exists) return false;
      if (!level.empty || !sitzungen.empty) return true;
      return guestHasPlayed({ id: guestId, ...(gastDoc.data() || {}) }, []);
    } catch (error) {
      // Nicht lesbar heisst hier: nicht anfassen. Ein Gast, über den wir
      // gerade nichts wissen, ist der schlechteste Kandidat zum Löschen.
      return true;
    }
  }

  // --- Die Schwierigkeitsstufe --------------------------------------------------
  // "leicht", "mittel" oder "schwer" (journey-plan.js, STUFEN): Sie stellt die
  // Reise und die Spiele ein. Die Einstellung liegt im Kasten der Reise
  // (gameState lernapp.reise) mit einer Zeitmarke: das Gerät des Kindes nimmt
  // beim Zusammenführen die neuere – und gameState dürfen Admin und Eltern
  // schreiben (firestore.rules, isProgressReset). Ein Zurücksetzen schreibt
  // sie danach wieder hin (resetProgressFor).
  async function setJourneyStufeFor(userId, stufe) {
    const reise = window.LernappReise;
    const ref = userRef(userId);
    if (!ref || !reise) return false;
    const value = reise.STUFEN.includes(stufe) ? stufe : reise.STUFE_DEFAULT;
    const at = Date.now();
    await ref.set({
      gameState: { [reise.KEY]: { data: { stufe: value, stufeAt: at }, updatedAt: at } },
      updatedAt: serverTimestamp(),
    }, { merge: true });
    if (userId === state.user?.uid) reise.setStufe(value);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Ein Konto ansehen – gemeinsam für Elternbereich und Adminseite
  // ---------------------------------------------------------------------------
  // Diese Funktionen zeichnen, was an einem Konto zu sehen ist: der Zug als
  // Balken, die Levelabdeckung, die Level, die Sitzungen. Sie stehen hier und
  // nicht zweimal, weil sie zweimal gebraucht werden – im Profilfenster für
  // die eigene Familie (Elternbereich) und auf admin.html für alle. Zwei
  // Fassungen wären zwei Wahrheiten, und die falsche wäre immer die, die
  // gerade niemand angesehen hat.
  //
  // Sie rechnen nur; nichts hier fragt, wer angemeldet ist. Was jemand sehen
  // DARF, entscheidet firestore.rules – wer nichts lesen darf, bekommt keine
  // Daten und damit auch kein Bild.
  //
  // Nach aussen stehen sie unter window.LernappFirebase.ansicht.

  function entityDisplayName(userData = {}) {
    if (userData.type === "guest") return cleanDisplayName(userData.displayName || guestDisplayName(userData.guestId || userData.id));
    return cleanDisplayName(userData.displayName || userData.username || userData.email || userData.authEmail || "Unbekannter User");
  }

  function levelSort(a, b) {
    return `${gameLabel(a.game)} ${a.levelName || a.levelId || ""}`.localeCompare(`${gameLabel(b.game)} ${b.levelName || b.levelId || ""}`, "de");
  }

  function levelShortLabel(entry = {}) {
    return `${gameLabel(entry.game)} · ${entry.levelName || entry.title || entry.levelId || entry.id || "Level"}`;
  }

  function summarizeEntity(entityData = {}, progressDocs = [], sessions = []) {
    const stats = summarizeProgress(entityData, progressDocs);
    const topLevels = progressDocs
      .map((entry) => {
        const attempts = Number(entry.attempts || 0) || (entry.solved || entry.timeSeconds || entry.moves ? 1 : 0);
        return { entry, attempts, seconds: Number(entry.timeSeconds || entry.elapsedSeconds || 0) };
      })
      .filter((item) => item.attempts > 0)
      .sort((a, b) => (b.attempts - a.attempts) || (b.seconds - a.seconds) || levelSort(a.entry, b.entry))
      .slice(0, 3);

    return {
      ...stats,
      sessions: Number(entityData.stats?.sessions || 0) || sessions.length || 0,
      attemptedLevels: progressDocs.filter((entry) => entry.solved || Number(entry.attempts || 0) || Number(entry.timeSeconds || 0)).length,
      topLevels,
    };
  }

  // Wann dieses Konto zuletzt da war. Mehrere Felder, weil nicht jedes Konto
  // alle trägt: lastSeenAt schreibt jede Sitzung, updatedAt jede Änderung,
  // createdAt gibt es immer. Das Ergebnis ist eine Zahl in Millisekunden –
  // damit lässt sich sortieren, was als Zeitstempel, Datum oder Zahl dasteht.
  function lastActivityMs(entity = {}) {
    return timestampDate(entity.lastSeenAt || entity.updatedAt || entity.createdAt || entity.createdAtMs)?.getTime() || 0;
  }

  // Der Zug eines Kontos: genau die Rechnung, die auch das Startbild benutzt.
  // Ein Wagen bedeutet hier dasselbe wie beim Kind. Eine zweite Rechnung wäre
  // eine zweite Wahrheit – und die falsche wäre immer die hier.
  //
  // Gerechnet wird das in train-progress.js, und der Levelkatalog steht in
  // app.js. Fehlt eines von beiden (auf einer Spielseite etwa), bleibt der
  // Streifen weg, statt eine Zahl zu zeigen, die nicht stimmen kann.
  function trainAreasFor(entity) {
    const train = window.LernappTrain;
    if (!train?.areasForAccount || !window.LernappLevelCatalog) return null;
    const solved = (entity.levelDocs || entity.progressDocs || [])
      .filter((doc) => doc.solved && doc.game && doc.levelId)
      .map((doc) => `${doc.game}.${doc.levelId}`);
    return train.areasForAccount({ solved, gameState: readGameState(entity.gameState) });
  }

  function renderTrainStrip(entity) {
    const areas = trainAreasFor(entity);
    if (!areas) return "";
    return `
      <span class="admin-train" aria-label="Fortschritt des Zugs">
        ${areas.map((area) => `
          <span class="admin-train-car" style="--wagen: ${escapeHtml(area.color)}" title="${escapeHtml(area.label)}: Schritt ${area.stage} von ${window.LernappTrain.STAGE_COUNT}">
            <b>${area.stage}</b>
            <i><s style="width: ${Math.round(Math.min(1, area.ratio) * 100)}%"></s></i>
            <em>${escapeHtml(area.label)}</em>
          </span>
        `).join("")}
      </span>
    `;
  }

  // Derselbe Zug, nur ausgeschrieben: welche Stufe der Wagen hat, wie voll der
  // Bereich ist und wie viele Runden dahinterstehen. Die Stufe allein sagt
  // nicht, ob bis zur nächsten zwei Runden fehlen oder zwanzig.
  function renderTrainDetail(entity) {
    const areas = trainAreasFor(entity);
    if (!areas) {
      return `
        <section class="admin-train-detail">
          <h4>Fortschritt des Zugs</h4>
          <p class="account-muted">Steht dort, wo der Levelkatalog geladen ist &#8211; auf dem Startbild und im Adminbereich.</p>
        </section>
      `;
    }

    const stufen = window.LernappTrain.STAGE_COUNT;
    // Die Reise: wie weit der Zug auf der Streckenkarte ist. Gerechnet in
    // journey-plan.js aus demselben Kasten, den auch die Karte liest.
    const reise = window.LernappReise;
    const fahrt = reise ? reise.progressFor(readGameState(entity.gameState)[reise.KEY]?.data) : null;
    const reiseZeile = fahrt
      ? `<p class="admin-train-reise">${fahrt.complete
        ? `Reise: beide Reisen geschafft, alle ${reise.STATION_COUNT} Stationen`
        : `Reise ${fahrt.lap}: Station ${fahrt.lapStation} von ${fahrt.lapTotal} (Nr. ${fahrt.station}), Karte ${reise.mapIndexOf(fahrt.station) + 1} (${reise.MAPS[reise.mapIndexOf(fahrt.station)]?.name || ""})`}
        · ${fahrt.finishedMaps} von ${reise.MAPS.length} Karten fertig · ${fahrt.golden} goldene Stempel${fahrt.pushed ? ` · ${fahrt.pushed}× von der Schiebelok geschoben` : ""} · Stufe ${reise.STUFE_INFO?.[fahrt.stufe]?.label || fahrt.stufe}</p>`
      : "";
    return `
      <section class="admin-train-detail">
        <h4>Fortschritt des Zugs</h4>
        ${reiseZeile}
        <div>
          ${areas.map((area) => `
            <span style="--wagen: ${escapeHtml(area.color)}">
              <b>${escapeHtml(area.label)}</b>
              <i><s style="width: ${Math.round(Math.min(1, area.ratio) * 100)}%"></s></i>
              <em>Schritt ${area.stage} von ${stufen} · ${Math.round(area.ratio * 100)}%</em>
              <em>${area.solved} von ${area.total} Runden gespielt</em>
            </span>
          `).join("")}
        </div>
      </section>
    `;
  }

  // --- Welche Level probiert wurden, und welche nicht -------------------------
  // Die Frage, die eine Liste gelöster Level nicht beantwortet: Was hat das
  // Kind NICHT angefasst? Gezeichnet wird deshalb der ganze Katalog, Spiel für
  // Spiel, jedes Level ein Punkt in einer von drei Farben:
  //
  //   gelöst     einmal geschafft
  //   probiert   angefangen, aber nicht geschafft
  //   offen      nie geöffnet
  //
  // Der Katalog kommt aus app.js (window.LernappLevelCatalog) und umfasst nur
  // die Spiele mit Levelwahl. Die Spiele mit eigenem Kasten – Memory, Turmbau,
  // Tiersprung und die anderen – haben keine Level, sondern Runden; für sie
  // steht darunter, wie viele Runden gespielt wurden.
  function levelCoverageFor(progressDocs = [], gameState = null) {
    const katalog = window.LernappLevelCatalog || {};
    const stand = new Map();
    progressDocs.forEach((entry) => {
      if (!entry.game) return;
      const id = entry.levelId || entry.id;
      stand.set(`${entry.game}.${id}`, entry);
    });

    const spiele = Object.entries(katalog).map(([game, levels]) => {
      const punkte = (levels || []).map((level) => {
        const entry = stand.get(`${game}.${level.id || level.levelName}`);
        const versuche = Number(entry?.attempts || 0);
        const status = entry?.solved ? "geloest" : ((versuche || Number(entry?.timeSeconds || 0)) ? "probiert" : "offen");
        return { level, entry: entry || null, status, versuche };
      });
      return {
        game,
        label: gameLabel(game),
        punkte,
        geloest: punkte.filter((p) => p.status === "geloest").length,
        probiert: punkte.filter((p) => p.status === "probiert").length,
        offen: punkte.filter((p) => p.status === "offen").length,
      };
    }).filter((spiel) => spiel.punkte.length);

    // Und die Spiele mit eigenem Kasten: keine Level, aber Runden. Gezählt
    // wird das in train-progress.js – dieselbe Zahl, aus der sich die Wagen
    // rechnen.
    const train = window.LernappTrain;
    const runden = [];
    if (train?.AREAS && gameState) {
      const quelle = { solved: progressDocs.filter((d) => d.solved && d.game && d.levelId).map((d) => `${d.game}.${d.levelId}`), gameState };
      (train.areasForAccount(quelle) || []).forEach((area) => {
        (area.games || []).forEach((spiel) => {
          if (katalog[spiel.id]) return;
          // solved ist bei diesen Spielen die Zahl der gezählten Runden,
          // gedeckelt bei dem, was das Wagen-Set je Spiel verlangt (total).
          runden.push({
            id: spiel.id,
            label: spiel.title || gameLabel(spiel.id),
            gespielt: Number(spiel.solved || 0),
            noetig: Number(spiel.total || 0),
            best: Number.isFinite(spiel.best) ? spiel.best : null,
          });
        });
      });
    }

    return { spiele, runden };
  }

  function renderLevelCoverage(progressDocs = [], entity = {}) {
    const { spiele, runden } = levelCoverageFor(progressDocs, readGameState(entity.gameState));
    if (!spiele.length && !runden.length) {
      return `<section class="admin-abdeckung"><h4>Probierte Level</h4><p class="account-muted">Der Levelkatalog ist hier nicht geladen.</p></section>`;
    }

    const gesamt = spiele.reduce((summe, s) => summe + s.punkte.length, 0);
    const geloest = spiele.reduce((summe, s) => summe + s.geloest, 0);
    const probiert = spiele.reduce((summe, s) => summe + s.probiert, 0);

    return `
      <section class="admin-abdeckung">
        <h4>Probierte Level</h4>
        <p class="abdeckung-legende">
          <span class="ist-geloest">${geloest} gel&ouml;st</span>
          <span class="ist-probiert">${probiert} angefangen</span>
          <span class="ist-offen">${gesamt - geloest - probiert} nie ge&ouml;ffnet</span>
        </p>
        <div class="abdeckung-spiele">
          ${spiele.map((spiel) => `
            <article>
              <header>
                <strong>${escapeHtml(spiel.label)}</strong>
                <span>${spiel.geloest}/${spiel.punkte.length}</span>
              </header>
              <div class="abdeckung-punkte">
                ${spiel.punkte.map((p) => `<i class="ist-${p.status}" title="${escapeHtml(`${p.level.levelName || p.level.id}: ${p.status === "geloest" ? "gelöst" : (p.status === "probiert" ? `${p.versuche || 1}× versucht` : "nie geöffnet")}`)}"></i>`).join("")}
              </div>
            </article>
          `).join("")}
        </div>
        ${runden.length ? `
          <h4 class="abdeckung-runden-titel">Spiele ohne Level &#8211; gespielte Runden</h4>
          <div class="admin-data-grid abdeckung-runden">
            ${runden.map((spiel) => `<span class="${spiel.gespielt ? "" : "ist-offen"}"><b>${escapeHtml(spiel.label)}</b>${spiel.gespielt ? `${spiel.gespielt} von ${spiel.noetig} Runden${spiel.best !== null ? ` &middot; bestes Ergebnis ${spiel.best}` : ""}` : "nie gespielt"}</span>`).join("")}
          </div>` : ""}
      </section>
    `;
  }

  function renderDetailPair([label, value]) {
    return `<span><b>${escapeHtml(label)}</b>${escapeHtml(value ?? "-")}</span>`;
  }

  function renderLevelDetail(entry) {
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
        <strong>${escapeHtml(gameLabel(entry.game))} · ${escapeHtml(entry.levelName || entry.title || entry.levelId || entry.id || "Level")}</strong>
        <span>${escapeHtml(DIFFICULTY_LABELS[entry.difficulty] || entry.difficulty || "")}</span>
        <div class="admin-data-grid">${details.map(renderDetailPair).join("")}</div>
      </article>
    `;
  }

  function renderSessionDetail(session) {
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
        <strong>${escapeHtml(gameLabel(session.game))} · ${escapeHtml(session.levelName || session.title || session.levelId || "Level")}</strong>
        <span>${escapeHtml(DIFFICULTY_LABELS[session.difficulty] || session.difficulty || "")}</span>
        <div class="admin-data-grid">${details.map(renderDetailPair).join("")}</div>
      </article>
    `;
  }

  function renderTopLevels(summary = {}) {
    if (!summary.topLevels?.length) {
      return `<section class="admin-top-levels"><h4>Meist gespielte Level</h4><p class="account-muted">Noch keine gespielten Level.</p></section>`;
    }

    return `
      <section class="admin-top-levels">
        <h4>Meist gespielte Level</h4>
        <div>
          ${summary.topLevels.map((item) => `
            <span>
              <b>${escapeHtml(levelShortLabel(item.entry))}</b>
              ${escapeHtml(`${item.attempts}x gespielt · ${formatDuration(item.seconds)}`)}
            </span>
          `).join("")}
        </div>
      </section>
    `;
  }

  // Die Rätselarten, zu denen es bei diesem Konto überhaupt etwas gibt – als
  // Filterleiste. "all" steht immer voran.
  function renderGameFilters(progressDocs, sessions, selectedGame) {
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
            ${game === "all" ? "Alle" : escapeHtml(gameLabel(game))}
          </button>
        `).join("")}
      </div>
    `;
  }

  // Der ganze Bauch eines aufgeklappten Kontos. selectedGame filtert Level und
  // Sitzungen; wer keine Filterleiste will, gibt "all" und zeigt sie nicht an.
  function renderEntityDetail(detail, { selectedGame = "all", withFilters = true } = {}) {
    if (!detail) return "<p class=\"account-muted\">Wähle ein Konto aus.</p>";
    if (detail.error) return `<p class="auth-status">${escapeHtml(authErrorMessage(detail.error))}</p>`;

    const userData = detail.userData || {};
    const progressDocs = detail.progressDocs || [];
    const sessions = detail.sessions || [];
    const summary = summarizeEntity(userData, progressDocs, sessions);
    const filteredProgress = selectedGame === "all" ? progressDocs : progressDocs.filter((entry) => entry.game === selectedGame);
    const filteredSessions = selectedGame === "all" ? sessions : sessions.filter((session) => session.game === selectedGame);

    return `
      <div class="stat-strip admin-stat-strip">
        <div><strong>${summary.totalSolved}</strong><span>gelöst</span></div>
        <div><strong>${formatDuration(summary.totalSeconds)}</strong><span>Spielzeit</span></div>
        <div><strong>${summary.moves}</strong><span>Züge</span></div>
        <div><strong>${sessions.filter((session) => !session.solved && session.endedAt).length}</strong><span>Abbrüche</span></div>
      </div>
      ${renderTrainDetail({ ...userData, levelDocs: progressDocs })}
      ${renderLevelCoverage(progressDocs, userData)}
      ${renderTopLevels(summary)}
      ${withFilters ? renderGameFilters(progressDocs, sessions, selectedGame) : ""}
      <div class="admin-columns">
        <section>
          <h4>Level-Fortschritt</h4>
          <div class="admin-data-list">
            ${filteredProgress.length ? [...filteredProgress].sort(levelSort).map(renderLevelDetail).join("") : "<p class=\"account-muted\">Keine Leveldaten für diese Auswahl.</p>"}
          </div>
        </section>
        <section>
          <h4>Sitzungen</h4>
          <div class="admin-data-list">
            ${filteredSessions.length ? filteredSessions.map(renderSessionDetail).join("") : "<p class=\"account-muted\">Keine Sitzungen für diese Auswahl.</p>"}
          </div>
        </section>
      </div>
    `;
  }

  // Wie ein Spiel heisst. Die erste Adresse ist highscore.js: dort steht der
  // Name, den auch das Kind auf der Bühne liest. GAME_LABELS bleibt für die
  // Rätsel, die es dort nicht (mehr) gibt und deren Fortschritt trotzdem noch
  // in alten Konten stehen kann.
  function gameLabel(game) {
    return window.LernappHighscore?.spiel?.(game)?.titel
      || GAME_LABELS[game]
      || game
      || "Rätsel";
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
        label: gameLabel(game),
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
    const spielName = gameLabel(session.game);
    const difficulty = DIFFICULTY_LABELS[session.difficulty] || session.difficulty || "";
    return `
      <article class="session-item">
        <div>
          <strong>${escapeHtml(spielName)} · ${escapeHtml(levelLabel)}</strong>
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
    if (code.includes("invalid-parent-email")) return "Bitte gib eine gültige E-Mail-Adresse ein.";
    if (code.includes("parent-password-short")) return "Das Passwort muss mindestens 6 Zeichen haben.";
    if (code.includes("too-many-requests")) return "Zu viele Versuche. Bitte warte einen Moment.";
    if (code.includes("network-request-failed")) return "Keine Verbindung. Bitte prüfe das Netz.";
    if (code.includes("short-password") || code.includes("weak-password")) return "Das Passwort muss mindestens 4 Zeichen haben.";
    if (code.includes("invalid-email")) return "Dieser Name kann nicht verwendet werden.";
    if (code.includes("email-already-in-use")) return "Dieser Name ist bereits vergeben.";
    if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) return "Name oder Passwort stimmt nicht.";
    if (code.includes("family-needed")) return "Dafür braucht es erst ein Kind: Die Wagen gelten für die ganze Familie.";
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
