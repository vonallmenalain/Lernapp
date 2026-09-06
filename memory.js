/*
 * memory.js – Memory als eine Runde mit wählbarer Grösse.
 *
 * Acht bis vierundzwanzig Karten liegen verdeckt da; zwei aufdecken, und
 * stimmen sie überein, bleiben sie offen. Punkte gibt es keine: geschafft ist
 * geschafft. Fünf abgeschlossene Runden bauen den Wagen – ob mit acht Karten
 * oder mit vierundzwanzig, ist gleich.
 *
 * Jede umgedrehte Karte ist von Anfang an eine ganze Karte: heller Karton mit
 * einem Ring in der Farbe des Bereichs. Dass ein Paar stimmt, sagt nicht mehr
 * das Aussehen, sondern ein kurzes Zeichen – der Ring wird grün, und beide
 * Karten pulsieren einmal, bevor sie verschwinden.
 *
 * Die Karten werden einmal je Runde gebaut und danach nur noch umgedreht.
 * Vorher wurde das ganze Feld bei jedem Tipp neu gezeichnet – und jedes
 * gefundene Paar spielte dabei sein Verschwinden noch einmal ab: für einen
 * Wimpernschlag standen die Bilder wieder da, bei jeder Karte, die sich
 * drehte. Was einmal weg ist, bleibt jetzt weg.
 *
 * Bühne und Knöpfe kommen aus game-shell.js.
 */
(() => {
  "use strict";

  if (document.body.dataset.page !== "memory") return;

  const host = document.querySelector("#me-stage");
  const shellApi = window.LernappGameShell;
  const cloudApi = window.LernappGameCloud;
  if (!host || !shellApi) return;

  const kids = () => window.LernappKids || null;

  // ---------------------------------------------------------------------------
  // Regeln
  // ---------------------------------------------------------------------------
  // Die Grössen sind Kartenzahlen, nicht Paare: ein Kind zählt, was es sieht.
  const GROESSEN = [8, 12, 16, 20, 24];
  const RUNDEN_FUER_WAGEN = 5;
  // Wie lange zwei ungleiche Karten offen bleiben. Lang genug, um beide zu
  // sehen, kurz genug, dass niemand darauf wartet.
  const ZURUECK_MS = 1000;
  // Und wie lange ein gefundenes Paar noch liegen bleibt, bevor es verschwindet.
  const WEG_MS = 620;

  const HELP = [
    "Memory. Alle Karten liegen verdeckt da.",
    "Tippe auf eine Karte, dann auf eine zweite.",
    "Sind beide gleich, bleiben sie offen und verschwinden.",
    "Sind sie verschieden, drehen sie sich wieder um – merk dir, wo sie lagen.",
    "Fertig bist du, wenn alle Paare gefunden sind.",
    "Zeit hast du so viel du willst, und Punkte gibt es keine.",
  ].join(" ");

  // Die Motive. Viele, damit zwei Runden hintereinander kaum je dieselben
  // Sachen zeigen: eine Runde braucht höchstens zwölf, und gewählt wird aus
  // über hundert. Was in der letzten Runde lag, wird zusätzlich übersprungen
  // (siehe waehleItems) – so ist jede Runde wirklich neu.
  //
  // Jedes Motiv muss sich von allen anderen auf einen Blick unterscheiden:
  // zwei Sachen, die einander ähneln, machen das Spiel nicht schwerer, sondern
  // unfair. Deshalb steht hier weder Tomate neben Apfel noch Hamster neben Maus.
  const ITEMS = [
    { emoji: "🍎", label: "Apfel" },
    { emoji: "🍌", label: "Banane" },
    { emoji: "🍇", label: "Trauben" },
    { emoji: "🍓", label: "Erdbeere" },
    { emoji: "🥕", label: "Rüebli" },
    { emoji: "🌽", label: "Mais" },
    { emoji: "🧀", label: "Käse" },
    { emoji: "🍞", label: "Brot" },
    { emoji: "🥪", label: "Sandwich" },
    { emoji: "🍪", label: "Keks" },
    { emoji: "🍫", label: "Schoggi" },
    { emoji: "🍭", label: "Lolli" },
    { emoji: "⚽", label: "Ball" },
    { emoji: "🎲", label: "Würfel" },
    { emoji: "🧩", label: "Puzzle" },
    { emoji: "🧸", label: "Teddy" },
    { emoji: "📘", label: "Buch" },
    { emoji: "✏️", label: "Stift" },
    { emoji: "✂️", label: "Schere" },
    { emoji: "📏", label: "Lineal" },
    { emoji: "🔑", label: "Schlüssel" },
    { emoji: "🔒", label: "Schloss" },
    { emoji: "🎁", label: "Geschenk" },
    { emoji: "🎈", label: "Ballon" },
    { emoji: "👑", label: "Krone" },
    { emoji: "🌸", label: "Blume" },
    { emoji: "🍃", label: "Blatt" },
    { emoji: "🌳", label: "Baum" },
    { emoji: "🍄", label: "Pilz" },
    { emoji: "☀️", label: "Sonne" },
    { emoji: "🌙", label: "Mond" },
    { emoji: "☁️", label: "Wolke" },
    { emoji: "🌈", label: "Regenbogen" },
    { emoji: "❄️", label: "Schneeflocke" },
    { emoji: "🔥", label: "Feuer" },
    { emoji: "💧", label: "Wassertropfen" },
    { emoji: "☂️", label: "Schirm" },
    { emoji: "🧢", label: "Kappe" },
    { emoji: "👟", label: "Schuh" },
    { emoji: "🧦", label: "Socke" },
    { emoji: "🍐", label: "Birne" },
    { emoji: "🍊", label: "Orange" },
    { emoji: "🍋", label: "Zitrone" },
    { emoji: "🍉", label: "Melone" },
    { emoji: "🍒", label: "Kirschen" },
    { emoji: "🍍", label: "Ananas" },
    { emoji: "🥝", label: "Kiwi" },
    { emoji: "🥦", label: "Broccoli" },
    { emoji: "🥨", label: "Brezel" },
    { emoji: "🥐", label: "Gipfeli" },
    { emoji: "🧁", label: "Muffin" },
    { emoji: "🍰", label: "Kuchen" },
    { emoji: "🍦", label: "Glace" },
    { emoji: "🍩", label: "Donut" },
    { emoji: "🍕", label: "Pizza" },
    { emoji: "🥚", label: "Ei" },
    { emoji: "🍿", label: "Popcorn" },
    { emoji: "🐶", label: "Hund" },
    { emoji: "🐱", label: "Katze" },
    { emoji: "🐭", label: "Maus" },
    { emoji: "🐰", label: "Hase" },
    { emoji: "🦊", label: "Fuchs" },
    { emoji: "🐻", label: "Bär" },
    { emoji: "🐼", label: "Panda" },
    { emoji: "🦁", label: "Löwe" },
    { emoji: "🐮", label: "Kuh" },
    { emoji: "🐷", label: "Schwein" },
    { emoji: "🐸", label: "Frosch" },
    { emoji: "🐵", label: "Affe" },
    { emoji: "🐔", label: "Huhn" },
    { emoji: "🐧", label: "Pinguin" },
    { emoji: "🦉", label: "Eule" },
    { emoji: "🦆", label: "Ente" },
    { emoji: "🐴", label: "Pferd" },
    { emoji: "🦄", label: "Einhorn" },
    { emoji: "🐝", label: "Biene" },
    { emoji: "🦋", label: "Schmetterling" },
    { emoji: "🐌", label: "Schnecke" },
    { emoji: "🐞", label: "Marienkäfer" },
    { emoji: "🐢", label: "Schildkröte" },
    { emoji: "🐙", label: "Krake" },
    { emoji: "🦀", label: "Krebs" },
    { emoji: "🐠", label: "Fisch" },
    { emoji: "🐬", label: "Delfin" },
    { emoji: "🐳", label: "Wal" },
    { emoji: "🐘", label: "Elefant" },
    { emoji: "🦒", label: "Giraffe" },
    { emoji: "🐑", label: "Schaf" },
    { emoji: "🦔", label: "Igel" },
    { emoji: "🚗", label: "Auto" },
    { emoji: "🚌", label: "Bus" },
    { emoji: "🚒", label: "Feuerwehrauto" },
    { emoji: "🚜", label: "Traktor" },
    { emoji: "🚲", label: "Velo" },
    { emoji: "🚂", label: "Lokomotive" },
    { emoji: "✈️", label: "Flugzeug" },
    { emoji: "🚁", label: "Helikopter" },
    { emoji: "🚀", label: "Rakete" },
    { emoji: "⛵", label: "Segelboot" },
    { emoji: "🎸", label: "Gitarre" },
    { emoji: "🥁", label: "Trommel" },
    { emoji: "🎺", label: "Trompete" },
    { emoji: "🎹", label: "Klavier" },
    { emoji: "🔔", label: "Glocke" },
    { emoji: "⌚", label: "Uhr" },
    { emoji: "📷", label: "Fotoapparat" },
    { emoji: "💡", label: "Glühbirne" },
    { emoji: "🔦", label: "Taschenlampe" },
    { emoji: "🔨", label: "Hammer" },
    { emoji: "🧹", label: "Besen" },
    { emoji: "🪥", label: "Zahnbürste" },
    { emoji: "🎨", label: "Farbkasten" },
    { emoji: "🪁", label: "Drachen" },
    { emoji: "🏀", label: "Basketball" },
    { emoji: "🛷", label: "Schlitten" },
    { emoji: "⛄", label: "Schneemann" },
    { emoji: "🎃", label: "Kürbis" },
    { emoji: "⭐", label: "Stern" },
    { emoji: "⚡", label: "Blitz" },
    { emoji: "🌵", label: "Kaktus" },
    { emoji: "🌷", label: "Tulpe" },
    { emoji: "🌻", label: "Sonnenblume" },
    { emoji: "🍀", label: "Kleeblatt" },
    { emoji: "🐚", label: "Muschel" },
    { emoji: "🎩", label: "Zylinder" },
    { emoji: "👓", label: "Brille" },
    { emoji: "🧤", label: "Handschuh" },
  ];

  // ---------------------------------------------------------------------------
  // Fortschritt – lokal und in der Cloud
  // ---------------------------------------------------------------------------
  // Gespeichert wird je Grösse, ob sie geschafft ist, und wie viele Runden es
  // insgesamt waren. mergeLevels führt das über Geräte zusammen: was auf einem
  // geschafft war, bleibt geschafft, und von den Runden gilt die höhere Zahl.
  const store = cloudApi
    ? cloudApi.register({ key: "lernapp.memory", empty: { best: {} }, merge: cloudApi.mergeLevels })
    : {
      read: () => ({ best: {} }),
      write(data) { return data; },
      update(fn) { return fn(this.read()); },
      onChange() { return () => {}; },
    };

  const geschafft = (groesse) => (Number(store.read().best?.[groesse]?.stars) || 0) > 0;
  const fertigeZahl = () => GROESSEN.filter(geschafft).length;

  // Dazu zählt jede geschaffte Runde: der Zug rechnet mit gespielten Runden,
  // und wer dieselbe Grösse dreimal schafft, hat dreimal gespielt.
  function merkeRunde(groesse) {
    return store.update((old) => ({
      ...old,
      runs: (Number(old.runs) || 0) + 1,
      best: { ...(old.best || {}), [groesse]: { stars: 3 } },
    }));
  }

  // ---------------------------------------------------------------------------
  // Zustand
  // ---------------------------------------------------------------------------
  const state = { phase: "menu", groesse: 0, karten: [], offen: [], gefunden: 0, locked: false };
  let shell = null;
  let feld = null;
  let prompt = null;
  let stepTimer = null;

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Was die letzte Runde gezeigt hat. Die nächste wählt darum herum: bei über
  // hundert Motiven und höchstens zwölf je Runde geht das immer auf, und ein
  // Kind sieht nie zweimal hintereinander dieselben Sachen. Bloss zu mischen
  // reichte nicht – bei zwölf aus hundert lägen im Schnitt trotzdem ein bis
  // zwei alte Bekannte wieder da.
  //
  // Gemerkt wird nur für diese Sitzung. Beim nächsten Öffnen darf alles wieder
  // vorkommen; einen Speicher dafür anzulegen wäre viel Aufwand für nichts.
  let zuletzt = [];

  function waehleItems(anzahl) {
    const frisch = ITEMS.filter((item) => !zuletzt.includes(item.label));
    const gewaehlt = shuffle(frisch.length >= anzahl ? frisch : ITEMS).slice(0, anzahl);
    zuletzt = gewaehlt.map((item) => item.label);
    return gewaehlt;
  }

  function clearStep() {
    if (stepTimer) { window.clearTimeout(stepTimer); stepTimer = null; }
  }

  // ---------------------------------------------------------------------------
  // Die Wahl der Grösse
  // ---------------------------------------------------------------------------
  function showMenu() {
    clearStep();
    shell.closeOverlay();
    shell.setPhase("menu");
    state.phase = "menu";
    shell.setCount(fertigeZahl());

    shell.clear();
    prompt = shell.el("p", "cm-prompt", "Anzahl Karten");
    shell.play.append(prompt);

    const reihe = shell.el("div", "me-groessen");
    GROESSEN.forEach((groesse) => {
      const button = shell.el("button", `me-groesse${geschafft(groesse) ? " is-done" : ""}`);
      button.type = "button";
      button.dataset.karten = String(groesse);
      button.setAttribute("aria-label",
        `${groesse} Karten. ${geschafft(groesse) ? "Schon geschafft." : "Noch nicht geschafft."}`);
      button.append(shell.el("span", "me-groesse-zahl", String(groesse)));
      // Ein Haken statt Sternen: hier gibt es nichts zu bewerten, nur zu
      // schaffen.
      if (geschafft(groesse)) button.append(shell.el("span", "me-groesse-haken", "✓"));
      button.addEventListener("click", () => startRunde(groesse));
      reihe.append(button);
    });
    shell.play.append(reihe);
  }

  function rundenText(fertig) {
    const left = RUNDEN_FUER_WAGEN - fertig;
    if (left <= 0) return "Dieses Spiel ist geschafft – der Wagen ist gebaut.";
    return left === 1
      ? "Noch eine Runde bis zum fertigen Wagen."
      : `Noch ${left} Runden bis zum fertigen Wagen.`;
  }

  // ---------------------------------------------------------------------------
  // Eine Runde
  // ---------------------------------------------------------------------------
  function startRunde(groesse) {
    clearStep();
    shell.closeOverlay();
    shell.setPhase("play");
    state.phase = "play";
    state.groesse = groesse;
    state.offen = [];
    state.gefunden = 0;
    state.locked = false;
    shell.setCount(0);

    const paare = waehleItems(groesse / 2);
    state.karten = shuffle([...paare, ...paare].map((item, index) => ({
      id: index, item, offen: false, paar: false, weg: false, node: null, bild: null,
    })));

    shell.clear();
    prompt = shell.el("p", "cm-prompt", "Finde die Paare.");
    shell.play.append(prompt);
    // Die Karten liegen auf einer weissen Tafel, wie die Rätsel: auf der
    // Landschaft mit ihren Bäumen wären zwanzig Karten nur noch Gewimmel.
    const tafel = shell.el("div", "me-tafel");
    feld = shell.el("div", "me-feld");
    feld.dataset.karten = String(groesse);
    tafel.append(feld);
    shell.play.append(tafel);
    baue();
  }

  // Einmal bauen, dann nur noch umdrehen.
  function baue() {
    feld.innerHTML = "";
    state.karten.forEach((karte) => {
      const button = shell.el("button", "me-karte");
      button.type = "button";
      const bild = shell.el("span", "me-karte-bild", "");
      button.append(bild);
      button.addEventListener("click", () => decke(karte));
      karte.node = button;
      karte.bild = bild;
      feld.append(button);
      zeichne(karte);
    });
  }

  // Bringt eine Karte auf den Stand, der in ihr steht. Klassen werden nur
  // geändert, wenn sie sich ändern – so spielt keine Animation zweimal.
  function zeichne(karte) {
    const { node, bild } = karte;
    if (!node) return;
    const sichtbar = karte.offen || karte.weg;
    node.classList.toggle("is-offen", karte.offen);
    if (karte.paar && !node.classList.contains("is-paar")) node.classList.add("is-paar");
    if (karte.weg && !node.classList.contains("is-weg")) node.classList.add("is-weg");
    node.disabled = sichtbar;
    node.setAttribute("aria-label", sichtbar ? karte.item.label : "Verdeckte Karte");
    bild.textContent = sichtbar ? karte.item.emoji : "";
  }

  function decke(karte) {
    if (state.phase !== "play" || state.locked || karte.offen || karte.weg) return;
    karte.offen = true;
    state.offen.push(karte);
    kids()?.playJingle?.("star");
    zeichne(karte);

    if (state.offen.length < 2) return;
    const [a, b] = state.offen;
    state.locked = true;

    if (a.item.label === b.item.label) {
      state.gefunden += 1;
      shell.setCount(state.gefunden);
      kids()?.playJingle?.("correct");
      kids()?.vibrate?.(14);
      // Das Zeichen für "gestimmt": beide Karten bekommen einen grünen Ring
      // und pulsieren einmal kurz, bevor sie verschwinden.
      a.paar = true;
      b.paar = true;
      zeichne(a);
      zeichne(b);
      stepTimer = window.setTimeout(() => {
        a.weg = true;
        b.weg = true;
        state.offen = [];
        state.locked = false;
        zeichne(a);
        zeichne(b);
        if (state.gefunden >= state.groesse / 2) finish();
      }, WEG_MS);
      return;
    }

    kids()?.playJingle?.("retry");
    stepTimer = window.setTimeout(() => {
      a.offen = false;
      b.offen = false;
      state.offen = [];
      state.locked = false;
      zeichne(a);
      zeichne(b);
    }, ZURUECK_MS);
  }

  // ---------------------------------------------------------------------------
  // Schluss
  // ---------------------------------------------------------------------------
  function resultSpeech(fertig) {
    return `Geschafft! Du hast alle ${state.groesse / 2} Paare gefunden. ${rundenText(fertig)}`;
  }

  function finish() {
    clearStep();
    state.phase = "over";
    merkeRunde(state.groesse);
    const fertig = fertigeZahl();
    shell.setCount(fertig);
    kids()?.playJingle?.("win");
    shell.showResult({
      label: `${state.groesse} Karten geschafft`,
      stars: 3,
      detail: `Alle ${state.groesse / 2} Paare gefunden.`,
      note: { text: rundenText(fertig), done: fertig >= RUNDEN_FUER_WAGEN },
      speech: resultSpeech(fertig),
      onBack: showMenu,
    });
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  shell = shellApi.mount({
    host,
    title: "Memory",
    area: "gedaechtnis",
    accent: "#7C5CE6",
    accentDark: "#5a41b8",
    help: HELP,
    clock: false,
    onRestart: () => (state.phase === "menu" ? showMenu() : startRunde(state.groesse)),
    onBack: () => {
      if (state.phase === "menu") return false;
      showMenu();
      return true;
    },
  });

  showMenu();

  window.LernappMemory = { GROESSEN, ITEMS, RUNDEN_FUER_WAGEN, waehleItems };

  window.addEventListener("pagehide", clearStep);
})();
