/*
 * lesen-inhalte.js – Was in der Leseecke gelesen und gehört wird.
 *
 * Laute, Wörter und die Bausteine der Sätze: alles an einem Ort, damit jedes
 * Spiel dieselben Wörter mit denselben Silben und Bildern kennt und das
 * Prüfskript (scripts/validate-lesen.mjs) sie an einer Stelle nachrechnen kann.
 * Die Bücher stehen in lesen-buecher.js – sie sind lang und werden nur dort
 * geladen, wo gelesen wird.
 *
 * Drei Regeln stecken in diesen Listen:
 *
 *   Laut statt Name   Ein Buchstabe heisst in der Leseecke nach seinem Laut:
 *                     M ist «mmm», nicht «Em». Was ein Laut ist, sagen die
 *                     Laut-Steine – Sch, Ei, Au und ihre Geschwister sind je
 *                     ein Stein, auch wenn sie zwei oder drei Buchstaben haben.
 *   Dauerlaute zuerst Die Reihenfolge der Laute beginnt mit denen, die man
 *                     dehnen kann (M, A, L, I, O, S …). Nur die lassen sich
 *                     hörbar ineinander schieben: «mmmaaa» wird «Ma».
 *   Bilder, die hier  Jedes Bild muss das Wort sagen, das ein Kind in der
 *   stimmen           Schweiz dazu sagt. Ein Keks heisst hier Guetzli, ein
 *                     Mofa Töffli – solche Bilder kommen nicht vor. Und
 *                     geschrieben wird ss, nie das scharfe S.
 */
(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Laut-Steine
  // ---------------------------------------------------------------------------
  // Dieselbe Regel wie in app.js (lautSteine): von links das längste Stück, das
  // als ein Laut gilt. Hier mit Gross und Klein, weil die Steine so angezeigt
  // werden, wie das Wort geschrieben ist. St und Sp gelten nur am Anfang einer
  // Silbe als ein Laut («scht», «schp») – in «Kiste» sind s und t zwei.
  const MEHRFACH = ["sch", "ch", "ck", "ei", "ai", "au", "äu", "eu", "ie", "pf", "qu", "ng"];
  const AM_ANFANG = ["st", "sp"];

  function steine(silbe) {
    const text = String(silbe || "");
    const klein = text.toLowerCase();
    const liste = [];
    for (let i = 0; i < text.length;) {
      const kandidaten = i === 0 ? [...MEHRFACH, ...AM_ANFANG] : MEHRFACH;
      const treffer = kandidaten
        .filter((stein) => klein.startsWith(stein, i))
        .sort((a, b) => b.length - a.length)[0];
      const laenge = treffer ? treffer.length : 1;
      liste.push(text.slice(i, i + laenge));
      i += laenge;
    }
    return liste;
  }

  // Die Steine eines ganzen Wortes, Silbe für Silbe: [["Ro"], ["se"]] →
  // [["R", "o"], ["s", "e"]].
  function steineDerSilben(silben) {
    return silben.map((silbe) => steine(silbe));
  }

  // Der Schlüssel eines Steins in LAUTE: klein geschrieben, Umlaute bleiben.
  function lautId(stein) {
    return String(stein || "").toLowerCase();
  }

  // ---------------------------------------------------------------------------
  // Die Laute
  // ---------------------------------------------------------------------------
  //   id      der Laut, klein geschrieben – zugleich der Name der Aufnahme
  //   gross   so steht er am Satzanfang; klein im Wort
  //   wort    das Anlautwort, wie es auf jeder Anlauttabelle steht
  //   bild    ein Bild dazu, das hier jedes Kind so nennt
  //   art     vokal (Selbstlaut), dauer (lässt sich dehnen), stopp (nicht),
  //           mehr (ein Laut aus mehreren Buchstaben)
  //   innen   der Laut steht nicht am Anfang des Wortes, sondern darin
  //           (Ch wie Buch, ie wie Biene) – ein Kind hört ihn dort
  //   stimme  was die Sprachausgabe sagen kann, solange keine Aufnahme da
  //           ist: Selbstlaute und Zwielaute gelingen ihr, ein einzelnes
  //           «mmm» nicht – sie sagte «Em». Dann bleibt der Laut stumm, und
  //           das Spiel zeigt ihn nur.
  //   gruppe  in welcher Reihe er eingeführt wird (1 = zuerst)
  const LAUTE = [
    { id: "m", gross: "M", klein: "m", wort: "Maus", bild: "🐭", art: "dauer", gruppe: 1 },
    { id: "a", gross: "A", klein: "a", wort: "Affe", bild: "🐒", art: "vokal", stimme: "a", gruppe: 1 },
    { id: "l", gross: "L", klein: "l", wort: "Löwe", bild: "🦁", art: "dauer", gruppe: 1 },
    { id: "i", gross: "I", klein: "i", wort: "Igel", bild: "🦔", art: "vokal", stimme: "i", gruppe: 1 },
    { id: "o", gross: "O", klein: "o", wort: "Ohr", bild: "👂", art: "vokal", stimme: "o", gruppe: 1 },
    { id: "s", gross: "S", klein: "s", wort: "Sonne", bild: "☀️", art: "dauer", gruppe: 1 },
    { id: "e", gross: "E", klein: "e", wort: "Ente", bild: "🦆", art: "vokal", stimme: "e", gruppe: 2 },
    { id: "r", gross: "R", klein: "r", wort: "Rose", bild: "🌹", art: "dauer", gruppe: 2 },
    { id: "n", gross: "N", klein: "n", wort: "Nase", bild: "👃", art: "dauer", gruppe: 2 },
    { id: "u", gross: "U", klein: "u", wort: "Uhr", bild: "⏰", art: "vokal", stimme: "u", gruppe: 2 },
    { id: "f", gross: "F", klein: "f", wort: "Fisch", bild: "🐟", art: "dauer", gruppe: 2 },
    { id: "w", gross: "W", klein: "w", wort: "Wal", bild: "🐳", art: "dauer", gruppe: 2 },
    { id: "h", gross: "H", klein: "h", wort: "Hase", bild: "🐰", art: "dauer", gruppe: 3 },
    { id: "d", gross: "D", klein: "d", wort: "Dino", bild: "🦕", art: "stopp", gruppe: 3 },
    { id: "t", gross: "T", klein: "t", wort: "Tomate", bild: "🍅", art: "stopp", gruppe: 3 },
    { id: "b", gross: "B", klein: "b", wort: "Ball", bild: "⚽", art: "stopp", gruppe: 3 },
    { id: "k", gross: "K", klein: "k", wort: "Katze", bild: "🐱", art: "stopp", gruppe: 3 },
    { id: "p", gross: "P", klein: "p", wort: "Pinguin", bild: "🐧", art: "stopp", gruppe: 3 },
    { id: "g", gross: "G", klein: "g", wort: "Giraffe", bild: "🦒", art: "stopp", gruppe: 3 },
    { id: "ei", gross: "Ei", klein: "ei", wort: "Eis", bild: "🍦", art: "mehr", stimme: "ei", gruppe: 4 },
    { id: "au", gross: "Au", klein: "au", wort: "Auto", bild: "🚗", art: "mehr", stimme: "au", gruppe: 4 },
    { id: "sch", gross: "Sch", klein: "sch", wort: "Schaf", bild: "🐑", art: "mehr", gruppe: 4 },
    { id: "eu", gross: "Eu", klein: "eu", wort: "Eule", bild: "🦉", art: "mehr", stimme: "eu", gruppe: 4 },
    { id: "ie", gross: "Ie", klein: "ie", wort: "Biene", bild: "🐝", art: "mehr", innen: true, stimme: "i", gruppe: 4 },
    { id: "ch", gross: "Ch", klein: "ch", wort: "Buch", bild: "📖", art: "mehr", innen: true, gruppe: 4 },
    { id: "z", gross: "Z", klein: "z", wort: "Zebra", bild: "🦓", art: "stopp", gruppe: 5 },
    { id: "j", gross: "J", klein: "j", wort: "Jacke", bild: "🧥", art: "dauer", gruppe: 5 },
    { id: "v", gross: "V", klein: "v", wort: "Vogel", bild: "🐦", art: "dauer", gruppe: 5 },
    { id: "st", gross: "St", klein: "st", wort: "Stern", bild: "⭐", art: "mehr", gruppe: 5 },
    { id: "sp", gross: "Sp", klein: "sp", wort: "Spinne", bild: "🕷️", art: "mehr", gruppe: 5 },
    { id: "pf", gross: "Pf", klein: "pf", wort: "Pferd", bild: "🐴", art: "mehr", gruppe: 5 },
    { id: "ä", gross: "Ä", klein: "ä", wort: "Käse", bild: "🧀", art: "vokal", innen: true, stimme: "ä", gruppe: 6 },
    { id: "ö", gross: "Ö", klein: "ö", wort: "Löffel", bild: "🥄", art: "vokal", innen: true, stimme: "ö", gruppe: 6 },
    { id: "ü", gross: "Ü", klein: "ü", wort: "Tür", bild: "🚪", art: "vokal", innen: true, stimme: "ü", gruppe: 6 },
    { id: "ck", gross: "Ck", klein: "ck", wort: "Socke", bild: "🧦", art: "mehr", innen: true, gruppe: 6 },
    { id: "ng", gross: "Ng", klein: "ng", wort: "Schlange", bild: "🐍", art: "mehr", innen: true, gruppe: 6 },
  ];
  const LAUT_BY_ID = Object.fromEntries(LAUTE.map((laut) => [laut.id, laut]));

  // Welche Laute auf welcher Stufe schon dran sind, wenn die Eltern nichts
  // anderes sagen: leicht kennt die ersten sechs, mittel die Dauerlaute und
  // die Selbstlaute, schwer alle.
  const LAUTE_JE_STUFE = { leicht: 1, mittel: 3, schwer: 6 };

  function lauteBisGruppe(gruppe) {
    return LAUTE.filter((laut) => laut.gruppe <= gruppe);
  }

  // ---------------------------------------------------------------------------
  // Wörter zum Silbenklatschen (Silbenzug)
  // ---------------------------------------------------------------------------
  // Gesprochene Silben, so wie Kinder sie im Kindergarten schwingen: Kat-ze,
  // nicht Katz-e. Das Wort wird vorgelesen – lesen muss hier niemand.
  const SILBEN_WOERTER = [
    { wort: "Ball", silben: ["Ball"], bild: "⚽" },
    { wort: "Hund", silben: ["Hund"], bild: "🐶" },
    { wort: "Maus", silben: ["Maus"], bild: "🐭" },
    { wort: "Baum", silben: ["Baum"], bild: "🌳" },
    { wort: "Fisch", silben: ["Fisch"], bild: "🐟" },
    { wort: "Schaf", silben: ["Schaf"], bild: "🐑" },
    { wort: "Stern", silben: ["Stern"], bild: "⭐" },
    { wort: "Mond", silben: ["Mond"], bild: "🌙" },
    { wort: "Kuh", silben: ["Kuh"], bild: "🐄" },
    { wort: "Eis", silben: ["Eis"], bild: "🍦" },
    { wort: "Buch", silben: ["Buch"], bild: "📖" },
    { wort: "Haus", silben: ["Haus"], bild: "🏠" },
    { wort: "Apfel", silben: ["Ap", "fel"], bild: "🍎" },
    { wort: "Sonne", silben: ["Son", "ne"], bild: "☀️" },
    { wort: "Hase", silben: ["Ha", "se"], bild: "🐰" },
    { wort: "Katze", silben: ["Kat", "ze"], bild: "🐱" },
    { wort: "Ente", silben: ["En", "te"], bild: "🦆" },
    { wort: "Biene", silben: ["Bie", "ne"], bild: "🐝" },
    { wort: "Blume", silben: ["Blu", "me"], bild: "🌼" },
    { wort: "Tasse", silben: ["Tas", "se"], bild: "☕" },
    { wort: "Panda", silben: ["Pan", "da"], bild: "🐼" },
    { wort: "Tiger", silben: ["Ti", "ger"], bild: "🐯" },
    { wort: "Löwe", silben: ["Lö", "we"], bild: "🦁" },
    { wort: "Eule", silben: ["Eu", "le"], bild: "🦉" },
    { wort: "Zebra", silben: ["Ze", "bra"], bild: "🦓" },
    { wort: "Einhorn", silben: ["Ein", "horn"], bild: "🦄" },
    { wort: "Krone", silben: ["Kro", "ne"], bild: "👑" },
    { wort: "Banane", silben: ["Ba", "na", "ne"], bild: "🍌" },
    { wort: "Tomate", silben: ["To", "ma", "te"], bild: "🍅" },
    { wort: "Rakete", silben: ["Ra", "ke", "te"], bild: "🚀" },
    { wort: "Melone", silben: ["Me", "lo", "ne"], bild: "🍈" },
    { wort: "Ananas", silben: ["A", "na", "nas"], bild: "🍍" },
    { wort: "Krokodil", silben: ["Kro", "ko", "dil"], bild: "🐊" },
    { wort: "Elefant", silben: ["E", "le", "fant"], bild: "🐘" },
    { wort: "Pinguin", silben: ["Pin", "gu", "in"], bild: "🐧" },
    { wort: "Papagei", silben: ["Pa", "pa", "gei"], bild: "🦜" },
    { wort: "Känguru", silben: ["Kän", "gu", "ru"], bild: "🦘" },
    { wort: "Schildkröte", silben: ["Schild", "krö", "te"], bild: "🐢" },
    { wort: "Giraffe", silben: ["Gi", "raf", "fe"], bild: "🦒" },
    { wort: "Kartoffel", silben: ["Kar", "tof", "fel"], bild: "🥔" },
    { wort: "Schmetterling", silben: ["Schmet", "ter", "ling"], bild: "🦋" },
    { wort: "Regenbogen", silben: ["Re", "gen", "bo", "gen"], bild: "🌈" },
    { wort: "Helikopter", silben: ["He", "li", "kop", "ter"], bild: "🚁" },
    { wort: "Schokolade", silben: ["Scho", "ko", "la", "de"], bild: "🍫" },
    { wort: "Badewanne", silben: ["Ba", "de", "wan", "ne"], bild: "🛁" },
    { wort: "Marienkäfer", silben: ["Ma", "ri", "en", "kä", "fer"], bild: "🐞" },
    { wort: "Wassermelone", silben: ["Was", "ser", "me", "lo", "ne"], bild: "🍉" },
    { wort: "Lokomotive", silben: ["Lo", "ko", "mo", "ti", "ve"], bild: "🚂" },
  ];

  // Wie viele Silben ein Wort auf welcher Stufe haben darf.
  const SILBEN_JE_STUFE = { leicht: [1, 3], mittel: [1, 4], schwer: [2, 5] };

  // ---------------------------------------------------------------------------
  // Wörter zum Kuppeln (Laute kuppeln)
  // ---------------------------------------------------------------------------
  // Hier liest das Kind selbst: Es schiebt die Laute zusammen und sucht danach
  // das Bild. Deshalb nur Wörter, die man Laut für Laut so liest, wie sie
  // geschrieben sind, und die nur Laute der eigenen Gruppe brauchen (gruppe:
  // der höchste Laut im Wort, nachgerechnet von validate-lesen).
  //   stufe 1  nur Dauerlaute und Selbstlaute, zwei offene Silben (Ro-se)
  //   stufe 2  dazu die Stopplaute (Del-fin, Ti-ger)
  //   stufe 3  dazu Ei, Au, Sch und Mitlaute nebeneinander (Krone, Fisch)
  const KUPPEL_WOERTER = [
    { wort: "Oma", silben: ["O", "ma"], bild: "👵", stufe: 1 },
    { wort: "Lama", silben: ["La", "ma"], bild: "🦙", stufe: 1 },
    { wort: "Sofa", silben: ["So", "fa"], bild: "🛋️", stufe: 1 },
    { wort: "Rose", silben: ["Ro", "se"], bild: "🌹", stufe: 1 },
    { wort: "Nase", silben: ["Na", "se"], bild: "👃", stufe: 1 },
    { wort: "Wal", silben: ["Wal"], bild: "🐳", stufe: 1 },
    { wort: "Wolf", silben: ["Wolf"], bild: "🐺", stufe: 1 },
    { wort: "Nuss", silben: ["Nuss"], bild: "🌰", stufe: 1 },
    { wort: "Sonne", silben: ["Son", "ne"], bild: "☀️", stufe: 1 },
    { wort: "Wolle", silben: ["Wol", "le"], bild: "🧶", stufe: 1 },
    { wort: "Insel", silben: ["In", "sel"], bild: "🏝️", stufe: 1 },
    { wort: "Melone", silben: ["Me", "lo", "ne"], bild: "🍈", stufe: 1 },
    { wort: "Ananas", silben: ["A", "na", "nas"], bild: "🍍", stufe: 1 },
    { wort: "Hose", silben: ["Ho", "se"], bild: "👖", stufe: 2 },
    { wort: "Hase", silben: ["Ha", "se"], bild: "🐰", stufe: 2 },
    { wort: "Delfin", silben: ["Del", "fin"], bild: "🐬", stufe: 2 },
    { wort: "Dino", silben: ["Di", "no"], bild: "🦕", stufe: 2 },
    { wort: "Kiwi", silben: ["Ki", "wi"], bild: "🥝", stufe: 2 },
    { wort: "Ufo", silben: ["U", "fo"], bild: "🛸", stufe: 2 },
    { wort: "Igel", silben: ["I", "gel"], bild: "🦔", stufe: 2 },
    { wort: "Panda", silben: ["Pan", "da"], bild: "🐼", stufe: 2 },
    { wort: "Tiger", silben: ["Ti", "ger"], bild: "🐯", stufe: 2 },
    { wort: "Tulpe", silben: ["Tul", "pe"], bild: "🌷", stufe: 2 },
    { wort: "Kamel", silben: ["Ka", "mel"], bild: "🐪", stufe: 2 },
    { wort: "Hut", silben: ["Hut"], bild: "👒", stufe: 2 },
    { wort: "Tasse", silben: ["Tas", "se"], bild: "☕", stufe: 2 },
    { wort: "Lupe", silben: ["Lu", "pe"], bild: "🔍", stufe: 2 },
    { wort: "Tomate", silben: ["To", "ma", "te"], bild: "🍅", stufe: 2 },
    { wort: "Banane", silben: ["Ba", "na", "ne"], bild: "🍌", stufe: 2 },
    { wort: "Rakete", silben: ["Ra", "ke", "te"], bild: "🚀", stufe: 2 },
    { wort: "Paket", silben: ["Pa", "ket"], bild: "📦", stufe: 2 },
    { wort: "Roboter", silben: ["Ro", "bo", "ter"], bild: "🤖", stufe: 2 },
    { wort: "Maus", silben: ["Maus"], bild: "🐭", stufe: 3 },
    { wort: "Haus", silben: ["Haus"], bild: "🏠", stufe: 3 },
    { wort: "Baum", silben: ["Baum"], bild: "🌳", stufe: 3 },
    { wort: "Eis", silben: ["Eis"], bild: "🍦", stufe: 3 },
    { wort: "Seife", silben: ["Sei", "fe"], bild: "🧼", stufe: 3 },
    { wort: "Fisch", silben: ["Fisch"], bild: "🐟", stufe: 3 },
    { wort: "Schaf", silben: ["Schaf"], bild: "🐑", stufe: 3 },
    { wort: "Buch", silben: ["Buch"], bild: "📖", stufe: 3 },
    { wort: "Eule", silben: ["Eu", "le"], bild: "🦉", stufe: 3 },
    { wort: "Biene", silben: ["Bie", "ne"], bild: "🐝", stufe: 3 },
    { wort: "Stern", silben: ["Stern"], bild: "⭐", stufe: 3 },
    { wort: "Spinne", silben: ["Spin", "ne"], bild: "🕷️", stufe: 3 },
    { wort: "Pferd", silben: ["Pferd"], bild: "🐴", stufe: 3 },
    { wort: "Zebra", silben: ["Ze", "bra"], bild: "🦓", stufe: 3 },
    { wort: "Krone", silben: ["Kro", "ne"], bild: "👑", stufe: 3 },
    { wort: "Brot", silben: ["Brot"], bild: "🍞", stufe: 3 },
    { wort: "Pilz", silben: ["Pilz"], bild: "🍄", stufe: 3 },
    { wort: "Blume", silben: ["Blu", "me"], bild: "🌼", stufe: 3 },
    { wort: "Frosch", silben: ["Frosch"], bild: "🐸", stufe: 3 },
    { wort: "Schnecke", silben: ["Schne", "cke"], bild: "🐌", stufe: 3 },
    { wort: "Pinguin", silben: ["Pin", "gu", "in"], bild: "🐧", stufe: 3 },
  ];

  // Welche Kuppel-Wörter eine Stufe nimmt: leicht nur die erste Gruppe, mittel
  // die ersten beiden, schwer alle – aber dort zuerst die schweren.
  const KUPPELN_JE_STUFE = { leicht: [1], mittel: [1, 2], schwer: [2, 3] };

  // ---------------------------------------------------------------------------
  // Stimmt das? – Bausteine für Bild und Satz
  // ---------------------------------------------------------------------------
  // Die Tiere sind die Figuren der App (train-art.js, buildPassenger): dieselben,
  // die auf der Reise mitfahren. Sie stehen – deshalb heisst es «steht».
  //   der    der Satz mit bestimmtem Artikel, in der Einzahl
  //   viele  die Mehrzahl, ohne Artikel
  const TIERE = [
    { id: "fox", der: "Der Fuchs", viele: "Füchse" },
    { id: "bear", der: "Der Bär", viele: "Bären" },
    { id: "rabbit", der: "Der Hase", viele: "Hasen" },
    { id: "cat", der: "Die Katze", viele: "Katzen" },
    { id: "panda", der: "Der Panda", viele: "Pandas" },
    { id: "frog", der: "Der Frosch", viele: "Frösche" },
    { id: "owl", der: "Die Eule", viele: "Eulen" },
    { id: "penguin", der: "Der Pinguin", viele: "Pinguine" },
    { id: "lion", der: "Der Löwe", viele: "Löwen" },
    { id: "mouse", der: "Die Maus", viele: "Mäuse" },
  ];
  // Die Dinge zeichnet lesen-art.js. Nicht jedes Wort passt zu jedem Ding: Wer
  // unter dem Bett steht, ist nicht zu sehen.
  const DINGE = [
    { id: "tisch", dativ: "dem Tisch", wo: ["auf", "unter", "neben"] },
    { id: "stuhl", dativ: "dem Stuhl", wo: ["auf", "neben"] },
    { id: "bett", dativ: "dem Bett", wo: ["auf", "neben"] },
    { id: "kiste", dativ: "der Kiste", wo: ["auf", "neben"] },
    { id: "baum", dativ: "dem Baum", wo: ["auf", "unter", "neben"] },
    { id: "haus", dativ: "dem Haus", wo: ["auf", "neben"] },
  ];
  const ZAHLWOERTER = ["", "Ein", "Zwei", "Drei"];

  window.LernappLeseInhalte = {
    steine, steineDerSilben, lautId,
    LAUTE, LAUT_BY_ID, LAUTE_JE_STUFE, lauteBisGruppe,
    SILBEN_WOERTER, SILBEN_JE_STUFE,
    KUPPEL_WOERTER, KUPPELN_JE_STUFE,
    TIERE, DINGE, ZAHLWOERTER,
  };
})();
