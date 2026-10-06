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
    { id: "u", gross: "U", klein: "u", wort: "Uhr", bild: "🕐", art: "vokal", stimme: "u", gruppe: 2 },
    { id: "f", gross: "F", klein: "f", wort: "Fisch", bild: "🐟", art: "dauer", gruppe: 2 },
    { id: "w", gross: "W", klein: "w", wort: "Wal", bild: "🐳", art: "dauer", gruppe: 2 },
    { id: "h", gross: "H", klein: "h", wort: "Hase", bild: "🐰", art: "dauer", gruppe: 3 },
    { id: "d", gross: "D", klein: "d", wort: "Dino", bild: "🦕", art: "stopp", gruppe: 3 },
    { id: "t", gross: "T", klein: "t", wort: "Tomate", bild: "🍅", art: "stopp", gruppe: 3 },
    { id: "b", gross: "B", klein: "b", wort: "Ball", bild: "⚽", art: "stopp", gruppe: 3 },
    { id: "k", gross: "K", klein: "k", wort: "Katze", bild: "🐱", art: "stopp", gruppe: 3 },
    { id: "p", gross: "P", klein: "p", wort: "Pinguin", bild: "🐧", art: "stopp", gruppe: 3 },
    { id: "g", gross: "G", klein: "g", wort: "Giraffe", bild: "🦒", art: "stopp", gruppe: 3 },
    { id: "ei", gross: "Ei", klein: "ei", wort: "Eis", bild: "🧊", art: "mehr", stimme: "ei", gruppe: 4 },
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
  // Und je Lesestufe (lesen-stand.js): bis zu welcher Gruppe die Laute im
  // Buchstabenhaus wohnen.
  const GRUPPE_JE_LESESTUFE = { hoeren: 1, buchstaben: 3, woerter: 4, saetze: 6, geschichten: 6 };

  function lauteBisGruppe(gruppe) {
    return LAUTE.filter((laut) => laut.gruppe <= gruppe);
  }

  // ---------------------------------------------------------------------------
  // Was ein Kind schon lesen kann
  // ---------------------------------------------------------------------------
  // Haben die Eltern abgehakt, welche Laute die Schule eingeführt hat
  // (lesen-stand.js, bekannteLaute), wohnen im Buchstabenhaus genau diese,
  // und die Lesespiele nehmen Wörter, die sich mit ihnen lesen lassen. Ohne
  // Haken gilt die feste Reihenfolge nach der Stufe.
  //   bekannt  eine Menge von Laut-Kennungen (m, ei, sch) oder null

  // Die Laute eines Wortes, die das Kind noch nicht kennt – jeder einmal.
  function fehlendeLaute(silben, bekannt) {
    const laute = [...new Set(steineDerSilben(silben).flat().map(lautId))];
    return bekannt ? laute.filter((id) => !bekannt.has(id)) : [];
  }

  // Die Wörter einer Liste, die sich ganz mit bekannten Lauten lesen lassen.
  // Sind es zu wenige für eine Runde, kommen die dazu, denen am wenigsten
  // fehlt: Leer bleibt eine Runde nie.
  function lesbare(liste, bekannt, mindestens = 6) {
    if (!bekannt || !bekannt.size) return liste;
    const bewertet = liste.map((eintrag) => ({ eintrag, fehlt: fehlendeLaute(eintrag.silben, bekannt).length }));
    const ganz = bewertet.filter((x) => x.fehlt === 0).map((x) => x.eintrag);
    if (ganz.length >= mindestens) return ganz;
    const rest = bewertet.filter((x) => x.fehlt > 0).sort((a, b) => a.fehlt - b.fehlt).map((x) => x.eintrag);
    return [...ganz, ...rest.slice(0, mindestens - ganz.length)];
  }

  // Wer im Buchstabenhaus wohnt: die bekannten Laute in der festen
  // Reihenfolge, aber nie weniger als vier – sonst gäbe es nichts zu suchen.
  // Fehlen welche, ziehen die nächsten der Reihe ein.
  function hausLaute(bekannt, gruppe, mindestens = 4) {
    if (!bekannt || !bekannt.size) return lauteBisGruppe(gruppe);
    const drin = new Set(LAUTE.filter((laut) => bekannt.has(laut.id)).map((laut) => laut.id));
    for (const laut of LAUTE) {
      if (drin.size >= mindestens) break;
      drin.add(laut.id);
    }
    return LAUTE.filter((laut) => drin.has(laut.id));
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
    { wort: "Eis", silben: ["Eis"], bild: "🧊" },
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
    { wort: "Eis", silben: ["Eis"], bild: "🧊", stufe: 3 },
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
  //   wen    wen man irgendwohin setzt (Lies und tu!): der vierte Fall
  const TIERE = [
    { id: "fox", der: "Der Fuchs", viele: "Füchse", wen: "den Fuchs" },
    { id: "bear", der: "Der Bär", viele: "Bären", wen: "den Bären" },
    { id: "rabbit", der: "Der Hase", viele: "Hasen", wen: "den Hasen" },
    { id: "cat", der: "Die Katze", viele: "Katzen", wen: "die Katze" },
    { id: "panda", der: "Der Panda", viele: "Pandas", wen: "den Panda" },
    { id: "frog", der: "Der Frosch", viele: "Frösche", wen: "den Frosch" },
    { id: "owl", der: "Die Eule", viele: "Eulen", wen: "die Eule" },
    { id: "penguin", der: "Der Pinguin", viele: "Pinguine", wen: "den Pinguin" },
    { id: "lion", der: "Der Löwe", viele: "Löwen", wen: "den Löwen" },
    { id: "mouse", der: "Die Maus", viele: "Mäuse", wen: "die Maus" },
  ];
  // Die Dinge zeichnet lesen-art.js. Nicht jedes Wort passt zu jedem Ding: Wer
  // unter dem Bett steht, ist nicht zu sehen.
  //   wohin  wohin man etwas setzt (Lies und tu!): «auf den Tisch»
  const DINGE = [
    { id: "tisch", dativ: "dem Tisch", wohin: "den Tisch", wo: ["auf", "unter", "neben"] },
    { id: "stuhl", dativ: "dem Stuhl", wohin: "den Stuhl", wo: ["auf", "neben"] },
    { id: "bett", dativ: "dem Bett", wohin: "das Bett", wo: ["auf", "neben"] },
    { id: "kiste", dativ: "der Kiste", wohin: "die Kiste", wo: ["auf", "neben"] },
    { id: "baum", dativ: "dem Baum", wohin: "den Baum", wo: ["auf", "unter", "neben"] },
    { id: "haus", dativ: "dem Haus", wohin: "das Haus", wo: ["auf", "neben"] },
  ];
  const ZAHLWOERTER = ["", "Ein", "Zwei", "Drei", "Vier"];
  // Was die Tiere im Bild tun (Lückensätze), in Einzahl und Mehrzahl.
  // Jedes sieht man: wer schläft, liegt da, und über ihm steht «z z Z»; wer
  // liest, hält ein Buch; wer singt, hat Noten über dem Kopf; wer hüpft, ist
  // in der Luft (lesen-art.js, buildSzene). Winken fehlt mit Absicht: Die
  // Tiere der App heben schon im Stehen einen Arm.
  const TUN = [
    { id: "steht", einzahl: "steht", mehrzahl: "stehen" },
    { id: "schlaeft", einzahl: "schläft", mehrzahl: "schlafen" },
    { id: "liest", einzahl: "liest", mehrzahl: "lesen" },
    { id: "singt", einzahl: "singt", mehrzahl: "singen" },
    { id: "huepft", einzahl: "hüpft", mehrzahl: "hüpfen" },
  ];
  const TUN_BY_ID = Object.fromEntries(TUN.map((t) => [t.id, t]));

  // Der Satz zum Bild, in Teilen mit ihrer Rolle – so kann ein Spiel eine
  // Lücke an jede Stelle setzen (Lückensätze) oder den ganzen Satz zeigen
  // (Stimmt das?).
  //   lage  { tier, ding, wo, anzahl, tun }
  //   «Der Fuchs steht auf dem Tisch.»  artikel tier tun wo ding
  //   «Zwei Füchse stehen auf dem Tisch.»  anzahl tier tun wo ding
  function satzTeile(lage) {
    const tier = TIERE.find((t) => t.id === lage.tier) || TIERE[0];
    const ding = DINGE.find((d) => d.id === lage.ding) || DINGE[0];
    const tun = TUN_BY_ID[lage.tun] || TUN_BY_ID.steht;
    const anzahl = Number(lage.anzahl) || 1;
    const vorne = anzahl > 1
      ? [{ text: ZAHLWOERTER[anzahl], rolle: "anzahl" }, { text: tier.viele, rolle: "tier" }]
      : [{ text: tier.der.split(" ")[0], rolle: "artikel" }, { text: tier.der.split(" ").slice(1).join(" "), rolle: "tier" }];
    return [...vorne, { text: anzahl > 1 ? tun.mehrzahl : tun.einzahl, rolle: "tun" }, { text: lage.wo, rolle: "wo" }, { text: ding.dativ, rolle: "ding" }];
  }

  function satzZurLage(lage) {
    return `${satzTeile(lage).map((teil) => teil.text).join(" ")}.`;
  }

  // ---------------------------------------------------------------------------
  // Reime (Reimkupplung)
  // ---------------------------------------------------------------------------
  // Gruppen von Wörtern, die sich reimen. Gefragt wird innerhalb einer Gruppe,
  // die falschen Wagen kommen aus anderen Gruppen – so reimt sich nie zufällig
  // auch ein falscher. Nur Wörter mit einem Bild, das jedes Kind hier erkennt.
  const REIME = [
    { endung: "aus", woerter: [{ wort: "Maus", bild: "🐭" }, { wort: "Haus", bild: "🏠" }] },
    { endung: "ase", woerter: [{ wort: "Hase", bild: "🐰" }, { wort: "Nase", bild: "👃" }, { wort: "Vase", bild: "🏺" }] },
    { endung: "und", woerter: [{ wort: "Hund", bild: "🐶" }, { wort: "Mund", bild: "👄" }] },
    { endung: "uh", woerter: [{ wort: "Kuh", bild: "🐄" }, { wort: "Schuh", bild: "👟" }] },
    { endung: "ein", woerter: [{ wort: "Bein", bild: "🦵" }, { wort: "Schwein", bild: "🐷" }, { wort: "Stein", bild: "🪨" }] },
    { endung: "atze", woerter: [{ wort: "Katze", bild: "🐱" }, { wort: "Tatze", bild: "🐾" }] },
    { endung: "ose", woerter: [{ wort: "Rose", bild: "🌹" }, { wort: "Hose", bild: "👖" }, { wort: "Dose", bild: "🥫" }] },
    { endung: "ocke", woerter: [{ wort: "Glocke", bild: "🔔" }, { wort: "Socke", bild: "🧦" }] },
    { endung: "ille", woerter: [{ wort: "Brille", bild: "👓" }, { wort: "Grille", bild: "🦗" }] },
    { endung: "ahn", woerter: [{ wort: "Zahn", bild: "🦷" }, { wort: "Hahn", bild: "🐓" }, { wort: "Kran", bild: "🏗️" }] },
    { endung: "ei", woerter: [{ wort: "Ei", bild: "🥚" }, { wort: "Brei", bild: "🥣" }] },
    { endung: "iene", woerter: [{ wort: "Biene", bild: "🐝" }, { wort: "Schiene", bild: "🛤️" }] },
    { endung: "uss", woerter: [{ wort: "Nuss", bild: "🌰" }, { wort: "Bus", bild: "🚌" }] },
    { endung: "al", woerter: [{ wort: "Wal", bild: "🐳" }, { wort: "Schal", bild: "🧣" }] },
    { endung: "and", woerter: [{ wort: "Hand", bild: "✋" }, { wort: "Sand", bild: "🏖️" }] },
    { endung: "or", woerter: [{ wort: "Ohr", bild: "👂" }, { wort: "Tor", bild: "🥅" }] },
    { endung: "ot", woerter: [{ wort: "Boot", bild: "🚤" }, { wort: "Brot", bild: "🍞" }] },
    { endung: "affe", woerter: [{ wort: "Affe", bild: "🐒" }, { wort: "Giraffe", bild: "🦒" }] },
  ];

  // ---------------------------------------------------------------------------
  // Der erste Laut, wie man ihn hört (Anlaut-Lauscher)
  // ---------------------------------------------------------------------------
  // Hören ist nicht Schreiben: Stern, Spinne und Schaf fangen alle mit «sch»
  // an, Vogel und Fisch mit «f». Für das Ohr zählt der Laut.
  const HOER_ANLAUT = { st: "sch", sp: "sch", v: "f", ie: "i" };
  // Wörter aus anderen Sprachen halten sich nicht an die Regel: Die Vase
  // fängt mit «w» an, nicht mit «f».
  const HOER_ANLAUT_WORT = { Vase: "w" };
  function anlautVon(wort) {
    if (HOER_ANLAUT_WORT[wort]) return HOER_ANLAUT_WORT[wort];
    const erster = lautId(steine(wort)[0]);
    return HOER_ANLAUT[erster] || erster;
  }
  // Paare, die junge Ohren leicht verwechseln: Auf «leicht» stehen sie nie
  // zusammen zur Wahl.
  const AEHNLICHE_ANLAUTE = [["m", "n"], ["b", "p"], ["d", "t"], ["g", "k"], ["f", "w"], ["e", "ä"], ["i", "ie"], ["ei", "ai"], ["eu", "äu"]];

  // Bilder, die ein Kind hier gern anders nennt – mit einem anderen ersten
  // Laut: ⚽ ist oft der «Fussball», 🐴 das «Ross», 🐓 der «Güggel», 🥣 das
  // «Müesli». Wo das Wort dabeisteht oder gesagt wird, stören sie nicht; wo
  // nur das Bild zählt (Anlaut-Lauscher), bleiben sie weg.
  const MEHRDEUTIG = new Set(["Ball", "Pferd", "Hahn", "Jacke", "Brei", "Dose", "Schiene", "Grille", "Sand", "Tatze", "Vase", "Nuss", "Paket"]);

  // Alle Wörter mit Bild, die in der Leseecke vorkommen – einmal je Wort.
  //   eindeutig  ohne die Bilder aus MEHRDEUTIG
  function bildWoerter({ eindeutig = false } = {}) {
    const alle = [
      ...LAUTE.filter((laut) => !laut.innen).map((laut) => ({ wort: laut.wort, bild: laut.bild })),
      ...SILBEN_WOERTER, ...KUPPEL_WOERTER,
      ...REIME.flatMap((gruppe) => gruppe.woerter),
    ];
    const gesehen = new Set();
    return alle.filter((eintrag) => {
      if (gesehen.has(eintrag.wort)) return false;
      gesehen.add(eintrag.wort);
      return !(eindeutig && MEHRDEUTIG.has(eintrag.wort));
    }).map(({ wort, bild }) => ({ wort, bild }));
  }

  // ---------------------------------------------------------------------------
  // Blitzwörter
  // ---------------------------------------------------------------------------
  // Die kleinen Wörter, die in jedem Satz stehen. Lautieren lohnt sich bei
  // ihnen nicht – sie sollen auf einen Blick sitzen. Zu jedem drei, die ihm
  // ähnlich sehen; so zählt genaues Hinsehen, nicht Raten.
  //   stufe 1  die häufigsten (mittel)
  //   stufe 2  dazu die übrigen (schwer)
  const BLITZWOERTER = [
    { wort: "und", aehnlich: ["um", "uns", "rund"], stufe: 1 },
    { wort: "ist", aehnlich: ["isst", "im", "ich"], stufe: 1 },
    { wort: "die", aehnlich: ["der", "das", "dir"], stufe: 1 },
    { wort: "der", aehnlich: ["die", "dem", "den"], stufe: 1 },
    { wort: "das", aehnlich: ["was", "die", "dass"], stufe: 1 },
    { wort: "ein", aehnlich: ["eine", "nein", "dein"], stufe: 1 },
    { wort: "im", aehnlich: ["in", "mit", "ihm"], stufe: 1 },
    { wort: "mit", aehnlich: ["mir", "mich", "im"], stufe: 1 },
    { wort: "auf", aehnlich: ["aus", "lauf", "kauf"], stufe: 1 },
    { wort: "ich", aehnlich: ["ist", "dich", "mich"], stufe: 1 },
    { wort: "du", aehnlich: ["zu", "da", "die"], stufe: 1 },
    { wort: "ja", aehnlich: ["da", "je", "an"], stufe: 1 },
    { wort: "Mama", aehnlich: ["Papa", "Oma", "Lama"], stufe: 1 },
    { wort: "Papa", aehnlich: ["Mama", "Opa", "Panda"], stufe: 1 },
    { wort: "Oma", aehnlich: ["Opa", "Mama", "Ofen"], stufe: 1 },
    { wort: "Opa", aehnlich: ["Oma", "Papa", "Ufo"], stufe: 1 },
    { wort: "eine", aehnlich: ["ein", "einen", "keine"], stufe: 2 },
    { wort: "er", aehnlich: ["es", "der", "ihr"], stufe: 2 },
    { wort: "sie", aehnlich: ["die", "wie", "sind"], stufe: 2 },
    { wort: "es", aehnlich: ["er", "das", "ist"], stufe: 2 },
    { wort: "wir", aehnlich: ["wie", "mir", "ihr"], stufe: 2 },
    { wort: "nicht", aehnlich: ["nichts", "ich", "Licht"], stufe: 2 },
    { wort: "nein", aehnlich: ["ein", "neun", "mein"], stufe: 2 },
    { wort: "hat", aehnlich: ["hast", "Hut", "tat"], stufe: 2 },
    { wort: "sind", aehnlich: ["sie", "Kind", "Wind"], stufe: 2 },
    { wort: "wo", aehnlich: ["wie", "so", "was"], stufe: 2 },
    { wort: "was", aehnlich: ["das", "wo", "war"], stufe: 2 },
    { wort: "wer", aehnlich: ["der", "was", "wir"], stufe: 2 },
    { wort: "wie", aehnlich: ["die", "wir", "sie"], stufe: 2 },
    { wort: "da", aehnlich: ["du", "ja", "das"], stufe: 2 },
    { wort: "zu", aehnlich: ["du", "zum", "zur"], stufe: 2 },
    { wort: "von", aehnlich: ["vor", "vom", "an"], stufe: 2 },
    { wort: "aus", aehnlich: ["auf", "Haus", "Maus"], stufe: 2 },
  ];
  const BLITZ_JE_STUFE = { leicht: [1], mittel: [1], schwer: [1, 2] };

  // ---------------------------------------------------------------------------
  // Sätze mit und ohne Sinn (Quatschsätze, Stolperwörter)
  // ---------------------------------------------------------------------------
  // Was ein Kind aus dem Alltag kennt – und Quatsch, der so klar Quatsch ist,
  // dass niemand darüber streiten muss. Der Sinn hängt am Wissen, nicht an
  // einem Bild: Wer liest, merkt, dass Fische nicht klettern.
  const SINN_SAETZE = [
    { satz: "Der Fisch schwimmt im Wasser.", sinn: true },
    { satz: "Die Katze trinkt Milch.", sinn: true },
    { satz: "Der Vogel sitzt im Nest.", sinn: true },
    { satz: "Die Kuh frisst Gras.", sinn: true },
    { satz: "Der Hund bellt laut.", sinn: true },
    { satz: "Die Biene fliegt zur Blume.", sinn: true },
    { satz: "Das Baby schläft im Bett.", sinn: true },
    { satz: "Der Bäcker backt Brot.", sinn: true },
    { satz: "Die Sonne scheint am Himmel.", sinn: true },
    { satz: "Der Frosch springt in den Teich.", sinn: true },
    { satz: "Die Maus frisst Käse.", sinn: true },
    { satz: "Ich putze mir die Zähne.", sinn: true },
    { satz: "Der Zug fährt über die Brücke.", sinn: true },
    { satz: "Die Eule ist in der Nacht wach.", sinn: true },
    { satz: "Das Eis schmilzt in der Sonne.", sinn: true },
    { satz: "Der Elefant hat einen langen Rüssel.", sinn: true },
    { satz: "Wir essen die Suppe mit dem Löffel.", sinn: true },
    { satz: "Im Herbst fallen die Blätter von den Bäumen.", sinn: true },
    { satz: "Mit dem Velo fahre ich zur Schule.", sinn: true },
    { satz: "Im Winter liegt oft Schnee.", sinn: true },
    { satz: "Der Hase frisst ein Rüebli.", sinn: true },
    { satz: "Am Morgen kräht der Hahn.", sinn: true },
    { satz: "Die Schnecke kriecht ganz langsam.", sinn: true },
    { satz: "Der Pinguin schwimmt im kalten Meer.", sinn: true },
    { satz: "Papa giesst die Blumen.", sinn: true },
    { satz: "Der Igel rollt sich zusammen.", sinn: true },
    { satz: "Im Sommer baden wir im See.", sinn: true },
    { satz: "Der Löwe brüllt laut.", sinn: true },
    { satz: "Weil es regnet, ziehe ich Stiefel an.", sinn: true },
    { satz: "Das Flugzeug fliegt über die Wolken.", sinn: true },
    { satz: "Oma liest ein Buch.", sinn: true },
    { satz: "Der Bauer fährt mit dem Traktor.", sinn: true },
    { satz: "Der Fisch klettert auf den Baum.", sinn: false },
    { satz: "Die Katze bellt den Briefträger an.", sinn: false },
    { satz: "Der Hund legt ein Ei.", sinn: false },
    { satz: "Die Kuh fliegt über das Haus.", sinn: false },
    { satz: "Das Baby fährt den Bus.", sinn: false },
    { satz: "Der Bäcker backt Steine.", sinn: false },
    { satz: "Die Sonne scheint mitten in der Nacht.", sinn: false },
    { satz: "Die Maus frisst einen Elefanten.", sinn: false },
    { satz: "Ich putze mir die Zähne mit Senf.", sinn: false },
    { satz: "Der Zug schwimmt über den See.", sinn: false },
    { satz: "Der Schneemann sonnt sich am heissen Strand.", sinn: false },
    { satz: "Das Eis wird in der Sonne hart.", sinn: false },
    { satz: "Der Elefant passt in eine Tasse.", sinn: false },
    { satz: "Der Tisch isst eine Banane.", sinn: false },
    { satz: "Das Velo schläft im Bett.", sinn: false },
    { satz: "Der Mond backt einen Kuchen.", sinn: false },
    { satz: "Die Blume singt ein Lied.", sinn: false },
    { satz: "Der Fisch fährt Velo.", sinn: false },
    { satz: "Die Schnecke rennt schneller als ein Auto.", sinn: false },
    { satz: "Der Löwe strickt eine Mütze.", sinn: false },
    { satz: "Im Sommer fahren wir im Garten Ski.", sinn: false },
    { satz: "Am Abend kräht der Mond.", sinn: false },
    { satz: "Die Giraffe wohnt in einem Schneckenhaus.", sinn: false },
    { satz: "Der Pinguin wohnt in der heissen Wüste.", sinn: false },
    { satz: "Papa giesst die Blumen mit Milch.", sinn: false },
    { satz: "Der Igel ist weich wie ein Kissen.", sinn: false },
    { satz: "Ich ziehe die Stiefel über die Ohren.", sinn: false },
    { satz: "Das Flugzeug fährt in den Keller.", sinn: false },
    { satz: "Oma liest einen Apfel.", sinn: false },
    { satz: "Der Traktor fliegt zum Mond.", sinn: false },
    { satz: "Der Stuhl rennt in den Wald.", sinn: false },
    { satz: "Die Ente bellt laut.", sinn: false },
  ];

  // Wörter, die in keinen dieser Sätze gehören: die Stolpersteine.
  const STOLPERSTEINE = ["Tasse", "Schuh", "Banane", "Löffel", "Kamm", "Gabel", "Lampe", "Socke", "Pfanne", "Teller", "Schere", "Kissen", "Gurke", "Zahnbürste", "Regenschirm", "Pinsel"];

  // ---------------------------------------------------------------------------
  // Wie ein Buchstabe geschrieben wird (Buchstabengleis)
  // ---------------------------------------------------------------------------
  // Jeder Strich ein Weg in Schreibrichtung, in der Reihenfolge, wie er in der
  // Schule gezogen wird: senkrecht von oben nach unten, waagrecht von links
  // nach rechts, Bögen wie bei einer Uhr rückwärts. Ein Strich, der kürzer ist
  // als ein paar Einheiten, ist ein Punkt (i, j, ä): Er wird angetippt.
  //
  // Koordinaten: Grossbuchstaben von y = 10 bis zur Grundlinie y = 110; die
  // kleinen haben die Mittellänge ab y = 50, Ober- und Unterlänge reichen bis
  // 10 und 142. Die Breite ist frei, das Spiel zentriert. Nur M, L, C und Q
  // (absolut) – so lässt sich jeder Weg nachrechnen (validate-lesen.mjs).
  const GLEISE = {
    A: ["M50 10 L12 110", "M50 10 L88 110", "M26 74 L74 74"],
    B: ["M22 10 L22 110", "M22 10 L54 10 Q84 10 84 34 Q84 58 54 58 L22 58", "M22 58 L58 58 Q90 58 90 84 Q90 110 58 110 L22 110"],
    D: ["M22 10 L22 110", "M22 10 L44 10 Q90 10 90 60 Q90 110 44 110 L22 110"],
    E: ["M24 10 L24 110", "M24 10 L80 10", "M24 60 L70 60", "M24 110 L80 110"],
    F: ["M24 10 L24 110", "M24 10 L80 10", "M24 60 L70 60"],
    G: ["M86 28 C78 15 66 10 52 10 C28 10 14 32 14 60 C14 88 28 110 52 110 C72 110 86 98 86 78 L86 64 L58 64"],
    H: ["M20 10 L20 110", "M80 10 L80 110", "M20 60 L80 60"],
    I: ["M50 10 L50 110"],
    J: ["M70 10 L70 84 C70 100 60 110 46 110 C32 110 22 102 20 90"],
    K: ["M22 10 L22 110", "M80 10 L24 64 L82 110"],
    L: ["M26 10 L26 110 L80 110"],
    M: ["M14 110 L14 10 L50 72 L86 10 L86 110"],
    N: ["M20 110 L20 10 L80 110 L80 10"],
    O: ["M50 10 C24 10 12 34 12 60 C12 86 24 110 50 110 C76 110 88 86 88 60 C88 34 76 10 50 10"],
    P: ["M22 10 L22 110", "M22 10 L54 10 Q86 10 86 36 Q86 62 54 62 L22 62"],
    R: ["M22 10 L22 110", "M22 10 L54 10 Q86 10 86 36 Q86 62 54 62 L22 62", "M48 62 L84 110"],
    S: ["M82 24 C74 13 62 10 50 10 C30 10 18 20 18 34 C18 50 34 56 50 60 C68 64 84 70 84 86 C84 102 70 110 50 110 C34 110 22 104 16 94"],
    T: ["M50 10 L50 110", "M14 10 L86 10"],
    U: ["M18 10 L18 74 C18 98 32 110 50 110 C68 110 82 98 82 74 L82 10"],
    V: ["M12 10 L50 110 L88 10"],
    W: ["M6 10 L27 110 L50 32 L73 110 L94 10"],
    Z: ["M16 10 L84 10 L16 110 L84 110"],
    Ä: ["M50 10 L12 110", "M50 10 L88 110", "M26 74 L74 74", "M36 -8 L36 -6", "M64 -8 L64 -6"],
    Ö: ["M50 10 C24 10 12 34 12 60 C12 86 24 110 50 110 C76 110 88 86 88 60 C88 34 76 10 50 10", "M36 -8 L36 -6", "M64 -8 L64 -6"],
    Ü: ["M18 10 L18 74 C18 98 32 110 50 110 C68 110 82 98 82 74 L82 10", "M34 -8 L34 -6", "M66 -8 L66 -6"],
    a: ["M80 66 C76 56 64 50 50 50 C30 50 18 64 18 80 C18 96 30 110 50 110 C66 110 78 100 80 86", "M80 50 L80 110"],
    b: ["M22 10 L22 110", "M22 80 C22 62 36 50 52 50 C70 50 82 64 82 80 C82 96 70 110 52 110 C36 110 22 98 22 80"],
    d: ["M78 64 C72 54 62 50 50 50 C30 50 18 64 18 80 C18 96 30 110 50 110 C64 110 74 102 78 92", "M78 10 L78 110"],
    e: ["M20 80 L80 80 C80 62 68 50 50 50 C30 50 18 64 18 80 C18 98 32 110 52 110 C64 110 74 105 80 98"],
    f: ["M70 18 C64 12 58 10 52 10 C40 10 34 18 34 30 L34 110", "M18 52 L62 52"],
    g: ["M78 64 C72 54 62 50 50 50 C30 50 18 64 18 80 C18 96 30 110 50 110 C64 110 74 102 78 92", "M78 50 L78 120 C78 136 66 142 50 142 C38 142 28 138 22 130"],
    h: ["M22 10 L22 110", "M22 74 C26 58 38 50 52 50 C70 50 80 60 80 76 L80 110"],
    i: ["M50 50 L50 110", "M50 28 L50 30"],
    j: ["M60 50 L60 122 C60 136 52 142 42 142 C34 142 28 138 24 132", "M60 28 L60 30"],
    k: ["M24 10 L24 110", "M74 50 L26 84 L76 110"],
    l: ["M50 10 L50 110"],
    m: ["M14 50 L14 110", "M14 70 C16 58 24 50 34 50 C44 50 50 58 50 70 L50 110", "M50 70 C52 58 60 50 70 50 C80 50 86 58 86 70 L86 110"],
    n: ["M20 50 L20 110", "M20 74 C24 58 36 50 50 50 C68 50 80 60 80 76 L80 110"],
    o: ["M50 50 C30 50 18 64 18 80 C18 96 30 110 50 110 C70 110 82 96 82 80 C82 64 70 50 50 50"],
    p: ["M22 50 L22 142", "M22 80 C22 62 36 50 52 50 C70 50 82 64 82 80 C82 96 70 110 52 110 C36 110 22 98 22 80"],
    r: ["M26 50 L26 110", "M26 78 C30 60 42 50 56 50 C64 50 70 52 74 56"],
    s: ["M76 58 C70 52 62 50 50 50 C34 50 24 56 24 66 C24 76 34 79 50 81 C66 83 78 87 78 97 C78 106 66 110 50 110 C38 110 28 107 22 101"],
    t: ["M42 22 L42 98 C42 106 48 110 56 110 L66 110", "M22 50 L66 50"],
    u: ["M20 50 L20 86 C20 102 32 110 48 110 C64 110 78 100 80 84", "M80 50 L80 110"],
    v: ["M16 50 L50 110 L84 50"],
    w: ["M8 50 L28 110 L50 64 L72 110 L92 50"],
    z: ["M20 50 L80 50 L20 110 L80 110"],
    ä: ["M80 66 C76 56 64 50 50 50 C30 50 18 64 18 80 C18 96 30 110 50 110 C66 110 78 100 80 86", "M80 50 L80 110", "M38 30 L38 32", "M62 30 L62 32"],
    ö: ["M50 50 C30 50 18 64 18 80 C18 96 30 110 50 110 C70 110 82 96 82 80 C82 64 70 50 50 50", "M38 30 L38 32", "M62 30 L62 32"],
    ü: ["M20 50 L20 86 C20 102 32 110 48 110 C64 110 78 100 80 84", "M80 50 L80 110", "M36 30 L36 32", "M64 30 L64 32"],
  };

  // ---------------------------------------------------------------------------
  // Wer bin ich? (Etappe 4)
  // ---------------------------------------------------------------------------
  // Ein Rätsel in Häppchen: Die Hinweise gehen vom Allgemeinen zum Genauen,
  // und die drei anderen Bilder passen zu den ersten Hinweisen auch – wer zu
  // früh rät, liegt leicht daneben. Jeder Hinweis ist ein kurzer Satz mit
  // «Ich …»; erst der letzte macht die Antwort eindeutig.
  //   wer       so stellt sich das Rätsel am Schluss vor: «Ich bin der Elefant.»
  //   andere    drei Bilder, die zu den ersten Hinweisen auch passen
  const RAETSEL = [
    { id: "elefant", bild: "🐘", wer: "der Elefant", andere: ["🐭", "🦏", "🦛"],
      hinweise: ["Ich bin ein Tier.", "Ich bin grau.", "Ich bin sehr gross und schwer.", "Ich habe grosse Ohren.", "Ich habe einen langen Rüssel."] },
    { id: "giraffe", bild: "🦒", wer: "die Giraffe", andere: ["🐆", "🐄", "🐞"],
      hinweise: ["Ich bin ein Tier.", "Ich habe Flecken.", "Ich fresse Blätter von hohen Bäumen.", "Ich habe einen sehr langen Hals."] },
    { id: "pinguin", bild: "🐧", wer: "der Pinguin", andere: ["🦉", "🦢", "🦆"],
      hinweise: ["Ich bin ein Vogel.", "Ich bin schwarz und weiss.", "Ich kann nicht fliegen.", "Ich schwimme im kalten Meer.", "Ich watschle über das Eis."] },
    { id: "igel", bild: "🦔", wer: "der Igel", andere: ["🐿️", "🐭", "🐸"],
      hinweise: ["Ich bin ein kleines Tier.", "Ich wohne im Garten und im Wald.", "Ich fresse gern Schnecken und Käfer.", "Im Winter schlafe ich.", "Ich habe viele Stacheln."] },
    { id: "schnecke", bild: "🐌", wer: "die Schnecke", andere: ["🐢", "🐛", "🐞"],
      hinweise: ["Ich bin ein kleines Tier.", "Ich bin sehr langsam.", "Ich mag Salat.", "Ich trage mein Haus auf dem Rücken.", "Auf meinen Fühlern sitzen meine Augen."] },
    { id: "eule", bild: "🦉", wer: "die Eule", andere: ["🦇", "🐦", "🦅"],
      hinweise: ["Ich bin ein Vogel.", "Ich schlafe am Tag.", "In der Nacht gehe ich auf die Jagd.", "Ich habe grosse, runde Augen.", "Ich rufe: Hu-hu!"] },
    { id: "biene", bild: "🐝", wer: "die Biene", andere: ["🦋", "🐞", "🐦"],
      hinweise: ["Ich bin ein kleines Tier.", "Ich kann fliegen.", "Ich habe gelbe und schwarze Streifen.", "Ich fliege von Blume zu Blume.", "Ich mache Honig."] },
    { id: "frosch", bild: "🐸", wer: "der Frosch", andere: ["🐢", "🐊", "🦎"],
      hinweise: ["Ich bin ein Tier.", "Ich bin grün.", "Ich wohne am Teich.", "Ich kann weit springen.", "Ich quake laut."] },
    { id: "kuh", bild: "🐄", wer: "die Kuh", andere: ["🐑", "🐐", "🐖"],
      hinweise: ["Ich bin ein grosses Tier.", "Ich wohne auf dem Bauernhof.", "Ich fresse Gras.", "Ich gebe Milch.", "Ich mache Muh."] },
    { id: "hund", bild: "🐶", wer: "der Hund", andere: ["🐱", "🐰", "🐹"],
      hinweise: ["Ich bin ein Tier.", "Ich wohne oft bei Menschen.", "Ich gehe gern spazieren.", "Ich wedle mit dem Schwanz.", "Ich belle: Wau, wau!"] },
    { id: "katze", bild: "🐱", wer: "die Katze", andere: ["🐶", "🦉", "🦊"],
      hinweise: ["Ich bin ein Tier.", "Ich wohne oft bei Menschen.", "Ich fange gern Mäuse.", "Ich schnurre, wenn ich zufrieden bin.", "Ich sage: Miau!"] },
    { id: "hase", bild: "🐰", wer: "der Hase", andere: ["🐭", "🐿️", "🐑"],
      hinweise: ["Ich bin ein Tier.", "Ich habe ein weiches Fell.", "Ich habe lange Ohren.", "Ich hoppele über die Wiese.", "Ich mag Rüebli."] },
    { id: "fisch", bild: "🐟", wer: "der Fisch", andere: ["🐸", "🦆", "🐍"],
      hinweise: ["Ich bin ein Tier.", "Ich wohne im Wasser.", "Ich habe keine Beine.", "Ich atme mit Kiemen.", "Ich habe Schuppen und Flossen."] },
    { id: "schmetterling", bild: "🦋", wer: "der Schmetterling", andere: ["🐝", "🐞", "🐦"],
      hinweise: ["Ich bin ein kleines Tier.", "Ich kann fliegen.", "Ich habe bunte Flügel.", "Früher war ich eine Raupe."] },
    { id: "loewe", bild: "🦁", wer: "der Löwe", andere: ["🐘", "🦒", "🐯"],
      hinweise: ["Ich bin ein grosses Tier.", "Ich wohne in Afrika.", "Ich jage andere Tiere.", "Ich habe eine grosse Mähne.", "Ich brülle laut."] },
    { id: "sonne", bild: "☀️", wer: "die Sonne", andere: ["🌙", "⭐", "☁️"],
      hinweise: ["Ich bin am Himmel.", "Ich bin rund.", "Ich bin heiss und hell.", "Am Abend gehe ich unter."] },
    { id: "mond", bild: "🌙", wer: "der Mond", andere: ["⭐", "☀️", "☁️"],
      hinweise: ["Ich bin am Himmel.", "Man sieht mich vor allem in der Nacht.", "Manchmal bin ich rund, manchmal schmal.", "Ich leuchte, aber ich bin nicht heiss."] },
    { id: "stern", bild: "⭐", wer: "der Stern", andere: ["🌙", "☁️", "☀️"],
      hinweise: ["Ich bin am Himmel.", "Man sieht mich in der Nacht.", "Ich funkle.", "Wenn man mich malt, habe ich fünf Zacken."] },
    { id: "schneemann", bild: "⛄", wer: "der Schneemann", andere: ["🎄", "🛷", "🌲"],
      hinweise: ["Man findet mich im Winter.", "Ich stehe draussen und bewege mich nicht.", "Ich bin weiss und kalt.", "Meine Nase ist ein Rüebli."] },
    { id: "regenschirm", bild: "☂️", wer: "der Regenschirm", andere: ["🎒", "🧢", "👢"],
      hinweise: ["Ich bin ein Ding.", "Man braucht mich draussen.", "Man kann mich auf- und zumachen.", "Unter mir bleibst du trocken."] },
    { id: "apfel", bild: "🍎", wer: "der Apfel", andere: ["🍐", "🍊", "🍒"],
      hinweise: ["Man kann mich essen.", "Ich wachse an einem Baum.", "Ich bin rund.", "Ich bin rot, gelb oder grün und knackig."] },
    { id: "banane", bild: "🍌", wer: "die Banane", andere: ["🥕", "🍋", "🥒"],
      hinweise: ["Man kann mich essen.", "Ich bin eine Frucht.", "Ich bin lang und krumm.", "Meine Schale ist gelb."] },
    { id: "velo", bild: "🚲", wer: "das Velo", andere: ["🛴", "🚗", "🛹"],
      hinweise: ["Ich bin kein Tier.", "Mit mir kommst du schnell vorwärts.", "Ich habe zwei Räder.", "Du trittst in die Pedale."] },
    { id: "lok", bild: "🚂", wer: "die Lok", andere: ["🚋", "🚌", "🚃"],
      hinweise: ["Ich bin kein Tier.", "Ich fahre auf Schienen.", "Ich ziehe viele Wagen.", "Ich pfeife und mache Dampf."] },
    { id: "baum", bild: "🌳", wer: "der Baum", andere: ["🌻", "🌵", "🍄"],
      hinweise: ["Ich bin kein Tier.", "Ich wachse draussen.", "Ich habe Wurzeln.", "Ich habe einen dicken Stamm und viele Äste."] },
    { id: "glace", bild: "🍦", wer: "die Glace", andere: ["🍰", "🍫", "🍭"],
      hinweise: ["Man kann mich essen.", "Ich bin süss.", "Ich bin sehr kalt.", "Im Sommer schmelze ich schnell."] },
  ];

  // ---------------------------------------------------------------------------
  // Die Wortbaustelle (Etappe 4)
  // ---------------------------------------------------------------------------
  // Zusammengesetzte Wörter aus zwei Teilen, ohne Fugen-s oder -n: Der erste
  // Teil steht genau so vorne im langen Wort (Schnee|mann). falsch sind
  // zweite Teile, die mit dem ersten kein Wort ergeben – nie eines wie
  // «Sanduhr» oder «Seekuh», das es doch gibt.
  //   bilder    zu den beiden Teilen, bild zum ganzen Wort (wo es eines gibt)
  const BAUSTELLE = [
    { wort: "Schneemann", teile: ["Schnee", "Mann"], bilder: ["❄️", "👨"], bild: "⛄", falsch: [["Fisch", "🐟"], ["Uhr", "🕐"]] },
    { wort: "Regenschirm", teile: ["Regen", "Schirm"], bilder: ["🌧️", "☂️"], bild: "☂️", falsch: [["Löffel", "🥄"], ["Katze", "🐱"]] },
    { wort: "Apfelbaum", teile: ["Apfel", "Baum"], bilder: ["🍎", "🌳"], bild: null, falsch: [["Uhr", "🕐"], ["Nase", "👃"]] },
    { wort: "Handschuh", teile: ["Hand", "Schuh"], bilder: ["✋", "👞"], bild: "🧤", falsch: [["Stern", "⭐"], ["Kuh", "🐄"]] },
    { wort: "Fussball", teile: ["Fuss", "Ball"], bilder: ["🦶", "⚽"], bild: "⚽", falsch: [["Fisch", "🐟"], ["Kerze", "🕯️"]] },
    { wort: "Haustür", teile: ["Haus", "Tür"], bilder: ["🏠", "🚪"], bild: null, falsch: [["Nase", "👃"], ["Stern", "⭐"]] },
    { wort: "Velohelm", teile: ["Velo", "Helm"], bilder: ["🚲", "⛑️"], bild: null, falsch: [["Kuh", "🐄"], ["Brot", "🍞"]] },
    { wort: "Käsebrot", teile: ["Käse", "Brot"], bilder: ["🧀", "🍞"], bild: null, falsch: [["Nase", "👃"], ["Stern", "⭐"]] },
    { wort: "Schneeball", teile: ["Schnee", "Ball"], bilder: ["❄️", "⚽"], bild: null, falsch: [["Kerze", "🕯️"], ["Nase", "👃"]] },
    { wort: "Sandburg", teile: ["Sand", "Burg"], bilder: ["🏖️", "🏰"], bild: null, falsch: [["Kuh", "🐄"], ["Nase", "👃"]] },
    { wort: "Ohrring", teile: ["Ohr", "Ring"], bilder: ["👂", "💍"], bild: null, falsch: [["Fisch", "🐟"], ["Brot", "🍞"]] },
    { wort: "Rüeblikuchen", teile: ["Rüebli", "Kuchen"], bilder: ["🥕", "🍰"], bild: null, falsch: [["Schuh", "👞"], ["Stern", "⭐"]] },
    { wort: "Skilift", teile: ["Ski", "Lift"], bilder: ["🎿", "🚡"], bild: null, falsch: [["Katze", "🐱"], ["Brot", "🍞"]] },
    { wort: "Teddybär", teile: ["Teddy", "Bär"], bilder: ["🧸", "🐻"], bild: "🧸", falsch: [["Uhr", "🕐"], ["Kerze", "🕯️"]] },
    { wort: "Baumhaus", teile: ["Baum", "Haus"], bilder: ["🌳", "🏠"], bild: null, falsch: [["Nase", "👃"], ["Kuh", "🐄"]] },
    { wort: "Vogelhaus", teile: ["Vogel", "Haus"], bilder: ["🐦", "🏠"], bild: null, falsch: [["Schuh", "👞"], ["Kerze", "🕯️"]] },
    { wort: "Postauto", teile: ["Post", "Auto"], bilder: ["📮", "🚗"], bild: "🚌", falsch: [["Nase", "👃"], ["Katze", "🐱"]] },
    { wort: "Kuhglocke", teile: ["Kuh", "Glocke"], bilder: ["🐄", "🔔"], bild: null, falsch: [["Uhr", "🕐"], ["Brot", "🍞"]] },
    { wort: "Regenwurm", teile: ["Regen", "Wurm"], bilder: ["🌧️", "🐛"], bild: "🐛", falsch: [["Uhr", "🕐"], ["Kerze", "🕯️"]] },
    { wort: "Bücherwurm", teile: ["Bücher", "Wurm"], bilder: ["📚", "🐛"], bild: null, falsch: [["Kuh", "🐄"], ["Nase", "👃"]] },
    { wort: "Seestern", teile: ["See", "Stern"], bilder: ["🏞️", "⭐"], bild: null, falsch: [["Brot", "🍞"], ["Nase", "👃"]] },
    { wort: "Goldfisch", teile: ["Gold", "Fisch"], bilder: [null, "🐟"], bild: null, falsch: [["Kerze", "🕯️"], ["Kuh", "🐄"]] },
  ];

  window.LernappLeseInhalte = {
    steine, steineDerSilben, lautId,
    LAUTE, LAUT_BY_ID, LAUTE_JE_STUFE, GRUPPE_JE_LESESTUFE, lauteBisGruppe, fehlendeLaute, lesbare, hausLaute,
    SILBEN_WOERTER, SILBEN_JE_STUFE,
    KUPPEL_WOERTER, KUPPELN_JE_STUFE,
    TIERE, DINGE, ZAHLWOERTER, TUN, TUN_BY_ID, satzTeile, satzZurLage,
    REIME, HOER_ANLAUT, HOER_ANLAUT_WORT, AEHNLICHE_ANLAUTE, MEHRDEUTIG, anlautVon, bildWoerter,
    BLITZWOERTER, BLITZ_JE_STUFE,
    GLEISE, SINN_SAETZE, STOLPERSTEINE,
    RAETSEL, BAUSTELLE,
  };
})();
